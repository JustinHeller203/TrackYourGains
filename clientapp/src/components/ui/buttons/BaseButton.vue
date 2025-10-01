<template>
    <button class="action-btn"
            :class="extraClass"
            :type="type"
            :title="title || ariaLabel"
            :aria-label="ariaLabel || title"
            :disabled="disabled"
            @click="$emit('click', $event)">
        <slot />
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
        extraClass?: string | string[] | Record<string, boolean>
    }>()

    defineEmits<{
        (e: 'click', ev: MouseEvent): void
    }>()
</script>
<style scoped>
    /* Primary-Look für beide Buttons */
    .action-btn.add-exercise-btn,
    .action-btn.toggle-exercise-btn {
        background: linear-gradient(45deg, #4B6CB7, #182848);
        color: #fff;
        min-height: var(--control-height, 48px);
        padding: 0 var(--control-padding-x, 1.5rem);
        font-size: var(--control-font-size, 0.95rem);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        transition: background .2s, transform .2s, opacity .2s;
    }

        .action-btn.add-exercise-btn:hover,
        .action-btn.toggle-exercise-btn:hover {
            background: linear-gradient(45deg, #5a7bc4, #2a3b6a);
            transform: none;
        }

        .action-btn.add-exercise-btn:disabled,
        .action-btn.toggle-exercise-btn:disabled {
            opacity: .5;
            cursor: not-allowed;
            transform: none;
        }
</style>
