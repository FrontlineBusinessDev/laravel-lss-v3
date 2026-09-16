# Refactor / Reuse / Migration Audit

Generated 2026-09-14. Snapshot of where the codebase drifts from documented
conventions in [CLAUDE.md](../CLAUDE.md), what's reusable already, and what to
migrate. Continue from here — don't re-run the full audit, just re-check the
specific area you're about to touch.

## Backend (Laravel)

### Anomaly: 14 controllers extend nothing (not even `Controller`)

All in Trainee/Trainer role scope. They bypass the app-wide auth/throttle
middleware `BaseController` wires in, and hand-roll response envelopes.

- `app/Http/Controllers/v1/NotificationController.php`
- `app/Http/Controllers/v1/Trainee/Announcements/AnnouncementsController.php`
- `app/Http/Controllers/v1/Trainee/Biometrics/BiometricsController.php`
- `app/Http/Controllers/v1/Trainee/Dashboard/DashboardController.php`
- `app/Http/Controllers/v1/Trainee/Evaluations/EvaluationsController.php`
- `app/Http/Controllers/v1/Trainee/Leave/LeaveController.php`
- `app/Http/Controllers/v1/Trainee/MyInfo/MyInfoController.php`
- `app/Http/Controllers/v1/Trainee/Payments/PaymentsController.php`
- `app/Http/Controllers/v1/Trainee/Ratings/RatingsController.php`
- `app/Http/Controllers/v1/Trainee/Tasks/TasksController.php`
- `app/Http/Controllers/v1/Trainer/Dashboard/DashboardController.php`
- `app/Http/Controllers/v1/Trainer/Ratings/RatingsController.php`
- `app/Http/Controllers/v1/Trainer/Tasks/TasksController.php`
- `app/Http/Controllers/v1/Trainer/Leave/LeaveController.php`

### Reusable engine already exists

[`app/Http/Controllers/v1/BaseController.php`](../app/Http/Controllers/v1/BaseController.php):
- `paginationSearch` — filter/sort/paginate + `{data,meta,links,filters}` envelope
- `store` / `update` — overridable `storeRules()` / `updateRules()` + `beforeSave` / `afterCreate` / `afterUpdate` hooks
- `archive` / `restore` / `destroy` — in-use guard, transactional
- `sendResponse` / `sendError` — envelope helpers
- Backed by `Concerns/AppliesQueryFilters` trait

### Concrete duplication found (not CRUD-shaped, so devs hand-rolled instead of reusing)

- `sendResponse()` reimplemented byte-for-byte in
  [`Trainee/Tasks/TasksController.php:245-252`](../app/Http/Controllers/v1/Trainee/Tasks/TasksController.php)
- `currentTrainee()` lookup (`Trainees::where('user_id',...)->firstOrFail()`)
  copy-pasted across `Trainee/Ratings`, `Trainee/Tasks`, likely
  `MyInfo`/`Payments`/`Biometrics` (not all confirmed — check when touching)
- Same manual pagination/meta-block pattern repeated in `Trainee/Ratings` +
  `Trainee/Tasks` instead of using `AppliesQueryFilters`

### Migrate to (backend)

1. New `Concerns/ScopedToCurrentTrainee` trait — dedupe the `currentTrainee()` lookup.
2. Extract envelope/pagination-meta building out of `paginationSearch()` into
   `AppliesQueryFilters` (or new `Concerns/BuildsPaginatedResponse`) so
   non-CRUD scoped controllers (Trainee Ratings/Tasks) reuse
   `{data,meta,links}` + `sendResponse()` without needing full CRUD.
3. Make the 14 bare controllers extend at minimum `Controller` (ideally the
   new lighter trait/mixin) for consistent middleware.
4. `Trainer/{Dashboard,Ratings,Tasks,Leave}` are currently thin stubs — wire
   them to share logic with Developer counterparts *now*, before Trainer
   feature-parity work causes copy-paste (mirrors CLAUDE.md's admin/developer
   reuse rule, same risk applies trainer-side).

## Frontend (React/Inertia)

Documented conventions were ~0% adopted at the 2026-09-14 snapshot below —
systemic drift, not isolated bugs. **Update 2026-09-16:** re-verified during
this session's continuation and most of this section turned out to be
either already resolved (`DataTableField`→`DataTableCardField`) or a
mis-diagnosis (the API-layer "bypass"). See "Session progress" for the
current, accurate state — read that first.

