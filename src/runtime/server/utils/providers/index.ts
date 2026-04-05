import type { ReviewProvider, ReviewProviderAdapter } from '../../../types'
import { googleProvider } from './google'
import { trustpilotProvider } from './trustpilot'
import { serpapiProvider } from './serpapi'
import { outscraperProvider } from './outscraper'

const providerRegistry: Record<ReviewProvider, ReviewProviderAdapter> = {
  google: googleProvider,
  trustpilot: trustpilotProvider,
  serpapi: serpapiProvider,
  outscraper: outscraperProvider,
}

export function getProvider(name: string): ReviewProviderAdapter {
  const provider = providerRegistry[name as ReviewProvider]
  if (!provider) {
    throw new Error(`[nuxt-reviews] Unknown provider: "${name}". Available: ${Object.keys(providerRegistry).join(', ')}`)
  }
  return provider
}

export function getAvailableProviders(): ReviewProvider[] {
  return Object.keys(providerRegistry) as ReviewProvider[]
}
