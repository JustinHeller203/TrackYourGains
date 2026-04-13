import { findExerciseById, matchesExerciseNameOrAlias } from '@/services/training/exerciseLibrary'
import type {
    GoalWeightSample,
    GoalWorkoutSample,
    TrainingGoal,
    TrainingGoalEvaluation,
    TrainingGoalStatus,
    TrainingGoalType,
} from '@/types/goals'
import { getEntryPersonalRecordMetrics, personalRecordExerciseKey } from '@/utils/personalRecords'

type GoalTrackingInput = {
    workouts: GoalWorkoutSample[]
    weights: GoalWeightSample[]
    now?: Date
}

const clampPercent = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value)

const normalizeExerciseName = (value?: string | null) =>
    String(value ?? '').trim()

const normalizeExerciseKey = (value?: string | null) =>
    personalRecordExerciseKey(value)

export function getGoalExerciseLabel(goal: Pick<TrainingGoal, 'exerciseId' | 'exerciseName'>) {
    const fromLibrary = findExerciseById(goal.exerciseId)
    if (fromLibrary?.name) return fromLibrary.name
    return normalizeExerciseName(goal.exerciseName) || ''
}

export function goalMatchesExerciseName(
    goal: Pick<TrainingGoal, 'exerciseId' | 'exerciseName'>,
    rawExerciseName?: string | null
) {
    const value = normalizeExerciseName(rawExerciseName)
    if (!value) return false
    const fromLibrary = findExerciseById(goal.exerciseId)
    if (fromLibrary) return matchesExerciseNameOrAlias(fromLibrary, value)
    return normalizeExerciseKey(goal.exerciseName) === normalizeExerciseKey(value)
}

const toDateValue = (value?: string | null) => {
    const ts = new Date(String(value ?? '')).getTime()
    return Number.isFinite(ts) ? ts : 0
}

