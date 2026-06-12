<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Historique des certifications</h1>
        <p class="page__subtitle">Toutes les actions de certification et d'audit sur la plateforme.</p>
      </div>
      <div class="page__actions">
        <button class="btn btn--secondary" @click="load"><AppIcon name="refresh" /> Rafraîchir</button>
      </div>
    </div>

    <div v-if="admin.loading" class="state-msg">Chargement…</div>

    <div class="card">
      <div class="card__header">
        <h2 class="card__title">Audit complet</h2>
        <p class="card__subtitle">Historique chronologique de toutes les actions administratives.</p>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Action</th>
            <th>Utilisateur</th>
            <th>Détail</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in safeHistory" :key="c.id_historique || c.id">
            <td class="text-muted">{{ formatDate(c.date_action || c.date_creation) }}</td>
            <td><span class="badge">{{ sanitizeText(c.action || c.type_action || '—') }}</span></td>
            <td>{{ sanitizeText(c.utilisateur?.prenom || c.prenom || '') }} {{ sanitizeText(c.utilisateur?.nom || c.nom || '') }}</td>
            <td class="text-muted">{{ sanitizeText(c.description || c.detail || '—') }}</td>
          </tr>
          <tr v-if="!admin.loading && safeHistory.length === 0">
            <td colspan="4" class="state-msg">Aucun historique disponible</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'
import { useAuthStore } from '../../stores/authstore'

const admin = useAdminStore()
const authStore = useAuthStore()
const router = useRouter()

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

const safeHistory = computed(() =>
  Array.isArray(admin.certHistory)
    ? admin.certHistory.filter(c => c && (c.id_historique != null || c.id != null))
    : []
)

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function load() {
  if (admin.loading) return
  await admin.fetchCertHistory()
}

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'ADMINISTRATEUR') {
    router.replace('/login')
    return
  }
  await load()
})
</script>

<style scoped>
.page           { padding: 32px; }
.page__header   { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page__title    { font-size: 24px; font-weight: 700; color: var(--color-text-primary); }
.page__subtitle { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.page__actions  { display: flex; gap: 12px; }

.card { background: var(--color-surface); border: 1px solid var(--color-border-light); border-radius: 12px; padding: 20px; }
.card__header   { margin-bottom: 16px; }
.card__title    { font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.card__subtitle { font-size: 13px; color: var(--color-text-secondary); margin-top: 2px; }

.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th {
  text-align: left; padding: 10px;
  font-size: 12px; font-weight: 600; color: var(--color-text-tertiary);
  text-transform: uppercase; border-bottom: 2px solid var(--color-border-light);
}
.table td { padding: 12px 10px; border-bottom: 1px solid var(--color-border-light); color: var(--color-text-primary); }
.table tr:hover td { background: var(--color-surface-hover); }

.badge {
  display: inline-block; padding: 2px 10px; border-radius: 999px;
  font-size: 12px; font-weight: 600;
  background: var(--color-accent-light); color: var(--color-accent);
}
.text-muted { color: var(--color-text-tertiary); }
.state-msg { text-align: center; padding: 24px; color: var(--color-text-tertiary); font-size: 13px; }

.btn { padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
.btn--secondary       { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.btn--secondary:hover { background: var(--color-surface-hover); }
.btn--secondary:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
