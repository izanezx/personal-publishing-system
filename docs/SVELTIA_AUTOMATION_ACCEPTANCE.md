# Sveltia CMS 自动化落地验收

核对日期：2026-11-25
方案：Personal Publishing System · Sveltia CMS 自动化落地计划
项目：`izanezx/personal-publishing-system`

本文件是 A0–A8 的唯一验收矩阵。状态含义：

- **已完成**：代码、配置和可复核证据均存在。
- **待远程验收**：本分支已通过本地检查，尚需合并后由 GitHub/Cloudflare 运行验证。
- **外部输入**：只能由站点所有者提供或授予。

## 所有者已确认的最终决策

| 决策       | 当前口径                                              |
| ---------- | ----------------------------------------------------- |
| 仓库       | 公开并启用 Public template                            |
| 维护者     | 仅站点所有者                                          |
| CMS 工作流 | Simple Workflow，保存直接提交 `main`                  |
| 发布链路   | Save → `main` → CI → 生产部署 → Smoke Test → 失败回滚 |
| 内容       | 中文为源头；英文可先由 Sveltia AI 翻译，再人工审核    |
| 媒体       | Cloudflare R2，公开域 `media.zanezx.com`              |
| 域名       | 仅 `zanezx.com`，不绑定 `www`                         |
| 首次索引   | `PUBLIC_INDEXING_ENABLED=false`，等待所有者批准       |

直接提交 `main` 是对原计划“CMS PR → 自动合并”的有意简化，用来满足日常写作
不操作 Git、不创建 PR 的要求。代码、Schema、依赖和 Workflow 修改仍通过 Pull
Request 和独立 Preview 验证。

## A0–A8 验收矩阵

| 阶段                      | 状态       | 已完成内容                                                                                                                                                            | 尚需证据或输入                               |
| ------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| A0 基线与 Agent 规范      | 已完成     | 独立仓库历史、Node/pnpm 锁文件、38 个 vendored Skills、内容哈希锁、固定上游来源和 `AGENTS.md` 已提交                                                                  | 无                                           |
| A1 内容状态与 Schema      | 已完成     | 统一生命周期解析；Alias、301、410、404、404/301 分支；Draft、Scheduled、Published、Unlisted、Archived、Expired、Withdrawn；翻译状态；过期和归档时间；R2 媒体 URL 限制 | 本分支 CI 通过后归档为远程证据               |
| A2 Sveltia 配置与编辑体验 | 已完成     | 单栏全宽编辑器；可选预览；长短字段、双语、状态视图、自动 Alias、Callout、表格、R2 路径和自定义发布指南                                                                | 合并后在线上 `/admin/` 做一次浏览器复验      |
| A3 GitHub App 登录        | 已完成     | 限定单仓库的 GitHub App；Cloudflare Auth Worker；允许域；GitHub Client ID 和加密 Secret；CMS 登录已由所有者验证                                                       | 后续每次轮换时复查                           |
| A4 R2 与媒体              | 已完成     | Bucket、CORS、公开域、限定 Bucket 的 S3 凭据、WebP 转换、20 MB 上限、媒体来源构建检查                                                                                 | 正式内容上传时继续检查版权、替代文本和隐私   |
| A5 PR Preview 自动化      | 待远程验收 | CI 构建并校验 Preview artifact；Preview Workflow 只从同仓库可信 PR 读取 artifact；强制 noindex；回写 URL 和 Commit Status                                             | 本分支 CI、Preview 和 Commit Status 运行结果 |
| A6 自动发布与回滚         | 待远程验收 | `main` 使用同一次 CI artifact；校验 commit、mode、indexing、SHA-256；记录 Worker Version；Smoke 失败自动回滚                                                          | 本分支合并后的生产运行结果                   |
| A7 定时发布与归档         | 待远程验收 | 15 分钟检查 `activateAt`、`expireAt`、`archiveAt`；无到期内容不部署；运行时不修改内容文件                                                                             | 合并后人工 Dispatch 一次生产 Workflow        |
| A8 上线与文档             | 部分完成   | README、中文发布、Sveltia、R2、账号、Release 和本验收矩阵已更新；稳定版流程已定义                                                                                     | 最终身份、内容、索引批准、稳定版批准         |

## 接口与内容模型

### 内容 Collection

- `blog`：Markdown 与 MDX，使用同一个生命周期 Schema。
- `galleries`：图库元数据和本地或 R2 媒体。
- `pages`：About 与 Now。
- `tombstones`：删除、过期和撤下记录。

### 生命周期

