<template>
  <div class="stages-page">

    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>Gestion des Stages</h1>
        <p>Suivez vos expériences professionnelles et gérez vos demandes de validation.</p>
      </div>
      <button class="btn-new" @click="store.openModal('create')">
        <span>＋</span> Nouveau stage
      </button>
    </div>

    <!-- Stats -->
    <StageStats :stats="store.stats" />

    <!-- Tableau -->
    <StageTable @voir="voirStage" />

    <!-- Grille inférieure -->
    <StageBottomGrid @download="downloadResource" />

    <!-- Modal création / édition -->
    <StageModal />

    <!-- Toast -->
    <Teleport to="body">
      <div v-if="store.toast.show" class="toast" :class="'toast--' + store.toast.type">
        {{ store.toast.message }}
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useStageStore } from '@/stores/stageStore'

import StageStats      from '@/components/stages/StageStats.vue'
import StageTable      from '@/components/stages/StageTable.vue'
import StageModal      from '@/components/stages/StageModal.vue'
import StageBottomGrid from '@/components/stages/StageBottomGrid.vue'

const store = useStageStore()

function voirStage(stage) {
  // router.push(`/stages/${stage.id_stage}`)
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