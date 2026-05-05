"""
映光积分与心灯护盾规则
----------------------------
这里集中存放所有"业务规则数字"，避免散落在 API 代码里。活动期间调参
（例如周末倍率）只需改这一个文件。

设计取向（2026-05）：
- 心灯签到（is_rest=False）给基础奖励
- 写一句话取代基础奖励，而非叠加——"沉淀映光"语义
- 首次点亮某种情绪给大额奖励，对应情绪星球解锁
- 休息（is_rest=True）0 映光，仍计入 streak
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class LightPointsRules:
    """映光积分与护盾相关的可配置规则。"""

    # 奖励数值
    reward_checkin: int = 5
    reward_one_line: int = 10
    reward_planet_unlock: int = 20

    # 护盾
    shield_default_balance: int = 3
    shield_max_balance: int = 3
    shield_reward_interval: int = 7  # 每连续点亮 N 天奖励 1 个护盾

    @property
    def ledger_reasons(self) -> tuple[str, ...]:
        return ("checkin", "one_line", "planet_unlock")


# 全局规则实例（运行期只读；活动临时调整可改这里重新部署）
RULES = LightPointsRules()
