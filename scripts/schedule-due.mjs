const validTimestamp = value =>
  typeof value === "string" && Number.isFinite(new Date(value).getTime());

export function classifyScheduleManifest(entries, now = Date.now()) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const dueAt = field =>
    safeEntries.filter(
      entry =>
        validTimestamp(entry?.[field]) &&
        new Date(entry[field]).getTime() <= now
    );

  const activations = dueAt("activateAt");
  const expirations = dueAt("expireAt");
  const archives = dueAt("archiveAt");

  return {
    activations,
    expirations,
    archives,
    rebuildRequired:
      activations.length > 0 || expirations.length > 0 || archives.length > 0,
  };
}
