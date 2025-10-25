<!--ProgressEntryModal.vue-->
<template>
    <div v-if="show"
         class="modal-overlay"
         @pointerdown="onOverlayPointerDown"
         @pointerup="onOverlayPointerUp">
        <div class="modal" role="dialog" aria-modal="true" @click.stop>
            <h3 class="modal-title">📥 Fortschritt eintragen</h3>

            <label class="field-label" for="progress-exercise">Übung</label>
            <select id="progress-exercise"
                    ref="exerciseSelect"
                    v-model="exerciseProxy"
                    class="input select">
                <option value="" disabled>Übung wählen</option>
                <option v-for="ex in exercises"
                        :key="ex.exercise"
                        :value="ex.exercise">
                    {{ ex.exercise }}
                </option>
            </select>


            <!-- Cardio-Inputs -->
            <div v-if="inputType === 'ausdauer'" class="modal-grid grid-2">
                <div>
                    <label class="field-label" for="progress-duration">Dauer (Min)</label>
                    <input id="progress-duration"
                           ref="durationInput"
                           type="number"
                           min="1"
                           v-model.number="durationProxy"
                           class="input"
                           placeholder="z. B. 30" />
                </div>

                <div>
                    <label class="field-label" for="progress-distance">Distanz (km, optional)</label>
                    <input id="progress-distance"
                           type="number"
                           min="0"
                           step="0.1"
                           v-model.number="distanceProxy"
                           class="input"
                           placeholder="z. B. 5" />
                </div>
            </div>

            <!-- Dehnung-Inputs -->
            <div v-else-if="inputType === 'dehnung'" class="modal-grid">
                <div>
                    <label class="field-label" for="stretch-duration">Dauer (Min)</label>
                    <input id="stretch-duration"
                           ref="durationInput"
                           type="number" min="1"
                           v-model.number="durationProxy"
                           class="input"
                           placeholder="z. B. 2" />
                </div>

                <div>
                    <label class="field-label" for="stretch-sets">Sätze insgesamt</label>
                    <input id="stretch-sets"
                           type="number" min="1"
                           v-model.number="setsProxy"
                           class="input"
                           placeholder="z. B. 3" />
                </div>
            </div>

            <!-- Kraft/Calisthenics (Standard) -->
            <div v-else class="modal-grid grid-2">
                <div>
                    <label class="field-label" for="progress-sets">Sätze insgesamt</label>
                    <input id="progress-sets" type="number" min="1"
                           v-model.number="setsProxy" class="input" placeholder="z. B. 3" />
                </div>

                <div>
                    <label class="field-label" for="progress-weight">Körpergewicht ({{ unit }})</label>
                    <div class="input-with-extras">
                        <input id="progress-weight"
                               ref="weightInput"
                               type="number" min="0" step="0.5"
                               v-model.number="weightProxy"
                               class="input"
                               :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'" />

                        <!-- WICHTIG: Klasse für Chip-Optik + rechts ausrichten -->
                        <ExtrasToggleButton :toggled="!!props.showExtras"
                                            title="Extras einblenden"
                                            aria-label="Extras einblenden"
                                            :extraClass="['btn-extras-chip','extras-align']"
                                            @click="emit('update:showExtras', !props.showExtras)" />
                    </div>
                </div>
            </div>

            <!-- Einzelsätze (erscheint automatisch wenn Sätze > 0) -->
            <div v-if="(inputType === 'kraft' || inputType === 'calisthenics') && Number(setsProxy) > 0"
                 class="set-rows">
                <div v-for="(row, i) in setDetailsProxy" :key="i" class="set-row">
                    <div class="set-row-label">Satz {{ i + 1 }}</div>

                    <input type="number" min="0" step="0.5"
                           class="input"
                           :placeholder="(inputType === 'calisthenics'
  ? (unit === 'kg' ? 'Zusatzgewicht' : 'Added weight')
  : (unit === 'kg' ? 'Gewicht' : 'Weight'))" :value="row?.weight ?? ''"
                           @input="onRowChange(i, 'weight', ($event.target as HTMLInputElement).valueAsNumber)" />

                    <input type="number" min="1"
                           class="input"
                           placeholder="Wdh."
                           :value="row?.reps ?? ''"
                           @input="onRowChange(i, 'reps', ($event.target as HTMLInputElement).valueAsNumber)" />
                </div>
            </div>


            <label class="field-label" for="progress-note">Notiz (optional)</label>
            <input id="progress-note"
                   type="text"
                   v-model="noteProxy"
                   class="input"
                   placeholder="RPE, Tempo, Feeling …" />

            <div class="modal-actions">
                <PopupCancelButton ariaLabel="Abbrechen" @click="onCancel" />
                <PopupSaveButton ariaLabel="Speichern" @click="onSave" />
            </div>

            <ValidationPopup :show="Boolean(errors && errors.length)"
                             :errors="errors || []"
                             @close="$emit('dismissErrors')" />

        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, ref, watch } from 'vue'
    import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'
    import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue' // ⬅️ NEU

    type Unit = 'kg' | 'lbs'
    interface PlanExercise {
        exercise: string
        sets: number
        reps: number
        goal?: string
    }

    type SetDetail = { weight: number | null; reps: number | null }

    const props = defineProps<{
        show: boolean
        unit: Unit
        exercises: PlanExercise[]
        exercise: string
        sets: number | null
        weight: number | null
        reps: number | null
        note: string
        errors?: string[]
        // ▼ neu:
        inputType: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
        duration: number | null
        distance: number | null
        setDetails: SetDetail[]
        showExtras?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:show', v: boolean): void
        (e: 'update:exercise', v: string): void
        (e: 'update:sets', v: number | null): void
        (e: 'update:weight', v: number | null): void
        (e: 'update:reps', v: number | null): void
        (e: 'update:note', v: string): void
        (e: 'update:duration', v: number | null): void
        (e: 'update:distance', v: number | null): void
        (e: 'save'): void
        (e: 'cancel'): void
        (e: 'dismissErrors'): void            // ⬅️ NEU
        (e: 'update:setDetails', v: SetDetail[]): void
        (e: 'update:showExtras', v: boolean): void
    }>()

    const setDetailsProxy = computed<SetDetail[]>({
        get: () => props.setDetails ?? [],
        set: v => emit('update:setDetails', v),
    })
    const keyFor = (ex: string, t: DraftType) => (ex ? `${ex}::${t}` : '')

    /** Proxys für saubere v-model:foo Bindings */
    const exerciseProxy = computed({
        get: () => props.exercise,
        set: v => emit('update:exercise', v),
    })
    const setsProxy = computed({
        get: () => props.sets,
        set: v => emit('update:sets', v),
    })
    const weightProxy = computed({
        get: () => props.weight,
        set: v => emit('update:weight', v),
    })
    const repsProxy = computed({
        get: () => props.reps,
        set: v => emit('update:reps', v),
    })
    const noteProxy = computed({
        get: () => props.note,
        set: v => emit('update:note', v),
    })

    const exerciseSelect = ref<HTMLSelectElement | null>(null)
    const weightInput = ref<HTMLInputElement | null>(null)
    const durationInput = ref<HTMLInputElement | null>(null) // ▼ neu

    function focusFirst() {
        nextTick(() => {
            exerciseSelect.value?.focus()
            nextTick(() => {
                (props.inputType === 'ausdauer' || props.inputType === 'dehnung'
                    ? durationInput.value
                    : weightInput.value
                )?.focus()
            })
        })
    }

    function onCancel() {
        clearCache()
        emit('update:show', false)
        emit('cancel')
    }
    const durationProxy = computed({
        get: () => props.duration,
        set: v => emit('update:duration', v),
    })
    const distanceProxy = computed({
        get: () => props.distance,
        set: v => emit('update:distance', v),
    })
    function onSave() {
        emit('save')
        nextTick(clearCache) // nach dem Speichern nicht weiter vorhalten
    }

    const overlayDown = ref(false)
    const overlayStart = ref<{ x: number; y: number } | null>(null)

    function onOverlayPointerDown(e: PointerEvent) {
        if (e.target !== e.currentTarget) { overlayDown.value = false; return }
        overlayDown.value = true
        overlayStart.value = { x: e.clientX, y: e.clientY }
    }

    function onOverlayPointerUp(e: PointerEvent) {
        if (!overlayDown.value) return
        if (e.target !== e.currentTarget) { overlayDown.value = false; return }

        const start = overlayStart.value
        const moved = start ? Math.hypot(e.clientX - start.x, e.clientY - start.y) : 0
        const hasSelection = !!(window.getSelection && window.getSelection()?.toString())

        if (moved < 6 && !hasSelection) onCancel()  // ✅ nur „absichtlicher“ Klick
        overlayDown.value = false
        overlayStart.value = null
    }
    type DraftType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
    type Draft = {
        type: DraftType
        sets: number | null
        reps: number | null
        setDetails: SetDetail[]
        duration: number | null
        distance: number | null
        note: string
    }
    const draftCache = ref<Record<string, Draft>>({})

    function snapshot(ex: string, t: DraftType) {
        if (!ex) return
        const k = keyFor(ex, t)
        draftCache.value[k] = {
            type: t,
            sets: setsProxy.value ?? null,
            // weight: weightProxy.value ?? null,  ⬅️ raus
            reps: repsProxy.value ?? null,
            setDetails: [...(setDetailsProxy.value ?? [])],
            duration: durationProxy.value ?? null,
            distance: distanceProxy.value ?? null,
            note: noteProxy.value ?? ''
        }
    }

    function resetForType(t: DraftType) {
        emit('update:setDetails', [])
        emit('update:note', '')
        if (t === 'ausdauer') {
            emit('update:duration', null)
            emit('update:distance', null)
            emit('update:sets', null)
            // emit('update:weight', null) ⬅️ NICHT anfassen (global!)
            emit('update:reps', null)
        } else if (t === 'dehnung') {
            emit('update:duration', null)
            emit('update:sets', null)
            // emit('update:weight', null) ⬅️ NICHT
            emit('update:reps', null)
        } else {
            // kraft/calisthenics
            emit('update:sets', null)
            // emit('update:weight', null) ⬅️ NICHT
            emit('update:reps', null)
            emit('update:duration', null)
            emit('update:distance', null)
        }
    }


    function restore(ex: string, t: DraftType) {
        if (!ex) { resetForType(t); return }
        const k = keyFor(ex, t)
        const d = draftCache.value[k]
        if (d) {
            emit('update:sets', d.sets)
            // emit('update:weight', d.weight) ⬅️ raus
            emit('update:reps', d.reps)
            emit('update:setDetails', [...d.setDetails])
            emit('update:duration', d.duration)
            emit('update:distance', d.distance)
            emit('update:note', d.note)
        } else {
            resetForType(t)
        }
    }


    function snapshotCurrentExercise() {
        const ex = (exerciseProxy.value || '').trim()
        if (!ex) return
        draftCache.value[ex] = {
            type: props.inputType,
            sets: setsProxy.value ?? null,
            weight: weightProxy.value ?? null,
            reps: repsProxy.value ?? null,
            setDetails: [...(setDetailsProxy.value ?? [])],
            duration: durationProxy.value ?? null,
            distance: distanceProxy.value ?? null,
            note: noteProxy.value ?? ''
        }
    }

    function restoreExerciseDraft(ex: string) {
        const d = draftCache.value[ex]
        if (d) {
            emit('update:sets', d.sets)
            emit('update:weight', d.weight)
            emit('update:reps', d.reps)
            emit('update:setDetails', [...d.setDetails])
            emit('update:duration', d.duration)
            emit('update:distance', d.distance)
            emit('update:note', d.note)
        } else {
            // frische Felder, nichts „mitschleppen“
            emit('update:setDetails', [])
            emit('update:sets', null)
            emit('update:weight', null)
            emit('update:reps', null)
            emit('update:duration', null)
            emit('update:distance', null)
            emit('update:note', '')
        }
    }

    function clearCache() {
        draftCache.value = {}
    }

    watch(() => props.inputType, (nextType, prevType) => {
        const ex = exerciseProxy.value || ''
        if (!ex) return
        if (prevType) snapshot(ex, prevType)  // alten Typ sichern
        nextTick(() => restore(ex, nextType)) // neuen Typ laden / defaults
    })

    watch(exerciseProxy, (nextEx, prevEx) => {
        const t = props.inputType
        if (prevEx) snapshot(prevEx, t)       // alten Zustand sichern (alte Übung + aktueller Typ)
        nextTick(() => restore(nextEx || '', t)) // neuen Zustand laden / defaults für diesen Typ
    })


    watch(() => props.show, v => {
        if (v) focusFirst()
    })

    onMounted(() => {
        if (props.show) focusFirst()
    })

    watch(setsProxy, (n) => {
        const count = Math.max(0, Number(n) || 0)
        const next = [...setDetailsProxy.value]
        if (count > next.length) {
            for (let i = next.length; i < count; i++) {
                // ⬇️ NICHT mehr weightProxy als Default
                next.push({ weight: null, reps: repsProxy.value ?? null })
            }
        } else if (count < next.length) {
            next.splice(count)
        }
        emit('update:setDetails', next)
    })

    function onRowChange(i: number, field: 'weight' | 'reps', val: number | null) {
        const next = setDetailsProxy.value.map((r, idx) =>
            idx === i ? { ...r, [field]: val } : r
        )
        emit('update:setDetails', next)
    }
