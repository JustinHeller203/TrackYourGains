import type { ComplaintArea } from '@/types/complaint'

export const GOAL_TYPES = [
    'muscle_gain',
    'strength',
    'fat_loss',
    'general_fitness',
    'endurance',
    'health',
] as const

export type GoalType = typeof GOAL_TYPES[number]

export const TRAINING_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type TrainingLevel = typeof TRAINING_LEVELS[number]

export const SPLIT_TYPES = ['full_body', 'upper_lower', 'ppl', 'mixed', 'machine_focus'] as const
export type SplitType = typeof SPLIT_TYPES[number]

export type ComplaintType = ComplaintArea

export type ExclusionType =
    | 'no_jumping'
    | 'no_overhead'
    | 'no_deep_knee_flexion'
    | 'no_high_axial_load'
    | 'no_rotation'
    | 'no_unstable'

export type ExerciseReferenceSource = 'known' | 'custom'
export type ExerciseMatchType = 'exact' | 'alias' | 'fuzzy' | 'custom'

export interface GeneratorExerciseReference {
    label: string
    canonicalName: string
    exerciseId?: string
    muscleGroup?: string
    source: ExerciseReferenceSource
    matchType: ExerciseMatchType
}

export interface EquipmentProfile {
    fullGym: boolean
    homeGym: boolean
    bodyweightOnly: boolean
    dumbbellsOnly: boolean
    machinesAvailable: boolean
    cablesAvailable: boolean
    barbellAvailable: boolean
    cardioMachinesAvailable: boolean
}

export interface GeneratorPreferences {
    splitPreference?: 'auto' | 'full_body' | 'upper_lower' | 'ppl'
    machineFocus?: boolean
    machineFocusWeight?: number
    freeWeightFocus?: boolean
    freeWeightFocusWeight?: number
    jointFriendly?: boolean
    jointFriendlyWeight?: number
    shortSessions?: boolean
    noCardio?: boolean
    noHiit?: boolean
    focusMuscleGroups?: string[]
    preferredExercises?: string[]
    preferredExerciseRefs?: GeneratorExerciseReference[]
}

export interface GeneratorExclusions {
    exerciseNames?: string[]
    muscleGroups?: string[]
    exclusionTypes?: ExclusionType[]
    exerciseRefs?: GeneratorExerciseReference[]
}

export interface GeneratorInput {
    planName?: string
    primaryGoal: GoalType
    secondaryGoals?: GoalType[]
    level: TrainingLevel
    weeklyFrequency: number
    sessionDurationMin: number
    equipmentProfile: EquipmentProfile
    preferences?: GeneratorPreferences
    activeComplaints?: ComplaintType[]
    exclusions?: GeneratorExclusions
}

export interface GeneratedExercise {
    exerciseId: string
    exerciseName: string
    muscleGroup: string
    movementPattern?: string
    category: 0 | 1 | 2 | 3
    sets?: number
    reps?: number
    durationMin?: number
    distanceKm?: number
    restSeconds?: number
    rir?: number
    rpe?: number
    notes?: string
    substitutions?: string[]
    complaintAdjustmentReason?: string
}

export interface GeneratedWorkoutDay {
    dayIndex: number
    dayName: string
    focus: string
    estimatedDuration: number
    exercises: GeneratedExercise[]
}

export interface GeneratedPlan {
    planName: string
    primaryGoal: GoalType
    secondaryGoals: GoalType[]
    level: TrainingLevel
    splitType: SplitType
    weeklyFrequency: number
    sessionDuration: number
    equipmentProfile: EquipmentProfile
    activeComplaints: ComplaintType[]
    exclusions: GeneratorExclusions
    difficulty: 'low' | 'moderate' | 'high'
    summary: string
    rationale: string[]
    progressionGuidance: string
    deloadHint: string
    warmupRecommendation: string
    complaintAdaptationSummary: string[]
    whyThisPlanWasGenerated: string[]
    days: GeneratedWorkoutDay[]
}
