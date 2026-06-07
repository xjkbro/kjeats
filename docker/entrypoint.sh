#!/bin/sh
set -e

# Cache Laravel config, routes, and views for production performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations automatically.
# Remove or comment out this line if you prefer to run migrations manually.
php artisan migrate --force

exec "$@"
