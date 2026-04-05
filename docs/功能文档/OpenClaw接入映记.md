# OpenClaw 接入映记

## 这是什么

这一功能让用户把自己的映记账号接入 OpenClaw 小龙虾。  
接入后，用户在手机上对小龙虾说：

- 今天想记一下……
- 帮我把这段话存成今天的日记
- 把刚刚那段追加到我今天的日记里

小龙虾就可以通过映记提供的外部写入接口，把内容写进该用户自己的日记系统。

## 实现原理

这次实现的不是“绑死 OpenClaw 的私有适配”，而是一层通用的外部速记接入能力：

1. 用户在映记里生成一枚 **外部接入令牌**
2. 令牌只展示一次，数据库里只保存 **SHA-256 哈希**
3. OpenClaw 拿着这枚令牌，请求映记后端接口
4. 后端根据令牌找到对应用户
5. 后端以该用户身份创建日记，或追加到当天最新一篇日记

这样做的好处是：

- 不暴露用户登录态
- 不复用网页 Cookie
- 后续也能接快捷指令、飞书机器人、自动化工作流

## 后端流程

### 1. 用户生成令牌

接口：

- `POST /api/v1/integrations/openclaw/token`

逻辑：

- 生成随机 token，例如 `yji_oc_xxx`
- 使用 `SHA-256` 计算哈希
- 数据库保存 `token_hash`
- 返回明文 token 给前端，仅此一次

### 2. 外部请求写入日记

接口：

- `POST /api/v1/integrations/openclaw/ingest`

认证方式：

- `Authorization: Bearer <token>`
- 或 `X-Yinji-Integration-Token: <token>`

请求体：

```json
{
  "content": "今天在图书馆做完了系统部署，心里很踏实。",
  "title": "今天的推进",
  "mode": "append_today"
}
```

服务端逻辑：

1. 对传入 token 做 SHA-256
2. 到 `external_integration_tokens` 查匹配项
3. 找到对应用户
4. 根据 `mode` 执行：
   - `append_today`：若当天已有日记，则追加正文
   - `create`：新建一篇日记
5. 返回本次写入结果

## 数据表

新增表：

- `external_integration_tokens`

主要字段：

- `user_id`
- `provider`
- `token_hash`
- `token_hint`
- `is_active`
- `created_at`
- `last_used_at`

## 前端入口

入口放在：

- `个人设置 -> OpenClaw 小龙虾速记接入`

用户可进行：

- 生成 / 重置接入令牌
- 复制令牌
- 复制接入 URL
- 查看最近使用时间
- 关闭接入

## 推荐给 OpenClaw 的技能/提示词

可以给 OpenClaw 一段类似的配置：

```text
当我说“记一下”或“帮我写日记”时，请把内容发送到这个接口：

POST {ingest_url}
Authorization: Bearer {my_token}
Content-Type: application/json

请求体：
{
  "content": "用户刚刚说的内容",
  "mode": "append_today"
}

如果用户明确说“单独存一篇”，则把 mode 改为 create。
```

## 为什么这套方案适合当前项目

因为映记本质是“个人心理与成长记录系统”，而 OpenClaw 更像是“用户随身入口”。  
两者组合后，映记获得了一个自然语言写入通道：

- 手机端更轻
- 记录门槛更低
- 日记采集更高频
- 后续还能接入 AI 总结、成长分析、RAG 检索

## 当前边界

这次实现的是 **安全写入通道**，不是 OpenClaw 插件市场里的完整官方 skill 包。

也就是说：

- 映记这边已经准备好了接口与用户令牌体系
- OpenClaw 那边还需要用户自己配置一个工作流 / skill / HTTP 调用动作

如果后续要继续做，可以升级为：

1. 一键复制 OpenClaw skill 模板
2. 支持“语音转日记草稿”
3. 支持“先发到收件箱，晚点整理成正式日记”
