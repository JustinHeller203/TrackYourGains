 <!-- Training.vue -->
<template>
    <div class="training">
        <h2 class="page-title">{{ t('training.pageTitle') }}</h2>
        <!-- Trainingsplan Formular -->
        <div ref="builderSection"
             class="builder-shell"
             :class="{ 'builder-shell--edit-morphing': builderPlanMorph.visible }">
            <TrainingPlanBuilder ref="builderRef"
                                 :openEditPopup="openEditPopup"
                                 :addToast="addToast"
                                 :openValidationPopup="openValidationPopup"
                                 :openDeletePopup="openDeletePopup"
                                 :onGuestPlanCreated="onGuestPlanCreated"
                                 v-model:customExercises="customExercises"
                                 :saveToStorage="saveToStorage"
                                 @plan-created="onPlanCreated"
                                 @plan-updated-with-exercise-changes="onPlanUpdatedWithExerciseChanges" />

            <Transition name="builder-edit-morph">
                <div v-if="builderPlanMorph.visible"
                     :key="`builder-plan-morph-${builderPlanMorph.seq}`"
                     class="builder-edit-morph"
                     :style="builderPlanMorphStyle"
                     aria-hidden="true">
                    <div class="builder-edit-morph__beam"></div>

                    <div class="builder-edit-morph__card builder-edit-morph__card--old">
                        <span class="builder-edit-morph__eyebrow">{{ t('training.builderMorph.oldPlan') }}</span>
                        <strong class="builder-edit-morph__title">{{ builderPlanMorph.oldName }}</strong>
                        <span class="builder-edit-morph__meta">{{ exerciseCountLabel(builderPlanMorph.beforeCount) }}</span>
                        <span class="builder-edit-morph__tear builder-edit-morph__tear--one"></span>
                        <span class="builder-edit-morph__tear builder-edit-morph__tear--two"></span>
                        <span class="builder-edit-morph__tear builder-edit-morph__tear--three"></span>
                    </div>

                    <div class="builder-edit-morph__card builder-edit-morph__card--new">
                        <span class="builder-edit-morph__eyebrow builder-edit-morph__eyebrow--new">{{ t('training.builderMorph.remade') }}</span>
                        <strong class="builder-edit-morph__title">{{ builderPlanMorph.newName }}</strong>
                        <span class="builder-edit-morph__meta">{{ exerciseCountLabel(builderPlanMorph.afterCount) }}</span>
                    </div>
                </div>
            </Transition>
        </div>

        <div v-if="builderActionLabel.visible"
             :key="`builder-action-${builderActionLabel.seq}`"
             class="builder-action-label"
             aria-hidden="true">
            <span class="builder-action-label__spark builder-action-label__spark--left"></span>
            <span class="builder-action-label__spark builder-action-label__spark--right"></span>
            <span class="builder-action-label__kicker">{{ t('training.builderAction.active') }}</span>
            <strong class="builder-action-label__main">{{ builderActionLabel.label }}</strong>
            <span class="builder-action-label__sub">{{ t('training.builderAction.sub') }}</span>
        </div>

        <TrainingPlansList ref="plansListRef"
                           :guestPlans="guestPlans"
                           :customExercises="customExercises"
                           :onRemoveCustomExercise="removeCustomExercise"
                           :onGuestDeletePlan="onGuestDeletePlan"
                           :onGuestEditPlan="onGuestEditPlan"
                           :onGuestPlanCreated="onGuestPlanCreated"
                           :onEditInBuilder="onEditPlanInBuilder"
                           :selectedPlanOverride="selectedPlan"
                           :renameEffect="planRenameEffect"
                           :onSelectedPlanChange="onSelectedPlanChange"
                           :openEditPopup="openEditPopup"
                           :openDeletePopup="openDeletePopup"
                           :openDownloadPopup="openDownloadPopup"
                           :addToast="addToast"
                           :planTutActive="planTutActive"
                           :planTutPlanId="planTutPlanId"
                           @planTutDone="closePlanTut" />

        <TrainingPlanner :apiPlans="trainingPlansStore.items"
                         :guestPlans="guestPlans" />

        <!-- Satzpausen-Timer -->
        <TimerComponent :dragDelay="dragDelay"
                        :startTimer="startTimerSafe"
                        :stopTimer="stopTimerSafe"
                        :resetTimer="resetTimerSafe"
                        :openEditPopup="openEditPopup"
                        :addToast="addToast"
                        :dismissToast="dismissToast" />

        <!-- Übungs-Stoppuhr -->
        <StopwatchComponent :dragDelay="dragDelay"
                            :addToast="addToast"
                            :stickyEnabled="stickyStopwatchEnabled"
                            @validation="openValidationPopup" />

        <!-- Pop-up für Bearbeitung -->
        <EditPopup v-model="showEditPopup"
                   :key="`${editType}-${editIndex}-${editCellIndex}`"
                   :title="editPopupTitle"
                   :input-type="editInputType"
                   :placeholder="editPlaceholder"
                   :value="editValue"
                   :options="editOptions"
                   @save="onEditPopupSave" />

        <!-- Pop-up für Löschbestätigung -->
        <DeleteConfirmPopup :show="showDeletePopup"
                            @confirm="confirmDeleteAction"
                            @cancel="closeDeletePopup" />

        <!-- Pop-up für Download -->
        <ExportPopup :show="showDownloadPopup"
                     v-model="downloadFormat"
                     :shareLines="downloadShareLines ?? undefined"
                     :shareText="downloadShareText ?? undefined"
                     :shareUrl="downloadShareUrl ?? undefined"
                     @confirm="confirmExport"
                     @cancel="closeDownloadPopup" />

        <!-- Pop-up für Validierungsfehler -->
        <ValidationPopup :show="showValidationPopup"
                         :errors="validationErrorMessages"
                         @close="closeValidationPopup" />


        <!-- Toast-Benachrichtigungen -->
        <Toast v-if="toast"
               :toast="toast"
               :dismissible="true"
               :autoDismiss="true"
               :position="toastPosition"
               @dismiss="onToastDismiss" />

        <PlanBuilderTutorial
            v-if="route.query?.preview !== 'phone'"
            :isActive="showPlanBuilderTut"
            :steps="planBuilderSteps"
            @done="showPlanBuilderTut = false" />
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, watch, onMounted, onUnmounted, withDefaults } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { exportTrainingPlan } from '@/services/export/trainingPlanExport'
    import Toast from '@/components/ui/Toast.vue'
    import EditPopup from '@/components/ui/popups/EditPopup.vue'
    import ExportPopup from '@/components/ui/popups/ExportPopup.vue'
    import PlanBuilderTutorial from '@/components/ui/TygTutorials/PlanBuilderTutorial.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import TimerComponent from '@/components/ui/training/TimerComponent.vue'
    import StopwatchComponent from '@/components/ui/training/StopwatchComponent.vue'

    import TrainingPlanBuilder from '@/components/ui/training/TrainingPlanBuilder.vue'
    import TrainingPlansList from '@/components/ui/training/TrainingPlansList.vue'
    import TrainingPlanner from '@/components/ui/training/TrainingPlanner.vue'
    import { useWeightStore } from "@/store/weightStore"

    import { useTrainingPlansStore } from "@/store/trainingPlansStore";
    import { useAuthStore } from '@/store/authStore';
    import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "@/types/trainingPlan";
    import type { TimerInstance } from '@/types/training';
    import {
        LS_AUTH_TOKEN,
        LS_CONFIRM_DELETE_ENABLED,
        LS_TRAINING_FOCUS_ID,
        LS_TRAINING_FOCUS_TYPE,
        LS_TRAINING_OPEN_PLAN_ID,
        LS_STICKY_TIMER_ENABLED,
        LS_STICKY_STOPWATCH_ENABLED,
    } from '@/constants/storageKeys'
    import { useSettingsStore } from '@/store/settingsStore'
    import { useTimersStore } from '@/store/timersStore'
    import { useStopwatchesStore } from '@/store/stopwatchesStore'
    import { useI18n } from '@/composables/useI18n'
    import { translateText } from '@/i18n/translations'

    // Typ-Definitionen (bleiben unverändert)
    type RangeCapableValue = number | string;

    interface PlanExercise {
        exercise: string;
        sets: RangeCapableValue;
        reps: RangeCapableValue;
        goal?: string;
        type?: 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung';
    }

    interface BuilderPlanMorphPayload {
        planId: string
        oldName: string
        newName: string
        beforeExercises: PlanExercise[]
        afterExercises: PlanExercise[]
    }

    type ViewPlan = {
        id: string;
        name: string;
        isFavorite: boolean;
        code?: string | null;
        exercises: PlanExercise[];
        exerciseCount: number;
    };

    type TrainingPlan = ViewPlan;

    type ToastType =
        | 'toast-default'
        | 'toast-save'
        | 'toast-add'
        | 'toast-delete'
        | 'toast-timer'
        | 'toast-reset'

    interface AppToast {
        id: number
        message: string
        emoji: string
        type: ToastType
        exiting: boolean
        createdAtMs: number
        durationMs?: number
    }

    const props = withDefaults(defineProps<{
        timers?: TimerInstance[]
        startTimer: (timer: TimerInstance) => void
        stopTimer: (timer: TimerInstance) => void
        resetTimer: (timer: TimerInstance) => void
        removeTimer?: (id: string) => void
        stopwatches?: any[]
    }>(), {
        timers: () => [],
        stopwatches: () => [],
        startTimer: (_: TimerInstance) => { },
        stopTimer: (_: TimerInstance) => { },
        resetTimer: (_: TimerInstance) => { },
    })

    const emit = defineEmits<{
        (e: 'remove-timer', id: string): void;
        (e: 'add-timer', timer: TimerInstance): void;
        (e: 'reorder-timers', list: TimerInstance[]): void;
        (e: 'reorder-stopwatches', list: any[]): void;
    }>();

    const { locale, t } = useI18n()
    const translateUiText = (text: string) => translateText(text, locale.value)
    const exerciseCountLabel = (count: number) =>
        t(count === 1 ? 'builder.preview.exerciseCountOne' : 'builder.preview.exerciseCountOther').replace('{count}', String(count))

    const dismissToast = (immediate = false) => {
        if (!toast.value) return;
        clearToastTimer();

        if (immediate) {
            toast.value = null;
            autoDismissRemainingMs = 0;
            return;
        }

        toast.value.exiting = true;
        setTimeout(() => {
            toast.value = null;
            autoDismissRemainingMs = 0;
        }, 300);
    };
    const toastPosition = ref<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')

    function onToastDismiss(id: number) {
        if (toast.value?.id === id) {
            toast.value = null
        }
    }
    const builderRef = ref<InstanceType<typeof TrainingPlanBuilder> | null>(null)
    const plansListRef = ref<InstanceType<typeof TrainingPlansList> | null>(null)
    const builderActionLabel = ref<{ visible: boolean; label: string; seq: number }>({ visible: false, label: '', seq: 0 })
    const builderPlanMorph = ref<{
        visible: boolean
        seq: number
        oldName: string
        newName: string
        beforeCount: number
        afterCount: number
        anchorX: number
        anchorY: number
    }>({
        visible: false,
        seq: 0,
        oldName: '',
        newName: '',
        beforeCount: 0,
        afterCount: 0,
        anchorX: 0,
        anchorY: 0,
    })
    let builderActionTimer: ReturnType<typeof setTimeout> | null = null
    let builderPlanMorphTimer: ReturnType<typeof setTimeout> | null = null

    const triggerBuilderActionLabel = (label: string) => {
        if (builderActionTimer) clearTimeout(builderActionTimer)
        builderActionLabel.value = {
            visible: true,
            label,
            seq: builderActionLabel.value.seq + 1,
        }
        builderActionTimer = setTimeout(() => {
            builderActionLabel.value = {
                visible: false,
                label: '',
                seq: builderActionLabel.value.seq,
            }
            builderActionTimer = null
        }, 3900)
    }

    const builderPlanMorphStyle = computed(() => ({
        '--builder-morph-anchor-x': `${builderPlanMorph.value.anchorX || 50}%`,
        '--builder-morph-anchor-y': `${builderPlanMorph.value.anchorY || 78}%`,
    }))

    const triggerBuilderPlanMorph = (payload: BuilderPlanMorphPayload) => {
        if (builderPlanMorphTimer) clearTimeout(builderPlanMorphTimer)
        const shell = builderSection.value
        const submitButton = shell?.querySelector('.plan-submit-btn') as HTMLElement | null
        const shellRect = shell?.getBoundingClientRect()
        const buttonRect = submitButton?.getBoundingClientRect()
        const anchorX = shellRect && buttonRect
            ? ((buttonRect.left + buttonRect.width / 2 - shellRect.left) / shellRect.width) * 100
            : 50
        const anchorY = shellRect && buttonRect
            ? ((buttonRect.top + buttonRect.height / 2 - shellRect.top) / shellRect.height) * 100
            : 78
        builderPlanMorph.value = {
            visible: true,
            seq: builderPlanMorph.value.seq + 1,
            oldName: payload.oldName,
            newName: payload.newName,
            beforeCount: payload.beforeExercises.length,
            afterCount: payload.afterExercises.length,
            anchorX,
            anchorY,
        }
        builderPlanMorphTimer = setTimeout(() => {
            builderPlanMorph.value = {
                visible: false,
                seq: builderPlanMorph.value.seq,
                oldName: '',
                newName: '',
                beforeCount: 0,
                afterCount: 0,
                anchorX: 0,
                anchorY: 0,
            }
            builderPlanMorphTimer = null
        }, 2250)
    }

    function canUseLocalStorage(): boolean {
        // SSR / Tests / Privacy Mode guard
        if (typeof window === 'undefined') return false

        try {
            const k = '__ls_test__'
            window.localStorage.setItem(k, '1')
            window.localStorage.removeItem(k)
            return true
        } catch {
            return false
        }
    }
    const onEditPlanInBuilder = (payload: { planId: string; name: string; exercises: any[] }) => {
        const b = builderRef.value as any
        b?.setEditMode?.({ planId: payload.planId, name: payload.name, exercises: payload.exercises })
        triggerBuilderActionLabel(t('common.edit'))
        b?.scrollToBuilder?.()
    }

    const onPlanUpdatedWithExerciseChanges = (payload: BuilderPlanMorphPayload) => {
        triggerBuilderPlanMorph(payload)
    }

    const cloneViewPlan = (plan: ViewPlan | null): ViewPlan | null => {
        if (!plan) return null
        return {
            ...plan,
            exercises: Array.isArray(plan.exercises) ? plan.exercises.map(ex => ({ ...ex })) : [],
        }
    }

    const onSelectedPlanChange = (plan: ViewPlan | null) => {
        selectedPlan.value = cloneViewPlan(plan)
    }

    const onReorderTimers = (list: TimerInstance[]) => emit('reorder-timers', list);
    const onAddTimerFromChild = (timer: TimerInstance) => emit('add-timer', timer)
    const onRemoveTimerFromChild = (id: string) => emit('remove-timer', id)

    const downloadShareLines = ref < string[] | null > (null)
    const downloadShareText = ref < string | null > (null)
    const downloadShareUrl = ref < string | null > (null)
    // NEU: gemeinsamer Typ für Übungskategorien
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer';
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>;

    let onBeforeUnload: (() => void) | null = null
    let onVisChange: (() => void) | null = null

    const trainingPlansStore = useTrainingPlansStore();

    // ===== Crash-Fix: fehlende Refs/Handler die im Template + Reset genutzt werden =====
    const guestPlans = ref<ViewPlan[]>([])
    const planRenameEffect = ref<{ planId: string; oldName: string; newName: string; nonce: number } | null>(null)
    const selectedPlan = ref<ViewPlan | null>(null)

    const planSearch = ref('')
    const showCustomExercises = ref(false)
    const rowHeights = ref<number[]>([])

    // Falls du später echtes Plan-Menü hast: hier ersetzen.
    // Wichtig: ohne Definition crasht hardResetTrainingUi().
    const closePlanMenu = () => { }

    // Wird an mehreren Stellen verwendet (Popup-Editing)
    const editCellIndex = ref<number | null>(null)

    // Tabellen-Refs (werden in initResizeTable/initCustomResizeTable abgefragt)
    const resizeTable = ref<HTMLTableElement | null>(null)
    const customResizeTable = ref<HTMLTableElement | null>(null)

    // Spaltenbreiten Defaults (sonst normalize/init kann später knallen)
    const columnWidths = ref<number[]>([50, 25, 25])

    // Header ResizeObserver (wird in setup/teardown benutzt)
    let headerRO: ResizeObserver | null = null
    let headerRORaf = 0

    // Falls du später Favorites richtig implementierst: hier ersetzen.
    // Wird aktuell nur in save/flush payloads genutzt.
    const favoritePlans = ref<any[]>([])

    // Optional: falls irgendwo "plans.value" genutzt wird.
    // (Dein UI nutzt gerade TrainingPlansList mit guestPlans, aber deine Save-Funktionen referenzieren plans.)
    const plans = ref<ViewPlan[]>([])

    // ===== Guest-Handlers die im Template gebunden sind =====
    const onGuestDeletePlan = (planId: string) => {
        const idx = guestPlans.value.findIndex(p => p.id === planId)
        if (idx >= 0) guestPlans.value.splice(idx, 1)

        if (selectedPlan.value?.id === planId) selectedPlan.value = null
        addToast('Plan gelöscht', 'delete')
    }

    const onGuestEditPlan = (planId: string) => {
        const p = guestPlans.value.find(x => x.id === planId) || null
        selectedPlan.value = p
        if (p) addToast('Plan geöffnet', 'load')
    }

    // Wird von tryOpenPlanFromStorage() aufgerufen – ohne Definition -> Crash
    const loadPlan = (planId: string) => {
        // Guest-first: öffnen, wenn vorhanden
        const gp = guestPlans.value.find(p => p.id === planId)
        if (gp) {
            selectedPlan.value = gp
            return
        }

        // Account: wenn du später willst, hier Store-Select / API load einbauen.
        console.warn('[Training.vue] loadPlan: plan not found', planId)
    }

    const planTutActive = ref(false)
    const planTutPlanId = ref<string | null>(null)

    const onPlanCreated = (payload: { id: string; name: string }) => {
        planTutPlanId.value = payload?.id ?? null
        planTutActive.value = !!planTutPlanId.value
    }

    const closePlanTut = () => {
        planTutActive.value = false
        planTutPlanId.value = null
    }

    const auth = useAuthStore()
    const settingsStore = useSettingsStore()
    const route = useRoute()
    const router = useRouter()

    const timersStore = useTimersStore()
    const stopwatchesStore = useStopwatchesStore()

    const showPlanBuilderTut = ref(false)
    type Step = { title: string; text: string; selector: string }
    const planBuilderSteps = computed<Step[]>(() => [
        { title: t('training.tutorial.step1Title'), text: t('training.tutorial.step1Text'), selector: '#plan-name' },
        { title: t('training.tutorial.step2Title'), text: t('training.tutorial.step2Text'), selector: '.add-exercise-btn' },
        { title: t('training.tutorial.step3Title'), text: t('training.tutorial.step3Text'), selector: '.plan-submit-btn' },
    ])

    const maybeShowPlanBuilderTut = () => {
        if (showPlanBuilderTut.value) return
        const isQuickStart = route.query?.tut === 'plan'
        const isPhonePreviewDemo = route.query?.preview === 'phone' && route.query?.demo === 'builder'
        if (isPhonePreviewDemo) return
        const hasCreated = !!auth.user?.hasCreatedTrainingPlan
        if (!isQuickStart || hasCreated) return
        showPlanBuilderTut.value = true

        const { tut, ...rest } = route.query
        router.replace({ query: rest })
    }

    watch(
        () => route.query?.tut,
        () => maybeShowPlanBuilderTut()
    )

    const hardResetTrainingUi = () => {
        if (isResettingTrainingUi) return
        isResettingTrainingUi = true

        try {
            // Store leeren -> UI direkt clean
            try { trainingPlansStore.$reset() } catch { }

            closePlanMenu()
            selectedPlan.value = null
            planSearch.value = ''
            rowHeights.value = []
            showCustomExercises.value = false
            customExercises.value = []
            guestPlans.value = []

            // Builder sauber resetten (weil der State jetzt dort lebt)
            builderRef.value?.clearEditMode?.()
            builderRef.value?.resetBuilder?.()
        } finally {
            // erst nach dem Tick wieder freigeben (verhindert Reset-Kaskaden)
            queueMicrotask(() => { isResettingTrainingUi = false })
        }
    }
    const weightStore = useWeightStore()

    const startTimerSafe = (timer: TimerInstance) => props.startTimer(timer)
    const stopTimerSafe = (timer: TimerInstance) => props.stopTimer(timer)
    const resetTimerSafe = (timer: TimerInstance) => props.resetTimer(timer)

    const copyPlanCode = async (code?: string | null) => {
        const c = (code ?? '').trim()
        if (!c) { addToast('Kein Code vorhanden', 'delete'); return }

        try {
            await navigator.clipboard.writeText(c)
            addToast('Code kopiert', 'save')
        } catch {
            addToast('Kopieren fehlgeschlagen', 'delete')
        }
    }

    const showDeletePopup = ref(false);
    const showEditPopup = ref(false);
    const showDownloadPopup = ref(false);
    const showValidationPopup = ref(false);
    const validationErrorMessages = ref<string[]>([]);
    const downloadPlan = ref<ViewPlan | null>(null);
    const downloadFormat = ref<Fmt>('html')

    type Fmt = 'html' | 'pdf' | 'csv' | 'json' | 'txt'
    type ExportMode = 'file' | 'share'

    const customColWidths = ref([40, 30, 15, 15]); // Start: Name|Muskel|Typ|Aktion

    const deleteAction = ref<(() => void) | null>(null);

    const editValue = ref('');
    const editType = ref<
        'table'
        | 'selectedPlan'
        | 'planName'
        | 'selectedPlanName'
        | 'timerName'
        | 'customExerciseName'
        | 'customExerciseMuscle'
        | 'customExerciseType'
    >('table');
    const editIndex = ref<number | string | null>(null);
    const customExercises = ref<Array<{ name: string; muscle: string; type: CustomExerciseType }>>([]);
    const toast = ref<AppToast | null>(null);
    let toastId = 0;

    let toastTimeout: number | null = null;
    let autoDismissRemainingMs = 0;
    let autoDismissStartedAt = 0;
    const isTimerSticky = ref(false); // Hinzugefügt für Sticky-Logik
    const isStopwatchSticky = ref(false);
    const typeLabel = (t: ExerciseType) =>
        ({ kraft: 'Kraft', calisthenics: 'Calisthenics', dehnung: 'Dehnung', ausdauer: 'Ausdauer' } as const)[t];

    // Funktionen (weitgehend unverändert, nur relevante Änderungen)
    // zeigt Anfang + Ende, mittig „…“ (breitenunabhängig, super simpel)
    function middleEllipsis(str: string, max = 36) {
        const s = (str || '').trim()
        if (s.length <= max) return s
        const head = Math.ceil((max - 1) / 2)
        const tail = Math.floor((max - 1) / 2)
        return s.slice(0, head) + '…' + s.slice(-tail)
    }
    const clearToastTimer = () => {
        if (toastTimeout) {
            window.clearTimeout(toastTimeout as any);
            toastTimeout = null;
        }
    };

    function tryFocusFromStorage() {
        if (!canUseLocalStorage()) return

        let type: string | null = null
        let id: string | null = null

        try {
            type = localStorage.getItem(LS_TRAINING_FOCUS_TYPE)
            id = localStorage.getItem(LS_TRAINING_FOCUS_ID)
        } catch {
            return
        }

        if (!type || !id) return

        const selector = type === 'timer'
            ? `.timer-card[data-timer-id="${id}"]`
            : `.stopwatch-card[data-stopwatch-id="${id}"]`

        const focusIt = (attempts = 0) => {
            const el = document.querySelector(selector) as HTMLElement | null
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                el.classList.add('flash-focus')
                setTimeout(() => el.classList.remove('flash-focus'), 1500)

                try {
                    localStorage.removeItem(LS_TRAINING_FOCUS_TYPE)
                    localStorage.removeItem(LS_TRAINING_FOCUS_ID)
                } catch { }
            } else if (attempts < 20) {
                requestAnimationFrame(() => focusIt(attempts + 1))
            }
        }

        nextTick(() => focusIt())
    }

    const isMobile = ref(false)
    const dragDelay = computed(() => 0)
    const dragFilter =
        '.inline-actions, .inline-actions *, .kebab-wrap, .kebab-wrap *, .timer-actions, .timer-actions *, button, select, input, textarea, a'


    const stickyTimerEnabled = ref(true)
    const stickyStopwatchEnabled = ref(true)

    const readBoolLS = (key: string, fallback = true) => {
        if (!canUseLocalStorage()) return fallback;
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        const v = raw.trim().toLowerCase();
        if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true;
        if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false;
        return fallback;
    };

    const syncStickyPrefsFromStorage = () => {
        // Gäste: Defaults, keine Reads
        stickyTimerEnabled.value = canUseLocalStorage()
            ? readBoolLS(LS_STICKY_TIMER_ENABLED, true)
            : true;

        stickyStopwatchEnabled.value = canUseLocalStorage()
            ? readBoolLS(LS_STICKY_STOPWATCH_ENABLED, true)
            : true;

        nextTick(() => checkScroll());
    };

    let mq: MediaQueryList | null = null
    const onMedia = (e: MediaQueryListEvent | MediaQueryList) => {
        // @ts-ignore - legacy: unify types

        isMobile.value = !!e.matches
    }

    onMounted(() => {
        syncStickyPrefsFromStorage();

        // Gäste: KEINE storage/visibility Listener (sonst liest er LS ständig)
        if (canUseLocalStorage()) {
            document.addEventListener('visibilitychange', syncStickyPrefsFromStorage);
            window.addEventListener('storage', syncStickyPrefsFromStorage);
        }

        if (typeof window !== 'undefined') {
            mq = window.matchMedia('(max-width: 560px)');
            onMedia(mq);
            try { mq.addEventListener('change', onMedia as any) } catch { mq.addListener(onMedia as any) }
        }
    });

    onUnmounted(() => {
        if (canUseLocalStorage()) {
            document.removeEventListener('visibilitychange', syncStickyPrefsFromStorage);
            window.removeEventListener('storage', syncStickyPrefsFromStorage);
        }

        if (mq) {
            try { mq.removeEventListener('change', onMedia as any) } catch { mq.removeListener(onMedia as any) }
        }
    });

    const makeId = () => {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    };

    const onGuestPlanCreated = (plan: ViewPlan) => {
        const existingIndex = guestPlans.value.findIndex(entry => entry.id === plan.id)

        if (existingIndex >= 0) {
            guestPlans.value.splice(existingIndex, 1, plan)
            if (selectedPlan.value?.id === plan.id) {
                selectedPlan.value = cloneViewPlan(plan)
            }
            addToast('Plan gespeichert', 'save')
            return
        }

        guestPlans.value.unshift(plan)
        addToast('Plan erstellt', 'add')
    }

    const editPopupTitle = computed(() => {
        if (editType.value === 'customExerciseType') return t('training.editPopup.exerciseTypeTitle');
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return t('training.editPopup.planNameTitle');
        if (editType.value === 'customExerciseName') return t('training.editPopup.exerciseNameTitle');
        if (editType.value === 'customExerciseMuscle') return t('training.editPopup.muscleGroupTitle');
        if (editCellIndex.value === 0) return t('training.editPopup.exerciseTitle');
        if (editCellIndex.value === 1) return t('training.editPopup.setsMinutesTitle');
        if (editCellIndex.value === 2) return t('training.editPopup.repsKmTitle');
        return t('common.edit');
    });

    const editOptions = computed(() => {
        if (editType.value === 'customExerciseType') {
            return [
                { label: t('builder.trainingType.strength'), value: 'kraft' },
                { label: t('builder.trainingType.calisthenics'), value: 'calisthenics' },
                { label: t('builder.trainingType.mobility'), value: 'dehnung' },
            ];
        }
        return [];
    });

    const editInputType = computed(() => {
        if (editType.value === 'customExerciseType') return 'select';
        if (
            editType.value === 'planName' ||
            editType.value === 'selectedPlanName' ||
            editType.value === 'timerName' ||
            editType.value === 'customExerciseName' ||
            editType.value === 'customExerciseMuscle'
        ) return 'text';
        return 'number';
    });


    const editPlaceholder = computed(() => {
        if (editType.value === 'customExerciseType') return t('training.editPopup.typePlaceholder');
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return t('training.editPopup.planNamePlaceholder');
        if (editType.value === 'customExerciseName') return t('training.editPopup.exerciseNamePlaceholder');
        if (editType.value === 'customExerciseMuscle') return t('training.editPopup.muscleGroupPlaceholder');
        if (editCellIndex.value === 0) return t('training.editPopup.exercisePlaceholder');
        if (editCellIndex.value === 1) return t('training.editPopup.setsPlaceholder');
        if (editCellIndex.value === 2) return t('training.editPopup.repsPlaceholder');
        return t('training.editPopup.valuePlaceholder');
    });

    const loadFromAccount = async (): Promise<true | false | 'error'> => {
        try {
            const res = await apiFetch('/api/me/training-data', { method: 'GET' })

            if (res.status === 204) return false

            if (!res.ok) {
                // Debug: Status + Body sehen (z.B. "Unauthorized", "Token expired", HTML error, etc.)
                let body = ''
                try { body = await res.text() } catch { }
                console.error('GET /api/me/training-data failed', {
                    status: res.status,
                    statusText: res.statusText,
                    body: body?.slice(0, 800),
                    hasToken: !!getAuthToken(),
                })
                throw new Error(`GET training-data failed: ${res.status}`)
            }

            const parsed = (await res.json()) ?? {}

            const loadedPlans = Array.isArray(parsed.plans) ? parsed.plans : []
            const loadedFavs = Array.isArray(parsed.favoritePlans) ? parsed.favoritePlans : []
            void loadedPlans
            void loadedFavs

            customExercises.value = Array.isArray(parsed.customExercises)
                ? parsed.customExercises
                    .filter((ex: any) =>
                        ex && typeof ex === 'object' &&
                        typeof ex.name === 'string' &&
                        typeof ex.muscle === 'string'
                    )
                    .map((ex: any) => {
                        const t0 = normalizeTypeInput(ex.type) ?? 'kraft'
                        const t: ExerciseType = (t0 === 'ausdauer') ? 'kraft' : t0
                        return { name: ex.name, muscle: ex.muscle, type: t }
                    })
                : []

            return true
        } catch (e) {
            console.error('Fehler beim Laden (Account):', e)
            return 'error'
        }
    }

    let saveAccountTimer: number | null = null

    const getAuthToken = () => localStorage.getItem(LS_AUTH_TOKEN) || ''

    const apiFetch = async (url: string, init?: RequestInit) => {
        const token = getAuthToken()
        const res = await fetch(url, {
            ...(init || {}),
            headers: {
                'Content-Type': 'application/json',
                ...(init?.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        })
        return res
    }

    const queueSaveToAccount = () => {
        // ✅ kein Konto / kein Token => NICHT syncen (sonst 401/Crash-Risiko)
        if (!auth.user) return
        const token = getAuthToken()
        if (!token) return

        if (saveAccountTimer) window.clearTimeout(saveAccountTimer)

        saveAccountTimer = window.setTimeout(async () => {
            try {
                const payload = {
                    customExercises: customExercises.value,
                }

                const res = await apiFetch('/api/me/training-data', {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                })

                if (!res.ok) {
                    let body = ''
                    try { body = await res.text() } catch { }
                    console.error('PUT /api/me/training-data failed', {
                        status: res.status,
                        body: body?.slice(0, 800),
                        hasUser: !!auth.user,
                        hasToken: !!token,
                    })
                    return
                }
            } catch (e) {
                console.error('Fehler beim Speichern (Account):', e)
            }
        }, 350)
    }

    // Training.vue — REPLACE saveToStorage
    const saveToStorage = () => {
        // ✅ Gäste: kein Account-Sync
        if (!auth.user || !getAuthToken()) return
        queueSaveToAccount()
    }

    const saveToAccountNow = async () => {
        try {
            if (!auth.user) return false
            const token = getAuthToken()
            if (!token) return false


            if (saveAccountTimer) window.clearTimeout(saveAccountTimer)
            saveAccountTimer = null

            const payload = {
                plans: plans.value,
                favoritePlans: favoritePlans.value,
                customExercises: customExercises.value,
            }

            const res = await apiFetch('/api/me/training-data', {
                method: 'PUT',
                body: JSON.stringify(payload),
            })

            if (!res.ok) throw new Error(`PUT training-data failed: ${res.status}`)
            return true
        } catch (e) {
            console.error('Fehler beim Hard-Speichern (Account):', e)
            return false
        }
    }

    // Flush beim Tab schließen / Reload (best-effort)
    const flushPendingAccountSave = () => {
        if (!saveAccountTimer) return
        if (saveAccountTimer) window.clearTimeout(saveAccountTimer)
        saveAccountTimer = null

        try {
            const token = getAuthToken()
            if (!token) return

            const payload = JSON.stringify({
                plans: plans.value,
                favoritePlans: favoritePlans.value,
                customExercises: customExercises.value,
            })

            // sendBeacon ist perfekt für unload
            const ok = navigator.sendBeacon?.(
                '/api/me/training-data',
                new Blob([payload], { type: 'application/json' })
            )

            // Falls sendBeacon fehlt/false -> egal, aber wir haben’s versucht
            void ok
        } catch (e) {
            // no spam
        }
    }

    const toggleCustomExercises = () => {
        showCustomExercises.value = !showCustomExercises.value;
    };

    const validateRangeCapableInt = (
        value: RangeCapableValue | null | undefined,
        label: string,
        min: number,
        max: number
    ) => {
        const displayLabel = translateUiText(label)
        if (value == null) return `${displayLabel} müssen eine Zahl oder einen Bereich wie 8-10 sein`;

        const text = String(value).trim();
        if (!text) return `${displayLabel} müssen eine Zahl oder einen Bereich wie 8-10 sein`;

        if (/^\d+$/.test(text)) {
            const num = Number(text);
            if (num < min || num > max) return `${displayLabel} müssen zwischen ${min} und ${max} liegen`;
            return null;
        }

        const rangeMatch = text.match(/^(\d+)\s*-\s*(\d+)$/);
        if (!rangeMatch) return `${displayLabel} müssen eine Ganzzahl oder einen Bereich wie 8-10 sein`;

        const start = Number(rangeMatch[1]);
        const end = Number(rangeMatch[2]);
        if (start < min || end > max) return `${displayLabel} müssen zwischen ${min} und ${max} liegen`;
        if (start > end) return `${displayLabel}: Bereich muss aufsteigend sein`;
        return null;
    };

    const validateSetsRange = (sets: RangeCapableValue | null | undefined) =>
        validateRangeCapableInt(sets, 'Sätze', 1, 20);

    const validateRepsRange = (reps: RangeCapableValue | null | undefined) =>
        validateRangeCapableInt(reps, 'Wiederholungen/Sekunden', 1, 1000);

    const validateReps = (reps: number | null | undefined) => {
        if (reps == null || isNaN(reps)) return 'Wiederholungen/Sekunden müssen eine Zahl sein';
        if (!Number.isFinite(reps)) return 'Ungültige Zahl';
        if (!Number.isInteger(reps)) return 'Wiederholungen/Sekunden müssen eine Ganzzahl sein';
        // großzügiger, damit Dehnung (Sekunden) und hohe Wiederholungen funktionieren
        if (reps < 1 || reps > 1000) return 'Wiederholungen/Sekunden müssen zwischen 1 und 1000 liegen';
        return null;
    };

    const validateSets = (sets: number | null | undefined) => {
        if (sets == null || isNaN(sets)) return 'Sätze müssen eine Zahl sein';
        if (sets < 1 || sets > 20) return 'Sätze müssen zwischen 1 und 20 liegen';
        if (!Number.isInteger(sets)) return 'Sätze müssen eine Ganzzahl sein';
        return null;
    };

    const validateCustomExercise = (
        name: string,
        muscle: string,
        typeRaw: string | ExerciseType,
        editIndex: number | null = null
    ): { name: string; muscle: string; type: CustomExerciseType } | string => {
        const trimmedName = (name ?? '').trim();
        const trimmedMuscle = (muscle ?? '').trim();

        if (!trimmedName) return 'Übungsname ist erforderlich';
        if (!trimmedMuscle) return 'Muskelgruppe ist erforderlich';
        if (trimmedName.length > 50) return 'Übungsname darf maximal 50 Zeichen lang sein';
        if (trimmedMuscle.length > 50) return 'Muskelgruppe darf maximal 50 Zeichen lang sein';

        const normalized = normalizeTypeInput(typeRaw);
        if (!normalized) return 'Ungültiger Typ. Erlaubt sind: kraft, calisthenics, dehnung';
        if (normalized === 'ausdauer') return '"Ausdauer" ist für benutzerdefinierte Übungen nicht erlaubt';

        const type = normalized as CustomExerciseType;

        const exists = customExercises.value.some((ex, i) =>
            i !== editIndex &&
            ex.type === type &&
            ex.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) return 'Übungsname existiert in diesem Typ bereits';

        return { name: trimmedName, muscle: trimmedMuscle, type };
    };

    const onEditPopupSave = (val: string) => {
        editValue.value = val;
        saveEdit();        // nutzt jetzt den tatsächlich im Popup editierten Wert
    };


    const validatePlanName = (name: string): string | false => {
        const trimmedName = name.trim();
        if (trimmedName.length < 3) return false;
        if (trimmedName.length > 20) return false;
        return trimmedName;
    };

    const validateDurationMin = (val: number | null | undefined) => {
        if (val == null || isNaN(val)) return 'Dauer (Minuten) muss eine Zahl sein'
        if (!Number.isInteger(val)) return 'Dauer (Minuten) muss eine Ganzzahl sein'
        if (val < 1 || val > 600) return 'Dauer (Minuten) muss zwischen 1 und 600 liegen'
        return null
    }
    const validateDistanceKm = (val: number | null | undefined) => {
        if (val == null || val === undefined || val === 0) return null // optional
        if (val < 0 || val > 1000) return 'Distanz (km) muss zwischen 0 und 1000 liegen'
        return null
    }

    const parseRangeCapableNumber = (value: unknown): number | null => {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null
        const text = String(value ?? '').trim().replace(',', '.')
        if (!text) return null
        const rangeMatch = text.match(/^(\d+)\s*-\s*(\d+)$/)
        if (rangeMatch) return Number(rangeMatch[1])
        const numeric = Number(text)
        return Number.isFinite(numeric) ? numeric : null
    }

    const composeRangeNotes = (exercise: PlanExercise) => {
        const lines = String((exercise as any).notes ?? '').split(/\r?\n/).map((line: string) => line.trim()).filter(Boolean)
        const kept = lines.filter((line: string) => !/^Sätze:\s*/i.test(line) && !/^Wiederholungen:\s*/i.test(line))
        if (typeof exercise.sets === 'string' && exercise.type !== 'ausdauer') kept.push(`Sätze: ${exercise.sets}`)
        if (typeof exercise.reps === 'string' && exercise.type !== 'ausdauer') kept.push(`Wiederholungen: ${exercise.reps}`)
        return kept.length ? kept.join('\n') : null
    }

    const openValidationPopup = (errors: string[]) => {
        const items = Array.isArray(errors) ? errors : [String(errors)]
        validationErrorMessages.value = items.map((error) => translateUiText(String(error)));
        showValidationPopup.value = true;
    };


    const closeValidationPopup = () => {
        showValidationPopup.value = false;
        validationErrorMessages.value = [];
    };

    const mapTypeToCategory = (t?: PlanExercise["type"]) => {
        if (t === "calisthenics") return 1;
        if (t === "dehnung") return 2;
        if (t === "ausdauer") return 3;
        return 0;
    };

    const mapSelectedPlanExercisesToPayload = (exercises: PlanExercise[]) =>
        exercises.map((ex, index) => ({
            name: ex.exercise,
            category: mapTypeToCategory(ex.type),
            sortOrder: index,
            sets: ex.type === 'ausdauer' ? null : (parseRangeCapableNumber(ex.sets) ?? null),
            reps: ex.type === 'ausdauer' ? null : (parseRangeCapableNumber(ex.reps) ?? null),
            targetWeight: null,
            restSeconds: null,
            durationMin: ex.type === 'ausdauer' ? (parseRangeCapableNumber(ex.sets) ?? null) : null,
            distanceKm: ex.type === 'ausdauer' ? (parseRangeCapableNumber(ex.reps) ?? null) : null,
            notes: composeRangeNotes(ex),
        }));

    const removeExerciseFromPlan = (index: number) => {
        if (!selectedPlan.value) {
            addToast('Kein Plan geöffnet', 'delete');
            return;
        }

        if (index < 0 || index >= selectedPlan.value.exercises.length) {
            addToast('Ungültiger Übungsindex', 'delete');
            return;
        }

        openDeletePopup(() => {
            selectedPlan.value!.exercises.splice(index, 1);
            rowHeights.value.splice(index, 1);

            updatePlanInStorage(); // nutzt saveToStorage() -> Account Sync
            addToast('Übung gelöscht', 'delete');
        });
    };

    const upsertGuestPlan = (updated: ViewPlan) => {
        const idx = guestPlans.value.findIndex(p => p.id === updated.id)
        if (idx >= 0) guestPlans.value[idx] = updated
        else guestPlans.value.unshift(updated)
    }

    // Scroll/Highlight zum Builder
    const builderSection = ref<HTMLElement | null>(null);

    function scrollToBuilder() {
        const el = builderSection.value;
        if (!el) return;

        const offset = 8; // ggf. an fixe Headerhöhe anpassen
        const top = el.getBoundingClientRect().top + window.scrollY - offset;

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });

        // dezentes Highlight
        el.classList.remove('builder-landing');
        void el.offsetWidth; // Reflow, damit Animation neu startet
        el.classList.add('builder-landing');

        // optional: Planname fokussieren, ohne Scroll-Jump
        const input = document.getElementById('plan-name') as HTMLInputElement | null;
        if (input) input.focus({ preventScroll: true });
    }

    const openDownloadPopup = (
        plan: TrainingPlan,
        opts?: { shareLines?: string[]; shareText?: string; shareUrl?: string }
    ) => {
        downloadPlan.value = plan
        downloadFormat.value = 'html'
        downloadShareLines.value = opts?.shareLines ?? null
        downloadShareText.value = opts?.shareText ?? null
        downloadShareUrl.value = opts?.shareUrl ?? null
        showDownloadPopup.value = true
    }

    const closeDownloadPopup = () => {
        showDownloadPopup.value = false
        downloadPlan.value = null
        downloadFormat.value = 'html'
        downloadShareLines.value = null
        downloadShareText.value = null
        downloadShareUrl.value = null
    }

    const confirmExport = async (payload: { format: Fmt; mode: ExportMode }) => {
        if (!downloadPlan.value) return

        const plan = downloadPlan.value
        const format = payload.format
        const mode = payload.mode

        downloadFormat.value = format

        const ok = await exportTrainingPlan(plan, {
            format,
            mode,
            shareLines: downloadShareLines.value ?? undefined,
            shareText: downloadShareText.value ?? undefined,
            shareUrl: downloadShareUrl.value ?? undefined,
        })

        if (ok) {
            addToast(mode === 'share' ? 'Share-Text kopiert ✅' : 'Plan exportiert', 'save')
            closeDownloadPopup()
        } else {
            addToast('Export fehlgeschlagen', 'delete')
        }
    }

    const openDeletePopup = (action: () => void) => {
        const confirmDeleteEnabled = settingsStore?.dto?.confirmDeleteEnabled ?? true
        try {
            localStorage.setItem(LS_CONFIRM_DELETE_ENABLED, String(confirmDeleteEnabled))
            window.dispatchEvent(new CustomEvent('confirm-delete-changed', { detail: confirmDeleteEnabled }))
        } catch {
            // ignore
        }
        deleteAction.value = action;
        showDeletePopup.value = true;
    };

    const closeDeletePopup = () => {
        showDeletePopup.value = false;
        deleteAction.value = null;
    };

    const confirmDeleteAction = () => {
        console.log('confirmDeleteAction aufgerufen, deleteAction:', deleteAction.value);
        if (deleteAction.value) deleteAction.value();
        closeDeletePopup();
    };
    function startToastTimer() {
        if (!toast.value) return;
        if (toastTimeout) return; // schon aktiv
        autoDismissStartedAt = performance.now();
        // id übergeben war falsch → sofortiger Dismiss, weil truthy. Korrekt: explicit immediate.
        toastTimeout = window.setTimeout(() => dismissToast(true), Math.max(0, autoDismissRemainingMs));
    }

    function stopToastTimer() {
        if (!toast.value) return;
        if (!toastTimeout) return; // nichts zu stoppen
        // Restzeit berechnen
        autoDismissRemainingMs = Math.max(
            0,
            autoDismissRemainingMs - (performance.now() - autoDismissStartedAt)
        );
        clearToastTimer();
    }
    // REPLACE Training.vue (Funktion addToast)
    const addToast = (message: string, type: 'delete' | 'add' | 'save' | 'timer' | 'load' = 'load') => {
        const id = toastId++;
        const emojis = { delete: '🗑️', add: '✅', save: '💾', timer: '⏰', load: '📋' } as const;
        const types = { delete: 'toast-delete', add: 'toast-add', save: 'toast-save', timer: 'toast-timer', load: 'toast-default' } as const;

        // Parent darf KEINEN eigenen Auto-Dismiss mehr verwalten
        clearToastTimer();

        toast.value = {
            id,
            message: translateUiText(message),
            emoji: emojis[type],
            type: types[type],
            exiting: false,
            createdAtMs: performance.now(),
        };

        // Auto-Dismiss ausschließlich von <Toast/> steuern lassen
        autoDismissRemainingMs = 0;
    };

    const openEditPopup = (
        type:
            | 'table'
            | 'selectedPlan'
            | 'planName'
            | 'selectedPlanName'
            | 'timerName'
            | 'customExerciseName'
            | 'customExerciseMuscle'
            | 'customExerciseType',
        index: number | string,
        event?: MouseEvent
    ) => {
        console.log('openEditPopup aufgerufen:', { type, index });
        editType.value = type;
        editIndex.value = index;
        editCellIndex.value = null;

        if (type === 'table' || type === 'selectedPlan') {
            if (!event) {
                console.error('Kein Event für table/selectedPlan übergeben');
                openValidationPopup(['Bearbeitungsfehler: Kein Event vorhanden']);
                return;
            }
            const target = (event.target as HTMLElement)?.closest('td,th') as HTMLElement | null;
            if (!target) { openValidationPopup(['Bearbeitungsfehler: Keine Zelle erkannt']); return; }

            editCellIndex.value = Array.from(target.parentElement!.children).indexOf(target);
            if (editCellIndex.value < 0 || editCellIndex.value > 2) return;

            const exercise =
                (type === 'table'
                    ? (builderRef.value?.getPreviewExercise?.(index as number) ?? null)
                    : (selectedPlan.value?.exercises[index as number] ?? null))

            if (!exercise) {
                console.error('Übung nicht gefunden für Index:', index)
                openValidationPopup(['Übung nicht gefunden'])
                return
            }

            if (editCellIndex.value === 0) editValue.value = exercise.exercise;
            else if (editCellIndex.value === 1) editValue.value = String(exercise.sets);
            else if (editCellIndex.value === 2) editValue.value = String(exercise.reps);
        } else if (type === 'planName') {
            // Account-Pläne liegen NICHT in plans.value, sondern im Store (TrainingPlansList ist Quelle)
            const id = String(index)

            const storePlan =
                trainingPlansStore.selected?.id === id
                    ? trainingPlansStore.selected
                    : trainingPlansStore.items.find((p: TrainingPlanDto) => p.id === id) ?? null

            // Fallback: falls du doch irgendwann plans.value befüllst
            const localPlan = (plans.value ?? []).find(p => p.id === id) ?? null
            const guestPlan = guestPlans.value.find(p => p.id === id) ?? null

            const planLike: any = storePlan ?? localPlan ?? guestPlan ?? (selectedPlan.value?.id === id ? selectedPlan.value : null)

            if (!planLike) { openValidationPopup(['Plan nicht gefunden']); return; }

            editValue.value = String(planLike.name ?? '')
        } else if (type === 'selectedPlanName') {
            if (!selectedPlan.value) { openValidationPopup(['Kein ausgewählter Plan']); return; }
            editValue.value = selectedPlan.value.name;
        } else if (type === 'customExerciseName') {
            const exercise = customExercises.value[index as number];
            if (!exercise) { openValidationPopup(['Übung nicht gefunden']); return; }
            editValue.value = exercise.name;
        } else if (type === 'customExerciseMuscle') {
            const exercise = customExercises.value[index as number];
            if (!exercise) { openValidationPopup(['Muskelgruppe nicht gefunden']); return; }
            editValue.value = exercise.muscle;
        } else if (type === 'customExerciseType') {
            const exercise = customExercises.value[index as number];
            if (!exercise) { openValidationPopup(['Übung nicht gefunden']); return; }
            editValue.value = exercise.type;
        }

        showEditPopup.value = true;
        console.log('showEditPopup gesetzt:', showEditPopup.value);
    };
    const normalizeTypeInput = (raw: unknown): ExerciseType | null => {
        const t = String(raw ?? '').trim().toLowerCase();
        const map: Record<string, ExerciseType> = {
            // kraft
            kraft: 'kraft', strength: 'kraft',

            // calisthenics
            calisthenics: 'calisthenics', cali: 'calisthenics', bodyweight: 'calisthenics', bw: 'calisthenics',

            // dehnung
            dehnung: 'dehnung', stretch: 'dehnung', stretching: 'dehnung',

            // ausdauer (nur fürs Normalisieren/Bestandsdaten; Auswahl ist gesperrt)
            ausdauer: 'ausdauer', cardio: 'ausdauer', endurance: 'ausdauer',
        };
        return (map[t] ?? (['kraft', 'calisthenics', 'dehnung', 'ausdauer'].includes(t) ? (t as ExerciseType) : null));
    };


    const saveEdit = () => {
        console.log('saveEdit aufgerufen mit:', { editType: editType.value, editValue: editValue.value });

        if (editType.value === 'table' && typeof editIndex.value === 'number') {
            const i = editIndex.value
            const ex = builderRef.value?.getPreviewExercise?.(i)
            if (!ex) return

            // Name edit
            if (editCellIndex.value === 0 && editValue.value) {
                const newName = editValue.value.trim()

                const list = builderRef.value?.getPreviewExercises?.() ?? []
                const dup = list.some((x: any, idx: number) =>
                    idx !== i && (x.exercise || '').toLowerCase() === newName.toLowerCase()
                )
                if (dup) { openValidationPopup(['Übung existiert bereits im Plan']); return }

                builderRef.value?.updatePreviewExercise?.(i, { exercise: newName })
                addToast('Übung aktualisiert', 'save')
                closeEditPopup()
                return
            }

            // Ausdauer: sets=min, reps=km
            if (ex.type === 'ausdauer') {
                if (editCellIndex.value === 1) {
                    const mins = Number(editValue.value)
                    const err = validateDurationMin(mins)
                    if (err) { openValidationPopup([err]); return }
                    builderRef.value?.updatePreviewExercise?.(i, { sets: mins })
                    addToast('Dauer aktualisiert', 'save')
                } else if (editCellIndex.value === 2) {
                    const kmRaw = Number(editValue.value)
                    const km = isNaN(kmRaw) ? 0 : kmRaw
                    const err = validateDistanceKm(km)
                    if (err) { openValidationPopup([err]); return }
                    builderRef.value?.updatePreviewExercise?.(i, { reps: km })
                    addToast('Distanz aktualisiert', 'save')
                }
                closeEditPopup()
                return
            }

            // Kraft/Calisthenics/Dehnung
            if (editCellIndex.value === 1) {
                const sets = editValue.value.trim()
                const setsError = validateSetsRange(sets)
                if (setsError) { openValidationPopup([setsError]); return }
                builderRef.value?.updatePreviewExercise?.(i, { sets })
                addToast('Sätze aktualisiert', 'save')
            } else if (editCellIndex.value === 2) {
                const reps = editValue.value.trim()
                const repsError = validateRepsRange(reps)
                if (repsError) { openValidationPopup([repsError]); return }
                builderRef.value?.updatePreviewExercise?.(i, { reps })
                addToast(ex.type === 'dehnung' ? 'Sekunden aktualisiert' : 'Wiederholungen aktualisiert', 'save')
            }

            closeEditPopup()
            return
        }


        // === 2) Tabelle im geöffneten Plan (selectedPlan) ==========================
        if (editType.value === 'selectedPlan' && typeof editIndex.value === 'number' && selectedPlan.value) {
            const exercise = selectedPlan.value.exercises[editIndex.value];
            if (!exercise) return;

            if (editCellIndex.value === 0 && editValue.value) {
                const newName = editValue.value.trim();
                if (selectedPlan.value.exercises.some(ex => ex.exercise.toLowerCase() === newName.toLowerCase() && ex !== exercise)) {
                    openValidationPopup(['Übung existiert bereits im Plan']);
                    return;
                }
                exercise.exercise = newName;
                updatePlanInStorage();
                addToast('Übung aktualisiert', 'save');
                closeEditPopup();
                return;
            }

            if (exercise.type === 'ausdauer') {
                if (editCellIndex.value === 1) {
                    const mins = Number(editValue.value);
                    const err = validateDurationMin(mins);
                    if (err) { openValidationPopup([err]); return; }
                    exercise.sets = mins;
                    updatePlanInStorage();
                    addToast('Dauer aktualisiert', 'save');
                } else if (editCellIndex.value === 2) {
                    const kmRaw = Number(editValue.value);
                    const km = isNaN(kmRaw) ? 0 : kmRaw;
                    const err = validateDistanceKm(km);
                    if (err) { openValidationPopup([err]); return; }
                    exercise.reps = km;
                    updatePlanInStorage();
                    addToast('Distanz aktualisiert', 'save');
                }
                closeEditPopup();
                return;
            }

            if (editCellIndex.value === 1) {
                const sets = editValue.value.trim();
                const setsError = validateSetsRange(sets);
                if (setsError) { openValidationPopup([setsError]); return; }
                exercise.sets = sets;
                updatePlanInStorage();
                addToast('Sätze aktualisiert', 'save');
            } else if (editCellIndex.value === 2) {
                const reps = editValue.value.trim();
                const repsError = validateRepsRange(reps);
                if (repsError) { openValidationPopup([repsError]); return; }
                exercise.reps = reps;
                updatePlanInStorage();
                addToast(exercise.type === 'dehnung' ? 'Sekunden aktualisiert' : 'Wiederholungen aktualisiert', 'save');
            }

            closeEditPopup();
            return;
        }

        // === 3) Restliche Edit-Fälle ===============================================
        else if (editType.value === 'planName' && typeof editIndex.value === 'string') {
            const planId = editIndex.value
            const validatedName = validatePlanName(editValue.value);
            if (validatedName === false) {
                openValidationPopup([
                    editValue.value.trim().length < 3
                        ? 'Planname muss mindestens 3 Zeichen lang sein'
                        : 'Planname darf maximal 20 Zeichen lang sein'
                ]);
                return;
            }

            closeEditPopup();
            setPlanNameInStore(planId, validatedName);
            addToast('Planname aktualisiert', 'save');
            return;
        } else if (editType.value === 'selectedPlanName' && selectedPlan.value) {
            const selectedPlanId = selectedPlan.value.id
            const validatedName = validatePlanName(editValue.value);
            if (validatedName === false) {
                openValidationPopup([
                    editValue.value.trim().length < 3
                        ? 'Planname muss mindestens 3 Zeichen lang sein'
                        : 'Planname darf maximal 20 Zeichen lang sein'
                ]);
                return;
            }

            closeEditPopup();
            setPlanNameInStore(selectedPlanId, validatedName);
            addToast('Planname aktualisiert', 'save');
            return;
        }

        // === NEU: Typ einer benutzerdefinierten Übung ==============================
        else if (editType.value === 'customExerciseType' && typeof editIndex.value === 'number') {
            const ex = customExercises.value[editIndex.value];
            if (!ex) return;

            const normalized = normalizeTypeInput(editValue.value);
            if (!normalized) {
                openValidationPopup(['Ungültiger Typ. Erlaubt sind: kraft, calisthenics, dehnung']);
                return;
            }
            if (normalized === 'ausdauer') {
                openValidationPopup(['"Ausdauer" ist für benutzerdefinierte Übungen nicht erlaubt']);
                return;
            }

            const duplicate = customExercises.value.some((c, i) =>
                i !== editIndex.value &&
                c.name.toLowerCase() === ex.name.toLowerCase() &&
                c.type === normalized
            );
            if (duplicate) {
                openValidationPopup(['Diese Übung existiert mit diesem Typ bereits']);
                return;
            }

            ex.type = normalized;
            saveToStorage();
            addToast('Übungstyp aktualisiert', 'save');
            closeEditPopup();
            return;
        }

        else if (editType.value === 'customExerciseName' && typeof editIndex.value === 'number') {
            const exercise = customExercises.value[editIndex.value];
            if (!exercise) return;

            const validated = validateCustomExercise(
                editValue.value,
                exercise.muscle,
                exercise.type,
                editIndex.value
            );
            if (typeof validated === 'string') { openValidationPopup([validated]); return; }

            exercise.name = validated.name;
            saveToStorage();
            addToast('Übungsname aktualisiert', 'save');
        } else if (editType.value === 'customExerciseMuscle' && typeof editIndex.value === 'number') {
            const exercise = customExercises.value[editIndex.value];
            if (!exercise) return;

            const validated = validateCustomExercise(
                exercise.name,
                editValue.value,
                exercise.type,
                editIndex.value
            );
            if (typeof validated === 'string') { openValidationPopup([validated]); return; }

            exercise.muscle = validated.muscle;
            saveToStorage();
            addToast('Muskelgruppe aktualisiert', 'save');
        }

        closeEditPopup();
    };

    const onTrainingFocus = (e: Event) => {
        if (!canUseLocalStorage()) return

        const { type, id } = (e as CustomEvent<{ type: 'timer' | 'stopwatch'; id: string }>).detail

        try {
            localStorage.setItem(LS_TRAINING_FOCUS_TYPE, type)
            localStorage.setItem(LS_TRAINING_FOCUS_ID, id)
        } catch { }

        nextTick(() => tryFocusFromStorage())
    }

    const updatePlanInStorage = () => {
        // ✅ Gast: Plan im Memory persistieren
        if (!auth.user) {
            if (selectedPlan.value) upsertGuestPlan({ ...selectedPlan.value, exercises: selectedPlan.value.exercises.map(x => ({ ...x })) })
            return
        }

        // ✅ Account: wie gehabt
        if (!selectedPlan.value) return

        const currentPlan = cloneViewPlan(selectedPlan.value)
        if (!currentPlan) return

        const sourceDto =
            trainingPlansStore.selected?.id === currentPlan.id
                ? trainingPlansStore.selected
                : trainingPlansStore.items.find((p: TrainingPlanDto) => p.id === currentPlan.id) ?? null

        void trainingPlansStore.update(currentPlan.id, {
            name: currentPlan.name,
            isFavorite: !!sourceDto?.isFavorite,
            days: [{
                name: sourceDto?.days?.[0]?.name ?? 'Tag 1',
                sortOrder: sourceDto?.days?.[0]?.sortOrder ?? 0,
                exercises: mapSelectedPlanExercisesToPayload(currentPlan.exercises),
            }],
        }).catch((e) => {
            console.error('Inline-Update fuer Trainingsplan fehlgeschlagen', e)
            addToast('Plan konnte nicht gespeichert werden', 'delete')
        })
    };

    const persistPlanName = async (planId: string, newName: string) => {
        if (!auth.user) return;

        try {
            const p = trainingPlansStore.items.find((x: TrainingPlanDto) => x.id === planId);
            const isFavorite = !!p?.isFavorite;

            const res = await apiFetch(`/api/plans/${planId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: newName,
                    isFavorite,
                }),
            });

            if (!res.ok) {
                let body = '';
                try { body = await res.text(); } catch { }
                console.error('PUT /api/plans/{id} failed', { status: res.status, body: body?.slice(0, 500) });
                return;
            }

            await trainingPlansStore.loadList();
        } catch (e) {
            console.error('persistPlanName error', e);
        }
    };

    const emitPlanRenameEffect = (planId: string, oldName: string, newName: string) => {
        const previous = oldName.trim();
        const next = newName.trim();
        if (!planId || !previous || !next || previous === next) return;
        const payload = {
            planId,
            oldName: previous,
            newName: next,
            nonce: Date.now() + Math.random(),
        }
        planRenameEffect.value = payload
        void nextTick(() => {
            ;(plansListRef.value as any)?.playRenameEffect?.(payload)
        })
    };

    const applyPlanNameInStore = (planId: string, newName: string) => {
        const trimmedName = newName.trim();

        if (!auth.user) {
            const gp = guestPlans.value.find(p => p.id === planId)
            if (gp) gp.name = trimmedName
            if (selectedPlan.value?.id === planId) selectedPlan.value.name = trimmedName
            return
        }

        const dto = trainingPlansStore.items.find((p: TrainingPlanDto) => p.id === planId);
        if (dto) dto.name = trimmedName;

        if (trainingPlansStore.selected?.id === planId) {
            (trainingPlansStore.selected as any).name = trimmedName;
        }

        if (selectedPlan.value?.id === planId) {
            selectedPlan.value.name = trimmedName;
        }

        void persistPlanName(planId, trimmedName);
        saveToStorage();
    }

    const setPlanNameInStore = (planId: string, newName: string) => {
        const trimmedName = newName.trim();
        const oldName = !auth.user
            ? (guestPlans.value.find(p => p.id === planId)?.name ?? (selectedPlan.value?.id === planId ? (selectedPlan.value?.name ?? '') : ''))
            : (trainingPlansStore.items.find((p: TrainingPlanDto) => p.id === planId)?.name
                ?? ((trainingPlansStore.selected?.id === planId ? trainingPlansStore.selected?.name : '')
                    || (selectedPlan.value?.id === planId ? selectedPlan.value.name : '')))

        if (!oldName || oldName.trim() === trimmedName) {
            applyPlanNameInStore(planId, trimmedName)
            return
        }
        applyPlanNameInStore(planId, trimmedName)
        void nextTick(() => emitPlanRenameEffect(planId, oldName, trimmedName))
    };

    const removeCustomExercise = (index: number) => {
        customExercises.value.splice(index, 1);
        if (customExercises.value.length === 0) showCustomExercises.value = false;
        saveToStorage();
        addToast('Benutzerdefinierte Übung gelöscht', 'delete');
    };

    const closeEditPopup = () => {
        showEditPopup.value = false;
        editValue.value = '';
        editType.value = 'table';
        editIndex.value = null;
        editCellIndex.value = null;
    };

    const handleKeydown = (event: KeyboardEvent) => {
        // Wenn das Edit-Popup offen ist, handled es Enter/Escape selbst
        if (showEditPopup.value) return;

        if (event.key === 'Escape') {
            if (showValidationPopup.value) {
                closeValidationPopup();
            } else {
                closePlanMenu();

                closeEditPopup();
                closeDeletePopup();
            }
        } else if (event.key === 'Enter') {
            if (showValidationPopup.value) {
                event.preventDefault()
                closeValidationPopup()
            } else if (showDeletePopup.value) {
                event.preventDefault()
                confirmDeleteAction()
            }
        }
    };

    const checkScroll = () => {
        // ✅ Prefs respektieren: wenn disabled -> niemals sticky anzeigen
        if (!stickyTimerEnabled.value) {
            isTimerSticky.value = false
        } else {
            const stickyTimers = (timersStore.items ?? []).filter(t => !!t.shouldStaySticky)
            let visibleTimerFound = false

            for (const t of stickyTimers) {
                const el = document.querySelector(`.timer-card[data-timer-id="${t.id}"]`) as HTMLElement | null
                if (!el) continue
                const rect = el.getBoundingClientRect()
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    visibleTimerFound = true
                    break
                }
            }
            isTimerSticky.value = stickyTimers.length > 0 && !visibleTimerFound
        }

        if (!stickyStopwatchEnabled.value) {
            isStopwatchSticky.value = false
        } else {
            const stickyStopwatches = (stopwatchesStore.items ?? []).filter(sw => !!(sw as any)?.shouldStaySticky)
            let visibleStopwatchFound = false

            for (const sw of stickyStopwatches) {
                const el = document.querySelector(`.stopwatch-card[data-stopwatch-id="${sw.id}"]`) as HTMLElement | null
                if (!el) continue
                const rect = el.getBoundingClientRect()
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    visibleStopwatchFound = true
                    break
                }
            }
            isStopwatchSticky.value = stickyStopwatches.length > 0 && !visibleStopwatchFound
        }
    }

    function applyHeaderState(th: HTMLElement) {
        const label = th.querySelector('.th-label') as HTMLElement | null;
        if (!label) return;
        const w = th.clientWidth;
        const SHORT = 80;   // <=80px -> "short"
        const MID = 120;  // <=120px -> "mid"
        const nextState = w <= SHORT ? 'is-short' : w <= MID ? 'is-mid' : 'is-full'
        if (label.classList.contains(nextState)) return
        label.classList.remove('is-full', 'is-mid', 'is-short');
        label.classList.add(nextState);
    }

    function setupHeaderShorteningFallback() {
        // erst alte Observer lösen
        headerRO?.disconnect();
        headerRO = new ResizeObserver((entries) => {
            const targets = entries.map(entry => entry.target as HTMLElement)
            if (headerRORaf) window.cancelAnimationFrame(headerRORaf)
            headerRORaf = window.requestAnimationFrame(() => {
                headerRORaf = 0
                targets.forEach(applyHeaderState)
            })
        });

        // Alle relevanten THs aus beiden Tabellen (Wdh + Muskel)
        const ths = Array.from(document.querySelectorAll('th.th-wdh, th.th-muskel')) as HTMLElement[];
        ths.forEach(th => {
            applyHeaderState(th)      // Initial
            headerRO?.observe(th)     // Beobachten (safe)
        })
    }
    // ===== Crash Guard (zeigt Fehler statt Whitescreen) =====
    let crashGuardInstalled = false
    let lastCrashToastAt = 0

    const showCrashToast = (_msg: string) => {
        // bewusst nix: wir wollen keine Toast-Spam-Schleife mehr.
        // Fehlerdetails stehen in der Console + (optional) in deinem globalen ErrorOverlay.
    }

    const installCrashGuard = () => {
        if (crashGuardInstalled) return
        crashGuardInstalled = true

        window.addEventListener('error', (ev) => {
            const message = String(ev.message || '')
            if (message.includes('ResizeObserver loop completed with undelivered notifications')) return
            showCrashToast('Training: Fehler (Details in Console)')
        })

        window.addEventListener('unhandledrejection', (ev) => {
            showCrashToast('Training: Promise-Fehler (Details in Console)')
        })
    }

    function teardownHeaderShorteningFallback() {
        headerRO?.disconnect();
        headerRO = null;
        if (headerRORaf) {
            window.cancelAnimationFrame(headerRORaf)
            headerRORaf = 0
        }
    }

    const initResizeTable = () => {
        const table = resizeTable.value;
        if (!table) return;

        table.querySelectorAll('.resizer,.row-resizer').forEach(el => el.remove());

        const MIN_PX_BY_COL = [16, 16, 16]; // Übung | Sätze | Wdh.
        const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[]; // <-- alle THs
        const lastIdx = ths.length - 1;

        ths.forEach((th, colIndex) => {
            th.style.position = 'relative';
            const isLast = colIndex === lastIdx;

            const makeResizer = (side: 'right' | 'left') => {
                const resizer = document.createElement('div');
                resizer.className = `resizer resizer-${side}`;
                th.appendChild(resizer);

                // Position per Inline-Style (CSS setzt Rest)
                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto'; }
                else { resizer.style.left = '0'; resizer.style.right = 'auto'; }

                let startX = 0;
                let start = [...columnWidths.value];

                const onMove = (e: PointerEvent) => {
                    requestAnimationFrame(() => {
                        const tw = table.getBoundingClientRect().width || 1;

                        const raw = e.clientX - startX;
                        // WICHTIG:
                        // - letzter TH + linker Griff  => dir=-1 (Grenze links verschieben)
                        // - alle anderen Griffe        => dir=+1  (Grenze rechts verschieben)
                        const dir = (isLast && side === 'left') ? -1 : 1;
                        const dxRaw = dir * raw;

                        const partnerIndex = isLast ? colIndex - 1 : colIndex + 1;
                        if (partnerIndex < 0 || partnerIndex >= start.length) return;

                        const currPx = (start[colIndex] / 100) * tw;
                        const partnerPx = (start[partnerIndex] / 100) * tw;

                        const minCurr = MIN_PX_BY_COL[colIndex] ?? 16;
                        const minPartner = MIN_PX_BY_COL[partnerIndex] ?? 16;

                        const maxDxRight = partnerPx - minPartner;
                        const maxDxLeft = -(currPx - minCurr);
                        const dx = Math.max(maxDxLeft, Math.min(dxRaw, maxDxRight));

                        const newCurrPx = currPx + dx;
                        const newPartnerPx = partnerPx - dx;

                        const next = [...start];
                        next[colIndex] = +(newCurrPx / tw * 100).toFixed(4);
                        next[partnerIndex] = +(newPartnerPx / tw * 100).toFixed(4);

                        columnWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex);
                    });
                };

                const onUp = (e: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    resizer.classList.remove('is-active');
                    document.body.classList.remove('is-resizing-col');
                    try { (resizer as any).releasePointerCapture?.(e.pointerId); } catch { }
                };

                const onDown = (e: PointerEvent) => {
                    e.preventDefault(); e.stopPropagation();
                    startX = e.clientX;
                    start = [...columnWidths.value];
                    try { (resizer as any).setPointerCapture?.(e.pointerId); } catch { }
                    resizer.classList.add('is-active');
                    document.body.classList.add('is-resizing-col');
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                };

                resizer.addEventListener('pointerdown', onDown);
            };

            if (isLast) {
                // ➕ zwei Griffe am letzten TH
                makeResizer('left');   // innen
                makeResizer('right');  // am Tabellenrand
            } else {
                makeResizer('right');  // wie gehabt
            }
        });

        // Zeilen-Resizer bleibt unverändert …
        const rows = Array.from(table.querySelectorAll('tbody tr.resizable-row')) as HTMLElement[];
        rows.forEach((row, rowIndex) => {
            row.style.position = 'relative';
            const r = document.createElement('div');
            r.className = 'row-resizer';
            Object.assign(r.style, {
                position: 'absolute', left: '0', bottom: '-4px', width: '100%', height: '10px',
                cursor: 'row-resize', zIndex: '3', background: 'transparent',
            });
            row.appendChild(r);

            let startY = 0;
            let startH = rowHeights.value[rowIndex] || row.getBoundingClientRect().height;

            const onMove = (e: MouseEvent) => {
                requestAnimationFrame(() => {
                    const dy = e.pageY - startY;
                    const minH = 28;
                    rowHeights.value[rowIndex] = Math.max(minH, Math.round(startH + dy));
                });
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                r.classList.remove('is-active');
                document.body.classList.remove('is-resizing-row');
            };
            const onDown = (e: MouseEvent) => {
                e.preventDefault();
                startY = e.pageY;
                startH = rowHeights.value[rowIndex] || row.getBoundingClientRect().height;
                r.classList.add('is-active');
                document.body.classList.add('is-resizing-row');
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            };
            r.addEventListener('mousedown', onDown);
        });
    };

    const initCustomResizeTable = () => {
        const table = customResizeTable.value;
        if (!table) return;

        table.querySelectorAll('.resizer').forEach(el => el.remove());

        const MIN_PX_BY_COL = [16, 16, 16, 44]; // Name | Muskel | Typ | Aktion
        const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[]; // <-- alle THs
        const lastIdx = ths.length - 1;

        ths.forEach((th, colIndex) => {
            th.style.position = 'relative';
            const isLast = colIndex === lastIdx;

            const makeResizer = (side: 'right' | 'left') => {
                const resizer = document.createElement('div');
                resizer.className = `resizer resizer-${side}`;
                th.appendChild(resizer);
                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto'; }
                else { resizer.style.left = '0'; resizer.style.right = 'auto'; }

                let startX = 0;
                let start = [...customColWidths.value];

                const onMove = (e: PointerEvent) => {
                    requestAnimationFrame(() => {
                        const tw = table.getBoundingClientRect().width || 1;
                        const raw = e.clientX - startX;
                        const dir = (isLast && side === 'left') ? -1 : 1;
                        const dxRaw = dir * raw;

                        const partnerIndex = isLast ? colIndex - 1 : colIndex + 1;
                        if (partnerIndex < 0 || partnerIndex >= start.length) return;

                        const currPx = (start[colIndex] / 100) * tw;
                        const partnerPx = (start[partnerIndex] / 100) * tw;

                        const minCurr = MIN_PX_BY_COL[colIndex] ?? 16;
                        const minPartner = MIN_PX_BY_COL[partnerIndex] ?? 16;

                        const maxDxRight = partnerPx - minPartner;
                        const maxDxLeft = -(currPx - minCurr);
                        const dx = Math.max(maxDxLeft, Math.min(dxRaw, maxDxRight));

                        const newCurrPx = currPx + dx;
                        const newPartnerPx = partnerPx - dx;

                        const next = [...start];
                        next[colIndex] = +(newCurrPx / tw * 100).toFixed(4);
                        next[partnerIndex] = +(newPartnerPx / tw * 100).toFixed(4);

                        customColWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex);
                    });
                };

                const onUp = (e: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    resizer.classList.remove('is-active');
                    document.body.classList.remove('is-resizing-col');
                    try { (resizer as any).releasePointerCapture?.(e.pointerId); } catch { }
                };

                const onDown = (e: PointerEvent) => {
                    e.preventDefault(); e.stopPropagation();
                    startX = e.clientX;
                    start = [...customColWidths.value];
                    try { (resizer as any).setPointerCapture?.(e.pointerId); } catch { }
                    resizer.classList.add('is-active');
                    document.body.classList.add('is-resizing-col');
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                };

                resizer.addEventListener('pointerdown', onDown);
            };

            if (isLast) { makeResizer('left'); makeResizer('right'); }
            else { makeResizer('right'); }
        });

    };

    function normalizeStrictTo100(
        widthsPct: number[],
        tableEl: HTMLTableElement,
        minPxByCol: number[],
        preferGiveBackIndex: number // wohin wir den Rundungsdiff geben (meist nextIndex)
    ) {
        const tw = tableEl.getBoundingClientRect().width || 1;
        const minPct = minPxByCol.map(px => +(px / tw * 100).toFixed(4));

        // 1) clamp je Spalte auf min
        const clamped = widthsPct.map((v, i) => Math.max(minPct[i] ?? 0, +v));

        // 2) Summe hart auf 100% bringen
        let sum = +clamped.reduce((a, b) => a + b, 0).toFixed(4);
        let diff = +(100 - sum).toFixed(4);
        if (Math.abs(diff) > 0.0001) {
            const idx = Math.min(Math.max(preferGiveBackIndex, 0), clamped.length - 1);
            clamped[idx] = Math.max(minPct[idx] ?? 0, +(clamped[idx] + diff).toFixed(4));
        }
        return clamped;
    }

    let isResettingTrainingUi = false

    const tryOpenPlanFromStorage = () => {
        if (!canUseLocalStorage()) return

        try {
            const id = localStorage.getItem(LS_TRAINING_OPEN_PLAN_ID)
            if (id) {
                loadPlan(id)
                localStorage.removeItem(LS_TRAINING_OPEN_PLAN_ID)
            }
        } catch { }
    }

    watch(
        () => [
            timersStore.items?.length ?? 0,
            stopwatchesStore.items?.length ?? 0,
            stickyTimerEnabled.value,
            stickyStopwatchEnabled.value,
        ],
        () => nextTick(() => checkScroll()),
        { immediate: true }
    )

    const syncFullscreenClass = () => {
        const isFs = !!document.fullscreenElement;
        document.documentElement.classList.toggle('is-fullscreen', isFs);
    };
    // Eigene Übungen: bei Datenänderungen und wenn sichtbar
    watch(customExercises, () => {
        if (showCustomExercises.value) {
            nextTick(() => {
                safeRun('initCustomResizeTable', () => initCustomResizeTable())
                safeRun('setupHeaderShorteningFallback', () => setupHeaderShorteningFallback())
            })
        }
    }, { deep: true });

    // wenn der ausgewählte Plan geladen/geschlossen wird → Tabelle wechselt
    watch(selectedPlan, (val) => {
        if (val) {
            nextTick(() => {
                safeRun('initResizeTable', () => initResizeTable())
                safeRun('setupHeaderShorteningFallback', () => setupHeaderShorteningFallback())
            })
        } else {
            nextTick(() => safeRun('setupHeaderShorteningFallback', () => setupHeaderShorteningFallback()))
        }
    })

    // wenn die Custom-Übungen eingeblendet werden → Tabelle erscheint
    watch(showCustomExercises, (val) => {
        if (!val) return
        nextTick(() => {
            safeRun('initCustomResizeTable', () => initCustomResizeTable())
            safeRun('setupHeaderShorteningFallback', () => setupHeaderShorteningFallback())
        })
    })

    watch(() => auth.user, async (u) => {
        if (isResettingTrainingUi) return

        if (!u) {
            hardResetTrainingUi()
            return
        }

        if (!getAuthToken()) {
            console.warn('auth.user vorhanden, aber kein Token -> reset training ui')
            hardResetTrainingUi()
            return
        }

        try {
            await trainingPlansStore.loadList()
        } catch (e) {
            console.error('loadList failed in auth watcher', e)
            addToast('Trainingspläne konnten nicht geladen werden', 'delete')
            hardResetTrainingUi()
        }
    }, { immediate: false })

    const safeRun = (label: string, fn: () => void) => {
        try {
            fn()
        } catch (e) {
            console.error(`[Training.vue] ${label} crashed:`, e)
            showCrashToast(`Training: ${label} hat geknallt (Console)`)
        }
    }

    onMounted(async () => {
        installCrashGuard()
        maybeShowPlanBuilderTut()

        window.addEventListener('training:focus', onTrainingFocus as EventListener)

        if (!auth.user) {
            hardResetTrainingUi()
            return
        }

        // ✅ Token-Guard + try/catch, sonst crasht die Seite beim Betreten
        if (!getAuthToken()) {
            console.warn('auth.user vorhanden, aber kein Token -> reset training ui')
            hardResetTrainingUi()
            return
        }

        try {
            await trainingPlansStore.loadList()
        } catch (e) {
            console.error('loadList failed onMounted', e)
            addToast('Trainingspläne konnten nicht geladen werden', 'delete')
            hardResetTrainingUi()
            return
        }

        // ✅ aktuelles Gewicht/Goal im Training verfügbar machen
        try {
            await weightStore.loadSummary(true)
        } catch (e) {
            console.warn('[Training.vue] weight summary load failed', e)
        }

        tryFocusFromStorage()

        window.addEventListener('scroll', checkScroll)
        window.addEventListener('keydown', handleKeydown)
        document.addEventListener('fullscreenchange', syncFullscreenClass)
        window.addEventListener('auth:logout', hardResetTrainingUi as EventListener)

        onBeforeUnload = () => flushPendingAccountSave()
        onVisChange = () => {
            if (document.visibilityState === 'hidden') flushPendingAccountSave()
        }

        window.addEventListener('beforeunload', onBeforeUnload)
        document.addEventListener('visibilitychange', onVisChange)

        syncFullscreenClass();

        safeRun('initResizeTable', () => initResizeTable())
        if (showCustomExercises.value) safeRun('initCustomResizeTable', () => initCustomResizeTable())

        safeRun('setupHeaderShorteningFallback', () => setupHeaderShorteningFallback())
        safeRun('tryOpenPlanFromStorage', () => tryOpenPlanFromStorage())

    });

    onUnmounted(() => {
        window.removeEventListener('scroll', checkScroll)
        window.removeEventListener('keydown', handleKeydown)
        document.removeEventListener('fullscreenchange', syncFullscreenClass)
        window.removeEventListener('auth:logout', hardResetTrainingUi as EventListener)
        window.removeEventListener('training:focus', onTrainingFocus as EventListener)
        if (toastTimeout) { window.clearTimeout(toastTimeout as any); toastTimeout = null; }
        if (saveAccountTimer) { window.clearTimeout(saveAccountTimer as any); saveAccountTimer = null; }

        if (onBeforeUnload) window.removeEventListener('beforeunload', onBeforeUnload)
        if (onVisChange) document.removeEventListener('visibilitychange', onVisChange)
        if (builderActionTimer) clearTimeout(builderActionTimer)
        if (builderPlanMorphTimer) clearTimeout(builderPlanMorphTimer)

        onBeforeUnload = null
        onVisChange = null

        teardownHeaderShorteningFallback()
    });

</script>

<style scoped>
    .training {
        --section-max: 1200px;
        --control-height: 48px;
        --control-font-size: 0.95rem;
        --control-padding-x: 1.5rem;
        --custom-toggle-ch: 38;
        --custom-toggle-w: calc(var(--custom-toggle-ch) * 1ch + 2 * var(--control-padding-x));
        padding: 1rem;
        background: transparent;
        width: 100%;
        max-width: 1200px;
        margin-inline: auto;
        min-height: 100dvh;
        overflow-x: visible;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    .builder-shell {
        position: relative;
        isolation: isolate;
    }

    .builder-shell--edit-morphing::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 2rem;
        pointer-events: none;
        background:
            radial-gradient(circle at 50% 38%, rgba(248, 113, 113, 0.12), transparent 34%),
            radial-gradient(circle at 50% 56%, rgba(250, 204, 21, 0.12), transparent 40%);
        animation: builder-shell-edit-pulse 1.9s ease-out both;
    }

    .builder-shell--edit-morphing :deep(.form-card.builder-grid) {
        border-color: rgba(250, 204, 21, 0.92) !important;
        box-shadow:
            0 0 0 2px rgba(250, 204, 21, 0.96),
            0 0 0 10px rgba(250, 204, 21, 0.16),
            0 30px 60px rgba(217, 119, 6, 0.2) !important;
        animation: builder-form-edit-ring 1.95s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .builder-edit-morph {
        position: absolute;
        inset: 0;
        z-index: 18;
        pointer-events: none;
        display: grid;
        place-items: center;
        overflow: hidden;
    }

    .builder-edit-morph__beam {
        position: absolute;
        left: var(--builder-morph-anchor-x, 50%);
        top: calc(var(--builder-morph-anchor-y, 78%) - 34%);
        width: min(44vw, 540px);
        height: clamp(200px, 42vw, 360px);
        transform: translateX(-50%);
        border-radius: 999px;
        background:
            linear-gradient(180deg, rgba(250, 204, 21, 0.18), rgba(248, 113, 113, 0.08) 48%, rgba(255, 255, 255, 0));
        filter: blur(10px);
        opacity: 0;
        animation: builder-edit-beam 1.95s ease-out both;
    }

    .builder-edit-morph__card {
        position: absolute;
        left: 50%;
        width: min(78vw, 420px);
        padding: 1rem 1.2rem;
        border-radius: 1.4rem;
        text-align: center;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    .builder-edit-morph__card--old {
        top: calc(var(--builder-morph-anchor-y, 78%) - 4%);
        transform: translate(-50%, -50%);
        border: 1px solid rgba(239, 68, 68, 0.24);
        background: linear-gradient(180deg, rgba(255, 250, 250, 0.95), rgba(255, 238, 238, 0.92));
        color: #7f1d1d;
        box-shadow: 0 18px 36px rgba(127, 29, 29, 0.16);
        animation: builder-edit-old-plan 1.95s cubic-bezier(0.18, 0.8, 0.22, 1) both;
    }

    .builder-edit-morph__card--new {
        top: calc(var(--builder-morph-anchor-y, 78%) - 20%);
        transform: translate(-50%, -50%);
        border: 1px solid rgba(250, 204, 21, 0.36);
        background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 244, 214, 0.93));
        color: #854d0e;
        box-shadow:
            0 20px 42px rgba(217, 119, 6, 0.18),
            0 0 0 1px rgba(255, 248, 220, 0.64),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        opacity: 0;
        animation: builder-edit-new-plan 1.95s cubic-bezier(0.18, 0.8, 0.22, 1) both;
    }

    .builder-edit-morph__eyebrow {
        display: block;
        margin-bottom: .45rem;
        font-size: .7rem;
        font-weight: 900;
        letter-spacing: .18em;
        text-transform: uppercase;
        opacity: .82;
    }

    .builder-edit-morph__eyebrow--new {
        color: #b45309;
    }

    .builder-edit-morph__title {
        display: block;
        font-size: 1.18rem;
        font-weight: 900;
        letter-spacing: -.02em;
    }

    .builder-edit-morph__meta {
        display: block;
        margin-top: .45rem;
        font-size: .78rem;
        font-weight: 700;
        opacity: .78;
    }

    .builder-edit-morph__tear {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 2px;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(239, 68, 68, 0.92), rgba(255, 255, 255, 0.02));
        box-shadow: 0 0 18px rgba(248, 113, 113, 0.32);
        opacity: 0;
    }

    .builder-edit-morph__tear--one {
        height: 132%;
        animation: builder-edit-tear-one 1.95s ease-out both;
    }

    .builder-edit-morph__tear--two {
        height: 108%;
        animation: builder-edit-tear-two 1.95s ease-out both;
    }

    .builder-edit-morph__tear--three {
        height: 88%;
        animation: builder-edit-tear-three 1.95s ease-out both;
    }

    .builder-action-label {
        position: fixed;
        left: 50%;
        top: 46%;
        z-index: 1400;
        pointer-events: none;
        transform: translate(-50%, -50%);
        display: grid;
        justify-items: center;
        gap: .3rem;
        min-width: min(88vw, 460px);
        padding: 1rem 1.4rem 1.05rem;
        border-radius: 1.6rem;
        border: 1px solid rgba(250, 204, 21, 0.72);
        background:
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0) 55%),
            linear-gradient(180deg, rgba(255, 251, 235, 0.99), rgba(255, 244, 214, 0.96));
        color: #b45309;
        line-height: 1;
        text-align: center;
        overflow: hidden;
        box-shadow:
            0 22px 42px rgba(245, 158, 11, 0.24),
            0 0 0 1px rgba(255, 248, 220, 0.76),
            0 0 0 10px rgba(250, 204, 21, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.94);
        animation: builder-action-label-rise 2.2s cubic-bezier(0.2, 0.82, 0.24, 1) both, builder-action-label-glow 2.2s ease-in-out both;
    }

    .builder-action-label__kicker {
        padding: .26rem .7rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.72);
        color: #92400e;
        font-size: .74rem;
        font-weight: 900;
        letter-spacing: .18em;
        text-transform: uppercase;
        box-shadow: inset 0 0 0 1px rgba(250, 204, 21, 0.2);
    }

    .builder-action-label__main {
        display: block;
        font-size: clamp(1.6rem, 4.8vw, 2.5rem);
        font-weight: 1000;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #b45309;
        text-shadow:
            0 2px 0 rgba(255, 255, 255, 0.7),
            0 0 22px rgba(250, 204, 21, 0.18);
    }

    .builder-action-label__sub {
        display: block;
        font-size: .9rem;
        font-weight: 800;
        letter-spacing: .05em;
        color: #a16207;
        opacity: .9;
    }

    .builder-action-label__spark {
        position: absolute;
        top: 50%;
        width: 76px;
        height: 76px;
        border-radius: 999px;
        background:
            radial-gradient(circle, rgba(250, 204, 21, 0.9) 0 12%, rgba(250, 204, 21, 0.18) 34%, rgba(250, 204, 21, 0) 72%);
        filter: blur(2px);
        opacity: 0;
        animation: builder-action-spark 2.2s ease-out both;
    }

    .builder-action-label__spark--left {
        left: -8px;
    }

    .builder-action-label__spark--right {
        right: -8px;
        animation-delay: .12s;
    }

    @keyframes builder-action-label-rise {
        0% {
            opacity: 0;
            transform: translate(-50%, -28%) scale(.72) rotate(-5deg);
            filter: blur(10px);
            letter-spacing: .08em;
        }

        18% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.06) rotate(.5deg);
            filter: blur(0);
            letter-spacing: .12em;
        }

        62% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            filter: blur(0);
            letter-spacing: .12em;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -68%) scale(.95) rotate(1deg);
            filter: blur(6px);
            letter-spacing: .14em;
        }
    }

    @keyframes builder-action-label-glow {
        0%, 100% {
            text-shadow: 0 0 0 rgba(255, 248, 220, 0), 0 0 0 rgba(250, 204, 21, 0);
        }

        50% {
            text-shadow: 0 0 18px rgba(255, 248, 220, 0.82), 0 0 36px rgba(250, 204, 21, 0.46);
        }
    }

    @keyframes builder-action-spark {
        0%, 20% {
            opacity: 0;
            transform: translateY(-50%) scale(.2);
        }

        40% {
            opacity: .9;
            transform: translateY(-50%) scale(1);
        }

        100% {
            opacity: 0;
            transform: translateY(-50%) scale(1.45);
        }
    }

    @keyframes builder-form-edit-ring {
        0% {
            box-shadow:
                0 0 0 0 rgba(250, 204, 21, 0.08),
                0 0 0 0 rgba(250, 204, 21, 0.08),
                0 12px 24px rgba(217, 119, 6, 0.08);
            transform: translateY(0) scale(.995);
        }

        35% {
            box-shadow:
                0 0 0 2px rgba(250, 204, 21, 0.96),
                0 0 0 14px rgba(250, 204, 21, 0.22),
                0 30px 60px rgba(217, 119, 6, 0.24);
            transform: translateY(-2px) scale(1.002);
        }

        100% {
            box-shadow:
                0 0 0 2px rgba(250, 204, 21, 0.96),
                0 0 0 10px rgba(250, 204, 21, 0.16),
                0 30px 60px rgba(217, 119, 6, 0.2);
            transform: translateY(0) scale(1);
        }
    }

    @keyframes builder-shell-edit-pulse {
        0% {
            opacity: 0;
            transform: scale(.97);
        }

        24% {
            opacity: 1;
            transform: scale(1);
        }

        100% {
            opacity: 0;
            transform: scale(1.02);
        }
    }

    @keyframes builder-edit-beam {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(16px) scaleY(.76);
        }

        25%,
        70% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scaleY(1);
        }

        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-18px) scaleY(1.08);
        }
    }

    @keyframes builder-edit-old-plan {
        0% {
            opacity: 0;
            transform: translate(-50%, 22%) scale(.84) rotate(-5deg);
            filter: blur(10px);
        }

        28% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.02) rotate(-1deg);
            filter: blur(0);
        }

        46% {
            opacity: 1;
            transform: translate(-50%, -56%) scale(.99) rotate(0deg);
            filter: blur(0);
        }

        68% {
            opacity: .82;
            transform: translate(calc(-50% - 34px), -70%) scale(.95) rotate(-7deg);
            filter: blur(1px);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% - 60px), -92%) scale(.82) rotate(-15deg);
            filter: blur(12px);
        }
    }

    @keyframes builder-edit-new-plan {
        0%,
        48% {
            opacity: 0;
            transform: translate(-50%, -26%) scale(.7);
            filter: blur(12px);
            letter-spacing: .08em;
        }

        72% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.04);
            filter: blur(0);
            letter-spacing: 0;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -62%) scale(.98);
            filter: blur(6px);
            letter-spacing: .04em;
        }
    }

    @keyframes builder-edit-tear-one {
        0%,
        32% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(-6deg) scaleY(.2);
        }

        46% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(-10deg) scaleY(1);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% - 42px), calc(-50% + 24px)) rotate(-26deg) scaleY(.62);
        }
    }

    @keyframes builder-edit-tear-two {
        0%,
        34% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(4deg) scaleY(.2);
        }

        48% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(0deg) scaleY(1);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + 8px), calc(-50% + 38px)) rotate(10deg) scaleY(.4);
        }
    }

    @keyframes builder-edit-tear-three {
        0%,
        36% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(10deg) scaleY(.2);
        }

        50% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(12deg) scaleY(1);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + 36px), calc(-50% + 20px)) rotate(26deg) scaleY(.56);
        }
    }

    html.dark-mode .training {
        background: transparent;
        --resize-color: #64748b;
        --resize-color-hover: #3b82f6;
    }

    html.dark-mode .builder-action-label {
        border-color: rgba(251, 191, 36, 0.54);
        background:
            radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.16), rgba(251, 191, 36, 0) 55%),
            linear-gradient(180deg, rgba(120, 53, 15, 0.98), rgba(92, 39, 12, 0.94));
        color: #fde68a;
        box-shadow:
            0 18px 34px rgba(0, 0, 0, 0.42),
            0 0 0 1px rgba(255, 244, 214, 0.12),
            0 0 22px rgba(250, 204, 21, 0.18),
            0 0 0 10px rgba(250, 204, 21, 0.08);
    }

    html.dark-mode .builder-shell--edit-morphing :deep(.form-card.builder-grid) {
        border-color: rgba(251, 191, 36, 0.92) !important;
        box-shadow:
            0 0 0 2px rgba(251, 191, 36, 0.92),
            0 0 0 10px rgba(251, 191, 36, 0.14),
            0 28px 54px rgba(0, 0, 0, 0.34) !important;
    }

    html.dark-mode .builder-action-label__kicker {
        background: rgba(255, 248, 220, 0.08);
        color: #fde68a;
        box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.18);
    }

    html.dark-mode .builder-action-label__main {
        color: #fde68a;
        text-shadow:
            0 2px 0 rgba(120, 53, 15, 0.6),
            0 0 22px rgba(250, 204, 21, 0.22);
    }

    html.dark-mode .builder-action-label__sub {
        color: #fde68a;
        opacity: .82;
    }

    html.dark-mode .builder-shell--edit-morphing::after {
        background:
            radial-gradient(circle at 50% 38%, rgba(248, 113, 113, 0.16), transparent 34%),
            radial-gradient(circle at 50% 56%, rgba(250, 204, 21, 0.14), transparent 40%);
    }

    html.dark-mode .builder-edit-morph__card--old {
        border-color: rgba(248, 113, 113, 0.26);
        background: linear-gradient(180deg, rgba(69, 10, 10, 0.94), rgba(44, 12, 12, 0.92));
        color: #fecaca;
        box-shadow: 0 22px 42px rgba(0, 0, 0, 0.42);
    }

    html.dark-mode .builder-edit-morph__card--new {
        border-color: rgba(250, 204, 21, 0.34);
        background: linear-gradient(180deg, rgba(120, 53, 15, 0.96), rgba(92, 39, 12, 0.94));
        color: #fde68a;
        box-shadow:
            0 22px 44px rgba(0, 0, 0, 0.42),
            0 0 0 1px rgba(255, 244, 214, 0.08),
            0 0 24px rgba(250, 204, 21, 0.14);
    }

    .page-title {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-align: center;
        color: var(--text-primary);
        letter-spacing: -0.025em;
    }

    @media (max-width: 420px) {
        .training {
            --control-height: 44px;
            --control-padding-x: 1rem;
        }

        .builder-action-label {
            min-width: min(92vw, 360px);
            padding: .9rem 1rem;
            top: 44%;
        }

        .builder-action-label__kicker {
            font-size: .62rem;
        }

        .builder-action-label__main {
            font-size: 1.18rem;
        }

        .builder-action-label__sub {
            font-size: .74rem;
        }

        .builder-edit-morph__card {
            width: min(88vw, 360px);
            padding: .92rem 1rem;
        }

        .builder-edit-morph__title {
            font-size: 1.02rem;
        }

        .page-title {
            font-size: 1.9rem;
        }
    }

    @media (max-width: 360px) {
        .page-title {
            font-size: 1.75rem;
        }
    }

</style>
