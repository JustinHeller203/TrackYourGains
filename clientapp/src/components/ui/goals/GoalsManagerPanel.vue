<template>
    <section class="card training-goals-card">
        <div class="training-goals-head">
            <div>
                <span class="training-goals-eyebrow">{{ t('goals.manager.eyebrow') }}</span>
                <h3 class="card-title training-goals-title">
                    <i class="fas fa-bullseye"></i> {{ t('goals.manager.title') }}
                </h3>
            </div>
            <div class="training-goals-summary">
                <span class="summary-chip">{{ tp('goals.manager.activeCount', { count: activeEvaluations.length }) }}</span>
                <span class="summary-chip is-success">{{ tp('goals.manager.achievedCount', { count: achievedCount }) }}</span>
            </div>
        </div>

        <p class="training-goals-subcopy">{{ t('goals.manager.subcopy') }}</p>

        <form ref="goalFormRef"
              class="goal-form"
              :class="{ 'goal-form--flash': highlightGoalForm }"
              @submit.prevent="saveGoal">
            <div class="goal-form-grid" :class="{ 'goal-form-grid--with-exercise': needsExercise }">
                <label class="goal-field">
                    <UiSettingsSelect v-model="draft.type"
                                      :label="t('goals.manager.typeLabel')"
                                      :options="goalTypeOptions" />
                </label>

                <div v-if="needsExercise" class="goal-field goal-field--exercise">
                    <div class="goal-field__top">
                        <span class="goal-field__label">{{ t('goals.manager.exerciseLabel') }}</span>
                        <button v-if="draft.exerciseId"
                                type="button"
                                class="goal-library-clear"
                                @click="clearSelectedExercise">
                            {{ t('goals.manager.clearSelection') }}
                        </button>
                    </div>
                    <button type="button"
                            class="goal-library-trigger"
                            @click="showExerciseLibrary = true">
                        <span class="goal-library-trigger__label">
                            {{ selectedExerciseLabel || t('goals.manager.selectExercise') }}
                        </span>
                    </button>
                </div>

                <label class="goal-field">
                        <span class="goal-field__label">{{ t('goals.manager.targetValueLabel') }}</span>
                    <input v-model.number="draft.targetValue"
                           class="input goal-input"
                           type="number"
                           min="0"
                           step="0.1"
                           :placeholder="targetPlaceholder" />
                </label>

                <label class="goal-field">
                    <span class="goal-field__label">{{ t('goals.common.deadline') }}</span>
                    <input v-model="draft.deadline"
                           class="input goal-input"
                           type="date" />
                </label>
            </div>

            <label class="goal-field">
                <span class="goal-field__label">{{ t('goals.manager.titleLabel') }}</span>
                <input v-model.trim="draft.title"
                       class="input goal-input"
                       :placeholder="autoTitle" />
            </label>

            <label class="goal-field">
                <span class="goal-field__label">{{ t('goals.manager.noteLabel') }}</span>
                <textarea v-model.trim="draft.note"
                          class="input goal-input goal-textarea"
                          rows="3"
                          :placeholder="t('goals.manager.notePlaceholder')"></textarea>
            </label>

            <div v-if="draftBaselineLabel" class="goal-form-meta">
                {{ t('goals.manager.startValue') }} <strong>{{ draftBaselineLabel }}</strong>
            </div>

            <div v-if="errorMessage" class="goal-error">
                {{ errorMessage }}
            </div>

            <div class="goal-form-actions">
                <button type="submit"
                        class="goal-submit-btn"
                        :title="draft.id ? t('goals.manager.updateGoal') : t('goals.manager.createGoal')"
                        :aria-label="draft.id ? t('goals.manager.updateGoal') : t('goals.manager.createGoal')">
                    {{ draft.id ? t('goals.manager.updateGoal') : t('goals.manager.createGoal') }}
                </button>
                <button v-if="draft.id"
                        type="button"
                        class="goal-submit-btn"
                        :title="t('goals.manager.cancelEdit')"
                        :aria-label="t('goals.manager.cancelEdit')"
                        @click="resetDraft">
                    {{ t('goals.manager.cancelEdit') }}
                </button>
            </div>
        </form>

        <div v-if="activeEvaluations.length" class="goal-list">
            <article v-for="entry in activeEvaluations" :key="entry.goal.id" class="goal-item" :class="`is-${entry.status}`">
                <div class="goal-item-head">
                    <div class="goal-item-head__copy">
                        <div class="goal-item-head__topline">
                            <span class="goal-type-chip">{{ typeLabel(entry.goal.type) }}</span>
                            <span v-if="getGoalDisplayLabel(entry.goal)" class="goal-item-head__context">
                                {{ getGoalDisplayLabel(entry.goal) }}
                            </span>
                        </div>
                        <h4>{{ entry.goal.title }}</h4>
                        <p>{{ entry.primaryText }}</p>
                    </div>
                    <span class="goal-status-chip">{{ entry.statusText }}</span>
                </div>

                <div class="goal-hero">
                    <div class="goal-hero__value">
                        <span class="goal-hero__label">{{ t('goals.common.progress') }}</span>
                        <strong>{{ Math.round(entry.percent) }}%</strong>
                    </div>
                    <div class="goal-hero__rail">
                        <div class="goal-progress-rail">
                            <div class="goal-progress-fill" :style="{ width: `${entry.percent}%` }"></div>
                        </div>
                    </div>
                </div>

                <div class="goal-stats">
                    <div class="goal-stat-card goal-stat-card--current">
                        <span class="goal-stat-card__eyebrow">{{ t('goals.common.current') }}</span>
                        <strong>{{ entry.currentLabel }}</strong>
                        <small class="goal-stat-card__caption">{{ t('goals.common.currentCaption') }}</small>
                    </div>
                    <div class="goal-stat-card goal-stat-card--target">
                        <span class="goal-stat-card__eyebrow">{{ t('goals.common.target') }}</span>
                        <strong>{{ entry.targetLabel }}</strong>
                        <small class="goal-stat-card__caption">{{ t('goals.common.targetCaption') }}</small>
                    </div>
                    <div v-if="entry.deadlineLabel" class="goal-stat-card goal-stat-card--compact">
                        <span class="goal-stat-card__eyebrow">{{ t('goals.common.deadline') }}</span>
                        <strong>{{ entry.deadlineLabel }}</strong>
                        <small class="goal-stat-card__caption">{{ t('goals.common.deadlineCaption') }}</small>
                    </div>
                </div>

                <div class="goal-meta-row">
                    <span v-if="entry.secondaryText" class="goal-meta-pill">
                        {{ entry.secondaryText }}
                    </span>
                    <span class="goal-meta-pill">
                        {{ entry.isAchieved ? t('goals.common.goalReached') : t('goals.common.goalActive') }}
                    </span>
                </div>

                <div class="goal-actions">
                    <button type="button"
                            class="goal-action-btn goal-action-btn--primary"
                            :title="t('goals.manager.editGoal')"
                            :aria-label="t('goals.manager.editGoal')"
                            @click="editGoal(entry.goal.id)">
                        <span class="goal-action-btn__icon" aria-hidden="true"></span>
                        {{ t('common.edit') }}
                    </button>
                    <button type="button"
                            class="goal-action-btn"
                            :title="t('goals.manager.archiveGoal')"
                            :aria-label="t('goals.manager.archiveGoal')"
                            @click="archiveGoal(entry.goal.id)">
                        <span class="goal-action-btn__icon" aria-hidden="true"></span>
                        {{ t('goals.manager.archive') }}
                    </button>
                    <button type="button"
                            class="goal-action-btn goal-action-btn--danger"
                            :title="t('goals.manager.deleteGoal')"
                            :aria-label="t('goals.manager.deleteGoal')"
                            @click="requestRemoveGoal(entry.goal.id, entry.goal.title, $event)">
                        <span class="goal-action-btn__icon" aria-hidden="true"></span>
                        {{ t('common.delete') }}
                    </button>
                </div>
            </article>
        </div>

        <div v-else class="goal-empty">
            {{ t('goals.manager.empty') }}
        </div>

        <details v-if="archivedEvaluations.length" class="goal-archive">
            <summary>{{ tp('goals.manager.archived', { count: archivedEvaluations.length }) }}</summary>
            <div class="goal-archive-list">
                <article v-for="entry in archivedEvaluations" :key="entry.goal.id" class="goal-item is-archived">
                    <div class="goal-item-head">
                        <div>
                            <h4>{{ entry.goal.title }}</h4>
                            <p>{{ getGoalDisplayLabel(entry.goal) || typeLabel(entry.goal.type) }}</p>
                        </div>
                        <span class="goal-status-chip">{{ entry.statusText }}</span>
                    </div>
                    <div class="goal-actions">
                        <button type="button"
                                class="goal-action-btn goal-action-btn--primary"
                                :title="t('goals.manager.restoreGoal')"
                                :aria-label="t('goals.manager.restoreGoal')"
                                @click="restoreGoal(entry.goal.id)">
                            <span class="goal-action-btn__icon" aria-hidden="true"></span>
                            {{ t('goals.manager.restore') }}
                        </button>
                        <button type="button"
                                class="goal-action-btn goal-action-btn--danger"
                                :title="t('goals.manager.deleteGoal')"
                                :aria-label="t('goals.manager.deleteGoal')"
                                @click="requestRemoveGoal(entry.goal.id, entry.goal.title, $event)">
                            <span class="goal-action-btn__icon" aria-hidden="true"></span>
                            {{ t('common.delete') }}
                        </button>
                    </div>
                </article>
            </div>
        </details>

        <GoalExerciseLibraryPopup :show="showExerciseLibrary"
                                  :model-value="draft.exerciseId"
                                  @cancel="showExerciseLibrary = false"
                                  @select="applyExerciseSelection" />

        <Teleport to="body">
            <DeleteConfirmPopup :show="showDeletePopup"
                                @confirm="confirmRemoveGoals"
                                @cancel="cancelRemoveGoals" />

            <Transition name="delete-trash">
                <div v-if="deleteTrashState.visible" class="delete-trash-overlay" aria-hidden="true">
                    <div v-if="deleteTrashChips.length" class="delete-trash-stack" :style="deleteTrashFlightStyle">
                        <span v-for="chip in deleteTrashChips" :key="chip" class="delete-trash-chip">
                            {{ chip }}
                        </span>
                    </div>
                    <div v-else-if="deleteTrashState.itemName" class="delete-trash-flight" :style="deleteTrashFlightStyle">
                        <span class="delete-trash-flight__title">{{ deleteTrashState.itemName }}</span>
                    </div>
                    <div class="delete-trash-bin">
                        <div class="delete-trash-bin__lid"></div>
                        <div class="delete-trash-bin__body"></div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
