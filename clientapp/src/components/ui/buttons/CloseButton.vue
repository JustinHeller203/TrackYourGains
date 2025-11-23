<template>
    <BaseButton :type="type"
                :title="title"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                class="close-btn"
                :class="[variantClass, extraClass]"
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

    const variantClass = computed<string>(() => {
        switch (props.variant) {
            case 'plan': return 'close-plan-btn'
            case 'timer': return 'close-timer-btn'
            case 'stopwatch': return 'close-stopwatch-btn'
            default: return 'close-plan-btn'
        }
    })

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<!-- CloseButton.vue � nur der <style>-Block ge�ndert -->
<style scoped>
    .close-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        font-size: 1.2rem;
        padding: 0.5rem;
        border-radius: 8px;
        background: none;
        border: none;
        cursor: pointer;
        transition: color .2s, text-shadow .2s, transform .1s;
    }

    .close-icon {
        display: inline-block;
        transform: translateY(2px);
    }

    /* ?? jetzt ALLE drei Varianten rot */
    .close-plan-btn,
    .close-timer-btn,
    .close-stopwatch-btn {
        color: #ff6b6b !important;
    }

        .close-plan-btn:hover,
        .close-timer-btn:hover,
        .close-stopwatch-btn:hover {
            color: #b91c1c;
        }

    .close-btn:hover .close-icon {
        transform: translateY(2px) scale(1.1);
    }
</style>

