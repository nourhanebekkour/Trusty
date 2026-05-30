<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <h1 class="admin-page__title">Notifications administrateur</h1>
        <p class="admin-page__subtitle">
          Centre de lecture branche sur /notifications et PUT /notifications/:id/lire.
        </p>
      </div>

      <div class="admin-page__actions">
        <button class="admin-btn admin-btn--secondary" type="button" :disabled="loading" @click="loadNotifications">
          <RefreshCw :size="16" />
          Actualiser
        </button>
        <button class="admin-btn" type="button" :disabled="loading || unreadCount === 0" @click="handleMarkAllAsRead">
          <CheckCheck :size="16" />
          Tout marquer comme lu
        </button>
      </div>
    </header>

    <section class="admin-stats">
      <article class="admin-stat admin-stat--accent">
        <span class="admin-stat__label">Total</span>
        <strong class="admin-stat__value">{{ notifications.length }}</strong>
        <span class="admin-stat__sub">Notifications recues</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Non lues</span>
        <strong class="admin-stat__value">{{ unreadCount }}</strong>
        <span class="admin-stat__sub">est_lue = false</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Lues</span>
        <strong class="admin-stat__value">{{ readCount }}</strong>
        <span class="admin-stat__sub">est_lue = true</span>
      </article>
      <article class="admin-stat">
        <span class="admin-stat__label">Types</span>
        <strong class="admin-stat__value">{{ notificationTypes.length }}</strong>
        <span class="admin-stat__sub">Enums TypeNotification</span>
      </article>
    </section>

    <div v-if="error" class="admin-error">{{ error }}</div>

    <article class="admin-card">
      <div class="admin-card__header">
        <div>
          <h2 class="admin-card__title">Boite de notifications</h2>
          <p class="admin-card__subtitle">La suppression et le marquage global natif sont documentes comme APIs manquantes.</p>
        </div>
        <div class="admin-actions">
          <input v-model="search" class="admin-input" type="search" placeholder="Rechercher" />
          <select v-model="statusFilter" class="admin-select">
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
          <select v-model="typeFilter" class="admin-select">
            <option value="all">Tous les types</option>
            <option v-for="type in notificationTypes" :key="type" :value="type">{{ formatType(type) }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="admin-state">Chargement des notifications...</div>
      <div v-else-if="filteredNotifications.length === 0" class="admin-state">Aucune notification trouvee.</div>

      <div v-else class="admin-stack">
        <article v-for="notification in filteredNotifications" :key="notification.id_notification" class="admin-card" style="box-shadow:none;">
          <div class="admin-card__header">
            <button class="notification-content" type="button" @click="selectedNotification = notification">
              <strong>{{ notification.titre || 'Notification' }}</strong>
              <span class="admin-muted">{{ notification.message }}</span>
            </button>
            <div class="admin-actions">
              <span :class="['admin-badge', notification.est_lue ? 'admin-badge--success' : 'admin-badge--warning']">
                {{ notification.est_lue ? 'Lue' : 'Non lue' }}
              </span>
              <span class="admin-badge">{{ formatType(notification.type_notification) }}</span>
            </div>
          </div>

          <div class="admin-actions">
            <span class="admin-muted">{{ formatRelativeDate(notification.date_creation) }}</span>
            <button
              v-if="!notification.est_lue"
              class="admin-btn admin-btn--sm"
              type="button"
              :disabled="actionLoadingId === notification.id_notification"
              @click="handleMarkAsRead(notification)"
            >
              Marquer comme lu
            </button>
          </div>
        </article>
      </div>
    </article>

    <div v-if="selectedNotification" class="admin-modal-backdrop" @click.self="selectedNotification = null">
      <section class="admin-modal">
        <div class="admin-modal__header">
          <div>
            <h2 class="admin-modal__title">{{ selectedNotification.titre || 'Detail de la notification' }}</h2>
            <p class="admin-modal__subtitle">{{ formatDate(selectedNotification.date_creation) }}</p>
          </div>
          <button class="admin-btn admin-btn--secondary admin-btn--sm" type="button" @click="selectedNotification = null">
            Fermer
          </button>
        </div>

        <div class="admin-stack">
          <span class="admin-badge">{{ formatType(selectedNotification.type_notification) }}</span>
          <p class="admin-page__subtitle">{{ selectedNotification.message }}</p>
        </div>

        <div class="admin-modal__footer">
          <button
            v-if="!selectedNotification.est_lue"
            class="admin-btn"
            type="button"
            @click="handleMarkAsRead(selectedNotification)"
          >
            Marquer comme lu
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { CheckCheck, RefreshCw } from 'lucide-vue-next'
import {
  getAdminNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/services/adminNotificationService'

const notifications = ref([])
const loading = ref(false)
const error = ref(null)
const search = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')
const selectedNotification = ref(null)
const actionLoadingId = ref(null)

const unreadCount = computed(() =>
  notifications.value.filter(notification => !notification.est_lue).length
)

const readCount = computed(() =>
  notifications.value.filter(notification => notification.est_lue).length
)

const notificationTypes = computed(() => {
  const types = notifications.value
    .map(notification => notification.type_notification)
    .filter(Boolean)
  return [...new Set(types)]
})

const filteredNotifications = computed(() => {
  const query = search.value.trim().toLowerCase()

  return notifications.value.filter(notification => {
    const title = (notification.titre || '').toLowerCase()
    const message = (notification.message || '').toLowerCase()
    const type = notification.type_notification || ''

    const matchesSearch = !query || title.includes(query) || message.includes(query)
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'unread' && !notification.est_lue) ||
      (statusFilter.value === 'read' && notification.est_lue)
    const matchesType = typeFilter.value === 'all' || type === typeFilter.value

    return matchesSearch && matchesStatus && matchesType
  })
})

async function loadNotifications() {
  loading.value = true
  error.value = null
  try {
    const data = await getAdminNotifications()
    notifications.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les notifications.'
  } finally {
    loading.value = false
  }
}

async function handleMarkAsRead(notification) {
  if (!notification?.id_notification) return

  actionLoadingId.value = notification.id_notification
  error.value = null
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
    error.value = err.response?.data?.message || 'Impossible de marquer cette notification comme lue.'
  } finally {
    actionLoadingId.value = null
  }
}

async function handleMarkAllAsRead() {
  loading.value = true
  error.value = null
  try {
    await markAllNotificationsAsRead()
    notifications.value = notifications.value.map(notification => ({ ...notification, est_lue: true }))
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de marquer toutes les notifications comme lues.'
  } finally {
    loading.value = false
  }
}

function formatType(type) {
  const labels = {
    VALIDATION: 'Validation',
    COMMENTAIRE: 'Commentaire',
    RECOMMANDATION: 'Recommandation',
    ATTESTATION: 'Attestation',
    SUGGESTION: 'Suggestion',
  }
  return labels[type] || type || 'General'
}

function formatDate(date) {
  if (!date) return 'Date inconnue'
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeDate(date) {
  if (!date) return 'Date inconnue'
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "A l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours} h`
  if (days === 1) return 'Hier'
  return `Il y a ${days} jours`
}

onMounted(loadNotifications)
</script>

<style scoped>
.notification-content {
  border: none;
  background: transparent;
  color: inherit;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}
</style>
