import { defineStore } from 'pinia'
import type { Workout } from '@/types/Workout'
import type { Meal } from '@/types/Meal'
import type { TrainingPlan } from "@/types/TrainingPlan";

interface GymState {
    workouts: Workout[]
    meals: Meal[]
    weightHistory: { weight: number; date: string }[]
    trainingPlans: TrainingPlan[]
}

export const useGymStore = defineStore('gym', {
    state: (): GymState => ({
        workouts: [],
        meals: [],
        weightHistory: [],
        trainingPlans: []
    }),
    actions: {
        addWorkout(workout: Workout) {
            this.workouts.push({ ...workout, date: new Date().toISOString() })
        },
        addMeal(meal: Meal) {
            this.meals.push({ ...meal, date: new Date().toISOString() })
        },
        addWeightEntry(weight: number) {
            this.weightHistory.push({ weight, date: new Date().toISOString() })
        },
        addTrainingPlan(plan: TrainingPlan) {
            this.trainingPlans.push({ ...plan, id: crypto.randomUUID() })
        }
    }
})