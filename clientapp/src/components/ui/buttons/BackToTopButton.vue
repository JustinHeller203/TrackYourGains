<!--Pfad: components/ui/buttons/BackToTopButton.vue-->
<template>
    <Teleport to="body">
        <button v-show="enabled && visible"
                type="button"
                class="backtop-btn"
                :class="{
                    'is-firing': isFiring,
                    'is-scrolling-down': scrollDirection === 'down',
                    'is-scrolling-up': scrollDirection === 'up',
                }"
                aria-label="Nach oben"
                title="Nach oben"
                @click="scrollToTop">
            <span class="backtop-launchpad" aria-hidden="true">
                <span class="backtop-launchpad__rail backtop-launchpad__rail--left"></span>
                <span class="backtop-launchpad__core"></span>
                <span class="backtop-launchpad__rail backtop-launchpad__rail--right"></span>
            </span>
            <span class="backtop-launch-smoke" aria-hidden="true"></span>
            <span class="backtop-launch-smoke backtop-launch-smoke--right" aria-hidden="true"></span>
            <span class="backtop-charge-ring" aria-hidden="true"></span>
            <span class="backtop-engine-flare" aria-hidden="true"></span>
            <span class="backtop-shockwave" aria-hidden="true"></span>
            <span class="backtop-top-impact" aria-hidden="true"></span>
            <span class="backtop-icon" aria-hidden="true">↑</span>
        </button>
    </Teleport>
</template>

