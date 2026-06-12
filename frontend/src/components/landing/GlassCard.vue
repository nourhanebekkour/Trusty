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
  position: relative;
  overflow: hidden;
  background: var(--landing-surface);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid var(--landing-border);
  border-radius: 20px;
  box-shadow:
    0 8px 32px var(--landing-shadow-soft),
    inset 0 1px 0 rgba(255,255,255,0.05);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}

.glass-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(145deg, var(--landing-highlight), transparent 32%);
  opacity: 0.7;
}

.glass-card::after {
  content: '';
  position: absolute;
  top: -80%;
  left: -45%;
  width: 35%;
  height: 240%;
  pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  transform: rotate(20deg);
  transition: left 0.7s ease;
}

.glass-card--hoverable:hover {
  transform: translateY(-6px);
  border-color: var(--landing-accent-border);
  box-shadow:
    0 16px 48px var(--landing-shadow-hover),
    0 0 30px var(--landing-glow),
    inset 0 1px 0 rgba(255,255,255,0.08);
}

.glass-card--hoverable:hover::after {
  left: 120%;
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
