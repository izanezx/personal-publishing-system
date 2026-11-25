/* global CMS, html */

// Mirrors the reading styles of the site so the preview pane is not a bare form.
CMS.registerPreviewStyle(
  `
    body {
      margin: 0;
      padding: 24px;
      background: #fff;
      color: #1f2328;
      font-family: ui-serif, Georgia, "Songti SC", "Noto Serif SC", serif;
      font-size: 16px;
      line-height: 1.8;
    }
    h1, h2, h3, h4 {
      font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      line-height: 1.3;
      margin: 1.6em 0 0.6em;
    }
    p, ul, ol { margin: 0 0 1.1em; }
    a { color: #0b6bcb; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    blockquote {
      margin: 1.5em 0;
      padding: 0.75em 1em;
      border-left: 4px solid #d0d7de;
      background: #f6f8fa;
      color: #57606a;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5em 0.75em; border: 1px solid #d0d7de; text-align: left; }
    code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9em; }
    pre { padding: 1em; overflow: auto; background: #f6f8fa; border-radius: 8px; }
  `,
  { raw: true }
);

// Inserts the GitHub-style callout that `rehype-callouts` already renders on the site.
CMS.registerEditorComponent({
  id: "callout",
  label: "提示框",
  icon: "campaign",
  fields: [
    {
      name: "type",
      label: "类型",
      widget: "select",
      options: ["NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"],
      default: "NOTE",
    },
    { name: "body", label: "内容", widget: "text", required: true },
  ],
  pattern:
    /^> \[!(?<type>NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n(?<body>(?:> .*\n?)*)/m,
  fromBlock: ({ groups: { type, body } = {} }) => ({
    type,
    body: String(body ?? "")
      .split("\n")
      .map(line => line.replace(/^> ?/, ""))
      .join("\n")
      .trim(),
  }),
  toBlock: ({ type = "NOTE", body = "" }) =>
    [
      `> [!${type}]`,
      ...String(body)
        .split("\n")
        .map(line => `> ${line}`),
    ].join("\n"),
  toPreview: ({ type = "NOTE", body = "" }) => {
    const colors = {
      NOTE: "#0969da",
      TIP: "#1a7f37",
      IMPORTANT: "#8250df",
      WARNING: "#bf8700",
      CAUTION: "#cf222e",
    };
    const element = document.createElement("aside");
    element.style.cssText = `padding: 8px 16px; border-left: 4px solid ${colors[type]}; background: #f6f8fa;`;
    element.textContent = `${type}: ${body}`;
    return element;
  },
});

const DOCS = [
  ["写作与发布", "docs/SVELTIA.zh-CN.md"],
  ["内容字段与状态", "docs/PUBLISHING.zh-CN.md"],
  ["R2 图片", "docs/MEDIA_R2.zh-CN.md"],
  ["发布与回滚", "docs/RELEASE.md"],
];

const GuidePage = () => html`
  <div style="max-width: 720px; padding: 16px 24px; line-height: 1.7">
    <h2>发布指南</h2>
    <p>
      Markdown 文章、图库和多语言元数据在 Sveltia 中编辑；MDX
      与交互组件仍由代码仓库维护。
    </p>
    <ul>
      ${DOCS.map(
        ([label, path]) => html`
          <li key=${path}>
            <a
              href=${`https://github.com/izanezx/personal-publishing-system/blob/main/${path}`}
              target="_blank"
              rel="noreferrer"
              >${label}</a
            >
          </li>
        `
      )}
    </ul>
    <h3>双语对照</h3>
    <p>
      默认使用单栏全宽编辑器。需要对照另一语言时，可在条目顶部切换语言；需要检查排版时再临时打开预览。默认语言是中文，英文内容需要先完成翻译再保存。
    </p>
  </div>
`;

CMS.registerCustomPage({
  id: "guide",
  label: "发布指南",
  icon: "help",
  component: GuidePage,
});
