import { defineStore } from "pinia";
import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "@/types/trainingPlan";
import { listTrainingPlans, getTrainingPlan, createTrainingPlan, updateTrainingPlan, deleteTrainingPlan, setTrainingPlanFavorite } from "@/services/trainingPlans";

export const useTrainingPlansStore = defineStore("trainingPlans", {
    state: () => ({
        items: [] as TrainingPlanDto[],
        selected: null as TrainingPlanDto | null,
        loading: false,
        error: null as string | null,
    }),

    getters: {
        hasPlans: (s) => s.items.length > 0,
        favorites: (s) => s.items.filter(p => p.isFavorite),
    },

    actions: {
        async loadList() {
            this.loading = true;
            this.error = null;
            try {
                this.items = await listTrainingPlans();
            } catch (e: any) {
                this.error = e?.message ?? "TrainingPlans konnten nicht geladen werden.";
            } finally {
                this.loading = false;
            }
        },

        async loadOne(id: string) {
            this.loading = true;
            this.error = null;
            try {
                this.selected = await getTrainingPlan(id);
            } catch (e: any) {
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
                this.items = this.items.map(p => (p.id === id ? updated : p));
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
                this.items = this.items.filter(p => p.id !== id);
                if (this.selected?.id === id) this.selected = null;
            } catch (e: any) {
                this.error = e?.message ?? "TrainingPlan konnte nicht gelöscht werden.";
                throw e;
            } finally {
                this.loading = false;
            }
        },

        async toggleFavorite(id: string) {
            const plan = this.items.find(p => p.id === id);
            if (!plan) return;

            // optimistisch:
            const next = !plan.isFavorite;
            this.items = this.items.map(p => (p.id === id ? { ...p, isFavorite: next } : p));
            if (this.selected?.id === id) this.selected = { ...this.selected, isFavorite: next };

            try {
                const updated = await setTrainingPlanFavorite(id, next);
                this.items = this.items.map(p => (p.id === id ? updated : p));
                if (this.selected?.id === id) this.selected = updated;
            } catch {
                // rollback
                this.items = this.items.map(p => (p.id === id ? { ...p, isFavorite: !next } : p));
                if (this.selected?.id === id) this.selected = { ...this.selected, isFavorite: !next };
            }
        },
    },
});
