<!--Pfad: components/ui/buttons/CalculateButton.vue-->
<template>
    <button class="calc-btn"
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
    /* REPLACE styles */
    .calc-btn {
        background: transparent;
        border: 1px solid var(--accent-primary);
        color: var(--accent-primary);
        padding: .5rem .75rem;
        border-radius: 8px;
        font-size: .9rem;
        font-weight: 500;
        cursor: pointer;
        transition: border-color .2s, color .2s, transform .1s, background-color .2s;
        align-self: flex-start;
        width: fit-content;
        display: inline-flex;
    }

        .calc-btn:hover {
            border-color: #3b82f6;
            color: #3b82f6;
            background-color: rgba(59,130,246,.1);
            transform: translateY(-2px);
        }

</style>
