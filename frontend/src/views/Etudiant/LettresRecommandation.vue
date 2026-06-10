<template>
  <div class="lettres-page">

    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <h1>Lettres de recommandation</h1>
        <p>Gérez vos demandes et consultez vos lettres reçues.</p>
      </div>
      <div class="header-right">
        <div class="view-switcher">
          <button
            v-for="v in views"
            :key="v.key"
            class="view-btn"
            :class="{ 'view-active': activeView === v.key }"
            @click="activeView = v.key"
          >
            <span v-html="v.icon"></span>
            {{ v.label }}
          </button>
        </div>
        <button v-if="activeView === 'demandes'" class="btn-new" @click="openModal">
          <span>＋</span> Nouvelle demande
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">TOTAL DEMANDES</div>
        <div class="stat-value">{{ lettres.length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">EN ATTENTE</div>
        <div class="stat-value">{{ lettres.filter(l => l.statut === 'EN_ATTENTE').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">VALIDÉES</div>
        <div class="stat-value">{{ lettres.filter(l => l.statut === 'VALIDEE').length }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">LETTRES REÇUES</div>
        <div class="stat-value">{{ lettresRecues.length }}</div>
      </div>
    </div>

    <!-- VUE 1 : Mes demandes -->
    <Transition name="slide" mode="out-in">
    <div v-if="activeView === 'demandes'" key="demandes">
      <div class="tabs-row">
        <button
          v-for="tab in tabs" :key="tab.key"
          class="tab-btn" :class="{ 'tab-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-count">{{ tab.key === 'all' ? lettres.length : lettres.filter(l => l.statut === tab.key).length }}</span>
        </button>
      </div>

      <div class="cards-list">
        <div v-for="lettre in filteredLettres" :key="lettre.id" class="lettre-card">
          <div class="card-top">
            <div class="card-left">
              <span class="type-badge">{{ formatType(lettre.type) }}</span>
              <span class="prof-name">{{ sanitizeText(lettre.professeur) }}</span>
            </div>
            <span class="status-badge" :class="statusClass(lettre.statut)">
              {{ statusLabel(lettre.statut) }}
            </span>
          </div>
          <p class="card-motif">{{ sanitizeText(lettre.motif) }}</p>
          <div class="card-bottom">
            <span class="card-date">{{ formatDate(lettre.date_demande) }}</span>
            <span class="card-visibilite">{{ formatVisibilite(lettre.visibilite) }}</span>
          </div>
          <div class="card-actions" v-if="lettre.statut === 'EN_ATTENTE'">
            <button
              class="btn-delete"
              @click="confirmSuppression(lettre.id)"
              :disabled="actionLoading"
            >
              Annuler la demande
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- VUE 2 : Lettres reçues -->
    <Transition name="slide" mode="out-in">
    <div v-if="activeView === 'recues'" key="recues">
      <div v-if="lettresRecues.length === 0" class="empty-card">
        <p class="empty-title">Aucune lettre reçue pour le moment</p>
        <p class="empty-sub">Les lettres validées par vos enseignants apparaîtront ici.</p>
      </div>
      <div v-else class="cards-list">
        <div v-for="lettre in lettresRecues" :key="lettre.id" class="lettre-card lettre-card--recue">
          <div class="card-top">
            <div class="card-left">
              <span class="type-badge">{{ formatType(lettre.type) }}</span>
              <span class="prof-name">{{ sanitizeText(lettre.professeur) }}</span>
            </div>
            <span class="status-badge status-valid">Validée</span>
          </div>
          <p class="card-motif">{{ sanitizeText(lettre.motif) }}</p>
          <div class="card-bottom">
            <span class="card-date">{{ formatDate(lettre.date_validation) }}</span>
            <span class="card-visibilite">{{ formatVisibilite(lettre.visibilite) }}</span>
          </div>
          <div class="card-actions">
            <button class="btn-download">
              ↓ Télécharger la lettre
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>

    <!-- VUE 3 : Statistiques -->
    <Transition name="slide" mode="out-in">
    <div v-if="activeView === 'stats'" key="stats" class="stats-view">

      <div class="stat-big-row">
        <div class="stat-big-card">
          <div class="stat-big-label">Taux de validation</div>
          <div class="stat-big-value">{{ tauxValidation }}%</div>
          <div class="stat-big-bar">
            <div class="stat-big-fill" :style="{ width: tauxValidation + '%' }"></div>
          </div>
        </div>
        <div class="stat-big-card">
          <div class="stat-big-label">Type le plus demandé</div>
          <div class="stat-big-value" style="font-size:1.1rem">{{ typePlusDemande }}</div>
        </div>
        <div class="stat-big-card">
          <div class="stat-big-label">Lettres téléchargeables</div>
          <div class="stat-big-value">{{ lettres.filter(l => l.visibilite === 'TELECHARGEABLE').length }}</div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-title">Demandes par type</div>
        <div class="bar-chart">
          <div v-for="item in chartData" :key="item.label" class="bar-item">
            <div class="bar-label">{{ item.label }}</div>
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: (item.count / lettres.length * 100) + '%' }"></div>
            </div>
            <div class="bar-count">{{ item.count }}</div>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="chart-title">Timeline des demandes</div>
        <div class="timeline">
          <div v-for="lettre in [...lettres].sort((a,b) => new Date(b.date_demande) - new Date(a.date_demande))" :key="lettre.id" class="timeline-item">
            <div class="timeline-dot" :class="statusClass(lettre.statut)"></div>
            <div class="timeline-content">
              <span class="timeline-type">{{ formatType(lettre.type) }}</span>
              <span class="timeline-prof">{{ sanitizeText(lettre.professeur) }}</span>
            </div>
            <span class="timeline-date">{{ formatDate(lettre.date_demande) }}</span>
            <span class="status-badge" :class="statusClass(lettre.statut)" style="font-size:0.68rem">{{ statusLabel(lettre.statut) }}</span>
          </div>
        </div>
      </div>

    </div>
    </Transition>

    <!-- Modal nouvelle demande -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Nouvelle demande de lettre</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-errors" v-if="formErrors.length">
              <p v-for="err in formErrors" :key="err" class="form-error-msg">{{ err }}</p>
            </div>
            <div class="form-grid">
              <div class="form-group form-group--full">
                <label>Type de candidature *</label>
                <select v-model="form.type" class="form-input">
                  <option value="">-- Choisir un type --</option>
                  <option value="MASTER_DOCTORAT">Master / Doctorat</option>
                  <option value="STAGE_EMPLOI">Stage / Emploi</option>
                  <option value="DOUBLE_DIPLOMATION">Double diplomation</option>
                  <option value="PROGRAMME_INTERNATIONAL">Programme international</option>
                </select>
              </div>
              <div class="form-group form-group--full">
                <label>Professeur destinataire *</label>
                <input
                  v-model="form.professeur"
                  class="form-input"
                  placeholder="ex: Prof. Ahmed Alami"
                  maxlength="100"
                  autocomplete="off"
                />
              </div>
              <div class="form-group form-group--full">
                <label>Motif / Description *</label>
                <textarea
                  v-model="form.motif"
                  class="form-input form-textarea"
                  placeholder="Décrivez l'objectif de votre demande..."
                  rows="4"
                  maxlength="1000"
                ></textarea>
                <span class="char-counter">{{ form.motif.length }} / 1000</span>
              </div>
              <div class="form-group form-group--full">
                <label>Visibilité</label>
                <select v-model="form.visibilite" class="form-input">
                  <option value="PUBLIQUE">Publique</option>
                  <option value="PRIVEE">Privée</option>
                  <option value="TELECHARGEABLE">Téléchargeable</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Annuler</button>
            <button
              class="btn-new"
              @click="submitDemande"
              :disabled="actionLoading"
            >
              Envoyer la demande
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Dialogue de confirmation suppression -->
    <Transition name="fade">
      <div v-if="confirmDialog.show" class="modal-overlay" @click.self="cancelConfirm">
        <div class="modal-box" style="max-width: 420px;">
          <div class="modal-header">
            <h2>{{ confirmDialog.title }}</h2>
            <button class="modal-close" @click="cancelConfirm">✕</button>
          </div>
          <p style="color: var(--color-text-secondary); font-size: 0.875rem; margin: 0 0 1.25rem;">
            {{ confirmDialog.message }}
          </p>
          <div class="modal-footer">
            <button class="btn-cancel" @click="cancelConfirm">Annuler</button>
            <button
              class="btn-delete"
              @click="confirmDialog.onConfirm"
              :disabled="actionLoading"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeView = ref('demandes')
const activeTab  = ref('all')
const showModal  = ref(false)
const actionLoading = ref(false)
const formErrors = ref([])

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null,
})

const views = [
  {
    key: 'demandes',
    label: 'Mes demandes',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
  },
  {
    key: 'recues',
    label: 'Lettres reçues',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`
  },
  {
    key: 'stats',
    label: 'Statistiques',
    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
  },
]

const tabs = [
  { key: 'all',        label: 'Toutes' },
  { key: 'EN_ATTENTE', label: 'En attente' },
  { key: 'VALIDEE',    label: 'Validées' },
  { key: 'REFUSEE',    label: 'Refusées' },
]

const ALLOWED_TYPES = ['MASTER_DOCTORAT', 'STAGE_EMPLOI', 'DOUBLE_DIPLOMATION', 'PROGRAMME_INTERNATIONAL']
const ALLOWED_VISIBILITES = ['PUBLIQUE', 'PRIVEE', 'TELECHARGEABLE']
const ALLOWED_STATUTS = ['EN_ATTENTE', 'VALIDEE', 'REFUSEE']

const lettres = ref([
  { id: 1, type: 'MASTER_DOCTORAT',    professeur: 'Prof. Ahmed Alami',  motif: 'Candidature master IA à Paris Saclay.', visibilite: 'PRIVEE',         statut: 'EN_ATTENTE', date_demande: '2026-05-20' },
  { id: 2, type: 'STAGE_EMPLOI',       professeur: 'Prof. Karim Bennani', motif: 'Stage ingénieur chez Google été 2026.', visibilite: 'PUBLIQUE',        statut: 'VALIDEE',    date_demande: '2026-04-10' },
  { id: 3, type: 'DOUBLE_DIPLOMATION', professeur: 'Prof. Ahmed Alami',  motif: 'Programme double diplôme ENSA–Polytechnique.', visibilite: 'TELECHARGEABLE', statut: 'REFUSEE', date_demande: '2026-03-05' },
])

const lettresRecues = computed(() =>
  lettres.value.filter(l => l.statut === 'VALIDEE').map(l => ({ ...l, date_validation: l.date_demande }))
)

const filteredLettres = computed(() => {
  if (activeTab.value === 'all') return lettres.value
  return lettres.value.filter(l => l.statut === activeTab.value)
})

const tauxValidation = computed(() => {
  if (!lettres.value.length) return 0
  return Math.round(lettres.value.filter(l => l.statut === 'VALIDEE').length / lettres.value.length * 100)
})

const typePlusDemande = computed(() => {
  const counts = {}
  lettres.value.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top ? formatType(top[0]) : '—'
})

const chartData = computed(() => {
  const types = ['MASTER_DOCTORAT', 'STAGE_EMPLOI', 'DOUBLE_DIPLOMATION', 'PROGRAMME_INTERNATIONAL']
  return types.map(t => ({
    label: formatType(t),
    count: lettres.value.filter(l => l.type === t).length
  })).filter(i => i.count > 0)
})

const form = ref({ type: '', professeur: '', motif: '', visibilite: 'PRIVEE' })

function sanitizeText(value) {
  if (!value) return ''
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, 500)
}

function validateForm() {
  const errors = []
  if (!form.value.type || !ALLOWED_TYPES.includes(form.value.type)) {
    errors.push('Veuillez choisir un type de candidature valide.')
  }
  const prof = form.value.professeur.trim()
  if (!prof) {
    errors.push('Le nom du professeur est obligatoire.')
  } else if (prof.length < 3) {
    errors.push('Le nom du professeur doit comporter au moins 3 caractères.')
  } else if (prof.length > 100) {
    errors.push('Le nom du professeur ne peut pas dépasser 100 caractères.')
  }
  const motif = form.value.motif.trim()
  if (!motif) {
    errors.push('Le motif est obligatoire.')
  } else if (motif.length < 10) {
    errors.push('Le motif doit comporter au moins 10 caractères.')
  } else if (motif.length > 1000) {
    errors.push('Le motif ne peut pas dépasser 1 000 caractères.')
  }
  if (!ALLOWED_VISIBILITES.includes(form.value.visibilite)) {
    errors.push('Visibilité invalide.')
  }
  return errors
}

function openModal() {
  formErrors.value = []
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  formErrors.value = []
  form.value = { type: '', professeur: '', motif: '', visibilite: 'PRIVEE' }
}

function showConfirmDialog(title, message, onConfirm) {
  confirmDialog.value = { show: true, title, message, onConfirm }
}

function cancelConfirm() {
  confirmDialog.value = { show: false, title: '', message: '', onConfirm: null }
}

function submitDemande() {
  formErrors.value = validateForm()
  if (formErrors.value.length) return

  if (actionLoading.value) return
  actionLoading.value = true

  try {
    lettres.value.unshift({
      id: Date.now(),
      type: form.value.type,
      professeur: sanitizeText(form.value.professeur),
      motif: sanitizeText(form.value.motif),
      visibilite: form.value.visibilite,
      statut: 'EN_ATTENTE',
      date_demande: new Date().toISOString().split('T')[0]
    })
    closeModal()
  } finally {
    actionLoading.value = false
  }
}

function confirmSuppression(id) {
  const lettre = lettres.value.find(l => l.id === id)
  if (!lettre) return
  showConfirmDialog(
    'Annuler la demande',
    `Voulez-vous vraiment annuler la demande adressée à ${sanitizeText(lettre.professeur)} ?`,
    () => {
      cancelConfirm()
      supprimerDemande(id)
    }
  )
}

function supprimerDemande(id) {
  lettres.value = lettres.value.filter(l => l.id !== id)
}

function formatType(type) {
  const map = { MASTER_DOCTORAT: 'Master / Doctorat', STAGE_EMPLOI: 'Stage / Emploi', DOUBLE_DIPLOMATION: 'Double diplomation', PROGRAMME_INTERNATIONAL: 'Programme international' }
  return map[type] || type
}
function statusLabel(s) { return { EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REFUSEE: 'Refusée' }[s] || s }
function statusClass(s) { return { EN_ATTENTE: 'status-pending', VALIDEE: 'status-valid', REFUSEE: 'status-rejected' }[s] || '' }
function formatVisibilite(v) { return { PUBLIQUE: 'Public', PRIVEE: 'Privée', TELECHARGEABLE: 'Téléchargeable' }[v] || v }
function formatDate(d) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }
</script>



<style scoped>
.lettres-page { padding: 2rem; color: var(--color-text-primary); min-height: 100vh; background: var(--color-page-bg); font-family: 'Inter', sans-serif; }

.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap; }
.header-left h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.3rem; color: var(--color-text-primary); }
.header-left p { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; }
.header-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.view-switcher { display: flex; background: var(--color-surface-alt); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 0.25rem; gap: 0.2rem; }
.view-btn { display: flex; align-items: center; gap: 0.4rem; background: transparent; border: none; color: var(--color-text-secondary); padding: 0.45rem 0.85rem; border-radius: 7px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
.view-btn:hover { color: var(--color-text-primary); }
.view-active { background: var(--color-surface); color: var(--color-text-primary) !important; font-weight: 600; }

.btn-new { display: inline-flex; align-items: center; gap: 0.4rem; background: var(--color-accent); color: #fff; border: none; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-new:hover { background: var(--color-accent-hover); }
.btn-new:disabled { opacity: 0.6; cursor: not-allowed; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 1.2rem 1.4rem; }
.stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; color: var(--color-text-tertiary); margin-bottom: 0.4rem; text-transform: uppercase; }
.stat-value { font-size: 1.8rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }

.tabs-row { display: flex; gap: 0.4rem; margin-bottom: 1.5rem; background: var(--color-surface-alt); border: 1px solid var(--color-border-light); border-radius: 10px; padding: 0.3rem; width: fit-content; }
.tab-btn { display: flex; align-items: center; gap: 0.5rem; background: transparent; border: none; color: var(--color-text-secondary); padding: 0.45rem 0.9rem; border-radius: 7px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.18s; }
.tab-btn:hover { color: var(--color-text-primary); }
.tab-active { background: var(--color-surface); color: var(--color-text-primary) !important; font-weight: 600; }
.tab-count { background: var(--color-surface-hover); color: var(--color-text-tertiary); font-size: 0.7rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: 20px; }
.tab-active .tab-count { background: var(--color-accent-light); color: var(--color-accent); }

.cards-list { display: flex; flex-direction: column; gap: 0.9rem; }
.lettre-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 14px; padding: 1.3rem 1.4rem; display: flex; flex-direction: column; gap: 0.75rem; transition: border-color 0.2s; }
.lettre-card:hover { border-color: var(--color-accent-border); }
.lettre-card--recue { border-left: 3px solid var(--color-accent); }

.card-top { display: flex; align-items: center; justify-content: space-between; }
.card-left { display: flex; align-items: center; gap: 0.75rem; }
.type-badge { background: var(--color-accent-light); color: var(--color-accent); border: 1px solid var(--color-accent-border); font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 20px; }
.prof-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 20px; }
.status-pending  { background: var(--color-waiting-bg); color: var(--color-waiting-text); border: 1px solid var(--color-waiting-border); }
.status-valid    { background: var(--color-valid-bg); color: var(--color-valid-text); border: 1px solid var(--color-valid-border); }
.status-rejected { background: var(--color-purple-bg); color: var(--color-purple-text); border: 1px solid var(--color-purple-border); }
.card-motif { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.card-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--color-border-light); }
.card-date { font-size: 0.78rem; color: var(--color-text-tertiary); }
.card-visibilite { font-size: 0.72rem; font-weight: 500; color: var(--color-text-tertiary); background: var(--color-surface-hover); padding: 0.15rem 0.5rem; border-radius: 6px; }
.card-actions { display: flex; justify-content: flex-end; gap: 0.5rem; padding-top: 0.5rem; }
.btn-delete { background: transparent; border: 1px solid var(--color-danger); color: var(--color-danger); padding: 0.35rem 0.85rem; border-radius: 7px; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.18s; }
.btn-delete:hover { background: rgba(239,68,68,0.1); }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-download { background: var(--color-accent-light); border: 1px solid var(--color-accent-border); color: var(--color-accent); padding: 0.35rem 0.85rem; border-radius: 7px; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.18s; }
.btn-download:hover { background: var(--color-accent-light); opacity: 0.8; }

.empty-card { background: var(--color-surface); border: 1px dashed var(--color-border); border-radius: 14px; padding: 3rem 2rem; text-align: center; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 0.5rem; }
.empty-sub { font-size: 0.84rem; color: var(--color-text-secondary); margin: 0; }

.stats-view { display: flex; flex-direction: column; gap: 1.5rem; }
.stat-big-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-big-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 14px; padding: 1.5rem; }
.stat-big-label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-tertiary); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem; }
.stat-big-value { font-size: 2rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.75rem; }
.stat-big-bar { background: var(--color-surface-hover); border-radius: 99px; height: 6px; overflow: hidden; }
.stat-big-fill { background: var(--color-accent); height: 100%; border-radius: 99px; transition: width 0.6s ease; }

.chart-section { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 14px; padding: 1.5rem; }
.chart-title { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: 1.25rem; }
.bar-chart { display: flex; flex-direction: column; gap: 0.9rem; }
.bar-item { display: flex; align-items: center; gap: 1rem; }
.bar-label { font-size: 0.82rem; color: var(--color-text-secondary); width: 160px; flex-shrink: 0; }
.bar-track { flex: 1; background: var(--color-surface-hover); border-radius: 99px; height: 8px; overflow: hidden; }
.bar-fill { background: var(--color-accent); height: 100%; border-radius: 99px; transition: width 0.6s ease; }
.bar-count { font-size: 0.82rem; font-weight: 600; color: var(--color-accent); width: 20px; text-align: right; }

.timeline { display: flex; flex-direction: column; gap: 0.75rem; }
.timeline-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--color-surface-alt); border-radius: 10px; }
.timeline-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.timeline-dot.status-pending  { background: var(--color-waiting-text); }
.timeline-dot.status-valid    { background: var(--color-valid-text); }
.timeline-dot.status-rejected { background: var(--color-purple-text); }
.timeline-content { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.timeline-type { font-size: 0.84rem; font-weight: 600; color: var(--color-text-primary); }
.timeline-prof { font-size: 0.75rem; color: var(--color-text-secondary); }
.timeline-date { font-size: 0.75rem; color: var(--color-text-tertiary); white-space: nowrap; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; width: 100%; max-width: 520px; padding: 1.75rem; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.4rem; }
.modal-header h2 { font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary); margin: 0; }
.modal-close { background: transparent; border: 1px solid var(--color-border-light); color: var(--color-text-secondary); width: 30px; height: 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; }
.modal-close:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
.modal-body { padding: 0; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group--full { grid-column: 1 / -1; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
.form-input { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 9px; padding: 0.6rem 0.85rem; color: var(--color-text-primary); font-size: 0.875rem; outline: none; transition: border-color 0.18s; width: 100%; font-family: 'Inter', sans-serif; }
.form-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-light); }
.form-input option { background: var(--color-surface); }
.form-textarea { resize: vertical; min-height: 100px; }
.char-counter { font-size: 0.72rem; color: var(--color-text-tertiary); text-align: right; }
.form-errors { margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.3rem; }
.form-error-msg { font-size: 0.8rem; color: var(--color-danger); background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 6px; padding: 0.35rem 0.7rem; margin: 0; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.65rem; margin-top: 1.25rem; }
.btn-cancel { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-secondary); padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.84rem; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { border-color: var(--color-accent); color: var(--color-text-primary); }

.slide-enter-active, .slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.slide-enter-from { opacity: 0; transform: translateY(8px); }
.slide-leave-to { opacity: 0; transform: translateY(-8px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>