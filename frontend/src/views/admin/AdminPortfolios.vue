<template>
  <div class="page">

    <!-- Blocage de l'affichage si non admin -->
    <div v-if="!isAuthorized" class="error-banner" role="alert">
      Accès refusé. Vous n'avez pas les droits nécessaires.
    </div>

    <template v-else>

      <div class="page__header">
        <div>
          <h1 class="page__title">Régistre Global des Portfolios</h1>
          <p class="page__subtitle">Surveillez, vérifiez et certifiez les portfolios académiques de tous les étudiants.</p>
        </div>
        <div class="page__actions">
          <button class="btn btn--secondary">⬇ Exporter CSV</button>
          <!-- 🔐 SECURITY: Action de masse protégée par confirmation (dans le handler) -->
          <button class="btn btn--primary" @click="handleBulkCertify">✓ Vérification en masse</button>
        </div>
      </div>

      <!-- Stats -->
      <!-- TODO: Remplacer par admin.portfolioStats quand GET /admin/portfolios/stats disponible -->
      <div class="stats-row">
        <StatCard label="Total Portfolios"
                  :value="admin.loading ? '…' : formatNumber(totalPortfolios)">
          <template #icon></template>
        </StatCard>
        <StatCard label="En attente"
                  :value="admin.loading ? '…' : formatNumber(admin.verificationQueue.length)"
                  sub="Éléments à valider">
          <template #icon></template>
        </StatCard>
        <StatCard label="Certifiés"
                  :value="admin.loading ? '…' : formatNumber(certifiedCount)"
                  :sub="`Taux : ${certificationRate}%`">
          <template #icon></template>
        </StatCard>
        <StatCard label="Modèles Favoris" value="Moderne" sub="Utilisé par 45% des étudiants">
          <template #icon>ℹ</template>
        </StatCard>
      </div>

      <!-- Erreur générique, pas de détail serveur exposé -->
      <div v-if="admin.error" class="error-banner" role="alert">
        Une erreur est survenue. Veuillez réessayer ou contacter le support.
      </div>

  
      <div class="card">
        <div class="card__header">
          <h2 class="card__title">Liste des Portfolios</h2>
          <p class="card__subtitle">Affichage des soumissions récentes et de leur statut de certification.</p>
        </div>

        <div class="table-toolbar">
          <div class="search-box">
            <span></span>
            <!-- maxlength sur le champ de recherche -->
            <input v-model="searchQuery" type="text"
                   placeholder="Rechercher un étudiant..."
                   maxlength="100"
                   @input="currentPage = 1" />
          </div>
          <div class="filters">
            <!--Filtre par valeurs fixes uniquement (pas de saisie libre) -->
            <select v-model="statusFilter">
              <option value="">Tous les statuts</option>
              <option value="Certifié">Certifié</option>
              <option value="En attente">En attente</option>
              <option value="Brouillon">Brouillon</option>
            </select>
            <select v-model="sortBy">
              <option value="recent">Plus récents</option>
              <option value="oldest">Plus anciens</option>
            </select>
          </div>
        </div>

        <div v-if="admin.loading" class="state-msg">Chargement…</div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>Titre du Portfolio</th>
              <th>Étudiant</th>
              <th>Statut</th>
              <th>Date de dépôt</th>
              <th>Modèle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in paginatedPortfolios" :key="p.id">
              <td>
                <div class="portfolio-cell">
                  <!-- v-text sur toutes les données venant de l'API/mock -->
                  <span class="portfolio-cell__title" v-text="p.title"></span>
                  <span class="portfolio-cell__ref"   v-text="p.ref"></span>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <div class="avatar">{{ initials(p.student) }}</div>
                  <div>
                    <!-- v-text évite l'injection XSS -->
                    <div class="user-cell__name"  v-text="p.student"></div>
                    <div class="user-cell__email" v-text="p.email"></div>
                  </div>
                </div>
              </td>
              <td><StatusBadge :status="p.statut" /></td>
              <!-- v-text sur la date (évite injection via donnée malformée) -->
              <td class="text-muted" v-text="p.date"></td>
              <td><span class="model-pill" v-text="p.model"></span></td>
              <td>
                <div class="action-btns">
                  <button class="btn btn--icon btn--sm" title="Rafraîchir">🔃</button>
                  <button class="btn btn--icon btn--sm" title="Voir">👁</button>
                  <!-- Confirmation dans le handler handleCertify -->
                  <button class="btn btn--icon btn--sm" title="Certifier"
                          :disabled="certifyingId === p.id"
                          @click="handleCertify(p.id)">
                    {{ certifyingId === p.id ? '…' : '✓' }}
                  </button>
                  <button class="btn btn--icon btn--sm" title="Plus">•••</button>
                </div>
              </td>
            </tr>
            <tr v-if="!admin.loading && paginatedPortfolios.length === 0">
              <td colspan="6" class="state-msg">Aucun portfolio trouvé</td>
            </tr>
          </tbody>
        </table>

        <AppPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="filteredPortfolios.length"
          :per-page="perPage"
          item-label="portfolios"
          @page-change="currentPage = $event"
        />
      </div>

      <footer class="page-footer">
        <span>© 2026 TRUSTY. Plateforme de Portfolios Certifiés.</span>
        <div class="page-footer__links">
          <a href="#">Support</a>
          <a href="#">Confidentialité</a>
          <a href="#">Mentions Légales</a>
        </div>
      </footer>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StatCard      from '../../components/ui/StatCard.vue'
