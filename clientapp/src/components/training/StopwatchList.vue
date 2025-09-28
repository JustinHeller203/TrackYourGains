<template>
    <Draggable :modelValue="props.stopwatches"
               item-key="id"
               handle=".stopwatch-drag-handle"
               :ghost-class="'drag-ghost'"
               :animation="150"
               tag="div"
               class="drag-stack"
               @update:modelValue="val => emit('reorder', val)">
        <template #item="{ element: sw }">
            <div class="timer-card" :key="sw.id" :data-stopwatch-id="sw.id" data-type="stopwatch">
                <div class="timer-header">
                    <span class="stopwatch-drag-handle" title="Ziehen zum Verschieben">⠿</span>
                    <span class="timer-name" @click.stop="emit('edit-name', sw.id)">
                        {{ sw.name || 'Stoppuhr' }}
                    </span>
                    <div class="timer-actions">
                        <FavoriteButton :active="sw.isFavorite"
                                        :titleActive="'Aus Favoriten entfernen'"
                                        :titleInactive="'Zu Favoriten hinzufügen'"
                                        @toggle="() => emit('toggle-favorite', sw.id)" />
                        <button class="close-timer-btn"
                                @click="emit('request-delete', sw.id)"
                                title="Stoppuhr löschen">
                            ✖
                        </button>
                    </div>
                </div>

                <div class="timer-controls">
                    <span class="timer-display">{{ formatStopwatchDisplay(sw.time) }}</span>
                    <div class="timer-buttons">
                        <button class="timer-btn start-btn" @click="props.toggleStopwatch(sw)">
                            {{ sw.isRunning ? 'Pause' : 'Start' }}
                        </button>
                        <button class="timer-btn reset-btn" @click="props.resetStopwatch(sw)">Reset</button>
                        <button class="timer-btn lap-btn" @click="emit('add-lap', sw)" :disabled="!sw.isRunning">Runde</button>
                    </div>
                </div>

                <div v-if="sw.laps && sw.laps.length" class="laps-container">
                    <h4>Runden</h4>
                    <div class="laps-list">
                        <div v-for="(lap, index) in sw.laps" :key="index" class="lap-item">
                            <span>Runde {{ index + 1 }}</span>
                            <span>{{ formatLapTime(lap) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Draggable>
</template>

<script setup lang="ts">
    import Draggable from 'vuedraggable'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'

    interface StopwatchInstance {
        id: string
        name?: string
        time: number
        isRunning: boolean
        interval: number | null
        laps?: number[]
        isFavorite: boolean
        isVisible: boolean
        shouldStaySticky: boolean
        left?: number
        top?: number
    }

    const props = defineProps<{
        stopwatches: StopwatchInstance[]
        toggleStopwatch: (sw: StopwatchInstance) => void
        resetStopwatch: (sw: StopwatchInstance) => void
    }>()

    const emit = defineEmits<{
        (e: 'reorder', list: StopwatchInstance[]): void
        (e: 'toggle-favorite', id: string): void
        (e: 'request-delete', id: string): void
        (e: 'edit-name', id: string): void
        (e: 'add-lap', sw: StopwatchInstance): void
    }>()

    const formatStopwatchDisplay = (time: number) => {
        const m = Math.floor(time / 60)
        const s = Math.floor(time % 60)
        const ms = Math.floor((time % 1) * 100)
        return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
    }
    const formatLapTime = (lapTime: number) => formatStopwatchDisplay(lapTime)
</script>

<style scoped>
    /* ==== identische/äquivalente Klassen wie in Training.vue, damit das Styling 1:1 bleibt ==== */

    /* Draggable-Container */
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

    .stopwatch-drag-handle {
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

    /* Controls + Buttons */
    .timer-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        width: 100%;
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

    .reset-btn {
        background: #6b7280;
        color: #ffffff;
    }

        .reset-btn:hover {
            background: #4b5563;
            transform: scale(1.05);
        }

    .lap-btn {
        background: #4B6CB7;
        color: #ffffff;
    }

        .lap-btn:hover {
            background: #3b5ca8;
            transform: scale(1.05);
        }

    .timer-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    /* Laps */
    .laps-container {
        width: 100%;
        max-width: 400px;
        margin-top: 1rem;
    }

        .laps-container h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-align: center;
        }

    .laps-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .lap-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: var(--bg-secondary);
        border-radius: 8px;
    }

    html.dark-mode .lap-item {
        background: #0d1117;
    }

    /* Close button */
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
