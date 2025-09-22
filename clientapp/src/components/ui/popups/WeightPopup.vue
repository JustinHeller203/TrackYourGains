<!-- src/components/ui/popups/WeightPopup.vue -->
<template>
    <BasePopup :show="show"
               title="Neues Gewicht eintragen"
               variant="weight-goal-popup"
               @cancel="$emit('cancel')">
        <!-- Body -->
        <input ref="inputRef"
               :value="modelValue"
               type="number"
               :placeholder="placeholder"
               class="edit-input"
               @input="onInput"
               @keydown.enter.prevent="$emit('save')" />
        <!-- Footer-Buttons -->
        <template #actions>
            <PopupCancelButton @click="$emit('cancel')">Abbrechen</PopupCancelButton>
            <PopupSaveButton @click="$emit('confirm')">Download</PopupSaveButton>
        </template>

    </BasePopup>
</template>
<script setup lang="ts">
    import { ref, watch, nextTick } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'
    import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'

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
    const inputRef = ref<HTMLInputElement | null>(null)
    watch(() => props.show, async (open) => {
        if (open) {
            await nextTick()
            inputRef.value?.focus()
        }
    })
    function onInput(e: Event) {
        const t = e.target as HTMLInputElement
        const val = t.value === '' ? null : (isNaN(t.valueAsNumber) ? Number(t.value) : t.valueAsNumber)
        emit('update:modelValue', val)
    }
</script>