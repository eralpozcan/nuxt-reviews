import { describe, it, expect, vi } from 'vitest'

import { $fetch } from 'ofetch'
import { getProvider } from '../src/runtime/server/utils/providers'

vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

const mockedFetch = vi.mocked($fetch)

describe('google provider', () => {
  const provider = getProvider('google')

  it('throws when apiKey is missing', async () => {
    await expect(
      provider.fetchReviews({ placeId: 'ChIJtest' }),
    ).rejects.toThrow('apiKey and placeId')
  })

  it('throws when placeId is missing', async () => {
    await expect(
      provider.fetchReviews({ apiKey: 'test-key' }),
    ).rejects.toThrow('apiKey and placeId')
  })

  it('fetches and normalizes google reviews', async () => {
    mockedFetch.mockResolvedValueOnce({
      rating: 4.5,
      userRatingCount: 200,
      reviews: [
        {
          name: 'places/123/reviews/abc',
          rating: 5,
          text: { text: 'Amazing hotel!', languageCode: 'en' },
          originalText: { text: 'Amazing hotel!', languageCode: 'en' },
          authorAttribution: {
            displayName: 'John Doe',
            uri: 'https://google.com/user/123',
            photoUri: 'https://photo.jpg',
          },
          publishTime: '2025-03-20T10:00:00Z',
          relativePublishTimeDescription: '2 weeks ago',
        },
        {
          name: 'places/123/reviews/def',
          rating: 3,
          text: { text: 'Average stay', languageCode: 'en' },
          authorAttribution: {
            displayName: 'Jane Smith',
          },
          publishTime: '2025-03-18T08:00:00Z',
          relativePublishTimeDescription: '3 weeks ago',
        },
      ],
    })

    const result = await provider.fetchReviews({
      apiKey: 'test-key',
      placeId: 'ChIJtest123',
    })

    expect(result.reviews).toHaveLength(2)
    expect(result.totalAvailable).toBe(200)

    // First review
    const first = result.reviews[0]
    expect(first.id).toContain('google_')
    expect(first.provider).toBe('google')
    expect(first.rating).toBe(5)
    expect(first.text).toBe('Amazing hotel!')
    expect(first.author.name).toBe('John Doe')
    expect(first.author.avatar).toBe('https://photo.jpg')
    expect(first.author.url).toBe('https://google.com/user/123')
    expect(first.publishedAt).toBe('2025-03-20T10:00:00Z')
    expect(first.language).toBe('en')

    // Second review
    const second = result.reviews[1]
    expect(second.rating).toBe(3)
    expect(second.author.name).toBe('Jane Smith')
  })

  it('passes language option to API', async () => {
    mockedFetch.mockResolvedValueOnce({ reviews: [] })

    await provider.fetchReviews(
      { apiKey: 'test-key', placeId: 'ChIJtest' },
      { language: 'tr' },
    )

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining('places/ChIJtest'),
      expect.objectContaining({
        query: { languageCode: 'tr' },
      }),
    )
  })

  it('handles empty reviews response', async () => {
    mockedFetch.mockResolvedValueOnce({ reviews: undefined, userRatingCount: 0 })

    const result = await provider.fetchReviews({
      apiKey: 'test-key',
      placeId: 'ChIJtest',
    })

    expect(result.reviews).toEqual([])
    expect(result.totalAvailable).toBe(0)
  })
})
