# nuxt-reviews

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module to fetch and aggregate reviews from multiple tourism & review platforms with a single composable.

- [✨  Release Notes](/CHANGELOG.md)
- [📖  Online Documentation](https://nuxt-reviews.netlify.app)
- [🟢  Online Playground](https://nuxt-reviews.netlify.app/playground)

## Features

- 🔌  **Multi-provider** — Google Places, Trustpilot, SerpAPI, Outscraper
- 🔄  **Normalized data** — All reviews mapped to a single Schema.org-based interface
- 📊  **Aggregate ratings** — Automatic average, total, and star distribution
- 🛡️  **Content moderation** — Toxicity filtering via Google Perspective API or OpenAI
- ⚡  **Server-side caching** — Built-in Nitro cached handlers
- 🧩  **Auto-imported** — `useReviews()` composable works out of the box
- 🎯  **Type-safe** — Full TypeScript support with provider-specific configs

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-reviews
```

Add to `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-reviews'],

  reviews: {
    providers: {
      google: {
        apiKey: process.env.GOOGLE_API_KEY,
        placeId: 'ChIJ...',
      },
      trustpilot: {
        apiKey: process.env.TRUSTPILOT_API_KEY,
        businessUnitId: '...',
      },
      // Optional paid providers
      serpapi: {
        apiKey: process.env.SERPAPI_API_KEY,
        placeId: 'ChIJ...',
      },
      outscraper: {
        apiKey: process.env.OUTSCRAPER_API_KEY,
        placeId: 'ChIJ...',
      },
    },
    cache: true,        // default: true
    cacheTTL: 3600,     // default: 1 hour
    maxReviews: 50,     // default: 50

    // Content moderation (optional)
    moderation: {
      enabled: true,
      provider: 'perspective',    // 'perspective' or 'openai'
      apiKey: process.env.PERSPECTIVE_API_KEY,
      toxicityThreshold: 0.7,    // 0.0 - 1.0 (default: 0.7)
      action: 'filter',          // 'filter' or 'flag'
    },
  },
})
```

## How It Works

The module provides **two modes** of fetching reviews:

| Mode | Endpoint | Composable | Description |
|---|---|---|---|
| **All (aggregated)** | `GET /api/_reviews` | `useReviews()` | Fetches from all configured providers **in parallel**, merges into a single list sorted by date |
| **Single provider** | `GET /api/_reviews/google` | `useReviews({ provider: 'google' })` | Fetches from only the specified provider |

### Aggregated Mode (All Providers)

All configured providers are called **simultaneously** via `Promise.allSettled`. If one provider fails (e.g. expired API key), the others still return successfully — failed providers appear in the `errors` array.

```vue
<script setup>
const { reviews, aggregate, sources, pending, error } = useReviews()
// or explicitly:
const { reviews } = useReviews({ provider: 'all' })
</script>
```

```
GET /api/_reviews
GET /api/_reviews?limit=20&language=tr
```

<details>
<summary><strong>Example Response — Aggregated (All Providers)</strong></summary>

```json
{
  "reviews": [
    {
      "id": "trustpilot_67abc123",
      "provider": "trustpilot",
      "rating": 5,
      "text": "Harika bir otel deneyimiydi, personel cok ilgiliydi.",
      "title": "Mukemmel tatil",
      "author": {
        "name": "Ahmet Y.",
        "avatar": null,
        "url": null
      },
      "publishedAt": "2025-03-20T14:30:00Z",
      "language": "tr",
      "isVerified": true,
      "likes": 3,
      "businessResponse": {
        "text": "Degerli misafirimiz, guzel yorumunuz icin tesekkur ederiz!",
        "publishedAt": "2025-03-21T09:00:00Z"
      }
    },
    {
      "id": "google_places_reviews_0",
      "provider": "google",
      "rating": 4,
      "text": "Great location, clean rooms. Breakfast could be better.",
      "title": null,
      "author": {
        "name": "Sarah M.",
        "avatar": "https://lh3.googleusercontent.com/a/photo.jpg",
        "url": "https://www.google.com/maps/contrib/12345"
      },
      "publishedAt": "2025-03-18T10:15:00Z",
      "language": "en",
      "isVerified": false,
      "likes": null,
      "businessResponse": null
    },
    {
      "id": "serpapi_1711234567_0",
      "provider": "serpapi",
      "rating": 5,
      "text": "Manzara muhtesem, havuz alani cok guzeldi.",
      "title": null,
      "author": {
        "name": "Mehmet K.",
        "avatar": "https://lh3.googleusercontent.com/a/photo2.jpg",
        "url": "https://www.google.com/maps/contrib/67890",
        "reviewCount": 42
      },
      "publishedAt": "2025-03-15T08:20:00Z",
      "language": "tr",
      "likes": 7,
      "images": [
        "https://lh5.googleusercontent.com/p/review-photo.jpg"
      ],
      "businessResponse": {
        "text": "Tekrar bekleriz!",
        "publishedAt": "2025-03-16T11:00:00Z"
      }
    }
  ],
  "aggregate": {
    "average": 4.7,
    "total": 3,
    "distribution": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 1,
      "5": 2
    }
  },
  "sources": [
    { "provider": "trustpilot", "count": 1, "average": 5.0 },
    { "provider": "google", "count": 1, "average": 4.0 },
    { "provider": "serpapi", "count": 1, "average": 5.0 }
  ],
  "fetchedAt": "2025-03-22T12:00:00.000Z",
  "errors": null
}
```

</details>

### Single Provider Mode

```vue
<script setup>
const { reviews, aggregate, pending } = useReviews({ provider: 'trustpilot' })
</script>
```

```
GET /api/_reviews/trustpilot
GET /api/_reviews/google?language=en&limit=5
```

<details>
<summary><strong>Example Response — Single Provider (Trustpilot)</strong></summary>

```json
{
  "reviews": [
    {
      "id": "trustpilot_67abc123",
      "provider": "trustpilot",
      "rating": 5,
      "text": "Harika bir otel deneyimiydi, personel cok ilgiliydi.",
      "title": "Mukemmel tatil",
      "author": {
        "name": "Ahmet Y."
      },
      "publishedAt": "2025-03-20T14:30:00Z",
      "language": "tr",
      "isVerified": true,
      "likes": 3,
      "businessResponse": {
        "text": "Degerli misafirimiz, guzel yorumunuz icin tesekkur ederiz!",
        "publishedAt": "2025-03-21T09:00:00Z"
      }
    },
    {
      "id": "trustpilot_67abc456",
      "provider": "trustpilot",
      "rating": 4,
      "text": "Overall good experience but check-in was slow.",
      "title": "Good but room for improvement",
      "author": {
        "name": "John D."
      },
      "publishedAt": "2025-03-19T16:45:00Z",
      "language": "en",
      "isVerified": true,
      "likes": 1,
      "businessResponse": null
    }
  ],
  "aggregate": {
    "average": 4.5,
    "total": 2,
    "distribution": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 1,
      "5": 1
    }
  },
  "sources": [
    { "provider": "trustpilot", "count": 2, "average": 4.5 }
  ],
  "fetchedAt": "2025-03-22T12:00:00.000Z",
  "totalAvailable": 486,
  "nextPageToken": null
}
```

</details>

### Error Handling (Partial Failure)

When using aggregated mode, if one provider fails the others still return. Failed providers are listed in `errors`:

<details>
<summary><strong>Example Response — Partial Failure</strong></summary>

```json
{
  "reviews": [
    {
      "id": "trustpilot_67abc123",
      "provider": "trustpilot",
      "rating": 5,
      "text": "Amazing hotel!",
      "author": { "name": "Jane D." },
      "publishedAt": "2025-03-20T14:30:00Z"
    }
  ],
  "aggregate": {
    "average": 5.0,
    "total": 1,
    "distribution": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 1 }
  },
  "sources": [
    { "provider": "trustpilot", "count": 1, "average": 5.0 }
  ],
  "fetchedAt": "2025-03-22T12:00:00.000Z",
  "errors": [
    {
      "provider": "google",
      "error": "Request failed with status 403: API key expired"
    }
  ]
}
```

</details>

### Composable Options

```vue
<script setup>
// All providers, default options
const { reviews, aggregate, sources, pending, error, refresh } = useReviews()

