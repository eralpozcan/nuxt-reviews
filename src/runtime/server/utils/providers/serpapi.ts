import { $fetch } from 'ofetch'
import type {
  ReviewProviderAdapter,
  FetchReviewsOptions,
  ProviderResult,
  NormalizedReview,
  SerpApiProviderConfig,
} from '../../../types'

interface SerpApiReview {
  user: {
    name: string
    link?: string
    thumbnail?: string
    reviews?: number
  }
  rating: number
  date: string
  snippet: string
  likes?: number
  images?: Array<{ thumbnail: string }>
  response?: {
    snippet: string
    date: string
  }
}

interface SerpApiResponse {
  place_info?: {
    title: string
    rating: number
    reviews: number
  }
  reviews: SerpApiReview[]
  serpapi_pagination?: {
    next_page_token?: string
    next?: string
  }
}

function normalizeSerpApiReview(review: SerpApiReview, index: number): NormalizedReview {
  return {
    id: `serpapi_${Date.now()}_${index}`,
    provider: 'serpapi',
    rating: review.rating,
    text: review.snippet,
    author: {
      name: review.user.name,
      avatar: review.user.thumbnail,
      url: review.user.link,
      reviewCount: review.user.reviews,
    },
    publishedAt: review.date,
    likes: review.likes,
    images: review.images?.map(img => img.thumbnail),
    businessResponse: review.response
      ? {
          text: review.response.snippet,
          publishedAt: review.response.date,
        }
      : undefined,
    raw: review as unknown as Record<string, unknown>,
  }
}

export const serpapiProvider: ReviewProviderAdapter = {
  name: 'serpapi',

  async fetchReviews(
    config: Record<string, unknown>,
    options?: FetchReviewsOptions,
  ): Promise<ProviderResult> {
    const { apiKey, placeId, sort } = config as unknown as SerpApiProviderConfig

    if (!apiKey || !placeId) {
      throw new Error('[nuxt-reviews] SerpAPI provider requires apiKey and placeId')
    }

    const limit = options?.limit || 50
    const allReviews: NormalizedReview[] = []
    let nextPageToken = options?.pageToken

    do {
      const query: Record<string, string | undefined> = {
        engine: 'google_maps_reviews',
        place_id: placeId,
        api_key: apiKey,
        hl: options?.language,
        sort_by: sort || 'qualityScore',
      }

      if (nextPageToken) {
        query.next_page_token = nextPageToken
      }

      const response = await $fetch<SerpApiResponse>(
        'https://serpapi.com/search.json',
        { query },
      )

      const normalized = response.reviews.map(normalizeSerpApiReview)
      allReviews.push(...normalized)

      nextPageToken = response.serpapi_pagination?.next_page_token

      if (!nextPageToken || allReviews.length >= limit) break
    // eslint-disable-next-line no-constant-condition
    } while (true)

    return {
      reviews: allReviews.slice(0, limit),
      nextPageToken,
    }
  },
}
