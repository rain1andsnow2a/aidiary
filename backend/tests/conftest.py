"""
pytest配置文件
"""
import pytest
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# pytest配置
pytest_plugins = []


def pytest_configure(config):
    """pytest配置钩子"""
    config.addinivalue_line(
        "markers",
        "asyncio: mark test as an asyncio test"
    )
    config.addinivalue_line(
        "markers",
        "integration: mark test as integration test"
    )
    config.addinivalue_line(
        "markers",
        "unit: mark test as unit test"
    )
