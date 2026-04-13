<!-- src/components/ui/popups/GoalPopup.vue -->
<template>
    <BasePopup :show="show"
               title="Neues Zielgewicht eintragen"
               variant="weight-goal-popup"
               @cancel="$emit('cancel')">
        <div class="goal-center">
            <UiPopupInput :modelValue="modelValue ?? ''"
                          as="input"
                          type="number"
                          :placeholder="placeholder"
                          inputmode="decimal"
                          :error="error"
                          autofocus
                          @update:modelValue="onInputValue"
                          @enter="onSave" />
        </div>
        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus @click="onPrimaryAction">
                {{ primaryActionLabel }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>
<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'

    const props = defineProps<{
        show: boolean
        modelValue: number | null
        placeholder?: string
        validate?: (value: number | null) => string | null
        isDirty?: boolean
        allowReset?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', value: number | null): void
        (e: 'save'): void
        (e: 'reset'): void
        (e: 'cancel'): void
    }>()

    const error = ref('')
    const primaryActionLabel = computed(() =>
        !props.isDirty && props.allowReset ? 'Zurücksetzen' : 'Speichern'
    )

    watch(() => props.show, (open) => {
        if (open) error.value = ''
    })

    function onInputValue(v: string) {
        // UiPopupInput liefert string → wir machen number|null draus
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

    function onPrimaryAction() {
        if (!props.isDirty && props.allowReset) {
            error.value = ''
            emit('reset')
            return
        }

        onSave()
    }

</script>
<style scoped>
    .goal-center {
        width: 100%;
    }
</style>
