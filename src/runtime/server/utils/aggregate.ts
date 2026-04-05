import type { NormalizedReview, AggregateRating, RatingDistribution, ReviewCollection } from '../../types'

export function computeAggregate(reviews: NormalizedReview[]): AggregateRating {
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0

  for (const review of reviews) {
    const rounded = Math.round(Math.min(5, Math.max(1, review.rating))) as 1 | 2 | 3 | 4 | 5
    distribution[rounded]++
    sum += review.rating
  }

  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    total: reviews.length,
    distribution,
  }
}

export function buildCollection(reviews: NormalizedReview[]): ReviewCollection {
  const providerMap = new Map<string, NormalizedReview[]>()

  for (const review of reviews) {
    const arr = providerMap.get(review.provider) || []
    arr.push(review)
    providerMap.set(review.provider, arr)
  }

  const sources = Array.from(providerMap.entries()).map(([provider, providerReviews]) => ({
    provider: provider as NormalizedReview['provider'],
    count: providerReviews.length,
    average: Math.round(
      (providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length) * 10,
    ) / 10,
  }))

  return {
    reviews,
    aggregate: computeAggregate(reviews),
    sources,
    fetchedAt: new Date().toISOString(),
  }
}
