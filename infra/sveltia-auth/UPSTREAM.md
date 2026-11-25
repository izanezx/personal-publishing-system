# Upstream source

- Repository: `https://github.com/sveltia/sveltia-cms-auth`
- Revision: `e62e76ae5ca4dd28e751607b331bb47bb1feddfe`
- Imported: 2026-11-25
- License: MIT, preserved in `LICENSE.txt`

Changes from the upstream revision:

- Pin the Worker name and production custom domain.
- Disable `workers.dev` and preview URLs for the production Worker.
- Enable Workers Logs.
- Allow the production site plus Sveltia's documented local development hostnames through `ALLOWED_DOMAINS`.

The copied directory is authoritative after import. Updating it requires a reviewed change against a newly pinned upstream revision.
