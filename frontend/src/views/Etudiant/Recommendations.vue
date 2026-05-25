<template>
  <div class="recommandations-page">

    <!-- ── Page Header ── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Recommandations
        </h1>
        <p class="page-subtitle">Gérez les recommandations reçues et envoyées.</p>
      </div>
      <button class="btn-primary" @click="openWriteModal()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Recommander un étudiant
      </button>
    </div>

    <!-- ── Stats Row ── -->
    <div class="stats-row">
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div>
          <div class="stat-label">TOTAL REÇUES</div>
          <div class="stat-value">{{ recommandations.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div class="stat-label">VALIDÉES</div>
          <div class="stat-value">{{ recommandations.filter(r => r.status === 'VALIDE').length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <div class="stat-label">EN ATTENTE</div>
          <div class="stat-value">{{ recommandations.filter(r => r.status === 'EN_ATTENTE').length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <div>
          <div class="stat-label">AUTEURS UNIQUES</div>
          <div class="stat-value">{{ uniqueAuthors }}</div>
        </div>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="tabs-row">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ 'tab-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tabCount(tab.key) }}</span>
      </button>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Chargement des recommandations...</span>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="state-box state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="fetchRecommandations">Réessayer</button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="filteredRecommandations.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
      <p class="empty-title">Aucune recommandation {{ activeTab !== 'all' ? statusLabel(activeTab) : '' }}</p>
      <p class="empty-sub">{{ activeTab === 'all' ? 'Vous n\'avez pas encore reçu de recommandations.' : 'Aucune recommandation dans cette catégorie.' }}</p>
    </div>

    <!-- ── Cards ── -->
    <div v-else class="cards-list">
      <div
        v-for="(rec, i) in filteredRecommandations"
        :key="rec.id_recommandation"
        class="rec-card"
        :style="{ animationDelay: i * 55 + 'ms' }"
      >
        <!-- Card Header -->
        <div class="rec-card-header">
          <div class="author-row">
            <div class="avatar" :style="{ background: getAvatarColor(rec.auteur?.nom) }">
              {{ getInitials(rec.auteur) }}
            </div>
            <div class="author-info">
              <span class="author-name">{{ rec.auteur?.prenom }} {{ rec.auteur?.nom }}</span>
              <span class="author-role">{{ formatRole(rec.auteur?.role) }}</span>
            </div>
          </div>
          <div class="rec-right">
            <span class="status-badge" :class="statusClass(rec.status)">
              <span class="status-dot"></span>
              {{ statusLabel(rec.status) }}
            </span>
            <span class="rec-date">{{ formatDate(rec.date_creation) }}</span>
          </div>
        </div>

        <!-- Message -->
        <div class="rec-message" :class="{ 'message-expanded': expandedIds.includes(rec.id_recommandation) }">
          <p>{{ rec.message }}</p>
        </div>
        <button
          v-if="rec.message && rec.message.length > 180"
          class="btn-expand"
          @click="toggleExpand(rec.id_recommandation)"
        >
          {{ expandedIds.includes(rec.id_recommandation) ? 'Voir moins ↑' : 'Voir plus ↓' }}
        </button>

        <!-- Footer : EN_ATTENTE → l'étudiant connecté valide SI c'est lui la cible -->
        <div class="rec-footer" v-if="rec.status === 'EN_ATTENTE' && isCurrentUser(rec.id_etudiant)">
          <span class="footer-hint">En attente de votre validation</span>
          <div class="footer-actions">
            <button class="btn-reject" @click="validerRecommandation(rec.id_recommandation, 'REJETE')" :disabled="actionLoading === rec.id_recommandation">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Rejeter
            </button>
            <button class="btn-accept" @click="validerRecommandation(rec.id_recommandation, 'VALIDE')" :disabled="actionLoading === rec.id_recommandation">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Accepter
            </button>
          </div>
        </div>

        <div class="rec-footer" v-else-if="rec.status === 'VALIDE'">
          <span class="footer-validated">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Validée le {{ formatDate(rec.date_validation) }}
          </span>
          <button
            v-if="canDelete(rec)"
            class="btn-icon-sm"
            @click="confirmDelete(rec)"
            title="Supprimer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal : Recommander un autre étudiant ── -->
    <Transition name="fade">
      <div v-if="showWriteModal" class="modal-overlay" @click.self="closeWriteModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">Recommander un étudiant</h2>
            <button class="modal-close" @click="closeWriteModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form @submit.prevent="submitRecommandation" class="modal-form">
            <div class="field">
              <label>ID de l'étudiant à recommander <span class="req">*</span></label>
              <input
                v-model="writeForm.id_etudiant"
                type="text"
                placeholder="ID de l'étudiant cible (pas le vôtre)"
                required
              />
              <!-- Empêcher l'étudiant de se recommander lui-même -->
              <span v-if="isSelfRecommandation" class="field-error">
                Vous ne pouvez pas vous recommander vous-même.
              </span>
            </div>
            <div class="field">
              <label>Message <span class="req">*</span></label>
              <textarea
                v-model="writeForm.message"
                rows="5"
                placeholder="Décrivez les qualités, compétences et réalisations de cet étudiant…"
                maxlength="1000"
                required
              ></textarea>
              <span class="field-hint">{{ writeForm.message.length }} / 1000 caractères</span>
            </div>
            <div v-if="writeError" class="form-error">{{ writeError }}</div>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeWriteModal">Annuler</button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="writeLoading || isSelfRecommandation"
              >
                <span v-if="writeLoading" class="spinner-sm"></span>
                Envoyer la recommandation
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirm ── -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-box modal-box-sm">
          <div class="delete-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <h3 class="modal-title" style="text-align:center">Supprimer la recommandation ?</h3>
          <p class="delete-sub">Cette action est irréversible.</p>
          <div class="modal-footer" style="justify-content:center">
            <button class="btn-ghost" @click="showDeleteConfirm = false">Annuler</button>
            <button class="btn-danger" @click="deleteRecommandation" :disabled="deleteLoading">
              <span v-if="deleteLoading" class="spinner-sm"></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api.js'
import { useAuthStore } from '@/stores/authstore.js'

const authStore = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const recommandations   = ref([])
const loading           = ref(false)
const error             = ref(null)
const activeTab         = ref('all')
const expandedIds       = ref([])
const actionLoading     = ref(null)

const showWriteModal    = ref(false)
const writeLoading      = ref(false)
const writeError        = ref(null)
const writeForm         = ref({ id_etudiant: '', message: '' })

const showDeleteConfirm = ref(false)
const deleteLoading     = ref(false)
const recToDelete       = ref(null)

// ── Tabs ───────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'all',        label: 'Toutes' },
  { key: 'EN_ATTENTE', label: 'En attente' },
  { key: 'VALIDE',     label: 'Validées' },
  { key: 'REJETE',     label: 'Rejetées' },
]

// ── Computed ───────────────────────────────────────────────────────────────
const filteredRecommandations = computed(() => {
  if (activeTab.value === 'all') return recommandations.value
  return recommandations.value.filter(r => r.status === activeTab.value)
})

const uniqueAuthors = computed(() =>
  new Set(recommandations.value.map(r => r.id_recommandeur)).size
)

// Empêcher l'auto-recommandation : l'id_etudiant saisi ne doit pas être celui de l'utilisateur connecté
const isSelfRecommandation = computed(() => {
  const myStudentId = getStudentId()
  return writeForm.value.id_etudiant.trim() !== '' &&
         writeForm.value.id_etudiant.trim() === myStudentId
})

// ── Helpers ────────────────────────────────────────────────────────────────
function getStudentId() {
  const user = authStore.user
  return user?.etudiant?.id_etudiant ?? null
}

function getUserId() {
  const user = authStore.user
  return user?.id_utilisateur ?? user?.id ?? null
}

function isCurrentUser(id_etudiant) {
  // Vérifie si l'étudiant cible de la reco est bien l'utilisateur connecté
  return getStudentId() === id_etudiant
}

function canDelete(rec) {
  const uid = getUserId()
  return uid === rec.id_recommandeur || uid === rec.id_etudiant || authStore.isAdmin
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusLabel(s) {
  return { EN_ATTENTE: 'En attente', VALIDE: 'Validée', REJETE: 'Rejetée' }[s] || s
}

function statusClass(s) {
  return { EN_ATTENTE: 'status-pending', VALIDE: 'status-valid', REJETE: 'status-rejected' }[s] || ''
}

function formatRole(role) {
  return { ETUDIANT: 'Étudiant', PROFESSEUR: 'Professeur', ADMINISTRATEUR: 'Administrateur', PROFESSIONNEL: 'Professionnel' }[role] || role || ''
}

function getInitials(user) {
  if (!user) return '?'
  return ((user.prenom?.[0] || '') + (user.nom?.[0] || '')).toUpperCase() || '?'
}

const avatarColors = ['#2d5a4a','#3d6b5a','#2a4d5e','#4a5d3d','#5a4d2d','#4a3d5e','#3d4a5e']
function getAvatarColor(name) {
  if (!name) return avatarColors[0]
  return avatarColors[name.charCodeAt(0) % avatarColors.length]
}

function tabCount(key) {
  if (key === 'all') return recommandations.value.length
  return recommandations.value.filter(r => r.status === key).length
}

function toggleExpand(id) {
  const idx = expandedIds.value.indexOf(id)
  if (idx === -1) expandedIds.value.push(id)
  else expandedIds.value.splice(idx, 1)
}

// ── API ────────────────────────────────────────────────────────────────────

// Récupère les recommandations reçues par l'étudiant connecté
async function fetchRecommandations() {
  if (!authStore.user) await authStore.fetchUser()
  loading.value = true; error.value = null
  try {
    const res = await api.get('/recommandations/mes-recommandations-recus')
    recommandations.value = res.data?.data ?? res.data ?? []
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur de chargement.'
  } finally { loading.value = false }
}

// L'étudiant connecté valide ou rejette une reco reçue
// L'API attend : PATCH /recommandations/{id}/valider  body: { status: "VALIDE" | "REJETE" }
async function validerRecommandation(id, status) {
  actionLoading.value = id
  try {
    await api.patch(`/recommandations/${id}/valider`, { status })
    await fetchRecommandations()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la validation.'
  } finally { actionLoading.value = null }
}

// L'étudiant connecté recommande un AUTRE étudiant
// POST /recommandations/  body: { id_etudiant: <id de l'autre>, message }
async function submitRecommandation() {
  if (isSelfRecommandation.value) return
  writeError.value = null; writeLoading.value = true
  try {
    await api.post('/recommandations/', {
      id_etudiant: writeForm.value.id_etudiant.trim(),
      message:     writeForm.value.message
    })
    closeWriteModal()
    // Pas de re-fetch ici : cette reco apparaîtra dans la liste de l'AUTRE étudiant, pas la nôtre
  } catch (e) {
    writeError.value = e.response?.data?.message || 'Erreur lors de l\'envoi.'
  } finally { writeLoading.value = false }
}

async function deleteRecommandation() {
  if (!recToDelete.value) return
  deleteLoading.value = true
  try {
    await api.delete(`/recommandations/${recToDelete.value.id_recommandation}`)
    await fetchRecommandations()
    showDeleteConfirm.value = false
    recToDelete.value = null
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur suppression.'
  } finally { deleteLoading.value = false }
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openWriteModal() {
  writeForm.value = { id_etudiant: '', message: '' }
  writeError.value = null
  showWriteModal.value = true
}
function closeWriteModal() {
  showWriteModal.value = false
}
function confirmDelete(rec) {
  recToDelete.value = rec
  showDeleteConfirm.value = true
}

onMounted(fetchRecommandations)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.recommandations-page {
  --bg:         #0D2B2B;
  --surface:    #1A3838;
  --card:       #1e3f3f;
  --mint:       #D6EDE8;
  --sage:       #5C8C6A;
  --night:      #0D2B2B;
  --text:       #D6EDE8;
  --text-dim:   rgba(214,237,232,0.55);
  --text-muted: rgba(214,237,232,0.32);
  --border:     rgba(214,237,232,0.08);
  --border-md:  rgba(214,237,232,0.13);
  --danger:     #b94040;
  --valid:      #5C8C6A;
  --pending:    #8c7a3a;
  --rejected:   #8c4040;

  font-family: 'Inter', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 2rem 2rem 4rem;
  color: var(--text);
}

/* ── Header ── */
.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 1.75rem;
  gap: 1rem; flex-wrap: wrap;
}
.page-title {
  font-size: 1.65rem; font-weight: 700; color: var(--mint);
  margin: 0 0 0.3rem; display: flex; align-items: center;
  gap: 0.55rem; letter-spacing: -0.02em;
}
.title-icon { color: var(--sage); opacity: 0.85; flex-shrink: 0; }
.page-subtitle { font-size: 0.875rem; color: var(--text-dim); margin: 0; }

/* ── Buttons ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: var(--sage); color: var(--night); border: none;
  padding: 0.55rem 1.1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 600;
  cursor: pointer; transition: background 0.18s, transform 0.15s; white-space: nowrap;
}
.btn-primary:hover { background: #6fa37d; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: transparent; border: 1px solid var(--border-md);
  color: var(--text-dim); padding: 0.5rem 1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
}
.btn-ghost:hover { border-color: var(--sage); color: var(--text); }

.btn-danger {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: var(--danger); color: #fff; border: none;
  padding: 0.55rem 1.1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 600;
  cursor: pointer; transition: background 0.18s;
}
.btn-danger:hover { background: #c94848; }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Stats ── */
.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem; margin-bottom: 1.75rem;
}
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 1.1rem 1.2rem;
  display: flex; align-items: center; gap: 0.85rem; color: var(--text-dim);
}
.stat-card svg { flex-shrink: 0; opacity: 0.7; }
.stat-label {
  font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em;
  color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.15rem;
}
.stat-value {
  font-size: 1.6rem; font-weight: 700; color: var(--mint);
  line-height: 1; letter-spacing: -0.02em;
}

/* ── Tabs ── */
.tabs-row {
  display: flex; gap: 0.4rem; margin-bottom: 1.25rem;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 0.3rem; width: fit-content;
}
.tab-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: transparent; border: none;
  color: var(--text-dim); padding: 0.45rem 0.9rem;
  border-radius: 7px; font-family: 'Inter', sans-serif;
  font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.18s;
}
.tab-btn:hover { color: var(--text); }
.tab-active { background: var(--bg); color: var(--mint) !important; font-weight: 600; }
.tab-count {
  background: rgba(214,237,232,0.1); color: var(--text-dim);
  font-size: 0.7rem; font-weight: 600; padding: 0.1rem 0.45rem;
  border-radius: 20px; min-width: 20px; text-align: center;
}
.tab-active .tab-count { background: rgba(92,140,106,0.2); color: var(--sage); }

/* ── State boxes ── */
.state-box {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 2.5rem 1.5rem;
  color: var(--text-dim); font-size: 0.875rem; flex-wrap: wrap;
}
.state-error { color: #e07070; }

.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--border-md); border-top-color: var(--sage);
  border-radius: 50%; animation: spin 0.75s linear infinite; flex-shrink: 0;
}
.spinner-sm {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid rgba(0,0,0,0.2); border-top-color: var(--night);
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty ── */
.empty-card {
  background: var(--surface); border: 1px dashed var(--border-md);
  border-radius: 14px; padding: 3rem 2rem; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.empty-icon { color: var(--sage); opacity: 0.5; margin-bottom: 0.25rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--mint); margin: 0; }
.empty-sub   { font-size: 0.84rem; color: var(--text-dim); margin: 0; }

/* ── Cards List ── */
.cards-list { display: flex; flex-direction: column; gap: 0.9rem; }

.rec-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; padding: 1.3rem 1.4rem;
  display: flex; flex-direction: column; gap: 0.75rem;
  opacity: 0; animation: fadeUp 0.35s ease forwards;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rec-card:hover {
  border-color: rgba(92,140,106,0.25);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rec-card-header {
  display: flex; align-items: center;
  justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;
}
.author-row { display: flex; align-items: center; gap: 0.7rem; }
.avatar {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700; color: var(--mint);
  flex-shrink: 0; letter-spacing: 0.05em;
}
.author-name { display: block; font-size: 0.9rem; font-weight: 600; color: var(--mint); }
.author-role { display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.05rem; }
.rec-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; }

.status-badge {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem;
  border-radius: 20px; letter-spacing: 0.03em; white-space: nowrap;
}
.status-pending  { background: rgba(140,122,58,0.15);  color: #c4aa5a; border: 1px solid rgba(140,122,58,0.3); }
.status-valid    { background: rgba(92,140,106,0.15);  color: #7fb88a; border: 1px solid rgba(92,140,106,0.3); }
.status-rejected { background: rgba(140,64,64,0.15);   color: #e07070; border: 1px solid rgba(140,64,64,0.3); }

.status-pending  .status-dot { background: #c4aa5a; animation: blink 1.8s ease-in-out infinite; }
.status-valid    .status-dot { background: #7fb88a; }
.status-rejected .status-dot { background: #e07070; }

.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

.rec-date { font-size: 0.75rem; color: var(--text-muted); }

/* Message */
.rec-message {
  font-size: 0.875rem; color: var(--text-dim); line-height: 1.65;
  max-height: 70px; overflow: hidden; transition: max-height 0.35s ease;
}
.rec-message p { margin: 0; }
.message-expanded { max-height: 500px; }

.btn-expand {
  background: none; border: none; color: var(--sage);
  font-size: 0.78rem; font-weight: 500; cursor: pointer;
  padding: 0; font-family: 'Inter', sans-serif; transition: color 0.18s;
}
.btn-expand:hover { color: #7fb88a; }

/* Footer */
.rec-footer {
  display: flex; align-items: center;
  justify-content: space-between; gap: 0.75rem;
  padding-top: 0.75rem; border-top: 1px solid var(--border); flex-wrap: wrap;
}
.footer-hint { font-size: 0.78rem; color: var(--text-muted); font-style: italic; }
.footer-actions { display: flex; gap: 0.5rem; }
.footer-validated {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.78rem; color: #7fb88a;
}

.btn-accept {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: rgba(92,140,106,0.15); color: #7fb88a;
  border: 1px solid rgba(92,140,106,0.35);
  padding: 0.35rem 0.85rem; border-radius: 7px;
  font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
}
.btn-accept:hover { background: rgba(92,140,106,0.25); }
.btn-accept:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-reject {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: rgba(140,64,64,0.1); color: #e07070;
  border: 1px solid rgba(140,64,64,0.3);
  padding: 0.35rem 0.85rem; border-radius: 7px;
  font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
}
.btn-reject:hover { background: rgba(140,64,64,0.2); }
.btn-reject:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-icon-sm {
  width: 28px; height: 28px; border-radius: 7px;
  background: transparent; border: 1px solid var(--border-md);
  color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.btn-icon-sm:hover { border-color: var(--danger); color: #e07070; background: rgba(185,64,64,0.1); }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
  z-index: 1000; display: flex; align-items: center;
  justify-content: center; padding: 1rem;
}
.modal-box {
  background: var(--surface); border: 1px solid var(--border-md);
  border-radius: 16px; width: 100%; max-width: 520px; padding: 1.75rem;
}
.modal-box-sm { max-width: 380px; }
.modal-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 1.4rem;
}
.modal-title { font-size: 1.15rem; font-weight: 700; color: var(--mint); margin: 0; }
.modal-close {
  background: transparent; border: 1px solid var(--border);
  color: var(--text-dim); width: 30px; height: 30px; border-radius: 8px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.modal-close:hover { background: var(--border); color: var(--text); }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field label {
  font-size: 0.75rem; font-weight: 600;
  color: var(--text-dim); letter-spacing: 0.04em; text-transform: uppercase;
}
.req { color: var(--sage); }
.field-hint { font-size: 0.72rem; color: var(--text-muted); text-align: right; }
.field-error { font-size: 0.75rem; color: #e07070; margin-top: 2px; }
.field input, .field textarea {
  background: rgba(13,43,43,0.7); border: 1px solid var(--border-md);
  border-radius: 9px; padding: 0.6rem 0.85rem; color: var(--text);
  font-family: 'Inter', sans-serif; font-size: 0.875rem; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s; width: 100%;
}
.field input:focus, .field textarea:focus {
  border-color: var(--sage); box-shadow: 0 0 0 3px rgba(92,140,106,0.12);
}
.field input::placeholder, .field textarea::placeholder { color: var(--text-muted); }
.field textarea { resize: vertical; min-height: 120px; }
.form-error {
  background: rgba(185,64,64,0.1); border: 1px solid rgba(185,64,64,0.3);
  color: #e07070; border-radius: 9px; padding: 0.6rem 0.85rem; font-size: 0.82rem;
}
.modal-footer { display: flex; justify-content: flex-end; gap: 0.65rem; margin-top: 0.25rem; }
.delete-icon-wrap {
  width: 54px; height: 54px; background: rgba(185,64,64,0.12);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem; color: #e07070;
}
.delete-sub { font-size: 0.875rem; color: var(--text-dim); margin: 0 0 1.25rem; text-align: center; }

/* ── Transition ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-active .modal-box, .fade-leave-active .modal-box { transition: transform 0.2s, opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .modal-box { transform: translateY(-12px); opacity: 0; }
.fade-leave-to .modal-box { transform: translateY(6px); opacity: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .recommandations-page { padding: 1.25rem 1rem 3rem; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .tabs-row { width: 100%; overflow-x: auto; }
}
@media (max-width: 480px) {
  .rec-card-header { flex-direction: column; align-items: flex-start; }
  .rec-right { align-items: flex-start; }
}
</style>