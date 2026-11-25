export function isPreviewContentEnabled() {
  return (
    process.env.PUBLIC_PREVIEW_CONTENT === "true" ||
    process.env.PUBLIC_PREVIEW_CONTENT === "1"
  );
}
