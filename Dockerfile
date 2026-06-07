# =============================================================================
# Stage 1: Install PHP dependencies (production only)
# =============================================================================
FROM composer:2 AS composer-builder

WORKDIR /app

COPY . .

RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs \
    --quiet

# =============================================================================
# Stage 2: Build frontend assets
# Needs PHP because the @laravel/vite-plugin-wayfinder plugin calls
# `php artisan wayfinder:generate` at build time.
# =============================================================================
FROM node:20.19-alpine AS node-builder

WORKDIR /app

# Install a minimal PHP 8.3 so `php artisan` can run during `npm run build`
RUN apk add --no-cache \
    php83 \
    php83-phar \
    php83-mbstring \
    php83-tokenizer \
    php83-xml \
    php83-dom \
    php83-xmlwriter \
    php83-simplexml \
    php83-fileinfo \
    php83-ctype \
    php83-openssl \
    php83-session \
    php83-pdo \
    php83-pdo_sqlite \
    php83-sqlite3 \
    && ln -sf /usr/bin/php83 /usr/local/bin/php

COPY package.json package-lock.json pnpm-workspace.yaml ./
RUN npm ci --ignore-scripts

# Copy the full app (source + vendor) so artisan can bootstrap
COPY --from=composer-builder /app ./

# Create a minimal .env so `php artisan` can bootstrap during Vite build.
# The Wayfinder plugin runs `php artisan wayfinder:generate` at build time
# and requires a valid APP_KEY. This .env is only used at build time.
RUN php -r "echo 'APP_KEY=base64:' . base64_encode(random_bytes(32)) . PHP_EOL;" > .env \
    && echo "APP_ENV=production" >> .env \
    && echo "DB_CONNECTION=sqlite" >> .env \
    && echo "DB_DATABASE=:memory:" >> .env

RUN npm run build

# =============================================================================
# Stage 3: Production image
# =============================================================================
FROM php:8.3-fpm-bookworm AS production

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    libicu-dev \
    libpq-dev \
    libsqlite3-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        pdo_pgsql \
        pdo_sqlite \
        mbstring \
        xml \
        zip \
        bcmath \
        intl \
        gd \
        exif \
        opcache

# Install Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /tmp/pear

# Use production PHP config
RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Copy custom PHP config files
COPY docker/php/opcache.ini "$PHP_INI_DIR/conf.d/opcache.ini"
COPY docker/php/custom.ini "$PHP_INI_DIR/conf.d/custom.ini"

WORKDIR /var/www/html

# Copy application source
COPY --chown=www-data:www-data . .

# Overlay vendor from composer builder
COPY --from=composer-builder --chown=www-data:www-data /app/vendor ./vendor

# Overlay Vite-built assets
COPY --from=node-builder --chown=www-data:www-data /app/public/build ./public/build

# Prepare storage and cache directories
RUN mkdir -p \
        storage/logs \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Nginx: remove default config, add app config, redirect logs to stdout/stderr
RUN rm -f /etc/nginx/sites-enabled/default \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

COPY docker/nginx/default.conf /etc/nginx/sites-available/default
RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/laravel.conf

# Ensure the supervisor log directory exists
RUN mkdir -p /var/log/supervisor

# Entrypoint
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
