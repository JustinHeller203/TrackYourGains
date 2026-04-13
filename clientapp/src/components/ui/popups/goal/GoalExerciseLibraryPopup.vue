<template>
    <BasePopup :show="show"
               title="&Uuml;bungsbibliothek"
               overlayClass="goal-exercise-library-popup"
               :showActions="false"
               @cancel="emit('cancel')">
        <div class="goal-lib">
            <p class="goal-lib__intro">
                {{ props.intro || 'Wähle eine Übung aus der Bibliothek, damit Trainingsziele sauber erkannt und später automatisch getrackt werden.' }}
            </p>

            <div class="goal-lib__controls">
                <label class="goal-lib__search-field">
                    <span class="goal-lib__label">Suche</span>
                    <input v-model.trim="query"
                           class="goal-lib__search"
                           type="search"
                           placeholder="&Uuml;bung suchen, z. B. Bankdr&uuml;cken oder Latzug" />
                </label>

                <UiPopupSelect v-model="muscleFilter"
                               class="goal-lib__filter"
                               label="Muskelgruppe"
                               placeholder="Alle Muskelgruppen"
                               :options="muscleGroupOptions" />
            </div>

            <div class="goal-lib__summary">
                {{ filteredExercises.length }} &Uuml;bungen
            </div>

            <div class="goal-lib__list" role="list">
                <article v-for="exercise in filteredExercises"
                         :key="exercise.id"
                         class="goal-lib__item"
                         :class="{ 'is-active': exercise.id === selectedId }"
                         @click="selectExercise(exercise.id)">
                    <div class="goal-lib__card-top">
                        <div class="goal-lib__card-copy">
                            <span class="goal-lib__name">{{ exercise.name }}</span>
                            <div class="goal-lib__chips">
                                <span class="goal-lib__chip goal-lib__chip--primary">{{ exercise.muscleGroup }}</span>
                                <span class="goal-lib__chip">{{ kindLabel(exercise.kind) }}</span>
                                <span v-for="group in exercise.secondaryMuscleGroups.slice(0, 2)"
                                      :key="`${exercise.id}-${group}`"
                                      class="goal-lib__chip goal-lib__chip--muted">
                                    {{ group }}
                                </span>
                            </div>
                            <span v-if="exercise.aliases.length" class="goal-lib__aliases">
                                Alias: {{ exercise.aliases.slice(0, 3).join(', ') }}
                            </span>
                        </div>
                        <span v-if="exercise.id === selectedId" class="goal-lib__selected-badge">Aktiv</span>
                    </div>

                    <div class="goal-lib__card-actions">
                        <button type="button"
                                class="goal-lib__card-btn is-ghost"
                                @click.stop="openExerciseDetails(exercise)">
                            Details anzeigen
                        </button>
                        <button type="button"
                                class="goal-lib__card-btn"
                                @click.stop="selectExercise(exercise.id)">
                            {{ exercise.id === selectedId ? 'Übung ausgewählt' : 'Übung auswählen' }}
                        </button>
                    </div>
                </article>
            </div>

            <div class="goal-lib__actions">
                <PopupActionButton variant="ghost" @click="emit('cancel')">
                    Abbrechen
                </PopupActionButton>
                <PopupActionButton :disabled="!selectedExercise" @click="confirmSelection">
                    &Uuml;bung &uuml;bernehmen
                </PopupActionButton>
            </div>
        </div>
    </BasePopup>

    <TutorialDetailsPopup
        :show="Boolean(activeTutorial)"
        :tutorial="activeTutorial"
        :related-tutorials="relatedTutorials"
        :status-badges="[]"
        :show-favorite="false"
        :show-delete="false"
        overlay-class="tutorial-popup goal-exercise-detail-popup"
        @close="closeExerciseDetails"
        @open="openExerciseTutorial"
        @open-video="openTutorialVideo"
        @copy-link="copyTutorialLink" />
</template>

<script setup lang="ts">
import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
import BasePopup from '@/components/ui/popups/BasePopup.vue'
import TutorialDetailsPopup from '@/components/ui/popups/tutorial/TutorialDetailsPopup.vue'
import { getExerciseCatalog, type ExerciseMetadata } from '@/services/training/exerciseLibrary'
import { buildExerciseTutorialEntries, findExerciseTutorialByExerciseId, getSimilarTutorials } from '@/services/tutorialEntries'
import { useExerciseLibraryStore } from '@/store/exerciseLibraryStore'
import type { TutorialEntry } from '@/types/tutorials'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
    show: boolean
    modelValue?: string | null
    intro?: string
    allowedKinds?: readonly ExerciseMetadata['kind'][]
    allowedIds?: readonly string[]
}>()

