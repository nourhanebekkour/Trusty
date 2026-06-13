<template>
  <Teleport to="body">
    <div v-if="isMobileOpen" class="sidebar-overlay" @click="closeMobile"></div>
  </Teleport>

  <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }">

    <div class="sidebar-header">
      <button class="toggle-btn" @click="toggleSidebar">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6"  x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <button class="mobile-close-btn" @click="closeMobile" type="button">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/professor/dashboard" class="nav-item" @click="closeMobile">
        <img :src="iconDashboard" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Dashboard</span>
      </router-link>

      <router-link to="/professor/validations" class="nav-item" @click="closeMobile">
        <img :src="iconCertifie" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Validations</span>
      </router-link>

      <router-link to="/professor/portfolios" class="nav-item" @click="closeMobile">
        <img :src="iconPortfolio" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Portfolios</span>
      </router-link>

      <router-link to="/professor/notifications" class="nav-item" @click="closeMobile">
        <img :src="iconNotifications" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Notifications</span>
      </router-link>

      <router-link to="/professor/recommandations" class="nav-item" @click="closeMobile">
        <img :src="iconRecommandations" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Recommandation</span>
      </router-link>

      <router-link to="/professor/profile" class="nav-item" @click="closeMobile">
        <img :src="iconProfile" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Mon Profil</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <router-link to="/professor/settings" class="nav-item" @click="closeMobile">
        <img :src="iconSettings" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Paramètres</span>
      </router-link>

      <button class="nav-item logout-btn" @click="handleLogout">
        <img :src="iconLogout" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Déconnexion</span>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { inject } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import { useRouter } from 'vue-router'

import iconDashboard       from '@/assets/icons/dashboard.svg'
import iconCertifie        from '@/assets/icons/certifie.svg'
import iconPortfolio       from '@/assets/icons/portfoliocomplet.svg'
import iconNotifications   from '@/assets/icons/notifications.svg'
import iconRecommandations from '@/assets/icons/recommandations.svg'
import iconProfile         from '@/assets/icons/profile.svg'
import iconSettings        from '@/assets/icons/settings.svg'
import iconLogout          from '@/assets/icons/logout.svg'

const isCollapsed  = inject('sidebarCollapsed')
const isMobileOpen = inject('sidebarMobileOpen')
const authStore    = useAuthStore()
const router       = useRouter()

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

function closeMobile() {
  isMobileOpen.value = false
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 235px;
  background: var(--color-surface, #FFFFFF);
  border-right: 1px solid var(--color-border, #D6D0C4);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease;
  min-height: 100%;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 16px 16px 0 16px;
  display: flex;
  justify-content: flex-start;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 16px 0 0 0;
}

.toggle-btn {
  background: var(--color-surface-hover, #F0EDE6);
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary, #6B7280);
  padding: 8px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background: var(--color-surface-alt, #FAFAF8);
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
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0;
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

.router-link-active .nav-icon {
  filter: none;
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
  justify-content: flex-start;
}

.sidebar.collapsed .logout-btn {
  justify-content: center;
}

.logout-btn:hover {
  color: var(--color-danger, #ef4444);
}

.mobile-close-btn { display: none; }

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 998;
}

@media (max-width: 768px) {
  .sidebar {
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
  .mobile-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--color-text-secondary, #6B7280);
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
    border-radius: 6px;
  }
  .mobile-close-btn:hover {
    background: var(--color-surface-hover, #F0EDE6);
  }
  .sidebar-header {
    justify-content: space-between;
  }
}
</style>