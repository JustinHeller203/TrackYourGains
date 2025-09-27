// src/store/authStore.ts
import { defineStore } from "pinia";
import { login, register, logout, changeEmail, changePassword, deleteAccount as svcDeleteAccount } from "@/services/auth";
import { getToken } from "@/lib/api";

type AuthResponseDto = { token: string; email: string };
const EMAIL_KEY = "auth_email";

type User = { email: string };

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null as User | null,
        loading: true,
    }),

    getters: {
        isAuthenticated: (s) => !!s.user,
    },

    actions: {
        async init() {
            const token = getToken();
            const email = localStorage.getItem(EMAIL_KEY);
            this.user = token && email ? { email } : null;
            this.loading = false;
        },

        async signIn(email: string, password: string) {
            const data: AuthResponseDto = await login(email, password);
            this.user = { email: data.email };
            localStorage.setItem(EMAIL_KEY, data.email);
        },

        // Registrieren mit confirmPassword
        async signUp(email: string, password: string, confirmPassword: string) {
            const data: AuthResponseDto = await register(email, password, confirmPassword);
            this.user = { email: data.email };
            localStorage.setItem(EMAIL_KEY, data.email);
        },

        async signOut() {
            await logout();
            this.user = null;
            localStorage.removeItem(EMAIL_KEY);
        },

        async changeEmail(newEmail: string, password: string) {
            const data: AuthResponseDto = await changeEmail(newEmail, password);
            this.user = { email: data.email };
            localStorage.setItem(EMAIL_KEY, data.email);
        },

        async changePassword(current: string, next: string) {
            const data: AuthResponseDto = await changePassword(current, next);
            // Token wurde im Service gesetzt; E-Mail bleibt gleich
            return data;
        },

        /** 🗑️ Konto löschen + lokalen State säubern */
        async deleteAccount(password: string) {
            await svcDeleteAccount(password);
            this.user = null;
            localStorage.removeItem(EMAIL_KEY);
        },
    },
});