const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'select', value: { id: string; name: string }): void
}>()

const exerciseLibraryStore = useExerciseLibraryStore()
const query = ref('')
const muscleFilter = ref('')
const selectedId = ref('')
const detailExercise = ref<ExerciseMetadata | null>(null)

const exercises = computed<ExerciseMetadata[]>(() => {
    if (exerciseLibraryStore.entries.length) return exerciseLibraryStore.entries
    return getExerciseCatalog()
})

const exerciseTutorials = computed<TutorialEntry[]>(() => buildExerciseTutorialEntries())
const activeTutorial = computed<TutorialEntry | null>(() =>
    detailExercise.value ? findExerciseTutorialByExerciseId(detailExercise.value.id, exerciseTutorials.value) : null
)
const relatedTutorials = computed(() =>
    getSimilarTutorials(exerciseTutorials.value, activeTutorial.value, 3)
)

const muscleGroups = computed(() =>
    Array.from(new Set(exercises.value.map(entry => entry.muscleGroup).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'de'))
)

const muscleGroupOptions = computed(() =>
    muscleGroups.value.map(group => ({ label: group, value: group }))
)

const filteredExercises = computed(() => {
    const normalizedQuery = query.value.trim().toLowerCase()
    return exercises.value
        .filter(entry => !props.allowedKinds?.length || props.allowedKinds.includes(entry.kind))
        .filter(entry => !props.allowedIds?.length || props.allowedIds.includes(entry.id))
        .filter(entry => !muscleFilter.value || entry.muscleGroup === muscleFilter.value)
        .filter(entry => {
            if (!normalizedQuery) return true
            const haystack = [entry.name, ...entry.aliases, entry.muscleGroup, ...entry.secondaryMuscleGroups]
                .join(' ')
                .toLowerCase()
            return haystack.includes(normalizedQuery)
        })
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'de'))
})

const selectedExercise = computed(() =>
    filteredExercises.value.find(entry => entry.id === selectedId.value)
    ?? exercises.value.find(entry => entry.id === selectedId.value)
    ?? null
)

function selectExercise(id: string) {
    selectedId.value = selectedId.value === id ? '' : id
}

function openExerciseDetails(exercise: ExerciseMetadata) {
    detailExercise.value = exercise
}

function closeExerciseDetails() {
    detailExercise.value = null
}

function openExerciseTutorial(tutorial: TutorialEntry) {
    const matchedExercise = exercises.value.find(entry => entry.id === tutorial.exerciseId)
    if (!matchedExercise) return
    detailExercise.value = matchedExercise
}

function toYouTubeWatchUrl(embedUrl: string) {
    const match = embedUrl.match(/youtube\.com\/embed\/([^?]+)/)
    return match?.[1] ? `https://www.youtube.com/watch?v=${match[1]}` : embedUrl
}

function openTutorialVideo(tutorial: TutorialEntry) {
    if (!tutorial.videoUrl) return
    window.open(tutorial.videoUrl.includes('youtube.com/embed/') ? toYouTubeWatchUrl(tutorial.videoUrl) : tutorial.videoUrl, '_blank', 'noopener,noreferrer')
}

async function copyTutorialLink(tutorial: TutorialEntry) {
    const link = !tutorial.videoUrl
        ? `${location.origin}${location.pathname}#tutorial-${tutorial.id}`
        : tutorial.videoUrl.includes('youtube.com/embed/')
            ? toYouTubeWatchUrl(tutorial.videoUrl)
            : tutorial.videoUrl
    try {
        await navigator.clipboard.writeText(link)
    } catch {
        const el = document.createElement('textarea')
        el.value = link
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
    }
}

function confirmSelection() {
    if (!selectedExercise.value) return
    emit('select', { id: selectedExercise.value.id, name: selectedExercise.value.name })
}

function kindLabel(kind: ExerciseMetadata['kind']) {
    return {
        strength: 'Kraft',
        cardio: 'Cardio',
        mobility: 'Mobilität',
    }[kind]
}

watch(() => props.show, (show) => {
    if (!show) return
    query.value = ''
    muscleFilter.value = ''
    selectedId.value = String(props.modelValue ?? '').trim()
})

onMounted(() => {
    void exerciseLibraryStore.load()
})
</script>

<style scoped>
.goal-lib {
    display: grid;
    gap: 14px;
    min-height: 0;
    height: 100%;
    --goal-lib-surface-border: rgba(148, 163, 184, 0.32);
    --goal-lib-surface-bg: color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
    --goal-lib-surface-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.42);
}

