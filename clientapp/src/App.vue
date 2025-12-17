<!-- App.vue -->

<template>
    <div class="app-container">
        <!-- ✅ Navbar -->
        <nav class="main-nav" ref="navRef">
            <div class="nav-content">
                <router-link to="/">
                    <img src="/Logo.png" alt="Logo" class="logo" @error="handleLogoError" />
                </router-link>

                <!-- Burger -->
                <button class="burger-menu"
                        @click="toggleMenu"
                        :class="{ open: menuOpen }"
                        aria-label="Menü"
                        :aria-expanded="menuOpen"
                        aria-controls="mobile-nav-links">
                    <span></span><span></span><span></span>
                </button>

                <!-- Links -->
                <ul id="mobile-nav-links" class="nav-links" :class="{ open: menuOpen }">
                    <li><router-link to="/" class="nav-link" @click="closeMenu"><i class="fas fa-home"></i> Home</router-link></li>
                    <li><router-link to="/training" class="nav-link" @click="closeMenu"><i class="fas fa-dumbbell"></i> Training</router-link></li>
                    <li><router-link to="/nutrition" class="nav-link" @click="closeMenu"><i class="fas fa-utensils"></i> Ernährung</router-link></li>
                    <li><router-link to="/progress" class="nav-link" @click="closeMenu"><i class="fas fa-chart-line"></i> Fortschritt</router-link></li>
                    <li><router-link to="/tutorials" class="nav-link" @click="closeMenu"><i class="fas fa-video"></i> Tutorials</router-link></li>
                    <li><router-link to="/settings" class="nav-link" @click="closeMenu"><i class="fas fa-cog"></i> Einstellungen</router-link></li>

                    <!-- 🔐 Login, wenn kein User -->
                    <template v-if="!auth.isAuthenticated">
                        <li>
                            <router-link to="/login" class="nav-link" @click="closeMenu">
                                <i class="fas fa-sign-in-alt"></i> Login
                            </router-link>
                        </li>
                    </template>

                    <!-- ✅ Nur Profil, wenn eingeloggt -->
                    <template v-else>
                        <li>
                            <router-link to="/profile" class="nav-link" @click="closeMenu">
                                <i class="fas fa-user-circle"></i> Profil
                            </router-link>
                        </li>
                    </template>
                </ul>
            </div>
        </nav>

        <!-- ✅ Overlay -->
        <div v-if="menuOpen" class="nav-overlay" @click="closeMenu"></div>

        <!-- ✅ Sticky Timer -->
        <StickyTimerCard v-for="timer in timers.filter(t => t.shouldStaySticky)"
                         :key="'timer-' + timer.id"
                         :timer="timer"
                         :format-timer="formatTimer"
                         :start-timer="startTimer"
                         :stop-timer="stopTimer"
                         :reset-timer="resetTimer"
                         :start-drag="startDrag"
                         :focus-in-training="focusInTraining"
                         @apply-style-all="onApplyStyleAll" />

        <!-- ✅ Sticky Stopwatch -->
        <StickyStopwatchCard v-for="sw in stopwatches.filter(sw => sw.shouldStaySticky)"
                             :key="'sw-' + sw.id"
                             :stopwatch="sw"
                             :format-stopwatch="formatStopwatch"
                             :toggle-stopwatch="toggleStopwatch"
                             :reset-stopwatch="resetStopwatch"
                             :add-lap="addLap"
                             :start-drag="startDrag"
                             :focus-in-training="focusInTraining"
                             @apply-style-all="onApplyStyleAll" />

        <!-- ✅ Validation-Popup -->
        <ValidationPopup :show="showValidationPopup"
                         :errors="validationErrorMessages"
                         @close="closeValidationPopup" />

        <!-- ✅ Neuigkeiten-Popup -->
        <GlobalNewsPopup :show="showNewsPopup"
                         title="Was ist neu?"
                         :items="newsItems"
                         @close="onNewsClose" />

        <!-- ✅ Seiten-Inhalt -->
        <main class="main-content">
            <router-view :timers="timers"
                         :stopwatches="stopwatches"
                         :startTimer="startTimer"
                         :stopTimer="stopTimer"
                         :resetTimer="resetTimer"
                         :toggleStopwatch="toggleStopwatch"
                         :resetStopwatch="resetStopwatch"
                         :removeTimer="removeTimer"
                         :removeStopwatch="removeStopwatch"
                         @add-timer="addTimer"
                         @add-stopwatch="addStopwatch"
                         @remove-timer="removeTimer"
                         @remove-stopwatch="removeStopwatch"
                         @reorder-timers="reorderTimers"
                         @reorder-stopwatches="reorderStopwatches" />
        </main>

        <!-- ✅ Mini-Guide: Spotlight auf ℹ️ (ExplanationPopup) -->
        <GlobalExplainGuide :version="NEWS_VERSION" :block="showNewsPopup" />

        <footer class="app-footer">
            <div class="app-footer-content">
                <router-link to="/legal-notice" class="footer-link">
                    Impressum
                </router-link>
                <router-link to="/terms" class="footer-link">
                    AGB
                </router-link>
                <router-link to="/privacy" class="footer-link">
                    Datenschutz
                </router-link>
                <router-link to="/cookies" class="footer-link">Cookies</router-link>
                <router-link to="/refund" class="footer-link">Widerruf</router-link>
                <router-link to="/contact" class="footer-link">Kontakt</router-link>
                <router-link to="/faq" class="footer-link">FAQ</router-link>
                <router-link to="/about" class="footer-link">Über uns</router-link>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
    import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
    import StickyTimerCard from '@/components/ui/global/StickyTimerCard.vue'
    import StickyStopwatchCard from '@/components/ui/global/StickyStopwatchCard.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import GlobalNewsPopup from '@/components/ui/popups/global/GlobalNewsPopup.vue'
    import GlobalExplainGuide from '@/components/ui/popups/global/GlobalExplainGuide.vue'

    const auth = useAuthStore()

    async function logoutAndClose() {
        await auth.signOut()
        closeMenu()
    }

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
        bgColor?: string | null
        btnColor?: string | null
        timeColor?: string | null
        shape?: 'square' | 'rounded' | 'oval' | null
        width?: number
        height?: number
        left?: number
        top?: number
        endAt?: number | null
        startedAtMs?: number | null
        endsAtMs?: number | null
        pausedRemaining?: number | null
        zIndex?: number
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

    // App.vue | ADD helper: eindeutige Namen erzwingen
    function getUniqueName(base: string, used: string[]): string {
        const lowerUsed = used.map(n => n.toLowerCase())
        let name = base.trim() || 'Eintrag'
        let i = 2

        while (lowerUsed.includes(name.toLowerCase())) {
            name = `${base} (${i})`
            i++
        }

        return name
    }

    // Reaktive Zustände
    const validationErrorMessages = ref<string[]>([])
    const showValidationPopup = ref(false)
    const menuOpen = ref(false)
    const dragging = ref(false)
    const dragTarget = ref<any>(null)
    const timers = ref<TimerInstance[]>([])
    const stopwatches = ref<StopwatchInstance[]>([])
    const route = useRoute()
    const navRef = ref<HTMLElement | null>(null)
    const router = useRouter()

    const TIMER_KEY = 'training_timers_v1'
    const STOPWATCH_KEY = 'training_stopwatches_v1'

    // === neue Refs & Konstanten oben zu den anderen Refs ===
    const dragEl = ref<HTMLElement | null>(null)
    const EDGE_PAD = 8  // Sicherheitsabstand zu den Rändern

    function focusInTraining(type: 'timer' | 'stopwatch', id: string) {
        localStorage.setItem('trainingFocusType', type)
        localStorage.setItem('trainingFocusId', id)

        if (router.currentRoute.value.path === '/training') {
            // Schon dort → fokussieren ohne Route neu zu laden
            window.dispatchEvent(new CustomEvent('training:focus', { detail: { type, id } }))
        } else {
            router.push('/training')
        }
    }

    const NEWS_SEEN_KEY = 'tyg_news_seen_version'
    const NEWS_VERSION = '2025-12-17' // <- ändere das bei jedem Release/Update

    const showNewsPopup = ref(false)
    const newsItems = [
        {
            tag: 'Neu',
            text: 'Neue Settings-Struktur. Zur Übersicht gibt’s jetzt saubere Gruppen: Anzeige, System & Toasts.'
        },
        {
            tag: 'Neu',
            text: 'Toast-Dauer einstellbar. Du bestimmst jetzt, wie lange Toasts sichtbar bleiben (1.5s bis 12s).'
        },
        {
            tag: 'Neu',
            text: 'Toast-Arten verwalten. Pro Toast-Typ (Save/Add/Delete/Timer/Reset/Standard) kannst du gezielt aktivieren/deaktivieren.'
        },
        {
            tag: 'Neu',
            text: 'ℹ️-Erklärungen in Rechnern: Bei jedem Calculator öffnet das ℹ️ ein Info-Popup (ExplanationPopup) – mit kurzer Erklärung, wofür der Rechner ist, plus hilfreichen Sections/Quick-Navigation.'
        },
        {
            tag: 'Update',
            text: 'Toasts komplett modernisiert. Neue Glass-Card Optik mit Blur, stärkere Kontraste im Dark Mode, feinere Shadows und rundere Kanten.'
        },
        {
            tag: 'Neu',
            text: 'Akzent & Progress-Bar upgraded. Jede Toast-Art hat jetzt einen klaren Farb-Accent + smoother Verlauf.'
        }
    ]


    function onNewsClose(payload: { action: 'cancel' | 'save'; dontShowAgain: boolean }) {
        showNewsPopup.value = false

        if (payload.dontShowAgain) {
            localStorage.setItem(NEWS_SEEN_KEY, NEWS_VERSION)
        }

        if (payload.action === 'save') {
            // Guide erst starten, wenn News wirklich zu ist
            window.setTimeout(() => {
                window.dispatchEvent(new Event('tyg:explain-guide'))
            }, 120)
        }
    }


    function clampObjToViewport(obj: any, elW?: number, elH?: number) {
        const w = elW ?? 200
        const h = elH ?? 80
        const navH = navRef.value?.offsetHeight ?? 0
        const minLeft = EDGE_PAD
        const maxLeft = Math.max(minLeft, window.innerWidth - w - EDGE_PAD)
        const minTop = navH + EDGE_PAD
        const maxTop = Math.max(minTop, window.innerHeight - h - EDGE_PAD)

        obj.left = Math.min(Math.max(obj.left ?? minLeft, minLeft), maxLeft)
        obj.top = Math.min(Math.max(obj.top ?? minTop, minTop), maxTop)
    }

    function clampAllSticky() {
        timers.value.filter(t => t.shouldStaySticky)
            .forEach(t => clampObjToViewport(t, (t as any)._w, (t as any)._h))
        stopwatches.value.filter(s => s.shouldStaySticky)
            .forEach(s => clampObjToViewport(s, (s as any)._w, (s as any)._h))
    }

    function saveAll() {
        const t = timers.value.map(({ interval, ...rest }) => rest)
        const s = stopwatches.value.map(({ interval, ...rest }) => rest)
        localStorage.setItem(TIMER_KEY, JSON.stringify(t))
        localStorage.setItem(STOPWATCH_KEY, JSON.stringify(s))
    }

    function onApplyStyleAll(payload: {
        kind: 'timer' | 'stopwatch'
        style: {
            bgColor: string | null
            btnColor: string | null
            timeColor: string | null
            shape: 'square' | 'rounded' | 'oval' | null
        }
    }) {
        if (payload.kind === 'timer') {
            timers.value.forEach(t => {
                t.bgColor = payload.style.bgColor
                t.btnColor = payload.style.btnColor
                t.timeColor = payload.style.timeColor
                t.shape = payload.style.shape
            })
            defaultTimerStyle.value = { ...payload.style }
        } else {
            stopwatches.value.forEach(sw => {
                sw.bgColor = payload.style.bgColor
                sw.btnColor = payload.style.btnColor
                sw.timeColor = payload.style.timeColor
                sw.shape = payload.style.shape
            })
            defaultStopwatchStyle.value = { ...payload.style }
        }

        saveAll()
    }

    // App.vue | REPLACE loadAll mit eindeutigen Namen
    function loadAll() {
        const oldTimers = localStorage.getItem('myAppTimers')
        const oldStop = localStorage.getItem('myAppStopwatches')

        try {
            const t = JSON.parse(localStorage.getItem(TIMER_KEY) || oldTimers || '[]')
            const s = JSON.parse(localStorage.getItem(STOPWATCH_KEY) || oldStop || '[]')

            const usedTimerNames: string[] = []
            timers.value = Array.isArray(t)
                ? t.map((x: any) => {
                    const base = (x.name ?? '').trim() || 'Timer'
                    const unique = getUniqueName(base, usedTimerNames)
                    usedTimerNames.push(unique)
                    return {
                        ...x,
                        interval: null,
                        name: unique,
                    }
                })
                : []

            const usedStopNames: string[] = []
            stopwatches.value = Array.isArray(s)
                ? s.map((x: any) => {
                    const base = (x.name ?? '').trim() || 'Stoppuhr'
                    const unique = getUniqueName(base, usedStopNames)
                    usedStopNames.push(unique)
                    return {
                        ...x,
                        interval: null,
                        laps: x.laps || [],
                        name: unique,
                    }
                })
                : []
        } catch {
            timers.value = []
            stopwatches.value = []
        }
    }

    const defaultTimerStyle = ref({
        bgColor: null as string | null,
        btnColor: null as string | null,
        timeColor: null as string | null,
        shape: null as 'square' | 'rounded' | 'oval' | null,
    })

    const defaultStopwatchStyle = ref({
        bgColor: null as string | null,
        btnColor: null as string | null,
        timeColor: null as string | null,
        shape: null as 'square' | 'rounded' | 'oval' | null,
    })
    function closeMenu() {
        menuOpen.value = false
    }
    watch(() => route.fullPath, () => {
        if (menuOpen.value) closeMenu()
    })

    function handleDocClick(e: MouseEvent) {
        if (!menuOpen.value) return
        const target = e.target as Node
        if (navRef.value && !navRef.value.contains(target)) {
            closeMenu()
        }
    }

    onMounted(() => {
        document.addEventListener('click', handleDocClick, true)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleDocClick, true)
    })

    function reorderTimers(newList: any[]) {
        timers.value = newList
        saveAll()
    }
    function reorderStopwatches(newList: any[]) {
        stopwatches.value = newList
        saveAll()
    }
    // Validation-Popup

    function openValidationPopup(errors: string[]) {
        validationErrorMessages.value = errors
        showValidationPopup.value = true
    }

    function closeValidationPopup() {
        showValidationPopup.value = false
        validationErrorMessages.value = []
    }

    // Navbar
    const toggleMenu = () => {
        menuOpen.value = !menuOpen.value
    }

    const handleLogoError = (e: Event) => {
        const target = e.target as HTMLImageElement
        target.src = 'https://via.placeholder.com/56?text=Logo'
    }

    const addTimer = async (timer: TimerInstance) => {
        // Name hart normalisieren: niemals leer lassen
        const rawName = (timer.name ?? '').trim()
        timer.name = rawName || 'Timer'

        const s = defaultTimerStyle.value

        timer.bgColor = s.bgColor
        timer.btnColor = s.btnColor
        timer.timeColor = s.timeColor
        timer.shape = s.shape

        timers.value = [...timers.value, timer]
        await nextTick()
    }

    const addStopwatch = async (stopwatch: StopwatchInstance) => {
        const rawName = (stopwatch.name ?? '').trim() || 'Stoppuhr'
        const existingNames = stopwatches.value.map(sw => sw.name)
        stopwatch.name = getUniqueName(rawName, existingNames)

        const s = defaultStopwatchStyle.value
        stopwatch.bgColor = s.bgColor
        stopwatch.btnColor = s.btnColor
        stopwatch.timeColor = s.timeColor
        stopwatch.shape = s.shape

        stopwatches.value = [...stopwatches.value, stopwatch]
        await nextTick()
    }

    const removeTimer = async (id: string) => {
        const idx = timers.value.findIndex(t => t.id === id)
        if (idx !== -1) {
            const t = timers.value[idx]
            t.shouldStaySticky = false
            t.isRunning = false
            if (t.interval) { clearInterval(t.interval); t.interval = null }
            timers.value = timers.value.filter(x => x.id !== id)
            await nextTick()
            saveAll() // ⬅️ hinzufügen
        }
    }

    const removeStopwatch = async (id: string) => {
        const idx = stopwatches.value.findIndex(sw => sw.id === id)
        if (idx !== -1) {
            const sw = stopwatches.value[idx]
            sw.shouldStaySticky = false
            sw.isRunning = false
            if (sw.interval) { clearInterval(sw.interval); sw.interval = null }
            stopwatches.value = stopwatches.value.filter(s => s.id !== id)
            await nextTick()
            saveAll() // ⬅️ hinzufügen
        }
    }

    function startTimer(timer: TimerInstance) {
        // optional: Limit gleichzeitiger Timer
        const running = timers.value.filter(t => t.isRunning)
        if (running.length >= 3) {
            openValidationPopup(['Maximal 3 Timer dürfen gleichzeitig laufen!'])
            return
        }

        if (timer.isRunning) return

        const remaining = Math.max(0, Math.ceil(timer.time || Number(timer.seconds) || Number(timer.customSeconds) || 60))
        timer.endAt = Date.now() + remaining * 1000
        timer.isRunning = true
        timer.shouldStaySticky = true
        if (timer.left === undefined) timer.left = 20
        if (timer.top === undefined) timer.top = 80

        if (timer.interval) clearInterval(timer.interval)
        timer.interval = window.setInterval(() => {
            const left = Math.ceil(((timer.endAt ?? Date.now()) - Date.now()) / 1000)
            timer.time = Math.max(0, left)
            if (timer.time <= 0) {
                clearInterval(timer.interval!)
                timer.interval = null
                timer.isRunning = false
                timer.endAt = null
                saveAll()
            }
        }, 250)

        saveAll()
    }

    function stopTimer(timer: TimerInstance) {
        if (timer.interval) clearInterval(timer.interval)
        timer.interval = null
        if (timer.endAt) {
            const left = Math.ceil((timer.endAt - Date.now()) / 1000)
            timer.time = Math.max(0, left)
        }
        timer.isRunning = false
        timer.endAt = null
        saveAll()
    }

    function resetTimer(timer: TimerInstance) {
        if (timer.interval) clearInterval(timer.interval)
        timer.interval = null
        timer.isRunning = false
        timer.endAt = null
        const base = timer.seconds === 'custom'
            ? (timer.customSeconds ?? 60)
            : Number(timer.seconds ?? 60) || 60
        timer.time = Math.max(1, base)
        timer.shouldStaySticky = false
        saveAll()
    }

    // App.vue | REPLACE toggleStopwatch
    function toggleStopwatch(sw: StopwatchInstance) {
        // ❗ Fallback: Niemals namenlose Stoppuhr zulassen
        const rawName = (sw.name ?? '').trim()
        if (!rawName) {
            sw.name = 'Stoppuhr'
        }

        if (!sw.isRunning) {
            const running = stopwatches.value.filter(s => s.isRunning)
            if (running.length >= 3) {
                openValidationPopup(['Maximal 3 Stoppuhren dürfen gleichzeitig laufen!'])
                return
            }

            sw.isRunning = true
            sw.startedAt = Date.now()
            sw.offsetSec = sw.offsetSec ?? sw.time ?? 0
            sw.shouldStaySticky = true
            if (sw.left === undefined) sw.left = 20
            if (sw.top === undefined) sw.top = 140

            if (sw.interval) clearInterval(sw.interval)
            sw.interval = window.setInterval(() => {
                const elapsed = (Date.now() - (sw.startedAt ?? Date.now())) / 1000
                sw.time = (sw.offsetSec ?? 0) + elapsed
            }, 100)

            saveAll()
        } else {
            if (sw.interval) clearInterval(sw.interval)
            sw.interval = null
            const elapsed = (Date.now() - (sw.startedAt ?? Date.now())) / 1000
            sw.offsetSec = (sw.offsetSec ?? 0) + elapsed
            sw.time = sw.offsetSec
            sw.isRunning = false
            sw.startedAt = null
            saveAll()
        }
    }


    function resetStopwatch(sw: StopwatchInstance) {
        if (sw.interval) clearInterval(sw.interval)
        sw.interval = null
        sw.isRunning = false
        sw.startedAt = null
        sw.offsetSec = 0
        sw.time = 0
        sw.laps = []
        sw.shouldStaySticky = false
        saveAll()
    }

    const addLap = (sw: StopwatchInstance) => {
        if (!sw.laps) sw.laps = []
        sw.laps.push(sw.time)
    }

    // === startDrag anpassen ===
    function startDrag(e: MouseEvent, target: any) {
        e.preventDefault()
        dragging.value = true
        dragTarget.value = target
        dragEl.value = e.currentTarget as HTMLElement

        const el = dragEl.value
        target._w = el?.offsetWidth ?? 200
        target._h = el?.offsetHeight ?? 80
        target.offsetX = e.clientX - (target.left || 0)
        target.offsetY = e.clientY - (target.top || 0)

        // sicherheitshalber gleich beim Start clampen
        clampObjToViewport(target, target._w, target._h)

        window.addEventListener('mousemove', onDrag)
        window.addEventListener('mouseup', stopDrag)
    }


    // === onDrag anpassen ===
    function onDrag(e: MouseEvent) {
        if (!dragging.value || !dragTarget.value) return
        const t = dragTarget.value

        // neue Positionen
        t.left = e.clientX - (t.offsetX ?? 0)
        t.top = e.clientY - (t.offsetY ?? 0)

        // an die Kanten klemmen
        const elW = dragEl.value?.offsetWidth ?? t._w ?? 200
        const elH = dragEl.value?.offsetHeight ?? t._h ?? 80
        clampObjToViewport(t, elW, elH)
    }

    // === stopDrag minimal ergänzen ===
    function stopDrag() {
        dragging.value = false
        dragTarget.value = null
        dragEl.value = null
        window.removeEventListener('mousemove', onDrag)
        window.removeEventListener('mouseup', stopDrag)
    }

    // Format
    const formatTimer = (time: number) => {
        const m = Math.floor(time / 60)
        const s = time % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    const formatStopwatch = (time: number) => {
        const m = Math.floor(time / 60)
        const s = Math.floor(time % 60)
        const ms = Math.floor((time % 1) * 100)
        return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
    }

    const handleKeydown = (event: KeyboardEvent) => {
        // ESC schließt Mobile-Menü
        if (event.key === 'Escape' && menuOpen.value) {
            event.preventDefault()
            closeMenu()
            return
        }

        // nicht wenn User in Eingabefeldern/Editable tippt oder auf Buttons/Links ist
        const el = event.target as HTMLElement | null
        const tag = (el?.tagName || '').toLowerCase()
        const isTypingTarget =
            tag === 'input' ||
            tag === 'textarea' ||
            tag === 'select' ||
            (el as any)?.isContentEditable

        const isInteractiveTarget =
            tag === 'button' ||
            tag === 'a' ||
            (el?.getAttribute?.('role') === 'button') ||
            (el?.getAttribute?.('role') === 'link')

        // SPACE -> Global Explain Guide starten
        // SPACE -> Global Explain Guide starten (FORCE)
        const k = (event.key || '').toLowerCase()
        const isSpace = event.code === 'Space' || k === ' ' || k === 'spacebar'
        if (isSpace) {
            if (event.repeat) return
            if (isTypingTarget || isInteractiveTarget) return

            event.preventDefault()
            event.stopImmediatePropagation()
            event.stopPropagation()

            // wenn News offen ist, erst schließen -> dann Guide starten (sonst blockt props.block)
            if (showNewsPopup.value) {
                showNewsPopup.value = false
                window.setTimeout(() => {
                    window.dispatchEvent(new Event('tyg:explain-guide-force'))
                }, 120)
            } else {
                window.dispatchEvent(new Event('tyg:explain-guide-force'))
            }
            return
        }


        // Ctrl+Alt+N (Win/Linux) / Cmd+Alt+N (Mac) -> News-Popup
        const key = (event.key || '').toLowerCase()
        const isN = key === 'n' || event.code === 'KeyN'

        const hasCtrlOrCmd = event.ctrlKey || event.metaKey
        const isNewsHotkey = isN && hasCtrlOrCmd && event.altKey

        if (!isNewsHotkey) return
        if (event.repeat) return
        if (showNewsPopup.value) return
        if (isTypingTarget || isInteractiveTarget) return

        event.preventDefault()
        event.stopImmediatePropagation()
        event.stopPropagation()

        showNewsPopup.value = true
    }

    // Scrollbarbreite als CSS-Var
    const setSBW = () => {
        const sbw = window.innerWidth - document.documentElement.clientWidth
        document.documentElement.style.setProperty('--sbw', `${sbw}px`)
    }

    onMounted(() => {
        setSBW()
        window.addEventListener('resize', setSBW)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('resize', setSBW)
    })


    // Load saved data
    onMounted(() => {
        loadAll()
        const seen = localStorage.getItem(NEWS_SEEN_KEY)
        if (seen !== NEWS_VERSION) {
            showNewsPopup.value = true
        }

        // Timer rehydrieren
        timers.value.forEach(t => {
            if (t.isRunning && t.endAt) {
                t.time = Math.max(0, Math.ceil((t.endAt - Date.now()) / 1000))
                if (t.time > 0) {
                    if (t.interval) clearInterval(t.interval)
                    t.interval = window.setInterval(() => {
                        const l = Math.ceil(((t.endAt ?? Date.now()) - Date.now()) / 1000)
                        t.time = Math.max(0, l)
                        if (t.time <= 0) {
                            clearInterval(t.interval!)
                            t.interval = null
                            t.isRunning = false
                            t.endAt = null
                            saveAll()
                        }
                    }, 250)
                } else {
                    t.isRunning = false
                    t.endAt = null
                    t.time = 0
                }
            }
        })

        // Stopwatches rehydrieren
        stopwatches.value.forEach(sw => {
            if (sw.isRunning && sw.startedAt != null) {
                const elapsed = (Date.now() - sw.startedAt) / 1000
                sw.offsetSec = sw.offsetSec ?? 0
                sw.time = (sw.offsetSec ?? 0) + elapsed
                if (sw.interval) clearInterval(sw.interval)
                sw.interval = window.setInterval(() => {
                    const e = (Date.now() - (sw.startedAt ?? Date.now())) / 1000
                    sw.time = (sw.offsetSec ?? 0) + e
                }, 100)
            }
        })

        saveAll()
        window.addEventListener('keydown', handleKeydown, { capture: true })

    })


    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', onDrag)
        window.removeEventListener('mouseup', stopDrag)
        window.removeEventListener('keydown', handleKeydown, { capture: true } as any)
    })

    // Persist
    watch([timers, stopwatches], () => {
        saveAll()
    }, { deep: true })
