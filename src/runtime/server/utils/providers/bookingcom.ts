import { $fetch } from 'ofetch'
import type {
  ReviewProviderAdapter,
  FetchReviewsOptions,
  ProviderResult,
  NormalizedReview,
  BookingcomProviderConfig,
} from '../../../types'

const BASE_URL = 'https://supply-xml.booking.com/review-api'

interface BookingcomContent {
  language_code: string
  headline?: string
  positive?: string
  negative?: string
}

interface BookingcomScoring {
  review_score: number
  clean?: number
  facilities?: number
  location?: number
  services?: number
  staff?: number
  value?: number
  comfort?: number
}

interface BookingcomResponse {
  text?: string
  last_change_timestamp?: string
}

interface BookingcomReview {
  review_id: string
  created_timestamp: string
  last_change_timestamp?: string
  content: BookingcomContent
  scoring: BookingcomScoring
  reviewer: { name?: string; country?: string } | null
  response?: BookingcomResponse | null
  reservation_id?: number
}

interface BookingcomReviewsResponse {
  data: BookingcomReview[] | BookingcomReview
  meta: { ruid: string }
  errors: unknown[]
  warnings: unknown[]
  next_page?: string
}

function buildAuthHeader(username: string, password: string): string {
  const encoded = btoa(`${username}:${password}`)
  return `Basic ${encoded}`
}

function buildReviewText(content: BookingcomContent): string {
  const parts: string[] = []
  if (content.positive) parts.push(content.positive)
  if (content.negative) parts.push(content.negative)
  return parts.join('\n\n')
}

function normalizeScore(score: number): number {
  // Booking.com uses 1-10 scale, normalize to 1-5
  return Math.round((score / 2) * 10) / 10
}

function normalizeBookingcomReview(review: BookingcomReview): NormalizedReview {
  return {
    id: `bookingcom_${review.review_id}`,
    provider: 'bookingcom',
    rating: normalizeScore(review.scoring.review_score),
    text: buildReviewText(review.content),
    title: review.content.headline || undefined,
    author: {
      name: review.reviewer?.name || 'Anonymous Guest',
    },
    publishedAt: new Date(review.created_timestamp).toISOString(),
    language: review.content.language_code,
    isVerified: true, // Booking.com reviews are always from verified guests
    businessResponse: review.response?.text
      ? {
          text: review.response.text,
          publishedAt: review.response.last_change_timestamp
            ? new Date(review.response.last_change_timestamp).toISOString()
            : new Date(review.created_timestamp).toISOString(),
        }
      : undefined,
    raw: review as unknown as Record<string, unknown>,
  }
}

export const bookingcomProvider: ReviewProviderAdapter = {
  name: 'bookingcom',

  async fetchReviews(
    config: Record<string, unknown>,
    options?: FetchReviewsOptions,
  ): Promise<ProviderResult> {
    const { username, password, propertyId } = config as unknown as BookingcomProviderConfig

    if (!username || !password || !propertyId) {
      throw new Error('[nuxt-reviews] Booking.com provider requires username, password, and propertyId')
    }

    console.warn('[nuxt-reviews] Booking.com provider is currently in BETA. If you encounter any issues, please report them at https://github.com/eralpozcan/nuxt-reviews/issues')

    const limit = options?.limit || 20
    const authHeader = buildAuthHeader(username, password)
    const allReviews: NormalizedReview[] = []

    let url: string | null = `${BASE_URL}/properties/${propertyId}/reviews`
    const query: Record<string, string | number> = {
      limit: Math.min(limit, 100),
    }

    if (options?.sort) {
      query.sort = options.sort
    }

    while (url && allReviews.length < limit) {
      const response = await $fetch<BookingcomReviewsResponse>(url, {
        headers: {
          Authorization: authHeader,
        },
        query: url.includes('?') ? undefined : query,
      })

      if (response.errors?.length) {
        throw new Error(`[nuxt-reviews] Booking.com API error: ${JSON.stringify(response.errors)}`)
      }

      const reviews = Array.isArray(response.data) ? response.data : [response.data]
      const normalized = reviews.map(normalizeBookingcomReview)
      allReviews.push(...normalized)

      url = response.next_page || null
    }

    return {
      reviews: allReviews.slice(0, limit),
    }
  },
}
