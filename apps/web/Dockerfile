# =============================================================================
# Build context: monorepo root.
# Build with: docker build -f apps/web/Dockerfile .
# =============================================================================

# =============================================================================
# Stage 1: Install PHP dependencies (production only)
# =============================================================================
FROM composer:2 AS composer-builder

WORKDIR /app

COPY apps/web /app

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
# Workspace-aware pnpm install scoped to the web app.
# =============================================================================
FROM php:8.3-cli-bookworm AS node-builder

# Install Node.js 20.x, pnpm, and minimal PHP extensions for artisan bootstrap
# Note: tokenizer, ctype, fileinfo are already compiled into PHP 8.3 core
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends \
        nodejs \
        libsqlite3-dev \
        libxml2-dev \
        libonig-dev \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_sqlite mbstring xml \
    && npm install -g corepack \
    && corepack enable

WORKDIR /app

# Copy workspace manifests and lockfile, then install only the web app's deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/shared packages/shared
RUN pnpm install --frozen-lockfile --ignore-scripts --filter @savorylogs/web...

# Copy the full app + vendor from the composer stage
COPY --from=composer-builder /app ./apps/web

# Ensure writable directories exist for artisan to bootstrap
RUN mkdir -p \
        apps/web/storage/framework/views \
        apps/web/storage/framework/cache/data \
        apps/web/storage/framework/sessions \
        apps/web/storage/framework/testing \
        apps/web/bootstrap/cache \
    && chmod -R 777 apps/web/storage apps/web/bootstrap/cache

# Create a throw-away .env so artisan can generate an APP_KEY and boot.
# This is only used at build time and never copied to the final image.
RUN cd apps/web \
    && php -r "echo 'APP_KEY=base64:' . base64_encode(random_bytes(32)) . PHP_EOL;" > .env \
    && printf 'APP_ENV=local\nDB_CONNECTION=sqlite\nDB_DATABASE=/tmp/build.sqlite\n' >> .env \
    && touch /tmp/build.sqlite

RUN cd apps/web && pnpm --filter @savorylogs/web build

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
COPY apps/web/docker/php/opcache.ini "$PHP_INI_DIR/conf.d/opcache.ini"
COPY apps/web/docker/php/custom.ini "$PHP_INI_DIR/conf.d/custom.ini"

WORKDIR /var/www/html

# Copy application source
COPY --chown=www-data:www-data apps/web .

# Overlay vendor from composer builder
COPY --from=composer-builder --chown=www-data:www-data /app/vendor ./vendor

# Overlay Vite-built assets
COPY --from=node-builder --chown=www-data:www-data /app/apps/web/public/build ./public/build

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

COPY apps/web/docker/nginx/default.conf /etc/nginx/sites-available/default
RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Supervisor config
COPY apps/web/docker/supervisord.conf /etc/supervisor/conf.d/laravel.conf

# Ensure the supervisor log directory exists
RUN mkdir -p /var/log/supervisor

# Entrypoint
COPY apps/web/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
