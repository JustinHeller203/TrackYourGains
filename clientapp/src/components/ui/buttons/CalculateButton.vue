<template>
    <button class="popup-btn save-btn"
            type="button"
            @click="$emit('click')">
        Berechnen
    </button>
</template>

<script setup lang="ts">
    defineEmits<{
        (e: 'click'): void
    }>()
</script>

<style scoped>
    .popup-btn {
        padding: .75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: .9rem;
        transition: background .2s, transform .1s;
    }

    .save-btn {
        background: transparent;
        border: 1px solid var(--accent-primary);
        color: var(--accent-primary);
        padding: .5rem .75rem;
        border-radius: 8px;
        font-size: .9rem;
        font-weight: 500;
        cursor: pointer;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .save-btn:hover {
            border-color: #3b82f6;
            color: #3b82f6;
            background-color: rgba(59,130,246,.1);
            transform: translateY(-2px);
        }
</style>
