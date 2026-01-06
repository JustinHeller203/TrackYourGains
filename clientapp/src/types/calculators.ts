// src/types/calculators.ts

export type CaffeineResetSnapshot = {
    weight: number | null
    sensitivity: 'low' | 'normal' | 'high'
    status: 'none' | 'pregnant'
    lastDoseTime: string
    sleepTime: string
    showTimingExtras: boolean
}
