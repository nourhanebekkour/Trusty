<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Portfolios étudiants
        </h1>
        <p>Parcourez les portfolios des étudiants et consultez-les.</p>
      </div>
    </div>

    <div class="prof-info-card" style="margin-bottom: 16px;">
      <div class="url-search-row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="portfolioSlug" class="form-input" placeholder="Ou entrez l'URL du portfolio (ex: john-doe-portfolio)" @keyup.enter="viewPortfolio" />
        <button class="btn-primary" @click="viewPortfolio">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Consulter
        </button>
      </div>
    </div>

    <div class="prof-stats-row">
      <div class="prof-stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        <div><div class="stat-label">ÉTUDIANTS</div><div class="stat-value">{{ students.length }}</div></div>
      </div>
      <div class="prof-stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div><div class="stat-label">STAGES</div><div class="stat-value">{{ totalStages }}</div></div>
      </div>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement des étudiants...</span>
    </div>

    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadStudents">Réessayer</button>
    </div>

    <div v-else-if="students.length === 0" class="prof-empty-card">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="empty-icon">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <p class="empty-title">Aucun étudiant trouvé</p>
      <p class="empty-sub">Aucun stage ou projet n'est encore enregistré dans la plateforme.</p>
    </div>

    <template v-else>
      <div class="search-bar-inline">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" class="filter-input" placeholder="Filtrer par nom, entreprise ou filière..." />
      </div>

      <div class="student-grid">
        <div v-for="s in filteredStudents" :key="s.id" class="student-card">
          <div class="student-avatar">{{ initials(s.name) }}</div>
          <div class="student-body">
            <div class="student-name">{{ s.name }}</div>
            <div class="student-meta">{{ s.filiere || 'Filière non renseignée' }}</div>
            <div class="student-sub" v-if="s.entreprise">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              {{ s.entreprise }}
            </div>
          </div>
          <div class="student-actions">
            <button class="btn-primary btn--sm" @click="openPortfolio(s)" :disabled="!s.portfolioUrl">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              {{ s.portfolioUrl ? 'Portfolio' : 'Non publié' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getProfessionalInternships } from '@/services/professionalApi'

const router = useRouter()

const stages = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const portfolioSlug = ref('')
const toast = ref({ show: false, message: '' })

function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function initials(name) {
  return String(name || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function openPortfolio(s) {
  if (s.portfolioUrl) {
    router.push(`/portfolio/${s.portfolioUrl}`)
  } else {
    showToast('Portfolio non disponible')
  }
}

function viewPortfolio() {
  const slug = portfolioSlug.value.trim()
  if (!slug) {
    showToast('Veuillez entrer une URL de portfolio')
    return
  }
  if (slug.startsWith('http://') || slug.startsWith('https://')) {
    window.open(slug, '_blank')
  } else {
    router.push(`/portfolio/${slug}`)
  }
  portfolioSlug.value = ''
}

const students = computed(() => {
  const map = new Map()
  for (const stage of stages.value) {
    const e = stage.etudiant
    if (!e) continue
    if (map.has(e.id_etudiant)) continue
    const u = e.utilisateur || {}
    map.set(e.id_etudiant, {
      id: e.id_etudiant,
      prenom: u.prenom || '',
      nom: u.nom || '',
      name: `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Étudiant',
      filiere: e.filiere || '',
      entreprise: stage.entreprise || stage.nom_entreprise || '',
      portfolioUrl: e.portfolio?.url_publique ?? null,
    })
  }
  return [...map.values()]
})

const totalStages = computed(() => stages.value.length)

const filteredStudents = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return students.value
  return students.value.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.filiere.toLowerCase().includes(q) ||
    s.entreprise.toLowerCase().includes(q)
  )
})

async function loadStudents() {
  loading.value = true
  error.value = null
  try {
    const data = await getProfessionalInternships()
    stages.value = Array.isArray(data) ? data : []
  } catch {
    error.value = 'Impossible de charger la liste des étudiants.'
  } finally {
    loading.value = false
  }
}

onMounted(loadStudents)
</script>

<style scoped>
.url-search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.url-search-row .search-icon {
  flex-shrink: 0;
  color: var(--color-text-tertiary, #9CA3AF);
}
.url-search-row .form-input {
  flex: 1;
  height: 38px;
  border-radius: 8px;
  border: 1px solid var(--color-border, #D6D0C4);
  padding: 0 12px;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  background: var(--color-surface, #FFFFFF);
  color: var(--color-text-primary, #0F1B2D);
  outline: none;
}
.url-search-row .form-input::placeholder {
  color: var(--color-text-tertiary, #9CA3AF);
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
.student-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface, #FFFFFF);
  border: 1px solid var(--color-border, #D6D0C4);
  border-radius: 10px;
  padding: 14px 16px;
  transition: box-shadow 0.2s;
}
.student-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
}
.student-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--color-accent-light, #E8F2EF);
  color: var(--color-accent, #3D6B5E);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.student-body {
  flex: 1;
  min-width: 0;
}
.student-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary, #0F1B2D);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.student-meta {
  font-size: 11px;
  color: var(--color-text-secondary, #6B7280);
  margin-top: 1px;
}
.student-sub {
  font-size: 11px;
  color: var(--color-accent, #3D6B5E);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.student-actions {
  flex-shrink: 0;
}
.btn--sm {
  height: 32px;
  padding: 0 12px;
  font-size: 11px;
  border-radius: 8px;
  white-space: nowrap;
}
</style>
