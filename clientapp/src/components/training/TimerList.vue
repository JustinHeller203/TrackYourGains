<template>
    <Draggable :modelValue="props.timers"
               item-key="id"
               handle=".timer-drag-handle"
               :ghost-class="'drag-ghost'"
               :animation="150"
               tag="div"
               class="drag-stack"
               @update:modelValue="val => emit('reorder', val)">
        <template #item="{ element: timer }">
            <div class="timer-card" :key="timer.id" :data-timer-id="timer.id" data-type="timer">
                <div class="timer-header">
                    <span class="timer-drag-handle" title="Ziehen zum Verschieben">⠿</span>
                    <span class="timer-name" @click="emit('edit-name', timer.id)">
                        {{ timer.name || 'Timer' }}
                    </span>
                    <div class="timer-actions">
                        <FavoriteButton :active="timer.isFavorite"
                                        :titleActive="'Aus Favoriten entfernen'"
                                        :titleInactive="'Zu Favoriten hinzufügen'"
                                        @toggle="() => emit('toggle-favorite', timer.id)" />
                        <button class="close-timer-btn" @click="emit('request-delete', timer.id)" title="Timer löschen">✖</button>
                    </div>
                </div>

                <div class="timer-controls">
                    <span class="timer-display">{{ formatTimerDisplay(timer.time) }}</span>

                    <div class="timer-input-group">
                        <select v-model="timer.seconds" class="timer-select" @change="emit('change-seconds', timer)">
                            <option value="" disabled>Satzpause wählen</option>
                            <option value="60">60 Sekunden</option>
                            <option value="90">90 Sekunden</option>
                            <option value="120">120 Sekunden</option>
                            <option value="custom">Benutzerdefiniert</option>
                        </select>

                        <input v-if="timer.seconds === 'custom'"
                               v-model.number="timer.customSeconds"
                               @input="emit('update-custom-seconds', timer)"
                               placeholder="Sekunden"
                               type="number"
                               min="1"
                               class="timer-input" />

                        <select v-model="timer.sound" class="timer-select">
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
                        <button class="timer-btn start-btn" @click="props.startTimer(timer)" :disabled="timer.isRunning">Start</button>
                        <button class="timer-btn stop-btn" @click="props.stopTimer(timer)" :disabled="!timer.isRunning">Stop</button>
                        <button class="timer-btn reset-btn" @click="props.resetTimer(timer)">Reset</button>
                    </div>
                </div>
            </div>
        </template>
    </Draggable>
</template>

<script setup lang="ts">
    import Draggable from 'vuedraggable'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'

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
    }

    const props = defineProps<{
        timers: TimerInstance[]
        startTimer: (t: TimerInstance) => void
        stopTimer: (t: TimerInstance) => void
        resetTimer: (t: TimerInstance) => void
    }>()

    const emit = defineEmits<{
        (e: 'reorder', list: TimerInstance[]): void
        (e: 'toggle-favorite', id: string): void
        (e: 'request-delete', id: string): void
        (e: 'edit-name', id: string): void
        (e: 'change-seconds', timer: TimerInstance): void
        (e: 'update-custom-seconds', timer: TimerInstance): void
    }>()

    const formatTimerDisplay = (time: number) => {
        const m = Math.floor(time / 60)
        const s = time % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }
</script>

<style scoped>
    /* ==== identische Klassen wie bisher, damit alles 1:1 aussieht ==== */

    .drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
    }

        .drag-stack > .timer-card {
            width: 100%;
            max-width: 1200px;
        }

    .drag-ghost {
        opacity: 0.6;
    }

    /* Card + Header */
    .timer-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        transition: box-shadow 0.2s;
    }

    html.dark-mode .timer-card {
        background: #1c2526;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .timer-card:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .timer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .timer-drag-handle {
        cursor: grab;
        user-select: none;
        margin-right: .5rem;
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

    /* Display */
    .timer-display,
    .timer {
        font-size: 3rem;
        font-weight: 800;
        color: var(--text-primary);
        width: 100%;
        max-width: 400px;
        text-align: center;
        font-family: 'Roboto Mono', monospace;
        background: linear-gradient(45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));
        padding: 0.75rem;
        border-radius: 4px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        margin: 0 auto;
    }

    html.dark-mode .timer-display,
    html.dark-mode .timer {
        color: #ffffff;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .timer-display:hover,
    .timer:hover {
        transform: scale(1.02);
        box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    /* Controls + Inputs + Buttons */
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
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: 0.9rem;
        width: 150px;
    }

    html.dark-mode .timer-select,
    html.dark-mode .timer-input {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .timer-select:focus,
    .timer-input:focus {
        border-color: #4B6CB7;
        box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
        outline: none;
    }

    .timer-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .timer-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
    }

    .start-btn {
        background: #10b981;
        color: #ffffff;
    }

        .start-btn:hover {
            background: #064e3b;
            transform: scale(1.05);
        }

    .stop-btn {
        background: #ef4444;
        color: #ffffff;
    }

        .stop-btn:hover {
            background: #b91c1c;
            transform: scale(1.05);
        }

    .reset-btn {
        background: #6b7280;
        color: #ffffff;
    }

        .reset-btn:hover {
            background: #4b5563;
            transform: scale(1.05);
        }

    .timer-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    /* Close-Button wie vorher */
    .close-timer-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #ff6b6b;
        border-radius: 8px;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
    }

        .close-timer-btn:hover {
            color: #b91c1c;
            transform: scale(1.1);
        }
</style>
