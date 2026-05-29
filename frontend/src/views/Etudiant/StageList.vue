<template>
  <div class="stages-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Gestion des stages</h1>
          <p class="page-subtitle">Suivez vos expériences professionnelles et gérez vos demandes de validation</p>
        </div>
      </div>
      <button class="add-btn" @click="openNewModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nouveau stage
      </button>
    </div>

    <!-- Stats -->
    <StageStats :stats="store.stats" />

    <!-- Liste des expériences -->
    <StageTable @voir="voirStage" @edit="openEditModal" @delete="confirmDeleteStage" />

    <!-- Grille inférieure -->
    <StageBottomGrid @download="downloadResource" />

    <!-- Modal création / édition -->
    <StageModal
      v-model="showModal"
      :edit-mode="editMode"
      :view-mode="viewMode"
      :initial-form="form"
      :etudiant-id="etudiantId"
      :stage-id="editStageId"
      @created="handleCreated"
      @updated="handleUpdated"
    />

    <!-- Modal détail (lecture seule) -->
    <StageDetailModal
      v-model="showDetailModal"
      :stage-id="detailStageId"
      @edit="openEditModal"
    />

    <!-- Confirmation suppression -->
    <ConfirmModal
      v-model="showConfirm"
      title="Supprimer ce stage ?"
      :message="`Le stage chez « ${stageToDelete?.entreprise || ''} » sera définitivement supprimé. Cette action est irréversible.`"
      confirm-text="Oui, supprimer"
      @confirm="handleDeleteConfirmed"
    />

    <!-- Toast -->
    <Teleport to="body">
      <div v-if="store.toast.show" class="toast" :class="'toast--' + store.toast.type">
        {{ store.toast.message }}
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStageStore } from '@/stores/stageStore'
import { useAuthStore } from '@/stores/authstore'
import { emptyForm } from '@/components/stages/stageHelpers'
import { supprimerStage } from '@/services/stageService'

import StageStats        from '@/components/stages/StageStats.vue'
import StageTable        from '@/components/stages/StageTable.vue'
import StageModal        from '@/components/stages/StageModal.vue'
import StageDetailModal  from '@/components/stages/StageDetailModal.vue'
import ConfirmModal      from '@/components/stages/ConfirmModal.vue'
import StageBottomGrid   from '@/components/stages/StageBottomGrid.vue'

const store      = useStageStore()
const authStore  = useAuthStore()

// Modal state (local, props/events pattern)
const showModal       = ref(false)
const editMode        = ref(false)
const viewMode        = ref(false)
const form            = ref(emptyForm())
const editStageId     = ref(null)

// Detail modal state
const showDetailModal = ref(false)
const detailStageId   = ref(null)

// Confirm delete state
const showConfirm     = ref(false)
const stageToDelete   = ref(null)
const deleteLoading   = ref(false)

const etudiantId = computed(() => authStore.user?.id_utilisateur ?? null)

function openNewModal() {
  editMode.value    = false
  viewMode.value    = false
  editStageId.value = null
  form.value        = emptyForm()
  showModal.value   = true
}

function openEditModal(stage) {
  editMode.value    = true
  viewMode.value    = false
  editStageId.value = stage.id_stage
  form.value = {
    entreprise:              stage.entreprise ?? '',
    poste:                   stage.poste ?? '',
    adresse_entreprise:      stage.adresse_entreprise ?? '',
    date_debut:              stage.date_debut?.slice(0, 10) ?? '',
    date_fin:                stage.date_fin?.slice(0, 10) ?? '',
    duree_semaines:          stage.duree_semaines ?? null,
    missions:                stage.missions ?? '',
    encadrant_professionnel: stage.encadrant_professionnel ?? '',
    encadrant_academique:    stage.encadrant_academique ?? '',
    id_validateur:           stage.id_validateur ?? null,
    est_public:              stage.est_public ?? true,
    technologies:            stage.technologies?.map(t => ({
      id_technologie:     t.id_technologie,
      nom:                t.nom ?? t.technologie?.nom ?? '',
      categorie:          t.categorie ?? t.technologie?.categorie ?? '',
      sous_categorie:     t.sous_categorie ?? t.technologie?.sous_categorie ?? '',
      version:            t.version ?? '',
      niveau_utilisation: t.niveau_utilisation ?? 'INTERMEDIAIRE',
    })) ?? [],
  }
  showModal.value = true
}

function handleCreated(stageId) {
  store.showToast('Stage créé avec succès !')
  store.chargerStages()
}

function handleUpdated(stageId) {
  store.showToast('Stage modifié avec succès !')
  store.chargerStages()
}

function voirStage(stage) {
  detailStageId.value = stage.id_stage
  showDetailModal.value = true
}

function confirmDeleteStage(stage) {
  stageToDelete.value = stage
  showConfirm.value = true
}

async function handleDeleteConfirmed() {
  const stage = stageToDelete.value
  if (!stage) return
  deleteLoading.value = true
  try {
    await supprimerStage(stage.id_stage)
    store.chargerStages()
    store.showToast('Stage supprimé.')
  } catch (e) {
    store.showToast(e?.response?.data?.message || e.message, 'error')
  } finally {
    deleteLoading.value = false
    stageToDelete.value = null
  }
}

function downloadResource(type) {
  store.showToast(`Téléchargement de "${type}" en cours...`)
}

onMounted(() => store.init())
</script>

<style scoped>
.stages-page {
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
  background: rgba(214, 237, 232, 0.12);
  border: 1px solid rgba(214, 237, 232, 0.15);
  border-radius: 10px;
  color: #D6EDE8;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #D6EDE8;
  margin: 0 0 0.15rem;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #7a9e8e;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  background: #1D9E75;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-btn:hover {
  background: #24b88a;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(29, 158, 117, 0.3);
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  animation: fadeUp 0.25s ease;
  z-index: 2000;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
}
.toast--success { background: #1D9E75; color: #fff; }
.toast--error   { background: #b94040; color: #fff; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
