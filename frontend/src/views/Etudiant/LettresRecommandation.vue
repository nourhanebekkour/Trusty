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
        <button v-if="activeView === 'demandes'" class="btn-new" @click="showModal = true">
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
              <span class="prof-name">{{ lettre.professeur }}</span>
            </div>
            <span class="status-badge" :class="statusClass(lettre.statut)">
              {{ statusLabel(lettre.statut) }}
            </span>
          </div>
          <p class="card-motif">{{ lettre.motif }}</p>
          <div class="card-bottom">
            <span class="card-date">{{ formatDate(lettre.date_demande) }}</span>
            <span class="card-visibilite">{{ formatVisibilite(lettre.visibilite) }}</span>
          </div>
          <div class="card-actions" v-if="lettre.statut === 'EN_ATTENTE'">
            <button class="btn-delete" @click="supprimerDemande(lettre.id)">Annuler la demande</button>
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
              <span class="prof-name">{{ lettre.professeur }}</span>
            </div>
            <span class="status-badge status-valid">Validée</span>
          </div>
          <p class="card-motif">{{ lettre.motif }}</p>
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
              <span class="timeline-prof">{{ lettre.professeur }}</span>
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
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h2>Nouvelle demande de lettre</h2>
            <button class="modal-close" @click="showModal = false">✕</button>
          </div>
          <div class="modal-body">
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
                <input v-model="form.professeur" class="form-input" placeholder="ex: Prof. Ahmed Alami" />
              </div>
              <div class="form-group form-group--full">
                <label>Motif / Description *</label>
                <textarea v-model="form.motif" class="form-input form-textarea" placeholder="Décrivez l'objectif de votre demande..." rows="4"></textarea>
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
            <button class="btn-cancel" @click="showModal = false">Annuler</button>
            <button class="btn-new" @click="submitDemande">Envoyer la demande</button>
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

