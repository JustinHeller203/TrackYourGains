import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
// Reaktive Zustände
const validationOkButton = ref(null);
const validationErrorMessages = ref([]);
const showValidationPopup = ref(false);
const validationPopup = ref(null);
const menuOpen = ref(false);
const dragging = ref(false);
const dragTarget = ref(null);
const timers = ref([]); // Typisierte Deklaration
const stopwatches = ref([]); // Typisierte Deklaration
const route = useRoute();
const navRef = ref(null);
function closeMenu() {
    menuOpen.value = false;
}
watch(() => route.fullPath, () => {
    if (menuOpen.value)
        closeMenu();
});
function handleDocClick(e) {
    if (!menuOpen.value)
        return;
    const target = e.target;
    if (navRef.value && !navRef.value.contains(target)) {
        closeMenu();
    }
}
onMounted(() => {
    // ESC schließt Menü (du hast bereits handleKeydown – erweitere ihn unten)
    document.addEventListener('click', handleDocClick, true);
});
onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocClick, true);
});
// Validation-Popup-Funktionen
function openValidationPopup(errors) {
    validationErrorMessages.value = errors;
    showValidationPopup.value = true;
    nextTick(() => validationPopup.value?.focus());
}
function handleValidationKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        closeValidationPopup();
    }
}
function handleOverlayClick(e) {
    if (e.target === e.currentTarget)
        closeValidationPopup();
}
function closeValidationPopup() {
    showValidationPopup.value = false;
    validationErrorMessages.value = [];
}
// Navbar-Funktionen
const toggleMenu = () => {
    menuOpen.value = !menuOpen.value;
};
const handleLogoError = (e) => {
    const target = e.target;
    target.src = 'https://via.placeholder.com/56?text=Logo';
};
// Timer- und Stoppuhr-Funktionen
const addTimer = async (timer) => {
    console.log('addTimer aufgerufen mit:', timer);
    timers.value = [...timers.value, timer];
    console.log('Timers nach Hinzufügen:', timers.value);
    await nextTick(); // Warte auf DOM-Update
};
const addStopwatch = async (stopwatch) => {
    console.log('addStopwatch aufgerufen mit:', stopwatch);
    stopwatches.value = [...stopwatches.value, stopwatch];
    console.log('Stopwatches nach Hinzufügen:', stopwatches.value);
    await nextTick(); // Warte auf DOM-Update
};
const removeTimer = async (id) => {
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
const removeStopwatch = async (id) => {
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
const startTimer = (timer) => {
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
        if (timer.left === undefined)
            timer.left = 20;
        if (timer.top === undefined)
            timer.top = 80;
        timer.interval = setInterval(() => {
            if (timer.time > 0) {
                timer.time--;
            }
            else {
                clearInterval(timer.interval);
                timer.interval = null;
                timer.isRunning = false;
            }
        }, 1000);
    }
};
const stopTimer = (timer) => {
    console.log('stopTimer aufgerufen für:', timer.id);
    if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
    }
    timer.isRunning = false;
};
const resetTimer = (timer) => {
    console.log('resetTimer aufgerufen für:', timer.id);
    stopTimer(timer);
    timer.time = Number(timer.seconds) || Number(timer.customSeconds) || 60;
    timer.shouldStaySticky = false;
};
const toggleStopwatch = (sw) => {
    console.log('toggleStopwatch aufgerufen für:', sw.id);
    if (sw.isRunning) {
        clearInterval(sw.interval);
        sw.interval = null;
        sw.isRunning = false;
    }
    else {
        const runningSW = stopwatches.value.filter(s => s.isRunning);
        if (runningSW.length >= 3) {
            openValidationPopup(['Maximal 3 Stoppuhren dürfen gleichzeitig laufen!']);
            return;
        }
        sw.isRunning = true;
        sw.shouldStaySticky = true;
        if (sw.left === undefined)
            sw.left = 20;
        if (sw.top === undefined)
            sw.top = 140;
        const startTime = Date.now() - (sw.time * 1000);
        sw.interval = setInterval(() => {
            sw.time = (Date.now() - startTime) / 1000;
        }, 10);
    }
};
const resetStopwatch = (sw) => {
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
const addLap = (sw) => {
    console.log('addLap aufgerufen für:', sw.id);
    if (!sw.laps)
        sw.laps = [];
    sw.laps.push(sw.time);
};
// Drag-and-Drop-Funktionen
function startDrag(e, target) {
    e.preventDefault();
    dragging.value = true;
    dragTarget.value = target;
    target.offsetX = e.clientX - (target.left || 0);
    target.offsetY = e.clientY - (target.top || 0);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
}
function onDrag(e) {
    if (!dragging.value || !dragTarget.value)
        return;
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
const formatTimer = (time) => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};
const formatStopwatch = (time) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};
// Event-Handler für Tastatureingaben
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        if (menuOpen.value) {
            event.preventDefault();
            closeMenu();
            return;
        }
    }
    if (event.key === 'Escape' || event.key === 'Enter') {
        if (showValidationPopup.value) {
            event.preventDefault();
            closeValidationPopup();
        }
    }
};
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
            ? JSON.parse(savedTimers).map((t) => ({
                ...t,
                interval: null,
                isRunning: false,
                shouldStaySticky: Boolean(t.shouldStaySticky),
                left: t.left || undefined,
                top: t.top || undefined,
            }))
            : [];
        stopwatches.value = savedStopwatches
            ? JSON.parse(savedStopwatches).map((s) => ({
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
    }
    catch (e) {
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-links']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-links']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-links']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-mode']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "main-nav" },
    ref: "navRef",
});
/** @type {typeof __VLS_ctx.navRef} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-content" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/",
}));
const __VLS_2 = __VLS_1({
    to: "/",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    ...{ onError: (__VLS_ctx.handleLogoError) },
    src: "/Logo.png",
    alt: "Logo",
    ...{ class: "logo" },
});
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.toggleMenu) },
    ...{ class: "burger-menu" },
    ...{ class: ({ open: __VLS_ctx.menuOpen }) },
    'aria-label': "Menü",
    'aria-expanded': (__VLS_ctx.menuOpen.toString()),
    'aria-controls': "mobile-nav-links",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    id: "mobile-nav-links",
    ...{ class: "nav-links" },
    ...{ class: ({ open: __VLS_ctx.menuOpen }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
const __VLS_4 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    to: "/",
    ...{ class: "nav-link" },
}));
const __VLS_6 = __VLS_5({
    to: "/",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-home" },
});
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
const __VLS_8 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    to: "/training",
    ...{ class: "nav-link" },
}));
const __VLS_10 = __VLS_9({
    to: "/training",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-dumbbell" },
});
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
const __VLS_12 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    to: "/nutrition",
    ...{ class: "nav-link" },
}));
const __VLS_14 = __VLS_13({
    to: "/nutrition",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-utensils" },
});
var __VLS_15;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
const __VLS_16 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    to: "/progress",
    ...{ class: "nav-link" },
}));
const __VLS_18 = __VLS_17({
    to: "/progress",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-chart-line" },
});
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
const __VLS_20 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    to: "/tutorials",
    ...{ class: "nav-link" },
}));
const __VLS_22 = __VLS_21({
    to: "/tutorials",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-video" },
});
var __VLS_23;
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
const __VLS_24 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    to: "/settings",
    ...{ class: "nav-link" },
}));
const __VLS_26 = __VLS_25({
    to: "/settings",
    ...{ class: "nav-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
    ...{ class: "fas fa-cog" },
});
var __VLS_27;
if (__VLS_ctx.menuOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeMenu) },
        ...{ class: "nav-overlay" },
    });
}
for (const [timer] of __VLS_getVForSourceType((__VLS_ctx.timers.filter(t => t.shouldStaySticky)))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (...[$event]) => {
                __VLS_ctx.startDrag($event, timer);
            } },
        key: ('timer-' + timer.id),
        ...{ class: "sticky-timer-card" },
        ...{ style: ({ left: timer.left + 'px', top: timer.top + 'px' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (timer.name || 'Timer');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "time" },
    });
    (__VLS_ctx.formatTimer(timer.time));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.startTimer(timer);
            } },
        disabled: (timer.isRunning),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.stopTimer(timer);
            } },
        disabled: (!timer.isRunning),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.resetTimer(timer);
            } },
    });
}
for (const [sw] of __VLS_getVForSourceType((__VLS_ctx.stopwatches.filter(sw => sw.shouldStaySticky)))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (...[$event]) => {
                __VLS_ctx.startDrag($event, sw);
            } },
        key: ('sw-' + sw.id),
        ...{ class: "sticky-stopwatch-card" },
        ...{ style: ({ left: sw.left + 'px', top: sw.top + 'px' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (sw.name || 'Stoppuhr');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "time" },
    });
    (__VLS_ctx.formatStopwatch(sw.time));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.toggleStopwatch(sw);
            } },
    });
    (sw.isRunning ? 'Pause' : 'Start');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.resetStopwatch(sw);
            } },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.addLap(sw);
            } },
        disabled: (!sw.isRunning),
    });
}
if (__VLS_ctx.showValidationPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onMousedown: (__VLS_ctx.handleOverlayClick) },
        ...{ class: "popup-overlay" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onKeydown: (__VLS_ctx.handleValidationKeydown) },
        ...{ class: "popup edit-popup" },
        tabindex: "0",
        ref: "validationPopup",
    });
    /** @type {typeof __VLS_ctx.validationPopup} */ ;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "popup-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
        ...{ class: "validation-error-list" },
    });
    for (const [error, index] of __VLS_getVForSourceType((__VLS_ctx.validationErrorMessages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (index),
        });
        (error);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-actions" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeValidationPopup) },
        ...{ class: "popup-btn save-btn" },
        ref: "validationOkButton",
    });
    /** @type {typeof __VLS_ctx.validationOkButton} */ ;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "main-content" },
});
const __VLS_28 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onAddTimer': {} },
    ...{ 'onAddStopwatch': {} },
    ...{ 'onRemoveTimer': {} },
    ...{ 'onRemoveStopwatch': {} },
    key: (__VLS_ctx.timers.length + __VLS_ctx.stopwatches.length),
    timers: (__VLS_ctx.timers),
    stopwatches: (__VLS_ctx.stopwatches),
    startTimer: (__VLS_ctx.startTimer),
    stopTimer: (__VLS_ctx.stopTimer),
    resetTimer: (__VLS_ctx.resetTimer),
    toggleStopwatch: (__VLS_ctx.toggleStopwatch),
    resetStopwatch: (__VLS_ctx.resetStopwatch),
    removeTimer: (__VLS_ctx.removeTimer),
    removeStopwatch: (__VLS_ctx.removeStopwatch),
}));
const __VLS_30 = __VLS_29({
    ...{ 'onAddTimer': {} },
    ...{ 'onAddStopwatch': {} },
    ...{ 'onRemoveTimer': {} },
    ...{ 'onRemoveStopwatch': {} },
    key: (__VLS_ctx.timers.length + __VLS_ctx.stopwatches.length),
    timers: (__VLS_ctx.timers),
    stopwatches: (__VLS_ctx.stopwatches),
    startTimer: (__VLS_ctx.startTimer),
    stopTimer: (__VLS_ctx.stopTimer),
    resetTimer: (__VLS_ctx.resetTimer),
    toggleStopwatch: (__VLS_ctx.toggleStopwatch),
    resetStopwatch: (__VLS_ctx.resetStopwatch),
    removeTimer: (__VLS_ctx.removeTimer),
    removeStopwatch: (__VLS_ctx.removeStopwatch),
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onAddTimer: (__VLS_ctx.addTimer)
};
const __VLS_36 = {
    onAddStopwatch: (__VLS_ctx.addStopwatch)
};
const __VLS_37 = {
    onRemoveTimer: (__VLS_ctx.removeTimer)
};
const __VLS_38 = {
    onRemoveStopwatch: (__VLS_ctx.removeStopwatch)
};
var __VLS_31;
/** @type {__VLS_StyleScopedClasses['app-container']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-content']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['burger-menu']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-links']} */ ;
/** @type {__VLS_StyleScopedClasses['open']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-home']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-dumbbell']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-utensils']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-chart-line']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-video']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['fas']} */ ;
/** @type {__VLS_StyleScopedClasses['fa-cog']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-timer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['sticky-stopwatch-card']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-title']} */ ;
/** @type {__VLS_StyleScopedClasses['validation-error-list']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['save-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            validationOkButton: validationOkButton,
            validationErrorMessages: validationErrorMessages,
            showValidationPopup: showValidationPopup,
            validationPopup: validationPopup,
            menuOpen: menuOpen,
            timers: timers,
            stopwatches: stopwatches,
            navRef: navRef,
            closeMenu: closeMenu,
            handleValidationKeydown: handleValidationKeydown,
            handleOverlayClick: handleOverlayClick,
            closeValidationPopup: closeValidationPopup,
            toggleMenu: toggleMenu,
            handleLogoError: handleLogoError,
            addTimer: addTimer,
            addStopwatch: addStopwatch,
            removeTimer: removeTimer,
            removeStopwatch: removeStopwatch,
            startTimer: startTimer,
            stopTimer: stopTimer,
            resetTimer: resetTimer,
            toggleStopwatch: toggleStopwatch,
            resetStopwatch: resetStopwatch,
            addLap: addLap,
            startDrag: startDrag,
            formatTimer: formatTimer,
            formatStopwatch: formatStopwatch,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