// Single provider
const { reviews: googleOnly } = useReviews({ provider: 'google' })

// With filters
const { reviews: filtered } = useReviews({
  provider: 'trustpilot',
  limit: 10,
  language: 'tr',
  sort: 'createdat.desc',
})

// Lazy load (don't fetch immediately)
const { reviews: lazy, refresh: loadReviews } = useReviews({
  provider: 'all',
  immediate: false,
})
// Call loadReviews() when needed (e.g. button click, intersection observer)
</script>
```

### Direct API Access

```
GET /api/_reviews              → All providers (aggregated, parallel fetch)
GET /api/_reviews/google       → Google Places only
GET /api/_reviews/trustpilot   → Trustpilot only
GET /api/_reviews/serpapi      → SerpAPI only
GET /api/_reviews/outscraper   → Outscraper only

Query params:
  ?limit=20          → max reviews per provider
  &language=tr       → filter by language
  &sort=newest       → sort order (provider-specific)
  &pageToken=abc     → pagination (single provider only)
```

## Content Moderation

Review platforms do basic moderation before publishing, but mild profanity, passive-aggressive insults, and non-English abuse (especially Turkish, Russian) can still slip through. The module provides **server-side content moderation** that analyzes every review before it reaches your frontend.

### Supported Moderation Providers

| Provider | Languages | Free Tier | Best For |
|---|---|---|---|
| **Google Perspective API** | 40+ (TR, EN, DE, RU included) | Generous | Multi-language projects |
| **OpenAI Moderation API** | Multi-language | Free with API key | Projects already using OpenAI |

### Configuration

```ts
// nuxt.config.ts
reviews: {
  moderation: {
    enabled: true,
    provider: 'perspective',       // or 'openai'
    apiKey: process.env.PERSPECTIVE_API_KEY,
    toxicityThreshold: 0.7,        // 0.0 - 1.0 (default: 0.7)
    attributes: [                  // Perspective API only (all enabled by default)
      'TOXICITY',
      'SEVERE_TOXICITY',
      'INSULT',
      'PROFANITY',
      'THREAT',
      'IDENTITY_ATTACK',
    ],
    action: 'filter',              // 'filter' or 'flag' (default: 'filter')
  },
}
```

### Actions: Filter vs Flag

| Action | Behavior | Use Case |
|---|---|---|
| `filter` | Toxic reviews are **removed** from the response entirely | Public-facing websites — visitors never see abusive content |
| `flag` | All reviews are returned, toxic ones have `moderation` data attached | Admin dashboards — you decide what to show/hide |

### How It Works

1. Reviews are fetched from providers (Google, Trustpilot, etc.)
2. `minRating` filter is applied (if configured)
3. Each review text is sent to the moderation API for toxicity analysis
4. Based on `action`:
   - `filter`: Reviews with `toxicity >= threshold` are removed
   - `flag`: All reviews kept, flagged ones get `moderation` field attached
5. Aggregate ratings are computed from the **final** filtered list

### Example: Flagged Review (action: 'flag')

When using `action: 'flag'`, toxic reviews include moderation scores:

```json
{
  "id": "trustpilot_99xyz",
  "provider": "trustpilot",
  "rating": 1,
  "text": "Worst hotel ever, staff was incredibly rude and [offensive content]...",
  "author": { "name": "Angry Guest" },
  "publishedAt": "2025-03-19T08:00:00Z",
  "moderation": {
    "flagged": true,
    "scores": {
      "toxicity": 0.89,
      "severeToxicity": 0.45,
      "insult": 0.92,
      "profanity": 0.87,
      "threat": 0.12,
      "identityAttack": 0.05
    },
    "provider": "perspective"
  }
}
```

### Example: Clean Review (action: 'flag')

Non-toxic reviews also get scores (useful for analytics):

```json
{
  "id": "google_places_reviews_0",
  "provider": "google",
  "rating": 4,
  "text": "Great location, clean rooms. Breakfast could be better.",
  "author": { "name": "Sarah M." },
  "publishedAt": "2025-03-18T10:15:00Z",
  "moderation": {
    "flagged": false,
    "scores": {
      "toxicity": 0.08,
      "severeToxicity": 0.01,
      "insult": 0.05,
      "profanity": 0.02,
      "threat": 0.00,
      "identityAttack": 0.00
    },
    "provider": "perspective"
  }
}
```

### Threshold Guide

| Threshold | Sensitivity | Filters |
|---|---|---|
| `0.5` | High — aggressive filtering | Mild negativity, sarcasm, borderline content |
| `0.7` | **Recommended** — balanced | Clear insults, profanity, harassment |
| `0.9` | Low — only extreme cases | Severe hate speech, explicit threats |

### Environment Variables

```env
# Google Perspective API (recommended)
NUXT_REVIEWS_MODERATION_API_KEY=your_perspective_api_key

