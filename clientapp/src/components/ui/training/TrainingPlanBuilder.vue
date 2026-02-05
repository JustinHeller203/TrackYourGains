<!-- components/ui/training/TrainingPlanBuilder.vue -->
<template>
    <!-- Trainingsplan Formular -->
    <div class="workout-list builder-section" ref="builderSection">
        <h3 class="section-title">Trainingsplan erstellen/bearbeiten</h3>

        <form @submit.prevent="createOrUpdatePlan" class="form-card builder-grid">
            <!-- LEFT: Builder -->
            <div class="builder-left">
                <!-- Kopf: Planname + Typ (Segmented) + Extras rechts -->
                <div class="builder-head">
                    <!-- NEU: Planname mit Überschrift -->
                    <div class="plan-block">
                        <label for="plan-name" class="field-label">Planname</label>
                        <UiTrainingInput id="plan-name"
                                         v-model="planName"
                                         class="plan-name-input slim"
                                         placeholder="Planname (z. B. Push Day)"
                                         required />
                    </div>

                    <!-- Trainingstyp (Desktop: Segmented + Überschrift) -->
                    <div class="type-block desktop-only">
                        <span class="type-heading field-label">Trainingstyp</span>
                        <div class="segmented seg-type">
                            <button type="button" :class="{ on: trainingType==='kraft' }" @click="trainingType='kraft'">Kraft</button>
                            <button type="button" :class="{ on: trainingType==='calisthenics' }" @click="trainingType='calisthenics'">Calisthenics</button>
                            <button type="button" :class="{ on: trainingType==='ausdauer' }" @click="trainingType='ausdauer'">Ausdauer</button>
                            <button type="button" :class="{ on: trainingType==='dehnung' }" @click="trainingType='dehnung'">Dehnung</button>
                        </div>
                    </div>

                    <!-- Trainingstyp (Mobile ≤560px: Label + Dropdown) -->
                    <div class="type-block mobile-only">
                        <label class="type-heading field-label" for="training-type">Trainingstyp</label>
                        <UiSelect v-model="trainingTypeSafe"
                                  id="training-type"
                                  aria-label="Trainingstyp wählen"
                                  placeholder="Trainingstyp wählen"
                                  :options="[
            { value: 'kraft',        label: 'Kraft' },
            { value: 'calisthenics', label: 'Calisthenics' },
            { value: 'ausdauer',     label: 'Ausdauer' },
            { value: 'dehnung',      label: 'Dehnung' }
          ]" />
                    </div>

                    <!-- Extras-Button rechtsbündig (unverändert) -->
                    <ExtrasToggleButton :extraClass="['action-btn','extras-cta']"
                                        :toggled="showExtras"
                                        :title="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                        :aria-label="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                        @click="toggleExtras" />
                </div>

                <div v-show="showExtras" class="goal-row">
                    <label class="field-label">Trainingsziel</label>
                    <div class="field-row">
                        <UiSelect v-model="selectedGoalSafe"
                                  class="goal-select"
                                  placeholder="Trainingsziel"
                                  :options="trainingGoals" />
                    </div>
                </div>

                <!-- Filter -->
                <div class="field-block" v-if="trainingType !== 'ausdauer'">
                    <label class="field-label">Muskelgruppe</label>
                    <div class="field-row">
                        <UiTrainingInput id="exercise-filter"
                                         class="filter-input"
                                         v-model="exerciseFilter"
                                         placeholder="z. B. Brust, Oberkörper, Push" />
                    </div>
                </div>

                <!-- Übungsauswahl -->
                <div class="field-block" v-if="trainingType !== 'ausdauer'">
                    <label class="field-label">Übung</label>
                    <div class="field-row field-row-stack">
                        <UiSelect v-model="newExerciseSafe"
                                  placeholder="Übung wählen"
                                  :options="[
