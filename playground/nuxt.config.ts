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
      trustpilot: {
        apiKey: process.env.TRUSTPILOT_API_KEY || '',
        businessUnitId: process.env.TRUSTPILOT_BUSINESS_UNIT_ID || '',
      },
    },
  },

  devtools: { enabled: true },
})
