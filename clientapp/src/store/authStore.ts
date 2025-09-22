// src/store/authStore.ts
import { defineStore } from "pinia";
import {
    login,
    register,
    logout,
    changePassword as changePasswordApi,
    changeEmail as changeEmailApi,
} from "@/services/auth";
import { getToken } from "@/lib/api";
import { deleteAccount as deleteAccountApi } from "@/services/auth";

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

        async deleteAccount(password: string) {
            await deleteAccountApi(password);
            await this.signOut(); // Token vergessen + user null
        },

        async signUp(email: string, password: string) {
            const data: AuthResponseDto = await register(email, password);
            this.user = { email: data.email };
            localStorage.setItem(EMAIL_KEY, data.email);
        },

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


        async signOut() {
            logout();
            this.user = null;
            localStorage.removeItem(EMAIL_KEY);
        },
    },
});
