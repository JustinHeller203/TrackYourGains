import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './store/authStore'

const app = createApp(App)

// Pinia erstellen
const pinia = createPinia()
app.use(pinia)

// Auth-Store initialisieren
const auth = useAuthStore(pinia)
await auth.init()

// Router Guards mit Store
router.beforeEach((to) => {
    if (to.meta?.requiresAuth && !auth.user) {
        return { path: '/login', query: { r: to.fullPath } }
    }
    if (to.meta?.guestOnly && auth.user) {
        return { path: '/' }
    }
    return true
})

// Router registrieren & mounten
app.use(router)
app.mount('#app')
