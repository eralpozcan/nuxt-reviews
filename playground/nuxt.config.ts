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
    '@nuxtjs/mcp-toolkit',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-security'
  ],

  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        // ponytail: inline needed for Nuxt hydration payload; move to nonce-based CSP if strict mode wanted
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'", 'https://api.iconify.design'],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"]
      },
      xFrameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin'
    }
  },

  site: {
    url: 'https://nuxt-reviews.netlify.app'
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  sitemap: {
    urls: [
      '/getting-started',
      '/getting-started/installation',
      '/getting-started/usage',
      '/guide/providers',
      '/guide/composables',
      '/guide/moderation',
      '/guide/components',
      '/api/types'
    ]
  },

  robots: {},

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    },
    experimental: {
      sqliteConnector: 'native'
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
    domain: 'https://nuxt-reviews.netlify.app',
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
      mock: {},
      google: {
        apiKey: process.env.GOOGLE_API_KEY || '',
        placeId: process.env.GOOGLE_PLACE_ID || ''
      }
    }
  }
})
