<template>
  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="logo">Trusty<span>.io</span></div>

      <p class="nav-label">Principal</p>
      <div class="nav-item"><i class="ti ti-layout-dashboard"></i> Tableau de bord</div>
      <div class="nav-item active"><i class="ti ti-users-group"></i> Explorer <span class="badge">24</span></div>
      <div class="nav-item"><i class="ti ti-bookmark"></i> Favoris <span class="badge">5</span></div>

      <p class="nav-label">Recommandations</p>
      <div class="nav-item"><i class="ti ti-message-star"></i> Mes recommandations <span class="badge">{{ store.totalRecs }}</span></div>
      <div class="nav-item"><i class="ti ti-history"></i> Historique</div>

      <p class="nav-label">Gestion</p>
      <div class="nav-item"><i class="ti ti-bell"></i> Notifications <span class="badge">3</span></div>
      <div class="nav-item"><i class="ti ti-settings"></i> Paramètres</div>

      <div class="sidebar-footer">
        <div class="avatar-sm">DT</div>
        <div>
          <div class="prof-name">DataTech SAS</div>
          <div class="prof-dept">Professionnel vérifié</div>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="main">
      <!-- Topbar -->
      <ProfessionalTopbar />

      <!-- Stats -->
      <ProfessionalStats
        :candidats-en-attente="store.candidatsEnAttente"
        :total-recs="store.totalRecs"
        :consultes="store.statsActivite.consultes"
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
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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