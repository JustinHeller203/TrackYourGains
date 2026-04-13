<template>
    <div class="exercise-selector">
        <div class="exercise-selector__controls">
            <button
                type="button"
                class="exercise-selector__library"
                @click="showExerciseLibrary = true">
                <span class="exercise-selector__library-text">
                    {{ selectedLibraryExerciseLabel || placeholder }}
                </span>
            </button>

            <button
                type="button"
                class="exercise-selector__toggle"
                :class="{ 'is-active': customMode }"
                @click="toggleCustomMode">
                {{ customMode ? 'Bibliothek nutzen' : 'Eigene Übung' }}
            </button>
        </div>

        <transition name="exercise-selector__custom">
            <div v-if="customMode" class="exercise-selector__custom-row">
                <div class="exercise-selector__custom-field">
                    <span class="exercise-selector__field-label">Eigene Übung</span>
                    <UiTrainingInput
                        :id="id"
                        v-model="customExerciseName"
                        :placeholder="placeholder"
                        autocomplete="off"
                        @keydown.enter.prevent="addCustom()"
                        @keydown.capture="handleDelimiter" />
                </div>

                <div class="exercise-selector__custom-field">
                    <span class="exercise-selector__field-label">Muskelgruppe</span>
                    <UiSelect
                        v-model="customMuscleGroup"
                        class="exercise-selector__muscle-select"
                        placeholder="Muskelgruppe wählen"
                        :options="muscleGroupOptions || []" />
                    <p v-if="customError" class="exercise-selector__error">{{ customError }}</p>
                </div>

                <div class="exercise-selector__custom-actions">
                    <span class="exercise-selector__hint">Name und Muskelgruppe auswählen.</span>
                    <button
                        type="button"
                        class="exercise-selector__add"
                        :disabled="!customExerciseName.trim()"
                        @click="addCustom()">
                        Hinzufügen
                    </button>
                </div>
            </div>
        </transition>

        <div v-if="showCollapsedPreview" class="exercise-selector__preview-row">
            <div class="exercise-selector__tags exercise-selector__tags--preview" role="list">
                <span
                    v-for="entry in previewVisibleEntries"
                    :key="`preview-visible-${entryKey(entry)}`"
                    class="exercise-selector__tag"
                    :class="`is-${variant}`">
                    <span class="exercise-selector__tag-tone">{{ variantLabel }}</span>
                    <span class="exercise-selector__tag-name">{{ entry.canonicalName }}</span>
                    <span v-if="entry.muscleGroup" class="exercise-selector__tag-meta">{{ entry.muscleGroup }}</span>
                </span>
            </div>

            <button
                type="button"
                class="exercise-selector__stack-preview"
                :class="`is-${variant}`"
                @click="toggleTagExpansion">
                <span
                    v-for="(_, index) in overflowPreviewLayers"
                    :key="`overflow-${index}`"
                    class="exercise-selector__stack-card"
                    :style="{ '--stack-index': index }"></span>
                <span class="exercise-selector__stack-more">+{{ hiddenTagCount }}</span>
            </button>
        </div>

        <transition name="exercise-selector__expand">
            <div v-if="modelValue.length && !showCollapsedPreview" class="exercise-selector__tags" role="list">
                <TransitionGroup name="exercise-chip" tag="div" class="exercise-selector__tags-list">
                    <button
                        v-for="entry in modelValue"
                        :key="entryKey(entry)"
                        type="button"
                        class="exercise-selector__tag"
                        :class="`is-${variant}`"
                        @click="removeEntry(entry)">
                        <span class="exercise-selector__tag-tone">{{ variantLabel }}</span>
                        <span class="exercise-selector__tag-name">{{ entry.canonicalName }}</span>
                        <span v-if="entry.muscleGroup" class="exercise-selector__tag-meta">{{ entry.muscleGroup }}</span>
                        <span class="exercise-selector__tag-remove" aria-hidden="true">x</span>
                    </button>
                </TransitionGroup>

                <button
                    v-if="canCollapseTags"
                    type="button"
                    class="exercise-selector__collapse"
                    @click="toggleTagExpansion">
                    Einklappen
                </button>
            </div>
        </transition>

        <GoalExerciseLibraryPopup
            :show="showExerciseLibrary"
            :intro="libraryIntro"
            @cancel="showExerciseLibrary = false"
            @select="addKnownSelection" />
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref, watch } from 'vue'
    import UiSelect from '@/components/ui/kits/UiSelect.vue'
    import UiTrainingInput from '@/components/ui/kits/inputs/UiTrainingInput.vue'
    import GoalExerciseLibraryPopup from '@/components/ui/popups/goal/GoalExerciseLibraryPopup.vue'
    import { useExerciseLibraryStore } from '@/store/exerciseLibraryStore'
    import {
        createExerciseReference,
        normalizeExerciseText,
    } from '@/services/training/exerciseLibrary'
    import type { GeneratorExerciseReference } from '@/types/autoPlan'

    const props = defineProps<{
        id: string
        modelValue: GeneratorExerciseReference[]
        placeholder: string
        muscleGroupOptions?: Array<{ value: string; label: string }>
        variant?: 'preferred' | 'excluded'
    }>()

    const emit = defineEmits<{
        (e: 'update:modelValue', value: GeneratorExerciseReference[]): void
    }>()

    const customExerciseName = ref('')
    const customMuscleGroup = ref('')
    const customMode = ref(false)
    const showExerciseLibrary = ref(false)
    const showAllTags = ref(false)
    const customError = ref('')
    const exerciseLibraryStore = useExerciseLibraryStore()
    const selectedLibraryExerciseLabel = computed(() => '')
    const libraryIntro = computed(() => 'Suche in der Übungsbibliothek. Wenn nichts passt, lege die Übung als eigenen Eintrag an.')
    const variant = computed(() => props.variant ?? 'preferred')
    const variantLabel = computed(() => variant.value === 'excluded' ? 'Ausschluss' : 'Bevorzugt')
    const canCollapseTags = computed(() => props.modelValue.length > 3)
    const showCollapsedPreview = computed(() => canCollapseTags.value && !showAllTags.value)
    const previewVisibleEntries = computed(() => props.modelValue.slice(0, 3))
    const hiddenTagCount = computed(() => Math.max(0, props.modelValue.length - 3))
    const overflowPreviewLayers = computed(() => Array.from({ length: Math.min(hiddenTagCount.value, 3) }))

    const entryKey = (entry: GeneratorExerciseReference) =>
        entry.exerciseId || `${entry.source}:${normalizeExerciseText(entry.canonicalName)}:${entry.muscleGroup || ''}`

    const upsertEntry = (entry: GeneratorExerciseReference) => {
        const existing = new Map(props.modelValue.map((item) => [entryKey(item), item]))
        existing.set(entryKey(entry), entry)
        emit('update:modelValue', Array.from(existing.values()))
        customExerciseName.value = ''
        customMuscleGroup.value = ''
        customError.value = ''
    }

    const addKnownSelection = (selection: { id: string; name: string }) => {
        showExerciseLibrary.value = false
        upsertEntry(createExerciseReference({
            label: selection.name,
            canonicalName: selection.name,
            exerciseId: selection.id,
            source: 'known',
            matchType: 'exact',
        }))
    }

    const addCustom = (forcedLabel?: string) => {
        const label = String(forcedLabel ?? customExerciseName.value).trim()
        if (!label) return
        const muscleGroup = String(customMuscleGroup.value || '').trim()
        if (!muscleGroup) {
            customError.value = 'Muskelgruppe auswählen'
            return
        }
        upsertEntry(createExerciseReference({
            label,
            canonicalName: label,
            muscleGroup,
            source: 'custom',
            matchType: 'custom',
        }))
    }

    const toggleCustomMode = () => {
        customMode.value = !customMode.value
        if (!customMode.value) {
            customExerciseName.value = ''
            customMuscleGroup.value = ''
            customError.value = ''
        }
    }

    const handleDelimiter = (event: KeyboardEvent) => {
        if (event.key !== ',') return
        event.preventDefault()
        addCustom()
    }

    watch(customExerciseName, () => {
        if (!customExerciseName.value.trim()) customError.value = ''
    })

    watch(customMuscleGroup, () => {
        customError.value = ''
    })

    const removeEntry = (entry: GeneratorExerciseReference) => {
        emit('update:modelValue', props.modelValue.filter((item) => entryKey(item) !== entryKey(entry)))
        if (props.modelValue.length - 1 <= 3) showAllTags.value = false
    }

    const toggleTagExpansion = () => {
        if (!canCollapseTags.value) return
        showAllTags.value = !showAllTags.value
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
        grid-template-columns: minmax(0, 1fr) auto;
        gap: .55rem;
        align-items: start;
    }

    .exercise-selector__library {
        width: 100%;
        height: var(--control-height, 48px);
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding: 0 .9rem;
        border-radius: 12px;
        cursor: pointer;
        box-sizing: border-box;
        border: 2px solid color-mix(in srgb, var(--accent-primary) 42%, var(--border-color, #e5e7eb) 58%);
        background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), color-mix(in srgb, var(--bg-secondary, #f3f4f6) 86%, transparent);
        color: var(--text-primary, #111827);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 4px color-mix(in srgb, var(--accent-primary) 7%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
    }

    .exercise-selector__library:hover {
        border-color: color-mix(in srgb, var(--accent-primary) 56%, var(--border-color, #e5e7eb) 44%);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 30%, transparent) inset, 0 0 0 5px color-mix(in srgb, var(--accent-primary) 10%, transparent);
    }

    .exercise-selector__library:active {
        transform: translateY(1px) scale(.995);
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 3px color-mix(in srgb, var(--accent-primary) 9%, transparent);
    }

    .exercise-selector__library-text {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
        font-weight: 700;
    }

    .exercise-selector__toggle,
    .exercise-selector__add {
        min-height: var(--control-height, 48px);
        padding: 0 .95rem;
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--border-color) 80%, transparent);
        background: color-mix(in srgb, var(--bg-card) 94%, transparent);
        color: var(--text-primary);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34), 0 8px 18px rgba(15, 23, 42, 0.08);
        transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease, color .16s ease;
    }

    .exercise-selector__toggle:hover,
    .exercise-selector__add:hover {
        border-color: color-mix(in srgb, var(--accent-primary) 36%, var(--border-color));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.52), 0 10px 24px rgba(15, 23, 42, 0.1);
    }

    .exercise-selector__toggle:active,
    .exercise-selector__add:active,
    .exercise-selector__stack-preview:active,
    .exercise-selector__collapse:active {
        transform: translateY(1px) scale(.992);
    }

    .exercise-selector__toggle.is-active {
        border-color: color-mix(in srgb, var(--accent-primary) 56%, var(--border-color) 44%);
        background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 70%), color-mix(in srgb, var(--bg-secondary) 92%, var(--bg-card) 8%);
        color: color-mix(in srgb, var(--accent-primary) 82%, var(--text-primary) 18%);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 20%, transparent) inset;
    }

    .exercise-selector__add:disabled,
    .exercise-selector__library:disabled {
        opacity: .55;
        cursor: not-allowed;
    }

    .exercise-selector__custom-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
        gap: .55rem;
        align-items: end;
    }

    .exercise-selector__custom-field,
    .exercise-selector__custom-actions {
        display: grid;
        gap: .38rem;
        min-width: 0;
    }

    .exercise-selector__custom-actions {
        align-self: stretch;
    }

    .exercise-selector__custom-actions .exercise-selector__add {
        width: 100%;
    }

    .exercise-selector__field-label {
        font-size: .88rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .exercise-selector__hint {
        font-size: .8rem;
        color: var(--text-secondary);
        line-height: 1.25;
        min-height: 1em;
    }

    .exercise-selector__error {
        margin: 0;
        color: #ef4444;
        font-size: 0.9rem;
        font-weight: 650;
    }

    .exercise-selector__muscle-select {
        min-width: 0;
    }

    .exercise-selector__tags {
        display: flex;
        flex-wrap: wrap;
        gap: .55rem;
    }

    .exercise-selector__tags-list {
        display: contents;
    }

    .exercise-selector__preview-row {
        display: flex;
        align-items: center;
        gap: .7rem;
        min-width: 0;
    }

    .exercise-selector__tags--preview {
        flex: 1 1 auto;
        min-width: 0;
    }

    .exercise-selector__tags--preview .exercise-selector__tag {
        cursor: default;
        pointer-events: none;
    }

    .exercise-selector__stack-preview {
        position: relative;
        flex: 0 0 72px;
        width: 72px;
        min-height: 56px;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        display: block;
        text-align: left;
    }

    .exercise-selector__stack-card {
        position: absolute;
        left: calc(var(--stack-index) * 7px);
        right: calc(8px + (2 - var(--stack-index)) * 3px);
        top: calc(var(--stack-index) * 6px);
        min-height: 32px;
        border: 1px solid color-mix(in srgb, #64748b 42%, var(--border-color) 58%);
        border-radius: 999px;
        background: color-mix(in srgb, var(--bg-card) 96%, transparent);
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        pointer-events: none;
        transform: rotate(calc((var(--stack-index) - 1) * 0.8deg));
    }

    .exercise-selector__stack-more {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 38px;
        height: 38px;
        padding: 0 .7rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--bg-card) 96%, transparent);
        border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
        box-shadow: 0 10px 20px rgba(15, 23, 42, 0.10);
        font-size: .8rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .exercise-selector__tag {
        display: inline-flex;
        align-items: center;
        gap: .45rem;
        min-height: 36px;
        padding: .38rem .42rem .38rem .8rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, #64748b 42%, var(--border-color) 58%);
        background: color-mix(in srgb, var(--accent-secondary) 14%, var(--bg-card) 86%);
        color: var(--text-primary);
        font: inherit;
        cursor: pointer;
        transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
    }

    .exercise-selector__tag:hover {
        transform: translateY(-1px) scale(1.01);
        filter: saturate(1.03);
    }

    .exercise-selector__tag:active {
        transform: translateY(0) scale(.992);
    }

    .exercise-selector__collapse {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        padding: .38rem .8rem;
        border-radius: 999px;
        border: 1px dashed color-mix(in srgb, var(--border-color) 76%, transparent);
        background: transparent;
        color: var(--text-secondary);
        font: inherit;
        font-size: .82rem;
        font-weight: 700;
        cursor: pointer;
    }

    .exercise-selector__tag-tone {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        padding: .16rem .5rem;
        border-radius: 999px;
        font-size: .72rem;
        font-weight: 800;
        letter-spacing: .04em;
        text-transform: uppercase;
        background: rgba(255, 255, 255, 0.55);
        color: #0f172a;
    }

    .exercise-selector__tag-name {
        font-weight: 700;
    }

    .exercise-selector__tag-meta {
        font-size: .76rem;
        font-weight: 700;
        padding: .12rem .48rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.44);
        color: currentColor;
    }

    .exercise-selector__tag-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 999px;
        font-size: .95rem;
        line-height: 1;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.52);
        color: currentColor;
        flex: 0 0 auto;
    }

    .exercise-selector__tag.is-preferred {
        border-color: color-mix(in srgb, #10b981 42%, var(--border-color) 58%);
        background: linear-gradient(180deg, color-mix(in srgb, #10b981 15%, var(--bg-card) 85%), color-mix(in srgb, var(--bg-card) 92%, #ecfdf5 8%));
        color: #065f46;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38), 0 10px 20px rgba(16, 185, 129, 0.10);
    }

    .exercise-selector__tag.is-preferred .exercise-selector__tag-tone {
        background: rgba(16, 185, 129, 0.16);
        color: #047857;
    }

    .exercise-selector__tag.is-preferred .exercise-selector__tag-remove {
        background: rgba(16, 185, 129, 0.14);
        color: #047857;
    }

    .exercise-selector__stack-preview.is-preferred .exercise-selector__stack-card {
        border-color: color-mix(in srgb, #10b981 38%, var(--border-color) 62%);
        background: linear-gradient(180deg, color-mix(in srgb, #10b981 13%, var(--bg-card) 87%), color-mix(in srgb, var(--bg-card) 95%, #ecfdf5 5%));
        color: #065f46;
    }

    .exercise-selector__tag.is-excluded {
        border-color: color-mix(in srgb, #ef4444 42%, var(--border-color) 58%);
        background: linear-gradient(180deg, color-mix(in srgb, #ef4444 13%, var(--bg-card) 87%), color-mix(in srgb, var(--bg-card) 92%, #fef2f2 8%));
        color: #991b1b;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.38), 0 10px 20px rgba(239, 68, 68, 0.10);
    }

    .exercise-selector__tag.is-excluded .exercise-selector__tag-tone {
        background: rgba(239, 68, 68, 0.14);
        color: #b91c1c;
    }

    .exercise-selector__tag.is-excluded .exercise-selector__tag-remove {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
    }

    .exercise-selector__stack-preview.is-excluded .exercise-selector__stack-card {
        border-color: color-mix(in srgb, #ef4444 38%, var(--border-color) 62%);
        background: linear-gradient(180deg, color-mix(in srgb, #ef4444 11%, var(--bg-card) 89%), color-mix(in srgb, var(--bg-card) 95%, #fef2f2 5%));
        color: #991b1b;
    }

    html.dark-mode .exercise-selector__library {
        border-color: color-mix(in srgb, rgba(129, 140, 248, 0.85) 52%, rgba(148, 163, 184, 0.35) 48%);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.14), transparent 58%), rgba(2, 6, 23, 0.48);
        color: #fff;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(129, 140, 248, 0.22) inset, 0 0 0 5px rgba(129, 140, 248, 0.10);
    }

    html.dark-mode .exercise-selector__toggle,
    html.dark-mode .exercise-selector__add {
        border-color: rgba(148, 163, 184, 0.34);
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(2, 6, 23, 0.92));
        color: #e2e8f0;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 24px rgba(0, 0, 0, 0.24);
    }

    html.dark-mode .exercise-selector__toggle.is-active {
        border-color: rgba(129, 140, 248, 0.54);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.18), transparent 68%), rgba(15, 23, 42, 0.92);
        color: #c7d2fe;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(129, 140, 248, 0.18) inset;
    }

    html.dark-mode .exercise-selector__stack-more,
    html.dark-mode .exercise-selector__collapse {
        background: rgba(15, 23, 42, 0.9);
        border-color: rgba(148, 163, 184, 0.3);
        color: #cbd5e1;
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
    }

    html.dark-mode .exercise-selector__tag.is-preferred {
        border-color: rgba(16, 185, 129, 0.34);
        background: linear-gradient(180deg, rgba(6, 95, 70, 0.36), rgba(2, 44, 34, 0.46));
        color: #d1fae5;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 10px 24px rgba(0, 0, 0, 0.24);
    }

    html.dark-mode .exercise-selector__tag.is-preferred .exercise-selector__tag-tone {
        background: rgba(16, 185, 129, 0.18);
        color: #a7f3d0;
    }

    html.dark-mode .exercise-selector__tag.is-preferred .exercise-selector__tag-remove {
        background: rgba(16, 185, 129, 0.16);
        color: #a7f3d0;
    }

    html.dark-mode .exercise-selector__stack-preview.is-preferred .exercise-selector__stack-card {
        border-color: rgba(16, 185, 129, 0.34);
        background: linear-gradient(180deg, rgba(6, 95, 70, 0.36), rgba(2, 44, 34, 0.46));
        color: #d1fae5;
    }

    html.dark-mode .exercise-selector__tag.is-excluded {
        border-color: rgba(239, 68, 68, 0.34);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.4), rgba(69, 10, 10, 0.44));
        color: #fecaca;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 10px 24px rgba(0, 0, 0, 0.24);
    }

    html.dark-mode .exercise-selector__tag.is-excluded .exercise-selector__tag-tone {
        background: rgba(239, 68, 68, 0.16);
        color: #fca5a5;
    }

    html.dark-mode .exercise-selector__tag.is-excluded .exercise-selector__tag-remove {
        background: rgba(239, 68, 68, 0.14);
        color: #fca5a5;
    }

    html.dark-mode .exercise-selector__stack-preview.is-excluded .exercise-selector__stack-card {
        border-color: rgba(239, 68, 68, 0.34);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.4), rgba(69, 10, 10, 0.44));
        color: #fecaca;
    }

    .exercise-selector__expand-enter-active,
    .exercise-selector__expand-leave-active {
        transition: opacity .24s ease, transform .24s ease, max-height .28s ease;
        transform-origin: top;
        overflow: hidden;
    }

    .exercise-selector__expand-enter-from,
    .exercise-selector__expand-leave-to {
        opacity: 0;
        transform: translateY(-8px) scale(.98);
        max-height: 0;
    }

    .exercise-selector__expand-enter-to,
    .exercise-selector__expand-leave-from {
        opacity: 1;
        transform: translateY(0) scale(1);
        max-height: 320px;
    }

    .exercise-selector__custom-enter-active,
    .exercise-selector__custom-leave-active {
        transition: opacity .24s ease, transform .24s ease, max-height .28s ease;
        transform-origin: top;
        overflow: hidden;
    }

    .exercise-selector__custom-enter-from,
    .exercise-selector__custom-leave-to {
        opacity: 0;
        transform: translateY(-8px) scale(.98);
        max-height: 0;
    }

    .exercise-selector__custom-enter-to,
    .exercise-selector__custom-leave-from {
        opacity: 1;
        transform: translateY(0) scale(1);
        max-height: 220px;
    }

    .exercise-chip-enter-active,
    .exercise-chip-leave-active,
    .exercise-chip-move {
        transition: transform .24s cubic-bezier(0.22, 0.61, 0.36, 1), opacity .22s ease;
    }

    .exercise-chip-enter-from,
    .exercise-chip-leave-to {
        opacity: 0;
        transform: translateY(10px) scale(.92);
    }

    @media (max-width: 980px) {
        .exercise-selector__custom-row {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 720px) {
        .exercise-selector__controls {
            grid-template-columns: 1fr;
        }

        .exercise-selector__preview-row {
            align-items: flex-start;
            flex-direction: column;
        }
    }
</style>
