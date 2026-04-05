import { $fetch } from 'ofetch'
import type {
  NormalizedReview,
  ModerationConfig,
  ModerationResult,
  ModerationScores,
  PerspectiveAttribute,
} from '../../types'

// ============================================================
// Google Perspective API
// ============================================================

interface PerspectiveRequest {
  comment: { text: string }
  languages?: string[]
  requestedAttributes: Record<string, Record<string, never>>
}

interface PerspectiveResponse {
  attributeScores: Record<string, {
    summaryScore: { value: number }
  }>
}

const DEFAULT_ATTRIBUTES: PerspectiveAttribute[] = [
  'TOXICITY',
  'SEVERE_TOXICITY',
  'INSULT',
  'PROFANITY',
  'THREAT',
  'IDENTITY_ATTACK',
]

async function analyzeWithPerspective(
  text: string,
  apiKey: string,
  attributes: PerspectiveAttribute[] = DEFAULT_ATTRIBUTES,
  language?: string,
): Promise<ModerationResult> {
  const requestedAttributes: Record<string, Record<string, never>> = {}
  for (const attr of attributes) {
    requestedAttributes[attr] = {}
  }

  const body: PerspectiveRequest = {
    comment: { text },
    requestedAttributes,
  }

  if (language) {
    body.languages = [language]
  }

  const response = await $fetch<PerspectiveResponse>(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze`,
    {
      method: 'POST',
      query: { key: apiKey },
      body,
    },
  )

  const scores: ModerationScores = {
    toxicity: response.attributeScores.TOXICITY?.summaryScore.value ?? 0,
    severeToxicity: response.attributeScores.SEVERE_TOXICITY?.summaryScore.value,
    insult: response.attributeScores.INSULT?.summaryScore.value,
    profanity: response.attributeScores.PROFANITY?.summaryScore.value,
    threat: response.attributeScores.THREAT?.summaryScore.value,
    identityAttack: response.attributeScores.IDENTITY_ATTACK?.summaryScore.value,
  }

  return { flagged: false, scores, provider: 'perspective' }
}

// ============================================================
// OpenAI Moderation API
// ============================================================

interface OpenAIModerationResponse {
  results: Array<{
    flagged: boolean
    category_scores: {
      hate: number
      harassment: number
      'self-harm': number
      sexual: number
      violence: number
      'hate/threatening': number
      'harassment/threatening': number
    }
  }>
}

async function analyzeWithOpenAI(
  text: string,
  apiKey: string,
): Promise<ModerationResult> {
  const response = await $fetch<OpenAIModerationResponse>(
    'https://api.openai.com/v1/moderations',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: { input: text },
    },
  )

  const result = response.results[0]
  const scores: ModerationScores = {
    toxicity: Math.max(
      result.category_scores.hate,
      result.category_scores.harassment,
    ),
    severeToxicity: Math.max(
      result.category_scores['hate/threatening'],
      result.category_scores['harassment/threatening'],
    ),
    threat: result.category_scores.violence,
  }

  return { flagged: result.flagged, scores, provider: 'openai' }
}

// ============================================================
// Public API
// ============================================================

async function analyzeReview(
  text: string,
  config: ModerationConfig,
  language?: string,
): Promise<ModerationResult> {
  if (config.provider === 'openai') {
    return analyzeWithOpenAI(text, config.apiKey)
  }
  return analyzeWithPerspective(text, config.apiKey, config.attributes, language)
}

/**
 * Moderate a list of reviews.
 * - action: 'filter' → removes flagged reviews from the list
 * - action: 'flag'   → keeps all reviews but attaches moderation data
 */
export async function moderateReviews(
  reviews: NormalizedReview[],
  config: ModerationConfig,
): Promise<NormalizedReview[]> {
  if (!config.enabled || !config.apiKey) {
    return reviews
  }

  const threshold = config.toxicityThreshold ?? 0.7
  const action = config.action ?? 'filter'

  // Analyze all reviews in parallel (batched to avoid rate limits)
  const BATCH_SIZE = 10
  const moderated: NormalizedReview[] = []

  for (let i = 0; i < reviews.length; i += BATCH_SIZE) {
    const batch = reviews.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(review =>
        analyzeReview(
          `${review.title || ''} ${review.text}`.trim(),
          config,
          review.language,
        ),
      ),
    )

    for (let j = 0; j < batch.length; j++) {
      const review = batch[j]
      const result = results[j]

      if (result.status === 'rejected') {
        // If moderation fails, keep the review without moderation data
        moderated.push(review)
        continue
      }

      const moderationResult = result.value
      moderationResult.flagged = moderationResult.scores.toxicity >= threshold

      if (action === 'flag') {
        moderated.push({ ...review, moderation: moderationResult })
      }
      else {
        // action === 'filter': only keep non-flagged reviews
        if (!moderationResult.flagged) {
          moderated.push(review)
        }
      }
    }
  }

  return moderated
}
