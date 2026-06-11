<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Stages
        </h1>
        <p>Consultez les stages liés à votre entreprise.</p>
      </div>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement des stages...</span>
    </div>

    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadData">Réessayer</button>
    </div>

    <div v-else-if="internships.length === 0" class="prof-empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <p class="empty-title">Aucun stage</p>
      <p class="empty-sub">Aucun stage trouvé pour le moment.</p>
    </div>

    <div v-else class="prof-card-grid">
      <div v-for="s in internships" :key="s.id" class="prof-info-card">
        <h3>{{ s.poste || s.titre || s.title || 'Stage' }}</h3>
        <p><strong>Entreprise :</strong> {{ s.entreprise || s.company || '—' }}</p>
        <p><strong>Étudiant :</strong> {{ s.etudiant?.utilisateur ? `${s.etudiant.utilisateur.prenom || ''} ${s.etudiant.utilisateur.nom || ''}`.trim() : s.etudiant?.prenom ? `${s.etudiant.prenom || ''} ${s.etudiant.nom || ''}`.trim() : '—' }}</p>
        <p><strong>Période :</strong> {{ formatDate(s.date_debut) }} - {{ formatDate(s.date_fin) }}</p>
        <span class="status-pill" :class="statusClass(s.status_validation || s.status)">{{ statusLabel(s.status_validation || s.status) }}</span>
      </div>
    </div>

    <p class="lecture-only">Lecture seule — La validation officielle est réservée aux utilisateurs académiques.</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getProfessionalInternships } from '@/services/professionalApi'

const internships = ref([])
const loading = ref(false)
const error = ref(null)

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function statusClass(status) {
  const s = (status || '').toUpperCase()
  if (s === 'VALIDE' || s === 'VALIDATED') return 'pill-valide'
  if (s === 'EN_ATTENTE' || s === 'PENDING') return 'pill-pending'
  if (s === 'REJETE' || s === 'REJECTED') return 'pill-refus'
  return ''
}
function statusLabel(status) {
  const map = { VALIDE: 'Validé', VALIDATED: 'Validé', EN_ATTENTE: 'En attente', PENDING: 'En attente', REJETE: 'Rejeté', REJECTED: 'Rejeté' }
  return map[(status || '').toUpperCase()] || status || '—'
}

async function loadData() {
  loading.value = true
  error.value = null
  try {
    internships.value = await getProfessionalInternships()
  } catch {
    error.value = 'Impossible de charger les stages.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.status-pill {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 9px;
  border-radius: 999px;
}
.pill-valide { background: var(--color-valid-bg, #E6F7E4); color: var(--color-valid-text, #358C2C); }
.pill-pending { background: var(--color-waiting-bg, #FFF4D8); color: var(--color-waiting-text, #A96F00); }
.pill-refus { background: color-mix(in srgb, var(--color-danger, #D94A4A) 12%, transparent); color: var(--color-danger, #D94A4A); }
.lecture-only {
  margin-top: 18px;
  font-size: 12px;
  color: var(--color-text-secondary, #6B7280);
  text-align: center;
  font-style: italic;
}
</style>
