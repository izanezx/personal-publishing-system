export interface GoneManifestEntry {
  path: string;
  status: "expired" | "withdrawn" | "deleted";
  redirectTo?: string;
  effectiveAt?: string;
}

export interface GoneMatch {
  status: 301 | 410;
  redirectTo?: string;
}

export function findGoneMatch(
  pathname: string,
  entries: readonly GoneManifestEntry[],
  now = Date.now()
): GoneMatch | undefined {
  const entry = entries.find(
    item =>
      item.path === pathname &&
      (!item.effectiveAt || new Date(item.effectiveAt).getTime() <= now)
  );
  if (!entry) return undefined;
  if (entry.status === "deleted" && !entry.redirectTo) return undefined;
  return entry.redirectTo
    ? { status: 301, redirectTo: entry.redirectTo }
    : { status: 410 };
}
