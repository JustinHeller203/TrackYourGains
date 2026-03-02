export type WeightIncreaseHintInput = {
    goal?: string | null
    type?: string | null
    targetReps?: number | null
    currentReps?: number | null
    currentWeight?: number | null
    setNo?: number | null
    setTotal?: number | null
}

export type WeightIncreaseHintResult = {
    shouldSuggest: boolean
    nextSetNo: number | null
    repsThreshold: number | null
    message: string | null
}

function asNum(v: unknown): number | null {
    const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(',', '.').trim())
    return Number.isFinite(n) ? n : null
}

function normalizeText(v: unknown): string {
    return String(v ?? '').trim().toLowerCase()
}

function isEligibleGoal(goal: unknown): boolean {
    const g = normalizeText(goal)
    if (!g) return true // kein Ziel gesetzt -> trotzdem anhand Plan-Wdh bewerten
    return (
        g.includes('kraft') ||
        g.includes('muskelaufbau') ||
        g.includes('muskelausdauer') ||
        g.includes('ausdauer') ||
        g.includes('hypertroph') ||
        g.includes('endurance') ||
        g.includes('bulk') ||
        g.includes('aufbau')
    )
}

function isStrengthLikeType(type: unknown): boolean {
    const t = normalizeText(type)
    if (!t) return true
    return t === 'kraft' || t === 'calisthenics' || t === 'strength'
}

export function getWeightIncreaseHint(input: WeightIncreaseHintInput): WeightIncreaseHintResult {
    const setNo = Math.floor(asNum(input.setNo) ?? 0)
    const setTotal = Math.floor(asNum(input.setTotal) ?? 0)
    const reps = Math.floor(asNum(input.currentReps) ?? 0)
    const targetReps = Math.floor(asNum(input.targetReps) ?? 0)

    if (!isEligibleGoal(input.goal)) {
        return { shouldSuggest: false, nextSetNo: null, repsThreshold: null, message: null }
    }
    if (!isStrengthLikeType(input.type)) {
        return { shouldSuggest: false, nextSetNo: null, repsThreshold: null, message: null }
    }
    if (setNo <= 0 || setTotal <= 1 || setNo >= setTotal) {
        return { shouldSuggest: false, nextSetNo: null, repsThreshold: null, message: null }
    }
    if (reps <= 0) {
        return { shouldSuggest: false, nextSetNo: null, repsThreshold: null, message: null }
    }

    // Späte Sätze sind durch Fatigue verfälscht; nur frühe/mittlere Sätze bewerten.
    const latestUsefulSet = Math.max(1, Math.ceil(setTotal * 0.5))
    if (setNo > latestUsefulSet) {
        return { shouldSuggest: false, nextSetNo: null, repsThreshold: null, message: null }
    }

    // User-Regel: immer anhand Plan-Wdh + 2 bewerten.
    if (targetReps <= 0) {
        return { shouldSuggest: false, nextSetNo: setNo + 1, repsThreshold: null, message: null }
    }
    const repsThreshold = targetReps + 2
    if (reps < repsThreshold) {
        return { shouldSuggest: false, nextSetNo: setNo + 1, repsThreshold, message: null }
    }

    return {
        shouldSuggest: true,
        nextSetNo: setNo + 1,
        repsThreshold,
        message: `Stark. Für Satz ${setNo + 1} kannst du das Gewicht leicht erhöhen.`,
    }
}
