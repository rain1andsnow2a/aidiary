@echo off
REM 印记项目 - 快速启动脚本

echo ========================================
echo 印记
echo ========================================
echo.

echo [INFO] 正在启动后端服务...
echo.

REM 检查虚拟环境（可选）
if exist venv\Scripts\activate.bat (
    echo [INFO] 激活虚拟环境...
    call venv\Scripts\activate.bat
)

REM 检查依赖
echo [INFO] 检查依赖...
python -c "import fastapi; import sqlalchemy; import aiosmtplib" 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] 检测到缺少依赖
    echo [INFO] 请先运行 install.bat 安装依赖
    echo.
    pause
    exit /b 1
)

REM 启动应用
echo [INFO] 启动FastAPI应用...
echo.
echo ========================================
echo 服务信息:
echo   - 地址: http://localhost:8000
echo   - API文档: http://localhost:8000/docs
echo   - ReDoc: http://localhost:8000/redoc
echo ========================================
echo.
echo [INFO] 按 Ctrl+C 停止服务
echo.

python main.py

pause
