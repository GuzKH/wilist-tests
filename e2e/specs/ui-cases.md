# wilist UI — test cases

## Automation conventions

The rules below apply to all cases during test generation.

1. The app starts with pre-seeded items and the store is in-memory
   and shared across the whole run, so items created by previous
   tests remain in the list. Never assume an empty list and never
   assert absolute counts: capture the current count before the
   action and compare after. Capture the count only after the list
   has rendered — `page.goto` resolves before React mounts, so
   counting immediately after navigation returns zero. Wait for the
   "Your list" heading to be visible before counting; it renders in
   both the empty and the populated state.

2. In negative cases, assert the reason for rejection first
   (message, error, field state), then assert that the item count
   is unchanged.

3. Native browser validation is verified through the field's
   validity flag, not the message text: the text depends on the
   browser and locale.

4. Item names must be unique within a run: append a timestamp or
   a similar unique suffix. The store persists between local runs,
   so fixed names produce indistinguishable duplicates.

5. When an expectation is about exact string value (trimming,
   casing, formatting), compare the full text, not a substring.

App: React UI at `/`, served on http://localhost:8081 for Playwright runs.
Source of truth: manual UI verification. Storage is in-memory — data lives only while the process runs.

**Common assertion for every list-related case:** a newly created item always appears at the top of "Your list"; changing an item's state and removing an item do not reorder the remaining items.

**KNOWN BUG marker:** a bullet marked `KNOWN BUG` describes current broken behaviour, not a requirement. Do not generate assertions that lock this behaviour in.

## Case index

| ID     | Scenario                                     | Suite      | Priority | Status  |
| ------ | -------------------------------------------- | ---------- | -------- | ------- |
| UI-000 | Default state of the add form                | smoke      | high     | drafted |
| UI-001 | Create item with Name only                   | smoke      | high     | drafted |
| UI-002 | Create item with Name + Link                 | regression | high     | todo    |
| UI-003 | Submit with empty Name                       | regression | high     | todo    |
| UI-004 | Name containing only whitespace              | regression | medium   | todo    |
| UI-005 | Long values and special characters           | regression | low      | todo    |
| UI-006 | Link is not a valid URL                      | regression | medium   | todo    |
| UI-007 | Two items with the same Name                 | regression | low      | todo    |
| UI-008 | Leading and trailing spaces in Name          | regression | medium   | todo    |
| UI-010 | List survives a page reload                  | regression | high     | 
todo    |
| UI-013 | Item ordering in the list                    | regression | high     | todo    |
| UI-014 | Enter in the Name field submits the form     | regression | medium   | todo    |
| UI-015 | Double click on Add item                     | regression | medium   | todo    |
| UI-020 | Change state wanted → purchased              | smoke      | high     | todo    |
| UI-021 | Editing the Name of an existing item         | regression | high     | todo    |
| UI-022 | Change state to archived                     | regression | high     | todo    |
| UI-030 | Remove an item                               | smoke      | high     | todo    |


---

## UI-000 — Default state of the add form

**Precondition:** the app is open at `/`

**Steps**
1. Open the app at `/`

**Expected**
- The add form is displayed with two text fields (Name, Link), a State dropdown and an Add item button
- The State dropdown defaults to `wanted`
- Name and Link are empty by default
- Placeholders are shown — Name: `Mechanical board`, Link: `https://...`
- Above the form there is the text: "wilist. Things you want, in one place. Add links, track what you still want, and archive the rest."
- Below the form there is the list of created items
- The list is titled "Your list"

## UI-001 — Create item with Name only

**Precondition:** the app is open at `/`

**Steps**
1. Fill Name with a unique value
2. Click Add item

**Expected**
- The new item appears first in "Your list" with the entered name
- Its state is `wanted`
- A clickable Remove button is displayed for the item
- Link shows the text `No link`; it is not a link element
- The Name field is cleared in the add form after submission

## UI-002 — Create item with Name + Link

**Steps**
1. Fill Name with a unique value
2. Fill Link with a valid URL
3. Click Add item

**Expected**
- The new item appears first in "Your list" with the entered name
- Its state is `wanted`
- entered Link is rendered as a link
- link href exactly matches the entered URL

## UI-003 — Submit with empty Name

