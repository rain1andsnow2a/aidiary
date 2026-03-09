"""
印记 - 测试套件
使用pytest进行单元测试和集成测试
"""
import pytest
import asyncio
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.database import Base, User, VerificationCode
from app.core.config import settings


# 测试数据库URL（使用内存SQLite）
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# 创建测试引擎
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# 创建测试会话工厂
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    创建测试数据库会话
    每个测试函数都会获得一个全新的数据库
    """
    # 创建所有表
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 创建会话
    async with TestSessionLocal() as session:
        yield session

    # 清理：删除所有表
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def test_user(db_session: AsyncSession):
    """创建测试用户"""
    from app.core.security import get_password_hash

    user = User(
        email="test@example.com",
        password_hash=get_password_hash("testpass123"),
        username="测试用户",
        is_active=True,
        is_verified=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    return user


@pytest.fixture
def user_token(test_user):
    """创建测试用户JWT令牌"""
    from app.core.security import create_access_token

    return create_access_token({"sub": str(test_user.id), "email": test_user.email})


@pytest.fixture
def auth_headers(user_token):
    """创建认证请求头"""
    return {"Authorization": f"Bearer {user_token}"}
