<!--Pfad: components/ui/buttons/BaseButton.vue-->

<template>
    <button class="action-btn"
            :class="extraClass"
            :type="type"
            :title="title || ariaLabel"
            :aria-label="ariaLabel || title"
            :disabled="disabled"
            @click="$emit('click', $event)">
        <slot />
    </button>
</template>

<script setup lang="ts">
    type ClassLike = string | Record<string, boolean>;
    type ClassProp = ClassLike | ClassLike[];

    defineProps<{
        type?: 'button' | 'submit' | 'reset';
        title?: string;
        ariaLabel?: string;
        disabled?: boolean;
        extraClass?: ClassProp;
    }>();

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>();
</script>

<style scoped>
    /* ?? Chip-Button f?r ?Extras ein-/ausblenden? (unver?ndert) */
    .action-btn.toggle-exercise-btn {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        min-height: calc(var(--control-height, 48px) - 4px);
        padding: 0 .9rem;
        font-size: var(--control-font-size, 0.95rem);
        border-radius: 999px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        gap: .45rem;
        transition: background .18s ease, color .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,.04);
    }

        .action-btn.toggle-exercise-btn:hover {
            border-color: var(--accent-primary, #4B6CB7);
            box-shadow: 0 2px 6px rgba(0,0,0,.08);
        }

        .action-btn.toggle-exercise-btn.active {
            background: rgba(75,108,183,0.12);
            color: var(--accent-primary, #4B6CB7);
            border-color: var(--accent-primary, #4B6CB7);
        }

        .action-btn.toggle-exercise-btn:disabled {
            opacity: .55;
            cursor: not-allowed;
            transform: none;
        }

    html.dark-mode .action-btn.toggle-exercise-btn {
        box-shadow: 0 1px 2px rgba(0,0,0,.25);
    }

        html.dark-mode .action-btn.toggle-exercise-btn.active {
            background: rgba(75,108,183,0.18);
        }
</style>
