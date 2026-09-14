# Batches Module — Cypress Test Review & Bug Report

Scope: `cypress/e2e/batches.cy.js` (batches list) and `cypress/e2e/batches-info.cy.js`
(batch detail page, trainees tab, trainers tab). Verified against a local
Laravel + Vite + sqlite stack, run headless (`cypress run`), each spec run
twice back-to-back to confirm repeatability.

## Summary

| Spec | Before | After |
|---|---|---|
| `batches.cy.js` | 9/9 passing on a *fresh* DB, but **fails on a second run** (destroys its own fixtures) | 8/8 passing, confirmed repeatable across 2 consecutive runs |
| `batches-info.cy.js` | 3/3 *enabled* tests failing; 12 tests commented out | 13/13 passing, confirmed repeatable across 2 consecutive runs |

Both files were updated in place. No application code was changed — every
finding below is either a test-script bug or a test-design gap.

---

## Bugs found

### 1. `batches-info.cy.js` — wrong element index breaks "copy link" test
`cy.get('[data-cy="button-button-1"]').eq(4)` was used to click the batch
detail page's "Copy link" button, but that page only renders **4** `Button`
components sharing that generic data-cy (`Edit`, `Archive`, `Terminate`,
`Copy link` = indices 0–3). Index 4 never exists, so the test times out on
every run.
**Fix:** select by visible text (`cy.contains('[data-cy="button-button-1"]', 'Copy link')`) instead of a positional index, which also survives the button set changing (e.g. when the batch is non-active and shows Restore/Delete instead of Archive/Terminate).

### 2. `batches-info.cy.js` — "Transfer" assertion can never pass
The trainee-transfer test asserted
`cy.get('[data-cy="row-menu-button-row-actions"]').and('contain.text', 'Transfer')`.
`row-menu-button-row-actions` is the icon-only "⋯" button that *opens* the
row menu (`RowMenu.tsx`) — it never contains any label text. The actual
"Transfer" menu item is a different, portal-rendered element
(`[role="menuitem"]`, generic data-cy `row-menu-button-4`). This assertion
was guaranteed to fail on every run.
**Fix:** scope into the opened `[role="menu"]` and match on
`[role="menuitem"]` text.

