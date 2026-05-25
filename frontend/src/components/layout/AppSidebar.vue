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
        <span class="sidebar__icon" v-html="item.icon"></span>
        <span class="sidebar__label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar__bottom">
      <RouterLink
        to="/settings"
        class="sidebar__item sidebar__item--small"
        :class="{ 'sidebar__item--active': isActive('/settings') }"
      >
        <span class="sidebar__icon" v-html="settingsIcon"></span>
        <span class="sidebar__label">Paramètres</span>
      </RouterLink>

      <button class="sidebar__item sidebar__item--danger" type="button" @click="handleLogout">
        <span class="sidebar__icon" v-html="logoutIcon"></span>
        <span class="sidebar__label">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authstore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  {
    label: 'Dashboard',
    route: '/admin/dashboard',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
      </svg>
    `,
  },
  {
    label: 'Utilisateurs',
    route: '/admin/utilisateurs',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    `,
  },
  {
    label: 'Vérifications',
    route: '/admin/verifications',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    `,
  },
  {
    label: 'Portfolios',
    route: '/admin/portfolios',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    `,
  },
  {
    label: 'Notifications',
    route: '/admin/notifications',
    icon: `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    `,
  },
]

const settingsIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.06V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-.33-1.06 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.06-.33H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.15 9a1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.19 3.3l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.06V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.15a1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.24.36.6.6 1 .6h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1 .6z"/>
  </svg>
`

const logoutIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
`

function isActive(routePath) {
  return route.path === routePath || route.path.startsWith(`${routePath}/`)
}

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
  z-index: 90;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  border-top: 1px solid #2a4a48;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8aada9;
  font-size: 13px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.sidebar__item:hover:not(.sidebar__item--active) {
  background: #0f2424;
  color: #c8deda;
}

.sidebar__item--active {
  background: #0f2424;
  color: #5C8C6A;
  font-weight: 600;
}

.sidebar__item--danger {
  color: #ef4444;
}

.sidebar__item--danger:hover {
  background: #3a1a1a;
  color: #f87171;
}

.sidebar__item--small {
  font-size: 12px;
}

.sidebar__icon {
  width: 16px;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>