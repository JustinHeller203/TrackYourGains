<template>
    <div class="exercise-selector">
        <div class="exercise-selector__controls">
            <UiTrainingInput
                :id="id"
                v-model="query"
                :placeholder="placeholder"
                autocomplete="off"
                @keydown.enter.prevent="addFromKeyboard"
                @keydown.capture="handleDelimiter" />

            <UiSelect
                v-model="customMuscleGroupDraft"
                class="exercise-selector__muscle"
                placeholder="Muskelgruppe für neue Übung"
                :options="mutableMuscleGroupOptions" />

            <button
                type="button"
                class="exercise-selector__add"
                :disabled="!query.trim()"
                @click="addFromKeyboard">
                Hinzufügen
            </button>
        </div>

        <p class="exercise-selector__hint">
            Suche in der Übungsbibliothek. Wenn nichts passt, lege die Übung mit Muskelgruppe als eigenen Eintrag an.
        </p>

        <div v-if="query.trim()" class="exercise-selector__menu">
            <button
                v-for="result in suggestions"
                :key="result.exercise.id"
                type="button"
                class="exercise-selector__option"
                @click="addKnown(result)">
                <span class="exercise-selector__option-name">{{ result.exercise.name }}</span>
                <span class="exercise-selector__option-meta">{{ result.exercise.muscleGroup }} • {{ getMatchText(result.matchType, result.matchedOn) }}</span>
            </button>

            <button
                v-if="canAddCustom"
                type="button"
                class="exercise-selector__option exercise-selector__option--custom"
                @click="addCustom()">
                <span class="exercise-selector__option-name">Eigene Übung: {{ query.trim() }}</span>
                <span class="exercise-selector__option-meta">
                    {{ customMuscleGroupDraft || 'Bitte Muskelgruppe wählen' }}
                </span>
            </button>
        </div>

        <div v-if="modelValue.length" class="exercise-selector__tags" role="list">
            <button
                v-for="entry in modelValue"
                :key="entryKey(entry)"
                type="button"
                class="exercise-selector__tag"
                @click="removeEntry(entry)">
                <span>{{ entry.canonicalName }}</span>
                <small>{{ entryMeta(entry) }}</small>
                <span aria-hidden="true">x</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref } from 'vue'
    import UiSelect from '@/components/ui/kits/UiSelect.vue'
    import UiTrainingInput from '@/components/ui/kits/inputs/UiTrainingInput.vue'
    import { useExerciseLibraryStore } from '@/store/exerciseLibraryStore'
    import {
        createExerciseReference,
        normalizeExerciseText,
        searchExercises,
        type ExerciseSearchResult,
    } from '@/services/training/exerciseLibrary'
    import type { GeneratorExerciseReference } from '@/types/autoPlan'

    const props = defineProps<{
        id: string
        modelValue: GeneratorExerciseReference[]
        placeholder: string
        muscleGroupOptions: ReadonlyArray<{ value: string; label: string }>
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', value: GeneratorExerciseReference[]): void
    }>()

    const query = ref('')
    const customMuscleGroupDraft = ref<string | number | null>('')
    const exerciseLibraryStore = useExerciseLibraryStore()

    const suggestions = computed(() => searchExercises(query.value, 8))
    const mutableMuscleGroupOptions = computed(() => [...props.muscleGroupOptions])

    const canAddCustom = computed(() => {
        const value = query.value.trim()
        return !!value && typeof customMuscleGroupDraft.value === 'string' && !!customMuscleGroupDraft.value.trim()
    })

    const entryKey = (entry: GeneratorExerciseReference) =>
        entry.exerciseId || `${entry.source}:${normalizeExerciseText(entry.canonicalName)}:${entry.muscleGroup || ''}`

    const upsertEntry = (entry: GeneratorExerciseReference) => {
        const existing = new Map(props.modelValue.map((item) => [entryKey(item), item]))
        existing.set(entryKey(entry), entry)
        emit('update:modelValue', Array.from(existing.values()))
        query.value = ''
    }

    const addKnown = (result: ExerciseSearchResult) => {
        upsertEntry(createExerciseReference({
            label: result.exercise.name,
            canonicalName: result.exercise.name,
            exerciseId: result.exercise.id,
            muscleGroup: result.exercise.muscleGroup,
            source: 'known',
            matchType: result.matchType,
        }))
    }

    const addCustom = (forcedLabel?: string) => {
        const label = String(forcedLabel ?? query.value).trim()
        const muscleGroup = typeof customMuscleGroupDraft.value === 'string' ? customMuscleGroupDraft.value.trim() : ''
        if (!label || !muscleGroup) return
        upsertEntry(createExerciseReference({
            label,
            canonicalName: label,
            muscleGroup,
            source: 'custom',
            matchType: 'custom',
        }))
    }

    const addFromKeyboard = () => {
        const value = query.value.trim()
        if (!value) return
        const top = suggestions.value[0]
        if (top && top.score >= 90) {
            addKnown(top)
            return
        }
        addCustom(value)
    }

    const handleDelimiter = (event: KeyboardEvent) => {
        if (event.key !== ',') return
        event.preventDefault()
        addFromKeyboard()
    }

    const removeEntry = (entry: GeneratorExerciseReference) => {
        emit('update:modelValue', props.modelValue.filter((item) => entryKey(item) !== entryKey(entry)))
    }

    const getMatchText = (matchType: ExerciseSearchResult['matchType'], matchedOn: string) => {
        if (matchType === 'exact') return 'Exakte Übung'
        if (matchType === 'alias') return matchedOn === '' ? 'Bibliothek' : `Alias: ${matchedOn}`
        return `Ähnlich zu: ${matchedOn}`
    }

    const entryMeta = (entry: GeneratorExerciseReference) => {
        const typeLabel = entry.source === 'custom' ? 'Eigene Übung' : 'Bibliothek'
        return [entry.muscleGroup, typeLabel].filter(Boolean).join(' • ')
    }

    onMounted(() => {
        void exerciseLibraryStore.load()
    })
