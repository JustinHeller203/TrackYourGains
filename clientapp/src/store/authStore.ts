// src/store/authStore.ts
import { defineStore } from "pinia";
import { login, register, logout, changePassword as changePasswordApi, changeEmail as changeEmailApi, deleteAccount as deleteAccountApi } from "@/services/auth";
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

        async signUp(email: string, password: string, confirmPassword: string) {
            const data: AuthResponseDto = await register(email, password, confirmPassword); // <<< dritten Param übergeben
            this.user = { email: data.email };
            localStorage.setItem(EMAIL_KEY, data.email);
        }

        async changePassword(current: string, next: string) {
            const data: AuthResponseDto = await changePasswordApi(current, next);
            this.user = { email: data.email };
            localStorage.setItem(EMAIL_KEY, data.email);
        },

        async changeEmail(newEmail: string, password: string) {
            const data: AuthResponseDto = await changeEmailApi(newEmail, password);
            this.user = { email: data.email };
            localStorage.setItem(EMAIL_KEY, data.email);
        },

        async deleteAccount(password: string) {
            await deleteAccountApi(password);
            await this.signOut();
        },

        async signOut() {
            await logout();                   // sorgt dafür, dass rt-Cookie invalid wird + Token gelöscht
            this.user = null;
            localStorage.removeItem(EMAIL_KEY);
        },
    },
});
