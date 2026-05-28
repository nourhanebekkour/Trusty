<template>
  <div class="stats-grid">
    <div class="stat-card" v-for="stat in stats" :key="stat.label">
      <div class="stat-icon" :style="{ color: stat.color }">
        <component :is="stat.icon" />
      </div>
      <div class="stat-info">
        <span class="stat-label">{{ stat.label }}</span>
        <span class="stat-value">{{ stat.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useActivitesStore } from '../../stores/activitesStore.js';

const store = useActivitesStore();

const IconList = { template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>` };
const IconCheck = { template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` };
const IconClock = { template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` };
const IconStar = { template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` };

const stats = computed(() => [
  { label: 'TOTAL', value: store.totalActivites, color: '#D6EDE8', icon: IconList },
  { label: 'VALIDÉES', value: store.validees, color: '#5C8C6A', icon: IconCheck },
  { label: 'EN ATTENTE', value: store.enAttente, color: '#e8a04a', icon: IconClock },
  { label: 'AVEC ATTESTATION', value: store.avecAttestation, color: '#9b8ec4', icon: IconStar },
]);
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

.stat-icon svg {
  width: 100%;
  height: 100%;
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
