<template>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-icon">📊</div>
      <div class="stat-label">Total des Stages</div>
      <div class="stat-value">{{ stats.total }}</div>
      <div class="stat-sub">Expériences enregistrées au total</div>
    </div>
    <div class="stat-card stat-card--blue">
      <div class="stat-icon">✓</div>
      <div class="stat-label">Stages Validés</div>
      <div class="stat-value">{{ stats.valides }}</div>
      <div class="stat-sub">Certifiés par un tuteur pédagogique</div>
    </div>
    <div class="stat-card stat-card--amber">
      <div class="stat-icon">⏳</div>
      <div class="stat-label">En attente</div>
      <div class="stat-value">{{ stats.enAttente }}</div>
      <div class="stat-sub">Dossiers en cours de révision</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, required: true },
})
</script>

<style scoped>
@import '@/assets/StageList.css';
</style>