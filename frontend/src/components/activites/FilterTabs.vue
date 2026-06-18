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
  color: #D6EDE8;
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
  border: 1px solid rgba(214, 237, 232, 0.15);
  background: transparent;
  color: rgba(214, 237, 232, 0.6);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.filter-tab:hover {
  border-color: rgba(214, 237, 232, 0.35);
  color: #D6EDE8;
}

.filter-tab.active {
  background: rgba(92, 140, 106, 0.25);
  border-color: #5C8C6A;
  color: #D6EDE8;
}

.sort-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  background: transparent;
  border: 1px solid rgba(214, 237, 232, 0.12);
  border-radius: 8px;
  color: rgba(214, 237, 232, 0.5);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: rgba(214, 237, 232, 0.25);
  color: #D6EDE8;
}
</style>
