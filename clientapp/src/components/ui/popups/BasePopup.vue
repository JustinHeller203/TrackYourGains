<template>
    <teleport to="body">
        <transition name="fade">
            <div v-if="show"
                 class="popup-overlay"
                 :class="[overlayClass, variant]"
                 role="dialog"
                 aria-modal="true"
                 @mousedown.self="$emit('cancel')">
                <div class="popup" @click.stop>
                    <h3 v-if="title" class="popup-title">{{ title }}</h3>

                    <div class="popup-body">
                        <slot />
                    </div>

                    <div class="popup-actions" v-if="$slots.actions || showActions">
                        <slot name="actions">
                            <button class="popup-btn cancel-btn" type="button" @click="$emit('cancel')">
                                {{ cancelText }}
                            </button>
                            <button class="popup-btn save-btn" type="button" @click="$emit('save')">
                                {{ saveText }}
                            </button>
                        </slot>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup lang="ts">
    withDefaults(defineProps<{
        show: boolean
        title?: string
        overlayClass?: string | string[] | Record<string, boolean>
        variant?: string
        showActions?: boolean
        cancelText?: string
        saveText?: string
    }>(), {
        cancelText: 'Abbrechen',
        saveText: 'Speichern',
    })
    defineEmits<{ (e: 'cancel'): void; (e: 'save'): void }>()
</script>


<style scoped>
    /* === Overlay & Container === */
    .popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }


    /* Titel � vorher war das 0.25rem (!) */
    .popup-title {
        font-size: var(--popup-title-size, 1.25rem);
        line-height: 1.25;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    /* Body � Grundschriftgr��e */
    .popup-body {
        font-size: var(--popup-body-size, 1rem);
    }

        /* === Body (slotted content styling) === */
        .popup-body :deep(.input-group) {
            margin-bottom: 1rem;
        }

        .popup-body :deep(label) {
            display: block;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.35rem;
        }

        .popup-body :deep(.edit-input) {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-color);
            font-size: 0.95rem;
            transition: border-color 0.3s, box-shadow 0.3s;
        }

        .popup-body :deep(.edit-input:focus) {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99,102,241,.5);
            outline: none;
        }

    /* Varianten-Abst�nde (Beispiele) */
    .popup-overlay.weight-goal-popup :deep(.edit-input) {
        margin-bottom: 1.25rem;
    }

    .popup-overlay.export-popup :deep(.edit-input) {
        margin-bottom: 0.5rem;
    }

    .popup-body :deep(.downloaddistance) {
        margin-bottom: 0.5rem;
        display: block;
    }

    /* === Actions === */
    .popup-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1rem;
    }

    /* Fade */
    .fade-enter-active, .fade-leave-active {
        transition: opacity .18s ease;
    }

    .fade-enter-from, .fade-leave-to {
        opacity: 0;
    }
    .popup {
        position: relative;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        padding: 1.4rem 1.5rem;
        border-radius: 18px;
        /* moderner, leichter Rahmen für alle Popups */
        border: 1px solid rgba(148, 163, 184, 0.45);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        max-width: 460px;
        width: 92%;
        text-align: left;
        font-family: var(--popup-font-family, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif);
    }

    html.dark-mode .popup-overlay .popup {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border: 1px solid rgba(148, 163, 184, 0.7); /* etwas kräftiger im Dark-Mode */
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .popup-overlay.email-change-popup .popup {
        padding: 1.4rem 1.5rem 1.1rem;
    }

    /* Titel an Cards angleichen */
    .popup-overlay.email-change-popup .popup-title {
        text-align: left;
        font-size: 1.3rem;
        margin-bottom: 1.1rem;
    }

    /* Body & Actions eher wie Card */
    .popup-overlay.email-change-popup .popup-body {
        text-align: left;
        margin-bottom: 0.8rem;
    }

    .popup-overlay.email-change-popup .popup-actions {
        justify-content: flex-end;
        margin-top: 1.1rem;
    }


    /* Titel an Cards angleichen */
    .popup-overlay.email-change-popup .popup-title {
        text-align: left;
        font-size: 1.3rem;
        margin-bottom: 1.1rem;
    }

    /* Body & Actions eher wie Card, nicht „Modal von 2012“ */
    .popup-overlay.email-change-popup .popup-body {
        text-align: left;
        margin-bottom: 0.8rem;
    }

    .popup-overlay.email-change-popup .popup-actions {
        justify-content: flex-end;
        margin-top: 1.1rem;
    }

</style>