import type {
    ComplaintType,
    GeneratedExercise,
    GeneratedPlan,
    GeneratedWorkoutDay,
    GeneratorInput,
    GoalType,
    SplitType,
    TrainingLevel,
} from '@/types/autoPlan'
import {
    exerciseMatchesReference,
    getExerciseCatalog,
    type ExerciseMetadata,
    type MovementPattern,
} from '@/services/training/exerciseLibrary'

type DayFocus = 'full_body' | 'upper' | 'lower' | 'push' | 'pull' | 'legs'
type SlotName =
    | 'knee_dominant'
    | 'hip_dominant'
    | 'horizontal_push'
    | 'horizontal_pull'
    | 'vertical_push'
    | 'vertical_pull'
    | 'core'
    | 'accessory'
    | 'cardio'
    | 'mobility'

type ScoredCandidate = {
    exercise: ExerciseMetadata
    score: number
    complaintReasons: string[]
}

type GenerationContext = {
    globalSelectedNames: Record<string, number>
    globalSelectedMuscles: Record<string, number>
    avoidExerciseNames?: Set<string>
    variantSeed?: number
}

const GOAL_LABELS: Record<GoalType, string> = {
    muscle_gain: 'Muskelaufbau',
    strength: 'Kraftaufbau',
    fat_loss: 'Fettverlust',
    general_fitness: 'Allgemeine Fitness',
    endurance: 'Ausdauer',
    health: 'Gesundheit/Schmerzreduktion',
}

const COMPLAINT_LABELS: Partial<Record<ComplaintType, string>> = {
    knie: 'Knie',
    schulter: 'Schulter',
    ruecken: 'Rücken',
    ellbogen: 'Ellbogen',
    handgelenk: 'Handgelenk',
    huefte: 'Hüfte',
    nacken: 'Nacken',
    sprunggelenk: 'Sprunggelenk',
}

function clampInt(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(v)))
}

function hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash)
}

function isGenerationContext(value: GenerationContext | Record<string, number>): value is GenerationContext {
    return 'globalSelectedNames' in value && 'globalSelectedMuscles' in value
}

function normalizeInput(input: GeneratorInput): GeneratorInput {
    return {
        ...input,
        weeklyFrequency: clampInt(input.weeklyFrequency || 3, 1, 7),
        sessionDurationMin: clampInt(input.sessionDurationMin || 45, 20, 120),
        secondaryGoals: (input.secondaryGoals ?? []).slice(0, 2),
        activeComplaints: [...new Set(input.activeComplaints ?? [])],
        preferences: input.preferences ? {
            ...input.preferences,
            machineFocusWeight: clampInt(Number(input.preferences.machineFocusWeight) || 0, 0, 100),
            freeWeightFocusWeight: clampInt(Number(input.preferences.freeWeightFocusWeight) || 0, 0, 100),
            jointFriendlyWeight: clampInt(Number(input.preferences.jointFriendlyWeight) || 0, 0, 100),
            preferredExerciseRefs: (input.preferences.preferredExerciseRefs ?? []).filter((x) => x?.canonicalName || x?.exerciseId),
        } : undefined,
        exclusions: {
            exerciseNames: (input.exclusions?.exerciseNames ?? []).map((x) => String(x).trim()).filter(Boolean),
            muscleGroups: (input.exclusions?.muscleGroups ?? []).map((x) => String(x).trim()).filter(Boolean),
            exclusionTypes: [...new Set(input.exclusions?.exclusionTypes ?? [])],
            exerciseRefs: (input.exclusions?.exerciseRefs ?? []).filter((x) => x?.canonicalName || x?.exerciseId),
        },
    }
}

function resolveSplitType(input: GeneratorInput): { splitType: SplitType; dayFocuses: DayFocus[] } {
    const pref = input.preferences?.splitPreference ?? 'auto'
    const f = input.weeklyFrequency
    if (pref === 'full_body') return { splitType: 'full_body', dayFocuses: Array.from({ length: f }, () => 'full_body') }
    if (pref === 'upper_lower') return { splitType: 'upper_lower', dayFocuses: Array.from({ length: f }, (_, i) => i % 2 === 0 ? 'upper' : 'lower') }
    if (pref === 'ppl' && f >= 3) {
        const cycle: DayFocus[] = ['push', 'pull', 'legs']
        return { splitType: 'ppl', dayFocuses: Array.from({ length: f }, (_, i) => cycle[i % cycle.length]) }
    }
    if (f <= 2) return { splitType: 'full_body', dayFocuses: Array.from({ length: f }, () => 'full_body') }
    if (f === 3) return { splitType: 'full_body', dayFocuses: ['full_body', 'full_body', 'full_body'] }
    if (f === 4) return { splitType: 'upper_lower', dayFocuses: ['upper', 'lower', 'upper', 'lower'] }
    const cycle: DayFocus[] = ['push', 'pull', 'legs', 'upper', 'lower']
    return { splitType: 'ppl', dayFocuses: Array.from({ length: f }, (_, i) => cycle[i % cycle.length]) }
}

