<template>
  <aside class="sidebar">

    <nav class="sidebar-nav">
      <router-link to="/professional/profile" class="nav-item">
        <img :src="iconProfile" class="nav-icon" />
        <span class="nav-label">Profil</span>
      </router-link>

      <router-link to="/professional/recommandations" class="nav-item">
        <img :src="iconRecommandations" class="nav-icon" />
        <span class="nav-label">Recommandations</span>
      </router-link>

      <router-link to="/professional/portfolios" class="nav-item">
        <img :src="iconPortfolio" class="nav-icon" />
        <span class="nav-label">Portfolio</span>
      </router-link>

      <router-link to="/professional/notifications" class="nav-item">
        <img :src="iconNotifications" class="nav-icon" />
        <span class="nav-label">Notifications</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <router-link to="/professional/settings" class="nav-item">
        <img :src="iconSettings" class="nav-icon" />
        <span class="nav-label">Paramètres</span>
      </router-link>

      <button class="nav-item logout-btn" @click="handleLogout">
        <img :src="iconLogout" class="nav-icon" />
        <span class="nav-label">Déconnexion</span>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { useAuthStore } from '@/stores/authstore'
import { useRouter } from 'vue-router'

import iconProfile         from '@/assets/icons/profile.svg'
import iconRecommandations from '@/assets/icons/recommandations.svg'
import iconPortfolio       from '@/assets/icons/portfoliocomplet.svg'
import iconNotifications   from '@/assets/icons/notifications.svg'
import iconSettings        from '@/assets/icons/settings.svg'
import iconLogout          from '@/assets/icons/logout.svg'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 235px;
  min-height: 100%;
  background: var(--color-surface, #FFFFFF);
  border-right: 1px solid var(--color-border, #D6D0C4);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  height: 40px;
  padding: 0 12px;
  color: var(--color-text-secondary, #6B7280);
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  border: none;
  border-radius: 10px;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  background: var(--color-surface-hover, #F0EDE6);
  color: var(--color-text-primary, #0F1B2D);
}

.router-link-active {
  background: var(--color-accent-light, #E8F2EF);
  color: var(--color-accent, #3D6B5E);
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-bottom {
  padding: 10px 8px;
  border-top: 1px solid var(--color-border, #D6D0C4);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.logout-btn {
  cursor: pointer;
}

.logout-btn:hover {
  color: var(--color-danger, #ef4444);
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
}
</style>
