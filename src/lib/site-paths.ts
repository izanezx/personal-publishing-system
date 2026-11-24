export function normalizeSiteBase(value = "/") {
  if (
    !/^\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]*\/?$/i.test(value) ||
    value.includes("//")
  ) {
    throw new Error("SITE_BASE_PATH must be / or a path such as /publishing");
  }
  return value.replace(/\/$/, "");
}

const siteBase = normalizeSiteBase(import.meta.env?.BASE_URL ?? "/");

export function withoutBase(pathname: string) {
  if (!siteBase) return pathname;
  if (pathname === siteBase) return "/";
  return pathname.startsWith(siteBase + "/")
    ? pathname.slice(siteBase.length)
    : pathname;
}

export function withBase(pathname: string) {
  return siteBase + pathname;
}
