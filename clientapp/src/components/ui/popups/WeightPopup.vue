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
                      autofocus
                      @update:modelValue="onInputValue"
                      @enter="$emit('save')" />
        <!-- Footer-Buttons -->
        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus @click="$emit('save')">
                Speichern
            </PopupActionButton>
        </template>
    </BasePopup>
</template>
<script setup lang="ts">
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'

    const props = defineProps<{
        show: boolean
        modelValue: number | null
        placeholder?: string
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', value: number | null): void
        (e: 'save'): void
        (e: 'cancel'): void
    }>()

    function onInputValue(v: string) {
        const trimmed = (v ?? '').toString().trim()
        if (!trimmed) {
            emit('update:modelValue', null)
            return
        }

        const n = Number(trimmed.replace(',', '.'))
        emit('update:modelValue', Number.isFinite(n) ? n : null)
    }
</script>
