"""
邮箱认证功能测试脚本
"""
import asyncio
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from app.db import async_session_maker, init_db
from app.services.email_service import email_service
from app.services.auth_service import auth_service


async def test_email_service():
    """测试邮件服务"""
    print("\n=== 测试邮件服务 ===")

    # 生成验证码
    code = email_service.generate_code()
    print(f"[OK] 生成验证码: {code}")

    # 测试发送邮件（需要真实的邮箱地址）
    test_email = input("\n请输入测试邮箱地址（留空跳过）: ").strip()
    if test_email:
        print(f"[INFO] 正在发送测试邮件到 {test_email}...")
        success = await email_service.send_test_email(test_email)
        if success:
            print("[OK] 测试邮件发送成功！请检查邮箱")
        else:
            print("[ERROR] 测试邮件发送失败")
    else:
        print("[SKIP] 跳过邮件发送测试")


async def test_verification_code():
    """测试验证码功能"""
    print("\n=== 测试验证码功能 ===")

    async with async_session_maker() as db:
        test_email = input("\n请输入测试邮箱地址: ").strip()

        if not test_email:
            print("[SKIP] 跳过验证码测试")
            return

        # 发送注册验证码
        print(f"[INFO] 正在发送注册验证码到 {test_email}...")
        success, message = await auth_service.send_verification_code(
            db, test_email, "register"
        )

        if not success:
            print(f"[ERROR] {message}")
            return

        print(f"[OK] {message}")
        print("[INFO] 请检查邮箱获取验证码")

        # 验证验证码
        code = input("请输入收到的验证码（留空跳过验证）: ").strip()
        if code:
            success, message = await auth_service.verify_code(
                db, test_email, code, "register"
            )
            if success:
                print(f"[OK] {message}")
            else:
                print(f"[ERROR] {message}")
        else:
            print("[SKIP] 跳过验证码验证")


async def test_user_registration():
    """测试用户注册"""
    print("\n=== 测试用户注册 ===")

    async with async_session_maker() as db:
        test_email = input("\n请输入注册邮箱地址: ").strip()

        if not test_email:
            print("[SKIP] 跳过注册测试")
            return

        # 检查是否已有验证码
        has_code = input("是否已有验证码？(y/n): ").strip().lower()
        if has_code != 'y':
            print("[INFO] 请先发送验证码（运行验证码测试）")
            return

        code = input("请输入验证码: ").strip()
        password = input("请输入密码: ").strip()
        username = input("请输入用户名（可选，直接回车跳过）: ").strip() or None

        # 注册
        print("[INFO] 正在注册用户...")
        success, message, user = await auth_service.register(
            db, test_email, password, code, username
        )

        if success:
            print(f"[OK] {message}")
            print(f"[INFO] 用户ID: {user.id}")
            print(f"[INFO] 用户邮箱: {user.email}")
            print(f"[INFO] 用户名: {user.username}")

            # 生成令牌
            token = auth_service.create_token(user)
            print(f"[INFO] JWT令牌: {token[:50]}...")
        else:
            print(f"[ERROR] {message}")


async def main():
    """主测试函数"""
    print("=" * 50)
    print("印记 - 邮箱认证功能测试")
    print("=" * 50)

    # 初始化数据库
    print("[INFO] 正在初始化数据库...")
    await init_db()
    print("[OK] 数据库初始化完成")

    # 测试菜单
    while True:
        print("\n请选择测试项目：")
        print("1. 测试邮件服务")
        print("2. 测试验证码功能")
        print("3. 测试用户注册")
        print("0. 退出")

        choice = input("\n请输入选项 (0-3): ").strip()

        if choice == "1":
            await test_email_service()
        elif choice == "2":
            await test_verification_code()
        elif choice == "3":
            await test_user_registration()
        elif choice == "0":
            print("\n[INFO] 测试结束")
            break
        else:
            print("[ERROR] 无效选项")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[INFO] 测试被用户中断")
    except Exception as e:
        print(f"\n[ERROR] 测试出错: {e}")
        import traceback
        traceback.print_exc()