.goal-lib__intro,
.goal-lib__summary,
.goal-lib__meta,
.goal-lib__aliases {
    color: var(--text-secondary);
}

.goal-lib__intro,
.goal-lib__summary {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 700;
}

.goal-lib__controls {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(0, 1fr);
    gap: 10px;
    align-items: start;
}

.goal-lib__search-field {
    display: grid;
    gap: 0.45rem;
}

.goal-lib__label {
    font-size: 0.92rem;
    font-weight: 650;
    color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
    line-height: 1.2;
    margin: 0;
}

.goal-lib__search {
    min-height: 46px;
    width: 100%;
    padding: 0.86rem 0.95rem;
    border-radius: 14px;
    border: 1px solid var(--goal-lib-surface-border);
    background: var(--goal-lib-surface-bg);
    color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
    box-shadow: var(--goal-lib-surface-shadow);
    font-size: 0.98rem;
    line-height: 1.2;
    letter-spacing: 0.01em;
    font-family: inherit;
    transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease, background 0.16s ease;
}

.goal-lib__search:focus {
    outline: none;
}

.goal-lib__search:focus-visible {
    border-color: rgba(148, 163, 184, 0.55);
    background: color-mix(in srgb, #020617 84%, var(--bg-card) 16%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 3px rgba(99, 102, 241, 0.18), 0 20px 58px rgba(0, 0, 0, 0.55);
    transform: translateY(-1px);
}

.goal-lib__search::placeholder {
    color: rgba(148, 163, 184, 0.85);
}

.goal-lib__list {
    display: grid;
    align-content: start;
    flex: 1 1 auto;
    gap: 10px;
    min-height: 0;
    overflow: auto;
    padding: 4px 4px 10px;
}

.goal-lib__item {
    display: grid;
    gap: 12px;
    padding: 14px;
    border-radius: 14px;
    border: 1px solid rgba(148, 163, 184, 0.32);
    background: color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
    color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.42);
    transition: transform 140ms ease, border-color 160ms ease, box-shadow 180ms ease, background 180ms ease;
}

.goal-lib__item:hover {
    border-color: rgba(148, 163, 184, 0.32);
    background: color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.42);
    transform: none;
}

.goal-lib__item.is-active {
    transform: translateY(-1px);
    border-color: rgba(148, 163, 184, 0.55);
    background: color-mix(in srgb, #020617 84%, var(--bg-card) 16%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 3px rgba(99, 102, 241, 0.18), 0 20px 58px rgba(0, 0, 0, 0.55);
}

.goal-lib__card-top,
.goal-lib__card-actions {
    display: flex;
    gap: 10px;
    justify-content: space-between;
}

.goal-lib__card-top {
    align-items: flex-start;
}

.goal-lib__card-copy {
    display: grid;
    gap: 8px;
    min-width: 0;
}

.goal-lib__selected-badge {
    flex: 0 0 auto;
    border-radius: 999px;
    padding: 5px 9px;
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--text-primary);
    background: color-mix(in srgb, var(--accent-primary) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent-primary) 34%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-primary) 12%, transparent) inset;
}

.goal-lib__name {
    font-weight: 800;
    font-size: 1rem;
    line-height: 1.25;
}

.goal-lib__chips,
.goal-lib__aliases {
    font-size: 0.82rem;
}

.goal-lib__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.42rem;
}

.goal-lib__chip {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0.28rem 0.68rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--accent-primary) 26%, transparent);
    background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
    color: var(--text-primary);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.01em;
}

.goal-lib__chip--primary {
    border-color: color-mix(in srgb, var(--accent-primary) 40%, transparent);
    background: color-mix(in srgb, var(--accent-primary) 18%, transparent);
}

.goal-lib__chip--muted {
    border-color: color-mix(in srgb, var(--border-color) 78%, transparent);
    background: color-mix(in srgb, var(--bg-card) 72%, transparent);
    color: var(--text-secondary);
}

.goal-lib__aliases {
    line-height: 1.35;
}

.goal-lib__card-actions {
    flex-wrap: wrap;
}

.goal-lib__card-btn {
    min-height: 38px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--accent-primary) 30%, var(--border-color) 70%);
    background: color-mix(in srgb, var(--bg-card) 90%, var(--accent-primary) 10%);
    color: var(--text-primary);
    padding: 0.55rem 0.85rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 16%, transparent) inset;
    transition: border-color 160ms ease, background 160ms ease, transform 140ms ease, box-shadow 160ms ease;
}

.goal-lib__card-btn:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--accent-primary) 42%, var(--border-color) 58%);
    background: color-mix(in srgb, var(--bg-card) 82%, var(--accent-primary) 18%);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset;
}

