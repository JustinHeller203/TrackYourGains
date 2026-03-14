import type {
    ComplaintType,
    ExerciseMatchType,
    ExerciseReferenceSource,
    GeneratorExerciseReference,
    GoalType,
    TrainingLevel,
} from '@/types/autoPlan'
import type { ExerciseLibraryEntryDto } from '@/types/exerciseLibrary'

export type EquipmentTag = 'bodyweight' | 'dumbbell' | 'barbell' | 'machine' | 'cable' | 'cardio_machine' | 'band'
export type ExerciseKind = 'strength' | 'cardio' | 'mobility'
export type MovementPattern =
    | 'horizontal_push'
    | 'vertical_push'
    | 'horizontal_pull'
    | 'vertical_pull'
    | 'squat'
    | 'lunge'
    | 'hinge'
    | 'core'
    | 'isolation'
    | 'cardio'
    | 'mobility'
export type StabilityLevel = 'stable' | 'moderate' | 'unstable'
export type LoadLevel = 'low' | 'medium' | 'high'

export type ExerciseMetadata = {
    id: string
    name: string
    aliases: string[]
    muscleGroup: string
    secondaryMuscleGroups: string[]
    kind: ExerciseKind
    movementPattern: MovementPattern
    equipment: EquipmentTag[]
    level: TrainingLevel
    stability: StabilityLevel
    axialLoad: LoadLevel
    overhead: boolean
    deepKneeFlexion: boolean
    impact: LoadLevel
    rotation: boolean
    jointLoad: Partial<Record<ComplaintType, LoadLevel>>
    goalTags: GoalType[]
    substitutions: string[]
}

export type ExerciseSearchResult = {
    exercise: ExerciseMetadata
    score: number
    matchType: Exclude<ExerciseMatchType, 'custom'>
    matchedOn: string
}

