import type { Workout } from './Workout'

export interface TrainingPlan {
    id: string
    name: string
    workouts: Workout[]
}