**Steps**
1. Capture the current item count in "Your list"
2. Leave Name empty
3. Fill Link with `https://test.com`
4. Click Add item

**Expected**
- Name field fails native browser validation because it is required;
- item is not created and list count remains unchanged.

## UI-004 — Name containing only whitespace

**Steps**
1. Capture the current item count in "Your list"
2. Fill Name with spaces only
3. Click Add item

**Expected**
- submission is rejected with exact error: `name is required`
- no new item is created and list count remains unchanged

## UI-005 — Long values and special characters

**Steps**
1. Fill Name with `!@#$%^&45678ERTYUIO. &*()FGHJKL VBNM<45678-<unique>`
2. Fill Link with a long URL (200+ characters)
3. Click Add item

**Expected**
- item is created with the exact entered Name;
- long URL is rendered as a link;
- link href exactly matches the entered URL.

## UI-006 — Link is not a valid URL

**Steps**
1. Fill Name with a unique value, fill Link with `not-a-url`
2. Click Add item

**Expected**
- The item is created
- KNOWN BUG: the client performs no URL validation on Link
- KNOWN BUG: the rendered link resolves to the app's own page instead of an external URL

## UI-007 — Two items with the same Name

**Steps**
1. Fill Name with a unique value, click Add item
2. Fill Name with the same value again, click Add item

**Expected**
- two items with the same Name can be created;
- list count increases by exactly 2;
- both newly created items appear separately at the top of the list.

## UI-008 — Leading and trailing spaces in Name

Difference from UI-004: there the value is whitespace only; here it is a valid value padded with spaces.

**Steps**
1. Wait for the "Your list" heading to be visible
2. Fill Name with a value surrounded by spaces, e.g. `  test-<unique>  `
3. Click Add item

**Expected**
- leading and trailing whitespace in Name is removed;
- the newly created item displays the trimmed value exactly.

## UI-010 — List survives a page reload

**Note:** storage is in-memory; data persists only while the process keeps running

**Steps**
1. Create an item
2. Reload the page

**Expected**
- created item is present before reload
- after page reload, the created item is still present with the same Name.


## UI-013 — Item ordering in the list

**Steps**
1. Create three items in a row with distinguishable unique names
2. Change the state of the middle item
3. Remove the middle item

**Expected**
- items are inserted at the top of the list;
- creating items A → B → C results in C → B → A;
- existing items remain below newly created items.

## UI-014 — Enter in the Name field submits the form

**Steps**
1. Fill Name with a unique value
2. Press Enter without clicking Add item

**Expected**
- pressing Enter in Name submits the form;
- exactly one new item is created;
- new item appears first with entered Name;
- Name field is cleared.

## UI-015 — Double click on Add item

**Steps**
1. Capture the current item count in "Your list"
2. Fill Name with a unique value
3. Click Add item twice in rapid succession

**Expected**
- Exactly one item is created: the item count increases by 1 relative
  to the count captured in step 1
- The counter shown next to "Your list" matches the number of rows

## UI-020 — Change state wanted → purchased

**Steps**
1. Change the state of an existing item from `wanted` to `purchased`
2. Reload the page

**Expected**
- A new item can be created with wanted state.
- An item can transition from wanted to purchased.
- A new item can be created directly with purchased state.
- An item can transition from purchased back to wanted.
- State changes persist after page reload.

## UI-021 — Editing the Name of an existing item

**Steps**
1. Click the name of an existing item in the list

**Expected**
- Existing item Name is displayed as non-editable text.
- Clicking the Name does not turn it into an editable control.
- The existing Name remains unchanged.

## UI-022 — Change state to archived

**Steps**
1. Capture the current item count in "Your list"
2. Change the state of an existing item to `archived`
3. Reload the page

**Expected**
- An item can transition from wanted to archived.
- An item can transition from purchased to archived.
- Archiving does not remove the item from the list.
- Archived items remain included in the item counter.
- Archived state persists after page reload.

## UI-030 — Remove an item

**Steps**
1. Capture the current item count in "Your list"
2. Click Remove on an existing item

**Expected**
- newly created items increase the counter;
- selected item is removed;
- remaining item stays in the list;
- counter decreases by exactly one after removal.