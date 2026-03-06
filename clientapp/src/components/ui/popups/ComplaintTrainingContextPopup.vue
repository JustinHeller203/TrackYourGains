<template>
    <BasePopup :show="show"
               title="Beschwerde-Kontext"
               overlayClass="complaint-training-context-popup"
               :showActions="true"
               @cancel="$emit('cancel')"
               @save="onSave">
        <div class="ctx-body">
            <p class="ctx-question">
                Gibt es am <strong>{{ formattedDate }}</strong> einen Zusammenhang mit dem Training?
            </p>

            <div class="ctx-choice-row" role="group" aria-label="Trainingzusammenhang">
                <button type="button"
                        class="ctx-choice"
                        :class="{ active: duringTraining === false }"
                        @click="duringTraining = false">
                    Nein
                </button>
                <button type="button"
                        class="ctx-choice"
                        :class="{ active: duringTraining === true }"
                        @click="duringTraining = true">
                    Ja, während Training
                </button>
            </div>

            <div v-if="duringTraining === true" class="ctx-fields">
                <UiPopupSelect v-model="selectedExercise"
                               label="Übung"
                               placeholder="Übung wählen"
                               :options="exerciseSelectOptions" />

                <UiPopupInput v-if="selectedExercise === CUSTOM_OPTION"
                              v-model="customExercise"
                              label="Benutzerdefinierte Übung eingeben"
                              placeholder="z. B. Kniebeuge"
                              :maxlength="120" />
            </div>
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="$emit('cancel')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton :disabled="isSaveDisabled" @click="onSave">
                Übernehmen
            </PopupActionButton>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'

    type SavePayload = {
        duringTraining: boolean
        exercise?: string
    }

    const props = defineProps<{
        show: boolean
        date: string
        exerciseOptions: string[]
    }>()

    const emit = defineEmits<{
        (e: 'save', payload: SavePayload): void
        (e: 'cancel'): void
    }>()

    const CUSTOM_OPTION = '__custom__'
    const duringTraining = ref<boolean | null>(null)
    const selectedExercise = ref('')
    const customExercise = ref('')

    const exerciseSelectOptions = computed(() =>
        [
            ...(props.exerciseOptions ?? [])
            .map((name) => String(name ?? '').trim())
            .filter(Boolean)
            .map((name) => ({ label: name, value: name })),
            { label: 'Benutzerdefiniert…', value: CUSTOM_OPTION },
        ]
    )

    const formattedDate = computed(() => {
        const raw = String(props.date ?? '')
        if (!raw) return 'dem gewählten Datum'
        try {
            return new Intl.DateTimeFormat('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date(`${raw}T12:00:00`))
        } catch {
            return raw
        }
    })

    const resolvedExercise = computed(() => {
        if (selectedExercise.value === CUSTOM_OPTION) {
            return customExercise.value.trim()
        }
        return selectedExercise.value.trim()
    })

    const isSaveDisabled = computed(() => {
        if (duringTraining.value === null) return true
        if (duringTraining.value === false) return false
        return resolvedExercise.value.length === 0
    })

    const reset = () => {
        duringTraining.value = null
        selectedExercise.value = exerciseSelectOptions.value[0]?.value ?? ''
        customExercise.value = ''
    }

    watch(() => props.show, (isOpen) => {
        if (isOpen) reset()
    })

    const onSave = () => {
        if (isSaveDisabled.value) return
        if (!duringTraining.value) {
            emit('save', { duringTraining: false })
            return
        }

        emit('save', {
            duringTraining: true,
            exercise: resolvedExercise.value,
        })
    }
</script>

<style scoped>
    .ctx-body {
        display: grid;
        gap: 0.9rem;
    }

    .ctx-question {
        margin: 0;
        color: var(--text-primary);
        line-height: 1.45;
    }

    .ctx-choice-row {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
    }

    .ctx-choice {
        border: 1px solid rgba(148, 163, 184, 0.26);
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.1);
        color: var(--text-primary);
        font-weight: 700;
        padding: 0.55rem 0.8rem;
        cursor: pointer;
        transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
    }

    .ctx-choice.active {
        border-color: color-mix(in srgb, var(--accent-primary) 70%, rgba(148, 163, 184, 0.3));
        background: color-mix(in srgb, var(--accent-primary) 18%, transparent);
    }

    .ctx-choice:hover {
        transform: translateY(-1px);
    }

    .ctx-fields {
        display: grid;
        gap: 0.7rem;
    }
</style>
