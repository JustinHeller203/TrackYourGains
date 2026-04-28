export type InjuryExplanation = {
    title: string
    kicker: string
    summary: string
    causes: string[]
    types: string[]
    signs: string[]
    action: string
    todayActions?: string[]
    avoid?: string[]
    seeDoctorWhen?: string[]
    returnCriteria?: string[]
}

type TranslateFn = (key: string) => string

const specificKeys = new Set([
    'impingement',
    'hws-distorsion',
    'bandscheibenreizung',
    'luxation',
    'sehnenansatzreizung',
    'bandverletzung',
    'muskelzerrung',
])

function resolveGroupKey(injuryKeyRaw: string) {
    const key = String(injuryKeyRaw ?? '').toLowerCase().trim()
    if (!key) return ''
    if (key.includes('bruch')) return 'bruch'
    if (key.includes('zerrung')) return 'zerrung'
    if (key.includes('prellung')) return 'prellung'
    return ''
}

function replaceParam(template: string, name: string, value: string) {
    return template.replace(new RegExp(`\\{${name}\\}`, 'g'), value)
}

function readValue(t: TranslateFn, key: string, fallback = '') {
    const value = t(key)
    return value === key ? fallback : value
}

function readList(t: TranslateFn, prefix: string) {
    const items: string[] = []
    for (let idx = 1; idx <= 8; idx += 1) {
        const key = `${prefix}.${idx}`
        const value = t(key)
        if (value === key) break
        items.push(value)
    }
    return items
}

function readExplanation(t: TranslateFn, prefix: string): InjuryExplanation {
    const title = readValue(t, `${prefix}.title`)
    if (!title) return createFallback('', t)

    return {
        title,
        kicker: readValue(t, `${prefix}.kicker`, ''),
        summary: readValue(t, `${prefix}.summary`, ''),
        causes: readList(t, `${prefix}.causes`),
        types: readList(t, `${prefix}.types`),
        signs: readList(t, `${prefix}.signs`),
        action: readValue(t, `${prefix}.action`, ''),
    }
}

function createFallback(labelRaw: string, t: TranslateFn): InjuryExplanation {
    const label = String(labelRaw ?? '').trim() || readValue(t, 'complaints.injury.fallbackTitle', 'Verletzung')
    const summaryTemplate = readValue(t, 'complaints.injury.explain.fallback.summary')

    return {
        title: label,
        kicker: readValue(t, 'complaints.injury.explain.fallback.kicker', 'Kurzüberblick'),
        summary: replaceParam(summaryTemplate, 'label', label),
        causes: readList(t, 'complaints.injury.explain.fallback.causes'),
        types: readList(t, 'complaints.injury.explain.fallback.types'),
        signs: readList(t, 'complaints.injury.explain.fallback.signs'),
        action: readValue(t, 'complaints.injury.explain.fallback.action'),
    }
}

type RecoverySections = {
    todayActions: string[]
    avoid: string[]
    seeDoctorWhen: string[]
    returnCriteria: string[]
}

function buildRecoverySections(keyRaw: string, t: TranslateFn): RecoverySections {
    const key = String(keyRaw ?? '').trim().toLowerCase()
    let sectionKey = 'default'

    if (key.includes('bruch') || key === 'luxation' || key === 'wirbelbruch' || key === 'rippenbruch') {
        sectionKey = 'fracture'
    } else if (key === 'gehirnerschuetterung') {
        sectionKey = 'concussion'
    } else if (key === 'platzwunde') {
        sectionKey = 'laceration'
    } else if (key.includes('sehne') || key === 'patellaspitze' || key === 'plantarfaszie') {
        sectionKey = 'tendon'
    } else if (key.includes('band') || key === 'distorsion' || key === 'verstauchung' || key === 'meniskus') {
        sectionKey = 'ligament'
    }

    const prefix = `complaints.injury.explain.recovery.${sectionKey}`

    return {
        todayActions: readList(t, `${prefix}.today`),
        avoid: readList(t, `${prefix}.avoid`),
        seeDoctorWhen: readList(t, `${prefix}.doctor`),
        returnCriteria: readList(t, `${prefix}.return`),
    }
}

export function getInjuryExplanation(injuryKeyRaw: string, labelRaw: string, t: TranslateFn): InjuryExplanation {
    const key = String(injuryKeyRaw ?? '').toLowerCase().trim()
    const base = (() => {
        if (specificKeys.has(key)) {
            return readExplanation(t, `complaints.injury.explain.${key}`)
        }

        const groupKey = resolveGroupKey(key)
        if (groupKey) {
            return readExplanation(t, `complaints.injury.explain.${groupKey}`)
        }

        return createFallback(labelRaw, t)
    })()

    return {
        ...base,
        ...buildRecoverySections(key, t),
    }
}
