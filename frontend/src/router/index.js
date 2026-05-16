import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLayout from '../components/admin/AdminLayout.vue'
import LoginView from '../views/loginview.vue'
import Dashboard from '@/views/Dashboard.vue'
import ProjectList from '@/views/ProjectList.vue'
import Settings from '@/views/Settings.vue'
import StageList from '@/views/StageList.vue'
import Recommendations from '@/views/Recommendations.vue'
import Notification from '@/views/Notification.vue'
import Profile from '@/views/Profile.vue'
import Modele from '@/views/Modele.vue'
import Portfolio from '@/views/Portfolio.vue'
import ProfessionalView from '@/views/ProfessionalView.vue'
import ProfessorView from '@/views/ProfessorView.vue'

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
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },

    // ── Admin ──────────────────────────────────────────
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
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
      ],
    },

    // ── Student / User routes ──────────────────────────
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notification,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
    {
      path: '/projets',
      name: 'projets',
      component: ProjectList,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: Recommendations,
    },
    {
      path: '/stage',
      name: 'stage',
      component: StageList,
    },
    {
      path: '/modele',
      name: 'modele',
      component: Modele,
    },
    {
      path: '/portfolio',
      name: 'portfolio',
      component: Portfolio,
    },
    {
      path: '/professional',
      name: 'professional',
      component: ProfessionalView,
    },
    {
      path: '/professor',
      name: 'professor',
      component: ProfessorView,
    },
  ],  // ← fermeture correcte du tableau routes
})

// ── Auth guard ─────────────────────────────────────────
router.beforeEach((to, from, next) => {
  // const token = localStorage.getItem('token')
  // if (to.meta.requiresAuth && !token) {
  //   next({ name: 'login' })
  // } else if (to.name === 'login' && token) {
  //   next({ path: '/admin/dashboard' })
  // } else {
  next()
  // }
})

export default router