import { defineEventHandler, getQuery, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getProvider } from '../../utils/providers'
import { buildCollection } from '../../utils/aggregate'
import { moderateReviews } from '../../utils/moderation'
import type { FetchReviewsOptions, NormalizedReview, ReviewProvider } from '../../../types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const reviewsConfig = config.reviews
  const configuredProviders = Object.keys(reviewsConfig.providers) as ReviewProvider[]

  if (configuredProviders.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No review providers configured. Add providers in nuxt.config reviews.providers',
    })
  }

  const query = getQuery(event)
  const minRating = Number(query.minRating) || reviewsConfig.minRating || undefined
  const options: FetchReviewsOptions = {
    limit: Number(query.limit) || reviewsConfig.maxReviews || 50,
    language: (query.language as string) || undefined,
    sort: (query.sort as string) || undefined,
    minRating,
  }

  const allReviews: NormalizedReview[] = []
  const errors: Array<{ provider: string; error: string }> = []

  // Fetch from all configured providers in parallel
  const results = await Promise.allSettled(
    configuredProviders.map(async (providerName) => {
      const providerConfig = reviewsConfig.providers[providerName]
      if (!providerConfig) return { reviews: [] }

      const provider = getProvider(providerName)
      return provider.fetchReviews(
        providerConfig as unknown as Record<string, unknown>,
        options,
      )
    }),
  )

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result.status === 'fulfilled') {
      allReviews.push(...result.value.reviews)
    }
    else {
      errors.push({
        provider: configuredProviders[i],
        error: result.reason?.message || 'Unknown error',
      })
    }
  }

  // Filter by minimum rating
  let filtered = minRating
    ? allReviews.filter(r => r.rating >= minRating)
    : allReviews

  // Content moderation
  if (reviewsConfig.moderation?.enabled) {
    filtered = await moderateReviews(filtered, reviewsConfig.moderation)
  }

  // Sort all reviews by date (newest first)
  filtered.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  return {
    ...buildCollection(filtered),
    errors: errors.length > 0 ? errors : undefined,
  }
})
