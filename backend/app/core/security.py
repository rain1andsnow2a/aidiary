"""
安全相关功能
包括JWT令牌生成/验证、密码哈希等
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# 密码哈希上下文
# 说明：
# - 新密码默认使用 Argon2id。Argon2id 同时消耗 CPU 和内存，更适合抵抗 GPU/ASIC 暴力破解。
# - 保留 pbkdf2_sha256 / bcrypt_sha256 / bcrypt 以兼容历史用户。
# - verify_and_update_password() 会在用户下次密码登录成功时，把旧哈希自动升级为 Argon2id。
pwd_context = CryptContext(
    schemes=["argon2", "pbkdf2_sha256", "bcrypt_sha256", "bcrypt"],
    deprecated="auto",
    argon2__type="ID",
    argon2__time_cost=3,
    argon2__memory_cost=65536,
    argon2__parallelism=4,
)

# Token 过期时间
# access token 使用配置项，避免过短导致用户在长耗时分析中途掉线
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7     # 长期 refresh token：7 天


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码

    Args:
        plain_password: 明文密码
        hashed_password: 哈希密码

    Returns:
        bool: 密码是否匹配
    """
    return pwd_context.verify(plain_password, hashed_password)


def verify_and_update_password(plain_password: str, hashed_password: str) -> tuple[bool, Optional[str]]:
    """
    验证密码，并在旧哈希方案需要升级时返回新的 Argon2id 哈希。

    Args:
        plain_password: 明文密码
        hashed_password: 数据库中保存的密码哈希

    Returns:
        tuple[bool, Optional[str]]: (密码是否匹配, 新哈希；无需升级时为 None)
    """
    return pwd_context.verify_and_update(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    生成密码哈希

    Args:
        password: 明文密码

    Returns:
        str: 哈希后的密码
    """
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    创建短期 JWT 访问令牌（默认 30 分钟）
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    创建长期 JWT 刷新令牌（默认 7 天）
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    """
    解码JWT访问令牌

    Args:
        token: JWT令牌

    Returns:
        Optional[dict]: 解码后的数据，失败返回None
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        return payload
    except JWTError:
        return None
