# Personal Publishing System · Sveltia CMS 自动化落地计划

> **文档性质：** 本文件保存 Sveltia CMS 自动化工作的原始实施计划，作为后续审查和决策来源。
>
> **后续验收：** 实施状态、远程证据和最终偏差以
> [Sveltia CMS 自动化落地验收](SVELTIA_AUTOMATION_ACCEPTANCE.md) 为准。

## 实施后的文档阅读说明

原始计划中的阶段、接口、内容状态和测试范围继续有效。项目所有者后续作出的
以下实施决定优先于原计划中的对应描述：

1. 日常内容使用 Simple Workflow：CMS 保存直接提交 `main`，再经过 CI、自动
   部署和 Smoke Test；代码、Schema、依赖和 Workflow 仍通过 PR 与 Preview。
2. `coverImage`、`ogImage`、Gallery 媒体和 Markdown 正文均允许安全 HTTPS
   外部图片；R2 仍是正式上传的默认方案。
3. A0–A7 的技术实现和正常远程链路已经验收；A8 在最终索引、稳定版和所有者
   资料批准前继续保持部分完成。

## 摘要

项目继续使用 `/data/workspace/personal-publishing-system`，技术栈保持 **Astro + Markdown/MDX + GitHub Actions + Cloudflare Workers + R2 + Sveltia CMS**。仓库继续保持公开和 Public template；Sveltia 的草稿分支、PR 以及草稿引用会公开可见。

最终工作流为：

```text
Sveltia /admin
  → GitHub Vendor PR
  → Linux + Windows CI
  → Cloudflare Preview Worker
  → 自动合并 main
  → 生产构建与验收
  → Cloudflare Worker 正式上线
  → 失败自动回滚
```

当前已确认：

- 公开仓库可继续使用，接受草稿在 CMS 分支可见。
- Sveltia 负责 Markdown 文章的创建、编辑、中英双语、R2 图片和发布。
- MDX 交互文章继续由代码库或 AI Agent 维护，不在 Sveltia 富文本中编辑。
- 在 CMS 点击一次 `Publish` 后自动完成 PR、检查、合并和上线。
- 日常写作不需要执行 Git、pnpm 或 Wrangler 命令。

当前环境已有 35 个项目 Skills，包括 Matt Pocock、Astro、Astro Framework、Cloudflare、Playwright、Security、SEO 和发布相关能力。还需补充：

- Sveltia 官方 Skill：`sveltia/ai-tools@20431da85377c48eac96d659a342f4a8c2d3fb47`
- Cloudflare 官方 `wrangler` 与 `workers-best-practices` Skill：`cloudflare/skills@ff191de7d903788eceaf516a514ae7d3b56b924a`
- 将新 Skill 纳入 `.agents/skills`、更新 [AGENTS.md](/data/workspace/personal-publishing-system/AGENTS.md) 与 `skills-lock.json`

当前没有官方 Sveltia MCP；使用官方 Skill 和文档即可。Cloudflare 操作使用项目固定的 Wrangler CLI，GitHub 使用现有 GitHub 连接器；不需要新增数据库或 CMS 服务端。

## 接口与内容模型

### Sveltia 后台

- 新增 `/admin/` 页面，固定使用 `@sveltia/cms@0.272.0` 和 SRI 完整性校验。
- 固定 Sveltia 版本，升级必须单独提交、验证并更新通知。
- 配置 GitHub App 登录，使用 Cloudflare Worker `sveltia-cms-auth`，固定上游提交 `e62e76ae5ca4dd28e751607b331bb47bb1feddfe`。
- 默认使用单栏全宽编辑器；实时预览默认关闭，避免编辑器过窄，需要时再打开预览或双语并排模式。
- `zh-cn` 为默认语言，`en` 为第二语言；文件使用 `multiple_folders` 映射到现有目录。
- 文章 Collection 明确设置 `extension: md`；现有 MDX 文章不进入该 Collection，以免富文本编辑器破坏 JSX。
- 提供一个主内容 Collection，用 `kind` 区分 Article、Note、Project、Resource、Pattern、Link 和 Quote，并用预设视图筛选。
- Gallery 使用独立 Collection；About/Now 使用文件 Collection。
- 隐藏的 Compute 字段生成永久 `uid`；`slug` 只允许首次创建时修改，发布后默认锁定。
- 配置 `preview_path` 和 `aliases_field: aliases`，Slug 变更时由 Sveltia 自动记录旧路径。
- 设置完整字段校验、必填字段和 `allow_incomplete_drafts: false`，避免无效草稿进入构建。
- 添加 Callout、表格、R2 图片等编辑组件；启用接近站点样式的自定义预览。
- Admin 页面使用独立 CSP、`noindex`、禁止嵌入和 `Cross-Origin-Opener-Policy: same-origin-allow-popups`。

