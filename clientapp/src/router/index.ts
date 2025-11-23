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

// nur einmalige Initialisierung zulassen
let authInitOnce: Promise<void> | null = null

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    // init nur einmal starten; weitere Guards warten auf dieselbe Promise
    if (typeof auth.init === 'function') {
        if (!authInitOnce && !auth.loading) {
            authInitOnce = Promise.resolve(auth.init())
        }
        if (authInitOnce) {
            await authInitOnce
        }
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
        // explizit als Location-Objekt zur�ckgeben
        const redirect = (to.query.redirect as string) || '/'
        return { path: redirect }
    }
})

export default router
