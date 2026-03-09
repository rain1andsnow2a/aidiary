@echo off
REM 印记项目 - 依赖安装脚本
REM 使用代理: http://127.0.0.1:10090

echo ========================================
echo 印记项目 - 依赖安装脚本
echo ========================================
echo.

REM 设置代理
set HTTP_PROXY=http://127.0.0.1:10090
set HTTPS_PROXY=http://127.0.0.1:10090

echo [1/3] 使用代理: %HTTP_PROXY%
echo.

REM 检查Python
echo [2/3] 检查Python环境...
python --version
if %errorlevel% neq 0 (
    echo 错误: Python未安装或不在PATH中
    pause
    exit /b 1
)
echo.

REM 升级pip
echo [3/3] 升级pip到最新版本...
python -m pip install --upgrade pip --proxy=%HTTP_PROXY% -i https://pypi.tuna.tsinghua.edu.cn/simple
echo.

REM 安装依赖
echo ========================================
echo 开始安装项目依赖...
echo ========================================
echo.

pip install -r requirements.txt --proxy=%HTTP_PROXY% -i https://pypi.tuna.tsinghua.edu.cn/simple

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 安装成功！
    echo ========================================
    echo.
    echo 下一步:
    echo 1. 检查 .env 配置文件
    echo 2. 运行 python main.py 启动应用
    echo 3. 访问 http://localhost:8000/docs
) else (
    echo.
    echo ========================================
    echo 安装失败！
    echo ========================================
    echo.
    echo 可能的原因:
    echo 1. 代理未启动（确保Clash等代理软件正在运行）
    echo 2. 代理端口不是10090
    echo 3. 网络连接问题
    echo.
    echo 解决方案:
    echo 查看 docs/代理配置指南.md
)

echo.
pause
