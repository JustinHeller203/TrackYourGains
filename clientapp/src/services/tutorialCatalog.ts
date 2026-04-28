import type { ExerciseMetadata } from '@/services/training/exerciseLibrary'
import type { TutorialTranslations } from '@/types/tutorials'

export type TutorialCatalogEntry = {
    id: number
    title: string
    videoUrl: string | null
    matchTerms: string[]
    description?: string
    category?: string
    level?: string
    equipment?: string[]
    muscleGroups?: string[]
    cues?: string[]
    steps?: string[]
    mistakes?: string[]
    source?: 'builtin' | 'generated'
    translations?: TutorialTranslations
}

const BUILTIN_TUTORIALS: TutorialCatalogEntry[] = [
    { id: 1, title: 'Bankdrücken', videoUrl: 'https://www.youtube.com/embed/Br8FJCuR4a4', matchTerms: ['bankdrücken', 'bench press', 'chest press', 'brust'] },
    { id: 2, title: 'Kniebeugen', videoUrl: 'https://www.youtube.com/embed/GBsAXMvZGwc', matchTerms: ['kniebeuge', 'squat', 'back squat', 'front squat'] },
    { id: 3, title: 'Kreuzheben', videoUrl: 'https://www.youtube.com/embed/eUhawFmUXZ0', matchTerms: ['kreuzheben', 'deadlift', 'romanian deadlift', 'rdl'] },
    { id: 4, title: 'Schulterdrücken', videoUrl: 'https://www.youtube.com/embed/bdMZfPOGWqw', matchTerms: ['schulterdrücken', 'shoulder press', 'overhead press', 'military press'] },
    { id: 5, title: 'Klimmzüge', videoUrl: 'https://www.youtube.com/embed/mWU2888TDLo', matchTerms: ['klimmzug', 'pull up', 'chin up', 'lat'] },
    { id: 6, title: 'Ausfallschritte', videoUrl: 'https://www.youtube.com/embed/YDaLrvY4UlU', matchTerms: ['ausfallschritt', 'lunge', 'split squat', 'bulgarian split squat'] },
    { id: 7, title: 'Plank', videoUrl: 'https://www.youtube.com/embed/iqh1AgblK3w', matchTerms: ['plank', 'core', 'hollow', 'stütz'] },
    { id: 8, title: 'Bizepscurls', videoUrl: 'https://www.youtube.com/embed/UBE9a2xTEl4', matchTerms: ['bizepscurl', 'curl', 'biceps curl', 'hammer curl'] },
    { id: 9, title: 'Beinpresse', videoUrl: 'https://www.youtube.com/embed/ai5g8OFbnZI', matchTerms: ['beinpresse', 'leg press'] },
    { id: 10, title: 'Burpees', videoUrl: 'https://www.youtube.com/embed/VkY1YpAjlwg', matchTerms: ['burpee', 'conditioning', 'hiit'] },
    { id: 11, title: 'Rudern am Kabel', videoUrl: 'https://www.youtube.com/embed/VsW98LIzHKA', matchTerms: ['rudern', 'seated row', 'cable row', 'row'] },
    { id: 12, title: 'Latziehen', videoUrl: 'https://www.youtube.com/embed/VqD9sPjRV9U', matchTerms: ['latziehen', 'lat pulldown', 'pulldown'] },
    { id: 13, title: 'Hip Thrust', videoUrl: 'https://www.youtube.com/embed/MsoX1M8_GSs', matchTerms: ['hip thrust', 'glute bridge', 'glutes'] },
    { id: 14, title: 'Rumänisches Kreuzheben', videoUrl: 'https://www.youtube.com/embed/lIUsXvrQXcE', matchTerms: ['rumänisches kreuzheben', 'romanian deadlift', 'rdl'] },
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
    plank: 'https://www.youtube.com/embed/iqh1AgblK3w',
    'dead-bug': 'https://www.youtube.com/embed/iqh1AgblK3w',
    'bird-dog': 'https://www.youtube.com/embed/iqh1AgblK3w',
    'side-plank': 'https://www.youtube.com/embed/iqh1AgblK3w',
    'bike-ergometer': null,
    'rowing-ergometer': null,
    'cross-trainer': null,
    walking: null,
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

function looksEnglish(value: string) {
    const text = String(value ?? '').trim()
    if (!text) return false
    if (/[^A-Za-z0-9 '\-]/.test(text)) return false
    return /[A-Za-z]/.test(text)
}

const EXERCISE_TITLE_TRANSLATIONS_EN: Record<string, string> = {
    [normalize('Liegestütze')]: 'Push-Ups',
    [normalize('Beinstrecker')]: 'Leg Extension',
    [normalize('Beinstrecker Maschine')]: 'Leg Extension Machine',
    [normalize('Beinbeuger')]: 'Leg Curl',
    [normalize('Beinbeuger Maschine')]: 'Leg Curl Machine',
    [normalize('Langhantel Rudern')]: 'Barbell Row',
    [normalize('Langhantel-Rudern')]: 'Barbell Row',
    [normalize('Einarmiges Rudern')]: 'One-Arm Dumbbell Row',
    [normalize('Einarmiges Kurzhantelrudern')]: 'One-Arm Dumbbell Row',
    [normalize('Kurzhantel Rudern einarmig')]: 'One-Arm Dumbbell Row',
    [normalize('Rudern')]: 'Row',
    [normalize('Kabelrudern')]: 'Cable Row',
    [normalize('Rudern am Kabel')]: 'Cable Row',
    [normalize('Brustgestütztes Rudern')]: 'Chest Supported Row',
    [normalize('Laufband Gehen Steigung')]: 'Incline Treadmill Walk',
    [normalize('Laufband Gehen')]: 'Treadmill Walk',
    [normalize('Laufband')]: 'Treadmill Walk',
    [normalize('Beinpresse')]: 'Leg Press',
    [normalize('Kniebeuge')]: 'Squat',
    [normalize('Kniebeugen')]: 'Squats',
}

function translateLevel(level?: string) {
    return level === 'advanced' ? 'Fortgeschritten'
        : level === 'intermediate' ? 'Fortgeschritten'
            : 'Anfänger'
}

function translateEquipment(equipment: ExerciseMetadata['equipment'], locale: 'de' | 'en' = 'de') {
    const labels: Record<'de' | 'en', Record<string, string>> = {
        de: {
            bodyweight: 'Körpergewicht',
            dumbbell: 'Kurzhanteln',
            barbell: 'Langhantel',
            machine: 'Maschine',
            cable: 'Kabelzug',
            cardio_machine: 'Cardio-Maschine',
            band: 'Band',
        },
        en: {
            bodyweight: 'Bodyweight',
            dumbbell: 'Dumbbells',
            barbell: 'Barbell',
            machine: 'Machine',
            cable: 'Cable',
            cardio_machine: 'Cardio Machine',
            band: 'Band',
        },
    }
    return equipment.map(item => labels[locale][item] ?? item)
}

function deriveCategory(exercise: ExerciseMetadata) {
    if (exercise.kind === 'cardio') return 'Cardio'
    if (exercise.kind === 'mobility') return 'Mobilität'
    if (exercise.muscleGroup === 'Core') return 'Core'
    if (['Beine', 'Gesäß'].includes(exercise.muscleGroup)) return 'Unterkörper'
    if (['Cardio', 'Mobility'].includes(exercise.muscleGroup)) return exercise.muscleGroup
    return 'Oberkörper'
}

function translateGoalTag(tag: string, locale: 'de' | 'en' = 'de') {
    const labels: Record<'de' | 'en', Record<string, string>> = {
        de: {
            muscle_gain: 'Muskelaufbau',
            general_fitness: 'Allgemeine Fitness',
            fat_loss: 'Fettverlust',
            endurance: 'Ausdauer',
            strength: 'Kraft',
            health: 'Gesundheit',
        },
        en: {
            muscle_gain: 'muscle gain',
            general_fitness: 'general fitness',
            fat_loss: 'fat loss',
            endurance: 'endurance',
            strength: 'strength',
            health: 'health',
        },
    }
    return labels[locale][tag] ?? tag.replace(/_/g, ' ')
}

function translateMuscleGroup(group: string, locale: 'de' | 'en' = 'de') {
    const labels: Record<'de' | 'en', Record<string, string>> = {
        de: {
            Brust: 'Brust',
            Schultern: 'Schultern',
            Arme: 'Arme',
            Rücken: 'Rücken',
            Latissimus: 'Latissimus',
            Beine: 'Beine',
            Quadrizeps: 'Quadrizeps',
            Beinbeuger: 'Beinbeuger',
            Gesäß: 'Gesäß',
            Core: 'Core',
            Bauch: 'Bauch',
            Cardio: 'Cardio',
            Mobilität: 'Mobilität',
            Dehnung: 'Dehnung',
            Waden: 'Waden',
            Unterarme: 'Unterarme',
            Trizeps: 'Trizeps',
            Bizeps: 'Bizeps',
        },
        en: {
            Brust: 'chest',
            Schultern: 'shoulders',
            Arme: 'arms',
            Rücken: 'back',
            Latissimus: 'lats',
            Beine: 'legs',
            Quadrizeps: 'quadriceps',
            Beinbeuger: 'hamstrings',
            Gesäß: 'glutes',
            Core: 'core',
            Bauch: 'abs',
            Cardio: 'cardio',
            Mobilität: 'mobility',
            Dehnung: 'mobility',
            Waden: 'calves',
            Unterarme: 'forearms',
            Trizeps: 'triceps',
            Bizeps: 'biceps',
        },
    }
    return labels[locale][group] ?? group
}

function addIf(set: Set<string>, haystack: Set<string>, keys: string[], value: string) {
    if (keys.some((key) => haystack.has(key))) set.add(value)
}

function deriveExerciseMuscleGroups(exercise: ExerciseMetadata, locale: 'de' | 'en' = 'de') {
    const signals = new Set(
        [
            exercise.id,
            exercise.name,
            exercise.muscleGroup,
            ...exercise.secondaryMuscleGroups,
            ...exercise.aliases,
            ...exercise.substitutions,
            ...exercise.similarityTags,
        ].map(normalize).filter(Boolean)
    )

    const groups = new Set<string>()
    addIf(groups, signals, ['bizeps', 'biceps'], translateMuscleGroup('Bizeps', locale))
    addIf(groups, signals, ['trizeps', 'triceps'], translateMuscleGroup('Trizeps', locale))
    addIf(groups, signals, ['unterarm', 'forearm'], translateMuscleGroup('Unterarme', locale))
    addIf(groups, signals, ['quadrizeps', 'quadriceps'], translateMuscleGroup('Quadrizeps', locale))
    addIf(groups, signals, ['beinbeuger', 'hamstrings', 'hamstring'], translateMuscleGroup('Beinbeuger', locale))
    addIf(groups, signals, ['gesass', 'glutes', 'glute'], translateMuscleGroup('Gesäß', locale))
    addIf(groups, signals, ['waden', 'calves', 'calf'], translateMuscleGroup('Waden', locale))
    addIf(groups, signals, ['lat', 'latissimus'], translateMuscleGroup('Latissimus', locale))
    addIf(groups, signals, ['rucken', 'back'], translateMuscleGroup('Rücken', locale))
    addIf(groups, signals, ['brust', 'chest'], translateMuscleGroup('Brust', locale))
    addIf(groups, signals, ['schulter', 'shoulder', 'rear delt', 'delt'], translateMuscleGroup('Schultern', locale))
    addIf(groups, signals, ['core', 'abs', 'bauch'], translateMuscleGroup('Core', locale))

    if (!groups.size) {
        groups.add(translateMuscleGroup(exercise.muscleGroup, locale))
        for (const group of exercise.secondaryMuscleGroups) groups.add(translateMuscleGroup(group, locale))
    }

    return Array.from(groups)
}

function pickEnglishExerciseTitle(exercise: ExerciseMetadata) {
    const mappedName = EXERCISE_TITLE_TRANSLATIONS_EN[normalize(exercise.name)]
    if (mappedName) return mappedName
    const mappedAlias = exercise.aliases
        .map((alias) => EXERCISE_TITLE_TRANSLATIONS_EN[normalize(alias)])
        .find(Boolean)
    if (mappedAlias) return mappedAlias
    if (looksEnglish(exercise.name)) return exercise.name
    const alias = exercise.aliases.find(looksEnglish)
    if (alias) return alias
    const substitution = exercise.substitutions.find(looksEnglish)
    if (substitution) return substitution
    return exercise.name
}

function buildDescription(exercise: ExerciseMetadata, locale: 'de' | 'en' = 'de') {
    const title = locale === 'en' ? pickEnglishExerciseTitle(exercise) : exercise.name
    const muscleGroups = deriveExerciseMuscleGroups(exercise, locale)
    const primary = muscleGroups[0] ?? translateMuscleGroup(exercise.muscleGroup, locale)
    const secondary = muscleGroups.slice(1, 3)

    if (locale === 'en') {
        if (exercise.kind === 'cardio') {
            return `${title} improves endurance and work capacity with a focus on ${primary}.`
        }
        if (exercise.kind === 'mobility') {
            return `${title} supports mobility and control with a focus on ${primary}.`
        }
        const helpers = secondary.length ? `, with additional focus on ${secondary.join(', ')}` : ''
        const goals = exercise.goalTags.length
            ? exercise.goalTags.map((tag) => translateGoalTag(tag, 'en')).join(', ')
            : 'general strength training'
        return `${title} mainly trains ${primary}${helpers} and fits goals like ${goals}.`
    }

    if (exercise.kind === 'cardio') {
        return `${title} verbessert Ausdauer und Belastungsverträglichkeit mit Fokus auf ${primary}.`
    }
    if (exercise.kind === 'mobility') {
        return `${title} unterstützt Beweglichkeit und Kontrolle mit Fokus auf ${primary}.`
    }
    const helpers = secondary.length ? `, zusätzlich ${secondary.join(', ')}` : ''
    const goals = exercise.goalTags.length
        ? exercise.goalTags.map((tag) => translateGoalTag(tag, 'de')).join(', ')
        : 'allgemeinem Krafttraining'
    return `${title} trainiert vor allem ${primary}${helpers} und passt zu ${goals}.`
}

function buildCues(exercise: ExerciseMetadata, locale: 'de' | 'en' = 'de') {
    if (exercise.kind === 'cardio') {
        return locale === 'en'
            ? ['Work in a controlled rhythm.', 'Stay technically clean before increasing the pace.', 'Keep your breathing and body tension steady.']
            : ['Arbeite in einem kontrollierten Rhythmus.', 'Bleibe technisch sauber, bevor du das Tempo erhöhst.', 'Atmung und Körperspannung konstant halten.']
    }
    if (exercise.kind === 'mobility') {
        return locale === 'en'
            ? ['Move calmly and without rushing.', 'Match your breathing to the motion.', 'Only go into a range you can control.']
            : ['Bewege dich ruhig und ohne Hast.', 'Atmung gleichmäßig mit der Bewegung koppeln.', 'Nur in einen kontrollierbaren Bewegungsbereich gehen.']
    }
    const byPattern: Record<'de' | 'en', Record<string, string[]>> = {
        de: {
            horizontal_push: ['Schulterblätter stabil halten.', 'Druck gleichmäßig über den Bewegungsweg aufbauen.', 'Handgelenke und Ellbogen sauber stapeln.'],
            vertical_push: ['Rumpf stabil halten und nicht ausweichen.', 'Gewicht über einer sauberen Linie bewegen.', 'Endposition aktiv kontrollieren.'],
            horizontal_pull: ['Brust offen halten.', 'Aus dem Rücken und nicht nur aus den Armen ziehen.', 'Rückweg bewusst bremsen.'],
            vertical_pull: ['Schultern unten halten.', 'Ellbogen Richtung Torso führen.', 'Oben und unten die Position kontrollieren.'],
            squat: ['Druck über den ganzen Fuß halten.', 'Knie folgen der Fußlinie.', 'Rumpf vor jeder Wiederholung fest machen.'],
            lunge: ['Becken stabil halten.', 'Vorderes Bein sauber belasten.', 'Jede Seite gleich kontrolliert arbeiten.'],
            hinge: ['Hüfte aktiv nach hinten führen.', 'Rücken neutral halten.', 'Spannung in der hinteren Kette behalten.'],
            core: ['Rippen unten und Bauch aktiv halten.', 'Bewegung ruhig kontrollieren.', 'Nicht in Ausweichmuster fallen.'],
            isolation: ['Schwung vermeiden.', 'Zielmuskel bewusst ansteuern.', 'Exzentrik sauber kontrollieren.'],
        },
        en: {
            horizontal_push: ['Keep your shoulder blades stable.', 'Build pressure evenly through the full range.', 'Stack wrists and elbows cleanly.'],
            vertical_push: ['Keep the trunk stable and do not shift away.', 'Move the weight in a clean line.', 'Control the end position actively.'],
            horizontal_pull: ['Keep the chest open.', 'Pull from the back and not only from the arms.', 'Brake the return consciously.'],
            vertical_pull: ['Keep the shoulders down.', 'Drive the elbows toward the torso.', 'Control the top and bottom positions.'],
            squat: ['Keep pressure through the whole foot.', 'Let the knees follow the line of the feet.', 'Brace the trunk before every rep.'],
            lunge: ['Keep the pelvis stable.', 'Load the front leg cleanly.', 'Work each side with equal control.'],
            hinge: ['Drive the hips back actively.', 'Keep the back neutral.', 'Maintain tension in the posterior chain.'],
            core: ['Keep the ribs down and abs active.', 'Control the movement calmly.', 'Do not fall into compensation patterns.'],
            isolation: ['Avoid momentum.', 'Target the working muscle consciously.', 'Control the eccentric cleanly.'],
        },
    }
    return byPattern[locale][exercise.movementPattern] ?? (locale === 'en'
        ? ['Build the movement with control.', 'Hold a stable position.', 'Finish every repetition cleanly.']
        : ['Bewegung kontrolliert aufbauen.', 'Stabile Position halten.', 'Jede Wiederholung sauber beenden.'])
}

function buildSteps(exercise: ExerciseMetadata, locale: 'de' | 'en' = 'de') {
    if (exercise.kind === 'cardio') {
        return locale === 'en'
            ? ['Adjust the machine or start position properly.', 'Ease into the movement with a moderate pace.', 'Only increase the load once the pattern stays stable.']
            : ['Gerät oder Startposition passend einstellen.', 'Mit moderatem Tempo sauber in die Bewegung kommen.', 'Belastung erst steigern, wenn der Ablauf stabil bleibt.']
    }
    if (exercise.kind === 'mobility') {
        return locale === 'en'
            ? ['Build the starting position calmly and steadily.', 'Move slowly into the target range.', 'Return to the start position with control.']
            : ['Ausgangsposition ruhig und stabil aufbauen.', 'Bewegung langsam in den Zielbereich führen.', 'Kontrolliert zur Startposition zurückkehren.']
    }
    return locale === 'en'
        ? ['Set up the movement and starting position cleanly.', 'Perform the working phase with control and tension.', 'Brake the return and rebuild for the next rep.']
        : ['Setup und Ausgangsposition sauber einrichten.', 'Arbeitsphase kontrolliert und mit Spannung ausführen.', 'Rückweg bewusst bremsen und für die nächste Wiederholung neu aufbauen.']
}

function buildMistakes(exercise: ExerciseMetadata, locale: 'de' | 'en' = 'de') {
    if (exercise.kind === 'cardio') {
        return locale === 'en'
            ? ['Putting speed before technique too early.', 'Letting posture collapse under fatigue.', 'Starting without clean load control.']
            : ['Zu früh Tempo vor Technik stellen.', 'Haltung unter Ermüdung kollabieren lassen.', 'Ohne saubere Belastungssteuerung starten.']
    }
    if (exercise.kind === 'mobility') {
        return locale === 'en'
            ? ['Moving into pain instead of controlled tension.', 'Bouncing into the position with momentum.', 'Holding the breath and losing tension.']
            : ['In Schmerz statt in kontrollierte Spannung gehen.', 'Mit Schwung in die Position federn.', 'Atmung anhalten und die Spannung verlieren.']
    }
    return locale === 'en'
        ? ['Using momentum instead of control.', 'Losing the stable start position between reps.', 'Shortening the range once it gets hard.']
        : ['Mit Schwung statt mit Kontrolle arbeiten.', 'Stabile Ausgangsposition zwischen Wiederholungen verlieren.', 'Bewegungsradius abkürzen, sobald es anstrengend wird.']
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
    if (exercise.movementPattern === 'vertical_pull') {
        return exercise.equipment.includes('bodyweight')
            ? 'https://www.youtube.com/embed/mWU2888TDLo'
            : 'https://www.youtube.com/embed/VqD9sPjRV9U'
    }
    if (exercise.movementPattern === 'squat') {
        return exercise.equipment.includes('machine')
            ? 'https://www.youtube.com/embed/ai5g8OFbnZI'
            : 'https://www.youtube.com/embed/GBsAXMvZGwc'
    }
    if (exercise.movementPattern === 'lunge') return 'https://www.youtube.com/embed/YDaLrvY4UlU'
    if (exercise.movementPattern === 'hinge') {
        return exercise.muscleGroup === 'Gesäß'
            ? 'https://www.youtube.com/embed/MsoX1M8_GSs'
            : 'https://www.youtube.com/embed/lIUsXvrQXcE'
    }
    if (exercise.movementPattern === 'core') return 'https://www.youtube.com/embed/iqh1AgblK3w'
    if (exercise.movementPattern === 'isolation' && exercise.muscleGroup === 'Arme') return 'https://www.youtube.com/embed/UBE9a2xTEl4'
    if (exercise.movementPattern === 'isolation' && exercise.muscleGroup === 'Schultern') return 'https://www.youtube.com/embed/bTYps6PsRZw'
    return null
}

function buildExerciseTranslations(exercise: ExerciseMetadata): TutorialTranslations {
    return {
        en: {
            title: pickEnglishExerciseTitle(exercise),
            description: buildDescription(exercise, 'en'),
            equipment: translateEquipment(exercise.equipment, 'en'),
            muscleGroups: deriveExerciseMuscleGroups(exercise, 'en'),
            cues: buildCues(exercise, 'en'),
            steps: buildSteps(exercise, 'en'),
            mistakes: buildMistakes(exercise, 'en'),
        },
    }
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
        description: buildDescription(exercise, 'de'),
        category: deriveCategory(exercise),
        level: translateLevel(exercise.level),
        equipment: translateEquipment(exercise.equipment, 'de'),
        muscleGroups: deriveExerciseMuscleGroups(exercise, 'de'),
        cues: buildCues(exercise, 'de'),
        steps: buildSteps(exercise, 'de'),
        mistakes: buildMistakes(exercise, 'de'),
        source: matched ? 'builtin' : 'generated',
        translations: buildExerciseTranslations(exercise),
    }
}
