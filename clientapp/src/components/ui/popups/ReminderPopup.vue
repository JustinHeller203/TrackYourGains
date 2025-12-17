<!--ReminderPopup.vue-->
<template>
    <teleport to="body">
        <transition name="rp-fade">
            <div v-if="show"
                 class="rp"
                 role="status"
                 aria-live="polite"
                 :style="{ left: `${x}px`, top: `${y}px` }">
                <div class="rp-inner">
                    <span class="rp-emoji">{{ emoji }}</span>
                    <span class="rp-text">{{ text }}</span>
                </div>
                <span class="rp-arrow" />
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
    withDefaults(
        defineProps<{
            show: boolean
            x: number
            y: number
            text: string
            emoji?: string
        }>(),
        {
            emoji: '💾',
        }
    )
</script>

<style scoped>
    .rp {
        position: fixed;
        z-index: 9999;
        transform: translate(-50%, -100%); /* anchor = bottom center */
        pointer-events: none;
    }

    .rp-inner {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.75rem 0.9rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.16), transparent 60%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.10), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        box-shadow: 0 18px 46px rgba(15, 23, 42, 0.30);
        color: var(--text-primary);
        font-weight: 800;
        line-height: 1.25;
        max-width: min(380px, 86vw);
    }

    .rp-emoji {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        color: #fff;
        flex: 0 0 auto;
    }

    .rp-text {
        font-size: 0.98rem;
        color: var(--text-primary);
    }

    .rp-arrow {
        position: absolute;
        left: 50%;
        bottom: -10px;
        transform: translateX(-50%);
        width: 18px;
        height: 18px;
        background: inherit;
    }

        .rp-arrow::before {
            content: '';
            position: absolute;
            inset: 0;
            transform: rotate(45deg);
            border-right: 1px solid rgba(148, 163, 184, 0.45);
            border-bottom: 1px solid rgba(148, 163, 184, 0.45);
            border-radius: 4px;
            background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.16), transparent 60%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.10), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        }

    html.dark-mode .rp-inner {
        background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 60%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.12), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.55);
        box-shadow: 0 22px 62px rgba(0, 0, 0, 0.65);
    }

    html.dark-mode .rp-text {
        color: #fff;
    }

    html.dark-mode .rp-arrow::before {
        background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.20), transparent 60%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.12), transparent 62%), #020617;
        border-right-color: rgba(148, 163, 184, 0.55);
        border-bottom-color: rgba(148, 163, 184, 0.55);
    }

    .rp-fade-enter-active,
    .rp-fade-leave-active {
        transition: opacity 180ms ease, transform 180ms ease;
    }

    .rp-fade-enter-from,
    .rp-fade-leave-to {
        opacity: 0;
        transform: translate(-50%, -100%) translateY(6px);
    }
</style>
