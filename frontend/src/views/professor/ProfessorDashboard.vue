<template>
  <div class="professor-page">
    <div class="professor-page__head">
      <div>
        <h1>Tableau de bord professeur</h1>
        <p>Suivez les étudiants, les validations et les recommandations à traiter.</p>
      </div>

      <button class="btn btn--primary" type="button" @click="exportReport">
        Exporter rapport
      </button>
    </div>

    <div v-if="loading" class="state-box">
      Chargement des données professeur...
    </div>

    <div v-else-if="error" class="error-box">
      {{ error }}
    </div>

    <template v-else>
      <section class="stats-grid">
        <div class="stat-card">
          <span>Étudiants suivis</span>
          <strong>{{ stats.studentsCount }}</strong>
        </div>

        <div class="stat-card">
          <span>À valider</span>
          <strong>{{ stats.pendingValidationsCount }}</strong>
        </div>

        <div class="stat-card">
          <span>Certifications</span>
          <strong>{{ stats.certificationsCount }}</strong>
        </div>

        <div class="stat-card">
          <span>Délai moyen</span>
          <strong>{{ stats.averageDelay || '—' }}</strong>
        </div>
      </section>

      <section class="dashboard-grid">
        <div class="panel panel--students">
          <div class="panel__head">
            <h2>Étudiants suivis</h2>

            <input
              v-model="studentSearch"
              class="input"
              type="text"
              placeholder="Rechercher un étudiant"
            />
          </div>

          <div v-if="filteredStudents.length === 0" class="empty-state">
            Aucun étudiant trouvé.
          </div>

          <div v-else class="student-list">
            <button
              v-for="student in filteredStudents"
              :key="student.id"
              class="student-card"
              :class="{ 'student-card--active': selectedStudent?.id === student.id }"
              type="button"
              @click="selectStudent(student)"
            >
              <div class="avatar">{{ getInitials(student.fullName) }}</div>

              <div>
                <strong>{{ student.fullName }}</strong>
                <span>{{ student.level || 'Niveau non renseigné' }}</span>
              </div>
            </button>
          </div>
        </div>

        <div class="panel">
          <div v-if="selectedStudent" class="profile-card">
            <div class="profile-card__top">
              <div class="profile-card__identity">
                <div class="profile-card__avatar">
                  {{ getInitials(selectedStudent.fullName) }}
                </div>

                <div>
                  <h2>{{ selectedStudent.fullName }}</h2>
                  <p>{{ selectedStudent.field || 'Filière non renseignée' }}</p>
                </div>
              </div>

              <span :class="statusClass(selectedStudent.portfolioStatus)">
                {{ selectedStudent.portfolioStatus || 'En attente' }}
              </span>
            </div>

            <p class="profile-card__description">
              {{ selectedStudent.bio || 'Aucune description disponible pour cet étudiant.' }}
            </p>

            <div class="progress">
              <div class="progress__top">
                <span>Progression du portfolio</span>
                <strong>{{ selectedStudent.progress || 0 }}%</strong>
              </div>

              <div class="progress__bar">
                <div :style="{ width: (selectedStudent.progress || 0) + '%' }"></div>
              </div>
            </div>

            <div class="action-row">
              <button class="btn btn--secondary" type="button" @click="openPortfolio">
                Voir portfolio
              </button>

              <button class="btn btn--primary" type="button" @click="openMessageModal">
                Envoyer un message
              </button>

              <button class="btn btn--green" type="button" @click="certifyPortfolio">
                Certifier portfolio
              </button>
            </div>
          </div>

          <div v-else class="empty-state">
            Sélectionnez un étudiant pour afficher son dossier.
          </div>

          <div class="section-title">
            <h2>Éléments à valider</h2>
            <span>{{ filteredValidations.length }} élément(s)</span>
          </div>

          <div v-if="filteredValidations.length === 0" class="empty-state">
            Aucun élément à valider pour cet étudiant.
          </div>

          <div v-else class="validation-list">
            <article
              v-for="item in filteredValidations"
              :key="item.id"
              class="validation-card"
            >
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.studentName }} - {{ item.type }}</p>
                <span>{{ formatDate(item.submittedAt) }}</span>
              </div>

              <div class="validation-card__actions">
                <button class="btn btn--secondary btn--small" type="button" @click="openValidation(item)">
                  Voir
                </button>

                <button class="btn btn--primary btn--small" type="button" @click="approve(item)">
                  Valider
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </template>

    <div v-if="selectedValidation" class="modal-backdrop">
      <div class="modal">
        <div class="modal__head">
          <div>
            <h2>{{ selectedValidation.title }}</h2>
            <p>{{ selectedValidation.studentName }} - {{ selectedValidation.type }}</p>
          </div>

          <button class="modal__close" type="button" @click="selectedValidation = null">
            ×
          </button>
        </div>

        <p class="modal__text">
          {{ selectedValidation.description || 'Aucune description disponible.' }}
        </p>

        <textarea
          v-model="correctionReason"
          class="textarea"
          placeholder="Commentaire ou correction demandée"
        ></textarea>

        <div class="action-row">
          <button class="btn btn--primary" type="button" @click="approve(selectedValidation)">
            Valider
          </button>

          <button class="btn btn--danger" type="button" @click="requestChanges(selectedValidation)">
            Demander correction
          </button>
        </div>
      </div>
    </div>

    <div v-if="showMessageModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal__head">
          <div>
            <h2>Envoyer un message</h2>
            <p>{{ selectedStudent?.fullName }}</p>
          </div>

          <button class="modal__close" type="button" @click="showMessageModal = false">
            ×
          </button>
        </div>

        <textarea
          v-model="messageText"
          class="textarea"
          placeholder="Écrire votre message"
        ></textarea>

        <div class="action-row">
          <button class="btn btn--primary" type="button" @click="sendMessage">
            Envoyer
          </button>

          <button class="btn btn--secondary" type="button" @click="showMessageModal = false">
            Annuler
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  getProfessorDashboard,
  approveProfessorValidation,
  requestProfessorChanges,
  certifyProfessorPortfolio,
  sendProfessorMessage,
} from '@/services/professorApi'

