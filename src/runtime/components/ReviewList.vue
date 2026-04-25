<script setup lang="ts">
import type { NormalizedReview } from '../types'

withDefaults(defineProps<{
  reviews: NormalizedReview[]
  loading?: boolean
  emptyText?: string
  showProvider?: boolean
  showResponse?: boolean
  truncate?: number
  columns?: 1 | 2 | 3
}>(), {
  loading: false,
  emptyText: 'No reviews yet.',
  showProvider: false,
  showResponse: true,
  truncate: 0,
  columns: 1,
})
</script>

<template>
  <div class="review-list">
    <slot
      v-if="loading"
      name="loading"
    >
      <div class="review-list__loading">
        Loading reviews…
      </div>
    </slot>

    <slot
      v-else-if="!reviews.length"
      name="empty"
    >
      <div class="review-list__empty">
        {{ emptyText }}
      </div>
    </slot>

    <div
      v-else
      class="review-list__grid"
      :class="`review-list__grid--cols-${columns}`"
    >
      <template
        v-for="review in reviews"
        :key="review.id"
      >
        <slot
          name="review"
          :review="review"
        >
          <ReviewCard
            :review="review"
            :show-provider="showProvider"
            :show-response="showResponse"
            :truncate="truncate"
          />
        </slot>
      </template>
    </div>
  </div>
</template>

<style scoped>
.review-list__loading,
.review-list__empty {
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}
.review-list__grid {
  display: grid;
  gap: 1rem;
}
.review-list__grid--cols-1 { grid-template-columns: 1fr; }
.review-list__grid--cols-2 { grid-template-columns: repeat(2, 1fr); }
.review-list__grid--cols-3 { grid-template-columns: repeat(3, 1fr); }

@media (max-width: 640px) {
  .review-list__grid--cols-2,
  .review-list__grid--cols-3 {
    grid-template-columns: 1fr;
  }
}
@media (min-width: 641px) and (max-width: 1024px) {
  .review-list__grid--cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
