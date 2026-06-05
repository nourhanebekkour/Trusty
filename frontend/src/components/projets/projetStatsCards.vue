<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Total Projets</span>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
      </div>
      <div class="stat-value">{{ stats.total }}</div>
      <div class="stat-trend">{{ stats.total }} projet(s) au total</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Validés</span>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
      </div>
      <div class="stat-value">{{ stats.valides }}</div>
      <div class="stat-trend">
        {{ stats.total ? Math.round((stats.valides / stats.total) * 100) : 0 }}% taux de réussite
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">En attente</span>
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3"/>
          </svg>
        </div>
      </div>
      <div class="stat-value">{{ stats.enAttente }}</div>
      <div class="stat-trend">Réponse moyenne sous 48h</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjetStatsCards',
  props: {
    stats: {
      type: Object,
      required: true,
      // { total, valides, enAttente }
    },
  },
}
</script>
<style scoped>
   @import "@/assets/projet"
</style>