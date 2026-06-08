<template>
  <div class="card stats-card">
    <p class="stats-label">STATISTIQUES D'ACTIVITÉ</p>
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-number">{{ totalProjets }}</span>
        <span class="stat-desc">Projets</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ projetsValides }}</span>
        <span class="stat-desc">Validés</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ totalCompetences }}</span>
        <span class="stat-desc">Compétences</span>
      </div>
      <div class="stat-box">
        <span class="stat-number">{{ totalBadges }}</span>
        <span class="stat-desc">Badges</span>
      </div>
    </div>

    <!-- Score de crédibilité -->
    <div class="credibility-row" v-if="user.etudiant">
      <div class="cred-label">
        <span>Score de crédibilité</span>
        <span class="cred-niveau" :class="`niveau-${niveauClass}`">
          {{ user.etudiant.niveau_credibilite ?? 'DEBUTANT' }}
        </span>
      </div>
      <div class="cred-bar">
        <div class="cred-fill" :style="{ width: scorePercent + '%' }"></div>
      </div>
      <span class="cred-score">{{ user.etudiant.score_credibilite ?? 0 }} pts</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ user: Object })

const totalProjets = computed(() =>
  props.user.etudiant?.participations_projets?.length ?? 0
)

const projetsValides = computed(() =>
  props.user.etudiant?.participations_projets?.filter(
    (pp) => (pp.projet?.status_validation ?? pp.status_validation) === 'VALIDE'
  ).length ?? 0
)

const totalCompetences = computed(() =>
  props.user.etudiant?.competences?.length ?? 0
)

const totalBadges = computed(() =>
  props.user.etudiant?.badges?.length ?? 0
)

// Score crédibilité : normalisé sur 100 (le score max est arbitraire, ex 500)
const SCORE_MAX = 500
const scorePercent = computed(() => {
  const score = props.user.etudiant?.score_credibilite ?? 0
  return Math.min(Math.round((score / SCORE_MAX) * 100), 100)
})

const niveauClass = computed(() => {
  const n = props.user.etudiant?.niveau_credibilite ?? 'DEBUTANT'
  return n.toLowerCase()
})
</script>

<style scoped>
@import '@/assets/profile.css';

.credibility-row {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border, #f0f0f0);
}

.cred-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-secondary, #888);
  margin-bottom: 6px;
}

.cred-niveau {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.niveau-debutant    { background: #fef3c7; color: #92400e; }
.niveau-intermediaire { background: #dbeafe; color: #1e40af; }
.niveau-avance      { background: #d1fae5; color: #065f46; }
.niveau-expert      { background: #ede9fe; color: #4c1d95; }

.cred-bar {
  height: 6px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 4px;
}

.cred-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover));
  border-radius: 10px;
  transition: width .5s ease;
}

.cred-score {
  font-size: 11px;
  color: var(--color-text-secondary, #888);
}
</style>