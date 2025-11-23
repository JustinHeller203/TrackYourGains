<template>
    <div class="sticky-stopwatch-card"
         ref="cardEl"
         :class="[{ resizing: resizeMode, movable: moveMode }, sizePreset]"
         :style="{
  left: stopwatch.left + 'px',
  top: stopwatch.top + 'px',
  width: stopwatch.width ? stopwatch.width + 'px' : undefined,
  height: cardHeight,
  zIndex: stopwatch.zIndex ?? 2000,
  background: stopwatch.bgColor ?? undefined,
  borderRadius: shapeRadius,
  '--ui-scale': uiScale,
  '--btn-bg': stopwatch.btnColor ?? undefined,
  '--time-color': stopwatch.timeColor ?? undefined
}"

         @mousedown="onMouseDown($event)"
         @mousedown.right.prevent="openMenu($event as any)"
         @contextmenu.prevent="openMenu($event as any)"
         @pointerdown.capture="onPointerDown"
         @pointermove.capture="onPointerMove"
         @pointerup.capture="onPointerUp"
         @pointercancel.capture="onPointerCancel">


        <span class="name-link"
              @click="focusInTraining('stopwatch', stopwatch.id)"
              @mousedown.stop>
            {{ stopwatch.name || 'Stoppuhr' }}
        </span>
        <span class="time">{{ formatStopwatch(stopwatch.time) }}</span>
        <button @click="toggleStopwatch(stopwatch)">
            {{ stopwatch.isRunning ? 'Pause' : 'Start' }}
        </button>
        <button ref="resetBtnEl" @click="resetStopwatch(stopwatch)">Reset</button>
        <button ref="lapBtnEl" @click="addLap(stopwatch)" :disabled="!stopwatch.isRunning">
            Runde
        </button>

        <!-- StickyStopwatchCard.vue | REPLACE HoldMenu block -->
        <HoldMenu v-if="showMenu"
                  class="sticky-menu"
                  :menuStyle="menuStyle">
            <button type="button" class="menu-item" @click="handleOpen">
                Öffnen
            </button>
            <button type="button" class="menu-item" @click="handleMove">
                Verschieben
            </button>
            <button type="button" class="menu-item" @click="handleCrop">
                Zuschneiden
            </button>

            <button type="button" class="menu-item" @click="handleEdit" @mousedown.stop>
                Bearbeiten
            </button>

            <template v-if="showColors">
                <div class="color-row" @mousedown.stop>
                    <span class="color-label">Farbe</span>
                    <button type="button" class="color-dot default"
                            title="Default"
                            @click="setColor(null)">
                    </button>
                    <button type="button" class="color-dot transparent"
                            title="Transparent"
                            @click="setColor('transparent')">
                    </button>
                    <button type="button" class="color-dot blue"
                            title="Blau"
                            @click="setColor('#1e3a8a')">
                    </button>
                    <button type="button" class="color-dot green"
                            title="Grün"
                            @click="setColor('#166534')">
                    </button>
                    <button type="button" class="color-dot amber"
                            title="Orange"
                            @click="setColor('#92400e')">
                    </button>

                    <input class="color-picker" type="color"
                           :value="stopwatch.bgColor || '#0d1117'"
                           @input="setColor(($event.target as HTMLInputElement).value, false)" />
                </div>

                <div class="color-row" @mousedown.stop>
                    <span class="color-label">Buttons</span>
                    <button type="button" class="color-dot default"
                            title="Default"
                            @click="setBtnColor(null, false)">
                    </button>
                    <button type="button" class="color-dot blue"
                            title="Blau"
                            @click="setBtnColor('#1e3a8a', false)">
                    </button>
                    <button type="button" class="color-dot green"
                            title="Grün"
                            @click="setBtnColor('#166534', false)">
                    </button>
                    <button type="button" class="color-dot amber"
                            title="Orange"
                            @click="setBtnColor('#92400e', false)">
                    </button>

                    <input class="color-picker" type="color"
                           :value="stopwatch.btnColor || '#4B6CB7'"
                           @input="setBtnColor(($event.target as HTMLInputElement).value, false)" />
                </div>

                <div class="color-row" @mousedown.stop>
                    <span class="color-label">Zeit</span>
                    <button type="button" class="color-dot default"
                            title="Default"
                            @click="setTimeColor(null, false)">
                    </button>
                    <button type="button" class="color-dot blue"
                            title="Blau"
                            @click="setTimeColor('#1e3a8a', false)">
                    </button>
                    <button type="button" class="color-dot green"
                            title="Grün"
                            @click="setTimeColor('#166534', false)">
                    </button>
                    <button type="button" class="color-dot amber"
                            title="Orange"
                            @click="setTimeColor('#92400e', false)">
                    </button>

                    <input class="color-picker" type="color"
                           :value="stopwatch.timeColor || '#4B6CB7'"
                           @input="setTimeColor(($event.target as HTMLInputElement).value, false)" />
                </div>
                <div class="color-row" @mousedown.stop>
                    <span class="color-label">Form</span>

                    <button type="button" class="shape-btn" @click="setShape(null)">
                        Default
                        <span v-if="stopwatch.shape == null" class="shape-check">✓</span>
                    </button>

                    <button type="button" class="shape-btn" @click="setShape('square')">
                        Eckig
                        <span v-if="stopwatch.shape === 'square'" class="shape-check">✓</span>
                    </button>

                    <button type="button" class="shape-btn" @click="setShape('rounded')">
                        Rund
                        <span v-if="stopwatch.shape === 'rounded'" class="shape-check">✓</span>
                    </button>

                    <button type="button" class="shape-btn" @click="setShape('oval')">
                        Oval
                        <span v-if="stopwatch.shape === 'oval'" class="shape-check">✓</span>
                    </button>
                </div>

            </template>

            <button type="button" class="menu-item danger" @click="handleClose">
                Schließen
            </button>
        </HoldMenu>


        <template v-if="resizeMode">
            <div class="resize-handle nw" @pointerdown.stop.prevent="startResize($event,'nw')"></div>
            <div class="resize-handle ne" @pointerdown.stop.prevent="startResize($event,'ne')"></div>
            <div class="resize-handle sw" @pointerdown.stop.prevent="startResize($event,'sw')"></div>
            <div class="resize-handle se" @pointerdown.stop.prevent="startResize($event,'se')"></div>
            <div class="resize-handle w" @pointerdown.stop.prevent="startResize($event,'w')"></div>
            <div class="resize-handle e" @pointerdown.stop.prevent="startResize($event,'e')"></div>
            <div class="resize-handle n" @pointerdown.stop.prevent="startResize($event,'n')"></div>
            <div class="resize-handle s" @pointerdown.stop.prevent="startResize($event,'s')"></div>
        </template>
    </div>