function resolveSlotsForFocus(focus: DayFocus, includeCardio: boolean): SlotName[] {
    if (focus === 'upper') return ['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'accessory', 'core']
    if (focus === 'lower') return ['knee_dominant', 'hip_dominant', 'accessory', 'core', includeCardio ? 'cardio' : 'mobility']
    if (focus === 'push') return ['horizontal_push', 'vertical_push', 'accessory', 'core', includeCardio ? 'cardio' : 'mobility']
    if (focus === 'pull') return ['horizontal_pull', 'vertical_pull', 'hip_dominant', 'accessory', 'core']
    if (focus === 'legs') return ['knee_dominant', 'hip_dominant', 'accessory', 'core', includeCardio ? 'cardio' : 'mobility']
    return ['knee_dominant', 'hip_dominant', 'horizontal_push', 'horizontal_pull', 'core', includeCardio ? 'cardio' : 'mobility']
}

function equipmentAllowed(ex: ExerciseMetadata, input: GeneratorInput): boolean {
    const eq = input.equipmentProfile
    if (eq.bodyweightOnly) return ex.equipment.length === 1 && ex.equipment[0] === 'bodyweight'
    if (eq.dumbbellsOnly) return ex.equipment.every((x) => x === 'dumbbell' || x === 'bodyweight')
    if (ex.equipment.includes('machine') && !eq.machinesAvailable && !eq.fullGym) return false
    if (ex.equipment.includes('cable') && !eq.cablesAvailable && !eq.fullGym) return false
    if (ex.equipment.includes('barbell') && !eq.barbellAvailable && !eq.fullGym) return false
    if (ex.equipment.includes('cardio_machine') && !eq.cardioMachinesAvailable && !eq.fullGym) return false
    return true
}

function isShoulderIsolation(ex: ExerciseMetadata): boolean {
    return ex.movementPattern === 'isolation' && ex.muscleGroup === 'Schultern'
}

function matchesSlot(ex: ExerciseMetadata, slot: SlotName): boolean {
    if (slot === 'knee_dominant') return ex.movementPattern === 'squat' || ex.movementPattern === 'lunge'
    if (slot === 'hip_dominant') return ex.movementPattern === 'hinge'
    if (slot === 'horizontal_push') return ex.movementPattern === 'horizontal_push'
    if (slot === 'horizontal_pull') return ex.movementPattern === 'horizontal_pull'
    if (slot === 'vertical_push') return ex.movementPattern === 'vertical_push' || isShoulderIsolation(ex)
    if (slot === 'vertical_pull') return ex.movementPattern === 'vertical_pull'
    if (slot === 'core') return ex.movementPattern === 'core'
    if (slot === 'cardio') return ex.kind === 'cardio'
    if (slot === 'mobility') return ex.kind === 'mobility'
    return ex.movementPattern === 'isolation'
}

function isHardExcluded(ex: ExerciseMetadata, input: GeneratorInput): boolean {
    const exclusionTypes = new Set(input.exclusions?.exclusionTypes ?? [])
    if (exclusionTypes.has('no_jumping') && ex.impact === 'high') return true
    if (exclusionTypes.has('no_overhead') && ex.overhead) return true
    if (exclusionTypes.has('no_deep_knee_flexion') && ex.deepKneeFlexion) return true
    if (exclusionTypes.has('no_high_axial_load') && ex.axialLoad === 'high') return true
    if (exclusionTypes.has('no_rotation') && ex.rotation) return true
    if (exclusionTypes.has('no_unstable') && ex.stability === 'unstable') return true
    if ((input.exclusions?.exerciseRefs ?? []).some((ref) => exerciseMatchesReference(ex, ref))) return true
    if ((input.exclusions?.exerciseNames ?? []).some((x) => x.toLowerCase() === ex.name.toLowerCase())) return true
    if ((input.exclusions?.muscleGroups ?? []).some((x) => x.toLowerCase() === ex.muscleGroup.toLowerCase())) return true
    return false
}

function complaintPenalty(ex: ExerciseMetadata, complaints: ComplaintType[]): { penalty: number; reasons: string[] } {
    let penalty = 0
    const reasons: string[] = []
    const addReason = (label: string, reason: string) => reasons.push(`${label}: ${reason}`)

    for (const c of complaints) {
        const load = ex.jointLoad[c]
        const label = COMPLAINT_LABELS[c] ?? c
        if (load === 'high') { penalty += 22; addReason(label, 'hohe lokale Belastung') }
        else if (load === 'medium') { penalty += 8; addReason(label, 'mittlere lokale Belastung') }

        if (c === 'schulter' && ex.overhead) { penalty += 15; addReason(label, 'Überkopf reduziert') }
        if (c === 'knie' && ex.deepKneeFlexion) { penalty += 12; addReason(label, 'tiefe Kniebeugung reduziert') }
        if (c === 'ruecken' && ex.axialLoad === 'high') { penalty += 18; addReason(label, 'hohe axiale Last reduziert') }
        if ((c === 'sprunggelenk' || c === 'knie') && ex.impact === 'high') { penalty += 20; addReason(label, 'Sprung/Impact reduziert') }
        if ((c === 'ellbogen' || c === 'handgelenk') && ex.movementPattern === 'isolation') {
            penalty += 7
            addReason(label, 'grifflastige Isolation reduziert')
        }
    }

    return { penalty, reasons: [...new Set(reasons)] }
}

function scoreCandidate(
    ex: ExerciseMetadata,
    input: GeneratorInput,
    slot: SlotName,
    selectedNames: Set<string>,
    selectedMuscles: Record<string, number>,
    contextOrGlobalNames: GenerationContext | Record<string, number>,
    maybeGlobalMuscles?: Record<string, number>,
): ScoredCandidate {
    let score = 40
    const complaint = complaintPenalty(ex, input.activeComplaints ?? [])
    score -= complaint.penalty

    const context: GenerationContext = isGenerationContext(contextOrGlobalNames)
        ? contextOrGlobalNames
        : {
            globalSelectedNames: contextOrGlobalNames,
            globalSelectedMuscles: maybeGlobalMuscles ?? {},
        }

    const globalSelectedNames = context.globalSelectedNames
    const globalSelectedMuscles = context.globalSelectedMuscles
    if (selectedNames.has(ex.name)) score -= 40
    score -= (selectedMuscles[ex.muscleGroup] ?? 0) * 5
    score -= (globalSelectedNames[ex.name] ?? 0) * 14
    score -= (globalSelectedMuscles[ex.muscleGroup] ?? 0) * 3
    if (context.avoidExerciseNames?.has(ex.name)) score -= 18
    if (ex.goalTags.includes(input.primaryGoal)) score += 20
    for (const g of input.secondaryGoals ?? []) if (ex.goalTags.includes(g)) score += 6
    if (input.level === ex.level) score += 8
    if (input.level === 'beginner' && ex.level !== 'beginner') score -= 10

    if (slot === 'cardio' && input.preferences?.noCardio) score -= 60
    if (slot === 'cardio' && input.primaryGoal === 'endurance') score += 25
    if (slot === 'mobility' && input.primaryGoal === 'health') score += 20

    if (input.preferences?.machineFocus) {
        const weight = (input.preferences.machineFocusWeight ?? 50) / 100
        if (ex.equipment.includes('machine') || ex.equipment.includes('cable')) score += 4 + weight * 12
        if (ex.equipment.includes('barbell')) score -= 2 + weight * 6
    }
    if (input.preferences?.freeWeightFocus) {
        const weight = (input.preferences.freeWeightFocusWeight ?? 50) / 100
        if (ex.equipment.includes('barbell') || ex.equipment.includes('dumbbell') || ex.equipment.includes('bodyweight')) score += 3 + weight * 10
        if (ex.equipment.includes('machine')) score -= 2 + weight * 5
    }
    if (input.preferences?.jointFriendly) {
        const weight = (input.preferences.jointFriendlyWeight ?? 50) / 100
        if (ex.stability === 'stable') score += 2 + weight * 8
        if (ex.axialLoad === 'high') score -= 3 + weight * 9
        if (ex.impact === 'high') score -= 4 + weight * 10
        if (ex.goalTags.includes('health')) score += 2 + weight * 8
    }

    const focusGroups = new Set((input.preferences?.focusMuscleGroups ?? []).map((x) => x.toLowerCase()))
    if (focusGroups.has(ex.muscleGroup.toLowerCase())) score += 12

    for (const ref of input.preferences?.preferredExerciseRefs ?? []) {
        if (exerciseMatchesReference(ex, ref)) score += 16
        else if (ref.source === 'custom' && ref.muscleGroup?.toLowerCase() === ex.muscleGroup.toLowerCase()) score += 7
    }
    for (const ref of input.exclusions?.exerciseRefs ?? []) {
        if (ref.source === 'custom' && ref.muscleGroup?.toLowerCase() === ex.muscleGroup.toLowerCase()) score -= 8
    }
    if ((input.preferences?.preferredExercises ?? []).some((x) => x.toLowerCase() === ex.name.toLowerCase())) score += 16
    if (typeof context.variantSeed === 'number') {
        score += (hashString(`${context.variantSeed}:${slot}:${ex.id}`) % 7) - 3
    }

    return { exercise: ex, score, complaintReasons: complaint.reasons }
}

function resolveExerciseTargetCount(input: GeneratorInput): number {
    let count = 5
    if (input.sessionDurationMin >= 40) count = 6
    if (input.sessionDurationMin >= 55) count = 7
    if (input.sessionDurationMin >= 75) count = 8
    if (input.level === 'beginner') count = Math.min(count, 7)
    if (input.preferences?.shortSessions) count = Math.max(3, count - 1)
    if (input.primaryGoal === 'health') count = Math.min(count, 7)
    return count
}

function resolveTopUpSlots(_focus: DayFocus, includeCardio: boolean): SlotName[] {
    return ['accessory', 'accessory', 'core', includeCardio ? 'cardio' : 'mobility']
}

function buildPrescription(ex: ExerciseMetadata, input: GeneratorInput, slot: SlotName): Omit<GeneratedExercise, 'exerciseId' | 'exerciseName' | 'muscleGroup' | 'movementPattern' | 'category'> {
    if (ex.kind === 'mobility' || slot === 'mobility') return { sets: 2, reps: 30, restSeconds: 20, rir: 4, rpe: 5 }

    if (ex.kind === 'cardio' || slot === 'cardio') {
        const steady = input.preferences?.noHiit || input.primaryGoal === 'health'
        const duration = steady ? clampInt(input.sessionDurationMin * 0.3, 12, 30) : clampInt(input.sessionDurationMin * 0.22, 10, 22)
        return {
            durationMin: duration,
            restSeconds: 0,
            rpe: steady ? 6 : 8,
            notes: steady ? 'steady pace' : 'intervallnah, aber kontrolliert',
        }
    }

    if (input.primaryGoal === 'strength') return ex.movementPattern === 'isolation'
        ? { sets: 3, reps: 6, restSeconds: 120, rir: 2, rpe: 8 }
        : { sets: 4, reps: 5, restSeconds: 150, rir: 2, rpe: 8 }
    if (input.primaryGoal === 'muscle_gain') return ex.movementPattern === 'isolation'
        ? { sets: 3, reps: 12, restSeconds: 60, rir: 2, rpe: 8 }
        : { sets: 3, reps: 8, restSeconds: 90, rir: 2, rpe: 7 }
    if (input.primaryGoal === 'fat_loss') return ex.movementPattern === 'isolation'
        ? { sets: 2, reps: 15, restSeconds: 45, rir: 3, rpe: 7 }
        : { sets: 3, reps: 10, restSeconds: 60, rir: 3, rpe: 7 }
    if (input.primaryGoal === 'health') return { sets: 2, reps: ex.movementPattern === 'isolation' ? 15 : 10, restSeconds: 60, rir: 4, rpe: 6 }
    if (input.primaryGoal === 'endurance' && ex.kind === 'strength') return { sets: 2, reps: 15, restSeconds: 45, rir: 3, rpe: 6 }
    return { sets: 3, reps: 10, restSeconds: 75, rir: 3, rpe: 7 }
}

function categoryForExercise(ex: ExerciseMetadata): 0 | 1 | 2 | 3 {
    if (ex.kind === 'cardio') return 3
    if (ex.kind === 'mobility') return 2
    if (ex.equipment.length === 1 && ex.equipment[0] === 'bodyweight') return 1
    return 0
}

function pickCandidate(
    slot: SlotName,
    pool: ExerciseMetadata[],
    input: GeneratorInput,
    selectedNames: Set<string>,
    selectedMuscles: Record<string, number>,
    contextOrGlobalNames: GenerationContext | Record<string, number>,
    maybeGlobalMusclesOrAllowRisk?: Record<string, number> | boolean,
    maybeAllowHighComplaintRisk?: boolean,
    allowHighComplaintRisk?: boolean,
): ScoredCandidate | null {
    const context: GenerationContext = isGenerationContext(contextOrGlobalNames)
        ? contextOrGlobalNames
        : {
            globalSelectedNames: contextOrGlobalNames,
            globalSelectedMuscles: typeof maybeGlobalMusclesOrAllowRisk === 'object' ? maybeGlobalMusclesOrAllowRisk : {},
        }

    const finalAllowHighComplaintRisk = typeof maybeGlobalMusclesOrAllowRisk === 'boolean'
        ? maybeGlobalMusclesOrAllowRisk
        : (maybeAllowHighComplaintRisk ?? allowHighComplaintRisk)

    let candidates = pool.filter((x) => matchesSlot(x, slot))
    if (!finalAllowHighComplaintRisk) candidates = candidates.filter((x) => complaintPenalty(x, input.activeComplaints ?? []).penalty < 30)
    const scored = candidates
        .map((x) => scoreCandidate(x, input, slot, selectedNames, selectedMuscles, context))
        .sort((a, b) => b.score - a.score)
    return scored.find((x) => x.score > -20) ?? scored[0] ?? null
}

function estimateDuration(exercises: GeneratedExercise[]): number {
    let total = 0
    for (const ex of exercises) {
        if (typeof ex.durationMin === 'number' && ex.durationMin > 0) {
            total += ex.durationMin
            continue
        }
        const sets = Math.max(1, Number(ex.sets ?? 0))
        const rest = Math.max(20, Number(ex.restSeconds ?? 60))
        total += sets * 1.2 + (sets - 1) * (rest / 60)
    }
    return Math.max(15, Math.round(total))
}

function resolveDifficulty(level: TrainingLevel): 'low' | 'moderate' | 'high' {
    if (level === 'beginner') return 'low'
    if (level === 'advanced') return 'high'
    return 'moderate'
}

function generateWorkoutDay(
    input: GeneratorInput,
    focus: DayFocus,
    dayIndex: number,
    basePool: ExerciseMetadata[],
    targetPerSession: number,
    includeCardio: boolean,
    complaintAdaptationSummary: string[],
    context: GenerationContext,
): GeneratedWorkoutDay {
    const slots = resolveSlotsForFocus(focus, includeCardio)
    const selected: GeneratedExercise[] = []
    const selectedNames = new Set<string>()
    const selectedMuscles: Record<string, number> = {}

    for (const slot of slots) {
        if (selected.length >= targetPerSession) break
        const picked = pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, context, false)
        const fallback = picked ?? pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, context, true)
        if (!fallback) continue

        selectedNames.add(fallback.exercise.name)
        selectedMuscles[fallback.exercise.muscleGroup] = (selectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1
        context.globalSelectedNames[fallback.exercise.name] = (context.globalSelectedNames[fallback.exercise.name] ?? 0) + 1
        context.globalSelectedMuscles[fallback.exercise.muscleGroup] = (context.globalSelectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1

        const rx = buildPrescription(fallback.exercise, input, slot)
        const notes: string[] = []
        if (rx.notes) notes.push(rx.notes)
        if (fallback.complaintReasons.length) {
            notes.push(`angepasst wegen ${fallback.complaintReasons.join(', ')}`)
            complaintAdaptationSummary.push(`${fallback.exercise.name}: ${fallback.complaintReasons.join(', ')}`)
        }

        selected.push({
            exerciseId: fallback.exercise.id,
            exerciseName: fallback.exercise.name,
            muscleGroup: fallback.exercise.muscleGroup,
            movementPattern: fallback.exercise.movementPattern as MovementPattern,
            category: categoryForExercise(fallback.exercise),
            sets: rx.sets,
            reps: rx.reps,
            durationMin: rx.durationMin,
            distanceKm: rx.distanceKm,
            restSeconds: rx.restSeconds,
            rir: rx.rir,
            rpe: rx.rpe,
            notes: notes.length ? notes.join(' | ') : undefined,
            substitutions: fallback.exercise.substitutions.slice(0, 2),
            complaintAdjustmentReason: fallback.complaintReasons[0],
        })
    }

    if (selected.length < targetPerSession) {
        for (const slot of resolveTopUpSlots(focus, includeCardio)) {
            if (selected.length >= targetPerSession) break
            const picked = pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, context, false)
            const fallback = picked ?? pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, context, true)
            if (!fallback) continue

            selectedNames.add(fallback.exercise.name)
            selectedMuscles[fallback.exercise.muscleGroup] = (selectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1
            context.globalSelectedNames[fallback.exercise.name] = (context.globalSelectedNames[fallback.exercise.name] ?? 0) + 1
            context.globalSelectedMuscles[fallback.exercise.muscleGroup] = (context.globalSelectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1

            const rx = buildPrescription(fallback.exercise, input, slot)
            const notes: string[] = []
            if (rx.notes) notes.push(rx.notes)
            if (fallback.complaintReasons.length) {
                notes.push(`angepasst wegen ${fallback.complaintReasons.join(', ')}`)
                complaintAdaptationSummary.push(`${fallback.exercise.name}: ${fallback.complaintReasons.join(', ')}`)
            }

            selected.push({
                exerciseId: fallback.exercise.id,
                exerciseName: fallback.exercise.name,
                muscleGroup: fallback.exercise.muscleGroup,
                movementPattern: fallback.exercise.movementPattern as MovementPattern,
                category: categoryForExercise(fallback.exercise),
                sets: rx.sets,
                reps: rx.reps,
                durationMin: rx.durationMin,
                distanceKm: rx.distanceKm,
                restSeconds: rx.restSeconds,
                rir: rx.rir,
                rpe: rx.rpe,
                notes: notes.length ? notes.join(' | ') : undefined,
                substitutions: fallback.exercise.substitutions.slice(0, 2),
                complaintAdjustmentReason: fallback.complaintReasons[0],
            })
        }
    }

    if (selected.length < 3) {
        const fallbackBasics = basePool
            .filter((x) => x.kind !== 'cardio')
            .sort((a, b) => complaintPenalty(a, input.activeComplaints ?? []).penalty - complaintPenalty(b, input.activeComplaints ?? []).penalty)
        for (const x of fallbackBasics) {
            if (selected.length >= 3) break
            if (selectedNames.has(x.name)) continue
            selected.push({
                exerciseId: x.id,
                exerciseName: x.name,
                muscleGroup: x.muscleGroup,
                movementPattern: x.movementPattern as MovementPattern,
                category: categoryForExercise(x),
                sets: 2,
                reps: 10,
                restSeconds: 60,
                rir: 4,
                notes: 'Fallback-Auswahl: eingeschränkte Übungspalette durch Regeln/Beschwerden',
                substitutions: x.substitutions.slice(0, 2),
            })
            selectedNames.add(x.name)
            context.globalSelectedNames[x.name] = (context.globalSelectedNames[x.name] ?? 0) + 1
            context.globalSelectedMuscles[x.muscleGroup] = (context.globalSelectedMuscles[x.muscleGroup] ?? 0) + 1
        }
    }

    return {
        dayIndex,
        dayName: `Tag ${dayIndex}`,
        focus,
        estimatedDuration: estimateDuration(selected),
        exercises: selected,
    }
}

export function regenerateAutoPlanDay(
    rawInput: GeneratorInput,
    options: {
        focus: GeneratedWorkoutDay['focus']
        dayIndex: number
        avoidExerciseNames?: string[]
        existingDays?: Array<{
            exercises: Array<{ exerciseName: string; muscleGroup?: string }>
        }>
        variantSeed?: number
    },
): GeneratedWorkoutDay {
    const input = normalizeInput(rawInput)
    const includeCardio = !(input.preferences?.noCardio)
    const targetPerSession = resolveExerciseTargetCount(input)

    const basePool = getExerciseCatalog()
        .filter((x) => equipmentAllowed(x, input))
        .filter((x) => !isHardExcluded(x, input))

    const complaintAdaptationSummary: string[] = []
    const context: GenerationContext = {
        globalSelectedNames: {},
        globalSelectedMuscles: {},
        avoidExerciseNames: new Set((options.avoidExerciseNames ?? []).map((x) => x.trim()).filter(Boolean)),
        variantSeed: options.variantSeed,
    }

    for (const day of options.existingDays ?? []) {
        for (const exercise of day.exercises ?? []) {
            const name = String(exercise.exerciseName ?? '').trim()
            if (name) context.globalSelectedNames[name] = (context.globalSelectedNames[name] ?? 0) + 1

            const muscleGroup = String(exercise.muscleGroup ?? '').trim()
            if (muscleGroup) context.globalSelectedMuscles[muscleGroup] = (context.globalSelectedMuscles[muscleGroup] ?? 0) + 1
        }
    }

    return generateWorkoutDay(
        input,
        options.focus as DayFocus,
        options.dayIndex,
        basePool,
        targetPerSession,
        includeCardio,
        complaintAdaptationSummary,
        context,
    )
}

export function generateAutoPlan(rawInput: GeneratorInput): GeneratedPlan {
    const input = normalizeInput(rawInput)
    const { splitType, dayFocuses } = resolveSplitType(input)
    const includeCardio = !(input.preferences?.noCardio)
    const targetPerSession = resolveExerciseTargetCount(input)

    const basePool = getExerciseCatalog()
        .filter((x) => equipmentAllowed(x, input))
        .filter((x) => !isHardExcluded(x, input))

    const days: GeneratedWorkoutDay[] = []
    const complaintAdaptationSummary: string[] = []
    const globalSelectedNames: Record<string, number> = {}
    const globalSelectedMuscles: Record<string, number> = {}
    const rationale: string[] = [
        `Split anhand Frequenz (${input.weeklyFrequency}/Woche): ${splitType}`,
        `Volumen nach Ziel ${GOAL_LABELS[input.primaryGoal]} und Level ${input.level}`,
    ]

    for (let i = 0; i < dayFocuses.length; i++) {
        days.push(generateWorkoutDay(
            input,
            dayFocuses[i],
            i + 1,
            basePool,
            targetPerSession,
            includeCardio,
            complaintAdaptationSummary,
            {
                globalSelectedNames,
                globalSelectedMuscles,
            },
        ))
        continue

        /* const focus = dayFocuses[i]
        const slots = resolveSlotsForFocus(focus, includeCardio)
        const selected: GeneratedExercise[] = []
        const selectedNames = new Set<string>()
        const selectedMuscles: Record<string, number> = {}

        for (const slot of slots) {
            if (selected.length >= targetPerSession) break
            const picked = pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, globalSelectedNames, globalSelectedMuscles, false)
            const fallback = picked ?? pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, globalSelectedNames, globalSelectedMuscles, true)
            if (!fallback) continue

            selectedNames.add(fallback.exercise.name)
            selectedMuscles[fallback.exercise.muscleGroup] = (selectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1
            globalSelectedNames[fallback.exercise.name] = (globalSelectedNames[fallback.exercise.name] ?? 0) + 1
            globalSelectedMuscles[fallback.exercise.muscleGroup] = (globalSelectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1

            const rx = buildPrescription(fallback.exercise, input, slot)
            const notes: string[] = []
            if (rx.notes) notes.push(rx.notes)
            if (fallback.complaintReasons.length) {
                notes.push(`angepasst wegen ${fallback.complaintReasons.join(', ')}`)
                complaintAdaptationSummary.push(`${fallback.exercise.name}: ${fallback.complaintReasons.join(', ')}`)
            }

            selected.push({
                exerciseId: fallback.exercise.id,
                exerciseName: fallback.exercise.name,
                muscleGroup: fallback.exercise.muscleGroup,
                movementPattern: fallback.exercise.movementPattern as MovementPattern,
                category: categoryForExercise(fallback.exercise),
                sets: rx.sets,
                reps: rx.reps,
                durationMin: rx.durationMin,
                distanceKm: rx.distanceKm,
                restSeconds: rx.restSeconds,
                rir: rx.rir,
                rpe: rx.rpe,
                notes: notes.length ? notes.join(' | ') : undefined,
                substitutions: fallback.exercise.substitutions.slice(0, 2),
                complaintAdjustmentReason: fallback.complaintReasons[0],
            })
        }

        if (selected.length < targetPerSession) {
            for (const slot of resolveTopUpSlots(focus, includeCardio)) {
                if (selected.length >= targetPerSession) break
                const picked = pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, globalSelectedNames, globalSelectedMuscles, false)
                const fallback = picked ?? pickCandidate(slot, basePool, input, selectedNames, selectedMuscles, globalSelectedNames, globalSelectedMuscles, true)
                if (!fallback) continue

                selectedNames.add(fallback.exercise.name)
                selectedMuscles[fallback.exercise.muscleGroup] = (selectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1
                globalSelectedNames[fallback.exercise.name] = (globalSelectedNames[fallback.exercise.name] ?? 0) + 1
                globalSelectedMuscles[fallback.exercise.muscleGroup] = (globalSelectedMuscles[fallback.exercise.muscleGroup] ?? 0) + 1

                const rx = buildPrescription(fallback.exercise, input, slot)
                const notes: string[] = []
                if (rx.notes) notes.push(rx.notes)
                if (fallback.complaintReasons.length) {
                    notes.push(`angepasst wegen ${fallback.complaintReasons.join(', ')}`)
                    complaintAdaptationSummary.push(`${fallback.exercise.name}: ${fallback.complaintReasons.join(', ')}`)
                }

                selected.push({
                    exerciseId: fallback.exercise.id,
                    exerciseName: fallback.exercise.name,
                    muscleGroup: fallback.exercise.muscleGroup,
                    movementPattern: fallback.exercise.movementPattern as MovementPattern,
                    category: categoryForExercise(fallback.exercise),
                    sets: rx.sets,
                    reps: rx.reps,
                    durationMin: rx.durationMin,
                    distanceKm: rx.distanceKm,
                    restSeconds: rx.restSeconds,
                    rir: rx.rir,
                    rpe: rx.rpe,
                    notes: notes.length ? notes.join(' | ') : undefined,
                    substitutions: fallback.exercise.substitutions.slice(0, 2),
                    complaintAdjustmentReason: fallback.complaintReasons[0],
                })
            }
        }

        if (selected.length < 3) {
            const fallbackBasics = basePool
                .filter((x) => x.kind !== 'cardio')
                .sort((a, b) => complaintPenalty(a, input.activeComplaints ?? []).penalty - complaintPenalty(b, input.activeComplaints ?? []).penalty)
            for (const x of fallbackBasics) {
                if (selected.length >= 3) break
                if (selectedNames.has(x.name)) continue
                selected.push({
                    exerciseId: x.id,
                    exerciseName: x.name,
                    muscleGroup: x.muscleGroup,
                    movementPattern: x.movementPattern as MovementPattern,
                    category: categoryForExercise(x),
                    sets: 2,
                    reps: 10,
                    restSeconds: 60,
                    rir: 4,
                    notes: 'Fallback-Auswahl: eingeschränkte Übungspalette durch Regeln/Beschwerden',
                    substitutions: x.substitutions.slice(0, 2),
                })
                selectedNames.add(x.name)
                globalSelectedNames[x.name] = (globalSelectedNames[x.name] ?? 0) + 1
                globalSelectedMuscles[x.muscleGroup] = (globalSelectedMuscles[x.muscleGroup] ?? 0) + 1
            }
        }

        days.push({
            dayIndex: i + 1,
            dayName: `Tag ${i + 1}`,
            focus,
            estimatedDuration: estimateDuration(selected),
            exercises: selected,
        })
        */
    }

    if ((input.activeComplaints ?? []).length) rationale.push(`Beschwerden aktiv: ${(input.activeComplaints ?? []).join(', ')}`)

    return {
        planName: input.planName?.trim() || `Auto-Plan ${GOAL_LABELS[input.primaryGoal]}`,
        primaryGoal: input.primaryGoal,
        secondaryGoals: input.secondaryGoals ?? [],
        level: input.level,
        splitType,
        weeklyFrequency: input.weeklyFrequency,
        sessionDuration: input.sessionDurationMin,
        equipmentProfile: input.equipmentProfile,
        activeComplaints: input.activeComplaints ?? [],
        exclusions: input.exclusions ?? {},
        difficulty: resolveDifficulty(input.level),
        summary: `${GOAL_LABELS[input.primaryGoal]} | ${input.weeklyFrequency}x/Woche | ${input.sessionDurationMin} Min`,
        rationale,
        progressionGuidance: input.level === 'beginner'
            ? 'Wenn alle Sätze technisch sauber sind: +1-2 Wdh oder +2.5% Last pro Woche.'
            : 'Doppelte Progression nutzen und Last erst steigern, wenn Obergrenze der Wdh erreicht ist.',
        deloadHint: 'Alle 5-8 Wochen Deload: Volumen um 35-50% reduzieren.',
        warmupRecommendation: '5-8 Min allgemeines Aufwärmen + 1-2 spezifische Ramp-Up-Sätze der ersten Hauptübung.',
        complaintAdaptationSummary: [...new Set(complaintAdaptationSummary)].slice(0, 12),
        whyThisPlanWasGenerated: [
            `Priorität: ${GOAL_LABELS[input.primaryGoal]}`,
            `Split folgt Frequenz und Präferenz (${input.preferences?.splitPreference ?? 'auto'})`,
            'Beschwerden und No-Gos wurden als Filter plus Scoring in der Übungsauswahl berücksichtigt.',
        ],
        days,
    }
}
