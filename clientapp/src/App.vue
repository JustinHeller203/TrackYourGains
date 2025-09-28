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
        <div v-for="timer in timers.filter(t => t.shouldStaySticky)"
             :key="'timer-' + timer.id"
             class="sticky-timer-card"
             :style="{ left: timer.left + 'px', top: timer.top + 'px' }"
             @mousedown="startDrag($event, timer)">
            <span class="name-link"
                  @click="focusInTraining('timer', timer.id)"
                  @mousedown.stop>
                {{ timer.name || 'Timer' }}
            </span>            <span class="time">{{ formatTimer(timer.time) }}</span>
            <button @click="startTimer(timer)" :disabled="timer.isRunning">Start</button>
            <button @click="stopTimer(timer)" :disabled="!timer.isRunning">Stop</button>
            <button @click="resetTimer(timer)">Reset</button>
        </div>

        <!-- ✅ Sticky Stopwatch -->
        <div v-for="sw in stopwatches.filter(sw => sw.shouldStaySticky)"
             :key="'sw-' + sw.id"
             class="sticky-stopwatch-card"
             :style="{ left: sw.left + 'px', top: sw.top + 'px' }"
             @mousedown="startDrag($event, sw)">
            <span class="name-link"
                  @click="focusInTraining('stopwatch', sw.id)"
                  @mousedown.stop>
                {{ sw.name || 'Stoppuhr' }}
            </span>            <span class="time">{{ formatStopwatch(sw.time) }}</span>
            <button @click="toggleStopwatch(sw)">{{ sw.isRunning ? 'Pause' : 'Start' }}</button>
            <button @click="resetStopwatch(sw)">Reset</button>
            <button @click="addLap(sw)" :disabled="!sw.isRunning">Runde</button>
        </div>

        <!-- ✅ Validation-Popup -->
        <div v-if="showValidationPopup" class="popup-overlay" @mousedown="handleOverlayClick">
            <div class="popup edit-popup"
                 tabindex="0"
                 @keydown="handleValidationKeydown"
                 ref="validationPopup">
                <h3 class="popup-title">Eingabefehler</h3>
                <ul class="validation-error-list">
                    <li v-for="(error, index) in validationErrorMessages" :key="index">{{ error }}</li>
                </ul>
                <div class="popup-actions">
                    <button class="popup-btn save-btn" @click="closeValidationPopup" ref="validationOkButton">
                        OK
                    </button>
                </div>
            </div>
        </div>

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
    </div>
</template>


