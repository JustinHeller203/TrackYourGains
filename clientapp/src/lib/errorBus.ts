import { reactive } from 'vue'

export type UiErrorEntry = {
    id: string
    at: number
    source: 'window' | 'vue' | 'promise' | 'router' | 'vue-warn'
    message: string
    stack?: string
    info?: string
}

export const uiErrors = reactive({
    items: [] as UiErrorEntry[],
})

export function pushUiError(entry: Omit<UiErrorEntry, 'id' | 'at'>) {
    uiErrors.items.unshift({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        at: Date.now(),
        ...entry,
    })
    // cap (damit es nicht explodiert)
    if (uiErrors.items.length > 30) uiErrors.items.length = 30
}

export function clearUiErrors() {
    uiErrors.items = []
}
