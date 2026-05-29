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
    <StageTable @voir="voirStage" @edit="openEditModal" />

    <!-- Grille inférieure -->
    <StageBottomGrid @download="downloadResource" />

    <!-- Modal création / édition -->
    <StageModal
      v-model="showModal"
      :edit-mode="editMode"
      :initial-form="form"
      :etudiant-id="etudiantId"
      :stage-id="editStageId"
      @created="handleCreated"
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

import StageStats      from '@/components/stages/StageStats.vue'
import StageTable      from '@/components/stages/StageTable.vue'
import StageModal      from '@/components/stages/StageModal.vue'
import StageBottomGrid from '@/components/stages/StageBottomGrid.vue'

const store      = useStageStore()
const authStore  = useAuthStore()

// Modal state (local, props/events pattern)
const showModal   = ref(false)
const editMode    = ref(false)
const form        = ref(emptyForm())
const editStageId = ref(null)

const etudiantId = computed(() => authStore.user?.id_utilisateur ?? null)

function openNewModal() {
  editMode.value    = false
  editStageId.value = null
  form.value        = emptyForm()
  showModal.value   = true
}

function openEditModal(stage) {
  editMode.value    = true
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
  }
  showModal.value = true
}

function handleCreated(stageId) {
  store.showToast('Stage créé avec succès !')
  store.chargerStages()
}

function voirStage(stage) {
  alert(`Détail stage : ${stage.entreprise} — ${stage.poste}`)
}

function downloadResource(type) {
  store.showToast(`Téléchargement de "${type}" en cours...`)
}

onMounted(() => store.init())
</script>

<style scoped>
@import '@/assets/StageList.css';
</style>
