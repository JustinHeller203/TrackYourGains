import { defineStore } from 'pinia'
import { LS_TRAINING_GOALS_V1 } from '@/constants/storageKeys'
import type { TrainingGoal, TrainingGoalType } from '@/types/goals'
import { resolveExerciseReference } from '@/services/training/exerciseLibrary'

type GoalDraft = {
    id?: string
    type: TrainingGoalType
    title: string
    targetValue: number
    baselineValue: number | null
    exerciseId?: string | null
    exerciseName?: string | null
    deadline?: string | null
    note?: string | null
    archived?: boolean
}

function createId() {
    return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readStorage(): TrainingGoal[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(LS_TRAINING_GOALS_V1)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed.map((item): TrainingGoal => {
            const type = item?.type as TrainingGoalType
            const exerciseName = String(item?.exerciseName ?? '').trim() || null
            const resolvedExercise = exerciseName && (type === 'exercise_weight' || type === 'exercise_reps')
                ? resolveExerciseReference(exerciseName)
                : null
            return {
                id: String(item?.id ?? createId()),
                type,
                title: String(item?.title ?? '').trim() || 'Trainingsziel',
                targetValue: Number(item?.targetValue ?? 0),
                baselineValue: item?.baselineValue == null ? null : Number(item.baselineValue),
                exerciseId: String(item?.exerciseId ?? '').trim() || resolvedExercise?.exerciseId || null,
                exerciseName: exerciseName || resolvedExercise?.canonicalName || null,
                deadline: item?.deadline ? String(item.deadline) : null,
                note: String(item?.note ?? '').trim() || null,
                archived: !!item?.archived,
                createdAt: String(item?.createdAt ?? new Date().toISOString()),
                updatedAt: String(item?.updatedAt ?? item?.createdAt ?? new Date().toISOString()),
            }
        })
    } catch {
        return []
    }
}

function writeStorage(goals: TrainingGoal[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(LS_TRAINING_GOALS_V1, JSON.stringify(goals))
}

export const useGoalsStore = defineStore('trainingGoals', {
    state: () => ({
        items: [] as TrainingGoal[],
        loaded: false,
    }),

    getters: {
        activeGoals: (state) => state.items.filter(goal => !goal.archived),
        archivedGoals: (state) => state.items.filter(goal => !!goal.archived),
    },

    actions: {
        load(force = false) {
            if (this.loaded && !force) return
            this.items = readStorage()
            this.loaded = true
        },

        persist() {
            writeStorage(this.items)
        },

        upsert(draft: GoalDraft) {
            this.load()
            const now = new Date().toISOString()
            const next: TrainingGoal = {
                id: draft.id ?? createId(),
                type: draft.type,
                title: String(draft.title ?? '').trim() || 'Trainingsziel',
                targetValue: Number(draft.targetValue),
                baselineValue: draft.baselineValue == null ? null : Number(draft.baselineValue),
                exerciseId: String(draft.exerciseId ?? '').trim() || null,
                exerciseName: String(draft.exerciseName ?? '').trim() || null,
                deadline: draft.deadline ? String(draft.deadline) : null,
                note: String(draft.note ?? '').trim() || null,
                archived: !!draft.archived,
                createdAt: now,
                updatedAt: now,
            }

            const existingIndex = this.items.findIndex(item => item.id === next.id)
            if (existingIndex >= 0) {
                next.createdAt = this.items[existingIndex].createdAt
                this.items.splice(existingIndex, 1, next)
            } else {
                this.items.unshift(next)
            }
            this.persist()
            return next
        },

        remove(id: string) {
            this.load()
            this.items = this.items.filter(goal => goal.id !== id)
            this.persist()
        },

        setArchived(id: string, archived: boolean) {
            this.load()
            const goal = this.items.find(item => item.id === id)
            if (!goal) return
            goal.archived = archived
            goal.updatedAt = new Date().toISOString()
            this.persist()
        },
    },
})
