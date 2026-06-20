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
        <p class="page-subtitle">Consultez les alertes, les validations et les activités importantes de la plateforme.</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" :disabled="loading" @click="loadNotifications">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Actualiser
        </button>
        <button
          v-if="unreadCount > 0"
          class="btn-primary"
          @click="handleMarkAllAsRead"
          :disabled="loading || markingAll"
        >
          <span v-if="markingAll" class="spinner-sm"></span>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Tout marquer comme lu
        </button>
      </div>
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
          <div class="stat-value">{{ readCount }}</div>
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

    <!-- ── Search ── -->
    <div class="search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        v-model="search"
        class="search-input"
        type="text"
        placeholder="Rechercher une notification…"
        maxlength="100"
        autocomplete="off"
        spellcheck="false"
      />
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
      <span>{{ sanitizedError }}</span>
      <button class="btn-ghost" @click="loadNotifications">Réessayer</button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="filteredNotifications.length === 0" class="empty-card">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="empty-icon">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      <p class="empty-title">Aucune notification trouvée</p>
      <p class="empty-sub">Aucune donnée ne correspond aux filtres sélectionnés.</p>
    </div>

    <!-- ── Notifications List ── -->
    <div v-else class="notif-list">
      <div
        v-for="(notif, i) in filteredNotifications"
        :key="notif.id_notification"
        class="notif-card"
        :class="{ 'notif-unread': !notif.est_lue }"
        :style="{ animationDelay: i * 45 + 'ms' }"
        @click="openDetails(notif)"
      >
        <!-- Unread dot -->
        <div class="unread-dot" v-if="!notif.est_lue"></div>

        <!-- Icon -->
        <div class="notif-icon" :class="iconClass(notif.type_notification)">
          <span v-html="fullSvgIcon(notif.type_notification)"></span>
        </div>

        <!-- Content -->
        <div class="notif-content">
          <div class="notif-header">
            <span class="notif-title">{{ sanitizeText(notif.titre) || 'Notification' }}</span>
            <div class="notif-meta">
              <span class="notif-type-badge" :class="typeBadgeClass(notif.type_notification)">
                {{ formatType(notif.type_notification) }}
              </span>
              <span class="notif-date">{{ formatRelativeDate(notif.date_creation) }}</span>
            </div>
          </div>
          <p class="notif-message">{{ sanitizeText(notif.message) }}</p>
          <div class="notif-footer">
            <span class="notif-read-status">
              <template v-if="notif.est_lue">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Lu
              </template>
              <template v-else>
                <span class="pulse-dot"></span>
                Non lu
              </template>
            </span>
            <div class="notif-footer-actions">
              <button
                v-if="!notif.est_lue"
                class="btn-mark-read"
                @click.stop="handleMarkAsRead(notif)"
                :disabled="actionLoadingId === notif.id_notification"
              >
                <span v-if="actionLoadingId === notif.id_notification" class="spinner-xs"></span>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Marquer comme lu
              </button>
              <button
                class="btn-delete"
                @click.stop="confirmDelete(notif)"
                :disabled="actionLoadingId === notif.id_notification"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Details Panel ── -->
    <div v-if="selectedNotification" class="details-overlay" @click.self="selectedNotification = null">
      <div class="details-panel" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <div class="details-panel__header">
          <div>
            <h2 id="details-title" class="details-panel__title">{{ sanitizeText(selectedNotification.titre) || 'Détail de la notification' }}</h2>
            <p class="details-panel__subtitle">{{ formatDate(selectedNotification.date_creation) }}</p>
          </div>
          <button class="btn-ghost btn--sm" @click="selectedNotification = null">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Fermer
          </button>
        </div>

        <div class="details-panel__body">
          <div class="details-row">
            <span class="details-row__label">Type</span>
            <strong class="details-row__value">
              <span class="notif-type-badge" :class="typeBadgeClass(selectedNotification.type_notification)">
                {{ formatType(selectedNotification.type_notification) }}
              </span>
            </strong>
          </div>
          <div class="details-row">
            <span class="details-row__label">Statut</span>
            <strong class="details-row__value" :class="selectedNotification.est_lue ? 'text-read' : 'text-unread'">
              <span class="pulse-dot" v-if="!selectedNotification.est_lue"></span>
              {{ selectedNotification.est_lue ? 'Lue' : 'Non lue' }}
            </strong>
          </div>
          <div class="details-row">
            <span class="details-row__label">Date</span>
            <strong class="details-row__value">{{ formatDate(selectedNotification.date_creation) }}</strong>
          </div>

          <div class="details-message-box">
            <p class="details-message-label">Message</p>
            <p class="details-message">{{ sanitizeText(selectedNotification.message) }}</p>
          </div>
        </div>

        <div class="details-panel__footer">
          <button
            v-if="!selectedNotification.est_lue"
            class="btn-primary"
            @click="handleMarkAsRead(selectedNotification)"
            :disabled="actionLoadingId === selectedNotification.id_notification"
          >
            <span v-if="actionLoadingId === selectedNotification.id_notification" class="spinner-sm"></span>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Marquer comme lu
          </button>
          <button class="btn-delete" @click="confirmDelete(selectedNotification)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- ── Confirm Delete Modal ── -->
    <div v-if="notifToDelete" class="details-overlay" @click.self="notifToDelete = null">
      <div class="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="confirm-icon">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        <h3 id="confirm-title" class="confirm-title">Supprimer la notification ?</h3>
        <p class="confirm-message">Cette action est irréversible.</p>
        <div class="confirm-actions">
          <button class="btn-ghost" @click="notifToDelete = null">Annuler</button>
          <button class="btn-delete btn-delete--confirm" @click="executeDelete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/services/adminNotificationService'

