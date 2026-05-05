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
    },
    {
      path:'/notifications',
      name:'notifications',
      component: Notification,
    },
    {
      path:'/profile',
      name:'profile',
      component: Profile,
    },
    {
      path:'/projets',
      name:'projets',
      component: ProjectList,
    },
    {
      path:'/Settings',
      name:'Settings',
      component: Settings,
    },
    {
      path:'/recommendations',
      name:'recommendations',
      component: Recommendations,
    },
    {
      path:'/stage',
      name:'stage',
      component: StageList,
    }
  ],
})

export default router
