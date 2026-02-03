<template>
  <BaseButton
    :type="type"
    :title="title || 'Reset'"
    :aria-label="ariaLabel || title || 'Reset'"
    :disabled="disabled"
    extraClass="timer-btn reset-btn"
    @click="$emit('click', $event)"
  >
    <slot>Reset</slot>
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

defineEmits<{ (e:'click', ev:MouseEvent): void }>()
</script>

<style scoped>
    /* Premium-Button-Basis: wie Start/Stop (Material/Glass/Shadow) */
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

    /* RESET: Grau/Slate = neutral, aber trotzdem "Premium" */
    .reset-btn {
        color: #fff;
        border-color: rgba(148,163,184,.34);
        background: radial-gradient(circle at 18% 28%, rgba(148,163,184,.26), transparent 60%), radial-gradient(circle at 85% 78%, rgba(100,116,139,.18), transparent 70%), linear-gradient(180deg, rgba(107,114,128,.92), rgba(71,85,105,.92));
        box-shadow: 0 14px 34px rgba(15,23,42,.18), 0 0 0 1px rgba(148,163,184,.18), inset 0 1px 0 rgba(255,255,255,.10);
        text-shadow: 0 1px 0 rgba(0,0,0,.18);
    }

        .reset-btn:hover:not(:disabled) {
            transform: translateY(-1px) scale(1.03);
            border-color: rgba(148,163,184,.56);
            box-shadow: 0 18px 44px rgba(15,23,42,.22), 0 0 0 3px rgba(148,163,184,.18), 0 0 22px rgba(148,163,184,.16), inset 0 1px 0 rgba(255,255,255,.14);
            filter: brightness(1.04) saturate(1.06);
        }

        .reset-btn:active:not(:disabled) {
            transform: translateY(0) scale(1.01);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.06);
        }

    html.dark-mode .reset-btn {
        border-color: rgba(148,163,184,.42);
        background: radial-gradient(circle at 18% 28%, rgba(148,163,184,.16), transparent 60%), radial-gradient(circle at 85% 78%, rgba(100,116,139,.12), transparent 70%), linear-gradient(180deg, rgba(100,116,139,.78), rgba(51,65,85,.88));
        box-shadow: 0 18px 48px rgba(0,0,0,.62), 0 0 0 1px rgba(148,163,184,.16), inset 0 1px 0 rgba(255,255,255,.08);
    }

</style>