.goal-lib__card-btn.is-ghost {
    background: transparent;
    border-color: color-mix(in srgb, var(--border-color) 78%, transparent);
    box-shadow: none;
}

.goal-lib__item.is-active .goal-lib__card-btn:not(.is-ghost) {
    border-color: color-mix(in srgb, var(--accent-primary) 46%, var(--border-color) 54%);
    background: color-mix(in srgb, var(--bg-card) 76%, var(--accent-primary) 24%);
}

.goal-lib__actions {
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
    padding: 14px 0 2px;
    background: transparent;
    border-top: 1px solid color-mix(in srgb, var(--border-color) 68%, transparent);
    box-shadow: 0 -10px 18px -18px rgba(15, 23, 42, 0.35);
    z-index: 2;
}

.exercise-tutorial-popup {
    display: grid;
    gap: 16px;
}

.exercise-tutorial-popup__media,
.exercise-tutorial-popup__empty,
.exercise-tutorial-popup__section {
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--border-color) 74%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 82%, var(--bg-card) 18%));
}

.exercise-tutorial-popup__frame {
    width: 100%;
    min-height: min(48vh, 360px);
    border: 0;
    border-radius: 18px;
}

.exercise-tutorial-popup__empty {
    padding: 18px;
    text-align: center;
    color: var(--text-secondary);
    font-weight: 600;
}

.exercise-tutorial-popup__meta {
    display: grid;
    gap: 8px;
}

.exercise-tutorial-popup__meta strong {
    font-size: 1.06rem;
}

.exercise-tutorial-popup__desc {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.5;
}

.exercise-tutorial-popup__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.exercise-tutorial-popup__chip {
    border-radius: 999px;
    padding: 6px 10px;
    background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
    color: var(--text-primary);
    font-size: 0.82rem;
    font-weight: 700;
}

.exercise-tutorial-popup__chip.is-muted {
    background: color-mix(in srgb, var(--bg-secondary) 86%, transparent);
}

.exercise-tutorial-popup__sections {
    display: grid;
    gap: 12px;
}

.exercise-tutorial-popup__section {
    padding: 16px;
}

.exercise-tutorial-popup__section h4 {
    margin: 0 0 10px;
}

.exercise-tutorial-popup__section ul {
    margin: 0;
    padding-left: 18px;
    display: grid;
    gap: 8px;
}

html.dark-mode .goal-lib__search,
html.dark-mode .exercise-tutorial-popup__media,
html.dark-mode .exercise-tutorial-popup__empty,
html.dark-mode .exercise-tutorial-popup__section {
    background: color-mix(in srgb, var(--bg-card) 94%, #10182f 6%);
    border-color: rgba(148, 163, 184, 0.38);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
}

@media (max-width: 680px) {
    .goal-lib__controls {
        grid-template-columns: 1fr;
    }

    .goal-lib__card-top,
    .goal-lib__card-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .goal-lib__selected-badge {
        align-self: flex-start;
    }

    .goal-lib__card-btn {
        width: 100%;
    }
}

html.dark-mode .goal-lib__search {
    border: 1px solid rgba(148, 163, 184, 0.32);
    background: color-mix(in srgb, #020617 78%, var(--bg-card) 22%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.55), 0 16px 46px rgba(0, 0, 0, 0.42);
}

html.dark-mode .goal-lib__search:focus-visible {
    border-color: rgba(148, 163, 184, 0.55);
    background: color-mix(in srgb, #020617 84%, var(--bg-card) 16%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 0 0 3px rgba(99, 102, 241, 0.18), 0 20px 58px rgba(0, 0, 0, 0.55);
}

html.dark-mode .goal-lib__selected-badge {
    color: #dbeafe;
    background: color-mix(in srgb, var(--accent-primary) 20%, #0f172a 80%);
    border-color: color-mix(in srgb, var(--accent-primary) 28%, transparent);
}

html.dark-mode .goal-lib__actions {
    border-top-color: rgba(148, 163, 184, 0.28);
    box-shadow: 0 -10px 18px -18px rgba(0, 0, 0, 0.65);
}

@media (max-width: 720px) {
    .goal-lib__controls {
        grid-template-columns: 1fr;
    }

    .goal-lib__card-top,
    .goal-lib__card-actions {
        flex-direction: column;
    }
}

:global(.goal-exercise-library-popup .popup) {
    max-height: min(88vh, 920px);
}

:global(.goal-exercise-library-popup .popup-body) {
    overflow: hidden;
    min-height: 0;
    display: flex;
    flex-direction: column;
}
</style>

