<!--Pfad: components/ui/buttons/PlanSubmitButton.vue-->
<template>
    <button class="plan-submit-btn"
            :class="[isEditing ? '' : 'primary-btn', block ? 'block' : '', extraClass]"
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
