import { defineStore } from 'pinia'
import { listExerciseLibrary } from '@/services/exerciseLibrary'
import {
    hydrateExerciseLibrary,
    toExerciseMetadata,
    type ExerciseMetadata,
} from '@/services/training/exerciseLibrary'

type ExerciseLibraryState = {
    entries: ExerciseMetadata[]
    loaded: boolean
    loading: boolean
}

type AddCustomExerciseInput = {
    name: string
    muscleGroup?: string
    secondaryMuscleGroups?: string[]
    aliases?: string[]
    kind: ExerciseMetadata['kind']
    equipment?: ExerciseMetadata['equipment']
    level?: ExerciseMetadata['level']
    tutorial?: ExerciseMetadata['tutorial']
}

let pendingLoad: Promise<void> | null = null
const LS_CUSTOM_EXERCISES_KEY = 'tyg.exercise-library.custom.v1'

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function normalizeToken(value: string) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function normalizeText(value: string) {
    return String(value ?? '').trim()
}

function readCustomEntries(): ExerciseMetadata[] {
    if (!canUseStorage()) return []
    try {
        const raw = window.localStorage.getItem(LS_CUSTOM_EXERCISES_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed as ExerciseMetadata[] : []
    } catch {
        return []
    }
}

function writeCustomEntries(entries: ExerciseMetadata[]) {
    if (!canUseStorage()) return
    window.localStorage.setItem(LS_CUSTOM_EXERCISES_KEY, JSON.stringify(entries))
}

function mergeEntries(base: ExerciseMetadata[], custom: ExerciseMetadata[]) {
    const merged = new Map<string, ExerciseMetadata>()
    for (const entry of base) merged.set(entry.id, entry)
    for (const entry of custom) merged.set(entry.id, entry)
    return Array.from(merged.values())
}

function fallbackMuscleGroup(kind: ExerciseMetadata['kind']) {
    if (kind === 'cardio') return 'Cardio'
    if (kind === 'mobility') return 'Mobilität'
    return 'Kraft'
}

function fallbackMovementPattern(kind: ExerciseMetadata['kind']): ExerciseMetadata['movementPattern'] {
    if (kind === 'cardio') return 'cardio'
    if (kind === 'mobility') return 'mobility'
    return 'isolation'
}

function fallbackGoalTags(kind: ExerciseMetadata['kind']): ExerciseMetadata['goalTags'] {
    if (kind === 'cardio') return ['endurance', 'general_fitness', 'health']
    if (kind === 'mobility') return ['health']
    return ['general_fitness', 'muscle_gain']
}

function defaultMuscleGroupForCustomExercise(kind: ExerciseMetadata['kind']) {
    if (kind === 'cardio') return 'Cardio'
    if (kind === 'mobility') return 'Dehnung'
    return 'Kraft'
}

function defaultEquipmentForCustomExercise(kind: ExerciseMetadata['kind']): ExerciseMetadata['equipment'] {
    if (kind === 'cardio') return ['cardio_machine']
    return ['bodyweight']
}

export const useExerciseLibraryStore = defineStore('exerciseLibrary', {
    state: (): ExerciseLibraryState => ({
        entries: [],
        loaded: false,
        loading: false,
    }),

    actions: {
        async load(force = false) {
            if (this.loaded && !force) return
            if (pendingLoad && !force) return pendingLoad

            pendingLoad = (async () => {
                this.loading = true
                try {
                    const rows = await listExerciseLibrary({ take: 2000 })
                    const baseEntries = rows.map(toExerciseMetadata)
                    const customEntries = readCustomEntries()
                    this.entries = mergeEntries(baseEntries, customEntries)
                    hydrateExerciseLibrary(this.entries)
                    this.loaded = true
                } finally {
                    this.loading = false
                    pendingLoad = null
                }
            })()

            return pendingLoad
        },

        addCustomExercise(input: AddCustomExerciseInput) {
            const name = normalizeText(input.name)
            if (!name) throw new Error('Bitte gib einen Übungsnamen ein.')

            const aliases = Array.from(new Set((input.aliases ?? [])
                .map(normalizeText)
                .filter(Boolean)))

            const secondaryMuscleGroups = Array.from(new Set((input.secondaryMuscleGroups ?? [])
                .map(normalizeText)
                .filter(Boolean)))

            const normalizedName = normalizeToken(name)
            const duplicate = this.entries.find((entry) =>
                normalizeToken(entry.name) === normalizedName
                || entry.aliases.some((alias) => normalizeToken(alias) === normalizedName)
            )
            if (duplicate) throw new Error('Diese Übung existiert bereits in der Bibliothek.')

            const idBase = normalizeToken(name) || `custom-${Date.now()}`
            let id = `custom-${idBase}`
            let suffix = 2
            while (this.entries.some((entry) => entry.id === id)) {
                id = `custom-${idBase}-${suffix}`
                suffix += 1
            }

            const kind = input.kind
            const muscleGroup = normalizeText(input.muscleGroup ?? '') || defaultMuscleGroupForCustomExercise(kind)
            const equipment = Array.from(new Set((input.equipment ?? defaultEquipmentForCustomExercise(kind))
                .map((item) => normalizeText(item))
                .filter(Boolean))) as ExerciseMetadata['equipment']
            const level = input.level ?? 'beginner'

            const entry: ExerciseMetadata = {
                id,
                name,
                aliases,
                muscleGroup,
                secondaryMuscleGroups,
                kind,
                movementPattern: fallbackMovementPattern(kind),
                equipment: equipment.length ? equipment : defaultEquipmentForCustomExercise(kind),
                level,
                stability: 'stable',
                axialLoad: 'low',
                overhead: false,
                deepKneeFlexion: false,
                impact: 'low',
                rotation: false,
                jointLoad: {},
                goalTags: fallbackGoalTags(kind),
                substitutions: [],
                similarityTags: Array.from(new Set([
                    name,
                    muscleGroup,
                    kind,
                    ...aliases,
                    ...secondaryMuscleGroups,
                ].map(normalizeText).filter(Boolean))),
                tutorial: input.tutorial ?? null,
            }

            const customEntries = [...readCustomEntries(), entry]
            writeCustomEntries(customEntries)
            this.entries = mergeEntries(this.entries, [entry])
            hydrateExerciseLibrary(this.entries)
            this.loaded = true
            return entry
        },
    },
})
