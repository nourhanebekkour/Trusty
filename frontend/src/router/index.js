import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/loginview.vue'  
import Dashboard from '@/views/Dashboard.vue'
import ProjectList from '@/views/ProjectList.vue'
import Settings from '@/views/Settings.vue'
import StageList from '@/views/StageList.vue'
import Recommendations from '@/views/Recommendations.vue'
import Notification from '@/views/Notification.vue'
import Profile from '@/views/Profile.vue'
import ProfessionalView from '@/views/ProfessionalView.vue'
import ProfessorView from '@/views/ProfessorView.vue'
import { useAuthStore } from '@/stores/auth'
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
    {
      path:'/dashboard',
      name:'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path:'/notifications',
      name:'notifications',
      component: Notification,
      meta: { requiresAuth: true } 
    },
    {
      path:'/profile',
      name:'profile',
      component: Profile,
      meta: { requiresAuth: true } 
    },
    {
      path:'/projets',
      name:'projets',
      component: ProjectList,
      meta: { requiresAuth: true }
    },
    {
      path:'/Settings',
      name:'Settings',
      component: Settings,
      meta: { requiresAuth: true }
    },
    {
      path:'/recommendations',
      name:'recommendations',
      component: Recommendations,
      meta: { requiresAuth: true }
    },
    {
      path:'/stage',
      name:'stage',
      component: StageList,
      meta: { requiresAuth: true }
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
    }
      ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && to.meta.requiresAuth) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router