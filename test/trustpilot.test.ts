import { describe, it, expect, vi } from 'vitest'

import { $fetch } from 'ofetch'
import { getProvider } from '../src/runtime/server/utils/providers'

vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

const mockedFetch = vi.mocked($fetch)

describe('trustpilot provider', () => {
  const provider = getProvider('trustpilot')

  it('throws when apiKey is missing', async () => {
    await expect(
      provider.fetchReviews({ businessUnitId: 'test-id' }),
    ).rejects.toThrow('apiKey and businessUnitId')
  })

  it('throws when businessUnitId is missing', async () => {
    await expect(
      provider.fetchReviews({ apiKey: 'test-key' }),
    ).rejects.toThrow('apiKey and businessUnitId')
  })

  it('fetches and normalizes trustpilot reviews', async () => {
    mockedFetch.mockResolvedValueOnce({
      reviews: [
        {
          id: 'tp-review-1',
          stars: 5,
          title: 'Excellent stay',
          text: 'Everything was perfect!',
          language: 'en',
          createdAt: '2025-03-20T14:30:00Z',
          isVerified: true,
          consumer: { displayName: 'Alice Johnson' },
          companyReply: {
            text: 'Thank you!',
            createdAt: '2025-03-21T09:00:00Z',
          },
          numberOfLikes: 5,
        },
        {
          id: 'tp-review-2',
          stars: 2,
          title: 'Disappointing',
          text: 'Room was dirty.',
          language: 'tr',
          createdAt: '2025-03-19T10:00:00Z',
          isVerified: false,
          consumer: { displayName: 'Bob' },
          companyReply: null,
          numberOfLikes: 0,
        },
      ],
      links: [],
    })

    const result = await provider.fetchReviews(
      { apiKey: 'test-key', businessUnitId: 'test-unit' },
      { limit: 20 },
    )

    expect(result.reviews).toHaveLength(2)

    const first = result.reviews[0]
    expect(first.id).toBe('trustpilot_tp-review-1')
    expect(first.provider).toBe('trustpilot')
    expect(first.rating).toBe(5)
    expect(first.title).toBe('Excellent stay')
    expect(first.text).toBe('Everything was perfect!')
    expect(first.author.name).toBe('Alice Johnson')
    expect(first.isVerified).toBe(true)
    expect(first.likes).toBe(5)
    expect(first.businessResponse).toEqual({
      text: 'Thank you!',
      publishedAt: '2025-03-21T09:00:00Z',
    })

    const second = result.reviews[1]
    expect(second.rating).toBe(2)
    expect(second.language).toBe('tr')
    expect(second.businessResponse).toBeUndefined()
  })

  it('handles pagination with next-page link', async () => {
    mockedFetch
      .mockResolvedValueOnce({
        reviews: [
          {
            id: 'page1',
            stars: 4,
            title: 'Good',
            text: 'Nice place',
            language: 'en',
            createdAt: '2025-03-20T00:00:00Z',
            isVerified: true,
            consumer: { displayName: 'User 1' },
            numberOfLikes: 0,
          },
        ],
        links: [{ rel: 'next-page', href: 'https://api.trustpilot.com/v1/...' }],
      })
      .mockResolvedValueOnce({
        reviews: [
          {
            id: 'page2',
            stars: 5,
            title: 'Great',
            text: 'Loved it',
            language: 'en',
            createdAt: '2025-03-19T00:00:00Z',
            isVerified: true,
            consumer: { displayName: 'User 2' },
            numberOfLikes: 0,
          },
        ],
        links: [],
      })

    const result = await provider.fetchReviews(
      { apiKey: 'test-key', businessUnitId: 'test-unit' },
      { limit: 1 },
    )

    // With limit: 1, perPage = min(20, 1-0) = 1, fetches 1 review, stops (allReviews.length >= limit)
    expect(result.reviews).toHaveLength(1)
    expect(result.reviews[0].id).toBe('trustpilot_page1')
  })
})
