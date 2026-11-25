# Sveltia CMS 自动发布账号配置

本文件列出必须由账号所有者完成的设置。已经由项目或本次部署完成的项目会标为
`[已完成]`。

## 已完成的仓库与基础设施

- `[已完成]` GitHub 仓库公开为 `izanezx/personal-publishing-system`。
- `[已完成]` 仓库启用自动合并和合并后删除分支。
- `[已完成]` `main` 要求 `Linux checks` 和 `Windows build`。
- `[已完成]` `preview` 和 `production` Environment 已存在。
- `[已完成]` Environment Secret：
  - `preview/CLOUDFLARE_API_TOKEN_PREVIEW`
  - `production/CLOUDFLARE_API_TOKEN_PRODUCTION`
- `[已完成]` Repository Variables：
  - `CLOUDFLARE_ACCOUNT_ID`
  - `PREVIEW_URL`
  - `PUBLIC_INDEXING_ENABLED=false`
- `[已完成]` R2 Bucket、CORS、`media.zanezx.com` 和公开读取。
- `[已完成]` 认证 Worker 部署到 `sveltia-auth.zanezx.com`。

## 1. 创建 GitHub App

打开：

```text
https://github.com/settings/apps/new
```

填写：

| 字段                                           | 值                                                      |
| ---------------------------------------------- | ------------------------------------------------------- |
| GitHub App name                                | `zanezx-publishing-cms`，如被占用则追加日期             |
| Homepage URL                                   | `https://github.com/izanezx/personal-publishing-system` |
| Identifying and authorizing users callback URL | `https://sveltia-auth.zanezx.com/callback`              |
| Expire user authorization tokens               | 开启                                                    |
| Request user authorization during installation | 关闭                                                    |
| Device Flow                                    | 关闭                                                    |
| Webhook Active                                 | 关闭                                                    |

Repository permissions：

| 权限          | 级别                |
| ------------- | ------------------- |
| Metadata      | Read-only，自动选择 |
| Contents      | Read and write      |
| Pull requests | Read and write      |
| Workflows     | No access           |

选择 **Only on this account**，创建 App，然后在 **Install App** 中只选择：

```text
izanezx/personal-publishing-system
```

不要选择 All repositories。

创建后保存：

- Client ID
- Client secret

不要把 Client secret 发到公开 Issue、聊天记录或提交到 Git。

## 2. 把 GitHub App 密钥写入 Worker

推荐在 Cloudflare Dashboard 的 Worker Settings 中添加加密 Secret：

```text
GITHUB_CLIENT_ID=<Client ID>
GITHUB_CLIENT_SECRET=<Client secret>
```

也可以在受信任终端交互执行：

```bash
pnpm dlx wrangler@4.165.0 secret put GITHUB_CLIENT_ID \
  --config infra/sveltia-auth/wrangler.toml

pnpm dlx wrangler@4.165.0 secret put GITHUB_CLIENT_SECRET \
  --config infra/sveltia-auth/wrangler.toml
```

命令会交互读取值，不需要把 Secret 写进命令行。

`ALLOWED_DOMAINS` 已配置为：

```text
zanezx.com,personal-publishing-system-preview.zanezx.workers.dev,localhost,cms.netlify.com
```

## 3. 创建 R2 凭据

按 [R2 媒体说明](MEDIA_R2.zh-CN.md) 创建只允许
`personal-publishing-media` 的 Object Read & Write Token。

需要：

- 将 Access Key ID 更新到 `public/admin/config.yml`。
- 将 Secret Access Key 留在安全位置，第一次打开 Sveltia 媒体库时输入。

## 4. GitHub Actions 变量检查

Repository → Settings → Secrets and variables → Actions → Variables：

| Variable                  | 值                                                              |
| ------------------------- | --------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`   | `e9e4d464cf14a55127f534b7f3f63378`                              |
| `PREVIEW_URL`             | `https://personal-publishing-system-preview.zanezx.workers.dev` |
| `PUBLIC_INDEXING_ENABLED` | 上线前保持 `false`                                              |

Environment Secrets 不应改成 Repository Secrets。`preview` 和 `production` 使用
不同 Cloudflare Token。

## 5. 重建 Cloudflare Actions Token

当前 `preview/CLOUDFLARE_API_TOKEN_PREVIEW` 曾被填入说明文字，Wrangler 会以
`contains a character that cannot be used in an HTTP Authorization header`
拒绝部署。必须重新创建下列两个 Token，并把完整 Token 值分别写入对应
Environment。

Cloudflare Dashboard → My Profile → API Tokens → Create Token →
Create Custom Token：

| Token                         | Account 权限          | Zone 权限                                    |
| ----------------------------- | --------------------- | -------------------------------------------- |
| Preview Worker 部署           | Workers Scripts: Edit | 无                                           |
| Production Worker 部署        | Workers Scripts: Edit | Zone: Read；Workers Routes: Edit             |

两个 Token 都只授权 Account
`e9e4d464cf14a55127f534b7f3f63378`。Production Token 的 Zone 只授权
`zanezx.com`。不要添加 R2、D1 或其他与部署无关的权限。

创建后立即把完整 Token 写入：

```text
https://github.com/izanezx/personal-publishing-system/settings/environments
```

- `preview` → `CLOUDFLARE_API_TOKEN_PREVIEW`
- `production` → `CLOUDFLARE_API_TOKEN_PRODUCTION`

不要把 Token 发到对话、Issue 或提交中。不要复制 Dashboard 中的省略号，
也不要粘贴“下一步”等说明文字。更新后重新运行失败的工作流即可。

## 6. 验收顺序

1. 把本分支合并到 `main`。
2. 等新 Workflow 出现在默认分支。
3. 新建一条测试内容 PR。
4. 确认 Preview Workflow 成功并评论 Preview URL。
5. 确认 `/admin/` 可以使用 GitHub App 登录。
6. 在图片字段上传测试图片，确认 `media.zanezx.com/cms/...` 可访问。
7. 把测试内容推进到 Pending Publish。
8. 确认 CI 通过后自动 squash merge。
9. 确认生产 Workflow 部署并完成 Smoke Test。
10. 检查生产页面、RSS、Sitemap、搜索和 Worker Version。
11. 删除测试内容，验证下线流程。

## 7. 首次正式索引

正式内容、品牌信息、联系方式、图片授权和隐私检查完成后，才允许：

1. 把 `PUBLIC_INDEXING_ENABLED` 改为 `true`。
2. 运行一次生产部署。
3. 验证 `robots.txt`、Sitemap 和页面不再带 `noindex`。
4. 在 Search Console 和 Bing Webmaster Tools 提交 Sitemap。

在所有者明确批准之前，不要打开正式索引。
