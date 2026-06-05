<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Activités Parascolaires</h1>
          <p class="page-subtitle">Gérez vos engagements extracurriculaires et validations</p>
        </div>
      </div>
      <button class="add-btn" @click="openModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Ajouter une activité
      </button>
    </div>

    <!-- Stats -->
    <StatsCards />

    <!-- Filters -->
    <FilterTabs @sort="toggleSort" />

    <!-- Loading -->
    <div v-if="store.loading" class="loading-state">
      <div class="spinner"></div>
      <span>Chargement...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.filteredActivites.length" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>Aucune activité trouvée</p>
      <button class="add-btn-sm" @click="openModal()">Ajouter une activité</button>
    </div>

    <!-- Activités list -->
    <div v-else class="activites-list">
      <ActiviteCard
        v-for="activite in sortedActivites"
        :key="activite.id"
        :activite="activite"
        @edit="openModal"
        @delete-attestation="store.removeAttestation"
      />
    </div>

    <!-- Modal -->
    <ActiviteModal
      v-if="showModal"
      :activite="editingActivite"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import StatsCards from '@/components/activites/StatsCards.vue'
import FilterTabs from '@/components/activites/FilterTabs.vue'
import ActiviteCard from '@/components/activites/ActiviteCard.vue'
import ActiviteModal from '@/components/activites/ActiviteModal.vue'

import { useActivitesStore } from '../../stores/activitesStore.js'
const store = useActivitesStore();

const showModal = ref(false);
const editingActivite = ref(null);
const sortAsc = ref(false);

const sortedActivites = computed(() => {
  return [...store.filteredActivites].sort((a, b) => {
    const da = new Date(a.date_debut);
    const db = new Date(b.date_debut);
    return sortAsc.value ? da - db : db - da;
  });
});

function openModal(activite = null) {
  editingActivite.value = activite;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingActivite.value = null;
}

async function handleSubmit(data) {
  if (editingActivite.value) {
    await store.updateActivite(editingActivite.value.id, data);
  } else {
    await store.addActivite(data);
  }
  closeModal();
}

function toggleSort() {
  sortAsc.value = !sortAsc.value;
}

onMounted(() => store.fetchActivites());
</script>

<style scoped>
.page-wrapper {
  max-width: 100%;
  margin: 0;
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.header-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(92, 140, 106, 0.2);
  border: 1px solid rgba(92, 140, 106, 0.3);
  border-radius: 10px;
  color: #5C8C6A;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #D6EDE8;
  margin: 0 0 0.15rem;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 0.78rem;
  color: rgba(214, 237, 232, 0.4);
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  background: linear-gradient(135deg, #5C8C6A, #3d6b50);
  border: none;
  border-radius: 10px;
  color: #D6EDE8;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-btn:hover {
  background: linear-gradient(135deg, #6a9d78, #4a7a5d);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(92, 140, 106, 0.3);
}

.activites-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
  color: rgba(214, 237, 232, 0.4);
  font-size: 0.85rem;
}

.spinner {
  width: 36px; height: 36px;
  border: 2px solid rgba(214, 237, 232, 0.1);
  border-top-color: #5C8C6A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  color: rgba(214, 237, 232, 0.25);
  text-align: center;
}

.empty-state p { font-size: 0.9rem; margin: 0; }

.add-btn-sm {
  padding: 0.5rem 1.2rem;
  border-radius: 9px;
  background: rgba(92, 140, 106, 0.2);
  border: 1px solid rgba(92, 140, 106, 0.3);
  color: #5C8C6A;
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn-sm:hover { background: rgba(92, 140, 106, 0.3); }
</style>
