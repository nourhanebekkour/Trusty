<template>
  <div class="notifications-page">

    <!-- ── Page Header ── -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="title-icon">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
        </h1>
        <p class="page-subtitle">Suivez toutes vos alertes et mises à jour.</p>
      </div>
      <button
        v-if="unreadCount > 0"
        class="btn-primary"
        @click="markAllAsRead"
        :disabled="markingAll"
      >
        <span v-if="markingAll" class="spinner-sm"></span>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Tout marquer comme lu
      </button>
    </div>

    <!-- ── Stats Row ── -->
    <div class="stats-row">
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div>
          <div class="stat-label">TOTAL</div>
          <div class="stat-value">{{ notifications.length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <div class="stat-label">NON LUES</div>
          <div class="stat-value">{{ unreadCount }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div class="stat-label">LUES</div>
          <div class="stat-value">{{ notifications.filter(n => n.est_lue).length }}</div>
        </div>
      </div>
      <div class="stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div>
          <div class="stat-label">AUJOURD'HUI</div>
          <div class="stat-value">{{ todayCount }}</div>
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
      <span>Chargement des notifications...</span>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="state-box state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="fetchNotifications">Réessayer</button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="filteredNotifications.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <p class="empty-title">Aucune notification{{ activeTab === 'unread' ? ' non lue' : '' }}</p>
      <p class="empty-sub">{{ activeTab === 'unread' ? 'Vous avez tout lu !' : 'Vous n\'avez pas encore reçu de notifications.' }}</p>
    </div>

    <!-- ── Notifications List ── -->
    <div v-else class="notif-list">
      <div
        v-for="(notif, i) in filteredNotifications"
        :key="notif.id_notification"
        class="notif-card"
        :class="{ 'notif-unread': !notif.est_lue }"
        :style="{ animationDelay: i * 45 + 'ms' }"
        @click="handleClick(notif)"
      >
        <!-- Unread dot -->
        <div class="unread-dot" v-if="!notif.est_lue"></div>

        <!-- Icon -->
        <div class="notif-icon" :class="iconClass(notif.type_notification)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="iconPath(notif.type_notification)"></svg>
        </div>

        <!-- Content -->
        <div class="notif-content">
          <div class="notif-header">
            <span class="notif-title">{{ notif.titre }}</span>
            <div class="notif-meta">
              <span class="notif-type-badge" :class="typeBadgeClass(notif.type_notification)">
                {{ typeLabel(notif.type_notification) }}
              </span>
              <span class="notif-date">{{ formatDate(notif.date_creation) }}</span>
            </div>
          </div>
          <p class="notif-message">{{ notif.message }}</p>
          <div class="notif-footer">
            <span class="notif-read-status">
              <template v-if="notif.est_lue">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Lu {{ notif.date_lecture ? formatDate(notif.date_lecture) : '' }}
              </template>
              <template v-else>
                <span class="pulse-dot"></span>
                Non lu
              </template>
            </span>
            <button
              v-if="!notif.est_lue"
              class="btn-mark-read"
              @click.stop="markAsRead(notif)"
              :disabled="markingId === notif.id_notification"
            >
              <span v-if="markingId === notif.id_notification" class="spinner-xs"></span>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Marquer comme lu
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authstore.js'
import { useRouter } from 'vue-router'
import {
  getStudentNotifications,
  markAllStudentNotificationsAsRead,
  markStudentNotificationAsRead,
  resolveStudentNotificationTarget,
} from '@/services/studentNotificationService'

const authStore = useAuthStore()
const router    = useRouter()

// ── State ──────────────────────────────────────────────────────────────────
const notifications = ref([])
const loading       = ref(false)
const error         = ref(null)
const activeTab     = ref('all')
const markingId     = ref(null)
const markingAll    = ref(false)
const openingId     = ref(null)

// ── Tabs ───────────────────────────────────────────────────────────────────
const tabs = [
  { key: 'all',    label: 'Toutes' },
  { key: 'unread', label: 'Non lues' },
  { key: 'VALIDATION',   label: 'Validations' },
  { key: 'RECOMMANDATION', label: 'Recommandations' },
  { key: 'COMMENTAIRE',  label: 'Commentaires' },
]

// ── Computed ───────────────────────────────────────────────────────────────
const filteredNotifications = computed(() => {
  const all = notifications.value
  if (activeTab.value === 'all')    return all
  if (activeTab.value === 'unread') return all.filter(n => !n.est_lue)
  return all.filter(n => n.type_notification === activeTab.value)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.est_lue).length)

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return notifications.value.filter(n => new Date(n.date_creation).toDateString() === today).length
})

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  const now  = new Date()
  const diff = now - date
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'À l\'instant'
  if (mins < 60)  return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days === 1) return 'Hier'
  if (days < 7)   return `Il y a ${days} jours`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function typeLabel(type) {
  return {
    VALIDATION:     'Validation',
    COMMENTAIRE:    'Commentaire',
    RECOMMANDATION: 'Recommandation',
    ATTESTATION:    'Attestation',
    SUGGESTION:     'Suggestion',
  }[type] || type
}

