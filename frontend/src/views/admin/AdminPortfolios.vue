<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Étudiants & Portfolios</h1>
        <p class="page__subtitle">Liste des étudiants inscrits et suivi de leurs portfolios.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--secondary" @click="load"><AppIcon name="refresh" /> Rafraîchir</button>
      </div>
    </div>

    <div v-if="admin.error" class="error-banner">{{ admin.error }}</div>

    <div class="stats-row">
      <StatCard label="Total Étudiants" :value="admin.loading ? '…' : String(admin.students.length)">
        <template #icon><AppIcon name="graduation" /></template>
      </StatCard>
      <StatCard label="Actifs" :value="admin.loading ? '…' : String(activeCount)">
        <template #icon><AppIcon name="check-circle" /></template>
      </StatCard>
      <StatCard label="En attente" :value="admin.loading ? '…' : String(admin.verificationQueue.length)">
        <template #icon><AppIcon name="clock" /></template>
      </StatCard>
    </div>

    <div class="card">
      <div class="table-toolbar">
        <div class="search-box">
          <input v-model="searchQuery" type="text" placeholder="Rechercher un étudiant..." @input="currentPage = 1" />
        </div>
      </div>

      <div v-if="admin.loading" class="state-msg">Chargement…</div>

      <table v-else class="table">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th v-if="authStore.isSuperAdmin">Établissement</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in paginated" :key="s.id_etudiant || s.id_utilisateur">
            <td>
              <div class="user-cell">
                <div class="avatar">{{ initials(s.prenom, s.nom) }}</div>
                <div>
                  <div class="user-cell__name">{{ s.prenom || s.utilisateur?.prenom }} {{ s.nom || s.utilisateur?.nom }}</div>
                  <div class="user-cell__id">ID: {{ shortId(s.id_etudiant || s.id_utilisateur) }}</div>
                </div>
              </div>
            </td>
            <td v-if="authStore.isSuperAdmin" class="text-muted">{{ s.utilisateur?.ecole || s.ecole || '—' }}</td>
            <td class="text-muted">{{ s.email || s.utilisateur?.email }}</td>
            <td>
              <span :class="['statut', (s.status_compte || s.utilisateur?.status_compte) === 'ACTIF' ? 'statut--ok' : 'statut--pending']">
                {{ formatStatus(s.status_compte || s.utilisateur?.status_compte) }}
              </span>
            </td>
            <td class="text-muted">{{ formatDate(s.date_creation || s.utilisateur?.date_creation) }}</td>
            <td>
              <div class="action-btns">
                <button
                  class="btn btn--icon btn--sm"
                  :disabled="!portfolioSlug(s)"
                  :title="portfolioSlug(s) ? 'Voir le portfolio public' : 'Portfolio non publié'"
                  @click="openPortfolio(s)"
                ><AppIcon name="eye" /></button>
              </div>
            </td>
          </tr>
          <tr v-if="!admin.loading && paginated.length === 0">
            <td :colspan="authStore.isSuperAdmin ? 6 : 5" class="state-msg">Aucun étudiant trouvé</td>
          </tr>
        </tbody>
      </table>

      <AppPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="filtered.length"
        :per-page="perPage"
        item-label="étudiants"
        @page-change="currentPage = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard      from '../../components/ui/StatCard.vue'
import AppPagination from '../../components/ui/AppPagination.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore }  from '../../stores/authstore'

const admin = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()

const scope = computed(() =>
  authStore.isSuperAdmin ? 'global' : (authStore.user?.ecole || '')
)

const activeCount = computed(() =>
  (admin.students || []).filter(s =>
    (s.status_compte || s.utilisateur?.status_compte) === 'ACTIF'
  ).length
)

const searchQuery = ref('')
const currentPage = ref(1)
const perPage = 10

const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return admin.students
  return (admin.students || []).filter(s => {
    const name = `${s.prenom || s.utilisateur?.prenom || ''} ${s.nom || s.utilisateur?.nom || ''}`.toLowerCase()
    const email = (s.email || s.utilisateur?.email || '').toLowerCase()
    return name.includes(q) || email.includes(q)
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / perPage))
)

