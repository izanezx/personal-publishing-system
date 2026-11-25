# Sveltia CMS 写作与发布

Sveltia CMS 地址：

```text
https://zanezx.com/admin/
```

站点使用下面的完整链路：

```text
Sveltia CMS
  -> GitHub App 登录
  -> 浏览器自动备份未保存编辑
  -> 点保存直接提交 main
  -> main CI 通过后自动生产部署
  -> 线上 Smoke Test
  -> 失败自动回滚
```

日常写作只需要 Sveltia CMS 和 GitHub 登录，不需要在本地执行构建、提交、PR、
合并或部署命令。

## 编辑器界面

- 默认使用单栏全宽编辑器，优先保证 Notion 风格长文写作时的可用宽度。
- 需要对照英文时，在条目顶部切换语言；需要检查排版时再临时打开预览。
- 新建条目默认只有中文。在条目顶部切换到 English 才会创建英文文件，
  标记为 `i18n: duplicate` 的字段（日期、状态、封面等）会自动复制。
- 顶部工具栏的「发布指南」是自定义页面，汇总写作、字段、R2 和回滚文档。
- 正文工具栏的「提示框」写入 `> [!TIP]` 形式的 GitHub Callout，由站点现有
  的 `rehype-callouts` 渲染，不需要写 HTML。

预览用站点排版样式近似渲染字段，不会执行 Astro 组件。MDX 文章和交互组件的
最终效果仍以部署后的线上页面为准。

Sveltia 内置 AI 翻译入口。第一次使用时选择 Google、OpenAI、Anthropic、
DeepSeek 或 Mistral，并在浏览器中输入自己的 API Key。Key 只保存在当前浏览器，
不写入仓库、Cloudflare 或 GitHub Secrets。

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
5. 点击保存后直接提交到 `main`。CI 通过后自动部署到生产站。

普通文章保存为 Markdown。需要 Astro 组件、交互演示或 MDX 的内容仍由代码维护，
不在 Sveltia CMS 中直接编辑。

## 保存与本地草稿

日常发布没有 Draft、Review、Ready、Pending Publish 等编辑阶段。

- 编辑过程中，Sveltia 会自动把尚未保存的内容备份在当前浏览器。
- 离开页面或浏览器意外关闭后，再次打开同一内容会提示恢复备份。
- 点击保存会把内容直接提交到 GitHub `main`，不会创建 CMS Pull Request。
- GitHub Actions 会先执行构建、单元测试、浏览器测试和发布演练；全部通过后才部署。
- 任一步失败时，生产站不会被这次提交替换；正在运行的旧版本继续提供服务。

浏览器备份只存在当前浏览器的本地存储中，不等同于 GitHub 草稿。若不希望内容进入
站点，同时仍要把文件保存到仓库，可以使用下面“文章发布状态”中的 `draft`。
正常情况下不需要这个状态：保存后等待自动部署即可。

## 页面状态

| `status`    | 页面                           | 列表   | 搜索   | RSS    | Sitemap | 索引      |
| ----------- | ------------------------------ | ------ | ------ | ------ | ------- | --------- |
| `draft`     | 生产不生成；Preview 可看       | 否     | 否     | 否     | 否      | `noindex` |
| `scheduled` | 到点并重建后生成；Preview 可看 | 到点后 | 到点后 | 到点后 | 到点后  | 到点后    |
| `published` | 生成                           | 是     | 是     | 是     | 是      | 是        |
| `unlisted`  | 可访问                         | 否     | 否     | 否     | 否      | `noindex` |
| `archived`  | 可访问并显示归档提示           | 否     | 否     | 否     | 否      | `noindex` |
| `expired`   | 410 或 301                     | 否     | 否     | 否     | 否      | 否        |
| `withdrawn` | 410 或 301                     | 否     | 否     | 否     | 否      | 否        |

`expiresAt` 到点时，Worker 会根据运行时 manifest 开始返回 410 或 301，不必等到
下一次静态构建。定时发布、自然过期和自动归档到达后，每 15 分钟运行的检查会触发
一次生产重建。GitHub Actions 的定时任务可能略有延迟。

删除文件且没有 tombstone 时返回 404。需要在删除后保留旧地址时，在“下线记录”
中使用 `withdrawn` 返回 410 或 301；`deleted` 记录填写 `redirectTo` 时返回 301，
不填写时仍返回 404。

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
- 必须修改 URL 时，Sveltia 会根据 `preview_path` 自动把旧地址追加到
  `aliases`，构建时生成 301；不要手动定义 `aliases` 表单字段，否则会关闭
  Sveltia 的自动维护。
- 历史内容已有的 `previousSlugs` 继续兼容并生成 301。
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

封面、OG、Gallery 和 Markdown 正文均可使用安全 HTTPS 外部图片；R2 是正式
内容上传的默认位置。使用站外图片时请自行确认来源与使用许可。

上传前应：

- 确认拥有发布授权。
- 检查人物隐私和敏感信息。
- 清除不需要的 EXIF 位置数据。
- 为内容图片填写准确的替代文本、署名、许可证和来源。
- 使用有意义的文件名。

## 自动发布后需要检查什么

每次保存后可以直接在 GitHub Actions 查看 `CI` 和 `Cloudflare production release`。
生产部署完成时会自动运行：

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

CMS 创建的 `src/data/**/*.md` 使用 Sveltia 自己的 frontmatter 和 Markdown
序列化格式，不参与 Prettier 格式检查；`cms:check`、构建、单元测试和浏览器测试
仍然会校验其语义。保存会产生一个直接提交，不会额外创建机器人格式化提交。

## 本地替代方式

只有在修改代码、Schema、CMS 配置或工作流时才需要本地命令：

```bash
pnpm cms:check
pnpm test
pnpm build
pnpm test:e2e
pnpm test:release
```
