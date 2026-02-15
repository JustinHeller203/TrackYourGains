<!--components/ui/TygTutorials/PlanCreatedTutorial.vue-->
<template>
    <teleport to="body">
        <div v-if="isActive" class="tyg-tut-root" aria-live="polite">
            <!-- Backdrop -->
            <div class="tyg-tut-backdrop" />

            <!-- Highlight box -->
            <div v-if="target"
                 class="tyg-tut-highlight"
                 :style="highlightStyle" />

            <div v-if="target"
                 class="tyg-tut-hand"
                 :style="handStyle"
                 aria-hidden="true">{{ handEmoji }}</div>

            <!-- Card -->
            <div ref="cardEl" class="tyg-tut-card" :style="cardStyle" role="dialog" aria-modal="true">

                <div class="tyg-tut-title">
                    <span class="dot" aria-hidden="true"></span>
                    <span>{{ stepTitle }}</span>
                </div>

                <div class="tyg-tut-text">
                    {{ stepText }}
                </div>

                <div class="tyg-tut-actions">
                    <button type="button" class="btn ghost" @click="skip">Skip</button>
                    <button type="button" class="btn primary" @click="handleCardClick">
                        Plan öffnen ✅
                    </button>
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
        planId: string | null;
        // optional: Parent kann direkt Plan öffnen (z.B. via ref auf TrainingPlansList)
        openPlan?: (planId: string) => void;

        // falls du später mal umbenennst:
        plansSectionSelector?: string; // default: [data-tyg="plans-section"]
    }>();

    const emit = defineEmits<{
        (e: "done"): void;
        (e: "skipped"): void;
    }>();

    const plansSelector = computed(
        () => props.plansSectionSelector ?? '[data-tyg="plans-section"]'
    );

    const target = ref<Rect | null>(null);
    let raf = 0;

    let boundPlanEl: Element | null = null;

    function closeTutorialNextFrame() {
        requestAnimationFrame(() => done());
    }

    function onPlanRealClick() {
        // User hat die echte Plan-Card geklickt -> Plan öffnet normal -> Tutorial schließen
        closeTutorialNextFrame();
    }

    function bindPlanClick(el: Element | null) {
        if (boundPlanEl === el) return;

        if (boundPlanEl) {
            boundPlanEl.removeEventListener("click", onPlanRealClick);
        }

        boundPlanEl = el;

        if (boundPlanEl) {
            boundPlanEl.addEventListener("click", onPlanRealClick);
        }
    }

    const cardEl = ref<HTMLElement | null>(null);
    const cardW = ref(360);
    const cardH = ref(210);

    function measureCard() {
        const el = cardEl.value;
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width > 0) cardW.value = r.width;
        if (r.height > 0) cardH.value = r.height;
    }

    const stepTitle = computed(() => "Plan erstellt 🎉");

    const stepText = computed(() =>
        "Dein neuer Plan ist unten bei „Deine Trainingspläne“. Klick auf die markierte Plan-Card – dann öffnet sich der Plan."
    );

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
        const id = (props.planId ?? "").trim();

        // Wenn wir eine PlanId haben: IMMER zuerst exakt die Card targeten
        if (id) {
            const card = document.querySelector(`[data-plan-id="${CSS.escape(id)}"]`);
            if (card) return card;
        }

        // Fallback: Section (wenn Card noch nicht gerendert ist)
        return document.querySelector(plansSelector.value);
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
        } catch {
            // ignore
        }
    }

    let retryLeft = 0;

    function updateTarget() {
        cancelAnimationFrame(raf);

        // wenn wir eine PlanId haben, geben wir dem Rendern kurz Zeit
        const hasId = !!(props.planId ?? "").trim();
        if (hasId && retryLeft <= 0) retryLeft = 30; // ~30 frames retry

        raf = requestAnimationFrame(() => {
            const el = findTargetEl();
            const rect = getElRect(el);
            target.value = rect;

            // ✅ nur wenn wir wirklich die Plan-Card haben: echten Click listener binden
            const id = (props.planId ?? "").trim();
            const planCard = id
                ? document.querySelector(`[data-plan-id="${CSS.escape(id)}"]`)
                : null;

            bindPlanClick(planCard);

            // Wenn PlanId da ist aber Card noch nicht gefunden wurde -> weiter retryen
            const isCardFound = !!planCard;
            if (id && !isCardFound && retryLeft-- > 0) {
                updateTarget();
            }
        });
    }

    function done() {
        emit("done");
    }

    function skip() {
        emit("skipped");
        emit("done");
    }

    function handleCardClick() {
        const id = (props.planId ?? "").trim();

        const closeAfterOpen = () => {
            requestAnimationFrame(() => {
                done();
            });
        };

        // 1) wenn Parent openPlan liefert -> nutzen
        if (id && props.openPlan) {
            props.openPlan(id);
            closeAfterOpen();
            return;
        }

        // 2) ansonsten: echten Click auf .plan-title dispatchen (wie in deiner Liste)
        const card = id
            ? document.querySelector(`[data-plan-id="${CSS.escape(id)}"]`)
            : null;

        const clickable =
            card?.querySelector(".plan-title") ||
            card?.querySelector('[data-tyg="plan-title"]') ||
            card;

        if (clickable) {
            clickable.dispatchEvent(
                new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
            );
            closeAfterOpen();
            return;
        }

        // fallback: wenn nix gefunden, dann wenigstens Tutorial schließen
        done();
    }


    watch(
        () => [props.isActive, props.planId] as const,
        async ([active]) => {
            if (!active) return;

            await nextTick();
            measureCard();

            const sec = document.querySelector(plansSelector.value);
            scrollTargetIntoView(sec);

            updateTarget();
        },
        { immediate: true }
    );

    function onReflow() {
        if (!props.isActive) return;
        measureCard();
        updateTarget();
    }

    onMounted(() => {
        window.addEventListener("resize", onReflow, { passive: true });
        window.addEventListener("scroll", onReflow, { passive: true });
    });

    onUnmounted(() => {
        window.removeEventListener("resize", onReflow as any);
        window.removeEventListener("scroll", onReflow as any);
        bindPlanClick(null);
        cancelAnimationFrame(raf);
    });

    const highlightStyle = computed(() => {
        if (!target.value) return {};
        const pad = 10;
        const x = clamp(target.value.x - pad, 8, window.innerWidth - 8);
        const y = clamp(target.value.y - pad, 8, window.innerHeight - 8);
        const w = clamp(target.value.w + pad * 2, 40, window.innerWidth - x - 8);
        const h = clamp(target.value.h + pad * 2, 40, window.innerHeight - y - 8);
        return {
            left: `${x}px`,
            top: `${y}px`,
            width: `${w}px`,
            height: `${h}px`,
        };
    });

    const clickCatchStyle = computed(() => {
        // exakt wie highlight, nur bisschen enger
        if (!target.value) return {};
        const pad = 6;
        const x = clamp(target.value.x - pad, 8, window.innerWidth - 8);
        const y = clamp(target.value.y - pad, 8, window.innerHeight - 8);
        const w = clamp(target.value.w + pad * 2, 40, window.innerWidth - x - 8);
        const h = clamp(target.value.h + pad * 2, 40, window.innerHeight - y - 8);
        return {
            left: `${x}px`,
            top: `${y}px`,
            width: `${w}px`,
            height: `${h}px`,
        };
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

        // Abstände
        const gapToPlan = 10;      // Hand <-> Plan Abstand
        const gapHandPopup = 8;    // Hand <-> Popup Abstand
        const handSize = 52;       // grob

        const popupW = Math.min(cardW.value || 360, window.innerWidth - pad * 2);
        const popupH = cardH.value || 210;

        const cx = t.x + t.w / 2;

        const popupLeft = clamp(cx - popupW / 2, pad, window.innerWidth - popupW - pad);
        const handLeft = clamp(cx, 24, window.innerWidth - 24); // mit translateX(-50%)

        // Kandidat: Hand oben, Popup über Hand (Popup -> Hand -> Plan)
        const handTopAbove = t.y - gapToPlan - handSize;
        const popupTopAbove = handTopAbove - gapHandPopup - popupH;

        // Kandidat: Hand unten, Popup unter Hand (Plan -> Hand -> Popup)
        const handTopBelow = t.y + t.h + gapToPlan;
        const popupTopBelow = handTopBelow + handSize + gapHandPopup;

        const fitsAbove = popupTopAbove >= pad;
        const fitsBelow = popupTopBelow + popupH <= window.innerHeight - pad;

        // Prefer: oben wenn möglich, sonst unten
        const above = fitsAbove || !fitsBelow;

        let handTop = above ? handTopAbove : handTopBelow;
        let popupTop = above ? popupTopAbove : popupTopBelow;

        // Clamp für Safety (falls Screen ultra klein)
        handTop = clamp(handTop, pad, window.innerHeight - handSize - pad);
        popupTop = clamp(popupTop, pad, window.innerHeight - popupH - pad);

        return { above, popupTop, popupLeft, handTop, handLeft };
    });

    const handEmoji = computed(() => (layout.value.above ? "👇" : "👆"));

    const handStyle = computed(() => {
        return {
            left: `${layout.value.handLeft}px`,
            top: `${layout.value.handTop}px`,
            transform: "translateX(-50%)",
        };
    });

    const cardStyle = computed(() => {
        return {
            left: `${layout.value.popupLeft}px`,
            top: `${layout.value.popupTop}px`,
        };
    });

