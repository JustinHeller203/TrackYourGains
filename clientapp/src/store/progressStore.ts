/*store/progressStore.ts*/

import { defineStore } from "pinia";
import type { ProgressEntry, CreateProgressEntry, UpdateProgressEntry } from "@/types/Progress";
import { listProgress, createProgress, updateProgress, deleteProgress } from "@/services/progress";

const isGuid = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

type PlanState = {
    items: ProgressEntry[];
    loading: boolean;
    error: string | null;
    loaded: boolean;
};

export const useProgressStore = defineStore("progress", {
    state: () => ({
        byPlan: {} as Record<string, PlanState>,
    }),

    actions: {
        ensure(planId: string): PlanState {
            if (!this.byPlan[planId]) {
                this.byPlan[planId] = { items: [], loading: false, error: null, loaded: false };
            }
            return this.byPlan[planId];
        },

        resetAll() {
            this.byPlan = {};
        },

        async load(planId: string, force = false) {
            const s = this.ensure(planId);
            if (s.loaded && !force) return;

            // ✅ lokale/legacy planIds nicht ans Backend schicken
            if (!isGuid(planId)) {
                s.items = [];
                s.loaded = true;
                s.error = null;
                return;
            }

            s.loading = true;
            s.error = null;
            try {
                s.items = await listProgress(planId);
                s.loaded = true;
            } catch (e: any) {
                const status = e?.response?.status
                const msg =
                    e?.response?.data?.message ??
                    e?.response?.data ??
                    e?.message ??
                    "Progress konnte nicht geladen werden."

                if (status === 404) {
                    s.items = []
                    s.loaded = true
                    s.error = null
                    return
                }

                s.items = []
                s.loaded = false
                s.error = status ? `(${status}) ${String(msg)}` : String(msg)
                return
            } finally {
                s.loading = false;
            }
        },

        async add(planId: string, payload: Omit<CreateProgressEntry, "planId"> & { planId?: string }) {
            const s = this.ensure(planId);
            const created = await createProgress({ ...payload, planId });
            // neueste oben (du lädst eh desc)
            s.items = [created, ...s.items];
            return created;
        },

        async edit(planId: string, id: string, payload: UpdateProgressEntry) {
            const s = this.ensure(planId);
            const updated = await updateProgress(id, payload);
            s.items = s.items.map((x) => (x.id === id ? updated : x));
            return updated;
        },

        async remove(planId: string, id: string) {
            const s = this.ensure(planId);
            await deleteProgress(id);
            s.items = s.items.filter((x) => x.id !== id);
            return { ok: true };
        },
    },
});
