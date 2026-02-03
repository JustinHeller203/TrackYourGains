 <!-- Training.vue -->
<template>
    <div class="training">
        <h2 class="page-title">💪 Training</h2>
        <!-- Trainingsplan Formular -->
        <TrainingPlanBuilder ref="builderRef"
                             :openEditPopup="openEditPopup"
                             :addToast="addToast"
                             :openValidationPopup="openValidationPopup"
                             :openDeletePopup="openDeletePopup"
                             v-model:customExercises="customExercises"
                             :saveToStorage="saveToStorage" />

        <div v-if="auth.user" class="workout-list plans-section">
            <h3 class="section-title">Deine Trainingspläne</h3>

            <UiSearch v-model="planSearch"
                      placeholder="Nach Planname oder Trainingsziel suchen"
                      aria-label="Trainingspläne durchsuchen"
                      class="plan-search" />

            <!-- Favoriten sortieren -->
            <Draggable v-if="plans.length && favoritePlanItems.length"
                       v-model="favoritePlanItems"
                       item-key="id"
                       :handle="isMobile ? undefined : '.plan-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
                       :disabled="planSearch.trim().length > 0"
                       :delay="dragDelay"
                       :delay-on-touch-only="true"
                       :touch-start-threshold="8"
                       :fallback-tolerance="3"
                       :fallback-on-body="true"
                       :scroll="true"
                       :scroll-sensitivity="40"
                       :scroll-speed="12"
                       :swap-threshold="0.3"
                       :filter="isMobile ? dragFilter : undefined"
                       tag="div"
                       class="plan-drag-stack">

                <template #item="{ element: plan }">
                    <div v-if="planMatchesSearch(plan)"
                         class="list-item plan-item"
                         :class="{ 'menu-open': planMenuOpenId === plan.id }"
                         :key="plan.id">
                        <div class="plan-row1">
                            <span class="plan-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click="loadPlan(plan.id)"
                                  @dblclick="openEditPopup('planName', plan.id)">
                                <span class="plan-name-scroll">{{ plan.name }}</span>
                                <span class="plan-count">({{ plan.exerciseCount }} Übungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                                    <DeleteButton title="Plan löschen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                    <ActionIconButton title="Download"
                                                      aria-label="Trainingsplan herunterladen"
                                                      @click="openDownloadPopup(plan)">⬇️</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">⋯</ActionIconButton>
                                </span>
                                <OpenButton class="primary-open desktop-open" title="Öffnen" @click="loadPlan(plan.id)" />
                            </div>

                            <PlanMenu v-if="planMenuOpenId === plan.id"
                                      @edit="editPlan(plan.id)"
                                      @delete="openDeletePopup(() => deletePlan(plan.id))"
                                      @download="openDownloadPopup(plan)" />
                        </div>


                        <!-- Open-Button bleibt im schmalen Layout sichtbar (eigene Zeile) -->
                        <div class="plan-row2">
                            <OpenButton class="primary-open mobile-open" title="Öffnen" @click="loadPlan(plan.id)" />
                        </div>
                    </div>

                </template>
            </Draggable>

            <!-- Nicht-Favoriten sortieren -->
            <Draggable v-if="plans.length"
                       v-model="otherPlanItems"
                       item-key="id"
                       :handle="isMobile ? undefined : '.plan-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
                       :disabled="planSearch.trim().length > 0"
                       :delay="dragDelay"
                       :delay-on-touch-only="true"
                       :touch-start-threshold="8"
                       :fallback-tolerance="3"
                       :fallback-on-body="true"
                       :scroll="true"
                       :scroll-sensitivity="40"
                       :scroll-speed="12"
                       :swap-threshold="0.3"
                       :filter="isMobile ? dragFilter : undefined"
                       tag="div"
                       class="plan-drag-stack">

                <template #item="{ element: plan }">
                    <div v-if="planMatchesSearch(plan)"
                         class="list-item plan-item"
                         :class="{ 'menu-open': planMenuOpenId === plan.id }"
                         :key="plan.id">
                        <div class="plan-row1">
                            <span class="plan-drag-handle" title="Ziehen zum Verschieben">⠿</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click="loadPlan(plan.id)"
                                  @dblclick="openEditPopup('planName', plan.id)">
                                <span class="plan-name-scroll">{{ plan.name }}</span>
                                <span class="plan-count">({{ (plan.exerciseCount ?? plan.exercises?.length ?? 0) }} Übungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                                    <DeleteButton title="Plan löschen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                    <ActionIconButton title="Download"
                                                      aria-label="Trainingsplan herunterladen"
                                                      @click="openDownloadPopup(plan)">⬇️</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">⋯</ActionIconButton>
                                </span>

                                <OpenButton class="primary-open desktop-open" title="Öffnen" @click="loadPlan(plan.id)" />
                            </div>

                            <PlanMenu v-if="planMenuOpenId === plan.id"
                                      @edit="editPlan(plan.id)"
                                      @delete="openDeletePopup(() => deletePlan(plan.id))"
                                      @download="openDownloadPopup(plan)" />
                        </div>

                        <!-- Open-Button bleibt im schmalen Layout sichtbar (eigene Zeile) -->
                        <div class="plan-row2">
                            <OpenButton class="primary-open mobile-open" title="Öffnen" @click="loadPlan(plan.id)" />
                        </div>
                    </div>

                </template>
            </Draggable>
        </div>

        <!-- Ausgewählter Trainingsplan -->
        <div v-if="selectedPlan" class="workout-list">
            <div class="plan-header">
                <h3 class="section-title" @dblclick="openEditPopup('selectedPlanName', selectedPlan.id)">
                    <span class="plan-title-main">
                        Trainingsplan: {{ selectedPlan.name }}
                    </span>

                    <div v-if="selectedPlan.code" class="plan-code-row">
                        <span class="plan-code-badge"
                              :title="`${selectedPlan.code} (Doppelklick zum Kopieren)`"
                              @dblclick.stop="copyPlanCode(selectedPlan.code)">
                            Code: {{ middleEllipsis(selectedPlan.code, 14) }}
                        </span>
                    </div>
                </h3>
                <CloseButton title="Plan schließen" @click="closePlan" />
            </div>
            <Table class="exercise-table full-width narrow" variant="narrow">
                <table ref="resizeTable" data-cols="3">
                    <thead>
                        <tr>
                            <th class="resizable" :style="{ width: columnWidths[0] + '%' }">
                                <span class="th-text">Übung</span>
                            </th>
                            <th class="resizable" :style="{ width: columnWidths[1] + '%' }">
                                <span class="th-text">
                                    {{ selectedPlan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                </span>
                            </th>
                            <th class="resizable th-wdh" :style="{ width: columnWidths[2] + '%' }">
                                <span class="th-text th-label">
                                    <span class="full">
                                        {{
selectedPlan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
          ? 'Wdh. / km / s'
          : 'Wiederholungen'
                                        }}
                                    </span>
                                    <span class="mid">
                                        {{
selectedPlan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
          ? 'Wdh./km/s'
          : 'Wiederhol...'
                                        }}
                                    </span>
                                    <span class="short">
                                        {{
selectedPlan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
          ? 'W/km/s'
          : 'Wdh.'
                                        }}
                                    </span>
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="(ex, index) in selectedPlan.exercises" :key="index" class="resizable-row" :style="{ height: rowHeights[index] + 'px' }" @dblclick="openEditPopup('selectedPlan', index, $event)">
                            <td :style="{ width: columnWidths[0] + '%' }">{{ ex.exercise }}</td>

                            <!-- Sätze/Min -->
                            <td :style="{ width: columnWidths[1] + '%' }">
                                {{ ex.type === 'ausdauer' ? `${ex.sets} min` : ex.sets }}
                            </td>

                            <!-- Wdh./km/s -->
                            <td :style="{ width: columnWidths[2] + '%' }">
                                <template v-if="ex.type === 'ausdauer'">
                                    {{ ex.reps ? `${ex.reps} km` : '-' }}
                                </template>
                                <template v-else-if="ex.type === 'dehnung'">
                                    {{ ex.reps }} s
                                </template>
                                <template v-else>
                                    {{ ex.reps }}
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Table>

            <button v-if="customExercises.length > 0"
                    type="button"
                    class="custom-toggle-btn"
                    :class="{ on: showCustomExercises }"
                    :aria-expanded="showCustomExercises"
                    @click="toggleCustomExercises">
                <span class="custom-toggle-text">
                    {{ showCustomExercises ? 'Benutzerdefinierte Übungen ausblenden' : 'Benutzerdefinierte Übungen anzeigen' }}
                </span>
                <span class="custom-toggle-arrow" aria-hidden="true"></span>
            </button>
            <div v-if="showCustomExercises">
                <h3 class="section-title">Eigene Übungen</h3>
                <Table class="exercise-table full-width narrow" variant="narrow">
                    <table ref="customResizeTable" data-cols="4">
                        <thead>
                            <tr>
                                <th class="resizable" :style="{ width: customColWidths[0] + '%' }">
                                    <span class="th-text">Name</span>
                                </th>
                                <th class="resizable th-muskel" :style="{ width: customColWidths[1] + '%' }">
                                    <span class="th-text th-label">
                                        <span class="full">Muskelgruppe</span>
                                        <span class="mid">Muskelgr...</span>
                                        <span class="short">Muskel...</span>
                                    </span>
                                </th>
                                <th class="resizable" :style="{ width: customColWidths[2] + '%' }">
                                    <span class="th-text">Typ</span>
                                </th>
                                <th :style="{ width: customColWidths[3] + '%' }">Aktion</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(ex, i) in customExercises" :key="i">
                                <td :style="{ width: customColWidths[0] + '%' }"
                                    @dblclick="openEditPopup('customExerciseName', i)">
                                    <span>{{ ex.name }}</span>
                                </td>
                                <td class="v-stack"
                                    :style="{ width: customColWidths[1] + '%' }"
                                    @dblclick="openEditPopup('customExerciseMuscle', i)">
                                    <span>{{ ex.muscle }}</span>
                                </td>

                                <td :style="{ width: customColWidths[2] + '%' }" @dblclick="openEditPopup('customExerciseType', i)">
                                    {{ typeLabel(ex.type) }}
                                </td>

                                <td class="action-cell">
                                    <DeleteButton class="table-delete-btn"
                                                  title="Benutzerdefinierte Übung entfernen"
                                                  @click="removeCustomExercise(i)" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </Table>
            </div>
        </div>
        <!-- Satzpausen-Timer -->
        <TimerComponent :dragDelay="dragDelay"
                        :startTimer="startTimer"
                        :stopTimer="stopTimer"
                        :resetTimer="resetTimer"
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
                     @confirm="confirmDownload"
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
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
    import { jsPDF } from 'jspdf';
    import Draggable from 'vuedraggable';
    import Toast from '@/components/ui/Toast.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import EditPopup from '@/components/ui/popups/EditPopup.vue'
    import EditButton from '@/components/ui/buttons/EditButton.vue'
    import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
    import ActionIconButton from '@/components/ui/buttons/ActionIconButton.vue'
    import OpenButton from '@/components/ui/buttons/OpenButton.vue'
    import CloseButton from '@/components/ui/buttons/CloseButton.vue'
    import ExportPopup from '@/components/ui/popups/ExportPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import TimerComponent from '@/components/ui/training/TimerComponent.vue'
    import StopwatchComponent from '@/components/ui/training/StopwatchComponent.vue'
    import PlanMenu from '@/components/ui/menu/PlanMenu.vue'
    import UiSearch from '@/components/ui/kits/UiSearch.vue';
    import TrainingPlanBuilder from '@/components/ui/training/TrainingPlanBuilder.vue'

    import { useTrainingPlansStore } from "@/store/trainingPlansStore";
    import { useAuthStore } from '@/store/authStore';
    import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "@/types/TrainingPlan";
    import type { TimerInstance } from '@/types/training';
    import {
        LS_AUTH_TOKEN,
        LS_TRAINING_FOCUS_ID,
        LS_TRAINING_FOCUS_TYPE,
        LS_TRAINING_OPEN_PLAN_ID,
        LS_STICKY_TIMER_ENABLED,
        LS_STICKY_STOPWATCH_ENABLED,
    } from '@/constants/storageKeys'
    import Table from '@/components/ui/kits/UiTable.vue'

    // Typ-Definitionen (bleiben unverändert)
    interface PlanExercise {
        exercise: string;
        sets: number;
        reps: number;
        goal?: string;
        type?: 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung';
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

    const props = defineProps<{
        timers: TimerInstance[]
        startTimer: (timer: TimerInstance) => void
        stopTimer: (timer: TimerInstance) => void
        resetTimer: (timer: TimerInstance) => void
        removeTimer: (id: string) => void
        stopwatches?: any[]
    }>();

    const emit = defineEmits<{
        (e: 'remove-timer', id: string): void;
        (e: 'add-timer', timer: TimerInstance): void;
        (e: 'reorder-timers', list: TimerInstance[]): void;
        (e: 'reorder-stopwatches', list: any[]): void;
    }>();

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

    const onReorderTimers = (list: TimerInstance[]) => emit('reorder-timers', list);
    const onAddTimerFromChild = (timer: TimerInstance) => emit('add-timer', timer)
    const onRemoveTimerFromChild = (id: string) => emit('remove-timer', id)

    // NEU: gemeinsamer Typ für Übungskategorien
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer';
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>;

    let onBeforeUnload: (() => void) | null = null
    let onVisChange: (() => void) | null = null

    const trainingPlansStore = useTrainingPlansStore();

    const auth = useAuthStore()

    const hardResetTrainingUi = () => {
        // Store leeren -> UI direkt clean
        try { trainingPlansStore.$reset() } catch { }

        closePlanMenu()
        selectedPlan.value = null
        planSearch.value = ''
        rowHeights.value = []
        showCustomExercises.value = false
        customExercises.value = []

        // Builder sauber resetten (weil der State jetzt dort lebt)
        builderRef.value?.clearEditMode?.()
        builderRef.value?.resetBuilder?.()
    }

    const LS_FAV_ORDER = "LS_TRAINING_FAV_ORDER_IDS";

    const readFavOrder = (): string[] => {
        try {
            const raw = localStorage.getItem(LS_FAV_ORDER);
            const arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.filter(x => typeof x === "string") : [];
        } catch { return []; }
    };

    const writeFavOrder = (ids: string[]) => {
        localStorage.setItem(LS_FAV_ORDER, JSON.stringify(ids));
    };

    const toPlanExercise = (ex: any): PlanExercise => ({
        exercise: ex.name,
        sets: ex.sets ?? 0,
        reps: ex.reps ?? 0,
        type: (ex.category === 3 ? "ausdauer" : ex.category === 2 ? "dehnung" : ex.category === 1 ? "calisthenics" : "kraft"),
    });

    const flattenDto = (p: TrainingPlanDto): ViewPlan => {
        const flat: PlanExercise[] = [];
        for (const d of (p.days ?? [])) {
            for (const ex of (d.exercises ?? [])) flat.push(toPlanExercise(ex));
        }

        // ✅ Falls loadList keine days liefert: nimm Count-Feld aus DTO (wenn vorhanden)
        const fallbackCount =
            Number((p as any)?.exerciseCount ?? (p as any)?.exercisesCount ?? (p as any)?.exercise_count ?? 0) || 0;

        const count = flat.length > 0 ? flat.length : fallbackCount;

        return {
            id: p.id,
            name: p.name,
            isFavorite: !!p.isFavorite,
            code: (p as any)?.code ?? null,
            exercises: flat,
            exerciseCount: count,
        };
    };

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

    const plans = computed<ViewPlan[]>(() => trainingPlansStore.items.map(flattenDto));

    const favoritePlans = computed<string[]>(() => {
        const items = trainingPlansStore.items as TrainingPlanDto[];

        const favIds = new Set(items.filter((p) => !!p.isFavorite).map((p) => p.id));
        const order = readFavOrder().filter((id) => favIds.has(id));

        const missing = (Array.from(favIds) as string[]).filter((id) => !order.includes(id));
        const next = [...order, ...missing];

        writeFavOrder(next);
        return next;
    });

    const selectedPlan = ref<ViewPlan | null>(null);
    const showDeletePopup = ref(false);
    const showEditPopup = ref(false);
    const showDownloadPopup = ref(false);
    const showValidationPopup = ref(false);
    const validationErrorMessages = ref<string[]>([]);
    const downloadPlan = ref<ViewPlan | null>(null);
    const downloadFormat = ref<'html' | 'pdf' | 'csv' | 'json' | 'txt'>('html');
    const customColWidths = ref([40, 30, 15, 15]); // Start: Name|Muskel|Typ|Aktion
    const customResizeTable = ref<HTMLTableElement | null>(null);
    const deleteAction = ref<(() => void) | null>(null);

    const planMenuOpenId = ref<string | null>(null);

    const togglePlanMenu = (id: string) => {
        planMenuOpenId.value = (planMenuOpenId.value === id) ? null : id;
    };

    const closePlanMenu = () => {
        planMenuOpenId.value = null;
    };

    const onDocClick = (e: MouseEvent) => {
        const el = e.target as HTMLElement | null;
        if (!el) return;

        if (el.closest('.plan-menu') || el.closest('.kebab-wrap')) return;

        // Klicks innerhalb des Toasts sollen das Menü NICHT schließen
        if (el.closest('.toast') || el.closest('.toast-container') || el.closest('[data-toast-root]')) return;

        closePlanMenu();
    };

    const columnWidths = ref([50, 25, 25]);
    const rowHeights = ref<number[]>([]);
    const planSearch = ref('');
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
    const editCellIndex = ref<number | null>(null);
    const showCustomExercises = ref(false);
    const customExercises = ref<Array<{ name: string; muscle: string; type: CustomExerciseType }>>([]);
    const toast = ref<AppToast | null>(null);
    let toastId = 0;

    let toastTimeout: number | null = null;
    let autoDismissRemainingMs = 0;
    let autoDismissStartedAt = 0;
    const isTimerSticky = ref(false); // Hinzugefügt für Sticky-Logik
    const isStopwatchSticky = ref(false); // Hinzugefügt für Sticky-Logik
    const resizeTable = ref<HTMLTableElement | null>(null);
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
        const type = localStorage.getItem(LS_TRAINING_FOCUS_TYPE)
        const id = localStorage.getItem(LS_TRAINING_FOCUS_ID)
        if (!type || !id) return

        const selector = type === 'timer'
            ? `.timer-card[data-timer-id="${id}"]`
            : `.timer-card[data-stopwatch-id="${id}"]`

        const focusIt = (attempts = 0) => {
            const el = document.querySelector(selector) as HTMLElement | null
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                el.classList.add('flash-focus')
                setTimeout(() => el.classList.remove('flash-focus'), 1500)
                // Flags weg
                localStorage.removeItem(LS_TRAINING_FOCUS_TYPE)
                localStorage.removeItem(LS_TRAINING_FOCUS_ID)
            } else if (attempts < 20) {
                // UI ist noch nicht gemountet → kurz retry
                requestAnimationFrame(() => focusIt(attempts + 1))
            }
        }

        // einmal nach DOM-Render probieren
        nextTick(() => focusIt())
    }

    const isMobile = ref(false)
    const dragDelay = computed(() => 0)
    const dragFilter =
        '.inline-actions, .inline-actions *, .kebab-wrap, .kebab-wrap *, .timer-actions, .timer-actions *, button, select, input, textarea, a'


    const stickyTimerEnabled = ref(true)
    const stickyStopwatchEnabled = ref(true)

    const readBoolLS = (key: string, fallback = true) => {
        const raw = localStorage.getItem(key)
        if (raw == null) return fallback
        const v = raw.trim().toLowerCase()
        if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true
        if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false
        return fallback
    }

    const syncStickyPrefsFromStorage = () => {
        stickyTimerEnabled.value = readBoolLS(LS_STICKY_TIMER_ENABLED, true)
        stickyStopwatchEnabled.value = readBoolLS(LS_STICKY_STOPWATCH_ENABLED, true)
        nextTick(() => checkScroll())
    }

    let mq: MediaQueryList | null = null
    const onMedia = (e: MediaQueryListEvent | MediaQueryList) => {
        // @ts-ignore - legacy: unify types

        isMobile.value = !!e.matches
    }

    onMounted(() => {
        syncStickyPrefsFromStorage()
        document.addEventListener('visibilitychange', syncStickyPrefsFromStorage)
        window.addEventListener('storage', syncStickyPrefsFromStorage)

        if (typeof window !== 'undefined') {
            mq = window.matchMedia('(max-width: 560px)')
            onMedia(mq)
            try { mq.addEventListener('change', onMedia as any) } catch { mq.addListener(onMedia as any) }
        }
    })

    onUnmounted(() => {
        document.removeEventListener('visibilitychange', syncStickyPrefsFromStorage)
        window.removeEventListener('storage', syncStickyPrefsFromStorage)

        if (mq) {
            try { mq.removeEventListener('change', onMedia as any) } catch { mq.removeListener(onMedia as any) }
        }
    })

    const favoritePlanItems = computed<ViewPlan[]>({
        get() {
            const map = new Map(plans.value.map(p => [p.id, p]));
            return favoritePlans.value.map(id => map.get(id)).filter(Boolean) as ViewPlan[];
        },
        set(newArr) {
            writeFavOrder(newArr.map(p => p.id));
        }
    });

    const makeId = () => {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    };

    const otherPlanItems = computed<ViewPlan[]>({
        get() {
            const fav = new Set(favoritePlans.value);
            return plans.value.filter(p => !fav.has(p.id));
        },
        set(_) {
        }
    });

    const planMatchesSearch = (plan: ViewPlan) => {
        const q = planSearch.value.toLowerCase().trim();
        return !q
            || plan.name.toLowerCase().includes(q)
            || plan.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(q));
    };

    const editPopupTitle = computed(() => {
        if (editType.value === 'customExerciseType') return 'Übungstyp bearbeiten';
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return 'Planname bearbeiten';
        if (editType.value === 'customExerciseName') return 'Übungsname bearbeiten';
        if (editType.value === 'customExerciseMuscle') return 'Muskelgruppe bearbeiten';
        if (editCellIndex.value === 0) return 'Übung bearbeiten';
        if (editCellIndex.value === 1) return 'Sätze / Minuten bearbeiten';
        if (editCellIndex.value === 2) return 'Wiederholungen / Kilometer bearbeiten';
        return 'Bearbeiten';
    });

    const editOptions = computed(() => {
        if (editType.value === 'customExerciseType') {
            return [
                { label: 'Kraft', value: 'kraft' },
                { label: 'Calisthenics', value: 'calisthenics' },
                { label: 'Dehnung', value: 'dehnung' },
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
        if (editType.value === 'customExerciseType') return 'Typ: kraft | calisthenics | dehnung';
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return 'Neuer Planname (3-20 Zeichen)';
        if (editType.value === 'customExerciseName') return 'Neuer Übungsname (max. 50 Zeichen)';
        if (editType.value === 'customExerciseMuscle') return 'Neue Muskelgruppe (max. 50 Zeichen)';
        if (editCellIndex.value === 0) return 'Neue Übung';
        if (editCellIndex.value === 1) return 'Neue Sätze (1-20)';
        if (editCellIndex.value === 2) return 'Neue Wiederholungen (1-50)';
        return 'Neuer Wert';
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
                    plans: plans.value,
                    favoritePlans: favoritePlans.value,
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

    const openValidationPopup = (errors: string[]) => {
        validationErrorMessages.value = Array.isArray(errors) ? errors : [String(errors)];
        showValidationPopup.value = true;
    };


    const closeValidationPopup = () => {
        showValidationPopup.value = false;
        validationErrorMessages.value = [];
    };

    const toggleFavoritePlan = async (planId: string) => {
        const p = trainingPlansStore.items.find((x: TrainingPlanDto) => x.id === planId);
        if (!p) return;

        const nextFav = !p.isFavorite;
        await trainingPlansStore.toggleFavorite(planId);

        const order = readFavOrder().filter(id => id !== planId);
        if (nextFav) order.unshift(planId);
        writeFavOrder(order);

        addToast(nextFav ? "Plan zu Favoriten hinzugefügt" : "Plan aus Favoriten entfernt", nextFav ? "add" : "delete");
    };

    const mapTypeToCategory = (t?: PlanExercise["type"]) => {
        if (t === "calisthenics") return 1;
        if (t === "dehnung") return 2;
        if (t === "ausdauer") return 3;
        return 0;
    };

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
    const editPlan = async (planId: string) => {
        try {
            await trainingPlansStore.loadOne(planId)
            const dto = trainingPlansStore.selected
            if (!dto) { addToast("Plan nicht gefunden", "delete"); return }

            const view = flattenDto(dto)

            // ✅ Builder übernimmt Edit-State komplett
            builderRef.value?.setEditMode({
                planId,
                name: view.name,
                exercises: [...view.exercises],
            })

            // optional: du willst den Plan trotzdem unten „geöffnet“ lassen
            selectedPlan.value = view
            rowHeights.value = Array(view.exercises.length).fill(40)

            addToast("Plan wird bearbeitet", "save")
            await nextTick()
            builderRef.value?.scrollToBuilder()
        } catch {
            addToast("Plan konnte nicht geladen werden", "delete")
        }
    }

    const deletePlan = async (planId: string) => {
        try {
            await trainingPlansStore.remove(planId);
            writeFavOrder(readFavOrder().filter(id => id !== planId));
            if (selectedPlan.value?.id === planId) selectedPlan.value = null;
            addToast("Trainingsplan gelöscht", "delete");
        } catch (e: any) {
            addToast(e?.message ?? "Löschen fehlgeschlagen", "delete");
        }
    };

    const loadPlan = async (planId: string) => {
        closePlanMenu();
        try {
            await trainingPlansStore.loadOne(planId);
            const dto = trainingPlansStore.selected;
            if (!dto) { addToast("Plan nicht gefunden", "delete"); return; }

            selectedPlan.value = flattenDto(dto);
            rowHeights.value = Array(selectedPlan.value.exercises.length).fill(40);
            columnWidths.value = [50, 25, 25];
            addToast("Plan geladen", "load");
        } catch {
            addToast("Plan konnte nicht geladen werden", "delete");
        }
    };

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

    const closePlan = () => {
        closePlanMenu(); // NEU
        selectedPlan.value = null;
        columnWidths.value = [50, 25, 25];
        rowHeights.value = [];
        addToast('Plan geschlossen', 'load');
    };


    const openDownloadPopup = (plan: TrainingPlan) => {
        downloadPlan.value = plan;
        downloadFormat.value = 'html';
        showDownloadPopup.value = true;
    };

    const closeDownloadPopup = () => {
        showDownloadPopup.value = false;
        downloadPlan.value = null;
        downloadFormat.value = 'html';
    };

    const confirmDownload = () => {
        if (!downloadPlan.value) return;
        const plan = downloadPlan.value;

        // Header dynamisch wie im UI
        const anyCardio = plan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer');
        const anyStretch = plan.exercises.some((ex: PlanExercise) => ex.type === 'dehnung');

        const setsHeader = anyCardio ? 'Sätze / Min' : 'Sätze';
        const repsHeader = (anyCardio || anyStretch) ? 'Wdh. / km / s' : 'Wiederholungen';

        // Zellen-Formatter mit Einheiten
        const fmtSets = (ex: PlanExercise) => ex.type === 'ausdauer' ? `${ex.sets} min` : `${ex.sets}`;
        const fmtReps = (ex: PlanExercise) => {
            if (ex.type === 'ausdauer') return ex.reps ? `${ex.reps} km` : '-';
            if (ex.type === 'dehnung') return `${ex.reps} s`;
            return `${ex.reps}`;
        };

        const uniqueGoal = [...new Set(plan.exercises.map((ex: PlanExercise) => ex.goal).filter(Boolean))][0] as string | undefined;
        const title = plan.name;
        const fileName = plan.name;

        if (downloadFormat.value === 'html') {
            const htmlContent = `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
      h1 { color: #4B6CB7; text-align: left; }
      table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px 0; }
      th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
      th { background: #333; color: #fff; }
      tr:nth-child(even) { background: #f9fafb; }
      tr:hover { background: #e2e8f0; }
      td { color: #4b5563; }
      .muted { color: #6b7280; font-size: 0.9em; }
    </style>
  </head>
  <body>
    <h1>${title}${uniqueGoal ? ` <span class="muted">(${uniqueGoal})</span>` : ''}</h1>
    <table>
      <tr>
        <th>Übung</th>
        <th>${setsHeader}</th>
        <th>${repsHeader}</th>
      </tr>
      ${plan.exercises.map(ex => `
        <tr>
          <td>${ex.exercise}</td>
          <td>${fmtSets(ex)}</td>
          <td>${fmtReps(ex)}</td>
        </tr>
      `).join('')}
    </table>
  </body>
</html>`;
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}_Trainingsplan.html`;
            link.click();
            URL.revokeObjectURL(link.href);

        } else if (downloadFormat.value === 'pdf') {
            const doc = new jsPDF();
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(16);
            doc.text(title + (uniqueGoal ? ` (${uniqueGoal})` : ''), 20, 20);
            doc.setFontSize(12);
            let y = 40;
            doc.text(['Übung', setsHeader, repsHeader].join(' | '), 20, y);
            y += 10;
            plan.exercises.forEach(ex => {
                doc.text([ex.exercise, fmtSets(ex), fmtReps(ex)].join(' | '), 20, y);
                y += 10;
            });
            doc.save(`${fileName}_Trainingsplan.pdf`);

        } else if (downloadFormat.value === 'csv') {
            const header = ['Übung', setsHeader, repsHeader];
            const rows = plan.exercises.map(ex => [
                ex.exercise,
                fmtSets(ex),
                fmtReps(ex),
            ]);
            const csv = [header.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}_Trainingsplan.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

        } else if (downloadFormat.value === 'json') {
            const json = plan.exercises.map(ex => ({
                exercise: ex.exercise,
                sets: ex.sets,
                sets_unit: ex.type === 'ausdauer' ? 'min' : 'sets',
                reps: ex.reps,
                reps_unit: ex.type === 'ausdauer' ? 'km' : (ex.type === 'dehnung' ? 's' : 'reps'),
                type: ex.type ?? 'kraft',
                goal: ex.goal ?? null,
            }));
            const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}_Trainingsplan.json`;
            link.click();
            URL.revokeObjectURL(link.href);

        } else if (downloadFormat.value === 'txt') {
            const lines = [
                `Trainingsplan: ${title}${uniqueGoal ? ` (${uniqueGoal})` : ''}`,
                '',
                `Übung\t${setsHeader}\t${repsHeader}`,
                ...plan.exercises.map(ex => `${ex.exercise}\t${fmtSets(ex)}\t${fmtReps(ex)}`)
            ].join('\n');
            const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}_Trainingsplan.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
        }

        addToast('Plan heruntergeladen', 'load');
        closeDownloadPopup();
    };

    const openDeletePopup = (action: () => void) => {
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
            message,
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
            const plan = plans.value.find(p => p.id === index);
            if (!plan) { openValidationPopup(['Plan nicht gefunden']); return; }
            editValue.value = plan.name;
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
                const sets = Number(editValue.value)
                const setsError = validateSets(sets)
                if (setsError) { openValidationPopup([setsError]); return }
                builderRef.value?.updatePreviewExercise?.(i, { sets })
                addToast('Sätze aktualisiert', 'save')
            } else if (editCellIndex.value === 2) {
                const reps = Number(editValue.value)
                const repsError = validateReps(reps)
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
                const sets = Number(editValue.value);
                const setsError = validateSets(sets);
                if (setsError) { openValidationPopup([setsError]); return; }
                exercise.sets = sets;
                updatePlanInStorage();
                addToast('Sätze aktualisiert', 'save');
            } else if (editCellIndex.value === 2) {
                const reps = Number(editValue.value);
                const repsError = validateReps(reps);
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
            const validatedName = validatePlanName(editValue.value);
            if (validatedName === false) {
                openValidationPopup([
                    editValue.value.trim().length < 3
                        ? 'Planname muss mindestens 3 Zeichen lang sein'
                        : 'Planname darf maximal 20 Zeichen lang sein'
                ]);
                return;
            }

            setPlanNameInStore(editIndex.value, validatedName);
            addToast('Planname aktualisiert', 'save');
        } else if (editType.value === 'selectedPlanName' && selectedPlan.value) {
            const validatedName = validatePlanName(editValue.value);
            if (validatedName === false) {
                openValidationPopup([
                    editValue.value.trim().length < 3
                        ? 'Planname muss mindestens 3 Zeichen lang sein'
                        : 'Planname darf maximal 20 Zeichen lang sein'
                ]);
                return;
            }

            setPlanNameInStore(selectedPlan.value.id, validatedName);
            addToast('Planname aktualisiert', 'save');
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
        const { type, id } = (e as CustomEvent<{ type: 'timer' | 'stopwatch'; id: string }>).detail
        localStorage.setItem(LS_TRAINING_FOCUS_TYPE, type)
        localStorage.setItem(LS_TRAINING_FOCUS_ID, id)
        nextTick(() => tryFocusFromStorage())
    }

    onMounted(() => {
        window.addEventListener('training:focus', onTrainingFocus as EventListener)
    })

    onUnmounted(() => {
        window.removeEventListener('training:focus', onTrainingFocus as EventListener)
        if (toastTimeout) { window.clearTimeout(toastTimeout as any); toastTimeout = null; }

    })

    const updatePlanInStorage = () => {
        saveToStorage();
    };

    const persistPlanName = async (planId: string, newName: string) => {
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


    const setPlanNameInStore = (planId: string, newName: string) => {
        const dto = trainingPlansStore.items.find((p: TrainingPlanDto) => p.id === planId);
        if (dto) dto.name = newName;

        if (trainingPlansStore.selected?.id === planId) {
            (trainingPlansStore.selected as any).name = newName;
        }

        if (selectedPlan.value?.id === planId) {
            selectedPlan.value.name = newName;
        }

        // ✅ WICHTIG: Server persistieren (damit Refresh stimmt)
        void persistPlanName(planId, newName);

        // dein bisheriger Account-Sync kann bleiben
        saveToStorage();
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
            const stickyTimers = props.timers.filter(t => t.shouldStaySticky)
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
            const stickyStopwatches = (props.stopwatches ?? []).filter((sw: any) => sw.shouldStaySticky)
            let visibleStopwatchFound = false

            for (const sw of stickyStopwatches) {
                const el = document.querySelector(`.timer-card[data-stopwatch-id="${sw.id}"]`) as HTMLElement | null
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


    let headerRO: ResizeObserver | null = null;

    function applyHeaderState(th: HTMLElement) {
        const label = th.querySelector('.th-label') as HTMLElement | null;
        if (!label) return;
        const w = th.clientWidth;
        label.classList.remove('is-full', 'is-mid', 'is-short');
        const SHORT = 80;   // <=80px -> "short"
        const MID = 120;  // <=120px -> "mid"
        if (w <= SHORT) label.classList.add('is-short');
        else if (w <= MID) label.classList.add('is-mid');
        else label.classList.add('is-full');
    }

    function setupHeaderShorteningFallback() {
        // erst alte Observer lösen
        headerRO?.disconnect();
        headerRO = new ResizeObserver((entries) => {
            entries.forEach(entry => applyHeaderState(entry.target as HTMLElement));
        });

        // Alle relevanten THs aus beiden Tabellen (Wdh + Muskel)
        const ths = Array.from(document.querySelectorAll('th.th-wdh, th.th-muskel')) as HTMLElement[];
        ths.forEach(th => {
            applyHeaderState(th);     // Initial
            headerRO!.observe(th);    // Beobachten
        });
    }

    function teardownHeaderShorteningFallback() {
        headerRO?.disconnect();
        headerRO = null;
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


    // Öffnet ggf. einen von außerhalb gewählten Plan
    const tryOpenPlanFromStorage = () => {
        const id = localStorage.getItem(LS_TRAINING_OPEN_PLAN_ID)
        if (id) {
            loadPlan(id)
            localStorage.removeItem(LS_TRAINING_OPEN_PLAN_ID)
        }
    }

    watch(() => [props.timers, props.stopwatches], () => {
        nextTick(() => checkScroll());
    }, { deep: true });

    watch(planSearch, () => closePlanMenu());

    const syncFullscreenClass = () => {
        const isFs = !!document.fullscreenElement;
        document.documentElement.classList.toggle('is-fullscreen', isFs);
    };
    // Eigene Übungen: bei Datenänderungen und wenn sichtbar
    watch(customExercises, () => {
        if (showCustomExercises.value) {
            nextTick(() => {
                initCustomResizeTable();
                setupHeaderShorteningFallback();
            });
        }
    }, { deep: true });

    watch(
        () => selectedPlan.value?.exercises.map(e => `${e.exercise}|${e.sets}|${e.reps}|${e.type}`).join(';'),
        () => nextTick(() => initResizeTable())
    )
    // wenn der ausgewählte Plan geladen/geschlossen wird → Tabelle wechselt
    watch(selectedPlan, (val) => {
        if (val) nextTick(() => { initResizeTable(); setupHeaderShorteningFallback(); });
        else nextTick(() => setupHeaderShorteningFallback());
    });

    // wenn die Custom-Übungen eingeblendet werden → Tabelle erscheint
    watch(showCustomExercises, (val) => {
        if (val) nextTick(() => { initCustomResizeTable(); setupHeaderShorteningFallback(); });
    });

    watch(() => auth.user, async (u) => {
        if (!u) {
            hardResetTrainingUi()
            return
        }
        // login -> frisch neu laden
        await trainingPlansStore.loadList()
    }, { immediate: true })

    onMounted(async () => {
        if (!auth.user) {
            hardResetTrainingUi()
            return
        }
        await trainingPlansStore.loadList();

        tryFocusFromStorage()

        document.addEventListener('click', onDocClick)
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

        initResizeTable();
        if (showCustomExercises.value) initCustomResizeTable();

        setupHeaderShorteningFallback();
        tryOpenPlanFromStorage();
    });

    onUnmounted(() => {
        document.removeEventListener('click', onDocClick)
        window.removeEventListener('scroll', checkScroll)
        window.removeEventListener('keydown', handleKeydown)
        document.removeEventListener('fullscreenchange', syncFullscreenClass)
        window.removeEventListener('auth:logout', hardResetTrainingUi as EventListener)

        if (onBeforeUnload) window.removeEventListener('beforeunload', onBeforeUnload)
        if (onVisChange) document.removeEventListener('visibilitychange', onVisChange)

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
        background: transparent; /* globale Fläche (Landing-Gradient) scheint durch */
        width: 100%;
        max-width: 100%; /* verhindert Overflow */
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin-top: 0;
        min-height: 100dvh;
        margin-inline: auto;
        overflow-x: visible; /* keine abgeschnittenen Glows/Outlines */
        box-sizing: border-box;
    }

    html.dark-mode .training {
        background: transparent; /* Dark-Gradient vom Layout bleibt sichtbar */
    }

    .page-title {
        font-size: 2.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-align: center;
        color: var(--text-primary);
        letter-spacing: -0.025em;
    }

    .workout-list {
        margin-top: 0.5rem;
        width: 100%;
        max-width: var(--section-max);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 0.5rem; /* reduziert von 1rem */
        box-sizing: border-box;
        overflow-x: visible; /* keine abgeschnittenen Schatten/Tables */
    }

    @media (max-width: 1240px) {
        .workout-list {
            max-width: var(--section-max);
        }
    }

    @media (min-width: 1241px) {
        .training {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }

            .training .workout-list {
                max-width: var(--section-max); /* fix: keine 100vw-Logik */
                width: 100%;
                margin: 0 auto;
            }
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }

    .plan-search {
        margin-bottom: 1rem;
    }

    @media (prefers-reduced-motion: reduce) {
        .builder-landing {
            animation: none;
        }
    }

    html.dark-mode .section-title {
        color: #ffffff;
    }

    .plan-header {
        display: grid;
        grid-template-columns: 1fr auto 1fr; /* links spacer | mitte title | rechts close */
        align-items: center;
        width: 100%;
        position: relative;
    }

        .plan-header > .section-title {
            grid-column: 2;
            justify-self: center;
            text-align: center;
        }

        .plan-header > :not(.section-title) {
            grid-column: 3;
            justify-self: end;
        }

    .drag-ghost {
        opacity: 0.6;
    }

    /* Zelle wird selbst Container → reagiert auf ihre eigene Breite */
    .v-stack {
        container-type: inline-size;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }

    /* Stelle sicher: mittlere Spalte darf schrumpfen */
    .plan-item > .plan-row1 {
        display: grid !important;
        grid-template-columns: auto minmax(0,1fr) auto; /* <- minmax(0,1fr) ist key */
        align-items: center;
        gap: .5rem;
    }

    /* Titel darf nie wachsen, sondern ellipsen */
    .plan-title {
        display: block; /* stabil */
        min-width: 0; /* !!! ohne das bricht ellipsis oft */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        /* dezenter Fade statt hartem Schnitt (modern, unkritisch) */
        -webkit-mask-image: linear-gradient(to right, #000 80%, transparent);
        mask-image: linear-gradient(to right, #000 80%, transparent);
    }

    /* Buttons rechts dürfen nie umbrechen */
    .plan-right {
        display: inline-flex;
        gap: .5rem;
        align-items: center;
        white-space: nowrap; /* kein Umbruch in den Actions */
    }


    @media (max-width: 1240px) {
        .training {
            overflow-x: visible; /* lässt Inhalt sauber raus, ohne Scrollbars zu blocken */
        }

        .workout-list {
            max-width: 100%;
            min-width: 0;
            width: 100%;
        }
    }

    .list-item {
        background: var(--bg-card);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: transform 0.2s;
    }

    html.dark-mode .list-item {
        background: #1c2526;
        color: #c9d1d9;
    }

    .list-item:hover {
        transform: translateY(-2px);
    }

    .plan-item {
        cursor: pointer;
    }

    @supports not (overflow: clip) {
        .training,
        .workout-list {
            overflow-x: visible; /* auch in älteren Browsern keine abgeschnittenen Effekte */
        }
    }

    :root {
        --clip-margin: 8px;
    }

    .plan-title {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        min-width: 0;
        max-width: 100%;
        -webkit-mask-image: none;
        mask-image: none;
        text-overflow: clip;
    }

        .plan-title .plan-name-scroll {
            display: block;
            flex: 1 1 auto;
            min-width: 0;
            white-space: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; /* Firefox: keine Scrollbar */
        }

            .plan-title .plan-name-scroll::-webkit-scrollbar {
                display: none; /* WebKit: keine Scrollbar */
            }

        .plan-title .plan-count {
            flex: 0 0 auto;
            white-space: nowrap;
        }

    @media (max-width: 560px) {
        .plan-drag-handle {
            display: none;
        }
    }

    .plan-drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
    }

        .plan-drag-stack > .plan-item {
            width: 100%;
        }

    html.dark-mode .training {
        --resize-color: #64748b; /* slate-500 */
        --resize-color-hover: #3b82f6; /* blue-500 */
    }

    .list-item-actions .action-btn {
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .custom-toggle-btn {
        margin-top: 1rem;
        height: var(--control-height);
        padding: 0 var(--control-padding-x);
        border-radius: 999px;
        width: fit-content;
        max-width: 100%;
        inline-size: min(var(--custom-toggle-w), 100%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .55rem;
        font-weight: 700;
        font-size: .92rem;
        letter-spacing: -0.01em;
        color: var(--text-primary);
        cursor: pointer;
        user-select: none;
        background: radial-gradient(circle at 18% 35%, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 58%), radial-gradient(circle at 85% 70%, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, filter .15s ease;
    }

        .custom-toggle-btn .custom-toggle-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.6rem;
            height: 1.6rem;
            border-radius: 999px;
            background: color-mix(in srgb, var(--bg-card) 86%, #0f172a 14%);
            border: 1px solid rgba(148, 163, 184, 0.22);
            flex: 0 0 auto;
        }

        .custom-toggle-btn .custom-toggle-text {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

    @media (hover: hover) {
        .custom-toggle-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 36px rgba(15, 23, 42, 0.22);
            border-color: rgba(129, 140, 248, 0.55);
            filter: brightness(1.02);
        }
    }

    .custom-toggle-btn:active {
        transform: translateY(0);
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.16);
    }

    .custom-toggle-btn:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 22%, transparent), 0 16px 36px rgba(15, 23, 42, 0.22);
    }

    /* „On“-State: etwas satter + tiny glow */
    .custom-toggle-btn.on {
        border-color: rgba(129, 140, 248, 0.62);
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
    }

    html.dark-mode .custom-toggle-btn {
        background: radial-gradient(circle at 18% 35%, color-mix(in srgb, #6366f1 18%, transparent), transparent 58%), radial-gradient(circle at 85% 70%, color-mix(in srgb, #22c55e 12%, transparent), transparent 62%), rgba(2, 6, 23, 0.72);
        border-color: rgba(148, 163, 184, 0.34);
        box-shadow: 0 16px 42px rgba(0, 0, 0, 0.55);
    }

        html.dark-mode .custom-toggle-btn .custom-toggle-icon {
            background: rgba(2, 6, 23, 0.6);
            border-color: rgba(148, 163, 184, 0.28);
        }

    /* Karte selbst darf über Nachbarn stehen */
    .plan-item {
        position: relative;
    }

        /* Wenn Menü offen ist: Karte nach oben und kein Hover-Shift */
        .plan-item.menu-open {
            z-index: 999;
        }

            .plan-item.menu-open:hover {
                transform: none !important;
            }

    /* Menü noch darüber */
    .plan-menu {
        z-index: 1000;
    }

    .exercise-table.full-width th,
    .exercise-table.full-width td {
        padding: 1.5rem;
        text-align: center;
        min-width: 0; /* war 150px: verhindert Breiten-Inflation */
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .custom-toggle-btn {
        margin-left: auto;
        margin-right: auto;
    }

    .custom-toggle-arrow {
        width: 1.05rem;
        height: 1.05rem;
        flex: 0 0 auto;
        opacity: .92;
        transform: rotate(0deg);
        transition: transform .18s ease, opacity .18s ease, filter .18s ease;
        filter: drop-shadow(0 1px 0 rgba(0,0,0,.10));
    }

    @supports (mask-image: url("")) or (-webkit-mask-image: url("")) {
        .custom-toggle-arrow {
            background: currentColor;
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.7 9.3a1 1 0 0 1 1.4 0L12 13.2l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E");
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
            -webkit-mask-size: 100% 100%;
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.7 9.3a1 1 0 0 1 1.4 0L12 13.2l3.9-3.9a1 1 0 1 1 1.4 1.4l-4.6 4.6a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E");
            mask-repeat: no-repeat;
            mask-position: center;
            mask-size: 100% 100%;
        }
    }

    @supports not (mask-image: url("")) and not (-webkit-mask-image: url("")) {
        .custom-toggle-arrow {
            border-right: 2px solid currentColor;
            border-bottom: 2px solid currentColor;
            width: .6rem;
            height: .6rem;
            transform: rotate(45deg);
            filter: none;
        }
    }

    .custom-toggle-btn.on .custom-toggle-arrow {
        transform: rotate(180deg);
        opacity: 1;
    }

    .action-btn.plan-submit-btn {
        height: calc(var(--control-height) - 4px);
    }

    @media (max-width:560px) {
        .plan-item {
            display: flex !important;
        }

        .plan-row1 {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: .5rem;
            width: 100%;
        }

        .plan-title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .plan-right {
            display: inline-flex;
            align-items: center;
            gap: .25rem;
            flex-wrap: nowrap;
        }

        .inline-actions {
            display: inline-flex !important;
            gap: .25rem;
        }

        .kebab-wrap {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }

        .mobile-open, .plan-row2 {
            display: none !important;
        }

        .plan-menu {
            z-index: 1000;
        }
    }

    /* ========== Desktop/ab deinem Original-Breakpoint: alles in EINER Reihe ========== */

    .plan-title {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }

    @media (max-width:1024px) {
        .inline-actions {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }
    }

    @media (max-width:560px) {
        .plan-row2 {
            display: none !important;
        }

        .mobile-open {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }
    }

    .desktop-open {
        display: inline-flex;
    }

    .mobile-open {
        display: none;
    }

    /* ========== Ab dem Original-Mobile-Breakpoint (~560px): schalte auf Kebab + eigene Open-Zeile ========== */
    @media (max-width: 560px) {
        .plan-item {
            position: relative;
            display: grid;
            grid-template-rows: auto auto;
            gap: .5rem;
        }

        .inline-actions {
            display: none;
        }
        .desktop-open {
            display: inline-flex !important;
        }

        .mobile-open {
            display: none !important;
        }

        .plan-row2 {
            display: none;
        }

            .plan-row2 .primary-open {
                width: 100%;
            }

        .plan-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .plan-menu {
            position: absolute;
            right: .5rem;
            top: calc(100% + .55rem);
            display: flex;
            gap: .35rem;
            padding: .5rem;
            border-radius: 14px;
            border: 1px solid rgba(148, 163, 184, 0.28);
            background: radial-gradient(circle at 18% 30%, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 70%), color-mix(in srgb, var(--bg-card) 88%, white 12%);
            box-shadow: 0 18px 44px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255,255,255,0.08);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 1200;
        }

            .plan-menu > * {
                inline-size: auto;
            }
    }

    html.dark-mode .plan-menu {
        border-color: rgba(148, 163, 184, 0.34);
        background: radial-gradient(circle at 18% 30%, color-mix(in srgb, #6366f1 18%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, #22c55e 12%, transparent), transparent 70%), rgba(2, 6, 23, 0.78);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.05);
    }

    .plan-drag-handle {
        cursor: grab;
        margin-right: .5rem;
        user-select: none;
    }

    @media (max-width: 560px) {

        .list-item-actions {
            flex-wrap: wrap;
        }

        .workout-list {
            max-width: 100%;
            min-width: 0;
        }

        .workout-list {
            padding: 0 .5rem;
        }
    }

    .workout-list{
        width: 100%;
        max-width: var(--section-max);
        margin-inline: auto !important;
    }

    @media (max-width: 420px) {
        .training {
            --control-height: 44px;
            --control-padding-x: 1rem;
        }

        .workout-list {
            padding: 0 .5rem;
        }

        .page-title {
            font-size: 1.9rem;
        }

        .timer-display {
            font-size: 2.4rem;
        }

        .custom-toggle-btn {
            inline-size: min(var(--custom-toggle-w), 100%);
        }
    }

    .training,
    .workout-list {
        max-width: 100%;
        overflow-x: visible;
    }

    @media (max-width: 360px) {
        .page-title {
            font-size: 1.75rem;
        }
    }

    @media (max-width: 900px) {
        .plan-title .plan-count {
            display: none;
        }
    }

    .plan-row1 > .plan-title {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .plan-row1 > .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }

    @media (min-width:561px) and (max-width:1024px) {
        .inline-actions {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }

        .mobile-open {
            display: none !important;
        }
    }

    .plan-row1 {
        width: 100%;
        position: relative;
    }

    @media (min-width:1025px) {
        .plan-row1 .inline-actions {
            margin-left: auto;
        }
    }

    .plan-menu {
        position: absolute;
        right: .5rem;
        top: calc(100% + .5rem); /* unter der Zeile aufklappen */
        display: flex;
        gap: .35rem;
        padding: .45rem;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        box-shadow: 0 6px 18px rgba(0,0,0,.15);
        z-index: 50;
    }

        .plan-menu > * {
            inline-size: auto;
        }

    .plan-item > .plan-row1 {
        display: grid !important;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        width: 100%;
    }

        .plan-item > .plan-row1 .plan-drag-handle {
            grid-column: 1;
        }

        .plan-item > .plan-row1 .plan-title {
            grid-column: 2;
            justify-self: center;
            text-align: center;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .plan-item > .plan-row1 .plan-right {
            grid-column: 3;
            justify-self: end;
            display: inline-flex;
            align-items: center;
            gap: .5rem;
        }

        .plan-item > .plan-row1 .desktop-open {
            order: 3;
        }

    @media (max-width:1024px) {
        .plan-item > .plan-row1 .inline-actions {
            display: none !important;
        }

        .plan-item > .plan-row1 .desktop-open {
            display: inline-flex !important;
        }
    }

    @media (max-width:560px) {
        .plan-row2, .mobile-open {
            display: none !important;
        }
    }

    .plan-item {
        display: block; 
    }

        .plan-item > .plan-row1 {
            display: grid !important;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            width: 100%;
        }

            .plan-item > .plan-row1 .plan-title {
                justify-self: center;
                text-align: center;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .plan-item > .plan-row1 .plan-right {
                justify-self: end;
                display: inline-flex;
                align-items: center;
                gap: .5rem;
            }

    .plan-row2 {
        display: none;
    }

    @media (max-width:560px) {
        .plan-row2 {
            display: block;
        }

        .mobile-open {
            display: inline-flex !important;
        }

        .desktop-open {
            display: none !important;
        }
    }

    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }

    .kebab-wrap {
        display: none;
    }

    @media (max-width: 1024px) {
        .inline-actions {
            display: none !important;
        }

        .kebab-wrap {
            display: inline-flex !important;
        }
    }

    th .th-text > .resizer {
        position: absolute;
        top: 0;
        right: 0;
        width: var(--resize-hit, 10px);
        height: 100%;
        cursor: col-resize;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
    }

        th .th-text > .resizer::before {
            content: "";
            width: var(--resize-line, 1px);
            height: 100%;
            background: var(--resize-color, #94a3b8);
            opacity: .7;
            transition: transform .12s ease, background-color .12s ease, opacity .12s ease;
        }

        th .th-text > .resizer:hover::before,
        th .th-text > .resizer.is-active::before {
            background: var(--resize-color-hover, #60a5fa);
            opacity: 1;
            transform: scaleX(2);
        }

    .list-item.plan-item {
        position: relative;
        padding: 1.35rem 1.6rem; 
        border-radius: 18px;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        display: block; 
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    }

    @media (hover: hover) {
        .list-item.plan-item:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    html.dark-mode .list-item.plan-item {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    .plan-drag-stack .plan-item {
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
        will-change: transform;
    }

    .sortable-chosen {
        user-select: none;
    }

    .sortable-ghost,
    .drag-ghost {
        opacity: .85;
        transform: scale(.98);
    }

    .drag-chosen,
    .dragging,
    .sortable-chosen,
    .sortable-drag,
    .sortable-ghost {
        transition: none !important;
    }

    .sortable-drag {
        opacity: 0.98;
        cursor: grabbing;
        pointer-events: none;
    }

    .drag-ghost,
    .sortable-ghost {
        opacity: .4 !important;
    }

    .plan-drag-stack > *,
    .drag-stack > *,
    .list-item.plan-item {
        will-change: transform;
    }

    .dragging .list-item.plan-item {
        transform: none !important;
    }

    .plan-code-badge {
        margin-left: .5rem;
        padding: .15rem .45rem;
        border-radius: 999px;
        font-size: .8rem;
        opacity: .9;
        border: 1px solid rgba(255,255,255,.18);
    }

    .plan-code-copy {
        margin-left: .35rem;
    }

    /* Planname oben, Code immer drunter (ohne Wrap) */
    .plan-header .section-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .35rem;
        min-width: 0;
    }

    .plan-title-main {
        max-width: 100%;
        min-width: 0;
        white-space: nowrap; /* kein Wrap */
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .plan-code-row {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .35rem;
        white-space: nowrap; /* kein Wrap */
        max-width: 100%;
    }
    .plan-code-badge {
        cursor: copy;
        user-select: none;
    }

    /* mehr Luft zwischen Plan-Liste und Satzpausen-Timer */
    .plans-section {
        margin-top: 2.25rem;
        margin-bottom: 2.25rem;
    }

    /* optional: auf Mobile etwas weniger */
    @media (max-width: 560px) {
        .plans-section {
            margin-top: 1.75rem;
            margin-bottom: 1.75rem;
        }
    }

</style>