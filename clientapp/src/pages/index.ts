import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/pages/LandingPage.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: LandingPage
    },
    {
        path: '/training',
        name: 'Training',
        component: () => import('@/pages/Training.vue')
    },
    {
        path: '/nutrition',
        name: 'Nutrition',
        component: () => import('@/pages/Nutrition.vue')
    },
    {
        path: '/progress',
        name: 'Progress',
        component: () => import('@/pages/Progress.vue')
    },
    {
        path: '/tutorials',
        name: 'Tutorials',
        component: () => import('@/pages/Tutorials.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/pages/Settings.vue')
    }

]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router