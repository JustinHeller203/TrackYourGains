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
    // nutzt BASE_URL (standard: "/"), spielt gut mit Vite/Vercel
    history: createWebHistory(import.meta.env.BASE_URL),
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
    // optional nice-to-have: immer nach oben scrollen bei Navigation
    scrollBehavior() {
        return { top: 0 }
    },
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    // nur initialisieren, wenn nötig (verhindert doppeltes init)
    if (!auth.initialized && !auth.loading && typeof auth.init === 'function') {
        await auth.init()
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
        // explizit als Location-Objekt zurückgeben
        const redirect = (to.query.redirect as string) || '/'
        return { path: redirect }
    }
})

export default router
