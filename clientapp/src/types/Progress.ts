/*types/Progress.ts*/

export type ProgressType = "kraft" | "calisthenics" | "ausdauer" | "dehnung";

export type ProgressEntry = {
    id: string;
    planId: string;
    date: string; // ISO (Backend speichert als DATE)
    exercise: string;
    type: ProgressType;

    sets: number | null;
    reps: number | null;
    weightKg: number | null;

    durationMin: number | null;
    distanceKm: number | null;

    note: string | null;
    tempo: string | null;
    restSeconds: number | null;
};

export type CreateProgressEntry = {
    planId: string;
    date: string; // ISO string
    exercise: string;
    type: ProgressType;

    sets?: number | null;
    reps?: number | null;
    weightKg?: number | null;

    durationMin?: number | null;
    distanceKm?: number | null;

    note?: string | null;
    tempo?: string | null;
    restSeconds?: number | null;
};

export type UpdateProgressEntry = {
    date: string; // ISO string
    exercise: string;
    type: ProgressType;

    sets?: number | null;
    reps?: number | null;
    weightKg?: number | null;

    durationMin?: number | null;
    distanceKm?: number | null;

    note?: string | null;
    tempo?: string | null;
    restSeconds?: number | null;
};
