import { defineEventHandler, getQuery, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getProvider } from '../../utils/providers'
import { buildCollection } from '../../utils/aggregate'
import { moderateReviews } from '../../utils/moderation'
import type { FetchReviewsOptions, ReviewProvider } from '../../../types'

export default defineEventHandler(async (event) => {
  const providerName = event.context.params?.provider as string

  if (!providerName) {
    throw createError({ statusCode: 400, message: 'Provider name is required' })
  }

  const config = useRuntimeConfig()
  const reviewsConfig = config.reviews
  const providerConfig = reviewsConfig.providers[providerName as ReviewProvider]

  if (!providerConfig) {
    throw createError({
      statusCode: 404,
      message: `Provider "${providerName}" is not configured. Configure it in nuxt.config reviews.providers.${providerName}`,
    })
  }

  const query = getQuery(event)
  const minRating = Number(query.minRating) || reviewsConfig.minRating || undefined
  const options: FetchReviewsOptions = {
    limit: Number(query.limit) || reviewsConfig.maxReviews || 50,
    language: (query.language as string) || undefined,
    sort: (query.sort as string) || undefined,
    pageToken: (query.pageToken as string) || undefined,
    minRating,
  }

  try {
    const provider = getProvider(providerName)
    const result = await provider.fetchReviews(
      providerConfig as unknown as Record<string, unknown>,
      options,
    )

    let filtered = minRating
      ? result.reviews.filter(r => r.rating >= minRating)
      : result.reviews

    // Content moderation
    if (reviewsConfig.moderation?.enabled) {
      filtered = await moderateReviews(filtered, reviewsConfig.moderation)
    }

    return {
      ...buildCollection(filtered),
      totalAvailable: result.totalAvailable,
      nextPageToken: result.nextPageToken,
    }
  }
  catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw createError({
      statusCode: 502,
      message: `Failed to fetch reviews from ${providerName}: ${message}`,
    })
  }
})
