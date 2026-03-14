<template>
    <BasePopup
        :show="show"
        title="Übung melden"
        overlayClass="auto-exercise-report-popup"
        :showActions="false"
        @cancel="$emit('cancel')">
        <div class="report-popup">
            <p class="report-popup__text">
                {{ exerciseName ? `Was stimmt mit "${exerciseName}" nicht?` : 'Was stimmt mit der Übung nicht?' }}
            </p>

            <UiPopupSelect
                :model-value="modelValue"
                placeholder="Grund wählen"
                :options="reasonOptions"
                @update:model-value="emit('update:modelValue', $event)" />
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>
            <PopupActionButton :disabled="!modelValue || submitting" @click="$emit('submit')">
                {{ submitting ? 'Aktualisiert...' : 'Senden' }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'

    defineProps<{
        show: boolean
        exerciseName: string
        modelValue: string | null
        submitting?: boolean
        reasonOptions: Array<{ value: string; label: string }>
    }>()

    const emit = defineEmits<{
        (e: 'cancel'): void
        (e: 'submit'): void
        (e: 'update:modelValue', value: string): void
    }>()
</script>

<style scoped>
    .report-popup {
        display: grid;
        gap: .85rem;
    }

    .report-popup__text {
        margin: 0;
        color: var(--text-secondary);
        font-size: .96rem;
        line-height: 1.45;
    }
</style>
