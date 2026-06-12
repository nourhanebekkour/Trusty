<template>
  <div class="recommandations-page" @keydown.esc="handleEscape">

    <!-- ── Page Header ── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Recommandations
        </h1>
        <p class="page-subtitle">Gérez les recommandations reçues et envoyées.</p>
      </div>
      
    </div>

    <!-- ── Stats Row ── -->
    <div class="stats-row">
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div>
          <div class="stat-label">TOTAL REÇUES</div>
          <div class="stat-value">{{ recommandations.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div class="stat-label">VALIDÉES</div>
          <div class="stat-value">{{ recommandations.filter(r => r.status === 'VALIDE').length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <div class="stat-label">EN ATTENTE</div>
          <div class="stat-value">{{ recommandations.filter(r => r.status === 'EN_ATTENTE').length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <div>
          <div class="stat-label">AUTEURS UNIQUES</div>
          <div class="stat-value">{{ uniqueAuthors }}</div>
        </div>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="tabs-row" role="tablist" aria-label="Filtrer les recommandations">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ 'tab-active': activeTab === tab.key }"
        role="tab"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="tab-count">{{ tabCount(tab.key) }}</span>
      </button>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="state-box" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <span>Chargement des recommandations...</span>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="state-box state-error" role="alert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="fetchRecommandations">Réessayer</button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="filteredRecommandations.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon" aria-hidden="true">
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
            <div class="avatar" :style="{ background: getAvatarColor(rec.auteur?.nom) }" aria-hidden="true">
              {{ getInitials(rec.auteur) }}
            </div>
            <div class="author-info">
              <span class="author-name">{{ rec.auteur?.prenom }} {{ rec.auteur?.nom }}</span>
              <span class="author-role">{{ formatRole(rec.auteur?.role) }}</span>
            </div>
          </div>
          <div class="rec-right">
            <span class="status-badge" :class="statusClass(rec.status)">
              <span class="status-dot" aria-hidden="true"></span>
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
          :aria-expanded="expandedIds.includes(rec.id_recommandation)"
          @click="toggleExpand(rec.id_recommandation)"
        >
          {{ expandedIds.includes(rec.id_recommandation) ? 'Voir moins ↑' : 'Voir plus ↓' }}
        </button>

        <!-- Footer : EN_ATTENTE -->
        <div class="rec-footer" v-if="rec.status === 'EN_ATTENTE' && isCurrentUser(rec.id_etudiant)">
          <span class="footer-hint">En attente de votre validation</span>
          <div class="footer-actions">
            <button
              class="btn-reject"
              @click="validerRecommandation(rec.id_recommandation, 'REJETE')"
              :disabled="actionLoading === rec.id_recommandation || rateLimitedIds.has(rec.id_recommandation)"
              :aria-busy="actionLoading === rec.id_recommandation"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Rejeter
            </button>
            <button
              class="btn-accept"
              @click="validerRecommandation(rec.id_recommandation, 'VALIDE')"
              :disabled="actionLoading === rec.id_recommandation || rateLimitedIds.has(rec.id_recommandation)"
              :aria-busy="actionLoading === rec.id_recommandation"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Accepter
            </button>
          </div>
        </div>

        <div class="rec-footer" v-else-if="rec.status === 'VALIDE'">
          <span class="footer-validated">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Validée le {{ formatDate(rec.date_validation) }}
          </span>
          <button
            v-if="canDelete(rec)"
            class="btn-icon-sm"
            @click="confirmDelete(rec)"
            :aria-label="`Supprimer la recommandation de ${rec.auteur?.prenom} ${rec.auteur?.nom}`"
            title="Supprimer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal : Recommander un autre étudiant ── -->
    <Transition name="fade">
      <div
        v-if="showWriteModal"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-modal-title"
        @click.self="closeWriteModal"
      >
        <div class="modal-box" ref="writeModalRef" tabindex="-1" @keydown="trapFocusWrite">
          <div class="modal-header">
            <h2 class="modal-title" id="write-modal-title">Recommander un étudiant</h2>
            <button class="modal-close" @click="closeWriteModal" aria-label="Fermer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <form @submit.prevent="submitRecommandation" class="modal-form" novalidate>
            <div class="field">
              <label for="field-id-etudiant">ID de l'étudiant à recommander <span class="req" aria-hidden="true">*</span></label>
              <input
                id="field-id-etudiant"
                v-model="writeForm.id_etudiant"
                type="text"
                placeholder="ID de l'étudiant cible (pas le vôtre)"
                required
                autocomplete="off"
                spellcheck="false"
                :aria-invalid="isSelfRecommandation ? 'true' : 'false'"
                aria-describedby="self-reco-error"
              />
              <span v-if="isSelfRecommandation" id="self-reco-error" class="field-error" role="alert">
                Vous ne pouvez pas vous recommander vous-même.
              </span>
            </div>
            <div class="field">
              <label for="field-message">Message <span class="req" aria-hidden="true">*</span></label>
              <textarea
                id="field-message"
                v-model="writeForm.message"
                rows="5"
                placeholder="Décrivez les qualités, compétences et réalisations de cet étudiant…"
                maxlength="1000"
                required
                autocomplete="off"
                spellcheck="true"
                aria-describedby="message-counter"
              ></textarea>
              <span id="message-counter" class="field-hint">{{ writeForm.message.length }} / 1000 caractères</span>
            </div>
            <div v-if="writeError" class="form-error" role="alert">{{ writeError }}</div>
            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeWriteModal">Annuler</button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="writeLoading || isSelfRecommandation || !isWriteFormValid"
                :aria-busy="writeLoading"
              >
                <span v-if="writeLoading" class="spinner-sm" aria-hidden="true"></span>
                Envoyer la recommandation
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirm ── -->
    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="modal-overlay"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        @click.self="showDeleteConfirm = false"
      >
        <div class="modal-box modal-box-sm" ref="deleteModalRef" tabindex="-1" @keydown="trapFocusDelete">
          <div class="delete-icon-wrap" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </div>
          <h3 class="modal-title" id="delete-confirm-title" style="text-align:center">Supprimer la recommandation ?</h3>
          <p class="delete-sub">Cette action est irréversible.</p>
          <div class="modal-footer" style="justify-content:center">
            <button class="btn-ghost" @click="showDeleteConfirm = false">Annuler</button>
            <button
              class="btn-danger"
              @click="deleteRecommandation"
              :disabled="deleteLoading"
              :aria-busy="deleteLoading"
            >
              <span v-if="deleteLoading" class="spinner-sm" aria-hidden="true"></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/api.js'
import { useAuthStore } from '@/stores/authstore.js'

const authStore = useAuthStore()

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

const writeModalRef     = ref(null)
const deleteModalRef    = ref(null)

// Ensemble des IDs de recommandations temporairement bloquées
const rateLimitedIds = ref(new Set())
const RATE_LIMIT_MS = 1500
const rateLimitTimers = new Map()

function startRateLimitForId(id) {
  rateLimitedIds.value = new Set([...rateLimitedIds.value, id])
  const timer = setTimeout(() => {
    const next = new Set(rateLimitedIds.value)
    next.delete(id)
    rateLimitedIds.value = next
    rateLimitTimers.delete(id)
  }, RATE_LIMIT_MS)
  rateLimitTimers.set(id, timer)
}

const tabs = [
  { key: 'all',        label: 'Toutes' },
  { key: 'EN_ATTENTE', label: 'En attente' },
  { key: 'VALIDE',     label: 'Validées' },
  { key: 'REJETE',     label: 'Rejetées' },
]

const filteredRecommandations = computed(() => {
  if (activeTab.value === 'all') return recommandations.value
  return recommandations.value.filter(r => r.status === activeTab.value)
})

const uniqueAuthors = computed(() =>
  new Set(recommandations.value.map(r => r.id_recommandeur)).size
)

const isSelfRecommandation = computed(() => {
  const myStudentId = getStudentId()
  return writeForm.value.id_etudiant.trim() !== '' &&
         writeForm.value.id_etudiant.trim() === myStudentId
})

// Valide le formulaire d'envoi de recommandation avant d'activer le bouton submit.
const isWriteFormValid = computed(() => {
  const idTrimmed = writeForm.value.id_etudiant.trim()
  const msgTrimmed = writeForm.value.message.trim()
  return idTrimmed.length > 0 && msgTrimmed.length >= 10 && msgTrimmed.length <= 1000
})

function getStudentId() {
  const user = authStore.user
  return user?.etudiant?.id_etudiant ?? null
}

function getUserId() {
  const user = authStore.user
  return user?.id_utilisateur ?? user?.id ?? null
}

function isCurrentUser(id_etudiant) {
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

//Ferme la modal visible avec Escape.
function handleEscape() {
  if (showDeleteConfirm.value) {
    showDeleteConfirm.value = false
  } else if (showWriteModal.value) {
    closeWriteModal()
  }
}

//Piège le focus dans la modal d'écriture.
function trapFocusWrite(event) {
  trapFocusInRef(event, writeModalRef)
}

//Piège le focus dans la modal de suppression.
function trapFocusDelete(event) {
  trapFocusInRef(event, deleteModalRef)
}

function trapFocusInRef(event, containerRef) {
  if (event.key !== 'Tab' || !containerRef.value) return
  const focusable = containerRef.value.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey) {
    if (document.activeElement === first) { event.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last) { event.preventDefault(); first.focus() }
  }
}

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

async function validerRecommandation(id, status) {
  if (rateLimitedIds.value.has(id)) return
  actionLoading.value = id
  startRateLimitForId(id)
  try {
    await api.patch(`/recommandations/${id}/valider`, { status })
    await fetchRecommandations()
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la validation.'
  } finally { actionLoading.value = null }
}

async function submitRecommandation() {
  if (isSelfRecommandation.value || !isWriteFormValid.value) return
  writeError.value = null; writeLoading.value = true
  try {
    await api.post('/recommandations/', {
      id_etudiant: writeForm.value.id_etudiant.trim(),
      message:     writeForm.value.message.trim().slice(0, 1000),
    })
    closeWriteModal()
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

function closeWriteModal() {
  showWriteModal.value = false
  writeForm.value = { id_etudiant: '', message: '' }
  writeError.value = null
}

function confirmDelete(rec) {
  recToDelete.value = rec
  showDeleteConfirm.value = true
  nextTick(() => deleteModalRef.value?.focus())
}

onMounted(fetchRecommandations)

onUnmounted(() => {
  rateLimitTimers.forEach(t => clearTimeout(t))
  rateLimitTimers.clear()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.recommandations-page {
  font-family: 'Inter', sans-serif;
  background: var(--color-page-bg);
  min-height: 100vh;
  padding: 2rem 2rem 4rem;
  color: var(--color-text-primary);
}

/* ── Header ── */
.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 1.75rem;
  gap: 1rem; flex-wrap: wrap;
}
.page-title {
  font-size: 1.65rem; font-weight: 700; color: var(--color-text-primary);
  margin: 0 0 0.3rem; display: flex; align-items: center;
  gap: 0.55rem; letter-spacing: -0.02em;
}
.title-icon { color: var(--color-accent); opacity: 0.85; flex-shrink: 0; }
.page-subtitle { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; }

/* ── Buttons ── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: var(--color-accent); color: var(--color-page-bg); border: none;
  padding: 0.55rem 1.1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 600;
  cursor: pointer; transition: background 0.18s, transform 0.15s; white-space: nowrap;
}
.btn-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: transparent; border: 1px solid var(--color-border);
  color: var(--color-text-secondary); padding: 0.5rem 1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
}
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-text-primary); }

.btn-danger {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: var(--color-danger); color: #fff; border: none;
  padding: 0.55rem 1.1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 600;
  cursor: pointer; transition: background 0.18s;
}
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Stats ── */
.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem; margin-bottom: 1.75rem;
}
.stat-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 12px; padding: 1.1rem 1.2rem;
  display: flex; align-items: center; gap: 0.85rem; color: var(--color-text-secondary);
}
.stat-card svg { flex-shrink: 0; opacity: 0.7; }
.stat-label {
  font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em;
  color: var(--color-text-tertiary); text-transform: uppercase; margin-bottom: 0.15rem;
}
.stat-value {
  font-size: 1.6rem; font-weight: 700; color: var(--color-text-primary);
  line-height: 1; letter-spacing: -0.02em;
}

/* ── Tabs ── */
.tabs-row {
  display: flex; gap: 0.4rem; margin-bottom: 1.25rem;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 10px; padding: 0.3rem; width: fit-content;
}
.tab-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: transparent; border: none;
  color: var(--color-text-secondary); padding: 0.45rem 0.9rem;
  border-radius: 7px; font-family: 'Inter', sans-serif;
  font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.18s;
}
.tab-btn:hover { color: var(--color-text-primary); }
.tab-active { background: var(--color-page-bg); color: var(--color-text-primary) !important; font-weight: 600; }
.tab-count {
  background: var(--color-surface-hover); color: var(--color-text-secondary);
  font-size: 0.7rem; font-weight: 600; padding: 0.1rem 0.45rem;
  border-radius: 20px; min-width: 20px; text-align: center;
}
.tab-active .tab-count { background: var(--color-accent-light); color: var(--color-accent); }

/* ── State boxes ── */
.state-box {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 12px; padding: 2.5rem 1.5rem;
  color: var(--color-text-secondary); font-size: 0.875rem; flex-wrap: wrap;
}
.state-error { color: var(--color-danger); }

.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--color-border); border-top-color: var(--color-accent);
  border-radius: 50%; animation: spin 0.75s linear infinite; flex-shrink: 0;
}
.spinner-sm {
  display: inline-block; width: 13px; height: 13px;
  border: 2px solid var(--color-border-light); border-top-color: var(--color-page-bg);
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty ── */
.empty-card {
  background: var(--color-surface); border: 1px dashed var(--color-border);
  border-radius: 14px; padding: 3rem 2rem; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.empty-icon { color: var(--color-accent); opacity: 0.5; margin-bottom: 0.25rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.empty-sub   { font-size: 0.84rem; color: var(--color-text-secondary); margin: 0; }

/* ── Cards List ── */
.cards-list { display: flex; flex-direction: column; gap: 0.9rem; }

.rec-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 14px; padding: 1.3rem 1.4rem;
  display: flex; flex-direction: column; gap: 0.75rem;
  opacity: 0; animation: fadeUp 0.35s ease forwards;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rec-card:hover {
  border-color: var(--color-accent-border);
  box-shadow: var(--shadow-panel);
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
  font-size: 0.8rem; font-weight: 700; color: var(--color-text-primary);
  flex-shrink: 0; letter-spacing: 0.05em;
}
.author-name { display: block; font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.author-role { display: block; font-size: 0.75rem; color: var(--color-text-tertiary); margin-top: 0.05rem; }
.rec-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem; }

.status-badge {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem;
  border-radius: 20px; letter-spacing: 0.03em; white-space: nowrap;
}
.status-pending  { background: var(--color-waiting-bg);  color: var(--color-waiting-text); border: 1px solid var(--color-waiting-border); }
.status-valid    { background: var(--color-valid-bg);  color: var(--color-valid-text); border: 1px solid var(--color-valid-border); }
.status-rejected { background: rgba(239,68,68,0.1);   color: var(--color-danger); border: 1px solid rgba(239,68,68,0.2); }

.status-pending  .status-dot { background: var(--color-waiting-text); animation: blink 1.8s ease-in-out infinite; }
.status-valid    .status-dot { background: var(--color-valid-text); }
.status-rejected .status-dot { background: var(--color-danger); }

.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }

.rec-date { font-size: 0.75rem; color: var(--color-text-tertiary); }

/* Message */
.rec-message {
  font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.65;
  max-height: 70px; overflow: hidden; transition: max-height 0.35s ease;
}
.rec-message p { margin: 0; }
.message-expanded { max-height: 500px; }

.btn-expand {
  background: none; border: none; color: var(--color-accent);
  font-size: 0.78rem; font-weight: 500; cursor: pointer;
  padding: 0; font-family: 'Inter', sans-serif; transition: color 0.18s;
}
.btn-expand:hover { color: var(--color-accent); }

/* Footer */
.rec-footer {
  display: flex; align-items: center;
  justify-content: space-between; gap: 0.75rem;
  padding-top: 0.75rem; border-top: 1px solid var(--color-border-light); flex-wrap: wrap;
}
.footer-hint { font-size: 0.78rem; color: var(--color-text-tertiary); font-style: italic; }
.footer-actions { display: flex; gap: 0.5rem; }
.footer-validated {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.78rem; color: var(--color-accent);
}

.btn-accept {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: var(--color-accent-light); color: var(--color-accent);
  border: 1px solid var(--color-accent-border);
  padding: 0.35rem 0.85rem; border-radius: 7px;
  font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
}
.btn-accept:hover { background: var(--color-valid-bg); }
.btn-accept:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-reject {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: rgba(239,68,68,0.1); color: var(--color-danger);
  border: 1px solid rgba(239,68,68,0.2);
  padding: 0.35rem 0.85rem; border-radius: 7px;
  font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s;
}
.btn-reject:hover { background: rgba(239,68,68,0.18); }
.btn-reject:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-icon-sm {
  width: 28px; height: 28px; border-radius: 7px;
  background: transparent; border: 1px solid var(--color-border);
  color: var(--color-text-tertiary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.btn-icon-sm:hover { border-color: var(--color-danger); color: var(--color-danger); background: rgba(239,68,68,0.1); }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
  z-index: 1000; display: flex; align-items: center;
  justify-content: center; padding: 1rem;
}
.modal-box {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 16px; width: 100%; max-width: 520px; padding: 1.75rem;
}
.modal-box-sm { max-width: 380px; }
.modal-header {
  display: flex; align-items: center;
  justify-content: space-between; margin-bottom: 1.4rem;
}
.modal-title { font-size: 1.15rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.modal-close {
  background: transparent; border: 1px solid var(--color-border-light);
  color: var(--color-text-secondary); width: 30px; height: 30px; border-radius: 8px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.18s;
}
.modal-close:hover { background: var(--color-border-light); color: var(--color-text-primary); }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field label {
  font-size: 0.75rem; font-weight: 600;
  color: var(--color-text-secondary); letter-spacing: 0.04em; text-transform: uppercase;
}
.req { color: var(--color-accent); }
.field-hint { font-size: 0.72rem; color: var(--color-text-tertiary); text-align: right; }
.field-error { font-size: 0.75rem; color: var(--color-danger); margin-top: 2px; }
.field input, .field textarea {
  background: var(--color-surface-alt); border: 1px solid var(--color-border);
  border-radius: 9px; padding: 0.6rem 0.85rem; color: var(--color-text-primary);
  font-family: 'Inter', sans-serif; font-size: 0.875rem; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s; width: 100%;
}
.field input:focus, .field textarea:focus {
  border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-light);
}
.field input::placeholder, .field textarea::placeholder { color: var(--color-text-tertiary); }
.field textarea { resize: vertical; min-height: 120px; }
.form-error {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  color: var(--color-danger); border-radius: 9px; padding: 0.6rem 0.85rem; font-size: 0.82rem;
}
.modal-footer { display: flex; justify-content: flex-end; gap: 0.65rem; margin-top: 0.25rem; }
.delete-icon-wrap {
  width: 54px; height: 54px; background: rgba(239,68,68,0.12);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem; color: var(--color-danger);
}
.delete-sub { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0 0 1.25rem; text-align: center; }

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