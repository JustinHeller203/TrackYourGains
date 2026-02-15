// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'

import { ensureDailyAutoActivity } from '@/utils/dailyActivity'
import { initTheme } from '@/composables/useTheme'
import { initAuthObserver } from '@/services/authObserver'

import { pushUiError } from '@/lib/errorBus'

// ganz früh anwenden (verhindert Light-Flash & sorgt fürs Persistieren)
initTheme()

ensureDailyAutoActivity()

    ; (async () => {
        const app = createApp(App)


        // Vue Errors -> UI bus
        app.config.errorHandler = (err, instance, info) => {
            const e = err as any
            pushUiError({
                source: 'vue',
                message: String(e?.message ?? err ?? 'Unknown Vue error'),
                stack: String(e?.stack ?? ''),
                info: String(info ?? ''),
            })

            console.error('[Vue errorHandler]', err, info)
        }

        app.config.warnHandler = (msg, instance, trace) => {
            pushUiError({
                source: 'vue-warn',
                message: String(msg),
                info: String(trace ?? ''),
            })
        }

        // Router errors (z.B. lazy import chunk fail)
        router.onError((err) => {
            const e = err as any
            pushUiError({
                source: 'router',
                message: String(e?.message ?? err ?? 'Router error'),
                stack: String(e?.stack ?? ''),
            })
        })

        // window-level -> UI bus
        window.addEventListener('error', (ev) => {
            const ee = (ev as ErrorEvent).error as any
            pushUiError({
                source: 'window',
                message: String((ev as ErrorEvent).message ?? ee?.message ?? 'window.error'),
                stack: String(ee?.stack ?? ''),
                info: `${(ev as ErrorEvent).filename ?? ''}:${(ev as ErrorEvent).lineno ?? ''}:${(ev as ErrorEvent).colno ?? ''}`,
            })
        })

        window.addEventListener('unhandledrejection', (ev) => {
            const r = (ev as PromiseRejectionEvent).reason as any
            pushUiError({
                source: 'promise',
                message: String(r?.message ?? r ?? 'Unhandled Promise rejection'),
                stack: String(r?.stack ?? ''),
            })
            console.error('[unhandledrejection]', ev.reason)
        })

        // Pinia
        const pinia = createPinia()
        app.use(pinia)

        // Auth-Store initialisieren (VOR Router)
        const auth = useAuthStore(pinia)
        await auth.init()

        // Guards
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
        initAuthObserver(pinia, router)
        app.mount('#app')

        const settings = useSettingsStore(pinia)
        settings.broadcast()
    })()
