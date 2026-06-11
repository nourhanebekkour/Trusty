<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img :src="iconTrusty" class="logo-icon" alt="Trusty" />
      <span class="logo-text">TRUSTY</span>
    </div>

    <div class="navbar-right">
      <router-link to="/professional/notifications" class="notif-wrap">
        <img :src="iconNotifications" class="notif-icon" alt="notifications" />
        <span class="notif-badge"></span>
      </router-link>

      <button class="theme-toggle" @click="theme.toggle()" :title="theme.isDark ? 'Mode clair' : 'Mode sombre'" type="button">
        <svg v-if="theme.isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <div class="divider"></div>

      <router-link to="/professional/profile" class="user-info">
        <div class="user-text">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">Professionnel</div>
        </div>

        <div v-if="!userAvatar" class="user-avatar">
          {{ userInitials }}
        </div>
        <img v-else :src="userAvatar" class="user-avatar user-avatar--img" alt="photo profil" />
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import { useThemeStore } from '@/stores/themeStore'
import { getProfessionalProfile } from '@/services/professionalApi'
import iconTrusty from '@/assets/icons/trusty.svg'
import iconNotifications from '@/assets/icons/notifications.svg'

const authStore = useAuthStore()
const theme = useThemeStore()
const profile = ref(null)

onMounted(async () => {
  try {
    profile.value = await getProfessionalProfile()
  } catch {
    profile.value = null
  }
})

const userName = computed(() => {
  const p = profile.value
  if (!p) {
    const user = authStore.user
    if (!user) return 'Pro'
    return user.name || `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || 'Pro'
  }
  return p.fullName || p.name || `${p.prenom ?? ''} ${p.nom ?? ''}`.trim() || 'Pro'
})

const userAvatar = computed(() => {
  const p = profile.value
  return p?.photo || p?.avatar || authStore.user?.avatar || authStore.user?.photo || null
})

const userInitials = computed(() => {
  const p = profile.value
  const name = p?.fullName || p?.name || `${p?.prenom ?? ''} ${p?.nom ?? ''}`.trim() || authStore.user?.name || `${authStore.user?.prenom ?? ''} ${authStore.user?.nom ?? ''}`.trim()
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 60px;
  background: var(--color-surface, #FFFFFF);
  border-bottom: 1px solid var(--color-border, #D6D0C4);
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
  color: var(--color-text-primary, #0F1B2D);
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
  color: var(--color-text-secondary, #6B7280);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
}
.theme-toggle:hover {
  background: var(--color-surface-hover, #F0EDE6);
  color: var(--color-accent, #3D6B5E);
}
.theme-toggle:active {
  transform: scale(0.92);
}

.notif-wrap {
  position: relative;
  cursor: pointer;
  line-height: 0;
}

.notif-icon {
  width: 22px;
  height: 22px;
}

.notif-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: var(--color-accent, #3D6B5E);
  border-radius: 50%;
  border: 1.5px solid var(--color-surface, #FFFFFF);
}

.divider {
  width: 1px;
  height: 32px;
  background: var(--color-border, #D6D0C4);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-decoration: none;
}

.user-text {
  text-align: right;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary, #0F1B2D);
}

.user-role {
  font-size: 12px;
  color: var(--color-text-secondary, #6B7280);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-accent-light, #E8F2EF);
  background: var(--color-accent, #3D6B5E);
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

@media (max-width: 900px) {
  .navbar {
    left: 0;
    padding: 0 18px;
  }
  .user-text {
    display: none;
  }
}
</style>
