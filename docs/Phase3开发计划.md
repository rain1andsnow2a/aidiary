# Phase 3: AI Agent系统开发计划

## 🎯 目标

实现基于LangGraph的多Agent系统，为用户提供萨提亚冰山模型心理分析。

## 🤖 Agent架构

### Agent 0: Context Collector（上下文收集器）
- 获取用户画像
- 获取时间轴上下文
- 向量搜索历史记忆（可选）

### Agent A: Timeline Manager（时间线管家）
- 提取关键事件
- 检测连续模式
- 更新timeline_events表

### Agent B: Satir Therapist（萨提亚分析师）
- Node B1: 情绪侦探（情绪层）
- Node B2: 信念挖掘（信念层）
- Node B3: 灵魂摆渡人（存在层）
- Node B4: 疗愈回信生成器

### Agent C: Social Content Creator（社交内容生成）
- 生成3版本文案
- 学习用户编辑风格

### Agent D: Graph Builder（图谱构建器）
- 提取实体关系
- 更新知识图谱（Phase 4）

## 📝 实施步骤

1. 配置DeepSeek API
2. 实现State管理
3. 实现Agent 0: Context Collector
4. 实现Agent A: Timeline Manager
5. 实现Agent B: Satir Therapist
6. 实现Agent C: Social Content Creator
7. 创建LangGraph工作流
8. 实现API端点
9. 测试完整流程

## 🔧 技术栈

- LangGraph: Agent编排
- DeepSeek API: LLM
- SQLAlchemy: 数据库
- Pydantic: 数据验证

开始时间: 2026-03-05
预计完成: 2026-03-05
