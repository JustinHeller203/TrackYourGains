import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/store/authStore'

    ; (async () => {
        const app = createApp(App)

        // Pinia
        const pinia = createPinia()
        app.use(pinia)

        // Auth-Store initialisieren (VOR Router)
        const auth = useAuthStore(pinia)
        await auth.init()

        // Guards hier nutzen (optional – aber NICHT zusätzlich auch im Router!)
        router.beforeEach((to) => {
            if (to.meta?.requiresAuth && !auth.user) {
                return { path: '/login', query: { r: to.fullPath } }
            }
            if (to.meta?.guestOnly && auth.user) {
                return { path: '/' }
            }
            return true
        })

        app.use(router)
        app.mount('#app')
    })()
    