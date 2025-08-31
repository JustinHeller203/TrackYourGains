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
                        :aria-expanded="menuOpen.toString()"
                        aria-controls="mobile-nav-links">
                    <span></span><span></span><span></span>
                </button>

                <!-- Links -->
                <ul id="mobile-nav-links"
                    class="nav-links"
                    :class="{ open: menuOpen }">
                    <li><router-link to="/" class="nav-link"> <i class="fas fa-home"></i> Home</router-link></li>
                    <li><router-link to="/training" class="nav-link"> <i class="fas fa-dumbbell"></i> Training</router-link></li>
                    <li><router-link to="/nutrition" class="nav-link"> <i class="fas fa-utensils"></i> Ernährung</router-link></li>
                    <li><router-link to="/progress" class="nav-link"> <i class="fas fa-chart-line"></i> Fortschritt</router-link></li>
                    <li><router-link to="/tutorials" class="nav-link"> <i class="fas fa-video"></i> Tutorials</router-link></li>
                    <li><router-link to="/settings" class="nav-link"> <i class="fas fa-cog"></i> Einstellungen</router-link></li>
                </ul>
            </div>
        </nav>

        <!-- ✅ Overlay: klick außerhalb schließt Menü -->
        <div v-if="menuOpen" class="nav-overlay" @click="closeMenu"></div>

        <!-- ✅ Sticky Timer -->
        <div v-for="timer in timers.filter(t => t.shouldStaySticky)"
             :key="'timer-' + timer.id"
             class="sticky-timer-card"
             :style="{ left: timer.left + 'px', top: timer.top + 'px' }"
             @mousedown="startDrag($event, timer)">
            <span>{{ timer.name || 'Timer' }}</span>
            <span class="time">{{ formatTimer(timer.time) }}</span>
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
            <span>{{ sw.name || 'Stoppuhr' }}</span>
            <span class="time">{{ formatStopwatch(sw.time) }}</span>
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
                    <button class="popup-btn save-btn" @click="closeValidationPopup" ref="validationOkButton">OK</button>
                </div>
            </div>
        </div>

        <!-- ✅ Seiten-Inhalt -->
        <main class="main-content">
            <router-view :key="timers.length + stopwatches.length"
                         :timers="timers"
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
                         @remove-stopwatch="removeStopwatch" />
        </main>

    </div>
</template>



