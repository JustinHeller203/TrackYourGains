<!--Pfad: components/ui/buttons/SettingsSaveButton.vue-->
<template>
    <button class="save-button"
            type="button"
            :disabled="disabled"
            :title="title || t('settings.saveTitle')"
            @click="$emit('click')">
        <slot>{{ label || t('settings.save') }}</slot>
    </button>
</template>

<script setup lang="ts">
    import { useI18n } from '@/composables/useI18n'

    const { t } = useI18n()

    defineProps<{
        disabled?: boolean
        title?: string
        label?: string
    }>()

    defineEmits<{
        (e: 'click'): void
    }>()
</script>

<style scoped>
    .save-button {
        position: relative;
        overflow: hidden;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 56%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        color: var(--text-primary);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 18px;
        padding: 1rem 2.5rem;
        font-size: 1.1rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 160ms ease-out, border-color 180ms ease-out, box-shadow 200ms ease-out, background 180ms ease-out;
    }

    .save-button:hover {
        transform: translateY(-2px);
        border-color: rgba(129, 140, 248, 0.7);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.32);
    }

    .save-button:active {
        transform: translateY(0);
    }

    .save-button::after {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.18), transparent 60%);
        opacity: 0;
        pointer-events: none;
        transition: opacity 160ms ease-out;
    }

    .save-button:hover::after {
        opacity: 1;
    }

    .save-button:focus-visible {
        outline: none;
        border-color: rgba(129, 140, 248, 0.85);
        box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.18), 0 22px 48px rgba(15, 23, 42, 0.32);
    }

    @keyframes sheen {
        to {
            transform: translateX(60%);
        }
    }

    html.dark-mode .save-button {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
        color: #ffffff;
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .save-button:hover {
        border-color: rgba(129, 140, 248, 0.7);
    }
</style>
