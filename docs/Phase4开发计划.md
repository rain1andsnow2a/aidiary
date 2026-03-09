# Phase 4: 前端开发计划

## 📊 阶段概览

**阶段名称**: React前端应用开发
**预计时间**: 20-26小时
**技术栈**: React 18 + Vite + shadcn/ui + Zustand + Lexical
**当前状态**: 准备开始

---

## 🎯 核心目标

### 主要功能
1. ✅ 用户认证（登录/注册）
2. ✅ 日记管理（创建、编辑、查看、删除）
3. ✅ AI分析展示（萨提亚冰山模型）
4. ✅ 时间轴可视化
5. ✅ 数据洞察仪表盘
6. ✅ 用户画像设置

### 技术目标
- 现代化UI/UX设计
- 响应式布局（移动端适配）
- 高性能交互体验
- 完善的错误处理
- 良好的代码组织

---

## 🛠️ 技术栈详解

### 核心框架
- **React 18**: 最新特性（并发、Suspense、Act）
- **Vite 5**: 快速开发服务器和构建工具
- **TypeScript**: 类型安全

### UI组件库
- **shadcn/ui**: 高质量可定制组件
- **Tailwind CSS 3**: 实用优先的CSS框架
- **Radix UI**: 无障碍组件基础

### 状态管理
- **Zustand**: 轻量级状态管理
- **React Query**: 服务器状态管理
- **Axios**: HTTP客户端

### 富文本编辑器
- **Lexical**: Meta开发的现代编辑器
- **自定义插件**: 图片上传、标签插入等

### 数据可视化
- **Recharts**: 图表库
- **D3.js**: 高级可视化（可选）

### 工具库
- **date-fns**: 日期处理
- **clsx**: 类名合并
- **React Router**: 路由管理
- **Vite PWA**: PWA支持

---

## 📁 项目结构设计

```
frontend/
├── src/
│   ├── main.tsx                 # 应用入口
│   ├── App.tsx                  # 根组件
│   ├── index.css                # 全局样式
│   │
│   ├── pages/                   # 页面组件
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx    # 登录页
│   │   │   └── RegisterPage.tsx # 注册页
│   │   ├── diaries/
│   │   │   ├── DiaryList.tsx    # 日记列表
│   │   │   ├── DiaryDetail.tsx  # 日记详情
│   │   │   └── DiaryEditor.tsx  # 日记编辑器
│   │   ├── analysis/
│   │   │   ├── AnalysisResult.tsx # AI分析结果
│   │   │   └── SatirIceberg.tsx   # 萨提亚冰山可视化
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx    # 数据仪表盘
│   │   ├── timeline/
│   │   │   └── Timeline.tsx     # 时间轴
│   │   └── settings/
│   │       └── ProfileSettings.tsx # 用户画像
│   │
│   ├── components/              # 可复用组件
│   │   ├── ui/                  # shadcn/ui组件
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── editor/              # 富文本编辑器
│   │   │   ├── LexicalEditor.tsx
│   │   │   └── plugins/
│   │   ├── layout/              # 布局组件
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── common/              # 通用组件
│   │       ├── Loading.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── Modal.tsx
│   │
│   ├── store/                   # 状态管理
│   │   ├── authStore.ts         # 认证状态
│   │   ├── diaryStore.ts        # 日记状态
│   │   └── uiStore.ts           # UI状态
│   │
│   ├── services/                # API服务
│   │   ├── api.ts               # API客户端配置
│   │   ├── auth.service.ts      # 认证API
│   │   ├── diary.service.ts     # 日记API
│   │   └── ai.service.ts        # AI分析API
│   │
│   ├── hooks/                   # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useDiaries.ts
│   │   └── useAnalysis.ts
│   │
│   ├── types/                   # TypeScript类型
│   │   ├── auth.ts
│   │   ├── diary.ts
│   │   └── analysis.ts
│   │
│   ├── utils/                   # 工具函数
│   │   ├── cn.ts                # 类名合并
│   │   ├── date.ts              # 日期处理
│   │   └── validation.ts        # 表单验证
│   │
│   └── constants/               # 常量定义
│       ├── routes.ts            # 路由配置
│       └── api.ts               # API端点
│
├── public/                      # 静态资源
│   ├── favicon.svg
│   └── logo.png
│
├── index.html                   # HTML模板
├── vite.config.ts              # Vite配置
├── tailwind.config.js          # Tailwind配置
├── tsconfig.json               # TypeScript配置
├── package.json                # 依赖配置
└── README.md                   # 前端文档
```

---

## 📋 实施步骤

### Step 1: 项目初始化（2小时）

