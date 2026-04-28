<!-- src/components/ui/popups/GoalPopup.vue -->
<template>
    <BasePopup :show="show"
               :title="t('progress.goal.popupTitle')"
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
                {{ t('common.cancel') }}
            </PopupActionButton>

            <PopupActionButton autofocus @click="onPrimaryAction">
                {{ primaryActionLabel }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import { useI18n } from '@/composables/useI18n'
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

    const { t } = useI18n()
    const error = ref('')
    const primaryActionLabel = computed(() =>
        !props.isDirty && props.allowReset ? t('common.reset') : t('common.save')
    )

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
