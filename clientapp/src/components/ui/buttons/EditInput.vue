<!--Pfad: components/ui/buttons/EditInput.vue-->
<template>
    <BaseButton :type="type"
                :title="title || ariaLabel"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                :extraClass="[
      'edit-input-btn',
      { ghost, block, disabled }
    ]"
                @click="$emit('click', $event)">
        <slot />
    </BaseButton>
</template>

<script setup lang="ts">
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    const props = withDefaults(defineProps<{
        ghost?: boolean
        block?: boolean
        disabled?: boolean
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
    }>(), {
        ghost: false,
        block: false,
        disabled: false,
        type: 'button'
    })

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    /* Chip-Look wie bei �Name� */
    .edit-input-btn {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        padding: .35rem .6rem;
        border-radius: 999px;
        font-size: .85rem;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .4rem;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0,0,0,.04);
        transition: background .18s ease, color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .12s ease;
        min-height: 32px;
    }

        .edit-input-btn:hover:not(.disabled) {
            border-color: var(--accent-primary, #4B6CB7);
            box-shadow: 0 2px 6px rgba(0,0,0,.08);
            transform: translateY(-1px);
        }

        .edit-input-btn.ghost {
            background: transparent;
        }

        .edit-input-btn.block {
            width: 100%;
        }

        .edit-input-btn.disabled {
            opacity: .6;
            cursor: not-allowed;
            transform: none;
        }

    html.dark-mode .edit-input-btn {
        box-shadow: 0 1px 2px rgba(0,0,0,.25);
    }
</style>
