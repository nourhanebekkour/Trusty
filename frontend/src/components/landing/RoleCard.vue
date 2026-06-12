<template>
  <div class="role-card-wrapper" :ref="(el) => { if (el) cardRef = el }" :class="{ visible: isVisible }">
    <GlassCard class="role-card" hover>
      <div class="role-icon"><AppIcon :name="icon" :size="38" :stroke-width="1.7" /></div>
      <h3 class="role-title">{{ title }}</h3>
      <p class="role-desc">{{ desc }}</p>
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
.role-card-wrapper {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0s;
}

.role-card-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.role-card {
  text-align: center;
  padding: 32px 24px;
}

.role-icon {
  margin-bottom: 16px;
  color: var(--landing-accent);
  filter: drop-shadow(0 0 12px var(--landing-glow));
}

.role-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--landing-text);
  margin-bottom: 10px;
}

.role-desc {
  font-size: 0.88rem;
  color: var(--landing-text-secondary);
  line-height: 1.6;
}
</style>
