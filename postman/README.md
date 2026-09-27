# Postman API tests — ppeerr/wilist

Collection and environment for manual API testing of the wilist service.

## Files
- `wilist.postman_collection.json` — collection: smoke, regression, id validation (data-driven), teardown
- `wilist.postman_environment.json` — environment `wilist local` (variable `baseUrl`)

## How to run
1. Import both files into Postman (File → Import)
2. Select the `wilist local` environment
3. Make sure the wilist service is running on the configured `baseUrl`
4. Run the collection via Postman Runner (Collection → Run)

`smoke` and `regression` each create and clean up their own test data
independently — neither depends on the other running first. See
[FIXTURES.md](./FIXTURES.md) for how the fixture and teardown mechanism works.

## Test cases
Full case table, expected results, and known API behaviour: see the project's Obsidian vault
(`Pet project - ppeerr wilist/Postman/postman api cases table.md`)

## Status
Manual runs via Postman Runner, plus automated runs via Newman in CI — see
[ci_readme.md](../.github/workflows/ci_readme.md).
