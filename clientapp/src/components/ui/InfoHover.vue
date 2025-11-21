<template>
    <span class="tooltip" role="note" aria-label="Info">
        ℹ️
        <span class="tooltip-text"><slot>{{ text }}</slot></span>
    </span>
</template>

<script setup lang="ts">
defineProps<{ text?: string }>()
</script>

<style scoped>
    .tooltip {
        position: relative;
        display: inline-block;
        cursor: help
    }

        .tooltip .tooltip-text {
            visibility: hidden;
            min-width: 150px;
            max-width: 300px;
            background: var(--bg-card);
            color: var(--text-tooltip);
            text-align: left;
            border-radius: 8px;
            padding: .75rem;
            position: absolute;
            z-index: 1000;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            font-size: .8rem;
            box-shadow: var(--shadow);
            opacity: 0;
            transition: opacity .3s,visibility .3s;
            white-space: normal;
            word-wrap: break-word
        }

            .tooltip .tooltip-text::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 8px;
                border-style: solid;
                border-color: var(--bg-card) transparent transparent transparent
            }

        .tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1
        }
</style>
