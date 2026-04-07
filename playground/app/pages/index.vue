<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('landing').path('/').first(), {
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key]
})

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
    :prose="false"
  />
  <div
    v-else
    class="flex flex-col items-center justify-center min-h-[60vh] text-center"
  >
    <h1 class="text-4xl font-bold mb-4">
      <span class="text-primary">nuxt</span>-reviews
    </h1>
    <p class="text-lg text-muted mb-8">
      Fetch and aggregate reviews from multiple platforms with a single Nuxt module.
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
</template>
