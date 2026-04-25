<script setup lang="ts">
import type { NormalizedReview } from '../types'

withDefaults(defineProps<{
  review: NormalizedReview
  showProvider?: boolean
  showResponse?: boolean
  truncate?: number
}>(), {
  showProvider: false,
  showResponse: true,
  truncate: 0,
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function truncateText(text: string, length: number) {
  if (!length || text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}
</script>

<template>
  <article class="review-card">
    <header class="review-card__header">
      <div class="review-card__author">
        <img
          v-if="review.author.avatar"
          :src="review.author.avatar"
          :alt="review.author.name"
          class="review-card__avatar"
        >
        <span
          v-else
          class="review-card__avatar-placeholder"
        >
          {{ review.author.name.charAt(0).toUpperCase() }}
        </span>
        <div class="review-card__author-info">
          <span class="review-card__author-name">{{ review.author.name }}</span>
          <span
            v-if="review.author.reviewCount"
            class="review-card__author-count"
          >
            {{ review.author.reviewCount }} reviews
          </span>
        </div>
      </div>
      <div class="review-card__meta">
        <ReviewStars
          :rating="review.rating"
          size="sm"
        />
        <time
          class="review-card__date"
          :datetime="review.publishedAt"
        >
          {{ formatDate(review.publishedAt) }}
        </time>
      </div>
    </header>

    <div class="review-card__body">
      <p
        v-if="review.title"
        class="review-card__title"
      >
        {{ review.title }}
      </p>
      <p class="review-card__text">
        {{ truncate ? truncateText(review.text, truncate) : review.text }}
      </p>
    </div>

    <footer
      v-if="showResponse && review.businessResponse"
      class="review-card__response"
    >
      <p class="review-card__response-label">
        Response from owner
      </p>
      <p class="review-card__response-text">
        {{ review.businessResponse.text }}
      </p>
    </footer>

    <div
      v-if="showProvider"
      class="review-card__provider"
    >
      via {{ review.provider }}
    </div>
  </article>
</template>

<style scoped>
.review-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
}
.review-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.review-card__author {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}
.review-card__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.review-card__avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  font-weight: 600;
  font-size: 1rem;
  color: #6b7280;
  flex-shrink: 0;
}
.review-card__author-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.review-card__author-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
}
.review-card__author-count {
  font-size: 0.75rem;
  color: #9ca3af;
}
.review-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  flex-shrink: 0;
}
.review-card__date {
  font-size: 0.75rem;
  color: #9ca3af;
}
.review-card__title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #111827;
  margin: 0 0 0.375rem;
}
.review-card__text {
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.65;
  margin: 0;
}
.review-card__response {
  margin-top: 0.875rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  border-left: 3px solid #d1d5db;
}
.review-card__response-label {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.25rem;
}
.review-card__response-text {
  font-size: 0.8125rem;
  color: #4b5563;
  line-height: 1.5;
  margin: 0;
}
.review-card__provider {
  margin-top: 0.625rem;
  font-size: 0.6875rem;
  color: #d1d5db;
  text-align: right;
  text-transform: capitalize;
}
</style>
