<!--StopwatchComponent.vue-->
<template>
    <div class="workout-list stopwatch-top">
        <div class="plan-header stopwatch-header">
            <h3 class="section-title">Übungs-Stoppuhr</h3>
            <AddButton title="Neue Stoppuhr hinzufügen" @click="openAddStopwatchPopup" />
        </div>

        <Draggable :modelValue="stopwatches"
                   item-key="id"
                   :handle="'.stopwatch-drag-handle'"
                   ghost-class="drag-ghost"
                   chosen-class="drag-chosen"
                   drag-class="dragging"
                   :force-fallback="false"
                   :animation="180"
                   direction="vertical"
                   easing="cubic-bezier(0.16,1,0.3,1)"
                   :delay="dragDelay"
                   :delay-on-touch-only="true"
                   :touch-start-threshold="8"
                   :fallback-tolerance="3"
                   :fallback-on-body="true"
                   :scroll="true"
                   :scroll-sensitivity="70"
                   :scroll-speed="18"
                   :swap-threshold="0.65"
                   @start="onDragStart"
                   @end="onDragEnd"
                   tag="div"
                   class="drag-stack"
                   @update:modelValue="onDragUpdate">
            <template #item="{ element: stopwatch }">
                <div class="timer-card"
                     :class="{ 'stopwatch-scroll-highlight': highlightStopwatchId === stopwatch.id }"
                     :data-running="stopwatch.isRunning"
                     :key="stopwatch.id"
                     :data-stopwatch-id="stopwatch.id"
                     data-type="stopwatch">
                    <div class="timer-header">
                        <span class="stopwatch-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                        <span class="timer-name" @click.stop="openStopwatchNameEdit(stopwatch.id)">
                            {{ stopwatch.name || 'Stoppuhr' }}
                        </span>

                        <div class="timer-actions">
                            <FavoriteButton :active="stopwatch.isFavorite"
                                            :titleActive="'Aus Favoriten entfernen'"
                                            :titleInactive="'Zu Favoriten hinzufügen'"
                                            @toggle="toggleFavorite(stopwatch.id)" />

                            <CloseButton title="Stoppuhr löschen"
                                         variant="stopwatch"
                                         @click="requestDelete(stopwatch.id)" />
                        </div>
                    </div>

                    <div class="timer-controls">
                        <span class="timer-display">{{ formatStopwatchDisplay(stopwatch.time) }}</span>

                        <div class="timer-buttons">
                            <StartButton :title="stopwatch.isRunning ? 'Pause' : 'Start'"
                                         @click="toggleStopwatch(stopwatch)">
                                {{ stopwatch.isRunning ? 'Pause' : 'Start' }}
                            </StartButton>

                            <ResetControlButton title="Reset" @click="resetStopwatch(stopwatch)" />

                            <RoundButton title="Runde"
                                         :disabled="!stopwatch.isRunning"
                                         @click="addLapTime(stopwatch)" />
                        </div>
                        <div class="target-row">
                            <button type="button"
                                    class="target-chip"
                                    :class="(typeof stopwatch.targetSeconds === 'number' && stopwatch.targetSeconds > 0) ? 'is-set' : ''"
                                    :title="(typeof stopwatch.targetSeconds === 'number' && stopwatch.targetSeconds > 0) ? 'Zielzeit bearbeiten' : 'Zielzeit setzen'"
                                    @click.stop="openTargetTimeEdit(stopwatch.id)">
                                <span class="target-ico">🎯</span>
                                <span v-if="typeof stopwatch.targetSeconds === 'number' && stopwatch.targetSeconds > 0"
                                      class="target-text">
                                    {{ formatLapTime(stopwatch.targetSeconds) }}
                                </span>
                                <span v-else class="target-hint">Zielzeit setzen</span>
                            </button>
                        </div>
                    </div>

                    <div v-if="stopwatch.laps?.length" class="laps-wrap">
                        <div class="laps-card">
                            <div class="laps-head">
                                <div class="laps-title-row">
                                    <span class="laps-title">Runden</span>
                                    <span class="laps-count">({{ stopwatch.laps.length }})</span>
                                </div>

                                <KebabButton class="laps-kebab"
                                             title="Mehr"
                                             aria-label="Weitere Runden-Aktionen"
                                             @click.stop="openLapsMenu(stopwatch, $event)" />
                            </div>

                            <div class="laps-stats" aria-label="Runden Statistiken">
                                <div class="laps-marquee">
                                    <!-- 1. Laufband -->
                                    <div class="laps-marquee__inner">
                                        <span class="stat-item">Best: {{ formatLapTime(getLapStats(stopwatch).best) }}</span>
                                        <span class="stat-sep">|</span>
                                        <span class="stat-item">Worst: {{ formatLapTime(getLapStats(stopwatch).worst) }}</span>
                                        <span class="stat-sep">|</span>
                                        <span class="stat-item">Ø: {{ formatLapTime(getLapStats(stopwatch).avg) }}</span>

                                        <template v-if="typeof stopwatch.targetSeconds === 'number' && stopwatch.targetSeconds > 0">
                                            <span class="stat-sep">|</span>
                                            <span class="stat-item">Ziel: {{ formatLapTime(stopwatch.targetSeconds) }}</span>
                                        </template>

                                        <span class="stat-sep">|</span>
                                    </div>

                                    <!-- 2. Laufband (Kopie) -->
                                    <div class="laps-marquee__inner" aria-hidden="true">
                                        <span class="stat-item">Best: {{ formatLapTime(getLapStats(stopwatch).best) }}</span>
                                        <span class="stat-sep">|</span>
                                        <span class="stat-item">Worst: {{ formatLapTime(getLapStats(stopwatch).worst) }}</span>
                                        <span class="stat-sep">|</span>
                                        <span class="stat-item">Ø: {{ formatLapTime(getLapStats(stopwatch).avg) }}</span>

                                        <template v-if="typeof stopwatch.targetSeconds === 'number' && stopwatch.targetSeconds > 0">
                                            <span class="stat-sep">|</span>
                                            <span class="stat-item">Ziel: {{ formatLapTime(stopwatch.targetSeconds) }}</span>
                                        </template>

                                        <span class="stat-sep">|</span>
                                    </div>
                                </div>
                            </div>


                            <div v-if="(stopwatch.laps?.length || 0) > 1"
                                 class="laps-trend"
                                 aria-label="Runden Trend">
                                <span class="trend-label">Trend:</span>

                                <span class="trend-value"
                                      :class="getLapTrend(stopwatch).state === 'faster'
          ? 'is-faster'
          : (getLapTrend(stopwatch).state === 'slower' ? 'is-slower' : 'is-stable')">
                                    {{ getLapTrend(stopwatch).icon }}
                                    {{ getLapTrend(stopwatch).text }}
                                    <span class="trend-meta">
                                        (Ø {{ formatLapDelta(getLapTrend(stopwatch).avgDelta) }}, letzte {{ getLapTrend(stopwatch).window }})
                                    </span>
                                </span>
                            </div>

                            <div class="laps-list" role="list">
                                <div v-for="(lap, index) in (stopwatch.laps || [])"
                                     :key="index"
                                     class="lap-row"
                                     role="listitem"
                                     @dblclick.stop.prevent="openLapNameEdit(stopwatch.id, index)">
                                    <span class="lap-badge">
                                        <span v-if="isBestLap(stopwatch, index)" class="lap-ico" title="Schnellste Runde">🏆</span>
                                        <span v-else-if="isWorstLap(stopwatch, index)" class="lap-ico" title="Langsamste Runde">🐢</span>
                                        {{ getLapName(lap, index) }}
                                    </span>
                                    <span class="lap-right">
                                        <span class="lap-time">{{ formatLapTime(toLapObj(lap).time) }}</span>

                                        <span v-if="typeof stopwatch.targetSeconds === 'number' && stopwatch.targetSeconds > 0"
                                              class="lap-target"
                                              :class="isLapUnderTarget(stopwatch, toLapObj(lap).time) ? 'is-ok' : 'is-bad'">
                                            {{ isLapUnderTarget(stopwatch, toLapObj(lap).time) ? '✅' : '❌' }}
                                            <span v-if="!isLapUnderTarget(stopwatch, toLapObj(lap).time)">
                                                ({{ formatLapDelta(toLapObj(lap).time - stopwatch.targetSeconds) }})
                                            </span>
                                        </span>

                                        <span v-if="index > 0"
                                              class="lap-delta"
                                              :class="getLapDeltaSeconds(stopwatch, index) > 0 ? 'is-pos' : (getLapDeltaSeconds(stopwatch, index) < 0 ? 'is-neg' : '')">
                                            {{ formatLapDelta(getLapDeltaSeconds(stopwatch, index)) }}
                                        </span>
                                    </span>
                                </div>
                            </div>

                            <div class="laps-legend" aria-label="Runden Legende">
                                <span class="legend-item"><span class="legend-ico">🏆</span> Schnellste Runde</span>
                                <span class="legend-item"><span class="legend-ico">🐢</span> Langsamste Runde</span>
                            </div>

                        </div>
                    </div>
                </div>
            </template>
        </Draggable>

        <KebabMenu :open="showLapsMenu"
                   :anchorEl="lapsMenuAnchor"
                   :items="lapsMenuItems"
                   @close="closeLapsMenu"
                   @select="onLapsMenuSelect" />

        <ActionSelectPopup :show="showLapsPickPopup"
                           :title="lapsPickAction === 'copy' ? 'Runden kopieren' : (lapsPickAction === 'delete' ? 'Runden löschen' : 'Runden bearbeiten')"
                           :subtitle="lapsPickAction === 'copy'
        ? 'Setz Haken, was du kopieren willst'
        : (lapsPickAction === 'delete' ? 'Setz Haken, was gelöscht werden soll' : 'Wähl eine Runde aus')"
                           :helper="lapsPickAction === 'edit' ? 'Bearbeiten ist Single-Select.' : ''"
                           :rows="lapsPickRows"
                           :selectionMode="lapsPickAction === 'edit' ? 'single' : 'multi'"
                           :showAllOption="lapsPickAction !== 'edit'"
                           allLabel="Alle Runden"
                           v-model:allSelected="lapsPickAll"
                           v-model:selectedIds="lapsPickSelected"
                           cancelText="Abbrechen"
                           :confirmText="lapsPickAction === 'copy' ? 'Kopieren' : (lapsPickAction === 'delete' ? 'Löschen' : 'Weiter')"
                           :confirmDanger="lapsPickAction === 'delete'"
                           @cancel="closeLapsPickPopup"
                           @confirm="onLapsPickConfirm" />

        <!-- INSERT: LapMode Popup -->
        <ActionSelectPopup :show="showLapModePopup"
                           title="Rundenwertung"
                           subtitle="Wie soll die Bewertung laufen? (Best/Worst hängt vom Modus ab)"
                           :rows="lapModeRows"
                           selectionMode="single"
                           :showAllOption="false"
                           :allSelected="false"
                           v-model:selectedIds="lapModeSelected"
                           cancelText="Abbrechen"
                           confirmText="Speichern"
                           @cancel="closeLapModePopup"
                           @confirm="onLapModeConfirm" />

        <NamePromptPopup :show="showAddStopwatchPopup"
                         v-model="newStopwatchName"
                         title="Neue Stoppuhr hinzufügen"
                         placeholder="Stoppuhr Name (optional)"
                         overlayClass="stopwatch-popup"
                         @save="saveStopwatch"
                         @cancel="closeAddStopwatchPopup" />

        <EditPopup v-model="showNameEditPopup"
                   :key="`stopwatchName-${editingStopwatchId}`"
                   title="Stoppuhrname bearbeiten"
                   input-type="text"
                   placeholder="Neuer Stoppuhrname (max. 30 Zeichen)"
                   :value="editingStopwatchValue"
                   :options="[]"
                   @save="saveStopwatchName" />

        <EditPopup v-model="showLapNameEditPopup"
                   :key="`lapName-${editingLapStopwatchId}-${editingLapIndex}`"
                   title="Rundennamen bearbeiten"
                   input-type="text"
                   placeholder="Neuer Rundenname (max. 30 Zeichen)"
                   :value="editingLapValue"
                   :options="[]"
                   @save="saveLapName" />

        <EditPopup v-model="showTargetEditPopup"
                   :key="`target-${editingTargetStopwatchId}`"
                   title="Zielzeit setzen"
                   input-type="text"
                   placeholder="z.B. 12.00 oder 0:12.00 (leer = entfernen)"
                   v-model:value="editingTargetValue"
                   :options="[]"
                   :confirmText="targetConfirmText"
                   :confirmDanger="targetConfirmText === 'Entfernen'"
                   @save="saveTargetTime" />

        <DeleteConfirmPopup :show="showDeletePopup"
                            @confirm="confirmDelete"
                            @cancel="cancelDelete" />

    </div>
