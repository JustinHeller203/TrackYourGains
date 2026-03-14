<template>
    <BasePopup :show="show && !!badge"
               overlayClass="global-achievement-popup"
               :show-actions="false"
               @cancel="$emit('close')">
        <div v-if="badge" class="achievement-root">
            <div class="achievement-body">
                <div class="achievement-icon">
                    <img src="/achievements/FirstStepAchievementIcon.png"
                         alt="Achievement Icon"
                         class="achievement-icon-img" />
                </div>
                <div class="achievement-text">
                    <div class="achievement-pill">Freigeschaltet</div>
                    <h4>{{ badge.label }}</h4>
                    <p>{{ badge.desc }}</p>
                </div>
            </div>
        </div>

        <template #actions>
            <button class="achievement-cta"
                    type="button"
                    @click="$emit('close')">
                Weiter
            </button>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import type { Badge } from '@/utils/achievements'

    defineProps<{
        show: boolean
        badge: Badge | null
    }>()

    defineEmits<{
        (e: 'close'): void
    }>()
</script>

<style>
    .achievement-root {
        display: flex;
        flex-direction: column;
    }

    .achievement-body {
        display: grid;
        grid-template-columns: 76px minmax(0, 1fr);
        gap: 0.8rem;
        align-items: start;
    }

    .achievement-icon {
        width: 76px;
        height: 76px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.08);
    }

    .achievement-icon-img {
        width: 52px;
        height: 52px;
        object-fit: contain;
        display: block;
    }

    .achievement-text {
        display: grid;
        gap: 0.34rem;
        align-content: start;
    }

    .achievement-pill {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        font-size: 0.64rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--text-secondary);
        border: 1px solid rgba(148, 163, 184, 0.28);
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.08);
        padding: 0.14rem 0.46rem;
    }

    .achievement-text h4 {
        margin: 0;
        font-size: 1.08rem;
        line-height: 1.2;
        color: var(--text-primary);
    }

    .achievement-text p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.45;
        font-size: 0.9rem;
    }

    .achievement-cta {
        width: 100%;
        min-height: 42px;
        padding: 0.66rem 0.9rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        background: rgba(15, 23, 42, 0.06);
        color: var(--text-primary);
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
    }

    .achievement-cta:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(148, 163, 184, 0.32));
        background: color-mix(in srgb, var(--accent-primary) 9%, rgba(15, 23, 42, 0.06));
    }

    .achievement-cta:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--accent-primary) 70%, #fff 30%);
        outline-offset: 2px;
    }

    @media (max-width: 560px) {
        .achievement-body {
            grid-template-columns: 64px minmax(0, 1fr);
            gap: 0.62rem;
        }

        .achievement-icon {
            width: 64px;
            height: 64px;
        }

        .achievement-icon-img {
            width: 42px;
            height: 42px;
        }

        .achievement-text h4 {
            font-size: 1rem;
        }
    }
</style>
