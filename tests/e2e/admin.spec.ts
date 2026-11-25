import { expect, test } from "@playwright/test";

type CmsWindow = Window & {
  CMS?: {
    init?: unknown;
  };
};

test("admin loads the pinned CMS, custom editor code and no config errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  const response = await page.goto("/admin/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/zanezx/);
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
    "content",
    "noindex, nofollow"
  );
  await expect(
    page.locator('script[src*="@sveltia/cms@0.272.0"]')
  ).toHaveAttribute("integrity", /^sha384-/);
  await expect(page.locator('script[src="./custom.js"]')).toHaveCount(1);

  await page.waitForFunction(() => Boolean((window as CmsWindow).CMS));

  await expect(page.locator("body")).not.toContainText(
    /configuration error|invalid configuration/i
  );
  expect(errors).toEqual([]);
});

test("admin remains usable at a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/");
  await page.waitForFunction(() => Boolean((window as CmsWindow).CMS));
  const bodyWidth = await page.locator("body").evaluate(element => {
    return element.scrollWidth;
  });
  expect(bodyWidth).toBeLessThanOrEqual(390);
});
