---
description: Generate a Playwright test for a case ID from ui-test-plan.md
---

Generate a test for ${input:caseId} from #ui-cases.md.

<test-suite>wilist UI</test-suite>
<test-name>${input:caseId}</test-name>
<test-file>tests/${input:caseId}.spec.ts</test-file>
<seed-file>tests/seed.spec.ts</seed-file>
<body>
Use only the steps and assertions listed for ${input:caseId} in the plan.
Do not add steps or assertions that are not in the plan.

Locator constraints for this app:
- Scope all add-form locators to the form container. The page renders a State
  select per list item, so page-level role locators cause strict mode violations.
- Use exact matching for short texts like "wilist".
</body>