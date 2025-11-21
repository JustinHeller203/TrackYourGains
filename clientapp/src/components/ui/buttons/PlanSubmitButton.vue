<template>
    <button class="plan-submit-btn"
            :class="[block ? 'block' : '', extraClass]"
            :type="type"
            :disabled="disabled"
            :title="computedTitle"
            :aria-label="computedTitle">
        <slot>{{ computedLabel }}</slot>
    </button>
</template>

<script setup lang="ts">
    import { computed } from 'vue'

    interface Props {
        isEditing?: boolean
        createLabel?: string
        saveLabel?: string
        createTitle?: string
        saveTitle?: string
        disabled?: boolean
        type?: 'submit' | 'button' | 'reset'
        block?: boolean
        extraClass?: string
    }
    const props = withDefaults(defineProps<Props>(), {
        isEditing: false,
        createLabel: 'Plan erstellen',
        saveLabel: 'Plan speichern',
        createTitle: 'Plan erstellen',
        saveTitle: 'Plan speichern',
        disabled: false,
        type: 'submit',
        block: true,
        extraClass: ''
    })

    const computedLabel = computed(() =>
        props.isEditing ? props.saveLabel : props.createLabel
    )
    const computedTitle = computed(() =>
        props.isEditing ? props.saveTitle : props.createTitle
    )
</script>

<style scoped>
    .plan-submit-btn {
        background: linear-gradient(45deg, #4B6CB7, #182848);
        color: #ffffff;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font: inherit;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: background 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
    }

        .plan-submit-btn:hover:not(:disabled) {
            background: linear-gradient(45deg, #5a7bc4, #2a3b6a);
            /* keine Vergrößerung mehr */
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            filter: brightness(1.02);
        }

        .plan-submit-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px rgba(75,108,183,0.35);
        }

        .plan-submit-btn:active:not(:disabled) {
            /* dezentes Klick-Feedback ohne Scale */
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            filter: brightness(0.98);
        }

        .plan-submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .plan-submit-btn.block {
            width: 100%;
        }
</style>
