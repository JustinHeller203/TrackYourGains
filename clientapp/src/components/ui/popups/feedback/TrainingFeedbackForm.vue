<!-- components/ui/feedback/TrainingFeedbackForm.vue -->
<template>
    <BasePopup :show="show"
               :title="t('progress.trainingFeedback.title')"
               overlayClass="training-feedback-popup"
               :showClose="true"
               :show-actions="false"
               @cancel="onCancel">
        <div class="tf-root">
            <div class="tf-head">
                <div class="tf-title">{{ t('progress.trainingFeedback.headline') }}</div>
                <div class="tf-sub">
                    {{ t('progress.trainingFeedback.subhead') }}
                </div>
            </div>

            <div class="tf-grid">
                <div class="tf-card">
                    <div class="tf-q">{{ t('progress.trainingFeedback.questions.intensity') }}</div>
                    <div class="tf-scale">
                        <button v-for="n in ratingOptions"
                                :key="`int-${n}`"
                                type="button"
                                class="tf-pill"
                                :class="{ active: intensity === n }"
                                @click="intensity = n">
                            {{ n }}
                        </button>
                    </div>
                    <div class="tf-hint">{{ t('progress.trainingFeedback.hints.intensity') }}</div>
                </div>

                <div v-if="exerciseOptions.length" class="tf-card">
                    <div class="tf-q">{{ t('progress.trainingFeedback.questions.bestExercise') }}</div>
                    <UiPopupSelect id="feedback-best-ex"
                                   v-model="bestExercise"
                                   :placeholder="t('progress.trainingFeedback.placeholders.exercise')"
                                   :options="exerciseOptions"
                                   :disabled="false" />
                </div>

                <div v-if="hasStrengthLike" class="tf-card">
                    <div class="tf-q">{{ t('progress.trainingFeedback.questions.technique') }}</div>
                    <div class="tf-scale">
                        <button v-for="n in ratingOptions"
                                :key="`tech-${n}`"
                                type="button"
                                class="tf-pill"
                                :class="{ active: strengthTechnique === n }"
                                @click="strengthTechnique = n">
                            {{ n }}
                        </button>
                    </div>
                    <div class="tf-hint">{{ t('progress.trainingFeedback.hints.technique') }}</div>
                </div>

                <div v-if="hasCardio" class="tf-card">
                    <div class="tf-q">{{ t('progress.trainingFeedback.questions.cardio') }}</div>
                    <div class="tf-scale">
                        <button v-for="n in ratingOptions"
                                :key="`cardio-${n}`"
                                type="button"
                                class="tf-pill"
                                :class="{ active: cardioIntensity === n }"
                                @click="cardioIntensity = n">
                            {{ n }}
                        </button>
                    </div>
                    <div class="tf-hint">{{ t('progress.trainingFeedback.hints.cardio') }}</div>
                </div>

                <div v-if="hasStretch" class="tf-card">
                    <div class="tf-q">{{ t('progress.trainingFeedback.questions.stretchPain') }}</div>
                    <div class="tf-scale">
                        <button v-for="n in ratingOptions"
                                :key="`stretch-${n}`"
                                type="button"
                                class="tf-pill"
                                :class="{ active: stretchPain === n }"
                                @click="stretchPain = n">
                            {{ n }}
                        </button>
                    </div>
                    <div class="tf-hint">{{ t('progress.trainingFeedback.hints.stretchPain') }}</div>
                </div>

                <div class="tf-card">
                    <div class="tf-q">{{ t('progress.trainingFeedback.questions.note') }}</div>
                    <textarea v-model="note"
                              rows="3"
                              class="tf-textarea"
                              :placeholder="t('progress.trainingFeedback.placeholders.note')" />
                </div>
            </div>

            <div class="tf-actions">
                <template v-if="isReviewMode">
                    <PopupActionButton v-if="feedbackChanged" @click="submit">
                        {{ t('progress.trainingFeedback.actions.saveChanges') }}
                    </PopupActionButton>
                    <PopupActionButton v-else @click="close">
                        {{ t('common.close') }}
                    </PopupActionButton>
                </template>
                <template v-else>
                    <PopupActionButton variant="ghost" @click="skip">
                        {{ t('progress.trainingFeedback.actions.skip') }}
                    </PopupActionButton>
                    <PopupActionButton @click="submit">
                        {{ t('common.save') }}
                    </PopupActionButton>
                </template>
            </div>
        </div>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from "vue"
    import BasePopup from "@/components/ui/popups/BasePopup.vue"
    import PopupActionButton from "@/components/ui/buttons/popup/PopupActionButton.vue"
    import UiPopupSelect from "@/components/ui/kits/selects/UiPopupSelect.vue"
    import { useI18n } from '@/composables/useI18n'

    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'

    const props = defineProps<{
        show: boolean
        exercises?: Array<{ exercise: string; type?: ExerciseType }>
        initialFeedback?: {
            intensity?: number | null
            bestExercise?: string | null
            strengthTechnique?: number | null
            cardioIntensity?: number | null
            stretchPain?: number | null
            note?: string | null
        } | null
        readonly?: boolean
        reviewMode?: boolean
    }>()

    const emit = defineEmits<{
        (e: 'submit', payload: {
            intensity: number | null
            bestExercise: string | null
            strengthTechnique: number | null
            cardioIntensity: number | null
            stretchPain: number | null
            note: string
        }): void
        (e: 'skip'): void
        (e: 'close'): void
    }>()

    const { t } = useI18n()

    const ratingOptions = [1, 2, 3, 4, 5]

    const intensity = ref<number | null>(null)
    const bestExercise = ref<string | null>(null)
    const strengthTechnique = ref<number | null>(null)
    const cardioIntensity = ref<number | null>(null)
    const stretchPain = ref<number | null>(null)
    const note = ref('')

    const exerciseOptions = computed(() => {
        const list = (props.exercises ?? [])
            .map(ex => String(ex.exercise ?? '').trim())
            .filter(Boolean)

        const uniq = Array.from(new Set(list))
        return uniq.map(name => ({ label: name, value: name }))
    })

    const normType = (t?: ExerciseType): ExerciseType => t ?? 'kraft'

    const hasStrengthLike = computed(() => (props.exercises ?? [])
        .some(ex => {
            const nt = normType(ex.type)
            return nt === 'kraft' || nt === 'calisthenics'
        }))

    const hasCardio = computed(() => (props.exercises ?? [])
        .some(ex => normType(ex.type) === 'ausdauer'))

    const hasStretch = computed(() => (props.exercises ?? [])
        .some(ex => normType(ex.type) === 'dehnung'))

    const isReviewMode = computed(() => !!props.reviewMode || !!props.readonly)

    const resetForm = () => {
        const src = props.initialFeedback ?? null
        intensity.value = src?.intensity ?? null
        bestExercise.value = src?.bestExercise ?? null
        strengthTechnique.value = src?.strengthTechnique ?? null
        cardioIntensity.value = src?.cardioIntensity ?? null
        stretchPain.value = src?.stretchPain ?? null
        note.value = src?.note ?? ''
    }

    const submit = () => {
        emit('submit', {
            intensity: intensity.value,
            bestExercise: bestExercise.value,
            strengthTechnique: strengthTechnique.value,
            cardioIntensity: cardioIntensity.value,
            stretchPain: stretchPain.value,
            note: note.value.trim(),
        })
    }

    const skip = () => emit('skip')
    const close = () => emit('close')
    const onCancel = () => (isReviewMode.value ? close() : skip())

    const normalizePayload = (v?: {
        intensity?: number | null
        bestExercise?: string | null
        strengthTechnique?: number | null
        cardioIntensity?: number | null
        stretchPain?: number | null
        note?: string | null
    } | null) => ({
        intensity: v?.intensity ?? null,
        bestExercise: v?.bestExercise ?? null,
        strengthTechnique: v?.strengthTechnique ?? null,
        cardioIntensity: v?.cardioIntensity ?? null,
        stretchPain: v?.stretchPain ?? null,
        note: (v?.note ?? '').trim(),
    })

    const currentPayload = computed(() => normalizePayload({
        intensity: intensity.value,
        bestExercise: bestExercise.value,
        strengthTechnique: strengthTechnique.value,
        cardioIntensity: cardioIntensity.value,
        stretchPain: stretchPain.value,
        note: note.value,
    }))

    const initialPayloadNormalized = computed(() => normalizePayload(props.initialFeedback))

    const feedbackChanged = computed(() => {
        const a = currentPayload.value
        const b = initialPayloadNormalized.value
        return a.intensity !== b.intensity
            || a.bestExercise !== b.bestExercise
            || a.strengthTechnique !== b.strengthTechnique
            || a.cardioIntensity !== b.cardioIntensity
            || a.stretchPain !== b.stretchPain
            || a.note !== b.note
    })

    watch(() => props.show, (open) => {
        if (open) resetForm()
    })
