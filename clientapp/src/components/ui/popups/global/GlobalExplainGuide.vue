<!--GlobalExplainGuide.vue-->
<template>
    <Transition name="guide-fade">
        <div v-if="show" class="guide-overlay" @click.self="close(false)">
            <div ref="spotEl" class="guide-spot" :class="{ pulse: show }" />
            <div ref="tipEl" class="guide-tip" role="dialog" aria-label="Hinweis: Rechner-Erklärung">
                <XButton class="guide-x"
                         aria-label="Guide schließen"
                         title="Schließen"
                         @click="close(step === 'calc')" />

                <div class="guide-tip-title">
                    {{ step === 'nav' ? 'Neu: Rechner erklärt ✅' : 'Hier ist das ℹ️ 👇' }}
                </div>

                <div class="guide-tip-text">
                    <template v-if="step === 'nav'">
                        Klick auf
                        <strong>ℹ️</strong> bei den Rechnern → du bekommst direkt ein Info-Popup, was der Rechner macht + Tipps.
                    </template>
                    <template v-else>
                        Klick auf
                        <strong>ℹ️</strong> – dann siehst du direkt, was der Rechner macht und wie du ihn nutzt.
                    </template>
                </div>

                <div class="guide-tip-actions">
                    <button v-if="step === 'nav'"
                            type="button"
                            class="guide-btn primary"
                            @click="goToProgress()">
                        Führ mich hin!
                    </button>

                    <button v-else
                            type="button"
                            class="guide-btn primary"
                            @click="close(true)">
                        Alles klar
                    </button>
                </div>

            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
    import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import XButton from '@/components/ui/buttons/popup/XButton.vue'
    import { LS_GUIDE_EXPLAIN_SEEN_VERSION } from '@/constants/storageKeys'

    const props = defineProps<{
        version: string
        block?: boolean // z.B. wenn News-Popup offen ist
    }>()
    const step = ref<'nav' | 'calc'>('nav')

    const router = useRouter()

    const LS_KEY = LS_GUIDE_EXPLAIN_SEEN_VERSION

    const show = ref(false)
    const spotEl = ref<HTMLElement | null>(null)
    const tipEl = ref<HTMLElement | null>(null)

    let targetEl: HTMLElement | null = null
    let retryTimer: number | null = null
    let resizeTimer: number | null = null
    let stopRouteWatch: (() => void) | null = null

    let infoPulseTimer: number | null = null

    function setInfoPulse(on: boolean) {
        // nur in Step 2 sinnvoll
        if (step.value !== 'calc') on = false

        document.documentElement.classList.toggle('tyg-guide-pulse-info', on)

        if (infoPulseTimer) {
            window.clearTimeout(infoPulseTimer)
            infoPulseTimer = null
        }

        // nur kurz highlighten (nicht nerven)
        if (on) {
            infoPulseTimer = window.setTimeout(() => {
                document.documentElement.classList.remove('tyg-guide-pulse-info')
                infoPulseTimer = null
            }, 2600)
        }
    }

    function goToProgress() {
        // NICHT als gesehen markieren – weil wir danach noch Step 2 zeigen
        close(false)

        // Flag, damit wir auf /progress den 2. Step triggern
        router.push({ path: '/progress', query: { tab: 'calculators', focus: '1' } })
    }

    function findGuideTarget(): HTMLElement | null {
        const burger = document.querySelector('.main-nav .burger-menu') as HTMLElement | null
        const burgerVisible = !!burger && window.getComputedStyle(burger).display !== 'none'

        if (burgerVisible) return burger

        // Desktop: Progress-Link in der Navbar (router-link rendert <a>)
        return document.querySelector('.main-nav .nav-links a[href="/progress"]') as HTMLElement | null
    }

    function findCalculatorInfoTarget(): HTMLElement | null {
        const grid = document.querySelector('.progress .calculators-grid') as HTMLElement | null
        if (!grid) return null

        // Nimm den Rechner, der im Layout wirklich "ganz oben" sitzt (top-left)
        const cards = Array.from(grid.querySelectorAll<HTMLElement>('.calculator-card'))
        if (!cards.length) return null

        let bestCard: HTMLElement | null = null
        let bestTop = Number.POSITIVE_INFINITY
        let bestLeft = Number.POSITIVE_INFINITY

        for (const card of cards) {
            const info = card.querySelector<HTMLElement>('.info-btn')
            if (!info) continue

            const r = card.getBoundingClientRect()

            // optional: Cards, die display:none sind, skippen
            if (r.width <= 0 || r.height <= 0) continue

            if (r.top < bestTop - 0.5 || (Math.abs(r.top - bestTop) <= 0.5 && r.left < bestLeft)) {
                bestTop = r.top
                bestLeft = r.left
                bestCard = card
            }
        }

        return bestCard?.querySelector<HTMLElement>('.info-btn') ?? null
    }

    function startSecondStepOnProgress() {
        step.value = 'calc'

        const tryFind = () => {
            const el = findCalculatorInfoTarget()
            if (el) {
                targetEl = el

                // bring den ℹ️ Button safe in view
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })

                window.setTimeout(() => {
                    openGuide()
                }, 80)

                // query aufräumen, damit’s nicht ständig retriggert (aber tab bleibt)
                const q = { ...router.currentRoute.value.query }
                delete (q as any).focus
                router.replace({ query: q })

                return
            }

            retryTimer = window.setTimeout(tryFind, 180)
        }

        tryFind()
    }



    function computeLayout() {
        if (!targetEl) return
        const spot = spotEl.value
        const tip = tipEl.value
        if (!spot || !tip) return

        const r = targetEl.getBoundingClientRect()

        /* ===== Spotlight ===== */
        const pad = 8
        spot.style.left = `${Math.max(8, r.left - pad)}px`
        spot.style.top = `${Math.max(8, r.top - pad)}px`
        spot.style.width = `${r.width + pad * 2}px`
        spot.style.height = `${r.height + pad * 2}px`

        /* ===== Tooltip ===== */
        const gap = 14
        const tipW = Math.min(320, window.innerWidth - 16)
        tip.style.width = `${tipW}px`

        // 🔥 WICHTIG: echte Höhe messen
        const tipH = tip.offsetHeight
        const navH = document.querySelector('.main-nav')?.clientHeight ?? 0

        // Default: rechts neben Target
        // Burger = Sonderfall (fixed oben rechts) -> Tooltip IMMER darunter, rechts ausgerichtet
        const isBurger = targetEl.classList.contains('burger-menu')

        // ✅ Nav-Targets (z.B. Fortschritt-Link): Tooltip IMMER darunter & zentriert
        const isInNav = !!targetEl.closest('.main-nav') && !isBurger

        let placement: 'right' | 'left' | 'bottom' | 'top' = (isBurger || isInNav) ? 'bottom' : 'right'
        let left = isBurger
            ? (r.right - tipW)
            : isInNav
                ? (r.left + r.width / 2) - (tipW / 2)
                : (r.right + gap)

        let top = (isBurger || isInNav) ? (r.bottom + gap) : r.top

        // nur für Nicht-Burger & Nicht-Nav dein normales Auto-Placement
        if (!isBurger && !isInNav) {
            // → wenn rechts kein Platz: links
            if (left + tipW > window.innerWidth - 8) {
                placement = 'left'
                left = r.left - gap - tipW
            }

            // → wenn links auch kein Platz: unter Target
            if (left < 8) {
                placement = 'bottom'
                left = (r.left + r.width / 2) - (tipW / 2)
                top = r.bottom + gap
            }
        }


        // clamp horizontal (für alle)
        left = Math.min(Math.max(8, left), window.innerWidth - tipW - 8)



        if (placement === 'bottom' && top + tipH > window.innerHeight - 8) {
            placement = 'top'
            top = r.top - gap - tipH
        }

        // 🔒 Finaler Viewport-Clamp (DAS war der Bug)
        top = Math.min(
            Math.max(navH + 8, top),
            window.innerHeight - tipH - 8
        )

        left = Math.min(
            Math.max(8, left),
            window.innerWidth - tipW - 8
        )

        tip.style.left = `${left}px`
        tip.style.top = `${top}px`

        // ===== Arrow: immer sauber auf Target zeigen =====
        const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

        // echte Maße nehmen (nachdem left/top gesetzt sind)
        const w = tip.offsetWidth
        const h = tip.offsetHeight

        // Target-Mitte
        const targetCx = r.left + r.width / 2
        const targetCy = r.top + r.height / 2

        // Side anhand echter Lage (Tooltip vs Target)
        const tipRect = { left, top, right: left + w, bottom: top + h }

        let side: 'left' | 'right' | 'top' | 'bottom'
        if (tipRect.top >= r.bottom) side = 'bottom'
        else if (tipRect.bottom <= r.top) side = 'top'
        else if (tipRect.left >= r.right) side = 'right'
        else if (tipRect.right <= r.left) side = 'left'
        else {
            // Fallback
            const tipCx = left + w / 2
            const tipCy = top + h / 2
            const dx = targetCx - tipCx
            const dy = targetCy - tipCy
            side = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : (dy > 0 ? 'bottom' : 'top')
        }

        tip.dataset.side = side

        // Pfeil-Feintuning
        const ARROW = 10
        const NUDGE_X = 0
        const NUDGE_Y = 0

        const arrowX = clamp((targetCx - left) + NUDGE_X, ARROW + 2, w - (ARROW + 2))
        const arrowY = clamp((targetCy - top) + NUDGE_Y, ARROW + 2, h - (ARROW + 2))


        tip.style.setProperty('--arrow-x', `${arrowX}px`)
        tip.style.setProperty('--arrow-y', `${arrowY}px`)


    }


    function onResize() {
        if (resizeTimer) window.clearTimeout(resizeTimer)
        resizeTimer = window.setTimeout(() => {
            resizeTimer = null
            computeLayout()
        }, 60)
    }

    async function openGuide() {
        show.value = true
        await nextTick()
        computeLayout()

        window.addEventListener('scroll', computeLayout, true)
        window.addEventListener('resize', onResize, true)

        // 👇 NEU
        window.addEventListener('pointerdown', onGlobalPointerDown, true)
        setInfoPulse(step.value === 'calc')

    }


    function onGlobalPointerDown(e: PointerEvent) {
        if (!show.value || step.value !== 'calc') return

        const target = e.target as HTMLElement | null
        if (!target) return

        // Wenn User auf ℹ️ klickt ODER irgendwo anders interagiert → Guide weg
        if (
            target.closest('.info-btn') ||
            target.closest('.calculator-card') ||
            target.closest('button') ||
            target.closest('a')
        ) {
            close(true) // ✅ als gesehen markieren
        }
    }

    function close(markSeen: boolean) {
        show.value = false

        window.removeEventListener('scroll', computeLayout, true)
        window.removeEventListener('resize', onResize, true)
        window.removeEventListener('pointerdown', onGlobalPointerDown, true)

        if (retryTimer) {
            window.clearTimeout(retryTimer)
            retryTimer = null
        }

        if (markSeen) {
            localStorage.setItem(LS_KEY, props.version)
        }
        setInfoPulse(false)

        targetEl = null
    }


    function onStartForceEvent() {
        startIfNeeded({ force: true })
    }

    async function startIfNeeded(opts?: { force?: boolean }) {
        const force = !!opts?.force
        step.value = 'nav'

        // ✅ Bonus: Wenn User schon auf Fortschritt ist -> Guide nicht zeigen
        const path = router.currentRoute.value.path
        if (path === '/progress') return

        const seen = localStorage.getItem(LS_KEY)
        if (!force && seen === props.version) return
        if (!force && props.block) return

        await nextTick()

        const tryFind = () => {
            const el = findGuideTarget()
            if (el) {
                targetEl = el

                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

                window.setTimeout(() => {
                    openGuide()
                }, 60)

                return
            }

            retryTimer = window.setTimeout(tryFind, 180)
        }

        tryFind()
    }


    function onStartEvent() {
        startIfNeeded()
    }

    onMounted(() => {
        window.addEventListener('tyg:explain-guide', onStartEvent)
        window.addEventListener('tyg:explain-guide-force', onStartForceEvent)
        stopRouteWatch = watch(
            () => ({
                path: router.currentRoute.value.path,
                tab: router.currentRoute.value.query.tab,
                focus: router.currentRoute.value.query.focus
            }),
            ({ path, tab, focus }) => {
                // Wenn Guide offen ist und User auf /progress geht -> schließen
                if (show.value && path === '/progress' && step.value === 'nav') {
                    close(false)
                }

                // ✅ Step 2: Nur wenn User via "Führ mich hin" kam (focus=1) UND wirklich im calculators tab ist
                if (path === '/progress' && tab === 'calculators' && focus === '1') {
                    // falls noch irgendwas offen/alt: hart resetten
                    close(false)
                    startSecondStepOnProgress()
                }
            },
            { immediate: true }
        )
    })

    onBeforeUnmount(() => {
        window.removeEventListener('tyg:explain-guide', onStartEvent)
        window.removeEventListener('tyg:explain-guide-force', onStartForceEvent)
        if (stopRouteWatch) {
            stopRouteWatch()
            stopRouteWatch = null
        }
        if (infoPulseTimer) {
            window.clearTimeout(infoPulseTimer)
            infoPulseTimer = null
        }
        setInfoPulse(false)
        close(false)
    })