</template>

<script setup lang="ts">
    import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
    import Draggable from 'vuedraggable'
    import type { StopwatchInstance as StopwatchInstanceBase, LapEntry } from '@/types/stopwatch'
    import AddButton from '@/components/ui/buttons/AddButton.vue'
    import StartButton from '@/components/ui/buttons/glocks/StartButton.vue'
    import ResetControlButton from '@/components/ui/buttons/glocks/ResetControlButton.vue'
    import RoundButton from '@/components/ui/buttons/glocks/RoundButton.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import CloseButton from '@/components/ui/buttons/CloseButton.vue'
    import NamePromptPopup from '@/components/ui/popups/NamePromptPopup.vue'
    import EditPopup from '@/components/ui/popups/EditPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import KebabButton from '@/components/ui/buttons/KebabButton.vue'
    import KebabMenu, { type KebabMenuItem } from '@/components/ui/menu/KebabMenu.vue'
    import ActionSelectPopup, { type ActionSelectRow } from '@/components/ui/popups/ActionSelectPopup.vue'
    import { useStopwatchesStore, effectiveElapsedMs } from '@/store/stopwatchesStore'
    import { useAuthStore } from '@/store/authStore'

    type ToastKind = 'delete' | 'add' | 'save' | 'timer' | 'load'

    interface StopwatchInstance extends StopwatchInstanceBase {
        time: number
        isRunning: boolean
        interval: number | null
        isFavorite: boolean
        isVisible: boolean
        shouldStaySticky: boolean
        left?: number
        top?: number
        startedAtMs?: number
        offsetMs?: number
        lapMode?: 'min' | 'max' | 'const' | 'none'
        targetSeconds?: number
    }

    type LapsPickAction = 'copy' | 'delete' | 'edit'

    const props = defineProps<{
        dragDelay: number
        stickyEnabled?: boolean
        addToast: (message: string, type?: ToastKind) => void
    }>()

    const emit = defineEmits<{
        (e: 'validation', errors: string[]): void
    }>()

    const store = useStopwatchesStore()

    const auth = useAuthStore()
    const isGuest = computed(() => !auth.user)

    const LS_STOPWATCH_SINGLE_KEY = 'tyg.guest.stopwatch.single.v1'

    const makeDefaultGuestStopwatch = (): any => ({
        id: 'guest-stopwatch-1', // stabil
        name: 'Stoppuhr',
        sortIndex: 0,

        laps: [],
        startedAtMs: null,   // nie persist running
        offsetMs: 0,

        isVisible: true,
        shouldStaySticky: false,
        left: 0,
        top: 0,

        // meta, weil du das über metaById steuerst
        __meta: { isFavorite: false, lapMode: 'min', targetSeconds: undefined as number | undefined }
    })

    const pickPrimaryStopwatch = (list: any[]) => {
        if (!Array.isArray(list) || !list.length) return null
        const bySort = [...list].sort((a, b) => (a?.sortIndex ?? 9999) - (b?.sortIndex ?? 9999))
        return bySort[0] ?? list[0]
    }

    const loadGuestSingleStopwatch = () => {
        let parsed: any = null
        try {
            const raw = localStorage.getItem(LS_STOPWATCH_SINGLE_KEY)
            parsed = raw ? JSON.parse(raw) : null
        } catch { /* ignore */ }

        const def = makeDefaultGuestStopwatch()
        const base = parsed && typeof parsed === 'object'
            ? { ...def, ...parsed }
            : def

        // running-state immer killen
        base.startedAtMs = null
        base.id = 'guest-stopwatch-1'
        base.sortIndex = 0
        base.offsetMs = Number.isFinite(base.offsetMs) ? base.offsetMs : 0
        base.laps = Array.isArray(base.laps) ? base.laps : []

        // Guest: nach Refresh GENAU 1 Stoppuhr
        store.items = [base] as any

        // metaById aus stored meta setzen
        const m = base.__meta ?? def.__meta
        metaById.value = {
            [base.id]: {
                isFavorite: !!m.isFavorite,
                lapMode: (m.lapMode ?? 'min'),
                targetSeconds: (typeof m.targetSeconds === 'number' && m.targetSeconds > 0) ? m.targetSeconds : undefined
            }
        }
    }

    const persistGuestSingleStopwatch = () => {
        const primary = pickPrimaryStopwatch(store.items as any[])
        const def = makeDefaultGuestStopwatch()
        const base = primary ? { ...def, ...primary } : def

        // meta aus metaById übernehmen
        const meta = getMeta('guest-stopwatch-1')
        base.__meta = {
            isFavorite: !!meta.isFavorite,
            lapMode: (meta.lapMode ?? 'min'),
            targetSeconds: (typeof meta.targetSeconds === 'number' && meta.targetSeconds > 0) ? meta.targetSeconds : undefined
        }

        // running-state nie persistieren
        base.startedAtMs = null
        base.id = 'guest-stopwatch-1'
        base.sortIndex = 0

        // sanity
        base.offsetMs = Number.isFinite(base.offsetMs) ? base.offsetMs : 0
        base.laps = Array.isArray(base.laps) ? base.laps : []

        try {
            localStorage.setItem(LS_STOPWATCH_SINGLE_KEY, JSON.stringify(base))
        } catch { /* ignore */ }
    }

    type UiStopwatch = StopwatchInstanceBase & {
        time: number // seconds
        isRunning: boolean
        interval: number | null // legacy
        isFavorite: boolean
        lapMode?: 'min' | 'max' | 'const' | 'none'
        targetSeconds?: number
    }

    const metaById = ref<Record<string, Pick<UiStopwatch, 'isFavorite' | 'lapMode' | 'targetSeconds'>>>({})

    function getMeta(id: string) {
        if (!metaById.value[id]) {
            metaById.value[id] = { isFavorite: false, lapMode: 'min', targetSeconds: undefined }
        }
        return metaById.value[id]
    }

    watch(
        () => isGuest.value ? store.items : null,
        () => {
            if (!isGuest.value) return

            // wenn Guest irgendwie 0 hat -> sofort wieder default
            if (!store.items?.length) {
                loadGuestSingleStopwatch()
                persistGuestSingleStopwatch()
                return
            }

            // persistiert NUR die Primary Stoppuhr (Extras werden nicht gesichert)
            persistGuestSingleStopwatch()
        },
        { deep: true }
    )

    watch(
        () => isGuest.value ? metaById.value : null,
        () => {
            if (!isGuest.value) return
            persistGuestSingleStopwatch()
        },
        { deep: true }
    )

    watch(
        () => store.items.map(x => x.id),
        (ids) => {
            for (const id of ids) getMeta(id)
        },
        { immediate: true }
    )
    // Re-render-Tick für laufende Stoppuhren (damit Anzeige live läuft)
    const nowTick = ref(0)
    let tickTimer: number | null = null

    function readTiming(s: any) {
        const startedAtMs =
            typeof s.startedAtMs === 'number' ? s.startedAtMs :
                (typeof s.startedAt === 'number' ? s.startedAt :
                    (s.startedAt instanceof Date ? s.startedAt.getTime() :
                        (typeof s.startedAt === 'string' ? Date.parse(s.startedAt) : null)))

        const offsetMs =
            typeof s.offsetMs === 'number' ? s.offsetMs :
                (typeof s.elapsedMs === 'number' ? s.elapsedMs : 0)

        const isRunning = typeof startedAtMs === 'number' && Number.isFinite(startedAtMs) && startedAtMs > 0
        const elapsedMs = offsetMs + (isRunning ? (Date.now() - startedAtMs) : 0)

        return { startedAtMs, offsetMs, isRunning, elapsedMs }
    }

    const stopwatches = computed<UiStopwatch[]>(() => {
        void nowTick.value

        return store.items
            .slice()
            .sort((a, b) => {
                const af = getMeta(a.id).isFavorite ? 1 : 0
                const bf = getMeta(b.id).isFavorite ? 1 : 0
                if (af !== bf) return bf - af
                return (a.sortIndex ?? 0) - (b.sortIndex ?? 0)
            })
            .map((s: any) => {
                const meta = getMeta(s.id)
                const t = readTiming(s)

                return {
                    ...s,
                    time: t.elapsedMs / 1000,
                    isRunning: t.isRunning,
                    interval: null,
                    isFavorite: meta.isFavorite,
                    lapMode: meta.lapMode,
                    targetSeconds: meta.targetSeconds,
                }
            })
    })

    const showLapsMenu = ref(false)
    const lapsMenuAnchor = ref<HTMLElement | null>(null)
    const lapsMenuStopwatchId = ref<string | null>(null)
    const lapsPickStopwatchId = ref<string | null>(null)

    const lapsMenuItems = ref<KebabMenuItem[]>([
        { id: 'lap-mode', label: 'Rundenwertung', icon: '🎯' },
        { id: 'pick-copy', label: 'Runden kopieren', icon: '📋', hint: 'Auswahl' },
        { id: 'pick-edit', label: 'Rundennamen bearbeiten', icon: '✏️', hint: 'Auswahl' },
        { id: 'pick-delete', label: 'Runden löschen', icon: '🗑️', hint: 'Auswahl', danger: true }
    ])

    const showLapModePopup = ref(false)
    const lapModeRows = ref<ActionSelectRow[]>([])
    const lapModeSelected = ref<string[]>([])
    const lapModeStopwatchId = ref<string | null>(null)

    const showTargetEditPopup = ref(false)
    const editingTargetStopwatchId = ref<string | null>(null)
    const editingTargetValue = ref('')
    const editingTargetInitialValue = ref('')

    const openTargetTimeEdit = (swId: string) => {
        const sw = stopwatches.value.find(s => s.id === swId)
        if (!sw) return

        editingTargetStopwatchId.value = swId

        const t = getMeta(swId).targetSeconds
        const hasTarget = typeof t === 'number' && t > 0
        editingTargetValue.value = hasTarget ? String(t.toFixed(2)) : ''
        editingTargetInitialValue.value = editingTargetValue.value.trim()

        showTargetEditPopup.value = true
    }

    const targetConfirmText = computed(() => {
        const swId = editingTargetStopwatchId.value
        if (!swId) return 'Speichern'

        const meta = getMeta(swId)
        const hasTarget = typeof meta.targetSeconds === 'number' && meta.targetSeconds > 0
        if (!hasTarget) return 'Speichern'

        const curRaw = (editingTargetValue.value ?? '').trim()
        if (!curRaw) return 'Entfernen'

        const curSeconds = parseTargetSeconds(curRaw)
        if (curSeconds === null) return 'Speichern'

        const curFixed = Number(curSeconds.toFixed(2))
        const targetFixed = Number((meta.targetSeconds ?? 0).toFixed(2))

        return curFixed === targetFixed ? 'Entfernen' : 'Speichern'
    })

    const isDragging = ref(false)

    const highlightStopwatchId = ref<string | null>(null)

    const scrollToStopwatchCard = async (id: string) => {
        await nextTick()

        const el = document.querySelector(`[data-stopwatch-id="${id}"]`) as HTMLElement | null
        if (!el) return

        el.scrollIntoView({ behavior: 'smooth', block: 'center' })

        highlightStopwatchId.value = id
        window.setTimeout(() => {
            if (highlightStopwatchId.value === id) highlightStopwatchId.value = null
        }, 900)
    }
    const onDragStart = () => {
        isDragging.value = true
    }
    const onDragEnd = () => {
        isDragging.value = false
    }

    const parseTargetSeconds = (raw: string): number | null => {
        const s = (raw ?? '').trim()
        if (!s) return null

        // akzeptiert: "12.34" oder "0:12.34" oder "1:02.50"
        const m = s.match(/^(\d+):(\d{1,2})(?:\.(\d{1,2}))?$/)
        if (m) {
            const min = Number(m[1])
            const sec = Number(m[2])
            const frac = m[3] ? Number(m[3]) / (m[3].length === 1 ? 10 : 100) : 0
            if (!Number.isFinite(min) || !Number.isFinite(sec) || sec >= 60) return null
            return min * 60 + sec + frac
        }

        const n = Number(s.replace(',', '.'))
        if (!Number.isFinite(n) || n <= 0) return null
        return n
    }

    const saveTargetTime = (val: string) => {
        const swId = editingTargetStopwatchId.value
        if (!swId) { showTargetEditPopup.value = false; return }

        const meta = getMeta(swId)
        const hasTarget = typeof meta.targetSeconds === 'number' && meta.targetSeconds > 0
        const trimmed = (val ?? '').trim()
        const init = (editingTargetInitialValue.value ?? '').trim()

        if (hasTarget && init && trimmed === init) {
            meta.targetSeconds = undefined
            props.addToast('Zielzeit entfernt', 'save')
            showTargetEditPopup.value = false
            return
        }

        if (!trimmed) {
            if (hasTarget) {
                meta.targetSeconds = undefined
                props.addToast('Zielzeit entfernt', 'save')
            }
            showTargetEditPopup.value = false
            return
        }

        const seconds = parseTargetSeconds(trimmed)
        if (seconds === null) {
            emit('validation', ['Ungültige Zielzeit. Beispiel: 12.00 oder 0:12.00'])
            return
        }

        meta.targetSeconds = Number(seconds.toFixed(2))
        props.addToast(`Zielzeit gesetzt: ${formatLapTime(meta.targetSeconds)}`, 'save')
        showTargetEditPopup.value = false
    }

    const isLapUnderTarget = (sw: StopwatchInstance, lapSeconds: number) => {
        const t = sw.targetSeconds
        if (typeof t !== 'number' || t <= 0) return true
        return lapSeconds <= t
    }


    const showLapsPickPopup = ref(false)
    const lapsPickAction = ref<LapsPickAction>('copy')
    const lapsPickAll = ref(false)
    const lapsPickSelected = ref<string[]>([])
    const lapsPickRows = ref<ActionSelectRow[]>([])

    const showAddStopwatchPopup = ref(false)
    const newStopwatchName = ref('')

    const showNameEditPopup = ref(false)
    const editingStopwatchId = ref<string | null>(null)
    const editingStopwatchValue = ref('')
    const showLapNameEditPopup = ref(false)
    const editingLapIndex = ref<number | null>(null)
    const editingLapValue = ref('')
    const editingLapStopwatchId = ref<string | null>(null)

    const showDeletePopup = ref(false)
    const pendingDeleteId = ref<string | null>(null)

    const makeId = () => {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    }

    const validateStopwatchName = (name: string): string | false => {
        const trimmed = (name ?? '').trim()
        if (trimmed.length > 30) return false
        return trimmed || 'Stoppuhr'
    }

    const makeUniqueStopwatchName = (rawName: string, excludeId?: string): string => {
        const baseRaw = (rawName || '').trim()
        const base = baseRaw || 'Stoppuhr'

        const existing = new Set(
            stopwatches.value
                .filter(sw => !excludeId || sw.id !== excludeId)
                .map(sw => (sw.name || 'Stoppuhr').trim().toLowerCase())
        )

        if (!existing.has(base.toLowerCase())) return base

        let i = 2
        while (existing.has(`${base} (${i})`.toLowerCase())) i++
        return `${base} (${i})`
    }

    const makeUniqueLapName = (sw: StopwatchInstance, rawName: string, excludeIndex?: number) => {
        const baseRaw = (rawName || '').trim()
        const base = baseRaw || '' // leere Namen sind erlaubt → dann bleibt es leer

        // wenn leer: keine Uniqueness erzwingen, damit "Runde X" automatisch greift
        if (!base) return ''

        const existing = new Set(
            (sw.laps || [])
                .map((lap, i) => ({ i, n: (toLapObj(lap).name ?? '').trim().toLowerCase() }))
                .filter(x => excludeIndex === undefined || x.i !== excludeIndex)
                .map(x => x.n)
                .filter(Boolean)
        )

        if (!existing.has(base.toLowerCase())) return base

        let i = 1
        while (existing.has(`${base} (${i})`.toLowerCase())) i++
        return `${base} (${i})`
    }

    const formatStopwatchDisplay = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        const milliseconds = Math.floor((time % 1) * 100)
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`
    }

    const toLapObj = (lap: LapEntry) => {
        if (typeof lap === 'number') return { time: lap, name: '' }

        const o: any = lap

        // ✅ neues Format (seconds)
        if (typeof o.time === 'number') {
            return { time: o.time, name: String(o.name ?? o.label ?? '').trim() }
        }

        // ✅ legacy Format (ms)
        if (typeof o.ms === 'number') {
            return { time: o.ms / 1000, name: String(o.name ?? o.label ?? '').trim() }
        }

        // Fallback
        return { time: 0, name: String(o.name ?? o.label ?? '').trim() }
    }

    const getLapName = (lap: LapEntry, index: number) => {
        const n = toLapObj(lap).name.trim()
        return n || `Runde ${index + 1}`
    }

    const formatLapTime = (lapTime: number) => formatStopwatchDisplay(lapTime)

    const getLapDeltaSeconds = (sw: StopwatchInstance, idx: number) => {
        const laps = sw.laps || []
        if (idx <= 0 || idx >= laps.length) return 0
        const cur = toLapObj(laps[idx]).time
        const prev = toLapObj(laps[idx - 1]).time
        return cur - prev
    }

    const formatLapDelta = (deltaSeconds: number) => {
        const sign = deltaSeconds >= 0 ? '+' : '-'
        return `${sign}${Math.abs(deltaSeconds).toFixed(2)}s`
    }

    const TREND_WINDOW = 3
    const TREND_EPS = 0.01 // alles unter 0.01s ist praktisch "stabil"

    const getLapTrend = (sw: StopwatchInstance) => {
        const laps = sw.laps || []
        if (laps.length < 2) {
            return { state: 'stable' as const, icon: '➖', text: 'stabil', avgDelta: 0, window: 0 }
        }

        // Delta = aktuelle Lap-Dauer - vorherige Lap-Dauer
        const deltas: number[] = []
        for (let i = 1; i < laps.length; i++) {
            const cur = toLapObj(laps[i]).time
            const prev = toLapObj(laps[i - 1]).time
            deltas.push(cur - prev)
        }

        const window = Math.min(TREND_WINDOW, deltas.length)
        const last = deltas.slice(-window)
        const avgDelta = last.reduce((a, b) => a + b, 0) / window

        if (avgDelta < -TREND_EPS) {
            return { state: 'faster' as const, icon: '🔻', text: 'wird schneller', avgDelta, window }
        }
        if (avgDelta > TREND_EPS) {
            return { state: 'slower' as const, icon: '🔺', text: 'wird langsamer', avgDelta, window }
        }
        return { state: 'stable' as const, icon: '➖', text: 'stabil', avgDelta, window }
    }

    const getLapStats = (sw: StopwatchInstance) => {
        const laps = sw.laps || []
        if (!laps.length) return { best: 0, worst: 0, avg: 0 }

        const times = laps.map(l => toLapObj(l).time)
        const sum = times.reduce((a, b) => a + b, 0)
        const avg = sum / times.length

        const mode = sw.lapMode ?? 'min'

        if (mode === 'none') return { best: 0, worst: 0, avg }

        if (mode === 'const') {
            // "Best" = am nächsten am Durchschnitt, "Worst" = größte Abweichung
            let best = times[0]
            let worst = times[0]
            let bestDev = Math.abs(times[0] - avg)
            let worstDev = bestDev

            for (let i = 1; i < times.length; i++) {
                const dev = Math.abs(times[i] - avg)
                if (dev < bestDev) { bestDev = dev; best = times[i] }
                if (dev > worstDev) { worstDev = dev; worst = times[i] }
            }

            return { best, worst, avg }
        }

        // min/max
        let min = times[0]
        let max = times[0]
        for (let i = 1; i < times.length; i++) {
            const t = times[i]
            if (t < min) min = t
            if (t > max) max = t
        }

        // bei max ist "best" = max, "worst" = min
        return mode === 'max'
            ? { best: max, worst: min, avg }
            : { best: min, worst: max, avg }
    }

    // REPLACE: getLapExtremes(...)
    const getLapExtremes = (sw: StopwatchInstance) => {
        const laps = sw.laps || []
        if (!laps.length) return { bestIdx: -1, worstIdx: -1 }
        if (laps.length === 1) return { bestIdx: 0, worstIdx: -1 }

        const mode = sw.lapMode ?? 'min'
        if (mode === 'none') return { bestIdx: -1, worstIdx: -1 }

        const times = laps.map(l => toLapObj(l).time)
        const avg = times.reduce((a, b) => a + b, 0) / times.length

        let bestIdx = 0
        let worstIdx = 0

        if (mode === 'const') {
            let bestDev = Math.abs(times[0] - avg)
            let worstDev = bestDev

            for (let i = 1; i < times.length; i++) {
                const dev = Math.abs(times[i] - avg)
                if (dev < bestDev) { bestDev = dev; bestIdx = i }
                if (dev > worstDev) { worstDev = dev; worstIdx = i }
            }
        } else {
            // min/max
            let bestVal = times[0]
            let worstVal = times[0]

            for (let i = 1; i < times.length; i++) {
                const t = times[i]

                if (mode === 'max') {
                    if (t > bestVal) { bestVal = t; bestIdx = i }
                    if (t < worstVal) { worstVal = t; worstIdx = i }
                } else {
                    if (t < bestVal) { bestVal = t; bestIdx = i }
                    if (t > worstVal) { worstVal = t; worstIdx = i }
                }
            }
        }

        if (bestIdx === worstIdx) return { bestIdx, worstIdx: -1 }
        return { bestIdx, worstIdx }
    }

    const isBestLap = (sw: StopwatchInstance, idx: number) => getLapExtremes(sw).bestIdx === idx
    const isWorstLap = (sw: StopwatchInstance, idx: number) => getLapExtremes(sw).worstIdx === idx

    const openAddStopwatchPopup = () => {
        newStopwatchName.value = ''
        showAddStopwatchPopup.value = true
    }

    const closeAddStopwatchPopup = () => {
        showAddStopwatchPopup.value = false
        newStopwatchName.value = ''
    }

    const saveStopwatch = async () => {
        const validated = validateStopwatchName(newStopwatchName.value)
        if (validated === false) {
            emit('validation', ['Stoppuhr darf maximal 30 Zeichen lang sein'])
            return
        }

        const uniqueName = makeUniqueStopwatchName(validated)

        if (isGuest.value) {
            seedGuestStopwatch()

            const created: any = {
                id: makeId(),
                name: uniqueName,
                sortIndex: store.items.length,
                laps: [],
                startedAtMs: null,
                offsetMs: 0,
                isVisible: true,
                shouldStaySticky: false,
                left: 0,
                top: 0,
            }

            store.items = [created, ...(store.items as any)]
            getMeta(created.id)

            props.addToast('Stoppuhr hinzugefügt', 'add')
            closeAddStopwatchPopup()
            await scrollToStopwatchCard(created.id)
            return
        }

        try {
            const created = await store.create(uniqueName)
            getMeta(created.id)

            props.addToast('Stoppuhr hinzugefügt', 'add')
            closeAddStopwatchPopup()
            await scrollToStopwatchCard(created.id)
        } catch {
            emit('validation', ['Stoppuhr konnte nicht erstellt werden.'])
        }
    }

    function seedGuestStopwatch() {
        // Guest only
        if (!isGuest.value) return

        // Falls aus irgendeinem Grund leer: wieder Default rein + persist
        if (!store.items?.length) {
            loadGuestSingleStopwatch()
            persistGuestSingleStopwatch()
            return
        }

        // Meta sicherstellen (Favorites/LapMode/Target)
        for (const s of (store.items as any[])) {
            if (s?.id) getMeta(String(s.id))
        }
    }
    const toggleStopwatch = async (sw: UiStopwatch) => {
        if (isGuest.value) {
            const base: any = store.items.find((x: any) => x.id === sw.id)
            if (!base) return

            const now = Date.now()
            const running = typeof base.startedAtMs === 'number' && base.startedAtMs > 0

            if (running) {
                base.offsetMs = (base.offsetMs ?? 0) + (now - base.startedAtMs)
                base.startedAtMs = null
            } else {
                base.startedAtMs = now
                base.offsetMs = base.offsetMs ?? 0
            }

            store.items = [...(store.items as any)]
            return
        }

        try {
            const base: any = store.items.find((x: any) => x.id === sw.id)
            if (!base) return

            // ===== OPTIMISTIC UI (sofort, ohne Lag) =====
            const before = {
                startedAtMs: base.startedAtMs ?? null,
                startedAt: (base as any).startedAt ?? null,
                offsetMs: typeof base.offsetMs === 'number' ? base.offsetMs : (typeof base.elapsedMs === 'number' ? base.elapsedMs : 0),
            }

            const now = Date.now()
            const running = typeof base.startedAtMs === 'number' && base.startedAtMs > 0

            if (running) {
                // Pause sofort
                const t = readTiming(base)
                base.offsetMs = t.elapsedMs
                base.startedAtMs = null
                if ('startedAt' in base) (base as any).startedAt = null

                store.items = [...(store.items as any)]

                // Backend danach
                await store.stop(sw.id)
            } else {
                // Start sofort
                base.offsetMs = before.offsetMs
                base.startedAtMs = now
                if ('startedAt' in base) (base as any).startedAt = null

                store.items = [...(store.items as any)]

                // Backend danach
                await store.start(sw.id)
            }
        } catch (e) {
            // Rollback wenn Backend fails
            const base: any = store.items.find((x: any) => x.id === sw.id)
            if (base) {
                // best-effort rollback (wir haben oben before)
                // (Wenn du 100% willst: before außerhalb catch in ein const ziehen, aber reicht meist)
                // -> Minimal: reload vom backend
            }
            emit('validation', ['Stoppuhr konnte nicht aktualisiert werden.'])
            // optional: await store.load() um state zu syncen
        }
    }

    const resetStopwatch = async (sw: UiStopwatch) => {
        if (isGuest.value) {
            const base: any = store.items.find((x: any) => x.id === sw.id)
            if (!base) return

            base.startedAtMs = null
            base.offsetMs = 0
            base.laps = []
            store.items = [...(store.items as any)]

            props.addToast('Reset ✅', 'timer')
            return
        }

        const base: any = store.items.find((x: any) => x.id === sw.id)
        if (!base) return

        // UI sofort resetten (kein Lag + immer korrekt)
        base.startedAtMs = null
        if ('startedAt' in base) (base as any).startedAt = null
        base.offsetMs = 0
        if ('elapsedMs' in base) (base as any).elapsedMs = 0
        base.laps = []
        store.items = [...(store.items as any)]

        try {
            await store.reset(sw.id)
            props.addToast('Reset ✅', 'timer')
        } catch {
            emit('validation', ['Reset fehlgeschlagen.'])
            // optional: await store.load() um wieder zu syncen
        }
    }

    const toggleFavorite = (id: string) => {
        const meta = getMeta(id)
        meta.isFavorite = !meta.isFavorite

        props.addToast(
            meta.isFavorite ? 'Stoppuhr zu Favoriten hinzugefügt' : 'Stoppuhr aus Favoriten entfernt',
            meta.isFavorite ? 'add' : 'delete'
        )
    }

    const addLapTime = async (stopwatch: StopwatchInstance) => {
        if (!stopwatch.isRunning) return

        const base = store.items.find(x => x.id === stopwatch.id)
        if (!base) return

        // sicherstellen, dass laps im Store existiert (nicht nur in UI-Kopie)
        base.laps = base.laps ?? []

        // Lap-Dauer = aktuelle Gesamtzeit - Summe der bisherigen Lap-Dauern
        const elapsedByLaps = base.laps.reduce<number>((sum, lap) => sum + toLapObj(lap).time, 0)
        const lapDuration = Math.max(0, stopwatch.time - elapsedByLaps)

        base.laps.push({ time: lapDuration, name: '' })
        base.laps = [...base.laps]

        if (isGuest.value) {
            props.addToast('Runde aufgezeichnet', 'timer')
            return
        }

        try {
            await store.update(base.id, { laps: base.laps } as any)
            props.addToast('Runde aufgezeichnet', 'timer')
        } catch {
            emit('validation', ['Runde konnte nicht gespeichert werden.'])
        }
    }

    const openStopwatchNameEdit = (id: string) => {
        const sw = stopwatches.value.find(x => x.id === id)
        if (!sw) return
        editingStopwatchId.value = id
        editingStopwatchValue.value = sw.name || ''
        showNameEditPopup.value = true
    }

    const saveStopwatchName = async (val: string) => {
        const id = editingStopwatchId.value
        if (!id) { showNameEditPopup.value = false; return }

        const sw = stopwatches.value.find(x => x.id === id)
        if (!sw) { showNameEditPopup.value = false; return }

        const validated = validateStopwatchName(val)
        if (validated === false) {
            emit('validation', ['Stoppuhr darf maximal 30 Zeichen lang sein'])
            return
        }

        const nextName = makeUniqueStopwatchName(validated, sw.id)

        if (isGuest.value) {
            const base: any = store.items.find((x: any) => x.id === id)
            if (!base) { showNameEditPopup.value = false; return }

            base.name = nextName
            store.items = [...(store.items as any)]

            props.addToast('Stoppuhrname aktualisiert', 'timer')
            showNameEditPopup.value = false
            return
        }

        try {
            await store.update(id, { name: nextName })
            props.addToast('Stoppuhrname aktualisiert', 'timer')
            showNameEditPopup.value = false
        } catch {
            emit('validation', ['Name konnte nicht gespeichert werden.'])
        }
    }

    const saveLapName = (val: string) => {
        const swId = editingLapStopwatchId.value
        const idx = editingLapIndex.value
        if (!swId || idx === null) { showLapNameEditPopup.value = false; return }

        const base = store.items.find(x => x.id === swId)
        if (!base) { showLapNameEditPopup.value = false; return }

        const laps = base.laps ?? []
        if (idx < 0 || idx >= laps.length) { showLapNameEditPopup.value = false; return }

        const trimmed = (val ?? '').trim()
        if (trimmed.length > 30) {
            emit('validation', ['Rundenname darf maximal 30 Zeichen lang sein'])
            return
        }

        const uniqueName = makeUniqueLapName(base as any, trimmed, idx)

        const o = toLapObj(laps[idx])
        laps[idx] = { time: o.time, name: uniqueName }

        // reactivity + persist
        base.laps = [...laps]

        if (!isGuest.value) {
            store.update(swId, { laps: base.laps } as any).catch(() => {
                emit('validation', ['Rundenname konnte nicht gespeichert werden.'])
            })
        }

        props.addToast('Rundenname aktualisiert', 'save')
        showLapNameEditPopup.value = false
    }

    const openLapNameEdit = (swId: string, idx: number) => {
        const sw = stopwatches.value.find(s => s.id === swId)
        if (!sw) return

        const laps = sw.laps || []
        if (idx < 0 || idx >= laps.length) return

        editingLapStopwatchId.value = swId
        editingLapIndex.value = idx
        editingLapValue.value = toLapObj(laps[idx]).name ?? ''
        showLapNameEditPopup.value = true
    }

    const openLapsMenu = (stopwatch: StopwatchInstance, ev: MouseEvent) => {
        lapsMenuStopwatchId.value = stopwatch.id
        lapsMenuAnchor.value = (ev.currentTarget as HTMLElement) ?? null
        showLapsMenu.value = true
    }

    const closeLapsMenu = () => {
        showLapsMenu.value = false
        lapsMenuAnchor.value = null
    }
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            props.addToast('Kopiert ✅', 'save')
        } catch {
            emit('validation', ['Kopieren nicht möglich (Clipboard blockiert?)'])
        }
    }

    const onLapsMenuSelect = async (id: string) => {
        const swId = lapsMenuStopwatchId.value
        const sw = swId ? stopwatches.value.find(s => s.id === swId) : null
        if (!sw) return

        const laps = sw.laps || []

        if (id === 'lap-mode') {
            openLapModePopup(sw)
            return
        }

        if (id === 'pick-copy') {
            if (!laps.length) { props.addToast('Keine Runden vorhanden', 'timer'); return }
            openLapsPickPopup('copy', laps)
            return
        }

        if (id === 'pick-delete') {
            if (!laps.length) { props.addToast('Keine Runden vorhanden', 'timer'); return }
            openLapsPickPopup('delete', laps)
            return
        }

        if (id === 'pick-edit') {
            if (!laps.length) { props.addToast('Keine Runden vorhanden', 'timer'); return }
            openLapsPickPopup('edit', laps)
            return
        }
    }

    const requestDelete = (id: string) => {
        if (store.items.length <= 1) {
            emit('validation', ['Mindestens eine Stoppuhr muss bleiben'])
            return
        }
        pendingDeleteId.value = id
        showDeletePopup.value = true
    }

    const buildLapsPickRows = (laps: LapEntry[]) => {
        lapsPickRows.value = laps.map((lap, i) => {
            const o = toLapObj(lap)
            return {
                id: String(i),
                label: getLapName(lap, i),
                value: formatLapTime(o.time)
            }
        })
    }

    // INSERT: LapMode helpers
    const buildLapModeRows = () => {
        lapModeRows.value = [
            { id: 'min', label: 'Zeit minimieren', value: '🏁 kürzer = besser' },
            { id: 'max', label: 'Zeit maximieren', value: '🧱 länger = besser' },
            { id: 'const', label: 'Konstanz', value: '⚖️ gleichmäßig = besser' },
            { id: 'none', label: 'Neutral', value: '👻 keine Bewertung' }
        ]
    }

    const openLapModePopup = (sw: StopwatchInstance) => {
        lapModeStopwatchId.value = sw.id
        buildLapModeRows()
        lapModeSelected.value = [String(sw.lapMode ?? 'min')]
        showLapModePopup.value = true
    }

    const closeLapModePopup = () => {
        showLapModePopup.value = false
        lapModeRows.value = []
        lapModeSelected.value = []
        lapModeStopwatchId.value = null
    }

    const onLapModeConfirm = (payload: { all: boolean; ids: string[] }) => {
        const swId = lapModeStopwatchId.value
        if (!swId) return

        const picked = (payload.ids?.[0] ?? 'min') as StopwatchInstance['lapMode']
        getMeta(swId).lapMode = picked

        const label =
            picked === 'min' ? 'Zeit minimieren' :
                picked === 'max' ? 'Zeit maximieren' :
                    picked === 'const' ? 'Konstanz' :
                        'Neutral'

        props.addToast(`Rundenwertung: ${label}`, 'save')
        closeLapModePopup()
    }

    const openLapsPickPopup = (action: LapsPickAction, laps: LapEntry[]) => {
        buildLapsPickRows(laps)
        lapsPickAction.value = action
        lapsPickAll.value = false
        lapsPickSelected.value = []
        lapsPickStopwatchId.value = lapsMenuStopwatchId.value
        showLapsPickPopup.value = true
    }

    const closeLapsPickPopup = () => {
        showLapsPickPopup.value = false
        lapsPickAll.value = false
        lapsPickSelected.value = []
        lapsPickRows.value = []
        lapsPickStopwatchId.value = null
    }

    const normalizeIndices = (lapsLen: number, payload: { all: boolean; ids: string[] }) => {
        if (payload.all) return Array.from({ length: lapsLen }, (_, i) => i)
        return (payload.ids || [])
            .map(x => Number(x))
            .filter(n => Number.isFinite(n) && n >= 0 && n < lapsLen)
            .sort((a, b) => a - b)
    }

    const onLapsPickConfirm = async (payload: { all: boolean; ids: string[] }) => {
        const swId = lapsPickStopwatchId.value
        if (!swId) return

        const sw = swId ? stopwatches.value.find(s => s.id === swId) : null
        if (!sw) return

        const laps = sw.laps || []
        if (!laps.length) { props.addToast('Keine Runden vorhanden', 'timer'); closeLapsPickPopup(); return }

        const idx = normalizeIndices(laps.length, payload)
        if (!idx.length) { props.addToast('Nichts ausgewählt', 'timer'); return }

        // COPY
        if (lapsPickAction.value === 'copy') {
            const text = idx
                .map(i => `${getLapName(laps[i], i)}: ${formatLapTime(toLapObj(laps[i]).time)}`)
                .join('\n')
            await copyToClipboard(text)
            closeLapsPickPopup()
            return
        }

        // DELETE
        if (lapsPickAction.value === 'delete') {
            const base = store.items.find(x => x.id === swId)
            if (!base) return

            const kill = new Set(idx)
            base.laps = (base.laps ?? []).filter((_, i) => !kill.has(i))
            base.laps = [...base.laps]

            if (isGuest.value) {
                props.addToast('Runden gelöscht', 'delete')
                closeLapsPickPopup()
                return
            }

            await store.update(swId, { laps: base.laps } as any)

            props.addToast('Runden gelöscht', 'delete')
            closeLapsPickPopup()
            return
        }

        if (lapsPickAction.value === 'edit') {
            const picked = idx[0]
            editingLapStopwatchId.value = swId
            editingLapIndex.value = picked
            editingLapValue.value = toLapObj(laps[picked]).name ?? ''
            closeLapsPickPopup()
            showLapNameEditPopup.value = true
            return
        }
    }

    const cancelDelete = () => {
        showDeletePopup.value = false
        pendingDeleteId.value = null
    }

    const confirmDelete = async () => {
        const id = pendingDeleteId.value
        if (!id) { cancelDelete(); return }

        const sw = store.items.find(x => x.id === id)

        if (isGuest.value) {
            const base: any = store.items.find((x: any) => x.id === id)
            if (base && typeof base.startedAtMs === 'number' && base.startedAtMs > 0) {
                base.offsetMs = (base.offsetMs ?? 0) + (Date.now() - base.startedAtMs)
                base.startedAtMs = null
            }

            store.items = (store.items as any).filter((x: any) => x.id !== id)

            const { [id]: _, ...rest } = metaById.value
            metaById.value = rest

            if (!store.items.length) {
                loadGuestSingleStopwatch()
            }
            persistGuestSingleStopwatch()

            props.addToast('Stoppuhr gelöscht', 'delete')
            cancelDelete()
            return
        }
        try {
            if (sw?.isRunning) {
                await store.stop(id)
            }
            await store.remove(id)

            // lokale meta aufräumen (optional)
            const { [id]: _, ...rest } = metaById.value
            metaById.value = rest

            props.addToast('Stoppuhr gelöscht', 'delete')
        } catch (e: any) {
            // Backend kann "mindestens eine muss bleiben" schicken
            emit('validation', [e?.response?.data?.message ?? 'Löschen fehlgeschlagen.'])
        } finally {
            cancelDelete()
        }
    }

    const onDragUpdate = async (list: UiStopwatch[]) => {
        if (isGuest.value) {
            // list ist UI-sortiert → in store.items übernehmen + sortIndex neu setzen
            store.items = list.map((x, i) => ({ ...(x as any), sortIndex: i })) as any
            return
        }

        try {
            const orderedIds = list.map(x => x.id)
            await store.reorder(orderedIds)
        } catch {
            emit('validation', ['Reihenfolge konnte nicht gespeichert werden.'])
        }
    }
    onMounted(async () => {
        if (isGuest.value) {
            loadGuestSingleStopwatch()
            persistGuestSingleStopwatch()
        } else {
            try {
                await store.load()

                // Account: falls backend 0 liefert -> 1 erstellen
                if (!store.items.length) {
                    await store.create('Stoppuhr')
                    await store.load()
                }
            } catch {
                emit('validation', ['Stopuhren konnten nicht geladen werden (Backend/Auth?).'])
            }
        }

        tickTimer = window.setInterval(() => {
            if (isDragging.value) return
            nowTick.value++
        }, 100)
    })
    onBeforeUnmount(() => {
        if (tickTimer) window.clearInterval(tickTimer)
        tickTimer = null
    })

    watch(showLapNameEditPopup, (open) => {
        if (open) return
        editingLapStopwatchId.value = null
        editingLapIndex.value = null
        editingLapValue.value = ''
    })
</script>

<style scoped>
    /* Stoppuhr-Sektion – alles was vorher in Training.vue scoped war und hier gebraucht wird */

    .workout-list {
        margin-top: 0.5rem;
        width: 100%;
        max-width: var(--section-max);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 0.5rem;
        box-sizing: border-box;
        overflow-x: visible;
    }

    /* Container */
    .stopwatch-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        position: relative;
    }

    /* Header */
    .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        position: relative;
    }

    /* In deinem großen Styleblock war das so: zentrieren */
    .stopwatch-top .plan-header {
        justify-content: center;
    }

    /* Titel */
    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
        margin: 0;
    }

    /* Abstand Titel ↔ Plus Button */
    .plan-header.stopwatch-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        width: 100%;
        position: relative;
    }

    /* Draggable Stack */
    .drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

    .drag-ghost {
        opacity: 0.6;
    }

    /* Card */
    .timer-card {
        position: relative;
        padding: 1.6rem 1.8rem;
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        gap: 1.4rem;
        align-items: stretch;
        width: 100%;
        max-width: 1200px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    }

    @media (hover: hover) {
        .timer-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    html.dark-mode .timer-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Running Glow (greift jetzt dank :data-running) */
    .timer-card[data-running="true"] {
        border-color: rgba(96, 165, 250, 0.85);
        box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.65), 0 20px 46px rgba(15, 23, 42, 0.55);
        transform: translateY(-1px) scale(1.01);
    }

        .timer-card[data-running="true"] .timer-display {
            box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(96, 165, 250, 0.7), 0 0 24px rgba(96, 165, 250, 0.45);
            transform: scale(1.02);
        }

    html.dark-mode .timer-card[data-running="true"] {
        border-color: rgba(129, 140, 248, 0.95);
        box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.85), 0 24px 52px rgba(0, 0, 0, 0.9);
    }

        html.dark-mode .timer-card[data-running="true"] .timer-display {
            box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(129, 140, 248, 0.9), 0 0 26px rgba(129, 140, 248, 0.75);
        }

    /* Header innerhalb Card */
    .timer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .timer-actions {
        display: flex;
        gap: 0.5rem;
    }

    .timer-name {
        cursor: pointer;
        font-weight: 600;
        font-size: 1.2rem;
        text-align: left;
        pointer-events: auto;
    }

    /* Drag handle */
    .stopwatch-drag-handle {
        cursor: grab;
        user-select: none;
        margin-right: 0.5rem;
    }

    /* Mobile: Handles aus */
    @media (max-width: 560px) {
        .stopwatch-drag-handle {
            display: none;
        }
    }

    /* Controls */
    .timer-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        width: 100%;
    }

    .timer-display {
        font-size: 3rem;
        font-weight: 900;
        letter-spacing: 0.02em;
        color: var(--text-primary);
        width: 100%;
        max-width: 440px;
        text-align: center;
        font-family: 'Roboto Mono', monospace;
        padding: 0.95rem 1.15rem;
        border-radius: 18px;
        margin: 0 auto;
        /* gleiche "Materialwelt" wie .timer-card, nur kompakter/kontrastreicher */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58% ), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 62% ), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        border: 1px solid rgba(148, 163, 184, 0.14);
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    }


    html.dark-mode .timer-display {
        color: #ffffff;
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 58% ), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 12%, transparent), transparent 62% ), #020617;
        border-color: rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .timer-display:hover {
        transform: translateY(-1px) scale(1.01);
        border-color: rgba(148, 163, 184, 0.20);
        box-shadow: 0 20px 46px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .timer-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    /* Laps */
    /* ===== Laps (Runden) – Premium + centered ===== */
    .laps-wrap {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 1rem;
    }

    .laps-card {
        width: 100%;
        max-width: 520px;
        padding: 1rem 1rem;
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: radial-gradient(circle at 18% 22%, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 60%), radial-gradient(circle at 85% 78%, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 70%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
        /* NEW: Card bleibt stabil, Inhalt scrollt innen */
        display: flex;
        flex-direction: column;
        max-height: clamp(260px, 46vh, 520px);
        overflow: hidden;
    }

    html.dark-mode .laps-card {
        background: radial-gradient(circle at 18% 22%, color-mix(in srgb, #6366f1 14%, transparent), transparent 60%), radial-gradient(circle at 85% 78%, color-mix(in srgb, #22c55e 10%, transparent), transparent 70%), #020617;
        border-color: rgba(148, 163, 184, 0.28);
        box-shadow: 0 20px 50px rgba(0,0,0,.65);
    }

    .laps-head {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .75rem;
        margin-bottom: .75rem;
        text-align: center;
    }

    .laps-title {
        font-weight: 900;
        letter-spacing: -0.02em;
        color: var(--text-primary);
    }

    .laps-count {
        height: auto;
        min-width: 0;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        font-weight: 800;
        font-size: .9rem;
        letter-spacing: -0.01em;
        opacity: .75;
        color: var(--text-primary);
    }

    html.dark-mode .laps-count {
        color: rgba(255,255,255,.86);
    }

    .laps-list {
        display: flex;
        flex-direction: column;
        gap: .5rem;
        /* NEW: nur die Liste scrollt */
        overflow-y: auto;
        min-height: 0;
        padding-right: 6px;
    }

        /* Scrollbar nur für die Liste, damit's nicht ugly ist */
        .laps-list::-webkit-scrollbar {
            width: 10px;
        }

        .laps-list::-webkit-scrollbar-thumb {
            border-radius: 999px;
            border: 3px solid transparent;
            background-clip: padding-box;
            background: rgba(148, 163, 184, 0.35);
        }

    html.dark-mode .laps-list::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.25);
    }

    .lap-row {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: .75rem;
        padding: .65rem .75rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: color-mix(in srgb, var(--bg-card) 75%, transparent);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease;
    }

    @media (hover:hover) {
        .lap-row:hover {
            transform: translateY(-1px);
            border-color: color-mix(in srgb, var(--accent-primary) 35%, rgba(148,163,184,.18));
            box-shadow: 0 14px 30px rgba(15,23,42,.14), inset 0 1px 0 rgba(255,255,255,.06);
        }
    }

    .lap-badge {
        font-weight: 800;
        color: var(--text-primary);
        opacity: .92;
    }

    .lap-ico {
        display: inline-block;
        margin-right: .45rem;
        transform: translateY(-1px);
    }

    .laps-legend {
        display: flex;
        justify-content: center;
        gap: .9rem;
        margin-top: .75rem;
        padding-top: .65rem;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
        opacity: .85;
        font-weight: 700;
        font-size: .85rem;
        text-align: center;
        flex-wrap: wrap;
    }

    .legend-item {
        display: inline-flex;
        align-items: center;
        gap: .45rem;
    }

    .legend-ico {
        display: inline-block;
        transform: translateY(-1px);
    }

    .lap-time {
        font-family: 'Roboto Mono', monospace;
        font-weight: 900;
        letter-spacing: 0.02em;
        color: var(--text-primary);
        justify-self: end;
        padding: .35rem .55rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 88%, #020617 12%);
    }

    html.dark-mode .lap-row {
        background: rgba(2,6,23,.45);
        border-color: rgba(148,163,184,.20);
    }

    html.dark-mode .lap-time {
        background: rgba(2,6,23,.58);
        border-color: rgba(148,163,184,.18);
    }

    .laps-title-row {
        display: inline-flex;
        align-items: baseline;
        gap: .5rem;
        justify-content: center;
        width: 100%;
    }

    .stopwatch-top .drag-stack {
        margin-top: 0.75rem;
    }

    .laps-stats {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: .55rem;
        margin: -.15rem 0 .75rem;
        opacity: .82;
        font-weight: 800;
        font-size: .85rem;
        text-align: center;
        flex-wrap: wrap;
    }

    .stat-item {
        white-space: nowrap;
    }

    .stat-sep {
        opacity: .55;
    }

    .lap-right {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: .5rem;
    }

    .lap-delta {
        font-size: .72rem;
        line-height: 1;
        transform: translateY(1px);
    }

        .lap-delta.is-neg {
            color: color-mix(in srgb, var(--accent-secondary) 70%, var(--text-primary));
        }

        .lap-delta.is-pos {
            color: color-mix(in srgb, var(--accent-primary) 70%, var(--text-primary));
        }

    .laps-trend {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: .5rem;
        margin: -.35rem 0 .75rem;
        font-weight: 800;
        font-size: .85rem;
        opacity: .9;
        text-align: center;
        flex-wrap: wrap;
    }

    .stopwatch-scroll-highlight {
        outline: 2px solid color-mix(in srgb, var(--accent-primary) 60%, transparent);
        outline-offset: 6px;
        border-radius: 18px;
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent-primary) 12%, transparent);
        transition: outline-color .18s ease, box-shadow .18s ease;
    }
    .trend-label {
        opacity: .75;
        white-space: nowrap;
    }

    .trend-value {
        display: inline-flex;
        align-items: center;
        gap: .45rem;
        white-space: nowrap;
    }

    .trend-meta {
        opacity: .7;
        font-weight: 800;
        font-size: .8rem;
    }

    .trend-value.is-faster {
        color: color-mix(in srgb, var(--accent-secondary) 70%, var(--text-primary));
    }

    .trend-value.is-slower {
        color: color-mix(in srgb, var(--accent-primary) 70%, var(--text-primary));
    }

    .trend-value.is-stable {
        opacity: .9;
    }

    .target-chip {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        height: 34px;
        padding: 0 .55rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: color-mix(in srgb, var(--bg-card) 70%, transparent);
        font-weight: 900;
        font-size: .85rem;
        line-height: 1;
        color: var(--text-primary);
        opacity: .75;
        cursor: pointer;
        user-select: none;
        transition: transform .15s ease, opacity .15s ease, border-color .15s ease, box-shadow .15s ease;
    }

        .target-chip:hover {
            opacity: .95;
            transform: translateY(-1px);
            border-color: rgba(148, 163, 184, 0.32);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
        }

        .target-chip.is-set {
            opacity: 1;
            border-color: color-mix(in srgb, var(--accent-primary) 38%, rgba(148, 163, 184, 0.22));
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
        }

    .target-ico {
        transform: translateY(1px);
    }

    .target-text {
        font-family: 'Roboto Mono', monospace;
        letter-spacing: 0.02em;
    }


    .lap-target {
        font-size: .72rem;
        line-height: 1;
        transform: translateY(1px);
        font-weight: 900;
        opacity: .95;
    }

        .lap-target.is-ok {
            color: color-mix(in srgb, var(--accent-secondary) 70%, var(--text-primary));
        }

        .lap-target.is-bad {
            color: color-mix(in srgb, var(--accent-primary) 70%, var(--text-primary));
        }

    .target-row {
        display: flex;
        justify-content: center;
        margin-top: .45rem;
    }

    /* ===== Mobile Ticker for laps stats ===== */
    .laps-stats__track {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .55rem;
        flex-wrap: wrap; /* default wie vorher */
    }

    /* Wenn schmal: eine Zeile + scroll */
    @media (max-width: 510px) {
        .laps-stats {
            justify-content: flex-start;
            width: 100%;
            overflow: hidden;
            position: relative;
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
        }

        .laps-stats__track {
            flex-wrap: nowrap;
            white-space: nowrap;
            width: max-content; /* <-- wichtig: scrollWidth wird “real” */
            will-change: transform;
            padding-inline: 12px;
            transform: translateX(0);
        }

        /* nur wenn overflow wirklich da ist */
        .laps-stats__track {
            animation: lapsStatsMarquee 14s linear infinite;
        }
    }

    @keyframes lapsStatsMarquee {
        from {
            transform: translateX(0);
        }

        to {
            transform: translateX(calc(var(--marquee-shift, 0px) * -1));
        }
    }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .laps-stats__track {
            animation: none !important;
            transform: none !important;
        }
    }

    /* ===== Marquee: immer laufen lassen (mobile only) ===== */
    @media (max-width: 510px) {
        .laps-stats {
            justify-content: flex-start;
            width: 100%;
            overflow: hidden;
            flex-wrap: nowrap; /* <-- NEU */
            min-width: 0; /* <-- NEU (verhindert komische flex overflow bugs) */
            position: relative;
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
            mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
        }

        .laps-marquee {
            animation: lapsMarqueeLoop 18s linear infinite;
        }
    }

    .laps-marquee {
        display: flex;
        width: max-content;
        flex-wrap: nowrap;
        will-change: transform;
    }

    .laps-marquee__inner {
        display: inline-flex;
        align-items: center;
        gap: .55rem;
        white-space: nowrap;
        flex-wrap: nowrap;
        padding-inline: 12px;
    }

    @keyframes lapsMarqueeLoop {
        from {
            transform: translateX(0);
        }

        to {
            transform: translateX(-50%);
        }
    }

    /* Hide 2nd marquee copy on desktop (only needed for the loop on small screens) */
    .laps-marquee__inner[aria-hidden="true"] {
        display: none;
    }

    @media (max-width: 510px) {
        .laps-marquee__inner[aria-hidden="true"] {
            display: inline-flex;
        }
    }
</style>
