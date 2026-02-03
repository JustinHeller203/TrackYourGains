/*services/progress.ts*/

import { api } from "@/lib/api";
import type { ProgressEntry, CreateProgressEntry, UpdateProgressEntry } from "@/types/Progress";

const isGuid = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

const toBackendType = (t: string) => {
    const m: Record<string, string> = {
        kraft: 'Kraft',
        calisthenics: 'Calisthenics',
        ausdauer: 'Ausdauer',
        dehnung: 'Dehnung',
    }
    return m[t] ?? t
}

const fromBackendType = (t: string) => {
    const m: Record<string, string> = {
        Kraft: 'kraft',
        Calisthenics: 'calisthenics',
        Ausdauer: 'ausdauer',
        Dehnung: 'dehnung',
    }
    return (m[t] ?? t) as any
}

const toDateOnly = (iso: string) => (iso ? iso.slice(0, 10) : iso)

const toApiType = (t: string) => {
    const raw = String(t ?? "").trim()
    const s = raw.toLowerCase()

    // backend enums
    if (s === "strength") return "Strength"
    if (s === "cardio") return "Cardio"
    if (s === "stretch") return "Stretch"
    if (s === "calisthenics") return "Calisthenics"

    // deutsche UI-Labels
    if (s === "kraft") return "Strength"
    if (s === "ausdauer") return "Cardio"
    if (s === "dehnung") return "Stretch"

    console.warn("[toApiType] Unbekannter Typ:", raw)
    return "Strength"
}

export async function listProgress(planId: string) {
    if (!isGuid(planId)) return []
    const { data } = await api.get<ProgressEntry[]>("/progress", { params: { planId } });
    return data
}
const intOrNull = (v: any) => {
    if (v === null || v === undefined) return null
    if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v)
    const s = String(v).trim()
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? Math.trunc(n) : null
}

const decOrNull = (v: any) => {
    if (v === null || v === undefined) return null
    if (typeof v === "number" && Number.isFinite(v)) return v
    const s = String(v).trim().replace(",", ".")
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) ? n : null
}

const sanitizeProgressPayload = (payload: any) => ({
    ...payload,
    // ints
    sets: intOrNull(payload.sets),
    reps: intOrNull(payload.reps),
    restSeconds: intOrNull(payload.restSeconds),
    durationMin: intOrNull(payload.durationMin),

    // decimals
    weightKg: decOrNull(payload.weightKg),
    distanceKm: decOrNull(payload.distanceKm),
})

export const createProgress = async (payload: CreateProgressEntry) => {
    try {
        const safePayload = sanitizeProgressPayload({
            ...payload,
            date: toDateOnly(payload.date),
            type: toApiType(payload.type),
        })

        console.log("[createProgress payload]", safePayload)

        const res = await api.post("/progress", safePayload)
        return res.data
    } catch (e: any) {
        const data = e?.response?.data
        console.error("[createProgress 400 body]", data)

        const msg =
            data?.title ||
            data?.message ||
            (data?.errors
                ? Object.entries(data.errors)
                    .map(([k, v]: any) => `${k}: ${v?.join?.(", ") ?? v}`)
                    .join(" | ")
                : null) ||
            e?.message ||
            "Bad Request"

        throw new Error(msg)
    }
}

export async function updateProgress(id: string, payload: UpdateProgressEntry) {
    const safePayload = sanitizeProgressPayload({
        ...payload,
        date: toDateOnly(payload.date),
        type: toApiType(payload.type),
    })
    const { data } = await api.put<ProgressEntry>(`/progress/${id}`, safePayload)
    return data
}

export async function deleteProgress(id: string) {
    await api.delete(`/progress/${id}`)
    return { ok: true }
}