</template>

<script setup lang="ts">

    import { ref, computed, nextTick, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue'
    import HoldMenu from '@/components/ui/menu/HoldMenu.vue'

    const Z_KEY = '__stickyZ'
    function bumpZ(target: { zIndex?: number }) {
        const w = window as any
        w[Z_KEY] = (w[Z_KEY] ?? 2000) + 1
        target.zIndex = w[Z_KEY]
    }
    function onMouseDown(ev: MouseEvent) {
        if (!moveMode.value) return
        bumpZ(stopwatch)
        startDrag(ev, stopwatch)
    }

    interface StopwatchInstance {
        id: string
        name: string
        time: number
        isRunning: boolean
        interval: number | null
        laps: number[]
        isFavorite: boolean
        isVisible: boolean
        shouldStaySticky: boolean
        bgColor?: string | null
        btnColor?: string | null
        timeColor?: string | null
        shape?: 'square' | 'rounded' | 'oval' | null
        width?: number
        height?: number
        left?: number
        top?: number
        startedAt?: number | null
        offsetSec?: number
        zIndex?: number
    }


    const {
        stopwatch,
        formatStopwatch,
        toggleStopwatch,
        resetStopwatch,
        addLap,
        startDrag,
        focusInTraining,
    } = defineProps<{
        stopwatch: StopwatchInstance
        formatStopwatch: (time: number) => string
        toggleStopwatch: (sw: StopwatchInstance) => void
        resetStopwatch: (sw: StopwatchInstance) => void
        addLap: (sw: StopwatchInstance) => void
        startDrag: (e: MouseEvent, sw: StopwatchInstance) => void
        focusInTraining: (type: 'timer' | 'stopwatch', id: string) => void
    }>()

    const emit = defineEmits<{
        (e: 'open', id: string): void
        (e: 'crop', id: string): void
        (e: 'close', id: string): void
    }>()

    const cardEl = ref<HTMLElement | null>(null)
    const showMenu = ref(false)
    const showColors = ref(false)

    const menuStyle = computed(() => {
        const w = stopwatch.width ?? cardEl.value?.offsetWidth ?? 240
        const raw = w / 240
        const scale = Math.min(1.6, Math.max(0.9, raw))

        return {
            minWidth: `${150 * scale}px`,
            maxWidth: `${180 * scale}px`,
            width: 'max-content',
            left: 'auto',
            right: '0px',
        }
    })

    function openMenu(_ev?: MouseEvent | PointerEvent) {
        bumpZ(stopwatch)

        showMenu.value = true
        showColors.value = false

        nextTick(() => {
            // kein Auto-Flip mehr → Menü bleibt unten
            bumpZ(stopwatch)
        })
    }


    function handleEdit() {
        showColors.value = !showColors.value
    }

    const shapeRadius = computed<string | undefined>(() => {
        switch (stopwatch.shape) {
            case 'square': return '0px'
            case 'rounded': return '12px'
            case 'oval': return '999px'
            default: return undefined
        }
    })

    function setShape(shape: 'square' | 'rounded' | 'oval' | null, close = false) {
        stopwatch.shape = shape
        if (close) closeMenu()
    }

    
    function closeMenu() {
        showMenu.value = false
    }

    function handleOpen() {
        focusInTraining('stopwatch', stopwatch.id)
        emit('open', stopwatch.id)
        closeMenu()
    }

    const resizeMode = ref(false)
    const moveMode = ref(false)

    function finishMove() {
        if (!moveMode.value) return
        moveMode.value = false
        // speichern passiert automatisch durch Parent-Deepwatch auf left/top/width/height
    }

    function onMoveKey(e: KeyboardEvent) {
        if (!moveMode.value) return

        if (e.key === 'Enter') {
            e.preventDefault()
            finishMove()
            return
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault() // Browser-Save blocken
            finishMove()
        }
    }

    function onMoveOutside(e: PointerEvent) {
        if (!moveMode.value) return
        const root = cardEl.value
        const t = e.target as Node
        if (root && root.contains(t)) return
        finishMove()
    }

    watch(moveMode, (on) => {
        if (on) {
            window.addEventListener('keydown', onMoveKey, true)
            window.addEventListener('pointerdown', onMoveOutside, true)
        } else {
            window.removeEventListener('keydown', onMoveKey, true)
            window.removeEventListener('pointerdown', onMoveOutside, true)
        }
    })

    function handleMove() {
        moveMode.value = true
        closeMenu()
    }

    function handleCrop() {
        resizeMode.value = !resizeMode.value
        emit('crop', stopwatch.id)
        closeMenu()
    }

    // --- Resize Logic ---
    type Corner = 'nw' | 'ne' | 'sw' | 'se' | 'w' | 'e' | 'n' | 's'
    let resizingCorner: Corner | null = null
    const activeCorner = ref<Corner | null>(null)

    // neu: Freeze gegen "spring back"
    const isResizing = ref(false)
    const justResized = ref(false)

    let startX = 0, startY = 0
    let startW = 0, startH = 0
    let startL = 0, startT = 0


    const MIN_W = 180
    const MIN_H = 56
    const MAX_W = 560
    const MAX_H = 260
    const EDGE_PAD = 8

    function startResize(ev: PointerEvent, corner: Corner) {
        bumpZ(stopwatch)

        resizingCorner = corner
        activeCorner.value = corner

        isResizing.value = true
        justResized.value = false

        startX = ev.clientX
        startY = ev.clientY
        startW = stopwatch.width ?? (cardEl.value?.offsetWidth ?? 200)
        startH = stopwatch.height ?? (cardEl.value?.offsetHeight ?? 80)
        startL = stopwatch.left ?? 20
        startT = stopwatch.top ?? 140

        window.addEventListener('pointermove', onResizeMove)
        window.addEventListener('pointerup', stopResize, { once: true })
    }


    function stopResize() {
        resizingCorner = null
        activeCorner.value = null
        window.removeEventListener('pointermove', onResizeMove)

        isResizing.value = false
        justResized.value = true

        nextTick(() => ensureContentFitsHard('settle'))

        // 2 Frames Freeze, dann darf Auto wieder
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                justResized.value = false
            })
        })
    }

    function onResizeMove(ev: PointerEvent) {
        if (!resizingCorner) return
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY

        let newW = startW
        let newH = startH
        let newL = startL
        let newT = startT

        if (resizingCorner.includes('e')) newW = startW + dx
        if (resizingCorner.includes('s')) newH = startH + dy
        if (resizingCorner.includes('w')) { newW = startW - dx; newL = startL + dx }
        if (resizingCorner.includes('n')) { newH = startH - dy; newT = startT + dy }

        newW = Math.min(MAX_W, Math.max(MIN_W, newW))
        newH = Math.min(MAX_H, Math.max(MIN_H, newH))

        const rightEdge = startL + startW
        const bottomEdge = startT + startH
        if (resizingCorner.includes('w')) newL = rightEdge - newW
        if (resizingCorner.includes('n')) newT = bottomEdge - newH

        const maxL = window.innerWidth - newW - EDGE_PAD
        const maxT = window.innerHeight - newH - EDGE_PAD
        newL = Math.min(Math.max(EDGE_PAD, newL), maxL)
        newT = Math.min(Math.max(EDGE_PAD, newT), maxT)

        stopwatch.width = newW
        stopwatch.height = newH
        stopwatch.left = newL
        stopwatch.top = newT
        syncPreset(newW, newH, true)

        // HARD-GUARD live beim Ziehen
        nextTick(() => ensureContentFitsHard('drag'))
    }


    function handleClose() {
        // wenn sie l uft: stoppen, sonst toggle w rde starten
        if (stopwatch.isRunning) {
            toggleStopwatch(stopwatch)
        }
        stopwatch.shouldStaySticky = false
        stopwatch.isVisible = false

        emit('close', stopwatch.id)
        closeMenu()

    }

    // --- Long-Press f r Touch ---
    const isHolding = ref(false)
    let holdTimer: number | null = null
    let pressStartPos: { x: number; y: number } | null = null
    const uiScale = computed(() => 1)

    // Preset mit Hysterese, damit XL nicht sofort wegflippt
    const currentPreset = ref<'compact' | 'large' | 'tall' | 'narrow' | 'xl'>('compact')

    // refs f r Guard
    // refs f r Guard (bleiben, auch wenn wir prim r overflow checken)
    const resetBtnEl = ref<HTMLButtonElement | null>(null)
    const lapBtnEl = ref<HTMLButtonElement | null>(null)

    let isForcingPreset = false

    function hasOverflow(): boolean {
        const el = cardEl.value
        if (!el) return false
        const wOverflow = el.scrollWidth > el.clientWidth + 1
        const hOverflow = el.scrollHeight > el.clientHeight + 1
        return wOverflow || hOverflow
    }

    // REPLACE ensureContentFitsHard(...)
    async function ensureContentFitsHard(phase: 'drag' | 'settle' = 'settle') {
        if (isForcingPreset) return
        const el = cardEl.value
        if (!el) return

        if (resizeMode.value && phase === 'settle') return

        isForcingPreset = true
        try {
            if (
                hasOverflow() &&
                !resizeMode.value &&
                (currentPreset.value === 'compact' || currentPreset.value === 'large')
            ) {
                stopwatch.height = undefined
                await nextTick()
            }

            if (!hasOverflow() || currentPreset.value === 'xl') return

            if (currentPreset.value !== 'compact' && currentPreset.value !== 'narrow') {
                currentPreset.value = 'compact'
                await nextTick()
            }

            if (hasOverflow() && currentPreset.value !== 'narrow') {
                currentPreset.value = 'narrow'
                await nextTick()
            }

            // width snap ONLY after release
            if (phase === 'settle' && hasOverflow()) {
                const needW = Math.min(
                    MAX_W,
                    Math.max(MIN_W, Math.ceil(el.scrollWidth + 2))
                )
                if ((stopwatch.width ?? el.clientWidth) < needW) {
                    stopwatch.width = needW
                    await nextTick()
                }
            }
        } finally {
            isForcingPreset = false
        }
    }
    function setColor(color: string | null, close = true) {
        stopwatch.bgColor = color
        if (close) closeMenu()
    }

    function setBtnColor(color: string | null, close = true) {
        stopwatch.btnColor = color
        if (close) closeMenu()
    }

    function setTimeColor(color: string | null, close = true) {
        stopwatch.timeColor = color
        if (close) closeMenu()
    }


    function syncPreset(w: number, h: number, force = false) {
        const X_ENTER = 160
        const T_ENTER = 125
        const N_ENTER = 280
        const L_ENTER = 320

        if (force) {
            currentPreset.value =
                h >= X_ENTER ? 'xl' :
                    w <= N_ENTER ? 'narrow' :
                        h >= T_ENTER ? 'tall' :
                            w >= L_ENTER ? 'large' :
                                'compact'
        }
    }

    // live beobachten -> egal ob Resize, Font, Name, whatever
    let resizeObs: ResizeObserver | null = null
    onMounted(() => {
        resizeObs = new ResizeObserver(() => {
            if (resizingCorner) return
            ensureContentFitsHard('settle')
        })
        if (cardEl.value) resizeObs.observe(cardEl.value)
        nextTick(() => ensureContentFitsHard('settle'))
    })


    watchEffect(() => {
        const w = stopwatch.width ?? cardEl.value?.offsetWidth ?? 240
        const h = stopwatch.height ?? cardEl.value?.offsetHeight ?? 80

        if (isResizing.value || justResized.value) return

        // tighter Hysterese
        const X_ENTER = 160
        const X_EXIT = 140

        const T_ENTER = 125
        const T_EXIT = 112

        const N_ENTER = 280
        const N_EXIT = 290

        const L_ENTER = 320
        const L_EXIT = 300

        if (currentPreset.value === 'xl') {
            if (h < X_EXIT) {
                currentPreset.value =
                    w <= N_ENTER ? 'narrow' :
                        (h >= T_ENTER ? 'tall' : (w >= L_ENTER ? 'large' : 'compact'))
            }
            return
        }

        if (h >= X_ENTER) {
            currentPreset.value = 'xl'
            return
        }

        if (currentPreset.value === 'narrow') {
            if (w >= N_EXIT) {
                currentPreset.value =
                    h >= T_ENTER ? 'tall' : (w >= L_ENTER ? 'large' : 'compact')
            }
            return
        }

        if (w <= N_ENTER) {
            currentPreset.value = 'narrow'
            return
        }

        if (currentPreset.value === 'tall') {
            if (h < T_EXIT) {
                currentPreset.value = w >= L_ENTER ? 'large' : 'compact'
            }
            return
        }

        if (h >= T_ENTER) {
            currentPreset.value = 'tall'
            return
        }

        if (currentPreset.value === 'large') {
            if (w < L_EXIT) currentPreset.value = 'compact'
            return
        }

        if (w >= L_ENTER) currentPreset.value = 'large'
    })

    const sizePreset = computed(() => currentPreset.value)

    const cardHeight = computed<string | undefined>(() => {
        if (resizeMode.value) {
            // horizontal resize => allow auto height so buttons never get cut
            if (activeCorner.value === 'w' || activeCorner.value === 'e') return undefined
            return (stopwatch.height ?? cardEl.value?.offsetHeight ?? 80) + 'px'
        }

        const p = sizePreset.value
        if (p === 'tall' || p === 'xl' || p === 'narrow') return undefined
        return stopwatch.height ? stopwatch.height + 'px' : undefined
    })


    function finishCrop() {
        if (resizingCorner) stopResize()
        resizeMode.value = false
    }


    function onCropKey(e: KeyboardEvent) {
        if (!resizeMode.value) return
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            finishCrop()
        }
    }

    function onCropOutside(e: PointerEvent) {
        if (!resizeMode.value) return
        const root = cardEl.value
        const t = e.target as Node
        if (root && root.contains(t)) return
        finishCrop()
    }

    watch(resizeMode, (on) => {
        if (on) {
            window.addEventListener('keydown', onCropKey, true)
            window.addEventListener('pointerdown', onCropOutside, true)
        } else {
            window.removeEventListener('keydown', onCropKey, true)
            window.removeEventListener('pointerdown', onCropOutside, true)
        }
    })
    watch(
        () => [stopwatch.name, formatStopwatch(stopwatch.time), stopwatch.isRunning],
        () => nextTick(() => ensureContentFitsHard('settle')),
        { flush: 'post' }
    )
    onBeforeUnmount(() => {
        resizeObs?.disconnect()
        resizeObs = null
        window.removeEventListener('keydown', onCropKey, true)
        window.removeEventListener('pointerdown', onCropOutside, true)

        window.removeEventListener('keydown', onMoveKey, true)
        window.removeEventListener('pointerdown', onMoveOutside, true)
    })


    function clearHold() {
        if (holdTimer != null) {
            clearTimeout(holdTimer)
            holdTimer = null
        }
    }

    function cancelPointerHold() {
        clearHold()
        isHolding.value = false
        pressStartPos = null
    }

    function onPointerDown(ev: PointerEvent) {
        bumpZ(stopwatch)

        if (ev.pointerType === 'mouse' && ev.button !== 0) return

        if (moveMode.value) {
            // Mouse-Drag l uft  ber @mousedown, sonst doppelt -> "klebt"
            if (ev.pointerType !== 'mouse') {
                clearHold()
                isHolding.value = false
                pressStartPos = null
                startDrag(ev as any, stopwatch)
            }
            return
        }

        isHolding.value = true
        pressStartPos = { x: ev.clientX, y: ev.clientY }
        clearHold()
        holdTimer = window.setTimeout(() => {
            openMenu(ev)
        }, 550) as unknown as number
    }

    function onPointerMove(ev: PointerEvent) {
        if (moveMode.value) return
        if (!isHolding.value || !pressStartPos) return
        const dx = ev.clientX - pressStartPos.x
        const dy = ev.clientY - pressStartPos.y
        if (dx * dx + dy * dy > 36) {
            cancelPointerHold()
        }
    }

    function onPointerUp(_ev: PointerEvent) {
        cancelPointerHold()
    }

    function onPointerCancel() {
        cancelPointerHold()
    }

    // Outside-Click zum Schlie en
    function onOutsidePointer(e: PointerEvent) {
        if (!showMenu.value) return
        const root = cardEl.value
        const menuEl = root?.querySelector('.hold-menu') as HTMLElement | null
        const t = e.target as Node
        if (root && root.contains(t)) return
        if (menuEl && menuEl.contains(t)) return
        closeMenu()
    }

    watch(showMenu, (open) => {
        if (open) {
            window.addEventListener('pointerdown', onOutsidePointer, true)
        } else {
            window.removeEventListener('pointerdown', onOutsidePointer, true)
        }
    })

