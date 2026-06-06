<template>
  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-card-value">{{ enAttente }}</div>
      <div class="stat-card-label">En attente</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-value">{{ valides }}</div>
      <div class="stat-card-label">Validés</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-value">{{ etudiantsSuivis }}</div>
      <div class="stat-card-label">Étudiants suivis</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-value">{{ stagesEnCours }}</div>
      <div class="stat-card-label">Stages en cours</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  enAttente:       { type: Number, default: 0 },
  valides:         { type: Number, default: 0 },
  etudiantsSuivis: { type: Number, default: 0 },
  stagesEnCours:   { type: Number, default: 0 },
})
</script>
