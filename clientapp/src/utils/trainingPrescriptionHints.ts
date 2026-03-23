import type { GoalType, TrainingLevel } from '@/types/autoPlan'
import type { ExerciseMetadata, MovementPattern } from '@/services/training/exerciseLibrary'

export type BuilderTrainingType = 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung'

type PrescriptionArchetype =
    | 'compound'
    | 'isolation'
    | 'core'
    | 'calisthenics_skill'
    | 'calisthenics_volume'
    | 'cardio'
    | 'mobility'

export type TrainingPrescriptionHint = {
    title: string
    summary: string
    focusLabel: string
    chips: string[]
    setsLabel: string
    repsLabel: string
    restLabel: string
    recommendationLabel: string
    noteLine: string
    exact: {
        sets?: number | null
        reps?: number | null
        restSeconds?: number | null
        durationMin?: number | null
        distanceKm?: number | null
    }
}

type PrescriptionContext = {
    trainingType: BuilderTrainingType
    goalType: GoalType
    level?: TrainingLevel
    exerciseName?: string | null
    exercise?: ExerciseMetadata | null
}

const MOVEMENT_COMPOUNDS = new Set<MovementPattern>([
    'horizontal_push',
    'vertical_push',
    'horizontal_pull',
    'vertical_pull',
    'squat',
    'lunge',
    'hinge',
])

const MOVEMENT_ISOLATIONS = new Set<MovementPattern>(['isolation'])
const MOVEMENT_CORE = new Set<MovementPattern>(['core'])

const CARDIO_GOAL_COPY: Record<GoalType, { title: string; summary: string; duration: number; durationLabel: string; restLabel: string; focusLabel: string; chips: string[]; noteLine: string }> = {
    endurance: {
        title: 'Ausdauer-Aufbau',
        summary: 'Längere, kontrollierte Belastung für Ausdauer und stabile Pace.',
        duration: 32,
        durationLabel: '25-40 min',
        restLabel: 'steady pace',
        focusLabel: 'Aerobe Basis',
        chips: ['Zone 2', 'saubere Pace', 'konstant'],
        noteLine: 'Ausdauer-Range: 25-40 min steady pace',
    },
    fat_loss: {
        title: 'Stoffwechsel-Boost',
        summary: 'Dichter, effizienter Cardio-Block mit genug Output ohne Technikverlust.',
        duration: 20,
        durationLabel: '16-24 min',
        restLabel: 'leicht progressiv',
        focusLabel: 'Kalorienfokus',
        chips: ['dicht', 'aktiv', 'kontrolliert'],
        noteLine: 'Kalorienfokus: 16-24 min mit progressiver Intensität',
    },
    health: {
        title: 'Gelenkschonender Flow',
        summary: 'Sanfter Cardio-Block mit niedrigem Impact für Alltag, Recovery und Herz-Kreislauf.',
        duration: 24,
        durationLabel: '20-30 min',
        restLabel: 'locker bis moderat',
        focusLabel: 'Erholungs-Cardio',
        chips: ['low impact', 'locker', 'alltagstauglich'],
        noteLine: 'Gesundheits-Range: 20-30 min locker bis moderat',
    },
    muscle_gain: {
        title: 'Erholungs-Block',
        summary: 'Kurzer Cardio-Block, damit Kraft und Volumen im Fokus bleiben.',
        duration: 14,
        durationLabel: '10-18 min',
        restLabel: 'locker',
        focusLabel: 'Ergänzung',
        chips: ['kurz', 'erholend', 'nicht auslaugend'],
        noteLine: 'Ergänzungs-Range: 10-18 min locker',
    },
    strength: {
        title: 'Minimale Ermüdung',
        summary: 'Kurzer Ausdauerreiz, der das Krafttraining nicht ausbremst.',
        duration: 12,
        durationLabel: '8-15 min',
        restLabel: 'easy pace',
        focusLabel: 'Kraftschonend',
        chips: ['kurz', 'sauber', 'kraftfreundlich'],
        noteLine: 'Kraftfreundlich: 8-15 min easy pace',
    },
    general_fitness: {
        title: 'Hybrid-Aufbau',
        summary: 'Ausgewogener Cardio-Block für Alltag, Fitness und spürbare Kondition.',
        duration: 22,
        durationLabel: '18-28 min',
        restLabel: 'moderat',
        focusLabel: 'Allround Fitness',
        chips: ['ausgewogen', 'solide Pace', 'allround'],
        noteLine: 'Allround-Range: 18-28 min moderat',
    },
}

