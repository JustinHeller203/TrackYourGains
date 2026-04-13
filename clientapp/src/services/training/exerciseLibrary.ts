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
    similarityTags: string[]
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
        similarityTags: ['brust', 'horizontal_push', 'langhantel', 'frei', 'compound'],
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
        similarityTags: ['rücken', 'vertical_pull', 'maschine', 'zugbewegung', 'lat'],
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
        similarityTags: ['beine', 'squat', 'maschine', 'quadrizeps', 'anfängerfreundlich'],
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
        similarityTags: ['gesäß', 'hinge', 'glutes', 'frei', 'hip_extension'],
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
        similarityTags: ['schultern', 'vertical_push', 'frei', 'compound', 'press'],
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
        similarityTags: ['rücken', 'horizontal_pull', 'kabel', 'zugbewegung', 'row'],
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
        similarityTags: ['core', 'rumpf', 'bodyweight', 'stabilität'],
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
        similarityTags: ['cardio', 'low_impact', 'ausdauer', 'maschine'],
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
        similarityTags: ['mobility', 'beine', 'hamstrings', 'stretch'],
    },
]

let exerciseCatalog: ExerciseMetadata[] = [...FALLBACK_EXERCISE_DB]

const DISPLAY_TEXT_FIXES: Array<[RegExp, string]> = [
    [/\u00C3\u00A4/g, 'ä'],
    [/\u00C3\u00B6/g, 'ö'],
    [/\u00C3\u00BC/g, 'ü'],
    [/\u00C3\u0084/g, 'Ä'],
    [/\u00C3\u0096/g, 'Ö'],
    [/\u00C3\u009C/g, 'Ü'],
    [/\u00C3\u009F/g, 'ß'],
    [/\u00C3\u0192\u00C2\u00A4/g, 'ä'],
    [/\u00C3\u0192\u00C2\u00B6/g, 'ö'],
    [/\u00C3\u0192\u00C2\u00BC/g, 'ü'],
    [/\u00C3\u0192\u00C2\u0084/g, 'Ä'],
    [/\u00C3\u0192\u00C2\u0096/g, 'Ö'],
    [/\u00C3\u0192\u00C2\u009C/g, 'Ü'],
    [/\u00C3\u0192\u00C5\u00B8/g, 'ß'],
]

const KNOWN_TEXT_FIXES: Record<string, string> = {
    'Klimmz?ge': 'Klimmzüge',
    'Assistierte Klimmz?ge': 'Assistierte Klimmzüge',
    'Schr?gbank Chest Press Maschine': 'Schrägbank Chest Press Maschine',
    'Schr?gbankdr?cken': 'Schrägbankdrücken',
    'Ges??': 'Gesäß',
    'R?cken': 'Rücken',
    'Brustwirbels?ule': 'Brustwirbelsäule',
    'H?fte': 'Hüfte',
    'Schr?gbank': 'Schrägbank',
    'Seitst?tz': 'Seitstütz',
}

const PARTIAL_TEXT_FIXES: Array<[RegExp, string]> = [
    [/\bGes\?\?\b/g, 'Gesäß'],
    [/\bR\?cken\b/g, 'Rücken'],
    [/Brustwirbels\?ule/g, 'Brustwirbelsäule'],
    [/H\?fte/g, 'Hüfte'],
    [/Seitst\?tz/g, 'Seitstütz'],
    [/Schr\?g/g, 'Schräg'],
    [/dr\?cken/g, 'drücken'],
    [/z\?ge/g, 'züge'],
]

function sanitizeDisplayText(value?: string | null): string {
    let sanitized = String(value ?? '').trim()
    if (!sanitized) return ''
    for (const [pattern, replacement] of DISPLAY_TEXT_FIXES) sanitized = sanitized.replace(pattern, replacement)
    sanitized = sanitized.replace(/\uFFFD/g, '?')
    for (const [pattern, replacement] of PARTIAL_TEXT_FIXES) sanitized = sanitized.replace(pattern, replacement)
    return KNOWN_TEXT_FIXES[sanitized] ?? sanitized
}

function sanitizeExerciseMetadata(entry: ExerciseMetadata): ExerciseMetadata {
    return {
        ...entry,
        name: sanitizeDisplayText(entry.name),
        aliases: entry.aliases.map((alias) => sanitizeDisplayText(alias)),
        muscleGroup: sanitizeDisplayText(entry.muscleGroup),
        secondaryMuscleGroups: entry.secondaryMuscleGroups.map((group) => sanitizeDisplayText(group)),
        substitutions: entry.substitutions.map((item) => sanitizeDisplayText(item)),
        similarityTags: entry.similarityTags.map((item) => sanitizeDisplayText(item)),
    }
}

