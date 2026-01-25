import { api } from "@/lib/api";
import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "../types/trainingPlan";

export async function listTrainingPlans() {
    const { data } = await api.get<TrainingPlanDto[]>("/training-plans");
    return data;
}

export async function getTrainingPlan(id: string) {
    const { data } = await api.get<TrainingPlanDto>(`/training-plans/${id}`);
    return data;
}

export async function createTrainingPlan(payload: TrainingPlanUpsert) {
    const { data } = await api.post<TrainingPlanDto>("/training-plans", payload);
    return data;
}

export async function updateTrainingPlan(id: string, payload: TrainingPlanUpsert) {
    const { data } = await api.put<TrainingPlanDto>(`/training-plans/${id}`, payload);
    return data;
}

export async function deleteTrainingPlan(id: string) {
    await api.delete(`/training-plans/${id}`);
    return { ok: true };
}

// optional: wenn du später einen eigenen Endpoint machst (PATCH /favorite):
export async function setTrainingPlanFavorite(id: string, isFavorite: boolean) {
    // wenn du (noch) keinen PATCH hast, kannst du erstmal über PUT lösen
    const plan = await getTrainingPlan(id);
    return updateTrainingPlan(id, {
        name: plan.name,
        isFavorite,
        days: plan.days.map((d: TrainingPlanDto["days"][number]) => ({
            name: d.name,
            sortOrder: d.sortOrder,
            exercises: d.exercises.map((x: TrainingPlanDto["days"][number]["exercises"][number]) => ({
                name: x.name,
                category: x.category,
                sortOrder: x.sortOrder,
                sets: x.sets ?? null,
                reps: x.reps ?? null,
                targetWeight: x.targetWeight ?? null,
                restSeconds: x.restSeconds ?? null,
                durationMin: x.durationMin ?? null,
                distanceKm: x.distanceKm ?? null,
                notes: x.notes ?? null,
            })),
        })),
    });
}
