import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = new URL("../dist/pagefind/", import.meta.url);
const wrapper = fileURLToPath(
  new URL("../node_modules/pagefind/lib/runner/bin.cjs", import.meta.url)
);

rmSync(output, { recursive: true, force: true });
const executable = process.env.PAGEFIND_BIN || process.execPath;
const args = [...(process.env.PAGEFIND_BIN ? [] : [wrapper]), "--site", "dist"];
const result = spawnSync(executable, args, { cwd: root, stdio: "inherit" });
if (result.error) {
  process.stderr.write(`Pagefind could not start: ${result.error.message}\n`);
}
if (result.signal) {
  process.stderr.write(`Pagefind stopped with signal ${result.signal}\n`);
}
process.exitCode = result.status ?? 1;