<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { LS_BACK_TO_TOP_ENABLED } from '@/constants/storageKeys'

    const visible = ref(false)
    const isFiring = ref(false)
    const scrollDirection = ref<'up' | 'down' | null>(null)

    const enabled = ref(true)
    const scrollTargets: EventTarget[] = []
    const wheelTargets: EventTarget[] = []
    let visibilityRaf = 0
    let launchTimer = 0
    let scrollAnimRaf = 0
    let firingResetTimer = 0
    let scrollIdleTimer = 0
    let lastScrollTop = 0

    function loadEnabled() {
        const raw = localStorage.getItem(LS_BACK_TO_TOP_ENABLED)
        enabled.value = raw === null ? true : raw === 'true'
    }

    const onBttEnabledChanged = (e: CustomEvent<boolean>) => {
        enabled.value = !!e.detail
    }

    function readScrollTop(target: EventTarget | null | undefined) {
        if (!target) return 0
        if (target === window) return window.scrollY || 0
        if (target instanceof HTMLElement) return target.scrollTop || 0
        if (target instanceof Document) {
            return Math.max(
                target.documentElement?.scrollTop || 0,
                target.body?.scrollTop || 0
            )
        }
        return 0
    }

    function getScrollTop() {
        const candidates = [
            window,
            document,
            document.scrollingElement,
            document.documentElement,
            document.body,
            document.querySelector('.app-shell'),
            document.querySelector('.main-content'),
        ]

        return candidates.reduce((max, target) => Math.max(max, readScrollTop(target as EventTarget)), 0)
    }

    function onScroll() {
        const nextTop = getScrollTop()

        // Direkt nach dem ersten echten Scrollen einblenden.
        visible.value = nextTop > 0

        const delta = nextTop - lastScrollTop
        if (Math.abs(delta) > 0.5) {
            scrollDirection.value = delta > 0 ? 'down' : 'up'
            lastScrollTop = nextTop

            if (scrollIdleTimer) window.clearTimeout(scrollIdleTimer)
            scrollIdleTimer = window.setTimeout(() => {
                scrollDirection.value = null
                scrollIdleTimer = 0
            }, 140)
            return
        }

        lastScrollTop = nextTop
    }

    const onWheel: EventListener = (event) => {
        const wheelEvent = event as WheelEvent
        if (!enabled.value) return
        if (wheelEvent.deltaY <= 0) return
        visible.value = true
    }

    function startVisibilityLoop() {
        const tick = () => {
            onScroll()
            visibilityRaf = window.requestAnimationFrame(tick)
        }

        if (visibilityRaf) window.cancelAnimationFrame(visibilityRaf)
        visibilityRaf = window.requestAnimationFrame(tick)
    }

    function easeOutCubic(t: number) {
        return 1 - Math.pow(1 - t, 3)
    }

    function stopScrollAnimation() {
        if (scrollAnimRaf) {
            window.cancelAnimationFrame(scrollAnimRaf)
            scrollAnimRaf = 0
        }
    }

    function animateWindowScrollToTop(duration: number) {
        stopScrollAnimation()

        const startTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
        if (startTop <= 0) return

        const startedAt = performance.now()

        const step = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1)
            const eased = easeOutCubic(progress)
            const nextTop = Math.max(0, Math.round(startTop * (1 - eased)))

            window.scrollTo({ top: nextTop, behavior: 'auto' })
            document.documentElement.scrollTop = nextTop
            document.body.scrollTop = nextTop

            if (progress < 1) {
                scrollAnimRaf = window.requestAnimationFrame(step)
            } else {
                scrollAnimRaf = 0
            }
        }

        scrollAnimRaf = window.requestAnimationFrame(step)
    }

    function scrollToTop() {
        if (isFiring.value) return

        if (launchTimer) window.clearTimeout(launchTimer)
        isFiring.value = true

        const prefersReduced = typeof window !== 'undefined'
            && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

        const chargeMs = prefersReduced ? 0 : 360
        const scrollDuration = prefersReduced ? 180 : 430

        launchTimer = window.setTimeout(() => {
            animateWindowScrollToTop(scrollDuration)
        }, chargeMs)

        if (firingResetTimer) window.clearTimeout(firingResetTimer)
        firingResetTimer = window.setTimeout(() => {
            isFiring.value = false
        }, chargeMs + 900)
    }

    function registerScrollTarget(target: EventTarget | null | undefined, options?: AddEventListenerOptions | boolean) {
        if (!target || scrollTargets.includes(target)) return
        target.addEventListener('scroll', onScroll, options as any)
        scrollTargets.push(target)
    }

    function registerWheelTarget(target: EventTarget | null | undefined, options?: AddEventListenerOptions | boolean) {
        if (!target || wheelTargets.includes(target)) return
        target.addEventListener('wheel', onWheel, options as any)
        wheelTargets.push(target)
    }

    onMounted(() => {
        loadEnabled()
        window.addEventListener('back-to-top-enabled-changed', onBttEnabledChanged as EventListener)

        registerScrollTarget(window, { passive: true })
        registerScrollTarget(document, { passive: true, capture: true } as any)
        registerScrollTarget(document.scrollingElement)
        registerScrollTarget(document.documentElement)
        registerScrollTarget(document.body)
        registerScrollTarget(document.querySelector('.app-shell'))
        registerScrollTarget(document.querySelector('.main-content'))
        registerWheelTarget(window, { passive: true })
        registerWheelTarget(document, { passive: true, capture: true } as any)
        registerWheelTarget(document.querySelector('.app-shell'), { passive: true })
        registerWheelTarget(document.querySelector('.main-content'), { passive: true })
        onScroll()
        startVisibilityLoop()
    })

    onBeforeUnmount(() => {
        window.removeEventListener('back-to-top-enabled-changed', onBttEnabledChanged as EventListener)
        if (visibilityRaf) window.cancelAnimationFrame(visibilityRaf)
        if (launchTimer) window.clearTimeout(launchTimer)
        if (firingResetTimer) window.clearTimeout(firingResetTimer)
        if (scrollIdleTimer) window.clearTimeout(scrollIdleTimer)
        stopScrollAnimation()
        scrollTargets.forEach((target) => {
            if (target === document) {
                target.removeEventListener('scroll', onScroll as any, true as any)
                return
            }
            target.removeEventListener('scroll', onScroll as any)
        })
        wheelTargets.forEach((target) => {
            if (target === document) {
                target.removeEventListener('wheel', onWheel as any, true as any)
                return
            }
            target.removeEventListener('wheel', onWheel as any)
        })
    })
</script>

