import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function applyPreviewPolicy(directory) {
  const headerPath = resolve(directory, "_headers");
  const headers = await readFile(headerPath, "utf8");
  if (/(?:^|\n)\s*X-Robots-Tag:/i.test(headers)) {
    throw new Error("Expected a production artifact without X-Robots-Tag");
  }
  await writeFile(
    headerPath,
    `${headers.trimEnd()}\n\n/*\n  X-Robots-Tag: noindex, nofollow\n`
  );
  await writeFile(
    resolve(directory, "robots.txt"),
    "User-agent: *\nAllow: /\n"
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await applyPreviewPolicy(process.argv[2] ?? "dist");
}
