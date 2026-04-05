import { $fetch } from 'ofetch'
import type {
  ReviewProviderAdapter,
  FetchReviewsOptions,
  ProviderResult,
  NormalizedReview,
  GoogleProviderConfig,
} from '../../../types'

interface GoogleReviewAuthor {
  displayName: string
  uri?: string
  photoUri?: string
}

interface GoogleReview {
  name: string
  rating: number
  text?: { text: string; languageCode: string }
  originalText?: { text: string; languageCode: string }
  authorAttribution: GoogleReviewAuthor
  publishTime: string
  relativePublishTimeDescription: string
}

interface GooglePlaceResponse {
  reviews?: GoogleReview[]
  rating?: number
  userRatingCount?: number
}

function normalizeGoogleReview(review: GoogleReview): NormalizedReview {
  return {
    id: `google_${review.name.replace(/\//g, '_')}`,
    provider: 'google',
    rating: review.rating,
    text: review.originalText?.text || review.text?.text || '',
    author: {
      name: review.authorAttribution.displayName,
      avatar: review.authorAttribution.photoUri,
      url: review.authorAttribution.uri,
    },
    publishedAt: review.publishTime,
    language: review.originalText?.languageCode || review.text?.languageCode,
    raw: review as unknown as Record<string, unknown>,
  }
}

export const googleProvider: ReviewProviderAdapter = {
  name: 'google',

  async fetchReviews(
    config: Record<string, unknown>,
    options?: FetchReviewsOptions,
  ): Promise<ProviderResult> {
    const { apiKey, placeId } = config as unknown as GoogleProviderConfig

    if (!apiKey || !placeId) {
      throw new Error('[nuxt-reviews] Google provider requires apiKey and placeId')
    }

    const fieldMask = 'reviews,rating,userRatingCount'

    const response = await $fetch<GooglePlaceResponse>(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        query: {
          languageCode: options?.language,
        },
      },
    )

    const reviews = (response.reviews || []).map(normalizeGoogleReview)

    return {
      reviews,
      totalAvailable: response.userRatingCount,
    }
  },
}
