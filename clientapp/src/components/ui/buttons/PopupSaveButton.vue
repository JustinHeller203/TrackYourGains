<template>
    <button class="popup-btn save-btn"
            type="button"
            :aria-label="ariaLabel"
            @click="$emit('click')">
        <slot>Speichern</slot>
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
    /* 1:1 aus BasePopup �bernommen, damit Optik identisch bleibt */
    .popup-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
    }

    /* Save-Variante */
    .save-btn {
        background: #10b981;
        color: #ffffff;
    }

        .save-btn:hover {
            background: #064e3b;
            transform: scale(1.05);
        }
</style>
