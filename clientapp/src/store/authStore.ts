// src/store/authStore.ts
import { defineStore } from "pinia";
import { login, register, logout, changeEmail, changePassword, deleteAccount as svcDeleteAccount } from "@/services/auth";
import { LS_AUTH_EMAIL } from "@/constants/storageKeys";
import { getToken, setToken } from "@/lib/api";

type AuthResponseDto = { token: string; email: string };

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
            const email = localStorage.getItem(LS_AUTH_EMAIL);
            this.user = token && email ? { email } : null;
            this.loading = false;
        },

        async signIn(email: string, password: string) {
            const data: AuthResponseDto = await login(email, password);
            this.user = { email: data.email };
            setToken(data.token);
            localStorage.setItem(LS_AUTH_EMAIL, data.email);
        },

        // Registrieren mit confirmPassword
        async signUp(email: string, password: string, confirmPassword: string) {
            const data: AuthResponseDto = await register(email, password, confirmPassword);
            this.user = { email: data.email };
            setToken(data.token);
            localStorage.setItem(LS_AUTH_EMAIL, data.email);
        },

        async signOut() {
            await logout();
            this.user = null;
            localStorage.removeItem(LS_AUTH_EMAIL);
            setToken(null);
        },

        async changeEmail(newEmail: string, password: string) {
            const data: AuthResponseDto = await changeEmail(newEmail, password);
            this.user = { email: data.email };
            localStorage.setItem(LS_AUTH_EMAIL, data.email);
            setToken(data.token);
        },

        async changePassword(current: string, next: string) {
            const data: AuthResponseDto = await changePassword(current, next);
            // Token wurde im Service gesetzt; E-Mail bleibt gleich
            return data;
        },

        async deleteAccount(password: string) {
            await svcDeleteAccount(password);
            this.user = null;
            localStorage.removeItem(LS_AUTH_EMAIL);
            setToken(null);
        },
    },
});
