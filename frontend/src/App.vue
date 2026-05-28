<script setup>
import { computed, onMounted, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import SideBar from './components/laayout/SideBar.vue'
import NavBar from './components/laayout/NavBar.vue'
import AppFooter from './components/laayout/Footer.vue'
import ProfessionalSideBar from './components/professional/ProfessionalSideBar.vue'
import ProfessorSideBar    from './components/professor/ProfessorSidebar.vue'
import { useAuthStore } from './stores/authstore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// ── Routes publiques (aucune auth requise) ────
const PUBLIC_ROUTES = ['login', 'home', 'about']

// ── Mapping rôle → préfixe de route autorisé ──────
const ROLE_ALLOWED_PREFIXES = {
  ETUDIANT:       ['/dashboard', '/notifications', '/profile', '/projets', '/settings', '/recommendations', '/stage', '/modele', '/portfolio'],
  PROFESSIONNEL:  ['/professional'],
  PROFESSEUR:     ['/professor'],
  ADMINISTRATEUR: ['/admin'],
}

// ── Garde de sécurité : vérifie rôle vs route courante ───
function enforceRoleGuard() {
  // Pages publiques : toujours autorisées
  if (PUBLIC_ROUTES.includes(route.name)) return

  const user = authStore.user
  // Pas connecté → login
  if (!user) {
    router.replace({ name: 'login' })
    return
  }

  const allowed = ROLE_ALLOWED_PREFIXES[user.role] ?? []
  const isAllowed = allowed.some(prefix => route.path.startsWith(prefix))

  if (!isAllowed) {
    // Redirige vers la page d'accueil du rôle
    const homeByRole = {
      ETUDIANT:       '/dashboard',
      PROFESSIONNEL:  '/professional',
      PROFESSEUR:     '/professor',
      ADMINISTRATEUR: '/admin/dashboard',
    }
    router.replace(homeByRole[user.role] ?? '/login')
  }
}

onMounted(async () => {
  if (route.name && !PUBLIC_ROUTES.includes(route.name)) {
    await authStore.fetchUser()
  }
  enforceRoleGuard()
})

// Routes qui utilisent le layout complet (sidebar + navbar)
const studentRoutes = [
  'dashboard', 'notifications', 'profile', 'projets',
  'settings', 'recommendations', 'stage', 'portfolio','activites'
]

const isPublicPage = computed(() =>
  PUBLIC_ROUTES.includes(route.name)
)

const isProfessionalPage = computed(() => route.name === 'professional')
const isProfessorPage    = computed(() => route.name === 'professor')

const isAdminPage = computed(() => route.path.startsWith('/admin'))

const isStudentPage = computed(() => {
  const studentPaths = [
    '/dashboard', '/notifications', '/profile', '/projets','/parcours',
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

  <!-- ── Pages Professeur ── -->
  <div v-else-if="isProfessorPage" class="app">
    <NavBar />
    <div class="layout">
      <ProfessorSideBar />
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
