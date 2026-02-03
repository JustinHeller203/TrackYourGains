<template>
    <BasePopup :show="show"
               :title="title"
               :overlayClass="overlayClass"
               @cancel="$emit('cancel')">
        <template #default>
            <div class="input-group" @keydown.escape.prevent="$emit('cancel')">
                <UiPopupInput :modelValue="proxy"
                              :placeholder="placeholder"
                              :maxlength="maxLength || undefined"
                              autofocus
                              @update:modelValue="(v) => (proxy = v)"
                              @enter="$emit('save', proxy)" />
            </div>
        </template>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                {{ cancelText || 'Abbrechen' }}
            </PopupActionButton>

            <PopupActionButton :disabled="disableSave" autofocus @click="$emit('save', proxy)">
                {{ saveText || 'Speichern' }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'

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

    const disableSave = computed(() => props.required ? proxy.value.trim().length === 0 : false)
</script>
