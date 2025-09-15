import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/pages/LandingPage.vue'
import Training from '@/pages/Training.vue'
import Nutrition from '@/pages/Nutrition.vue'
import Progress from '@/pages/Progress.vue'
import Settings from '@/pages/Settings.vue'
import Tutorials from '@/pages/Tutorials.vue'
import AuthLogin from '@/pages/AuthLogin.vue'
import Profile from '@/pages/Profile.vue'
import { useAuthStore } from '@/store/authStore'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: LandingPage },
        { path: '/training', name: 'training', component: Training },
        { path: '/nutrition', name: 'nutrition', component: Nutrition },
        { path: '/progress', name: 'progress', component: Progress },
        { path: '/tutorials', name: 'tutorials', component: Tutorials },
        { path: '/settings', name: 'settings', component: Settings },

        { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
        { path: '/login', name: 'login', component: AuthLogin, meta: { guestOnly: true } },
        { path: '/register', redirect: { name: 'login', query: { mode: 'register' } } },
        { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
    ],
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()
    if (auth.loading) await auth.init()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
        return (to.query.redirect as string) || '/'
    }
})

export default router
