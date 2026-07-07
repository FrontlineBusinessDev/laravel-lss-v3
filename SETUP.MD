# LSS Admin — Setup

Laravel + Inertia + React + TypeScript + Tailwind, patterned from the
laravel-fbs-ticket-system-repo backend structure, with the frontend from
lss-admin (lss-eval) ported into `resources/js`.

## What's wired up

- **Auth**: real login via Laravel Fortify (`/login`), 3 roles seeded via
  Spatie permissions — `admin`, `trainer`, `trainee`. Logout works too
  (`POST /logout`, wired from the sidebar/topbar user menu).
- **Everything else is static frontend.** Each module (`/dashboard`,
  `/batches`, `/trainees`, `/announcements`, `/leave`, `/biometrics`,
  `/tasks`, `/ratings`, `/evaluation`, `/payments`, `/schedule`,
  `/seminars`, `/certificates`, `/reports`, `/settings`) has a normal
  `Route::get` + a thin controller in `app/Http/Controllers/Lss` that just
  renders the matching Inertia page. No CRUD endpoints, no DB tables for
  these modules — the React pages read mock data from
  `resources/js/data/mockData.ts`, same as the original lss-admin app.
- **Only `auth` middleware is applied** to the module routes, per current
  scope. No role/permission gating yet.
- react-router-dom (used by the original lss-admin app) has been swapped
  for a small compatibility shim at `resources/js/lib/router-compat.tsx`
  so the ported pages/components needed minimal changes. It re-implements
  `Link`, `NavLink`, `useNavigate`, `useParams`, `useSearchParams`, and
  `Navigate` on top of Inertia's router.

## Seeded accounts

Run `php artisan migrate:fresh --seed`. Password for all accounts: `123123qQ!`

| Email                                       | Role    |
|----------------------------------------------|---------|
| contact@frontlinebusiness.com.ph              | admin   |
| emmanuel.manalo@frontlinebusiness.com.ph      | trainer |
| vincent.ramirez@frontlinebusiness.com.ph      | trainer |
| emmszhii@gmail.com                            | trainee |
| audie@gmail.com                               | trainee |

## Local dev

```bash
composer install
cp .env.example .env   # already present in this zip
php artisan key:generate
touch database/database.sqlite   # if it doesn't already exist
php artisan migrate:fresh --seed
npm install
npm run dev             # in one terminal
php artisan serve       # in another
```

## Next steps (not in this pass)

- Real data tables + controllers per module (batches, trainees, etc.),
  swapping `data/mockData.ts` reads for props from the backend.
- Role/permission middleware on routes once each module's access rules
  are defined (e.g. `role:admin`).
- Re-enable Fortify's password reset / email verification features in
  `config/fortify.php` if needed — they're intentionally off for now.