import EditInput from '@/components/ui/buttons/EditInput.vue'
import UiSettingsSelect from '@/components/ui/kits/selects/UiSettingsSelect.vue'
import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
import GoalExerciseLibraryPopup from '@/components/ui/popups/goal/GoalExerciseLibraryPopup.vue'
import { showDeleteTrashOverlay, DELETE_TRASH_ANIMATION_MS } from '@/composables/useDeleteTrashOverlay'
import { useI18n } from '@/composables/useI18n'
import { useUnits } from '@/composables/useUnits'
import { useGoalsStore } from '@/store/goalsStore'
import type { GoalWeightSample, GoalWorkoutSample, TrainingGoal, TrainingGoalType } from '@/types/goals'
import { evaluateTrainingGoals, getGoalAutoTitle, getGoalBaselineValue, getGoalExerciseLabel } from '@/utils/goalTracking'
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'

const props = defineProps<{
    workouts: GoalWorkoutSample[]
    weightHistory: GoalWeightSample[]
}>()

const store = useGoalsStore()
const { t } = useI18n()
const { unit, kgToDisplay } = useUnits()
const errorMessage = ref('')
const showExerciseLibrary = ref(false)
const showDeletePopup = ref(false)
const goalFormRef = ref<HTMLElement | null>(null)
const highlightGoalForm = ref(false)
const pendingDeleteGoalIds = ref<string[]>([])
const pendingDeleteGoalLabels = ref<string[]>([])
const pendingDeleteGoalEvent = ref<MouseEvent | null>(null)
const deleteTrashState = ref({
    visible: false,
    itemName: '',
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
})
const deleteTrashChips = ref<string[]>([])
let deleteTrashTimer: ReturnType<typeof setTimeout> | null = null