const loading = ref(false)
const error = ref(null)

const stats = ref({
  studentsCount: 0,
  pendingValidationsCount: 0,
  certificationsCount: 0,
  averageDelay: null,
})

const students = ref([])
const validations = ref([])

const selectedStudent = ref(null)
const selectedValidation = ref(null)

const studentSearch = ref('')
const correctionReason = ref('')
const showMessageModal = ref(false)
const messageText = ref('')

const toast = ref({
  show: false,
  message: '',
})

const filteredStudents = computed(() => {
  const query = studentSearch.value.trim().toLowerCase()

  if (!query) {
    return students.value
  }

  return students.value.filter(student => {
    return (
      student.fullName?.toLowerCase().includes(query) ||
      student.field?.toLowerCase().includes(query) ||
      student.level?.toLowerCase().includes(query)
    )
  })
})

const filteredValidations = computed(() => {
  if (!selectedStudent.value) {
    return validations.value
  }

  return validations.value.filter(item => item.studentId === selectedStudent.value.id)
})

async function loadDashboard() {
  loading.value = true
  error.value = null

  try {
    const data = await getProfessorDashboard()

    stats.value = data.stats || stats.value
    students.value = Array.isArray(data.students) ? data.students : []
    validations.value = Array.isArray(data.validations) ? data.validations : []

    selectedStudent.value = students.value[0] || null
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Impossible de charger le tableau de bord professeur. Vérifiez que l’API backend existe.'
  } finally {
    loading.value = false
  }
}

function selectStudent(student) {
  selectedStudent.value = student
}

