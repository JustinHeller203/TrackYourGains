<!-- src/components/ui/popups/WeightPopup.vue -->
<template>
    <BasePopup :show="show"
               title="Neues Gewicht eintragen"
               variant="weight-goal-popup"
               @cancel="$emit('cancel')">
        <!-- Body -->
        <UiPopupInput :modelValue="modelValue ?? ''"
                      as="input"
                      type="number"
                      :placeholder="placeholder"
                      inputmode="decimal"
                      :error="error"
                      autofocus
                      @update:modelValue="onInputValue"
                      @enter="onSave" />
        <!-- Footer-Buttons -->
        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus @click="onSave">
                Speichern
            </PopupActionButton>
        </template>
    </BasePopup>
</template>
<script setup lang="ts">
    import { ref, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'

    const props = defineProps<{
        show: boolean
        modelValue: number | null
        placeholder?: string
        validate?: (value: number | null) => string | null
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', value: number | null): void
        (e: 'save'): void
        (e: 'cancel'): void
    }>()

    const error = ref('')

    watch(() => props.show, (open) => {
        if (open) error.value = ''
    })

    function onInputValue(v: string) {
        const trimmed = (v ?? '').toString().trim()
        if (!trimmed) {
            error.value = ''
            emit('update:modelValue', null)
            return
        }

        const n = Number(trimmed.replace(',', '.'))
        error.value = ''
        emit('update:modelValue', Number.isFinite(n) ? n : null)
    }

    function onSave() {
        const validationError = props.validate?.(props.modelValue ?? null) ?? null
        if (validationError) {
            error.value = validationError
            return
        }

        error.value = ''
        emit('save')
    }
</script>
