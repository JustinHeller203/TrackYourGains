<!-- components/ui/popups/TrainingSimulation.vue -->
<template>
    <BasePopup :show="show"
               :title="popupTitle"
               :overlayClass="popupOverlayClass"
               :showClose="true"
               :show-actions="false"
               @cancel="emitClose()">
        <template #header>
            <button v-if="show && !isFollowUpOnly"
                    type="button"
                    class="sim-session-time"
                    :class="{
                        'is-running': sessionTimerRunning,
                        'is-paused': !sessionTimerRunning,
                        'is-bouncing': sessionTimerBounce
                    }"
                    :aria-label="sessionTimerRunning ? t('trainingSimulation.session.pauseAria') : t('trainingSimulation.session.resumeAria')"
                    :title="sessionTimerRunning ? t('trainingSimulation.session.pauseAria') : t('trainingSimulation.session.resumeAria')"
                    @click="toggleSessionTimer">
                <span class="sim-session-time__ring" aria-hidden="true"></span>
                <span class="sim-session-time__value">{{ sessionElapsedLabel }}</span>
                <span class="sim-session-time__status" aria-hidden="true">
                    {{ sessionTimerRunning ? t('trainingSimulation.pause') : t('trainingSimulation.continue') }}
                </span>
            </button>
        </template>

        <div v-if="isFollowUpOnly" class="sim-followup">
            <div class="sim-followup-card">
                <div class="sim-followup-title">
                    {{ t('trainingSimulation.followup.title') }}
                </div>
                <p class="sim-followup-text">
                    {{ t('trainingSimulation.followup.text') }}
                </p>
                <div class="sim-followup-status">
                    <div class="sim-followup-row">
                        <span>{{ t('trainingSimulation.followup.feedback') }}</span>
                        <strong class="sim-followup-dbl"
                                role="button"
                                tabindex="0"
                                @dblclick="onFollowupFeedbackDblClick">
                            {{ followupFeedbackExists ? t('trainingSimulation.followup.exists') : t('trainingSimulation.followup.missing') }}
                        </strong>
                    </div>
                    <div class="sim-followup-row" :class="{ 'is-disabled': !followupPainAvailable }">
                        <span>{{ t('trainingSimulation.followup.painDiary') }}</span>
                        <strong class="sim-followup-dbl"
                                role="button"
                                tabindex="0"
                                @dblclick="onFollowupPainDblClick">
                            {{ followupPainDoneToday ? t('trainingSimulation.followup.exists') : (followupPainAvailable ? t('trainingSimulation.followup.missing') : t('trainingSimulation.followup.notNeeded')) }}
                        </strong>
                    </div>
                </div>
                <p class="sim-followup-hint">
                    {{ t('trainingSimulation.followup.hintBefore') }}
                    <b>{{ t('trainingSimulation.followup.missing') }}</b>
                    {{ t('trainingSimulation.followup.hintMiddle') }}
                    <b>{{ t('trainingSimulation.followup.exists') }}</b>
                    {{ t('trainingSimulation.followup.hintAfter') }}
                </p>
                <div class="sim-followup-actions">
                    <PopupActionButton variant="ghost" @click="openFollowupPlanProgress">
                        {{ t('trainingSimulation.followup.viewTraining') }}
                    </PopupActionButton>
                    <PopupActionButton variant="ghost" @click="openFollowupTrainingEdit">
                        {{ t('trainingSimulation.followup.editToday') }}
                    </PopupActionButton>
                    <PopupActionButton @click="startNewTrainingAnyway">
                        {{ t('trainingSimulation.followup.startAnyway') }}
                    </PopupActionButton>
                </div>
            </div>
        </div>

        <div v-else class="sim-scroll">
            <div class="sim-wrap">
                <div v-if="!plan || !plan.exercises?.length" class="sim-empty">
                    {{ t('trainingSimulation.empty') }}
                </div>

                <template v-else>
                    <!-- Progress -->
                    <div class="sim-progress">
                        <div class="sim-progress-row">
                            <span>{{ t('trainingSimulation.exercise') }} {{ exIndex + 1 }}/{{ plan.exercises.length }}</span>
                            <span>{{ progressPct }}%</span>
                        </div>
                        <div class="sim-bar">
                            <div class="sim-bar-fill" :style="{ width: progressPct + '%' }"></div>
                        </div>
                    </div>

                    <!-- Main -->
                    <div class="sim-main">
                        <div class="sim-ex-head">
                            <div class="sim-ex-picker">
                                <UiPopupSelect id="sim-ex-select"
                                               :label="t('trainingSimulation.chooseExercise')"
                                               :placeholder="t('trainingSimulation.selectExercise')"
                                               v-model="selectedExerciseIdx"
                                               :options="exerciseOptions" />
                            </div>

                            <div class="sim-ex-name">{{ current.exercise }}</div>
                            <div v-if="currentExerciseGoals.length" class="sim-goal-hints">
                                <div v-for="goal in currentExerciseGoals" :key="goal.goal.id" class="sim-goal-hint" :class="`is-${goal.status}`">
                                    <span class="sim-goal-hint__title">{{ goal.goal.title }}</span>
                                    <span class="sim-goal-hint__meta">{{ goal.currentLabel }} / {{ goal.targetLabel }}</span>
                                    <span class="sim-goal-hint__copy">{{ goal.primaryText }}</span>
                                </div>
                            </div>
                            <div v-if="mottoDisplay" class="sim-motto">“{{ mottoDisplay }}”</div>

                            <div class="sim-ex-meta">
                                <span class="pill">{{ typeLabel(currentType) }}</span>

                                <span v-if="currentType === 'ausdauer' && cardioMinutesCurrent > 0"
                                      class="pill ghost">
                                    ⏱️ {{ cardioMinutesCurrent }} min
                                </span>

                                <span v-else-if="currentType === 'dehnung' && (current.reps ?? 0) > 0" class="pill ghost">
                                    🧘 {{ current.reps }} s
                                </span>

                                <span v-else-if="currentType !== 'ausdauer' && currentType !== 'dehnung' && ((current.sets ?? 0) > 0 || (current.reps ?? 0) > 0)"
                                      class="pill ghost">
                                    🎯 {{ current.sets }} {{ t('trainingSimulation.sets') }} · {{ current.reps }} {{ t('trainingSimulation.repsShort') }}
                                </span>

                                <span v-else class="pill ghost">
                                    🎯 {{ t('trainingSimulation.noTargets') }}
                                </span>
                            </div>

                        </div>

                        <BasePopup :show="motiOpen"
                                   :key="motiKey"
                                   overlayClass="sim-moti-bp"
                                   :showClose="false"
                                   :show-actions="false"
                                   @cancel="noop">
                            <div class="sim-moti-pop" :class="{ leaving: motiLeaving }">
                                <div class="sim-moti-title">{{ motiTitle }}</div>
                                <div v-if="motiSub" class="sim-moti-sub">{{ motiSub }}</div>
                            </div>
                        </BasePopup>

                        <!-- Set / Timer -->
                        <div class="sim-actions">
                            <div class="sim-setbox">
                                <div class="sim-set-title">
                                    {{ currentType === 'ausdauer' ? t('trainingSimulation.duration') : (currentType === 'dehnung' ? t('trainingSimulation.hold') : t('trainingSimulation.setProgress')) }}
                                </div>

                                <!-- ✅ Ausdauer: Minuten anzeigen, NICHT als "Sätze" -->
                                <div v-if="currentType === 'ausdauer'" class="sim-sets-empty">
                                    ⏱️ {{ cardioMinutesCurrent }} min
                                    <span v-if="(current.reps ?? 0) > 0"> · {{ current.reps }} km</span>
                                </div>

                                <!-- ✅ Dehnung: Sekunden anzeigen -->
                                <div v-else-if="currentType === 'dehnung'" class="sim-sets-empty">
                                    🧘 {{ current.reps ?? 0 }} s
                                </div>

                                <!-- ✅ Kraft/Calisthenics: normaler Set-Dots Flow -->
                                <div v-else-if="setTotal > 0" class="sim-sets">
                                    <button v-for="i in setTotal"
                                            :key="i"
                                            type="button"
                                            class="sim-set-dot"
                                            :class="{ done: i <= setDone, active: i === activeSetNumber, locked: i > maxUnlockedSet }"
                                            :disabled="i > maxUnlockedSet"
                                            @click="toggleSet(i)">
                                        {{ i }}
                                    </button>
                                </div>

                                <div v-else class="sim-sets-empty">
                                    ({{ t('trainingSimulation.noSets') }})
                                </div>
                            </div>

                            <!-- Rechte Spalte: nur Anchor + Progress (wenn NICHT Pause) -->
                            <div class="sim-rightcol">
                                <div ref="restAnchorEl" class="sim-rest-anchor" aria-hidden="true"></div>

                                <div v-if="!restHasStarted" class="sim-setbox sim-progress-card">
                                    <div class="sim-progress-title">{{ t('trainingSimulation.logProgress') }}</div>
                                    <div class="sim-progress-sub">
                                        {{ t('trainingSimulation.logProgressForBefore') }} <b>{{ current.exercise }}</b> {{ t('trainingSimulation.logProgressForAfter') }}
                                    </div>
                                    <div v-if="currentExerciseGoals.length" class="sim-progress-goal-copy">
                                        {{ t('trainingSimulation.goalInView') }}: <b>{{ currentExerciseGoals[0].currentLabel }}</b> / {{ currentExerciseGoals[0].targetLabel }}
                                    </div>

                                    <button type="button" class="btn primary" @click="openProgressModal()">
                                        {{ t('trainingSimulation.log') }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Pause Overlay: "Mini-Popup" fliegt in die Mitte -->
                        <BasePopup :show="restHasStarted"
                                   :key="restOverlayKey"
                                   :title="t('trainingSimulation.rest.title')"
                                   overlayClass="sim-rest-bp"
                                   :showClose="true"
                                   :show-actions="false"
                                   @cancel="resetRest">
                            <div class="sim-rest-inner">

                                <!-- ✅ Setup-Step (nur 1x pro Übung) -->
                                <template v-if="restSetupOpen">
                                    <div class="sim-rest-title">{{ t('trainingSimulation.rest.setupTitle') }}</div>
                                    <div class="sim-rest-sub sim-rest-setup-sub">
                                        {{ t('trainingSimulation.rest.setupQuestionBefore') }}
                                        <b>{{ current.exercise }}</b>
                                        {{ t('trainingSimulation.rest.setupQuestionAfter') }}
                                    </div>

                                    <div class="sim-timer-btns sim-rest-setup-actions">

                                        <UiPopupSelect :label="t('trainingSimulation.rest.soundLabel')"
                                                       v-model="restDoneSound"
                                                       :options="restDoneSoundOptions" />

                                        <input v-model="restSetupSecText"
                                               type="number"
                                               inputmode="numeric"
                                               min="0"
                                               step="5"
                                               class="sim-rest-input"
                                               :placeholder="t('trainingSimulation.seconds')"
                                               :aria-label="t('trainingSimulation.rest.customSecondsAria')"
                                               @keydown.enter.prevent="confirmRestSetup(true)" />

                                        <button type="button" class="btn primary" @click="confirmRestSetup(true)">
                                            {{ t('trainingSimulation.apply') }}
                                        </button>

                                        <button type="button" class="btn ghost" @click="resetRest()">
                                            {{ t('trainingSimulation.no') }}
                                        </button>
                                    </div>
                                </template>

                                <!-- ✅ Normaler Countdown (wie bisher) -->
                                <template v-else>
                                    <div class="sim-rest-title">{{ restFocusTitle }}</div>

                                    <div class="sim-time sim-rest-time" :class="restTimeClass">
                                        {{ fmt(restLeft) }}
                                    </div>

                                    <div v-if="mottoDisplay" class="sim-motto sim-motto--rest">
                                        “{{ mottoDisplay }}”
                                    </div>

                                    <div class="sim-timer-btns">
                                        <button type="button"
                                                class="btn"
                                                :class="{ primary: !restRunning }"
                                                @click="toggleRest()">
                                            {{ restRunning ? t('trainingSimulation.pause') : (restLeft > 0 ? t('trainingSimulation.continue') : t('trainingSimulation.start')) }}
                                        </button>

                                        <input v-model="restSetText"
                                               type="number"
                                               inputmode="numeric"
                                               min="0"
                                               step="5"
                                               class="sim-rest-input"
                                               :placeholder="t('trainingSimulation.seconds')"
                                               :aria-label="t('trainingSimulation.rest.setSecondsAria')"
                                               @keydown.enter.prevent="applyRestSet()" />

                                        <button type="button" class="btn" @click="applyRestSet()">{{ t('trainingSimulation.apply') }}</button>
                                        <button type="button" class="btn ghost" @click="resetRest()">{{ t('trainingSimulation.reset') }}</button>                                    </div>
                                </template>
                            </div>
                        </BasePopup>


                        <div class="sim-bottom">

                            <PopupActionButton variant="ghost"
                                               :disabled="exIndex === 0"
                                               @click="prevExercise()">
                                ← {{ t('trainingSimulation.back') }}
                            </PopupActionButton>

                            <PopupActionButton @click="completeStep()">
                                {{ primaryCta }}
                            </PopupActionButton>

                            <PopupActionButton variant="ghost"
                                               :disabled="exIndex >= (plan.exercises.length - 1)"
                                               @click="nextExercise()">
                                {{ t('trainingSimulation.next') }} →
                            </PopupActionButton>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </BasePopup>

    <ProgressEntryModal v-model:show="progressOpen"
                        :key="progressModalKey"
                        :unit="unitLocal"
                        :planId="plan?.id ?? null"
                        :exercises="exercisesForModal"
                        :latestBodyWeightDisplay="latestBodyWeightLocal"
                        :prefillExercise="current.exercise"
                        :activeSetNumber="activeSetNumber"
                        :lockSetsBefore="0"
                        :prefillSetValues="prefillSetValuesForCurrent"
                        @save="onProgressSave"
                        @invalid="onProgressInvalid"
                        @cancel="onProgressCancel" />

    <InfoPopup :show="restDonePopupOpen"
               :key="restDonePopupKey"
               :title="t('trainingSimulation.rest.doneTitle')"
               :message="restDoneMessage"
               overlayClass="sim-rest-done-popup"
               :okText="t('trainingSimulation.ok')"
               @ok="onRestDoneOk"
               @cancel="onRestDoneOk" />

    <InfoPopup :show="weightUpgradeHintPopupOpen"
               :key="weightUpgradeHintPopupKey"
               :title="t('trainingSimulation.weightHint.title')"
               :message="weightUpgradeHintMessage"
               overlayClass="sim-rest-done-popup"
               :okText="t('trainingSimulation.understood')"
               @ok="weightUpgradeHintPopupOpen = false"
               @cancel="weightUpgradeHintPopupOpen = false" />

    <TrainingSessionSummary :show="summaryOpen"
                            :meta="summaryMeta"
                            :kpis="summaryKpis"
                            :highlights="summaryHighlights"
                            :perExercise="summaryPerExercise"
                            :showClose="true"
                            @close="onSummaryClose" />

    <TrainingFeedbackForm :show="feedbackOpen"
                          :exercises="summaryPerExercise"
                          :initialFeedback="feedbackInitialData"
                          :reviewMode="feedbackReviewMode"
                          @submit="onFeedbackSubmit"
                          @skip="onFeedbackSkip" />

    <PainFeedbackPopup :show="painFeedbackOpen"
                       @save="onPainFeedbackSave"
                       @skip="onPainFeedbackSkip" />

    <PainZeroConfirmPopup :show="painZeroConfirmOpen"
                          :complaints="painZeroCandidates"
                          @confirmGone="onPainZeroConfirmGone"
                          @keep="onPainZeroKeep" />
</template>


<script setup lang="ts">
    import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
    import { useRoute, useRouter } from "vue-router"
    import BasePopup from "@/components/ui/popups/BasePopup.vue"
    import PopupActionButton from "@/components/ui/buttons/popup/PopupActionButton.vue"
    import UiPopupSelect from "@/components/ui/kits/selects/UiPopupSelect.vue"
    import ProgressEntryModal from "@/components/ui/popups/ProgressEntryModal.vue"
    import InfoPopup from "@/components/ui/popups/InfoPopup.vue"
    import { useWeightStore } from "@/store/weightStore"
    import { useGoalsStore } from "@/store/goalsStore"
    import TrainingSessionSummary from "@/components/ui/training/TrainingSessionSummary.vue"
    import TrainingFeedbackForm from "@/components/ui/popups/feedback/TrainingFeedbackForm.vue"
    import PainFeedbackPopup from "@/components/ui/feedback/PainFeedbackPopup.vue"
    import PainZeroConfirmPopup from "@/components/ui/feedback/PainZeroConfirmPopup.vue"
    import { appendPainDiaryEntry, evaluatePainDiarySignals } from "@/components/ui/feedback/painDiary"
    import { useProgressStore } from "@/store/progressStore"
    import { useComplaintsStore } from "@/store/complaintsStore"
    import type { ComplaintEntry } from "@/types/complaint"
    import { useAuthStore } from "@/store/authStore"
    import { getProfile } from "@/services/profile"
    import { createTrainingSession, upsertTrainingSessionFeedback, type TrainingSessionFeedbackPayload } from "@/services/trainingSessions"
    import { getWeightIncreaseHint } from "@/utils/trainingWeightIncreaseHint"
    import { evaluateTrainingGoals, goalMatchesExerciseName } from "@/utils/goalTracking"
    import type { GoalWeightSample, GoalWorkoutSample, TrainingGoalEvaluation } from "@/types/goals"
    import { LS_OPEN_PLAN_ID, LS_PROGRESS_WEIGHTS, LS_PROGRESS_WORKOUTS } from "@/constants/storageKeys"
    import { useI18n } from '@/composables/useI18n'

    const DEBUG_SIM = true

    const { t } = useI18n()

    function dlog(...a: any[]) {
        if (!DEBUG_SIM) return
        // eslint-disable-next-line no-console
        console.log('[TrainingSimulation]', ...a)
    }

    const progressStore = useProgressStore()
    const complaintsStore = useComplaintsStore()
    const auth = useAuthStore()
    const goalsStore = useGoalsStore()
    const route = useRoute()
    const router = useRouter()
    const isPhonePreviewSimulationDemo = computed(
        () => route.query.preview === 'phone' && route.query.demo === 'simulation'
    )
    const popupOverlayClass = computed(() =>
        isPhonePreviewSimulationDemo.value
            ? ['training-sim-popup', 'training-sim-popup--phone-preview']
            : ['training-sim-popup']
    )

    const mottoLocal = ref('')

    const pendingProgressSaves = ref<any[]>([])
    const localGoalWeightHistory = ref<GoalWeightSample[]>([])
    const localGoalWorkouts = ref<GoalWorkoutSample[]>([])

    function loadGoalTrackingLocalData() {
        try {
            const weights = JSON.parse(localStorage.getItem(LS_PROGRESS_WEIGHTS) || '[]')
            localGoalWeightHistory.value = Array.isArray(weights)
                ? weights.map((entry: any) => ({
                    date: String(entry?.date ?? ''),
                    weight: Number(entry?.weight ?? entry?.weightKg ?? 0),
                })).filter((entry: GoalWeightSample) => entry.date && Number.isFinite(entry.weight) && entry.weight > 0)
                : []
        } catch {
            localGoalWeightHistory.value = []
        }

        try {
            const workouts = JSON.parse(localStorage.getItem(LS_PROGRESS_WORKOUTS) || '[]')
            localGoalWorkouts.value = Array.isArray(workouts)
                ? workouts.map((entry: any) => ({
                    id: entry?.id ?? null,
                    exercise: String(entry?.exercise ?? '').trim(),
                    date: String(entry?.date ?? ''),
                    type: entry?.type ?? 'kraft',
                    weight: Number.isFinite(Number(entry?.weight)) ? Number(entry.weight) : null,
                    sets: Number.isFinite(Number(entry?.sets)) ? Number(entry.sets) : null,
                    reps: Number.isFinite(Number(entry?.reps)) ? Number(entry.reps) : null,
                    setDetails: Array.isArray(entry?.setDetails) ? entry.setDetails : null,
                })).filter((entry: GoalWorkoutSample) => entry.exercise && entry.date)
                : []
        } catch {
            localGoalWorkouts.value = []
        }
    }

    const finalizeTrainingSession = () => {
        const planId = props.plan?.id ?? null

        // ✅ sofort persistieren (synchron, kein await)
        const batch = pendingProgressSaves.value.splice(0)
        for (const p of batch) {
            try { emit("progressSave", p) } catch { }
        }

        // ✅ sync anstoßen, aber UI nicht blockieren
        if (planId) {
            try { void progressStore.load(planId) } catch { }
        }
    }

    const onSummaryClose = () => {
        summaryOpen.value = false
        sessionFinishedAtIso.value = new Date().toISOString()
        syncSessionElapsed()
        sessionDurationSec.value = Math.max(0, Math.floor(sessionElapsedSec.value))

        finalizeTrainingSession()
        feedbackSource.value = followUpTrainingMode.value === 'edit-existing' ? 'followup' : 'normal'
        feedbackOpen.value = true
    }

    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'

    const normalizeExerciseType = (t: unknown): ExerciseType => {
        const n = typeof t === 'number' ? t : Number(String(t ?? '').trim())
        if (Number.isFinite(n)) {
            if (n === 2) return 'dehnung'
            if (n === 3) return 'ausdauer'
            if (n === 1) return 'calisthenics'
            return 'kraft'
        }

        const s = String(t ?? '').toLowerCase().trim()

        if (s === 'ausdauer' || s === 'cardio' || s === 'endurance' || s === 'aerobic' || s.includes('ausdauer')) return 'ausdauer'
        if (s === 'dehnung' || s === 'stretch' || s === 'stretching' || s === 'mobility' || s.includes('dehnung')) return 'dehnung'
        if (s === 'calisthenics' || s === 'bodyweight' || s === 'bw') return 'calisthenics'
        if (s === 'kraft' || s === 'strength' || s === 'weights' || s === 'weight') return 'kraft'

        return 'kraft'
    }

    type RangeCapableValue = number | string

    type RawPlanExercise = {
        exercise: string
        sets: RangeCapableValue
        reps: RangeCapableValue
        goal?: string
        type?: ExerciseType
    }

    type PlanExercise = {
        exercise: string
        sets: number
        reps: number
        goal?: string
        type?: ExerciseType
    }

    const normalizeNum = (v: unknown): number => {
        const text = String(v ?? '').replace(',', '.').trim()
        const rangeMatch = text.match(/^(\d+)\s*-\s*(\d+)$/)
        const n = typeof v === 'number' ? v : Number(rangeMatch?.[1] ?? text)
        return Number.isFinite(n) ? n : 0
    }

    const normalizedExercises = computed<PlanExercise[]>(() => {
        const list: any[] = (props.plan?.exercises as any[]) ?? []

        const isCardioName = (name: string) => {
            const n = (name || '').toLowerCase()
            return ['lauf', 'jogg', 'run', 'treadmill', 'rad', 'fahrrad', 'bike', 'spinning', 'cycling', 'row', 'rudern',
                'ergometer', 'crosstrainer', 'ellip', 'seilspring', 'rope', 'treppen', 'stairs', 'schwimm', 'walk', 'hike']
                .some(k => n.includes(k))
        }
        const isStretchName = (name: string) => {
            const n = (name || '').toLowerCase()
            return ['dehn', 'stretch', 'mobil', 'mobility', 'beweglich', 'yoga', 'faszien', 'smr', 'roll', 'hip opener']
                .some(k => n.includes(k))
        }

        return list.map((ex: any) => {
            const rawType =
                ex?.type ??
                ex?.exerciseType ??
                ex?.trainingType ??
                ex?.workoutType ??
                ex?.category ??
                ex?.kind

            if (DEBUG_SIM) {
                console.log('[SIM][TYPE_RAW]', {
                    name: ex?.exercise,
                    type: ex?.type,
                    exerciseType: ex?.exerciseType,
                    trainingType: ex?.trainingType,
                    workoutType: ex?.workoutType,
                    category: ex?.category,
                    kind: ex?.kind,
                    rawType,
                })
            }

            // ✅ FIX: wenn rawType fehlt/unsicher -> per Name + Felder korrekt infern
            let type = normalizeExerciseType(rawType)
            const name = String(ex?.exercise ?? '').trim()

            if (DEBUG_SIM) {
                console.log('[SIM][TYPE_NORM]', { name: ex?.exercise, rawType, normalized: type })
            }
            const hasCardioFields =
                ex?.durationMin != null || ex?.durationMinutes != null || ex?.timeMin != null ||
                ex?.distanceKm != null || ex?.kilometers != null || ex?.km != null

            const hasStretchFields =
                ex?.durationSec != null || ex?.durationSeconds != null || ex?.timeSec != null || ex?.seconds != null

            // ✅ Korrigiere auch “falsch gelabelte” cardio/stretch Types anhand Name/Felder
            if (type === 'kraft') {
                if (isStretchName(name) || hasStretchFields) type = 'dehnung'
                else if (isCardioName(name) || hasCardioFields) type = 'ausdauer'
            } else if (type === 'dehnung') {
                if ((isCardioName(name) || hasCardioFields) && !hasStretchFields) type = 'ausdauer'
            } else if (type === 'ausdauer') {
                if ((isStretchName(name) || hasStretchFields) && !hasCardioFields) type = 'dehnung'
            }

            let sets = 0
            let reps = 0

            const getCardioMinutes = (ex: any): number => {
                // ✅ ALLES was realistisch "Dauer" heißen kann (Builder/DTO/Legacy)
                const v =
                    ex?.durationMin ??
                    ex?.durationMinutes ??
                    ex?.minutes ??
                    ex?.minute ??
                    ex?.min ??
                    ex?.mins ??
                    ex?.timeMin ??
                    ex?.timeMinutes ??
                    ex?.dauer ??          // deutsch
                    ex?.duration ??       // häufig
                    ex?.time ??           // generic
                    ex?.cardioMinutes ??
                    ex?.targetMinutes ??
                    ex?.meta?.durationMin ??
                    ex?.meta?.minutes ??
                    ex?.settings?.durationMin ??
                    null

                const n = normalizeNum(v)
                return n > 0 ? n : 0
            }

            const getCardioDistanceKm = (ex: any): number => {
                const v =
                    ex?.distanceKm ??
                    ex?.kilometers ??
                    ex?.km ??
                    ex?.distance ??
                    ex?.targetKm ??
                    ex?.meta?.km ??
                    null

                const n = normalizeNum(v)
                return n > 0 ? n : 0
            }

            if (type === 'ausdauer') {
                const minutes = getCardioMinutes(ex)

                // ✅ Nur wenn es WIRKLICH kein Dauer-Feld gibt, fallback auf sets (legacy)
                sets = minutes > 0 ? minutes : normalizeNum(ex?.sets)

                // km sauber
                reps = getCardioDistanceKm(ex) || normalizeNum(ex?.reps)
            } else if (type === 'dehnung') {
                sets = normalizeNum(ex?.sets ?? 1)
                reps = normalizeNum(ex?.reps ?? ex?.seconds ?? ex?.durationSec ?? ex?.durationSeconds ?? ex?.timeSec)
            } else {
                sets = normalizeNum(ex?.sets ?? ex?.setCount ?? ex?.setsCount)
                reps = normalizeNum(ex?.reps ?? ex?.repCount ?? ex?.repsCount)
            }

            return { ...ex, type, sets, reps } as PlanExercise
        })
    })

    const cardioMinutesCurrent = computed(() => {
        if (currentType.value !== 'ausdauer') return 0
        // minutes sind bei Ausdauer bereits in current.sets normalisiert
        return Math.max(0, Number(current.value?.sets ?? 0))
    })

    type ViewPlan = {
        id: string
        name: string
        isFavorite: boolean
        code?: string | null
        exercises: RawPlanExercise[]
        exerciseCount: number
    }

    const props = defineProps<{
        show: boolean
        plan: ViewPlan | null
        followUpMode?: boolean
        followUpSessionId?: string | null
        followUpFeedback?: TrainingSessionFeedbackPayload | null
        followUpHasPainDiaryToday?: boolean

        // ✅ für ProgressEntryModal
        unit?: 'kg' | 'lbs'            // <- optional
        latestBodyWeightDisplay?: number | null
        limitSetsToActive?: boolean
    }>()

    const unitLocal = computed<'kg' | 'lbs'>(() => (props.unit === 'lbs' ? 'lbs' : 'kg'))

    const kgToDisplayLocal = (kg: number) => (unitLocal.value === 'kg' ? kg : (kg / 0.45359237))


    const weightStore = useWeightStore()

    function getLatestWeightKgFromStore(): number | null {
        const s: any = weightStore as any

        const kg =
            s?.latestKg ??
            s?.latestWeightKg ??
            s?.latest?.weight ??
            s?.entries?.[0]?.weight ??
            s?.weightHistory?.[0]?.weight ??
            null

        const n = typeof kg === 'number' ? kg : Number(String(kg ?? '').replace(',', '.').trim())
        return Number.isFinite(n) && n > 0 ? n : null
    }

    function getLatestWeightDisplayFromStore(): number | null {
        const kg = getLatestWeightKgFromStore()
        return kg == null ? null : kgToDisplayLocal(kg)
    }

    type Unit = 'kg' | 'lbs'
    type Workout = any // ProgressEntryModal liefert sein eigenes Workout-Objekt; wir reichen nur durch

    const emit = defineEmits<{
        (e: "close"): void

        // ✅ ProgressEntryModal Events nach oben
        (e: "progressSave", payload: {
            workout: Workout
            updatedBodyWeightKg?: number | null
            mode: 'create' | 'edit'
            editingDate?: string | null
        }): void

        (e: "progressInvalid", errors: string[]): void
        (e: "progressCancel"): void
    }>()

    const emitClose = () => {
        clearStartHype()
        clearProgressOpenTimer()

        pendingStartModal.value = false
        progressOpen.value = false
        pendingProgressSaves.value = []
        weightUpgradeHintPopupOpen.value = false
        feedbackOpen.value = false
        painFeedbackOpen.value = false
        followUpBypass.value = false
        followUpTrainingMode.value = 'new'
        feedbackSource.value = 'normal'
        painSource.value = 'normal'
        followupFeedbackState.value = props.followUpFeedback ?? null
        followupPainDoneState.value = !!props.followUpHasPainDiaryToday
        sessionStartedAtIso.value = null
        sessionFinishedAtIso.value = null
        sessionDurationSec.value = null
        sessionElapsedSec.value = 0
        sessionElapsedBaseSec.value = 0
        sessionTimerRunning.value = false
        sessionTimerResumedAtMs.value = null
        stopSessionElapsedTimer()
        clearSessionTimerBounce()
        // stop timer sauber, damit nix weiter tickt
        restRunning.value = false
        restHasStarted.value = false
        stopInterval()
        restLeft.value = 0
        inSet.value = false

        emit("close")
    }

    const progressOpen = ref(false)

    const selectedSetNumber = ref(1)

    const maxUnlockedSet = computed(() => {
        const total = Math.max(1, setTotal.value || 1)
        return Math.max(1, Math.min(total, setDone.value + 1))
    })

    const activeSetNumber = computed(() => {
        const total = Math.max(1, setTotal.value || 1)
        const sel = Number(selectedSetNumber.value || 1)
        return Math.max(1, Math.min(total, Math.min(sel, maxUnlockedSet.value)))
    })

    const progressModalKey = computed(() => {
        // Remount wenn Übung oder aktiver Satz wechselt
        return `${props.plan?.id ?? 'no-plan'}:${exIndex.value}:${activeSetNumber.value}`
    })

    const summaryOpen = ref(false)
    const feedbackOpen = ref(false)
    const painFeedbackOpen = ref(false)
    const painZeroConfirmOpen = ref(false)
    const painZeroCandidates = ref<ComplaintEntry[]>([])
    const followUpBypass = ref(false)
    const followUpTrainingMode = ref<'new' | 'edit-existing'>('new')
    const feedbackSource = ref<'normal' | 'followup'>('normal')
    const painSource = ref<'normal' | 'followup'>('normal')
    const followupFeedbackState = ref<TrainingSessionFeedbackPayload | null>(props.followUpFeedback ?? null)
    const followupPainDoneState = ref(!!props.followUpHasPainDiaryToday)

    const isFollowUpOnly = computed(() => !!props.followUpMode && !followUpBypass.value)
    const followupPainDoneToday = computed(() => followupPainDoneState.value)
    const popupTitle = computed(() => {
        if (isFollowUpOnly.value) {
            return props.plan?.name
                ? `${t('trainingSimulation.popup.manage')} – ${props.plan.name}`
                : t('trainingSimulation.popup.manage')
        }

        return props.plan?.name
            ? `${t('trainingSimulation.popup.running')} – ${props.plan.name}`
            : t('trainingSimulation.popup.running')
    })
    const followupFeedbackExists = computed(() => {
        const src = followupFeedbackState.value
        if (!src) return false
        return src.intensity != null
            || !!src.bestExercise
            || src.strengthTechnique != null
            || src.cardioIntensity != null
            || src.stretchPain != null
            || !!String(src.note ?? '').trim()
    })
    const followupPainAvailable = computed(() => openComplaintsForPainFeedback().length > 0)
    const feedbackInitialData = computed(() => isFollowUpOnly.value ? (followupFeedbackState.value ?? null) : null)
    const feedbackReviewMode = computed(() => isFollowUpOnly.value && followupFeedbackExists.value)

    const openFollowupFeedback = () => {
        feedbackSource.value = 'followup'
        feedbackOpen.value = true
    }

    const openFollowupPainDiary = () => {
        if (!followupPainAvailable.value) return
        painSource.value = 'followup'
        painFeedbackOpen.value = true
    }

    const onFollowupFeedbackDblClick = () => {
        openFollowupFeedback()
    }

    const onFollowupPainDblClick = () => {
        if (!followupPainAvailable.value) return
        openFollowupPainDiary()
    }

    const openFollowupPlanProgress = async () => {
        const planId = String(props.plan?.id ?? '').trim()
        if (!planId) return

        try {
            localStorage.setItem(LS_OPEN_PLAN_ID, planId)
        } catch {
            // ignore
        }

        emitClose()
        try {
            await router.push({
                path: '/progress',
                query: {
                    tab: 'plans',
                    planId,
                    openPlanProgress: '1',
                },
            })
        } catch {
            // ignore
        }
    }

    const openFollowupTrainingEdit = () => {
        followUpTrainingMode.value = 'edit-existing'
        followUpBypass.value = true
        exIndex.value = 0
        setDone.value = 0
        selectedSetNumber.value = 1
        inSet.value = false
        resetRest()
        nextTick(() => {
            openProgressModalForCurrentSet({ skipMoti: true, delayMs: 0 })
        })
    }

    const startNewTrainingAnyway = () => {
        followUpTrainingMode.value = 'new'
        followUpBypass.value = true
    }

    watch(() => props.followUpFeedback, (next) => {
        followupFeedbackState.value = next ?? null
    })
    watch(() => props.followUpHasPainDiaryToday, (next) => {
        followupPainDoneState.value = !!next
    })


    const sessionStartedAtIso = ref<string | null>(null)
    const sessionFinishedAtIso = ref<string | null>(null)
    const sessionDurationSec = ref<number | null>(null)
    const sessionElapsedSec = ref(0)
    const sessionElapsedBaseSec = ref(0)
    const sessionTimerRunning = ref(false)
    const sessionTimerBounce = ref(false)
    const sessionTimerResumedAtMs = ref<number | null>(null)
    let sessionElapsedTimer: number | null = null
    let sessionTimerBounceTimeout: number | null = null

    const syncSessionElapsed = () => {
        if (!sessionStartedAtIso.value) {
            sessionElapsedSec.value = 0
            return
        }

        if (!sessionTimerRunning.value || sessionTimerResumedAtMs.value == null) {
            sessionElapsedSec.value = Math.max(0, Math.floor(sessionElapsedBaseSec.value))
            return
        }

        const diffSec = Math.floor((Date.now() - sessionTimerResumedAtMs.value) / 1000)
        sessionElapsedSec.value = Math.max(0, Math.floor(sessionElapsedBaseSec.value) + Math.max(0, diffSec))
    }

    const stopSessionElapsedTimer = () => {
        if (sessionElapsedTimer != null) {
            window.clearInterval(sessionElapsedTimer)
            sessionElapsedTimer = null
        }
    }

    const clearSessionTimerBounce = () => {
        if (sessionTimerBounceTimeout != null) {
            window.clearTimeout(sessionTimerBounceTimeout)
            sessionTimerBounceTimeout = null
        }
        sessionTimerBounce.value = false
    }

    const pulseSessionTimer = () => {
        clearSessionTimerBounce()
        sessionTimerBounce.value = true
        sessionTimerBounceTimeout = window.setTimeout(() => {
            sessionTimerBounce.value = false
            sessionTimerBounceTimeout = null
        }, 240)
    }

    const startSessionElapsedTimer = () => {
        stopSessionElapsedTimer()
        syncSessionElapsed()
        sessionElapsedTimer = window.setInterval(() => {
            syncSessionElapsed()
        }, 1000)
    }

    const pauseSessionTimer = () => {
        syncSessionElapsed()
        sessionElapsedBaseSec.value = Math.max(0, Math.floor(sessionElapsedSec.value))
        sessionTimerRunning.value = false
        sessionTimerResumedAtMs.value = null
        stopSessionElapsedTimer()
    }

    const resumeSessionTimer = () => {
        sessionTimerResumedAtMs.value = Date.now()
        sessionTimerRunning.value = true
        startSessionElapsedTimer()
    }

    const toggleSessionTimer = () => {
        pulseSessionTimer()
        if (sessionTimerRunning.value) {
            pauseSessionTimer()
            return
        }
        resumeSessionTimer()
    }

    const sessionElapsedLabel = computed(() => fmtDuration(sessionElapsedSec.value))

    const summaryMeta = computed(() => ({
        planId: props.plan?.id ?? null,
        planName: props.plan?.name ?? null,
        startedAtIso: null,
        finishedAtIso: null,
        durationSec: null,
        unit: unitLocal.value,
    }))

    const summaryKpis = computed(() => ({
        exercisesTotal: props.plan?.exercises?.length ?? 0,
        exercisesDone: exIndex.value + 1,
        setsTotal: null,
        setsLogged: null,
        volumeKg: null,
    }))

    const summaryPerExercise = computed(() => {
        // ✅ WICHTIG: gleiche Normalisierung wie im UI (Name/Felder fixen den Type)
        const list = normalizedExercises.value ?? []

        return list.map(ex => {
            const t = normalizeExerciseType(ex.type)

            return {
                exercise: ex.exercise,
                type: t,

                // bei Ausdauer/Dehnung: 1 “Satz” für die Summary-Logik
                setsTotal: (t === 'ausdauer' || t === 'dehnung') ? 1 : (ex.sets ?? null),

                // Ausdauer hat keine Reps-Zielanzeige
                repsTarget: (t === 'ausdauer') ? null : (ex.reps ?? null),

                // Zeit: Ausdauer = Minuten*60 (du nutzt sets als Minuten), Dehnung = Sekunden (du nutzt reps als Sekunden)
                timeSec: (t === 'ausdauer')
                    ? (Math.max(0, Number(ex.sets ?? 0)) * 60)
                    : (t === 'dehnung' ? Math.max(0, Number(ex.reps ?? 0)) : null),

                volumeKg: null,
                topSetLabel: null,
            }
        })
    })

    const summaryHighlights = computed(() => ([
        t('trainingSimulation.summaryHighlight.consistency'),
        t('trainingSimulation.summaryHighlight.nextStep'),
    ]))

    const sessionTypesPresent = computed(() => {
        const list = summaryPerExercise.value ?? []
        const types = list.map(ex => normalizeExerciseType(ex.type))
        return Array.from(new Set(types))
    })

    const buildTrainingSessionPayload = (feedback: {
        intensity?: number | null
        bestExercise?: string | null
        strengthTechnique?: number | null
        cardioIntensity?: number | null
        stretchPain?: number | null
        note?: string | null
    } | null) => {
        if (!props.plan?.id) return null

        return {
            planId: props.plan.id,
            startedAtUtc: sessionStartedAtIso.value,
            finishedAtUtc: sessionFinishedAtIso.value ?? new Date().toISOString(),
            durationSec: sessionDurationSec.value,
            exercisesTotal: summaryKpis.value.exercisesTotal ?? null,
            exercisesDone: summaryKpis.value.exercisesDone ?? null,
            typesPresent: sessionTypesPresent.value,
            feedback,
        }
    }

    const onFeedbackSubmit = async (payload: {
        intensity: number | null
        bestExercise: string | null
        strengthTechnique: number | null
        cardioIntensity: number | null
        stretchPain: number | null
        note: string
    }) => {
        if (feedbackSource.value === 'followup') {
            followupFeedbackState.value = { ...payload }
            if (auth.user && props.followUpSessionId) {
                try {
                    await upsertTrainingSessionFeedback(props.followUpSessionId, payload)
                } catch (err) {
                    dlog('FOLLOWUP_FEEDBACK_SAVE_FAILED', err)
                }
            }
            feedbackOpen.value = false
            if (!followupPainDoneToday.value && followupPainAvailable.value) {
                painSource.value = 'followup'
                painFeedbackOpen.value = true
                return
            }
            if (isFollowUpOnly.value) return
            emitClose()
            return
        }

        dlog('FEEDBACK_SUBMIT', payload)
        if (auth.user) {
            const dto = buildTrainingSessionPayload(payload)
            if (dto) {
                try {
                    await createTrainingSession(dto)
                } catch (err) {
                    dlog('FEEDBACK_SAVE_FAILED', err)
                }
            }
        }
        feedbackOpen.value = false
        if (await shouldAskPainFeedback()) {
            painFeedbackOpen.value = true
            return
        }
        emitClose()
    }

    const onFeedbackSkip = async () => {
        if (feedbackSource.value === 'followup') {
            feedbackOpen.value = false
            if (!followupPainDoneToday.value && followupPainAvailable.value) {
                painSource.value = 'followup'
                painFeedbackOpen.value = true
                return
            }
            if (isFollowUpOnly.value) return
            emitClose()
            return
        }

        dlog('FEEDBACK_SKIP')
        if (auth.user) {
            const dto = buildTrainingSessionPayload(null)
            if (dto) {
                try {
                    await createTrainingSession(dto)
                } catch (err) {
                    dlog('FEEDBACK_SAVE_FAILED', err)
                }
            }
        }
        feedbackOpen.value = false
        if (await shouldAskPainFeedback()) {
            painFeedbackOpen.value = true
            return
        }
        emitClose()
    }

    const openComplaintsForPainFeedback = () =>
        complaintsStore.entries.filter((entry) => entry.status !== 'weg')

    const shouldAskPainFeedback = async () => {
        try {
            await complaintsStore.load()
        } catch {
            // ignore and continue with in-memory entries
        }
        return openComplaintsForPainFeedback().length > 0
    }

    const onPainFeedbackSave = async (payload: { painLevel: number; note: string }) => {
        const openComplaints = openComplaintsForPainFeedback()
        appendPainDiaryEntry({
            source: 'training-simulation',
            painLevel: payload.painLevel,
            note: payload.note,
            activeComplaints: openComplaints,
        })

        const signals = evaluatePainDiarySignals({
            currentPainLevel: payload.painLevel,
            complaintIds: openComplaints.map((item) => item.id),
        })

        if (signals.improvedVsPrevious) {
            const toBetter = openComplaints.filter((item) => item.status === 'aktiv')
            for (const complaint of toBetter) {
                try {
                    await complaintsStore.updateStatus(complaint.id, 'besser')
                } catch {
                    // ignore and continue
                }
            }
        }

        painZeroCandidates.value = openComplaints.filter((item) => signals.zeroStreakComplaintIds.includes(item.id))
        followupPainDoneState.value = true
        painFeedbackOpen.value = false
        if (painSource.value === 'followup') {
            if (painZeroCandidates.value.length) {
                painZeroConfirmOpen.value = true
                return
            }
            if (isFollowUpOnly.value) return
            emitClose()
            return
        }
        if (painZeroCandidates.value.length) {
            painZeroConfirmOpen.value = true
            return
        }
        emitClose()
    }

    const onPainFeedbackSkip = () => {
        painFeedbackOpen.value = false
        if (painSource.value === 'followup') {
            if (isFollowUpOnly.value) return
            emitClose()
            return
        }
        emitClose()
    }

    const onPainZeroKeep = () => {
        painZeroConfirmOpen.value = false
        painZeroCandidates.value = []
        if (painSource.value === 'followup') {
            if (isFollowUpOnly.value) return
            emitClose()
            return
        }
        emitClose()
    }

    const onPainZeroConfirmGone = async () => {
        const list = [...painZeroCandidates.value]
        for (const complaint of list) {
            try {
                await complaintsStore.updateStatus(complaint.id, 'weg')
            } catch {
                // ignore and continue
            }
        }
        painZeroConfirmOpen.value = false
        painZeroCandidates.value = []
        if (painSource.value === 'followup') {
            if (isFollowUpOnly.value) return
            emitClose()
            return
        }
        emitClose()
    }

    type SetPrefill = { weight?: number | null; reps?: number | null }
    type ExercisePrefillMap = Record<number, SetPrefill> // key = setNumber (1-based)
    type PrefillCache = Record<string, ExercisePrefillMap> // key = planId|exIndex

    const setPrefillCache = ref<PrefillCache>({})

    const prefillKeyForCurrent = computed(() => {
        const pid = props.plan?.id ?? 'no-plan'
        return `${pid}|${exIndex.value}`
    })

    const prefillSetValuesForCurrent = computed<ExercisePrefillMap>(() => {
        return setPrefillCache.value[prefillKeyForCurrent.value] ?? {}
    })


    const latestBodyWeightLocal = ref<number | null>(props.latestBodyWeightDisplay ?? null)

    watch(() => props.latestBodyWeightDisplay, (v) => {
        latestBodyWeightLocal.value = v ?? null
    })

    const syncLatestBodyWeightForModal = () => {
        // Store gewinnt, weil ProgressWeightCard da speichert
        const fromStore = getLatestWeightDisplayFromStore()
        const fromProp = props.latestBodyWeightDisplay ?? null
        latestBodyWeightLocal.value = (fromStore ?? fromProp ?? null)
    }

    const isLoggingSet = ref(false)

    const pendingStartModal = ref(false)

    // TDZ-FIX: watch erst später starten (nachdem motiOpen definiert ist)
    let _motiWatchStarted = false
    const startMotiWatch = () => {
        if (_motiWatchStarted) return
        _motiWatchStarted = true

        watch(() => motiOpen.value, async (open) => {
            if (open) return
            if (!pendingStartModal.value) return

            pendingStartModal.value = false

            // ✅ erst wenn Moti wirklich weg ist -> Modal öffnen
            await nextTick()
            await openProgressModalSafeNow()
        })
    }
    const openProgressModalForCurrentSet = (opts?: { skipMoti?: boolean; delayMs?: number }) => {
        if (!props.plan) return
        if (setTotal.value <= 0) return

        const skipMoti = !!opts?.skipMoti
        const delayMs = Math.max(0, Math.floor(Number(opts?.delayMs ?? 0)))

        // Standard-Verhalten: Satz-Moti zeigen + danach Modal
        const motiMs = MOTI_MS_SET
        const waitMs = skipMoti ? delayMs : motiMs

        if (!skipMoti) {
            showMoti(
                t('trainingSimulation.moti.setNow')
                    .replace('{current}', String(activeSetNumber.value))
                    .replace('{total}', String(setTotal.value)),
                t('trainingSimulation.moti.doIt'),
                motiMs
            )
            pulse([35, 40, 35])
        }

        syncLatestBodyWeightForModal()
        isLoggingSet.value = true

        progressOpen.value = false
        clearProgressOpenTimer()
        progressOpenT = window.setTimeout(() => {
            progressOpen.value = true
        }, waitMs)
    }

    // ADD: First-start safe open (checks happen at execution time, not at click time)
    const openProgressModalAfter = (waitMs: number) => {
        progressOpen.value = false
        clearProgressOpenTimer()

        progressOpenT = window.setTimeout(() => {
            // re-check now (plan + setTotal should be ready now)
            if (!props.plan) return
            if (setTotal.value <= 0) return

            syncLatestBodyWeightForModal()
            isLoggingSet.value = true
            progressOpen.value = true
        }, Math.max(0, Math.floor(waitMs)))
    }

    const openProgressModal = () => {
        openProgressModalForCurrentSet()
    }

    const openProgressModalSafeNow = async () => {
        dlog('openProgressModalSafeNow()', {
            planId: props.plan?.id,
            exIndex: exIndex.value,
            setTotal: setTotal.value,
            setDone: setDone.value,
            inSet: inSet.value,
            motiOpen: motiOpen.value,
            restHasStarted: restHasStarted.value,
        })

        if (!props.plan) { dlog('BLOCK: no plan'); return }
        if (setTotal.value <= 0) { dlog('BLOCK: setTotal <= 0'); return }

        syncLatestBodyWeightForModal()
        isLoggingSet.value = true

        progressOpen.value = false
        await nextTick()

        requestAnimationFrame(() => {
            progressOpen.value = true
            dlog('progressOpen -> true')
        })
    }

    const startRestAfterLoggedSet = () => {
        showMoti(t('trainingSimulation.moti.setLogged'), t('trainingSimulation.moti.restThenPressure'), MOTI_MS_LOGGED)
        setDone.value += 1
        inSet.value = false

        // ✅ wenn noch Sets offen -> Pause starten
        if (setDone.value < setTotal.value) {
            if (openRestSetupIfNeeded()) return

            const base = restCustomSecForExercise.value != null ? restCustomSecForExercise.value : 60
            restLeft.value = Math.max(0, base)

            restHasStarted.value = true
            restRunning.value = true
            startInterval()
            return
        }

        // ✅ letzter Satz -> keine Pause
        restHasStarted.value = false
        restRunning.value = false
        stopInterval()
        restLeft.value = 0
    }

    const maybeShowWeightUpgradeHint = (payload: any) => {
        const setNo = Math.floor(Number(activeSetNumber.value ?? 0))
        const setTotalNow = Math.max(0, Number(setTotal.value ?? 0))
        if (setNo <= 0 || setTotalNow <= 1) return

        const row = payload?.draft?.valuesBySet?.[setNo]
        const hint = getWeightIncreaseHint({
            goal: (current.value as any)?.goal ?? null,
            type: currentType.value,
            targetReps: Number((current.value as any)?.reps ?? 0),
            currentReps: row?.reps ?? null,
            currentWeight: row?.weight ?? null,
            setNo,
            setTotal: setTotalNow,
        })

        if (!hint.shouldSuggest || !hint.message) return
        weightUpgradeHintMessage.value = `${current.value.exercise}: ${hint.message}`
        weightUpgradeHintPopupKey.value += 1
        weightUpgradeHintPopupOpen.value = true
    }

    const onProgressSave = (payload: any) => {
        // Bodyweight wie gehabt
        if (payload?.updatedBodyWeightKg != null && Number.isFinite(Number(payload.updatedBodyWeightKg))) {
            const kg = Number(payload.updatedBodyWeightKg)
            latestBodyWeightLocal.value = kgToDisplayLocal(kg)
        }

        // ✅ NEW: Satz-Prefill cache (kommt aus ProgressEntryModal.draft)
        const draft = payload?.draft
        if (draft?.valuesBySet && typeof draft.valuesBySet === 'object') {
            // valuesBySet: Record<number, { weight?: number|null, reps?: number|null }>
            setPrefillCache.value[prefillKeyForCurrent.value] = {
                ...(setPrefillCache.value[prefillKeyForCurrent.value] ?? {}),
                ...draft.valuesBySet,
            }
        }

        maybeShowWeightUpgradeHint(payload)

        pendingProgressSaves.value.push(payload)

        if (isLoggingSet.value) {
            isLoggingSet.value = false
            startRestAfterLoggedSet()
        }
    }

    const onProgressInvalid = (errors: string[]) => {
        emit("progressInvalid", errors)
    }

    const onProgressCancel = () => {
        isLoggingSet.value = false
        inSet.value = false
        progressOpen.value = false
        emit("progressCancel")
    }

    const restFocusTitle = computed(() => {
        if (!restHasStarted.value) return ""
        if (restLeft.value <= 10) return t('trainingSimulation.rest.focus10')
        if (restLeft.value <= 25) return t('trainingSimulation.rest.focus25')
        if (restLeft.value <= 45) return t('trainingSimulation.rest.focus45')
        return t('trainingSimulation.rest.focusDefault')
    })

    const restFocusSub = computed(() => {
        if (!restHasStarted.value) return ""
        if (restRunning.value) return t('trainingSimulation.rest.subRunning')
        return t('trainingSimulation.rest.subPaused')
    })

    const noop = () => { }

    const applyRestCssVars = (fromX: number, fromY: number) => {
        const root = document.documentElement
        root.style.setProperty('--from-x', `${fromX}px`)
        root.style.setProperty('--from-y', `${fromY}px`)
    }

    const clearRestCssVars = () => {
        const root = document.documentElement
        root.style.removeProperty('--from-x')
        root.style.removeProperty('--from-y')
    }

    const restAnchorEl = ref<HTMLElement | null>(null)
    const restOverlayVars = ref<Record<string, string>>({})
    const restOverlayKey = ref(0)

    const updateRestOverlayVars = () => {
        const anchor = restAnchorEl.value
        if (!anchor) return

        const a = anchor.getBoundingClientRect()

        // ✅ BasePopup teleported -> Animation muss relativ zum Viewport Zentrum sein
        const vcx = window.innerWidth / 2
        const vcy = window.innerHeight / 2

        const ax = a.left + a.width / 2
        const ay = a.top + a.height / 2

        const fromX = ax - vcx
        const fromY = ay - vcy

        applyRestCssVars(fromX, fromY)
    }

    watch(() => restHasStarted.value, async (v) => {
        if (!v) {
            clearRestCssVars()
            return
        }
        await nextTick()
        updateRestOverlayVars()
        restOverlayKey.value += 1
    })

    const exerciseOptions = computed(() => {
        const list = props.plan?.exercises ?? []
        return list.map((ex, idx) => ({
            label: `${ex.exercise}`,
            value: String(idx),
        }))
    })

    const selectedExerciseIdx = computed<string>({
        get: () => String(exIndex.value),
        set: (v) => onSelectExercise(v),
    })

    /* ----------------- Scroll lock (nur Popup scrollt) ----------------- */
    let prevBodyOverflow = ""
    let prevHtmlOverflow = ""
    let prevBodyPaddingRight = ""

    const lockPageScroll = () => {
        prevBodyOverflow = document.body.style.overflow
        prevHtmlOverflow = document.documentElement.style.overflow
        prevBodyPaddingRight = document.body.style.paddingRight

        // optional: verhindert Layout-Jump wenn Scrollbar verschwindet
        const sbw = window.innerWidth - document.documentElement.clientWidth
        if (sbw > 0) document.body.style.paddingRight = `${sbw}px`

        document.body.style.overflow = "hidden"
        document.documentElement.style.overflow = "hidden"
    }

    const unlockPageScroll = () => {
        document.body.style.overflow = prevBodyOverflow
        document.documentElement.style.overflow = prevHtmlOverflow
        document.body.style.paddingRight = prevBodyPaddingRight
    }

    /* ----------------- Exercise flow ----------------- */
    const exIndex = ref(0)
    const setDone = ref(0)

    // ✅ Tabs: "flow" = Training, "progress" = Fortschritt
    const restHasStarted = ref(false)
    const inSet = ref(false)

    const current = computed<PlanExercise>(() => {
        return normalizedExercises.value?.[exIndex.value] ?? { exercise: "—", sets: 0, reps: 0, type: "kraft" }
    })

    const currentType = computed<ExerciseType>(() => normalizeExerciseType(current.value?.type))

    const currentRaw = computed<any>(() => {
        return (props.plan?.exercises as any[])?.[exIndex.value] ?? null
    })

    watch([() => exIndex.value, () => currentType.value], () => {
        if (!DEBUG_SIM) return
        if (currentType.value !== 'ausdauer') return
        // eslint-disable-next-line no-console
        console.log('[SIM][CARDIO_RAW_EX]', currentRaw.value)
    }, { immediate: true })

    watch(() => props.show, async (open) => {
        if (!open) return
        goalsStore.load()
        if (!auth.user) {
            loadGoalTrackingLocalData()
            return
        }
        try {
            await weightStore.loadEntries()
        } catch { }
        if (props.plan?.id) {
            try {
                await progressStore.load(props.plan.id)
            } catch { }
        }
    }, { immediate: true })

    const exercisesForModal = computed(() => {
        const list = props.plan?.exercises ?? []
        const idx = exIndex.value
        const active = Number(activeSetNumber.value ?? 1)

        return list.map((ex, i) => {
            const normalized = {
                ...ex,
                sets: normalizeNum(ex.sets ?? 0),
                reps: normalizeNum(ex.reps ?? 0),
            }

            if (i !== idx) return normalized

            const isTimed = normalizeExerciseType(ex.type) === "ausdauer" || normalizeExerciseType(ex.type) === "dehnung"
            const total = isTimed ? 1 : Math.max(0, normalized.sets)
            if (!total) return normalized

            const capped = Math.max(1, Math.min(total, Number.isFinite(active) ? active : 1))
            return { ...normalized, sets: capped }
        })
    })


    const setTotal = computed(() => {
        // bei Ausdauer/Dehnung: wir treaten es trotzdem als 1 “Satz” für Flow
        if (!current.value) return 0
        if (currentType.value === "ausdauer" || currentType.value === "dehnung") return 1
        return Math.max(0, Number(current.value.sets ?? 0))
    })

    const progressPct = computed(() => {
        const total = props.plan?.exercises?.length ?? 0
        if (!total) return 0
        return Math.round(((exIndex.value) / total) * 100)
    })

    const goalWeightHistory = computed<GoalWeightSample[]>(() =>
        auth.user
            ? (weightStore.entries ?? []).map((entry: any) => ({
                date: String(entry?.date ?? ''),
                weight: Number(entry?.weightKg ?? entry?.weight ?? 0),
            })).filter((entry: GoalWeightSample) => entry.date && Number.isFinite(entry.weight) && entry.weight > 0)
            : localGoalWeightHistory.value
    )

    const goalWorkouts = computed<GoalWorkoutSample[]>(() => {
        if (!auth.user) return localGoalWorkouts.value

        return Object.values(progressStore.byPlan ?? {})
            .flatMap((state: any) => state?.items ?? [])
            .map((entry: any) => ({
                id: entry?.id ?? null,
                exercise: String(entry?.exercise ?? '').trim(),
                date: String(entry?.date ?? ''),
                type: entry?.type ?? 'kraft',
                weight: Number.isFinite(Number(entry?.weightKg)) ? Number(entry.weightKg) : null,
                sets: Number.isFinite(Number(entry?.sets)) ? Number(entry.sets) : null,
                reps: Number.isFinite(Number(entry?.reps)) ? Number(entry.reps) : null,
                setDetails: Array.isArray(entry?.setDetails) ? entry.setDetails : null,
            }))
            .filter((entry: GoalWorkoutSample) => entry.exercise && entry.date)
    })

    const evaluatedGoals = computed<TrainingGoalEvaluation[]>(() =>
        evaluateTrainingGoals(goalsStore.activeGoals, {
            workouts: goalWorkouts.value,
            weights: goalWeightHistory.value,
        })
    )

    const currentExerciseGoals = computed<TrainingGoalEvaluation[]>(() => {
        const name = String(current.value?.exercise ?? '').trim()
        if (!name) return []
        return evaluatedGoals.value.filter(goal =>
            (goal.goal.type === 'exercise_weight' || goal.goal.type === 'exercise_reps')
            && goalMatchesExerciseName(goal.goal, name)
        )
    })

    const isFirstStart = computed(() =>
        exIndex.value === 0 &&
        setDone.value === 0 &&
        !inSet.value &&
        setTotal.value > 0
    )

    const loadMotto = async () => {
        if (!auth.isAuthenticated) {
            mottoLocal.value = ''
            return
        }
        try {
            const profile = await getProfile()
            mottoLocal.value = String(profile?.motto ?? '').trim()
        } catch {
            mottoLocal.value = ''
        }
    }

    watch(
        () => [props.show, auth.user] as const,
        ([open]) => {
            if (!open) return
            void loadMotto()
        },
        { immediate: true }
    )

    const mottoDisplay = computed(() => mottoLocal.value)

    // =====================
    // Motivation Toast (pop-up -> fade out)
    // =====================
    const motiOpen = ref(false)

    startMotiWatch()

    const motiLeaving = ref(false)
    const motiKey = ref(0)
    const motiTitle = ref("")
    const motiSub = ref<string | null>(null)

    let motiT1: number | null = null
    let motiT2: number | null = null

    let progressOpenT: number | null = null

    const clearProgressOpenTimer = () => {
        if (progressOpenT != null) window.clearTimeout(progressOpenT)
        progressOpenT = null
    }

    const clearMotiTimers = () => {
        if (motiT1 != null) window.clearTimeout(motiT1)
        if (motiT2 != null) window.clearTimeout(motiT2)
        motiT1 = null
        motiT2 = null
    }

    const MOTI_MS_DEFAULT = 1800
    const MOTI_MS_SET = 2600
    const MOTI_MS_START = 1600
    const MOTI_MS_EXERCISE = 2400
    const MOTI_MS_LOGGED = 2400
    const MOTI_FADE_MS = 320 // war 220

    const showMoti = (title: string, sub?: string | null, ms = MOTI_MS_DEFAULT, onDone?: (() => void) | null) => {
        clearMotiTimers()

        motiTitle.value = title
        motiSub.value = sub ?? null

        motiLeaving.value = false
        motiOpen.value = false
        motiKey.value += 1

        queueMicrotask(() => {
            motiOpen.value = true

            // später ausblenden (mehr “Standzeit”)
            motiT1 = window.setTimeout(() => {
                motiLeaving.value = true
            }, Math.max(0, ms - MOTI_FADE_MS))

            motiT2 = window.setTimeout(() => {
                motiOpen.value = false
                motiLeaving.value = false

                if (onDone) {
                    queueMicrotask(() => {
                        try { onDone() } catch { }
                    })
                }
            }, ms)
        })
    }

    // optional: vibro für "maximal motivation"
    const pulse = (pattern: number[]) => {
        if (!("vibrate" in navigator)) return
        try { navigator.vibrate(pattern) } catch { }
    }

    const clearStartHype = () => {
        // legacy name, falls du es überall schon callst
        clearMotiTimers()
        motiOpen.value = false
        motiLeaving.value = false
    }

    const triggerStartHype = (onDone?: (() => void) | null) => {
        showMoti(t('trainingSimulation.moti.trainingStart'), t('trainingSimulation.moti.firstSetStatement'),
            MOTI_MS_START, onDone ?? null)
        pulse([40, 40, 60, 40, 90])

        if (restDoneSound.value !== 'none') {
            queueMicrotask(() => playRestDoneSound())
        }
    }

    /* ----------------- Hype lines ----------------- */
    const startHypeActive = computed(() =>
        motiOpen.value && motiTitle.value === t('trainingSimulation.moti.trainingStart')
    )

    const hypeLine = computed(() => {
        if (startHypeActive.value) return t('trainingSimulation.hype.firstSetClean')
        if (restRunning.value) return t('trainingSimulation.hype.restRunning')
        if (setDone.value >= setTotal.value && setTotal.value > 0) return t('trainingSimulation.hype.exerciseDone')
        return isFirstStart.value ? t('trainingSimulation.hype.startQuality') : t('trainingSimulation.hype.nextSetStandard')
    })

    const subLine = computed(() => {
        if (startHypeActive.value) return t('trainingSimulation.hypeSub.noEgoReps')

        const type = currentType.value
        if (type === "ausdauer") return t('trainingSimulation.hypeSub.cardio')
        if (type === "dehnung") return t('trainingSimulation.hypeSub.stretch')
        if (type === "calisthenics") return t('trainingSimulation.hypeSub.calisthenics')
        return t('trainingSimulation.hypeSub.strength')
    })

    const primaryCta = computed(() => {
        if (restRunning.value) return t('trainingSimulation.cta.nextSet')

        if (exIndex.value === 0 && setDone.value === 0 && !inSet.value && setTotal.value > 0) {
            return t('trainingSimulation.cta.startTraining')
        }

        if (setDone.value < setTotal.value) {
            return inSet.value ? t('trainingSimulation.cta.finishSet') : t('trainingSimulation.cta.startSet')
        }

        if (exIndex.value >= ((props.plan?.exercises?.length ?? 1) - 1)) return t('trainingSimulation.cta.finishTraining')
        return t('trainingSimulation.cta.nextExercise')
    })

    /* ----------------- Rest timer ----------------- */
    const restLeft = ref(60)
    const restRunning = ref(false)
    let restIv: number | null = null

    const restDonePopupOpen = ref(false)
    const suppressRestDonePopup = ref(false)
    const restDonePopupKey = ref(0)
    const weightUpgradeHintPopupOpen = ref(false)
    const weightUpgradeHintPopupKey = ref(0)
    const weightUpgradeHintMessage = ref('')

    let restDoneAutoCloseT: number | null = null

    const clearRestDoneAutoClose = () => {
        if (restDoneAutoCloseT != null) window.clearTimeout(restDoneAutoCloseT)
        restDoneAutoCloseT = null
    }

    const restDoneMessage = computed(() => {
        // optional bisschen mehr Hype
        return `${t('trainingSimulation.rest.nextSet')}: ${current.value.exercise}.`
    })

    const onRestDoneOk = () => {
        clearRestDoneAutoClose()
        restDonePopupOpen.value = false
        suppressRestDonePopup.value = false

        showMoti(t('trainingSimulation.moti.restOver'), t('trainingSimulation.moti.nextSetGo'), MOTI_MS_DEFAULT)
        pulse([60, 30, 60])

        inSet.value = true
    }

    const scheduleRestDoneAutoClose = () => {
        clearRestDoneAutoClose()
        restDoneAutoCloseT = window.setTimeout(() => {
            // ✅ falls es noch offen ist -> automatisch schließen
            if (restDonePopupOpen.value) onRestDoneOk()
        }, 4000)
    }

    watch(() => restDonePopupOpen.value, (v) => {
        if (v) scheduleRestDoneAutoClose()
        else clearRestDoneAutoClose()
    })

    const stopInterval = () => {
        if (restIv) window.clearInterval(restIv)
        restIv = null
    }

    const startInterval = () => {
        stopInterval()
        restIv = window.setInterval(() => {
            if (restLeft.value <= 0) {
                restLeft.value = 0
                restRunning.value = false
                restHasStarted.value = false
                stopInterval()

                queueMicrotask(() => {
                    playRestDoneSound()

                    restDonePopupOpen.value = false
                    restDonePopupKey.value += 1
                    restDonePopupOpen.value = true
                })

                return
            }

            restLeft.value -= 1
        }, 1000)
    }

    const toggleRest = () => {
        if (!restRunning.value) {
            // ✅ wenn Setup noch offen -> erst Auswahl treffen
            if (restSetupOpen.value) return

            // ✅ nur 1x pro Übung Setup anzeigen
            if (openRestSetupIfNeeded()) return

            // ansonsten: normal starten mit gespeicherter Zeit
            const base = restCustomSecForExercise.value != null ? restCustomSecForExercise.value : restLeft.value
            restLeft.value = Math.max(0, Math.floor(Number(base || 60)))

            restHasStarted.value = true
            restRunning.value = true
            startInterval()
        } else {
            restRunning.value = false
            stopInterval()
        }
    }

    const resetRest = () => {
        clearStartHype()

        suppressRestDonePopup.value = true
        restDonePopupOpen.value = false

        restHasStarted.value = false
        restRunning.value = false
        restSetupOpen.value = false
        stopInterval()
        restLeft.value = 60
        restSetText.value = ""
        restSetupSecText.value = ""
    }

    const addRest = (sec: number) => {
        restLeft.value = Math.max(0, restLeft.value + sec)
    }

    const restSetText = ref<string>("")


    // ✅ pro Übung genau 1x fragen, ob Custom-Restzeit gewünscht ist
    const restAskedForExercise = ref(false)
    const restCustomSecForExercise = ref<number | null>(null)

    const openRestSetupIfNeeded = () => {
        if (restAskedForExercise.value) return false

        restSetupOpen.value = true
        restHasStarted.value = true
        restRunning.value = false
        stopInterval()

        // Vorschlag in Input (60 oder aktueller Wert)
        restSetupSecText.value = String(restLeft.value || 60)
        return true
    }

    const confirmRestSetup = (useCustom: boolean) => {
        restAskedForExercise.value = true
        restSetupOpen.value = false

        if (!useCustom) {
            restCustomSecForExercise.value = null
            restLeft.value = 60
        } else {
            const sec = Math.floor(Number(restSetupSecText.value))
            const valid = Number.isFinite(sec) && sec >= 0
            restCustomSecForExercise.value = valid ? sec : null
            restLeft.value = valid ? sec : 60
        }

        // direkt starten
        restHasStarted.value = true
        restRunning.value = true
        startInterval()
    }

    const restSetupOpen = ref(false)
    const restSetupSecText = ref<string>("")

    type RestDoneSound = 'none' | 'standard' | 'alarm' | 'beep' | 'dong' | 'decide'

    const restDoneSound = ref<RestDoneSound>('none')

    const restDoneSoundOptions = [
        { label: t('trainingSimulation.sound.none'), value: 'none' },
        { label: t('trainingSimulation.sound.standard'), value: 'standard' },
        { label: t('trainingSimulation.sound.alarm'), value: 'alarm' },
        { label: t('trainingSimulation.sound.beep'), value: 'beep' },
        { label: t('trainingSimulation.sound.dong'), value: 'dong' },
        { label: t('trainingSimulation.sound.decide'), value: 'decide' },
    ]


    const playRestDoneSound = () => {
        if (restDoneSound.value === 'none') return

        const el = document.getElementById(`audio-${restDoneSound.value}`) as HTMLAudioElement | null
        if (!el) return

        try {
            el.currentTime = 0
            el.play()
        } catch { }
    }

    const askCustomRestOnceForExercise = () => {
        if (restAskedForExercise.value) return

        restAskedForExercise.value = true

        const wants = window.confirm(t('trainingSimulation.rest.confirmCustom'))
        if (!wants) {
            restCustomSecForExercise.value = null
            return
        }

        const raw = window.prompt(t('trainingSimulation.rest.promptSeconds'), String(restLeft.value || 60))
        if (raw == null) {
            // abgebrochen -> treat wie "nein"
            restCustomSecForExercise.value = null
            return
        }

        const sec = Math.floor(Number(raw))
        if (!Number.isFinite(sec) || sec < 0) {
            restCustomSecForExercise.value = null
            return
        }

        restCustomSecForExercise.value = sec
    }

    const dangerLevel = computed(() => {
        if (!restHasStarted.value) return 0
        const v = Math.floor(Number(restLeft.value))
        if (!Number.isFinite(v) || v > 10) return 0
        // 10 -> 1, 9 -> 2 ... 1/0 -> 10
        return Math.max(0, Math.min(10, 11 - v))
    })

    const restTimeClass = computed(() => {
        const lvl = dangerLevel.value
        if (lvl <= 0) return ""
        const pulse = restRunning.value && restLeft.value <= 3 ? " danger-pulse" : ""
        return `danger danger-${lvl}${pulse}`
    })

    watch(() => restLeft.value, (v, prev) => {
        if (v === prev) return
        if (!restHasStarted.value || !restRunning.value) return

        const sec = Math.floor(Number(v))
        if (!Number.isFinite(sec)) return
        if (sec > 10) return

        // Handy-Vibration nur wenn supported
        if (!("vibrate" in navigator)) return

        // immer nur kurz "tick"-mäßig, wird epischer je näher 0
        if (sec <= 0) {
            navigator.vibrate([120, 60, 140])
            return
        }

        if (sec <= 1) { navigator.vibrate([80]); return }
        if (sec <= 3) { navigator.vibrate([50]); return }
        navigator.vibrate([25])
    })

    const applyRestSet = () => {
        const sec = Math.floor(Number(restSetText.value))
        if (!Number.isFinite(sec)) return
        restLeft.value = Math.max(0, sec)
    }


    const fmt = (sec: number) => {
        const s = Math.max(0, Math.floor(sec))
        const mm = Math.floor(s / 60)
        const ss = String(s % 60).padStart(2, "0")
        return `${mm}:${ss}`
    }

    const fmtDuration = (sec: number) => {
        const s = Math.max(0, Math.floor(sec))
        const hh = Math.floor(s / 3600)
        const mm = Math.floor((s % 3600) / 60)
        const ss = String(s % 60).padStart(2, "0")

        if (hh > 0) return `${hh}:${String(mm).padStart(2, "0")}:${ss}`
        return `${mm}:${ss}`
    }

    onBeforeUnmount(() => {
        clearRestDoneAutoClose()
        stopInterval()
        stopSessionElapsedTimer()
        clearSessionTimerBounce()
        clearRestCssVars()
        unlockPageScroll()
        clearStartHype()
        clearProgressOpenTimer()

    })

    const toggleSet = (i: number) => {
        if (i > maxUnlockedSet.value) return

        selectedSetNumber.value = i
    }

    const prevExercise = () => {
        if (!props.plan) return
        if (exIndex.value <= 0) return
        exIndex.value -= 1
        setDone.value = 0
        resetRest()
        inSet.value = false
        selectedSetNumber.value = 1
        restAskedForExercise.value = false
        restCustomSecForExercise.value = null
        restSetupOpen.value = false
        restSetupSecText.value = ""
        restDonePopupOpen.value = false
    }

    const nextExercise = () => {
        if (!props.plan) return
        const max = props.plan.exercises.length - 1
        if (exIndex.value >= max) return
        exIndex.value += 1
        setDone.value = 0
        resetRest()
        inSet.value = false
        selectedSetNumber.value = 1
        restAskedForExercise.value = false
        restCustomSecForExercise.value = null
        restSetupOpen.value = false
        restSetupSecText.value = ""
    }

    const onSelectExercise = (rawIdx: string) => {
        if (!props.plan) return
        const idx = Math.floor(Number(rawIdx))
        if (!Number.isFinite(idx)) return

        const max = props.plan.exercises.length - 1
        const clamped = Math.max(0, Math.min(max, idx))

        if (clamped === exIndex.value) return

        exIndex.value = clamped

        showMoti(
            t('trainingSimulation.moti.nextExercise'),
            `${props.plan?.exercises?.[clamped]?.exercise ?? t('trainingSimulation.letsGo')} 🔥`,
            MOTI_MS_EXERCISE
        )

        pulse([30, 30, 30])

        setDone.value = 0
        resetRest()
        inSet.value = false
        restAskedForExercise.value = false
        selectedSetNumber.value = 1
        restCustomSecForExercise.value = null
        restSetupOpen.value = false
        restSetupSecText.value = ""
    }

    const completeStep = () => {
        if (restRunning.value) {
            restRunning.value = false
            restHasStarted.value = false
            stopInterval()
            restLeft.value = 0

            queueMicrotask(() => {
                playRestDoneSound()

                restDonePopupOpen.value = false
                restDonePopupKey.value += 1
                restDonePopupOpen.value = true
            })

            // direkt in den nächsten Satz rein
            inSet.value = true
            return
        }

        // ✅ noch Sätze offen
        if (setDone.value < setTotal.value) {
            if (!inSet.value) {
                const startMs = 1600


                // REPLACE isFirstStart-Branch
                if (isFirstStart.value) {
                    dlog('FIRST START click', {
                        planId: props.plan?.id,
                        exIndex: exIndex.value,
                        setTotal: setTotal.value,
                        setDone: setDone.value,
                        inSet: inSet.value,
                        motiOpen: motiOpen.value,
                    })

                    // keine pending/watch-races mehr
                    pendingStartModal.value = false

                    // Hype anzeigen…
                    triggerStartHype(null)

                    // …und danach hart + stabil öffnen (kills moti overlay inside)
                    openProgressModalAfterStartHype(MOTI_MS_START)

                    inSet.value = true
                    restHasStarted.value = false
                    restRunning.value = false
                    stopInterval()
                    return
                }

                inSet.value = true
                restHasStarted.value = false
                restRunning.value = false
                stopInterval()

                openProgressModalForCurrentSet()
                return
            }

            // falls er nochmal klickt während er "im Satz" ist -> trotzdem Modal
            openProgressModalForCurrentSet()
            return
        }

        // Sätze fertig -> nächste Übung oder Ende
        const max = (props.plan?.exercises?.length ?? 1) - 1
        if (exIndex.value >= max) {
            summaryOpen.value = true
            return
        }
        nextExercise()
    }

    const openProgressModalAfterStartHype = (hypeMs: number) => {
        clearProgressOpenTimer()
        progressOpen.value = false

        progressOpenT = window.setTimeout(async () => {
            // kill moti overlay hard (prevents teleport/focus race)
            clearMotiTimers()
            motiOpen.value = false
            motiLeaving.value = false

            await nextTick()

            if (!props.plan) return
            if (setTotal.value <= 0) return

            syncLatestBodyWeightForModal()
            isLoggingSet.value = true

            // double-tick helps teleport + remount stability
            progressOpen.value = false
            await nextTick()
            requestAnimationFrame(() => {
                progressOpen.value = true
            })
        }, Math.max(0, Math.floor(hypeMs + 80))) // +80ms = moti wirklich weg
    }

    /* ----------------- labels ----------------- */
    const typeLabel = (type?: unknown) => {
        const n = normalizeExerciseType(type)
        if (n === "ausdauer") return t('trainingSummary.type.cardio')
        if (n === "dehnung") return t('trainingSummary.type.stretch')
        if (n === "calisthenics") return t('trainingSummary.type.calisthenics')
        return t('trainingSummary.type.strength')
    }

    watch(() => props.show, (v) => {
        if (v) {
            dlog('Simulation OPEN', {
                planId: props.plan?.id,
                exercises: props.plan?.exercises?.length ?? 0,
            })

            try { void complaintsStore.load() } catch { }

            sessionStartedAtIso.value = new Date().toISOString()
            sessionFinishedAtIso.value = null
            sessionDurationSec.value = null
            sessionElapsedSec.value = 0
            sessionElapsedBaseSec.value = 0
            sessionTimerRunning.value = false
            sessionTimerResumedAtMs.value = null
            resumeSessionTimer()

            lockPageScroll()

            if (!isFollowUpOnly.value) {
                // ✅ MOTI-Toast direkt beim Öffnen
                showMoti(t('trainingSimulation.moti.youAreIn'), t('trainingSimulation.moti.todayWeDeliver'),
                    MOTI_MS_DEFAULT)
                pulse([35, 30, 35])
            }
        } else {
            stopSessionElapsedTimer()
            clearSessionTimerBounce()
            unlockPageScroll()
        }

        // ✅ wenn Simulation zugeht, ProgressModal mit schließen
        if (!v) {
            progressOpen.value = false
            pendingStartModal.value = false
            sessionStartedAtIso.value = null
            sessionFinishedAtIso.value = null
            sessionDurationSec.value = null
            sessionElapsedSec.value = 0
            sessionElapsedBaseSec.value = 0
            sessionTimerRunning.value = false
            sessionTimerResumedAtMs.value = null
            feedbackOpen.value = false
            painFeedbackOpen.value = false
            painZeroConfirmOpen.value = false
            followUpBypass.value = false
            followUpTrainingMode.value = 'new'
            feedbackSource.value = 'normal'
            painSource.value = 'normal'
            return
        }

        clearStartHype()

        exIndex.value = 0
        setDone.value = 0
        resetRest()
        restSetText.value = ""
        inSet.value = false
        restAskedForExercise.value = false
        restCustomSecForExercise.value = null
        restSetupOpen.value = false
        restSetupSecText.value = ""
    })

    watch(() => props.plan?.id, () => {
        clearStartHype()

        exIndex.value = 0
        setDone.value = 0
        resetRest()
        restSetText.value = ""
        inSet.value = false
        restAskedForExercise.value = false
        restCustomSecForExercise.value = null
        restSetupOpen.value = false
        restSetupSecText.value = ""
    })

    watch(
        () => (weightStore as any)?.entries?.[0]?.weight
            ?? (weightStore as any)?.weightHistory?.[0]?.weight
            ?? (weightStore as any)?.latestKg,
        () => {
            const cur = Number(latestBodyWeightLocal.value ?? 0)
            if (!cur || cur <= 0) {
                latestBodyWeightLocal.value = getLatestWeightDisplayFromStore() ?? (props.latestBodyWeightDisplay ?? null)
            }
        }
    )

</script>

<style scoped>
    .sim-followup {
        display: grid;
        gap: .9rem;
        padding: .25rem .15rem .4rem;
    }

    .sim-followup-card {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.12);
        padding: .95rem;
        display: grid;
        gap: .75rem;
    }

    .sim-followup-title {
        font-weight: 900;
        color: var(--text-primary);
        font-size: 1.03rem;
    }

    .sim-followup-text {
        margin: 0;
        color: var(--text-secondary);
    }

    .sim-followup-status {
        display: grid;
        gap: .45rem;
    }

    .sim-followup-row {
        display: flex;
        justify-content: space-between;
        gap: .8rem;
        padding: .5rem .55rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        background: rgba(2, 6, 23, 0.16);
        color: var(--text-secondary);
    }

        .sim-followup-row strong {
            color: var(--text-primary);
        }

        .sim-followup-row.is-disabled .sim-followup-dbl {
            opacity: .75;
            cursor: not-allowed;
        }

    .sim-followup-dbl {
        color: var(--text-primary);
        text-decoration: underline;
        text-decoration-color: rgba(148, 163, 184, 0.5);
        text-underline-offset: 2px;
        cursor: pointer;
    }

    .sim-followup-hint {
        margin: 0;
        color: var(--text-secondary);
        font-size: .88rem;
        line-height: 1.35;
    }

    .sim-goal-hints {
        display: grid;
        gap: 8px;
        margin-top: 10px;
    }

    .sim-goal-hint {
        display: grid;
        gap: 2px;
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(59, 130, 246, 0.16);
    }

        .sim-goal-hint.is-achieved {
            background: rgba(16, 185, 129, 0.12);
            border-color: rgba(16, 185, 129, 0.2);
        }

        .sim-goal-hint.is-needs_attention {
            background: rgba(245, 158, 11, 0.12);
            border-color: rgba(245, 158, 11, 0.22);
        }

    .sim-goal-hint__title {
        font-size: 0.82rem;
        font-weight: 900;
    }

    .sim-goal-hint__meta,
    .sim-goal-hint__copy,
    .sim-progress-goal-copy {
        font-size: 0.78rem;
        opacity: 0.86;
    }

    .sim-progress-goal-copy {
        margin: 8px 0 10px;
    }

    .sim-followup-actions {
        display: grid;
        gap: .55rem;
    }

        .sim-followup-actions > * {
            width: 100%;
        }

    .sim-wrap {
        display: grid;
        gap: 1rem;
        min-height: 0;
        max-height: 65vh;
        /* position: relative;  ❌ nicht mehr nötig, Overlay hängt an .sim-scroll */
    }

    .sim-session-time {
        position: absolute;
        top: .75rem;
        left: .85rem;
        z-index: 3;
        display: inline-flex;
        align-items: center;
        gap: .45rem;
        width: fit-content;
        padding: .3rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.24);
        background: rgba(15, 23, 42, 0.72);
        color: rgba(255, 255, 255, 0.92);
        font-size: .76rem;
        font-weight: 800;
        letter-spacing: .02em;
        backdrop-filter: blur(10px);
        cursor: pointer;
        appearance: none;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
        transition: transform 160ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease, opacity 180ms ease, filter 180ms ease;
    }

        .sim-session-time:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.24);
        }

        .sim-session-time:active,
        .sim-session-time.is-bouncing {
            transform: scale(0.96);
        }

        .sim-session-time:focus-visible {
            outline: 2px solid color-mix(in srgb, var(--accent-primary) 68%, white 32%);
            outline-offset: 2px;
        }

        .sim-session-time.is-running {
            border-color: rgba(96, 165, 250, 0.36);
            background: rgba(15, 23, 42, 0.8);
        }

        .sim-session-time.is-paused {
            background: rgba(15, 23, 42, 0.56);
            border-color: rgba(148, 163, 184, 0.18);
            opacity: 0.84;
            filter: saturate(0.82);
        }

    .sim-session-time__ring {
        width: .72rem;
        height: .72rem;
        border-radius: 999px;
        border: 2px solid rgba(255, 255, 255, 0.28);
        border-top-color: color-mix(in srgb, var(--accent-primary) 72%, white 28%);
        border-right-color: color-mix(in srgb, var(--accent-primary) 58%, white 42%);
        box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.24);
        flex: 0 0 auto;
    }

    .sim-session-time.is-running .sim-session-time__ring {
        animation: sim-session-ring-spin 2.8s linear infinite, sim-session-ring-pulse 1.9s ease-in-out infinite;
    }

    .sim-session-time.is-paused .sim-session-time__ring {
        border-color: rgba(255, 255, 255, 0.18);
        border-top-color: rgba(255, 255, 255, 0.3);
        border-right-color: rgba(255, 255, 255, 0.22);
        box-shadow: none;
    }

    .sim-session-time__value {
        min-width: 2.8rem;
    }

    .sim-session-time__status {
        font-size: .67rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .08em;
        opacity: .78;
        transform: translateY(0);
        transition: opacity 180ms ease, transform 180ms ease, color 180ms ease;
    }

    .sim-session-time.is-running .sim-session-time__status {
        color: rgba(255, 255, 255, 0.92);
    }

    .sim-session-time.is-paused .sim-session-time__status {
        color: rgba(255, 255, 255, 0.74);
        transform: translateY(1px);
    }

    @keyframes sim-session-ring-spin {
        from {
            transform: rotate(0deg);
        }

        to {
            transform: rotate(360deg);
        }
    }

    @keyframes sim-session-ring-pulse {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.16);
        }

        50% {
            box-shadow: 0 0 0 5px rgba(96, 165, 250, 0);
        }
    }

    .sim-empty {
        padding: .75rem .25rem;
        opacity: .9;
        text-align: center;
    }

    .sim-progress-row {
        display: flex;
        justify-content: space-between;
        font-size: .95rem;
        opacity: .9;
        margin-bottom: .5rem;
    }

    .sim-bar {
        height: 10px;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(0,0,0,.10);
    }

    .sim-bar-fill {
        height: 100%;
        border-radius: 999px;
        background: color-mix(in srgb, var(--accent-primary) 70%, white 30%);
    }

    .sim-main {
        display: grid;
        gap: 1rem;
    }

    .sim-ex-head {
        display: grid;
        gap: .95rem; /* vorher .45rem */
        text-align: center;
    }

    .sim-ex-name {
        font-size: 1.55rem;
        font-weight: 900;
        line-height: 1.1;
    }

    .sim-motto {
        margin-top: .35rem;
        font-style: italic;
        color: var(--text-secondary);
        font-weight: 600;
        line-height: 1.3;
        max-width: 46ch;
        justify-self: center;
    }

    .sim-motto--rest {
        margin-top: .6rem;
        margin-bottom: .9rem;
        text-align: center;
    }

    .sim-ex-meta {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: .5rem;
    }

    .pill {
        display: inline-flex;
        align-items: center;
        padding: .22rem .6rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(0,0,0,.10);
        font-size: .92rem;
    }

        .pill.ghost {
            opacity: .9;
        }

    .sim-hype {
        padding: .9rem 1rem;
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: rgba(0,0,0,.10);
        text-align: center;
    }

    .sim-hype-big {
        font-size: 1.05rem;
        font-weight: 800;
    }

    .sim-hype-sub {
        margin-top: .35rem;
        opacity: .88;
    }

    .sim-actions {
        display: grid;
        grid-template-columns: 1fr; /* immer 1 Spalte */
        gap: .9rem;
    }

    .sim-setbox, .sim-timerbox {
        border-radius: 18px;
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: rgba(0,0,0,.10);
        padding: .9rem;
    }

    .sim-set-title, .sim-timer-title {
        font-weight: 800;
        opacity: .95;
        text-align: center;
    }

    .sim-sets {
        margin-top: .7rem;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: .5rem;
    }

    .sim-set-dot {
        min-width: 42px;
        height: 42px;
        padding: 0 .6rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(0,0,0,.12);
        cursor: pointer;
        font-weight: 800;
    }

        .sim-set-dot.done {
            background: color-mix(in srgb, var(--accent-secondary) 32%, rgba(0,0,0,.10));
            border-color: color-mix(in srgb, var(--accent-secondary) 55%, rgba(148,163,184,.22));
        }

    .sim-sets-empty {
        margin-top: .65rem;
        opacity: .85;
        text-align: center;
    }

    .sim-timer {
        margin-top: .65rem;
        display: grid;
        gap: .65rem;
        text-align: center;
    }

    .sim-time {
        font-size: 2.0rem;
        font-weight: 900;
        letter-spacing: .5px;
    }

    .sim-timer-btns {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: .5rem;
    }

    .btn {
        height: 42px;
        padding: 0 .95rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: radial-gradient(circle at 18% 28%, rgba(148,163,184,.10), transparent 62%), radial-gradient(circle at 85% 78%, rgba(99,102,241,.08), transparent 70%), rgba(0,0,0,.10);
        color: var(--text-primary);
        cursor: pointer;
        font-weight: 900;
        font-size: .92rem;
        letter-spacing: -0.01em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .45rem;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255,255,255,0.06);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform 140ms ease, box-shadow 180ms ease, border-color 180ms ease, filter 180ms ease, background 180ms ease, opacity 140ms ease;
    }

        .btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
            filter: saturate(.85);
        }

        .btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 18%, transparent), 0 16px 36px rgba(15, 23, 42, 0.22);
        }

    @media (hover:hover) {
        .btn:not(:disabled):hover {
            transform: translateY(-1px) scale(1.02);
            border-color: rgba(148,163,184,.38);
            box-shadow: 0 18px 44px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(148,163,184,.12), inset 0 1px 0 rgba(255,255,255,0.08);
            filter: brightness(1.04) saturate(1.05);
        }
    }

    .btn:not(:disabled):active {
        transform: translateY(0) scale(1.01);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16), inset 0 1px 0 rgba(255,255,255,0.06);
    }

    /* Primary: “Action” passend zu Accent */
    .btn.primary {
        color: #fff;
        border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(148,163,184,.22));
        background: radial-gradient(circle at 18% 28%, color-mix(in srgb, var(--accent-primary) 35%, transparent), transparent 60%), radial-gradient(circle at 85% 78%, color-mix(in srgb, var(--accent-secondary) 18%, transparent), transparent 70%), linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 46%, rgba(0,0,0,.10)), rgba(0,0,0,.12));
        text-shadow: 0 1px 0 rgba(0,0,0,.18);
    }

    /* Ghost: neutral, aber nicht “blass/kaputt” */
    .btn.ghost {
        opacity: 1;
        border-color: rgba(148, 163, 184, 0.20);
        background: radial-gradient(circle at 18% 28%, rgba(148,163,184,.08), transparent 62%), rgba(255,255,255,0.06);
    }

    @media (hover:hover) {
        .btn.ghost:not(:disabled):hover {
            border-color: rgba(129,140,248,0.28);
            background: rgba(255,255,255,0.08);
        }
    }



    .sim-rest-input {
        height: 42px;
        width: 140px;
        padding: 0 .85rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: radial-gradient(circle at 18% 28%, rgba(148,163,184,.08), transparent 62%), rgba(255,255,255,0.06);
        color: var(--text-primary);
        font-weight: 900;
        font-size: .92rem;
        letter-spacing: -0.01em;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255,255,255,0.06);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        outline: none;
    }

        .sim-rest-input::placeholder {
            opacity: .75;
        }

        .sim-rest-input:focus-visible {
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 18%, transparent), 0 16px 36px rgba(15, 23, 42, 0.18);
        }

        .sim-rest-input::-webkit-outer-spin-button,
        .sim-rest-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

    .sim-bottom {
        display: grid;
        grid-template-columns: 1fr 1.3fr 1fr;
        gap: .75rem;
        /* ✅ immer sichtbar */
        position: sticky;
        bottom: 0;
        z-index: 5;
        /* ✅ damit’s nicht “am Rand klebt” */
        padding: .75rem .25rem calc(.75rem + env(safe-area-inset-bottom));
        margin-top: .25rem;
        /* ✅ optisch passt es zum Popup */
        border-top: 1px solid rgba(148, 163, 184, 0.16);
        background: color-mix(in srgb, rgba(0,0,0,.20) 70%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    @media (max-width: 760px) {
        .sim-bottom {
            grid-template-columns: 1fr;
            gap: .6rem;
            padding: .65rem .15rem calc(.65rem + env(safe-area-inset-bottom));
        }
    }

    .sim-scroll {
        max-height: 65vh;
        overflow: auto;
        min-height: 0;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 0.25rem;
        overscroll-behavior: contain;
        position: relative; /* ✅ Overlay zentriert sich im sichtbaren Bereich */
        min-height: 65vh; /* ✅ Mitte = echte Popup-Mitte, nicht “unten irgendwo” */
    }

    .sim-ex-picker {
        display: grid;
        gap: .35rem;
        justify-items: center;
        width: 100%;
    }

    .sim-tabs {
        display: flex;
        justify-content: center;
        gap: .6rem;
        margin-top: .15rem;
    }

    .sim-tab {
        height: 40px;
        padding: 0 1rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(0,0,0,.10);
        color: var(--text-primary);
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255,255,255,0.06);
        transition: transform 140ms ease, box-shadow 180ms ease, border-color 180ms ease, filter 180ms ease, background 180ms ease;
    }

        .sim-tab.active {
            color: #fff;
            border-color: color-mix(in srgb, var(--accent-primary) 55%, rgba(148,163,184,.22));
            background: linear-gradient(180deg, color-mix(in srgb, var(--accent-primary) 46%, rgba(0,0,0,.10)), rgba(0,0,0,.12));
        }

    @media (hover:hover) {
        .sim-tab:hover {
            transform: translateY(-1px) scale(1.02);
            border-color: rgba(148,163,184,.38);
            box-shadow: 0 16px 36px rgba(15, 23, 42, 0.20), inset 0 1px 0 rgba(255,255,255,0.08);
            filter: brightness(1.04) saturate(1.05);
        }
    }

    .sim-progress-tab {
        display: grid;
        gap: .9rem;
    }

    .sim-progress-card {
        height: 100%;
        padding: .9rem; /* exakt wie sim-setbox */
        display: flex;
        flex-direction: column;
        gap: .65rem;
        text-align: center;
        justify-content: space-between; /* Button nach unten */
    }

    .sim-progress-title {
        font-weight: 900;
    }

    .sim-progress-sub {
        opacity: .9;
    }

    .sim-rest-focus {
        grid-column: 1 / -1; /* über beide Spalten */
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 220px;
    }

    .sim-rest-focus-card {
        width: min(520px, 100%);
        border-radius: 22px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        padding: 1.05rem 1.05rem 1rem;
        text-align: center;
        background: radial-gradient(circle at 18% 28%, color-mix(in srgb, var(--accent-primary) 22%, transparent), transparent 60%), radial-gradient(circle at 85% 78%, color-mix(in srgb, var(--accent-secondary) 18%, transparent), transparent 70%), rgba(0,0,0,.12);
        box-shadow: 0 22px 60px rgba(15, 23, 42, 0.30), 0 0 0 1px rgba(148,163,184,.10), inset 0 1px 0 rgba(255,255,255,0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        animation: restPop 220ms cubic-bezier(0.16,1,0.3,1) both, restFloat 2.4s ease-in-out 240ms infinite;
    }

    .sim-rest-kicker {
        font-weight: 900;
        opacity: .92;
        letter-spacing: -0.01em;
    }

    .sim-rest-title {
        margin-top: .35rem;
        font-size: 1.15rem;
        font-weight: 1000;
        line-height: 1.15;
    }

    .sim-rest-time {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        text-align: center;
    }

        /* === EPIC LAST 10 SECONDS === */
        .sim-rest-time.danger {
            transition: color 160ms ease, text-shadow 160ms ease, transform 160ms ease, filter 160ms ease;
        }

        /* von "leicht rot" -> "KRITISCH ROT" */
        .sim-rest-time.danger-1 {
            color: #ffb3b3;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 10px rgba(255, 60, 60, .18);
        }

        .sim-rest-time.danger-2 {
            color: #ff9c9c;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 12px rgba(255, 60, 60, .22);
        }

        .sim-rest-time.danger-3 {
            color: #ff8080;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 14px rgba(255, 60, 60, .26);
        }

        .sim-rest-time.danger-4 {
            color: #ff6666;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 16px rgba(255, 40, 40, .32);
        }

        .sim-rest-time.danger-5 {
            color: #ff4d4d;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 18px rgba(255, 30, 30, .38);
        }

        .sim-rest-time.danger-6 {
            color: #ff3a3a;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 20px rgba(255, 20, 20, .44);
        }

        .sim-rest-time.danger-7 {
            color: #ff2b2b;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 24px rgba(255, 10, 10, .52);
        }

        .sim-rest-time.danger-8 {
            color: #ff2020;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 28px rgba(255, 0, 0, .58);
        }

        .sim-rest-time.danger-9 {
            color: #ff1717;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 34px rgba(255, 0, 0, .66);
        }

        .sim-rest-time.danger-10 {
            color: #ff1010;
            text-shadow: 0 10px 28px rgba(0,0,0,.30), 0 0 42px rgba(255, 0, 0, .78);
            filter: saturate(1.15);
        }

    /* bei 3..0 Sekunden: richtig "holy sh*t" Pulse */
    @keyframes dangerBeat {
        0%, 100% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.04);
        }
    }

    .sim-rest-time.danger-pulse {
        animation: restPulse 900ms ease-in-out infinite, dangerBeat 420ms ease-in-out infinite;
    }


    /* mehr Luft zwischen Text ("Schultern locker...") und Buttons */
    .sim-rest-sub {
        margin-top: .55rem;
        margin-bottom: .85rem;
    }

    /* Animationen */
    @keyframes restPop {
        from {
            opacity: 0;
            transform: translateY(10px) scale(.96);
            filter: blur(2px);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }

    @keyframes restFloat {
        0%, 100% {
            transform: translateY(0);
        }

        50% {
            transform: translateY(-3px);
        }
    }

    @keyframes restPulse {
        0%, 100% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.02);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .sim-rest-focus-card,
        .sim-rest-time {
            animation: none !important;
        }
    }

    .sim-rightcol {
        display: grid;
        gap: .9rem;
    }

    /* Anchor sitzt da, wo die rechte Card normalerweise ist */
    .sim-rest-anchor {
        height: 0;
    }

    .sim-rest-inner {
        will-change: transform;
        backface-visibility: hidden;
        animation: restJiggle 220ms ease 520ms both;
    }

    .sim-rest-kicker {
        font-weight: 1000;
        opacity: .92;
        letter-spacing: -0.01em;
    }

    .sim-rest-title {
        margin-top: .35rem;
        font-size: 1.15rem;
        font-weight: 1000;
        line-height: 1.15;
    }

    .sim-rest-time {
        margin-top: .55rem;
        font-size: 2.45rem;
        letter-spacing: 1px;
        text-shadow: 0 10px 28px rgba(0,0,0,.30);
        animation: restPulse 900ms ease-in-out infinite;
    }

    .sim-rest-sub {
        margin-top: .35rem;
        opacity: .9;
    }

    @keyframes restFlyToCenter {
        0% {
            opacity: 0.85;
            transform: translate3d(calc(-50% + var(--from-x, 0px)), calc(-50% + var(--from-y, 0px)), 0) scale(.94) rotate(3deg);
        }

        60% {
            opacity: 1;
            transform: translate3d(-50%, -50%, 0) scale(1.03) rotate(-0.6deg);
        }

        100% {
            opacity: 1;
            transform: translate3d(-50%, -50%, 0) scale(1) rotate(0deg);
        }
    }

    @keyframes restJiggle {
        0% {
            transform: scale(1) rotate(0deg);
        }

        40% {
            transform: scale(1.01) rotate(-0.6deg);
        }

        80% {
            transform: scale(1) rotate(0.4deg);
        }

        100% {
            transform: scale(1) rotate(0deg);
        }
    }

    @keyframes restPulse {
        0%, 100% {
            transform: scale(1);
        }

        50% {
            transform: scale(1.02);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .sim-rest-time {
            animation: none !important;
        }
    }

    /* === BasePopup Instanz für Rest === */
    :global(.popup-overlay.sim-rest-bp) {
        /* wie BasePopup, aber etwas “fokussierter” */
        background: rgba(2, 6, 23, 0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
    }

    /* Wir animieren die echte .popup Card */
    :global(.popup-overlay.sim-rest-bp .popup) {
        position: absolute;
        left: 50%;
        top: 50%;
        will-change: transform, opacity;
        backface-visibility: hidden;
        transform: translate3d(-50%, -50%, 0);
        animation: restFlyToCenter 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    /* Jiggle nur innen, damit die Card nicht “matschig” wird */
    .sim-rest-inner {
        will-change: transform;
        backface-visibility: hidden;
        animation: restJiggle 220ms ease 520ms both;
    }

    /* Content bisschen nicer */
    .sim-rest-title {
        text-align: center;
        font-weight: 1000;
        margin-top: .15rem;
    }

    .sim-rest-sub {
        text-align: center;
        opacity: .9;
    }

    .sim-rest-setup-sub {
        margin-top: .35rem;
        margin-bottom: .85rem;
    }

    .sim-rest-setup-actions {
        gap: .55rem;
    }

    @media (max-width: 525px) {
        .sim-timer-btns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
        }

            .sim-timer-btns .sim-rest-input {
                grid-column: 2 / 3;
                grid-row: 1;
                width: 100%;
            }

            .sim-timer-btns .btn {
                width: 100%;
            }

                .sim-timer-btns .btn:first-of-type {
                    grid-column: 1 / 2;
                    grid-row: 1;
                }

                .sim-timer-btns .btn:nth-of-type(2) {
                    grid-column: 1 / 2;
                    grid-row: 2;
                }

                .sim-timer-btns .btn:nth-of-type(3) {
                    grid-column: 2 / 3;
                    grid-row: 2;
                }
    }

    @media (max-width: 435px) {
        .sim-timer-btns {
            grid-template-columns: 1fr 1fr;
        }

            .sim-timer-btns .sim-rest-input {
                grid-column: 2 / 3;
                grid-row: 1;
            }

            .sim-timer-btns .btn:first-of-type {
                grid-column: 1 / 2;
                grid-row: 1;
            }

            .sim-timer-btns .btn:nth-of-type(2) {
                grid-column: 1 / 2;
                grid-row: 2;
            }

            .sim-timer-btns .btn:nth-of-type(3) {
                grid-column: 2 / 3;
                grid-row: 2;
            }
    }

    :global(.popup-overlay.sim-rest-done-popup) {
        background: rgba(2, 6, 23, 0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
    }

    /* ===== ALLE Popups auf gleichen Z-Index ===== */
    :global(.popup-overlay.training-sim-popup),
    :global(.popup-overlay.sim-rest-bp),
    :global(.popup-overlay.sim-rest-done-popup),
    :global(.popup-overlay.sim-rest-done-popup .popup) {
        z-index: 11000;
    }

    :global(.fade-enter-active.popup-overlay.training-sim-popup--phone-preview),
    :global(.fade-leave-active.popup-overlay.training-sim-popup--phone-preview) {
        transition: none !important;
    }

    :global(.popup-overlay.training-sim-popup--phone-preview .popup) {
        animation: none !important;
        transition: none !important;
        transform: none !important;
    }

    /* =========================
    Motivation Popup (BasePopup) -> zentriert auf Trainings-Popup
    ========================= */
    :global(.popup-overlay.sim-moti-bp) {
        background: transparent; /* kein extra dim */
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        z-index: 11000;
        pointer-events: none; /* blockt nicht den Rest */
    }

    :global(.popup-overlay.sim-moti-bp .popup) {
        position: fixed;
        left: 50vw;
        top: 50vh;
        transform: translate3d(-50%, -50%, 0);
        width: min(560px, 96%);
        pointer-events: auto;
        animation: motiPop 220ms cubic-bezier(0.16,1,0.3,1) both;
    }

    /* Content */
    .sim-moti-pop {
        text-align: center;
        padding: .15rem .1rem;
    }

        .sim-moti-pop.leaving {
            animation: motiOut 320ms ease both;
        }

    @keyframes motiOut {
        from {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        to {
            opacity: 0;
            transform: translateY(-8px) scale(.98);
        }
    }

    .sim-set-dot.locked {
        opacity: .45;
        cursor: not-allowed;
    }

    .sim-set-dot.active {
        outline: 2px solid color-mix(in srgb, var(--accent-primary) 55%, transparent);
        outline-offset: 2px;
    }
</style>
