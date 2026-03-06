export type ComplaintArea =
    | 'nacken'
    | 'schulter'
    | 'ellbogen'
    | 'unterarm'
    | 'handgelenk'
    | 'hand'
    | 'finger'
    | 'brust'
    | 'bauch'
    | 'ruecken'
    | 'leiste'
    | 'huefte'
    | 'oberschenkel'
    | 'knie'
    | 'unterschenkel'
    | 'wade'
    | 'sprunggelenk'
    | 'fuss'
    | 'kopf'
    | 'benutzerdefiniert'
    | 'sonstiges'

export type ComplaintCategory = 'muskelkater' | 'ueberlastung' | 'schmerz'

export type ComplaintStatus = 'aktiv' | 'besser' | 'weg'

export interface ComplaintEntry {
    id: string
    area: ComplaintArea
    intensity: number
    category: ComplaintCategory
    status: ComplaintStatus
    date: string
    notes: string
    createdAt: string
}

export interface CreateComplaintEntry {
    area: ComplaintArea
    intensity: number
    category: ComplaintCategory
    status: ComplaintStatus
    date: string
    notes?: string
}

export interface UpdateComplaintEntry extends CreateComplaintEntry {}
