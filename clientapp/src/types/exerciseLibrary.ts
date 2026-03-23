export type ExerciseLibraryEntryDto = {
    id: number
    key: string
    name: string
    primaryMuscleGroup: string
    secondaryMuscleGroups: string[]
    kind: string
    movementPattern: string
    equipment: string[]
    level: string
    stability: string
    axialLoad: string
    overhead: boolean
    deepKneeFlexion: boolean
    impact: string
    rotation: boolean
    jointLoad: Record<string, string>
    goalTags: string[]
    substitutions: string[]
    similarityTags?: string[]
    aliases: string[]
}
