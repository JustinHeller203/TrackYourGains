<!--Pfad: components/ui/buttons/FavoriteButton.vue-->
<template>
    <button class="favorite-btn"
            type="button"
            :aria-pressed="active"
            :title="active ? titleActive : titleInactive"
            @click="$emit('toggle')">
        {{ active ? '★' : '☆' }}
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        active: boolean
        titleActive?: string
        titleInactive?: string
    }>()

    defineEmits<{ (e: 'toggle'): void }>()
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
        transition: color .2s, text-shadow .2s, transform .1s;
    }

        .favorite-btn:hover {
            color: #92400E;
            text-shadow: 0 0 8px rgba(146, 64, 14, 0.5), 0 0 4px rgba(146, 64, 14, 0.5);
            transform: scale(1.1);
        }

    /* Dark Mode Variationen (gleich wie Training.vue) */
    html.dark-mode .favorite-btn {
        color: #FFD700;
    }

        html.dark-mode .favorite-btn:hover {
            color: #92400E;
            text-shadow: 0 0 8px #92400e, 0 0 4px #92400e;
        }
</style>
