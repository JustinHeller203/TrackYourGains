<template>
    <div v-if="stickyEnabled"
         class="sticky-timer-card"
         ref="cardEl"
         :data-sticky-timer-id="timer.id"
         :class="[
             {
                 resizing: resizeMode,
                 movable: moveMode,
                 'menu-open': showMenu,
                 [xlLayoutClass]: !!xlLayoutClass,
                 'timer-ending': timerDangerActive,
                 'timer-finished': timerFinishedAlert,
                 'is-stack-collapsed': stackCount > 1 && !stackExpanded,
                 'is-stack-expanded': stackCount > 1 && stackExpanded,
                 'is-stack-passive': stackCount > 1 && !stackExpanded && stackIndex > 0,
                 'is-dock-launch': dockLaunchActive,
                 'is-stack-bump': stackBumpActive,
             },
             sizePreset
         ]"
         :style="{
  left: timer.left + 'px',
  top: timer.top + 'px',
  width: timer.width ? timer.width + 'px' : undefined,
  height: cardHeight,
  zIndex: timer.zIndex ?? 2000,
  background: timer.bgColor ?? undefined,
  borderRadius: shapeRadius,
  '--ui-scale': uiScale,
  '--btn-bg': timer.btnColor ?? undefined,
  '--time-color': timer.timeColor ?? undefined,
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
              @click="focusInTraining('timer', timer.id)"
              @mousedown.stop="onMaybeDrag($event)">
            {{ timer.name || 'Timer' }}
        </span>
        <span v-if="!isEditingTime"
              class="time"
              :class="{ 'time--ring': sizePreset === 'xl', 'time--danger': timerDangerActive, 'time--finished': timerFinishedAlert }"
              :style="timerTimeStyle"
              @dblclick.stop="beginEditTime"
              @mousedown.stop="onMaybeDrag($event)">
            <template v-if="sizePreset === 'xl'">
                <svg class="time-ring__svg" viewBox="0 0 120 120" aria-hidden="true">
                    <circle class="time-ring__track" cx="60" cy="60" r="48" />
                    <circle class="time-ring__progress" cx="60" cy="60" r="48" :style="timerRingStrokeStyle" />
                </svg>
                <span class="time-ring__value">{{ timerRingValue }}</span>
                <span class="time-ring__label">{{ formatTimer(timer.time) }}</span>
            </template>
            <template v-else>
                {{ formatTimer(timer.time) }}
            </template>
        </span>

        <input v-else
               ref="timeInputEl"
               class="time time-input"
               v-model="timeInput"
               inputmode="numeric"
               autocomplete="off"
               spellcheck="false"
               @keydown.stop="onTimeInputKey"
               @blur="commitEditTime"
               @mousedown.stop />
        <button class="sticky-action sticky-action--start"
                @click="startTimer(timer)"
                :disabled="timer.isRunning">
            Start
        </button>
        <button class="sticky-action sticky-action--stop"
                @click="stopTimer(timer)"
                :disabled="!timer.isRunning">
            Stop
        </button>
        <button class="sticky-action sticky-action--reset"
                @click="resetTimer(timer)">
            Reset
        </button>
        <transition name="sticky-alert-pop">
            <div v-if="timerFinishedAlert" class="timer-finish-badge">
                Fertig
            </div>
        </transition>
        <!-- StickyTimerCard.vue | REPLACE HoldMenu block -->
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
                           :value="timer.bgColor || '#0d1117'"
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
                           :value="timer.btnColor || '#4B6CB7'"
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
                           :value="timer.timeColor || '#4B6CB7'"
                           @input="setTimeColor(($event.target as HTMLInputElement).value, false)" />
                </div>
                <div class="color-row" @mousedown.stop>
                    <span class="color-label">Form</span>

                    <button type="button" class="shape-btn" @click="setShape(null)">
                        Default
                        <span v-if="timer.shape == null" class="shape-check">✓</span>
                    </button>

                    <button type="button" class="shape-btn" @click="setShape('square')">
                        Eckig
                        <span v-if="timer.shape === 'square'" class="shape-check">✓</span>
                    </button>

                    <button type="button" class="shape-btn" @click="setShape('rounded')">
                        Rund
                        <span v-if="timer.shape === 'rounded'" class="shape-check">✓</span>
                    </button>

                    <button type="button" class="shape-btn" @click="setShape('oval')">
                        Oval
                        <span v-if="timer.shape === 'oval'" class="shape-check">✓</span>
                    </button>
                </div>

            </template>

            <button v-if="hasStyleChanges"
                    type="button"
                    class="menu-item"
                    @click="handleApplyToAll"
                    @mousedown.stop>
                Für alle Timer übernehmen
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
    import type { TimerInstance as BaseTimer } from '@/types/training'

    // ADD inline time edit (double click)
    const isEditingTime = ref(false)
    const timeInput = ref('')
    const timeInputEl = ref<HTMLInputElement | null>(null)

    function beginEditTime() {
        // nicht editieren während Resize/Move-Menü-Action? -> egal, aber Drag blocken wir eh mit .stop
        isEditingTime.value = true
        timeInput.value = formatTimer(Math.max(0, Math.floor(timer.time ?? 0)))
        nextTick(() => {
            timeInputEl.value?.focus()
            timeInputEl.value?.select()
        })
    }

    function cancelEditTime() {
        isEditingTime.value = false
        timeInput.value = ''
    }

    function parseTimeInput(raw: string): number | null {
        const t = raw.trim()
        if (!t) return null

        // akzeptiert "90" oder "1:30" oder "00:45"
        if (/^\d+$/.test(t)) return Math.max(0, Number(t))

        const m = t.match(/^(\d+)\s*:\s*(\d{1,2})$/)
        if (m) {
            const min = Number(m[1])
            const sec = Number(m[2])
            if (Number.isFinite(min) && Number.isFinite(sec))
                return Math.max(0, min * 60 + sec)
        }
        return null
    }

    function commitEditTime() {
        if (!isEditingTime.value) return
        const parsed = parseTimeInput(timeInput.value)
        if (parsed == null) {
            cancelEditTime()
            return
        }

        // Timer-Basis updaten für Reset-Logik
        timer.seconds = 'custom'
        timer.customSeconds = parsed
        timer.time = parsed

        const now = Date.now()

        if (timer.isRunning) {
            // Parent-Engine braucht diese beiden
            timer.startedAtMs = now
            timer.endsAtMs = now + parsed * 1000
            timer.pausedRemaining = null

            // legacy field safe mitziehen
            timer.endAt = timer.endsAtMs
        } else {
            timer.startedAtMs = null
            timer.endsAtMs = null
            timer.pausedRemaining = null
            timer.endAt = null
        }

        isEditingTime.value = false

    }

    function onTimeInputKey(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault()
            commitEditTime()
            return
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            cancelEditTime()
            return
        }
    }


    // ---- z-index focus handling (global across all stickies)
    const Z_KEY = '__stickyZ'
    function bumpZ(target: { zIndex?: number }) {
        const w = window as any
        w[Z_KEY] = (w[Z_KEY] ?? 2000) + 1
        target.zIndex = w[Z_KEY]
    }
    function onMouseDown(ev: MouseEvent) {
        if (!moveMode.value) return
        bumpZ(timer)
        startDrag(ev, timer)
    }

    const emit = defineEmits<{
        (e: 'open', id: string): void
        (e: 'crop', id: string): void
        (e: 'close', id: string): void
        (e: 'apply-style-all', payload: {
            kind: 'timer'
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
            kind: 'timer',
            style: {
                bgColor: timer.bgColor ?? null,
                btnColor: timer.btnColor ?? null,
                timeColor: timer.timeColor ?? null,
                shape: timer.shape ?? null,
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
        const w = timer.width ?? cardEl.value?.offsetWidth ?? 220
        const raw = w / 220
        const scale = Math.min(1.6, Math.max(0.9, raw))

        return {
            minWidth: `${150 * scale}px`,
            maxWidth: `${180 * scale}px`,
            width: 'max-content',
            left: '0px',
        }
    })

    function openMenu(_ev?: MouseEvent | PointerEvent) {
        // Card nach ganz oben holen, sonst kann Menu nie "drüber"
        bumpZ(timer)

        showMenu.value = true
        showColors.value = false

        nextTick(() => {
            // Auto-Flip NICHT mehr updaten -> Menü bleibt unten
            bumpZ(timer)
        })
    }
    function handleEdit() {
        showColors.value = !showColors.value
    }
    function closeMenu() {
        showMenu.value = false
        showColors.value = false
    }

    function handleOpen() {
        focusInTraining('timer', timer.id)
        emit('open', timer.id)
        closeMenu()
    }
    const resizeMode = ref(false)
    const moveMode = ref(false)

    function finishMove() {
        if (!moveMode.value) return
        moveMode.value = false
        // speichern passiert automatisch durch Parent-Deepwatch
    }

    function onMoveKey(e: KeyboardEvent) {
        if (!moveMode.value) return

        if (e.key === 'Enter') {
            e.preventDefault()
            finishMove()
            return
        }

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault()
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

    type Corner = 'nw' | 'ne' | 'sw' | 'se' | 'w' | 'e' | 'n' | 's'

    let resizingCorner: Corner | null = null
    const activeCorner = ref<Corner | null>(null)

    // neu: Resize-Freeze gegen "spring back"
    const isResizing = ref(false)
    const justResized = ref(false)

    let startX = 0, startY = 0
    let startW = 0, startH = 0
    let startL = 0, startT = 0

    const MIN_W = 120
    const MIN_H = 44
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

        const finalW = timer.width ?? cardEl.value?.offsetWidth ?? startW
        const finalH = timer.height ?? cardEl.value?.offsetHeight ?? startH
        currentPreset.value = calcPreset(finalW, finalH)

        isResizing.value = false
        justResized.value = true

        // neu: 2 frames Freeze, dann wieder Auto
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                justResized.value = false
            })
        })
    }

    function onMaybeDrag(ev: MouseEvent) {
        if (!moveMode.value) return
        bumpZ(timer)
        startDrag(ev, timer)
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

    function setColor(color: string | null, close = false) {
        timer.bgColor = color
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    function setBtnColor(color: string | null, close = false) {
        timer.btnColor = color
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    function setTimeColor(color: string | null, close = false) {
        timer.timeColor = color
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    function setShape(shape: 'square' | 'rounded' | 'oval' | null, close = false) {
        timer.shape = shape
        hasStyleChanges.value = true
        if (close) closeMenu()
    }

    const shapeRadius = computed<string | undefined>(() => {
        switch (timer.shape) {
            case 'square': return '0px'
            case 'rounded': return '12px'
            case 'oval': return '999px'
            default: return undefined
        }
    })
    function handleClose() {
        // Timer sauber stoppen + unsticky machen
        stopTimer(timer)
        timer.shouldStaySticky = false
        timer.isVisible = false

        emit('close', timer.id)
        // kein closeMenu() n tig, Parent schmei t die Card raus
        closeMenu()

    }

    // --- Long-Press f r Touch (Gedr ckthalten) ---
    const isHolding = ref(false)
    let holdTimer: number | null = null
    let pressStartPos: { x: number; y: number } | null = null
    let suppressClickUntil = 0

    // UI-Scale je nach Breite (clamped)
    const uiScale = computed(() => 1)

    const currentPreset = ref<'mini' | 'slim' | 'wide' | 'compact' | 'large' | 'tall' | 'narrow' | 'xl'>('compact')

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
        const WIDE_ENTER = 360
        const WIDE_H_MAX = 72
        const S_ENTER = 150
        const M_ENTER = 210
        const N_ENTER = 260
        const L_ENTER = 300

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

        const WIDE_ENTER = 360
        const WIDE_EXIT = 338
        const WIDE_H_MAX = 72
        const WIDE_H_EXIT = 80

        const S_ENTER = 150
        const S_EXIT = 160

        const M_ENTER = 210
        const M_EXIT = 222

        // fr her narrow rein, etwas sp ter wieder raus
        const N_ENTER = 260
        const N_EXIT = 270

        // large erst sp ter rein, damit narrow nicht zu sp t kommt
        const L_ENTER = 300
        const L_EXIT = 285

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
        // normaler Betrieb -> gespeichertes Preset
        if (!resizeMode.value) return currentPreset.value

        // Crop-Modus -> Live-Preview anhand aktueller Ma e
        const w = timer.width ?? cardEl.value?.offsetWidth ?? 220
        const h = timer.height ?? cardEl.value?.offsetHeight ?? 80
        return calcPreset(w, h)
    })
    const xlLayoutClass = computed(() => {
        if (sizePreset.value !== 'xl') return ''
        const w = timer.width ?? cardEl.value?.offsetWidth ?? 220
        return w < 390 ? 'xl-compact-layout' : ''
    })
    const cardHeight = computed<string | undefined>(() => {
        if (resizeMode.value) {
            return undefined
        }

        const p = sizePreset.value
        if (p === 'tall' || p === 'xl' || p === 'narrow' || p === 'mini' || p === 'slim' || p === 'wide') return undefined
        return timer.height ? timer.height + 'px' : undefined
    })

    function finishCrop() {
        if (resizingCorner) stopResize()
        const finalW = timer.width ?? cardEl.value?.offsetWidth ?? 220
        const finalH = timer.height ?? cardEl.value?.offsetHeight ?? 80
        currentPreset.value = calcPreset(finalW, finalH)
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
        bumpZ(timer)

        const targetEl = ev.target as HTMLElement | null
        if (targetEl && targetEl.closest('.time-input')) return

        // bei Mouse nur Linksklick longpressen (Rightclick macht eigenes Men )
        if (ev.pointerType === 'mouse' && ev.button !== 0) return

        if (moveMode.value) {
            if (ev.pointerType !== 'mouse') {
                clearHold()
                isHolding.value = false
                pressStartPos = null
                startDrag(ev as any, timer)
            }
            return
        }

        // normal: Long-Press  ffnet Men    egal welches Child gedr ckt wird
        isHolding.value = true
        pressStartPos = { x: ev.clientX, y: ev.clientY }
        clearHold()
        holdTimer = window.setTimeout(() => {
            suppressClickUntil = Date.now() + 700
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
    watch(
        () => [timer.name, formatTimer(timer.time), timer.isRunning],
        () => nextTick(() => ensureContentFitsHard('settle')),
        { flush: 'post' }
    )

    type StickyTimer = BaseTimer & {
        // sticky positioning / size
        left?: number
        top?: number
        width?: number
        height?: number
        zIndex?: number

        // style
        bgColor?: string | null
        btnColor?: string | null
        timeColor?: string | null
        shape?: 'square' | 'rounded' | 'oval' | null

        // runtime flags (werden im Parent genutzt)
        shouldStaySticky?: boolean
        isVisible?: boolean

        // engine fields (werden hier gesetzt)
        startedAtMs?: number | null
        endsAtMs?: number | null
        pausedRemaining?: number | null

        // legacy (falls irgendwo genutzt)
        endAt?: number | null
    }

    const props = defineProps<{
        timer: StickyTimer
        stickyEnabled: boolean
        formatTimer: (time: number) => string
        startTimer: (timer: BaseTimer) => void
        stopTimer: (timer: BaseTimer) => void
        resetTimer: (timer: BaseTimer) => void
        startDrag: (e: MouseEvent, timer: BaseTimer) => void
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
        timer,
        formatTimer,
        startTimer,
        stopTimer,
        resetTimer,
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

    const timerBaseSeconds = computed(() => {
        const preset =
            timer.seconds === 'custom'
                ? Number(timer.customSeconds ?? 0)
                : Number(timer.seconds ?? 0)

        const current = Math.max(0, Math.ceil(Number(timer.time ?? 0)))
        const paused = Math.max(0, Math.ceil(Number(timer.pausedRemaining ?? 0)))

        return Math.max(current, paused, Number.isFinite(preset) ? preset : 0, 1)
    })

    const timerRingProgress = computed(() => {
        const total = timerBaseSeconds.value
        const current = Math.max(0, Number(timer.time ?? 0))
        if (total <= 0) return 0
        return Math.max(0, Math.min(1, (total - current) / total))
    })

    const timerRingValue = computed(() =>
        Math.max(0, Math.floor(Number(timer.time ?? 0) % 60)).toString().padStart(2, '0')
    )

    const timerRingStyle = computed(() => ({
        '--ring-angle': `${(timerRingProgress.value * 360).toFixed(2)}deg`,
        '--progress-percent': `${(timerRingProgress.value * 100).toFixed(2)}%`,
    }))

    const timerSecondsLeft = computed(() => Math.max(0, Math.ceil(Number(timer.time ?? 0))))
    const timerDangerMix = computed(() => {
        const remaining = timerSecondsLeft.value
        if (remaining <= 0) return 1
        if (remaining > 5) return 0
        return Math.max(0, Math.min(1, (6 - remaining) / 5))
    })
    const timerDangerActive = computed(() =>
        timer.isRunning && timerSecondsLeft.value > 0 && timerSecondsLeft.value <= 5
    )
    const timerTimeStyle = computed(() => {
        const mix = timerDangerMix.value
        const tint = `color-mix(in srgb, var(--time-color, #e2e8f0) ${Math.max(0, 100 - mix * 78).toFixed(0)}%, #ef4444 ${(mix * 78).toFixed(0)}%)`
        return {
            ...(sizePreset.value === 'xl' ? timerRingStyle.value : {}),
            color: tint,
            '--timer-alert-accent': tint,
        }
    })

    const timerRingStrokeStyle = computed(() => {
        const radius = 48
        const circumference = 2 * Math.PI * radius
        const segments = 36
        const segmentLength = circumference / segments
        const dash = segmentLength * 0.42
        const gap = segmentLength - dash
        const progressLength = circumference * timerRingProgress.value
        const dashOffset = Math.max(0, circumference - progressLength)

        return {
            strokeDasharray: `${dash} ${gap}`,
            strokeDashoffset: `${dashOffset}`,
        }
    })

    const timerFinishedAlert = ref(false)
    let timerFinishedAlertTimeout: number | null = null

    function clearTimerFinishedAlert() {
        if (timerFinishedAlertTimeout != null) {
            clearTimeout(timerFinishedAlertTimeout)
            timerFinishedAlertTimeout = null
        }
        timerFinishedAlert.value = false
    }

    watch(
        () => timerSecondsLeft.value,
        (now, prev) => {
            if (timer.isRunning && now > 0) {
                timerFinishedAlert.value = false
                return
            }
            if ((prev ?? 0) > 0 && now === 0) {
                if (timerFinishedAlertTimeout != null) clearTimeout(timerFinishedAlertTimeout)
                timerFinishedAlert.value = true
                timerFinishedAlertTimeout = window.setTimeout(() => {
                    timerFinishedAlert.value = false
                    timerFinishedAlertTimeout = null
                }, 2600)
            }
        }
    )

    watch(
        () => [timer.isRunning, Number(timer.time ?? 0)] as const,
        ([running, time]) => {
            if (running && time > 0) clearTimerFinishedAlert()
        }
    )

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

    onBeforeUnmount(() => {
        if (dockLaunchTimer) clearTimeout(dockLaunchTimer)
        if (stackBumpTimer) clearTimeout(stackBumpTimer)
        clearTimerFinishedAlert()
    })

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

        .sticky-timer-card .sticky-menu {
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

        .sticky-timer-card .sticky-action {
            font-size: calc(0.75rem * var(--ui-scale));
            padding: calc(0.3rem * var(--ui-scale)) calc(0.6rem * var(--ui-scale));
            border-radius: 16px;
        }

    html.dark-mode .sticky-timer-card .sticky-menu button:hover {
        background: rgba(255,255,255,.06) !important;
    }
    html.dark-mode .sticky-timer-card .sticky-menu {
        background: rgba(2, 6, 23, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.4);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }
    /* Kontextmen  nur f r Sticky-Timer */
    .sticky-timer-card .hold-menu {
        left: auto;
        right: auto;
        min-width: 150px;
        max-width: 180px;
    }


        .sticky-timer-card .hold-menu button:hover {
            background: rgba(0,0,0,.06);
        }

    html.dark-mode .sticky-timer-card .hold-menu button:hover {
        background: rgba(255,255,255,.06);
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

    .sticky-action {
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.16);
        color: #f8fafc;
        font-size: 0.76rem;
        padding: 0.56rem 0.96rem;
        border-radius: 16px;
        cursor: pointer;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        box-shadow:
            0 14px 28px rgba(15, 23, 42, 0.18),
            inset 0 1px 0 rgba(255,255,255,0.18);
        transition: transform 0.16s ease, filter 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
    }

        .sticky-action::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent 38%, transparent 68%, rgba(255,255,255,0.08));
            pointer-events: none;
        }

    .sticky-action--start {
        background: linear-gradient(135deg, #14b8a6, #2563eb);
        border-color: rgba(20, 184, 166, 0.42);
    }

    .sticky-action--pause {
        background: linear-gradient(135deg, #f59e0b, #f97316);
        border-color: rgba(245, 158, 11, 0.42);
    }

    .sticky-action--stop {
        background: linear-gradient(135deg, #ef4444, #b91c1c);
        border-color: rgba(239, 68, 68, 0.42);
    }

    .sticky-action--reset {
        background: linear-gradient(135deg, #334155, #0f172a);
        border-color: rgba(100, 116, 139, 0.42);
    }

    .sticky-action--lap {
        background: linear-gradient(135deg, #7c3aed, #2563eb);
        border-color: rgba(124, 58, 237, 0.42);
    }

    .sticky-timer-card .time {
        transition: color .22s ease, text-shadow .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
    }

    .sticky-timer-card .time.time--danger {
        border-color: color-mix(in srgb, var(--timer-alert-accent, #ef4444) 58%, transparent);
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.3),
            0 0 0 1px color-mix(in srgb, var(--timer-alert-accent, #ef4444) 32%, transparent),
            0 14px 30px color-mix(in srgb, var(--timer-alert-accent, #ef4444) 24%, transparent);
        text-shadow: 0 0 14px color-mix(in srgb, var(--timer-alert-accent, #ef4444) 36%, transparent);
    }

    .sticky-timer-card.timer-finished {
        animation: sticky-finish-pulse 1.2s ease-in-out 2;
        box-shadow:
            0 0 0 1px rgba(248,250,252,.24),
            0 22px 48px rgba(239,68,68,.28),
            0 0 36px rgba(248,250,252,.16);
    }

    .sticky-timer-card .time.time--finished {
        color: #ffffff !important;
        border-color: rgba(248,250,252,.54);
        background:
            linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.06)),
            linear-gradient(135deg, #7f1d1d, #ef4444 58%, #f8fafc 124%);
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,.28),
            0 0 0 1px rgba(248,250,252,.22),
            0 18px 38px rgba(239,68,68,.34);
        text-shadow: 0 0 18px rgba(255,255,255,.22);
    }

    .timer-finish-badge {
        position: absolute;
        top: .72rem;
        right: .82rem;
        z-index: 4;
        padding: .32rem .56rem;
        border-radius: 999px;
        font-size: .62rem;
        font-weight: 900;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: #fff;
        background: linear-gradient(135deg, #ef4444, #f97316);
        border: 1px solid rgba(255,255,255,.22);
        box-shadow: 0 14px 28px rgba(239,68,68,.24);
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

    @keyframes sticky-finish-pulse {
        0%, 100% {
            transform: scale(1);
        }
        35% {
            transform: scale(1.018);
        }
        65% {
            transform: scale(.996);
        }
    }

        .sticky-action:hover {
            transform: translateY(-2px) scale(1.01);
            filter: saturate(1.06) brightness(1.02);
            box-shadow: 0 18px 34px rgba(15, 23, 42, 0.24);
        }

        .sticky-action:disabled {
            opacity: 0.42;
            cursor: not-allowed;
            filter: grayscale(0.18);
            box-shadow: none;
        }

    .sticky-timer-card.resizing {
        outline: 2px dashed var(--accent-primary);
        outline-offset: 2px;
    }

    .sticky-timer-card .resize-handle {
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
        border-radius: 22px;
    }

        .sticky-timer-card.compact .name-link,
        .sticky-timer-card.compact .time {
            flex: 1 1 auto;
            min-width: 0;
        }

        .sticky-timer-card.compact .sticky-action {
            flex: 0 0 auto;
        }

    .sticky-timer-card.compact .sticky-action {
        min-width: 4.3rem;
        padding-inline: .78rem;
    }

    .sticky-timer-card.mini {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto auto;
        gap: .38rem;
        align-items: center;
        border-radius: 18px;
        padding: .62rem .68rem;
        height: auto !important;
    }

        .sticky-timer-card.mini .name-link {
            grid-column: 1 / -1;
            text-align: center;
            font-size: .78rem;
        }

        .sticky-timer-card.mini .time,
        .sticky-timer-card.mini .time-input {
            grid-column: 1 / -1;
            justify-self: center;
            font-size: 1.28rem;
            padding: .28rem .56rem;
            border-radius: 14px;
        }

        .sticky-timer-card.mini .sticky-action {
            min-width: 0;
            width: 100%;
            padding: .4rem .48rem;
            font-size: .68rem;
            border-radius: 12px;
        }

        .sticky-timer-card.mini .sticky-action--reset {
            grid-column: 1 / -1;
        }

    .sticky-timer-card.slim {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: .28rem;
        border-radius: 16px;
        padding: .5rem .52rem;
        height: auto !important;
    }

        .sticky-timer-card.slim .name-link {
            text-align: center;
            font-size: .72rem;
        }

        .sticky-timer-card.slim .time,
        .sticky-timer-card.slim .time-input {
            align-self: stretch;
            text-align: center;
            font-size: 1.05rem;
            padding: .24rem .4rem;
            border-radius: 12px;
        }

    .sticky-timer-card.slim .sticky-action {
        min-width: 0;
        width: 100%;
        padding: .34rem .42rem;
        font-size: .62rem;
        border-radius: 10px;
    }

    .sticky-timer-card.wide {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto auto auto;
        align-items: center;
        gap: .42rem;
        padding: .5rem .72rem;
        border-radius: 18px;
        height: auto !important;
    }

        .sticky-timer-card.wide .name-link {
            grid-column: 1;
            font-size: .76rem;
            max-width: 6.2rem;
        }

        .sticky-timer-card.wide .time,
        .sticky-timer-card.wide .time-input {
            grid-column: 2;
            min-width: 0;
            width: 100%;
            font-size: 1.02rem;
            padding: .24rem .46rem;
            border-radius: 12px;
            text-align: center;
        }

        .sticky-timer-card.wide .sticky-action {
            min-width: 0;
            padding: .32rem .48rem;
            font-size: .62rem;
            border-radius: 10px;
        }

    .sticky-timer-card.large .sticky-action--start,
    .sticky-timer-card.xl .sticky-action--start {
        background: linear-gradient(135deg, #22c55e, #0f766e);
    }

    .sticky-timer-card.large .sticky-action--stop,
    .sticky-timer-card.xl .sticky-action--stop {
        background: linear-gradient(135deg, #ef4444, #7f1d1d);
    }

    .sticky-timer-card.large .sticky-action--reset,
    .sticky-timer-card.xl .sticky-action--reset {
        background: linear-gradient(135deg, #1e293b, #334155);
    }


    .sticky-timer-card.large {
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
            linear-gradient(135deg, #050816, #0f172a 42%, #2563eb 130%);
        border: 1px solid rgba(96, 165, 250, 0.18);
    }

        .sticky-timer-card.large .name-link {
            font-size: calc(.95rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-timer-card.large .time {
            font-size: calc(2.1rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 0.26em;
            padding: calc(.7rem * var(--ui-scale)) calc(1.2rem * var(--ui-scale));
            border-radius: 0;
            clip-path: polygon(7% 0, 100% 0, 93% 100%, 0 100%);
            border: 1px solid rgba(125, 211, 252, 0.28);
            background:
                linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)),
                repeating-linear-gradient(90deg, rgba(34,211,238,.12) 0 2px, transparent 2px 16px),
                linear-gradient(180deg, #02040a, #07101f 54%, #020617);
            color: #93fdff;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.1),
                inset 0 -18px 26px rgba(0,0,0,0.46),
                0 0 0 2px rgba(8, 47, 73, 0.55),
                0 0 0 8px rgba(14, 165, 233, 0.08),
                0 18px 38px rgba(2, 6, 23, 0.4);
            text-shadow:
                0 0 12px rgba(34, 211, 238, 0.55),
                0 0 32px rgba(34, 211, 238, 0.24);
            position: relative;
            isolation: isolate;
        }

    html.dark-mode .sticky-timer-card.large .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-timer-card.large .sticky-action {
        font-weight: 800;
        font-size: calc(.74rem * var(--ui-scale));
        padding: calc(.46rem * var(--ui-scale)) calc(.82rem * var(--ui-scale));
        border-radius: 14px;
        clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
    }

    /* XL = ring left, actions right */
    .sticky-timer-card.xl {
        display: grid;
        grid-template-columns: minmax(0, auto) minmax(6.2rem, 1fr);
        grid-template-rows: auto auto auto auto;
        align-items: center;
        column-gap: calc(.72rem * var(--ui-scale));
        row-gap: calc(.48rem * var(--ui-scale));
        width: auto; /* width bleibt via inline-style */
        border-radius: 32px;
        padding: calc(1rem * var(--ui-scale)) calc(1.08rem * var(--ui-scale));
        box-shadow:
            0 18px 34px rgba(15,23,42,.22),
            inset 0 1px 0 rgba(255,255,255,.08);
        position: fixed;
        background: linear-gradient(180deg, #1b2431, #0f172a);
        border: 1px solid rgba(148,163,184,.18);
    }

        .sticky-timer-card.xl .name-link {
            grid-column: 1 / -1;
            grid-row: 1;
            font-size: calc(.9rem * var(--ui-scale));
            opacity: .9;
            text-align: left;
        }

        .sticky-timer-card.xl .time,
        .sticky-timer-card.xl .time-input {
            grid-column: 1;
            grid-row: 2 / span 3;
            align-self: center;
            font-size: calc(2.95rem * var(--ui-scale));
            font-weight: 800;
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

        .sticky-timer-card.xl .sticky-action {
            min-width: 0;
            width: 100%;
            justify-self: stretch;
            border-radius: 16px;
            padding: calc(.56rem * var(--ui-scale)) calc(.8rem * var(--ui-scale));
            font-size: calc(.78rem * var(--ui-scale));
        }

        .sticky-timer-card.xl .sticky-action--start {
            grid-column: 2;
            grid-row: 2;
        }

        .sticky-timer-card.xl .sticky-action--stop {
            grid-column: 2;
            grid-row: 3;
        }

    .sticky-timer-card.xl .sticky-action--reset {
        grid-column: 2;
        grid-row: 4;
    }

    .sticky-timer-card.xl.xl-compact-layout {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: auto auto auto;
        column-gap: calc(.46rem * var(--ui-scale));
        row-gap: calc(.56rem * var(--ui-scale));
        border-radius: 28px;
        padding: calc(.9rem * var(--ui-scale)) calc(.92rem * var(--ui-scale));
    }

        .sticky-timer-card.xl.xl-compact-layout .name-link {
            grid-column: 1 / -1;
            grid-row: 1;
            text-align: center;
        }

        .sticky-timer-card.xl.xl-compact-layout .time,
        .sticky-timer-card.xl.xl-compact-layout .time-input {
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

        .sticky-timer-card.xl.xl-compact-layout .time .time-ring__svg {
            display: none;
        }

        .sticky-timer-card.xl.xl-compact-layout .time .time-ring__value {
            font-size: calc(2.35rem * var(--ui-scale));
            letter-spacing: -.02em;
        }

        .sticky-timer-card.xl.xl-compact-layout .time .time-ring__label {
            font-size: calc(.68rem * var(--ui-scale));
            letter-spacing: .12em;
            text-transform: uppercase;
            color: rgba(226, 232, 240, 0.48);
        }

        .sticky-timer-card.xl.xl-compact-layout .sticky-action {
            grid-row: 3;
            min-width: 0;
            width: 100%;
            border-radius: 14px;
            padding: calc(.54rem * var(--ui-scale)) calc(.5rem * var(--ui-scale));
            font-size: calc(.74rem * var(--ui-scale));
        }

        .sticky-timer-card.xl.xl-compact-layout .sticky-action--start {
            grid-column: 1;
        }

        .sticky-timer-card.xl.xl-compact-layout .sticky-action--stop {
            grid-column: 2;
        }

        .sticky-timer-card.xl.xl-compact-layout .sticky-action--reset {
            grid-column: 3;
        }

        .sticky-timer-card.xl .time::before,
        .sticky-timer-card.xl .time::after {
            content: none;
        }

        .sticky-timer-card.xl .time > * {
            position: relative;
            z-index: 1;
        }

        .sticky-timer-card.xl .time .time-ring__svg {
            position: absolute;
            inset: -10px;
            width: calc(100% + 20px);
            height: calc(100% + 20px);
            transform: rotate(-90deg);
            z-index: 0;
            overflow: visible;
        }

        .sticky-timer-card.xl .time .time-ring__track,
        .sticky-timer-card.xl .time .time-ring__progress {
            fill: none;
            stroke-width: 6;
            stroke-linecap: butt;
        }

        .sticky-timer-card.xl .time .time-ring__track {
            stroke: rgba(71, 85, 105, 0.38);
            stroke-dasharray: 3.52 5.39;
        }

        .sticky-timer-card.xl .time .time-ring__progress {
            stroke: #f3f4f6;
            transition: stroke-dashoffset 220ms ease;
        }

        .sticky-timer-card.xl .time .time-ring__value {
            font-size: calc(2.75rem * var(--ui-scale));
            font-weight: 900;
            line-height: 1;
            letter-spacing: 0;
            color: #ffffff;
            text-shadow: none;
        }

        .sticky-timer-card.xl .time .time-ring__label {
            font-size: calc(.62rem * var(--ui-scale));
            line-height: 1;
            letter-spacing: .08em;
            text-transform: none;
            color: rgba(226, 232, 240, 0.54);
        }

    html.dark-mode .sticky-timer-card.xl .time {
        background: #0b1220;
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
        border-radius: 26px;
        padding: calc(.88rem * var(--ui-scale)) calc(1.05rem * var(--ui-scale));
        gap: calc(.45rem * var(--ui-scale));
        box-shadow:
            0 26px 56px rgba(15,23,42,.3),
            inset 0 1px 0 rgba(255,255,255,.14),
            inset 0 -22px 28px rgba(0,0,0,.24);
        background:
            linear-gradient(180deg, #050816, #10172a 46%, #172554 100%);
        justify-content: center;
        border: 1px solid rgba(96,165,250,.14);
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

        /* Zeit bekommt eigene Zeile, mega pr sent */
    .sticky-timer-card.tall .time {
            order: 2;
            flex-basis: 100%;
            text-align: center;
            font-size: calc(2.6rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: .18em;
            padding: calc(.7rem * var(--ui-scale)) calc(1.15rem * var(--ui-scale));
            border-radius: 18px;
            clip-path: polygon(0 0, 100% 0, 96% 100%, 4% 100%);
            background:
                linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02)),
                repeating-linear-gradient(90deg, rgba(56,189,248,.12) 0 2px, transparent 2px 18px),
                linear-gradient(180deg, #010409, #0b1220);
            border: 1px solid rgba(96,165,250,0.24);
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.08),
                inset 0 -18px 24px rgba(0,0,0,.42),
                0 0 0 2px rgba(8,47,73,.65),
                0 18px 36px rgba(15,23,42,.34);
            color: #ecfeff;
            text-shadow: 0 0 20px rgba(56,189,248,.34);
        }

    html.dark-mode .sticky-timer-card.tall .time {
        background: rgba(255,255,255,.06);
    }

    /* Buttons teilen sich unten eine Reihe */
    .sticky-timer-card.tall .sticky-action {
        order: 3;
        flex: 0 1 auto; /* shrink statt wrap */
        white-space: nowrap; /* text bleibt in einer Zeile */
        font-size: calc(.8rem * var(--ui-scale));
        padding: calc(.34rem * var(--ui-scale)) calc(.75rem * var(--ui-scale));
        border-radius: 999px;
    }

    /* ===== Narrow: ultra-schmal => alles bleibt im Card ===== */
    .sticky-timer-card.narrow {
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: calc(.35rem * var(--ui-scale));
        padding: calc(.72rem * var(--ui-scale)) calc(.86rem * var(--ui-scale));
        border-radius: 22px;
    }

        .sticky-timer-card.narrow .name-link {
            text-align: center;
            font-size: calc(.9rem * var(--ui-scale));
            opacity: .9;
        }

        .sticky-timer-card.narrow .time {
            text-align: center;
            font-size: calc(2.15rem * var(--ui-scale));
            font-weight: 900;
            letter-spacing: 1.55px;
            padding: calc(.22rem * var(--ui-scale)) calc(.72rem * var(--ui-scale));
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

    html.dark-mode .sticky-timer-card.narrow .time {
        background: rgba(255,255,255,.06);
    }

    .sticky-timer-card.narrow .sticky-action {
        width: 100%;
        max-width: 150px;
        white-space: nowrap; /* kein Wrap */
        font-size: calc(.8rem * var(--ui-scale));
        padding: calc(.32rem * var(--ui-scale)) calc(.7rem * var(--ui-scale));
        border-radius: 18px;
    }

    .color-row {
        display: flex;
        align-items: center;
        gap: .35rem;
        padding: .5rem .2rem .2rem;
        border-top: 1px solid color-mix(in srgb, var(--border-color) 82%, transparent);
        margin-top: .4rem;
        flex-wrap: wrap;
    }

    .color-label {
        font-size: .75rem;
        opacity: .8;
        margin-right: .25rem;
    }
    /* StickyTimerCard.vue | REPLACE menu button selectors */
    .sticky-timer-card .hold-menu .menu-item {
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

        .sticky-timer-card .hold-menu .menu-item.danger {
            color: #ef4444;
        }

    .sticky-timer-card .sticky-menu .menu-item {
        background: transparent !important;
        border: 0 !important;
        padding: .58rem .72rem !important;
        font-size: .85rem !important;
        font-weight: 600 !important; /* same as stopwatch */
        border-radius: 10px !important;
        display: block;
        width: 100%;
        text-align: left;
        cursor: pointer;
        line-height: 1.2;
        color: var(--text-primary);
    }

    /* StickyTimerCard.vue | ADD stronger dot specificity */
    .sticky-timer-card .color-dot {
        width: 18px !important;
        height: 18px !important;
        padding: 0 !important;
        display: inline-block !important;
        border-radius: 999px !important;
        text-align: center !important;
        background-clip: padding-box;
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


    .color-dot.default {
        background: var(--bg-secondary);
    }

    .color-dot.transparent {
        background: repeating-linear-gradient( 45deg, rgba(255,255,255,.2), rgba(255,255,255,.2) 4px, rgba(0,0,0,.2) 4px, rgba(0,0,0,.2) 8px );
    }

    .color-dot.blue {
        background: #1e3a8a;
    }
    /* ADD time input look */
    .time-input {
        background: transparent;
        border: 1px dashed var(--accent-primary);
        border-radius: 6px;
        padding: 0 .25rem;
        width: 5.5ch; /* passt für "mm:ss" */
        text-align: center;
        outline: none;
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
