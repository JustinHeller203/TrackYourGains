<!-- App.vue -->

<template>
    <div class="app-container">
        <!-- ✅ Navbar -->
        <nav v-if="!isPhonePreview" class="main-nav" ref="navRef">
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
                    <li><router-link to="/beschwerden" class="nav-link" @click="closeMenu"><i class="fas fa-notes-medical"></i> Beschwerden</router-link></li>
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
        <div v-if="!isPhonePreview && menuOpen" class="nav-overlay" @click="closeMenu"></div>
        <div v-if="!isPhonePreview && isGlobalLoading" class="global-loading-overlay" role="status" aria-live="polite" aria-busy="true">
            <div class="global-loading-card">
                <span class="global-loading-spinner" aria-hidden="true"></span>
                <span>Lädt gerade Daten...</span>
            </div>
        </div>

        <div v-if="!isPhonePreview" ref="stickyFlightOverlayRef" class="sticky-flight-overlay" aria-hidden="true"></div>

        <div v-if="!isPhonePreview" ref="timerStackRef" class="sticky-cluster sticky-cluster--timer">
            <button v-if="visibleStickyTimers.length > 1"
                    type="button"
                    class="sticky-stack-toggle"
                    :class="{ 'is-expanded': expandedStickyGroup === 'timer' }"
                    :style="timerStackToggleStyle"
                    @click.stop="toggleStickyGroup('timer')">
                {{ expandedStickyGroup === 'timer' ? '⋯' : `${visibleStickyTimers.length - 1}+` }}
            </button>

            <StickyTimerCard v-for="entry in visibleStickyTimers"
                             :key="'timer-' + entry.timer.id"
                             :timer="entry.timer"
                             :sticky-enabled="stickyTimersEnabled"
                             :format-timer="formatTimer"
                             :start-timer="startTimer"
                             :stop-timer="stopTimer"
                             :reset-timer="resetTimer"
                             :start-drag="startDrag"
                             :focus-in-training="focusInTraining"
                             :stack-index="entry.stackIndex"
                             :stack-count="entry.stackCount"
                             :stack-expanded="entry.stackExpanded"
                             :stack-bump-nonce="entry.stackBumpNonce"
                             :dock-nonce="entry.dock.nonce"
                             :dock-from-x="entry.dock.fromX"
                             :dock-from-y="entry.dock.fromY"
                             @apply-style-all="onApplyStyleAll" />
        </div>

        <div v-if="!isPhonePreview" ref="stopwatchStackRef" class="sticky-cluster sticky-cluster--stopwatch">
            <button v-if="visibleStickyStopwatches.length > 1"
                    type="button"
                    class="sticky-stack-toggle sticky-stack-toggle--stopwatch"
                    :class="{ 'is-expanded': expandedStickyGroup === 'stopwatch' }"
                    :style="stopwatchStackToggleStyle"
                    @click.stop="toggleStickyGroup('stopwatch')">
                {{ expandedStickyGroup === 'stopwatch' ? '⋯' : `${visibleStickyStopwatches.length - 1}+` }}
            </button>

            <StickyStopwatchCard v-for="entry in visibleStickyStopwatches"
                                 :key="'sw-' + entry.stopwatch.id"
                                 :stopwatch="entry.stopwatch"
                                 :sticky-enabled="stickyStopwatchesEnabled"
                                 :format-stopwatch="formatStopwatch"
                                 :toggle-stopwatch="toggleStopwatch"
                                 :reset-stopwatch="resetStopwatch"
                                 :add-lap="addLap"
                                 :start-drag="startDrag"
                                 :focus-in-training="focusInTraining"
                                 :stack-index="entry.stackIndex"
                                 :stack-count="entry.stackCount"
                                 :stack-expanded="entry.stackExpanded"
                                 :stack-bump-nonce="entry.stackBumpNonce"
                                 :dock-nonce="entry.dock.nonce"
                                 :dock-from-x="entry.dock.fromX"
                                 :dock-from-y="entry.dock.fromY"
                                 @apply-style-all="onApplyStyleAll" />
        </div>

        <!-- ✅ Validation-Popup -->
        <ValidationPopup v-if="!isPhonePreview" :show="showValidationPopup"
                         :errors="validationErrorMessages"
                         @close="closeValidationPopup" />

        <!-- ✅ Neuigkeiten-Popup -->
        <GlobalNewsPopup v-if="!isPhonePreview" :show="showNewsPopup"
                         title="Was ist neu?"
                         :items="newsItems"
                         @close="onNewsClose" />
        <GlobalGuestConversionPopup v-if="!isPhonePreview"
                                    :show="showGuestConversionPopup"
                                    @close="dismissGuestConversionPopup"
                                    @later="dismissGuestConversionPopup"
                                    @register="goToGuestRegister" />
        <GlobalAchievementPopup v-if="!isPhonePreview" :show="showAchievementPopup"
                                :badge="latestAchievement"
                                @close="closeAchievementPopup" />

        <!-- ✅ Seiten-Inhalt -->
        <main class="main-content" :class="{ 'main-content--preview': isPhonePreview }">
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
        <GlobalExplainGuide v-if="!isPhonePreview" :version="NEWS_VERSION" :block="showNewsPopup" />

        <AppFooter v-if="!isPhonePreview" />

        <BackToTopButton v-if="!isPhonePreview" />
    </div>
</template>

