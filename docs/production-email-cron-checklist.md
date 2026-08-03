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
5. **No queue worker was ever started — the actual root cause of "scheduler
   runs fine but nothing sends."** `QUEUE_CONNECTION=database`, and every
   mailable in this app is dispatched via `Mail::to(...)->queue(...)`, never
   `->send()`. The web process alone (whatever built/started it) never
   consumed the `jobs` table, so queued mail piled up silently forever, even
   though `announcements:dispatch-scheduled` ran successfully every minute
   (as confirmed by production logs: `Running ['artisan'
   announcements:dispatch-scheduled] ... DONE`). Fixed by running a dedicated
   worker process — `scripts/worker.sh`, running `php artisan queue:work
   --tries=3 --backoff=10 --max-time=3600 --memory=128` in the foreground,
   with a SIGTERM/SIGINT trap that calls `queue:restart` for graceful
   shutdown — as a **separate container/service** from `web`
   (`scripts/deploy.sh`, FrankenPHP/Octane + SSR only, no worker). See §2 for
   the two supported ways to deploy this split in Coolify.

If production still doesn't send mail after deploying this fix, one or more
of the following (genuinely outside this repo's reach) is the cause.

## 1. Is anything actually calling the scheduler?

Pick exactly one of these mechanisms — don't run more than one:

- **Coolify's built-in Scheduled Task feature** (what's actually configured
  for this app): a Scheduled Task runs `php artisan schedule:run` directly
  against the `web` service/container on a cron interval, set in Coolify's
  UI (Application → Scheduled Tasks). Confirm:
  - The task's command is exactly `php artisan schedule:run` (no path
    prefix needed — Coolify execs into the container, which already has
    `WORKDIR /app`).
  - The interval is `* * * * *` (every minute) — a longer interval directly
    adds to queued-mail/notification latency.
  - It's targeting the `web` service specifically (the only container that
    exists now that the dedicated `queue` container has been removed — see
    §2), and that the `web` container is actually up when the task fires.
  - Check the task's run history/logs in Coolify's UI to confirm it's
    firing and exiting successfully, not just that it's configured.
- **Real crontab** (if you have raw shell/cron access to the host instead):
  ```
  * * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1
  ```
  Confirm this line exists in the container's actual crontab (`crontab -l`),
  not just documented somewhere — a documented-but-never-applied cron entry
  behaves identically to no scheduler at all.
- **External HTTP cron** (`GET /cron/{CRON_SECRET}` via `routes/cron.php` /
  `CronController` — a free service like cron-job.org hits it once a
  minute): kept in the codebase as a fallback entry point for hosts with no
  shell/cron access, but **not the mechanism currently used in
  production** — this app uses Coolify's Scheduled Task feature instead.

## 2. Is a queue worker actually running?

> **Update:** the dedicated `queue` container described below has since been
> removed from `docker-compose.yml`. Job processing now relies solely on the
> scheduled drain in `bootstrap/app.php`'s `withSchedule()`
> (`queue:work --stop-when-empty --max-time=50`, riding the same per-minute
> `schedule:run` tick as §1's Coolify Scheduled Task) — confirmed acceptable
> given the ~1-2 min latency and that Scheduled Task's reliability. If mail
> piles up silently again, check **§1 first** (is the Scheduled Task actually
> firing, and against the right service?) before assuming a missing worker
> container, since there isn't one anymore.

Two supported ways to run the worker in production (historical — no longer
used by default, kept here for reference if resource constraints ease and a
persistent worker is reintroduced) — both use the same
`scripts/worker.sh` (`php artisan queue:work --tries=3 --backoff=10
--max-time=3600 --memory=128`, isolated from `web`'s process so worker
crashes don't affect the web process):

- **Docker Compose**: `docker-compose.yml` defines a dedicated `queue`
  service. Coolify must be running this app as a **"Docker Compose"
  resource**, not a "Dockerfile" resource — a plain "Dockerfile" resource
  only builds/runs the `Dockerfile` itself and silently ignores
  `docker-compose.yml`, so the `queue` service (and therefore all outgoing
  mail) would never start, with no error anywhere.
- **Two separate Dockerfile apps** (what's currently deployed): one Coolify
  application for `web` (default Dockerfile `CMD`, `scripts/deploy.sh`), and
  a **second, separate** Coolify application pointed at the same repo/image
  with its **Start Command overridden** to `bash scripts/worker.sh`. Each is
  its own container with its own environment — nothing is shared between
  them automatically.

Either way, after deploying:

- Confirm **both** services show as running/healthy in Coolify — two
  separate entries, not one. For the two-Dockerfile-apps setup specifically,
  double check the worker app's **Start Command** is actually overridden —
  if it was left at the default, that "worker" is just running `deploy.sh`
  (a second web server), and no queue worker exists at all.
- **Check the worker service's logs in Coolify.** As of this fix,
  `scripts/worker.sh` echoes the resolved `QUEUE_CONNECTION`, `DB_CONNECTION`,
  `MAIL_MAILER`, `MAIL_HOST` right at boot (never the password) — confirm
  these actually show the expected values. Coolify apps do **not** share env
  vars by default; if the worker app never had `MAIL_*`/`QUEUE_CONNECTION`
  added to its own environment variables panel, this line will show
  `<unset>` or the wrong values even though the web app is configured
  correctly.
- **Every queued mail attempt now logs its outcome explicitly**, from
  `app/Providers/AppServiceProvider.php`'s `logMailQueueOutcomes()`: a
  successful send logs `Queue mail sent: App\Mail\XxxMail to
  someone@example.com`, a failure logs `Queue mail FAILED: App\Mail\XxxMail
  to someone@example.com — <the actual exception message>`. Previously these
  went only to `storage/logs/laravel.log`, a file inside the container that
  Coolify's log viewer (which only captures stdout/stderr) never showed —
  `scripts/worker.sh` and `scripts/deploy.sh` now both `export
  LOG_STACK=single,stderr` so every log line reaches the log viewer, not just
  the file. **If the worker's logs show nothing at all for a send you know
  was queued, the job likely never reached the worker's queue in the first
  place** (wrong `QUEUE_CONNECTION`/DB, or the worker isn't actually running)
  — check the boot-time diagnostic line above.
- Run `php artisan queue:failed` — if jobs are accumulating there, the worker
  IS running but mail is failing for a different reason (see §3/§4) — the
  `Queue mail FAILED: ...` log line will already show the exact reason.
- Run `php artisan queue:monitor database` or check the `jobs` table row
  count directly — it should now drain instead of growing forever. Any
  already-stuck jobs from before this fix will get picked up and processed
  as soon as the worker boots.

## 3. Are the mail credentials actually valid for the target host?

- Confirm `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`,
  `MAIL_PASSWORD`, `MAIL_ENCRYPTION` are set in Coolify's environment
  variables for the **production** deployment specifically (not just present
  in a local `.env` file that isn't what's actually deployed). Both
  `docker-compose.yml` services (`web` and `queue`) load `env_file: .env`, so
  as long as Coolify injects/mounts the same environment for the whole
  Compose resource, one set of env vars covers both containers — but confirm
  this in Coolify's dashboard directly rather than assuming it.
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
