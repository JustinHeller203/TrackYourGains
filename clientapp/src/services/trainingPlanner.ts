import { api } from "@/lib/api";

export type TrainingPlannerItem = {
    id: string;
    planId?: string | null;
    date: string; // ISO
    planName?: string | null;
    planColor?: string | null;
    isRestDay?: boolean;
};

export async function listTrainingPlanner() {
    const { data } = await api.get<TrainingPlannerItem[]>("/training-planner");
    return data;
}

export async function addTrainingPlanner(planId: string, dateIso: string) {
    const { data } = await api.post<TrainingPlannerItem>("/training-planner", { planId, date: dateIso });
    return data;
}

export async function deleteTrainingPlanner(planId: string, dateIso: string) {
    const { data } = await api.delete<{ ok: true }>("/training-planner", { params: { planId, date: dateIso } });
    return data;
}

export async function addTrainingPlannerRestDay(dateIso: string) {
    const { data } = await api.post<TrainingPlannerItem>("/training-planner/rest", { date: dateIso });
    return data;
}

export async function deleteTrainingPlannerRestDay(dateIso: string) {
    const { data } = await api.delete<{ ok: true }>("/training-planner/rest", { params: { date: dateIso } });
    return data;
}
