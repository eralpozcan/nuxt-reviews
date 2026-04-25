# Changelog

All notable changes to this project will be documented in this file.

## v0.1.3

[compare changes](https://github.com/eralpozcan/nuxt-reviews/compare/v0.1.2...v0.1.3)

### 🚀 Enhancements

- Add component kit, mock provider, useReviewSchema, and pagination ([646e656](https://github.com/eralpozcan/nuxt-reviews/commit/646e656))

### 🩹 Fixes

- **docs:** Correct GitHub username in app config links ([62e5239](https://github.com/eralpozcan/nuxt-reviews/commit/62e5239))

### ❤️ Contributors

- Eralpozcan <eralpozcans@gmail.com>

## v0.1.2

[compare changes](https://github.com/eralpozcan/nuxt-reviews/compare/v0.1.1...v0.1.2)

### Features

- **providers:** Add Booking.com Guest Review API provider (BETA) — fetch guest reviews via Connectivity Partner credentials with automatic 1-10 → 1-5 rating normalization, pagination support, and positive/negative text merging

### Documentation

- Add Booking.com provider guide with beta badge and configuration examples
- Update README with Booking.com in features, config, providers table, API routes, and environment variables
- Update homepage, introduction, and types documentation to include Booking.com

## v0.1.1

[compare changes](https://github.com/eralpozcan/nuxt-reviews/compare/v0.1.0...v0.1.1)

### Features

- **playground:** Interactive playground with API key input — test review fetching directly from the browser without `.env` setup
- **playground:** Visual review cards with author avatar, star ratings, business responses, and aggregate dashboard

### Tests

- Add comprehensive unit and e2e test suite (35 tests)
  - `aggregate` — computeAggregate, buildCollection
  - `providers` — registry for all 4 providers, unknown provider error
  - `google` — config validation, review normalization, language filter
  - `trustpilot` — config validation, review normalization, pagination
  - `moderation` — Perspective API & OpenAI, filter/flag modes, thresholds
  - `basic` — SSR rendering, API route registration (e2e)

### Build

- Upgrade all dependencies to latest versions (Nuxt 4.4.2, Vitest 4.x, ESLint 10.x, TypeScript 5.9)
- Align with official Nuxt module starter template
- Add `pnpm-workspace.yaml` for monorepo support
- Add `changelogen` for conventional release workflow

### Docs

- README aligned with official Nuxt module starter template
- Nuxt-style badges (npm version, downloads, license)
- Collapsible contribution/development guide
- `npx nuxi module add nuxt-reviews` as primary install method

### Fixes

- Add `defu` as explicit dependency for build
- Fix tsconfig for module-builder compatibility
- Add `compatibilityDate` for Nuxt 4 support

### CI

- Add Netlify deployment config for playground

## v0.1.0

### Features

- **Multi-provider support** — Google Places, Trustpilot, SerpAPI, Outscraper
- **Normalized data model** — All reviews mapped to a single Schema.org-based interface
- **Aggregated & Single mode** — Parallel fetching from all providers or single provider selection
- **Auto-imported composable** — `useReviews()` ready to use in any component
- **Content moderation** — Toxicity filtering via Google Perspective API and OpenAI Moderation API
- **minRating filter** — Filter reviews above a specific rating threshold
- **Server-side caching** — Nitro cached handler support
- **Full TypeScript support** — Provider-specific config types with type augmentation
