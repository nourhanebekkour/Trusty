<template>
  <div class="professional-page">

    

    <!-- Stats -->
    <ProfessionalStats
      :candidats-en-attente="store.candidatsEnAttente"
      :total-recs="store.totalRecs"
      :consultes="store.consultes"
      :favoris-count="store.favoris.length"
    />

    <!-- Colonnes -->
    <div class="columns">
      <!-- Gauche -->
      <div class="left-col">
        <ProfessionalCandidates
          :candidats="store.candidats"
          :selected-id="selectedId"
          :recs-emises="store.recsEmises"
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

import ProfessionalTopbar        from '@/components/Professional/ProfessionalTopbar.vue'
import ProfessionalStats         from '@/components/Professional/ProfessionalStats.vue'
import ProfessionalCandidates    from '@/components/Professional/ProfessionalCandidates.vue'
import RecommendationForm        from '@/components/Professional/RecommendationForm.vue'
import FavoriteCandidates        from '@/components/Professional/FavoriteCandidates.vue'
import RecommendationsList       from '@/components/Professional/RecommendationsList.vue'
import ProfessionalNotifications from '@/components/Professional/ProfessionalNotifications.vue'

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

function handleEnvoyer({ texte, type }) {
  store.envoyerRecommandation(selectedCandidat.value, texte, type)
  selectedCandidat.value = null
  selectedId.value       = null
}

function handleFermer() {
  selectedCandidat.value = null
  selectedId.value       = null
}
</script>