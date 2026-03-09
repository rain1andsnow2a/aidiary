# 🚀 Phase 4: 前端 - 快速启动指南

## ⚡ 快速开始

### 1. 安装依赖

```bash
cd D:\bigproject\映记\frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173

---

## 📋 前置条件

### 必须安装

- Node.js 18+
- npm 或 yarn 或 pnpm

### 后端服务

前端需要后端API支持，确保后端服务运行在 http://localhost:8000

```bash
# 终端1 - 启动后端
cd D:\bigproject\映记\backend
python main.py

# 终端2 - 启动前端
cd D:\bigproject\映记\frontend
npm run dev
```

---

## 🎯 功能测试流程

### Step 1: 注册账号

1. 访问 http://localhost:5173
2. 自动跳转到登录页
3. 点击"立即注册"
4. 输入邮箱（如：test@example.com）
5. 点击"发送验证码"
6. **注意**: 由于没有配置真实邮件发送，可以输入任意6位数字验证码
7. 输入密码（至少6位）
8. 点击"注册"

### Step 2: 登录系统

1. 在登录页输入邮箱
2. 点击"发送验证码"
3. 输入验证码（任意6位数字）
4. 点击"登录"

### Step 3: 创建第一篇日记

1. 进入仪表盘，点击"写日记"
2. 输入标题（如："美好的一天"）
3. 选择日期（默认今天）
4. 输入内容（如："今天天气很好，心情很愉快..."）
5. 选择情绪标签（如：开心、平静）
6. 调整重要性评分（1-10）
7. 点击"保存日记"

### Step 4: 查看日记列表

1. 点击顶部"返回"或"我的日记"
2. 查看所有日记
3. 可以按情绪标签筛选
4. 点击日记查看详情
5. 可以编辑或删除

### Step 5: 浏览时间轴

1. 点击"时间轴"卡片
2. 查看垂直时间轴布局
3. 点击事件跳转到对应日记

---

## 🎨 UI展示

### 登录页
- 渐变背景（紫色到蓝色）
- 居中卡片布局
- 邮箱验证码输入
- 倒计时提示

### 仪表盘
- 欢迎卡片（渐变色）
- 统计卡片（总日记数、本月日记、主要情绪）
- 快速操作网格
- 最近日记列表

### 日记编辑器
- 标题输入
- 日期选择器
- 大文本编辑区
- 情绪标签选择（多选按钮）
- 重要性滑块（1-10）
- 字数统计

### 时间轴
- 垂直时间线
- 左对齐时间点
- 事件卡片展示
- 重要性评分和情绪标签

---

## 🛠️ 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查（待配置）
npm run lint

# 运行测试（待配置）
npm run test
```

---

## 📁 项目结构

```
frontend/
├── src/
│   ├── pages/              # 页面组件
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx         # 登录页 ✅
│   │   │   └── RegisterPage.tsx      # 注册页 ✅
│   │   ├── diaries/
│   │   │   ├── DiaryList.tsx         # 日记列表 ✅
│   │   │   └── DiaryEditor.tsx       # 日记编辑器 ✅
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx         # 仪表盘 ✅
│   │   └── timeline/
│   │       └── Timeline.tsx          # 时间轴 ✅
│   ├── components/
│   │   ├── ui/                        # shadcn/ui组件
│   │   │   ├── button.tsx            ✅
│   │   │   ├── card.tsx              ✅
│   │   │   └── input.tsx             ✅
│   │   └── common/
│   │       └── Loading.tsx           ✅
│   ├── store/
│   │   ├── authStore.ts              # 认证状态 ✅
│   │   └── diaryStore.ts             # 日记状态 ✅
│   ├── services/
│   │   ├── api.ts                    # Axios配置 ✅
│   │   ├── auth.service.ts           ✅
│   │   ├── diary.service.ts          ✅
│   │   └── ai.service.ts             ✅
│   ├── types/                         # 类型定义 ✅
│   ├── utils/
│   │   └── cn.ts                     # 工具函数 ✅
│   ├── constants/
│   │   └── routes.ts                 # 路由配置 ✅
│   ├── App.tsx                       # 根组件 ✅
│   ├── main.tsx                      # 入口 ✅
│   └── index.css                     # 全局样式 ✅
├── public/
│   └── favicon.svg                   ✅
├── index.html                        ✅
├── vite.config.ts                    ✅
├── tailwind.config.js                ✅
├── tsconfig.json                     ✅
├── package.json                      ✅
└── README.md                         ✅
```

---

## 🔧 环境配置

### 开发环境 (.env.local)

```bash
VITE_API_BASE_URL=http://localhost:8000
```

### 生产环境 (.env.production)

```bash
VITE_API_BASE_URL=https://api.yinji.com
```

