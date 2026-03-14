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

let pendingLoad: Promise<void> | null = null

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
                    this.entries = rows.map(toExerciseMetadata)
                    hydrateExerciseLibrary(this.entries)
                    this.loaded = true
                } finally {
                    this.loading = false
                    pendingLoad = null
                }
            })()

            return pendingLoad
        },
    },
})
