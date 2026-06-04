<template>
  <div class="prof-page">
    <div class="prof-page-head">
      <div>
        <h1>Notifications</h1>
        <p>Gérez les alertes liées aux projets, recommandations et certifications.</p>
      </div>

      <button class="prof-btn prof-btn-secondary" @click="markAllAsRead">
        Tout marquer comme lu
      </button>
    </div>

    <div v-if="loading" class="prof-state">Chargement des notifications...</div>
    <div v-else-if="error" class="prof-error">{{ error }}</div>

    <template v-else>
      <section class="prof-grid-3">
        <div class="prof-card">
          <span class="prof-stat-label">Total</span>
          <strong class="prof-stat-value">{{ notifications.length }}</strong>
        </div>
        <div class="prof-card">
          <span class="prof-stat-label">Non lues</span>
          <strong class="prof-stat-value">{{ unreadCount }}</strong>
        </div>
        <div class="prof-card">
          <span class="prof-stat-label">Lues</span>
          <strong class="prof-stat-value">{{ readCount }}</strong>
        </div>
      </section>

      <section class="prof-card" style="margin-top: 18px;">
        <div class="prof-toolbar">
          <h2 class="prof-card-title">Flux d’activités</h2>

          <select v-model="filter" class="prof-select">
            <option value="">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
        </div>

        <div v-if="filteredNotifications.length === 0" class="prof-empty">
          Aucune notification.
        </div>

        <div v-else class="prof-list">
          <article
            v-for="notification in filteredNotifications"
            :key="notification.id"
            class="prof-list-item"
            :style="!notification.isRead ? 'border-left: 4px solid #42A8C7;' : ''"
          >
            <div class="prof-row">
              <div>
                <strong>{{ notification.title }}</strong>
                <p class="prof-muted">{{ notification.message }}</p>
                <p class="prof-muted">{{ formatDate(notification.createdAt) }} - {{ notification.type }}</p>
              </div>

              <div class="prof-actions">
                <button
                  class="prof-btn prof-btn-secondary prof-btn-small"
                  :disabled="notification.isRead"
                  @click="markOneAsRead(notification)"
                >
                  Marquer lu
                </button>

                <button
                  class="prof-btn prof-btn-danger prof-btn-small"
                  @click="deleteOne(notification)"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </template>

    <div v-if="toast.show" class="prof-toast">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import '@/assets/professor-pages.css'
import {
  getProfessorNotifications,
  markProfessorNotificationAsRead,
  markAllProfessorNotificationsAsRead,
  deleteProfessorNotification,
} from '@/services/professorApi'

const loading = ref(false)
const error = ref(null)
const notifications = ref([])
const filter = ref('')
const toast = ref({ show: false, message: '' })

const unreadCount = computed(() => notifications.value.filter(item => !item.isRead).length)
const readCount = computed(() => notifications.value.filter(item => item.isRead).length)

const filteredNotifications = computed(() => {
  if (filter.value === 'unread') {
    return notifications.value.filter(item => !item.isRead)
  }

  if (filter.value === 'read') {
    return notifications.value.filter(item => item.isRead)
  }

  return notifications.value
})

async function loadNotifications() {
  loading.value = true
  error.value = null

  try {
    const data = await getProfessorNotifications()
    notifications.value = Array.isArray(data.notifications) ? data.notifications : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Impossible de charger les notifications.'
  } finally {
    loading.value = false
  }
}

async function markOneAsRead(notification) {
  try {
    await markProfessorNotificationAsRead(notification.id)

    notifications.value = notifications.value.map(item =>
      item.id === notification.id ? { ...item, isRead: true } : item
    )
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de modifier la notification.')
  }
}

async function markAllAsRead() {
  try {
    await markAllProfessorNotificationsAsRead()

    notifications.value = notifications.value.map(item => ({
      ...item,
      isRead: true,
    }))

    showToast('Notifications marquées comme lues.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de modifier les notifications.')
  }
}

async function deleteOne(notification) {
  try {
    await deleteProfessorNotification(notification.id)
    notifications.value = notifications.value.filter(item => item.id !== notification.id)
    showToast('Notification marquée comme lue.')
  } catch (err) {
    showToast(err.response?.data?.message || 'Impossible de modifier la notification.')
  }
}

function formatDate(date) {
  if (!date) return '—'

  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function showToast(message) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2800)
}

onMounted(loadNotifications)
</script>