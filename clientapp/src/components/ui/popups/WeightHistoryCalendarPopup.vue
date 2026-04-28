<template>
    <BasePopup :show="show"
               :title="t('progress.weightHistoryPopup.title')"
               overlayClass="weight-history-calendar-popup"
               :showClose="true"
               @cancel="emit('close')">
        <div class="whc-root">
            <Calender :daysWithEntries="daysWithWeights"
                      :dayTitles="dayTitles"
                      :dayTrends="dayTrends"
                      :selectedDays="selectedDay ? [selectedDay] : []"
                      @select="onSelectDay" />

            <div class="whc-legend" aria-hidden="true">
                <span class="whc-legend-dot"></span>
                <span>{{ t('progress.weightHistoryPopup.legend') }}</span>
            </div>

            <div class="whc-detail">
                <template v-if="selectedEntry">
                    <div class="whc-label">{{ formatDayLabel(selectedEntry.day) }}</div>
                    <div class="whc-value">{{ selectedEntry.displayWeight }}</div>
                    <div class="whc-sub">{{ t('progress.weightHistoryPopup.weightOnDay') }}</div>
                    <div v-if="goalDistanceText || sinceFirstText" class="whc-metrics">
                        <div v-if="goalDistanceText">{{ goalDistanceText }}</div>
                        <div v-if="sinceFirstText">{{ sinceFirstText }}</div>
                    </div>
                </template>
                <template v-else-if="selectedDay">
                    <div class="whc-label">{{ formatDayLabel(selectedDay) }}</div>
                    <div class="whc-value">{{ t('progress.weightHistoryPopup.noEntry') }}</div>
                    <div class="whc-sub">{{ t('progress.weightHistoryPopup.weightOnDay') }}</div>
                </template>
                <template v-else>
                    <div class="whc-empty">{{ t('progress.weightHistoryPopup.selectDay') }}</div>
                </template>
            </div>

            <div v-if="recentEntries.length" class="whc-list">
                <button type="button"
                        class="whc-list-toggle"
                        :aria-expanded="showRecentEntries"
                        @click="showRecentEntries = !showRecentEntries">
                    <span class="whc-list-title">{{ t('progress.weightHistoryPopup.recentEntries') }}</span>
                    <span class="whc-caret" :class="{ open: showRecentEntries }" aria-hidden="true"></span>
                </button>

                <div v-show="showRecentEntries" class="whc-list-body">
                    <button v-for="item in recentEntries"
                            :key="item.day"
                            type="button"
                            class="whc-row"
                            :class="{ active: selectedDay === item.day }"
                            @click="onSelectDay(item.day)">
                        <span>{{ formatDayLabel(item.day) }}</span>
                        <strong>{{ item.displayWeight }}</strong>
                    </button>
                </div>
            </div>
        </div>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import { useI18n } from '@/composables/useI18n'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import Calender from '@/components/ui/kits/calender/Calender.vue'

    type WeightHistoryItem = {
        date: string
        weight: number
    }

    const props = defineProps<{
        show: boolean
        entries: WeightHistoryItem[]
        goalKg?: number | null
        unitLabel?: string
        formatWeightText?: (kg: number) => string
    }>()

    const emit = defineEmits<{
        (e: 'close'): void
    }>()

    const { locale, t } = useI18n()
    const localeCode = computed(() => locale.value === 'en' ? 'en-US' : 'de-DE')

    type DayWeight = {
        day: string
        kg: number
        displayWeight: string
        ts: number
    }

    const toDayKey = (dateStr?: string | null) => {
        if (!dateStr) return null
        const d = new Date(dateStr)
        if (Number.isNaN(d.getTime())) return null
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const defaultFormatWeight = (kg: number) => {
        const n = Number.isFinite(kg) ? kg : 0
        return `${n.toFixed(1)} ${props.unitLabel ?? 'kg'}`
    }

    const dayWeights = computed<DayWeight[]>(() => {
        const byDay = new Map<string, DayWeight>()

        for (const e of props.entries ?? []) {
            const day = toDayKey(e?.date)
            const kg = Number(e?.weight)
            const ts = new Date(e?.date ?? '').getTime()
            if (!day || !Number.isFinite(kg) || !Number.isFinite(ts)) continue

            const next: DayWeight = {
                day,
                kg,
                ts,
                displayWeight: props.formatWeightText?.(kg) ?? defaultFormatWeight(kg),
            }

            const prev = byDay.get(day)
            if (!prev || ts >= prev.ts) byDay.set(day, next)
        }

        return Array.from(byDay.values()).sort((a, b) => b.day.localeCompare(a.day))
    })

    const dayMap = computed(() => {
        const map = new Map<string, DayWeight>()
        for (const item of dayWeights.value) map.set(item.day, item)
        return map
    })

    const daysWithWeights = computed(() => dayWeights.value.map(x => x.day))

    const shiftDayKey = (day: string, deltaDays: number) => {
        const d = new Date(`${day}T12:00:00`)
        if (Number.isNaN(d.getTime())) return null
        d.setDate(d.getDate() + deltaDays)
        return toDayKey(d.toISOString())
    }

    const dayTrends = computed<Record<string, 'up' | 'down' | 'same'>>(() => {
        const out: Record<string, 'up' | 'down' | 'same'> = {}
        const byDay = dayMap.value
        const asc = [...dayWeights.value].sort((a, b) => a.day.localeCompare(b.day))
        let lastEntry: DayWeight | null = null

        for (const item of asc) {
            const prevDayKey = shiftDayKey(item.day, -1)
            let compare = (prevDayKey && byDay.get(prevDayKey)) || null
            if (!compare) compare = lastEntry

            if (!compare) out[item.day] = 'same'
            else if (item.kg > compare.kg) out[item.day] = 'up'
            else if (item.kg < compare.kg) out[item.day] = 'down'
            else out[item.day] = 'same'

            lastEntry = item
        }

        return out
    })

    const dayTitles = computed<Record<string, string>>(() => {
        const out: Record<string, string> = {}
        for (const item of dayWeights.value) {
            out[item.day] = item.displayWeight
        }
        return out
    })

    const selectedDay = ref<string | null>(null)
    const showRecentEntries = ref(false)

    const selectedEntry = computed(() => {
        if (!selectedDay.value) return null
        return dayMap.value.get(selectedDay.value) ?? null
    })

    const firstEntry = computed<DayWeight | null>(() => {
        let best: DayWeight | null = null
        for (const e of props.entries ?? []) {
            const day = toDayKey(e?.date)
            const kg = Number(e?.weight)
            const ts = new Date(e?.date ?? '').getTime()
            if (!day || !Number.isFinite(kg) || !Number.isFinite(ts)) continue
            if (!best || ts < best.ts) {
                best = {
                    day,
                    kg,
                    ts,
                    displayWeight: props.formatWeightText?.(kg) ?? defaultFormatWeight(kg),
                }
            }
        }
        return best
    })

    const goalDistanceText = computed(() => {
        if (!selectedEntry.value) return null
        if (props.goalKg == null) return null
        const goal = Number(props.goalKg)
        if (!Number.isFinite(goal)) return null
        const diff = Math.abs(goal - selectedEntry.value.kg)
        const diffText = props.formatWeightText?.(diff) ?? defaultFormatWeight(diff)
        return t('progress.weightHistoryPopup.goalDistance').replace('{value}', diffText)
    })

    const sinceFirstText = computed(() => {
        if (!selectedEntry.value || !firstEntry.value) return null
        const diff = selectedEntry.value.kg - firstEntry.value.kg
        const absText = props.formatWeightText?.(Math.abs(diff)) ?? defaultFormatWeight(Math.abs(diff))
        if (diff > 0) return t('progress.weightHistoryPopup.sinceFirstGain').replace('{value}', absText)
        if (diff < 0) return t('progress.weightHistoryPopup.sinceFirstLoss').replace('{value}', absText)
        return t('progress.weightHistoryPopup.sinceFirstSame')
    })

    const recentEntries = computed(() => dayWeights.value.slice(0, 8))

    const onSelectDay = (day: string) => {
        selectedDay.value = day
    }

    const formatDayLabel = (day: string) => {
        const d = new Date(`${day}T12:00:00`)
        if (Number.isNaN(d.getTime())) return day
        return d.toLocaleDateString(localeCode.value, {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    watch(
        () => [props.show, dayWeights.value.length] as const,
        ([open]) => {
            if (!open) return
            selectedDay.value = dayWeights.value[0]?.day ?? null
            showRecentEntries.value = false
        },
        { immediate: true }
    )
</script>

<style scoped>
    .whc-root {
        display: grid;
        gap: .85rem;
        width: min(100%, 560px);
        min-width: 0;
        margin-inline: auto;
    }

    :deep(.popup-overlay.weight-history-calendar-popup .popup) {
        width: min(620px, 94vw);
    }

    :deep(.popup-overlay.weight-history-calendar-popup .popup-body) {
        padding-right: 0;
    }

    :deep(.cal) {
        margin-bottom: 0;
        padding: .65rem;
    }

    :deep(.cal-grid),
    :deep(.cal-weekdays) {
        gap: .25rem;
    }

    :deep(.cal-cell) {
        min-width: 0;
        height: 2.25rem;
        border-radius: 10px;
    }

    :deep(.cal-num) {
        font-size: .92rem;
    }

    :deep(.cal-head) {
        grid-template-columns: 2.25rem 1fr 2.25rem;
        gap: .35rem;
    }

    :deep(.cal-nav) {
        width: 2.25rem;
        height: 2.25rem;
    }

    :deep(.cal-hint) {
        display: none;
    }

    .whc-detail {
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 14px;
        padding: .9rem 1rem;
        background: linear-gradient(180deg, rgba(148,163,184,0.06), rgba(148,163,184,0.03));
        display: grid;
        gap: .2rem;
        text-align: center;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
    }

    .whc-legend {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .45rem;
        font-size: .86rem;
        color: var(--text-secondary);
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
        padding: .05rem 0 .35rem;
    }

    .whc-legend-dot {
        width: .5rem;
        height: .5rem;
        border-radius: 999px;
        background: rgba(129, 140, 248, 0.85);
        box-shadow: 0 0 10px rgba(129, 140, 248, 0.25);
        flex: 0 0 auto;
    }

    .whc-label {
        color: var(--text-secondary);
        font-weight: 700;
        font-size: .9rem;
    }

    .whc-value {
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--text-primary);
    }

    .whc-sub {
        color: var(--text-secondary);
        font-size: .88rem;
    }

    .whc-metrics {
        display: grid;
        gap: .2rem;
        margin-top: .35rem;
        font-size: .88rem;
        color: var(--text-secondary);
        font-weight: 600;
    }

    .whc-empty {
        color: var(--text-secondary);
        text-align: center;
        padding: .3rem 0;
    }

    .whc-list {
        display: grid;
        gap: .45rem;
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
    }

    .whc-list-toggle {
        appearance: none;
        border: 0;
        background: transparent;
        color: #fff;
        border-radius: 0;
        padding: .35rem .1rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .5rem;
        cursor: pointer;
        text-align: left;
        box-shadow: none;
        transition: opacity .16s ease, transform .12s ease;
    }

    .whc-list-toggle:hover {
        opacity: .9;
    }

    .whc-list-toggle:active {
        transform: translateY(1px);
    }

    .whc-list-title {
        font-size: .82rem;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #fff;
    }

    .whc-caret {
        width: 1.25rem;
        height: .8rem;
        position: relative;
        display: inline-block;
        line-height: 1;
        transition: transform .16s ease;
        flex: 0 0 auto;
    }

    .whc-caret::before,
    .whc-caret::after {
        content: '';
        position: absolute;
        top: .25rem;
        width: .52rem;
        height: 2px;
        background: #fff;
        border-radius: 999px;
    }

    /* ~60° Chevron statt spitzem Symbol */
    .whc-caret::before {
        left: .12rem;
        transform: rotate(35deg);
        transform-origin: right center;
    }

    .whc-caret::after {
        right: .12rem;
        transform: rotate(-35deg);
        transform-origin: left center;
    }

    .whc-caret.open {
        transform: rotate(180deg);
    }

    .whc-list-body {
        display: grid;
        gap: .45rem;
    }

    .whc-row {
        appearance: none;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background:
            radial-gradient(circle at 18% 22%, rgba(129,140,248,0.08), transparent 62%),
            rgba(148, 163, 184, 0.06);
        color: var(--text-primary);
        border-radius: 14px;
        padding: .65rem .8rem;
        display: flex;
        justify-content: space-between;
        gap: .75rem;
        align-items: center;
        cursor: pointer;
        text-align: left;
        min-width: 0;
        transition: transform 120ms ease, border-color 160ms ease, filter 160ms ease;
    }

    .whc-row:hover {
        transform: translateY(-1px);
        border-color: rgba(129, 140, 248, 0.42);
        filter: brightness(1.02);
    }

    .whc-detail,
    .whc-list,
    :deep(.cal) {
        width: 100%;
        max-width: 520px;
        margin-inline: auto;
    }

    .whc-row > span,
    .whc-row > strong {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .whc-row > span {
        color: var(--text-secondary);
        font-weight: 700;
    }

    .whc-row > strong {
        color: var(--text-primary);
        font-weight: 900;
        letter-spacing: -0.01em;
        padding: .1rem .45rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(148, 163, 184, 0.08);
    }

    .whc-row.active {
        border-color: rgba(34, 197, 94, 0.55);
        box-shadow: inset 0 0 0 2px rgba(34, 197, 94, 0.22);
    }

    html.dark-mode .whc-detail {
        border-color: rgba(148, 163, 184, 0.18);
        background: transparent;
        box-shadow: none;
    }

    html.dark-mode .whc-legend-dot {
        background: rgba(129, 140, 248, 0.85);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18), 0 0 14px rgba(99, 102, 241, 0.22);
    }

    html.dark-mode .whc-row {
        border: 1px solid rgba(148, 163, 184, 0.32);
        background:
            radial-gradient(circle at 18% 22%, rgba(129,140,248,0.12), transparent 62%),
            color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.22);
    }

    html.dark-mode .whc-row:hover {
        border-color: rgba(148, 163, 184, 0.55);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 3px rgba(99, 102, 241, 0.18), 0 20px 58px rgba(0, 0, 0, 0.35);
        filter: none;
    }

    html.dark-mode .whc-row > strong {
        border-color: rgba(148, 163, 184, 0.24);
        background: rgba(255,255,255,0.04);
    }

    @media (max-width: 640px) {
        .whc-root {
            min-width: 0;
        }

        :deep(.cal) {
            padding: .55rem;
        }

        :deep(.cal-cell) {
            height: 2rem;
            border-radius: 9px;
        }

        :deep(.cal-grid),
        :deep(.cal-weekdays) {
            gap: .2rem;
        }

        .whc-detail {
            padding: .75rem .85rem;
        }

        .whc-value {
            font-size: 1.15rem;
        }
    }
</style>
