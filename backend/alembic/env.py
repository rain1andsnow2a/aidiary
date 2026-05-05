"""
Alembic 环境配置
-----------------
约定：
- `sqlalchemy.url` 不写在 alembic.ini，运行时从 `settings.database_url` 读
  （兼容 sqlite+aiosqlite 与 postgresql+asyncpg）
- `target_metadata` 绑定到 `app.db.Base.metadata`，支持 `--autogenerate`
- 所有模型必须在这里被 import，确保 metadata 里有它们
- SQLite 部署打开 `render_as_batch=True`，ALTER 用 batch op 绕过限制
"""
import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context


# 让 env.py 能 import 到 app.*
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


from app.core.config import settings  # noqa: E402
from app.db import Base  # noqa: E402

# 确保所有模型被加载到 Base.metadata（否则 --autogenerate 看不见）
from app.models import database as _m_database  # noqa: F401,E402
from app.models import diary as _m_diary  # noqa: F401,E402
from app.models import community as _m_community  # noqa: F401,E402
from app.models import assistant as _m_assistant  # noqa: F401,E402
from app.models import integration as _m_integration  # noqa: F401,E402


config = context.config

# 运行期注入数据库 URL，避免把凭证写进 alembic.ini
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")


def run_migrations_offline() -> None:
    """离线模式：只输出 SQL，不连数据库。"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=_is_sqlite(url or ""),
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    url = str(connection.engine.url)
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        render_as_batch=_is_sqlite(url),
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
