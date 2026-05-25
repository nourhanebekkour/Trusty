<template>
  <aside class="professor-sidebar">
    <nav class="professor-sidebar__nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="professor-sidebar__link"
      >
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="professor-sidebar__bottom">
      <RouterLink to="/settings" class="professor-sidebar__link">
        Paramètres
      </RouterLink>

      <button class="professor-sidebar__logout" type="button" @click="logout">
        Déconnexion
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authstore'

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

function logout() {
  if (typeof auth.logout === 'function') {
    auth.logout()
  } else {
    localStorage.removeItem('token')
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
  padding: 18px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 90;
}

.professor-sidebar__nav,
.professor-sidebar__bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.professor-sidebar__bottom {
  border-top: 1px solid #E5E0D6;
  padding-top: 12px;
}

.professor-sidebar__link {
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  border-radius: 8px;
  color: #263534;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.professor-sidebar__link:hover {
  background: #F4F2EC;
}

.professor-sidebar__link.router-link-active {
  background: #D6EDE8;
  color: #5C8C6A;
}

.professor-sidebar__logout {
  min-height: 40px;
  border: none;
  background: transparent;
  color: #D94A4A;
  text-align: left;
  padding: 0 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.professor-sidebar__logout:hover {
  background: #FBECEC;
}
</style>