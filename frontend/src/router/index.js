import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLayout from '../components/admin/AdminLayout.vue'
import ProfessorLayout from '../components/professor/ProfessorLayout.vue'
import LoginView from '../views/loginview.vue'
import Dashboard from '@/views/Etudiant/Dashboard.vue'
import ProjectList from '@/views/Etudiant/ProjectList.vue'
import ProjectDetail from '@/views/Etudiant/ProjectDetail.vue'
import Settings from '@/views/Settings.vue'
import StageList from '@/views/Etudiant/StageList.vue'
import Recommendations from '@/views/Etudiant/Recommendations.vue'
import Notification from '@/views/Etudiant/Notification.vue'
import Profile from '@/views/Etudiant/Profile.vue'
import Suggestions from '@/views/Etudiant/Suggestions.vue'
import activites from '@/views/Etudiant/activites.vue'
import Portfolio from '@/views/portfolio/PortfolioManagement.vue'
import ProfessionalLayout from '@/components/Professional/ProfessionalLayout.vue'
import ProfessorView from '@/views/professor/ProfessorView.vue'
import { useAuthStore } from '@/stores/authstore'
import Parcours from '../views/Etudiant/Parcours.vue'
import registerview from '@/views/registerview.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import LettresRecommandation from '@/views/Etudiant/LettresRecommandation.vue'
import PortfolioTemplate1 from '@/views/portfolio/PortfolioTemplate1.vue'

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
      path: '/register',
      name: 'register',
      component: registerview,
      meta: { guestOnly: true },
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
          component: () => import('@/views/admin/AdminDashboard.vue'),
        },
        {
          path: 'utilisateurs',
          name: 'admin-users',
          component: () => import('@/views/admin/AdminUsers.vue'),
        },
        {
          path: 'verifications',
          name: 'admin-verifications',
          component: () => import('@/views/admin/AdminVerifications.vue'),
        },
        {
          path: 'portfolios',
          name: 'admin-portfolios',
          component: () => import('@/views/admin/AdminPortfolios.vue'),
        },
        {
          path: 'notifications',
          name: 'admin-notifications',
          component: () => import('@/views/admin/AdminNotifications.vue'),
        },
        {
          path: 'badges',
          name: 'admin-badges',
          component: () => import('../views/admin/AdminBadges.vue'),
        },
        {
          path: 'historique',
          name: 'admin-historique',
          component: () => import('../views/admin/AdminHistorique.vue'),
        },
        {
          path: 'profil',
          name: 'admin-profile',
          component: () => import('../views/admin/AdminProfile.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('../views/admin/AdminSettings.vue'),
          meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
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
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/projets',
      name: 'projets',
      component: ProjectList,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/projets/:id',
      name: 'project-detail',
      component: ProjectDetail,
      props: true,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: Recommendations,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/suggestions',
      name: 'suggestions',
      component: Suggestions,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },
    {
      path: '/lettres',
      name: 'lettres',
      component: LettresRecommandation,
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
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
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
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
      meta: { requiresAuth: true, roles: [ROLES.STUDENT] },
    },

    // ── Professional ─────────────────────────────────────
    {
      path: '/professional',
      component: ProfessionalLayout,
      meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
      children: [
        {
          path: '',
          redirect: '/professional/profile',
        },
        {
          path: 'profile',
          name: 'professional-profile',
          component: () => import('@/views/Professional/ProfessionalProfile.vue'),
          meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
        },
        {
          path: 'recommandations',
          name: 'professional-recommandations',
          component: () => import('@/views/Professional/ProfessionalRecommandations.vue'),
          meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
        },
        {
          path: 'portfolios',
          name: 'professional-portfolios',
          component: () => import('@/views/Professional/ProfessionalPortfolios.vue'),
          meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
        },
        {
          path: 'notifications',
          name: 'professional-notifications',
          component: () => import('@/views/Professional/ProfessionalNotifications.vue'),
          meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
        },
        {
      path: 'settings',
      name: 'professional-settings',
      component: () => import('@/views/Professional/ProfessionalSettings.vue'),
      meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
    },
  ],
},
{
  path: '/professional/students/:id/portfolio',
  name: 'professional-portfolio-consultation',
  component: () => import('@/views/Professional/ProfessionalPortfolioConsultation.vue'),
  meta: { requiresAuth: true, roles: [ROLES.PROFESSIONAL] },
},

    // ── Professor ────────────────────────────────────────
    {
      path: '/professor',
      component: ProfessorLayout,
      meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
      children: [
        { path: '', redirect: '/professor/dashboard' },
        {
          path: 'dashboard',
          name: 'professor-dashboard',
          component: ProfessorView,
           meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
        },
        {
          path: 'validations',
          name: 'professor-validations',
          component: () => import('../views/professor/ProfessorValidations.vue'),
           meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
        },
        {
          path: 'portfolios',
          name: 'professor-portfolios',
          component: () => import('../views/professor/ProfessorPortfolios.vue'),
           meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
        },
        {
          path: 'notifications',
          name: 'professor-notifications',
          component: () => import('../views/professor/ProfessorNotifications.vue'),
           meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
        },
        {
          path: 'recommandations',
          name: 'professor-recommandations',
          component: () => import('../views/professor/ProfessorRecommendations.vue'),
           meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
        },
        {
          path: 'profile',
          name: 'professor-profile',
          component: () => import('../views/professor/ProfessorProfile.vue'),
           meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
        },
        {
          path: 'settings',
          name: 'professor-settings',
          component: () => import('../views/professor/ProfessorSettings.vue'),
          meta: { requiresAuth: true, roles: [ROLES.PROFESSOR] },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const PUBLIC_ROUTES = ['home', 'login', 'register', 'about', 'verify-email']

  if (PUBLIC_ROUTES.includes(to.name)) {
    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return redirectByRole(authStore.user?.role)
    }
    return true
  }

  if (!authStore.isInitialized) {
    try {
      await authStore.fetchUser()
    } catch (e) {
      console.error('[Router] Impossible de récupérer la session :', e)
    }
  }

  const allowedRoles = to.matched.flatMap(record => record.meta.roles ?? [])
  const isPublicPortfolio = to.name === 'portfolio-template1'

  if (authStore.isAuthenticated && !isPublicPortfolio) {
    if (authStore.isAdmin && !to.path.startsWith('/admin')) {
      return '/admin/dashboard'
    } else if (authStore.isProfesseur && !to.path.startsWith('/professor')) {
      return '/professor/dashboard'
    } else if (authStore.isProfessionnel && !to.path.startsWith('/professional')) {
      return '/professional'
    }
  }

  if (['home', 'login', 'register', 'about', 'verify-email', 'portfolio-template1'].includes(to.name)) {
    return true
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return redirectByRole(authStore.user?.role)
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (allowedRoles.length > 0) {
    const userRole = authStore.user?.role?.toUpperCase()
    if (!userRole || !allowedRoles.includes(userRole)) {
      return { name: 'login' }
    }
  }

  return true
})

function redirectByRole(role) {
  switch (role?.toUpperCase()) {
    case ROLES.ADMIN:        return '/admin/dashboard'
    case ROLES.STUDENT:      return '/dashboard'
    case ROLES.PROFESSOR:    return '/professor/dashboard'
    case ROLES.PROFESSIONAL: return '/professional'
    default:                 return '/'
  }
}

export default router
