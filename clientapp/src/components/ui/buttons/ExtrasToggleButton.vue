<template>
    <BaseButton :type="type"
                :title="title"
                :aria-label="ariaLabel || title"
                :disabled="disabled"
                :extraClass="['btn-extras-look', 'toggle-exercise-btn', extraClass, { active: toggled }]"
                @click="$emit('click', $event)">
        <slot>Extras einblenden</slot>
    </BaseButton>
</template>

<script setup lang="ts">
    import BaseButton from '@/components/ui/buttons/BaseButton.vue'

    withDefaults(defineProps<{
        type?: 'button' | 'submit' | 'reset'
        title?: string
        ariaLabel?: string
        disabled?: boolean
        extraClass?: string | string[] | Record<string, boolean>
        toggled?: boolean
    }>(), {
        type: 'button',
        title: 'Extras einblenden',
        disabled: false,
        toggled: false
    })

    defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>

<style scoped>
    /* Optional: leichtes visuelles Feedback, wenn toggled=true */
    .toggle-exercise-btn.active {
        filter: brightness(1.08);
    }
</style>
