# 文章发布与内容维护指南

本文说明如何新增、修改、排期、下线和部署内容。内容模型以
`src/content.config.ts` 为准。

日常写作和发布以 [Sveltia CMS 写作与发布](SVELTIA.zh-CN.md) 为准。本文件保留
内容模型和本地开发说明；不需要本地命令行也能完成正常内容发布。

## 内容放在哪里

中文内容放在：

```text
src/data/blog/zh-cn/
```

英文内容放在：

```text
src/data/blog/en/
```

文章可以使用 `.md` 或 `.mdx`。普通文章优先使用 Markdown；需要 Astro 组件、
交互演示或图库嵌入时才使用 MDX。

所有 Blog 条目的公开路径都由 `slug` 决定：

| 语言 | 公开路径            |
| ---- | ------------------- |
| 中文 | `/posts/{slug}/`    |
| 英文 | `/en/posts/{slug}/` |

文件所在子目录不会改变公开 URL，因此移动或整理文件夹时不必修改 URL。

## 内容类型

`kind` 支持：

| `kind`     | 用途                  | 主要展示位置              |
| ---------- | --------------------- | ------------------------- |
| `article`  | 长文、Essay、研究文章 | 首页、文章列表、标签、RSS |
| `note`     | 短笔记和观察          | 首页、Notes               |
| `project`  | 项目介绍和进展        | 首页、Projects            |
| `resource` | 资料和参考链接        | 首页、Library             |
| `pattern`  | 模式或可复用经验      | 公共内容流                |
| `link`     | 链接型条目            | 公共内容流                |
| `quote`    | 摘录或短引用          | 公共内容流                |

`research` 不是 `kind`；研究内容使用任一合适的 `kind`，并在 `topics` 中加入
`research`，就会出现在 Research 页面。

## 新建中文文章

创建文件：

```text
src/data/blog/zh-cn/my-new-article.md
```

推荐 Frontmatter：

```yaml
---
uid: zh-my-new-article
slug: my-new-article
kind: article
title: "文章标题"
description: "用于列表、搜索和社交预览的一句话摘要。"
pubDatetime: 2026-11-24T10:00:00+08:00
tags: ["个人出版"]
topics: ["publishing", "web-platform"]
stage: seedling
translationKey: my-new-article
previousSlugs: []
---
这里开始写正文。
```

公开 URL：

```text
https://zanezx.com/posts/my-new-article/
```

### 必填字段

| 字段          | 说明                                                  |
| ------------- | ----------------------------------------------------- |
| `uid`         | 全站唯一且永久稳定；中文和英文版本也必须使用不同 UID  |
| `slug`        | 单个 URL 段，只使用字母、数字和连字符；发布后尽量不变 |
| `title`       | 文章标题                                              |
| `description` | 列表、搜索、SEO 和社交预览摘要                        |
| `pubDatetime` | 首次发布时间；推荐带 `+08:00` 时区                    |

`kind` 默认是 `article`，`stage` 默认是 `seedling`；发布文章时仍建议明确写出。

### 常用可选字段

| 字段             | 用途                                                   |
| ---------------- | ------------------------------------------------------ |
| `modDatetime`    | 实质修改时间；不要因为修正错别字而随意改变文章活动时间 |
| `featured`       | 是否在首页精选区域展示                                 |
| `draft`          | `true` 时不出现在页面、RSS、Sitemap 和搜索中           |
| `tags`           | 文章标签；可使用中文或英文                             |
| `topics`         | Garden 主题 ID；只能使用已有主题                       |
| `stage`          | `seedling`、`budding` 或 `evergreen`                   |
| `translationKey` | 同一文章的中英文版本使用相同值                         |
| `previousSlugs`  | 文章改 URL 后保留旧地址，用于生成 301 重定向           |
| `relationships`  | 通过目标 UID 建立 `related` 或 `evolvedFrom` 关系      |
| `coverImage`     | 文章本地封面图                                         |
| `ogImage`        | 社交分享图或自定义 OG 图                               |
| `canonicalURL`   | 外部原发文章的规范 URL                                 |
| `hideToc`        | 是否隐藏目录                                           |
| `hideEditPost`   | 是否隐藏编辑链接                                       |
| `timezone`       | 覆盖默认 `Asia/Shanghai` 的 IANA 时区                  |

