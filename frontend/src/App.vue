<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import SideBar from './components/laayout/SideBar.vue'
import NavBar from './components/laayout/NavBar.vue'
import Footer from './components/laayout/Footer.vue'
import ProfessionalSideBar from './components/professional/ProfessionalSideBar.vue'
import { useAuthStore } from './stores/authstore'

const authStore = useAuthStore()
const route = useRoute()

onMounted(async () => {
  const publicRoutes = ['login', 'home', 'about']
  if (route.name && !publicRoutes.includes(route.name)) {
    await authStore.fetchUser()
  }
})

const isPublicPage = computed(() =>
  ['home', 'login', 'about', 'portfolio'].includes(route.name)
)

const isProfessionalPage = computed(() => route.name === 'professional')
const isProfessorPage = computed(() => route.path.startsWith('/professor'))
const isAdminPage = computed(() => route.path.startsWith('/admin'))

const isStudentPage = computed(() => {
  const studentPaths = [
    '/dashboard', '/notifications', '/profile', '/projets', '/parcours',
    '/settings', '/recommendations', '/stage', '/activites', '/portfolio'
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
  <div v-else-if="isProfessorPage">
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
    <Footer />
  </div>

  <!-- ── Pages Professionnel ── -->
  <div v-else-if="isProfessionalPage" class="app">
    <NavBar />
    <div class="layout">
      <ProfessionalSideBar />
      <main class="content">
        <RouterView />
      </main>
    </div>
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
  background-color: var(--color-background);
}

.content {
  flex: 1;
  padding: 0px;
  background-color: var(--color-background);
  overflow-y: auto;
  min-height: 0;
}
</style>