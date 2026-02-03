<!--Pfad: components/ui/buttons/popup/PopupActionButton.vue-->

<template>
    <button type="button"
            class="pab-btn"
            :class="[
                variant === 'ghost' && 'is-ghost',
                danger && 'is-danger'
            ]"
            :disabled="disabled"
            @click="$emit('click', $event)">
        <slot />
    </button>
</template>

<script setup lang="ts">
    withDefaults(defineProps<{
        disabled?: boolean
        variant?: 'primary' | 'ghost'
        danger?: boolean
    }>(), {
        variant: 'primary',
        danger: false
    })

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    .pab-btn {
        border-radius: 14px;
        padding: 0.6rem 0.85rem;
        border: 2px solid rgba(129, 140, 248, 0.45);
        background: rgba(129, 140, 248, 0.10);
        color: var(--text-primary);
        font-weight: 900;
        cursor: pointer;
        transition: transform 140ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease, opacity 140ms ease;
    }

        .pab-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

    @media (hover:hover) {
        .pab-btn:not(:disabled):hover {
            transform: translateY(-1px);
            background: rgba(129, 140, 248, 0.14);
            border-color: rgba(129, 140, 248, 0.65);
            box-shadow: 0 16px 30px rgba(15, 23, 42, 0.18);
        }
    }

    .pab-btn:not(:disabled):active {
        transform: translateY(0);
        background: rgba(129, 140, 248, 0.09);
        opacity: 0.95;
    }

    .pab-btn:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.18), 0 16px 30px rgba(15, 23, 42, 0.18);
    }

    /* Ghost (für Abbrechen) */
    .pab-btn.is-ghost {
        background: rgba(255,255,255,0.06);
        border-color: rgba(148, 163, 184, 0.25);
        font-weight: 800;
    }

    @media (hover:hover) {
        .pab-btn.is-ghost:not(:disabled):hover {
            background: rgba(255,255,255,0.09);
            border-color: rgba(129, 140, 248, 0.35);
        }
    }

    /* Danger (optional) */
    .pab-btn.is-danger {
        border-color: rgba(248,113,113,.40);
        background: rgba(248,113,113,.10);
    }

    @media (hover:hover) {
        .pab-btn.is-danger:not(:disabled):hover {
            border-color: rgba(248,113,113,.65);
            background: rgba(248,113,113,.14);
        }
    }
</style>
