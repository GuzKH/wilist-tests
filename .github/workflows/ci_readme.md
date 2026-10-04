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

- **`api-tests`** — builds and starts wilist, runs the Postman collection via Newman, writes Allure results
- **`e2e-ui-tests`** — builds and starts wilist, runs Playwright, writes Allure results
- **`allure-report`** (needs `api-tests`, `e2e-ui-tests`, runs always) — merges results from both jobs into one combined Allure HTML report, even if one of them failed

`api-tests` and `e2e-ui-tests` run in parallel. Each one builds the app itself through the composite action `.github/actions/build-and-start-wilist` (checkout of `ppeerr/wilist` → React UI build → Go build → start in background → wait for `/health`).

Why not build once and share the binary as an artifact: this repo is public, and artifacts of a public repo can be downloaded by any signed-in GitHub user. The app repo is private, so its binary must not be published. Building per job costs about 40 s and the jobs run in parallel, so total run time barely changes.

## Branch protection

A ruleset `main-protection` (Settings → Rules → Rulesets) applies to `main`:

- changes go in only through a pull request (0 required approvals — single-maintainer repo)
- required status checks: `api-tests` and `e2e-ui-tests` — a PR can't be merged while either is red
- force pushes and branch deletion are blocked
- no bypass list — the rule applies to the repo owner too

## Flaky tests

Playwright retries failed tests on CI (`retries: 2`), but the run uses `--fail-on-flaky-tests`: a test that passes only on retry still fails the job. Retries help debugging (trace is recorded on the first retry), but can't turn a real failure into a green build.

## Browser coverage

`e2e-ui-tests` runs Playwright with `--project=chromium` only. webkit and firefox are configured in `playwright.config.ts` but excluded from this per-commit workflow — kept out deliberately for CI-minute cost, not because of a technical blocker (see "Manual cross-platform run" below).

## Manual cross-platform run

A separate workflow, `.github/workflows/cross-platform.yml`, `workflow_dispatch` only — not part of per-commit CI, since macOS/Windows runners cost 10x/2x a Linux one.

- Runs the same Playwright suite across `ubuntu-latest` × chromium/webkit/firefox, `macos-latest` × chromium, `windows-latest` × chromium
- This is the only way to run webkit/firefox for now — folding them into `ci.yml` was considered and declined (27.09), purely for CI-minute cost

## Secrets

- `PPEERR_PAT` — personal access token (classic, scope `repo`) from the `GuzKH` account, used to check out the private `ppeerr/wilist` repo. Stored in Settings → Secrets and variables → Actions of the `wilist-tests` repo.

## Port

wilist runs on `:8081` (the `WILIST_PORT` variable at the top of the workflow) — doesn't clash with the local Postman instance on `:8080`.

## Report

The final Allure report (`allure-report`) is an artifact of the last job — download it manually from the run page (Actions → the run → Artifacts). No auto-publishing (GitHub Pages etc.) yet.

## Practices applied

- **Required checks on `main`** — a red CI blocks the merge instead of just showing a red mark
- **No flaky greens** — `--fail-on-flaky-tests` makes a pass-on-retry a failure
- **No private binaries in public artifacts** — the app is built inside each test job and never uploaded
- **Reusable composite action** — build + start logic lives in one place instead of being copied into every job
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

- `PPEERR_PAT` is a classic token with scope `repo` — it gives read **and write** access to every repo the `GuzKH` account can reach. Planned replacement: a read-only deploy key on `ppeerr/wilist` (needs the owner of `ppeerr/wilist` to add it)
- CI runs only on changes to this repo - nightly at 03:17 UTC (`schedule`) — tests the latest `ppeerr/wilist` even when this repo doesn't change; the tested app commit is shown on the run's Summary page
- `cross-platform.yml` still has its own copy of the build/start steps (it needs the `.exe` suffix on Windows) — not yet moved to the composite action
- `newman`, `newman-reporter-allure`, and `allure-commandline` versions are pinned in the workflow — update them manually and verify locally when bumping
- The Playwright browser cache key is based on `e2e/package-lock.json` — it self-invalidates when the Playwright version changes
- The Allure report has to be downloaded manually from Artifacts; no auto-publish
