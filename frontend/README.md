# 印记 - 前端应用

基于 React 18 + Vite + TypeScript + shadcn/ui 的智能日记应用前端。

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **UI组件**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **日期处理**: date-fns
- **图表**: Recharts

## 项目结构

```
src/
├── pages/           # 页面组件
│   ├── auth/       # 认证相关页面
│   ├── diaries/    # 日记相关页面
│   ├── dashboard/  # 仪表盘
│   └── timeline/   # 时间轴
├── components/      # 可复用组件
│   ├── ui/         # shadcn/ui组件
│   ├── common/     # 通用组件
│   └── layout/     # 布局组件
├── store/          # Zustand状态管理
├── services/       # API服务
├── hooks/          # 自定义Hooks
├── types/          # TypeScript类型
├── utils/          # 工具函数
└── constants/      # 常量定义
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 功能特性

### 已实现

- ✅ 用户认证（邮箱验证码登录/注册）
- ✅ 日记列表（分页、筛选）
- ✅ 日记编辑器（创建、编辑、删除）
- ✅ 时间轴展示
- ✅ 数据仪表盘
- ✅ 响应式设计

### 待实现

- ⏳ AI分析结果展示
- ⏳ 萨提亚冰山可视化
- ⏳ 情绪统计图表
- ⏳ 用户画像设置
- ⏳ 暗色主题
- ⏳ PWA支持

## 环境变量

创建 `.env.local` 文件：

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## API集成

前端通过 `/api` 代理与后端通信：

```typescript
// 开发环境
// /api/* -> http://localhost:8000/api/*

// 生产环境
// 设置 VITE_API_BASE_URL 环境变量
```

## 状态管理

使用 Zustand 进行全局状态管理：

- `authStore`: 认证状态（用户信息、token）
- `diaryStore`: 日记状态（列表、详情、时间轴）

## 组件库

基于 shadcn/ui 的可定制组件：

- Button、Input、Card
- Dialog、Dropdown、Select
- Form、Toast
- ...

自定义组件：

- Loading、Modal
- ErrorBoundary

## 样式系统

使用 Tailwind CSS 实用类：

```css
/* 主色调 */
--primary: #8B5CF6 (紫色)

/* 情绪颜色 */
--emotion-joy: #FBBF24
--emotion-sad: #60A5FA
--emotion-anger: #F87171
--emotion-calm: #34D399
```

## 路由配置

```typescript
// 公开路由
/login        - 登录页
/register     - 注册页

// 私有路由
/             - 仪表盘
/diaries      - 日记列表
/diaries/new  - 写日记
/timeline     - 时间轴
```

## 性能优化

- 代码分割（React.lazy）
- 路由懒加载
- 图片优化（待实现）
- 虚拟滚动（待实现）

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 开发建议

1. **组件开发**：遵循单一职责原则
2. **类型安全**：充分利用 TypeScript
3. **样式约定**：优先使用 Tailwind 实用类
4. **状态管理**：合理使用 Zustand，避免过度使用
5. **代码风格**：使用 ESLint + Prettier

## 部署

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# 将 dist/ 目录部署到 Netlify
```

### 静态托管

任何支持静态网站的托管服务：
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## 常见问题

### Q: 端口被占用？

修改 `vite.config.ts` 中的 `server.port`

### Q: API请求失败？

1. 检查后端服务是否运行
2. 检查 `.env.local` 中的 `VITE_API_BASE_URL`
3. 查看浏览器控制台的网络请求

### Q: 组件库样式不生效？

确保已正确安装 Tailwind CSS 和依赖：

```bash
npm install -D tailwindcss postcss autoprefixer
npm install clsx tailwind-merge class-variance-authority
```

## License

MIT

---

**印记 - 智能日记应用**
