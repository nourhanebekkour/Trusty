<template>
  <div class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Notifications administrateur</h1>
        <p class="page__subtitle">
          Consultez les alertes, les validations et les activités importantes de la plateforme.
        </p>
      </div>

      <div class="page__actions">
        <button class="btn btn--secondary" :disabled="loading" @click="loadNotifications">
          Actualiser
        </button>
        <button
          class="btn btn--primary"
          :disabled="loading || unreadCount === 0"
          @click="handleMarkAllAsRead"
        >
          Tout marquer comme lu
        </button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-card__label">Total</span>
        <strong class="stat-card__value">{{ notifications.length }}</strong>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Non lues</span>
        <strong class="stat-card__value">{{ unreadCount }}</strong>
      </div>

      <div class="stat-card">
        <span class="stat-card__label">Lues</span>
        <strong class="stat-card__value">{{ readCount }}</strong>
      </div>
    </div>

    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <div class="card">
      <div class="card__header">
        <div>
          <h2 class="card__title">Centre de notifications</h2>
          <p class="card__subtitle">Filtrer, lire et supprimer les notifications reçues.</p>
        </div>

        <div class="filters">
          <input
            v-model="search"
            class="search-input"
            type="text"
            placeholder="Rechercher une notification"
          />

          <select v-model="statusFilter" class="select-input">
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>

          <select v-model="typeFilter" class="select-input">
            <option value="all">Tous les types</option>
            <option
              v-for="type in notificationTypes"
              :key="type"
              :value="type"
            >
              {{ formatType(type) }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="state-msg">
        Chargement des notifications...
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <h3>Aucune notification trouvée</h3>
        <p>Aucune donnée ne correspond aux filtres sélectionnés.</p>
      </div>

      <div v-else class="notification-list">
        <article
          v-for="notification in filteredNotifications"
          :key="notification.id_notification"
          class="notification-item"
          :class="{ 'notification-item--unread': !notification.est_lue }"
        >
          <button class="notification-item__content" @click="openDetails(notification)">
            <div class="notification-item__top">
              <div>
                <h3 class="notification-item__title">
                  {{ notification.titre || 'Notification' }}
                </h3>
                <span class="notification-item__type">
                  {{ formatType(notification.type_notification) }}
                </span>
              </div>

              <span class="notification-item__date">
                {{ formatRelativeDate(notification.date_creation) }}
              </span>
            </div>

            <p class="notification-item__message">
              {{ notification.message }}
            </p>
          </button>

          <div class="notification-item__actions">
            <button
              v-if="!notification.est_lue"
              class="btn btn--ghost btn--sm"
              :disabled="actionLoadingId === notification.id_notification"
              @click="handleMarkAsRead(notification)"
            >
              Marquer comme lu
            </button>

            <button
              class="btn btn--danger btn--sm"
              :disabled="actionLoadingId === notification.id_notification"
              @click="handleDelete(notification)"
            >
              Supprimer
            </button>
          </div>
        </article>
      </div>
    </div>

    <div v-if="selectedNotification" class="details-panel">
      <div class="details-panel__box">
        <div class="details-panel__header">
          <div>
            <h2 class="details-panel__title">
              {{ selectedNotification.titre || 'Détail de la notification' }}
            </h2>
            <p class="details-panel__subtitle">
              {{ formatDate(selectedNotification.date_creation) }}
            </p>
          </div>

          <button class="btn btn--secondary btn--sm" @click="selectedNotification = null">
            Fermer
          </button>
        </div>

        <div class="details-panel__body">
          <div class="details-row">
            <span>Type</span>
            <strong>{{ formatType(selectedNotification.type_notification) }}</strong>
          </div>

          <div class="details-row">
            <span>Statut</span>
            <strong>{{ selectedNotification.est_lue ? 'Lue' : 'Non lue' }}</strong>
          </div>

          <p class="details-message">
            {{ selectedNotification.message }}
          </p>
        </div>

        <div class="details-panel__footer">
          <button
            v-if="!selectedNotification.est_lue"
            class="btn btn--primary"
            @click="handleMarkAsRead(selectedNotification)"
          >
            Marquer comme lu
          </button>

          <button class="btn btn--danger" @click="handleDelete(selectedNotification)">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
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

    const matchesSearch =
      !query || title.includes(query) || message.includes(query)

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'unread' && !notification.est_lue) ||
      (statusFilter.value === 'read' && notification.est_lue)

    const matchesType =
      typeFilter.value === 'all' || type === typeFilter.value

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

  try {
    await markNotificationAsRead(notification.id_notification)

    notifications.value = notifications.value.map(item =>
      item.id_notification === notification.id_notification
        ? { ...item, est_lue: true }
        : item
    )

    if (selectedNotification.value?.id_notification === notification.id_notification) {
      selectedNotification.value = {
        ...selectedNotification.value,
        est_lue: true,
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de marquer cette notification comme lue.'
  } finally {
    actionLoadingId.value = null
  }
}

async function handleMarkAllAsRead() {
  await markAllNotificationsAsRead(notifications.value)
  notifications.value.forEach(n => { n.est_lue = true })
}

async function handleDelete(notification) {
  if (!notification) return
  const id = notification.id_notification || notification.id
  try {
    await deleteNotification(id)
  } catch (_) {}
  notifications.value = notifications.value.filter(n => (n.id_notification || n.id) !== id)
  if (selectedNotification.value === notification) selectedNotification.value = null
}

function openDetails(notification) {
  selectedNotification.value = notification
}

function formatType(type) {
  const labels = {
    VALIDATION: 'Validation',
    SYSTEME: 'Système',
    MESSAGE: 'Message',
    RAPPORT: 'Rapport',
    COMPTE: 'Compte',
  }

  return labels[type] || type || 'Général'
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

  if (minutes < 1) return 'À l’instant'
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours} h`
  if (days === 1) return 'Hier'

  return `Il y a ${days} jours`
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.page { padding: 32px; }

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.page__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.page__actions { display: flex; gap: 12px; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 18px;
}

.stat-card__label {
  display: block;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.stat-card__value {
  font-size: 26px;
  color: var(--color-text-primary);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: 12px;
  padding: 20px;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 18px;
}

.card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.card__subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input,
.select-input {
  height: 38px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  outline: none;
}

.search-input { width: 240px; }

.search-input:focus,
.select-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--color-border-light);
  background: var(--color-surface-alt);
  border-radius: 10px;
  padding: 14px;
}

.notification-item--unread {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
}

.notification-item__content {
  flex: 1;
  text-align: left;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.notification-item__top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.notification-item__title {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.notification-item__type {
  display: inline-flex;
  margin-top: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--color-border-light);
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.notification-item__date {
  color: var(--color-text-tertiary);
  font-size: 12px;
  white-space: nowrap;
}

.notification-item__message {
  color: var(--color-text-secondary);
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
}

.notification-item__actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}

.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn--primary { background: var(--color-accent); color: #fff; }
.btn--primary:hover { background: var(--color-accent-hover); }

.btn--secondary { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.btn--secondary:hover { background: var(--color-surface-hover); }

.btn--ghost { background: transparent; border: 1px solid var(--color-border); color: var(--color-accent); }
.btn--ghost:hover { background: var(--color-surface-hover); }

.btn--danger { background: #fef2f2; border: 1px solid #fecaca; color: var(--color-danger); }
.btn--danger:hover { background: #fee2e2; }

.btn--sm { padding: 6px 10px; font-size: 12px; }

.state-msg { text-align: center; padding: 26px; color: var(--color-text-tertiary); font-size: 13px; }

.empty-state { text-align: center; padding: 36px; color: var(--color-text-tertiary); }

.empty-state h3 { color: var(--color-text-primary); margin: 0 0 6px; font-size: 16px; }
.empty-state p  { margin: 0; font-size: 13px; }

.error-banner {
  background: #fef2f2; border: 1px solid #fecaca;
  color: var(--color-danger); padding: 10px 16px;
  border-radius: 8px; font-size: 13px; margin-bottom: 20px;
}

.details-panel {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: flex-end;
  z-index: 200;
}

.details-panel__box {
  width: 420px;
  height: 100%;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border-light);
  padding: 24px;
  box-shadow: var(--shadow-panel);
}

.details-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.details-panel__title { color: var(--color-text-primary); font-size: 18px; margin: 0; }
.details-panel__subtitle { color: var(--color-text-secondary); font-size: 13px; margin-top: 4px; }

.details-panel__body { display: flex; flex-direction: column; gap: 14px; }

.details-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 10px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.details-row strong { color: var(--color-text-primary); }

.details-message {
  background: var(--color-surface-alt);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: 10px;
  padding: 14px;
  line-height: 1.6;
  font-size: 14px;
}

.details-panel__footer { display: flex; gap: 10px; margin-top: 24px; }

@media (max-width: 900px) {
  .page__header, .card__header, .notification-item { flex-direction: column; }
  .stats-row { grid-template-columns: 1fr; }
  .search-input { width: 100%; }
  .filters { width: 100%; }
  .details-panel__box { width: 100%; }
}
</style>