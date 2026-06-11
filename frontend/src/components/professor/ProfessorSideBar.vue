<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">

    <div class="sidebar-header">
      <button class="toggle-btn" @click="toggleSidebar">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6"  x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/professor" class="nav-item">
        <img :src="iconProjets" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Projets à valider</span>
      </router-link>

      <router-link to="/professor" class="nav-item">
        <img :src="iconStages" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Stages à valider</span>
      </router-link>

      <router-link to="/professor" class="nav-item">
        <img :src="iconProfile" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Mes étudiants</span>
      </router-link>

      <router-link to="/professor" class="nav-item">
        <img :src="iconRecommandations" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Recommandations</span>
      </router-link>

      <router-link to="/professor" class="nav-item">
        <img :src="iconNotifications" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Notifications</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <router-link to="/professor" class="nav-item">
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
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import { useRouter } from 'vue-router'

import iconProjets         from '@/assets/icons/projets.svg'
import iconStages          from '@/assets/icons/stages.svg'
import iconProfile         from '@/assets/icons/profile.svg'
import iconRecommandations from '@/assets/icons/recommandations.svg'
import iconNotifications   from '@/assets/icons/notifications.svg'
import iconSettings        from '@/assets/icons/settings.svg'
import iconLogout          from '@/assets/icons/logout.svg'

const isCollapsed = ref(false)
const authStore   = useAuthStore()
const router      = useRouter()

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  width: 235px;
  background-color: #3D3D3D;
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
  background: #0D2B2B;
  border: none;
  cursor: pointer;
  color: #D6EDE8;
  padding: 8px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background-color: #EDEADE;
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
  color: #D6EDE8;
  background-color: #0D2B2B;
  font-family: Inter, sans-serif;
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
  background: #E5E1D5;
}

.router-link-active {
  background-color: #5C8C6A;
  color: white;
}

.router-link-active .nav-icon {
  filter: brightness(0) invert(1);
}

.nav-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-bottom {
  padding: 10px 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
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
  color: red;
}
</style>