function submitDemande() {
  if (!form.value.type || !form.value.professeur || !form.value.motif) {
    alert('Merci de remplir tous les champs obligatoires.')
    return
  }
  lettres.value.unshift({
    id: Date.now(),
    type: form.value.type,
    professeur: form.value.professeur,
    motif: form.value.motif,
    visibilite: form.value.visibilite,
    statut: 'EN_ATTENTE',
    date_demande: new Date().toISOString().split('T')[0]
  })
  form.value = { type: '', professeur: '', motif: '', visibilite: 'PRIVEE' }
  showModal.value = false
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
.lettres-page { padding: 2rem; color: #D6EDE8; min-height: 100vh; background: #0D2B2B; font-family: 'Inter', sans-serif; }

.header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap; }
.header-left h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.3rem; color: #D6EDE8; }
.header-left p { font-size: 0.875rem; color: rgba(214,237,232,0.55); margin: 0; }
.header-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.view-switcher { display: flex; background: #1A3838; border: 1px solid rgba(214,237,232,0.08); border-radius: 10px; padding: 0.25rem; gap: 0.2rem; }
.view-btn { display: flex; align-items: center; gap: 0.4rem; background: transparent; border: none; color: rgba(214,237,232,0.5); padding: 0.45rem 0.85rem; border-radius: 7px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.18s; white-space: nowrap; }
.view-btn:hover { color: #D6EDE8; }
.view-active { background: #0D2B2B; color: #D6EDE8 !important; font-weight: 600; }

.btn-new { display: inline-flex; align-items: center; gap: 0.4rem; background: #5C8C6A; color: #0D2B2B; border: none; padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-new:hover { background: #6fa37d; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
.stat-card { background: #1A3838; border: 1px solid rgba(214,237,232,0.08); border-radius: 12px; padding: 1.2rem 1.4rem; }
.stat-label { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; color: rgba(214,237,232,0.4); margin-bottom: 0.4rem; }
.stat-value { font-size: 1.8rem; font-weight: 700; color: #D6EDE8; line-height: 1; }

.tabs-row { display: flex; gap: 0.4rem; margin-bottom: 1.5rem; background: #1A3838; border: 1px solid rgba(214,237,232,0.08); border-radius: 10px; padding: 0.3rem; width: fit-content; }
.tab-btn { display: flex; align-items: center; gap: 0.5rem; background: transparent; border: none; color: rgba(214,237,232,0.5); padding: 0.45rem 0.9rem; border-radius: 7px; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.18s; }
.tab-btn:hover { color: #D6EDE8; }
.tab-active { background: #0D2B2B; color: #D6EDE8 !important; font-weight: 600; }
.tab-count { background: rgba(214,237,232,0.1); color: rgba(214,237,232,0.5); font-size: 0.7rem; font-weight: 600; padding: 0.1rem 0.45rem; border-radius: 20px; }
.tab-active .tab-count { background: rgba(92,140,106,0.2); color: #5C8C6A; }

.cards-list { display: flex; flex-direction: column; gap: 0.9rem; }
.lettre-card { background: #1A3838; border: 1px solid rgba(214,237,232,0.08); border-radius: 14px; padding: 1.3rem 1.4rem; display: flex; flex-direction: column; gap: 0.75rem; transition: border-color 0.2s; }
.lettre-card:hover { border-color: rgba(92,140,106,0.3); }
.lettre-card--recue { border-left: 3px solid #5C8C6A; }

.card-top { display: flex; align-items: center; justify-content: space-between; }
.card-left { display: flex; align-items: center; gap: 0.75rem; }
.type-badge { background: rgba(92,140,106,0.15); color: #5C8C6A; border: 1px solid rgba(92,140,106,0.3); font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 20px; }
.prof-name { font-size: 0.9rem; font-weight: 600; color: #D6EDE8; }
.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.22rem 0.65rem; border-radius: 20px; }
.status-pending  { background: rgba(140,122,58,0.15); color: #c4aa5a; border: 1px solid rgba(140,122,58,0.3); }
.status-valid    { background: rgba(92,140,106,0.15); color: #7fb88a; border: 1px solid rgba(92,140,106,0.3); }
.status-rejected { background: rgba(140,64,64,0.15);  color: #e07070; border: 1px solid rgba(140,64,64,0.3); }
.card-motif { font-size: 0.875rem; color: rgba(214,237,232,0.6); margin: 0; line-height: 1.6; }
.card-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid rgba(214,237,232,0.06); }
.card-date { font-size: 0.78rem; color: rgba(214,237,232,0.35); }
.card-visibilite { font-size: 0.72rem; font-weight: 500; color: rgba(214,237,232,0.4); background: rgba(214,237,232,0.06); padding: 0.15rem 0.5rem; border-radius: 6px; }
.card-actions { display: flex; justify-content: flex-end; gap: 0.5rem; padding-top: 0.5rem; }
.btn-delete { background: transparent; border: 1px solid rgba(224,112,112,0.3); color: #e07070; padding: 0.35rem 0.85rem; border-radius: 7px; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.18s; }
.btn-delete:hover { background: rgba(140,64,64,0.15); }
.btn-download { background: rgba(92,140,106,0.15); border: 1px solid rgba(92,140,106,0.3); color: #7fb88a; padding: 0.35rem 0.85rem; border-radius: 7px; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.18s; }
.btn-download:hover { background: rgba(92,140,106,0.25); }

.empty-card { background: #1A3838; border: 1px dashed rgba(214,237,232,0.13); border-radius: 14px; padding: 3rem 2rem; text-align: center; }
.empty-title { font-size: 1rem; font-weight: 600; color: #D6EDE8; margin: 0 0 0.5rem; }
.empty-sub { font-size: 0.84rem; color: rgba(214,237,232,0.5); margin: 0; }

.stats-view { display: flex; flex-direction: column; gap: 1.5rem; }
.stat-big-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-big-card { background: #1A3838; border: 1px solid rgba(214,237,232,0.08); border-radius: 14px; padding: 1.5rem; }
.stat-big-label { font-size: 0.75rem; font-weight: 600; color: rgba(214,237,232,0.4); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.75rem; }
.stat-big-value { font-size: 2rem; font-weight: 700; color: #D6EDE8; margin-bottom: 0.75rem; }
.stat-big-bar { background: rgba(214,237,232,0.08); border-radius: 99px; height: 6px; overflow: hidden; }
.stat-big-fill { background: #5C8C6A; height: 100%; border-radius: 99px; transition: width 0.6s ease; }

.chart-section { background: #1A3838; border: 1px solid rgba(214,237,232,0.08); border-radius: 14px; padding: 1.5rem; }
.chart-title { font-size: 0.9rem; font-weight: 600; color: #D6EDE8; margin-bottom: 1.25rem; }
.bar-chart { display: flex; flex-direction: column; gap: 0.9rem; }
.bar-item { display: flex; align-items: center; gap: 1rem; }
.bar-label { font-size: 0.82rem; color: rgba(214,237,232,0.6); width: 160px; flex-shrink: 0; }
.bar-track { flex: 1; background: rgba(214,237,232,0.06); border-radius: 99px; height: 8px; overflow: hidden; }
.bar-fill { background: #5C8C6A; height: 100%; border-radius: 99px; transition: width 0.6s ease; }
.bar-count { font-size: 0.82rem; font-weight: 600; color: #5C8C6A; width: 20px; text-align: right; }

.timeline { display: flex; flex-direction: column; gap: 0.75rem; }
.timeline-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: rgba(13,43,43,0.5); border-radius: 10px; }
.timeline-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.timeline-dot.status-pending  { background: #c4aa5a; }
.timeline-dot.status-valid    { background: #7fb88a; }
.timeline-dot.status-rejected { background: #e07070; }
.timeline-content { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
.timeline-type { font-size: 0.84rem; font-weight: 600; color: #D6EDE8; }
.timeline-prof { font-size: 0.75rem; color: rgba(214,237,232,0.5); }
.timeline-date { font-size: 0.75rem; color: rgba(214,237,232,0.35); white-space: nowrap; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: #1A3838; border: 1px solid rgba(214,237,232,0.13); border-radius: 16px; width: 100%; max-width: 520px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 1.75rem 0; }
.modal-header h2 { font-size: 1.1rem; font-weight: 700; color: #D6EDE8; margin: 0; }
.modal-close { background: transparent; border: 1px solid rgba(214,237,232,0.15); color: rgba(214,237,232,0.5); width: 30px; height: 30px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
.modal-close:hover { background: rgba(214,237,232,0.08); color: #D6EDE8; }
.modal-body { padding: 1.5rem 1.75rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group--full { grid-column: 1 / -1; }
.form-group label { font-size: 0.75rem; font-weight: 600; color: rgba(214,237,232,0.5); text-transform: uppercase; letter-spacing: 0.05em; }
.form-input { background: rgba(13,43,43,0.7); border: 1px solid rgba(214,237,232,0.13); border-radius: 9px; padding: 0.6rem 0.85rem; color: #D6EDE8; font-size: 0.875rem; outline: none; transition: border-color 0.18s; width: 100%; font-family: 'Inter', sans-serif; }
.form-input:focus { border-color: #5C8C6A; }
.form-input option { background: #1A3838; }
.form-textarea { resize: vertical; min-height: 100px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.65rem; padding: 0 1.75rem 1.5rem; }
.btn-cancel { background: transparent; border: 1px solid rgba(214,237,232,0.15); color: rgba(214,237,232,0.6); padding: 0.55rem 1.1rem; border-radius: 8px; font-size: 0.84rem; font-weight: 500; cursor: pointer; }
.btn-cancel:hover { border-color: #5C8C6A; color: #D6EDE8; }

.slide-enter-active, .slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.slide-enter-from { opacity: 0; transform: translateY(8px); }
.slide-leave-to { opacity: 0; transform: translateY(-8px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>