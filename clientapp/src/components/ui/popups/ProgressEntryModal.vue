<!--pfad: components/ui/popups/ProgressEntryModal.vue-->
<template>
    <BasePopup :show="showProxy"
               title="📝 Fortschritt eintragen"
               overlayClass="progress-entry-popup"
               :showClose="true"
               @cancel="onCancel">

        <div class="modal" @click.stop>
            <UiPopupSelect id="progress-exercise"
                           ref="exerciseSelect"
                           label="Übung"
                           placeholder="Übung wählen"
                           v-model="exerciseLocal"
                           :options="exerciseOptions" />

            <div class="exercise-gap"></div>

            <!-- Cardio-Inputs -->
            <div v-if="inputType === 'ausdauer'" class="modal-grid grid-2 grid-cardio">
                <div>
                    <UiPopupInput id="progress-duration"
                                  ref="durationInput"
                                  label="Dauer (Min)"
                                  type="number"
                                  inputmode="numeric"
                                  min="1"
                                  step="1"
                                  v-model="durationTextLocal"
                                  placeholder="z. B. 30"
                                  :readonly="!hasExerciseSelected"
                                  @focus="!hasExerciseSelected && requireExercise('duration')" />

                </div>

                <div>
                    <div class="input-with-extras">
                        <UiPopupInput id="progress-weight"
                                      ref="weightInput"
                                      :label="`Körpergewicht (${unit ?? 'kg'})`"
                                      type="number"
                                      inputmode="decimal"
                                      min="0"
                                      step="0.5"
                                      v-model="weightTextLocal"
                                      :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'"
                                      :readonly="false" />

                        <ExtrasToggleButton :toggled="showExtrasLocal"
                                            title="Extras einblenden"
                                            aria-label="Extras einblenden"
                                            :extraClass="['btn-extras-chip','extras-align', !hasExerciseSelected ? 'disabled-chip' : '']"
                                            @click="() => { if (requireExercise('extras')) showExtrasLocal = !showExtrasLocal }" />
                    </div>
                </div>

            </div>

            <!-- Dehnung-Inputs -->
            <div v-else-if="inputType === 'dehnung'" class="modal-grid grid-2">
                <div>
                    <UiPopupInput id="stretch-sets"
                                  label="Sätze insgesamt"
                                  type="number"
                                  inputmode="numeric"
                                  min="1"
                                  max="7"
                                  step="1"
                                  v-model="setsTextLocal"
                                  placeholder="z. B. 3"
                                  :readonly="!hasExerciseSelected"
                                  @focus="!hasExerciseSelected && requireExercise('sets')" />
                </div>

                <div>
                    <div class="input-with-extras">
                        <UiPopupInput id="stretch-weight"
                                      ref="weightInput"
                                      :label="`Körpergewicht (${unit})`"
                                      type="number"
                                      inputmode="decimal"
                                      min="0"
                                      step="0.5"
                                      v-model="weightTextLocal"
                                      :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'"
                                      :readonly="false" />

                        <ExtrasToggleButton :toggled="showExtrasLocal"
                                            title="Extras einblenden"
                                            aria-label="Extras einblenden"
                                            :extraClass="['btn-extras-chip','extras-align', !hasExerciseSelected ? 'disabled-chip' : '']"
                                            @click="() => { if (requireExercise('extras')) showExtrasLocal = !showExtrasLocal }" />

                    </div>
                </div>
            </div>


            <!-- Kraft/Calisthenics (Standard) -->
            <div v-else class="modal-grid grid-2">
                <div>
                    <UiPopupInput id="progress-sets"
                                  label="Sätze insgesamt"
                                  type="number"
                                  inputmode="numeric"
                                  min="1"
                                  max="7"
                                  step="1"
                                  v-model="setsTextLocal"
                                  placeholder="z. B. 3"
                                  :readonly="!hasExerciseSelected"
                                  @focus="!hasExerciseSelected && requireExercise('sets')" />

                </div>

                <div>
                    <div class="input-with-extras">
                        <UiPopupInput id="progress-weight"
                                      ref="weightInput"
                                      :label="`Körpergewicht (${unit})`"
                                      type="number"
                                      inputmode="decimal"
                                      min="0"
                                      step="0.5"
                                      v-model="weightTextLocal"
                                      :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'"
                                      :readonly="false" />

                        <ExtrasToggleButton :toggled="showExtrasLocal"
                                            title="Extras einblenden"
                                            aria-label="Extras einblenden"
                                            :extraClass="['btn-extras-chip','extras-align', !hasExerciseSelected ? 'disabled-chip' : '']"
                                            @click="() => { if (requireExercise('extras')) showExtrasLocal = !showExtrasLocal }" />
                    </div>
                </div>
            </div>

            <div v-if="visibleSetCount > 0 && (inputType === 'kraft' || inputType === 'calisthenics' || inputType === 'dehnung')"
                 class="set-rows">
                <div v-for="(row, i) in visibleSetDetails" :key="i" class="set-row">
                    <div class="set-row-label">Satz {{ i + 1 }}</div>

                    <!-- Kraft / Calisthenics: Gewicht + Wdh. -->
                    <template v-if="inputType === 'kraft' || inputType === 'calisthenics'">
                        <UiPopupInput :id="`set-${i}-weight`"
                                      label=""
                                      type="number"
                                      inputmode="decimal"
                                      min="0"
                                      step="0.5"
                                      :placeholder="(inputType === 'calisthenics'
      ? (unit === 'kg' ? 'Zusatzgewicht' : 'Added weight')
      : (unit === 'kg' ? 'Gewicht' : 'Weight'))"
                                      :modelValue="rowField(i,'weight')"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('set-weight')"
                                      @update:modelValue="v => setRowField(i,'weight', v)" />

                        <UiPopupInput :id="`set-${i}-reps`"
                                      label=""
                                      type="number"
                                      inputmode="numeric"
                                      min="1"
                                      step="1"
                                      placeholder="Wdh."
                                      :modelValue="rowField(i,'reps')"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('set-reps')"
                                      @update:modelValue="v => setRowField(i,'reps', v)" />
                    </template>

                    <!-- Dehnung: Dauer (Sek.) + optionale Wdh. -->
                    <template v-else>
                        <UiPopupInput :id="`set-${i}-duration`"
                                      label=""
                                      type="number"
                                      inputmode="numeric"
                                      min="5"
                                      max="600"
                                      step="5"
                                      placeholder="Dauer (Sek.)"
                                      :modelValue="rowField(i,'durationSec')"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('stretch-duration')"
                                      @update:modelValue="v => setRowField(i,'durationSec', v)" />

                        <UiPopupInput :id="`set-${i}-reps-opt`"
                                      label=""
                                      type="number"
                                      inputmode="numeric"
                                      min="1"
                                      max="10"
                                      step="1"
                                      placeholder="Wdh. (optional)"
                                      :modelValue="rowField(i,'reps')"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('stretch-reps')"
                                      @update:modelValue="v => setRowField(i,'reps', v)" />
                    </template>
                </div>

                <div v-if="inputType==='dehnung'" class="set-quick-actions">
                    <button type="button" class="btn-extras-chip" @click="applyStretchDuration(30)">30s</button>
                    <button type="button" class="btn-extras-chip" @click="applyStretchDuration(45)">45s</button>
                    <button type="button" class="btn-extras-chip" @click="applyStretchDuration(60)">60s</button>
                    <button type="button" class="btn-extras-chip" @click="applyStretchDuration(90)">90s</button>
                    <button type="button" class="btn-extras-chip" @click="applyStretchDurationFromFirst()">Alle übernehmen</button>
                </div>
            </div>

            <div v-if="showExtrasLocal" class="extras-section grid-2">
                <!-- Kraft & Calisthenics -->
                <template v-if="inputType === 'kraft' || inputType === 'calisthenics'">
                    <div>
                        <div class="label-with-info">
                            <span class="label-text">Tempo</span>

                            <ExplanationPopup title="Tempo im Krafttraining"
                                              :zIndex="10100"
                                              kicker="Kraft • Ausführung"
                                              ariaOpen="Tempo erklären"
                                              ariaClose="Schließen">
                                <TempoExplain />
                            </ExplanationPopup>
                        </div>

                        <UiPopupInput id="extra-tempo"
                                      label=""
                                      v-model="tempoLocal"
                                      placeholder="z. B. 3-1-1"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('tempo')" />
                    </div>

                    <div>
                        <UiPopupInput id="extra-rest"
                                      label="Pausenzeit (Sek.)"
                                      type="number"
                                      inputmode="numeric"
                                      min="0"
                                      step="5"
                                      v-model="restSecondsTextLocal"
                                      placeholder="z. B. 90"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('rest')" />

                    </div>
                </template>

                <!-- Ausdauer -->
                <template v-else-if="inputType === 'ausdauer'">
                    <div>
                        <UiPopupInput id="extra-distance"
                                      label="Distanz (km, optional)"
                                      type="number"
                                      inputmode="decimal"
                                      min="0"
                                      step="0.1"
                                      v-model="distanceTextLocal"
                                      placeholder="z. B. 5"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('distance')" />

                    </div>

                    <div>
                        <UiPopupInput id="extra-avgHr"
                                      label="Durchschnittspuls (bpm)"
                                      type="number"
                                      inputmode="numeric"
                                      min="0"
                                      step="1"
                                      v-model="avgHrTextLocal"
                                      placeholder="z. B. 145"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('avgHr')" />
                    </div>

                    <div>
                        <UiPopupInput id="extra-calories"
                                      label="Kalorienverbrauch (kcal)"
                                      type="number"
                                      inputmode="numeric"
                                      min="0"
                                      step="1"
                                      v-model="caloriesTextLocal"
                                      placeholder="z. B. 350"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('calories')" />
                    </div>

                    <div>
                        <UiPopupInput id="extra-pace"
                                      label="Pace (min/km)"
                                      v-model="paceLocal"
                                      placeholder="z. B. 5:20"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('pace')" />
                    </div>

                    <div>
                        <div class="label-with-info">
                            <span class="label-text">Herzfrequenzzone</span>

                            <ExplanationPopup title="Herzfrequenzzonen (1–5)"
                                              :zIndex="10100"
                                              kicker="Cardio • Intensität"
                                              ariaOpen="Herzfrequenzzonen erklären"
                                              ariaClose="Schließen">
                                <HrZoneExplain />
                            </ExplanationPopup>
                        </div>

                        <UiPopupSelect id="extra-hrZone"
                                       label=""
                                       placeholder="Herzfrequenzzone auswählen"
                                       v-model="hrZoneSelectLocal"
                                       :disabled="!hasExerciseSelected"
                                       :options="[
    { label: 'Zone 1 : Sehr leicht', value: '1' },
    { label: 'Zone 2 : Leicht', value: '2' },
    { label: 'Zone 3 : Mittel', value: '3' },
    { label: 'Zone 4 : Schwer', value: '4' },
    { label: 'Zone 5 : Maximal', value: '5' },
  ]" />
                    </div>

                    <div>
                        <div class="label-with-info">
                            <span class="label-text">Borg-Skala (6–20)</span>

                            <ExplanationPopup title="Borg-Skala (6–20)"
                                              :zIndex="10100"
                                              kicker="Cardio • Belastung"
                                              ariaOpen="Borg-Skala erklären"
                                              ariaClose="Schließen">
                                <BorgExplain />
                            </ExplanationPopup>
                        </div>

                        <UiPopupInput id="extra-borg"
                                      ref="borgInput"
                                      label=""
                                      type="number"
                                      inputmode="numeric"
                                      min="6"
                                      max="20"
                                      step="1"
                                      v-model="borgLocal"
                                      placeholder="z. B. 13"
                                      :readonly="!hasExerciseSelected"
                                      @focus="onBorgFocus"
                                      @blur="onBorgBlur" />
                    </div>
                </template>

                <!-- Dehnung -->
                <template v-else-if="inputType === 'dehnung'">
                    <div>
                        <UiPopupInput id="extra-painFree"
                                      label="Schmerzfreiheit (1-10)"
                                      type="number"
                                      inputmode="numeric"
                                      min="1"
                                      max="10"
                                      step="1"
                                      v-model="painFreeTextLocal"
                                      placeholder="z. B. 8"
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('painFree')" />
                    </div>

                    <div>
                        <UiPopupSelect id="extra-equipment"
                                       label="Hilfsmittel"
                                       placeholder="Hilfsmittel auswählen"
                                       v-model="equipmentLocal"
                                       :disabled="!hasExerciseSelected"
                                       :options="[
                  { label: 'Band', value: 'Band' },
                  { label: 'Rolle', value: 'Rolle' },
                  { label: 'Ball', value: 'Ball' },
                  { label: 'Stab', value: 'Stab' },
                  { label: 'Benutzerdefiniert...', value: 'custom' },
              ]" />
                    </div>
                    <div v-if="equipmentLocal === 'custom'">
                        <UiPopupInput id="extra-equipment-custom"
                                      ref="equipmentCustomInput"
                                      label="Eigenes Hilfsmittel"
                                      v-model="equipmentCustomLocal"
                                      placeholder="z. B. Theraband (grün), usw."
                                      :readonly="!hasExerciseSelected"
                                      @focus="!hasExerciseSelected && requireExercise('equipmentCustom')" />
                    </div>
                    <div>
                        <UiPopupSelect id="extra-side"
                                       label="Betroffene Seite"
                                       placeholder="Seite auswählen"
                                       v-model="sideLocal"
                                       :disabled="!hasExerciseSelected"
                                       :options="[
                  { label: 'Links', value: 'links' },
                  { label: 'Rechts', value: 'rechts' },
                  { label: 'Beidseitig', value: 'beidseitig' },
              ]" />

                    </div>
                </template>
            </div>

            <UiPopupInput id="progress-note"
                          class="note-input"
                          :class="{ 'note-input--extras': showExtrasLocal }"
                          label="Notiz (optional)"
                          v-model="noteLocal"
                          placeholder="RPE, Tempo, Feeling..."
                          :readonly="!hasExerciseSelected"
                          @focus="!hasExerciseSelected && requireExercise('note')" />

        </div>

        <template #actions>
            <div class="modal-actions" :class="{ 'has-delete': localIsEditing }">
                <PopupActionButton v-if="localIsEditing"
                                   class="action-delete"
                                   danger
                                   @click="onDelete">
                    Löschen
                </PopupActionButton>

                <PopupActionButton class="action-cancel"
                                   variant="ghost"
                                   @click="onCancel">
                    Abbrechen
                </PopupActionButton>

                <PopupActionButton class="action-save"
                                   autofocus
                                   @click="onSave">
                    Speichern
                </PopupActionButton>
            </div>
        </template>

        <ValidationPopup :show="Boolean(errors && errors.length)"
                         :errors="errors || []"
                         @close="$emit('dismissErrors')" />

        <ValidationPopup :show="showBorgError"
                         :errors="borgErrors"
                         title="Ungültige Borg-Skala"
                         lead="Die Borg-Skala geht von 6 (sehr leicht) bis 20 (maximal)."
                         @close="onCloseBorgError" />

    </BasePopup>
