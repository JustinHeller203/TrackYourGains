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
            <button class="popup-btn cancel-btn" @click="$emit('cancel')">Abbrechen</button>
            <button class="popup-btn save-btn" @click="$emit('save')">Speichern</button>
        </template>
    </BasePopup>
</template>
<script setup lang="ts">
    import { ref, watch, nextTick } from 'vue'
    import BasePopup from './BasePopup.vue'
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