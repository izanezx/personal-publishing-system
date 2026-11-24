import { expect, test } from "@playwright/test";

test("editorial navigation links to the Garden, Research and Library without client filters", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "出版索引" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "最近动态" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "视觉记录" })).toBeVisible();
  const shelf = page.getByRole("region", { name: "视觉记录" });
  await shelf.scrollIntoViewIfNeeded();
  const cover = shelf.getByRole("img", { name: "色彩练习" });
  await cover.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      cover.evaluate(image => (image as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  await page
    .getByRole("region", { name: "出版索引" })
    .getByRole("link", { name: "知识花园", exact: true })
    .click();
  await expect(page).toHaveURL(/\/garden\/$/);
  await page
    .getByRole("navigation", { name: "花园主题" })
    .getByRole("link", { name: /阅读实践/ })
    .click();
  await expect(page).toHaveURL(/\/garden\/reading-practice\/$/);
  await expect(
    page.getByRole("heading", { name: "萌芽", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "阅读笔记" })
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByText("正在构建的项目。")
  ).toHaveCount(0);
  await page.goto("/en/garden/reading-practice/");
  await expect(
    page.getByText("No publications in this language yet.")
  ).toBeVisible();
  await page.goto("/en/research/");
  await expect(
    page
      .getByRole("main")
      .getByRole("link", { name: "Static rendering and local interaction" })
  ).toBeVisible();
  await page.goto("/library/");
  await expect(
    page.getByRole("main").getByRole("link", { name: "Astro 内容集合文档" })
  ).toBeVisible();
});

test("publication relations work in both directions and media has authored alt text", async ({
  page,
}) => {
  await page.goto("/posts/publishing-baseline/");
  await page
    .getByRole("complementary", { name: "内容关联" })
    .getByRole("link", { name: "阅读笔记" })
    .click();
  await expect(page.getByRole("heading", { name: "反向链接" })).toBeVisible();
  await expect(
    page
      .getByRole("complementary", { name: "内容关联" })
      .getByRole("link", { name: "个人出版基线" })
  ).toBeVisible();
  await page.goto("/galleries/color-study/");
  await expect(page.getByRole("img", { name: "深蓝色色样" })).toBeVisible();
  await expect(
    page.getByRole("main").getByText("zanezx", { exact: true }).first()
  ).toBeVisible();
});

test("MDX tabs support keyboard navigation and do not affect article reading", async ({
  page,
}) => {
  await page.goto("/en/posts/rendering-primer/");
  const table = page.getByRole("region", {
    name: "Static and enhanced output",
  });
  await expect(table.locator("table")).toHaveCount(1);
  await expect(table.locator(".table-scroll")).toHaveCount(0);
  const tabs = page.getByRole("tablist", { name: "Rendering examples" });
  const html = tabs.getByRole("tab", { name: "Initial HTML" });
  const browser = tabs.getByRole("tab", { name: "Browser enhancement" });
  await expect(html).toHaveAttribute("aria-selected", "true");
  await html.focus();
  await page.keyboard.press("ArrowRight");
  await expect(browser).toBeFocused();
  await expect(browser).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel")).toContainText(
    "The browser enhances"
  );
  await page.keyboard.press("Home");
  await expect(html).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Content arrives");
});

test("MDX and Garden remain usable with JavaScript disabled", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:4399",
  });
  try {
    const page = await context.newPage();
    await page.goto("/posts/rendering-primer/");
    await expect(
      page.getByText("浏览器只增强需要交互的组件，正文无需等待脚本。")
    ).toBeVisible();
    await expect(
      page.getByText("<article>内容随页面返回</article>")
    ).toBeVisible();
    await page.goto("/garden/");
    await page
      .getByRole("navigation", { name: "花园主题" })
      .getByRole("link", { name: /Web 平台/ })
      .click();
    await expect(
      page.getByRole("heading", { name: "Web 平台", exact: true })
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test("hosted content pages and reduced-motion preference survive locale navigation", async ({
  page,
}) => {
  await page.goto("/now/");
  await expect(
    page.getByRole("heading", { name: "近况", exact: true })
  ).toBeVisible();
  const button = page.getByRole("button", { name: "减少动效" });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.goto("/en/now/");
  await expect(
    page.getByRole("button", { name: "Reduce motion" })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Now", exact: true })
  ).toBeVisible();
});

test("local Pagefind indexes public galleries and skips unpublished examples", async ({
  page,
}) => {
  await page.goto("/");
  const output = await page.evaluate(async () => {
    const path = "/pagefind/pagefind.js";
    const pagefind = await import(path);
    const publicGallery = await pagefind.search("色彩练习");
    const draft = await pagefind.search("draftpublicationmarker");
    return {
      galleries: await Promise.all(
        publicGallery.results.map(
          async (result: { data: () => Promise<{ url: string }> }) =>
            (await result.data()).url
        )
      ),
      drafts: draft.results.length,
    };
  });
  expect(output.galleries).toContain("/galleries/color-study/");
  expect(output.drafts).toBe(0);

  await page.goto("/en/");
  const future = await page.evaluate(async () => {
    const path = "/pagefind/pagefind.js";
    const pagefind = await import(path);
    const results = await pagefind.search("futurepublicationmarker");
    return results.results.length;
  });
  expect(future).toBe(0);
});

test("client navigation does not accumulate reading controls or duplicate copy buttons", async ({
  page,
}) => {
  await page.goto("/en/posts/publishing-baseline/");
  const copy = page.locator("#article .copy-code");
  await expect(copy).toHaveCount(1);
  for (let cycle = 0; cycle < 2; cycle++) {
    await page
      .getByRole("complementary", { name: "Publication relationships" })
      .getByRole("link", { name: "Publishing project" })
      .click();
    await expect(page).toHaveURL(/\/publishing-project\/$/);
    await page.goBack();
    await expect(copy).toHaveCount(1);
    await page.locator("#read-mode-btn").click();
    await expect(page.locator("body")).toHaveClass(/reading-mode-active/);
    await page.keyboard.press("Escape");
    await expect(page.locator("body")).not.toHaveClass(/reading-mode-active/);
  }
});