| 状态                               | 生产路由   | 列表   | RSS/活动流 | Sitemap | 搜索   | robots 行为                     |
| ---------------------------------- | ---------- | ------ | ---------- | ------- | ------ | ------------------------------- |
| `draft`                            | 否         | 否     | 否         | 否      | 否     | 不生成；Preview 才生成          |
| `scheduled`                        | 到点后     | 到点后 | 到点后     | 到点后  | 到点后 | Preview 可直链但 noindex        |
| `published`                        | 是         | 是     | 是         | 是      | 是     | 跟随全站索引设置                |
| `unlisted`                         | 是         | 否     | 否         | 否      | 否     | `noindex, follow`               |
| `archived`                         | 是         | 否     | 否         | 否      | 否     | 显示归档提示，`noindex, follow` |
| `expired`                          | 410 或 301 | 否     | 否         | 否      | 否     | `noindex, nofollow`             |
| `withdrawn`                        | 410 或 301 | 否     | 否         | 否      | 否     | `noindex, nofollow`             |
| 删除且无 tombstone                 | 404        | 否     | 否         | 否      | 否     | 标准 404                        |
| tombstone `deleted` + `redirectTo` | 301        | 否     | 否         | 否      | 否     | 永久跳转                        |

### 翻译

- `zh-cn` 为默认语言，根路径发布。
- `en` 使用 `/en/`。
- 英文只有在 `translationStatus=published` 或 `not-required` 时才公开。
- `pending`、`ai-draft` 和 `reviewed` 都不公开；`reviewed` 表示可继续审核，
  仍需显式改为 `published`。

### 永久链接

- `uid` 永久稳定，不能因文件移动而改变。
- `slug` 决定公开路径。
- Sveltia 修改 slug 时通过 `preview_path` 自动维护字符串数组 `aliases`。
- Sveltia 集合不能同时把 `aliases` 定义为普通表单字段，否则自动维护会失效。
- `previousSlugs` 仅保留给旧内容兼容。
- Alias、旧 slug、当前页面和 tombstone 之间有冲突时构建失败。

## 自动化链路

```text
/admin/ 编辑
  → 浏览器自动备份未保存内容
  → Save 直接提交 main
  → Linux + Windows CI
  → 生产 candidate（commit + mode + policy + SHA-256）
  → Cloudflare production workflow 下载同一 artifact
  → 记录旧 Worker Version
  → 部署 zanezx.com
  → 线上 Smoke Test
  → 失败自动回滚
```

代码或 Workflow 的 PR 使用另一条链路：

```text
PR
  → CI 构建 production 与 preview 两份 artifact
  → Preview Workflow 下载 PR preview artifact
  → 部署共享 Preview Worker
  → 强制 noindex
  → Smoke Test
  → 回写 PR 地址和 Commit Status
```

## 测试矩阵

| 范围             | 覆盖                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| 单元测试         | 生命周期优先级、时间边界、翻译、Alias 冲突、301/410/404、RSS 排序、候选 artifact 篡改、Sitemap 策略、定时到期 |
| Astro 检查       | Content Collection、Schema、Markdown/MDX、路由、OG、基础路径                                                  |
| Playwright       | 双语、搜索、目录、主题、图库、移动端、Admin、草稿/排期隔离、归档和未列出状态、性能预算                        |
| Preview          | Draft/Scheduled 可直达；页面和响应 noindex；列表、RSS、Sitemap 和搜索排除                                     |
| Release drill    | 本地 Wrangler 验证 Preview 策略、生产 HTTP、Alias、归档、410、404、checksum 和回滚                            |
| GitHub CI        | Linux 全量、Windows 构建、production candidate、preview candidate                                             |
| Production Smoke | 首页、中英文页面、文章、搜索、RSS、Sitemap、Admin、301、410、404、运行时索引策略                              |

## 本分支合并前必须通过

```bash
pnpm cms:check
pnpm test
pnpm lint
pnpm format:check
pnpm build
pnpm media:check
pnpm test:e2e
PUBLIC_INDEXING_ENABLED=false pnpm test:release
PUBLIC_INDEXING_ENABLED=false PUBLIC_PREVIEW_CONTENT=true pnpm build
node scripts/preview-policy.mjs
PUBLIC_PREVIEW_CONTENT=true pnpm exec playwright test tests/e2e/preview-content.spec.ts
```

Linux CI、Windows CI、Preview Workflow、生产 Workflow、Production Smoke 和 Worker
回滚记录是最终远程验收证据。本 VM 的 Pagefind 原生二进制兼容问题通过同版本
Pagefind Extended + QEMU 执行，不改变 CI 中的原生 Linux/Windows 路径。

## 只能由所有者提供或批准

1. 最终公开显示名、作者身份、中英文简介和站点简介。
2. 公开社交链接、联系邮箱和私密安全/行为准则渠道。
3. Logo、favicon、社交分享图及其使用权。
4. 首批正式内容、图片版权、署名、许可证和隐私清理结果。
5. 是否保留 Bento、Timeline、Tabs 和 Gallery 作为 `v0.1.0` 范围。
6. AI 翻译服务选择；API Key 只在 Sveltia 浏览器中输入。
7. 第一次允许搜索引擎公开索引的日期。
8. 对稳定版 `v0.1.0` 的发布批准。

在以上批准完成前，站点保持 `noindex, nofollow`，当前标签
`v0.1.0-rc.1` 不能替代最终稳定版。
