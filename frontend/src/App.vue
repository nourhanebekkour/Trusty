<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SideBar from './components/laayout/SideBar.vue'
import NavBar from './components/laayout/NavBar.vue'
import AppFooter from './components/laayout/Footer.vue'
import { useAuthStore } from './stores/authstore'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const route = useRoute()

onMounted(async () => {
  await authStore.fetchUser()
})

// Routes qui utilisent le layout complet (sidebar + navbar)
const studentRoutes = [
  'dashboard', 'notifications', 'profile', 'projets',
  'settings', 'recommendations', 'stage', 'modele', 'portfolio'
]

const isPublicPage = computed(() =>
  ['home', 'login', 'about', 'professional', 'professor'].includes(route.name)
)

const isAdminPage = computed(() => route.path.startsWith('/admin'))

const isStudentPage = computed(() => {
  const studentPaths = [
    '/dashboard', '/notifications', '/profile', '/projets',
    '/settings', '/recommendations', '/stage', '/modele', '/portfolio'
  ]
  return studentPaths.some(p => route.path.startsWith(p))
})
</script>

<template>
  <!-- ── Pages publiques : home, login, about ── -->
  <div v-if="isPublicPage">
    <RouterView />
  </div>

  <!-- ── Pages Admin : layout géré par AdminLayout ── -->
  <div v-else-if="isAdminPage">
    <RouterView />
  </div>

  <!-- ── Pages Étudiant : navbar + sidebar + footer ── -->
  <div v-else-if="isStudentPage" class="app">
    <NavBar />
    <div class="layout">
      <SideBar />
      <main class="content">
        <RouterView />
      </main>
    </div>
    <AppFooter />
  </div>

  <!-- ── Fallback ── -->
  <div v-else>
    <RouterView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.layout {
  display: flex;
  flex: 1;
  width: 100%;
  align-items: stretch;
  min-height: 0;
  background-color: #F4F2EC;
}

.content {
  flex: 1;
  padding: 0px;
  background-color: #0D2B2B;
  overflow-y: auto;
  min-height: 0;
}
</style>