**任务**:
- [ ] 创建Vite + React + TypeScript项目
- [ ] 配置Tailwind CSS
- [ ] 安装shadcn/ui
- [ ] 配置项目结构
- [ ] 设置路由（React Router）
- [ ] 配置axios拦截器

**命令**:
```bash
cd D:\bigproject\映记
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom zustand @tanstack/react-query
npm install axios date-fns clsx
npm install recharts
```

**验证**:
- [ ] 启动开发服务器
- [ ] 访问 http://localhost:5173
- [ ] 看到欢迎页面

---

### Step 2: 基础组件搭建（3小时）

**任务**:
- [ ] 配置shadcn/ui
- [ ] 创建布局组件（Header、Sidebar）
- [ ] 创建通用组件（Loading、Modal、Card）
- [ ] 配置全局样式

**shadcn/ui初始化**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
```

**组件列表**:
- Button、Input、Card基础组件
- Header组件（导航栏、用户菜单）
- Loading组件（加载动画）
- Modal组件（弹窗）
- ErrorBoundary组件（错误边界）

---

### Step 3: 认证系统开发（4小时）

**页面**:
- [ ] LoginPage.tsx（登录页面）
- [ ] RegisterPage.tsx（注册页面）

**功能**:
- [ ] 邮箱验证码登录
- [ ] 邮箱验证码注册
- [ ] JWT token管理
- [ ] 自动登录（localStorage）
- [ ] 登出功能
- [ ] 路由保护（PrivateRoute）

**API集成**:
```typescript
// POST /api/v1/auth/login/send-code
// POST /api/v1/auth/login
// POST /api/v1/auth/register/send-code
// POST /api/v1/auth/register/verify
// POST /api/v1/auth/register
```

**Zustand Store**:
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, code: string) => Promise<void>
  logout: () => void
  checkAuth: () => void
}
```

---

### Step 4: 日记管理功能（6小时）

**页面**:
- [ ] DiaryList.tsx（日记列表）
- [ ] DiaryDetail.tsx（日记详情）
- [ ] DiaryEditor.tsx（日记编辑器）

**DiaryList功能**:
- [ ] 分页加载
- [ ] 搜索过滤
- [ ] 按日期排序
- [ ] 情绪标签筛选
- [ ] 卡片式布局
- [ ] 无限滚动（可选）

**DiaryDetail功能**:
- [ ] 完整内容展示
- [ ] 元信息显示（日期、标签、字数）
- [ ] 编辑/删除按钮
- [ ] 返回列表
- [ ] 分享功能（可选）

**DiaryEditor功能**:
- [ ] Lexical富文本编辑器
- [ ] 标题输入
- [ ] 内容编辑
- [ ] 情绪标签选择
- [ ] 重要性评分（1-10滑块）
- [ ] 保存/发布按钮
- [ ] 自动保存（草稿）
- [ ] 图片上传（可选）

**Lexical编辑器配置**:
```typescript
// 支持的功能
- 粗体、斜体、下划线
- 标题（H1、H2、H3）
- 列表（有序、无序）
- 链接插入
- 图片上传
- 撤销/重做
```

---

### Step 5: AI分析展示（5小时）

**页面**:
- [ ] AnalysisResult.tsx（分析结果主页面）
- [ ] SatirIceberg.tsx（萨提亚冰山可视化）

**分析结果展示**:
- [ ] 时间轴事件卡片
- [ ] 萨提亚冰山5层分析
  - 行为层：事件识别
  - 情绪层：情绪图谱
  - 认知层：思维模式
  - 信念层：核心价值观
  - 存在层：深层渴望
- [ ] 疗愈回复展示
- [ ] 朋友圈文案（3个版本）
- [ ] 复制文案功能

**萨提亚冰山可视化**:
- [ ] 交互式冰山图
- [ ] 每层可点击展开
- [ ] 动画效果
- [ ] 颜色编码（情绪层级）

**触发分析**:
- [ ] 手动触发按钮
- [ ] 自动分析开关
- [ ] 分析进度提示
- [ ] 错误处理

---

### Step 6: 时间轴和仪表盘（4小时）

**Timeline页面**:
- [ ] 垂直时间轴布局
- [ ] 事件卡片展示
- [ ] 月份分组
- [ ] 情绪标签显示
- [ ] 重要性视觉化（大小/颜色）
- [ ] 点击查看详情

**Dashboard页面**:
- [ ] 统计卡片
    - 总日记数
    - 本月日记数
    - 最常使用的情绪标签
    - 平均重要性评分
- [ ] 情绪趋势图（折线图）
- [ ] 情绪分布图（饼图）
- [ ] 最近活动列表
- [ ] AI分析统计

**Recharts图表**:
```typescript
// 情绪趋势（折线图）
<LineChart data={emotionTrends}>
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="score" stroke="#8884d8" />
</LineChart>

// 情绪分布（饼图）
<PieChart>
  <Pie data={emotionDistribution} dataKey="value" nameKey="name" />
  <Tooltip />
</PieChart>
```

