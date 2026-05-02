"""
数据库连接配置
支持SQLite和PostgreSQL
"""
from typing import AsyncGenerator
from sqlalchemy import BigInteger, Integer, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

# 创建异步引擎
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # 调试模式打印SQL
    future=True
)

# 创建异步会话工厂
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


RLS_OWNER_TABLES = [
    "diaries",
    "timeline_events",
    "ai_analyses",
    "social_post_samples",
    "growth_daily_insights",
    "care_statuses",
    "heart_light_checkins",
    "light_point_ledger",
    "assistant_profiles",
    "assistant_sessions",
    "assistant_messages",
    "external_integration_tokens",
    "counselor_applications",
    "counselor_bindings",
    "counselor_weekly_digest_logs",
]

RLS_COMMUNITY_PRIVATE_TABLES = [
    "post_likes",
    "post_collects",
    "post_views",
]


class Base(DeclarativeBase):
    """所有模型的基类"""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    获取数据库会话（依赖注入）

    Yields:
        AsyncSession: 数据库会话
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await reset_rls_context(session)
            await session.close()


def _is_postgresql_session(session: AsyncSession) -> bool:
    return session.get_bind().dialect.name == "postgresql"


async def set_rls_context(session: AsyncSession, user_id: int, role: str) -> None:
    """把当前请求用户写入 PostgreSQL 会话，供 RLS policy 读取。"""
    if not _is_postgresql_session(session):
        return
    await session.execute(
        text("SELECT set_config('app.current_user_id', :user_id, false)"),
        {"user_id": str(user_id)},
    )
    await session.execute(
        text("SELECT set_config('app.current_user_role', :role, false)"),
        {"role": role},
    )


async def set_rls_service_context(session: AsyncSession) -> None:
    """后台任务/受控聚合查询使用的服务上下文。"""
    if not _is_postgresql_session(session):
        return
    await session.execute(text("SELECT set_config('app.current_user_id', '', false)"))
    await session.execute(text("SELECT set_config('app.current_user_role', 'service', false)"))


async def reset_rls_context(session: AsyncSession) -> None:
    """归还连接前清理会话变量，避免连接池复用时串上下文。"""
    if not _is_postgresql_session(session):
        return
    try:
        await session.execute(text("SELECT set_config('app.current_user_id', '', false)"))
        await session.execute(text("SELECT set_config('app.current_user_role', '', false)"))
    except Exception:
        # 会话正在异常回滚/关闭时不阻塞请求收尾。
        pass


async def init_db():
    """
    初始化数据库
    创建所有表
    """
    async with engine.begin() as conn:
        # 导入所有模型以确保它们被注册到 Base.metadata
        from app.models.database import (
            User,
            VerificationCode,
            CounselorApplication,
            CounselorBinding,
            CounselorWeeklyDigestLog,
        )
        from app.models.diary import Diary, TimelineEvent, AIAnalysis, SocialPostSample, GrowthDailyInsight, CareStatus, HeartLightCheckin, LightPointLedger
        from app.models.community import CommunityPost, PostComment, PostLike, PostCollect, PostView
        from app.models.assistant import AssistantProfile, AssistantSession, AssistantMessage
        from app.models.integration import ExternalIntegrationToken

        # 创建所有表
        await conn.run_sync(Base.metadata.create_all)
        await _ensure_user_columns(conn)
        await _ensure_care_status_columns(conn)

        # SQLite -> PostgreSQL 迁移后，部分表可能只有主键约束却没有默认序列。
        # 启动时做一次轻量自检，确保整数主键具备 nextval 默认值。
        if conn.dialect.name == "postgresql":
            for table in Base.metadata.sorted_tables:
                pk_columns = [column for column in table.columns if column.primary_key]
                if len(pk_columns) != 1:
                    continue

                pk_column = pk_columns[0]
                if not isinstance(pk_column.type, (Integer, BigInteger)):
                    continue

                default_query = text(
                    """
                    SELECT column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = :table_name
                      AND column_name = :column_name
                    """
                )
                default_value = await conn.scalar(
                    default_query,
                    {
                        "table_name": table.name,
                        "column_name": pk_column.name,
                    },
                )
                if default_value:
                    continue

                sequence_name = f"{table.name}_{pk_column.name}_seq"
                qualified_table = f'"{table.name}"'
                qualified_column = f'"{pk_column.name}"'
                qualified_sequence = f'"{sequence_name}"'

                await conn.execute(text(f"CREATE SEQUENCE IF NOT EXISTS {qualified_sequence}"))
                await conn.execute(
                    text(
                        f"""
                        SELECT setval(
                            '{sequence_name}',
                            COALESCE((SELECT MAX({qualified_column}) FROM {qualified_table}), 0) + 1,
                            false
                        )
                        """
                    )
                )
                await conn.execute(
                    text(
                        f"""
                        ALTER TABLE {qualified_table}
                        ALTER COLUMN {qualified_column}
                        SET DEFAULT nextval('{sequence_name}')
                        """
                    )
                )
                await conn.execute(
                    text(
                        f"""
                        ALTER SEQUENCE {qualified_sequence}
                        OWNED BY {qualified_table}.{qualified_column}
                        """
                    )
                )

        if conn.dialect.name == "postgresql":
            await _ensure_rls_policies(conn)


