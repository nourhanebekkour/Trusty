import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLayout from '../components/admin/AdminLayout.vue'
import LoginView from '../views/loginview.vue'
import Dashboard from '@/views/Etudiant/Dashboard.vue'
import ProjectList from '@/views/Etudiant/ProjectList.vue'
import Settings from '@/views/Settings.vue'
import StageList from '@/views/Etudiant/StageList.vue'
import Recommendations from '@/views/Etudiant/Recommendations.vue'
import Notification from '@/views/Etudiant/Notification.vue'
import Profile from '@/views/Etudiant/Profile.vue'
import activites from '@/views/Etudiant/activites.vue'
import Portfolio from '@/views/portfolio/PortfolioManagement.vue'
import ProfessionalView from '@/views/ProfessionalView.vue'
import ProfessorView from '@/views/ProfessorView.vue'
import { useAuthStore } from '@/stores/authstore'
import Parcours from '../views/Etudiant/Parcours.vue'
import registerview from '@/views/registerview.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import LettresRecommandation from '@/views/Etudiant/LettresRecommandation.vue'
import PortfolioTemplate1 from '@/views/portfolio/PortfolioTemplate1.vue'

// ── Roles autorisés ──────────────────────────────
const ROLES = {
  ADMIN:        'ADMINISTRATEUR',
  STUDENT:      'ETUDIANT',
  PROFESSOR:    'PROFESSEUR',
  PROFESSIONAL: 'PROFESSIONNEL',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/Etudiant/Parcours.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: registerview,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView,
    },

    // ── Admin ──────────────────────────────────────────
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboard.vue'),
        },
        {
          path: 'utilisateurs',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUsers.vue'),
        },
        {
          path: 'verifications',
          name: 'admin-verifications',
          component: () => import('../views/admin/AdminVerifications.vue'),
        },
        {
          path: 'portfolios',
          name: 'admin-portfolios',
          component: () => import('../views/admin/AdminPortfolios.vue'),
        },
        {
          path: 'notifications',
          name: 'admin-notifications',
          component: () => import('../views/admin/AdminNotifications.vue'),
        },
      ],
    },

    // ── Student ──────────────────────────────────────────
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notification,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/projets',
      name: 'projets',
      component: ProjectList,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true },
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: Recommendations,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/lettres',
      name: 'lettres',
      component: LettresRecommandation,
    },
    {
      path: '/stage',
      name: 'stage',
      component: StageList,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/parcours',
      name: 'parcours',
      component: Parcours,
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: Portfolio,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/portfolio/:url_publique',
      name: 'portfolio-template1',
      component: PortfolioTemplate1,
    },
    {
      path: '/activites',
      name: 'activites',
      component: activites,
    },

    // ── Professional ─────────────────────────────────────
    {
      path: '/professional',
      name: 'professional',
      component: ProfessionalView,
      meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
    },

    // ── Professor ────────────────────────────────────────
    {
      path: '/professor',
      name: 'professor',
      component: ProfessorView,
      meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
    },

    // ── Pages d'erreur ────────────────────────────────────
    //{
    //   path: '/403',
    //   name: 'forbidden',
    //   component: () => import('../views/ForbiddenView.vue'),
    // },
    // {
    //   path: '/:pathMatch(.*)*',
    //   name: 'not-found',
    //   component: () => import('../views/NotFoundView.vue'),
    // },
  ],
})

// ── Guard principal ────────────────────────────────────────────
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Initialisation session
  if (!authStore.isInitialized) {
    try {
      await authStore.fetchUser()
    } catch (e) {
      console.error('[Router] Impossible de récupérer la session :', e)
    }
  }

  // Redirection automatique selon rôle
  if (authStore.isAuthenticated) {
    if (authStore.isAdmin) {
      if (!to.path.startsWith('/admin')) return '/admin/dashboard'
    } else if (authStore.isProfesseur) {
      if (to.name !== 'professor') return '/professor'
    } else if (authStore.isProfessionnel) {
      if (!to.path.startsWith('/professional')) return '/professional'
    }
  }

  // Pages publiques (après la redirection par rôle)
  if (['home', 'login', 'register', 'about', 'verify-email', 'portfolio-template1'].includes(to.name)) {
    return true
  }

  // Pages invité uniquement
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return redirectByRole(authStore.user?.role)
  }

  // Routes protégées
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Vérification des rôles
  if (to.meta.roles?.length > 0) {
    const userRole = authStore.user?.role?.toUpperCase()
    if (!userRole || !to.meta.roles.includes(userRole)) {
      return { name: 'forbidden' }
    }
  }

  return true
})

// ── Redirection selon rôle après login ────────────────────────
function redirectByRole(role) {
  switch (role?.toUpperCase()) {
    case ROLES.ADMIN:        return '/admin/dashboard'
    case ROLES.STUDENT:      return '/dashboard'
    case ROLES.PROFESSOR:    return '/professor'
    case ROLES.PROFESSIONAL: return '/professional'
    default:                 return '/'
  }
}

export default router