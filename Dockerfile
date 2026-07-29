# ==========================================
# STAGE 1: Build Frontend Assets with Node
# ==========================================
FROM node:22-alpine AS frontend

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application source files and compile assets
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: PHP Application & FrankenPHP
# ==========================================
FROM dunglas/frankenphp:1-php8.4

# Set environment variables for production
ENV PORT=8000 \
    ENTRYPOINT_SYMBOL=frankenphp \
    COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

# Install system dependencies & required PHP extensions for Laravel
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    curl \
    && install-php-extensions \
        pdo_mysql \
        gd \
        intl \
        zip \
        opcache \
        pcntl \
        redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer from official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application code
COPY . .

# Copy built frontend assets from the frontend stage
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies without dev packages
RUN composer install --no-interaction --prefer-dist --no-dev --optimize-autoloader

# Run Octane install (using local binary integrated into dunglas/frankenphp)
RUN php artisan octane:install --server=frankenphp --no-interaction

# Set execution permission on deployment script
RUN chmod +x scripts/deploy.sh

EXPOSE 8000

# Start container using your deploy script
CMD ["bash", "scripts/deploy.sh"]