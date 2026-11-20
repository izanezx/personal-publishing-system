# Release and owner handoff

## Local and CI verification

Use the version in `.node-version` and the package manager in `package.json`.
Run `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm lint`,
`pnpm format:check`, and `pnpm build`. Install Chromium with
`pnpm exec playwright install --with-deps chromium`, then run `pnpm test:e2e`.

The default build uses the pinned native Astro and Pagefind packages. The VM
compatibility path replaces only the Astro compiler with the official WASM
package of the same version using `NODE_OPTIONS`. `PAGEFIND_BIN` optionally
points to a compatible Pagefind executable. For this VM we used the original
Pagefind binary under QEMU, outside the repository.

## Cloudflare

1. The repository owner connects the intended Cloudflare account and creates
   a token with Workers Scripts edit access restricted to that account. Add
   `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` as GitHub Actions secrets.
2. Run the Cloudflare Release workflow on a green `main` commit with
   `target=preview`. Supply public sample content only unless Cloudflare
   Access already restricts the preview hostname.
3. Verify the preview response contains `X-Robots-Tag: noindex, nofollow`.
   Check desktop and mobile navigation, a pair of translations, a
   Chinese-only page, search in both languages, feeds, 404 and gallery.
   Record the candidate run ID and verify a preview rollback before release.
4. The owner approves the content, domain configuration and candidate run.
   Run the workflow on main with `target=production`, the successful
   `preview_run` and `owner_approved=true`.
5. The owner checks existing services on `zanezx.com` in the Cloudflare
   dashboard and binds the production Worker. Verify HTTPS, the canonical
   hostname, production indexing, RSS, sitemap and the same reader flows.
   Record commit SHA, artifact checksum and Worker version, then create
   the owner's first release, `v0.1.0`.
6. For a failed first release, restore the prior hostname configuration.
   For later regressions, roll back to the previous verified Worker version
   and create a corrective PR.

## Launch inputs

- [ ] Approve public content. The current Markdown, MDX and color gallery
      fixtures verify the workflow.
- [ ] Confirm the display name `zanezx` or give the final name.
- [ ] Add author credit, bilingual descriptions and chosen public links.
- [ ] Provide licensed logo or media assets if wanted.
- [ ] Confirm the production hostname binding and first release.
