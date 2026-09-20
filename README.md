# savorylogs

A food journal app. Monorepo containing the full-stack web app and the mobile app.

## Layout

- `apps/web` — Laravel 13 + Inertia v3 + React 19 full-stack app (formerly the `kjeats` repo)
- `apps/mobile` — Expo (SDK 56) React Native app
- `packages/shared` — platform-agnostic TypeScript: domain types, zod schemas, constants, pure utils

## Prerequisites

- PHP 8.4, Composer
- Node >= 20.19, pnpm 8 (`corepack enable`)

## Setup

```sh
pnpm install
cd apps/web && composer install && cp .env.example .env && php artisan key:generate && php artisan migrate
```

## Commands

```sh
pnpm dev:web      # Laravel dev (php artisan serve + queue + vite)
pnpm dev:mobile   # Expo dev server
pnpm build:web    # Production frontend build
pnpm typecheck    # tsc across all packages
pnpm lint:check   # lint across all packages
```
