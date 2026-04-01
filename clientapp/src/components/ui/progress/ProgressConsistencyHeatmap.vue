<template>
    <section class="consistency-card">
        <div class="consistency-card__glow consistency-card__glow--a" aria-hidden="true"></div>
        <div class="consistency-card__glow consistency-card__glow--b" aria-hidden="true"></div>

        <header class="consistency-card__head">
            <div class="consistency-card__copy">
                <div class="consistency-card__eyebrow">Momentum</div>
                <h3 class="consistency-card__title">Trainingskonsistenz</h3>
                <p class="consistency-card__subtitle">
                    {{ summaryLine }}
                </p>
            </div>

            <div class="consistency-streak">
                <div class="consistency-streak__head">
                    <span class="consistency-streak__label">Aktuelle Serie</span>
                    <span class="consistency-streak__hint">{{ streakMessage }}</span>
                </div>
                <div class="consistency-streak__value-wrap">
                    <strong class="consistency-streak__value">{{ currentStreak }}</strong>
                    <span class="consistency-streak__unit">Tage</span>
                    <div class="consistency-flame" aria-hidden="true">
                        <svg class="consistency-flame__svg" viewBox="0 0 32 44" fill="none">
                            <defs>
                                <linearGradient id="streakFlameOuter" x1="16" y1="4" x2="16" y2="38" gradientUnits="userSpaceOnUse">
                                    <stop offset="0" stop-color="#FDBA74" />
                                    <stop offset=".56" stop-color="#F97316" />
                                    <stop offset="1" stop-color="#C2410C" />
                                </linearGradient>
                                <linearGradient id="streakFlameInner" x1="16" y1="9" x2="16" y2="31" gradientUnits="userSpaceOnUse">
                                    <stop offset="0" stop-color="#FFF7ED" />
                                    <stop offset=".4" stop-color="#FDE68A" />
                                    <stop offset="1" stop-color="#FB923C" />
                                </linearGradient>
                            </defs>
                            <ellipse class="consistency-flame__glow" cx="16" cy="36" rx="10" ry="4" fill="#F97316" />
                            <path class="consistency-flame__body" d="M16.146 3.9c1.74 3.635 5.837 6.227 5.837 13.52 0 7.226-4.16 13.325-9.814 13.325-4.042 0-7.319-2.992-7.319-7.68 0-5.948 4.44-8.982 7.392-12.486 1.802-2.141 2.202-4.298 2.34-6.679.016-.276.483-.277.564 0Z" fill="url(#streakFlameOuter)" />
                            <path class="consistency-flame__core-shape" d="M15.9 10.2c1.11 2.281 3.74 3.942 3.74 8.167 0 4.223-2.43 7.823-5.74 7.823-2.372 0-4.282-1.775-4.282-4.56 0-3.666 2.731-5.561 4.548-7.729 1.108-1.322 1.356-2.669 1.395-4.01.007-.203.287-.204.34 0Z" fill="url(#streakFlameInner)" />
                        </svg>
                    </div>
                </div>
            </div>
        </header>

        <div class="consistency-card__body">
            <div class="consistency-heatmap">
                <div class="consistency-heatmap__toolbar">
                    <button
                        type="button"
                        class="consistency-heatmap__nav-btn"
                        :disabled="!hasPrevMonth"
                        aria-label="Vorherigen Monat anzeigen"
                        @click="goToPrevMonth">
                        ‹
                    </button>
                    <strong class="consistency-heatmap__current-month">{{ activeMonthLabel }}</strong>
                    <button
                        type="button"
                        class="consistency-heatmap__nav-btn"
                        :disabled="!hasNextMonth"
                        aria-label="Nächsten Monat anzeigen"
                        @click="goToNextMonth">
                        ›
                    </button>
                </div>

                <div class="consistency-heatmap__summary">
                    <article class="consistency-heatmap__summary-item">
                        <span class="consistency-heatmap__summary-label">Aktive Tage</span>
                        <strong class="consistency-heatmap__summary-value">{{ activeMonthSummary.activeDays }}</strong>
                    </article>
                    <article class="consistency-heatmap__summary-item">
                        <span class="consistency-heatmap__summary-label">Sessions</span>
                        <strong class="consistency-heatmap__summary-value">{{ activeMonthSummary.sessions }}</strong>
                    </article>
                    <article class="consistency-heatmap__summary-item">
                        <span class="consistency-heatmap__summary-label">Minuten</span>
                        <strong class="consistency-heatmap__summary-value">{{ activeMonthSummary.duration }}</strong>
                    </article>
                    <article class="consistency-heatmap__summary-item">
                        <span class="consistency-heatmap__summary-label">Ø Load</span>
                        <strong class="consistency-heatmap__summary-value">{{ activeMonthSummary.avgLoad }}</strong>
                    </article>
                </div>

                <div class="consistency-heatmap__weekdays">
                    <span v-for="label in weekdayLabels" :key="label" class="consistency-heatmap__weekday">
                        {{ label }}
                    </span>
                </div>

                <div class="consistency-heatmap__grid" :style="{ '--week-count': `${monthWeeks.length}` }">
                    <div v-for="(week, weekIndex) in monthWeeks"
                         :key="`week-${weekIndex}-${week[0]?.key ?? weekIndex}`"
                         class="consistency-heatmap__week">
                        <button v-for="day in week"
                                :key="day.key"
                                type="button"
                                class="consistency-heatmap__cell"
                                :class="cellClass(day)"
                                :title="tooltipFor(day)"
                                @click="selectDay(day)">
                            <span class="consistency-heatmap__cell-day">{{ day.dayOfMonth }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <aside class="consistency-spotlight">
                <div class="consistency-spotlight__head">
                    <span class="consistency-spotlight__eyebrow">{{ selectedDay.isToday ? 'Heute' : 'Ausgewählter Tag' }}</span>
                    <strong class="consistency-spotlight__date">{{ formatLongDate(selectedDay.key) }}</strong>
                </div>

                <div class="consistency-spotlight__metric consistency-spotlight__metric--status" :class="`is-${selectedDay.intensity}`">
                    <div class="consistency-spotlight__metric-main">
                        <span class="consistency-spotlight__metric-label">Tagesstatus</span>
                        <strong class="consistency-spotlight__metric-value consistency-spotlight__metric-value--status">{{ selectedDay.statusLabel }}</strong>
                    </div>
                    <span class="consistency-spotlight__metric-chip">{{ selectedDay.sessions }} Session{{ selectedDay.sessions === 1 ? '' : 's' }}</span>
                </div>

                <div class="consistency-spotlight__metrics">
                    <div class="consistency-spotlight__metric">
                        <span class="consistency-spotlight__metric-label">Load</span>
                        <strong class="consistency-spotlight__metric-value">{{ selectedDay.loadLabel }}</strong>
                    </div>
                    <div class="consistency-spotlight__metric">
                        <span class="consistency-spotlight__metric-label">Dauer</span>
                        <strong class="consistency-spotlight__metric-value">{{ selectedDay.durationLabel }}</strong>
                    </div>
                    <div class="consistency-spotlight__metric">
                        <span class="consistency-spotlight__metric-label">Fokus</span>
                        <strong class="consistency-spotlight__metric-value">{{ selectedDay.typeLabel }}</strong>
                    </div>
                </div>

                <p class="consistency-spotlight__text">
                    {{ spotlightCopy(selectedDay) }}
                </p>

                <div class="consistency-legend">
                    <span class="consistency-legend__label">Intensität</span>
                    <span class="consistency-legend__item is-0">Leer</span>
                    <span class="consistency-legend__item is-1">Easy</span>
                    <span class="consistency-legend__item is-2">Solide</span>
                    <span class="consistency-legend__item is-3">Stark</span>
                    <span class="consistency-legend__item is-4">Peak</span>
                </div>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'

    type HeatmapDay = {
        key: string
        dayOfMonth: string
        inCurrentRange: boolean
        sessions: number
        intensity: 0 | 1 | 2 | 3 | 4
        load: number
        durationMin: number
        typeLabel: string
        statusLabel: string
        loadLabel: string
        durationLabel: string
        isToday: boolean
        isFuture: boolean
    }

    const props = defineProps<{
        days: HeatmapDay[]
        currentStreak: number
        bestStreak: number
        activeDaysLast30: number
        sessionsLast30: number
    }>()

    const weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

    const parseLocalDate = (key: string) => {
        const [year, month, day] = key.split('-').map(Number)
        return new Date(year, (month || 1) - 1, day || 1)
    }

    const toMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    const availableMonths = computed(() => {
        const map = new Map<string, { key: string; label: string; year: number; month: number }>()
        props.days.forEach((day) => {
            const date = parseLocalDate(day.key)
            const key = toMonthKey(date)
            if (map.has(key)) return
            map.set(key, {
                key,
                label: date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
                year: date.getFullYear(),
                month: date.getMonth(),
            })
        })
        return Array.from(map.values()).sort((a, b) => (
            a.year === b.year ? a.month - b.month : a.year - b.year
        ))
    })

    const latestActiveDay = computed(() =>
        [...props.days].reverse().find(day => day.sessions > 0) ?? props.days[props.days.length - 1]
    )

    const activeMonthKey = ref('')
    const selectedKey = ref<string>(latestActiveDay.value?.key ?? props.days[props.days.length - 1]?.key ?? '')

    watch([latestActiveDay, availableMonths], ([next, months]) => {
        if (!next) return
        if (!selectedKey.value || !props.days.some(day => day.key === selectedKey.value)) selectedKey.value = next.key
        const latestMonthKey = toMonthKey(parseLocalDate(next.key))
        if (!activeMonthKey.value || !months.some(month => month.key === activeMonthKey.value)) {
            activeMonthKey.value = latestMonthKey
        }
    }, { immediate: true })

    const activeMonthIndex = computed(() => availableMonths.value.findIndex(month => month.key === activeMonthKey.value))
    const activeMonth = computed(() => availableMonths.value[activeMonthIndex.value] ?? availableMonths.value[availableMonths.value.length - 1] ?? null)
    const activeMonthLabel = computed(() => activeMonth.value?.label ?? 'Kein Monat')
    const hasPrevMonth = computed(() => activeMonthIndex.value > 0)
    const hasNextMonth = computed(() => activeMonthIndex.value >= 0 && activeMonthIndex.value < availableMonths.value.length - 1)
    const activeMonthDays = computed(() => {
        if (!activeMonth.value) return []
        return props.days.filter(day => toMonthKey(parseLocalDate(day.key)) === activeMonth.value?.key)
    })
    const activeMonthSummary = computed(() => {
        const days = activeMonthDays.value
        const activeDays = days.filter(day => day.sessions > 0)
        const sessions = activeDays.reduce((sum, day) => sum + day.sessions, 0)
        const duration = activeDays.reduce((sum, day) => sum + day.durationMin, 0)
        const load = activeDays.reduce((sum, day) => sum + day.load, 0)

        return {
            activeDays: activeDays.length,
            sessions,
            duration,
            avgLoad: activeDays.length ? Math.round(load / activeDays.length) : 0,
        }
    })

    const daysByKey = computed(() => new Map(props.days.map(day => [day.key, day])))

    const createPlaceholderDay = (date: Date): HeatmapDay => {
        const key = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0'),
        ].join('-')

        return {
            key,
            dayOfMonth: String(date.getDate()),
            inCurrentRange: false,
            sessions: 0,
            intensity: 0,
            load: 0,
            durationMin: 0,
            typeLabel: '—',
            statusLabel: 'Kein Eintrag',
            loadLabel: '0',
            durationLabel: '0 Min',
            isToday: false,
            isFuture: date > new Date(),
        }
    }

    const monthWeeks = computed<HeatmapDay[][]>(() => {
        if (!activeMonth.value) return []

        const firstDay = new Date(activeMonth.value.year, activeMonth.value.month, 1)
        const lastDay = new Date(activeMonth.value.year, activeMonth.value.month + 1, 0)
        const start = new Date(firstDay)
        const mondayOffset = (start.getDay() + 6) % 7
        start.setDate(start.getDate() - mondayOffset)

        const end = new Date(lastDay)
        const sundayOffset = 6 - ((end.getDay() + 6) % 7)
        end.setDate(end.getDate() + sundayOffset)

        const calendarDays: HeatmapDay[] = []
        for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
            const key = [
                cursor.getFullYear(),
                String(cursor.getMonth() + 1).padStart(2, '0'),
                String(cursor.getDate()).padStart(2, '0'),
            ].join('-')
            const source = daysByKey.value.get(key)
            calendarDays.push(source
                ? { ...source, inCurrentRange: cursor.getMonth() === activeMonth.value.month }
                : createPlaceholderDay(new Date(cursor)))
        }

        const out: HeatmapDay[][] = []
        for (let i = 0; i < calendarDays.length; i += 7) out.push(calendarDays.slice(i, i + 7))
        return out
    })

    watch(activeMonth, (month) => {
        if (!month) return
        const inMonth = props.days.filter((day) => toMonthKey(parseLocalDate(day.key)) === month.key)
        if (!inMonth.length) return
        if (!inMonth.some(day => day.key === selectedKey.value)) {
            selectedKey.value = [...inMonth].reverse().find(day => day.sessions > 0)?.key ?? inMonth[inMonth.length - 1].key
        }
    }, { immediate: true })

    const selectedDay = computed(() =>
        props.days.find(day => day.key === selectedKey.value) ?? latestActiveDay.value ?? props.days[props.days.length - 1]
    )

    const summaryLine = computed(() => {
        if (!props.activeDaysLast30 && !props.sessionsLast30) {
            return 'Noch keine Sessions geloggt. Sobald du trainierst, baut sich hier dein Momentum auf.'
        }
        return `In den letzten 30 Tagen warst du an ${props.activeDaysLast30} Tagen aktiv und hast ${props.sessionsLast30} Sessions gesammelt.`
    })

    const streakMessage = computed(() => {
        if (props.currentStreak <= 0) return ''
        if (props.currentStreak >= props.bestStreak && props.currentStreak >= 3) return 'Stark. Du bist gerade auf deinem besten Rhythmus.'
        if (props.bestStreak > props.currentStreak) {
            const delta = props.bestStreak - props.currentStreak
            if (delta <= 2) return 'Du bist nah an deinem Rekord. Halt die Serie am Leben.'
        }
        if (props.currentStreak >= 5) return 'Richtig guter Lauf. Genau so baut sich Momentum auf.'
        if (props.currentStreak >= 2) return 'Die Serie lebt. Noch ein paar starke Tage und sie zieht richtig an.'
        return 'Der Anfang steht. Bleib morgen direkt dran.'
    })

    const selectDay = (day: HeatmapDay) => {
        if (toMonthKey(parseLocalDate(day.key)) !== activeMonthKey.value) return
        if (!props.days.some(entry => entry.key === day.key)) return
        selectedKey.value = day.key
    }

    const goToPrevMonth = () => {
        if (!hasPrevMonth.value) return
        activeMonthKey.value = availableMonths.value[activeMonthIndex.value - 1].key
    }

    const goToNextMonth = () => {
        if (!hasNextMonth.value) return
        activeMonthKey.value = availableMonths.value[activeMonthIndex.value + 1].key
    }

    const cellClass = (day: HeatmapDay) => ({
        'is-empty': day.sessions === 0,
        'is-outside': !day.inCurrentRange,
        'is-today': day.isToday,
        'is-selected': selectedDay.value?.key === day.key,
        'is-future': day.isFuture,
        'level-1': day.intensity === 1,
        'level-2': day.intensity === 2,
        'level-3': day.intensity === 3,
        'level-4': day.intensity === 4,
    })

    const tooltipFor = (day: HeatmapDay) => {
        const parts = [formatLongDate(day.key), day.statusLabel]
        if (day.sessions > 0) parts.push(`${day.sessions} Session${day.sessions === 1 ? '' : 's'}`)
        if (day.durationMin > 0) parts.push(`${day.durationMin} Min`)
        if (day.load > 0) parts.push(`Load ${day.loadLabel}`)
        return parts.join(' · ')
    }

    const formatLongDate = (key: string) =>
        parseLocalDate(key).toLocaleDateString('de-DE', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        })

    const spotlightCopy = (day: HeatmapDay) => {
        if (day.sessions === 0) return 'Kein geloggtes Training. Nutze freie Tage bewusst für Erholung oder Mobilität.'
        if (day.intensity >= 4) return 'Peak-Tag. Hier war Volumen, Dichte oder Trainingsdauer deutlich über deinem Basisniveau.'
        if (day.intensity === 3) return 'Starker Trainingstag mit klarer Belastung. Genau solche Tage treiben deinen Fortschritt.'
        if (day.intensity === 2) return 'Solider Trainingstag. Konstanz auf diesem Level baut zuverlässig Momentum auf.'
        return 'Leichter aktiver Tag. Perfekt, um die Serie aufrechtzuerhalten und im Rhythmus zu bleiben.'
    }