<style scoped>
    .backtop-btn {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 1200;
        width: 46px;
        height: 46px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        /* ✅ KEY: transparent + backdrop = der Button "zieht" den live Hintergrund */
        background: rgba(255, 255, 255, 0.10);
        color: var(--text-primary);
        border: 1px solid rgba(148, 163, 184, 0.32);
        backdrop-filter: blur(14px) saturate(1.25);
        -webkit-backdrop-filter: blur(14px) saturate(1.25);
        box-shadow: 0 18px 42px rgba(15, 23, 42, 0.26);
        opacity: 0.92;
        transform: translateY(8px) scale(0.98);
        transform-origin: center;
        transition: transform .18s ease, opacity .18s ease, filter .18s ease, box-shadow .22s ease, border-color .22s ease, outline-color .22s ease;
        overflow: visible;
    }

        .backtop-btn.is-scrolling-down:not(.is-firing) {
            transform: translateY(8px) scaleX(1.09) scaleY(0.84);
            transform-origin: bottom center;
        }

        .backtop-btn.is-scrolling-up:not(.is-firing) {
            transform: translateY(8px) scaleX(1.07) scaleY(0.87);
            transform-origin: top center;
        }

        .backtop-btn::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            /* nur ein Hauch Brand-Tint – aber Hintergrund bleibt dominant */
            background: radial-gradient(circle at 30% 25%, rgba(99, 102, 241, 0.22), transparent 55%), radial-gradient(circle at 70% 75%, rgba(34, 197, 94, 0.18), transparent 60%);
            mix-blend-mode: overlay;
            opacity: 0.75;
        }

        .backtop-btn::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: 10px;
            width: 14px;
            height: 0;
            border-radius: 999px;
            pointer-events: none;
            transform: translateX(-50%);
            opacity: 0;
            background:
                linear-gradient(180deg,
                    rgba(255, 255, 255, 0.98) 0%,
                    rgba(250, 204, 21, 0.96) 18%,
                    rgba(249, 115, 22, 0.9) 45%,
                    rgba(59, 130, 246, 0.24) 100%);
            filter: blur(1.6px);
        }

        .backtop-btn .backtop-charge-ring {
            position: absolute;
            inset: -6px;
            border-radius: inherit;
            pointer-events: none;
            opacity: 0;
        }

        .backtop-launch-smoke,
        .backtop-shockwave,
        .backtop-top-impact {
            position: absolute;
            pointer-events: none;
            opacity: 0;
        }

        .backtop-launchpad {
            position: absolute;
            left: 50%;
            bottom: -8px;
            width: 34px;
            height: 16px;
            display: grid;
            grid-template-columns: 7px 1fr 7px;
            align-items: end;
            gap: 3px;
            transform: translateX(-50%);
            pointer-events: none;
            opacity: 0.9;
        }

        .backtop-launchpad__rail,
        .backtop-launchpad__core {
            display: block;
            border-radius: 999px;
        }

        .backtop-launchpad__rail {
            height: 13px;
            background: linear-gradient(180deg, rgba(226, 232, 240, 0.82), rgba(148, 163, 184, 0.56));
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .backtop-launchpad__core {
            height: 8px;
            margin-bottom: 1px;
            background: linear-gradient(180deg, rgba(71, 85, 105, 0.92), rgba(30, 41, 59, 0.9));
            box-shadow: 0 4px 10px rgba(15, 23, 42, 0.22);
        }

        .backtop-engine-flare {
            position: absolute;
            left: 50%;
            bottom: 6px;
            width: 18px;
            height: 0;
            border-radius: 999px;
            pointer-events: none;
            transform: translateX(-50%);
            opacity: 0;
            background:
                radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0) 48%),
                linear-gradient(180deg, rgba(250, 204, 21, 0.98), rgba(249, 115, 22, 0.92) 55%, rgba(59, 130, 246, 0.14) 100%);
            filter: blur(1.2px);
        }

        .backtop-launch-smoke {
            left: 50%;
            bottom: -2px;
            width: 20px;
            height: 20px;
            border-radius: 999px;
            transform: translateX(-80%);
            background:
                radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.24) 34%, rgba(148, 163, 184, 0.18) 58%, rgba(148, 163, 184, 0) 78%);
            filter: blur(1.4px);
        }

        .backtop-launch-smoke--right {
            transform: translateX(-20%);
        }

        .backtop-shockwave {
            left: 50%;
            bottom: -6px;
            width: 18px;
            height: 8px;
            border-radius: 999px;
            transform: translateX(-50%) scale(0.4);
            background: radial-gradient(circle at center, rgba(125, 211, 252, 0.82), rgba(96, 165, 250, 0.18) 56%, rgba(96, 165, 250, 0) 74%);
            filter: blur(1px);
        }

        .backtop-top-impact {
            left: 50%;
            top: -18px;
            width: 70px;
            height: 24px;
            transform: translateX(-50%) scale(0.4);
            border-radius: 999px;
            background:
                radial-gradient(circle at center, rgba(255, 255, 255, 0.98), rgba(125, 211, 252, 0.82) 28%, rgba(59, 130, 246, 0.24) 58%, rgba(59, 130, 246, 0) 76%);
            filter: blur(2px);
        }


        .backtop-btn:hover {
            opacity: 1;
            transform: translateY(0) scale(1.02);
            filter: saturate(1.06);
            border-color: rgba(129, 140, 248, 0.55);
            box-shadow: 0 22px 52px rgba(15, 23, 42, 0.32);
            outline: 3px solid rgba(99, 102, 241, 0.55);
            outline-offset: 3px;
        }

        .backtop-btn:active {
            transform: translateY(1px) scale(0.99);
            outline-offset: 2px;
        }

    .backtop-btn.is-firing {
        opacity: 1;
        border-color: rgba(125, 211, 252, 0.98);
        box-shadow:
            0 0 0 6px rgba(96, 165, 250, 0.22),
            0 28px 62px rgba(15, 23, 42, 0.38),
            0 0 42px rgba(96, 165, 250, 0.34);
        animation: backtop-charge-launch 1.08s cubic-bezier(0.22, 1, 0.36, 1) both;
    }

        .backtop-btn.is-firing::before {
            animation: backtop-charge-glow 1.08s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .backtop-btn.is-firing::after {
            animation: backtop-sky-trail .86s cubic-bezier(0.16, 1, 0.3, 1) .36s both;
        }

        .backtop-btn.is-firing .backtop-charge-ring {
            animation: backtop-charge-ring .72s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .backtop-btn.is-firing .backtop-engine-flare {
            animation: backtop-engine-ignite .9s cubic-bezier(0.16, 1, 0.3, 1) .28s both;
        }

        .backtop-btn.is-firing .backtop-launchpad {
            animation: backtop-launchpad-recoil .88s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .backtop-btn.is-firing .backtop-launch-smoke {
            animation: backtop-launch-smoke .92s cubic-bezier(0.16, 1, 0.3, 1) .24s both;
        }

        .backtop-btn.is-firing .backtop-launch-smoke--right {
            animation-delay: .28s;
        }

        .backtop-btn.is-firing .backtop-shockwave {
            animation: backtop-shockwave .56s cubic-bezier(0.16, 1, 0.3, 1) .32s both;
        }

        .backtop-btn.is-firing .backtop-top-impact {
            animation: backtop-top-impact .42s cubic-bezier(0.16, 1, 0.3, 1) .7s both;
        }

    html.dark-mode .backtop-btn {
        background: rgba(2, 6, 23, 0.40);
        border-color: rgba(148, 163, 184, 0.40);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.55);
    }

    html.dark-mode .backtop-launchpad__rail {
        background: linear-gradient(180deg, rgba(226, 232, 240, 0.72), rgba(100, 116, 139, 0.52));
    }

    html.dark-mode .backtop-launchpad__core {
        background: linear-gradient(180deg, rgba(51, 65, 85, 0.98), rgba(15, 23, 42, 0.94));
    }


    @media (max-width: 640px) {
        .backtop-btn {
            right: 14px;
            bottom: 14px;
            width: 44px;
            height: 44px;
            border-radius: 15px;
        }
    }

    .backtop-icon {
        font-size: 1.05rem;
        font-weight: 950;
        line-height: 1;
        transform: translateY(-1px);
        color: currentColor;
        opacity: 0.92;
    }

    .backtop-btn.is-firing .backtop-icon {
        animation: backtop-icon-skyshot .86s cubic-bezier(0.16, 1, 0.3, 1) .38s both;
    }

    @keyframes backtop-charge-launch {
        0% {
            transform: translateY(0) scale(1);
        }

        14% {
            transform: translateY(7px) scale(0.7);
        }

        32% {
            transform: translateY(6px) scale(0.76);
            box-shadow:
                0 0 0 16px rgba(96, 165, 250, 0.18),
                0 28px 60px rgba(15, 23, 42, 0.42),
                0 0 62px rgba(96, 165, 250, 0.48);
        }

        60% {
            transform: translateY(-8px) scale(1.22);
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    @keyframes backtop-charge-glow {
        0% {
            opacity: 0.75;
            filter: saturate(1);
        }

        30% {
            opacity: 1;
            filter: saturate(1.7) brightness(1.26);
        }

        46% {
            opacity: 1;
            filter: saturate(1.9) brightness(1.36);
        }

        100% {
            opacity: 0.75;
            filter: saturate(1);
        }
    }

    @keyframes backtop-icon-skyshot {
        0% {
            transform: translateY(-1px) scale(1);
            opacity: 0.96;
        }

        20% {
            transform: translateY(6px) scale(0.5);
            opacity: 1;
        }

        66% {
            transform: translateY(-38px) scale(1.28);
            opacity: 1;
        }

        100% {
            transform: translateY(-86px) scale(0.74);
            opacity: 0;
        }
    }

    @keyframes backtop-sky-trail {
        0% {
            height: 0;
            opacity: 0;
        }

        22% {
            height: 34px;
            opacity: 0.95;
        }

        100% {
            height: 112px;
            opacity: 0;
        }
    }

    @keyframes backtop-charge-ring {
        0% {
            opacity: 0;
            transform: scale(0.76);
            box-shadow:
                0 0 0 0 rgba(96, 165, 250, 0.44),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        58% {
            opacity: 1;
            transform: scale(1.16);
            box-shadow:
                0 0 0 6px rgba(96, 165, 250, 0.34),
                0 0 28px rgba(96, 165, 250, 0.3),
                inset 0 0 0 1px rgba(255, 255, 255, 0.28);
        }

        100% {
            opacity: 0;
            transform: scale(1.34);
            box-shadow:
                0 0 0 18px rgba(96, 165, 250, 0),
                0 0 36px rgba(96, 165, 250, 0),
                inset 0 0 0 1px rgba(255, 255, 255, 0);
        }
    }

    @keyframes backtop-engine-ignite {
        0% {
            height: 0;
            opacity: 0;
            transform: translateX(-50%) scaleY(0.4);
        }

        18% {
            height: 22px;
            opacity: 1;
            transform: translateX(-50%) scaleY(1);
        }

        42% {
            height: 46px;
            opacity: 1;
            transform: translateX(-50%) scaleY(1.12);
        }

        100% {
            height: 102px;
            opacity: 0;
            transform: translateX(-50%) scaleY(1.28);
        }
    }

    @keyframes backtop-launchpad-recoil {
        0% {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 0.9;
        }

        26% {
            transform: translateX(-50%) translateY(2px) scale(0.94);
            opacity: 1;
        }

        58% {
            transform: translateX(-50%) translateY(4px) scale(0.88);
            opacity: 0.82;
        }

        100% {
            transform: translateX(-50%) translateY(0) scale(1);
            opacity: 0.9;
        }
    }

    @keyframes backtop-launch-smoke {
        0% {
            opacity: 0;
            transform: translateX(-80%) translateY(0) scale(0.45);
        }

        28% {
            opacity: 0.95;
            transform: translateX(-120%) translateY(4px) scale(1.18);
        }

        100% {
            opacity: 0;
            transform: translateX(-180%) translateY(18px) scale(1.9);
        }
    }

    @keyframes backtop-shockwave {
        0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.35);
        }

        32% {
            opacity: 0.9;
            transform: translateX(-50%) scale(1.8);
        }

        100% {
            opacity: 0;
            transform: translateX(-50%) scale(3.2);
        }
    }

    @keyframes backtop-top-impact {
        0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.3);
        }

        35% {
            opacity: 1;
            transform: translateX(-50%) scale(1.08);
        }

        100% {
            opacity: 0;
            transform: translateX(-50%) scale(1.7);
        }
    }
</style>
