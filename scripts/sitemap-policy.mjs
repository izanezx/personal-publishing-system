export function filterSitemapXml(sitemap, { blockedPaths, indexingEnabled }) {
  const blocked = new Set(blockedPaths);
  return sitemap.replace(/<url>[\s\S]*?<\/url>/g, block => {
    if (!indexingEnabled) return "";

    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    if (!loc) return block;

    const path = new URL(loc).pathname;
    return blocked.has(path) ||
      [...blocked].some(
        blockedPath => blockedPath.endsWith("/") && path.startsWith(blockedPath)
      )
      ? ""
      : block;
  });
}
