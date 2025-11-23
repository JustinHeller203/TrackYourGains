<template>
    <BaseButton :type="type"
                :title="title"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                :extraClass="mergedClass"
                @click="$emit('click', $event)">
        <slot>Übung hinzufügen</slot>
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
    }>(), {
        type: 'button',
        title: 'Übung hinzufügen',
        disabled: false,
    })

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()

    // flach mergen, damit kein verschachteltes Array entsteht
    const mergedClass = computed<ClassLike[]>(() => [
        'add-exercise-btn',
        ...(Array.isArray(props.extraClass)
            ? props.extraClass
            : (props.extraClass ? [props.extraClass] : [])),
    ])
</script>
