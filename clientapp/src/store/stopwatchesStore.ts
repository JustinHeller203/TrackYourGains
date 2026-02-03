//store/stopwatchesStore.ts

import { defineStore } from 'pinia'
import { stopwatchesApi } from '@/services/stopwatches'
import type { StopwatchDto, StopwatchInstance, UpsertStopwatchDto } from '@/types/stopwatch'
export type { StopwatchInstance } from '@/types/stopwatch'

import { useAuthStore } from '@/store/authStore'

function is401(e: any): boolean {
    const status = e?.response?.status ?? e?.status
    return status === 401
}
function clampMs(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v)
    if (!Number.isFinite(n)) return 0
    return n < 0 ? 0 : Math.floor(n)
}

function dtoToStopwatch(s: StopwatchDto): StopwatchInstance {
    return {
        id: s.id,
        name: s.name || 'Stoppuhr',
        elapsedMs: clampMs(s.elapsedMs),
        isRunning: !!s.isRunning,
        startedAtUtc: s.startedAtUtc ?? null,
        isVisible: s.isVisible ?? true,
        shouldStaySticky: !!s.shouldStaySticky,
        sortIndex: s.sortIndex ?? 0,
        createdUtc: s.createdUtc,
        updatedUtc: s.updatedUtc,
        laps: [], // local only
    }
}

// Effektive ms (wenn running, add delta seit startedAtUtc)
export function effectiveElapsedMs(sw: StopwatchInstance): number {
    if (!sw.isRunning || !sw.startedAtUtc) return clampMs(sw.elapsedMs)
    const started = Date.parse(sw.startedAtUtc)
    if (!Number.isFinite(started)) return clampMs(sw.elapsedMs)
    const delta = Date.now() - started
    return clampMs(sw.elapsedMs + delta)
}

export const useStopwatchesStore = defineStore('stopwatches', {
    state: () => ({
        items: [] as StopwatchInstance[],
        isLoading: false,
    }),

    actions: {
        async load() {
            const auth = useAuthStore()
            if (!auth.isAuthenticated) {
                this.items = []
                return
            }

            this.isLoading = true
            try {
                const list = await stopwatchesApi.list()
                this.items = list
                    .map(dtoToStopwatch)
                    .sort((a, b) => a.sortIndex - b.sortIndex)
            } catch (e: any) {
                if (is401(e)) {
                    this.items = []
                    return
                }
                throw e
            } finally {
                this.isLoading = false
            }
        },

        ensureAuthOrThrow() {
            const auth = useAuthStore()
            if (!auth.isAuthenticated) throw new Error('AUTH_REQUIRED')
        },
        async create(name?: string) {

            this.ensureAuthOrThrow()

            const dto: UpsertStopwatchDto = { name: name?.trim() || 'Stoppuhr' }
            const created = await stopwatchesApi.create(dto)
            const mapped = dtoToStopwatch(created)
            this.items.push(mapped)
            this.items.sort((a, b) => a.sortIndex - b.sortIndex)
            return mapped
        },

        async update(id: string, patch: UpsertStopwatchDto) {
            this.ensureAuthOrThrow()
            const idx = this.items.findIndex(x => x.id === id)
            if (idx >= 0) {
                const cur = this.items[idx]
                const next: StopwatchInstance = { ...cur }

                if (patch.name != null) next.name = (patch.name || next.name).trim()
                if (patch.elapsedMs != null) next.elapsedMs = clampMs(patch.elapsedMs)
                if (patch.isVisible != null) next.isVisible = !!patch.isVisible
                if (patch.shouldStaySticky != null) next.shouldStaySticky = !!patch.shouldStaySticky

                if (patch.isRunning != null) {
                    next.isRunning = !!patch.isRunning
                    if (next.isRunning) {
                        next.startedAtUtc = patch.startedAtUtc ?? next.startedAtUtc ?? new Date().toISOString()
                    } else {
                        next.startedAtUtc = null
                    }
                } else if (patch.startedAtUtc != null) {
                    if (next.isRunning) next.startedAtUtc = patch.startedAtUtc
                }

                this.items[idx] = next
            }

            await stopwatchesApi.update(id, patch)
        },

        async remove(id: string) {
            this.ensureAuthOrThrow()

            await stopwatchesApi.remove(id)
            this.items = this.items.filter(x => x.id !== id)
        },

        async reorder(orderedIds: string[]) {
            this.ensureAuthOrThrow()
            const map = new Map(this.items.map(s => [s.id, s]))
            const reordered = orderedIds.map(id => map.get(id)).filter(Boolean) as StopwatchInstance[]
            this.items = reordered.map((s, i) => ({ ...s, sortIndex: i }))

            await stopwatchesApi.reorder({ orderedIds })
        },

        // ---- Convenience Actions (für dein Component-Life einfacher) ----

        async start(id: string) {
            this.ensureAuthOrThrow()

            const sw = this.items.find(x => x.id === id)
            if (!sw || sw.isRunning) return

            await this.update(id, {
                isRunning: true,
                startedAtUtc: new Date().toISOString(),
            })
        },

        async stop(id: string) {
            this.ensureAuthOrThrow()

            const sw = this.items.find(x => x.id === id)
            if (!sw || !sw.isRunning) return

            const total = effectiveElapsedMs(sw)

            await this.update(id, {
                elapsedMs: total,
                isRunning: false,
            })
        },

        async reset(id: string) {
            this.ensureAuthOrThrow()

            const sw = this.items.find(x => x.id === id)
            if (!sw) return

            // local laps reset
            sw.laps = []

            await this.update(id, {
                elapsedMs: 0,
                isRunning: false,
            })
        },

        lap(id: string) {
            const sw = this.items.find(x => x.id === id)
            if (!sw) return

            const t = effectiveElapsedMs(sw)
            sw.laps = sw.laps ?? []
            sw.laps.unshift({ time: t })
        },
    },
})
