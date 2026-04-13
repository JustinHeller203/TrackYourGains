<!-- TimerComponent.vue -->
<template>
    <div class="workout-list timer-container">
        <div class="plan-header">
            <h3 class="section-title">Satzpausen-Timer</h3>
            <AddButton title="Neuen Timer hinzufügen" @click="openAddTimerPopup" />
        </div>

        <Draggable :modelValue="timers"
                   item-key="id"
                   :handle="'.timer-drag-handle'"
                   ghost-class="drag-ghost"
                   chosen-class="drag-chosen"
                   drag-class="dragging"
                   :force-fallback="false"
                   :animation="180"
                   direction="vertical"
                   easing="cubic-bezier(0.16,1,0.3,1)"
                   :delay="resolvedDragDelay"
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
                   @update:modelValue="onReorderTimers">
            <template #item="{ element: timer }">
                <div class="timer-card"
                     :class="{
                         'timer-scroll-highlight': highlightTimerId === timer.id,
                         'timer-card--new': revealedTimerId === timer.id,
                         'timer-card--finish-impact': finishImpactId === timer.id,
                         'timer-card--rename-forge': renameForgeTimerId === timer.id,
                         'timer-card--delete-pulse': deleteCardTimerId === timer.id,
                         'timer-card--action-pulse': actionCardState.id === timer.id,
                         'timer-card--favorite': timer.isFavorite,
                         'timer-card--favorite-transfer': favoriteTransfer.id === timer.id,
                         'timer-card--favorite-transfer-in': favoriteTransfer.id === timer.id && favoriteTransfer.direction === 'to-favorite',
                         'timer-card--favorite-transfer-out': favoriteTransfer.id === timer.id && favoriteTransfer.direction === 'from-favorite'
                     }"
                     :key="timer.id"
                     :data-timer-id="timer.id"
                     :data-running="timer.isRunning ? 'true' : 'false'"
                     data-type="timer">
                    <span v-if="actionCardState.id === timer.id"
                          :key="`action-${actionCardState.id}-${actionCardState.seq}`"
                          class="action-card-label"
                          :class="`action-card-label--${actionCardState.tone}`"
                          aria-hidden="true">{{ actionCardState.label }}</span>
                    <span v-if="deleteCardTimerId === timer.id" class="delete-card-sanctified-label" aria-hidden="true">Gelöscht!</span>
                    <div class="timer-header">
                        <span v-if="favoriteTransfer.id === timer.id && favoriteTransfer.direction"
                              class="favorite-sanctified-label"
                              :class="{ 'favorite-sanctified-label--removed': favoriteTransfer.direction === 'from-favorite' }"
                              aria-hidden="true">{{ favoriteTransfer.direction === 'to-favorite' ? 'Favorisiert!' : 'Entfernt!' }}</span>
                        <span class="timer-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                        <span class="timer-name"
                              :class="{ 'timer-name--rename-forge': renameForgeTimerId === timer.id && !!renameForgePayload }"
                              @dblclick="openRenameTimerPopup(timer.id)">
                            <span class="timer-name__live">{{ timer.name || 'Timer' }}</span>
                            <span v-if="renameForgeTimerId === timer.id && renameForgePayload"
                                  class="timer-name-rename-overlay"
                                  aria-hidden="true">
                                <span class="timer-name-rename-overlay__old">{{ renameForgePayload.oldName }}</span>
                                <span class="timer-name-rename-overlay__handwrite">{{ renameForgePayload.newName }}</span>
                                <span class="timer-name-rename-overlay__final">{{ renameForgePayload.newName }}</span>
                            </span>
                        </span>

                        <div class="timer-actions">
                            <FavoriteButton :active="timer.isFavorite"
                                            :titleActive="'Aus Favoriten entfernen'"
                                            :titleInactive="'Zu Favoriten hinzufügen'"
                                            @toggle="toggleFavoriteTimer(timer.id)" />
                            <CloseButton title="Timer löschen" variant="timer" @click="openDeleteTimerPopup(timer, $event)" />
                        </div>
                    </div>

                    <div class="timer-controls">
                        <span class="timer-display" :class="[displayMotionClass(timer.id), { 'is-ending': isTimerEnding(timer) }]" :style="timerDisplayStyle(timer)">
                            <span class="timer-display__head">{{ formatTimerDisplayHead(timer.time) }}</span>
                            <Transition name="digit-roll" mode="out-in">
                                <span :key="formatTimerDisplayTail(timer.time)" class="timer-display__tail">{{ formatTimerDisplayTail(timer.time) }}</span>
                            </Transition>
                        </span>

                        <div class="timer-input-group">
                            <TimerSelect :modelValue="String(timer.seconds ?? '')"
                                         @change="onSecondsChange(timer.id, $event)">
                                <option value="" disabled>Satzpause wählen</option>
                                <option value="60">60 Sekunden</option>
                                <option value="90">90 Sekunden</option>
                                <option value="120">120 Sekunden</option>
                                <option value="custom">Benutzerdefiniert</option>
                            </TimerSelect>

                            <UiTimerInput v-if="String((timer as any).secondsPreset ?? (timer as any).seconds ?? '') === 'custom'"
                                          :modelValue="timer.customSeconds ?? ''"
                                          @input="onCustomSecondsInput(timer.id, $event)"
                                          placeholder="Sekunden"
                                          type="number"
                                          min="1" />

                            <!-- ruhig: Smart als optionaler Button -->
                            <button type="button"
                                    class="mini-toggle"
                                    :class="getMeta(timer.id).smartOpen ? 'is-open' : ''"
                                    @click="toggleSmart(timer.id)">
                                ✨ Smart
                            </button>

                            <!-- ruhig: Sound in „Erweitert“ -->
                            <button type="button"
                                    class="mini-toggle"
                                    :class="getMeta(timer.id).advancedOpen ? 'is-open' : ''"
                                    @click="toggleAdvanced(timer.id)">
                                ⚙️ Erweitert
                            </button>
                        </div>

                        <!-- Smart Presets: standardmäßig zu -->
                        <Transition name="timer-panel-accordion">
                        <div v-if="getMeta(timer.id).smartOpen" class="smart-panel">
                            <TimerSelect full
                                         :modelValue="getMeta(timer.id).exerciseKey"
                                         @change="onExerciseChange(timer.id, $event)">
                                <option value="">Übung wählen (optional)</option>
                                <option v-for="ex in EXERCISES" :key="ex.key" :value="ex.key">
                                    {{ ex.label }}
                                </option>
                            </TimerSelect>
                            <div class="smart-goals" role="group" aria-label="Trainingsziel">
                                <button type="button"
                                        class="smart-goal"
                                        :class="getMeta(timer.id).goal === 'hypertrophy' ? 'is-active' : ''"
                                        :aria-pressed="getMeta(timer.id).goal === 'hypertrophy'"
                                        @click="setGoal(timer.id, 'hypertrophy')">
                                    Hypertrophie
                                </button>
                                <button type="button"
                                        class="smart-goal"
                                        :class="getMeta(timer.id).goal === 'strength' ? 'is-active' : ''"
                                        :aria-pressed="getMeta(timer.id).goal === 'strength'"
                                        @click="setGoal(timer.id, 'strength')">
                                    Kraft
                                </button>
                                <button type="button"
                                        class="smart-goal"
                                        :class="getMeta(timer.id).goal === 'isolation' ? 'is-active' : ''"
                                        :aria-pressed="getMeta(timer.id).goal === 'isolation'"
                                        @click="setGoal(timer.id, 'isolation')">
                                    Isolation
                                </button>
                            </div>

                            <div class="smart-summary" v-if="getMeta(timer.id).goal">
                                <span class="smart-text">
                                    Empfehlung: <b>{{ formatSeconds(getSuggestion(timer.id).mid) }}</b>
                                </span>

                                <button type="button"
                                        class="smart-apply"
                                        @click="applySuggested(timer.id, 'mid')">
                                    Übernehmen
                                </button>

                                <button type="button"
                                        class="smart-more"
                                        :class="getMeta(timer.id).smartMore ? 'is-open' : ''"
                                        @click="toggleSmartMore(timer.id)">
                                    mehr
                                </button>
                            </div>

                            <div class="smart-chips" v-if="getMeta(timer.id).goal && getMeta(timer.id).smartMore">
                                <button type="button" class="smart-chip" @click="applySuggested(timer.id, 'low')">
                                    {{ formatSeconds(getSuggestion(timer.id).low) }}
                                </button>
                                <button type="button" class="smart-chip" @click="applySuggested(timer.id, 'high')">
                                    {{ formatSeconds(getSuggestion(timer.id).high) }}
                                </button>
                            </div>
                        </div>
                        </Transition>

                        <!-- Erweitert: Sound hier rein -->
                        <Transition name="timer-panel-accordion">
                        <div v-if="getMeta(timer.id).advancedOpen" class="advanced-panel">
                            <TimerSelect :modelValue="soundUiValue(timer.id, timer.sound)"
                                         @change="onSoundChange(timer.id, $event)">
                                <option value="" disabled>Sound wählen</option>
                                <option value="nothing">Keine</option>
                                <option value="standard">Standard</option>
                                <option value="alarm">Alarm</option>
                                <option value="beep">Piep</option>
                                <option value="dong">Dong</option>
                                <option value="decide">One Way Out</option>
                            </TimerSelect>
                        </div>
                        </Transition>

                        <div class="timer-buttons">
                            <StartButton title="Start" @click="handleStartTimer(timer)" :disabled="timer.isRunning" />
                            <StopButton title="Stop" @click="handlePauseTimer(timer)" :disabled="!timer.isRunning" />
                            <ResetControlButton title="Reset" @click="handleResetTimer(timer)" />
                        </div>
                    </div>
                </div>
            </template>
        </Draggable>
    </div>

    <!-- Pop-up für Timer -->
    <InfoPopup :show="showTimerPopup"
               title="Satzpause beendet!"
               message="Deine Pause ist vorbei. Bereit für den nächsten Satz? 💪"
               overlayClass="timer-popup"
               okText="OK"
               @ok="closeTimerPopup"
               @cancel="closeTimerPopup" />

    <!-- Pop-up für neuen Timer -->
    <NamePromptPopup :show="showNamePopup"
                     v-model="namePopupValue"
                     :title="namePopupMode === 'rename' ? 'Timer umbenennen' : 'Neuen Timer hinzufügen'"
                     :placeholder="namePopupMode === 'rename' ? 'Neuer Timer Name' : 'Timer Name (optional)'"
                     overlayClass="timer-popup"
                     @save="saveNamePopup"
                     @cancel="closeNamePopup" />

    <!-- Pop-up für Löschbestätigung (nur Timer) -->
    <DeleteConfirmPopup :show="showDeletePopup" @confirm="confirmDeleteAction" @cancel="closeDeletePopup" />

    <Transition name="delete-trash">
        <div v-if="deleteTrashState.visible" class="delete-trash-overlay" aria-hidden="true">
            <div v-if="deleteTrashState.itemName" class="delete-trash-flight" :style="deleteTrashFlightStyle">
                <span class="delete-trash-flight__badge">Gelöscht!</span>
                <span class="delete-trash-flight__title">{{ deleteTrashState.itemName }}</span>
            </div>
            <div class="delete-trash-bin">
                <div class="delete-trash-bin__lid"></div>
                <div class="delete-trash-bin__body"></div>
            </div>
        </div>
    </Transition>

    <!-- Pop-up für Validierung (nur Timer) -->
    <ValidationPopup :show="showValidationPopup" :errors="validationErrorMessages" @close="closeValidationPopup" />

    <!-- Audio-Elemente für Timer-Sounds -->
    <audio id="audio-standard" preload="auto"></audio>
    <audio id="audio-alarm" preload="auto"></audio>
    <audio id="audio-beep" preload="auto"></audio>
    <audio id="audio-dong" preload="auto"></audio>
    <audio id="audio-decide" preload="auto"></audio>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
    import Draggable from 'vuedraggable'
    import UiTimerInput from '@/components/ui/kits/inputs/UiTimerInput.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import CloseButton from '@/components/ui/buttons/CloseButton.vue'
    import AddButton from '@/components/ui/buttons/AddButton.vue'
    import StartButton from '@/components/ui/buttons/glocks/StartButton.vue'
    import StopButton from '@/components/ui/buttons/glocks/StopButton.vue'
    import ResetControlButton from '@/components/ui/buttons/glocks/ResetControlButton.vue'
    import NamePromptPopup from '@/components/ui/popups/NamePromptPopup.vue'
    import InfoPopup from '@/components/ui/popups/InfoPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import TimerSelect from '@/components/ui/kits/selects/UiTimerSelect.vue'
    import { useTimersStore } from '@/store/timersStore'
    import type { UpsertTimerDto } from '@/services/timers'
    import type { TimerInstance } from '@/types/training'
    import { useAuthStore } from '@/store/authStore'

    const props = defineProps<{
        startTimer: (timer: TimerInstance) => void
        stopTimer: (timer: TimerInstance) => void
        resetTimer: (timer: TimerInstance) => void

        dragDelay?: number
        addToast?: (message: string, type?: 'delete' | 'add' | 'save' | 'timer' | 'load') => void
        dismissToast?: (immediate?: boolean) => void
    }>()

    const showNamePopup = ref(false)
    const namePopupMode = ref<'add' | 'rename'>('add')
    const namePopupValue = ref('')
    const editingTimerId = ref<string | null>(null)
    const showTimerPopup = ref(false)

    const timersStore = useTimersStore()
    const timers = computed(() => timersStore.items)

    const auth = useAuthStore()
    const isGuest = computed(() => !auth.user)

    const resolvedDragDelay = computed(() => props.dragDelay ?? 0)

    const isDragging = ref(false)

    const highlightTimerId = ref<string | null>(null)
    const revealedTimerId = ref<string | null>(null)
    const renameForgeTimerId = ref<string | null>(null)
    const renameForgePayload = ref<{ oldName: string; newName: string } | null>(null)
    let renameForgeTimer: ReturnType<typeof setTimeout> | null = null

    const scrollToTimerCard = async (id: string) => {
        await nextTick()

        const el = document.querySelector(`[data-timer-id="${id}"]`) as HTMLElement | null
        if (!el) return

        el.scrollIntoView({ behavior: 'smooth', block: 'center' })

        highlightTimerId.value = id
        window.setTimeout(() => {
            if (highlightTimerId.value === id) highlightTimerId.value = null
        }, 900)
    }

    const revealTimerCard = (id: string) => {
        revealedTimerId.value = id
        window.setTimeout(() => {
            if (revealedTimerId.value === id) revealedTimerId.value = null
        }, 860)
    }

    const clearRenameForge = () => {
        if (renameForgeTimer) {
            clearTimeout(renameForgeTimer)
            renameForgeTimer = null
        }
        renameForgeTimerId.value = null
        renameForgePayload.value = null
    }

    const triggerRenameForge = async (id: string, oldName: string, newName: string) => {
        if (!id || !oldName || !newName || oldName === newName) return
        clearRenameForge()
        renameForgeTimerId.value = id
        renameForgePayload.value = { oldName, newName }
        await nextTick()
        renameForgeTimer = setTimeout(() => {
            renameForgeTimerId.value = null
            renameForgePayload.value = null
            renameForgeTimer = null
        }, 1650)
    }
    const onDragStart = () => {
        isDragging.value = true
    }

    const onDragEnd = () => {
        isDragging.value = false
    }

    // =========================
    // Smart Presets (local meta)
    // =========================
    type SmartGoal = 'hypertrophy' | 'strength' | 'isolation'

    type ExerciseKind = 'big_compound' | 'medium_compound' | 'isolation'

    const EXERCISES = [
        { key: 'bench_press', label: 'Bankdrücken', kind: 'big_compound' as const },
        { key: 'squat', label: 'Kniebeuge', kind: 'big_compound' as const },
        { key: 'deadlift', label: 'Kreuzheben', kind: 'big_compound' as const },
        { key: 'ohp', label: 'Schulterdrücken (OHP)', kind: 'medium_compound' as const },
        { key: 'row', label: 'Rudern', kind: 'medium_compound' as const },
        { key: 'lat_pulldown', label: 'Latziehen', kind: 'medium_compound' as const },
        { key: 'leg_press', label: 'Beinpresse', kind: 'medium_compound' as const },

        { key: 'lateral_raise', label: 'Seitheben', kind: 'isolation' as const },
        { key: 'biceps_curl', label: 'Bizepscurls', kind: 'isolation' as const },
        { key: 'triceps_pushdown', label: 'Trizepsdrücken', kind: 'isolation' as const },
        { key: 'calf_raise', label: 'Wadenheben', kind: 'isolation' as const },
    ] as const

    type SmartMeta = {
        exerciseKey: string
        goal: SmartGoal | null
        smartOpen: boolean
        smartMore: boolean
        advancedOpen: boolean
        soundTouched: boolean
    }

    type ChangeEventLike = Event & { target: { value: string } }
    const eventValue = (e: Event) => {
        const t = (e as any)?.target
        return typeof t?.value === 'string' ? t.value : ''
    }

    const metaById = ref<Record<string, SmartMeta>>({})

    function getMeta(id: string): SmartMeta {
        if (!metaById.value[id]) {
            metaById.value[id] = {
                exerciseKey: '',
                goal: null,
                smartOpen: false,
                smartMore: false,
                advancedOpen: false,
                soundTouched: false,
            }
        }
        return metaById.value[id]
    }

    const soundUiValue = (id: string, sound: any) => {
        const m = getMeta(id)
        const v = String(sound ?? '')

        // solange User nix ausgewählt hat: "standard" (Default) wie "nicht gesetzt" behandeln
        if (!m.soundTouched && (v === '' || v === 'standard')) return ''
        return v
    }
    const toggleSmart = (id: string) => {
        const m = getMeta(id)
        m.smartOpen = !m.smartOpen
        if (!m.smartOpen) m.smartMore = false
    }

    const toggleSmartMore = (id: string) => {
        const m = getMeta(id)
        m.smartMore = !m.smartMore
    }

    const toggleAdvanced = (id: string) => {
        const m = getMeta(id)
        m.advancedOpen = !m.advancedOpen
    }

    const onExerciseChange = (id: string, e: Event) => {
        const value = eventValue(e)
        getMeta(id).exerciseKey = value
    }

    const setGoal = (id: string, goal: SmartGoal) => {
        getMeta(id).goal = goal
    }

    const exerciseKindOf = (exerciseKey: string): ExerciseKind => {
        const ex = EXERCISES.find(x => x.key === exerciseKey)
        return (ex?.kind ?? 'medium_compound') as ExerciseKind
    }

    const goalBaseRange = (goal: SmartGoal) => {
        // seconds
        if (goal === 'strength') return { low: 180, high: 300 }       // 3–5 min
        if (goal === 'isolation') return { low: 45, high: 90 }        // 45–90s
        return { low: 60, high: 120 }                                 // hypertrophy 60–120s
    }

    const kindFactor = (kind: ExerciseKind) => {
        // wirkt auf die Range: big ↑, iso ↓
        if (kind === 'big_compound') return 1.25
        if (kind === 'isolation') return 0.85
        return 1.0
    }

    const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n))

    const roundToNice = (sec: number) => {
        // “nice” steps: unter 120s -> 15s steps, sonst 30s steps
        const step = sec < 120 ? 15 : 30
        return Math.max(step, Math.round(sec / step) * step)
    }

    const getSuggestion = (id: string) => {
        const { exerciseKey, goal } = getMeta(id)
        if (!goal) return { low: 60, mid: 90, high: 120 }

        const base = goalBaseRange(goal)
        const factor = kindFactor(exerciseKindOf(exerciseKey))

        // wir skalieren die base-range, aber halten sie in sinnvollen Grenzen pro Ziel
        const scaledLow = base.low * factor
        const scaledHigh = base.high * factor

        // harte Limits, damit es nicht ausartet
        const hard =
            goal === 'strength' ? { min: 120, max: 420 } :
                goal === 'isolation' ? { min: 30, max: 150 } :
                    { min: 45, max: 240 }

        const low = roundToNice(clamp(scaledLow, hard.min, hard.max))
        const high = roundToNice(clamp(scaledHigh, hard.min, hard.max))
        const mid = roundToNice((low + high) / 2)

        return { low, mid, high }
    }

    const formatSeconds = (sec: number) => {
        if (sec >= 60) {
            const m = Math.floor(sec / 60)
            const s = sec % 60
            return s ? `${m}m ${s}s` : `${m}m`
        }
        return `${sec}s`
    }

    const formatSmartSuggestion = (id: string) => {
        const s = getSuggestion(id)
        return `${formatSeconds(s.mid)} (Range ${formatSeconds(s.low)}–${formatSeconds(s.high)})`
    }

    const applySuggested = async (id: string, which: 'low' | 'mid' | 'high') => {
        const s = getSuggestion(id)
        const sec = which === 'low' ? s.low : which === 'high' ? s.high : s.mid

        // setzt Timer direkt auf custom mit sec
        await patchTimer(id, { secondsPreset: 'custom', seconds: 'custom', customSeconds: sec })
        props.addToast?.(`Pause gesetzt: ${formatSeconds(sec)}`, 'save')
    }

    // local Confirm/Validation nur für Timer, damit der Block komplett out ist
    const showDeletePopup = ref(false)
    const deleteAction = ref<(() => void) | null>(null)
    const pendingDeleteTimer = ref<TimerInstance | null>(null)
    const pendingDeleteEvent = ref<MouseEvent | null>(null)
    const deleteTrashState = ref({
        visible: false,
        itemName: '',
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    })
    let deleteTrashTimer: ReturnType<typeof setTimeout> | null = null
    const deleteCardTimerId = ref<string | null>(null)

    const showValidationPopup = ref(false)
    const validationErrorMessages = ref<string[]>([])
    const displayMotionById = ref<Record<string, 'starting' | 'pausing' | 'resuming' | 'resetting' | null>>({})
    const displayMotionTimers = new Map<string, ReturnType<typeof setTimeout>>()
    const finishImpactId = ref<string | null>(null)
    let finishImpactTimer: ReturnType<typeof setTimeout> | null = null
    const favoriteTransfer = ref<{ id: string | null; direction: 'to-favorite' | 'from-favorite' | null }>({ id: null, direction: null })
    let favoriteTransferTimer: ReturnType<typeof setTimeout> | null = null
    const actionCardState = ref<{ id: string | null; label: string; tone: 'start' | 'pause' | 'reset' | 'lap' | null; seq: number }>({ id: null, label: '', tone: null, seq: 0 })
    let actionCardTimer: ReturnType<typeof setTimeout> | null = null

    const openValidationPopup = (errors: string[]) => {
        validationErrorMessages.value = Array.isArray(errors) ? errors : [String(errors)]
        showValidationPopup.value = true
    }
    const closeValidationPopup = () => {
        showValidationPopup.value = false
        validationErrorMessages.value = []
    }

    const openDeletePopup = (action: () => void) => {
        deleteAction.value = action
        showDeletePopup.value = true
    }
    const closeDeletePopup = () => {
        showDeletePopup.value = false
        deleteAction.value = null
        pendingDeleteTimer.value = null
        pendingDeleteEvent.value = null
    }
    const confirmDeleteAction = () => {
        if (deleteAction.value) {
            deleteAction.value()
            closeDeletePopup()
            return
        }

        const timer = pendingDeleteTimer.value
        if (!timer) {
            closeDeletePopup()
            return
        }

        clearDeleteTrashTimer()

        const fallbackX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0
        const fallbackY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
        const startX = pendingDeleteEvent.value?.clientX ?? fallbackX
        const startY = pendingDeleteEvent.value?.clientY ?? Math.max(140, fallbackY - 40)
        const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : startX
        const targetY = typeof window !== 'undefined' ? window.innerHeight - 84 : startY

        deleteCardTimerId.value = timer.id
        deleteTrashState.value = {
            visible: true,
            itemName: timer.name || 'Timer',
            startX,
            startY,
            deltaX: targetX - startX,
            deltaY: targetY - startY,
        }

        deleteTrashTimer = setTimeout(() => {
            hideDeleteTrash()
            void (async () => {
                nextTick(() => closeTimerPopup())

                if (isGuest.value) {
                    timersStore.items = timersStore.items.filter(t => t.id !== timer.id)
                } else {
                    await timersStore.remove(timer.id)
                }

                props.addToast?.('Timer gelöscht', 'delete')
                await nextTick()
            })()
        }, 860)

        closeDeletePopup()
    }

    const deleteTrashFlightStyle = computed(() => ({
        left: `${deleteTrashState.value.startX}px`,
        top: `${deleteTrashState.value.startY}px`,
        '--delete-fly-x': `${deleteTrashState.value.deltaX}px`,
        '--delete-fly-y': `${deleteTrashState.value.deltaY}px`,
    }))

    const clearDeleteTrashTimer = () => {
        if (deleteTrashTimer) {
            clearTimeout(deleteTrashTimer)
            deleteTrashTimer = null
        }
    }

    const clearFinishImpactTimer = () => {
        if (finishImpactTimer) {
            clearTimeout(finishImpactTimer)
            finishImpactTimer = null
        }
    }

    const hideDeleteTrash = () => {
        clearDeleteTrashTimer()
        deleteCardTimerId.value = null
        deleteTrashState.value = {
            visible: false,
            itemName: '',
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
        }
    }

    const triggerFinishImpact = (id: string) => {
        clearFinishImpactTimer()
        finishImpactId.value = id
        triggerDisplayMotion(id, 'resetting')
        finishImpactTimer = setTimeout(() => {
            if (finishImpactId.value === id) finishImpactId.value = null
            finishImpactTimer = null
        }, 920)
    }

    const makeId = () => {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    }

    const LS_TIMER_SINGLE_KEY = 'tyg.guest.timer.single.v1'

    const makeDefaultGuestTimer = (): any => ({
        id: 'guest-timer-1',          // bewusst stabil, damit Update easy
        name: 'Timer',
        sortIndex: 0,
        isFavorite: false,

        secondsPreset: '60',
        seconds: '60',
        customSeconds: null,
        sound: 'standard',

        time: 60,
        isRunning: false,
    })

    const pickPrimaryTimer = (list: any[]) => {
        if (!Array.isArray(list) || !list.length) return null
        const bySort = [...list].sort((a, b) => (a?.sortIndex ?? 9999) - (b?.sortIndex ?? 9999))
        return bySort[0] ?? list[0]
    }

    const loadGuestSingleTimer = () => {
        let parsed: any = null
        try {
            const raw = localStorage.getItem(LS_TIMER_SINGLE_KEY)
            parsed = raw ? JSON.parse(raw) : null
        } catch { /* ignore */ }

        const base = parsed && typeof parsed === 'object'
            ? { ...makeDefaultGuestTimer(), ...parsed }
            : makeDefaultGuestTimer()

        // hart erzwingen: Guest hat nach Refresh GENAU 1 Timer
        timersStore.items = [{ ...base, isRunning: false, sortIndex: 0 }]
    }

    const persistGuestSingleTimer = () => {
        const primary = pickPrimaryTimer(timersStore.items as any[])
        const base = primary ? { ...makeDefaultGuestTimer(), ...primary } : makeDefaultGuestTimer()

        // IMPORTANT: niemals Running-State persistieren
        base.isRunning = false
        base.time = Number.isFinite(base.time) ? base.time : 60
        base.sortIndex = 0
        base.id = 'guest-timer-1'

        try {
            localStorage.setItem(LS_TIMER_SINGLE_KEY, JSON.stringify(base))
        } catch { /* ignore */ }
    }

    const makeUniqueTimerName = (rawName: string, excludeId?: string): string => {
        const base = (rawName || '').trim() || 'Timer'
        const existing = new Set(
            timers.value
                .filter(t => !excludeId || t.id !== excludeId)
                .map(t => (t.name || 'Timer').trim().toLowerCase())
        )

        if (!existing.has(base.toLowerCase())) return base

        let i = 2
        while (existing.has(`${base} (${i})`.toLowerCase())) i++
        return `${base} (${i})`
    }

    const formatTimerDisplay = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = time % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const formatTimerDisplayHead = (time: number) => {
        const minutes = Math.floor(time / 60)
        return `${minutes}:`
    }

    const formatTimerDisplayTail = (time: number) => {
        const seconds = Math.max(0, Math.floor(time % 60))
        return seconds.toString().padStart(2, '0')
    }

    const getTimerDurationSeconds = (timer: TimerInstance) => {
        const preset = String((timer as any).secondsPreset ?? timer.seconds ?? '')
        if (preset === 'custom') {
            const custom = Number(timer.customSeconds ?? 0)
            return Number.isFinite(custom) && custom > 0 ? custom : 0
        }
        const presetValue = Number(timer.seconds ?? 0)
        return Number.isFinite(presetValue) && presetValue > 0 ? presetValue : 0
    }

    const getTimerDangerMix = (timer: TimerInstance) => {
        const remaining = Math.max(0, Math.ceil(Number(timer.time ?? 0)))
        if (remaining <= 0) return 1
        if (remaining > 5) return 0
        return Math.max(0, Math.min(1, (6 - remaining) / 5))
    }

    const isTimerEnding = (timer: TimerInstance) =>
        !!timer.isRunning && Math.ceil(Number(timer.time ?? 0)) > 0 && Math.ceil(Number(timer.time ?? 0)) <= 5

    const timerDisplayStyle = (timer: TimerInstance) => {
        const mix = getTimerDangerMix(timer)
        if (mix <= 0) return {}
        const tint = `color-mix(in srgb, var(--text-primary) ${Math.max(0, 100 - mix * 78).toFixed(0)}%, #ef4444 ${(mix * 78).toFixed(0)}%)`
        return {
            color: tint,
            '--timer-alert-accent': tint,
        }
    }

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

    const handleStartTimer = (timer: TimerInstance) => {
        const total = getTimerDurationSeconds(timer)
        const isResume = total > 0 && timer.time > 0 && timer.time < total
        triggerDisplayMotion(timer.id, isResume ? 'resuming' : 'starting')
        triggerActionCardLabel(timer.id, 'Start', 'start')
        props.startTimer(timer)
    }

    const handlePauseTimer = (timer: TimerInstance) => {
        triggerDisplayMotion(timer.id, 'pausing')
        triggerActionCardLabel(timer.id, 'Stop', 'pause')
        props.stopTimer(timer)
    }

    const handleResetTimer = (timer: TimerInstance) => {
        triggerDisplayMotion(timer.id, 'resetting')
        triggerActionCardLabel(timer.id, 'Reset', 'reset')
        props.resetTimer(timer)
    }

    const onReorderTimers = async (list: TimerInstance[]) => {

        if (isGuest.value) {

            timersStore.items = list.map((t: any, i) => ({
                ...t,
                sortIndex: i
            }))

            return
        }

        const orderedIds = list.map(t => t.id)
        await timersStore.reorder(orderedIds)
    }

    const openAddTimerPopup = () => {
        namePopupMode.value = 'add'
        editingTimerId.value = null
        namePopupValue.value = ''
        showNamePopup.value = true
    }

    const openRenameTimerPopup = (id: string) => {
        const t = timers.value.find(x => x.id === id)
        if (!t) {
            props.addToast?.('Timer nicht gefunden', 'delete')
            return
        }

        namePopupMode.value = 'rename'
        editingTimerId.value = id
        namePopupValue.value = (t.name || 'Timer').trim()
        showNamePopup.value = true
    }

    const closeNamePopup = () => {
        showNamePopup.value = false
        namePopupValue.value = ''
        editingTimerId.value = null
        namePopupMode.value = 'add'
    }

    const saveNamePopup = async () => {

        // ADD
        if (namePopupMode.value === 'add') {
            const uniqueName = makeUniqueTimerName(namePopupValue.value)

            if (isGuest.value) {
                const created: any = {
                    id: makeId(),
                    name: uniqueName,
                    sortIndex: timersStore.items.length,
                    isFavorite: false,

                    // Presets / Settings
                    secondsPreset: '60',
                    seconds: '60',
                    customSeconds: null,
                    sound: 'standard',

                    // Laufzeit-State (muss zu deinem Timer-System passen)
                    time: 60,
                    isRunning: false,
                }

                timersStore.items = [created, ...timersStore.items]
                props.addToast?.('Timer hinzugefügt', 'add')
                closeNamePopup()
                revealTimerCard(created.id)
                await scrollToTimerCard(created.id)
                return
            }

            await timersStore.create(uniqueName)

            // sicherstellen, dass wir die neue ID im Store haben
            await timersStore.load()

            props.addToast?.('Timer hinzugefügt', 'add')
            closeNamePopup()

            const created = timers.value.find(t => (t.name || 'Timer').trim() === uniqueName)
            if (created) {
                revealTimerCard(created.id)
                await scrollToTimerCard(created.id)
            }

            return
        }

        // RENAME
        const id = editingTimerId.value
        if (!id) return

        const current = timers.value.find(x => x.id === id)
        const oldName = (current?.name || 'Timer').trim()
        const uniqueName = makeUniqueTimerName(namePopupValue.value, id)

        if (isGuest.value) {
            await patchTimer(id, { name: uniqueName })
            props.addToast?.('Timername aktualisiert', 'timer')
            void triggerRenameForge(id, oldName, uniqueName)
            closeNamePopup()
            return
        }

        await timersStore.update(id, { name: uniqueName } as any)
        props.addToast?.('Timername aktualisiert', 'timer')
        void triggerRenameForge(id, oldName, uniqueName)
        closeNamePopup()
    }


    const openDeleteTimerPopup = (timer: TimerInstance, event?: MouseEvent) => {
        if (timers.value.length <= 1) {
            openValidationPopup(['Mindestens ein Timer muss geöffnet bleiben'])
            return
        }
        pendingDeleteTimer.value = timer
        pendingDeleteEvent.value = event ?? null
        showDeletePopup.value = true
    }

    const toggleFavoriteTimer = async (id: string) => {

        const cur: any = timers.value.find(t => t.id === id)
        if (!cur) return

        const nextFav = !cur.isFavorite
        if (favoriteTransferTimer) clearTimeout(favoriteTransferTimer)
        favoriteTransfer.value = { id, direction: nextFav ? 'to-favorite' : 'from-favorite' }
        favoriteTransferTimer = setTimeout(() => {
            favoriteTransfer.value = { id: null, direction: null }
            favoriteTransferTimer = null
        }, 920)

        if (!nextFav) {
            await new Promise((resolve) => setTimeout(resolve, 280))
        }

        if (isGuest.value) {
            await patchTimer(id, { isFavorite: nextFav })
        } else {
            await timersStore.update(id, { isFavorite: nextFav })
        }

        props.addToast?.(
            nextFav ? 'Timer zu Favoriten hinzugefügt' : 'Timer aus Favoriten entfernt',
            nextFav ? 'add' : 'delete'
        )
    }

    const patchTimer = async (id: string, patch: {
        name?: string | null
        secondsPreset?: string | null
        seconds?: string | null
        customSeconds?: number | null
        sound?: string | null
        isFavorite?: boolean | null
        isVisible?: boolean | null
        shouldStaySticky?: boolean | null
    }) => {

        if (isGuest.value) {
            const base: any = timersStore.items.find(t => t.id === id)
            if (!base) return

            Object.assign(base, patch)

            timersStore.items = [...timersStore.items]
            return
        }

        await timersStore.update(id, patch as any)
    }

    const onSecondsChange = async (id: string, e: Event) => {
        const value = eventValue(e)
        if (!value) return

        if (value === 'custom') {
            const current = timers.value.find(t => t.id === id)
            const cs = current?.customSeconds ?? current?.time ?? 60

            await patchTimer(id, {
                secondsPreset: 'custom',
                seconds: 'custom',
                customSeconds: Math.max(1, cs),
            })
            return
        }

        // 60/90/120 -> selected + custom input aus
        await patchTimer(id, {
            secondsPreset: value,
            seconds: value,
            customSeconds: null,
        })
    }

    const onCustomSecondsInput = async (id: string, e: Event) => {
        const raw = (e.target as HTMLInputElement | null)?.value ?? ''
        if (!raw) {
            await patchTimer(id, { secondsPreset: 'custom', seconds: 'custom', customSeconds: null })
            return
        }

        const num = Math.floor(Number(raw))
        if (!Number.isFinite(num) || num <= 0) return

        await patchTimer(id, { secondsPreset: 'custom', seconds: 'custom', customSeconds: num })
    }

    const onSoundChange = async (id: string, e: Event) => {
        const value = eventValue(e)
        if (!value) return

        // ab jetzt soll es NICHT mehr als Placeholder wirken
        getMeta(id).soundTouched = true

        await patchTimer(id, { sound: value })
    }

    const closeTimerPopup = () => {
        stopAllTimerSounds()
        showTimerPopup.value = false
    }

    // === Sound / Notification (1:1 Logik, nur lokal) ===============================
    const audioPaths = {
        standard: '/sounds/standard.mp3',
        alarm: '/sounds/alarm.mp3',
        beep: '/sounds/beep.mp3',
        dong: '/sounds/dong.mp3',
        decide: '/sounds/decide.mp3',
    } as const

    const initAudioElements = () => {
        Object.entries(audioPaths).forEach(([key, path]) => {
            const audio = document.getElementById(`audio-${key}`) as HTMLAudioElement | null
            if (audio) audio.src = path
        })
    }

    const playTimerSound = (sound: string) => {
        // keine Überlappung + später einfacher zu stoppen
        stopAllTimerSounds()

        const audio = document.getElementById(`audio-${sound}`) as HTMLAudioElement | null
        if (audio && audio.src) {
            try {
                audio.currentTime = 0
                void audio.play()
            } catch (e) {
                console.error('Fehler beim Abspielen des Sounds:', e)
                props.addToast?.('Sound konnte nicht abgespielt werden', 'delete')
            }
        }
    }

    const stopAllTimerSounds = () => {
        Object.keys(audioPaths).forEach((key) => {
            const audio = document.getElementById(`audio-${key}`) as HTMLAudioElement | null
            if (!audio) return
            audio.pause()
            audio.currentTime = 0
        })
    }
    const sendNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body })
            if ('vibrate' in navigator) navigator.vibrate([300, 100, 300])
        }
    }

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('🔔 Benachrichtigungen aktiviert!')
                }
            })
        }
    }

    const prevTimes = new Map<string, number>()
    const finishedOnce = new Set<string>()

    watch(
        () => timers.value.map(t => ({ id: t.id, time: t.time, sound: t.sound })),
        (now) => {
            for (const { id, time, sound } of now) {
                const prev = prevTimes.get(id)

                if (prev === undefined) {
                    prevTimes.set(id, time)
                    continue
                }

                if (prev > 0 && time <= 0 && !finishedOnce.has(id)) {
                    finishedOnce.add(id)
                    triggerFinishImpact(id)
                    showTimerPopup.value = true
                    playTimerSound(sound || 'standard')
                    sendNotification('Timer fertig', 'Deine Satzpause ist vorbei 💪')
                    props.dismissToast?.(true)

                    const timer = timers.value.find(t => t.id === id)
                    if (timer && timer.isRunning) props.stopTimer(timer)
                }

                if (time > 0 && finishedOnce.has(id)) {
                    finishedOnce.delete(id)
                }

                prevTimes.set(id, time)
            }
        }
    )

    watch(
        () => isGuest.value ? timersStore.items : null,
        () => {
            if (!isGuest.value) return

            // wenn Guest irgendwie 0 hat -> sofort default rein
            if (!timersStore.items.length) {
                timersStore.items = [makeDefaultGuestTimer()]
            }

            // persistiert NUR den Primary Timer, Extras werden bewusst nicht gesichert
            persistGuestSingleTimer()
        },
        { deep: true }
    )

    watch(
        () => timers.value.map(t => t.id),
        (ids) => {
            const alive = new Set(ids)

            // prevTimes cleanup
            for (const key of prevTimes.keys()) {
                if (!alive.has(key)) prevTimes.delete(key)
            }

            // finishedOnce cleanup
            for (const key of Array.from(finishedOnce)) {
                if (!alive.has(key)) finishedOnce.delete(key)
            }

            // meta cleanup
            for (const key of Object.keys(metaById.value)) {
                if (!alive.has(key)) delete metaById.value[key]
            }
        },
        { immediate: true }
    )

    onMounted(async () => {
        requestNotificationPermission()
        initAudioElements()

        if (isGuest.value) {
            loadGuestSingleTimer()      // lädt 1 aus LocalStorage ODER seedet 1
            persistGuestSingleTimer()   // direkt einmal speichern, damit Key safe existiert
            return
        }

        await timersStore.load()

        // Account: falls API aus irgendeinem Grund 0 liefert -> 1 erstellen
        if (!timersStore.items.length) {
            await timersStore.create('Timer')
            await timersStore.load()
        }
    })

    onUnmounted(() => {
        clearFinishImpactTimer()
        stopAllTimerSounds()
        prevTimes.clear()
        finishedOnce.clear()
        displayMotionTimers.forEach((timeout) => clearTimeout(timeout))
        displayMotionTimers.clear()
        metaById.value = {}
        clearDeleteTrashTimer()
        if (favoriteTransferTimer) clearTimeout(favoriteTransferTimer)
        if (actionCardTimer) clearTimeout(actionCardTimer)
    })

