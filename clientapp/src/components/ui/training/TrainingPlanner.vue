<template>
    <div v-if="hasAnyPlans" class="planner-wrap">
        <div class="plan-calendar-toggle">
            <button type="button"
                    class="btn primary"
                    @click="showPlanner = !showPlanner">
                {{ showPlanner ? 'Kalender ausblenden' : 'Workout planen' }}
            </button>
        </div>

        <Transition name="planner-reveal" appear>
        <section v-if="showPlanner" ref="plannerSectionRef" class="plan-calendar card">
            <div class="card-head planner-reveal-item planner-reveal-item--head">
                <h3 class="card-title">Trainingsplaner</h3>
                <button type="button" class="btn ghost" @click="selectToday">Heute</button>
            </div>
            <div class="plan-calendar-tip planner-reveal-item planner-reveal-item--tip">
                Tipp: Doppelklick auf das Datum oben, um schneller zu navigieren.
            </div>

            <div class="plan-calendar-grid">
                    <div class="plan-calendar-left planner-reveal-item planner-reveal-item--left"
                         :class="calendarPulseClass">
                    <Calender :daysWithEntries="plannedDays"
                              :dayColors="plannedDayColors"
                              :dayTitles="plannedDayTitles"
                              :selectedDays="selectedDays"
                              :checkDays="completedDaysArr"
                              :restDays="Object.keys(restDays)"
                              :minDate="todayKey"
                              :pulseDay="todayKey"
                              :pulseNonce="todayPulseNonce"
                              :previewDays="repeatPreviewDays"
                              :previewColor="repeatPreviewColor"
                              :waveDays="calendarWaveDays"
                              :waveColor="calendarWaveColor"
                              :waveNonce="calendarWaveNonce"
                              :conflictDays="calendarConflictDays"
                              :conflictNonce="calendarConflictNonce"
                              :restStampDays="calendarRestStampDays"
                              :restStampNonce="calendarRestStampNonce"
                              @select="onCalendarSelect"
                              @dblclick="openDayPopup" />

                    <div v-if="hasAnyLegend" class="plan-legend">
                        <div class="legend-list">
                            <span v-for="item in legendItems" :key="item.id" class="legend-item">
                                <span class="legend-dot" :style="{ background: item.color }"></span>
                                <span class="legend-text">- {{ item.name }}</span>
                            </span>
                            <span v-if="Object.keys(restDays).length" class="legend-item">
                                <span class="legend-rest"></span>
                                <span class="legend-text">- Ruhetag</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="plan-calendar-side planner-reveal-item planner-reveal-item--side">
                    <div class="side-title">Ausgewählt ({{ selectedDaysSorted.length }})</div>
                    <div class="side-title side-title--mini">Tage *</div>
                    <TransitionGroup
                        name="selected-chip-stack"
                        tag="div"
                        ref="selectedDaysRef"
                        class="selected-days"
                        :class="{ 'has-error': !!plannerFormErrors.selectedDays }">
                        <button v-for="d in selectedDaysSorted"
                                :key="d"
                                :data-selected-day="d"
                                type="button"
                                class="selected-chip"
                                :class="{ active: d === selectedDay }"
                                @click="onSelectedChipClick(d, $event)">
                            {{ formatDayShort(d) }}
                        </button>
                    </TransitionGroup>
                    <p v-if="plannerFormErrors.selectedDays" class="field-error">{{ plannerFormErrors.selectedDays }}</p>
                    <button v-if="selectedDaysSorted.length > 1"
                            type="button"
                            class="btn ghost"
                            @click="clearSelection">
                        Alle Tage leeren
                    </button>

                    <div v-if="!selectedDay" class="side-empty">
                        Wähle zuerst einen Tag im Kalender. Vergangenheit ist gesperrt.
                    </div>

                    <div class="side-title" :class="{ muted: !selectedDay }">Geplant für {{ selectedDay ? formatDayShort(selectedDay) : " " }}</div>

                    <div class="plan-picker">
                        <div class="side-title side-title--mini">Plan wählen *</div>
                        <UiPopupSelect label="Plan wählen"
                                       placeholder="Plan auswählen"
                                       v-model="selectedPlanId"
                                       :options="planOptions" />
                        <p v-if="plannerFormErrors.selectedPlan" class="field-error">{{ plannerFormErrors.selectedPlan }}</p>

                        <div class="plan-color">
                            <div class="side-title">Plan-Farbe</div>
                            <div class="color-row">
                                <button v-for="c in colorOptions"
                                        :key="c.value"
                                        type="button"
                                        class="color-chip"
                                        :class="{ active: selectedColor === c.value }"
                                        :style="{ background: c.value }"
                                        :title="c.label"
                                        @click="onColorChipClick(c.value, $event)">
                                </button>
                            </div>
                        </div>

                        <div class="plan-repeat" :class="{ 'has-error': !!plannerFormErrors.repeatWeeks || !!plannerFormErrors.repeatWeekdays }">
                            <div class="side-title">Wiederholung</div>
                            <div class="repeat-row">
                                <label class="repeat-label">Wochen</label>
                                <input v-model.number="repeatWeeks"
                                       class="repeat-input"
                                       :class="{ 'is-error': !!plannerFormErrors.repeatWeeks }"
                                       type="number"
                                       min="1"
                                       max="12"
                                       placeholder="z.B. 4" />
                            </div>
                            <p v-if="plannerFormErrors.repeatWeeks" class="field-error">{{ plannerFormErrors.repeatWeeks }}</p>
                            <div class="side-title side-title--mini">Wochentage</div>
                            <div class="repeat-weekdays">
                                <button v-for="(label, idx) in ['Mo','Di','Mi','Do','Fr','Sa','So']"
                                        :key="label"
                                        type="button"
                                        class="weekday-chip"
                                        :class="{ active: repeatWeekdays.includes(idx), 'is-error': !!plannerFormErrors.repeatWeekdays }"
                                        @click="repeatWeekdays = repeatWeekdays.includes(idx)
                                            ? repeatWeekdays.filter(d => d !== idx)
                                            : [...repeatWeekdays, idx]">
                                    {{ label }}
                                </button>
                            </div>
                            <p v-if="plannerFormErrors.repeatWeekdays" class="field-error">{{ plannerFormErrors.repeatWeekdays }}</p>
                        </div>

                        <div class="plan-actions">
                            <button type="button" class="btn primary" @click="addPlanForSelectedDays($event)">
                                Hinzufügen
                            </button>
                            <button type="button" class="btn ghost" @click="toggleRestForSelected">
                                {{ allSelectedRest ? 'Ruhetage entfernen' : 'Ruhetage eintragen' }}
                            </button>
                        </div>
                        <div v-if="plannerValidationLead || plannerValidationItems.length" class="planner-validation-card">
                            <div v-if="plannerValidationLead" class="planner-validation-title">{{ plannerValidationLead }}</div>
                            <ul v-if="plannerValidationItems.length" class="planner-validation-list">
                                <li v-for="item in plannerValidationItems" :key="item">{{ item }}</li>
                            </ul>
                        </div>
                    </div>

                    <button
                            type="button"
                            class="btn ghost"
                            @click="showAllPlans = !showAllPlans">
                        {{ showAllPlans ? 'Meine Planungen schließen' : 'Meine Planungen ansehen' }}
                    </button>

                    <Transition
                        name="all-plans-reveal"
                        @enter="onAllPlansEnter"
                        @after-enter="onAllPlansAfterEnter"
                        @leave="onAllPlansLeave">
                    <div v-if="showAllPlans" class="all-plans" ref="allPlansRef">
                        <div class="all-plans-head">
                            <div class="side-title">Alle Planungen</div>
                            <button type="button"
                                    class="btn ghost btn-reset"
                                    @click="onResetAllPlansClick($event)">
                                Alles zurücksetzen
                            </button>
                        </div>
                        <div v-if="!allPlannings.length" class="side-empty">
                            Noch keine Planungen vorhanden.
                        </div>
                        <ul v-else class="side-list">
                            <li v-for="p in allPlannings"
                                :key="`${p.type}-${p.planId ?? 'rest'}-${p.day}`"
                                class="side-item">
                                <span v-if="p.type === 'plan'"
                                      class="side-color"
                                      :style="{ background: p.color || '#94a3b8' }"></span>
                                <span v-else class="rest-pill">Ruhetag</span>
                                <span class="side-name">
                                    {{ formatDayShort(p.day) }}   {{ p.type === 'plan' ? p.planName : 'Ruhetag' }}
                                </span>
                                <button v-if="p.type === 'plan'"
                                        type="button"
                                        class="btn ghost btn-remove"
                                        @click="requestRemovePlanned(p.day, p.planId!, p.planName, $event)">
                                    Entfernen
                                </button>
                                <button v-else
                                        type="button"
                                        class="btn ghost btn-remove"
                                        @click="requestRemoveRestDay(p.day, $event)">
                                    Entfernen
                                </button>
                            </li>
                        </ul>
                    </div>
                    </Transition>
                </div>
            </div>
        </section>
        </Transition>

        <Transition name="delete-trash">
            <div v-if="deleteTrashState.visible" class="delete-trash-overlay" aria-hidden="true">
                <div v-if="deleteTrashChips.length"
                     class="delete-trash-stack"
                     :class="{ 'is-crowded': deleteTrashChips.length > 8 }"
                     :style="deleteTrashFlightStyle">
                    <span v-for="chip in deleteTrashChips" :key="chip" class="delete-trash-chip">
                        {{ chip }}
                    </span>
                </div>
                <div v-else-if="deleteTrashState.itemName" class="delete-trash-flight" :style="deleteTrashFlightStyle">
                    <span class="delete-trash-flight__title">{{ deleteTrashState.itemName }}</span>
                </div>
                <div class="delete-trash-bin">
                    <div class="delete-trash-bin__lid"></div>
                    <div class="delete-trash-bin__body"></div>
                </div>
            </div>
        </Transition>

        <Transition name="plan-drop">
            <div v-if="planDropFlights.length" class="plan-drop-overlay" aria-hidden="true">
                <span v-for="flight in planDropFlights"
                      :key="flight.id"
                      class="plan-drop-chip"
                      :style="flight.style">
                    {{ flight.label }}
                </span>
            </div>
        </Transition>

        <Transition name="selection-flight">
            <div v-if="selectionFlights.length" class="selection-flight-overlay" aria-hidden="true">
                <span v-for="flight in selectionFlights"
                      :key="flight.id"
                      class="selection-flight"
                      :class="`selection-flight--${flight.kind}`"
                      :style="flight.style">
                    <span v-if="flight.label" class="selection-flight__label">{{ flight.label }}</span>
                </span>
            </div>
        </Transition>

        <Transition name="color-broadcast">
            <div v-if="colorBroadcastBursts.length" class="color-broadcast-overlay" aria-hidden="true">
                <span v-for="burst in colorBroadcastBursts"
                      :key="burst.id"
                      class="color-broadcast-burst"
                      :style="burst.style"></span>
            </div>
        </Transition>

        <CalendarDayPopup :show="showDayPopup"
                          :day="popupDay"
                          :dayLabel="popupDayLabel"
                          :isToday="popupIsToday"
                          :isFuture="popupIsFuture"
                          :isPlanned="popupIsPlanned"
                          :isRest="popupIsRest"
                          :isCompleted="popupIsCompleted"
                          :allowComplete="popupAllowComplete"
                          :allowPlan="popupAllowPlan"
                          :allowEdit="popupAllowEdit"
                          :allowRest="popupAllowRest"
                          :allowMove="popupAllowMove"
                          :allowClear="popupAllowClear"
                          :planOptions="planOptions"
                          :colorOptions="colorOptions"
                          :defaultPlanId="popupPlanId"
                          :defaultColor="popupColor"
                          :minDate="todayKey"
                          @close="closeDayPopup"
                          @complete="onPopupComplete"
                          @plan="onPopupPlan"
                          @update="onPopupUpdate"
                          @rest="onPopupRest"
                          @move="onPopupMove"
                          @clear="onPopupClear" />

        <DeleteConfirmPopup :show="showResetConfirm"
                            @confirm="requestResetAllPlans()"
                            @cancel="showResetConfirm = false" />
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
    import Calender from '@/components/ui/kits/calender/Calender.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import CalendarDayPopup from '@/components/ui/popups/CalendarDayPopup.vue'
    import { LS_TRAINING_PLANNER, LS_TRAINING_PLAN_COLORS, LS_TRAINING_REST_DAYS, LS_TRAINING_PLANNER_COMPLETED, LS_CONFIRM_DELETE_ENABLED } from '@/constants/storageKeys'
    import type { TrainingPlan as TrainingPlanDto } from "@/types/trainingPlan"
    import { useAuthStore } from '@/store/authStore'
    import { useSettingsStore } from '@/store/settingsStore'
    import { addTrainingPlanner, addTrainingPlannerRestDay, deleteTrainingPlanner, deleteTrainingPlannerRestDay, listTrainingPlanner, setTrainingPlannerCompletion } from '@/services/trainingPlanner'
    import { setTrainingPlanColor } from '@/services/trainingPlans'

    type ViewPlan = {
        id: string
        name: string
    }

    const props = defineProps<{
        apiPlans: TrainingPlanDto[]
        guestPlans: ViewPlan[]
    }>()

    const showPlanner = ref(false)
    const plannerSectionRef = ref<HTMLElement | null>(null)
    const selectedDaysRef = ref<HTMLElement | null>(null)
    const selectedPlanId = ref<string>('')
    const todayKey = new Date().toISOString().slice(0, 10)
    const selectedDay = ref<string>('')
    const selectedDays = ref<string[]>([])
    const repeatWeeks = ref<number | null>(null)
    const repeatWeekdays = ref<number[]>([])

    const planner = ref<Record<string, { planId: string; planName: string; source: 'api' | 'guest'; color?: string }[]>>({})
    const restDays = ref<Record<string, true>>({})
    const completedDays = ref<Record<string, true>>({})
    const planColors = ref<Record<string, string>>({})
    const auth = useAuthStore()
    const settings = useSettingsStore()
    const plannerFormErrors = ref({
        selectedPlan: '',
        repeatWeeks: '',
        repeatWeekdays: '',
        selectedDays: '',
    })
    const plannerValidationLead = ref('')
    const plannerValidationItems = ref<string[]>([])
    const calendarPulseMode = ref<'plan' | 'rest' | ''>('')
    let calendarPulseTimer: ReturnType<typeof setTimeout> | null = null
    const todayPulseNonce = ref(0)
    const calendarWaveDays = ref<string[]>([])
    const calendarWaveColor = ref('')
    const calendarWaveNonce = ref(0)
    let calendarWaveTimer: ReturnType<typeof setTimeout> | null = null
    const calendarConflictDays = ref<string[]>([])
    const calendarConflictNonce = ref(0)
    let calendarConflictTimer: ReturnType<typeof setTimeout> | null = null
    const calendarRestStampDays = ref<string[]>([])
    const calendarRestStampNonce = ref(0)
    let calendarRestStampTimer: ReturnType<typeof setTimeout> | null = null
    const planDropFlights = ref<Array<{ id: string; label: string; style: Record<string, string> }>>([])
    let planDropTimer: ReturnType<typeof setTimeout> | null = null
    const selectionFlights = ref<Array<{ id: string; kind: 'trail' | 'chip'; label?: string; style: Record<string, string> }>>([])
    let selectionFlightTimer: ReturnType<typeof setTimeout> | null = null
    const colorBroadcastBursts = ref<Array<{ id: string; style: Record<string, string> }>>([])
    let colorBroadcastTimer: ReturnType<typeof setTimeout> | null = null
    let pendingColorBroadcastOrigin: { x: number; y: number } | null = null
    const deleteTrashState = ref({
        visible: false,
        itemName: '',
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    })
    const deleteTrashChips = ref<string[]>([])
    let deleteTrashTimer: ReturnType<typeof setTimeout> | null = null
    const showAllPlans = ref(false)
    const allPlansRef = ref<HTMLElement | null>(null)
    const showResetConfirm = ref(false)
    const showDayPopup = ref(false)
    const popupDay = ref('')
    const popupPlanId = ref('')
    const popupColor = ref('')

    const hasAnyPlans = computed(() =>
        (props.apiPlans?.length ?? 0) > 0 || (props.guestPlans?.length ?? 0) > 0
    )

    const isAuthenticated = computed(() => auth.isAuthenticated)

    const apiColorMap = computed(() => {
        const out: Record<string, string> = {}
        for (const p of props.apiPlans ?? []) {
            if (p.color) out[p.id] = p.color
        }
        return out
    })

    const planOptions = computed(() => {
        const api = (props.apiPlans ?? []).map(p => ({
            label: p.name,
            value: p.id,
            _source: 'api' as const,
        }))

        const guest = (props.guestPlans ?? []).map(p => ({
            label: p.name,
            value: p.id,
            _source: 'guest' as const,
        }))

        return [...api, ...guest]
    })

    const plannedDays = computed(() => Object.keys(planner.value))
    const completedDaysArr = computed(() => Object.keys(completedDays.value))

    const plannedDayColors = computed<Record<string, string | string[]>>(() => {
        const out: Record<string, string[]> = {}
        for (const [day, items] of Object.entries(planner.value)) {
            const colors = items
                .map(i => i.color || planColors.value[i.planId] || apiColorMap.value[i.planId])
                .filter(Boolean) as string[]
            if (colors.length) out[day] = colors
        }
        return out
    })

    const plannedDayTitles = computed<Record<string, string>>(() => {
        const out: Record<string, string> = {}
        for (const [day, items] of Object.entries(planner.value)) {
            const names = items.map(i => i.planName).filter(Boolean)
            if (names.length) out[day] = names.join(', ')
        }
        for (const day of Object.keys(restDays.value)) {
            out[day] = 'Ruhetag'
        }
        return out
    })

    const allPlannings = computed(() => {
        const out: Array<{
            day: string
            type: 'plan' | 'rest'
            planId?: string
            planName?: string
            color?: string
        }> = []

        for (const [day, items] of Object.entries(planner.value)) {
            for (const item of items) {
                out.push({
                    day,
                    type: 'plan',
                    planId: item.planId,
                    planName: item.planName,
                    color: item.color || planColors.value[item.planId] || apiColorMap.value[item.planId],
                })
            }
        }

        for (const day of Object.keys(restDays.value)) {
            out.push({ day, type: 'rest' })
        }

        return out.sort((a, b) => a.day.localeCompare(b.day))
    })

    const legendItems = computed(() => {
        const map = new Map<string, { name: string; color: string }>()
        for (const items of Object.values(planner.value)) {
            for (const item of items) {
                const color = item.color || planColors.value[item.planId] || apiColorMap.value[item.planId] || '#94a3b8'
                if (!map.has(item.planId)) {
                    map.set(item.planId, { name: item.planName, color })
                }
            }
        }
        return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }))
    })

    const hasAnyLegend = computed(() => legendItems.value.length > 0 || Object.keys(restDays.value).length > 0)

    const plannedForSelected = computed(() => (selectedDay.value ? planner.value[selectedDay.value] ?? [] : []))
    const selectedHasRest = computed(() => (selectedDay.value ? !!restDays.value[selectedDay.value] : false))
    const selectedDaysSorted = computed(() => [...selectedDays.value].sort())
    const allSelectedRest = computed(() => selectedDays.value.length > 0 && selectedDays.value.every(d => restDays.value[d]))
    const calendarPulseClass = computed(() => (
        calendarPulseMode.value ? `is-pulsing-${calendarPulseMode.value}` : ''
    ))
    const deleteTrashFlightStyle = computed(() => ({
        left: `${deleteTrashState.value.startX}px`,
        top: `${deleteTrashState.value.startY}px`,
        '--delete-fly-x': `${deleteTrashState.value.deltaX}px`,
        '--delete-fly-y': `${deleteTrashState.value.deltaY}px`,
    }))
    const repeatPreviewDays = computed(() => {
        const planId = selectedPlanId.value
        if (!planId || !useRecurring.value) return []
        return futureTargetDays.value.filter(day => {
            if (restDays.value[day]) return false
            const list = planner.value[day] ?? []
            return !list.some(item => item.planId === planId)
        })
    })
    const repeatPreviewColor = computed(() => {
        return '#94a3b8'
    })

    const popupDayLabel = computed(() => (popupDay.value ? formatDayLong(popupDay.value) : ''))
    const popupIsToday = computed(() => popupDay.value === todayKey)
    const popupIsFuture = computed(() => !!popupDay.value && popupDay.value > todayKey)
    const popupIsPlanned = computed(() => !!popupDay.value && (planner.value[popupDay.value]?.length ?? 0) > 0)
    const popupIsRest = computed(() => !!popupDay.value && !!restDays.value[popupDay.value])
    const popupIsCompleted = computed(() => !!popupDay.value && !!completedDays.value[popupDay.value])
    const popupAllowComplete = computed(() => popupIsToday.value && popupIsPlanned.value && !popupIsRest.value)
    const popupAllowPlan = computed(() => popupIsFuture.value && !popupIsPlanned.value && !popupIsRest.value)
    const popupAllowEdit = computed(() => popupIsPlanned.value && !isPastDay(popupDay.value))
    const popupAllowRest = computed(() => !!popupDay.value && !isPastDay(popupDay.value))
    const popupAllowMove = computed(() => popupIsPlanned.value && !isPastDay(popupDay.value))
    const popupAllowClear = computed(() => popupIsPlanned.value || popupIsRest.value)

    const savePlanner = () => {
        localStorage.setItem(LS_TRAINING_PLANNER, JSON.stringify(planner.value))
    }

    const saveRestDays = () => {
        localStorage.setItem(LS_TRAINING_REST_DAYS, JSON.stringify(Object.keys(restDays.value)))
    }

    const saveCompletedDays = () => {
        localStorage.setItem(LS_TRAINING_PLANNER_COMPLETED, JSON.stringify(Object.keys(completedDays.value)))
    }

    const loadPlanner = () => {
        try {
            const raw = localStorage.getItem(LS_TRAINING_PLANNER)
            planner.value = raw ? JSON.parse(raw) : {}
        } catch {
            planner.value = {}
        }
    }

    const loadRestDays = () => {
        try {
            const raw = localStorage.getItem(LS_TRAINING_REST_DAYS)
            const arr = raw ? JSON.parse(raw) : []
            const next: Record<string, true> = {}
            for (const d of Array.isArray(arr) ? arr : []) next[d] = true
            restDays.value = next
        } catch {
            restDays.value = {}
        }
    }

    const loadCompletedDays = () => {
        try {
            const raw = localStorage.getItem(LS_TRAINING_PLANNER_COMPLETED)
            const arr = raw ? JSON.parse(raw) : []
            const next: Record<string, true> = {}
            for (const d of Array.isArray(arr) ? arr : []) next[d] = true
            completedDays.value = next
        } catch {
            completedDays.value = {}
        }
    }

    const savePlanColors = () => {
        localStorage.setItem(LS_TRAINING_PLAN_COLORS, JSON.stringify(planColors.value))
    }

    const loadPlanColors = () => {
        try {
            const raw = localStorage.getItem(LS_TRAINING_PLAN_COLORS)
            planColors.value = raw ? JSON.parse(raw) : {}
        } catch {
            planColors.value = {}
        }
    }

    const setCompletionForDay = async (day: string, isCompleted: boolean, planId?: string) => {
        if (isAuthenticated.value) {
            await setTrainingPlannerCompletion(dayToIsoUtc(day), isCompleted, planId)
        }

        if (isCompleted) completedDays.value = { ...completedDays.value, [day]: true }
        else {
            const { [day]: _, ...rest } = completedDays.value
            completedDays.value = rest
        }

        if (!isAuthenticated.value) saveCompletedDays()
    }

    const onCalendarSelect = (day: string) => {
        const idx = selectedDays.value.indexOf(day)
        if (idx >= 0) {
            triggerChipReturn(day, formatDayShort(day), findSelectedChipElement(day))
            selectedDays.value.splice(idx, 1)
            if (selectedDays.value.length === 0) {
                selectedDay.value = ''
                return
            }
            if (selectedDay.value === day) {
                selectedDay.value = selectedDays.value[0] ?? ''
            }
            return
        }

        triggerSelectionTrail(day)
        selectedDays.value.push(day)
        selectedDay.value = day
    }

    const selectToday = () => {
        selectedDay.value = todayKey
        selectedDays.value = [todayKey]
        todayPulseNonce.value += 1
    }

    const focusDay = (day: string) => {
        if (selectedDays.value.includes(day)) {
            selectedDays.value = selectedDays.value.filter(item => item !== day)
            if (selectedDay.value === day) {
                selectedDay.value = selectedDays.value[0] ?? ''
            }
            return
        }
        selectedDays.value = [...selectedDays.value, day]
        selectedDay.value = day
    }

    const onSelectedChipClick = (day: string, event?: MouseEvent) => {
        if (selectedDays.value.includes(day)) {
            const chip = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
            triggerChipReturn(day, formatDayShort(day), chip)
        }
        focusDay(day)
    }

    const onColorChipClick = (color: string, event?: MouseEvent) => {
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
        const rect = trigger?.getBoundingClientRect()
        pendingColorBroadcastOrigin = rect
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : null
        selectedColor.value = color
    }

    const clearSelection = () => {
        const days = [...selectedDaysSorted.value]
        if (!days.length) return
        triggerMultipleChipReturns(days)
        selectedDay.value = ''
        selectedDays.value = []
    }

    const resetPlannerForm = () => {
        selectedPlanId.value = ''
        selectedDay.value = ''
        selectedDays.value = []
        repeatWeeks.value = null
        repeatWeekdays.value = []
        clearPlannerFormErrors()
        clearPlannerValidation()
    }

    const formatDayShort = (yyyyMMdd: string) => {
        const [y, m, d] = yyyyMMdd.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
        })
    }

    const formatDayLong = (yyyyMMdd: string) => {
        const [y, m, d] = yyyyMMdd.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })
    }

    const getDayIndexMonday = (d: Date) => (d.getDay() + 6) % 7 // Mo=0..So=6
    const parseYmd = (ymd: string) => {
        const [y, m, d] = ymd.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1)
    }
    const toKeyLocal = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }
    const isPastDay = (day: string) => day < todayKey
    const weekStartMonday = (d: Date) => {
        const start = new Date(d)
        start.setHours(0, 0, 0, 0)
        const diff = getDayIndexMonday(start)
        start.setDate(start.getDate() - diff)
        return start
    }

    const buildRepeatDates = () => {
        const baseDay = selectedDay.value || todayKey
        const base = parseYmd(baseDay)
        const weeks = Math.max(1, Math.min(12, Number(repeatWeeks.value ?? 1) || 1))
        const weekdays = repeatWeekdays.value.length
            ? [...repeatWeekdays.value]
            : [getDayIndexMonday(base)]

        const start = weekStartMonday(base)
        const out = new Set<string>()
        for (let w = 0; w < weeks; w++) {
            for (const wd of weekdays) {
                const cur = new Date(start)
                cur.setDate(start.getDate() + w * 7 + wd)
                out.add(toKeyLocal(cur))
            }
        }
        return Array.from(out).sort()
    }

    const useRecurring = computed(() => (repeatWeeks.value != null && repeatWeeks.value > 1) || repeatWeekdays.value.length > 0)
    const targetDays = computed(() => {
        if (useRecurring.value) return buildRepeatDates()
        if (selectedDays.value.length) return selectedDays.value
        if (selectedDay.value) return [selectedDay.value]
        return []
    })
    const futureTargetDays = computed(() => targetDays.value.filter(d => !isPastDay(d)))

    const clearPlannerValidation = () => {
        plannerValidationLead.value = ''
        plannerValidationItems.value = []
    }

    const animateAllPlansExpand = (el: Element, done?: () => void) => {
        const node = el as HTMLElement
        node.style.overflow = 'hidden'
        node.style.height = '0px'
        node.style.opacity = '0'
        node.style.transform = 'translateY(-10px) scale(.985)'
        void node.offsetHeight
        requestAnimationFrame(() => {
            node.style.height = `${node.scrollHeight}px`
            node.style.opacity = '1'
            node.style.transform = 'translateY(0) scale(1)'
        })
        if (done) window.setTimeout(done, 380)
    }

    const onAllPlansEnter = (el: Element, done: () => void) => {
        animateAllPlansExpand(el, done)
    }

    const onAllPlansAfterEnter = (el: Element) => {
        const node = el as HTMLElement
        node.style.height = 'auto'
        node.style.overflow = ''
        node.style.opacity = ''
        node.style.transform = ''
    }

    const onAllPlansLeave = (el: Element, done: () => void) => {
        const node = el as HTMLElement
        node.style.overflow = 'hidden'
        node.style.height = `${node.scrollHeight}px`
        node.style.opacity = '1'
        node.style.transform = 'translateY(0) scale(1)'
        void node.offsetHeight
        requestAnimationFrame(() => {
            node.style.height = '0px'
            node.style.opacity = '0'
            node.style.transform = 'translateY(-10px) scale(.985)'
        })
        window.setTimeout(done, 340)
    }

    const triggerRepeatPreviewWave = () => {
        if (!showPlanner.value || !useRecurring.value) return
        const previewDays = repeatPreviewDays.value
        if (!previewDays.length) return
        triggerCalendarWave(previewDays, repeatPreviewColor.value)
    }

    const clearDeleteTrashTimer = () => {
        if (deleteTrashTimer) {
            clearTimeout(deleteTrashTimer)
            deleteTrashTimer = null
        }
    }

    const clearCalendarWaveTimer = () => {
        if (calendarWaveTimer) {
            clearTimeout(calendarWaveTimer)
            calendarWaveTimer = null
        }
    }

    const clearCalendarConflictTimer = () => {
        if (calendarConflictTimer) {
            clearTimeout(calendarConflictTimer)
            calendarConflictTimer = null
        }
    }

    const clearCalendarRestStampTimer = () => {
        if (calendarRestStampTimer) {
            clearTimeout(calendarRestStampTimer)
            calendarRestStampTimer = null
        }
    }

    const clearPlanDropTimer = () => {
        if (planDropTimer) {
            clearTimeout(planDropTimer)
            planDropTimer = null
        }
    }

    const clearSelectionFlightTimer = () => {
        if (selectionFlightTimer) {
            clearTimeout(selectionFlightTimer)
            selectionFlightTimer = null
        }
    }

    const clearColorBroadcastTimer = () => {
        if (colorBroadcastTimer) {
            clearTimeout(colorBroadcastTimer)
            colorBroadcastTimer = null
        }
    }

    const hideDeleteTrash = () => {
        clearDeleteTrashTimer()
        deleteTrashState.value = {
            visible: false,
            itemName: '',
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
        }
        deleteTrashChips.value = []
    }

    const buildFlightVectorStyle = (
        startX: number,
        startY: number,
        targetX: number,
        targetY: number,
        extra: Record<string, string> = {},
    ) => ({
        left: `${startX}px`,
        top: `${startY}px`,
        '--selection-fly-x': `${targetX - startX}px`,
        '--selection-fly-y': `${targetY - startY}px`,
        '--selection-angle': `${Math.atan2(targetY - startY, targetX - startX)}rad`,
        '--selection-distance': `${Math.hypot(targetX - startX, targetY - startY)}px`,
        ...extra,
    })

    const triggerSelectionTrail = (day: string) => {
        const start = findCalendarDayCenter(day)
        const target = findSelectedDaysCenter()
        if (!start || !target) return
        clearSelectionFlightTimer()
        selectionFlights.value = [{
            id: `trail-${day}-${Date.now()}`,
            kind: 'trail',
            style: buildFlightVectorStyle(start.x, start.y, target.x, target.y),
        }]
        selectionFlightTimer = setTimeout(() => {
            selectionFlights.value = []
            selectionFlightTimer = null
        }, 720)
    }

    const triggerChipReturn = (day: string, label: string, sourceEl?: HTMLElement | null) => {
        const target = findCalendarDayCenter(day)
        if (!target) return
        const rect = sourceEl?.getBoundingClientRect()
        const startX = rect ? rect.left + rect.width / 2 : window.innerWidth * 0.72
        const startY = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.4
        clearSelectionFlightTimer()
        selectionFlights.value = [{
            id: `chip-${day}-${Date.now()}`,
            kind: 'chip',
            label,
            style: buildFlightVectorStyle(startX, startY, target.x, target.y, getChipFlightTheme(sourceEl)),
        }]
        selectionFlightTimer = setTimeout(() => {
            selectionFlights.value = []
            selectionFlightTimer = null
        }, 860)
    }

    const triggerMultipleChipReturns = (days: string[]) => {
        const flights = days
            .map((day, index) => {
                const chip = findSelectedChipElement(day)
                const target = findCalendarDayCenter(day)
                if (!target) return null
                const rect = chip?.getBoundingClientRect()
                const startX = rect ? rect.left + rect.width / 2 : window.innerWidth * 0.72
                const startY = rect ? rect.top + rect.height / 2 : window.innerHeight * 0.4
                return {
                    id: `chip-${day}-${Date.now()}-${index}`,
                    kind: 'chip' as const,
                    label: formatDayShort(day),
                    style: buildFlightVectorStyle(
                        startX,
                        startY,
                        target.x,
                        target.y,
                        {
                            ...getChipFlightTheme(chip),
                            '--selection-flight-delay': `${index * 45}ms`,
                        },
                    ),
                }
            })
            .filter(Boolean) as Array<{ id: string; kind: 'chip'; label?: string; style: Record<string, string> }>

        if (!flights.length) return
        clearSelectionFlightTimer()
        selectionFlights.value = flights
        selectionFlightTimer = setTimeout(() => {
            selectionFlights.value = []
            selectionFlightTimer = null
        }, 980)
    }

    const triggerColorBroadcastBurst = (origin: { x: number; y: number }, color: string) => {
        clearColorBroadcastTimer()
        colorBroadcastBursts.value = [{
            id: `broadcast-${Date.now()}`,
            style: {
                left: `${origin.x}px`,
                top: `${origin.y}px`,
                '--broadcast-color': color,
            },
        }]
        colorBroadcastTimer = setTimeout(() => {
            colorBroadcastBursts.value = []
            colorBroadcastTimer = null
        }, 820)
    }

    const orderDaysByDistance = (days: string[], origin: { x: number; y: number }) =>
        [...days].sort((a, b) => {
            const pa = findCalendarDayCenter(a)
            const pb = findCalendarDayCenter(b)
            if (!pa && !pb) return 0
            if (!pa) return 1
            if (!pb) return -1
            const da = Math.hypot(pa.x - origin.x, pa.y - origin.y)
            const db = Math.hypot(pb.x - origin.x, pb.y - origin.y)
            return da - db
        })

    const launchDeleteTrash = (
        chips: string[],
        event: MouseEvent | undefined,
        onDone: () => void,
        origin?: { x: number; y: number } | null,
    ) => {
        clearDeleteTrashTimer()
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
        const rect = trigger?.getBoundingClientRect()
        const startX = origin?.x ?? event?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2)
        const startY = origin?.y ?? event?.clientY ?? (rect ? rect.top + rect.height / 2 : Math.max(120, window.innerHeight * 0.28))
        const targetX = window.innerWidth / 2
        const targetY = window.innerHeight - 84
        const safeChips = chips
            .map(chip => chip.trim())
            .filter(Boolean)
            .map(chip => chip.length > 36 ? `${chip.slice(0, 35)}…` : chip)

        deleteTrashChips.value = safeChips.length > 1 ? safeChips : []
        deleteTrashState.value = {
            visible: true,
            itemName: safeChips.length === 1 ? safeChips[0] : '',
            startX,
            startY,
            deltaX: targetX - startX,
            deltaY: targetY - startY,
        }

        deleteTrashTimer = setTimeout(async () => {
            await onDone()
            hideDeleteTrash()
        }, 860)
    }

    const triggerCalendarPulse = (mode: 'plan' | 'rest') => {
        if (calendarPulseTimer) clearTimeout(calendarPulseTimer)
        calendarPulseMode.value = mode
        calendarPulseTimer = setTimeout(() => {
            calendarPulseMode.value = ''
            calendarPulseTimer = null
        }, 720)
    }

    const triggerCalendarWave = (days: string[], color?: string) => {
        const nextDays = Array.from(new Set(days.filter(Boolean)))
        if (!nextDays.length) return
        clearCalendarWaveTimer()
        calendarWaveDays.value = nextDays
        calendarWaveColor.value = color?.trim() || selectedColor.value || '#818cf8'
        calendarWaveNonce.value += 1
        calendarWaveTimer = setTimeout(() => {
            calendarWaveDays.value = []
            calendarWaveColor.value = ''
            calendarWaveTimer = null
        }, 1100)
    }

    const triggerCalendarConflicts = (days: string[]) => {
        const nextDays = Array.from(new Set(days.filter(Boolean)))
        if (!nextDays.length) return
        clearCalendarConflictTimer()
        calendarConflictDays.value = nextDays
        calendarConflictNonce.value += 1
        calendarConflictTimer = setTimeout(() => {
            calendarConflictDays.value = []
            calendarConflictTimer = null
        }, 1100)
    }

    const triggerRestStamp = (days: string[]) => {
        const nextDays = Array.from(new Set(days.filter(Boolean)))
        if (!nextDays.length) return
        clearCalendarRestStampTimer()
        calendarRestStampDays.value = nextDays
        calendarRestStampNonce.value += 1
        calendarRestStampTimer = setTimeout(() => {
            calendarRestStampDays.value = []
            calendarRestStampTimer = null
        }, 950)
    }

    const findCalendarDayCenter = (day: string) => {
        const shell = plannerSectionRef.value
        if (!shell || !day) return null
        const cell = shell.querySelector<HTMLElement>(`.cal-cell[data-day="${day}"]`)
        if (!cell) return null
        const rect = cell.getBoundingClientRect()
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        }
    }

    const findSelectedDaysCenter = () => {
        const host = selectedDaysRef.value
        const node = host instanceof HTMLElement
            ? host
            : ((host as any)?.$el as HTMLElement | undefined) ?? null
        if (!node) return null
        const rect = node.getBoundingClientRect()
        return {
            x: rect.left + Math.min(rect.width * 0.72, rect.width - 26),
            y: rect.top + Math.min(rect.height * 0.5, 28),
        }
    }

    const findSelectedChipElement = (day: string) => {
        const host = selectedDaysRef.value
        const node = host instanceof HTMLElement
            ? host
            : ((host as any)?.$el as HTMLElement | undefined) ?? null
        if (!node) return null
        return node.querySelector<HTMLElement>(`.selected-chip[data-selected-day="${day}"]`)
    }

    const getChipFlightTheme = (sourceEl?: HTMLElement | null) => {
        const style = sourceEl ? window.getComputedStyle(sourceEl) : null
        return {
            '--selection-chip-bg': style?.background || 'rgba(148, 163, 184, 0.08)',
            '--selection-chip-border': style?.borderColor || 'rgba(148, 163, 184, 0.25)',
            '--selection-chip-color': style?.color || 'var(--text-primary)',
        }
    }

    const buildPlanDropFlightStyle = (startX: number, startY: number, targetX: number, targetY: number, index: number, color: string) => ({
        left: `${startX}px`,
        top: `${startY}px`,
        '--plan-drop-x': `${targetX - startX}px`,
        '--plan-drop-y': `${targetY - startY}px`,
        '--plan-drop-delay': `${index * 70}ms`,
        '--plan-drop-bg': color,
    })

    const triggerPlanDrop = (event: MouseEvent | undefined, label: string, days: string[], color: string) => {
        const shell = plannerSectionRef.value
        if (!shell || !days.length) return
        const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
        const rect = trigger?.getBoundingClientRect()
        const startX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
        const startY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
        const flights = days.slice(0, 10).map((day, index) => {
            const cell = shell.querySelector<HTMLElement>(`.cal-cell[data-day="${day}"]`)
            if (!cell) return null
            const cellRect = cell.getBoundingClientRect()
            return {
                id: `${day}-${index}-${Date.now()}`,
                label,
                style: buildPlanDropFlightStyle(
                    startX,
                    startY,
                    cellRect.left + cellRect.width / 2,
                    cellRect.top + cellRect.height / 2,
                    index,
                    color,
                ),
            }
        }).filter(Boolean) as Array<{ id: string; label: string; style: Record<string, string> }>

        if (!flights.length) return
        clearPlanDropTimer()
        planDropFlights.value = flights
        planDropTimer = setTimeout(() => {
            planDropFlights.value = []
            planDropTimer = null
        }, 980)
    }

    const clearPlannerFieldError = (field: keyof typeof plannerFormErrors.value) => {
        plannerFormErrors.value[field] = ''
    }

    const clearPlannerFormErrors = () => {
        plannerFormErrors.value.selectedPlan = ''
        plannerFormErrors.value.repeatWeeks = ''
        plannerFormErrors.value.repeatWeekdays = ''
        plannerFormErrors.value.selectedDays = ''
    }

    const openValidation = (lead: string, errors: string[]) => {
        clearPlannerFormErrors()
        clearPlannerValidation()
        if (lead.includes('Plan ausgew')) {
            plannerFormErrors.value.selectedPlan = errors[0] ?? 'Bitte wähle zuerst einen Trainingsplan.'
            plannerValidationLead.value = lead
            return
        }
        if (lead.includes('Wochentage fehlen')) {
            plannerFormErrors.value.repeatWeekdays = errors[0] ?? 'Bitte wähle mindestens einen Wochentag.'
            plannerValidationLead.value = lead
            return
        }
        if (lead.includes('Wochen fehlen') || lead.includes('Wiederholung')) {
            plannerFormErrors.value.repeatWeeks = errors[0] ?? 'Bitte prüfe die Wiederholung.'
            plannerValidationLead.value = lead
            return
        }
        if (lead.includes('Kein Tag ausgew')) {
            plannerFormErrors.value.selectedDays = errors[0] ?? 'Bitte wähle zuerst einen Tag.'
            plannerValidationLead.value = lead
            return
        }
        plannerValidationLead.value = lead
        plannerValidationItems.value = errors
    }

    const toUtcDayKey = (iso: string) => {
        const d = new Date(iso)
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const dayToIsoUtc = (day: string) => `${day}T00:00:00.000Z`

    const syncPlanColorInPlanner = (planId: string, color: string) => {
        if (!planId || !color) return
        const nextEntries = Object.entries(planner.value).map(([day, items]) => ([
            day,
            items.map(item => item.planId === planId ? { ...item, color } : item),
        ] as const))
        planner.value = Object.fromEntries(nextEntries)
    }

    const loadPlannerFromApi = async () => {
        const items = await listTrainingPlanner()
        const next: Record<string, { planId: string; planName: string; source: 'api' | 'guest'; color?: string }[]> = {}
        const rests: Record<string, true> = {}
        const completed: Record<string, true> = {}

        for (const item of items ?? []) {
            const day = toUtcDayKey(item.date)
            if (item.isRestDay) {
                rests[day] = true
                continue
            }
            if (!item.planId) continue

            const list = next[day] ?? []
            list.push({
                planId: item.planId,
                planName: item.planName ?? '',
                source: 'api',
                color: item.planColor ?? undefined,
            })
            next[day] = list

            if (item.isCompleted) completed[day] = true
        }

        planner.value = next
        restDays.value = rests
        completedDays.value = completed
    }

    const loadPlannerState = async () => {
        if (isAuthenticated.value) {
            await loadPlannerFromApi()
            return
        }

        loadPlanner()
        loadRestDays()
        loadCompletedDays()
    }

    const getPrimaryPlanForDay = (day: string) => {
        const list = planner.value[day] ?? []
        return list[0] ?? null
    }

    const applyPlanColor = async (planId: string, color?: string) => {
        if (!planId || !color) return
        const isApiPlan = (props.apiPlans ?? []).some(p => p.id === planId)

        planColors.value = { ...planColors.value, [planId]: color }
        syncPlanColorInPlanner(planId, color)

        if (isAuthenticated.value && isApiPlan) {
            void setTrainingPlanColor(planId, color)
        }

        savePlanColors()
        const affectedDays = Object.entries(planner.value)
            .filter(([, items]) => items.some(item => item.planId === planId))
            .map(([day]) => day)
        triggerCalendarWave(affectedDays, color)
    }

    const addPlanForDay = async (day: string, planId: string) => {
        const apiPlan = props.apiPlans.find(p => p.id === planId)
        const guestPlan = props.guestPlans.find(p => p.id === planId)
        const planName = apiPlan?.name ?? guestPlan?.name ?? ''
        const source: 'api' | 'guest' = apiPlan ? 'api' : 'guest'
        if (!planName) return

        if (restDays.value[day]) await removeRestDay(day)

        const list = planner.value[day] ?? []
        if (list.some(x => x.planId === planId)) return

        if (isAuthenticated.value && source === 'api') {
            const item = await addTrainingPlanner(planId, dayToIsoUtc(day))
            const color = item.planColor ?? apiColorMap.value[planId] ?? planColors.value[planId]
            planner.value[day] = [...list, { planId, planName, source, color }]
        } else {
            const color = planColors.value[planId]
            planner.value[day] = [...list, { planId, planName, source, color }]
            savePlanner()
        }

        triggerCalendarPulse('plan')
    }

    const updatePlanForDay = async (day: string, planId: string) => {
        const current = getPrimaryPlanForDay(day)
        if (!current) {
            await addPlanForDay(day, planId)
            return
        }

        if (current.planId !== planId) {
            await removePlanned(day, current.planId)
            await addPlanForDay(day, planId)
        }
    }

    const movePlanForDay = async (fromDay: string, toDay: string) => {
        if (!fromDay || !toDay || fromDay === toDay) return
        if (isPastDay(toDay)) {
            openValidation('Vergangenheit gesperrt.', ['Bitte wähle ein heutiges oder zukünftiges Datum.'])
            return
        }

        const current = getPrimaryPlanForDay(fromDay)
        if (!current) return

        const targetList = planner.value[toDay] ?? []
        if (targetList.length && !targetList.some(x => x.planId === current.planId)) {
            const existing = targetList[0]?.planName || 'ein anderer Plan'
            openValidation('Plan-Konflikt', [`${formatDayShort(toDay)}: bereits ${existing} geplant.`])
            return
        }

        await removePlanned(fromDay, current.planId)
        await addPlanForDay(toDay, current.planId)
    }

    const openDayPopup = (day: string) => {
        if (!day) return
        popupDay.value = day
        const primary = getPrimaryPlanForDay(day)
        popupPlanId.value = primary?.planId ?? selectedPlanId.value ?? ''
        popupColor.value = primary?.color ?? planColors.value[popupPlanId.value] ?? apiColorMap.value[popupPlanId.value] ?? ''
        showDayPopup.value = true
    }

    const closeDayPopup = () => {
        showDayPopup.value = false
    }

    const onPopupComplete = async (payload: { day: string; isCompleted: boolean; planId?: string | null }) => {
        await setCompletionForDay(payload.day, payload.isCompleted, payload.planId ?? undefined)
        closeDayPopup()
    }

    const onPopupPlan = async (payload: { day: string; planId: string; color?: string }) => {
        await applyPlanColor(payload.planId, payload.color)
        await addPlanForDay(payload.day, payload.planId)
        closeDayPopup()
    }

    const onPopupUpdate = async (payload: { day: string; planId: string; color?: string }) => {
        await applyPlanColor(payload.planId, payload.color)
        await updatePlanForDay(payload.day, payload.planId)
        closeDayPopup()
    }

    const onPopupRest = async (payload: { day: string; isRest: boolean }) => {
        if (payload.isRest) await addRestDay(payload.day)
        else await removeRestDay(payload.day)
        closeDayPopup()
    }

    const onPopupMove = async (payload: { day: string; toDay: string }) => {
        await movePlanForDay(payload.day, payload.toDay)
        closeDayPopup()
    }

    const onPopupClear = async (day: string) => {
        await clearDayPlans(day)
        if (restDays.value[day]) await removeRestDay(day)
        closeDayPopup()
    }

    const addPlanForSelectedDays = async (event?: MouseEvent) => {
        clearPlannerFormErrors()
        clearPlannerValidation()
        const id = selectedPlanId.value
        if (!id) {
            openValidation('Kein Plan ausgewählt.', ['Bitte wähle zuerst einen Trainingsplan.'])
            return
        }

        const hasWeekdays = repeatWeekdays.value.length > 0
        if (repeatWeeks.value != null && !hasWeekdays) {
            openValidation('Wochentage fehlen.', ['Bitte wähle mindestens einen Wochentag.'])
            return
        }
        if (hasWeekdays && (repeatWeeks.value == null || repeatWeeks.value === 0)) {
            openValidation('Wochen fehlen.', ['Bitte trage die Anzahl der Wochen ein.'])
            return
        }

        if (repeatWeeks.value != null && (repeatWeeks.value < 1 || repeatWeeks.value > 12)) {
            openValidation('Ungültige Wiederholung.', ['Maximale Wochenanzahl: 12.'])
            return
        }

        const apiPlan = props.apiPlans.find(p => p.id === id)
        const guestPlan = props.guestPlans.find(p => p.id === id)
        const planName = apiPlan?.name ?? guestPlan?.name ?? ''
        const source: 'api' | 'guest' = apiPlan ? 'api' : 'guest'
        if (!planName) return

        if (!selectedDay.value && selectedDays.value.length === 0 && !hasWeekdays) {
            openValidation('Kein Tag ausgewählt.', ['Bitte wähle zuerst einen Tag oder Wochentage aus.'])
            return
        }

        const targets = futureTargetDays.value
        const restConflicts = targets.filter(day => restDays.value[day])
        if (restConflicts.length) {
            triggerCalendarConflicts(restConflicts)
            openValidation(
                'Ruhetag erkannt.',
                restConflicts.map(day => `${formatDayShort(day)}: als Ruhetag markiert.`)
            )
        }

        const samePlanDays = targets.filter(day => {
            const list = planner.value[day] ?? []
            return list.some(x => x.planId === id)
        })
        if (samePlanDays.length) {
            triggerCalendarConflicts(samePlanDays)
            openValidation(
                'Plan bereits vorhanden.',
                samePlanDays.map(day => `${formatDayShort(day)}: Du hast schon an dem Tag ${planName} geplant.`)
            )
        }

        const conflicts = targets.filter(day => {
            const list = planner.value[day] ?? []
            if (!list.length) return false
            return !list.some(x => x.planId === id)
        })

        if (conflicts.length) {
            triggerCalendarConflicts(conflicts)
            openValidation(
                'Plan-Konflikt',
                conflicts.map(day => {
                    const existing = planner.value[day]?.[0]?.planName || 'ein anderer Plan'
                    return `${formatDayShort(day)}: bereits ${existing} geplant.`
                })
            )
        }

        const addTargets = conflicts.length
            ? targets.filter(d => !conflicts.includes(d) && !restConflicts.includes(d) && !samePlanDays.includes(d))
            : targets
        const finalTargets = addTargets.filter(d => !samePlanDays.includes(d) && !restConflicts.includes(d))
        if (finalTargets.length) {
            triggerPlanDrop(event, planName, finalTargets, selectedColor.value || '#818cf8')
        }

        let addedAny = false
        for (const day of finalTargets) {
            if (restDays.value[day]) continue

            const list = planner.value[day] ?? []
            if (list.some(x => x.planId === id)) continue

            if (isAuthenticated.value && source === 'api') {
                const item = await addTrainingPlanner(id, dayToIsoUtc(day))
                const color = item.planColor ?? apiColorMap.value[id]
                planner.value[day] = [...list, { planId: id, planName, source, color }]
            } else {
                const color = planColors.value[id]
                planner.value[day] = [...list, { planId: id, planName, source, color }]
                savePlanner()
            }
            addedAny = true
        }

        if (addedAny) {
            triggerCalendarWave(finalTargets, selectedColor.value || planColors.value[id] || apiColorMap.value[id] || '#818cf8')
            await nextTick()
            resetPlannerForm()
        }
    }

    const removePlanned = async (day: string, planId: string) => {
        const list = planner.value[day] ?? []
        const item = list.find(x => x.planId === planId)
        if (item?.source === 'api' && isAuthenticated.value) {
            await deleteTrainingPlanner(planId, dayToIsoUtc(day))
        }

        const next = list.filter(x => x.planId !== planId)
        if (next.length) planner.value[day] = next
        else {
            delete planner.value[day]
            const { [day]: _, ...rest } = completedDays.value
            completedDays.value = rest
        }

        if (!isAuthenticated.value || item?.source !== 'api') {
            savePlanner()
            saveCompletedDays()
        }
    }

    const clearDayPlans = async (day: string) => {
        const list = planner.value[day] ?? []
        if (!list.length) return

        for (const item of list) {
            if (item.source === 'api' && isAuthenticated.value) {
                await deleteTrainingPlanner(item.planId, dayToIsoUtc(day))
            }
        }

        delete planner.value[day]
        const { [day]: _, ...rest } = completedDays.value
        completedDays.value = rest
        if (!isAuthenticated.value) {
            savePlanner()
            saveCompletedDays()
        }
    }

    const clearDay = async (day: string) => {
        await clearDayPlans(day)
    }

    const requestRemovePlanned = (day: string, planId: string, planName?: string, event?: MouseEvent) => {
        launchDeleteTrash(
            [planName?.trim() || 'Trainingsplan'],
            event,
            () => removePlanned(day, planId),
            findCalendarDayCenter(day),
        )
    }

    const requestRemoveRestDay = (day: string, event?: MouseEvent) => {
        launchDeleteTrash(
            ['Ruhetag'],
            event,
            () => removeRestDay(day),
            findCalendarDayCenter(day),
        )
    }

    const requestClearDay = (day: string, event?: MouseEvent) => {
        const chips = [
            ...(planner.value[day] ?? []).map(item => item.planName?.trim() || 'Trainingsplan'),
            ...(restDays.value[day] ? ['Ruhetag'] : []),
        ]
        if (!chips.length) return
        launchDeleteTrash(chips, event, () => clearDay(day))
    }

    const addRestDay = async (day: string) => {
        if (restDays.value[day]) return

        await clearDayPlans(day)

        const { [day]: _, ...rest } = completedDays.value
        completedDays.value = rest

        if (isAuthenticated.value) {
            await addTrainingPlannerRestDay(dayToIsoUtc(day))
        } else {
            restDays.value = { ...restDays.value, [day]: true }
            saveRestDays()
            saveCompletedDays()
            triggerCalendarPulse('rest')
            triggerRestStamp([day])
            return
        }

        restDays.value = { ...restDays.value, [day]: true }
        triggerCalendarPulse('rest')
        triggerRestStamp([day])
    }

    const removeRestDay = async (day: string) => {
        if (!restDays.value[day]) return

        if (isAuthenticated.value) {
            await deleteTrainingPlannerRestDay(dayToIsoUtc(day))
        } else {
            const { [day]: _, ...rest } = restDays.value
            restDays.value = rest
            saveRestDays()
            return
        }

        const { [day]: _, ...rest } = restDays.value
        restDays.value = rest
    }

    const resetAllPlans = async () => {
        showResetConfirm.value = false
        const planEntries = Object.entries(planner.value)
        for (const [day, items] of planEntries) {
            for (const item of items) {
                if (item.source === 'api' && isAuthenticated.value) {
                    await deleteTrainingPlanner(item.planId, dayToIsoUtc(day))
                }
            }
        }

        const restKeys = Object.keys(restDays.value)
        if (isAuthenticated.value) {
            for (const day of restKeys) {
                await deleteTrainingPlannerRestDay(dayToIsoUtc(day))
            }
        }

        planner.value = {}
        restDays.value = {}
        completedDays.value = {}

        if (!isAuthenticated.value) {
            savePlanner()
            saveRestDays()
            saveCompletedDays()
        }
    }

    const requestResetAllPlans = (event?: MouseEvent) => {
        const chips = allPlannings.value.map(item =>
            item.type === 'plan'
                ? `${formatDayShort(item.day)} · ${item.planName ?? 'Trainingsplan'}`
                : `${formatDayShort(item.day)} · Ruhetag`
        )
        if (!chips.length) {
            showResetConfirm.value = false
            return
        }
        launchDeleteTrash(chips, event, () => resetAllPlans())
    }

    const onResetAllPlansClick = (event?: MouseEvent) => {
        const enabled = settings.confirmDeleteEnabled ?? true
        try {
            localStorage.setItem(LS_CONFIRM_DELETE_ENABLED, String(enabled))
            window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: enabled }))
        } catch { }

        if (enabled) {
            showResetConfirm.value = true
            return
        }

        void requestResetAllPlans(event)
    }

    const toggleRestForSelected = async () => {
        clearPlannerFormErrors()
        clearPlannerValidation()
        const hasWeekdays = repeatWeekdays.value.length > 0
        if (repeatWeeks.value != null && !hasWeekdays) {
            openValidation('Wochentage fehlen.', ['Bitte wähle mindestens einen Wochentag.'])
            return
        }
        if (hasWeekdays && (repeatWeeks.value == null || repeatWeeks.value === 0)) {
            openValidation('Wochen fehlen.', ['Bitte trage die Anzahl der Wochen ein.'])
            return
        }

        if (repeatWeeks.value != null && (repeatWeeks.value < 1 || repeatWeeks.value > 12)) {
            openValidation('Ungültige Wiederholung.', ['Maximale Wochenanzahl: 12.'])
            return
        }

        if (!selectedDay.value && selectedDays.value.length === 0) {
            openValidation('Kein Tag ausgewählt.', ['Bitte wähle zuerst einen Tag im Kalender.'])
            return
        }

        const targets = futureTargetDays.value
        if (!targets.length) return

        const planConflicts = targets.filter(day => (planner.value[day]?.length ?? 0) > 0)
        if (planConflicts.length) {
            triggerCalendarConflicts(planConflicts)
            openValidation(
                'Plan-Konflikt',
                planConflicts.map(day => {
                    const existing = planner.value[day]?.[0]?.planName || 'ein anderer Plan'
                    return `${formatDayShort(day)}: bereits ${existing} geplant.`
                })
            )
            return
        }

        if (allSelectedRest.value) {
            for (const day of targets) {
                await removeRestDay(day)
            }
            return
        }

        for (const day of targets) {
            await addRestDay(day)
        }
    }

    watch(selectedPlanId, value => {
        if (value) clearPlannerFieldError('selectedPlan')
        clearPlannerValidation()
    })

    watch(repeatWeeks, value => {
        if (value != null && value !== 0) clearPlannerFieldError('repeatWeeks')
        clearPlannerValidation()
    })

    watch(repeatWeekdays, value => {
        if (value.length) clearPlannerFieldError('repeatWeekdays')
        clearPlannerValidation()
    }, { deep: true })

    watch([selectedDay, selectedDays], ([day, days]) => {
        if (day || days.length) clearPlannerFieldError('selectedDays')
        clearPlannerValidation()
    }, { deep: true })

    onMounted(() => {
        loadPlanColors()
        loadPlannerState()
    })

    onUnmounted(() => {
        if (calendarPulseTimer) clearTimeout(calendarPulseTimer)
        clearCalendarWaveTimer()
        clearCalendarConflictTimer()
        clearCalendarRestStampTimer()
        clearPlanDropTimer()
        clearSelectionFlightTimer()
        clearColorBroadcastTimer()
        clearDeleteTrashTimer()
    })

    watch(
        () => auth.user,
        () => {
            loadPlannerState()
        }
    )

    const colorOptions = [
        { label: 'Rot', value: '#ef4444' },
        { label: 'Orange', value: '#f97316' },
        { label: 'Gelb', value: '#eab308' },
        { label: 'Grün', value: '#22c55e' },
        { label: 'Blau', value: '#3b82f6' },
        { label: 'Lila', value: '#8b5cf6' },
        { label: 'Pink', value: '#ec4899' },
        { label: 'Grau', value: '#94a3b8' },
    ]

    const selectedPlanIsApi = computed(() => {
        const id = selectedPlanId.value
        if (!id) return false
        return (props.apiPlans ?? []).some(p => p.id === id)
    })

    const selectedColor = computed({
        get: () => {
            const id = selectedPlanId.value
            if (!id) return ''
            return planColors.value[id] ?? apiColorMap.value[id] ?? ''
        },
        set: (v: string) => {
            const id = selectedPlanId.value
            if (!id) return

            const affectedDays = Object.entries(planner.value)
                .filter(([, items]) => items.some(item => item.planId === id))
                .map(([day]) => day)
            const origin = pendingColorBroadcastOrigin
            const orderedDays = origin ? orderDaysByDistance(affectedDays, origin) : affectedDays
            if (origin) {
                triggerColorBroadcastBurst(origin, v)
                pendingColorBroadcastOrigin = null
            }

            if (isAuthenticated.value && selectedPlanIsApi.value) {
                planColors.value = { ...planColors.value, [id]: v }
                syncPlanColorInPlanner(id, v)
                void setTrainingPlanColor(id, v)
                savePlanColors()
                triggerCalendarWave(orderedDays, v)
                return
            }

            planColors.value = { ...planColors.value, [id]: v }
            syncPlanColorInPlanner(id, v)
            savePlanColors()
            triggerCalendarWave(orderedDays, v)
        },
    })

    watch(
        [repeatWeeks, repeatWeekdays, selectedDay, selectedPlanId, selectedColor],
        () => {
            triggerRepeatPreviewWave()
        },
        { deep: true }
    )
