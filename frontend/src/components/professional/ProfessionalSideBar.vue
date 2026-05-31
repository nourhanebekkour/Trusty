<template>
  <aside class="professional-sidebar">
    <nav class="professional-sidebar__nav" aria-label="Navigation professionnel">
      <RouterLink
        v-for="item in navItems"
        :key="item.route"
        :to="item.route"
        class="professional-sidebar__item"
        :class="{ 'professional-sidebar__item--active': isActive(item.route) }"
      >
        <span class="professional-sidebar__dot"></span>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="professional-sidebar__bottom">
      <RouterLink
        to="/settings"
        class="professional-sidebar__item"
        :class="{ 'professional-sidebar__item--active': isActive('/settings') }"
      >
        <span class="professional-sidebar__dot"></span>
        <span>Parametres</span>
      </RouterLink>

      <button class="professional-sidebar__logout" type="button" @click="handleLogout">
        Deconnexion
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { label: 'Dashboard', route: '/professional/dashboard' },
  { label: 'Recommandations', route: '/professional/recommandations' },
  { label: 'Notifications', route: '/professional/notifications' },
]

function isActive(routePath) {
  return route.path === routePath || route.path.startsWith(`${routePath}/`)
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.professional-sidebar {
  width: 220px;
  background: #f4f2ec;
  border-right: 1px solid #d8d2c6;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 100%;
  padding: 18px 12px;
}

.professional-sidebar__nav,
.professional-sidebar__bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.professional-sidebar__bottom {
  padding-top: 14px;
  border-top: 1px solid #d8d2c6;
}

.professional-sidebar__item,
.professional-sidebar__logout {
  width: 100%;
  min-height: 42px;
  border: none;
  border-radius: 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 11px;
  background: transparent;
  color: #46615c;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.professional-sidebar__item:hover {
  background: #e8f0ec;
  color: #0d2b2b;
}

.professional-sidebar__item--active {
  background: #d6ede8;
  color: #0d2b2b;
}

.professional-sidebar__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b7c8c1;
}

.professional-sidebar__item--active .professional-sidebar__dot {
  background: #5c8c6a;
}

.professional-sidebar__logout {
  color: #b54747;
}

.professional-sidebar__logout:hover {
  background: #f8e8e5;
  color: #9d2f2f;
}

@media (max-width: 900px) {
  .professional-sidebar {
    width: 100%;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid #d8d2c6;
  }

  .professional-sidebar__nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
