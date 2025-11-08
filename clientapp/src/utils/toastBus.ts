// toastBus.ts
import { ref, readonly } from 'vue'

const paused = ref(false)

export function pauseToasts() {
    if (!paused.value) {
        paused.value = true
        window.dispatchEvent(new CustomEvent('toast:pause', { detail: true }))
    }
}

export function resumeToasts() {
    if (paused.value) {
        paused.value = false
        window.dispatchEvent(new CustomEvent('toast:pause', { detail: false }))
    }
}

export function useToastPaused() {
    return readonly(paused)
}
