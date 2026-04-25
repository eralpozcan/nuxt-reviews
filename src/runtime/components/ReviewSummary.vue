<script setup lang="ts">
import { computed } from 'vue'
import type { AggregateRating } from '../types'

const props = withDefaults(defineProps<{
  aggregate: AggregateRating
  title?: string
  showDistribution?: boolean
}>(), {
  showDistribution: true,
})

const bars = computed(() =>
  ([5, 4, 3, 2, 1] as const).map(star => ({
    star,
    count: props.aggregate.distribution[star] || 0,
    percent: props.aggregate.total
      ? Math.round((props.aggregate.distribution[star] / props.aggregate.total) * 100)
      : 0,
  })),
)
</script>

<template>
  <div class="review-summary">
    <p
      v-if="title"
      class="review-summary__title"
    >
      {{ title }}
    </p>

    <div class="review-summary__score">
      <span class="review-summary__average">{{ aggregate.average.toFixed(1) }}</span>
      <div class="review-summary__stars-wrap">
        <ReviewStars
          :rating="aggregate.average"
          size="lg"
        />
        <span class="review-summary__total">{{ aggregate.total }} reviews</span>
      </div>
    </div>

    <div
      v-if="showDistribution"
      class="review-summary__distribution"
    >
      <div
        v-for="bar in bars"
        :key="bar.star"
        class="review-summary__row"
      >
        <span class="review-summary__row-label">{{ bar.star }}</span>
        <div class="review-summary__track">
          <div
            class="review-summary__fill"
            :style="{ width: `${bar.percent}%` }"
          />
        </div>
        <span class="review-summary__row-count">{{ bar.count }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-summary {
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
}
.review-summary__title {
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem;
  font-size: 1rem;
}
.review-summary__score {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.review-summary__average {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
  color: #111827;
}
.review-summary__stars-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.review-summary__total {
  font-size: 0.8125rem;
  color: #9ca3af;
}
.review-summary__distribution {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.review-summary__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}
.review-summary__row-label {
  width: 0.75rem;
  text-align: right;
  color: #4b5563;
  font-weight: 500;
  flex-shrink: 0;
}
.review-summary__track {
  flex: 1;
  height: 0.5rem;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}
.review-summary__fill {
  height: 100%;
  background: #f59e0b;
  border-radius: 999px;
  transition: width 0.3s ease;
}
.review-summary__row-count {
  width: 1.75rem;
  color: #9ca3af;
  text-align: right;
  flex-shrink: 0;
}
</style>
