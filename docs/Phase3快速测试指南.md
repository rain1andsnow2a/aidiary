# 🚀 Phase 3: AI Agent系统 - 快速测试指南

## ⚠️ 测试前准备

### 1. 配置DeepSeek API Key

**获取API Key**:
1. 访问：https://platform.deepseek.com/
2. 注册账号（免费）
3. 进入"API Keys"页面
4. 创建新的API Key
5. 复制API Key

**配置到项目**:
编辑 `backend/.env` 文件：
```bash
DEEPSEEK_API_KEY=sk-你的API密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

**API Key格式示例**:
```bash
DEEPSEEK_API_KEY=sk-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 📝 测试流程

### Step 1: 启动应用

```bash
cd D:\bigproject\映记\backend
python main.py
```

看到以下输出表示成功：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 2: 访问API文档

打开浏览器：http://localhost:8000/docs

### Step 3: 注册/登录获取Token

1. 点击 `POST /api/v1/auth/login/send-code`
2. 输入你的邮箱（2337590486@qq.com或新邮箱）
3. 检查邮箱获取验证码
4. 点击 `POST /api/v1/auth/login`
5. 输入验证码登录
6. 复制返回的 `access_token`

### Step 4: 设置认证

1. 点击页面右上角 **"Authorize"** 按钮
2. 输入：`Bearer <你的access_token>`
3. 点击 **"Authorize"**
4. 点击 **"Close"**

### Step 5: 创建测试日记

1. 点击 `POST /api/v1/diaries/`
2. 点击 **"Try it out"**
3. 输入：
```json
{
  "title": "项目里程碑",
  "content": "今天完成了项目的一个重要里程碑！团队协作很顺利，大家配合越来越默契。虽然过程中遇到了一些技术难题，但大家一起努力解决了。\n\n感觉很有成就感，这是这个月最顺利的一次项目交付。晚上和同事一起吃饭庆祝，大家都说我的领导能力提升了很多。\n\n不过想想最近总是工作工作，感觉有点忽略了家庭。希望能更好地平衡工作和生活。",
  "diary_date": "2026-03-05",
  "emotion_tags": ["成就感", "满足", "担忧"],
  "importance_score": 8
}
```
4. 点击 **"Execute"**
5. 复制返回的 `id`（日记ID）

### Step 6: 执行AI分析 ⭐

1. 点击 `POST /api/v1/ai/analyze`
2. 点击 **"Try it out"**
3. 输入：
```json
{
  "diary_id": 1  // 使用刚才创建的日记ID
}
```
4. 点击 **"Execute"**

### Step 7: 查看分析结果

**预期响应** (200 OK):
```json
{
  "diary_id": 1,
  "user_id": 1,
  "timeline_event": {
    "event_summary": "完成项目重要里程碑",
    "emotion_tag": "成就感",
    "importance_score": 8,
    "event_type": "achievement",
    "related_entities": {}
  },
  "satir_analysis": {
    "behavior_layer": {},
    "emotion_layer": {
      "surface_emotion": "成就感",
      "underlying_emotion": "满足",
      "emotion_intensity": 8
    },
    "cognitive_layer": {
      "irrational_beliefs": ["我必须完美"]
    },
    "belief_layer": {},
    "core_self_layer": {
      "deepest_desire": "被认可"
    }
  },
  "therapeutic_response": "你的努力和付出得到了回报...",
  "social_posts": [
    {
      "version": "A",
      "style": "简洁版",
      "content": "今天项目顺利交付，团队配合越来越好..."
    },
    {
      "version": "B",
      "style": "情感版",
      "content": "这段经历让我深刻体会到..."
    },
    {
      "version": "C",
      "style": "感悟版",
      "content": "原来成就感不仅来自结果..."
    }
  ],
  "metadata": {
    "processing_time": 15.23,
    "current_step": "social_content_generation",
    "error": null
  }
}
```

---

## 🎯 分析结果解读

### 时间轴事件
- **事件摘要**: 提取的关键事件
- **情绪标签**: 主要情绪分类
- **重要性**: 1-10分评分
- **事件类型**: work/relationship/health/achievement/other

### 萨提亚冰山分析

#### 第2层：情绪层
- **表层情绪**: 直接表达的情绪
- **潜在情绪**: 深层的真实感受

#### 第3层：认知层
- **非理性信念**: "我必须完美"
- **自动化思维**: 潜意识的想法

#### 第4层：信念层
- **核心信念**: "成就感很重要"
- **人生规条**: 努力就会有回报

#### 第5层：存在层
- **深层渴望**: 被认可、被看见

### 疗愈回复
- 温暖、有同理心的回应
- 连接用户的深层渴望
- 提供可行的成长建议

### 朋友圈文案
- 3个不同版本
- 符合日记内容
- 适合社交媒体分享

---

## 🐛 常见问题

### Q1: 500 Internal Server Error

**原因**: DeepSeek API Key未配置或无效

**解决**:
1. 检查 `.env` 文件中的 `DEEPSEEK_API_KEY`
2. 确认API Key格式正确（以 `sk-` 开头）
3. 访问 https://platform.deepseek.com/ 确认Key有效

### Q2: 分析超时

**原因**: API调用超时或网络问题

**解决**:
1. 检查网络连接
2. 查看控制台日志
3. 稍后重试

### Q3: 分析结果不理想

**原因**: Prompt可能需要优化

**解决**:
1. 调整日记内容，更具体
2. 修改Prompt模板（`app/agents/prompts.py`）
3. 调整temperature参数

### Q4: JSON解析错误

**原因**: LLM返回的不是有效JSON

**解决**:
1. 已实现错误处理和降级
2. 会使用默认回复
3. 查看控制台日志

---

## 🧪 其他测试

### 仅萨提亚分析

端点：`POST /api/v1/ai/satir-analysis`

**优点**：
- 更快速（只做心理分析）
- 成本更低（少调用LLM）

### 仅生成文案

端点：`POST /api/v1/ai/social-posts`

**优点**：
- 快速生成3个版本
- 适合社交媒体分享

---

## 📊 性能指标

### 处理时间

- 完整分析：约15-20秒
- 萨提亚分析：约10-15秒
- 文案生成：约5-10秒

### 成本估算

- DeepSeek API成本：¥0.14/百万tokens
- 单次分析：约1000-2000 tokens
- 单次成本：约¥0.0002-0.0004

---

## 🎓 理解萨提亚冰山模型

### 五层结构

```
第5层 - 存在层
├─ 普遍性渴望
└─ 灵魂渴望

第4层 - 信念层
├─ 核心信念
└─ 人生规条

第3层 - 认知层
├─ 观点
├─ 态度
└─ 信念

第2层 - 情绪层
├─ 表层情绪
└─ 潜在情绪

第1层 - 行为层
├─ 应对姿态
└─ 可观察行为
```

### 实际应用

**行为层**：我做了什么（写代码、开会）
**情绪层**：我的感受（开心、焦虑）
**认知层**：我的想法（我必须完美）
**信念层**：我的价值观（努力=成功）
**存在层**：我的渴望（被看见、被认可）

---

## 🚀 开始测试

**准备好了吗？**

1. ✅ 配置DeepSeek API Key
2. ✅ 启动应用
3. ✅ 创建日记
4. ✅ 执行AI分析
5. ✅ 查看深度心理分析

**访问**: http://localhost:8000/docs

---

**准备好了吗？开始你的AI分析之旅吧！** 🎉✨
