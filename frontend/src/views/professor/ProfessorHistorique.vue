<template>
  <div class="historique-page">

    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Historique des actions
        </h1>
        <p class="page-subtitle">Suivi de toutes vos actions sur la plateforme.</p>
      </div>
    </div>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <span>Chargement de l'historique...</span>
    </div>

    <div v-else-if="error" class="state-box state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadHistory">Réessayer</button>
    </div>

    <div v-else-if="actions.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <p class="empty-title">Aucune action</p>
      <p class="empty-sub">Votre historique est vide pour le moment.</p>
    </div>

    <div v-else class="timeline">
      <div
        v-for="(action, i) in actions"
        :key="action.id"
        class="timeline-item"
        :style="{ animationDelay: i * 40 + 'ms' }"
      >
        <div class="timeline-dot" :class="dotClass(action)"></div>
        <div class="timeline-card">
          <div class="timeline-header">
            <span class="timeline-type" :class="typeClass(action)">{{ typeLabel(action) }}</span>
            <span class="timeline-date">{{ formatDate(action.createdAt || action.date_creation) }}</span>
          </div>
          <p class="timeline-desc">{{ action.description || action.action || '—' }}</p>
          <div class="timeline-meta" v-if="action.entity || action.details">
            <span v-if="action.entity" class="meta-badge">{{ action.entity }}</span>
            <span v-if="action.details" class="meta-text">{{ action.details }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getProfessorActionHistory } from '@/services/professorApi'

const actions = ref([])
const loading = ref(false)
const error = ref(null)
const toast = ref({ show: false, message: '' })

function dotClass(action) {
  const t = action.type || action.action_type
  const map = {
    VALIDATION: 'dot-validation',
    RECOMMANDATION: 'dot-recommandation',
    COMMENTAIRE: 'dot-commentaire',
    REJET: 'dot-rejet',
    CREATION: 'dot-creation',
  }
  return map[t] || 'dot-default'
}

function typeClass(action) {
  const t = action.type || action.action_type
  const map = {
    VALIDATION: 'type-validation',
    RECOMMANDATION: 'type-recommandation',
    COMMENTAIRE: 'type-commentaire',
    REJET: 'type-rejet',
    CREATION: 'type-creation',
  }
  return map[t] || ''
}

function typeLabel(action) {
  const t = action.type || action.action_type
  const map = {
    VALIDATION: 'Validation',
    RECOMMANDATION: 'Recommandation',
    COMMENTAIRE: 'Commentaire',
    REJET: 'Rejet',
    CREATION: 'Création',
  }
  return map[t] || t || 'Action'
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days === 1) return 'Hier'
  if (days < 7) return `Il y a ${days} jours`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function loadHistory() {
  loading.value = true
  error.value = null
  try {
    const data = await getProfessorActionHistory()
    if (data && data.actions) {
      actions.value = Array.isArray(data.actions) ? data.actions : []
    } else if (Array.isArray(data)) {
      actions.value = data
    } else {
      actions.value = []
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger l\'historique.'
  } finally { loading.value = false }
}

onMounted(loadHistory)
</script>

<style scoped>
* { box-sizing: border-box; }

.historique-page {
  font-family: 'Inter', sans-serif;
  background: var(--color-page-bg);
  min-height: 100vh;
  padding: 2rem 2rem 4rem;
  color: var(--color-text-primary);
}

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

.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: transparent; border: 1px solid var(--color-border);
  color: var(--color-text-secondary); padding: 0.5rem 1rem; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 0.84rem; font-weight: 500;
  cursor: pointer; transition: all 0.18s;
}
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-text-primary); }

.state-box {
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 12px; padding: 2.5rem 1.5rem;
  color: var(--color-text-secondary); font-size: 0.875rem; flex-wrap: wrap;
}
.state-error { color: var(--color-danger); }

.spinner {
  width: 22px; height: 22px;
  border: 2px solid var(--color-border); border-top-color: var(--color-accent);
  border-radius: 50%; animation: spin 0.75s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-card {
  background: var(--color-surface); border: 1px dashed var(--color-border);
  border-radius: 14px; padding: 3rem 2rem; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}
.empty-icon { color: var(--color-accent); opacity: 0.5; margin-bottom: 0.25rem; }
.empty-title { font-size: 1rem; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.empty-sub { font-size: 0.84rem; color: var(--color-text-secondary); margin: 0; }

.timeline {
  position: relative;
  padding-left: 2.5rem;
}
.timeline::before {
  content: '';
  position: absolute; left: 11px; top: 6px; bottom: 6px;
  width: 2px; background: var(--color-border); border-radius: 2px;
}

.timeline-item {
  position: relative; margin-bottom: 1.1rem;
  opacity: 0; animation: fadeUp 0.35s ease forwards;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.timeline-dot {
  position: absolute; left: -2.5rem; top: 1rem;
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
}
.dot-validation { border-color: var(--color-valid-text); background: var(--color-valid-bg); }
.dot-recommandation { border-color: #8b5cf6; background: #f5f3ff; }
.dot-commentaire { border-color: var(--color-accent); background: var(--color-accent-light); }
.dot-rejet { border-color: var(--color-danger); background: #fef2f2; }
.dot-creation { border-color: #f59e0b; background: #fffbeb; }
.dot-default { border-color: var(--color-text-tertiary); }

.timeline-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px; padding: 0.9rem 1.2rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.timeline-card:hover {
  border-color: var(--color-accent-border);
  box-shadow: var(--shadow-panel);
}

.timeline-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem; margin-bottom: 0.35rem;
}
.timeline-type {
  font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.5rem;
  border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;
}
.type-validation { background: var(--color-valid-bg); color: var(--color-valid-text); border: 1px solid var(--color-valid-border); }
.type-recommandation { background: #f5f3ff; color: #8b5cf6; border: 1px solid #ede9fe; }
.type-commentaire { background: var(--color-accent-light); color: var(--color-accent); border: 1px solid var(--color-valid-border); }
.type-rejet { background: #fef2f2; color: var(--color-danger); border: 1px solid #fecaca; }
.type-creation { background: #fffbeb; color: #f59e0b; border: 1px solid #fef3c7; }

.timeline-date { font-size: 0.72rem; color: var(--color-text-tertiary); }
.timeline-desc {
  font-size: 0.85rem; color: var(--color-text-primary);
  line-height: 1.6; margin: 0 0 0.4rem;
}
.timeline-meta { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.meta-badge {
  font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.45rem;
  border-radius: 6px; background: var(--color-surface-alt);
  color: var(--color-text-secondary); border: 1px solid var(--color-border);
}
.meta-text { font-size: 0.78rem; color: var(--color-text-tertiary); }

.toast {
  position: fixed; bottom: 24px; right: 24px;
  background: var(--color-text-primary); color: var(--color-page-bg);
  padding: 0.75rem 1.2rem; border-radius: 10px;
  font-size: 0.84rem; font-weight: 500; z-index: 300;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  animation: fadeUp 0.25s ease;
}

@media (max-width: 768px) {
  .historique-page { padding: 1.25rem 1rem 3rem; }
  .timeline { padding-left: 2rem; }
  .timeline-dot { left: -2rem; }
}
</style>
