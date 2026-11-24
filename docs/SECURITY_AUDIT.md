# Dependency security audit

Audit date: 2026-11-24

## Scope

This record covers the production dependency graph and build toolchain of the
Personal Publishing System. It resolves the release gate tracked by Issue #25.
The starting GitHub state on `main` reported 38 open Dependabot alerts: 23 high,
10 medium and 5 low.

## Remediation

Direct dependencies updated:

| Package                     | Before | After  |
| --------------------------- | ------ | ------ |
| `astro`                     | 7.4.12 | 7.4.13 |
| `@astrojs/sitemap`          | 3.7.5  | 3.7.6  |
| `rehype-callouts`           | 2.1.2  | 2.2.0  |
| `unist-util-visit`          | 5.0.0  | 5.2.0  |
| `sharp`                     | 0.34.5 | 0.35.5 |
| `satori`                    | 0.26.0 | 0.63.2 |
| `@typescript-eslint/parser` | 8.72.2 | 8.74.0 |
| `typescript-eslint`         | 8.72.2 | 8.74.0 |

Patched transitive ranges are pinned through `pnpm.overrides`:

| Package                          | Resolution |
| -------------------------------- | ---------- |
| `esbuild`                        | 0.28.2     |
| `fast-uri`                       | 3.1.9      |
| `fast-xml-parser`                | 5.12.1     |
| `fflate`                         | 0.7.5      |
| `nanoid@3`                       | 3.3.20     |
| `postcss`                        | 8.5.33     |
| `postcss-selector-parser@6.0.10` | 6.1.6      |
| `postcss-selector-parser@^7.1.0` | 7.2.1      |
| `source-map-js`                  | 1.2.4      |
| `zod`                            | 4.6.7      |

## Verification

`pnpm audit --audit-level=high` reports zero vulnerabilities across 685
dependencies, including zero high and zero critical findings.

The updated lockfile passed:

- Frozen offline installation.
- Astro check with zero errors, warnings or hints.
- Root static build with 56 pages and all eight local Open Graph PNGs.
- Pagefind index with 10 public entries in Chinese and English.
- 14 unit tests.
- 15 Chromium end-to-end, accessibility-flow and performance tests.
- Root and `/publishing/` subpath builds.
- Local Cloudflare preview policy, production HTTP response, checksum and
  rollback rehearsal.
- ESLint and Prettier checks.

The GitHub alert count is rechecked against the merged `main` dependency graph
before Issue #25 is closed. CI runs `pnpm security:audit` on Linux and Windows.

## Developer VM compatibility

The development VM does not expose AVX2 to native Astro compiler and Pagefind
binaries. The repository now selects the official Astro WASI compiler on x64
Linux systems where AVX2 is unavailable. `ASTRO_COMPILER_WASM=1` and
`ASTRO_COMPILER_NATIVE=1` provide explicit overrides. Native CI runners keep
their normal binaries.

Pagefind compatibility on this VM uses an external compatible binary through
`PAGEFIND_BIN`; that executable is not bundled or trusted by the repository.
Normal releases use the pinned Pagefind package.
