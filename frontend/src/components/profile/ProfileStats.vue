<template>
  <div class="card stats-card">
    <p class="stats-label">STATISTIQUES D'ACTIVITÉ</p>
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-number">{{ user.etudiant?.participations_projets?.length ?? 0 }}</span>
        <span class="stat-desc">Projets Validés</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ user.etudiant?.badges?.length ?? 0 }}</span>
        <span class="stat-desc">Badges</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ user: Object })
</script>
<style scoped>
@import '@/assets/Profile.css';
</style>