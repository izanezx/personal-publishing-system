# Contributing

Use the pinned toolchain and read AGENTS.md, BASELINE.md and ARCHITECTURE.md.
Link each PR to the corresponding project issue and specify the checks run.
Create short-lived `feat/`, `fix/`, `docs/` or `chore/` branches from `main`;
do not merge an upstream project's branch history into this repository.

A change to routes, publication filtering or reader controls must exercise the
matching browser scenario. Describe imported behavior and its exact upstream
version or commit in UPSTREAM_IMPORTS.md. Follow docs/RELEASE.md for preview,
production and rollback.
