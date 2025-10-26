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
                           placeholder="z. B. 30"
                           :readonly="!hasExerciseSelected"
                           @focus="!hasExerciseSelected && requireExercise('duration')" />
                </div>

                <div>
                    <label class="field-label" for="progress-weight">Körpergewicht ({{ unit }})</label>
                    <div class="input-with-extras">
                        <input id="progress-weight"
                               ref="weightInput"
                               type="number"
                               min="0"
                               step="0.5"
                               v-model.number="weightProxy"
                               class="input"
                               :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'" />
                        <ExtrasToggleButton :toggled="!!props.showExtras"
                                            title="Extras einblenden"
                                            aria-label="Extras einblenden"
                                            :extraClass="['btn-extras-chip','extras-align', !hasExerciseSelected ? 'disabled-chip' : '']"
                                            @click="() => { if (requireExercise('extras')) emit('update:showExtras', !props.showExtras) }" />
                    </div>
                </div>
            </div>

            <!-- Dehnung-Inputs -->
            <div v-else-if="inputType === 'dehnung'" class="modal-grid grid-2">
                <div>
                    <label class="field-label" for="stretch-duration">Dauer (Min)</label>
                    <input id="stretch-duration"
                           ref="durationInput"
                           type="number" min="1"
                           v-model.number="durationProxy"
                           class="input"
                           placeholder="z. B. 2"
                           :readonly="!hasExerciseSelected"
                           @focus="!hasExerciseSelected && requireExercise('duration')" />
                </div>

                <div>
                    <label class="field-label" for="stretch-sets">Sätze insgesamt</label>
                    <div class="input-with-extras">
                        <input id="stretch-sets"
                               type="number" min="1" max="7"
                               v-model.number="setsProxy"
                               class="input"
                               placeholder="z. B. 3"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('sets')" />
                    </div>
                </div>

                <!-- Körpergewicht (immer erlaubt) + Extras-Button daneben -->
                <div>
                    <label class="field-label" for="stretch-weight">Körpergewicht ({{ unit }})</label>
                    <div class="input-with-extras">
                        <input id="stretch-weight"
                               type="number" min="0" step="0.5"
                               v-model.number="weightProxy"
                               class="input"
                               :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'" />
                        <ExtrasToggleButton :toggled="!!props.showExtras"
                                            title="Extras einblenden"
                                            aria-label="Extras einblenden"
                                            :extraClass="['btn-extras-chip','extras-align', !hasExerciseSelected ? 'disabled-chip' : '']"
                                            @click="() => { if (requireExercise('extras')) emit('update:showExtras', !props.showExtras) }" />
                    </div>
                </div>

            </div>
            <!-- Kraft/Calisthenics (Standard) -->
            <div v-else class="modal-grid grid-2">
                <div>
                    <label class="field-label" for="progress-sets">Sätze insgesamt</label>
                    <input id="progress-sets" type="number" min="1" max="7"
                    v-model.number="setsProxy" class="input" placeholder="z. B. 3"
                    :readonly="!hasExerciseSelected"
                    @focus="!hasExerciseSelected && requireExercise('sets')" />
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
                                            :extraClass="['btn-extras-chip','extras-align', !hasExerciseSelected ? 'disabled-chip' : '']"
                                            @click="() => { if (requireExercise('extras')) emit('update:showExtras', !props.showExtras) }" />
                    </div>
                </div>
            </div>

            <!-- Einzelsätze (erscheint automatisch wenn Sätze > 0) -->
            <div v-if="(inputType === 'kraft' || inputType === 'calisthenics') && Number(setsProxy) > 0"
                 class="set-rows">
                <div v-for="(row, i) in setDetailsProxy" :key="i" class="set-row">
                    <div class="set-row-label">Satz {{ i + 1 }}</div>

                    <input type="number" min="0" step="0.5" class="input"
                           :placeholder="(inputType === 'calisthenics' ? (unit === 'kg' ? 'Zusatzgewicht' : 'Added weight') : (unit === 'kg' ? 'Gewicht' : 'Weight'))"
                           :value="row?.weight ?? ''"
                           :readonly="!hasExerciseSelected"
                           @focus="!hasExerciseSelected && requireExercise('set-weight')"
                           @input="onRowChange(i, 'weight', ($event.target as HTMLInputElement).valueAsNumber)" />

                    <input type="number" min="1" class="input" placeholder="Wdh."
                           :value="row?.reps ?? ''"
                           :readonly="!hasExerciseSelected"
                           @focus="!hasExerciseSelected && requireExercise('set-reps')"
                           @input="onRowChange(i, 'reps', ($event.target as HTMLInputElement).valueAsNumber)" />
                </div>
            </div>

            <div v-if="props.showExtras" class="extras-section grid-2">
                <!-- Kraft & Calisthenics -->
                <template v-if="inputType === 'kraft' || inputType === 'calisthenics'">
                    <div>
                        <label class="field-label" for="extra-tempo">Tempo</label>
                        <input id="extra-tempo" type="text" v-model="tempoProxy" class="input" placeholder="z. B. 3-1-1"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('tempo')" />
                    </div>
                    <div>
                        <label class="field-label" for="extra-rest">Pausenzeit (Sek.)</label>
                        <input id="extra-rest" type="number" min="0" step="5" v-model.number="restSecondsProxy" class="input" placeholder="z. B. 90"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('rest')" />
                    </div>
                </template>

                <!-- Ausdauer -->
                <!-- Ausdauer -->
                <template v-else-if="inputType === 'ausdauer'">
                    <div>
                        <label class="field-label" for="extra-distance">Distanz (km, optional)</label>
                        <input id="extra-distance" type="number" min="0" step="0.1"
                               v-model.number="distanceProxy" class="input" placeholder="z. B. 5"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('distance')" />
                    </div>

                    <div>
                        <label class="field-label" for="extra-avgHr">Durchschnittspuls (bpm)</label>
                        <input id="extra-avgHr" type="number" min="0" step="1"
                               v-model.number="avgHrProxy" class="input" placeholder="z. B. 145"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('avgHr')" />
                    </div>

                    <div>
                        <label class="field-label" for="extra-calories">Kalorienverbrauch (kcal)</label>
                        <input id="extra-calories" type="number" min="0" step="1"
                               v-model.number="caloriesProxy" class="input" placeholder="z. B. 350"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('calories')" />
                    </div>

                    <div>
                        <label class="field-label" for="extra-pace">Ø Pace (min/km)</label>
                        <input id="extra-pace" type="text" v-model="paceProxy"
                               class="input" placeholder="z. B. 5:20"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('pace')" />
                    </div>

                    <div>
                        <label class="field-label" for="extra-hrZone">Herzfrequenzzone</label>
                        <select id="extra-hrZone" v-model.number="hrZoneProxy" class="input select"
                                :disabled="!hasExerciseSelected">
                            <option :value="null" disabled>Herzfrequenzzone auswählen</option>
                            <option :value="1">Zone 1 – Sehr leicht</option>
                            <option :value="2">Zone 2 – Leicht</option>
                            <option :value="3">Zone 3 – Mittel</option>
                            <option :value="4">Zone 4 – Schwer</option>
                            <option :value="5">Zone 5 – Maximal</option>
                        </select>
                    </div>

                    <div>
                        <label class="field-label" for="extra-borg">Borg-Skala (6–20)</label>
                        <input id="extra-borg" ref="borgInput" type="number" inputmode="numeric"
                               min="6" max="20" step="1" v-model="borgLocal"
                               @focus="onBorgFocus" @blur="onBorgBlur"
                               class="input" placeholder="z. B. 13"
                               :readonly="!hasExerciseSelected"
                               @focus.capture="!hasExerciseSelected && requireExercise('borg')" />
                    </div>
                </template>


                <!-- Dehnung -->
                <template v-else-if="inputType === 'dehnung'">
                    <div>
                        <label class="field-label" for="extra-painFree">Schmerzfreiheit (1–10)</label>
                        <input id="extra-painFree" type="number" min="1" max="10" step="1" v-model.number="painFreeProxy" class="input" placeholder="z. B. 8"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('painFree')" />
                    </div>
                    <div>
                        <label class="field-label" for="extra-moveQuality">Bewegungsqualität (1–10)</label>
                        <input id="extra-moveQuality" type="number" min="1" max="10" step="1" v-model.number="movementQualityProxy" class="input" placeholder="z. B. 7"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('moveQuality')" />
                    </div>
                    <div>
                        <label class="field-label" for="extra-equipment">Hilfsmittel</label>
                        <select id="extra-equipment" v-model="equipmentProxy" class="input select"
                                :disabled="!hasExerciseSelected">
                            <option value="" disabled>Hilfsmittel auswählen</option>
                            <option value="Band">Band</option>
                            <option value="Rolle">Rolle</option>
                            <option value="Ball">Ball</option>
                            <option value="Stab">Stab</option>
                            <option value="custom">Benutzerdefiniert …</option>
                        </select>
                    </div>
                    <div v-if="equipmentProxy === 'custom'">
                        <label class="field-label" for="extra-equipment-custom">Eigenes Hilfsmittel</label>
                        <input v-if="equipmentProxy === 'custom'" id="extra-equipment-custom" type="text"
                               v-model="equipmentCustomProxy" class="input" placeholder="z. B. Theraband (grün), …"
                               :readonly="!hasExerciseSelected"
                               @focus="!hasExerciseSelected && requireExercise('equipmentCustom')" />
                    </div>
                    <div>
                        <label class="field-label" for="extra-side">Betroffene Seite</label>
                        <select id="extra-side" v-model="sideProxy" class="input select"
                                :disabled="!hasExerciseSelected">
                            <option value="" disabled>Seite auswählen</option>
                            <option value="links">Links</option>
                            <option value="rechts">Rechts</option>
                            <option value="beidseitig">Beidseitig</option>
                        </select>
                    </div>
                </template>
            </div>

            <label class="field-label" for="progress-note">Notiz (optional)</label>
            <input id="progress-note" type="text" v-model="noteProxy" class="input"
                   placeholder="RPE, Tempo, Feeling …"
                   :readonly="!hasExerciseSelected"
                   @focus="!hasExerciseSelected && requireExercise('note')" />

            <div class="modal-actions">
                <PopupDeleteButton v-if="props.isEditing"
                                   @click="onDelete">Löschen</PopupDeleteButton>

                <PopupCancelButton ariaLabel="Abbrechen" @click="onCancel" />
                <PopupSaveButton ariaLabel="Speichern" @click="onSave" />
            </div>

            <ValidationPopup :show="Boolean(errors && errors.length)"
                             :errors="errors || []"
                             @close="$emit('dismissErrors')" />

            <ValidationPopup :show="showBorgError"
                             :errors="borgErrors"
                             title="Ungültige Borg-Skala"
                             lead="Die Borg-Skala geht von 6 (sehr leicht) bis 20 (maximal)."
                             @close="onCloseBorgError" />

        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, ref, watch } from 'vue'
    import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'
    import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue' // ⬅️ NEU
    import PopupDeleteButton from '@/components/ui/buttons/PopupDeleteButton.vue' // ⬅️ NEU

    const equipmentCustomInput = ref<HTMLInputElement | null>(null)
    const equipmentProxy = computed({
        get: () => props.equipment ?? '',
        set: v => emit('update:equipment', v),
    })
    const borgInput = ref<HTMLInputElement | null>(null)
    const borgLocal = ref<string>('')
    const isEditingBorg = ref(false)
    const showBorgError = ref(false)
    const borgErrors = ref<string[]>([])

    const toStr = (v: unknown) => (v == null ? '' : String(v));

    const toNumber = (v: unknown): number | null => {
        const s = toStr(v).replace(',', '.').trim();
        if (!s) return null;
        const n = Number(s);
        return Number.isFinite(n) ? n : null;
    };

    function parseBorg(v: unknown): number | null {
        const n = toNumber(v);
        // optional: clamp + runden
        return n == null ? null : Math.round(n);
    }

    function openSyncBorg() {
        borgLocal.value = props.borg == null ? '' : String(props.borg)
    }

    function onBorgFocus() { isEditingBorg.value = true }

    function onBorgBlur() {
        isEditingBorg.value = false
        const n = parseBorg(borgLocal.value)

        if (n == null) {
            emit('update:borg', null)
            return
        }

        if (n < 6 || n > 20) {
            emit('invalid', [`Borg-Skala muss zwischen 6 und 20 liegen (dein Wert: ${n}).`])
            nextTick(() => borgInput.value?.focus())
            return
        }

        emit('update:borg', n)
    }

    function validateBorg() {
        const v = borgProxy.value
        if (v == null) return
        if (v < 6 || v > 20) {
            borgErrors.value = [`Borg-Skala muss zwischen 6 und 20 liegen (dein Wert: ${v}).`]
            showBorgError.value = true
        }
    }
    function onCloseBorgError() {
        showBorgError.value = false
        nextTick(() => borgInput.value?.focus())
    }

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

        inputType: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
        duration: number | null
        distance: number | null
        setDetails: SetDetail[]
        showExtras?: boolean

        // Extras: Kraft/Calisthenics
        tempo?: string
        restSeconds?: number | null

        // Extras: Ausdauer
        avgHr?: number | null
        calories?: number | null
        pace?: string
        hrZone?: number | null
        borg?: number | null
        isEditing?: boolean            // ⬅️ NEU: true = Eintrag wird bearbeitet

        // Extras: Dehnung
        painFree?: number | null
        movementQuality?: number | null
        equipment?: string | null
        equipmentCustom?: string | null
        side?: '' | 'links' | 'rechts' | 'beidseitig' | null
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
        (e: 'dismissErrors'): void
        (e: 'update:setDetails', v: SetDetail[]): void
        (e: 'update:showExtras', v: boolean): void

        // Extras
        (e: 'update:tempo', v: string): void
        (e: 'update:restSeconds', v: number | null): void
        (e: 'delete'): void           // ⬅️ NEU

        (e: 'update:avgHr', v: number | null): void
        (e: 'update:calories', v: number | null): void
        (e: 'update:pace', v: string): void
        (e: 'update:hrZone', v: number | null): void
        (e: 'update:borg', v: number | null): void

        (e: 'update:painFree', v: number | null): void
        (e: 'update:movementQuality', v: number | null): void
        (e: 'update:equipment', v: string): void
        (e: 'update:side', v: '' | 'links' | 'rechts' | 'beidseitig'): void
        (e: 'update:equipmentCustom', v: string): void
        (e: 'invalid', errors: string[]): void

    }>()

    function onDelete() {
        // Optional: confirm() einbauen, wenn du willst
        // if (!confirm('Eintrag wirklich löschen?')) return
        emit('delete')
    }

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
        emit('update:showExtras', false) // Extras zurücksetzen
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
    // Extras: Kraft/Calisthenics
    const tempoProxy = computed({
        get: () => props.tempo ?? '',
        set: v => emit('update:tempo', v),
    })
    const restSecondsProxy = computed({
        get: () => props.restSeconds ?? null,
        set: v => emit('update:restSeconds', v),
    })

    // Extras: Ausdauer
    const avgHrProxy = computed({
        get: () => props.avgHr ?? null,
        set: v => emit('update:avgHr', v),
    })
    const caloriesProxy = computed({
        get: () => props.calories ?? null,
        set: v => emit('update:calories', v),
    })
    const paceProxy = computed({
        get: () => props.pace ?? '',
        set: v => emit('update:pace', v),
    })
    const hrZoneProxy = computed({
        get: () => props.hrZone ?? null,
        set: v => emit('update:hrZone', v),
    })
    const borgProxy = computed({
        get: () => props.borg ?? null,
        set: v => emit('update:borg', v),
    })

    // Extras: Dehnung
    const painFreeProxy = computed({
        get: () => props.painFree ?? null,
        set: v => emit('update:painFree', v),
    })
    const movementQualityProxy = computed({
        get: () => props.movementQuality ?? null,
        set: v => emit('update:movementQuality', v),
    })
    const equipmentCustomProxy = computed({
        get: () => props.equipmentCustom ?? '',
        set: v => emit('update:equipmentCustom', v),
    })
    const sideProxy = computed({
        get: () => props.side ?? '',
        set: v => emit('update:side', v),
    })

    function onSave() {
        if (!hasExerciseSelected.value && (props.inputType !== 'kraft' && props.inputType !== 'calisthenics')) {
            if (!requireExercise('save')) return
        }
        if (props.inputType === 'ausdauer') {
            const n = parseBorg(borgLocal.value)
            if (n != null && (n < 6 || n > 20)) {
                emit('invalid', [`Borg-Skala muss zwischen 6 und 20 liegen (dein Wert: ${n}).`])
                nextTick(() => borgInput.value?.focus())
                return
            }
            emit('update:borg', n ?? null)
        }
        emit('save')
        nextTick(clearCache)
    }
    const hasExerciseSelected = computed(() =>
        !!(props.exercise && props.exercise.trim())
    )

    function requireExercise(_reason?: string): boolean {
        if (hasExerciseSelected.value) return true
        emit('invalid', ['Bitte wähle zuerst eine Übung, bevor du Werte eingibst.'])
        return false
    }

    /* 🔽 Neu: onSave als submit nach außen freigeben */
    defineExpose({
        submit: onSave
    })

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

        // Extras: Kraft/Calisthenics
        tempo?: string | null
        restSeconds?: number | null

        // Extras: Ausdauer
        avgHr?: number | null
        calories?: number | null
        pace?: string | null
        hrZone?: number | null
        borg?: number | null

        // Extras: Dehnung
        painFree?: number | null
        movementQuality?: number | null
        equipment?: string | null
        equipmentCustom?: string | null   // ⬅︎ hinzufügen
        side?: '' | 'links' | 'rechts' | 'beidseitig' | null
    }
    const draftCache = ref<Record<string, Draft>>({})

    function snapshot(ex: string, t: DraftType) {
        if (!ex) return
        const k = keyFor(ex, t)
        draftCache.value[k] = {
            type: t,
            sets: setsProxy.value ?? null,
            reps: repsProxy.value ?? null,
            setDetails: [...(setDetailsProxy.value ?? [])],
            duration: durationProxy.value ?? null,
            distance: distanceProxy.value ?? null,
            note: noteProxy.value ?? '',

            // Extras
            tempo: tempoProxy.value ?? null,
            restSeconds: restSecondsProxy.value ?? null,

            avgHr: avgHrProxy.value ?? null,
            calories: caloriesProxy.value ?? null,
            pace: paceProxy.value || null,
            hrZone: hrZoneProxy.value ?? null,
            borg: borgProxy.value ?? null,

            painFree: painFreeProxy.value ?? null,
            movementQuality: movementQualityProxy.value ?? null,
            equipment: equipmentProxy.value || null,
            equipmentCustom: equipmentCustomProxy.value || null,
            side: sideProxy.value || null,
        }
    }
    function resetForType(t: DraftType) {
        emit('update:setDetails', [])
        emit('update:note', '')

        // allgemeine Defaults
        emit('update:duration', null)
        emit('update:distance', null)
        emit('update:reps', null)

        // Extras zurücksetzen
        emit('update:tempo', '')
        emit('update:restSeconds', null)

        emit('update:avgHr', null)
        emit('update:calories', null)
        emit('update:pace', '')
        emit('update:hrZone', null)
        emit('update:borg', null)

        emit('update:painFree', null)
        emit('update:movementQuality', null)
        emit('update:equipment', '')
        emit('update:equipmentCustom', '')
        emit('update:side', '')

        if (t === 'ausdauer') {
            emit('update:sets', null)
        } else if (t === 'dehnung') {
            emit('update:sets', null)
        } else {
            // kraft/calisthenics
            emit('update:sets', null)
        }
        nextTick(() => openSyncBorg())   // ⬅️ HINZUFÜGEN

    }
    function restore(ex: string, t: DraftType) {
        if (!ex) { resetForType(t); return }
        const k = keyFor(ex, t)
        const d = draftCache.value[k]
        if (d) {
            emit('update:sets', d.sets)
            emit('update:reps', d.reps)
            emit('update:setDetails', [...d.setDetails])
            emit('update:duration', d.duration)
            emit('update:distance', d.distance)
            emit('update:note', d.note)

            // Extras
            emit('update:tempo', d.tempo ?? '')
            emit('update:restSeconds', d.restSeconds ?? null)

            emit('update:avgHr', d.avgHr ?? null)
            emit('update:calories', d.calories ?? null)
            emit('update:pace', d.pace ?? '')
            emit('update:hrZone', d.hrZone ?? null)
            emit('update:borg', d.borg ?? null)

            emit('update:painFree', d.painFree ?? null)
            emit('update:movementQuality', d.movementQuality ?? null)
            emit('update:equipment', d.equipment ?? '')
            emit('update:equipmentCustom', d.equipmentCustom ?? '')
            emit('update:side', d.side ?? '')
        } else {
            resetForType(t)
        }

        nextTick(() => openSyncBorg())   // ⬅️ HINZUFÜGEN

    }
    function snapshotCurrentExercise() {
        const ex = (exerciseProxy.value || '').trim()
        if (!ex) return
        draftCache.value[ex] = {
            type: props.inputType,
            sets: setsProxy.value ?? null,
            reps: repsProxy.value ?? null,
            setDetails: [...(setDetailsProxy.value ?? [])],
            duration: durationProxy.value ?? null,
            distance: distanceProxy.value ?? null,
            note: noteProxy.value ?? '',

            tempo: tempoProxy.value ?? null,
            restSeconds: restSecondsProxy.value ?? null,

            avgHr: avgHrProxy.value ?? null,
            calories: caloriesProxy.value ?? null,
            pace: paceProxy.value || null,
            hrZone: hrZoneProxy.value ?? null,
            borg: borgProxy.value ?? null,

            painFree: painFreeProxy.value ?? null,
            movementQuality: movementQualityProxy.value ?? null,
            equipment: equipmentProxy.value || null,
            equipmentCustom: equipmentCustomProxy.value || null,
            side: sideProxy.value || null,
        } as Draft
    }

    function restoreExerciseDraft(ex: string) {
        const d = draftCache.value[ex]
        if (d) {
            emit('update:sets', d.sets)
            emit('update:reps', d.reps)
            emit('update:setDetails', [...d.setDetails])
            emit('update:duration', d.duration)
            emit('update:distance', d.distance)
            emit('update:note', d.note)

            emit('update:tempo', d.tempo ?? '')
            emit('update:restSeconds', d.restSeconds ?? null)

            emit('update:avgHr', d.avgHr ?? null)
            emit('update:calories', d.calories ?? null)
            emit('update:pace', d.pace ?? '')
            emit('update:hrZone', d.hrZone ?? null)
            emit('update:borg', d.borg ?? null)

            emit('update:painFree', d.painFree ?? null)
            emit('update:movementQuality', d.movementQuality ?? null)
            emit('update:equipment', d.equipment ?? '')
            emit('update:equipmentCustom', d.equipmentCustom ?? '')
            emit('update:side', d.side ?? '')
        } else {
            emit('update:setDetails', [])
            emit('update:sets', null)
            emit('update:reps', null)
            emit('update:duration', null)
            emit('update:distance', null)
            emit('update:note', '')

            emit('update:tempo', '')
            emit('update:restSeconds', null)

            emit('update:avgHr', null)
            emit('update:calories', null)
            emit('update:pace', '')
            emit('update:hrZone', null)
            emit('update:borg', null)

            emit('update:painFree', null)
            emit('update:movementQuality', null)
            emit('update:equipment', '')
            emit('update:equipmentCustom', '')
            emit('update:side', '')
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

    watch(equipmentProxy, (val, prev) => {
        if (val !== 'custom' && equipmentCustomProxy.value) {
            emit('update:equipmentCustom', '')
        }
        if (val === 'custom') {
            nextTick(() => equipmentCustomInput.value?.focus())
        }
    })

    watch(() => props.show, v => {
        if (v) {
            focusFirst()
            nextTick(() => openSyncBorg())   // ⬅️ sync nach Render
        } else {
            emit('update:showExtras', false)
        }
    })

    onMounted(() => {
        if (props.show) {
            focusFirst()
            nextTick(() => openSyncBorg())
        }
    })

    watch(setsProxy, (n) => {
        let raw = Number(n) || 0

        // NEU: max 7 Sätze + Validierungspopup
        if (raw > 7) {
            emit('invalid', ['Maximal 7 Sätze erlaubt.'])
            raw = 7
            // zurücksetzen auf 7 (verhindert >7 via Tastatur/Paste)
            emit('update:sets', 7)
        }

        const count = Math.max(0, raw)
        const next = [...setDetailsProxy.value]

        if (count > next.length) {
            for (let i = next.length; i < count; i++) {
                next.push({ weight: null, reps: repsProxy.value ?? null })
            }
        } else if (count < next.length) {
            next.splice(count)
        }
        emit('update:setDetails', next)
    })


    function onRowChange(i: number, field: 'weight' | 'reps', val: number | null) {
        if (!hasExerciseSelected.value) { requireExercise('set-row'); return }
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
        /* NEU: begrenzen + scrollbar */
        max-height: 88vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
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
    /* Extras Section – clean & modern */
    .extras-section {
        margin-top: .75rem;
        padding-top: .75rem;
        border-top: 1px solid var(--border-color);
        animation: extrasFade .25s ease;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .75rem;
    }

    @media (max-width: 520px) {
        .extras-section {
            grid-template-columns: 1fr;
        }
    }

    @keyframes extrasFade {
        from {
            opacity: 0;
            transform: translateY(4px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
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

    .input[readonly] {
        opacity: .7;
        cursor: not-allowed;
    }

    .select:disabled {
        opacity: .7;
        cursor: not-allowed;
    }

    .disabled-chip {
        opacity: .6;
        cursor: not-allowed;
    }

    /* etwas enger auf sehr kleinen Screens */
    @media (max-width:560px) {
        .input-with-extras {
            gap: .4rem;
        }
    }
    /* Zwei-Spalten: gleiche Label-Zeilenhöhe, Inputs bündig */
    .modal-grid.grid-2 > div {
        display: grid;
        grid-template-rows: 1.7rem auto; /* mehr Platz für die Label-Zeile */
    }

    /* Label in grid-2 etwas höher und mit mehr Abstand zum Input */
    .modal-grid.grid-2 .field-label {
        font-size: .95rem; /* etwas größer lesbar */
        line-height: 1.6rem; /* passt zur 1.7rem-Row */
        margin: .20rem 0 .15rem; /* extra Abstand zum Input */
        white-space: nowrap; /* einzeilig -> Spalten bleiben bündig */
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Leicht kompaktere Reihe ohne Auswirkung auf Ausrichtung */
    .modal-grid.grid-2 {
        gap: .6rem 1rem;
    }

        .modal-grid.grid-2 .input {
            padding: .6rem .8rem;
        }

        .modal-grid.grid-2 .btn-extras-chip {
            padding: .42rem .54rem;
        }

    @media (max-width: 520px) {
        .modal-grid.grid-2 > div {
            display: block;
        }

        .modal-grid.grid-2 .field-label {
            font-size: .9rem;
            line-height: 1.2;
            margin: .5rem 0 .25rem;
            white-space: normal;
        }
    }
    /* === FIX: Input bleibt breit, Button wrappt sauber bei langem Label === */
    .input-with-extras > .input {
        width: auto; /* überschreibt .input { width:100% } im Kombi-Layout */
        min-width: 0; /* lässt Flex korrekt rechnen */
    }

    /* --- Cardio-Reihe: immer einzeilig, nichts wrappt --- */
    .grid-cardio {
        /* linke Spalte nur so breit wie Label + kleiner Dauer-Input */
        grid-template-columns: max-content 1fr;
        column-gap: 1rem;
        align-items: end;
    }

        /* Dauer-Input bewusst klein halten */
        .grid-cardio #progress-duration {
            width: 7.5ch;
            max-inline-size: 7.5ch;
            padding: .5rem .6rem;
        }

        /* Label in Cardio links nie umbrechen (spart Platz) */
        .grid-cardio > div:first-child .field-label {
            white-space: nowrap;
        }

        /* Distanz + Toggle: strikt nebeneinander */
        .grid-cardio .input-with-extras {
            display: grid !important;
            grid-template-columns: minmax(12rem, 1fr) auto !important; /* Input füllt, Chip nur so breit wie nötig */
            align-items: center;
            column-gap: .5rem;
            row-gap: 0;
        }

        /* Chip kompakt + ellipsis bei langem Text */
        .grid-cardio .btn-extras-chip {
            padding: .42rem .54rem;
            max-inline-size: 12rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

    @media (min-width: 961px) {
        /* Mehr Platz, damit Input + Chip nebeneinander passen */
        .modal {
            width: min(880px, 92vw);
        }

        /* Zwei gleich breite Spalten mit guter Mindestbreite */
        .modal-grid.grid-2 {
            grid-template-columns: repeat(2, minmax(380px, 1fr));
            gap: 1rem;
            align-items: end;
        }

            /* Container: Label oben, darunter die Inhaltsebene */
            .modal-grid.grid-2 > div {
                display: grid;
                grid-template-columns: 1fr;
                grid-template-rows: 1.7rem auto;
                align-items: end;
            }

                /* Labels einzeilig lassen */
                .modal-grid.grid-2 > div .field-label {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* WICHTIG: Chip NICHT überlagern -> echte 2-Spalten-Zeile */
                .modal-grid.grid-2 > div .input-with-extras {
                    display: grid !important;
                    grid-template-columns: 1fr auto; /* Input | Chip */
                    gap: .5rem;
                    align-items: center;
                }

                    /* Einheitliche Input-Höhe/Breite */
                    .modal-grid.grid-2 .input,
                    .modal-grid.grid-2 > div .input-with-extras > .input,
                    .modal-grid.grid-2 > div > .input {
                        width: 100%;
                        min-width: 0;
                        padding: .72rem 1rem;
                        font-size: .95rem;
                        line-height: 1.2;
                        box-sizing: border-box;
                    }

                /* Chip normal rechts ausrichten, ohne absolute Pos. */
                .modal-grid.grid-2 > div .extras-align {
                    position: static;
                    justify-self: end;
                }

        /* Cardio-Reihe: ebenfalls nebeneinander ohne Wrap */
        .grid-cardio {
            grid-template-columns: repeat(2, minmax(380px, 1fr));
            column-gap: 1rem;
            align-items: end;
        }

            .grid-cardio .input-with-extras {
                display: grid !important;
                grid-template-columns: 1fr auto;
                gap: .5rem;
                align-items: center;
            }

            .grid-cardio #progress-duration {
                width: 100%;
                max-inline-size: none;
                inline-size: auto;
                padding-right: 1rem;
            }
    }


    /* Mobile bleibt 1-spaltig */
    @media (max-width: 520px) {
        .grid-cardio {
            grid-template-columns: 1fr;
        }
    }
</style>
