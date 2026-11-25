import { serializeJsonLd } from "../src/utils/serializeJsonLd";
import { isPublished } from "../src/utils/postFilter";
import assert from "node:assert/strict";
import test from "node:test";
import { getTargetLanguageUrl, isActive } from "@/i18n/utils";
import { buildBreadcrumbItems } from "@/utils/breadcrumbs";
import { getPath } from "@/utils/getPath";
import postFilter from "@/utils/postFilter";
import { getReadingTime } from "@/utils/readingTime";
import type { ContentEntry } from "@/utils/contentEntry";
import { slugifyAll, slugifyStr } from "@/utils/slugify";
import {
  effectivePublicationStatus,
  isListedPublication,
  isRoutablePublication,
  isSearchablePublication,
} from "@/lib/content/status";
import { findGoneMatch } from "@/lib/content/runtime";
import { isSafeRemoteMediaUrl } from "@/utils/media";

test("slugifyStr normalizes diacritics, versions, punctuation, and unicode", () => {
  assert.equal(slugifyStr("E2E Testing"), "e2e-testing");
  assert.equal(slugifyStr("TypeScript 5.0"), "typescript-5.0");
  assert.equal(slugifyStr("Programación y Diseño's"), "programacion-y-disenos");
  assert.equal(
    slugifyStr("Modern CSS in 2026: :has()"),
    "modern-css-in-2026-has"
  );
  assert.equal(slugifyStr("日本語 テスト"), "日本語-テスト");
  assert.deepEqual(slugifyAll(["Astro 7", "Web Dev"]), ["astro-7", "web-dev"]);
});

test("publication media accepts safe HTTPS sources and rejects unsafe URLs", () => {
  assert.equal(
    isSafeRemoteMediaUrl("https://media.zanezx.com/cms/example.webp"),
    true
  );
  assert.equal(
    isSafeRemoteMediaUrl("https://images.unsplash.com/photo-example"),
    true
  );
  assert.equal(
    isSafeRemoteMediaUrl("https://cdn.example.com/cover.jpg?width=1600"),
    true
  );
  assert.equal(isSafeRemoteMediaUrl("http://example.com/cover.jpg"), false);
  assert.equal(
    isSafeRemoteMediaUrl("https://user:secret@example.com/cover.jpg"),
    false
  );
  assert.equal(isSafeRemoteMediaUrl("not-a-url"), false);
});

test("getReadingTime strips frontmatter/code and formats by locale", () => {
  assert.equal(getReadingTime(""), "< 1 min read");
  assert.equal(getReadingTime("", "zh-CN"), "不到 1 分钟");
  assert.equal(getReadingTime("word ".repeat(400)), "2 min read");
  assert.equal(
    getReadingTime("中文出版 ".repeat(400), "zh-CN", 200),
    "4 分钟阅读"
  );

  const withCode = `---
title: Demo
---

\`\`\`ts
${"const x = 1;\n".repeat(300)}
\`\`\`

Just a short \`inlineCode()\` paragraph here.`;
  assert.equal(getReadingTime(withCode), "1 min read");
});

test("i18n helpers switch locale prefixes and match active routes", () => {
  assert.equal(getTargetLanguageUrl("/", "en"), "/en/");
  assert.equal(getTargetLanguageUrl("/posts/hello", "en"), "/en/posts/hello/");
  assert.equal(getTargetLanguageUrl("/en", "zh-CN"), "/");
  assert.equal(
    getTargetLanguageUrl("/en/posts/hello", "zh-CN"),
    "/posts/hello/"
  );

  assert.equal(isActive("/en/posts/my-article/", "/posts"), true);
  assert.equal(isActive("/archives/", "/posts"), false);
});

test("buildBreadcrumbItems translates segments and compacts pagination", () => {
  assert.deepEqual(buildBreadcrumbItems("/"), []);
  assert.deepEqual(buildBreadcrumbItems("/posts/2", { locale: "zh-CN" }), [
    { label: "文章 #2", href: null },
  ]);
  assert.deepEqual(buildBreadcrumbItems("/tags/astro-v7"), [
    { label: "Tags", href: "/tags/" },
    { label: "Astro v7", href: null },
  ]);
});

test("getPath skips _-prefixed dirs and slugifies nested subdirectories", () => {
  assert.equal(
    getPath("en/hello-world", "src/data/blog/en/hello-world.mdx", false),
    "/hello-world"
  );
  assert.equal(
    getPath(
      "en/_2026/draft-note",
      "src/data/blog/en/_2026/draft-note.md",
      false
    ),
    "/draft-note"
  );
  assert.equal(
    getPath(
      "zh-cn/Web Dev/mi-post",
      "src/data/blog/zh-cn/Web Dev/mi-post.mdx",
      true
    ),
    "/posts/web-dev/mi-post"
  );
});