</script>

<style scoped>

    .workout-list {
        margin-top: 0.5rem;
        width: 100%;
        max-width: var(--section-max, 1200px);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 0.5rem;
        box-sizing: border-box;
        overflow-x: visible;
    }

    /* Container-Layout wie bei .stopwatch-top */
    .timer-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        position: relative;
        margin: 0 auto;
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
        animation: timer-favorite-label-rise 1.02s cubic-bezier(0.2, 0.82, 0.24, 1) both, timer-favorite-label-glow 1.02s ease-in-out both;
    }

    .delete-trash-flight__title {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: .92rem;
        font-weight: 800;
        color: var(--text-primary);
        opacity: .46;
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

    .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        position: relative;
    }

    /* exakt wie Stopwatch: Title + Add in der Mitte */
    .timer-container .plan-header {
        justify-content: center;
        gap: .75rem;
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }


    html.dark-mode .section-title {
        color: #ffffff;
    }

    .drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem; /* Abstand zwischen den Cards wie vorher */
        width: 100%;
    }

    .drag-stack--sorting .timer-card {
        transition: transform .34s cubic-bezier(.18, .9, .2, 1), box-shadow .34s cubic-bezier(.18, .9, .2, 1), border-color .26s ease, filter .26s ease;
    }

        .drag-stack > .timer-card {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
        }

    .drag-ghost {
        opacity: 0.6;
    }

    .timer-drag-handle {
        cursor: grab;
        user-select: none;
        margin-right: .5rem;
    }

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
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
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
        box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
    }

    .timer-card--new {
        animation: timer-card-reveal .86s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .timer-card--finish-impact {
        animation: timer-card-finish-impact .92s cubic-bezier(.18, .9, .2, 1);
    }

    .timer-card--finish-impact::after {
        animation: timer-card-finish-ring .92s cubic-bezier(.18, .9, .2, 1);
    }

    @keyframes timer-card-reveal {
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

    @keyframes timer-card-finish-impact {
        0% {
            transform: translateY(0) scale(1);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        }

        18% {
            transform: translateY(2px) scale(.982);
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
        }

        42% {
            transform: translateY(-3px) scale(1.022);
            box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.32), 0 26px 56px rgba(59, 130, 246, 0.22);
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    @keyframes timer-card-finish-ring {
        0% {
            opacity: 0;
            transform: scale(.82);
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0);
        }

        24% {
            opacity: .42;
        }

        100% {
            opacity: 0;
            transform: scale(1.18);
            box-shadow: 0 0 0 28px rgba(96, 165, 250, 0), 0 0 54px rgba(96, 165, 250, 0);
        }
    }

    @keyframes timer-favorite-border-sanctified {
        0%, 100% {
            box-shadow:
                0 0 0 1px rgba(255, 244, 214, 0.68),
                0 0 0 2px rgba(245, 158, 11, 0.42),
                0 10px 26px rgba(245, 158, 11, 0.08);
        }

        50% {
            box-shadow:
                0 0 0 1px rgba(255, 248, 220, 0.82),
                0 0 0 2px rgba(250, 204, 21, 0.56),
                0 0 18px rgba(250, 204, 21, 0.18);
        }
    }

    @keyframes timer-favorite-holy-rise {
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

    @keyframes timer-favorite-holy-aura {
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

    @keyframes timer-favorite-holy-sparkles {
        0%, 100% {
            opacity: .32;
            transform: translateY(0) scale(1);
        }

        50% {
            opacity: .8;
            transform: translateY(-4px) scale(1.06);
        }
    }

    @keyframes timer-favorite-fall {
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

    @keyframes timer-favorite-border-release {
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

    @keyframes timer-favorite-release-trail {
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

    @keyframes timer-favorite-label-rise {
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

    @keyframes timer-favorite-label-glow {
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
        box-shadow:
            0 18px 40px rgba(15, 23, 42, 0.22),
            0 0 0 1px rgba(255, 244, 214, 0.62),
            0 0 0 2px rgba(245, 158, 11, 0.34),
            0 10px 26px rgba(245, 158, 11, 0.08);
        animation: timer-favorite-border-sanctified 3.4s ease-in-out infinite;
    }

    .timer-card--delete-pulse {
        box-shadow:
            0 24px 48px rgba(239, 68, 68, 0.16),
            0 18px 40px rgba(15, 23, 42, 0.22);
        border-color: rgba(248, 113, 113, 0.42);
    }

    .timer-card--action-pulse {
        box-shadow:
            0 22px 44px rgba(15, 23, 42, 0.24),
            0 18px 40px rgba(15, 23, 42, 0.22);
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
        animation: delete-card-sanctified-rise .92s cubic-bezier(0.2, 0.82, 0.24, 1) both, timer-favorite-label-glow .92s ease-in-out both;
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
        animation: delete-card-sanctified-rise .92s cubic-bezier(0.2, 0.82, 0.24, 1) both, timer-favorite-label-glow .92s ease-in-out both;
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
        animation: timer-favorite-holy-rise 1.28s cubic-bezier(0.18, 0.88, 0.24, 1.08) both;
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
        animation: timer-favorite-holy-aura 1.18s cubic-bezier(0.2, 0.82, 0.24, 1) both;
    }

    .timer-card--favorite-transfer-in::after {
        background: linear-gradient(135deg, rgba(250, 204, 21, 0.12), rgba(251, 191, 36, 0.18), rgba(250, 204, 21, 0));
        border: 2px solid rgba(250, 204, 21, 0.92);
        box-shadow: 0 0 0 1px rgba(255, 244, 214, 0.78), 0 0 26px rgba(250, 204, 21, 0.36), 0 0 54px rgba(245, 158, 11, 0.18);
        animation: timer-card-finish-ring .84s cubic-bezier(0.22, 0.61, 0.36, 1) both, timer-favorite-holy-sparkles .96s ease-in-out 2;
    }

    .timer-card--favorite-transfer-out {
        border-color: rgba(245, 158, 11, 0.24);
        animation: timer-favorite-fall .76s cubic-bezier(0.24, 0.76, 0.22, 1) both;
    }

    .timer-card--favorite-transfer-out::before {
        background: radial-gradient(circle at 50% 12%, rgba(255, 248, 220, 0.32), rgba(255, 248, 220, 0) 42%), linear-gradient(180deg, rgba(250, 204, 21, 0.14), rgba(245, 158, 11, 0.05) 45%, rgba(245, 158, 11, 0) 100%);
        animation: timer-favorite-release-trail .72s cubic-bezier(0.24, 0.76, 0.22, 1) both;
    }

    .timer-card--favorite-transfer-out::after {
        background: linear-gradient(180deg, rgba(255, 248, 220, 0.12), rgba(250, 204, 21, 0.06) 44%, rgba(250, 204, 21, 0) 100%);
        border: 2px solid rgba(250, 204, 21, 0.92);
        animation: timer-favorite-border-release .7s cubic-bezier(0.24, 0.76, 0.22, 1) both;
    }

    /* Hover wie bei Form-/Preview-Card */
    @media (hover: hover) {
        .timer-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    /* Dark Mode: gleiche Welt wie die anderen Premium-Karten */
    html.dark-mode .timer-card {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .timer-card--favorite {
        border-color: rgba(251, 191, 36, 0.86);
        box-shadow:
            0 22px 55px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 244, 214, 0.18),
            0 0 0 2px rgba(251, 191, 36, 0.56),
            0 0 24px rgba(250, 204, 21, 0.16);
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

    .timer-card[data-running="true"] {
        border-color: rgba(96, 165, 250, 0.85);
        box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.65), 0 20px 46px rgba(15, 23, 42, 0.55);
        transform: translateY(-1px) scale(1.01);
    }

        .timer-card[data-running="true"] .timer-display {
            box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(96, 165, 250, 0.7), 0 0 24px rgba(96, 165, 250, 0.45);
            transform: scale(1.02);
        }

    /* Dark-Mode: etwas kühleres Blau-Grün beim Active-Glow */
    html.dark-mode .timer-card[data-running="true"] {
        border-color: rgba(129, 140, 248, 0.95);
        box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.85), 0 24px 52px rgba(0, 0, 0, 0.9);
    }

    .timer-card--favorite[data-running="true"] {
        border-color: rgba(245, 158, 11, 0.82);
        box-shadow:
            0 0 0 1px rgba(255, 244, 214, 0.62),
            0 0 0 2px rgba(245, 158, 11, 0.36),
            0 20px 46px rgba(15, 23, 42, 0.55),
            0 0 20px rgba(250, 204, 21, 0.12);
    }

    html.dark-mode .timer-card--favorite[data-running="true"] {
        border-color: rgba(251, 191, 36, 0.92);
        box-shadow:
            0 0 0 1px rgba(255, 244, 214, 0.16),
            0 0 0 2px rgba(251, 191, 36, 0.6),
            0 24px 52px rgba(0, 0, 0, 0.9),
            0 0 22px rgba(250, 204, 21, 0.18);
    }

        html.dark-mode .timer-card[data-running="true"] .timer-display {
            box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(129, 140, 248, 0.9), 0 0 26px rgba(129, 140, 248, 0.75);
        }

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
        animation: timer-favorite-label-rise 1.18s cubic-bezier(0.2, 0.82, 0.24, 1) both, timer-favorite-label-glow 1.18s ease-in-out both;
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
        animation: timer-rename-title-settle 1.02s cubic-bezier(0.18, 0.9, 0.2, 1) both;
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
        animation: timer-rename-old .46s ease-in both;
    }

    .timer-name-rename-overlay__handwrite {
        color: inherit;
        font-family: inherit;
        font-weight: inherit;
        text-shadow: none;
        overflow: hidden;
        width: 0;
        border-right: 2px solid currentColor;
        animation: timer-rename-handwrite .82s steps(24, end) .44s both;
    }

    .timer-name-rename-overlay__final {
        color: inherit;
        text-shadow: none;
        opacity: 0;
        animation: timer-rename-final .14s linear 1.22s both;
    }

    .timer-card--rename-forge .timer-header {
        isolation: isolate;
    }

    .timer-card--rename-forge {
        animation: timer-rename-card-pulse .92s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .timer-card--rename-forge::after {
        content: "";
        position: absolute;
        inset: -6px;
        border-radius: inherit;
        border: 1px solid rgba(125, 211, 252, 0.72);
        box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.42), 0 0 36px rgba(59, 130, 246, 0.24);
        pointer-events: none;
        animation: timer-rename-card-ring 1.28s cubic-bezier(0.16, 1, 0.3, 1) both;
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

    .timer-display.is-ending {
        border-color: color-mix(in srgb, var(--timer-alert-accent, #ef4444) 58%, transparent);
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 0 0 1px color-mix(in srgb, var(--timer-alert-accent, #ef4444) 32%, transparent),
            0 14px 30px color-mix(in srgb, var(--timer-alert-accent, #ef4444) 24%, transparent);
        text-shadow: 0 0 14px color-mix(in srgb, var(--timer-alert-accent, #ef4444) 36%, transparent);
    }

    .timer-display__head,
    .timer-display__tail {
        display: inline-block;
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

    @keyframes timer-rename-old {
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

    @keyframes timer-rename-handwrite {
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

    @keyframes timer-rename-final {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }

    @keyframes timer-rename-title-settle {
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

    @keyframes timer-rename-card-pulse {
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

    @keyframes timer-rename-card-ring {
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

    .timer-card--finish-impact .timer-display {
        animation: timer-display-finish-snap .72s cubic-bezier(.18, .9, .2, 1);
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

    @keyframes timer-display-finish-snap {
        0% {
            transform: scale(1);
            letter-spacing: 0.02em;
            filter: saturate(1);
        }

        22% {
            transform: scale(.92);
            letter-spacing: -0.03em;
            filter: saturate(.9);
        }

        54% {
            transform: scale(1.08);
            letter-spacing: -0.05em;
            box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14), 0 20px 44px rgba(59, 130, 246, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        100% {
            transform: scale(1);
            letter-spacing: 0.02em;
            filter: saturate(1);
        }
    }

    .timer-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        width: 100%;
    }

    .timer-input-group {
        display: flex;
        gap: 0.5rem;
        width: 100%;
        justify-content: center;
    }

    .timer-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    /* ===== Smart Presets UI ===== */
    .smart-presets {
        width: 100%;
        max-width: 520px;
        display: flex;
        flex-direction: column;
        gap: .65rem;
        margin-top: .15rem;
    }

    .smart-goals {
        display: flex;
        gap: .5rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .smart-goal {
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: color-mix(in srgb, var(--bg-card) 70%, transparent);
        color: var(--text-primary);
        border-radius: 999px;
        padding: .45rem .75rem;
        font-weight: 900;
        font-size: .85rem;
        cursor: pointer;
        user-select: none;
        transition: transform .15s ease, opacity .15s ease, border-color .15s ease, box-shadow .15s ease;
        opacity: .85;
    }

        .smart-goal:hover {
            opacity: 1;
            transform: translateY(-1px);
            border-color: rgba(148, 163, 184, 0.32);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
        }

        .smart-goal.is-active {
            opacity: 1;
            border-color: color-mix(in srgb, var(--accent-primary) 45%, rgba(148, 163, 184, 0.22));
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
            transform: translateY(-1px);
        }

    .smart-suggest {
        display: flex;
        flex-direction: column;
        gap: .55rem;
        align-items: center;
    }

    .smart-line {
        display: inline-flex;
        align-items: baseline;
        gap: .5rem;
        opacity: .9;
        font-weight: 900;
        font-size: .85rem;
        text-align: center;
        flex-wrap: wrap;
        justify-content: center;
    }

    .smart-label {
        opacity: .75;
        font-weight: 900;
    }

    .smart-value {
        font-family: 'Roboto Mono', monospace;
        letter-spacing: 0.02em;
    }

    .smart-chips {
        display: flex;
        gap: .5rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    .smart-chip {
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: color-mix(in srgb, var(--bg-card) 70%, transparent);
        color: var(--text-primary);
        border-radius: 999px;
        padding: .4rem .7rem;
        font-weight: 950;
        font-size: .85rem;
        cursor: pointer;
        user-select: none;
        transition: transform .15s ease, opacity .15s ease, border-color .15s ease, box-shadow .15s ease;
        opacity: .9;
    }

        .smart-chip:hover {
            opacity: 1;
            transform: translateY(-1px);
            border-color: rgba(148, 163, 184, 0.32);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
        }

        .smart-chip.is-primary {
            border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(148, 163, 184, 0.22));
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
            opacity: 1;
        }

    @media (max-width: 560px) {
        .timer-drag-handle {
            display: none;
        }
    }

    /* Mobile wrapping wie in Training.vue */
    @media (max-width: 560px) {
        .timer-buttons,
        .timer-input-group {
            flex-wrap: wrap;
        }
    }

    @media (max-width: 420px) {
        .timer-display {
            font-size: 2.4rem;
        }

        .drag-stack > .timer-card {
            touch-action: pan-y; /* Scroll weiter möglich, Drag wird sauber erkannt */
            -webkit-user-select: none;
            user-select: none;
        }
    }

    .timer-container {
        margin: 0 auto 2.25rem; /* bottom space */
    }

    /* Drag feel */
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

    .drag-ghost {
        opacity: 0.35;
        transform: scale(0.98) rotate(.4deg);
        filter: saturate(.88);
    }

    /* verhindert Textauswahl + weird highlight beim Ziehen */
    .timer-card,
    .timer-card * {
        -webkit-user-select: none;
        user-select: none;
    }


    /* ===== Quiet UI Toggles ===== */
    .mini-toggle {
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: color-mix(in srgb, var(--bg-card) 70%, transparent);
        color: var(--text-primary);
        border-radius: 999px;
        padding: .55rem .8rem;
        font-weight: 900;
        font-size: .85rem;
        cursor: pointer;
        opacity: .9;
        transition: transform .15s ease, opacity .15s ease, border-color .15s ease, box-shadow .15s ease;
    }

        .mini-toggle:hover {
            opacity: 1;
            transform: translateY(-1px);
            border-color: rgba(148, 163, 184, 0.32);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }

        .mini-toggle.is-open {
            opacity: 1;
            border-color: color-mix(in srgb, var(--accent-primary) 45%, rgba(148, 163, 184, 0.22));
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
        }

    .smart-panel,
    .advanced-panel {
        width: 100%;
        max-width: 520px;
        display: flex;
        flex-direction: column;
        gap: .6rem;
        padding: .75rem .85rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    html.dark-mode .smart-panel,
    html.dark-mode .advanced-panel {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 12%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 9%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.72);
    }

    .timer-panel-accordion-enter-active,
    .timer-panel-accordion-leave-active {
        overflow: hidden;
        transform-origin: top center;
        will-change: max-height, opacity, transform;
    }

    .timer-panel-accordion-enter-active {
        transition: max-height .34s cubic-bezier(0.22, 1, 0.36, 1), opacity .22s ease, transform .34s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .timer-panel-accordion-leave-active {
        transition: max-height .24s cubic-bezier(0.4, 0, 0.2, 1), opacity .16s ease, transform .2s ease;
    }

    .timer-panel-accordion-enter-from,
    .timer-panel-accordion-leave-to {
        max-height: 0;
        opacity: 0;
        transform: translateY(-4px) scale(0.992);
    }

    .timer-panel-accordion-enter-to,
    .timer-panel-accordion-leave-from {
        max-height: 420px;
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    .timer-panel-accordion-enter-active .smart-panel,
    .timer-panel-accordion-enter-active .advanced-panel {
        animation: timer-panel-inner-rise .34s cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes timer-panel-inner-rise {
        0% {
            opacity: 0.2;
            transform: translateY(-6px);
        }

        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }


    .smart-summary {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: .6rem;
        flex-wrap: wrap;
    }

    .smart-text {
        font-size: .9rem;
        opacity: .92;
    }

    .smart-apply,
    .smart-more {
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: color-mix(in srgb, var(--bg-card) 70%, transparent);
        color: var(--text-primary);
        border-radius: 999px;
        padding: .45rem .75rem;
        font-weight: 950;
        font-size: .85rem;
        cursor: pointer;
        transition: transform .15s ease, opacity .15s ease, border-color .15s ease, box-shadow .15s ease;
    }

    .smart-apply {
        border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(148, 163, 184, 0.22));
    }

        .smart-apply:hover,
        .smart-more:hover {
            transform: translateY(-1px);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        }

    @media (max-width: 560px) {
        .mini-toggle {
            padding: .5rem .75rem;
        }
    }

    .timer-scroll-highlight {
        outline: 2px solid color-mix(in srgb, var(--accent-primary) 60%, transparent);
        outline-offset: 6px;
        border-radius: 18px;
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent-primary) 12%, transparent);
        transition: outline-color .18s ease, box-shadow .18s ease;
    }
</style>
