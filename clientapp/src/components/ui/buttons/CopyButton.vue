<template>
    <button class="btn-ghost mini" type="button" @click="$emit('click')">
        📋 <slot>Kopieren</slot>
    </button>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
    .btn-ghost {
        background: transparent;
        border: 1px solid var(--border-color);
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-ghost:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: translateY(-1px);
        }

        .btn-ghost.mini {
            padding: .35rem .6rem;
            font-size: .8rem;
            border-radius: 6px;
        }
</style>
