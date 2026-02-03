<template>
    <BasePopup :show="modelValue"
               :title="title"
               overlayClass="edit-popup"
               @cancel="onCancel">
        <UiPopupSelect v-if="props.inputType === 'select'"
                       v-model="localValue"
                       :label="props.label"
                       :placeholder="props.placeholder"
                       :options="props.options || []" />

        <UiPopupInput v-else
                      v-model="localValue"
                      :label="props.label"
                      :placeholder="props.placeholder" />

        <template #actions>
            <PopupActionButton variant="ghost"
                               @click="onCancel">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus
                               :danger="!!props.confirmDanger"
                               @click="save">
                {{ props.confirmText || 'Speichern' }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '../buttons/popup/PopupActionButton.vue'
    import UiPopupInput from "@/components/ui/kits/inputs/UiPopupInput.vue";
    import UiPopupSelect from "@/components/ui/kits/selects/UiPopupSelect.vue";

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