...filteredExercises,
{ value: 'custom', label: 'Eigene Übung hinzufügen…', isCustom: true }
]" />

                        <UiTrainingInput v-if="newExercise === 'custom'"
                                         id="custom-exercise"
                                         v-model="customPlanExercise"
                                         placeholder="Eigene Übung eingeben" />
                    </div>
                </div>

                <!-- Cardio -->
                <div class="field-block" v-else>
                    <label class="field-label">Cardio-Art</label>
                    <div class="field-row">
                        <UiSelect v-model="cardioExerciseSafe"
                                  placeholder="Cardio-Art"
                                  :options="filteredExercises" />
                    </div>
                </div>

                <!-- Parameter -->
                <div class="field-grid" v-if="trainingType === 'kraft' || trainingType === 'calisthenics'">
                    <div class="field">
                        <label>Sätze</label>
                        <UiTrainingInput id="strength-sets"
                                         v-model.number="newSets"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 4" />                    </div>
                    <div class="field">
                        <label>Wiederholungen</label>
                        <UiTrainingInput id="strength-reps"
                                         v-model.number="newReps"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 8–12" />                    </div>
                </div>

                <div class="field-grid" v-else-if="trainingType === 'dehnung'">
                    <div class="field">
                        <label>Holds</label>
                        <UiTrainingInput id="stretch-holds"
                                         v-model.number="newSets"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 3" />                    </div>
                    <div class="field">
                        <label>Sekunden pro Hold</label>
                        <UiTrainingInput id="stretch-seconds"
                                         v-model.number="newReps"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 30" />                    </div>
                </div>

                <div class="field-grid" v-else>
                    <div class="field">
                        <label>Dauer (Min)</label>
                        <UiTrainingInput id="cardio-duration"
                                         v-model.number="newDuration"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 25" />                    </div>
                    <div class="field">
                        <label>Distanz (km, optional)</label>
                        <UiTrainingInput id="cardio-distance"
                                         v-model.number="newDistance"
                                         type="number"
                                         min="0"
                                         step="0.1"
                                         placeholder="z. B. 5" />                    </div>
                </div>

                <!-- Actions -->
                <div class="actions-row stack">
                    <div class="button-group">
                        <div class="btn-cell">
                            <AddExerciseButton class="action-btn add-exercise-btn block"
                                               title="Übung hinzufügen"
                                               @click="addExerciseToPlan" />
                        </div>
                    </div>
                </div>

                <PlanSubmitButton class="action-btn plan-submit-btn"
                                  :isEditing="!!editingPlanId"
                                  :disabled="validatePlanName(planName) === false"
                                  createLabel="Plan erstellen"
                                  saveLabel="Plan speichern" />
            </div>

            <!-- RIGHT: Live Preview (sticky) -->
            <div class="builder-right">
                <div class="preview-card">
                    <div class="preview-head">
                        <h4>Live-Preview</h4>
                        <span v-if="selectedPlanExercises.length" class="muted">
                            {{ selectedPlanExercises.length }} Übung{{ selectedPlanExercises.length===1?'':'en' }}
                        </span>
                    </div>

                    <Table v-if="selectedPlanExercises.length"
                           class="exercise-table full-width compact"
                           density="compact">
                        <table ref="previewTable" data-cols="4">
                            <thead>
                                <tr>
                                    <th class="resizable" :style="{ width: previewColWidths[0] + '%' }">
                                        <span class="th-text">Übung</span>
                                    </th>
                                    <th class="resizable" :style="{ width: previewColWidths[1] + '%' }">
                                        <span class="th-text">
                                            {{ selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                        </span>
                                    </th>
                                    <th class="resizable th-wdh" :style="{ width: previewColWidths[2] + '%' }">
                                        <span class="th-text th-label">
                                            <span class="full">
                                                {{
selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'Wdh. / km / s'
                      : 'Wiederholungen'
                                                }}
                                            </span>
                                            <span class="mid">
                                                {{
selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'Wdh./km/s'
                      : 'Wiederhol...'
                                                }}
                                            </span>
                                            <span class="short">
                                                {{
selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'W/km/s'
                      : 'Wdh.'
                                                }}
                                            </span>
                                        </span>
                                    </th>

                                    <th :style="{ width: previewColWidths[3] + '%' }">Aktion</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr v-for="(ex, index) in selectedPlanExercises"
                                    :key="index"
                                    @dblclick="openEditPopup('table', index, $event)">
                                    <td :style="{ width: previewColWidths[0] + '%' }">{{ ex.exercise }}</td>
                                    <td :style="{ width: previewColWidths[1] + '%' }">
                                        {{ ex.type === 'ausdauer' ? `${ex.sets} min` : ex.sets }}
                                    </td>
                                    <td :style="{ width: previewColWidths[2] + '%' }">
                                        <template v-if="ex.type === 'ausdauer'">
                                            {{ ex.reps ? `${ex.reps} km` : '-' }}
                                        </template>
                                        <template v-else-if="ex.type === 'dehnung'">
                                            {{ ex.reps }} s
                                        </template>
                                        <template v-else>
                                            {{ ex.reps }}
                                        </template>
                                    </td>
                                    <td class="action-cell">
                                        <DeleteButton class="table-delete-btn"
                                                      title="Übung entfernen"
                                                      @click="removeExerciseFromPlan(index)" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Table>

                    <div v-else class="empty-preview">
                        <span>Noch keine Übung hinzugefügt.</span>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
    import UiSelect from '@/components/ui/kits/UiSelect.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue'
    import AddExerciseButton from '@/components/ui/buttons/AddExerciseButton.vue'
    import PlanSubmitButton from '@/components/ui/buttons/PlanSubmitButton.vue'
    import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
    import Table from '@/components/ui/kits/UiTable.vue'
    import UiTrainingInput from '@/components/ui/kits/inputs/UiTrainingInput.vue'
    import { useTrainingPlansStore } from "@/store/trainingPlansStore";

    import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "@/types/TrainingPlan"
    import { useAuthStore } from "@/store/authStore";

    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>

    const props = defineProps<{
        openEditPopup: (type: any, index: any, event?: MouseEvent) => void
        addToast: (message: string, type?: any) => void
        openValidationPopup: (errors: string[]) => void

        openDeletePopup?: (action: () => void) => void

        // ✅ Guest: Plan an Training.vue hochreichen
        onGuestPlanCreated?: (plan: ViewPlan) => void

        // ✅ v-model Quelle
        customExercises?: Array<{ name: string; muscle: string; type: CustomExerciseType }>
        saveToStorage?: () => void
    }>()

    const emit = defineEmits<{
        (e: 'update:customExercises', value: Array<{ name: string; muscle: string; type: CustomExerciseType }>): void
    }>()

    const customExercisesState = ref<Array<{ name: string; muscle: string; type: CustomExerciseType }>>(
        Array.isArray(props.customExercises) ? [...props.customExercises] : []
    )

    const sameCustom = (
        a: Array<{ name: string; muscle: string; type: CustomExerciseType }>,
        b: Array<{ name: string; muscle: string; type: CustomExerciseType }>
    ) => {
        if (a === b) return true
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
            const x = a[i], y = b[i]
            if (!y) return false
            if (x.name !== y.name || x.muscle !== y.muscle || x.type !== y.type) return false
        }
        return true
    }

    watch(
        () => props.customExercises,
        (val) => {
            const next = Array.isArray(val) ? [...val] : []
            if (!sameCustom(customExercisesState.value, next)) {
                customExercisesState.value = next
            }
        },
        { deep: false }
    )

    watch(
        customExercisesState,
        (val) => {
            const currentProp = Array.isArray(props.customExercises) ? props.customExercises : []
            if (!sameCustom(currentProp as any, val)) {
                emit('update:customExercises', [...val])
            }
        },
        { deep: true }
    )
    // ===== Typen (wie in Training.vue) =====
    interface PlanExercise {
        exercise: string;
        sets: number;
        reps: number;
        goal?: string;
        type?: 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung';
    }

    type ViewPlan = {
        id: string;
        name: string;
        isFavorite: boolean;
        exercises: PlanExercise[];
        exerciseCount: number;
    };

    type TrainingPlan = ViewPlan;

    // ===== Store =====
    const trainingPlansStore = useTrainingPlansStore()
    const auth = useAuthStore()

    // ===== Builder State (1:1 übernommen) =====
    const planName = ref('')
    const newExercise = ref('')
    const customPlanExercise = ref('')
    const newReps = ref<number | null>(null)
    const newSets = ref<number | null>(null)
    const trainingType = ref<'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung'>('kraft')
    const cardioTypes = ref([
        'Laufen', 'Radfahren', 'Rudern', 'Crosstrainer', 'Seilspringen', 'Treppensteigen', 'Schwimmen'
    ])
    const cardioExercise = ref('')
    const newDuration = ref<number | null>(null)
    const newDistance = ref<number | null>(null)

    const previewColWidths = ref([50, 25, 19, 6])
    const previewTable = ref<HTMLTableElement | null>(null)

    const editingPlanId = ref<string | null>(null)
    const selectedPlanExercises = ref<PlanExercise[]>([])
    const selectedGoal = ref('')
    const trainingGoals = ref(['Muskelaufbau', 'Abnehmen', 'Ausdauer', 'Kraft'])
    const showExtras = ref(false)

    const exerciseFilter = ref('')

    const builderSection = ref<HTMLElement | null>(null)


    // Parent soll Builder steuern können (Edit/Reset/Scroll)
    const setEditMode = (payload: {
        planId: string | null
        name: string
        exercises: PlanExercise[]
    }) => {
        editingPlanId.value = payload.planId
        planName.value = payload.name
        selectedPlanExercises.value = Array.isArray(payload.exercises) ? [...payload.exercises] : []
    }

    const clearEditMode = () => {
        editingPlanId.value = null
    }

    const scrollToBuilder = () => {
        const el = builderSection.value
        if (!el) return

        const offset = 8
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })

        el.classList.remove('builder-landing')
        void (el as any).offsetWidth
        el.classList.add('builder-landing')
        // optional: Planname fokussieren
        const input = document.getElementById('plan-name') as HTMLInputElement | null
        if (input) input.focus({ preventScroll: true })
    }

    defineExpose({
        builderSection,
        setEditMode,
        clearEditMode,
        resetBuilder,
        scrollToBuilder,

        // 🔥 Parent darf Preview-Liste lesen/patchen (für zentrales EditPopup)
        getPreviewExercises: () => selectedPlanExercises.value,
        getPreviewExercise: (i: number) => selectedPlanExercises.value[i] ?? null,
        updatePreviewExercise: (i: number, patch: Partial<PlanExercise>) => {
            const ex = selectedPlanExercises.value[i]
            if (!ex) return false
            Object.assign(ex, patch)
            return true
        },
    })

    // ===== Helpers (aus deinem Script übernommen, soweit Builder-relevant) =====
    const validatePlanName = (name: string): string | false => {
        const trimmedName = name.trim()
        if (trimmedName.length < 3) return false
        if (trimmedName.length > 20) return false
        return trimmedName
    }

    const validateReps = (reps: number | null | undefined) => {
        if (reps == null || isNaN(reps)) return 'Wiederholungen/Sekunden müssen eine Zahl sein'
        if (!Number.isFinite(reps)) return 'Ungültige Zahl'
        if (!Number.isInteger(reps)) return 'Wiederholungen/Sekunden müssen eine Ganzzahl sein'
        if (reps < 1 || reps > 1000) return 'Wiederholungen/Sekunden müssen zwischen 1 und 1000 liegen'
        return null
    }

    const validateSets = (sets: number | null | undefined) => {
        if (sets == null || isNaN(sets)) return 'Sätze müssen eine Zahl sein'
        if (sets < 1 || sets > 20) return 'Sätze müssen zwischen 1 und 20 liegen'
        if (!Number.isInteger(sets)) return 'Sätze müssen eine Ganzzahl sein'
        return null
    }

    const validateDurationMin = (val: number | null | undefined) => {
        if (val == null || isNaN(val)) return 'Dauer (Minuten) muss eine Zahl sein'
        if (!Number.isInteger(val)) return 'Dauer (Minuten) muss eine Ganzzahl sein'
        if (val < 1 || val > 600) return 'Dauer (Minuten) muss zwischen 1 und 600 liegen'
        return null
    }
    const validateDistanceKm = (val: number | null | undefined) => {
        if (val == null || val === undefined || val === 0) return null
        if (val < 0 || val > 1000) return 'Distanz (km) muss zwischen 0 und 1000 liegen'
        return null
    }

    // REPLACE in components/ui/training/TrainingPlanBuilder.vue (filteredExercises + helpers)

    // 1:1 wie Training.vue
    const muscleGroupAliases: Record<string, string[]> = {
        'brust': ['Brust'],
        'rücken': ['Rücken'], 'ruecken': ['Rücken'],
        'schulter': ['Schultern'], 'schultern': ['Schultern'],
        'arme': ['Arme'], 'arm': ['Arme'],
        'beine': ['Beine'], 'bein': ['Beine'], 'unterkörper': ['Beine', 'Bauch'], 'unterkoerper': ['Beine', 'Bauch'],
        'bauch': ['Bauch'], 'core': ['Bauch'],
        'oberkörper': ['Brust', 'Rücken', 'Schultern', 'Arme'], 'oberkoerper': ['Brust', 'Rücken', 'Schultern', 'Arme'],
        'po': ['Beine'], 'gesäß': ['Beine'], 'gluteus': ['Beine'],

        'push': ['Brust', 'Schultern', 'Arme'],
        'pull': ['Rücken', 'Arme'],
        'drücken': ['Brust', 'Schultern', 'Arme'],
        'ziehen': ['Rücken', 'Arme'],
        'push day': ['Brust', 'Schultern', 'Arme'],
        'pull day': ['Rücken', 'Arme'],
        'pushday': ['Brust', 'Schultern', 'Arme'],
        'pullday': ['Rücken', 'Arme'],

        'trizeps': ['Arme'],
        'bizeps': ['Arme'],
        'lat': ['Rücken'], 'lats': ['Rücken'], 'latissimus': ['Rücken'],

        'chest': ['Brust'],
        'back': ['Rücken'],
        'shoulder': ['Schultern'], 'shoulders': ['Schultern'],
        'arms': ['Arme'], 'biceps': ['Arme'], 'triceps': ['Arme'],
        'legs': ['Beine'], 'lower body': ['Beine', 'Bauch'],
        'abs': ['Bauch'], 'core ': ['Bauch'],
        'upper body': ['Brust', 'Rücken', 'Schultern', 'Arme'],
    }

    const calisthenicsByGroup: Record<string, string[]> = {
        Brust: ['Liegestütze', 'Archer Push-up', 'Dips'],
        Rücken: ['Klimmzüge', 'Australian Pull-up', 'Archer Pull-up'],
        Schultern: ['Handstand Push-up', 'Archer Push-up'],
        Arme: ['Dips', 'Klimmzüge', 'Archer Pull-up'],
        Bauch: ['L-Sit', 'Dragon Flag', 'Hollow Hold', 'Toes to Bar'],
        Beine: ['Pistol Squat'],
    }

    const stretchingByGroup: Record<string, string[]> = {
        Brust: ['Brust-Dehnung'],
        Rücken: ['Rücken-Dehnung'],
        Schultern: ['Schulter-Dehnung', 'Trizeps-Dehnung'],
        Arme: ['Trizeps-Dehnung'],
        Bauch: [],
        Beine: ['Hamstring-Dehnung', 'Waden-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung'],
    }

    const resolveGroups = (q: string): string[] => {
        const key = (q || '').trim().toLowerCase()
        return muscleGroupAliases[key] || []
    }
    const uniq = <T,>(arr: T[]) => Array.from(new Set(arr))

    const calisthenicsExercises = ref([
        'Klimmzüge', 'Liegestütze', 'Dips', 'Muscle-Up', 'Handstand Push-up',
        'L-Sit', 'Dragon Flag', 'Pistol Squat', 'Hollow Hold', 'Superman Hold',
        'Archer Pull-up', 'Archer Push-up', 'Australian Pull-up', 'Toes to Bar',
    ])

    const stretchingExercises = ref([
        'Brust-Dehnung', 'Hüftbeuger-Dehnung', 'Hamstring-Dehnung',
        'Waden-Dehnung', 'Schulter-Dehnung', 'Trizeps-Dehnung',
        'Rücken-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung',
    ])

    const predefinedExercises = ref([
        'Bankdrücken', 'Kniebeugen', 'Kreuzheben', 'Schulterdrücken', 'Liegestütze', 'Klimmzüge', 'Latzug', 'Rudern',
        'Bizepscurls', 'Trizepsdrücken', 'Beinpresse', 'Ausfallschritte', 'Butterfly', 'Seitheben', 'Wadenheben',
        'Bauchpresse', 'Rückenstrecker', 'Beinstrecker', 'Beinbeuger', 'Brustpresse', 'Dips'
    ])

    const muscleGroups = ref({
        Brust: ['Bankdrücken', 'Liegestütze', 'Butterfly', 'Brustpresse'],
        Rücken: ['Klimmzüge', 'Latzug', 'Rudern', 'Rückenstrecker'],
        Beine: ['Kniebeugen', 'Kreuzheben', 'Beinpresse', 'Ausfallschritte', 'Wadenheben'],
        Schultern: ['Schulterdrücken', 'Seitheben'],
        Arme: ['Bizepscurls', 'Trizepsdrücken', 'Dips'],
        Bauch: ['Bauchpresse'],
    })

    const filteredExercises = computed(() => {
        const filter = exerciseFilter.value.trim().toLowerCase()
        const groups = resolveGroups(filter)
        const isPush = ['push', 'drücken', 'push day', 'pushday'].includes(filter)
        const isPull = ['pull', 'ziehen', 'pull day', 'pullday'].includes(filter)

        // Ausdauer
        if (trainingType.value === 'ausdauer') return cardioTypes.value

        // Calisthenics
        if (trainingType.value === 'calisthenics') {
            const nameMatches = calisthenicsExercises.value.filter(x => x.toLowerCase().includes(filter))
            const groupMatches = groups.length ? groups.flatMap(g => (calisthenicsByGroup[g] || [])) : []

            const custom = customExercisesState.value
                .filter(ex =>
                    ex.type === 'calisthenics' && (
                        ex.name.toLowerCase().includes(filter) ||
                        ex.muscle.toLowerCase().includes(filter) ||
                        (groups.length && groups.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                    )
                )
                .map(ex => ex.name)

            let list = uniq([...nameMatches, ...groupMatches, ...custom])

            if (isPush) {
                const allow = new Set(['Liegestütze', 'Archer Push-up', 'Dips', 'Handstand Push-up'])
                list = list.filter(x => allow.has(x))
            } else if (isPull) {
                const allow = new Set(['Klimmzüge', 'Australian Pull-up', 'Archer Pull-up'])
                list = list.filter(x => allow.has(x))
            }

            return list
        }

        // Dehnung
        if (trainingType.value === 'dehnung') {
            const isPushPull = ['push', 'pull', 'drücken', 'ziehen', 'push day', 'pushday', 'pull day', 'pullday'].includes(filter)
            const groups2 = isPushPull ? [] : resolveGroups(filter)

            const nameMatches = stretchingExercises.value.filter(x => !filter || x.toLowerCase().includes(filter))
            const groupMatches = groups2.length ? groups2.flatMap(g => stretchingByGroup[g] || []) : []

            const custom = customExercisesState.value
                .filter(ex =>
                    ex.type === 'dehnung' && (
                        ex.name.toLowerCase().includes(filter) ||
                        ex.muscle.toLowerCase().includes(filter) ||
                        (groups2.length && groups2.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                    )
                )
                .map(ex => ex.name)

            return Array.from(new Set([...nameMatches, ...groupMatches, ...custom]))
        }

        // Kraft (default)
        const caliSet = new Set(calisthenicsExercises.value.map(x => x.toLowerCase()))

        const fromGroups = groups.length
            ? groups.flatMap(g => ((muscleGroups.value as unknown as Record<string, string[]>)[g] || []))
            : []

        const byName = predefinedExercises.value.filter(ex => ex.toLowerCase().includes(filter))

        let grouped = uniq([...fromGroups, ...byName]).filter(ex => !caliSet.has(ex.toLowerCase()))

        const custom = customExercisesState.value
            .filter(ex =>
                ex.type === 'kraft' && (
                    ex.name.toLowerCase().includes(filter) ||
                    ex.muscle.toLowerCase().includes(filter) ||
                    (groups.length && groups.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                )
            )
            .map(ex => ex.name)

        let result = uniq([...grouped, ...custom])

        if (isPush) {
            const allow = new Set(['Bankdrücken', 'Schulterdrücken', 'Liegestütze', 'Butterfly', 'Brustpresse', 'Dips', 'Seitheben', 'Trizepsdrücken'])
            result = result.filter(x => allow.has(x))
        } else if (isPull) {
            const allow = new Set(['Klimmzüge', 'Latzug', 'Rudern', 'Bizepscurls', 'Rückenstrecker'])
            result = result.filter(x => allow.has(x))
        }

        return result
    })


    // ===== Safe v-models (1:1) =====
    const newExerciseSafe = computed({
        get: () => newExercise.value,
        set: (val) => { if (!val) return; newExercise.value = val },
    })

    const cardioExerciseSafe = computed({
        get: () => cardioExercise.value,
        set: (val) => { if (!val) return; cardioExercise.value = val },
    })

    const trainingTypeSafe = computed({
        get: () => trainingType.value,
        set: (val) => { if (!val) return; trainingType.value = val },
    })

    const selectedGoalSafe = computed({
        get: () => selectedGoal.value,
        set: (val) => { if (!val) return; selectedGoal.value = val },
    })

    const toggleExtras = () => {
        showExtras.value = !showExtras.value
    }

    // ADD in components/ui/training/TrainingPlanBuilder.vue (helpers wie Training.vue)
    const normalizeTypeInput = (raw: unknown): ExerciseType | null => {
        const t = String(raw ?? '').trim().toLowerCase()
        const map: Record<string, ExerciseType> = {
            kraft: 'kraft', strength: 'kraft',
            calisthenics: 'calisthenics', cali: 'calisthenics', bodyweight: 'calisthenics', bw: 'calisthenics',
            dehnung: 'dehnung', stretch: 'dehnung', stretching: 'dehnung',
            ausdauer: 'ausdauer', cardio: 'ausdauer', endurance: 'ausdauer',
        }
        return (map[t] ?? (['kraft', 'calisthenics', 'dehnung', 'ausdauer'].includes(t) ? (t as ExerciseType) : null))
    }

    const validateCustomExercise = (
        name: string,
        muscle: string,
        typeRaw: string | ExerciseType,
        editIndex: number | null = null
    ): { name: string; muscle: string; type: CustomExerciseType } | string => {
        const trimmedName = (name ?? '').trim()
        const trimmedMuscle = (muscle ?? '').trim()

        if (!trimmedName) return 'Übungsname ist erforderlich'
        if (!trimmedMuscle) return 'Muskelgruppe ist erforderlich'
        if (trimmedName.length > 50) return 'Übungsname darf maximal 50 Zeichen lang sein'
        if (trimmedMuscle.length > 50) return 'Muskelgruppe darf maximal 50 Zeichen lang sein'

        const normalized = normalizeTypeInput(typeRaw)
        if (!normalized) return 'Ungültiger Typ. Erlaubt sind: kraft, calisthenics, dehnung'
        if (normalized === 'ausdauer') return '"Ausdauer" ist für benutzerdefinierte Übungen nicht erlaubt'

        const type = normalized as CustomExerciseType

        const exists = customExercisesState.value.some((ex, i) =>
            i !== editIndex &&
            ex.type === type &&
            ex.name.trim().toLowerCase() === trimmedName.toLowerCase()
        )
        if (exists) return 'Übungsname existiert in diesem Typ bereits'

        return { name: trimmedName, muscle: trimmedMuscle, type }
    }

    const collectValidationErrors = () => {
        const errors: string[] = []

        if (trainingType.value === 'ausdauer') {
            if (!cardioExercise.value) errors.push('Cardio-Art wählen')
            const dErr = validateDurationMin(newDuration.value); if (dErr) errors.push(dErr)
            const kErr = validateDistanceKm(newDistance.value); if (kErr) errors.push(kErr)
            return errors
        }

        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value
        if (!exerciseToAdd) errors.push('Übung auswählen oder benutzerdefinierte Übung eingeben')
        else if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === exerciseToAdd.toLowerCase())) {
            errors.push('Übung bereits im Plan vorhanden')
        }

        const setsError = validateSets(newSets.value); if (setsError) errors.push(setsError)
        const repsError = validateReps(newReps.value); if (repsError) errors.push(repsError)

        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || ''
            const validated = validateCustomExercise(customPlanExercise.value, muscleGroup, trainingType.value)
            if (typeof validated === 'string') errors.push(validated)
        }

        return errors
    }


    // ===== DTO flatten / mapping (aus deinem Code) =====
    const toPlanExercise = (ex: any): PlanExercise => ({
        exercise: ex.name,
        sets: ex.sets ?? 0,
        reps: ex.reps ?? 0,
        type: (ex.category === 3 ? "ausdauer" : ex.category === 2 ? "dehnung" : ex.category === 1 ? "calisthenics" : "kraft"),
    })

    const flattenDto = (p: TrainingPlanDto): ViewPlan => {
        const flat: PlanExercise[] = []
        for (const d of (p.days ?? [])) {
            for (const ex of (d.exercises ?? [])) flat.push(toPlanExercise(ex))
        }
        return { id: p.id, name: p.name, isFavorite: !!p.isFavorite, exercises: flat, exerciseCount: flat.length }
    }

    const mapTypeToCategory = (t?: PlanExercise["type"]) => {
        if (t === "calisthenics") return 1
        if (t === "dehnung") return 2
        if (t === "ausdauer") return 3
        return 0
    }

    const PLAN_CODE_LEN = 12
    const CODE_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"   // wie Backend
    const CODE_LOWER = "abcdefghijkmnpqrstuvwxyz"
    const CODE_DIGIT = "23456789"

    // Backend erlaubt NUR diese Specials:
    const CODE_SPECIAL = "&-_,#."
    const CODE_ALNUM = CODE_UPPER + CODE_LOWER + CODE_DIGIT

    const securePick = (charset: string) => {
        const a = new Uint32Array(1)
        crypto.getRandomValues(a)
        return charset[a[0] % charset.length]
    }

    const shuffle = (arr: string[]) => {
        // Fisher–Yates mit crypto
        for (let i = arr.length - 1; i > 0; i--) {
            const a = new Uint32Array(1)
            crypto.getRandomValues(a)
            const j = a[0] % (i + 1)
                ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
    }

    const generatePlanCode = (len = PLAN_CODE_LEN) => {
        if (len !== 12) throw new Error("Plan-Code Länge muss 12 sein")

        // garantiert: mind. 1 upper, 1 lower, 1 digit, GENAU 1 special
        const chars: string[] = [
            securePick(CODE_UPPER),
            securePick(CODE_LOWER),
            securePick(CODE_DIGIT),
            securePick(CODE_SPECIAL),
        ]

        // Rest nur alnum (damit max. 1 Special drin ist)
        while (chars.length < len) chars.push(securePick(CODE_ALNUM))

        return shuffle(chars).join("")
    }

    const toUpsertPayload = (): TrainingPlanUpsert => ({
        name: validatePlanName(planName.value) as string,
        isFavorite: false,

        days: [{
            name: "Tag 1",
            sortOrder: 0,
            exercises: selectedPlanExercises.value.map((ex, i) => ({
                name: ex.exercise,
                category: mapTypeToCategory(ex.type),
                sortOrder: i,
                sets: ex.type === "ausdauer" ? null : ex.sets,
                reps: ex.type === "ausdauer" ? null : ex.reps,
                durationMin: ex.type === "ausdauer" ? ex.sets : null,
                distanceKm: ex.type === "ausdauer" ? (ex.reps ? ex.reps : null) : null,
            })),
        }],
    })

    function resetBuilder() {
        planName.value = ""
        newExercise.value = ""
        customPlanExercise.value = ""

        newReps.value = null
        newSets.value = null
        newDuration.value = null
        newDistance.value = null

        selectedGoal.value = ""
        selectedPlanExercises.value = []
        editingPlanId.value = null
        cardioExercise.value = ''
    }

    // ===== Actions (1:1) =====
    // REPLACE in components/ui/training/TrainingPlanBuilder.vue (addExerciseToPlan)
    const addExerciseToPlan = () => {
        const errors = collectValidationErrors()
        if (errors.length > 0) { props.openValidationPopup(errors); return }

        if (trainingType.value === 'ausdauer') {
            selectedPlanExercises.value.push({
                exercise: cardioExercise.value,
                sets: newDuration.value!,
                reps: newDistance.value ? Number(newDistance.value) : 0,
                goal: selectedGoal.value || undefined,
                type: 'ausdauer'
            })
            props.addToast('Cardio hinzugefügt', 'add')
            cardioExercise.value = ''
            selectedGoal.value = ''
            return
        }

        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value

        // 1:1: Custom-Übung beim Hinzufügen speichern
        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || ''
            const validated = validateCustomExercise(customPlanExercise.value, muscleGroup, trainingType.value)
            if (typeof validated !== 'string') {
                customExercisesState.value.push({ name: validated.name, muscle: validated.muscle, type: validated.type })
                props.saveToStorage?.()
                props.addToast('Benutzerdefinierte Übung gespeichert', 'add')
            } else {
                props.openValidationPopup([validated])
                return
            }
        }

        selectedPlanExercises.value.push({
            exercise: exerciseToAdd,
            sets: newSets.value!,
            reps: newReps.value!,
            goal: selectedGoal.value || undefined,
            type: trainingType.value
        })

        props.addToast('Übung hinzugefügt', 'add')

        newExercise.value = ''
        customPlanExercise.value = ''
        selectedGoal.value = ''
    }

    const removeExerciseFromPlan = (index: number) => {
        if (index < 0 || index >= selectedPlanExercises.value.length) {
            props.addToast('Ungültiger Übungsindex', 'delete')
            return
        }

        const doDelete = () => {
            selectedPlanExercises.value.splice(index, 1)
            props.addToast('Übung gelöscht', 'delete')
        }

        // ✅ wenn Parent Confirm anbietet → nutzen
        if (props.openDeletePopup) {
            props.openDeletePopup(doDelete)
            return
        }

        // fallback: direkt löschen
        doDelete()
    }

    const createOrUpdatePlan = async () => {
        const validatedPlanName = validatePlanName(planName.value)

        if (!auth.user) {
            if (validatedPlanName === false || !selectedPlanExercises.value.length) {
                const errors: string[] = []
                if (validatedPlanName === false) {
                    errors.push(
                        planName.value.trim().length < 3
                            ? "Planname muss mindestens 3 Zeichen lang sein"
                            : "Planname darf maximal 20 Zeichen lang sein"
                    )
                }
                if (!selectedPlanExercises.value.length) errors.push("Mindestens eine Übung ist erforderlich")
                props.openValidationPopup(errors)
                return
            }

            // ✅ Gast-Plan in der UI-Liste anzeigen (Session-only)
            const id =
                (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                    ? crypto.randomUUID()
                    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

            props.onGuestPlanCreated?.({
                id,
                name: validatedPlanName as string,
                isFavorite: false,
                exercises: [...selectedPlanExercises.value],
                exerciseCount: selectedPlanExercises.value.length,
            })

            resetBuilder()
            return
        }

        if (validatedPlanName === false || (!editingPlanId.value && !selectedPlanExercises.value.length)) {
            const errors: string[] = []
            if (validatedPlanName === false) {
                errors.push(
                    planName.value.trim().length < 3
                        ? "Planname muss mindestens 3 Zeichen lang sein"
                        : "Planname darf maximal 20 Zeichen lang sein"
                )
            }
            if (!selectedPlanExercises.value.length) errors.push("Mindestens eine Übung ist erforderlich")
            props.openValidationPopup(errors)
            return
        }

        // ✅ Duplicate-Name Check (vor dem Request), case-insensitive
        const getPlans = (): any[] => {
            // versuch mehrere gängige Store-Keys, ohne dass TS meckert
            const anyStore = trainingPlansStore as any
            return (anyStore.items ?? anyStore.plans ?? anyStore.trainingPlans ?? []) as any[]
        }

        const isNameTaken = (name: string, ignoreId: string | null) => {
            const needle = name.trim().toLowerCase()
            return getPlans().some((p: any) =>
                String(p?.id ?? "").toLowerCase() !== String(ignoreId ?? "").toLowerCase() &&
                String(p?.name ?? "").trim().toLowerCase() === needle
            )
        }

        if (isNameTaken(validatedPlanName, editingPlanId.value)) {
            props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
            return
        }

        try {
            const payload = toUpsertPayload()

            if (editingPlanId.value) {
                const updated = await trainingPlansStore.update(editingPlanId.value, payload)
                void updated
                props.addToast("Plan gespeichert", "save")
            } else {
                const created = await trainingPlansStore.create(payload)

                console.log("[TrainingPlan] created:", created)
                console.log("[TrainingPlan] code:", (created as any)?.code ?? (created as any)?.data?.code)

                props.addToast("Plan erstellt", "add")
            }

            resetBuilder()
        } catch (e: any) {
            const status = e?.response?.status

            // ✅ Falls Backend weiter 500 wirft (23505), geben wir trotzdem die richtige Message
            if (status === 500 && isNameTaken(validatedPlanName, editingPlanId.value)) {
                props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
                return
            }

            // (optional) wenn Backend mal 409 liefert
            if (status === 409) {
                props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
                return
            }

            props.openValidationPopup(["Speichern fehlgeschlagen. Bitte versuch’s nochmal."])
        }
    }


    // ===== Preview-Resize (dein initPreviewResizeTable minimal übernommen) =====
    function normalizeStrictTo100(
        widthsPct: number[],
        tableEl: HTMLTableElement,
        minPxByCol: number[],
        preferGiveBackIndex: number
    ) {
        const tw = tableEl.getBoundingClientRect().width || 1
        const minPct = minPxByCol.map(px => +(px / tw * 100).toFixed(4))

        const clamped = widthsPct.map((v, i) => Math.max(minPct[i] ?? 0, +v))

        let sum = +clamped.reduce((a, b) => a + b, 0).toFixed(4)
        let diff = +(100 - sum).toFixed(4)
        if (Math.abs(diff) > 0.0001) {
            const idx = Math.min(Math.max(preferGiveBackIndex, 0), clamped.length - 1)
            clamped[idx] = Math.max(minPct[idx] ?? 0, +(clamped[idx] + diff).toFixed(4))
        }
        return clamped
    }
    let activeDragCleanup: null | (() => void) = null

    const initPreviewResizeTable = () => {
        const table = previewTable.value
        if (!table) return

        table.querySelectorAll('.resizer').forEach(el => el.remove())

        const MIN_PX_BY_COL = [16, 16, 16, 44]
        const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[]
        const lastIdx = ths.length - 1

        ths.forEach((th, colIndex) => {
            th.style.position = 'relative'
            const isLast = colIndex === lastIdx

            const makeResizer = (side: 'right' | 'left') => {
                const resizer = document.createElement('div')
                resizer.className = `resizer resizer-${side}`;
                (th.querySelector('.th-text') ?? th).appendChild(resizer)

                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto' }
                else { resizer.style.left = '0'; resizer.style.right = 'auto' }

                let startX = 0
                let start = [...previewColWidths.value]

                const onMove = (e: PointerEvent) => {
                    requestAnimationFrame(() => {
                        const tw = table.getBoundingClientRect().width || 1
                        const raw = e.clientX - startX
                        const dir = (isLast && side === 'left') ? -1 : 1
                        const dxRaw = dir * raw

                        const partnerIndex = isLast ? colIndex - 1 : colIndex + 1
                        if (partnerIndex < 0 || partnerIndex >= start.length) return

                        const currPx = (start[colIndex] / 100) * tw
                        const partnerPx = (start[partnerIndex] / 100) * tw

                        const minCurr = MIN_PX_BY_COL[colIndex] ?? 16
                        const minPartner = MIN_PX_BY_COL[partnerIndex] ?? 16

                        const maxDxRight = partnerPx - minPartner
                        const maxDxLeft = -(currPx - minCurr)
                        const dx = Math.max(maxDxLeft, Math.min(dxRaw, maxDxRight))

                        const newCurrPx = currPx + dx
                        const newPartnerPx = partnerPx - dx

                        const next = [...start]
                        next[colIndex] = +(newCurrPx / tw * 100).toFixed(4)
                        next[partnerIndex] = +(newPartnerPx / tw * 100).toFixed(4)

                        previewColWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex)
                    })
                }

                const cleanupDrag = (e?: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                    resizer.classList.remove('is-active')
                    builderSection.value?.classList.remove('is-resizing-col')
                    if (e) {
                        try { (resizer as any).releasePointerCapture?.(e.pointerId) } catch { }
                    }
                    if (activeDragCleanup === cleanupDrag) activeDragCleanup = null
                }

                const onUp = (e: PointerEvent) => {
                    cleanupDrag(e)
                }

                const onDown = (e: PointerEvent) => {
                    e.preventDefault()
                    e.stopPropagation()

                    startX = e.clientX
                    start = [...previewColWidths.value]

                    try { (resizer as any).setPointerCapture?.(e.pointerId) } catch { }

                    resizer.classList.add('is-active')
                    builderSection.value?.classList.add('is-resizing-col')

                    // falls noch irgendwas hängt, erst clean
                    activeDragCleanup?.()
                    activeDragCleanup = cleanupDrag

                    window.addEventListener('pointermove', onMove)
                    window.addEventListener('pointerup', onUp)
                }

                resizer.addEventListener('pointerdown', onDown)

            }

            if (isLast) { makeResizer('left'); makeResizer('right') }
            else { makeResizer('right') }
        })
    }

    let headerRO: ResizeObserver | null = null

    function applyHeaderState(th: HTMLElement) {
        const label = th.querySelector('.th-label') as HTMLElement | null
        if (!label) return
        const w = th.clientWidth
        label.classList.remove('is-full', 'is-mid', 'is-short')
        const SHORT = 80
        const MID = 120
        if (w <= SHORT) label.classList.add('is-short')
        else if (w <= MID) label.classList.add('is-mid')
        else label.classList.add('is-full')
    }

    function setupHeaderShorteningFallback() {
        headerRO?.disconnect()
        headerRO = new ResizeObserver((entries) => {
            entries.forEach(entry => applyHeaderState(entry.target as HTMLElement))
        })

        const table = previewTable.value
        if (!table) return
        const ths = Array.from(table.querySelectorAll('th.th-wdh')) as HTMLElement[]
        ths.forEach(th => {
            applyHeaderState(th)
            headerRO!.observe(th)
        })
    }

    function teardownHeaderShorteningFallback() {
        headerRO?.disconnect()
        headerRO = null
    }

    watch(
        selectedPlanExercises,
        () => {
            nextTick(() => {
                try {
                    initPreviewResizeTable()
                    setupHeaderShorteningFallback()
                } catch (err) {
                    console.error('[TrainingPlanBuilder] preview init crashed:', err)
                }
            })
        },
        { deep: true }
    )

    onMounted(() => {
        nextTick(() => {
            try {
                initPreviewResizeTable()
                setupHeaderShorteningFallback()
            } catch (err) {
                console.error('[TrainingPlanBuilder] onMounted init crashed:', err)
            }
        })
    })

    onUnmounted(() => {
        activeDragCleanup?.()
        activeDragCleanup = null
        teardownHeaderShorteningFallback()
    })
