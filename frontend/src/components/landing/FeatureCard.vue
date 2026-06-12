<template>
  <div class="feature-card-wrapper" :ref="(el) => { if (el) cardRef = el }" :class="{ visible: isVisible }" :style="{ transitionDelay: `${index * 0.08}s` }">
    <GlassCard class="feature-card" hover>
      <div class="feature-icon">{{ icon }}</div>
      <h3 class="feature-title">{{ title }}</h3>
      <p class="feature-desc">{{ desc }}</p>
    </GlassCard>
  </div>
</template>

<script setup>
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import GlassCard from './GlassCard.vue'

defineProps({
  icon: String,
  title: String,
  desc: String,
  index: { type: Number, default: 0 }
})

const { el: cardRef, isVisible } = useIntersectionObserver()
</script>

<style scoped>
.feature-card-wrapper {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.feature-card-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.feature-card {
  padding: 24px;
}

.feature-icon {
  font-size: 1.6rem;
  margin-bottom: 14px;
}

.feature-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--landing-text);
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 0.84rem;
  color: var(--landing-text-secondary);
  line-height: 1.6;
}
</style>
