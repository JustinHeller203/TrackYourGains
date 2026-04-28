<template>
    <BasePopup :show="show"
               :title="t('builder.report.popupTitle')"
               overlayClass="auto-exercise-report-popup"
               :showActions="false"
               @cancel="$emit('cancel')">
        <div class="report-popup">
            <p class="report-popup__text">
                {{ reportQuestion }}
            </p>

            <UiPopupSelect :model-value="modelValue"
                           :placeholder="t('builder.report.reasonPlaceholder')"
                           :options="reasonOptions"
                           @update:model-value="emit('update:modelValue', $event)" />
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                {{ t('common.cancel') }}
            </PopupActionButton>
            <PopupActionButton :disabled="!modelValue || submitting" @click="$emit('submit')">
                {{ submitting ? t('common.sending') : t('common.send') }}
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'

    import { computed } from 'vue'
    import { useI18n } from '@/composables/useI18n'

    const props = defineProps<{
        show: boolean
        exerciseName: string
        modelValue: string | null
        submitting?: boolean
        reasonOptions: Array<{ value: string; label: string }>
    }>()

    const { t } = useI18n()

    const reportQuestion = computed(() =>
        props.exerciseName
            ? t('builder.report.questionWithExercise').replace('{exercise}', props.exerciseName)
            : t('builder.report.questionGeneric')
    )

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
