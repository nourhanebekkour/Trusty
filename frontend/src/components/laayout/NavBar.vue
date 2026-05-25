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
import iconTrusty        from '@/assets/icons/trusty.svg'
import iconNotifications from '@/assets/icons/notifications.svg'

const authStore = useAuthStore()


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
  color: #D6EDE8;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #D6EDE8;
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
