# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static GitHub Pages portfolio** (HTML/CSS/JS). There is no `package.json`, Docker stack, database, or build step.

### Running locally

Serve the repo root with any static HTTP server. Relative asset paths require HTTP (not `file://`).

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/` (landing) or project paths under `/projects/` (e.g. `http://127.0.0.1:8000/projects/todoList/`).

### Services

| Service | Role |
|---------|------|
| Static HTTP server | **Required** — only in-repo “runtime” |
| Internet / CDNs | **Often needed** — Bootstrap, jQuery, fonts, Font Awesome load from CDNs on many pages |
| Ron Swanson API | **Optional** — only for `/projects/ron-swanson/` quote buttons |
| External Heroku apps | **Optional** — linked from portfolio pages; not in this repo |

### Lint / test / build

There are no in-repo lint configs, test runners, or build commands. Validation is manual: serve static files and verify pages in a browser.

### Long-running dev server

Use **tmux** for the HTTP server so it survives across agent steps, e.g. session name `static-http-server` with `python3 -m http.server 8000` from `/workspace`.
