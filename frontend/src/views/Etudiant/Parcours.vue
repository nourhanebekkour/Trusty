<template>
  <div class="parcours-page" @keydown.esc="handleEscape">

    <!-- ── Page Header ── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          Parcours Académique
        </h1>
        <p class="page-subtitle">Gérez votre historique de formations et diplômes.</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter une formation
      </button>
    </div>

    <!-- ── Stats Row ── -->
    <div class="stats-row">
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <div>
          <div class="stat-label">FORMATIONS</div>
          <div class="stat-value">{{ formations.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div>
          <div class="stat-label">EN COURS</div>
          <div class="stat-value">{{ formations.filter(f => f.est_actuelle).length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div class="stat-label">VALIDÉES</div>
          <div class="stat-value">{{ formations.filter(f => !f.est_actuelle && f.date_fin).length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        <div>
          <div class="stat-label">MENTIONS</div>
          <div class="stat-value">{{ formations.filter(f => f.mention).length }}</div>
        </div>
      </div>
    </div>

    <!-- ── Section Title ── -->
    <div class="section-header">
      <h2 class="section-title">Mes Formations</h2>
      <div class="section-actions">
        <button class="btn-ghost" @click="sortByDate = !sortByDate">
          Trier par {{ sortByDate ? 'diplôme' : 'date' }}
        </button>
      </div>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="state-box" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <span>Chargement...</span>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="state-box state-error" role="alert">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="fetchFormations">Réessayer</button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="formations.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      <p class="empty-title">Aucune formation enregistrée</p>
      <p class="empty-sub">Commencez à documenter votre parcours académique</p>
      <button class="btn-primary" @click="openModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter ma première formation
      </button>
    </div>

    <!-- ── Cards Grid ── -->
    <div v-else class="cards-grid">
      <div
        v-for="(f, i) in formationsSorted"
        :key="f.id_formation"
        class="formation-card"
        :style="{ animationDelay: i * 60 + 'ms' }"
      >
        <div class="card-topbar">
          <span class="card-type-badge">{{ f.filiere || getDiplomeType(f.diplome) }}</span>
          <span class="status-badge" :class="f.est_actuelle ? 'status-active' : 'status-done'">
            <span class="status-dot" aria-hidden="true"></span>
            {{ f.est_actuelle ? 'En cours' : 'Terminé' }}
          </span>
        </div>

        <div class="card-body">
          <h3 class="card-title">{{ f.diplome }}</h3>
          <p class="card-etab">{{ f.etablissement }}</p>
          <p v-if="f.description" class="card-desc">{{ f.description }}</p>
        </div>

        <div class="card-meta-row">
          <span class="meta-date">{{ formatDate(f.date_debut) }}{{ f.date_fin || f.est_actuelle ? ' – ' + (f.est_actuelle ? 'présent' : formatDate(f.date_fin)) : '' }}</span>
          <span v-if="f.mention" class="mention-tag">{{ f.mention }}</span>
        </div>

        <div class="card-footer">
          <span class="duration-text">{{ getDuration(f) }}</span>
          <div class="card-actions">
            <button
              class="action-btn"
              @click="openModal(f)"
              :aria-label="`Modifier ${f.diplome}`"
              title="Modifier"
              :disabled="rateLimited"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
            <button
              class="action-btn action-btn-danger"
              @click="confirmDelete(f)"
              :aria-label="`Supprimer ${f.diplome}`"
              title="Supprimer"
              :disabled="rateLimited"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Add/Edit Modal ── -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="editingFormation ? 'modal-title-edit' : 'modal-title-add'"
        @click.self="closeModal"
      >
        <div class="modal-box" ref="formModalRef" tabindex="-1" @keydown="trapFocusForm">
          <div class="modal-header">
            <h2
              class="modal-title"
              :id="editingFormation ? 'modal-title-edit' : 'modal-title-add'"
            >
              {{ editingFormation ? 'Modifier la formation' : 'Nouvelle formation' }}
            </h2>
            <button class="modal-close" @click="closeModal" aria-label="Fermer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="modal-form" novalidate>
            <div class="field">
              <label for="field-diplome">Diplôme / Titre <span class="req" aria-hidden="true">*</span></label>
              <input
                id="field-diplome"
                v-model="form.diplome"
                type="text"
                placeholder="ex: Licence Informatique, Master MIAGE…"
                required
                maxlength="200"
                autocomplete="off"
                spellcheck="true"
                :aria-invalid="formSubmitted && !form.diplome.trim() ? 'true' : 'false'"
              />
            </div>

            <div class="field">
              <label for="field-etablissement">Établissement <span class="req" aria-hidden="true">*</span></label>
              <input
                id="field-etablissement"
                v-model="form.etablissement"
                type="text"
                placeholder="ex: Université Moulay Ismaïl, ENSAM…"
                required
                maxlength="200"
                autocomplete="organization"
                spellcheck="true"
                :aria-invalid="formSubmitted && !form.etablissement.trim() ? 'true' : 'false'"
              />
            </div>

            <div class="field-row">
              <div class="field">
                <label for="field-date-debut">Date de début <span class="req" aria-hidden="true">*</span></label>
                <input
                  id="field-date-debut"
                  v-model="form.date_debut"
                  type="date"
                  required
                  :max="todayISO"
                  :aria-invalid="formSubmitted && !form.date_debut ? 'true' : 'false'"
                />
              </div>
              <div class="field">
                <label for="field-date-fin">Date de fin</label>
                <input
                  id="field-date-fin"
                  v-model="form.date_fin"
                  type="date"
                  :disabled="form.est_actuelle"
                  :min="form.date_debut || undefined"
                  :max="todayISO"
                  :aria-describedby="dateRangeError ? 'date-range-error' : undefined"
                />
              </div>
            </div>

            <p
              v-if="dateRangeError"
              id="date-range-error"
              class="form-error"
              role="alert"
              style="margin-top: -0.5rem;"
            >
              {{ dateRangeError }}
            </p>

            <div class="field-row">
              <div class="field">
                <label for="field-mention">Mention</label>
                <select id="field-mention" v-model="form.mention">
                  <option value="">Aucune</option>
                  <option>Passable</option>
                  <option>Assez Bien</option>
                  <option>Bien</option>
                  <option>Très Bien</option>
                  <option>Félicitations</option>
                </select>
              </div>
              <div class="field field-check">
                <label class="check-label" for="field-est-actuelle">
                  <input id="field-est-actuelle" v-model="form.est_actuelle" type="checkbox" />
                  <span class="check-box" aria-hidden="true"></span>
                  Formation en cours
                </label>
              </div>
            </div>

            <div class="field">
              <label for="field-description">Description</label>
              <textarea
                id="field-description"
                v-model="form.description"
                rows="3"
                placeholder="Spécialisations, projets réalisés, activités…"
                maxlength="1000"
                autocomplete="off"
                spellcheck="true"
                aria-describedby="description-counter"
              ></textarea>
              <span
                id="description-counter"
                class="field-hint"
                :style="{ color: form.description.length > 900 ? 'var(--color-danger)' : 'inherit' }"
              >
                {{ form.description.length }} / 1000
              </span>
            </div>

            <div v-if="formError" class="form-error" role="alert">{{ formError }}</div>

            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeModal">Annuler</button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="submitting || !!dateRangeError || !isFormValid"
                :aria-busy="submitting"
              >
                <span v-if="submitting" class="spinner-sm" aria-hidden="true"></span>
                {{ editingFormation ? 'Enregistrer' : 'Ajouter' }}
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
          <h3 class="modal-title" id="delete-confirm-title" style="text-align:center">Supprimer la formation ?</h3>
          <p class="delete-sub">« {{ formationToDelete?.diplome }} » sera définitivement supprimée.</p>
          <div class="modal-footer" style="justify-content:center">
            <button class="btn-ghost" @click="showDeleteConfirm = false">Annuler</button>
            <button
              class="btn-danger"
              @click="deleteFormation"
              :disabled="submitting"
              :aria-busy="submitting"
            >
              <span v-if="submitting" class="spinner-sm" aria-hidden="true"></span>
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

const formations        = ref([])
const loading           = ref(false)
const error             = ref(null)
const showModal         = ref(false)
const showDeleteConfirm = ref(false)
const editingFormation  = ref(null)
const formationToDelete = ref(null)
const submitting        = ref(false)
const formError         = ref(null)
const sortByDate        = ref(true)
const formSubmitted     = ref(false)

const formModalRef  = ref(null)
const deleteModalRef = ref(null)

/**
 * Cooldown côté client après chaque mutation (ajout, modification, suppression).
 */
const rateLimited = ref(false)
const RATE_LIMIT_MS = 1500
let rateLimitTimer = null

function startRateLimit() {
  rateLimited.value = true
  clearTimeout(rateLimitTimer)
  rateLimitTimer = setTimeout(() => { rateLimited.value = false }, RATE_LIMIT_MS)
}

/**
 * Date du jour au format ISO (YYYY-MM-DD), utilisée pour borner les champs date.
 */
const todayISO = new Date().toISOString().split('T')[0]

const defaultForm = () => ({
  diplome: '', etablissement: '',
  date_debut: '', date_fin: '',
  description: '', mention: '', est_actuelle: false
})
const form = ref(defaultForm())

const formationsSorted = computed(() =>
  [...formations.value].sort((a, b) => {
    if (a.est_actuelle && !b.est_actuelle) return -1
    if (!a.est_actuelle && b.est_actuelle) return 1
    if (sortByDate.value) return new Date(b.date_debut) - new Date(a.date_debut)
    return a.diplome.localeCompare(b.diplome)
  })
)

/**
 * Détecte une incohérence entre date_debut et date_fin.
 */
const dateRangeError = computed(() => {
  if (!form.value.date_debut || !form.value.date_fin || form.value.est_actuelle) return null
  return new Date(form.value.date_fin) < new Date(form.value.date_debut)
    ? 'La date de fin doit être postérieure à la date de début.'
    : null
})

/**
 * Vérifie que les champs obligatoires sont remplis avant d'activer le bouton de soumission.
 */
const isFormValid = computed(() =>
  form.value.diplome.trim().length > 0 &&
  form.value.etablissement.trim().length > 0 &&
  form.value.date_debut.length > 0
)

function getStudentId() {
  const user = authStore.user
  return user?.etudiant?.id_etudiant ?? user?.id_utilisateur ?? user?.id ?? null
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

function getDuration(f) {
  const start = new Date(f.date_debut)
  const end   = f.est_actuelle ? new Date() : (f.date_fin ? new Date(f.date_fin) : new Date())
  const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30))
  if (months < 12) return `${months} mois`
  const y = Math.floor(months / 12), m = months % 12
  return m ? `${y} an${y > 1 ? 's' : ''} ${m} mois` : `${y} an${y > 1 ? 's' : ''}`
}

function getDiplomeType(diplome) {
  const d = diplome?.toLowerCase() || ''
  if (d.includes('master') || d.includes('msc')) return 'Master'
  if (d.includes('licence') || d.includes('bachelor')) return 'Licence'
  if (d.includes('doctorat') || d.includes('phd')) return 'Doctorat'
  if (d.includes('bts') || d.includes('dut') || d.includes('deug')) return 'Bac+2'
  if (d.includes('ingénieur') || d.includes('ingenieur')) return 'Ingénierie'
  if (d.includes('bac')) return 'Baccalauréat'
  return 'Formation'
}

function toInputDate(d) {
  if (!d) return ''
  return new Date(d).toISOString().split('T')[0]
}

/**
 * Nettoie et tronque une valeur texte avant envoi à l'API.
 */
function sanitizeField(value, maxLen = 200) {
  if (!value) return null
  return String(value).replace(/<[^>]*>/g, '').trim().slice(0, maxLen) || null
}

async function fetchFormations() {
  if (!authStore.user) await authStore.fetchUser()
  const sid = getStudentId()
  if (!sid) { error.value = 'Identifiant étudiant introuvable.'; return }
  loading.value = true; error.value = null
  try {
    const res = await api.get(`/formations/etudiant/${sid}`)
    formations.value = res.data?.data ?? res.data ?? []
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur de chargement.'
  } finally { loading.value = false }
}

async function submitForm() {
  formSubmitted.value = true
  if (!isFormValid.value || dateRangeError.value) return
  formError.value = null; submitting.value = true
  const sid = getStudentId()
  if (!sid) { formError.value = 'Identifiant introuvable.'; submitting.value = false; return }
  startRateLimit()
  try {
    const payload = {
      diplome:       sanitizeField(form.value.diplome),
      etablissement: sanitizeField(form.value.etablissement),
      date_debut:    form.value.date_debut,
      date_fin:      form.value.est_actuelle ? null : (form.value.date_fin || null),
      description:   sanitizeField(form.value.description, 1000),
      mention:       form.value.mention || null,
      est_actuelle:  form.value.est_actuelle,
    }
    if (editingFormation.value) {
      await api.put(`/formations/${editingFormation.value.id_formation}`, payload)
    } else {
      await api.post(`/formations/etudiant/${sid}`, payload)
    }
    await fetchFormations()
    closeModal()
  } catch (e) {
    formError.value = e.response?.data?.message || 'Une erreur est survenue.'
  } finally { submitting.value = false }
}

async function deleteFormation() {
  if (!formationToDelete.value) return
  submitting.value = true
  startRateLimit()
  try {
    await api.delete(`/formations/${formationToDelete.value.id_formation}`)
    await fetchFormations()
    showDeleteConfirm.value = false
    formationToDelete.value = null
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur suppression.'
  } finally { submitting.value = false }
}

/**
 * Ferme la modal ouverte lors d'un appui sur Escape.
 */
function handleEscape() {
  if (showDeleteConfirm.value) {
    showDeleteConfirm.value = false
  } else if (showModal.value) {
    closeModal()
  }
}

/**
 * Piège le focus dans la modal de formulaire.
 */
function trapFocusForm(event) {
  trapFocusInRef(event, formModalRef)
}

/**
 * Piège le focus dans le dialogue de confirmation de suppression.
 */
function trapFocusDelete(event) {
  trapFocusInRef(event, deleteModalRef)
}

function trapFocusInRef(event, containerRef) {
  if (event.key !== 'Tab' || !containerRef.value) return
  const focusable = containerRef.value.querySelectorAll(
    'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  if (!focusable.length) return
  const first = focusable[0]
  const last  = focusable[focusable.length - 1]
  if (event.shiftKey) {
    if (document.activeElement === first) { event.preventDefault(); last.focus() }
  } else {
    if (document.activeElement === last) { event.preventDefault(); first.focus() }
  }
}

function openModal(f = null) {
  editingFormation.value = f
  formSubmitted.value = false
  form.value = f ? {
    diplome:       f.diplome,
    etablissement: f.etablissement,
    date_debut:    toInputDate(f.date_debut),
    date_fin:      toInputDate(f.date_fin),
    description:   f.description || '',
    mention:       f.mention || '',
    est_actuelle:  f.est_actuelle,
  } : defaultForm()
  formError.value = null
  showModal.value = true
  nextTick(() => formModalRef.value?.focus())
}

function closeModal() {
  showModal.value = false
  editingFormation.value = null
  formSubmitted.value = false
  form.value = defaultForm()
}

function confirmDelete(f) {
  formationToDelete.value = f
  showDeleteConfirm.value = true
  nextTick(() => deleteModalRef.value?.focus())
}

onMounted(fetchFormations)

onUnmounted(() => {
  clearTimeout(rateLimitTimer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.parcours-page {
  font-family: 'Inter', sans-serif;
  background: var(--color-page-bg);
  min-height: 100vh;
  padding: 2rem 2rem 4rem;
  color: var(--color-text-primary);
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  letter-spacing: -0.02em;
}

.title-icon { color: var(--color-accent); opacity: 0.85; flex-shrink: 0; }

.page-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
  font-weight: 400;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--color-accent);
  color: var(--color-page-bg);
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s;
  white-space: nowrap;
}
.btn-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
}
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-text-primary); }

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--color-danger);
  color: #fff;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;
}
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--color-text-secondary);
}

