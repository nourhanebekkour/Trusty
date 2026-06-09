<template>
  <div class="prof-page">

    <div class="prof-page-head">
      <div>
        <h1>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right: 8px; vertical-align: middle;">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
        </h1>
        <p>Gérez vos alertes et notifications.</p>
      </div>
      <button v-if="unreadCount > 0" class="btn-primary" @click="markAllAsRead" :disabled="markingAll">
        <span v-if="markingAll" class="spinner-sm"></span>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Tout marquer comme lu
      </button>
    </div>

    <div class="prof-stats-row">
      <div class="prof-stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div><div class="stat-label">TOTAL</div><div class="stat-value">{{ notifications.length }}</div></div>
      </div>
      <div class="prof-stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div><div class="stat-label">NON LUES</div><div class="stat-value">{{ unreadCount }}</div></div>
      </div>
      <div class="prof-stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
        <div><div class="stat-label">LUES</div><div class="stat-value">{{ readCount }}</div></div>
      </div>
      <div class="prof-stat-card">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div><div class="stat-label">AUJOURD'HUI</div><div class="stat-value">{{ todayCount }}</div></div>
      </div>
    </div>

    <div class="prof-tabs-row">
      <button v-for="tab in tabs" :key="tab.key" class="prof-tab-btn" :class="{ 'prof-tab-active': activeTab === tab.key }" @click="activeTab = tab.key">
        {{ tab.label }}
        <span class="prof-tab-count">{{ tabCount(tab.key) }}</span>
      </button>
    </div>

    <div v-if="loading" class="prof-state-box">
      <div class="spinner"></div>
      <span>Chargement des notifications...</span>
    </div>

    <div v-else-if="error" class="prof-state-box prof-state-error">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ error }}</span>
      <button class="btn-ghost" @click="loadNotifications">Réessayer</button>
    </div>

    <div v-else-if="filtered.length === 0" class="prof-empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <p class="empty-title">Aucune notification{{ activeTab === 'unread' ? ' non lue' : '' }}</p>
      <p class="empty-sub">{{ activeTab === 'unread' ? 'Vous avez tout lu !' : 'Vous n\'avez pas encore reçu de notifications.' }}</p>
    </div>

    <div v-else class="prof-notif-list">
      <div v-for="(n, i) in filtered" :key="n.id" class="prof-notif-card" :class="{ 'prof-notif-unread': !n.isRead }" :style="{ animationDelay: i * 45 + 'ms' }">
        <div class="unread-dot" v-if="!n.isRead"></div>
        <div class="prof-notif-icon" :class="iconClass(n.type)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="iconPath(n.type)"></svg>
        </div>
        <div class="prof-notif-content">
          <div class="prof-notif-header">
            <span class="prof-notif-title">{{ n.title }}</span>
            <div class="prof-notif-meta">
              <span class="prof-notif-type-badge" :class="badgeClass(n.type)">{{ typeLabel(n.type) }}</span>
              <span class="prof-notif-date">{{ formatDate(n.createdAt) }}</span>
            </div>
          </div>
          <p class="prof-notif-message">{{ n.message }}</p>
          <div class="prof-notif-footer">
            <span class="prof-notif-read-status">
              <template v-if="n.isRead">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Lu
              </template>
              <template v-else>
                <span class="pulse-dot"></span> Non lu
              </template>
            </span>
            <div class="prof-notif-footer-actions">
              <button v-if="!n.isRead" class="btn-mark-read" @click.stop="markOneAsRead(n)" :disabled="markingId === n.id">
                <span v-if="markingId === n.id" class="spinner-xs"></span>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Marquer comme lu
              </button>
              <button class="btn-hide" @click.stop="hideOne(n)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                Masquer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getProfessionalNotifications, markProfessionalNotificationAsRead, markAllProfessionalNotificationsAsRead } from '@/services/professionalApi'

const notifications = ref([])
const loading = ref(false)
const error = ref(null)
const activeTab = ref('all')
const markingId = ref(null)
const markingAll = ref(false)
const toast = ref({ show: false, message: '' })

