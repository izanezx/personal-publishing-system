import { expect, test } from "@playwright/test";

test("preview-only drafts and scheduled posts are routable but excluded", async ({
  page,
  request,
}) => {
  for (const path of [
    "/posts/unreleased-fixture/",
    "/en/posts/future-fixture/",
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain(
      '<meta name="robots" content="noindex, follow">'
    );
  }

  await page.goto("/");
  await expect(page.locator("body")).not.toContainText("unreleased-fixture");
  for (const path of [
    "/rss.xml",
    "/en/rss.xml",
    "/activity.xml",
    "/sitemap-0.xml",
  ]) {
    expect(await (await request.get(path)).text()).not.toMatch(
      /unreleased-fixture|future-fixture/
    );
  }
});
