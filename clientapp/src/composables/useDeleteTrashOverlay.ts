import { ref } from 'vue'

export const DELETE_TRASH_ANIMATION_MS = 860

type DeleteTrashPayload = {
    startX: number
    startY: number
    title?: string
    chips?: string[]
    targetX?: number
    targetY?: number
    durationMs?: number
}

export const deleteTrashOverlayState = ref({
    visible: false,
    title: '',
    chips: [] as string[],
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
})

let deleteTrashOverlayTimer: ReturnType<typeof setTimeout> | null = null

export function hideDeleteTrashOverlay() {
    if (deleteTrashOverlayTimer) {
        clearTimeout(deleteTrashOverlayTimer)
        deleteTrashOverlayTimer = null
    }

    deleteTrashOverlayState.value = {
        visible: false,
        title: '',
        chips: [],
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    }
}

export function showDeleteTrashOverlay(payload: DeleteTrashPayload) {
    const fallbackX = typeof window !== 'undefined' ? window.innerWidth / 2 : payload.startX
    const fallbackY = typeof window !== 'undefined' ? window.innerHeight / 2 : payload.startY
    const targetX = payload.targetX ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : fallbackX)
    const targetY = payload.targetY ?? (typeof window !== 'undefined' ? window.innerHeight - 84 : fallbackY)
    const durationMs = payload.durationMs ?? DELETE_TRASH_ANIMATION_MS

    hideDeleteTrashOverlay()

    deleteTrashOverlayState.value = {
        visible: true,
        title: payload.title ?? '',
        chips: (payload.chips ?? []).slice(0, 6),
        startX: payload.startX,
        startY: payload.startY,
        deltaX: targetX - payload.startX,
        deltaY: targetY - payload.startY,
    }

    deleteTrashOverlayTimer = setTimeout(() => {
        hideDeleteTrashOverlay()
    }, durationMs)
}
