<!--Pfad: components/ui/popups/ExportPopup.vue-->

<template>
    <BasePopup :show="show"
               title="Daten exportieren"
               variant="export-popup"
               @cancel="$emit('cancel')">
        <template #default>
            <div class="input-group">
                <UiPopupSelect id="export-format"
                               ref="sel"
                               label="Download-Format wählen:"
                               placeholder="Format auswählen"
                               v-model="proxy"
                               :options="[
        { label: 'HTML', value: 'html' },
        { label: 'PDF', value: 'pdf' },
        { label: 'CSV', value: 'csv' },
        { label: 'JSON', value: 'json' },
        { label: 'TXT', value: 'txt' },
      ]" />
            </div>
        </template>
        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton autofocus @click="$emit('confirm')">
                Download
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue'
    import BasePopup from './BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'

    type Focusable = { focus: () => void }

    type Fmt = 'html' | 'pdf' | 'csv' | 'json' | 'txt'

    const props = defineProps<{
        show: boolean
        modelValue: Fmt
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', v: Fmt): void
        (e: 'confirm'): void
        (e: 'cancel'): void
    }>()

    const proxy = computed<Fmt>({
        get: () => props.modelValue,
        set: (v) => emit('update:modelValue', v as Fmt)
    })

    const sel = ref<Focusable | null>(null)
    watch(() => props.show, async (open) => {
        if (open) {
            await nextTick()
            sel.value?.focus()
        }
    })
</script>
