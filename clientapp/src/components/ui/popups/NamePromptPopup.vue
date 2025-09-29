<template>
    <BasePopup :show="show"
               :title="title"
               :overlayClass="overlayClass"
               @cancel="$emit('cancel')">
        <template #default>
            <div class="input-group">
                <input ref="inp"
                       class="edit-input"
                       :placeholder="placeholder"
                       v-model="proxy"
                       :maxlength="maxLength || undefined"
                       @keydown.enter.prevent="$emit('save', proxy)"
                       @keydown.escape.prevent="$emit('cancel')" />
            </div>
        </template>

        <template #actions>
            <PopupSaveButton :disabled="disableSave" @click="$emit('save', proxy)">
                {{ saveText || 'Speichern' }}
            </PopupSaveButton>
            <PopupCancelButton @click="$emit('cancel')">
                {{ cancelText || 'Abbrechen' }}
            </PopupCancelButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import BasePopup from './BasePopup.vue'
import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'
import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'

const props = defineProps<{
  show: boolean
  modelValue: string
  title: string
  placeholder?: string
  overlayClass?: string | string[]
  saveText?: string
  cancelText?: string
  maxLength?: number
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'save', v: string): void
  (e: 'cancel'): void
}>()

const proxy = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v)
})

const inp = ref<HTMLInputElement | null>(null)
watch(() => props.show, async (open) => {
  if (open) { await nextTick(); inp.value?.focus() }
})

const disableSave = computed(() => props.required ? proxy.value.trim().length === 0 : false)
</script>