<script setup lang="ts">
    import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'

    const auth = useAuthStore()

    async function logoutAndClose() {
        await auth.signOut()
        closeMenu()
    }

    // Typ-Definitionen
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
        left?: number
        top?: number
        endAt?: number | null
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
        left?: number
        top?: number
        startedAt?: number | null
        offsetSec?: number
    }

    // Reaktive Zustände
    const validationOkButton = ref<HTMLButtonElement | null>(null)
    const validationErrorMessages = ref<string[]>([])
    const showValidationPopup = ref(false)
    const validationPopup = ref<HTMLDivElement | null>(null)
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

    function loadAll() {
        const oldTimers = localStorage.getItem('myAppTimers')
        const oldStop = localStorage.getItem('myAppStopwatches')
        try {
            const t = JSON.parse(localStorage.getItem(TIMER_KEY) || oldTimers || '[]')
            const s = JSON.parse(localStorage.getItem(STOPWATCH_KEY) || oldStop || '[]')
            timers.value = Array.isArray(t) ? t.map((x: any) => ({ ...x, interval: null })) : []
            stopwatches.value = Array.isArray(s) ? s.map((x: any) => ({ ...x, interval: null, laps: x.laps || [] })) : []
        } catch {
            timers.value = []
            stopwatches.value = []
        }
    }

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
        nextTick(() => validationPopup.value?.focus())
    }

    function handleValidationKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault()
            closeValidationPopup()
        }
    }

    function handleOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget) closeValidationPopup()
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

    // Timer / Stopwatch
    const addTimer = async (timer: TimerInstance) => {
        timers.value = [...timers.value, timer]
        await nextTick()
    }

    const addStopwatch = async (stopwatch: StopwatchInstance) => {
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

    function toggleStopwatch(sw: StopwatchInstance) {
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

    // Keydown
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            if (menuOpen.value) {
                event.preventDefault()
                closeMenu()
                return
            }
        }
        if (event.key === 'Escape' || event.key === 'Enter') {
            if (showValidationPopup.value) {
                event.preventDefault()
                closeValidationPopup()
            }
        }
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
        window.addEventListener('keydown', handleKeydown)
    })


    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', onDrag)
        window.removeEventListener('mouseup', stopDrag)
        window.removeEventListener('keydown', handleKeydown)
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
        background: var(--bg-primary);
        transition: all 0.3s ease;
    }

    html.dark-mode .app-container {
        background: #161b22;
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
        background: linear-gradient(135deg, #6B8DD6, #4B6CB7);
        border-bottom: 2px solid #30363d;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .main-nav:hover {
        background: linear-gradient(135deg, var(--accent-hover), var(--accent-secondary));
    }

    html.dark-mode .main-nav:hover {
        background: linear-gradient(135deg, #5a7bc4, #4B6CB7);
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

    .name-link {
        cursor: pointer;
        text-underline-offset: 2px;
        font-weight: 600;
    }

        .name-link:hover {
            text-decoration-thickness: 3px;
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
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }

    .popup {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
    }

    html.dark-mode .popup {
        background: #1c2526;
        color: #c9d1d9;
    }

    .popup-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .validation-error-text {
        margin-bottom: 1rem;
    }

    .validation-error-list {
        list-style: disc inside;
        margin-bottom: 1.5rem;
    }

    .popup-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    .popup-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
    }

    .save-btn {
        background: #10b981;
        color: #fff;
    }

        .save-btn:hover {
            background: #064e3b;
            transform: scale(1.05);
        }

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

    .burger-menu {
        display: none;
        width: 24px;
        height: 18px;
        background: none;
        border: none;
        cursor: pointer;
        position: relative;
        z-index: 1100;
        margin-left: auto;
        margin-right: 12px;
    }

        .burger-menu span {
            display: block;
            width: 100%;
            height: 2px;
            background: #fff;
            border-radius: 1px;
            transition: transform 0.4s ease, opacity 0.3s ease;
        }

    html.dark-mode .burger-menu span {
        background: #fff;
    }

    .burger-menu span:not(:last-child) {
        margin-bottom: 4px;
    }

    .burger-menu.open span:nth-child(1) {
        transform: translateY(8px) rotate(45deg);
    }

    .burger-menu.open span:nth-child(2) {
        opacity: 0;
    }

    .burger-menu.open span:nth-child(3) {
        transform: translateY(-8px) rotate(-45deg);
    }

    @media (max-width: 1024px) {
        .nav-links {
            position: absolute;
            top: calc(100% + var(--nav-dropdown-offset));
            left: 0;
            right: 0;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
            box-shadow: 0 12px 24px rgba(0,0,0,.12);
            margin: 0;
            padding: .75rem 0;
            display: flex;
            flex-direction: column;
            transform: translateY(8px);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: transform .25s ease, opacity .25s ease, visibility 0s .25s;
            z-index: 999;
        }

        html.dark-mode .nav-links {
            background: #1c2526;
        }

        .nav-links.open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        .nav-link {
            padding: .9rem 1rem;
            text-align: center;
            color: var(--text-primary);
        }

        html.dark-mode .nav-link {
            color: #fff;
        }

        .nav-link::after {
            background: var(--accent-primary);
        }

        html.dark-mode .nav-link::after {
            background: #6B8DD6;
        }

        .burger-menu {
            display: block;
            margin-right: 12px;
        }
    }

    /* === Seiten-Content === */
    .main-content {
        max-width: 1200px;
        margin: 60px auto 2rem;
        padding: 0 1rem;
        flex: 1;
        background: var(--bg-primary);
    }

    html.dark-mode .main-content {
        background: #161b22;
    }

    /* === Sticky Timer & Stoppuhr === */
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
        border: 1px solid var(--border-color); /* <— neu für Light-Mode */
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

        .sticky-timer-card button,
        .sticky-stopwatch-card button {
            background: var(--accent-primary);
            border: none;
            color: #fff;
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s ease;
        }

            .sticky-timer-card button:hover,
            .sticky-stopwatch-card button:hover {
                background: var(--accent-hover);
            }

            .sticky-timer-card button:disabled,
            .sticky-stopwatch-card button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

    html.dark-mode .sticky-timer-card,
    html.dark-mode .sticky-stopwatch-card {
        background: #0d1117;
        border: 1px solid #30363d;
    }

        html.dark-mode .sticky-timer-card button,
        html.dark-mode .sticky-stopwatch-card button {
            background: #4B6CB7;
        }

            html.dark-mode .sticky-timer-card button:hover,
            html.dark-mode .sticky-stopwatch-card button:hover {
                background: #5a7bc4;
            }
</style>
