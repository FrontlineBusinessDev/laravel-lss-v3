# ---- Stage 1: frontend assets ----
FROM node:22-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# ---- Stage 2: runtime image ----
FROM dunglas/frankenphp:1-php8.4

ENV PORT=8000 \
    ENTRYPOINT_SYMBOL=frankenphp \
    COMPOSER_ALLOW_SUPERUSER=1 \
    LOG_STACK=single,stderr

WORKDIR /app

# 1. Install system dependencies & PHP extensions (including PostgreSQL drivers)
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
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# 2. Install Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Install PHP dependencies first, cached independently of app source so a
#    code-only change doesn't force a full re-download of vendor/.
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-dev --no-scripts --no-autoloader

# 4. Copy application source
COPY . .

# 5. Bring in the frontend build output from the node stage
COPY --from=frontend /app/public/build ./public/build

# 6. Finish PHP dependency setup now that artisan is available (runs
#    post-autoload-dump / package:discover)
RUN composer dump-autoload --optimize --no-dev

# 7. Configure Octane
RUN php artisan octane:install --server=frankenphp --no-interaction

# 8. Set execution permissions
RUN chmod +x scripts/deploy.sh scripts/worker.sh

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT:-8000}/up" || exit 1

CMD ["bash", "scripts/deploy.sh"]