const tabs = computed(() => {
  const all = notifications.value
  const types = [...new Set(all.map(n => n.type).filter(Boolean))]
  return [
    { key: 'all', label: 'Toutes' },
    { key: 'unread', label: 'Non lues' },
    ...types.map(t => ({ key: t, label: typeLabel(t) })),
  ]
})

const filtered = computed(() => {
  const all = notifications.value
  if (activeTab.value === 'all') return all
  if (activeTab.value === 'unread') return all.filter(n => !n.isRead)
  return all.filter(n => n.type === activeTab.value)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)
const readCount = computed(() => notifications.value.filter(n => n.isRead).length)
const todayCount = computed(() => {
  const today = new Date().toDateString()
  return notifications.value.filter(n => new Date(n.createdAt).toDateString() === today).length
})

function tabCount(key) {
  if (key === 'all') return notifications.value.length
  if (key === 'unread') return unreadCount.value
  return notifications.value.filter(n => n.type === key).length
}

function typeLabel(type) {
  const map = { VALIDATION: 'Validation', RECOMMANDATION: 'Recommandation', COMMENTAIRE: 'Commentaire', PROJET: 'Projet', STAGE: 'Stage', SYSTEME: 'Système', MESSAGE: 'Message', RAPPORT: 'Rapport', COMPTE: 'Compte', SUGGESTION: 'Suggestion' }
  return map[type] || type || 'Général'
}

function iconClass(type) {
  const t = (type || '').toUpperCase()
  if (t === 'VALIDATION') return 'icon-validation'
  if (t === 'RECOMMANDATION') return 'icon-recommandation'
  if (t === 'COMMENTAIRE') return 'icon-commentaire'
  if (t === 'PROJET') return 'icon-projet'
  if (t === 'STAGE') return 'icon-stage'
  if (t === 'SYSTEME') return 'icon-systeme'
  return 'icon-default'
}
function badgeClass(type) {
  const t = (type || '').toUpperCase()
  if (t === 'VALIDATION') return 'badge-validation'
  if (t === 'RECOMMANDATION') return 'badge-recommandation'
  if (t === 'COMMENTAIRE') return 'badge-commentaire'
  if (t === 'PROJET') return 'badge-projet'
  if (t === 'STAGE') return 'badge-stage'
  return 'badge-default'
}
function iconPath(type) {
  const t = (type || '').toUpperCase()
  if (t === 'VALIDATION') return '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
  if (t === 'RECOMMANDATION') return '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  if (t === 'COMMENTAIRE') return '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
  if (t === 'PROJET') return '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'
  if (t === 'STAGE') return '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
  return '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
}
function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  const now = new Date()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'À l\'instant'
  if (mins < 60) return `Il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
function showToast(m) {
  toast.value = { show: true, message: m }
  setTimeout(() => { toast.value.show = false }, 3000)
}

async function loadNotifications() {
  loading.value = true
  error.value = null
  try {
    const data = await getProfessionalNotifications()
    notifications.value = (data.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    error.value = 'Impossible de charger les notifications.'
  } finally {
    loading.value = false
  }
}

async function markOneAsRead(n) {
  markingId.value = n.id
  try {
    await markProfessionalNotificationAsRead(n.id)
    n.isRead = true
  } catch { showToast('Erreur') }
  finally { markingId.value = null }
}

async function markAllAsRead() {
  markingAll.value = true
  try {
    await markAllProfessionalNotificationsAsRead()
    notifications.value.forEach(n => { n.isRead = true })
    showToast('Toutes les notifications marquées comme lues.')
  } catch { showToast('Erreur') }
  finally { markingAll.value = false }
}

async function hideOne(n) {
  try {
    await markProfessionalNotificationAsRead(n.id)
    notifications.value = notifications.value.filter(x => x.id !== n.id)
  } catch { showToast('Erreur') }
}

onMounted(loadNotifications)
</script>