async def _ensure_user_columns(conn):
    """为既有数据库补齐历史缺失的用户字段，兼容旧库直接升级。"""
    dialect = conn.dialect.name
    if dialect == "sqlite":
        existing_columns = {
            row[1] for row in (await conn.execute(text("PRAGMA table_info('users')"))).all()
        }
    else:
        existing_columns = {
            row[0]
            for row in (
                await conn.execute(
                    text(
                        """
                        SELECT column_name
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'users'
                        """
                    )
                )
            ).all()
        }

    column_definitions = {
        "avatar_url": {
            "sqlite": "VARCHAR(500)",
            "postgresql": "VARCHAR(500)",
        },
        "mbti": {
            "sqlite": "VARCHAR(10)",
            "postgresql": "VARCHAR(10)",
        },
        "social_style": {
            "sqlite": "VARCHAR(20)",
            "postgresql": "VARCHAR(20)",
        },
        "current_state": {
            "sqlite": "VARCHAR(20)",
            "postgresql": "VARCHAR(20)",
        },
        "catchphrases": {
            "sqlite": "JSON",
            "postgresql": "JSON",
        },
        "department": {
            "sqlite": "VARCHAR(100)",
            "postgresql": "VARCHAR(100)",
        },
        "class_name": {
            "sqlite": "VARCHAR(100)",
            "postgresql": "VARCHAR(100)",
        },
        "role": {
            "sqlite": "VARCHAR(20) NOT NULL DEFAULT 'student'",
            "postgresql": "VARCHAR(20) NOT NULL DEFAULT 'student'",
        },
        "counselor_info": {
            "sqlite": "JSON",
            "postgresql": "JSON",
        },
        "is_active": {
            "sqlite": "BOOLEAN NOT NULL DEFAULT 1",
            "postgresql": "BOOLEAN NOT NULL DEFAULT TRUE",
        },
        "is_verified": {
            "sqlite": "BOOLEAN NOT NULL DEFAULT 0",
            "postgresql": "BOOLEAN NOT NULL DEFAULT FALSE",
        },
    }

    missing_columns = [
        column_name
        for column_name in column_definitions
        if column_name not in existing_columns
    ]

    if not missing_columns:
        return

    for column_name in missing_columns:
        definition = column_definitions[column_name][
            "postgresql" if dialect == "postgresql" else "sqlite"
        ]
        await conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {definition}"))


async def _ensure_care_status_columns(conn) -> None:
    """为老库的 care_statuses 表补 total_light_points 字段。"""
    dialect = conn.dialect.name
    # 表不存在时直接返回（此刻 create_all 已跑过，但防御一下）
    if dialect == "sqlite":
        table_exists = (
            await conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table' AND name='care_statuses'")
            )
        ).first()
        if not table_exists:
            return
        existing_columns = {
            row[1] for row in (await conn.execute(text("PRAGMA table_info('care_statuses')"))).all()
        }
    else:
        existing_columns = {
            row[0]
            for row in (
                await conn.execute(
                    text(
                        """
                        SELECT column_name
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = 'care_statuses'
                        """
                    )
                )
            ).all()
        }
        if not existing_columns:
            return

    if "total_light_points" in existing_columns:
        return

    if dialect == "sqlite":
        await conn.execute(
            text("ALTER TABLE care_statuses ADD COLUMN total_light_points INTEGER NOT NULL DEFAULT 0")
        )
    else:
        await conn.execute(
            text(
                "ALTER TABLE care_statuses ADD COLUMN total_light_points INTEGER NOT NULL DEFAULT 0"
            )
        )


