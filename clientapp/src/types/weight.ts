export type WeightEntryDto = {
    id: number
    weight: number
    date: string // kommt vom Backend als ISO string
}

export type CreateWeightEntryDto = {
    weight: number
    date: string // ISO string
}

export type WeightSummaryDto = {
    latestKg: number | null
    latestDate: string | null
    goalKg: number | null
}

export type SetGoalWeightDto = {
    goalKg: number | null
}
