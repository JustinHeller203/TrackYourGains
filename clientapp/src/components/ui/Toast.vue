<!--Toast.vue-->
<template>
    <div class="toast-container" :class="positionClass">
        <div v-if="toast"
             v-show="localVisible"
             class="toast"
             :class="[toast.type, { 'toast-exit': toast.exiting }]"
             :style="toastInlineStyle"
             role="status"
             aria-live="polite">
            <span class="toast-emoji">{{ toast.emoji }}</span>
            <span class="toast-message">{{ toast.message }}</span>

            <button v-if="dismissible"
                    class="toast-close"
                    type="button"
                    aria-label="Toast schließen"
                    @click="$emit('dismiss', toast!.id)">
                ✕
            </button>

            <div class="toast-progress"
                 v-if="toast && !toast.exiting"
                 :key="toast.id + '-' + progressMs"
                 :style="progressBarStyle"
                 @animationend="onProgressEnd"
                 aria-hidden="true"></div>
        </div>
    </div>
</template>


<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import type { Toast as ToastModel } from '@/types/toast'

    const props = defineProps<{
        toast: ToastModel | null
        dismissible?: boolean
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
        autoDismiss?: boolean
    }>()

    const emit = defineEmits<{ (e: 'dismiss', id: number): void }>()

    const positionClass = computed(() => {
        const pos = props.position ?? 'bottom-right'
        return pos.startsWith('top') ? 'pos-top-right' : 'pos-bottom-right'
    })

    const progressMs = computed(() => {
        const t = props.toast as any
        const base = (t?.durationMs ?? t?.duration ?? t?.timeout ?? 1800) as number
        return Math.max(600, base)
    })

    const accentColor = computed(() => {
        switch (props.toast?.type) {
            case 'toast-add': return '#10b981'
            case 'toast-delete': return '#ef4444'
            case 'toast-save': return '#F59E0B'
            case 'toast-timer': return '#6b7280'
            case 'toast-reset': return '#ef4444'
            default: return '#4B6CB7'
        }
    })

    const progressBarStyle = computed(() => ({
        '--toast-duration': progressMs.value + 'ms',
        '--toast-accent': accentColor.value
    }) as Record<string, string>)

    const autoClosing = ref(false)
    const closedOnce = ref(false)

    const toastInlineStyle = computed(() => {
        return autoClosing.value
            ? ({ '--toast-exit': '0ms' } as Record<string, string>)
            : {}
    })

    function onProgressEnd(e: AnimationEvent) {
        if (!props.toast || closedOnce.value || props.autoDismiss === false) return
        if (e.animationName !== 'toast-progress-shrink') return
        autoClosing.value = true
        closedOnce.value = true
        localVisible.value = false  // sofort verschwinden, exakt zum Ende der Linie
        emit('dismiss', props.toast.id)
    }


    const localVisible = ref(true)

    watch(() => props.toast?.id, () => {
        localVisible.value = true
        autoClosing.value = false
        closedOnce.value = false
    }, { immediate: true })
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
        position: relative;
        overflow: hidden;
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

    .toast-exit {
        animation: toast-exit var(--toast-exit, .2s) ease forwards;
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

    .toast-progress {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 3px;
        background: var(--toast-accent, #4B6CB7);
        opacity: .95;
        transform-origin: left;
        animation: toast-progress-shrink var(--toast-duration, 3000ms) linear forwards;
        pointer-events: none;
    }

    @keyframes toast-progress-shrink {
        from {
            transform: scaleX(1);
        }

        to {
            transform: scaleX(0);
        }
    }

    html.dark-mode .toast-progress {
        opacity: .9;
    }
</style>