---

## 🐛 常见问题

### Q1: npm install 失败

**原因**: 网络问题或代理配置

**解决**:
```bash
# 使用国内镜像
npm install --registry=https://registry.npmmirror.com

# 或使用代理
npm install --proxy=http://127.0.0.1:10090
```

### Q2: 端口5173被占用

**解决**:
修改 `vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    port: 3000,  // 改为其他端口
  }
})
```

### Q3: API请求失败

**检查**:
1. 后端服务是否运行（http://localhost:8000）
2. 检查浏览器控制台的网络请求
3. 确认 `.env.local` 中的 `VITE_API_BASE_URL`

### Q4: 页面空白或报错

**解决**:
1. 清除浏览器缓存
2. 重启开发服务器
3. 删除 `node_modules` 重新安装
```bash
rm -rf node_modules
npm install
```

### Q5: TypeScript错误

**解决**:
```bash
# 重启TypeScript服务器（VSCode）
Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

---

## 📊 技术栈详情

### 核心框架
- React 18.3.1
- TypeScript 5.4.5
- Vite 5.2.8

### UI相关
- Tailwind CSS 3.4.3
- Radix UI（无障碍组件）
- Lucide React（图标）

### 状态管理
- Zustand 4.5.2
- Zustand Persist（持久化）

### 路由
- React Router DOM 6.22.3

### 数据请求
- Axios 1.6.8
- React Query 5.32.0

### 工具库
- date-fns 3.6.0（日期）
- clsx 2.1.0（类名）
- tailwind-merge 2.3.0（样式合并）
- class-variance-authority 0.7.0（组件变体）

---

## ✨ 核心功能特性

### 已实现 ✅

- ✅ 用户认证（登录/注册）
- ✅ 路由守卫（私有/公开路由）
- ✅ 日记CRUD（创建、读取、更新、删除）
- ✅ 情绪标签系统
- ✅ 重要性评分
- ✅ 时间轴展示
- ✅ 数据仪表盘
- ✅ 响应式设计
- ✅ 持久化存储
- ✅ API拦截器（自动添加token）

### 待实现 ⏳

- ⏳ AI分析结果展示
- ⏳ 萨提亚冰山可视化
- ⏳ 情绪统计图表（Recharts）
- ⏳ 用户画像设置
- ⏳ 暗色主题
- ⏳ 富文本编辑器（Lexical）
- ⏳ 图片上传
- ⏳ PWA支持

---

## 🎨 设计系统

### 颜色

```css
/* 主色调 */
--primary: 262 83% 58%  /* 紫色 #8B5CF6 */

/* 情绪颜色 */
--emotion-joy: #FBBF24     /* 开心 - 黄色 */
--emotion-sad: #60A5FA     /* 悲伤 - 蓝色 */
--emotion-anger: #F87171   /* 愤怒 - 红色 */
--emotion-calm: #34D399    /* 平静 - 绿色 */
--emotion-fear: #A78BFA    /* 恐惧 - 紫色 */
```

### 字体

```css
/* 中文 */
font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif

/* 英文/数字 */
font-family: 'Inter', -apple-system, sans-serif
```

### 间距

基于4px网格系统：
- 4px, 8px, 12px, 16px, 24px, 32px

---

## 📱 响应式断点

```css
/* 移动端 */
< 640px

/* 平板 */
641px - 1024px

/* 桌面 */
> 1024px
```

---

## 🔒 安全特性

- ✅ JWT Token管理
- ✅ Token持久化（localStorage）
- ✅ 自动登出（401响应）
- ✅ 路由守卫
- ✅ XSS防护（React默认）

---

## 🚀 部署

### Vercel部署（推荐）

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Netlify部署

```bash
# 构建
npm run build

# 拖拽 dist/ 目录到 Netlify
```

### GitHub Pages

```bash
# 构建
npm run build

# 配置 GitHub Pages 为 dist/ 目录
```

---

## 📚 参考资源

### 文档
- [React文档](https://react.dev/)
- [Vite文档](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

### 设计参考
- shadcn/ui: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/

---

## 🎯 开发建议

### 组件开发
1. 保持组件单一职责
2. 使用TypeScript定义Props
3. 合理拆分组件

### 状态管理
1. 全局状态用Zustand
2. 局部状态用useState
3. 服务器状态用React Query

### 样式开发
1. 优先使用Tailwind实用类
2. 复杂样式用CSS模块
3. 保持样式一致性

---

## 📞 支持

**项目路径**: D:\bigproject\映记\frontend
**后端API**: http://localhost:8000
**前端地址**: http://localhost:5173

---

**准备好了吗？开始你的前端开发之旅！** 🎉

**运行 `npm install && npm run dev` 即可开始！**
