# Cloudflare R2 媒体存储

## 当前资源

| 项目       | 值                                 |
| ---------- | ---------------------------------- |
| Account ID | `e9e4d464cf14a55127f534b7f3f63378` |
| Bucket     | `personal-publishing-media`        |
| 公开域名   | `https://media.zanezx.com`         |
| CMS 前缀   | `cms/`                             |
| 最小 TLS   | 1.2                                |

Bucket、公开域名和 CORS 已配置。对象可以直接从 `media.zanezx.com` 读取，CMS
使用 S3 兼容 API 上传、列出、重命名和删除对象。

## CORS

仓库中的 [R2 CORS 配置](../infra/r2-cors.json) 允许：

- `https://zanezx.com`
- `https://personal-publishing-system-preview.zanezx.workers.dev`
- `http://localhost:4321`

允许 `GET`、`PUT`、`DELETE` 和 `HEAD`，并暴露 `ETag`。

更新 CORS：

```bash
pnpm dlx wrangler@4.165.0 r2 bucket cors set \
  personal-publishing-media \
  --file infra/r2-cors.json \
  --force
```

## 创建限定到单个 Bucket 的凭据

在 Cloudflare Dashboard：

1. 进入 **R2 Object Storage**。
2. 打开 **Manage R2 API Tokens**。
3. 创建 API Token。
4. 权限选择 **Object Read & Write**。
5. 只允许 `personal-publishing-media`。
6. 创建后立即保存 **Access Key ID** 和 **Secret Access Key**。

Access Key ID 可以写入 `public/admin/config.yml`。Secret Access Key 不能提交到
仓库、不能写入 GitHub Actions，也不能发送到公开渠道。由站点所有者第一次打开
Sveltia 媒体库时输入。

配置位置：

```yaml
media_libraries:
  cloudflare_r2:
    access_key_id: "<ACCESS_KEY_ID>"
    bucket: personal-publishing-media
    account_id: e9e4d464cf14a55127f534b7f3f63378
    public_url: https://media.zanezx.com
    prefix: cms/
```

更换 R2 Token 时，同时更新 `access_key_id` 并在 Sveltia 中重新输入新的 Secret
Access Key。

## 验证

资源检查：

```bash
pnpm dlx wrangler@4.165.0 r2 bucket list
pnpm dlx wrangler@4.165.0 r2 bucket cors list personal-publishing-media
pnpm dlx wrangler@4.165.0 r2 bucket domain list personal-publishing-media
```

公开域名应返回 `404` 表示域名已工作但没有根对象。上传测试对象后，应能通过
`https://media.zanezx.com/<object-key>` 读取。

## 删除规则

当前不启用自动删除。若以后增加生命周期规则，必须区分：

- `cms/`：CMS 上传的公开媒体。
- `drafts/`：可选的非公开工作文件。
- `backups/`：需要保留的导出。

不要让生命周期规则删除仍被已发布文章引用的对象。
