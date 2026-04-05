export default defineNuxtConfig({
  modules: ['../src/module'],

  reviews: {
    cache: true,
    cacheTTL: 3600,
    maxReviews: 50,
    providers: {
      google: {
        apiKey: process.env.GOOGLE_API_KEY || '',
        placeId: process.env.GOOGLE_PLACE_ID || '',
      },
    },
  },

  devtools: { enabled: true },
})
