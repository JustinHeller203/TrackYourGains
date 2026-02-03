export interface TrainingEntry {
    date: string;    // ISO
    type?: "strength" | "cardio" | "mixed";
}

export interface WeightEntry {
    date: string;    // ISO
}

export interface NutritionEntry {
    date: string;    // ISO
}

export interface AutoGoalResult {
    muscle: number;
    weightTracking: number;
    nutrition: number;
}

function percentageClamp(n: number) {
    return Math.max(0, Math.min(100, n));
}

export function useAutoGoals() {
    const DAY = 86400000;

    function daysAgo(date: string) {
        return Math.floor((Date.now() - new Date(date).getTime()) / DAY);
    }

    function calcMuscleGoal(
        trainings: TrainingEntry[],
        weeklyGoal: number,
        previous: number
    ) {
        const last7 = trainings.filter(t => daysAgo(t.date) <= 7).length;
        const last30 = trainings.filter(t => daysAgo(t.date) <= 30).length;

        // Baseline: Wochenziel-Erfüllung
        let ratio = last7 / weeklyGoal;
        let base = Math.min(1, ratio) * 100;

        // Bonus für Langzeitkonsistenz (sehr motivierend)
        let longTerm = Math.min(1, last30 / (weeklyGoal * 4)) * 20;

        const target = percentageClamp(base + longTerm);

        // Soft limit: max ±10% pro Tag
        const diff = target - previous;
        const limited = previous + Math.max(-10, Math.min(10, diff));
        return percentageClamp(limited);
    }

    function calcWeightTracking(
        weights: WeightEntry[],
        previous: number
    ) {
        const last7 = weights.filter(w => daysAgo(w.date) <= 7).length;
        const last30 = weights.filter(w => daysAgo(w.date) <= 30).length;

        let score = 0;

        if (last7 >= 5) score = 100;
        else if (last7 >= 3) score = 70;
        else if (last7 >= 1) score = 40;

        // leichte Langzeitkomponente
        score += Math.min(30, last30);

        const target = percentageClamp(score);

        const diff = target - previous;
        const limited = previous + Math.max(-10, Math.min(10, diff));

        return percentageClamp(limited);
    }

    function calcNutrition(
        logs: NutritionEntry[],
        previous: number
    ) {
        const last7 = logs.filter(e => daysAgo(e.date) <= 7).length;

        let score = 0;

        if (last7 >= 7) score = 100;
        else if (last7 >= 5) score = 80;
        else if (last7 >= 3) score = 60;
        else if (last7 >= 1) score = 30;

        const target = percentageClamp(score);

        const diff = target - previous;
        const limited = previous + Math.max(-10, Math.min(10, diff));

        return percentageClamp(limited);
    }

    function calculateGoals(
        params: {
            trainings: TrainingEntry[];
            weights: WeightEntry[];
            nutrition: NutritionEntry[];
            weeklyGoal: number;
            previous: AutoGoalResult;
        }
    ): AutoGoalResult {
        return {
            muscle: calcMuscleGoal(
                params.trainings,
                params.weeklyGoal,
                params.previous.muscle
            ),
            weightTracking: calcWeightTracking(
                params.weights,
                params.previous.weightTracking
            ),
            nutrition: calcNutrition(
                params.nutrition,
                params.previous.nutrition
            )
        };
    }

    return {
        calculateGoals
    };
}
