<template>
    <BaseButton :title="title"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                :type="type"
                extraClass="edit-btn"
                @click="$emit('click', $event)">
        <slot>✏️</slot>
    </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue'

defineProps<{
  title?: string
  ariaLabel?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

defineEmits<{ (e:'click', ev:MouseEvent): void }>()
</script>

<style scoped>


    .edit-btn {
        color: #6b7280;
    }

        .edit-btn:hover {
            color: #F59E0B;
            text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
            transform: scale(1.1);
        }

    html.dark-mode .edit-btn:hover {
        color: #F59E0B;
        text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
    }


</style>
