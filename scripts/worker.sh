#!/usr/bin/env bash
set -e

ENV="${APP_ENV:-production}"
echo "Starting Queue Worker in environment: $ENV"

# Laravel's default log channel (stack -> single) writes only to
# storage/logs/laravel.log, a file Coolify's log viewer never shows (it only
# captures container stdout/stderr). Append the built-in 'stderr' channel so
# every log line -- including the mail-outcome logging below -- also reaches
# the log viewer, without disturbing the existing file log.
export LOG_STACK="single,stderr"

# Diagnostic: confirm the env vars this specific service actually received
# (Coolify apps don't share env vars between services by default). Never
# print MAIL_PASSWORD.
echo "QUEUE_CONNECTION=${QUEUE_CONNECTION:-<unset>}"
echo "DB_CONNECTION=${DB_CONNECTION:-<unset>}"
echo "MAIL_MAILER=${MAIL_MAILER:-<unset>}"
echo "MAIL_HOST=${MAIL_HOST:-<unset>}"

# Handle graceful shutdown when container stops
term_handler() {
    echo "Shutting down queue worker gracefully..."
    php artisan queue:restart
    exit 0
}
trap 'term_handler' SIGTERM SIGINT

# Run worker in foreground
exec php artisan queue:work \
    --tries=3 \
    --backoff=10 \
    --max-time=3600 \
    --memory=128