<template>
    <div v-if="hasAnyPlans" class="planner-wrap">
        <div class="plan-calendar-toggle">
            <button type="button"
                    class="btn primary"
                    @click="showPlanner = !showPlanner">
                {{ showPlanner ? 'Kalender ausblenden' : 'Workout planen' }}
            </button>
        </div>

        <section v-if="showPlanner" class="plan-calendar card">
            <div class="card-head">
                <h3 class="card-title">📅 Trainingsplaner</h3>
                <button type="button" class="btn ghost" @click="selectToday">Heute</button>
            </div>

            <div class="plan-calendar-grid">
                <div class="plan-calendar-left">
                    <Calender :daysWithEntries="plannedDays"
                              :dayColors="plannedDayColors"
                              :dayTitles="plannedDayTitles"
                              :selectedDays="selectedDays"
                              :restDays="Object.keys(restDays)"
                              :minDate="todayKey"
                              @select="onCalendarSelect" />

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

                <div class="plan-calendar-side">
                    <div class="side-title">Ausgewählt ({{ selectedDaysSorted.length }})</div>
                    <div class="selected-days">
                        <button v-for="d in selectedDaysSorted"
                                :key="d"
                                type="button"
                                class="selected-chip"
                                :class="{ active: d === selectedDay }"
                                @click="focusDay(d)">
                            {{ formatDayShort(d) }}
                        </button>
                    </div>
                    <button v-if="selectedDaysSorted.length > 1"
                            type="button"
                            class="btn ghost"
                            @click="clearSelection">
                        Auswahl leeren
                    </button>

                    <div v-if="!selectedDay" class="side-empty">
                        Wähle zuerst einen Tag im Kalender. Vergangenheit ist gesperrt.
                    </div>

                    <div class="side-title" :class="{ muted: !selectedDay }">Geplant für {{ selectedDay ? formatDayShort(selectedDay) : "—" }}</div>

                    <div class="plan-picker">
                        <UiPopupSelect label="Plan wählen"
                                       placeholder="Plan auswählen"
                                       v-model="selectedPlanId"
                                       :options="planOptions" />

                        <div class="plan-color">
                            <div class="side-title">Plan‑Farbe</div>
                            <div class="color-row">
                                <button v-for="c in colorOptions"
                                        :key="c.value"
                                        type="button"
                                        class="color-chip"
                                        :class="{ active: selectedColor === c.value }"
                                        :style="{ background: c.value }"
                                        :title="c.label"
                                        @click="selectedColor = c.value">
                                </button>
                            </div>
                        </div>

                        <div class="plan-repeat">
                            <div class="side-title">Wiederholung</div>
                            <div class="repeat-row">
                                <label class="repeat-label">Wochen</label>
                                <input v-model.number="repeatWeeks"
                                       class="repeat-input"
                                       type="number"
                                       min="1"
                                       max="12"
                                       placeholder="z.B. 4" />
                            </div>
                            <div class="repeat-weekdays">
                                <button v-for="(label, idx) in ['Mo','Di','Mi','Do','Fr','Sa','So']"
                                        :key="label"
                                        type="button"
                                        class="weekday-chip"
                                        :class="{ active: repeatWeekdays.includes(idx) }"
                                        @click="repeatWeekdays = repeatWeekdays.includes(idx)
                                            ? repeatWeekdays.filter(d => d !== idx)
                                            : [...repeatWeekdays, idx]">
                                    {{ label }}
                                </button>
                            </div>
                        </div>

                        <div class="plan-actions">
                            <button type="button" class="btn primary" @click="addPlanForSelectedDays">
                                Hinzufügen
                            </button>
                            <button type="button" class="btn ghost" @click="toggleRestForSelected">
                                {{ allSelectedRest ? 'Ruhetage entfernen' : 'Ruhetage eintragen' }}
                            </button>
                        </div>
                    </div>

                    <div v-if="selectedHasRest" class="rest-day-card">
                        Ruhetag geplant.
                    </div>

                    <button
                            type="button"
                            class="btn ghost"
                            @click="showAllPlans = !showAllPlans">
                        {{ showAllPlans ? 'Meine Planungen schließen' : 'Meine Planungen ansehen' }}
                    </button>

                    <div v-if="selectedDay && !plannedForSelected.length && !selectedHasRest" class="side-empty">
                        Kein Training geplant.
                    </div>

                    <ul v-else-if="selectedDay" class="side-list">
                        <li v-for="p in plannedForSelected" :key="p.planId" class="side-item">
                            <span class="side-color" :style="{ background: p.color || planColors[p.planId] || apiColorMap[p.planId] || '#94a3b8' }"></span>
                            <span class="side-name">{{ p.planName }}</span>
                            <button type="button" class="btn ghost btn-remove" @click="removePlanned(selectedDay, p.planId)">
                                Entfernen
                            </button>
                        </li>
                    </ul>

                    <button v-if="selectedDay && plannedForSelected.length"
                            type="button"
                            class="btn ghost danger"
                            @click="clearDay(selectedDay)">
                        Tag leeren
                    </button>

                    <div v-if="showAllPlans" class="all-plans" ref="allPlansRef">
                        <div class="all-plans-head">
                            <div class="side-title">Alle Planungen</div>
                            <button type="button"
                                    class="btn ghost btn-reset"
                                    @click="onResetAllPlansClick">
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
                                    {{ formatDayShort(p.day) }} · {{ p.type === 'plan' ? p.planName : 'Ruhetag' }}
                                </span>
                                <button v-if="p.type === 'plan'"
                                        type="button"
                                        class="btn ghost btn-remove"
                                        @click="removePlanned(p.day, p.planId!)">
                                    Entfernen
                                </button>
                                <button v-else
                                        type="button"
                                        class="btn ghost btn-remove"
                                        @click="removeRestDay(p.day)">
                                    Entfernen
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <ValidationPopup :show="showValidation"
                         title="Plan-Konflikt"
                         :lead="validationLead"
                         :errors="validationErrors"
                         @close="showValidation = false" />

        <DeleteConfirmPopup :show="showResetConfirm"
                            @confirm="resetAllPlans"
                            @cancel="showResetConfirm = false" />
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref, watch, nextTick } from 'vue'
    import Calender from '@/components/ui/kits/calender/Calender.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import { LS_TRAINING_PLANNER, LS_TRAINING_PLAN_COLORS, LS_TRAINING_REST_DAYS, LS_CONFIRM_DELETE_ENABLED } from '@/constants/storageKeys'
    import type { TrainingPlan as TrainingPlanDto } from "@/types/TrainingPlan"
    import { useAuthStore } from '@/store/authStore'
    import { useSettingsStore } from '@/store/settingsStore'
    import { addTrainingPlanner, addTrainingPlannerRestDay, deleteTrainingPlanner, deleteTrainingPlannerRestDay, listTrainingPlanner } from '@/services/trainingPlanner'
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
    const selectedPlanId = ref<string>('')
    const todayKey = new Date().toISOString().slice(0, 10)
    const selectedDay = ref<string>('')
    const selectedDays = ref<string[]>([])
    const repeatWeeks = ref<number | null>(null)
    const repeatWeekdays = ref<number[]>([])

    const planner = ref<Record<string, { planId: string; planName: string; source: 'api' | 'guest'; color?: string }[]>>({})
    const restDays = ref<Record<string, true>>({})
    const planColors = ref<Record<string, string>>({})
    const auth = useAuthStore()
    const settings = useSettingsStore()
    const showValidation = ref(false)
    const validationErrors = ref<string[]>([])
    const validationLead = ref('Bitte überprüfe die folgenden Punkte:')
    const showAllPlans = ref(false)
    const allPlansRef = ref<HTMLElement | null>(null)
    const showResetConfirm = ref(false)

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

    const savePlanner = () => {
        localStorage.setItem(LS_TRAINING_PLANNER, JSON.stringify(planner.value))
    }

    const saveRestDays = () => {
        localStorage.setItem(LS_TRAINING_REST_DAYS, JSON.stringify(Object.keys(restDays.value)))
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

    const onCalendarSelect = (day: string) => {
        const idx = selectedDays.value.indexOf(day)
        if (idx >= 0) {
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

        selectedDays.value.push(day)
        selectedDay.value = day
    }

    const selectToday = () => {
        selectedDay.value = todayKey
        selectedDays.value = [todayKey]
    }

    const focusDay = (day: string) => {
        if (!selectedDays.value.includes(day)) {
            selectedDays.value = [day]
        }
        selectedDay.value = day
    }

    const clearSelection = () => {
        if (!selectedDay.value) {
            selectedDays.value = []
            return
        }
        selectedDays.value = [selectedDay.value]
    }

    const formatDayShort = (yyyyMMdd: string) => {
        const [y, m, d] = yyyyMMdd.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
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

    const openValidation = (lead: string, errors: string[]) => {
        validationLead.value = lead
        validationErrors.value = errors
        showValidation.value = true
    }

    const toUtcDayKey = (iso: string) => {
        const d = new Date(iso)
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const dayToIsoUtc = (day: string) => `${day}T00:00:00.000Z`

    const loadPlannerFromApi = async () => {
        const items = await listTrainingPlanner()
        const next: Record<string, { planId: string; planName: string; source: 'api' | 'guest'; color?: string }[]> = {}
        const rests: Record<string, true> = {}

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
        }

        planner.value = next
        restDays.value = rests
    }

    const loadPlannerState = async () => {
        if (isAuthenticated.value) {
            await loadPlannerFromApi()
            return
        }

        loadPlanner()
        loadRestDays()
    }

    const addPlanForSelectedDays = async () => {
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
            showAllPlans.value = true
            await nextTick()
            requestAnimationFrame(() => {
                const el = allPlansRef.value
                if (!el) return
                const top = el.getBoundingClientRect().top + window.scrollY - 12
                window.scrollTo({ top, behavior: 'smooth' })
            })
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
        else delete planner.value[day]

        if (!isAuthenticated.value || item?.source !== 'api') savePlanner()
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
        if (!isAuthenticated.value) savePlanner()
    }

    const clearDay = async (day: string) => {
        await clearDayPlans(day)
    }

    const addRestDay = async (day: string) => {
        if (restDays.value[day]) return

        await clearDayPlans(day)

        if (isAuthenticated.value) {
            await addTrainingPlannerRestDay(dayToIsoUtc(day))
        } else {
            restDays.value = { ...restDays.value, [day]: true }
            saveRestDays()
            return
        }

        restDays.value = { ...restDays.value, [day]: true }
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

        if (!isAuthenticated.value) {
            savePlanner()
            saveRestDays()
        }
    }

    const onResetAllPlansClick = () => {
        const enabled = settings.confirmDeleteEnabled ?? true
        try {
            localStorage.setItem(LS_CONFIRM_DELETE_ENABLED, String(enabled))
            window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: enabled }))
        } catch { }

        if (enabled) {
            showResetConfirm.value = true
            return
        }

        void resetAllPlans()
    }

    const toggleRestForSelected = async () => {
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

    onMounted(() => {
        loadPlanColors()
        loadPlannerState()
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

            if (isAuthenticated.value && selectedPlanIsApi.value) {
                planColors.value = { ...planColors.value, [id]: v }
                void setTrainingPlanColor(id, v)
                savePlanColors()
                return
            }

            planColors.value = { ...planColors.value, [id]: v }
            savePlanColors()
        },
    })
</script>

<style scoped>
    .planner-wrap {
        margin-top: 1rem;
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

    .side-title.muted {
        color: var(--text-secondary);
    }

    .plan-picker {
        display: grid;
        grid-template-columns: 1fr;
        gap: .6rem;
        align-items: stretch;
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

    .selected-days {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
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
        width: 26px;
        height: 26px;
        border-radius: 999px;
        border: 2px solid rgba(148, 163, 184, 0.45);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        cursor: pointer;
        transition: transform .12s ease, border-color .15s ease, box-shadow .2s ease;
    }

    .color-chip.active {
        border-color: rgba(129, 140, 248, 0.8);
        box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        transform: translateY(-1px);
    }

    .side-empty {
        color: var(--text-secondary);
        font-weight: 600;
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

    .all-plans {
        margin-top: .5rem;
        display: grid;
        gap: .6rem;
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

