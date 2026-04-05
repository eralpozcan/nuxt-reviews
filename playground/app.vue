<template>
  <div style="max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; color: #1a1a1a;">
    <div style="margin-bottom: 2rem;">
      <h1 style="margin: 0 0 0.25rem;">nuxt-reviews</h1>
      <p style="color: #6b7280; margin: 0;">Interactive playground — test review fetching with your own API keys</p>
    </div>

    <!-- Config Panel -->
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem;">
      <h2 style="margin: 0 0 1rem; font-size: 1.1rem;">Configuration</h2>

      <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
        <button
          v-for="p in providers"
          :key="p.id"
          style="padding: 0.5rem 1rem; border-radius: 8px; border: 2px solid; cursor: pointer; font-weight: 600; font-size: 0.875rem; transition: all 0.15s;"
          :style="selectedProvider === p.id
            ? { background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' }
            : { background: '#fff', color: '#374151', borderColor: '#d1d5db' }"
          @click="selectedProvider = p.id"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- Google Config -->
      <div v-if="selectedProvider === 'google'" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Google API Key</label>
          <input
            v-model="googleConfig.apiKey"
            type="password"
            placeholder="AIzaSy..."
            style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; box-sizing: border-box;"
          >
        </div>
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Place ID</label>
          <input
            v-model="googleConfig.placeId"
            placeholder="ChIJ..."
            style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; box-sizing: border-box;"
          >
        </div>
        <p style="font-size: 0.75rem; color: #9ca3af; margin: 0;">
          Get your Place ID from <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" style="color: #3b82f6;">Google Place ID Finder</a>
        </p>
      </div>

      <!-- Trustpilot Config -->
      <div v-if="selectedProvider === 'trustpilot'" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Trustpilot API Key</label>
          <input
            v-model="trustpilotConfig.apiKey"
            type="password"
            placeholder="Your Trustpilot API key"
            style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; box-sizing: border-box;"
          >
        </div>
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Business Unit ID</label>
          <input
            v-model="trustpilotConfig.businessUnitId"
            placeholder="e.g. 46d6a890000064000500e0c3"
            style="width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.875rem; box-sizing: border-box;"
          >
        </div>
      </div>

      <button
        style="margin-top: 1rem; padding: 0.625rem 1.5rem; background: #1a1a1a; color: #fff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.875rem; cursor: pointer;"
        :style="loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}"
        :disabled="loading || !isConfigValid"
        @click="fetchReviews"
      >
        {{ loading ? 'Fetching...' : 'Fetch Reviews' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="errorMessage" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; color: #dc2626; font-size: 0.875rem;">
      {{ errorMessage }}
    </div>

    <!-- Results -->
    <div v-if="result">
      <!-- Aggregate -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem;">
          <div style="font-size: 2rem; font-weight: 700;">{{ result.aggregate.average }}</div>
          <div style="color: #6b7280; font-size: 0.875rem;">Average Rating (out of 5)</div>
          <div style="font-size: 1.25rem; margin-top: 0.25rem;">
            {{ '★'.repeat(Math.round(result.aggregate.average)) }}{{ '☆'.repeat(5 - Math.round(result.aggregate.average)) }}
          </div>
        </div>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem;">
          <div style="font-size: 2rem; font-weight: 700;">{{ result.aggregate.total }}</div>
          <div style="color: #6b7280; font-size: 0.875rem;">Total Reviews</div>
          <div style="margin-top: 0.5rem;">
            <div v-for="star in [5, 4, 3, 2, 1]" :key="star" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2px;">
              <span style="font-size: 0.75rem; width: 1rem; text-align: right;">{{ star }}</span>
              <div style="flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
                <div
                  style="height: 100%; background: #f59e0b; border-radius: 4px; transition: width 0.3s;"
                  :style="{ width: result.aggregate.total ? `${(result.aggregate.distribution[star] / result.aggregate.total) * 100}%` : '0%' }"
                />
              </div>
              <span style="font-size: 0.75rem; color: #6b7280; width: 1.5rem;">{{ result.aggregate.distribution[star] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sources -->
      <div v-if="result.sources?.length" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
        <span
          v-for="source in result.sources"
          :key="source.provider"
          style="background: #f0f9ff; color: #0369a1; padding: 0.375rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500;"
        >
          {{ source.provider }} — {{ source.count }} reviews ({{ source.average }})
        </span>
      </div>

      <!-- Reviews List -->
      <h2 style="margin: 0 0 1rem; font-size: 1.1rem;">Reviews</h2>
      <div
        v-for="review in result.reviews"
        :key="review.id"
        style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; margin-bottom: 0.75rem;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div
              v-if="review.author.avatar"
              style="width: 32px; height: 32px; border-radius: 50%; background-size: cover; background-position: center;"
              :style="{ backgroundImage: `url(${review.author.avatar})` }"
            />
            <div v-else style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem; color: #6b7280;">
              {{ review.author.name.charAt(0) }}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem;">{{ review.author.name }}</div>
              <div style="font-size: 0.75rem; color: #9ca3af;">{{ formatDate(review.publishedAt) }}</div>
            </div>
          </div>
          <span style="background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.7rem; color: #6b7280; text-transform: uppercase;">
            {{ review.provider }}
          </span>
        </div>
        <div style="color: #f59e0b; margin-bottom: 0.5rem; font-size: 0.9rem;">
          {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
        </div>
        <p v-if="review.title" style="font-weight: 600; margin: 0 0 0.25rem;">{{ review.title }}</p>
        <p style="margin: 0; line-height: 1.5; color: #374151; font-size: 0.9rem;">{{ review.text }}</p>
        <div v-if="review.businessResponse" style="margin-top: 0.75rem; padding: 0.75rem; background: #f9fafb; border-radius: 8px; border-left: 3px solid #d1d5db;">
          <div style="font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 0.25rem;">Business Response</div>
          <p style="margin: 0; font-size: 0.85rem; color: #4b5563;">{{ review.businessResponse.text }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!result && !loading && !errorMessage" style="text-align: center; padding: 3rem 1rem; color: #9ca3af;">
      <p style="font-size: 1.1rem;">Enter your API credentials above and click "Fetch Reviews" to get started.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const providers = [
  { id: 'google' as const, label: 'Google Places' },
  { id: 'trustpilot' as const, label: 'Trustpilot' },
]

const selectedProvider = ref<'google' | 'trustpilot'>('google')

const googleConfig = reactive({
  apiKey: '',
  placeId: '',
})

const trustpilotConfig = reactive({
  apiKey: '',
  businessUnitId: '',
})

const loading = ref(false)
const errorMessage = ref('')
const result = ref<Record<string, any> | null>(null)

const isConfigValid = computed(() => {
  if (selectedProvider.value === 'google') {
    return googleConfig.apiKey.length > 0 && googleConfig.placeId.length > 0
  }
  return trustpilotConfig.apiKey.length > 0 && trustpilotConfig.businessUnitId.length > 0
})

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  catch {
    return dateStr
  }
}

async function fetchReviews() {
  loading.value = true
  errorMessage.value = ''
  result.value = null

  try {
    const body = selectedProvider.value === 'google'
      ? { provider: 'google', apiKey: googleConfig.apiKey, placeId: googleConfig.placeId }
      : { provider: 'trustpilot', apiKey: trustpilotConfig.apiKey, businessUnitId: trustpilotConfig.businessUnitId }

    const raw = await $fetch('/api/test-reviews', { method: 'POST', body })

    // Also fetch via the module's own endpoint if env is configured
    let moduleResult = null
    try {
      moduleResult = await $fetch('/api/_reviews/' + selectedProvider.value)
    }
    catch {
      // Module endpoint may not be configured, that's fine
    }

    if (moduleResult?.reviews?.length) {
      result.value = moduleResult
    }
    else {
      // Normalize raw response for display
      result.value = normalizeRawResponse(raw as Record<string, any>, selectedProvider.value)
    }
  }
  catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Failed to fetch reviews'
  }
  finally {
    loading.value = false
  }
}

function normalizeRawResponse(raw: Record<string, any>, provider: string) {
  if (provider === 'google') {
    const reviews = (raw.reviews || []).map((r: any, i: number) => ({
      id: `google_${i}`,
      provider: 'google',
      rating: r.rating,
      text: r.originalText?.text || r.text?.text || '',
      title: null,
      author: {
        name: r.authorAttribution?.displayName || 'Anonymous',
        avatar: r.authorAttribution?.photoUri || null,
      },
      publishedAt: r.publishTime || '',
      language: r.originalText?.languageCode || r.text?.languageCode,
      businessResponse: null,
    }))

    const total = reviews.length
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
    let sum = 0
    for (const r of reviews) {
      distribution[Math.round(r.rating)]++
      sum += r.rating
    }

    return {
      reviews,
      aggregate: {
        average: total ? Math.round((sum / total) * 10) / 10 : 0,
        total,
        distribution,
      },
      sources: [{ provider: 'google', count: total, average: total ? Math.round((sum / total) * 10) / 10 : 0 }],
    }
  }

  if (provider === 'trustpilot') {
    const reviews = (raw.reviews || []).map((r: any) => ({
      id: `trustpilot_${r.id}`,
      provider: 'trustpilot',
      rating: r.stars,
      text: r.text || '',
      title: r.title || null,
      author: {
        name: r.consumer?.displayName || 'Anonymous',
        avatar: null,
      },
      publishedAt: r.createdAt || '',
      language: r.language,
      isVerified: r.isVerified,
      businessResponse: r.companyReply ? { text: r.companyReply.text, publishedAt: r.companyReply.createdAt } : null,
    }))

    const total = reviews.length
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
    let sum = 0
    for (const r of reviews) {
      distribution[Math.round(r.rating)]++
      sum += r.rating
    }

    return {
      reviews,
      aggregate: {
        average: total ? Math.round((sum / total) * 10) / 10 : 0,
        total,
        distribution,
      },
      sources: [{ provider: 'trustpilot', count: total, average: total ? Math.round((sum / total) * 10) / 10 : 0 }],
    }
  }

  return { reviews: [], aggregate: { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, sources: [] }
}
</script>
