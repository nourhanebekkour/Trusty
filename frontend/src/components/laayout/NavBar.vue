<template>
  <div class="navbar-wrapper">
    <nav class="navbar">
      <div class="navbar-left">
        <img :src="iconTrusty" class="logo-icon" alt="Trusty" />
        <span class="logo-text">TRUSTY</span>
      </div>

      <div class="navbar-right">
        <button class="notif-wrap" type="button" aria-label="Ouvrir les notifications" @click="router.push('/notifications')">
          <img :src="iconNotifications" class="notif-icon" alt="notifications" />
          <span v-if="unreadCount > 0" class="notif-badge">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <button class="theme-toggle" @click="theme.toggle()" :title="theme.isDark ? 'Mode clair' : 'Mode sombre'" type="button">
          <svg v-if="theme.isDark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>

        <div class="divider"></div>

        <div class="user-info">
          <div class="user-text">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>

          <div v-if="!userAvatar" class="user-avatar">
            {{ userInitials }}
          </div>
          <img
            v-else
            :src="userAvatar"
            class="user-avatar user-avatar--img"
            alt="photo profil"
          />
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'
import { useThemeStore } from '@/stores/themeStore'
import { getStudentNotifications } from '@/services/studentNotificationService'
import iconTrusty        from '@/assets/icons/trusty.svg'
import iconNotifications from '@/assets/icons/notifications.svg'

const authStore = useAuthStore()
const theme = useThemeStore()
const router = useRouter()
const unreadCount = ref(0)

onMounted(async () => {
  if (typeof authStore.fetchProfile === 'function') {
    await authStore.fetchProfile()
  } else if (!authStore.user && typeof authStore.fetchUser === 'function') {
    await authStore.fetchUser()
  }

  try {
    const notifications = await getStudentNotifications()
    unreadCount.value = notifications.filter(notification => !notification.est_lue).length
  } catch {
    unreadCount.value = 0
  }
})

const userName = computed(() => {
  const user = authStore.user
  if (!user) return 'YEL'
  return user.name || `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || 'YEL'
})

const userRole = computed(() => {
  const user = authStore.user
  const roles = {
    ETUDIANT: 'Étudiant',
    PROFESSEUR: 'Professeur',
    ADMINISTRATEUR: 'Administrateur',
    PROFESSIONNEL: 'Professionnel',
  }

  return user?.role ?? user?.specialite ?? roles.ETUDIANT
})

const userAvatar = computed(() => authStore.user?.avatar ?? authStore.user?.photo ?? null)

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return ''

  const source = user.name || `${user.prenom ?? ''} ${user.nom ?? ''}`.trim()
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
})
</script>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  left: 0;
}

.navbar {
  height: 60px;
  background: color-mix(in srgb, var(--color-surface) 86%, transparent);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 8px 24px rgba(15, 27, 45, 0.07);
  backdrop-filter: blur(14px) saturate(125%);
  -webkit-backdrop-filter: blur(14px) saturate(125%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: 1.5px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.theme-toggle:hover {
  background: var(--color-surface-hover);
  color: var(--color-accent);
}
.theme-toggle:active {
  transform: scale(0.92);
}

.notif-wrap {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
}

.notif-icon {
  width: 22px;
  height: 22px;
}

.notif-badge {
  position: absolute;
  top: -7px;
  right: -8px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  background: var(--color-accent);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  line-height: 17px;
  text-align: center;
  border-radius: 999px;
  border: 1.5px solid var(--color-surface);
}

.divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-text {
  text-align: right;
  color: var(--color-text-primary);
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-role {
  font-size: 12px;
  color: var(--color-text-muted);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-border-hover);
  background: var(--color-accent);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar--img {
  object-fit: cover;
  background: transparent;
}
</style>