</template>


<script setup lang="ts">
    import { computed, nextTick, onMounted, ref, watch, withDefaults } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import BorgExplain from '@/components/ui/explain/BorgExplain.vue'
    import HrZoneExplain from '@/components/ui/explain/HrZoneExplain.vue'
    import TempoExplain from '@/components/ui/explain/TempoExplain.vue'
    import { useTrainingPlansStore } from "@/store/trainingPlansStore"
    import { useWeightStore } from '@/store/weightStore'

    type Focusable = { focus: () => void }

    type Unit = 'kg' | 'lbs'
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
    type SetDetail = { weight: number | null; reps: number | null; durationSec?: number | null }
    type PlanExercise = {
        exercise: string
        sets: number
        reps: number
        goal?: string
        type?: ExerciseType
        // cardio extra (optional, aber für Prefill nice)
        durationMin?: number | null
        distanceKm?: number | null
    }
    type Workout = {
        planId?: string
        exercise: string
        date: string
        type?: ExerciseType

        // base
        sets: number
        weight: number
        reps: number
        note?: string

        // cardio
        durationMin?: number
        distanceKm?: number
        avgHr?: number
        calories?: number
        pace?: string
        hrZone?: number
        borg?: number

        // kraft extras
        tempo?: string
        restSeconds?: number
        isDropset?: boolean
        dropsets?: Array<{ weight: number | null; reps: number | null }>
        setDetails?: Array<{ weight: number | null; reps: number | null; durationSec?: number | null }>

        // stretch extras
        painFree?: number
        equipment?: string
        equipmentCustom?: string
        side?: '' | 'links' | 'rechts' | 'beidseitig'
    }

    const props = withDefaults(defineProps<{
        show: boolean
        unit?: Unit
        exercises: PlanExercise[]
        errors?: string[]
        planId: string | null
        latestBodyWeightDisplay?: number | null
        prefillExercise?: string | null
        prefillSetValues?: Record<number, { weight?: number | null; reps?: number | null }>

        // ✅ TrainingSimulation: progressive Set-Freigabe
        activeSetNumber?: number | null
        lockSetsBefore?: number | null
    }>(), {
        unit: 'kg',
        activeSetNumber: null,
        lockSetsBefore: 0,
    })

    onMounted(() => {
        watch(
            () => props.show,
            async (v) => {
                if (!v) return

                const id = props.planId
                if (!id) return

                if (!trainingPlansStore.items?.length) {
                    try { await trainingPlansStore.loadList() } catch { /* no toast hier */ }
                }

                const dto: any = trainingPlansStore.items.find((p: any) => p.id === id)
                const hasDays = dto && Array.isArray(dto.days) && dto.days.length > 0
                if (!hasDays) {
                    try { await trainingPlansStore.loadOne(id) } catch { /* silent */ }
                }
            },
            { immediate: true }
        )
    })

    function closePopup() {
        showExtrasLocal.value = false
        localEditingEntry.value = null
        showProxy.value = false
    }
    const emit = defineEmits<{
        (e: 'update:show', v: boolean): void
        (e: 'dismissErrors'): void
        (e: 'cancel'): void
        (e: 'invalid', errors: string[]): void
        (e: 'save', payload: {
            workout: Workout
            updatedBodyWeightKg?: number | null
            mode: 'create' | 'edit'
            editingDate?: string | null
            draft?: {
                valuesBySet?: Record<number, { weight?: number | null; reps?: number | null }>
            }
        }): void
        (e: 'delete', payload: { planId: string; date: string }): void
    }>()

    const trainingPlansStore = useTrainingPlansStore()

    const weightStore = useWeightStore()

    function getLatestWeightKgFromStore(): number | null {
        const s: any = weightStore as any

        // probier die üblichen Patterns durch (robust gegen Store-Refactors)
        const kg =
            s?.latestKg ??
            s?.latestWeightKg ??
            s?.latest?.weight ??
            s?.entries?.[0]?.weight ??
            s?.weightHistory?.[0]?.weight ??
            null

        const n = typeof kg === 'number' ? kg : Number(String(kg ?? '').replace(',', '.').trim())
        return Number.isFinite(n) && n > 0 ? n : null
    }

    function getLatestWeightDisplayFromStore(): number | null {
        const kg = getLatestWeightKgFromStore()
        return kg == null ? null : kgToDisplay(kg)
    }

    const mapCategoryToType = (cat: unknown): ExerciseType => {
        // Zahlen & Zahl-Strings weiter unterstützen
        const num = typeof cat === 'number' ? cat : Number(String(cat ?? '').trim())
        if (Number.isFinite(num)) {
            if (num === 2) return 'ausdauer'
            if (num === 3) return 'dehnung'
            if (num === 1) return 'calisthenics'
            if (num === 0) return 'kraft'
        }

        // String/Enum aus Backend robust mappen
        const s = String(cat ?? '').trim().toLowerCase()

        if (!s) return 'kraft'

        // Cardio
        if (
            s.includes('ausdauer') ||
            s.includes('cardio') ||
            s.includes('endurance') ||
            s.includes('aerob')
        ) return 'ausdauer'

        // Stretch/Mobility
        if (
            s.includes('dehnung') ||
            s.includes('stretch') ||
            s.includes('mobility') ||
            s.includes('beweglichkeit')
        ) return 'dehnung'

        // Calisthenics
        if (
            s.includes('calisthenics') ||
            s.includes('bodyweight') ||
            s.includes('eigengewicht')
        ) return 'calisthenics'

        // Default
        return 'kraft'
    }

    const DEBUG_PROGRESS_TYPE = true

    function dbgType(label: string, data: any) {
        if (!DEBUG_PROGRESS_TYPE) return

        // NICHT collapsed -> du siehst es sofort
        console.group(`[ProgressEntryModal][TYPE] ${label}`)

        // Deep-clone, damit Chrome dir echte Werte zeigt (nicht "live refs")
        try {
            const snap = JSON.parse(JSON.stringify(data))
            console.log(snap)
        } catch {
            console.log(data)
        }

        console.groupEnd()
    }

    onMounted(() => {
        watch(
            () => exerciseLocal.value,
            (name) => {
                if (!DEBUG_PROGRESS_TYPE) return
                if (!name?.trim()) return

                const key = name.trim().toLowerCase()
                const resolvedHit =
                    exercisesResolved.value.find(e => (e.exercise || '').trim().toLowerCase() === key) ?? null

                dbgType('SELECTED EXERCISE', {
                    selected: name,
                    resolvedHit,
                    resolvedHit_type: resolvedHit?.type,
                    detectedInputType: detectedInputType.value,
                    inputType: inputType.value,
                })
            },
            { flush: 'sync' }
        )
    })

    function applyPlanPrefillFromPlan(planEx: PlanExercise) {
        if (!canAutofill.value) return
        if (!planEx) return

        // ✅ Kraft / Calisthenics
        if ((planEx.type === 'kraft' || planEx.type === 'calisthenics') && shouldFillStrength()) {
            repsLocal.value = Number(planEx.reps || 0) || null
            setsLocal.value = Number(planEx.sets || 0) || null
            return
        }

        // ✅ Cardio
        if (planEx.type === 'ausdauer' && shouldFillCardio()) {
            const dur = planEx.durationMin ?? planEx.sets
            const dist = planEx.distanceKm ?? (planEx.reps ? planEx.reps : null)

            durationLocal.value = dur != null ? Number(dur) : null
            distanceLocal.value = dist != null ? Number(dist) : null
            return
        }

        // ✅ Dehnung
        if (planEx.type === 'dehnung' && shouldFillStretch()) {
            const holds = Number(planEx.sets || 0) || 0
            const sec = Number(planEx.reps || 0) || 0

            setsLocal.value = holds > 0 ? holds : null

            if (holds > 0) {
                const dur = sec > 0 ? sec : 30
                setDetailsLocal.value = Array.from({ length: Math.min(7, holds) }, () => ({
                    weight: 0,
                    reps: null,
                    durationSec: dur,
                }))
            }
            return
        }
    }

    onMounted(() => {
        watch(
            () => plannedForSelected.value,
            (planEx, prev) => {
                if (!props.show) return
                if (!hasExerciseSelected.value) return
                if (!planEx) return
                if (localIsEditing.value) return

                const nextType = planEx.type ?? detectedInputType.value

                if (lastTypeLocal.value && nextType !== lastTypeLocal.value) {
                    resetIrrelevantFields(nextType)
                }
                lastTypeLocal.value = nextType

                nextTick(() => applyPlanPrefill(exerciseLocal.value))
            },
            { flush: 'post' }
        )

        watch(
            () => plannedForSelected.value,
            (x) => {
                console.log('[PREFILL CHECK]', {
                    selected: exerciseLocal.value,
                    planned: x,
                    type: x?.type,
                    sets: x?.sets,
                    reps: x?.reps,
                    dur: x?.durationMin,
                    dist: x?.distanceKm
                })
            },
            { immediate: true }
        )

        watch(
            () => detectedInputType.value,
            (t, prev) => {
                if (!DEBUG_PROGRESS_TYPE) return
                if (!props.show) return
                dbgType('detectedInputType changed', {
                    prev,
                    next: t,
                    exercise: exerciseLocal.value,
                    plannedForSelected: plannedForSelected.value,
                })
            }
        )
    })

    function inferExerciseType(e: Partial<PlanExercise>): ExerciseType {
        const name = String(e.exercise ?? '').trim()

        // 0) explizites string-type gewinnt sofort
        const explicit = String((e as any).type ?? '').trim().toLowerCase()
        if (explicit === 'ausdauer' || explicit === 'dehnung' || explicit === 'calisthenics' || explicit === 'kraft') {
            return explicit as ExerciseType
        }

        // 1) Stretch per Name gewinnt (damit "Mobility/Dehnen" nie als Cardio/Kraft endet)
        if (isStretchName(name)) return 'dehnung'

        // 2) Cardio-Felder -> Ausdauer
        if (e.durationMin != null || e.distanceKm != null) return 'ausdauer'

        // 3) Numeric Enum (number ODER string) 0..3 mappen
        const rawType = (e as any).type
        const num = typeof rawType === 'number' ? rawType : Number(String(rawType ?? '').trim())
        if (Number.isFinite(num)) {
            if (num === 2) return 'ausdauer'
            if (num === 3) return 'dehnung'
            if (num === 1) return 'calisthenics'
            return 'kraft'
        }

        // 4) string aliases (BUGFIX: compare LOWERCASE STRING, nicht rawType)
        if (explicit.includes('cardio') || explicit.includes('endurance') || explicit.includes('aerob')) return 'ausdauer'
        if (explicit.includes('stretch') || explicit.includes('mobility') || explicit.includes('beweglich')) return 'dehnung'
        if (explicit.includes('bodyweight') || explicit.includes('eigengewicht')) return 'calisthenics'
        if (explicit.includes('strength') || explicit.includes('weights')) return 'kraft'

        // 5) Name-Fallback
        if (isCardioName(name)) return 'ausdauer'
        return 'kraft'
    }

    const exercisesResolved = computed<PlanExercise[]>(() => {
        const id = props.planId
        const dto = id ? trainingPlansStore.items.find((p: any) => p.id === id) : null

        const fromApi: PlanExercise[] =

            dto && Array.isArray((dto as any).days)
                ? (dto as any).days
                    .flatMap((d: any) =>
                        Array.isArray(d.exercises)
                            ? d.exercises.map((x: any) => {
                                const name = String(x.name ?? x.exercise ?? '').trim()
                                const isCardio = x.durationMin != null || x.distanceKm != null

                                const type: ExerciseType = isCardio
                                    ? 'ausdauer'
                                    : mapCategoryToType(x.category)

                                // Werte passend setzen
                                const sets = isCardio
                                    ? Number(x.durationMin ?? 0) || 0
                                    : Number(x.sets ?? 0) || 0

                                const reps = isCardio
                                    ? Number(x.distanceKm ?? 0) || 0
                                    : Number(x.reps ?? 0) || 0

                                return {
                                    exercise: name,
                                    sets,
                                    reps,
                                    type,
                                    durationMin: type === 'ausdauer' ? (x.durationMin ?? null) : null,
                                    distanceKm: type === 'ausdauer' ? (x.distanceKm ?? null) : null,
                                }
                            })
                            : []
                    )
                    .filter((e: any) => e.exercise)
                : []

        const fallback: PlanExercise[] = Array.isArray(props.exercises) ? (props.exercises as any) : []

        const names = new Set<string>()
        const merged = [...fromApi, ...fallback].filter(e => {
            const n = (e?.exercise ?? '').trim()
            if (!n) return false
            const key = n.toLowerCase()
            if (names.has(key)) return false
            names.add(key)
            return true
        })

        const normalized = merged.map(e => {
            const t = inferExerciseType(e)

            return {
                ...e,
                type: t,

                // 🔥 kill leaked cardio fields auf Nicht-Cardio (sonst triggert es später wieder irgendwo)
                durationMin: t === 'ausdauer' ? (e as any).durationMin ?? null : null,
                distanceKm: t === 'ausdauer' ? (e as any).distanceKm ?? null : null,
            }
        })

        normalized.sort((a, b) => a.exercise.localeCompare(b.exercise, 'de'))

        if (DEBUG_PROGRESS_TYPE) {
            const sample = normalized.slice(0, 12).map(x => ({ ex: x.exercise, type: x.type, sets: x.sets, reps: x.reps, dur: (x as any).durationMin, dist: (x as any).distanceKm }))
            dbgType('exercisesResolved sample', sample)
        }
        return normalized
    })

    const exerciseOptions = computed(() =>
        exercisesResolved.value.map(e => ({ label: e.exercise, value: e.exercise }))
    )

    watch(
        () => [props.show, props.planId, props.exercises?.length, trainingPlansStore.items?.length],
        ([show, pid, exLen, storeLen]) => {
            console.log('[ProgressEntryModal] show=', show, 'planId=', pid, 'props.exercises=', exLen, 'store.items=', storeLen)
        },
        { immediate: true }
    )

    watch(
        () => exerciseOptions.value,
        (opts) => {
            console.log('[ProgressEntryModal] exerciseOptions=', opts.length, opts.slice(0, 5))
        },
        { immediate: true }
    )

    const showProxy = computed({
        get: () => props.show,
        set: (v: boolean) => emit('update:show', v),
    })

    /* helpers */
    const toStr = (v: unknown) => (v == null ? '' : String(v))
    const toNumber = (v: unknown): number | null => {
        const s = toStr(v).replace(',', '.').trim()
        if (!s) return null
        const n = Number(s)
        return Number.isFinite(n) ? n : null
    }
    const toNumberOr = (v: unknown, fallback: number | null = null) => (toNumber(v) ?? fallback)

    /* unit conversion */
    const lbsToKg = (lbs: number) => lbs * 0.45359237
    const kgToLbs = (kg: number) => kg / 0.45359237
    const displayToKg = (n: number) => (props.unit === 'kg' ? n : lbsToKg(n))
    const kgToDisplay = (n: number) => (props.unit === 'kg' ? n : kgToLbs(n))

    function isCardioName(name: string) {
        const n = (name || '').toLowerCase()
        const kw = [
            'lauf', 'jogg', 'run', 'treadmill', 'rad', 'fahrrad', 'bike', 'spinning', 'cycling', 'row', 'rudern',
            'ergometer', 'crosstrainer', 'ellip', 'seilspring', 'rope', 'treppen', 'stairs', 'schwimm', 'walk', 'hike',
        ]
        return kw.some(k => n.includes(k))
    }

    function isStretchName(name: string) {
        const n = (name || '').toLowerCase()
        const kw = ['dehn', 'stretch', 'mobil', 'mobility', 'beweglich', 'yoga', 'faszien', 'smr', 'roll', 'hip opener']
        return kw.some(k => n.includes(k))
    }

    /* refs for focus */
    const exerciseSelect = ref<Focusable | null>(null)
    const weightInput = ref<Focusable | null>(null)
    const durationInput = ref<Focusable | null>(null)
    const borgInput = ref<Focusable | null>(null)
    const equipmentCustomInput = ref<Focusable | null>(null)

    /* core local state */
    const showExtrasLocal = ref(false)
    const localEditingEntry = ref<Workout | null>(null)
    const localIsEditing = computed(() => !!localEditingEntry.value)

    const exerciseLocal = ref('')
    const setsLocal = ref<number | null>(null)
    const weightLocal = ref<number | null>(null)
    const repsLocal = ref<number | null>(null)
    const noteLocal = ref('')

    const durationLocal = ref<number | null>(null)
    const distanceLocal = ref<number | null>(null)

    const tempoLocal = ref('')
    const restSecondsLocal = ref<number | null>(null)

    const avgHrLocal = ref<number | null>(null)
    const caloriesLocal = ref<number | null>(null)
    const paceLocal = ref('')
    const hrZoneLocal = ref<number | null>(null)

    /* borg ui */
    const borgLocalNum = ref<number | null>(null)
    const borgLocal = ref('')
    const isEditingBorg = ref(false)
    const showBorgError = ref(false)
    const borgErrors = ref<string[]>([])

    function parseBorg(v: unknown): number | null {
        const n = toNumber(v)
        return n == null ? null : Math.round(n)
    }
    function openSyncBorg() {
        borgLocal.value = borgLocalNum.value == null ? '' : String(borgLocalNum.value)
    }
    function onBorgFocus() { isEditingBorg.value = true }
    function onBorgBlur() {
        isEditingBorg.value = false
        const n = parseBorg(borgLocal.value)

        if (n == null) {
            borgLocalNum.value = null
            return
        }
        if (n < 6 || n > 20) {
            borgErrors.value = [`Borg-Skala muss zwischen 6 und 20 liegen (dein Wert: ${n}).`]
            showBorgError.value = true
            return
        }
        borgLocalNum.value = n
    }
    function onCloseBorgError() {
        showBorgError.value = false
        nextTick(() => borgInput.value?.focus())
    }

    /* stretch extras */
    const painFreeLocal = ref<number | null>(null)
    const equipmentLocal = ref<string>('')
    const equipmentCustomLocal = ref<string>('')
    const sideLocal = ref<'' | 'links' | 'rechts' | 'beidseitig'>('')

    const setDetailsLocal = ref<SetDetail[]>([])
    const isDropsetLocal = ref(false)
    const dropsetsLocal = ref<Array<{ weight: number | null; reps: number | null }>>([])

    const plannedForSelected = computed<PlanExercise | null>(() => {
        const key = (exerciseLocal.value || '').trim().toLowerCase()
        if (!key) return null
        return plannedLookup.value.get(key) ?? null
    })

    const detectedInputType = computed<ExerciseType>(() => {
        const t = plannedForSelected.value?.type
        if (t) return t
        return isStretchName(exerciseLocal.value) ? 'dehnung'
            : isCardioName(exerciseLocal.value) ? 'ausdauer'
                : 'kraft'
    })

    const plannedLookup = computed(() => {
        const m = new Map<string, PlanExercise>()
        for (const e of exercisesResolved.value) {
            const key = (e.exercise || '').trim().toLowerCase()
            if (!key) continue
            m.set(key, { ...e, type: inferExerciseType(e) })
        }
        return m
    })

    
    const isBlank = (v: unknown) => v == null || String(v).trim() === ''

    const canAutofill = computed(() => !localIsEditing.value)

    // Nur füllen, wenn User noch nichts reingeschrieben hat (sonst nervt’s)
    const shouldFillStrength = () =>
        (setsLocal.value == null || setsLocal.value === 0) &&
        (repsLocal.value == null || repsLocal.value === 0) &&
        (setDetailsLocal.value?.length ?? 0) === 0

    const shouldFillCardio = () =>
        durationLocal.value == null || durationLocal.value === 0

    const shouldFillStretch = () =>
        (setsLocal.value == null || setsLocal.value === 0) &&
        (setDetailsLocal.value?.length ?? 0) === 0

    function applyPlanPrefill(exName: string) {
        if (!canAutofill.value) return

        const key = (exName || '').trim().toLowerCase()
        if (!key) return

        const planEx = plannedLookup.value.get(key)
        if (!planEx) return

        // ✅ Kraft / Calisthenics
        if ((planEx.type === 'kraft' || planEx.type === 'calisthenics') && shouldFillStrength()) {
            // Reihenfolge wichtig: erst reps, dann sets (damit watcher reps reinziehen kann)
            repsLocal.value = Number(planEx.reps || 0) || null
            setsLocal.value = Number(planEx.sets || 0) || null
            return
        }

        // ✅ Cardio
        if (planEx.type === 'ausdauer' && shouldFillCardio()) {
            const dur = planEx.durationMin ?? planEx.sets
            const dist = planEx.distanceKm ?? (planEx.reps ? planEx.reps : null)

            durationLocal.value = dur != null ? Number(dur) : null
            distanceLocal.value = dist != null ? Number(dist) : null
            return
        }

        // ✅ Dehnung (Holds + Sekunden pro Hold)
        if (planEx.type === 'dehnung' && shouldFillStretch()) {
            const holds = Number(planEx.sets || 0) || 0
            const sec = Number(planEx.reps || 0) || 0

            setsLocal.value = holds > 0 ? holds : null

            // Set-Reihen direkt sauber setzen (statt watcher-default 30s)
            if (holds > 0) {
                const dur = sec > 0 ? sec : 30
                setDetailsLocal.value = Array.from({ length: Math.min(7, holds) }, () => ({
                    weight: 0,
                    reps: null,
                    durationSec: dur,
                }))
            }
            return
        }
    }

    // INSERT in components/ui/popups/ProgressEntryModal.vue (vor dem exerciseLocal watcher)
    const lastTypeLocal = ref<ExerciseType | null>(null)

    function resetIrrelevantFields(nextType: ExerciseType) {
        if (!nextType) return


        // Extras immer zu beim Typwechsel (sonst sieht man random Felder)
        showExtrasLocal.value = false

        // Cardio gewählt -> alles Kraft/Dehnung weghauen (Bodyweight bleibt!)
        if (nextType === 'ausdauer') {
            setsLocal.value = null
            repsLocal.value = null
            setDetailsLocal.value = []
            isDropsetLocal.value = false
            dropsetsLocal.value = []

            tempoLocal.value = ''
            restSecondsLocal.value = null

            painFreeLocal.value = null
            equipmentLocal.value = ''
            equipmentCustomLocal.value = ''
            sideLocal.value = ''

            // Cardio-Extras optional resetten (damit nix “von vorher” hängt)
            avgHrLocal.value = null
            caloriesLocal.value = null
            paceLocal.value = ''
            hrZoneLocal.value = null
            borgLocalNum.value = null
            borgLocal.value = ''
            return
        }

        // Dehnung gewählt -> alles Kraft/Cardio weghauen (Bodyweight bleibt!)
        if (nextType === 'dehnung') {
            // Kraft weg
            repsLocal.value = null
            setDetailsLocal.value = []
            isDropsetLocal.value = false
            dropsetsLocal.value = []
            tempoLocal.value = ''
            restSecondsLocal.value = null

            // Cardio weg
            durationLocal.value = null
            distanceLocal.value = null
            avgHrLocal.value = null
            caloriesLocal.value = null
            paceLocal.value = ''
            hrZoneLocal.value = null
            borgLocalNum.value = null
            borgLocal.value = ''
            return
        }

        // Kraft/Calisthenics gewählt -> Cardio + Dehnung-Extras weg
        durationLocal.value = null
        distanceLocal.value = null
        avgHrLocal.value = null
        caloriesLocal.value = null
        paceLocal.value = ''
        hrZoneLocal.value = null
        borgLocalNum.value = null
        borgLocal.value = ''

        painFreeLocal.value = null
        equipmentLocal.value = ''
        equipmentCustomLocal.value = ''
        sideLocal.value = ''

        // Wenn du von Cardio kommst, sollten reps/sets/setDetails leer sein,
        // damit Prefill sauber neu setzen kann:
        setsLocal.value = null
        repsLocal.value = null
        setDetailsLocal.value = []
    }

    // inputType MUSS vor Watchern stehen
    const inputType = computed(() => detectedInputType.value)

    watch(
        () => inputType.value,
        (next, prev) => {
            if (!props.show) return
            if (!hasExerciseSelected.value) return
            if (!next || next === prev) return

            resetIrrelevantFields(next)
            lastTypeLocal.value = next
        }
        // kein immediate!
    )

    watch(
        () => exerciseLocal.value,
        (name, prev) => {
            if (!name || name === prev) return
            if (!props.show) return
            if (localIsEditing.value) return

            // ✅ immer versuchen – zuerst mit planEx, sonst fallback
            nextTick(() => {
                const planEx = plannedForSelected.value
                if (planEx) applyPlanPrefillFromPlan(planEx)
                else applyPlanPrefill(name)
            })
        },
        { flush: 'post' }
    )

    watch(
        () => [props.show, plannedForSelected.value, exerciseLocal.value] as const,
        ([show, planEx, name]) => {
            if (!show) return
            if (!name?.trim()) return
            if (!planEx) return
            if (localIsEditing.value) return

            nextTick(() => applyPlanPrefillFromPlan(planEx))
        },
        { flush: 'post' }
    )
    const hasExerciseSelected = computed(() => !!exerciseLocal.value.trim())

    const visibleSetCount = computed(() => {
        const raw = Math.max(0, Math.min(7, Number(setsLocal.value ?? 0) || 0))
        const active = Math.floor(Number(props.activeSetNumber ?? 0))
        if (active > 0) return Math.max(0, Math.min(raw, active))
        return raw
    })

    const visibleSetDetails = computed(() => {
        return (setDetailsLocal.value ?? []).slice(0, visibleSetCount.value)
    })

    watch(
        () => [props.show, setDetailsLocal.value.length, visibleSetCount.value] as const,
        () => {
            applyPrefillSetValues()
        },
        { flush: 'post' }
    )

    function requireExercise(reason?: string): boolean {
        if (hasExerciseSelected.value) return true

        const silentReasons = new Set([
            'weight',
            'set-weight', 'set-reps', 'stretch-duration', 'stretch-reps', 'set-row', 'stretch-quick',
        ])
        const silent = reason ? silentReasons.has(reason) : false

        if (!silent) emit('invalid', ['Bitte wähle zuerst eine Übung, bevor du Werte eingibst.'])
        nextTick(() => exerciseSelect.value?.focus())
        return false
    }

    function focusFirst() {
        nextTick(() => {
            exerciseSelect.value?.focus()
            if (!hasExerciseSelected.value) return
            nextTick(() => {
                (inputType.value === 'ausdauer' ? durationInput.value : weightInput.value)?.focus()
            })
        })
    }

    /* text proxies for inputs */
    const setsTextLocal = computed({
        get: () => (setsLocal.value == null ? '' : String(setsLocal.value)),
        set: v => { setsLocal.value = toNumberOr(v, null) },
    })
    const repsTextLocal = computed({
        get: () => (repsLocal.value == null ? '' : String(repsLocal.value)),
        set: v => { repsLocal.value = toNumberOr(v, null) },
    })
    const weightTextLocal = computed({
        get: () => (weightLocal.value == null ? '' : String(weightLocal.value)),
        set: v => { weightLocal.value = toNumberOr(v, null) },
    })
    const durationTextLocal = computed({
        get: () => (durationLocal.value == null ? '' : String(durationLocal.value)),
        set: v => { durationLocal.value = toNumberOr(v, null) },
    })
    const distanceTextLocal = computed({
        get: () => (distanceLocal.value == null ? '' : String(distanceLocal.value)),
        set: v => { distanceLocal.value = toNumberOr(v, null) },
    })
    const avgHrTextLocal = computed({
        get: () => (avgHrLocal.value == null ? '' : String(avgHrLocal.value)),
        set: v => { avgHrLocal.value = toNumberOr(v, null) },
    })
    const caloriesTextLocal = computed({
        get: () => (caloriesLocal.value == null ? '' : String(caloriesLocal.value)),
        set: v => { caloriesLocal.value = toNumberOr(v, null) },
    })
    const restSecondsTextLocal = computed({
        get: () => (restSecondsLocal.value == null ? '' : String(restSecondsLocal.value)),
        set: v => { restSecondsLocal.value = toNumberOr(v, null) },
    })
    const painFreeTextLocal = computed({
        get: () => (painFreeLocal.value == null ? '' : String(painFreeLocal.value)),
        set: v => { painFreeLocal.value = toNumberOr(v, null) },
    })
    const hrZoneSelectLocal = computed<string>({
        get: () => (hrZoneLocal.value == null ? '' : String(hrZoneLocal.value)),
        set: v => {
            const n = toNumberOr(v, null)
            hrZoneLocal.value = n == null ? null : Math.round(n)
        },
    })

    /* set rows helpers */
    type RowField = 'weight' | 'reps' | 'durationSec'
    function rowField(i: number, field: RowField): string {
        const r = setDetailsLocal.value?.[i] as any
        const v = r?.[field]
        return v == null ? '' : String(v)
    }
    function onRowChange(i: number, field: RowField, val: number | null) {
        if (!hasExerciseSelected.value) { requireExercise('set-row'); return }

        let n: number | null = (typeof val === 'number' && Number.isFinite(val)) ? val : null
        if (field === 'reps' && (n == null || n < 1)) n = null
        if (field === 'durationSec' && n != null) n = Math.max(5, Math.min(600, Math.round(n)))

        const next = setDetailsLocal.value.map((r, idx) => idx === i ? { ...r, [field]: n } : r)
        setDetailsLocal.value = next
    }
    function setRowField(i: number, field: RowField, raw: unknown) {
        const n = toNumberOr(raw, null)
        onRowChange(i, field, n)
    }

    /* stretch quick actions */
    function applyStretchDuration(sec: number) {
        if (!hasExerciseSelected.value) { requireExercise('stretch-quick'); return }
        const s = Math.max(5, Math.min(600, Number(sec) || 0))
        setDetailsLocal.value = setDetailsLocal.value.map(r => ({ ...r, durationSec: s }))
    }
    function applyStretchDurationFromFirst() {
        if (!hasExerciseSelected.value) { requireExercise('stretch-quick'); return }
        const first = setDetailsLocal.value[0]?.durationSec
        const s = Math.max(5, Math.min(600, Number(first ?? 30)))
        setDetailsLocal.value = setDetailsLocal.value.map((r, i) => (i === 0 ? r : ({ ...r, durationSec: s })))
    }

    /* create/edit API for parent */
    function openCreate(args: { planId: string; defaultBodyWeightDisplay: number | null }) {
        localEditingEntry.value = null
        showExtrasLocal.value = false
        lastTypeLocal.value = null

        exerciseLocal.value = ''
        setsLocal.value = null
        repsLocal.value = null
        noteLocal.value = ''

        durationLocal.value = null
        distanceLocal.value = null

        tempoLocal.value = ''
        restSecondsLocal.value = null

        avgHrLocal.value = null
        caloriesLocal.value = null
        paceLocal.value = ''
        hrZoneLocal.value = null
        borgLocalNum.value = null

        painFreeLocal.value = null
        equipmentLocal.value = ''
        equipmentCustomLocal.value = ''
        sideLocal.value = ''

        setDetailsLocal.value = []
        isDropsetLocal.value = false
        dropsetsLocal.value = []

        weightLocal.value = getLatestWeightDisplayFromStore() ?? args.defaultBodyWeightDisplay

        showBorgError.value = false
        borgErrors.value = []
        nextTick(() => openSyncBorg())
    }

    function openEdit(args: { planId: string; entry: Workout }) {
        const entry = args.entry
        localEditingEntry.value = entry
        lastTypeLocal.value = detectedInputType.value

        exerciseLocal.value = entry.exercise || ''
        setsLocal.value = entry.sets ?? 1
        repsLocal.value = entry.reps ?? null
        noteLocal.value = entry.note ?? ''

        durationLocal.value = entry.durationMin ?? null
        distanceLocal.value = entry.distanceKm ?? null

        tempoLocal.value = entry.tempo ?? ''
        restSecondsLocal.value = entry.restSeconds ?? null

        avgHrLocal.value = entry.avgHr ?? null
        caloriesLocal.value = entry.calories ?? null
        paceLocal.value = entry.pace ?? ''
        hrZoneLocal.value = entry.hrZone ?? null
        borgLocalNum.value = entry.borg ?? null

        painFreeLocal.value = entry.painFree ?? null
        equipmentLocal.value = entry.equipment ?? ''
        equipmentCustomLocal.value = entry.equipmentCustom ?? ''
        sideLocal.value = (entry.side as any) ?? ''

        if (entry.setDetails?.length) {
            setDetailsLocal.value = entry.setDetails.map((s: { weight?: number | null; reps?: number | null; durationSec?: number | null }) => ({
                weight: s.weight ?? null,
                reps: s.reps ?? null,
                durationSec: s.durationSec ?? null,
            }))
            setsLocal.value = entry.setDetails.length
        } else {
            setDetailsLocal.value = []
        }

        isDropsetLocal.value = Boolean(entry.isDropset && (entry.dropsets?.length ?? 0) > 0)
        dropsetsLocal.value = (entry.dropsets ?? []).map((ds: { weight?: number | null; reps?: number | null }) => ({
            weight: ds.weight ?? null,
            reps: ds.reps ?? null,
        }))

        showExtrasLocal.value = false
        showBorgError.value = false
        borgErrors.value = []
        nextTick(() => openSyncBorg())
    }

    defineExpose({ openCreate, openEdit, submit: () => onSave() })

    watch([setsLocal, inputType, () => props.activeSetNumber], ([s, t]) => {
        const raw = Number(s) || 0
        const baseCount = Math.max(0, Math.min(7, raw))

        const active = Math.floor(Number(props.activeSetNumber ?? 0))
        const count = active > 0 ? Math.min(baseCount, active) : baseCount

        if (raw > 7) {
            emit('invalid', ['Maximal 7 Sätze erlaubt.'])
            setsLocal.value = 7
        }

        const next = [...setDetailsLocal.value]
        if (count > next.length) {
            for (let i = next.length; i < count; i++) {
                if (t === 'dehnung') next.push({ weight: 0, reps: null, durationSec: 30 })
                else next.push({ weight: null, reps: repsLocal.value ?? null })
            }
        } else if (count < next.length) {
            next.splice(count)
        }
        setDetailsLocal.value = next
    })

    watch(equipmentLocal, (val) => {
        if (val !== 'custom' && equipmentCustomLocal.value) equipmentCustomLocal.value = ''
        if (val === 'custom') nextTick(() => equipmentCustomInput.value?.focus())
    })

    const didApplyPrefillForOpen = ref(false)

    function applyPrefillSetValues() {
        if (!props.show) return
        if (localIsEditing.value) return
        if (didApplyPrefillForOpen.value) return

        const pre = props.prefillSetValues ?? null
        if (!pre) return

        // wir brauchen rows (setDetailsLocal) – wenn noch nicht da: später nochmal
        if (!Array.isArray(setDetailsLocal.value) || setDetailsLocal.value.length === 0) return

        const next = [...setDetailsLocal.value]

        // keys sind 1-based (Satz 1..n)
        for (const [k, v] of Object.entries(pre)) {
            const setNo = Math.floor(Number(k))
            if (!Number.isFinite(setNo) || setNo <= 0) continue
            const idx = setNo - 1
            if (!next[idx]) continue

            // NICHT überschreiben, wenn schon was drin ist
            if (v?.weight != null && (next[idx].weight == null || next[idx].weight === 0)) {
                next[idx] = { ...next[idx], weight: v.weight }
            }
            if (v?.reps != null && (next[idx].reps == null || next[idx].reps === 0)) {
                next[idx] = { ...next[idx], reps: v.reps }
            }
        }

        setDetailsLocal.value = next
        didApplyPrefillForOpen.value = true
    }

    watch(() => props.show, (v) => {
        if (v) {
            didApplyPrefillForOpen.value = false

            if (!localIsEditing.value) {
                const fromStore = getLatestWeightDisplayFromStore()
                weightLocal.value = fromStore ?? (props.latestBodyWeightDisplay ?? null)
            }

            const preEx = (props.prefillExercise ?? '').trim()
            if (preEx && !localIsEditing.value) {
                exerciseLocal.value = preEx
                nextTick(() => applyPlanPrefill(preEx))
            }

            // ⬇️ wichtig: nach den plan-prefills + row-setup anwenden
            nextTick(() => applyPrefillSetValues())
            nextTick(() => focusFirst())
            nextTick(() => openSyncBorg())
        } else {
            showExtrasLocal.value = false
        }
    })

    onMounted(() => {
        if (props.show) {
            focusFirst()
            nextTick(() => openSyncBorg())
        }
    })

    function onCancel() {
        closePopup()
        emit('cancel')
    }

    function onDelete() {
        const planId = props.planId
        const date = localEditingEntry.value?.date
        if (!planId || !date) return
        emit('delete', { planId, date })
        closePopup()
    }

    function onSave() {
        const saveErrors: string[] = []

        if (!exerciseLocal.value.trim()) saveErrors.push('Bitte wähle zuerst eine Übung.')

        const t = detectedInputType.value

        if (t === 'ausdauer') {
            const dur = durationLocal.value
            if (!(typeof dur === 'number' && Number.isFinite(dur) && dur >= 1)) {
                saveErrors.push('Bitte eine Dauer in Minuten (mind. 1) angeben.')
            }
        } else {
            const s = setsLocal.value
            if (!(typeof s === 'number' && Number.isFinite(s) && s >= 1)) {
                saveErrors.push('Bitte mindestens 1 Satz angeben.')
            }
        }

        if (saveErrors.length) {
            emit('invalid', saveErrors)
            return
        }

        const planId = props.planId ?? undefined
        const isEdit = !!localEditingEntry.value
        const editingDate = localEditingEntry.value?.date ?? null

        let workout: Workout

        if (t === 'ausdauer') {
            workout = {
                planId,
                exercise: exerciseLocal.value.trim(),
                sets: 0, weight: 0, reps: 0,
                note: noteLocal.value?.trim() || undefined,
                date: localEditingEntry.value?.date ?? new Date().toISOString(),
                type: 'ausdauer',
                durationMin: Number(durationLocal.value),
                distanceKm: distanceLocal.value != null ? Number(distanceLocal.value) : undefined,
                avgHr: avgHrLocal.value ?? undefined,
                calories: caloriesLocal.value ?? undefined,
                pace: paceLocal.value?.trim() || undefined,
                hrZone: hrZoneLocal.value ?? undefined,
                borg: borgLocalNum.value ?? undefined,
            }
        } else if (t === 'dehnung') {
            const perSet = (setDetailsLocal.value ?? []).map(r => ({
                weight: 0,
                reps: r.reps ?? null,
                durationSec: r.durationSec ?? null,
            }))

            const totalSec = perSet.reduce((sum, r) => sum + (typeof r.durationSec === 'number' ? r.durationSec : 0), 0)

            workout = {
                planId,
                exercise: exerciseLocal.value.trim(),
                sets: perSet.length || (Number(setsLocal.value) || 0),
                weight: 0,
                reps: 0,
                note: noteLocal.value?.trim() || undefined,
                date: localEditingEntry.value?.date ?? new Date().toISOString(),
                type: 'dehnung',

                // wichtig: jetzt existiert’s auch im PlanProgressPopup
                setDetails: perSet.length ? perSet : undefined,

                durationMin: undefined,

                painFree: painFreeLocal.value ?? undefined,
                equipment: equipmentLocal.value || undefined,
                equipmentCustom: equipmentCustomLocal.value || undefined,
                side: sideLocal.value || undefined,
            }
        }
        else {
            const hasPerSet = (setDetailsLocal.value?.length ?? 0) > 0
            const perSet = hasPerSet
                ? setDetailsLocal.value
                    .filter(r => r.weight != null && r.reps != null)
                    .map(r => ({ weight: displayToKg(Number(r.weight)), reps: Number(r.reps) }))
                : []

            const first = perSet[0]
            const baseWeightKg =
                weightLocal.value != null && Number.isFinite(Number(weightLocal.value)) && Number(weightLocal.value) >= 0
                    ? displayToKg(Number(weightLocal.value))
                    : 0

            workout = {
                planId,
                exercise: exerciseLocal.value.trim(),
                sets: hasPerSet ? perSet.length : (Number(setsLocal.value) || 0),
                weight: hasPerSet ? first.weight : baseWeightKg,
                reps: hasPerSet ? first.reps : (Number(repsLocal.value) || 0),
                note: noteLocal.value?.trim() || undefined,
                date: localEditingEntry.value?.date ?? new Date().toISOString(),
                type: 'kraft',
                tempo: tempoLocal.value?.trim() || undefined,
                restSeconds: restSecondsLocal.value ?? undefined,
                isDropset: isDropsetLocal.value || undefined,
                dropsets: isDropsetLocal.value
                    ? (dropsetsLocal.value ?? [])
                        .filter(ds => ds.weight != null && ds.reps != null)
                        .map(ds => ({ weight: displayToKg(Number(ds.weight)), reps: Number(ds.reps) }))
                    : undefined,
                setDetails: hasPerSet ? perSet : undefined,
            }
        }

        const updatedBodyWeightKg =
            weightLocal.value != null && Number(weightLocal.value) > 0
                ? displayToKg(Number(weightLocal.value))
                : null

        const valuesBySet: Record<number, { weight?: number | null; reps?: number | null }> = {}
        for (let i = 0; i < (setDetailsLocal.value?.length ?? 0); i++) {
            const r = setDetailsLocal.value[i]
            valuesBySet[i + 1] = {
                weight: r?.weight ?? null,
                reps: r?.reps ?? null,
            }
        }

        emit('save', {
            workout,
            updatedBodyWeightKg,
            mode: isEdit ? 'edit' : 'create',
            editingDate,
            draft: { valuesBySet },
        })
        closePopup()
    }

    watch(
        () => props.latestBodyWeightDisplay,
        (v) => {
            if (!props.show) return
            if (localIsEditing.value) return

            // nur überschreiben, wenn noch leer/0 (damit du User-Eingabe nicht killst)
            const cur = Number(weightLocal.value ?? 0)
            if (!cur || cur <= 0) {
                weightLocal.value = (v ?? null)
            }
        }
    )

    watch(
        () => (weightStore as any)?.entries?.[0]?.weight ?? (weightStore as any)?.weightHistory?.[0]?.weight ?? (weightStore as any)?.latestKg,
        () => {
            if (!props.show) return
            if (localIsEditing.value) return

            const cur = Number(weightLocal.value ?? 0)
            if (!cur || cur <= 0) {
                weightLocal.value = getLatestWeightDisplayFromStore()
            }
        }
    )

