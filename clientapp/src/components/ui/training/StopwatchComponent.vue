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
                   :class="{ 'drag-stack--sorting': isDragging }"
                   @update:modelValue="onDragUpdate">
            <template #item="{ element: stopwatch }">
                <div class="timer-card"
                     :class="{
                         'stopwatch-scroll-highlight': highlightStopwatchId === stopwatch.id,
                         'timer-card--new': revealedStopwatchId === stopwatch.id,
                         'timer-card--rename-forge': renameForgeStopwatchId === stopwatch.id,
                         'timer-card--delete-pulse': deleteCardStopwatchId === stopwatch.id,
                         'timer-card--action-pulse': actionCardState.id === stopwatch.id,
                         'timer-card--favorite': stopwatch.isFavorite,
                         'timer-card--favorite-transfer': favoriteTransfer.id === stopwatch.id,
                         'timer-card--favorite-transfer-in': favoriteTransfer.id === stopwatch.id && favoriteTransfer.direction === 'to-favorite',
                         'timer-card--favorite-transfer-out': favoriteTransfer.id === stopwatch.id && favoriteTransfer.direction === 'from-favorite'
                     }"
                     :data-running="stopwatch.isRunning"
                     :key="stopwatch.id"
                     :data-stopwatch-id="stopwatch.id"
                     data-type="stopwatch">
                    <span v-if="deleteCardStopwatchId === stopwatch.id" class="delete-card-sanctified-label" aria-hidden="true">Gelöscht!</span>
                    <div class="timer-header">
                        <span v-if="favoriteTransfer.id === stopwatch.id && favoriteTransfer.direction"
                              class="favorite-sanctified-label"
                              :class="{ 'favorite-sanctified-label--removed': favoriteTransfer.direction === 'from-favorite' }"
                              aria-hidden="true">{{ favoriteTransfer.direction === 'to-favorite' ? 'Favorisiert!' : 'Entfernt!' }}</span>
                        <span class="stopwatch-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                        <span class="timer-name"
                              :class="{ 'timer-name--rename-forge': renameForgeStopwatchId === stopwatch.id && !!renameForgePayload }"
                              @click.stop="openStopwatchNameEdit(stopwatch.id)">
                            <span class="timer-name__live">{{ stopwatch.name || 'Stoppuhr' }}</span>
                            <span v-if="renameForgeStopwatchId === stopwatch.id && renameForgePayload"
                                  class="timer-name-rename-overlay"
                                  aria-hidden="true">
                                <span class="timer-name-rename-overlay__old">{{ renameForgePayload.oldName }}</span>
                                <span class="timer-name-rename-overlay__handwrite">{{ renameForgePayload.newName }}</span>
                                <span class="timer-name-rename-overlay__final">{{ renameForgePayload.newName }}</span>
                            </span>
                        </span>

                        <div class="timer-actions">
                            <FavoriteButton :active="stopwatch.isFavorite"
                                            :titleActive="'Aus Favoriten entfernen'"
                                            :titleInactive="'Zu Favoriten hinzufügen'"
                                            @toggle="toggleFavorite(stopwatch.id)" />

                            <CloseButton title="Stoppuhr löschen"
                                         variant="stopwatch"
                                         @click="requestDelete(stopwatch, $event)" />
                        </div>
                    </div>

                    <div class="timer-controls">
                        <span v-if="actionCardState.id === stopwatch.id"
                              :key="`action-${actionCardState.id}-${actionCardState.seq}`"
                              class="action-card-label"
                              :class="`action-card-label--${actionCardState.tone}`"
                              aria-hidden="true">{{ actionCardState.label }}</span>
                        <span class="timer-display" :class="[displayMotionClass(stopwatch.id), { 'is-lap-stamp': lapStampId === stopwatch.id }]">
                            <span class="timer-display__head">{{ formatStopwatchDisplayHead(stopwatch.time) }}</span>
                            <Transition name="digit-roll" mode="out-in">
                                <span :key="formatStopwatchDisplaySeconds(stopwatch.time)" class="timer-display__tail">{{ formatStopwatchDisplaySeconds(stopwatch.time) }}</span>
                            </Transition>
                            <span class="timer-display__fraction">.{{ formatStopwatchDisplayFraction(stopwatch.time) }}</span>
                        </span>

                        <div class="timer-buttons">
                            <StartButton :title="stopwatch.isRunning ? 'Pause' : 'Start'"
                                         @click="handleToggleStopwatch(stopwatch)">
                                {{ stopwatch.isRunning ? 'Pause' : 'Start' }}
                            </StartButton>

                            <ResetControlButton title="Reset" @click="handleResetStopwatch(stopwatch)" />

                            <RoundButton title="Runde"
                                         :disabled="!stopwatch.isRunning"
                                         @click="handleAddLapTime(stopwatch)" />
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
                                    <span class="laps-count" :class="{ 'is-pulsing': lapCountPulseId === stopwatch.id }">({{ stopwatch.laps.length }})</span>
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

                            <TransitionGroup name="lap-row-reveal" tag="div" class="laps-list" role="list">
                                <div v-for="(lap, index) in (stopwatch.laps || [])"
                                     :key="`${index}-${getLapName(lap, index)}-${toLapObj(lap).time}`"
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
                            </TransitionGroup>

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

        <Transition name="delete-trash">
            <div v-if="deleteTrashState.visible" class="delete-trash-overlay" aria-hidden="true">
                <div v-if="deleteTrashChips.length" class="delete-trash-stack" :style="deleteTrashFlightStyle">
                    <span class="delete-trash-flight__badge">Gelöscht!</span>
                    <span v-for="(chip, index) in deleteTrashChips" :key="`${chip}-${index}`" class="delete-trash-chip">{{ chip }}</span>
                </div>
                <div v-else-if="deleteTrashState.itemName" class="delete-trash-flight" :style="deleteTrashFlightStyle">
                    <span class="delete-trash-flight__badge">Gelöscht!</span>
                    <span class="delete-trash-flight__title">{{ deleteTrashState.itemName }}</span>
                </div>
                <div class="delete-trash-bin">
                    <div class="delete-trash-bin__lid"></div>
                    <div class="delete-trash-bin__body"></div>
                </div>
            </div>
        </Transition>

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
    const revealedStopwatchId = ref<string | null>(null)

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

    const revealStopwatchCard = (id: string) => {
        revealedStopwatchId.value = id
        window.setTimeout(() => {
            if (revealedStopwatchId.value === id) revealedStopwatchId.value = null
        }, 860)
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
    const renameForgeStopwatchId = ref<string | null>(null)
    const renameForgePayload = ref<{ oldName: string; newName: string } | null>(null)
    let renameForgeTimer: ReturnType<typeof setTimeout> | null = null
    const showLapNameEditPopup = ref(false)
    const editingLapIndex = ref<number | null>(null)
    const editingLapValue = ref('')
    const editingLapStopwatchId = ref<string | null>(null)

    const showDeletePopup = ref(false)
    const pendingDeleteId = ref<string | null>(null)
    const pendingDeleteEvent = ref<MouseEvent | null>(null)
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
    const deleteCardStopwatchId = ref<string | null>(null)
    const displayMotionById = ref<Record<string, 'starting' | 'pausing' | 'resuming' | 'resetting' | null>>({})
    const displayMotionTimers = new Map<string, ReturnType<typeof setTimeout>>()
    const lapCountPulseId = ref<string | null>(null)
    let lapCountPulseTimer: ReturnType<typeof setTimeout> | null = null
    const lapStampId = ref<string | null>(null)
    let lapStampTimer: ReturnType<typeof setTimeout> | null = null
    const favoriteTransfer = ref<{ id: string | null; direction: 'to-favorite' | 'from-favorite' | null }>({ id: null, direction: null })
    let favoriteTransferTimer: ReturnType<typeof setTimeout> | null = null
    const actionCardState = ref<{ id: string | null; label: string; tone: 'start' | 'pause' | 'reset' | 'lap' | null; seq: number }>({ id: null, label: '', tone: null, seq: 0 })
    let actionCardTimer: ReturnType<typeof setTimeout> | null = null

    const makeId = () => {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    }

    const validateStopwatchName = (name: string): string | false => {
        const trimmed = (name ?? '').trim()
        if (trimmed.length > 30) return false
        return trimmed || 'Stoppuhr'
    }

    const clearRenameForge = () => {
        if (renameForgeTimer) {
            clearTimeout(renameForgeTimer)
            renameForgeTimer = null
        }
        renameForgeStopwatchId.value = null
        renameForgePayload.value = null
    }

    const triggerRenameForge = async (id: string, oldName: string, newName: string) => {
        if (!id || !oldName || !newName || oldName === newName) return
        clearRenameForge()
        renameForgeStopwatchId.value = id
        renameForgePayload.value = { oldName, newName }
        await nextTick()
        renameForgeTimer = setTimeout(() => {
            renameForgeStopwatchId.value = null
            renameForgePayload.value = null
            renameForgeTimer = null
        }, 1650)
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

    const formatStopwatchDisplayHead = (time: number) => {
        const minutes = Math.floor(time / 60)
        return `${minutes}:`
    }

    const formatStopwatchDisplaySeconds = (time: number) => {
        const seconds = Math.max(0, Math.floor(time % 60))
        return seconds.toString().padStart(2, '0')
    }

    const formatStopwatchDisplayFraction = (time: number) => {
        const milliseconds = Math.max(0, Math.floor((time % 1) * 100))
        return milliseconds.toString().padStart(2, '0')
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
            revealStopwatchCard(created.id)
            await scrollToStopwatchCard(created.id)
            return
        }

        try {
            const created = await store.create(uniqueName)
            getMeta(created.id)

            props.addToast('Stoppuhr hinzugefügt', 'add')
            closeAddStopwatchPopup()
            revealStopwatchCard(created.id)
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
                base.isRunning = false
                base.elapsedMs = base.offsetMs
                if ('startedAtUtc' in base) (base as any).startedAtUtc = null
            } else {
                base.startedAtMs = now
                base.offsetMs = base.offsetMs ?? 0
                base.isRunning = true
                base.elapsedMs = base.offsetMs
                if ('startedAtUtc' in base) (base as any).startedAtUtc = new Date(now).toISOString()
                base.shouldStaySticky = true
                if (base.left == null) base.left = 20
                if (base.top == null) base.top = 140
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
                base.elapsedMs = t.elapsedMs
                base.startedAtMs = null
                base.isRunning = false
                if ('startedAt' in base) (base as any).startedAt = null
                if ('startedAtUtc' in base) (base as any).startedAtUtc = null

                store.items = [...(store.items as any)]

                // Backend danach
                await store.stop(sw.id)
            } else {
                // Start sofort
                base.offsetMs = before.offsetMs
                base.elapsedMs = before.offsetMs
                base.startedAtMs = now
                base.isRunning = true
                if ('startedAt' in base) (base as any).startedAt = null
                if ('startedAtUtc' in base) (base as any).startedAtUtc = new Date(now).toISOString()
                base.shouldStaySticky = true
                if (base.left == null) base.left = 20
                if (base.top == null) base.top = 140

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
        base.shouldStaySticky = false
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
        const nextFav = !meta.isFavorite
        if (favoriteTransferTimer) clearTimeout(favoriteTransferTimer)
        favoriteTransfer.value = { id, direction: nextFav ? 'to-favorite' : 'from-favorite' }
        favoriteTransferTimer = setTimeout(() => {
            favoriteTransfer.value = { id: null, direction: null }
            favoriteTransferTimer = null
        }, 920)
        const applyToggle = () => {
            meta.isFavorite = !meta.isFavorite

            props.addToast(
                meta.isFavorite ? 'Stoppuhr zu Favoriten hinzugefügt' : 'Stoppuhr aus Favoriten entfernt',
                meta.isFavorite ? 'add' : 'delete'
            )
        }

        if (nextFav) {
            applyToggle()
            return
        }

        setTimeout(applyToggle, 280)
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
        triggerLapCountPulse(stopwatch.id)

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
        const oldName = (sw.name || 'Stoppuhr').trim()

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
            void triggerRenameForge(id, oldName, nextName)
            showNameEditPopup.value = false
            return
        }

        try {
            await store.update(id, { name: nextName })
            props.addToast('Stoppuhrname aktualisiert', 'timer')
            void triggerRenameForge(id, oldName, nextName)
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

    const deleteTrashFlightStyle = computed(() => ({
        left: `${deleteTrashState.value.startX}px`,
        top: `${deleteTrashState.value.startY}px`,
        '--delete-fly-x': `${deleteTrashState.value.deltaX}px`,
        '--delete-fly-y': `${deleteTrashState.value.deltaY}px`,
    }))

    const clearDisplayMotion = (id: string) => {
        const timeout = displayMotionTimers.get(id)
        if (timeout) {
            clearTimeout(timeout)
            displayMotionTimers.delete(id)
        }
        delete displayMotionById.value[id]
        displayMotionById.value = { ...displayMotionById.value }
    }

    const triggerDisplayMotion = (id: string, motion: 'starting' | 'pausing' | 'resuming' | 'resetting') => {
        clearDisplayMotion(id)
        displayMotionById.value = {
            ...displayMotionById.value,
            [id]: motion,
        }
        displayMotionTimers.set(id, setTimeout(() => {
            clearDisplayMotion(id)
        }, motion === 'pausing' ? 420 : motion === 'resetting' ? 560 : 620))
    }

    const displayMotionClass = (id: string) => {
        const motion = displayMotionById.value[id]
        return motion ? `is-${motion}` : ''
    }

    const triggerActionCardLabel = (id: string, label: string, tone: 'start' | 'pause' | 'reset' | 'lap') => {
        if (actionCardTimer) clearTimeout(actionCardTimer)
        actionCardState.value = { id, label, tone, seq: actionCardState.value.seq + 1 }
        actionCardTimer = setTimeout(() => {
            actionCardState.value = { id: null, label: '', tone: null, seq: actionCardState.value.seq }
            actionCardTimer = null
        }, 880)
    }

    const handleToggleStopwatch = (sw: UiStopwatch) => {
        const motion = sw.isRunning ? 'pausing' : (sw.time > 0 ? 'resuming' : 'starting')
        triggerDisplayMotion(sw.id, motion)
        triggerActionCardLabel(sw.id, sw.isRunning ? 'Pause' : 'Start', sw.isRunning ? 'pause' : 'start')
        toggleStopwatch(sw)
    }

    const handleResetStopwatch = (sw: UiStopwatch) => {
        triggerDisplayMotion(sw.id, 'resetting')
        triggerActionCardLabel(sw.id, 'Reset', 'reset')
        resetStopwatch(sw)
    }

    const handleAddLapTime = (stopwatch: StopwatchInstance) => {
        if (lapStampTimer) {
            clearTimeout(lapStampTimer)
            lapStampTimer = null
        }
        lapStampId.value = stopwatch.id
        lapStampTimer = setTimeout(() => {
            lapStampId.value = null
            lapStampTimer = null
        }, 360)
        triggerActionCardLabel(stopwatch.id, 'Runde', 'lap')
        addLapTime(stopwatch)
    }

    const triggerLapCountPulse = (id: string) => {
        if (lapCountPulseTimer) {
            clearTimeout(lapCountPulseTimer)
            lapCountPulseTimer = null
        }
        lapCountPulseId.value = id
        lapCountPulseTimer = setTimeout(() => {
            lapCountPulseId.value = null
            lapCountPulseTimer = null
        }, 520)
    }

    const clearDeleteTrashTimer = () => {
        if (deleteTrashTimer) {
            clearTimeout(deleteTrashTimer)
            deleteTrashTimer = null
        }
    }

    const hideDeleteTrash = () => {
        clearDeleteTrashTimer()
        deleteCardStopwatchId.value = null
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

    const launchDeleteTrash = (chips: string[], event?: MouseEvent, onDone?: () => void) => {
        clearDeleteTrashTimer()
        const fallbackX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0
        const fallbackY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
        const startX = event?.clientX ?? fallbackX
        const startY = event?.clientY ?? Math.max(140, fallbackY - 40)
        const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : startX
        const targetY = typeof window !== 'undefined' ? window.innerHeight - 84 : startY

        deleteTrashChips.value = chips.slice(0, 6)
        deleteTrashState.value = {
            visible: true,
            itemName: '',
            startX,
            startY,
            deltaX: targetX - startX,
            deltaY: targetY - startY,
        }

        deleteTrashTimer = setTimeout(() => {
            hideDeleteTrash()
            onDone?.()
        }, 860)
    }

    const lapDeleteChipLabel = (lap: LapEntry, index: number) => `${getLapName(lap, index)} · ${formatLapTime(toLapObj(lap).time)}`

    const requestDelete = (stopwatch: UiStopwatch, event?: MouseEvent) => {
        if (store.items.length <= 1) {
            emit('validation', ['Mindestens eine Stoppuhr muss bleiben'])
            return
        }
        pendingDeleteId.value = stopwatch.id
        pendingDeleteEvent.value = event ?? null
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

            const chips = idx.map(i => lapDeleteChipLabel(laps[i], i))
            const kill = new Set(idx)
            closeLapsPickPopup()
            launchDeleteTrash(chips, undefined, async () => {
                base.laps = (base.laps ?? []).filter((_, i) => !kill.has(i))
                base.laps = [...base.laps]

                if (isGuest.value) {
                    props.addToast('Runden gelöscht', 'delete')
                    return
                }

                await store.update(swId, { laps: base.laps } as any)
                props.addToast('Runden gelöscht', 'delete')
            })
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
        pendingDeleteEvent.value = null
    }

    const confirmDelete = async () => {
        const id = pendingDeleteId.value
        if (!id) { cancelDelete(); return }

        const sw = store.items.find(x => x.id === id)
        clearDeleteTrashTimer()

        const fallbackX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0
        const fallbackY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
        const startX = pendingDeleteEvent.value?.clientX ?? fallbackX
        const startY = pendingDeleteEvent.value?.clientY ?? Math.max(140, fallbackY - 40)
        const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : startX
        const targetY = typeof window !== 'undefined' ? window.innerHeight - 84 : startY

        deleteCardStopwatchId.value = id
        deleteTrashState.value = {
            visible: true,
            itemName: sw?.name || 'Stoppuhr',
            startX,
            startY,
            deltaX: targetX - startX,
            deltaY: targetY - startY,
        }

        if (isGuest.value) {
            deleteTrashTimer = setTimeout(() => {
                hideDeleteTrash()
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
            }, 860)
            cancelDelete()
            return
        }
        try {
            deleteTrashTimer = setTimeout(() => {
                hideDeleteTrash()
                void (async () => {
                    if (sw?.isRunning) {
                        await store.stop(id)
                    }
                    await store.remove(id)

                    const { [id]: _, ...rest } = metaById.value
                    metaById.value = rest

                    props.addToast('Stoppuhr gelöscht', 'delete')
                })()
            }, 860)
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
        clearDeleteTrashTimer()
        if (lapCountPulseTimer) clearTimeout(lapCountPulseTimer)
        if (lapStampTimer) clearTimeout(lapStampTimer)
        if (favoriteTransferTimer) clearTimeout(favoriteTransferTimer)
        if (actionCardTimer) clearTimeout(actionCardTimer)
        displayMotionTimers.forEach((timeout) => clearTimeout(timeout))
        displayMotionTimers.clear()
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

    .delete-trash-overlay {
        position: fixed;
        inset: 0;
        z-index: 1300;
        pointer-events: none;
    }

    .delete-trash-flight {
        position: fixed;
        min-width: 180px;
        max-width: min(280px, calc(100vw - 2rem));
        padding: .8rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(239, 68, 68, 0.24);
        background: radial-gradient(circle at top left, color-mix(in srgb, #ef4444 12%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, white 6%);
        box-shadow: 0 18px 38px rgba(15, 23, 42, 0.2);
        transform: translate(-50%, -50%);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        overflow: hidden;
    }

    .delete-trash-stack {
        position: fixed;
        display: grid;
        gap: .45rem;
        transform: translate(-50%, -50%);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        justify-items: center;
    }

    .delete-trash-flight__badge {
        position: absolute;
        left: .85rem;
        top: -.72rem;
        z-index: 2;
        transform: none;
        padding: .34rem .82rem;
        border-radius: 999px;
        border: 1px solid rgba(248, 113, 113, 0.42);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        font-size: .72rem;
        font-weight: 900;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: .12em;
        white-space: nowrap;
        box-shadow: 0 10px 22px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(255, 241, 242, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
        animation: stopwatch-favorite-label-rise 1.02s cubic-bezier(0.2, 0.82, 0.24, 1) both, stopwatch-favorite-label-glow 1.02s ease-in-out both;
    }

    .delete-trash-chip {
        min-width: 160px;
        max-width: min(320px, calc(100vw - 2rem));
        padding: .62rem .88rem;
        border-radius: 999px;
        border: 1px solid rgba(239, 68, 68, 0.24);
        background: radial-gradient(circle at top left, color-mix(in srgb, #ef4444 12%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, white 6%);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.16);
        font-size: .86rem;
        font-weight: 800;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        opacity: .46;
    }

    .delete-trash-flight__title {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: .92rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .delete-trash-bin {
        position: fixed;
        left: 50%;
        bottom: 1.25rem;
        width: 90px;
        height: 92px;
        transform: translateX(-50%);
        filter: drop-shadow(0 20px 30px rgba(15, 23, 42, 0.26));
        animation: delete-trash-bin-pop .3s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .delete-trash-bin__lid {
        position: absolute;
        left: 50%;
        top: 2px;
        width: 62px;
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(180deg, #94a3b8, #64748b);
        transform: translateX(-50%);
    }

    .delete-trash-bin__lid::before {
        content: "";
        position: absolute;
        left: 50%;
        top: -6px;
        width: 22px;
        height: 6px;
        border-radius: 999px 999px 0 0;
        background: #64748b;
        transform: translateX(-50%);
    }

    .delete-trash-bin__body {
        position: absolute;
        inset: 14px 12px 0;
        border-radius: 18px 18px 22px 22px;
        border: 2px solid rgba(71, 85, 105, 0.8);
        background: linear-gradient(180deg, rgba(226, 232, 240, 0.96), rgba(148, 163, 184, 0.88));
        overflow: hidden;
    }

    .delete-trash-bin__body::before,
    .delete-trash-bin__body::after {
        content: "";
        position: absolute;
        top: 12px;
        bottom: 12px;
        width: 4px;
        border-radius: 999px;
        background: rgba(71, 85, 105, 0.38);
    }

    .delete-trash-bin__body::before {
        left: 22px;
        box-shadow: 14px 0 0 rgba(71, 85, 105, 0.38), 28px 0 0 rgba(71, 85, 105, 0.38);
    }

    .delete-trash-enter-active,
    .delete-trash-leave-active {
        transition: opacity .22s ease;
    }

    .delete-trash-enter-from,
    .delete-trash-leave-to {
        opacity: 0;
    }

    @keyframes delete-trash-bin-pop {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(18px) scale(.92);
        }

        100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
    }

    @keyframes delete-trash-flight {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }

        68% {
            opacity: 1;
            transform: translate(calc(-50% + var(--delete-fly-x) * .82), calc(-50% + var(--delete-fly-y) * .82)) scale(.78) rotate(-10deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--delete-fly-x)), calc(-50% + var(--delete-fly-y))) scale(.26) rotate(-18deg);
        }
    }

    html.dark-mode .delete-trash-flight {
        border-color: rgba(248, 113, 113, 0.28);
        background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
    }

    html.dark-mode .delete-trash-flight__badge {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(254, 226, 226, 0.08), 0 0 22px rgba(239, 68, 68, 0.16);
    }

    html.dark-mode .delete-trash-flight__title {
        color: #f8fafc;
    }

    html.dark-mode .delete-trash-chip {
        border-color: rgba(248, 113, 113, 0.28);
        background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
        color: #f8fafc;
    }

    html.dark-mode .delete-trash-bin__lid {
        background: linear-gradient(180deg, #64748b, #334155);
    }

    html.dark-mode .delete-trash-bin__lid::before {
        background: #475569;
    }

    html.dark-mode .delete-trash-bin__body {
        border-color: rgba(148, 163, 184, 0.62);
        background: linear-gradient(180deg, rgba(51, 65, 85, 0.96), rgba(15, 23, 42, 0.94));
    }

    html.dark-mode .delete-trash-bin__body::before {
        box-shadow: 14px 0 0 rgba(148, 163, 184, 0.26), 28px 0 0 rgba(148, 163, 184, 0.26);
        background: rgba(148, 163, 184, 0.26);
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

    .drag-stack--sorting .timer-card {
        transition: transform .34s cubic-bezier(.18, .9, .2, 1), box-shadow .34s cubic-bezier(.18, .9, .2, 1), border-color .26s ease, filter .26s ease;
    }

    .drag-ghost {
        opacity: 0.38;
        transform: scale(0.98) rotate(.4deg);
        filter: saturate(.88);
    }

    /* Card */
    .timer-card {
        position: relative;
        overflow: visible;
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

    .timer-card::before {
        content: "";
        position: absolute;
        inset: -.4rem -.3rem;
        border-radius: 22px;
        pointer-events: none;
        opacity: 0;
    }

    .timer-card::after {
        content: "";
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        pointer-events: none;
        opacity: 0;
        transform: scale(1);
    }

    .timer-card--new {
        animation: stopwatch-card-reveal .86s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes stopwatch-card-reveal {
        0% {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
        }

        42% {
            opacity: 1;
            transform: translateY(-4px) scale(1.012);
            box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.22), 0 22px 46px rgba(59, 130, 246, 0.18);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes stopwatch-favorite-border-sanctified {
        0%, 100% {
            box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.68), 0 0 0 2px rgba(245, 158, 11, 0.42), 0 10px 26px rgba(245, 158, 11, 0.08);
        }

        50% {
            box-shadow: 0 0 0 1px rgba(255, 248, 220, 0.82), 0 0 0 2px rgba(250, 204, 21, 0.56), 0 0 18px rgba(250, 204, 21, 0.18);
        }
    }

    @keyframes stopwatch-favorite-holy-rise {
        0% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22), 0 0 0 rgba(245, 158, 11, 0);
            filter: saturate(1) brightness(1);
        }

        24% {
            transform: translate3d(0, -10px, 0) scale(1.018);
            box-shadow: 0 28px 64px rgba(245, 158, 11, 0.22), 0 0 34px rgba(251, 191, 36, 0.22);
            filter: saturate(1.08) brightness(1.03);
        }

        52% {
            transform: translate3d(0, -24px, 0) scale(1.034);
            box-shadow: 0 40px 84px rgba(245, 158, 11, 0.28), 0 0 52px rgba(250, 204, 21, 0.32);
            filter: saturate(1.16) brightness(1.08);
        }

        72% {
            transform: translate3d(0, -14px, 0) scale(1.024);
            box-shadow: 0 32px 72px rgba(245, 158, 11, 0.24), 0 0 46px rgba(250, 204, 21, 0.24);
            filter: saturate(1.1) brightness(1.05);
        }

        100% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22), 0 0 0 rgba(250, 204, 21, 0);
            filter: saturate(1) brightness(1);
        }
    }

    @keyframes stopwatch-favorite-holy-aura {
        0% {
            opacity: 0;
            transform: translate(-50%, -10%) scale(.58);
            filter: blur(18px);
        }

        32% {
            opacity: .9;
            transform: translate(-50%, -36%) scale(1.04);
            filter: blur(8px);
        }

        68% {
            opacity: .74;
            transform: translate(-50%, -44%) scale(1.12);
            filter: blur(12px);
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -54%) scale(1.18);
            filter: blur(18px);
        }
    }

    @keyframes stopwatch-favorite-holy-sparkles {
        0%, 100% {
            opacity: .32;
            transform: translateY(0) scale(1);
        }

        50% {
            opacity: .8;
            transform: translateY(-4px) scale(1.06);
        }
    }

    @keyframes stopwatch-favorite-fall {
        0% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow: 0 22px 48px rgba(245, 158, 11, 0.16), 0 0 24px rgba(250, 204, 21, 0.16);
            filter: saturate(1.04) brightness(1.02);
        }

        22% {
            transform: translate3d(0, 3px, 0) scale(.997);
            box-shadow: 0 19px 38px rgba(245, 158, 11, 0.1), 0 0 12px rgba(250, 204, 21, 0.08);
            filter: saturate(1.01) brightness(1.005);
        }

        58% {
            transform: translate3d(0, 12px, 0) scale(.989);
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.16), 0 0 6px rgba(250, 204, 21, 0.03);
            filter: saturate(.985) brightness(.992);
        }

        84% {
            transform: translate3d(0, 5px, 0) scale(.995);
            box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18), 0 0 2px rgba(250, 204, 21, 0.02);
            filter: saturate(.994) brightness(.996);
        }

        100% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22), 0 0 0 rgba(250, 204, 21, 0);
            filter: saturate(1) brightness(1);
        }
    }

    @keyframes stopwatch-favorite-border-release {
        0% {
            opacity: .96;
            transform: scale(1);
            border-color: rgba(250, 204, 21, 0.92);
            box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.78), 0 0 0 2px rgba(250, 204, 21, 0.88), 0 0 26px rgba(250, 204, 21, 0.22);
        }

        26% {
            opacity: .94;
            transform: scale(1.01);
            border-color: rgba(253, 224, 71, 0.88);
            box-shadow: 0 0 0 1px rgba(255, 248, 220, 0.82), 0 0 0 2px rgba(250, 204, 21, 0.68), 0 0 26px rgba(250, 204, 21, 0.18);
        }

        62% {
            opacity: .54;
            transform: scale(1.002);
            border-color: rgba(245, 158, 11, 0.28);
            box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.22), 0 0 0 1px rgba(245, 158, 11, 0.18), 0 0 10px rgba(250, 204, 21, 0.05);
        }

        86% {
            opacity: .2;
            transform: scale(.999);
            border-color: rgba(245, 158, 11, 0.08);
            box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.08), 0 0 0 1px rgba(245, 158, 11, 0.06), 0 0 4px rgba(250, 204, 21, 0.02);
        }

        100% {
            opacity: 0;
            transform: scale(.988);
            border-color: rgba(245, 158, 11, 0);
            box-shadow: 0 0 0 0 rgba(255, 244, 214, 0), 0 0 0 0 rgba(250, 204, 21, 0), 0 0 0 rgba(250, 204, 21, 0);
        }
    }

    @keyframes stopwatch-favorite-release-trail {
        0% {
            opacity: 0;
            transform: translateY(-1px) scale(.96);
            filter: blur(8px);
        }

        24% {
            opacity: .3;
            transform: translateY(2px) scale(.985);
            filter: blur(7px);
        }

        58% {
            opacity: .2;
            transform: translateY(9px) scale(1.01);
            filter: blur(8px);
        }

        100% {
            opacity: 0;
            transform: translateY(20px) scale(1.04);
            filter: blur(12px);
        }
    }

    @keyframes stopwatch-favorite-label-rise {
        0% {
            opacity: 0;
            transform: translate(-50%, 14px) scale(.78) rotate(-4deg);
            filter: blur(10px);
            letter-spacing: .08em;
        }

        22% {
            opacity: 1;
            transform: translate(-50%, -6px) scale(1.02) rotate(-1deg);
            filter: blur(0);
            letter-spacing: .12em;
        }

        68% {
            opacity: 1;
            transform: translate(-50%, -18px) scale(1) rotate(0deg);
            filter: blur(0);
            letter-spacing: .11em;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -32px) scale(.96) rotate(0deg);
            filter: blur(6px);
            letter-spacing: .14em;
        }
    }

    @keyframes stopwatch-favorite-label-glow {
        0%, 100% {
            text-shadow: 0 0 0 rgba(255, 248, 220, 0), 0 0 0 rgba(250, 204, 21, 0);
        }

        50% {
            text-shadow: 0 0 18px rgba(255, 248, 220, 0.82), 0 0 36px rgba(250, 204, 21, 0.46);
        }
    }

    @keyframes delete-card-sanctified-rise {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(.78);
            filter: blur(10px);
            letter-spacing: .08em;
        }

        28% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.03);
            filter: blur(0);
            letter-spacing: .12em;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(.97);
            filter: blur(6px);
            letter-spacing: .14em;
        }
    }

    .timer-card--favorite {
        border-color: rgba(245, 158, 11, 0.72);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(255, 244, 214, 0.62), 0 0 0 2px rgba(245, 158, 11, 0.34), 0 10px 26px rgba(245, 158, 11, 0.08);
        animation: stopwatch-favorite-border-sanctified 3.4s ease-in-out infinite;
    }

    .timer-card--delete-pulse {
        box-shadow: 0 24px 48px rgba(239, 68, 68, 0.16), 0 18px 40px rgba(15, 23, 42, 0.22);
        border-color: rgba(248, 113, 113, 0.42);
    }

    .timer-card--action-pulse {
        box-shadow: 0 22px 44px rgba(15, 23, 42, 0.24), 0 18px 40px rgba(15, 23, 42, 0.22);
    }

    .delete-card-sanctified-label {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 9;
        pointer-events: none;
        transform: translate(-50%, -50%);
        padding: .42rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(248, 113, 113, 0.46);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        font-size: .8rem;
        font-weight: 900;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: .12em;
        white-space: nowrap;
        box-shadow: 0 16px 30px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(255, 241, 242, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
        animation: delete-card-sanctified-rise .92s cubic-bezier(0.2, 0.82, 0.24, 1) both, stopwatch-favorite-label-glow .92s ease-in-out both;
    }

    .action-card-label {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 9;
        pointer-events: none;
        transform: translate(-50%, -50%);
        padding: .42rem 1rem;
        border-radius: 999px;
        font-size: .8rem;
        font-weight: 900;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: .12em;
        white-space: nowrap;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92);
        animation: delete-card-sanctified-rise .92s cubic-bezier(0.2, 0.82, 0.24, 1) both, stopwatch-favorite-label-glow .92s ease-in-out both;
    }

    .timer-controls {
        position: relative;
    }

    .action-card-label--start {
        border: 1px solid rgba(74, 222, 128, 0.46);
        background: linear-gradient(180deg, rgba(240, 253, 244, 0.98), rgba(220, 252, 231, 0.94));
        color: #166534;
        box-shadow: 0 16px 30px rgba(34, 197, 94, 0.18), 0 0 0 1px rgba(240, 253, 244, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
    }

    .action-card-label--pause {
        border: 1px solid rgba(248, 113, 113, 0.46);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        box-shadow: 0 16px 30px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(255, 241, 242, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
    }

    .action-card-label--reset {
        border: 1px solid rgba(148, 163, 184, 0.48);
        background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), rgba(226, 232, 240, 0.94));
        color: #475569;
        box-shadow: 0 16px 30px rgba(100, 116, 139, 0.16), 0 0 0 1px rgba(248, 250, 252, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
    }

    .action-card-label--lap {
        border: 1px solid rgba(96, 165, 250, 0.46);
        background: linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.94));
        color: #1d4ed8;
        box-shadow: 0 16px 30px rgba(59, 130, 246, 0.18), 0 0 0 1px rgba(239, 246, 255, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
    }

    .timer-card--favorite-transfer {
        overflow: visible;
    }

    .timer-card--favorite-transfer-in {
        border-color: rgba(250, 204, 21, 0.82);
        animation: stopwatch-favorite-holy-rise 1.28s cubic-bezier(0.18, 0.88, 0.24, 1.08) both;
    }

    .timer-card--favorite-transfer-in::before {
        left: 50%;
        top: -1.45rem;
        width: 72%;
        height: 2.2rem;
        inset: auto;
        transform: translateX(-50%);
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255, 252, 240, 0.95) 0%, rgba(250, 204, 21, 0.72) 38%, rgba(245, 158, 11, 0.12) 68%, rgba(245, 158, 11, 0) 100%);
        filter: blur(10px);
        opacity: .84;
        animation: stopwatch-favorite-holy-aura 1.18s cubic-bezier(0.2, 0.82, 0.24, 1) both;
    }

    .timer-card--favorite-transfer-in::after {
        background: linear-gradient(135deg, rgba(250, 204, 21, 0.12), rgba(251, 191, 36, 0.18), rgba(250, 204, 21, 0));
        border: 2px solid rgba(250, 204, 21, 0.92);
        box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.78), 0 0 26px rgba(250, 204, 21, 0.36), 0 0 54px rgba(245, 158, 11, 0.18);
        animation: stopwatch-favorite-holy-sparkles .96s ease-in-out 2;
        opacity: 1;
    }

    .timer-card--favorite-transfer-out {
        border-color: rgba(245, 158, 11, 0.24);
        animation: stopwatch-favorite-fall .76s cubic-bezier(0.24, 0.76, 0.22, 1) both;
    }

    .timer-card--favorite-transfer-out::before {
        background: radial-gradient(circle at 50% 12%, rgba(255, 248, 220, 0.32), rgba(255, 248, 220, 0) 42%), linear-gradient(180deg, rgba(250, 204, 21, 0.14), rgba(245, 158, 11, 0.05) 45%, rgba(245, 158, 11, 0) 100%);
        animation: stopwatch-favorite-release-trail .72s cubic-bezier(0.24, 0.76, 0.22, 1) both;
    }

    .timer-card--favorite-transfer-out::after {
        background: linear-gradient(180deg, rgba(255, 248, 220, 0.12), rgba(250, 204, 21, 0.06) 44%, rgba(250, 204, 21, 0) 100%);
        border: 2px solid rgba(250, 204, 21, 0.92);
        animation: stopwatch-favorite-border-release .7s cubic-bezier(0.24, 0.76, 0.22, 1) both;
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

    html.dark-mode .timer-card--favorite {
        border-color: rgba(251, 191, 36, 0.86);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 244, 214, 0.18), 0 0 0 2px rgba(251, 191, 36, 0.56), 0 0 24px rgba(250, 204, 21, 0.16);
    }

    html.dark-mode .favorite-sanctified-label {
        border-color: rgba(251, 191, 36, 0.54);
        background: linear-gradient(180deg, rgba(120, 53, 15, 0.98), rgba(92, 39, 12, 0.94));
        color: #fde68a;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 244, 214, 0.12), 0 0 22px rgba(250, 204, 21, 0.18);
    }

    html.dark-mode .favorite-sanctified-label.favorite-sanctified-label--removed {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(254, 226, 226, 0.08), 0 0 22px rgba(239, 68, 68, 0.16);
    }

    html.dark-mode .delete-card-sanctified-label {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(254, 226, 226, 0.08), 0 0 22px rgba(239, 68, 68, 0.16);
    }

    html.dark-mode .action-card-label--start {
        border-color: rgba(74, 222, 128, 0.38);
        background: linear-gradient(180deg, rgba(20, 83, 45, 0.98), rgba(18, 64, 37, 0.94));
        color: #bbf7d0;
    }

    html.dark-mode .action-card-label--pause {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
    }

    html.dark-mode .action-card-label--reset {
        border-color: rgba(148, 163, 184, 0.38);
        background: linear-gradient(180deg, rgba(51, 65, 85, 0.98), rgba(30, 41, 59, 0.94));
        color: #cbd5e1;
    }

    html.dark-mode .action-card-label--lap {
        border-color: rgba(96, 165, 250, 0.4);
        background: linear-gradient(180deg, rgba(30, 58, 138, 0.98), rgba(30, 41, 99, 0.94));
        color: #bfdbfe;
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

    .timer-card--favorite[data-running="true"] {
        border-color: rgba(245, 158, 11, 0.82);
        box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.62), 0 0 0 2px rgba(245, 158, 11, 0.36), 0 20px 46px rgba(15, 23, 42, 0.55), 0 0 20px rgba(250, 204, 21, 0.12);
    }

    html.dark-mode .timer-card--favorite[data-running="true"] {
        border-color: rgba(251, 191, 36, 0.92);
        box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.16), 0 0 0 2px rgba(251, 191, 36, 0.6), 0 24px 52px rgba(0, 0, 0, 0.9), 0 0 22px rgba(250, 204, 21, 0.18);
    }

    html.dark-mode .timer-card[data-running="true"] .timer-display {
        box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(129, 140, 248, 0.9), 0 0 26px rgba(129, 140, 248, 0.75);
    }

    .drag-chosen {
        transform: scale(1.024) rotate(-.3deg);
        box-shadow: 0 26px 60px rgba(15, 23, 42, 0.28);
        border-color: rgba(129, 140, 248, 0.62);
        cursor: grabbing;
    }

    .dragging {
        transform: scale(1.045) rotate(-1.2deg);
        box-shadow: 0 34px 78px rgba(15, 23, 42, 0.34);
        border-color: rgba(96, 165, 250, 0.72);
        filter: saturate(1.04);
        cursor: grabbing;
    }

    /* Header innerhalb Card */
    .timer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        position: relative;
    }

    .favorite-sanctified-label {
        position: absolute;
        left: 50%;
        top: -.9rem;
        z-index: 8;
        pointer-events: none;
        padding: .38rem .95rem;
        border-radius: 999px;
        border: 1px solid rgba(250, 204, 21, 0.48);
        background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 244, 214, 0.92));
        color: #b45309;
        font-size: .78rem;
        font-weight: 900;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: .12em;
        white-space: nowrap;
        box-shadow: 0 16px 30px rgba(245, 158, 11, 0.18), 0 0 0 1px rgba(255, 248, 220, 0.68), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        animation: stopwatch-favorite-label-rise 1.18s cubic-bezier(0.2, 0.82, 0.24, 1) both, stopwatch-favorite-label-glow 1.18s ease-in-out both;
    }

    .favorite-sanctified-label.favorite-sanctified-label--removed {
        border-color: rgba(248, 113, 113, 0.46);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        box-shadow: 0 16px 30px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(255, 241, 242, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
    }

    .timer-actions {
        display: flex;
        gap: 0.5rem;
    }

    .timer-name {
        cursor: pointer;
        position: relative;
        display: inline-block;
        font-weight: 600;
        font-size: 1.2rem;
        text-align: left;
        pointer-events: auto;
    }

    .timer-name__live {
        display: inline-block;
    }

    .timer-name--rename-forge {
        animation: stopwatch-rename-title-settle 1.02s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .timer-name--rename-forge > .timer-name__live {
        opacity: 0.02;
    }

    .timer-name-rename-overlay {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        display: grid;
        grid-template-areas: "stack";
        align-items: center;
        pointer-events: none;
        z-index: 6;
        white-space: nowrap;
        min-width: max-content;
    }

    .timer-name-rename-overlay__old,
    .timer-name-rename-overlay__handwrite,
    .timer-name-rename-overlay__final {
        grid-area: stack;
        font-weight: inherit;
        letter-spacing: inherit;
        white-space: nowrap;
    }

    .timer-name-rename-overlay__old {
        color: inherit;
        text-shadow: none;
        animation: stopwatch-rename-old .46s ease-in both;
    }

    .timer-name-rename-overlay__handwrite {
        color: inherit;
        font-family: inherit;
        font-weight: inherit;
        text-shadow: none;
        overflow: hidden;
        width: 0;
        border-right: 2px solid currentColor;
        animation: stopwatch-rename-handwrite .82s steps(24, end) .44s both;
    }

    .timer-name-rename-overlay__final {
        color: inherit;
        text-shadow: none;
        opacity: 0;
        animation: stopwatch-rename-final .14s linear 1.22s both;
    }

    .timer-card--rename-forge .timer-header {
        isolation: isolate;
    }

    .timer-card--rename-forge {
        animation: stopwatch-rename-card-pulse .92s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .timer-card--rename-forge::after {
        content: "";
        position: absolute;
        inset: -6px;
        border-radius: inherit;
        border: 1px solid rgba(125, 211, 252, 0.72);
        box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.42), 0 0 36px rgba(59, 130, 246, 0.24);
        pointer-events: none;
        animation: stopwatch-rename-card-ring 1.28s cubic-bezier(0.16, 1, 0.3, 1) both;
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

    .timer-display__head,
    .timer-display__tail,
    .timer-display__fraction {
        display: inline-block;
    }

    .timer-display__fraction {
        min-width: 1.8ch;
        font-size: .72em;
        opacity: .92;
    }

    .digit-roll-enter-active,
    .digit-roll-leave-active {
        display: inline-block;
        transition: opacity .16s ease, transform .22s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .digit-roll-enter-from {
        opacity: 0;
        transform: translateY(-0.24em);
    }

    .digit-roll-leave-to {
        opacity: 0;
        transform: translateY(0.2em);
    }

    .timer-display.is-starting {
        animation: timer-display-start .62s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes stopwatch-rename-old {
        0% {
            opacity: 1;
            filter: blur(0);
            clip-path: inset(0 0 0 0);
            transform: translateX(0);
        }

        35% {
            opacity: 1;
            clip-path: inset(0 0 0 0);
            transform: translateX(0);
        }

        100% {
            opacity: 0;
            filter: blur(2px);
            clip-path: inset(0 0 0 100%);
            transform: translateX(0);
        }
    }

    @keyframes stopwatch-rename-handwrite {
        0% {
            width: 0;
            opacity: 1;
            border-right-color: currentColor;
        }

        92% {
            width: 100%;
            opacity: 1;
            border-right-color: currentColor;
        }

        100% {
            width: 100%;
            opacity: 1;
            border-right-color: transparent;
        }
    }

    @keyframes stopwatch-rename-final {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }

    @keyframes stopwatch-rename-title-settle {
        0% {
            filter: brightness(1);
            transform: translateY(0) scale(1);
        }

        34% {
            filter: brightness(1.08);
            transform: translateY(-1px) scale(1.02);
        }

        100% {
            filter: brightness(1);
            transform: translateY(0) scale(1);
        }
    }

    @keyframes stopwatch-rename-card-pulse {
        0% {
            transform: translateY(0) scale(1);
        }

        24% {
            transform: translateY(-2px) scale(1.01);
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    @keyframes stopwatch-rename-card-ring {
        0% {
            opacity: 0;
            transform: scale(.985);
        }

        18% {
            opacity: .92;
        }

        100% {
            opacity: 0;
            transform: scale(1.02);
        }
    }

    .timer-display.is-pausing {
        animation: timer-display-pause .42s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .timer-display.is-resuming {
        animation: timer-display-resume .62s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .timer-display.is-resetting {
        animation: timer-display-rewind .56s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .timer-display.is-lap-stamp {
        animation: timer-display-lap-stamp .36s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes timer-display-start {
        0% {
            transform: translateY(0) scale(1);
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        34% {
            transform: translateY(-2px) scale(1.045);
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.16), 0 24px 52px rgba(59, 130, 246, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    @keyframes timer-display-pause {
        0% {
            transform: translateY(0) scale(1.02);
            filter: saturate(1);
        }

        45% {
            transform: translateY(1px) scale(0.992);
            filter: saturate(0.88);
        }

        100% {
            transform: translateY(0) scale(1);
            filter: saturate(1);
        }
    }

    @keyframes timer-display-resume {
        0% {
            transform: translateY(1px) scale(0.99);
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        38% {
            transform: translateY(-2px) scale(1.038);
            box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.14), 0 22px 48px rgba(59, 130, 246, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    @keyframes timer-display-rewind {
        0% {
            transform: translateY(0) scale(1);
            letter-spacing: 0.02em;
            filter: saturate(1);
        }

        26% {
            transform: translateY(1px) scale(0.985);
            letter-spacing: -0.01em;
            filter: saturate(0.92);
        }

        58% {
            transform: translateY(-1px) scale(1.032);
            letter-spacing: -0.03em;
            box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.12), 0 18px 38px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.07);
        }

        100% {
            transform: translateY(0) scale(1);
            letter-spacing: 0.02em;
            filter: saturate(1);
        }
    }

    @keyframes timer-display-lap-stamp {
        0% {
            transform: scale(1);
        }

        42% {
            transform: scale(0.97);
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12), 0 12px 28px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        100% {
            transform: scale(1);
        }
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

    .laps-count.is-pulsing {
        animation: laps-count-pulse .52s cubic-bezier(0.22, 1, 0.36, 1);
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

    .lap-row-reveal-enter-active,
    .lap-row-reveal-leave-active {
        transition: opacity .24s ease, transform .28s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .lap-row-reveal-enter-from {
        opacity: 0;
        transform: translateY(-10px) scale(0.985);
    }

    .lap-row-reveal-leave-to {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
    }

    @keyframes laps-count-pulse {
        0% {
            transform: scale(1);
            opacity: .9;
        }

        38% {
            transform: scale(1.12);
            opacity: 1;
        }

        100% {
            transform: scale(1);
            opacity: .92;
        }
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
