# AGENTS.md

> You are an AI coding agent. The developer just asked you to integrate, extend, or fix something related to `nuxt-reviews`. This file is your playbook. Read it first, then start.

## 1. Decide which side you're on

Ask: is the developer **using** the module in their Nuxt app, or **contributing** to the module itself?

- **Consumer (most common).** They have a Nuxt app and want reviews displayed. Work in their app's repo, not here. Use this repo only as the source of truth for the API.
- **Contributor.** They want to fix a bug, add a provider, or change the module. Work inside `src/`, `test/`, or `playground/`.

If unclear, ask: "Are you integrating this into your Nuxt app, or modifying the module itself?"

## 2. Consumer playbook (most common)

### Goal: add reviews to the developer's Nuxt app

1. Run `npx nuxi module add nuxt-reviews` in their app — this installs the dep and registers the module.
2. Open `nuxt.config.ts`. Add `runtimeConfig.reviews.providers` with only the providers the developer wants. Every credential is server-only.
3. In a page or component:
   ```vue
   <script setup>
   const { reviews, aggregate, pending, error } = useReviews()
   </script>
   <template>
     <ReviewSummary v-if="aggregate" :aggregate="aggregate" />
     <ReviewList :reviews="reviews" :aggregate="aggregate" />
   </template>
   ```
4. For SEO, also call `useReviewSchema(reviews, aggregate, { name, url, image, description })` in the same setup.
5. If they need to gate `/api/_reviews` behind auth, add Nitro middleware — the module does not enforce auth.

### Choosing a provider

Use this table to recommend one. Don't add a provider they didn't ask for.

| Need                                    | Recommend                            |
| --------------------------------------- | ------------------------------------ |
| Easiest setup, no signup                | `mock` (fake data, dev only)         |
| Most common, free tier exists            | `google` (requires Google Cloud key)  |
| Multi-business SaaS, need business unit | `trustpilot`                         |
| Already paying for SerpAPI              | `serpapi`                            |
| Already paying for Outscraper           | `outscraper`                         |
| Hotel/accommodation, official feed      | `bookingcom` (BETA, Connectivity Partner) |

### Common consumer questions

- "How do I paginate?" → `useReviews({ provider, pageToken })` for single-provider; the result includes `nextPageToken`.
- "How do I filter by rating?" → `useReviews({ minRating: 4 })` or globally `runtimeConfig.reviews.minRating`.
- "How do I show a single provider?" → `useReviews({ provider: 'google' })`.
- "How do I get JSON-LD for Google rich results?" → `useReviewSchema(reviews, aggregate, { name, url, image, description })`.
- "Is the API authenticated?" → No, by design. Add Nitro middleware if you need to.
- "Where do my API keys go?" → `runtimeConfig` (server-only) — never `app.config` or `runtimeConfig.public`.
- "Can I use this without any provider?" → Set `mock` only; works with zero credentials.

### Don't (consumer side)

- Don't read `runtimeConfig.reviews.*` from `<script setup>` in a page or from a client composable. It's server-only.
- Don't put the `apiKey` in client-exposed config.
- Don't render the `raw` field — it's the full upstream payload, may include PII, useful for debugging only.
- Don't expect the `mock` provider to behave like the real ones — its response shape intentionally diverges in places.

## 3. Contributor playbook

### Build / test / lint

- `pnpm install` at the root, then `pnpm install` inside `playground/` (separate lockfile).
- `pnpm dev:prepare` builds module stubs and prepares types — run this once after `pnpm install`.
- `pnpm dev` starts the playground (full Nuxt app at `playground/`).
- `pnpm test` runs vitest. 36 pass, 1 skipped (`test/basic.test.ts` > `renders the index page` — flaky, do not remove the skip without diagnosing).
- `pnpm lint` runs eslint with `@nuxt/eslint-config`.
- `pnpm release` is the full release flow (lint → test → build → changelogen → npm publish → git push). Requires `npm whoami` to succeed.

### Conventions

- Conventional commits (`feat:`, `fix:`, `chore(deps):`). `changelogen` parses them for CHANGELOG.
- New provider = one file in `src/runtime/server/utils/providers/<name>.ts` exporting a `ReviewProviderAdapter`. Then add to the registry, add the type, add a registry assertion in `test/providers.test.ts`, and a guide page in `playground/content/<lang>/<n>.providers.md`.
- All reviews normalize to `NormalizedReview` (Schema.org-aligned, see `src/runtime/types/index.ts`) before reaching the client.
- `console.log` is not allowed; `console.error` is fine for failures.

### Don't (contributor side)

- Don't add a top-level dependency without checking if the existing deps or Node stdlib already cover it.
- Don't read `runtimeConfig.reviews.*` from anywhere that ships to the client bundle.
- Don't skip the `bookingcom` host allowlist — `next_page` must start with `https://supply-xml.booking.com/`. See `src/runtime/server/utils/providers/bookingcom.ts:124-141`.
- Don't echo upstream error messages to the client in `src/runtime/server/api/reviews/*`. Log the full error server-side, return a generic message. See `src/runtime/server/api/reviews/[provider].get.ts` and `index.get.ts`.
- Don't write unescaped upstream data into `useReviewSchema`'s JSON-LD output. The current code uses `\u003C/\u003E/\u0026` Unicode escapes to prevent stored XSS. If you refactor, keep that property.

## 4. Where to look (file map)

| You need to…                              | Read                                    |
| ----------------------------------------- | --------------------------------------- |
| Add a new review provider                 | `src/runtime/types/index.ts` then `src/runtime/server/utils/providers/google.ts` as a template |
| Change the JSON-LD schema                 | `src/runtime/composables/useReviewSchema.ts` |
| Change the API response shape             | `src/runtime/server/utils/aggregate.ts` (`buildCollection`, `computeAverage`) |
| Change how providers are called           | `src/runtime/server/api/reviews/index.get.ts` (aggregate) and `[provider].get.ts` (single) |
| Add a new component                       | `src/runtime/components/ReviewStars.vue` is the simplest template |
| Change moderation                         | `src/runtime/server/utils/moderation.ts` |
| Update docs (consumer-facing)             | `playground/content/1.getting-started/` and `playground/content/2.guide/` |
| Update the public API surface             | Edit the types in `src/runtime/types/index.ts` first, then implementations |

## 5. When to read what

- README.md → quick install + feature list, no code
- llms.txt (this repo) → dense module reference, best for AI agents
- playground/content/ → full consumer docs (rendered at https://nuxt-reviews.netlify.app)
- AGENTS.md (this repo) → your playbook, read first
- src/ → the source of truth
- CHANGELOG.md → what changed recently

If a doc disagrees with `src/`, the source wins. Update the doc.
