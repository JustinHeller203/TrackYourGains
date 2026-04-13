export type TrainingGoalType =
    | 'body_weight'
    | 'exercise_weight'
    | 'exercise_reps'
    | 'weekly_frequency'

export type TrainingGoalStatus = 'achieved' | 'on_track' | 'in_progress' | 'needs_attention' | 'no_data'

export interface TrainingGoal {
    id: string
    type: TrainingGoalType
    title: string
    targetValue: number
    baselineValue: number | null
    currentValue?: number | null
    exerciseId?: string | null
    exerciseName?: string | null
    deadline?: string | null
    note?: string | null
    archived?: boolean
    createdAt: string
    updatedAt: string
}

export interface GoalWeightSample {
    date: string
    weight: number
}

export interface GoalWorkoutSample {
    id?: string | null
    exercise: string
    date: string
    type?: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer' | null
    weight?: number | null
    sets?: number | null
    reps?: number | null
    setDetails?: Array<{
        weight: number | null
        reps: number | null
        durationSec?: number | null
        label?: string | null
    }> | null
}

export interface TrainingGoalEvaluation {
    goal: TrainingGoal
    status: TrainingGoalStatus
    percent: number
    currentValue: number | null
    baselineValue: number | null
    targetValue: number
    isAchieved: boolean
    remainingValue: number | null
    trendValue: number | null
    primaryText: string
    secondaryText: string
    statusText: string
    targetLabel: string
    currentLabel: string
    baselineLabel: string | null
    deadlineLabel: string | null
}
