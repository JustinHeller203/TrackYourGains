<!--components/ui/kits/calender/Calender.vue-->

<template>
    <div class="cal">
        <div class="cal-head">
            <button type="button"
                    class="cal-nav"
                    @click="prevMonth"
                    :aria-label="t('calendar.previousMonthAria')">
                <span class="cal-chevron cal-chevron--left" aria-hidden="true"></span>
            </button>

            <div class="cal-title"
                 role="button"
                 tabindex="0"
                 @dblclick.stop="openPicker"
                 @keydown.enter.prevent="openPicker">
                {{ monthTitle }}
            </div>

            <button type="button"
                    class="cal-nav"
                    @click="nextMonth"
                    :aria-label="t('calendar.nextMonthAria')">
                <span class="cal-chevron cal-chevron--right" aria-hidden="true"></span>
            </button>
        </div>

        <!-- Quick Month/Year Picker (Ã¶ffnet bei Doppelklick auf den Titel) -->
        <BasePopup :show="showPicker"
                   :title="t('calendar.quickJumpTitle')"
                   overlayClass="cal-pick-popup"
                   @cancel="closePicker">

            <div class="cal-pick-fields">
                <UiPopupSelect v-model="pickMonthStr"
                               :label="t('calendar.monthLabel')"
                               :placeholder="t('calendar.monthPlaceholder')"
                               :options="monthOptions" />

                <UiPopupInput v-model="pickYearStr"
                              :label="t('calendar.yearLabel')"
                              :placeholder="t('calendar.yearPlaceholder')"
                              inputmode="numeric"
                              type="number" />
            </div>

            <template #actions>
                <PopupActionButton variant="ghost" @click="closePicker">
                    {{ t('common.cancel') }}
                </PopupActionButton>

                <PopupActionButton @click="applyPicker">
                    {{ t('calendar.searchAction') }}
                </PopupActionButton>
            </template>

        </BasePopup>

        <div class="cal-weekdays">
            <span v-for="d in weekdayLabels" :key="d" class="cal-wd">{{ d }}</span>
        </div>

        <div class="cal-grid-shell">
            <Transition :name="monthTransitionName" mode="out-in">
                <div :key="monthTransitionKey" class="cal-grid">
            <button v-for="cell in monthCells"
                    :key="cell.key"
                    :data-day="cell.day || ''"
                    type="button"
                    class="cal-cell"
                    :style="cell.day ? cellStyle(cell.day) : undefined"
                    :class="{
                        'is-out': !cell.inMonth,
                        'has-entry': !!cell.day && hasEntries(cell.day),
                        'is-first-entry': !!cell.day && isFirstEntry(cell.day),
                        'has-pr': !!cell.day && hasPr(cell.day),
                        'has-check': !!cell.day && hasCheck(cell.day),
                        'has-cross': !!cell.day && hasCross(cell.day),
                        'is-today': cell.day === todayKey,
                        'is-selected': !!cell.day && isSelected(cell.day),
                        'is-past': !!cell.day && isPast(cell.day),
                        'is-rest': !!cell.day && isRest(cell.day),
                        'is-pulse-target': !!cell.day && isPulseTarget(cell.day),
                        'is-preview-target': !!cell.day && isPreviewDay(cell.day),
                        'is-wave-target': !!cell.day && isWaveTarget(cell.day),
                        'is-conflict-target': !!cell.day && isConflictTarget(cell.day),
                        'is-rest-stamp-target': !!cell.day && isRestStampTarget(cell.day),
                        'is-range-bridge-left': !!cell.day && isRangeBridgeLeft(cell.day),
                        'is-range-bridge-right': !!cell.day && isRangeBridgeRight(cell.day)
                    }"
                    :disabled="!cell.day ? true : isPast(cell.day)"
                    @click="cell.day && emit('select', cell.day)"
                    @dblclick.stop="cell.day && emit('dblclick', cell.day)">
                <span class="cal-num">{{ cell.num }}</span>
                <span v-if="cell.day && isFirstEntry(cell.day)"
                      class="cal-first-badge"
                      :title="dotTitle(cell.day)"
                      aria-hidden="true">ðŸš€</span>
                <span v-if="cell.day && hasEntries(cell.day)"
                      class="cal-dot"
                      :style="dotStyle(cell.day)"
                      :title="dotTitle(cell.day)"
                      aria-hidden="true"></span>
                <span v-if="cell.day && hasEntries(cell.day) && trendFor(cell.day)"
                      class="cal-trend"
                      :class="`is-${trendFor(cell.day)}`"
                      aria-hidden="true">{{ trendSymbol(trendFor(cell.day)) }}</span>
                <span v-if="cell.day && hasCheck(cell.day)"
                      class="cal-check"
                      aria-hidden="true">âœ“</span>
                <span v-if="cell.day && hasCross(cell.day)"
                      class="cal-cross"
                      aria-hidden="true">âœ•</span>
            </button>
                </div>
            </Transition>
        </div>

        <div class="cal-hint">
            {{ t('calendar.hint.markedDays') }}
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onBeforeUnmount } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import { useI18n } from '@/composables/useI18n'


    const props = defineProps<{
        daysWithEntries: string[] // yyyy-mm-dd
        dayColors?: Record<string, string | string[]>
        dayTitles?: Record<string, string>
        dayTrends?: Record<string, 'up' | 'down' | 'same'>
        firstEntryDays?: string[]
        prDays?: string[]
        selectedDays?: string[]
        checkDays?: string[]
        crossDays?: string[]
        minDate?: string
        restDays?: string[]
        pulseDay?: string
        pulseNonce?: number
        previewDays?: string[]
        previewColor?: string
        waveDays?: string[]
        waveColor?: string
        waveNonce?: number
        conflictDays?: string[]
        conflictNonce?: number
        restStampDays?: string[]
        restStampNonce?: number
    }>()

    const emit = defineEmits<{
        (e: 'select', day: string): void
        (e: 'dblclick', day: string): void
    }>()
    const { locale, t } = useI18n()
    const localeCode = computed(() => locale.value === 'en' ? 'en-US' : 'de-DE')

    const dotStyle = (day: string) => {
        const colors = props.dayColors?.[day]
        if (!colors) return undefined

        if (Array.isArray(colors)) {
            const unique = colors.filter(Boolean)
            if (!unique.length) return undefined
            if (unique.length === 1) return { background: unique[0] }
            const stops = unique.map((c, i) => `${c} ${(i * 100) / unique.length}% ${(i + 1) * 100 / unique.length}%`)
            return { background: `conic-gradient(${stops.join(', ')})` }
        }

        return { background: colors }
    }

    const dotTitle = (day: string) => {
        return props.dayTitles?.[day] ?? ''
    }

    const trendFor = (day: string) => {
        return props.dayTrends?.[day] ?? null
    }

    const trendSymbol = (trend: 'up' | 'down' | 'same' | null) => {
        if (!trend) return ''
        if (trend === 'up') return 'â†‘'
        if (trend === 'down') return 'â†“'
        return '-'
    }

    const pad2 = (n: number) => String(n).padStart(2, '0')
    const toKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

    const todayKey = toKey(new Date())

    const now = new Date()
    const monthCursor = ref<Date>(new Date(now.getFullYear(), now.getMonth(), 1))

    const weekdayLabels = computed(() => {
        const baseMondayUtc = new Date(Date.UTC(2024, 0, 1))
        return Array.from({ length: 7 }, (_, index) => {
            const d = new Date(baseMondayUtc)
            d.setUTCDate(baseMondayUtc.getUTCDate() + index)
            return new Intl.DateTimeFormat(localeCode.value, { weekday: 'short' }).format(d)
        })
    })

    const monthTitle = computed(() => {
        const d = monthCursor.value
        return new Intl.DateTimeFormat(localeCode.value, { month: 'long', year: 'numeric' }).format(d)
    })
    const monthTransitionDirection = ref<'forward' | 'backward'>('forward')
    const monthTransitionName = computed(() =>
        monthTransitionDirection.value === 'forward' ? 'cal-slide-forward' : 'cal-slide-backward'
    )
    const monthTransitionKey = computed(() => {
        const d = monthCursor.value
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
    })

    const startOfGrid = (d: Date) => {
        const first = new Date(d.getFullYear(), d.getMonth(), 1)
        const js = first.getDay() // 0=So..6=Sa
        const mondayIndex = (js + 6) % 7
        const start = new Date(first)
        start.setDate(first.getDate() - mondayIndex)
        return start
    }

    type CalCell = { key: string; day: string | null; num: string; inMonth: boolean }

    const monthCells = computed<CalCell[]>(() => {
        const base = monthCursor.value
        const start = startOfGrid(base)
        const cells: CalCell[] = []
        const year = base.getFullYear()
        const month = base.getMonth()

        for (let i = 0; i < 42; i++) {
            const cur = new Date(start)
            cur.setDate(start.getDate() + i)

            const inMonth = cur.getMonth() === month && cur.getFullYear() === year
            const key = `${cur.getFullYear()}-${pad2(cur.getMonth() + 1)}-${pad2(cur.getDate())}`

            cells.push({
                key,
                day: inMonth ? key : null,
                num: String(cur.getDate()),
                inMonth,
            })
        }
        return cells
    })

    const daysSet = computed(() => new Set(props.daysWithEntries ?? []))
    const selectedSet = computed(() => new Set(props.selectedDays ?? []))
    const checkSet = computed(() => new Set(props.checkDays ?? []))
    const crossSet = computed(() => new Set(props.crossDays ?? []))
    const prSet = computed(() => new Set(props.prDays ?? []))
    const firstEntrySet = computed(() => new Set(props.firstEntryDays ?? []))
    const hasEntries = (day: string) => daysSet.value.has(day)
    const isFirstEntry = (day: string) => firstEntrySet.value.has(day)
    const hasPr = (day: string) => prSet.value.has(day)
    const hasCheck = (day: string) => checkSet.value.has(day)
    const hasCross = (day: string) => crossSet.value.has(day)
    const isSelected = (day: string) => selectedSet.value.has(day)
    const shiftDay = (day: string, amount: number) => {
        const date = new Date(`${day}T00:00:00`)
        date.setDate(date.getDate() + amount)
        return toKey(date)
    }
    const isRangeBridgeLeft = (day: string) => isSelected(day) && isSelected(shiftDay(day, -1))
    const isRangeBridgeRight = (day: string) => isSelected(day) && isSelected(shiftDay(day, 1))
    const restSet = computed(() => new Set(props.restDays ?? []))
    const isRest = (day: string) => restSet.value.has(day)
    const minDateKey = computed(() => props.minDate ?? '')
    const isPast = (day: string) => !!minDateKey.value && day < minDateKey.value
    const pulsingDay = ref('')
    let pulseTimer: ReturnType<typeof setTimeout> | null = null
    const isPulseTarget = (day: string) => pulsingDay.value === day
    const previewSet = computed(() => new Set(props.previewDays ?? []))
    const isPreviewDay = (day: string) => previewSet.value.has(day)
    const waveIndexByDay = computed(() => {
        const map = new Map<string, number>()
        for (const [index, day] of (props.waveDays ?? []).filter(Boolean).entries()) {
            if (!map.has(day)) map.set(day, index)
        }
        return map
    })
    const previewIndexByDay = computed(() => {
        const map = new Map<string, number>()
        for (const [index, day] of (props.previewDays ?? []).filter(Boolean).entries()) {
            if (!map.has(day)) map.set(day, index)
        }
        return map
    })
    const cellStyle = (day: string) => {
        const style: Record<string, string> = {}
        if (isPreviewDay(day) && props.previewColor) {
            style['--preview-color'] = props.previewColor
            const previewIndex = previewIndexByDay.value.get(day) ?? 0
            style['--preview-delay'] = `${Math.min(previewIndex, 18) * 60}ms`
        }
        if (isWaveTarget(day)) {
            const index = waveIndexByDay.value.get(day) ?? 0
            if (props.waveColor) style['--wave-color'] = props.waveColor
            style['--wave-delay'] = `${Math.min(index, 18) * 55}ms`
        }
        return Object.keys(style).length ? style : undefined
    }
    const wavingDays = ref<string[]>([])
    let waveTimer: ReturnType<typeof setTimeout> | null = null
    const isWaveTarget = (day: string) => wavingDays.value.includes(day)
    const conflictDays = ref<string[]>([])
    let conflictTimer: ReturnType<typeof setTimeout> | null = null
    const isConflictTarget = (day: string) => conflictDays.value.includes(day)
    const restStampDays = ref<string[]>([])
    let restStampTimer: ReturnType<typeof setTimeout> | null = null
    const isRestStampTarget = (day: string) => restStampDays.value.includes(day)

    const setMonthCursor = (nextDate: Date) => {
        const currentIndex = monthCursor.value.getFullYear() * 12 + monthCursor.value.getMonth()
        const nextIndex = nextDate.getFullYear() * 12 + nextDate.getMonth()
        monthTransitionDirection.value = nextIndex >= currentIndex ? 'forward' : 'backward'
        monthCursor.value = nextDate
    }

    const prevMonth = () => {
        const d = monthCursor.value
        setMonthCursor(new Date(d.getFullYear(), d.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        const d = monthCursor.value
        setMonthCursor(new Date(d.getFullYear(), d.getMonth() + 1, 1))
    }

    const monthNames = [
        'Januar', 'Februar', 'MÃ¤rz', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
    ]

    const legacyMonthOptions = monthNames.map((label, idx) => ({
        label,
        value: String(idx),
    }))

    const monthOptions = computed(() =>
        Array.from({ length: 12 }, (_, idx) => ({
            label: new Intl.DateTimeFormat(localeCode.value, { month: 'long' }).format(new Date(2024, idx, 1)) || legacyMonthOptions[idx]?.label || '',
            value: String(idx),
        }))
    )

    const showPicker = ref(false)

    // UiPopupSelect arbeitet mit strings -> wir mappen sauber
    const pickMonthStr = ref('0') // "0".."11"
    const pickYearStr = ref(String(new Date().getFullYear()))

    const openPicker = () => {
        const d = monthCursor.value
        pickMonthStr.value = String(d.getMonth())
        pickYearStr.value = String(d.getFullYear())
        showPicker.value = true
    }

    const closePicker = () => {
        showPicker.value = false
    }

    const applyPicker = () => {
        const y = Number(pickYearStr.value)
        const m = Number(pickMonthStr.value)

        if (!Number.isFinite(y) || y < 1900 || y > 2100) return
        if (!Number.isFinite(m) || m < 0 || m > 11) return

        setMonthCursor(new Date(y, m, 1))
        showPicker.value = false
    }

    const onKeydown = (ev: KeyboardEvent) => {
        if (ev.key !== 'Escape') return
        if (!showPicker.value) return
        closePicker()
    }

    watch(showPicker, (open) => {
        if (open) window.addEventListener('keydown', onKeydown)
        else window.removeEventListener('keydown', onKeydown)
    })

    watch(() => props.pulseNonce, () => {
        const day = String(props.pulseDay ?? '').trim()
        if (!day) return
        pulsingDay.value = day
        if (pulseTimer) clearTimeout(pulseTimer)
        pulseTimer = setTimeout(() => {
            pulsingDay.value = ''
            pulseTimer = null
        }, 900)
    })

    watch(() => props.waveNonce, () => {
        const days = (props.waveDays ?? []).filter(Boolean)
        if (!days.length) return
        wavingDays.value = days
        if (waveTimer) clearTimeout(waveTimer)
        waveTimer = setTimeout(() => {
            wavingDays.value = []
            waveTimer = null
        }, 1100)
    })

    watch(() => props.conflictNonce, () => {
        const days = (props.conflictDays ?? []).filter(Boolean)
        if (!days.length) return
        conflictDays.value = days
        if (conflictTimer) clearTimeout(conflictTimer)
        conflictTimer = setTimeout(() => {
            conflictDays.value = []
            conflictTimer = null
        }, 1100)
    })

    watch(() => props.restStampNonce, () => {
        const days = (props.restStampDays ?? []).filter(Boolean)
        if (!days.length) return
        restStampDays.value = days
        if (restStampTimer) clearTimeout(restStampTimer)
        restStampTimer = setTimeout(() => {
            restStampDays.value = []
            restStampTimer = null
        }, 950)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', onKeydown)
        if (pulseTimer) clearTimeout(pulseTimer)
        if (waveTimer) clearTimeout(waveTimer)
        if (conflictTimer) clearTimeout(conflictTimer)
        if (restStampTimer) clearTimeout(restStampTimer)
    })
</script>

<style scoped>
    /* Calendar */
    .cal {
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 18px;
        padding: .85rem;
        background: linear-gradient(180deg, rgba(148,163,184,0.06), rgba(148,163,184,0.03));
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        margin-bottom: .75rem;
    }

    .cal-head {
        display: grid;
        grid-template-columns: 2.75rem 1fr 2.75rem;
        align-items: center;
        gap: .5rem;
        margin-bottom: .6rem;
    }

    .cal-title {
        text-align: center;
        font-weight: 900;
        color: var(--text-primary);
        text-transform: capitalize;
    }

    .cal-weekdays {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: .35rem;
        margin-bottom: .35rem;
    }

    .cal-wd {
        text-align: center;
        font-size: .78rem;
        font-weight: 900;
        color: var(--text-secondary);
        letter-spacing: .02em;
        text-transform: uppercase;
    }

    .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: .35rem;
    }

    .cal-grid-shell {
        position: relative;
        overflow-x: clip;
        overflow-y: visible;
        padding: 6px;
        margin: -6px;
    }

    .cal-slide-forward-enter-active,
    .cal-slide-forward-leave-active,
    .cal-slide-backward-enter-active,
    .cal-slide-backward-leave-active {
        transition: transform .36s cubic-bezier(.22, 1, .36, 1), opacity .24s ease;
        will-change: transform, opacity;
    }

    .cal-slide-forward-enter-active .cal-dot,
    .cal-slide-forward-enter-active .cal-ghost-dot,
    .cal-slide-forward-enter-active .cal-trend,
    .cal-slide-forward-enter-active .cal-first-badge,
    .cal-slide-forward-leave-active .cal-dot,
    .cal-slide-forward-leave-active .cal-ghost-dot,
    .cal-slide-forward-leave-active .cal-trend,
    .cal-slide-forward-leave-active .cal-first-badge {
        animation: cal-marker-drift-forward .44s cubic-bezier(.22, 1, .36, 1);
    }

    .cal-slide-backward-enter-active .cal-dot,
    .cal-slide-backward-enter-active .cal-ghost-dot,
    .cal-slide-backward-enter-active .cal-trend,
    .cal-slide-backward-enter-active .cal-first-badge,
    .cal-slide-backward-leave-active .cal-dot,
    .cal-slide-backward-leave-active .cal-ghost-dot,
    .cal-slide-backward-leave-active .cal-trend,
    .cal-slide-backward-leave-active .cal-first-badge {
        animation: cal-marker-drift-backward .44s cubic-bezier(.22, 1, .36, 1);
    }

    .cal-slide-forward-enter-from {
        opacity: 0;
        transform: translateX(28px);
    }

    .cal-slide-forward-leave-to {
        opacity: 0;
        transform: translateX(-28px);
    }

    .cal-slide-backward-enter-from {
        opacity: 0;
        transform: translateX(-28px);
    }

    .cal-slide-backward-leave-to {
        opacity: 0;
        transform: translateX(28px);
    }

    .cal-cell {
        position: relative;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(148, 163, 184, 0.06);
        border-radius: 14px;
        height: 2.65rem;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: transform 120ms ease, border-color 160ms ease, filter 160ms ease;
    }

    .cal-check {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 1.15rem;
        line-height: 1;
        font-weight: 900;
        color: rgba(16, 185, 129, 0.92);
        text-shadow: 0 1px 0 rgba(0,0,0,.22);
        pointer-events: none;
        z-index: 2;
    }

    .cal-cross {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-size: 1.1rem;
        line-height: 1;
        font-weight: 900;
        color: rgba(239, 68, 68, 0.95);
        text-shadow: 0 1px 0 rgba(0,0,0,.22);
        pointer-events: none;
        z-index: 2;
    }

    .cal-cell.has-check .cal-num {
        opacity: .28;
    }

    .cal-cell.has-cross .cal-num {
        opacity: .2;
    }

        .cal-cell:hover {
            transform: translateY(-1px);
            border-color: rgba(129, 140, 248, 0.42);
            filter: brightness(1.02);
        }

        .cal-cell:disabled {
            cursor: default;
            opacity: .45;
        }

        .cal-cell.is-out {
            opacity: .35;
        }

        .cal-cell.has-entry {
            border-color: rgba(129, 140, 248, 0.42);
            background: radial-gradient(circle at 20% 25%, rgba(129,140,248,0.14), transparent 62%), rgba(148, 163, 184, 0.06);
        }

        .cal-cell.is-first-entry {
            border-color: rgba(249, 115, 22, 0.52);
            background:
                radial-gradient(circle at 22% 22%, rgba(251, 191, 36, 0.26), transparent 46%),
                radial-gradient(circle at 78% 18%, rgba(244, 114, 182, 0.18), transparent 34%),
                linear-gradient(135deg, rgba(255, 247, 237, 0.98), rgba(240, 253, 244, 0.94));
            box-shadow:
                inset 0 0 0 1px rgba(251, 146, 60, 0.22),
                0 0 0 2px rgba(251, 191, 36, 0.18),
                0 10px 22px rgba(249, 115, 22, 0.12);
            animation: cal-first-entry-pulse 1.8s ease-out 1;
        }

        .cal-cell.is-first-entry::before {
            content: '';
            position: absolute;
            inset: -3px;
            border-radius: 16px;
            border: 2px solid rgba(251, 191, 36, 0.65);
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.14);
            pointer-events: none;
        }

        .cal-cell.has-pr {
            border-color: rgba(245, 158, 11, 0.78);
            box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.24);
        }

        .cal-cell.is-today {
            outline: 2px solid rgba(129, 140, 248, 0.45);
            outline-offset: 2px;
        }

        .cal-cell.is-pulse-target {
            animation: cal-today-pulse .78s cubic-bezier(.22, 1, .36, 1);
        }

        .cal-cell.is-pulse-target::before {
            content: '';
            position: absolute;
            inset: -4px;
            border-radius: 16px;
            border: 2px solid rgba(99, 102, 241, 0.55);
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.28);
            animation: cal-today-ring .78s cubic-bezier(.22, 1, .36, 1);
            pointer-events: none;
        }

        .cal-cell.is-selected {
            border-color: rgba(34, 197, 94, 0.55);
            background:
                radial-gradient(circle at 24% 24%, rgba(34, 197, 94, 0.12), transparent 56%),
                rgba(148, 163, 184, 0.07);
            box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.22), 0 6px 16px rgba(34, 197, 94, 0.08);
            z-index: 1;
        }

        .cal-cell.is-range-bridge-left::before,
        .cal-cell.is-range-bridge-right::after {
            content: '';
            position: absolute;
            top: 50%;
            width: 18px;
            height: 2px;
            background: rgba(34, 197, 94, 0.34);
            pointer-events: none;
            z-index: 0;
            transform: translateY(-50%);
            opacity: 1;
        }

        .cal-cell.is-range-bridge-left::before {
            left: -9px;
            border-radius: 999px 0 0 999px;
            animation: cal-range-sweep .42s cubic-bezier(.22, 1, .36, 1);
        }

        .cal-cell.is-range-bridge-right::after {
            right: -9px;
            border-radius: 0 999px 999px 0;
            animation: cal-range-sweep .42s cubic-bezier(.22, 1, .36, 1);
        }

        .cal-cell.is-past {
            opacity: .35;
            filter: grayscale(0.2);
        }

    .cal-num {
        position: relative;
        z-index: 1;
        font-weight: 950;
        color: var(--text-primary);
    }

    .cal-cell.is-first-entry .cal-num {
        color: #7c2d12;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.38);
    }

    .cal-first-badge {
        position: absolute;
        top: -.18rem;
        right: -.16rem;
        width: 1.1rem;
        height: 1.1rem;
        display: grid;
        place-items: center;
        border-radius: 999px;
        font-size: .72rem;
        line-height: 1;
        background: linear-gradient(135deg, #f59e0b, #fb7185);
        box-shadow: 0 6px 14px rgba(249, 115, 22, 0.28);
        z-index: 3;
    }

    .cal-dot {
        position: absolute;
        top: .35rem;
        right: .35rem;
        width: .45rem;
        height: .45rem;
        border-radius: 999px;
        background: rgba(129, 140, 248, 0.85);
        box-shadow: 0 0 14px rgba(129, 140, 248, 0.25);
        animation: cal-dot-blink .9s steps(1, end) infinite;
    }

    .cal-cell.is-preview-target:not(.has-entry):not(.is-rest) {
        border-color: color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 68%, rgba(148, 163, 184, 0.18));
        background:
            radial-gradient(circle at 18% 16%, rgba(255, 255, 255, 0.14), transparent 58%),
            linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.04));
        box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.06),
            0 0 0 1px color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 26%, transparent),
            0 12px 22px rgba(15, 23, 42, 0.12);
        overflow: hidden;
        animation:
            cal-preview-outline 1.55s ease-in-out infinite,
            cal-preview-pop .8s cubic-bezier(.22, 1, .36, 1) both;
        animation-delay: var(--preview-delay, 0ms), var(--preview-delay, 0ms);
    }

    .cal-cell.is-preview-target:not(.has-entry):not(.is-rest)::before {
        content: '';
        position: absolute;
        inset: 4px;
        border-radius: 10px;
        border: 1.5px solid color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 72%, white 14%);
        box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.08),
            0 0 0 0 color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 0%, transparent);
        opacity: .88;
        pointer-events: none;
        animation: cal-preview-ring 1.55s ease-in-out infinite;
        animation-delay: var(--preview-delay, 0ms);
    }

    .cal-cell.is-preview-target:not(.has-entry):not(.is-rest)::after {
        content: '';
        position: absolute;
        inset: -16%;
        border-radius: inherit;
        background:
            linear-gradient(112deg,
                transparent 0%,
                rgba(255, 255, 255, 0.46) 42%,
                transparent 62%);
        opacity: .18;
        transform: translateX(-135%) skewX(-16deg);
        pointer-events: none;
        mix-blend-mode: screen;
        animation: cal-preview-sheen 2.4s ease-in-out infinite;
        animation-delay: calc(var(--preview-delay, 0ms) + 120ms);
    }

    .cal-cell.is-wave-target {
        animation: cal-wave-cell .9s cubic-bezier(.22, 1, .36, 1);
        animation-delay: var(--wave-delay, 0ms);
    }

    .cal-cell.is-wave-target .cal-dot {
        animation: cal-dot-wave .9s cubic-bezier(.22, 1, .36, 1);
        animation-delay: var(--wave-delay, 0ms);
        background: var(--wave-color, rgba(129, 140, 248, 0.85));
    }

    @keyframes cal-dot-blink {
        0%, 49% {
            opacity: 1;
            transform: scale(1.08);
            box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.18), 0 0 18px rgba(129, 140, 248, 0.34);
        }

        50%, 100% {
            opacity: .18;
            transform: scale(.82);
            box-shadow: 0 0 0 0 rgba(129, 140, 248, 0), 0 0 6px rgba(129, 140, 248, 0.08);
        }
    }

    @keyframes cal-preview-outline {
        0%, 100% {
            box-shadow:
                inset 0 0 0 1px rgba(255, 255, 255, 0.06),
                0 0 0 1px color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 18%, transparent),
                0 10px 18px rgba(15, 23, 42, 0.1);
            filter: brightness(.99);
        }

        50% {
            box-shadow:
                inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                0 0 0 1px color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 30%, transparent),
                0 16px 24px rgba(15, 23, 42, 0.14);
            filter: brightness(1.02);
        }
    }

    @keyframes cal-preview-ring {
        0%, 100% {
            opacity: .72;
            transform: scale(.985);
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 0%, transparent);
        }

        50% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--preview-color, rgba(148, 163, 184, 0.92)) 16%, transparent);
        }
    }

    @keyframes cal-preview-pop {
        0% {
            transform: scale(.92) translateY(7px);
            opacity: .18;
        }

        60% {
            transform: scale(1.02) translateY(-1px);
            opacity: 1;
        }

        100% {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }

    @keyframes cal-preview-sheen {
        0%, 100% {
            opacity: 0;
            transform: translateX(-135%) skewX(-16deg);
        }

        18% {
            opacity: .12;
        }

        46% {
            opacity: .24;
            transform: translateX(132%) skewX(-16deg);
        }

        60% {
            opacity: 0;
            transform: translateX(132%) skewX(-16deg);
        }
    }

    @keyframes cal-wave-cell {
        0% {
            box-shadow: inset 0 0 0 0 rgba(129, 140, 248, 0), 0 0 0 0 rgba(129, 140, 248, 0);
        }

        35% {
            box-shadow:
                inset 0 0 0 2px color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 28%, transparent),
                0 0 0 8px color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 18%, transparent);
        }

        100% {
            box-shadow: inset 0 0 0 0 rgba(129, 140, 248, 0), 0 0 0 0 rgba(129, 140, 248, 0);
        }
    }

    @keyframes cal-dot-wave {
        0% {
            transform: scale(1);
            box-shadow:
                0 0 0 0 color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 18%, transparent),
                0 0 14px color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 26%, transparent);
        }

        40% {
            transform: scale(1.6);
            box-shadow:
                0 0 0 6px color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 18%, transparent),
                0 0 22px color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 42%, transparent);
        }

        100% {
            transform: scale(1);
            box-shadow:
                0 0 0 0 color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 0%, transparent),
                0 0 14px color-mix(in srgb, var(--wave-color, rgba(129, 140, 248, 0.85)) 26%, transparent);
        }
    }

    @keyframes cal-marker-drift-forward {
        0% {
            opacity: 0;
            transform: translateX(10px) scale(.9);
        }

        100% {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }

    @keyframes cal-marker-drift-backward {
        0% {
            opacity: 0;
            transform: translateX(-10px) scale(.9);
        }

        100% {
            opacity: 1;
            transform: translateX(0) scale(1);
        }
    }

    @keyframes cal-range-sweep {
        0% {
            opacity: 0;
            transform: scaleX(.4);
        }

        100% {
            opacity: 1;
            transform: scaleX(1);
        }
    }

    @keyframes cal-rest-stamp {
        0% {
            opacity: .12;
            transform: scale(1.18) rotate(-10deg);
            filter: saturate(1.35);
        }

        38% {
            opacity: 1;
            transform: scale(.94) rotate(-2deg);
        }

        100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
            filter: saturate(1);
        }
    }

    @keyframes cal-conflict-pulse {
        0% {
            transform: scale(1);
        }

        30% {
            transform: scale(1.04);
            border-color: rgba(245, 158, 11, 0.82);
            background: rgba(245, 158, 11, 0.16);
        }

        65% {
            transform: scale(.985);
        }

        100% {
            transform: scale(1);
        }
    }

    @keyframes cal-conflict-ring {
        0% {
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }

        35% {
            opacity: 1;
            box-shadow: 0 0 0 6px rgba(245, 158, 11, 0.16);
        }

        100% {
            opacity: 0;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }
    }

    @keyframes cal-first-entry-pulse {
        0% {
            transform: scale(0.94);
            box-shadow:
                inset 0 0 0 1px rgba(251, 146, 60, 0.18),
                0 0 0 0 rgba(251, 191, 36, 0.00),
                0 8px 18px rgba(249, 115, 22, 0.08);
        }
        45% {
            transform: scale(1.03);
            box-shadow:
                inset 0 0 0 1px rgba(251, 146, 60, 0.28),
                0 0 0 6px rgba(251, 191, 36, 0.12),
                0 14px 28px rgba(249, 115, 22, 0.18);
        }
        100% {
            transform: scale(1);
            box-shadow:
                inset 0 0 0 1px rgba(251, 146, 60, 0.22),
                0 0 0 2px rgba(251, 191, 36, 0.18),
                0 10px 22px rgba(249, 115, 22, 0.12);
        }
    }

    .cal-trend {
        position: absolute;
        top: .9rem;
        right: .35rem;
        width: .45rem;
        font-size: .62rem;
        font-weight: 900;
        line-height: 1;
        color: rgba(148, 163, 184, 0.95);
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
        text-align: center;
    }

    .cal-trend.is-up {
        color: rgba(239, 68, 68, 0.95);
    }

    .cal-trend.is-down {
        color: rgba(34, 197, 94, 0.95);
    }

    .cal-trend.is-same {
        color: rgba(148, 163, 184, 0.95);
    }

    .cal-cell.is-rest::after {
        content: '';
        position: absolute;
        inset: 6px;
        border-radius: 10px;
        background: repeating-linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.55),
            rgba(59, 130, 246, 0.55) 6px,
            rgba(59, 130, 246, 0.12) 6px,
            rgba(59, 130, 246, 0.12) 12px
        );
        pointer-events: none;
        mix-blend-mode: multiply;
    }

    .cal-cell.is-rest-stamp-target::after {
        animation: cal-rest-stamp .82s cubic-bezier(.2, .9, .25, 1);
        transform-origin: center;
    }

    .cal-cell.is-conflict-target {
        animation: cal-conflict-pulse .96s cubic-bezier(.22, 1, .36, 1);
    }

    .cal-cell.is-conflict-target::before {
        content: '';
        position: absolute;
        inset: -3px;
        border-radius: 16px;
        border: 2px solid rgba(245, 158, 11, 0.74);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.16);
        pointer-events: none;
        animation: cal-conflict-ring .96s cubic-bezier(.22, 1, .36, 1);
    }

    .cal-hint {
        margin-top: .6rem;
        font-size: .88rem;
        color: var(--text-secondary);
        text-align: center;
    }

    .cal-nav {
        appearance: none;
        border: none;
        background: none;
        border-radius: 14px;
        height: 2.75rem;
        width: 2.75rem;
        cursor: pointer;
        font-weight: 900;
        display: grid;
        place-items: center;
        transition: transform 120ms ease, filter 160ms ease;
    }

        .cal-nav:hover {
            transform: translateY(-1px);
            filter: brightness(1.05);
        }

        .cal-nav:active {
            transform: translateY(0);
            filter: brightness(0.98);
        }

    .cal-chevron {
        width: 22px;
        height: 22px;
        display: grid;
        place-items: center;
        opacity: 0.92;
        color: var(--text-primary);
        transition: transform 180ms ease, opacity 160ms ease;
    }

        .cal-chevron::before {
            content: '';
            width: 10px;
            height: 10px;
            border-right: 3px solid currentColor;
            border-bottom: 3px solid currentColor;
            transform: rotate(-45deg);
        }

    .cal-chevron--left::before {
        transform: rotate(135deg);
    }

    .cal-chevron--right::before {
        transform: rotate(-45deg);
    }

    .cal-nav:hover .cal-chevron {
        opacity: 1;
        transform: scale(1.08);
    }

    html.dark-mode .cal-chevron {
        color: #fff;
    }

    .cal-title {
        cursor: pointer;
        user-select: none;
    }

        .cal-title:focus-visible {
            outline: 2px solid rgba(129, 140, 248, 0.55);
            outline-offset: 3px;
            border-radius: 10px;
        }

    .cal-pick-fields {
        display: flex;
        flex-direction: column;
        gap: 1rem; /* mehr Luft zwischen Monat und Jahr */
    }
    /* ===== Match BasePopup Darkmode ===== */
    html.dark-mode .cal {
        border-color: rgba(148, 163, 184, 0.18); /* viel softer */
        background: transparent; /* wirkt "im Popup" statt extra Card */
        box-shadow: none; /* kill die fette Card-Shadow */
    }

    html.dark-mode .cal-title {
        color: rgba(226, 232, 240, 0.95);
    }

    html.dark-mode .cal-wd {
        color: rgba(148, 163, 184, 0.95);
    }

    html.dark-mode .cal-cell {
        border: 1px solid rgba(148, 163, 184, 0.32);
        background: color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.42);
    }

        html.dark-mode .cal-cell:hover:not(:disabled) {
            transform: translateY(-1px);
            border-color: rgba(148, 163, 184, 0.55);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 3px rgba(99, 102, 241, 0.18), 0 20px 58px rgba(0, 0, 0, 0.55);
        }

        html.dark-mode .cal-cell.is-out {
            opacity: 0.22;
        }

        html.dark-mode .cal-cell.has-entry {
            border-color: rgba(129, 140, 248, 0.45);
            background: radial-gradient(circle at 18% 22%, rgba(129,140,248,0.14), transparent 62%), color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
        }

        html.dark-mode .cal-cell.is-first-entry {
            border-color: rgba(251, 146, 60, 0.56);
            background:
                radial-gradient(circle at 22% 22%, rgba(251, 191, 36, 0.18), transparent 46%),
                radial-gradient(circle at 78% 18%, rgba(244, 114, 182, 0.14), transparent 34%),
                linear-gradient(135deg, rgba(67, 20, 7, 0.56), rgba(20, 83, 45, 0.26), rgba(2, 6, 23, 0.82));
            box-shadow:
                inset 0 0 0 1px rgba(251, 146, 60, 0.24),
                0 0 0 2px rgba(251, 191, 36, 0.14),
                0 12px 28px rgba(0, 0, 0, 0.42);
        }

        html.dark-mode .cal-cell.is-first-entry::before {
            border-color: rgba(251, 191, 36, 0.55);
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
        }

        html.dark-mode .cal-cell.has-pr {
            border-color: rgba(245, 158, 11, 0.86);
            box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.30), 0 0 0 1px rgba(245, 158, 11, 0.10);
        }

    html.dark-mode .cal-cell.is-today {
        outline-color: rgba(99, 102, 241, 0.18);
        outline-width: 3px;
    }

    html.dark-mode .cal-cell.is-pulse-target::before {
        border-color: rgba(129, 140, 248, 0.62);
        box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.26);
    }

    @keyframes cal-today-pulse {
        0% {
            transform: translateY(0) scale(1);
            filter: saturate(1);
        }

        38% {
            transform: translateY(-2px) scale(1.05);
            filter: saturate(1.1);
        }

        100% {
            transform: translateY(0) scale(1);
            filter: saturate(1);
        }
    }

    @keyframes cal-today-ring {
        0% {
            opacity: 0;
            transform: scale(.9);
            box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3);
        }

        20% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: scale(1.12);
            box-shadow: 0 0 0 14px rgba(99, 102, 241, 0);
        }
    }

        html.dark-mode .cal-cell.is-selected {
            border-color: rgba(34, 197, 94, 0.65);
            background:
                radial-gradient(circle at 24% 24%, rgba(34, 197, 94, 0.16), transparent 56%),
                color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
            box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.28), 0 10px 22px rgba(2, 6, 23, 0.22);
        }

        html.dark-mode .cal-cell.is-range-bridge-left::before,
        html.dark-mode .cal-cell.is-range-bridge-right::after {
            background: rgba(34, 197, 94, 0.42);
        }

        html.dark-mode .cal-cell.is-past {
            opacity: .28;
            filter: grayscale(0.2);
        }

    html.dark-mode .cal-num {
        color: rgba(226, 232, 240, 0.95);
    }

    html.dark-mode .cal-cell.is-first-entry .cal-num {
        color: #ffedd5;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.38);
    }

    html.dark-mode .cal-dot {
        background: rgba(129, 140, 248, 0.85);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18), 0 0 18px rgba(99, 102, 241, 0.22);
    }

    @media (prefers-reduced-motion: reduce) {
        .cal-dot {
            animation: none;
        }
    }

    html.dark-mode .cal-trend.is-up {
        color: rgba(248, 113, 113, 0.95);
    }

    html.dark-mode .cal-trend.is-down {
        color: rgba(74, 222, 128, 0.95);
    }

    html.dark-mode .cal-trend.is-same {
        color: rgba(148, 163, 184, 0.95);
    }

    html.dark-mode .cal-cell.is-rest::after {
        background: repeating-linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.7),
            rgba(59, 130, 246, 0.7) 6px,
            rgba(59, 130, 246, 0.18) 6px,
            rgba(59, 130, 246, 0.18) 12px
        );
        mix-blend-mode: screen;
    }

    html.dark-mode .cal-hint {
        color: rgba(148, 163, 184, 0.95);
    }


</style>