.stat-card svg { flex-shrink: 0; opacity: 0.7; }

.stat-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  margin-bottom: 0.15rem;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.section-actions { display: flex; gap: 0.6rem; }

.state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  flex-wrap: wrap;
}
.state-error { color: var(--color-danger); }

.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}
.spinner-sm {
  display: inline-block;
  width: 13px; height: 13px;
  border: 2px solid var(--color-border-light);
  border-top-color: var(--color-page-bg);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-card {
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: 14px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}
.empty-icon { color: var(--color-accent); opacity: 0.6; margin-bottom: 0.25rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.empty-sub { font-size: 0.84rem; color: var(--color-text-secondary); margin: 0 0 0.5rem; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.formation-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
  padding: 1.2rem 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  opacity: 0;
  animation: fadeUp 0.35s ease forwards;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.formation-card:hover {
  border-color: var(--color-accent-border);
  transform: translateY(-2px);
  box-shadow: var(--shadow-panel);
}

.card-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-type-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border-light);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  letter-spacing: 0.03em;
}

.status-active {
  background: var(--color-valid-bg);
  color: var(--color-valid-text);
  border: 1px solid var(--color-valid-border);
}
.status-active .status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-valid-text);
  animation: blink 1.8s ease-in-out infinite;
}

.status-done {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
}
.status-done .status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-text-tertiary);
}

