<template>
    <div class="sticky-timer-card"
         ref="cardEl"
         :class="[{ resizing: resizeMode }, sizePreset]"
         :style="{
  left: timer.left + 'px',
  top: timer.top + 'px',
  width: timer.width ? timer.width + 'px' : undefined,
  height: cardHeight,
  zIndex: timer.zIndex ?? 2000,
  '--ui-scale': uiScale
}"
         @mousedown="onMouseDown($event)"
         @mousedown.right.prevent="openMenu($event as any)"
         @contextmenu.prevent="openMenu($event as any)"
         @pointerdown="onPointerDown"
         @pointermove="onPointerMove"
         @pointerup="onPointerUp"
         @pointercancel="onPointerCancel">
        <span class="name-link"
              @click="focusInTraining('timer', timer.id)"
              @mousedown.stop>
            {{ timer.name || 'Timer' }}
        </span>
        <span class="time">{{ formatTimer(timer.time) }}</span>
        <button @click="startTimer(timer)" :disabled="timer.isRunning">Start</button>
        <button @click="stopTimer(timer)" :disabled="!timer.isRunning">Stop</button>
        <button @click="resetTimer(timer)">Reset</button>
        
        <HoldMenu v-if="showMenu"
                  class="sticky-menu"
                  :menuStyle="menuStyle">
            <button type="button" @click="handleOpen">
                &#214;ffnen
            </button>
            <button type="button" @click="handleCrop">
                Zuschneiden
            </button>
            <button type="button" class="danger" @click="handleClose">
                Schlie&#223;en
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

    // ---- z-index focus handling (global across all stickies)
    const Z_KEY = '__stickyZ'
    function bumpZ(target: { zIndex?: number }) {
        const w = window as any
        w[Z_KEY] = (w[Z_KEY] ?? 2000) + 1
        target.zIndex = w[Z_KEY]
    }
    function onMouseDown(ev: MouseEvent) {
        bumpZ(timer)
        startDrag(ev, timer)
    }

    const emit = defineEmits<{
        (e: 'open', id: string): void
        (e: 'crop', id: string): void
        (e: 'close', id: string): void
    }>()

    const cardEl = ref<HTMLElement | null>(null)
    const showMenu = ref(false)

    const menuStyle = computed(() => ({
        minWidth: '150px',
        maxWidth: '180px',
    }))

    function openMenu(_ev?: MouseEvent | PointerEvent) {
        showMenu.value = true
        nextTick(() => {
            const el = cardEl.value?.querySelector<HTMLElement>('.hold-menu') || null
                ; (el as any)?.__autoFlip?.update?.()
        })
    }

    function closeMenu() {
        showMenu.value = false
    }

    function handleOpen() {
        focusInTraining('timer', timer.id)
        emit('open', timer.id)
        closeMenu()
    }
    const resizeMode = ref(false)
    type Corner = 'nw' | 'ne' | 'sw' | 'se' | 'w' | 'e' | 'n' | 's'
    let resizingCorner: Corner | null = null
    const activeCorner = ref<Corner | null>(null)

    // neu: Resize-Freeze gegen "spring back"
    const isResizing = ref(false)
    const justResized = ref(false)

    let startX = 0, startY = 0
    let startW = 0, startH = 0
    let startL = 0, startT = 0

    const MIN_W = 180
    const MIN_H = 56
    const MAX_W = 520
    const MAX_H = 220
    const EDGE_PAD = 8

    function startResize(ev: PointerEvent, corner: Corner) {
        bumpZ(timer)

        resizingCorner = corner
        activeCorner.value = corner

        isResizing.value = true
        justResized.value = false

        startX = ev.clientX
        startY = ev.clientY
        startW = timer.width ?? (cardEl.value?.offsetWidth ?? 200)
        startH = timer.height ?? (cardEl.value?.offsetHeight ?? 80)
        startL = timer.left ?? 20
        startT = timer.top ?? 80

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

        // neu: 2 frames Freeze, dann wieder Auto
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

        // Gegenkanten fix halten, damit bei MAX/MIN nix "wegrutscht"
        const rightEdge = startL + startW
        const bottomEdge = startT + startH
        if (resizingCorner.includes('w')) newL = rightEdge - newW
        if (resizingCorner.includes('n')) newT = bottomEdge - newH

        const maxL = window.innerWidth - newW - EDGE_PAD
        const maxT = window.innerHeight - newH - EDGE_PAD
        newL = Math.min(Math.max(EDGE_PAD, newL), maxL)
        newT = Math.min(Math.max(EDGE_PAD, newT), maxT)

        timer.width = newW
        timer.height = newH
        timer.left = newL
        timer.top = newT

        syncPreset(newW, newH, true)

        // HARD-GUARD live
        nextTick(() => ensureContentFitsHard('drag'))

    }

    function handleCrop() {
        // Zuschneiden = Resize-Mode an/aus
        resizeMode.value = !resizeMode.value
        emit('crop', timer.id)
        closeMenu()
    }

    function handleClose() {
        // Timer sauber stoppen + unsticky machen
        stopTimer(timer)
        timer.shouldStaySticky = false
        timer.isVisible = false

        emit('close', timer.id)
        // kein closeMenu() nötig, Parent schmeißt die Card raus
        closeMenu()

    }

    // --- Long-Press f r Touch (Gedr ckthalten) ---
    const isHolding = ref(false)
    let holdTimer: number | null = null
    let pressStartPos: { x: number; y: number } | null = null

    // UI-Scale je nach Breite (clamped)
    const uiScale = computed(() => 1)

    const currentPreset = ref<'compact' | 'large' | 'tall' | 'narrow' | 'xl'>('compact')

    let isForcingPreset = false

    function hasOverflow(): boolean {
        const el = cardEl.value
        if (!el) return false
        const wOverflow = el.scrollWidth > el.clientWidth + 1
        const hOverflow = el.scrollHeight > el.clientHeight + 1
        return wOverflow || hOverflow
    }

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
                timer.height = undefined
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

            if (phase === 'settle' && hasOverflow()) {
                const needW = Math.min(
                    MAX_W,
                    Math.max(MIN_W, Math.ceil(el.scrollWidth + 2))
                )
                if ((timer.width ?? el.clientWidth) < needW) {
                    timer.width = needW
                    await nextTick()
                }
            }
        } finally {
            isForcingPreset = false
        }
    }

    function calcPreset(w: number, h: number) {
        const X_ENTER = 140
        const T_ENTER = 105
        const N_ENTER = 260
        const L_ENTER = 300

        return (
            h >= X_ENTER ? 'xl' :
                w <= N_ENTER ? 'narrow' :
                    h >= T_ENTER ? 'tall' :
                        w >= L_ENTER ? 'large' :
                            'compact'
        )
    }

    function syncPreset(w: number, h: number, force = false) {
        if (force) {
            currentPreset.value = calcPreset(w, h)
        }
    }


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
        const w = timer.width ?? cardEl.value?.offsetWidth ?? 220
        const h = timer.height ?? cardEl.value?.offsetHeight ?? 80

        if (isResizing.value || justResized.value) return

        // tighter Hysterese = schnelleres Umschalten
        const X_ENTER = 140
        const X_EXIT = 125

        const T_ENTER = 105
        const T_EXIT = 95

        // früher narrow rein, etwas später wieder raus
        const N_ENTER = 260
        const N_EXIT = 270

        // large erst später rein, damit narrow nicht zu spät kommt
        const L_ENTER = 300
        const L_EXIT = 285

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


    const sizePreset = computed(() => {
        // normaler Betrieb -> gespeichertes Preset
        if (!resizeMode.value) return currentPreset.value

        // Crop-Modus -> Live-Preview anhand aktueller Maße
        const w = timer.width ?? cardEl.value?.offsetWidth ?? 220
        const h = timer.height ?? cardEl.value?.offsetHeight ?? 80
        return calcPreset(w, h)
    })
    const cardHeight = computed<string | undefined>(() => {
        if (resizeMode.value) {
            if (activeCorner.value === 'w' || activeCorner.value === 'e') return undefined
            return (timer.height ?? cardEl.value?.offsetHeight ?? 80) + 'px'
        }

        const p = sizePreset.value
        if (p === 'tall' || p === 'xl' || p === 'narrow') return undefined
        return timer.height ? timer.height + 'px' : undefined
    })

    function finishCrop() {
        if (resizingCorner) stopResize()
        resizeMode.value = false
        // speichern passiert automatisch durch deep-watch im Parent
    }


    function onCropKey(e: KeyboardEvent) {
        if (!resizeMode.value) return
        if (e.key === 'Enter') {
            e.preventDefault()
            finishCrop()
        }
        if (e.key === 'Escape') {
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

    onBeforeUnmount(() => {
        resizeObs?.disconnect()
        resizeObs = null
        window.removeEventListener('keydown', onCropKey, true)
        window.removeEventListener('pointerdown', onCropOutside, true)
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
        bumpZ(timer)

        if (ev.pointerType !== 'touch') return
        isHolding.value = true
        pressStartPos = { x: ev.clientX, y: ev.clientY }
        clearHold()
        holdTimer = window.setTimeout(() => {
            openMenu(ev)
        }, 550) as unknown as number
    }


    function onPointerMove(ev: PointerEvent) {
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
    watch(
        () => [timer.name, formatTimer(timer.time), timer.isRunning],
        () => nextTick(() => ensureContentFitsHard('settle')),
        { flush: 'post' }
    )
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
        width?: number
        height?: number
        left?: number
        top?: number
        endAt?: number | null
        zIndex?: number

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
        cursor: grab;
        z-index: 2000;
        border: 1px solid var(--border-color);
        box-sizing: border-box;
    }
        .sticky-timer-card:not(.resizing),
        .sticky-stopwatch-card:not(.resizing) {
            overflow: hidden;
        }

        .sticky-timer-card.resizing,
        .sticky-stopwatch-card.resizing {
            overflow: visible;
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



        .sticky-timer-card .sticky-menu {
            position: absolute; /* bleibt innerhalb der Card */
            top: calc(100% + 6px); /* unter der Card */
            right: 0; /* rechts ausrichten */
            left: auto;
            min-width: 150px;
            max-width: 180px;
            z-index: 10000;
        }

            /* Menü-Buttons dürfen NICHT wie Sticky-Buttons aussehen */
            .sticky-timer-card .sticky-menu button {
                background: transparent !important;
                border: 0 !important;
                padding: .5rem .6rem !important;
                font-size: .85rem !important;
                font-weight: 600;
                border-radius: 6px !important;
                display: block;
                width: 100%;
                text-align: left;
                cursor: pointer;
                line-height: 1.2;
            }

                .sticky-timer-card .sticky-menu button:hover {
                    background: rgba(0,0,0,.06) !important;
                }

    .sticky-timer-card {
        --ui-scale: 1;
        padding: calc(0.5rem * var(--ui-scale)) calc(1rem * var(--ui-scale));
        gap: calc(0.5rem * var(--ui-scale));
        font-size: calc(0.85rem * var(--ui-scale));
    }

        .sticky-timer-card .time {
            font-size: calc(1rem * var(--ui-scale));
        }

        .sticky-timer-card > button {
            font-size: calc(0.75rem * var(--ui-scale));
            padding: calc(0.3rem * var(--ui-scale)) calc(0.6rem * var(--ui-scale));
            border-radius: calc(6px * var(--ui-scale));
        }

    html.dark-mode .sticky-timer-card .sticky-menu button:hover {
        background: rgba(255,255,255,.06) !important;
    }
    /* Kontextmenü nur für Sticky-Timer */
    .sticky-timer-card .hold-menu {
        left: auto;
        right: auto;
        min-width: 150px;
        max-width: 180px;
    }
        /* Reset der Button-Styles, damit sie nicht wie die Sticky-Buttons aussehen */
        .sticky-timer-card .hold-menu button {
            /* kein all: unset -> sonst killt es .danger */
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
            line-height: 1.2;
        }

            .sticky-timer-card .hold-menu button.danger {
                color: #ef4444;
            }

            .sticky-timer-card .hold-menu button:hover {
                background: rgba(0,0,0,.06);
            }

    html.dark-mode .sticky-timer-card .hold-menu button:hover {
        background: rgba(255,255,255,.06);
    }

    html.dark-mode .sticky-timer-card,
    html.dark-mode .sticky-stopwatch-card {
        background: #0d1117;
        border: 1px solid #30363d;
    }

    .sticky-timer-card > button,
    .sticky-stopwatch-card > button {
        background: var(--accent-primary);
        border: none;
        color: #fff;
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s ease;
    }

        .sticky-timer-card > button:hover,
        .sticky-stopwatch-card > button:hover {
            background: var(--accent-hover);
        }

        .sticky-timer-card > button:disabled,
        .sticky-stopwatch-card > button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

    html.dark-mode .sticky-timer-card > button,
    html.dark-mode .sticky-stopwatch-card > button {
        background: #4B6CB7;
    }

        html.dark-mode .sticky-timer-card > button:hover,
        html.dark-mode .sticky-stopwatch-card > button:hover {
            background: #5a7bc4;
        }

    .sticky-timer-card.resizing {
        outline: 2px dashed var(--accent-primary);
        outline-offset: 2px;
    }

    .sticky-timer-card .resize-handle {
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background: var(--accent-primary);
        opacity: .9;
        z-index: 10001;
    }

        .sticky-timer-card .resize-handle.nw {
            top: -6px;
            left: -6px;
            cursor: nwse-resize;
        }

        .sticky-timer-card .resize-handle.ne {
            top: -6px;
            right: -6px;
            cursor: nesw-resize;
        }

        .sticky-timer-card .resize-handle.sw {
            bottom: -6px;
            left: -6px;
            cursor: nesw-resize;
        }

        .sticky-timer-card .resize-handle.se {
            bottom: -6px;
            right: -6px;
            cursor: nwse-resize;
        }

    /* ===== Size Presets (Timer) ===== */
    .sticky-timer-card.compact {
        flex-direction: row;
        align-items: center;
        flex-wrap: wrap;
        row-gap: 0.35rem;
        height: auto !important;
    }

        .sticky-timer-card.compact .name-link,
        .sticky-timer-card.compact .time {
            flex: 1 1 auto;
            min-width: 0;
        }

        .sticky-timer-card.compact > button {
            flex: 0 0 auto;
        }


    .sticky-timer-card.large {
        flex-direction: row;
        align-items: center;
        border-radius: 16px;
        padding: calc(.7rem * var(--ui-scale)) calc(1.1rem * var(--ui-scale));
        gap: calc(.6rem * var(--ui-scale));
        box-shadow: 0 8px 22px rgba(0,0,0,.16);
        background: linear-gradient(180deg, var(--bg-secondary), rgba(0,0,0,.02));
    }

        .sticky-timer-card.large .name-link {
            font-size: calc(.95rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-timer-card.large .time {
            font-size: calc(1.8rem * var(--ui-scale));
            font-weight: 800;
            letter-spacing: 1px;
            padding: calc(.15rem * var(--ui-scale)) calc(.55rem * var(--ui-scale));
            border-radius: 10px;
            background: rgba(0,0,0,.05);
        }

    html.dark-mode .sticky-timer-card.large .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-timer-card.large > button {
        font-weight: 600;
        font-size: calc(.78rem * var(--ui-scale));
        padding: calc(.32rem * var(--ui-scale)) calc(.7rem * var(--ui-scale));
        border-radius: 8px;
    }

    /* XL = Clock-Look */
    .sticky-timer-card.xl {
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: calc(.6rem * var(--ui-scale));
        width: auto; /* width bleibt via inline-style */
        border-radius: 999px;
        padding: calc(0.9rem * var(--ui-scale)) calc(1.2rem * var(--ui-scale));
        box-shadow: 0 14px 40px rgba(0,0,0,.25);
        position: fixed;
    }

        .sticky-timer-card.xl .name-link {
            font-size: calc(.9rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-timer-card.xl .time {
            font-size: calc(2.4rem * var(--ui-scale));
            font-weight: 800;
            letter-spacing: 1.5px;
            padding: .25rem .8rem;
            border-radius: 999px;
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .sticky-timer-card.xl .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-timer-card.xl > button {
        font-size: calc(.9rem * var(--ui-scale));
        padding: calc(.45rem * var(--ui-scale)) calc(.9rem * var(--ui-scale));
        border-radius: 999px;
    }
    .sticky-timer-card .resize-handle {
        touch-action: none;
    }

        .sticky-timer-card .resize-handle.w {
            top: 50%;
            left: -7px;
            transform: translateY(-50%);
            cursor: ew-resize;
            width: 14px;
            height: 24px;
            border-radius: 6px;
        }

        .sticky-timer-card .resize-handle.e {
            top: 50%;
            right: -7px;
            transform: translateY(-50%);
            cursor: ew-resize;
            width: 14px;
            height: 24px;
            border-radius: 6px;
        }
        .sticky-timer-card .resize-handle.n {
            top: -7px;
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
            width: 24px;
            height: 14px;
            border-radius: 6px;
        }

        .sticky-timer-card .resize-handle.s {
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            cursor: ns-resize;
            width: 24px;
            height: 14px;
            border-radius: 6px;
        }
    /* ===== Tall v2: Split-Vertical (zwischen normal und x) ===== */
    .sticky-timer-card.tall {
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

        /* Name bleibt links oben */
        .sticky-timer-card.tall .name-link {
            order: 1;
            flex-basis: 100%;
            text-align: center;
            font-size: calc(.95rem * var(--ui-scale));
            opacity: .9;
            white-space: nowrap;
        }

        /* Zeit bekommt eigene Zeile, mega präsent */
        .sticky-timer-card.tall .time {
            order: 2;
            flex-basis: 100%;
            text-align: center;
            font-size: calc(2.1rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 1.3px;
            padding: calc(.18rem * var(--ui-scale)) calc(.8rem * var(--ui-scale));
            border-radius: 12px;
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .sticky-timer-card.tall .time {
        background: rgba(255,255,255,.06);
    }

    /* Buttons teilen sich unten eine Reihe */
    .sticky-timer-card.tall > button {
        order: 3;
        flex: 0 1 auto; /* shrink statt wrap */
        white-space: nowrap; /* text bleibt in einer Zeile */
        font-size: calc(.8rem * var(--ui-scale));
        padding: calc(.34rem * var(--ui-scale)) calc(.75rem * var(--ui-scale));
        border-radius: 9px;
    }

    /* ===== Narrow: ultra-schmal => alles bleibt im Card ===== */
    .sticky-timer-card.narrow {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: calc(.35rem * var(--ui-scale));
        padding: calc(.6rem * var(--ui-scale)) calc(.8rem * var(--ui-scale));
        border-radius: 12px;
    }

        .sticky-timer-card.narrow .name-link {
            text-align: center;
            font-size: calc(.9rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-timer-card.narrow .time {
            text-align: center;
            font-size: calc(1.9rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 1.2px;
            padding: calc(.12rem * var(--ui-scale)) calc(.6rem * var(--ui-scale));
            border-radius: 10px;
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .sticky-timer-card.narrow .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-timer-card.narrow > button {
        width: 100%;
        max-width: 150px;
        white-space: nowrap; /* kein Wrap */
        font-size: calc(.8rem * var(--ui-scale));
        padding: calc(.32rem * var(--ui-scale)) calc(.7rem * var(--ui-scale));
        border-radius: 9px;
    }

</style>
