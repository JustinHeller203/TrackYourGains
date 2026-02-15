<!--components/ui/buttons/glocks/StartButton.vue-->

<template>
    <BaseButton :type="type"
                :title="title || 'Start'"
                :aria-label="ariaLabel || title || 'Start'"
                :disabled="disabled"
                extraClass="timer-btn start-btn"
                @click="$emit('click', $event)">
        <slot>Start</slot>
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
    /* Premium-Button-Basis: passt zu deinen Cards */
    .timer-btn {
        padding: 0.72rem 1.15rem;
        border: 1px solid rgba(148, 163, 184, 0.22);
        border-radius: 14px;
        cursor: pointer;
        font-size: 0.92rem;
        font-weight: 800;
        letter-spacing: -0.01em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .5rem;
        line-height: 1;
        vertical-align: middle;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255,255,255,0.06);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, filter .15s ease;
    }

        .timer-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
            filter: saturate(.85);
        }

        .timer-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 22%, transparent), 0 16px 36px rgba(15, 23, 42, 0.22);
        }

    .start-btn:active:not(:disabled) {
        transform: translateY(0) scale(1.01);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.06);
    }

    /* START: Glass-Button im selben Material wie Selects/Displays */
    .start-btn {
        color: #fff;
        border-color: rgba(16,185,129,.42);
        background: radial-gradient(circle at 18% 28%, rgba(16,185,129,.38), transparent 60%), radial-gradient(circle at 85% 78%, rgba(132,204,22,.22), transparent 70%), linear-gradient(180deg, rgba(16,185,129,.95), rgba(5,150,105,.92));
        box-shadow: 0 14px 34px rgba(15,23,42,.20), 0 0 0 1px rgba(16,185,129,.22), inset 0 1px 0 rgba(255,255,255,.12);
        text-shadow: 0 1px 0 rgba(0,0,0,.18);
    }

        .start-btn:hover:not(:disabled) {
            transform: translateY(-1px) scale(1.03);
            border-color: rgba(16,185,129,.68);
            box-shadow: 0 18px 44px rgba(15,23,42,.26), 0 0 0 3px rgba(16,185,129,.22), 0 0 26px rgba(16,185,129,.28), inset 0 1px 0 rgba(255,255,255,.16);
            filter: brightness(1.05) saturate(1.15);
        }

    /* Dark Mode: gleiche Farbe, nur "deeper" + mehr Neon */
    html.dark-mode .start-btn {
        border-color: rgba(16,185,129,.50);
        background: radial-gradient(circle at 18% 28%, rgba(16,185,129,.30), transparent 60%), radial-gradient(circle at 85% 78%, rgba(132,204,22,.18), transparent 70%), linear-gradient(180deg, rgba(16,185,129,.86), rgba(4,120,87,.90));
        box-shadow: 0 18px 48px rgba(0,0,0,.62), 0 0 0 1px rgba(16,185,129,.26), 0 0 22px rgba(16,185,129,.20), inset 0 1px 0 rgba(255,255,255,.08);
    }
</style>
