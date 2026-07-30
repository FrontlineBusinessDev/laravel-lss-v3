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

# 3. Copy application files
COPY . .

# 4. Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader

# 5. Install Node dependencies and build assets
RUN npm install --legacy-peer-deps && npm run build

# 6. Configure Octane
RUN php artisan octane:install --server=frankenphp --no-interaction

# 7. Set execution permissions
RUN chmod +x scripts/deploy.sh scripts/worker.sh

EXPOSE 8000

CMD ["bash", "scripts/deploy.sh"]