</script>

<style scoped>
    .tyg-tut-root {
        position: fixed;
        inset: 0;
        z-index: 50000;
        /* ✅ lässt die Seite normal scrollen/touchen */
        pointer-events: none;
    }

    .tyg-tut-backdrop {
        position: absolute;
        inset: 0;
        /* ✅ nur optisch (bei dir eh transparent), aber darf nix blocken */
        background: transparent;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        pointer-events: none;
        z-index: 1;
    }

    .tyg-tut-card {
        pointer-events: auto;
    }

    .tyg-tut-clickcatch {
        pointer-events: auto;
    }

    .tyg-tut-highlight {
        position: absolute;
        border-radius: 18px;
        border: 3px solid rgba(129, 140, 248, 1);
        box-shadow: 0 0 0 10px rgba(99, 102, 241, 0.28), 0 0 40px rgba(129, 140, 248, 0.55), 0 22px 70px rgba(0, 0, 0, 0.55);
        background: transparent; /* ✅ innen nix abdunkeln */
        animation: pulse 1.2s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            filter: saturate(1);
        }

        50% {
            transform: scale(1.01);
            filter: saturate(1.15);
        }
    }

    @keyframes bob {
        0%, 100% {
            transform: translateY(0) rotate(45deg);
        }

        50% {
            transform: translateY(6px) rotate(45deg);
        }
    }

    .tyg-tut-card {
        position: absolute;
        width: min(360px, calc(100vw - 32px));
        padding: 14px 14px 12px;
        border-radius: 18px;
        background: radial-gradient(circle at 18% 30%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(circle at 85% 75%, rgba(34,197,94,0.16), transparent 60%), rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(148, 163, 184, 0.34);
        box-shadow: 0 22px 70px rgba(0,0,0,0.55);
        color: #e5e7eb;
    }

    .tyg-tut-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 800;
        letter-spacing: .2px;
        margin-bottom: 8px;
    }

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(129, 140, 248, 0.95);
        box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.18);
    }

    .tyg-tut-text {
        line-height: 1.35;
        opacity: 0.95;
        font-size: 0.98rem;
    }

    .tyg-tut-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 12px;
    }

    .btn {
        border-radius: 12px;
        padding: 8px 12px;
        border: 1px solid rgba(148, 163, 184, 0.32);
        background: rgba(2,6,23,0.35);
        color: #e5e7eb;
        cursor: pointer;
        font-weight: 700;
    }

        .btn.primary {
            background: rgba(99,102,241,0.55);
            border-color: rgba(129,140,248,0.75);
        }

        .btn.ghost {
            background: transparent;
        }

    .tyg-tut-clickcatch {
        position: absolute;
        border-radius: 18px;
        cursor: pointer;
        /* Wichtig: blockt nur den Bereich, damit der Click sauber bei uns landet */
        background: transparent;
    }

    .tyg-tut-finger {
        position: absolute;
        font-size: 40px;
        line-height: 1;
        filter: drop-shadow(0 10px 18px rgba(0,0,0,0.6));
        animation: fingerBob 0.9s ease-in-out infinite;
        pointer-events: none;
        z-index: 4;
    }

    @keyframes fingerBob {
        0%, 100% {
            transform: translateY(0) rotate(-6deg);
        }

        50% {
            transform: translateY(10px) rotate(6deg);
        }
    }

    .tyg-tut-hand {
        position: absolute;
        font-size: 44px;
        line-height: 1;
        filter: drop-shadow(0 10px 18px rgba(0,0,0,0.6));
        animation: handBob 0.85s ease-in-out infinite;
        pointer-events: none;
        z-index: 4;
    }

    @keyframes handBob {
        0%, 100% {
            transform: translateX(-50%) translateY(0);
        }

        50% {
            transform: translateX(-50%) translateY(10px);
        }
    }

    .tyg-tut-card {
        z-index: 5;
    }

    .tyg-tut-clickcatch {
        z-index: 6;
    }

</style>
