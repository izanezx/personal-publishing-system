# Imported baseline

- Source: Devosfera commit `bba247e2f95e352b3984a842e1a39467f3891b3d`.
- Runtime: Node.js 24.22.3, pnpm 10.28.0, original frozen lockfile.
- Native Linux compiler: on the development VM, loading `@astrojs/compiler-binding-linux-x64-gnu@0.5.3` exits with SIGILL. A direct Node.js require reproduces it before application code runs.
- Local compatibility verification uses the official WASM variant of the same compiler version through a temporary Node loader limited to that package. This workaround is outside the repository and does not change the default CI build.

## Original behavior

The import provides English and Spanish routes, archive and tag pages, galleries, keyboard search, mobile table of contents, reading mode, theme toggle and RSS. The original search build copied its index into `public/`. The original Vercel config applied `noindex` to all responses. These are baseline observations.

## Reproduce

Use `corepack enable pnpm` if the pinned Node installation does not expose
pnpm yet. Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm lint`, `pnpm format:check` and `pnpm build`. The original six unit tests passed. Native lint, formatting and build failed with the compiler crash above. On this VM, use the WASM compiler when verifying the same source and record the compatibility path with the results.

## Verified on the development VM

The Linux development VM lacked a system font with Chinese glyphs. The
bundled, OFL-licensed Noto Sans CJK SC was installed in the current user's
font directory for Chromium. The site uses system font fallback for reader
text and the bundled font for OG rendering.

The same-version WASM compiler completed Astro checks, formatting and a 109-page static build. Pagefind 1.6.0 also required an x86 emulator on this VM. It indexed 22 pages and 4,558 words in English and Spanish. Chromium loaded the home pages, an article, a gallery and RSS, and the keyboard search modal returned the expected PostgreSQL article. The compatibility commands and screenshot were kept outside the checkout.

## Local comparison

The retained home screenshot and original test and build logs are in the
checkout's local evidence directory, shown by
`git rev-parse --git-path pps-evidence`. The comparison below uses five fresh
Chromium contexts per route, a 390 × 844 viewport, reduced motion, loopback
HTTP and the median of each metric. Sizes are decoded resource bytes. The
original article and current MDX demonstration use different content.

| Artifact and route                  | LCP (ms) |    CLS | HTML (bytes) | JS (bytes) | CSS (bytes) |
| ----------------------------------- | -------: | -----: | -----------: | ---------: | ----------: |
| Devosfera home                      |      292 | 0.0164 |       103535 |      26162 |      157452 |
| Local candidate home                |      292 | 0.0000 |        68601 |      22978 |      170256 |
| Devosfera PostgreSQL article        |      368 | 0.0025 |       136920 |      33791 |      163872 |
| Local candidate interactive article |      224 | 0.0053 |        83851 |      32670 |      176826 |

The candidate home loads 3184 fewer decoded JavaScript bytes and 12804
more decoded CSS bytes than the original home. The browser regression
suite records local budgets for the home and interactive article.
