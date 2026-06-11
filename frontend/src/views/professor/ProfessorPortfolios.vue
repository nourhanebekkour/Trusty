<template>
  <div class="prof-page">
    <div class="prof-page-head">
      <div>
        <h1>Portfolios étudiants</h1>
        <p>Consultez les portfolios des étudiants de votre établissement.</p>
      </div>

      <div class="prof-actions">
        <button class="prof-btn prof-btn-secondary" @click="exportCsv">
          Exporter rapport
        </button>
        <button class="prof-btn prof-btn-primary" @click="loadPortfolios">
          Actualiser
        </button>
      </div>
    </div>

    <div v-if="loading" class="prof-state">Chargement des portfolios...</div>
    <div v-else-if="error" class="prof-error">{{ error }}</div>

    <template v-else>
      <section class="prof-grid-3">
        <div class="prof-card">
          <span class="prof-stat-label">Portfolios totaux</span>
          <strong class="prof-stat-value">{{ stats.totalPortfolios }}</strong>
        </div>
        <div class="prof-card">
          <span class="prof-stat-label">Brouillon</span>
          <strong class="prof-stat-value">{{ stats.pendingPortfolios }}</strong>
        </div>
        <div class="prof-card">
          <span class="prof-stat-label">Publiés</span>
          <strong class="prof-stat-value">{{ stats.certifiedPortfolios }}</strong>
        </div>
      </section>

      <section class="prof-card" style="margin-top: 18px;">
        <div class="prof-toolbar">
          <input
            v-model="search"
            class="prof-input"
            type="text"
            placeholder="Rechercher un étudiant ou un portfolio"
          />

          <select v-model="statusFilter" class="prof-select">
            <option value="">Tous les statuts</option>
            <option value="BROUILLON">Brouillon</option>
            <option value="PUBLIE">Publié</option>
          </select>
        </div>

        <div v-if="filteredPortfolios.length === 0" class="prof-empty">
          Aucun portfolio trouvé.
        </div>

        <table v-else class="prof-table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Statut</th>
              <th>Portfolio</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="portfolio in filteredPortfolios" :key="portfolio.id">
              <td>
                <strong>{{ portfolio.studentName }}</strong>
                <p class="prof-muted">{{ portfolio.field || '' }}</p>
              </td>
              <td>
                <span :class="statusClass(portfolio.status)">
                  {{ statusLabel(portfolio.status) }}
                </span>
              </td>
              <td>
                <a v-if="portfolio.portfolioUrl" :href="'/portfolio/' + portfolio.portfolioUrl" target="_blank" class="prof-link">
                  Voir le portfolio
                </a>
                <span v-else class="prof-muted">Non publié</span>
              </td>
              <td>
                <div class="prof-actions">
                  <button class="prof-btn prof-btn-secondary prof-btn-small" @click="openDetails(portfolio)">
                    Détails
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'
import '@/assets/professor-pages.css'
import {
  getStudentsByEcole,
} from '@/services/professorApi'

const auth = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref(null)
const portfolios = ref([])
const stats = ref({
  totalPortfolios: 0,
  pendingPortfolios: 0,
  certifiedPortfolios: 0,
  activeCriteria: 0,
})

const search = ref('')
const statusFilter = ref('')
const toast = ref({ show: false, message: '' })

const filteredPortfolios = computed(() => {
  const query = search.value.trim().toLowerCase()

  return portfolios.value.filter(item => {
    const matchesSearch =
      !query ||
      item.studentName?.toLowerCase().includes(query) ||
      item.field?.toLowerCase().includes(query)

    const matchesStatus = !statusFilter.value || item.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

async function loadPortfolios() {
  loading.value = true
  error.value = null

  try {
    const ecole = auth.user?.ecole
    if (!ecole) {
      error.value = 'Aucun établissement associé à votre compte.'
      return
    }
    const students = await getStudentsByEcole(ecole)
    portfolios.value = Array.isArray(students) ? students.map(s => ({
      id: s.id,
      studentName: s.fullName || 'Étudiant',
      field: s.field || '',
      bio: s.bio || '',
      status: s.portfolioUrl ? 'PUBLIE' : 'BROUILLON',
      portfolioUrl: s.portfolioUrl || null,
      lastUpdate: null,
      submittedAt: null,
    })) : []
    stats.value = {
      totalPortfolios: portfolios.value.length,
      pendingPortfolios: portfolios.value.filter(p => p.status === 'BROUILLON').length,
      certifiedPortfolios: portfolios.value.filter(p => p.status === 'PUBLIE').length,
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les portfolios.'
  } finally {
    loading.value = false
  }
}

function openDetails(portfolio) {
  if (portfolio.portfolioUrl) {
    router.push(`/portfolio/${portfolio.portfolioUrl}`)
  } else {
    showToast('Ce portfolio n\'est pas encore publié.')
  }
}

function exportCsv() {
  const rows = [
    ['Étudiant', 'Statut', 'URL'],
    ...portfolios.value.map(item => [
      item.studentName || '',
      statusLabel(item.status),
      item.portfolioUrl || '',
    ]),
  ]

  const content = rows.map(row => row.join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = 'portfolios-professeur.csv'
  link.click()

  URL.revokeObjectURL(url)
}

function statusClass(status) {
  if (status === 'PUBLIE') return 'prof-badge prof-badge-success'
  return 'prof-badge prof-badge-pending'
}

function statusLabel(status) {
  const labels = {
    BROUILLON: 'Brouillon',
    PUBLIE: 'Publié',
  }
  return labels[status] || status || 'Brouillon'
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2800)
}

onMounted(loadPortfolios)
</script>
