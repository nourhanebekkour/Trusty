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

    <div v-if="loadingRecs" class="prof-state-box">
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

    <div v-else class="rec-list">
      <div class="rec-list-header">
        <h2 class="rec-list-title">Recommandations émises</h2>
        <span class="rec-list-count">{{ recommendations.length }}</span>
      </div>
      <div class="rec-cards">
        <div v-for="r in recommendations" :key="r.id" class="rec-card">
          <div class="rec-card__top">
            <span class="rec-card__student">{{ r.studentName }}</span>
            <span class="rec-card__date">{{ formatDate(r.createdAt) }}</span>
          </div>
          <p class="rec-card__message">{{ r.message }}</p>
          <div class="rec-card__bottom">
            <span class="badge" :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
            <button class="rec-delete" @click="remove(r.id)">Supprimer</button>
          </div>
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
            <span class="form-label">Étudiant</span>
            <select v-model="form.studentId" class="form-select">
              <option value="">Sélectionner un étudiant</option>
              <option v-for="s in students" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
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
          <button class="btn-ghost" @click="closeModal">Annuler</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getMyIssuedRecommendations, createProfessionalRecommendation, deleteProfessionalRecommendation, getProfessionalInternships } from '@/services/professionalApi'

const recommendations = ref([])
const stages = ref([])
const loadingRecs = ref(true)
const error = ref(null)
const showModal = ref(false)
const sending = ref(false)
const toast = ref({ show: false, message: '' })
const form = ref({ studentId: '', message: '' })

const students = computed(() => {
  const map = new Map()
  for (const stage of stages.value) {
    const e = stage.etudiant
    if (!e) continue
    if (map.has(e.id_etudiant)) continue
    const u = e.utilisateur || {}
    map.set(e.id_etudiant, {
      id: e.id_etudiant,
      name: `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Étudiant',
    })
  }
  return [...map.values()]
})

function statusLabel(status) {
  const map = { EN_ATTENTE: 'En attente', VALIDE: 'Validée', REJETE: 'Rejetée' }
  return map[status?.toUpperCase()] || status || 'En attente'
}

function statusClass(status) {
  if (status === 'VALIDE') return 'badge-success'
  if (status === 'REJETE') return 'badge-danger'
  return 'badge-pending'
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 2800)
}

function openModal() {
  form.value = { studentId: '', message: '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function loadRecommendations() {
  loadingRecs.value = true
  error.value = null
  try {
    const data = await getMyIssuedRecommendations()
    recommendations.value = (data.recommendations || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch {
    error.value = 'Impossible de charger les recommandations.'
  } finally {
    loadingRecs.value = false
  }
}

async function loadStudents() {
  try {
    const data = await getProfessionalInternships()
    stages.value = Array.isArray(data) ? data : []
  } catch {}
}

async function submit() {
  if (!form.value.studentId || !form.value.message) {
    showToast('Veuillez remplir tous les champs.')
    return
  }
  sending.value = true
  try {
    await createProfessionalRecommendation({
      studentId: form.value.studentId,
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

onMounted(() => {
  loadStudents()
  loadRecommendations()
})
</script>

<style scoped>
.rec-list { margin-bottom: 2rem; }
.rec-list-header {
  display: flex; align-items: center; gap: 0.6rem;
  margin-bottom: 1rem;
}
.rec-list-title {
  font-size: 1rem; font-weight: 700;
  color: var(--color-text-primary); margin: 0;
}
.rec-list-count {
  font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem;
  border-radius: 20px; background: var(--color-accent-light, #E8F2EF);
  color: var(--color-accent, #3D6B5E);
}
.rec-cards {
  display: flex; flex-direction: column; gap: 0.7rem;
}
.rec-card {
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 10px;
  padding: 1rem 1.2rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rec-card:hover {
  border-color: var(--color-accent-border, #B8D4CB);
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.rec-card__top {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem; margin-bottom: 0.4rem;
}
.rec-card__student {
  font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary, #0F1B2D);
}
.rec-card__date {
  font-size: 0.72rem; color: var(--color-text-tertiary, #9CA3AF);
}
.rec-card__message {
  font-size: 0.84rem; color: var(--color-text-secondary, #6B7280);
  line-height: 1.6; margin: 0 0 0.5rem; white-space: pre-wrap;
}
.rec-card__bottom {
  display: flex; align-items: center; justify-content: space-between;
}
.badge {
  font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.5rem;
  border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em;
}
.badge-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.badge-danger  { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.rec-delete {
  font-size: 0.72rem; font-weight: 600;
  color: #ef4444; background: none; border: none;
  cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 6px;
  transition: background 0.15s;
}
.rec-delete:hover { background: #fef2f2; }

.form-field { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.78rem; font-weight: 600; color: var(--color-text-secondary, #6B7280); }
.form-select, .form-textarea {
  border: 1px solid var(--color-border, #D6D0C4);
  background: var(--color-surface-alt, #FAFAFA);
  color: var(--color-text-primary, #0F1B2D);
  border-radius: 8px; padding: 0.55rem 0.75rem;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; outline: none;
}
.form-select:focus, .form-textarea:focus {
  border-color: var(--color-accent, #3D6B5E);
  box-shadow: 0 0 0 3px var(--color-accent-light, #E8F2EF);
}
.form-textarea { resize: vertical; min-height: 80px; }
.btn--sm { padding: 0.4rem 0.7rem; font-size: 0.78rem; }
</style>
