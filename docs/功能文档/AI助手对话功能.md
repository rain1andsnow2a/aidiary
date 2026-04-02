# 映记精灵（Yinji Sprite）- AI 对话助手模块

> 映记的 AI 伴侣形象，悬浮于界面右下角，主动陪伴用户，而不是等用户来用。

---

## 模块定位

映记精灵是映记 App 的具身 AI 入口，以**吉祥物形象**呈现，区别于普通聊天框。  
核心体验目标：**让用户感到被陪伴，而不是被使用。**

---

## UI 呈现

### 默认状态（待机）
- 位置：页面**右下角**，固定悬浮于所有页面之上（`position: fixed`，`z-index` 最高层）
- 形象：透明背景的静态吉祥物图片
  - 资源路径：`"D:\bigproject\映记\frontend\public\Image 1.png"`（PNG，透明背景）
- 可自由拖拽（全屏范围内，鼠标/触摸均支持）
- 悬停时有轻微交互反馈（如轻微浮动动画或高亮描边）

### 对话中状态（响应 / 输出中）
- 吉祥物切换为**循环播放的透明背景视频**，代替静态图片
  - 原始视频资源：`"D:\bigproject\映记\frontend\public\Video 1.mp4"`
  - 需转换为 **WebM 透明背景格式**（VP9 编码，含 Alpha 通道）
  - 转换工具参考：FFmpeg 
  示例：$env:HTTP_PROXY='http://127.0.0.1:10090'; $env:HTTPS_PROXY='http://127.0.0.1:10090'; python d:\MCP\gemini-image\rembg_video.py "d:\novel\yigou-lifang-private-main\yigou-lifang-private-main\yigou-lifang\public\images\branding\ai-assistant-blink.mp4" --skip-extract --keep-frames
使用 ffmpeg: C:\Users\HUAWEI\AppData\Local\Programs\Python\Python39\lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe
输入视频: D:\novel\yigou-lifang-private-main\yigou-lifang-private-main\yigou-lifang\public\images\branding\ai-assistant-blink.mp4
分辨率: 960x960, 帧率: 24 fps, 时长: 5.04s
输出路径: D:\novel\yigou-lifang-private-main\yigou-lifang-private-main\yigou-lifang\public\images\branding\ai-assistant-blink_no_bg.webm


- 视频在等待响应和流式输出期间**持续循环**，输出完成后切回静态图片

### 屏蔽状态（小球模式）
- 触发方式：**右键单击**吉祥物，弹出上下文菜单，选择"屏蔽助手"
- 形态变为一个**小圆球**（样式可与品牌色一致，建议带轻微阴影和呼吸动画）
- 小球同样**可自由拖拽**
- **单击小球**即可唤醒，恢复为完整的吉祥物形象

---

## 对话框（Chat Panel）

### 触发
- 单击吉祥物（待机状态）弹出对话框

### 布局
- 对话框浮层，建议宽度 `360px`，高度 `480px` 左右
- 相对吉祥物位置弹出（避免超出视口）
- 包含：
  - 顶部：精灵名字 / 关闭按钮
  - 中部：消息列表（支持滚动）
  - 底部：输入框 + 发送按钮

### 流式输出
- AI 回复采用**流式（Streaming）输出**
- 实现方式：调用后端 SSE（Server-Sent Events）或 Streaming API 接口
- 前端逐字/逐 token 追加显示，**不等全部内容返回后再渲染**
- 流式输出期间，吉祥物保持播放说话视频

---

## 初始化流程（首次使用）

用户首次打开精灵对话时，触发**一次性初始化弹窗**：

```
┌─────────────────────────────────────┐
│  👋 你好！在开始之前               │
│  你希望我怎么称呼你呢？            │
│                                     │
│  [ 输入你的称呼... ]               │
│                                     │
│              [ 确认 ]              │
└─────────────────────────────────────┘
```

- 字段：`nickname`（昵称，用户对自己的默认称呼）
- 存储位置：用户 Profile 表 / LocalStorage（双写，优先后端）
- 初始化完成后，后续对话中 AI 将始终使用此称呼
- **仅触发一次**，可在个人设置中修改

---

## AI 能力与上下文

映记精灵不是一个无记忆的通用聊天框，它了解用户的完整信息：

### 用户信息来源

| 数据类型 | 来源 | 说明 |
|----------|------|------|
| 用户昵称 | 初始化 / 个人设置 | 用于称呼用户 |
| MBTI | 个人信息填写 | 理解用户性格倾向，调整沟通风格 |
| 历史日记 | **Qdrant 向量数据库** | RAG 检索，读取近期/相关日记内容 |
| 情绪趋势 | 日记分析结果 | 了解用户近期情绪走向 |

### Qdrant 集成说明
- 每次用户发送消息，后端先对用户的 Qdrant 数据做**语义检索**（Semantic Search）
- 检索结果作为上下文注入 System Prompt，让 AI 能够引用真实的日记内容
- 推荐 top-k = 3~5 条相关日记片段
- 若无相关内容，AI 以通用陪伴口吻回复

### System Prompt 参考结构

```
你是映记精灵，是一只可爱的小狐狸，映记 App 的 AI 情绪陪伴伙伴。
你的核心风格：温暖、不评判、有洞察力，擅长运用萨提亚冰山模型帮助用户看见自己。

用户信息：
- 昵称：{nickname}
- MBTI：{mbti}

用户近期相关日记摘要（来自向量检索）：
{qdrant_context}

请根据以上信息，用亲切、自然的方式和用户对话。
要像一个长期陪伴他/她的老朋友，以第一人称回答对方。
```



---

## 交互细节

- 对话框关闭后，**对话历史保留**（本次会话内），重新打开可继续
- 在对话框里可以选择删除对话数据或者开启新对话，并且可以查看对话历史

