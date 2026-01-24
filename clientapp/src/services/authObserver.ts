import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'
import { useAuthStore } from '@/store/authStore'
import { LS_AUTH_TOKEN } from '@/constants/storageKeys'

type Detail = { token: string | null; reason: 'storage' | 'poll' | 'manual' }

export function initAuthObserver(pinia: Pinia, router: Router) {
    const auth = useAuthStore(pinia)

    let lastToken: string | null = null
    let handlingLogout = false

    const emitChanged = (detail: Detail) => {
        window.dispatchEvent(new CustomEvent<Detail>('auth:changed', { detail }))
        if (!detail.token) window.dispatchEvent(new CustomEvent('auth:logout'))
    }

    const hardLogout = async (reason: Detail['reason']) => {
        if (handlingLogout) return
        handlingLogout = true

        // verhindern, dass wir uns selbst in einer Loop wieder auslösen
        lastToken = null
        emitChanged({ token: null, reason })

        try {
            await auth.signOut()
        } catch {
            // egal – Hauptsache local ist clean
        }

        // optional: immer auf Home, wenn nicht eh schon dort
        try {
            if (router.currentRoute.value.name !== 'home') {
                router.push({ name: 'home' })
            }
        } catch {
            // ignore
        }

        handlingLogout = false
    }

    const check = (reason: Detail['reason']) => {
        const token = localStorage.getItem(LS_AUTH_TOKEN)
        if (token === lastToken) return

        const wasAuthed = !!lastToken
        lastToken = token

        emitChanged({ token, reason })

        // token ging weg => global logout flow
        if (wasAuthed && !token) {
            void hardLogout(reason)
        }
    }

    // init
    lastToken = localStorage.getItem(LS_AUTH_TOKEN)

    // cross-tab
    window.addEventListener('storage', (e) => {
        if (e.key !== LS_AUTH_TOKEN) return
        check('storage')
    })

    // same-tab (weil storage-event im selben Tab nicht fired)
    window.setInterval(() => check('poll'), 1200)

    // optional: wenn du irgendwo manuell triggern willst:
    window.addEventListener('auth:force-logout', () => void hardLogout('manual'))
}
