"""
Migrate the current SQLite database to PostgreSQL.

Usage:
  python scripts/migrate_sqlite_to_postgres.py \
    --sqlite-path ./yinji.db \
    --postgres-url postgresql+asyncpg://yinji_app:password@127.0.0.1:5432/yinji \
    --replace
"""
from __future__ import annotations

import argparse
import asyncio
import json
import sqlite3
import sys
from datetime import date, datetime
from pathlib import Path
from typing import Any

from sqlalchemy import Date, DateTime, Integer, text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.types import JSON, TypeDecorator

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.db import Base, _ensure_rls_policies, _ensure_user_columns  # noqa: E402
from app.models import assistant, community, database, diary, integration  # noqa: F401,E402


TABLE_ORDER = [
    "users",
    "verification_codes",
    "counselor_applications",
    "counselor_bindings",
    "counselor_weekly_digest_logs",
    "diaries",
    "timeline_events",
    "ai_analyses",
    "social_post_samples",
    "growth_daily_insights",
    "community_posts",
    "post_comments",
    "post_likes",
    "post_collects",
    "post_views",
    "assistant_profiles",
    "assistant_sessions",
    "assistant_messages",
    "external_integration_tokens",
]


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Migrate Yinji SQLite data to PostgreSQL")
    parser.add_argument("--sqlite-path", default="./yinji.db", help="Path to the source SQLite database")
    parser.add_argument("--postgres-url", required=True, help="Target SQLAlchemy PostgreSQL async URL")
    parser.add_argument("--replace", action="store_true", help="Drop existing PostgreSQL tables before importing")
    return parser.parse_args()


def _is_json_column(column) -> bool:
    column_type = column.type
    if isinstance(column_type, JSON):
        return True
    if isinstance(column_type, TypeDecorator):
        impl = column_type.impl
        if isinstance(impl, JSON):
            return True
        if isinstance(impl, type) and issubclass(impl, JSON):
            return True
    return False


def _convert_value(column, value: Any) -> Any:
    if value is None:
        return None

    if _is_json_column(column):
        if isinstance(value, (dict, list)):
            return value
        if value == "":
            return None
        return json.loads(value)

    if isinstance(column.type, DateTime) and isinstance(value, str):
        normalized = value.replace("Z", "+00:00")
        return datetime.fromisoformat(normalized)

    if isinstance(column.type, Date) and isinstance(value, str):
        return date.fromisoformat(value[:10])

    return value


def _read_sqlite_rows(sqlite_path: Path, table_name: str) -> list[dict[str, Any]]:
    with sqlite3.connect(sqlite_path) as conn:
        conn.row_factory = sqlite3.Row
        exists = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
            (table_name,),
        ).fetchone()
        if not exists:
            return []
        rows = conn.execute(f'SELECT * FROM "{table_name}"').fetchall()
        return [dict(row) for row in rows]


async def _reset_sequence(conn, table_name: str) -> None:
    table = Base.metadata.tables[table_name]
    pk_columns = [column for column in table.columns if column.primary_key]
    if len(pk_columns) != 1 or not isinstance(pk_columns[0].type, Integer):
        return

    pk_name = pk_columns[0].name
    sequence_name = f"{table_name}_{pk_name}_seq"
    await conn.execute(text(f'CREATE SEQUENCE IF NOT EXISTS "{sequence_name}"'))
    await conn.execute(
        text(
            f"""
            SELECT setval(
                '{sequence_name}',
                COALESCE((SELECT MAX("{pk_name}") FROM "{table_name}"), 0) + 1,
                false
            )
            """
        )
    )
    await conn.execute(
        text(
            f"""
            ALTER TABLE "{table_name}"
            ALTER COLUMN "{pk_name}"
            SET DEFAULT nextval('{sequence_name}')
            """
        )
    )
    await conn.execute(
        text(
            f"""
            ALTER SEQUENCE "{sequence_name}"
            OWNED BY "{table_name}"."{pk_name}"
            """
        )
    )


async def migrate(sqlite_path: Path, postgres_url: str, replace: bool) -> None:
    if not sqlite_path.exists():
        raise SystemExit(f"SQLite database not found: {sqlite_path}")

    pg_engine = create_async_engine(postgres_url, future=True)
    try:
        async with pg_engine.begin() as conn:
            if replace:
                await conn.run_sync(Base.metadata.drop_all)
            await conn.run_sync(Base.metadata.create_all)
            await _ensure_user_columns(conn)

            for table_name in TABLE_ORDER:
                table = Base.metadata.tables[table_name]
                source_rows = _read_sqlite_rows(sqlite_path, table_name)
                if not source_rows:
                    print(f"[skip] {table_name}: 0 rows")
                    continue

                converted_rows: list[dict[str, Any]] = []
                columns_by_name = {column.name: column for column in table.columns}
                for source_row in source_rows:
                    converted_rows.append(
                        {
                            key: _convert_value(columns_by_name[key], value)
                            for key, value in source_row.items()
                            if key in columns_by_name
                        }
                    )

                await conn.execute(table.insert(), converted_rows)
                print(f"[ok] {table_name}: {len(converted_rows)} rows")

            for table_name in TABLE_ORDER:
                await _reset_sequence(conn, table_name)

            await _ensure_rls_policies(conn)
    finally:
        await pg_engine.dispose()


async def main() -> None:
    args = _parse_args()
    await migrate(Path(args.sqlite_path).resolve(), args.postgres_url, args.replace)
    print("[done] SQLite data migrated to PostgreSQL and RLS policies enabled")


if __name__ == "__main__":
    asyncio.run(main())