test("postFilter hides drafts and scheduled future posts", () => {
  const entry = (overrides: Record<string, unknown>) =>
    ({
      id: "zh-cn/fixture",
      data: {
        title: "t",
        description: "d",
        pubDatetime: new Date(0),
        ...overrides,
      },
    }) as ContentEntry;

  assert.equal(postFilter(entry({ draft: true })), false);
  assert.equal(
    postFilter(entry({ pubDatetime: new Date(Date.now() + 86_400_000) })),
    false
  );
  assert.equal(
    postFilter(entry({ pubDatetime: new Date(Date.now() - 86_400_000) })),
    true
  );

  const previousPreviewMode = process.env.PUBLIC_PREVIEW_CONTENT;
  process.env.PUBLIC_PREVIEW_CONTENT = "true";
  try {
    assert.equal(postFilter(entry({ draft: true })), true);
    assert.equal(
      postFilter(entry({ pubDatetime: new Date(Date.now() + 86_400_000) })),
      true
    );
    assert.equal(postFilter(entry({ status: "expired" })), false);
  } finally {
    if (previousPreviewMode === undefined) {
      delete process.env.PUBLIC_PREVIEW_CONTENT;
    } else {
      process.env.PUBLIC_PREVIEW_CONTENT = previousPreviewMode;
    }
  }
});

test("JSON-LD preserves text while escaping HTML delimiters", () => {
  const data = { headline: "A < B", text: "中文" };
  const output = serializeJsonLd(data);
  assert.ok(!output.includes("<"));
  assert.deepEqual(JSON.parse(output), data);
});

test("a publication becomes visible at its exact timestamp", () => {
  const start = new Date("2030-09-18T12:00:00Z");
  assert.equal(isPublished({ pubDatetime: start }, start.getTime() - 1), false);
  assert.equal(isPublished({ pubDatetime: start }, start.getTime()), true);
  assert.equal(
    isPublished({ pubDatetime: start, draft: true }, start.getTime()),
    false
  );
});

test("English translations remain hidden until their review is published", () => {
  const start = new Date("2020-01-01T00:00:00Z");
  assert.equal(isPublished({ pubDatetime: start }, "en"), false);
  assert.equal(
    isPublished({ pubDatetime: start, translationStatus: "ai-draft" }, "en"),
    false
  );
  assert.equal(
    isPublished({ pubDatetime: start, translationStatus: "published" }, "en"),
    true
  );
});

test("publication lifecycle controls routing, listing and indexing", () => {
  const now = new Date("2026-06-01T00:00:00Z");
  const base = {
    pubDatetime: new Date("2026-01-01T00:00:00Z"),
    translationStatus: "published" as const,
  };

  assert.equal(
    effectivePublicationStatus(
      { ...base, status: "scheduled", scheduledFor: new Date("2026-05-01") },
      now.getTime()
    ),
    "published"
  );
  assert.equal(
    isRoutablePublication(
      { ...base, status: "unlisted" },
      "zh-CN",
      now.getTime()
    ),
    true
  );
  assert.equal(
    isListedPublication(
      { ...base, status: "unlisted" },
      "zh-CN",
      now.getTime()
    ),
    false
  );
  assert.equal(
    isSearchablePublication(
      { ...base, status: "unlisted" },
      "zh-CN",
      now.getTime()
    ),
    false
  );
  assert.equal(
    isRoutablePublication(
      { ...base, status: "archived" },
      "zh-CN",
      now.getTime()
    ),
    true
  );
  assert.equal(
    isListedPublication(
      { ...base, status: "archived" },
      "zh-CN",
      now.getTime()
    ),
    false
  );
  assert.equal(
    isSearchablePublication(
      { ...base, status: "archived" },
      "zh-CN",
      now.getTime()
    ),
    false
  );
  assert.equal(
    isRoutablePublication(
      {
        ...base,
        status: "published",
        expiresAt: new Date("2026-05-01"),
      },
      "zh-CN",
      now.getTime()
    ),
    false
  );
  assert.equal(
    effectivePublicationStatus(
      {
        ...base,
        status: "published",
        expireAt: new Date("2026-05-01"),
      },
      now.getTime()
    ),
    "expired"
  );
  assert.equal(
    effectivePublicationStatus(
      {
        ...base,
        status: "published",
        archivedAt: new Date("2026-05-15"),
      },
      now.getTime()
    ),
    "archived"
  );
  assert.equal(
    effectivePublicationStatus(
      {
        ...base,
        status: "published",
        archivedAt: new Date("2026-06-15"),
      },
      now.getTime()
    ),
    "published"
  );
});

test("future tombstones activate at their effective time", () => {
  const entries = [
    {
      path: "/posts/future-expiry/",
      status: "expired" as const,
      effectiveAt: "2026-12-01T00:00:00.000Z",
    },
    {
      path: "/posts/immediate-gone/",
      status: "withdrawn" as const,
    },
    {
      path: "/posts/moved/",
      status: "deleted" as const,
      redirectTo: "/posts/new/",
    },
    {
      path: "/posts/deleted/",
      status: "deleted" as const,
    },
  ];

  assert.equal(
    findGoneMatch(
      "/posts/future-expiry/",
      entries,
      new Date("2026-11-30T23:59:59.000Z").getTime()
    ),
    undefined
  );
  assert.deepEqual(
    findGoneMatch(
      "/posts/future-expiry/",
      entries,
      new Date("2026-12-01T00:00:00.000Z").getTime()
    ),
    { status: 410 }
  );
  assert.deepEqual(findGoneMatch("/posts/immediate-gone/", entries), {
    status: 410,
  });
  assert.deepEqual(findGoneMatch("/posts/moved/", entries), {
    status: 301,
    redirectTo: "/posts/new/",
  });
  assert.equal(findGoneMatch("/posts/deleted/", entries), undefined);
});
