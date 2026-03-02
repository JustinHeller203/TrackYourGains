<template>
    <div v-if="show && badge"
         class="achievement-popup-backdrop"
         @click.self="$emit('close')">
        <div class="achievement-popup">
            <div class="achievement-header">
                <span class="achievement-pill">Neues Achievement</span>
                <button class="achievement-close"
                        type="button"
                        aria-label="Achievement schliessen"
                        @click="$emit('close')">
                    x
                </button>
            </div>

            <div class="achievement-body">
                <div class="achievement-icon">
                    <img src="/achievements/FirstStepAchievementIcon.png"
                         alt="Achievement Icon"
                         class="achievement-icon-img" />
                </div>
                <div class="achievement-text">
                    <h4>{{ badge.label }}</h4>
                    <p>{{ badge.desc }}</p>
                </div>
            </div>

            <button class="achievement-cta"
                    type="button"
                    @click="$emit('close')">
                Weiter machen
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { Badge } from '@/utils/achievements'

    defineProps<{
        show: boolean
        badge: Badge | null
    }>()

    defineEmits<{
        (e: 'close'): void
    }>()
</script>

<style scoped>
    .achievement-popup-backdrop {
        position: fixed;
        inset: 0;
        z-index: 5000;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: rgba(10, 14, 26, 0.55);
        backdrop-filter: blur(4px);
    }

    .achievement-popup {
        width: min(560px, 92vw);
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: color-mix(in srgb, var(--bg-card, #101522) 86%, #000 14%);
        box-shadow: 0 28px 60px rgba(2, 6, 23, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
        animation: achievement-pop-in 0.24s ease-out;
        overflow: hidden;
    }

    .achievement-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.9rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: linear-gradient(135deg, color-mix(in srgb, var(--accent-primary, #4B6CB7) 22%, transparent), color-mix(in srgb, var(--accent-secondary, #182848) 18%, transparent));
    }

    .achievement-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #e5eefc;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        padding: 0.35rem 0.65rem;
    }

    .achievement-close {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.08);
        color: #f8fafc;
        cursor: pointer;
        font-size: 1.15rem;
        line-height: 1;
    }

    .achievement-body {
        display: flex;
        gap: 1rem;
        align-items: center;
        padding: 1rem;
    }

    .achievement-icon {
        width: 72px;
        height: 72px;
        border-radius: 16px;
        display: grid;
        place-items: center;
        background: linear-gradient(160deg, color-mix(in srgb, var(--accent-primary, #4B6CB7) 30%, #fff 0%), color-mix(in srgb, var(--accent-secondary, #182848) 30%, #000 0%));
        box-shadow: 0 10px 24px rgba(2, 6, 23, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
    }

    .achievement-icon-img {
        width: 56px;
        height: 56px;
        object-fit: contain;
        display: block;
    }

    .achievement-text h4 {
        margin: 0 0 0.25rem;
        font-size: 1.15rem;
        color: var(--text-main, #f8fafc);
    }

    .achievement-text p {
        margin: 0;
        color: var(--text-muted, #cbd5e1);
        line-height: 1.45;
    }

    .achievement-cta {
        width: calc(100% - 2rem);
        margin: 0 1rem 1rem;
        height: 44px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 800;
        color: #fff;
        background: linear-gradient(135deg, var(--accent-primary, #4B6CB7), var(--accent-secondary, #182848));
    }

    @keyframes achievement-pop-in {
        from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @media (max-width: 560px) {
        .achievement-popup {
            width: 94vw;
        }

        .achievement-body {
            align-items: flex-start;
        }
    }
</style>
