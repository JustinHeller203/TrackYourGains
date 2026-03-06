import type { ComplaintEntry } from '@/types/complaint'

const PAIN_DIARY_KEY = 'gym3000.painDiary.v1'

export type PainDiarySource = 'plan-progress' | 'training-simulation'

export type PainDiaryEntry = {
    id: string
    createdAt: string
    source: PainDiarySource
    painLevel: number
    note: string
    activeComplaintIds: string[]
}

export const PAIN_ZERO_CONFIRM_DAYS = 3

export type PainDiarySignals = {
    improvedVsPrevious: boolean
    zeroStreakComplaintIds: string[]
}

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function makeId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
    return `pain-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function readAll(): PainDiaryEntry[] {
    if (!canUseStorage()) return []
    try {
        const raw = window.localStorage.getItem(PAIN_DIARY_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

function dayKey(value: string) {
    return String(value ?? '').slice(0, 10)
}

function normalizeComplaintIds(ids: string[]) {
    return Array.from(new Set((ids ?? []).map((id) => String(id ?? '').trim()).filter(Boolean)))
}

function zeroDayStreakForComplaint(entries: PainDiaryEntry[], complaintId: string) {
    const seenDays = new Set<string>()
    let zeroDays = 0

    for (const item of entries) {
        if (!item.activeComplaintIds.includes(complaintId)) continue

        const d = dayKey(item.createdAt)
        if (!d || seenDays.has(d)) continue
        seenDays.add(d)

        if (item.painLevel === 0) {
            zeroDays += 1
            continue
        }
        break
    }

    return zeroDays
}

export function evaluatePainDiarySignals(payload: {
    currentPainLevel: number
    complaintIds: string[]
}): PainDiarySignals {
    const complaintIds = normalizeComplaintIds(payload.complaintIds)
    if (!complaintIds.length) return { improvedVsPrevious: false, zeroStreakComplaintIds: [] }

    const currentPainLevel = Math.max(0, Math.min(10, Math.round(Number(payload.currentPainLevel) || 0)))
    const entries = readAll()
    const complaintIdSet = new Set(complaintIds)
    const previous = entries.slice(1).find((item) => item.activeComplaintIds.some((id) => complaintIdSet.has(id)))

    const zeroStreakComplaintIds = currentPainLevel === 0
        ? complaintIds.filter((id) => zeroDayStreakForComplaint(entries, id) >= PAIN_ZERO_CONFIRM_DAYS)
        : []

    return {
        improvedVsPrevious: !!previous && currentPainLevel < previous.painLevel,
        zeroStreakComplaintIds,
    }
}

export function appendPainDiaryEntry(payload: {
    source: PainDiarySource
    painLevel: number
    note?: string
    activeComplaints: ComplaintEntry[]
}) {
    if (!canUseStorage()) return

    const entry: PainDiaryEntry = {
        id: makeId(),
        createdAt: new Date().toISOString(),
        source: payload.source,
        painLevel: Math.max(0, Math.min(10, Math.round(Number(payload.painLevel) || 0))),
        note: String(payload.note ?? '').trim().slice(0, 220),
        activeComplaintIds: (payload.activeComplaints ?? []).map((item) => item.id).filter(Boolean),
    }

    const next = [entry, ...readAll()].slice(0, 300)
    window.localStorage.setItem(PAIN_DIARY_KEY, JSON.stringify(next))
}

export function hasPainDiaryEntryForDay(payload: {
    source: PainDiarySource
    day: string
}) {
    const day = String(payload.day ?? '').slice(0, 10)
    if (!day) return false

    return readAll().some((item) => (
        item.source === payload.source
        && dayKey(item.createdAt) === day
    ))
}
