<!--components/ui/TygTutorials/PlanCreatedTutorial.vue-->
<template>
    <BaseTutorial :isActive="isActive"
                  :selector="targetSelector"
                  :fallbackSelector="plansSelector"
                  :title="stepTitle"
                  :retryFrames="planId ? 30 : 20"
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

    function onBaseReady(_: { target: Rect | null }) {
        const el = planId.value
            ? document.querySelector(`[data-plan-id="${CSS.escape(planId.value)}"]`)
            : null;
        bindPlanClick(el);
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
            if (!active) return;

            // Falls ready-event vorher kam: nach Render nochmal binden
            await nextTick();
            const el = planId.value
                ? document.querySelector(`[data-plan-id="${CSS.escape(planId.value)}"]`)
                : null;
            bindPlanClick(el);
        },
        { immediate: true }
    );

    onUnmounted(() => {
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
