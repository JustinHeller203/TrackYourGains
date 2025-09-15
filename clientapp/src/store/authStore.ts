// src/store/authStore.ts
import { defineStore } from 'pinia'
import { api, setToken, getToken } from '@/lib/api'

type AuthResponseDto = { token: string; email: string }
const EMAIL_KEY = 'auth_email'

type User = { email: string }

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        loading: true,
    }),

    getters: {
        // ✅ jetzt reaktiv, hängt am State
        isAuthenticated: (s) => !!s.user,
    },

    actions: {
        async init() {
            const token = getToken()
            const email = localStorage.getItem(EMAIL_KEY)
            this.user = token && email ? { email } : null
            this.loading = false
        },

        async signIn(email: string, password: string) {
            const { data } = await api.post<AuthResponseDto>('/auth/login', { email, password })
            setToken(data.token)
            this.user = { email: data.email }
            localStorage.setItem(EMAIL_KEY, data.email)
        },

        async signUp(email: string, password: string) {
            const { data } = await api.post<AuthResponseDto>('/auth/register', { email, password })
            setToken(data.token)
            this.user = { email: data.email }
            localStorage.setItem(EMAIL_KEY, data.email)
        },

        async signOut() {
            setToken(null)
            this.user = null
            localStorage.removeItem(EMAIL_KEY)
        },
    },
})