### 内容状态

Sveltia 的审稿状态与文章生命周期分开管理。

| 层级         | 状态      | 行为                                                                      |
| ------------ | --------- | ------------------------------------------------------------------------- |
| CMS 工作流   | Draft     | 保存到 `cms/...` 分支和 Draft PR，不进入生产站                            |
| CMS 工作流   | In Review | PR 预览可查看，仍不进入生产站                                             |
| CMS 工作流   | Ready     | 标记审批，等待必选 CI 检查                                                |
| 内容生命周期 | Scheduled | 到期前不生成公开页面；可通过预览构建查看                                  |
| 内容生命周期 | Published | 生成页面，并进入首页、RSS、Sitemap 和搜索                                 |
| 内容生命周期 | Unlisted  | 可通过直链访问，但 `noindex`，不进入列表、RSS、Sitemap 和搜索             |
| 内容生命周期 | Archived  | 保留正文并显示归档提示，`noindex`，退出首页、RSS、Sitemap 和搜索          |
| 内容生命周期 | Expired   | 由 `expiresAt` 自动推导；采用 Archived 的保留和索引策略，避免落库状态过期 |
| 内容生命周期 | Withdrawn | 配置 `redirectTo` 时返回 301；没有替代地址时返回 410                      |
| 内容删除     | Deleted   | 通过 CMS 删除后返回 404；需要保留 SEO 时使用 Withdrawn                    |

Schema 新增或调整：

- `status`: `scheduled | published | unlisted | archived | withdrawn`
- `archivedAt`: 可选归档时间
- `expiresAt`: 可选自然过期时间
- `translationStatus`: `pending | ai-draft | reviewed | published | not-required`
- `aliases`: Sveltia 自动维护的旧 URL 路径列表
- `redirectTo`: Withdrawn 内容的目标地址
- `coverImage`、`ogImage` 和 Gallery `media.src` 同时接受本地图片和 `https://media.zanezx.com/...`
- 旧 `draft` 字段只保留迁移兼容；新内容使用 `status`，所有筛选统一经过一个生命周期解析函数

所有公开入口，包括文章、语言切换、首页、活动流、RSS、Sitemap、搜索和 JSON-LD，必须共用同一套状态判断。英文只在实际存在且已发布时显示语言链接。

### R2 媒体

- 使用 R2 bucket `personal-publishing-media`。
- 公开读取域名使用 `https://media.zanezx.com`，不使用仅适合开发的 `r2.dev`。
- 对象路径采用 `cms/{locale}/{kind}/{yyyy}/{slug}/`。
- Sveltia 上传时转换为 WebP、质量 88、最大边长 2560、单文件上限 20 MB。
- R2 CORS 仅允许 `https://zanezx.com` 和开发用 `http://localhost:4321`；允许 GET/PUT/DELETE/HEAD、签名所需 Header，并暴露 ETag。
- R2 Access Key ID、bucket、account ID 和 public URL 写入 CMS 配置；Secret Access Key 首次使用时由你在 Sveltia 中输入，不进入仓库或聊天。
- 站点只接受 `media.zanezx.com` 的远程媒体，避免任意外部图片绕过控制。
- 页面组件改为支持远程图片和本地图片；CMS 上传的图片已经是 WebP，因此不再依赖 Astro 在构建时下载和转换 R2 文件。

