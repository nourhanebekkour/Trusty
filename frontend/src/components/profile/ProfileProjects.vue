<template>
  <div class="card">
    <div class="section-header">
      <h3>Projets Académiques</h3>
      <button class="add-btn">+ Ajouter</button>
    </div>
    <div class="project-list" v-if="user.etudiant?.participations_projets?.length">
      <div class="project-row" v-for="pp in user.etudiant.participations_projets" :key="pp.projet.id_projet">
        <div class="project-info">
          <span class="project-icon">📁</span>
          <div>
            <p class="project-title">{{ pp.projet.titre }}</p>
            <p class="project-desc">{{ pp.projet.description }}</p>
          </div>
        </div>
        <span class="status" :class="statusClass(pp.projet.status_validation)">
          {{ formatStatut(pp.projet.status_validation) }}
        </span>
      </div>
    </div>
    <p class="empty-msg" v-else>Aucun projet académique.</p>
    <button class="link-btn" @click="router.push('/projets')">
  Voir tous les projets
</button>
  </div>
</template>

<script setup>
defineProps({ user: Object })
import { useRouter } from 'vue-router'
const router = useRouter()
const formatStatut = (s) => ({ VALIDE: 'Validé', EN_ATTENTE: 'En attente', REJETE: 'Rejeté' }[s] ?? s)
const statusClass  = (s) => ({ 'status-green': s === 'VALIDE', 'status-amber': s === 'EN_ATTENTE', 'status-gray': s === 'REJETE' })
</script>
<style scoped>
@import '@/assets/profile.css';
</style>