import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

function linuxX64SupportsAvx2() {
  if (process.platform !== "linux" || process.arch !== "x64") {
    return true;
  }

  try {
    const cpuInfo = readFileSync("/proc/cpuinfo", "utf8");
    return /^flags\s*:.*\bavx2\b/m.test(cpuInfo);
  } catch {
    return true;
  }
}

function resolveTool(name) {
  const packagePath = require.resolve(`${name}/package.json`);
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
  const bin =
    typeof packageJson.bin === "string"
      ? packageJson.bin
      : packageJson.bin?.[name];

  if (!bin) {
    throw new Error(`Package "${name}" does not expose a "${name}" executable`);
  }

  return join(dirname(packagePath), bin);
}

export function createToolEnvironment(extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };
  const forceWasm = process.env.ASTRO_COMPILER_WASM === "1";
  const forceNative = process.env.ASTRO_COMPILER_NATIVE === "1";

  if (!forceNative && (forceWasm || !linuxX64SupportsAvx2())) {
    const loader = require.resolve("./astro-wasm-loader.cjs");
    const nodeOptions = [
      process.env.NODE_OPTIONS,
      `--require=${loader}`,
      "--disable-warning=ExperimentalWarning",
    ]
      .filter(Boolean)
      .join(" ");
    env.NODE_OPTIONS = nodeOptions;
    delete env.NAPI_RS_NATIVE_LIBRARY_PATH;
  }

  return env;
}

export function runTool(name, args = [], extraEnv = {}) {
  const executable = resolveTool(name);
  const child = spawn(process.execPath, [executable, ...args], {
    env: createToolEnvironment(extraEnv),
    stdio: "inherit",
  });

  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${name} exited after signal ${signal}`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}
