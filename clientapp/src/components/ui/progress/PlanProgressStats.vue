<!--components/ui/progress/PlanProgressStats.vue-->
<template>
    <div class="plan-stats">
        <div v-if="!entries.length" class="stats-empty">
            <div class="stats-empty-icon" aria-hidden="true">📊</div>
            <div class="stats-empty-text">{{ t('progress.planStats.empty') }}</div>
        </div>

        <div v-else>
            <div class="stats-filter" role="tablist" :aria-label="t('progress.planStats.filterAria')">
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'overview' }" @click="activeSection = 'overview'">{{ t('progress.planStats.tabs.overview') }}</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'strength' }" @click="activeSection = 'strength'">{{ t('progress.planStats.tabs.strength') }}</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'cardio' }" @click="activeSection = 'cardio'">{{ t('progress.planStats.tabs.cardio') }}</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'consistency' }" @click="activeSection = 'consistency'">{{ t('progress.planStats.tabs.consistency') }}</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'prs' }" @click="activeSection = 'prs'">PRs</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'trends' }" @click="activeSection = 'trends'">{{ t('progress.planStats.tabs.trends') }}</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'muscle' }" @click="activeSection = 'muscle'">{{ t('progress.planStats.tabs.muscle') }}</button>
            </div>

            <div v-if="activeSection === 'overview'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.entries') }}</div>
                    <div class="stats-v">{{ totalEntries }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.trainingDays') }}</div>
                    <div class="stats-v">{{ totalDays }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.exercises') }}</div>
                    <div class="stats-v">{{ uniqueExercises }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.firstEntry') }}</div>
                    <div class="stats-v">{{ firstEntryLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.lastEntry') }}</div>
                    <div class="stats-v">{{ lastEntryLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.split') }}</div>
                    <div class="stats-v">{{ typeSplitLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.topExercise') }}</div>
                    <div class="stats-v">{{ topExerciseLabel }}</div>
                </div>
                <div class="stats-card stats-card--wide">
                    <div class="stats-k">{{ t('progress.planStats.cards.last4Weeks') }}</div>
                    <div class="stats-v">{{ last4WeeksSummary }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'strength'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.sets') }}</div>
                    <div class="stats-v">{{ totalStrengthSets }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.repsShort') }}</div>
                    <div class="stats-v">{{ totalStrengthReps }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.volume') }}</div>
                    <div class="stats-v">{{ totalStrengthVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.avgVolumeDay') }}</div>
                    <div class="stats-v">{{ avgStrengthVolumePerDayLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.avgVolumeWeek') }}</div>
                    <div class="stats-v">{{ avgStrengthVolumePerWeekLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.avgWeightSet') }}</div>
                    <div class="stats-v">{{ avgWeightPerSetLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.avgRepsSet') }}</div>
                    <div class="stats-v">{{ avgRepsPerSetLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'cardio'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.cardioMin') }}</div>
                    <div class="stats-v">{{ totalCardioMinLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.cardioKm') }}</div>
                    <div class="stats-v">{{ totalCardioKmLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.avgCardioDay') }}</div>
                    <div class="stats-v">{{ avgCardioMinPerDayLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.avgCardioWeek') }}</div>
                    <div class="stats-v">{{ avgCardioMinPerWeekLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'consistency'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.activeWeeks') }}</div>
                    <div class="stats-v">{{ activeWeeks }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.avgDaysWeek') }}</div>
                    <div class="stats-v">{{ avgDaysPerWeekLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.currentStreak') }}</div>
                    <div class="stats-v">{{ streakLabel(currentStreak) }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.bestStreak') }}</div>
                    <div class="stats-v">{{ streakLabel(bestStreak) }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.masterDay') }}</div>
                    <div class="stats-v">{{ mostActiveWeekdayLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'prs'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.maxWeight') }}</div>
                    <div class="stats-v">{{ prMaxWeightLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.maxReps') }}</div>
                    <div class="stats-v">{{ prMaxRepsLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.maxSetVolume') }}</div>
                    <div class="stats-v">{{ prMaxSetVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.bestSession') }}</div>
                    <div class="stats-v">{{ prBestDayVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.topOneRm') }}</div>
                    <div class="stats-v">{{ prTop1RmLabel }}</div>
                </div>
                <div class="stats-card stats-card--wide stats-card--panel">
                    <div class="stats-k">{{ t('progress.planStats.cards.personalRecords') }}</div>
                    <PersonalRecordsPanel :records="personalRecords" :limit="8" />
                </div>
            </div>

            <div v-else-if="activeSection === 'trends'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.entries28') }}</div>
                    <div class="stats-v">{{ trendEntriesLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.trainingDays28') }}</div>
                    <div class="stats-v">{{ trendDaysLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.volume28') }}</div>
                    <div class="stats-v">{{ trendVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.cardio28') }}</div>
                    <div class="stats-v">{{ trendCardioLabel }}</div>
                </div>
                <div class="stats-card stats-card--wide">
                    <div class="stats-k">{{ t('progress.planStats.cards.comparisonPrev28') }}</div>
                    <div class="stats-v">{{ trendComparisonLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'muscle'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.topMuscleGroup') }}</div>
                    <div class="stats-v">{{ topMuscleGroupLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.top2') }}</div>
                    <div class="stats-v">{{ topMuscleGroup2Label }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">{{ t('progress.planStats.cards.top3') }}</div>
                    <div class="stats-v">{{ topMuscleGroup3Label }}</div>
                </div>
                <div class="stats-card stats-card--wide">
                    <div class="stats-k">{{ t('progress.planStats.cards.muscleDistribution') }}</div>
                    <div class="stats-v">{{ muscleSplitLabel }}</div>
                </div>
                <div class="stats-card stats-card--wide stats-note">
                    <div class="stats-k">{{ t('progress.planStats.cards.note') }}</div>
                    <div class="stats-v">
                        <span class="stats-note-text" :class="{ expanded: muscleHintExpanded }">
                            {{ t('progress.planStats.muscleHint') }}
                        </span>
                        <button type="button"
                                class="stats-note-more"
                                :aria-label="t('progress.planStats.expandHintAria')"
                                @click="muscleHintExpanded = !muscleHintExpanded">
                            ⋯
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import PersonalRecordsPanel from '@/components/ui/progress/PersonalRecordsPanel.vue'
    import { useI18n } from '@/composables/useI18n'
    import { computeExercisePersonalRecords } from '@/utils/personalRecords'

    type WorkoutLike = {
        id?: string | null
        planId?: string | null
        exercise: string
        date: string
        type?: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer' | null
        weight?: number | null
        sets?: number | null
        reps?: number | null
        durationMin?: number | null
        distanceKm?: number | null
        setDetails?: Array<{ weight: number | null; reps: number | null }> | null
    }

    type SectionId = 'overview' | 'strength' | 'cardio' | 'consistency' | 'prs' | 'trends' | 'muscle'
    type MuscleGroupId = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs'

    const props = defineProps<{
        entries: WorkoutLike[]
    }>()

    const { locale, t } = useI18n()
    const activeSection = ref<SectionId>('overview')
    const muscleHintExpanded = ref(false)

    const dash = '–'
    const pad2 = (n: number) => String(n).padStart(2, '0')
    const localeCode = computed(() => locale.value === 'en' ? 'en-US' : 'de-DE')

    const formatDateLabel = (yyyyMmDd: string) => {
        const [y, m, d] = yyyyMmDd.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(localeCode.value, {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatWeekdayLabel = (weekdayIndex: number) =>
        new Date(Date.UTC(2020, 5, 7 + weekdayIndex)).toLocaleDateString(localeCode.value, { weekday: 'short' })

    const formatKgLabel = (value: number | null | undefined, digits = 0) => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return dash
        const out = digits > 0 ? value.toFixed(digits) : `${Math.round(value)}`
        return `${out} kg`
    }

    const formatMinLabel = (value: number | null | undefined) => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return dash
        return `${Math.round(value)} min`
    }

    const formatKmLabel = (value: number | null | undefined) => {
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return dash
        return `${value.toFixed(1)} km`
    }

    const countLabel = (key: string, count: number) => t(key).replace('{count}', String(count))
    const streakLabel = (count: number) => countLabel('progress.planStats.daysCount', count)

    const muscleLabelKeyMap: Record<MuscleGroupId, string> = {
        chest: 'goals.muscle.chest',
        back: 'goals.muscle.back',
        shoulders: 'goals.muscle.shoulders',
        arms: 'goals.muscle.arms',
        core: 'goals.muscle.core',
        legs: 'goals.muscle.legs',
    }

    const muscleLabel = (group: MuscleGroupId) => t(muscleLabelKeyMap[group])

    const toUtcDayKey = (dateStr?: string | null) => {
        if (!dateStr) return null
        const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00Z` : dateStr
        const d = new Date(normalized)
        if (Number.isNaN(d.getTime())) return null
        return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
    }

    const toUtcWeekKey = (dateStr?: string | null) => {
        if (!dateStr) return null
        const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00Z` : dateStr
        const d = new Date(normalized)
        if (Number.isNaN(d.getTime())) return null
        const day = d.getUTCDay()
        const diff = (day + 6) % 7
        const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
        monday.setUTCDate(monday.getUTCDate() - diff)
        return `${monday.getUTCFullYear()}-${pad2(monday.getUTCMonth() + 1)}-${pad2(monday.getUTCDate())}`
    }

    const totalEntries = computed(() => props.entries.length)

    const dayKeys = computed(() => {
        const keys = new Set<string>()
        for (const it of props.entries) {
            const k = toUtcDayKey(it.date)
            if (k) keys.add(k)
        }
        return keys
    })

    const totalDays = computed(() => dayKeys.value.size)

    const weekKeys = computed(() => {
        const keys = new Set<string>()
        for (const it of props.entries) {
            const k = toUtcWeekKey(it.date)
            if (k) keys.add(k)
        }
        return keys
    })

    const activeWeeks = computed(() => weekKeys.value.size)

    const uniqueExercises = computed(() => {
        const set = new Set<string>()
        for (const it of props.entries) {
            const name = String(it.exercise ?? '').trim()
            if (name) set.add(name)
        }
        return set.size
    })

    const firstEntryLabel = computed(() => {
        const first = [...dayKeys.value].sort().at(0)
        if (!first) return dash
        return formatDateLabel(first)
    })

    const lastEntryLabel = computed(() => {
        const last = [...dayKeys.value].sort().at(-1)
        if (!last) return dash
        return formatDateLabel(last)
    })

    const avgDaysPerWeekLabel = computed(() => {
        const weeks = activeWeeks.value || 0
        if (!weeks) return dash
        return (totalDays.value / weeks).toFixed(1)
    })

    const streakInfo = computed(() => {
        const days = [...dayKeys.value].sort()
        if (!days.length) return { current: 0, best: 0 }

        const toEpoch = (k: string) => Date.parse(`${k}T00:00:00Z`)
        const epochs = days.map(toEpoch)

        let best = 1
        let cur = 1
        for (let i = 1; i < epochs.length; i++) {
            const diff = (epochs[i] - epochs[i - 1]) / 86400000
            if (diff === 1) {
                cur += 1
                best = Math.max(best, cur)
            } else if (diff > 1) {
                cur = 1
            }
        }

        const today = new Date()
        const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        const lastUtc = epochs[epochs.length - 1]
        const gap = Math.floor((todayUtc - lastUtc) / 86400000)
        const current = gap <= 1 ? cur : 0

        return { current, best }
    })

    const currentStreak = computed(() => streakInfo.value.current)
    const bestStreak = computed(() => streakInfo.value.best)
    const personalRecords = computed(() => computeExercisePersonalRecords(props.entries))

    const mostActiveWeekdayLabel = computed(() => {
        if (!props.entries.length) return dash
        const map = new Map<number, number>()
        for (const it of props.entries) {
            const k = toUtcDayKey(it.date)
            if (!k) continue
            const [y, m, d] = k.split('-').map(Number)
            const wd = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).getUTCDay()
            map.set(wd, (map.get(wd) ?? 0) + 1)
        }
        let bestDay = 0
        let bestCount = -1
        for (const [d, c] of map.entries()) {
            if (c > bestCount) {
                bestCount = c
                bestDay = d
            }
        }
        return formatWeekdayLabel(bestDay)
    })

    const strengthEntries = computed(() =>
        props.entries.filter(e => e.type === 'kraft' || e.type === 'calisthenics')
    )

    const strengthStats = computed(() => {
        let totalSets = 0
        let totalReps = 0
        let totalVolume = 0
        let totalWeightSum = 0

        for (const it of strengthEntries.value) {
            const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
            const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)

            if (detailsMatchSets) {
                totalSets += it.setDetails!.length
                for (const s of it.setDetails!) {
                    if (typeof s.reps === 'number') totalReps += s.reps
                    if (typeof s.weight === 'number') totalWeightSum += s.weight
                    if (typeof s.reps === 'number' && typeof s.weight === 'number') {
                        totalVolume += s.reps * s.weight
                    }
                }
                continue
            }

            const fallbackSets =
                (typeof it.sets === 'number')
                    ? it.sets
                    : ((typeof it.reps === 'number' || typeof it.weight === 'number') ? 1 : 0)

            if (fallbackSets > 0) totalSets += fallbackSets
            if (typeof it.reps === 'number') totalReps += it.reps * (fallbackSets || 1)
            if (typeof it.weight === 'number') totalWeightSum += it.weight * (fallbackSets || 1)
            if (typeof it.reps === 'number' && typeof it.weight === 'number') {
                totalVolume += it.reps * it.weight * (fallbackSets || 1)
            }
        }

        return { totalSets, totalReps, totalVolume, totalWeightSum }
    })

    const totalStrengthSets = computed(() => strengthStats.value.totalSets)
    const totalStrengthReps = computed(() => strengthStats.value.totalReps)
    const totalStrengthVolume = computed(() => strengthStats.value.totalVolume)

    const totalStrengthVolumeLabel = computed(() => formatKgLabel(totalStrengthVolume.value))

    const avgStrengthVolumePerDayLabel = computed(() => {
        if (!totalDays.value) return dash
        return formatKgLabel(totalStrengthVolume.value / totalDays.value)
    })

    const avgStrengthVolumePerWeekLabel = computed(() => {
        if (!activeWeeks.value) return dash
        return formatKgLabel(totalStrengthVolume.value / activeWeeks.value)
    })

    const avgWeightPerSetLabel = computed(() => {
        const totalSets = strengthStats.value.totalSets
        if (!totalSets) return dash
        const avg = strengthStats.value.totalWeightSum / totalSets
        return Number.isFinite(avg) ? (Number.isInteger(avg) ? `${avg} kg` : `${avg.toFixed(1)} kg`) : dash
    })

    const avgRepsPerSetLabel = computed(() => {
        const totalSets = strengthStats.value.totalSets
        if (!totalSets) return dash
        const avg = strengthStats.value.totalReps / totalSets
        return Number.isFinite(avg) ? (Number.isInteger(avg) ? `${avg}` : `${avg.toFixed(1)}`) : dash
    })

    const totalCardioMin = computed(() => {
        let total = 0
        for (const it of props.entries) {
            if (typeof it.durationMin === 'number') total += it.durationMin
        }
        return total
    })

    const totalCardioKm = computed(() => {
        let total = 0
        for (const it of props.entries) {
            if (typeof it.distanceKm === 'number') total += it.distanceKm
        }
        return total
    })

    const totalCardioMinLabel = computed(() => formatMinLabel(totalCardioMin.value))
    const totalCardioKmLabel = computed(() => formatKmLabel(totalCardioKm.value))

    const avgCardioMinPerDayLabel = computed(() => {
        if (!totalDays.value) return dash
        return formatMinLabel(totalCardioMin.value / totalDays.value)
    })

    const avgCardioMinPerWeekLabel = computed(() => {
        if (!activeWeeks.value) return dash
        return formatMinLabel(totalCardioMin.value / activeWeeks.value)
    })

    const typeSplitLabel = computed(() => {
        const counts = { kraft: 0, calisthenics: 0, ausdauer: 0, dehnung: 0 }
        for (const it of props.entries) {
            const tpe = it.type ?? 'kraft'
            if (tpe in counts) counts[tpe as keyof typeof counts] += 1
        }
        const total = Object.values(counts).reduce((a, b) => a + b, 0)
        if (!total) return dash
        const pct = (n: number) => `${Math.round((n / total) * 100)}%`
        return [
            `${t('goals.exerciseKind.strength')} ${pct(counts.kraft)}`,
            `${t('progress.popup.exerciseType.calisthenics')} ${pct(counts.calisthenics)}`,
            `${t('goals.exerciseKind.cardio')} ${pct(counts.ausdauer)}`,
            `${t('goals.exerciseKind.mobility')} ${pct(counts.dehnung)}`,
        ].join(' · ')
    })

    const topExerciseLabel = computed(() => {
        const map = new Map<string, number>()
        for (const it of props.entries) {
            const name = String(it.exercise ?? '').trim()
            if (!name) continue
            map.set(name, (map.get(name) ?? 0) + 1)
        }
        if (!map.size) return dash
        let top = ''
        let count = -1
        for (const [k, v] of map.entries()) {
            if (v > count) {
                count = v
                top = k
            }
        }
        return `${top} (${count})`
    })

    const last4WeeksSummary = computed(() => {
        if (!props.entries.length) return dash
        const today = new Date()
        const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        const cutoff = todayUtc - 28 * 86400000

        const days = new Set<string>()
        let sessions = 0
        let volume = 0

        for (const it of props.entries) {
            const dayKey = toUtcDayKey(it.date)
            if (!dayKey) continue
            const ts = Date.parse(`${dayKey}T00:00:00Z`)
            if (ts < cutoff) continue
            days.add(dayKey)
            sessions += 1

            if (it.type === 'kraft' || it.type === 'calisthenics') {
                const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
                const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
                if (detailsMatchSets) {
                    for (const s of it.setDetails!) {
                        if (typeof s.reps === 'number' && typeof s.weight === 'number') {
                            volume += s.reps * s.weight
                        }
                    }
                } else if (typeof it.reps === 'number' && typeof it.weight === 'number') {
                    const fallbackSets =
                        (typeof it.sets === 'number')
                            ? it.sets
                            : ((typeof it.reps === 'number' || typeof it.weight === 'number') ? 1 : 0)
                    volume += it.reps * it.weight * (fallbackSets || 1)
                }
            }
        }

        return [
            countLabel('progress.planStats.daysCount', days.size),
            countLabel('progress.planStats.entriesCount', sessions),
            formatKgLabel(volume),
        ].join(' · ')
    })

    const prMaxWeightLabel = computed(() => {
        let best = { weight: -1, exercise: '' }
        for (const it of strengthEntries.value) {
            const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
            const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
            if (detailsMatchSets) {
                for (const s of it.setDetails!) {
                    if (typeof s.weight === 'number' && s.weight > best.weight) {
                        best = { weight: s.weight, exercise: it.exercise }
                    }
                }
            } else if (typeof it.weight === 'number' && it.weight > best.weight) {
                best = { weight: it.weight, exercise: it.exercise }
            }
        }
        return best.weight > -1 ? `${best.weight} kg · ${best.exercise}` : dash
    })

    const prMaxRepsLabel = computed(() => {
        let best = { reps: -1, exercise: '' }
        for (const it of strengthEntries.value) {
            const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
            const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
            if (detailsMatchSets) {
                for (const s of it.setDetails!) {
                    if (typeof s.reps === 'number' && s.reps > best.reps) {
                        best = { reps: s.reps, exercise: it.exercise }
                    }
                }
            } else if (typeof it.reps === 'number' && it.reps > best.reps) {
                best = { reps: it.reps, exercise: it.exercise }
            }
        }
        return best.reps > -1 ? `${best.reps} ${t('progress.planStats.cards.repsShort')} · ${best.exercise}` : dash
    })

    const prMaxSetVolumeLabel = computed(() => {
        let best = { vol: -1, exercise: '' }
        for (const it of strengthEntries.value) {
            const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
            const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
            if (detailsMatchSets) {
                for (const s of it.setDetails!) {
                    if (typeof s.reps === 'number' && typeof s.weight === 'number') {
                        const vol = s.reps * s.weight
                        if (vol > best.vol) best = { vol, exercise: it.exercise }
                    }
                }
            } else if (typeof it.reps === 'number' && typeof it.weight === 'number') {
                const vol = it.reps * it.weight
                if (vol > best.vol) best = { vol, exercise: it.exercise }
            }
        }
        return best.vol > -1 ? `${Math.round(best.vol)} kg · ${best.exercise}` : dash
    })

    const prBestDayVolumeLabel = computed(() => {
        const map = new Map<string, number>()
        for (const it of strengthEntries.value) {
            const dayKey = toUtcDayKey(it.date)
            if (!dayKey) continue
            let vol = 0
            const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
            const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
            if (detailsMatchSets) {
                for (const s of it.setDetails!) {
                    if (typeof s.reps === 'number' && typeof s.weight === 'number') {
                        vol += s.reps * s.weight
                    }
                }
            } else if (typeof it.reps === 'number' && typeof it.weight === 'number') {
                const fallbackSets =
                    (typeof it.sets === 'number')
                        ? it.sets
                        : ((typeof it.reps === 'number' || typeof it.weight === 'number') ? 1 : 0)
                vol += it.reps * it.weight * (fallbackSets || 1)
            }
            if (vol > 0) map.set(dayKey, (map.get(dayKey) ?? 0) + vol)
        }
        if (!map.size) return dash
        let bestDay = ''
        let bestVol = -1
        for (const [day, vol] of map.entries()) {
            if (vol > bestVol) {
                bestVol = vol
                bestDay = day
            }
        }
        return bestVol > -1 ? `${Math.round(bestVol)} kg · ${formatDateLabel(bestDay)}` : dash
    })

    const prTop1RmLabel = computed(() => {
        let best = { rm: -1, exercise: '' }
        for (const it of strengthEntries.value) {
            const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
            const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
            if (detailsMatchSets) {
                for (const s of it.setDetails!) {
                    if (typeof s.reps === 'number' && typeof s.weight === 'number') {
                        const rm = Math.round(s.weight * (1 + s.reps / 30))
                        if (rm > best.rm) best = { rm, exercise: it.exercise }
                    }
                }
            } else {
                const reps = typeof it.reps === 'number' ? it.reps : null
                const weight = typeof it.weight === 'number' ? it.weight : null
                if (reps && weight) {
                    const rm = Math.round(weight * (1 + reps / 30))
                    if (rm > best.rm) best = { rm, exercise: it.exercise }
                }
            }
        }
        return best.rm > -1 ? `${best.rm} kg · ${best.exercise}` : dash
    })

    const trendWindowStats = (fromUtc: number, toUtc: number) => {
        const days = new Set<string>()
        let entries = 0
        let volume = 0
        let cardioMin = 0

        for (const it of props.entries) {
            const dayKey = toUtcDayKey(it.date)
            if (!dayKey) continue
            const ts = Date.parse(`${dayKey}T00:00:00Z`)
            if (ts < fromUtc || ts > toUtc) continue

            days.add(dayKey)
            entries += 1

            if (it.type === 'kraft' || it.type === 'calisthenics') {
                const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
                const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
                if (detailsMatchSets) {
                    for (const s of it.setDetails!) {
                        if (typeof s.reps === 'number' && typeof s.weight === 'number') {
                            volume += s.reps * s.weight
                        }
                    }
                } else if (typeof it.reps === 'number' && typeof it.weight === 'number') {
                    const fallbackSets =
                        (typeof it.sets === 'number')
                            ? it.sets
                            : ((typeof it.reps === 'number' || typeof it.weight === 'number') ? 1 : 0)
                    volume += it.reps * it.weight * (fallbackSets || 1)
                }
            }

            if (typeof it.durationMin === 'number') cardioMin += it.durationMin
        }

        return { entries, days: days.size, volume, cardioMin }
    }

    const trendStats = computed(() => {
        const today = new Date()
        const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        const curFrom = todayUtc - 28 * 86400000
        const prevFrom = todayUtc - 56 * 86400000
        const prevTo = curFrom - 86400000
        return {
            cur: trendWindowStats(curFrom, todayUtc),
            prev: trendWindowStats(prevFrom, prevTo),
        }
    })

    const trendEntriesLabel = computed(() => `${trendStats.value.cur.entries}`)
    const trendDaysLabel = computed(() => `${trendStats.value.cur.days}`)
    const trendVolumeLabel = computed(() => formatKgLabel(trendStats.value.cur.volume))
    const trendCardioLabel = computed(() => formatMinLabel(trendStats.value.cur.cardioMin))

    const trendComparisonLabel = computed(() => {
        const deltaEntries = trendStats.value.cur.entries - trendStats.value.prev.entries
        const deltaDays = trendStats.value.cur.days - trendStats.value.prev.days
        const deltaVol = Math.round(trendStats.value.cur.volume - trendStats.value.prev.volume)
        const deltaCardio = Math.round(trendStats.value.cur.cardioMin - trendStats.value.prev.cardioMin)
        const parts = [
            t('progress.planStats.trend.entriesDelta').replace('{value}', `${deltaEntries >= 0 ? '+' : ''}${deltaEntries}`),
            t('progress.planStats.trend.daysDelta').replace('{value}', `${deltaDays >= 0 ? '+' : ''}${deltaDays}`),
        ]
        if (deltaVol !== 0) {
            parts.push(t('progress.planStats.trend.volumeDelta').replace('{value}', `${deltaVol >= 0 ? '+' : ''}${deltaVol}`))
        }
        if (deltaCardio !== 0) {
            parts.push(t('progress.planStats.trend.cardioDelta').replace('{value}', `${deltaCardio >= 0 ? '+' : ''}${deltaCardio}`))
        }
        return parts.join(' · ')
    })

    const muscleGroups: MuscleGroupId[] = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs']

    const muscleKeywordMap: Record<string, MuscleGroupId[]> = {
        brust: ['chest'],
        bankdrücken: ['chest'],
        bankdruecken: ['chest'],
        liegestütz: ['chest', 'arms'],
        liegestuetz: ['chest', 'arms'],
        butterfly: ['chest'],
        brustpresse: ['chest'],
        rücken: ['back'],
        ruecken: ['back'],
        latzug: ['back'],
        rudern: ['back'],
        klimmzug: ['back', 'arms'],
        kreuzheben: ['back', 'legs'],
        schulter: ['shoulders'],
        schulterdrücken: ['shoulders'],
        schulterdruecken: ['shoulders'],
        seitheben: ['shoulders'],
        arme: ['arms'],
        bizeps: ['arms'],
        trizeps: ['arms'],
        dips: ['arms', 'chest'],
        bauch: ['core'],
        core: ['core'],
        plank: ['core'],
        bein: ['legs'],
        beine: ['legs'],
        kniebeuge: ['legs'],
        beinpresse: ['legs'],
        ausfallschritt: ['legs'],
        waden: ['legs'],
        hip: ['legs'],
        glute: ['legs'],
        po: ['legs'],
    }

    const resolveMuscleGroups = (exercise: string) => {
        const name = exercise.toLowerCase()
        const hits = new Set<MuscleGroupId>()
        for (const [k, groups] of Object.entries(muscleKeywordMap)) {
            if (name.includes(k)) groups.forEach(g => hits.add(g))
        }
        if (!hits.size) {
            for (const g of muscleGroups) {
                if (name.includes(muscleLabel(g).toLowerCase())) hits.add(g)
            }
        }
        return [...hits]
    }

    const muscleVolumes = computed(() => {
        const map = new Map<MuscleGroupId, number>()
        for (const g of muscleGroups) map.set(g, 0)

        for (const it of strengthEntries.value) {
            const groups = resolveMuscleGroups(it.exercise)
            if (!groups.length) continue
            let vol = 0
            const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
            const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)
            if (detailsMatchSets) {
                for (const s of it.setDetails!) {
                    if (typeof s.reps === 'number' && typeof s.weight === 'number') vol += s.reps * s.weight
                }
            } else if (typeof it.reps === 'number' && typeof it.weight === 'number') {
                const fallbackSets =
                    (typeof it.sets === 'number')
                        ? it.sets
                        : ((typeof it.reps === 'number' || typeof it.weight === 'number') ? 1 : 0)
                vol += it.reps * it.weight * (fallbackSets || 1)
            }
            if (vol <= 0) continue
            const share = vol / groups.length
            for (const g of groups) map.set(g, (map.get(g) ?? 0) + share)
        }
        return [...map.entries()].sort((a, b) => b[1] - a[1])
    })

    const topMuscleGroupLabel = computed(() => {
        const first = muscleVolumes.value[0]
        return first && first[1] > 0 ? `${muscleLabel(first[0])} (${Math.round(first[1])} kg)` : dash
    })

    const topMuscleGroup2Label = computed(() => {
        const v = muscleVolumes.value[1]
        return v && v[1] > 0 ? `${muscleLabel(v[0])} (${Math.round(v[1])} kg)` : dash
    })

    const topMuscleGroup3Label = computed(() => {
        const v = muscleVolumes.value[2]
        return v && v[1] > 0 ? `${muscleLabel(v[0])} (${Math.round(v[1])} kg)` : dash
    })

    const muscleSplitLabel = computed(() => {
        const total = muscleVolumes.value.reduce((sum, [, v]) => sum + v, 0)
        if (!total) return dash
        const parts = muscleVolumes.value
            .filter(([, v]) => v > 0)
            .slice(0, 5)
            .map(([g, v]) => `${muscleLabel(g)} ${Math.round((v / total) * 100)}%`)
        return parts.join(' · ')
    })
</script>

<style scoped>
    .plan-stats {
        display: grid;
        gap: .75rem;
        overflow-x: hidden;
    }

    .plan-stats > div:not(.stats-empty) {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .plan-stats {
        padding-bottom: .75rem;
    }

    .stats-empty {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: .75rem;
        padding: .9rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.04));
    }

    .stats-empty-icon {
        width: 2.2rem;
        height: 2.2rem;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: rgba(148, 163, 184, 0.12);
        border: 1px solid rgba(148, 163, 184, 0.22);
    }

    .stats-empty-text {
        color: var(--text-secondary);
        font-weight: 600;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .6rem;
        overflow-x: hidden;
        min-height: 0;
    }

    @media (max-width: 520px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }

    .stats-card {
        padding: .75rem .85rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.07), rgba(148, 163, 184, 0.04));
        display: grid;
        gap: .25rem;
        overflow: hidden;
    }

    .stats-card:not(.stats-card--wide) {
        height: 78px;
        align-content: center;
    }

    .stats-k,
    .stats-v {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .stats-card--wide {
        grid-column: 1 / -1;
    }

    .stats-card--panel {
        height: auto !important;
        align-content: start !important;
    }

    .stats-note .stats-v {
        display: flex;
        align-items: flex-start;
        gap: .5rem;
    }

    .stats-note-text {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .stats-note-text.expanded {
        -webkit-line-clamp: unset;
        overflow: visible;
    }

    .stats-note-more {
        appearance: none;
        border: 0;
        background: transparent;
        color: var(--text-secondary);
        font-size: 1rem;
        line-height: 1;
        padding: .1rem .35rem;
        border-radius: 10px;
        cursor: pointer;
        flex: 0 0 auto;
    }

    .stats-note-more:hover {
        color: var(--text-primary);
        background: rgba(148, 163, 184, 0.16);
    }

    .stats-filter {
        display: flex;
        gap: .4rem;
        margin-bottom: .6rem;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-gutter: stable both-edges;
        padding: 0 0 .2rem 0;
    }

    .stats-filter::after {
        content: "";
        flex: 0 0 .75rem;
    }

    .filter-btn {
        appearance: none;
        border: 1px solid rgba(148, 163, 184, 0.30);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-primary);
        border-radius: 999px;
        padding: .35rem .75rem;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
    }

    .filter-btn.active {
        border-color: rgba(129, 140, 248, 0.55);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
        background: rgba(129, 140, 248, 0.12);
    }

    .stats-k {
        font-size: .72rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .02em;
        color: var(--text-secondary);
    }

    .stats-v {
        font-size: 1.05rem;
        font-weight: 900;
        color: var(--text-primary);
    }

    html.dark-mode .stats-card {
        border-color: rgba(148, 163, 184, 0.22);
        background: rgba(255,255,255,0.03);
    }
</style>
