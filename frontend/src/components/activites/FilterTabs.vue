<template>
  <div class="filter-bar">
    <span class="filter-label">Mes activités</span>
    <div class="filter-tabs">
      <button
        v-for="f in filters"
        :key="f"
        class="filter-tab"
        :class="{ active: store.activeFilter === f }"
        @click="store.setFilter(f)"
      >
        {{ f }}
      </button>
    </div>
    <button class="sort-btn" @click="$emit('sort')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
        <line x1="4" y1="6" x2="11" y2="6"/>
        <line x1="4" y1="12" x2="17" y2="12"/>
        <line x1="4" y1="18" x2="23" y2="18"/>
      </svg>
      Trier par date
    </button>
  </div>
</template>

<script setup>
import { useActivitesStore } from '../../stores/activitesStore.js';

defineEmits(['sort']);

const store = useActivitesStore();
const filters = ['Toutes', 'Club', 'Événement', 'Hackathon', 'Compétition', 'Engagement'];
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.filter-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.filter-tabs {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.filter-tab:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.filter-tab.active {
  background: var(--color-accent-light);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.sort-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: transparent;
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  color: var(--color-text-tertiary);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: var(--color-border);
  color: var(--color-text-primary);
}
</style>