const MOBILITY_GOAL_COPY: Record<GoalType, { title: string; summary: string; sets: number; reps: number; setsLabel: string; repsLabel: string; focusLabel: string; chips: string[]; noteLine: string }> = {
    health: {
        title: 'Mobilitäts-Reset',
        summary: 'Längere, ruhige Holds für Beweglichkeit, Atmung und Gelenkentlastung.',
        sets: 3,
        reps: 40,
        setsLabel: '2-4 Holds',
        repsLabel: '30-60 s',
        focusLabel: 'Mobilitäts-Reset',
        chips: ['ruhig', 'sauber', 'atmung'],
        noteLine: 'Mobility-Range: 2-4 Holds a 30-60 s',
    },
    muscle_gain: {
        title: 'Spannungs-Ausgleich',
        summary: 'Kurze Mobility-Arbeit, um Bewegungsqualität zu erhalten ohne das Haupttraining zu strecken.',
        sets: 2,
        reps: 30,
        setsLabel: '2-3 Holds',
        repsLabel: '20-40 s',
        focusLabel: 'Ergänzung',
        chips: ['kurz', 'locker', 'beweglich'],
        noteLine: 'Mobility-Range: 2-3 Holds a 20-40 s',
    },
    strength: {
        title: 'Bewegungskontrolle',
        summary: 'Gezielte Holds für Positionen, die deine Grundübungen sauberer machen.',
        sets: 2,
        reps: 25,
        setsLabel: '2-3 Holds',
        repsLabel: '20-35 s',
        focusLabel: 'Positionsarbeit',
        chips: ['kontrolle', 'position', 'technik'],
        noteLine: 'Positionsarbeit: 2-3 Holds a 20-35 s',
    },
    fat_loss: {
        title: 'Besser Bewegen',
        summary: 'Kurze Mobility-Arbeit, damit Volumen und Bewegungsqualität im Defizit nicht leiden.',
        sets: 2,
        reps: 30,
        setsLabel: '2-3 Holds',
        repsLabel: '20-40 s',
        focusLabel: 'Beweglich',
        chips: ['locker', 'effizient', 'gelenkschonend'],
        noteLine: 'Mobility-Range: 2-3 Holds a 20-40 s',
    },
    endurance: {
        title: 'Laufbereit',
        summary: 'Mobilität mit Fokus auf Rhythmus, Range und entspannte Spannung.',
        sets: 2,
        reps: 30,
        setsLabel: '2-3 Holds',
        repsLabel: '20-40 s',
        focusLabel: 'Bewegungsradius',
        chips: ['locker', 'rhythmus', 'vorbereitung'],
        noteLine: 'Range-Block: 2-3 Holds a 20-40 s',
    },
    general_fitness: {
        title: 'Tägliche Mobilität',
        summary: 'Saubere Standard-Empfehlung für alltagstaugliche Beweglichkeit.',
        sets: 2,
        reps: 30,
        setsLabel: '2-3 Holds',
        repsLabel: '20-45 s',
        focusLabel: 'Standard',
        chips: ['alltag', 'locker', 'solide'],
        noteLine: 'Standard-Mobility: 2-3 Holds a 20-45 s',
    },
}

export function mapManualGoalToGoalType(value?: string | null): GoalType {
    const normalized = String(value ?? '').trim().toLowerCase()
    if (normalized.includes('kraft')) return 'strength'
    if (normalized.includes('abnehm')) return 'fat_loss'
    if (normalized.includes('ausdauer')) return 'endurance'
    if (normalized.includes('gesund') || normalized.includes('reha') || normalized.includes('schmerz')) return 'health'
    return 'muscle_gain'
}

function inferArchetype({ trainingType, exerciseName, exercise }: PrescriptionContext): PrescriptionArchetype {
    if (trainingType === 'ausdauer') return 'cardio'
    if (trainingType === 'dehnung') return 'mobility'
    if (exercise?.kind === 'cardio') return 'cardio'
    if (exercise?.kind === 'mobility') return 'mobility'
    if (exercise?.movementPattern && MOVEMENT_CORE.has(exercise.movementPattern)) return 'core'
    if (trainingType === 'calisthenics') {
        if (exercise?.movementPattern === 'core') return 'core'
        if (exercise?.movementPattern && MOVEMENT_COMPOUNDS.has(exercise.movementPattern)) return 'calisthenics_skill'
        const name = String(exerciseName ?? exercise?.name ?? '').toLowerCase()
        if (name.includes('handstand') || name.includes('muscle-up') || name.includes('pistol')) return 'calisthenics_skill'
        return 'calisthenics_volume'
    }
    if (exercise?.movementPattern && MOVEMENT_COMPOUNDS.has(exercise.movementPattern)) return 'compound'
    if (exercise?.movementPattern && MOVEMENT_ISOLATIONS.has(exercise.movementPattern)) return 'isolation'
    if (exercise?.movementPattern && MOVEMENT_CORE.has(exercise.movementPattern)) return 'core'

    const fallbackName = String(exerciseName ?? '').toLowerCase()
    if (/(curls|heben|fly|strecker|beuger|pushdown|extension|raise)/.test(fallbackName)) return 'isolation'
    if (/(plank|hold|sit-up|crunch|hollow|dragon flag|toes to bar)/.test(fallbackName)) return 'core'
    return 'compound'
}

