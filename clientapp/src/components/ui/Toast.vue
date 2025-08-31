<template>
    <div class="toast-container">
        <div v-if="toast"
             class="toast"
             :class="[toast.type, { 'toast-exit': toast.exiting }]"
             role="status"
             aria-live="polite">
            <span class="toast-emoji">{{ toast.emoji }}</span>
            <span class="toast-message">{{ toast.message }}</span>

            <button v-if="dismissible"
                    class="toast-close"
                    type="button"
                    aria-label="Toast schließen"
                    @click="$emit('dismiss')">
                ✕
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    type ToastType =
        | 'toast-default'
        | 'toast-save'
        | 'toast-add'
        | 'toast-delete'
        | 'toast-timer'
        | 'toast-reset'

    interface Toast {
        id: number
        message: string
        emoji: string
        type: ToastType
        exiting: boolean
    }

    const props = defineProps<{
        toast: Toast | null
        dismissible?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'dismiss'): void
    }>()
</script>


<style scoped>
    /* ===== Container-Positionen ===== */
    .toast-container {
        position: fixed;
        z-index: 3000;
        pointer-events: none; /* Close-Button bleibt klickbar durch pointer-events:auto in .toast */
    }

    .pos-bottom-right {
        bottom: 20px;
        right: 20px;
    }

    .pos-bottom-left {
        bottom: 20px;
        left: 20px;
    }

    .pos-top-right {
        top: 20px;
        right: 20px;
    }

    .pos-top-left {
        top: 20px;
        left: 20px;
    }

    /* ===== Toast Box ===== */
    .toast {
        pointer-events: auto;
        background: var(--bg-card);
        padding: .9rem 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,.2);
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        font-size: .9rem;
        animation: toast-enter .3s ease;
        max-width: min(80vw, 420px);
        line-height: 1.35;
        color: var(--text-primary);
    }

    html.dark-mode .toast {
        background: #1c2526;
        color: #c9d1d9;
    }

    .toast-emoji {
        font-size: 1.1rem;
    }

    .toast-message {
        flex: 1;
        word-break: break-word;
    }

    /* Exit-Animation */
    .toast-exit {
        animation: toast-exit .3s ease forwards;
    }

    /* Typen */
    .toast-default {
        border-left: 4px solid #4B6CB7;
    }

    .toast-add {
        border-left: 4px solid #10b981;
    }

    .toast-delete {
        border-left: 4px solid #ef4444;
    }

    .toast-save {
        border-left: 4px solid #F59E0B;
    }

    .toast-timer {
        border-left: 4px solid #6b7280;
    }

    .toast-reset {
        border-left: 4px solid #ef4444;
    }

    /* Close-Button */
    .toast-close {
        appearance: none;
        background: transparent;
        border: none;
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
        padding: .1rem .25rem;
        margin-left: .25rem;
        color: var(--text-secondary, #6b7280);
        border-radius: 6px;
        transition: background .2s, color .2s, transform .05s;
    }

        .toast-close:hover {
            background: rgba(0,0,0,.06);
            color: var(--text-primary, #111827);
        }

    html.dark-mode .toast-close:hover {
        background: rgba(255,255,255,.06);
    }

    /* Animations */
    @keyframes toast-enter {
        from {
            transform: translateX(100%);
            opacity: 0;
        }

        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes toast-exit {
        from {
            transform: translateX(0);
            opacity: 1;
        }

        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
</style>
