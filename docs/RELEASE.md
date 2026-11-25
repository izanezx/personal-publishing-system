# Release and owner handoff

## Local and CI verification

Use the version in `.node-version` and the package manager in `package.json`.
Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm lint`,
`pnpm format:check`, and `pnpm build`. Install Chromium with
`pnpm exec playwright install --with-deps chromium`, then run `pnpm test:e2e`.
Rebuild with `PUBLIC_INDEXING_ENABLED=true` before `pnpm test:release`; the
release drill treats the root artifact as the indexed production candidate.
It starts Wrangler locally, checks both indexing modes and restores a verified
backup. This rehearsal uses the same preview policy as the release workflow
and uses loopback HTTP without a Cloudflare account.

```bash
PUBLIC_INDEXING_ENABLED=true pnpm build
pnpm test:release
```

Before a release candidate is approved, run `pnpm security:audit` and confirm
the merged GitHub dependency graph has no open high or critical alerts. The
current remediation and evidence are recorded in
[SECURITY_AUDIT.md](SECURITY_AUDIT.md).

The following Bash commands verify subpath hosting and restore the root build.

```bash
export SITE_BASE_PATH=/publishing
pnpm build
pnpm exec playwright test tests/e2e/base-path.spec.ts
unset SITE_BASE_PATH
pnpm build
```

Mount that build's `dist` at `/publishing/` on a static host that serves
directory indexes. Use an origin-level robots file pointing at the subpath
sitemap when the mount is part of a larger site. The planned Cloudflare
release serves the root artifact at `https://zanezx.com/`.

The default build uses the pinned native Astro and Pagefind packages. The VM
compatibility path replaces only the Astro compiler with the official WASM
package of the same version using `NODE_OPTIONS`. `PAGEFIND_BIN` optionally
points to a compatible Pagefind executable. For this VM we used the original
Pagefind binary under QEMU, outside the repository.

## Cloudflare and GitHub Actions

Cloudflare deployment uses two workflows:

| Workflow                        | Trigger                                                                   | Result                                                                       |
| ------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Preview`                       | Same-repository pull request                                              | Builds, deploys the preview Worker, runs smoke tests and comments the URL    |
| `Cloudflare production release` | Successful `CI` run on `main`, manual dispatch or scheduled-content check | Builds, deploys production, verifies the live site and rolls back on failure |

Repository Variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `PREVIEW_URL`
- `PRODUCTION_SMOKE_URL`
- `PUBLIC_INDEXING_ENABLED`

Environment Secrets:

- `preview/CLOUDFLARE_API_TOKEN_PREVIEW`
- `production/CLOUDFLARE_API_TOKEN_PRODUCTION`

The environment secrets are deliberately separate. Use an account-scoped
Cloudflare token with Workers Scripts edit access. Do not use a user-global
token.

The preview Worker is:

```text
https://personal-publishing-system-preview.zanezx.workers.dev
```

It is public but remains `noindex, nofollow`.

Production configuration owns one explicit hostname:

```text
zanezx.com/*
```

`www.zanezx.com` is intentionally unbound.

The production Worker also has a diagnostic Workers.dev hostname:

```text
https://personal-publishing-system.zanezx.workers.dev
```

It is used by the GitHub release workflow because zone security policies can
challenge datacenter IP addresses before a request reaches the Worker. The
diagnostic hostname is always served with `X-Robots-Tag: noindex, nofollow`
and is not the public site URL. The apex domain remains the only canonical
hostname.

The production job records the active Worker Version before deployment, runs
the live smoke suite after deployment and automatically rolls back to the
recorded Version if verification fails.

## Sveltia CMS and media

- CMS: `https://zanezx.com/admin/`
- Authentication Worker: `https://sveltia-auth.zanezx.com`
- R2 bucket: `personal-publishing-media`
- Public media origin: `https://media.zanezx.com`

Sveltia uses the simple workflow. Save commits directly to `main`; there is no
content branch, CMS Pull Request or pending-publication label. If CI fails,
production remains on the previously verified Worker Version.

The GitHub App is restricted to the single project repository. The R2 token
is restricted to the single media bucket. Follow the complete setup and
approval sequence in [ACCOUNT_SETUP.zh-CN.md](ACCOUNT_SETUP.zh-CN.md).

## Release approval

Content publication and search-engine indexing are separate decisions. The
workflow may deploy approved content automatically while
`PUBLIC_INDEXING_ENABLED=false`.

Do not set `PUBLIC_INDEXING_ENABLED=true` until the owner has approved:

- final identity and public links;
- launch content and media rights;
- privacy and security contact details;
- the exact production commit;
- the first public indexing date.

After approval, change the variable and run the production workflow. Verify
`robots.txt`, Sitemap, canonical URLs and the absence of `X-Robots-Tag`
before submitting the Sitemap to search engines.

## Launch inputs

- [x] Resolve the dependency security alerts and add an audit gate to CI.
- [x] Vendor and content-pin project Skills; verify them in CI.
- [x] Make the repository public and mark it as a GitHub Public template.
- [ ] Approve public content. The current Markdown, MDX and color gallery
      fixtures verify the workflow.
- [ ] Confirm the display name `zanezx` or give the final name.
- [ ] Add author credit, bilingual descriptions and chosen public links.
- [ ] Provide licensed logo or media assets if wanted.
- [ ] Publish a private conduct and security reporting contact.
- [x] Bind the production apex hostname.
- [ ] Configure the GitHub App and R2 editor credentials.
- [ ] Confirm the first automated CMS publication.
- [ ] Create the stable `v0.1.0` release after owner approval.
- [ ] Re-enable Dependabot version updates when regular maintenance begins.
