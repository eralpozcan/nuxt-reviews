import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('nuxt-reviews-test')
  })

  it('registers the reviews API route', async () => {
    try {
      await $fetch('/api/_reviews/google')
    }
    catch (error: unknown) {
      // API will fail with fake key (502) but route should exist (not 404)
      const e = error as Record<string, unknown>
      expect(e.statusCode || e.status).not.toBe(404)
    }
  })
})
