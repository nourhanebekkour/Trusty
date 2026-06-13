<template>
  <div class="stat-card" :class="{ 'stat-card--highlight': highlight }">
    <div class="stat-card__top">
      <span class="stat-card__label">{{ label }}</span>
      <span class="stat-card__icon">
        <slot name="icon" />
      </span>
    </div>
    <div class="stat-card__value">{{ value }}</div>
    <div v-if="sub" class="stat-card__sub">{{ sub }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  label:     { type: String, required: true },
  value:     { type: [String, Number], required: true },
  sub:       { type: String, default: null },
  highlight: { type: Boolean, default: false },
})
</script>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  flex: 1 1 180px;
  min-width: 180px;
}
.stat-card--highlight {
  background: var(--color-surface);
  border-color: var(--color-border);
}
.stat-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.stat-card__label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}
.stat-card__icon {
  color: var(--color-text-tertiary);
}
.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: 4px;
}
.stat-card__sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}
</style>