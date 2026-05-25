<template>
  <aside class="professor-sidebar">
    <div class="professor-sidebar__content">
      <div class="professor-sidebar__section">
        <p class="professor-sidebar__section-title">Espace professeur</p>

        <nav class="professor-sidebar__nav">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="professor-sidebar__link"
            :class="{ 'professor-sidebar__link--active': isActive(item.path) }"
          >
            <span class="professor-sidebar__icon"></span>
            <span class="professor-sidebar__label">{{ item.label }}</span>

            <span
              v-if="item.badge"
              class="professor-sidebar__badge"
            >
              {{ item.badge }}
            </span>
          </RouterLink>
        </nav>
      </div>
    </div>

    <div class="professor-sidebar__bottom">
      <RouterLink
        to="/settings"
        class="professor-sidebar__link"
        :class="{ 'professor-sidebar__link--active': isActive('/settings') }"
      >
        <span class="professor-sidebar__icon"></span>
        <span class="professor-sidebar__label">Paramètres</span>
      </RouterLink>

      <button
        class="professor-sidebar__logout"
        type="button"
        @click="handleLogout"
      >
        Déconnexion
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const navItems = [
  {
    label: 'Dashboard',
    path: '/professor/dashboard',
  },
  {
    label: 'Portfolios',
    path: '/professor/portfolios',
  },
  {
    label: 'Validations',
    path: '/professor/validations',
  },
  {
    label: 'Messages',
    path: '/professor/messages',
  },
  {
    label: 'Notifications',
    path: '/professor/notifications',
  },
  {
    label: 'Recommandations',
    path: '/professor/recommendations',
  },
]

function isActive(path) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function handleLogout() {
  if (typeof auth.logout === 'function') {
    await auth.logout()
  } else {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  }

  router.push('/login')
}
</script>

<style scoped>
.professor-sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  width: 210px;
  height: calc(100vh - 64px);
  background: #ffffff;
  border-right: 1px solid #E5E0D6;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 12px;
  z-index: 90;
}

.professor-sidebar__content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.professor-sidebar__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.professor-sidebar__section-title {
  margin: 0 0 4px;
  padding: 0 12px;
  color: #6F7F7C;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.professor-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.professor-sidebar__link {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-radius: 8px;
  color: #263534;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s ease, color 0.15s ease;
}

.professor-sidebar__link:hover {
  background: #F4F2EC;
}

.professor-sidebar__link--active {
  background: #D6EDE8;
  color: #5C8C6A;
}

.professor-sidebar__icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E5E0D6;
  flex-shrink: 0;
}

.professor-sidebar__link--active .professor-sidebar__icon {
  background: #5C8C6A;
}

.professor-sidebar__label {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.professor-sidebar__badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #0D2B2B;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
}

.professor-sidebar__bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid #E5E0D6;
}

.professor-sidebar__logout {
  min-height: 40px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #D94A4A;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.professor-sidebar__logout:hover {
  background: #FBECEC;
}

@media (max-width: 900px) {
  .professor-sidebar {
    position: static;
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #E5E0D6;
  }

  .professor-sidebar__nav {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .professor-sidebar__bottom {
    display: none;
  }
}
</style>