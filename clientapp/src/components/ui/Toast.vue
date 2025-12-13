<!--Toast.vue-->
<template>
    <div class="toast-container" :class="[positionClass, { 'pe-auto': showMenu || repositionMode }]" :style="containerDragStyle">
        <div v-if="toast"
             v-show="localVisible"
             class="toast"
             ref="toastEl"
             :class="[toast.type, { 'toast-exit': toast.exiting, 'is-reposition': repositionMode }]"
             :style="toastInlineStyle"
             role="status"
             aria-live="polite"
             @pointerdown="onToastPointerDown"
             @pointerup="onToastPointerUp"
             @pointermove="onToastPointerMove"
             @pointercancel="cancelPress"
             @mousedown.right.prevent.stop="openMenuAt($event as any)"
             @contextmenu.prevent.stop="openMenuAt($event as any)">

            <span class="toast-emoji">{{ toast.emoji }}</span>
            <span class="toast-message">{{ toast.message }}</span>
            <button v-if="(toast as any)?.action"
                    class="toast-action"
                    type="button"
                    :title="(toast as any).action.label + ' (⌘Z / Ctrl+Z)'"
                    @pointerdown.stop
                    @click="onActionClick">
                <i class="fas fa-rotate-left" aria-hidden="true"></i>
                <span class="label">{{ (toast as any).action.label }}</span>
            </button>
            <button v-if="dismissible"
                    class="toast-close"
                    type="button"
                    aria-label="Toast schließen"
                    @click="$emit('dismiss', toast!.id)">
                ✕
            </button>

            <div class="toast-progress"
                 v-if="toast && !toast.exiting"
                 :style="progressBarStyle"
                 aria-hidden="true"
                 @animationend="onProgressEnd">
            </div>

            <!-- Kontextmenü bei Long-Press -->
            <HoldMenu v-if="showMenu"
                      :menu-style="menuStyle">
                <button type="button" @click="disableAllToasts">
                    Toast Nachrichten deaktivieren
                </button>
                <button type="button" @click="disableThisType">
                    Diese Art deaktivieren
                </button>
                <button type="button" @click="startReposition">
                    Verschieben
                </button>
            </HoldMenu>

            <!-- Controls beim Verschieben -->
            <div v-if="repositionMode" class="reposition-controls">
                <button type="button"
                        @pointerdown.stop
                        @click.stop="confirmReposition">
                    Position speichern
                </button>
                <button type="button"
                        @pointerdown.stop
                        @click.stop="cancelReposition">
                    Abbrechen
                </button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
    import { computed, ref, watch, onBeforeUnmount, nextTick, onMounted } from 'vue'
    import type { Toast as ToastModel } from '@/types/toast'
    import { useToastPaused, pauseToasts, resumeToasts } from '@/utils/toastBus'
    import vAutoFlip from '@/directives/autoFlip';
    import HoldMenu from '@/components/ui/menu/HoldMenu.vue'

    const toastPaused = useToastPaused()
    const finishedWhileFrozen = ref(false)

    const props = defineProps<{
        toast: ToastModel | null
        dismissible?: boolean
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
        autoDismiss?: boolean
    }>()

    const emit = defineEmits<{ (e: 'dismiss', id: number): void }>()
    function onActionClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (!props.toast) return
        try { (props.toast as any)?.action?.handler?.() } catch { /* noop */ }
        // Toast sofort schließen wie beim Dismiss
        localVisible.value = false
        emit('dismiss', props.toast.id)
    }
    type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

    const PREF_KEY = 'tyg_toast_prefs'
    type ToastPrefs = {
        enabled: boolean;
        disabledTypes: string[];
        position?: Corner;            // Fallback (Ecke)
        posPx?: { x: number; y: number }; // Absolute Pixel-Position
    }
    function loadPrefs(): ToastPrefs {
        try { return JSON.parse(localStorage.getItem(PREF_KEY) || '') as ToastPrefs } catch { return { enabled: true, disabledTypes: [] } }
    }
    function savePrefs(p: ToastPrefs) { localStorage.setItem(PREF_KEY, JSON.stringify(p)) }

    const prefs = ref<ToastPrefs>(loadPrefs())

    // Settings.vue speichert Toast-Typen hier:
    const TYPE_ENABLED_KEY = 'toastTypeEnabled'
    const TYPE_DISABLED_KEY = 'toastDisabledTypes'

    function readDisabledTypesFromSettingsStorage(): string[] {
        // 1) enabled-map bevorzugen
        const rawMap = localStorage.getItem(TYPE_ENABLED_KEY)
        if (rawMap) {
            try {
                const map = JSON.parse(rawMap) as Record<string, unknown>
                return Object.keys(map).filter((k) => map[k] === false)
            } catch { /* ignore */ }
        }

        // 2) fallback: disabled-array
        const rawArr = localStorage.getItem(TYPE_DISABLED_KEY)
        if (rawArr) {
            try {
                const arr = JSON.parse(rawArr) as unknown
                if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string') as string[]
            } catch { /* ignore */ }
        }

        return []
    }

    function syncDisabledTypesFromSettings() {
        const disabled = readDisabledTypesFromSettingsStorage()
        prefs.value.disabledTypes = Array.from(new Set(disabled)) // auch [] sauber setzen
        savePrefs(prefs.value)
    }

    function onToastTypesChanged(_e: CustomEvent<unknown>) {
        // Quelle der Wahrheit ist localStorage (egal ob Event full-map oder partial war)
        syncDisabledTypesFromSettings()
        // disabled-array immer spiegeln, damit alte Pfade stabil bleiben
        localStorage.setItem(TYPE_DISABLED_KEY, JSON.stringify(prefs.value.disabledTypes))
    }

    // initial einmal syncen (damit Settings-Werte gelten, auch ohne Reload)
    syncDisabledTypesFromSettings()

    const userPosition = ref<Corner | null>(prefs.value.position ?? null)
    const savedPos = ref<{ x: number; y: number } | null>(prefs.value.posPx ?? null)

    const showMenu = ref(false)
    const toastEl = ref<HTMLElement | null>(null)
    let pressTimer: number | null = null

    const repositionMode = ref(false)
    const dragPos = ref<{ x: number; y: number } | null>(null)
    const dragOffset = ref<{ x: number; y: number } | null>(null)
    function clearAfterSaveTimer() {
        if (afterSaveTimerId.value != null) {
            clearTimeout(afterSaveTimerId.value)
            afterSaveTimerId.value = null
        }
    }

    const rafId = ref<number | null>(null) // bleibt nur als No-Op-Relikt
    const endAt = ref<number>(0)

    function stopRaf() {
        rafId.value = null
    }

    function tick() { /* intentionally empty */ }

    function startRafCountdown(totalMs: number) {
        const ms = Math.max(0, totalMs)
        endAt.value = Date.now() + ms
        startDismissTimer(ms)
    }

    const containerDragStyle = computed(() => {
        // Während Reposition: live-drag Position
        if (repositionMode.value && dragPos.value) {
            return {
                top: `${dragPos.value.y}px`,
                left: `${dragPos.value.x}px`,
                bottom: 'unset',
                right: 'unset'
            } as Record<string, string>
        }
        // Persistierte Position: auch außerhalb vom Reposition-Mode anwenden
        if (savedPos.value) {
            return {
                top: `${savedPos.value.y}px`,
                left: `${savedPos.value.x}px`,
                bottom: 'unset',
                right: 'unset'
            } as Record<string, string>
        }
        // Kein Custom-Pos → Klassen (Ecken) wirken
        return {}
    })

    // === AUTODISMISS TIMER ===
    const dismissTimerId = ref<number | null>(null)
    const remainingMs = ref(0)
    const startedAt = ref(0)

    function clearDismissTimer() {
        if (dismissTimerId.value != null) {
            clearTimeout(dismissTimerId.value)
            dismissTimerId.value = null
        }
    }

    function startDismissTimer(total: number) {
        clearDismissTimer()
        remainingMs.value = Math.max(0, total)
        startedAt.value = Date.now()
        if (remainingMs.value === 0) return
        dismissTimerId.value = window.setTimeout(doDismiss, remainingMs.value) as unknown as number
    }

    function pauseDismissTimer() {
        if (dismissTimerId.value == null) return
        const elapsed = Date.now() - startedAt.value
        const newRemaining = Math.max(0, remainingMs.value - elapsed)
        // Wenn während des Freezes die Restzeit auf 0 fällt, merken wir das
        if (newRemaining === 0) {
            finishedWhileFrozen.value = true
        }
        remainingMs.value = newRemaining
        clearDismissTimer()
    }

    function resumeDismissTimer() {
        // Falls Timer bereits fertig ist: nach Unfreeze direkt schließen
        if (dismissTimerId.value == null && remainingMs.value <= 0) {
            if (!isActuallyPaused.value) {
                tryDismissAfterProgress()
            }
            return
        }
        if (dismissTimerId.value != null) return
        startedAt.value = Date.now()
        dismissTimerId.value = window.setTimeout(doDismiss, remainingMs.value) as unknown as number
    }
    const storedEnabled = localStorage.getItem('toastsEnabled')
    if (storedEnabled !== null) {
        prefs.value.enabled = storedEnabled === 'true'
        savePrefs(prefs.value)
    }
    function onToastsEnabledChanged(e: CustomEvent<boolean>) {
        prefs.value.enabled = !!e.detail
        savePrefs(prefs.value)
    }

    const DEFAULT_TOAST_MS = 2500
    const globalToastDurationMs = ref<number>(DEFAULT_TOAST_MS)

    // Initial aus Settings laden
    const storedToastDur = Number(localStorage.getItem('toastDurationMs'))
    if (Number.isFinite(storedToastDur) && storedToastDur > 0) {
        globalToastDurationMs.value = storedToastDur
    }

    function onToastDurationChanged(e: CustomEvent<number>) {
        const n = Number(e.detail)
        if (!Number.isFinite(n) || n <= 0) return
        globalToastDurationMs.value = n
    }

    const menuStyle = ref<Record<string, string>>({})

    const onGlobalFreeze = (e: CustomEvent<boolean>) => {
        if (e.detail) {
            pauseDismissTimer()
        } else {
            // nur fortsetzen, wenn dieser Toast nicht selbst „eingefroren“ ist
            if (!isActuallyPaused.value) resumeDismissTimer()
        }
    }
    watch(showMenu, async (open) => {
        if (open) {
            await nextTick()
            const w = toastEl.value?.getBoundingClientRect().width ?? 0
            // Menü exakt so breit wie Toast, aber niemals größer als der Viewport
            menuStyle.value = {
                width: Math.max(0, w) + 'px',
                maxWidth: '100vw',
                boxSizing: 'border-box'
            }
        } else {
            menuStyle.value = {}
        }
    })

    function doDismiss() {
        if (!props.toast || props.autoDismiss === false) return
        if (isActuallyPaused.value) {
            // Während Pause NICHT die Restzeit resetten – nur kurz pollen.
            clearDismissTimer()
            dismissTimerId.value = window.setTimeout(doDismiss, 50) as unknown as number
            return
        }
        autoClosing.value = true
        closedOnce.value = true
        localVisible.value = false
        emit('dismiss', props.toast.id)
    }

    const afterSaveTimerId = ref<number | null>(null)

    async function openMenuAt(_ev: PointerEvent | MouseEvent) {
        ignoreNextAnim.value = true
        autoClosing.value = false
        closedOnce.value = false
        localVisible.value = true

        showMenu.value = true
        pauseToasts()
        window.dispatchEvent(new CustomEvent('toast-global-freeze', { detail: true }))

        await nextTick()
        requestAnimationFrame(() => { ignoreNextAnim.value = false })
    }

    function disableAllToasts() {
        // 1) Prefs setzen & persistieren
        prefs.value.enabled = false
        savePrefs(prefs.value)

        // 2) Auch die globale Settings-Persistenz spiegeln
        localStorage.setItem('toastsEnabled', 'false')
        window.dispatchEvent(new CustomEvent('toasts-enabled-changed', { detail: false }))

        // 3) Menü schließen und aktuellen Toast sofort ausblenden
        showMenu.value = false
        if (props.toast) {
            localVisible.value = false
            emit('dismiss', props.toast.id)
        }
    }

    function clearHold() {
        if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
    }
    function cancelPress() {
        clearHold()
        if (showMenu.value) return

        const wasHolding = isHolding.value
        isHolding.value = false

        // Wenn wir per PointerDown global pausiert haben (kurzer Tap, kein Menü),
        // Pause global wieder aufheben und lokalen Timer sauber fortsetzen.
        if (!repositionMode.value) {
            resumeToasts()
        }
        if (!toastPaused.value && !repositionMode.value) {
            resumeDismissTimer()
        }
    }
    const ignoreNextAnim = ref(false)

    function onToastPointerDown(ev: PointerEvent) {
        // Nur auf Touch/Pen native Selektion & Callout killen – Maus in Ruhe lassen
        if (ev.pointerType === 'touch' || ev.pointerType === 'pen') {
            ev.preventDefault()
        }

        // Rechts-/Mittelklick der Maus NICHT blocken (Right-Click öffnet Menü separat)
        if (ev.pointerType === 'mouse' && (ev.button === 1 || ev.button === 2)) {
            return
        }

        const target = ev.target as HTMLElement
        if (target.closest('.reposition-controls')) return
        if (showMenu.value) return
        if (target.closest('.toast-close')) return

        isHolding.value = true
        pauseToasts()

        clearHold()
        pauseDismissTimer()
            ; (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId)

        if (repositionMode.value) {
            const cont = (ev.currentTarget as HTMLElement).closest('.toast-container') as HTMLElement
            const r = cont.getBoundingClientRect()
            dragOffset.value = { x: ev.clientX - r.left, y: ev.clientY - r.top }
            dragPos.value = { x: r.left, y: r.top }
            return
        }
        pressTimer = window.setTimeout(() => openMenuAt(ev), 550) as unknown as number
    }

    function onToastPointerMove(ev: PointerEvent) {
        if (!repositionMode.value || !dragOffset.value) return
        const x = ev.clientX - dragOffset.value.x
        const y = ev.clientY - dragOffset.value.y
        dragPos.value = {
            x: Math.max(8, Math.min(window.innerWidth - 8, x)),
            y: Math.max(8, Math.min(window.innerHeight - 8, y))
        }
    }

    function onToastPointerUp(_ev: PointerEvent) {
        cancelPress()
        if (!showMenu.value) {
            isHolding.value = false
            // kein globales resume hier – Parent kontrolliert die Pause
        }
        dragOffset.value = null
    }

    function startReposition() {
        showMenu.value = false
        repositionMode.value = true
        pauseToasts()
        // Falls bereits gespeichert, dort wieder anpacken
        if (savedPos.value) {
            dragPos.value = { x: savedPos.value.x, y: savedPos.value.y }
            return
        }
        const cont = document.querySelector('.toast-container') as HTMLElement
        if (cont) {
            const r = cont.getBoundingClientRect()
            dragPos.value = { x: r.left, y: r.top }
        }
    }

    function cornerFromRect(): Corner {
        const cont = document.querySelector('.toast-container') as HTMLElement
        const r = cont.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2
        const horiz = cx < window.innerWidth / 2 ? 'left' : 'right'
        const vert = cy < window.innerHeight / 2 ? 'top' : 'bottom'
        return `${vert}-${horiz}` as Corner
    }

    function confirmReposition() {
        // 1) Aktuelle Pixel-Position ermitteln (Drag-Pos bevorzugt, sonst DOM)
        const cont = document.querySelector('.toast-container') as HTMLElement | null
        let pos = dragPos.value
        if (!pos && cont) {
            const r = cont.getBoundingClientRect()
            pos = { x: r.left, y: r.top }
        }

        // 2) Persistieren: absolute px-Position + Corner-Fallback
        if (pos) {
            const px = { x: Math.round(pos.x), y: Math.round(pos.y) }
            savedPos.value = px
            prefs.value.posPx = px
        } else {
            savedPos.value = null
            delete prefs.value.posPx
        }
        userPosition.value = cornerFromRect()
        prefs.value.position = userPosition.value
        savePrefs(prefs.value)

        // 3) UI-State aufräumen
        repositionMode.value = false
        dragPos.value = null

        // Normalen Auto-Dismiss-Timer stoppen, +1s manuell anzeigen
        pauseDismissTimer()
        resumeToasts()

        clearAfterSaveTimer()
        afterSaveTimerId.value = window.setTimeout(() => {
            if (!props.toast) return
            autoClosing.value = true
            closedOnce.value = true
            localVisible.value = false
            emit('dismiss', props.toast.id)
            afterSaveTimerId.value = null
        }, 1000) as unknown as number
    }


    function cancelReposition() {
        // Reposition abbrechen und direkt schließen
        repositionMode.value = false
        dragPos.value = null

        clearAfterSaveTimer()
        clearDismissTimer()
        resumeToasts()

        if (props.toast) {
            autoClosing.value = true
            closedOnce.value = true
            localVisible.value = false
            emit('dismiss', props.toast.id)
        }
    }

    function disableThisType() {
        const t = props.toast?.type
        if (!t) return

        if (!prefs.value.disabledTypes.includes(t)) {
            prefs.value.disabledTypes.push(t)
            savePrefs(prefs.value)
        }

        // Settings-Keys ebenfalls updaten
        localStorage.setItem(TYPE_DISABLED_KEY, JSON.stringify(prefs.value.disabledTypes))

        // Wenn enabled-map existiert, dort auch spiegeln + Event feuern
        try {
            const raw = localStorage.getItem(TYPE_ENABLED_KEY)
            if (raw) {
                const map = JSON.parse(raw) as Record<string, unknown>
                map[t] = false
                localStorage.setItem(TYPE_ENABLED_KEY, JSON.stringify(map))
                window.dispatchEvent(new CustomEvent('toast-types-changed', { detail: { [t]: false } }))
            } else {
                window.dispatchEvent(new CustomEvent('toast-types-changed', { detail: { [t]: false } }))
            }
        } catch {
            window.dispatchEvent(new CustomEvent('toast-types-changed', { detail: { [t]: false } }))
        }

        showMenu.value = false
        if (props.toast) {
            localVisible.value = false
            emit('dismiss', props.toast.id)
        }
    }

    function enableAllToasts() {
        prefs.value.enabled = true
        savePrefs(prefs.value)
        showMenu.value = false
    }

    const effectivePosition = computed<Corner>(() => userPosition.value ?? (props.position ?? 'bottom-right'))

    const positionClass = computed(() => {
        // Wenn absolute Pixel-Position vorhanden ist, KEINE Corner-Klasse setzen
        if (savedPos.value) return ''
        switch (effectivePosition.value) {
            case 'top-left': return 'pos-top-left'
            case 'top-right': return 'pos-top-right'
            case 'bottom-left': return 'pos-bottom-left'
            default: return 'pos-bottom-right'
        }
    })

    const progressMs = computed(() => {
        const t = props.toast as any
        const base = Number(t?.durationMs ?? t?.duration ?? t?.timeout ?? globalToastDurationMs.value)
        return Math.max(600, Number.isFinite(base) ? base : globalToastDurationMs.value)
    })

    const accentColor = computed(() => {
        switch (props.toast?.type) {
            case 'toast-add': return '#10b981'
            case 'toast-delete': return '#ef4444'
            case 'toast-save': return '#F59E0B'
            case 'toast-timer': return '#6b7280'
            case 'toast-reset': return '#ef4444'
            default: return '#4B6CB7'
        }
    })

    const isHolding = ref(false)
    const isFrozen = computed(() =>
        showMenu.value || repositionMode.value || isHolding.value
    )
    const isActuallyPaused = computed(() => isFrozen.value || toastPaused.value)

    const effectiveDurationMs = computed(() =>
        remainingMs.value > 0 ? remainingMs.value : progressMs.value
    )
    const progressBarStyle = computed(() => ({
        // Fix: Dauer ist stabil (Basisdauer), damit die Animation nicht neu startet
        '--toast-duration': progressMs.value + 'ms',
        '--toast-accent': accentColor.value,
        '--toast-play': isActuallyPaused.value ? 'paused' : 'running'
    }) as Record<string, string>)

    const autoClosing = ref(false)
    const closedOnce = ref(false)

    const toastInlineStyle = computed(() => {
        return autoClosing.value
            ? ({ '--toast-exit': '0ms' } as Record<string, string>)
            : {}
    })

    function onProgressEnd(_e: AnimationEvent) {
        if (!props.toast || closedOnce.value || props.autoDismiss === false) return
        if (ignoreNextAnim.value) return
        // Wenn während Menü/Hold/Reposition oder globaler Pause fertig → merken, nicht schließen
        if (isFrozen.value || toastPaused.value) {
            finishedWhileFrozen.value = true
            return
        }
        tryDismissAfterProgress()
    }

    watch([showMenu, isHolding, repositionMode, toastPaused], () => {
        // Falls gerade irgendein Freeze aktiv ist, nie automatisch schließen.
        if (isFrozen.value || toastPaused.value) return
        // Wenn die Progress-Animation bereits während Freeze fertig wurde,
        // jetzt sofort sauber schließen.
        if (finishedWhileFrozen.value) {
            finishedWhileFrozen.value = false
            tryDismissAfterProgress()
        }
    })
    const fallbackTimerId = ref<number | null>(null)
    function clearFallbackTimer() {
        if (fallbackTimerId.value != null) {
            clearTimeout(fallbackTimerId.value)
            fallbackTimerId.value = null
        }
    }
    function tryDismissAfterProgress() {
        if (!props.toast || closedOnce.value || props.autoDismiss === false) return
        if (isFrozen.value) return // während Menü/Hold/Reposition nicht schließen
        clearDismissTimer()
        autoClosing.value = true
        closedOnce.value = true
        localVisible.value = false
        emit('dismiss', props.toast.id)
    }
    function onOutsidePointer(e: PointerEvent) {
        const toast = toastEl.value
        const target = e.target as HTMLElement

        // Klicks direkt im Menü ignorieren
        if (target.closest('.toast-menu')) return
        if (toast && toast.contains(target)) return

        // Menü schließen, aber jegliche weitere Handler blocken,
        // damit kein globaler Click-Away den Toast schließt.
        showMenu.value = false
        if (typeof (e as any).stopImmediatePropagation === 'function') {
            (e as any).stopImmediatePropagation()
        }
        e.stopPropagation()
    }

    watch(showMenu, (open) => {
        if (open) {
            localVisible.value = true
            autoClosing.value = false
            pauseToasts()
            pauseDismissTimer()               // lokal
            window.dispatchEvent(new CustomEvent('toast-global-freeze', { detail: true }))  // global
            window.addEventListener('pointerdown', onOutsidePointer, true)
            return
        }
        window.removeEventListener('pointerdown', onOutsidePointer, true)
        isHolding.value = false
        if (!repositionMode.value) resumeToasts()
        window.dispatchEvent(new CustomEvent('toast-global-freeze', { detail: false }))   // global
        if (!isFrozen.value && !toastPaused.value && finishedWhileFrozen.value) {
            finishedWhileFrozen.value = false
            tryDismissAfterProgress()
        } else {
            resumeDismissTimer()
        }
    })

    onMounted(() => {
        window.addEventListener('toasts-enabled-changed', onToastsEnabledChanged as EventListener)
        window.addEventListener('toast-duration-changed', onToastDurationChanged as EventListener)
        window.addEventListener('toast-types-changed', onToastTypesChanged as EventListener)
        window.addEventListener('toast-global-freeze', onGlobalFreeze as EventListener)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('toasts-enabled-changed', onToastsEnabledChanged as EventListener)
        window.removeEventListener('toast-duration-changed', onToastDurationChanged as EventListener)
        window.removeEventListener('toast-types-changed', onToastTypesChanged as EventListener)
        window.removeEventListener('toast-global-freeze', onGlobalFreeze as EventListener)
        clearFallbackTimer()
    })


    watch(toastPaused, (paused) => {
        if (!paused && finishedWhileFrozen.value && !isFrozen.value) {
            finishedWhileFrozen.value = false
            tryDismissAfterProgress()
        }
    })
    const localVisible = ref(true)

    onBeforeUnmount(() => {
        window.removeEventListener('pointerdown', onOutsidePointer, true)
        clearAfterSaveTimer()
        clearDismissTimer()
    })
    watch(
        () => [props.toast?.id, props.toast?.message, props.toast?.type, props.toast?.emoji],
        () => {
            // Reset UI-State damit ein neuer Toast nie "unsichtbar festhängt"
            localVisible.value = true
            autoClosing.value = false
            closedOnce.value = false
            showMenu.value = false

            repositionMode.value = false
            dragPos.value = null
            dragOffset.value = null

            finishedWhileFrozen.value = false
            remainingMs.value = 0

            clearDismissTimer()
            clearFallbackTimer()
            stopRaf()

            const t = props.toast
            if (!t) return

            // Wenn global deaktiviert oder Typ deaktiviert → sofort dismiss (wie bisher)
            if (!prefs.value.enabled) {
                localVisible.value = false
                requestAnimationFrame(() => emit('dismiss', t.id))
                return
            }

            if (t.type && prefs.value.disabledTypes.includes(t.type)) {
                localVisible.value = false
                requestAnimationFrame(() => emit('dismiss', t.id))
                return
            }

            if (props.autoDismiss !== false) {
                startDismissTimer(progressMs.value)
            }
        },
        { immediate: true }
    )
    watch(isActuallyPaused, (paused) => {
        if (paused) {
            pauseDismissTimer()
            return
        }
        // Unpaused:
        if (remainingMs.value <= 0) {
            // Progress-Linie war schon fertig → sofort schließen
            tryDismissAfterProgress()
        } else {
            resumeDismissTimer()
        }
    })
    onBeforeUnmount(() => {
        stopRaf()
    })
    onMounted(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!localVisible.value || !props.toast || !(props.toast as any)?.action) return
            const isUndo = (e.key.toLowerCase?.() === 'z') && (e.metaKey || e.ctrlKey)
            if (isUndo) {
                e.preventDefault()
                onActionClick(new MouseEvent('click'))
            }
        }
        window.addEventListener('keydown', onKey, { passive: false })
        onBeforeUnmount(() => window.removeEventListener('keydown', onKey as any))
    })

