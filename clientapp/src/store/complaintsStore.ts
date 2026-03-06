import { defineStore } from 'pinia'
import { LS_COMPLAINTS_ENTRIES } from '@/constants/storageKeys'
import { useAuthStore } from '@/store/authStore'
import { createComplaint, deleteComplaint, listComplaints, updateComplaint, updateComplaintStatus } from '@/services/complaints'
import type {
    ComplaintArea,
    ComplaintCategory,
    ComplaintEntry,
    ComplaintStatus,
    CreateComplaintEntry,
    UpdateComplaintEntry,
} from '@/types/complaint'

type ComplaintsState = {
    entries: ComplaintEntry[]
    loaded: boolean
    loadedFor: string | null
}

const AREAS: ComplaintArea[] = [
    'nacken',
    'schulter',
    'ellbogen',
    'unterarm',
    'handgelenk',
    'hand',
    'finger',
    'brust',
    'bauch',
    'ruecken',
    'leiste',
    'huefte',
    'oberschenkel',
    'knie',
    'unterschenkel',
    'wade',
    'sprunggelenk',
    'fuss',
    'kopf',
    'benutzerdefiniert',
    'sonstiges',
]
const CATEGORIES: ComplaintCategory[] = ['muskelkater', 'ueberlastung', 'schmerz']
const STATUSES: ComplaintStatus[] = ['aktiv', 'besser', 'weg']

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isComplaintArea(value: unknown): value is ComplaintArea {
    return typeof value === 'string' && AREAS.includes(value as ComplaintArea)
}

function isComplaintCategory(value: unknown): value is ComplaintCategory {
    return typeof value === 'string' && CATEGORIES.includes(value as ComplaintCategory)
}

function isComplaintStatus(value: unknown): value is ComplaintStatus {
    return typeof value === 'string' && STATUSES.includes(value as ComplaintStatus)
}

function normalizeDate(value: unknown) {
    if (typeof value !== 'string') return ''
    const trimmed = value.trim()
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : ''
}

function normalizeIntensity(value: unknown) {
    const n = typeof value === 'number' ? value : Number(value)
    if (!Number.isFinite(n)) return 5
    return Math.min(10, Math.max(1, Math.round(n)))
}

function sortEntries(entries: ComplaintEntry[]) {
    return [...entries].sort((a, b) => {
        const byDate = b.date.localeCompare(a.date)
        if (byDate !== 0) return byDate
        return b.createdAt.localeCompare(a.createdAt)
    })
}