function tp(key: string, params: Record<string, string | number>) {
    return Object.entries(params).reduce(
        (text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
        t(key)
    )
}

const draft = reactive<{
    id: string
    type: TrainingGoalType
    title: string
    targetValue: number | null
    exerciseId: string
    exerciseName: string
    deadline: string
    note: string
}>({
    id: '',
    type: 'body_weight',
    title: '',
    targetValue: null,
    exerciseId: '',
    exerciseName: '',
    deadline: '',
    note: '',
})

onMounted(() => {
    store.load()
})

const goalTypeOptions = [
    { label: t('goals.type.bodyWeight'), value: 'body_weight' },
    { label: t('goals.type.exerciseWeight'), value: 'exercise_weight' },
    { label: t('goals.type.weeklyFrequency'), value: 'weekly_frequency' },
] as const

const evaluations = computed(() => evaluateTrainingGoals(store.items, { workouts: props.workouts, weights: props.weightHistory }))
const activeEvaluations = computed(() => evaluations.value.filter(entry => !entry.goal.archived))
const archivedEvaluations = computed(() => evaluations.value.filter(entry => !!entry.goal.archived))
const achievedCount = computed(() => activeEvaluations.value.filter(entry => entry.isAchieved).length)
const needsExercise = computed(() => draft.type === 'exercise_weight' || draft.type === 'exercise_reps')
const selectedExerciseLabel = computed(() => getGoalExerciseLabel(draft))

watch(needsExercise, (nextNeedsExercise) => {
    if (nextNeedsExercise) return
    clearSelectedExercise()
})

const autoTitle = computed(() => getGoalAutoTitle({
    type: draft.type,
    exerciseName: draft.exerciseName,
    targetValue: Number(draft.targetValue ?? 0),
}))

const targetPlaceholder = computed(() => {
    switch (draft.type) {
        case 'body_weight':
            return unit.value === 'kg' ? 'z. B. 80' : 'z. B. 176'
        case 'exercise_weight':
            return unit.value === 'kg' ? 'z. B. 100' : 'z. B. 220'
        case 'exercise_reps':
            return 'z. B. 10'
        case 'weekly_frequency':
            return 'z. B. 3'
        default:
            return t('goals.manager.targetValuePlaceholder')
    }
})

const draftBaselineValue = computed(() => getGoalBaselineValue({
    type: draft.type,
    exerciseId: draft.exerciseId,
    exerciseName: draft.exerciseName,
}, {
    workouts: props.workouts,
    weights: props.weightHistory,
}))

const draftBaselineLabel = computed(() => {
    const value = draftBaselineValue.value
    if (value == null) return null
    if (draft.type === 'body_weight' || draft.type === 'exercise_weight') {
        return `${Number(kgToDisplay(value).toFixed(1))} ${unit.value}`
    }
    if (draft.type === 'exercise_reps') return tp('goals.common.repsValue', { count: Math.round(value) })
    return tp('goals.common.weekValue', { count: Math.round(value) })
})

function typeLabel(type: TrainingGoalType) {
    return {
        body_weight: t('goals.type.bodyWeight'),
        exercise_weight: t('goals.type.exerciseWeight'),
        exercise_reps: t('goals.type.reps'),
        weekly_frequency: t('goals.type.frequency'),
    }[type]
}

function getGoalDisplayLabel(goal: Pick<TrainingGoal, 'exerciseId' | 'exerciseName'>) {
    return getGoalExerciseLabel(goal)
}

function resetDraft() {
    draft.id = ''
    draft.type = 'body_weight'
    draft.title = ''
    draft.targetValue = null
    draft.exerciseId = ''
    draft.exerciseName = ''
    draft.deadline = ''
    draft.note = ''
    errorMessage.value = ''
}

function applyExerciseSelection(selection: { id: string; name: string }) {
    draft.exerciseId = selection.id
    draft.exerciseName = selection.name
    showExerciseLibrary.value = false
    errorMessage.value = ''
}

function clearSelectedExercise() {
    draft.exerciseId = ''
    draft.exerciseName = ''
}

function saveGoal() {
    errorMessage.value = ''
    if (needsExercise.value && !draft.exerciseId.trim()) {
        errorMessage.value = t('goals.manager.error.exerciseRequired')
        return
    }
    if (draft.targetValue == null || !Number.isFinite(draft.targetValue) || draft.targetValue <= 0) {
        errorMessage.value = t('goals.manager.error.targetInvalid')
        return
    }

    store.upsert({
        id: draft.id || undefined,
        type: draft.type,
        title: draft.title.trim() || autoTitle.value,
        targetValue: draft.targetValue,
        baselineValue: draftBaselineValue.value,
        exerciseId: draft.exerciseId.trim() || null,
        exerciseName: draft.exerciseName.trim() || null,
        deadline: draft.deadline || null,
        note: draft.note.trim() || null,
        archived: false,
    })
    resetDraft()
}

function editGoal(id: string) {
    const goal = store.items.find(item => item.id === id)
    if (!goal) return
    draft.id = goal.id
    draft.type = goal.type
    draft.title = goal.title
    draft.targetValue = goal.targetValue
    draft.exerciseId = goal.exerciseId ?? ''
    draft.exerciseName = goal.exerciseName ?? ''
    draft.deadline = goal.deadline ?? ''
    draft.note = goal.note ?? ''
    errorMessage.value = ''
    nextTick(() => {
        goalFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        highlightGoalForm.value = false
        requestAnimationFrame(() => {
            highlightGoalForm.value = true
            window.setTimeout(() => {
                highlightGoalForm.value = false
            }, 1800)
        })
    })
}

function archiveGoal(id: string) {
    store.setArchived(id, true)
    if (draft.id === id) resetDraft()
}

function restoreGoal(id: string) {
    store.setArchived(id, false)
}

const deleteTrashFlightStyle = computed(() => ({
    left: `${deleteTrashState.value.startX}px`,
    top: `${deleteTrashState.value.startY}px`,
    '--delete-fly-x': `${deleteTrashState.value.deltaX}px`,
    '--delete-fly-y': `${deleteTrashState.value.deltaY}px`,
}))

function clearDeleteTrashTimer() {
    if (deleteTrashTimer) {
        clearTimeout(deleteTrashTimer)
        deleteTrashTimer = null
    }
}

function hideDeleteTrash() {
    clearDeleteTrashTimer()
    deleteTrashState.value = {
        visible: false,
        itemName: '',
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    }
    deleteTrashChips.value = []
}

function launchDeleteTrash(chips: string[], event: MouseEvent | undefined, onDone: () => void) {
    clearDeleteTrashTimer()
    const trigger = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null
    const rect = trigger?.getBoundingClientRect()
    const startX = event?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2)
    const startY = event?.clientY ?? (rect ? rect.top + rect.height / 2 : Math.max(120, window.innerHeight * 0.28))
    const targetX = window.innerWidth / 2
    const targetY = window.innerHeight - 84

    const safeChips = chips
        .map(chip => chip.trim())
        .filter(Boolean)
        .map(chip => chip.length > 36 ? `${chip.slice(0, 35)}…` : chip)
        .slice(0, 6)

    deleteTrashChips.value = safeChips.length > 1 ? safeChips : []
    deleteTrashState.value = {
        visible: true,
        itemName: safeChips.length === 1 ? safeChips[0] : '',
        startX,
        startY,
        deltaX: targetX - startX,
        deltaY: targetY - startY,
    }
    showDeleteTrashOverlay({
        startX,
        startY,
        title: safeChips.length === 1 ? safeChips[0] : '',
        chips: safeChips.length > 1 ? safeChips : [],
        targetX,
        targetY,
        durationMs: DELETE_TRASH_ANIMATION_MS,
    })

    deleteTrashTimer = setTimeout(() => {
        onDone()
        hideDeleteTrash()
    }, DELETE_TRASH_ANIMATION_MS)
}

