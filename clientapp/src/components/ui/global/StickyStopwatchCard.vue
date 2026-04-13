<template>
    <div v-if="stickyEnabled"
         class="sticky-stopwatch-card"
         ref="cardEl"
         :data-sticky-stopwatch-id="stopwatch.id"
         :class="[
             {
                 resizing: resizeMode,
                 movable: moveMode,
                 'menu-open': showMenu,
                 [xlLayoutClass]: !!xlLayoutClass,
                 'lap-flash-positive': lapFlashTone === 'positive',
                 'lap-flash-negative': lapFlashTone === 'negative',
                 'is-stack-collapsed': stackCount > 1 && !stackExpanded,
                 'is-stack-expanded': stackCount > 1 && stackExpanded,
                 'is-stack-passive': stackCount > 1 && !stackExpanded && stackIndex > 0,
                 'is-dock-launch': dockLaunchActive,
                 'is-stack-bump': stackBumpActive,
             },
             sizePreset
         ]"
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
  '--time-color': stopwatch.timeColor ?? undefined,
  '--stack-index': String(stackIndex),
  '--stack-count': String(stackCount),
  '--dock-from-x': `${dockFromX}px`,
  '--dock-from-y': `${dockFromY}px`
}"
         @mousedown="onMouseDown($event)"
         @mousedown.right.prevent="openMenu($event as any)"
         @contextmenu.prevent="openMenu($event as any)"
         @click.capture="onClickCapture"
         @pointerdown.capture="onPointerDown"
         @pointermove.capture="onPointerMove"
         @pointerup.capture="onPointerUp"
         @pointercancel.capture="onPointerCancel">


        <span class="name-link"
              @click="focusInTraining('stopwatch', stopwatch.id)"
              @mousedown.stop="onMaybeDrag($event)">
            {{ stopwatch.name || 'Stoppuhr' }}
        </span>
        <span class="time"
              :class="{ 'time--ring': sizePreset === 'xl' }"
              :style="sizePreset === 'xl' ? stopwatchRingStyle : undefined"
              @mousedown.stop="onMaybeDrag($event)">
            <template v-if="sizePreset === 'xl'">
                <svg class="time-ring__svg" viewBox="0 0 120 120" aria-hidden="true">
                    <circle class="time-ring__track" cx="60" cy="60" r="48" />
                    <circle class="time-ring__progress" cx="60" cy="60" r="48" :style="stopwatchRingStrokeStyle" />
                </svg>
                <span class="time-ring__value">{{ stopwatchRingValue }}</span>
                <span class="time-ring__label">{{ formatStopwatch(stopwatch.time) }}</span>
            </template>
            <template v-else>
                {{ formatStopwatch(stopwatch.time) }}
            </template>
        </span>

        <button class="sticky-action"
                :class="stopwatch.isRunning ? 'sticky-action--pause' : 'sticky-action--start'"
                @click="onToggleClick">
            {{ stopwatch.isRunning ? 'Pause' : 'Start' }}
        </button>
        <button ref="resetBtnEl"
                class="sticky-action sticky-action--reset"
                @click="onResetClick">
            Reset
        </button>
        <button ref="lapBtnEl"
                class="sticky-action sticky-action--lap"
                @click="onLapClick"
                :disabled="!stopwatch.isRunning">
            Runde
        </button>
        <transition name="sticky-alert-pop">
            <div v-if="lapFlashText" class="lap-flash">
                <span class="lap-flash__delta">{{ lapFlashText }}</span>
                <span class="lap-flash__meta">{{ lapFlashMeta }}</span>
            </div>
        </transition>
        <!-- StickyStopwatchCard.vue | REPLACE HoldMenu block -->
        <div v-if="showMenu"
             class="sticky-menu"
             :style="menuStyle"
             @pointerdown.stop
             @click.stop>
            <button type="button" class="menu-item" @click="handleOpen">
                Öffnen
            </button>
            <button type="button" class="menu-item" @click="handleMove">
                Verschieben
            </button>
            <button type="button" class="menu-item" @pointerdown.stop.prevent @mousedown.stop.prevent @click.stop.prevent="handleCrop">
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

            <button v-if="hasStyleChanges"
                    type="button"
                    class="menu-item"
                    @click="handleApplyToAll"
                    @mousedown.stop>
                Für alle Stoppuhren übernehmen
            </button>
            <button type="button" class="menu-item danger" @click="handleClose">
                Schließen
            </button>
        </div>


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

    import { ref, computed, nextTick, watch, watchEffect, onMounted, onBeforeUnmount, toRef } from 'vue'

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
    function onMaybeDrag(ev: MouseEvent) {
        if (!moveMode.value) return
        bumpZ(stopwatch)
        startDrag(ev, stopwatch)
    }
    type LapEntryObj = {
        [key: string]: any

        // ✅ neues Format (seconds)
        time: number
        name?: string

        // ✅ legacy Format (ms)
        ms?: number
        splitMs?: number
        atMs?: number
        label?: string
    }

    type LapEntry = number | LapEntryObj

    interface StopwatchInstance {
        [key: string]: any

        id: string
        name: string
        time: number
        isRunning: boolean
        interval: number | null

        // ✅ FIX: erlaubt number ODER Objekt
        laps: LapEntry[]

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

        // ✅ an App.vue angepasst
        startedAtMs?: number | null
        offsetMs?: number

        zIndex?: number
    }


    const props = defineProps<{
        stopwatch: StopwatchInstance
        stickyEnabled: boolean
        formatStopwatch: (time: number) => string
        toggleStopwatch: (sw: StopwatchInstance) => void
        resetStopwatch: (sw: StopwatchInstance) => void
        addLap: (sw: StopwatchInstance) => void
        startDrag: (e: MouseEvent, sw: StopwatchInstance) => void
        focusInTraining: (type: 'timer' | 'stopwatch', id: string) => void
        stackIndex?: number
        stackCount?: number
        stackExpanded?: boolean
        stackBumpNonce?: number
        dockNonce?: number
        dockFromX?: number
        dockFromY?: number
    }>()

    const stickyEnabled = toRef(props, 'stickyEnabled')

    const {
        stopwatch,
        formatStopwatch,
        toggleStopwatch,
        resetStopwatch,
        addLap,
        startDrag,
        focusInTraining,
    } = props
    const stackIndex = computed(() => props.stackIndex ?? 0)
    const stackCount = computed(() => props.stackCount ?? 1)
    const stackExpanded = computed(() => !!props.stackExpanded)
    const stackBumpActive = ref(false)
    const dockFromX = computed(() => props.dockFromX ?? 0)
    const dockFromY = computed(() => props.dockFromY ?? 0)
    const dockLaunchActive = ref(false)
    let dockLaunchTimer: ReturnType<typeof setTimeout> | null = null
    let stackBumpTimer: ReturnType<typeof setTimeout> | null = null

    const stopwatchRingProgress = computed(() => {
        const seconds = Math.max(0, Number(stopwatch.time ?? 0))
        return Math.max(0, Math.min(1, (seconds % 60) / 60))
    })

    const stopwatchRingValue = computed(() =>
        Math.max(0, Math.floor(Number(stopwatch.time ?? 0) % 60)).toString().padStart(2, '0')
    )

    const stopwatchRingStyle = computed(() => ({
        '--ring-angle': `${(stopwatchRingProgress.value * 360).toFixed(2)}deg`,
        '--progress-percent': `${(stopwatchRingProgress.value * 100).toFixed(2)}%`,
    }))

    const stopwatchRingStrokeStyle = computed(() => {
        const radius = 48
        const circumference = 2 * Math.PI * radius
        const segments = 36
        const segmentLength = circumference / segments
        const dash = segmentLength * 0.42
        const gap = segmentLength - dash
        const progressLength = circumference * stopwatchRingProgress.value
        const dashOffset = Math.max(0, circumference - progressLength)

        return {
            strokeDasharray: `${dash} ${gap}`,
            strokeDashoffset: `${dashOffset}`,
        }
    })

    const lapFlashText = ref('')
    const lapFlashMeta = ref('')
    const lapFlashTone = ref<'positive' | 'negative' | 'neutral'>('neutral')
    let lapFlashTimeout: number | null = null

    function readLapSeconds(entry: LapEntry | undefined): number | null {
        if (entry == null) return null
        if (typeof entry === 'number') return Number.isFinite(entry) ? entry : null
        if (typeof entry.time === 'number' && Number.isFinite(entry.time)) return entry.time
        if (typeof entry.ms === 'number' && Number.isFinite(entry.ms)) return entry.ms / 1000
        if (typeof entry.splitMs === 'number' && Number.isFinite(entry.splitMs)) return entry.splitMs / 1000
        if (typeof entry.atMs === 'number' && Number.isFinite(entry.atMs)) return entry.atMs / 1000
        return null
    }

    function showLapFlash(lapEntries?: LapEntry[]) {
        const laps = Array.isArray(lapEntries) ? lapEntries : (Array.isArray(stopwatch.laps) ? stopwatch.laps : [])
        const lapCount = laps.length
        if (!lapCount) return

        const currentLap = readLapSeconds(laps[lapCount - 1])
        if (currentLap == null) return
        const previousLap = lapCount > 1 ? readLapSeconds(laps[lapCount - 2]) : null
        const diff = previousLap == null ? currentLap : currentLap - previousLap
        const direction =
            previousLap == null || Math.abs(diff) < 0.005
                ? 'neutral'
                : diff < 0 ? 'positive' : 'negative'
        const prefix = direction === 'positive' ? '-' : direction === 'negative' ? '+' : '±'

        lapFlashText.value = `${prefix}${Math.abs(diff).toFixed(2)}s`
        lapFlashMeta.value = `Runde ${lapCount}`
        lapFlashTone.value = direction

        if (lapFlashTimeout != null) clearTimeout(lapFlashTimeout)
        lapFlashTimeout = window.setTimeout(() => {
            lapFlashText.value = ''
            lapFlashMeta.value = ''
            lapFlashTimeout = null
        }, 1800)
    }

    const emit = defineEmits<{
        (e: 'open', id: string): void
        (e: 'crop', id: string): void
        (e: 'close', id: string): void
        (e: 'apply-style-all', payload: {
            kind: 'stopwatch'
            style: {
                bgColor: string | null
                btnColor: string | null
                timeColor: string | null
                shape: 'square' | 'rounded' | 'oval' | null
            }
        }): void
    }>()

    function handleApplyToAll() {
        emit('apply-style-all', {
            kind: 'stopwatch',
            style: {
                bgColor: stopwatch.bgColor ?? null,
                btnColor: stopwatch.btnColor ?? null,
                timeColor: stopwatch.timeColor ?? null,
                shape: stopwatch.shape ?? null,
            },
        })
        hasStyleChanges.value = false
        closeMenu()
    }
    const cardEl = ref<HTMLElement | null>(null)
    const showMenu = ref(false)
    const showColors = ref(false)
    const hasStyleChanges = ref(false)

    const menuStyle = computed(() => {
        const w = stopwatch.width ?? cardEl.value?.offsetWidth ?? 240
        const raw = w / 240
        const scale = Math.min(1.6, Math.max(0.9, raw))

        return {
            minWidth: `${150 * scale}px`,
            maxWidth: `${180 * scale}px`,
            width: 'max-content',
            left: '0px',
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
        cancelPointerHold()
        suppressClickUntil = Date.now() + 900
        cropArmUntil = Date.now() + 600
        actionGuardUntil = Date.now() + 900
        const nextResizeMode = !resizeMode.value
        stopwatch.shouldStaySticky = true
        stopwatch.isVisible = true
        resizeMode.value = nextResizeMode
        bumpZ(stopwatch)
        window.setTimeout(() => {
            stopwatch.shouldStaySticky = true
            stopwatch.isVisible = true
            closeMenu()
        }, 0)
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


    const MIN_W = 130
    const MIN_H = 44
    const MAX_W = 560
    const MAX_H = 260
    const EDGE_PAD = 8

    function startResize(ev: PointerEvent, corner: Corner) {
        bumpZ(stopwatch)
        cancelPointerHold()
        cropArmUntil = Date.now() + 900
        stopwatch.shouldStaySticky = true
        stopwatch.isVisible = true

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

        const finalW = stopwatch.width ?? cardEl.value?.offsetWidth ?? startW
        const finalH = stopwatch.height ?? cardEl.value?.offsetHeight ?? startH
        currentPreset.value = calcPreset(finalW, finalH)

        isResizing.value = false
        justResized.value = true

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
    let suppressClickUntil = 0
    let cropArmUntil = 0
    let actionGuardUntil = 0
    const uiScale = computed(() => 1)

    function actionGuardActive() {
        return Date.now() < actionGuardUntil
    }

    function swallowGuardedClick(e: MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
    }

    function onToggleClick(e: MouseEvent) {
        if (actionGuardActive()) {
            swallowGuardedClick(e)
            return
        }
        toggleStopwatch(stopwatch)
    }

    function onResetClick(e: MouseEvent) {
        if (actionGuardActive()) {
            swallowGuardedClick(e)
            return
        }
        resetStopwatch(stopwatch)
    }

    function onLapClick(e: MouseEvent) {
        if (actionGuardActive()) {
            swallowGuardedClick(e)
            return
        }
        const existingLaps: LapEntry[] = Array.isArray(stopwatch.laps) ? [...stopwatch.laps] : []
        const elapsedByLaps = existingLaps.reduce((sum: number, lap: LapEntry) => sum + (readLapSeconds(lap) ?? 0), 0)
        const lapDuration = Math.max(0, Number(stopwatch.time ?? 0) - elapsedByLaps)
        const lapSnapshot: LapEntry[] = [...existingLaps, { time: lapDuration, name: '' }]
        addLap(stopwatch)
        showLapFlash(lapSnapshot)
    }

    // Preset mit Hysterese, damit XL nicht sofort wegflippt
    const currentPreset = ref<'mini' | 'slim' | 'wide' | 'compact' | 'large' | 'tall' | 'narrow' | 'xl'>('compact')

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

            if (!['compact', 'narrow', 'mini', 'slim', 'wide'].includes(currentPreset.value)) {
                currentPreset.value = 'compact'
                await nextTick()
            }

            if (hasOverflow() && !['narrow', 'mini', 'slim', 'wide'].includes(currentPreset.value)) {
                currentPreset.value = 'narrow'
                await nextTick()
            }

            if (hasOverflow() && currentPreset.value === 'narrow') {
                currentPreset.value = 'mini'
                await nextTick()
            }

            if (hasOverflow() && currentPreset.value === 'mini') {
                currentPreset.value = 'slim'
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
    // REPLACE – StickyStopwatchCard.vue (setColor / setBtnColor / setTimeColor / setShape)
    function setColor(color: string | null, close = false) {
        stopwatch.bgColor = color
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    function setBtnColor(color: string | null, close = false) {
        stopwatch.btnColor = color
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    function setTimeColor(color: string | null, close = false) {
        stopwatch.timeColor = color
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    function setShape(shape: 'square' | 'rounded' | 'oval' | null, close = false) {
        stopwatch.shape = shape
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    function calcPreset(w: number, h: number) {
        const X_ENTER = 160
        const T_ENTER = 125
        const WIDE_ENTER = 390
        const WIDE_H_MAX = 76
        const S_ENTER = 160
        const M_ENTER = 220
        const N_ENTER = 280
        const L_ENTER = 320

        return (
            w <= S_ENTER ? 'slim' :
                w <= M_ENTER ? 'mini' :
                (w >= WIDE_ENTER && h <= WIDE_H_MAX) ? 'wide' :
                w <= N_ENTER ? 'narrow' :
                h >= X_ENTER ? 'xl' :
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

        const WIDE_ENTER = 390
        const WIDE_EXIT = 360
        const WIDE_H_MAX = 76
        const WIDE_H_EXIT = 84

        const S_ENTER = 160
        const S_EXIT = 170

        const M_ENTER = 220
        const M_EXIT = 232

        const N_ENTER = 280
        const N_EXIT = 290

        const L_ENTER = 320
        const L_EXIT = 300

        if (currentPreset.value === 'xl') {
            if (w <= N_ENTER || h < X_EXIT) {
                currentPreset.value =
                    w <= S_ENTER ? 'slim' :
                    w <= M_ENTER ? 'mini' :
                    w <= N_ENTER ? 'narrow' :
                        (h >= T_ENTER ? 'tall' : (w >= L_ENTER ? 'large' : 'compact'))
            }
            return
        }

        if (currentPreset.value === 'slim') {
            if (w >= S_EXIT) {
                currentPreset.value =
                    w <= M_ENTER ? 'mini' :
                    (w >= WIDE_ENTER && h <= WIDE_H_MAX) ? 'wide' :
                    w <= N_ENTER ? 'narrow' :
                        (h >= T_ENTER ? 'tall' : (w >= L_ENTER ? 'large' : 'compact'))
            }
            return
        }

        if (w <= S_ENTER) {
            currentPreset.value = 'slim'
            return
        }

        if (currentPreset.value === 'mini') {
            if (w < S_ENTER) {
                currentPreset.value = 'slim'
                return
            }
            if (w >= M_EXIT) {
                currentPreset.value =
                    (w >= WIDE_ENTER && h <= WIDE_H_MAX) ? 'wide' :
                    w <= N_ENTER ? 'narrow' :
                        (h >= T_ENTER ? 'tall' : (w >= L_ENTER ? 'large' : 'compact'))
            }
            return
        }

        if (w <= M_ENTER) {
            currentPreset.value = 'mini'
            return
        }

        if (currentPreset.value === 'wide') {
            if (w < WIDE_EXIT || h > WIDE_H_EXIT) {
                currentPreset.value =
                    w <= N_ENTER ? 'narrow' :
                        (h >= X_ENTER ? 'xl' : (h >= T_ENTER ? 'tall' : (w >= L_ENTER ? 'large' : 'compact')))
            }
            return
        }

        if (w >= WIDE_ENTER && h <= WIDE_H_MAX) {
            currentPreset.value = 'wide'
            return
        }

        if (currentPreset.value === 'narrow') {
            if (w >= N_EXIT) {
                currentPreset.value =
                    (w >= WIDE_ENTER && h <= WIDE_H_MAX) ? 'wide' :
                    h >= T_ENTER ? 'tall' : (w >= L_ENTER ? 'large' : 'compact')
            }
            return
        }

        if (w <= N_ENTER) {
            currentPreset.value = 'narrow'
            return
        }

        if (h >= X_ENTER) {
            currentPreset.value = 'xl'
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
        if (!resizeMode.value) return currentPreset.value

        const w = stopwatch.width ?? cardEl.value?.offsetWidth ?? 240
        const h = stopwatch.height ?? cardEl.value?.offsetHeight ?? 80
        return calcPreset(w, h)
    })
    const xlLayoutClass = computed(() => {
        if (sizePreset.value !== 'xl') return ''
        const w = stopwatch.width ?? cardEl.value?.offsetWidth ?? 240
        return w < 405 ? 'xl-compact-layout' : ''
    })

    const cardHeight = computed<string | undefined>(() => {
        if (resizeMode.value) {
            return undefined
        }

        const p = sizePreset.value
        if (p === 'tall' || p === 'xl' || p === 'narrow' || p === 'mini' || p === 'slim' || p === 'wide') return undefined
        return stopwatch.height ? stopwatch.height + 'px' : undefined
    })


    function finishCrop() {
        if (resizingCorner) stopResize()
        const finalW = stopwatch.width ?? cardEl.value?.offsetWidth ?? 240
        const finalH = stopwatch.height ?? cardEl.value?.offsetHeight ?? 80
        currentPreset.value = calcPreset(finalW, finalH)
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
        if (resizingCorner) return
        const el = e.target as HTMLElement | null
        if (el?.closest('.resize-handle')) return
        const root = cardEl.value
        const t = e.target as Node
        if (root && root.contains(t)) return
        if (root) {
            const rect = root.getBoundingClientRect()
            const framePad = 14
            const insideCropFrame =
                e.clientX >= rect.left - framePad &&
                e.clientX <= rect.right + framePad &&
                e.clientY >= rect.top - framePad &&
                e.clientY <= rect.bottom + framePad
            if (insideCropFrame) return
        }
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
        if (dockLaunchTimer) clearTimeout(dockLaunchTimer)
        if (stackBumpTimer) clearTimeout(stackBumpTimer)
        resizeObs?.disconnect()
        resizeObs = null
        if (lapFlashTimeout != null) {
            clearTimeout(lapFlashTimeout)
            lapFlashTimeout = null
        }
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

    function onClickCapture(ev: MouseEvent) {
        if (Date.now() > suppressClickUntil) return
        ev.preventDefault()
        ev.stopPropagation()
    }

    function onPointerDown(ev: PointerEvent) {
        bumpZ(stopwatch)

        if (resizeMode.value) return

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
            suppressClickUntil = Date.now() + 700
            openMenu(ev)
        }, 550) as unknown as number
    }

    function onPointerMove(ev: PointerEvent) {
        if (resizeMode.value) return
        if (moveMode.value) return
        if (!isHolding.value || !pressStartPos) return
        const dx = ev.clientX - pressStartPos.x
        const dy = ev.clientY - pressStartPos.y
        if (dx * dx + dy * dy > 36) {
            cancelPointerHold()
        }
    }

    function onPointerUp(_ev: PointerEvent) {
        if (resizeMode.value) return
        cancelPointerHold()
    }

    function onPointerCancel() {
        if (resizeMode.value) return
        cancelPointerHold()
    }

    // Outside-Click zum Schlie en
    function onOutsidePointer(e: PointerEvent) {
        if (!showMenu.value) return
        const root = cardEl.value
        const menuEl = root?.querySelector('.sticky-menu') as HTMLElement | null
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

    watch(() => props.dockNonce, (nonce) => {
        if (!nonce) return
        dockLaunchActive.value = false
        if (dockLaunchTimer) clearTimeout(dockLaunchTimer)
        requestAnimationFrame(() => {
            dockLaunchActive.value = true
            dockLaunchTimer = setTimeout(() => {
                dockLaunchActive.value = false
                dockLaunchTimer = null
            }, 760)
        })
    })

    watch(() => props.stackBumpNonce, (nonce) => {
        if (!nonce || stackCount.value <= 1) return
        stackBumpActive.value = false
        if (stackBumpTimer) clearTimeout(stackBumpTimer)
        requestAnimationFrame(() => {
            stackBumpActive.value = true
            stackBumpTimer = setTimeout(() => {
                stackBumpActive.value = false
                stackBumpTimer = null
            }, 520)
        })
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
        background:
            linear-gradient(155deg, color-mix(in srgb, var(--bg-card) 90%, #ffffff 10%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%)),
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 24%, transparent), transparent 46%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 20%, transparent), transparent 52%);
        padding: 0.82rem 1.12rem;
        border-radius: 24px;
        display: flex;
        align-items: center;
        gap: 0.72rem;
        font-size: 0.9rem;
        cursor: default;
        z-index: 2000;
        border: 1px solid color-mix(in srgb, var(--border-color) 58%, var(--accent-primary) 42%);
        box-sizing: border-box;
        box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.18),
            inset 0 1px 0 rgba(255,255,255,0.55);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        isolation: isolate;
        overflow: visible;
        transform: translate3d(var(--stack-x, 0px), var(--stack-y, 0px), 0) scale(var(--stack-scale, 1));
        transition: transform .42s cubic-bezier(.22, 1, .36, 1), box-shadow .32s ease, opacity .28s ease, filter .32s ease;
        will-change: transform, opacity;
    }

        .sticky-timer-card.is-stack-collapsed,
        .sticky-stopwatch-card.is-stack-collapsed {
            --stack-x: calc(var(--stack-index, 0) * -4px);
            --stack-y: calc(var(--stack-index, 0) * 10px);
            --stack-scale: 1;
        }

        .sticky-timer-card.is-stack-expanded,
        .sticky-stopwatch-card.is-stack-expanded {
            --stack-x: 0px;
            --stack-y: calc(var(--stack-index, 0) * 92px);
            --stack-scale: 1;
        }

        .sticky-timer-card.is-stack-passive,
        .sticky-stopwatch-card.is-stack-passive {
            pointer-events: none;
            filter: saturate(.92);
        }

        .sticky-timer-card.is-dock-launch,
        .sticky-stopwatch-card.is-dock-launch {
            animation: sticky-dock-launch .92s cubic-bezier(.18, .9, .2, 1) both;
        }

        .sticky-timer-card.is-stack-bump,
        .sticky-stopwatch-card.is-stack-bump {
            animation: sticky-stack-bump .52s cubic-bezier(.22, 1, .36, 1);
        }

        .sticky-timer-card::before,
        .sticky-stopwatch-card::before {
            content: none;
        }

        .sticky-timer-card::after,
        .sticky-stopwatch-card::after {
            content: "";
            position: absolute;
            inset: 1px;
            border-radius: calc(24px - 1px);
            border: 1px solid rgba(255,255,255,0.12);
            pointer-events: none;
            z-index: 0;
        }

        .sticky-timer-card > *,
        .sticky-stopwatch-card > * {
            position: relative;
            z-index: 1;
        }

    @keyframes sticky-dock-launch {
        0% {
            transform: translate3d(calc(var(--stack-x, 0px) + var(--dock-from-x, 0px)), calc(var(--stack-y, 0px) + var(--dock-from-y, 0px)), 0) scale(.84) rotate(-6deg);
            opacity: 0;
            filter: saturate(.92) blur(1px);
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }

        52% {
            transform: translate3d(calc(var(--stack-x, 0px) - 8px), calc(var(--stack-y, 0px) + 6px), 0) scale(1.04) rotate(1deg);
            opacity: 1;
            filter: saturate(1.08) blur(0);
            box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.34), 0 26px 56px rgba(59, 130, 246, 0.24);
        }

        100% {
            transform: translate3d(var(--stack-x, 0px), var(--stack-y, 0px), 0) scale(var(--stack-scale, 1)) rotate(0deg);
            opacity: 1;
            filter: saturate(1) blur(0);
            box-shadow:
                0 24px 60px rgba(15, 23, 42, 0.18),
                inset 0 1px 0 rgba(255,255,255,0.55);
        }
    }

    @keyframes sticky-stack-bump {
        0% {
            transform: translate3d(var(--stack-x, 0px), var(--stack-y, 0px), 0) scale(1);
        }

        38% {
            transform: translate3d(calc(var(--stack-x, 0px) - (var(--stack-index, 0) * 5px)), calc(var(--stack-y, 0px) + (var(--stack-index, 0) * 8px)), 0) scale(1.015);
            box-shadow: 0 28px 64px rgba(15, 23, 42, 0.24), inset 0 1px 0 rgba(255,255,255,0.55);
        }

        100% {
            transform: translate3d(var(--stack-x, 0px), var(--stack-y, 0px), 0) scale(var(--stack-scale, 1));
        }
    }

        .sticky-timer-card.movable,
        .sticky-stopwatch-card.movable {
            cursor: grab;
        }

            .sticky-timer-card.movable:active,
            .sticky-stopwatch-card.movable:active {
                cursor: grabbing;
            }

        .sticky-timer-card.menu-open,
        .sticky-stopwatch-card.menu-open {
            overflow: visible;
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
            font-weight: 900;
            font-size: 1.04rem;
            color: var(--time-color, color-mix(in srgb, var(--accent-primary) 82%, var(--text-primary) 18%));
            padding: 0.42rem 0.9rem;
            border-radius: 999px;
            border: 1px solid color-mix(in srgb, var(--accent-primary) 38%, transparent);
            background:
                linear-gradient(135deg, color-mix(in srgb, var(--bg-secondary) 78%, white 22%), color-mix(in srgb, var(--bg-card) 76%, var(--accent-primary) 24%));
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.42),
                0 10px 24px rgba(15, 23, 42, 0.12);
            letter-spacing: 0.04em;
        }

    html.dark-mode .sticky-timer-card,
    html.dark-mode .sticky-stopwatch-card {
        background:
            linear-gradient(155deg, color-mix(in srgb, var(--bg-card) 92%, #020617 8%), color-mix(in srgb, var(--bg-secondary) 74%, #020617 26%)),
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.26), transparent 46%),
            radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.18), transparent 52%);
        border: 1px solid color-mix(in srgb, var(--border-color) 56%, rgba(129, 140, 248, 0.44) 44%);
        box-shadow:
            0 26px 64px rgba(0, 0, 0, 0.48),
            inset 0 1px 0 rgba(255,255,255,0.06);
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
        top: auto;
        bottom: -2px;
        min-width: 150px;
        max-width: 180px;
        padding: .35rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: color-mix(in srgb, var(--bg-card) 92%, #0b1220 8%);
        box-shadow: 0 16px 38px rgba(15, 23, 42, 0.22);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        z-index: 10000;
        margin: 0;
        transform: translateY(100%);
        width: max-content;
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

    html.dark-mode .sticky-stopwatch-card .sticky-menu {
        background: rgba(2, 6, 23, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.4);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .sticky-stopwatch-card.resizing {
        outline: 2px dashed var(--accent-primary);
        outline-offset: 2px;
    }

    .sticky-stopwatch-card .resize-handle {
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        border: 2px solid color-mix(in srgb, var(--bg-card) 82%, white 18%);
        opacity: .95;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
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

    .sticky-stopwatch-card .sticky-action {
            font-size: calc(0.78rem * var(--ui-scale));
            padding: calc(0.5rem * var(--ui-scale)) calc(0.9rem * var(--ui-scale));
            border-radius: 16px;
        }

    .lap-flash {
        position: absolute;
        top: .72rem;
        right: .82rem;
        z-index: 4;
        display: grid;
        gap: .14rem;
        min-width: 5rem;
        padding: .42rem .56rem;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.18);
        background: rgba(15,23,42,.86);
        box-shadow: 0 16px 34px rgba(15,23,42,.28);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        text-align: right;
    }

    .lap-flash__delta {
        font-size: .86rem;
        font-weight: 900;
        line-height: 1;
        color: #f8fafc;
    }

    .lap-flash__meta {
        font-size: .58rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: rgba(226,232,240,.62);
    }

    .sticky-stopwatch-card.lap-flash-positive .lap-flash__delta {
        color: #34d399;
    }

    .sticky-stopwatch-card.lap-flash-negative .lap-flash__delta {
        color: #fb7185;
    }

    .sticky-alert-pop-enter-active,
    .sticky-alert-pop-leave-active {
        transition: opacity .18s ease, transform .18s ease;
    }

    .sticky-alert-pop-enter-from,
    .sticky-alert-pop-leave-to {
        opacity: 0;
        transform: translateY(-6px) scale(.92);
    }

        .sticky-stopwatch-card.compact {
            flex-direction: row;
            align-items: center;
            /* wichtig: nix abschneiden, lieber umbrechen */
            flex-wrap: wrap;
            row-gap: 0.35rem;
            /* falls ne feste height gespeichert ist -> trotzdem wachsen */
            height: auto !important;
            border-radius: 22px;
        }
    .shape-btn {
        border: 1px solid color-mix(in srgb, var(--border-color) 82%, transparent);
        background: color-mix(in srgb, var(--bg-secondary) 72%, var(--bg-card) 28%);
        color: inherit;
        font: inherit;
        font-size: .75rem;
        padding: .3rem .55rem;
        border-radius: 999px;
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
            background: color-mix(in srgb, var(--accent-primary) 12%, var(--bg-card) 88%);
        }

    html.dark-mode .shape-btn:hover {
        background: rgba(255,255,255,.06);
    }

            .sticky-stopwatch-card.compact .name-link,
            .sticky-stopwatch-card.compact .time {
                flex: 1 1 auto;
                min-width: 0;
            }

            .sticky-stopwatch-card.compact .sticky-action {
                flex: 0 0 auto;
            }

    .sticky-stopwatch-card.compact .sticky-action {
        min-width: 4.3rem;
        padding-inline: .78rem;
    }

    .sticky-stopwatch-card.mini {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto auto;
        gap: .38rem;
        align-items: center;
        border-radius: 18px;
        padding: .62rem .68rem;
        height: auto !important;
    }

        .sticky-stopwatch-card.mini .name-link {
            grid-column: 1 / -1;
            text-align: center;
            font-size: .78rem;
        }

        .sticky-stopwatch-card.mini .time {
            grid-column: 1 / -1;
            justify-self: center;
            font-size: 1.28rem;
            padding: .28rem .56rem;
            border-radius: 14px;
        }

        .sticky-stopwatch-card.mini .sticky-action {
            min-width: 0;
            width: 100%;
            padding: .4rem .48rem;
            font-size: .68rem;
            border-radius: 12px;
        }

        .sticky-stopwatch-card.mini .sticky-action--lap {
            grid-column: 1 / -1;
        }

    .sticky-stopwatch-card.slim {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: .28rem;
        border-radius: 16px;
        padding: .5rem .52rem;
        height: auto !important;
    }

        .sticky-stopwatch-card.slim .name-link {
            text-align: center;
            font-size: .72rem;
        }

        .sticky-stopwatch-card.slim .time {
            align-self: stretch;
            text-align: center;
            font-size: 1.05rem;
            padding: .24rem .4rem;
            border-radius: 12px;
        }

    .sticky-stopwatch-card.slim .sticky-action {
        min-width: 0;
        width: 100%;
        padding: .34rem .42rem;
        font-size: .62rem;
        border-radius: 10px;
    }

    .sticky-stopwatch-card.wide {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto auto auto;
        align-items: center;
        gap: .42rem;
        padding: .5rem .72rem;
        border-radius: 18px;
        height: auto !important;
    }

        .sticky-stopwatch-card.wide .name-link {
            grid-column: 1;
            font-size: .76rem;
            max-width: 6.6rem;
        }

        .sticky-stopwatch-card.wide .time {
            grid-column: 2;
            min-width: 0;
            width: 100%;
            font-size: 1.02rem;
            padding: .24rem .46rem;
            border-radius: 12px;
            text-align: center;
        }

        .sticky-stopwatch-card.wide .sticky-action {
            min-width: 0;
            padding: .32rem .48rem;
            font-size: .62rem;
            border-radius: 10px;
        }

    .sticky-stopwatch-card.large .sticky-action--start,
    .sticky-stopwatch-card.xl .sticky-action--start {
        background: linear-gradient(135deg, #22c55e, #0f766e);
    }

    .sticky-stopwatch-card.large .sticky-action--pause,
    .sticky-stopwatch-card.xl .sticky-action--pause {
        background: linear-gradient(135deg, #f59e0b, #ea580c);
    }

    .sticky-stopwatch-card.large .sticky-action--reset,
    .sticky-stopwatch-card.xl .sticky-action--reset {
        background: linear-gradient(135deg, #1e293b, #334155);
    }

    .sticky-stopwatch-card.large .sticky-action--lap,
    .sticky-stopwatch-card.xl .sticky-action--lap {
        background: linear-gradient(135deg, #7c3aed, #2563eb);
    }


        .sticky-stopwatch-card.large {
            flex-direction: row;
            align-items: center;
            border-radius: 28px;
            padding: calc(.92rem * var(--ui-scale)) calc(1.22rem * var(--ui-scale));
            gap: calc(.6rem * var(--ui-scale));
            box-shadow:
                0 30px 64px rgba(15,23,42,.3),
                inset 0 1px 0 rgba(255,255,255,.18),
                inset 0 -24px 34px rgba(0,0,0,.24);
            background:
                linear-gradient(135deg, #040913, #0f172a 42%, #14b8a6 132%);
            border: 1px solid rgba(45,212,191,.16);
        }

            .sticky-stopwatch-card.large .name-link {
                font-size: calc(.95rem * var(--ui-scale));
                opacity: .9;
            }

            .sticky-stopwatch-card.large .time {
                font-size: calc(2.15rem * var(--ui-scale));
                font-weight: 900;
                letter-spacing: 0.26em;
                padding: calc(.7rem * var(--ui-scale)) calc(1.2rem * var(--ui-scale));
                border-radius: 0;
                clip-path: polygon(7% 0, 100% 0, 93% 100%, 0 100%);
                border: 1px solid rgba(94, 234, 212, 0.26);
                background:
                    linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)),
                    repeating-linear-gradient(90deg, rgba(45,212,191,.12) 0 2px, transparent 2px 16px),
                    linear-gradient(180deg, #02040a, #071017 54%, #020617);
                color: #b1fff5;
                box-shadow:
                    inset 0 1px 0 rgba(255,255,255,0.1),
                    inset 0 -18px 26px rgba(0,0,0,0.46),
                    0 0 0 2px rgba(19, 78, 74, 0.65),
                    0 0 0 8px rgba(20, 184, 166, 0.08),
                    0 18px 38px rgba(2, 6, 23, 0.4);
                text-shadow:
                    0 0 12px rgba(45, 212, 191, 0.48),
                    0 0 32px rgba(45, 212, 191, 0.22);
                position: relative;
                isolation: isolate;
            }

    html.dark-mode .sticky-stopwatch-card.large .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card.large .sticky-action {
        font-size: calc(.74rem * var(--ui-scale));
        padding: calc(.46rem * var(--ui-scale)) calc(.82rem * var(--ui-scale));
        border-radius: 14px;
        clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
    }

    .sticky-stopwatch-card.xl {
        display: grid;
        grid-template-columns: minmax(0, auto) minmax(6.4rem, 1fr);
        grid-template-rows: auto auto auto auto;
        align-items: center;
        column-gap: calc(.72rem * var(--ui-scale));
        row-gap: calc(.48rem * var(--ui-scale));
        border-radius: 32px;
        padding: calc(1rem * var(--ui-scale)) calc(1.08rem * var(--ui-scale));
        box-shadow:
            0 18px 34px rgba(15,23,42,.22),
            inset 0 1px 0 rgba(255,255,255,.08);
        background: linear-gradient(180deg, #1b2431, #0f172a);
        border: 1px solid rgba(148,163,184,.18);
    }

        .sticky-stopwatch-card.xl .name-link {
            grid-column: 1 / -1;
            grid-row: 1;
            font-size: calc(1rem * var(--ui-scale));
            opacity: .9;
            text-align: left;
        }

        .sticky-stopwatch-card.xl .time {
            grid-column: 1;
            grid-row: 2 / span 3;
            align-self: center;
            font-size: calc(3rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: .04em;
            padding: calc(1rem * var(--ui-scale));
            min-width: calc(8.2rem * var(--ui-scale));
            min-height: calc(8.2rem * var(--ui-scale));
            border-radius: 50%;
            border: 0;
            background: #0b1220;
            color: #f8fbff;
            box-shadow: 0 12px 24px rgba(15,23,42,.22);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: calc(.28rem * var(--ui-scale));
            text-align: center;
            position: relative;
            isolation: isolate;
            overflow: visible;
        }

        .sticky-stopwatch-card.xl .sticky-action {
            min-width: 0;
            width: 100%;
            justify-self: stretch;
            border-radius: 16px;
            padding: calc(.56rem * var(--ui-scale)) calc(.8rem * var(--ui-scale));
            font-size: calc(.78rem * var(--ui-scale));
        }

        .sticky-stopwatch-card.xl .sticky-action--start,
        .sticky-stopwatch-card.xl .sticky-action--pause {
            grid-column: 2;
            grid-row: 2;
        }

        .sticky-stopwatch-card.xl .sticky-action--reset {
            grid-column: 2;
            grid-row: 3;
        }

        .sticky-stopwatch-card.xl .sticky-action--lap {
            grid-column: 2;
            grid-row: 4;
        }

        .sticky-stopwatch-card.xl .time::before,
        .sticky-stopwatch-card.xl .time::after {
            content: none;
        }

        .sticky-stopwatch-card.xl .time > * {
            position: relative;
            z-index: 1;
        }

        .sticky-stopwatch-card.xl .time .time-ring__svg {
            position: absolute;
            inset: -10px;
            width: calc(100% + 20px);
            height: calc(100% + 20px);
            transform: rotate(-90deg);
            z-index: 0;
            overflow: visible;
        }

        .sticky-stopwatch-card.xl .time .time-ring__track,
        .sticky-stopwatch-card.xl .time .time-ring__progress {
            fill: none;
            stroke-width: 6;
            stroke-linecap: butt;
        }

        .sticky-stopwatch-card.xl .time .time-ring__track {
            stroke: rgba(71, 85, 105, 0.38);
            stroke-dasharray: 3.52 5.39;
        }

        .sticky-stopwatch-card.xl .time .time-ring__progress {
            stroke: #f3f4f6;
            transition: stroke-dashoffset 220ms ease;
        }

        .sticky-stopwatch-card.xl .time .time-ring__value {
            font-size: calc(2.75rem * var(--ui-scale));
            font-weight: 900;
            line-height: 1;
            letter-spacing: 0;
            color: #ffffff;
            text-shadow: none;
        }

        .sticky-stopwatch-card.xl .time .time-ring__label {
            font-size: calc(.62rem * var(--ui-scale));
            line-height: 1;
            letter-spacing: .08em;
            text-transform: none;
            color: rgba(226, 232, 240, 0.54);
        }

    html.dark-mode .sticky-stopwatch-card.xl .time {
        background: #0b1220;
    }

    .sticky-stopwatch-card.xl.xl-compact-layout {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: auto auto auto;
        column-gap: calc(.46rem * var(--ui-scale));
        row-gap: calc(.56rem * var(--ui-scale));
        border-radius: 28px;
        padding: calc(.9rem * var(--ui-scale)) calc(.92rem * var(--ui-scale));
    }

        .sticky-stopwatch-card.xl.xl-compact-layout .name-link {
            grid-column: 1 / -1;
            grid-row: 1;
            text-align: center;
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .time {
            grid-column: 1 / -1;
            grid-row: 2;
            justify-self: center;
            min-width: min(100%, calc(11.6rem * var(--ui-scale)));
            width: 100%;
            min-height: calc(5.9rem * var(--ui-scale));
            border-radius: 24px;
            background:
                linear-gradient(90deg, rgba(243,244,246,.96) 0 var(--progress-percent), rgba(71,85,105,.34) var(--progress-percent) 100%) top / 100% 8px no-repeat,
                linear-gradient(180deg, #111827, #0b1220);
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.06),
                0 14px 26px rgba(15,23,42,.24);
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .time .time-ring__svg {
            display: none;
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .time .time-ring__value {
            font-size: calc(2.35rem * var(--ui-scale));
            letter-spacing: -.02em;
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .time .time-ring__label {
            font-size: calc(.68rem * var(--ui-scale));
            letter-spacing: .12em;
            text-transform: uppercase;
            color: rgba(226, 232, 240, 0.48);
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .sticky-action {
            grid-row: 3;
            min-width: 0;
            width: 100%;
            border-radius: 14px;
            padding: calc(.54rem * var(--ui-scale)) calc(.5rem * var(--ui-scale));
            font-size: calc(.74rem * var(--ui-scale));
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .sticky-action--start,
        .sticky-stopwatch-card.xl.xl-compact-layout .sticky-action--pause {
            grid-column: 1;
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .sticky-action--reset {
            grid-column: 2;
        }

        .sticky-stopwatch-card.xl.xl-compact-layout .sticky-action--lap {
            grid-column: 3;
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
        border-radius: 26px;
        padding: calc(.88rem * var(--ui-scale)) calc(1.05rem * var(--ui-scale));
        gap: calc(.45rem * var(--ui-scale));
        box-shadow:
            0 26px 56px rgba(15,23,42,.3),
            inset 0 1px 0 rgba(255,255,255,.14),
            inset 0 -22px 28px rgba(0,0,0,.24);
        background:
            linear-gradient(180deg, #050816, #0d1616 46%, #12312d 100%);
        justify-content: center;
        border: 1px solid rgba(45,212,191,.14);
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
            font-size: calc(2.7rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: .18em;
            padding: calc(.72rem * var(--ui-scale)) calc(1.15rem * var(--ui-scale));
            border-radius: 18px;
            clip-path: polygon(0 0, 100% 0, 96% 100%, 4% 100%);
            background:
                linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)),
                repeating-linear-gradient(90deg, rgba(45,212,191,.12) 0 2px, transparent 2px 18px),
                linear-gradient(180deg, #010409, #07110f);
            border: 1px solid rgba(45,212,191,0.22);
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.08),
                inset 0 -18px 24px rgba(0,0,0,.42),
                0 0 0 2px rgba(19,78,74,.65),
                0 18px 36px rgba(15,23,42,.34);
            color: #ecfffd;
            text-shadow: 0 0 20px rgba(45,212,191,.28);
        }

    html.dark-mode .sticky-stopwatch-card.tall .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card.tall .sticky-action {
        order: 3;
        flex: 0 1 auto;
        white-space: nowrap;
        font-size: calc(.8rem * var(--ui-scale));
        padding: calc(.34rem * var(--ui-scale)) calc(.75rem * var(--ui-scale));
        border-radius: 999px;
    }

    .sticky-stopwatch-card.narrow {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: calc(.35rem * var(--ui-scale));
        padding: calc(.72rem * var(--ui-scale)) calc(.86rem * var(--ui-scale));
        border-radius: 22px;
    }

        .sticky-stopwatch-card.narrow .name-link {
            text-align: center;
            font-size: calc(.95rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-stopwatch-card.narrow .time {
            text-align: center;
            font-size: calc(2.35rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 1.6px;
            padding: calc(.24rem * var(--ui-scale)) calc(.8rem * var(--ui-scale));
            border-radius: 18px;
            transform: none;
            min-height: auto;
            display: grid;
            place-items: center;
            background:
                linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.06)),
                linear-gradient(180deg, rgba(75,108,183,0.24), rgba(24,40,72,0.42));
            border: 1px solid rgba(255,255,255,0.12);
        }

    html.dark-mode .sticky-stopwatch-card.narrow .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-stopwatch-card.narrow .sticky-action {
        width: 100%;
        max-width: 160px;
        white-space: nowrap;
        font-size: calc(.82rem * var(--ui-scale));
        padding: calc(.32rem * var(--ui-scale)) calc(.7rem * var(--ui-scale));
        border-radius: 18px;
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
        padding: .58rem .72rem !important;
        font-size: .85rem !important;
        font-weight: 600 !important;
        border-radius: 10px !important;
        display: block;
        width: 100%;
        text-align: left;
        cursor: pointer;
        line-height: 1.2;
        color: var(--text-primary);
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
</style>
