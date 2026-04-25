<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}>(), {
  max: 5,
  size: 'md',
})

const stars = computed(() =>
  Array.from({ length: props.max }, (_, i) => {
    const pos = i + 1
    if (props.rating >= pos) return 'full'
    if (props.rating >= pos - 0.5) return 'half'
    return 'empty'
  }),
)
</script>

<template>
  <span
    class="review-stars"
    :class="`review-stars--${size}`"
    role="img"
    :aria-label="`${rating} out of ${max} stars`"
  >
    <span
      v-for="(type, i) in stars"
      :key="i"
      class="review-star"
    >
      <svg
        v-if="type === 'full'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
      <svg
        v-else-if="type === 'half'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 17.27V2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
        <path
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
        />
      </svg>
    </span>
  </span>
</template>

<style scoped>
.review-stars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #f59e0b;
}
.review-star {
  display: inline-flex;
}
.review-star svg {
  display: block;
}
.review-stars--sm .review-star svg { width: 14px; height: 14px; }
.review-stars--md .review-star svg { width: 20px; height: 20px; }
.review-stars--lg .review-star svg { width: 28px; height: 28px; }
</style>
