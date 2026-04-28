<template>
    <BasePopup :show="libraryVisible"
               :title="t('goals.library.title')"
               :overlayClass="popupOverlayClass"
               :showActions="false"
                @cancel="emit('cancel')">
        <div class="goal-lib">
            <p class="goal-lib__intro">
                {{ props.intro || t('goals.library.intro') }}
            </p>

            <div class="goal-lib__controls">
                <label class="goal-lib__search-field">
                    <span class="goal-lib__label">{{ t('goals.library.searchLabel') }}</span>
                    <input v-model.trim="query"
                           class="goal-lib__search"
                           type="search"
                           :placeholder="t('goals.library.searchPlaceholder')" />
                </label>

                <div class="goal-lib__filter-row">
                    <UiPopupSelect v-model="muscleFilter"
                                   class="goal-lib__filter"
                                   :label="t('goals.library.muscleGroupLabel')"
                                   :placeholder="t('goals.library.allMuscleGroups')"
                                   :options="muscleGroupOptions" />
                    <button type="button"
                            class="goal-lib__add-btn"
                            :aria-label="t('goals.library.addCustomExercise')"
                            :title="t('goals.library.addCustomExercise')"
                            @click="openCreatePopup">
                        +
                    </button>
                </div>
            </div>

            <div class="goal-lib__summary">
                {{ tp('goals.library.exerciseCount', { count: filteredExercises.length }) }}
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
                                <span v-if="shouldShowPrimaryChip(exercise)"
                                      class="goal-lib__chip goal-lib__chip--primary">{{ muscleGroupLabel(exercise.muscleGroup) }}</span>
                                <span class="goal-lib__chip">{{ kindLabel(exercise.kind) }}</span>
                                <span v-if="exercise.equipment.length"
                                      class="goal-lib__chip goal-lib__chip--muted">{{ equipmentLabel(exercise.equipment[0]) }}</span>
                                <span class="goal-lib__chip goal-lib__chip--muted">{{ levelLabel(exercise.level) }}</span>
                                <span v-for="group in exercise.secondaryMuscleGroups.slice(0, 2)"
                                      :key="`${exercise.id}-${group}`"
                                      class="goal-lib__chip goal-lib__chip--muted">
                                    {{ muscleGroupLabel(group) }}
                                </span>
                            </div>
                            <span v-if="exercise.aliases.length" class="goal-lib__aliases">
                                {{ t('goals.library.aliases') }}: {{ exercise.aliases.slice(0, 3).join(', ') }}
                            </span>
                        </div>
                        <span v-if="exercise.id === selectedId" class="goal-lib__selected-badge">{{ t('goals.library.active') }}</span>
                    </div>

                    <div class="goal-lib__card-actions">
                        <button type="button"
                                class="goal-lib__card-btn is-ghost"
                                @click.stop="openExerciseDetails(exercise)">
                            {{ t('goals.library.showDetails') }}
                        </button>
                        <button type="button"
                                class="goal-lib__card-btn"
                                @click.stop="selectExercise(exercise.id)">
                            {{ exercise.id === selectedId ? t('goals.library.exerciseSelected') : t('goals.library.selectExercise') }}
                        </button>
                    </div>
                </article>
            </div>

            <div class="goal-lib__actions">
                <PopupActionButton variant="ghost" @click="emit('cancel')">
                    {{ t('common.cancel') }}
                </PopupActionButton>
                <PopupActionButton :disabled="!selectedExercise" @click="confirmSelection">
                    {{ t('goals.library.confirmExercise') }}
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

    <ExerciseComposerPopup
        :show="showCreatePopup"
        :error="composerError"
        @cancel="showCreatePopup = false"
        @save="handleCustomExerciseSave" />
</template>

