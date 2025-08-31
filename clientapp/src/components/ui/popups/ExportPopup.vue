<template>
    <BasePopup :show="show"
               title="Daten exportieren"
               variant="export-popup"
               @cancel="$emit('cancel')">
        <template #default>
            <div class="input-group">
                <label class="downloaddistance">Download-Format wählen:</label>
                <select ref="sel"
                        v-model="proxy"
                        class="edit-input">
                    <option value="html">HTML</option>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="txt">TXT</option>
                </select>
            </div>
        </template>
        <template #actions>
            <button class="popup-btn save-btn" @click="$emit('confirm')">Download</button>
            <button class="popup-btn cancel-btn" @click="$emit('cancel')">Abbrechen</button>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import BasePopup from './BasePopup.vue'

type Fmt = 'html'|'pdf'|'csv'|'json'|'txt'

const props = defineProps<{
  show: boolean
  modelValue: Fmt
}>()

const emit = defineEmits<{
  (e:'update:modelValue', v: Fmt): void
  (e:'confirm'): void
  (e:'cancel'): void
}>()

const proxy = computed<Fmt>({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v as Fmt)
})

const sel = ref<HTMLSelectElement|null>(null)
watch(() => props.show, async (open) => { if (open) { await nextTick(); sel.value?.focus() } })
</script>
