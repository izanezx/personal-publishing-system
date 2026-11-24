import type { ContentEntry } from "./contentEntry";

export function isPublished(
  data: Pick<ContentEntry["data"], "draft" | "pubDatetime">,
  now = Date.now()
) {
  return !data.draft && new Date(data.pubDatetime).getTime() <= now;
}

const buildTime = Date.now();

export default function postFilter({ data }: ContentEntry) {
  return isPublished(data, buildTime);
}
