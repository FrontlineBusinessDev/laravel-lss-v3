# LSS Admin — Project Context

> Learning Solutions System (LSS) Admin console for **Frontline Business Solutions, Inc.**
> Laravel + Inertia.js backend hosting a ported React/TypeScript/Tailwind frontend.
> This file is the canonical project primer. Keep it terse; update it as scope changes.

## Overview

Admin console for managing FBS's On-the-Job Training (OJT) / learning program:
batches, trainees, seminars, payments, biometrics, evaluations, ratings,
certificates, leave, tasks, announcements, and reports.

The frontend was originally built as a standalone Vite + React SPA
(`lss-eval`, using react-router-dom). It has been **ported into a Laravel +
Inertia app**, patterned structurally after `laravel-fbs-ticket-system-repo`.

**Current phase: static frontend + real login only.** Every module page
renders from client-side mock data; the only working backend is auth.

## Objectives (this phase)

- Stand up the full LSS admin UI inside Laravel + Inertia, module by module.
- Wire **real authentication** (login/logout) with 3 roles.
- Keep all module data static (mock) for now — no CRUD, no per-module tables.
- Mirror the `laravel-fbs` backend conventions so later phases slot in cleanly.

## What's Actually Wired Up

- **Auth**: real login via Laravel Fortify (`POST /login`), logout
  (`POST /logout`), driven from the sidebar/topbar user menu. Fortify's
  password-reset & email-verification features are intentionally **disabled**
  in `config/fortify.php`.
- **Roles**: 3 roles via Spatie permissions — `admin`, `trainer`, `trainee`.
  No permissions/gates defined yet.
- **Everything else is static.** Each module route is a plain `Route::get`
  hitting a thin `app/Http/Controllers/Lss/*Controller` that only renders
  the matching Inertia page. React pages read from
  `resources/js/data/mockData.ts`.

## Roles

- **Admin** — full console (implied; no gating enforced yet).
- **Trainer** — program/trainee-facing staff.
- **Trainee** — OJT participant.

_Role-based route/UI gating is NOT implemented yet — only `auth` middleware
is applied. Role differentiation is seeded and available via `useAuth()` but
not yet used to restrict access._

## Modules (routes)

All under `auth` middleware, plain `Route::get` per module (no role middleware):

| Route | Page | Notes |
|---|---|---|
| `/dashboard` | `dashboard/index` | landing after login |
| `/batches`, `/batches/{id}` | `batches/index`, `batches/detail` | id resolved client-side against mock data |
| `/trainees`, `/trainees/{id}` | `trainees/index`, `trainees/detail` | id resolved client-side; tabbed detail (personal, academic, docs, ratings, payments, biometrics, certificate, learning outcomes) |
| `/announcements` | `announcements/index` | audience targeting, recipient count, archive/restore |
| `/leave` | `leave/index` | approve/decline workflows, notifications |
| `/biometrics` | `biometrics/index` | CSV import wizard, computed fields, print preview |
| `/tasks` | `tasks/index` | |
| `/ratings` | `ratings/index` | task rating + behavioral assessment |
| `/evaluation` | `evaluation/index` | stats, charts, questionnaire CRUD, access override |
| `/payments` | `payments/index` | dual-ledger (batch + seminar), tier auto-computation, print reports |
| `/schedule` | `schedule/index` | Gantt timeline, yearly calendar, detail modal |
| `/seminars` | `seminars/index` | participants, email templates, admin alerts |
| `/certificates` | `certificates/index` | citations, print |
| `/reports` | `reports/index` | annual/aggregate views |
| `/settings` | `settings/index` | tabs: Users, Partner schools, Academic |