</script>

<style scoped>
    .consistency-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        margin-bottom: 1rem;
        padding: 1.6rem 1.8rem 1.1rem;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--border-color) 76%, var(--accent-primary) 24%);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 55%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 60%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%), color-mix(in srgb, var(--bg-card) 92%, var(--bg-secondary) 8%));
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        gap: 0.55rem;
        color: var(--text-primary);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .consistency-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 32%),
            radial-gradient(circle at 15% 18%, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 42%);
        opacity: .9;
        pointer-events: none;
    }

    @media (hover: hover) {
        .consistency-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    .consistency-card__glow {
        position: absolute;
        border-radius: 999px;
        filter: blur(40px);
        opacity: .42;
        pointer-events: none;
    }

    .consistency-card__glow--a {
        width: 220px;
        height: 220px;
        top: -110px;
        right: -40px;
        background: rgba(59, 130, 246, 0.18);
    }

    .consistency-card__glow--b {
        width: 180px;
        height: 180px;
        bottom: -80px;
        left: -30px;
        background: rgba(16, 185, 129, 0.16);
    }

    .consistency-card__head,
    .consistency-card__body {
        position: relative;
        z-index: 1;
    }

    .consistency-card__head {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(0, .95fr);
        gap: 1rem;
        align-items: start;
        margin-bottom: .35rem;
    }

    .consistency-card__eyebrow {
        margin: 0 0 0.35rem 0;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 82%, #9ca3af 18%);
    }

    .consistency-card__title {
        margin: 0;
        font-size: 1.2rem;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: var(--text-primary);
    }

    .consistency-card__subtitle {
        margin: .5rem 0 0;
        max-width: 58ch;
        color: var(--text-secondary);
        line-height: 1.5;
    }

    .consistency-streak {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-start;
        min-width: 0;
        padding-top: .1rem;
    }

    .consistency-streak__head {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: .2rem;
        text-align: right;
    }

    .consistency-streak__label {
        display: block;
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .consistency-streak__hint {
        display: block;
        max-width: 22ch;
        font-size: .84rem;
        line-height: 1.4;
        color: var(--text-secondary);
    }

    .consistency-streak__value-wrap {
        display: inline-flex;
        align-items: flex-end;
        gap: .45rem;
        margin-top: .55rem;
        position: relative;
    }

    .consistency-streak__value {
        font-size: clamp(2.2rem, 5vw, 3.4rem);
        line-height: .92;
        letter-spacing: -.05em;
        font-weight: 900;
        color: var(--text-primary);
    }

    .consistency-streak__unit {
        padding-bottom: .34rem;
        font-size: .92rem;
        font-weight: 800;
        letter-spacing: .02em;
        color: color-mix(in srgb, var(--text-secondary) 90%, var(--accent-primary) 10%);
    }

    .consistency-flame {
        position: relative;
        width: 34px;
        height: 46px;
        flex: 0 0 auto;
        margin-left: .24rem;
        transform-origin: 50% 100%;
        filter: drop-shadow(0 8px 18px rgba(249, 115, 22, 0.18));
    }

    .consistency-flame__svg {
        display: block;
        width: 100%;
        height: 100%;
        transform-origin: 50% 100%;
        will-change: transform, filter;
        animation: consistency-flame-sway 3.8s ease-in-out infinite;
    }

    .consistency-flame::before {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 2px;
        width: 36px;
        height: 16px;
        transform: translateX(-50%);
        border-radius: 999px;
        background: radial-gradient(circle, rgba(249, 115, 22, 0.28) 0%, rgba(249, 115, 22, 0.12) 46%, transparent 74%);
        filter: blur(5px);
        opacity: .7;
        animation: consistency-flame-aura 3.8s ease-in-out infinite;
    }

    .consistency-flame__glow {
        opacity: .32;
        filter: blur(1.8px);
        transform-origin: 50% 50%;
        animation: consistency-flame-pulse 3s ease-in-out infinite;
    }

    .consistency-flame__body {
        transform-origin: 50% 90%;
        animation: consistency-flame-body 2.8s ease-in-out infinite;
    }

    .consistency-flame__core-shape {
        transform-origin: 50% 88%;
        animation: consistency-flame-core 2.2s ease-in-out infinite;
    }

    @keyframes consistency-flame-sway {
        0%, 100% {
            transform: rotate(-2deg) translateY(0) scale(1, 1);
        }
        30% {
            transform: rotate(1.5deg) translateY(-.5px) scale(.992, 1.025);
        }
        55% {
            transform: rotate(-1deg) translateY(0) scale(1.01, .99);
        }
        78% {
            transform: rotate(2.25deg) translateY(-.7px) scale(.99, 1.03);
        }
    }

    @keyframes consistency-flame-body {
        0%, 100% {
            transform: scale(1, 1);
            opacity: .98;
        }
        40% {
            transform: scale(.98, 1.04) translateX(.2px);
            opacity: 1;
        }
        68% {
            transform: scale(1.02, .97) translateX(-.18px);
            opacity: .95;
        }
    }

    @keyframes consistency-flame-core {
        0%, 100% {
            transform: scale(1, 1);
            opacity: .95;
        }
        50% {
            transform: scale(.95, 1.08) translateX(.12px);
            opacity: .98;
        }
    }

    @keyframes consistency-flame-pulse {
        0%, 100% {
            transform: scale(.96);
            opacity: .22;
        }
        50% {
            transform: scale(1.08);
            opacity: .34;
        }
    }

    @keyframes consistency-flame-aura {
        0%, 100% {
            transform: translateX(-50%) scale(.94, .86);
            opacity: .42;
        }
        50% {
            transform: translateX(-50%) scale(1.04, .96);
            opacity: .62;
        }
    }

    .consistency-card__body {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1.55fr) minmax(300px, .9fr);
        gap: 1rem;
        align-items: start;
        padding: .95rem;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, var(--border-color) 82%, var(--accent-primary) 18%);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 7%, transparent), transparent 52%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 97%, white 3%), color-mix(in srgb, var(--bg-card) 91%, var(--bg-secondary) 9%));
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 12px 28px rgba(15, 23, 42, 0.07);
    }

    .consistency-card__body::before {
        content: '';
        position: absolute;
        inset: .65rem;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--border-color) 86%, transparent);
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-secondary) 56%, transparent), transparent 40%);
        pointer-events: none;
    }

    .consistency-heatmap,
    .consistency-spotlight {
        position: relative;
        z-index: 1;
    }

    .consistency-heatmap {
        --heatmap-cell-size: 30px;
        --heatmap-cell-gap: .24rem;
        --heatmap-cell-gap-y: .32rem;
        width: 100%;
        max-width: 100%;
        align-self: start;
        overflow: visible;
        box-sizing: border-box;
        padding: .95rem;
        display: grid;
        grid-template-columns: 26px 1fr;
        gap: .35rem .5rem;
        align-items: start;
        position: relative;
        padding: 0 0 .3rem;
    }

    .consistency-heatmap__toolbar {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        min-width: 0;
        gap: .75rem;
        margin-bottom: .1rem;
    }

    .consistency-heatmap__summary {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: .45rem;
        margin: .1rem 0 .35rem;
    }

    .consistency-heatmap__summary-item {
        padding: .58rem .62rem;
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--border-color) 80%, transparent);
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 7%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%), color-mix(in srgb, var(--bg-secondary) 90%, white 10%));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
        min-width: 0;
    }

    .consistency-heatmap__summary-label {
        display: block;
        font-size: .62rem;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 80%, #94a3b8 20%);
    }

    .consistency-heatmap__summary-value {
        display: block;
        margin-top: .18rem;
        font-size: .95rem;
        font-weight: 900;
        line-height: 1.15;
        color: var(--text-primary);
    }

    .consistency-heatmap__current-month {
        min-width: 0;
        font-size: .94rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -.01em;
        text-align: center;
    }

    .consistency-heatmap__nav-btn {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        border: none;
        background: transparent;
        color: var(--text-primary);
        font-size: 1.1rem;
        font-weight: 900;
        line-height: 1;
        box-shadow: none;
        transition: transform 140ms ease, opacity 160ms ease;
    }

    .consistency-heatmap__nav-btn:not(:disabled):hover {
        transform: scale(1.14);
    }

    .consistency-heatmap__nav-btn:disabled {
        opacity: .45;
        cursor: default;
    }

    .consistency-heatmap__months {
        grid-column: 2;
        display: flex;
        align-items: center;
        min-height: 1.1rem;
        padding-left: .08rem;
    }

    .consistency-heatmap__month {
        font-size: .72rem;
        font-weight: 800;
        color: color-mix(in srgb, var(--text-secondary) 84%, #94a3b8 16%);
        text-transform: uppercase;
        letter-spacing: .12em;
    }

    .consistency-heatmap__weekdays {
        display: grid;
        grid-template-rows: repeat(7, var(--heatmap-cell-size));
        row-gap: var(--heatmap-cell-gap-y);
        column-gap: var(--heatmap-cell-gap);
        padding-top: 0;
        padding-right: .3rem;
        border-right: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    }

    .consistency-heatmap__weekday {
        height: var(--heatmap-cell-size);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: .58rem;
        font-weight: 900;
        color: color-mix(in srgb, var(--text-secondary) 72%, #94a3b8 28%);
        letter-spacing: .04em;
        border-radius: 6px;
        background: transparent;
    }

    .consistency-heatmap__grid {
        display: grid;
        grid-template-columns: repeat(var(--week-count), minmax(0, 1fr));
        gap: var(--heatmap-cell-gap);
        align-items: start;
        min-width: 0;
        width: 100%;
        overflow: visible;
        padding-bottom: .24rem;
    }

    .consistency-heatmap__week {
        display: grid;
        grid-template-rows: repeat(7, var(--heatmap-cell-size));
        row-gap: var(--heatmap-cell-gap-y);
        column-gap: var(--heatmap-cell-gap);
        overflow: visible;
    }

    .consistency-heatmap__cell {
        position: relative;
        width: 100%;
        height: calc(var(--heatmap-cell-size) + 2px);
        border: 1px solid color-mix(in srgb, var(--border-color) 80%, transparent);
        border-radius: 14px;
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 11%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%), color-mix(in srgb, var(--bg-secondary) 90%, white 10%));
        color: var(--text-primary);
        padding: 0;
        cursor: pointer;
        overflow: hidden;
        isolation: isolate;
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 4px 10px rgba(15, 23, 42, 0.08);
        transition: transform 140ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, opacity 180ms ease;
    }

    .consistency-heatmap__cell::before {
        content: '';
        position: absolute;
        inset: 1px;
        border-radius: 12px;
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.02) 36%, rgba(255, 255, 255, 0) 100%);
        opacity: .7;
        pointer-events: none;
    }

    .consistency-heatmap__cell::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: 4px;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        transform: translateX(-50%) scale(.7);
        background: transparent;
        opacity: 0;
        transition: transform 160ms ease, opacity 160ms ease, background 160ms ease;
        pointer-events: none;
    }

    .consistency-heatmap__cell-day {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: .64rem;
        font-weight: 900;
        line-height: 1;
        letter-spacing: -.02em;
        color: var(--text-primary);
        text-shadow: none;
        pointer-events: none;
        z-index: 1;
    }

    .consistency-heatmap__cell:hover {
        transform: translateY(-1px) scale(1.03);
        border-color: color-mix(in srgb, var(--accent-primary) 52%, var(--border-color) 48%);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.24),
            0 10px 18px rgba(15, 23, 42, 0.14);
    }

    .consistency-heatmap__cell.is-empty {
        background:
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 95%, white 5%), color-mix(in srgb, var(--bg-secondary) 92%, white 8%));
    }

    .consistency-heatmap__cell.is-empty::after {
        opacity: .26;
        background: rgba(191, 219, 254, 0.42);
    }

    .consistency-heatmap__cell.is-outside {
        opacity: .58;
    }

    .consistency-heatmap__cell.is-outside .consistency-heatmap__cell-day {
        color: rgba(191, 219, 254, 0.52);
    }

    .consistency-heatmap__cell.is-future {
        opacity: .72;
        filter: saturate(.92);
    }

    .consistency-heatmap__cell.level-1 {
        border-color: color-mix(in srgb, var(--accent-primary) 30%, var(--border-color) 70%);
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 13%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 95%, white 5%), color-mix(in srgb, var(--bg-secondary) 88%, var(--accent-primary) 12%));
    }

    .consistency-heatmap__cell.level-1::after {
        opacity: .82;
        background: color-mix(in srgb, var(--accent-primary) 62%, white 38%);
    }

    .consistency-heatmap__cell.level-2 {
        border-color: color-mix(in srgb, var(--accent-primary) 42%, var(--border-color) 58%);
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, white 6%), color-mix(in srgb, var(--bg-secondary) 84%, var(--accent-primary) 16%));
    }

    .consistency-heatmap__cell.level-2::after {
        opacity: 1;
        background: color-mix(in srgb, var(--accent-primary) 78%, white 22%);
    }

    .consistency-heatmap__cell.level-3 {
        border-color: color-mix(in srgb, var(--accent-secondary) 40%, var(--border-color) 60%);
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-secondary) 15%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, white 6%), color-mix(in srgb, var(--bg-secondary) 84%, var(--accent-secondary) 16%));
    }

    .consistency-heatmap__cell.level-3::after {
        opacity: 1;
        background: color-mix(in srgb, var(--accent-secondary) 72%, white 28%);
    }

    .consistency-heatmap__cell.level-4 {
        border-color: color-mix(in srgb, var(--accent-primary) 28%, var(--accent-secondary) 28%);
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 56%),
            radial-gradient(circle at bottom left, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 56%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 93%, white 7%), color-mix(in srgb, var(--bg-secondary) 82%, var(--accent-secondary) 18%));
    }

    .consistency-heatmap__cell.level-4::after {
        width: 5px;
        height: 5px;
        opacity: 1;
        transform: translateX(-50%) scale(1);
        background: linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 72%, white 28%), color-mix(in srgb, var(--accent-secondary) 72%, white 28%));
    }

    .consistency-heatmap__cell.is-selected {
        border-color: color-mix(in srgb, var(--accent-primary) 52%, white 48%);
        box-shadow:
            0 0 0 2px color-mix(in srgb, var(--accent-primary) 18%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.24),
            0 10px 18px rgba(15, 23, 42, 0.14);
        transform: translateY(-1px);
    }

    .consistency-heatmap__cell.is-today {
        outline: none;
        border-color: color-mix(in srgb, var(--accent-primary) 38%, var(--border-color) 62%);
        box-shadow:
            0 0 0 2px color-mix(in srgb, var(--accent-primary) 12%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.24);
    }

    .consistency-spotlight {
        align-self: stretch;
        padding: .35rem 0 .15rem 1rem;
        border-left: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    }

    .consistency-spotlight__eyebrow {
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 82%, #9ca3af 18%);
    }

    .consistency-spotlight__date {
        display: block;
        margin-top: .25rem;
        font-size: 1.05rem;
        color: var(--text-primary);
    }

    .consistency-spotlight__metric--status {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: .8rem;
        margin-top: .95rem;
        min-height: 112px;
    }

    .consistency-spotlight__metric-main {
        min-height: 68px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
    }

    .consistency-spotlight__metric--status.is-1 {
        background: linear-gradient(160deg, color-mix(in srgb, var(--accent-primary) 12%, var(--bg-card) 88%), color-mix(in srgb, var(--accent-primary) 7%, var(--bg-secondary) 93%));
        border-color: color-mix(in srgb, var(--accent-primary) 36%, var(--border-color) 64%);
    }

    .consistency-spotlight__metric--status.is-2 {
        background: linear-gradient(160deg, color-mix(in srgb, var(--accent-primary) 18%, var(--bg-card) 82%), color-mix(in srgb, var(--accent-primary) 10%, var(--bg-secondary) 90%));
        border-color: color-mix(in srgb, var(--accent-primary) 46%, var(--border-color) 54%);
    }

    .consistency-spotlight__metric--status.is-3 {
        background: linear-gradient(160deg, color-mix(in srgb, var(--accent-secondary) 16%, var(--bg-card) 84%), color-mix(in srgb, var(--accent-secondary) 10%, var(--bg-secondary) 90%));
        border-color: color-mix(in srgb, var(--accent-secondary) 42%, var(--border-color) 58%);
    }

    .consistency-spotlight__metric--status.is-4 {
        background: linear-gradient(160deg, color-mix(in srgb, var(--accent-primary) 18%, var(--bg-card) 82%), color-mix(in srgb, var(--accent-secondary) 16%, var(--bg-secondary) 84%));
        border-color: color-mix(in srgb, var(--accent-primary) 44%, var(--accent-secondary) 56%);
    }

    .consistency-spotlight__metric-label {
        display: block;
        font-size: .72rem;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .consistency-spotlight__metric-chip {
        align-self: start;
        padding: .35rem .6rem;
        border-radius: 999px;
        font-size: .75rem;
        font-weight: 900;
        color: var(--text-primary);
        background:
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, white 6%), color-mix(in srgb, var(--bg-secondary) 88%, white 12%));
        border: 1px solid color-mix(in srgb, var(--border-color) 80%, var(--accent-primary) 20%);
    }

    .consistency-spotlight__metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: .65rem;
        margin-top: .8rem;
    }

    .consistency-spotlight__metric {
        padding: .72rem .78rem;
        border-radius: 16px;
        background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 6%, transparent), transparent 58%),
            linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 96%, white 4%), color-mix(in srgb, var(--bg-card) 89%, var(--bg-secondary) 11%));
        border: 1px solid color-mix(in srgb, var(--border-color) 82%, transparent);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
    }

    .consistency-spotlight__metric-value {
        display: block;
        margin-top: .24rem;
        color: var(--text-primary);
    }

    .consistency-spotlight__metric-value--status {
        margin-top: .3rem;
        font-size: 1.18rem;
        line-height: 1.2;
        min-height: 2.4em;
    }

    .consistency-spotlight__text {
        margin: .85rem 0 0;
        color: var(--text-secondary);
        line-height: 1.55;
    }

    .consistency-legend {
        display: flex;
        flex-wrap: wrap;
        gap: .45rem;
        margin-top: 1rem;
    }

    .consistency-legend__label {
        align-self: center;
        margin-right: .15rem;
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .consistency-legend__item {
        padding: .26rem .5rem;
        border-radius: 999px;
        font-size: .72rem;
        font-weight: 800;
        border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 95%, white 5%), color-mix(in srgb, var(--bg-secondary) 88%, white 12%));
        color: color-mix(in srgb, var(--text-primary) 84%, #475569 16%);
    }

    .consistency-legend__item.is-1 { background: color-mix(in srgb, var(--accent-primary) 10%, var(--bg-card) 90%); }
    .consistency-legend__item.is-2 { background: color-mix(in srgb, var(--accent-primary) 16%, var(--bg-card) 84%); }
    .consistency-legend__item.is-3 { background: color-mix(in srgb, var(--accent-secondary) 14%, var(--bg-card) 86%); }
    .consistency-legend__item.is-4 { background: color-mix(in srgb, var(--accent-primary) 16%, color-mix(in srgb, var(--accent-secondary) 12%, var(--bg-card) 88%)); }

    html.dark-mode .consistency-card {
        border-color: rgba(148, 163, 184, 0.45);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%),
            radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 12%, transparent), transparent 60%),
            linear-gradient(180deg, rgba(10, 17, 33, 0.96), rgba(2, 6, 23, 0.98));
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .consistency-card::before {
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 28%),
            radial-gradient(circle at 15% 18%, rgba(99, 102, 241, 0.12), transparent 42%);
    }

    html.dark-mode .consistency-heatmap,
    html.dark-mode .consistency-spotlight,
    html.dark-mode .consistency-spotlight__metric {
        background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.08), transparent 52%),
            radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.06), transparent 58%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.94));
        border-color: rgba(148, 163, 184, 0.14);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    html.dark-mode .consistency-card__body {
        background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.08), transparent 52%),
            radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.06), transparent 58%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.94));
        border-color: rgba(148, 163, 184, 0.14);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    html.dark-mode .consistency-card__body::before {
        border-color: rgba(148, 163, 184, 0.1);
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.24), transparent 42%);
    }

    html.dark-mode .consistency-heatmap,
    html.dark-mode .consistency-spotlight {
        background: transparent;
        border: none;
        box-shadow: none;
    }

    @media (prefers-reduced-motion: reduce) {
        .consistency-flame,
        .consistency-flame__outer,
        .consistency-flame__inner {
            animation: none;
        }
    }

    html.dark-mode .consistency-heatmap__month,
    html.dark-mode .consistency-heatmap__summary-label,
    html.dark-mode .consistency-streak__label,
    html.dark-mode .consistency-spotlight__metric-label,
    html.dark-mode .consistency-legend__label {
        color: #94a3b8;
    }

    html.dark-mode .consistency-heatmap__summary-item {
        background:
            radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 58%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.94));
        border-color: rgba(148, 163, 184, 0.14);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }

    html.dark-mode .consistency-heatmap__summary-value {
        color: #e2e8f0;
    }

    html.dark-mode .consistency-heatmap__weekday {
        color: #64748b;
        background: transparent;
    }

    html.dark-mode .consistency-heatmap__nav-btn {
        background: transparent;
        border: none;
        color: #e2e8f0;
    }

    html.dark-mode .consistency-heatmap__cell {
        background:
            radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 58%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.94));
        border-color: rgba(148, 163, 184, 0.14);
        color: #e2e8f0;
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            0 4px 10px rgba(0, 0, 0, 0.18);
    }

    html.dark-mode .consistency-heatmap__cell::before {
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.01)),
            radial-gradient(circle at top center, rgba(255, 255, 255, 0.04), transparent 65%);
    }

    html.dark-mode .consistency-heatmap__cell.is-empty::after {
        background: rgba(199, 210, 254, 0.72);
    }

    html.dark-mode .consistency-heatmap__cell-day {
        color: #e2e8f0;
    }

    html.dark-mode .consistency-heatmap__cell.level-1 {
        border-color: rgba(129, 140, 248, 0.3);
        background:
            radial-gradient(circle at top right, rgba(129, 140, 248, 0.16), transparent 58%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(49, 46, 129, 0.22));
    }

    html.dark-mode .consistency-heatmap__cell.level-1::after {
        background: rgba(224, 231, 255, 0.98);
    }

    html.dark-mode .consistency-heatmap__cell.level-2 {
        border-color: rgba(167, 139, 250, 0.36);
        background:
            radial-gradient(circle at top right, rgba(167, 139, 250, 0.18), transparent 58%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(91, 33, 182, 0.24));
    }

    html.dark-mode .consistency-heatmap__cell.level-2::after {
        background: rgba(233, 213, 255, 0.98);
    }

    html.dark-mode .consistency-heatmap__cell.level-3 {
        border-color: rgba(96, 165, 250, 0.34);
        background:
            radial-gradient(circle at top right, rgba(96, 165, 250, 0.18), transparent 58%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(30, 64, 175, 0.22));
    }

    html.dark-mode .consistency-heatmap__cell.level-3::after {
        background: rgba(220, 252, 231, 0.98);
    }

    html.dark-mode .consistency-heatmap__cell.level-4 {
        border-color: rgba(147, 197, 253, 0.38);
        background:
            radial-gradient(circle at top right, rgba(167, 139, 250, 0.16), transparent 56%),
            radial-gradient(circle at bottom left, rgba(96, 165, 250, 0.14), transparent 56%),
            linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(55, 48, 163, 0.2));
    }

    html.dark-mode .consistency-heatmap__cell.level-4::after {
        background: linear-gradient(180deg, rgba(233, 213, 255, 0.98), rgba(220, 252, 231, 0.98));
    }

    html.dark-mode .consistency-heatmap__cell.is-selected {
        border-color: rgba(224, 231, 255, 0.9);
        box-shadow:
            0 0 0 2px rgba(129, 140, 248, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 8px 14px rgba(15, 23, 42, 0.22);
    }

    html.dark-mode .consistency-heatmap__cell.is-today {
        border-color: rgba(196, 181, 253, 0.54);
        box-shadow:
            0 0 0 2px rgba(167, 139, 250, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    html.dark-mode .consistency-spotlight__metric-chip,
    html.dark-mode .consistency-legend__item {
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.84), rgba(15, 23, 42, 0.9));
        border-color: rgba(148, 163, 184, 0.14);
        color: #e2e8f0;
    }

    @media (max-width: 980px) {
        .consistency-card__head,
        .consistency-card__body {
            grid-template-columns: 1fr;
        }

        .consistency-card__body {
            gap: .9rem;
        }

        .consistency-spotlight {
            padding: .8rem 0 0;
            border-left: none;
            border-top: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
        }
    }

    html.dark-mode .consistency-spotlight {
        border-color: rgba(148, 163, 184, 0.12);
    }

    @media (max-width: 720px) {
        .consistency-card {
            padding: 1.25rem 1.2rem 0.9rem;
            border-radius: 16px;
        }

        .consistency-card__head,
        .consistency-card__body {
            gap: .85rem;
        }

        .consistency-card__subtitle {
            max-width: none;
            font-size: .95rem;
        }

        .consistency-spotlight__metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .consistency-streak {
            align-items: flex-start;
        }

        .consistency-streak__head {
            align-items: flex-start;
            text-align: left;
        }

        .consistency-streak__hint {
            max-width: none;
            font-size: .82rem;
        }

        .consistency-streak__value {
            font-size: 2.4rem;
        }

        .consistency-streak__unit {
            padding-bottom: .28rem;
            font-size: .86rem;
        }

        .consistency-heatmap {
            --heatmap-cell-size: 26px;
            --heatmap-cell-gap: .2rem;
            --heatmap-cell-gap-y: .26rem;
            grid-template-columns: 24px 1fr;
            padding: .8rem;
            gap: .35rem .45rem;
        }

        .consistency-heatmap__summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .consistency-heatmap__month {
            font-size: .64rem;
        }

        .consistency-heatmap__cell-day {
            font-size: .5rem;
        }

        .consistency-spotlight {
            padding: .85rem;
        }

        .consistency-spotlight__date {
            font-size: .96rem;
            line-height: 1.35;
        }

        .consistency-spotlight__metric--status {
            flex-direction: column;
            align-items: flex-start;
            gap: .65rem;
            min-height: 132px;
        }

        .consistency-spotlight__metric-main {
            min-height: 60px;
        }

        .consistency-spotlight__metric-value--status {
            font-size: 1.05rem;
            min-height: 2.4em;
        }

        .consistency-spotlight__metric-chip {
            align-self: flex-start;
        }

        .consistency-spotlight__metric {
            padding: .62rem .68rem;
            border-radius: 14px;
        }

        .consistency-spotlight__text {
            font-size: .93rem;
            line-height: 1.5;
        }
    }

    @media (max-width: 560px) {
        .consistency-card {
            padding: 1rem .9rem .8rem;
        }

        .consistency-card__title {
            font-size: 1.05rem;
        }

        .consistency-card__subtitle {
            font-size: .9rem;
        }

        .consistency-heatmap {
            --heatmap-cell-size: 22px;
            --heatmap-cell-gap: .16rem;
            --heatmap-cell-gap-y: .22rem;
            grid-template-columns: 20px 1fr;
            padding: .7rem;
            gap: .28rem .38rem;
        }

        .consistency-heatmap__week,
        .consistency-heatmap__weekdays {
            gap: var(--heatmap-cell-gap);
        }

        .consistency-heatmap__weekdays {
            padding-top: 0;
            padding-right: .2rem;
        }

        .consistency-heatmap__summary-item {
            padding: .52rem .56rem;
        }

        .consistency-heatmap__summary-label {
            font-size: .58rem;
        }

        .consistency-heatmap__summary-value {
            font-size: .88rem;
        }

        .consistency-heatmap__weekday {
            font-size: .52rem;
            border-radius: 5px;
        }

        .consistency-heatmap__cell-day {
            font-size: .46rem;
        }

        .consistency-legend {
            gap: .35rem;
        }

        .consistency-legend__item {
            padding: .22rem .42rem;
            font-size: .66rem;
        }
    }

    @media (max-width: 420px) {
        .consistency-spotlight__metrics {
            grid-template-columns: 1fr;
        }

        .consistency-spotlight__metric-value {
            font-size: .96rem;
        }

        .consistency-heatmap {
            --heatmap-cell-size: 20px;
            grid-template-columns: 18px 1fr;
        }
    }
</style>
