export type LapEntryObj = { time: number; name?: string }
export type LapEntry = number | LapEntryObj

export interface StopwatchInstance {
    id: string
    name?: string
    laps: LapEntry[]
    // Rest ist absichtlich offen, damit du nicht 20 Felder nachziehen musst:
    [key: string]: unknown
}
