# Postman fixtures and teardown

How the collection creates and cleans up its own test data, so `smoke` and
`regression` can each run independently — in either order, or on their own.

## Collection variables

A collection-level Pre-request script lazily initializes two collection
variables the first time any request runs:
- `runId` — a random id for this run
- `createdIds` — a JSON array tracking which fixture items this run has created

## Per-folder fixtures

`smoke` and `regression` each have their own Pre-request script at the folder
level. Both do the same thing, independently: create a fresh fixture item via
`pm.sendRequest`, store its id as `fixtureId`, and register it in
`createdIds`. Neither folder relies on the other having run first.

Post-response scripts conditionally register or deregister ids in
`createdIds`, depending on whether the request created or deleted an item.

## Teardown

A final `Teardown` request (`GET /wish-items`) does async cleanup: it loops
over `createdIds` with a `for...of` + `await` (not `forEach`, which can't
await `pm.sendRequest`) to delete anything left over, then unsets `runId`
and `createdIds` so the next run starts clean.

## Related

Full write-up with code snippets: `Pet project - ppeerr wilist/Postman/postman fixtures and infrastructure.md`
in the project's Obsidian vault.
