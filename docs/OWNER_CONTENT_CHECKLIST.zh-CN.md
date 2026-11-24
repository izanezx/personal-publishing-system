# 所有者内容与上线检查清单

本清单区分技术就绪状态和正式发布批准。除非仓库所有者已经提供或批准真实
材料，否则对应事项保持未完成。

## 已完成的仓库设置

已于 2026-11-24 核验：

- 仓库已公开，并启用 GitHub **Public template**。
- 已设置仓库简介、`https://zanezx.com` 首页地址和初始 Topics。
- 已启用 Dependabot 告警和自动安全更新。
- 已启用私有漏洞报告和 Secret Scanning Push Protection。
- `main` 强制要求 Linux 与 Windows CI、最新分支、线性历史和对话解决；
  禁止强推和删除。
- 35 个项目 Skills 已全部纳入 Git，并通过 `pnpm skills:check`。
- `zanezx.com/*` 生产 Worker Route 已绑定；`www.zanezx.com` 不绑定。

## 身份与品牌

- [ ] 确认最终公开显示名；当前暂用 `zanezx`。
- [ ] 确认 `zanezx` 是否同时作为品牌名和作者显示名。
- [ ] 提供站点与 About 页面使用的中文简介。
- [ ] 提供站点与 About 页面使用的英文简介。
- [ ] 提供用于元数据和社交预览的简短站点描述。
- [ ] 提供经过确认的公开社交链接，只选择需要展示的账号。
- [ ] 提供可选的公开联系邮箱，用于一般咨询。
- [ ] 提供私密的安全问题和社区行为准则举报渠道。
- [ ] 审核 `PUBLIC_SOCIAL_GITHUB` 对应的作者署名。
- [ ] 如需更改文字标识，提供 Logo 或字标。
- [ ] 提供 favicon 和社交分享图，并确认所有权与使用权。

## 发布内容

- [ ] 批准或替换当前用于验证功能的合成示例文章。
- [ ] 在 `src/data/blog/zh-cn/` 提供首批中文文章与研究内容。
- [ ] 在 `src/data/blog/en/` 提供英文版本，或明确确认只发布一种语言。
- [ ] 确认发布时间和 `Asia/Shanghai` 时区。
- [ ] 决定哪些条目属于草稿、定时发布或立即公开。
- [ ] 提供首批 Notes、Projects、Research 和 Library 内容。
- [ ] 定义第一批 Garden 主题及其关联关系。
- [ ] 首次公开发布前，检查每个条目的 `uid`、`slug`、
      `previousSlugs`、`translationKey`、`topics`、maturity 和关联关系。
- [ ] 确认标签及其中英文显示方式。

## 页面与媒体

- [ ] 批准中文和英文 About 页面文案。
- [ ] 提供当前 Now 页面文案。
- [ ] 提供 Gallery 图片，或确认仅公开合成示例。
- [ ] 为每张有意义的图片提供描述性替代文本。
- [ ] 为每个上传资源记录作者、来源网址、许可证和署名。
- [ ] 确认拥有每张图片、Logo 和字体的发布及修改权。
- [ ] 检查上传媒体中不包含隐私元数据、位置或个人信息。

## 域名与发布

- [x] 确认 `https://zanezx.com/` 为生产规范域名。
- [x] 确认 Cloudflare 账号并批准 Preview Worker。
- [ ] 批准用于生产的具体 Preview commit 和 artifact。
- [x] 绑定根域名 `zanezx.com` 的 Worker Route。
- [x] 只保留不带 `www` 的根域名，不绑定 `www.zanezx.com`。
- [ ] 批准首次允许搜索引擎公开索引的日期。
- [ ] 完成上述批准后，才创建稳定的 `v0.1.0` 标签。

## 仓库治理

- [x] 保持仓库公开。
- [x] 启用 GitHub **Public template**。
- [x] 设置初始仓库简介、首页和 Topics。
- [ ] 上线前确认最终仓库简介和 Topics。
- [ ] 确认使用模板的衍生项目是否必须在部署前替换品牌。
- [x] 启用 GitHub 私有漏洞报告。
- [ ] 通过私有安全表单提交一次非破坏性测试报告。
- [x] 启用 Dependabot 告警、自动安全更新和固定版本的 CI。

## 后续修改方式

创建短生命周期分支，每次只处理一个明确改动，运行文档规定的检查，并在
Linux 与 Windows CI 通过后，通过 Pull Request 合并。

常用文件位置：

| 修改内容             | 文件位置                                                      |
| -------------------- | ------------------------------------------------------------- |
| 站点标题、简介       | `src/lib/site-settings.ts`                                    |
| 主题和功能开关       | `src/config.ts`                                               |
| 社交链接和验证 ID    | `.env`，以 `.env.example` 为模板                              |
| 中文文章             | `src/data/blog/zh-cn/`                                        |
| 英文文章             | `src/data/blog/en/`                                           |
| About 和 Now         | `src/data/pages/{zh-cn,en}/`                                  |
| Gallery 元数据和媒体 | `src/data/galleries/{zh-cn,en}/`                              |
| Frontmatter schema   | `src/content.config.ts`                                       |
| 路由和列表页         | `src/pages/` 和 `src/lib/content/`                            |
| Skills 和 Agent 规则 | `.agents/skills/`、`AGENTS.md` 和 `docs/AGENT_ENVIRONMENT.md` |

修改文章 URL 时，保留原有 `uid` 和 `slug`，把旧公开路径追加到
`previousSlugs`。不要仅因为标题或文件夹变化就修改 `translationKey`。

建议修改流程：

```bash
git switch -c content/update-about
pnpm security:audit
pnpm skills:check
pnpm test
pnpm lint
pnpm format:check
pnpm build
pnpm test:e2e
git add .
git commit -m "content: update about page"
git push -u origin content/update-about
```

打开 Pull Request，等待 Linux 与 Windows CI 通过，检查 Preview artifact，
然后合并。生产部署仍是独立的所有者批准流程。
