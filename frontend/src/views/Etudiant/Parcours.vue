<template>
  <div class="parcours-page">

    <!-- ── Page Header ── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          Parcours Académique
        </h1>
        <p class="page-subtitle">Gérez votre historique de formations et diplômes.</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Ajouter une formation
      </button>
    </div>

    <!-- ── Stats Row ── -->
    <div class="stats-row">
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <div>
          <div class="stat-label">FORMATIONS</div>
          <div class="stat-value">{{ formations.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <div>
          <div class="stat-label">EN COURS</div>
          <div class="stat-value">{{ formations.filter(f => f.est_actuelle).length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div class="stat-label">VALIDÉES</div>
          <div class="stat-value">{{ formations.filter(f => !f.est_actuelle && f.date_fin).length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
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
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Chargement...</span>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="state-box state-error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="fetchFormations">Réessayer</button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="formations.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
      <p class="empty-title">Aucune formation enregistrée</p>
      <p class="empty-sub">Commencez à documenter votre parcours académique</p>
      <button class="btn-primary" @click="openModal()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
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
        <!-- Card Top Bar -->
        <div class="card-topbar">
          <span class="card-type-badge">{{ f.filiere || getDiplomeType(f.diplome) }}</span>
          <span class="status-badge" :class="f.est_actuelle ? 'status-active' : 'status-done'">
            <span class="status-dot"></span>
            {{ f.est_actuelle ? 'En cours' : 'Terminé' }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <h3 class="card-title">{{ f.diplome }}</h3>
          <p class="card-etab">{{ f.etablissement }}</p>
          <p v-if="f.description" class="card-desc">{{ f.description }}</p>
        </div>

        <!-- Card Meta -->
        <div class="card-meta-row">
          <span class="meta-date">{{ formatDate(f.date_debut) }}{{ f.date_fin || f.est_actuelle ? ' – ' + (f.est_actuelle ? 'présent' : formatDate(f.date_fin)) : '' }}</span>
          <span v-if="f.mention" class="mention-tag">{{ f.mention }}</span>
        </div>

        <!-- Card Footer -->
        <div class="card-footer">
          <span class="duration-text">{{ getDuration(f) }}</span>
          <div class="card-actions">
            <button class="action-btn" @click="openModal(f)" title="Modifier">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
            <button class="action-btn action-btn-danger" @click="confirmDelete(f)" title="Supprimer">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Add/Edit Modal ── -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingFormation ? 'Modifier la formation' : 'Nouvelle formation' }}</h2>
            <button class="modal-close" @click="closeModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="modal-form">
            <div class="field">
              <label>Diplôme / Titre <span class="req">*</span></label>
              <input v-model="form.diplome" type="text" placeholder="ex: Licence Informatique, Master MIAGE…" required />
            </div>

            <div class="field">
              <label>Établissement <span class="req">*</span></label>
              <input v-model="form.etablissement" type="text" placeholder="ex: Université Moulay Ismaïl, ENSAM…" required />
            </div>

            <div class="field-row">
              <div class="field">
                <label>Date de début <span class="req">*</span></label>
                <input v-model="form.date_debut" type="date" required />
              </div>
              <div class="field">
                <label>Date de fin</label>
                <input v-model="form.date_fin" type="date" :disabled="form.est_actuelle" />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label>Mention</label>
                <select v-model="form.mention">
                  <option value="">Aucune</option>
                  <option>Passable</option>
                  <option>Assez Bien</option>
                  <option>Bien</option>
                  <option>Très Bien</option>
                  <option>Félicitations</option>
                </select>
              </div>
              <div class="field field-check">
                <label class="check-label">
                  <input v-model="form.est_actuelle" type="checkbox" />
                  <span class="check-box"></span>
                  Formation en cours
                </label>
              </div>
            </div>

            <div class="field">
              <label>Description</label>
              <textarea v-model="form.description" rows="3" placeholder="Spécialisations, projets réalisés, activités…"></textarea>
            </div>

            <div v-if="formError" class="form-error">{{ formError }}</div>

            <div class="modal-footer">
              <button type="button" class="btn-ghost" @click="closeModal">Annuler</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-sm"></span>
                {{ editingFormation ? 'Enregistrer' : 'Ajouter' }}
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
          <h3 class="modal-title" style="text-align:center">Supprimer la formation ?</h3>
          <p class="delete-sub">« {{ formationToDelete?.diplome }} » sera définitivement supprimée.</p>
          <div class="modal-footer" style="justify-content:center">
            <button class="btn-ghost" @click="showDeleteConfirm = false">Annuler</button>
            <button class="btn-danger" @click="deleteFormation" :disabled="submitting">
              <span v-if="submitting" class="spinner-sm"></span>
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
const formations       = ref([])
const loading          = ref(false)
const error            = ref(null)
const showModal        = ref(false)
const showDeleteConfirm = ref(false)
const editingFormation  = ref(null)
const formationToDelete = ref(null)
const submitting        = ref(false)
const formError         = ref(null)
const sortByDate        = ref(true)

const defaultForm = () => ({
  diplome: '', etablissement: '',
  date_debut: '', date_fin: '',
  description: '', mention: '', est_actuelle: false
})
const form = ref(defaultForm())

// ── Computed ───────────────────────────────────────────────────────────────
const formationsSorted = computed(() =>
  [...formations.value].sort((a, b) => {
    if (a.est_actuelle && !b.est_actuelle) return -1
    if (!a.est_actuelle && b.est_actuelle) return 1
    if (sortByDate.value) return new Date(b.date_debut) - new Date(a.date_debut)
    return a.diplome.localeCompare(b.diplome)
  })
)

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── API ────────────────────────────────────────────────────────────────────
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
  formError.value = null; submitting.value = true
  const sid = getStudentId()
  if (!sid) { formError.value = 'Identifiant introuvable.'; submitting.value = false; return }
  try {
    const payload = {
      diplome:        form.value.diplome,
      etablissement:  form.value.etablissement,
      date_debut:     form.value.date_debut,
      date_fin:       form.value.est_actuelle ? null : (form.value.date_fin || null),
      description:    form.value.description || null,
      mention:        form.value.mention || null,
      est_actuelle:   form.value.est_actuelle
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
  try {
    await api.delete(`/formations/${formationToDelete.value.id_formation}`)
    await fetchFormations()
    showDeleteConfirm.value = false
    formationToDelete.value = null
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur suppression.'
  } finally { submitting.value = false }
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openModal(f = null) {
  editingFormation.value = f
  form.value = f ? {
    diplome: f.diplome, etablissement: f.etablissement,
    date_debut: toInputDate(f.date_debut), date_fin: toInputDate(f.date_fin),
    description: f.description || '', mention: f.mention || '',
    est_actuelle: f.est_actuelle
  } : defaultForm()
  formError.value = null
  showModal.value = true
}
function closeModal() {
  showModal.value = false
  editingFormation.value = null
  form.value = defaultForm()
}
function confirmDelete(f) {
  formationToDelete.value = f
  showDeleteConfirm.value = true
}

onMounted(fetchFormations)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ── Variables ─────────────────────────────────────────────────────────── */
* { box-sizing: border-box; }

.parcours-page {
  --bg:       #0D2B2B;
  --surface:  #1A3838;
  --card:     #1e3f3f;
  --card-hover: #22454545;
  --mint:     #D6EDE8;
  --sage:     #5C8C6A;
  --olive:    #3D3D3D;
  --night:    #0D2B2B;
  --text:     #D6EDE8;
  --text-dim: rgba(214,237,232,0.55);
  --text-muted: rgba(214,237,232,0.35);
  --border:   rgba(214,237,232,0.08);
  --border-md: rgba(214,237,232,0.13);
  --danger:   #b94040;

  font-family: 'Inter', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  padding: 2rem 2rem 4rem;
  color: var(--text);
}

/* ── Page Header ─────────────────────────────────────────────────────────── */
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
  color: var(--mint);
  margin: 0 0 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  letter-spacing: -0.02em;
}

.title-icon { color: var(--sage); opacity: 0.85; flex-shrink: 0; }

.page-subtitle {
  font-size: 0.875rem;
  color: var(--text-dim);
  margin: 0;
  font-weight: 400;
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--sage);
  color: var(--night);
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
.btn-primary:hover { background: #6fa37d; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid var(--border-md);
  color: var(--text-dim);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
}
.btn-ghost:hover { border-color: var(--sage); color: var(--text); }

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--danger);
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
.btn-danger:hover { background: #c94848; }
.btn-danger:disabled { opacity: 0.55; cursor: not-allowed; }

/* ── Stats Row ───────────────────────────────────────────────────────────── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.1rem 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  color: var(--text-dim);
}

.stat-card svg { flex-shrink: 0; opacity: 0.7; }

.stat-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.15rem;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--mint);
  line-height: 1;
  letter-spacing: -0.02em;
}

/* ── Section Header ──────────────────────────────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--mint);
  margin: 0;
}

.section-actions { display: flex; gap: 0.6rem; }

/* ── State Boxes ─────────────────────────────────────────────────────────── */
.state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  color: var(--text-dim);
  font-size: 0.875rem;
  flex-wrap: wrap;
}
.state-error { color: #e07070; }

.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--border-md);
  border-top-color: var(--sage);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}
.spinner-sm {
  display: inline-block;
  width: 13px; height: 13px;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: var(--night);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Empty Card ──────────────────────────────────────────────────────────── */
.empty-card {
  background: var(--surface);
  border: 1px dashed var(--border-md);
  border-radius: 14px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}
.empty-icon { color: var(--sage); opacity: 0.6; margin-bottom: 0.25rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--mint); margin: 0; }
.empty-sub { font-size: 0.84rem; color: var(--text-dim); margin: 0 0 0.5rem; }

/* ── Cards Grid ──────────────────────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.formation-card {
  background: var(--surface);
  border: 1px solid var(--border);
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
  border-color: rgba(92,140,106,0.35);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.25);
}

/* Top bar */
.card-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-type-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.04em;
  background: rgba(214,237,232,0.06);
  border: 1px solid var(--border);
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
  background: rgba(92,140,106,0.15);
  color: #7fb88a;
  border: 1px solid rgba(92,140,106,0.3);
}
.status-active .status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #7fb88a;
  animation: blink 1.8s ease-in-out infinite;
}

.status-done {
  background: rgba(214,237,232,0.06);
  color: var(--text-dim);
  border: 1px solid var(--border);
}
.status-done .status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
}

@keyframes blink {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* Body */
.card-body { flex: 1; }
.card-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--mint);
  margin: 0 0 0.25rem;
  line-height: 1.35;
}
.card-etab {
  font-size: 0.84rem;
  color: var(--text-dim);
  margin: 0 0 0.4rem;
}
.card-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* Meta row */
.card-meta-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.meta-date {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.mention-tag {
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(92,140,106,0.12);
  color: var(--sage);
  border: 1px solid rgba(92,140,106,0.25);
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.6rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 0.5rem;
}
.duration-text {
  font-size: 0.75rem;
  color: var(--text-muted);
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
  border: 1px solid var(--border-md);
  color: var(--text-dim);
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.18s;
}
.action-btn:hover {
  border-color: var(--sage);
  color: var(--text);
  background: rgba(92,140,106,0.1);
}
.action-btn-danger:hover {
  border-color: var(--danger);
  color: #e07070;
  background: rgba(185,64,64,0.1);
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
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
  background: var(--surface);
  border: 1px solid var(--border-md);
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
  color: var(--mint);
  margin: 0;
}
.modal-close {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-dim);
  width: 30px; height: 30px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}