function requestRemoveGoals(ids: string[], labels: string[], event?: MouseEvent) {
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)))
    if (!uniqueIds.length) return
    pendingDeleteGoalIds.value = uniqueIds
    pendingDeleteGoalLabels.value = labels.length ? labels : uniqueIds.map(() => t('goals.manager.goalFallback'))
    pendingDeleteGoalEvent.value = event ?? null
    showDeletePopup.value = true
}

function requestRemoveGoal(id: string, label?: string | null, event?: MouseEvent) {
    requestRemoveGoals([id], [(label || t('goals.manager.goalFallback')).trim() || t('goals.manager.goalFallback')], event)
}

function cancelRemoveGoals() {
    showDeletePopup.value = false
    pendingDeleteGoalIds.value = []
    pendingDeleteGoalLabels.value = []
    pendingDeleteGoalEvent.value = null
}

function confirmRemoveGoals() {
    const ids = [...pendingDeleteGoalIds.value]
    const labels = [...pendingDeleteGoalLabels.value]
    const event = pendingDeleteGoalEvent.value ?? undefined
    if (!ids.length) {
        cancelRemoveGoals()
        return
    }

    launchDeleteTrash(labels, event, () => {
        removeGoals(ids)
    })
    cancelRemoveGoals()
}

function removeGoal(id: string) {
    store.remove(id)
    if (draft.id === id) resetDraft()
}