import StatusBadge   from '../../components/ui/StatusBadge.vue'
import AppPagination from '../../components/ui/AppPagination.vue'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore }  from '../../stores/authstore'

const admin     = useAdminStore()
const authStore = useAuthStore()
const router    = useRouter()

// Double vérification du rôle côté composant (en plus du router guard)
const isAuthorized = computed(() =>
  authStore.isAuthenticated && authStore.isAdmin
)

// ── Stats calculées ───────────────────────────────────────
// TODO: remplacer par admin.portfolioStats quand GET /admin/portfolios/stats existe
const totalPortfolios = computed(() => allPortfolios.value.length)

const certifiedCount = computed(() =>
  allPortfolios.value.filter(p => p.statut === 'Certifié').length
)

const certificationRate = computed(() => {
  if (!totalPortfolios.value) return 0
  return Math.round((certifiedCount.value / totalPortfolios.value) * 100)
})

// ── Certifier avec confirmation ───────────────────────────
const certifyingId = ref(null)

async function handleCertify(id) {
  if (!isAuthorized.value) return
  if (!id) return

  const confirmed = confirm(
    'Certifier ce portfolio ? Cette action sera visible publiquement.'
  )
  if (!confirmed) return

  certifyingId.value = id

  try {
    const result = await admin.certifyPortfolio(id)

    if (result?.success) {
      // Mise à jour locale temporaire
      // TODO: supprimer après vrai endpoint refresh
      const portfolio = allPortfolios.value.find(p => p.id === id)
      if (portfolio) portfolio.statut = 'Certifié'
    }
  } catch (error) {
    // Log uniquement en DEV
    if (import.meta.env.DEV) {
      console.error('[AdminPortfolios] Erreur certification :', error)
    }
  } finally {
    certifyingId.value = null
  }
}

async function handleBulkCertify() {
  if (!isAuthorized.value) return

  const pending = allPortfolios.value.filter(p => p.statut === 'En attente')
  if (pending.length === 0) return

  const confirmed = confirm(
    `Certifier les ${pending.length} portfolios en attente ? Cette action est irréversible.`
  )
  if (!confirmed) return

  // TODO: appeler admin.bulkCertify() quand l'endpoint sera disponible
  if (import.meta.env.DEV) {
    console.log('[AdminPortfolios] Bulk certify déclenché pour', pending.length, 'portfolios')
  }
}

// ── Recherche / filtre / tri / pagination ─────────────────
const searchQuery  = ref('')
const statusFilter = ref('')
const sortBy       = ref('recent')
const currentPage  = ref(1)
const perPage      = 5

//  Valeurs de filtre statut autorisées (whitelist)
const ALLOWED_STATUTS = ['', 'Certifié', 'En attente', 'Brouillon']

const filteredPortfolios = computed(() => {
  let list = [...allPortfolios.value]

  if (searchQuery.value.trim()) {
    // Trim + limite longueur sur la query
    const q = searchQuery.value.toLowerCase().trim().slice(0, 100)
    list = list.filter(p =>
      p.student.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    )
  }

  //  On n'applique le filtre que si la valeur est dans la whitelist
  if (statusFilter.value && ALLOWED_STATUTS.includes(statusFilter.value)) {
    list = list.filter(p => p.statut === statusFilter.value)
  }

  if (sortBy.value === 'oldest') list = list.reverse()

  return list
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPortfolios.value.length / perPage))
)

const paginatedPortfolios = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredPortfolios.value.slice(start, start + perPage)
})

