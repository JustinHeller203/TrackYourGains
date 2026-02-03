//services/stopwatches.ts

import { api } from '@/lib/api'
import type { StopwatchDto, UpsertStopwatchDto, ReorderStopwatchesDto } from '@/types/stopwatch'

export const stopwatchesApi = {
    async list(): Promise<StopwatchDto[]> {
        const { data } = await api.get<StopwatchDto[]>('/stopwatches')
        return data
    },

    async create(dto: UpsertStopwatchDto): Promise<StopwatchDto> {
        const { data } = await api.post<StopwatchDto>('/stopwatches', dto)
        return data
    },

    async update(id: string, dto: UpsertStopwatchDto): Promise<{ ok: true }> {
        const { data } = await api.put<{ ok: true }>(`/stopwatches/${id}`, dto)
        return data
    },

    async remove(id: string): Promise<{ ok: true }> {
        const { data } = await api.delete<{ ok: true }>(`/stopwatches/${id}`)
        return data
    },

    async reorder(dto: ReorderStopwatchesDto): Promise<{ ok: true }> {
        const { data } = await api.put<{ ok: true }>('/stopwatches/reorder', dto)
        return data
    },
}
