<template>
    <BaseButton :type="type"
                :title="title"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                :extraClass="['add-exercise-btn', extraClass]"
                @click="$emit('click', $event)">
        <slot>Übung hinzufügen</slot>
    </BaseButton>
</template>

<script setup lang="ts">
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    withDefaults(defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
        /** optional weitere Klassen vom Parent */
        extraClass?: string | string[] | Record<string, boolean>
    }>(), {
        type: 'button',
        title: 'Übung hinzufügen',
        disabled: false,
    })
    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    /* exakt wie die .form-card button Styles in Training.vue – lokal angewandt */
    .add-exercise-btn {
        background: linear-gradient(45deg, #4B6CB7, #182848);
        color: #ffffff;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s, opacity 0.2s;
        display: inline-flex; /* schöne vertikale Zentrierung */
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

        .add-exercise-btn:hover {
            background: linear-gradient(45deg, #5a7bc4, #2a3b6a);
            transform: scale(1.05);
        }

        .add-exercise-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
</style>
