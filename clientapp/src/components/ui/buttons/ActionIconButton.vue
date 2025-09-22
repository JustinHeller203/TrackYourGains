<template>
    <BaseButton :type="type"
                :title="title"
                :aria-label="ariaLabel"
                :disabled="disabled"
                @click="$emit('click', $event)">
        <slot>⬇️</slot>
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

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    /* exakt wie vorher in Progress.vue (.plan-card .action-btn), nur jetzt lokal */
    .action-btn {
        background: none;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        color: var(--text-secondary);
        transition: color 0.3s ease;
        padding: 0.25rem;
    }

        .action-btn:hover {
            color: var(--accent-primary);
        }
</style>
