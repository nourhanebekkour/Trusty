<template>
  <div class="prof-page">
    <div class="prof-page-head">
      <div>
        <h1>Portfolios étudiants</h1>
        <p>Consultez les portfolios des étudiants que vous suivez.</p>
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
                <a v-if="portfolio.portfolioUrl" :href="portfolio.portfolioUrl" target="_blank" class="prof-link">
                  Voir le portfolio
                </a>
                <span v-else class="prof-muted">Non publié</span>
              </td>
              <td>
                <div class="prof-actions">
                  <button class="prof-btn prof-btn-secondary prof-btn-small" @click="openDetails(portfolio)">
                    Détails
                  </button>
                  <button class="prof-btn prof-btn-primary prof-btn-small" @click="downloadPdf(portfolio)">
                    PDF
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <div v-if="selectedPortfolio" class="prof-modal-backdrop">
      <div class="prof-modal">
        <div class="prof-modal-head">
          <div>
            <h2>{{ selectedPortfolio.title }}</h2>
            <p>{{ selectedPortfolio.studentName }}</p>
          </div>
          <button class="prof-modal-close" @click="selectedPortfolio = null">×</button>
        </div>

        <p class="prof-muted">{{ selectedPortfolio.description || 'Aucune description disponible.' }}</p>

        <p v-if="selectedPortfolio.portfolioUrl" class="prof-muted">
          URL : <a :href="selectedPortfolio.portfolioUrl" target="_blank">{{ selectedPortfolio.portfolioUrl }}</a>
        </p>

        <div class="prof-actions" style="margin-top: 16px;">
          <button class="prof-btn prof-btn-secondary" @click="selectedPortfolio = null">
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
  getProfessorPortfolios,
  getProfessorPortfolioDetails,
  exportProfessorPortfolioPdf,
} from '@/services/professorApi'

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
const selectedPortfolio = ref(null)
const toast = ref({ show: false, message: '' })

const filteredPortfolios = computed(() => {
  const query = search.value.trim().toLowerCase()

  return portfolios.value.filter(item => {
    const matchesSearch =
      !query ||
      item.title?.toLowerCase().includes(query) ||
      item.studentName?.toLowerCase().includes(query)

    const matchesStatus = !statusFilter.value || item.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

async function loadPortfolios() {
  loading.value = true
  error.value = null

  try {
    const data = await getProfessorPortfolios()
    portfolios.value = Array.isArray(data.portfolios) ? data.portfolios : []
    stats.value = data.stats || stats.value
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les portfolios.'
  } finally {
    loading.value = false
  }
}

async function openDetails(portfolio) {
  try {
    selectedPortfolio.value = await getProfessorPortfolioDetails(portfolio.id)
  } catch {
    selectedPortfolio.value = portfolio
  }
}

async function downloadPdf(portfolio) {
  showToast('Export PDF bientôt disponible.')
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

onMounted(loadPortfolios)
</script>