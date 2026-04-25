<template>
  <UPage>
    <UPageBody>
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">
            Playground
          </h1>
          <p class="text-muted text-lg">
            Test review fetching interactively with your own API keys.
          </p>
        </div>
        <!-- Provider Selector -->
        <div class="flex gap-2 mb-6">
          <UButton
            v-for="p in providers"
            :key="p.id"
            :label="p.label"
            :variant="selectedProvider === p.id ? 'solid' : 'outline'"
            @click="selectedProvider = p.id"
          />
        </div>

        <!-- Mock Info -->
        <UAlert
          v-if="selectedProvider === 'mock'"
          color="success"
          variant="subtle"
          title="Mock provider — no API key required"
          description="Returns 12 realistic hotel reviews in 8 languages (TR, EN, FR, DE, ES, IT, RU, JA). Click Fetch Reviews to see the new components in action."
          icon="i-lucide-flask-conical"
          class="mb-6"
        />

        <!-- Google Config -->
        <UCard
          v-if="selectedProvider === 'google'"
          class="mb-6"
        >
          <div class="space-y-4">
            <UFormField label="Google API Key">
              <UInput
                v-model="googleConfig.apiKey"
                type="password"
                placeholder="AIzaSy..."
                class="w-full"
              />
            </UFormField>
            <UFormField label="Place ID">
              <UInput
                v-model="googleConfig.placeId"
                placeholder="ChIJ..."
                class="w-full"
              />
            </UFormField>
            <p class="text-sm text-muted">
              Get your Place ID from
              <ULink
                to="https://developers.google.com/maps/documentation/places/web-service/place-id"
                target="_blank"
              >
                Google Place ID Finder
              </ULink>
            </p>
          </div>
        </UCard>

        <!-- Trustpilot Config -->
        <UCard
          v-if="selectedProvider === 'trustpilot'"
          class="mb-6"
        >
          <div class="space-y-4">
            <UFormField label="Trustpilot API Key">
              <UInput
                v-model="trustpilotConfig.apiKey"
                type="password"
                placeholder="Your Trustpilot API key"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Business Unit ID">
              <UInput
                v-model="trustpilotConfig.businessUnitId"
                placeholder="e.g. 46d6a890000064000500e0c3"
                class="w-full"
              />
            </UFormField>
          </div>
        </UCard>

        <UButton
          :label="loading ? 'Fetching...' : 'Fetch Reviews'"
          :loading="loading"
          :disabled="loading || !isConfigValid"
          icon="i-lucide-search"
          class="mb-8"
          @click="fetchReviews"
        />

        <!-- Error -->
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="subtle"
          :title="errorMessage"
          icon="i-lucide-circle-x"
          class="mb-6"
        />

        <!-- Mock Results — showcase new components -->
        <template v-if="result && selectedProvider === 'mock'">
          <h2 class="text-lg font-semibold mb-4">
            Component Kit Preview
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ReviewSummary
              :aggregate="result.aggregate"
              title="Guest Reviews"
              :show-distribution="true"
            />
            <div class="space-y-3">
              <p class="text-sm font-semibold text-muted">
                ReviewStars sizes:
              </p>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-3">
                  <ReviewStars
                    :rating="4.5"
                    size="sm"
                  />
                  <span class="text-xs text-muted">sm — 4.5</span>
                </div>
                <div class="flex items-center gap-3">
                  <ReviewStars
                    :rating="4.5"
                    size="md"
                  />
                  <span class="text-xs text-muted">md — 4.5</span>
                </div>
                <div class="flex items-center gap-3">
                  <ReviewStars
                    :rating="4.5"
                    size="lg"
                  />
                  <span class="text-xs text-muted">lg — 4.5</span>
                </div>
              </div>
            </div>
          </div>
          <h2 class="text-lg font-semibold mb-4">
            ReviewList (columns=2, show-provider)
          </h2>
          <ReviewList
            :reviews="result.reviews"
            :columns="2"
            show-provider
            :show-response="true"
            :truncate="180"
            class="mb-8"
          />
        </template>

        <!-- Results -->
        <template v-if="result && selectedProvider !== 'mock'">
          <div class="grid grid-cols-2 gap-4 mb-6">
            <UCard>
              <div class="text-4xl font-bold">
                {{ result.aggregate.average }}
              </div>
              <div class="text-sm text-muted">
                Average Rating (out of 5)
              </div>
              <div class="text-xl mt-1 text-amber-500">
                {{ '\u2605'.repeat(Math.round(result.aggregate.average)) }}{{ '\u2606'.repeat(5 - Math.round(result.aggregate.average)) }}
              </div>
            </UCard>
            <UCard>
              <div class="text-4xl font-bold">
                {{ result.aggregate.total }}
              </div>
              <div class="text-sm text-muted">
                Total Reviews
              </div>
              <div class="mt-2 space-y-1">
                <div
                  v-for="star in [5, 4, 3, 2, 1]"
                  :key="star"
                  class="flex items-center gap-2"
                >
                  <span class="text-xs w-4 text-right">{{ star }}</span>
                  <div class="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-amber-500 rounded-full transition-all duration-300"
                      :style="{ width: result.aggregate.total ? `${(result.aggregate.distribution[star] / result.aggregate.total) * 100}%` : '0%' }"
                    />
                  </div>
                  <span class="text-xs text-muted w-6">{{ result.aggregate.distribution[star] }}</span>
                </div>
              </div>
            </UCard>
          </div>

          <div
            v-if="result.sources?.length"
            class="flex gap-2 mb-6 flex-wrap"
          >
            <UBadge
              v-for="source in result.sources"
              :key="source.provider"
              variant="subtle"
            >
              {{ source.provider }} &mdash; {{ source.count }} reviews ({{ source.average }})
            </UBadge>
          </div>

          <h2 class="text-lg font-semibold mb-4">
            Reviews
          </h2>
          <UCard
            v-for="review in result.reviews"
            :key="review.id"
            class="mb-3"
          >
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <UAvatar
                  v-if="review.author.avatar"
                  :src="review.author.avatar"
                  :alt="review.author.name"
                  size="sm"
                />
                <UAvatar
                  v-else
                  :label="review.author.name.charAt(0)"
                  size="sm"
                />
                <div>
                  <div class="font-semibold text-sm">
                    {{ review.author.name }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ formatDate(review.publishedAt) }}
                  </div>
                </div>
              </div>
              <UBadge
                variant="subtle"
                size="xs"
              >
                {{ review.provider }}
              </UBadge>
            </div>
            <div class="text-amber-500 mb-2">
              {{ '\u2605'.repeat(review.rating) }}{{ '\u2606'.repeat(5 - review.rating) }}
            </div>
            <p
              v-if="review.title"
              class="font-semibold mb-1"
            >
              {{ review.title }}
            </p>
            <p class="text-sm leading-relaxed">
              {{ review.text }}
            </p>
            <div
              v-if="review.businessResponse"
              class="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-3 border-gray-300 dark:border-gray-600"
            >
              <div class="text-xs font-semibold text-muted mb-1">
                Business Response
              </div>
              <p class="text-sm">
                {{ review.businessResponse.text }}
              </p>
            </div>
          </UCard>
        </template>

        <div
          v-if="!result && !loading && !errorMessage"
          class="text-center py-12 text-muted"
        >
          <UIcon
            name="i-lucide-message-square"
            class="text-4xl mb-3"
          />
          <p>Enter your API credentials above and click "Fetch Reviews" to get started.</p>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
