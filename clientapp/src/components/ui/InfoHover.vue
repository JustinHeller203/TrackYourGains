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
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: help;
        z-index: 2; /* sitzt über dem Titeltext */
    }

        /* Tooltip-Bubble */
        .tooltip .tooltip-text {
            visibility: hidden;
            min-width: 180px;
            max-width: 320px;
            background: rgba(15, 23, 42, 0.96); /* dunkler, klarer Hintergrund */
            color: var(--text-primary); /* immer gut lesbar */
            text-align: left;
            border-radius: 10px;
            padding: 0.75rem 0.9rem;
            position: absolute;
            z-index: 999;
            bottom: 100%;
            left: 50%;
            transform: translate(-50%, -6px); /* leicht über dem Icon */

            font-size: 0.8rem;
            line-height: 1.4;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.85);
            opacity: 0;
            white-space: normal;
            word-wrap: break-word;
            transition: opacity 0.18s ease-out, visibility 0.18s ease-out, transform 0.18s ease-out;
        }

            /* kleiner Pfeil unter der Bubble */
            .tooltip .tooltip-text::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 8px;
                border-style: solid;
                border-color: rgba(15, 23, 42, 0.96) transparent transparent transparent;
            }

        /* Hover-State: klar sichtbar, leicht nach oben */
        .tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
            transform: translate(-50%, -12px);
        }
</style>