</script>

<style scoped>
    .planner-wrap {
        margin-top: 1rem;
    }

    .planner-reveal-enter-active,
    .planner-reveal-leave-active {
        overflow: hidden;
        transform-origin: top center;
        transition: opacity .26s ease, transform .38s cubic-bezier(.22, 1, .36, 1), max-height .38s cubic-bezier(.22, 1, .36, 1), margin-top .38s cubic-bezier(.22, 1, .36, 1);
    }

    .planner-reveal-enter-from,
    .planner-reveal-leave-to {
        opacity: 0;
        transform: translateY(16px) scale(.988);
        max-height: 0;
        margin-top: 0;
    }

    .planner-reveal-enter-to,
    .planner-reveal-leave-from {
        opacity: 1;
        transform: translateY(0) scale(1);
        max-height: 1600px;
        margin-top: 1.25rem;
    }

    .planner-reveal-enter-active .planner-reveal-item {
        animation: plannerRevealItem .52s cubic-bezier(.22, 1, .36, 1) both;
    }

    .planner-reveal-enter-active .planner-reveal-item--head {
        animation-delay: .04s;
    }

    .planner-reveal-enter-active .planner-reveal-item--tip {
        animation-delay: .1s;
    }

    .planner-reveal-enter-active .planner-reveal-item--left {
        animation-delay: .16s;
    }

    .planner-reveal-enter-active .planner-reveal-item--side {
        animation-delay: .24s;
    }

    @keyframes plannerRevealItem {
        from {
            opacity: 0;
            transform: translateY(18px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .plan-calendar {
        margin-top: 1.25rem;
        padding: 1rem 1.1rem;
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.26);
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
    }

    html.dark-mode .plan-calendar {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .plan-calendar-toggle {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
    }

    .plan-calendar-toggle .btn {
        height: 40px;
        padding: 0 1.05rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.26);
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        font-weight: 800;
        font-size: .92rem;
        letter-spacing: -0.01em;
        cursor: pointer;
        transition: background .15s ease, border-color .15s ease, transform .15s ease, box-shadow .2s ease;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
    }

    .plan-calendar-toggle .btn:hover {
        border-color: rgba(129, 140, 248, 0.55);
        box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
        transform: translateY(-1px);
    }

    html.dark-mode .plan-calendar-toggle .btn {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .plan-calendar .card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        margin-bottom: .85rem;
    }

    .plan-calendar .card-title {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 800;
    }

    .plan-calendar-tip {
        font-size: .85rem;
        color: var(--text-secondary);
        margin-bottom: .6rem;
        font-weight: 600;
    }

    .plan-calendar-grid {
        display: grid;
        grid-template-columns: minmax(280px, 1.2fr) minmax(260px, 1fr);
        gap: 1rem;
        align-items: start;
    }

    .plan-calendar-left {
        display: grid;
        gap: .75rem;
    }

    .plan-calendar-left.is-pulsing-plan,
    .plan-calendar-left.is-pulsing-rest {
        transform-origin: center;
        animation: plannerCalendarPulse .7s cubic-bezier(.22, 1, .36, 1);
    }

    .plan-calendar-left.is-pulsing-plan {
        box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.18), 0 0 0 14px rgba(59, 130, 246, 0.08);
        border-radius: 18px;
    }

    .plan-calendar-left.is-pulsing-rest {
        box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2), 0 0 0 14px rgba(59, 130, 246, 0.1);
        border-radius: 18px;
    }

    @keyframes plannerCalendarPulse {
        0% {
            transform: translateY(0) scale(1);
            filter: saturate(1);
        }

        38% {
            transform: translateY(-2px) scale(1.01);
            filter: saturate(1.08);
        }

        100% {
            transform: translateY(0) scale(1);
            filter: saturate(1);
        }
    }

    .plan-legend {
        display: block;
        padding-bottom: .5rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.2);
    }

    .legend-list {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem .9rem;
    }

    .legend-item {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        font-weight: 700;
        color: var(--text-primary);
        font-size: .85rem;
        white-space: nowrap;
        letter-spacing: 0.01em;
    }

    .legend-dot {
        width: .6rem;
        height: .6rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.5);
        flex: 0 0 auto;
    }

    .legend-rest {
        width: .9rem;
        height: .6rem;
        border-radius: 6px;
        border: 1px dashed rgba(59, 130, 246, 0.7);
        background: repeating-linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.6),
            rgba(59, 130, 246, 0.6) 4px,
            rgba(59, 130, 246, 0.12) 4px,
            rgba(59, 130, 246, 0.12) 8px
        );
    }

    .plan-calendar-side {
        display: grid;
        gap: .75rem;
    }

    .side-title {
        font-weight: 800;
        color: var(--text-primary);
    }

    .side-title--mini {
        font-size: .82rem;
        letter-spacing: 0.01em;
    }

    .side-title.muted {
        color: var(--text-secondary);
    }

    .field-error {
        margin: -.12rem 0 0;
        color: #ef4444;
        font-size: .82rem;
        font-weight: 700;
        line-height: 1.35;
    }

    .plan-picker {
        display: grid;
        grid-template-columns: 1fr;
        gap: .6rem;
        align-items: stretch;
    }

    .plan-picker > .side-title--mini:first-child {
        display: none;
    }

    .plan-picker :deep(.popsel__label)::after {
        content: ': *';
    }


    .plan-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .6rem;
    }


    .plan-repeat {
        display: grid;
        gap: .5rem;
        padding: .65rem .75rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 7%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
    }

    .plan-repeat.has-error {
        border-color: color-mix(in srgb, #ef4444 52%, rgba(148, 163, 184, 0.2));
        box-shadow: 0 0 0 3px color-mix(in srgb, #ef4444 12%, transparent);
    }

    .repeat-row {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: .5rem;
        align-items: center;
    }

    .repeat-label {
        font-weight: 700;
        color: var(--text-secondary);
    }

    .repeat-input {
        height: 36px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
        color: var(--text-primary);
        padding: 0 .6rem;
        font-weight: 700;
    }

    .repeat-input.is-error {
        border-color: rgba(239, 68, 68, 0.55);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.14);
    }

    .repeat-weekdays {
        display: flex;
        flex-wrap: wrap;
        gap: .35rem;
    }

    .weekday-chip {
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-primary);
        padding: .28rem .55rem;
        border-radius: 999px;
        font-weight: 800;
        font-size: .78rem;
        cursor: pointer;
        transition: border-color .15s ease, background .15s ease, transform .15s ease;
    }

    .weekday-chip:hover {
        transform: translateY(-1px);
        border-color: rgba(129, 140, 248, 0.45);
    }

    .weekday-chip.active {
        border-color: rgba(34, 197, 94, 0.55);
        background: rgba(34, 197, 94, 0.12);
    }

    .weekday-chip.is-error {
        border-color: rgba(239, 68, 68, 0.42);
        background: color-mix(in srgb, #ef4444 10%, rgba(148, 163, 184, 0.08));
    }

    .selected-days {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
        position: relative;
        min-height: 2.2rem;
    }

    .selected-days.has-error {
        padding: .25rem;
        border-radius: 14px;
        border: 1px solid rgba(239, 68, 68, 0.3);
        background: rgba(239, 68, 68, 0.06);
    }

    .selected-chip {
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-primary);
        padding: .35rem .6rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: .82rem;
        cursor: pointer;
        transition: border-color .15s ease, background .15s ease, transform .15s ease;
    }

    .selected-chip-stack-move,
    .selected-chip-stack-enter-active,
    .selected-chip-stack-leave-active {
        transition: transform .34s cubic-bezier(.22, 1, .36, 1), opacity .24s ease;
    }

    .selected-chip-stack-enter-from,
    .selected-chip-stack-leave-to {
        opacity: 0;
        transform: translateY(8px) scale(.92);
    }

    .selected-chip-stack-leave-active {
        position: absolute;
    }

    .selected-chip:hover {
        transform: translateY(-1px);
        border-color: rgba(129, 140, 248, 0.45);
    }

    .selected-chip.active {
        border-color: rgba(34, 197, 94, 0.55);
        background: rgba(34, 197, 94, 0.12);
    }

    .rest-day-card {
        padding: .6rem .75rem;
        border-radius: 12px;
        border: 1px dashed rgba(148, 163, 184, 0.35);
        background: rgba(148, 163, 184, 0.08);
        font-weight: 700;
        color: var(--text-primary);
    }

    .rest-day-reveal-enter-active,
    .rest-day-reveal-leave-active {
        transform-origin: top center;
        transition: opacity .22s ease, transform .34s cubic-bezier(.22, 1, .36, 1), max-height .34s cubic-bezier(.22, 1, .36, 1), margin .28s ease;
        overflow: hidden;
    }

    .rest-day-reveal-enter-from,
    .rest-day-reveal-leave-to {
        opacity: 0;
        transform: translateY(-6px) scale(.96) rotate(-1deg);
        max-height: 0;
        margin-top: 0;
        margin-bottom: 0;
    }

    .rest-day-reveal-enter-to,
    .rest-day-reveal-leave-from {
        opacity: 1;
        transform: translateY(0) scale(1) rotate(0);
        max-height: 90px;
    }

    .rest-day-reveal-enter-active .rest-day-card {
        animation: restDayStamp .42s cubic-bezier(.2, .9, .2, 1) both;
    }

    @keyframes restDayStamp {
        0% {
            letter-spacing: 0.04em;
            box-shadow: 0 0 0 rgba(59, 130, 246, 0);
        }

        60% {
            letter-spacing: 0.015em;
            box-shadow: 0 14px 28px rgba(59, 130, 246, 0.14);
        }

        100% {
            letter-spacing: 0;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }
    }

    .plan-color {
        display: grid;
        gap: .4rem;
        padding: .65rem .75rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 7%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
    }

    .color-row {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
    }

    .color-chip {
        position: relative;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        border: 2px solid rgba(148, 163, 184, 0.45);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        cursor: pointer;
        transition: transform .12s ease, border-color .15s ease, box-shadow .2s ease, filter .2s ease;
    }

    .color-chip.active {
        border-color: rgba(255, 255, 255, 0.95);
        box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2), 0 0 0 7px rgba(129, 140, 248, 0.12), 0 10px 22px rgba(15, 23, 42, 0.22);
        transform: translateY(-1px) scale(1.08);
        filter: saturate(1.15) brightness(1.02);
    }

    .color-chip.active::after {
        content: '';
        position: absolute;
        inset: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
    }


    .side-empty {
        color: var(--text-secondary);
        font-weight: 600;
    }

    .planned-item-enter-active,
    .planned-item-leave-active,
    .planned-item-move {
        transition: transform .34s cubic-bezier(.22, 1, .36, 1), opacity .24s ease;
    }

    .planned-item-enter-from,
    .planned-item-leave-to {
        opacity: 0;
        transform: translateX(18px) translateY(4px) scale(.98);
    }

    .planner-validation-card {
        display: grid;
        gap: .45rem;
        padding: .75rem .85rem;
        border-radius: 14px;
        border: 1px solid rgba(245, 158, 11, 0.28);
        background: linear-gradient(180deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.06));
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
    }

    .planner-validation-title {
        font-size: .88rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .planner-validation-list {
        margin: 0;
        padding-left: 1rem;
        display: grid;
        gap: .28rem;
        color: var(--text-secondary);
        font-size: .82rem;
        font-weight: 700;
    }

    .delete-trash-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2800;
    }

    .delete-trash-flight {
        position: fixed;
        left: 0;
        top: 0;
        transform: translate(-50%, -50%);
        padding: 10px 14px;
        border-radius: 16px;
        border: 1px solid rgba(248, 113, 113, 0.28);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(254, 242, 242, 0.92));
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        will-change: transform, opacity;
    }

    .delete-trash-flight__title {
        display: block;
        max-width: min(46vw, 320px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #b91c1c;
        font-weight: 800;
        font-size: 0.92rem;
        letter-spacing: 0.01em;
    }

    .delete-trash-stack {
        position: fixed;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: .45rem;
        max-width: min(420px, calc(100vw - 2rem));
        transform: translate(-50%, -50%);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        will-change: transform, opacity;
    }

    .delete-trash-stack.is-crowded {
        gap: .18rem;
    }

    .delete-trash-stack.is-crowded .delete-trash-chip {
        margin-left: -.35rem;
    }

    .delete-trash-stack.is-crowded .delete-trash-chip:nth-child(3n) {
        margin-top: -.18rem;
    }

    .delete-trash-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        padding: .45rem .8rem;
        border-radius: 999px;
        border: 1px solid rgba(248, 113, 113, 0.22);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(254, 242, 242, 0.92));
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
        color: #b91c1c;
        font-size: .84rem;
        font-weight: 800;
        letter-spacing: -0.01em;
        white-space: nowrap;
    }

    .delete-trash-bin {
        position: fixed;
        left: 50%;
        bottom: 24px;
        width: 72px;
        height: 82px;
        transform: translateX(-50%);
        animation: delete-trash-bin-pop .3s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .delete-trash-bin__lid {
        position: absolute;
        top: 0;
        left: 10px;
        width: 52px;
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(180deg, #475569, #334155);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
    }

    .delete-trash-bin__lid::before {
        content: '';
        position: absolute;
        left: 18px;
        top: -6px;
        width: 16px;
        height: 8px;
        border-radius: 999px 999px 4px 4px;
        border: 2px solid rgba(71, 85, 105, 0.92);
        border-bottom: 0;
    }

    .delete-trash-bin__body {
        position: absolute;
        left: 14px;
        top: 12px;
        width: 44px;
        height: 58px;
        border-radius: 0 0 16px 16px;
        background: linear-gradient(180deg, #64748b, #475569);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 18px 32px rgba(15, 23, 42, 0.22);
    }

    .delete-trash-bin__body::before,
    .delete-trash-bin__body::after {
        content: '';
        position: absolute;
        top: 10px;
        bottom: 10px;
        width: 3px;
        border-radius: 999px;
        background: rgba(226, 232, 240, 0.48);
    }

    .delete-trash-bin__body::before {
        left: 12px;
        box-shadow: 9px 0 0 rgba(226, 232, 240, 0.36), 18px 0 0 rgba(226, 232, 240, 0.3);
    }

    .delete-trash-enter-active,
    .delete-trash-leave-active {
        transition: opacity .18s ease;
    }

    .delete-trash-enter-from,
    .delete-trash-leave-to {
        opacity: 0;
    }

    @keyframes delete-trash-bin-pop {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(12px) scale(0.9);
        }

        100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
    }

    @keyframes delete-trash-flight {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.94) rotate(0deg);
        }

        18% {
            opacity: 1;
        }

        72% {
            opacity: 1;
            transform: translate(calc(-50% + var(--delete-fly-x) * .82), calc(-50% + var(--delete-fly-y) * .82)) scale(.78) rotate(-10deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--delete-fly-x)), calc(-50% + var(--delete-fly-y))) scale(.26) rotate(-18deg);
        }
    }

    .side-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: .5rem;
    }

    .side-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .6rem;
        padding: .6rem .7rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 7%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
    }

    .side-color {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        flex: 0 0 auto;
    }

    html.dark-mode .plan-color,
    html.dark-mode .plan-repeat,
    html.dark-mode .side-item,
    html.dark-mode .rest-day-card {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 12%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 9%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.35);
    }


    html.dark-mode .selected-chip {
        background: rgba(2, 6, 23, 0.6);
        border-color: rgba(148, 163, 184, 0.4);
    }

    html.dark-mode .selected-chip.active {
        border-color: rgba(34, 197, 94, 0.6);
        background: rgba(34, 197, 94, 0.16);
    }

    html.dark-mode .selected-days.has-error {
        border-color: rgba(248, 113, 113, 0.4);
        background: rgba(127, 29, 29, 0.18);
    }

    html.dark-mode .planner-validation-card {
        border-color: rgba(251, 191, 36, 0.28);
        background: linear-gradient(180deg, rgba(120, 53, 15, 0.48), rgba(69, 26, 3, 0.28));
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.35);
    }

    html.dark-mode .delete-trash-flight {
        border-color: rgba(248, 113, 113, 0.32);
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.96), rgba(69, 10, 10, 0.88));
        box-shadow: 0 20px 42px rgba(2, 6, 23, 0.42);
    }

    html.dark-mode .delete-trash-flight__title {
        color: #fca5a5;
    }

    html.dark-mode .delete-trash-chip {
        border-color: rgba(248, 113, 113, 0.28);
        background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
        color: #f8fafc;
    }

    html.dark-mode .delete-trash-bin__lid {
        background: linear-gradient(180deg, #94a3b8, #64748b);
    }

    html.dark-mode .delete-trash-bin__lid::before {
        border-color: rgba(148, 163, 184, 0.92);
    }

    html.dark-mode .delete-trash-bin__body {
        background: linear-gradient(180deg, #64748b, #334155);
    }

    html.dark-mode .delete-trash-bin__body::before {
        box-shadow: 9px 0 0 rgba(226, 232, 240, 0.26), 18px 0 0 rgba(226, 232, 240, 0.2);
    }

    .plan-drop-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2750;
    }

    .selection-flight-overlay,
    .color-broadcast-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
    }

    .selection-flight-overlay {
        z-index: 2760;
    }

    .color-broadcast-overlay {
        z-index: 2740;
    }

    .selection-flight {
        position: fixed;
        left: 0;
        top: 0;
        transform: translate(-50%, -50%);
        will-change: transform, opacity;
    }

    .selection-flight--trail {
        width: var(--selection-distance, 120px);
        height: 6px;
        border-radius: 999px;
        transform-origin: left center;
        background: linear-gradient(90deg, rgba(129, 140, 248, 0.04), rgba(129, 140, 248, 0.92), rgba(255, 255, 255, 0));
        box-shadow: 0 0 14px rgba(129, 140, 248, 0.28);
        animation: selection-trail-flight .72s cubic-bezier(.22, 1, .36, 1) forwards;
    }

    .selection-flight--chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
        padding: .4rem .8rem;
        border-radius: 999px;
        border: 1px solid var(--selection-chip-border, rgba(148, 163, 184, 0.28));
        background: var(--selection-chip-bg, linear-gradient(180deg, rgba(255,255,255,.96), rgba(241,245,249,.92)));
        color: var(--selection-chip-color, var(--text-primary));
        box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
        animation: selection-chip-return .86s cubic-bezier(.22, 1, .36, 1) forwards;
        animation-delay: var(--selection-flight-delay, 0ms);
    }

    .selection-flight__label {
        white-space: nowrap;
        font-size: .82rem;
        font-weight: 800;
        letter-spacing: -.01em;
    }

    .color-broadcast-burst {
        position: fixed;
        left: 0;
        top: 0;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        transform: translate(-50%, -50%);
        background: color-mix(in srgb, var(--broadcast-color, #818cf8) 48%, white 52%);
        box-shadow:
            0 0 0 0 color-mix(in srgb, var(--broadcast-color, #818cf8) 22%, transparent),
            0 0 20px color-mix(in srgb, var(--broadcast-color, #818cf8) 26%, transparent);
        animation: color-broadcast-burst .82s cubic-bezier(.22, 1, .36, 1) forwards;
    }

    .plan-drop-chip {
        position: fixed;
        left: 0;
        top: 0;
        transform: translate(-50%, -50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 34px;
        padding: .45rem .82rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.88);
        background:
            radial-gradient(circle at 24% 20%, rgba(255, 255, 255, 0.32), transparent 55%),
            var(--plan-drop-bg, #818cf8);
        color: #fff;
        font-size: .82rem;
        font-weight: 800;
        letter-spacing: -0.01em;
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.26);
        animation: plan-drop-flight .88s cubic-bezier(.22, 1, .36, 1) forwards;
        animation-delay: var(--plan-drop-delay, 0ms);
        will-change: transform, opacity;
        white-space: nowrap;
    }

    .plan-drop-enter-active,
    .plan-drop-leave-active {
        transition: opacity .18s ease;
    }

    .plan-drop-enter-from,
    .plan-drop-leave-to {
        opacity: 0;
    }

    @keyframes plan-drop-flight {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(.8) rotate(-6deg);
        }

        18% {
            opacity: 1;
            transform: translate(calc(-50% + var(--plan-drop-x) * .18), calc(-50% + var(--plan-drop-y) * .18)) scale(1.02) rotate(-3deg);
        }

        72% {
            opacity: 1;
            transform: translate(calc(-50% + var(--plan-drop-x) * .88), calc(-50% + var(--plan-drop-y) * .88)) scale(.74) rotate(4deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--plan-drop-x)), calc(-50% + var(--plan-drop-y))) scale(.24) rotate(10deg);
        }
    }

    @keyframes selection-trail-flight {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--selection-angle)) scaleX(.18);
        }

        22% {
            opacity: 1;
            transform: translate(calc(-50% + var(--selection-fly-x) * .14), calc(-50% + var(--selection-fly-y) * .14)) rotate(var(--selection-angle)) scaleX(.58);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--selection-fly-x)), calc(-50% + var(--selection-fly-y))) rotate(var(--selection-angle)) scaleX(.96);
        }
    }

    @keyframes selection-chip-return {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        68% {
            opacity: 1;
            transform: translate(calc(-50% + var(--selection-fly-x) * .86), calc(-50% + var(--selection-fly-y) * .86)) scale(.72) rotate(-7deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--selection-fly-x)), calc(-50% + var(--selection-fly-y))) scale(.28) rotate(-12deg);
        }
    }

    @keyframes color-broadcast-burst {
        0% {
            opacity: .88;
            transform: translate(-50%, -50%) scale(.72);
            box-shadow:
                0 0 0 0 color-mix(in srgb, var(--broadcast-color, #818cf8) 22%, transparent),
                0 0 20px color-mix(in srgb, var(--broadcast-color, #818cf8) 26%, transparent);
        }

        72% {
            opacity: .3;
            transform: translate(-50%, -50%) scale(4.8);
            box-shadow:
                0 0 0 28px color-mix(in srgb, var(--broadcast-color, #818cf8) 0%, transparent),
                0 0 34px color-mix(in srgb, var(--broadcast-color, #818cf8) 18%, transparent);
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(5.6);
            box-shadow:
                0 0 0 42px color-mix(in srgb, var(--broadcast-color, #818cf8) 0%, transparent),
                0 0 34px color-mix(in srgb, var(--broadcast-color, #818cf8) 0%, transparent);
        }
    }

    html.dark-mode .color-chip.active {
        border-color: rgba(255, 255, 255, 0.92);
        box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.24), 0 0 0 7px rgba(129, 140, 248, 0.14), 0 12px 24px rgba(2, 6, 23, 0.42);
    }

    html.dark-mode .color-chip.active::after {
        background: rgba(241, 245, 249, 0.98);
    }

    html.dark-mode .weekday-chip {
        background: rgba(2, 6, 23, 0.6);
        border-color: rgba(148, 163, 184, 0.4);
    }

    html.dark-mode .weekday-chip.active {
        border-color: rgba(34, 197, 94, 0.6);
        background: rgba(34, 197, 94, 0.16);
    }

    html.dark-mode .rest-pill {
        background: rgba(2, 6, 23, 0.65);
        border-color: rgba(148, 163, 184, 0.45);
        color: rgba(226, 232, 240, 0.8);
    }

    .side-name {
        font-weight: 700;
        color: var(--text-primary);
    }

    .all-plans-reveal-enter-active,
    .all-plans-reveal-leave-active {
        transition: height .36s cubic-bezier(.22, 1, .36, 1), opacity .28s ease, transform .36s cubic-bezier(.22, 1, .36, 1);
        overflow: hidden;
        will-change: height, opacity, transform;
    }

    .all-plans-reveal-enter-from,
    .all-plans-reveal-leave-to {
        opacity: 0;
        transform: translateY(-10px) scale(.985);
    }

    .all-plans-reveal-enter-to,
    .all-plans-reveal-leave-from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    .all-plans {
        margin-top: .5rem;
        display: grid;
        gap: .6rem;
        transform-origin: top center;
    }

    .all-plans-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
    }

    .btn-reset {
        height: 32px;
        padding: 0 .75rem;
        font-size: .82rem;
        border-radius: 10px;
    }

    .rest-pill {
        font-size: .72rem;
        font-weight: 800;
        letter-spacing: .06em;
        text-transform: uppercase;
        padding: .2rem .5rem;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.12);
        border: 1px solid rgba(148, 163, 184, 0.35);
        color: var(--text-secondary);
    }

    .plan-calendar .btn {
        height: 38px;
        padding: 0 .9rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: color-mix(in srgb, var(--bg-card) 88%, #020617 12%);
        color: var(--text-primary);
        font-weight: 800;
        font-size: .9rem;
        letter-spacing: -0.01em;
        cursor: pointer;
        transition: background .15s ease, border-color .15s ease, transform .15s ease, box-shadow .2s ease;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
    }

    .plan-calendar .btn:hover {
        border-color: rgba(129, 140, 248, 0.45);
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.22);
        transform: translateY(-1px);
    }

    .plan-calendar .btn.primary {
        background: linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 28%, transparent), color-mix(in srgb, var(--accent-primary) 12%, transparent)), color-mix(in srgb, var(--bg-card) 88%, #020617 12%);
        border-color: rgba(129, 140, 248, 0.55);
    }


    .plan-calendar .btn.ghost {
        background: transparent;
        box-shadow: none;
    }

    .plan-calendar .btn.ghost:hover {
        background: rgba(148, 163, 184, 0.12);
    }

    .btn-remove {
        border: 1px solid rgba(148, 163, 184, 0.2);
        padding: 0 .65rem;
        height: 32px;
        font-size: .82rem;
        border-radius: 10px;
    }

    .btn-remove:hover {
        border-color: rgba(239, 68, 68, 0.4);
        background: rgba(239, 68, 68, 0.08);
        color: var(--text-primary);
    }

    .plan-calendar .btn.danger {
        border-color: rgba(239, 68, 68, 0.35);
        background: color-mix(in srgb, #ef4444 12%, transparent);
    }

    html.dark-mode .plan-calendar .btn {
        background: rgba(2, 6, 23, 0.65);
        border-color: rgba(148, 163, 184, 0.34);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
    }

    html.dark-mode .plan-calendar .btn.ghost:hover {
        background: rgba(148, 163, 184, 0.12);
    }

    html.dark-mode .plan-calendar .btn.primary {
        border-color: rgba(129, 140, 248, 0.65);
    }

    @media (max-width: 900px) {
        .plan-calendar-grid {
            grid-template-columns: 1fr;
        }

        .plan-picker {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 520px) {
        .plan-actions {
            grid-template-columns: 1fr;
        }

        .all-plans-head {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>
