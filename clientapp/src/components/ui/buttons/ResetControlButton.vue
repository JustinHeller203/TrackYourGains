<template>
  <BaseButton
    :type="type"
    :title="title || 'Reset'"
    :aria-label="ariaLabel || title || 'Reset'"
    :disabled="disabled"
    extraClass="timer-btn reset-btn"
    @click="$emit('click', $event)"
  >
    <slot>Reset</slot>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from '@/components/ui/buttons/BaseButton.vue'

defineProps<{
  type?: 'button' | 'submit' | 'reset'
  title?: string
  ariaLabel?: string
  disabled?: boolean
}>()

defineEmits<{ (e:'click', ev:MouseEvent): void }>()
</script>

<style scoped>
.timer-btn{
  padding:.75rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-size:.9rem;
  transition:background .2s, transform .1s;display:inline-flex;align-items:center;justify-content:center;
  line-height:1;vertical-align:middle;
}
.timer-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.reset-btn{background:#6b7280;color:#fff;}
.reset-btn:hover{background:#4b5563;transform:scale(1.05);}
</style>
