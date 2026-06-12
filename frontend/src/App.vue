<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import SideBar from './components/laayout/SideBar.vue'
import NavBar from './components/laayout/NavBar.vue'
import Footer from './components/laayout/Footer.vue'

import { useAuthStore } from './stores/authstore'
import { useThemeStore } from './stores/themeStore'

const authStore = useAuthStore()
const theme = useThemeStore()
const route = useRoute()
const router = useRouter()

// ── Routes publiques (aucune auth requise) ────
const PUBLIC_ROUTES = ['login', 'home', 'about', 'portfolio-template1', 'register']


onMounted(async () => {
  theme.init()
  if (route.name && !PUBLIC_ROUTES.includes(route.name)) {
    await authStore.fetchUser()
  }
  const PUBLIC_ROUTE_NAMES = ['login', 'home', 'about', 'register', 'verify-email', 'portfolio-template1']
  window.addEventListener('auth:unauthorized', () => {
    if (!PUBLIC_ROUTE_NAMES.includes(route.name)) router.push({ name: 'login' })
  })
})

const isPublicPage = computed(() =>
  PUBLIC_ROUTES.includes(route.name)
)

const isProfessionalPage = computed(() => route.path.startsWith('/professional'))
const isProfessorPage = computed(() => route.path.startsWith('/professor'))
const isAdminPage = computed(() => route.path.startsWith('/admin'))

const isStudentPage = computed(() => {
  const studentPaths = [
    '/dashboard', '/notifications', '/profile', '/projets', '/parcours',
    '/settings', '/recommendations', '/stage', '/activites', '/portfolio','/lettres'
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

  <!-- ── Pages Professeur : layout géré par ProfessorLayout ── -->
  
  <RouterView v-else-if="isProfessorPage"/>
  

  <!-- ── Pages Étudiant : navbar + sidebar + footer ── -->
  <div v-else-if="isStudentPage" class="app">
    <NavBar />
    <div class="layout">
      <SideBar />
      <main class="content">
        <RouterView />
      </main>
    </div>
    <Footer />
  </div>

  <RouterView v-else-if="isProfessionalPage"/>

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

/* Remplacez/complétez le style existant */

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
  background-color: var(--color-page-bg);
}

.content {
  flex: 1;
  padding: 0px;
  background-color: var(--color-page-bg);
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  min-width: 0; /* ← important pour flex */
}
</style>