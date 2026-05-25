<template>
  <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
    
    <div class="sidebar-header">
      <button class="toggle-btn" @click="toggleSidebar">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/dashboard" class="nav-item">
        <img :src="iconDashboard" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Dashboard</span>
      </router-link>

      <router-link to="/profile" class="nav-item">
         <img :src="iconProfile" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Mon Profil</span>
      </router-link>

      <router-link to="/parcours" class="nav-item">
        <img :src="iconParcours" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Parcours</span>
      </router-link>

      <router-link to="/stage" class="nav-item">
        <img :src="iconStages" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Stages</span>
      </router-link>

      <router-link to="/projets" class="nav-item">
        <img :src="iconProjets" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Projets</span>
      </router-link>

      <router-link to="/recommendations" class="nav-item">
        <img :src="iconRecommandations" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Recommandations</span>
      </router-link>

      <router-link to="/notifications" class="nav-item">
        <img :src="iconNotifications" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Notifications</span>
      </router-link>

      <router-link to="/activites" class="nav-item">
        <img :src="iconModeles" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Activités parascolaires</span>
      </router-link> 

      <router-link to="/portfolio" class="nav-item">
        <img :src="iconPortfolioComplet" class="nav-icon" />
        <span class="nav-label" v-show="!isCollapsed">Portfolio Complet</span>
      </router-link>
    </nav>
    
    <div class="sidebar-bottom">
      <router-link to="/Settings" class="nav-item">
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

import iconDashboard        from '@/assets/icons/dashboard.svg'
import iconProfile          from '@/assets/icons/profile.svg'
import iconParcours         from '@/assets/icons/parcours.svg'
import iconStages           from '@/assets/icons/stages.svg'
import iconProjets          from '@/assets/icons/projets.svg'
import iconSettings         from '@/assets/icons/settings.svg'
import iconLogout           from '@/assets/icons/logout.svg'
import iconRecommandations  from '@/assets/icons/recommandations.svg'
import iconNotifications    from '@/assets/icons/notifications.svg'
import iconModeles          from '@/assets/icons/modeles.svg'
import iconPortfolioComplet from '@/assets/icons/portfoliocomplet.svg'

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
/* Dans votre composant Sidebar.vue */
/* Dans SideBar.vue */
/* Dans SideBar.vue */
.sidebar {
  width: 235px;
  background-color: #3D3D3D;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease;
  
  /* MODIFIEZ CETTE LIGNE */
  min-height: 100%; /* Au lieu de 100vh fixe */
}
/* Style de la sidebar quand elle est réduite */
.sidebar.collapsed {
  width: 70px; 
}

/* En-tête pour le bouton toggle */
.sidebar-header {
  padding: 16px 16px 0 16px;
  display: flex;
  justify-content: flex-start; /* <-- Changement ici : le bouton s'aligne à gauche */
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
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left:14px ;
  padding-right:14px ;
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
  /* J'ai supprimé les top/left bizarres et mis une largeur flexible */
  width: 100%; 
  box-sizing: border-box;
  height: 40px; 
  padding: 0 12px; 
  color: #D6EDE8;
  background-color: #0D2B2B;
  font-family: Inter, sans-serif; 
  font-size: 14px; 
  line-height: 22px; 
  font-weight: 400;
  border: none; 
  border-radius: 10px; 
  text-decoration: none;
  white-space: nowrap; /* Empêche le texte de passer à la ligne */
  transition: all 0.2s ease;
}

/* Style des items quand la sidebar est réduite */
.sidebar.collapsed .nav-item {
  justify-content: center; /* Centre l'icône */
  padding: 0;
}

.nav-item:hover {
  background: #E5E1D5; /* Couleur hover légèrement plus foncée */
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
  border-top: 1px solid rgba(0,0,0,0.1);  
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