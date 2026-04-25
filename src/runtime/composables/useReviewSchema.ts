import { computed } from 'vue'
import { useHead } from '#imports'
import type { Ref, ComputedRef } from 'vue'
import type { NormalizedReview, AggregateRating } from '../types'

export interface ReviewSchemaItem {
  /** Business/entity name (required for Schema.org) */
  name: string
  /** Business description */
  description?: string
  /** Canonical URL of the page */
  url?: string
  /** Image URL */
  image?: string
  /** Schema.org @type — defaults to 'LocalBusiness' */
  type?: string
}

export function useReviewSchema(
  reviews: Ref<NormalizedReview[]> | ComputedRef<NormalizedReview[]>,
  aggregate: Ref<AggregateRating | null> | ComputedRef<AggregateRating | null>,
  item: ReviewSchemaItem,
) {
  const schema = computed(() => {
    const agg = aggregate.value
    const revs = reviews.value

    if (!agg || !revs.length) return null

    const jsonLd: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': item.type || 'LocalBusiness',
      'name': item.name,
    }

    if (item.description) jsonLd.description = item.description
    if (item.url) jsonLd.url = item.url
    if (item.image) jsonLd.image = item.image

    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': agg.average.toFixed(1),
      'reviewCount': agg.total,
      'bestRating': 5,
      'worstRating': 1,
    }

    jsonLd.review = revs.slice(0, 20).map(r => ({
      '@type': 'Review',
      ...(r.title ? { name: r.title } : {}),
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': r.rating,
        'bestRating': 5,
        'worstRating': 1,
      },
      'author': {
        '@type': 'Person',
        'name': r.author.name,
      },
      'datePublished': r.publishedAt.split('T')[0],
      'reviewBody': r.text,
    }))

    return jsonLd
  })

  useHead({
    script: computed(() =>
      schema.value
        ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(schema.value) }]
        : [],
    ),
  })

  return { schema }
}
