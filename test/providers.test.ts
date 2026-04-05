import { describe, it, expect } from 'vitest'
import { getProvider, getAvailableProviders } from '../src/runtime/server/utils/providers'

describe('provider registry', () => {
  it('returns all available providers', () => {
    const providers = getAvailableProviders()

    expect(providers).toContain('google')
    expect(providers).toContain('trustpilot')
    expect(providers).toContain('serpapi')
    expect(providers).toContain('outscraper')
    expect(providers).toHaveLength(4)
  })

  it('returns google provider', () => {
    const provider = getProvider('google')

    expect(provider.name).toBe('google')
    expect(typeof provider.fetchReviews).toBe('function')
  })

  it('returns trustpilot provider', () => {
    const provider = getProvider('trustpilot')

    expect(provider.name).toBe('trustpilot')
    expect(typeof provider.fetchReviews).toBe('function')
  })

  it('returns serpapi provider', () => {
    const provider = getProvider('serpapi')

    expect(provider.name).toBe('serpapi')
    expect(typeof provider.fetchReviews).toBe('function')
  })

  it('returns outscraper provider', () => {
    const provider = getProvider('outscraper')

    expect(provider.name).toBe('outscraper')
    expect(typeof provider.fetchReviews).toBe('function')
  })

  it('throws for unknown provider', () => {
    expect(() => getProvider('unknown')).toThrow('[nuxt-reviews] Unknown provider: "unknown"')
  })

  it('error message lists available providers', () => {
    expect(() => getProvider('invalid')).toThrow('google, trustpilot, serpapi, outscraper')
  })
})
