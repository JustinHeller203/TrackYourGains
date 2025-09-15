import { computed } from 'vue'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
    const auth = useAuthStore()

    return {
        user: computed(() => auth.user),
        email: computed(() => auth.user?.email ?? null),
        isAuthenticated: computed(() => auth.isAuthenticated),
        ready: computed(() => !auth.loading),

        login: auth.signIn,
        register: auth.signUp,
        signOut: auth.signOut,
        init: auth.init,
    }
}