const providers = [
  { id: 'mock' as const, label: 'Mock (no API key)' },
  { id: 'google' as const, label: 'Google Places' },
  { id: 'trustpilot' as const, label: 'Trustpilot' }
]

const selectedProvider = ref<'mock' | 'google' | 'trustpilot'>('mock')

const googleConfig = reactive({ apiKey: '', placeId: '' })
const trustpilotConfig = reactive({ apiKey: '', businessUnitId: '' })

const loading = ref(false)
const errorMessage = ref('')
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const result = ref<Record<string, any> | null>(null)

const isConfigValid = computed(() => {
  if (selectedProvider.value === 'mock') return true
  if (selectedProvider.value === 'google') {
    return googleConfig.apiKey.length > 0 && googleConfig.placeId.length > 0
  }
  return trustpilotConfig.apiKey.length > 0 && trustpilotConfig.businessUnitId.length > 0
})

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return dateStr }
}

async function fetchReviews() {
  loading.value = true
  errorMessage.value = ''
  result.value = null

  try {
    if (selectedProvider.value === 'mock') {
      result.value = await $fetch('/api/_reviews/mock')
      return
    }

    const body = selectedProvider.value === 'google'
      ? { provider: 'google', apiKey: googleConfig.apiKey, placeId: googleConfig.placeId }
      : { provider: 'trustpilot', apiKey: trustpilotConfig.apiKey, businessUnitId: trustpilotConfig.businessUnitId }

    const raw = await $fetch('/api/test-reviews', { method: 'POST', body })

    let moduleResult = null
    try {
      moduleResult = await $fetch('/api/_reviews/' + selectedProvider.value)
    } catch {
      /* Module endpoint may not be configured */
    }

    result.value = moduleResult?.reviews?.length
      ? moduleResult
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : normalizeRawResponse(raw as Record<string, any>, selectedProvider.value)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Failed to fetch reviews'
  } finally {
    loading.value = false
  }
}

function normalizeRawResponse(raw: Record<string, unknown>, provider: string) {
  const dist = () => ({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawReviews = (raw.reviews as any[]) || []

  if (provider === 'google') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews = rawReviews.map((r: any, i: number) => ({
      id: `google_${i}`,
      provider: 'google',
      rating: r.rating,
      text: r.originalText?.text || r.text?.text || '',
      title: null,
      author: { name: r.authorAttribution?.displayName || 'Anonymous', avatar: r.authorAttribution?.photoUri || null },
      publishedAt: r.publishTime || '',
      language: r.originalText?.languageCode || r.text?.languageCode,
      businessResponse: null
    }))
    const distribution = dist()
    let sum = 0
    for (const r of reviews) {
      distribution[Math.round(r.rating)]++
      sum += r.rating
    }
    const total = reviews.length
    const average = total ? Math.round((sum / total) * 10) / 10 : 0
    return { reviews, aggregate: { average, total, distribution }, sources: [{ provider: 'google', count: total, average }] }
  }

  if (provider === 'trustpilot') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews = rawReviews.map((r: any) => ({
      id: `trustpilot_${r.id}`,
      provider: 'trustpilot',
      rating: r.stars,
      text: r.text || '',
      title: r.title || null,
      author: { name: r.consumer?.displayName || 'Anonymous', avatar: null },
      publishedAt: r.createdAt || '',
      language: r.language,
      isVerified: r.isVerified,
      businessResponse: r.companyReply ? { text: r.companyReply.text, publishedAt: r.companyReply.createdAt } : null
    }))
    const distribution = dist()
    let sum = 0
    for (const r of reviews) {
      distribution[Math.round(r.rating)]++
      sum += r.rating
    }
    const total = reviews.length
    const average = total ? Math.round((sum / total) * 10) / 10 : 0
    return { reviews, aggregate: { average, total, distribution }, sources: [{ provider: 'trustpilot', count: total, average }] }
  }

  return { reviews: [], aggregate: { average: 0, total: 0, distribution: dist() }, sources: [] }
}
</script>
