export type TrainingCategory = number;

export interface TrainingExercise {
    id: string;
    name: string;
    category: TrainingCategory;
    sortOrder: number;
    sets?: number | null;
    reps?: number | null;
    targetWeight?: number | null;
    restSeconds?: number | null;
    durationMin?: number | null;
    distanceKm?: number | null;
    notes?: string | null;
}

export interface TrainingDay {
    id: string;
    name: string;
    sortOrder: number;
    exercises: TrainingExercise[];
}

export interface TrainingPlan {
    id: string;
    name: string;
    isFavorite: boolean;
    createdUtc: string;
    updatedUtc: string;
    code?: string;
    exerciseCount?: number;
    days?: TrainingDay[];
}


export type TrainingPlanUpsert = {
    name: string;
    isFavorite: boolean;
    days: Array<{
        name: string;
        sortOrder: number;
        exercises: Array<{
            name: string;
            category: TrainingCategory;
            sortOrder: number;
            sets?: number | null;
            reps?: number | null;
            targetWeight?: number | null;
            restSeconds?: number | null;
            durationMin?: number | null;
            distanceKm?: number | null;
            notes?: string | null;
        }>;
    }>;
};