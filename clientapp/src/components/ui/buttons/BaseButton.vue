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
defineProps<{
  type?: 'button' | 'submit' | 'reset'
  title?: string
  ariaLabel?: string
  disabled?: boolean
  extraClass?: string | string[] | Record<string, boolean>
}>()

defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()
</script>