</script>


<style scoped>

    :global(.popup-overlay.progress-entry-popup) {
        z-index: 10050 !important;
    }

    @supports (height: 100dvh) {
        .modal {
            max-height: min(52dvh, 102svh);
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: contain;
            max-width: 100%;
            box-sizing: border-box;
            /* ✅ Scrollbar “weiter rechts” (ohne Content zu verschieben) */
            margin-right: -0.45rem;
            padding-right: 0.45rem;
            /* Luft unten, damit Inputs nicht unter sticky Actions verschwinden */
            padding-bottom: 1rem;
        }
    }

    @media (max-width: 560px) {
        .modal {
            max-height: 50svh;
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: contain;
            max-width: 100%;
            box-sizing: border-box;
            margin-right: -0.45rem;
            padding-right: 0.45rem;
            padding-bottom: 1rem;
        }
        /* fr her Scroll auf kleinen Screens */
    }


    @media (max-width: 480px) {
        .modal {
            max-height: 64svh;
        }
    }

    @media (max-width: 400px) {
        .modal {
            max-height: 60svh;
        }
    }

    @media (max-width: 360px) {
        .modal {
            max-height: 56svh;
        }
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: .5rem;
        margin-top: .9rem;
    }

    /* === Mobile: Buttons gleich breit, keine Mindestbreiten erzwingen === */
    @media (max-width: 480px) {
        /* Grid statt Flex */
        .modal-actions {
            display: grid;
            gap: .5rem;
            grid-template-columns: repeat(2, minmax(0, 1fr)); /* Standard: 2 Spalten (Cancel/Save) */
        }

            /* Wenn Delete sichtbar: 3 gleich breite Spalten */
            .modal-actions.has-delete {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            /* WICHTIG: Min-Breiten der Button-Komponenten knacken */
            .modal-actions > * {
                min-width: 0 !important;
                width: 100%;
                box-sizing: border-box;
            }

            /* Viele UI-Buttons haben gro e Default-Paddings   kompakter machen */
            .modal-actions :is(button, a, .btn, .base-button) {
                padding: .55rem .5rem !important;
                font-size: .92rem !important;
                line-height: 1.1;
                white-space: nowrap;
            }
    }

    /* === Sehr schmale Ger te: Delete oben full width, darunter Cancel/Save === */
    @media (max-width: 360px) {
        .modal-actions {
            grid-template-columns: 1fr 1fr; /* 2 Spalten */
            grid-template-areas: "cancel save"; /* ohne Delete */
        }

            .modal-actions.has-delete {
                grid-template-columns: 1fr 1fr;
                grid-template-areas:
                    "delete delete"
                    "cancel save";
            }

            /* Mapping  ber deine Klassen aus dem Template */
            .modal-actions .action-delete {
                grid-area: delete;
            }

            .modal-actions .action-cancel {
                grid-area: cancel;
            }

            .modal-actions .action-save {
                grid-area: save;
            }

            /* Auf extrem schmal: noch etwas kompakter */
            .modal-actions :is(button, a, .btn, .base-button) {
                padding: .5rem .45rem !important;
                font-size: .9rem !important;
            }
    }

    /* Optional: Buttons unten immer sichtbar halten (bleibt im Scrollbereich  kleben ) */
    @media (max-width: 480px) {
        .modal-actions {
            position: sticky;
            bottom: 0;
            background: linear-gradient(to top, var(--bg-card), color-mix(in oklab, var(--bg-card) 80%, transparent));
            padding-bottom: .75rem;
            /* Falls der Modal innen seitliche Padding hat: nichts  berstehen lassen */
        }
    }

    @media (max-width: 420px) {
        /* Grid statt Flex: gleiche Breite, kein  berlaufen */
        .modal-actions {
            display: grid;
            gap: .5rem;
            grid-template-columns: repeat(2, 1fr); /* Standard: 2 Spalten (Cancel/Save) */
        }

            /* Wenn Delete sichtbar ist: 3 Spalten nebeneinander */
            .modal-actions.has-delete {
                grid-template-columns: repeat(3, 1fr);
            }

            /* Buttons sollen die Zelle vollst ndig f llen */
            .modal-actions > * {
                width: 100%;
            }
    }

    /* === Sehr schmale Ger te: Delete oben volle Breite, darunter Cancel/Save === */
    @media (max-width: 340px) {
        .modal-actions {
            grid-template-columns: 1fr 1fr; /* 2 Spalten */
            grid-template-areas: "cancel save"; /* ohne Delete */
        }

            .modal-actions.has-delete {
                grid-template-columns: 1fr 1fr;
                grid-template-areas:
                    "delete delete"
                    "cancel save";
            }

            /* Zielbereiche anhand der neuen Klassen */
            .modal-actions .action-delete {
                grid-area: delete;
            }

            .modal-actions .action-cancel {
                grid-area: cancel;
            }

            .modal-actions .action-save {
                grid-area: save;
            }

            .modal-actions > * {
                width: 100%;
            }
    }

    @media (max-width: 520px) {
        .modal-grid {
            grid-template-columns: 1fr;
        }
    }
    /* Extras Section   clean & modern */
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
        grid-template-columns: 90px minmax(0, 1fr) minmax(0, 1fr);
        gap: .5rem;
    }

    .set-row-label {
        display: flex;
        align-items: center;
        height: 100%;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-secondary);
        line-height: 1;
        transform: translateY(-9px); /* Label bissl höher */
    }

    @media (max-width: 520px) {
        .set-row {
            grid-template-columns: 80px 1fr 1fr;
        }
    }

    .extras-align {
        justify-self: end;
        align-self: center;
        margin-top: 5px; /* bei Bedarf 4px */
    }

    @media (max-width:560px) {
        .input-with-extras {
            gap: .4rem;
        }
    }

    .input-with-extras {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: .5rem;
        align-items: end; /* statt center -> Chip hängt unten an der Input-Kante */
    }

        .input-with-extras .btn-extras-chip {
            margin-bottom: -9px;
        }

    .disabled-chip {
        opacity: .6;
        cursor: not-allowed;
    }

    /* REPLACE: modal-grid baseline clean (kein 3-col default, kein overlap) */
    .modal-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: .75rem;
    }

        /* REPLACE: grid-2 soll nur Spalten steuern – NICHT innere Rows erzwingen */
        .modal-grid.grid-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: start;
            gap: .6rem 1rem;
        }



            /* REMOVE-Effekt: KEIN eigenes Grid pro Zelle -> verhindert Überlappung */
            .modal-grid.grid-2 > div {
                display: block;
            }

            .modal-grid.grid-2 .btn-extras-chip {
                padding: .42rem .54rem;
            }

    @media (max-width: 520px) {
        .modal-grid.grid-2 > div {
            display: block;
        }
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
                display: block;
            }
                /* WICHTIG: Chip NICHT  berlagern -> echte 2-Spalten-Zeile */
                .modal-grid.grid-2 > div .input-with-extras {
                    display: grid !important;
                    grid-template-columns: 1fr auto; /* Input | Chip */
                    gap: .5rem;
                    align-items: center;
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
        white-space: nowrap;
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

    .set-quick-actions {
        margin-top: .25rem;
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
    }
    /* Mobile bleibt 1-spaltig */
    @media (max-width: 520px) {
        .grid-cardio {
            grid-template-columns: 1fr;
        }
    }

    .exercise-gap {
        height: .85rem; /* wenn du mehr willst: 1.1rem */
    }

    .note-input--extras {
        margin-top: 1.05rem; /* wenn noch mehr: 1.25rem */
    }

    .label-with-info {
        /* wie normale UiPopupInput-Labels: block + sauberer Zeilenrhythmus */
        display: flex;
        align-items: center;
        gap: .45rem;
        margin: 0 0 .35rem;
        min-height: 1.15rem; /* gleiche “Höhe” wie andere Labelzeilen */
    }

    .label-text {
        /* Font/Line-Height an App-Text anlehnen */
        font-family: inherit;
        font-size: .95rem;
        line-height: 1.15;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--text-secondary);
    }

    /* InfoButton soll nicht die Zeilenhöhe ziehen */
    .label-with-info :global(.info-btn) {
        align-self: center;
        line-height: 1;
    }

    /* === Desktop soll genau wie Mobile (<620px) aussehen === */
    @media (min-width: 621px) {
        /* Haupt-Inputs: immer 1 Spalte */
        .modal-grid.grid-2 {
            grid-template-columns: 1fr !important;
            gap: .75rem !important;
            align-items: start !important;
        }

        /* Cardio grid: ebenfalls 1 Spalte */
        .grid-cardio {
            grid-template-columns: 1fr !important;
            column-gap: unset !important;
            align-items: start !important;
        }

        /* Extras: immer 1 Spalte */
        .extras-section {
            grid-template-columns: 1fr !important;
        }
    }

    /* Killt dein Desktop-Override ab 961px (nur Layout, nicht dein Styling) */
    @media (min-width: 961px) {
        .modal {
            width: auto !important; /* NICHT zentrieren/verschieben */
        }
    }

    /* <=546px: Sets + Bodyweight NICHT mehr nebeneinander (Bodyweight oben, Sets unten) */
    @media (max-width: 546px) {
        /* NUR Kraft/Calisthenics/Dehnung (Cardio ausnehmen) */
        .modal-grid.grid-2:not(.grid-cardio) {
            grid-template-columns: 1fr !important;
            grid-template-areas:
                "weight"
                "sets";
            gap: .10rem !important;
        }

        .note-input {
            margin-top: 1.05rem !important;
        }


        .modal-grid.grid-2:not(.grid-cardio) > div:first-child {
            grid-area: sets;
        }

        .modal-grid.grid-2:not(.grid-cardio) > div:nth-child(2) {
            grid-area: weight;
        }
    }

    /* <=308px: gleiche Logik (extra tight screens) */
    @media (max-width: 308px) {
        .modal-grid.grid-2:not(.grid-cardio) {
            grid-template-columns: 1fr !important;
            grid-template-areas:
                "weight"
                "sets";
        }

            .modal-grid.grid-2:not(.grid-cardio) > div:first-child {
                grid-area: sets;
            }

            .modal-grid.grid-2:not(.grid-cardio) > div:nth-child(2) {
                grid-area: weight;
            }
    }
</style>
