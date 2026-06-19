<template>
  <Teleport to="body">
    <div v-if="isMobileOpen" class="sidebar-overlay" @click="closeMobile"></div>
  </Teleport>

  <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': isMobileOpen }">
    <div class="sidebar-header">
      <button class="toggle-btn" @click="toggleCollapsed">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      <button class="mobile-close-btn" @click="closeMobile">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div v-show="!isCollapsed" class="sidebar-badge">
        <span v-if="authStore.isSuperAdmin" class="badge badge--super">Super Admin</span>
        <span v-else class="badge badge--admin">Admin</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/admin/dashboard" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Dashboard</span>
      </router-link>
      <router-link to="/admin/utilisateurs" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Utilisateurs</span>
      </router-link>
      <router-link to="/admin/verifications" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Vérifications</span>
      </router-link>
      <router-link to="/admin/portfolios" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Étudiants</span>
      </router-link>
      <router-link to="/admin/notifications" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Notifications</span>
      </router-link>
      <router-link to="/admin/badges" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M12 14v8"/><path d="M8 18h8"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Badges</span>
      </router-link>
      <router-link to="/admin/historique" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Historique</span>
      </router-link>
      <router-link to="/admin/profil" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Profil</span>
      </router-link>
    </nav>

    <div class="sidebar-bottom">
      <router-link to="/admin/settings" class="nav-item">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.06V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-.33-1.06 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.06-.33H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.15 9a1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.19 3.3l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.06V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.15a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.24.36.6.6 1 .6h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1 .6z"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Paramètres</span>
      </router-link>
      <button class="nav-item logout-btn" @click="handleLogout">
        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span class="nav-label" v-show="!isCollapsed">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authstore'
import { useRouter } from 'vue-router'
import { useSidebar } from '@/composables/useSidebar'

const { isMobileOpen, closeMobile } = useSidebar()
const isCollapsed   = ref(false)
const authStore     = useAuthStore()
const router        = useRouter()

function toggleCollapsed() {
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
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease;
  min-height: 100%;
}
.sidebar.collapsed { width: 70px; }

.sidebar-header {
  padding: 16px 16px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-badge { flex-shrink: 0; }

.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.badge--super {
  background: #EAB308 !important;
  color: #000000 !important;
  box-shadow: 0 0 8px rgba(234, 179, 8, 0.5);
}

.badge--admin {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 16px 0 0 0;
}

.toggle-btn {
  background: var(--color-surface-hover);
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: 8px 14px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-btn:hover {
  background-color: var(--color-surface-alt);
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
  color: var(--color-text-secondary);
  background-color: transparent;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 22px;
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
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.router-link-active {
  background-color: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 600;
}

.sidebar-bottom {
  padding: 10px 8px;
  border-top: 1px solid var(--color-border);
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
  color: var(--color-danger);
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
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 4px;
    margin-left: auto;
  }
  .toggle-btn { display: none; }
}
</style>
