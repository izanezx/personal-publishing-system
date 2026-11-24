import { expect, test } from "@playwright/test";

test("bilingual pages expose only existing language versions", async ({
  page,
}) => {
  await page.goto("/posts/publishing-baseline/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator("main time").first()).toHaveText("2026年1月10日");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://zanezx.com/posts/publishing-baseline/"
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    "href",
    "https://zanezx.com/en/posts/publishing-baseline/"
  );
  await page.locator('header [data-lang-toggle="en"]:visible').first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute(
    "href",
    "https://zanezx.com/posts/publishing-baseline/"
  );
  await page.goto("/posts/reading-note/");
  await expect(
    page.locator("link[hreflang], header [data-lang-toggle]")
  ).toHaveCount(0);
  await expect(page.locator(".mobile-toc, .sidebar-toc")).toHaveCount(0);
});

test("drafts and future posts stay out of routes, feeds, and sitemaps", async ({
  request,
}) => {
  for (const path of [
    "/posts/unreleased-fixture/",
    "/en/posts/future-fixture/",
    "/posts/unreleased-fixture/index.png",
    "/en/posts/future-fixture/index.png",
  ]) {
    expect((await request.get(path)).status()).toBe(404);
  }
  for (const path of [
    "/rss.xml",
    "/en/rss.xml",
    "/activity.xml",
    "/sitemap-0.xml",
  ]) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).not.toMatch(
      /unreleased-fixture|future-fixture/
    );
  }
  const published = await (await request.get("/rss.xml")).text();
  const activity = await (await request.get("/activity.xml")).text();
  expect(published.indexOf("publishing-baseline")).toBeLessThan(
    published.indexOf("reading-note")
  );
  expect(activity.indexOf("reading-note")).toBeLessThan(
    activity.indexOf("publishing-baseline")
  );
});

test("Markdown and MDX keep callouts and tables usable at narrow widths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/posts/publishing-baseline/",
    "/en/posts/publishing-baseline/",
  ]) {
    await page.goto(path);
    await expect(page.locator("article .callout")).toBeVisible();
    await expect(page.locator("article .table-scroll table")).toBeVisible();
    await expect(page.locator("article .table-scroll")).toHaveAttribute(
      "tabindex",
      "0"
    );
    await page.locator("details.mobile-toc summary").click();
    await expect(page.locator("details.mobile-toc")).toHaveAttribute(
      "open",
      ""
    );
  }
});

test("shareable search restores Chinese and English queries", async ({
  page,
}) => {
  await page.goto("/search/?q=" + encodeURIComponent("个人出版"));
  await expect(
    page.locator("#linked-search .pagefind-ui__result-link").first()
  ).toContainText("个人出版");
  const result = page
    .locator("#linked-search .pagefind-ui__result-link")
    .first();
  await result.click();
  await expect(page).toHaveURL(/\/posts\/publishing-baseline\//);
  await page.goBack();
  await expect(page.locator("#linked-search input").first()).toHaveValue(
    "个人出版"
  );

  await page.goto("/en/search/?q=publishing");
  await expect(
    page.locator("#linked-search .pagefind-ui__result-link").first()
  ).toContainText(/publishing/i);
  await page.goto("/en/");
  const searchTrigger = page.locator("[data-search-trigger]:visible").first();
  await searchTrigger.focus();
  await page.keyboard.press("Control+k");
  const modal = page.locator("#search-modal");
  await modal.locator(".pagefind-ui__search-input").first().fill("publishing");
  await expect(
    modal.locator(".pagefind-ui__result-link").first()
  ).toContainText(/publishing/i);
  await expect(modal.locator("[data-search-page]")).toHaveAttribute(
    "href",
    /\/en\/search\/\?q=publishing$/
  );
  await page.keyboard.press("Escape");
  await expect(modal).not.toHaveClass(/\bactive\b/);
  await expect(searchTrigger).toBeFocused();
});

test("gallery instances, reading mode and theme are available after navigation", async ({
  page,
}) => {
  await page.goto("/en/posts/publishing-baseline/");
  const dialogs = page.locator("[data-gallery-lightbox]");
  await expect(dialogs).toHaveCount(2);
  const ids = await dialogs.evaluateAll(items => items.map(item => item.id));
  expect(new Set(ids).size).toBe(2);
  for (const id of ids) {
    const items = page.locator(`button[data-lb="${id}"]`);
    const trigger = items.first();
    await trigger.focus();
    await trigger.click();
    await expect(page.locator(`dialog[id="${id}"]`)).toHaveAttribute(
      "open",
      ""
    );
    if ((await items.count()) > 1) {
      await page.keyboard.press("ArrowRight");
      await expect(
        page.locator(`dialog[id="${id}"] [data-lb-counter]`)
      ).toHaveText("2 / 2");
    }
    await page.keyboard.press("Escape");
    await expect(page.locator(`dialog[id="${id}"]`)).not.toHaveAttribute(
      "open",
      ""
    );
    await expect(trigger).toBeFocused();
  }
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight)
  );
  await expect
    .poll(() =>
      page
        .locator("#reading-progress-bar")
        .evaluate(element => element.getBoundingClientRect().width)
    )
    .toBeGreaterThan(100);
  await page.locator("#read-mode-btn").click();
  await expect(page.locator("#reading-controls-pill")).not.toHaveClass(
    /opacity-0/
  );
  await page.locator("#reading-exit-btn").click();
  await page.goto("/en/galleries/color-study/");
  await expect(page.locator("main img").first()).toBeVisible();
  await expect(page.locator("#theme-btn")).toHaveCount(1);
});
