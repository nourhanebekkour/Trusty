<template>
  <div class="professional-page">

    <!-- Topbar -->
    <ProfessionalTopbar />

    <!-- Stats -->
    <ProfessionalStats
      :candidats-en-attente="store.candidatsEnAttente"
      :total-recs="store.totalRecs"
      :consultes="store.consultes"
      :favoris-count="store.favoris.length"
    />

    <div v-if="store.erreur" class="professional-alert">
      {{ store.erreur }}
    </div>

    <!-- Colonnes -->
    <div class="columns">
      <!-- Gauche -->
      <div class="left-col">
        <ProfessionalCandidates
          :candidats="store.candidats"
          :selected-id="selectedId"
          :recs-emises="store.recsEmises"
          :loading="store.loading.candidats"
          @select="handleSelect"
          @ouvrir-formulaire="handleOuvrirFormulaire"
        />

        <RecommendationForm
          :candidat="selectedCandidat"
          @envoyer="handleEnvoyer"
          @fermer="handleFermer"
        />
      </div>

      <!-- Droite -->
      <div class="right-col">
        <FavoriteCandidates
          :candidats="store.candidatsFavoris"
          @select="handleSelect"
        />

        <RecommendationsList :recs="store.recsEmises" />

        <ProfessionalNotifications :notifications="store.notifications" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProfessionalStore } from '@/stores/professionalStore'

import ProfessionalTopbar       from '@/components/professional/ProfessionalTopbar.vue'
import ProfessionalStats        from '@/components/professional/ProfessionalStats.vue'
import ProfessionalCandidates   from '@/components/professional/ProfessionalCandidates.vue'
import RecommendationForm       from '@/components/professional/RecommendationForm.vue'
import FavoriteCandidates       from '@/components/professional/FavoriteCandidates.vue'
import RecommendationsList      from '@/components/professional/RecommendationsList.vue'
import ProfessionalNotifications from '@/components/professional/ProfessionalNotifications.vue'

import '@/assets/professional.css'

const store = useProfessionalStore()

onMounted(() => store.init())

const selectedId       = ref(null)
const selectedCandidat = ref(null)

function handleSelect(candidat) {
  selectedId.value       = candidat.id
  selectedCandidat.value = candidat
  store.incrementerConsultes()
}

function handleOuvrirFormulaire(candidat) {
  selectedId.value       = candidat.id
  selectedCandidat.value = candidat
}

async function handleEnvoyer({ texte, type }) {
  await store.envoyerRecommandation(selectedCandidat.value, texte, type)
  selectedCandidat.value = null
  selectedId.value       = null
}

function handleFermer() {
  selectedCandidat.value = null
  selectedId.value       = null
}
</script>