## Topics 与 Garden

当前主题 ID 只有：

```text
research
publishing
web-platform
reading-practice
visual-notes
```

使用不存在的 Topic 会使构建失败。增加新 Topic 时，先在
`src/lib/content/topics.ts` 中同时添加中文和英文名称，再在文章中使用。

直接写 `maturity` 是无效字段，正确字段名是 `stage`。

## 建立关联

通过目标文章的 `uid` 建立关系：

```yaml
relationships:
  - kind: related
    uid: zh-publishing-baseline
  - kind: evolvedFrom
    uid: zh-reading-note
```

- `related`：相关阅读。
- `evolvedFrom`：当前文章从哪篇旧内容发展而来。
- 目标 UID 必须存在。
- 不能关联自己。
- 同一关系不能重复。

## 发布英文版本

同一篇文章的中英文文件使用：

- 不同的 `uid`，例如 `zh-my-new-article` 和 `en-my-new-article`
- 相同的 `kind`
- 相同的 `translationKey`
- 各自的 `slug`，建议保持一致

示例：

```text
src/data/blog/zh-cn/my-new-article.md
src/data/blog/en/my-new-article.md
```

```yaml
# 英文文件
---
uid: en-my-new-article
slug: my-new-article
kind: article
translationKey: my-new-article
title: "My New Article"
description: "A short summary for listings and search."
pubDatetime: 2026-11-24T10:00:00+08:00
tags: ["Publishing"]
topics: ["publishing", "web-platform"]
stage: seedling
---
```

英文 URL：

```text
https://zanezx.com/en/posts/my-new-article/
```

只发布中文时，可以省略 `translationKey`。以后补英文时，再给两个版本添加相同
`translationKey`。

## 图片、封面与 Gallery

- Sveltia CMS 上传的图片放在 Cloudflare R2，公开地址以
  `https://media.zanezx.com/cms/` 开头。
- 旧本地内容仍可使用仓库内图片，但新图片默认使用 R2。
- 每张有意义的图片必须有说明性替代文本。
- 保存创作者、来源、许可证和署名记录。
- 上传前清除位置、设备和隐私元数据。

创建、轮换和验证 R2 凭据见 [R2 媒体存储](MEDIA_R2.zh-CN.md)。

Gallery 使用独立目录：

```text
src/data/galleries/zh-cn/my-gallery/index.md
src/data/galleries/zh-cn/my-gallery/01-photo.jpg
```

```yaml
---
uid: zh-gallery-my-gallery
slug: my-gallery
translationKey: my-gallery
title: "图库标题"
description: "图库摘要"
pubDatetime: 2026-11-24T10:00:00+08:00
tags: ["摄影"]
topics: ["visual-notes"]
stage: budding
media:
  - src: "./01-photo.jpg"
    alt: "图片内容的准确描述"
    credit: "作者名称"
    license: "许可证"
    source: "https://example.com/source"
---
```

MDX 文章可以嵌入同语言中已发布的 Gallery：

```mdx
<GalleryEmbed slug="my-gallery" limit={3} />
```

## 草稿、定时与归档

当前统一使用 `status`：

```yaml
status: draft
```

定时公开：

```yaml
status: scheduled
scheduledFor: 2026-12-01T09:00:00+08:00
```

未来的 `scheduledFor` 或 `pubDatetime` 不会提前进入页面、RSS、Sitemap 或搜索。
定时检查每 15 分钟运行一次；到点后自动触发生产重建和线上验证。

其他状态为 `published`、`unlisted`、`archived`、`expired` 和 `withdrawn`。
完整行为见 [Sveltia CMS 写作与发布](SVELTIA.zh-CN.md)。

## 修改已发布文章

日常更新：

1. 保留 `uid`、`slug` 和 `translationKey`。
2. 修改标题或正文。
3. 对实质性修改填写 `modDatetime`。
4. 在 Sveltia 中保存，推进到 Pending Publish，等待自动合并和部署。

