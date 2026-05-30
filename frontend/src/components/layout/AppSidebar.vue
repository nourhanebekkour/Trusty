<template>
  <aside class="sidebar">
    <nav class="sidebar__nav" aria-label="Navigation administrateur">
      <RouterLink
        v-for="item in navItems"
        :key="item.route"
        :to="item.route"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': isActive(item.route) }"
      >
        <component :is="item.icon" :size="18" class="sidebar__icon" />
        <span class="sidebar__label">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar__bottom">
      <RouterLink
        to="/settings"
        class="sidebar__item sidebar__item--small"
        :class="{ 'sidebar__item--active': isActive('/settings') }"
      >
        <Settings :size="18" class="sidebar__icon" />
        <span class="sidebar__label">Parametres</span>
      </RouterLink>

      <button class="sidebar__item sidebar__item--danger" type="button" @click="handleLogout">
        <LogOut :size="18" class="sidebar__icon" />
        <span class="sidebar__label">Deconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import {
  Bell,
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/authstore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  { label: 'Dashboard', route: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Utilisateurs', route: '/admin/utilisateurs', icon: Users },
  { label: 'Verifications', route: '/admin/verifications', icon: ShieldCheck },
  { label: 'Portfolios', route: '/admin/portfolios', icon: BriefcaseBusiness },
  { label: 'Notifications', route: '/admin/notifications', icon: Bell },
]

function isActive(routePath) {
  return route.path === routePath || route.path.startsWith(`${routePath}/`)
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 220px;
  height: calc(100vh - 60px);
  background: #f4f2ec;
  border-right: 1px solid #d8d2c6;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 12px;
  overflow-y: auto;
  z-index: 90;
}

.sidebar__nav,
.sidebar__bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar__bottom {
  padding-top: 14px;
  border-top: 1px solid #d8d2c6;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #46615c;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.sidebar__item:hover:not(.sidebar__item--active) {
  background: #e8f0ec;
  color: #0d2b2b;
}

.sidebar__item--active {
  background: #d6ede8;
  color: #0d2b2b;
}

.sidebar__item--danger {
  color: #b54747;
}

.sidebar__item--danger:hover {
  background: #f8e8e5;
  color: #9d2f2f;
}

.sidebar__item--small {
  font-size: 12px;
}

.sidebar__icon {
  width: 18px;
  min-width: 18px;
}

.sidebar__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #d8d2c6;
  }

  .sidebar__nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
