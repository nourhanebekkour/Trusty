<template>
  <div class="stats-grid">
    <div class="stat-card" v-for="s in items" :key="s.label">
      <div class="stat-icon" :style="{ color: s.color }" v-html="s.icon"></div>
      <div class="stat-info">
        <span class="stat-label">{{ s.label }}</span>
        <span class="stat-value">{{ s.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const icons = {
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`,
}

const props = defineProps({
  stats: { type: Object, required: true },
})

const items = computed(() => [
  { label: 'TOTAL DES STAGES', value: props.stats.total,            color: '#D6EDE8', icon: icons.list  },
  { label: 'STAGES VALIDÉS',   value: props.stats.valides,          color: '#5C8C6A', icon: icons.check },
  { label: 'EN ATTENTE',       value: props.stats.enAttente,        color: '#e8a04a', icon: icons.clock },
  { label: 'AVEC RAPPORT',     value: props.stats.avecRapport || 0, color: '#9b8ec4', icon: icons.star  },
])
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: #1A3838;
  border: 1px solid rgba(214, 237, 232, 0.08);
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  transition: border-color 0.2s, transform 0.2s;
}

.stat-card:hover {
  border-color: rgba(214, 237, 232, 0.2);
  transform: translateY(-1px);
}

.stat-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.stat-label {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #5C8C6A;
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #D6EDE8;
  line-height: 1;
  font-family: 'DM Mono', monospace;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
