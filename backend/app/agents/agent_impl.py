"""
AI Agent 系统 - Agent实现
"""
import json
import time
from typing import Dict, List, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.state import AnalysisState
from app.agents.prompts import (
    CONTEXT_COLLECTOR_PROMPT,
    TIMELINE_EXTRACTOR_PROMPT,
    SATIR_EMOTION_PROMPT,
    SATIR_BELIEF_PROMPT,
    SATIR_EXISTENCE_PROMPT,
    SATIR_RESPONDER_PROMPT,
    SOCIAL_POST_CREATOR_PROMPT,
    SYSTEM_PROMPT_ANALYST
)
from app.agents.llm import get_llm, get_analytical_llm, get_creative_llm


class ContextCollectorAgent:
    """Agent 0: 上下文收集器"""

    def __init__(self):
        self.llm = get_llm(temperature=0.3)

    async def collect(self, state: AnalysisState, user_profile: Dict, timeline_context: List[Dict]):
        """收集上下文信息"""
        print("[Agent 0] 收集上下文...")

        try:
            # 构建prompt
            prompt = CONTEXT_COLLECTOR_PROMPT.format(
                user_profile=json.dumps(user_profile, ensure_ascii=False, indent=2),
                timeline_context=json.dumps(timeline_context, ensure_ascii=False, indent=2),
                diary_content=state["diary_content"]
            )

            # 调用LLM
            messages = [
                SystemMessage(content="你是一个智能助手，负责分析用户上下文。"),
                HumanMessage(content=prompt)
            ]

            response = await self.llm.ainvoke(messages)
            result = json.loads(response.content)

            # 更新状态
            state["user_profile"] = user_profile
            state["timeline_context"] = timeline_context

            print(f"[Agent 0] 上下文收集完成: {result.get('current_mood', 'N/A')}")
            return state

        except Exception as e:
            print(f"[Agent 0] 错误: {e}")
            state["user_profile"] = user_profile
            state["timeline_context"] = timeline_context
            return state


class TimelineManagerAgent:
    """Agent A: 时间线管家"""

    def __init__(self):
        self.llm = get_llm(temperature=0.5)

    async def extract_event(self, state: AnalysisState):
        """提取时间轴事件"""
        print("[Agent A] 提取时间轴事件...")

        try:
            prompt = TIMELINE_EXTRACTOR_PROMPT.format(
                diary_content=state["diary_content"]
            )

            messages = [
                SystemMessage(content="你是一个专业的事件提取助手。"),
                HumanMessage(content=prompt)
            ]

            response = await self.llm.ainvoke(messages)
            result = json.loads(response.content)

            # 构建时间轴事件
            event = {
                "event_summary": result.get("event_summary", "未命名事件"),
                "emotion_tag": result.get("emotion_tag", "未分类"),
                "importance_score": result.get("importance_score", 5),
                "event_type": result.get("event_type", "other"),
                "related_entities": result.get("entities", {})
            }

            state["timeline_event"] = event

            print(f"[Agent A] 事件提取完成: {event['event_summary']}")
            return state

        except Exception as e:
            print(f"[Agent A] 错误: {e}")
            # 降级：创建默认事件
            state["timeline_event"] = {
                "event_summary": "日记记录",
                "emotion_tag": "记录",
                "importance_score": 5,
                "event_type": "other",
                "related_entities": {}
            }
            return state


