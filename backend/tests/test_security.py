"""
单元测试 - 安全功能
测试密码哈希、JWT令牌等
"""
import pytest
from datetime import datetime, timedelta
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token
)


class TestPasswordHashing:
    """测试密码哈希功能"""

    def test_password_hashing(self):
        """测试密码哈希生成"""
        password = "testpass123"
        hashed = get_password_hash(password)

        # 哈希不应该等于原始密码
        assert hashed != password
        # bcrypt哈希应该以$2b$开头
        assert hashed.startswith("$2b$")
        # 哈希长度应该固定（60字符）
        assert len(hashed) == 60

    def test_password_verification(self):
        """测试密码验证"""
        password = "testpass123"
        hashed = get_password_hash(password)

        # 正确密码应该验证通过
        assert verify_password(password, hashed) is True

    def test_wrong_password_fails(self):
        """测试错误密码验证失败"""
        password = "testpass123"
        wrong_password = "wrongpass"
        hashed = get_password_hash(password)

        # 错误密码应该验证失败
        assert verify_password(wrong_password, hashed) is False


class TestJWTToken:
    """测试JWT令牌功能"""

    def test_token_creation(self):
        """测试令牌创建"""
        data = {"sub": "123", "email": "test@example.com"}
        token = create_access_token(data)

        # 令牌应该是字符串
        assert isinstance(token, str)
        # 令牌应该有3部分（header.payload.signature）
        assert len(token.split(".")) == 3

    def test_token_decode_valid(self):
        """测试有效令牌解码"""
        data = {"sub": "123", "email": "test@example.com"}
        token = create_access_token(data)

        decoded = decode_access_token(token)

        # 解码应该成功
        assert decoded is not None
        # 应该包含原始数据
        assert decoded["sub"] == "123"
        assert decoded["email"] == "test@example.com"
        # 应该包含过期时间
        assert "exp" in decoded

    def test_token_decode_invalid(self):
        """测试无效令牌解码失败"""
        invalid_token = "invalid.token.string"

        decoded = decode_access_token(invalid_token)

        # 解码应该失败
        assert decoded is None

    def test_token_expiration(self):
        """测试令牌过期时间"""
        from app.core.config import settings

        data = {"sub": "123"}
        token = create_access_token(data)
        decoded = decode_access_token(token)

        # 验证令牌包含过期时间
        assert "exp" in decoded

        # 过期时间应该在未来
        exp_timestamp = decoded["exp"]
        import time
        current_timestamp = time.time()
        assert exp_timestamp > current_timestamp

        # 计算过期时间差（应该大约是配置的分钟数）
        time_diff_seconds = exp_timestamp - current_timestamp
        expected_seconds = settings.access_token_expire_minutes * 60

        # 允许5秒误差
        assert abs(time_diff_seconds - expected_seconds) < 5


class TestValidation:
    """测试数据验证"""

    def test_email_validation_valid(self):
        """测试有效邮箱验证"""
        from app.schemas.auth import SendCodeRequest
        from pydantic import ValidationError

        # 有效邮箱
        data = {
            "email": "test@example.com",
            "type": "register"
        }
        request = SendCodeRequest(**data)

        assert request.email == "test@example.com"

    def test_email_validation_invalid(self):
        """测试无效邮箱验证失败"""
        from app.schemas.auth import SendCodeRequest
        from pydantic import ValidationError

        # 无效邮箱
        with pytest.raises(ValidationError):
            SendCodeRequest(
                email="not-an-email",
                type="register"
            )

    def test_code_validation_length(self):
        """测试验证码长度验证"""
        from app.schemas.auth import VerifyCodeRequest
        from pydantic import ValidationError

        # 验证码太短
        with pytest.raises(ValidationError):
            VerifyCodeRequest(
                email="test@example.com",
                code="123",  # 只有3位
                type="register"
            )

    def test_password_validation_length(self):
        """测试密码长度验证"""
        from app.schemas.auth import RegisterRequest
        from pydantic import ValidationError

        # 密码太短
        with pytest.raises(ValidationError):
            RegisterRequest(
                email="test@example.com",
                code="123456",
                password="12345"  # 只有5位
            )