### API Service Layer bypass

~28 files call `apiFetchJson` directly from pages/components instead of
through `resources/js/api-service-layer/`. Worst offenders are **shared
components themselves** — every consumer inherits the bypass:
- `resources/js/components/table/hooks/use-record-row-actions.ts`
- `resources/js/components/form-modal/FormModal.tsx`
- `resources/js/components/table/DataTableCardField.tsx`

Also affected (non-exhaustive, re-grep before starting):
`pages/developer/payments/*`, `pages/developer/tasks/*` (+ trainer mirror),
`pages/developer/trainees/show/*` (+ trainer mirror),
`pages/developer/certificates/*`, `pages/developer/batches/*`,
`pages/auth/forgot-password.tsx`, `components/modal/ChangePasswordModal.tsx`.

### ~~DataTableField pattern unused for its documented job~~ — RESOLVED, stale by the time this doc was read

Re-checked 2026-09-16: `components/table/DataTableField.tsx` no longer
exists — deleted in `7d5c6ca "update announcement and notification and
logger"`, a commit made *after* this audit's 2026-09-14 snapshot. All 36
`pages/**/index.tsx` list pages already use `DataTableCardField` (the
barrel's own docblock at `components/table/index.ts` documents that as the
one true entry point now). `RecordModal.tsx`/`RecordModalField.tsx` (its
former create/edit-modal sidekick) are the only survivors, and as of this
session have exactly one consumer: `pages/developer/seminars/index.tsx`
(wired in earlier this session). Nothing left to migrate here — do not
re-open this item without re-grepping first.

### React Hook Form + Zod: 0 hits project-wide

Neither package used anywhere. Manual `validate()` + `useState` forms
everywhere, including inside the shared `RecordModal.tsx` component itself.
Known instances: `CreateBatchModal.tsx`, `AddAnnouncementModal.tsx` (+
trainer mirror), `AddTaskModal.tsx`, `pages/public/seminar-register/index.tsx`,
`components/table/components/RecordModal.tsx`.

### `export namespace` convention: 0 files use it

46 files use flat `export interface`/`export type` in `types/modules/*`
instead. Cosmetic/type-safety only, no runtime risk.

### `pages/admin/` doesn't exist

CLAUDE.md's "admin and developer must reuse the same components" rule has
nothing to apply to — admin was either merged into `developer/` or never
built. Flag as stale convention, not a bug to fix.

### Migrate to (frontend), priority order — biggest leverage first

~~1-3~~ Re-investigated 2026-09-16 (see "Session progress" below) — #1 isn't
a real bug (`apiFetchJson` already shares the centralized Axios client),
#2 is already fully done (stale by the time it was read), #3 is a poor fit
for `RecordModal`'s dynamic field-array shape. Only #4 remains open:

4. `export namespace` — lowest priority; batch-convert only when touching a
   file for other reasons.

## Session progress (2026-09-16)

**Continuation pass:** re-verified every remaining open frontend item
before touching more code (per this doc's own "re-check before you re-run"
rule) and found the `DataTableField` migration item was already fully
resolved by an intervening commit — see the strikethrough section above.
No code changes this pass; the correction is the deliverable. With that,
every item in this audit is now either done, corrected, or explicitly
deferred with reasoning — nothing actionable remains open except #4
(`export namespace`, opportunistic-only) and the flagged-not-done Trainer
stub wiring.

### Backend — done

- **New `Concerns/JsonResponds` trait** (`sendResponse()`/`sendError()`,
  extracted verbatim from `BaseController`) + **new lightweight
  `ApiController`** (`extends Controller implements HasMiddleware`, bundles
  `AuthorizesRequests` + `JsonResponds` + the same `auth`+`throttle:120,1`
  middleware `BaseController` already wired). `BaseController` now `extends
  ApiController` instead of duplicating all three — same public behavior,
  one less copy.
- All 14 previously-bare controllers now `extends ApiController` — they
  pick up auth/throttle middleware, `authorize()`, and `sendResponse()`/
  `sendError()` for free instead of hand-rolling or going without.
