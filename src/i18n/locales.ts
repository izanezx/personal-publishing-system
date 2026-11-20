export const languages = { "zh-CN": "简体中文", en: "English" } as const;
export type Locale = keyof typeof languages;
export const defaultLang: Locale = "zh-CN";

export function resolveLocale(value?: string | null): Locale {
  return value?.toLowerCase().split("-")[0] === "en" ? "en" : defaultLang;
}

export function contentLocale(id: string): Locale {
  return resolveLocale(id.split("/")[0]);
}

export function localePrefix(locale?: string) {
  return resolveLocale(locale) === "en" ? "/en" : "";
}

export function unlocalizedPath(pathname: string) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return path.replace(/^\/en(?=\/|$)/, "").replace(/\/+$/, "") || "/";
}

export function localizedPath(locale: string, path: string) {
  const unlocalized = unlocalizedPath(path);
  return unlocalized === "/"
    ? `${localePrefix(locale)}/`
    : `${localePrefix(locale)}${unlocalized}/`;
}

export type LocaleAlternates = Partial<Record<Locale, string>>;
const mirroredPaths = new Set([
  "/",
  "/posts",
  "/tags",
  "/about",
  "/galleries",
  "/archives",
  "/search",
  "/notes",
  "/projects",
]);

export function pageAlternates(
  pathname: string,
  entryAlternates?: LocaleAlternates
): LocaleAlternates {
  if (entryAlternates) return entryAlternates;
  const path = unlocalizedPath(pathname);
  return mirroredPaths.has(path)
    ? { "zh-CN": localizedPath("zh-CN", path), en: localizedPath("en", path) }
    : {};
}
