<template>
    <BaseButton :type="type"
                :title="title"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                :extraClass="mergedClass"
                @click="$emit('click', $event)">
        <slot>Extras einblenden</slot>
    </BaseButton>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    // self-contained types (kein externes types/ui)
    type ClassLike = string | Record<string, boolean>
    type ClassProp = ClassLike | ClassLike[]

    const props = withDefaults(defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
        extraClass?: ClassProp
        toggled?: boolean
    }>(), {
        type: 'button',
        title: 'Extras einblenden',
        disabled: false,
        toggled: false,
    })

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

    const mergedClass = computed<ClassLike[]>(() => [
        'btn-extras-look',
        'toggle-exercise-btn',
        ...(Array.isArray(props.extraClass)
            ? props.extraClass
            : (props.extraClass ? [props.extraClass] : [])),
        { active: !!props.toggled }, // !! erzwingt echtes boolean
    ])
</script>

<style scoped>
    .toggle-exercise-btn.active {
        filter: brightness(1.08);
    }
</style>