</script>

<style>
    /* Name-Link */
    .name-link {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

        .name-link:hover {
            text-decoration-thickness: 3px;
        }
    /* === Sticky Timer & Stoppuhr Styles   aus dem Parent  bernommen === */
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
        cursor: default;
        z-index: 2000;
        border: 1px solid var(--border-color);
        box-sizing: border-box;
    }

        .sticky-timer-card.movable,
        .sticky-stopwatch-card.movable {
            cursor: grab;
        }

            .sticky-timer-card.movable:active,
            .sticky-stopwatch-card.movable:active {
                cursor: grabbing;
            }

        .sticky-timer-card:not(.resizing),
        .sticky-stopwatch-card:not(.resizing) {
            overflow: hidden;
        }

        .sticky-timer-card.resizing,
        .sticky-stopwatch-card.resizing {
            overflow: visible;
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
            color: var(--time-color, var(--accent-primary));
        }

    html.dark-mode .sticky-timer-card,
    html.dark-mode .sticky-stopwatch-card {
        background: #0d1117;
        border: 1px solid #30363d;
    }


    .sticky-stopwatch-card .hold-menu {
        left: auto;
        right: auto;
        min-width: 150px;
        max-width: 180px;
        width: max-content;
    }


        .sticky-stopwatch-card .hold-menu button:hover {
            background: rgba(255,255,255,.06);
        }

    html.dark-mode .sticky-stopwatch-card .hold-menu button:hover {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card .sticky-menu {
        position: absolute;
        top: calc(100% + 6px);
        right: 0;
        left: auto;
        min-width: 150px;
        max-width: 180px;
        z-index: 10000;
        /* nur wenn kein Platz -> scrollbar im Menü */
        max-height: calc(100vh - 16px);
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
    }

            .sticky-stopwatch-card .sticky-menu button:hover {
                background: rgba(0,0,0,.06) !important;
            }

    html.dark-mode .sticky-stopwatch-card .sticky-menu button:hover {
        background: rgba(255,255,255,.06) !important;
    }

    .sticky-stopwatch-card.resizing {
        outline: 2px dashed var(--accent-primary);
        outline-offset: 2px;
    }

    .sticky-stopwatch-card .resize-handle {
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: var(--accent-primary);
        opacity: .9;
        z-index: 10001;
    }

        .sticky-stopwatch-card .resize-handle.nw {
            top: -6px;
            left: -6px;
            cursor: nwse-resize;
        }

        .sticky-stopwatch-card .resize-handle.ne {
            top: -6px;
            right: -6px;
            cursor: nesw-resize;
        }

        .sticky-stopwatch-card .resize-handle.sw {
            bottom: -6px;
            left: -6px;
            cursor: nesw-resize;
        }

        .sticky-stopwatch-card .resize-handle.se {
            bottom: -6px;
            right: -6px;
            cursor: nwse-resize;
        }

    .sticky-stopwatch-card {
        --ui-scale: 1;
        padding: calc(0.5rem * var(--ui-scale)) calc(1rem * var(--ui-scale));
        gap: calc(0.5rem * var(--ui-scale));
        font-size: calc(0.85rem * var(--ui-scale));
    }

        .sticky-stopwatch-card .time {
            font-size: calc(1rem * var(--ui-scale));
        }

        .sticky-stopwatch-card > button {
            font-size: calc(0.75rem * var(--ui-scale));
            padding: calc(0.3rem * var(--ui-scale)) calc(0.6rem * var(--ui-scale));
            border-radius: calc(6px * var(--ui-scale));
        }

        .sticky-stopwatch-card.compact {
            flex-direction: row;
            align-items: center;
            /* wichtig: nix abschneiden, lieber umbrechen */
            flex-wrap: wrap;
            row-gap: 0.35rem;
            /* falls ne feste height gespeichert ist -> trotzdem wachsen */
            height: auto !important;
        }
    .shape-btn {
        border: 1px solid var(--border-color);
        background: transparent;
        color: inherit;
        font: inherit;
        font-size: .75rem;
        padding: .2rem .45rem;
        border-radius: 6px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: .3rem;
    }

    .shape-check {
        font-weight: 900;
        font-size: .9em;
        line-height: 1;
        opacity: .9;
    }


        .shape-btn:hover {
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .shape-btn:hover {
        background: rgba(255,255,255,.06);
    }

            .sticky-stopwatch-card.compact .name-link,
            .sticky-stopwatch-card.compact .time {
                flex: 1 1 auto;
                min-width: 0;
            }

            .sticky-stopwatch-card.compact > button {
                flex: 0 0 auto;
            }


        .sticky-stopwatch-card.large {
            flex-direction: row;
            align-items: center;
            border-radius: 16px;
            padding: calc(.7rem * var(--ui-scale)) calc(1.1rem * var(--ui-scale));
            gap: calc(.6rem * var(--ui-scale));
            box-shadow: 0 8px 22px rgba(0,0,0,.16);
            background: linear-gradient(180deg, var(--bg-secondary), rgba(0,0,0,.02));
        }

            .sticky-stopwatch-card.large .name-link {
                font-size: calc(.95rem * var(--ui-scale));
                opacity: .9;
            }

            .sticky-stopwatch-card.large .time {
                font-size: calc(1.9rem * var(--ui-scale));
                font-weight: 800;
                letter-spacing: 1px;
                padding: calc(.15rem * var(--ui-scale)) calc(.55rem * var(--ui-scale));
                border-radius: 10px;
                background: rgba(0,0,0,.05);
            }

    html.dark-mode .sticky-stopwatch-card.large .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card.large > button {
        font-size: calc(.78rem * var(--ui-scale));
        padding: calc(.32rem * var(--ui-scale)) calc(.7rem * var(--ui-scale));
        border-radius: 8px;
    }

    .sticky-stopwatch-card.xl {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: calc(.6rem * var(--ui-scale));
        border-radius: 18px;
        padding: calc(1rem * var(--ui-scale)) calc(1.4rem * var(--ui-scale));
        box-shadow: 0 14px 40px rgba(0,0,0,.25);
    }

        .sticky-stopwatch-card.xl .name-link {
            font-size: calc(1rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-stopwatch-card.xl .time {
            font-size: calc(2.6rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 1.8px;
            padding: .3rem 1rem;
            border-radius: 12px;
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .sticky-stopwatch-card.xl .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card.xl > button {
        font-size: calc(.9rem * var(--ui-scale));
        padding: calc(.5rem * var(--ui-scale)) calc(1rem * var(--ui-scale));
        border-radius: 10px;
    }

    .sticky-stopwatch-card .resize-handle {
        touch-action: none;
    }

        /* neu: links/rechts mittig */
        .sticky-stopwatch-card .resize-handle.w {
            top: 50%;
            left: -7px;
            transform: translateY(-50%);
            cursor: ew-resize;
            width: 14px;
            height: 24px;
            border-radius: 6px;
        }

        .sticky-stopwatch-card .resize-handle.e {
            top: 50%;
            right: -7px;
            transform: translateY(-50%);
            cursor: ew-resize;
            width: 14px;
            height: 24px;
            border-radius: 6px;
        }
        /* neu: oben/unten mittig */
        .sticky-stopwatch-card .resize-handle.n {
            top: -7px;
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
            width: 24px;
            height: 14px;
            border-radius: 6px;
        }

        .sticky-stopwatch-card .resize-handle.s {
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
            width: 24px;
            height: 14px;
            border-radius: 6px;
        }
    /* ===== Tall v2: Split-Vertical (zwischen normal und x) ===== */
    .sticky-stopwatch-card.tall {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        border-radius: 14px;
        padding: calc(.75rem * var(--ui-scale)) calc(1rem * var(--ui-scale));
        gap: calc(.45rem * var(--ui-scale));
        box-shadow: 0 10px 28px rgba(0,0,0,.18);
        background: linear-gradient(180deg, var(--bg-secondary), var(--bg-primary));
        justify-content: center;
    }

        .sticky-stopwatch-card.tall .name-link {
            order: 1;
            flex-basis: 100%; /* eigene Zeile */
            text-align: center; /* mittig */
            font-size: calc(.95rem * var(--ui-scale));
            opacity: .9;
            white-space: nowrap;
        }


        .sticky-stopwatch-card.tall .time {
            order: 2;
            flex-basis: 100%;
            text-align: center;
            font-size: calc(2.25rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 1.4px;
            padding: calc(.2rem * var(--ui-scale)) calc(.9rem * var(--ui-scale));
            border-radius: 12px;
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .sticky-stopwatch-card.tall .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card.tall > button {
        order: 3;
        flex: 0 1 auto;
        white-space: nowrap;
        font-size: calc(.8rem * var(--ui-scale));
        padding: calc(.34rem * var(--ui-scale)) calc(.75rem * var(--ui-scale));
        border-radius: 9px;
    }

    .sticky-stopwatch-card.narrow {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: calc(.35rem * var(--ui-scale));
        padding: calc(.6rem * var(--ui-scale)) calc(.8rem * var(--ui-scale));
        border-radius: 12px;
    }

        .sticky-stopwatch-card.narrow .name-link {
            text-align: center;
            font-size: calc(.95rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-stopwatch-card.narrow .time {
            text-align: center;
            font-size: calc(2.1rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 1.3px;
            padding: calc(.14rem * var(--ui-scale)) calc(.7rem * var(--ui-scale));
            border-radius: 10px;
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .sticky-stopwatch-card.narrow .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card.narrow > button {
        width: 100%;
        max-width: 160px;
        white-space: nowrap;
        font-size: calc(.82rem * var(--ui-scale));
        padding: calc(.32rem * var(--ui-scale)) calc(.7rem * var(--ui-scale));
        border-radius: 9px;
    }

    .color-row {
        display: flex;
        align-items: center;
        gap: .35rem;
        padding: .35rem .2rem .5rem;
        border-top: 1px solid var(--border-color);
        margin-top: .25rem;
        flex-wrap: wrap;
    }

    .color-label {
        font-size: .75rem;
        opacity: .8;
        margin-right: .25rem;
    }

    /* StickyStopwatchCard.vue | REPLACE menu button selectors */
    .sticky-stopwatch-card .hold-menu .menu-item {
        box-sizing: border-box;
        display: block;
        width: 100%;
        padding: .5rem .6rem;
        cursor: pointer;
        font-size: .85rem;
        border-radius: 6px;
        text-align: left;
        background: transparent;
        border: 0;
        color: inherit;
        font: inherit;
        font-weight: 400;
        line-height: 1.2;
    }

        .sticky-stopwatch-card .hold-menu .menu-item.danger {
            color: #ef4444;
        }

    .sticky-stopwatch-card .sticky-menu .menu-item {
        background: transparent !important;
        border: 0 !important;
        padding: .5rem .6rem !important;
        font-size: .85rem !important;
        font-weight: 400 !important;
        border-radius: 6px !important;
        display: block;
        width: 100%;
        text-align: left;
        cursor: pointer;
        line-height: 1.2;
    }

    /* StickyStopwatchCard.vue | ADD stronger dot specificity */
    .sticky-stopwatch-card .color-dot {
        width: 18px !important;
        height: 18px !important;
        padding: 0 !important;
        display: inline-block !important;
        border-radius: 999px !important;
        text-align: center !important;
        background-clip: padding-box;
    }

        .color-dot.default {
            background: var(--bg-secondary);
        }

        .color-dot.transparent {
            background: repeating-linear-gradient( 45deg, rgba(255,255,255,.2), rgba(255,255,255,.2) 4px, rgba(0,0,0,.2) 4px, rgba(0,0,0,.2) 8px );
        }

        .color-dot.blue {
            background: #1e3a8a;
        }

        .color-dot.green {
            background: #166534;
        }

        .color-dot.amber {
            background: #92400e;
        }

    .color-picker {
        width: 26px;
        height: 20px;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
    }
    html.dark-mode .sticky-timer-card > button,
    html.dark-mode .sticky-stopwatch-card > button {
        background: var(--btn-bg, #4B6CB7);
    }

        html.dark-mode .sticky-timer-card > button:hover,
        html.dark-mode .sticky-stopwatch-card > button:hover {
            filter: brightness(0.95);
        }
</style>
