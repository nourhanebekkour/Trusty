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

    <div class="empty-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="empty-icon">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <p class="empty-title">Créer une recommandation</p>
      <p class="empty-sub">Cliquez sur le bouton ci-dessus pour recommander un étudiant.</p>
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
          <label class="form-field">
            <span class="form-label">Étudiant</span>
            <select v-model="form.studentId" class="form-select">
              <option value="">Sélectionner un étudiant</option>
              <option v-for="s in students" :key="s.id" :value="s.id">{{ s.fullName }}</option>
            </select>
          </label>
          <label class="form-field">
            <span class="form-label">Message</span>
            <textarea v-model="form.message" class="form-textarea" placeholder="Rédiger le message de recommandation" rows="4"></textarea>
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

    <div v-if="toast.show" class="toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  getProfessorStudents,
  createProfessorRecommendationRequest,
} from '@/services/professorApi'

const students = ref([])
const showModal = ref(false)
const sending = ref(false)
const toast = ref({ show: false, message: '' })
const form = ref({ studentId: '', message: '' })

function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 2800)
}

async function loadStudents() {
  try {
    const data = await getProfessorStudents()
    students.value = Array.isArray(data) ? data : data.students || []
  } catch {}
}

function openCreateModal() {
  form.value = { studentId: '', message: '' }
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function submitRec() {
  if (!form.value.studentId || !form.value.message) {
    showToast('Veuillez remplir tous les champs.')
    return
  }
  sending.value = true
  try {
    await createProfessorRecommendationRequest({
      studentId: form.value.studentId,
      message: form.value.message,
    })
    closeModal()
    showToast('Recommandation créée avec succès.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de créer la recommandation.')
  } finally { sending.value = false }
}

onMounted(loadStudents)
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

.empty-card {
  background: var(--color-surface); border: 1px dashed var(--color-border);
  border-radius: 14px; padding: 3rem 2rem; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.empty-icon { color: var(--color-accent); opacity: 0.5; margin-bottom: 0.25rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.empty-sub { font-size: 0.84rem; color: var(--color-text-secondary); margin: 0; }

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
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .rec-page { padding: 1.25rem 1rem 3rem; }
}
</style>