### 3. `batches-info.cy.js` — hardcoded "Created Aug 10, 2026" is timezone-flaky
`BatchDetailLayout.tsx` renders the batch's `created_at` with
`new Date(...).toLocaleDateString('en-US', {...})`, which uses the
**browser's local timezone**, not the value's original UTC offset. The
seeded batch's `created_at` is `2026-08-11 02:06:12 UTC`; a browser in a
negative UTC-offset timezone reads that as "Aug 10", one in UTC (or a
positive offset) reads it as "Aug 11". The test hardcoded "Aug 10", so it
only ever passed in the environment it was authored in.
**Fix (test):** assert the format via regex and leave the date value
unconstrained.
**Recommendation (app, not changed here):** if a stable, testable "Created"
date matters, format it in a fixed timezone (e.g. `timeZone: 'UTC'` or the
tenant's configured timezone) instead of the viewer's local one — otherwise
the same batch visibly shows a different "Created" date to users in
different timezones near midnight UTC.

### 4. `batches-info.cy.js` — ambiguous status-badge selector
`[data-cy="status-badge-span-1"]` is `StatusBadge`'s own internal data-cy;
the component does **not** forward a caller-supplied `data-cy` prop (it
isn't in its prop list), so every `StatusBadge` on a page — the batch
header's *and* every trainee row's — renders with the identical selector.
Once the trainees list finishes loading, `cy.get(...).should('have.text',
'Active')` fails because it now matches 10+ badges concatenated together.
This is a latent flakiness bug: it happened to pass before only when the
assertion ran before the trainees list finished its background fetch.
**Fix:** scope the query to the header container
(`[data-cy="batch-detail-layout-div-6"]`) before finding the badge.

### 5. `batches-info.cy.js` — dead code
`const { Cylinder } = require('lucide-react');` at the top of the file was
unused and left over from a copy/paste. Removed.

### 6. `batches.cy.js` — suite is not repeatable (destroys its own fixtures)
- `should terminate batch` permanently terminates the seeded `FBS-5908`.
- `should delete batch` permanently **deletes** the seeded `FBS-3335`
  (batch delete is a hard delete in `BatchesController::destroy()`).

Neither test resets state afterward, and there is no database reset/seed
step wired into the Cypress config or `beforeEach`. Result: the suite
passes on a freshly seeded database, but **fails on every subsequent run**
against the same database (`FBS-3335`/`FBS-5908` search returns "No records
found" and the row-menu/status assertions never match). Confirmed by
running the original suite once (all green) and a second time (both tests
fail).
**Fix:** every mutating test (`edit`, `registration QR`, `copy link`,
`archive`/`restore`, `terminate`, `delete`) now creates its own throwaway
batch via a new `cy.createBatch()` command (`cypress/support/commands.ts`)
instead of touching fixed seeded codes. Re-ran the whole spec twice
back-to-back to confirm this actually fixes it.

### 7. `batches.cy.js` — "should delete batch" clicked the wrong row-menu item, and only "passed" by luck
The batch row menu always renders 5 items in the same positions —
`[Edit, Registration QR, Copy link, Archive-or-Restore, Terminate-or-Delete]`
— where the 5th slot is **"Terminate" for an active batch** and only
becomes **"Delete" once the batch is non-active**
(`resources/js/pages/developer/batches/index.tsx`, `renderRow`). The test
clicked index 4 on `FBS-3335` expecting "Delete", with no comment
explaining why that's safe. I verified directly (probe test against a
freshly created, still-active batch) that clicking index 4 on an *active*
batch opens the **Terminate** modal, not the delete-confirmation modal — so
this test only worked because `FBS-3335` happened to already be seeded as
`terminated` (`BatchSeeder.php` seeds 4 terminated batches with random
`FBS-NNNN` codes; `3335` was apparently one of them). That's an undocumented,
accidental dependency: if the seeder ever changes which codes end up
terminated, this test would silently terminate a live batch instead of
deleting one, then fail on the wrong-modal assertion.
**Fix:** the new `should delete a batch` test explicitly archives the batch
first (via the UI), so it's guaranteed non-active before the delete
attempt — matching what a real user has to do — instead of relying on
undocumented seed state.

### 8. `batches.cy.js` — delete test's `cy.wait()` was intercepting the wrong request
```js
cy.intercept('GET', '**/batches/**').as('deleteBatch');
cy.intercept('DELETE', '**/settings/partner-schools/**').as('deleteBatch'); // copy-paste leftover
...
cy.wait('@deleteBatch');
```
The actual request fired by a batch delete is `DELETE /batches/{id}`.
Neither intercept above matches that (one is `GET`, the other targets a
completely unrelated module — partner schools). The `cy.wait('@deleteBatch')`
call only resolved because of an incidental follow-up `GET` request to
`**/batches/**` (the list refetch after the mutation), not because it
actually observed the delete — so the test never verified the delete
request itself succeeded.
**Fix:** `cy.intercept('DELETE', '**/batches/{id}')`, and additionally now
asserts `response.statusCode === 204` and that the batch disappears from a
follow-up search.

### 9. Weak assertions (not failures, but low-value coverage)
- `should restore batch` (list page) previously only asserted a toast was
  *visible*, without checking its text or the resulting status badge — it
  would have passed even if "Restore" silently did nothing. Now asserts
  the toast text ("Restored") and that the row's badge reads "Active".
- Several `cy.wait('@alias')` calls didn't assert on
  `interception.response.statusCode`, so a 4xx/5xx response wouldn't have
  failed the test. Added status-code assertions where it was cheap to do
  so (edit, delete).

---

## Test-design notes (not bugs, but worth knowing)

- `batches.cy.js` and `batches-info.cy.js` both `describe('Batches Module', ...)`
  — running them together produces two identically named top-level suites
  in the report. Renamed `batches-info.cy.js`'s to
  `'Batches Module - Batch Detail'` for a clearer test report.
- `batches-info.cy.js`'s previously-commented-out tests (edit/archive/
  restore/terminate on the detail page, and the whole trainees-tab
  search/filter/sort/pagination/action-menu block) were correct in intent
  and mostly used valid selectors — I re-enabled them with the fixes above
  rather than rewriting from scratch.
- Added a `cy.createBatch()` Cypress command
  (`cypress/support/commands.ts`) that drives the real "Add batch" modal
  and resolves with the created `{ id, batch_code }` from the intercepted
  `POST /batches` response. This is now reused by every mutating test in
  both spec files to keep them independent of seed data.

## Files changed
- `cypress/e2e/batches.cy.js` — rewritten mutation tests (edit, QR, copy
  link, archive/restore, terminate, delete) to use `cy.createBatch()`;
  fixed the delete test's wrong row-menu index and wrong intercept.
- `cypress/e2e/batches-info.cy.js` — removed dead import; fixed the copy
  link index bug, the Transfer selector bug, the timezone-flaky date
  assertion, and the ambiguous status-badge selector; re-enabled and fixed
  the previously commented-out tests (edit/terminate-cancel/archive-restore
  on the detail page; trainees tab search/filter/sort/pagination/menu;
  transfer modal open/close; trainers tab navigation).
- `cypress/support/commands.ts` / `cypress/support/cypress.d.ts` — added
  `cy.createBatch()`.

## Verification
Both specs were run against a live `php artisan serve` + `vite` + sqlite
stack, twice each, with all tests passing both times (proving the
repeatability fix actually holds):
- `batches.cy.js`: 8/8, 8/8
- `batches-info.cy.js`: 13/13, 13/13
