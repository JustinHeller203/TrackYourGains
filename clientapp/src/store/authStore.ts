// src/store/authStore.ts
import { defineStore } from "pinia";
import { login, register, logout, changeEmail, changePassword, deleteAccount as svcDeleteAccount } from "@/services/auth";
import { getProfile, updateProfile } from "@/services/profile";
import { useSettingsStore } from "@/store/settingsStore";
import { LS_AUTH_EMAIL } from "@/constants/storageKeys";
import { getToken, setToken } from "@/lib/api";
import { useWeightStore } from "@/store/weightStore";

type AuthResponseDto = { token: string; email: string };

type User = { email: string; username: string; hasCreatedTrainingPlan: boolean };

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
                this.user = { email, username: "", hasCreatedTrainingPlan: false };
                // ✅ sobald eingeloggt: settings aus Backend ziehen
                try {
                    await settings.loadFromBackend()
                } catch {
                    settings.resetToDefaults()
                }
                settings.broadcast()

                // ✅ Profil-Flags laden
                try {
                    const profile = await getProfile()
                    if (this.user) {
                        this.user.hasCreatedTrainingPlan = !!profile?.hasCreatedTrainingPlan
                        this.user.username = String(profile?.username ?? "")
                    }
                } catch {
                    // ignore, defaults bleiben
                }
            } else {
                this.user = null;
                setToken(null);
                // ✅ guest: defaults (nur in-memory)
                settings.resetToDefaults();
            }

            this.loading = false;
        },

        async signIn(username: string, password: string) {
            const settings = useSettingsStore();

            const data: AuthResponseDto = await login(username, password);
            this.user = { email: data.email, username: "", hasCreatedTrainingPlan: false };
            setToken(data.token);
            localStorage.setItem(LS_AUTH_EMAIL, data.email);

            // ✅ backend settings laden
            try {
                await settings.loadFromBackend()
            } catch {
                settings.resetToDefaults()
            }
            settings.broadcast()

            // ✅ Profil-Flags laden
            try {
                const profile = await getProfile()
                if (this.user) {
                    this.user.hasCreatedTrainingPlan = !!profile?.hasCreatedTrainingPlan
                    this.user.username = String(profile?.username ?? "")
                }
            } catch {
                // ignore
            }
        },

        async signUp(email: string, username: string, password: string, confirmPassword: string) {
            const settings = useSettingsStore();

            const data: AuthResponseDto = await register(email, username, password, confirmPassword);
            this.user = { email: data.email, username: "", hasCreatedTrainingPlan: false };
            setToken(data.token);
            localStorage.setItem(LS_AUTH_EMAIL, data.email);

            // ✅ backend settings laden
            try {
                await settings.loadFromBackend()
            } catch {
                settings.resetToDefaults()
            }
            settings.broadcast()

            // ✅ Profil-Flags laden (falls Backend direkt setzt)
            try {
                const profile = await getProfile()
                if (this.user) {
                    this.user.hasCreatedTrainingPlan = !!profile?.hasCreatedTrainingPlan
                    this.user.username = String(profile?.username ?? "")
                }
            } catch {
                // ignore
            }
        },

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

        async setHasCreatedTrainingPlan() {
            if (!this.user) return
            if (this.user.hasCreatedTrainingPlan) return
            try {
                await updateProfile({ hasCreatedTrainingPlan: true })
                this.user.hasCreatedTrainingPlan = true
            } catch {
                // ignore
            }
        },
    },
});
