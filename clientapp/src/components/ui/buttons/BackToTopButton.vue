<!--Pfad: components/ui/buttons/BackToTopButton.vue-->
<template>
    <Teleport to="body">
        <button v-show="enabled && visible"
                type="button"
                class="backtop-btn"
                aria-label="Nach oben"
                title="Nach oben"
                @click="scrollToTop">
            <span class="backtop-icon" aria-hidden="true">↑</span>
        </button>
    </Teleport>
</template>

<script setup lang="ts">
    import { ref, onMounted, onBeforeUnmount } from 'vue'
    import { LS_BACK_TO_TOP_ENABLED } from '@/constants/storageKeys'

    const visible = ref(false)

    const enabled = ref(true)
    const scrollTargets: EventTarget[] = []
    const wheelTargets: EventTarget[] = []
    let visibilityRaf = 0

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
        // Direkt nach dem ersten echten Scrollen einblenden.
        visible.value = getScrollTop() > 0
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

    function scrollToTop() {
        // ✅ sicher (auch wenn Browser/Container zickt)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        document.documentElement.scrollTo?.({ top: 0, behavior: 'smooth' } as any)
        document.body.scrollTop = 0
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
        transition: transform .18s ease, opacity .18s ease, filter .18s ease, box-shadow .22s ease, border-color .22s ease, outline-color .22s ease;
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

    html.dark-mode .backtop-btn {
        background: rgba(2, 6, 23, 0.40);
        border-color: rgba(148, 163, 184, 0.40);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.55);
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
</style>
