<!--components/ui/progress/PlanProgressStats.vue-->
<template>
    <div class="plan-stats">
        <div v-if="!entries.length" class="stats-empty">
            <div class="stats-empty-icon" aria-hidden="true">📊</div>
            <div class="stats-empty-text">Noch keine Statistik für diesen Plan.</div>
        </div>

        <div v-else>
            <div class="stats-filter" role="tablist" aria-label="Statistik Filter">
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'overview' }" @click="activeSection = 'overview'">Übersicht</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'strength' }" @click="activeSection = 'strength'">Kraft</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'cardio' }" @click="activeSection = 'cardio'">Cardio</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'consistency' }" @click="activeSection = 'consistency'">Konstanz</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'prs' }" @click="activeSection = 'prs'">PRs</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'trends' }" @click="activeSection = 'trends'">Trends</button>
                <button type="button" class="filter-btn" :class="{ active: activeSection === 'muscle' }" @click="activeSection = 'muscle'">Muskeln</button>
            </div>

            <div v-if="activeSection === 'overview'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">Einträge</div>
                    <div class="stats-v">{{ totalEntries }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Trainings-Tage</div>
                    <div class="stats-v">{{ totalDays }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Übungen</div>
                    <div class="stats-v">{{ uniqueExercises }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Erster Eintrag</div>
                    <div class="stats-v">{{ firstEntryLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Letzter Eintrag</div>
                    <div class="stats-v">{{ lastEntryLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Split</div>
                    <div class="stats-v">{{ typeSplitLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Top Übung</div>
                    <div class="stats-v">{{ topExerciseLabel }}</div>
                </div>
                <div class="stats-card stats-card--wide">
                    <div class="stats-k">Letzte 4 Wochen</div>
                    <div class="stats-v">{{ last4WeeksSummary }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'strength'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">Sätze</div>
                    <div class="stats-v">{{ totalStrengthSets }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Wdh</div>
                    <div class="stats-v">{{ totalStrengthReps }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Volumen</div>
                    <div class="stats-v">{{ totalStrengthVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Ø Volumen/Tag</div>
                    <div class="stats-v">{{ avgStrengthVolumePerDayLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Ø Volumen/Woche</div>
                    <div class="stats-v">{{ avgStrengthVolumePerWeekLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Ø Gewicht/Set</div>
                    <div class="stats-v">{{ avgWeightPerSetLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Ø Wdh/Set</div>
                    <div class="stats-v">{{ avgRepsPerSetLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'cardio'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">Cardio Min</div>
                    <div class="stats-v">{{ totalCardioMinLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Cardio km</div>
                    <div class="stats-v">{{ totalCardioKmLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Ø Cardio/Tag</div>
                    <div class="stats-v">{{ avgCardioMinPerDayLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Ø Cardio/Woche</div>
                    <div class="stats-v">{{ avgCardioMinPerWeekLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'consistency'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">Aktive Wochen</div>
                    <div class="stats-v">{{ activeWeeks }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Ø Tage/Woche</div>
                    <div class="stats-v">{{ avgDaysPerWeekLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Aktueller Streak</div>
                    <div class="stats-v">{{ currentStreak }} Tage</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Bester Streak</div>
                    <div class="stats-v">{{ bestStreak }} Tage</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Meister‑Tag</div>
                    <div class="stats-v">{{ mostActiveWeekdayLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'prs'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">Max Gewicht</div>
                    <div class="stats-v">{{ prMaxWeightLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Max Wdh</div>
                    <div class="stats-v">{{ prMaxRepsLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Max Satz‑Volumen</div>
                    <div class="stats-v">{{ prMaxSetVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Beste Session</div>
                    <div class="stats-v">{{ prBestDayVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Top 1RM (Epley)</div>
                    <div class="stats-v">{{ prTop1RmLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'trends'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">Einträge (28T)</div>
                    <div class="stats-v">{{ trendEntriesLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Trainingstage (28T)</div>
                    <div class="stats-v">{{ trendDaysLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Volumen (28T)</div>
                    <div class="stats-v">{{ trendVolumeLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Cardio Min (28T)</div>
                    <div class="stats-v">{{ trendCardioLabel }}</div>
                </div>
                <div class="stats-card stats-card--wide">
                    <div class="stats-k">Vergleich zu Vor‑28T</div>
                    <div class="stats-v">{{ trendComparisonLabel }}</div>
                </div>
            </div>

            <div v-else-if="activeSection === 'muscle'" class="stats-grid">
                <div class="stats-card">
                    <div class="stats-k">Top Muskelgruppe</div>
                    <div class="stats-v">{{ topMuscleGroupLabel }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Top 2</div>
                    <div class="stats-v">{{ topMuscleGroup2Label }}</div>
                </div>
                <div class="stats-card">
                    <div class="stats-k">Top 3</div>
                    <div class="stats-v">{{ topMuscleGroup3Label }}</div>
                </div>
                <div class="stats-card stats-card--wide">
                    <div class="stats-k">Muskel‑Verteilung</div>
                    <div class="stats-v">{{ muscleSplitLabel }}</div>
                </div>
                <div class="stats-card stats-card--wide stats-note">
                    <div class="stats-k">Hinweis</div>
                    <div class="stats-v">
                        <span class="stats-note-text" :class="{ expanded: muscleHintExpanded }">
                            Erkennung basiert auf Übungsnamen (Heuristik).
                        </span>
                        <button type="button"
                                class="stats-note-more"
                                aria-label="Hinweis vollständig anzeigen"
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

    const props = defineProps<{
        entries: WorkoutLike[]
    }>()

    const activeSection = ref<'overview' | 'strength' | 'cardio' | 'consistency' | 'prs' | 'trends' | 'muscle'>('overview')
    const muscleHintExpanded = ref(false)

    const pad2 = (n: number) => String(n).padStart(2, '0')

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
        if (!first) return '–'
        const [y, m, d] = first.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    })

    const lastEntryLabel = computed(() => {
        const last = [...dayKeys.value].sort().at(-1)
        if (!last) return '–'
        const [y, m, d] = last.split('-').map(Number)
        return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('de-DE', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    })

    const avgDaysPerWeekLabel = computed(() => {
        const weeks = activeWeeks.value || 0
        if (!weeks) return '–'
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

    const mostActiveWeekdayLabel = computed(() => {
        if (!props.entries.length) return '–'
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
        const label = new Date(Date.UTC(2020, 5, 7 + bestDay)).toLocaleDateString('de-DE', { weekday: 'short' })
        return label
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

    const totalStrengthVolumeLabel = computed(() =>
        totalStrengthVolume.value > 0 ? `${Math.round(totalStrengthVolume.value)} kg` : '–'
    )

    const avgStrengthVolumePerDayLabel = computed(() => {
        if (!totalDays.value) return '–'
        return `${Math.round(totalStrengthVolume.value / totalDays.value)} kg`
    })

    const avgStrengthVolumePerWeekLabel = computed(() => {
        if (!activeWeeks.value) return '–'
        return `${Math.round(totalStrengthVolume.value / activeWeeks.value)} kg`
    })

    const avgWeightPerSetLabel = computed(() => {
        const totalSets = strengthStats.value.totalSets
        if (!totalSets) return '–'
        const avg = strengthStats.value.totalWeightSum / totalSets
        return Number.isFinite(avg) ? (Number.isInteger(avg) ? `${avg} kg` : `${avg.toFixed(1)} kg`) : '–'
    })

    const avgRepsPerSetLabel = computed(() => {
        const totalSets = strengthStats.value.totalSets
        if (!totalSets) return '–'
        const avg = strengthStats.value.totalReps / totalSets
        return Number.isFinite(avg) ? (Number.isInteger(avg) ? `${avg}` : `${avg.toFixed(1)}`) : '–'
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

    const totalCardioMinLabel = computed(() =>
        totalCardioMin.value > 0 ? `${Math.round(totalCardioMin.value)} min` : '–'
    )

    const totalCardioKmLabel = computed(() =>
        totalCardioKm.value > 0 ? `${totalCardioKm.value.toFixed(1)} km` : '–'
    )

    const avgCardioMinPerDayLabel = computed(() => {
        if (!totalDays.value) return '–'
        return `${Math.round(totalCardioMin.value / totalDays.value)} min`
    })

    const avgCardioMinPerWeekLabel = computed(() => {
        if (!activeWeeks.value) return '–'
        return `${Math.round(totalCardioMin.value / activeWeeks.value)} min`
    })

    const typeSplitLabel = computed(() => {
        const counts = { kraft: 0, calisthenics: 0, ausdauer: 0, dehnung: 0 }
        for (const it of props.entries) {
            const t = it.type ?? 'kraft'
            if (t in counts) counts[t as keyof typeof counts] += 1
        }
        const total = Object.values(counts).reduce((a, b) => a + b, 0)
        if (!total) return '–'
        const pct = (n: number) => `${Math.round((n / total) * 100)}%`
        return `K ${pct(counts.kraft)} · C ${pct(counts.calisthenics)} · A ${pct(counts.ausdauer)} · D ${pct(counts.dehnung)}`
    })

    const topExerciseLabel = computed(() => {
        const map = new Map<string, number>()
        for (const it of props.entries) {
            const name = String(it.exercise ?? '').trim()
            if (!name) continue
            map.set(name, (map.get(name) ?? 0) + 1)
        }
        if (!map.size) return '–'
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
        if (!props.entries.length) return '–'
        const today = new Date()
        const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
        const cutoff = todayUtc - 28 * 86400000

        let days = new Set<string>()
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

        const dayCount = days.size
        const volLabel = volume > 0 ? `${Math.round(volume)} kg` : '–'
        return `${dayCount} Tage · ${sessions} Einträge · ${volLabel}`
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
        return best.weight > -1 ? `${best.weight} kg · ${best.exercise}` : '–'
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
        return best.reps > -1 ? `${best.reps} Wdh · ${best.exercise}` : '–'
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
        return best.vol > -1 ? `${Math.round(best.vol)} kg · ${best.exercise}` : '–'
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
        if (!map.size) return '–'
        let bestDay = ''
        let bestVol = -1
        for (const [day, vol] of map.entries()) {
            if (vol > bestVol) {
                bestVol = vol
                bestDay = day
            }
        }
        return bestVol > -1 ? `${Math.round(bestVol)} kg · ${bestDay}` : '–'
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
        return best.rm > -1 ? `${best.rm} kg · ${best.exercise}` : '–'
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

            if (typeof it.durationMin === 'number') {
                cardioMin += it.durationMin
            }
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
    const trendVolumeLabel = computed(() =>
        trendStats.value.cur.volume > 0 ? `${Math.round(trendStats.value.cur.volume)} kg` : '–'
    )
    const trendCardioLabel = computed(() =>
        trendStats.value.cur.cardioMin > 0 ? `${Math.round(trendStats.value.cur.cardioMin)} min` : '–'
    )
    const trendComparisonLabel = computed(() => {
        const deltaEntries = trendStats.value.cur.entries - trendStats.value.prev.entries
        const deltaDays = trendStats.value.cur.days - trendStats.value.prev.days
        const deltaVol = Math.round(trendStats.value.cur.volume - trendStats.value.prev.volume)
        const deltaCardio = Math.round(trendStats.value.cur.cardioMin - trendStats.value.prev.cardioMin)
        const parts = [
            `Einträge ${deltaEntries >= 0 ? '+' : ''}${deltaEntries}`,
            `Tage ${deltaDays >= 0 ? '+' : ''}${deltaDays}`,
        ]
        if (deltaVol !== 0) parts.push(`Volumen ${deltaVol >= 0 ? '+' : ''}${deltaVol} kg`)
        if (deltaCardio !== 0) parts.push(`Cardio ${deltaCardio >= 0 ? '+' : ''}${deltaCardio} min`)
        return parts.join(' · ')
    })

    const muscleGroups = [
        'Brust', 'Rücken', 'Schultern', 'Arme', 'Bauch', 'Beine'
    ]

    const muscleKeywordMap: Record<string, string[]> = {
        brust: ['Brust'],
        bankdrücken: ['Brust'],
        liegestütz: ['Brust', 'Arme'],
        butterfly: ['Brust'],
        brustpresse: ['Brust'],
        rücken: ['Rücken'],
        latzug: ['Rücken'],
        rudern: ['Rücken'],
        klimmzug: ['Rücken', 'Arme'],
        kreuzheben: ['Rücken', 'Beine'],
        schulter: ['Schultern'],
        schulterdrücken: ['Schultern'],
        seitheben: ['Schultern'],
        arme: ['Arme'],
        bizeps: ['Arme'],
        trizeps: ['Arme'],
        dips: ['Arme', 'Brust'],
        bauch: ['Bauch'],
        core: ['Bauch'],
        plank: ['Bauch'],
        bein: ['Beine'],
        beine: ['Beine'],
        kniebeuge: ['Beine'],
        beinpresse: ['Beine'],
        ausfallschritt: ['Beine'],
        waden: ['Beine'],
        hip: ['Beine'],
        glute: ['Beine'],
        po: ['Beine'],
    }

    const resolveMuscleGroups = (exercise: string) => {
        const name = exercise.toLowerCase()
        const hits = new Set<string>()
        for (const [k, groups] of Object.entries(muscleKeywordMap)) {
            if (name.includes(k)) groups.forEach(g => hits.add(g))
        }
        if (!hits.size) {
            for (const g of muscleGroups) {
                if (name.includes(g.toLowerCase())) hits.add(g)
            }
        }
        return [...hits]
    }

    const muscleVolumes = computed(() => {
        const map = new Map<string, number>()
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
        return first && first[1] > 0 ? `${first[0]} (${Math.round(first[1])} kg)` : '–'
    })
    const topMuscleGroup2Label = computed(() => {
        const v = muscleVolumes.value[1]
        return v && v[1] > 0 ? `${v[0]} (${Math.round(v[1])} kg)` : '–'
    })
    const topMuscleGroup3Label = computed(() => {
        const v = muscleVolumes.value[2]
        return v && v[1] > 0 ? `${v[0]} (${Math.round(v[1])} kg)` : '–'
    })

    const muscleSplitLabel = computed(() => {
        const total = muscleVolumes.value.reduce((sum, [, v]) => sum + v, 0)
        if (!total) return '–'
        const parts = muscleVolumes.value
            .filter(([, v]) => v > 0)
            .slice(0, 5)
            .map(([g, v]) => `${g} ${Math.round((v / total) * 100)}%`)
        return parts.join(' · ')
    })
</script>

<style scoped>
    .plan-stats {
        display: grid;
        gap: .75rem;
        /* ✅ kein eigenes vertical scrolling -> BasePopup popup-body macht das */
        overflow-x: hidden;
    }

        /* ✅ alles unter der Filterbar darf scrollen, wenn es zu hoch wird */
        .plan-stats > div:not(.stats-empty) {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
        }

    .plan-stats {
        padding-bottom: .75rem; /* ✅ man kann minimal weiter runter scrollen */
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
        /* ✅ sorgt dafür, dass Cards nicht “mitwachsen” durch Text */
        overflow: hidden;
    }

        /* ✅ Standard-Cards: feste Höhe -> alle gleich groß */
        .stats-card:not(.stats-card--wide) {
            height: 78px; /* tweak wenn du willst: 72-86px */
            align-content: center; /* nicer vertical balance */
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
            flex: 0 0 .75rem; /* ✅ extra space am Ende */
        }
    .stats-grid {
        min-height: 0;
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
