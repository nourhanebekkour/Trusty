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
const PUBLIC_ROUTES = ['login', 'home', 'about', 'portfolio-template1']

// ── Mapping rôle → préfixe de route autorisé ──────
const ROLE_ALLOWED_PREFIXES = {
  ETUDIANT:       ['/dashboard', '/notifications', '/profile', '/projets', '/settings', '/recommendations', '/suggestions', '/stage', '/modele', '/portfolio','/lettres'],
  PROFESSIONNEL:  ['/professional'],
  PROFESSEUR:     ['/professor'],
  ADMINISTRATEUR: ['/admin'],
}

onMounted(async () => {
  theme.init()
  if (route.name && !PUBLIC_ROUTES.includes(route.name)) {
    await authStore.fetchUser()
  }
  
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
    '/settings', '/recommendations', '/suggestions', '/stage', '/activites', '/portfolio','/lettres'
  ]
  return studentPaths.some(p => route.path.startsWith(p))
})
</script>

<template>
  <!-- ── Pages publiques : home, login, about ── -->
  <div v-if="isPublicPage">
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>

  <!-- ── Pages Admin : layout géré par AdminLayout ── -->
  <div v-else-if="isAdminPage">
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>

  <!-- ── Pages Professeur ── -->
  <RouterView v-else-if="isProfessorPage" v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>

  <!-- ── Pages Étudiant ── -->
  <div v-else-if="isStudentPage" class="app">
    <NavBar />
    <div class="layout">
      <SideBar />
      <main class="content">
        <RouterView v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
    <Footer />
  </div>

  <RouterView v-else-if="isProfessionalPage" v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>

  <!-- ── Fallback ── -->
  <div v-else>
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
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

/* ─── Page transitions ───────────────────────────── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
</style>