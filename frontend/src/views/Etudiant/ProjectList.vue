<template>
  <div class="projets-page" @keydown.esc="handleEscape">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Projets</h1>
          <p class="page-subtitle">Suivez l'état de validation de vos réalisations et soumettez-en de nouvelles.</p>
        </div>
      </div>
      <button class="add-btn" @click="openNewModal" :disabled="submitting">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nouveau projet
      </button>
    </div>

    <!-- Stats -->
    <ProjetStatsCards :stats="store.stats" />

    <!-- Liste des projets -->
    <div class="section-header">
      <div class="section-header-left">
        <span class="section-title">Liste des projets</span>
        <span class="section-count">{{ filteredProjets.length }} projet(s)</span>
      </div>
      <div class="section-actions">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Rechercher un projet…"
            class="search-input"
            maxlength="100"
            autocomplete="off"
            spellcheck="false"
            aria-label="Rechercher un projet"
          />
        </div>
        <button
          class="filter-btn"
          @click="showFilters = !showFilters"
          :aria-expanded="showFilters"
          aria-controls="filter-bar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" aria-hidden="true">
            <line x1="4" y1="6" x2="11" y2="6"/><line x1="4" y1="12" x2="17" y2="12"/><line x1="4" y1="18" x2="23" y2="18"/>
          </svg>
          Filtres
        </button>
      </div>
    </div>

    <!-- Filter bar -->
    <div v-if="showFilters" id="filter-bar" class="filter-bar" role="group" aria-label="Filtres actifs">
      <select v-model="filterStatus" class="filter-select" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option value="VALIDE">Validé</option>
        <option value="EN_ATTENTE">En attente</option>
        <option value="REJETE">Refusé</option>
      </select>
      <select v-model="filterType" class="filter-select" aria-label="Filtrer par type">
        <option value="">Tous les types</option>
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

    <ProjetTableCards
      :projets="paginatedProjets"
      :total="filteredProjets.length"
      :page="currentPage"
      :total-pages="totalPages"
      :loading="store.loading"
      :error="store.error"
      @view="viewProjet"
      @edit="openEditModal"
      @delete="confirmDelete"
      @join-rapport="openRapportModal"
      @update:page="currentPage = $event"
    />

    <!-- Bottom Grid (info cards) -->
    <div class="bottom-grid">
      <div class="info-card">
        <div class="info-card-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div class="info-card-content">
          <h4 class="info-card-title">Guide de validation</h4>
          <p class="info-card-text">
            Pour garantir une validation rapide, assurez-vous de joindre tous les livrables requis ainsi qu'un lien vers votre dépôt GitHub ou document de synthèse.
          </p>
        </div>
      </div>
      <div class="info-card">
        <div class="info-card-icon accent" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="info-card-content">
          <h4 class="info-card-title">Statut Certifié</h4>
          <p class="info-card-text">
            Une fois validé par votre professeur, votre projet reçoit automatiquement un badge de certification exportable vers LinkedIn ou votre Portfolio public.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal création / édition -->
    <ProjetFormModal
      v-model="showModal"
      :edit-mode="editMode"
      :initial-form="form"
      :submitting="submitting"
      :modal-error="modalError"
      @submit="handleFormSubmit"
      @created="handleCreated"
    />

    <!-- Modal détail (lecture seule) -->
    <ProjetDetailModal
      v-model="showDetail"
      :projet="selectedProjet"
      @edit="openEditModal"
    />

    <!-- Confirmation suppression -->
    <ConfirmModal
      v-model="showConfirm"
      title="Supprimer ce projet ?"
      :message="deleteMessage"
      confirm-text="Oui, supprimer"
      @confirm="handleDeleteConfirmed"
    />

    <!-- Modal joindre un rapport -->
    <ProjetRapportModal
      v-model="showRapportModal"
      @save="handleRapportSave"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProjetStore } from '@/stores/projetStore'
