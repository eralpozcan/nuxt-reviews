<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif;">
    <h1>nuxt-reviews playground</h1>

    <div style="margin-bottom: 2rem;">
      <h2>Aggregate Rating</h2>
      <div v-if="pending">Loading...</div>
      <div v-else-if="error" style="color: red;">
        Error: {{ error.message }}
      </div>
      <div v-else-if="aggregate">
        <p><strong>Average:</strong> {{ aggregate.average }} / 5</p>
        <p><strong>Total Reviews:</strong> {{ aggregate.total }}</p>
        <div>
          <strong>Distribution:</strong>
          <div v-for="star in [5, 4, 3, 2, 1]" :key="star" style="display: flex; align-items: center; gap: 0.5rem;">
            <span>{{ star }} star:</span>
            <div
              style="height: 12px; background: #f59e0b; border-radius: 4px;"
              :style="{ width: `${(aggregate.distribution[star] / aggregate.total) * 200}px` }"
            />
            <span>{{ aggregate.distribution[star] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 2rem;">
      <h2>Sources</h2>
      <div v-for="source in sources" :key="source.provider" style="padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 0.5rem;">
        <strong>{{ source.provider }}</strong> — {{ source.count }} reviews, avg {{ source.average }}
      </div>
    </div>

    <div>
      <h2>Reviews ({{ reviews.length }})</h2>
      <div
        v-for="review in reviews"
        :key="review.id"
        style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 1rem;"
      >
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong>{{ review.author.name }}</strong>
          <span style="color: #6b7280;">{{ review.provider }}</span>
        </div>
        <div style="margin-bottom: 0.5rem;">
          {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
        </div>
        <p v-if="review.title" style="font-weight: 600; margin-bottom: 0.25rem;">
          {{ review.title }}
        </p>
        <p>{{ review.text }}</p>
        <small style="color: #9ca3af;">{{ review.publishedAt }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { reviews, aggregate, sources, pending, error } = useReviews({
  provider: 'all',
  limit: 20,
})
</script>
