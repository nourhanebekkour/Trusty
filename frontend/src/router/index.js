import { createRouter, createWebHistory } from 'vue-router'
import HomeView  from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AdminLayout from '../components/admin/AdminLayout.vue'

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
      component: AdminLayout,          // ← Topbar + Sidebar wrapper
      meta: { requiresAuth: true },
      children: [
        {
          path: '',                    // /admin → redirect to dashboard
          redirect: '/admin/dashboard'
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
  ],
})

// ── Auth guard ─────────────────────────────────────────
router.beforeEach((to, from, next) => {
 // const token = localStorage.getItem('token')
 // if (to.meta.requiresAuth && !token) {
  //  next({ name: 'login' })          // named route — never appends to current path
  //} else if (to.name === 'login' && token) {
  //  next({ path: '/admin/dashboard' }) // already logged in → skip login
  //} else {
    next()
  })

export default router