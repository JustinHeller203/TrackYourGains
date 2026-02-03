//types/stopwatch.ts

export type LapEntryObj = { time: number; name?: string }
export type LapEntry = number | LapEntryObj

// 1) Backend DTO Shape (wie dein API)
export type StopwatchDto = {
    id: string
    name: string
    elapsedMs: number
    isRunning: boolean
    startedAtUtc: string | null
    isVisible: boolean
    shouldStaySticky: boolean
    sortIndex: number
    createdUtc: string
    updatedUtc: string
}

export type UpsertStopwatchDto = {
    name?: string | null
    elapsedMs?: number | null
    isRunning?: boolean | null
    startedAtUtc?: string | null
    isVisible?: boolean | null
    shouldStaySticky?: boolean | null
}

export type ReorderStopwatchesDto = {
    orderedIds: string[]
}

// 2) Store/UI Instance (wir hängen nur lokale Felder dran, z.B. laps)
export interface StopwatchInstance {
    id: string
    name: string
    elapsedMs: number
    isRunning: boolean
    startedAtUtc: string | null
    isVisible: boolean
    shouldStaySticky: boolean
    sortIndex: number
    createdUtc?: string
    updatedUtc?: string

    // optional: rein lokal (nicht im Backend)
    laps?: LapEntry[]
}
