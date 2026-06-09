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

    <div class="prof-empty-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="empty-icon">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <p class="empty-title">Créer une recommandation</p>
      <p class="empty-sub">Cliquez sur le bouton ci-dessus pour recommander un étudiant.</p>
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
import { ref } from 'vue'
import { createProfessionalRecommendation } from '@/services/professionalApi'

const showModal = ref(false)
const sending = ref(false)
const toast = ref({ show: false, message: '' })
const form = ref({ studentName: '', message: '' })

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
  } catch {
    showToast('Impossible de créer la recommandation.')
  } finally {
    sending.value = false
  }
}
</script>
