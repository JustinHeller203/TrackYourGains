import { api } from '@/lib/api'
import type { ExerciseLibraryEntryDto } from '@/types/exerciseLibrary'

export async function listExerciseLibrary(params?: {
    query?: string
    muscleGroup?: string
    take?: number
}) {
    const { data } = await api.get<ExerciseLibraryEntryDto[]>('/exercise-library', { params })
    return Array.isArray(data) ? data : []
}