`GET /` dispatches: guests → `/login`, authenticated → `/dashboard`.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite`), Vite, lucide-react icons.
- **Backend**: Laravel + Inertia.js (server-side routing, `Inertia::render`).
- **Auth**: Laravel Fortify (login only) + Spatie laravel-permission (roles).
- **DB**: SQLite by default (`database/database.sqlite`); mock module data lives client-side.
- **Build**: Vite + `laravel-vite-plugin`, `@inertiajs/vite`, `@vitejs/plugin-react`, wayfinder.

## Data Model (real, backend)

Only auth-related tables exist:

- **User** — `id, first_name, last_name, email, status, password, timestamps`.
  `name` is an appended read-only accessor (`first_name last_name`). Uses
  Spatie `HasRoles`. `status` gates login (`active` / `inactive`).
- **Spatie tables** — roles, permissions, model_has_roles, etc.
- **sessions / cache / jobs** — Laravel defaults.

## Data Model (mock, frontend)

Domain data is static in `resources/js/data/mockData.ts` and served through
React context providers (`BatchesContext`, `NotificationsContext`) + a `Toast`
provider. Key exports: `batches`, `trainees`, `partnerSchools`, `industries`,
`academicLevels/Programs`, `learningOutcomes`, `appUsers`, `currentUser`,
`leaveRecords`, `notifications`, `tasks`, `announcements`, `calendarEvents`,
`biometricRecords/Imports`, `taskRecords`, `taskRatingRecords`, `seminars` +
participants/templates/alerts, `certificateCitations`, `evaluationQuestions`
/responses, `behavioralQuestions`/records, `pricingTiers`, `schoolAgreements`.
Shared `TODAY` demo-date constant anchors all relative dates.

## Frontend Architecture Notes

- **Router shim**: the ported app used `react-router-dom`. It's replaced by
  `resources/js/lib/router-compat.tsx` — a drop-in reimplementation of
  `Link`, `NavLink`, `useNavigate`, `useParams`, `useSearchParams`, `Navigate`
  backed by Inertia's router. Import from `@/lib/router-compat`, never
  `react-router-dom`.
- **Layout**: `app.tsx` wraps non-auth pages in a persistent `AppShell`
  (sidebar + topbar) and mounts `ToastProvider` → `NotificationsProvider` →
  `BatchesProvider`. `auth/*` pages render full-screen (own `AuthLayout`).
- **Page resolution**: standard Inertia convention — `pages/<name>.tsx`,
  entry pages are `index.tsx` / `detail.tsx` per module folder.
- **Auth in UI**: `resources/js/hooks/use-auth.ts` reads the shared
  authenticated user from `HandleInertiaRequests`. Everything else is mock.
- **Print isolation**: global `.print-area` / `.no-print` convention in
  `app.css`; `.cert-page-break` for certificate batches.
- **Theme tokens**: brand blue scale, cool neutral scale, semantic
  success/warning/danger/info, shadows, radii, animations — all in `app.css`
  under Tailwind v4 `@theme`.

## Seeded Accounts

`php artisan migrate:fresh --seed`. Password for all: `123123qQ!`

| Email | Role |
|---|---|
| contact@frontlinebusiness.com.ph | admin |
| emmanuel.manalo@frontlinebusiness.com.ph | trainer |
| vincent.ramirez@frontlinebusiness.com.ph | trainer |
| emmszhii@gmail.com | trainee |

Credentials intentionally mirror the `laravel-fbs` seed pattern.

## Local Dev

```bash
composer install
cp .env.example .env      # provided in repo
php artisan key:generate
touch database/database.sqlite   # if missing
php artisan migrate:fresh --seed
npm install
npm run dev               # terminal 1
php artisan serve         # terminal 2
```

## Conventions

- **Backend structure**: follows `laravel-fbs-ticket-system-repo` — thin
  controllers, `Inertia::render`, providers in `bootstrap/providers.php`,
  middleware in `bootstrap/app.php`. Do NOT introduce new architectural
  patterns; match the existing codebase.
- **Frontend**: production-quality UI, mobile responsiveness, cross-module
  consistency. Reuse existing components/context; don't add new state
  patterns without reason. Prefer editing existing files over creating new.
- **Router**: always `@/lib/router-compat`, never `react-router-dom`.
- **Data**: module data stays in `mockData.ts` until a module is promoted to
  real backend; keep the dual-ledger payments split and `TODAY` conventions.
- **Code style**: Pint (PHP), ESLint + Prettier (TS). `composer test` runs
  lint + phpstan + tests.

## Out of Scope (this phase)

- CRUD / write endpoints for any module (only login writes to the DB).
- Real backend tables for batches, trainees, seminars, payments, etc.
- Role/permission gating on routes or UI.
- Fortify password reset, email verification, two-factor.
- Notifications delivery (mock-only in the frontend).

## Next Steps

- Promote modules from mock → real: add tables, migrations, controllers, and
  swap `mockData.ts` reads for Inertia props, one module at a time.
- Add role/permission middleware (`role:admin`, etc.) once access rules per
  module are defined.
- Re-enable Fortify features (password reset / verification) if required.

---

_This build is deliberately frontend-first: the goal was to pattern the
lss-admin UI into the laravel-fbs backend structure using static/mock data,
incorporating only login as working backend functionality._
