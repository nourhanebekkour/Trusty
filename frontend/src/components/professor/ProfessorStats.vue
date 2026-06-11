<template>
  <div class="stats-grid">
    <div class="stat-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-waiting-text, #B45309)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
      <div>
        <p class="stat-card__label">En attente</p>
        <p class="stat-card__value">{{ enAttente }}</p>
      </div>
    </div>
    <div class="stat-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-valid-text, #065F46)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <div>
        <p class="stat-card__label">Validés</p>
        <p class="stat-card__value">{{ valides }}</p>
      </div>
    </div>
    <div class="stat-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent, #3D6B5E)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <div>
        <p class="stat-card__label">Étudiants suivis</p>
        <p class="stat-card__value">{{ etudiantsSuivis }}</p>
      </div>
    </div>
    <div class="stat-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-info-text, #2563eb)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
      <div>
        <p class="stat-card__label">Stages en cours</p>
        <p class="stat-card__value">{{ stagesEnCours }}</p>
      </div>
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
