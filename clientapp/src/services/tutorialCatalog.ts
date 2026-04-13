import type { ExerciseMetadata } from '@/services/training/exerciseLibrary'

export type TutorialCatalogEntry = {
    id: number
    title: string
    videoUrl: string | null
    matchTerms: string[]
    description?: string
    category?: string
    level?: string
    equipment?: string[]
    cues?: string[]
    steps?: string[]
    mistakes?: string[]
    source?: 'builtin' | 'generated'
}

const BUILTIN_TUTORIALS: TutorialCatalogEntry[] = [
    { id: 1, title: 'Bankdr\u00fccken', videoUrl: 'https://www.youtube.com/embed/Br8FJCuR4a4', matchTerms: ['bankdr\u00fccken', 'bench press', 'chest press', 'brust'] },
    { id: 2, title: 'Kniebeugen', videoUrl: 'https://www.youtube.com/embed/GBsAXMvZGwc', matchTerms: ['kniebeuge', 'squat', 'back squat', 'front squat'] },
    { id: 3, title: 'Kreuzheben', videoUrl: 'https://www.youtube.com/embed/eUhawFmUXZ0', matchTerms: ['kreuzheben', 'deadlift', 'romanian deadlift', 'rdl'] },
    { id: 4, title: 'Schulterdr\u00fccken', videoUrl: 'https://www.youtube.com/embed/bdMZfPOGWqw', matchTerms: ['schulterdr\u00fccken', 'shoulder press', 'overhead press', 'military press'] },
    { id: 5, title: 'Klimmz\u00fcge', videoUrl: 'https://www.youtube.com/embed/mWU2888TDLo', matchTerms: ['klimmzug', 'pull up', 'chin up', 'lat'] },
    { id: 6, title: 'Ausfallschritte', videoUrl: 'https://www.youtube.com/embed/YDaLrvY4UlU', matchTerms: ['ausfallschritt', 'lunge', 'split squat', 'bulgarian split squat'] },
    { id: 7, title: 'Plank', videoUrl: 'https://www.youtube.com/embed/iqh1AgblK3w', matchTerms: ['plank', 'core', 'hollow', 'stütz', 'st\u00fctz'] },
    { id: 8, title: 'Bizepscurls', videoUrl: 'https://www.youtube.com/embed/UBE9a2xTEl4', matchTerms: ['bizepscurl', 'curl', 'biceps curl', 'hammer curl'] },
    { id: 9, title: 'Beinpresse', videoUrl: 'https://www.youtube.com/embed/ai5g8OFbnZI', matchTerms: ['beinpresse', 'leg press'] },
    { id: 10, title: 'Burpees', videoUrl: 'https://www.youtube.com/embed/VkY1YpAjlwg', matchTerms: ['burpee', 'conditioning', 'hiit'] },
    { id: 11, title: 'Rudern am Kabel', videoUrl: 'https://www.youtube.com/embed/VsW98LIzHKA', matchTerms: ['rudern', 'seated row', 'cable row', 'row'] },
    { id: 12, title: 'Latziehen', videoUrl: 'https://www.youtube.com/embed/VqD9sPjRV9U', matchTerms: ['latziehen', 'lat pulldown', 'pulldown'] },
    { id: 13, title: 'Hip Thrust', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', matchTerms: ['hip thrust', 'glute bridge', 'glutes'] },
    { id: 14, title: 'Rum\u00e4nisches Kreuzheben', videoUrl: 'https://www.youtube.com/embed/lIUsXvrQXcE', matchTerms: ['rumänisches kreuzheben', 'rum\u00e4nisches kreuzheben', 'romanian deadlift', 'rdl'] },
    { id: 15, title: 'Face Pulls', videoUrl: 'https://www.youtube.com/embed/RRXyfDlLHwo', matchTerms: ['face pull', 'rear delt', 'hintere schulter'] },
    { id: 16, title: 'Dips', videoUrl: 'https://www.youtube.com/embed/AloHKkWtUiE', matchTerms: ['dip', 'dips', 'trizeps dips'] },
    { id: 17, title: 'Trizeps Pushdown', videoUrl: 'https://www.youtube.com/embed/EsIddhEdo1M', matchTerms: ['pushdown', 'trizeps', 'triceps pushdown'] },
    { id: 18, title: 'Seitheben', videoUrl: 'https://www.youtube.com/embed/bTYps6PsRZw', matchTerms: ['seitheben', 'lateral raise', 'schulter'] },
    { id: 19, title: 'Wadenheben', videoUrl: 'https://www.youtube.com/embed/hYnpAmykqDA', matchTerms: ['wadenheben', 'calf raise', 'calves'] },
    { id: 20, title: 'Leg Curl', videoUrl: 'https://www.youtube.com/embed/Uu-wvoXbYTE', matchTerms: ['leg curl', 'beinbeuger', 'hamstring curl'] },
    { id: 21, title: 'Leg Extension', videoUrl: 'https://www.youtube.com/embed/0Yed-nbKN7U', matchTerms: ['leg extension', 'beinstrecker', 'quadrizeps'] },
    { id: 22, title: 'Chest Fly', videoUrl: null, matchTerms: ['fly', 'chest fly', 'pec deck'] },
    { id: 23, title: 'Mountain Climbers', videoUrl: null, matchTerms: ['mountain climber', 'conditioning', 'core cardio'] },
    { id: 24, title: 'Russian Twists', videoUrl: null, matchTerms: ['russian twist', 'rotation', 'obliques'] },
    { id: 25, title: 'Bird Dog', videoUrl: null, matchTerms: ['bird dog', 'stabilität', 'lower back'] },
    { id: 26, title: 'Glute Bridge', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', matchTerms: ['glute bridge', 'bridge', 'hip bridge'] },
    { id: 27, title: 'Goblet Squat', videoUrl: 'https://www.youtube.com/embed/8VrXHfHH5PM', matchTerms: ['goblet squat', 'squat', 'front squat'] },
    { id: 28, title: 'Incline Dumbbell Press', videoUrl: 'https://www.youtube.com/embed/0WPRqCYF4pA', matchTerms: ['incline press', 'schrägbank', 'dumbbell press'] },
]

const VIDEO_FALLBACK_BY_EXERCISE_ID: Record<string, string | null> = {
    'bench-press': 'https://www.youtube.com/embed/Br8FJCuR4a4',
    'dumbbell-bench-press': 'https://www.youtube.com/embed/Br8FJCuR4a4',
    'incline-dumbbell-press': 'https://www.youtube.com/embed/0WPRqCYF4pA',
    'incline-chest-press-machine': 'https://www.youtube.com/embed/0WPRqCYF4pA',
    'chest-press-machine': 'https://www.youtube.com/embed/Br8FJCuR4a4',
    'push-up': 'https://www.youtube.com/embed/Br8FJCuR4a4',
    'lat-pulldown': 'https://www.youtube.com/embed/VqD9sPjRV9U',
    'assisted-pull-up': 'https://www.youtube.com/embed/VqD9sPjRV9U',
    'pull-up': 'https://www.youtube.com/embed/mWU2888TDLo',
    'australian-pull-up': 'https://www.youtube.com/embed/VsW98LIzHKA',
    'cable-row': 'https://www.youtube.com/embed/VsW98LIzHKA',
    'chest-supported-row': 'https://www.youtube.com/embed/VsW98LIzHKA',
    'leg-press': 'https://www.youtube.com/embed/ai5g8OFbnZI',
    'goblet-squat': 'https://www.youtube.com/embed/8VrXHfHH5PM',
    'box-squat': 'https://www.youtube.com/embed/GBsAXMvZGwc',
    'walking-lunge': 'https://www.youtube.com/embed/YDaLrvY4UlU',
    'step-up': 'https://www.youtube.com/embed/YDaLrvY4UlU',
    'romanian-deadlift': 'https://www.youtube.com/embed/lIUsXvrQXcE',
    'hip-thrust': 'https://www.youtube.com/embed/MsoX1M8_GSs',
    'glute-bridge': 'https://www.youtube.com/embed/MsoX1M8_GSs',
    'overhead-press': 'https://www.youtube.com/embed/bdMZfPOGWqw',
    'landmine-press': 'https://www.youtube.com/embed/bdMZfPOGWqw',
    'lateral-raise': 'https://www.youtube.com/embed/bTYps6PsRZw',
    'cable-lateral-raise': 'https://www.youtube.com/embed/bTYps6PsRZw',
    'biceps-curl-dumbbell': 'https://www.youtube.com/embed/UBE9a2xTEl4',
    'hammer-curl': 'https://www.youtube.com/embed/UBE9a2xTEl4',
    'cable-biceps-curl': 'https://www.youtube.com/embed/UBE9a2xTEl4',
    'triceps-pushdown': 'https://www.youtube.com/embed/EsIddhEdo1M',
    'overhead-triceps-extension': 'https://www.youtube.com/embed/EsIddhEdo1M',
    'dip-assisted': 'https://www.youtube.com/embed/AloHKkWtUiE',
    'dip-bodyweight': 'https://www.youtube.com/embed/AloHKkWtUiE',
    'plank': 'https://www.youtube.com/embed/iqh1AgblK3w',
    'dead-bug': 'https://www.youtube.com/embed/iqh1AgblK3w',
    'bird-dog': 'https://www.youtube.com/embed/iqh1AgblK3w',
    'side-plank': 'https://www.youtube.com/embed/iqh1AgblK3w',
    'bike-ergometer': null,
    'rowing-ergometer': null,
    'cross-trainer': null,
    'walking': null,
    'hamstring-stretch': null,
    'cat-cow': null,
    'world-greatest-stretch': null,
}

function normalize(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
}

function translateLevel(level?: string) {
    return level === 'advanced' ? 'Fortgeschritten'
        : level === 'intermediate' ? 'Mittelstufe'
            : 'Anfänger'
}

function translateEquipment(equipment: ExerciseMetadata['equipment']) {
    const labels: Record<string, string> = {
        bodyweight: 'Körpergewicht',
        dumbbell: 'Kurzhanteln',
        barbell: 'Langhantel',
        machine: 'Maschine',
        cable: 'Kabelzug',
        cardio_machine: 'Cardio-Maschine',
        band: 'Band',
    }
    return equipment.map(item => labels[item] ?? item)
}

function deriveCategory(exercise: ExerciseMetadata) {
    if (exercise.kind === 'cardio') return 'Cardio'
    if (exercise.kind === 'mobility') return 'Mobilität'
    if (exercise.muscleGroup === 'Core') return 'Core'
    if (['Beine', 'Gesäß'].includes(exercise.muscleGroup)) return 'Unterkörper'
    if (['Cardio', 'Mobility'].includes(exercise.muscleGroup)) return exercise.muscleGroup
    return 'Oberkörper'
}

function buildDescription(exercise: ExerciseMetadata) {
    if (exercise.kind === 'cardio') {
        return `${exercise.name} verbessert Ausdauer und Belastungsverträglichkeit bei Fokus auf ${exercise.muscleGroup.toLowerCase()}.`
    }
    if (exercise.kind === 'mobility') {
        return `${exercise.name} unterstützt Beweglichkeit und Kontrolle mit Fokus auf ${exercise.muscleGroup.toLowerCase()}.`
    }
    const helpers = exercise.secondaryMuscleGroups.length ? `, dazu ${exercise.secondaryMuscleGroups.join(', ')}` : ''
    return `${exercise.name} trainiert vor allem ${exercise.muscleGroup.toLowerCase()}${helpers} und passt zu ${exercise.goalTags.join(', ') || 'allgemeinem Krafttraining'}.`
}

function buildCues(exercise: ExerciseMetadata) {
    if (exercise.kind === 'cardio') {
        return [
            'Arbeite in einem kontrollierten Rhythmus.',
            'Bleibe technisch sauber, bevor du das Tempo erhöhst.',
            'Atmung und Körperspannung konstant halten.',
        ]
    }
    if (exercise.kind === 'mobility') {
        return [
            'Bewege dich ruhig und ohne Hast.',
            'Atmung gleichmäßig mit der Bewegung koppeln.',
            'Nur in einen kontrollierbaren Bewegungsbereich gehen.',
        ]
    }
    const byPattern: Record<string, string[]> = {
        horizontal_push: ['Schulterblätter stabil halten.', 'Druck gleichmäßig über den Bewegungsweg aufbauen.', 'Handgelenke und Ellbogen sauber stapeln.'],
        vertical_push: ['Rumpf stabil halten und nicht ausweichen.', 'Gewicht über einer sauberen Linie bewegen.', 'Endposition aktiv kontrollieren.'],
        horizontal_pull: ['Brust offen halten.', 'Aus Rücken und nicht nur aus den Armen ziehen.', 'Rückweg bewusst bremsen.'],
        vertical_pull: ['Schultern unten halten.', 'Ellbogen Richtung Torso führen.', 'Oben und unten die Position kontrollieren.'],
        squat: ['Druck über den ganzen Fuß halten.', 'Knie folgen der Fußlinie.', 'Rumpf vor jeder Wiederholung fest machen.'],
        lunge: ['Becken stabil halten.', 'Vorderes Bein sauber belasten.', 'Jede Seite gleich kontrolliert arbeiten.'],
        hinge: ['Hüfte aktiv nach hinten führen.', 'Rücken neutral halten.', 'Spannung in hinterer Kette behalten.'],
        core: ['Rippen unten und Bauch aktiv halten.', 'Bewegung ruhig kontrollieren.', 'Nicht in Ausweichmuster fallen.'],
        isolation: ['Schwung vermeiden.', 'Zielmuskel bewusst ansteuern.', 'Exzentrik sauber kontrollieren.'],
    }
    return byPattern[exercise.movementPattern] ?? ['Bewegung kontrolliert aufbauen.', 'Stabile Position halten.', 'Jede Wiederholung sauber beenden.']
}

function buildSteps(exercise: ExerciseMetadata) {
    if (exercise.kind === 'cardio') {
        return [
            'Gerät oder Startposition passend einstellen.',
            'Mit moderatem Tempo sauber in die Bewegung kommen.',
            'Belastung erst steigern, wenn der Ablauf stabil bleibt.',
        ]
    }
    if (exercise.kind === 'mobility') {
        return [
            'Ausgangsposition ruhig und stabil aufbauen.',
            'Bewegung langsam in den Zielbereich führen.',
            'Kontrolliert zur Startposition zurückkehren.',
        ]
    }
    return [
        'Setup und Ausgangsposition sauber einrichten.',
        'Arbeitsphase kontrolliert und mit Spannung ausführen.',
        'Rückweg bewusst bremsen und für die nächste Wiederholung neu aufbauen.',
    ]
}

function buildMistakes(exercise: ExerciseMetadata) {
    if (exercise.kind === 'cardio') {
        return [
            'Zu früh Tempo vor Technik stellen.',
            'Haltung unter Ermüdung kollabieren lassen.',
            'Ohne saubere Belastungssteuerung starten.',
        ]
    }
    if (exercise.kind === 'mobility') {
        return [
            'In Schmerz statt in kontrollierte Spannung gehen.',
            'Mit Schwung in die Position federn.',
            'Atmung anhalten und die Spannung verlieren.',
        ]
    }
    return [
        'Mit Schwung statt mit Kontrolle arbeiten.',
        'Stabile Ausgangsposition zwischen Wiederholungen verlieren.',
        'Bewegungsradius abkürzen, sobald es anstrengend wird.',
    ]
}

function scoreTutorialAgainstNeedle(tutorial: TutorialCatalogEntry, needle: string) {
    let score = 0
    const title = normalize(tutorial.title)
    if (title === needle) score = Math.max(score, 120)
    if (title.includes(needle) || needle.includes(title)) score = Math.max(score, 90)
    for (const termRaw of tutorial.matchTerms) {
        const term = normalize(termRaw)
        if (!term) continue
        if (term === needle) score = Math.max(score, 110)
        else if (term.includes(needle) || needle.includes(term)) score = Math.max(score, 80)
    }
    return score
}

export function isYouTubeEmbed(url: string | null | undefined): boolean {
    return /^https:\/\/www\.youtube\.com\/embed\//i.test(String(url ?? '').trim())
}

export function findTutorialForExercise(exerciseName: string): TutorialCatalogEntry | null {
    const needle = normalize(exerciseName)
    if (!needle) return null
    let best: { tutorial: TutorialCatalogEntry; score: number } | null = null
    for (const tutorial of BUILTIN_TUTORIALS) {
        const score = scoreTutorialAgainstNeedle(tutorial, needle)
        if (!best || score > best.score) best = { tutorial, score }
    }
    return best && best.score >= 80 ? best.tutorial : null
}

function findTutorialFromCandidates(candidates: string[]) {
    let best: { tutorial: TutorialCatalogEntry; score: number } | null = null
    for (const candidate of candidates) {
        const needle = normalize(candidate)
        if (!needle) continue
        for (const tutorial of BUILTIN_TUTORIALS) {
            const score = scoreTutorialAgainstNeedle(tutorial, needle)
            if (!best || score > best.score) best = { tutorial, score }
        }
    }
    return best && best.score >= 80 ? best.tutorial : null
}

function getFallbackVideoUrl(exercise: ExerciseMetadata) {
    if (exercise.id in VIDEO_FALLBACK_BY_EXERCISE_ID) return VIDEO_FALLBACK_BY_EXERCISE_ID[exercise.id]
    if (exercise.kind === 'cardio' || exercise.kind === 'mobility') return null
    if (exercise.movementPattern === 'horizontal_push') return 'https://www.youtube.com/embed/Br8FJCuR4a4'
    if (exercise.movementPattern === 'vertical_push') return 'https://www.youtube.com/embed/bdMZfPOGWqw'
    if (exercise.movementPattern === 'horizontal_pull') return 'https://www.youtube.com/embed/VsW98LIzHKA'
    if (exercise.movementPattern === 'vertical_pull') return exercise.equipment.includes('bodyweight')
        ? 'https://www.youtube.com/embed/mWU2888TDLo'
        : 'https://www.youtube.com/embed/VqD9sPjRV9U'
    if (exercise.movementPattern === 'squat') return exercise.equipment.includes('machine')
        ? 'https://www.youtube.com/embed/ai5g8OFbnZI'
        : 'https://www.youtube.com/embed/GBsAXMvZGwc'
    if (exercise.movementPattern === 'lunge') return 'https://www.youtube.com/embed/YDaLrvY4UlU'
    if (exercise.movementPattern === 'hinge') return exercise.muscleGroup === 'Gesäß'
        ? 'https://www.youtube.com/embed/MsoX1M8_GSs'
        : 'https://www.youtube.com/embed/lIUsXvrQXcE'
    if (exercise.movementPattern === 'core') return 'https://www.youtube.com/embed/iqh1AgblK3w'
    if (exercise.movementPattern === 'isolation' && exercise.muscleGroup === 'Arme') return 'https://www.youtube.com/embed/UBE9a2xTEl4'
    if (exercise.movementPattern === 'isolation' && exercise.muscleGroup === 'Schultern') return 'https://www.youtube.com/embed/bTYps6PsRZw'
    return null
}

export function resolveTutorialForExercise(exercise: ExerciseMetadata): TutorialCatalogEntry {
    const matched = findTutorialFromCandidates([exercise.name, ...exercise.aliases])
    const substitutionMatch = findTutorialFromCandidates(exercise.substitutions)
    const chosenVideoUrl = matched?.videoUrl ?? substitutionMatch?.videoUrl ?? getFallbackVideoUrl(exercise)

    return {
        id: matched?.id ?? Number(String(exercise.id).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)),
        title: exercise.name,
        videoUrl: chosenVideoUrl,
        matchTerms: Array.from(new Set([exercise.name, ...exercise.aliases, ...exercise.substitutions].filter(Boolean))),
        description: buildDescription(exercise),
        category: deriveCategory(exercise),
        level: translateLevel(exercise.level),
        equipment: translateEquipment(exercise.equipment),
        cues: buildCues(exercise),
        steps: buildSteps(exercise),
        mistakes: buildMistakes(exercise),
        source: matched ? 'builtin' : 'generated',
    }
}

