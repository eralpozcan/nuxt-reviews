import { describe, it, expect, vi } from 'vitest'

import { $fetch } from 'ofetch'
import { moderateReviews } from '../src/runtime/server/utils/moderation'
import type { NormalizedReview, ModerationConfig } from '../src/runtime/types'

vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))

const mockedFetch = vi.mocked($fetch)

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

describe('moderateReviews', () => {
  const perspectiveConfig: ModerationConfig = {
    enabled: true,
    provider: 'perspective',
    apiKey: 'test-perspective-key',
    toxicityThreshold: 0.7,
    action: 'filter',
  }

  it('returns reviews unchanged when moderation is disabled', async () => {
    const reviews = [createReview(), createReview()]
    const config: ModerationConfig = { ...perspectiveConfig, enabled: false }

    const result = await moderateReviews(reviews, config)

    expect(result).toHaveLength(2)
    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it('returns reviews unchanged when apiKey is missing', async () => {
    const reviews = [createReview()]
    const config: ModerationConfig = { ...perspectiveConfig, apiKey: '' }

    const result = await moderateReviews(reviews, config)

    expect(result).toHaveLength(1)
  })

  it('filters toxic reviews with perspective provider', async () => {
    const reviews = [
      createReview({ text: 'Wonderful experience!' }),
      createReview({ text: 'Terrible horrible awful place!' }),
      createReview({ text: 'Nice and clean room.' }),
    ]

    mockedFetch
      .mockResolvedValueOnce({
        attributeScores: {
          TOXICITY: { summaryScore: { value: 0.1 } },
          SEVERE_TOXICITY: { summaryScore: { value: 0.05 } },
          INSULT: { summaryScore: { value: 0.08 } },
          PROFANITY: { summaryScore: { value: 0.02 } },
          THREAT: { summaryScore: { value: 0.01 } },
          IDENTITY_ATTACK: { summaryScore: { value: 0.0 } },
        },
      })
      .mockResolvedValueOnce({
        attributeScores: {
          TOXICITY: { summaryScore: { value: 0.85 } },
          SEVERE_TOXICITY: { summaryScore: { value: 0.6 } },
          INSULT: { summaryScore: { value: 0.9 } },
          PROFANITY: { summaryScore: { value: 0.8 } },
          THREAT: { summaryScore: { value: 0.1 } },
          IDENTITY_ATTACK: { summaryScore: { value: 0.05 } },
        },
      })
      .mockResolvedValueOnce({
        attributeScores: {
          TOXICITY: { summaryScore: { value: 0.05 } },
          SEVERE_TOXICITY: { summaryScore: { value: 0.01 } },
          INSULT: { summaryScore: { value: 0.03 } },
          PROFANITY: { summaryScore: { value: 0.01 } },
          THREAT: { summaryScore: { value: 0.0 } },
          IDENTITY_ATTACK: { summaryScore: { value: 0.0 } },
        },
      })

    const result = await moderateReviews(reviews, perspectiveConfig)

    expect(result).toHaveLength(2)
    expect(result[0].text).toBe('Wonderful experience!')
    expect(result[1].text).toBe('Nice and clean room.')
  })

  it('flags toxic reviews instead of filtering with action: flag', async () => {
    const reviews = [
      createReview({ text: 'Good place' }),
      createReview({ text: 'Horrible staff!' }),
    ]

    const config: ModerationConfig = { ...perspectiveConfig, action: 'flag' }

    mockedFetch
      .mockResolvedValueOnce({
        attributeScores: {
          TOXICITY: { summaryScore: { value: 0.1 } },
          SEVERE_TOXICITY: { summaryScore: { value: 0.05 } },
          INSULT: { summaryScore: { value: 0.08 } },
          PROFANITY: { summaryScore: { value: 0.02 } },
          THREAT: { summaryScore: { value: 0.01 } },
          IDENTITY_ATTACK: { summaryScore: { value: 0.0 } },
        },
      })
      .mockResolvedValueOnce({
        attributeScores: {
          TOXICITY: { summaryScore: { value: 0.9 } },
          SEVERE_TOXICITY: { summaryScore: { value: 0.5 } },
          INSULT: { summaryScore: { value: 0.85 } },
          PROFANITY: { summaryScore: { value: 0.7 } },
          THREAT: { summaryScore: { value: 0.1 } },
          IDENTITY_ATTACK: { summaryScore: { value: 0.05 } },
        },
      })

    const result = await moderateReviews(reviews, config)

    expect(result).toHaveLength(2)

    expect(result[0].moderation?.flagged).toBe(false)
    expect(result[0].moderation?.scores.toxicity).toBe(0.1)
    expect(result[0].moderation?.provider).toBe('perspective')

    expect(result[1].moderation?.flagged).toBe(true)
    expect(result[1].moderation?.scores.toxicity).toBe(0.9)
  })

  it('respects custom toxicity threshold', async () => {
    const reviews = [createReview({ text: 'Meh, not great.' })]
    const config: ModerationConfig = { ...perspectiveConfig, toxicityThreshold: 0.5 }

    mockedFetch.mockResolvedValueOnce({
      attributeScores: {
        TOXICITY: { summaryScore: { value: 0.6 } },
        SEVERE_TOXICITY: { summaryScore: { value: 0.1 } },
        INSULT: { summaryScore: { value: 0.3 } },
        PROFANITY: { summaryScore: { value: 0.1 } },
        THREAT: { summaryScore: { value: 0.0 } },
        IDENTITY_ATTACK: { summaryScore: { value: 0.0 } },
      },
    })

    const result = await moderateReviews(reviews, config)

    expect(result).toHaveLength(0) // 0.6 >= 0.5 threshold, filtered out
  })

  it('keeps review if moderation API fails', async () => {
    const reviews = [createReview({ text: 'Nice hotel' })]

    mockedFetch.mockRejectedValueOnce(new Error('API error'))

    const result = await moderateReviews(reviews, perspectiveConfig)

    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Nice hotel')
  })

  it('works with openai moderation provider', async () => {
    const reviews = [createReview({ text: 'Great service!' })]
    const config: ModerationConfig = {
      enabled: true,
      provider: 'openai',
      apiKey: 'test-openai-key',
      toxicityThreshold: 0.7,
      action: 'filter',
    }

    mockedFetch.mockResolvedValueOnce({
      results: [{
        flagged: false,
        category_scores: {
          'hate': 0.01,
          'harassment': 0.02,
          'self-harm': 0.0,
          'sexual': 0.0,
          'violence': 0.0,
          'hate/threatening': 0.0,
          'harassment/threatening': 0.01,
        },
      }],
    })

    const result = await moderateReviews(reviews, config)

    expect(result).toHaveLength(1)
  })

  it('combines title and text for analysis', async () => {
    const reviews = [createReview({ title: 'Bad Title', text: 'Bad content' })]

    mockedFetch.mockResolvedValueOnce({
      attributeScores: {
        TOXICITY: { summaryScore: { value: 0.1 } },
        SEVERE_TOXICITY: { summaryScore: { value: 0.05 } },
        INSULT: { summaryScore: { value: 0.08 } },
        PROFANITY: { summaryScore: { value: 0.02 } },
        THREAT: { summaryScore: { value: 0.01 } },
        IDENTITY_ATTACK: { summaryScore: { value: 0.0 } },
      },
    })

    await moderateReviews(reviews, perspectiveConfig)

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.stringContaining('commentanalyzer'),
      expect.objectContaining({
        body: expect.objectContaining({
          comment: { text: 'Bad Title Bad content' },
        }),
      }),
    )
  })
})