</script>

<style scoped>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

    /* === (deine Styles unverändert) === */

    .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: 'Inter', sans-serif;
        background: transparent; /* Body-Gradient durchlassen */
        transition: all 0.3s ease;
    }

    /* REPLACE in App.vue <style scoped> – Block html.dark-mode .app-container */
    html.dark-mode .app-container {
        background: transparent; /* auch im Dark Mode kein Flat-Background */
    }

    /* REPLACE in App.vue <style scoped> – Block .main-content */
    .main-content {
        flex: 1;
        padding: 60px 1rem 2rem; /* Platz für Navbar + etwas Rand */
        background: transparent; /* Body-Gradient überall sichtbar */
    }

    .burger-menu {
        display: none; /* wird nur im Mobile-Viewport sichtbar */
        width: 32px;
        height: var(--nav-h);
        background: none;
        border: none;
        cursor: pointer;
        position: relative;
        z-index: 1100;
        margin-left: auto;
        padding: 0;
        align-items: center;
        justify-content: center;
    }

        .burger-menu span {
            position: relative;
            display: block;
            width: 18px;
            height: 2px;
            background: rgba(248, 250, 252, 0.92);
            border-radius: 999px;
            transition: transform 0.25s ease, opacity 0.2s ease, top 0.25s ease, bottom 0.25s ease;
        }

            .burger-menu span:not(:last-child) {
                margin-bottom: 4px;
            }

    html.dark-mode .burger-menu span {
        background: rgba(248, 250, 252, 0.96);
    }

    /* Minimalistische X-Animation */
    .burger-menu.open span:nth-child(1) {
        transform: translateY(3px) rotate(45deg);
    }

    .burger-menu.open span:nth-child(2) {
        opacity: 0;
    }

    .burger-menu.open span:nth-child(3) {
        transform: translateY(-3px) rotate(-45deg);
    }

    /* REPLACE in App.vue <style scoped> – Block html.dark-mode .main-content */
    html.dark-mode .main-content {
        background: transparent;
    }

    .main-nav {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        padding: 0.5rem 0 !important;
        z-index: 1000;
        box-shadow: var(--shadow);
        border-bottom: 2px solid var(--border-color);
        height: var(--nav-h);
        line-height: var(--nav-h);
    }

    .footer-link {
        margin: 0 0.75rem;
    }

    .main-nav::after {
        content: "";
        position: fixed;
        top: 0;
        right: 0;
        width: var(--sbw);
        height: var(--nav-h);
        background: inherit;
        pointer-events: none;
        z-index: 1000;
    }

    html.dark-mode .main-nav {
        background: radial-gradient(circle at top left, color-mix(in srgb, #4C1D95 40%, #020617 60%), #020617 60%) fixed;
        border-bottom: 1px solid rgba(148, 163, 184, 0.45);
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(14px);
    }

        /* REPLACE: html.dark-mode .main-nav:hover */
        html.dark-mode .main-nav:hover {
            background: radial-gradient(circle at top left, color-mix(in srgb, #5B21B6 50%, #020617 50%), #020617 65%) fixed;
        }
    .nav-content {
        max-width: var(--nav-max);
        margin: 0 auto;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        position: relative;
    }

    .logo {
        height: 56px;
        object-fit: contain;
    }

    .nav-links {
        display: flex;
        gap: 1rem;
        list-style: none;
        margin: 0;
        margin-left: auto;
    }

    .nav-link {
        position: relative;
        color: #fff;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        padding: 0.4rem 0.6rem;
        transition: text-decoration 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .nav-overlay {
        position: fixed;
        top: var(--nav-h);
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,.15);
        z-index: 950;
    }

    html.dark-mode .nav-link {
        color: #fff;
    }

    .nav-link i {
        font-size: 1rem;
    }

    /* Popup usw. – unverändert (deine Styles bleiben) */


    .nav-link::after {
        content: '';
        position: absolute;
        left: 50%;
        bottom: -4px;
        width: 0;
        height: 2px;
        background: #fff;
        transition: width 0.3s ease, left 0.3s ease;
    }

    html.dark-mode .nav-link::after {
        background: #fff;
    }

    .nav-link:hover::after, .nav-link.router-link-exact-active::after {
        width: 100%;
        left: 0;
    }

    @media (max-width: 1024px) {
        /* Kompaktes Dropdown unter der Navbar, rechts beim Burger */
        .nav-links {
            position: absolute;
            top: 100%;
            right: 8px;
            left: auto;
            background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.7);
            margin: 0;
            padding: 0.5rem 0.4rem;
            display: none; /* geschlossen */
            flex-direction: column;
            align-items: stretch;
            gap: 0.1rem;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transform: translateY(6px);
            transition: opacity 0.18s ease, transform 0.18s ease, visibility 0s 0.18s;
            z-index: 999;
        }

        html.dark-mode .nav-links {
            background: radial-gradient(circle at top left, color-mix(in srgb, #020617 85%, #4C1D95 15%), #020617 80%);
        }

        .nav-links.open {
            display: flex; /* offen */
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateY(0);
        }

        .nav-link {
            padding: 0.55rem 0.6rem;
            width: 100%;
            text-align: left;
            color: var(--text-primary);
            justify-content: flex-start;
        }

        html.dark-mode .nav-link {
            color: #f9fafb;
        }

        .nav-link::after {
            background: var(--accent-primary);
        }

        html.dark-mode .nav-link::after {
            background: #a855f7;
        }

        .burger-menu {
            display: block;
            margin-right: 12px;
        }
    }



    .app-footer {
        margin-top: auto;
        padding: 1.5rem 1rem 2rem;
        border-top: 1px solid var(--border-color);
        font-size: 0.8rem;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.85;
    }

    .app-footer-content {
        max-width: 1200px;
        width: 100%;
        display: flex;
        justify-content: center;
        flex-wrap: wrap; /* 💡 erlaubt Zeilenumbruch */
        gap: 0.5rem 1rem; /* Abstand zwischen Links (vertikal/horizontal) */
    }

    .footer-link {
        text-decoration: underline;
        cursor: pointer;
        color: var(--text-primary);
        margin: 0 0.25rem;
        white-space: nowrap; /* Jeder Link bleibt in sich einzeilig */
    }

    html.dark-mode .footer-link {
        color: #ffffff;
    }

    @media (max-width: 640px) {
        .app-footer {
            padding: 1.25rem 0.75rem 1.75rem;
            font-size: 0.75rem;
        }

        .app-footer-content {
            gap: 0.35rem 0.75rem; /* etwas enger auf kleineren Screens */
        }
    }

</style>
