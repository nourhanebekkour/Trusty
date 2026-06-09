<template>
  <aside class="sidebar">

    <nav class="sidebar-nav">
      <router-link to="/professional/dashboard" class="nav-item">
        <img :src="iconDashboard" class="nav-icon" />
        <span class="nav-label">Dashboard</span>
      </router-link>

      <router-link to="/professional/recommandations" class="nav-item">
        <img :src="iconRecommandations" class="nav-icon" />
        <span class="nav-label">Recommandations</span>
      </router-link>

      <router-link to="/professional/commentaires" class="nav-item">
        <img :src="iconShare" class="nav-icon" />
        <span class="nav-label">Commentaires</span>
      </router-link>

      <router-link to="/professional/notifications" class="nav-item">
        <img :src="iconNotifications" class="nav-icon" />
        <span class="nav-label">Notifications</span>
      </router-link>

      <router-link to="/professional/historique" class="nav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="nav-icon">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="nav-label">Historique</span>
      </router-link>

      <router-link to="/professional/stages" class="nav-item">
        <img :src="iconStages" class="nav-icon" />
        <span class="nav-label">Stages</span>
      </router-link>

      <router-link to="/professional/projets" class="nav-item">
        <img :src="iconProjets" class="nav-icon" />
        <span class="nav-label">Projets</span>
      </router-link>

      <router-link to="/professional/etudiants" class="nav-item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="nav-icon">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span class="nav-label">Étudiants</span>
      </router-link>

      <router-link to="/professional/portfolios" class="nav-item">
        <img :src="iconPortfolio" class="nav-icon" />
        <span class="nav-label">Portfolios</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <router-link to="/professional/profile" class="nav-item">
        <img :src="iconProfile" class="nav-icon" />
        <span class="nav-label">Mon Profil</span>
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

import iconDashboard       from '@/assets/icons/dashboard.svg'
import iconProfile         from '@/assets/icons/profile.svg'
import iconStages          from '@/assets/icons/stages.svg'
import iconProjets         from '@/assets/icons/projets.svg'
import iconLogout          from '@/assets/icons/logout.svg'
import iconRecommandations from '@/assets/icons/recommandations.svg'
import iconNotifications   from '@/assets/icons/notifications.svg'
import iconPortfolio       from '@/assets/icons/portfoliocomplet.svg'
import iconShare           from '@/assets/icons/share.svg'

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