## 分阶段实施

### A0 · 基线与 Skills

- 创建独立功能分支，确认工作区干净，记录 Node、pnpm、依赖和 Sveltia 固定版本。
- 安装并校验 Sveltia 与 Cloudflare 官方 Skills，保留许可证、来源路径和固定提交。
- 更新 `AGENTS.md` 的活动到 Skill 映射和 Agent 验收规范。

### A1 · 内容状态与 Schema

- 实现统一生命周期解析、路由、列表、Feed、搜索、Sitemap 和 SEO 行为。
- 迁移演示内容和测试数据到新状态模型。
- 加入 Alias、301、410、404、过期和翻译状态测试。
- 保留 `LICENSE`、`NOTICE`、来源记录和上游基线文档，不合并任何上游分支历史。

### A2 · Sveltia 配置与编辑体验

- 新增 `/admin/`、CMS 配置、Admin JavaScript、预览样式和 Callout/表格/媒体组件。
- 完成输入校验、全宽布局、双语字段、AI 翻译入口、状态筛选和发布说明。
- 使用 `test-repo` 后端和 Playwright 验证配置加载、桌面/移动布局和字段保存格式。
- 在文档中明确：Markdown 文章通过 CMS，MDX 技术文章通过代码 PR 或 AI Agent。

### A3 · GitHub App 登录

- 部署固定版本的 `sveltia-cms-auth` Worker。
- GitHub App 仅安装到 `izanezx/personal-publishing-system`。
- 权限严格限制为 Contents Read/Write、Pull requests Read/Write、Metadata Read；不授予 Workflows 权限。
- Auth Worker 配置 `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET` 和 `ALLOWED_DOMAINS=zanezx.com,localhost,cms.netlify.com`。
- 验证登录、刷新 Token、登出、错误回调和浏览器本地会话。

### A4 · R2 与媒体引用

- 创建 bucket、custom domain、CORS、S3 API Token 和 CMS 媒体配置。
- 修改内容 Schema 和所有图片组件以支持 R2 URL。
- 验证上传、选择、替换、删除、Alt 文本、版权字段和 CORS。
- 验证 R2 不可用时构建仍能对公开 URL 给出明确错误，不在 CI 中保存 R2 写权限密钥。

### A5 · PR 预览自动化

- CI 上传校验后的候选 artifact；外部分叉 PR 仍可运行无密钥检查，但不会获得 Cloudflare 凭据。
- CMS 分支或可信同仓库 PR 的 CI 成功后，自动构建非索引 Preview Worker。
- Preview 构建包含 Draft/Scheduled 内容，但强制 `X-Robots-Tag: noindex, nofollow` 并从 robots 移除 Sitemap。
- 将 Preview URL 回写为 GitHub Commit Status，供 Sveltia 显示。
- `Preview deployment` 加入 main 的必选检查。

### A6 · 自动合并与生产发布

- 启用 GitHub Auto-merge，保留现有 Linux、Windows、线性历史、管理员同样受保护等规则。
- Sveltia 点击 Publish 后自动开 PR、等待 CI、合并并删除分支。
- main 的 CI 成功后，生产 Workflow 只下载该次已验证 artifact，校验 commit 和 SHA-256，不使用另一个未验证构建。
- 正式部署前记录当前 Worker Version；部署后验证首页、中英文文章、RSS、Sitemap、搜索、canonical、301、410、404、安全 Header 和正式索引状态。
- 任一生产检查失败时自动回滚到上一 Worker Version，并保留失败记录和更正入口。

### A7 · 定时发布与自动归档

- 每 15 分钟运行一次轻量 GitHub Actions 检查，只在有 Scheduled 到期、Expired 到期或其他生命周期变化时触发生产部署。
- 定时任务不修改内容文件，只重新构建并部署当前 `main`。
- GitHub 定时任务可能延迟，目标发布精度约为 15 分钟；这不是 Cloudflare Pages 的 500 次构建限制，因为站点使用 Workers 和 GitHub Actions。
- 手动点击 Publish 的普通文章仍然立即进入完整自动流程。

