// src/store/authStore.ts
import { defineStore } from "pinia";
import { login, register, logout, changeEmail, changePassword, deleteAccount as svcDeleteAccount } from "@/services/auth";
import { useSettingsStore } from "@/store/settingsStore";
import { LS_AUTH_EMAIL } from "@/constants/storageKeys";
import { getToken, setToken } from "@/lib/api";
import { useWeightStore } from "@/store/weightStore";

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
            const settings = useSettingsStore();

            const token = getToken();
            const email = localStorage.getItem(LS_AUTH_EMAIL);

            if (token && email) {
                this.user = { email };
                // ✅ sobald eingeloggt: settings aus Backend ziehen
                try {
                    await settings.loadFromBackend()
                } catch {
                    settings.resetToDefaults()
                }
                settings.broadcast()            } else {
                this.user = null;
                setToken(null);
                // ✅ guest: defaults (nur in-memory)
                settings.resetToDefaults();
            }

            this.loading = false;
        },

        async signIn(email: string, password: string) {
            const settings = useSettingsStore();

            const data: AuthResponseDto = await login(email, password);
            this.user = { email: data.email };
            setToken(data.token);
            localStorage.setItem(LS_AUTH_EMAIL, data.email);

            // ✅ backend settings laden
            try {
                await settings.loadFromBackend()
            } catch {
                settings.resetToDefaults()
            }
            settings.broadcast()        },

        async signUp(email: string, password: string, confirmPassword: string) {
            const settings = useSettingsStore();

            const data: AuthResponseDto = await register(email, password, confirmPassword);
            this.user = { email: data.email };
            setToken(data.token);
            localStorage.setItem(LS_AUTH_EMAIL, data.email);

            // ✅ backend settings laden
            try {
                await settings.loadFromBackend()
            } catch {
                settings.resetToDefaults()
            }
            settings.broadcast()        },

        async signOut() {
            const settings = useSettingsStore();
            const weights = useWeightStore();

            try {
                await logout();
            } catch {
                // egal — lokal muss trotzdem sauber werden
            } finally {
                this.user = null;
                localStorage.removeItem(LS_AUTH_EMAIL);
                setToken(null);

                // ✅ harte UI-Resets (sofort)
                weights.resetAll();

                // ✅ zurück auf guest-defaults (nur in-memory)
                settings.resetToDefaults();
                settings.broadcast();
            }
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
            const settings = useSettingsStore();
            const weights = useWeightStore();

            try {
                await svcDeleteAccount(password);
            } finally {
                this.user = null;
                localStorage.removeItem(LS_AUTH_EMAIL);
                setToken(null);

                // ✅ harte UI-Resets (sofort)
                weights.resetAll();

                // ✅ zurück auf guest-defaults (nur in-memory)
                settings.resetToDefaults();
                settings.broadcast();
            }
        },
    },
});