不要因为标题、文件夹或摘要变化就修改 `slug`。公开 URL 应保持稳定。

### 必须修改 URL 时

保留原 `uid`，设置新 `slug`，并把旧 slug 加入 `previousSlugs`：

```yaml
slug: new-address
previousSlugs: ["old-address"]
```

系统会生成旧地址到新地址的 301 重定向。不要删除旧值或重复使用旧 slug。

### 下线或删除内容

使用 `status: expired` 或 `status: withdrawn`。`redirectTo` 有值时返回 301；
留空时返回 410。已经删除文件的内容使用 tombstone。详细操作见
[Sveltia CMS 写作与发布](SVELTIA.zh-CN.md)。

## 本地检查

第一次在新机器上运行：

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
```

新增或修改内容：

```bash
git switch main
git pull --ff-only
git switch -c content/my-new-article
pnpm dev
```

开发服务器地址是 `http://localhost:4321`。

提交 PR 前运行：

```bash
pnpm security:audit
pnpm skills:check
pnpm test
pnpm format
pnpm lint
pnpm format:check
pnpm build
pnpm test:e2e
pnpm test:release
```

`pnpm dev` 不会生成最终 Pagefind 搜索索引。检查搜索时运行
`pnpm build && pnpm preview`。

至少人工检查：

- 中文与英文路由
- 文章标题、摘要、日期和作者
- 语言切换是否指向真实译文
- 目录、内部链接和外部链接
- 图片和替代文本
- 移动端与桌面端
- 深浅色主题
- 搜索结果
- RSS、Sitemap 和 404

## 提交与合并

使用 Sveltia 时，保存内容会自动创建分支和 PR。推进到 Pending Publish 后，
系统只在变更全部位于允许的内容路径时启用自动合并。

手动开发内容时仍然可以执行：

```bash
git add src/data/blog
git commit -m "content: add my new article"
git push -u origin content/my-new-article
```

在 GitHub 打开 PR，等待以下必需检查通过：

- `Linux checks`
- `Windows build`

合并后，主分支 CI 成功会自动触发生产部署和 Smoke Test。

## 发布到 Cloudflare

正常内容发布由 GitHub Actions 自动完成：

1. PR 自动部署到独立 Preview Worker。
2. Pending Publish 触发内容路径校验和 auto-merge。
3. `main` CI 成功后自动部署生产 Worker。
4. 线上 Smoke Test 失败时自动回滚。

CLI 只用于基础设施维护、故障诊断或首次配置，不再是日常发布步骤。

当前唯一域名是 `https://zanezx.com/`。不要重新添加
`www.zanezx.com`；若 CLI 登录过期，使用：

```bash
pnpm dlx wrangler@4.165.0 login --device --browser=false
```

## 发布后验证

至少检查：

```text
https://zanezx.com/
https://zanezx.com/en/
https://zanezx.com/posts/{slug}/
https://zanezx.com/en/posts/{slug}/
https://zanezx.com/search/
https://zanezx.com/rss.xml
https://zanezx.com/en/rss.xml
https://zanezx.com/sitemap-index.xml
```

同时检查 HTTP 状态、canonical、hreflang、RSS、Sitemap、搜索结果和移动端。

## 回滚

生产 Workflow 在 Smoke Test 失败时会自动回滚到部署前 Version。人工回滚只用于
Workflow 之外的故障；先查看最近的 Worker Versions：

```bash
pnpm dlx wrangler@4.165.0 versions list --name personal-publishing-system
pnpm dlx wrangler@4.165.0 rollback <version-id> \
  --name personal-publishing-system
```

内容错误也可用一次修复 PR 重新发布。不要通过强推 `main` 或删除历史来修复生产
问题。

## 版本规则

- 日常新增或修改文章：使用普通内容提交，不必给每个文章创建软件版本标签。
- 站点功能、架构、依赖或发布流程变化：通过 PR 合并，并按发布计划创建里程碑版本。
- 稳定的平台版本由维护者批准后再创建 Git 标签和 GitHub Release。
