//store/trainingPlanStore.ts

import { defineStore } from "pinia";
import { useAuthStore } from "@/store/authStore";
import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "@/types/TrainingPlan";
import {
    listTrainingPlans,
    getTrainingPlan,
    createTrainingPlan,
    updateTrainingPlan,
    deleteTrainingPlan,
    setTrainingPlanFavorite,
} from "@/services/trainingPlans";

const is401 = (e: any): boolean => {
    const status =
        e?.status ??
        e?.response?.status ??
        e?.data?.status ??
        e?.statusCode

    if (status === 401) return true

    const msg = String(e?.message ?? '').toLowerCase()
    return msg.includes('401') || msg.includes('unauthorized')
}

export const useTrainingPlansStore = defineStore("trainingPlans", {
    state: () => ({
        items: [] as TrainingPlanDto[],
        selected: null as TrainingPlanDto | null,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        hasPlans: (s): boolean => s.items.length > 0,
        favorites: (s) => s.items.filter((p: TrainingPlanDto) => p.isFavorite),
    },

    actions: {
        async loadList() {
            const auth = useAuthStore();
            if (!auth.isAuthenticated) {
                // guest-mode: nix laden, nix failen
                this.items = [];
                this.selected = null;
                this.error = null;
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                this.items = await listTrainingPlans();
            } catch (e: any) {
                if (is401(e)) {
                    // token ist kaputt/abgelaufen -> ruhig bleiben und UI clean halten
                    this.items = [];
                    this.selected = null;
                    this.error = null;
                    return;
                }
                this.error = e?.message ?? "TrainingPlans konnten nicht geladen werden.";
            } finally {
                this.loading = false;
            }
        },

        async loadOne(id: string) {
            const auth = useAuthStore();
            if (!auth.isAuthenticated) {
                this.selected = null;
                this.error = null;
                return;
            }

            this.loading = true;
            this.error = null;

            try {
                const full = await getTrainingPlan(id);
                this.selected = full;

                const idx = this.items.findIndex((p: TrainingPlanDto) => p.id === id);
                if (idx >= 0) {
                    this.items = this.items.map((p: TrainingPlanDto) => (p.id === id ? full : p));
                } else {
                    this.items = [full, ...this.items];
                }
            } catch (e: any) {
                if (is401(e)) {
                    this.selected = null;
                    this.error = null;
                    return;
                }
                this.error = e?.message ?? "TrainingPlan konnte nicht geladen werden.";
            } finally {
                this.loading = false;
            }
        },

        async create(payload: TrainingPlanUpsert) {
            this.loading = true;
            this.error = null;
            try {
                const created = await createTrainingPlan(payload);
                this.items = [created, ...this.items];
                this.selected = created;
                return created;
            } catch (e: any) {
                this.error = e?.message ?? "TrainingPlan konnte nicht erstellt werden.";
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async update(id: string, payload: TrainingPlanUpsert) {
            this.loading = true;
            this.error = null;
            try {
                const updated = await updateTrainingPlan(id, payload);
                this.items = this.items.map((p: TrainingPlanDto) => (p.id === id ? updated : p));
                if (this.selected?.id === id) this.selected = updated;
                return updated;
            } catch (e: any) {
                this.error = e?.message ?? "TrainingPlan konnte nicht gespeichert werden.";
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async remove(id: string) {
            this.loading = true;
            this.error = null;
            try {
                await deleteTrainingPlan(id);
                this.items = this.items.filter((p: TrainingPlanDto) => p.id !== id);
                if (this.selected?.id === id) this.selected = null;
            } catch (e: any) {
                this.error = e?.message ?? "TrainingPlan konnte nicht gelöscht werden.";
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async toggleFavorite(id: string) {
            const plan = this.items.find((p: TrainingPlanDto) => p.id === id);
            if (!plan) return;

            // optimistisch:
            const next = !plan.isFavorite;
            this.items = this.items.map((p: TrainingPlanDto) => (p.id === id ? { ...p, isFavorite: next } : p));
            if (this.selected?.id === id) this.selected = { ...this.selected, isFavorite: next };

            try {
                const updated = await setTrainingPlanFavorite(id, next);
                this.items = this.items.map((p: TrainingPlanDto) => (p.id === id ? updated : p));
                if (this.selected?.id === id) this.selected = updated;
            } catch {
                // rollback
                this.items = this.items.map((p: TrainingPlanDto) => (p.id === id ? { ...p, isFavorite: !next } : p));
                if (this.selected?.id === id) this.selected = { ...this.selected, isFavorite: !next };
            }
        },
    },
});
