import { withBase, withoutBase } from "../lib/site-paths";

export const languages = { "zh-CN": "简体中文", en: "English" } as const;
export type Locale = keyof typeof languages;
export const defaultLang: Locale = "zh-CN";

export const supportedLocales = Object.keys(languages) as Locale[];
const routeSegment: Record<Locale, string> = { "zh-CN": "", en: "en" };

export function resolveLocale(value?: string | null): Locale {
  const normalized = value?.toLowerCase();
  return (
    supportedLocales.find(locale => locale.toLowerCase() === normalized) ??
    supportedLocales.find(locale =>
      normalized?.startsWith(locale.toLowerCase() + "-")
    ) ??
    defaultLang
  );
}

export function contentLocale(id: string): Locale {
  return resolveLocale(id.split("/")[0]);
}

export function localePrefix(locale?: string) {
  return withBase(`/${routeSegment[resolveLocale(locale)]}`).replace(/\/$/, "");
}

export function unlocalizedPath(pathname: string) {
  const [segment, ...rest] = withoutBase(pathname).split("/").filter(Boolean);
  const route = Object.values(routeSegment).includes(segment)
    ? rest
    : [segment, ...rest];
  return "/" + route.filter(Boolean).join("/");
}

export function localizedPath(locale: string, path: string) {
  const route = path.replace(/^\/+|\/+$/g, "");
  const prefix = localePrefix(locale);
  return route ? `${prefix}/${route}/` : `${prefix}/`;
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
  "/garden",
  "/library",
  "/research",
  "/now",
]);

export function pageAlternates(
  pathname: string,
  entryAlternates?: LocaleAlternates
): LocaleAlternates {
  if (entryAlternates) return entryAlternates;
  const path = unlocalizedPath(pathname);
  return mirroredPaths.has(path) || /^\/garden\/[\w-]+$/.test(path)
    ? { "zh-CN": localizedPath("zh-CN", path), en: localizedPath("en", path) }
    : {};
}
