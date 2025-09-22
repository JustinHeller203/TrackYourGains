<template>
    <button class="popup-btn cancel-btn"
            type="button"
            :aria-label="ariaLabel"
            @click="$emit('click')">
        <slot>Abbrechen</slot>
    </button>
</template>

<script setup lang="ts">
defineProps<{
  ariaLabel?: string
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
    /* identische Styles wie bisher */
    .popup-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
    }

    /* Cancel-Variante */
    .cancel-btn {
        background: #6b7280;
        color: #ffffff;
    }

        .cancel-btn:hover {
            background: #4b5563;
            transform: scale(1.05);
        }
</style>
