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
        <button class="btn-new" @click="showModal = true">
          <span>＋</span> Nouvelle demande
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <p>Chargement des lettres...</p>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">LETTRES REÇUES</div>
          <div class="stat-value">{{ lettres.length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">TYPES DIFFÉRENTS</div>
          <div class="stat-value">{{ typesCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">AVEC PDF</div>
          <div class="stat-value">{{ lettres.filter(l => l.pdf_url).length }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">PROFESSEURS</div>
          <div class="stat-value">{{ redacteursCount }}</div>
        </div>
      </div>

      <!-- VUE 1 : Lettres reçues -->
      <Transition name="slide" mode="out-in">
      <div v-if="activeView === 'recues'" key="recues">
        <div v-if="lettres.length === 0" class="empty-card">
          <p class="empty-title">Aucune lettre reçue pour le moment</p>
          <p class="empty-sub">Les lettres rédigées par vos enseignants apparaîtront ici.</p>
        </div>
        <div v-else class="cards-list">
          <div v-for="lettre in lettres" :key="lettre.id" class="lettre-card">
            <div class="card-top">
              <div class="card-left">
                <span class="type-badge">{{ formatType(lettre.type) }}</span>
                <span class="prof-name">{{ lettre.redacteur }}</span>
              </div>
              <span class="status-badge status-valid">Reçue</span>
            </div>
            <p class="card-motif">{{ lettre.description || 'Aucune description' }}</p>
            <div class="card-bottom">
              <span class="card-date">Reçue le {{ formatDate(lettre.date_redaction) }}</span>
              <span class="card-destinataire" v-if="lettre.destinataire">{{ lettre.destinataire }}</span>
            </div>
            <div class="card-actions" v-if="lettre.pdf_url">
              <a :href="lettre.pdf_url" target="_blank" class="btn-download">
                ↓ Télécharger la lettre
              </a>
            </div>
          </div>
        </div>
      </div>
      </Transition>

      <!-- VUE 2 : Statistiques -->
      <Transition name="slide" mode="out-in">
      <div v-if="activeView === 'stats'" key="stats" class="stats-view">

        <div class="stat-big-row">
          <div class="stat-big-card">
            <div class="stat-big-label">Total lettres</div>
            <div class="stat-big-value">{{ lettres.length }}</div>
          </div>
          <div class="stat-big-card">
            <div class="stat-big-label">Type le plus reçu</div>
            <div class="stat-big-value" style="font-size:1.1rem">{{ typePlusRecu }}</div>
          </div>
          <div class="stat-big-card">
            <div class="stat-big-label">Professeur le plus actif</div>
            <div class="stat-big-value" style="font-size:1.1rem">{{ redacteurPlusActif }}</div>
          </div>
        </div>

        <div class="chart-section">
          <div class="chart-title">Répartition par type</div>
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
          <div class="chart-title">Chronologie des lettres</div>
          <div class="timeline">
            <div v-for="lettre in [...lettres].sort((a,b) => new Date(b.date_redaction) - new Date(a.date_redaction))" :key="lettre.id" class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-type">{{ formatType(lettre.type) }}</span>
                <span class="timeline-prof">{{ lettre.redacteur }}</span>
              </div>
              <span class="timeline-date">{{ formatDate(lettre.date_redaction) }}</span>
            </div>
          </div>
        </div>

      </div>
      </Transition>
    </template>

    <!-- Modal nouvelle demande -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Nouvelle demande de lettre</h2>
            <button class="modal-close" @click="showModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group form-group--full">
                <label>Type de lettre *</label>
                <select v-model="form.type_lettre" class="form-input">
                  <option value="">-- Choisir un type --</option>
                  <option v-for="t in TYPE_LETTRES" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </div>
              <div class="form-group form-group--full">
                <label>Professeur *</label>
                <select v-model="form.id_professeur" class="form-input">
                  <option value="">-- Choisir un professeur --</option>
                  <option v-for="p in professeurs" :key="p.id_professeur" :value="p.id_professeur">
                    {{ p.utilisateur?.prenom }} {{ p.utilisateur?.nom }}
                  </option>
                </select>
              </div>
              <div class="form-group form-group--full">
                <label>Destinataire *</label>
                <input v-model="form.destinataire" class="form-input" placeholder="ex: Université Paris Saclay, Entreprise XYZ" />
              </div>
              <div class="form-group form-group--full">
                <label>Description</label>
                <textarea v-model="form.description" class="form-input form-textarea" placeholder="Décrivez l'objectif de votre demande..." rows="4"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showModal = false">Annuler</button>
            <button class="btn-new" @click="submitDemande" :disabled="submitting">
              {{ submitting ? 'Envoi...' : 'Envoyer la demande' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Notification succès -->
    <Transition name="fade">
      <div v-if="demandeEnvoyee" class="toast-success">
        ✓ Demande envoyée avec succès au professeur.
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import {
  getLettresRecues,
  demanderLettre,
  getProfesseurs,
  normalizeLettre,
  TYPE_LETTRES,
  formatType,
} from '@/services/lettreService'

const authStore = useAuthStore()
const ecole = authStore.user?.ecole || ''

const activeView = ref('recues')
const showModal  = ref(false)
const loading    = ref(true)
const submitting = ref(false)
const demandeEnvoyee = ref(false)

const lettres = ref([])
const professeurs = ref([])

const views = [
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

const form = ref({ type_lettre: '', id_professeur: '', destinataire: '', description: '' })

const typesCount = computed(() => new Set(lettres.value.map(l => l.type)).size)
const redacteursCount = computed(() => new Set(lettres.value.map(l => l.redacteur)).size)

const typePlusRecu = computed(() => {
  const counts = {}
  lettres.value.forEach(l => { counts[l.type] = (counts[l.type] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top ? formatType(top[0]) : '—'
})

const redacteurPlusActif = computed(() => {
  const counts = {}
  lettres.value.forEach(l => { counts[l.redacteur] = (counts[l.redacteur] || 0) + 1 })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return top ? top[0] : '—'
})

const chartData = computed(() =>
  TYPE_LETTRES.map(t => ({
    label: t.label,
    count: lettres.value.filter(l => l.type === t.value).length
  })).filter(i => i.count > 0)
)

onMounted(async () => {
  const [lettresData, profs] = await Promise.all([
    getLettresRecues(),
    ecole ? getProfesseurs(ecole) : Promise.resolve([]),
  ])
  lettres.value = (lettresData || []).map(normalizeLettre)
  professeurs.value = profs || []
  loading.value = false
})

async function submitDemande() {
  if (!form.value.type_lettre || !form.value.id_professeur || !form.value.destinataire) {
    alert('Merci de remplir tous les champs obligatoires.')
    return
  }
  submitting.value = true
  try {
    await demanderLettre({
      id_professeur: form.value.id_professeur,
      type_lettre: form.value.type_lettre,
      destinataire: form.value.destinataire,
      description: form.value.description,
    })
    form.value = { type_lettre: '', id_professeur: '', destinataire: '', description: '' }
    showModal.value = false
    demandeEnvoyee.value = true
    setTimeout(() => { demandeEnvoyee.value = false }, 4000)
  } catch (e) {
    alert(e?.response?.data?.message || 'Erreur lors de la demande')
  } finally {
    submitting.value = false
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
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

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; color: var(--color-text-secondary); gap: 1rem; }
.spinner { width: 32px; height: 32px; border: 3px solid var(--color-border); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 1.2rem 1.4rem; }
.stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; color: var(--color-text-tertiary); margin-bottom: 0.4rem; text-transform: uppercase; }
.stat-value { font-size: 1.8rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }

.cards-list { display: flex; flex-direction: column; gap: 0.9rem; }
.lettre-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 14px; padding: 1.3rem 1.4rem; display: flex; flex-direction: column; gap: 0.75rem; transition: border-color 0.2s; }
.lettre-card:hover { border-color: var(--color-accent-border); }

.card-top { display: flex; align-items: center; justify-content: space-between; }
.card-left { display: flex; align-items: center; gap: 0.75rem; }
.type-badge { background: var(--color-accent-light); color: var(--color-accent); border: 1px solid var(--color-accent-border); font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 20px; }
.prof-name { font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary); }
.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 20px; }
.status-valid { background: var(--color-valid-bg, #d1fae5); color: var(--color-valid-text, #065f46); border: 1px solid var(--color-valid-border, #a7f3d0); }
.card-motif { font-size: 0.875rem; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
.card-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid var(--color-border-light); }
.card-date { font-size: 0.78rem; color: var(--color-text-tertiary); }
.card-destinataire { font-size: 0.72rem; font-weight: 500; color: var(--color-text-tertiary); background: var(--color-surface-hover); padding: 0.15rem 0.5rem; border-radius: 6px; }
.card-actions { display: flex; justify-content: flex-end; gap: 0.5rem; padding-top: 0.5rem; }
.btn-download { display: inline-block; background: var(--color-accent-light); border: 1px solid var(--color-accent-border); color: var(--color-accent); padding: 0.35rem 0.85rem; border-radius: 7px; font-size: 0.78rem; font-weight: 500; cursor: pointer; text-decoration: none; transition: all 0.18s; }
.btn-download:hover { background: var(--color-accent-light); opacity: 0.8; }

.empty-card { background: var(--color-surface); border: 1px dashed var(--color-border); border-radius: 14px; padding: 3rem 2rem; text-align: center; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0 0 0.5rem; }
.empty-sub { font-size: 0.84rem; color: var(--color-text-secondary); margin: 0; }

.stats-view { display: flex; flex-direction: column; gap: 1.5rem; }
.stat-big-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-big-card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 14px; padding: 1.5rem; }
.stat-big-label { font-size: 0.75rem; font-weight: 600; color: var(--color-text-tertiary); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem; }
.stat-big-value { font-size: 2rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: 0.75rem; }

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
.timeline-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; background: var(--color-accent); }
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
.form-input { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 9px; padding: 0.6rem 0.85rem; color: var(--color-text-primary); font-size: 0.875rem; outline: none; transition: border-color 0.18s; width: 100%; font-family: 'Inter', sans-serif; box-sizing: border-box; }
.form-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px var(--color-accent-light); }
.form-input option { background: var(--color-surface); color: black; }
.form-textarea { resize: vertical; min-height: 100px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.65rem; margin-top: 0.25rem; }
.btn-cancel { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-secondary); padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.84rem; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { border-color: var(--color-accent); color: var(--color-text-primary); }

.toast-success { position: fixed; bottom: 2rem; right: 2rem; background: #065f46; color: #fff; padding: 0.85rem 1.4rem; border-radius: 10px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,0.25); z-index: 2000; }

.slide-enter-active, .slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.slide-enter-from { opacity: 0; transform: translateY(8px); }
.slide-leave-to { opacity: 0; transform: translateY(-8px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>