import { $fetch } from 'ofetch'
import type {
  ReviewProviderAdapter,
  FetchReviewsOptions,
  ProviderResult,
  NormalizedReview,
  TrustpilotProviderConfig,
} from '../../../types'

interface TrustpilotConsumer {
  displayName: string
  displayLocation?: string
}

interface TrustpilotCompanyReply {
  text: string
  createdAt: string
}

interface TrustpilotReview {
  id: string
  stars: number
  title: string
  text: string
  language: string
  createdAt: string
  isVerified: boolean
  consumer: TrustpilotConsumer
  companyReply?: TrustpilotCompanyReply
  numberOfLikes: number
}

interface TrustpilotResponse {
  reviews: TrustpilotReview[]
  links: Array<{ rel: string, href: string }>
}

function normalizeTrustpilotReview(review: TrustpilotReview): NormalizedReview {
  return {
    id: `trustpilot_${review.id}`,
    provider: 'trustpilot',
    rating: review.stars,
    text: review.text,
    title: review.title,
    author: {
      name: review.consumer.displayName,
    },
    publishedAt: review.createdAt,
    language: review.language,
    isVerified: review.isVerified,
    likes: review.numberOfLikes,
    businessResponse: review.companyReply
      ? {
          text: review.companyReply.text,
          publishedAt: review.companyReply.createdAt,
        }
      : undefined,
    raw: review as unknown as Record<string, unknown>,
  }
}

export const trustpilotProvider: ReviewProviderAdapter = {
  name: 'trustpilot',

  async fetchReviews(
    config: Record<string, unknown>,
    options?: FetchReviewsOptions,
  ): Promise<ProviderResult> {
    const { apiKey, businessUnitId } = config as unknown as TrustpilotProviderConfig

    if (!apiKey || !businessUnitId) {
      throw new Error('[nuxt-reviews] Trustpilot provider requires apiKey and businessUnitId')
    }

    const limit = options?.limit || 20
    const allReviews: NormalizedReview[] = []
    let page = 1
    let hasMore = true

    while (hasMore && allReviews.length < limit) {
      const perPage = Math.min(20, limit - allReviews.length)

      const response = await $fetch<TrustpilotResponse>(
        `https://api.trustpilot.com/v1/business-units/${businessUnitId}/reviews`,
        {
          headers: {
            apikey: apiKey,
          },
          query: {
            perPage,
            page,
            language: options?.language,
            orderBy: options?.sort || 'createdat.desc',
          },
        },
      )

      const normalized = response.reviews.map(normalizeTrustpilotReview)
      allReviews.push(...normalized)

      const nextLink = response.links?.find(l => l.rel === 'next-page')
      hasMore = !!nextLink && normalized.length === perPage
      page++
    }

    return {
      reviews: allReviews,
    }
  },
}
