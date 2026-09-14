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

Documented conventions are ~0% adopted — systemic drift, not isolated bugs.

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

### DataTableField pattern unused for its documented job

Only 3 files use it — all for form-field selects
(`CreateBatchFields.tsx`, `CreateBatchModal.tsx`, `UserModal.tsx`), not table
filtering. ~34 list pages reimplement search/filter/pagination state by hand:
`payments`, `batches`, `biometrics`, `seminars`, `tasks`, `leave`,
`evaluation`, `system-log`, `settings/{rates,roles}`, `certificates/*`,
`reports/*`, trainee/trainer mirrors.

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

1. Fix `use-record-row-actions.ts`, `FormModal.tsx`, `DataTableCardField.tsx`
   first — 3 shared files, fixes the API-layer bypass for every page that
   consumes them without touching each page individually.
2. Pick ONE list page, convert to `DataTableField`, use as the template
   before touching the other ~33 — don't refactor all at once blind.
3. Convert `RecordModal.tsx` (shared) to RHF+Zod first — template for the
   manual-`validate()` pages.
4. `export namespace` — lowest priority; batch-convert only when touching a
   file for other reasons.

## Related fixes already applied this session (context, not open items)

- [`CreateBatchModal.tsx`](../resources/js/pages/developer/batches/CreateBatchModal.tsx) —
  was sending `PUT` for batch edit against a `crudModule` route that only
  registers `POST` for update/create. Fixed to `POST`. Still bypasses the
  API service layer (see above) and still uses manual `validate()` (see
  above) — not fully migrated, just unblocked.
- 4 stale Pest tests fixed to match actual (correct) app behavior:
  `AuthenticationTest.php`, `UserRoleManagementTest.php`,
  `PartnerSchoolFieldsTest.php`. Full suite: 213/213 passing.
