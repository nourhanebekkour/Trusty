<template>
  <div class="glass-card" :class="[size, hover && 'glass-card--hoverable']" :style="cardStyle">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: String,
    default: 'md',
    validator: v => ['sm', 'md', 'lg'].includes(v)
  },
  hover: {
    type: Boolean,
    default: true
  },
  glow: {
    type: Boolean,
    default: false
  }
})

const cardStyle = {}
</script>

<style scoped>
.glass-card {
  background: var(--landing-surface);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--landing-border);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.05);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}

.glass-card--hoverable:hover {
  transform: translateY(-6px);
  border-color: var(--landing-accent-border);
  box-shadow:
    0 16px 48px rgba(0,0,0,0.3),
    0 0 30px var(--landing-glow),
    inset 0 1px 0 rgba(255,255,255,0.08);
}

.glass-card.sm {
  padding: 16px;
  border-radius: 16px;
}

.glass-card.md {
  padding: 24px;
  border-radius: 20px;
}

.glass-card.lg {
  padding: 32px;
  border-radius: 24px;
}
</style>
