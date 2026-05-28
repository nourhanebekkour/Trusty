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
import Portfolio from '@/views/Etudiant/Portfolio.vue'
import ProfessionalView from '@/views/ProfessionalView.vue'
import ProfessorView from '@/views/ProfessorView.vue'
import { useAuthStore } from '@/stores/authstore'
import Parcours from '../views/Etudiant/Parcours.vue'
import ProfessorLayout from '../components/professor/ProfessorLayout.vue'


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
        {
          path: 'notifications',
          name: 'admin-notifications',
          component: () => import('../views/admin/AdminNotifications.vue'),
        },
      ],
    },

    // ── Student / User routes ──────────────────────────
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      //meta: { requiresAuth: true }
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: Notification,
      meta: { requiresAuth: true } 
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      //meta: { requiresAuth: true } 
    },
    {
      path: '/projets',
      name: 'projets',
      component: ProjectList,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path: '/recommendations',
      name: 'recommendations',
      component: Recommendations,
      meta: { requiresAuth: true }
    },
    {
      path: '/stage',
      name: 'stage',
      component: StageList,
      meta: { requiresAuth: true }
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
    },
    {
      path: '/activites',
      name: 'activites',
      component: activites,
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
  meta: { requiresAuth: true }
},
  ],  
})

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  if (['home', 'login', 'about'].includes(to.name)) {
    return true
  }

  if (!authStore.user) {
    await authStore.fetchUser()
  }

  if (authStore.isAuthenticated) {

    if (authStore.isAdmin) {
      if (!to.path.startsWith('/admin')) return '/admin/dashboard'
    }

    else if (authStore.isProfesseur) {
  if (to.name !== 'professor') return '/professor'
}

    else if (authStore.isProfessionnel) {
      if (!to.path.startsWith('/professional')) return '/professional'
    }

  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }
})
// ── Auth guard ─────────────────────────────────────────
//router.beforeEach((to, from, next) => {
  // const token = localStorage.getItem('token')
  // if (to.meta.requiresAuth && !token) {
  //   next({ name: 'login' })
  // } else if (to.name === 'login' && token) {
  //   next({ path: '/admin/dashboard' })
  // } else {
  //next()
  // }


export default router