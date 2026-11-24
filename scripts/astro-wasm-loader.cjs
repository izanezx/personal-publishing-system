"use strict";

// Node preload hooks run as CommonJS before the ESM application starts.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Module = require("node:module");

const nativeBindings = new Set([
  "@astrojs/compiler-binding-linux-x64-gnu",
  "@astrojs/compiler-binding-linux-x64-musl",
]);
const resolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveAstroCompiler(request, ...args) {
  if (nativeBindings.has(request)) {
    return resolveFilename.call(
      this,
      "@astrojs/compiler-binding-wasm32-wasi",
      ...args
    );
  }

  const packageJsonSuffix = "/package.json";
  if (request.endsWith(packageJsonSuffix)) {
    const packageName = request.slice(0, -packageJsonSuffix.length);
    if (nativeBindings.has(packageName)) {
      return resolveFilename.call(
        this,
        `@astrojs/compiler-binding-wasm32-wasi${packageJsonSuffix}`,
        ...args
      );
    }
  }

  return resolveFilename.call(this, request, ...args);
};
