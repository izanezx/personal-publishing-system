# Upstream baselines

| Project    | Reference                                        | Role                                             |
| ---------- | ------------------------------------------------ | ------------------------------------------------ |
| Devosfera  | bba247e2f95e352b3984a842e1a39467f3891b3d         | Licensed source baseline and reading experience  |
| AstroPaper | v7.2.0, ffd0260a2947eea93a2f5bb80029edf5654c0e8a | Selected engineering and publishing improvements |
| AstroWind  | 14e1a691f80548dcc36370847b1a02c0d0b12821         | Component and Agent engineering reference        |

`origin` points to `izanezx/personal-publishing-system`. Upstream projects are
inspected in separate temporary read-only checkouts; they are not configured as
remotes in the maintained project and are not part of its Git history.

The imported Devosfera snapshot keeps the upstream MIT notice and this record
of provenance. Future upstream changes are evaluated individually, adapted to
the local architecture, tested, and recorded in `UPSTREAM_IMPORTS.md`. They are
not merged through the upstream commit history.
