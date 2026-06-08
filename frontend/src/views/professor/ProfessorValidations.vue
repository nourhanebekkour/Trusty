<template>
  <div class="prof-page">
    <div class="prof-page-head">
      <div>
        <h1>Poste de validation</h1>
        <p>Gérez les demandes de certification des projets, stages et portfolios.</p>
      </div>

      <button class="prof-btn prof-btn-primary" @click="loadValidations">
        Actualiser
      </button>
    </div>

    <div v-if="loading" class="prof-state">Chargement des validations...</div>
    <div v-else-if="error" class="prof-error">{{ error }}</div>

    <template v-else>
      <section class="prof-grid-3">
        <div class="prof-card">
          <span class="prof-stat-label">À valider</span>
          <strong class="prof-stat-value">{{ stats.pendingCount }}</strong>
        </div>
        <div class="prof-card">
          <span class="prof-stat-label">Validées</span>
          <strong class="prof-stat-value">{{ stats.approvedCount }}</strong>
        </div>
        <div class="prof-card">
          <span class="prof-stat-label">Corrections</span>
          <strong class="prof-stat-value">{{ stats.changesRequestedCount }}</strong>
        </div>
      </section>

      <section class="prof-card" style="margin-top: 18px;">
        <div class="prof-toolbar">
          <input
            v-model="search"
            class="prof-input"
            placeholder="Rechercher un étudiant ou un élément"
          />

          <select v-model="typeFilter" class="prof-select">
            <option value="">Tous les types</option>
            <option value="projet">Projet</option>
            <option value="stage">Stage</option>
          </select>
        </div>

        <div v-if="filteredValidations.length === 0" class="prof-empty">
          Aucune demande de validation trouvée.
        </div>

        <table v-else class="prof-table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Type</th>
              <th>Titre</th>
              <th>Date soumission</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in filteredValidations" :key="item.id">
              <td>{{ item.studentName }}</td>
              <td>{{ typeLabel(item.type) }}</td>
              <td>{{ item.title }}</td>
              <td>{{ formatDate(item.date) }}</td>
              <td>
                <span :class="statusClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td>
                <div class="prof-actions">
                  <button class="prof-btn prof-btn-secondary prof-btn-small" @click="openDetails(item)">
                    Voir
                  </button>
                  <button class="prof-btn prof-btn-primary prof-btn-small" @click="approve(item)">
                    Valider
                  </button>
                  <button class="prof-btn prof-btn-danger prof-btn-small" @click="openReject(item)">
                    Correction
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <div v-if="selectedValidation" class="prof-modal-backdrop">
      <div class="prof-modal">
        <div class="prof-modal-head">
          <div>
            <h2>{{ selectedValidation.title }}</h2>
            <p>{{ selectedValidation.studentName }} - {{ typeLabel(selectedValidation.type) }}</p>
          </div>
          <button class="prof-modal-close" @click="closeModal">×</button>
        </div>

        <p class="prof-muted">{{ selectedValidation.description || 'Aucune description disponible.' }}</p>

        <textarea
          v-if="rejectMode"
          v-model="reason"
          class="prof-textarea"
          placeholder="Expliquez les corrections demandées"
        ></textarea>

        <div class="prof-actions" style="margin-top: 16px;">
          <button class="prof-btn prof-btn-primary" @click="approve(selectedValidation)">
            Valider
          </button>
          <button class="prof-btn prof-btn-danger" @click="reject(selectedValidation)">
            Demander correction
          </button>
          <button class="prof-btn prof-btn-secondary" @click="closeModal">
            Fermer
          </button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import '@/assets/professor-pages.css'
import {
  getProfessorValidations,
  approveProfessorValidation,
  requestProfessorChanges,
} from '@/services/professorApi'

const loading = ref(false)
const error = ref(null)
const validations = ref([])
const stats = ref({
  pendingCount: 0,
  approvedCount: 0,
  changesRequestedCount: 0,
})

const search = ref('')
const typeFilter = ref('')
const selectedValidation = ref(null)
const rejectMode = ref(false)
const reason = ref('')
const toast = ref({ show: false, message: '' })

const filteredValidations = computed(() => {
  const query = search.value.trim().toLowerCase()

  return validations.value.filter(item => {
    const matchesSearch =
      !query ||
      item.studentName?.toLowerCase().includes(query) ||
      item.title?.toLowerCase().includes(query)

    const matchesType = !typeFilter.value || item.type === typeFilter.value

    return matchesSearch && matchesType
  })
})

async function loadValidations() {
  loading.value = true
  error.value = null

  try {
    const data = await getProfessorValidations()
    validations.value = Array.isArray(data.validations) ? data.validations : []
    stats.value = data.stats || stats.value
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les validations.'
  } finally {
    loading.value = false
  }
}

function openDetails(item) {
  selectedValidation.value = item
  rejectMode.value = false
  reason.value = ''
}

function openReject(item) {
  selectedValidation.value = item
  rejectMode.value = true
  reason.value = ''
}

function closeModal() {
  selectedValidation.value = null
  rejectMode.value = false
  reason.value = ''
}

async function approve(item) {
  try {
    await approveProfessorValidation(item.id, item.type)

    validations.value = validations.value.filter(validation => validation.id !== item.id)
    closeModal()
    showToast('Validation confirmée.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de valider cet élément.')
  }
}

async function reject(item) {
  if (!reason.value.trim()) {
    rejectMode.value = true
    showToast('Veuillez écrire la correction demandée.')
    return
  }

  try {
    await requestProfessorChanges(item.id, { reason: reason.value }, item.type)

    validations.value = validations.value.filter(validation => validation.id !== item.id)
    closeModal()
    showToast('Correction envoyée.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible d\'envoyer la correction.')
  }
}

function typeLabel(type) {
  const labels = {
    projet: 'Projet',
    stage: 'Stage',
  }

  return labels[type] || type || 'Élément'
}

function statusClass(status) {
  if (status === 'VALIDE') return 'prof-badge prof-badge-success'
  if (status === 'REJETE') return 'prof-badge prof-badge-danger'
  return 'prof-badge prof-badge-pending'
}

function statusLabel(status) {
  const labels = {
    EN_ATTENTE: 'En attente',
    VALIDE: 'Validé',
    REJETE: 'Rejeté',
  }

  return labels[status] || status || 'En attente'
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR')
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2800)
}

onMounted(loadValidations)
</script>