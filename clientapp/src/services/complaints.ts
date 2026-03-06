import { api } from '@/lib/api'
import type { ComplaintEntry, CreateComplaintEntry, ComplaintStatus, UpdateComplaintEntry } from '@/types/complaint'

type ComplaintEntryDto = {
    id: string
    area: string
    category: string
    status: string
    intensity: number
    date: string
    notes: string | null
    createdAt: string
}

const toDay = (value: string) => String(value ?? '').slice(0, 10)

function toEntry(dto: ComplaintEntryDto): ComplaintEntry {
    return {
        id: String(dto.id),
        area: dto.area as ComplaintEntry['area'],
        category: dto.category as ComplaintEntry['category'],
        status: dto.status as ComplaintEntry['status'],
        intensity: Math.max(1, Math.min(10, Math.round(Number(dto.intensity) || 1))),
        date: toDay(dto.date),
        notes: String(dto.notes ?? ''),
        createdAt: String(dto.createdAt),
    }
}

export async function listComplaints() {
    const { data } = await api.get<ComplaintEntryDto[]>('/complaints')
    return Array.isArray(data) ? data.map(toEntry) : []
}

export async function createComplaint(payload: CreateComplaintEntry) {
    const req = {
        area: payload.area,
        category: payload.category,
        status: payload.status,
        intensity: payload.intensity,
        date: toDay(payload.date),
        notes: payload.notes?.trim() || null,
    }
    const { data } = await api.post<ComplaintEntryDto>('/complaints', req)
    return toEntry(data)
}

export async function updateComplaintStatus(id: string, status: ComplaintStatus) {
    const { data } = await api.patch<ComplaintEntryDto>(`/complaints/${id}/status`, { status })
    return toEntry(data)
}

export async function updateComplaint(id: string, payload: UpdateComplaintEntry) {
    const req = {
        area: payload.area,
        category: payload.category,
        status: payload.status,
        intensity: payload.intensity,
        date: toDay(payload.date),
        notes: payload.notes?.trim() || null,
    }
    const { data } = await api.patch<ComplaintEntryDto>(`/complaints/${id}`, req)
    return toEntry(data)
}

export async function deleteComplaint(id: string) {
    await api.delete(`/complaints/${id}`)
    return { ok: true }
}
