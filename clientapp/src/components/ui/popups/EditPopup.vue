<template>
    <BasePopup :show="modelValue"
               :title="title"
               overlayClass="edit-popup"
               @cancel="$emit('update:modelValue', false)">
        <div class="input-group">
            <input ref="inputEl"
                   v-model="localValue"
                   :type="inputType"
                   :placeholder="placeholder"
                   :min="inputType === 'number' ? 1 : undefined"
                   class="edit-input"
                   @keydown.enter.prevent="save" />
        </div>

        <!-- Aktionen über Slot, mit ausgelagerten Button-Komponenten -->
        <template #actions>
            <PopupSaveButton title="Speichern"
                             aria-label="Speichern"
                             @click="save" />
            <PopupCancelButton title="Abbrechen"
                               aria-label="Abbrechen"
                               @click="$emit('update:modelValue', false)" />
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted } from 'vue'
    import BasePopup from './BasePopup.vue'

    // Buttons (liegen relativ zu /popups in ../buttons)
    import PopupSaveButton from '../buttons/PopupSaveButton.vue'
    import PopupCancelButton from '../buttons/PopupCancelButton.vue'

    const props = defineProps<{
        modelValue: boolean
        title: string
        inputType: 'text' | 'number'
        placeholder: string
        value: string
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: boolean): void
        (e: 'save', v: string): void
        (e: 'cancel'): void
    }>()

    const localValue = ref(props.value)
    watch(() => props.value, v => (localValue.value = v))

    const inputEl = ref<HTMLInputElement | null>(null)
    onMounted(() => inputEl.value?.focus())

    const save = () => emit('save', localValue.value.trim())
</script>

<style scoped>
    /* Abstände im Popup */
    .popup .input-group {
        margin-bottom: 1.5rem;
    }

    .edit-popup .input-group {
        margin-bottom: 1rem;
    }

    /* Eingabefeld */
    .edit-input {
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        width: 100%;
        font-size: 0.9rem;
        background: var(--bg-secondary);
        color: var(--text-color);
    }

        .edit-input:focus {
            border-color: #4B6CB7;
            box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
            outline: none;
        }

    html.dark-mode .edit-input {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }
</style>
