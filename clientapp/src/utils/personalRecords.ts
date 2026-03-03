import type {
    ExercisePersonalRecord,
    PersonalRecordEntryLike,
    PersonalRecordHit,
    PersonalRecordMetric,
    PersonalRecordStat,
} from '@/types/personalRecords'

const strengthTypes = new Set(['kraft', 'calisthenics'])

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value)

const normalizeExerciseKey = (exercise?: string | null) =>
    String(exercise ?? '').trim().toLocaleLowerCase('de-DE')

const isStrengthEntry = (entry: PersonalRecordEntryLike) => {
    const type = String(entry.type ?? '').trim().toLocaleLowerCase('de-DE')
    return strengthTypes.has(type)
}

const roundMetricValue = (metric: PersonalRecordMetric, value: number) =>
    metric === 'volume' ? Math.round(value) : Number(value.toFixed(2))

export const getEntryPersonalRecordMetrics = (entry: PersonalRecordEntryLike) => {
    const metrics = {
        weight: null as number | null,
        reps: null as number | null,
        volume: null as number | null,
        oneRm: null as number | null,
    }

    const details = Array.isArray(entry.setDetails) ? entry.setDetails : []
    const validSetRows = details.filter(row => isFiniteNumber(row?.weight) || isFiniteNumber(row?.reps))

    if (validSetRows.length) {
        let bestWeight: number | null = null
        let bestReps: number | null = null
        let totalVolume = 0
        let bestOneRm: number | null = null

        for (const row of validSetRows) {
            if (isFiniteNumber(row.weight)) {
                bestWeight = bestWeight == null ? row.weight : Math.max(bestWeight, row.weight)
            }
            if (isFiniteNumber(row.reps)) {
                bestReps = bestReps == null ? row.reps : Math.max(bestReps, row.reps)
            }
            if (isFiniteNumber(row.weight) && isFiniteNumber(row.reps)) {
                totalVolume += row.weight * row.reps
                const estimated = row.weight * (1 + row.reps / 30)
                bestOneRm = bestOneRm == null ? estimated : Math.max(bestOneRm, estimated)
            }
        }

        metrics.weight = bestWeight
        metrics.reps = bestReps
        metrics.volume = totalVolume > 0 ? totalVolume : null
        metrics.oneRm = bestOneRm != null ? Math.round(bestOneRm) : null
        return metrics
    }

    const reps = isFiniteNumber(entry.reps) ? entry.reps : null
    const weight = isFiniteNumber(entry.weight) ? entry.weight : null
    const sets = isFiniteNumber(entry.sets) && entry.sets > 0 ? entry.sets : ((reps != null || weight != null) ? 1 : 0)

    metrics.weight = weight
    metrics.reps = reps
    metrics.volume = weight != null && reps != null && sets > 0 ? weight * reps * sets : null
    metrics.oneRm = weight != null && reps != null && reps > 0 ? Math.round(weight * (1 + reps / 30)) : null
    return metrics
}

const shouldReplaceRecord = (current: PersonalRecordStat | undefined, nextValue: number, nextDate: string) => {
    if (!current) return true
    if (nextValue > current.value) return true
    if (nextValue < current.value) return false
    return String(nextDate) > String(current.date)
}

export function computeExercisePersonalRecords(entries: PersonalRecordEntryLike[]): ExercisePersonalRecord[] {
    const map = new Map<string, ExercisePersonalRecord>()

    for (const entry of entries) {
        if (!isStrengthEntry(entry)) continue

        const exercise = String(entry.exercise ?? '').trim()
        const exerciseKey = normalizeExerciseKey(exercise)
        if (!exerciseKey) continue

        const metrics = getEntryPersonalRecordMetrics(entry)
        const current = map.get(exerciseKey) ?? {
            exercise,
            exerciseKey,
            metrics: {},
        }

        ;(['weight', 'reps', 'volume', 'oneRm'] as const).forEach(metric => {
            const value = metrics[metric]
            if (!isFiniteNumber(value) || value <= 0) return
            if (!shouldReplaceRecord(current.metrics[metric], value, entry.date)) return

            current.metrics[metric] = {
                metric,
                value: roundMetricValue(metric, value),
                date: entry.date,
                entryId: entry.id ?? null,
            }
        })

        map.set(exerciseKey, current)
    }

    return [...map.values()].sort((a, b) => a.exercise.localeCompare(b.exercise, 'de'))
}

export function detectPersonalRecordHits(
    entries: PersonalRecordEntryLike[],
    candidate: PersonalRecordEntryLike,
    options?: { excludeEntryId?: string | null }
): PersonalRecordHit[] {
    if (!isStrengthEntry(candidate)) return []

    const exerciseKey = normalizeExerciseKey(candidate.exercise)
    if (!exerciseKey) return []

    const baselineEntries = entries.filter(entry => {
        if (!isStrengthEntry(entry)) return false
        if (normalizeExerciseKey(entry.exercise) !== exerciseKey) return false
        if (options?.excludeEntryId && String(entry.id ?? '') === String(options.excludeEntryId)) return false
        return true
    })

    if (!baselineEntries.length) return []

    const previous = computeExercisePersonalRecords(baselineEntries)[0]
    if (!previous) return []

    const candidateMetrics = getEntryPersonalRecordMetrics(candidate)
    const hits: PersonalRecordHit[] = []

    ;(['weight', 'reps', 'volume', 'oneRm'] as const).forEach(metric => {
        const nextValue = candidateMetrics[metric]
        if (!isFiniteNumber(nextValue) || nextValue <= 0) return

        const prevValue = previous.metrics[metric]?.value ?? null
        if (prevValue == null || nextValue <= prevValue) return

        hits.push({
            metric,
            exercise: String(candidate.exercise ?? '').trim(),
            currentValue: roundMetricValue(metric, nextValue),
            previousValue: prevValue,
            date: candidate.date,
        })
    })

    return hits
}

export const personalRecordMetricLabel = (metric: PersonalRecordMetric) =>
    ({
        weight: 'Max Gewicht',
        reps: 'Max Wdh',
        volume: 'Max Volumen',
        oneRm: 'Top 1RM',
    } as const)[metric]

export const personalRecordMetricValueLabel = (metric: PersonalRecordMetric, value: number) =>
    metric === 'weight'
        ? `${Number.isInteger(value) ? value : value.toFixed(1)} kg`
        : metric === 'reps'
            ? `${Number.isInteger(value) ? value : value.toFixed(1)} Wdh`
            : `${Math.round(value)} kg`

export const personalRecordExerciseKey = (exercise?: string | null) =>
    normalizeExerciseKey(exercise)
