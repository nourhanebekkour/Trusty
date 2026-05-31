import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLayout from '../components/admin/AdminLayout.vue'
import LoginView from '../views/loginview.vue'
import RegisterView from '@/views/registerview.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import Dashboard from '@/views/Etudiant/Dashboard.vue'
import ProjectList from '@/views/Etudiant/ProjectList.vue'
import Settings from '@/views/Settings.vue'
import StageList from '@/views/Etudiant/StageList.vue'
import Recommendations from '@/views/Etudiant/Recommendations.vue'
import Notification from '@/views/Etudiant/Notification.vue'
import Profile from '@/views/Etudiant/Profile.vue'
import Activites from '@/views/Etudiant/activites.vue'
import Portfolio from '@/views/Etudiant/Portfolio.vue'
import ProfessionalView from '@/views/ProfessionalView.vue'
import ProfessorView from '@/views/ProfessorView.vue'
import Parcours from '../views/Etudiant/Parcours.vue'
import { useAuthStore } from '@/stores/authstore'

const roleHome = {
  ADMINISTRATEUR: '/admin/dashboard',
  PROFESSIONNEL: '/professional/dashboard',
  PROFESSEUR: '/professor',
  ETUDIANT: '/dashboard',
}

const publicRoutes = ['home', 'login', 'register', 'about', 'verify-email']
const studentMeta = { requiresAuth: true, roles: ['ETUDIANT'] }
const adminMeta = { requiresAuth: true, roles: ['ADMINISTRATEUR'] }
const professionalMeta = { requiresAuth: true, roles: ['PROFESSIONNEL'] }
const professorMeta = { requiresAuth: true, roles: ['PROFESSEUR'] }

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
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView,
    },
    {
      path: '/administrateur',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: adminMeta,
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/AdminDashboard.vue'),
          meta: adminMeta,
        },
        {
          path: 'utilisateurs',
          name: 'admin-users',
          component: () => import('../views/admin/AdminUsers.vue'),
          meta: adminMeta,
        },
        {
          path: 'verifications',
          name: 'admin-verifications',
          component: () => import('../views/admin/AdminVerifications.vue'),
          meta: adminMeta,
        },
        {
          path: 'portfolios',
          name: 'admin-portfolios',
          component: () => import('../views/admin/AdminPortfolios.vue'),
          meta: adminMeta,
        },
        {
          path: 'notifications',
          name: 'admin-notifications',
          component: () => import('../views/admin/AdminNotifications.vue'),
          meta: adminMeta,
        },
      ],
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: studentMeta,
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notification,
      meta: studentMeta,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: studentMeta,
    },
    {
      path: '/projets',
      name: 'projets',
      component: ProjectList,
      meta: studentMeta,
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
      meta: studentMeta,
    },
    {
      path: '/stage',
      name: 'stage',
      component: StageList,
      meta: studentMeta,
    },
    {
      path: '/parcours',
      name: 'parcours',
      component: Parcours,
      meta: studentMeta,
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: Portfolio,
      meta: studentMeta,
    },
    {
      path: '/activites',
      name: 'activites',
      component: Activites,
      meta: studentMeta,
    },
    {
      path: '/professionnel',
      redirect: '/professional/dashboard',
    },
    {
      path: '/professional',
      name: 'professional',
      component: ProfessionalView,
      meta: professionalMeta,
    },
    {
      path: '/professional/dashboard',
      name: 'professional-dashboard',
      component: ProfessionalView,
      meta: professionalMeta,
    },
    {
      path: '/professional/recommandations',
      name: 'professional-recommendations',
      component: ProfessionalView,
      meta: professionalMeta,
    },
    {
      path: '/professional/notifications',
      name: 'professional-notifications',
      component: ProfessionalView,
      meta: professionalMeta,
    },
    {
      path: '/professor',
      name: 'professor',
      component: ProfessorView,
      meta: professorMeta,
    },
  ],
})

router.beforeEach(async to => {
  const authStore = useAuthStore()

  if (!publicRoutes.includes(to.name) && !authStore.user) {
    await authStore.fetchUser()
  }

  const userRole = authStore.user?.role

  if (authStore.isAuthenticated && ['login', 'register'].includes(to.name)) {
    return roleHome[userRole] || '/'
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const allowedRoles = to.meta.roles
  if (authStore.isAuthenticated && Array.isArray(allowedRoles) && !allowedRoles.includes(userRole)) {
    return roleHome[userRole] || '/'
  }

  return true
})

export default router