</script>

<style scoped>
    .tf-root {
        display: grid;
        gap: 1rem;
        max-height: 58vh;
        overflow: auto;
        min-height: 0;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        padding-right: .15rem;
    }

    .tf-head {
        text-align: center;
    }

    .tf-title {
        font-size: 1.35rem;
        font-weight: 1000;
    }

    .tf-sub {
        margin-top: .25rem;
        opacity: .9;
    }

    .tf-grid {
        display: grid;
        gap: .75rem;
    }

    .tf-card {
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: rgba(0,0,0,.10);
        padding: .9rem;
        display: grid;
        gap: .65rem;
    }

    .tf-q {
        font-weight: 900;
    }

    .tf-scale {
        display: flex;
        flex-wrap: wrap;
        gap: .45rem;
    }

    .tf-pill {
        min-width: 44px;
        height: 40px;
        padding: 0 .65rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(0,0,0,.12);
        color: var(--text-primary);
        font-weight: 900;
        cursor: pointer;
        transition: transform 140ms ease, box-shadow 180ms ease, border-color 180ms ease, filter 180ms ease;
    }

    .tf-pill.active {
        color: #fff;
        border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(148,163,184,.22));
        background: linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 46%, rgba(0,0,0,.10)), rgba(0,0,0,.12));
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.08);
    }

    @media (hover:hover) {
        .tf-pill:hover {
            transform: translateY(-1px) scale(1.02);
            border-color: rgba(148,163,184,.38);
            box-shadow: 0 16px 36px rgba(15, 23, 42, 0.20);
        }
    }

    .tf-hint {
        opacity: .85;
        font-size: .92rem;
    }

    .tf-textarea {
        min-height: 90px;
        padding: .7rem .85rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(0,0,0,.10);
        color: var(--text-primary);
        font-weight: 600;
        resize: vertical;
        outline: none;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255,255,255,0.06);
    }

    .tf-textarea:focus-visible {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 18%, transparent), 0 16px 36px rgba(15, 23, 42, 0.18);
    }

    .tf-actions {
        display: flex;
        justify-content: flex-end;
        gap: .6rem;
        position: sticky;
        bottom: 0;
        z-index: 2;
        padding: .65rem 0 0;
        background: color-mix(in srgb, rgba(0,0,0,.18) 70%, transparent);
        border-top: 1px solid rgba(148, 163, 184, 0.16);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    @media (max-width: 760px) {
        .tf-actions {
            flex-direction: column;
        }
    }
</style>
