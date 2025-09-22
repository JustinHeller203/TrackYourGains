<template>
    <button class="btn-danger-ghost" type="button" @click="$emit('click')">
        <span class="btn-icon">🔄</span>
        <slot>Zurücksetzen</slot>
    </button>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'click'): void }>()
</script>

<style scoped>
    .btn-danger-ghost {
        background: transparent;
        border: 1px solid #b91c1c33;
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: #b91c1c;
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-danger-ghost:hover {
            border-color: #b91c1c;
            color: #7f1d1d;
            transform: translateY(-1px);
        }

    .btn-icon {
        margin-right: .4rem;
    }
</style>
