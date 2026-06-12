<template>
  <div class="stats-row">
    <div class="stat-card active">
      <div class="stat-label">En attente</div>
      <div class="stat-value">{{ candidatsEnAttente }}</div>
      <div class="stat-sub"><span class="dot warn"></span>Nécessitent attention</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Recommandations émises</div>
      <div class="stat-value">{{ totalRecs }}</div>
      <div class="stat-sub"><span class="dot ok"></span>Ce mois</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Portfolios consultés</div>
      <div class="stat-value">{{ consultes }}</div>
      <div class="stat-sub"><span class="dot blue"></span>Actifs</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Favoris sauvés</div>
      <div class="stat-value">{{ favorisCount }}</div>
      <div class="stat-sub"><span class="dot pink"></span>En suivi</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  candidatsEnAttente: { type: Number, default: 0 },
  totalRecs:          { type: Number, default: 0 },
  consultes:          { type: Number, default: 0 },
  favorisCount:       { type: Number, default: 0 },
})
</script>