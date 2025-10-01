<template>
  <BaseButton
    :type="type"
    :title="title"
    :aria-label="ariaLabel || title"
    :disabled="disabled"
    :extraClass="['add-exercise-btn', extraClass]"
    @click="$emit('click', $event)"
  >
    <slot>Übung hinzufügen</slot>
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
}>(), {
  type: 'button',
  title: 'Übung hinzufügen',
  disabled: false,
})

defineEmits<{ (e: 'click', ev: MouseEvent): void }>()
</script>
