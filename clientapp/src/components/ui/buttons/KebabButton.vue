<!--Pfad: components/ui/buttons/KebabButton.vue-->
<template>
    <BaseButton :title="title || 'Mehr'"
                :aria-label="ariaLabel || title || 'Mehr'"
                :disabled="disabled"
                :type="type"
                :extraClass="extraClass ? ['kebab-btn', extraClass] : ['kebab-btn']"
                @click="$emit('click', $event)">
        <slot>⋮</slot>
    </BaseButton>
</template>

<script setup lang="ts">
    import BaseButton from './BaseButton.vue'

    defineProps<{
        title?: string
        ariaLabel?: string
        disabled?: boolean
        type?: 'button' | 'submit' | 'reset'
        extraClass?: string
    }>()

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    .kebab-btn {
        /* kompakter Icon-Button Look */
        line-height: 1;
        font-size: 1.15rem;
        width: 34px;
        height: 34px;
        padding: 0;
        border-radius: 12px;
        display: grid;
        place-items: center;
        /* glassy + passend zum Rest */
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.18);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        color: var(--text-primary);
        opacity: 0.9;
        transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, background .15s ease, opacity .15s ease;
    }

        .kebab-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

    @media (hover:hover) {
        .kebab-btn:not(:disabled):hover {
            transform: translateY(-1px);
            opacity: 1;
            border-color: rgba(129, 140, 248, 0.45);
            box-shadow: 0 14px 34px rgba(15, 23, 42, 0.26);
            background: rgba(255, 255, 255, 0.085);
        }
    }

    .kebab-btn:not(:disabled):active {
        transform: translateY(0px) scale(0.98);
        opacity: 1;
    }
</style>
