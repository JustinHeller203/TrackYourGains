<!--StopButton.vue-->
<template>
    <BaseButton :type="type"
                :title="title || 'Stop'"
                :aria-label="ariaLabel || title || 'Stop'"
                :disabled="disabled"
                extraClass="timer-btn stop-btn"
                @click="$emit('click', $event)">
        <slot>Stop</slot>
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
    /* Premium-Button-Basis: wie StartButton (Material/Glass/Shadow) */
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

    /* STOP: Rot = Danger, aber gleicher "Premium"-Look */
    .stop-btn {
        color: #fff;
        border-color: rgba(239,68,68,.46);
        background: radial-gradient(circle at 18% 28%, rgba(239,68,68,.34), transparent 60%), radial-gradient(circle at 85% 78%, rgba(244,63,94,.20), transparent 70%), linear-gradient(180deg, rgba(239,68,68,.95), rgba(185,28,28,.92));
        box-shadow: 0 14px 34px rgba(15,23,42,.20), 0 0 0 1px rgba(239,68,68,.22), inset 0 1px 0 rgba(255,255,255,.12);
        text-shadow: 0 1px 0 rgba(0,0,0,.18);
    }

        .stop-btn:hover:not(:disabled) {
            transform: translateY(-1px) scale(1.03);
            border-color: rgba(239,68,68,.70);
            box-shadow: 0 18px 44px rgba(15,23,42,.26), 0 0 0 3px rgba(239,68,68,.22), 0 0 26px rgba(239,68,68,.26), inset 0 1px 0 rgba(255,255,255,.16);
            filter: brightness(1.05) saturate(1.12);
        }

        .stop-btn:active:not(:disabled) {
            transform: translateY(0) scale(1.01);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.06);
        }

    html.dark-mode .stop-btn {
        border-color: rgba(239,68,68,.54);
        background: radial-gradient(circle at 18% 28%, rgba(239,68,68,.26), transparent 60%), radial-gradient(circle at 85% 78%, rgba(244,63,94,.16), transparent 70%), linear-gradient(180deg, rgba(239,68,68,.86), rgba(153,27,27,.90));
        box-shadow: 0 18px 48px rgba(0,0,0,.62), 0 0 0 1px rgba(239,68,68,.24), 0 0 22px rgba(239,68,68,.18), inset 0 1px 0 rgba(255,255,255,.08);
    }

</style>
