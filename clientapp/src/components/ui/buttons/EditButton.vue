<!--Pfad: components/ui/buttons/EditButton.vue-->
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

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    .edit-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #6b7280;
        border-radius: 8px;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
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
