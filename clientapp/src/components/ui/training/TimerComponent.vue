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
                   @update:modelValue="onReorderTimers">
            <template #item="{ element: timer }">
                <div class="timer-card"
                     :key="timer.id"
                     :data-timer-id="timer.id"
                     :data-running="timer.isRunning ? 'true' : 'false'"
                     data-type="timer">
                    <div class="timer-header">
                        <span class="timer-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                        <span class="timer-name" @dblclick="openRenameTimerPopup(timer.id)">
                            {{ timer.name || 'Timer' }}
                        </span>

                        <div class="timer-actions">
                            <FavoriteButton :active="timer.isFavorite"
                                            :titleActive="'Aus Favoriten entfernen'"
                                            :titleInactive="'Zu Favoriten hinzufügen'"
                                            @toggle="toggleFavoriteTimer(timer.id)" />
                            <CloseButton title="Timer löschen" variant="timer" @click="openDeleteTimerPopup(timer.id)" />
                        </div>
                    </div>

                    <div class="timer-controls">
                        <span class="timer-display">{{ formatTimerDisplay(timer.time) }}</span>

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

                        <!-- Erweitert: Sound hier rein -->
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

                        <div class="timer-buttons">
                            <StartButton title="Start" @click="props.startTimer(timer)" :disabled="timer.isRunning" />
                            <StopButton title="Stop" @click="props.stopTimer(timer)" :disabled="!timer.isRunning" />
                            <ResetControlButton title="Reset" @click="props.resetTimer(timer)" />
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

    const showValidationPopup = ref(false)
    const validationErrorMessages = ref<string[]>([])

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
    }
    const confirmDeleteAction = () => {
        if (deleteAction.value) deleteAction.value()
        closeDeletePopup()
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
                await nextTick()
                return
            }

            await timersStore.create(uniqueName)
            props.addToast?.('Timer hinzugefügt', 'add')
            closeNamePopup()
            await nextTick()
            return
        }

        // RENAME
        const id = editingTimerId.value
        if (!id) return

        const uniqueName = makeUniqueTimerName(namePopupValue.value, id)

        if (isGuest.value) {
            await patchTimer(id, { name: uniqueName })
            props.addToast?.('Timername aktualisiert', 'timer')
            closeNamePopup()
            return
        }

        await timersStore.update(id, { name: uniqueName } as any)
        props.addToast?.('Timername aktualisiert', 'timer')
        closeNamePopup()
    }


    const openDeleteTimerPopup = (id: string) => {
        if (timers.value.length <= 1) {
            openValidationPopup(['Mindestens ein Timer muss geöffnet bleiben'])
            return
        }

        openDeletePopup(async () => {

            nextTick(() => closeTimerPopup())

            if (isGuest.value) {
                timersStore.items = timersStore.items.filter(t => t.id !== id)
            } else {
                await timersStore.remove(id)
            }

            props.addToast?.('Timer gelöscht', 'delete')
            await nextTick()
        })
    }

    const toggleFavoriteTimer = async (id: string) => {

        const cur: any = timers.value.find(t => t.id === id)
        if (!cur) return

        const nextFav = !cur.isFavorite

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
        stopAllTimerSounds()
        prevTimes.clear()
        finishedOnce.clear()
        metaById.value = {}
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

        html.dark-mode .timer-card[data-running="true"] .timer-display {
            box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(129, 140, 248, 0.9), 0 0 26px rgba(129, 140, 248, 0.75);
        }

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
        transform: scale(1.01);
        cursor: grabbing;
    }

    .dragging {
        cursor: grabbing;
    }

    .drag-ghost {
        opacity: 0.35;
        transform: scale(0.98);
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
</style>