</script>
<style scoped>
    .workout-list {
        margin-top: 0.5rem;
        width: 100%;
        max-width: var(--section-max);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 0.5rem; /* reduziert von 1rem */
        box-sizing: border-box;
        overflow-x: visible; /* keine abgeschnittenen Schatten/Tables */
    }

    @media (max-width: 1240px) {
        .workout-list {
            max-width: var(--section-max);
        }
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }
    /* Smooth landing highlight when jumping to the builder */
    @keyframes builderPop {
        0% {
            transform: translateY(-6px);
            box-shadow: 0 0 0 rgba(99,102,241,0);
        }

        40% {
            transform: translateY(0);
            box-shadow: 0 8px 32px rgba(99,102,241,.20);
        }

        100% {
            transform: translateY(0);
            box-shadow: 0 0 0 rgba(99,102,241,0);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .builder-landing {
            animation: none;
        }
    }

    html.dark-mode .section-title {
        color: #ffffff;
    }

    .segmented.seg-type {
        display: flex;
        gap: .5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: .3rem;
        align-items: center;
    }

        .segmented.seg-type > button {
            background: transparent;
            border: 1px solid transparent;
            border-radius: 10px;
            padding: .45rem .9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all .15s ease;
            color: var(--text-primary);
        }

            .segmented.seg-type > button.on {
                background: var(--bg-card);
                border-color: var(--border-color);
                box-shadow: 0 1px 2px rgba(0,0,0,.06);
            }

    .filter-input::placeholder {
        opacity: .8;
    }

    .builder-left,
    .builder-head,
    .builder-head > * {
        min-width: 0;
    }

    .builder-left {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0; /* verhindert Overflow in Grids */
    }

    .builder-right {
        min-width: 0; /* wichtig für Tables/Overflow */
    }

    /* Feldblöcke */
    .field-block {
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }

    .field-label {
        font-weight: 600;
        font-size: .92rem;
        color: var(--text-primary);
    }

    .field-row {
        display: flex;
        gap: .75rem;
        align-items: stretch;
        flex-wrap: wrap;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
    }

        /* killt "ragt rechts raus" zuverlässig */
        .field-row > * {
            min-width: 0;
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
        }

    /* Zelle wird selbst Container → reagiert auf ihre eigene Breite */
    .v-stack {
        container-type: inline-size;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }

    .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .75rem;
    }

    @media (max-width: 600px) {
        .field-grid {
            grid-template-columns: 1fr;
        }
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: .4rem;
    }

    .actions-row.stack {
        display: flex;
        flex-direction: column;
        gap: .75rem;
        align-items: stretch; /* Kinder dürfen volle Breite nutzen */
    }

    .form-card.builder-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        box-sizing: border-box; /* damit Padding mitgerechnet wird */
    }

    @media (max-width: 899px) {
        .form-card.builder-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 900px) {
        .builder-head {
            grid-template-columns: 1fr;
            grid-template-areas:
                "plan"
                "type"
                "extras";
        }

            .builder-head .extras-cta {
                justify-self: start;
                white-space: nowrap;
                box-sizing: border-box;
                inline-size: min(var(--extras-toggle-w), 100%);
                min-inline-size: min(var(--extras-toggle-w), 100%);
                max-inline-size: min(var(--extras-toggle-w), 100%);
            }
    }

    @media (max-width: 1200px) {
        .segmented.seg-type {
            flex-wrap: wrap;
            row-gap: .35rem;
        }
    }

    .form-card {
        box-sizing: border-box;
    }

    /* === Live-Preview: Card im Stil von form-card/timer-card === */

    .preview-card {
        position: sticky;
        top: .75rem;
        contain: inline-size;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border-radius: 20px;
        padding: 1.35rem 1.55rem;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    @media (hover: hover) {
        .preview-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    html.dark-mode .preview-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }
    /* Kopf: dezentes Label + Counter rechts */
    .preview-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.15rem;
    }

        .preview-head h4 {
            margin: 0;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-weight: 600;
            opacity: 0.9;
        }

    .preview-card .muted {
        font-size: 0.78rem;
        padding: 0.1rem 0.7rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--bg-card) 88%, #0f172a 12%);
        border: 1px solid rgba(148, 163, 184, 0.5);
    }

    .empty-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        min-height: 150px;
        border-radius: 14px;
        padding: 1.25rem 1.5rem;
        /* kein eigener grauer Kasten mehr → zeigt direkt den lila/blauen Preview-Hintergrund */
        background: transparent;
        /* Rahmen im Accent-Look statt langweiligem Grau */
        border: 1px dashed color-mix(in srgb, var(--accent-primary) 55%, rgba(148, 163, 184, 0.5) 45%);
        box-shadow: none;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    /* Mobile: kompakter + kleinere min-width */
    @media (max-width: 560px) {
        .preview-card {
            position: static;
            top: auto;
            padding: 1.05rem 1.05rem;
            border-radius: 16px;
        }

            .preview-card .exercise-table.full-width th,
            .preview-card .exercise-table.full-width td {
                white-space: normal; /* auf mobile darf’s umbrechen */
                word-break: break-word;
            }

        .builder-head {
            grid-template-columns: minmax(0, 1fr) var(--control-height) !important;
        }

            .builder-head .extras-cta {
                inline-size: var(--control-height) !important;
                max-inline-size: var(--control-height) !important;
                padding-inline: 0 !important;
                justify-content: center;
            }

        .extras-label {
            display: none !important;
        }

        .builder-head .extras-cta {
            inline-size: var(--control-height);
            min-inline-size: var(--control-height);
            max-inline-size: var(--control-height);
            padding-inline: 0;
            display: inline-flex;
            justify-content: center;
        }
    }

    .actions-row .button-group .btn-cell > *:not(.add-exercise-btn) {
        height: var(--control-height);
    }

    .field-row .filter-input {
        flex: 1 1 320px;
        min-width: 220px;
    }

    .button-group:has(.add-exercise-btn) {
        --btn-width: 100%;
    }

    .button-group .btn-cell:has(.add-exercise-btn) {
        flex: 1 1 100%;
    }

    .button-group .btn-cell > .add-exercise-btn {
        width: 100%;
    }


    .form-card {
        position: relative;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 1.1rem;
        padding: 1.75rem 1.9rem;
        border-radius: 18px;
        box-sizing: border-box;
        /* ⇓ exakt im Stil der Landing-Karten (stat-card/feature-card) ⇓ */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    /* Hover-Verhalten wie bei .stat-card/.feature-card */
    @media (hover: hover) {
        .form-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    /* Dark Mode: gleiche Farbwelt, etwas satter und näher am Page-Gradient */
    html.dark-mode .form-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Fallback für alte Browser ohne backdrop-filter / color-mix */
    @supports not (backdrop-filter: blur(10px)) or not (color-mix(in srgb, black 10%, white 90%)) {
        .form-card {
            background: var(--bg-card);
            box-shadow: 0 12px 32px rgba(15,23,42,0.45);
        }
    }

    .desktop-only {
        display: initial;
    }

    .mobile-only {
        display: none;
    }

    .form-card button[type="submit"] {
        width: 100%;
    }


    /* Dark-Mode Kontrast (optional feiner abstimmen) */
    html.dark-mode .training {
        --resize-color: #64748b; /* slate-500 */
        --resize-color-hover: #3b82f6; /* blue-500 */
    }

    .builder-head .plan-block .field-label {
        display: block;
        margin-bottom: .6rem; /* Abstand Titel ↔ Input */
    }

    .builder-head .plan-block .plan-name-input {
        width: 100%;
    }

    .type-block .type-heading {
        display: block;
        margin-bottom: .6rem;
    }

    .goal-row {
        display: grid;
        gap: .55rem; /* Abstand Titel ↔ Select */
    }

    .builder-head .segmented.seg-type {
        gap: .45rem; /* etwas mehr Luft zwischen Buttons */
        padding: .26rem .35rem; /* minimal höhere/lebhaftere Fläche */
        border-radius: 10px;
    }

        .builder-head .segmented.seg-type > button {
            padding: .42rem .72rem; /* + ~2–3px in beide Richtungen */
            font-size: .89rem; /* vorher ~.86rem */
            border-radius: 9px;
        }

    .builder-head .plan-name-input.slim {
        flex: 1 1 320px;
        min-width: 180px;
    }

    @media (max-width: 1100px) {
        .builder-head .segmented.seg-type {
            gap: .28rem;
        }

            .builder-head .segmented.seg-type > button {
                padding: .28rem .5rem;
                font-size: .82rem;
            }
    }

    @media (max-width: 520px) {
        .builder-head {
            grid-template-columns: 1fr;
            grid-template-areas:
                "plan"
                "type"
                "extras";
        }

            .builder-head .extras-cta {
                justify-self: start;
                white-space: nowrap;
                box-sizing: border-box;
                inline-size: min(var(--extras-toggle-w), 100%);
                min-inline-size: min(var(--extras-toggle-w), 100%);
                max-inline-size: min(var(--extras-toggle-w), 100%);
            }

        .segmented.seg-type {
            flex-wrap: wrap;
            row-gap: .35rem;
        }
    }

    @media (max-width: 560px) {
        .desktop-only {
            display: none;
        }

        .builder-head .plan-block {
            grid-area: plan; /* spannt über "plan plan" = beide Spalten */
            width: 100%;
            min-width: 0; /* verhindert Einquetschen durch Intrinsic-Width */
        }

            .builder-head .plan-block .plan-name-input {
                width: 100% !important;
                max-width: none !important;
                min-width: 0;
                box-sizing: border-box;
            }

        .mobile-only {
            display: block;
        }

        .builder-head .type-block.desktop-only {
            display: none !important;
        }

        .builder-head .type-block.mobile-only {
            display: block;
        }

        .builder-head {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) var(--control-height) !important; /* 2. Spalte exakt Icon-Breite */
            grid-template-areas:
                "plan plan"
                "type extras" !important;
            align-items: start; /* nicht mittig zwischen den Zeilen hängen */
            row-gap: .6rem;
            column-gap: .75rem;
        }

            .builder-head .plan-name-input.slim {
                grid-area: plan;
                width: 100%; /* volle Breite */
            }

            .builder-head .type-block.mobile-only {
                grid-area: type;
            }

            .builder-head .seg-type-select {
                height: var(--control-height);
                font-size: var(--control-font-size);
                width: 100%;
            }

        .extras-label {
            display: none;
        }

        .extras-icon {
            margin-right: 0;
        }

        .builder-head .extras-cta {
            grid-area: extras;
            justify-self: end !important;
            align-self: end; /* am unteren Rand der Zeile → Höhe vom Label ignorieren */
            inline-size: var(--control-height) !important; /* quadratisch */
            min-inline-size: var(--control-height) !important;
            max-inline-size: var(--control-height) !important;
            padding-inline: 0 !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        /* Kleinkram */
        .seg-type-select {
            height: var(--control-height);
            font-size: var(--control-font-size);
            width: 100%;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-color);
            padding: 0 .75rem;
        }

        .plan-drag-handle {
            display: none;
        }
    }

    @media (min-width: 960px) {
        .builder-head .extras-cta {
            flex: 0 0 var(--extras-toggle-w);
            white-space: nowrap;
        }
    }

    .builder-head {
        display: grid;
        grid-template-columns: 1fr var(--extras-toggle-w);
        grid-template-rows: auto auto;
        grid-template-areas:
            "plan plan"
            "type extras";
        align-items: center;
        gap: .75rem 1rem;
    }

        .builder-head .plan-name-input.slim {
            grid-area: plan;
            width: 100%;
        }

        .builder-head .segmented.seg-type {
            grid-area: type;
            justify-self: start;
            margin-left: 0;
        }

        .builder-head .extras-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: .45rem;
            height: var(--control-height, 48px);
            font-size: var(--control-font-size, 0.95rem);
            padding: 0 var(--control-padding-x);
            border-radius: 12px;
            box-sizing: border-box;
            /* ✅ exakt wie UiTrainingInput / UiSelect */
            border: 2px solid color-mix(in srgb, var(--accent-primary) 42%, var(--border-color, #e5e7eb) 58%);
            background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), color-mix(in srgb, var(--bg-secondary, #f3f4f6) 86%, transparent);
            color: var(--text-primary, #111827);
            box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 4px color-mix(in srgb, var(--accent-primary) 7%, transparent);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
            /* Overflow-Schutz (wie vorher) */
            white-space: nowrap;
            min-width: 0;
            width: auto;
            max-inline-size: clamp(180px, 26ch, 360px);
            overflow: hidden;
            text-overflow: ellipsis;
        }

            .builder-head .extras-cta:focus {
                outline: none;
            }

            .builder-head .extras-cta:focus-visible {
                outline: none;
                border-color: color-mix(in srgb, var(--accent-primary) 78%, var(--border-color, #e5e7eb) 22%);
                box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 28%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 32%, transparent) inset, 0 16px 34px rgba(15, 23, 42, 0.18);
            }

            /* ✅ toggled-state (falls dein ExtrasToggleButton sowas setzt) */
            .builder-head .extras-cta.on,
            .builder-head .extras-cta.is-on,
            .builder-head .extras-cta[aria-pressed="true"] {
                border-color: color-mix(in srgb, var(--accent-primary) 78%, var(--border-color, #e5e7eb) 22%);
                box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 38%, transparent) inset, 0 16px 34px rgba(15, 23, 42, 0.18);
            }

    /* Dark Mode wie bei deinen Inputs */
    html.dark-mode .builder-head .extras-cta {
        border-color: color-mix(in srgb, rgba(129, 140, 248, 0.85) 52%, rgba(148, 163, 184, 0.35) 48%);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.14), transparent 58%), rgba(2, 6, 23, 0.48);
        color: #fff;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(129, 140, 248, 0.22) inset, 0 0 0 5px rgba(129, 140, 248, 0.10);
    }

    @media (min-width: 561px) {
        .builder-head {
            display: grid;
            grid-template-columns: 1fr var(--extras-toggle-w);
            grid-template-areas:
                "plan plan"
                "type extras";
            gap: .75rem 1.55rem;
        }

            .builder-head .type-block.desktop-only .segmented.seg-type {
                height: var(--control-height); /* fixe Zielhöhe, z. B. 48px */
                padding-block: .25rem; /* etwas schlanker innen, damit’s nicht zu fett wirkt */
                align-items: stretch; /* Buttons füllen die volle Höhe */
            }

                .builder-head .type-block.desktop-only .segmented.seg-type > button {
                    display: inline-flex; /* Text vertikal mittig */
                    align-items: center;
                    justify-content: center;
                }

            .builder-head .plan-block {
                grid-area: plan;
                min-width: 0; /* verhindert Overflow */
            }

                .builder-head .plan-block .plan-name-input {
                    width: 100%;
                    max-width: none;
                    min-width: 0;
                    box-sizing: border-box;
                }

            .builder-head .type-block.desktop-only {
                display: block;
            }

            .builder-head .type-block.mobile-only {
                display: none !important;
            }

            .builder-head .extras-cta {
                grid-area: extras;
                justify-self: end;
                white-space: nowrap;
                align-self: end;
            }

            .builder-head .plan-name-input.slim {
                grid-area: auto;
            }

            .builder-head .segmented.seg-type {
                grid-area: auto;
            }
    }

    @media (max-width: 960px) {
        .builder-head .type-block.desktop-only {
            display: none !important;
        }

        .builder-head .type-block.mobile-only {
            display: block !important;
        }

        /* Extras-Button bleibt voll (Icon + Text) */
        .builder-head .extras-cta {
            inline-size: var(--extras-toggle-w);
            min-inline-size: var(--extras-toggle-w);
            max-inline-size: var(--extras-toggle-w);
            padding-inline: var(--control-padding-x);
            justify-self: end;
        }

        .extras-label {
            display: inline;
        }
    }

    @media (min-width: 561px) and (max-width: 960px) {
        .type-block.desktop-only {
            display: none !important;
        }

        .type-block.mobile-only {
            display: block !important;
        }

        .builder-head {
            /* kein Scroll-Container -> Dropdown verhält sich wie deine anderen Selects */
            overflow: visible !important;
            /* rechts ist (bei dir <=960px) sowieso Icon-only -> exakt control-height */
            grid-template-columns: minmax(0, 1fr) var(--control-height) !important;
            grid-template-areas: "plan plan" "type extras" !important;
            column-gap: .85rem;
            align-items: end;
            min-width: 0;
        }

            .builder-head .extras-cta {
                inline-size: var(--control-height) !important;
                min-inline-size: var(--control-height) !important;
                max-inline-size: var(--control-height) !important;
                padding-inline: 0 !important;
                justify-content: center;
            }

        .extras-label {
            display: none !important;
        }

        .builder-head .seg-type-select {
            width: 100% !important;
        }
    }

    @media (max-width: 960px) {
        .builder-head .extras-cta {
            inline-size: var(--control-height) !important;
            min-inline-size: var(--control-height) !important;
            max-inline-size: var(--control-height) !important;
            padding-inline: 0 !important;
            justify-content: center;
        }

        .extras-label {
            display: none !important;
        }
        /* nur Icon zeigen */
    }

    @media (min-width: 961px) {
        .builder-head {
            grid-template-columns: minmax(0, 1fr) auto !important;
        }

            .builder-head .extras-cta {
                inline-size: auto !important;
                min-inline-size: auto !important;
                max-inline-size: clamp(180px, 24ch, 320px) !important; /* genug Platz für Label */
                padding-inline: var(--control-padding-x) !important;
                white-space: nowrap; /* Label bleibt einzeilig */
            }

        .extras-label {
            display: inline !important;
        }
    }

    .builder-head {
        grid-template-columns: minmax(0, 1fr) auto !important; /* linke Spalte flexibel, rechts Content-breite */
    }

        .builder-head .extras-cta {
            display: inline-flex;
            align-items: center;
            gap: .45rem;
            height: var(--control-height);
            padding-inline: var(--control-padding-x);
            border-radius: 8px;
            /* Overflow-Schutz */
            white-space: nowrap;
            min-width: 0;
            width: auto;
            max-inline-size: clamp(180px, 26ch, 360px); /* 26ch reicht für „Extras ausblenden“ */
            overflow: hidden;
            text-overflow: ellipsis;
        }

    /* Ab 561px immer mit Text */
    @media (min-width: 561px) {
        .extras-label {
            display: inline !important;
        }
    }

    .exercise-table.full-width {
        width: 100%;
        table-layout: fixed; /* BIG FIX: Spalten verhalten sich stabil */
        border-collapse: collapse;
    }

        .exercise-table.full-width th,
        .exercise-table.full-width td {
            padding: 1.5rem;
            text-align: center;
            min-width: 0; /* war 150px: verhindert Breiten-Inflation */
            text-overflow: ellipsis;
            white-space: nowrap;
        }

    .add-exercise-btn,
    .plan-submit-btn {
        width: 100%;
        height: var(--control-height);
        padding-left: var(--control-padding-x);
        padding-right: var(--control-padding-x);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    /* NEU: Resizer hängt an .th-text (nicht am TH) */
    th .th-text > .resizer {
        position: absolute;
        top: 0;
        right: 0;
        width: var(--resize-hit, 10px);
        height: 100%;
        cursor: col-resize;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
    }

        /* Sichtbare Linie im Griff */
        th .th-text > .resizer::before {
            content: "";
            width: var(--resize-line, 1px);
            height: 100%;
            background: var(--resize-color, #94a3b8);
            opacity: .7;
            transition: transform .12s ease, background-color .12s ease, opacity .12s ease;
        }

        th .th-text > .resizer:hover::before,
        th .th-text > .resizer.is-active::before {
            background: var(--resize-color-hover, #60a5fa);
            opacity: 1;
            transform: scaleX(2); /* optisch dicker beim Hover/Drag */
        }

    .exercise-select-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font: inherit;
        gap: 0.5rem;
        /* WICHTIG: keine eigenen Abstände/Farben/Borders mehr */
        padding: 0;
        border: none;
        border-radius: 0;
        background: transparent;
        color: inherit;
        box-sizing: border-box;
        box-shadow: none !important;
        outline: none !important;
        background-image: none !important;
    }

    .field-row .exercise-select-trigger {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        cursor: pointer !important;
        gap: 0.5rem !important;
        /* kein extra padding hier – kommt aus der gemeinsamen Regel oben */
    }

    .exercise-select-trigger:focus-visible {
        outline: 2px solid #5b8cff !important;
        outline-offset: 2px !important;
    }

    .button-group {
        display: flex;
        gap: 0.75rem;
        align-items: stretch;
        flex-wrap: nowrap;
        width: 100%;
        margin-left: 0;
    }

    @media (max-width: 600px) {
        .button-group {
            flex-wrap: wrap;
            width: 100%;
            --btn-width: 100%;
        }
    }

    .preview-card .exercise-table-wrap {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
    }

    .preview-card .exercise-table.full-width {
        width: 100%;
        min-width: 0; /* WICHTIG: kein erzwungenes Überlaufen */
    }

    .th-label .full {
        display: inline;
    }

    .th-label .mid,
    .th-label .short {
        display: none;
    }

    /* container queries statt viewport queries (Preview-Card hat contain:inline-size) */
    @container (max-width: 360px) {
        .th-label .full {
            display: none;
        }

        .th-label .mid {
            display: inline;
        }
    }

    @container (max-width: 280px) {
        .th-label .mid {
            display: none;
        }

        .th-label .short {
            display: inline;
        }
    }

    /* Übung wählen + Eigene Übung: immer untereinander */
    .field-row-stack {
        flex-direction: column;
        flex-wrap: nowrap;
        gap: .6rem;
        align-items: stretch;
    }

        .field-row-stack > * {
            width: 100%;
        }
</style>