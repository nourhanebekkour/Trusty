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

<script>
const icons = {
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="100%" height="100%">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>`,
}

export default {
  name: 'ProjetStatsCards',
  props: {
    stats: { type: Object, required: true },
  },
  computed: {
    items() {
      const s = this.stats
      return [
        { label: 'TOTAL PROJETS', value: s.total,             color: 'var(--color-accent)',     icon: icons.list  },
        { label: 'VALIDÉS',       value: s.valides,           color: 'var(--color-valid-text)', icon: icons.check },
        { label: 'EN ATTENTE',    value: s.enAttente,         color: 'var(--color-waiting-text)', icon: icons.clock },
        { label: 'AVEC LIENS',    value: s.avecRapport || 0,  color: 'var(--color-purple-text)', icon: icons.link  },
      ]
    },
  },
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  transition: border-color 0.2s, transform 0.2s;
}

.stat-card:hover {
  border-color: var(--color-accent-border);
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
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  font-family: 'DM Mono', monospace;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
