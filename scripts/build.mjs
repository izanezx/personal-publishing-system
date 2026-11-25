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

  for (const script of [
    "scripts/validate-media-sources.mjs",
    "scripts/index-search.mjs",
    "scripts/finalize-index.mjs",
  ]) {
    const child = spawn(process.execPath, [script], {
      env: process.env,
      stdio: "inherit",
    });
    const code = await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (exitCode, signal) => {
        if (signal) {
          reject(new Error(`${script} exited after signal ${signal}`));
          return;
        }
        resolve(exitCode ?? 1);
      });
    });
    if (code !== 0) {
      process.exitCode = code;
      process.exit();
    }
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
}
