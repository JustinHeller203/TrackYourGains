import { api } from '@/lib/api'
import type {
    WeightEntryDto,
    CreateWeightEntryDto,
    WeightSummaryDto,
    SetGoalWeightDto,
} from '@/types/weight'

export const weightsApi = {
    async list(): Promise<WeightEntryDto[]> {
        const { data } = await api.get<WeightEntryDto[]>('/weights')
        return data
    },

    async create(dto: CreateWeightEntryDto): Promise<WeightEntryDto> {
        const { data } = await api.post<WeightEntryDto>('/weights', dto)
        return data
    },

    async clear(): Promise<{ ok: true }> {
        const { data } = await api.delete<{ ok: true }>('/weights')
        return data
    },

    async getSummary(): Promise<WeightSummaryDto> {
        const { data } = await api.get<WeightSummaryDto>('/weights/summary')
        return data
    },

    async setGoal(dto: SetGoalWeightDto): Promise<WeightSummaryDto> {
        const { data } = await api.put<WeightSummaryDto>('/weights/goal', dto)
        return data
    },
}
