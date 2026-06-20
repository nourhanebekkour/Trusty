<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Historique des actions
        </h1>
        <p>Suivi de toutes vos actions sur la plateforme.</p>
      </div>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement de l'historique...</span>
    </div>

    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadHistory">Réessayer</button>
    </div>

    <div v-else-if="actions.length === 0" class="prof-empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <p class="empty-title">Aucune action</p>
      <p class="empty-sub">Votre historique est vide pour le moment.</p>
    </div>

    <div v-else class="prof-timeline">
      <div v-for="(a, i) in actions" :key="a.id" class="prof-timeline-item" :style="{ animationDelay: i * 40 + 'ms' }">
        <div class="prof-timeline-dot" :class="dotClass(a)"></div>
        <div class="prof-timeline-card">
          <div class="prof-timeline-header">
            <span class="prof-timeline-type" :class="typeClass(a)">{{ typeLabel(a) }}</span>
            <span class="prof-timeline-date">{{ formatDate(a.createdAt) }}</span>
          </div>
          <p class="prof-timeline-desc">{{ a.description || '—' }}</p>
          <div class="prof-timeline-meta" v-if="a.entity || a.details">
            <span v-if="a.entity" class="meta-badge">{{ a.entity }}</span>
            <span v-if="a.details" class="meta-text">{{ a.details }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getProfessionalActionHistory } from '@/services/professionalApi'

const actions = ref([])
const loading = ref(false)
const error = ref(null)
const toast = ref({ show: false, message: '' })

function dotClass(a) {
  const t = (a.type || '').toUpperCase()
  if (t === 'VALIDATION' || t === 'VALIDE') return 'dot-valid'
  if (t === 'REJET' || t === 'REJETE') return 'dot-reject'
  if (t === 'COMMENTAIRE' || t === 'RECOMMANDATION' || t === 'CREATION') return 'dot-info'
  if (t === 'EN_ATTENTE' || t === 'PENDING') return 'dot-pending'
  return 'dot-default'
}
function typeClass(a) {
  const t = (a.type || '').toUpperCase()
  if (t === 'VALIDATION' || t === 'VALIDE') return 'type-valid'
  if (t === 'REJET' || t === 'REJETE') return 'type-reject'
  if (t === 'COMMENTAIRE' || t === 'RECOMMANDATION' || t === 'CREATION') return 'type-info'
  if (t === 'EN_ATTENTE' || t === 'PENDING') return 'type-pending'
  return 'type-default'
}
function typeLabel(a) {
  const map = { VALIDATION: 'Validation', VALIDE: 'Validé', REJET: 'Rejet', REJETE: 'Rejeté', COMMENTAIRE: 'Commentaire', RECOMMANDATION: 'Recommandation', CREATION: 'Création', EN_ATTENTE: 'En attente', PENDING: 'En attente' }
  return map[(a.type || '').toUpperCase()] || a.type || 'Action'
}
function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
async function loadHistory() {
  loading.value = true
  error.value = null
  try {
    const data = await getProfessionalActionHistory()
    actions.value = (data.actions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    error.value = 'Impossible de charger l\'historique.'
  } finally {
    loading.value = false
  }
}

onMounted(loadHistory)
</script>
