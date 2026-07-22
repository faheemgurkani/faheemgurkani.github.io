# Future Planned Features

Ideas for the retro-brutalist portfolio. **Not implemented** unless marked done.

## Portfolio

- [ ] **Active repo border highlight** — Highlight the borders of project cards whose GitHub repos received live commits within the last three days.

  - **Data:** Use repo push/commit timestamps (e.g. GitHub `pushed_at` or recent commit activity), available from the live API and/or baked `github-projects.json`.
  - **UI:** Apply a distinct border style to matching `.project-card` elements in the portfolio grid.
  - **Scope:** Public repos with a linked GitHub URL; extend to private repos if push data is available via authenticated bake.
