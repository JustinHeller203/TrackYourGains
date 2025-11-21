<template>
    <button class="popup-btn delete-btn"
            type="button"
            :disabled="disabled"
            @click="$emit('click')">
        <slot>LÃ¶schen</slot>
    </button>
</template>

<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
defineEmits<{ (e:'click'): void }>()
</script>

<style scoped>
    .popup-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s, opacity .2s;
    }

    .delete-btn {
        background: #ef4444;
        color: #ffffff;
    }

        .delete-btn:hover {
            background: #b91c1c;
            transform: scale(1.05);
        }

        .delete-btn:disabled {
            opacity: .6;
            cursor: not-allowed;
            transform: none;
        }
</style>