</script>

<style scoped>
    /* ===== Container-Positionen ===== */
    .toast-container {
        position: fixed;
        z-index: var(--z-toast, 2147483647);
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        isolation: isolate;
    }

    .pos-bottom-right {
        bottom: 20px;
        right: 20px;
    }

    .pos-bottom-left {
        bottom: 20px;
        left: 20px;
        align-items: flex-start;
    }

    .pos-top-right {
        top: 20px;
        right: 20px;
    }

    .pos-top-left {
        top: 20px;
        left: 20px;
        align-items: flex-start;
    }

    /* ===== Toast Box ===== */
    .toast {
        pointer-events: auto;
        background: var(--bg-card);
        padding: .9rem 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,.2);
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        font-size: .9rem;
        animation: toast-enter .3s ease;
        max-width: min(80vw, 420px);
        line-height: 1.35;
        color: var(--text-primary);
        position: relative;
        overflow: visible;
    }

    html.dark-mode .toast {
        background: #1c2526;
        color: #c9d1d9;
    }

    .toast-emoji {
        font-size: 1.1rem;
    }

    .toast-message {
        flex: 1;
        word-break: break-word;
    }

    .toast-exit {
        animation: toast-exit var(--toast-exit, .2s) ease forwards;
        animation-play-state: var(--toast-play, running);
    }

    /* Typen */
    .toast-default {
        border-left: 4px solid #4B6CB7;
    }

    .toast-add {
        border-left: 4px solid #10b981;
    }

    .toast-delete {
        border-left: 4px solid #ef4444;
    }
    @media (hover: none) and (pointer: coarse), (max-width: 1024px) {
        .toast {
            /* keine Browser-Long-Press-Aktionen, kein Double-Tap-Zoom-Highlight */
            touch-action: none;
            -webkit-tap-highlight-color: transparent;
        }
            /* Text-Selektion & iOS Touch-Callout deaktivieren */
            .toast, .toast * {
                user-select: none;
                -webkit-user-select: none;
                -webkit-touch-callout: none;
            }
    }
    .toast-save {
        border-left: 4px solid #F59E0B;
    }

    .toast-timer {
        border-left: 4px solid #6b7280;
    }

    .toast-reset {
        border-left: 4px solid #ef4444;
    }

    /* Close-Button */
    .toast-close {
        appearance: none;
        background: transparent;
        border: none;
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
        padding: .1rem .25rem;
        margin-left: .25rem;
        color: var(--text-secondary, #6b7280);
        border-radius: 6px;
        transition: background .2s, color .2s, transform .05s;
    }

        .toast-close:hover {
            background: rgba(0,0,0,.06);
            color: var(--text-primary, #111827);
        }

    html.dark-mode .toast-close:hover {
        background: rgba(255,255,255,.06);
    }

    /* Animations */
    @keyframes toast-enter {
        from {
            transform: translateX(100%);
            opacity: 0;
        }

        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes toast-exit {
        from {
            transform: translateX(0);
            opacity: 1;
        }

        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .toast-progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        background: var(--toast-accent, #4B6CB7);
        opacity: .95;
        transform-origin: left;
        animation: toast-progress-shrink var(--toast-duration, 3000ms) linear forwards;
        pointer-events: none;
        animation-play-state: var(--toast-play, running);
    }

    @keyframes toast-progress-shrink {
        from {
            transform: scaleX(1);
        }

        to {
            transform: scaleX(0);
        }
    }

    html.dark-mode .toast-progress {
        opacity: .9;
    }

    
    .toast-action {
        appearance: none;
        border: 0;
        background: transparent;
        padding: .1rem .2rem;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        color: var(--accent-primary, #4B6CB7);
        text-decoration: none;
        text-underline-offset: 2px;
        transition: background .15s, text-decoration-color .15s, color .15s;
    }

        .toast-action:hover {
            text-decoration: underline;
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .toast-action:hover {
        background: rgba(255,255,255,.06);
    }


    .is-reposition {
        outline: 2px dashed var(--toast-accent, #4B6CB7);
        cursor: grab;
    }

    .reposition-controls {
        position: absolute;
        right: 8px;
        bottom: 6px;
        display: flex;
        gap: .25rem;
    }

        .reposition-controls button {
            font-size: .78rem;
            padding: .25rem .5rem;
            border-radius: 6px;
            border: 1px solid rgba(0,0,0,.15);
            background: var(--bg-card, #fff);
            cursor: pointer;
        }


    .pe-auto {
        pointer-events: auto;
    }
</style>
