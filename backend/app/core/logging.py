"""
集中化日志配置（loguru）
-----------------------------
- 结构化输出，方便 grep / ELK / journalctl 后处理
- request_id 通过 contextvars 贯穿整个请求生命周期
- 拦截 stdlib logging (uvicorn, fastapi, sqlalchemy) 统一由 loguru 输出

使用方式：
    from app.core.logging import logger, set_request_id
    logger.info("message {user_id}", user_id=42)

避免使用 print()——一律通过 logger.*。
"""
from __future__ import annotations

import logging
import sys
from contextvars import ContextVar
from typing import Optional

from loguru import logger as _loguru_logger

from app.core.config import settings


# 每个请求的 ID 放 contextvars，协程安全
_request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id", default=None)


def set_request_id(request_id: Optional[str]) -> None:
    _request_id_ctx.set(request_id)


def get_request_id() -> Optional[str]:
    return _request_id_ctx.get()


def _request_id_patcher(record):
    """把 contextvar 里的 request_id 塞进 loguru 的 extra。"""
    record["extra"].setdefault("request_id", _request_id_ctx.get() or "-")


class InterceptHandler(logging.Handler):
    """把 stdlib logging 桥接到 loguru。"""

    def emit(self, record: logging.LogRecord) -> None:  # pragma: no cover - 透传
        try:
            level = _loguru_logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # 找到真正的调用帧，避免日志源都指向本文件
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        _loguru_logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def _build_format(is_debug: bool) -> str:
    if is_debug:
        return (
            "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> "
            "<level>{level: <8}</level> "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> "
            "<magenta>rid={extra[request_id]}</magenta> "
            "| <level>{message}</level>"
        )
    # 生产：单行、机器友好、无 ANSI
    return (
        "{time:YYYY-MM-DDTHH:mm:ss.SSSZZ} "
        "{level: <8} "
        "{name}:{function}:{line} "
        "rid={extra[request_id]} "
        "| {message}"
    )


def setup_logging() -> None:
    """在应用启动时调用一次。幂等。"""
    _loguru_logger.remove()
    _loguru_logger.configure(patcher=_request_id_patcher)

    is_debug = bool(settings.debug)
    _loguru_logger.add(
        sys.stderr,
        level="DEBUG" if is_debug else "INFO",
        format=_build_format(is_debug),
        colorize=is_debug,
        backtrace=is_debug,
        diagnose=is_debug,
        enqueue=False,
    )

    # 拦截所有 stdlib logger
    logging.basicConfig(handlers=[InterceptHandler()], level=logging.INFO, force=True)

    # 降噪：常见第三方库按需调级
    for name in ("uvicorn", "uvicorn.access", "uvicorn.error", "fastapi"):
        logging.getLogger(name).handlers = [InterceptHandler()]
        logging.getLogger(name).propagate = False

    # SQLAlchemy 只在 debug 时打印详细 SQL
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if is_debug else logging.WARNING
    )


# 对外导出：包一层 bind，未来若要附默认字段可以集中改
logger = _loguru_logger.bind()
