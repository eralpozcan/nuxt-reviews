<script setup lang="ts">
useSeoMeta({
  titleTemplate: '',
  title: 'nuxt-reviews',
  ogTitle: 'nuxt-reviews',
  description: 'Fetch and aggregate reviews from multiple platforms with a single Nuxt module.',
  ogDescription: 'Fetch and aggregate reviews from multiple platforms with a single Nuxt module.'
})
</script>

<template>
  <div>
    <div class="flex flex-col items-center justify-center text-center py-24 px-4">
      <img
        src="/logo.png"
        alt="nuxt-reviews"
        class="w-64 mb-6"
      >
      <h1 class="text-5xl font-bold mb-4">
        <span class="text-primary">nuxt</span>-reviews
      </h1>
      <p class="text-xl text-muted max-w-2xl mb-10">
        Fetch and aggregate reviews from multiple platforms with a single Nuxt module.
        Google Places, Trustpilot, SerpAPI, Outscraper — all normalized into one unified format.
      </p>
      <div class="flex gap-3">
        <UButton
          to="/getting-started"
          label="Get Started"
          icon="i-lucide-arrow-right"
          size="xl"
        />
        <UButton
          to="/playground"
          label="Playground"
          icon="i-lucide-play"
          size="xl"
          variant="subtle"
        />
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-4 pb-24">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UPageCard
          title="Multi-Provider"
          description="Fetch reviews from Google Places, Trustpilot, SerpAPI, and Outscraper with a unified API."
          icon="i-lucide-layers"
        />
        <UPageCard
          title="Auto Composable"
          description="Use the useReviews() composable for reactive, type-safe review data in your components."
          icon="i-lucide-code"
        />
        <UPageCard
          title="Content Moderation"
          description="Built-in moderation via Perspective API or OpenAI to filter toxic reviews automatically."
          icon="i-lucide-shield-check"
        />
        <UPageCard
          title="Smart Caching"
          description="Server-side caching with configurable TTL to minimize API calls and costs."
          icon="i-lucide-database"
        />
        <UPageCard
          title="Type-Safe"
          description="Full TypeScript support with normalized types based on Schema.org/Review."
          icon="i-lucide-file-type"
        />
        <UPageCard
          title="Zero Config"
          description="Add your API keys, define providers, and you're ready to go. Sensible defaults included."
          icon="i-lucide-zap"
        />
      </div>
    </div>
  </div>
</template>
