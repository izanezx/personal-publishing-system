import { ui } from "./ui";
import { localizedPath, resolveLocale, unlocalizedPath } from "./locales";

export function useTranslations(lang?: string | null) {
  return (key: keyof typeof ui.en) => ui[resolveLocale(lang)][key];
}

export function getTargetLanguageUrl(pathname: string, targetLocale: string) {
  return localizedPath(targetLocale, unlocalizedPath(pathname));
}

export function isActive(currentPath: string, targetPath: string) {
  const current = unlocalizedPath(currentPath);
  const target = targetPath.replace(/\/+$/, "") || "/";
  return (
    current === target || (target !== "/" && current.startsWith(target + "/"))
  );
}