<script setup lang="ts">
import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
import ExerciseComposerPopup, { type ExerciseComposerPayload } from '@/components/ui/popups/goal/ExerciseComposerPopup.vue'
import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
import BasePopup from '@/components/ui/popups/BasePopup.vue'
import TutorialDetailsPopup from '@/components/ui/popups/tutorial/TutorialDetailsPopup.vue'
import { useI18n } from '@/composables/useI18n'
import { getExerciseCatalog, type EquipmentTag, type ExerciseMetadata } from '@/services/training/exerciseLibrary'
import { buildExerciseTutorialEntries, findExerciseTutorialByExerciseId, getSimilarTutorials } from '@/services/tutorialEntries'
import { useExerciseLibraryStore } from '@/store/exerciseLibraryStore'
import type { TrainingLevel } from '@/types/autoPlan'
import type { TutorialEntry } from '@/types/tutorials'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
    show: boolean
    modelValue?: string | null
    intro?: string
    allowedKinds?: readonly ExerciseMetadata['kind'][]
    allowedIds?: readonly string[]
    openCreateForm?: boolean
}>()

const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'select', value: { id: string; name: string }): void
}>()

const exerciseLibraryStore = useExerciseLibraryStore()
const { t } = useI18n()
const query = ref('')
const muscleFilter = ref('')
const selectedId = ref('')
const detailExercise = ref<ExerciseMetadata | null>(null)
const showCreatePopup = ref(false)
const composerError = ref('')
const popupOverlayClass = computed(() => ['goal-exercise-library-popup'])
const libraryVisible = computed(() => props.show && !showCreatePopup.value)

function tp(key: string, params: Record<string, string | number>) {
    return Object.entries(params).reduce(
        (text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
        t(key)
    )
}

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

function splitCommaList(value: string) {
    return value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
}

function openCreatePopup() {
    composerError.value = ''
    showCreatePopup.value = true
}

function handleCustomExerciseSave(payload: ExerciseComposerPayload) {
    try {
        composerError.value = ''
        const created = exerciseLibraryStore.addCustomExercise({
            name: payload.name,
            kind: payload.kind,
            equipment: payload.equipment,
            level: payload.level,
            muscleGroup: payload.muscleGroup,
            aliases: payload.aliases,
            secondaryMuscleGroups: payload.secondaryMuscleGroups,
            tutorial: payload.tutorial ?? null,
        })
        selectedId.value = created.id
        query.value = created.name
        muscleFilter.value = ''
        showCreatePopup.value = false
    } catch (error) {
        composerError.value = error instanceof Error ? error.message : t('goals.library.saveExerciseFailed')
    }
}

function kindLabel(kind: ExerciseMetadata['kind']) {
    return {
        strength: t('goals.exerciseKind.strength'),
        cardio: t('goals.exerciseKind.cardio'),
        mobility: t('goals.exerciseKind.mobility'),
    }[kind]
}

function equipmentLabel(equipment: EquipmentTag) {
    return {
        bodyweight: t('goals.equipment.bodyweight'),
        dumbbell: t('goals.equipment.dumbbell'),
        barbell: t('goals.equipment.barbell'),
        machine: t('goals.equipment.machine'),
        cable: t('goals.equipment.cable'),
        cardio_machine: t('goals.equipment.cardioMachine'),
        band: t('goals.equipment.band'),
    }[equipment]
}

function levelLabel(level: TrainingLevel) {
    return {
        beginner: t('goals.level.beginner'),
        intermediate: t('goals.level.intermediate'),
        advanced: t('goals.level.advanced'),
    }[level]
}

function muscleGroupLabel(group: string) {
    return {
        Brust: t('goals.muscle.chest'),
        'Rücken': t('goals.muscle.back'),
        Beine: t('goals.muscle.legs'),
        Schultern: t('goals.muscle.shoulders'),
        Arme: t('goals.muscle.arms'),
        Core: t('goals.muscle.core'),
        'Gesäß': t('goals.muscle.glutes'),
        Ganzkörper: t('goals.muscle.fullBody'),
        Cardio: t('goals.exerciseKind.cardio'),
        Dehnung: t('goals.exerciseKind.mobility'),
    }[group] ?? group
}

function normalizeChipLabel(value: string) {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase()
    if (normalized === 'mobility') return 'mobilität'
    return normalized
}

function shouldShowPrimaryChip(exercise: ExerciseMetadata) {
    const primary = normalizeChipLabel(exercise.muscleGroup ?? '')
    const kind = normalizeChipLabel(kindLabel(exercise.kind) ?? '')
    return !!primary && primary !== kind
}

watch(() => props.show, (show) => {
    if (!show) {
        showCreatePopup.value = false
        composerError.value = ''
        return
    }
    query.value = ''
    muscleFilter.value = ''
    composerError.value = ''
    selectedId.value = String(props.modelValue ?? '').trim()
    showCreatePopup.value = !!props.openCreateForm
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

.goal-lib__filter-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: end;
}

.goal-lib__create {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.goal-lib__create.is-open {
    grid-template-rows: 1fr;
}

.goal-lib__create-shell {
    min-height: 0;
    overflow: hidden;
}

.goal-lib__add-btn {
    width: 46px;
    min-width: 46px;
    height: 46px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--accent-primary) 26%, var(--goal-lib-surface-border) 74%);
    background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 42%),
        radial-gradient(circle at bottom left, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 44%),
        color-mix(in srgb, #020617 82%, var(--bg-card) 18%);
    color: color-mix(in srgb, var(--text-primary) 94%, #ffffff 6%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.45), 0 18px 42px rgba(0, 0, 0, 0.32);
    cursor: pointer;
    display: inline-grid;
    place-items: center;
    font-size: 1.3rem;
    font-weight: 900;
    line-height: 1;
    transition: transform 140ms ease, border-color 160ms ease, box-shadow 180ms ease, background 180ms ease;
}

.goal-lib__add-btn[aria-expanded="true"] {
    transform: rotate(180deg);
}

.goal-lib__add-btn:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--accent-primary) 40%, var(--goal-lib-surface-border) 60%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 20px 50px rgba(0, 0, 0, 0.38);
}

