<template>
  <header class="topbar">
    <div class="topbar__left">
      <div class="topbar__logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5C8C6A"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>

        <strong>TRUSTY</strong>
      </div>

      <span v-if="showPublicBadge" class="topbar__public">
        Consultation publique
      </span>
    </div>

    <div class="topbar__right">
      <button class="topbar__bell" type="button" @click="toggleNotifPanel">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        <span v-if="displayUnreadCount > 0" class="topbar__notif-dot">
          {{ displayUnreadCount > 9 ? '9+' : displayUnreadCount }}
        </span>
      </button>

      <div v-if="showNotifPanel" class="notif-overlay" @click="closeNotifPanel"></div>

      <div v-if="showNotifPanel" class="notif-panel">
        <div class="notif-panel__header">
          <div>
            <span class="notif-panel__title">Notifications</span>
            <span class="notif-panel__subtitle">{{ displayUnreadCount }} non lue(s)</span>
          </div>

          <button
            v-if="displayUnreadCount > 0"
            class="notif-panel__mark-all"
            type="button"
            @click="markAllRead"
          >
            Tout marquer comme lu
          </button>
        </div>

        <div v-if="notifLoading" class="notif-panel__state">
          Chargement des notifications...
        </div>

        <div v-else-if="notifications.length === 0" class="notif-panel__state">
          Aucune notification disponible.
        </div>

        <div v-else class="notif-panel__list">
          <button
            v-for="notif in notifications"
            :key="notif.id_notification"
            class="notif-item"
            :class="{ 'notif-item--unread': !notif.est_lue }"
            type="button"
            @click="openNotification(notif)"
          >
            <span v-if="!notif.est_lue" class="notif-item__dot"></span>

            <span class="notif-item__body">
              <span class="notif-item__title">
                {{ notif.titre || 'Notification' }}
              </span>

              <span class="notif-item__msg">
                {{ notif.message }}
              </span>

              <span class="notif-item__time">
                {{ formatRelativeDate(notif.date_creation) }}
              </span>
            </span>
          </button>
        </div>

        <div class="notif-panel__footer">
          <button class="notif-panel__view-all" type="button" @click="goToNotifications">
            Voir toutes les notifications
          </button>
        </div>
      </div>

      <div class="topbar__user">
        <div class="topbar__user-info">
          <span class="topbar__user-name">{{ fullName }}</span>
          <span class="topbar__user-role">{{ formatRole(auth.user?.role) }}</span>
        </div>

        <div class="topbar__avatar">
          {{ initials }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authstore'
import api from '../../services/api'

const props = defineProps({
  showPublicBadge: {
    type: Boolean,
    default: false,
  },
  notifCount: {
    type: Number,
    default: 0,
  },
})

const router = useRouter()
const auth = useAuthStore()

const notifications = ref([])
const notifLoading = ref(false)
const showNotifPanel = ref(false)
const notificationsLoaded = ref(false)

const unreadCount = computed(() => {
  return notifications.value.filter(notification => !notification.est_lue).length
})

const displayUnreadCount = computed(() => {
  if (!notificationsLoaded.value && props.notifCount > 0) {
    return props.notifCount
  }

  return unreadCount.value
})

const fullName = computed(() => {
  if (!auth.user) {
    return 'Chargement...'
  }

  const firstName = auth.user.prenom || ''
  const lastName = auth.user.nom || ''
  const name = `${firstName} ${lastName}`.trim()

  return name || 'Utilisateur'
})

const initials = computed(() => {
  if (!auth.user) {
    return '?'
  }

  const firstNameInitial = auth.user.prenom?.charAt(0) || ''
  const lastNameInitial = auth.user.nom?.charAt(0) || ''

  return `${firstNameInitial}${lastNameInitial}`.toUpperCase() || '?'
})

function formatRole(role) {
  const roles = {
    ETUDIANT: 'Étudiant',
    PROFESSEUR: 'Professeur',
    ADMINISTRATEUR: 'Administrateur',
    PROFESSIONNEL: 'Professionnel',
  }

  return roles[role] || role || 'Utilisateur'
}

async function fetchNotifications() {
  notifLoading.value = true

  try {
    const response = await api.get('/notifications')
    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.data || []

    notifications.value = data
    notificationsLoaded.value = true
  } catch (error) {
    notifications.value = []
    notificationsLoaded.value = true
    console.error('Erreur lors du chargement des notifications', error)
  } finally {
    notifLoading.value = false
  }
}

async function markAllRead() {
  try {
    await api.patch('/notifications/read-all')

    notifications.value = notifications.value.map(notification => ({
      ...notification,
      est_lue: true,
    }))
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications', error)
  }
}

async function markAsRead(notification) {
  if (!notification || notification.est_lue) {
    return
  }

  try {
    await api.patch(`/notifications/${notification.id_notification}/read`)

    notifications.value = notifications.value.map(item =>
      item.id_notification === notification.id_notification
        ? { ...item, est_lue: true }
        : item
    )
  } catch (error) {
    console.error('Erreur lors de la lecture de la notification', error)
  }
}

async function openNotification(notification) {
  await markAsRead(notification)
  goToNotifications()
}

function toggleNotifPanel() {
  showNotifPanel.value = !showNotifPanel.value

  if (showNotifPanel.value && !notificationsLoaded.value) {
    fetchNotifications()
  }
}

function closeNotifPanel() {
  showNotifPanel.value = false
}

function goToNotifications() {
  closeNotifPanel()
  router.push('/admin/notifications')
}

function formatRelativeDate(dateStr) {
  if (!dateStr) {
    return 'Date inconnue'
  }

  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) {
    return 'À l’instant'
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`
  }

  if (hours < 24) {
    return `Il y a ${hours} h`
  }

  if (days === 1) {
    return 'Hier'
  }

  return `Il y a ${days} jours`
}

onMounted(async () => {
  if (!auth.user && typeof auth.fetchUser === 'function') {
    await auth.fetchUser()
  }

  await fetchNotifications()
})
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.topbar__logo svg { stroke: var(--color-accent); }

.topbar__public {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-surface-hover);
  padding: 4px 10px;
  border-radius: 999px;
}

.topbar__right {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.topbar__bell {
  position: relative;
  width: 34px;
  height: 34px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.topbar__bell:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.topbar__notif-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-overlay {
  position: fixed;
  inset: 0;
  z-index: 140;
  background: transparent;
}

.notif-panel {
  position: absolute;
  top: 48px;
  right: 0;
  width: 340px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  z-index: 150;
}

.notif-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.notif-panel__title {
  display: block;
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.notif-panel__subtitle {
  display: block;
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.notif-panel__mark-all {
  background: transparent;
  border: none;
  color: var(--color-accent);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.notif-panel__mark-all:hover { text-decoration: underline; }

.notif-panel__state {
  padding: 24px 16px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.notif-panel__list {
  max-height: 360px;
  overflow-y: auto;
}

.notif-item {
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid var(--color-border-light);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.notif-item:hover { background: var(--color-surface-hover); }

.notif-item--unread { background: var(--color-accent-light); }

.notif-item__dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  margin-top: 5px;
}

.notif-item__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.notif-item__title {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
}

.notif-item__msg {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.notif-item__time {
  color: var(--color-text-tertiary);
  font-size: 11px;
}

.notif-panel__footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-light);
}

.notif-panel__view-all {
  width: 100%;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.notif-panel__view-all:hover { background: var(--color-surface-hover); }

.topbar__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar__user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.topbar__user-name {
  color: var(--color-text-primary);
  font-size: 13px;
  font-weight: 600;
}

.topbar__user-role {
  color: var(--color-text-secondary);
  font-size: 11px;
}

.topbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>