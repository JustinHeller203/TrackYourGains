<template>
    <div class="icon-btn-wrap">
        <BaseButton :type="type"
                    :title="title"
                    :aria-label="ariaLabel || title"
                    :disabled="disabled"
                    class="download-btn"
                    :class="extraClass"
                    @click="$emit('click', $event)">
            <slot>⬇️</slot>
        </BaseButton>
    </div>
</template>

<script setup lang="ts">
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
        extraClass?: string | string[] | Record<string, boolean>
    }>()

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    /* Basis exakt wie in Training.vue (.edit/.delete/.download/.open-btn) */
    .icon-btn-wrap .action-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #6b7280;
        border-radius: 8px;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
    }

    /* Download-spezifisch: 1:1 wie in Training.vue */
    .icon-btn-wrap .download-btn {
        color: #6b7280;
    }

        .icon-btn-wrap .download-btn:hover {
            color: #5a7bc4;
            text-shadow: 0 0 8px #5a7bc4, 0 0 4px #5a7bc4;
            transform: scale(1.1);
        }

    html.dark-mode .icon-btn-wrap .download-btn:hover {
        color: #5a7bc4;
        text-shadow: 0 0 8px #5a7bc4, 0 0 4px #5a7bc4;
    }
</style>