.goal-lib__add-btn[aria-expanded="true"]:hover {
    transform: rotate(180deg) translateY(-1px);
}

.goal-lib__create-head {
    display: grid;
    gap: 6px;
}

.goal-lib__create-copy {
    display: grid;
    gap: 4px;
    min-width: 0;
}

.goal-lib__create-kicker {
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--accent-primary) 72%, #ffffff 28%);
}

.goal-lib__create-sub {
    color: var(--text-secondary);
    font-size: 0.84rem;
    font-weight: 600;
    line-height: 1.35;
}

.goal-lib__create-panel {
    position: relative;
    display: grid;
    gap: 12px;
    padding: 16px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--border-color) 76%, transparent);
    background: color-mix(in srgb, #020617 80%, var(--bg-card) 20%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 16px 40px rgba(0, 0, 0, 0.28);
    opacity: 0;
    transform: translateY(-8px) scale(0.988);
    transform-origin: top center;
    transition: opacity 220ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
}

.goal-lib__create.is-open .goal-lib__create-panel {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
}

.goal-lib__create-panel--spotlight {
    border-color: color-mix(in srgb, var(--accent-primary) 48%, var(--border-color) 52%);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.04),
        0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent),
        0 16px 40px rgba(0, 0, 0, 0.28);
    animation:
        goal-lib-create-panel-pop 760ms cubic-bezier(0.22, 1, 0.36, 1) both,
        goal-lib-create-panel-blink 980ms ease-in-out both;
}

.goal-lib__create-panel--spotlight::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    border: 1px solid color-mix(in srgb, var(--accent-primary) 36%, transparent);
    pointer-events: none;
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 0%, transparent);
    animation: goal-lib-create-panel-ring 980ms ease-out both;
}

.goal-lib__create-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.goal-lib__composer {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
    gap: 14px;
    align-items: start;
}

.goal-lib__composer-form,
.goal-lib__composer-preview {
    min-width: 0;
}

.goal-lib__builder-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.goal-lib__builder-card,
.goal-lib__preview-shell {
    display: grid;
    gap: 12px;
    padding: 16px;
    border-radius: 20px;
    border: 1px solid color-mix(in srgb, var(--border-color) 76%, transparent);
    background: color-mix(in srgb, #020617 82%, var(--bg-card) 18%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 16px 40px rgba(0, 0, 0, 0.24);
}

.goal-lib__builder-head {
    display: grid;
    gap: 4px;
}

.goal-lib__textarea {
    resize: vertical;
    min-height: 112px;
}

.goal-lib__textarea--compact {
    min-height: 132px;
}

.goal-lib__chip-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
}

