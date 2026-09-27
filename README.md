# wilist-tests

Test suite for the [wilist](https://github.com/ppeerr/wilist) project — a wishlist application (Go API + React UI).

## Structure

- `postman/` — API tests: Postman collection and environment
- `e2e/` — UI tests: Playwright
- `docker-compose.yml` — runs the app and the e2e suite together in containers
- `.github/workflows/ci.yml` — per-commit CI (API + UI tests)
- `.github/workflows/cross-platform.yml` — manual OS/browser matrix run

## Prerequisites

This repository contains tests only. The `wilist` application lives in a separate
repository and must be started separately before any test run (unless you use
Docker Compose — see below).

## Running API tests (Postman)

1. Import `postman/wilist.postman_collection.json` and
   `postman/wilist.postman_environment.json` into Postman
2. Select the `wilist local` environment
3. Run the collection via Collection Runner

Note: the `regression` folder relies on `smoke` running first.

## Running UI tests (Playwright)

    cd e2e
    npm install
    npx playwright test

## Running everything in Docker

Requires `wilist` checked out as a sibling of this repo (`~/projects/wilist` and
`~/projects/wilist-tests` side by side).

```
cd ~/projects/wilist-tests
docker compose up --build --abort-on-container-exit
```

This builds both the app (from `../wilist`) and the Playwright suite, waits for
the app's `/health` check, then runs the chromium suite against it.
`--abort-on-container-exit` shuts the app container down as soon as the test
container finishes, so nothing keeps running in the background.

### App Dockerfile (`wilist/Dockerfile`, in the app repo)

Multi-stage build:
- **Stage 1 (builder)** — `golang:1.22-alpine`, compiles the binary only (`CGO_ENABLED=0 go build`); not part of the final image.
- **Stage 2 (runtime)** — `alpine:3.20` (not `scratch`: needs `curl` for the healthcheck and a shell for `docker exec` debugging).
- `HEALTHCHECK` hits the existing `GET /health`.
- `ENV PORT=8080`, matching the app's default.

### Test Dockerfile (`e2e/Dockerfile`)

- Base image: `mcr.microsoft.com/playwright:v1.63.0-jammy` (browsers and their system deps are already in the image — no `playwright install --with-deps` needed).
- Keep the tag version in sync with `@playwright/test` in `package.json`.
- `ENV BASE_URL` is overridden by `docker-compose.yml`.
- Default `CMD` runs chromium, same as local `npm test`.

### Docker troubleshooting

- **Rosetta failed to install** (Docker Desktop, Apple Silicon, `VZErrorDomain Code=1`) — run `softwareupdate --install-rosetta --agree-to-license` manually, or disable "Use Rosetta..." under Docker Desktop → Settings → General (not needed here — the image is arm64 native).
- **`docker: command not found`** right after installing Docker Desktop — open a new terminal window; an already-open one won't pick up the updated `PATH`.
- **`port is already allocated`** — a leftover container from a previous run is still holding the port. Check `docker ps -a` and remove stale containers (`docker rm`) before the next run.

## CI

`.github/workflows/ci.yml` in this repo (private). The app lives in a separate
repo, `ppeerr/wilist`, reached via a PAT (secret `PPEERR_PAT`, classic token,
`repo` scope) — collaborator write access is enough, no action needed from the
`ppeerr` owner.

**What it runs:** the Postman collection via Newman (`postman/`) and the
Playwright suite (`e2e/`), both against a `wilist` binary built from source in
CI. Storage is in-memory, so every run starts from a clean state (plus the two
default items the app seeds on startup).

**Triggers:** `push`/`pull_request` to `main` of this repo, or manually via
**Run workflow**. A new push to the same PR cancels the previous run.
Changes to the app repo (`ppeerr/wilist`) do **not** trigger this workflow —
after an app change, trigger a run manually.

**Ports:** the app runs on `:8081` (`WILIST_PORT`), separate from a local
Postman instance on `:8080`.

**Jobs:**
- `build` — checks out `ppeerr/wilist`, builds the React UI and the Go binary, uploads it as an artifact
- `api-tests` (needs `build`) — starts the app, runs Postman via Newman, writes Allure results
- `e2e-ui-tests` (needs `build`) — starts the app, runs Playwright with `--project=chromium` only (webkit/firefox are configured but excluded from this per-commit workflow — see "Manual cross-platform run" below)
- `allure-report` (needs both, always runs) — merges both result sets into one HTML Allure report, downloadable from the run's Artifacts (no auto-publish yet)

The app is built once in `build` and reused — the test jobs don't rebuild it.

**Practices baked into the workflow:**
- build once, pass the binary as an artifact
- no `continue-on-error` on test steps — a real failure fails the job (`if: always()` still uploads results)
- `concurrency` cancels superseded runs
- narrow triggers (`branches: [main]`) so push + pull_request don't double-run the same commit
- `permissions: contents: read` instead of the default token permissions
- `timeout-minutes` on every job
- polling `/health` instead of a fixed `sleep`
- pinned tool versions (`newman` 6.2.2, `newman-reporter-allure` 3.12.2, `allure-commandline` 2.29.0)
- `npm ci` instead of `npm install`
- caching npm dependencies and Playwright browsers

### Manual cross-platform run

`.github/workflows/cross-platform.yml`, `workflow_dispatch` only (not part of
per-commit CI — macOS/Windows runners are 10x/2x the cost of Linux). Runs the
same Playwright suite across `ubuntu-latest` × chromium/webkit/firefox,
`macos-latest` × chromium, `windows-latest` × chromium.

### Known limitations

- webkit/firefox are not in the per-commit `ci.yml` — a deliberate choice
  (CI-minute cost), not a technical blocker. `cross-platform.yml` is the only
  way to run them for now.
- The Allure report has to be downloaded manually from Artifacts; no
  auto-publish.

## Test documentation

The full case table, expected results and known API behaviour are kept in the
project's Obsidian vault: `Pet project - ppeerr wilist/Postman/postman api cases table.md`
