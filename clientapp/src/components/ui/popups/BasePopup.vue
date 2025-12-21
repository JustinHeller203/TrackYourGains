<!--BasePopup.vue-->

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
                    <XButton v-if="showClose"
                             class="popup-x"
                             aria-label="Schließen"
                             @click="$emit('cancel')" />

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
    import XButton from '@/components/ui/buttons/popup/XButton.vue'

    withDefaults(defineProps<{
        show: boolean
        title?: string
        overlayClass?: string | string[] | Record<string, boolean>
        variant?: string
        showActions?: boolean
        showClose?: boolean
        cancelText?: string
        saveText?: string
    }>(), {
        cancelText: 'Abbrechen',
        saveText: 'Speichern',
        showClose: true,
    })

    defineEmits<{ (e: 'cancel'): void; (e: 'save'): void }>()
</script>


<style scoped>
    /* === Overlay & Container === */
    .popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(2, 6, 23, 0.55);
        display: grid;
        place-items: center;
        z-index: 9999;
        padding: 1rem;
    }

    .popup-title {
        font-size: var(--popup-title-size, 1.25rem);
        line-height: 1.25;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
        /* mehr Luft oben */
        padding: 2rem 1rem;
        margin: 0;
        border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    }

    .popup {
        position: relative;
    }

    .popup-x {
        position: absolute;
        top: 0.85rem;
        right: 0.85rem;
        z-index: 2;
    }

    .popup-body {
        font-size: var(--popup-body-size, 1rem);
        padding: 1rem 1.1rem;
        /* WICHTIG: erlaubt korrektes Scroll-Layout */
        display: flex;
        flex-direction: column;
        min-height: 0;
    }
    .popup-overlay.explanation-popup .popup-body {
        padding-right: 0;
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
        padding: 1rem 1.1rem;
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
        border-top: 1px solid rgba(148, 163, 184, 0.18);
        background: transparent;
        margin-top: 0; /* kill old spacing */
    }
    /* Fade */
    .fade-enter-active, .fade-leave-active {
        transition: opacity .18s ease;
    }

    .fade-enter-from, .fade-leave-to {
        opacity: 0;
    }
    .popup {
        width: min(620px, 94vw);
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
        overflow: hidden;
        text-align: left;
        font-family: var(--popup-font-family, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif);
        padding: 0; /* wichtig: wie modal-card */
    }
    html.dark-mode .popup-overlay .popup {
        background: #020617;
        border-color: rgba(148, 163, 184, 0.5);
        box-shadow: 0 34px 90px rgba(0, 0, 0, 0.7);
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