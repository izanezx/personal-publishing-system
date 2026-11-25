# Sveltia CMS 写作与发布

Sveltia CMS 地址：

```text
https://zanezx.com/admin/
```

站点使用下面的完整链路：

```text
Sveltia CMS
  -> GitHub App 登录
  -> 内容分支与 Pull Request
  -> 自动 Preview
  -> 人工推进到 Pending Publish
  -> 文内容路径校验
  -> CI 通过后自动合并
  -> main CI 通过后自动生产部署
  -> 线上 Smoke Test
  -> 失败自动回滚
```

日常写作只需要 Sveltia CMS 和 GitHub 登录，不需要在本地执行构建、提交、PR、
合并或部署命令。

## 第一次登录

1. 打开 `https://zanezx.com/admin/`。
2. 选择使用 GitHub 登录。
3. 授权已安装到本仓库的 GitHub App。
4. 首次打开媒体库时输入 R2 Secret Access Key。Access Key ID 已由站点配置
   提供，Secret Access Key 只保存在当前浏览器的安全存储中。

GitHub App 只安装到 `izanezx/personal-publishing-system`，不授予其他仓库访问
权限，也没有 Workflow 编辑权限。

## 新建内容

1. 在“发布内容”中点击新建。
2. 默认语言是中文。
3. 填写 `slug`、标题、摘要、首次发布时间和正文。
4. 如果需要英文版本，在同一个条目中切换到英文并填写英文内容。
5. 保存后条目进入 GitHub Pull Request 草稿。

普通文章保存为 Markdown。需要 Astro 组件、交互演示或 MDX 的内容仍由代码维护，
不在 Sveltia CMS 中直接编辑。

## 两个不同的“状态”

不要把编辑流程状态和文章发布状态混在一起。

### 编辑流程

| Sveltia 阶段    | 表示什么           | 自动化行为                                       |
| --------------- | ------------------ | ------------------------------------------------ |
| Draft           | 内容尚未准备好评审 | 保留在 PR 草稿中                                 |
| Pending Review  | 等待内容或翻译审核 | 不自动合并                                       |
| Pending Publish | 已经批准发布       | 验证仅修改允许的内容文件后启用 squash auto-merge |

自动合并仍会等待 `Linux checks` 和 `Windows build`。检查失败时不会合并。

如果从 Pending Publish 移回其他阶段，自动合并请求会被取消。

### 文章发布状态

| `status`    | 页面             | 列表     | 搜索   | RSS          | Sitemap | 索引      |
| ----------- | ---------------- | -------- | ------ | ------------ | ------- | --------- |
| `draft`     | 不生成           | 否       | 否     | 否           | 否      | 否        |
| `scheduled` | 到点并重建后生成 | 到点后   | 到点后 | 到点后       | 到点后  | 到点后    |
| `published` | 生成             | 是       | 是     | 是           | 是      | 是        |
| `unlisted`  | 可访问           | 否       | 否     | 否           | 否      | `noindex` |
| `archived`  | 生成             | 归档视图 | 是     | 可进入归档流 | 是      | 是        |
| `expired`   | 410 或 301       | 否       | 否     | 否           | 否      | 否        |
| `withdrawn` | 410 或 301       | 否       | 否     | 否           | 否      | 否        |

`expireAt` 到点时，Worker 会根据运行时 manifest 立即开始返回 410 或 301，不必
等到下一次重建。定时发布时间到达后，每 15 分钟运行的检查会触发一次生产重建，
使新页面出现。

### 英文翻译状态

中文始终按文章发布状态处理。英文额外受 `translationStatus` 控制：

| `translationStatus` | 英文公开 |
| ------------------- | -------- |
| `pending`           | 否       |
| `ai-draft`          | 否       |
| `reviewed`          | 否       |
| `published`         | 是       |
| `not-required`      | 是       |

AI 生成的英文内容应先保存为 `ai-draft`，人工完成事实、语气、标题、摘要和链接
审核后改为 `published`。

## 永久链接

- `slug` 发布后尽量保持不变。
- 必须修改 URL 时，把旧值加入 `previousSlugs`。
- 中文和英文建议使用相同 slug，但 `uid` 必须不同。
- 两个翻译版本共享同一个 `translationKey`。

## 下线与删除

### 内容保留了文件

在文章本身设置：

```yaml
status: expired
redirectTo: /posts/new-target/
```

- 填写站内路径或 HTTPS URL：旧地址返回 301。
- 留空：返回 410。
- `withdrawn` 使用相同规则。

### 内容文件已删除

在“下线记录”中创建 tombstone：

```yaml
path: /posts/old-address/
status: deleted
redirectTo: /posts/new-address/
```

删除文章文件和 tombstone 应放在同一次内容操作中，避免旧地址先变成 404。

## 图片与附件

媒体文件上传到 Cloudflare R2，公开地址前缀：

```text
https://media.zanezx.com/cms/
```

上传前应：

- 确认拥有发布授权。
- 检查人物隐私和敏感信息。
- 清除不需要的 EXIF 位置数据。
- 为内容图片填写准确的替代文本、署名、许可证和来源。
- 使用有意义的文件名。

## 自动发布后需要检查什么

PR 会收到 Preview 评论，内容包括：

- Preview URL
- 当前提交 SHA
- `Indexing: disabled`

进入 Pending Publish 后，系统自动等待 CI 并合并。生产部署完成时会运行：

- 首页和中英文首页
- 中文和英文文章
- 搜索页
- RSS
- Sitemap
- Runtime manifest
- Admin 页面
- 404、410 和 301
- 索引策略

失败时，Workflow 自动回滚到部署前的 Worker Version。

## 本地替代方式

只有在修改代码、Schema、CMS 配置或工作流时才需要本地命令：

```bash
pnpm cms:check
pnpm test
pnpm build
pnpm test:e2e
pnpm test:release
```
