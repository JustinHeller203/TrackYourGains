<template>
    <BasePopup
        :show="show"
        :title="t('goals.composer.title')"
        overlayClass="exercise-composer-popup"
        :showActions="false"
        @cancel="handleCancel">
        <div class="composer">
            <div class="composer__intro"
                 :class="landingClass()"
                 style="--builder-landing-delay: 0ms;">
                <span class="composer__kicker">{{ t('goals.composer.kicker') }}</span>
                <strong>{{ t('goals.composer.introTitle') }}</strong>
            </div>

            <div class="composer__mode-switch">
                <span class="composer__label">{{ t('goals.composer.modeLabel') }}</span>
                <div ref="modeSwitchTrack"
                     class="composer__segmented segmented seg-mode"
                     :class="{ 'is-dragging': modeSwitchDrag.active }"
                     role="tablist"
                     :aria-label="t('goals.composer.modeLabel')"
                     @pointerdown="handleModeSwitchPointerDown"
                     @click="handleModeSwitchTrackClick">
                    <span ref="modeSwitchThumb"
                          class="seg-mode__thumb"
                          :class="{ 'seg-mode__thumb--tutorial': createTutorialCard, 'seg-mode__thumb--dragging': modeSwitchDrag.active }"
                          :style="modeSwitchThumbStyle"
                          aria-hidden="true">
                        <span class="seg-mode__thumb-labels">
                            <span class="seg-mode__thumb-label"
                                  :style="modeSwitchExerciseLabelStyle">
                                {{ t('goals.composer.modeExerciseOnly') }}
                            </span>
                            <span class="seg-mode__thumb-label seg-mode__thumb-label--tutorial"
                                  :style="modeSwitchTutorialLabelStyle">
                                {{ t('goals.composer.modeWithTutorial') }}
                            </span>
                        </span>
                    </span>
                    <button type="button"
                            class="composer__segmented-option seg-mode__option"
                            :class="{ on: !createTutorialCard }"
                            :aria-pressed="!createTutorialCard ? 'true' : 'false'"
                            @pointerdown.stop="handleModeSwitchPointerDown"
                            @click="handleComposerModeSwitchClick(false)">
                        {{ t('goals.composer.modeExerciseOnly') }}
                    </button>
                    <button type="button"
                            class="composer__segmented-option seg-mode__option"
                            :class="{ on: createTutorialCard }"
                            :aria-pressed="createTutorialCard ? 'true' : 'false'"
                            @pointerdown.stop="handleModeSwitchPointerDown"
                            @click="handleComposerModeSwitchClick(true)">
                        {{ t('goals.composer.modeWithTutorial') }}
                    </button>
                </div>
                <button type="button"
                        class="composer__preview-trigger"
                        @click="openPreview">
                    {{ t('goals.composer.preview') }}
                </button>
            </div>

            <Transition name="builder-mode" mode="out-in">
                <div :key="composerAnimationKey"
                     class="composer__form builder-mode-shell"
                     :class="landingClass()"
                     style="--builder-landing-delay: 70ms;">
                    <div class="composer__grid">
                        <label class="composer__field">
                            <span class="composer__label">{{ t('goals.composer.nameLabel') }}</span>
                            <input v-model.trim="exerciseName"
                                   class="composer__input"
                                   :class="{ 'composer__input--error': fieldErrors.name }"
                                   type="text"
                                   maxlength="80"
                                   :placeholder="t('goals.composer.namePlaceholder')" />
                            <p v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</p>
                        </label>

                        <UiPopupSelect v-model="exerciseKind"
                                       :label="t('goals.manager.typeLabel')"
                                       :placeholder="t('goals.composer.typePlaceholder')"
                                       :error="fieldErrors.kind"
                                       :options="kindOptions" />

                        <UiPopupSelect v-model="exerciseMuscleGroup"
                                       :label="t('goals.composer.muscleGroupLabel')"
                                       :placeholder="t('goals.composer.muscleGroupPlaceholder')"
                                       :error="fieldErrors.muscleGroup"
                                       :options="muscleGroupOptions" />

                        <label class="composer__field">
                            <span class="composer__label">{{ t('goals.composer.aliasLabel') }}</span>
                            <input v-model.trim="exerciseAliases"
                                   class="composer__input"
                                   type="text"
                                   maxlength="140"
                                   :placeholder="t('goals.composer.aliasPlaceholder')" />
                        </label>

                        <div class="composer__field">
                            <div class="composer__select-action-row">
                                <UiPopupSelect v-model="exerciseSecondaryGroupDraft"
                                               class="composer__select-action-control"
                                               :label="t('goals.composer.secondaryAreasLabel')"
                                               :placeholder="t('goals.composer.secondaryAreasPlaceholder')"
                                               :options="muscleGroupOptions" />
                                <button type="button"
                                        class="composer__select-action-btn"
                                        :disabled="!exerciseSecondaryGroupDraft"
                                        @click="addSecondaryGroup">
                                    {{ t('goals.composer.select') }}
                                </button>
                            </div>
                            <TransitionGroup v-if="exerciseSecondaryGroups.length"
                                             name="secondary-chip"
                                             tag="div"
                                             class="composer__selected-chips"
                                             :class="{ 'is-pulsing': !!recentlyAddedSecondaryGroup }">
                                <button v-for="group in exerciseSecondaryGroups"
                                        :key="`secondary-${group}`"
                                        :ref="(el) => setSecondaryChipRef(group, el as HTMLButtonElement | null)"
                                        type="button"
                                        class="composer__selected-chip"
                                        :class="{
                                            'is-fresh': group === recentlyAddedSecondaryGroup,
                                            'is-rejecting': rejectingSecondaryGroups.includes(group),
                                        }"
                                        @click="removeSecondaryGroup(group)">
                                    <span class="composer__selected-chip-label">{{ group }}</span>
                                    <span v-if="group === recentlyAddedSecondaryGroup"
                                          class="composer__selected-chip-trail"
                                          aria-hidden="true"></span>
                                    <span aria-hidden="true">×</span>
                                </button>
                            </TransitionGroup>
                        </div>

                        <UiPopupSelect v-if="createTutorialCard"
                                       v-model="tutorialCategory"
                                       :label="t('goals.composer.tutorialCategoryLabel')"
                                       :placeholder="t('goals.composer.tutorialCategoryPlaceholder')"
                                       :options="tutorialCategoryOptions" />
                    </div>

                    <template v-if="createTutorialCard">
                        <div class="composer__grid">
                            <label class="composer__field composer__field--full">
                                <span class="composer__label">{{ t('goals.composer.descriptionLabel') }}</span>
                                <textarea v-model.trim="tutorialDescription"
                                          class="composer__input composer__textarea"
                                          rows="4"
                                          maxlength="320"
                                          :placeholder="t('goals.composer.descriptionPlaceholder')"></textarea>
                            </label>

                            <label class="composer__field composer__field--full">
                                <span class="composer__label">{{ t('goals.composer.videoUrlLabel') }}</span>
                                <input v-model.trim="tutorialVideoUrl"
                                       class="composer__input"
                                       type="url"
                                       maxlength="240"
                                       :placeholder="t('goals.composer.videoUrlPlaceholder')" />
                            </label>
                        </div>

                        <div class="composer__panel">
                            <div class="composer__panel-head">
                                <span class="composer__kicker">{{ t('goals.composer.equipmentLabel') }}</span>
                                <strong>{{ t('goals.composer.multiSelectHint') }}</strong>
                            </div>
                            <div class="composer__chip-picker">
                                <button v-for="opt in equipmentOptions"
                                        :key="opt.value"
                                        type="button"
                                        class="composer__toggle-chip"
                                        :class="{ 'is-active': exerciseEquipment.includes(opt.value) }"
                                        @click="toggleEquipment(opt.value)">
                                    {{ opt.label }}
                                </button>
                            </div>
                        </div>

                        <div class="composer__panel">
                            <div class="composer__panel-head">
                                <span class="composer__kicker">{{ t('goals.composer.levelLabel') }}</span>
                                <strong>{{ t('goals.composer.chooseLevel') }}</strong>
                            </div>
                            <div class="composer__level-builder">
                                <div class="composer__level-list" :aria-label="t('goals.composer.setLevelAria')">
                                    <button v-for="opt in levelOptions"
                                            :key="opt.value"
                                            type="button"
                                            class="composer__level-row"
                                            :class="{ 'is-active': exerciseLevel === opt.value }"
                                            @click="exerciseLevel = opt.value">
                                        <span class="composer__level-row-mark" aria-hidden="true">
                                            <span class="composer__level-row-dot"></span>
                                        </span>
                                        <span class="composer__level-row-copy">
                                            <strong>{{ opt.label }}</strong>
                                            <small>{{ levelDescription(opt.value) }}</small>
                                        </span>
                                        <span class="composer__level-row-bars" aria-hidden="true">
                                            <span v-for="bar in 3"
                                                  :key="`${opt.value}-${bar}`"
                                                  class="composer__level-row-bar"
                                                  :class="{ 'is-on': bar <= levelBars(opt.value) }"></span>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="composer__builder-stack">
                            <div class="composer__field">
                                <div class="composer__list-head">
                                    <span class="composer__label composer__label--center composer__section-title">{{ t('goals.composer.techniqueTips') }}</span>
                                </div>
                                <div class="composer__list-builder">
                                    <div v-for="(item, index) in tutorialCueItems"
                                         :key="item.id"
                                         class="composer__list-row">
                                        <span class="composer__list-index">{{ index + 1 }}</span>
                                        <input v-model.trim="item.text"
                                               class="composer__input"
                                               type="text"
                                               maxlength="180"
                                               :placeholder="t('goals.composer.tipPlaceholder')" />
                                        <button type="button"
                                                class="composer__list-remove"
                                                @click="removeCueItem(item.id)">
                                            <span class="composer__list-remove-text">{{ t('common.delete') }}</span>
                                            <span class="composer__list-remove-emoji" aria-hidden="true">🗑️</span>
                                        </button>
                                    </div>
                                    <button type="button"
                                            class="composer__list-add"
                                            @click="addCueItem()">
                                        {{ t('goals.composer.addLine') }}
                                    </button>
                                </div>
                            </div>

                            <div class="composer__field">
                                <div class="composer__list-head">
                                    <span class="composer__label composer__label--center composer__section-title">{{ t('goals.composer.stepByStep') }}</span>
                                </div>
                                <div class="composer__list-builder">
                                    <div v-for="(item, index) in tutorialStepItems"
                                         :key="item.id"
                                         class="composer__list-row">
                                        <span class="composer__list-index">{{ index + 1 }}</span>
                                        <input v-model.trim="item.text"
                                               class="composer__input"
                                               type="text"
                                               maxlength="180"
                                               :placeholder="t('goals.composer.stepPlaceholder')" />
                                        <button type="button"
                                                class="composer__list-remove"
                                                @click="removeStepItem(item.id)">
                                            <span class="composer__list-remove-text">{{ t('common.delete') }}</span>
                                            <span class="composer__list-remove-emoji" aria-hidden="true">🗑️</span>
                                        </button>
                                    </div>
                                    <button type="button"
                                            class="composer__list-add"
                                            @click="addStepItem()">
                                        {{ t('goals.composer.addLine') }}
                                    </button>
                                </div>
                            </div>

                            <div class="composer__field">
                                <div class="composer__list-head">
                                    <span class="composer__label composer__label--center composer__section-title">{{ t('goals.composer.commonMistakes') }}</span>
                                </div>
                                <div class="composer__list-builder">
                                    <div v-for="(item, index) in tutorialMistakeItems"
                                         :key="item.id"
                                         class="composer__list-row">
                                        <span class="composer__list-index">{{ index + 1 }}</span>
                                        <input v-model.trim="item.text"
                                               class="composer__input"
                                               type="text"
                                               maxlength="180"
                                               :placeholder="t('goals.composer.mistakePlaceholder')" />
                                        <button type="button"
                                                class="composer__list-remove"
                                                @click="removeMistakeItem(item.id)">
                                            <span class="composer__list-remove-text">{{ t('common.delete') }}</span>
                                            <span class="composer__list-remove-emoji" aria-hidden="true">🗑️</span>
                                        </button>
                                    </div>
                                    <button type="button"
                                            class="composer__list-add"
                                            @click="addMistakeItem()">
                                        {{ t('goals.composer.addLine') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>

                    <p v-if="errorMessage" class="composer__error">{{ errorMessage }}</p>
                </div>
            </Transition>
        </div>

        <template #actions>
            <button type="button" class="composer__action composer__action--ghost" @click="resetForm">
                {{ t('common.undo') }}
            </button>
            <button type="button" class="composer__action" @click="handleSave">
                {{ t('goals.composer.saveExercise') }}
            </button>
        </template>
    </BasePopup>

    <BasePopup
        v-if="!createTutorialCard"
        :show="showPreviewPopup"
        :title="t('goals.composer.libraryPreviewTitle')"
        overlayClass="exercise-composer-library-preview-popup"
        :showActions="false"
        @cancel="showPreviewPopup = false">
        <div class="composer-preview">
            <p class="composer-preview__intro">
                {{ t('goals.composer.libraryPreviewIntro') }}
            </p>

            <article class="composer-preview__library-card">
                <div class="composer-preview__library-top">
                    <div class="composer-preview__library-copy">
                        <span class="composer-preview__library-name">{{ previewExercise.name }}</span>
                        <div class="composer-preview__library-chips">
                            <span v-if="shouldShowPrimaryChip(previewExercise)"
                                  class="composer-preview__chip composer-preview__chip--primary">
                                {{ muscleGroupLabel(previewExercise.muscleGroup) }}
                            </span>
                            <span class="composer-preview__chip">{{ kindLabel(previewExercise.kind) }}</span>
                            <span v-if="previewExercise.equipment.length"
                                  class="composer-preview__chip composer-preview__chip--muted">
                                {{ equipmentLabel(previewExercise.equipment[0]) }}
                            </span>
                            <span class="composer-preview__chip composer-preview__chip--muted">
                                {{ levelLabel(previewExercise.level) }}
                            </span>
                            <span v-for="group in previewExercise.secondaryMuscleGroups.slice(0, 2)"
                                  :key="`preview-${group}`"
                                  class="composer-preview__chip composer-preview__chip--muted">
                                {{ muscleGroupLabel(group) }}
                            </span>
                        </div>
                        <span v-if="previewExercise.aliases.length" class="composer-preview__library-aliases">
                            {{ t('goals.library.aliases') }}: {{ previewExercise.aliases.slice(0, 3).join(', ') }}
                        </span>
                    </div>
                    <span class="composer-preview__library-badge">{{ t('goals.composer.previewBadge') }}</span>
                </div>

                <div class="composer-preview__library-actions">
                    <button type="button"
                            class="composer-preview__library-btn composer-preview__library-btn--ghost">
                        {{ t('goals.library.showDetails') }}
                    </button>
                    <button type="button" class="composer-preview__library-btn">
                        {{ t('goals.library.selectExercise') }}
                    </button>
                </div>
            </article>
        </div>
    </BasePopup>

    <TutorialDetailsPopup
        v-else
        :show="showPreviewPopup"
        :tutorial="previewTutorial"
        :related-tutorials="[]"
        :status-badges="[]"
        :favorite-active="false"
        :show-favorite="true"
        :show-delete="false"
        overlay-class="tutorial-popup exercise-composer-preview-popup"
        @close="showPreviewPopup = false"
        @open="() => {}"
        @open-video="() => {}"
        @toggle-favorite="() => {}"
        @copy-link="() => {}" />
</template>

<script setup lang="ts">
import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
import BasePopup from '@/components/ui/popups/BasePopup.vue'
import TutorialDetailsPopup from '@/components/ui/popups/tutorial/TutorialDetailsPopup.vue'
import { useI18n } from '@/composables/useI18n'
import type { TrainingLevel } from '@/types/autoPlan'
import type { TutorialEntry, TutorialLevel } from '@/types/tutorials'
import type { EquipmentTag, ExerciseMetadata, ExerciseTutorialDraft } from '@/services/training/exerciseLibrary'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

export type ExerciseComposerPayload = {
    name: string
    kind: ExerciseMetadata['kind']
    muscleGroup?: string
    secondaryMuscleGroups?: string[]
    aliases?: string[]
    equipment: EquipmentTag[]
    level: TrainingLevel
    tutorial?: ExerciseTutorialDraft | null
}

type TutorialListItem = {
    id: number
    label: string
    text: string
}

const props = defineProps<{
    show: boolean
    error?: string
    initialCreateTutorialCard?: boolean
}>()

const emit = defineEmits<{
    (e: 'cancel'): void
    (e: 'save', payload: ExerciseComposerPayload): void
}>()
const { locale, t } = useI18n()

const exerciseName = ref('')
const exerciseKind = ref<ExerciseMetadata['kind']>('strength')
const exerciseMuscleGroup = ref('')
const exerciseAliases = ref('')
const exerciseSecondaryGroupDraft = ref('')
const exerciseSecondaryGroups = ref<string[]>([])
const exerciseEquipment = ref<EquipmentTag[]>(['bodyweight'])
const exerciseLevel = ref<TrainingLevel>('beginner')
const tutorialDescription = ref('')
const tutorialVideoUrl = ref('')
const tutorialCategory = ref('Ganzkörper')
const tutorialCueItems = ref<TutorialListItem[]>([])
const tutorialStepItems = ref<TutorialListItem[]>([])
const tutorialMistakeItems = ref<TutorialListItem[]>([])
const localErrorMessage = ref('')
const showPreviewPopup = ref(false)
const createTutorialCard = ref(false)
const recentlyAddedSecondaryGroup = ref('')
const rejectingSecondaryGroups = ref<string[]>([])
const composerAnimationKey = ref(0)
const isBuilderLandingActive = ref(false)
const errorMessage = computed(() => localErrorMessage.value || props.error || '')
let builderLandingTimer: number | null = null
const modeSwitchTrack = ref<HTMLElement | null>(null)
const modeSwitchThumb = ref<HTMLElement | null>(null)
const MODE_SWITCH_DRAG_THRESHOLD_PX = 18
const modeSwitchDragSuppressClickUntil = ref(0)
const modeSwitchTravelPx = ref(0)
const modeSwitchDrag = reactive({
    active: false,
    pointerId: null as number | null,
    startX: 0,
    startTranslate: 0,
    translate: 0,
    didMove: false,
})
let modeSwitchResizeObserver: ResizeObserver | null = null
let modeSwitchResizeObserverRaf = 0
let tutorialListItemId = 0
let recentSecondaryGroupTimer: number | null = null
const rejectingSecondaryGroupTimers = new Map<string, number>()
const secondaryChipRefs = new Map<string, HTMLButtonElement>()
const fieldErrors = reactive({
    name: '',
    kind: '',
    muscleGroup: '',
})

const kindOptions = computed(() => [
    { label: t('goals.exerciseKind.strength'), value: 'strength' },
    { label: t('goals.exerciseKind.cardio'), value: 'cardio' },
    { label: t('goals.exerciseKind.mobility'), value: 'mobility' },
] satisfies Array<{ label: string; value: ExerciseMetadata['kind'] }>)

const muscleGroupOptions = computed(() => [
    { label: t('goals.muscle.chest'), value: 'Brust' },
    { label: t('goals.muscle.back'), value: 'Rücken' },
    { label: t('goals.muscle.legs'), value: 'Beine' },
    { label: t('goals.muscle.shoulders'), value: 'Schultern' },
    { label: t('goals.muscle.arms'), value: 'Arme' },
    { label: t('goals.muscle.core'), value: 'Core' },
    { label: t('goals.muscle.glutes'), value: 'Gesäß' },
    { label: t('goals.muscle.fullBody'), value: 'Ganzkörper' },
    { label: t('goals.exerciseKind.cardio'), value: 'Cardio' },
    { label: t('goals.exerciseKind.mobility'), value: 'Dehnung' },
] satisfies Array<{ label: string; value: string }>)

const equipmentOptions = computed(() => [
    { label: t('goals.equipment.bodyweight'), value: 'bodyweight' },
    { label: t('goals.equipment.dumbbell'), value: 'dumbbell' },
    { label: t('goals.equipment.barbell'), value: 'barbell' },
    { label: t('goals.equipment.machine'), value: 'machine' },
    { label: t('goals.equipment.cable'), value: 'cable' },
    { label: t('goals.equipment.cardioMachine'), value: 'cardio_machine' },
    { label: t('goals.equipment.band'), value: 'band' },
] satisfies Array<{ label: string; value: EquipmentTag }>)

const levelOptions = computed(() => [
    { label: t('goals.level.beginner'), value: 'beginner' },
    { label: t('goals.level.intermediate'), value: 'intermediate' },
    { label: t('goals.level.advanced'), value: 'advanced' },
] satisfies Array<{ label: string; value: TrainingLevel }>)

const tutorialCategoryOptions = computed(() => [
    { label: t('goals.category.upperBody'), value: 'Oberkörper' },
    { label: t('goals.category.lowerBody'), value: 'Unterkörper' },
    { label: t('goals.category.fullBody'), value: 'Ganzkörper' },
    { label: t('goals.category.core'), value: 'Core' },
    { label: t('goals.exerciseKind.cardio'), value: 'Cardio' },
    { label: t('goals.category.mobility'), value: 'Mobilität' },
    { label: t('goals.category.other'), value: 'Sonstiges' },
] satisfies Array<{ label: string; value: string }>)

const getComposerModeTranslate = (tutorial: boolean) => (
    tutorial ? modeSwitchTravelPx.value : 0
)

const clampModeSwitchTranslate = (value: number) => (
    Math.min(Math.max(value, 0), modeSwitchTravelPx.value)
)

const modeSwitchThumbStyle = computed(() => ({
    '--mode-switch-thumb-translate': `${Math.round(
        clampModeSwitchTranslate(modeSwitchDrag.active ? modeSwitchDrag.translate : getComposerModeTranslate(createTutorialCard.value))
    )}px`,
}))

const modeSwitchProgress = computed(() => {
    if (modeSwitchTravelPx.value <= 0) return createTutorialCard.value ? 1 : 0
    const activeTranslate = modeSwitchDrag.active
        ? modeSwitchDrag.translate
        : getComposerModeTranslate(createTutorialCard.value)
    return clampModeSwitchTranslate(activeTranslate) / modeSwitchTravelPx.value
})

const modeSwitchExerciseLabelStyle = computed(() => ({
    opacity: `${Math.max(0, 1 - modeSwitchProgress.value * 1.6)}`,
    transform: `translateX(${Math.round(modeSwitchProgress.value * -18)}px)`,
}))

const modeSwitchTutorialLabelStyle = computed(() => ({
    opacity: `${Math.min(1, Math.max(0, (modeSwitchProgress.value - 0.2) / 0.8))}`,
    transform: `translateX(${Math.round((1 - modeSwitchProgress.value) * 18)}px)`,
}))

function normalizeText(value: string) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

function splitCommaList(value: string) {
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
}

function splitLines(value: string) {
    return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
}

function createListItem(label = '', text = ''): TutorialListItem {
    tutorialListItemId += 1
    return {
        id: tutorialListItemId,
        label,
        text,
    }
}

function addListItem(target: { value: TutorialListItem[] }, label = '', text = '') {
    target.value.push(createListItem(label, text))
}

function removeListItem(target: { value: TutorialListItem[] }, id: number) {
    target.value = target.value.filter((item) => item.id !== id)
}

function addCueItem() {
    addListItem(tutorialCueItems)
}

function removeCueItem(id: number) {
    removeListItem(tutorialCueItems, id)
}

function addStepItem() {
    addListItem(tutorialStepItems)
}

function removeStepItem(id: number) {
    removeListItem(tutorialStepItems, id)
}

function addMistakeItem() {
    addListItem(tutorialMistakeItems)
}

function removeMistakeItem(id: number) {
    removeListItem(tutorialMistakeItems, id)
}

function formatListItems(items: TutorialListItem[]) {
    return items
        .map((item) => {
            const text = item.text.trim()
            const label = item.label.trim()
            if (!text) return ''
            return label ? `${label}: ${text}` : text
        })
        .filter(Boolean)
}

function kindLabel(kind: ExerciseMetadata['kind']) {
    return {
        strength: t('goals.exerciseKind.strength'),
        cardio: t('goals.exerciseKind.cardio'),
        mobility: t('goals.exerciseKind.mobility'),
    }[kind]
}

function measureModeSwitch() {
    const nextTravel = Math.max(0, modeSwitchThumb.value?.getBoundingClientRect().width ?? 0)
    if (Math.abs(modeSwitchTravelPx.value - nextTravel) < 0.5) return
    modeSwitchTravelPx.value = nextTravel

    if (!modeSwitchDrag.active) {
        modeSwitchDrag.translate = getComposerModeTranslate(createTutorialCard.value)
    }
}

function defaultEquipmentForKind(kind: ExerciseMetadata['kind']): EquipmentTag {
    return kind === 'cardio' ? 'cardio_machine' : 'bodyweight'
}

function defaultTutorialCategoryForKind(kind: ExerciseMetadata['kind']) {
    if (kind === 'cardio') return 'Cardio'
    if (kind === 'mobility') return 'Mobilität'
    return 'Ganzkörper'
}

function defaultMuscleGroupForKind(kind: ExerciseMetadata['kind']) {
    if (kind === 'cardio') return 'Cardio'
    if (kind === 'mobility') return 'Dehnung'
    return 'Kraft'
}

function mapTrainingLevelToTutorialLevel(level: TrainingLevel): TutorialLevel {
    if (level === 'advanced') return 'Pro'
    if (level === 'intermediate') return 'Fortgeschritten'
    return 'Anfänger'
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

function levelDescription(level: TrainingLevel) {
    if (level === 'beginner') return t('goals.composer.levelBeginnerDesc')
    if (level === 'intermediate') return t('goals.composer.levelIntermediateDesc')
    return t('goals.composer.levelAdvancedDesc')
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

function levelBars(level: TrainingLevel) {
    if (level === 'advanced') return 3
    if (level === 'intermediate') return 2
    return 1
}

function toggleEquipment(value: EquipmentTag) {
    const next = new Set(exerciseEquipment.value)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    if (!next.size) next.add(defaultEquipmentForKind(exerciseKind.value))
    exerciseEquipment.value = equipmentOptions.value.map((item) => item.value).filter((item) => next.has(item))
}

function buildTutorialPayload(): ExerciseTutorialDraft | null {
    if (!createTutorialCard.value) return null

    const title = exerciseName.value.trim() || undefined
    const description = tutorialDescription.value.trim() || undefined
    const category = tutorialCategory.value.trim() || undefined
    const level = mapTrainingLevelToTutorialLevel(exerciseLevel.value)
    const equipment = exerciseEquipment.value.map(equipmentLabel)
    const muscleGroups = preview.value.muscleGroups
    const cues = formatListItems(tutorialCueItems.value)
    const steps = formatListItems(tutorialStepItems.value)
    const mistakes = formatListItems(tutorialMistakeItems.value)

    const payload: ExerciseTutorialDraft = {
        title,
        description,
        videoUrl: tutorialVideoUrl.value.trim() || undefined,
        category,
        level,
        equipment,
        muscleGroups,
        cues,
        steps,
        mistakes,
        translations: {
            [locale.value]: {
                title,
                description,
                category,
                level,
                equipment,
                muscleGroups,
                cues,
                steps,
                mistakes,
            },
        },
    }

    const hasContent = Boolean(
        payload.title
        || payload.description
        || payload.videoUrl
        || (payload.cues?.length ?? 0)
        || (payload.steps?.length ?? 0)
        || (payload.mistakes?.length ?? 0)
    )

    return hasContent ? payload : null
}

const preview = computed(() => {
    const primary = exerciseMuscleGroup.value.trim() || defaultMuscleGroupForKind(exerciseKind.value)
    const secondary = exerciseSecondaryGroups.value.slice()
    const muscleGroups = [primary, ...secondary].filter((group, index, list) => !!group && list.indexOf(group) === index)
    const aliases = splitCommaList(exerciseAliases.value)
    const summaryParts = [
        `${t('goals.composer.previewType')}: ${kindLabel(exerciseKind.value)}`,
        `${t('goals.composer.previewFocus')}: ${primary}`,
        secondary.length ? `${t('goals.composer.previewSecondary')}: ${secondary.join(', ')}` : '',
        aliases.length ? `${t('goals.library.aliases')}: ${aliases.join(', ')}` : '',
    ].filter(Boolean)

    return {
        title: exerciseName.value.trim() || t('goals.composer.previewExerciseName'),
        description: tutorialDescription.value.trim() || summaryParts.join(' • ') || t('goals.composer.previewExerciseDescription'),
        category: tutorialCategory.value.trim() || defaultTutorialCategoryForKind(exerciseKind.value),
        level: levelLabel(exerciseLevel.value),
        levelBars: levelBars(exerciseLevel.value),
        equipment: exerciseEquipment.value.length
            ? exerciseEquipment.value.map(equipmentLabel)
            : [equipmentLabel(defaultEquipmentForKind(exerciseKind.value))],
        muscleGroups: muscleGroups.length ? muscleGroups : [t('goals.category.fullBody')],
        cues: formatListItems(tutorialCueItems.value),
        steps: formatListItems(tutorialStepItems.value),
        mistakes: formatListItems(tutorialMistakeItems.value),
    }
})

const previewTutorial = computed<TutorialEntry>(() => ({
    id: -1,
    title: preview.value.title,
    description: preview.value.description,
    videoUrl: tutorialVideoUrl.value.trim() || null,
    category: preview.value.category,
    level: mapTrainingLevelToTutorialLevel(exerciseLevel.value),
    equipment: preview.value.equipment,
    muscleGroups: preview.value.muscleGroups,
    cues: preview.value.cues,
    steps: preview.value.steps,
    mistakes: preview.value.mistakes,
    source: 'custom',
}))

const previewExercise = computed(() => ({
    name: exerciseName.value.trim() || t('goals.composer.previewExerciseFallback'),
    aliases: splitCommaList(exerciseAliases.value),
    muscleGroup: exerciseMuscleGroup.value.trim() || defaultMuscleGroupForKind(exerciseKind.value),
    secondaryMuscleGroups: exerciseSecondaryGroups.value.slice(),
    kind: exerciseKind.value,
    equipment: exerciseEquipment.value.length
        ? exerciseEquipment.value
        : [defaultEquipmentForKind(exerciseKind.value)],
    level: exerciseLevel.value,
}))

function resetForm() {
    exerciseName.value = ''
    exerciseKind.value = 'strength'
    exerciseMuscleGroup.value = ''
    exerciseAliases.value = ''
    exerciseSecondaryGroupDraft.value = ''
    exerciseSecondaryGroups.value = []
    exerciseEquipment.value = ['bodyweight']
    exerciseLevel.value = 'beginner'
    tutorialDescription.value = ''
    tutorialVideoUrl.value = ''
    tutorialCategory.value = 'Ganzkörper'
    tutorialCueItems.value = [createListItem()]
    tutorialStepItems.value = [createListItem()]
    tutorialMistakeItems.value = [createListItem()]
    createTutorialCard.value = false
    recentlyAddedSecondaryGroup.value = ''
    clearRecentSecondaryGroupTimer()
    clearRejectingSecondaryGroupTimers()
    localErrorMessage.value = ''
    clearFieldErrors()
    showPreviewPopup.value = false
}

function clearFieldErrors() {
    fieldErrors.name = ''
    fieldErrors.kind = ''
    fieldErrors.muscleGroup = ''
}

function clearRecentSecondaryGroupTimer() {
    if (recentSecondaryGroupTimer != null) {
        window.clearTimeout(recentSecondaryGroupTimer)
        recentSecondaryGroupTimer = null
    }
}

function clearRejectingSecondaryGroupTimers() {
    rejectingSecondaryGroupTimers.forEach((timer) => {
        window.clearTimeout(timer)
    })
    rejectingSecondaryGroupTimers.clear()
    rejectingSecondaryGroups.value = []
}

function setSecondaryChipRef(group: string, el: HTMLButtonElement | null) {
    if (el) {
        secondaryChipRefs.set(group, el)
        return
    }
    secondaryChipRefs.delete(group)
}

async function playSecondaryChipRejectAnimation(group: string) {
    const el = secondaryChipRefs.get(group)
    if (!el || typeof el.animate !== 'function') return

    const animation = el.animate([
        {
            transform: 'translateX(0) scale(1)',
            opacity: 1,
            filter: 'saturate(1)',
            background: 'linear-gradient(135deg, rgba(99,102,241,.22), rgba(56,189,248,.12))',
            borderColor: 'rgba(129,140,248,.42)',
            boxShadow: '0 0 0 0 rgba(248,113,113,0)',
        },
        {
            transform: 'translateX(8px) rotate(-1deg) scale(1.02)',
            opacity: 1,
            filter: 'saturate(1.08)',
            background: 'linear-gradient(135deg, rgba(251,146,60,.42), rgba(239,68,68,.24))',
            borderColor: 'rgba(251,146,60,.88)',
            boxShadow: '0 0 0 6px rgba(251,146,60,.18)',
            offset: 0.24,
        },
        {
            transform: 'translateX(-12px) rotate(1deg) scale(.99)',
            opacity: 1,
            filter: 'saturate(1.02)',
            background: 'linear-gradient(135deg, rgba(248,113,113,.52), rgba(127,29,29,.26))',
            borderColor: 'rgba(248,113,113,.94)',
            boxShadow: '0 0 0 8px rgba(248,113,113,.18)',
            offset: 0.56,
        },
        {
            transform: 'translateX(-54px) scale(.84)',
            opacity: 0.04,
            filter: 'saturate(.82) blur(.8px)',
            background: 'linear-gradient(135deg, rgba(248,113,113,.18), rgba(127,29,29,.1))',
            borderColor: 'rgba(248,113,113,.26)',
            boxShadow: '0 0 0 0 rgba(248,113,113,0)',
        },
    ], {
        duration: 620,
        easing: 'cubic-bezier(.22, .8, .36, 1)',
        fill: 'forwards',
    })

    try {
        await animation.finished
    } catch {
        // Ignore cancellations when the element unmounts during cleanup.
    }
}

function validateForm() {
    clearFieldErrors()

    if (!exerciseName.value.trim()) {
        fieldErrors.name = t('goals.composer.error.nameRequired')
    }

    if (!exerciseKind.value.trim()) {
        fieldErrors.kind = t('goals.composer.error.kindRequired')
    }

    if (!exerciseMuscleGroup.value.trim()) {
        fieldErrors.muscleGroup = t('goals.composer.error.muscleGroupRequired')
    }

    return !fieldErrors.name && !fieldErrors.kind && !fieldErrors.muscleGroup
}

function handleCancel() {
    resetForm()
    emit('cancel')
}

function handleSave() {
    localErrorMessage.value = ''
    if (!validateForm()) return

    emit('save', {
        name: exerciseName.value.trim(),
        kind: exerciseKind.value,
        muscleGroup: exerciseMuscleGroup.value.trim() || undefined,
        aliases: splitCommaList(exerciseAliases.value),
        secondaryMuscleGroups: exerciseSecondaryGroups.value.slice(),
        equipment: exerciseEquipment.value,
        level: exerciseLevel.value,
        tutorial: buildTutorialPayload(),
    })
}

function addSecondaryGroup() {
    const value = exerciseSecondaryGroupDraft.value.trim()
    if (!value) return
    if (value === exerciseMuscleGroup.value.trim()) {
        exerciseSecondaryGroupDraft.value = ''
        return
    }
    if (!exerciseSecondaryGroups.value.includes(value)) {
        exerciseSecondaryGroups.value = [...exerciseSecondaryGroups.value, value]
        recentlyAddedSecondaryGroup.value = value
        clearRecentSecondaryGroupTimer()
        recentSecondaryGroupTimer = window.setTimeout(() => {
            recentlyAddedSecondaryGroup.value = ''
            recentSecondaryGroupTimer = null
        }, 720)
    }
    exerciseSecondaryGroupDraft.value = ''
}

async function removeSecondaryGroup(group: string) {
    if (rejectingSecondaryGroups.value.includes(group)) return
    rejectingSecondaryGroups.value = [...rejectingSecondaryGroups.value, group]
    if (recentlyAddedSecondaryGroup.value === group) {
        recentlyAddedSecondaryGroup.value = ''
        clearRecentSecondaryGroupTimer()
    }

    const fallbackTimer = window.setTimeout(() => {
        exerciseSecondaryGroups.value = exerciseSecondaryGroups.value.filter((entry) => entry !== group)
        rejectingSecondaryGroups.value = rejectingSecondaryGroups.value.filter((entry) => entry !== group)
        rejectingSecondaryGroupTimers.delete(group)
    }, 760)
    rejectingSecondaryGroupTimers.set(group, fallbackTimer)

    await playSecondaryChipRejectAnimation(group)

    const activeTimer = rejectingSecondaryGroupTimers.get(group)
    if (activeTimer != null) {
        window.clearTimeout(activeTimer)
        rejectingSecondaryGroupTimers.delete(group)
    }
    exerciseSecondaryGroups.value = exerciseSecondaryGroups.value.filter((entry) => entry !== group)
    rejectingSecondaryGroups.value = rejectingSecondaryGroups.value.filter((entry) => entry !== group)
}

function openPreview() {
    showPreviewPopup.value = true
}

function normalizeChipLabel(value: string) {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    if (normalized === 'mobility') return 'mobilitat'
    return normalized
}

function shouldShowPrimaryChip(exercise: { muscleGroup?: string; kind: ExerciseMetadata['kind'] }) {
    const primary = normalizeChipLabel(exercise.muscleGroup ?? '')
    const kind = normalizeChipLabel(kindLabel(exercise.kind) ?? '')
    return !!primary && primary !== kind
}

const landingClass = () =>
    isBuilderLandingActive.value
        ? ['builder-landing-item', 'is-active']
        : ['builder-landing-item']

function cleanupModeSwitchPointerListeners() {
    window.removeEventListener('pointermove', onModeSwitchPointerMove)
    window.removeEventListener('pointerup', onModeSwitchPointerUp)
    window.removeEventListener('pointercancel', onModeSwitchPointerUp)
}

function setComposerMode(nextTutorialMode: boolean) {
    if (createTutorialCard.value === nextTutorialMode) return
    createTutorialCard.value = nextTutorialMode
}

function finishModeSwitchDrag(event?: PointerEvent) {
    if (modeSwitchDrag.pointerId != null) {
        try {
            modeSwitchTrack.value?.releasePointerCapture?.(modeSwitchDrag.pointerId)
        } catch { }
    }

    const shouldToggle = modeSwitchDrag.didMove
    const nextTutorialMode = modeSwitchDrag.translate >= modeSwitchTravelPx.value / 2

    cleanupModeSwitchPointerListeners()

    modeSwitchDrag.active = false
    modeSwitchDrag.pointerId = null
    modeSwitchDrag.startX = 0
    modeSwitchDrag.startTranslate = 0
    modeSwitchDrag.translate = getComposerModeTranslate(shouldToggle ? nextTutorialMode : createTutorialCard.value)

    if (shouldToggle) {
        modeSwitchDragSuppressClickUntil.value = Date.now() + 320
        setComposerMode(nextTutorialMode)
    }

    modeSwitchDrag.didMove = false
    if (event?.cancelable && shouldToggle) event.preventDefault()
}

function onModeSwitchPointerMove(event: PointerEvent) {
    if (!modeSwitchDrag.active || event.pointerId !== modeSwitchDrag.pointerId) return

    const nextTranslate = clampModeSwitchTranslate(
        modeSwitchDrag.startTranslate + (event.clientX - modeSwitchDrag.startX)
    )

    modeSwitchDrag.translate = nextTranslate

    if (!modeSwitchDrag.didMove && Math.abs(event.clientX - modeSwitchDrag.startX) >= MODE_SWITCH_DRAG_THRESHOLD_PX) {
        modeSwitchDrag.didMove = true
    }

    if (event.cancelable) event.preventDefault()
}

function onModeSwitchPointerUp(event: PointerEvent) {
    if (!modeSwitchDrag.active || event.pointerId !== modeSwitchDrag.pointerId) return
    finishModeSwitchDrag(event)
}

function handleModeSwitchPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    measureModeSwitch()

    modeSwitchDrag.active = true
    modeSwitchDrag.pointerId = event.pointerId
    modeSwitchDrag.startX = event.clientX
    modeSwitchDrag.startTranslate = getComposerModeTranslate(createTutorialCard.value)
    modeSwitchDrag.translate = modeSwitchDrag.startTranslate
    modeSwitchDrag.didMove = false

    try {
        modeSwitchTrack.value?.setPointerCapture?.(event.pointerId)
    } catch { }

    cleanupModeSwitchPointerListeners()
    window.addEventListener('pointermove', onModeSwitchPointerMove)
    window.addEventListener('pointerup', onModeSwitchPointerUp)
    window.addEventListener('pointercancel', onModeSwitchPointerUp)
}

function handleModeSwitchTrackClick(event: MouseEvent) {
    if (Date.now() < modeSwitchDragSuppressClickUntil.value) return
    if (modeSwitchDrag.active) return

    const track = modeSwitchTrack.value
    if (!track) return

    const rect = track.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    handleComposerModeSwitchClick(clickX >= rect.width / 2)
}

function handleComposerModeSwitchClick(nextTutorialMode: boolean) {
    if (Date.now() < modeSwitchDragSuppressClickUntil.value) return
    setComposerMode(nextTutorialMode)
}

function clearBuilderLandingTimer() {
    if (builderLandingTimer) {
        window.clearTimeout(builderLandingTimer)
        builderLandingTimer = null
    }
}

function triggerBuilderLandingAnimation() {
    clearBuilderLandingTimer()
    nextTick(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReduced) return
        isBuilderLandingActive.value = false
        void document.body.offsetWidth
        isBuilderLandingActive.value = true
        builderLandingTimer = window.setTimeout(() => {
            isBuilderLandingActive.value = false
            builderLandingTimer = null
        }, 1200)
    })
}

watch(() => props.show, (show) => {
    if (show) {
        resetForm()
        createTutorialCard.value = !!props.initialCreateTutorialCard
        composerAnimationKey.value += 1
        triggerBuilderLandingAnimation()
    } else {
        clearBuilderLandingTimer()
        isBuilderLandingActive.value = false
    }
})

watch(exerciseKind, (kind) => {
    fieldErrors.kind = ''
    exerciseEquipment.value = [defaultEquipmentForKind(kind)]
    tutorialCategory.value = defaultTutorialCategoryForKind(kind)
    if (!exerciseMuscleGroup.value.trim()) {
        exerciseMuscleGroup.value = defaultMuscleGroupForKind(kind)
    }
})

watch(exerciseName, () => {
    if (fieldErrors.name) fieldErrors.name = ''
})

watch(exerciseMuscleGroup, () => {
    if (fieldErrors.muscleGroup) fieldErrors.muscleGroup = ''
})

watch(createTutorialCard, () => {
    if (!props.show) return
    composerAnimationKey.value += 1
    triggerBuilderLandingAnimation()
    if (!modeSwitchDrag.active) {
        modeSwitchDrag.translate = getComposerModeTranslate(createTutorialCard.value)
    }
})

onMounted(() => {
    nextTick(() => {
        measureModeSwitch()
        if (!modeSwitchTrack.value || typeof ResizeObserver === 'undefined') return
        modeSwitchResizeObserver = new ResizeObserver(() => {
            if (modeSwitchResizeObserverRaf) window.cancelAnimationFrame(modeSwitchResizeObserverRaf)
            modeSwitchResizeObserverRaf = window.requestAnimationFrame(() => {
                modeSwitchResizeObserverRaf = 0
                measureModeSwitch()
            })
        })
        modeSwitchResizeObserver.observe(modeSwitchTrack.value)
    })
})

onBeforeUnmount(() => {
    clearBuilderLandingTimer()
    clearRecentSecondaryGroupTimer()
    clearRejectingSecondaryGroupTimers()
    cleanupModeSwitchPointerListeners()
    modeSwitchResizeObserver?.disconnect()
    modeSwitchResizeObserver = null
    if (modeSwitchResizeObserverRaf) {
        window.cancelAnimationFrame(modeSwitchResizeObserverRaf)
        modeSwitchResizeObserverRaf = 0
    }
})
</script>

<style scoped>
.composer { display:grid; gap:14px; min-height:0; }
.composer__intro { display:grid; gap:4px; color:var(--text-secondary); }
.composer__mode-switch { display:grid; gap:.45rem; }
.composer__preview-trigger { justify-self:start; min-height:40px; padding:.55rem .9rem; border-radius:12px; border:1px solid color-mix(in srgb, var(--border-color) 78%, transparent); background:rgba(255,255,255,.03); color:color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%); font:inherit; font-size:.85rem; font-weight:800; letter-spacing:.01em; cursor:pointer; transition:transform 140ms ease, border-color 160ms ease, background 160ms ease, box-shadow 180ms ease; }
.composer__preview-trigger:hover { transform:translateY(-1px); border-color:rgba(129,140,248,.34); background:linear-gradient(135deg, rgba(99,102,241,.14), rgba(56,189,248,.08)); box-shadow:0 10px 20px rgba(0,0,0,.14); }
.composer__kicker { font-size:.72rem; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:color-mix(in srgb, var(--accent-primary) 72%, #ffffff 28%); }
.composer__form { min-width:0; display:grid; gap:12px; }
.builder-mode-shell { display:flex; flex-direction:column; gap:1rem; min-width:0; }
.builder-mode-shell > * { animation: builder-section-reveal .42s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
.builder-mode-shell > *:nth-child(2) { animation-delay: .04s; }
.builder-mode-shell > *:nth-child(3) { animation-delay: .08s; }
.builder-mode-shell > *:nth-child(4) { animation-delay: .12s; }
.builder-mode-shell > *:nth-child(5) { animation-delay: .16s; }
.builder-mode-shell > *:nth-child(6) { animation-delay: .20s; }
.composer__grid,.composer__builder-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; align-items:start; }
.composer__builder-stack { display:grid; grid-template-columns:1fr; gap:20px; width:min(100%, 820px); justify-self:center; }
.composer__field { display:grid; gap:.45rem; align-content:start; align-self:start; }
.composer__field--full { grid-column:1 / -1; }
.composer__select-action-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:10px; align-items:end; }
.composer__select-action-control { min-width:0; }
.composer__select-action-btn { min-height:46px; padding:.75rem .95rem; border-radius:14px; border:1px solid color-mix(in srgb, var(--accent-primary) 30%, var(--border-color) 70%); background:color-mix(in srgb, var(--bg-card) 90%, var(--accent-primary) 10%); color:var(--text-primary); font:inherit; font-size:.88rem; font-weight:800; cursor:pointer; transition:transform 140ms ease, border-color 160ms ease, box-shadow 180ms ease, opacity 140ms ease; }
.composer__select-action-btn:hover:not(:disabled) { transform:translateY(-1px); border-color:rgba(129,140,248,.4); box-shadow:0 12px 26px rgba(0,0,0,.18); }
.composer__select-action-btn:disabled { opacity:.48; cursor:not-allowed; }
.composer__selected-chips { position:relative; display:flex; flex-wrap:wrap; gap:.55rem; padding:.18rem 0 .08rem; border-radius:18px; }
.composer__selected-chips.is-pulsing { animation: composer-secondary-group-pulse .72s cubic-bezier(.22, 1, .36, 1); }
.composer__selected-chip { position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:.45rem; min-height:2.1rem; padding:.42rem .78rem; border-radius:999px; border:1px solid rgba(129,140,248,.42); background:linear-gradient(135deg, rgba(99,102,241,.22), rgba(56,189,248,.12)); color:color-mix(in srgb, var(--text-primary) 94%, #ffffff 6%); font:inherit; font-size:.8rem; font-weight:800; cursor:pointer; transition:transform 140ms ease, border-color 160ms ease, box-shadow 180ms ease, filter 180ms ease; }
.composer__selected-chip:hover { transform:translateY(-1px); border-color:rgba(129,140,248,.56); box-shadow:0 10px 22px rgba(0,0,0,.14); }
.composer__selected-chip.is-rejecting { animation: composer-secondary-chip-rejecting .56s cubic-bezier(.22, .8, .36, 1) both; pointer-events:none; }
.composer__selected-chip-label,
.composer__selected-chip > span[aria-hidden="true"] { position:relative; z-index:2; }
.composer__selected-chip > span[aria-hidden="true"]:last-child { font-weight:900; opacity:.86; }
.composer__selected-chip-trail { position:absolute; inset:-2px auto -2px -28px; width:58px; border-radius:999px; background:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.12) 16%, rgba(255,255,255,.92) 48%, rgba(125,211,252,.44) 72%, rgba(255,255,255,0) 100%); transform:translateX(-130%) skewX(-24deg); box-shadow:0 0 18px rgba(125,211,252,.45); mix-blend-mode:screen; z-index:1; pointer-events:none; }
.composer__selected-chip.is-fresh { animation: composer-secondary-chip-pulse .96s cubic-bezier(.22, 1, .36, 1); box-shadow:0 14px 32px rgba(37, 99, 235, .24), 0 0 0 1px rgba(147, 197, 253, .22) inset; }
.composer__selected-chip.is-fresh .composer__selected-chip-trail { animation: composer-secondary-chip-trail .96s cubic-bezier(.2, .9, .2, 1) both; }
.secondary-chip-enter-active,
.secondary-chip-leave-active,
.secondary-chip-move { transition:transform .3s cubic-bezier(.22, 1, .36, 1), opacity .22s ease; }
.secondary-chip-enter-from { opacity:0; transform:translateY(14px) scale(.88); }
.secondary-chip-leave-to { opacity:0; transform:translateX(-18px) scale(.96); }
.secondary-chip-move { will-change:transform; }
.composer__label { font-size:.92rem; font-weight:650; color:color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%); line-height:1.2; margin:0; }
.composer__label--center { text-align:center; justify-self:center; }
.composer__section-title { font-size:1.08rem; font-weight:900; letter-spacing:.01em; color:color-mix(in srgb, var(--text-primary) 96%, #ffffff 4%); text-shadow:0 1px 0 rgba(255,255,255,.03), 0 10px 28px rgba(99,102,241,.12); }
.composer__segmented { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.35rem; padding:.28rem; border-radius:16px; border:1px solid rgba(148,163,184,.32); background:color-mix(in srgb,#020617 78%, var(--bg-card) 22%); box-shadow:inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.55), 0 16px 46px rgba(0,0,0,.42); }
.composer__segmented-option { min-height:44px; border:0; border-radius:12px; background:transparent; color:var(--text-secondary); font:inherit; font-size:.92rem; font-weight:800; letter-spacing:.01em; cursor:pointer; transition:background .16s ease, color .16s ease, transform .16s ease, box-shadow .16s ease; }
.composer__segmented-option:hover { transform:translateY(-1px); color:color-mix(in srgb, var(--text-primary) 90%, #ffffff 10%); }
.composer__segmented-option.on { background:linear-gradient(135deg, rgba(99,102,241,.22), rgba(56,189,248,.12)); color:color-mix(in srgb, var(--text-primary) 96%, #ffffff 4%); box-shadow:0 0 0 1px rgba(129,140,248,.18) inset, 0 10px 22px rgba(0,0,0,.18); }
.segmented.seg-mode { width:100%; position:relative; display:grid; grid-template-columns:1fr 1fr; gap:0; overflow:hidden; touch-action:pan-y; }
.seg-mode__thumb { position:absolute; top:.28rem; bottom:.28rem; left:.28rem; width:calc((100% - .56rem) / 2); min-width:0; display:flex; align-items:center; justify-content:center; border-radius:12px; background:linear-gradient(135deg, rgba(99,102,241,.22), rgba(56,189,248,.12)); border:1px solid rgba(129,140,248,.18); box-shadow:0 10px 22px rgba(0,0,0,.18); transform:translateX(var(--mode-switch-thumb-translate, 0px)); transition:transform .18s ease, box-shadow .18s ease, background-color .18s ease; will-change:transform; pointer-events:none; z-index:0; }
.seg-mode__thumb--dragging { transition:none; box-shadow:0 12px 26px rgba(15, 23, 42, 0.22); }
.seg-mode__thumb-labels { position:relative; display:block; width:100%; height:100%; min-width:0; overflow:hidden; }
.seg-mode__thumb-label { position:absolute; inset:0; display:inline-flex; align-items:center; justify-content:center; min-width:0; max-width:100%; padding:.45rem .9rem; font-weight:800; font-size:.92rem; line-height:1.15; color:color-mix(in srgb, var(--text-primary) 96%, #ffffff 4%); transition:opacity .16s ease, transform .16s ease; white-space:nowrap; }
.seg-mode__thumb-label--tutorial { text-align:center; }
.seg-mode__option { width:100%; position:relative; display:inline-flex; align-items:center; justify-content:center; min-width:0; background:transparent; border:1px solid transparent; border-radius:12px; padding:.45rem .9rem; font-weight:800; font-size:.92rem; cursor:pointer; transition:color .15s ease, transform .15s ease; color:color-mix(in srgb, var(--text-primary) 68%, transparent); z-index:1; user-select:none; -webkit-user-select:none; overflow:hidden; }
.seg-mode__option.on { color:transparent; }
@media (max-width: 560px) {
    .seg-mode__thumb-label,
    .seg-mode__option {
        padding-inline:.65rem;
        font-size:.82rem;
        line-height:1.05;
        white-space:normal;
        overflow-wrap:anywhere;
        word-break:break-word;
        text-align:center;
    }
}
.composer__input { min-height:46px; width:100%; padding:.86rem .95rem; border-radius:14px; border:1px solid rgba(148,163,184,.32); background:color-mix(in srgb,#020617 78%, var(--bg-card) 22%); color:color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%); box-shadow:inset 0 1px 0 rgba(255,255,255,.05), inset 0 -1px 0 rgba(0,0,0,.55), 0 16px 46px rgba(0,0,0,.42); font-size:.98rem; line-height:1.2; letter-spacing:.01em; font-family:inherit; transition:border-color .16s ease, box-shadow .16s ease, transform .16s ease, background .16s ease; }
.composer__input--error { border-color:rgba(239, 68, 68, 0.88); box-shadow:0 0 0 4px rgba(239, 68, 68, 0.10), 0 10px 22px rgba(15, 23, 42, 0.12); }
.composer__input:focus { outline:none; }
.composer__input:focus-visible { border-color:rgba(148,163,184,.55); background:color-mix(in srgb,#020617 84%, var(--bg-card) 16%); box-shadow:inset 0 1px 0 rgba(255,255,255,.06), 0 0 0 3px rgba(99,102,241,.18), 0 20px 58px rgba(0,0,0,.55); transform:translateY(-1px); }
.composer__input::placeholder { color:rgba(148,163,184,.85); }
.composer__textarea { resize:vertical; min-height:112px; }
.composer__textarea--compact { min-height:132px; }
.composer__list-head { display:grid; justify-items:center; gap:.3rem; margin-bottom:.7rem; }
.composer__list-builder { display:grid; gap:.7rem; }
.composer__list-row { display:grid; grid-template-columns:42px minmax(0, 1fr) auto; gap:.55rem; align-items:start; }
.composer__list-index { display:inline-flex; align-items:center; justify-content:center; width:42px; min-width:42px; min-height:46px; border-radius:14px; border:1px solid rgba(148,163,184,.2); background:linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02)); color:color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%); font-size:.86rem; font-weight:900; letter-spacing:.02em; box-shadow:inset 0 1px 0 rgba(255,255,255,.04); }
.composer__list-add,
.composer__list-remove { min-height:42px; border-radius:12px; border:1px solid rgba(148,163,184,.22); background:rgba(255,255,255,.04); color:color-mix(in srgb, var(--text-primary) 90%, #ffffff 10%); font:inherit; font-size:.82rem; font-weight:800; letter-spacing:.01em; cursor:pointer; transition:transform 140ms ease, border-color 160ms ease, background 160ms ease, box-shadow 180ms ease; }
.composer__list-add { justify-self:center; padding:.55rem .9rem; }
.composer__list-remove { display:inline-flex; align-items:center; justify-content:center; justify-self:end; min-width:104px; padding:.55rem .85rem; white-space:nowrap; }
.composer__list-remove-emoji { display:none; font-size:1rem; line-height:1; }
.composer__list-add:hover,
.composer__list-remove:hover { transform:translateY(-1px); border-color:rgba(129,140,248,.32); background:linear-gradient(135deg, rgba(99,102,241,.16), rgba(56,189,248,.08)); box-shadow:0 10px 20px rgba(0,0,0,.14); }
.composer__panel { display:grid; gap:12px; padding:16px; border-radius:20px; border:1px solid color-mix(in srgb, var(--border-color) 76%, transparent); background:color-mix(in srgb,#020617 82%, var(--bg-card) 18%); box-shadow:inset 0 1px 0 rgba(255,255,255,.04), 0 16px 40px rgba(0,0,0,.24); }
.composer__panel-head { display:grid; gap:4px; }
.composer__chip-picker { display:flex; flex-wrap:wrap; gap:.55rem; }
.composer__toggle-chip { border:1px solid rgba(148,163,184,.24); background:rgba(255,255,255,.04); color:color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%); min-height:2.2rem; padding:.42rem .82rem; border-radius:999px; font:inherit; font-size:.82rem; font-weight:800; letter-spacing:.02em; cursor:pointer; transition:transform 140ms ease, border-color 140ms ease, background 160ms ease, box-shadow 160ms ease; }
.composer__toggle-chip:hover { transform:translateY(-1px); border-color:rgba(129,140,248,.34); }
.composer__toggle-chip.is-active { border-color:rgba(129,140,248,.54); background:linear-gradient(135deg, rgba(99,102,241,.22), rgba(56,189,248,.12)); box-shadow:0 0 0 1px rgba(129,140,248,.16) inset; }
.composer__level-builder { padding-top:.15rem; }
.composer__level-list { display:grid; gap:.6rem; }
.composer__level-row { display:grid; grid-template-columns:auto minmax(0, 1fr) auto; align-items:center; gap:.85rem; width:100%; min-width:0; padding:.9rem 1rem; border-radius:18px; border:1px solid rgba(148,163,184,.18); background:linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.015)); color:var(--text-secondary); font:inherit; text-align:left; cursor:pointer; transition:border-color 160ms ease, background 160ms ease, box-shadow 180ms ease, transform 140ms ease, color 160ms ease; }
.composer__level-row:hover { transform:translateY(-1px); border-color:rgba(129,140,248,.28); box-shadow:0 12px 26px rgba(0,0,0,.16); color:color-mix(in srgb, var(--text-primary) 90%, #ffffff 10%); }
.composer__level-row.is-active { border-color:rgba(129,140,248,.42); background:linear-gradient(145deg, rgba(99,102,241,.16), rgba(56,189,248,.08)); box-shadow:0 0 0 1px rgba(129,140,248,.1) inset, 0 14px 28px rgba(0,0,0,.18); color:color-mix(in srgb, var(--text-primary) 96%, #ffffff 4%); }
.composer__level-row-mark { width:22px; display:flex; align-items:center; justify-content:center; flex:0 0 auto; }
.composer__level-row-dot { width:12px; height:12px; border-radius:999px; border:1px solid rgba(148,163,184,.32); background:rgba(148,163,184,.18); transition:transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 180ms ease; }
.composer__level-row.is-active .composer__level-row-dot { transform:scale(1.15); border-color:rgba(129,140,248,.64); background:linear-gradient(135deg, rgba(99,102,241,.8), rgba(56,189,248,.78)); box-shadow:0 0 0 6px rgba(99,102,241,.1); }
.composer__level-row-copy { display:grid; gap:.18rem; min-width:0; }
.composer__level-row-copy strong { font-size:.9rem; font-weight:850; letter-spacing:.01em; color:color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%); }
.composer__level-row-copy small { font-size:.74rem; line-height:1.4; color:rgba(148,163,184,.88); }
.composer__level-row.is-active .composer__level-row-copy small { color:color-mix(in srgb, var(--text-primary) 64%, rgba(148,163,184,.88) 36%); }
.composer__level-row-bars { display:flex; align-items:flex-end; justify-content:flex-end; gap:.22rem; flex:0 0 auto; }
.composer__level-row-bar { width:7px; border-radius:999px; background:rgba(148,163,184,.22); transition:background 160ms ease, box-shadow 160ms ease, opacity 160ms ease; }
.composer__level-row-bar:nth-child(1) { height:10px; }
.composer__level-row-bar:nth-child(2) { height:16px; }
.composer__level-row-bar:nth-child(3) { height:22px; }
.composer__level-row-bar.is-on { background:linear-gradient(180deg, rgba(56,189,248,.92), rgba(99,102,241,.96)); box-shadow:0 0 10px rgba(99,102,241,.16); }
.field-error { margin:0; color:#ef4444; font-size:0.9rem; font-weight:650; }
.composer__error { margin:0; padding:.75rem .9rem; border-radius:14px; border:1px solid rgba(248,113,113,.34); background:linear-gradient(180deg, rgba(127,29,29,.14), rgba(69,10,10,.12)); color:#fca5a5; font-size:.84rem; font-weight:700; line-height:1.35; }
.composer__action { min-height:40px; border-radius:12px; border:1px solid color-mix(in srgb, var(--accent-primary) 30%, var(--border-color) 70%); background:color-mix(in srgb, var(--bg-card) 90%, var(--accent-primary) 10%); color:var(--text-primary); padding:.55rem .95rem; font:inherit; font-weight:700; cursor:pointer; }
.composer__action--ghost { background:transparent; border-color:color-mix(in srgb, var(--border-color) 78%, transparent); }
.composer-preview { display:grid; gap:14px; }
.composer-preview__intro { margin:0; color:var(--text-secondary); font-size:.88rem; font-weight:700; }
.composer-preview__library-card { display:grid; gap:14px; padding:16px; border-radius:20px; border:1px solid rgba(148,163,184,.24); background:color-mix(in srgb,#020617 82%, var(--bg-card) 18%); box-shadow:inset 0 1px 0 rgba(255,255,255,.05), 0 16px 40px rgba(0,0,0,.28); }
.composer-preview__library-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
.composer-preview__library-copy { display:grid; gap:8px; min-width:0; }
.composer-preview__library-name { font-size:1.02rem; font-weight:900; color:color-mix(in srgb, var(--text-primary) 96%, #ffffff 4%); line-height:1.25; }
.composer-preview__library-chips { display:flex; flex-wrap:wrap; gap:.45rem; }
.composer-preview__chip { display:inline-flex; align-items:center; justify-content:center; min-height:1.8rem; padding:.35rem .72rem; border-radius:999px; border:1px solid rgba(148,163,184,.22); background:rgba(255,255,255,.05); color:color-mix(in srgb, var(--text-primary) 92%, #ffffff 8%); font-size:.78rem; font-weight:800; letter-spacing:.01em; }
.composer-preview__chip--primary { border-color:rgba(129,140,248,.44); background:linear-gradient(135deg, rgba(99,102,241,.18), rgba(56,189,248,.08)); }
.composer-preview__chip--muted { color:var(--text-secondary); }
.composer-preview__library-aliases { color:var(--text-secondary); font-size:.82rem; line-height:1.45; }
.composer-preview__library-badge { display:inline-flex; align-items:center; justify-content:center; min-height:1.9rem; padding:.35rem .72rem; border-radius:999px; border:1px solid rgba(129,140,248,.34); background:linear-gradient(135deg, rgba(99,102,241,.18), rgba(56,189,248,.08)); color:color-mix(in srgb, var(--text-primary) 94%, #ffffff 6%); font-size:.76rem; font-weight:900; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; }
.composer-preview__library-actions { display:flex; flex-wrap:wrap; gap:.75rem; }
.composer-preview__library-btn { min-height:40px; padding:.6rem .95rem; border-radius:12px; border:1px solid color-mix(in srgb, var(--accent-primary) 30%, var(--border-color) 70%); background:color-mix(in srgb, var(--bg-card) 90%, var(--accent-primary) 10%); color:var(--text-primary); font:inherit; font-size:.86rem; font-weight:800; cursor:default; }
.composer-preview__library-btn--ghost { background:transparent; border-color:color-mix(in srgb, var(--border-color) 78%, transparent); }

.builder-mode-enter-active,
.builder-mode-leave-active {
    transition: opacity .28s ease, transform .32s cubic-bezier(0.22, 0.61, 0.36, 1);
    transform-origin: top center;
}

.builder-mode-enter-from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
}

.builder-mode-leave-to {
    opacity: 0;
    transform: translateY(-10px) scale(0.99);
}

@keyframes builder-section-reveal {
    0% {
        opacity: 0;
        transform: translateY(14px) scale(0.985);
        filter: saturate(.94);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: saturate(1);
    }
}

@keyframes builderLandingReveal {
    0% {
        opacity: 0;
        transform: translateY(18px) scale(0.992);
        filter: saturate(0.92);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: saturate(1);
    }
}

@keyframes composer-secondary-chip-pulse {
    0% {
        transform: translateY(12px) scale(.86);
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        filter: saturate(.9) brightness(.96);
    }

    38% {
        transform: translateY(-2px) scale(1.04);
        box-shadow: 0 0 0 10px rgba(99, 102, 241, .14);
        filter: saturate(1.08) brightness(1.03);
    }

    100% {
        transform: translateY(0) scale(1);
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        filter: saturate(1);
    }
}

@keyframes composer-secondary-group-pulse {
    0% { box-shadow:0 0 0 0 rgba(99,102,241,0); background:rgba(99,102,241,0); }
    40% { box-shadow:0 0 0 10px rgba(99,102,241,.12); background:rgba(99,102,241,.08); }
    100% { box-shadow:0 0 0 0 rgba(99,102,241,0); background:rgba(99,102,241,0); }
}

@keyframes composer-secondary-chip-trail {
    0% {
        opacity: 0;
        transform: translateX(-130%) skewX(-24deg);
    }

    18% {
        opacity: 1;
    }

    100% {
        opacity: 0;
        transform: translateX(330%) skewX(-24deg);
    }
}

@keyframes composer-secondary-chip-rejecting {
    0% {
        background: linear-gradient(135deg, rgba(99,102,241,.18), rgba(56,189,248,.08));
        border-color: rgba(129,140,248,.42);
        box-shadow: 0 0 0 0 rgba(248,113,113,0);
    }

    24% {
        transform: translateX(7px) rotate(-1deg) scale(1.01);
        background: linear-gradient(135deg, rgba(251,146,60,.34), rgba(239,68,68,.2));
        border-color: rgba(251,146,60,.78);
        box-shadow: 0 0 0 4px rgba(251,146,60,.18);
    }

    52% {
        transform: translateX(-10px) rotate(1deg) scale(.995);
        background: linear-gradient(135deg, rgba(248,113,113,.42), rgba(127,29,29,.22));
        border-color: rgba(248,113,113,.84);
        box-shadow: 0 0 0 6px rgba(248,113,113,.18);
    }

    100% {
        transform: translateX(-44px) scale(.88);
        background: linear-gradient(135deg, rgba(248,113,113,.24), rgba(127,29,29,.12));
        border-color: rgba(248,113,113,.36);
        box-shadow: 0 0 0 0 rgba(248,113,113,0);
        opacity: .08;
        filter: saturate(.8) blur(.6px);
    }
}

.builder-landing-item.is-active {
    opacity: 0;
    animation: builderLandingReveal .62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: var(--builder-landing-delay, 0ms);
    will-change: opacity, transform;
}

.builder-landing-item {
    --builder-landing-delay: 0ms;
}

@media (prefers-reduced-motion: reduce) {
    .builder-mode-shell > * {
        animation: none;
    }

    .builder-landing-item.is-active {
        animation: none;
        opacity: 1;
    }

    .composer__selected-chip.is-fresh {
        animation: none;
    }

    .composer__selected-chips.is-pulsing {
        animation: none;
    }

    .composer__selected-chip.is-fresh .composer__selected-chip-trail {
        animation: none;
    }

    .secondary-chip-enter-active,
    .secondary-chip-leave-active,
    .secondary-chip-move {
        transition: none;
    }

    .composer__selected-chip.is-rejecting {
        animation: none;
    }
}

:deep(.popup-overlay.exercise-composer-popup.fade-enter-active),
:deep(.popup-overlay.exercise-composer-popup.fade-leave-active) {
    transition: opacity .22s ease;
}

:deep(.popup-overlay.exercise-composer-popup .popup) {
    width: min(760px, 94vw);
    max-height: 96vh;
}

:deep(.popup-overlay.exercise-composer-popup .popup-body) {
    padding-bottom: 2.4rem;
    overflow-y: auto;
}

:deep(.popup-overlay.exercise-composer-library-preview-popup .popup) {
    width: min(640px, 92vw);
}

:deep(.popup-overlay.exercise-composer-popup.fade-enter-active .popup),
:deep(.popup-overlay.exercise-composer-popup.fade-leave-active .popup) {
    transition: none !important;
}

:deep(.popup-overlay.exercise-composer-popup.fade-enter-from .popup),
:deep(.popup-overlay.exercise-composer-popup.fade-enter-to .popup),
:deep(.popup-overlay.exercise-composer-popup.fade-leave-from .popup),
:deep(.popup-overlay.exercise-composer-popup.fade-leave-to .popup) {
    opacity: 1 !important;
    transform: none !important;
}

@media (max-width: 900px) {
    .composer__grid,.composer__builder-grid { grid-template-columns:1fr; }
    .composer__select-action-row { grid-template-columns:1fr; }
    .composer-preview__library-top { flex-direction:column; }
}

@media (max-width: 640px) {
    .composer__list-remove { min-width:42px; padding-inline:.55rem; }
    .composer__list-remove-text { display:none; }
    .composer__list-remove-emoji { display:inline; }
}

@media (max-width: 510px) {
    .composer__level-row { grid-template-columns:auto minmax(0, 1fr); }
    .composer__level-row-bars { grid-column:2; justify-content:flex-start; }
}
</style>
