// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/mcp-toolkit'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    }
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: [],
      crawlLinks: false
    }
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vueuse/core'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    provider: 'iconify'
  },

  llms: {
    domain: 'https://nuxt-reviews.dev/',
    title: 'nuxt-reviews',
    description: 'Nuxt module for fetching and aggregating reviews from multiple platforms.',
    full: {
      title: 'nuxt-reviews - Full Documentation',
      description: 'Complete documentation for nuxt-reviews module.'
    },
    sections: [
      {
        title: 'Getting Started',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/getting-started%' }
        ]
      },
      {
        title: 'Guide',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/guide%' }
        ]
      },
      {
        title: 'API',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/api%' }
        ]
      }
    ]
  },

  mcp: {
    name: 'nuxt-reviews'
  },

  reviews: {
    cache: true,
    cacheTTL: 3600,
    maxReviews: 50,
    providers: {
      google: {
        apiKey: process.env.GOOGLE_API_KEY || '',
        placeId: process.env.GOOGLE_PLACE_ID || ''
      }
    }
  }
})
