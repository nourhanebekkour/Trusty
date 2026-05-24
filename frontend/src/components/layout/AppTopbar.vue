<template>
  <header class="topbar">
    <div class="topbar__left">
      <div class="topbar__logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="#5C8C6A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <strong>TRUSTY</strong>
      </div>
      <span v-if="showPublicBadge" class="topbar__public">
        🌐 Consultation Publique
      </span>
    </div>

    <div class="topbar__right">
      <!-- Cloche notifications -->
      <button class="topbar__bell" @click="toggleNotifPanel">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span v-if="unreadCount > 0" class="topbar__notif-dot">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Panel notifications -->
      <div v-if="showNotifPanel" class="notif-panel">
        <div class="notif-panel__header">
          <span class="notif-panel__title">Notifications</span>
          <button v-if="unreadCount > 0" class="notif-panel__mark-all"
                  @click="markAllRead">Tout marquer comme lu</button>
        </div>

        <div v-if="notifLoading" class="notif-panel__state">Chargement…</div>

        <div v-else-if="notifications.length === 0" class="notif-panel__state">
          Aucune notification
        </div>

        <div v-else class="notif-panel__list">
          <div v-for="notif in notifications" :key="notif.id_notification"
               class="notif-item" :class="{ 'notif-item--unread': !notif.est_lue }">
            <div class="notif-item__dot" v-if="!notif.est_lue" />
            <div class="notif-item__body">
              <p class="notif-item__title">{{ notif.titre }}</p>
              <p class="notif-item__msg">{{ notif.message }}</p>
              <span class="notif-item__time">{{ formatRelativeDate(notif.date_creation) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay pour fermer le panel en cliquant dehors -->
      <div v-if="showNotifPanel" class="notif-overlay" @click="showNotifPanel = false" />

      <!-- Infos utilisateur -->
      <div class="topbar__user">
        <div class="topbar__user-info">
          <span class="topbar__user-name">{{ fullName }}</span>
          <span class="topbar__user-role">{{ formatRole(auth.user?.role) }}</span>
        </div>
        <div class="topbar__avatar">{{ initials }}</div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/authstore'
import api from '../../services/api'

const props = defineProps({
  showPublicBadge: { type: Boolean, default: false },
})

const auth = useAuthStore()

// ── Nom et initiales depuis les vrais champs Prisma (nom, prenom) ──
const fullName = computed(() => {
  if (!auth.user) return 'Chargement…'
  return `${auth.user.prenom || ''} ${auth.user.nom || ''}`.trim() || 'Utilisateur'
})

const initials = computed(() => {
  if (!auth.user) return '?'
  const p = auth.user.prenom?.[0] || ''
  const n = auth.user.nom?.[0]    || ''
  return (p + n).toUpperCase() || '?'
})

function formatRole(role) {
  const map = {
    ETUDIANT:       'Étudiant',
    PROFESSEUR:     'Professeur',
    ADMINISTRATEUR: 'Administrateur',
    PROFESSIONNEL:  'Professionnel',
  }
  return map[role] || role || '—'
}

// ── Notifications (GET /notifications) ────────────────────
// Structure attendue par item (modèle Prisma Notification) :
// { id_notification, titre, message, est_lue, date_creation, type_notification }
const notifications  = ref([])
const notifLoading   = ref(false)
const showNotifPanel = ref(false)

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.est_lue).length
)

async function fetchNotifications() {
  try {
    notifLoading.value = true
    const res = await api.get('/notifications')
    // L'API retourne soit res.data directement, soit res.data.data selon sendResponse
    notifications.value = Array.isArray(res.data) ? res.data : (res.data.data || [])
  } catch (e) {
    console.error('Erreur notifications:', e)
  } finally {
    notifLoading.value = false
  }
}

async function markAllRead() {
  try {
    await api.patch('/notifications/read-all')
    notifications.value = notifications.value.map(n => ({ ...n, est_lue: true }))
  } catch (e) {
    console.error('Erreur mark all read:', e)
  }
}

function toggleNotifPanel() {
  showNotifPanel.value = !showNotifPanel.value
  if (showNotifPanel.value && notifications.value.length === 0) {
    fetchNotifications()
  }
}

function formatRelativeDate(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const h    = Math.floor(diff / 3600000)
  const d    = Math.floor(diff / 86400000)
  if (h < 1)   return 'À l\'instant'
  if (h < 24)  return `Il y a ${h}h`
  if (d === 1) return 'Hier'
  return `Il y a ${d} jours`
}

// ── Chargement initial ─────────────────────────────────────
onMounted(async () => {
  // Récupérer le profil si pas encore chargé
  if (!auth.user) await auth.fetchProfile()
  // Charger le nombre de notifs non lues au démarrage
  await fetchNotifications()
})
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 60px;
  background: #1A3838;
  border-bottom: 1px solid #2a4a48;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
}
.topbar__left  { display: flex; align-items: center; gap: 16px; }
.topbar__logo  { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #D6EDE8; }
.topbar__public { font-size: 12px; color: #8aada9; background: #162e2e; padding: 4px 10px; border-radius: 9999px; }
.topbar__right { display: flex; align-items: center; gap: 16px; position: relative; }

.topbar__bell {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: #8aada9;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s;
}
.topbar__bell:hover { background: #162e2e; }
.topbar__notif-dot {
  position: absolute;
  top: 2px; right: 2px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px; height: 16px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
}

/* Panel notifications */
.notif-overlay {
  position: fixed;
  inset: 0;
  z-index: 149;
}
.notif-panel {
  position: absolute;
  top: 48px; right: 0;
  width: 320px;
  background: #1A3838;
  border: 1px solid #2a4a48;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  z-index: 150;
  overflow: hidden;
}
.notif-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #2a4a48;
}
.notif-panel__title    { font-size: 14px; font-weight: 600; color: #D6EDE8; }
.notif-panel__mark-all { font-size: 11px; color: #5C8C6A; background: none; border: none; cursor: pointer; }
.notif-panel__mark-all:hover { text-decoration: underline; }
.notif-panel__state    { padding: 20px; text-align: center; font-size: 13px; color: #4a6e6a; }
.notif-panel__list     { max-height: 360px; overflow-y: auto; }

.notif-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #1e3a3a;
  transition: background 0.15s;
}
.notif-item:hover           { background: #0f2424; }
.notif-item--unread         { background: #162e2e; }
.notif-item__dot {
  width: 8px; height: 8px; min-width: 8px;
  border-radius: 50%;
  background: #5C8C6A;
  margin-top: 5px;
}
.notif-item__body  { flex: 1; }
.notif-item__title { font-size: 13px; font-weight: 600; color: #D6EDE8; margin: 0 0 2px; }
.notif-item__msg   { font-size: 12px; color: #8aada9; margin: 0 0 4px; line-height: 1.4; }
.notif-item__time  { font-size: 11px; color: #4a6e6a; }

/* User */
.topbar__user      { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.topbar__user-info { display: flex; flex-direction: column; align-items: flex-end; }
.topbar__user-name { font-size: 13px; font-weight: 600; color: #D6EDE8; }
.topbar__user-role { font-size: 11px; color: #8aada9; }
.topbar__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: #5C8C6A;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
</style>