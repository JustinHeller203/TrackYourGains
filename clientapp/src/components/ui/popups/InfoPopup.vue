<template>
    <BasePopup :show="show"
               :title="title"
               :overlayClass="overlayClass"
               :showActions="true"
               :cancelText="undefined"
               :saveText="okText || 'OK'"
               @cancel="$emit('cancel')"
               @save="$emit('ok')">
        <template #default>
            <p class="info-text">{{ message }}</p>
        </template>

        <template #actions>
            <PopupSaveButton @click="$emit('ok')">
                {{ okText || 'OK' }}
            </PopupSaveButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
import BasePopup from './BasePopup.vue'
import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'

defineProps<{
  show: boolean
  title: string
  message: string
  overlayClass?: string | string[]
  okText?: string
}>()

defineEmits<{
  (e: 'ok'): void
  (e: 'cancel'): void
}>()
</script>

<style scoped>
    .info-text {
        font-size: var(--popup-body-size, 1rem);
        color: var(--text-secondary);
        margin: .25rem 0 .25rem;
    }
</style>
