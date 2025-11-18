<template>
    <div class="sticky-timer-card"
         :style="{ left: timer.left + 'px', top: timer.top + 'px' }"
         @mousedown="startDrag($event, timer)">
        <span class="name-link"
              @click="focusInTraining('timer', timer.id)"
              @mousedown.stop>
            {{ timer.name || 'Timer' }}
        </span>
        <span class="time">{{ formatTimer(timer.time) }}</span>
        <button @click="startTimer(timer)" :disabled="timer.isRunning">Start</button>
        <button @click="stopTimer(timer)" :disabled="!timer.isRunning">Stop</button>
        <button @click="resetTimer(timer)">Reset</button>
    </div>
</template>

<script setup lang="ts">
interface TimerInstance {
    id: string
    name: string
    seconds: string
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
    endAt?: number | null
}

const {
    timer,
    formatTimer,
    startTimer,
    stopTimer,
    resetTimer,
    startDrag,
    focusInTraining,
} = defineProps<{
    timer: TimerInstance
    formatTimer: (time: number) => string
    startTimer: (timer: TimerInstance) => void
    stopTimer: (timer: TimerInstance) => void
    resetTimer: (timer: TimerInstance) => void
    startDrag: (e: MouseEvent, timer: TimerInstance) => void
    focusInTraining: (type: 'timer' | 'stopwatch', id: string) => void
}>()
</script>

<style>
    /* Name-Link (gleich wie vorher) */
    .name-link {
        cursor: pointer;
        text-underline-offset: 2px;
        font-weight: 600;
    }

        .name-link:hover {
            text-decoration-thickness: 3px;
        }

    /* === Sticky Timer & Stoppuhr Styles – aus dem Parent übernommen === */
    .sticky-timer-card,
    .sticky-stopwatch-card {
        position: fixed;
        background: var(--bg-secondary);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        cursor: grab;
        z-index: 2000;
        border: 1px solid var(--border-color);
    }

        .sticky-timer-card:active,
        .sticky-stopwatch-card:active {
            cursor: grabbing;
        }

        .sticky-timer-card span:first-child,
        .sticky-stopwatch-card span:first-child {
            font-weight: 600;
        }

        .sticky-timer-card .time,
        .sticky-stopwatch-card .time {
            font-family: monospace;
            font-weight: 700;
            font-size: 1rem;
            color: var(--accent-primary);
        }

        .sticky-timer-card button,
        .sticky-stopwatch-card button {
            background: var(--accent-primary);
            border: none;
            color: #fff;
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s ease;
        }

            .sticky-timer-card button:hover,
            .sticky-stopwatch-card button:hover {
                background: var(--accent-hover);
            }

            .sticky-timer-card button:disabled,
            .sticky-stopwatch-card button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

    html.dark-mode .sticky-timer-card,
    html.dark-mode .sticky-stopwatch-card {
        background: #0d1117;
        border: 1px solid #30363d;
    }

        html.dark-mode .sticky-timer-card button,
        html.dark-mode .sticky-stopwatch-card button {
            background: #4B6CB7;
        }

            html.dark-mode .sticky-timer-card button:hover,
            html.dark-mode .sticky-stopwatch-card button:hover {
                background: #5a7bc4;
            }
</style>