const router = useRouter()
const authStore = useAuthStore()

const notifications = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const activeTab = ref('all')
const selectedNotification = ref(null)
const actionLoadingId = ref(null)
const markingAll = ref(false)
const notifToDelete = ref(null) 

// Guard de rôle admin ──
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await router.replace('/login')
    return
  }
  if (!authStore.isAdmin) {
    await router.replace('/')
    return
  }
  loadNotifications()
})

// Fermeture du panel avec Escape ──
function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (notifToDelete.value)        { notifToDelete.value = null; return }
    if (selectedNotification.value) { selectedNotification.value = null }
  }
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

// Sanitisation XSS ──
function sanitizeText(value) {
  if (!value || typeof value !== 'string') return ''
  if (value.length > 2000) return value.slice(0, 2000) + '…'
  const div = document.createElement('div')
  div.appendChild(document.createTextNode(value))
  return div.innerHTML
}

// Message d'erreur générique 
const ERRORS = {
  load:   'Impossible de charger les notifications.',
  read:   'Impossible de marquer cette notification comme lue.',
  delete: 'Impossible de supprimer cette notification.',
  default:'Une erreur inattendue est survenue.',
}

const sanitizedError = computed(() => {
  if (!error.value) return ''
  if (error.value.length > 120) return ERRORS.default
  return error.value
})

// Validation de l'ID notification
function isValidId(id) {
  if (id === null || id === undefined) return false
  const n = Number(id)
  return Number.isInteger(n) && n > 0
}

// ── Tabs ──
const tabs = computed(() => {
  const all = notifications.value
  const types = [...new Set(all.map(n => n.type_notification).filter(Boolean))]
  return [
    { key: 'all', label: 'Toutes' },
    { key: 'unread', label: 'Non lues' },
    ...types.map(t => ({ key: t, label: formatType(t) })),
  ]
})

// ── Computed ──
const unreadCount = computed(() => notifications.value.filter(n => !n.est_lue).length)
const readCount   = computed(() => notifications.value.filter(n => n.est_lue).length)

const todayCount = computed(() => {
  const today = new Date().toDateString()
  return notifications.value.filter(n => new Date(n.date_creation).toDateString() === today).length
})

// limite longueur et échappe les caractères regex ──
const sanitizedSearch = computed(() => {
  const raw = search.value.trim().slice(0, 100)
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
})

const filteredNotifications = computed(() => {
  const query = sanitizedSearch.value.toLowerCase()
  return notifications.value.filter(notification => {
    const title   = (notification.titre || '').toLowerCase()
    const message = (notification.message || '').toLowerCase()
    const type    = notification.type_notification || ''
    const matchesSearch = !query || title.includes(query) || message.includes(query)
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'unread' && !notification.est_lue) ||
      type === activeTab.value
    return matchesSearch && matchesTab
  })
})

// ── Helpers ──
function formatType(type) {
  return {
    VALIDATION:     'Validation',
    SYSTEME:        'Système',
    MESSAGE:        'Message',
    RAPPORT:        'Rapport',
    COMPTE:         'Compte',
    RECOMMANDATION: 'Recommandation',
    COMMENTAIRE:    'Commentaire',
    ATTESTATION:    'Attestation',
    SUGGESTION:     'Suggestion',
    PROJET:         'Projet',
    STAGE:          'Stage',
  }[type] || type || 'Général'
}