</script>

<style scoped>
    .exercise-selector {
        display: grid;
        gap: .55rem;
    }

    .exercise-selector__controls {
        display: grid;
        grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr) auto;
        gap: .55rem;
        align-items: start;
    }

    .exercise-selector__muscle {
        min-width: 0;
    }

    .exercise-selector__add {
        min-height: var(--control-height, 48px);
        padding: 0 .95rem;
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--accent-secondary) 45%, var(--border-color) 55%);
        background: color-mix(in srgb, var(--bg-card) 90%, var(--accent-secondary) 10%);
        color: var(--text-primary);
        font: inherit;
        font-weight: 600;
        cursor: pointer;
    }

    .exercise-selector__add:disabled {
        opacity: .55;
        cursor: not-allowed;
    }

    .exercise-selector__hint {
        margin: 0;
        font-size: .8rem;
        color: var(--text-secondary);
    }

    .exercise-selector__menu {
        display: grid;
        gap: .45rem;
        max-height: 230px;
        padding: .35rem;
        overflow: auto;
        border: 1px solid color-mix(in srgb, #64748b 38%, var(--border-color) 62%);
        border-radius: 12px;
        background: color-mix(in srgb, var(--bg-card) 94%, #0f172a 6%);
    }

    .exercise-selector__option {
        display: grid;
        gap: .12rem;
        padding: .7rem .8rem;
        text-align: left;
        border: 1px solid color-mix(in srgb, #64748b 30%, transparent);
        border-radius: 10px;
        background: color-mix(in srgb, var(--bg-secondary) 92%, #0f172a 8%);
        color: var(--text-primary);
        cursor: pointer;
    }

    .exercise-selector__option--custom {
        border-style: dashed;
    }

    .exercise-selector__option-name {
        font-size: .9rem;
        font-weight: 600;
    }

    .exercise-selector__option-meta {
        font-size: .78rem;
        color: var(--text-secondary);
    }

    .exercise-selector__tags {
        display: flex;
        flex-wrap: wrap;
        gap: .55rem;
    }

    .exercise-selector__tag {
        display: inline-flex;
        align-items: center;
        gap: .45rem;
        min-height: 36px;
        padding: .45rem .8rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, #64748b 42%, var(--border-color) 58%);
        background: color-mix(in srgb, var(--accent-secondary) 14%, var(--bg-card) 86%);
        color: var(--text-primary);
        font: inherit;
        cursor: pointer;
    }

    .exercise-selector__tag small {
        color: var(--text-secondary);
    }

    @media (max-width: 720px) {
        .exercise-selector__controls {
            grid-template-columns: 1fr;
        }
    }
</style>
