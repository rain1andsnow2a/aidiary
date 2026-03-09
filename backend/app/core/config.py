"""
应用配置管理
使用 pydantic-settings 管理环境变量
"""
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""

    # ==================== 应用配置 ====================
    app_name: str = Field(default="印记", description="应用名称")
    app_version: str = Field(default="0.1.0", description="应用版本")
    debug: bool = Field(default=False, description="调试模式")
    allowed_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        description="允许的CORS源（逗号分隔）"
    )

    # ==================== 数据库配置 ====================
    database_url: str = Field(
        default="sqlite+aiosqlite:///./yinji.db",
        description="数据库连接URL"
    )

    # ==================== JWT认证配置 ====================
    secret_key: str = Field(
        ...,
        description="JWT密钥（必须设置）"
    )
    algorithm: str = Field(default="HS256", description="JWT算法")
    access_token_expire_minutes: int = Field(
        default=10080,
        description="访问令牌过期时间（分钟）默认7天"
    )

    # ==================== QQ邮箱配置 ====================
    qq_email: str = Field(
        ...,
        description="QQ邮箱地址"
    )
    qq_email_auth_code: str = Field(
        ...,
        description="QQ邮箱授权码"
    )
    smtp_host: str = Field(default="smtp.qq.com", description="SMTP服务器地址")
    smtp_port: int = Field(default=465, description="SMTP端口")
    smtp_secure: bool = Field(default=True, description="是否使用SSL")

    # ==================== 验证码配置 ====================
    verification_code_expire_minutes: int = Field(
        default=5,
        description="验证码过期时间（分钟）"
    )
    max_code_requests_per_5min: int = Field(
        default=3,
        description="5分钟内最大请求次数"
    )

    # ==================== DeepSeek API配置 ====================
    deepseek_api_key: str = Field(
        default="",
        description="DeepSeek API密钥"
    )
    deepseek_base_url: str = Field(
        default="https://api.deepseek.com/v1",
        description="DeepSeek API地址"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        """解析CORS允许的源列表"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# 全局配置实例
settings = Settings()
