<template>
    <BaseButton :type="type"
                :title="title || 'Hinzufügen'"
                :aria-label="ariaLabel || title || 'Hinzufügen'"
                :disabled="disabled"
                :extraClass="'add-btn'"
                @click="$emit('click', $event)">
        <slot>+</slot>
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
    .add-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        color: #10b981;
        border-radius: 8px;
        transition: transform .1s ease, color .2s ease;
        display: inline-flex; /* saubere Zentrierung */
        align-items: center;
        justify-content: center;
        line-height: 1;
        vertical-align: middle;
        transform: translateY(1px); /* mini Nudge nach unten wie bei den anderen */
    }

        .add-btn:hover {
            color: #064e3b;
            transform: translateY(1px) scale(1.1);
        }
</style>
