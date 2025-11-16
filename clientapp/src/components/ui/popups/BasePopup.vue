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

    .popup {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        max-width: 420px;
        width: 90%;
        text-align: center;
        /* <-- globale Popup-Schrift */
        font-family: var(--popup-font-family, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif);
    }

    /* Titel – vorher war das 0.25rem (!) */
    .popup-title {
        font-size: var(--popup-title-size, 1.25rem);
        line-height: 1.25;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
    }

    /* Body – Grundschriftgröße */
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

    /* Varianten-Abstände (Beispiele) */
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
</style>