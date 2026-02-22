<!-- components/ui/TygTutorials/PlanBuilderTutorial.vue -->
<template>
    <BaseTutorial :isActive="isActive"
                  :selector="step?.selector"
                  :fallbackSelector="fallbackSelector ?? '.builder-section'"
                  :title="step?.title"
                  accent="#ef4444">
        <template #default>
            <div class="tyg-tut-text">
                {{ step?.text }}
            </div>
        </template>

        <template #actions>
            <button type="button" class="btn ghost" @click="skip">Skip</button>
            <button type="button" class="btn primary" @click="next">
                {{ isLast ? "Fertig" : "Weiter" }}
            </button>
        </template>
    </BaseTutorial>
</template>
<script setup lang="ts">
    import { computed, nextTick, ref, watch } from "vue";
    import BaseTutorial from "./BaseTutorial.vue";

    type Step = { title: string; text: string; selector: string };

    const props = defineProps<{
        isActive: boolean;
        steps: Step[];
        fallbackSelector?: string;
    }>();

    const emit = defineEmits<{ (e: "done"): void }>();

    const stepIndex = ref(0);
    const step = computed(() => props.steps[stepIndex.value] ?? null);

    const isLast = computed(() => stepIndex.value >= props.steps.length - 1);

    function next() {
        if (isLast.value) {
            emit("done");
            return;
        }
        stepIndex.value++;
        nextTick(); // reicht, BaseTutorial reagiert auf selector-change
    }

    function skip() {
        emit("done");
    }

    watch(
        () => props.isActive,
        async (active) => {
            if (!active) return;
            stepIndex.value = 0;
            await nextTick();
        },
        { immediate: true }
    );
</script>

<style scoped>
    .tyg-tut-text {
        line-height: 1.35;
        opacity: 0.95;
        font-size: 0.98rem;
    }
</style>
