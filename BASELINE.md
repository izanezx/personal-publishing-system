# Imported baseline

- Source: Devosfera commit `bba247e2f95e352b3984a842e1a39467f3891b3d`.
- Runtime: Node.js 24.22.3, pnpm 10.28.0, original frozen lockfile.
- Native Linux compiler: on the development VM, loading `@astrojs/compiler-binding-linux-x64-gnu@0.5.3` exits with SIGILL. A direct Node.js require reproduces it before application code runs.
- Local compatibility verification uses the official WASM variant of the same compiler version through a temporary Node loader limited to that package. This workaround is outside the repository and does not change the default CI build.

## Original behavior

The import provides English and Spanish routes, archive and tag pages, galleries, keyboard search, mobile table of contents, reading mode, theme toggle and RSS. The original search build copied its index into `public/`. The original Vercel config applied `noindex` to all responses. These are baseline observations.

## Reproduce

Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm lint`, `pnpm format:check` and `pnpm build`. The original six unit tests passed. Native lint, formatting and build failed with the compiler crash above. On this VM, use the WASM compiler when verifying the same source and record the compatibility path with the results.
