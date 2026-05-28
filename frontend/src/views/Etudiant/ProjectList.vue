<template>
  <div class="projets-page">

    <!-- ── Loading overlay ── -->
    <transition name="fade">
      <div v-if="store.loading" class="loading-overlay">
        <div class="spinner"></div>
        <p class="loading-text">Chargement des projets…</p>
      </div>
    </transition>

    <!-- ── Error banner ── -->
    <transition name="slide-down">
      <div v-if="store.error" class="error-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ store.error }}
        <button class="error-close" @click="store.clearError()">×</button>
      </div>
    </transition>

    <!-- ── Header ── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Projets</h1>
        <p class="page-subtitle">
          Suivez l'état de validation de vos réalisations et soumettez-en de nouvelles.
        </p>
      </div>
      <button class="btn-nouveau" @click="openNewProjectModal">
        <span class="btn-icon">+</span>
        Nouveau projet
      </button>
    </div>

    <!-- ── Stats ── -->
    <ProjetStatsCards :stats="store.stats" />

    <!-- ── Table Section ── -->
    <div class="table-section">
      <div class="table-toolbar">
        <h2 class="table-title">Liste des Projets</h2>
        <div class="toolbar-right">
          <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input v-model="searchQuery" type="text"
                   placeholder="Rechercher un projet…" class="search-input" />
          </div>
          <button class="btn-filter" @click="showFilters = !showFilters">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" width="14" height="14">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
            </svg>
            Filtres
          </button>
          <button class="btn-refresh" :class="{ spinning: store.loading }"
                  title="Actualiser" @click="store.fetchProjets()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" width="14" height="14">
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Filter Panel -->
      <transition name="slide-down">
        <div v-if="showFilters" class="filter-panel">
          <div class="filter-group">
            <label class="filter-label">Statut</label>
            <select v-model="filterStatus" class="filter-select">
              <option value="">Tous</option>
              <option value="VALIDE">Validé</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="REJETE">Refusé</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Type</label>
            <select v-model="filterType" class="filter-select">
              <option value="">Tous</option>
              <option value="MODULE">Module</option>
              <option value="INTEGRATION">Intégration</option>
              <option value="PFA">PFA</option>
              <option value="PFE">PFE</option>
              <option value="HACKATHON">Hackathon</option>
              <option value="PERSONNEL">Personnel</option>
              <option value="STAGE">Stage</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <button class="btn-reset-filter" @click="resetFilters">Réinitialiser</button>
        </div>
      </transition>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="projets-table">
          <thead>
            <tr>
              <th class="th-sortable" @click="sortBy('titre')">
                Titre du Projet
                <span class="sort-icon">
                  {{ sortField === 'titre' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}
                </span>
              </th>
              <th>Étudiant(s)</th>
              <th>Technologies</th>
              <th>Statut</th>
              <th class="th-sortable" @click="sortBy('date_soumission')">
                Date de dépôt
                <span class="sort-icon">
                  {{ sortField === 'date_soumission' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}
                </span>
              </th>
              <th class="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(projet, index) in paginatedProjets"
              :key="projet.id_projet"
              class="table-row"
              :style="{ animationDelay: `${index * 50}ms` }"
            >
              <!-- Titre + type -->
              <td class="td-titre">
                <div class="projet-titre">{{ projet.titre }}</div>
                <div class="projet-type">{{ formatType(projet.type_projet) }}</div>
              </td>

              <!-- Participants -->
              <td class="td-etudiant">
                <template v-if="projet.participations?.length">
                  <div v-for="p in projet.participations" :key="p.id_etudiant"
                       class="participant-chip">
                    <span class="participant-avatar">{{ initiales(p.etudiant) }}</span>
                    <span class="participant-info">
                      <span class="participant-nom">{{ nomComplet(p.etudiant) }}</span>
                      <span class="participant-role">{{ p.role_joue }}</span>
                    </span>
                  </div>
                </template>
                <span v-else class="no-data">—</span>
              </td>

              <!-- Technologies -->
              <td class="td-tech">
                <template v-if="projet.technologies?.length">
                  <span
                    v-for="t in projet.technologies.slice(0, 3)"
                    :key="t.id_technologie"
                    class="tech-badge"
                    :title="`${t.technologie.categorie} · ${formatNiveau(t.niveau_utilisation)}`"
                  >{{ t.technologie.nom }}</span>
                  <span v-if="projet.technologies.length > 3" class="tech-more">
                    +{{ projet.technologies.length - 3 }}
                  </span>
                </template>
                <span v-else class="no-data">—</span>
              </td>

              <!-- Statut -->
              <td>
                <span :class="[
                  'badge-statut',
                  `badge-${projet.status_validation.toLowerCase().replace('_', '-')}`
                ]">
                  {{ formatStatut(projet.status_validation) }}
                </span>
                <div v-if="projet.appreciation" class="appreciation-tag">
                  {{ projet.appreciation }}
                </div>
              </td>

              <!-- Date -->
              <td class="td-date">{{ formatDate(projet.date_soumission) }}</td>

              <!-- Actions -->
              <td class="td-actions">
                <button class="action-btn" title="Voir" @click="viewProjet(projet)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" width="15" height="15">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="action-btn" title="Modifier" @click="openEditModal(projet)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="2" width="15" height="15">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <div class="more-menu-wrapper">
                  <button class="action-btn" @click.stop="toggleMenu(projet.id_projet)">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                      <circle cx="12" cy="5" r="1.5"/>
                      <circle cx="12" cy="12" r="1.5"/>
                      <circle cx="12" cy="19" r="1.5"/>
                    </svg>
                  </button>
                  <transition name="fade">
                    <div v-if="openMenu === projet.id_projet" class="more-menu">
                      <button class="menu-item menu-item-danger" @click="confirmDelete(projet)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" width="13" height="13">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/>
                          <path d="M10,11v6"/><path d="M14,11v6"/>
                          <path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2"/>
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </transition>
                </div>
              </td>
            </tr>

            <tr v-if="!store.loading && filteredProjets.length === 0">
              <td colspan="6" class="td-empty">
                <div class="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       stroke-width="1" width="44" height="44">
                    <rect x="3" y="3" width="7" height="7" rx="1"/>
                    <rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/>
                    <rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                  <p>Aucun projet trouvé</p>
                  <span>Modifiez vos filtres ou créez un nouveau projet.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-bar">
        <span class="pagination-info">
          Affichage de {{ paginatedProjets.length }} sur {{ filteredProjets.length }} projet(s)
        </span>
        <div class="pagination-controls">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
            Précédent
          </button>
          <span
            v-for="p in totalPages" :key="p"
            :class="['page-num', { active: p === currentPage }]"
            @click="currentPage = p"
          >{{ p }}</span>
          <button class="page-btn"
                  :disabled="currentPage === totalPages || totalPages === 0"
                  @click="currentPage++">
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- ── Info Cards ── -->
    <div class="info-cards">
      <div class="info-card">
        <div class="info-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.5" width="22" height="22">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="info-card-content">
          <h4 class="info-card-title">Guide de validation</h4>
          <p class="info-card-text">
            Pour garantir une validation rapide, assurez-vous de joindre tous les livrables
            requis ainsi qu'un lien vers votre dépôt GitHub ou document de synthèse.
          </p>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-icon accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.5" width="22" height="22">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="info-card-content">
          <h4 class="info-card-title">Statut Certifié</h4>
          <p class="info-card-text">
            Une fois validé par votre professeur, votre projet reçoit automatiquement
            un badge de certification exportable vers LinkedIn ou votre Portfolio public.
          </p>
        </div>
      </div>
    </div>

    <!-- ── Modals ── -->
    <ProjetFormModal
      v-model="showModal"
      :edit-mode="editMode"
      :initial-form="form"
      :submitting="submitting"
      :modal-error="modalError"
      @submit="handleFormSubmit"
    />

    <ProjetDetailModal
      v-model="showDetail"
      :projet="selectedProjet"
    />

    <ProjetDeleteModal
      v-model="showConfirmDelete"
      :projet="projetToDelete"
      :submitting="submitting"
      @confirm="handleDelete"
    />

  </div>
</template>

<script>
import { useProjetStore }   from '@/stores/projetStore'
import ProjetStatsCards     from '@/components/projets/projetStatsCards.vue'
import ProjetFormModal      from '@/components/projets/projetFormModal.vue'
import ProjetDetailModal    from '@/components/projets/projetDetailModal.vue'
import ProjetDeleteModal    from '@/components/projets/projetDeleteModal.vue'
import {
  nomComplet, initiales, formatType, formatStatut,
  formatNiveau, formatDate, emptyForm, buildPayload,
} from '@/components/projets/projetHelpers'

export default {
  name: 'ProjectList',

  components: {
    ProjetStatsCards,
    ProjetFormModal,
    ProjetDetailModal,
    ProjetDeleteModal,
  },

  setup() {
    const store = useProjetStore()
    return { store }
  },

  data() {
    return {
      // table / filtres
      searchQuery:  '',
      showFilters:  false,
      filterStatus: '',
      filterType:   '',
      sortField:    'date_soumission',
      sortDir:      'desc',
      currentPage:  1,
      pageSize:     5,
      openMenu:     null,
      // form modal
      showModal:    false,
      editMode:     false,
      editId:       null,
      submitting:   false,
      modalError:   null,
      form:         emptyForm(),
      // detail modal
      showDetail:     false,
      selectedProjet: {},
      // delete modal
      showConfirmDelete: false,
      projetToDelete:    null,
    }
  },

  computed: {
    filteredProjets() {
      const q = this.searchQuery.toLowerCase()
      let list = this.store.projets.filter(p => {
        const matchSearch = !q
          || p.titre.toLowerCase().includes(q)
          || p.description?.toLowerCase().includes(q)
          || p.participations?.some(part => nomComplet(part.etudiant).toLowerCase().includes(q))
        const matchStatus = !this.filterStatus || p.status_validation === this.filterStatus
        const matchType   = !this.filterType   || p.type_projet      === this.filterType
        return matchSearch && matchStatus && matchType
      })
      list = [...list].sort((a, b) => {
        const av = a[this.sortField] ?? ''
        const bv = b[this.sortField] ?? ''
        return this.sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
      return list
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredProjets.length / this.pageSize))
    },

    paginatedProjets() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredProjets.slice(start, start + this.pageSize)
    },
  },

  watch: {
    searchQuery()  { this.currentPage = 1 },
    filterStatus() { this.currentPage = 1 },
    filterType()   { this.currentPage = 1 },
  },

  mounted() {
    this.store.fetchProjets()
    document.addEventListener('click', this.closeMenu)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  },

  methods: {
    // ── Helpers (exposés au template) ──────────────────────────────────────
    nomComplet, initiales, formatType, formatStatut, formatNiveau, formatDate,

    // ── Modal handlers ─────────────────────────────────────────────────────
    openNewProjectModal() {
      this.editMode   = false
      this.editId     = null
      this.form       = emptyForm()
      this.modalError = null
      this.showModal  = true
    },

    openEditModal(projet) {
      this.editMode   = true
      this.editId     = projet.id_projet
      this.modalError = null
      this.form = {
        titre:                 projet.titre,
        type_projet:           projet.type_projet,
        description:           projet.description,
        date_debut:            projet.date_debut  ? projet.date_debut.split('T')[0]  : '',
        date_fin:              projet.date_fin    ? projet.date_fin.split('T')[0]    : '',
        lien_github:           projet.lien_github    ?? '',
        lien_youtube:          projet.lien_youtube   ?? '',
        lien_demo:             projet.lien_demo      ?? '',
        resultats_obtenus:     projet.resultats_obtenus ?? '',
        nombre_collaborateurs: projet.nombre_collaborateurs ?? 1,
        est_public:            projet.est_public,
      }
      this.openMenu  = null
      this.showModal = true
    },

    async handleFormSubmit(formData) {
      this.submitting = true
      this.modalError = null
      try {
        const payload = buildPayload(formData)
        if (this.editMode) await this.store.updateProjet(this.editId, payload)
        else               await this.store.createProjet(payload)
        this.showModal = false
      } catch (e) {
        this.modalError = e.response?.data?.message ?? e.message ?? 'Une erreur est survenue'
      } finally {
        this.submitting = false
      }
    },

    async handleDelete() {
      if (!this.projetToDelete) return
      this.submitting = true
      try {
        await this.store.deleteProjet(this.projetToDelete.id_projet)
        this.showConfirmDelete = false
        this.projetToDelete    = null
        this.openMenu          = null
      } catch (e) {
        this.store.error = e.response?.data?.message ?? e.message ?? 'Suppression échouée'
        this.showConfirmDelete = false
      } finally {
        this.submitting = false
      }
    },

    viewProjet(projet) {
      this.selectedProjet = projet
      this.showDetail     = true
      this.openMenu       = null
    },

    confirmDelete(projet) {
      this.projetToDelete    = projet
      this.showConfirmDelete = true
      this.openMenu          = null
    },

    // ── UI helpers ─────────────────────────────────────────────────────────
    toggleMenu(id) { this.openMenu = this.openMenu === id ? null : id },
    closeMenu(e)   { if (!e.target.closest('.more-menu-wrapper')) this.openMenu = null },
    resetFilters() { this.filterStatus = ''; this.filterType = ''; this.searchQuery = '' },
    sortBy(field) {
      if (this.sortField === field) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      else { this.sortField = field; this.sortDir = 'desc' }
    },
  },
}
</script>
<style scoped>
   @import "@/assets/projet"
</style>