#!/usr/bin/env bash
set -e

# Ensure log directory exists
mkdir -p storage/logs

# 1. Run Database Migrations & Seeders
if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "staging" ] || [ "$APP_ENV" = "development" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
    php artisan db:seed --class=RoleSeeder --force
fi

# 2. Optimization Caching
if [ "$APP_ENV" = "production" ]; then
    echo "Caching Laravel configuration..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
else
    echo "Clearing Laravel caches..."
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
fi

# 3. Handle Container Termination Gracefully
term_handler() {
    echo "Shutting down container gracefully..."
    # Kill background jobs (SSR and Queue)
    kill -TERM "$SSR_PID" "$QUEUE_PID" 2>/dev/null || true
    exit 0
}
trap 'term_handler' SIGTERM SIGINT

# 4. Start Inertia SSR Server in Background
echo "Starting Inertia SSR server..."
php artisan inertia:start-ssr > storage/logs/ssr.log 2>&1 &
SSR_PID=$!

# Brief check to verify SSR started successfully
sleep 2
if ! kill -0 "$SSR_PID" 2>/dev/null; then
    echo "WARNING: Inertia SSR server failed to start! Check storage/logs/ssr.log"
fi

# 5. Start Queue Worker Loop in Background
echo "Starting Queue Worker..."
(
    while true; do
        php artisan queue:work --tries=3 --backoff=10 --max-time=3600 --memory=128 >> storage/logs/queue.log 2>&1
        sleep 2
    done
) &
QUEUE_PID=$!

# 6. Start FrankenPHP / Octane in Foreground
echo "Starting Laravel Octane with FrankenPHP..."
exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port="${PORT:-8000}" --workers=2 --max-requests=250