function typeBadgeClass(type) {
  return {
    VALIDATION:     'badge-valid',
    SYSTEME:        'badge-system',
    MESSAGE:        'badge-message',
    RAPPORT:        'badge-rapport',
    COMPTE:         'badge-compte',
    RECOMMANDATION: 'badge-reco',
    COMMENTAIRE:    'badge-comment',
    ATTESTATION:    'badge-attest',
    SUGGESTION:     'badge-suggest',
    PROJET:         'badge-projet',
    STAGE:          'badge-stage',
  }[type] || ''
}

function iconClass(type) {
  return {
    VALIDATION:     'icon-valid',
    SYSTEME:        'icon-system',
    MESSAGE:        'icon-message',
    RAPPORT:        'icon-rapport',
    COMPTE:         'icon-compte',
    RECOMMANDATION: 'icon-reco',
    COMMENTAIRE:    'icon-comment',
    ATTESTATION:    'icon-attest',
    SUGGESTION:     'icon-suggest',
    PROJET:         'icon-projet',
    STAGE:          'icon-stage',
  }[type] || 'icon-default'
}

function iconPath(type) {
  const paths = {
    VALIDATION:     '<polyline points="20 6 9 17 4 12"/>',
    SYSTEME:        '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    MESSAGE:        '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    RAPPORT:        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    COMPTE:         '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    RECOMMANDATION: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    COMMENTAIRE:    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    ATTESTATION:    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    SUGGESTION:     '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    PROJET:         '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    STAGE:          '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  }
  return paths[type] || '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>'
}

function fullSvgIcon(type) {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' + iconPath(type) + '</svg>'
}

function tabCount(key) {
  if (key === 'all')    return notifications.value.length
  if (key === 'unread') return unreadCount.value
  return notifications.value.filter(n => n.type_notification === key).length
}