</script>

<style scoped>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.4);
        display: grid;
        place-items: center;
        z-index: 60;
    }

    .modal {
        width: min(560px, 92vw);
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--shadow);
        padding: 1rem 1rem 0.75rem;
    }

    .modal-title {
        font-weight: 700;
        margin: .25rem 0 0.75rem;
    }

    .field-label {
        display: block;
        font-size: .9rem;
        color: var(--text-secondary);
        margin: .5rem 0 .25rem;
    }

    .input {
        width: 100%;
        padding: .6rem .75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

        .input:focus {
            outline: none;
            border-color: var(--accent-primary);
        }

    .select {
        appearance: auto;
    }

    .modal-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: .75rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: .5rem;
        margin-top: .9rem;
    }

    .errors {
        margin: .75rem 0 1rem;
        color: #b91c1c;
        font-size: .9rem;
    }

    @media (max-width: 520px) {
        .modal-grid {
            grid-template-columns: 1fr;
        }
    }

    .modal-grid.grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        align-items: center; /* statt end -> mittig */
        gap: 1rem;
    }

    .input {
        width: 100%;
        padding: .7rem 0.9rem; /* größerer Input */
        font-size: 0.9rem; /* besser lesbar */
    }

    @media (max-width: 520px) {
        .modal-grid.grid-2 {
            grid-template-columns: 1fr;
        }
    }

    .set-rows {
        margin-top: .5rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: .4rem;
    }

    .set-row {
        display: grid;
        grid-template-columns: 90px 1fr 1fr;
        gap: .5rem;
        align-items: center;
    }

    .set-row-label {
        font-size: .9rem;
        color: var(--text-secondary);
    }

    @media (max-width: 520px) {
        .set-row {
            grid-template-columns: 80px 1fr 1fr;
        }
    }

    .select option[disabled] {
        color: var(--text-secondary);
    }
    /* Input + Toggle nebeneinander, stabil */
    .input-with-extras {
        display: grid;
        grid-template-columns: minmax(0,1fr) auto; /* Input dehnt sich, Button so breit wie nötig */
        align-items: center;
        gap: .5rem;
    }

    /* Chip-Optik (überschreibt BaseButton-Defaults: keine volle Breite) */
    .btn-extras-chip {
        display: inline-flex;
        width: auto;
        margin: 0;
        padding: .5rem .6rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 600;
        line-height: 1;
        white-space: nowrap; /* kein Umbruch des Labels */
    }

    /* Button an das rechte Grid-Ende pinnen */
    .extras-align {
        justify-self: end;
    }

    .btn-extras-chip:hover {
        background: var(--bg-secondary);
        border-color: var(--accent-primary);
        color: var(--accent-primary);
        transform: translateY(-1px);
    }

    .btn-extras-chip.active {
        border-color: var(--accent-primary);
        color: var(--accent-primary);
    }

    /* etwas kompakter auf sehr kleinen Screens */
    @media (max-width:560px) {
        .input-with-extras {
            gap: .4rem;
        }

        .btn-extras-chip {
            padding: .5rem .55rem;
        }
    }

    /* Chip-Optik für den Toggle (wird über :extraClass gesetzt) */
    .btn-extras-chip {
        padding: .5rem .6rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 600;
        line-height: 1;
    }

        .btn-extras-chip:hover {
            background: var(--bg-secondary);
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: translateY(-1px);
        }

        .btn-extras-chip.active {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
        }

    @media (max-width:560px) {
        .input-with-extras {
            gap: .4rem;
        }
    }
    /* Legt Input + Button in eine feste 2-Spalten-Reihe */
    .input-with-extras {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: .5rem;
        align-items: center;
    }

    /* BaseButton-Defaults überstimmen: NICHT volle Breite */
    .btn-extras-chip {
        display: inline-flex; /* wichtig */
        width: auto; /* wichtig */
        margin: 0; /* sicherheitshalber */
        padding: .5rem .6rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 600;
        line-height: 1;
    }

        .btn-extras-chip:hover {
            background: var(--bg-secondary);
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: translateY(-1px);
        }

        .btn-extras-chip.active {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
        }

    /* etwas enger auf sehr kleinen Screens */
    @media (max-width:560px) {
        .input-with-extras {
            gap: .4rem;
        }
    }
</style>