function removeGoals(ids: string[]) {
    ids.forEach(id => removeGoal(id))
}

onUnmounted(() => {
    clearDeleteTrashTimer()
})
</script>

<style scoped>
.delete-trash-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2800;
}

.delete-trash-flight {
    position: fixed;
    left: 0;
    top: 0;
    transform: translate(-50%, -50%);
    padding: 10px 14px;
    border-radius: 16px;
    border: 1px solid rgba(248, 113, 113, 0.28);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(254, 242, 242, 0.92));
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
    animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    will-change: transform, opacity;
}

.delete-trash-flight__title {
    display: block;
    max-width: min(46vw, 320px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #b91c1c;
    font-weight: 800;
    font-size: 0.92rem;
    letter-spacing: 0.01em;
}

.delete-trash-stack {
    position: fixed;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: .45rem;
    max-width: min(420px, calc(100vw - 2rem));
    transform: translate(-50%, -50%);
    animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    will-change: transform, opacity;
}

.delete-trash-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: .45rem .8rem;
    border-radius: 999px;
    border: 1px solid rgba(248, 113, 113, 0.22);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(254, 242, 242, 0.92));
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
    color: #b91c1c;
    font-size: .84rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    white-space: nowrap;
}

.delete-trash-bin {
    position: fixed;
    left: 50%;
    bottom: 24px;
    width: 72px;
    height: 82px;
    transform: translateX(-50%);
    animation: delete-trash-bin-pop .3s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.delete-trash-bin__lid {
    position: absolute;
    top: 0;
    left: 10px;
    width: 52px;
    height: 12px;
    border-radius: 999px;
    background: linear-gradient(180deg, #475569, #334155);
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
}

.delete-trash-bin__lid::before {
    content: '';
    position: absolute;
    left: 18px;
    top: -6px;
    width: 16px;
    height: 8px;
    border-radius: 999px 999px 4px 4px;
    border: 2px solid rgba(71, 85, 105, 0.92);
    border-bottom: 0;
}

.delete-trash-bin__body {
    position: absolute;
    left: 14px;
    top: 12px;
    width: 44px;
    height: 58px;
    border-radius: 0 0 16px 16px;
    background: linear-gradient(180deg, #64748b, #475569);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 18px 32px rgba(15, 23, 42, 0.22);
}

.delete-trash-bin__body::before,
.delete-trash-bin__body::after {
    content: '';
    position: absolute;
    top: 10px;
    bottom: 10px;
    width: 3px;
    border-radius: 999px;
    background: rgba(226, 232, 240, 0.48);
}

.delete-trash-bin__body::before {
    left: 12px;
    box-shadow: 9px 0 0 rgba(226, 232, 240, 0.36), 18px 0 0 rgba(226, 232, 240, 0.3);
}

.delete-trash-enter-active,
.delete-trash-leave-active {
    transition: opacity .18s ease;
}

.delete-trash-enter-from,
.delete-trash-leave-to {
    opacity: 0;
}

@keyframes delete-trash-bin-pop {
    0% {
        opacity: 0;
        transform: translateX(-50%) translateY(12px) scale(0.9);
    }

    100% {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
    }
}

@keyframes delete-trash-flight {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.94) rotate(0deg);
    }

    18% {
        opacity: 1;
    }

    72% {
        opacity: 1;
        transform: translate(calc(-50% + var(--delete-fly-x) * .82), calc(-50% + var(--delete-fly-y) * .82)) scale(.78) rotate(-10deg);
    }

    100% {
        opacity: 0;
        transform: translate(calc(-50% + var(--delete-fly-x)), calc(-50% + var(--delete-fly-y))) scale(.26) rotate(-18deg);
    }
}

html.dark-mode .delete-trash-flight {
    border-color: rgba(248, 113, 113, 0.32);
    background: linear-gradient(180deg, rgba(30, 41, 59, 0.96), rgba(69, 10, 10, 0.88));
    box-shadow: 0 20px 42px rgba(2, 6, 23, 0.42);
}

html.dark-mode .delete-trash-flight__title {
    color: #fca5a5;
}

html.dark-mode .delete-trash-chip {
    border-color: rgba(248, 113, 113, 0.28);
    background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
    color: #f8fafc;
}

html.dark-mode .delete-trash-bin__lid {
    background: linear-gradient(180deg, #94a3b8, #64748b);
}

html.dark-mode .delete-trash-bin__lid::before {
    border-color: rgba(148, 163, 184, 0.92);
}

html.dark-mode .delete-trash-bin__body {
    background: linear-gradient(180deg, #64748b, #334155);
}

html.dark-mode .delete-trash-bin__body::before {
    box-shadow: 9px 0 0 rgba(226, 232, 240, 0.26), 18px 0 0 rgba(226, 232, 240, 0.2);
}

.training-goals-card {
    display: grid;
    gap: 16px;
    margin-bottom: 24px;
}

.training-goals-head,
.training-goals-summary,
.goal-item-head,
.goal-stats,
.goal-actions,
.goal-form-actions {
    display: flex;
    gap: 12px;
}

.training-goals-head,
.goal-item-head {
    justify-content: space-between;
    align-items: flex-start;
}

.training-goals-summary,
.goal-form-actions,
.goal-actions {
    flex-wrap: wrap;
}

.training-goals-eyebrow {
    display: block;
    margin-bottom: 4px;
    color: #64748b;
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.training-goals-subcopy,
.goal-secondary,
.goal-item-head p,
.goal-form-meta,
.goal-empty,
.goal-archive summary {
    color: #64748b;
}

.summary-chip,
.goal-status-chip {
    border-radius: 999px;
    padding: 6px 10px;
    background: rgba(59, 130, 246, 0.12);
    color: #1d4ed8;
    font-size: 0.82rem;
    font-weight: 700;
}

.summary-chip.is-success,
.goal-item.is-achieved .goal-status-chip {
    background: rgba(16, 185, 129, 0.16);
    color: #047857;
}

.goal-form {
    display: grid;
    gap: 14px;
    padding: 14px 16px 16px;
    scroll-margin-top: 96px;
    border-radius: 24px;
    border: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, white 6%), color-mix(in srgb, var(--bg-secondary) 82%, var(--bg-card) 18%));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 14px 32px rgba(15, 23, 42, 0.06);
}

.goal-form--flash {
    animation: goal-form-flash 1.8s ease;
}

@keyframes goal-form-flash {
    0% {
        border-color: color-mix(in srgb, var(--accent-primary) 72%, var(--border-color));
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 0%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 14px 32px rgba(15, 23, 42, 0.06);
    }

    20% {
        border-color: color-mix(in srgb, var(--accent-primary) 84%, var(--border-color));
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.34), 0 18px 38px rgba(15, 23, 42, 0.1);
    }

    100% {
        border-color: color-mix(in srgb, var(--border-color) 72%, transparent);
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 0%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 14px 32px rgba(15, 23, 42, 0.06);
    }
}

.goal-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
}

