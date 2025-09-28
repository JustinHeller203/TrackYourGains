<template>
    <BaseButton :type="type"
                :title="title || 'Stop'"
                :aria-label="ariaLabel || title || 'Stop'"
                :disabled="disabled"
                extraClass="timer-btn stop-btn"
                @click="$emit('click', $event)">
        <slot>Stop</slot>
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
    /* wie in Training.vue (.timer-btn), plus saubere Zentrierung */
    .timer-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        vertical-align: middle;
    }

        .timer-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

    /* Stop-Variante */
    .stop-btn {
        background: #ef4444;
        color: #ffffff;
    }

        .stop-btn:hover {
            background: #b91c1c;
            transform: scale(1.05);
        }
</style>
