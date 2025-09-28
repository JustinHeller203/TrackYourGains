<template>
    <div class="training">
        <h2 class="page-title">💪 Training</h2>
        <!-- Trainingsplan Formular -->
        <div class="workout-list">
            <h3 class="section-title">Trainingsplan erstellen/bearbeiten</h3>
            <form @submit.prevent="createOrUpdatePlan" class="form-card">
                <input v-model="planName" placeholder="Planname (z.B. Push Day)" required class="plan-name-input" />
                <div class="exercise-input-group">
                    <input v-model="exerciseFilter" placeholder="Muskelgruppe" />
                    <select v-model="newExercise">
                        <option value="" disabled>Übung wählen</option>
                        <option v-for="ex in filteredExercises" :key="ex" :value="ex">{{ ex }}</option>
                        <option value="custom">Neue benutzerdefinierte Übung</option>
                    </select>
                    <input v-show="newExercise === 'custom'" v-model="customPlanExercise" placeholder="Eigene Übung eingeben" />
                    <input v-model.number="newReps" placeholder="Wiederholungen" type="number" min="1" />
                    <input v-model.number="newSets" placeholder="Sätze" type="number" min="1" />
                    <AddExerciseButton title="Übung hinzufügen"
                                       @click="addExerciseToPlan" />
                    <ExtrasToggleButton :toggled="showExtras"
                                        @click="toggleExtras">
                        {{ showExtras ? 'Extras ausblenden' : 'Extras einblenden' }}
                    </ExtrasToggleButton>
                    <div v-if="showExtras" class="extras-container show">
                        <div class="extras-content">
                            <select v-model="selectedGoal" class="goal-select">
                                <option value="" disabled>Trainingsziel</option>
                                <option v-for="goal in trainingGoals" :key="goal" :value="goal">{{ goal }}</option>
                            </select>
                        </div>
                    </div>
                    <PlanSubmitButton :isEditing="!!editingPlanId"
                                      :disabled="validatePlanName(planName) === false"
                                      createLabel="Plan erstellen"
                                      saveLabel="Plan speichern" />



                </div>
                <div v-if="selectedPlanExercises.length" class="exercise-table full-width">
                    <table>
                        <thead>
                            <tr>
                                <th>Übung</th>
                                <th>Sätze</th>
                                <th>Wiederholungen</th>
                                <th>Aktion</th>
                                <th v-if="selectedPlanExercises.some(ex => ex.goal)">Trainingsziel</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(ex, index) in selectedPlanExercises" :key="index" @dblclick="openEditPopup('table', index, $event)">
                                <td>{{ ex.exercise }}</td>
                                <td>{{ ex.sets }}</td>
                                <td>{{ ex.reps }}</td>
                                <td>
                                    <DeleteButton title="Übung entfernen"
                                                  :extraClass="'table-delete-btn transparent'"
                                                  @click="removeExerciseFromPlan(index)" />                                </td>
                                <td v-if="selectedPlanExercises.some(ex => ex.goal)">{{ ex.goal || '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
        </div>

        <div v-if="plans.length" class="workout-list">
            <h3 class="section-title">Deine Trainingspläne</h3>

            <div class="search-container">
                <input v-model="planSearch" placeholder="Nach Planname oder Trainingsziel suchen" class="plan-search-input" />
            </div>

            <!-- Favoriten sortieren -->
            <Draggable v-if="favoritePlanItems.length"
                       v-model="favoritePlanItems"
                       item-key="id"
                       handle=".plan-drag-handle"
                       :ghost-class="'drag-ghost'"
                       :animation="150"
                       :disabled="planSearch.trim().length > 0"
                       tag="div"
                       class="plan-drag-stack">
                <template #item="{ element: plan }">
                    <div v-if="planMatchesSearch(plan)" class="list-item plan-item" :key="plan.id">
                        <span class="plan-drag-handle" title="Ziehen zum Verschieben">⠿</span>
                        <span @click="loadPlan(plan.id)" @dblclick="openEditPopup('planName', plan.id)">
                            {{ plan.name }} ({{ plan.exercises.length }} Übungen)
                        </span>
                        <div class="list-item-actions">
                            <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                            :titleActive="'Aus Favoriten entfernen'"
                                            :titleInactive="'Zu Favoriten hinzufügen'"
                                            @toggle="toggleFavoritePlan(plan.id)" />
                            <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                            <DeleteButton title="Plan löschen"
                                          @click="openDeletePopup(() => deletePlan(plan.id))" />
                            <ActionIconButton title="Download"
                                              aria-label="Trainingsplan herunterladen"
                                              :extraClass="'download-btn'"
                                              @click="openDownloadPopup(plan)">
                                ⬇️
                            </ActionIconButton>
                            <OpenButton title="Öffnen" @click="loadPlan(plan.id)" />
                        </div>
                    </div>
                </template>
            </Draggable>

            <!-- Nicht-Favoriten sortieren -->
            <Draggable v-model="otherPlanItems"
                       item-key="id"
                       handle=".plan-drag-handle"
                       :ghost-class="'drag-ghost'"
                       :animation="150"
                       :disabled="planSearch.trim().length > 0"
                       tag="div"
                       class="plan-drag-stack">
                <template #item="{ element: plan }">
                    <div v-if="planMatchesSearch(plan)" class="list-item plan-item" :key="plan.id">
                        <span class="plan-drag-handle" title="Ziehen zum Verschieben">⠿</span>
                        <span @click="loadPlan(plan.id)" @dblclick="openEditPopup('planName', plan.id)">
                            {{ plan.name }} ({{ plan.exercises.length }} Übungen)
                        </span>
                        <div class="list-item-actions">
                            <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                            :titleActive="'Aus Favoriten entfernen'"
                                            :titleInactive="'Zu Favoriten hinzufügen'"
                                            @toggle="toggleFavoritePlan(plan.id)" />

                            <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                            <DeleteButton title="Plan löschen"
                                          @click="openDeletePopup(() => deletePlan(plan.id))" />
                            <ActionIconButton title="Download"
                                              aria-label="Trainingsplan herunterladen"
                                              :extraClass="'download-btn'"
                                              @click="openDownloadPopup(plan)">
                                ⬇️
                            </ActionIconButton>
                            <OpenButton title="Öffnen" @click="loadPlan(plan.id)" />
                        </div>
                    </div>
                </template>
            </Draggable>
        </div>

        <!-- Ausgewählter Trainingsplan -->
        <div v-if="selectedPlan" class="workout-list">
            <div class="plan-header">
                <h3 class="section-title" @dblclick="openEditPopup('selectedPlanName', selectedPlan.id)">
                    Trainingsplan: {{ selectedPlan.name }}
                </h3>
                <CloseButton title="Plan schließen" @click="closePlan" />
            </div>
            <div class="exercise-table full-width">
                <table ref="resizeTable">
                    <thead>
                        <tr>
                            <th class="resizable" :style="{ width: columnWidths[0] + '%' }">Übung</th>
                            <th class="resizable" :style="{ width: columnWidths[1] + '%' }">Sätze</th>
                            <th class="resizable" :style="{ width: columnWidths[2] + '%' }">Wiederholungen</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(ex, index) in selectedPlan.exercises" :key="index" class="resizable-row" :style="{ height: rowHeights[index] + 'px' }" @dblclick="openEditPopup('selectedPlan', index, $event)">
                            <td :style="{ width: columnWidths[0] + '%' }">{{ ex.exercise }}</td>
                            <td :style="{ width: columnWidths[1] + '%' }">{{ ex.sets }}</td>
                            <td :style="{ width: columnWidths[2] + '%' }">{{ ex.reps }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Benutzerdefinierte Übungen: JETZT direkt unter dem geöffneten Plan -->
            <button @click="toggleCustomExercises" class="toggle-exercise-btn" v-if="customExercises.length > 0">
                {{ showCustomExercises ? ' Benutzerdefinierte Übungen ausblenden' : ' Benutzerdefinierte Übungen anzeigen' }}
            </button>
            <div v-if="showCustomExercises" class="custom-exercises-table">
                <h4 class="section-title">Eigene Übungen</h4>
                <table class="exercise-table full-width">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Muskelgruppe</th>
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(ex, i) in customExercises" :key="i">
                            <td @dblclick="openEditPopup('customExerciseName', i)">
                                <input v-if="exerciseEditIndex === i && exerciseEditField === 'name'" v-model="ex.name" @blur="finishEdit" @keyup.enter="finishEdit" />
                                <span v-else>{{ ex.name }}</span>
                            </td>
                            <td @dblclick="openEditPopup('customExerciseMuscle', i)">
                                <input v-if="exerciseEditIndex === i && exerciseEditField === 'muscle'" v-model="ex.muscle" @blur="finishEdit" @keyup.enter="finishEdit" />
                                <span v-else>{{ ex.muscle }}</span>
                            </td>
                            <td>
                                <DeleteButton title="Übung löschen"
                                              :extraClass="'table-delete-btn transparent'"
                                              @click="removeCustomExercise(i)" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- /Benutzerdefinierte Übungen -->
        </div>

        <!-- Satzpausen-Timer -->
        <div class="workout-list timer-container">
            <div class="plan-header">
                <h3 class="section-title">Satzpausen-Timer</h3>
                <AddButton title="Neuen Timer hinzufügen" @click="openAddTimerPopup" />
            </div>

            <Draggable :modelValue="props.timers"
                       item-key="id"
                       handle=".timer-drag-handle"
                       :ghost-class="'drag-ghost'"
                       :animation="150"
                       tag="div"
                       class="drag-stack"
                       @update:modelValue="(val) => emit('reorder-timers', val)">
                <template #item="{ element: timer }">
                    <div class="timer-card" :key="timer.id" :data-timer-id="timer.id" data-type="timer">
                        <div class="timer-header">
                            <span class="timer-drag-handle" title="Ziehen zum Verschieben">⠿</span>
                            <span class="timer-name" @click="openEditPopup('timerName', timer.id)">
                                {{ timer.name || 'Timer' }}
                            </span>
                            <div class="timer-actions">
                                <FavoriteButton :active="timer.isFavorite"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoriteTimer(timer.id)" />
                                <CloseButton title="Timer löschen" variant="timer" @click="openDeleteTimerPopup(timer.id)" />

                            </div>
                        </div>

                        <div class="timer-controls">
                            <span class="timer-display">{{ formatTimerDisplay(timer.time) }}</span>
                            <div class="timer-input-group">
                                <select v-model="timer.seconds" class="timer-select" @change="resetCustomSeconds(timer)">
                                    <option value="" disabled>Satzpause wählen</option>
                                    <option value="60">60 Sekunden</option>
                                    <option value="90">90 Sekunden</option>
                                    <option value="120">120 Sekunden</option>
                                    <option value="custom">Benutzerdefiniert</option>
                                </select>
                                <input v-if="timer.seconds === 'custom'"
                                       v-model.number="timer.customSeconds"
                                       @input="updateCustomSeconds(timer)"
                                       placeholder="Sekunden"
                                       type="number"
                                       min="1"
                                       class="timer-input" />
                                <select v-model="timer.sound" class="timer-select">
                                    <option value="" disabled>Sound wählen</option>
                                    <option value="nothing">Keine</option>
                                    <option value="standard">Standard</option>
                                    <option value="alarm">Alarm</option>
                                    <option value="beep">Piep</option>
                                    <option value="dong">Dong</option>
                                    <option value="decide">One Way Out</option>
                                </select>
                            </div>

                            <div class="timer-buttons">
                                <StartButton title="Start" @click="startTimer(timer)" :disabled="timer.isRunning" />
                                <StopButton title="Stop" @click="stopTimer(timer)" :disabled="!timer.isRunning" />
                                <ResetControlButton title="Reset" @click="resetTimer(timer)" />
                            </div>
                        </div>
                    </div>
                </template>
            </Draggable>

        </div>

        <!-- Übungs-Stoppuhr -->
        <div class="workout-list stopwatch-top">
            <div class="plan-header">
                <h3 class="section-title">Übungs-Stoppuhr</h3>
                <AddButton title="Neue Stoppuhr hinzufügen" @click="openAddStopwatchPopup" />
            </div>

            <Draggable :modelValue="props.stopwatches"
                       item-key="id"
                       handle=".stopwatch-drag-handle"
                       :ghost-class="'drag-ghost'"
                       :animation="150"
                       tag="div"
                       class="drag-stack"
                       @update:modelValue="(val) => emit('reorder-stopwatches', val)">
                <template #item="{ element: stopwatch }">
                    <div class="timer-card" :key="stopwatch.id" :data-stopwatch-id="stopwatch.id" data-type="stopwatch">
                        <div class="timer-header">
                            <span class="stopwatch-drag-handle" title="Ziehen zum Verschieben">⠿</span>
                            <span class="timer-name" @click.stop="openEditPopup('stopwatchName', stopwatch.id)">
                                {{ stopwatch.name || 'Stoppuhr' }}
                            </span>

                            <div class="timer-actions">
                                <FavoriteButton :active="stopwatch.isFavorite"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoriteStopwatch(stopwatch.id)" />
                                <CloseButton title="Stoppuhr löschen" variant="stopwatch" @click="openDeleteStopwatchPopup(stopwatch.id)" />
                            </div>
                        </div>

                        <div class="timer-controls">
                            <span class="timer-display">{{ formatStopwatchDisplay(stopwatch.time) }}</span>
                            <div class="timer-buttons">
                                <StartButton :title="stopwatch.isRunning ? 'Pause' : 'Start'"
                                             @click="toggleStopwatch(stopwatch)">
                                    {{ stopwatch.isRunning ? 'Pause' : 'Start' }}
                                </StartButton>
                                <ResetControlButton title="Reset" @click="resetStopwatch(stopwatch)" />
                                <RoundButton title="Runde"
                                             :disabled="!stopwatch.isRunning"
                                             @click="addLapTime(stopwatch)" />                            </div>
                        </div>

                        <div v-if="stopwatch.laps.length" class="laps-container">
                            <h4>Runden</h4>
                            <div class="laps-list">
                                <div v-for="(lap, index) in stopwatch.laps" :key="index" class="lap-item">
                                    <span>Runde {{ index + 1 }}</span>
                                    <span>{{ formatLapTime(lap) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Draggable>
        </div>

        <!-- Pop-up für Bearbeitung -->
        <EditPopup v-model="showEditPopup"
                   :key="`${editType}-${editIndex}-${editCellIndex}`"
                   :title="editPopupTitle"
                   :input-type="editInputType"
                   :placeholder="editPlaceholder"
                   :value="editValue"
                   @save="onEditPopupSave" />


        <!-- Pop-up für Löschbestätigung -->
        <div v-if="showDeletePopup" class="popup-overlay" @mousedown="handleOverlayClick">
            <div class="popup delete-popup" @click.stop>
                <h3 class="popup-title">Löschen bestätigen</h3>
                <p>Willst du das wirklich löschen?</p>
                <div class="popup-actions">
                    <button ref="deleteConfirmButton" class="popup-btn delete-confirm-btn" @click="confirmDeleteAction" @keydown.enter.prevent="confirmDeleteAction">Löschen</button>
                    <button class="popup-btn cancel-btn" @click="closeDeletePopup" @keydown.enter.prevent="closeDeletePopup">Abbrechen</button>
                </div>
            </div>
        </div>
        <!-- Pop-up für Timer -->
        <div v-if="showTimerPopup" class="popup-overlay" @mousedown="handleOverlayClick">
            <div class="popup" @click.stop>
                <h3>Satzpause beendet!</h3>
                <p>Deine Pause ist vorbei. Bereit für den nächsten Satz? 💪</p>
                <div class="popup-actions">
                    <button class="popup-btn save-btn" @click="closeTimerPopup" @keydown.enter.prevent="closeTimerPopup" @keydown.escape.prevent="closeTimerPopup">OK</button>
                </div>
            </div>
        </div>
        <!-- Pop-up für neuen Timer -->
        <div v-if="showAddTimerPopup" class="popup-overlay" @mousedown="handleOverlayClick">
            <div class="popup" @click.stop>
                <h3 class="popup-title">Neuen Timer hinzufügen</h3>
                <div class="input-group">
                    <input v-model="newTimerName" type="text" placeholder="Timer Name (optional)" class="edit-input" ref="newTimerInput" @keydown.enter.prevent="addTimer" @keydown.escape.prevent="closeAddTimerPopup" />
                </div>
                <div class="popup-actions">
                    <button class="popup-btn save-btn" @click="addTimer">Hinzufügen</button>
                    <button class="popup-btn cancel-btn" @click="closeAddTimerPopup">Abbrechen</button>
                </div>
            </div>
        </div>
        <!-- Pop-up für neue Stoppuhr -->
        <div v-if="showAddStopwatchPopup" class="popup-overlay" @mousedown="handleOverlayClick">
            <div class="popup" @click.stop>
                <h3 class="popup-title">Neue Stoppuhr hinzufügen</h3>
                <div class="input-group">
                    <input v-model="newStopwatchName" type="text" placeholder="Stoppuhr Name (optional)" class="edit-input" ref="newStopwatchInput" @keydown.enter.prevent="addStopwatch" @keydown.escape.prevent="closeAddStopwatchPopup" />
                </div>
                <div class="popup-actions">
                    <button class="popup-btn save-btn" @click="addStopwatch">Speichern</button>
                    <button class="popup-btn cancel-btn" @click="closeAddStopwatchPopup">Abbrechen</button>
                </div>
            </div>
        </div>
        <!-- Pop-up für Download -->
        <div v-if="showDownloadPopup" class="popup-overlay" @mousedown="handleOverlayClick">
            <div class="popup" @click.stop>
                <h3 class="popup-title">Trainingsplan herunterladen</h3>
                <div class="input-group">
                    <label class="downloaddistance">Download-Format wählen:</label>
                    <select v-model="downloadFormat" class="edit-input">
                        <option value="html">HTML</option>
                        <option value="pdf">PDF</option>
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                    </select>
                </div>
                <div class="popup-actions">
                    <button class="popup-btn save-btn" @click="confirmDownload">Download</button>
                    <button class="popup-btn cancel-btn" @click="closeDownloadPopup">Abbrechen</button>
                </div>
            </div>
        </div>
        <!-- Pop-up für Validierungsfehler -->
        <div v-if="showValidationPopup" class="popup-overlay" @mousedown="handleOverlayClick">
            <div class="popup edit-popup" @click.stop>
                <h3 class="popup-title">Eingabefehler</h3>
                <p class="validation-error-text">Bitte überprüfe die folgenden Fehler:</p>
                <ul class="validation-error-list">
                    <li v-for="(error, index) in validationErrorMessages" :key="index">{{ error }}</li>
                </ul>
                <div class="popup-actions">
                    <button class="popup-btn save-btn"
                            @click="closeValidationPopup"
                            @keydown.enter.prevent="closeValidationPopup"
                            @keydown.escape.prevent="closeValidationPopup"
                            ref="validationOkButton">
                        OK
                    </button>
                </div>
            </div>
        </div>
        <!-- Audio-Elemente für Timer-Sounds -->
        <audio id="audio-standard" preload="auto"></audio>
        <audio id="audio-alarm" preload="auto"></audio>
        <audio id="audio-beep" preload="auto"></audio>
        <audio id="audio-dong" preload="auto"></audio>
        <audio id="audio-decide" preload="auto"></audio>
        <!-- Toast-Benachrichtigungen -->
        <Toast :toast="toast"
               dismissible
               @dismiss="dismissToast"
               position="bottom-right" />
    </div>
</template>


<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
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
    import AddButton from '@/components/ui/buttons/AddButton.vue'
    import StartButton from '@/components/ui/buttons/StartButton.vue'
    import StopButton from '@/components/ui/buttons/StopButton.vue'
    import ResetControlButton from '@/components/ui/buttons/ResetControlButton.vue'
    import RoundButton from '@/components/ui/buttons/RoundButton.vue'
    import AddExerciseButton from '@/components/ui/buttons/AddExerciseButton.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue'
    import PlanSubmitButton from '@/components/ui/buttons/PlanSubmitButton.vue'

    // Typ-Definitionen (bleiben unverändert)
    interface PlanExercise {
        exercise: string;
        sets: number;
        reps: number;
        goal?: string;
    }

    interface TrainingPlan {
        id: string;
        name: string;
        exercises: PlanExercise[];
    }

    type ToastType =
        | 'toast-default'
        | 'toast-save'
        | 'toast-add'
        | 'toast-delete'
        | 'toast-timer'
        | 'toast-reset'

    interface Toast {
        id: number
        message: string
        emoji: string
        type: ToastType
        exiting: boolean
    }


    interface TimerInstance {
        id: string
        name?: string
        seconds: string | null
        customSeconds: number | null
        time: number
        isRunning: boolean
        interval: number | null
        isFavorite: boolean
        sound: string
        isVisible: boolean
        shouldStaySticky: boolean
        left?: number
        top?: number
        startedAtMs?: number;       
        endsAtMs?: number;         
        pausedRemaining?: number;   
    }

    interface StopwatchInstance {
        id: string
        name?: string
        time: number
        isRunning: boolean
        interval: number | null
        laps?: number[]
        isFavorite: boolean
        isVisible: boolean
        shouldStaySticky: boolean
        left?: number
        top?: number
        startedAtMs?: number;       
        offsetMs?: number;         
    }

    const props = defineProps<{
        timers: TimerInstance[]
        stopwatches: StopwatchInstance[]
        startTimer: (timer: TimerInstance) => void
        stopTimer: (timer: TimerInstance) => void
        resetTimer: (timer: TimerInstance) => void
        toggleStopwatch: (sw: StopwatchInstance) => void
        resetStopwatch: (sw: StopwatchInstance) => void
        removeTimer: (id: string) => void
        removeStopwatch: (id: string) => void
    }>();

    const emit = defineEmits<{
        (e: 'remove-timer', id: string): void;
        (e: 'remove-stopwatch', id: string): void;
        (e: 'add-timer', timer: TimerInstance): void;
        (e: 'add-stopwatch', stopwatch: StopwatchInstance): void;
        (e: 'reorder-timers', list: TimerInstance[]): void;
        (e: 'reorder-stopwatches', list: StopwatchInstance[]): void;
    }>();

    const dismissToast = () => {
        if (!toast.value) return
        toast.value.exiting = true
        setTimeout(() => { toast.value = null }, 300) // passt zur .toast-exit Animation
    }

    const favoriteTimerItems = computed<TimerInstance[]>({
        get() {
            return props.timers.filter(t => t.isFavorite);
        },
        set(newFavs) {
            const others = props.timers.filter(t => !t.isFavorite);
            emit('reorder-timers', [...newFavs, ...others]);
        }
    });

    const otherTimerItems = computed<TimerInstance[]>({
        get() {
            return props.timers.filter(t => !t.isFavorite);
        },
        set(newOthers) {
            const favs = props.timers.filter(t => t.isFavorite);
            emit('reorder-timers', [...favs, ...newOthers]);
        }
    });

    const favoriteStopwatchItems = computed<StopwatchInstance[]>({
        get() {
            return props.stopwatches.filter(s => s.isFavorite);
        },
        set(newFavs) {
            const others = props.stopwatches.filter(s => !s.isFavorite);
            emit('reorder-stopwatches', [...newFavs, ...others]);
        }
    });

    const otherStopwatchItems = computed<StopwatchInstance[]>({
        get() {
            return props.stopwatches.filter(s => !s.isFavorite);
        },
        set(newOthers) {
            const favs = props.stopwatches.filter(s => s.isFavorite);
            emit('reorder-stopwatches', [...favs, ...newOthers]);
        }
    });


    // Refs (bleiben größtenteils unverändert)
    const plans = ref<TrainingPlan[]>([]);
    const favoritePlans = ref<string[]>([]);
    const planName = ref('');
    const newExercise = ref('');
    const customPlanExercise = ref('');
    const newReps = ref<number | null>(null);
    const newSets = ref<number | null>(null);
    const editingPlanId = ref<string | null>(null);
    const selectedPlanExercises = ref<PlanExercise[]>([]);
    const selectedPlan = ref<TrainingPlan | null>(null);
    const showTimerPopup = ref(false);
    const showDeletePopup = ref(false);
    const showEditPopup = ref(false);
    const showAddTimerPopup = ref(false);
    const showAddStopwatchPopup = ref(false);
    const showDownloadPopup = ref(false);
    const showValidationPopup = ref(false);
    const validationErrorMessages = ref<string[]>([]);
    const validationOkButton = ref<HTMLButtonElement | null>(null);
    const downloadPlan = ref<TrainingPlan | null>(null);
    const downloadFormat = ref('html');
    const newTimerName = ref('');
    const newStopwatchName = ref('');
    const deleteAction = ref<(() => void) | null>(null);
    const predefinedExercises = ref([
        'Bankdrücken', 'Kniebeugen', 'Kreuzheben', 'Schulterdrücken', 'Liegestütze', 'Klimmzüge', 'Latzug', 'Rudern',
        'Bizepscurls', 'Trizepsdrücken', 'Beinpresse', 'Ausfallschritte', 'Butterfly', 'Seitheben', 'Wadenheben',
        'Bauchpresse', 'Rückenstrecker', 'Beinstrecker', 'Beinbeuger', 'Brustpresse', 'Dips'
    ]);
    const muscleGroups = ref({
        Brust: ['Bankdrücken', 'Liegestütze', 'Butterfly', 'Brustpresse'],
        Rücken: ['Klimmzüge', 'Latzug', 'Rudern', 'Rückenstrecker'],
        Beine: ['Kniebeugen', 'Kreuzheben', 'Beinpresse', 'Ausfallschritte', 'Wadenheben'],
        Schultern: ['Schulterdrücken', 'Seitheben'],
        Arme: ['Bizepscurls', 'Trizepsdrücken', 'Dips'],
        Bauch: ['Bauchpresse']
    });
    const exerciseFilter = ref('');
    const trainingGoals = ref(['Muskelaufbau', 'Abnehmen', 'Ausdauer', 'Kraft']);
    const selectedGoal = ref('');
    const showExtras = ref(false);
    const columnWidths = ref([50, 25, 25]);
    const rowHeights = ref<number[]>([]);
    const planSearch = ref('');
    const editValue = ref('');
    const editType = ref<'table' | 'selectedPlan' | 'planName' | 'selectedPlanName' | 'timerName' | 'stopwatchName' | 'customExerciseName' | 'customExerciseMuscle'>('table');
    const editIndex = ref<number | string | null>(null);
    const editCellIndex = ref<number | null>(null);
    const newTimerInput = ref<HTMLInputElement | null>(null);
    const newStopwatchInput = ref<HTMLInputElement | null>(null);
    const showCustomExercises = ref(false);
    const exerciseEditIndex = ref<number | null>(null);
    const exerciseEditField = ref<'name' | 'muscle' | null>(null);
    const customExercises = ref<{ name: string; muscle: string }[]>([]);
    const toast = ref<Toast | null>(null);
    const timerObservers = new Map<string, IntersectionObserver>();
    let toastId = 0;
    let toastTimeout: number | null = null;
    const deleteConfirmButton = ref<HTMLButtonElement | null>(null);
    const isTimerSticky = ref(false); // Hinzugefügt für Sticky-Logik
    const isStopwatchSticky = ref(false); // Hinzugefügt für Sticky-Logik
    const resizeTable = ref<HTMLTableElement | null>(null);
    const prevTimes = new Map<string, number>();
    const finishedOnce = new Set<string>();

    const audioPaths = {
        standard: '/sounds/standard.mp3',
        alarm: '/sounds/alarm.mp3',
        beep: '/sounds/beep.mp3',
        dong: '/sounds/dong.mp3',
        decide: '/sounds/decide.mp3'
    };

    // Funktionen (weitgehend unverändert, nur relevante Änderungen)

    const sendNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body });
            if ('vibrate' in navigator) {
                navigator.vibrate([300, 100, 300]);
            }
        }
    };
    function tryFocusFromStorage() {
        const type = localStorage.getItem('trainingFocusType')
        const id = localStorage.getItem('trainingFocusId')
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
                localStorage.removeItem('trainingFocusType')
                localStorage.removeItem('trainingFocusId')
            } else if (attempts < 20) {
                // UI ist noch nicht gemountet → kurz retry
                requestAnimationFrame(() => focusIt(attempts + 1))
            }
        }

        // einmal nach DOM-Render probieren
        nextTick(() => focusIt())
    }

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('🔔 Benachrichtigungen aktiviert!');
                }
            });
        }
    };

    const favoritePlanItems = computed<TrainingPlan[]>({
        get() {
            const map = new Map(plans.value.map(p => [p.id, p]));
            return favoritePlans.value.map(id => map.get(id)).filter(Boolean) as TrainingPlan[];
        },
        set(newArr) {
            favoritePlans.value = newArr.map(p => p.id);
            saveToStorage();
        }
    });

    const otherPlanItems = computed<TrainingPlan[]>({
        get() {
            const fav = new Set(favoritePlans.value);
            return plans.value.filter(p => !fav.has(p.id));
        },
        set(newArr) {
            const fav = new Set(favoritePlans.value);
            const favs = plans.value.filter(p => fav.has(p.id));
            plans.value = [...favs, ...newArr];
            saveToStorage();
        }
    });

    const filteredFavoritePlans = computed(() => {
        const q = planSearch.value.toLowerCase().trim();
        return favoritePlanItems.value.filter(p =>
            p.name.toLowerCase().includes(q) || p.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(q))
        );
    });
    const filteredOtherPlans = computed(() => {
        const q = planSearch.value.toLowerCase().trim();
        return otherPlanItems.value.filter(p =>
            p.name.toLowerCase().includes(q) || p.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(q))
        );
    });

    // Computed properties (unverändert)
    const filteredPlans = computed(() => {
        const searchTerm = planSearch.value.toLowerCase();
        return sortedPlans.value.filter(plan => {
            const planNameMatch = plan.name.toLowerCase().includes(searchTerm);
            const goalMatch = plan.exercises.some(ex => ex.goal?.toLowerCase().includes(searchTerm));
            return planNameMatch || goalMatch;
        });
    });

    const filteredExercises = computed(() => {
        const filter = exerciseFilter.value.toLowerCase();
        const predefined = predefinedExercises.value.filter(ex =>
            ex.toLowerCase().includes(filter) ||
            Object.entries(muscleGroups.value).some(([group, exercises]) =>
                group.toLowerCase().includes(filter) && exercises.includes(ex)
            )
        );
        const custom = customExercises.value
            .filter(ex =>
                ex.name.toLowerCase().includes(filter) ||
                ex.muscle.toLowerCase().includes(filter)
            )
            .map(ex => ex.name);
        return [...new Set([...predefined, ...custom])];
    });

    const selectedPlanGoal = computed(() => {
        if (selectedPlan.value?.exercises.length) {
            const goals = new Set(selectedPlan.value.exercises.map(ex => ex.goal).filter(g => g));
            return goals.size === 1 ? goals.values().next().value : null;
        }
        return null;
    });

    const planMatchesSearch = (plan: TrainingPlan) => {
        const q = planSearch.value.toLowerCase().trim();
        return !q
            || plan.name.toLowerCase().includes(q)
            || plan.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(q));
    };

    const editPopupTitle = computed(() => {
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return 'Planname bearbeiten';
        if (editType.value === 'timerName') return 'Timername bearbeiten';
        if (editType.value === 'stopwatchName') return 'Stoppuhrname bearbeiten';
        if (editType.value === 'customExerciseName') return 'Übungsname bearbeiten';
        if (editType.value === 'customExerciseMuscle') return 'Muskelgruppe bearbeiten';
        if (editCellIndex.value === 0) return 'Übung bearbeiten';
        if (editCellIndex.value === 1) return 'Sätze bearbeiten';
        if (editCellIndex.value === 2) return 'Wiederholungen bearbeiten';
        return 'Bearbeiten';
    });

    const editInputType = computed(() => {
        if (editType.value === 'planName' || editType.value === 'selectedPlanName' || editType.value === 'timerName' || editType.value === 'stopwatchName' || editType.value === 'customExerciseName' || editType.value === 'customExerciseMuscle') return 'text';
        return 'number';
    });

    const editPlaceholder = computed(() => {
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return 'Neuer Planname (3-20 Zeichen)';
        if (editType.value === 'timerName') return 'Neuer Timername';
        if (editType.value === 'stopwatchName') return 'Neuer Stoppuhrname (max. 30 Zeichen)';
        if (editType.value === 'customExerciseName') return 'Neuer Übungsname (max. 50 Zeichen)';
        if (editType.value === 'customExerciseMuscle') return 'Neue Muskelgruppe (max. 50 Zeichen)';
        if (editCellIndex.value === 0) return 'Neue Übung';
        if (editCellIndex.value === 1) return 'Neue Sätze (1-20)';
        if (editCellIndex.value === 2) return 'Neue Wiederholungen (1-50)';
        return 'Neuer Wert';
    });

    const sortedPlans = computed(() => {
        const order = new Map(favoritePlans.value.map((id, i) => [id, i]));
        return [...plans.value].sort((a, b) => {
            const aFav = order.has(a.id);
            const bFav = order.has(b.id);
            if (aFav && !bFav) return -1;
            if (!aFav && bFav) return 1;
            if (aFav && bFav) return order.get(a.id)! - order.get(b.id)!;
            return a.name.localeCompare(b.name);
        });
    });

    const sortedTimers = computed(() => {
        return [...props.timers].sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });
    });

    // Stoppuhren sortieren: Favoriten zuerst, dann Name
    const sortedStopwatches = computed(() => {
        return [...props.stopwatches].sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });
    });

    const formatTimerDisplay = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatStopwatchDisplay = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const milliseconds = Math.floor((time % 1) * 100);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const formatLapTime = (lapTime: number) => formatStopwatchDisplay(lapTime);

    const loadFromStorage = () => {
        try {
            const data = localStorage.getItem('trainingData');
            if (data) {
                const parsed = JSON.parse(data);
                plans.value = Array.isArray(parsed.plans) ? parsed.plans : [];
                favoritePlans.value = Array.isArray(parsed.favoritePlans) ? parsed.favoritePlans : [];
                customExercises.value = Array.isArray(parsed.customExercises)
                    ? parsed.customExercises.filter((ex: any) =>
                        ex && typeof ex === 'object' && typeof ex.name === 'string' && typeof ex.muscle === 'string'
                    )
                    : [];
            }
        } catch (e) {
            console.error('Fehler beim Laden:', e);
            plans.value = [];
            favoritePlans.value = [];
            customExercises.value = [];
            addToast('Fehler beim Laden der Daten', 'delete');
        }
    };

    const saveToStorage = () => {
        try {
            const data = {
                plans: plans.value,
                favoritePlans: favoritePlans.value,
                customExercises: customExercises.value
            };
            localStorage.setItem('trainingData', JSON.stringify(data));
        } catch (e) {
            console.error('Fehler beim Speichern:', e);
            addToast('Fehler beim Speichern der Daten', 'delete');
        }
    };

    const toggleCustomExercises = () => {
        showCustomExercises.value = !showCustomExercises.value;
    };

    const editCell = (index: number, field: 'name' | 'muscle') => {
        openEditPopup(`customExercise${field.charAt(0).toUpperCase() + field.slice(1)}` as 'customExerciseName' | 'customExerciseMuscle', index);
    };

    const finishEdit = () => {
        exerciseEditIndex.value = null;
        exerciseEditField.value = null;
    };

    const validateReps = (reps: number | null | undefined) => {
        if (reps == null || isNaN(reps)) return 'Wiederholungen müssen eine Zahl sein';
        if (reps < 1 || reps > 50) return 'Wiederholungen müssen zwischen 1 und 50 liegen';
        if (!Number.isInteger(reps)) return 'Wiederholungen müssen eine Ganzzahl sein';
        return null;
    };

    const validateSets = (sets: number | null | undefined) => {
        if (sets == null || isNaN(sets)) return 'Sätze müssen eine Zahl sein';
        if (sets < 1 || sets > 20) return 'Sätze müssen zwischen 1 und 20 liegen';
        if (!Number.isInteger(sets)) return 'Sätze müssen eine Ganzzahl sein';
        return null;
    };

    const validateCustomExercise = (name: string, muscle: string, editIndex: number | null = null) => {
        const trimmedName = name.trim();
        const trimmedMuscle = muscle.trim();
        if (!trimmedName) return 'Übungsname ist erforderlich';
        if (!trimmedMuscle) return 'Muskelgruppe ist erforderlich';
        if (trimmedName.length > 50) return 'Übungsname darf maximal 50 Zeichen lang sein';
        if (trimmedMuscle.length > 50) return 'Muskelgruppe darf maximal 50 Zeichen lang sein';
        const exists = customExercises.value.some((ex, i) => ex.name.toLowerCase() === trimmedName.toLowerCase() && (editIndex === null || i !== editIndex));
        if (exists) return 'Übungsname existiert bereits';
        return { name: trimmedName, muscle: trimmedMuscle };
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

    const validateStopwatchName = (name: string): string | false => {
        const trimmed = name.trim();
        if (trimmed.length > 30) return false;
        return trimmed || 'Stoppuhr';
    };

    const collectValidationErrors = () => {
        const errors: string[] = [];
        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value;

        if (!exerciseToAdd) errors.push('Übung auswählen oder benutzerdefinierte Übung eingeben');
        else if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === exerciseToAdd.toLowerCase())) {
            errors.push('Übung bereits im Plan vorhanden');
        }

        const setsError = validateSets(newSets.value);
        if (setsError) errors.push(setsError);

        const repsError = validateReps(newReps.value);
        if (repsError) errors.push(repsError);

        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || '';
            const validated = validateCustomExercise(customPlanExercise.value, muscleGroup);
            if (typeof validated === 'string') errors.push(validated);
        }

        return errors;
    };

    const openValidationPopup = (errors: string[]) => {
        console.log('openValidationPopup aufgerufen mit Fehlern:', errors);
        validationErrorMessages.value = Array.isArray(errors) ? errors : [errors];
        showValidationPopup.value = true;
        nextTick(() => {
            if (validationOkButton.value) {
                validationOkButton.value.focus();
                console.log('Fokus auf OK-Button im Validierungspopup gesetzt');
            }
        });
    };

    const closeValidationPopup = () => {
        showValidationPopup.value = false;
        validationErrorMessages.value = [];
    };

    const toggleFavoritePlan = (planId: string) => {
        const idx = favoritePlans.value.indexOf(planId);
        if (idx !== -1) {
            favoritePlans.value.splice(idx, 1);
            addToast('Plan aus Favoriten entfernt', 'delete');
        } else {
            // Neueste Favoriten zuerst
            favoritePlans.value = [planId, ...favoritePlans.value.filter(id => id !== planId)];
            addToast('Plan zu Favoriten hinzugefügt', 'add');
        }
        saveToStorage();
    };

    const createOrUpdatePlan = () => {
        const validatedPlanName = validatePlanName(planName.value);

        if (editingPlanId.value && selectedPlanExercises.value.length === 0) {
            plans.value = plans.value.filter(p => p.id !== editingPlanId.value);
            favoritePlans.value = favoritePlans.value.filter(id => id !== editingPlanId.value);
            if (selectedPlan.value?.id === editingPlanId.value) {
                selectedPlan.value = null;
            }
            saveToStorage();
            addToast('Trainingsplan gelöscht, da keine Übungen vorhanden', 'delete');
            planName.value = '';
            newExercise.value = '';
            customPlanExercise.value = '';
            newReps.value = null;
            newSets.value = null;
            selectedGoal.value = '';
            selectedPlanExercises.value = [];
            rowHeights.value = [];
            editingPlanId.value = null;
            return;
        }

        if (validatedPlanName === false || (!editingPlanId.value && !selectedPlanExercises.value.length)) {
            const errors: string[] = [];
            if (validatedPlanName === false) {
                errors.push(
                    planName.value.trim().length < 3
                        ? 'Planname muss mindestens 3 Zeichen lang sein'
                        : 'Planname darf maximal 20 Zeichen lang sein'
                );
            }
            if (!selectedPlanExercises.value.length) {
                errors.push('Mindestens eine Übung ist erforderlich');
            }
            openValidationPopup(errors);
            return;
        }

        const plan: TrainingPlan = {
            id: editingPlanId.value || Date.now().toString(),
            name: validatedPlanName,
            exercises: [...selectedPlanExercises.value]
        };
        if (editingPlanId.value) {
            const index = plans.value.findIndex(p => p.id === editingPlanId.value);
            if (index !== -1) {
                plans.value[index] = plan;
                if (selectedPlan.value?.id === editingPlanId.value) {
                    selectedPlan.value = { ...plan };
                }
                addToast('Plan gespeichert', 'save');
                editingPlanId.value = null;
            }
        } else {
            plans.value.push(plan);
            addToast('Plan erstellt', 'add');
        }

        planName.value = '';
        newExercise.value = '';
        customPlanExercise.value = '';
        newReps.value = null;
        newSets.value = null;
        selectedGoal.value = '';
        selectedPlanExercises.value = [];
        rowHeights.value = [];
        saveToStorage();
    };

    const addExerciseToPlan = () => {
        const errors = collectValidationErrors();
        if (errors.length > 0) {
            openValidationPopup(errors);
            return;
        }

        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value;
        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || '';
            const validated = validateCustomExercise(customPlanExercise.value, muscleGroup);
            if (typeof validated !== 'string') {
                customExercises.value.push({ name: validated.name, muscle: validated.muscle });
                saveToStorage();
                addToast('Benutzerdefinierte Übung gespeichert', 'add');
            }
        }
        selectedPlanExercises.value.push({
            exercise: exerciseToAdd,
            sets: newSets.value!,
            reps: newReps.value!,
            goal: selectedGoal.value || undefined
        });
        rowHeights.value.push(40);
        addToast('Übung hinzugefügt', 'add');
        newExercise.value = '';
        customPlanExercise.value = '';
        newReps.value = null;
        newSets.value = null;
        selectedGoal.value = '';
    };

    const removeExerciseFromPlan = (index: number) => {
        if (index < 0 || index >= selectedPlanExercises.value.length) {
            addToast('Ungültiger Übungsindex', 'delete');
            return;
        }
        openDeletePopup(() => {
            selectedPlanExercises.value.splice(index, 1);
            rowHeights.value.splice(index, 1);
            if (editingPlanId.value) {
                const planIndex = plans.value.findIndex(p => p.id === editingPlanId.value);
                if (planIndex !== -1) {
                    plans.value[planIndex].exercises = [...selectedPlanExercises.value];
                    saveToStorage();
                }
            }
            addToast('Übung gelöscht', 'delete');
        });
    };

    const editPlan = (planId: string) => {
        const plan = plans.value.find(p => p.id === planId);
        if (plan) {
            planName.value = plan.name;
            selectedPlanExercises.value = [...plan.exercises];
            editingPlanId.value = planId;
            rowHeights.value = Array(plan.exercises.length).fill(40);
            selectedPlan.value = { ...plan };
            addToast('Plan wird bearbeitet', 'save');
        } else {
            addToast('Plan nicht gefunden', 'delete');
        }
    };

    const deletePlan = (planId: string) => {
        plans.value = plans.value.filter(p => p.id !== planId);
        favoritePlans.value = favoritePlans.value.filter(id => id !== planId);
        if (selectedPlan.value?.id === planId) selectedPlan.value = null;
        saveToStorage();
        addToast('Trainingsplan gelöscht', 'delete');
    };

    const loadPlan = (planId: string) => {
        const plan = plans.value.find(p => p.id === planId);
        if (plan) {
            selectedPlan.value = { ...plan };
            rowHeights.value = Array(plan.exercises.length).fill(40);
            columnWidths.value = [50, 25, 25];
            addToast('Plan geladen', 'load');
        } else {
            addToast('Plan nicht gefunden', 'delete');
        }
    };

    const closePlan = () => {
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
        const goal = [...new Set(plan.exercises.map(ex => ex.goal).filter(g => g))][0] || '';
        const fileName = goal ? `${plan.name}` : plan.name;
        const title = goal ? `${plan.name}` : plan.name;

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
            table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #333; color: #ffffff; }
            tr:nth-child(even) { background: #f9fafb; }
            tr:hover { background: #e2e8f0; }
            td { color: #4b5563; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <tr>
              <th>Übung</th>
              <th>Sätze</th>
              <th>Wiederholungen</th>
            </tr>
            ${plan.exercises.map(ex => `
              <tr>
                <td>${ex.exercise}</td>
                <td>${ex.sets}</td>
                <td>${ex.reps}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;
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
            doc.text(title, 20, 20);
            doc.setFontSize(12);
            let yOffset = 40;
            doc.text(['Übung', 'Sätze', 'Wiederholungen'].join(', '), 20, yOffset);
            yOffset += 10;
            plan.exercises.forEach(ex => {
                doc.text([ex.exercise, `${ex.sets}`, `${ex.reps}`].join(', '), 20, yOffset);
                yOffset += 10;
            });
            doc.save(`${fileName}_Trainingsplan.pdf`);
        } else if (downloadFormat.value === 'csv') {
            const csvContent = ['Übung', 'Sätze', 'Wiederholungen'].join(',') + '\n' +
                plan.exercises.map(ex => `"${ex.exercise}",${ex.sets},${ex.reps}`).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}_Trainingsplan.csv`;
            link.click();
            URL.revokeObjectURL(link.href);
        } else if (downloadFormat.value === 'json') {
            const jsonContent = JSON.stringify(plan.exercises.map(({ exercise, sets, reps }) => ({ exercise, sets, reps })), null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${fileName}_Trainingsplan.json`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
        addToast('Plan heruntergeladen', 'load');
        closeDownloadPopup();
    };

    const toggleExtras = () => {
        showExtras.value = !showExtras.value;
    };

    const openAddTimerPopup = () => {
        newTimerName.value = '';
        showAddTimerPopup.value = true;
        nextTick(() => {
            if (newTimerInput.value) newTimerInput.value.focus();
        });
    };

    const closeAddTimerPopup = () => {
        showAddTimerPopup.value = false;
        newTimerName.value = '';
    };

    const addTimer = async () => {
        console.log('addTimer aufgerufen mit Name:', newTimerName.value);
        const newTimer: TimerInstance = {
            id: Date.now().toString(),
            name: newTimerName.value.trim() || 'Timer',
            seconds: '60',
            customSeconds: null,
            time: 60,
            isRunning: false,
            interval: null,
            isFavorite: false,
            sound: 'standard',
            isVisible: true,
            shouldStaySticky: false
        };
        emit('add-timer', newTimer);
        addToast('Timer hinzugefügt', 'add');
        closeAddTimerPopup();
        await nextTick();
        console.log('Nach addTimer, aktuelle timers:', props.timers);
    };

    const openDeleteTimerPopup = (id: string) => {
        console.log('openDeleteTimerPopup aufgerufen mit ID:', id);
        if (props.timers.length <= 1) {
            openValidationPopup(['Mindestens ein Timer muss geöffnet bleiben']);
            return;
        }
        openDeletePopup(async () => {
            console.log('Löschaktion ausführen für Timer ID:', id);
            const timer = props.timers.find(t => t.id === id);
            if (timer && timer.isRunning) {
                props.stopTimer(timer);
            }
            emit('remove-timer', id);

            addToast('Timer gelöscht', 'delete');
            await nextTick();
            console.log('Nach removeTimer, aktuelle timers:', props.timers);
        });
    };

    const toggleFavoriteTimer = (id: string) => {
        const timer = props.timers.find(t => t.id === id);
        if (!timer) return;
        timer.isFavorite = !timer.isFavorite;

        const others = props.timers.filter(t => !t.isFavorite);
        const favs = props.timers.filter(t => t.isFavorite && t.id !== id);

        const ordered = timer.isFavorite
            ? [timer, ...favs, ...others]   // neu favorisiert → ganz nach oben
            : [...favs, timer, ...others];  // entfavorisiert → direkt hinter Fav-Bereich

        emit('reorder-timers', ordered);
        addToast(timer.isFavorite ? 'Timer zu Favoriten hinzugefügt' : 'Timer aus Favoriten entfernt', timer.isFavorite ? 'add' : 'delete');
    };

    const openAddStopwatchPopup = () => {
        newStopwatchName.value = '';
        showAddStopwatchPopup.value = true;
        nextTick(() => {
            if (newStopwatchInput.value) newStopwatchInput.value.focus();
        });
    };

    const closeAddStopwatchPopup = () => {
        showAddStopwatchPopup.value = false;
        newStopwatchName.value = '';
    };

    const addStopwatch = async () => {
        const validatedName = validateStopwatchName(newStopwatchName.value);
        if (validatedName === false) {
            openValidationPopup(['Stoppuhr darf maximal 30 Zeichen lang sein']);
            return;
        }

        const newStopwatch: StopwatchInstance = {
            id: Date.now().toString(),
            name: validatedName,
            time: 0,
            isRunning: false,
            interval: null,
            laps: [],
            isFavorite: false,
            isVisible: true,
            shouldStaySticky: false
        };

        emit('add-stopwatch', newStopwatch);
        addToast('Stoppuhr hinzugefügt', 'add');
        closeAddStopwatchPopup();
        await nextTick();
        console.log('Nach addStopwatch, aktuelle stopwatches:', props.stopwatches);
    };

    const openDeleteStopwatchPopup = (id: string) => {
        if (props.stopwatches.length <= 1) {
            openValidationPopup(['Mindestens eine Stoppuhr muss geöffnet bleiben']);
            return;
        }
        openDeletePopup(async () => {
            const sw = props.stopwatches.find(x => x.id === id);
            if (sw) {
                sw.shouldStaySticky = false; // optional; rein UI-Flag
                if (sw.isRunning) {
                    // ⏸ Parent pausiert/stoppt – keine lokale Interval-Logik hier
                    props.toggleStopwatch(sw);
                }
            }
            emit('remove-stopwatch', id);
            addToast('Stoppuhr gelöscht', 'delete');
            await nextTick();
        });
    };



    const toggleFavoriteStopwatch = (id: string) => {
        const sw = props.stopwatches.find(x => x.id === id);
        if (!sw) return;
        sw.isFavorite = !sw.isFavorite;

        const others = props.stopwatches.filter(x => !x.isFavorite);
        const favs = props.stopwatches.filter(x => x.isFavorite && x.id !== id);

        const ordered = sw.isFavorite
            ? [sw, ...favs, ...others]
            : [...favs, sw, ...others];

        emit('reorder-stopwatches', ordered);
        addToast(sw.isFavorite ? 'Stoppuhr zu Favoriten hinzugefügt' : 'Stoppuhr aus Favoriten entfernt', sw.isFavorite ? 'add' : 'delete');
    };


    const updateCustomSeconds = (timer: TimerInstance) => {
        if (timer.customSeconds != null && !isNaN(timer.customSeconds) && timer.customSeconds > 0) {
            timer.seconds = 'custom';
            timer.time = timer.customSeconds;
        }
    };


    const playTimerSound = (sound: string) => {
        const audio = document.getElementById(`audio-${sound}`) as HTMLAudioElement;
        if (audio && audio.src) {
            try {
                audio.currentTime = 0;
                audio.play();
            } catch (e) {
                console.error('Fehler beim Abspielen des Sounds:', e);
                addToast('Sound konnte nicht abgespielt werden', 'delete');
            }
        }
    };

    const addLapTime = (stopwatch: StopwatchInstance) => {
        if (stopwatch.isRunning) {
            stopwatch.laps = stopwatch.laps || [];
            stopwatch.laps.push(stopwatch.time);
            addToast('Runde aufgezeichnet', 'timer');
        }
    };

    const resetCustomSeconds = (timer: TimerInstance) => {
        if (timer.seconds !== 'custom') {
            timer.customSeconds = null;
            timer.time = Number(timer.seconds) || 60;
        }
    };

    const openDeletePopup = (action: () => void) => {
        deleteAction.value = action;
        showDeletePopup.value = true;
        nextTick(() => {
            if (deleteConfirmButton.value) {
                deleteConfirmButton.value.focus();
            }
        });
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

    const addToast = (message: string, type: 'delete' | 'add' | 'save' | 'timer' | 'load' = 'load') => {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toast.value = null;
        }
        const id = toastId++;
        const emojis = {
            delete: '🗑️',
            add: '✅',
            save: '💾',
            timer: '⏰',
            load: '📋'
        } as const;
        const types = {
            delete: 'toast-delete',
            add: 'toast-add',
            save: 'toast-save',
            timer: 'toast-timer',
            load: 'toast-default'
        } as const;
        toast.value = {
            id,
            message,
            emoji: emojis[type],
            type: types[type], // passt jetzt zu ToastType
            exiting: false
        };
        toastTimeout = setTimeout(() => {
            if (toast.value) {
                toast.value.exiting = true;
                setTimeout(() => {
                    toast.value = null;
                    toastTimeout = null;
                }, 300);
            }
        }, 3000);
    };

    const openEditPopup = (type: 'table' | 'selectedPlan' | 'planName' | 'selectedPlanName' | 'timerName' | 'stopwatchName' | 'customExerciseName' | 'customExerciseMuscle', index: number | string, event?: MouseEvent) => {
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

            const exercise = (type === 'table'
                ? selectedPlanExercises.value[index as number]
                : selectedPlan.value?.exercises[index as number]);

            if (!exercise) {
                console.error('Übung nicht gefunden für Index:', index);
                openValidationPopup(['Übung nicht gefunden']);
                return;
            }

            if (editCellIndex.value === 0) editValue.value = exercise.exercise;
            else if (editCellIndex.value === 1) editValue.value = String(exercise.sets);
            else if (editCellIndex.value === 2) editValue.value = String(exercise.reps);
        } else if (type === 'planName') {
            const plan = plans.value.find(p => p.id === index);
            if (!plan) {
                console.error('Plan nicht gefunden für ID:', index);
                openValidationPopup(['Plan nicht gefunden']);
                return;
            }
            editValue.value = plan.name;
        } else if (type === 'selectedPlanName') {
            if (!selectedPlan.value) {
                console.error('Kein ausgewählter Plan vorhanden');
                openValidationPopup(['Kein ausgewählter Plan']);
                return;
            }
            editValue.value = selectedPlan.value.name;
        } else if (type === 'timerName') {
            const timer = props.timers.find(t => t.id === index);
            if (!timer) {
                console.error('Timer nicht gefunden für ID:', index);
                openValidationPopup(['Timer nicht gefunden']);
                return;
            }
            editValue.value = timer.name || '';
        } else if (type === 'stopwatchName') {
            console.log('Bearbeite Stoppuhrname für ID:', index);
            const stopwatch = props.stopwatches.find(s => s.id === index);
            if (!stopwatch) {
                console.error('Keine Stoppuhr mit ID gefunden:', index);
                openValidationPopup(['Stoppuhr nicht gefunden']);
                return;
            }
            editValue.value = stopwatch.name || '';
            console.log('editValue gesetzt:', editValue.value);
        } else if (type === 'customExerciseName') {
            const exercise = customExercises.value[index as number];
            if (!exercise) {
                console.error('Benutzerdefinierte Übung nicht gefunden für Index:', index);
                openValidationPopup(['Übung nicht gefunden']);
                return;
            }
            editValue.value = exercise.name;
        } else if (type === 'customExerciseMuscle') {
            const exercise = customExercises.value[index as number];
            if (!exercise) {
                console.error('Muskelgruppe nicht gefunden für Index:', index);
                openValidationPopup(['Muskelgruppe nicht gefunden']);
                return;
            }
            editValue.value = exercise.muscle;
        }

        showEditPopup.value = true;
        console.log('showEditPopup gesetzt:', showEditPopup.value);
        
    };

    const saveEdit = () => {
        console.log('saveEdit aufgerufen mit:', { editType: editType.value, editValue: editValue.value });
        if (editType.value === 'table' && typeof editIndex.value === 'number') {
            const exercise = selectedPlanExercises.value[editIndex.value];
            if (!exercise) return;
            if (editCellIndex.value === 0 && editValue.value) {
                if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === editValue.value.trim().toLowerCase() && ex !== exercise)) {
                    openValidationPopup(['Übung existiert bereits im Plan']);
                    return;
                }
                exercise.exercise = editValue.value.trim();
                addToast('Übung aktualisiert', 'save');
            } else if (editCellIndex.value === 1) {
                const sets = Number(editValue.value);
                const setsError = validateSets(sets);
                if (setsError) {
                    openValidationPopup([setsError]);
                    return;
                }
                exercise.sets = sets;
                addToast('Sätze aktualisiert', 'save');
            } else if (editCellIndex.value === 2) {
                const reps = Number(editValue.value);
                const repsError = validateReps(reps);
                if (repsError) {
                    openValidationPopup([repsError]);
                    return;
                }
                exercise.reps = reps;
                addToast('Wiederholungen aktualisiert', 'save');
            }
        } else if (editType.value === 'selectedPlan' && typeof editIndex.value === 'number' && selectedPlan.value) {
            const exercise = selectedPlan.value.exercises[editIndex.value];
            if (!exercise) return;
            if (editCellIndex.value === 0 && editValue.value) {
                if (selectedPlan.value.exercises.some(ex => ex.exercise.toLowerCase() === editValue.value.trim().toLowerCase() && ex !== exercise)) {
                    openValidationPopup(['Übung existiert bereits im Plan']);
                    return;
                }
                exercise.exercise = editValue.value.trim();
                updatePlanInStorage();
                addToast('Übung aktualisiert', 'save');
            } else if (editCellIndex.value === 1) {
                const sets = Number(editValue.value);
                const setsError = validateSets(sets);
                if (setsError) {
                    openValidationPopup([setsError]);
                    return;
                }
                exercise.sets = sets;
                updatePlanInStorage();
                addToast('Sätze aktualisiert', 'save');
            } else if (editCellIndex.value === 2) {
                const reps = Number(editValue.value);
                const repsError = validateReps(reps);
                if (repsError) {
                    openValidationPopup([repsError]);
                    return;
                }
                exercise.reps = reps;
                updatePlanInStorage();
                addToast('Wiederholungen aktualisiert', 'save');
            }
        } else if (editType.value === 'planName' && typeof editIndex.value === 'string') {
            const validatedName = validatePlanName(editValue.value);
            if (validatedName === false) {
                openValidationPopup([
                    editValue.value.trim().length < 3
                        ? 'Planname muss mindestens 3 Zeichen lang sein'
                        : 'Planname darf maximal 20 Zeichen lang sein'
                ]);
                return;
            }
            const plan = plans.value.find(p => p.id === editIndex.value);
            if (plan) {
                plan.name = validatedName;
                saveToStorage();
                addToast('Planname aktualisiert', 'save');
            }
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
            selectedPlan.value.name = validatedName;
            updatePlanInStorage();
            addToast('Planname aktualisiert', 'save');
        } else if (editType.value === 'timerName' && typeof editIndex.value === 'string') {
            const timer = props.timers.find(t => t.id === editIndex.value);
            if (timer) {
                timer.name = editValue.value.trim();
                saveToStorage();
                addToast('Timername aktualisiert', 'timer');
            }
        } else if (editType.value === 'stopwatchName' && typeof editIndex.value === 'string') {
            const validatedName = validateStopwatchName(editValue.value);
            if (validatedName === false) {
                openValidationPopup(['Stoppuhr darf maximal 30 Zeichen lang sein']);
                return;
            }
            const stopwatch = props.stopwatches.find(s => s.id === editIndex.value);
            if (stopwatch) {
                stopwatch.name = validatedName;
                saveToStorage();
                addToast('Stoppuhrname aktualisiert', 'timer');
            }
        } else if (editType.value === 'customExerciseName' && typeof editIndex.value === 'number') {
            const exercise = customExercises.value[editIndex.value];
            if (!exercise) return;
            const validated = validateCustomExercise(editValue.value, exercise.muscle, editIndex.value);
            if (typeof validated === 'string') {
                openValidationPopup([validated]);
                return;
            }
            exercise.name = validated.name;
            saveToStorage();
            addToast('Übungsname aktualisiert', 'save');
        } else if (editType.value === 'customExerciseMuscle' && typeof editIndex.value === 'number') {
            const exercise = customExercises.value[editIndex.value];
            if (!exercise) return;
            const validated = validateCustomExercise(exercise.name, editValue.value, editIndex.value);
            if (typeof validated === 'string') {
                openValidationPopup([validated]);
                return;
            }
            exercise.muscle = validated.muscle;
            saveToStorage();
            addToast('Muskelgruppe aktualisiert', 'save');
        }
        closeEditPopup();
    };

    // unter deinen anderen imports/refs:
    const onTrainingFocus = (e: Event) => {
        const { type, id } = (e as CustomEvent<{ type: 'timer' | 'stopwatch'; id: string }>).detail
        // dieselbe Logik wie beim initialen Fokus
        localStorage.setItem('trainingFocusType', type)
        localStorage.setItem('trainingFocusId', id)
        nextTick(() => tryFocusFromStorage())
    }

    onMounted(() => {
        window.addEventListener('training:focus', onTrainingFocus as EventListener)
    })

    onUnmounted(() => {
        window.removeEventListener('training:focus', onTrainingFocus as EventListener)
    })

    const updatePlanInStorage = () => {
        if (selectedPlan.value) {
            const index = plans.value.findIndex(p => p.id === selectedPlan.value!.id);
            if (index !== -1) {
                plans.value[index] = { ...selectedPlan.value };
                saveToStorage();
            }
        }
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

    const closeTimerPopup = () => {
        showTimerPopup.value = false;
    };

    const handleOverlayClick = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
            closeEditPopup();
            closeDeletePopup();
            closeTimerPopup();
            closeAddTimerPopup();
            closeAddStopwatchPopup();
            closeDownloadPopup();
            closeValidationPopup();
        }
    };

    const handleKeydown = (event: KeyboardEvent) => {
        // Wenn das Edit-Popup offen ist, handled es Enter/Escape selbst
        if (showEditPopup.value) return;

        if (event.key === 'Escape') {
            if (showValidationPopup.value) {
                closeValidationPopup();
            } else {
                closeEditPopup();
                closeDeletePopup();
                closeTimerPopup();
                closeAddTimerPopup();
                closeAddStopwatchPopup();
                closeDownloadPopup();
            }
        } else if (event.key === 'Enter') {
            if (showValidationPopup.value) {
                event.preventDefault();
                closeValidationPopup();
            } else if (showDeletePopup.value) {
                event.preventDefault();
                confirmDeleteAction();
            } else if (showAddTimerPopup.value) {
                event.preventDefault();
                addTimer();
            } else if (showAddStopwatchPopup.value) {
                event.preventDefault();
                addStopwatch();
            }
        }
    };


    const checkScroll = () => {
        // Timer
        const stickyTimers = props.timers.filter(t => t.shouldStaySticky);
        let visibleTimerFound = false;
        for (const t of stickyTimers) {
            const el = document.querySelector(`.timer-card[data-timer-id="${t.id}"]`);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    visibleTimerFound = true;
                    break;
                }
            }
        }
        isTimerSticky.value = stickyTimers.length > 0 && !visibleTimerFound;

        // Stoppuhren
        const stickyStopwatches = props.stopwatches.filter(sw => sw.shouldStaySticky);
        let visibleStopwatchFound = false;
        for (const sw of stickyStopwatches) {
            const el = document.querySelector(`.timer-card[data-stopwatch-id="${sw.id}"]`);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                    visibleStopwatchFound = true;
                    break;
                }
            }
        }
        isStopwatchSticky.value = stickyStopwatches.length > 0 && !visibleStopwatchFound;
    };
    const initResizeTable = () => {
        const table = resizeTable.value;
        if (!table) return;

        // Cleanup: alte Resizer entfernen, falls Funktion mehrfach aufgerufen wird
        table.querySelectorAll('.resizer').forEach(el => el.remove());

        const ths = table.querySelectorAll('th.resizable');
        const resizers: HTMLElement[] = [];

        ths.forEach((th, colIndex) => {
            const resizer = document.createElement('div');
            resizer.className = 'resizer';
            resizer.style.width = '10px';
            resizer.style.height = '100%';
            resizer.style.position = 'absolute';
            resizer.style.right = '0';
            resizer.style.top = '0';
            resizer.style.cursor = 'col-resize';
            (th as HTMLElement).style.position = 'relative';
            th.appendChild(resizer);
            resizers.push(resizer);

            let startX: number;
            let startWidths: number[];

            const onMouseDown = (e: MouseEvent) => {
                e.preventDefault();
                startX = e.pageX;
                startWidths = [...columnWidths.value];
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            const onMouseMove = (e: MouseEvent) => {
                requestAnimationFrame(() => {
                    const tableWidth = table.getBoundingClientRect().width;
                    const diffX = e.pageX - startX;
                    const currentColWidth = (startWidths[colIndex] / 100) * tableWidth;
                    const nextColWidth = colIndex < startWidths.length - 1 ? (startWidths[colIndex + 1] / 100) * tableWidth : 0;

                    const newCurrentColWidth = Math.max(50, currentColWidth + diffX);
                    const newNextColWidth = colIndex < startWidths.length - 1 ? Math.max(50, nextColWidth - diffX) : 0;

                    const totalWidth = tableWidth;
                    const newCurrentColPercent = (newCurrentColWidth / totalWidth) * 100;
                    const newNextColPercent = colIndex < startWidths.length - 1 ? (newNextColWidth / totalWidth) * 100 : startWidths[colIndex + 1];

                    const newWidths = [...startWidths];
                    newWidths[colIndex] = newCurrentColPercent;
                    if (colIndex < startWidths.length - 1) newWidths[colIndex + 1] = newNextColPercent;

                    const totalPercent = newWidths.reduce((sum, w) => sum + w, 0);
                    newWidths.forEach((_, i) => newWidths[i] = (newWidths[i] / totalPercent) * 100);

                    columnWidths.value = newWidths;
                });
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            resizer.addEventListener('mousedown', onMouseDown);
        });

        const rows = table.querySelectorAll('tr.resizable-row');
        rows.forEach((row, rowIndex) => {
            const resizer = document.createElement('div');
            resizer.className = 'resizer row-resizer';
            resizer.style.width = '100%';
            resizer.style.height = '10px';
            resizer.style.position = 'absolute';
            resizer.style.bottom = '0';
            resizer.style.left = '0';
            resizer.style.cursor = 'row-resize';
            (row as HTMLElement).style.position = 'relative';
            row.appendChild(resizer);
            resizers.push(resizer);

            let startY: number;
            let startHeight: number;

            const onMouseDown = (e: MouseEvent) => {
                e.preventDefault();
                startY = e.pageY;
                startHeight = rowHeights.value[rowIndex] || 40;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            };

            const onMouseMove = (e: MouseEvent) => {
                requestAnimationFrame(() => {
                    const diffY = e.pageY - startY;
                    const newHeight = Math.max(30, startHeight + diffY);
                    rowHeights.value[rowIndex] = newHeight;
                });
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            resizer.addEventListener('mousedown', onMouseDown);
        });

        const cleanupResizers = () => {
            resizers.forEach(resizer => resizer.remove());
        };

        onUnmounted(() => cleanupResizers());
    };

    const initAudioElements = () => {
        Object.entries(audioPaths).forEach(([key, path]) => {
            const audio = document.getElementById(`audio-${key}`) as HTMLAudioElement;
            if (audio) audio.src = path;
        });
    };

    onMounted(() => {
        loadFromStorage();
        tryFocusFromStorage()
        requestNotificationPermission();
        window.addEventListener('scroll', checkScroll);
        window.addEventListener('keydown', handleKeydown);
        initResizeTable();
        initAudioElements();
        tryOpenPlanFromStorage(); // 👈 neu: öffnet Plan, wenn von „Trainingspläne“ aus gewählt
        console.log('Stopwatches beim Mounten (Training.vue):', props.stopwatches);
    });



    onUnmounted(() => {
        window.removeEventListener('scroll', checkScroll);
        window.removeEventListener('keydown', handleKeydown);
        
    });

    // Öffnet ggf. einen von außerhalb gewählten Plan
    const tryOpenPlanFromStorage = () => {
        const id = localStorage.getItem('trainingOpenPlanId')
        if (id) {
            loadPlan(id)
            localStorage.removeItem('trainingOpenPlanId')
        }
    }

    watch(() => [props.timers, props.stopwatches], () => {
        console.log('timers oder stopwatches geändert:', { timers: props.timers, stopwatches: props.stopwatches });
        nextTick(() => checkScroll());
    }, { deep: true });

    watch(selectedPlan, (val) => {
        if (val) nextTick(() => initResizeTable());
    });
    watch(plans, () => {
        saveToStorage();
    }, { deep: true });
    watch(
        () => props.timers.map(t => ({ id: t.id, time: t.time, sound: t.sound })),
        (now) => {
            for (const { id, time, sound } of now) {
                const prev = prevTimes.get(id);

                if (prev === undefined) {
                    prevTimes.set(id, time);
                    continue;
                }

                // Wechsel von >0 auf <=0 → Timer fertig
                if (prev > 0 && time <= 0 && !finishedOnce.has(id)) {
                    finishedOnce.add(id);
                    showTimerPopup.value = true; // Popup zeigen
                    playTimerSound(sound || 'standard');
                    sendNotification('Timer fertig', 'Deine Satzpause ist vorbei 💪');

                    const timer = props.timers.find(t => t.id === id);
                    if (timer && timer.isRunning) {
                        props.stopTimer(timer); // Parent regelt Interval + State
                    }

                }

                // Reset, wenn wieder >0
                if (time > 0 && finishedOnce.has(id)) {
                    finishedOnce.delete(id);
                }

                prevTimes.set(id, time);
            }
        },
        { deep: true }
    );
</script>

<style scoped>
    .training {
        padding: 1rem;
        background: var(--bg-primary);
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 0;
    }

    html.dark-mode .training {
        background: #161b22;
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
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem;
        box-sizing: border-box;
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }

    html.dark-mode .section-title {
        color: #ffffff;
    }

    .timer-container .plan-header,
    .stopwatch-top .plan-header {
        justify-content: center;
    }

    .plan-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        position: relative;
    }

    /* Draggable-Container so stylen wie vorher die Liste */
    .drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem; /* Abstand zwischen den Cards wie vorher */
        width: 100%;
    }

        /* Sicherheitsnetz: Cards sollen volle Breite behalten */
        .drag-stack > .timer-card {
            width: 100%;
            max-width: 1200px;
        }

    /* Optional: während Drag nicht zusammenschrumpfen */
    .drag-ghost {
        opacity: 0.6;
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

    .form-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        width: 100%;
    }

    .search-container {
        margin-bottom: 1rem;
        width: 100%;
    }

    .plan-search-input {
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        width: 100%;
        font-size: 0.9rem;
        background: var(--bg-secondary);
        color: var(--text-color);
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    html.dark-mode .plan-search-input {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .plan-search-input:focus {
        border-color: #4B6CB7;
        box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
        outline: none;
    }

    html.dark-mode .form-card {
        background: #1c2526;
    }

    .form-card input,
    .form-card select {
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        flex: 1;
        min-width: 120px;
        font-size: 0.9rem;
        background: var(--bg-secondary);
        color: var(--text-color);
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    html.dark-mode .form-card input,
    html.dark-mode .form-card select {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .form-card input:focus,
    .form-card select:focus {
        border-color: #4B6CB7;
        box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
        outline: none;
    }

    .form-card button {
        background: linear-gradient(45deg, #4B6CB7, #182848);
        color: #ffffff;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s, transform 0.2s;
    }

        .form-card button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

    .extras-container {
        transition: max-height 0.3s ease, opacity 0.3s ease;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        width: 100%;
    }

        .extras-container.show {
            max-height: 250px;
            opacity: 1;
            margin-top: 0.1rem
        }

    .timer-drag-handle {
        cursor: grab;
        user-select: none;
        margin-right: .5rem;
    }

    .extras-content {
        display: flex;
        gap: 1.5rem;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
    }

    .form-card button[type="submit"] {
        width: 100%;
    }

    .extras-button-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
    }

    /* Draggable-Container für Trainingspläne mit mehr vertikalem Abstand */
    .plan-drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1.25rem; /* hier stellst du ein, wie weit auseinander die Cards sein sollen */
        width: 100%;
    }

        /* Safety: Items auf volle Breite lassen */
        .plan-drag-stack > .plan-item {
            width: 100%;
        }

    /* Buttons rechts im Plan-Item vertikal zentrieren */
    .list-item-actions {
        display: flex;
        gap: 0.6rem;
        align-items: center; /* <— NEU */
    }

        /* Einheitliches Innenleben für alle Buttons (Icon + Text) */
        .list-item-actions .action-btn {
            line-height: 1; /* kein extra Line-Height */
            display: inline-flex; /* saubere vertikale Zentrierung im Button */
            align-items: center;
            justify-content: center;
        }

    .toggle-exercise-btn {
        margin-top: 1rem;
        padding: 0.6rem 1.2rem;
        background: var(--bg-secondary);
        color: #1f2937; /* Dunkle Textfarbe für Kontrast */
        border-radius: 0.5rem;
        border: none; /* Kein Rahmen */
        cursor: pointer;
        font-size: 0.95rem;
        transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }

        .toggle-exercise-btn:hover {
            background-color: #f3f4f6; /* Leicht grauer Hover-Effekt */
            border-color: #4B6CB7; /* Blauer Rand wie beim Fokus */
            transform: scale(1.02);
        }

    html.dark-mode .toggle-exercise-btn {
        background-color: #1f2937; /* Ursprüngliche Farbe im Dark Mode */
        color: #fff;
        border: 1px solid #30363d;
    }

        html.dark-mode .toggle-exercise-btn:hover {
            background-color: #374151;
            border-color: #4B6CB7;
        }

    .custom-ex-title {
        font-size: 1.1rem;
        margin: 1rem 0 0.5rem;
        color: #111827;
    }

    .custom-exercises-table table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        background-color: #f9fafb;
    }

    .custom-exercises-table th,
    .custom-exercises-table td {
        padding: 0.75rem;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
    }

    .custom-exercises-table th {
        background-color: #e5e7eb;
        font-weight: 600;
        font-size: 0.95rem;
        color: #1f2937;
    }

    .custom-exercises-table td {
        font-size: 0.92rem;
        color: #374151;
    }

        .custom-exercises-table td input {
            width: 90%;
            padding: 0.3rem 0.5rem;
            font-size: 0.9rem;
            border: 1px solid #d1d5db;
            border-radius: 0.4rem;
            outline: none;
        }

            .custom-exercises-table td input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
            }

    .delete-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        color: #ef4444;
        transition: transform 0.2s ease;
    }

        .delete-btn:hover {
            transform: scale(1.2);
        }


    @media (max-width: 600px) {
        .form-card {
            flex-direction: column;
            gap: 0.75rem;
        }

        .exercise-input-group {
            flex-direction: column;
            gap: 0.5rem;
        }

        .form-card input,
        .form-card select {
            width: 100%;
        }

        .extras-button-group {
            flex-direction: column;
            gap: 0.5rem;
        }
    }

    .edit-btn,
    .delete-btn,
    .download-btn,
    .open-btn,
    .table-delete-btn,
    .close-plan-btn,
    .close-timer-btn,
    .add-timer-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #6b7280;
        border-radius: 8px;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
    }

    .delete-btn,
    .table-delete-btn {
        color: #6b7280;
    }

        .delete-btn:hover,
        .table-delete-btn:hover {
            color: #7f1d1d;
            text-shadow: 0 0 8px rgba(127, 29, 29, 0.5), 0 0 4px rgba(127, 29, 29, 0.5);
            transform: scale(1.1);
        }

        .table-delete-btn.transparent {
            background: transparent !important;
            box-shadow: none !important;
        }

    html.dark-mode .delete-btn:hover,
    html.dark-mode .table-delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px #7f1d1d, 0 0 4px #7f1d1d;
    }



    .close-plan-btn,
    .close-timer-btn {
        color: #ff6b6b;
    }

        .close-plan-btn:hover,
        .close-timer-btn:hover {
            color: #b91c1c;
            transform: scale(1.1);
        }

    .close-plan-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }

    .exercise-input-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        width: 100%;
    }

    .exercise-table {
        margin-top: 1rem;
        width: 100%;
        border-collapse: collapse;
        background: var(--bg-card);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        table-layout: fixed;
    }

    html.dark-mode .exercise-table {
        background: #1c2526;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .exercise-table th,
    .exercise-table td {
        padding: 1rem;
        text-align: center;
        border-bottom: 1px solid var(--border-color);
    }

    .exercise-table th {
        background: #f1f5f9;
    }

    html.dark-mode .exercise-table th {
        background: #0d1117;
        color: #ffffff;
    }

    .exercise-table tr:nth-child(even) {
        background: #f9fafb;
    }

    html.dark-mode .exercise-table tr:nth-child(even) {
        background: #21262d;
    }

    .exercise-table tr:hover {
        background: #d1d5db;
    }

    html.dark-mode .exercise-table tr:hover {
        background: #2d333b;
    }

    .exercise-table.full-width {
        table-layout: fixed;
        width: 100%;
        margin: 0 auto;
        position: relative;
    }

        .exercise-table.full-width table {
            width: 100%;
        }

        .exercise-table.full-width th,
        .exercise-table.full-width td {
            padding: 1.5rem;
            text-align: center;
            min-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

    html.dark-mode .exercise-table.full-width th,
    html.dark-mode .exercise-table.full-width td {
        border-bottom: 1px solid #30363d;
    }

    .exercise-table.full-width th {
        background: #f1f5f9;
        color: var(--text-primary);
        font-weight: 600;
        position: relative;
    }

    html.dark-mode .exercise-table.full-width th {
        background: #0d1117;
        color: #ffffff;
    }

    .exercise-table.full-width th.resizable:hover::after {
        content: '';
        position: absolute;
        right: -5px;
        top: 0;
        width: 10px;
        height: 100%;
        cursor: col-resize;
    }
    .flash-focus {
        outline: 2px solid var(--accent-primary);
        box-shadow: 0 0 0 3px var(--accent-primary), 0 0 18px var(--accent-hover);
        transition: box-shadow .3s ease;
    }

    .exercise-table.full-width tr.resizable-row:hover::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 10px;
        cursor: row-resize;
    }

    .exercise-table.full-width tr:hover {
        background: #d1d5db;
    }

    html.dark-mode .exercise-table.full-width tr:hover {
        background: #2d333b;
    }

    .exercise-table.full-width td {
        color: var(--text-secondary);
    }

    html.dark-mode .exercise-table.full-width td {
        color: #c9d1d9;
    }

    .timer-container,
    .stopwatch-top {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        position: relative;
    }

    .timer-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        transition: box-shadow 0.2s;
    }

    html.dark-mode .timer-card {
        background: #1c2526;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .timer-card:hover {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .timer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .custom-exercise-list .delete-btn {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        margin-left: 0.5rem;
        font-size: 1rem;
    }

    .custom-exercise-list li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 0;
    }

    .timer-actions {
        display: flex;
        gap: 0.5rem;
    }

    .timer-name {
        cursor: pointer;
        font-weight: 600;
        font-size: 1.2rem;
        text-align: left;
        pointer-events: auto;
    }

    .timer-display,
    .timer {
        font-size: 3rem;
        font-weight: 800;
        color: var(--text-primary);
        width: 100%;
        max-width: 400px;
        text-align: center;
        font-family: 'Roboto Mono', monospace;
        background: linear-gradient(45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.1));
        padding: 0.75rem;
        border-radius: 4px;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
        margin: 0 auto;
    }

    html.dark-mode .timer-display,
    html.dark-mode .timer {
        color: #ffffff;
        background: linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1));
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .timer-display:hover,
    .timer:hover {
        transform: scale(1.02);
        box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .drag-ghost {
        opacity: 0.6;
    }

    .plan-drag-handle {
        cursor: grab;
        margin-right: .5rem;
        user-select: none;
    }

    .timer-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
        width: 100%;
    }

    .timer-input-group {
        display: flex;
        gap: 0.5rem;
        width: 100%;
        justify-content: center;
    }

    .timer-select,
    .timer-input {
        padding: 0.5rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: 0.9rem;
        width: 150px;
    }

    html.dark-mode .timer-select,
    html.dark-mode .timer-input {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .timer-select:focus,
    .timer-input:focus {
        border-color: #4B6CB7;
        box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
        outline: none;
    }

    .timer-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .timer-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
    }

    .lap-btn {
        background: #4B6CB7;
        color: #ffffff;
    }

        .lap-btn:hover {
            background: #3b5ca8;
            transform: scale(1.05);
        }

    .timer-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .laps-container {
        width: 100%;
        max-width: 400px;
        margin-top: 1rem;
    }

        .laps-container h4 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-align: center;
        }

    .laps-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .lap-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        background: var(--bg-secondary);
        border-radius: 8px;
    }

    html.dark-mode .lap-item {
        background: #0d1117;
    }

    .sticky-timer,
    .sticky-stopwatch {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: var(--bg-card);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        padding: 1rem;
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    html.dark-mode .sticky-timer,
    html.dark-mode .sticky-stopwatch {
        background: #1c2526;
    }

    .sticky-timer-card {
        background: var(--bg-secondary);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    html.dark-mode .sticky-timer-card {
        background: #0d1117;
    }

    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }

    .popup {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
    }

    html.dark-mode .popup {
        background: #1c2526;
        color: #c9d1d9;
    }

    .popup-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .popup .input-group {
        margin-bottom: 1.5rem;
    }

    .edit-popup .input-group {
        margin-bottom: 1rem;
    }

    .edit-input {
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        width: 100%;
        font-size: 0.9rem;
        background: var(--bg-secondary);
        color: var(--text-color);
    }

    html.dark-mode .edit-input {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .edit-input:focus {
        border-color: #4B6CB7;
        box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
        outline: none;
    }

    .input-group label.downloaddistance {
        margin-bottom: 0.7rem; /* oder mehr, wenn du mehr Abstand willst */
        display: block;
    }

    .popup-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    .popup-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
    }

    .save-btn {
        background: #10b981;
        color: #ffffff;
    }

        .save-btn:hover {
            background: #064e3b;
            transform: scale(1.05);
        }

    .cancel-btn {
        background: #6b7280;
        color: #ffffff;
    }

        .cancel-btn:hover {
            background: #4b5563;
            transform: scale(1.05);
        }

    .delete-confirm-btn {
        background: #ef4444;
        color: #ffffff;
    }

        .delete-confirm-btn:hover {
            background: #b91c1c;
            transform: scale(1.05);
        }

    .resizer.column-resizer {
        position: absolute;
        right: 0;
        top: 0;
        width: 10px;
        height: 100%;
        cursor: col-resize;
        user-select: none;
    }

    .resizer.row-resizer {
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 10px;
        cursor: row-resize;
        user-select: none;
    }
</style>