<script setup lang="ts">
    import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
    import { useRoute } from 'vue-router'

    // Typ-Definitionen für Timer und Stoppuhr
    interface TimerInstance {
        id: string;
        name: string;
        seconds: string;
        customSeconds: number | null;
        time: number;
        isRunning: boolean;
        interval: NodeJS.Timeout | null;
        isFavorite: boolean;
        sound: string;
        isVisible: boolean;
        shouldStaySticky: boolean;
        left?: number;
        top?: number;
    }

    interface StopwatchInstance {
        id: string;
        name: string;
        time: number;
        isRunning: boolean;
        interval: NodeJS.Timeout | null;
        laps: number[];
        isFavorite: boolean;
        isVisible: boolean;
        shouldStaySticky: boolean;
        left?: number;
        top?: number;
    }

    // Reaktive Zustände
    const validationOkButton = ref<HTMLButtonElement | null>(null);
    const validationErrorMessages = ref<string[]>([]);
    const showValidationPopup = ref(false);
    const validationPopup = ref<HTMLDivElement | null>(null);
    const menuOpen = ref(false);
    const dragging = ref(false);
    const dragTarget = ref<any>(null);
    const timers = ref<TimerInstance[]>([]); // Typisierte Deklaration
    const stopwatches = ref<StopwatchInstance[]>([]); // Typisierte Deklaration
    const route = useRoute()
    const navRef = ref<HTMLElement | null>(null)

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
        // ESC schließt Menü (du hast bereits handleKeydown – erweitere ihn unten)
        document.addEventListener('click', handleDocClick, true)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleDocClick, true)
    })
    // Validation-Popup-Funktionen
    function openValidationPopup(errors: string[]) {
        validationErrorMessages.value = errors;
        showValidationPopup.value = true;
        nextTick(() => validationPopup.value?.focus());
    }

    function handleValidationKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault();
            closeValidationPopup();
        }
    }

    function handleOverlayClick(e: MouseEvent) {
        if (e.target === e.currentTarget) closeValidationPopup();
    }

    function closeValidationPopup() {
        showValidationPopup.value = false;
        validationErrorMessages.value = [];
    }

    // Navbar-Funktionen
    const toggleMenu = () => {
        menuOpen.value = !menuOpen.value;
    };

    const handleLogoError = (e: Event) => {
        const target = e.target as HTMLImageElement;
        target.src = 'https://via.placeholder.com/56?text=Logo';
    };

    // Timer- und Stoppuhr-Funktionen
    const addTimer = async (timer: TimerInstance) => {
        console.log('addTimer aufgerufen mit:', timer);
        timers.value = [...timers.value, timer];
        console.log('Timers nach Hinzufügen:', timers.value);
        await nextTick(); // Warte auf DOM-Update
    };

    const addStopwatch = async (stopwatch: StopwatchInstance) => {
        console.log('addStopwatch aufgerufen mit:', stopwatch);
        stopwatches.value = [...stopwatches.value, stopwatch];
        console.log('Stopwatches nach Hinzufügen:', stopwatches.value);
        await nextTick(); // Warte auf DOM-Update
    };

    const removeTimer = async (id: string) => {
        console.log('removeTimer aufgerufen mit ID:', id);
        const timerIndex = timers.value.findIndex(t => t.id === id);
        if (timerIndex !== -1) {
            timers.value[timerIndex].shouldStaySticky = false;
            timers.value[timerIndex].isRunning = false;
            if (timers.value[timerIndex].interval) {
                clearInterval(timers.value[timerIndex].interval);
                timers.value[timerIndex].interval = null;
            }
            timers.value = timers.value.filter(t => t.id !== id);
            console.log('Timers nach Löschen:', timers.value);
            await nextTick(); // Warte auf DOM-Update
            const clean = timers.value.map(({ interval, ...t }) => t);
            localStorage.setItem('myAppTimers', JSON.stringify(clean));
        }
    };

    const removeStopwatch = async (id: string) => {
        console.log('removeStopwatch aufgerufen mit ID:', id);
        const stopwatchIndex = stopwatches.value.findIndex(sw => sw.id === id);
        if (stopwatchIndex !== -1) {
            stopwatches.value[stopwatchIndex].shouldStaySticky = false;
            stopwatches.value[stopwatchIndex].isRunning = false;
            if (stopwatches.value[stopwatchIndex].interval) {
                clearInterval(stopwatches.value[stopwatchIndex].interval);
                stopwatches.value[stopwatchIndex].interval = null;
            }
            stopwatches.value = stopwatches.value.filter(sw => sw.id !== id);
            console.log('Stopwatches nach Löschen:', stopwatches.value);
            await nextTick(); // Warte auf DOM-Update
            const clean = stopwatches.value.map(({ interval, ...s }) => s);
            localStorage.setItem('myAppStopwatches', JSON.stringify(clean));
        }
    };

    const startTimer = (timer: TimerInstance) => {
        console.log('startTimer aufgerufen für:', timer.id);
        const runningTimers = timers.value.filter(t => t.isRunning);
        if (runningTimers.length >= 3) {
            openValidationPopup(['Maximal 3 Timer dürfen gleichzeitig laufen!']);
            return;
        }
        if (!timer.isRunning) {
            timer.time = timer.time || Number(timer.seconds) || Number(timer.customSeconds) || 60;
            timer.isRunning = true;
            timer.shouldStaySticky = true;
            if (timer.left === undefined) timer.left = 20;
            if (timer.top === undefined) timer.top = 80;
            timer.interval = setInterval(() => {
                if (timer.time > 0) {
                    timer.time--;
                } else {
                    clearInterval(timer.interval);
                    timer.interval = null;
                    timer.isRunning = false;
                }
            }, 1000);
        }
    };

    const stopTimer = (timer: TimerInstance) => {
        console.log('stopTimer aufgerufen für:', timer.id);
        if (timer.interval) {
            clearInterval(timer.interval);
            timer.interval = null;
        }
        timer.isRunning = false;
    };

    const resetTimer = (timer: TimerInstance) => {
        console.log('resetTimer aufgerufen für:', timer.id);
        stopTimer(timer);
        timer.time = Number(timer.seconds) || Number(timer.customSeconds) || 60;
        timer.shouldStaySticky = false;
    };

    const toggleStopwatch = (sw: StopwatchInstance) => {
        console.log('toggleStopwatch aufgerufen für:', sw.id);
        if (sw.isRunning) {
            clearInterval(sw.interval);
            sw.interval = null;
            sw.isRunning = false;
        } else {
            const runningSW = stopwatches.value.filter(s => s.isRunning);
            if (runningSW.length >= 3) {
                openValidationPopup(['Maximal 3 Stoppuhren dürfen gleichzeitig laufen!']);
                return;
            }
            sw.isRunning = true;
            sw.shouldStaySticky = true;
            if (sw.left === undefined) sw.left = 20;
            if (sw.top === undefined) sw.top = 140;
            const startTime = Date.now() - (sw.time * 1000);
            sw.interval = setInterval(() => {
                sw.time = (Date.now() - startTime) / 1000;
            }, 10);
        }
    };

    const resetStopwatch = (sw: StopwatchInstance) => {
        console.log('resetStopwatch aufgerufen für:', sw.id);
        if (sw.interval) {
            clearInterval(sw.interval);
            sw.interval = null;
        }
        sw.isRunning = false;
        sw.time = 0;
        sw.laps = [];
        sw.shouldStaySticky = false;
    };

    const addLap = (sw: StopwatchInstance) => {
        console.log('addLap aufgerufen für:', sw.id);
        if (!sw.laps) sw.laps = [];
        sw.laps.push(sw.time);
    };

    // Drag-and-Drop-Funktionen
    function startDrag(e: MouseEvent, target: any) {
        e.preventDefault();
        dragging.value = true;
        dragTarget.value = target;
        target.offsetX = e.clientX - (target.left || 0);
        target.offsetY = e.clientY - (target.top || 0);
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
    }

    function onDrag(e: MouseEvent) {
        if (!dragging.value || !dragTarget.value) return;
        dragTarget.value.left = e.clientX - dragTarget.value.offsetX;
        dragTarget.value.top = e.clientY - dragTarget.value.offsetY;
    }

    function stopDrag() {
        dragging.value = false;
        dragTarget.value = null;
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);
    }

    // Formatierungsfunktionen
    const formatTimer = (time: number) => {
        const m = Math.floor(time / 60);
        const s = time % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatStopwatch = (time: number) => {
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    // Event-Handler für Tastatureingaben
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

    // === Scrollbarbreite messen und als CSS-Variable setzen ===
    const setSBW = () => {
        const sbw = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--sbw', `${sbw}px`);
    };

    onMounted(() => {
        setSBW();
        window.addEventListener('resize', setSBW);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('resize', setSBW);
    });


    // Lade gespeicherte Daten
    onMounted(() => {
        try {
            const savedTimers = localStorage.getItem('myAppTimers');
            const savedStopwatches = localStorage.getItem('myAppStopwatches');
            timers.value = savedTimers
                ? JSON.parse(savedTimers).map((t: any) => ({
                    ...t,
                    interval: null,
                    isRunning: false,
                    shouldStaySticky: Boolean(t.shouldStaySticky),
                    left: t.left || undefined,
                    top: t.top || undefined,
                }))
                : [];
            stopwatches.value = savedStopwatches
                ? JSON.parse(savedStopwatches).map((s: any) => ({
                    ...s,
                    interval: null,
                    isRunning: false,
                    shouldStaySticky: Boolean(s.shouldStaySticky),
                    left: s.left || undefined,
                    top: s.top || undefined,
                    laps: s.laps || [],
                }))
                : [];
            console.log('Geladene Timers:', timers.value);
            console.log('Geladene Stopwatches:', stopwatches.value);
        } catch (e) {
            console.warn('Fehler beim Laden:', e);
        }
        window.addEventListener('keydown', handleKeydown);
    });

    // Bereinige Event-Listener
    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('keydown', handleKeydown);
    });

    // Speichere Änderungen in localStorage
    watch(timers, (newVal) => {
        const clean = newVal.map(({ interval, ...t }) => t);
        localStorage.setItem('myAppTimers', JSON.stringify(clean));
    }, { deep: true });

    watch(stopwatches, (newVal) => {
        const clean = newVal.map(({ interval, ...s }) => s);
        localStorage.setItem('myAppStopwatches', JSON.stringify(clean));
    }, { deep: true });
