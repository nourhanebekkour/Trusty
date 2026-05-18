<template>
  <div class="stages-page">

    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>Gestion des Stages</h1>
        <p>Suivez vos expériences professionnelles et gérez vos demandes de validation.</p>
      </div>
      <button class="btn-new" @click="openModal('create')">
        <span>＋</span> Nouveau stage
      </button>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-label">Total des Stages</div>
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-sub">Expériences enregistrées au total</div>
      </div>
      <div class="stat-card stat-card--blue">
        <div class="stat-icon">✓</div>
        <div class="stat-label">Stages Validés</div>
        <div class="stat-value">{{ stats.valides }}</div>
        <div class="stat-sub">Certifiés par un tuteur pédagogique</div>
      </div>
      <div class="stat-card stat-card--amber">
        <div class="stat-icon">⏳</div>
        <div class="stat-label">En attente</div>
        <div class="stat-value">{{ stats.enAttente }}</div>
        <div class="stat-sub">Dossiers en cours de révision</div>
      </div>
    </div>

    <!-- Table Section -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">Liste des expériences</span>
        <div class="section-actions">
          <button class="btn-sm" @click="showFilter = !showFilter">⊟ Filtrer</button>
        </div>
      </div>

      <!-- Filter bar -->
      <div v-if="showFilter" class="filter-bar">
        <select v-model="filterStatut" class="filter-select">
          <option value="">Tous les statuts</option>
          <option value="VALIDE">Validé</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="REJETE">Rejeté</option>
        </select>
        <input
          v-model="filterSearch"
          class="filter-input"
          placeholder="Rechercher une entreprise..."
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Chargement des stages...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <span>⚠ {{ error }}</span>
        <button class="btn-sm" @click="fetchStages">Réessayer</button>
      </div>

      <!-- Table -->
      <table v-else>
        <thead>
          <tr>
            <th>Entreprise</th>
            <th>Professeur Tuteur</th>
            <th>Statut</th>
            <th>Date de début</th>
            <th>Date de fin</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stage in stagesPagines" :key="stage.id_stage">
            <td>
              <div class="company-cell">
                <div class="company-logo" :style="{ background: logoColor(stage.entreprise) }">
                  {{ initiales(stage.entreprise) }}
                </div>
                <div>
                  <div class="company-name">{{ stage.entreprise }}</div>
                  <div class="company-sector">⊞ {{ stage.poste }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="tutor-cell">
                <div class="tutor-avatar" :style="{ background: avatarColor(stage.encadrant_academique) }">
                  {{ initiales(stage.encadrant_academique || '??') }}
                </div>
                <div class="tutor-name">{{ stage.encadrant_academique || '—' }}</div>
              </div>
            </td>
            <td>
              <span class="badge" :class="badgeClass(stage.status_validation)">
                <span class="badge-dot"></span>
                {{ labelStatut(stage.status_validation) }}
              </span>
            </td>
            <td>
              <div class="date-cell">
                <span class="date-icon">📅</span>
                {{ formatDate(stage.date_debut) }}
              </div>
            </td>
            <td>
              <div class="date-cell">
                <span class="date-icon">📅</span>
                {{ stage.date_fin ? formatDate(stage.date_fin) : '—' }}
              </div>
            </td>
            <td>
              <div class="action-cell">
                <button class="action-btn" title="Voir" @click="voirStage(stage)">👁</button>
                <button class="action-btn" title="Modifier" @click="openModal('edit', stage)">✎</button>
                <button class="action-btn action-btn--danger" title="Supprimer" @click="confirmerSuppression(stage)">🗑</button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && stagesFiltres.length === 0">
            <td colspan="6" class="empty-state">Aucun stage trouvé.</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="table-footer">
        <div class="table-info">
          Affichage de {{ stagesPagines.length }} stages sur {{ stagesFiltres.length }} au total
        </div>
        <div class="pagination">
          <button class="page-btn" :disabled="page === 1" @click="page--">‹</button>
          <button
            v-for="p in totalPages" :key="p"
            class="page-btn" :class="{ active: p === page }"
            @click="page = p"
          >{{ p }}</button>
          <button class="page-btn" :disabled="page === totalPages" @click="page++">›</button>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="bottom-grid">
      <div class="info-card">
        <div class="info-card-title"><span>❓</span> Comment faire valider un stage ?</div>
        <ul class="info-list">
          <li>Télécharger votre convention de stage signée.</li>
          <li>Soumettre votre rapport de stage de fin de période.</li>
          <li>Demander l'évaluation de votre tuteur en entreprise via la plateforme.</li>
          <li>Attendre la validation finale de votre professeur référent.</li>
        </ul>
      </div>
      <div class="info-card">
        <div class="info-card-title"><span>📎</span> Ressources UTILES</div>
        <div class="resources">
          <div class="resource-item" @click="downloadResource('guide')">
            <div class="resource-icon resource-icon--pdf">📄</div>
            <div>
              <div class="resource-name">Guide des Stages</div>
              <div class="resource-meta">PDF · 2.4 Mo</div>
            </div>
            <div class="resource-action">↓</div>
          </div>
          <div class="resource-item" @click="downloadResource('modele')">
            <div class="resource-icon resource-icon--doc">📝</div>
            <div>
              <div class="resource-name">Modèle Rapport</div>
              <div class="resource-meta">DOCX · 1.1 Mo</div>
            </div>
            <div class="resource-action">＋</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Modal Création / Édition ─── -->
    <Teleport to="body">
      <div v-if="modal.open" class="modal-overlay" @click.self="modal.open = false">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ modal.mode === 'create' ? 'Nouveau stage' : 'Modifier le stage' }}</h2>
            <button class="modal-close" @click="modal.open = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>Entreprise *</label>
                <input v-model="form.entreprise" class="form-input" placeholder="ex: TechFlow Solutions" />
              </div>
              <div class="form-group">
                <label>Poste *</label>
                <input v-model="form.poste" class="form-input" placeholder="ex: Développeur Full Stack" />
              </div>
              <div class="form-group">
                <label>Adresse entreprise</label>
                <input v-model="form.adresse_entreprise" class="form-input" placeholder="ex: Casablanca, Maroc" />
              </div>
              <div class="form-group">
                <label>Encadrant professionnel</label>
                <input v-model="form.encadrant_professionnel" class="form-input" placeholder="Nom de l'encadrant" />
              </div>
              <div class="form-group">
                <label>Encadrant académique</label>
                <input v-model="form.encadrant_academique" class="form-input" placeholder="Nom du tuteur" />
              </div>
              <div class="form-group">
                <label>Durée (semaines)</label>
                <input v-model.number="form.duree_semaines" type="number" class="form-input" placeholder="ex: 8" />
              </div>
              <div class="form-group">
                <label>Date de début *</label>
                <input v-model="form.date_debut" type="date" class="form-input" />
              </div>
              <div class="form-group">
                <label>Date de fin</label>
                <input v-model="form.date_fin" type="date" class="form-input" />
              </div>
              <div class="form-group form-group--full">
                <label>Missions *</label>
                <textarea v-model="form.missions" class="form-input form-textarea" placeholder="Décrivez vos missions..."></textarea>
              </div>
              <div class="form-group">
                <label>Visibilité</label>
                <select v-model="form.est_public" class="form-input">
                  <option :value="true">Public</option>
                  <option :value="false">Privé</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="modal.open = false">Annuler</button>
            <button class="btn-new" :disabled="saving" @click="sauvegarder">
              {{ saving ? 'Enregistrement...' : (modal.mode === 'create' ? 'Créer le stage' : 'Enregistrer') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ─── Toast ─── -->
    <Teleport to="body">
      <div v-if="toast.show" class="toast" :class="'toast--' + toast.type">
        {{ toast.message }}
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// L'ID étudiant connecté — en prod, récupéré depuis le store auth (ex: useAuthStore().user.id)
// Remplacez par : const authStore = useAuthStore(); const idEtudiant = authStore.user.id_utilisateur
const idEtudiant = ref('ETUDIANT_ID_ICI')

// ─── State ────────────────────────────────────────────────────────────────────
const stages    = ref([])
const loading   = ref(false)
const error     = ref(null)
const saving    = ref(false)
const page      = ref(1)
const perPage   = 5
const showFilter    = ref(false)
const filterStatut  = ref('')
const filterSearch  = ref('')

const modal = ref({ open: false, mode: 'create', stageId: null })
const toast = ref({ show: false, type: 'success', message: '' })

const formDefault = () => ({
  entreprise: '',
  adresse_entreprise: '',
  poste: '',
  date_debut: '',
  date_fin: '',
  duree_semaines: null,
  missions: '',
  encadrant_professionnel: '',
  encadrant_academique: '',
  est_public: true,
})
const form = ref(formDefault())

// ─── Computed ─────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  total:     stages.value.length,
  valides:   stages.value.filter(s => s.status_validation === 'VALIDE').length,
  enAttente: stages.value.filter(s => s.status_validation === 'EN_ATTENTE').length,
}))

