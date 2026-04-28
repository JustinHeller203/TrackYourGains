<template>
    <BasePopup :show="modelValue"
               :title="translatedTitle"
               overlayClass="edit-popup"
               @cancel="onCancel">
        <UiPopupSelect v-if="props.inputType === 'select'"
                       v-model="localValue"
                       :label="translatedLabel"
                       :placeholder="translatedPlaceholder"
                       :options="translatedOptions" />

        <UiPopupInput v-else
                      v-model="localValue"
                      :label="translatedLabel"
                      :placeholder="translatedPlaceholder" />

        <template #actions>
            <PopupActionButton variant="ghost"
                               @click="onCancel">
                {{ t('common.cancel') }}
            </PopupActionButton>

            <PopupActionButton autofocus
                               :danger="!!props.confirmDanger"
                               @click="save">
                {{ translatedConfirmText }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '../buttons/popup/PopupActionButton.vue'
    import UiPopupInput from "@/components/ui/kits/inputs/UiPopupInput.vue";
    import UiPopupSelect from "@/components/ui/kits/selects/UiPopupSelect.vue";
    import { useI18n } from '@/composables/useI18n'

    type InputKind = 'text' | 'number' | 'select'

    const props = defineProps<{
        modelValue: boolean
        title: string
        inputType: InputKind
        label?: string
        placeholder: string
        value: string
        options?: Array<{ label: string; value: string }>
        confirmText?: string
        confirmDanger?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: boolean): void
        (e: 'update:value', v: string): void
        (e: 'save', v: string): void
        (e: 'cancel'): void
    }>()

    const { t } = useI18n()

    const translateUiText = (value: string) => t(value)

    const translatedTitle = computed(() => translateUiText(props.title))
    const translatedLabel = computed(() => props.label ? translateUiText(props.label) : undefined)
    const translatedPlaceholder = computed(() => translateUiText(props.placeholder))
    const translatedConfirmText = computed(() => props.confirmText ? translateUiText(props.confirmText) : t('common.save'))

    const translatedOptions = computed(() =>
        (props.options || []).map(option => ({
            ...option,
            label: translateUiText(option.label),
        })),
    )

    const onCancel = () => {
        emit('cancel')
        emit('update:modelValue', false)
    }

    const localValue = ref(props.value ?? '')

    watch(() => props.value, v => (localValue.value = v))

    watch(localValue, (v) => {
        emit('update:value', (v ?? '').toString())
    })

    const save = () => emit('save', (localValue.value ?? '').toString().trim())
</script>

<style scoped>
</style>
