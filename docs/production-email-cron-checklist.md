# Production Email & Cron Checklist (Coolify + Hostinger)

Emails work locally but nothing sends in production, even with the scheduler
"set to run per minute." This document covers what to check in Coolify's and
Hostinger's dashboards — none of it is fixable from inside this repo, unlike
the code bugs already fixed alongside this doc (see below).

## Code bugs already fixed in this change (for context)

These were real, silent bugs found while investigating — not just
config/infra issues:

1. **`routes/cron.php` was never loaded.** `bootstrap/app.php`'s
   `withRouting()` only registered `web` and `commands`; the cron route file
   was never passed in anywhere, so `GET /cron/{token}` 404'd unconditionally,
   regardless of token. Fixed by loading it via a `then:` closure, outside the
   `web` middleware group (stateless, no session/CSRF, as intended).
2. **`CronController::__invoke()` did nothing.** The real body was `logger('Custom background tasks executed safely via native scheduler.')`
   — it never called `Artisan::call('schedule:run')`. The actual scheduler
   trigger was commented out. Fixed by restoring it (token check + `schedule:run` + logging).
3. **Redundant self-referential schedule entry.** `bootstrap/app.php` also
   scheduled `CronController` itself to run every minute *inside* Laravel's
   own scheduler (`Schedule::call(new CronController)->everyMinute()`) — since
   `CronController` now correctly calls `schedule:run`, leaving this in would
   make every scheduler tick recursively re-invoke itself. Removed; the
   HTTP route is the only entry point for hosts without real crontab access.
4. **`announcements:dispatch-scheduled` was already registered** in
   `bootstrap/app.php`'s `withSchedule()` (Laravel 11+ style) — it was not
   missing, contrary to first appearances from only checking
   `routes/console.php` (the older, pre-11 convention, which this app doesn't
   use for scheduling).

If production still doesn't send mail after deploying this fix, one or more
of the following (genuinely outside this repo's reach) is the cause.

## 1. Is anything actually calling the scheduler?

Pick exactly one of these two mechanisms — don't run both:

- **Real crontab** (if Coolify/Hostinger gives you shell/cron access):
  ```
  * * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1
  ```
  Confirm this line exists in the container's actual crontab (`crontab -l`),
  not just documented somewhere — a documented-but-never-applied cron entry
  behaves identically to no scheduler at all.
- **External HTTP cron** (for hosts with no real cron access, e.g. shared
  Hostinger plans): a free service like cron-job.org hits
  `GET https://yourdomain/cron/{CRON_SECRET}` once a minute. Requires:
  - `CRON_SECRET` set in the production `.env` (generate with
    `php artisan tinker --execute="echo \Illuminate\Support\Str::random(48);"`).
  - The external service configured with that exact URL/token and a
    1-minute interval.
  - Confirm it's actually firing: check the external service's own run
    history/logs, and check `storage/logs/laravel.log` for
    `Custom background tasks executed safely` — wait, that log line was
    removed as part of this fix (dead code); after the fix, a successful hit
    just returns `200 OK` with body `OK`. Verify with
    `curl -i https://yourdomain/cron/YOUR_SECRET` and check for `200`.

## 2. Is a queue worker actually running?

Every mailable in this app is dispatched via `Mail::to(...)->queue(...)`, not
`->send()` (`QUEUE_CONNECTION=database` by default). If nothing is draining
the `jobs` table, queued mail piles up silently — **this is the single most
likely root cause** given the codebase's mail-dispatch pattern.

- Confirm a `php artisan queue:work --tries=3` process is running
  **continuously** — in Coolify this typically means a second, dedicated
  "service"/process alongside the web container (not something that ends when
  a deploy's build step finishes). A one-off `queue:work` run during deploy is
  not enough; it needs to be a supervised, always-on process (or
  `queue:work --stop-when-empty` re-triggered on its own schedule if a true
  daemon isn't available on the plan).
- Run `php artisan queue:failed` — if jobs are accumulating there, the worker
  IS running but mail is failing for a different reason (see §3/§4).
- Run `php artisan queue:monitor database` or check the `jobs` table row
  count directly — a growing, never-shrinking count means no worker is
  consuming it at all.

## 3. Are the mail credentials actually valid for the target host?

- Confirm `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`,
  `MAIL_PASSWORD`, `MAIL_ENCRYPTION` are set in Coolify's environment
  variables for the **production** deployment specifically (not just present
  in a local `.env` file that isn't what's actually deployed).
- `MAIL_MAILER=log` (the repo default) sends nothing — confirm it's been
  overridden to `smtp` (or another real transport) in production.
- Run `php artisan mail:diagnose you@example.com` (new command added in this
  change) directly inside the production container/shell — it sends
  synchronously (bypasses the queue entirely), isolating "SMTP config is
  wrong" from "queue worker isn't running."

## 4. Is Hostinger's firewall blocking outbound mail ports?

- Outbound port 587 (STARTTLS) or 465 (implicit TLS/SSL) must not be blocked.
  Some shared-hosting plans block outbound 25 by default but allow 587/465 —
  confirm which port the SMTP provider requires and that it matches
  `MAIL_PORT`/`MAIL_ENCRYPTION`.
- Test directly from inside the container: `nc -zv smtp.host.name 587` (or
  `465`) — a hang/refused connection means the firewall (or the provider) is
  blocking it, not a Laravel/app-level issue.
