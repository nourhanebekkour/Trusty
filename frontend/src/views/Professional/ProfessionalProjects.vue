<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          Projets
        </h1>
        <p>Consultez les projets des étudiants.</p>
      </div>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement des projets...</span>
    </div>

    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadData">Réessayer</button>
    </div>

    <div v-else-if="projects.length === 0" class="prof-empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      <p class="empty-title">Aucun projet</p>
      <p class="empty-sub">Aucun projet trouvé pour le moment.</p>
    </div>

    <div v-else class="prof-card-grid">
      <div v-for="p in projects" :key="p.id_projet || p.id" class="prof-info-card">
        <h3>{{ p.titre || p.title || 'Projet' }}</h3>
        <p>{{ p.description || '' }}</p>
        <p><strong>Type :</strong> {{ p.type_projet || p.type || '—' }}</p>
        <p><strong>Technologies :</strong>
          <span class="card-techs">
            <span v-for="t in (p.technologies || [])" :key="t.id_technologie || t.id" class="card-tech">{{ t.nom || t.name }}</span>
            <span v-if="!p.technologies?.length">—</span>
          </span>
        </p>
        <span class="status-pill" :class="statusClass(p.status_validation || p.status)">{{ statusLabel(p.status_validation || p.status) }}</span>
      </div>
    </div>

    <p class="lecture-only">Lecture seule — La validation est gérée par le côté académique.</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getProfessionalProjects } from '@/services/professionalApi'

const projects = ref([])
const loading = ref(false)
const error = ref(null)

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
    projects.value = await getProfessionalProjects()
  } catch {
    error.value = 'Impossible de charger les projets.'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.card-techs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.card-tech {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--color-surface-hover, #F0EDE6);
  color: var(--color-text-secondary, #6B7280);
}
.status-pill {
  display: inline-block;
  margin-top: 8px;
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
