<!--components/ui/popups/CalendarDayPopup.vue-->
<template>
    <BasePopup :show="show"
               :title="title"
               overlayClass="calendar-day-popup"
               @cancel="emit('close')">

        <div class="day-popup">
            <div class="day-popup__summary">
                <div class="day-popup__date">{{ formattedDayLabel }}</div>
                <div class="day-popup__meta">
                    <span v-if="isRest" class="day-chip day-chip--rest">{{ t('calendarDayPopup.status.rest') }}</span>
                    <span v-else-if="isPlanned" class="day-chip day-chip--plan">{{ t('calendarDayPopup.status.planned') }}</span>
                    <span v-if="isCompleted" class="day-chip day-chip--done">{{ t('calendarDayPopup.status.completed') }}</span>
                </div>
            </div>

            <div v-if="allowComplete" class="day-popup__section">
                <div class="section-title">{{ t('calendarDayPopup.section.completion') }}</div>
                <div class="section-actions">
                    <PopupActionButton @click="toggleComplete">
                        {{ isCompleted ? t('calendarDayPopup.action.removeCompletion') : t('calendarDayPopup.action.markCompleted') }}
                    </PopupActionButton>
                </div>
            </div>

            <div v-if="allowPlan || allowEdit" class="day-popup__section">
                <div class="section-title">{{ t('calendarDayPopup.section.workout') }}</div>

                <UiPopupSelect v-model="localPlanId"
                               :label="t('calendarDayPopup.field.plan')"
                               :placeholder="t('calendarDayPopup.placeholder.selectPlan')"
                               :options="planOptions" />

                <div v-if="colorOptions?.length" class="color-block">
                    <div class="section-title">{{ t('calendarDayPopup.section.color') }}</div>
                    <div class="color-row">
                        <button v-for="c in colorOptions"
                                :key="c.value"
                                type="button"
                                class="color-chip"
                                :class="{ active: localColor === c.value }"
                                :style="{ background: c.value }"
                                :title="c.label"
                                @click="localColor = c.value">
                        </button>
                    </div>
                </div>

                <div class="section-actions">
                    <PopupActionButton :disabled="!canSubmitPlan" @click="submitPlan">
                        {{ allowEdit ? t('calendarDayPopup.action.savePlan') : t('calendarDayPopup.action.planWorkout') }}
                    </PopupActionButton>
                </div>
            </div>

            <div v-if="allowRest" class="day-popup__section">
                <div class="section-title">{{ t('calendarDayPopup.section.restDay') }}</div>
                <div class="section-actions">
                    <PopupActionButton variant="ghost" @click="toggleRest">
                        {{ isRest ? t('calendarDayPopup.action.removeRestDay') : t('calendarDayPopup.action.markRestDay') }}
                    </PopupActionButton>
                </div>
            </div>

            <div v-if="allowMove" class="day-popup__section">
                <div class="section-title">{{ t('calendarDayPopup.section.move') }}</div>
                <UiPopupInput v-model="moveTo"
                              type="date"
                              :label="t('calendarDayPopup.field.newDate')"
                              :min="minDate"
                              :placeholder="t('calendarDayPopup.placeholder.date')" />
                <div class="section-actions">
                    <PopupActionButton variant="ghost" :disabled="!moveTo" @click="submitMove">
                        {{ t('calendarDayPopup.action.move') }}
                    </PopupActionButton>
                </div>
            </div>

            <div v-if="allowClear" class="day-popup__section">
                <div class="section-actions">
                    <PopupActionButton danger @click="emit('clear', day)">
                        {{ t('calendarDayPopup.action.clearDay') }}
                    </PopupActionButton>
                </div>
            </div>
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="emit('close')">
                {{ t('common.close') }}
            </PopupActionButton>
        </template>

    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import { useI18n } from '@/composables/useI18n'

    type Option = { label: string; value: string }

    const props = withDefaults(defineProps<{
        show: boolean
        day: string
        dayLabel: string
        title?: string
        isToday?: boolean
        isFuture?: boolean
        isPlanned?: boolean
        isRest?: boolean
        isCompleted?: boolean
        allowComplete?: boolean
        allowPlan?: boolean
        allowEdit?: boolean
        allowRest?: boolean
        allowMove?: boolean
        allowClear?: boolean
        planOptions?: Option[]
        colorOptions?: Option[]
        defaultPlanId?: string
        defaultColor?: string
        minDate?: string
    }>(), {
        title: undefined,
        isToday: false,
        isFuture: false,
        isPlanned: false,
        isRest: false,
        isCompleted: false,
        allowComplete: false,
        allowPlan: false,
        allowEdit: false,
        allowRest: false,
        allowMove: false,
        allowClear: false,
        planOptions: () => [],
        colorOptions: () => [],
        defaultPlanId: '',
        defaultColor: '',
        minDate: ''
    })

    const emit = defineEmits<{
        (e: 'close'): void
        (e: 'complete', payload: { day: string; isCompleted: boolean; planId?: string | null }): void
        (e: 'plan', payload: { day: string; planId: string; color?: string }): void
        (e: 'update', payload: { day: string; planId: string; color?: string }): void
        (e: 'rest', payload: { day: string; isRest: boolean }): void
        (e: 'move', payload: { day: string; toDay: string }): void
        (e: 'clear', day: string): void
    }>()

    const { t, locale } = useI18n()

    const tp = (key: string, params: Record<string, string | number>) => {
        let text = t(key)

        for (const [paramKey, value] of Object.entries(params)) {
            text = text.replaceAll(`{${paramKey}}`, String(value))
        }

        return text
    }

    const localPlanId = ref('')
    const localColor = ref('')
    const moveTo = ref('')

    const dateLocale = computed(() => locale.value === 'en' ? 'en-US' : 'de-DE')

    const formattedDayLabel = computed(() => {
        const date = new Date(`${props.day}T12:00:00`)

        if (Number.isNaN(date.getTime())) {
            return props.dayLabel
        }

        return new Intl.DateTimeFormat(dateLocale.value, {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date)
    })

    const title = computed(() => props.title ?? tp('calendarDayPopup.title', { day: formattedDayLabel.value }))

    const syncState = () => {
        localPlanId.value = props.defaultPlanId || ''
        localColor.value = props.defaultColor || ''
        moveTo.value = ''
    }

    watch(
        () => props.show,
        (open) => {
            if (open) syncState()
        }
    )

    const canSubmitPlan = computed(() => !!localPlanId.value)

    const toggleComplete = () => {
        emit('complete', { day: props.day, isCompleted: !props.isCompleted, planId: localPlanId.value || undefined })
    }

    const submitPlan = () => {
        if (!localPlanId.value) return
        const payload = { day: props.day, planId: localPlanId.value, color: localColor.value || undefined }
        if (props.allowEdit) emit('update', payload)
        else emit('plan', payload)
    }

    const toggleRest = () => {
        emit('rest', { day: props.day, isRest: !props.isRest })
    }

    const submitMove = () => {
        if (!moveTo.value) return
        emit('move', { day: props.day, toDay: moveTo.value })
    }
</script>

<style scoped>
    .day-popup {
        display: grid;
        gap: .85rem;
    }

    .day-popup__summary {
        display: grid;
        gap: .4rem;
        padding: .65rem .8rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(148, 163, 184, 0.06);
    }

    .day-popup__date {
        font-weight: 900;
        color: var(--text-primary);
    }

    .day-popup__meta {
        display: flex;
        gap: .4rem;
        flex-wrap: wrap;
    }

    .day-chip {
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .02em;
        text-transform: uppercase;
        padding: .2rem .5rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        color: var(--text-secondary);
    }

    .day-chip--plan {
        border-color: rgba(129, 140, 248, 0.55);
        color: rgba(129, 140, 248, 0.95);
    }

    .day-chip--rest {
        border-color: rgba(59, 130, 246, 0.6);
        color: rgba(59, 130, 246, 0.95);
    }

    .day-chip--done {
        border-color: rgba(16, 185, 129, 0.6);
        color: rgba(16, 185, 129, 0.95);
    }

    .day-popup__section {
        display: grid;
        gap: .6rem;
        padding: .6rem .7rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(148, 163, 184, 0.05);
    }

    .section-title {
        font-weight: 800;
        color: var(--text-primary);
    }

    .section-actions {
        display: flex;
        gap: .6rem;
        flex-wrap: wrap;
    }

    .color-block {
        display: grid;
        gap: .4rem;
    }

    .color-row {
        display: flex;
        gap: .4rem;
        flex-wrap: wrap;
    }

    .color-chip {
        width: 24px;
        height: 24px;
        border-radius: 999px;
        border: 2px solid rgba(148, 163, 184, 0.4);
        cursor: pointer;
    }

        .color-chip.active {
            border-color: rgba(129, 140, 248, 0.8);
            box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
        }

    html.dark-mode .day-popup__summary,
    html.dark-mode .day-popup__section {
        background: rgba(2, 6, 23, 0.65);
        border-color: rgba(148, 163, 184, 0.3);
    }
</style>
