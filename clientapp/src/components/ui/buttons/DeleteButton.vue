<!--Pfad: components/ui/buttons/DeleteButton.vue-->

<template>
    <BaseButton :title="title || 'Plan löschen'"
                :aria-label="ariaLabel || title || 'Plan löschen'"
                :disabled="disabled"
                :type="type"
                extraClass="delete-btn"
                @click="$emit('click', $event)">
        <slot>🗑️</slot>
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
    .delete-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #6b7280;
        border-radius: 8px;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
    }

    .table-delete-btn.transparent {
        background: transparent !important;
        box-shadow: none !important;
    }

    .delete-btn:hover,
    .table-delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px rgba(127, 29, 29, 0.5), 0 0 4px rgba(127, 29, 29, 0.5);
        transform: scale(1.1);
    }

    .delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px rgba(127, 29, 29, 0.5), 0 0 4px rgba(127, 29, 29, 0.5);
        transform: scale(1.1);
    }

    html.dark-mode .delete-btn:hover,
    html.dark-mode .table-delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px #7f1d1d, 0 0 4px #7f1d1d;
    }
</style>
