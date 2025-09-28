<template>
    <BaseButton :type="type"
                :title="title || 'Runde'"
                :aria-label="ariaLabel || title || 'Runde'"
                :disabled="disabled"
                extraClass="timer-btn lap-btn"
                @click="$emit('click', $event)">
        <slot>Runde</slot>
    </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/buttons/BaseButton.vue'

defineProps<{
  type?: 'button' | 'submit' | 'reset'
  title?: string
  ariaLabel?: string
  disabled?: boolean
}>()

defineEmits<{ (e:'click', ev:MouseEvent): void }>()
</script>

<style scoped>
    /* gleiche Basis-Optik wie in Training.vue */
    .timer-btn {
        padding: .75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: .9rem;
        transition: background .2s, transform .1s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        vertical-align: middle;
    }

        .timer-btn:disabled {
            opacity: .5;
            cursor: not-allowed;
            transform: none;
        }

    .lap-btn {
        background: #4B6CB7;
        color: #fff;
    }

        .lap-btn:hover {
            background: #3b5ca8;
            transform: scale(1.05);
        }
</style>
