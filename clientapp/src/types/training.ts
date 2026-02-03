//types/training.ts

export interface TimerInstance {
    id: string
    name: string

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

    left?: number
    top?: number

    startedAtMs?: number | null
    endsAtMs?: number | null
    pausedRemaining?: number | null
}

export type LapEntryObj = {
    [key: string]: any

    // ✅ neues Format (seconds)
    time: number
    name?: string

    // ✅ legacy Format (ms)
    ms?: number
    splitMs?: number
    atMs?: number
    label?: string
}

export type LapEntry = number | LapEntryObj

export interface StopwatchInstance {
    [key: string]: any

    id: string
    name: string

    time: number
    isRunning: boolean
    interval: number | null
    laps: LapEntry[]

    isFavorite: boolean
    isVisible: boolean
    shouldStaySticky: boolean

    left?: number
    top?: number

    startedAtMs?: number | null
    offsetMs?: number
}