const formatDateShort = (value?: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function findLatestWeight(weights: GoalWeightSample[]) {
    return [...weights]
        .filter(entry => isFiniteNumber(entry?.weight))
        .sort((a, b) => toDateValue(b.date) - toDateValue(a.date))[0] ?? null
}

function findExerciseSamples(workouts: GoalWorkoutSample[], goal: Pick<TrainingGoal, 'exerciseId' | 'exerciseName'>) {
    const label = getGoalExerciseLabel(goal)
    if (!label) return []
    return workouts.filter(entry => goalMatchesExerciseName(goal, entry.exercise))
}

function getCurrentMetricValue(goal: TrainingGoal, input: GoalTrackingInput) {
    switch (goal.type) {
        case 'body_weight': {
            const latest = findLatestWeight(input.weights)
            return latest?.weight ?? null
        }
        case 'exercise_weight': {
            const samples = findExerciseSamples(input.workouts, goal)
            if (!samples.length) return null
            return samples.reduce<number | null>((best, entry) => {
                const metrics = getEntryPersonalRecordMetrics(entry as any)
                const next = metrics.weight
                if (!isFiniteNumber(next)) return best
                return best == null ? next : Math.max(best, next)
            }, null)
        }
        case 'exercise_reps': {
            const samples = findExerciseSamples(input.workouts, goal)
            if (!samples.length) return null
            return samples.reduce<number | null>((best, entry) => {
                const metrics = getEntryPersonalRecordMetrics(entry as any)
                const next = metrics.reps
                if (!isFiniteNumber(next)) return best
                return best == null ? next : Math.max(best, next)
            }, null)
        }
        case 'weekly_frequency': {
            const now = input.now ?? new Date()
            const weekAgo = now.getTime() - 6 * 86400000
            const dayKeys = new Set<string>()
            for (const workout of input.workouts) {
                const time = toDateValue(workout.date)
                if (!time || time < weekAgo || time > now.getTime()) continue
                dayKeys.add(new Date(time).toISOString().slice(0, 10))
            }
            return dayKeys.size
        }
        default:
            return null
    }
}

function getProgressPercent(goal: TrainingGoal, currentValue: number | null) {
    if (!isFiniteNumber(currentValue)) return 0

    const baseline = isFiniteNumber(goal.baselineValue) ? goal.baselineValue : null
    const target = goal.targetValue

    if (baseline == null) {
        if (target <= 0) return currentValue > 0 ? 100 : 0
        return clampPercent((currentValue / target) * 100)
    }

    const span = target - baseline
    if (Math.abs(span) < 0.0001) return currentValue === target ? 100 : 0
    if (span > 0) return clampPercent(((currentValue - baseline) / span) * 100)
    return clampPercent(((baseline - currentValue) / (baseline - target)) * 100)
}

function getRemainingValue(goal: TrainingGoal, currentValue: number | null) {
    if (!isFiniteNumber(currentValue)) return null
    if (goal.type === 'body_weight' && isFiniteNumber(goal.baselineValue) && goal.targetValue < goal.baselineValue) {
        return Math.max(0, currentValue - goal.targetValue)
    }
    return Math.max(0, goal.targetValue - currentValue)
}

function getAchieved(goal: TrainingGoal, currentValue: number | null) {
    if (!isFiniteNumber(currentValue)) return false
    if (goal.type === 'body_weight' && isFiniteNumber(goal.baselineValue) && goal.targetValue < goal.baselineValue) {
        return currentValue <= goal.targetValue
    }
    return currentValue >= goal.targetValue
}

function getStatus(goal: TrainingGoal, currentValue: number | null, percent: number, isAchieved: boolean): TrainingGoalStatus {
    if (isAchieved) return 'achieved'
    if (!isFiniteNumber(currentValue)) return 'no_data'
    if (goal.deadline) {
        const deadlineTs = toDateValue(goal.deadline)
        if (deadlineTs && deadlineTs < Date.now() && !isAchieved) return 'needs_attention'
    }
    if (percent >= 75) return 'on_track'
    if (percent >= 35) return 'in_progress'
    return 'needs_attention'
}

function formatMetricValue(type: TrainingGoalType, value: number | null) {
    if (!isFiniteNumber(value)) return 'Keine Daten'
    if (type === 'body_weight' || type === 'exercise_weight') return `${Number(value.toFixed(1))} kg`
    if (type === 'exercise_reps') return `${Math.round(value)} Wdh`
    return `${Math.round(value)} / Woche`
}

function buildPrimaryText(goal: TrainingGoal, currentValue: number | null, remainingValue: number | null) {
    if (!isFiniteNumber(currentValue)) {
        return goal.type === 'weekly_frequency'
            ? 'Noch keine Workouts in den letzten 7 Tagen'
            : 'Noch keine Daten für dieses Ziel'
    }

    if (remainingValue != null && remainingValue > 0) {
        if (goal.type === 'body_weight' || goal.type === 'exercise_weight') {
            return `Es fehlen noch ${Number(remainingValue.toFixed(1))} kg bis zum Ziel.`
        }
        if (goal.type === 'exercise_reps') {
            return `Es fehlen noch ${Math.round(remainingValue)} Wiederholungen bis zum Ziel.`
        }
        return `Es fehlen noch ${Math.round(remainingValue)} Workout-Tage in dieser Woche.`
    }

    return 'Ziel erreicht.'
}

function buildSecondaryText(goal: TrainingGoal, percent: number, currentValue: number | null, baselineValue: number | null) {
    if (!isFiniteNumber(currentValue)) {
        const exerciseLabel = getGoalExerciseLabel(goal)
        if (exerciseLabel) return `Sobald ${exerciseLabel} geloggt wird, tracken wir den Fortschritt hier.`
        return 'Sobald neue Daten vorliegen, wird der Fortschritt automatisch berechnet.'
    }

    const baselineText = isFiniteNumber(baselineValue) ? formatMetricValue(goal.type, baselineValue) : 'Auto'
    return `Start ${baselineText} · Fortschritt ${Math.round(percent)}%`
}

const STATUS_LABELS: Record<TrainingGoalStatus, string> = {
    achieved: 'Erreicht',
    on_track: 'Auf Kurs',
    in_progress: 'Im Aufbau',
    needs_attention: 'Braucht Fokus',
    no_data: 'Wartet auf Daten',
}

export function getGoalAutoTitle(goal: Pick<TrainingGoal, 'type' | 'exerciseName' | 'targetValue'>) {
    const exerciseLabel = normalizeExerciseName(goal.exerciseName)
    switch (goal.type) {
        case 'body_weight':
            return `Körpergewicht ${Number(goal.targetValue.toFixed(1))} kg`
        case 'exercise_weight':
            return `${exerciseLabel || 'Übung'} ${Number(goal.targetValue.toFixed(1))} kg`
        case 'exercise_reps':
            return `${exerciseLabel || 'Übung'} ${Math.round(goal.targetValue)} Wdh`
        case 'weekly_frequency':
            return `${Math.round(goal.targetValue)} Workouts pro Woche`
        default:
            return 'Trainingsziel'
    }
}

export function getGoalBaselineValue(
    draft: Pick<TrainingGoal, 'type' | 'exerciseId' | 'exerciseName'>,
    input: GoalTrackingInput
) {
    return getCurrentMetricValue(
        {
            id: 'baseline',
            title: '',
            targetValue: 0,
            baselineValue: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...draft,
        },
        input
    )
}

export function evaluateTrainingGoal(goal: TrainingGoal, input: GoalTrackingInput): TrainingGoalEvaluation {
    const currentValue = getCurrentMetricValue(goal, input)
    const baselineValue = isFiniteNumber(goal.baselineValue) ? goal.baselineValue : null
    const percent = getProgressPercent(goal, currentValue)
    const isAchieved = getAchieved(goal, currentValue)
    const remainingValue = getRemainingValue(goal, currentValue)
    const status = getStatus(goal, currentValue, percent, isAchieved)

    return {
        goal,
        status,
        percent,
        currentValue,
        baselineValue,
        targetValue: goal.targetValue,
        isAchieved,
        remainingValue,
        trendValue: baselineValue != null && currentValue != null ? currentValue - baselineValue : null,
        primaryText: buildPrimaryText(goal, currentValue, remainingValue),
        secondaryText: buildSecondaryText(goal, percent, currentValue, baselineValue),
        statusText: STATUS_LABELS[status],
        targetLabel: formatMetricValue(goal.type, goal.targetValue),
        currentLabel: formatMetricValue(goal.type, currentValue),
        baselineLabel: baselineValue == null ? null : formatMetricValue(goal.type, baselineValue),
        deadlineLabel: formatDateShort(goal.deadline),
    }
}

export function evaluateTrainingGoals(goals: TrainingGoal[], input: GoalTrackingInput) {
    return goals.map(goal => evaluateTrainingGoal(goal, input))
}

export function listGoalExerciseSuggestions(workouts: GoalWorkoutSample[]) {
    const counts = new Map<string, number>()
    for (const workout of workouts) {
        const name = normalizeExerciseName(workout.exercise)
        if (!name) continue
        counts.set(name, (counts.get(name) ?? 0) + 1)
    }
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'))
        .map(([name]) => name)
}
