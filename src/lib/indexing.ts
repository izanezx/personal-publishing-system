export function isPublicIndexingEnabled() {
  const value =
    process.env.PUBLIC_INDEXING_ENABLED ??
    import.meta.env?.PUBLIC_INDEXING_ENABLED;
  return value === "true" || value === "1";
}
