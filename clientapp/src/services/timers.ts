// src/services/timers.ts
import { api } from '@/lib/api'

export type TimerDto = {
    id: string
    name: string
    secondsPreset: string
    customSeconds: number | null
    sound: string
    isFavorite: boolean
    isVisible: boolean
    shouldStaySticky: boolean
    sortIndex: number
    createdUtc: string
    updatedUtc: string
}

export type UpsertTimerDto = {
    name?: string | null
    secondsPreset?: string | null
    customSeconds?: number | null
    sound?: string | null
    isFavorite?: boolean | null
    isVisible?: boolean | null
    shouldStaySticky?: boolean | null
}

export type ReorderTimersDto = {
    orderedIds: string[]
}

export const timersApi = {
    async list(): Promise<TimerDto[]> {
        const { data } = await api.get<TimerDto[]>('/timers')
        return data
    },

    async create(dto: UpsertTimerDto): Promise<TimerDto> {
        const { data } = await api.post<TimerDto>('/timers', dto)
        return data
    },

    async update(id: string, dto: UpsertTimerDto): Promise<{ ok: true }> {
        const { data } = await api.put<{ ok: true }>(`/timers/${id}`, dto)
        return data
    },

    async remove(id: string): Promise<{ ok: true }> {
        const { data } = await api.delete<{ ok: true }>(`/timers/${id}`)
        return data
    },

    async reorder(dto: ReorderTimersDto): Promise<{ ok: true }> {
        const { data } = await api.put<{ ok: true }>('/timers/reorder', dto)
        return data
    },
}
