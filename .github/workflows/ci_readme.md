# CI — wilist-tests

Workflow: `.github/workflows/ci.yml`

## What it checks

- **API tests** — Postman collection run via Newman (`postman/`)
- **UI e2e tests** — Playwright (`e2e/`)
- Both suites run against the `ppeerr/wilist` app, built from source by CI (in-memory storage, fresh state on every run)

## Triggers

- `push` and `pull_request` to `main`
- manual — **Run workflow** button (`workflow_dispatch`)
- a new push to the same PR cancels the previous in-progress run (`concurrency`)

## Jobs

- **`build`** — checks out `ppeerr/wilist`, builds the React UI and the Go binary, uploads it as an artifact
- **`api-tests`** (needs `build`) — starts wilist, runs the Postman collection via Newman, writes Allure results
- **`e2e-ui-tests`** (needs `build`) — starts wilist, runs Playwright, writes Allure results
- **`allure-report`** (needs `api-tests`, `e2e-ui-tests`, runs always) — merges results from both jobs into one combined Allure HTML report, even if one of them failed

The app is built once in `build` and reused — `api-tests` and `e2e-ui-tests` don't rebuild it.

## Secrets

- `PPEERR_PAT` — personal access token (classic, scope `repo`) from the `GuzKH` account, used to check out the private `ppeerr/wilist` repo. Stored in Settings → Secrets and variables → Actions of the `wilist-tests` repo.

## Port

wilist runs on `:8081` (the `WILIST_PORT` variable at the top of the workflow) — doesn't clash with the local Postman instance on `:8080`.

## Report

The final Allure report (`allure-report`) is an artifact of the last job — download it manually from the run page (Actions → the run → Artifacts). No auto-publishing (GitHub Pages etc.) yet.

## Practices applied

- **Build once, reuse everywhere** — the app is built in one job and passed to both test jobs as an artifact, instead of each job rebuilding it
- **Fail on real failure** — no `continue-on-error` on test steps; a failing test fails the job. Result upload still runs via `if: always()`
- **Concurrency control** — a new push cancels the previous in-progress run on the same branch/PR, instead of queuing redundant runs
- **Scoped triggers** — push/pull_request limited to `main`, avoiding the double run that `push` + `pull_request` on the same commit would otherwise cause
- **Least-privilege permissions** — `permissions: contents: read` set explicitly instead of relying on the default token scope
- **Timeouts on every job** — caps a hung process instead of letting it run to the default 360-minute limit
- **Health-check polling** — waits on `/health` in a retry loop instead of a fixed `sleep`, which is fragile on a slow runner
- **Pinned tool versions** — `newman`, `newman-reporter-allure`, `allure-commandline` pinned so a new release can't silently change behavior
- **Reproducible installs** — `npm ci` (lockfile-based) instead of `npm install` everywhere
- **Caching** — npm dependencies and Playwright browser binaries are cached, keyed off the lockfile

## Known limitations

- `newman`, `newman-reporter-allure`, and `allure-commandline` versions are pinned in the workflow — update them manually and verify locally when bumping
- The Playwright browser cache key is based on `e2e/package-lock.json` — it self-invalidates when the Playwright version changes
