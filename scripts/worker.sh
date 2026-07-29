#!/usr/bin/env bash
set -e

ENV="${APP_ENV:-production}"
echo "Starting Queue Worker in environment: $ENV"

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