"""
轻量级 IP 速率限制器（内存存储）
适用于单实例部署，多实例需改用 Redis。
"""
import time
from collections import defaultdict
from fastapi import Request, HTTPException, status


class RateLimiter:
    """
    基于滑动窗口的 IP 速率限制器。
    usage:
        limiter = RateLimiter(max_requests=10, window_seconds=60)

        @router.post("/login")
        async def login(request: Request):
            limiter.check(request)
            ...
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # {ip: [timestamp, ...]}
        self._hits: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup(self, ip: str, now: float) -> None:
        cutoff = now - self.window_seconds
        self._hits[ip] = [t for t in self._hits[ip] if t > cutoff]

    def check(self, request: Request) -> None:
        """如果超出速率限制则抛出 429"""
        ip = self._get_client_ip(request)
        now = time.time()
        self._cleanup(ip, now)

        if len(self._hits[ip]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"请求过于频繁，请 {self.window_seconds} 秒后再试",
            )
        self._hits[ip].append(now)


# ── 预配置实例 ──────────────────────────────────────────
# 验证码发送：每分钟最多 5 次
send_code_limiter = RateLimiter(max_requests=5, window_seconds=60)

# 登录/注册验证：每分钟最多 10 次
auth_limiter = RateLimiter(max_requests=10, window_seconds=60)
