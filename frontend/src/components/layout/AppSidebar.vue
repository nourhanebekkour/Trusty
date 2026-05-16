<template>
  <aside class="sidebar">
    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.route"
        :to="item.route"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': isActive(item.route) }"
      >
        <span class="sidebar__icon" v-html="item.icon" />
        <span class="sidebar__label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar__bottom">
      <RouterLink to="/settings" class="sidebar__item sidebar__item--small">
        <span class="sidebar__icon"></span>
        <span class="sidebar__label">Paramètres</span>
      </RouterLink>
      <button class="sidebar__item sidebar__item--danger" @click="handleLogout">
        <span class="sidebar__icon">↪</span>
        <span class="sidebar__label">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authstore'

// Admin nav — swap this array per role if needed
const navItems = [
  {
    label: 'Dashboard',
    route: '/admin/dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`
  },
  {
    label: 'Utilisateurs',
    route: '/admin/utilisateurs',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    label: 'Vérifications',
    route: '/admin/verifications',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
  },
  {
    label: 'Portfolios',
    route: '/admin/portfolios',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
  },
  {
    label: 'Notifications',
    route: '/admin/notifications',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`
  },
]

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const isActive = (routePath) => route.path.startsWith(routePath)

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 160px;
  height: calc(100vh - 60px);
  background: #1A3838;
  border-right: 1px solid #2a4a48;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 8px;
  overflow-y: auto;
}
.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #8aada9;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}
.sidebar__item:hover:not(.sidebar__item--active) {
  background: #0f2424;
  color: #c8deda;
}
.sidebar__item--active {
  background: #1A3838;
  color: #5C8C6A;
  font-weight: 600;
}
.sidebar__item--active .sidebar__icon {
  color: #5C8C6A;
}
.sidebar__item--danger {
  color: #ef4444;
}
.sidebar__item--danger:hover {
  background: #fee2e2;
}
.sidebar__item--small {
  font-size: 12px;
}
.sidebar__icon {
  display: flex;
  align-items: center;
  min-width: 16px;
}
.sidebar__bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 12px;
  border-top: 1px solid #2a4a48;
}
</style>