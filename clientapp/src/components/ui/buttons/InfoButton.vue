<template>
    <button class="info-btn"
            type="button"
            :aria-label="ariaLabel"
            :title="title || ariaLabel"
            @click="$emit('click')"
            @keydown.enter.prevent="$emit('click')"
            >
        <span class="info-emoji" aria-hidden="true">ℹ️</span>
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        ariaLabel: string
        title?: string
    }>()

    defineEmits<{
        (e: 'click'): void
    }>()
</script>

<style scoped>
    @keyframes infoPulse {
        0%, 100% {
            --info-pulse-scale: 1;
            opacity: 1;
            filter: drop-shadow(0 0 0 rgba(99, 102, 241, 0));
        }

        50% {
            --info-pulse-scale: 1.07;
            opacity: 0.72;
            filter: drop-shadow(0 0 4px rgba(99, 102, 241, 0.16));
        }
    }

    .info-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;
        padding: 0.1rem;
        cursor: pointer;
        line-height: 1;
        border-radius: 10px;
        transition: transform 0.12s ease, background 0.12s ease;
    }

        .info-btn:hover {
            transform: translateY(-1px);
            background: rgba(148, 163, 184, 0.14);
        }

        .info-btn:active {
            transform: translateY(0px) scale(0.98);
        }

    .info-emoji {
        font-size: 1rem;
        display: inline-block;
        transform-origin: center;
        transform: scale(var(--info-pulse-scale, 1));
        animation: infoPulse 1.45s ease-in-out infinite;
        will-change: transform, filter;
    }
</style>
