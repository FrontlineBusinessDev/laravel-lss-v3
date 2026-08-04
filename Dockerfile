FROM dunglas/frankenphp:1-php8.4

ENV PORT=8000 \
    ENTRYPOINT_SYMBOL=frankenphp \
    COMPOSER_ALLOW_SUPERUSER=1 \
    LOG_STACK=single,stderr

WORKDIR /app

# 1. Install system dependencies, PHP extensions (including PostgreSQL drivers), and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    curl \
    && install-php-extensions \
        pdo_mysql \
        pdo_pgsql \
        pgsql \
        gd \
        intl \
        zip \
        opcache \
        pcntl \
        redis \
    # Install Node.js (v22) & NPM
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Install PHP dependencies first, cached independently of app source so a
#    code-only change doesn't force a full re-download of vendor/.
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-dev --no-scripts --no-autoloader

# 4. Install Node dependencies, cached independently of app source too.
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 5. Copy application source
COPY . .

# 6. Finish PHP dependency setup now that artisan is available (runs
#    post-autoload-dump / package:discover)
RUN composer dump-autoload --optimize --no-dev

# 7. Build frontend assets. Needs vendor/ and artisan in place already: the
# Laravel Wayfinder Vite plugin shells out to `php artisan wayfinder:generate`
# during the build (see vite.config.ts), so this can't run in a PHP-less stage.
RUN npm run build

# 8. Configure Octane
RUN php artisan octane:install --server=frankenphp --no-interaction

# 9. Set execution permissions
RUN chmod +x scripts/deploy.sh scripts/worker.sh

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT:-8000}/up" || exit 1

CMD ["bash", "scripts/deploy.sh"]