</script>


<style scoped>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

    /* === Grundlayout === */
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
        width: 100vw; /* ⬅️ spannt über den visuellen Viewport inkl. Scrollbar */
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        padding: 0.5rem 0 !important;
        z-index: 1000;
        box-shadow: var(--shadow);
        border-bottom: 2px solid var(--border-color);
        height: var(--nav-h);
        line-height: var(--nav-h);
    }


        /* Füllt exakt die Scrollbar-Breite rechts mit dem gleichen Background */
        .main-nav::after {
            content: "";
            position: fixed;
            top: 0;
            right: 0;
            width: var(--sbw); /* kommt aus JS, 0–17px je nach OS */
            height: var(--nav-h);
            background: inherit; /* gleicher Gradient wie die Navbar */
            pointer-events: none;
            z-index: 1000; /* direkt unter der Nav, über dem Content */
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
        max-width: var(--nav-max); /* vorher: var(--page-max) */
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
        margin-left: auto; /* ⬅️ schiebt Links (Desktop) nach rechts */
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
        top: var(--nav-h); /* startet DIREKT unter der Navbar */
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,.15); /* leichtes Dimmen, gern anpassen/entfernen */
        z-index: 950; /* unter der Navbar (1000), über dem Content */
    }

    html.dark-mode .nav-link {
        color: #fff;
    }

    .nav-link i {
        font-size: 1rem;
    }
    /* Overlay: macht den dunklen Hintergrund */
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

    /* Popup-Box: zentriert & schön */
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

    /* Titel & Listen */
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

    .nav-link:hover::after,
    .nav-link.router-link-exact-active::after {
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
        margin-left: auto; /* sorgt für Rechts-Ausrichtung */
        margin-right: 12px; /* ⬅️ fügt einen kleinen Innenabstand ein */
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
            top: calc(100% + var(--nav-dropdown-offset)); /* ⬅️ weiter runter */
            left: 0;
            right: 0;
            background: var(--bg-card);
            border-top: 1px solid var(--border-color);
            box-shadow: 0 12px 24px rgba(0,0,0,.12);
            margin: 0;
            padding: .75rem 0;
            display: flex;
            flex-direction: column;
            /* Startzustand (versteckt) */
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
            display: block; /* ⬅️ Burger sichtbar */
            margin-right: 12px; /* dein Feintuning */
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