.goal-lib__toggle-chip {
    border: 1px solid rgba(148, 163, 184, 0.24);
    background: rgba(255, 255, 255, 0.04);
    color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
    min-height: 2.2rem;
    padding: 0.42rem 0.82rem;
    border-radius: 999px;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: transform 140ms ease, border-color 140ms ease, background 160ms ease, box-shadow 160ms ease;
}

.goal-lib__toggle-chip:hover {
    transform: translateY(-1px);
    border-color: rgba(129, 140, 248, 0.34);
}

.goal-lib__toggle-chip.is-active {
    border-color: rgba(129, 140, 248, 0.54);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(56, 189, 248, 0.12));
    box-shadow: 0 0 0 1px rgba(129, 140, 248, 0.16) inset;
}

.goal-lib__level-builder {
    padding-top: 0.25rem;
}

.goal-lib__level-rail {
    position: relative;
    min-height: 74px;
}

.goal-lib__level-rail-line {
    position: absolute;
    left: 0;
    right: 0;
    top: 15px;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.28), rgba(239, 68, 68, 0.22));
    border: 1px solid rgba(148, 163, 184, 0.16);
}

.goal-lib__level-stop {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    display: grid;
    justify-items: center;
    gap: 0.55rem;
    border: 0;
    background: transparent;
    color: var(--text-secondary);
    font: inherit;
    cursor: pointer;
}

.goal-lib__level-dot {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    border: 1px solid rgba(148, 163, 184, 0.3);
    background: color-mix(in srgb, #020617 82%, var(--bg-card) 18%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 18px rgba(0, 0, 0, 0.22);
    transition: transform 140ms ease, border-color 140ms ease, background 160ms ease, box-shadow 160ms ease;
}

.goal-lib__level-stop-label {
    font-size: 0.78rem;
    font-weight: 800;
    white-space: nowrap;
}

.goal-lib__level-stop.is-active {
    color: color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%);
}

.goal-lib__level-stop.is-active .goal-lib__level-dot {
    transform: scale(1.08);
    border-color: rgba(129, 140, 248, 0.6);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(56, 189, 248, 0.16));
    box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.12), 0 12px 24px rgba(0, 0, 0, 0.24);
}

.goal-lib__preview-video {
    min-height: 180px;
}

.goal-lib__preview-empty {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.82rem;
    line-height: 1.5;
}

.modal-head,
.modal-copy,
.tutorial-coaching-grid,
.modal-meta-grid,
.modal-head-meta,
.category-detail,
.equipment-detail,
.muscle-detail {
    display: grid;
}

.modal-head {
    gap: 1rem;
    margin-bottom: 0.2rem;
}

.modal-head h3 {
    margin: 0.3rem 0 0;
    font-size: clamp(1.2rem, 2vw, 1.7rem);
}

.modal-head-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.55rem;
}

.modal-copy {
    gap: 1rem;
}

.tutorial-coaching-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
}

.coaching-card,
.info-box {
    display: grid;
    gap: 0.55rem;
    padding: 1rem;
    border-radius: 18px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(148,163,184,0.16);
}

.coaching-kicker {
    font-size: 0.72rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 800;
    color: var(--text-secondary);
}

.coaching-list {
    margin: 0;
    padding-left: 1rem;
    display: grid;
    gap: 0.45rem;
    color: var(--text-primary);
    line-height: 1.45;
}

.coaching-list--ordered {
    padding-left: 1.15rem;
}

.card-text,
.section-note,
.related-note,
.category-note,
.equipment-note,
.muscle-note,
.level-caption {
    color: var(--text-secondary);
    line-height: 1.55;
}

.modal-description {
    margin: 0;
}

.modal-meta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
}

.modal-meta-card--full {
    grid-column: 1 / -1;
}

.category-chip,
.category-pill,
.equipment-pill,
.muscle-pill,
.status-pill,
.level-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
    flex: 0 0 auto;
    white-space: nowrap;
}

.category-chip,
.category-pill,
.equipment-pill,
.muscle-pill {
    gap: 0.45rem;
    min-height: 2rem;
    padding: 0.38rem 0.78rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    background: rgba(255,255,255,0.05);
    color: var(--text-primary);
    border: 1px solid rgba(148,163,184,0.2);
    line-height: 1;
}

.category-chip-dot,
.category-pill-dot,
.equipment-pill-dot,
.muscle-pill-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
}

