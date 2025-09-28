<template>
    <BaseButton :type="type"
                :title="title"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                :extraClass="['close-btn', variantClass, extraClass]"
                @click="$emit('click', $event)">
        <span class="close-icon"><slot>✖</slot></span>
    </BaseButton>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    const props = defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
        extraClass?: string | string[] | Record<string, boolean>
        variant?: 'plan' | 'timer' | 'stopwatch'
    }>()

    const variantClass = computed(() =>
        props.variant === 'plan' ? 'close-plan-btn' : 'close-timer-btn'
    )

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    /* Gemeinsame Basis + echte Vertikalzentrierung */
    .close-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1; /* verhindert „extra“ Zeilenabstand */
        vertical-align: middle;
        font-size: 1.2rem;
        padding: 0.5rem;
        border-radius: 8px;
        background: none;
        border: none;
        cursor: pointer;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
    }

    /* NUR das Glyph minimal nach unten schieben */
    .close-icon {
        display: inline-block;
        transform: translateY(2px); /* ggf. auf 1px oder 3px anpassen */
    }

    /* Variantenfarben wie in Training.vue */
    .close-plan-btn,
    .close-timer-btn {
        color: #ff6b6b;
    }

        /* Hover: Scale + Nudge beibehalten */
        .close-plan-btn:hover,
        .close-timer-btn:hover {
            color: #b91c1c;
        }

    .close-btn:hover .close-icon {
        transform: translateY(2px) scale(1.1);
    }

    /* Optional: Dark-Mode bleibt gleich (Farben identisch wie vorher) */
</style>