# Or OpenAI
NUXT_REVIEWS_MODERATION_API_KEY=your_openai_api_key
```

### Getting a Perspective API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Perspective Comment Analyzer API**
3. Create an API key
4. No billing required for moderate usage

## Providers

| Provider | Free | Pagination | Notes |
|---|---|---|---|
| **Google Places** | $200/mo credit | No (5 max) | Official API, limited reviews |
| **Trustpilot** | Yes | Yes | Best free option with full pagination |
| **SerpAPI** | No (~$50/mo) | Yes | Google reviews without the 5-review limit |
| **Outscraper** | Free tier | Yes | Pay-per-use, good for bulk |

## Environment Variables

API keys are injected via runtime config and support `NUXT_` prefix override:

```env
NUXT_REVIEWS_PROVIDERS_GOOGLE_API_KEY=...
NUXT_REVIEWS_PROVIDERS_TRUSTPILOT_API_KEY=...
```

## Contribution

<details>
  <summary>Local development</summary>

  ```bash
  # Install dependencies
  pnpm install

  # Generate type stubs
  pnpm run dev:prepare

  # Develop with the playground
  pnpm run dev

  # Build the playground
  pnpm run dev:build

  # Run ESLint
  pnpm run lint

  # Run Vitest
  pnpm run test
  pnpm run test:watch

  # Release new version
  pnpm run release
  ```

</details>

## License

[MIT](./LICENSE) - [Eralp Ozcan](https://github.com/eralpozcan)


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-reviews/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-reviews

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-reviews.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-reviews

[license-src]: https://img.shields.io/npm/l/nuxt-reviews.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-reviews

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
