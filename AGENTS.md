# Personal Publishing System

维护独立的 Personal Publishing System。Devosfera `bba247e2` 是 MIT 许可的初始源码来源，AstroPaper `v7.2.0` 是选择性工程参考；本项目不依赖上游 Git 历史，也不合并上游分支。中文使用根路径，英文使用 /en/。沿用原有阅读体验，使用 pnpm 锁文件与 Astro 静态输出，部署到 Cloudflare Workers Static Assets。具体框架和工具版本以项目清单和锁文件为准。

## 项目 Skills

项目 skills 位于 `.agents/skills/`。按下表为当前任务选择对应的 skill。采用其中的通用做法时，保留本项目已确认的架构、发布和验收要求。

| 工作                 | 主要 skill                                                                     | 在本项目中的应用                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 需求和任务拆解       | `grill-with-docs`、`to-spec`、`to-tickets`                                     | 复用现有蓝图和阶段编号。澄清影响验收的决策，拆成有依赖和验收条件的小任务。对已经明确的单项改动直接实施。                                                                 |
| Astro 实现           | `astro`；涉及多语言路由、交互 islands 或 ClientRouter 时参考 `astro-framework` | 负责 Astro 组件、静态路由、Content Collections 和 Markdown/MDX。先检查仓库已有实现，再查与锁定版本对应的 [Astro 官方文档](https://docs.astro.build/)。维持静态部署边界。 |
| 内容模型和架构       | `domain-modeling`、`codebase-design`、`improve-codebase-architecture`          | 梳理 UID、翻译关系、永久链接、草稿和未来内容过滤。将架构决策和实现分开记录，逐步整理内容查询和布局。                                                                     |
| 实现、验证和排错     | `implement`、`tdd`、`diagnosing-bugs`、`playwright`、`gh-fix-ci`               | 每次推进一项可验收改动。以项目脚本和 CI 结果为准。浏览器验证覆盖搜索、目录、图库、语言切换和移动端。正式回归用例纳入项目的 Playwright 测试套件。                         |
| 发布质量             | `seo`、`accessibility`、`web-perf`、`cloudflare-deploy`                        | 检查 canonical、hreflang、robots、RSS 和 Sitemap，验证键盘交互、焦点和性能。Cloudflare 预览与生产使用独立部署。生产发布以项目发布工作流和所有者确认的候选版本为准。      |
| 审查、交接和长期维护 | `code-review`、`pr`、`handoff`、`retro`                                        | 核对验收条件和变更影响，复用构建与测试证据；上游功能或修复逐项登记在项目的上游融合记录。                                                                                 |

## GitHub 接入

Issue 和 PR 使用 `izanezx/personal-publishing-system`，沿用 S0–S5 和 PR-00–15
任务编号。将检查结果和验收证据关联到对应项。这个仓库从自己的根提交开始，
不继承上游提交、Issue 或 PR。参考仓库只用于读取更新，逐项记录适配决定和
回归证据。

## 项目边界和验证

`src/lib/content/` 管理 UID、slug、发布规则和数据查询。`src/i18n/` 管理
语言和译文解析。`src/components/ui/` 存放可复用基础组件，
`src/components/editorial/` 组合出版功能，`src/components/common/`
负责共享页面能力。给文章或图库改 slug 时记录 `previousSlugs`；移动文件时
保留 UID、slug 和语言。组件变更应覆盖移动端、键盘、减少动效和内容无脚本可读性。

使用锁定的 Node 和 pnpm。提交前运行 `pnpm test`、`pnpm lint`、
`pnpm format:check`、`pnpm build`、`pnpm test:e2e` 和
`pnpm test:release`。URL、SEO 或搜索改动再运行子路径验收；
命令见 [发布说明](docs/RELEASE.md)。