.modal-close:hover { background: var(--border); color: var(--text); }

.modal-form { display: flex; flex-direction: column; gap: 1rem; }

.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.field-check { justify-content: flex-end; padding-bottom: 2px; }

.field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.req { color: var(--sage); }

.field input,
.field select,
.field textarea {
  background: rgba(13,43,43,0.7);
  border: 1px solid var(--border-md);
  border-radius: 9px;
  padding: 0.6rem 0.85rem;
  color: var(--text);
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s;
  width: 100%;
}
.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--sage);
  box-shadow: 0 0 0 3px rgba(92,140,106,0.12);
}
.field input::placeholder,
.field textarea::placeholder { color: var(--text-muted); }
.field input:disabled { opacity: 0.35; cursor: not-allowed; }
.field select option { background: #1a3838; }
.field textarea { resize: vertical; min-height: 80px; }

.check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-dim);
  text-transform: none;
  letter-spacing: 0;
}
.check-label input { display: none; }
.check-box {
  width: 18px; height: 18px;
  border: 1.5px solid var(--border-md);
  border-radius: 5px;
  background: rgba(13,43,43,0.7);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s;
}
.check-label input:checked + .check-box {
  background: var(--sage);
  border-color: var(--sage);
}
.check-label input:checked + .check-box::after {
  content: '✓';
  font-size: 11px;
  font-weight: 700;
  color: var(--night);
}

.form-error {
  background: rgba(185,64,64,0.1);
  border: 1px solid rgba(185,64,64,0.3);
  color: #e07070;
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

/* Delete modal */
.delete-icon-wrap {
  width: 54px; height: 54px;
  background: rgba(185,64,64,0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #e07070;
}
.delete-sub {
  font-size: 0.875rem;
  color: var(--text-dim);
  margin: 0 0 1.25rem;
  line-height: 1.55;
}

/* ── Transition ─────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-active .modal-box, .fade-leave-active .modal-box {
  transition: transform 0.2s, opacity 0.2s;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .modal-box { transform: translateY(-12px); opacity: 0; }
.fade-leave-to .modal-box { transform: translateY(6px); opacity: 0; }

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .parcours-page { padding: 1.25rem 1rem 3rem; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .cards-grid { grid-template-columns: 1fr; }
  .field-row { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .page-header { flex-direction: column; }
}
</style>