import {
  nomComplet, formatType, formatStatut, formatDate, emptyForm,
} from '@/components/projets/projetHelpers'

import ProjetStatsCards   from '@/components/projets/projetStatsCards.vue'
import ProjetTableCards   from '@/components/projets/ProjetTableCards.vue'
import ProjetFormModal    from '@/components/projets/projetFormModal.vue'
import ProjetDetailModal  from '@/components/projets/projetDetailModal.vue'
import ProjetRapportModal from '@/components/projets/ProjetRapportModal.vue'
import ConfirmModal       from '@/components/stages/ConfirmModal.vue'

const store = useProjetStore()

const showModal   = ref(false)
const editMode    = ref(false)
const editId      = ref(null)
const submitting  = ref(false)
const modalError  = ref(null)
const form        = ref(emptyForm())

const showDetail     = ref(false)
const selectedProjet = ref({})

const showConfirm    = ref(false)
const projetToDelete = ref(null)

const showRapportModal = ref(false)
const rapportTarget    = ref(null)

const searchQuery  = ref('')
const showFilters  = ref(false)
const filterStatus = ref('')
const filterType   = ref('')
const currentPage  = ref(1)
const pageSize     = 8

/**
 * Supprime les balises HTML d'une valeur avant affichage ou envoi API.
 */
function sanitizeText(value, maxLen = 500) {
  if (!value) return ''
  return String(value).replace(/<[^>]*>/g, '').trim().slice(0, maxLen)
}

/**
 * Message de confirmation de suppression construit via computed
 * pour éviter toute interpolation directe de données API brutes dans le template.
 */
const deleteMessage = computed(() => {
  const titre = sanitizeText(projetToDelete.value?.titre || '')
  return `Le projet « ${titre} » sera définitivement supprimé. Cette action est irréversible.`
})

/**
 * Ferme la modal ou le dialogue ouvert lors d'un appui sur Escape.
 */
function handleEscape() {
  if (showConfirm.value) {
    showConfirm.value = false
  } else if (showRapportModal.value) {
    showRapportModal.value = false
  } else if (showDetail.value) {
    showDetail.value = false
  } else if (showModal.value) {
    showModal.value = false
  }
}

const filteredProjets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase().slice(0, 100)
  let list = store.projets.filter(p => {
    const matchSearch = !q
      || p.titre.toLowerCase().includes(q)
      || p.description?.toLowerCase().includes(q)
      || p.participations?.some(part => nomComplet(part.etudiant).toLowerCase().includes(q))
    const matchStatus = !filterStatus.value || p.status_validation === filterStatus.value
    const matchType   = !filterType.value   || p.type_projet === filterType.value
    return matchSearch && matchStatus && matchType
  })
  list = [...list].sort((a, b) => {
    const da = new Date(a.date_soumission || 0)
    const db = new Date(b.date_soumission || 0)
    return db - da
  })
  return list
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProjets.value.length / pageSize))
)

const paginatedProjets = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredProjets.value.slice(start, start + pageSize)
})

watch([searchQuery, filterStatus, filterType], () => { currentPage.value = 1 })

function openNewModal() {
  if (submitting.value) return
  editMode.value   = false
  editId.value     = null
  form.value       = emptyForm()
  modalError.value = null
  showModal.value  = true
}

function openEditModal(projet) {
  if (submitting.value) return
  editMode.value   = true
  editId.value     = projet.id_projet
  modalError.value = null
  form.value = {
    titre:                 sanitizeText(projet.titre, 200),
    type_projet:           projet.type_projet,
    description:           sanitizeText(projet.description, 2000),
    date_debut:            projet.date_debut  ? projet.date_debut.split('T')[0]  : '',
    date_fin:              projet.date_fin    ? projet.date_fin.split('T')[0]    : '',
    lien_github:           sanitizeText(projet.lien_github    ?? '', 500),
    lien_youtube:          sanitizeText(projet.lien_youtube   ?? '', 500),
    lien_demo:             sanitizeText(projet.lien_demo      ?? '', 500),
    resultats_obtenus:     sanitizeText(projet.resultats_obtenus ?? '', 2000),
    nombre_collaborateurs: projet.nombre_collaborateurs ?? 1,
    est_public:            projet.est_public,
  }
  showModal.value = true
}