@media (min-width: 960px) {
    .goal-form-grid--with-exercise {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.goal-field {
    display: grid;
    gap: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    min-width: 0;
}

.goal-field--exercise {
    align-content: start;
}

.goal-field__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-width: 0;
}

.goal-field__label {
    color: var(--text-secondary);
    font-size: 0.88rem;
    font-weight: 600;
}

.goal-input {
    min-height: 44px;
    width: 100%;
    padding: 0.82rem 0.95rem;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    color: var(--text-primary);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.07);
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease, transform .16s ease;
}

.goal-input:hover {
    border-color: color-mix(in srgb, var(--accent-primary) 36%, var(--border-color));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.52), 0 10px 24px rgba(15, 23, 42, 0.1);
    transform: translateY(-1px);
}

.goal-input:focus {
    outline: none;
}

.goal-input:focus-visible {
    border-color: color-mix(in srgb, var(--accent-primary) 48%, var(--border-color));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 14%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.56), 0 12px 28px rgba(15, 23, 42, 0.12);
}

.goal-library-trigger {
    min-height: 44px;
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    color: var(--text-primary);
    padding: 0.82rem 0.95rem;
    text-align: left;
    overflow: hidden;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.07);
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease, transform .16s ease;
}

.goal-library-trigger:hover {
    border-color: color-mix(in srgb, var(--accent-primary) 36%, var(--border-color));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.52), 0 10px 24px rgba(15, 23, 42, 0.1);
    transform: translateY(-1px);
}

.goal-library-trigger:focus {
    outline: none;
}

.goal-library-trigger:focus-visible {
    border-color: color-mix(in srgb, var(--accent-primary) 48%, var(--border-color));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 14%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.56), 0 12px 28px rgba(15, 23, 42, 0.12);
}

.goal-library-trigger__label {
    display: block;
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    font-size: 0.96rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.goal-library-clear {
    border: 0;
    background: transparent;
    color: var(--text-secondary);
    font: inherit;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
}

.goal-select,
.goal-textarea {
    width: 100%;
}

.goal-select {
    min-height: 0;
    font-weight: 500;
}

.goal-textarea {
    resize: vertical;
    min-height: 110px;
    padding-top: 0.9rem;
    line-height: 1.45;
}

.goal-textarea::placeholder {
    color: var(--text-secondary);
    opacity: 0.82;
}

.goal-field :deep(.ui-settings-select__label) {
    margin-bottom: 6px;
    color: var(--text-secondary);
    font-size: 0.88rem;
    font-weight: 600;
}

.goal-field :deep(.ui-settings-select__control) {
    min-height: 44px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    color: var(--text-primary);
    padding: 0.82rem 2.45rem 0.82rem 0.95rem;
    font-size: 0.95rem;
    font-weight: 600;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.07);
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease, transform .16s ease;
}

.goal-field :deep(.ui-settings-select__control:hover) {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--accent-primary) 36%, var(--border-color));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.52), 0 10px 24px rgba(15, 23, 42, 0.1);
}

.goal-field :deep(.ui-settings-select__control:focus-visible) {
    border-color: color-mix(in srgb, var(--accent-primary) 48%, var(--border-color));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 14%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.56), 0 12px 28px rgba(15, 23, 42, 0.12);
    transform: translateY(-1px);
}

.goal-field :deep(.ui-settings-select__menu) {
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 78%, var(--bg-card) 22%));
    box-shadow: 0 16px 36px rgba(15, 23, 42, 0.16);
}

.goal-error {
    color: #b91c1c;
    font-weight: 600;
}

