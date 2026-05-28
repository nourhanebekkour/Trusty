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
      Chargement des recommandations...
    </div>

    <div v-else-if="error" class="prof-error">
      {{ error }}
    </div>

    <template v-else>
      <section class="prof-grid-3">
        <div class="prof-card">
          <span class="prof-stat-label">Total</span>
          <strong class="prof-stat-value">{{ stats.total }}</strong>
        </div>

        <div class="prof-card">
          <span class="prof-stat-label">Validées</span>
          <strong class="prof-stat-value">{{ stats.completed }}</strong>
        </div>

        <div class="prof-card">
          <span class="prof-stat-label">En attente</span>
          <strong class="prof-stat-value">{{ stats.pending }}</strong>
        </div>
      </section>

      <section class="prof-card" style="margin-top: 18px;">
        <div class="prof-toolbar">
          <input
            v-model="search"
            class="prof-input"
            type="text"
            placeholder="Rechercher un étudiant ou un référent"
          />

          <select v-model="statusFilter" class="prof-select">
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="COMPLETED">Validée</option>
            <option value="REJECTED">Rejetée</option>
          </select>
        </div>

        <div v-if="filteredRecommendations.length === 0" class="prof-empty">
          Aucune recommandation trouvée.
        </div>

        <table v-else class="prof-table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Référent</th>
              <th>Contexte</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredRecommendations" :key="item.id">
              <td>
                <strong>{{ item.studentName }}</strong>
                <p class="prof-muted">{{ item.studentLevel || 'Niveau non renseigné' }}</p>
              </td>

              <td>{{ item.referentName }}</td>

              <td>
                <strong>{{ item.context }}</strong>
                <p class="prof-muted">
                  {{ item.content ? shortText(item.content) : 'Aucun contenu rédigé.' }}
                </p>
              </td>

              <td>{{ formatDate(item.createdAt) }}</td>

              <td>
                <span :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>

              <td>
                <div class="prof-actions">
                  <button
                    class="prof-btn prof-btn-secondary prof-btn-small"
                    type="button"
                    @click="openDetails(item)"
                  >
                    Consulter
                  </button>

                  <button
                    v-if="item.status !== 'COMPLETED'"
                    class="prof-btn prof-btn-green prof-btn-small"
                    type="button"
                    @click="markAsCompleted(item)"
                  >
                    Valider
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="prof-card prof-card-soft" style="margin-top: 18px;">
        <h2 class="prof-card-title">Utilité des recommandations</h2>
        <p class="prof-muted">
          Les recommandations permettent de renforcer la crédibilité du portfolio étudiant.
          Elles ajoutent une preuve qualitative sur les compétences, l’autonomie et le sérieux
          de l’étudiant.
        </p>
      </section>
    </template>

    <div v-if="showModal" class="prof-modal-backdrop">
      <div class="prof-modal">
        <div class="prof-modal-head">
          <div>
            <h2>
              {{ selectedRecommendation ? 'Détail de la recommandation' : 'Créer une recommandation' }}
            </h2>
            <p>
              Recommandation académique ou professionnelle
            </p>
          </div>

          <button class="prof-modal-close" type="button" @click="closeModal">
            ×
          </button>
        </div>

        <template v-if="selectedRecommendation">
          <div class="details-list">
            <div class="details-row">
              <span>Étudiant</span>
              <strong>{{ selectedRecommendation.studentName }}</strong>
            </div>

            <div class="details-row">
              <span>Référent</span>
              <strong>{{ selectedRecommendation.referentName }}</strong>
            </div>

            <div class="details-row">
              <span>Contexte</span>
              <strong>{{ selectedRecommendation.context }}</strong>
            </div>

            <div class="details-row">
              <span>Statut</span>
              <strong>{{ statusLabel(selectedRecommendation.status) }}</strong>
            </div>
          </div>

          <div class="recommendation-content">
            <p>
              {{ selectedRecommendation.content || 'Aucun contenu disponible pour cette recommandation.' }}
            </p>
          </div>

          <div class="prof-actions" style="margin-top: 16px;">
            <button
              v-if="selectedRecommendation.status !== 'COMPLETED'"
              class="prof-btn prof-btn-green"
              type="button"
              @click="markAsCompleted(selectedRecommendation)"
            >
              Marquer comme validée
            </button>

            <button class="prof-btn prof-btn-secondary" type="button" @click="closeModal">
              Fermer
            </button>
          </div>
        </template>

        <template v-else>
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
              <span>Nom du référent</span>
              <input
                v-model="form.referentName"
                class="prof-input full-width"
                type="text"
                placeholder="Exemple : Dr. Jean Dupont"
              />
            </label>

            <label>
              <span>Contexte</span>
              <input
                v-model="form.context"
                class="prof-input full-width"
                type="text"
                placeholder="Projet final, stage, mémoire..."
              />
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
        </template>
      </div>
    </div>

    <div v-if="toast.show" class="prof-toast">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import '@/assets/professor-pages.css'
