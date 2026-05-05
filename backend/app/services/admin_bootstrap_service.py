"""
管理员初始化服务
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash
from app.core.logging import logger
from app.models.database import User, UserRole


async def ensure_bootstrap_admin(db: AsyncSession) -> None:
    """
    若配置了管理员邮箱，则在启动时自动创建或提升为管理员。
    """
    email = settings.bootstrap_admin_email.strip()
    password = settings.bootstrap_admin_password.strip()
    username = settings.bootstrap_admin_username.strip() or "管理员"

    if not email:
        return

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        if not password:
            logger.warning("bootstrap admin skipped (missing bootstrap_admin_password)")
            return
        user = User(
            email=email,
            password_hash=get_password_hash(password),
            username=username,
            role=UserRole.admin.value,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.commit()
        logger.info("bootstrap admin created email={email}", email=email)
        return

    changed = False
    if user.role != UserRole.admin.value:
        user.role = UserRole.admin.value
        changed = True
    if not user.is_active:
        user.is_active = True
        changed = True
    if not user.is_verified:
        user.is_verified = True
        changed = True
    if changed:
        await db.commit()
        logger.info("bootstrap admin promoted email={email}", email=email)
