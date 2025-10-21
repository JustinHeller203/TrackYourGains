<template>
    <div v-if="show" class="modal-overlay" @click="onOverlayClick">
        <div class="modal"
             role="dialog"
             aria-modal="true"
             @click.stop>
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

                <div>
                    <label class="field-label" for="stretch-reps">Wiederholungen</label>
                    <input id="stretch-reps"
                           type="number" min="1"
                           v-model.number="repsProxy"
                           class="input"
                           placeholder="z. B. 30" />
                </div>
            </div>


            <!-- Kraft/Calisthenics (Standard) -->
            <div v-else class="modal-grid">
                <div>
                    <label class="field-label" for="progress-sets">Sätze insgesamt</label>
                    <input id="progress-sets" type="number" min="1"
                           v-model.number="setsProxy" class="input" placeholder="z. B. 3" />
                </div>

                <div>
                    <label class="field-label" for="progress-weight">Gewicht ({{ unit }})</label>
                    <input id="progress-weight" ref="weightInput" type="number" min="0" step="0.5"
                           v-model.number="weightProxy" class="input"
                           :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'" />
                </div>

                <div>
                    <label class="field-label" for="progress-reps">Wiederholungen</label>
                    <input id="progress-reps" type="number" min="1"
                           v-model.number="repsProxy" class="input" placeholder="z. B. 8" />
                </div>
            </div>

            <!-- Einzelsätze (erscheint automatisch wenn Sätze > 0) -->
            <div v-if="Number(setsProxy) > 0" class="set-rows">
                <div v-for="(row, i) in setDetailsProxy" :key="i" class="set-row">
                    <div class="set-row-label">Satz {{ i + 1 }}</div>

                    <input type="number" min="0" step="0.5"
                           class="input"
                           :placeholder="unit === 'kg' ? 'Gewicht' : 'Weight'"
                           :value="row?.weight ?? ''"
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
        setDetails: SetDetail[]           // <-- NEU
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

    }>()

    const setDetailsProxy = computed<SetDetail[]>({
        get: () => props.setDetails ?? [],
        set: v => emit('update:setDetails', v),
    })

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
        emit('save') // Parent validiert & speichert; schließt anschließend selbst
    }

    function onOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget) onCancel()
    }

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
                next.push({ weight: weightProxy.value ?? null, reps: repsProxy.value ?? null })
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
        grid-template-columns: repeat(2, 1fr);
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

</style>