async def _ensure_rls_policies(conn) -> None:
    """为 PostgreSQL 启用行级安全策略。

    应用层仍然保留资源归属校验；RLS 作为数据库层兜底，防止查询漏写 user_id。
    """
    statements: list[str] = [
        """
        CREATE OR REPLACE FUNCTION app_current_user_id()
        RETURNS integer
        LANGUAGE sql
        STABLE
        AS $$
            SELECT NULLIF(current_setting('app.current_user_id', true), '')::integer
        $$;
        """,
        """
        CREATE OR REPLACE FUNCTION app_current_user_role()
        RETURNS text
        LANGUAGE sql
        STABLE
        AS $$
            SELECT COALESCE(NULLIF(current_setting('app.current_user_role', true), ''), 'anonymous')
        $$;
        """,
    ]

    for table_name in RLS_OWNER_TABLES:
        statements.extend(
            [
                f'ALTER TABLE "{table_name}" ENABLE ROW LEVEL SECURITY;',
                f'ALTER TABLE "{table_name}" FORCE ROW LEVEL SECURITY;',
                f'DROP POLICY IF EXISTS "{table_name}_owner_select" ON "{table_name}";',
                f'DROP POLICY IF EXISTS "{table_name}_owner_insert" ON "{table_name}";',
                f'DROP POLICY IF EXISTS "{table_name}_owner_update" ON "{table_name}";',
                f'DROP POLICY IF EXISTS "{table_name}_owner_delete" ON "{table_name}";',
                f"""
                CREATE POLICY "{table_name}_owner_select" ON "{table_name}"
                FOR SELECT
                USING (
                    user_id = app_current_user_id()
                    OR app_current_user_role() IN ('admin', 'service')
                );
                """,
                f"""
                CREATE POLICY "{table_name}_owner_insert" ON "{table_name}"
                FOR INSERT
                WITH CHECK (
                    user_id = app_current_user_id()
                    OR app_current_user_role() IN ('admin', 'service')
                );
                """,
                f"""
                CREATE POLICY "{table_name}_owner_update" ON "{table_name}"
                FOR UPDATE
                USING (
                    user_id = app_current_user_id()
                    OR app_current_user_role() IN ('admin', 'service')
                )
                WITH CHECK (
                    user_id = app_current_user_id()
                    OR app_current_user_role() IN ('admin', 'service')
                );
                """,
                f"""
                CREATE POLICY "{table_name}_owner_delete" ON "{table_name}"
                FOR DELETE
                USING (
                    user_id = app_current_user_id()
                    OR app_current_user_role() IN ('admin', 'service')
                );
                """,
            ]
        )

    statements.extend(
        [
            'ALTER TABLE "community_posts" ENABLE ROW LEVEL SECURITY;',
            'ALTER TABLE "community_posts" FORCE ROW LEVEL SECURITY;',
            'DROP POLICY IF EXISTS "community_posts_visible_select" ON "community_posts";',
            'DROP POLICY IF EXISTS "community_posts_owner_insert" ON "community_posts";',
            'DROP POLICY IF EXISTS "community_posts_owner_update" ON "community_posts";',
            'DROP POLICY IF EXISTS "community_posts_owner_delete" ON "community_posts";',
            """
            CREATE POLICY "community_posts_visible_select" ON "community_posts"
            FOR SELECT
            USING (
                (is_deleted = false AND is_hidden = false)
                OR user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
            """
            CREATE POLICY "community_posts_owner_insert" ON "community_posts"
            FOR INSERT
            WITH CHECK (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
            """
            CREATE POLICY "community_posts_owner_update" ON "community_posts"
            FOR UPDATE
            USING (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            )
            WITH CHECK (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
            """
            CREATE POLICY "community_posts_owner_delete" ON "community_posts"
            FOR DELETE
            USING (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
            'ALTER TABLE "post_comments" ENABLE ROW LEVEL SECURITY;',
            'ALTER TABLE "post_comments" FORCE ROW LEVEL SECURITY;',
            'DROP POLICY IF EXISTS "post_comments_visible_select" ON "post_comments";',
            'DROP POLICY IF EXISTS "post_comments_owner_insert" ON "post_comments";',
            'DROP POLICY IF EXISTS "post_comments_owner_update" ON "post_comments";',
            'DROP POLICY IF EXISTS "post_comments_owner_delete" ON "post_comments";',
            """
            CREATE POLICY "post_comments_visible_select" ON "post_comments"
            FOR SELECT
            USING (
                is_deleted = false
                OR user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
            """
            CREATE POLICY "post_comments_owner_insert" ON "post_comments"
            FOR INSERT
            WITH CHECK (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
            """
            CREATE POLICY "post_comments_owner_update" ON "post_comments"
            FOR UPDATE
            USING (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            )
            WITH CHECK (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
            """
            CREATE POLICY "post_comments_owner_delete" ON "post_comments"
            FOR DELETE
            USING (
                user_id = app_current_user_id()
                OR app_current_user_role() IN ('admin', 'service')
            );
            """,
        ]
    )

    for table_name in RLS_COMMUNITY_PRIVATE_TABLES:
        statements.extend(
            [
                f'ALTER TABLE "{table_name}" ENABLE ROW LEVEL SECURITY;',
                f'ALTER TABLE "{table_name}" FORCE ROW LEVEL SECURITY;',
                f'DROP POLICY IF EXISTS "{table_name}_owner_all" ON "{table_name}";',
                f"""
                CREATE POLICY "{table_name}_owner_all" ON "{table_name}"
                FOR ALL
                USING (
                    user_id = app_current_user_id()
                    OR app_current_user_role() IN ('admin', 'service')
                )
                WITH CHECK (
                    user_id = app_current_user_id()
                    OR app_current_user_role() IN ('admin', 'service')
                );
                """,
            ]
        )

    for statement in statements:
        await conn.execute(text(statement))