const FALLBACK_EXERCISE_DB: ExerciseMetadata[] = [
    {
        id: 'bench-press',
        name: 'Bankdrücken',
        aliases: ['Bench Press', 'Benchpress', 'Bankdruecken'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Schultern', 'Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_push',
        equipment: ['barbell', 'dumbbell'],
        level: 'intermediate',
        stability: 'stable',
        axialLoad: 'medium',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium', ellbogen: 'medium' },
        goalTags: ['strength', 'muscle_gain'],
        substitutions: ['Chest Press Maschine', 'Liegestütze'],
    },
    {
        id: 'lat-pulldown',
        name: 'Lat Pulldown',
        aliases: ['Latzug', 'Latziehen'],
        muscleGroup: 'Rücken',
        secondaryMuscleGroups: ['Arme'],
        kind: 'strength',
        movementPattern: 'vertical_pull',
        equipment: ['machine', 'cable'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Klimmzüge', 'Cable Row'],
    },
    {
        id: 'leg-press',
        name: 'Leg Press',
        aliases: ['Beinpresse'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'squat',
        equipment: ['machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: true,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'medium' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Box Squat'],
    },
    {
        id: 'hip-thrust',
        name: 'Hip Thrust',
        aliases: ['Hip Thrusts'],
        muscleGroup: 'Gesäß',
        secondaryMuscleGroups: ['Beine'],
        kind: 'strength',
        movementPattern: 'hinge',
        equipment: ['barbell', 'dumbbell', 'machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ruecken: 'low', knie: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Glute Bridge'],
    },
    {
        id: 'overhead-press',
        name: 'Schulterdrücken',
        aliases: ['Shoulder Press', 'OHP', 'Schulterdruecken'],
        muscleGroup: 'Schultern',
        secondaryMuscleGroups: ['Arme'],
        kind: 'strength',
        movementPattern: 'vertical_push',
        equipment: ['barbell', 'dumbbell'],
        level: 'intermediate',
        stability: 'moderate',
        axialLoad: 'medium',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'high', nacken: 'medium' },
        goalTags: ['strength', 'muscle_gain'],
        substitutions: ['Landmine Press'],
    },
    {
        id: 'cable-row',
        name: 'Cable Row',
        aliases: ['Kabelrudern', 'Seated Row'],
        muscleGroup: 'Rücken',
        secondaryMuscleGroups: ['Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_pull',
        equipment: ['cable'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ruecken: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Chest Supported Row'],
    },
    {
        id: 'plank',
        name: 'Plank',
        aliases: ['Unterarmstütz', 'Unterarmstuetz'],
        muscleGroup: 'Core',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'core',
        equipment: ['bodyweight'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ruecken: 'low' },
        goalTags: ['general_fitness', 'health'],
        substitutions: ['Dead Bug'],
    },
    {
        id: 'bike-ergometer',
        name: 'Bike Ergometer',
        aliases: ['Ergometer', 'Bike'],
        muscleGroup: 'Cardio',
        secondaryMuscleGroups: ['Beine'],
        kind: 'cardio',
        movementPattern: 'cardio',
        equipment: ['cardio_machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'low' },
        goalTags: ['endurance', 'fat_loss', 'general_fitness', 'health'],
        substitutions: ['Walking'],
    },
    {
        id: 'hamstring-stretch',
        name: 'Hamstring Dehnung',
        aliases: ['Hamstring Stretch', 'Beinrückseiten Dehnung', 'Beinrueckseiten Dehnung'],
        muscleGroup: 'Mobility',
        secondaryMuscleGroups: ['Beine'],
        kind: 'mobility',
        movementPattern: 'mobility',
        equipment: ['bodyweight'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'low', ruecken: 'low' },
        goalTags: ['health'],
        substitutions: ['Cat Cow'],
    },
]

let exerciseCatalog: ExerciseMetadata[] = [...FALLBACK_EXERCISE_DB]

const GERMAN_REPLACEMENTS: Array<[RegExp, string]> = [
    [/ä/g, 'ae'],
    [/ö/g, 'oe'],
    [/ü/g, 'ue'],
    [/ß/g, 'ss'],
    [/Ã¤/g, 'ae'],
    [/Ã¶/g, 'oe'],
    [/Ã¼/g, 'ue'],
    [/ÃŸ/g, 'ss'],
]

const UPPER_BODY_GROUPS = new Set(['brust', 'rucken', 'ruecken', 'schultern', 'arme', 'core'])
const LOWER_BODY_GROUPS = new Set(['beine', 'gesass', 'gesaess', 'hufte', 'huefte'])

export function normalizeExerciseText(value: string): string {
    let normalized = String(value ?? '').trim().toLowerCase()
    for (const [pattern, replacement] of GERMAN_REPLACEMENTS) normalized = normalized.replace(pattern, replacement)
    return normalized
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

export function getExerciseCatalog() {
    return exerciseCatalog
}

export function hydrateExerciseLibrary(entries: ExerciseMetadata[]) {
    if (!Array.isArray(entries)) {
        exerciseCatalog = []
        return
    }
    const next = new Map<string, ExerciseMetadata>()
    for (const entry of entries) next.set(entry.id, entry)
    exerciseCatalog = Array.from(next.values())
}

export function toExerciseMetadata(dto: ExerciseLibraryEntryDto): ExerciseMetadata {
    const asLoad = (value: string): LoadLevel => {
        if (value === 'medium' || value === 'high') return value
        return 'low'
    }
    const asKind = (value: string): ExerciseKind =>
        value === 'cardio' || value === 'mobility' ? value : 'strength'
    const asMovement = (value: string): MovementPattern => {
        const allowed: MovementPattern[] = ['horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'squat', 'lunge', 'hinge', 'core', 'isolation', 'cardio', 'mobility']
        return allowed.includes(value as MovementPattern) ? value as MovementPattern : 'isolation'
    }
    const asLevel = (value: string): TrainingLevel =>
        value === 'intermediate' || value === 'advanced' ? value : 'beginner'
    const asStability = (value: string): StabilityLevel =>
        value === 'moderate' || value === 'unstable' ? value : 'stable'
    const asEquipment = (values: string[]): EquipmentTag[] =>
        values.filter((value): value is EquipmentTag => ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'cardio_machine', 'band'].includes(value))

    const jointLoad = Object.fromEntries(
        Object.entries(dto.jointLoad ?? {}).map(([key, value]) => [key, asLoad(value)])
    ) as Partial<Record<ComplaintType, LoadLevel>>

    return {
        id: dto.key,
        name: dto.name,
        aliases: Array.isArray(dto.aliases) ? dto.aliases : [],
        muscleGroup: dto.primaryMuscleGroup,
        secondaryMuscleGroups: Array.isArray(dto.secondaryMuscleGroups) ? dto.secondaryMuscleGroups : [],
        kind: asKind(dto.kind),
        movementPattern: asMovement(dto.movementPattern),
        equipment: asEquipment(dto.equipment ?? []),
        level: asLevel(dto.level),
        stability: asStability(dto.stability),
        axialLoad: asLoad(dto.axialLoad),
        overhead: !!dto.overhead,
        deepKneeFlexion: !!dto.deepKneeFlexion,
        impact: asLoad(dto.impact),
        rotation: !!dto.rotation,
        jointLoad,
        goalTags: (dto.goalTags ?? []).filter((value): value is GoalType =>
            ['muscle_gain', 'strength', 'fat_loss', 'general_fitness', 'endurance', 'health'].includes(value)
        ),
        substitutions: dto.substitutions ?? [],
    }
}

function levenshtein(a: string, b: string): number {
    if (a === b) return 0
    if (!a.length) return b.length
    if (!b.length) return a.length
    const dp = Array.from({ length: b.length + 1 }, (_, i) => i)
    for (let i = 1; i <= a.length; i++) {
        let prev = i - 1
        dp[0] = i
        for (let j = 1; j <= b.length; j++) {
            const tmp = dp[j]
            const cost = a[i - 1] === b[j - 1] ? 0 : 1
            dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost)
            prev = tmp
        }
    }
    return dp[b.length]
}

function scoreCandidate(query: string, candidate: string): { score: number; matchType: Exclude<ExerciseMatchType, 'custom'> } | null {
    if (!query || !candidate) return null
    if (query === candidate) return { score: 100, matchType: 'exact' }
    if (candidate.startsWith(query)) return { score: 92, matchType: 'alias' }
    if (candidate.includes(query)) return { score: 84, matchType: 'alias' }
    const distance = levenshtein(query, candidate)
    const longest = Math.max(query.length, candidate.length)
    const similarity = 1 - (distance / longest)
    if (similarity >= 0.72) return { score: Math.round(similarity * 100), matchType: 'fuzzy' }
    return null
}

function getExerciseSearchTags(exercise: ExerciseMetadata): string[] {
    const tags = new Set<string>()
    const add = (value?: string | null) => {
        const normalized = normalizeExerciseText(value ?? '')
        if (normalized) tags.add(normalized)
    }

    add(exercise.muscleGroup)
    for (const group of exercise.secondaryMuscleGroups) add(group)

    if (exercise.kind === 'cardio') {
        ;['Cardio', 'Ausdauer', 'Kondition'].forEach(add)
    } else if (exercise.kind === 'mobility') {
        ;['Mobility', 'Beweglichkeit', 'Dehnung', 'Stretching'].forEach(add)
    } else {
        ;['Kraft', 'Strength', 'Muskelaufbau'].forEach(add)
    }

    const normalizedGroups = [exercise.muscleGroup, ...exercise.secondaryMuscleGroups].map((group) => normalizeExerciseText(group))
    if (normalizedGroups.some((group) => UPPER_BODY_GROUPS.has(group))) {
        ;['Oberkörper', 'Oberkoerper', 'Upper Body'].forEach(add)
    }
    if (normalizedGroups.some((group) => LOWER_BODY_GROUPS.has(group))) {
        ;['Unterkörper', 'Unterkoerper', 'Lower Body'].forEach(add)
    }

    return Array.from(tags)
}

export function searchExercises(query: string, limit = 8): ExerciseSearchResult[] {
    const normalizedQuery = normalizeExerciseText(query)
    const catalog = getExerciseCatalog()
    if (!normalizedQuery) {
        return catalog
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(0, limit)
            .map((exercise) => ({
                exercise,
                score: 0,
                matchType: 'alias',
                matchedOn: exercise.name,
            }))
    }

    const results: ExerciseSearchResult[] = []
    for (const exercise of catalog) {
        const candidates = [exercise.name, ...exercise.aliases, ...getExerciseSearchTags(exercise)]
        let best: ExerciseSearchResult | null = null
        for (const candidate of candidates) {
            const normalizedCandidate = normalizeExerciseText(candidate)
            const scored = scoreCandidate(normalizedQuery, normalizedCandidate)
            if (!scored) continue
            const current: ExerciseSearchResult = {
                exercise,
                score: scored.score,
                matchType: scored.matchType,
                matchedOn: candidate,
            }
            if (!best || current.score > best.score) best = current
        }
        if (best) results.push(best)
    }

    return results
        .sort((a, b) => b.score - a.score || a.exercise.name.localeCompare(b.exercise.name))
        .slice(0, limit)
}

export function findExerciseById(id?: string | null): ExerciseMetadata | null {
    if (!id) return null
    return getExerciseCatalog().find((exercise) => exercise.id === id) ?? null
}

export function resolveExerciseReference(rawLabel: string, muscleGroup?: string): GeneratorExerciseReference {
    const label = String(rawLabel ?? '').trim()
    const topMatch = searchExercises(label, 1)[0]
    if (topMatch && topMatch.score >= 84) {
        return {
            label,
            canonicalName: topMatch.exercise.name,
            exerciseId: topMatch.exercise.id,
            muscleGroup: topMatch.exercise.muscleGroup,
            source: 'known',
            matchType: topMatch.matchType,
        }
    }

    return {
        label,
        canonicalName: label,
        muscleGroup: muscleGroup?.trim() || undefined,
        source: 'custom',
        matchType: 'custom',
    }
}

export function exerciseMatchesReference(exercise: ExerciseMetadata, reference: GeneratorExerciseReference): boolean {
    if (reference.exerciseId && reference.exerciseId === exercise.id) return true
    const refName = normalizeExerciseText(reference.canonicalName || reference.label)
    if (!refName) return false
    if (normalizeExerciseText(exercise.name) === refName) return true
    return exercise.aliases.some((alias) => normalizeExerciseText(alias) === refName)
}

export function matchesExerciseNameOrAlias(exercise: ExerciseMetadata, rawValue: string): boolean {
    const normalizedValue = normalizeExerciseText(rawValue)
    if (!normalizedValue) return false
    return exerciseMatchesReference(exercise, resolveExerciseReference(rawValue))
}

export function toExerciseOptionLabel(result: ExerciseSearchResult): string {
    const via = result.matchType === 'fuzzy' ? `Ähnlich zu ${result.matchedOn}` : result.exercise.muscleGroup
    return `${result.exercise.name} (${via})`
}

export function createExerciseReference(params: {
    label: string
    canonicalName?: string
    exerciseId?: string
    muscleGroup?: string
    source: ExerciseReferenceSource
    matchType: ExerciseMatchType
}): GeneratorExerciseReference {
    return {
        label: params.label.trim(),
        canonicalName: (params.canonicalName ?? params.label).trim(),
        exerciseId: params.exerciseId,
        muscleGroup: params.muscleGroup?.trim() || undefined,
        source: params.source,
        matchType: params.matchType,
    }
}
