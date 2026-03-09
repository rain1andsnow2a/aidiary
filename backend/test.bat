@echo off
REM 印记项目 - 测试运行脚本

echo ========================================
echo 印记 - 测试套件
echo ========================================
echo.

REM 检查pytest是否安装
python -c "import pytest" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pytest未安装
    echo [INFO] 正在安装pytest...
    pip install pytest pytest-asyncio -i https://pypi.tuna.tsinghua.edu.cn/simple
    if %errorlevel% neq 0 (
        echo [ERROR] 安装失败
        pause
        exit /b 1
    )
)

echo [INFO] 选择测试类型:
echo   1. 运行所有单元测试
echo   2. 运行安全测试
echo   3. 运行邮件服务测试
echo   4. 运行认证服务测试
echo   5. 真实邮箱测试（仅邮件发送）
echo   6. 真实邮箱测试（完整流程）
echo   7. 生成测试覆盖率报告
echo   0. 退出
echo.

set /p choice="请选择 (0-7): "

if "%choice%"=="1" goto unit_tests
if "%choice%"=="2" goto security_tests
if "%choice%"=="3" goto email_tests
if "%choice%"=="4" goto auth_tests
if "%choice%"=="5" goto real_email_only
if "%choice%"=="6" goto real_full
if "%choice%"=="7" goto coverage
if "%choice%"=="0" goto end
goto invalid

:unit_tests
echo.
echo [INFO] 运行所有单元测试...
echo.
pytest tests/test_security.py tests/test_email_service.py tests/test_auth_service.py -v --tb=short
goto end

:security_tests
echo.
echo [INFO] 运行安全测试...
echo.
pytest tests/test_security.py -v --tb=short
goto end

:email_tests
echo.
echo [INFO] 运行邮件服务测试...
echo.
pytest tests/test_email_service.py -v --tb=short -s
goto end

:auth_tests
echo.
echo [INFO] 运行认证服务测试...
echo.
pytest tests/test_auth_service.py -v --tb=short
goto end

:real_email_only
echo.
echo ========================================
echo 真实邮箱测试 - 仅邮件发送
echo ========================================
echo.
echo [INFO] 测试邮箱: 2337590486@qq.com
echo [INFO] 这将发送真实的测试邮件
echo.
set /p confirm="确认执行？ (y/n): "
if /i not "%confirm%"=="y" goto end

python tests/run_real_test.py --email-only
goto end

:real_full
echo.
echo ========================================
echo 真实邮箱测试 - 完整流程
echo ========================================
echo.
echo [INFO] 测试邮箱: 2337590486@qq.com
echo [INFO] 这将发送真实的验证码邮件
echo [INFO] 需要手动输入验证码
echo [INFO] 测试完成后会自动清理数据
echo.
set /p confirm="确认执行？ (y/n): "
if /i not "%confirm%"=="y" goto end

python tests/run_real_test.py
goto end

:coverage
echo.
echo [INFO] 生成测试覆盖率报告...
echo.
echo [WARNING] 需要安装pytest-cov
pip install pytest-cov -i https://pypi.tuna.tsinghua.edu.cn/simple
pytest tests/ --cov=app --cov-report=html --cov-report=term
echo.
echo [INFO] 覆盖率报告已生成: htmlcov/index.html
goto end

:invalid
echo.
echo [ERROR] 无效选项
goto end

:end
echo.
echo ========================================
echo 测试完成
echo ========================================
echo.
pause
