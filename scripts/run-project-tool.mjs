#!/usr/bin/env node

import { runTool } from "./project-tool.mjs";

const [tool, ...args] = process.argv.slice(2);

if (!tool) {
  process.stderr.write(
    "Usage: node scripts/run-project-tool.mjs <tool> [...args]\n"
  );
  process.exitCode = 1;
} else {
  try {
    process.exitCode = await runTool(tool, args);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
    process.exitCode = 1;
  }
}
