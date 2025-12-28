<template>
    <BaseButton :type="type"
                :title="title || 'Runde'"
                :aria-label="ariaLabel || title || 'Runde'"
                :disabled="disabled"
                extraClass="timer-btn lap-btn"
                @click="$emit('click', $event)">
        <slot>Runde</slot>
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
    /* Premium-Button-Basis: wie Start/Reset/Stop */
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

    /* RUNDE: Blau = klarer Call-to-Action, aber clean */
    .lap-btn {
        color: #fff;
        border-color: color-mix(in srgb, #3b82f6 55%, rgba(148,163,184,.22));
        background: radial-gradient(circle at 22% 28%, color-mix(in srgb, #60a5fa 38%, transparent), transparent 60%), radial-gradient(circle at 85% 78%, color-mix(in srgb, #2563eb 24%, transparent), transparent 70%), linear-gradient(180deg, rgba(59,130,246,.92), rgba(37,99,235,.92));
        box-shadow: 0 14px 34px rgba(15,23,42,.20), 0 0 0 1px rgba(59,130,246,.18), inset 0 1px 0 rgba(255,255,255,.10);
        text-shadow: 0 1px 0 rgba(0,0,0,.18);
        filter: saturate(1.06);
    }

        .lap-btn:hover:not(:disabled) {
            transform: translateY(-1px) scale(1.03);
            border-color: color-mix(in srgb, #3b82f6 80%, rgba(148,163,184,.18));
            box-shadow: 0 18px 44px rgba(15,23,42,.26), 0 0 0 3px rgba(59,130,246,.20), 0 0 22px rgba(59,130,246,.18), inset 0 1px 0 rgba(255,255,255,.14);
            filter: brightness(1.05) saturate(1.12);
        }

        .lap-btn:active:not(:disabled) {
            transform: translateY(0) scale(1.01);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.06);
        }

    html.dark-mode .lap-btn {
        border-color: rgba(59,130,246,.42);
        background: radial-gradient(circle at 22% 28%, rgba(96,165,250,.24), transparent 60%), radial-gradient(circle at 85% 78%, rgba(37,99,235,.18), transparent 70%), linear-gradient(180deg, rgba(59,130,246,.78), rgba(29,78,216,.90));
        box-shadow: 0 18px 48px rgba(0,0,0,.62), 0 0 0 1px rgba(59,130,246,.16), inset 0 1px 0 rgba(255,255,255,.08);
    }

</style>
