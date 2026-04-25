import type { ref } from 'vue'
import { computed } from 'vue'
import { useFetch, useRuntimeConfig } from '#imports'
import type { ReviewCollection, ReviewProvider, NormalizedReview, AggregateRating } from '../types'

export interface UseReviewsOptions {
  /** Fetch from a specific provider, or 'all' for all configured providers */
  provider?: ReviewProvider | 'all'
  /** Maximum number of reviews to fetch */
  limit?: number
  /** Language filter */
  language?: string
  /** Sort order */
  sort?: string
  /** Minimum rating filter (1-5). Only reviews with this rating or above are returned. */
  minRating?: number
  /** Pagination token (single-provider mode only) */
  pageToken?: string
  /** Enable/disable immediate fetch (default: true) */
  immediate?: boolean
}

export interface UseReviewsReturn {
  /** All fetched reviews */
  reviews: ReturnType<typeof computed<NormalizedReview[]>>
  /** Aggregate rating data */
  aggregate: ReturnType<typeof computed<AggregateRating | null>>
  /** Source breakdown */
  sources: ReturnType<typeof computed<ReviewCollection['sources']>>
  /** Token for fetching the next page (single-provider mode only) */
  nextPageToken: ReturnType<typeof computed<string | undefined>>
  /** Total reviews available on the platform (single-provider mode only) */
  totalAvailable: ReturnType<typeof computed<number | undefined>>
  /** Loading state */
  pending: ReturnType<typeof ref<boolean>>
  /** Error state */
  error: ReturnType<typeof ref<Error | null>>
  /** Re-fetch reviews */
  refresh: () => Promise<void>
}

export function useReviews(options: UseReviewsOptions = {}): UseReviewsReturn {
  const config = useRuntimeConfig()
  const apiPrefix = config.public.reviews?.apiPrefix || '/api/_reviews'

  const provider = options.provider || 'all'
  const path = provider === 'all' ? apiPrefix : `${apiPrefix}/${provider}`

  const query: Record<string, string | number> = {}
  if (options.limit) query.limit = options.limit
  if (options.language) query.language = options.language
  if (options.sort) query.sort = options.sort
  if (options.minRating) query.minRating = options.minRating
  if (options.pageToken) query.pageToken = options.pageToken

  const { data, pending, error, refresh: _refresh } = useFetch<ReviewCollection>(path, {
    query,
    immediate: options.immediate !== false,
    default: () => ({
      reviews: [],
      aggregate: { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      sources: [],
      fetchedAt: new Date().toISOString(),
    }),
  })

  const reviews = computed(() => data.value?.reviews || [])
  const aggregate = computed(() => data.value?.aggregate || null)
  const sources = computed(() => data.value?.sources || [])
  const nextPageToken = computed(() => data.value?.nextPageToken)
  const totalAvailable = computed(() => data.value?.totalAvailable)

  const refresh = async () => {
    await _refresh()
  }

  return {
    reviews,
    aggregate,
    sources,
    nextPageToken,
    totalAvailable,
    pending,
    error,
    refresh,
  }
}