.goal-submit-btn {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, .08);
    padding: .6rem 1rem;
    border-radius: 12px;
    min-height: 42px;
    font-size: .95rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform .08s ease, box-shadow .2s, border-color .18s ease;
}

.goal-submit-btn:hover {
    transform: translateY(-1px);
    border-color: var(--accent-primary, #4B6CB7);
    box-shadow: 0 8px 18px rgba(15, 23, 42, .12);
}

.goal-submit-btn:focus {
    outline: none;
}

.goal-submit-btn:focus-visible {
    border-color: var(--accent-primary, #4B6CB7);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary, #4B6CB7) 18%, transparent), 0 8px 18px rgba(15, 23, 42, .12);
}

.goal-list,
.goal-archive-list {
    display: grid;
    gap: 14px;
}

.goal-item {
    display: grid;
    gap: 16px;
    padding: 20px;
    border-radius: 24px;
    border: 1px solid color-mix(in srgb, var(--border-color) 72%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, white 6%), color-mix(in srgb, var(--bg-secondary) 82%, var(--bg-card) 18%));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 14px 32px rgba(15, 23, 42, 0.06);
}

.goal-item.is-on_track {
    border-color: rgba(59, 130, 246, 0.32);
}

.goal-item.is-needs_attention {
    border-color: rgba(245, 158, 11, 0.35);
}

.goal-item.is-achieved {
    border-color: rgba(16, 185, 129, 0.36);
}

.goal-item.is-archived {
    opacity: 0.8;
}

.goal-item-head {
    align-items: center;
}

.goal-item-head__copy {
    display: grid;
    gap: 8px;
}

.goal-item-head__topline {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.goal-type-chip {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0.3rem 0.72rem;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.14), rgba(14, 165, 233, 0.12));
    color: #1d4ed8;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    border: 1px solid rgba(37, 99, 235, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48);
}

.goal-item-head__context {
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 700;
}

.goal-item-head h4,
.goal-primary {
    margin: 0;
}

.goal-item-head h4 {
    font-size: 1.14rem;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.goal-item-head p {
    margin: 0;
    color: #475569;
    font-size: 0.92rem;
    line-height: 1.45;
}

.goal-hero {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    align-items: center;
    padding: 16px 18px;
    border-radius: 20px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.07);
}

.goal-hero__value {
    display: grid;
    gap: 2px;
    min-width: 88px;
}

.goal-hero__label {
    color: #64748b;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.goal-hero__value strong {
    font-size: 1.72rem;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #020617;
}

.goal-hero__rail {
    min-width: 0;
}

.goal-progress-rail {
    height: 12px;
    margin: 0;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.18);
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.1);
}

.goal-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2563eb, #0ea5e9);
}

.goal-item.is-achieved .goal-progress-fill {
    background: linear-gradient(90deg, #10b981, #059669);
}

.goal-item.is-needs_attention .goal-progress-fill {
    background: linear-gradient(90deg, #f59e0b, #f97316);
}

.goal-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.goal-stat-card {
    display: grid;
    gap: 10px;
    min-width: 0;
    padding: 16px;
    border-radius: 20px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.07);
    position: relative;
    overflow: hidden;
}

.goal-stat-card::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: rgba(148, 163, 184, 0.3);
}

.goal-stat-card--current::before {
    background: linear-gradient(180deg, #2563eb, #0ea5e9);
}

.goal-stat-card--target::before {
    background: linear-gradient(180deg, #10b981, #14b8a6);
}

.goal-stat-card--current {
    background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
}

.goal-stat-card--target {
    background:
        radial-gradient(circle at top right, color-mix(in srgb, #10b981 12%, transparent), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
}

.goal-stat-card--compact {
    grid-column: 1 / -1;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
}

.goal-stat-card__eyebrow {
    color: rgba(71, 85, 105, 0.88);
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.goal-stats strong {
    font-size: 1.72rem;
    line-height: 0.98;
    letter-spacing: -0.05em;
    max-width: 100%;
    overflow-wrap: anywhere;
    color: #020617;
}

.goal-stat-card--current strong,
.goal-stat-card--target strong {
    font-size: clamp(1.55rem, 1.2rem + 1vw, 2.3rem);
}

.goal-stat-card--compact strong {
    font-size: 1.02rem;
    letter-spacing: -0.02em;
}

.goal-stat-card__caption {
    color: #475569;
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.35;
}

.goal-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.goal-meta-pill {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: 0.38rem 0.75rem;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.12);
    color: #475569;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.2;
    border: 1px solid rgba(148, 163, 184, 0.12);
}

.goal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 6px;
    border-radius: 18px;
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.05);
}

.goal-action-btn {
    flex: 1 1 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    padding: 0.72rem 1rem;
    border-radius: 14px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-primary);
    font: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    cursor: pointer;
    box-shadow: none;
    transition: transform .16s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
}

.goal-action-btn__icon {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: rgba(100, 116, 139, 0.34);
    box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.12);
}

.goal-action-btn:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--accent-primary) 36%, var(--border-color));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.52), 0 10px 24px rgba(15, 23, 42, 0.1);
}

.goal-action-btn:focus {
    outline: none;
}

.goal-action-btn:focus-visible {
    border-color: color-mix(in srgb, var(--accent-primary) 48%, var(--border-color));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 16%, transparent), 0 14px 24px rgba(15, 23, 42, 0.1);
}

