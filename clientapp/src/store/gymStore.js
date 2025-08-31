import { defineStore } from 'pinia';
export const useGymStore = defineStore('gym', {
    state: () => ({
        workouts: [],
        meals: [],
        weightHistory: [],
        trainingPlans: []
    }),
    actions: {
        addWorkout(workout) {
            this.workouts.push({ ...workout, date: new Date().toISOString() });
        },
        addMeal(meal) {
            this.meals.push({ ...meal, date: new Date().toISOString() });
        },
        addWeightEntry(weight) {
            this.weightHistory.push({ weight, date: new Date().toISOString() });
        },
        addTrainingPlan(plan) {
            this.trainingPlans.push({ ...plan, id: crypto.randomUUID() });
        }
    }
});
