# 微信文章报名落地页

这是一个可直接挂在微信公众号“阅读原文”下的移动端 H5。它包含课程介绍、报名表单、渠道追踪、隐私说明、服务器端 SQLite 线索存储、重复提交保护和基础限流。

## 修改页面内容

课程标题、时间、地点、讲师和品牌文字集中在 `site.config.ts`。修改后重启开发服务或重新构建即可。

主要页面样式位于 `app/globals.css`，页面结构位于 `app/page.tsx`。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm ci
npm run db:generate
npm run dev
```

浏览器访问 `http://localhost:3000`。

## 数据库

报名数据默认保存在项目 `data/leads.sqlite`，服务器部署时保存在 Docker 的 `lead_data` 持久化卷中。应用启动时会按顺序执行 `drizzle` 目录中的迁移，首次启动会自动创建 `leads` 表和索引。修改 `db/schema.ts` 后必须生成并检查新的前向迁移：

```bash
npm run db:generate
```

不要修改已经部署过的历史迁移。

## 邮件通知

每次预约成功保存到数据库后，后端会通过 Web3Forms 把姓名、手机号、公司、职位、预算、方便联系时间和来源信息发送到与表单 Access Key 绑定的 `379381070@qq.com`。数据库中的 `notification_status`、`notification_provider_id`、`notification_error` 和 `notification_sent_at` 字段用于记录投递结果。

本地开发时，复制 `.env.example` 为 `.env.local`，再填写 Web3Forms 的表单 Access Key。服务器部署时，把 `deploy.env.example` 复制为 `.env`，填写域名和 Access Key：

```text
DOMAIN=course.example.com
WEB3FORMS_ACCESS_KEY=表单AccessKey
```

Web3Forms 表单必须绑定并验证实际接收通知的邮箱。`.env` 和 `.env.local` 已被 Git 忽略。报名时，页面会先把记录保存到自己的服务器并完成防重复和限流检查，再由访问者浏览器调用 Web3Forms 发信；这样不会受到服务器出口 IP 被 Web3Forms 安全验证拦截的影响。Web3Forms 的 Access Key 按官方设计属于可在客户端使用的公开表单标识，不应把它当作账号密码使用。

## 部署到自己的 Linux 服务器

服务器需要安装 Docker Engine 和 Docker Compose，并开放 TCP 80、443 端口。把域名的 A 记录指向服务器公网 IP 后，在服务器中执行：

```bash
git clone https://github.com/Eors583/wechat-h5.git
cd wechat-h5
cp deploy.env.example .env
# 编辑 .env，填写 DOMAIN 和 WEB3FORMS_ACCESS_KEY
docker compose up -d --build
```

Caddy 会自动申请和续期 HTTPS 证书，应用只在 Docker 内网监听 3000 端口。SQLite 数据保存在 `lead_data` 卷中，重新构建容器不会删除数据。

更新版本时执行：

```bash
git pull --ff-only
docker compose up -d --build
```

健康检查地址为 `https://你的域名/api/health`，正常时返回 `{"ok":true}`。

## 挂到微信公众号文章

1. 先把站点部署成任何人都能访问的 HTTPS 地址。
2. 在公众号图文编辑页开启“原文链接”。
3. 粘贴带渠道参数的地址，例如：

```text
https://course.example.com/?utm_source=my_official_account&utm_medium=wechat_article&utm_campaign=202609
```

4. 在微信 iOS、微信 Android 和普通手机浏览器各提交一次测试线索，确认页面、数据库和联系方式都正确。

## 查看报名记录

登录服务器后，可以从应用容器挂载的 SQLite 数据库查询 `leads` 表。导出前请遵守隐私说明并限制数据访问权限。常用查询：

```sql
SELECT
  name,
  phone,
  company,
  job_title,
  contact_time,
  utm_source,
  utm_campaign,
  created_at
FROM leads
ORDER BY created_at DESC;
```

## 上线前必须修改

- `site.config.ts` 中的品牌、课程、日期、地点和讲师资料。
- `app/privacy/page.tsx` 中与你实际运营主体相符的隐私说明。
- 把域名 A 记录指向服务器，并在微信内完成真实提交测试。
- 为 Docker 的 `lead_data` 卷配置定期备份。
