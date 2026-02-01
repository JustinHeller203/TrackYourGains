// src/stores/timersStore.ts
import { defineStore } from 'pinia'
import { timersApi, type TimerDto, type UpsertTimerDto } from '@/services/timers'

export interface TimerInstance {
    id: string
    name?: string
    seconds: string | null
    customSeconds: number | null
    time: number
    isRunning: boolean
    interval: number | null
    isFavorite: boolean
    sound: string
    isVisible: boolean
    shouldStaySticky: boolean
    sortIndex: number
    createdUtc?: string
    updatedUtc?: string
}

function dtoToTimer(t: TimerDto): TimerInstance {
    const preset = (t.secondsPreset || '60').toString()
    const time =
        preset === 'custom'
            ? Math.max(1, t.customSeconds ?? 60)
            : Math.max(1, Number(preset) || 60)

    return {
        id: t.id,
        name: t.name || 'Timer',
        seconds: preset,
        customSeconds: preset === 'custom' ? (t.customSeconds ?? time) : null,
        time,
        isRunning: false,
        interval: null,
        isFavorite: !!t.isFavorite,
        sound: t.sound || 'standard',
        isVisible: t.isVisible ?? true,
        shouldStaySticky: !!t.shouldStaySticky,
        sortIndex: t.sortIndex ?? 0,
        createdUtc: t.createdUtc,
        updatedUtc: t.updatedUtc,
    }
}

export const useTimersStore = defineStore('timers', {
    state: () => ({
        items: [] as TimerInstance[],
        isLoading: false,
    }),

    actions: {
        async load() {
            this.isLoading = true
            try {
                const list = await timersApi.list()
                this.items = list
                    .map(dtoToTimer)
                    .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || a.sortIndex - b.sortIndex)
            } finally {
                this.isLoading = false
            }
        },

        async create(name?: string) {
            const dto: UpsertTimerDto = { name: name?.trim() || 'Timer' }
            const created = await timersApi.create(dto)
            const mapped = dtoToTimer(created)
            this.items.push(mapped)
            this.items.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || a.sortIndex - b.sortIndex)
            return mapped
        },

        async update(id: string, patch: UpsertTimerDto) {
            // optimistic UI
            const idx = this.items.findIndex(x => x.id === id)
            if (idx >= 0) {
                const cur = this.items[idx]
                const next = { ...cur }

                if (patch.name != null) next.name = patch.name || 'Timer'
                if (patch.sound != null) next.sound = patch.sound || 'standard'
                if (patch.isFavorite != null) next.isFavorite = !!patch.isFavorite
                if (patch.isVisible != null) next.isVisible = !!patch.isVisible
                if (patch.shouldStaySticky != null) next.shouldStaySticky = !!patch.shouldStaySticky

                if (patch.secondsPreset != null) {
                    const preset = (patch.secondsPreset || '60').toString()
                    next.seconds = preset
                    if (preset !== 'custom') {
                        next.customSeconds = null
                        next.time = Math.max(1, Number(preset) || 60)
                    }
                }

                if (patch.customSeconds != null) {
                    const cs = Math.max(1, patch.customSeconds ?? 60)
                    next.customSeconds = cs
                    next.seconds = 'custom'
                    next.time = cs
                }

                this.items[idx] = next
            }

            await timersApi.update(id, patch)

            // Favorites-Order wie dein UI
            this.items.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0) || a.sortIndex - b.sortIndex)
        },

        async remove(id: string) {
            await timersApi.remove(id)
            this.items = this.items.filter(x => x.id !== id)
        },

        async reorder(orderedIds: string[]) {
            // optimistic
            const map = new Map(this.items.map(t => [t.id, t]))
            const reordered = orderedIds.map(id => map.get(id)).filter(Boolean) as TimerInstance[]
            this.items = reordered.map((t, i) => ({ ...t, sortIndex: i }))

            await timersApi.reorder({ orderedIds })
        },
    },
})
