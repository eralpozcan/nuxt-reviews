import { defineEventHandler, readBody, createError } from 'h3'
import { $fetch } from 'ofetch'

interface TestRequest {
  provider: 'google' | 'trustpilot'
  apiKey: string
  placeId?: string
  businessUnitId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TestRequest>(event)

  if (!body.provider || !body.apiKey) {
    throw createError({ statusCode: 400, message: 'provider and apiKey are required' })
  }

  if (body.provider === 'google') {
    if (!body.placeId) {
      throw createError({ statusCode: 400, message: 'placeId is required for Google provider' })
    }

    const response = await $fetch(
      `https://places.googleapis.com/v1/places/${body.placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': body.apiKey,
          'X-Goog-FieldMask': 'reviews,rating,userRatingCount'
        }
      }
    )

    return response
  }

  if (body.provider === 'trustpilot') {
    if (!body.businessUnitId) {
      throw createError({ statusCode: 400, message: 'businessUnitId is required for Trustpilot provider' })
    }

    const response = await $fetch(
      `https://api.trustpilot.com/v1/business-units/${body.businessUnitId}/reviews`,
      {
        headers: { apikey: body.apiKey },
        query: { perPage: 20 }
      }
    )

    return response
  }

  throw createError({ statusCode: 400, message: `Unsupported provider: ${body.provider}` })
})
