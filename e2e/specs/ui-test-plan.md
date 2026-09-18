# Wilist UI test plan

Source of truth for steps and expectations: [ui-cases.md](ui-cases.md)

This file holds the scenario matrix and the invariants that apply across
cases. It deliberately contains no steps or expectations — those live in
`ui-cases.md` only. Keeping them in one place prevents the two files from
drifting apart.

Scope:
- This plan includes only the scenarios listed in the UI cases file.
- No additional scenarios were added.
- Known bug markers are explicitly called out as current broken behavior and are not treated as product requirements.

## Scenario matrix

| ID | Scenario | Suite | Priority | Status |
| --- | --- | --- | --- | --- |
| UI-000 | Default state of the add form | smoke | high | drafted |
| UI-001 | Create item with Name only | smoke | high | drafted |
| UI-002 | Create item with Name + Link | smoke | high | todo |
| UI-003 | Submit with empty Name | regression | high | todo |
| UI-004 | Name containing only whitespace | regression | medium | todo |
| UI-005 | Long values and special characters | regression | low | todo |
| UI-006 | Link is not a valid URL | regression | medium | todo |
| UI-007 | Two items with the same Name | regression | low | todo |
| UI-008 | Leading and trailing spaces in Name | regression | medium | todo |
| UI-010 | List survives a page reload | smoke | high | todo |
| UI-011 | Empty list state | regression | medium | todo |
| UI-012 | Item counter | smoke | high | todo |
| UI-013 | Item ordering in the list | regression | high | todo |
| UI-014 | Enter in the Name field submits the form | regression | medium | todo |
| UI-015 | Double click on Add item | regression | medium | todo |
| UI-020 | Change state wanted → purchased | smoke | high | todo |
| UI-021 | Editing the Name of an existing item | regression | high | todo |
| UI-022 | Change state to archived | smoke | high | todo |
| UI-030 | Remove an item | smoke | high | todo |
| UI-031 | Remove the last remaining item | regression | medium | todo |

## Global invariants for list-related cases

- A newly created item always appears at the top of "Your list".
- Changing an item's state and removing an item do not reorder the remaining items.
- A known bug is described in the source file as current broken behavior, not as a requirement.