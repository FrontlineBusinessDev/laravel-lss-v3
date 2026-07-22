#!/usr/bin/env bash
set -e

if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "staging" ] || [ "$APP_ENV" = "development" ]; then
    php artisan migrate --force
    php artisan db:seed --class=RoleSeeder
fi

if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
else
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
fi

php artisan inertia:start-ssr > storage/logs/ssr.log 2>&1 &

(while true; do
    php artisan queue:work --tries=3 --backoff=10 --max-time=3600 >> storage/logs/queue.log 2>&1
    sleep 2
done) &

exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port="${PORT:-8080}"
