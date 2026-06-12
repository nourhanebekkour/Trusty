<template>
  <div class="rec-page">

    <div class="page-header">
      <div>
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Recommandations
        </h1>
        <p class="page-subtitle">Créez des recommandations académiques et professionnelles.</p>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Créer une recommandation
      </button>
    </div>

    <div class="rec-list" v-if="recommendations.length > 0">
      <div class="rec-list-header">
        <h2 class="rec-list-title">Recommandations émises</h2>
        <span class="rec-list-count">{{ recommendations.length }}</span>
      </div>
      <div class="rec-cards">
        <div v-for="r in recommendations" :key="r.id_recommandation" class="rec-card">
          <div class="rec-card__top">
            <span class="rec-card__student">
              {{ r.cible?.utilisateur?.prenom || '' }} {{ r.cible?.utilisateur?.nom || '' }}
            </span>
            <span class="rec-card__date">{{ formatDate(r.date_creation) }}</span>
          </div>
          <p class="rec-card__message">{{ r.message }}</p>
          <div class="rec-card__status">
            <span :class="statusClass(r.status)">{{ statusLabel(r.status) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-card" v-else-if="!loadingRecs">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="empty-icon">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <p class="empty-title">Créer une recommandation</p>
      <p class="empty-sub">Cliquez sur le bouton ci-dessus pour recommander un étudiant.</p>
    </div>

    <div v-if="loadingRecs" class="state-box">
      <div class="spinner"></div>
      <span>Chargement des recommandations...</span>
    </div>

    <!-- Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal__header">
          <div>
            <h2 class="modal__title">Créer une recommandation</h2>
            <p class="modal__sub">Recommandation académique ou professionnelle</p>
          </div>
          <button class="btn-ghost btn--sm" @click="closeModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Fermer
          </button>
        </div>
        <div class="modal__body">
          <div v-if="formErrors.length" class="form-errors">
            <p v-for="err in formErrors" :key="err" class="form-error-msg">{{ err }}</p>
          </div>
          <label class="form-field">
            <span class="form-label">Étudiant</span>
            <select v-model="form.studentId" class="form-select">
              <option value="">Sélectionner un étudiant</option>
              <option v-for="s in students" :key="s.id" :value="s.id">
                {{ sanitizeText(s.fullName) }}
              </option>
            </select>
          </label>
          <label class="form-field">
            <span class="form-label">Message</span>
            <textarea
              v-model="form.message"
              class="form-textarea"
              placeholder="Rédiger le message de recommandation"
              rows="4"
              maxlength="2000"
            ></textarea>
            <span class="char-counter">{{ form.message.length }} / 2000</span>
          </label>
        </div>
        <div class="modal__footer">
          <button class="btn-primary" @click="submitRec" :disabled="sending">
            <span v-if="sending" class="spinner-sm"></span>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Enregistrer
          </button>
          <button class="btn-ghost" @click="closeModal">Annuler</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast">{{ sanitizeText(toast.message) }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import {
  getStudentsByEcole,
  getProfessorMyRecommendations,
  createProfessorRecommendationRequest,
} from '@/services/professorApi'



const MESSAGE_MIN  = 10
const MESSAGE_MAX  = 2000

function sanitizeText(value) {
  if (!value) return ''
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 500)
}

function isValidStudentId(id) {
  return id != null && String(id).trim() !== ''
}

function validateForm() {
  const errors = []
  if (!isValidStudentId(form.value.studentId)) {
    errors.push('Veuillez sélectionner un étudiant.')
  }
  const msg = form.value.message.trim()
  if (!msg) {
    errors.push('Le message est obligatoire.')
  } else if (msg.length < MESSAGE_MIN) {
    errors.push(`Le message doit comporter au moins ${MESSAGE_MIN} caractères.`)
  } else if (msg.length > MESSAGE_MAX) {
    errors.push(`Le message ne peut pas dépasser ${MESSAGE_MAX} caractères.`)
  }
  return errors
}
const auth = useAuthStore()

const students = ref([])
const recommendations = ref([])
const showModal = ref(false)
const sending = ref(false)
const loadingRecs = ref(true)
const toast = ref({ show: false, message: '' })
const form = ref({ studentId: '', message: '' })

function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 2800)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusClass(status) {
  if (status === 'VALIDE') return 'badge badge-success'
  if (status === 'REJETE') return 'badge badge-danger'
  return 'badge badge-pending'
}

function statusLabel(status) {
  const labels = { VALIDE: 'Validée', REJETE: 'Rejetée', EN_ATTENTE: 'En attente' }
  return labels[status] || status || 'En attente'
}

async function loadStudents() {
  const ecole = auth.user?.ecole
  if (!ecole) return
  try {
    const data = await getStudentsByEcole(ecole)
    students.value = Array.isArray(data) ? data : []
  } catch {}
}

async function loadRecommendations() {
  loadingRecs.value = true
  try {
    const data = await getProfessorMyRecommendations()
    recommendations.value = Array.isArray(data) ? data : []
  } catch {
    recommendations.value = []
  } finally {
    loadingRecs.value = false
  }
}

function openCreateModal() {
  form.value   = { studentId: '', message: '' }
  formErrors.value = []
  showModal.value  = true
}

function closeModal() {
  showModal.value  = false
  formErrors.value = []
}

