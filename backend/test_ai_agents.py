# -*- coding: utf-8 -*-
"""
AI Agent系统测试脚本
"""
import asyncio
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import date
from app.agents.orchestrator import agent_orchestrator


async def test_ai_analysis():
    """测试AI分析功能"""
    print("\n" + "="*60)
    print("印记 - AI Agent系统测试")
    print("="*60)
    print("\n警告：此测试需要配置DeepSeek API Key")
    print("请在.env文件中设置：DEEPSEEK_API_KEY\n")

    # 测试数据
    test_user_profile = {
        "username": "测试用户",
        "identity_tag": "通用",
        "current_state": "正常",
        "personality_type": "INFP",
        "social_style": "真实",
        "catchphrases": []
    }

    test_timeline_context = [
        {
            "date": "2026-03-04",
            "summary": "完成项目里程碑",
            "emotion": "成就感"
        },
        {
            "date": "2026-03-03",
            "summary": "和朋友爬山",
            "emotion": "开心"
        }
    ]

    test_diary_content = """
今天完成了项目的一个重要里程碑！团队协作很顺利，大家配合越来越默契了。
虽然过程中遇到了一些技术难题，但大家一起努力解决了。

感觉很有成就感，这是这个月最顺利的一次项目交付。
晚上和同事一起吃饭庆祝，大家都说我的领导能力提升了很多。

不过想想最近总是工作工作，感觉有点忽略了家庭。
希望能更好地平衡工作和生活。
    """.strip()

    print("测试数据准备完成...")
    print(f"- 用户: {test_user_profile['username']}")
    print(f"- 日记内容: {test_diary_content[:50]}...")
    print()

    confirm = input("确认开始测试？(y/n): ").strip().lower()
    if confirm != 'y':
        print("[SKIP] 测试已取消")
        return

    print("\n[INFO] 开始AI分析...")
    print("-"*60)

    try:
        # 执行分析
        state = await agent_orchestrator.analyze_diary(
            user_id=1,
            diary_id=1,
            diary_content=test_diary_content,
            diary_date=date.today(),
            user_profile=test_user_profile,
            timeline_context=test_timeline_context
        )

        # 显示结果
        print("\n" + "="*60)
        print("分析结果")
        print("="*60)

        print("\n[时间轴事件]")
        if state.get("timeline_event"):
            event = state["timeline_event"]
            print(f"  事件摘要: {event.get('event_summary', 'N/A')}")
            print(f"  情绪标签: {event.get('emotion_tag', 'N/A')}")
            print(f"  重要性: {event.get('importance_score', 'N/A')}/10")
            print(f"  事件类型: {event.get('event_type', 'N/A')}")

        print("\n[萨提亚冰山分析]")
        if state.get("emotion_layer"):
            emotion = state["emotion_layer"]
            print(f"  表层情绪: {emotion.get('surface_emotion', 'N/A')}")
            print(f"  潜在情绪: {emotion.get('underlying_emotion', 'N/A')}")

        if state.get("core_self_layer"):
            existence = state["core_self_layer"]
            print(f"  深层渴望: {existence.get('deepest_desire', 'N/A')}")

        print("\n[疗愈回复]")
        if state.get("therapeutic_response"):
            print(f"  {state['therapeutic_response'][:200]}...")

        print("\n[朋友圈文案]")
        if state.get("social_posts"):
            for post in state["social_posts"][:2]:  # 只显示前2个
                print(f"  {post['version']}. {post['style']}: {post['content'][:60]}...")

        print("\n" + "="*60)
        print("测试完成！")
        print("="*60)

        # 询问是否保存
        save = input("\n是否保存分析结果？(y/n): ").strip().lower()
        if save == 'y':
            print("[INFO] 分析结果已保存（模拟）")

    except Exception as e:
        print(f"\n[ERROR] 测试失败: {e}")
        import traceback
        traceback.print_exc()


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="印记AI Agent系统测试")
    parser.add_argument(
        "--simple",
        action="store_true",
        help="简化测试（仅测试导入）"
    )

    args = parser.parse_args()

    if args.simple:
        # 简单测试：只测试导入
        print("\n测试导入...")
        try:
            from app.agents.orchestrator import agent_orchestrator
            print("[OK] Agent系统导入成功")
            print("[OK] LangGraph依赖未使用，使用简化实现")
        except Exception as e:
            print(f"[FAIL] 导入失败: {e}")
    else:
        # 完整测试
        try:
            asyncio.run(test_ai_analysis())
        except KeyboardInterrupt:
            print("\n\n[INFO] 测试被用户中断")


if __name__ == "__main__":
    main()
