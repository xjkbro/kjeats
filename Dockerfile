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
# Uses the PHP image as base so `php artisan` works for the Wayfinder plugin.
# =============================================================================
FROM php:8.3-cli-bookworm AS node-builder

# Install Node.js 20.x
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Minimal PHP extensions needed for artisan to bootstrap
RUN apt-get update && apt-get install -y --no-install-recommends \
        libsqlite3-dev \
        libxml2-dev \
        libonig-dev \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_sqlite mbstring xml tokenizer

WORKDIR /app

COPY package.json package-lock.json pnpm-workspace.yaml ./
RUN npm ci --ignore-scripts

# Copy the full app + vendor from the composer stage
COPY --from=composer-builder /app ./

# Ensure writable directories exist for artisan to bootstrap
RUN mkdir -p \
        storage/framework/views \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

# Create a throw-away .env so artisan can generate an APP_KEY and boot.
# This is only used at build time and never copied to the final image.
RUN php -r "echo 'APP_KEY=base64:' . base64_encode(random_bytes(32)) . PHP_EOL;" > .env \
    && printf 'APP_ENV=local\nDB_CONNECTION=sqlite\nDB_DATABASE=/tmp/build.sqlite\n' >> .env \
    && touch /tmp/build.sqlite

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
