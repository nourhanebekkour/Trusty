<template>
  <div class="stages-page">

    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>Gestion des Stages</h1>
        <p>Suivez vos expériences professionnelles et gérez vos demandes de validation.</p>
      </div>
      <button class="btn-new" @click="openNewModal">
        <span>＋</span> Nouveau stage
      </button>
    </div>

    <!-- Stats -->
    <StageStats :stats="store.stats" />

    <!-- Tableau -->
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
@import '@/assets/StageList.css';
</style>
