<template>
  <div class="stats-row">
    <div class="stat-card active">
      <div class="stat-label">Candidats disponibles</div>
      <div class="stat-value">{{ candidatsEnAttente }}</div>
      <div class="stat-sub"><span class="dot warn"></span>issus des APIs stages/projets</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Recommandations emises</div>
      <div class="stat-value">{{ totalRecs }}</div>
      <div class="stat-sub"><span class="dot ok"></span>session courante</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Profils consultes</div>
      <div class="stat-value">{{ consultes }}</div>
      <div class="stat-sub"><span class="dot blue"></span>local uniquement</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Favoris</div>
      <div class="stat-value">{{ favorisCount }}</div>
      <div class="stat-sub"><span class="dot pink"></span>non synchronises backend</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  candidatsEnAttente: { type: Number, default: 0 },
  totalRecs: { type: Number, default: 0 },
  consultes: { type: Number, default: 0 },
  favorisCount: { type: Number, default: 0 },
})
</script>