function makeId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return `complaint-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function parseStoredEntries(raw: string | null): ComplaintEntry[] {
    if (!raw) return []

    try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []

        const normalized = parsed.flatMap((item): ComplaintEntry[] => {
            if (!item || typeof item !== 'object') return []

            const area = isComplaintArea((item as any).area) ? (item as any).area : null
            const category = isComplaintCategory((item as any).category) ? (item as any).category : null
            const status = isComplaintStatus((item as any).status) ? (item as any).status : 'aktiv'
            const date = normalizeDate((item as any).date)

            if (!area || !category || !date) return []

            return [{
                id: typeof (item as any).id === 'string' && (item as any).id.trim() ? (item as any).id : makeId(),
                area,
                category,
                status,
                intensity: normalizeIntensity((item as any).intensity),
                date,
                notes: typeof (item as any).notes === 'string' ? (item as any).notes.trim().slice(0, 400) : '',
                createdAt: typeof (item as any).createdAt === 'string' && (item as any).createdAt
                    ? (item as any).createdAt
                    : new Date(`${date}T12:00:00.000Z`).toISOString(),
            }]
        })

        return sortEntries(normalized)
    } catch {
        return []
    }
}

function isGuid(v: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
}

function is401(e: any): boolean {
    const status = e?.response?.status ?? e?.status
    return status === 401
}

export const useComplaintsStore = defineStore('complaints', {
    state: (): ComplaintsState => ({
        entries: [],
        loaded: false,
        loadedFor: null,
    }),

    getters: {
        activeEntries: (state) => state.entries.filter((entry) => entry.status === 'aktiv'),
    },

    actions: {
        loadLocal() {
            if (!canUseStorage()) {
                this.entries = []
                this.loaded = true
                this.loadedFor = 'guest'
                return
            }
            this.entries = parseStoredEntries(window.localStorage.getItem(LS_COMPLAINTS_ENTRIES))
            this.loaded = true
            this.loadedFor = 'guest'
        },

        persistLocal() {
            if (!canUseStorage()) return
            window.localStorage.setItem(LS_COMPLAINTS_ENTRIES, JSON.stringify(this.entries))
        },

        async load(force = false) {
            const auth = useAuthStore()
            const userKey = auth.isAuthenticated ? `auth:${auth.user?.email ?? 'unknown'}` : 'guest'
            if (this.loaded && !force && this.loadedFor === userKey) return

            if (!auth.isAuthenticated) {
                this.loadLocal()
                return
            }

            try {
                this.entries = sortEntries(await listComplaints())
                this.loaded = true
                this.loadedFor = userKey
            } catch (e: any) {
                if (is401(e)) {
                    this.loadLocal()
                    return
                }
                throw e
            }
        },

        async addEntry(payload: CreateComplaintEntry) {
            const auth = useAuthStore()
            if (!auth.isAuthenticated) {
                const entry: ComplaintEntry = {
                    id: makeId(),
                    area: payload.area,
                    intensity: normalizeIntensity(payload.intensity),
                    category: payload.category,
                    status: payload.status,
                    date: normalizeDate(payload.date) || new Date().toISOString().slice(0, 10),
                    notes: (payload.notes ?? '').trim().slice(0, 400),
                    createdAt: new Date().toISOString(),
                }
                this.entries = sortEntries([entry, ...this.entries])
                this.persistLocal()
                return entry
            }

            const created = await createComplaint({
                ...payload,
                intensity: normalizeIntensity(payload.intensity),
                date: normalizeDate(payload.date) || new Date().toISOString().slice(0, 10),
                notes: (payload.notes ?? '').trim().slice(0, 400),
            })
            this.entries = sortEntries([created, ...this.entries.filter((x) => x.id !== created.id)])
            this.loaded = true
            this.loadedFor = `auth:${auth.user?.email ?? 'unknown'}`
            return created
        },

        async updateStatus(id: string, status: ComplaintStatus) {
            const auth = useAuthStore()
            if (!auth.isAuthenticated || !isGuid(id)) {
                this.entries = sortEntries(this.entries.map((entry) => (
                    entry.id === id ? { ...entry, status } : entry
                )))
                this.persistLocal()
                return
            }

            const updated = await updateComplaintStatus(id, status)
            this.entries = sortEntries(this.entries.map((entry) => (
                entry.id === id ? updated : entry
            )))
            this.loaded = true
            this.loadedFor = `auth:${auth.user?.email ?? 'unknown'}`
        },

        async updateEntry(id: string, payload: UpdateComplaintEntry) {
            const auth = useAuthStore()
            if (!auth.isAuthenticated || !isGuid(id)) {
                this.entries = sortEntries(this.entries.map((entry) => (
                    entry.id === id
                        ? {
                            ...entry,
                            area: payload.area,
                            category: payload.category,
                            status: payload.status,
                            intensity: normalizeIntensity(payload.intensity),
                            date: normalizeDate(payload.date) || entry.date,
                            notes: (payload.notes ?? '').trim().slice(0, 400),
                        }
                        : entry
                )))
                this.persistLocal()
                return
            }

            const updated = await updateComplaint(id, {
                ...payload,
                intensity: normalizeIntensity(payload.intensity),
                date: normalizeDate(payload.date) || new Date().toISOString().slice(0, 10),
                notes: (payload.notes ?? '').trim().slice(0, 400),
            })
            this.entries = sortEntries(this.entries.map((entry) => (
                entry.id === id ? updated : entry
            )))
            this.loaded = true
            this.loadedFor = `auth:${auth.user?.email ?? 'unknown'}`
        },

        async removeEntry(id: string) {
            const auth = useAuthStore()
            if (!auth.isAuthenticated || !isGuid(id)) {
                this.entries = this.entries.filter((entry) => entry.id !== id)
                this.persistLocal()
                return
            }

            try {
                await deleteComplaint(id)
            } catch (e: any) {
                const status = e?.response?.status
                if (status !== 404) throw e
            }

            this.entries = this.entries.filter((entry) => entry.id !== id)
            this.loaded = true
            this.loadedFor = `auth:${auth.user?.email ?? 'unknown'}`
        },

        resetAll() {
            this.entries = []
            this.loaded = true
            this.loadedFor = null
            if (canUseStorage()) {
                window.localStorage.removeItem(LS_COMPLAINTS_ENTRIES)
            }
        },
    },
})
