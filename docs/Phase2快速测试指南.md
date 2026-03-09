# 🚀 Phase 2 功能快速测试指南

## 📋 测试前准备

### 1. 确保应用运行
```bash
cd D:\bigproject\映记\backend
python main.py
```

看到以下输出表示成功：
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 2. 访问API文档
打开浏览器：http://localhost:8000/docs

---

## 📝 测试流程

### Step 1: 注册/登录获取令牌

**方法A: 使用已注册用户**
如果你已经通过Phase 1测试注册过账号：

1. 点击 `POST /api/v1/auth/login/send-code`
2. 输入：
```json
{
  "email": "2337590486@qq.com",
  "type": "login"
}
```
3. 检查邮箱获取验证码
4. 点击 `POST /api/v1/auth/login`
5. 输入：
```json
{
  "email": "2337590486@qq.com",
  "code": "从邮箱获取的验证码"
}
```
6. 复制返回的 `access_token`

**方法B: 注册新用户**
1. 点击 `POST /api/v1/auth/register/send-code`
2. 输入你的邮箱
3. 检查邮箱获取验证码
4. 点击 `POST /api/v1/auth/register`
5. 输入：
```json
{
  "email": "你的邮箱",
  "code": "验证码",
  "password": "你的密码",
  "username": "昵称"
}
```
6. 复制返回的 `access_token`

### Step 2: 设置认证令牌

1. 在Swagger UI页面点击右上角 **"Authorize"** 按钮
2. 输入：`Bearer <你的access_token>`
   - 例如：`Bearer eyJ0eXAiOiJKV1QiLCJhbGc...`
3. 点击 **"Authorize"**
4. 点击 **"Close"**

### Step 3: 创建日记

1. 点击 `POST /api/v1/diaries/`
2. 点击 **"Try it out"**
3. 输入：
```json
{
  "title": "美好的一天",
  "content": "今天天气晴朗，心情特别好。完成了很多工作，感觉很有成就感。这是我使用印记的第一篇日记，记录这个特别的时刻。",
  "diary_date": "2026-03-05",
  "emotion_tags": ["开心", "满足", "期待"],
  "importance_score": 8
}
```
4. 点击 **"Execute"**

**预期响应** (200 OK):
```json
{
  "id": 1,
  "user_id": 1,
  "title": "美好的一天",
  "content": "今天天气晴朗，心情特别好。完成了很多工作，感觉很有成就感。这是我使用印记的第一篇日记，记录这个特别的时刻。",
  "diary_date": "2026-03-05",
  "emotion_tags": ["开心", "满足", "期待"],
  "importance_score": 8,
  "word_count": 48,
  "images": null,
  "is_analyzed": false,
  "created_at": "2026-03-05T14:30:00Z",
  "updated_at": "2026-03-05T14:30:00Z"
}
```

### Step 4: 获取日记列表

1. 点击 `GET /api/v1/diaries/`
2. 点击 **"Try it out"**
3. 点击 **"Execute"**

**预期响应** (200 OK):
```json
{
  "items": [
    {
      "id": 1,
      "title": "美好的一天",
      ...
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

### Step 5: 获取日记详情

1. 点击 `GET /api/v1/diaries/{diary_id}`
2. 输入日记ID（例如：1）
3. 点击 **"Try it out"**
4. 点击 **"Execute"**

### Step 6: 更新日记

1. 点击 `PUT /api/v1/diaries/{diary_id}`
2. 输入日记ID
3. 点击 **"Try it out"**
4. 输入：
```json
{
  "title": "美好的一天（更新）",
  "emotion_tags": ["开心", "满足", "期待", "感激"]
}
```
5. 点击 **"Execute"**

### Step 7: 查询指定日期的日记

1. 点击 `GET /api/v1/diaries/date/{target_date}`
2. 输入日期：`2026-03-05`
3. 点击 **"Try it out"**
4. 点击 **"Execute"**

### Step 8: 按日期范围查询

1. 点击 `GET /api/v1/diaries/`
2. 添加参数：
   - `start_date`: `2026-03-01`
   - `end_date`: `2026-03-31`
3. 点击 **"Execute"**

### Step 9: 获取时间轴

**最近7天**:
1. 点击 `GET /api/v1/diaries/timeline/recent`
2. 添加参数：`days`: 7
3. 点击 **"Execute"**

**日期范围**:
1. 点击 `GET /api/v1/diaries/timeline/range`
2. 添加参数：
   - `start_date`: `2026-03-01`
   - `limit`: 10
3. 点击 **"Execute"**

### Step 10: 删除日记

1. 点击 `DELETE /api/v1/diaries/{diary_id}`
2. 输入要删除的日记ID
3. 点击 **"Try it out"**
4. 点击 **"Execute"**

---

## ✅ 验证清单

- [ ] 注册/登录成功
- [ ] 获取access_token
- [ ] 创建日记成功
- [ ] 查看日记列表
- [ ] 查看日记详情
- [ ] 更新日记
- [ ] 按日期查询
- [ ] 按日期范围查询
- [ ] 查看时间轴
- [ ] 删除日记

---

## 🐛 常见问题

### Q1: 401 Unauthorized
**原因**: Token未设置或过期
**解决**:
1. 重新登录获取新token
2. 点击"Authorize"重新设置

### Q2: 404 Not Found
**原因**: 日记ID不存在或属于其他用户
**解决**:
1. 先查看日记列表获取正确ID
2. 确认使用的是自己的账号

### Q3: 422 Validation Error
**原因**: 请求数据格式错误
**解决**:
1. 检查JSON格式
2. 检查字段类型和长度限制
3. 查看具体错误信息

### Q4: 500 Internal Server Error
**原因**: 服务器错误
**解决**:
1. 检查应用日志
2. 确认数据库正常运行
3. 查看错误详情

---

## 📊 测试数据建议

### 测试日记内容

**日记1 - 工作**:
```json
{
  "title": "项目里程碑",
  "content": "今天完成了重要项目的第一个里程碑！团队协作很顺利，感觉大家配合越来越默契。虽然有点累，但看到成果很有成就感。",
  "diary_date": "2026-03-05",
  "emotion_tags": ["成就感", "满足", "疲惫"],
  "importance_score": 9
}
```

**日记2 - 生活**:
```json
{
  "title": "周末休闲",
  "content": "今天和朋友去爬山了，风景很美，空气清新。聊了很多有趣的话题，感觉心情特别放松。好久没有这样放松了。",
  "diary_date": "2026-03-04",
  "emotion_tags": ["开心", "放松", "感恩"],
  "importance_score": 7
}
```

**日记3 - 学习**:
```json
{
  "title": "学习新技术",
  "content": "今天开始学习FastAPI，感觉很有意思。异步编程的概念虽然有点难，但实践起来很方便。准备做一个个人项目练手。",
  "diary_date": "2026-03-03",
  "emotion_tags": ["好奇", "期待", "充实"],
  "importance_score": 6
}
```

---

## 🎯 测试目标

通过测试验证：
- ✅ CRUD功能正常
- ✅ 权限控制有效
- ✅ 数据验证正确
- ✅ 分页功能工作
- ✅ 过滤功能正常
- ✅ 时间轴功能可用

---

## 📞 遇到问题？

如果测试过程中遇到问题：
1. 查看应用日志（控制台输出）
2. 检查Swagger UI的响应详情
3. 查看数据库文件是否正常
4. 重启应用重试

---

**准备好测试了吗？** 🚀

**开始**: http://localhost:8000/docs
