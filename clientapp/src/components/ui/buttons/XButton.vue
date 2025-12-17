<!--XButton.vue-->

<template>
    <button type="button"
            class="x-btn"
            :aria-label="ariaLabel"
            :title="title || ariaLabel"
            @click="$emit('click')">
        <slot>×</slot>
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        ariaLabel?: string
        title?: string
    }>()

    defineEmits<{
        (e: 'click'): void
    }>()
</script>

<style scoped>
    .x-btn {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        border: none;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        font-size: 1.4rem;
        line-height: 1;
        flex: 0 0 auto;
        transition: transform 140ms ease, background 180ms ease, opacity 140ms ease;
    }

        .x-btn:hover {
            transform: translateY(-1px);
            background: rgba(148, 163, 184, 0.10);
        }

        .x-btn:active {
            transform: translateY(0);
            background: rgba(148, 163, 184, 0.14);
        }

        .x-btn:focus-visible {
            outline: none;
            background: rgba(129, 140, 248, 0.12);
        }
</style>
