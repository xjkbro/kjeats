#!/bin/sh
set -e

# Cache Laravel config, routes, and views for production performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Wait for the database to be reachable before migrating (up to 30s)
echo "Waiting for database..."
MAX_TRIES=30
i=0
until php artisan db:show --json > /dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -ge "$MAX_TRIES" ]; then
        echo "Database not reachable after ${MAX_TRIES}s — aborting."
        exit 1
    fi
    sleep 1
done
echo "Database is ready."

php artisan migrate --force

exec "$@"