// ── Helpers ───────────────────────────────────────────────
function initials(name) {
  if (!name || typeof name !== 'string') return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatNumber(val) {
  if (!val && val !== 0) return '—'
  return Number(val).toLocaleString('fr-FR')
}

// ── Mock data temporaire ──────────────────────────────────
// TODO: remplacer par admin.portfolios après création GET /admin/portfolios
const allPortfolios = ref([
  { id: 1, title: 'Portfolio Design UX/UI 2024',      ref: 'PF-001', student: 'Julie Martin',  email: 'julie.martin@ecole.fr',  statut: 'Certifié',   date: '12 Mai 2024', model: 'Moderne'    },
  { id: 2, title: 'Projets Développement Fullstack',   ref: 'PF-002', student: 'Lucas Bernard', email: 'lucas.bernard@ecole.fr', statut: 'En attente', date: '14 Mai 2024', model: 'Minimaliste' },
  { id: 3, title: 'Alternance Data Science',           ref: 'PF-003', student: 'Sophie Petit',  email: 'sophie.petit@ecole.fr',  statut: 'Certifié',   date: '10 Mai 2024', model: 'Classique'   },
  { id: 4, title: 'Portfolio Créatif - Motion Design', ref: 'PF-004', student: 'Thomas Durand', email: 'thomas.durand@ecole.fr', statut: 'Brouillon',  date: '08 Mai 2024', model: 'Créatif'     },
  { id: 5, title: 'Cyber-sécurité & Réseaux',          ref: 'PF-005', student: 'Emma Lefebvre', email: 'emma.lefebvre@ecole.fr', statut: 'En attente', date: '15 Mai 2024', model: 'Moderne'     },
  { id: 6, title: 'Intelligence Artificielle Avancée', ref: 'PF-006', student: 'Marc Rousseau', email: 'marc.r@ecole.fr',        statut: 'Certifié',   date: '09 Mai 2024', model: 'Moderne'     },
  { id: 7, title: 'Développement Mobile iOS/Android',  ref: 'PF-007', student: 'Chloé Garcia',  email: 'chloe.g@ecole.fr',       statut: 'En attente', date: '07 Mai 2024', model: 'Minimaliste' },
])

// ── Chargement initial sécurisé ───────────────────────────
onMounted(async () => {
  try {
    // Vérification du rôle ADMIN avant tout chargement de données
    if (!isAuthorized.value) {
      router.replace('/403')
      return
    }

    // Stat réelle depuis le backend
    await admin.fetchVerificationQueue()

    // TODO: décommenter quand l'endpoint sera prêt
    // await admin.fetchPortfolios()

  } catch (error) {
    // Log uniquement en DEV
    if (import.meta.env.DEV) {
      console.error('[AdminPortfolios] Erreur chargement :', error)
    }
  }
})
</script>

<style scoped>
.page           { padding: 32px; min-height: 100vh; display: flex; flex-direction: column; }
.page__header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title    { font-size: 24px; font-weight: 700; color: #D6EDE8; }
.page__subtitle { font-size: 14px; color: #8aada9; margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.stats-row { display: flex; gap: 16px; margin-bottom: 20px; }

.card { background: #1A3838; border: 1px solid #2a4a48; border-radius: 12px; padding: 20px; flex: 1; }
.card__header   { margin-bottom: 16px; }
.card__title    { font-size: 16px; font-weight: 600; color: #D6EDE8; }
.card__subtitle { font-size: 13px; color: #8aada9; margin-top: 2px; }

.table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-box {
  display: flex; align-items: center; gap: 8px;
  border: 1px solid #2a4a48; border-radius: 8px;
  padding: 8px 12px; width: 260px;
  background: #0f2424;
}
.search-box input { border: none; outline: none; font-size: 13px; width: 100%; color: #c8deda; background: transparent; }
.filters { display: flex; gap: 8px; }
.filters select {
  padding: 8px 12px; border: 1px solid #2a4a48;
  border-radius: 8px; font-size: 13px; outline: none;
  color: #c8deda; background: #0f2424; cursor: pointer;
}

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left; padding: 10px;
  font-size: 12px; font-weight: 600; color: #8aada9;
  text-transform: uppercase; border-bottom: 1px solid #2a4a48;
}
.table td { padding: 12px 10px; border-bottom: 1px solid #1e3a3a; vertical-align: middle; }
.table tr:hover td { background: #0f2424; }

.portfolio-cell          { display: flex; flex-direction: column; }
.portfolio-cell__title   { font-weight: 500; color: #D6EDE8; font-size: 13px; }
.portfolio-cell__ref     { font-size: 11px; color: #4a6e6a; margin-top: 2px; }

.user-cell       { display: flex; align-items: center; gap: 10px; }
.user-cell__name { font-size: 13px; font-weight: 500; color: #D6EDE8; }
.user-cell__email{ font-size: 11px; color: #4a6e6a; }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: #5C8C6A; color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.model-pill { background: #162e2e; color: #c8deda; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
.text-muted { color: #4a6e6a; font-size: 13px; }
.action-btns { display: flex; gap: 4px; }
.state-msg { text-align: center; padding: 24px; color: #4a6e6a; font-size: 13px; }

.error-banner {
  background: #3a1a1a; border: 1px solid #6a2a2a;
  color: #f87171; padding: 10px 16px;
  border-radius: 8px; font-size: 13px; margin-bottom: 20px;
}

.page-footer {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: auto; padding-top: 24px;
  border-top: 1px solid #2a4a48; font-size: 12px; color: #4a6e6a;
}
.page-footer__links { display: flex; gap: 16px; }
.page-footer__links a { color: #4a6e6a; text-decoration: none; }
.page-footer__links a:hover { color: #8aada9; }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn--primary         { background: #5C8C6A; color: #fff; }
.btn--primary:hover   { background: #4a7058; }
.btn--secondary       { background: #1A3838; border: 1px solid #2a4a48; color: #c8deda; }
.btn--secondary:hover { background: #162e2e; }
.btn--sm   { padding: 5px 10px; font-size: 12px; }
.btn--icon { background: transparent; border: 1px solid #2a4a48; color: #8aada9; padding: 5px 9px; }
.btn--icon:hover { background: #162e2e; }
</style>