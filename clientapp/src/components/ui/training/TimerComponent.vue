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
                   :force-fallback="true"
                   :animation="0"
                   direction="vertical"
                   easing="cubic-bezier(0.16,1,0.3,1)"
                   :delay="resolvedDragDelay"
                   :delay-on-touch-only="true"
                   :touch-start-threshold="8"
                   :fallback-tolerance="3"
                   :fallback-on-body="true"
                   :scroll="true"
                   :scroll-sensitivity="40"
                   :scroll-speed="12"
                   :swap-threshold="0.3"
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

                        <span class="timer-name" @click="openTimerNameEdit(timer.id)">
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
                            <select :value="timer.seconds ?? ''"
                                    class="timer-select"
                                    @change="onSecondsChange(timer.id, $event)">
                                <option value="" disabled>Satzpause wählen</option>
                                <option value="60">60 Sekunden</option>
                                <option value="90">90 Sekunden</option>
                                <option value="120">120 Sekunden</option>
                                <option value="custom">Benutzerdefiniert</option>
                            </select>

                            <input v-if="timer.seconds === 'custom'"
                                   :value="timer.customSeconds ?? ''"
                                   @input="onCustomSecondsInput(timer.id, $event)"
                                   placeholder="Sekunden"
                                   type="number"
                                   min="1"
                                   class="timer-input" />

                            <select :value="timer.sound"
                                    class="timer-select"
                                    @change="onSoundChange(timer.id, $event)">
                                <option value="" disabled>Sound wählen</option>
                                <option value="nothing">Keine</option>
                                <option value="standard">Standard</option>
                                <option value="alarm">Alarm</option>
                                <option value="beep">Piep</option>
                                <option value="dong">Dong</option>
                                <option value="decide">One Way Out</option>
                            </select>
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
    <NamePromptPopup :show="showAddTimerPopup"
                     v-model="newTimerName"
                     title="Neuen Timer hinzufügen"
                     placeholder="Timer Name (optional)"
                     overlayClass="timer-popup"
                     @save="addTimer"
                     @cancel="closeAddTimerPopup" />

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
    import { ref, computed, onMounted, nextTick, watch } from 'vue'
    import Draggable from 'vuedraggable'

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

    interface TimerInstance {
        id: string
        name?: string
        seconds: string | null
        customSeconds: number | null
        time: number
        isRunning: boolean
        interval: number | null
        isFavorite: boolean
        sound: string
        isVisible: boolean
        shouldStaySticky: boolean
        left?: number
        top?: number
        startedAtMs?: number
        endsAtMs?: number
        pausedRemaining?: number
    }

    const props = defineProps<{
        timers: TimerInstance[]
        startTimer: (timer: TimerInstance) => void
        stopTimer: (timer: TimerInstance) => void
        resetTimer: (timer: TimerInstance) => void

        dragDelay?: number

        // damit es 1:1 dein existierendes EditPopup nutzt
        openEditPopup?: (...args: any[]) => void

        // damit Toast weiter in Training.vue gerendert wird
        addToast?: (message: string, type?: 'delete' | 'add' | 'save' | 'timer' | 'load') => void
        dismissToast?: (immediate?: boolean) => void
    }>()

    const emit = defineEmits<{
        (e: 'add-timer', timer: TimerInstance): void
        (e: 'remove-timer', id: string): void
        (e: 'reorder-timers', list: TimerInstance[]): void
    }>()

    const timers = computed(() => props.timers)
    const resolvedDragDelay = computed(() => props.dragDelay ?? 0)

    const showTimerPopup = ref(false)
    const showAddTimerPopup = ref(false)
    const newTimerName = ref('')

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

    const makeUniqueTimerName = (rawName: string, excludeId?: string): string => {
        const base = (rawName || '').trim() || 'Timer'
        const existing = new Set(
            props.timers
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

    const openTimerNameEdit = (id: string) => {
        props.openEditPopup?.('timerName', id)
    }

    const onReorderTimers = (list: TimerInstance[]) => emit('reorder-timers', list)

    const openAddTimerPopup = () => {
        newTimerName.value = ''
        showAddTimerPopup.value = true
    }
    const closeAddTimerPopup = () => {
        showAddTimerPopup.value = false
        newTimerName.value = ''
    }

    const addTimer = async () => {
        const uniqueName = makeUniqueTimerName(newTimerName.value)

        const newTimer: TimerInstance = {
            id: makeId(),
            name: uniqueName,
            seconds: '60',
            customSeconds: null,
            time: 60,
            isRunning: false,
            interval: null,
            isFavorite: false,
            sound: 'standard',
            isVisible: true,
            shouldStaySticky: false,
        }

        emit('add-timer', newTimer)
        props.addToast?.('Timer hinzugefügt', 'add')
        closeAddTimerPopup()
        await nextTick()
    }

    const openDeleteTimerPopup = (id: string) => {
        if (props.timers.length <= 1) {
            openValidationPopup(['Mindestens ein Timer muss geöffnet bleiben'])
            return
        }

        openDeletePopup(async () => {
            nextTick(() => closeTimerPopup())
            emit('remove-timer', id)
            props.addToast?.('Timer gelöscht', 'delete')
            await nextTick()
        })
    }

    const toggleFavoriteTimer = (id: string) => {
        const updated = props.timers.map(t =>
            t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
        )

        const changed = updated.find(t => t.id === id)
        if (!changed) return

        const favs = updated.filter(t => t.isFavorite)
        const others = updated.filter(t => !t.isFavorite)
        emit('reorder-timers', [...favs, ...others])

        props.addToast?.(
            changed.isFavorite ? 'Timer zu Favoriten hinzugefügt' : 'Timer aus Favoriten entfernt',
            changed.isFavorite ? 'add' : 'delete'
        )
    }

    const patchTimer = (id: string, patch: Partial<TimerInstance>) => {
        const next = props.timers.map(t => (t.id === id ? { ...t, ...patch } : t))
        emit('reorder-timers', next) // gleiche Reihenfolge, nur updated values
    }

    const onSecondsChange = (id: string, e: Event) => {
        const value = (e.target as HTMLSelectElement | null)?.value ?? ''
        if (!value) return

        if (value === 'custom') {
            const current = props.timers.find(t => t.id === id)
            const cs = current?.customSeconds ?? null
            patchTimer(id, {
                seconds: 'custom',
                time: cs && cs > 0 ? cs : (current?.time ?? 60),
            })
            return
        }

        const secs = Number(value)
        patchTimer(id, {
            seconds: value,
            customSeconds: null,
            time: Number.isFinite(secs) && secs > 0 ? secs : 60,
        })
    }

    const onCustomSecondsInput = (id: string, e: Event) => {
        const raw = (e.target as HTMLInputElement | null)?.value ?? ''
        if (!raw) {
            patchTimer(id, { customSeconds: null })
            return
        }

        const num = Math.floor(Number(raw))
        if (!Number.isFinite(num) || num <= 0) return

        patchTimer(id, {
            seconds: 'custom',
            customSeconds: num,
            time: num,
        })
    }

    const onSoundChange = (id: string, e: Event) => {
        const value = (e.target as HTMLSelectElement | null)?.value ?? ''
        if (!value) return
        patchTimer(id, { sound: value })
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
        () => props.timers.map(t => ({ id: t.id, time: t.time, sound: t.sound })),
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

                    const timer = props.timers.find(t => t.id === id)
                    if (timer && timer.isRunning) props.stopTimer(timer)
                }

                if (time > 0 && finishedOnce.has(id)) {
                    finishedOnce.delete(id)
                }

                prevTimes.set(id, time)
            }
        },
        { deep: true }
    )

    onMounted(() => {
        requestNotificationPermission()
        initAudioElements()
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

    .timer-select,
    .timer-input {
        padding: 0.7rem 0.85rem;
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-card) 70%, transparent);
        border: 1px solid rgba(148, 163, 184, 0.22);
        color: var(--text-primary);
        font-size: 0.92rem;
        width: 165px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }

    html.dark-mode .timer-select,
    html.dark-mode .timer-input {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .timer-select:focus,
    .timer-input:focus {
        outline: none;
        border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(129, 140, 248, 0.55));
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 22%, transparent), 0 10px 24px rgba(15, 23, 42, 0.18);
        transform: translateY(-1px);
    }

    .timer-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
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

        .timer-select,
        .timer-input {
            width: 120px;
        }

        .drag-stack > .timer-card {
            touch-action: pan-y; /* Scroll weiter möglich, Drag wird sauber erkannt */
            -webkit-user-select: none;
            user-select: none;
        }
    }
</style>