@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.card-body { flex: 1; }
.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.25rem;
  line-height: 1.35;
}
.card-etab {
  font-size: 0.84rem;
  color: var(--color-text-secondary);
  margin: 0 0 0.4rem;
}
.card-desc {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
  margin: 0;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.card-meta-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.meta-date {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}
.mention-tag {
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--color-accent-light);
  color: var(--color-accent);
  border: 1px solid var(--color-accent-border);
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.6rem;
  border-top: 1px solid var(--color-border-light);
  flex-wrap: wrap;
  gap: 0.5rem;
}
.duration-text {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
}
.card-actions {
  display: flex;
  gap: 0.4rem;
  opacity: 0;
  transition: opacity 0.18s;
}
.formation-card:hover .card-actions { opacity: 1; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.18s;
}
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.action-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-text-primary);
  background: var(--color-accent-light);
}
.action-btn-danger:hover:not(:disabled) {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: rgba(239,68,68,0.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  padding: 1.75rem;
}
.modal-box-sm {
  max-width: 380px;
  text-align: center;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.4rem;
}
.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}
.modal-close {
  background: transparent;
  border: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
  width: 30px; height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}
.modal-close:hover { background: var(--color-border-light); color: var(--color-text-primary); }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }

.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.field-check { justify-content: flex-end; padding-bottom: 2px; }