const stagesFiltres = computed(() => {
  return stages.value.filter(s => {
    const matchStatut = filterStatut.value ? s.status_validation === filterStatut.value : true
    const matchSearch = filterSearch.value
      ? s.entreprise.toLowerCase().includes(filterSearch.value.toLowerCase())
      : true
    return matchStatut && matchSearch
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(stagesFiltres.value.length / perPage)))

const stagesPagines = computed(() => {
  const start = (page.value - 1) * perPage
  return stagesFiltres.value.slice(start, start + perPage)
})

// Reset page quand filtre change
watch([filterStatut, filterSearch], () => { page.value = 1 })

// ─── API calls ────────────────────────────────────────────────────────────────

/** GET /api/stages/etudiant/:id */
async function fetchStages() {
  loading.value = true
  error.value   = null
  try {
    const res = await fetch(`${API_BASE}/api/stages/etudiant/${idEtudiant.value}`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error(`Erreur ${res.status}`)
    const data = await res.json()
    stages.value = data.data ?? data   // adapte selon votre StandardResponse
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

/** POST /api/stages/etudiant/:id */
async function creerStage(payload) {
  const res = await fetch(`${API_BASE}/api/stages/etudiant/${idEtudiant.value}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Erreur ${res.status}`)
  }
  return res.json()
}

/** PUT /api/stages/:id */
async function modifierStage(id, payload) {
  const res = await fetch(`${API_BASE}/api/stages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Erreur ${res.status}`)
  }
  return res.json()
}

/** DELETE /api/stages/:id */
async function supprimerStage(id) {
  const res = await fetch(`${API_BASE}/api/stages/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Erreur ${res.status}`)
}

/** Helper: Authorization header depuis localStorage (adapter à votre auth store) */
function authHeaders() {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Actions UI ───────────────────────────────────────────────────────────────

function openModal(mode, stage = null) {
  modal.value.mode    = mode
  modal.value.stageId = stage?.id_stage ?? null
  form.value = mode === 'edit' && stage
    ? {
        entreprise:             stage.entreprise,
        adresse_entreprise:     stage.adresse_entreprise ?? '',
        poste:                  stage.poste,
        date_debut:             stage.date_debut?.slice(0, 10) ?? '',
        date_fin:               stage.date_fin?.slice(0, 10) ?? '',
        duree_semaines:         stage.duree_semaines ?? null,
        missions:               stage.missions,
        encadrant_professionnel: stage.encadrant_professionnel ?? '',
        encadrant_academique:   stage.encadrant_academique ?? '',
        est_public:             stage.est_public ?? true,
      }
    : formDefault()
  modal.value.open = true
}

async function sauvegarder() {
  if (!form.value.entreprise || !form.value.poste || !form.value.date_debut || !form.value.missions) {
    showToast('Veuillez remplir les champs obligatoires (*)', 'error')
    return
  }
  saving.value = true
  try {
    if (modal.value.mode === 'create') {
      const res = await creerStage(form.value)
      stages.value.unshift(res.data ?? res)
      showToast('Stage créé avec succès !')
    } else {
      const res = await modifierStage(modal.value.stageId, form.value)
      const idx = stages.value.findIndex(s => s.id_stage === modal.value.stageId)
      if (idx !== -1) stages.value[idx] = res.data ?? res
      showToast('Stage modifié avec succès !')
    }
    modal.value.open = false
  } catch (e) {
    showToast(e.message, 'error')
  } finally {
    saving.value = false
  }
}

async function confirmerSuppression(stage) {
  if (!confirm(`Supprimer le stage chez "${stage.entreprise}" ?`)) return
  try {
    await supprimerStage(stage.id_stage)
    stages.value = stages.value.filter(s => s.id_stage !== stage.id_stage)
    showToast('Stage supprimé.')
  } catch (e) {
    showToast(e.message, 'error')
  }
}

function voirStage(stage) {
  // À connecter à votre router: router.push(`/stages/${stage.id_stage}`)
  alert(`Détail stage : ${stage.entreprise} — ${stage.poste}`)
}

function exportCSV() {
  const header = ['Entreprise','Poste','Statut','Date début','Date fin']
  const rows = stagesFiltres.value.map(s => [
    s.entreprise, s.poste, s.status_validation,
    formatDate(s.date_debut), s.date_fin ? formatDate(s.date_fin) : ''
  ])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'stages.csv'; a.click()
  URL.revokeObjectURL(url)
}

function downloadResource(type) {
  // À relier à vos endpoints /api/files/
  showToast(`Téléchargement de "${type}" en cours...`)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  toast.value = { show: true, type, message }
  setTimeout(() => { toast.value.show = false }, 3200)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initiales(str) {
  if (!str) return '?'
  return str.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const LOGO_COLORS = [
  'linear-gradient(135deg,#4a7fa3,#2d5a7a)',
  'linear-gradient(135deg,#8a6db3,#5a3d8a)',
  'linear-gradient(135deg,#3a8a6a,#1a5a4a)',
  'linear-gradient(135deg,#c96a3a,#8a3a1a)',
  'linear-gradient(135deg,#6a8ac9,#3a5a99)',
  'linear-gradient(135deg,#c9a94b,#8a6a1a)',
]
const AVATAR_COLORS = ['#7aad88','#c9a94b','#6fb3d4','#d47a6a','#9a7ad4']

function logoColor(name) {
  let h = 0
  for (let i = 0; i < (name?.length || 0); i++) h += name.charCodeAt(i)
  return LOGO_COLORS[h % LOGO_COLORS.length]
}

function avatarColor(name) {
  let h = 0
  for (let i = 0; i < (name?.length || 0); i++) h += name.charCodeAt(i)
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function badgeClass(status) {
  return {
    'VALIDE':    'badge--valide',
    'EN_ATTENTE':'badge--attente',
    'REJETE':    'badge--rejete',
  }[status] ?? 'badge--cours'
}

function labelStatut(status) {
  return {
    'VALIDE':    'Validé',
    'EN_ATTENTE':'En attente',
    'REJETE':    'Rejeté',
  }[status] ?? status
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(fetchStages)
</script>

<style scoped>
@import '@/assets/StageList.css';
</style>