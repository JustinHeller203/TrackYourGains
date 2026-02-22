<!-- components/ui/TygTutorials/BaseTutorial.vue -->
<template>
    <teleport to="body">
        <div v-if="isActive" class="tyg-tut-root" :style="rootVars" aria-live="polite">
            <div class="tyg-tut-backdrop" />

            <div v-if="target" class="tyg-tut-highlight" :style="highlightStyle" />

            <div v-if="target && showHand"
                 class="tyg-tut-hand"
                 :style="handStyle"
                 aria-hidden="true">
                {{ handEmoji }}
            </div>

            <div ref="cardEl"
                 class="tyg-tut-card"
                 :style="cardStyle"
                 role="dialog"
                 aria-modal="true">
                <div v-if="title" class="tyg-tut-title">
                    <span class="dot" aria-hidden="true"></span>
                    <span>{{ title }}</span>
                </div>

                <div class="tyg-tut-content">
                    <slot :target="target" :layout="layout" />
                </div>

                <div v-if="$slots.actions" class="tyg-tut-actions">
                    <slot name="actions" :target="target" :layout="layout" />
                </div>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

    type Rect = { x: number; y: number; w: number; h: number };

    const props = defineProps<{
        isActive: boolean;

        /** primary selector for highlight target */
        selector?: string;

        /** fallback if selector not found */
        fallbackSelector?: string;

        /** optional title shown in header */
        title?: string;

        /** styling */
        accent?: string; // default: TYG red
        zIndex?: number; // default 50000
        highlightPad?: number; // default 10

        retryFrames?: number; // default 20
        showHand?: boolean; // default true
    }>();

    const emit = defineEmits<{
        (e: "ready", payload: { target: Rect | null }): void;
    }>();

    const target = ref<Rect | null>(null);

    const cardEl = ref<HTMLElement | null>(null);
    const cardW = ref(360);
    const cardH = ref(210);

    let raf = 0;
    let retryLeft = 0;

    function measureCard() {
        const el = cardEl.value;
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width > 0) cardW.value = r.width;
        if (r.height > 0) cardH.value = r.height;
    }

    function clamp(n: number, min: number, max: number) {
        return Math.max(min, Math.min(max, n));
    }

    function getElRect(el: Element | null): Rect | null {
        if (!el) return null;
        const r = (el as HTMLElement).getBoundingClientRect();
        if (!r || r.width <= 0 || r.height <= 0) return null;
        return { x: r.left, y: r.top, w: r.width, h: r.height };
    }

    function findTargetEl(): Element | null {
        const sel = (props.selector ?? "").trim();
        if (sel) {
            const el = document.querySelector(sel);
            if (el) return el;
        }
        const fallback = (props.fallbackSelector ?? "").trim();
        if (fallback) return document.querySelector(fallback);

        return null;
    }

    function scrollTargetIntoView(el: Element | null) {
        if (!el) return;
        const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        try {
            (el as HTMLElement).scrollIntoView({
                behavior: prefersReduced ? "auto" : "smooth",
                block: "center",
                inline: "nearest",
            });
        } catch { }
    }
    function updateTarget() {
        cancelAnimationFrame(raf);
        if (retryLeft <= 0) retryLeft = props.retryFrames ?? 20;

        raf = requestAnimationFrame(() => {
            const el = findTargetEl();
            target.value = getElRect(el);

            // wenn wir am Ende immer noch nix haben -> trotzdem "ready" feuern (mit null)
            if (!target.value) {
                if (retryLeft-- > 0) {
                    updateTarget();
                    return;
                }
                emit("ready", { target: null });
                return;
            }

            emit("ready", { target: target.value });
        });
    }

    function onReflow() {
        if (!props.isActive) return;
        measureCard();
        updateTarget();
    }

    watch(
        () => props.isActive,
        async (active) => {
            if (!active) return;
            await nextTick();
            measureCard();
            const el = findTargetEl();
            scrollTargetIntoView(el);
            updateTarget();
        },
        { immediate: true }
    );

    watch(
        () => props.selector,
        async () => {
            if (!props.isActive) return;
            await nextTick();
            onReflow();
        }
    );

    onMounted(() => {
        window.addEventListener("resize", onReflow, { passive: true });
        window.addEventListener("scroll", onReflow, { passive: true });
    });

    onUnmounted(() => {
        window.removeEventListener("resize", onReflow as any);
        window.removeEventListener("scroll", onReflow as any);
        cancelAnimationFrame(raf);
    });

    const highlightStyle = computed(() => {
        if (!target.value) return {};
        const pad = props.highlightPad ?? 10;
        const x = clamp(target.value.x - pad, 8, window.innerWidth - 8);
        const y = clamp(target.value.y - pad, 8, window.innerHeight - 8);
        const w = clamp(target.value.w + pad * 2, 40, window.innerWidth - x - 8);
        const h = clamp(target.value.h + pad * 2, 40, window.innerHeight - y - 8);
        return { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` };
    });

    const layout = computed(() => {
        if (!target.value) {
            return {
                above: true,
                popupTop: 16,
                popupLeft: 16,
                handTop: 16 + (cardH.value || 210) + 8,
                handLeft: 40,
            };
        }

        const t = target.value;
        const pad = 16;
        const gapToTarget = 10;
        const gapHandPopup = 8;
        const handSize = 52;

        const popupW = Math.min(cardW.value || 360, window.innerWidth - pad * 2);
        const popupH = cardH.value || 210;
        const cx = t.x + t.w / 2;

        const popupLeft = clamp(cx - popupW / 2, pad, window.innerWidth - popupW - pad);
        const handLeft = clamp(cx, 24, window.innerWidth - 24);

        const handTopAbove = t.y - gapToTarget - handSize;
        const popupTopAbove = handTopAbove - gapHandPopup - popupH;

        const handTopBelow = t.y + t.h + gapToTarget;
        const popupTopBelow = handTopBelow + handSize + gapHandPopup;

        const fitsAbove = popupTopAbove >= pad;
        const fitsBelow = popupTopBelow + popupH <= window.innerHeight - pad;

        const above = fitsAbove || !fitsBelow;

        let handTop = above ? handTopAbove : handTopBelow;
        let popupTop = above ? popupTopAbove : popupTopBelow;

        handTop = clamp(handTop, pad, window.innerHeight - handSize - pad);
        popupTop = clamp(popupTop, pad, window.innerHeight - popupH - pad);

        return { above, popupTop, popupLeft, handTop, handLeft };
    });

    const handEmoji = computed(() => (layout.value.above ? "👇" : "👆"));

    const handStyle = computed(() => ({
        left: `${layout.value.handLeft}px`,
        top: `${layout.value.handTop}px`,
        transform: "translateX(-50%)",
    }));

    const cardStyle = computed(() => ({
        left: `${layout.value.popupLeft}px`,
        top: `${layout.value.popupTop}px`,
    }));

    const rootVars = computed(() => {
        // Default: neutral wie deine Cards (slate), NICHT rot
        const accent = (props.accent ?? "rgba(148,163,184,0.95)").trim();
        const z = props.zIndex ?? 50000;

        return {
            "--tyg-accent": accent,
            "--tyg-z": String(z),
        } as Record<string, string>;
    });

    const showHand = computed(() => props.showHand !== false);

    defineExpose({
        refresh: onReflow,
        getTarget: () => target.value,
    });
</script>

<style scoped>
    .tyg-tut-root {
        position: fixed;
        inset: 0;
        z-index: var(--tyg-z);
        pointer-events: none;
    }

    .tyg-tut-backdrop {
        position: absolute;
        inset: 0;
        background: transparent;
        pointer-events: none;
        z-index: 1;
    }

    .tyg-tut-hand {
        position: absolute;
        font-size: 44px;
        line-height: 1;
        filter: drop-shadow(0 10px 18px rgba(0, 0, 0, 0.6));
        animation: handBob 0.85s ease-in-out infinite;
        pointer-events: none;
        z-index: 4;
    }

    .tyg-tut-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        letter-spacing: 0.2px;
        margin-bottom: 8px;
    }

    .tyg-tut-highlight {
        position: absolute;
        border-radius: 18px;
        border: 2px solid rgba(148, 163, 184, 0.55); /* slate like */
        box-shadow: 0 0 0 10px rgba(148, 163, 184, 0.10), 0 0 26px rgba(148, 163, 184, 0.14), 0 22px 70px rgba(0, 0, 0, 0.55);
        background: transparent;
        animation: pulse 1.2s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
    }

    .tyg-tut-card {
        position: absolute;
        width: min(360px, calc(100vw - 32px));
        padding: 14px 14px 12px;
        border-radius: 18px;
        /* wie deine List-Cards: clean dark + subtle border */
        background: rgba(15, 23, 42, 0.94);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.60), 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
        color: #e5e7eb;
        z-index: 5;
        pointer-events: auto;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.95);
        box-shadow: 0 0 0 6px rgba(148, 163, 184, 0.14);
    }
    .tyg-tut-content {
        line-height: 1.35;
        opacity: 0.98;
        font-size: 0.98rem;
    }

    .tyg-tut-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 12px;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            filter: saturate(1);
        }

        50% {
            transform: scale(1.01);
            filter: saturate(1.12);
        }
    }

    @keyframes handBob {
        0%, 100% {
            transform: translateX(-50%) translateY(0);
        }

        50% {
            transform: translateX(-50%) translateY(10px);
        }
    }

    /* --- Buttons: TYG neutral (kein rot) --- */
    .tyg-tut-card :deep(.btn) {
        border-radius: 12px;
        padding: 8px 12px;
        border: 1px solid rgba(148, 163, 184, 0.28);
        background: rgba(2, 6, 23, 0.35);
        color: #e5e7eb;
        cursor: pointer;
        font-weight: 700;
        transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease, border-color 120ms ease;
    }

    .tyg-tut-card :deep(.btn:hover) {
        transform: translateY(-1px);
        border-color: rgba(148, 163, 184, 0.42);
        box-shadow: 0 10px 24px rgba(0,0,0,0.35);
    }

    .tyg-tut-card :deep(.btn:active) {
        transform: translateY(0);
    }

    .tyg-tut-card :deep(.btn.ghost) {
        background: transparent;
    }

    .tyg-tut-card :deep(.btn.primary) {
        /* Primary wie deine UI: slate-glow, nicht rot */
        background: rgba(148, 163, 184, 0.18);
        border-color: rgba(148, 163, 184, 0.38);
        box-shadow: 0 0 0 1px rgba(255,255,255,0.03) inset;
    }

    .tyg-tut-card :deep(.btn.primary:hover) {
        background: rgba(148, 163, 184, 0.24);
        border-color: rgba(148, 163, 184, 0.52);
        box-shadow: 0 14px 30px rgba(0,0,0,0.40), 0 0 18px rgba(148, 163, 184, 0.12);
    }
</style>