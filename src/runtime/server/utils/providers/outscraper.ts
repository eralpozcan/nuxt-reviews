import { $fetch } from 'ofetch'
import type {
  ReviewProviderAdapter,
  FetchReviewsOptions,
  ProviderResult,
  NormalizedReview,
  OutscraperProviderConfig,
} from '../../../types'

interface OutscraperReview {
  author_title: string
  author_id?: string
  author_image?: string
  author_link?: string
  author_reviews_count?: number
  review_text: string
  review_rating: number
  review_datetime_utc: string
  review_timestamp?: number
  review_likes?: number
  review_img_url?: string
  review_link?: string
  owner_answer?: string
  owner_answer_timestamp?: number
  owner_answer_timestamp_datetime_utc?: string
}

interface OutscraperResponse {
  id: string
  status: string
  data: Array<Array<OutscraperReview>>
}

function normalizeOutscraperReview(review: OutscraperReview, index: number): NormalizedReview {
  return {
    id: `outscraper_${review.author_id || index}_${review.review_timestamp || Date.now()}`,
    provider: 'outscraper',
    rating: review.review_rating,
    text: review.review_text || '',
    author: {
      name: review.author_title,
      avatar: review.author_image,
      url: review.author_link,
      reviewCount: review.author_reviews_count,
    },
    publishedAt: review.review_datetime_utc,
    likes: review.review_likes,
    images: review.review_img_url ? [review.review_img_url] : undefined,
    sourceUrl: review.review_link,
    businessResponse: review.owner_answer
      ? {
          text: review.owner_answer,
          publishedAt: review.owner_answer_timestamp_datetime_utc || '',
        }
      : undefined,
    raw: review as unknown as Record<string, unknown>,
  }
}

export const outscraperProvider: ReviewProviderAdapter = {
  name: 'outscraper',

  async fetchReviews(
    config: Record<string, unknown>,
    options?: FetchReviewsOptions,
  ): Promise<ProviderResult> {
    const { apiKey, placeId, limit: configLimit, sort } = config as unknown as OutscraperProviderConfig

    if (!apiKey || !placeId) {
      throw new Error('[nuxt-reviews] Outscraper provider requires apiKey and placeId')
    }

    const limit = options?.limit || configLimit || 100

    const response = await $fetch<OutscraperResponse>(
      'https://api.app.outscraper.com/maps/reviews-v3',
      {
        headers: {
          'X-API-KEY': apiKey,
        },
        query: {
          query: placeId,
          reviewsLimit: limit,
          language: options?.language || 'en',
          sort: sort || 'newest',
        },
      },
    )

    const rawReviews = response.data?.[0] || []
    const reviews = rawReviews.map(normalizeOutscraperReview)

    return {
      reviews,
      totalAvailable: rawReviews.length,
    }
  },
}
