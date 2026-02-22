<!--components/ui/kits/calender/Calender.vue-->

<template>
    <div class="cal">
        <div class="cal-head">
            <button type="button"
                    class="cal-nav"
                    @click="prevMonth"
                    aria-label="Vorheriger Monat">
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
                    aria-label="Nächster Monat">
                <span class="cal-chevron cal-chevron--right" aria-hidden="true"></span>
            </button>
        </div>

        <!-- Quick Month/Year Picker (öffnet bei Doppelklick auf den Titel) -->
        <BasePopup :show="showPicker"
                   title="Schnell springen"
                   overlayClass="cal-pick-popup"
                   @cancel="closePicker">

            <div class="cal-pick-fields">
                <UiPopupSelect v-model="pickMonthStr"
                               label="Monat"
                               placeholder="Monat wählen"
                               :options="monthOptions" />

                <UiPopupInput v-model="pickYearStr"
                              label="Jahr"
                              placeholder="z.B. 2026"
                              inputmode="numeric"
                              type="number" />
            </div>

            <template #actions>
                <PopupActionButton variant="ghost" @click="closePicker">
                    Abbrechen
                </PopupActionButton>

                <PopupActionButton @click="applyPicker">
                    Suchen
                </PopupActionButton>
            </template>

        </BasePopup>

        <div class="cal-weekdays">
            <span v-for="d in weekdayLabels" :key="d" class="cal-wd">{{ d }}</span>
        </div>

        <div class="cal-grid">
            <button v-for="cell in monthCells"
                    :key="cell.key"
                    type="button"
                    class="cal-cell"
                    :class="{
                        'is-out': !cell.inMonth,
                        'has-entry': !!cell.day && hasEntries(cell.day),
                        'is-today': cell.day === todayKey,
                        'is-selected': !!cell.day && isSelected(cell.day),
                        'is-past': !!cell.day && isPast(cell.day),
                        'is-rest': !!cell.day && isRest(cell.day)
                    }"
                    :disabled="!cell.day ? true : isPast(cell.day)"
                    @click="cell.day && emit('select', cell.day)">
                <span class="cal-num">{{ cell.num }}</span>
                <span v-if="cell.day && hasEntries(cell.day)"
                      class="cal-dot"
                      :style="dotStyle(cell.day)"
                      :title="dotTitle(cell.day)"
                      aria-hidden="true"></span>
            </button>
        </div>

        <div class="cal-hint">
            Tipp: Tage mit Punkt haben Einträge. Klick drauf.
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, onBeforeUnmount } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'


    const props = defineProps<{
        daysWithEntries: string[] // yyyy-mm-dd
        dayColors?: Record<string, string | string[]>
        dayTitles?: Record<string, string>
        selectedDays?: string[]
        minDate?: string
        restDays?: string[]
    }>()

    const emit = defineEmits<{
        (e: 'select', day: string): void
    }>()

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

    const pad2 = (n: number) => String(n).padStart(2, '0')
    const toKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

    const todayKey = toKey(new Date())

    const now = new Date()
    const monthCursor = ref<Date>(new Date(now.getFullYear(), now.getMonth(), 1))

    const weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

    const monthTitle = computed(() => {
        const d = monthCursor.value
        return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
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
    const hasEntries = (day: string) => daysSet.value.has(day)
    const isSelected = (day: string) => selectedSet.value.has(day)
    const restSet = computed(() => new Set(props.restDays ?? []))
    const isRest = (day: string) => restSet.value.has(day)
    const minDateKey = computed(() => props.minDate ?? '')
    const isPast = (day: string) => !!minDateKey.value && day < minDateKey.value

    const prevMonth = () => {
        const d = monthCursor.value
        monthCursor.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
    }

    const nextMonth = () => {
        const d = monthCursor.value
        monthCursor.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    }

    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
    ]

    const monthOptions = monthNames.map((label, idx) => ({
        label,
        value: String(idx),
    }))

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

        monthCursor.value = new Date(y, m, 1)
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

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', onKeydown)
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

        .cal-cell.is-today {
            outline: 2px solid rgba(129, 140, 248, 0.45);
            outline-offset: 2px;
        }

        .cal-cell.is-selected {
            border-color: rgba(34, 197, 94, 0.55);
            box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.22);
        }

        .cal-cell.is-past {
            opacity: .35;
            filter: grayscale(0.2);
        }

    .cal-num {
        font-weight: 950;
        color: var(--text-primary);
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

        html.dark-mode .cal-cell.is-today {
            outline-color: rgba(99, 102, 241, 0.18);
            outline-width: 3px;
        }

        html.dark-mode .cal-cell.is-selected {
            border-color: rgba(34, 197, 94, 0.65);
            box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.28);
        }

        html.dark-mode .cal-cell.is-past {
            opacity: .28;
            filter: grayscale(0.2);
        }

    html.dark-mode .cal-num {
        color: rgba(226, 232, 240, 0.95);
    }

    html.dark-mode .cal-dot {
        background: rgba(129, 140, 248, 0.85);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18), 0 0 18px rgba(99, 102, 241, 0.22);
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