async function submitRec() {
  formErrors.value = validateForm()
  if (formErrors.value.length) return

  if (sending.value) return
  sending.value = true

  try {
    await createProfessorRecommendationRequest({
      studentId: form.value.studentId,
      message:   sanitizeText(form.value.message),
    })
    closeModal()
    showToast('Recommandation créée avec succès.')
    await loadRecommendations()
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de créer la recommandation.')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  loadStudents()
  loadRecommendations()
})
</script>

<style scoped>
* { box-sizing: border-box; }

.rec-page {
  font-family: 'Inter', sans-serif;
  background: var(--color-page-bg);
  min-height: 100vh;
  padding: 2rem 2rem 4rem;
  color: var(--color-text-primary);
}

.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 1.75rem;
  gap: 1rem; flex-wrap: wrap;
}
.page-title {
  font-size: 1.65rem; font-weight: 700; color: var(--color-text-primary);
  margin: 0 0 0.3rem; display: flex; align-items: center;
  gap: 0.55rem; letter-spacing: -0.02em;
}
.title-icon { color: var(--color-accent); opacity: 0.85; flex-shrink: 0; }
.page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: var(--color-accent); color: var(--color-page-bg); border: none;
  padding: 0.55rem 1.1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 600;
  cursor: pointer; transition: background 0.18s, transform 0.15s; white-space: nowrap;
}
.btn-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: transparent; border: 1px solid var(--color-border);
  color: var(--color-text-secondary); padding: 0.5rem 1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
}
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-text-primary); }
.btn--sm { padding: 0.4rem 0.7rem; font-size: 0.78rem; }

.state-box {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 12px; padding: 2.5rem 1.5rem;
  color: var(--color-text-secondary); font-size: 0.875rem; flex-wrap: wrap;
}

.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--color-border); border-top-color: var(--color-accent);
  border-radius: 50%; animation: spin 0.75s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-card {
  background: var(--color-surface); border: 1px dashed var(--color-border);
  border-radius: 14px; padding: 3rem 2rem; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.empty-icon { color: var(--color-accent); opacity: 0.5; margin-bottom: 0.25rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.empty-sub { font-size: 0.84rem; color: var(--color-text-secondary); margin: 0; }

/* Recommendations list */
.rec-list { margin-bottom: 2rem; }

.rec-list-header {
  display: flex; align-items: center; gap: 0.6rem;
  margin-bottom: 1rem;
}
.rec-list-title {
  font-size: 1rem; font-weight: 700; color: var(--color-text-primary);
  margin: 0;
}
.rec-list-count {
  font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem;
  border-radius: 20px; background: var(--color-accent-light);
  color: var(--color-accent);
}

.rec-cards {
  display: flex; flex-direction: column; gap: 0.7rem;
}

.rec-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rec-card:hover {
  border-color: var(--color-accent-border);
  box-shadow: var(--shadow-panel);
}

.rec-card__top {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem; margin-bottom: 0.4rem;
}
.rec-card__student {
  font-size: 0.82rem; font-weight: 600; color: var(--color-text-primary);
}
.rec-card__date {
  font-size: 0.72rem; color: var(--color-text-tertiary);
}
.rec-card__message {
  font-size: 0.84rem; color: var(--color-text-secondary);
  line-height: 1.6; margin: 0 0 0.5rem; white-space: pre-wrap;
}
.rec-card__status {
  display: flex;
}

.badge {
  font-size: 0.65rem; font-weight: 600; padding: 0.15rem 0.5rem;
  border-radius: 20px; text-transform: uppercase; letter-spacing: 0.04em;
}
.badge-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
.badge-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal {
  width: 480px; max-width: 90vw; max-height: 85vh;
  background: var(--color-surface); border-radius: 16px;
  padding: 1.5rem; box-shadow: var(--shadow-panel);
  display: flex; flex-direction: column;
}
.modal__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  gap: 1rem; margin-bottom: 1.25rem;
}
.modal__title { font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.modal__sub { font-size: 0.8rem; color: var(--color-text-tertiary); margin-top: 0.25rem; }
.modal__body { display: flex; flex-direction: column; gap: 1rem; flex: 1; }
.modal__footer { display: flex; gap: 0.6rem; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }

.form-field { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.78rem; font-weight: 600; color: var(--color-text-secondary); }
.form-select, .form-textarea {
  border: 1px solid var(--color-border); background: var(--color-surface-alt);
  color: var(--color-text-primary); border-radius: 8px;
  padding: 0.55rem 0.75rem; font-family: 'Inter', sans-serif;
  font-size: 0.84rem; outline: none;
}
.form-select:focus, .form-textarea:focus {
  border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-light);
}
.form-textarea { resize: vertical; min-height: 80px; }

.char-counter {
  font-size: 0.72rem; color: var(--color-text-tertiary);
  text-align: right;
}

.form-errors { display: flex; flex-direction: column; gap: 0.3rem; }
.form-error-msg {
  font-size: 0.78rem; color: var(--color-danger);
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  border-radius: 6px; padding: 0.35rem 0.65rem; margin: 0;
}

.toast {
  position: fixed; bottom: 24px; right: 24px;
  background: var(--color-text-primary); color: var(--color-page-bg);
  padding: 0.75rem 1.2rem; border-radius: 10px;
  font-size: 0.84rem; font-weight: 500; z-index: 300;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  animation: fadeUp 0.25s ease;
}

.spinner-sm {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid var(--color-border-light); border-top-color: var(--color-page-bg);
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .rec-page { padding: 1.25rem 1rem 3rem; }
}
</style>