---

### Step 7: 用户画像设置（2小时）

**ProfileSettings页面**:
- [ ] 基本信息
  - 用户名
  - 头像上传
  - 邮箱显示
- [ ] 用户画像
  - 性格类型（MBTI选择器）
  - 社交风格（下拉选择）
  - 当前状态
  - 口头禅（标签输入）
- [ ] 偏好设置
  - 主题切换（浅色/深色）
  - 语言设置
  - 通知设置

---

### Step 8: 优化和测试（4小时）

**性能优化**:
- [ ] 代码分割（React.lazy）
- [ ] 图片懒加载
- [ ] 虚拟滚动（日记列表）
- [ ] 缓存优化

**UI/UX优化**:
- [ ] 加载状态优化
- [ ] 错误提示优化
- [ ] 空状态设计
- [ ] 动画效果（Framer Motion可选）
- [ ] 响应式适配

**测试**:
- [ ] 单元测试（Vitest）
- [ ] 组件测试（Testing Library）
- [ ] E2E测试（Playwright）
- [ ] 手动测试

---

## 🎨 UI设计规范

### 颜色系统
```css
/* 主色调 - 温暖、治愈 */
--primary: #8B5CF6;        /* 紫色 - 智慧 */
--primary-light: #A78BFA;
--primary-dark: #7C3AED;

/* 辅助色 - 情绪表达 */
--emotion-joy: #FBBF24;     /* 开心 - 黄色 */
--emotion-sad: #60A5FA;     /* 悲伤 - 蓝色 */
--emotion-anger: #F87171;   /* 愤怒 - 红色 */
--emotion-calm: #34D399;    /* 平静 - 绿色 */
--emotion-fear: #A78BFA;    /* 恐惧 - 淡紫 */

/* 中性色 */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--text-primary: #111827;
--text-secondary: #6B7280;
--border: #E5E7EB;
```

### 字体系统
```css
/* 中文 */
--font-zh: 'PingFang SC', 'Microsoft YaHei', sans-serif;

/* 英文/数字 */
--font-en: 'Inter', -apple-system, sans-serif;

/* 代码 */
--font-mono: 'Fira Code', 'Consolas', monospace;
```

### 间距系统
```css
/* 基于4px网格 */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
```

---

## 📱 响应式设计

### 断点
```css
/* 移动端 */
@media (max-width: 640px) { }

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) { }

/* 桌面端 */
@media (min-width: 1025px) { }
```

### 移动端优化
- [ ] 汉堡菜单
- [ ] 底部导航栏
- [ ] 触摸优化（按钮大小44px+）
- [ ] 手势支持（滑动删除）

---

## 🔐 安全考虑

### 认证安全
- [ ] JWT存储在httpOnly cookie（可选）
- [ ] token刷新机制
- [ ] XSS防护（内容转义）
- [ ] CSRF防护

### 数据安全
- [ ] API请求加密（HTTPS）
- [ ] 敏感信息不存储在localStorage
- [ ] 自动登出（token过期）

---

## 📊 API集成

### Base URL配置
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
```

### 请求拦截器
```typescript
// 自动添加token
axios.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器（401处理）
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 🚀 部署准备

### 环境变量
```bash
# .env.production
VITE_API_BASE_URL=https://api.yinji.com
```

### 构建优化
```bash
npm run build
# 生成 dist/ 目录
```

### 静态托管选项
- Vercel（推荐）
- Netlify
- Cloudflare Pages
- GitHub Pages

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有核心功能可正常使用
- [ ] 无明显bug
- [ ] 错误处理完善

### 性能指标
- [ ] 首屏加载 < 2秒
- [ ] 路由切换 < 100ms
- [ ] Lighthouse分数 > 90

### 用户体验
- [ ] UI美观、一致
- [ ] 交互流畅
- [ ] 移动端体验良好

### 代码质量
- [ ] TypeScript无错误
- [ ] ESLint无警告
- [ ] 代码可维护性高

---

## 📚 参考资源

### 文档
- [React 18文档](https://react.dev/)
- [Vite文档](https://vitejs.dev/)
- [shadcn/ui文档](https://ui.shadcn.com/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Zustand文档](https://zustand-demo.pmnd.rs/)

### 设计参考
- [Notion](https://notion.so/) - 编辑器设计
- [Headspace](https://www.headspace.com/) - 冥想应用UI
- [Day One](https://dayoneapp.com/) - 日记应用

---

**创建时间**: 2026-03-05
**预计完成**: 2026-03-07
**当前状态**: 准备开始

让我们开始构建一个美观、易用的智能日记应用！