.field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.req { color: var(--color-accent); }

.field-hint {
  font-size: 0.72rem;
  color: var(--color-text-tertiary);
  text-align: right;
  margin-top: 2px;
}

.field input,
.field select,
.field textarea {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 9px;
  padding: 0.6rem 0.85rem;
  color: var(--color-text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  width: 100%;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}
.field input[aria-invalid="true"] {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
}
.field input::placeholder,
.field textarea::placeholder { color: var(--color-text-tertiary); }
.field input:disabled { opacity: 0.35; cursor: not-allowed; }
.field select option { background: var(--color-surface); }
.field textarea { resize: vertical; min-height: 80px; }

.check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-secondary);
  text-transform: none;
  letter-spacing: 0;
}
.check-label input { display: none; }
.check-box {
  width: 18px; height: 18px;
  border: 1.5px solid var(--color-border);
  border-radius: 5px;
  background: var(--color-surface-alt);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}
.check-label input:checked + .check-box {
  background: var(--color-accent);
  border-color: var(--color-accent);
}
.check-label input:checked + .check-box::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
  color: var(--color-page-bg);
}

.form-error {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--color-danger);
  border-radius: 9px;
  padding: 0.6rem 0.85rem;
  font-size: 0.82rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 0.25rem;
}

.delete-icon-wrap {
  width: 54px; height: 54px;
  background: rgba(239,68,68,0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--color-danger);
}
.delete-sub {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0 0 1.25rem;
  line-height: 1.55;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-active .modal-box, .fade-leave-active .modal-box {
  transition: transform 0.2s, opacity 0.2s;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .modal-box { transform: translateY(-12px); opacity: 0; }
.fade-leave-to .modal-box { transform: translateY(6px); opacity: 0; }

@media (max-width: 768px) {
  .parcours-page { padding: 1.25rem 1rem 3rem; }
  .page-header { flex-direction: column; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .cards-grid { grid-template-columns: 1fr; }
  .field-row { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .page-header { flex-direction: column; }
}
</style>