function scaleForLevel(value: number, level?: TrainingLevel, opts?: { beginner?: number; advanced?: number }) {
    if (level === 'beginner') return value + (opts?.beginner ?? 0)
    if (level === 'advanced') return value + (opts?.advanced ?? 0)
    return value
}

function joinRecommendation(parts: string[]) {
    return parts.filter(Boolean).join(' | ')
}

function capitalizeChip(chip: string) {
    const value = String(chip ?? '').trim()
    if (!value) return value
    return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatChips(chips: string[]) {
    return chips.map(capitalizeChip)
}

export function getTrainingPrescriptionHint(context: PrescriptionContext): TrainingPrescriptionHint {
    const archetype = inferArchetype(context)
    const goalType = context.goalType

    if (archetype === 'cardio') {
        const cardio = CARDIO_GOAL_COPY[goalType]
        return {
            title: cardio.title,
            summary: cardio.summary,
            focusLabel: cardio.focusLabel,
            chips: formatChips(cardio.chips),
            setsLabel: cardio.durationLabel,
            repsLabel: 'Distanz optional',
            restLabel: cardio.restLabel,
            recommendationLabel: joinRecommendation([cardio.durationLabel, cardio.restLabel]),
            noteLine: cardio.noteLine,
            exact: {
                durationMin: cardio.duration,
                distanceKm: null,
                restSeconds: 0,
            },
        }
    }

    if (archetype === 'mobility') {
        const mobility = MOBILITY_GOAL_COPY[goalType]
        return {
            title: mobility.title,
            summary: mobility.summary,
            focusLabel: mobility.focusLabel,
            chips: formatChips(mobility.chips),
            setsLabel: mobility.setsLabel,
            repsLabel: mobility.repsLabel,
            restLabel: '20-30 s locker',
            recommendationLabel: joinRecommendation([mobility.setsLabel, mobility.repsLabel, '20-30 s Pause']),
            noteLine: mobility.noteLine,
            exact: {
                sets: mobility.sets,
                reps: mobility.reps,
                restSeconds: 20,
            },
        }
    }

    const heavyBias = archetype === 'compound' || archetype === 'calisthenics_skill'
    const accessoryBias = archetype === 'isolation' || archetype === 'calisthenics_volume'
    const coreBias = archetype === 'core'

    if (goalType === 'strength') {
        const sets = heavyBias ? scaleForLevel(4, context.level, { beginner: -1, advanced: 1 }) : 3
        const reps = heavyBias ? scaleForLevel(5, context.level, { beginner: 1 }) : 7
        const restSeconds = heavyBias ? 150 : 90
        const setsLabel = heavyBias ? '4-5 Sätze' : '3-4 Sätze'
        const repsLabel = heavyBias ? '4-6 Wdh' : coreBias ? '6-10 Wdh' : '6-8 Wdh'
        return {
            title: heavyBias ? 'Kraft-Protokoll' : 'Kraft-Zusatz',
            summary: heavyBias
                ? 'Niedrigere Wiederholungen, längere Pausen und genug Qualität pro Satz für echte Kraftleistung.'
                : 'Accessory-Arbeit im kraftnahen Bereich, damit du Druck aufbaust ohne Volumen zu verschenken.',
            focusLabel: heavyBias ? 'Kraftfokus' : 'Kraftunterstützend',
            chips: formatChips(heavyBias ? ['schwer', 'explosiv', 'lange Pause'] : ['kontrolliert', 'sauber', 'kraftnah']),
            setsLabel,
            repsLabel,
            restLabel: heavyBias ? '120-180 s Pause' : '75-105 s Pause',
            recommendationLabel: joinRecommendation([setsLabel, repsLabel, heavyBias ? '120-180 s Pause' : '75-105 s Pause']),
            noteLine: heavyBias
                ? 'Kraftbereich: 4-5 Sätze im Bereich 4-6 Wdh'
                : 'Kraftnahes Accessory: 3-4 Sätze im Bereich 6-8 Wdh',
            exact: {
                sets,
                reps,
                restSeconds,
            },
        }
    }

    if (goalType === 'fat_loss') {
        const sets = heavyBias ? 3 : 2
        const reps = heavyBias ? 12 : coreBias ? 14 : 15
        const restSeconds = heavyBias ? 60 : 45
        const setsLabel = heavyBias ? '2-4 Sätze' : '2-3 Sätze'
        const repsLabel = heavyBias ? '10-15 Wdh' : coreBias ? '12-18 Wdh' : '12-18 Wdh'
        return {
            title: 'Dichter Output',
            summary: 'Dichter Arbeitsbereich für viel Output, gute Technik und kontrollierte Ermüdung.',
            focusLabel: 'Dichte',
            chips: formatChips(['kurze Pause', 'sauber', 'metabolisch']),
            setsLabel,
            repsLabel,
            restLabel: heavyBias ? '45-75 s Pause' : '30-60 s Pause',
            recommendationLabel: joinRecommendation([setsLabel, repsLabel, heavyBias ? '45-75 s Pause' : '30-60 s Pause']),
            noteLine: 'Dichter Volumenbereich mit kurzen Pausen für hohen Output',
            exact: {
                sets,
                reps,
                restSeconds,
            },
        }
    }

    if (goalType === 'health') {
        const sets = coreBias ? 2 : 3
        const reps = coreBias ? 12 : accessoryBias ? 14 : 10
        const restSeconds = 60
        return {
            title: 'Gelenkschonender Bereich',
            summary: 'Saubere, kontrollierte Wiederholungen mit Reserve im Tank und Fokus auf Bewegungsqualität.',
            focusLabel: 'Kontrolle',
            chips: formatChips(['gelenkfreundlich', 'kontrolliert', 'technik']),
            setsLabel: coreBias ? '2-3 Sätze' : '2-4 Sätze',
            repsLabel: coreBias ? '10-15 Wdh' : accessoryBias ? '12-15 Wdh' : '8-12 Wdh',
            restLabel: '45-75 s Pause',
            recommendationLabel: joinRecommendation([coreBias ? '2-3 Sätze' : '2-4 Sätze', coreBias ? '10-15 Wdh' : accessoryBias ? '12-15 Wdh' : '8-12 Wdh', '45-75 s Pause']),
            noteLine: 'Kontrollierter Gesundheitsbereich mit sauberer Technik und Reserve',
            exact: {
                sets,
                reps,
                restSeconds,
            },
        }
    }

    if (goalType === 'endurance') {
        const sets = heavyBias ? 3 : 2
        const reps = heavyBias ? 15 : 18
        const restSeconds = 45
        return {
            title: 'Belastbarkeits-Bereich',
            summary: 'Hoher Wiederholungsbereich für lokale Ausdauer, Rhythmus und wiederholbare Leistung.',
            focusLabel: 'Belastbarkeit',
            chips: formatChips(['rhythmus', 'locker', 'durchziehen']),
            setsLabel: heavyBias ? '2-4 Sätze' : '2-3 Sätze',
            repsLabel: heavyBias ? '12-18 Wdh' : '15-20 Wdh',
            restLabel: '30-60 s Pause',
            recommendationLabel: joinRecommendation([heavyBias ? '2-4 Sätze' : '2-3 Sätze', heavyBias ? '12-18 Wdh' : '15-20 Wdh', '30-60 s Pause']),
            noteLine: 'Kapazitätsbereich für wiederholbare Leistung und sauberen Rhythmus',
            exact: {
                sets,
                reps,
                restSeconds,
            },
        }
    }

    const sets = heavyBias ? scaleForLevel(4, context.level, { beginner: -1 }) : coreBias ? 3 : 3
    const reps = heavyBias ? 8 : coreBias ? 12 : 12
    const restSeconds = heavyBias ? 90 : 60
    const setsLabel = '3-4 Sätze'
    const repsLabel = heavyBias ? '6-10 Wdh' : coreBias ? '10-15 Wdh' : '10-15 Wdh'
    return {
        title: heavyBias ? 'Muskelaufbau-Protokoll' : 'Volumen-Aufbau',
        summary: heavyBias
            ? 'Empfohlener Bereich für saubere Ausführung, progressive Steigerung und kontrollierten Muskelaufbau.'
            : 'Empfohlener Volumenbereich für mehr lokale Spannung und Muskelaufbau ohne unnötige Leersätze.',
        focusLabel: heavyBias ? 'Muskelaufbau' : 'Pump-Bereich',
        chips: formatChips(heavyBias ? ['spannung', 'progressiv', 'solide Pause'] : ['pump', 'kontrolle', 'dicht']),
        setsLabel,
        repsLabel,
        restLabel: heavyBias ? '75-120 s Pause' : '45-75 s Pause',
        recommendationLabel: joinRecommendation([setsLabel, repsLabel, heavyBias ? '75-120 s Pause' : '45-75 s Pause']),
        noteLine: heavyBias
            ? 'Muskelaufbau-Range: 3-4 Sätze im Bereich 6-10 Wdh'
            : 'Volumen-Range: 3-4 Sätze im Bereich 10-15 Wdh',
        exact: {
            sets,
            reps,
            restSeconds,
        },
    }
}
