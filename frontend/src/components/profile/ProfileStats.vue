<template>
  <div class="card stats-card">
    <p class="stats-label">STATISTIQUES D'ACTIVITÉ</p>
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-number">{{ totalProjets }}</span>
        <span class="stat-desc">Projets Validés</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ totalBadges }}</span>
        <span class="stat-desc">Badges</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ user: Object })

const totalProjets = computed(() =>
  props.user?.etudiant?.participations_projets?.length ?? 0
)

const totalBadges = computed(() =>
  props.user?.etudiant?.badges?.length ?? 0
)
</script>

<style scoped>
@import '@/assets/profile.css';
</style>
