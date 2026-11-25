import { expect, test } from "@playwright/test";

const base = (process.env.SITE_BASE_PATH ?? "/").replace(/\/$/, "");
const origin = "https://zanezx.com";

test("navigation, SEO and Pagefind work at the configured mount path", async ({
  page,
  request,
}) => {
  const zh = `${base}/posts/rendering-primer/`;
  const en = `${base}/en/posts/rendering-primer/`;
  await page.goto(zh);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    origin + zh
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    "href",
    origin + en
  );
  await page.locator('header [data-lang-toggle="en"]:visible').first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    origin + en + "index.png"
  );
  expect((await request.get(en + "index.png")).ok()).toBeTruthy();
  expect((await request.get(base + "/favicon.svg")).ok()).toBeTruthy();
  expect(await (await request.get(base + "/en/rss.xml")).text()).toContain(
    origin + en
  );
  const indexing = await (
    await request.get(base + "/runtime/indexing.json")
  ).json();
  const robots = await (await request.get(base + "/robots.txt")).text();
  if (indexing.enabled) {
    expect(robots).toContain(origin + base + "/sitemap-index.xml");
  } else {
    expect(robots).toMatch(/Disallow:\s*\/$/m);
  }

  await page.goto(base + "/en/search/?q=rendering");
  const result = page
    .locator("#linked-search .pagefind-ui__result-link")
    .first();
  await expect(result).toHaveAttribute("href", en);
  await result.click();
  await expect(page).toHaveURL(new RegExp(en + "$"));

  await page.goto(base + "/tags/" + encodeURIComponent("出版") + "/");
  await expect(page.locator("main h1")).toContainText("出版");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "查看 zanezx 上带有「出版」标签的内容。"
  );

  await page.goto(base + "/posts/reading-note/");
  await expect(
    page.locator("link[hreflang], header [data-lang-toggle]")
  ).toHaveCount(0);
  expect((await request.get(base + "/en/posts/reading-note/")).status()).toBe(
    404
  );
});