</script>

<style scoped>
    /* ===== Guide Overlay (Spotlight + Pfeil) ===== */
    .guide-fade-enter-active,
    .guide-fade-leave-active {
        transition: opacity 180ms ease;
    }

    .guide-fade-enter-from,
    .guide-fade-leave-to {
        opacity: 0;
    }

    .guide-overlay {
        position: fixed;
        inset: 0;
        z-index: 900;
        /* 🚫 GAR NICHTS visuelles */
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        /* wichtig: Seite weiter bedienbar */
        pointer-events: none;
    }

    .guide-spot {
        position: fixed;
        z-index: 1100;
        border-radius: 14px;
        /* 🔥 nur ein klarer Fokus-Rahmen */
        outline: 2px solid rgba(129, 140, 248, 0.95);
        outline-offset: 2px;
        /* kein Schatten, keine Maske */
        box-shadow: none;
        pointer-events: none;
    }

        /* animierter “auf/zu” Ring */
        .guide-spot::before {
            content: "";
            position: absolute;
            inset: -6px; /* macht den Ping etwas größer als der eigentliche Ring */
            border-radius: 999px;
            border: 2px solid rgba(129, 140, 248, 0.55);
            opacity: 0;
            transform: scale(0.9);
            pointer-events: none;
        }

        /* wenn show/pulse an ist -> Ring atmet */
        .guide-spot.pulse::before {
            animation: guideRingBreath 0.95s ease-in-out infinite;
        }

    @keyframes guideRingBreath {
        0% {
            opacity: 0.15;
            transform: scale(0.88);
        }

        50% {
            opacity: 0.55;
            transform: scale(1.12); /* “aufgehen” */
        }

        100% {
            opacity: 0.15;
            transform: scale(0.88); /* “zugehen” */
        }
    }

    .guide-tip {
        position: fixed;
        z-index: 1200;
        width: min(320px, calc(100vw - 20px));
        border-radius: 16px;
        padding: 14px 14px 12px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.18), transparent 60%), rgba(2, 6, 23, 0.92);
        color: #f0f6fc;
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.65);
        pointer-events: auto;
    }

        .guide-tip::before {
            content: "";
            position: absolute;
            width: 0;
            height: 0;
            /* ✅ nur Seiten + obere Kante, KEIN Bottom */
            filter: drop-shadow(1px 0 0 rgba(148, 163, 184, 0.55)) drop-shadow(-1px 0 0 rgba(148, 163, 184, 0.55)) drop-shadow(0 -1px 0 rgba(148, 163, 184, 0.55)) drop-shadow(0 2px 5px rgba(0,0,0,.35));
        }

        /* Tooltip rechts vom Target -> Pfeil links */
        .guide-tip[data-side="right"]::before {
            left: -10px;
            top: var(--arrow-y, 22px);
            transform: translateY(-10px);
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-right: 10px solid rgba(2, 6, 23, 0.92);
        }

        /* Tooltip links vom Target -> Pfeil rechts */
        .guide-tip[data-side="left"]::before {
            right: -10px;
            top: var(--arrow-y, 22px);
            transform: translateY(-10px);
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            border-left: 10px solid rgba(2, 6, 23, 0.92);
        }

        /* Tooltip unter Target -> Pfeil oben */
        .guide-tip[data-side="bottom"]::before {
            top: -10px;
            left: calc(var(--arrow-x, 40px) - 10px);
            transform: none;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid rgba(2, 6, 23, 0.92);
        }

        .guide-tip[data-side="top"]::before {
            bottom: -10px;
            left: calc(var(--arrow-x, 40px) - 10px);
            transform: none;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid rgba(2, 6, 23, 0.92);
        }


    .guide-tip-title {
        font-weight: 950;
        font-size: 0.98rem;
        margin-bottom: 6px;
    }

    .guide-tip-text {
        font-size: 0.92rem;
        line-height: 1.35;
        opacity: 0.95;
    }

    .guide-tip-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 12px;
    }

    .guide-btn {
        appearance: none;
        border-radius: 12px;
        padding: 10px 12px;
        font-weight: 900;
        cursor: pointer;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(255,255,255,0.04);
        color: #f0f6fc;
    }

        .guide-btn.ghost:hover {
            background: rgba(255,255,255,0.07);
        }

        .guide-btn.primary {
            border-color: rgba(99, 102, 241, 0.7);
            background: linear-gradient( 135deg, color-mix(in srgb, var(--accent-primary, #6366f1) 24%, transparent), color-mix(in srgb, var(--accent-secondary, #22c55e) 18%, transparent) );
        }

            .guide-btn.primary:hover {
                filter: saturate(1.06);
            }

    .guide-x {
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 2;
    }

    /* ===== Bewegtes / auffälliges Guide ===== */

    /* Spotlight pulsiert (blink/pulse) */
    .guide-spot.pulse {
        animation: guideSpotPulse 1.05s ease-in-out infinite;
    }

    @keyframes guideSpotPulse {
        0%, 100% {
            outline-color: rgba(129, 140, 248, 0.95);
            transform: scale(1);
            opacity: 1;
        }

        50% {
            outline-color: rgba(129, 140, 248, 0.55);
            transform: scale(1.02);
            opacity: 0.9;
        }
    }

    /* Tooltip “floatet” (bewegtes Popup) */
    .guide-tip {
        animation: guideTipFloat 1.35s ease-in-out infinite;
        will-change: transform;
    }

    @keyframes guideTipFloat {
        0%, 100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-6px);
        }
    }

    /* Kleine Attention-Blink-Kante */
    .guide-tip::after {
        content: "";
        position: absolute;
        inset: -1px;
        border-radius: 16px;
        pointer-events: none;
        opacity: 0.0;
        animation: guideTipBlink 1.2s ease-in-out infinite;
        border: 1px solid rgba(129, 140, 248, 0.65);
    }

    @keyframes guideTipBlink {
        0%, 100% {
            opacity: 0.05;
        }

        50% {
            opacity: 0.35;
        }
    }

    /* Step 2: Info-Buttons im Rechnerbereich kurz highlighten */
    :global(html.tyg-guide-pulse-info .progress .calculators-grid .info-btn) {
        animation: guideInfoPulse 0.85s ease-in-out infinite;
    }

    @keyframes guideInfoPulse {
        0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(129, 140, 248, 0));
        }

        50% {
            transform: scale(1.12);
            filter: drop-shadow(0 0 10px rgba(129, 140, 248, 0.55));
        }
    }
</style>