.category-chip-dot,
.category-pill-dot {
    background: currentColor;
    box-shadow: 0 0 0 4px color-mix(in srgb,currentColor 16%,transparent);
}

.category-chip.is-oberkorper,
.category-pill.is-oberkorper { color:#38bdf8; border-color:color-mix(in srgb,#38bdf8 34%,rgba(148,163,184,.18)); }
.category-chip.is-unterkorper,
.category-pill.is-unterkorper { color:#22c55e; border-color:color-mix(in srgb,#22c55e 34%,rgba(148,163,184,.18)); }
.category-chip.is-ganzkorper,
.category-pill.is-ganzkorper { color:#818cf8; border-color:color-mix(in srgb,#818cf8 36%,rgba(148,163,184,.18)); }
.category-chip.is-core,
.category-pill.is-core { color:#f59e0b; border-color:color-mix(in srgb,#f59e0b 34%,rgba(148,163,184,.18)); }
.category-chip.is-cardio,
.category-pill.is-cardio { color:#fb7185; border-color:color-mix(in srgb,#fb7185 34%,rgba(148,163,184,.18)); }
.category-chip.is-mobilitat,
.category-pill.is-mobilitat { color:#2dd4bf; border-color:color-mix(in srgb,#2dd4bf 34%,rgba(148,163,184,.18)); }
.category-chip.is-sonstiges,
.category-pill.is-sonstiges { color:#f472b6; border-color:color-mix(in srgb,#f472b6 34%,rgba(148,163,184,.18)); }

.status-pill {
    min-height: 2rem;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.01em;
    border: 1px solid rgba(148,163,184,.18);
    background: rgba(255,255,255,.05);
    color: var(--text-primary);
}

.status-pill.is-recent {
    background: linear-gradient(135deg,color-mix(in srgb,var(--accent-primary) 18%, var(--bg-card) 82%),color-mix(in srgb,var(--accent-secondary) 14%, var(--bg-card) 86%));
    border-color: color-mix(in srgb,var(--accent-primary) 32%,rgba(148,163,184,.18));
}

.level-chip {
    min-height: 2rem;
    padding: 0.38rem 0.78rem;
    border-radius: 999px;
    font-size: 0.86rem;
    letter-spacing: 0.02em;
    background: rgba(255,255,255,.04);
    line-height: 1;
}

.equipment-list,
.muscle-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.equipment-pill-dot {
    background: var(--accent-secondary);
    box-shadow: 0 0 0 4px color-mix(in srgb,var(--accent-secondary) 16%,transparent);
}

.muscle-pill-dot {
    background: #f472b6;
    box-shadow: 0 0 0 4px color-mix(in srgb,#f472b6 16%,transparent);
}

.level-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.level-visual {
    display: grid;
    gap: 0.9rem;
}

.level-meter {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    width: 100%;
}

.level-meter-bar {
    height: 0.75rem;
    border-radius: 999px;
    background: rgba(148,163,184,.16);
    border: 1px solid rgba(148,163,184,.18);
}

.level-meter-bar.is-active {
    background: linear-gradient(135deg,rgba(56,189,248,.85),rgba(129,140,248,.82));
    border-color: rgba(129,140,248,.54);
}

.level-scale {
    display: flex;
    justify-content: space-between;
    gap: 0.6rem;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.goal-lib__field {
    display: grid;
    gap: 0.45rem;
}

.goal-lib__field--full {
    grid-column: 1 / -1;
}

.goal-lib__input {
    min-width: 0;
}

.goal-lib__create-error {
    margin: 0;
    padding: 0.75rem 0.9rem;
    border-radius: 14px;
    border: 1px solid rgba(248, 113, 113, 0.34);
    background: linear-gradient(180deg, rgba(127, 29, 29, 0.14), rgba(69, 10, 10, 0.12));
    color: #fca5a5;
    font-size: 0.84rem;
    font-weight: 700;
    line-height: 1.35;
}

.goal-lib__create-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    flex-wrap: wrap;
}

@keyframes goal-lib-create-panel-pop {
    0% {
        transform: translateY(-10px) scale(0.972);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 0 1px color-mix(in srgb, var(--accent-primary) 12%, transparent),
            0 10px 24px rgba(0, 0, 0, 0.18);
    }

    38% {
        transform: translateY(0) scale(1.018);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 0 2px color-mix(in srgb, var(--accent-primary) 24%, transparent),
            0 22px 50px rgba(0, 0, 0, 0.34);
    }

    62% {
        transform: translateY(0) scale(0.994);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 0 1px color-mix(in srgb, var(--accent-primary) 18%, transparent),
            0 18px 42px rgba(0, 0, 0, 0.3);
    }

    100% {
        transform: translateY(0) scale(1);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent),
            0 16px 40px rgba(0, 0, 0, 0.28);
    }
}

@keyframes goal-lib-create-panel-ring {
    0% {
        opacity: 0;
        transform: scale(0.985);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 0%, transparent);
    }

    24% {
        opacity: 0.95;
        transform: scale(1.008);
        box-shadow: 0 0 0 8px color-mix(in srgb, var(--accent-primary) 14%, transparent);
    }

    100% {
        opacity: 0;
        transform: scale(1.03);
        box-shadow: 0 0 0 18px color-mix(in srgb, var(--accent-primary) 0%, transparent);
    }
}

@keyframes goal-lib-create-panel-blink {
    0% {
        border-color: color-mix(in srgb, var(--accent-primary) 24%, var(--border-color) 76%);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 0 1px color-mix(in srgb, var(--accent-primary) 12%, transparent),
            0 16px 40px rgba(0, 0, 0, 0.24);
    }

    18% {
        border-color: color-mix(in srgb, var(--accent-primary) 92%, #ffffff 8%);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 0 2px color-mix(in srgb, var(--accent-primary) 42%, transparent),
            0 0 22px color-mix(in srgb, var(--accent-primary) 18%, transparent),
            0 18px 42px rgba(0, 0, 0, 0.3);
    }

    36% {
        border-color: color-mix(in srgb, var(--accent-primary) 28%, var(--border-color) 72%);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 0 1px color-mix(in srgb, var(--accent-primary) 14%, transparent),
            0 16px 40px rgba(0, 0, 0, 0.24);
    }

    54% {
        border-color: color-mix(in srgb, var(--accent-primary) 88%, #ffffff 12%);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 0 2px color-mix(in srgb, var(--accent-primary) 38%, transparent),
            0 0 18px color-mix(in srgb, var(--accent-primary) 14%, transparent),
            0 18px 42px rgba(0, 0, 0, 0.28);
    }

    100% {
        border-color: color-mix(in srgb, var(--accent-primary) 22%, transparent);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            0 0 0 1px color-mix(in srgb, var(--accent-primary) 10%, transparent),
            0 16px 40px rgba(0, 0, 0, 0.28);
    }
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
    padding: 14px 1.1rem 14px;
    margin-left: -1.1rem;
    margin-right: -1.1rem;
    margin-bottom: -1rem;
    background: color-mix(in srgb, #020617 88%, var(--bg-card) 12%);
    border-top: 1px solid color-mix(in srgb, var(--border-color) 68%, transparent);
    box-shadow: 0 -10px 18px -18px rgba(15, 23, 42, 0.35), 0 -18px 32px -28px rgba(2, 6, 23, 0.55);
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

    .goal-lib__filter-row {
        grid-template-columns: minmax(0, 1fr) 46px;
    }

    .goal-lib__create-grid {
        grid-template-columns: 1fr;
    }

    .goal-lib__composer,
    .goal-lib__builder-grid,
    .modal-meta-grid {
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
    background: color-mix(in srgb, #020617 92%, var(--bg-card) 8%);
    box-shadow: 0 -10px 18px -18px rgba(0, 0, 0, 0.65), 0 -18px 32px -28px rgba(0, 0, 0, 0.78);
}

html.dark-mode .goal-lib__add-btn,
html.dark-mode .goal-lib__create-panel {
    background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 42%),
        radial-gradient(circle at bottom left, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 44%),
        color-mix(in srgb, #020617 86%, var(--bg-card) 14%);
    border-color: rgba(148, 163, 184, 0.34);
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
    padding-bottom: 0;
}

:global(.goal-exercise-library-popup--create-open .popup-body) {
    overflow: auto;
}
</style>