.goal-action-btn--primary {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    border-color: color-mix(in srgb, var(--accent-primary) 34%, var(--border-color));
    color: color-mix(in srgb, var(--accent-primary) 74%, #0f172a 26%);
}

.goal-action-btn--primary .goal-action-btn__icon {
    background: color-mix(in srgb, var(--accent-primary) 74%, white 26%);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent);
}

.goal-action-btn--danger {
    color: #b91c1c;
    background: linear-gradient(180deg, rgba(254, 242, 242, 0.96), rgba(254, 226, 226, 0.92));
    border-color: rgba(248, 113, 113, 0.26);
}

.goal-action-btn--danger .goal-action-btn__icon {
    background: rgba(220, 38, 38, 0.78);
    box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.16);
}

.goal-empty {
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(148, 163, 184, 0.08);
}

.goal-archive summary {
    cursor: pointer;
    font-weight: 700;
}

html.dark-mode .goal-item,
html.dark-mode .goal-form {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 92%, #020617 8%), color-mix(in srgb, var(--bg-secondary) 88%, var(--bg-card) 12%));
    border-color: rgba(148, 163, 184, 0.24);
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22);
}

html.dark-mode .goal-form--flash {
    animation: goal-form-flash-dark 1.8s ease;
}

@keyframes goal-form-flash-dark {
    0% {
        border-color: rgba(129, 140, 248, 0.5);
        box-shadow: 0 0 0 0 rgba(129, 140, 248, 0), 0 16px 34px rgba(0, 0, 0, 0.22);
    }

    20% {
        border-color: rgba(129, 140, 248, 0.88);
        box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.18), 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    100% {
        border-color: rgba(148, 163, 184, 0.24);
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22);
    }
}

html.dark-mode .goal-item {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 92%, #020617 8%), color-mix(in srgb, var(--bg-secondary) 88%, var(--bg-card) 12%));
}

html.dark-mode .goal-field__label {
    color: var(--text-secondary);
}

html.dark-mode .goal-select {
    color: var(--text-primary);
}

html.dark-mode .goal-input,
html.dark-mode .goal-library-trigger {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 26px rgba(0, 0, 0, 0.28);
}

html.dark-mode .goal-input:focus-visible,
html.dark-mode .goal-library-trigger:focus-visible {
    border-color: rgba(129, 140, 248, 0.74);
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 16px 34px rgba(0, 0, 0, 0.34);
}

html.dark-mode .goal-field :deep(.ui-settings-select__control) {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 26px rgba(0, 0, 0, 0.28);
}

html.dark-mode .goal-field :deep(.ui-settings-select__control:focus-visible) {
    border-color: rgba(129, 140, 248, 0.74);
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 16px 34px rgba(0, 0, 0, 0.34);
}

html.dark-mode .goal-field :deep(.ui-settings-select__menu) {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 84%, #020617 16%));
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.42);
}

html.dark-mode .goal-submit-btn {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: rgba(148, 163, 184, 0.28);
    box-shadow: 0 6px 16px rgba(0, 0, 0, .22);
}

html.dark-mode .training-goals-eyebrow,
html.dark-mode .training-goals-subcopy,
html.dark-mode .goal-item-head p,
html.dark-mode .goal-form-meta,
html.dark-mode .goal-empty,
html.dark-mode .goal-archive summary,
html.dark-mode .goal-stats span,
html.dark-mode .goal-library-trigger__meta,
html.dark-mode .goal-library-clear {
    color: #cbd5e1;
}

html.dark-mode .goal-type-chip {
    background: rgba(96, 165, 250, 0.16);
    color: #bfdbfe;
}

html.dark-mode .goal-hero {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 26px rgba(0, 0, 0, 0.28);
}

html.dark-mode .goal-hero__value strong,
html.dark-mode .goal-stats strong {
    color: #f8fafc;
}

html.dark-mode .goal-item-head__context,
html.dark-mode .goal-meta-pill {
    color: #cbd5e1;
}

html.dark-mode .goal-stat-card {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 26px rgba(0, 0, 0, 0.28);
}

html.dark-mode .goal-stat-card--current {
    background:
        radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
}

html.dark-mode .goal-stat-card--target {
    background:
        radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
}

html.dark-mode .goal-stat-card--compact {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
}

html.dark-mode .goal-stat-card__eyebrow,
html.dark-mode .goal-stat-card__caption {
    color: #cbd5e1;
}

html.dark-mode .goal-action-btn {
    background: transparent;
    border-color: rgba(148, 163, 184, 0.22);
    box-shadow: none;
}

html.dark-mode .goal-action-btn--primary {
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.32), rgba(30, 64, 175, 0.24));
    border-color: rgba(96, 165, 250, 0.28);
    color: #dbeafe;
}

html.dark-mode .goal-action-btn--danger {
    background: linear-gradient(180deg, rgba(127, 29, 29, 0.42), rgba(69, 10, 10, 0.36));
    border-color: rgba(248, 113, 113, 0.24);
    color: #fecaca;
}

html.dark-mode .goal-actions {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 26px rgba(0, 0, 0, 0.2);
}

@media (max-width: 720px) {
    .training-goals-head,
    .goal-item-head {
        flex-direction: column;
    }

    .goal-stats {
        grid-template-columns: 1fr;
    }

    .goal-hero {
        grid-template-columns: 1fr;
    }

    .goal-action-btn {
        flex-basis: 100%;
    }
}
</style>
