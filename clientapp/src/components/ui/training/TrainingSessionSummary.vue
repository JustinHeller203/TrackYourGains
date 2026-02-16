<!-- components/ui/training/TrainingSessionSummary.vue -->
<template>
    <BasePopup :show="show"
               :title="title"
               overlayClass="training-summary-popup"
               :showClose="true"
               :show-actions="false"
               @cancel="$emit('close')">

        <div class="tss-root">
            <div class="tss-head">
                <div class="tss-title">📊 Training Summary</div>
                <div class="tss-sub">
                    <span v-if="meta.planName"><b>{{ meta.planName }}</b></span>
                    <span v-if="meta.durationSec != null"> · {{ fmtDuration(meta.durationSec) }}</span>
                    <span v-if="meta.startedAtIso"> · Start: {{ fmtDate(meta.startedAtIso) }}</span>
                </div>
            </div>

            <!-- KPI Grid -->
            <!-- KPI Grid -->
            <div class="tss-grid">
                <!-- Overall -->
                <div class="tss-card">
                    <div class="tss-kpi-label">Übungen</div>
                    <div class="tss-kpi">{{ kpis.exercisesTotal ?? '—' }}</div>
                    <div class="tss-kpi-sub">
                        durchgezogen: {{ kpis.exercisesDone ?? '—' }}
                        <span v-if="completionPct != null"> · {{ completionPct }}%</span>
                    </div>
                </div>

                <div class="tss-card">
                    <div class="tss-kpi-label">Dauer</div>
                    <div class="tss-kpi">{{ meta.durationSec != null ? fmtDuration(meta.durationSec) : '—' }}</div>
                    <div class="tss-kpi-sub">
                        avg/Übung: {{ avgSecPerExercise != null ? fmtDuration(avgSecPerExercise) : '—' }}
                    </div>
                </div>

                <!-- Strength -->
                <div v-if="showStrengthKpis" class="tss-card">
                    <div class="tss-kpi-label">Sätze</div>
                    <div class="tss-kpi">{{ kpis.setsTotal ?? '—' }}</div>
                    <div class="tss-kpi-sub">geloggt: {{ kpis.setsLogged ?? '—' }}</div>
                </div>

                <div v-if="showStrengthKpis" class="tss-card">
                    <div class="tss-kpi-label">Volumen</div>
                    <div class="tss-kpi">{{ fmtVolume(kpis.volumeKg) }}</div>
                    <div class="tss-kpi-sub">
                        Ø/Übung: {{ avgVolumePerStrengthEx != null ? fmtVolume(avgVolumePerStrengthEx) : '—' }}
                    </div>
                </div>

                <div v-if="showStrengthKpis" class="tss-card">
                    <div class="tss-kpi-label">Best Set</div>
                    <div class="tss-kpi">{{ bestSetLabel }}</div>
                    <div class="tss-kpi-sub">{{ bestSetSub }}</div>
                </div>

                <div v-if="showStrengthKpis" class="tss-card">
                    <div class="tss-kpi-label">Top Vol Exercise</div>
                    <div class="tss-kpi">{{ topVolumeExerciseLabel }}</div>
                    <div class="tss-kpi-sub">{{ topVolumeExerciseSub }}</div>
                </div>

                <!-- Mix -->
                <div class="tss-card">
                    <div class="tss-kpi-label">Mix</div>
                    <div class="tss-kpi">{{ mixLabel }}</div>
                    <div class="tss-kpi-sub">Kraft · Cardio · Dehnung</div>
                </div>

                <!-- Cardio -->
                <div v-if="showCardioKpis" class="tss-card">
                    <div class="tss-kpi-label">Cardio Zeit</div>
                    <div class="tss-kpi">{{ fmtDuration(cardioTotalSec) }}</div>
                    <div class="tss-kpi-sub">Top: {{ topTimeExerciseLabel }}</div>
                </div>

                <!-- Stretch -->
                <div v-if="showStretchKpis" class="tss-card">
                    <div class="tss-kpi-label">Dehnung Zeit</div>
                    <div class="tss-kpi">{{ fmtDuration(stretchTotalSec) }}</div>
                    <div class="tss-kpi-sub">Top: {{ topStretchExerciseLabel }}</div>
                </div>
            </div>


            <!-- Sections -->
            <div class="tss-sections">
                <div class="tss-section">
                    <div class="tss-section-title">Highlights</div>
                    <div v-if="!highlights?.length" class="tss-muted">Noch keine Highlights.</div>
                    <ul v-else class="tss-list">
                        <li v-for="(h, i) in highlights" :key="i">{{ h }}</li>
                    </ul>
                </div>

                <div class="tss-section">
                    <div class="tss-section-title">Übungen Übersicht</div>

                    <div v-if="!perExercise?.length" class="tss-muted">Keine Daten.</div>

                    <div v-else class="tss-ex-list">
                        <div v-for="ex in perExercise" :key="ex.exercise" class="tss-ex-row">
                            <div class="tss-ex-left">
                                <div class="tss-ex-name">{{ ex.exercise }}</div>
                                <div class="tss-ex-meta">
                                    <span class="pill">{{ typeLabel(ex.type) }}</span>

                                    <template v-if="isStrengthLike(ex.type)">
                                        <span class="pill ghost" v-if="ex.setsTotal != null">🎯 {{ ex.setsTotal }} Sätze</span>
                                        <span class="pill ghost" v-if="ex.repsTarget != null">🔁 Ziel {{ ex.repsTarget }}</span>
                                    </template>

                                    <template v-else>
                                        <span class="pill ghost" v-if="ex.timeSec != null">⏱️ {{ fmtDuration(ex.timeSec) }}</span>
                                    </template>
                                </div>
                            </div>

                            <div class="tss-ex-right">
                                <template v-if="isStrengthLike(ex.type)">
                                    <div class="tss-mini">
                                        <div class="tss-mini-label">Vol</div>
                                        <div class="tss-mini-val">{{ fmtVolume(ex.volumeKg) }}</div>
                                    </div>
                                    <div class="tss-mini">
                                        <div class="tss-mini-label">Top</div>
                                        <div class="tss-mini-val">{{ ex.topSetLabel ?? '—' }}</div>
                                    </div>
                                </template>

                                <template v-else>
                                    <div class="tss-mini">
                                        <div class="tss-mini-label">Zeit</div>
                                        <div class="tss-mini-val">{{ ex.timeSec != null ? fmtDuration(ex.timeSec) : '—' }}</div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="showTempoRest" class="tss-section">
                    <div class="tss-section-title">Tempo & Rest</div>
                    <div class="tss-rowgrid">
                        <div class="tss-card">
                            <div class="tss-kpi-label">Rest gesamt</div>
                            <div class="tss-kpi">{{ fmtDuration(rest.totalSec) }}</div>
                            <div class="tss-kpi-sub">avg: {{ fmtDuration(rest.avgSec) }}</div>
                        </div>
                        <div class="tss-card">
                            <div class="tss-kpi-label">Set Pace</div>
                            <div class="tss-kpi">{{ fmtDuration(pace.avgSetSec) }}</div>
                            <div class="tss-kpi-sub">Speed Score: {{ pace.score ?? '—' }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="tss-actions">
                <PopupActionButton v-if="showClose" variant="ghost" @click="$emit('close')">
                    Schließen
                </PopupActionButton>

                <PopupActionButton v-if="showExport" @click="$emit('export')">
                    Export
                </PopupActionButton>
            </div>
        </div>

    </BasePopup>
</template>


<script setup lang="ts">
    import { computed } from "vue"
    import BasePopup from "@/components/ui/popups/BasePopup.vue"
    import PopupActionButton from "@/components/ui/buttons/popup/PopupActionButton.vue"

    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'

    export type SummaryMeta = {
        planId?: string | null
        planName?: string | null
        startedAtIso?: string | null
        finishedAtIso?: string | null
        durationSec?: number | null
        unit?: 'kg' | 'lbs'
    }

    export type SummaryKpis = {
        exercisesTotal?: number | null
        exercisesDone?: number | null
        setsTotal?: number | null
        setsLogged?: number | null
        volumeKg?: number | null
    }

    export type SummaryBestSet = {
        exercise?: string | null
        weightKg?: number | null
        reps?: number | null
        e1rmKg?: number | null
    }

    export type SummaryPerExercise = {
        exercise: string
        type?: ExerciseType
        setsTotal?: number | null
        repsTarget?: number | null
        timeSec?: number | null
        volumeKg?: number | null
        topSetLabel?: string | null
    }

    export type SummaryRest = {
        totalSec?: number | null
        avgSec?: number | null
    }

    export type SummaryPace = {
        avgSetSec?: number | null
        score?: number | null
    }

    const props = defineProps<{
        show: boolean
        title?: string
        meta: SummaryMeta
        kpis: SummaryKpis
        bestSet?: SummaryBestSet | null
        highlights?: string[] | null
        perExercise?: SummaryPerExercise[] | null
        rest?: SummaryRest
        pace?: SummaryPace
        showClose?: boolean
        showExport?: boolean
    }>()

    const title = computed(() => props.title ?? "📊 Training abgeschlossen")
    const show = computed(() => !!props.show)

    defineEmits<{
        (e: 'close'): void
        (e: 'export'): void
    }>()

    const rest = computed(() => props.rest ?? { totalSec: null, avgSec: null })
    const pace = computed(() => props.pace ?? { avgSetSec: null, score: null })

    const normType = (t?: ExerciseType): ExerciseType => (t ?? 'kraft')

    const isStrengthLike = (t?: ExerciseType) => {
        const nt = normType(t)
        return nt === 'kraft' || nt === 'calisthenics'
    }
    const isCardio = (t?: ExerciseType) => normType(t) === 'ausdauer'
    const isStretch = (t?: ExerciseType) => normType(t) === 'dehnung'

    const hasStrengthLike = computed(() => (props.perExercise ?? []).some(ex => isStrengthLike(ex.type)))
    const hasCardioAny = computed(() => (props.perExercise ?? []).some(ex => isCardio(ex.type)))
    const hasStretchAny = computed(() => (props.perExercise ?? []).some(ex => isStretch(ex.type)))

    const showStrengthKpis = computed(() => hasStrengthLike.value)

    const showTempoRest = computed(() => hasStrengthLike.value && (
        (rest.value?.totalSec ?? 0) > 0 ||
        (rest.value?.avgSec ?? 0) > 0 ||
        (pace.value?.avgSetSec ?? 0) > 0 ||
        pace.value?.score != null
    ))

    const bestSetLabel = computed(() => {
        const b = props.bestSet
        if (!b?.weightKg || !b?.reps) return '—'
        return `${round1(b.weightKg)}kg × ${b.reps}`
    })

    const bestSetSub = computed(() => {
        const b = props.bestSet
        if (!b?.exercise) return '—'
        if (b?.e1rmKg) return `${b.exercise} · e1RM ${round1(b.e1rmKg)}kg`
        return `${b.exercise}`
    })

    const completionPct = computed(() => {
        const total = Number(props.kpis?.exercisesTotal ?? 0)
        const done = Number(props.kpis?.exercisesDone ?? 0)
        if (!total || total <= 0) return null
        const pct = Math.round((done / total) * 100)
        return Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : null
    })

    const avgSecPerExercise = computed(() => {
        const totalSec = Number(props.meta?.durationSec ?? 0)
        const totalEx = Number(props.kpis?.exercisesTotal ?? 0)
        if (!totalSec || !totalEx) return null
        const v = Math.round(totalSec / totalEx)
        return Number.isFinite(v) ? v : null
    })

    const strengthCount = computed(() => (props.perExercise ?? []).filter(ex => isStrengthLike(ex.type)).length)
    const cardioCount = computed(() => (props.perExercise ?? []).filter(ex => isCardio(ex.type)).length)
    const stretchCount = computed(() => (props.perExercise ?? []).filter(ex => isStretch(ex.type)).length)

    const mixLabel = computed(() => `${strengthCount.value}/${cardioCount.value}/${stretchCount.value}`)

    const avgVolumePerStrengthEx = computed(() => {
        const totalVol = Number(props.kpis?.volumeKg ?? 0)
        const n = Number(strengthCount.value ?? 0)
        if (!n || n <= 0) return null
        const v = totalVol / n
        return Number.isFinite(v) ? v : null
    })

    const cardioTotalSec = computed(() => {
        return (props.perExercise ?? [])
            .filter(ex => isCardio(ex.type))
            .reduce((sum, ex) => sum + Math.max(0, Number(ex.timeSec ?? 0)), 0)
    })

    const stretchTotalSec = computed(() => {
        return (props.perExercise ?? [])
            .filter(ex => isStretch(ex.type))
            .reduce((sum, ex) => sum + Math.max(0, Number(ex.timeSec ?? 0)), 0)
    })

    const showCardioKpis = computed(() => hasCardioAny.value && cardioTotalSec.value > 0)
    const showStretchKpis = computed(() => hasStretchAny.value && stretchTotalSec.value > 0)

    const topVolumeExercise = computed(() => {
        const list = (props.perExercise ?? []).filter(ex => isStrengthLike(ex.type))
        if (!list.length) return null
        return list.reduce((best, cur) => {
            const bv = Number(best.volumeKg ?? 0)
            const cv = Number(cur.volumeKg ?? 0)
            return cv > bv ? cur : best
        })
    })

    const topVolumeExerciseLabel = computed(() => {
        const ex = topVolumeExercise.value
        if (!ex?.exercise) return '—'
        return ex.exercise
    })

    const topVolumeExerciseSub = computed(() => {
        const ex = topVolumeExercise.value
        if (!ex) return '—'
        const vol = fmtVolume(ex.volumeKg ?? null)
        const top = ex.topSetLabel ?? '—'
        return `${vol} · Top ${top}`
    })

    const topTimeExercise = computed(() => {
        const list = (props.perExercise ?? []).filter(ex => isCardio(ex.type))
        if (!list.length) return null
        return list.reduce((best, cur) => {
            const bv = Number(best.timeSec ?? 0)
            const cv = Number(cur.timeSec ?? 0)
            return cv > bv ? cur : best
        })
    })

    const topTimeExerciseLabel = computed(() => {
        const ex = topTimeExercise.value
        if (!ex?.exercise) return '—'
        return ex.exercise
    })

    const topStretchExercise = computed(() => {
        const list = (props.perExercise ?? []).filter(ex => isStretch(ex.type))
        if (!list.length) return null
        return list.reduce((best, cur) => {
            const bv = Number(best.timeSec ?? 0)
            const cv = Number(cur.timeSec ?? 0)
            return cv > bv ? cur : best
        })
    })

    const topStretchExerciseLabel = computed(() => {
        const ex = topStretchExercise.value
        if (!ex?.exercise) return '—'
        return ex.exercise
    })


    const typeLabel = (t?: ExerciseType) => {
        if (t === 'ausdauer') return 'Ausdauer'
        if (t === 'dehnung') return 'Dehnung'
        if (t === 'calisthenics') return 'Calisthenics'
        return 'Kraft'
    }

    const fmtDuration = (sec?: number | null) => {
        const s = Math.max(0, Math.floor(Number(sec ?? 0)))
        const mm = Math.floor(s / 60)
        const ss = String(s % 60).padStart(2, '0')
        return `${mm}:${ss}`
    }

    const fmtDate = (iso?: string | null) => {
        if (!iso) return '—'
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return iso
        return d.toLocaleString()
    }

    const fmtVolume = (kg?: number | null) => {
        if (kg == null || !Number.isFinite(Number(kg))) return '—'
        const n = Number(kg)
        if (n <= 0) return '0'
        if (n >= 1000) return `${Math.round(n)}kg`
        return `${round1(n)}kg`
    }

    const round1 = (n: number) => Math.round(n * 10) / 10
</script>

<style scoped>
    .tss-root {
        display: grid;
        gap: 1rem;
        max-height: 52vh;
        overflow: auto;
        min-height: 0;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        padding-right: .15rem;
    }

    .tss-head {
        text-align: center;
    }

    .tss-title {
        font-size: 1.35rem;
        font-weight: 1000;
    }

    .tss-sub {
        margin-top: .25rem;
        opacity: .9;
    }

    .tss-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .75rem;
    }

    .tss-card, .tss-section {
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: rgba(0,0,0,.10);
        padding: .9rem;
    }

    .tss-kpi-label {
        font-weight: 800;
        opacity: .92;
    }

    .tss-kpi {
        margin-top: .25rem;
        font-size: 1.45rem;
        font-weight: 1000;
    }

    .tss-kpi-sub {
        margin-top: .25rem;
        opacity: .85;
    }

    .tss-sections {
        display: grid;
        gap: .75rem;
    }

    .tss-section-title {
        font-weight: 1000;
        margin-bottom: .5rem;
    }

    .tss-muted {
        opacity: .85;
        text-align: center;
        padding: .25rem 0;
    }

    .tss-list {
        margin: 0;
        padding-left: 1.1rem;
        display: grid;
        gap: .35rem;
    }

    .tss-ex-list {
        display: grid;
        gap: .6rem;
    }

    .tss-ex-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: .75rem;
        align-items: center;
        padding: .75rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(0,0,0,.08);
    }

    .tss-ex-name {
        font-weight: 1000;
    }

    .tss-ex-meta {
        margin-top: .35rem;
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
        justify-content: flex-start;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        padding: .18rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(0,0,0,.10);
        font-size: .9rem;
        font-weight: 800;
    }

        .pill.ghost {
            opacity: .9;
        }

    .tss-ex-right {
        display: grid;
        gap: .35rem;
        justify-items: end;
    }

    .tss-mini {
        text-align: right;
    }

    .tss-mini-label {
        opacity: .8;
        font-weight: 800;
        font-size: .85rem;
    }

    .tss-mini-val {
        font-weight: 1000;
    }

    .tss-rowgrid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .75rem;
    }

    .tss-actions {
        display: flex;
        justify-content: flex-end; /* ✅ rechts */
        gap: .6rem;
        position: sticky;
        bottom: 0;
        z-index: 2;
        padding: .65rem 0 0; /* top padding wie vorher, aber sauber */
        background: color-mix(in srgb, rgba(0,0,0,.18) 70%, transparent);
        border-top: 1px solid rgba(148, 163, 184, 0.16);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    @media (max-width: 760px) {
        .tss-grid {
            grid-template-columns: 1fr;
        }

        .tss-rowgrid {
            grid-template-columns: 1fr;
        }

        .tss-ex-row {
            grid-template-columns: 1fr;
        }

        .tss-ex-right {
            justify-items: start;
        }

        .tss-mini {
            text-align: left;
        }
    }

</style>