### A8 · 首次上线与文档

- 首次正式索引继续由仓库变量 `PUBLIC_INDEXING_ENABLED=false` 阻止。
- 完成隐私联系人、正式内容、Logo、媒体版权和 SEO 信息后，将变量改为 `true`；之后每篇文章只需 CMS 中点击发布。
- 更新 README、中文发布手册、状态说明、媒体说明、自动发布和回滚文档。
- 创建稳定版本标签和 Release。

## 测试与验收

- 回归现有单元、Playwright、Linux、Windows、根路径和子路径构建。
- 单元测试覆盖所有状态优先级、时区边界、双语链接、Alias、301、410、404、R2 URL 和翻译状态。
- Sveltia 配置通过官方 schema 和 Admin 页面双重校验。
- Playwright 验证 `/admin/` 全宽编辑、桌面/移动布局、双语切换和 `test-repo` 保存。
- 实际验证 GitHub App 登录、R2 上传、AI 翻译和 CMS 草稿恢复。
- 使用一篇临时中文文章走完整流程：Draft → Preview → CI → Auto-merge → Production → 线上验收。
- 使用该文章验证更新、英文翻译、定时发布、归档、过期、301、410、删除 404。
- 模拟生产 Smoke 失败，确认自动回滚和 GitHub 失败通知。
- 最终验收标准：日常新增、修改、翻译、预发布和正式发布均可在 `/admin/` 完成，不需要你执行终端命令。

## 需要你提供的支持

| 事项                     | 你的操作                                                                                        | 不提供的阻塞范围                 |
| ------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| GitHub App               | 在 GitHub 创建并安装仅限本仓库的 App，保存 Client ID 与 Secret                                  | CMS 登录、正式端到端验收         |
| Cloudflare Actions Token | 创建 Preview 和 Production 两个最小权限 API Token，分别保存到 GitHub Environments               | 自动化预览、自动上线和回滚       |
| `CLOUDFLARE_ACCOUNT_ID`  | 设置到 GitHub Repository Variable                                                               | Actions 无法选择 Cloudflare 账号 |
| R2                       | 创建 bucket，绑定 `media.zanezx.com`，配置 CORS，创建仅限该 bucket 的 Object Read & Write Token | 图片上传和 CMS 媒体验收          |
| R2 Secret                | 首次进入 Sveltia 时在浏览器输入，不粘贴到对话                                                   | 仅阻塞图片上传，不阻塞代码开发   |
| GitHub App Secret        | 在 Cloudflare Auth Worker 中填写并加密，不发到对话                                              | 仅阻塞 CMS 登录                  |
| 翻译服务                 | 推荐 OpenAI GPT-6 Luna，也可选 DeepSeek/Gemini/Mistral；Key 保存在浏览器                        | 仅阻塞一键英文翻译验收           |
| 内容资料                 | 最终作者名、双语简介、社交链接、Logo、正式文章和媒体授权                                        | 阻塞正式索引和稳定版发布         |
| 安全联系                 | 私人行为准则和漏洞报告邮箱或渠道                                                                | 阻塞公开发布检查                 |
| 首次上线批准             | 确认内容与索引策略后启用正式索引                                                                | 期间站点保持 noindex             |
| 域名确认                 | 确认正式域名只使用 `zanezx.com`，不添加 `www`                                                   | DNS 和 canonical 验收            |

Cloudflare API Token 建议权限：

- Preview Token：目标账号 `Workers Scripts: Edit`，限制到 Preview Worker；`Account Settings: Read`
- Production Token：目标账号 `Workers Scripts: Edit`，限制到 Production Worker；`Account Settings: Read`
- 若部署需要变更 Worker Route，再添加仅限 `zanezx.com` Zone 的 `Workers Routes: Edit`
- 两个 Token 都不需要 R2、DNS 全量或账号管理员权限