function typeBadgeClass(type) {
  return {
    VALIDATION:     'badge-valid',
    COMMENTAIRE:    'badge-comment',
    RECOMMANDATION: 'badge-reco',
    ATTESTATION:    'badge-attest',
    SUGGESTION:     'badge-suggest',
  }[type] || ''
}

function iconClass(type) {
  return {
    VALIDATION:     'icon-valid',
    COMMENTAIRE:    'icon-comment',
    RECOMMANDATION: 'icon-reco',
    ATTESTATION:    'icon-attest',
    SUGGESTION:     'icon-suggest',
  }[type] || 'icon-default'
}

function iconPath(type) {
  const paths = {
    VALIDATION:     '<polyline points="20 6 9 17 4 12"/>',
    COMMENTAIRE:    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    RECOMMANDATION: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    ATTESTATION:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    SUGGESTION:     '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  }
  return paths[type] || '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>'
}

function tabCount(key) {
  if (key === 'all')    return notifications.value.length
  if (key === 'unread') return unreadCount.value
  return notifications.value.filter(n => n.type_notification === key).length
}

// ── API ────────────────────────────────────────────────────────────────────

// GET /api/notifications/
async function fetchNotifications() {
  if (!authStore.user) await authStore.fetchUser()
  loading.value = true; error.value = null
  try {
    const data = await getStudentNotifications()
    // Trier : non lues en premier, puis par date décroissante
    notifications.value = data
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur de chargement.'
  } finally { loading.value = false }
}

// PUT /api/notifications/{id}/lire
async function markAsRead(notif) {
  if (notif.est_lue) return
  markingId.value = notif.id_notification
  try {
    await markStudentNotificationAsRead(notif.id_notification)
    // Mise à jour locale immédiate sans re-fetch
    const idx = notifications.value.findIndex(n => n.id_notification === notif.id_notification)
    if (idx !== -1) {
      notifications.value[idx] = {
        ...notifications.value[idx],
        est_lue: true,
        date_lecture: new Date().toISOString()
      }
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la mise à jour.'
  } finally { markingId.value = null }
}

// Marquer toutes les non lues une par une
async function markAllAsRead() {
  markingAll.value = true
  try {
    await markAllStudentNotificationsAsRead(notifications.value)
    notifications.value = notifications.value.map(n => ({
      ...n,
      est_lue: true,
      date_lecture: n.date_lecture ?? new Date().toISOString()
    }))
  } catch (e) {
    error.value = e.response?.data?.message || 'Erreur lors de la mise à jour.'
  } finally { markingAll.value = false }
}

// Clic sur une carte : marque comme lu + suit le lien si présent
async function handleClick(notif) {
  if (openingId.value) return

  openingId.value = notif.id_notification
  error.value = null
  try {
    if (!notif.est_lue) await markAsRead(notif)
    const target = await resolveStudentNotificationTarget(notif)

    if (target) {
      await router.push(target)
    } else if (notif.type_notification === 'COMMENTAIRE') {
      error.value = 'Le portfolio associé à ce commentaire est introuvable.'
    }
  } catch (e) {
    error.value = e.response?.data?.message || 'Impossible d’ouvrir cette notification.'
  } finally {
    openingId.value = null
  }
}

onMounted(fetchNotifications)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; }

.notifications-page {
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
  flex-wrap: wrap;
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
.spinner-xs {
  display: inline-block; width: 10px; height: 10px;
  border: 1.5px solid var(--color-border-light); border-top-color: var(--color-accent);
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

/* ── Notif List ── */
.notif-list { display: flex; flex-direction: column; gap: 0.75rem; }

.notif-card {
  background: var(--color-surface); border: 1px solid var(--color-border-light);
  border-radius: 14px; padding: 1.2rem 1.4rem;
  display: flex; align-items: flex-start; gap: 1rem;
  opacity: 0; animation: fadeUp 0.35s ease forwards;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer; position: relative;
}
.notif-card:hover {
  border-color: var(--color-accent-border);
  box-shadow: var(--shadow-panel);
}
.notif-unread {
  border-color: var(--color-accent-border);
  background: var(--color-surface-alt);
}
.notif-unread::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: var(--color-accent);
  border-radius: 14px 0 0 14px;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Unread dot (top right) */
.unread-dot {
  position: absolute; top: 14px; right: 14px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

/* Icon */
.notif-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.icon-valid   { background: var(--color-valid-bg);  color: var(--color-valid-text); }
.icon-comment { background: rgba(92,122,140,0.15);  color: #7aafcf; }
.icon-reco    { background: var(--color-waiting-bg);  color: var(--color-waiting-text); }
.icon-attest  { background: var(--color-purple-bg);   color: var(--color-purple-text); }
.icon-suggest { background: rgba(140,92,58,0.15);   color: #d49a7a; }
.icon-default { background: var(--color-surface-hover); color: var(--color-text-secondary); }

/* Content */
.notif-content { flex: 1; min-width: 0; }

.notif-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 0.75rem;
  margin-bottom: 0.4rem; flex-wrap: wrap;
}
.notif-title {
  font-size: 0.9rem; font-weight: 600; color: var(--color-text-primary);
  line-height: 1.4;
}
.notif-meta {
  display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;
}

.notif-type-badge {
  font-size: 0.68rem; font-weight: 600; padding: 0.18rem 0.55rem;
  border-radius: 20px; letter-spacing: 0.04em; white-space: nowrap;
}
.badge-valid   { background: var(--color-valid-bg);  color: var(--color-valid-text);  border: 1px solid var(--color-valid-border); }
.badge-comment { background: rgba(92,122,140,0.15);  color: #7aafcf;  border: 1px solid rgba(92,122,140,0.3); }
.badge-reco    { background: var(--color-waiting-bg);  color: var(--color-waiting-text);  border: 1px solid var(--color-waiting-border); }
.badge-attest  { background: var(--color-purple-bg);   color: var(--color-purple-text);  border: 1px solid var(--color-purple-border); }
.badge-suggest { background: rgba(140,92,58,0.15);   color: #d49a7a;  border: 1px solid rgba(140,92,58,0.3); }

.notif-date { font-size: 0.72rem; color: var(--color-text-tertiary); }

.notif-message {
  font-size: 0.855rem; color: var(--color-text-secondary);
  line-height: 1.6; margin: 0 0 0.65rem;
}

/* Footer */
.notif-footer {
  display: flex; align-items: center;
  justify-content: space-between; gap: 0.75rem;
  padding-top: 0.6rem; border-top: 1px solid var(--color-border-light);
}
.notif-read-status {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.75rem; color: var(--color-text-tertiary);
}
.notif-read-status svg { color: var(--color-accent); }

.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--color-accent); display: inline-block;
  animation: blink 1.8s ease-in-out infinite;
}

.btn-mark-read {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: var(--color-accent-light); color: var(--color-accent);
  border: 1px solid var(--color-accent-border);
  padding: 0.28rem 0.7rem; border-radius: 6px;
  font-family: 'Inter', sans-serif; font-size: 0.75rem; font-weight: 600;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.btn-mark-read:hover { background: var(--color-valid-bg); }
.btn-mark-read:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .notifications-page { padding: 1.25rem 1rem 3rem; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .tabs-row { width: 100%; overflow-x: auto; }
}
@media (max-width: 480px) {
  .notif-card { flex-direction: column; }
  .notif-header { flex-direction: column; align-items: flex-start; }
  .notif-meta { align-items: flex-start; }
}
</style>