import {
  getProfessorStudents,
  getProfessorRecommendations,
  createProfessorRecommendationRequest,
  updateProfessorRecommendation,
} from '@/services/professorApi'

const loading = ref(false)
const error = ref(null)

const recommendations = ref([])
const students = ref([])

const stats = ref({
  total: 0,
  completed: 0,
  pending: 0,
})

const search = ref('')
const statusFilter = ref('')

const showModal = ref(false)
const selectedRecommendation = ref(null)

const form = ref({
  studentId: '',
  referentName: '',
  context: '',
  message: '',
})

const toast = ref({
  show: false,
  message: '',
})

const filteredRecommendations = computed(() => {
  const query = search.value.trim().toLowerCase()

  return recommendations.value.filter(item => {
    const matchesSearch =
      !query ||
      item.studentName?.toLowerCase().includes(query) ||
      item.referentName?.toLowerCase().includes(query) ||
      item.context?.toLowerCase().includes(query)

    const matchesStatus =
      !statusFilter.value || item.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

async function loadPage() {
  loading.value = true
  error.value = null

  try {
    const [studentsData, recommendationsData] = await Promise.all([
      getProfessorStudents(),
      getProfessorRecommendations(),
    ])

    students.value = Array.isArray(studentsData)
      ? studentsData
      : studentsData.students || []

    recommendations.value = Array.isArray(recommendationsData)
      ? recommendationsData
      : recommendationsData.recommendations || []

    stats.value = recommendationsData.stats || calculateStats(recommendations.value)
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Impossible de charger les recommandations. Vérifiez que les APIs backend existent.'
  } finally {
    loading.value = false
  }
}

function calculateStats(items) {
  return {
    total: items.length,
    completed: items.filter(item => item.status === 'COMPLETED').length,
    pending: items.filter(item => item.status === 'PENDING').length,
  }
}

function openCreateModal() {
  selectedRecommendation.value = null

  form.value = {
    studentId: '',
    referentName: '',
    context: '',
    message: '',
  }

  showModal.value = true
}

function openDetails(item) {
  selectedRecommendation.value = item
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedRecommendation.value = null
}

async function submitRecommendation() {
  if (!form.value.studentId || !form.value.referentName || !form.value.context || !form.value.message) {
    showToast('Veuillez remplir tous les champs.')
    return
  }

  try {
    await createProfessorRecommendationRequest({
      studentId: form.value.studentId,
      referentName: form.value.referentName,
      context: form.value.context,
      message: form.value.message,
    })

    await loadPage()
    closeModal()
    showToast('Recommandation créée avec succès.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de créer la recommandation.')
  }
}

async function markAsCompleted(item) {
  try {
    await updateProfessorRecommendation(item.id, {
      status: 'COMPLETED',
    })

    recommendations.value = recommendations.value.map(recommendation =>
      recommendation.id === item.id
        ? { ...recommendation, status: 'COMPLETED' }
        : recommendation
    )

    stats.value = calculateStats(recommendations.value)

    if (selectedRecommendation.value?.id === item.id) {
      selectedRecommendation.value = {
        ...selectedRecommendation.value,
        status: 'COMPLETED',
      }
    }

    showToast('Recommandation validée.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de valider la recommandation.')
  }
}

function statusClass(status) {
  if (status === 'COMPLETED') {
    return 'prof-badge prof-badge-success'
  }

  if (status === 'REJECTED') {
    return 'prof-badge prof-badge-danger'
  }

  return 'prof-badge prof-badge-pending'
}

function statusLabel(status) {
  const labels = {
    PENDING: 'En attente',
    COMPLETED: 'Validée',
    REJECTED: 'Rejetée',
  }

  return labels[status] || status || 'En attente'
}

function formatDate(date) {
  if (!date) {
    return '—'
  }

  return new Date(date).toLocaleDateString('fr-FR')
}

function shortText(text) {
  if (!text) {
    return ''
  }

  return text.length > 80 ? `${text.slice(0, 80)}...` : text
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

onMounted(loadPage)
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

.details-list {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.details-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid #E5E0D6;
  padding-bottom: 10px;
  font-size: 13px;
}

.details-row span {
  color: #6F7F7C;
}

.details-row strong {
  color: #263534;
  text-align: right;
}

.recommendation-content {
  background: #FAF8F2;
  border: 1px solid #E5E0D6;
  border-radius: 12px;
  padding: 14px;
}

.recommendation-content p {
  margin: 0;
  color: #263534;
  font-size: 13px;
  line-height: 1.6;
}
</style>