exerciseCatalog = exerciseCatalog.map(sanitizeExerciseMetadata)

const EXTRA_FALLBACK_EXERCISES: ExerciseMetadata[] = [
    {
        id: 'incline-dumbbell-press',
        name: 'Kurzhantel-Schrägbankdrücken',
        aliases: ['Incline Dumbbell Press'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Schultern', 'Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_push',
        equipment: ['dumbbell'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium', ellbogen: 'medium' },
        goalTags: ['muscle_gain', 'strength'],
        substitutions: ['Schrägbank Chest Press Maschine', 'Bankdrücken'],
        similarityTags: ['brust', 'obere brust', 'horizontal_push', 'kurzhantel', 'frei'],
    },
    {
        id: 'incline-chest-press-machine',
        name: 'Schrägbank Chest Press Maschine',
        aliases: ['Incline Chest Press Machine'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Schultern', 'Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_push',
        equipment: ['machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'low', ellbogen: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Kurzhantel-Schrägbankdrücken', 'Chest Press Maschine'],
        similarityTags: ['brust', 'obere brust', 'horizontal_push', 'maschine', 'anfängerfreundlich'],
    },
    {
        id: 'chest-press-machine',
        name: 'Chest Press Maschine',
        aliases: ['Chest Press Machine', 'Brustpresse Maschine'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Schultern', 'Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_push',
        equipment: ['machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'low', ellbogen: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Bankdrücken', 'Liegestütze'],
        similarityTags: ['brust', 'horizontal_push', 'maschine', 'press', 'anfängerfreundlich'],
    },
    {
        id: 'push-up',
        name: 'Liegestütze',
        aliases: ['Push Up', 'Push-up'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Schultern', 'Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_push',
        equipment: ['bodyweight'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium', handgelenk: 'medium' },
        goalTags: ['muscle_gain', 'general_fitness', 'health'],
        substitutions: ['Chest Press Maschine', 'Kurzhantel-Bankdrücken'],
        similarityTags: ['brust', 'horizontal_push', 'bodyweight', 'home_gym', 'compound'],
    },
    {
        id: 'dumbbell-bench-press',
        name: 'Kurzhantel-Bankdrücken',
        aliases: ['Dumbbell Bench Press'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Schultern', 'Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_push',
        equipment: ['dumbbell'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium', ellbogen: 'medium' },
        goalTags: ['muscle_gain', 'strength'],
        substitutions: ['Bankdrücken', 'Chest Press Maschine'],
        similarityTags: ['brust', 'horizontal_push', 'kurzhantel', 'frei', 'compound'],
    },
    {
        id: 'assisted-pull-up',
        name: 'Assistierte Klimmzüge',
        aliases: ['Assisted Pull Up', 'Assisted Pull-up'],
        muscleGroup: 'Rücken',
        secondaryMuscleGroups: ['Arme'],
        kind: 'strength',
        movementPattern: 'vertical_pull',
        equipment: ['machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'low', ellbogen: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Latzug', 'Australian Pull-up'],
        similarityTags: ['rücken', 'vertical_pull', 'maschine', 'anfängerfreundlich', 'lat'],
    },
    {
        id: 'pull-up',
        name: 'Klimmzüge',
        aliases: ['Pull Up', 'Pull-up'],
        muscleGroup: 'Rücken',
        secondaryMuscleGroups: ['Arme'],
        kind: 'strength',
        movementPattern: 'vertical_pull',
        equipment: ['bodyweight'],
        level: 'advanced',
        stability: 'unstable',
        axialLoad: 'medium',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium', ellbogen: 'medium' },
        goalTags: ['strength', 'muscle_gain'],
        substitutions: ['Assistierte Klimmzüge', 'Latzug'],
        similarityTags: ['rücken', 'vertical_pull', 'bodyweight', 'frei', 'lat'],
    },
    {
        id: 'australian-pull-up',
        name: 'Australian Pull-up',
        aliases: ['Inverted Row'],
        muscleGroup: 'Rücken',
        secondaryMuscleGroups: ['Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_pull',
        equipment: ['bodyweight'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'low', ellbogen: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Cable Row', 'Chest Supported Row'],
        similarityTags: ['rücken', 'horizontal_pull', 'bodyweight', 'anfängerfreundlich', 'row'],
    },
    {
        id: 'chest-supported-row',
        name: 'Chest Supported Row',
        aliases: ['Brustgestütztes Rudern'],
        muscleGroup: 'Rücken',
        secondaryMuscleGroups: ['Arme'],
        kind: 'strength',
        movementPattern: 'horizontal_pull',
        equipment: ['dumbbell', 'machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ruecken: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Cable Row', 'Lat Pulldown'],
        similarityTags: ['rücken', 'horizontal_pull', 'stützend', 'row', 'gelenkschonend'],
    },
    {
        id: 'goblet-squat',
        name: 'Goblet Squat',
        aliases: ['Goblet Kniebeuge'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: ['Core'],
        kind: 'strength',
        movementPattern: 'squat',
        equipment: ['dumbbell'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: true,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'medium', ruecken: 'low' },
        goalTags: ['muscle_gain', 'general_fitness'],
        substitutions: ['Beinpresse', 'Box Squat'],
        similarityTags: ['beine', 'squat', 'kurzhantel', 'anfängerfreundlich', 'quadrizeps'],
    },
    {
        id: 'box-squat',
        name: 'Box Squat',
        aliases: ['Kastenkniebeuge'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: ['Gesäß'],
        kind: 'strength',
        movementPattern: 'squat',
        equipment: ['barbell', 'bodyweight'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'medium',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'low', ruecken: 'medium' },
        goalTags: ['strength', 'health'],
        substitutions: ['Goblet Squat', 'Beinpresse'],
        similarityTags: ['beine', 'squat', 'box', 'gelenkschonend', 'quadrizeps'],
    },
    {
        id: 'romanian-deadlift',
        name: 'Rumänisches Kreuzheben',
        aliases: ['Romanian Deadlift', 'RDL'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: ['Gesäß', 'Rücken'],
        kind: 'strength',
        movementPattern: 'hinge',
        equipment: ['barbell', 'dumbbell'],
        level: 'intermediate',
        stability: 'stable',
        axialLoad: 'medium',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ruecken: 'medium', knie: 'low' },
        goalTags: ['strength', 'muscle_gain'],
        substitutions: ['Hip Thrust', 'Glute Bridge'],
        similarityTags: ['beine', 'hinge', 'hamstrings', 'langhantel', 'posterior_chain'],
    },
    {
        id: 'glute-bridge',
        name: 'Glute Bridge',
        aliases: ['Hip Bridge'],
        muscleGroup: 'Gesäß',
        secondaryMuscleGroups: ['Beine'],
        kind: 'strength',
        movementPattern: 'hinge',
        equipment: ['bodyweight', 'dumbbell'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ruecken: 'low', knie: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Hip Thrust', 'Rumänisches Kreuzheben'],
        similarityTags: ['gesäß', 'hinge', 'bodyweight', 'home_gym', 'glutes'],
    },
    {
        id: 'leg-curl-machine',
        name: 'Beinbeuger Maschine',
        aliases: ['Leg Curl Machine', 'Leg Curl'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'low' },
        goalTags: ['muscle_gain', 'health'],
        substitutions: ['Rumänisches Kreuzheben', 'Glute Bridge'],
        similarityTags: ['beine', 'isolation', 'hamstrings', 'maschine', 'anfängerfreundlich'],
    },
    {
        id: 'leg-extension-machine',
        name: 'Beinstrecker Maschine',
        aliases: ['Leg Extension Machine', 'Leg Extension'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: true,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Goblet Squat', 'Beinpresse'],
        similarityTags: ['beine', 'isolation', 'quadrizeps', 'maschine', 'anfängerfreundlich'],
    },
    {
        id: 'lateral-raise',
        name: 'Seitheben',
        aliases: ['Lateral Raise'],
        muscleGroup: 'Schultern',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['dumbbell', 'cable'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Cable Lateral Raise', 'Schulterdrücken'],
        similarityTags: ['schultern', 'isolation', 'seitliche schulter', 'kurzhantel', 'cable'],
    },
    {
        id: 'cable-lateral-raise',
        name: 'Cable Lateral Raise',
        aliases: ['Kabel-Seitheben'],
        muscleGroup: 'Schultern',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['cable'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Seitheben', 'Landmine Press'],
        similarityTags: ['schultern', 'isolation', 'seitliche schulter', 'kabel', 'pump'],
    },
    {
        id: 'landmine-press',
        name: 'Landmine Press',
        aliases: ['Landmine Schulterdrücken'],
        muscleGroup: 'Schultern',
        secondaryMuscleGroups: ['Brust', 'Arme'],
        kind: 'strength',
        movementPattern: 'vertical_push',
        equipment: ['barbell'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'low' },
        goalTags: ['strength', 'health'],
        substitutions: ['Schulterdrücken', 'Seitheben'],
        similarityTags: ['schultern', 'vertical_push', 'gelenkschonend', 'press', 'barbell'],
    },
    {
        id: 'biceps-curl-dumbbell',
        name: 'Kurzhantel-Bizepscurls',
        aliases: ['Dumbbell Biceps Curl'],
        muscleGroup: 'Arme',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['dumbbell'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ellbogen: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Cable Bizepscurls', 'Hammer Curls'],
        similarityTags: ['arme', 'isolation', 'bizeps', 'kurzhantel', 'pull'],
    },
    {
        id: 'hammer-curl',
        name: 'Hammer Curls',
        aliases: ['Hammer Curl'],
        muscleGroup: 'Arme',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['dumbbell'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ellbogen: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Kurzhantel-Bizepscurls', 'Cable Bizepscurls'],
        similarityTags: ['arme', 'isolation', 'bizeps', 'unterarm', 'kurzhantel'],
    },
    {
        id: 'cable-biceps-curl',
        name: 'Cable Bizepscurls',
        aliases: ['Cable Curl'],
        muscleGroup: 'Arme',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['cable'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ellbogen: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Kurzhantel-Bizepscurls', 'Hammer Curls'],
        similarityTags: ['arme', 'isolation', 'bizeps', 'kabel', 'pump'],
    },
    {
        id: 'triceps-pushdown',
        name: 'Trizeps Pushdown',
        aliases: ['Cable Pushdown'],
        muscleGroup: 'Arme',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['cable'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ellbogen: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Überkopf-Trizepsstrecken', 'Dips'],
        similarityTags: ['arme', 'isolation', 'trizeps', 'kabel', 'push'],
    },
    {
        id: 'overhead-triceps-extension',
        name: 'Überkopf-Trizepsstrecken',
        aliases: ['Overhead Triceps Extension'],
        muscleGroup: 'Arme',
        secondaryMuscleGroups: [],
        kind: 'strength',
        movementPattern: 'isolation',
        equipment: ['dumbbell', 'cable'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: true,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { ellbogen: 'medium', schulter: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Trizeps Pushdown', 'Dips'],
        similarityTags: ['arme', 'isolation', 'trizeps', 'overhead', 'kurzhantel'],
    },
    {
        id: 'dip-assisted',
        name: 'Assistierte Dips',
        aliases: ['Assisted Dips'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Arme', 'Schultern'],
        kind: 'strength',
        movementPattern: 'vertical_push',
        equipment: ['machine'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'medium', ellbogen: 'medium' },
        goalTags: ['muscle_gain'],
        substitutions: ['Dips', 'Chest Press Maschine'],
        similarityTags: ['brust', 'trizeps', 'vertical_push', 'maschine', 'anfängerfreundlich'],
    },
    {
        id: 'dip-bodyweight',
        name: 'Dips',
        aliases: ['Bodyweight Dips'],
        muscleGroup: 'Brust',
        secondaryMuscleGroups: ['Arme', 'Schultern'],
        kind: 'strength',
        movementPattern: 'vertical_push',
        equipment: ['bodyweight'],
        level: 'advanced',
        stability: 'unstable',
        axialLoad: 'medium',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { schulter: 'high', ellbogen: 'medium' },
        goalTags: ['strength', 'muscle_gain'],
        substitutions: ['Assistierte Dips', 'Chest Press Maschine'],
        similarityTags: ['brust', 'trizeps', 'vertical_push', 'bodyweight', 'frei'],
    },
    {
        id: 'walking-lunge',
        name: 'Ausfallschritte',
        aliases: ['Walking Lunges', 'Lunges'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: ['Gesäß'],
        kind: 'strength',
        movementPattern: 'lunge',
        equipment: ['bodyweight', 'dumbbell'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: true,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'medium' },
        goalTags: ['muscle_gain', 'general_fitness'],
        substitutions: ['Beinpresse', 'Goblet Squat'],
        similarityTags: ['beine', 'lunge', 'bodyweight', 'glutes', 'quadrizeps'],
    },
    {
        id: 'step-up',
        name: 'Step-Ups',
        aliases: ['Box Step Up'],
        muscleGroup: 'Beine',
        secondaryMuscleGroups: ['Gesäß'],
        kind: 'strength',
        movementPattern: 'lunge',
        equipment: ['bodyweight', 'dumbbell'],
        level: 'beginner',
        stability: 'moderate',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'low' },
        goalTags: ['health', 'general_fitness'],
        substitutions: ['Ausfallschritte', 'Goblet Squat'],
        similarityTags: ['beine', 'lunge', 'bodyweight', 'gelenkschonend', 'einbeinig'],
    },
    {
        id: 'dead-bug',
        name: 'Dead Bug',
        aliases: ['Deadbug'],
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
        goalTags: ['health', 'general_fitness'],
        substitutions: ['Plank', 'Bird Dog'],
        similarityTags: ['core', 'rumpf', 'bodyweight', 'gelenkschonend', 'stabilität'],
    },
    {
        id: 'bird-dog',
        name: 'Bird Dog',
        aliases: ['Quadruped Bird Dog'],
        muscleGroup: 'Core',
        secondaryMuscleGroups: ['Rücken'],
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
        goalTags: ['health', 'general_fitness'],
        substitutions: ['Dead Bug', 'Plank'],
        similarityTags: ['core', 'rumpf', 'bodyweight', 'rückenfreundlich', 'stabilität'],
    },
    {
        id: 'rowing-ergometer',
        name: 'Ruderergometer',
        aliases: ['Rower', 'Rowing Ergometer'],
        muscleGroup: 'Cardio',
        secondaryMuscleGroups: ['Rücken', 'Beine'],
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
        jointLoad: { knie: 'low', ruecken: 'medium' },
        goalTags: ['endurance', 'fat_loss', 'general_fitness'],
        substitutions: ['Bike Ergometer', 'Crosstrainer'],
        similarityTags: ['cardio', 'maschine', 'ausdauer', 'intervall', 'full_body'],
    },
    {
        id: 'cross-trainer',
        name: 'Crosstrainer',
        aliases: ['Elliptical'],
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
        jointLoad: { knie: 'low', huefte: 'low' },
        goalTags: ['endurance', 'fat_loss', 'health'],
        substitutions: ['Bike Ergometer', 'Walking'],
        similarityTags: ['cardio', 'maschine', 'low_impact', 'ausdauer', 'gelenkschonend'],
    },
    {
        id: 'walking',
        name: 'Walking',
        aliases: ['Spazieren', 'Gehen'],
        muscleGroup: 'Cardio',
        secondaryMuscleGroups: ['Beine'],
        kind: 'cardio',
        movementPattern: 'cardio',
        equipment: ['bodyweight'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: false,
        jointLoad: { knie: 'low', huefte: 'low' },
        goalTags: ['health', 'endurance', 'fat_loss'],
        substitutions: ['Bike Ergometer', 'Crosstrainer'],
        similarityTags: ['cardio', 'bodyweight', 'low_impact', 'home_gym', 'ausdauer'],
    },
    {
        id: 'cat-cow',
        name: 'Cat Cow',
        aliases: ['Cat-Cow'],
        muscleGroup: 'Mobility',
        secondaryMuscleGroups: ['Rücken'],
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
        jointLoad: { ruecken: 'low', huefte: 'low' },
        goalTags: ['health'],
        substitutions: ['Hamstring Dehnung', 'World Greatest Stretch'],
        similarityTags: ['mobility', 'rücken', 'bodyweight', 'warmup', 'gelenkschonend'],
    },
    {
        id: 'world-greatest-stretch',
        name: 'World Greatest Stretch',
        aliases: ['Worlds Greatest Stretch'],
        muscleGroup: 'Mobility',
        secondaryMuscleGroups: ['Beine', 'Rücken'],
        kind: 'mobility',
        movementPattern: 'mobility',
        equipment: ['bodyweight'],
        level: 'beginner',
        stability: 'stable',
        axialLoad: 'low',
        overhead: false,
        deepKneeFlexion: false,
        impact: 'low',
        rotation: true,
        jointLoad: { huefte: 'low', ruecken: 'low' },
        goalTags: ['health'],
        substitutions: ['Cat Cow', 'Hamstring Dehnung'],
        similarityTags: ['mobility', 'ganzkörper', 'bodyweight', 'warmup', 'stretch'],
    },
]

exerciseCatalog = [...exerciseCatalog, ...EXTRA_FALLBACK_EXERCISES]
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
    for (const entry of entries) next.set(entry.id, sanitizeExerciseMetadata(entry))
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
        name: sanitizeDisplayText(dto.name),
        aliases: Array.isArray(dto.aliases) ? dto.aliases.map((alias) => sanitizeDisplayText(alias)) : [],
        muscleGroup: sanitizeDisplayText(dto.primaryMuscleGroup),
        secondaryMuscleGroups: Array.isArray(dto.secondaryMuscleGroups) ? dto.secondaryMuscleGroups.map((group) => sanitizeDisplayText(group)) : [],
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
        substitutions: (dto.substitutions ?? []).map((item) => sanitizeDisplayText(item)),
        similarityTags: (dto.similarityTags ?? []).map((item) => sanitizeDisplayText(item)),
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