/**
 * Filtre les champs autorisés avant envoi à l'API (whitelist explicite)
 * et retire les champs vides optionnels.
 */
async function handleFormSubmit(formData) {
  if (submitting.value) return
  submitting.value = true
  modalError.value = null
  try {
    const allowedFields = [
      'titre', 'type_projet', 'description', 'date_debut', 'date_fin',
      'lien_github', 'lien_youtube', 'lien_demo',
      'resultats_obtenus', 'nombre_collaborateurs', 'est_public',
    ]
    const payload = {}
    for (const k of allowedFields) {
      if (formData[k] !== undefined) payload[k] = formData[k]
    }
    ;['date_fin', 'lien_github', 'lien_youtube', 'lien_demo', 'resultats_obtenus'].forEach(k => {
      if (!payload[k]) delete payload[k]
    })
    if (editMode.value) await store.updateProjet(editId.value, payload)
    else                await store.createProjet(payload)
    showModal.value = false
  } catch (e) {
    modalError.value = e.response?.data?.message ?? e.message ?? 'Une erreur est survenue'
  } finally {
    submitting.value = false
  }
}

function handleCreated() {
  store.fetchProjets()
}

function viewProjet(projet) {
  if (submitting.value) return
  selectedProjet.value = projet
  showDetail.value     = true
}

function confirmDelete(projet) {
  if (submitting.value) return
  projetToDelete.value = projet
  showConfirm.value    = true
}

function openRapportModal(projet) {
  if (submitting.value) return
  rapportTarget.value    = projet
  showRapportModal.value = true
}

function handleRapportSave(data) {
  const p = rapportTarget.value
  if (!p) return
  p.rapport = sanitizeText(data.url || data.nom, 500)
  rapportTarget.value = null
}

async function handleDeleteConfirmed() {
  const p = projetToDelete.value
  if (!p) return
  if (submitting.value) return
  submitting.value = true
  try {
    await store.deleteProjet(p.id_projet)
    showConfirm.value    = false
    projetToDelete.value = null
  } catch (e) {
    store.error = sanitizeText(e.response?.data?.message ?? e.message ?? 'Suppression échouée', 200)
    showConfirm.value = false
  } finally {
    submitting.value = false
  }
}

onMounted(() => store.fetchProjets())

onUnmounted(() => {
  submitting.value = false
})
</script>

<style scoped>
.projets-page {
  max-width: 100%;
  margin: 0;
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.header-icon {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-border);
  border-radius: 10px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.15rem;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.1rem;
  background: var(--color-accent);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
}

.add-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(61, 107, 94, 0.3);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-header-left {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-count {
  font-size: 0.78rem;
  color: var(--color-text-tertiary);
}

.section-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  width: 14px; height: 14px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.75rem 0.45rem 30px;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.8rem;
  width: 200px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-accent);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.38rem 0.85rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--color-accent-border);
  background: var(--color-surface-hover);
}

.filter-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.filter-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus {
  border-color: var(--color-accent);
}

.filter-select option { background: var(--color-surface); }

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-top: 1.5rem;
}

.info-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.25rem 1.3rem;
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  transition: border-color 0.2s;
}

.info-card:hover {
  border-color: var(--color-accent-border);
}

.info-card-icon {
  width: 38px; height: 38px;
  border-radius: 8px;
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-card-icon.accent {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.info-card-content {
  flex: 1;
}

.info-card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.35rem;
}

.info-card-text {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 768px) {
  .bottom-grid { grid-template-columns: 1fr; }
  .search-input { width: 150px; }
}
</style>
