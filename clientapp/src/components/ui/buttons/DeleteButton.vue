<template>
    <BaseButton :title="title || 'Plan lÃ¶schen'"
                :aria-label="ariaLabel || title || 'Plan lÃ¶schen'"
                :disabled="disabled"
                :type="type"
                extraClass="delete-btn"
                @click="$emit('click', $event)">
        <slot>ðŸ—‘ï¸</slot>
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
        cursor: pointer;
        font-size: 1.1rem;
        color: #6b7280;
        transition: transform 0.2s ease;
    }

    .table-delete-btn.transparent {
        background: transparent !important;
        box-shadow: none !important;
    }

    html.dark-mode .delete-btn:hover,
    html.dark-mode .table-delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px #7f1d1d, 0 0 4px #7f1d1d;
    }

    .delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px rgba(127, 29, 29, 0.5), 0 0 4px rgba(127, 29, 29, 0.5);
        transform: scale(1.1);
    }

    html.dark-mode .delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px #7f1d1d, 0 0 4px #7f1d1d;
    }
</style>
