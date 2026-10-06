# CI — wilist-tests

Workflow: `.github/workflows/ci.yml`

## What it checks

- **API tests** — Postman collection run via Newman (`postman/`)
- **UI e2e tests** — Playwright (`e2e/`)
- Both suites run against the `ppeerr/wilist` app, built from source by CI (in-memory storage, fresh state on every run)

## Triggers

- `push` and `pull_request` to `main`
- nightly at 03:17 UTC (`schedule`) — tests the latest `ppeerr/wilist` even when this repo doesn't change
- manual — **Run workflow** button (`workflow_dispatch`)
- a new push to the same PR cancels the previous in-progress run (`concurrency`)

## Jobs

- **`api-tests`** — builds and starts wilist, runs the Postman collection via Newman, writes Allure results
- **`e2e-ui-tests`** — builds and starts wilist, runs Playwright, writes Allure results
- **`allure-report`** (needs `api-tests`, `e2e-ui-tests`, runs always) — merges results from both jobs into one combined Allure HTML report, even if one of them failed, and on `main` publishes it to GitHub Pages (see "Report" below)

`api-tests` and `e2e-ui-tests` run in parallel. Each one builds the app itself through the composite action `.github/actions/build-and-start-wilist` (checkout of `ppeerr/wilist` → React UI build → Go build → start in background → wait for `/health`). The exact app commit under test is written to the run's Summary page.

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

- **`e2e-cross-os`** (matrix) — runs the same Playwright suite across `ubuntu-latest` × chromium/webkit/firefox, `macos-latest` × chromium, `windows-latest` × chromium. Each matrix job only uploads its raw Allure results (`allure-results-<os>-<browser>`); it doesn't build a report and has read-only permissions
- **`allure-reports`** (needs the matrix, runs always) — one ubuntu job that builds a separate Allure report per OS + browser combination, plus an index page, and on `main` publishes them to GitHub Pages under `cross-platform/`
- Why one publishing job instead of publishing from every matrix job: five parallel pushes to the same `gh-pages` branch would conflict, and a `concurrency` queue would cancel some of them (GitHub keeps only one pending run per group)
- This is the only way to run webkit/firefox for now — folding them into `ci.yml` was considered and declined (27.09), purely for CI-minute cost

## Secrets

- `PPEERR_PAT` — personal access token (classic, scope `repo`) from the `GuzKH` account, used to check out the private `ppeerr/wilist` repo and to look up its latest commit for the report's Environment block. Stored in Settings → Secrets and variables → Actions of the `wilist-tests` repo.

## Port

wilist runs on `:8081` (the `WILIST_PORT` variable at the top of the workflow) — doesn't clash with the local Postman instance on `:8080`.

## Report

All published reports: **https://guzkh.github.io/wilist-tests/**

- **Main report** — https://guzkh.github.io/wilist-tests/ci/ — published by `allure-report` from `main` (push, nightly, manual)
- **Cross-platform reports** — https://guzkh.github.io/wilist-tests/cross-platform/ — published by `allure-reports` in `cross-platform.yml` after manual runs on `main`, one report per OS + browser

How publishing works:

- Reports are pushed to the `gh-pages` branch with `peaceiris/actions-gh-pages`, each workflow into its own folder (`ci/`, `cross-platform/`). The action cleans only the target folder, so the two workflows don't overwrite each other. The root `index.html` on `gh-pages` was added by hand and links to both
- **History / Trend** — before generating, the job checks out `gh-pages` and copies the previous report's `history/` folder into the new results
- **Environment** — app commit, test commit, branch, run trigger, runner image, browser, Go/Node versions (`environment.properties`)
- **Executor** — run number with a link back to the run's logs (`executor.json`)
- **Categories** — failures grouped by cause: infrastructure (app not reachable), timeouts, product defects, test defects (`categories.json`)
- Only the publishing jobs get `contents: write`; both share the `concurrency` group `allure-publish`, so publishes from the two workflows wait for each other instead of pushing at the same time
- Reports from pull requests and other branches are not published — they stay as workflow artifacts (`allure-report` / `allure-reports-cross-platform`)

## Practices applied

- **Required checks on `main`** — a red CI blocks the merge instead of just showing a red mark
- **No flaky greens** — `--fail-on-flaky-tests` makes a pass-on-retry a failure
- **No private binaries in public artifacts** — the app is built inside each test job and never uploaded
- **Reusable composite action** — build + start logic lives in one place instead of being copied into every job
- **Fail on real failure** — no `continue-on-error` on test steps; a failing test fails the job. Result upload still runs via `if: always()`
- **Concurrency control** — a new push cancels the previous in-progress run on the same branch/PR, instead of queuing redundant runs; report publishing is serialized separately
- **Scoped triggers** — push/pull_request limited to `main`, avoiding the double run that `push` + `pull_request` on the same commit would otherwise cause
- **Least-privilege permissions** — `permissions: contents: read` at workflow level; `contents: write` only on the jobs that publish reports
- **Timeouts on every job** — caps a hung process instead of letting it run to the default 360-minute limit
- **Health-check polling** — waits on `/health` in a retry loop instead of a fixed `sleep`, which is fragile on a slow runner
- **Pinned tool versions** — `newman`, `newman-reporter-allure`, `allure-commandline` pinned so a new release can't silently change behavior
- **Reproducible installs** — `npm ci` (lockfile-based) instead of `npm install` everywhere
- **Caching** — npm dependencies and Playwright browser binaries are cached, keyed off the lockfile
- **Published reports with history** — results are visible by link, with trends, environment and failure categories, without downloading artifacts

## Known limitations

- `PPEERR_PAT` is a classic token with scope `repo` — it gives read **and write** access to every repo the `GuzKH` account can reach. Planned replacement: a read-only deploy key on `ppeerr/wilist` (needs the owner of `ppeerr/wilist` to add it)
- A change in `ppeerr/wilist` doesn't start a run by itself — the nightly run picks it up within a day; for a faster check, start the workflow manually
- The app commit in the report's Environment block is looked up again in the report job; if someone pushes to the app during a run, it can differ from what the test jobs used. The exact tested commit is always on the run's Summary page
- `cross-platform.yml` still has its own copy of the build/start steps (it needs the `.exe` suffix on Windows) — not yet moved to the composite action
- The Allure CLI version and the failure categories are duplicated in `ci.yml` and `cross-platform.yml` — keep them in sync when changing either
- `newman`, `newman-reporter-allure`, and `allure-commandline` versions are pinned in the workflow — update them manually and verify locally when bumping
- The Playwright browser cache key is based on `e2e/package-lock.json` — it self-invalidates when the Playwright version changes
- If a cross-platform matrix job fails before uploading its results, that combination is missing from the published reports for that run, and its history starts over