class SatirTherapistAgent:
    """Agent B: 萨提亚分析师"""

    def __init__(self):
        self.llm_emotion = get_analytical_llm()
        self.llm_belief = get_analytical_llm()
        self.llm_existence = get_llm(temperature=0.6)
        self.llm_responder = get_llm(temperature=0.8)

    async def analyze_emotion_layer(self, state: AnalysisState):
        """分析情绪层（第2层）"""
        print("[Agent B1] 分析情绪层...")

        try:
            prompt = SATIR_EMOTION_PROMPT.format(
                diary_content=state["diary_content"],
                user_profile=json.dumps(state.get("user_profile", {}), ensure_ascii=False)
            )

            messages = [
                SystemMessage(content="你是萨提亚冰山模型专家。"),
                HumanMessage(content=prompt)
            ]

            response = await self.llm_emotion.ainvoke(messages)
            result = json.loads(response.content)

            state["emotion_layer"] = result
            print(f"[Agent B1] 情绪层分析: {result.get('surface_emotion', 'N/A')} -> {result.get('underlying_emotion', 'N/A')}")

        except Exception as e:
            print(f"[Agent B1] 错误: {e}")
            state["emotion_layer"] = {
                "surface_emotion": "未识别",
                "underlying_emotion": "未识别",
                "emotion_intensity": 5,
                "emotion_analysis": "分析失败"
            }

        return state

    async def analyze_belief_layer(self, state: AnalysisState):
        """分析信念层（第3-4层）"""
        print("[Agent B2] 分析信念层...")

        try:
            prompt = SATIR_BELIEF_PROMPT.format(
                diary_content=state["diary_content"],
                emotion_analysis=json.dumps(state.get("emotion_layer", {}), ensure_ascii=False)
            )

            messages = [
                SystemMessage(content="你是萨提亚冰山模型专家。"),
                HumanMessage(content=prompt)
            ]

            response = await self.llm_belief.ainvoke(messages)
            result = json.loads(response.content)

            state["cognitive_layer"] = {
                "irrational_beliefs": result.get("irrational_beliefs", []),
                "automatic_thoughts": result.get("automatic_thoughts", [])
            }
            state["belief_layer"] = {
                "core_beliefs": result.get("core_beliefs", []),
                "life_rules": result.get("life_rules", []),
                "belief_analysis": result.get("belief_analysis", "")
            }

            print(f"[Agent B2] 信念层分析完成")

        except Exception as e:
            print(f"[Agent B2] 错误: {e}")
            state["cognitive_layer"] = {"irrational_beliefs": [], "automatic_thoughts": []}
            state["belief_layer"] = {"core_beliefs": [], "life_rules": [], "belief_analysis": ""}

        return state

    async def analyze_existence_layer(self, state: AnalysisState):
        """分析存在层（第5层）"""
        print("[Agent B3] 分析存在层...")

        try:
            # 构建完整的分析摘要
            all_analysis = {
                "emotion_layer": state.get("emotion_layer", {}),
                "cognitive_layer": state.get("cognitive_layer", {}),
                "belief_layer": state.get("belief_layer", {})
            }

            prompt = SATIR_EXISTENCE_PROMPT.format(
                diary_content=state["diary_content"],
                all_analysis=json.dumps(all_analysis, ensure_ascii=False, indent=2)
            )

            messages = [
                SystemMessage(content="你是萨提亚冰山模型专家。"),
                HumanMessage(content=prompt)
            ]

            response = await self.llm_existence.ainvoke(messages)
            result = json.loads(response.content)

            state["core_self_layer"] = result
            print(f"[Agent B3] 存在层分析: {result.get('deepest_desire', 'N/A')}")

        except Exception as e:
            print(f"[Agent B3] 错误: {e}")
            state["core_self_layer"] = {
                "yearnings": [],
                "life_energy": "未知",
                "deepest_desire": "未识别",
                "existence_insight": "分析失败"
            }

        return state

    async def generate_response(self, state: AnalysisState):
        """生成疗愈回复（Node B4）"""
        print("[Agent B4] 生成疗愈回复...")

        try:
            # 构建完整的冰山分析
            iceberg_analysis = {
                "behavior_layer": {"event": state.get("diary_content", "")[:100] + "..."},
                "emotion_layer": state.get("emotion_layer", {}),
                "cognitive_layer": state.get("cognitive_layer", {}),
                "belief_layer": state.get("belief_layer", {}),
                "core_self_layer": state.get("core_self_layer", {})
            }

            prompt = SATIR_RESPONDER_PROMPT.format(
                user_profile=json.dumps(state.get("user_profile", {}), ensure_ascii=False),
                diary_content=state["diary_content"],
                iceberg_analysis=json.dumps(iceberg_analysis, ensure_ascii=False, indent=2)
            )

            messages = [
                SystemMessage(content=SYSTEM_PROMPT_ANALYST),
                HumanMessage(content=prompt)
            ]

            response = await self.llm_responder.ainvoke(messages)
            therapeutic_response = response.content.strip()

            state["therapeutic_response"] = therapeutic_response
            print(f"[Agent B4] 回复生成完成: {therapeutic_response[:50]}...")

        except Exception as e:
            print(f"[Agent B4] 错误: {e}")
            state["therapeutic_response"] = "感谢你愿意记录下这段经历。你的感受是真实的，你的经历是有意义的。"

        return state


class SocialContentCreatorAgent:
    """Agent C: 社交内容生成器"""

    def __init__(self):
        self.llm = get_creative_llm()

    async def generate_posts(self, state: AnalysisState, user_profile: Dict):
        """生成朋友圈文案"""
        print("[Agent C] 生成朋友圈文案...")

        try:
            prompt = SOCIAL_POST_CREATOR_PROMPT.format(
                username=user_profile.get("username", "用户"),
                social_style=user_profile.get("social_style", "真实"),
                catchphrases=", ".join(user_profile.get("catchphrases", [])),
                diary_content=state["diary_content"],
                emotion_tags=", ".join(state.get("timeline_event", {}).get("emotion_tag", "未分类").split(",") if isinstance(state.get("timeline_event", {}).get("emotion_tag"), str) else "未分类")
            )

            messages = [
                SystemMessage(content="你是社交媒体文案创作专家。"),
                HumanMessage(content=prompt)
            ]

            response = await self.llm.ainvoke(messages)
            result = json.loads(response.content)

            state["social_posts"] = result.get("posts", [])
            print(f"[Agent C] 文案生成完成: {len(state['social_posts'])}个版本")

        except Exception as e:
            print(f"[Agent C] 错误: {e}")
            # 降级：生成简单文案
            content = state["diary_content"][:50]
            state["social_posts"] = [
                {
                    "version": "A",
                    "style": "简洁版",
                    "content": f"今天记录：{content}..."
                },
                {
                    "version": "B",
                    "style": "完整版",
                    "content": state["diary_content"][:100]
                }
            ]

        return state
