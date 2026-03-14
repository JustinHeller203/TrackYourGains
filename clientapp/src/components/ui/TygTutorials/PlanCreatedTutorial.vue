<!--components/ui/TygTutorials/PlanCreatedTutorial.vue-->
<template>
    <BaseTutorial :isActive="isActive"
                  :selector="targetSelector"
                  :fallbackSelector="plansSelector"
                  :title="stepTitle"
                  :retryFrames="planId ? 30 : 20"
                  :autoScroll="false"
                  accent="#ef4444"
                  @ready="onBaseReady">
        <template #default>
            <div class="tyg-tut-text">{{ stepText }}</div>
        </template>

        <template #actions>
            <button type="button" class="btn ghost" @click="skip">Skip</button>
            <button type="button" class="btn primary" @click="handleCardClick">
                Plan öffnen ✅
            </button>
        </template>
    </BaseTutorial>
</template>

<script setup lang="ts">
    import { computed, nextTick, onUnmounted, watch } from "vue";
    import BaseTutorial from "./BaseTutorial.vue";

    type Rect = { x: number; y: number; w: number; h: number };

    const props = defineProps<{
        isActive: boolean;
        planId: string | null;
        openPlan?: (planId: string) => void;
        plansSectionSelector?: string; // default: [data-tyg="plans-section"]
    }>();

    const emit = defineEmits<{
        (e: "done"): void;
        (e: "skipped"): void;
    }>();

    const plansSelector = computed(() => props.plansSectionSelector ?? '[data-tyg="plans-section"]');

    const stepTitle = computed(() => "Plan erstellt 🎉");
    const stepText = computed(
        () =>
            "Dein neuer Plan ist unten bei „Deine Trainingspläne“. Klick auf die markierte Plan-Card – dann öffnet sich der Plan."
    );

    const planId = computed(() => (props.planId ?? "").trim());

    const targetSelector = computed(() => {
        if (!planId.value) return "";
        return `[data-plan-id="${CSS.escape(planId.value)}"]`;
    });

    let boundPlanEl: Element | null = null;
    let scrollTimeout: number | null = null;
    let scrollRaf = 0;

    function done() {
        emit("done");
    }

    function skip() {
        emit("skipped");
        emit("done");
    }

    function closeTutorialNextFrame() {
        requestAnimationFrame(() => done());
    }

    function onPlanRealClick() {
        closeTutorialNextFrame();
    }

    function bindPlanClick(el: Element | null) {
        if (boundPlanEl === el) return;

        if (boundPlanEl) boundPlanEl.removeEventListener("click", onPlanRealClick);
        boundPlanEl = el;
        if (boundPlanEl) boundPlanEl.addEventListener("click", onPlanRealClick);
    }

    function getPlanCardEl() {
        return planId.value
            ? document.querySelector(`[data-plan-id="${CSS.escape(planId.value)}"]`) as HTMLElement | null
            : null;
    }

    function clearPendingScroll() {
        if (scrollTimeout != null) {
            window.clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        if (scrollRaf) {
            cancelAnimationFrame(scrollRaf);
            scrollRaf = 0;
        }
    }

    function scrollPlanCardIntoView(el: HTMLElement | null) {
        if (!el) return;

        const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        const runScroll = (targetEl: HTMLElement, behavior: ScrollBehavior) => {
            const rect = targetEl.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
            const targetCenterY = rect.top + window.scrollY + (rect.height / 2);
            const top = Math.max(0, targetCenterY - (viewportHeight / 2));
            window.scrollTo({ top, behavior });
        };

        clearPendingScroll();

        let attemptsLeft = 10;
        const settleScroll = () => {
            const currentEl = getPlanCardEl();
            if (!currentEl) {
                scrollRaf = 0;
                return;
            }

            const rect = currentEl.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
            const viewportCenter = viewportHeight / 2;
            const cardCenter = rect.top + (rect.height / 2);
            const delta = Math.abs(cardCenter - viewportCenter);

            runScroll(currentEl, attemptsLeft === 10 && !prefersReduced ? "smooth" : "auto");

            attemptsLeft -= 1;
            if (attemptsLeft <= 0 || delta <= 24) {
                scrollRaf = 0;
                return;
            }

            scrollRaf = requestAnimationFrame(() => {
                scrollTimeout = window.setTimeout(() => {
                    settleScroll();
                }, 90);
            });
        };

        settleScroll();
    }

    function onBaseReady(_: { target: Rect | null }) {
        const el = getPlanCardEl();
        bindPlanClick(el);
        scrollPlanCardIntoView(el);
    }

    function handleCardClick() {
        const id = planId.value;

        const closeAfterOpen = () => requestAnimationFrame(() => done());

        if (id && props.openPlan) {
            props.openPlan(id);
            closeAfterOpen();
            return;
        }

        const card = id ? document.querySelector(`[data-plan-id="${CSS.escape(id)}"]`) : null;

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

        done();
    }

    watch(
        () => [props.isActive, props.planId] as const,
        async ([active]) => {
            clearPendingScroll();
            if (!active) return;

            // Falls ready-event vorher kam: nach Render nochmal binden
            await nextTick();
            const el = getPlanCardEl();
            bindPlanClick(el);
            scrollPlanCardIntoView(el);
        },
        { immediate: true }
    );

    onUnmounted(() => {
        clearPendingScroll();
        bindPlanClick(null);
    });
</script>

<style scoped>
    .tyg-tut-text {
        line-height: 1.35;
        opacity: 0.95;
        font-size: 0.98rem;
    }
</style>