<script setup lang="ts">
    import { computed, ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/authStore'
    import { useTimersStore } from '@/store/timersStore'
    import { useStopwatchesStore } from '@/store/stopwatchesStore'
    import StickyTimerCard from '@/components/ui/global/StickyTimerCard.vue'
    import StickyStopwatchCard from '@/components/ui/global/StickyStopwatchCard.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import GlobalNewsPopup from '@/components/ui/popups/global/GlobalNewsPopup.vue'
    import GlobalGuestConversionPopup from '@/components/ui/popups/global/GlobalGuestConversionPopup.vue'
    import GlobalExplainGuide from '@/components/ui/popups/global/GlobalExplainGuide.vue'
    import GlobalAchievementPopup from '@/components/ui/popups/global/GlobalAchievementPopup.vue'
    import { useGlobalAchievements } from '@/composables/useGlobalAchievements'
    import { isGlobalLoading } from '@/lib/api'

    import AppFooter from '@/AppFooter.vue'
    import BackToTopButton from '@/components/ui/buttons/BackToTopButton.vue'
    import {
        LS_TRAINING_TIMERS_V1,
        LS_TRAINING_STOPWATCHES_V1,
        LS_NEWS_SEEN_VERSION,
        LS_TRAINING_FOCUS_TYPE,
        LS_TRAINING_FOCUS_ID,
        LS_STICKY_TIMER_ENABLED,
        LS_STICKY_STOPWATCH_ENABLED,
    } from '@/constants/storageKeys'
    const auth = useAuthStore()
    const timersStore = useTimersStore()
    const stopwatchesStore = useStopwatchesStore()

    async function logoutAndClose() {
        await auth.signOut()
        closeMenu()
    }

    import type { TimerInstance as BaseTimer, StopwatchInstance as BaseStopwatch } from '@/types/training'


    type StickyStyle = {
        bgColor?: string | null
        btnColor?: string | null
        timeColor?: string | null
        shape?: 'square' | 'rounded' | 'oval' | null
        width?: number
        height?: number
        left?: number
        top?: number
        zIndex?: number
    }

    type AppTimer = BaseTimer & StickyStyle & {
        // legacy/runtime
        endAt?: number | null

        // runtime-only (niemals persistieren)
        interval?: number | null

        _w?: number
        _h?: number
        offsetX?: number
        offsetY?: number
    }

    type AppStopwatch = BaseStopwatch & StickyStyle & {
        // runtime helpers (nur App.vue)
        _w?: number
        _h?: number
        offsetX?: number
        offsetY?: number
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
    const timers = ref<AppTimer[]>([])
    const stopwatches = ref<AppStopwatch[]>([])

    const route = useRoute()
    const isPhonePreview = computed(() => route.query.preview === 'phone')
    const navRef = ref<HTMLElement | null>(null)
    const router = useRouter()
    const {
        showAchievementPopup,
        latestAchievement,
        closeAchievementPopup,
        refreshAchievements,
    } = useGlobalAchievements()

    const TIMER_KEY = LS_TRAINING_TIMERS_V1
    const STOPWATCH_KEY = LS_TRAINING_STOPWATCHES_V1
    const NEWS_SEEN_KEY = LS_NEWS_SEEN_VERSION
    const NEWS_VISIT_COUNT_KEY = 'tyg_news_visit_count'
    const GUEST_CONVERSION_CLICK_COUNT_KEY = 'tyg_guest_conversion_click_count'
    const GUEST_CONVERSION_LAST_SHOWN_AT_KEY = 'tyg_guest_conversion_last_shown_at'


    // === neue Refs & Konstanten oben zu den anderen Refs ===
    const dragEl = ref<HTMLElement | null>(null)
    const EDGE_PAD = 8  // Sicherheitsabstand zu den Rändern

    function focusInTraining(type: 'timer' | 'stopwatch', id: string) {
        localStorage.setItem(LS_TRAINING_FOCUS_TYPE, type)
        localStorage.setItem(LS_TRAINING_FOCUS_ID, id)

        if (router.currentRoute.value.path === '/training') {
            // Schon dort → fokussieren ohne Route neu zu laden
            window.dispatchEvent(new CustomEvent('training:focus', { detail: { type, id } }))
        } else {
            router.push('/training')
        }
    }

    const NEWS_VERSION = '2025-12-17' // <- ändere das bei jedem Release/Update

    const showNewsPopup = ref(false)
    const showGuestConversionPopup = ref(false)
    let guestConversionTimer: number | null = null
    let pendingGuestConversionTarget: HTMLElement | null = null
    let suppressGuestConversionClickOnce = false
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

    const syncPhonePreviewClass = (enabled: boolean) => {
        if (typeof document === 'undefined') return
        document.documentElement.classList.toggle('phone-preview', enabled)
        document.body.classList.toggle('phone-preview', enabled)
    }


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

    const guestConversionEligible = computed(() => {
        if (isPhonePreview.value) return false
        if (auth.loading || auth.isAuthenticated) return false
        if (route.path === '/login' || route.path === '/register') return false
        if (showNewsPopup.value) return false

        return true
    })

    function clearGuestConversionTimer() {
        if (guestConversionTimer != null) {
            window.clearTimeout(guestConversionTimer)
            guestConversionTimer = null
        }
    }

    function hideGuestConversionPopup() {
        showGuestConversionPopup.value = false
        clearGuestConversionTimer()
    }

    function clearPendingGuestConversionTarget() {
        pendingGuestConversionTarget = null
    }

    function replayPendingGuestConversionTarget() {
        const target = pendingGuestConversionTarget
        clearPendingGuestConversionTarget()
        if (!target) return
        if (!target.isConnected) return

        suppressGuestConversionClickOnce = true
        window.setTimeout(() => {
            try {
                target.click()
            } finally {
                window.setTimeout(() => {
                    suppressGuestConversionClickOnce = false
                }, 0)
            }
        }, 0)
    }

    function resetGuestConversionClickCount() {
        sessionStorage.setItem(GUEST_CONVERSION_CLICK_COUNT_KEY, '0')
    }

    function getGuestConversionLastShownAt() {
        const raw = Number(localStorage.getItem(GUEST_CONVERSION_LAST_SHOWN_AT_KEY) ?? '0')
        return Number.isFinite(raw) ? Math.max(0, raw) : 0
    }

    function setGuestConversionLastShownAt(ts: number) {
        localStorage.setItem(GUEST_CONVERSION_LAST_SHOWN_AT_KEY, String(ts))
    }

    function dismissGuestConversionPopup() {
        resetGuestConversionClickCount()
        hideGuestConversionPopup()
        replayPendingGuestConversionTarget()
    }

    function scheduleGuestConversionPopup() {
        clearGuestConversionTimer()
        if (!guestConversionEligible.value) return

        const rawClicks = Number(sessionStorage.getItem(GUEST_CONVERSION_CLICK_COUNT_KEY) ?? '0')
        const clicks = Number.isFinite(rawClicks) ? Math.max(0, Math.floor(rawClicks)) : 0
        if (clicks < 10) return

        const lastShownAt = getGuestConversionLastShownAt()
        if (Date.now() - lastShownAt < 60_000) return

        guestConversionTimer = window.setTimeout(() => {
            if (!guestConversionEligible.value) return

            setGuestConversionLastShownAt(Date.now())
            showGuestConversionPopup.value = true
        }, 4200)
    }

    function openGuestConversionPopupNow() {
        clearGuestConversionTimer()
        if (!guestConversionEligible.value) return

        const lastShownAt = getGuestConversionLastShownAt()
        if (Date.now() - lastShownAt < 60_000) return

        setGuestConversionLastShownAt(Date.now())
        showGuestConversionPopup.value = true
    }

    function goToGuestRegister() {
        clearPendingGuestConversionTarget()
        dismissGuestConversionPopup()
        router.push({ name: 'login', query: { mode: 'register', redirect: route.fullPath } })
    }

    function onGuestConversionClick(event: MouseEvent) {
        if (suppressGuestConversionClickOnce) return
        if (!guestConversionEligible.value) return
        if (showGuestConversionPopup.value) return
        if (showNewsPopup.value) return

        const target = event.target as HTMLElement | null
        if (!target) return

        const ignoredControl = target.closest('input, select, textarea, option')
        if (ignoredControl) return

        const rawClicks = Number(sessionStorage.getItem(GUEST_CONVERSION_CLICK_COUNT_KEY) ?? '0')
        const clicks = Number.isFinite(rawClicks) ? Math.max(0, Math.floor(rawClicks)) : 0
        const nextClicks = clicks + 1
        sessionStorage.setItem(GUEST_CONVERSION_CLICK_COUNT_KEY, String(nextClicks))

        if (nextClicks >= 10) {
            pendingGuestConversionTarget = target
            event.preventDefault()
            event.stopPropagation()
            event.stopImmediatePropagation()
            openGuestConversionPopupNow()
        }
    }


    let lastViewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
    let lastViewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0

    function clampObjToViewport(obj: any, elW?: number, elH?: number) {
        const w = elW ?? obj.width ?? obj._w ?? 200
        const h = elH ?? obj.height ?? obj._h ?? 80
        const navH = navRef.value?.offsetHeight ?? 0
        const minLeft = EDGE_PAD
        const maxLeft = Math.max(minLeft, window.innerWidth - w - EDGE_PAD)
        const minTop = navH + EDGE_PAD
        const maxTop = Math.max(minTop, window.innerHeight - h - EDGE_PAD)

        obj.left = Math.min(Math.max(obj.left ?? minLeft, minLeft), maxLeft)
        obj.top = Math.min(Math.max(obj.top ?? minTop, minTop), maxTop)
    }

    function syncStickyToViewport(obj: any, prevWidth: number, prevHeight: number) {
        const w = obj.width ?? obj._w ?? 200
        const h = obj.height ?? obj._h ?? 80
        const navH = navRef.value?.offsetHeight ?? 0
        const minLeft = EDGE_PAD
        const minTop = navH + EDGE_PAD
        const prevMaxLeft = Math.max(minLeft, prevWidth - w - EDGE_PAD)
        const prevMaxTop = Math.max(minTop, prevHeight - h - EDGE_PAD)
        const nextMaxLeft = Math.max(minLeft, window.innerWidth - w - EDGE_PAD)
        const nextMaxTop = Math.max(minTop, window.innerHeight - h - EDGE_PAD)
        const edgeSnap = 18

        const left = obj.left ?? minLeft
        const top = obj.top ?? minTop
        const wasRightAnchored = Math.abs(left - prevMaxLeft) <= edgeSnap
        const wasBottomAnchored = Math.abs(top - prevMaxTop) <= edgeSnap

        if (wasRightAnchored) obj.left = nextMaxLeft
        if (wasBottomAnchored) obj.top = nextMaxTop

        clampObjToViewport(obj, w, h)
    }

    function clampAllSticky(prevWidth = window.innerWidth, prevHeight = window.innerHeight) {
        stickyTimerSource.value
            .filter((t: AppTimer) => t.shouldStaySticky)
            .forEach((t: AppTimer) => syncStickyToViewport(t, prevWidth, prevHeight))

        stickyStopwatchSource.value
            .filter((s: AppStopwatch) => s.shouldStaySticky)
            .forEach((s: AppStopwatch) => syncStickyToViewport(s, prevWidth, prevHeight))
    }

    function handleViewportResize() {
        setSBW()
        const prevWidth = lastViewportWidth || window.innerWidth
        const prevHeight = lastViewportHeight || window.innerHeight
        clampAllSticky(prevWidth, prevHeight)
        lastViewportWidth = window.innerWidth
        lastViewportHeight = window.innerHeight
    }

    function saveAll() {
        const t = timers.value.map(({ interval: _interval, ...rest }: AppTimer) => rest)
        const s = stopwatches.value.map(({ interval: _interval, ...rest }: AppStopwatch) => rest)
        localStorage.setItem(TIMER_KEY, JSON.stringify(t))
        localStorage.setItem(STOPWATCH_KEY, JSON.stringify(s))
    }
    function readBool(key: string, fallback = true) {
        try {
            const v = localStorage.getItem(key)
            if (v == null) return fallback
            return v === 'true'
        } catch {
            return fallback
        }
    }

    const stickyTimersEnabled = ref(readBool(LS_STICKY_TIMER_ENABLED, true))
    const stickyStopwatchesEnabled = ref(readBool(LS_STICKY_STOPWATCH_ENABLED, true))
    const stickyStopwatchTick = ref(0)
    const expandedStickyGroup = ref<null | 'timer' | 'stopwatch'>(null)
    const timerStackRef = ref<HTMLElement | null>(null)
    const stopwatchStackRef = ref<HTMLElement | null>(null)
    const stickyFlightOverlayRef = ref<HTMLElement | null>(null)
    const stickyTimerDock = ref<Record<string, { nonce: number; fromX: number; fromY: number }>>({})
    const stickyStopwatchDock = ref<Record<string, { nonce: number; fromX: number; fromY: number }>>({})
    const stickyTimerStackBump = ref(0)
    const stickyStopwatchStackBump = ref(0)
    let stickyFlightCleanup: ReturnType<typeof setTimeout> | null = null

    const stickyTimerSource = computed<AppTimer[]>(() => {
        const storeItems = (timersStore.items ?? []) as AppTimer[]
        return storeItems.length ? storeItems : timers.value
    })

    function getStopwatchRuntime(sw: any) {
        const startedAtMs =
            typeof sw?.startedAtMs === 'number' ? sw.startedAtMs :
                (typeof sw?.startedAtUtc === 'string' ? Date.parse(sw.startedAtUtc) : null)

        const offsetMs =
            typeof sw?.offsetMs === 'number' ? sw.offsetMs :
                (typeof sw?.elapsedMs === 'number' ? sw.elapsedMs : 0)

        const isRunning = typeof startedAtMs === 'number' && Number.isFinite(startedAtMs) && startedAtMs > 0
        const elapsedMs = offsetMs + (isRunning ? (Date.now() - startedAtMs) : 0)

        return {
            startedAtMs,
            offsetMs,
            isRunning,
            elapsedMs: Math.max(0, elapsedMs),
        }
    }

    function syncTimerStoreStateFromLocal() {
        const localById = new Map((timers.value ?? []).map((t: any) => [t.id, t]))
        for (const storeTimer of (timersStore.items ?? []) as any[]) {
            const local = localById.get(storeTimer.id)
            if (!local) continue

            storeTimer.time = local.time
            storeTimer.isRunning = local.isRunning
            storeTimer.shouldStaySticky = local.shouldStaySticky
            storeTimer.endAt = local.endAt
            storeTimer.interval = local.interval ?? null
            storeTimer.left = local.left
            storeTimer.top = local.top
            storeTimer.width = local.width
            storeTimer.height = local.height
            storeTimer.zIndex = local.zIndex
            storeTimer.bgColor = local.bgColor
            storeTimer.btnColor = local.btnColor
            storeTimer.timeColor = local.timeColor
            storeTimer.shape = local.shape
            storeTimer.customSeconds = local.customSeconds
            storeTimer.seconds = local.seconds
        }
    }

    function syncStopwatchStoreStateFromLocal() {
        const localById = new Map((stopwatches.value ?? []).map((sw: any) => [sw.id, sw]))
        for (const storeStopwatch of (stopwatchesStore.items ?? []) as any[]) {
            const local = localById.get(storeStopwatch.id)
            if (!local) continue

            storeStopwatch.shouldStaySticky = local.shouldStaySticky
            storeStopwatch.isVisible = local.isVisible ?? storeStopwatch.isVisible
            storeStopwatch.left = local.left
            storeStopwatch.top = local.top
            storeStopwatch.width = local.width
            storeStopwatch.height = local.height
            storeStopwatch.zIndex = local.zIndex
            storeStopwatch.bgColor = local.bgColor
            storeStopwatch.btnColor = local.btnColor
            storeStopwatch.timeColor = local.timeColor
            storeStopwatch.shape = local.shape
        }
    }

    const stickyStopwatchSource = computed<AppStopwatch[]>(() => {
        void stickyStopwatchTick.value
        const storeItems = (stopwatchesStore.items ?? []) as unknown as AppStopwatch[]
        return storeItems.length ? storeItems : stopwatches.value
    })

    const visibleStickyTimers = computed(() => {
        const list = stickyTimersEnabled.value
            ? stickyTimerSource.value.filter((t: AppTimer) => t.shouldStaySticky)
            : []
        const expanded = expandedStickyGroup.value === 'timer'
        return list.map((timer, stackIndex) => ({
            timer,
            stackIndex,
            stackCount: list.length,
            stackExpanded: expanded,
            stackBumpNonce: stickyTimerStackBump.value,
            dock: stickyTimerDock.value[timer.id] ?? { nonce: 0, fromX: 0, fromY: 0 },
        }))
    })

    const visibleStickyStopwatches = computed(() => {
        const list = stickyStopwatchesEnabled.value
            ? stickyStopwatchSource.value.filter((sw: AppStopwatch) => sw.shouldStaySticky)
            : []
        const expanded = expandedStickyGroup.value === 'stopwatch'
        return list.map((stopwatch, stackIndex) => ({
            stopwatch,
            stackIndex,
            stackCount: list.length,
            stackExpanded: expanded,
            stackBumpNonce: stickyStopwatchStackBump.value,
            dock: stickyStopwatchDock.value[stopwatch.id] ?? { nonce: 0, fromX: 0, fromY: 0 },
        }))
    })

    const timerStackToggleStyle = computed(() => {
        const first = visibleStickyTimers.value[0]?.timer
        if (!first) return {}
        return {
            left: `${(first.left ?? 24) + 12}px`,
            top: `${(first.top ?? 24) - 16}px`,
            zIndex: String((first.zIndex ?? 2000) + 20),
        }
    })

    const stopwatchStackToggleStyle = computed(() => {
        const first = visibleStickyStopwatches.value[0]?.stopwatch
        if (!first) return {}
        return {
            left: `${(first.left ?? 24) + 12}px`,
            top: `${(first.top ?? 24) - 16}px`,
            zIndex: String((first.zIndex ?? 2000) + 20),
        }
    })

    function syncStickyStopwatchRuntime() {
        const storeItems = (stopwatchesStore.items ?? []) as any[]
        if (!storeItems.length) return

        for (const sw of storeItems) {
            const runtime = getStopwatchRuntime(sw)
            sw.startedAtMs = runtime.startedAtMs ?? undefined
            sw.offsetMs = runtime.offsetMs
            sw.isRunning = runtime.isRunning
            sw.time = runtime.elapsedMs / 1000
        }
    }


    function refreshStickyPrefs() {
        stickyTimersEnabled.value = readBool(LS_STICKY_TIMER_ENABLED, true)
        stickyStopwatchesEnabled.value = readBool(LS_STICKY_STOPWATCH_ENABLED, true)
    }

    function toggleStickyGroup(kind: 'timer' | 'stopwatch') {
        expandedStickyGroup.value = expandedStickyGroup.value === kind ? null : kind
    }

    function clearStickyFlightTimer() {
        if (stickyFlightCleanup) {
            clearTimeout(stickyFlightCleanup)
            stickyFlightCleanup = null
        }
        stickyFlightOverlayRef.value?.replaceChildren()
    }

    function getFlightTargetSelector(kind: 'timer' | 'stopwatch', id: string) {
        return kind === 'timer'
            ? `.sticky-timer-card[data-sticky-timer-id="${id}"]`
            : `.sticky-stopwatch-card[data-sticky-stopwatch-id="${id}"]`
    }

    function getFlightSourceSelector(kind: 'timer' | 'stopwatch', id: string) {
        return kind === 'timer'
            ? `.timer-card[data-timer-id="${id}"]`
            : `.timer-card[data-stopwatch-id="${id}"]`
    }

    function launchStickyFlight(
        kind: 'timer' | 'stopwatch',
        direction: 'dock' | 'return',
        item: AppTimer | AppStopwatch,
        sourceRect: DOMRect | null,
        targetRect: DOMRect | null,
        cloneSourceEl: HTMLElement | null,
    ) {
        if (!sourceRect || !targetRect || !cloneSourceEl || !stickyFlightOverlayRef.value) return
        const startX = sourceRect.left + sourceRect.width / 2
        const startY = sourceRect.top + sourceRect.height / 2
        const targetX = targetRect.left + targetRect.width / 2
        const targetY = targetRect.top + targetRect.height / 2
        const flightRect = direction === 'dock' ? targetRect : sourceRect
        const startScaleX = Math.max(0.56, Math.min(1.8, sourceRect.width / flightRect.width))
        const startScaleY = Math.max(0.56, Math.min(1.8, sourceRect.height / flightRect.height))
        const endScaleX = Math.max(0.56, Math.min(1.8, targetRect.width / flightRect.width))
        const endScaleY = Math.max(0.56, Math.min(1.8, targetRect.height / flightRect.height))
        clearStickyFlightTimer()
        const clone = cloneSourceEl.cloneNode(true) as HTMLElement
        clone.classList.add('sticky-flight-clone')
        clone.classList.add(`sticky-flight-clone--${direction}`)
        clone.style.position = 'fixed'
        clone.style.left = `${flightRect.left}px`
        clone.style.top = `${flightRect.top}px`
        clone.style.width = `${flightRect.width}px`
        clone.style.height = `${flightRect.height}px`
        clone.style.margin = '0'
        clone.style.zIndex = '2601'
        clone.style.pointerEvents = 'none'
        clone.style.transition = 'none'
        clone.querySelectorAll<HTMLElement>('*').forEach((el) => {
            el.style.pointerEvents = 'none'
        })
        stickyFlightOverlayRef.value.appendChild(clone)
        const animation = clone.animate(
            direction === 'dock'
                ? [
                    {
                        opacity: 0,
                        transform: `translate(${startX - targetX}px, ${startY - targetY}px) scale(${startScaleX}, ${startScaleY}) rotate(-4deg)`,
                        boxShadow: '0 10px 22px rgba(15, 23, 42, 0.12)',
                    },
                    {
                        opacity: 1,
                        transform: `translate(${(startX - targetX) * 0.16}px, ${(startY - targetY) * 0.16 - 18}px) scale(1.05) rotate(1deg)`,
                        boxShadow: '0 0 0 1px rgba(129, 140, 248, 0.34), 0 30px 72px rgba(59, 130, 246, 0.24)',
                        offset: 0.58,
                    },
                    {
                        opacity: 0,
                        transform: 'translate(0px, 0px) scale(1, 1) rotate(0deg)',
                        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
                    },
                ]
                : [
                    {
                        opacity: 1,
                        transform: 'translate(0px, 0px) scale(1, 1) rotate(0deg)',
                        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.2)',
                    },
                    {
                        opacity: 1,
                        transform: `translate(${(targetX - startX) * 0.34}px, ${(targetY - startY) * 0.34 + 10}px) scale(.96, .96) rotate(-1.5deg)`,
                        boxShadow: '0 22px 50px rgba(15, 23, 42, 0.16)',
                        offset: 0.38,
                    },
                    {
                        opacity: .92,
                        transform: `translate(${(targetX - startX) * 0.88}px, ${(targetY - startY) * 0.88 - 10}px) scale(${endScaleX * 1.03}, ${endScaleY * 1.03}) rotate(1deg)`,
                        boxShadow: '0 16px 34px rgba(15, 23, 42, 0.12)',
                        offset: 0.78,
                    },
                    {
                        opacity: 0,
                        transform: `translate(${targetX - startX}px, ${targetY - startY}px) scale(${endScaleX}, ${endScaleY}) rotate(0deg)`,
                        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
                    },
                ],
            {
                duration: 820,
                easing: 'cubic-bezier(.18, .9, .2, 1)',
                fill: 'forwards',
            },
        )
        stickyFlightCleanup = setTimeout(() => {
            animation.cancel()
            clone.remove()
            stickyFlightCleanup = null
        }, 840)
    }

    async function captureDockMotion(kind: 'timer' | 'stopwatch', item: AppTimer | AppStopwatch) {
        if (typeof window === 'undefined') return
        const sourceSelector = getFlightSourceSelector(kind, item.id)
        const source = document.querySelector(sourceSelector) as HTMLElement | null
        const rect = source?.getBoundingClientRect()
        await nextTick()
        const targetEl = document.querySelector(getFlightTargetSelector(kind, item.id)) as HTMLElement | null
        const targetRect = targetEl?.getBoundingClientRect()
        const targetX = targetRect
            ? targetRect.left + targetRect.width / 2
            : (item.left ?? 24) + ((item.width ?? rect?.width ?? 260) / 2)
        const targetY = targetRect
            ? targetRect.top + targetRect.height / 2
            : (item.top ?? 24) + ((item.height ?? rect?.height ?? 84) / 2)
        const fromX = rect ? (rect.left + rect.width / 2) - targetX : 36
        const fromY = rect ? (rect.top + rect.height / 2) - targetY : 84
        const bucket = kind === 'timer' ? stickyTimerDock.value : stickyStopwatchDock.value
        const prev = bucket[item.id]
        bucket[item.id] = {
            nonce: (prev?.nonce ?? 0) + 1,
            fromX,
            fromY,
        }
        launchStickyFlight(kind, 'dock', item, rect ?? null, targetRect ?? null, targetEl)
    }

    function captureReturnMotion(kind: 'timer' | 'stopwatch', item: AppTimer | AppStopwatch) {
        if (typeof window === 'undefined') return
        const sourceEl = document.querySelector(getFlightTargetSelector(kind, item.id)) as HTMLElement | null
        const targetEl = document.querySelector(getFlightSourceSelector(kind, item.id)) as HTMLElement | null
        launchStickyFlight(
            kind,
            'return',
            item,
            sourceEl?.getBoundingClientRect() ?? null,
            targetEl?.getBoundingClientRect() ?? null,
            sourceEl,
        )
    }

    function handleStickyOutsidePointer(ev: PointerEvent) {
        if (!expandedStickyGroup.value) return
        const target = ev.target as Node | null
        if (!target) return
        const timerRoot = timerStackRef.value
        const stopwatchRoot = stopwatchStackRef.value
        if (timerRoot?.contains(target) || stopwatchRoot?.contains(target)) return
        expandedStickyGroup.value = null
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
        const LEGACY_TIMERS_KEY = 'myAppTimers'
        const LEGACY_STOPWATCHES_KEY = 'myAppStopwatches'
        const oldTimers = localStorage.getItem(LEGACY_TIMERS_KEY)
        const oldStop = localStorage.getItem(LEGACY_STOPWATCHES_KEY)


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
        refreshStickyPrefs()
        void refreshAchievements()
        if (!guestConversionEligible.value) {
            hideGuestConversionPopup()
            return
        }

        if (!showGuestConversionPopup.value) {
            scheduleGuestConversionPopup()
        }
    })
    watch(guestConversionEligible, (eligible) => {
        if (!eligible) {
            hideGuestConversionPopup()
            return
        }

        scheduleGuestConversionPopup()
    })
    watch(
        () => timersStore.items,
        () => {
            syncTimerStoreStateFromLocal()
        },
        { deep: false }
    )
    watch(
        () => stopwatchesStore.items,
        () => {
            syncStopwatchStoreStateFromLocal()
        },
        { deep: false }
    )
    function handleDocClick(e: MouseEvent) {
        if (!menuOpen.value) return
        const target = e.target as Node
        if (navRef.value && !navRef.value.contains(target)) {
            closeMenu()
        }
    }

    function onStickyPrefsChanged() {
        refreshStickyPrefs()
    }

    function onWindowFocus() {
        void refreshAchievements(true)
    }

    onMounted(() => {
        refreshStickyPrefs()
        syncStickyStopwatchRuntime()
        const tickId = window.setInterval(() => {
            syncStickyStopwatchRuntime()
            stickyStopwatchTick.value++
        }, 100)
        ;(window as any).__tygStickyStopwatchTickId = tickId

        window.addEventListener('tyg:sticky-prefs-changed', onStickyPrefsChanged as any)
        window.addEventListener('storage', onStickyPrefsChanged) // falls anderer Tab
        window.addEventListener('focus', onWindowFocus)

        document.addEventListener('click', handleDocClick, true)
        document.addEventListener('click', onGuestConversionClick, true)
    })

    onBeforeUnmount(() => {
        const tickId = (window as any).__tygStickyStopwatchTickId
        if (typeof tickId === 'number') {
            window.clearInterval(tickId)
            delete (window as any).__tygStickyStopwatchTickId
        }
        window.removeEventListener('tyg:sticky-prefs-changed', onStickyPrefsChanged as any)
        window.removeEventListener('storage', onStickyPrefsChanged)
        window.removeEventListener('focus', onWindowFocus)
        document.removeEventListener('click', handleDocClick, true)
        document.removeEventListener('click', onGuestConversionClick, true)
        clearGuestConversionTimer()
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

    const addTimer = async (timer: AppTimer) => {
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

    const addStopwatch = async (stopwatch: AppStopwatch) => {
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
        const idx = timers.value.findIndex((t: AppTimer) => t.id === id)

        if (idx !== -1) {
            const t = timers.value[idx]
            t.shouldStaySticky = false
            t.isRunning = false
            if (t.interval) { clearInterval(t.interval); t.interval = null }
            timers.value = timers.value.filter((x: AppTimer) => x.id !== id)
            await nextTick()
            saveAll() // ⬅️ hinzufügen
        }
    }

    const removeStopwatch = async (id: string) => {
        const idx = stopwatches.value.findIndex((sw: AppStopwatch) => sw.id === id)

        if (idx !== -1) {
            const sw = stopwatches.value[idx]
            sw.shouldStaySticky = false
            sw.isRunning = false
            if (sw.interval) { clearInterval(sw.interval); sw.interval = null }
            stopwatches.value = stopwatches.value.filter((s: AppStopwatch) => s.id !== id)
            await nextTick()
            saveAll() // ⬅️ hinzufügen
        }
    }

    function startTimer(timer: AppTimer) {
        const running = stickyTimerSource.value.filter((t: AppTimer) => t.isRunning)

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

    function stopTimer(timer: AppTimer) {
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

    function resetTimer(timer: AppTimer) {
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

    function toggleStopwatch(sw: AppStopwatch) {

        const rawName = (sw.name ?? '').trim()
        if (!rawName) {
            sw.name = 'Stoppuhr'
        }

        const storeBase = stopwatchesStore.items.find((x: any) => x.id === sw.id) as any
        if (storeBase) {
            const running = stickyStopwatchSource.value.filter(s => s.isRunning)
            const runtime = getStopwatchRuntime(storeBase)

            if (!runtime.isRunning && running.length >= 3) {
                openValidationPopup(['Maximal 3 Stoppuhren dÃ¼rfen gleichzeitig laufen!'])
                return
            }

            if (runtime.isRunning) {
                storeBase.offsetMs = runtime.elapsedMs
                storeBase.elapsedMs = runtime.elapsedMs
                storeBase.startedAtMs = null
                storeBase.startedAtUtc = null
                storeBase.isRunning = false
            } else {
                storeBase.offsetMs = runtime.offsetMs
                storeBase.elapsedMs = runtime.offsetMs
                storeBase.startedAtMs = Date.now()
                storeBase.startedAtUtc = new Date().toISOString()
                storeBase.isRunning = true
                storeBase.shouldStaySticky = true
                if (storeBase.left == null) storeBase.left = 20
                if (storeBase.top == null) storeBase.top = 140
            }

            stopwatchesStore.items = [...(stopwatchesStore.items as any)]
            return
        }

        if (!sw.isRunning) {
            const running = stickyStopwatchSource.value.filter(s => s.isRunning)
            if (running.length >= 3) {
                openValidationPopup(['Maximal 3 Stoppuhren dürfen gleichzeitig laufen!'])
                return
            }

            sw.isRunning = true
            sw.startedAtMs = Date.now()
            sw.offsetMs = sw.offsetMs ?? (sw.time ? sw.time * 1000 : 0)
            sw.shouldStaySticky = true
            if (sw.left === undefined) sw.left = 20
            if (sw.top === undefined) sw.top = 140

            if (sw.interval) clearInterval(sw.interval)
            sw.interval = window.setInterval(() => {
                const elapsedMs = Date.now() - (sw.startedAtMs ?? Date.now())
                const totalMs = (sw.offsetMs ?? 0) + elapsedMs
                sw.time = totalMs / 1000
            }, 100)
            saveAll()
        } else {
            if (sw.interval) clearInterval(sw.interval)
            sw.interval = null
            const elapsedMs = Date.now() - (sw.startedAtMs ?? Date.now())
            sw.offsetMs = (sw.offsetMs ?? 0) + elapsedMs
            sw.time = (sw.offsetMs ?? 0) / 1000
            sw.startedAtMs = undefined
            saveAll()
        }
    }

    function resetStopwatch(sw: AppStopwatch) {
        const storeBase = stopwatchesStore.items.find((x: any) => x.id === sw.id) as any
        if (storeBase) {
            storeBase.isRunning = false
            storeBase.startedAtMs = null
            storeBase.startedAtUtc = null
            storeBase.offsetMs = 0
            storeBase.elapsedMs = 0
            storeBase.time = 0
            storeBase.laps = []
            storeBase.shouldStaySticky = false
            stopwatchesStore.items = [...(stopwatchesStore.items as any)]
            return
        }

        if (sw.interval) clearInterval(sw.interval)
        sw.interval = null
        sw.isRunning = false
        sw.startedAtMs = undefined
        sw.offsetMs = 0
        sw.time = 0
        sw.laps = []
        sw.shouldStaySticky = false
        saveAll()
    }

    const addLap = (sw: AppStopwatch) => {
        const storeBase = stopwatchesStore.items.find((x: any) => x.id === sw.id) as any
        if (storeBase) {
            storeBase.laps = Array.isArray(storeBase.laps) ? storeBase.laps : []

            const elapsedByLaps = storeBase.laps.reduce((sum: number, lap: any) => {
                if (typeof lap === 'number') return sum + lap
                if (typeof lap?.time === 'number') return sum + lap.time
                if (typeof lap?.ms === 'number') return sum + (lap.ms / 1000)
                if (typeof lap?.splitMs === 'number') return sum + (lap.splitMs / 1000)
                if (typeof lap?.atMs === 'number') return sum + (lap.atMs / 1000)
                return sum
            }, 0)

            const lapDuration = Math.max(0, (sw.time ?? 0) - elapsedByLaps)
            storeBase.laps.push({ time: lapDuration, name: '' })
            storeBase.laps = [...storeBase.laps]
            stopwatchesStore.items = [...(stopwatchesStore.items as any)]
            return
        }

        sw.laps = Array.isArray(sw.laps) ? sw.laps : []
        const elapsedByLaps = sw.laps.reduce((sum: number, lap: any) => {
            if (typeof lap === 'number') return sum + lap
            if (typeof lap?.time === 'number') return sum + lap.time
            if (typeof lap?.ms === 'number') return sum + (lap.ms / 1000)
            if (typeof lap?.splitMs === 'number') return sum + (lap.splitMs / 1000)
            if (typeof lap?.atMs === 'number') return sum + (lap.atMs / 1000)
            return sum
        }, 0)

        const lapDuration = Math.max(0, (sw.time ?? 0) - elapsedByLaps)
        sw.laps.push({ time: lapDuration, name: '' })
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
        handleViewportResize()
        window.addEventListener('resize', handleViewportResize)
        syncPhonePreviewClass(isPhonePreview.value)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('resize', handleViewportResize)
        syncPhonePreviewClass(false)
    })

    watch(isPhonePreview, (enabled) => {
        syncPhonePreviewClass(enabled)
    }, { immediate: true })

    watch(
        () => stickyTimerSource.value.filter((t: AppTimer) => t.shouldStaySticky).map((t: AppTimer) => t.id),
        (ids, prevIds = []) => {
            const prev = new Set(prevIds)
            const current = new Set(ids)
            const currentItems = stickyTimerSource.value.filter((t: AppTimer) => t.shouldStaySticky)
            for (const item of currentItems) {
                if (!prev.has(item.id)) captureDockMotion('timer', item)
            }
            for (const id of prevIds) {
                if (current.has(id)) continue
                const item = stickyTimerSource.value.find((t: AppTimer) => t.id === id)
                if (item) captureReturnMotion('timer', item)
            }
            if (ids.length > prevIds.length && ids.length > 1) stickyTimerStackBump.value += 1
        }
    )

    watch(
        () => stickyStopwatchSource.value.filter((sw: AppStopwatch) => sw.shouldStaySticky).map((sw: AppStopwatch) => sw.id),
        (ids, prevIds = []) => {
            const prev = new Set(prevIds)
            const current = new Set(ids)
            const currentItems = stickyStopwatchSource.value.filter((sw: AppStopwatch) => sw.shouldStaySticky)
            for (const item of currentItems) {
                if (!prev.has(item.id)) captureDockMotion('stopwatch', item)
            }
            for (const id of prevIds) {
                if (current.has(id)) continue
                const item = stickyStopwatchSource.value.find((sw: AppStopwatch) => sw.id === id)
                if (item) captureReturnMotion('stopwatch', item)
            }
            if (ids.length > prevIds.length && ids.length > 1) stickyStopwatchStackBump.value += 1
        }
    )


    // Load saved data
    onMounted(() => {
        loadAll()
        const rawVisits = Number(localStorage.getItem(NEWS_VISIT_COUNT_KEY) ?? '0')
        const visitCount = Number.isFinite(rawVisits) ? Math.max(0, Math.floor(rawVisits)) : 0
        const nextVisitCount = visitCount + 1
        localStorage.setItem(NEWS_VISIT_COUNT_KEY, String(nextVisitCount))

        const seen = localStorage.getItem(NEWS_SEEN_KEY)
        if (nextVisitCount > 1 && seen !== NEWS_VERSION) {
            showNewsPopup.value = true
        }

        scheduleGuestConversionPopup()

        // Timer rehydrieren
        stickyTimerSource.value.forEach(t => {
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

        saveAll()
        window.addEventListener('keydown', handleKeydown, { capture: true })
        window.addEventListener('pointerdown', handleStickyOutsidePointer, true)

    })


    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', onDrag)
        window.removeEventListener('mouseup', stopDrag)
        window.removeEventListener('keydown', handleKeydown, { capture: true } as any)
        window.removeEventListener('pointerdown', handleStickyOutsidePointer, true)
        clearStickyFlightTimer()
    })

</script>

<style scoped>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css');

    /* === (deine Styles unverändert) === */
    /* === BackToTop: feste Brand-Tokens (bleiben immer gleich) === */
    :global(:root) {
        --tyg-btt-accent-1: #6366f1; /* Indigo-ish */
        --tyg-btt-accent-2: #22c55e; /* Green-ish */
        --tyg-btt-card: color-mix(in srgb, var(--bg-card, #0b1220) 92%, #020617 8%);
    }

    /* Darkmode kann auch fixed bleiben (oder leicht angepasst) */
    :global(html.dark-mode) {
        --tyg-btt-accent-1: #6B8DD6; /* wie dein Landing dark CTA */
        --tyg-btt-accent-2: #4B6CB7;
        --tyg-btt-card: #020617;
    }

    .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        font-family: 'Inter', sans-serif;
        background: transparent; /* Body-Gradient durchlassen */
        transition: all 0.3s ease;
    }

    .sticky-cluster {
        position: relative;
        z-index: 2100;
    }

    .sticky-cluster > * {
        pointer-events: auto;
    }

    .sticky-stack-toggle {
        position: fixed;
        pointer-events: auto;
        min-width: 44px;
        height: 32px;
        padding: 0 .7rem;
        border-radius: 999px;
        border: 1px solid rgba(129, 140, 248, 0.32);
        background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(226,232,240,.88));
        color: #334155;
        font-size: .82rem;
        font-weight: 900;
        letter-spacing: .02em;
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform .22s cubic-bezier(.22, 1, .36, 1), box-shadow .22s ease, opacity .2s ease;
    }

    .sticky-stack-toggle:hover {
        transform: translateY(-2px) scale(1.04);
        box-shadow: 0 18px 42px rgba(15, 23, 42, 0.22);
    }

    .sticky-stack-toggle.is-expanded {
        transform: scale(1.06);
        box-shadow: 0 20px 44px rgba(59, 130, 246, 0.2);
    }

    html.dark-mode .sticky-stack-toggle {
        background: linear-gradient(180deg, rgba(15,23,42,.96), rgba(2,6,23,.92));
        color: #e2e8f0;
        border-color: rgba(129, 140, 248, 0.4);
        box-shadow: 0 18px 42px rgba(2, 6, 23, 0.42);
    }

    .sticky-flight-overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 2600;
    }

    .sticky-flight-card {
        position: fixed;
        left: 0;
        top: 0;
        width: var(--sticky-flight-w, 320px);
        height: var(--sticky-flight-h, 84px);
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto auto;
        align-items: center;
        gap: .7rem;
        padding: .82rem 1.08rem;
        border-radius: var(--sticky-flight-radius, 24px);
        border: 1px solid rgba(129, 140, 248, 0.32);
        background:
            linear-gradient(155deg, color-mix(in srgb, var(--sticky-flight-bg, rgba(255,255,255,.96)) 90%, #ffffff 10%), rgba(226,232,240,.9)),
            radial-gradient(circle at top left, rgba(99,102,241,.18), transparent 46%),
            radial-gradient(circle at bottom right, rgba(34,197,94,.14), transparent 52%);
        box-shadow:
            0 24px 60px rgba(15, 23, 42, 0.18),
            inset 0 1px 0 rgba(255,255,255,0.55);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        transform: translate(-50%, -50%);
        animation: sticky-flight-card-launch .82s cubic-bezier(.18, .9, .2, 1) forwards;
        will-change: transform, opacity;
        overflow: hidden;
        pointer-events: none;
    }

    .sticky-flight-card--return {
        animation-name: sticky-flight-card-return;
    }

    .sticky-flight-card__name {
        font-size: .88rem;
        font-weight: 800;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .sticky-flight-card__time {
        font-family: 'Roboto Mono', monospace;
        font-size: 1rem;
        font-weight: 900;
        color: var(--sticky-flight-time-color, #4f46e5);
        letter-spacing: .03em;
        white-space: nowrap;
    }

    .sticky-flight-card__action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 64px;
        height: 38px;
        padding: 0 .78rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--sticky-flight-btn-bg, rgba(255,255,255,.9)) 82%, #ffffff 18%);
        border: 1px solid rgba(148, 163, 184, 0.22);
        color: #334155;
        font-size: .82rem;
        font-weight: 800;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.55);
        white-space: nowrap;
    }

    .sticky-flight-card__action--primary {
        background: color-mix(in srgb, var(--sticky-flight-btn-bg, #cbd5e1) 92%, #ffffff 8%);
    }

    .sticky-flight-card__action--muted {
        opacity: .54;
    }

    .sticky-flight-card--stopwatch {
        background:
            linear-gradient(155deg, rgba(255,255,255,.96), rgba(226,232,240,.92)),
            radial-gradient(circle at top left, rgba(14,165,233,.16), transparent 44%),
            radial-gradient(circle at bottom right, rgba(59,130,246,.14), transparent 52%);
        border-color: rgba(14, 165, 233, 0.26);
    }

    .sticky-flight-card--stopwatch .sticky-flight-card__time {
        color: #0f766e;
    }

    html.dark-mode .sticky-flight-card {
        background:
            linear-gradient(155deg, rgba(15,23,42,.98), rgba(2,6,23,.94)),
            radial-gradient(circle at top left, rgba(99,102,241,.2), transparent 46%),
            radial-gradient(circle at bottom right, rgba(34,197,94,.16), transparent 52%);
        border-color: rgba(129, 140, 248, 0.4);
        box-shadow: 0 28px 70px rgba(2, 6, 23, 0.44);
    }

    html.dark-mode .sticky-flight-card__name {
        color: #e2e8f0;
    }

    html.dark-mode .sticky-flight-card__time {
        color: var(--sticky-flight-time-color, #a5b4fc);
    }

    html.dark-mode .sticky-flight-card__action {
        background: color-mix(in srgb, var(--sticky-flight-btn-bg, rgba(30,41,59,.92)) 86%, rgba(255,255,255,.08) 14%);
        border-color: rgba(129, 140, 248, 0.18);
        color: #e2e8f0;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
    }

    html.dark-mode .sticky-flight-card--stopwatch {
        background:
            linear-gradient(155deg, rgba(15,23,42,.98), rgba(2,6,23,.94)),
            radial-gradient(circle at top left, rgba(14,165,233,.18), transparent 44%),
            radial-gradient(circle at bottom right, rgba(59,130,246,.16), transparent 52%);
        border-color: rgba(56, 189, 248, 0.32);
    }

    html.dark-mode .sticky-flight-card--stopwatch .sticky-flight-card__time {
        color: #67e8f9;
    }

    @keyframes sticky-flight-card-launch {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(var(--sticky-flight-scale-x, .88), var(--sticky-flight-scale-y, .88)) rotate(-4deg);
            box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
        }

        18% {
            opacity: 1;
        }

        58% {
            transform: translate(calc(-50% + var(--sticky-flight-x) * .84), calc(-50% + var(--sticky-flight-y) * .84 - 18px)) scale(1.05) rotate(1deg);
            box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.34), 0 30px 72px rgba(59, 130, 246, 0.24);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--sticky-flight-x)), calc(-50% + var(--sticky-flight-y))) scale(1) rotate(0deg);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
        }
    }

    @keyframes sticky-flight-card-return {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
        }

        38% {
            opacity: 1;
            transform: translate(calc(-50% + var(--sticky-flight-x) * .34), calc(-50% + var(--sticky-flight-y) * .34 + 10px)) scale(.96) rotate(-1.5deg);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.16);
        }

        78% {
            opacity: .92;
            transform: translate(calc(-50% + var(--sticky-flight-x) * .88), calc(-50% + var(--sticky-flight-y) * .88 - 10px)) scale(calc(var(--sticky-flight-end-scale-x, .92) * 1.03), calc(var(--sticky-flight-end-scale-y, .92) * 1.03)) rotate(1deg);
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--sticky-flight-x)), calc(-50% + var(--sticky-flight-y))) scale(var(--sticky-flight-end-scale-x, .92), var(--sticky-flight-end-scale-y, .92)) rotate(0deg);
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }
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

    .main-content--preview {
        padding: 0;
        min-height: 100vh;
        overflow: hidden;
    }

    :global(html.phone-preview),
    :global(body.phone-preview) {
        overflow: hidden;
        background: var(--bg-primary, #0b1220);
    }

    :global(html.phone-preview .app-container) {
        min-height: 100vh;
    }

    :global(html.phone-preview .main-content) {
        padding: 0 !important;
        min-height: 100vh;
    }

    :global(html.phone-preview .training),
    :global(html.phone-preview .progress),
    :global(html.phone-preview .tutorials-page),
    :global(html.phone-preview .complaints-page) {
        width: 100%;
        max-width: none;
        min-width: 0;
        margin: 0;
        padding: 0.5rem 0.45rem 0.85rem;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(html.phone-preview .page-title) {
        margin: 0 0 0.45rem;
        font-size: 1.05rem !important;
        line-height: 1.12;
    }

    :global(html.phone-preview .page-subtext),
    :global(html.phone-preview .section-title),
    :global(html.phone-preview .section-kicker),
    :global(html.phone-preview .section-meta) {
        margin-bottom: 0.4rem;
    }

    :global(html.phone-preview .dashboard-grid),
    :global(html.phone-preview .dashboard-container),
    :global(html.phone-preview .progress-charts),
    :global(html.phone-preview .calculators-grid),
    :global(html.phone-preview .builder-grid),
    :global(html.phone-preview .field-grid),
    :global(html.phone-preview .form-grid),
    :global(html.phone-preview .filters-grid),
    :global(html.phone-preview .stack-layout),
    :global(html.phone-preview .tutorials-grid),
    :global(html.phone-preview .upload-grid),
    :global(html.phone-preview .command-grid) {
        width: 100%;
        max-width: none;
        min-width: 0;
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
    }

    :global(html.phone-preview .builder-left),
    :global(html.phone-preview .builder-right),
    :global(html.phone-preview .upload-col),
    :global(html.phone-preview .field),
    :global(html.phone-preview .dashboard-grid > *),
    :global(html.phone-preview .tutorials-grid > *),
    :global(html.phone-preview .progress-charts > *),
    :global(html.phone-preview .filters-grid > *),
    :global(html.phone-preview .form-grid > *),
    :global(html.phone-preview .field-grid > *) {
        min-width: 0;
        width: 100%;
    }

    :global(html.phone-preview .form-card),
    :global(html.phone-preview .preview-card),
    :global(html.phone-preview .timeline-card),
    :global(html.phone-preview .tutorial-card),
    :global(html.phone-preview .chart-card),
    :global(html.phone-preview .dashboard-card),
    :global(html.phone-preview .builder-section),
    :global(html.phone-preview .section-block),
    :global(html.phone-preview .list-item) {
        border-radius: 14px !important;
    }

    :global(html.phone-preview .builder-head),
    :global(html.phone-preview .mode-switch),
    :global(html.phone-preview .goal-row),
    :global(html.phone-preview .field-row),
    :global(html.phone-preview .field-row-stack),
    :global(html.phone-preview .toolbar-row),
    :global(html.phone-preview .meta-row),
    :global(html.phone-preview .card-actions),
    :global(html.phone-preview .form-actions),
    :global(html.phone-preview .entry-top),
    :global(html.phone-preview .entry-meta-line),
    :global(html.phone-preview .chip-row) {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.4rem !important;
    }

    :global(html.phone-preview .segmented),
    :global(html.phone-preview .seg-mode),
    :global(html.phone-preview .seg-type) {
        width: 100%;
        min-width: 0;
    }

    :global(html.phone-preview .segmented button) {
        min-width: 0;
        font-size: 0.72rem;
        padding-inline: 0.45rem;
    }

    :global(html.phone-preview .chart-canvas),
    :global(html.phone-preview canvas),
    :global(html.phone-preview .video-frame),
    :global(html.phone-preview iframe),
    :global(html.phone-preview video) {
        width: 100% !important;
        max-width: 100% !important;
    }

    :global(html.phone-preview .sim-scroll),
    :global(html.phone-preview .sim-wrap),
    :global(html.phone-preview .sim-main),
    :global(html.phone-preview .sim-actions),
    :global(html.phone-preview .sim-bottom),
    :global(html.phone-preview .sim-progress) {
        min-width: 0;
        width: 100%;
    }

    :global(html.phone-preview .sim-actions),
    :global(html.phone-preview .sim-bottom),
    :global(html.phone-preview .sim-progress-row),
    :global(html.phone-preview .sim-ex-meta),
    :global(html.phone-preview .sim-timer-btns),
    :global(html.phone-preview .sim-followup-actions),
    :global(html.phone-preview .sim-followup-status) {
        gap: 0.4rem !important;
    }

    :global(html.phone-preview .sim-actions),
    :global(html.phone-preview .sim-bottom),
    :global(html.phone-preview .sim-followup-actions) {
        grid-template-columns: 1fr !important;
        flex-direction: column !important;
    }

    :global(html.phone-preview .sim-progress-card),
    :global(html.phone-preview .sim-setbox),
    :global(html.phone-preview .sim-followup-card) {
        min-width: 0;
    }

    :global(html.phone-preview .popup-overlay.sim-rest-bp) {
        padding: 0.5rem !important;
        align-items: center !important;
    }

    :global(html.phone-preview .popup-overlay.sim-rest-bp .popup) {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 1rem !important;
        padding: 0.8rem 0.65rem !important;
    }

    :global(html.phone-preview .sim-rest-inner) {
        gap: 0.7rem !important;
        padding: 0 !important;
    }

    :global(html.phone-preview .sim-rest-title) {
        font-size: 0.95rem !important;
        line-height: 1.25 !important;
    }

    :global(html.phone-preview .sim-rest-sub) {
        margin: 0 !important;
        font-size: 0.76rem !important;
        line-height: 1.35 !important;
    }

    :global(html.phone-preview .sim-rest-time) {
        font-size: clamp(2rem, 9vw, 2.6rem) !important;
        line-height: 1 !important;
    }

    :global(html.phone-preview .sim-timer-btns) {
        grid-template-columns: 1fr !important;
        display: grid !important;
    }

    :global(html.phone-preview .sim-timer-btns .sim-rest-input),
    :global(html.phone-preview .sim-timer-btns .btn) {
        width: 100% !important;
        min-width: 0 !important;
    }

    :global(html.phone-preview .sim-rest-input) {
        min-height: 2.6rem !important;
        font-size: 0.86rem !important;
        padding-inline: 0.8rem !important;
    }

    :global(html.phone-preview .sim-rest-bp .sim-timer-btns),
    :global(html.phone-preview .sim-rest-bp .sim-rest-setup-actions) {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
    }

    :global(html.phone-preview .training .workout-list) {
        margin-top: 0;
        padding: 0 0.2rem;
        gap: 0.55rem;
    }

    :global(html.phone-preview .training .section-title) {
        font-size: 1rem !important;
        text-align: left;
        margin-bottom: 0.35rem;
    }

    :global(html.phone-preview .training .form-card.builder-grid) {
        gap: 0.6rem !important;
        padding: 0.7rem !important;
    }

    :global(html.phone-preview .training .builder-left) {
        gap: 0.65rem !important;
    }

    :global(html.phone-preview .training .builder-head) {
        display: grid !important;
        grid-template-columns: 1fr !important;
        grid-template-areas:
            "plan"
            "type"
            "extras" !important;
        gap: 0.55rem !important;
        align-items: stretch !important;
    }

    :global(html.phone-preview .training .builder-head .plan-block),
    :global(html.phone-preview .training .builder-head .type-block),
    :global(html.phone-preview .training .builder-head .extras-cta),
    :global(html.phone-preview .training .goal-row),
    :global(html.phone-preview .training .field-block),
    :global(html.phone-preview .training .actions-row.stack),
    :global(html.phone-preview .training .button-group),
    :global(html.phone-preview .training .btn-cell) {
        width: 100%;
        min-width: 0;
    }

    :global(html.phone-preview .training .builder-head .type-block.desktop-only) {
        display: none !important;
    }

    :global(html.phone-preview .training .builder-head .type-block.mobile-only) {
        display: block !important;
    }

    :global(html.phone-preview .training .builder-head .extras-cta) {
        justify-self: stretch !important;
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
    }

    :global(html.phone-preview .training .plan-name-input),
    :global(html.phone-preview .training .plan-name-input.slim),
    :global(html.phone-preview .training .goal-select),
    :global(html.phone-preview .training .filter-input),
    :global(html.phone-preview .training .seg-type-select) {
        width: 100% !important;
        min-width: 0 !important;
    }

    :global(html.phone-preview .training .field-label),
    :global(html.phone-preview .training .type-heading),
    :global(html.phone-preview .training .field > label) {
        font-size: 0.78rem !important;
    }

    :global(html.phone-preview .training .segmented.seg-mode),
    :global(html.phone-preview .training .segmented.seg-type) {
        gap: 0.25rem !important;
        padding: 0.2rem !important;
        border-radius: 10px !important;
    }

    :global(html.phone-preview .training .segmented.seg-mode > button),
    :global(html.phone-preview .training .segmented.seg-type > button) {
        padding: 0.42rem 0.35rem !important;
        font-size: 0.68rem !important;
        line-height: 1.15;
    }

    :global(html.phone-preview .training .field-grid) {
        grid-template-columns: 1fr !important;
        gap: 0.5rem !important;
    }

    :global(html.phone-preview .training .field-row),
    :global(html.phone-preview .training .field-row-stack) {
        gap: 0.45rem !important;
    }

    :global(html.phone-preview .training .button-group .btn-cell > .add-exercise-btn),
    :global(html.phone-preview .training .plan-submit-btn) {
        width: 100% !important;
    }

    :global(html.phone-preview .training .builder-right),
    :global(html.phone-preview .training .preview-card) {
        display: none !important;
    }

    :global(html.phone-preview .tutorials .tut-modal) {
        padding: 0.45rem !important;
        align-items: stretch !important;
    }

    :global(html.phone-preview .tutorials .tut-modal-card) {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 1rem !important;
        padding: 0.7rem !important;
        max-height: calc(100vh - 0.9rem) !important;
        overflow: auto !important;
    }

    :global(html.phone-preview .tutorials .tut-modal-card--preview-fullscreen) {
        width: 100% !important;
        min-height: calc(100vh - 0.9rem) !important;
        max-height: calc(100vh - 0.9rem) !important;
        border-radius: 1rem !important;
        padding: 0.55rem !important;
    }

    :global(html.phone-preview .tutorials .tut-modal-card--preview-fullscreen .tut-modal-head),
    :global(html.phone-preview .tutorials .tut-modal-card--preview-fullscreen .tut-modal-desc),
    :global(html.phone-preview .tutorials .tut-modal-card--preview-fullscreen .tut-modal-meta),
    :global(html.phone-preview .tutorials .tut-modal-card--preview-fullscreen .tut-modal-actions) {
        display: none !important;
    }

    :global(html.phone-preview .tutorials .tut-modal-card--preview-fullscreen .video-frame) {
        min-height: calc(100vh - 2.2rem) !important;
        height: calc(100vh - 2.2rem) !important;
        border-radius: 0.85rem !important;
        object-fit: cover !important;
    }

    :global(html.phone-preview .main-content * ) {
        max-width: 100%;
        box-sizing: border-box;
    }

    :global(html.phone-preview a),
    :global(html.phone-preview button),
    :global(html.phone-preview input),
    :global(html.phone-preview select),
    :global(html.phone-preview textarea),
    :global(html.phone-preview summary),
    :global(html.phone-preview label),
    :global(html.phone-preview [role="button"]),
    :global(html.phone-preview [tabindex]) {
        pointer-events: none !important;
        cursor: default !important;
    }

    :global(html.phone-preview video),
    :global(html.phone-preview iframe) {
        pointer-events: none !important;
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
        right: 0;
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

    .nav-link-button {
        background: transparent;
        border: none;
        padding: 0.4rem 0.6rem;
        cursor: pointer;
        font: inherit;
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

    .global-loading-overlay {
        position: fixed;
        inset: 0;
        z-index: 12000;
        background: rgba(2, 6, 23, 0.48);
        display: grid;
        place-items: center;
        padding: 1rem;
        backdrop-filter: blur(2px);
        pointer-events: none;
    }

    .global-loading-card {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.8rem 1rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        font-weight: 700;
        box-shadow: 0 16px 36px rgba(2, 6, 23, 0.45);
        pointer-events: none;
    }

    .global-loading-spinner {
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        border: 2px solid rgba(148, 163, 184, 0.35);
        border-top-color: var(--accent-primary);
        animation: global-loading-spin 0.7s linear infinite;
    }

    @keyframes global-loading-spin {
        to {
            transform: rotate(360deg);
        }
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
</style>



