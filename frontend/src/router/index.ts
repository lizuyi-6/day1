import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage,
      meta: { transition: 'fade-scale' }
    },
    {
      path: '/dashboard',
      name: 'home',
      component: HomeView,
      meta: { transition: 'slide-left' }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { transition: 'slide-up' }
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('../views/KnowledgeView.vue'),
      meta: { transition: 'fade-blur' }
    },
    {
      path: '/workflows',
      name: 'workflows',
      component: () => import('../views/WorkflowListView.vue'),
      meta: { transition: 'slide-right' }
    },
    {
      path: '/workflow/:id?',
      name: 'workflow',
      component: () => import('../views/WorkflowView.vue'),
      meta: { transition: 'zoom-in' }
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/ChatView.vue'),
      meta: { transition: 'flip' }
    },
    {
      path: '/workshop',
      name: 'workshop',
      component: () => import('../views/WorkshopView.vue'),
      meta: { transition: 'fade-scale' }
    },
    {
      path: '/themes',
      name: 'themes',
      component: () => import('../views/ThemeWorkshop.vue'),
      meta: { transition: 'fade-scale' }
    },
  ],
})

export default router
