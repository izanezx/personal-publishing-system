import { expect, test } from "@playwright/test";

for (const path of ["/", "/en/posts/rendering-primer/"]) {
  test(`initial publication rendering stays within local budgets: ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => {
      const stats = { lcp: 0, cls: 0 };
      Object.assign(window, { __publicationVitals: stats });
      new PerformanceObserver(list => {
        stats.lcp = list.getEntries().at(-1)?.startTime ?? stats.lcp;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        })[]) {
          if (!entry.hadRecentInput) stats.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(path, { waitUntil: "load" });
    await expect(page.locator("main h1")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { __publicationVitals: { lcp: number } })
              .__publicationVitals.lcp
        )
      )
      .toBeGreaterThan(0);
    const metrics = await page.evaluate(() => {
      const vitals = (
        window as unknown as {
          __publicationVitals: { lcp: number; cls: number };
        }
      ).__publicationVitals;
      const scripts = (
        performance.getEntriesByType("resource") as PerformanceResourceTiming[]
      ).filter(entry => new URL(entry.name).pathname.endsWith(".js"));
      return {
        ...vitals,
        scriptBytes: scripts.reduce(
          (bytes, item) => bytes + item.decodedBodySize,
          0
        ),
      };
    });
    await test.info().attach("local-vitals", {
      body: JSON.stringify(metrics),
      contentType: "application/json",
    });
    expect(metrics.lcp).toBeLessThan(5000);
    expect(metrics.cls).toBeLessThan(0.1);
    expect(metrics.scriptBytes).toBeLessThan(256 * 1024);
  });
}