- Applied `Concerns/ScopedToCurrentTrainee` (already existed, was unused)
  to the 8 controllers that had their own copy of the
  `Trainees::where('user_id', auth()->id())->firstOrFail()` lookup —
  `Trainee/{Announcements,Biometrics,Dashboard,Evaluations,MyInfo,Payments,
  Ratings,Tasks}`. `Dashboard`/`Evaluations` override `currentTraineeQuery()`
  to layer `withCompletedHours()`, exactly the extension point the trait
  documents. `Trainee/Tasks` also dropped the byte-for-byte-duplicated
  `sendResponse()` the audit flagged (now inherited).
- Verified: full Pest suite 213/213 passing, PHPStan clean on every touched
  file (2 pre-existing `return.type` regressions from the
  `currentTraineeQuery()` override fixed with a `@return Builder<Trainees>`
  docblock; a few `property.notFound` on Eloquent magic accessors like
  `avatar_url`/`batch_code`/`school_name` remain — pre-existing debt on
  lines this pass didn't touch, part of the existing ~186-error baseline).

### Backend — deliberately not done this pass

- **`Trainer/{Dashboard,Ratings,Tasks,Leave}` reuse with Developer
  counterparts** (audit item #4): `Trainer/Ratings`, `Trainer/Tasks`,
  `Trainer/Leave` are still one-line `index()->asCsr()` stubs with no logic
  to share yet — there's nothing to dedupe until real Trainer functionality
  is built. `Trainer/Dashboard` already has real logic
  (`HasDashboardWidgets` + `ScopesToAssignedBatches`), structurally
  different enough from `Developer/Dashboard` (org-wide vs batch-scoped)
  that forcing a shared base now would be speculative. Flagging, not doing.

### Frontend — re-assessed, not the bug the audit implies

- **"~28 files bypass the API service layer"**: traced `apiFetchJson`
  (`lib/apiFetch.ts`) — it's documented as, and actually is, a thin adapter
  over the *same* centralized Axios instance (`api-service-layer/client.ts`)
  every `*Service` object uses: same CSRF header injection, same
  credentials handling, same `ApiError` normalization. There's no
  functional inconsistency to fix — the remaining gap is purely
  organizational (inline URL strings vs a named per-domain service
  function). For genuinely generic shared components
  (`DataTableCardField.tsx`, `use-record-row-actions.ts`, `FormModal.tsx`)
  a per-domain service isn't even the right shape — they take `apiUrl` as a
  runtime prop precisely because they're reused across many domains. Not
  touching this; the audit's premise (transport duplication) doesn't hold up.
- **`RecordModal.tsx` → RHF + Zod** (audit item #3): re-examined given this
  session's earlier RHF+Zod conversions (`AddTaskModal`, both
  `AddAnnouncementModal`s, `CreateBatchModal`, `CreateEditSeminarModal`,
  etc. — see prior session log). `RecordModal` takes a *dynamic*
  `FieldDef<T>[]` config rather than a fixed shape; Zod's whole value is a
  static, compile-time-checked schema per form. Forcing RHF+Zod onto a
  runtime field array would mean building the schema at runtime from
  `FieldDef.required`/`.validate`, which is what `RecordModal`'s existing
  `collectErrors()` already does — same behavior, more machinery. Its
  spacing/double-margin bug (the actual live issue) was already fixed this
  session; leaving the validation engine as-is.
- **34 pages not on `DataTableField`, `export namespace` convention**: still
  open, still large, still exactly the kind of "don't refactor all at once
  blind" work this doc already warns against — pick one page, convert it,
  use it as the template, same as the doc's own priority-2 guidance says.
  Not attempted this pass.

## Related fixes already applied this session (context, not open items)

- [`CreateBatchModal.tsx`](../resources/js/pages/developer/batches/CreateBatchModal.tsx) —
  was sending `PUT` for batch edit against a `crudModule` route that only
  registers `POST` for update/create. Fixed to `POST`. Still bypasses the
  API service layer (see above) and still uses manual `validate()` (see
  above) — not fully migrated, just unblocked.
- 4 stale Pest tests fixed to match actual (correct) app behavior:
  `AuthenticationTest.php`, `UserRoleManagementTest.php`,
  `PartnerSchoolFieldsTest.php`. Full suite: 213/213 passing.
