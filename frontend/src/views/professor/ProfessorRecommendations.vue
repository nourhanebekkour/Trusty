<template>
  <div class="prof-page">
    <div class="prof-page-head">
      <div>
        <h1>Recommandations</h1>
        <p>
          Gérez les recommandations académiques et professionnelles des étudiants suivis.
        </p>
      </div>

      <button class="prof-btn prof-btn-primary" type="button" @click="openCreateModal">
        Créer une recommandation
      </button>
    </div>

    <div v-if="loading" class="prof-state">
      Chargement...
    </div>

    <div v-else-if="error" class="prof-error">
      {{ error }}
    </div>

    <div v-if="showModal" class="prof-modal-backdrop">
      <div class="prof-modal">
        <div class="prof-modal-head">
          <div>
            <h2>Créer une recommandation</h2>
            <p>Recommandation académique ou professionnelle</p>
          </div>

          <button class="prof-modal-close" type="button" @click="closeModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            <span>Étudiant</span>
            <select v-model="form.studentId" class="prof-select full-width">
              <option value="">Sélectionner un étudiant</option>
              <option
                v-for="student in students"
                :key="student.id"
                :value="student.id"
              >
                {{ student.fullName }}
              </option>
            </select>
          </label>

          <label>
            <span>Message</span>
            <textarea
              v-model="form.message"
              class="prof-textarea"
              placeholder="Rédiger le message de recommandation"
            ></textarea>
          </label>
        </div>

        <div class="prof-actions" style="margin-top: 16px;">
          <button class="prof-btn prof-btn-primary" type="button" @click="submitRecommendation">
            Enregistrer
          </button>

          <button class="prof-btn prof-btn-secondary" type="button" @click="closeModal">
            Annuler
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="prof-toast">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import '@/assets/professor-pages.css'
import {
  getProfessorStudents,
  createProfessorRecommendationRequest,
} from '@/services/professorApi'

const loading = ref(false)
const error = ref(null)

const students = ref([])

const showModal = ref(false)

const form = ref({
  studentId: '',
  message: '',
})

const toast = ref({
  show: false,
  message: '',
})

async function loadStudents() {
  loading.value = true
  error.value = null

  try {
    const data = await getProfessorStudents()
    students.value = Array.isArray(data) ? data : data.students || []
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les étudiants.'
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  form.value = { studentId: '', message: '' }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitRecommendation() {
  if (!form.value.studentId || !form.value.message) {
    showToast('Veuillez remplir tous les champs.')
    return
  }

  try {
    await createProfessorRecommendationRequest({
      studentId: form.value.studentId,
      message: form.value.message,
    })

    closeModal()
    showToast('Recommandation créée avec succès.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de créer la recommandation.')
  }
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => { toast.value.show = false }, 2800)
}

onMounted(loadStudents)
</script>

<style scoped>
.form-grid {
  display: grid;
  gap: 14px;
}

.form-grid label {
  display: grid;
  gap: 6px;
}

.form-grid span {
  color: #6F7F7C;
  font-size: 12px;
  font-weight: 700;
}

.full-width {
  width: 100%;
}
</style>