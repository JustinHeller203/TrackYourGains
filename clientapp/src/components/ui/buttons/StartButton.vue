<template>
    <BaseButton :type="type"
                :title="title || 'Start'"
                :aria-label="ariaLabel || title || 'Start'"
                :disabled="disabled"
                extraClass="timer-btn start-btn"
                @click="$emit('click', $event)">
        <slot>Start</slot>
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
    /* Basis wie in Training.vue (.timer-btn) + Zentrierung */
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

    /* Start-Variante */
    .start-btn {
        background: #10b981;
        color: #ffffff;
    }

        .start-btn:hover {
            background: #064e3b;
            transform: scale(1.05);
        }
</style>
