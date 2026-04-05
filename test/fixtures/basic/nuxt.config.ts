import NuxtReviews from '../../../src/module'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: [
    NuxtReviews,
  ],
  reviews: {
    providers: {
      google: {
        apiKey: 'test-google-key',
        placeId: 'ChIJtest123',
      },
      trustpilot: {
        apiKey: 'test-trustpilot-key',
        businessUnitId: 'test-unit-id',
      },
    },
    cache: false,
    maxReviews: 10,
    minRating: undefined,
  },
})
