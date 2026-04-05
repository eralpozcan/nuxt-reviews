import { describe, it, expect } from 'vitest'
import { computeAggregate, buildCollection } from '../src/runtime/server/utils/aggregate'
import type { NormalizedReview } from '../src/runtime/types'

function createReview(overrides: Partial<NormalizedReview> = {}): NormalizedReview {
  return {
    id: `test_${Math.random()}`,
    provider: 'google',
    rating: 5,
    text: 'Great hotel!',
    author: { name: 'Test User' },
    publishedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('computeAggregate', () => {
  it('returns zero values for empty array', () => {
    const result = computeAggregate([])

    expect(result.average).toBe(0)
    expect(result.total).toBe(0)
    expect(result.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  })

  it('computes correct average for single review', () => {
    const reviews = [createReview({ rating: 4 })]
    const result = computeAggregate(reviews)

    expect(result.average).toBe(4)
    expect(result.total).toBe(1)
    expect(result.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 })
  })

  it('computes correct average for multiple reviews', () => {
    const reviews = [
      createReview({ rating: 5 }),
      createReview({ rating: 4 }),
      createReview({ rating: 3 }),
      createReview({ rating: 5 }),
      createReview({ rating: 1 }),
    ]
    const result = computeAggregate(reviews)

    expect(result.average).toBe(3.6)
    expect(result.total).toBe(5)
    expect(result.distribution).toEqual({ 1: 1, 2: 0, 3: 1, 4: 1, 5: 2 })
  })

  it('rounds average to one decimal place', () => {
    const reviews = [
      createReview({ rating: 5 }),
      createReview({ rating: 5 }),
      createReview({ rating: 4 }),
    ]
    const result = computeAggregate(reviews)

    expect(result.average).toBe(4.7)
  })

  it('clamps ratings to 1-5 range in distribution', () => {
    const reviews = [
      createReview({ rating: 0.5 }),
      createReview({ rating: 5.5 }),
    ]
    const result = computeAggregate(reviews)

    expect(result.distribution[1]).toBe(1)
    expect(result.distribution[5]).toBe(1) // 5.5 rounds to 6, clamped to 5
    expect(result.total).toBe(2)
  })
})

describe('buildCollection', () => {
  it('returns empty collection for empty array', () => {
    const result = buildCollection([])

    expect(result.reviews).toEqual([])
    expect(result.aggregate.total).toBe(0)
    expect(result.sources).toEqual([])
    expect(result.fetchedAt).toBeTruthy()
  })

  it('groups sources by provider', () => {
    const reviews = [
      createReview({ provider: 'google', rating: 5 }),
      createReview({ provider: 'google', rating: 4 }),
      createReview({ provider: 'trustpilot', rating: 3 }),
    ]
    const result = buildCollection(reviews)

    expect(result.sources).toHaveLength(2)

    const googleSource = result.sources.find(s => s.provider === 'google')
    expect(googleSource?.count).toBe(2)
    expect(googleSource?.average).toBe(4.5)

    const trustpilotSource = result.sources.find(s => s.provider === 'trustpilot')
    expect(trustpilotSource?.count).toBe(1)
    expect(trustpilotSource?.average).toBe(3)
  })

  it('computes aggregate across all providers', () => {
    const reviews = [
      createReview({ provider: 'google', rating: 5 }),
      createReview({ provider: 'trustpilot', rating: 3 }),
    ]
    const result = buildCollection(reviews)

    expect(result.aggregate.average).toBe(4)
    expect(result.aggregate.total).toBe(2)
  })

  it('includes fetchedAt as ISO string', () => {
    const before = new Date().toISOString()
    const result = buildCollection([createReview()])
    const after = new Date().toISOString()

    expect(result.fetchedAt >= before).toBe(true)
    expect(result.fetchedAt <= after).toBe(true)
  })
})
