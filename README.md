# wilist-tests

Test suite for wilist, a wishlist application (Go API + React UI). The app repository is private; CI checks it out with a personal access token stored as a repo secret.

## Structure

- `postman/` — API tests: Postman collection and environment, see [FIXTURES.md](./postman/FIXTURES.md)
- `e2e/` — UI tests: Playwright
- `docker-compose.yml` — runs the app and the e2e suite together in containers, see [DOCKER.md](./DOCKER.md)
- `.github/workflows/ci.yml` — per-commit CI, see [ci_readme.md](./.github/workflows/ci_readme.md)
- `.github/workflows/cross-platform.yml` — manual OS/browser matrix run, also covered in [ci_readme.md](./.github/workflows/ci_readme.md)

## Prerequisites

This repository contains tests only. The `wilist` application lives in a separate
repository and must be started separately before any test run (unless you use
Docker Compose — see [DOCKER.md](./DOCKER.md)).

## Running API tests (Postman)

1. Import `postman/wilist.postman_collection.json` and
   `postman/wilist.postman_environment.json` into Postman
2. Select the `wilist local` environment
3. Run the collection via Collection Runner

Both the `smoke` and `regression` folders create and clean up their own test
data independently — see [postman/FIXTURES.md](./postman/FIXTURES.md) for
how that works.

## Running UI tests (Playwright)

    cd e2e
    npm install
    npx playwright test

All specs import `test`/`expect` from `./fixtures`, not `@playwright/test`
directly — a custom fixture waits for the initial item list to finish
loading before each test body runs, since the list loads asynchronously.

## Docker

See [DOCKER.md](./DOCKER.md) for running the app and tests together in containers.

## CI

See [.github/workflows/ci_readme.md](./.github/workflows/ci_readme.md) for how the per-commit workflow and the manual cross-platform matrix work.

## Test documentation

The full case table, expected results and known API behaviour are kept in the
project's Obsidian vault: `Pet project - ppeerr wilist/Postman/postman api cases table.md`