const paginated = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})

function portfolioSlug(student) {
  return student.portfolioUrl
    || student.portfolio?.url_publique
    || student.portfolios?.find(portfolio => portfolio.est_publie)?.url_publique
    || null
}

function openPortfolio(student) {
  const slug = portfolioSlug(student)
  if (slug) {
    router.push({ name: 'portfolio-template1', params: { url_publique: slug } })
  }
}

function initials(prenom, nom) {
  const p = prenom?.[0] || ''
  const n = nom?.[0] || ''
  return (p + n).toUpperCase() || '?'
}

function shortId(id) {
  if (!id) return '—'
  return String(id).slice(0, 8)
}

function formatStatus(status) {
  const map = { ACTIF: 'Actif', INACTIF: 'Inactif', EN_ATTENTE: 'En attente', SUSPENDU: 'Suspendu' }
  return map[status] || status || '—'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function load() {
  await Promise.all([
    admin.fetchStudents(),
    admin.fetchVerificationQueue(),
  ])
}

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'ADMINISTRATEUR') {
    router.replace('/login')
    return
  }
  await load()
})
</script>

<style scoped>
.page           { padding: 32px; }
.page__header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title    { font-size: 24px; font-weight: 700; color: var(--color-text-primary); }
.page__subtitle { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }

.card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px; }

.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-box {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid var(--color-border); border-radius: 8px;
  padding: 8px 12px; width: 320px;
  background: var(--color-surface-alt);
}
.search-box input { border: none; outline: none; font-size: 13px; width: 100%; color: var(--color-text-primary); background: transparent; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left; padding: 10px;
  font-size: 12px; font-weight: 600; color: var(--color-text-tertiary);
  text-transform: uppercase; border-bottom: 2px solid var(--color-border-light);
}
.table td { padding: 12px 10px; border-bottom: 1px solid var(--color-border-light); color: var(--color-text-primary); vertical-align: middle; }
.table tr:hover td { background: var(--color-surface-hover); }

.user-cell      { display: flex; align-items: center; gap: 10px; }
.user-cell__name { font-weight: 500; font-size: 13px; }
.user-cell__id   { font-size: 11px; color: var(--color-text-tertiary); }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-accent); color: #fff;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.statut          { font-size: 12px; font-weight: 500; }
.statut--ok      { color: var(--color-valid-text); }
.statut--pending { color: var(--color-waiting-text); }

.text-muted  { color: var(--color-text-tertiary); }
.action-btns { display: flex; gap: 4px; }
.state-msg   { text-align: center; padding: 24px; color: var(--color-text-tertiary); font-size: 13px; }

.error-banner {
  background: #fef2f2; border: 1px solid #fecaca;
  color: var(--color-danger); padding: 10px 16px;
  border-radius: 8px; font-size: 13px; margin-bottom: 20px;
}

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--primary         { background: var(--color-accent); color: #fff; }
.btn--primary:hover   { background: var(--color-accent-hover); }
.btn--secondary       { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.btn--secondary:hover { background: var(--color-surface-hover); }
.btn--sm   { padding: 6px 12px; font-size: 12px; }
.btn--icon { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-tertiary); padding: 5px 9px; }
.btn--icon:hover { background: var(--color-surface-hover); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

@media (max-width: 768px) {
  .page { padding: 20px 16px; }
  .page__header { flex-direction: column; gap: 12px; }
  .page__title { font-size: 20px; }
  .page__actions { width: 100%; }
  .page__actions .btn { flex: 1; justify-content: center; }
  .stats-row { flex-wrap: wrap; }
  .table-toolbar { flex-direction: column; gap: 12px; }
  .search-box { width: 100%; }
}
@media (max-width: 480px) {
  .stats-row { flex-direction: column; }
  .table { display: block; overflow-x: auto; white-space: nowrap; }
}
</style>