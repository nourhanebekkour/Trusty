<template>
  <Teleport to="body">
    <div v-if="isMobileOpen" class="sidebar-overlay" @click="closeMobile"></div>
  </Teleport>

  <aside class="sidebar" :class="{ 'mobile-open': isMobileOpen }">
    <div class="sidebar-header-mobile">
      <span class="sidebar-title">Menu</span>
      <button class="mobile-close-btn" @click="closeMobile" type="button">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/professional/profile" class="nav-item" @click="closeMobile">
        <img :src="iconProfile" class="nav-icon" />
        <span class="nav-label">Profil</span>
      </router-link>

      <router-link to="/professional/recommandations" class="nav-item" @click="closeMobile">
        <img :src="iconRecommandations" class="nav-icon" />
        <span class="nav-label">Recommandations</span>
      </router-link>

      <router-link to="/professional/portfolios" class="nav-item" @click="closeMobile">
        <img :src="iconPortfolio" class="nav-icon" />
        <span class="nav-label">Portfolio</span>
      </router-link>

      <router-link to="/professional/notifications" class="nav-item" @click="closeMobile">
        <img :src="iconNotifications" class="nav-icon" />
        <span class="nav-label">Notifications</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <router-link to="/professional/settings" class="nav-item" @click="closeMobile">
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
import { useProfessionalSidebar } from '@/composables/useProfessionalSidebar'

import iconProfile         from '@/assets/icons/profile.svg'
import iconRecommandations from '@/assets/icons/recommandations.svg'
import iconPortfolio       from '@/assets/icons/portfoliocomplet.svg'
import iconNotifications   from '@/assets/icons/notifications.svg'
import iconSettings        from '@/assets/icons/settings.svg'
import iconLogout          from '@/assets/icons/logout.svg'

const { isMobileOpen, closeMobile } = useProfessionalSidebar()
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

.sidebar-header-mobile {
  display: none;
  padding: 16px;
  border-bottom: 1px solid var(--color-border, #D6D0C4);
  align-items: center;
  justify-content: space-between;
}
.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary, #0F1B2D);
}
.mobile-close-btn {
  display: none;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--color-text-secondary, #6B7280);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.mobile-close-btn:hover {
  background: var(--color-surface-hover, #F0EDE6);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 998;
}

@media (max-width: 900px) {
  .sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 999;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    width: 260px;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  .sidebar-overlay {
    display: block;
  }
  .sidebar-header-mobile {
    display: flex;
  }
  .mobile-close-btn {
    display: flex;
  }
}
</style>
