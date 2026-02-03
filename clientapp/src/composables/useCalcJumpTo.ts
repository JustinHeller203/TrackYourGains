//src/composables/useCalcJumpTo.ts

import { ref } from 'vue'

export function useCalcJumpTo(opts?: { clearAfterMs?: number }) {
    const activeTargetId = ref<string | null>(null)
    let activeTargetTimer: number | null = null

    const clearAfterMs = opts?.clearAfterMs ?? 1400

    function jumpTo(id: string) {
        const el = document.getElementById(id)
        if (!el) return

        if (activeTargetTimer) window.clearTimeout(activeTargetTimer)
        activeTargetId.value = id

        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ; (el as HTMLElement).focus?.({ preventScroll: true })

        activeTargetTimer = window.setTimeout(() => {
            activeTargetId.value = null
            activeTargetTimer = null
        }, clearAfterMs)
    }

    function flashTarget(id: string, ms = 700) {
        if (activeTargetTimer) window.clearTimeout(activeTargetTimer)
        activeTargetId.value = id
        activeTargetTimer = window.setTimeout(() => {
            activeTargetId.value = null
            activeTargetTimer = null
        }, ms)
    }

    return { activeTargetId, jumpTo, flashTarget }
}
