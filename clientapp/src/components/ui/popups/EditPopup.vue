<template>
    <BasePopup :show="modelValue"
               :title="title"
               overlayClass="edit-popup"
               @click="emit('cancel'); $emit('update:modelValue', false)">
        <div class="input-group">
            <!-- NEU: Select -->
            <select v-if="inputType === 'select'"
                    ref="selectEl"
                    v-model="localValue"
                    class="edit-input"
                    @keydown.enter.prevent="save">
                <option v-for="opt in (options || [])" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                </option>
            </select>

            <!-- Bisheriges Input -->
            <input v-else
                   ref="inputEl"
                   v-model="localValue"
                   :type="inputType"
                   :placeholder="placeholder"
                   :min="inputType === 'number' ? 1 : undefined"
                   class="edit-input"
                   @keydown.enter.prevent="save" />
        </div>

        <template #actions>
            <PopupActionButton variant="ghost"
                               @click="$emit('update:modelValue', false)">
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
    import { ref, watch, onMounted, nextTick } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '../buttons/popup/PopupActionButton.vue'

    type InputKind = 'text' | 'number' | 'select'

    const props = defineProps<{
        modelValue: boolean
        title: string
        inputType: InputKind
        placeholder: string
        value: string
        options?: Array<{ label: string; value: string }>

        // NEU: Button-Label + Danger-Style steuerbar (z.B. "Entfernen")
        confirmText?: string
        confirmDanger?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: boolean): void
        (e: 'update:value', v: string): void
        (e: 'save', v: string): void
        (e: 'cancel'): void
    }>()

    const localValue = ref(props.value)

    watch(() => props.value, v => (localValue.value = v))

    watch(localValue, (v) => {
        emit('update:value', (v ?? '').toString())
    })

    const inputEl = ref<HTMLInputElement | null>(null)
    const selectEl = ref<HTMLSelectElement | null>(null)

    onMounted(async () => {
        await nextTick()
        if (props.inputType === 'select') selectEl.value?.focus()
        else inputEl.value?.focus()
    })

    const save = () => emit('save', (localValue.value ?? '').toString().trim())
</script>

<style scoped>
    .popup .input-group {
        margin-bottom: 1.5rem;
    }

    .edit-popup .input-group {
        margin-bottom: 1rem;
    }

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
