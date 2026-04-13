<!--Pfad: components/ui/buttons/FavoriteButton.vue-->
<template>
    <button class="favorite-btn"
            :class="animationClass"
            type="button"
            :aria-pressed="active"
            :title="active ? titleActive : titleInactive"
            @click.stop="$emit('toggle')"
            @keydown.enter.stop.prevent="$emit('toggle')"
            @keydown.space.stop.prevent="$emit('toggle')">
        {{ active ? '★' : '☆' }}
    </button>
</template>

<script setup lang="ts">
    import { onUnmounted, ref, watch } from 'vue'

    const props = defineProps<{
        active: boolean
        titleActive?: string
        titleInactive?: string
    }>()

    defineEmits<{ (e: 'toggle'): void }>()

    const animationClass = ref('')
    let isFirstSync = true
    let animationTimer: ReturnType<typeof setTimeout> | null = null

    const clearAnimationTimer = () => {
        if (animationTimer) {
            clearTimeout(animationTimer)
            animationTimer = null
        }
    }

    watch(() => props.active, (next) => {
        if (isFirstSync) {
            isFirstSync = false
            return
        }

        clearAnimationTimer()
        animationClass.value = next ? 'favorite-btn--activate' : 'favorite-btn--deactivate'
        animationTimer = setTimeout(() => {
            animationClass.value = ''
            animationTimer = null
        }, next ? 520 : 420)
    })

    onUnmounted(() => {
        clearAnimationTimer()
    })
</script>

<style scoped>
    /* Basis wie in Training.vue */
    .favorite-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #D4A017; /* gold */
        border-radius: 8px;
        transition: color .2s, text-shadow .2s, transform .14s ease, filter .18s ease;
        will-change: transform;
    }

    .favorite-btn[aria-pressed="true"] {
        animation: favorite-star-twinkle 2.8s cubic-bezier(0.22, 0.61, 0.36, 1) infinite;
    }

        .favorite-btn:hover {
            color: #92400E;
            text-shadow: 0 0 8px rgba(146, 64, 14, 0.5), 0 0 4px rgba(146, 64, 14, 0.5);
            transform: scale(1.1);
        }

    .favorite-btn--activate {
        animation: favorite-pop .5s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .favorite-btn--deactivate {
        animation: favorite-release .4s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    @keyframes favorite-pop {
        0% {
            transform: scale(1);
            text-shadow: 0 0 0 rgba(212, 160, 23, 0);
        }

        45% {
            transform: scale(1.28);
            text-shadow: 0 0 16px rgba(212, 160, 23, 0.48), 0 0 28px rgba(250, 204, 21, 0.28);
        }

        70% {
            transform: scale(.94);
        }

        100% {
            transform: scale(1);
            text-shadow: 0 0 0 rgba(212, 160, 23, 0);
        }
    }

    @keyframes favorite-release {
        0% {
            transform: scale(1);
        }

        45% {
            transform: scale(.82);
        }

        100% {
            transform: scale(1);
        }
    }

    @keyframes favorite-star-twinkle {
        0%, 100% {
            color: #D4A017;
            text-shadow: 0 0 0 rgba(250, 204, 21, 0);
            filter: brightness(1);
            transform: scale(1);
        }

        18% {
            color: #eab308;
            text-shadow: 0 0 6px rgba(250, 204, 21, 0.16);
            filter: brightness(1.03);
            transform: scale(1.015);
        }

        32% {
            color: #facc15;
            text-shadow: 0 0 10px rgba(250, 204, 21, 0.24), 0 0 18px rgba(250, 204, 21, 0.12);
            filter: brightness(1.08);
            transform: scale(1.035);
        }

        44% {
            color: #fde047;
            text-shadow: 0 0 12px rgba(253, 224, 71, 0.32), 0 0 22px rgba(250, 204, 21, 0.14);
            filter: brightness(1.12);
            transform: scale(1.05);
        }

        58% {
            color: #facc15;
            text-shadow: 0 0 8px rgba(250, 204, 21, 0.18);
            filter: brightness(1.05);
            transform: scale(1.022);
        }

        74% {
            color: #fde68a;
            text-shadow: 0 0 11px rgba(253, 230, 138, 0.26), 0 0 18px rgba(250, 204, 21, 0.1);
            filter: brightness(1.09);
            transform: scale(1.03);
        }
    }

    /* Dark Mode Variationen (gleich wie Training.vue) */
    html.dark-mode .favorite-btn {
        color: #FFD700;
    }

    html.dark-mode .favorite-btn[aria-pressed="true"] {
        animation-name: favorite-star-twinkle-dark;
    }

    @keyframes favorite-star-twinkle-dark {
        0%, 100% {
            color: #FFD700;
            text-shadow: 0 0 0 rgba(253, 224, 71, 0);
            filter: brightness(1);
            transform: scale(1);
        }

        18% {
            color: #fde047;
            text-shadow: 0 0 7px rgba(253, 224, 71, 0.18);
            filter: brightness(1.04);
            transform: scale(1.015);
        }

        32% {
            color: #fff0a8;
            text-shadow: 0 0 12px rgba(255, 240, 168, 0.28), 0 0 18px rgba(253, 224, 71, 0.14);
            filter: brightness(1.1);
            transform: scale(1.035);
        }

        44% {
            color: #fff7bf;
            text-shadow: 0 0 14px rgba(255, 247, 191, 0.36), 0 0 22px rgba(253, 224, 71, 0.16);
            filter: brightness(1.15);
            transform: scale(1.05);
        }

        58% {
            color: #fde68a;
            text-shadow: 0 0 9px rgba(253, 230, 138, 0.2);
            filter: brightness(1.07);
            transform: scale(1.022);
        }

        74% {
            color: #fff7bf;
            text-shadow: 0 0 12px rgba(255, 247, 191, 0.28), 0 0 18px rgba(253, 224, 71, 0.12);
            filter: brightness(1.11);
            transform: scale(1.03);
        }
    }

        html.dark-mode .favorite-btn:hover {
            color: #92400E;
            text-shadow: 0 0 8px #92400e, 0 0 4px #92400e;
        }
</style>
