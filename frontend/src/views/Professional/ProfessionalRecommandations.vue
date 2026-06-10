<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Recommandations
        </h1>
        <p>Créez des recommandations professionnelles pour les étudiants.</p>
      </div>
      <button class="btn-primary" @click="openModal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Créer une recommandation
      </button>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement des recommandations...</span>
    </div>

    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadRecommendations">Réessayer</button>
    </div>

    <div v-else-if="recommendations.length === 0" class="prof-empty-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="empty-icon">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <p class="empty-title">Aucune recommandation</p>
      <p class="empty-sub">Cliquez sur « Créer une recommandation » pour recommander un étudiant.</p>
    </div>

    <div v-else class="reco-list">
      <div v-for="r in recommendations" :key="r.id" class="reco-card">
        <div class="reco-header">
          <span class="reco-student">{{ r.studentName }}</span>
          <span class="reco-status" :class="'status-' + r.status.toLowerCase()">{{ statusLabel(r.status) }}</span>
        </div>
        <p class="reco-message">{{ r.message }}</p>
        <div class="reco-footer">
          <span class="reco-date">{{ formatDate(r.createdAt) }}</span>
          <button class="reco-delete" @click="remove(r.id)">Supprimer</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="prof-modal-overlay" @click.self="closeModal">
      <div class="prof-modal">
        <div class="prof-modal__header">
          <div>
            <h2 class="prof-modal__title">Créer une recommandation</h2>
            <p class="prof-modal__sub">Recommandation professionnelle</p>
          </div>
          <button class="btn-ghost btn--sm" @click="closeModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Fermer
          </button>
        </div>
        <div class="prof-modal__body">
          <label class="form-field">
            <span class="form-label">Nom de l'étudiant</span>
            <input v-model="form.studentName" class="form-input" placeholder="Prénom Nom" />
          </label>
          <label class="form-field">
            <span class="form-label">Message</span>
            <textarea v-model="form.message" class="form-textarea" placeholder="Rédiger le message de recommandation..." rows="4"></textarea>
          </label>
        </div>
        <div class="prof-modal__footer">
          <button class="btn-primary" @click="submit" :disabled="sending">
            <span v-if="sending" class="spinner-sm"></span>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Enregistrer
          </button>
          <button class="btn-ghost" @click="closeModal" style="height: 36px; padding: 0 14px; border-radius: 8px; font-size: 12px; font-weight: 600;">Annuler</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getMyIssuedRecommendations, createProfessionalRecommendation, deleteProfessionalRecommendation } from '@/services/professionalApi'

const recommendations = ref([])
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const sending = ref(false)
const toast = ref({ show: false, message: '' })
const form = ref({ studentName: '', message: '' })

function statusLabel(status) {
  const map = { EN_ATTENTE: 'En attente', VALIDE: 'Validée', REJETE: 'Rejetée' }
  return map[status?.toUpperCase()] || status || 'En attente'
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function openModal() {
  form.value = { studentName: '', message: '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function loadRecommendations() {
  loading.value = true
  error.value = null
  try {
    const data = await getMyIssuedRecommendations()
    recommendations.value = (data.recommendations || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch {
    error.value = 'Impossible de charger les recommandations.'
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!form.value.studentName || !form.value.message) {
    showToast('Veuillez remplir tous les champs.')
    return
  }
  sending.value = true
  try {
    await createProfessionalRecommendation({
      studentId: form.value.studentName,
      message: form.value.message,
    })
    closeModal()
    showToast('Recommandation créée avec succès.')
    await loadRecommendations()
  } catch {
    showToast('Impossible de créer la recommandation.')
  } finally {
    sending.value = false
  }
}

async function remove(id) {
  try {
    await deleteProfessionalRecommendation(id)
    recommendations.value = recommendations.value.filter(r => r.id !== id)
    showToast('Recommandation supprimée.')
  } catch {
    showToast('Impossible de supprimer la recommandation.')
  }
}

onMounted(loadRecommendations)
</script>

<style scoped>
.reco-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.reco-card {
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 10px;
  padding: 18px 20px;
}
.reco-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.reco-student {
  font-weight: 700;
  font-size: 14px;
  color: var(--color-text-primary, #0F1B2D);
}
.reco-status {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 3px 9px;
  border-radius: 999px;
}
.status-en_attente { background: #fef3c7; color: #92400e; }
.status-valide { background: #d1fae5; color: #065f46; }
.status-rejete { background: #fee2e2; color: #991b1b; }
.reco-message {
  font-size: 13px;
  color: var(--color-text-secondary, #6B7280);
  line-height: 1.5;
  margin: 0 0 10px;
}
.reco-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.reco-date {
  font-size: 11px;
  color: var(--color-text-tertiary, #9CA3AF);
}
.reco-delete {
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 6px;
  transition: background 0.15s;
}
.reco-delete:hover {
  background: #fef2f2;
}
</style>
