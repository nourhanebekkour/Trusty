<template>
  <div class="step-card-wrapper" :ref="(el) => { if (el) cardRef = el }" :class="{ visible: isVisible }" :style="{ transitionDelay: `${index * 0.12}s` }">
    <div class="step-number">{{ step }}</div>
    <GlassCard class="step-card" hover>
      <h3 class="step-title">{{ title }}</h3>
      <p class="step-desc">{{ desc }}</p>
    </GlassCard>
  </div>
</template>

<script setup>
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import GlassCard from './GlassCard.vue'

defineProps({
  step: Number,
  title: String,
  desc: String,
  index: { type: Number, default: 0 }
})

const { el: cardRef, isVisible } = useIntersectionObserver()
</script>

<style scoped>
.step-card-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.step-card-wrapper.visible {
  opacity: 1;
  transform: translateX(0);
}

.step-number {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 50%;
  background: var(--landing-surface);
  border: 1px solid var(--landing-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--landing-accent);
  box-shadow: 0 0 20px var(--landing-glow);
}

.step-card {
  flex: 1;
  padding: 20px 24px;
}

.step-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--landing-text);
  margin-bottom: 6px;
}

.step-desc {
  font-size: 0.84rem;
  color: var(--landing-text-secondary);
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .step-card-wrapper {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
