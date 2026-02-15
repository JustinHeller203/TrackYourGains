import { defineStore } from 'pinia'
import { weightsApi } from '@/services/weights'
import type { WeightEntryDto, WeightSummaryDto } from '@/types/weight'

type State = {
    entries: WeightEntryDto[]
    summary: WeightSummaryDto | null
    loadingEntries: boolean
    loadingSummary: boolean
    error: string | null
    loadedEntries: boolean
    loadedSummary: boolean
}

export const useWeightStore = defineStore('weight', {
    state: (): State => ({
        entries: [],
        summary: null,
        loadingEntries: false,
        loadingSummary: false,
        error: null,
        loadedEntries: false,
        loadedSummary: false,
    }),

    getters: {
        latestKg: (s) => s.summary?.latestKg ?? null,
        latestDate: (s) => s.summary?.latestDate ?? null,
        goalKg: (s) => s.summary?.goalKg ?? null,
    },

    actions: {
        resetAll() {
            this.entries = []
            this.summary = null
            this.loadingEntries = false
            this.loadingSummary = false
            this.error = null
            this.loadedEntries = false
            this.loadedSummary = false
        },

        async loadEntries(force = false) {
            if (this.loadedEntries && !force) return
            this.loadingEntries = true
            this.error = null
            try {
                this.entries = await weightsApi.list()
                this.loadedEntries = true
            } catch (e: any) {
                const status = e?.response?.status
                const msg =
                    e?.response?.data?.message ??
                    e?.response?.data ??
                    e?.message ??
                    'Gewichte konnten nicht geladen werden.'
                this.entries = []
                this.loadedEntries = false
                this.error = status ? `(${status}) ${String(msg)}` : String(msg)
            } finally {
                this.loadingEntries = false
            }
        },

        async loadSummary(force = false) {
            if (this.loadedSummary && !force) return
            this.loadingSummary = true
            this.error = null
            try {
                this.summary = await weightsApi.getSummary()
                this.loadedSummary = true
            } catch (e: any) {
                const status = e?.response?.status
                const msg =
                    e?.response?.data?.message ??
                    e?.response?.data ??
                    e?.message ??
                    'Summary konnte nicht geladen werden.'
                this.summary = null
                this.loadedSummary = false
                this.error = status ? `(${status}) ${String(msg)}` : String(msg)
            } finally {
                this.loadingSummary = false
            }
        },

        async setGoal(goalKg: number | null) {
            this.loadingSummary = true
            this.error = null
            try {
                this.summary = await weightsApi.setGoal({ goalKg })
                this.loadedSummary = true
                return this.summary
            } catch (e: any) {
                const status = e?.response?.status
                const msg =
                    e?.response?.data?.message ??
                    e?.response?.data ??
                    e?.message ??
                    'Zielgewicht konnte nicht gespeichert werden.'
                this.error = status ? `(${status}) ${String(msg)}` : String(msg)
                throw e
            } finally {
                this.loadingSummary = false
            }
        },

        async addEntry(weightKg: number, dateIso?: string) {
            this.loadingEntries = true
            this.error = null
            try {
                const iso = dateIso ?? new Date().toISOString()
                await weightsApi.create({ weight: weightKg, date: iso })
                await this.loadEntries(true)
                await this.loadSummary(true)
            } finally {
                this.loadingEntries = false
            }
        },

        async upsertEntry(payload: { weightKg: number; date?: string }) {
            const iso = payload?.date
                ? `${payload.date}T00:00:00.000Z`
                : undefined

            await this.addEntry(payload.weightKg, iso)
        },
    },
})
