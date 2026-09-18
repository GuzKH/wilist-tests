# wilist-tests

Test suite for the [wilist](https://github.com/ppeerr/wilist) project — a wishlist application (Go API + React UI).

## Structure

- `postman/` — API tests: Postman collection and environment
- `e2e/` — UI tests: Playwright

## Prerequisites

This repository contains tests only. The `wilist` application lives in a separate
repository and must be started separately before any test run.

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

## Test documentation

The full case table, expected results and known API behaviour are kept in the
project's Obsidian vault: `Pet project - ppeerr wilist/Postman/postman api cases table.md`

## Status

- API tests — written, run manually via Postman Runner
- UI tests — in progress
- CI — not configured yet
