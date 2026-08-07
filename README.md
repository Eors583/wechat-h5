# 微信文章报名落地页

这是一个可直接挂在微信公众号“阅读原文”下的移动端 H5。它包含课程介绍、报名表单、渠道追踪、隐私说明、Cloudflare D1 线索存储、重复提交保护和基础限流。

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

报名数据保存在 Cloudflare D1 的 `leads` 表中。修改 `db/schema.ts` 后必须生成并检查新的迁移：

```bash
npm run db:generate
```

不要修改已经部署过的历史迁移。

## 部署到 Sites

项目已经包含 `.openai/hosting.json`，通过 Codex 的 Sites 发布流程即可自动创建站点、D1 数据库、应用迁移并部署。

部署完成后，可为站点添加自己的二级域名，例如 `course.example.com`。根据 Sites 返回的记录，在域名服务商后台添加 CNAME 或 A/验证记录，等待 HTTPS 生效。

## 部署到自己的 Cloudflare 账号

如果不使用 Sites，也可以在 Cloudflare 创建 D1 数据库，设置 `DB` 绑定，然后使用 Wrangler 构建和发布。部署前需要确认：

1. `.openai/hosting.json` 中的 D1 逻辑绑定名为 `DB`。
2. `drizzle` 目录中已经生成迁移。
3. 生产环境已经执行全部迁移。
4. 域名启用了 HTTPS。

## 挂到微信公众号文章

1. 先把站点部署成任何人都能访问的 HTTPS 地址。
2. 在公众号图文编辑页开启“原文链接”。
3. 粘贴带渠道参数的地址，例如：

```text
https://course.example.com/?utm_source=my_official_account&utm_medium=wechat_article&utm_campaign=202609
```

4. 在微信 iOS、微信 Android 和普通手机浏览器各提交一次测试线索，确认页面、数据库和联系方式都正确。

## 查看报名记录

通过 Sites/Cloudflare 的 D1 数据库控制台查询 `leads` 表。导出前请遵守隐私说明并限制数据访问权限。常用查询：

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
- 使用你自己的域名，并在微信内完成真实提交测试。
