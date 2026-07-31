#!/usr/bin/env bash
set -e

mkdir -p storage/logs

# Dynamic Environment Fallback
ENV="${APP_ENV:-production}"
echo "Running application in environment: $ENV"

# See scripts/worker.sh for why this is needed: the default log channel only
# writes to a file Coolify's log viewer never shows.
export LOG_STACK="single,stderr"

# 1. Migrations & Seeders
if [ "$ENV" = "production" ] || [ "$ENV" = "staging" ] || [ "$ENV" = "development" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
    php artisan db:seed --class=RoleSeeder --force
fi

# 2. Optimization Caching
if [ "$ENV" = "production" ]; then
    echo "Caching Laravel configuration & assets..."
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

# 3. Start Inertia SSR Server in Background
echo "Starting Inertia SSR server..."
php artisan inertia:start-ssr > storage/logs/ssr.log 2>&1 &

# 4. Start FrankenPHP / Octane
echo "Starting Laravel Octane with FrankenPHP..."
exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port="${PORT:-8000}" --workers=2 --max-requests=250