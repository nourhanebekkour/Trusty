<template>
  <div class="navbar-wrapper">
    <nav class="navbar">
      <div class="navbar-left">
        <img :src="iconTrusty" class="logo-icon" alt="Trusty" />
        <span class="logo-text">TRUSTY</span>
      </div>

      <div class="navbar-right">
        <div class="notif-wrap">
          <img :src="iconNotifications" class="notif-icon" alt="notifications" />
          <span class="notif-badge"></span>
        </div>

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

          <!-- Avatar image si disponible, sinon initiales -->
          <div class="user-avatar" v-if="!userAvatar">
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
import { computed } from 'vue'  
import { useAuthStore } from '@/stores/authstore'
import { useThemeStore } from '@/stores/themeStore'
import iconTrusty        from '@/assets/icons/trusty.svg'
import iconNotifications from '@/assets/icons/notifications.svg'

const authStore = useAuthStore()
const theme = useThemeStore()


const userName = computed(() => {
  const u = authStore.user
  if (!u) return ''
  return `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || 'Utilisateur'
})

const userRole = computed(() => {
  const roles = {
    ETUDIANT:       'Étudiant',
    PROFESSEUR:     'Professeur',
    ADMINISTRATEUR: 'Administrateur',
    PROFESSIONNEL:  'Professionnel',
  }
  return roles[authStore.user?.role] ?? 'Étudiant'
})

const userAvatar = computed(() => authStore.user?.photo ?? null)

const userInitials = computed(() => {
  const p = authStore.user?.prenom?.[0] ?? ''
  const n = authStore.user?.nom?.[0]    ?? ''
  return (p + n).toUpperCase() || '?'
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
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
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
}

.notif-icon {
  width: 22px;
  height: 22px;
}

.notif-badge {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
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

/* Avatar initiales */
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

/* Avatar image */
.user-avatar--img {
  object-fit: cover;
  background: transparent;
}
</style>
