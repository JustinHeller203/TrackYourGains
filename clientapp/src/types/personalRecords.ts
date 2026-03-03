export type PersonalRecordMetric = 'weight' | 'reps' | 'volume' | 'oneRm'

export type PersonalRecordEntryLike = {
    id?: string | null
    exercise: string
    date: string
    type?: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer' | null
    weight?: number | null
    sets?: number | null
    reps?: number | null
    setDetails?: Array<{
        weight: number | null
        reps: number | null
        durationSec?: number | null
        label?: string | null
    }> | null
}

export type PersonalRecordStat = {
    metric: PersonalRecordMetric
    value: number
    date: string
    entryId?: string | null
}

export type ExercisePersonalRecord = {
    exercise: string
    exerciseKey: string
    metrics: Partial<Record<PersonalRecordMetric, PersonalRecordStat>>
}

export type PersonalRecordHit = {
    metric: PersonalRecordMetric
    exercise: string
    currentValue: number
    previousValue: number | null
    date: string
}