function formatDate(date) {
  if (!date) return 'Date inconnue'
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Date invalide'
  return d.toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatRelativeDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  const diff  = Date.now() - d.getTime()
  if (diff < 0) return 'À l\'instant'   // 8. Date future : ne pas afficher de valeur négative
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'À l\'instant'
  if (mins < 60)  return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours} h`
  if (days === 1) return 'Hier'
  if (days < 7)   return `Il y a ${days} jours`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Normalisation des données reçues du backend ──
function normalizeNotification(raw) {
  if (!raw || typeof raw !== 'object') return null
  return {
    id_notification:    raw.id_notification ?? raw.id ?? null,
    titre:              typeof raw.titre   === 'string' ? raw.titre.slice(0, 200)   : '',
    message:            typeof raw.message === 'string' ? raw.message.slice(0, 2000): '',
    type_notification:  typeof raw.type_notification === 'string' ? raw.type_notification : '',
    est_lue:            Boolean(raw.est_lue),
    date_creation:      raw.date_creation ?? null,
  }
}

// ── API ──

async function loadNotifications() {
  loading.value = true
  error.value = null
  try {
    const data = await getAdminNotifications()
    // Normaliser et filtrer les entrées invalides avant de stocker
    const raw = Array.isArray(data) ? data : []
    notifications.value = raw
      .map(normalizeNotification)
      .filter(n => n !== null && isValidId(n.id_notification))
      .sort((a, b) => {
        if (a.est_lue !== b.est_lue) return a.est_lue ? 1 : -1
        return new Date(b.date_creation) - new Date(a.date_creation)
      })
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AdminNotifications] loadNotifications:', err)
    // Message générique selon le statut HTTP
    const status = err.response?.status
    if (status === 401 || status === 403) {
      await router.replace('/login')
      return
    }
    error.value = ERRORS.load
  } finally {
    loading.value = false
  }
}

async function handleMarkAsRead(notification) {
  if (!notification?.id_notification || notification.est_lue) return
  // Validation de l'ID avant l'appel
  if (!isValidId(notification.id_notification)) return
  actionLoadingId.value = notification.id_notification
  try {
    await markNotificationAsRead(notification.id_notification)
    notifications.value = notifications.value.map(item =>
      item.id_notification === notification.id_notification
        ? { ...item, est_lue: true }
        : item
    )
    if (selectedNotification.value?.id_notification === notification.id_notification) {
      selectedNotification.value = { ...selectedNotification.value, est_lue: true }
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AdminNotifications] handleMarkAsRead:', err)
    const status = err.response?.status
    if (status === 401 || status === 403) { await router.replace('/login'); return }
    error.value = ERRORS.read
  } finally {
    actionLoadingId.value = null
  }
}

async function handleMarkAllAsRead() {
  markingAll.value = true
  try {
    await markAllNotificationsAsRead(notifications.value)
    notifications.value = notifications.value.map(n => ({ ...n, est_lue: true }))
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AdminNotifications] handleMarkAllAsRead:', err)
  } finally {
    markingAll.value = false
  }
}

// Suppression en deux étapes avec modal de confirmation ──
function confirmDelete(notification) {
  if (!notification) return
  notifToDelete.value = notification
}

async function executeDelete() {
  const notification = notifToDelete.value
  if (!notification) return
  const id = notification.id_notification ?? notification.id
  // Validation de l'ID avant suppression
  if (!isValidId(id)) {
    notifToDelete.value = null
    return
  }
  notifToDelete.value = null
  try {
    await deleteNotification(id)
  } catch (err) {
    if (import.meta.env.DEV) console.error('[AdminNotifications] executeDelete:', err)
    const status = err.response?.status
    if (status === 401 || status === 403) { await router.replace('/login'); return }
    error.value = ERRORS.delete
  }
  notifications.value = notifications.value.filter(
    n => (n.id_notification ?? n.id) !== id
  )
  if (
    selectedNotification.value === notification ||
    (selectedNotification.value?.id_notification ?? selectedNotification.value?.id) === id
  ) {
    selectedNotification.value = null
  }
}

function openDetails(notification) {
  selectedNotification.value = notification
}
</script>

<style scoped>
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
.header-actions { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }

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

.btn--sm { padding: 0.4rem 0.7rem; font-size: 0.78rem; }

/* ── Stats ── */
.stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem; margin-bottom: 1.25rem;
}
.stat-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 12px; padding: 1.1rem 1.2rem;
  display: flex; align-items: center; gap: 0.85rem; color: var(--color-text-secondary);
  box-shadow: var(--shadow-panel);
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

/* ── Search ── */
.search-bar {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 10px; padding: 0.5rem 0.9rem;
  margin-bottom: 0.75rem; max-width: 400px;
}
.search-icon { flex-shrink: 0; opacity: 0.4; color: var(--color-text-secondary); }
.search-input {
  flex: 1; border: none; background: transparent;
  font-family: 'Inter', sans-serif; font-size: 0.84rem;
  color: var(--color-text-primary); outline: none;
}
.search-input::placeholder { color: var(--color-text-tertiary); }

/* ── Tabs ── */
.tabs-row {
  display: flex; gap: 0.4rem; margin-bottom: 1.25rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
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
  background: var(--color-surface); border: 1px solid var(--color-border);
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

.unread-dot {
  position: absolute; top: 14px; right: 14px;
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
  animation: blink 2s ease-in-out infinite;
}
@keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

.notif-icon {
  width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.icon-valid   { background: var(--color-valid-bg);  color: var(--color-valid-text); }
.icon-reco    { background: var(--color-waiting-bg);  color: var(--color-waiting-text); }
.icon-comment { background: rgba(92,122,140,0.15);  color: #7aafcf; }
.icon-attest  { background: var(--color-purple-bg);   color: var(--color-purple-text); }
.icon-suggest { background: rgba(140,92,58,0.15);   color: #d49a7a; }
.icon-projet  { background: rgba(58,140,120,0.15);  color: #3a8c78; }
.icon-stage   { background: rgba(58,92,140,0.15);   color: #5a7acc; }
.icon-system  { background: rgba(120,120,140,0.15);  color: #8888a0; }
.icon-message { background: rgba(92,140,180,0.15);  color: #5a8cb4; }
.icon-rapport { background: rgba(140,120,80,0.15);   color: #b49850; }
.icon-compte  { background: rgba(140,80,120,0.15);   color: #b05a8a; }
.icon-default { background: var(--color-surface-hover); color: var(--color-text-secondary); }

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
.badge-reco    { background: var(--color-waiting-bg);  color: var(--color-waiting-text);  border: 1px solid var(--color-waiting-border); }
.badge-comment { background: rgba(92,122,140,0.15);  color: #7aafcf;  border: 1px solid rgba(92,122,140,0.3); }
.badge-attest  { background: var(--color-purple-bg);   color: var(--color-purple-text);  border: 1px solid var(--color-purple-border); }
.badge-suggest { background: rgba(140,92,58,0.15);   color: #d49a7a;  border: 1px solid rgba(140,92,58,0.3); }
.badge-projet  { background: rgba(58,140,120,0.15);  color: #3a8c78;  border: 1px solid rgba(58,140,120,0.3); }
.badge-stage   { background: rgba(58,92,140,0.15);   color: #5a7acc;  border: 1px solid rgba(58,92,140,0.3); }
.badge-system  { background: rgba(120,120,140,0.15);  color: #8888a0;  border: 1px solid rgba(120,120,140,0.3); }
.badge-message { background: rgba(92,140,180,0.15);  color: #5a8cb4;  border: 1px solid rgba(92,140,180,0.3); }
.badge-rapport { background: rgba(140,120,80,0.15);   color: #b49850;  border: 1px solid rgba(140,120,80,0.3); }
.badge-compte  { background: rgba(140,80,120,0.15);   color: #b05a8a;  border: 1px solid rgba(140,80,120,0.3); }

.notif-date { font-size: 0.72rem; color: var(--color-text-tertiary); }

.notif-message {
  font-size: 0.855rem; color: var(--color-text-secondary);
  line-height: 1.6; margin: 0 0 0.65rem;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-footer {
  display: flex; align-items: center;
  justify-content: space-between; gap: 0.75rem;
  padding-top: 0.6rem; border-top: 1px solid var(--color-border);
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

.notif-footer-actions {
  display: flex; align-items: center; gap: 0.4rem;
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

.btn-delete {
  display: inline-flex; align-items: center; gap: 0.3rem;
  background: transparent; color: var(--color-danger);
  border: 1px solid #fecaca;
  padding: 0.28rem 0.6rem; border-radius: 6px;
  font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 500;
  cursor: pointer; transition: all 0.18s; white-space: nowrap;
}
.btn-delete:hover { background: #fef2f2; }
.btn-delete:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Details Panel ── */
.details-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; justify-content: flex-end;
  z-index: 200; animation: fadeIn 0.2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.details-panel {
  width: 420px; height: 100%;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  padding: 1.8rem; overflow-y: auto;
  box-shadow: -4px 0 24px rgba(0,0,0,0.1);
  animation: slideIn 0.25s ease;
}
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

.details-panel__header {
  display: flex; justify-content: space-between;
  gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem;
}
.details-panel__title {
  font-size: 1.1rem; font-weight: 700; color: var(--color-text-primary);
  margin: 0; line-height: 1.4;
}
.details-panel__subtitle {
  font-size: 0.8rem; color: var(--color-text-tertiary); margin-top: 0.25rem;
}

.details-panel__body { display: flex; flex-direction: column; gap: 1rem; }

.details-row {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 0.7rem; border-bottom: 1px solid var(--color-border);
}
.details-row__label { font-size: 0.82rem; color: var(--color-text-secondary); }
.details-row__value { font-size: 0.85rem; color: var(--color-text-primary); display: flex; align-items: center; gap: 0.3rem; }
.text-unread { color: var(--color-accent); font-weight: 600; }
.text-read { color: var(--color-text-tertiary); }

.details-message-box {
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 10px; padding: 1rem;
}
.details-message-label {
  font-size: 0.75rem; font-weight: 600; color: var(--color-text-tertiary);
  text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 0.5rem;
}
.details-message {
  font-size: 0.875rem; color: var(--color-text-secondary);
  line-height: 1.7; margin: 0; white-space: pre-wrap;
}

.details-panel__footer {
  display: flex; gap: 0.6rem;
  margin-top: 1.5rem; padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* ── Confirm Modal ── */
.confirm-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px; padding: 2rem 1.75rem;
  width: 360px; max-width: 90vw;
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem; text-align: center;
  animation: slideUp 0.2s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.confirm-icon { color: var(--color-danger); opacity: 0.8; }
.confirm-title {
  font-size: 1rem; font-weight: 700; color: var(--color-text-primary); margin: 0;
}
.confirm-message {
  font-size: 0.84rem; color: var(--color-text-secondary); margin: 0;
}
.confirm-actions {
  display: flex; gap: 0.6rem; margin-top: 0.5rem; justify-content: center;
}
.btn-delete--confirm {
  padding: 0.5rem 1.1rem; font-size: 0.82rem; font-weight: 600;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .notifications-page { padding: 1.25rem 1rem 3rem; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .tabs-row { width: 100%; overflow-x: auto; }
  .search-bar { max-width: 100%; }
}
@media (max-width: 480px) {
  .notif-card { flex-direction: column; }
  .notif-header { flex-direction: column; align-items: flex-start; }
  .notif-meta { align-items: flex-start; }
  .notif-footer { flex-direction: column; align-items: flex-start; }
  .details-panel { width: 100%; }
  .confirm-modal { width: 100%; border-radius: 12px 12px 0 0; }
}
</style>