function getInitials(name) {
  if (!name) {
    return '?'
  }

  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function statusClass(status) {
  if (status === 'Certifié' || status === 'CERTIFIED' || status === 'APPROVED') {
    return 'badge badge--success'
  }

  if (status === 'Rejeté' || status === 'REJECTED' || status === 'CHANGES_REQUESTED') {
    return 'badge badge--danger'
  }

  return 'badge badge--pending'
}

function openPortfolio() {
  if (!selectedStudent.value?.portfolioUrl) {
    showToast('Aucun lien portfolio disponible pour cet étudiant.')
    return
  }

  window.open(selectedStudent.value.portfolioUrl, '_blank')
}

function openMessageModal() {
  if (!selectedStudent.value) {
    showToast('Veuillez sélectionner un étudiant.')
    return
  }

  messageText.value = ''
  showMessageModal.value = true
}

async function sendMessage() {
  if (!messageText.value.trim()) {
    showToast('Veuillez écrire un message.')
    return
  }

  try {
    await sendProfessorMessage(selectedStudent.value.id, {
      message: messageText.value,
    })

    showMessageModal.value = false
    showToast('Message envoyé avec succès.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible d’envoyer le message.')
  }
}

function openValidation(item) {
  correctionReason.value = ''
  selectedValidation.value = item
}

async function approve(item) {
  try {
    await approveProfessorValidation(item.id)

    validations.value = validations.value.filter(validation => validation.id !== item.id)
    selectedValidation.value = null

    stats.value.pendingValidationsCount = Math.max(
      0,
      Number(stats.value.pendingValidationsCount || 0) - 1
    )

    showToast('Élément validé avec succès.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de valider cet élément.')
  }
}

async function requestChanges(item) {
  const reason = correctionReason.value.trim()

  if (!reason) {
    showToast('Veuillez écrire la correction demandée.')
    return
  }

  try {
    await requestProfessorChanges(item.id, {
      reason,
    })

    validations.value = validations.value.filter(validation => validation.id !== item.id)
    selectedValidation.value = null

    showToast('Demande de correction envoyée.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible d’envoyer la correction.')
  }
}

async function certifyPortfolio() {
  if (!selectedStudent.value) {
    showToast('Veuillez sélectionner un étudiant.')
    return
  }

  try {
    await certifyProfessorPortfolio(selectedStudent.value.id)

    selectedStudent.value.portfolioStatus = 'Certifié'
    selectedStudent.value.progress = 100

    showToast('Portfolio certifié avec succès.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de certifier ce portfolio.')
  }
}

function exportReport() {
  const rows = [
    ['Indicateur', 'Valeur'],
    ['Étudiants suivis', stats.value.studentsCount],
    ['Validations en attente', stats.value.pendingValidationsCount],
    ['Certifications', stats.value.certificationsCount],
    ['Délai moyen', stats.value.averageDelay || ''],
  ]

  const content = rows.map(row => row.join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'rapport-professeur.csv'
  link.click()

  URL.revokeObjectURL(url)
}

function formatDate(date) {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleDateString('fr-FR')
}

function showToast(message) {
  toast.value = {
    show: true,
    message,
  }

  setTimeout(() => {
    toast.value.show = false
  }, 2800)
}

onMounted(loadDashboard)
</script>

<style scoped>
.professor-page {
  padding: 28px;
  color: #263534;
}

.professor-page__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.professor-page__head h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
}

.professor-page__head p {
  margin: 6px 0 0;
  color: #6F7F7C;
  font-size: 13px;
}

.state-box,
.error-box {
  background: #ffffff;
  border: 1px solid #E5E0D6;
  border-radius: 14px;
  padding: 22px;
  font-size: 14px;
}

.error-box {
  color: #D94A4A;
  background: #FBECEC;
  border-color: #F1CACA;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card,
.panel,
.recommendation-card {
  background: #ffffff;
  border: 1px solid #E5E0D6;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(13, 43, 43, 0.04);
}

.stat-card {
  padding: 18px;
}

.stat-card span {
  display: block;
  color: #6F7F7C;
  font-size: 12px;
  margin-bottom: 8px;
}

.stat-card strong {
  font-size: 25px;
  color: #263534;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 18px;
}

.panel {
  padding: 18px;
}

.panel--students {
  min-height: 560px;
}

.panel__head {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.panel__head h2,
.section-title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.input,
.textarea {
  width: 100%;
  border: 1px solid #E5E0D6;
  border-radius: 8px;
  background: #ffffff;
  color: #263534;
  font-size: 13px;
  outline: none;
}

.input {
  height: 38px;
  padding: 0 12px;
}

.textarea {
  min-height: 110px;
  padding: 12px;
  resize: vertical;
}

.input:focus,
.textarea:focus {
  border-color: #42A8C7;
  box-shadow: 0 0 0 3px rgba(66, 168, 199, 0.16);
}

.student-list,
.validation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.student-card {
  width: 100%;
  border: 1px solid #E5E0D6;
  background: #ffffff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.student-card:hover,
.student-card--active {
  background: #D6EDE8;
  border-color: #B9DDD5;
}

.avatar,
.profile-card__avatar {
  border-radius: 50%;
  background: #D6EDE8;
  color: #5C8C6A;
  display: grid;
  place-items: center;
  font-weight: 800;
  border: 1px solid #B9DDD5;
}

.avatar {
  width: 38px;
  height: 38px;
  min-width: 38px;
  font-size: 12px;
}

.student-card strong {
  display: block;
  color: #263534;
  font-size: 13px;
}

.student-card span {
  display: block;
  color: #6F7F7C;
  font-size: 12px;
  margin-top: 3px;
}

.profile-card {
  margin-bottom: 24px;
}

.profile-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.profile-card__identity {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-card__avatar {
  width: 64px;
  height: 64px;
  font-size: 16px;
}

.profile-card h2 {
  margin: 0;
  font-size: 22px;
}

.profile-card p {
  margin: 4px 0 0;
  color: #6F7F7C;
  font-size: 13px;
}

.profile-card__description {
  max-width: 740px;
  line-height: 1.6;
  margin-top: 18px;
}

.progress {
  margin-top: 18px;
  max-width: 420px;
}

.progress__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6F7F7C;
  font-size: 12px;
  margin-bottom: 8px;
}

.progress__bar {
  height: 8px;
  border-radius: 999px;
  background: #E5E0D6;
  overflow: hidden;
}

.progress__bar div {
  height: 100%;
  background: #42A8C7;
  border-radius: 999px;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.btn--primary {
  background: #42A8C7;
  color: #ffffff;
}

.btn--green {
  background: #5C8C6A;
  color: #ffffff;
}

.btn--secondary {
  background: #ffffff;
  color: #263534;
  border-color: #E5E0D6;
}

.btn--danger {
  background: #FBECEC;
  color: #D94A4A;
  border-color: #F1CACA;
}

.btn--small {
  height: 32px;
  padding: 0 10px;
}

.badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.badge--success {
  background: #E6F7E4;
  color: #358C2C;
}

.badge--pending {
  background: #FFF4D8;
  color: #A96F00;
}

.badge--danger {
  background: #FBECEC;
  color: #D94A4A;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-title span {
  color: #6F7F7C;
  font-size: 12px;
}

.validation-card {
  border: 1px solid #E5E0D6;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.validation-card strong {
  display: block;
  font-size: 14px;
}

.validation-card p,
.validation-card span {
  color: #6F7F7C;
  font-size: 12px;
}

.validation-card p {
  margin: 5px 0;
}

.validation-card__actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 28px 10px;
  text-align: center;
  color: #6F7F7C;
  font-size: 13px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  display: grid;
  place-items: center;
  z-index: 300;
}

.modal {
  width: min(620px, calc(100vw - 32px));
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.24);
}

.modal__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal__head h2 {
  margin: 0;
  font-size: 18px;
}

.modal__head p {
  margin: 4px 0 0;
  color: #6F7F7C;
  font-size: 13px;
}

.modal__close {
  border: none;
  background: transparent;
  color: #6F7F7C;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.modal__text {
  color: #263534;
  line-height: 1.6;
  font-size: 13px;
}

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  background: #0D2B2B;
  color: #ffffff;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  z-index: 500;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>