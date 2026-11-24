#!/usr/bin/env node

import { spawn } from "node:child_process";
import { runTool } from "./project-tool.mjs";

try {
  const checkCode = await runTool("astro", ["check"]);
  if (checkCode !== 0) {
    process.exitCode = checkCode;
    process.exit();
  }

  const buildCode = await runTool("astro", ["build"]);
  if (buildCode !== 0) {
    process.exitCode = buildCode;
    process.exit();
  }

  const child = spawn(process.execPath, ["scripts/index-search.mjs"], {
    env: process.env,
    stdio: "inherit",
  });
  process.exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`search index exited after signal ${signal}`));
        return;
      }
      resolve(code ?? 1);
    });
  });
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
}
