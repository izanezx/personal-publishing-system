import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function applyPreviewPolicy(directory) {
  const headerPath = resolve(directory, "_headers");
  const headers = await readFile(headerPath, "utf8");
  const hasGlobalNoindex =
    /(?:^|\n)\/\*\s*\n(?:[ \t]+[^\n]*\n)*?[ \t]+X-Robots-Tag:\s*noindex,\s*nofollow/i.test(
      headers
    );
  if (!hasGlobalNoindex) {
    await writeFile(
      headerPath,
      `${headers.trimEnd()}\n\n/*\n  X-Robots-Tag: noindex, nofollow\n`
    );
  }
  await writeFile(
    resolve(directory, "robots.txt"),
    "User-agent: *\nDisallow: /\n"
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await applyPreviewPolicy(process.argv[2] ?? "dist");
}
