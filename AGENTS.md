# Personal Publishing System

以 Devosfera 为基础维护独立的 Astro 个人出版系统。中文使用根路径，英文使用 /en/。沿用原有阅读体验，使用 pnpm 锁文件与 Astro 静态输出，部署到 Cloudflare Workers Static Assets。具体框架和工具版本以导入后的项目清单和锁文件为准。

## 项目 Skills

项目 skills 位于 `.agents/skills/`。按下表为当前任务选择对应的 skill。采用其中的通用做法时，保留本项目已确认的架构、发布和验收要求。

| 工作 | 主要 skill | 在本项目中的应用 |
| --- | --- | --- |
| 需求和任务拆解 | `grill-with-docs`、`to-spec`、`to-tickets` | 复用现有蓝图和阶段编号。澄清影响验收的决策，拆成有依赖和验收条件的小任务。对已经明确的单项改动直接实施。 |
| Astro 实现 | `astro`；涉及多语言路由、交互 islands 或 ClientRouter 时参考 `astro-framework` | 负责 Astro 组件、静态路由、Content Collections 和 Markdown/MDX。先检查仓库已有实现，再查与锁定版本对应的 [Astro 官方文档](https://docs.astro.build/)。维持静态部署边界。 |
| 内容模型和架构 | `domain-modeling`、`codebase-design`、`improve-codebase-architecture` | 梳理 UID、翻译关系、永久链接、草稿和未来内容过滤。将架构决策和实现分开记录，逐步整理内容查询和布局。 |
| 实现、验证和排错 | `implement`、`tdd`、`diagnosing-bugs`、`playwright`、`gh-fix-ci` | 每次推进一项可验收改动。以项目脚本和 CI 结果为准。浏览器验证覆盖搜索、目录、图库、语言切换和移动端。正式回归用例纳入项目的 Playwright 测试套件。 |
| 发布质量 | `seo`、`accessibility`、`web-perf`、`cloudflare-deploy` | 检查 canonical、hreflang、robots、RSS 和 Sitemap，验证键盘交互、焦点和性能。Cloudflare 预览与生产使用独立部署。生产发布以项目发布工作流和所有者确认的候选版本为准。 |
| 审查、交接和长期维护 | `code-review`、`pr`、`handoff`、`retro` | 核对验收条件和变更影响，复用构建与测试证据；上游功能或修复逐项登记在项目的上游融合记录。 |

## GitHub 接入

项目计划使用 GitHub Issues 和 PR。待自己的 GitHub 仓库接入并完成 GitHub CLI 认证后，使用 `setup-matt-pocock-skills` 完成 issue tracker、分流标签和领域文档设置。在接通之前，把需要变更为 Issue 的事项作为本地草稿整理。发布 Issue 或其他外部变更前，核对目标仓库是本项目自己的远端。
