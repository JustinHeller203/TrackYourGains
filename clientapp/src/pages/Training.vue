 <!-- Training.vue -->
<template>
    <div class="training">
        <h2 class="page-title">💪 Training</h2>
        <!-- Trainingsplan Formular -->
        <div class="workout-list builder-section" ref="builderSection">
            <h3 class="section-title">Trainingsplan erstellen/bearbeiten</h3>

            <form @submit.prevent="createOrUpdatePlan" class="form-card builder-grid">
                <!-- LEFT: Builder -->
                <div class="builder-left">
                    <!-- Kopf: Planname + Typ (Segmented) + Extras rechts -->
                    <div class="builder-head">
                        <!-- NEU: Planname mit Überschrift -->
                        <div class="plan-block">
                            <label for="plan-name" class="field-label">Planname</label>
                            <input id="plan-name"
                                   v-model="planName"
                                   class="plan-name-input slim"
                                   placeholder="Planname (z. B. Push Day)"
                                   required />
                        </div>

                        <!-- Trainingstyp (Desktop: Segmented + Überschrift) -->
                        <div class="type-block desktop-only">
                            <span class="type-heading field-label">Trainingstyp</span>
                            <div class="segmented seg-type">
                                <button type="button" :class="{ on: trainingType==='kraft' }" @click="trainingType='kraft'">Kraft</button>
                                <button type="button" :class="{ on: trainingType==='calisthenics' }" @click="trainingType='calisthenics'">Calisthenics</button>
                                <button type="button" :class="{ on: trainingType==='ausdauer' }" @click="trainingType='ausdauer'">Ausdauer</button>
                                <button type="button" :class="{ on: trainingType==='dehnung' }" @click="trainingType='dehnung'">Dehnung</button>
                            </div>
                        </div>

                        <!-- Trainingstyp (Mobile ≤560px: Label + Dropdown) -->
                        <div class="type-block mobile-only">
                            <label class="type-heading field-label" for="training-type">Trainingstyp</label>
                            <UiSelect v-model="trainingTypeSafe"
                                      id="training-type"
                                      aria-label="Trainingstyp wählen"
                                      placeholder="Trainingstyp wählen"
                                      :options="[
            { value: 'kraft',        label: 'Kraft' },
            { value: 'calisthenics', label: 'Calisthenics' },
            { value: 'ausdauer',     label: 'Ausdauer' },
            { value: 'dehnung',      label: 'Dehnung' }
          ]" />
                        </div>

                        <!-- Extras-Button rechtsbündig (unverändert) -->
                        <ExtrasToggleButton :extraClass="['action-btn','extras-cta']"
                                            :toggled="showExtras"
                                            :title="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                            :aria-label="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                            @click="toggleExtras" />
                    </div>

                    <div v-show="showExtras" class="goal-row">
                        <label class="field-label">Trainingsziel</label>
                        <div class="field-row">
                            <UiSelect v-model="selectedGoalSafe"
                                      class="goal-select"
                                      placeholder="Trainingsziel"
                                      :options="trainingGoals" />
                        </div>
                    </div>

                    <!-- Filter -->
                    <div class="field-block" v-if="trainingType !== 'ausdauer'">
                        <label class="field-label">Muskelgruppe</label>
                        <div class="field-row">
                            <input class="filter-input"
                                   v-model="exerciseFilter"
                                   placeholder="z. B. Brust, Oberkörper, Push" />
                        </div>
                    </div>

                    <!-- Übungsauswahl -->
                    <div class="field-block" v-if="trainingType !== 'ausdauer'">
                        <label class="field-label">Übung</label>
                        <div class="field-row">
                            <UiSelect v-model="newExerciseSafe"
                                      placeholder="Übung wählen"
                                      :options="[
    ...filteredExercises,
    { value: 'custom', label: 'Eigene Übung hinzufügen…', isCustom: true }
  ]" />

                            <input v-show="newExercise === 'custom'"
                                   v-model="customPlanExercise"
                                   placeholder="Eigene Übung eingeben" />
                        </div>
                    </div>

                    <!-- Cardio -->
                    <div class="field-block" v-else>
                        <label class="field-label">Cardio-Art</label>
                        <div class="field-row">
                            <UiSelect v-model="cardioExerciseSafe"
                                      placeholder="Cardio-Art"
                                      :options="filteredExercises" />
                        </div>
                    </div>

                    <!-- Parameter -->
                    <div class="field-grid" v-if="trainingType === 'kraft' || trainingType === 'calisthenics'">
                        <div class="field">
                            <label>Sätze</label>
                            <input v-model.number="newSets" type="number" min="1" placeholder="z. B. 4" />
                        </div>
                        <div class="field">
                            <label>Wiederholungen</label>
                            <input v-model.number="newReps" type="number" min="1" placeholder="z. B. 8–12" />
                        </div>
                    </div>

                    <div class="field-grid" v-else-if="trainingType === 'dehnung'">
                        <div class="field">
                            <label>Holds</label>
                            <input v-model.number="newSets" type="number" min="1" placeholder="z. B. 3" />
                        </div>
                        <div class="field">
                            <label>Sekunden pro Hold</label>
                            <input v-model.number="newReps" type="number" min="1" placeholder="z. B. 30" />
                        </div>
                    </div>

                    <div class="field-grid" v-else>
                        <div class="field">
                            <label>Dauer (Min)</label>
                            <input v-model.number="newDuration" type="number" min="1" placeholder="z. B. 25" />
                        </div>
                        <div class="field">
                            <label>Distanz (km, optional)</label>
                            <input v-model.number="newDistance" type="number" min="0" step="0.1" placeholder="z. B. 5" />
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="actions-row stack">
                        <div class="button-group">
                            <div class="btn-cell">
                                <AddExerciseButton class="action-btn add-exercise-btn block"
                                                   title="Übung hinzufügen"
                                                   @click="addExerciseToPlan" />
                            </div>
                        </div>
                    </div>

                    <PlanSubmitButton class="action-btn"
                                      :isEditing="!!editingPlanId"
                                      :disabled="validatePlanName(planName) === false"
                                      createLabel="Plan erstellen"
                                      saveLabel="Plan speichern" />
                </div>

                <!-- RIGHT: Live Preview (sticky) -->
                <div class="builder-right">
                    <div class="preview-card">
                        <div class="preview-head">
                            <h4>Live-Preview</h4>
                            <span v-if="selectedPlanExercises.length" class="muted">
                                {{ selectedPlanExercises.length }} Übung{{ selectedPlanExercises.length===1?'':'en' }}
                            </span>
                        </div>

                        <Table v-if="selectedPlanExercises.length"
                               class="exercise-table full-width compact"
                               density="compact">
                            <table ref="previewTable" data-cols="4">
                                <thead>
                                    <tr>
                                        <!-- 3 resizable Spalten -->
                                        <th class="resizable" :style="{ width: previewColWidths[0] + '%' }">
                                            <span class="th-text">Übung</span>
                                        </th>
                                        <th class="resizable" :style="{ width: previewColWidths[1] + '%' }">
                                            <span class="th-text">
                                                {{ selectedPlanExercises.some(ex => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                            </span>
                                        </th>
                                        <th class="resizable th-wdh" :style="{ width: previewColWidths[2] + '%' }">
                                            <span class="th-text th-label">
                                                <span class="full">
                                                    {{
                    selectedPlanExercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'Wdh. / km / s'
                      : 'Wiederholungen'
                                                    }}
                                                </span>
                                                <span class="mid">
                                                    {{
                    selectedPlanExercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'Wdh./km/s'
                      : 'Wiederhol...'
                                                    }}
                                                </span>
                                                <span class="short">
                                                    {{
                    selectedPlanExercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'W/km/s'
                      : 'Wdh.'
                                                    }}
                                                </span>
                                            </span>
                                        </th>

                                        <!-- Aktion NICHT resizable, bekommt eigene feste Breite -->
                                        <th :style="{ width: previewColWidths[3] + '%' }">Aktion</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr v-for="(ex, index) in selectedPlanExercises"
                                        :key="index"
                                        @dblclick="openEditPopup('table', index, $event)">
                                        <td :style="{ width: previewColWidths[0] + '%' }">{{ ex.exercise }}</td>
                                        <td :style="{ width: previewColWidths[1] + '%' }">
                                            {{ ex.type === 'ausdauer' ? `${ex.sets} min` : ex.sets }}
                                        </td>
                                        <td :style="{ width: previewColWidths[2] + '%' }">
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
                                        <td class="action-cell">
                                            <DeleteButton class="table-delete-btn"
                                                          title="Übung entfernen"
                                                          @click="removeExerciseFromPlan(index)" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Table>

                        <div v-else class="empty-preview">
                            <span>Noch keine Übung hinzugefügt.</span>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <div v-if="auth.user && plans.length" class="workout-list">
            <h3 class="section-title">Deine Trainingspläne</h3>

            <UiSearch v-model="planSearch"
                      placeholder="Nach Planname oder Trainingsziel suchen"
                      aria-label="Trainingspläne durchsuchen"
                      class="plan-search" />

            <!-- Favoriten sortieren -->
            <Draggable v-if="favoritePlanItems.length"
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
                                <span class="plan-count">({{ plan.exercises.length }} Übungen)</span>
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
            <Draggable v-model="otherPlanItems"
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
                                <span class="plan-count">({{ plan.exercises.length }} Übungen)</span>
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
                    Trainingsplan: {{ selectedPlan.name }}
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
                                    {{ selectedPlan.exercises.some(ex => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                </span>
                            </th>
                            <th class="resizable th-wdh" :style="{ width: columnWidths[2] + '%' }">
                                <span class="th-text th-label">
                                    <span class="full">
                                        {{
        selectedPlan.exercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
          ? 'Wdh. / km / s'
          : 'Wiederholungen'
                                        }}
                                    </span>
                                    <span class="mid">
                                        {{
        selectedPlan.exercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
          ? 'Wdh./km/s'
          : 'Wiederhol...'
                                        }}
                                    </span>
                                    <span class="short">
                                        {{
        selectedPlan.exercises.some(ex => ex.type === 'ausdauer' || ex.type === 'dehnung')
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
                                <td :style="{ width: customColWidths[0] + '%' }" @dblclick="openEditPopup('customExerciseName', i)">
                                    <input v-if="exerciseEditIndex === i && exerciseEditField === 'name'"
                                           v-model="ex.name" @blur="finishEdit" @keyup.enter="finishEdit" />
                                    <span v-else>{{ ex.name }}</span>
                                </td>

                                <td class="v-stack" :style="{ width: customColWidths[1] + '%' }" @dblclick="openEditPopup('customExerciseMuscle', i)">
                                    <input v-if="exerciseEditIndex === i && exerciseEditField === 'muscle'"
                                           v-model="ex.muscle" @blur="finishEdit" @keyup.enter="finishEdit" />
                                    <span v-else>{{ ex.muscle }}</span>
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
        <TimerComponent :timers="props.timers"
                        :dragDelay="dragDelay"
                        :startTimer="props.startTimer"
                        :stopTimer="props.stopTimer"
                        :resetTimer="props.resetTimer"
                        :openEditPopup="openEditPopup"
                        :addToast="addToast"
                        :dismissToast="dismissToast"
                        :stickyEnabled="stickyTimerEnabled"
                        @add-timer="onAddTimerFromChild"
                        @remove-timer="onRemoveTimerFromChild"
                        @reorder-timers="onReorderTimers" />

        <!-- Übungs-Stoppuhr -->
        <StopwatchComponent :stopwatches="props.stopwatches"
                            :dragDelay="dragDelay"
                            :toggleStopwatch="props.toggleStopwatch"
                            :resetStopwatch="props.resetStopwatch"
                            :addToast="addToast"
                            :stickyEnabled="stickyStopwatchEnabled"
                            @reorder="onReorderStopwatches"
                            @add-stopwatch="onAddStopwatchFromChild"
                            @remove-stopwatch="onRemoveStopwatchFromChild"
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
    import AddExerciseButton from '@/components/ui/buttons/AddExerciseButton.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue'
    import PlanSubmitButton from '@/components/ui/buttons/PlanSubmitButton.vue'
    import ExportPopup from '@/components/ui/popups/ExportPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'
    import UiSelect from '@/components/ui/kits/UiSelect.vue'
    import TimerComponent from '@/components/ui/training/TimerComponent.vue'
    import StopwatchComponent from '@/components/ui/training/StopwatchComponent.vue'
    import PlanMenu from '@/components/ui/menu/PlanMenu.vue'
    import UiSearch from '@/components/ui/kits/UiSearch.vue'
    import { useTrainingPlansStore } from "@/store/trainingPlansStore";
    import { useAuthStore } from '@/store/authStore';
    import type { TrainingPlanDto, TrainingPlanUpsert } from "@/types/trainingPlans";
    import type { TimerInstance, StopwatchInstance } from '@/types/training';
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
        exercises: PlanExercise[];
    };

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

    const onReorderTimers = (list: TimerInstance[]) => emit('reorder-timers', list);
    const onAddTimerFromChild = (timer: TimerInstance) => emit('add-timer', timer)
    const onAddStopwatchFromChild = (sw: StopwatchInstance) => emit('add-stopwatch', sw)
    const onRemoveStopwatchFromChild = (id: string) => emit('remove-stopwatch', id)
    const onRemoveTimerFromChild = (id: string) => emit('remove-timer', id)
    const onReorderStopwatches = (list: StopwatchInstance[]) => emit('reorder-stopwatches', list);

    // NEU: gemeinsamer Typ für Übungskategorien
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer';
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>;

    let onBeforeUnload: (() => void) | null = null
    let onVisChange: (() => void) | null = null

    const trainingPlansStore = useTrainingPlansStore();

    const auth = useAuthStore()

    const hardResetTrainingUi = () => {
        // Pinia Store sofort leeren -> UI verschwindet direkt
        try { trainingPlansStore.$reset() } catch { /* falls store kein $reset hat, siehe unten */ }

        // lokale UI-States killen
        closePlanMenu()
        selectedPlan.value = null
        selectedPlanExercises.value = []
        planSearch.value = ''
        editingPlanId.value = null
        planName.value = ''
        newExercise.value = ''
        customPlanExercise.value = ''
        newReps.value = null
        newSets.value = null
        newDuration.value = null
        newDistance.value = null
        selectedGoal.value = ''
        rowHeights.value = []
        showCustomExercises.value = false
        customExercises.value = []
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
        return { id: p.id, name: p.name, isFavorite: !!p.isFavorite, exercises: flat };
    };

    const plans = computed<ViewPlan[]>(() => trainingPlansStore.items.map(flattenDto));

    const favoritePlans = computed<string[]>(() => {
        const favIds = new Set(trainingPlansStore.items.filter(p => p.isFavorite).map(p => p.id));
        const order = readFavOrder().filter(id => favIds.has(id));
        const missing = Array.from(favIds).filter(id => !order.includes(id));
        const next = [...order, ...missing];
        writeFavOrder(next);
        return next;
    });

    const planName = ref('');
    const newExercise = ref('');
    const customPlanExercise = ref('');
    const newReps = ref<number | null>(null);
    const newSets = ref<number | null>(null);
    const trainingType = ref<'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung'>('kraft')
    const cardioTypes = ref([
        'Laufen', 'Radfahren', 'Rudern', 'Crosstrainer', 'Seilspringen', 'Treppensteigen', 'Schwimmen'
    ])
    const cardioExercise = ref('')
    const newDuration = ref<number | null>(null)
    const newDistance = ref<number | null>(null)
    const previewColWidths = ref([50, 25, 19, 6]); // Summe 100% (Übung | Sätze | Wdh | Aktion)
    const previewTable = ref<HTMLTableElement | null>(null);
    const editingPlanId = ref<string | null>(null);
    const selectedPlanExercises = ref<PlanExercise[]>([]);
    const selectedPlan = ref<TrainingPlan | null>(null);
    const showDeletePopup = ref(false);
    const showEditPopup = ref(false);
    const showDownloadPopup = ref(false);
    const showValidationPopup = ref(false);
    const validationErrorMessages = ref<string[]>([]);
    const downloadPlan = ref<TrainingPlan | null>(null);
    const downloadFormat = ref<'html' | 'pdf' | 'csv' | 'json' | 'txt'>('html');
    const customColWidths = ref([40, 30, 15, 15]); // Start: Name|Muskel|Typ|Aktion
    const customResizeTable = ref<HTMLTableElement | null>(null);
    const deleteAction = ref<(() => void) | null>(null);
    // Alias → Kanonische Gruppen
    const muscleGroupAliases: Record<string, string[]> = {
        // deutsch
        'brust': ['Brust'],
        'rücken': ['Rücken'], 'ruecken': ['Rücken'],
        'schulter': ['Schultern'], 'schultern': ['Schultern'],
        'arme': ['Arme'], 'arm': ['Arme'],
        'beine': ['Beine'], 'bein': ['Beine'], 'unterkörper': ['Beine', 'Bauch'], 'unterkoerper': ['Beine', 'Bauch'],
        'bauch': ['Bauch'], 'core': ['Bauch'],
        'oberkörper': ['Brust', 'Rücken', 'Schultern', 'Arme'], 'oberkoerper': ['Brust', 'Rücken', 'Schultern', 'Arme'],
        'po': ['Beine'], 'gesäß': ['Beine'], 'gluteus': ['Beine'],
        // Bewegungsmuster (Push/Pull) + Synonyme
        'push': ['Brust', 'Schultern', 'Arme'],
        'pull': ['Rücken', 'Arme'],
        'drücken': ['Brust', 'Schultern', 'Arme'],
        'ziehen': ['Rücken', 'Arme'],
        'push day': ['Brust', 'Schultern', 'Arme'],
        'pull day': ['Rücken', 'Arme'],
        'pushday': ['Brust', 'Schultern', 'Arme'],
        'pullday': ['Rücken', 'Arme'],

        // ein paar Untergruppen → Obergruppe (hilft auch Custom)
        'trizeps': ['Arme'],
        'bizeps': ['Arme'],
        'lat': ['Rücken'], 'lats': ['Rücken'], 'latissimus': ['Rücken'],

        // englische Synonyme, falls mal genutzt
        'chest': ['Brust'],
        'back': ['Rücken'],
        'shoulder': ['Schultern'], 'shoulders': ['Schultern'],
        'arms': ['Arme'], 'biceps': ['Arme'], 'triceps': ['Arme'],
        'legs': ['Beine'], 'lower body': ['Beine', 'Bauch'],
        'abs': ['Bauch'], 'core ': ['Bauch'], // core mit Space, um "core " Matches robust zu machen
        'upper body': ['Brust', 'Rücken', 'Schultern', 'Arme'],
    };

    // Calisthenics nach Muskelgruppen
    const calisthenicsByGroup: Record<string, string[]> = {
        Brust: ['Liegestütze', 'Archer Push-up', 'Dips'],
        Rücken: ['Klimmzüge', 'Australian Pull-up', 'Archer Pull-up'],
        Schultern: ['Handstand Push-up', 'Archer Push-up'],
        Arme: ['Dips', 'Klimmzüge', 'Archer Pull-up'],
        Bauch: ['L-Sit', 'Dragon Flag', 'Hollow Hold', 'Toes to Bar'],
        Beine: ['Pistol Squat'],
    };

    // Dehnübungen nach Muskelgruppen
    const stretchingByGroup: Record<string, string[]> = {
        Brust: ['Brust-Dehnung'],
        Rücken: ['Rücken-Dehnung'],
        Schultern: ['Schulter-Dehnung', 'Trizeps-Dehnung'],
        Arme: ['Trizeps-Dehnung'],
        Bauch: [],
        Beine: ['Hamstring-Dehnung', 'Waden-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung'],
    };

    // ADD in Training.vue (Refs für Custom-Dropdown)
    const exerciseDropdownOpen = ref(false)

    const newExerciseLabel = computed(() => {
        if (!newExercise.value) return 'Übung wählen'
        if (newExercise.value === 'custom') {
            return customPlanExercise.value || 'Eigene Übung hinzufügen…'
        }
        return newExercise.value
    })

    const selectExercise = (value: string) => {
        newExercise.value = value
        if (value !== 'custom') {
            customPlanExercise.value = ''
        }
        exerciseDropdownOpen.value = false
    }

    const newExerciseSafe = computed({
        get: () => newExercise.value,
        set: (val) => {
            // blockt Placeholder / leere Auswahl
            if (!val) return
            newExercise.value = val
        },
    })

    const cardioExerciseSafe = computed({
        get: () => cardioExercise.value,
        set: (val) => {
            if (!val) return
            cardioExercise.value = val
        },
    })

    const trainingTypeSafe = computed({
        get: () => trainingType.value,
        set: (val) => {
            if (!val) return              // kein „leerer“ Trainingstyp
            trainingType.value = val
        },
    })

    const selectedGoal = ref('');

    const selectedGoalSafe = computed({
        get: () => selectedGoal.value,
        set: (val) => {
            if (!val) return              // kein leeres Trainingsziel
            selectedGoal.value = val
        },
    })
    // Hilfsfunktionen
    const resolveGroups = (q: string): string[] => {
        const key = (q || '').trim().toLowerCase();
        return muscleGroupAliases[key] || [];
    };
    const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

    // Nur Calisthenics-Übungen
    const calisthenicsExercises = ref([
        'Klimmzüge', 'Liegestütze', 'Dips', 'Muscle-Up', 'Handstand Push-up',
        'L-Sit', 'Dragon Flag', 'Pistol Squat', 'Hollow Hold', 'Superman Hold',
        'Archer Pull-up', 'Archer Push-up', 'Australian Pull-up', 'Toes to Bar',
    ])
    // Menü-Status (Kebab)
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

        // Custom-Exercise-Dropdown schließen, wenn außerhalb geklickt wird
        if (!el.closest('.exercise-select-wrapper')) {
            exerciseDropdownOpen.value = false;
        }

        closePlanMenu();
    };

    // Basis-Dehnübungen (kannst du erweitern)
    const stretchingExercises = ref([
        'Brust-Dehnung', 'Hüftbeuger-Dehnung', 'Hamstring-Dehnung',
        'Waden-Dehnung', 'Schulter-Dehnung', 'Trizeps-Dehnung',
        'Rücken-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung',
    ])

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

    const showExtras = ref(false);
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
    const exerciseEditIndex = ref<number | null>(null);
    const exerciseEditField = ref<'name' | 'muscle' | null>(null);
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
        const filter = exerciseFilter.value.trim().toLowerCase();
        const groups = resolveGroups(filter);
        const isPush = ['push', 'drücken', 'push day', 'pushday'].includes(filter);
        const isPull = ['pull', 'ziehen', 'pull day', 'pullday'].includes(filter);

        // Ausdauer
        if (trainingType.value === 'ausdauer') {
            return cardioTypes.value;
        }

        // Calisthenics
        if (trainingType.value === 'calisthenics') {
            const nameMatches = calisthenicsExercises.value.filter(x =>
                x.toLowerCase().includes(filter)
            );

            const groupMatches = groups.length
                ? groups.flatMap(g => (calisthenicsByGroup[g] || []))
                : [];

            const custom = customExercises.value
                .filter(ex =>
                    ex.type === 'calisthenics' &&
                    (
                        ex.name.toLowerCase().includes(filter) ||
                        ex.muscle.toLowerCase().includes(filter) ||
                        (groups.length && groups.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                    )
                )
                .map(ex => ex.name);

            let list = uniq([...nameMatches, ...groupMatches, ...custom]);

            // 👉 Push/Pull-Feinfilter (nur sinnvolle Bewegungen anzeigen)
            if (isPush) {
                const allow = new Set(['Liegestütze', 'Archer Push-up', 'Dips', 'Handstand Push-up']);
                list = list.filter(x => allow.has(x));
            } else if (isPull) {
                const allow = new Set(['Klimmzüge', 'Australian Pull-up', 'Archer Pull-up']);
                list = list.filter(x => allow.has(x));
            }

            return list;
        }

        // Dehnung
        if (trainingType.value === 'dehnung') {
            // ❗ Push/Pull (und Synonyme) sollen NICHT greifen
            const isPushPull = [
                'push', 'pull', 'drücken', 'ziehen', 'push day', 'pushday', 'pull day', 'pullday'
            ].includes(filter)

            // Gruppen nur auflösen, wenn NICHT Push/Pull
            const groups = isPushPull ? [] : resolveGroups(filter)

            // 1) Namens-Treffer in der Basisliste
            const nameMatches = stretchingExercises.value.filter(x =>
                !filter || x.toLowerCase().includes(filter)
            )

            // 2) Gruppen-Treffer über Mapping (z.B. Oberkörper/Unterkörper)
            const groupMatches = groups.length
                ? groups.flatMap(g => stretchingByGroup[g] || [])
                : []

            // 3) Custom-Stretches per Name/Muskel oder Gruppen-Match
            const custom = customExercises.value
                .filter(ex =>
                    ex.type === 'dehnung' && (
                        ex.name.toLowerCase().includes(filter) ||
                        ex.muscle.toLowerCase().includes(filter) ||
                        (groups.length && groups.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                    )
                )
                .map(ex => ex.name)

            // 4) Einzigartige Liste zurückgeben
            return Array.from(new Set([...nameMatches, ...groupMatches, ...custom]))
        }


        // Kraft (default)
        const caliSet = new Set(calisthenicsExercises.value.map(x => x.toLowerCase()));

        const fromGroups = groups.length
            ? groups.flatMap(g => ((muscleGroups.value as unknown as Record<string, string[]>)[g] || []))
            : [];

        const byName = predefinedExercises.value.filter(ex =>
            ex.toLowerCase().includes(filter)
        );

        let grouped = uniq([...fromGroups, ...byName]).filter(ex =>
            !caliSet.has(ex.toLowerCase())
        );

        const custom = customExercises.value
            .filter(ex =>
                ex.type === 'kraft' &&
                (
                    ex.name.toLowerCase().includes(filter) ||
                    ex.muscle.toLowerCase().includes(filter) ||
                    (groups.length && groups.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                )
            )
            .map(ex => ex.name);

        let result = uniq([...grouped, ...custom]);

        // 👉 Push/Pull-Feinfilter
        if (isPush) {
            const allow = new Set([
                'Bankdrücken', 'Schulterdrücken', 'Liegestütze', 'Butterfly',
                'Brustpresse', 'Dips', 'Seitheben', 'Trizepsdrücken'
            ]);
            result = result.filter(x => allow.has(x));
        } else if (isPull) {
            const allow = new Set([
                'Klimmzüge', 'Latzug', 'Rudern', 'Bizepscurls', 'Rückenstrecker'
            ]);
            result = result.filter(x => allow.has(x));
        }

        return result;
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
        if (editType.value === 'customExerciseType') return 'Übungstyp bearbeiten';
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return 'Planname bearbeiten';
        if (editType.value === 'timerName') return 'Timername bearbeiten';
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
        if (editType.value === 'timerName') return 'Neuer Timername';
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

            plans.value = Array.isArray(parsed.plans) ? parsed.plans : []
            favoritePlans.value = Array.isArray(parsed.favoritePlans) ? parsed.favoritePlans : []

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
        // debounce damit du nicht bei jedem kleinen Watch 100 Requests ballerst
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

                if (!res.ok) throw new Error(`PUT training-data failed: ${res.status}`)
            } catch (e) {
                console.error('Fehler beim Speichern (Account):', e)
                // kein Toast-Spam, nur wenn du willst:
                // addToast('Account-Sync fehlgeschlagen (offline?)', 'delete')
            }
        }, 350)
    }

    const saveToStorage = () => {
        queueSaveToAccount()
    }

    const saveToAccountNow = async () => {
        try {
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

    const editCell = (index: number, field: 'name' | 'muscle') => {
        openEditPopup(`customExercise${field.charAt(0).toUpperCase() + field.slice(1)}` as 'customExerciseName' | 'customExerciseMuscle', index);
    };

    const finishEdit = () => {
        exerciseEditIndex.value = null;
        exerciseEditField.value = null;
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

    const collectValidationErrors = () => {
        const errors: string[] = []

        if (trainingType.value === 'ausdauer') {
            if (!cardioExercise.value) errors.push('Cardio-Art wählen')
            const dErr = validateDurationMin(newDuration.value); if (dErr) errors.push(dErr)
            const kErr = validateDistanceKm(newDistance.value); if (kErr) errors.push(kErr)
            return errors
        }

        // Kraft / Calisthenics / Dehnung
        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value
        if (!exerciseToAdd) errors.push('Übung auswählen oder benutzerdefinierte Übung eingeben')
        else if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === exerciseToAdd.toLowerCase())) {
            errors.push('Übung bereits im Plan vorhanden')
        }

        // Dehnung nutzt deine vorhandenen Felder: newSets = Holds, newReps = Sekunden/Hold
        const setsError = validateSets(newSets.value); if (setsError) errors.push(setsError)
        const repsError = validateReps(newReps.value); if (repsError) errors.push(repsError)

        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || ''
            const validated = validateCustomExercise(
                customPlanExercise.value,
                muscleGroup,
                trainingType.value, // 👈 wichtig: 'kraft' | 'calisthenics' | 'dehnung'
            )
            if (typeof validated === 'string') errors.push(validated)
        }


        return errors
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
        const p = trainingPlansStore.items.find(x => x.id === planId);
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

    const toUpsertPayload = (): TrainingPlanUpsert => ({
        name: validatePlanName(planName.value) as string,
        isFavorite: false,
        days: [{
            name: "Tag 1",
            sortOrder: 0,
            exercises: selectedPlanExercises.value.map((ex, i) => ({
                name: ex.exercise,
                category: mapTypeToCategory(ex.type),
                sortOrder: i,
                sets: ex.type === "ausdauer" ? null : ex.sets,
                reps: ex.type === "ausdauer" ? null : ex.reps,
                durationMin: ex.type === "ausdauer" ? ex.sets : null,
                distanceKm: ex.type === "ausdauer" ? (ex.reps ? ex.reps : null) : null,
            })),
        }],
    });

    const resetBuilder = () => {
        planName.value = "";
        newExercise.value = "";
        customPlanExercise.value = "";
        newReps.value = null;
        newSets.value = null;
        selectedGoal.value = "";
        selectedPlanExercises.value = [];
        rowHeights.value = [];
        editingPlanId.value = null;
    };

    const createOrUpdatePlan = async () => {
        const validatedPlanName = validatePlanName(planName.value);

        if (validatedPlanName === false || (!editingPlanId.value && !selectedPlanExercises.value.length)) {
            const errors: string[] = [];
            if (validatedPlanName === false) {
                errors.push(
                    planName.value.trim().length < 3
                        ? "Planname muss mindestens 3 Zeichen lang sein"
                        : "Planname darf maximal 20 Zeichen lang sein"
                );
            }
            if (!selectedPlanExercises.value.length) errors.push("Mindestens eine Übung ist erforderlich");
            openValidationPopup(errors);
            return;
        }

        try {
            const payload = toUpsertPayload();

            if (editingPlanId.value) {
                const updated = await trainingPlansStore.update(editingPlanId.value, payload);
                selectedPlan.value = flattenDto(updated);
                addToast("Plan gespeichert", "save");
            } else {
                const created = await trainingPlansStore.create(payload);
                selectedPlan.value = flattenDto(created);
                addToast("Plan erstellt", "add");
            }

            resetBuilder();
        } catch (e: any) {
            openValidationPopup([e?.message ?? "Speichern fehlgeschlagen"]);
        }
    };


    const addExerciseToPlan = () => {
        const errors = collectValidationErrors()
        if (errors.length > 0) { openValidationPopup(errors); return }

        if (trainingType.value === 'ausdauer') {
            selectedPlanExercises.value.push({
                exercise: cardioExercise.value,
                sets: newDuration.value!,                                   // Minuten
                reps: newDistance.value ? Number(newDistance.value) : 0,    // km (optional)
                goal: selectedGoal.value || undefined,
                type: 'ausdauer'
            })
            rowHeights.value.push(40)
            addToast('Cardio hinzugefügt', 'add')
            cardioExercise.value = ''
            newDuration.value = null
            newDistance.value = null
            selectedGoal.value = ''
            return
        }

        // Kraft / Calisthenics / Dehnung
        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value
        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || ''
            const validated = validateCustomExercise(customPlanExercise.value, muscleGroup, trainingType.value)
            if (typeof validated !== 'string') {
                customExercises.value.push({ name: validated.name, muscle: validated.muscle, type: validated.type })
                saveToStorage()
                addToast('Benutzerdefinierte Übung gespeichert', 'add')
            } else {
                openValidationPopup([validated])
                return
            }
        }
        selectedPlanExercises.value.push({
            exercise: exerciseToAdd,
            sets: newSets.value!,
            reps: newReps.value!,
            goal: selectedGoal.value || undefined,
            type: trainingType.value // 'kraft' | 'calisthenics' | 'dehnung'
        })
        rowHeights.value.push(40)
        addToast('Übung hinzugefügt', 'add')

        newExercise.value = ''
        customPlanExercise.value = ''
        newReps.value = null
        newSets.value = null
        selectedGoal.value = ''
    }


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

    const editPlan = async (planId: string) => {
        try {
            await trainingPlansStore.loadOne(planId);
            const dto = trainingPlansStore.selected;
            if (!dto) { addToast("Plan nicht gefunden", "delete"); return; }

            const view = flattenDto(dto);
            planName.value = view.name;
            selectedPlanExercises.value = [...view.exercises];
            editingPlanId.value = planId;
            rowHeights.value = Array(view.exercises.length).fill(40);
            selectedPlan.value = view;

            addToast("Plan wird bearbeitet", "save");
            await nextTick();
            scrollToBuilder();
        } catch {
            addToast("Plan konnte nicht geladen werden", "delete");
        }
    };

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
        const anyCardio = plan.exercises.some(ex => ex.type === 'ausdauer');
        const anyStretch = plan.exercises.some(ex => ex.type === 'dehnung');

        const setsHeader = anyCardio ? 'Sätze / Min' : 'Sätze';
        const repsHeader = (anyCardio || anyStretch) ? 'Wdh. / km / s' : 'Wiederholungen';

        // Zellen-Formatter mit Einheiten
        const fmtSets = (ex: PlanExercise) => ex.type === 'ausdauer' ? `${ex.sets} min` : `${ex.sets}`;
        const fmtReps = (ex: PlanExercise) => {
            if (ex.type === 'ausdauer') return ex.reps ? `${ex.reps} km` : '-';
            if (ex.type === 'dehnung') return `${ex.reps} s`;
            return `${ex.reps}`;
        };

        const uniqueGoal = [...new Set(plan.exercises.map(ex => ex.goal).filter(Boolean))][0] as string | undefined;
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

    const toggleExtras = () => {
        showExtras.value = !showExtras.value;
    };

    const makeUniqueTimerName = (rawName: string, excludeId?: string): string => {
        const base = (rawName || '').trim() || 'Timer';
        const existing = new Set(
            props.timers
                .filter(t => !excludeId || t.id !== excludeId)
                .map(t => (t.name || 'Timer').trim().toLowerCase())
        );

        if (!existing.has(base.toLowerCase())) return base;

        let i = 2;
        // Timer, Timer (2), Timer (3) ...
        while (existing.has(`${base} (${i})`.toLowerCase())) {
            i++;
        }
        return `${base} (${i})`;
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
            if (!plan) { openValidationPopup(['Plan nicht gefunden']); return; }
            editValue.value = plan.name;
        } else if (type === 'selectedPlanName') {
            if (!selectedPlan.value) { openValidationPopup(['Kein ausgewählter Plan']); return; }
            editValue.value = selectedPlan.value.name;
        } else if (type === 'timerName') {
            const timer = props.timers.find(t => t.id === index);
            if (!timer) { openValidationPopup(['Timer nicht gefunden']); return; }
            editValue.value = timer.name || '';
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

        // === 1) Tabelle "Auswahl" oben ============================================
        if (editType.value === 'table' && typeof editIndex.value === 'number') {
            const exercise = selectedPlanExercises.value[editIndex.value];
            if (!exercise) return;

            if (editCellIndex.value === 0 && editValue.value) {
                const newName = editValue.value.trim();
                if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === newName.toLowerCase() && ex !== exercise)) {
                    openValidationPopup(['Übung existiert bereits im Plan']);
                    return;
                }
                exercise.exercise = newName;
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
                    addToast('Dauer aktualisiert', 'save');
                } else if (editCellIndex.value === 2) {
                    const kmRaw = Number(editValue.value);
                    const km = isNaN(kmRaw) ? 0 : kmRaw;
                    const err = validateDistanceKm(km);
                    if (err) { openValidationPopup([err]); return; }
                    exercise.reps = km;
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
                addToast('Sätze aktualisiert', 'save');
            } else if (editCellIndex.value === 2) {
                const reps = Number(editValue.value);
                const repsError = validateReps(reps);
                if (repsError) { openValidationPopup([repsError]); return; }
                exercise.reps = reps;
                addToast(exercise.type === 'dehnung' ? 'Sekunden aktualisiert' : 'Wiederholungen aktualisiert', 'save');
            }

            closeEditPopup();
            return;
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
                const uniqueName = makeUniqueTimerName(editValue.value, timer.id);
                timer.name = uniqueName;
                saveToStorage();
                addToast('Timername aktualisiert', 'timer');
            }
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
    // Menü offen? → Toast-Timer hart pausieren/resumieren (zusätzlich zum Sammel-Watch)
    watch(planMenuOpenId, () => {
        // Kein Parent-Timer mehr → nichts zu tun
    });

    // unter deinen anderen imports/refs:
    const onTrainingFocus = (e: Event) => {
        const { type, id } = (e as CustomEvent<{ type: 'timer' | 'stopwatch'; id: string }>).detail
        // dieselbe Logik wie beim initialen Fokus
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
        if (selectedPlan.value) {
            const index = plans.value.findIndex(p => p.id === selectedPlan.value!.id);
            if (index !== -1) {
                plans.value[index] = { ...selectedPlan.value };
                saveToStorage();
            }
        }
    };
    // REPLACE in Training.vue (exerciseSelectSize)
    const exerciseSelectSize = computed(() => {
        const total = filteredExercises.value.length;   // Anzahl der Einträge im Dropdown

        // Bis 4 Einträge: normales Dropdown (keine Liste, keine Scrollbar)
        if (total <= 4) return 1;

        // Ab 5+ Einträgen: kompakte Liste mit nur 3 sichtbaren Zeilen → Scrollbar kommt schnell
        return 3;
    });

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

    const handleOverlayClick = (event: MouseEvent) => {
        if (event.target === event.currentTarget) {
            closeEditPopup()
            closeDeletePopup()
            closeDownloadPopup()
            closeValidationPopup()
        }
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
            const stickyStopwatches = props.stopwatches.filter(sw => sw.shouldStaySticky)
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

    const normalizeToTotal = (arr: number[], total = 100, pinIndex = 0) => {
        const out = arr.map(v => Math.max(0, Number.parseFloat((+v).toFixed(4))));
        const sum = out.reduce((a, b) => a + b, 0);
        if (!sum || !Number.isFinite(sum)) return out;
        const i = Math.max(0, Math.min(pinIndex, out.length - 1));
        const diff = Number.parseFloat((total - sum).toFixed(4));
        out[i] = Number.parseFloat((out[i] + diff).toFixed(4));
        return out;
    };

    // PREVIEW: Aktion (Index 3) kann jetzt über den Griff an Spalte 2 mitverändert werden
    const initPreviewResizeTable = () => {
        const table = previewTable.value;
        if (!table) return;

        table.querySelectorAll('.resizer').forEach(el => el.remove());

        const MIN_PX_BY_COL = [16, 16, 16, 44]; // Übung | Sätze | Wdh. | Aktion
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
                let start = [...previewColWidths.value];

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

                        previewColWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex);
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
                    start = [...previewColWidths.value];
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
        console.log('timers oder stopwatches geändert:', { timers: props.timers, stopwatches: props.stopwatches });
        nextTick(() => checkScroll());
    }, { deep: true });

    watch(planSearch, () => closePlanMenu());

    const syncFullscreenClass = () => {
        const isFs = !!document.fullscreenElement;
        document.documentElement.classList.toggle('is-fullscreen', isFs);
    };
    // Live-Preview: bei jeder Änderung an den Übungen
    watch(selectedPlanExercises, () => {
        nextTick(() => {
            initPreviewResizeTable();
            setupHeaderShorteningFallback();
        });
    }, { deep: true });

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

        // Tabellen zuerst
        initResizeTable();
        initPreviewResizeTable();
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
        --extras-toggle-ch: 18;
        --extras-toggle-w: calc(var(--extras-toggle-ch) * 1ch + 2 * var(--control-padding-x));
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

            .training .form-card.builder-grid {
                width: 100%;
                max-width: 100%;
                margin-inline: 0;
                box-sizing: border-box;
            }
    }

    @media (min-width: 900px) {
        .form-card.builder-grid {
            /* rechte Spalte spürbar schmaler */
            grid-template-columns: minmax(0, 1fr) clamp(240px, 28vw, 360px);
            align-items: start;
        }
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }
    /* Smooth landing highlight when jumping to the builder */
    @keyframes builderPop {
        0% {
            transform: translateY(-6px);
            box-shadow: 0 0 0 rgba(99,102,241,0);
        }

        40% {
            transform: translateY(0);
            box-shadow: 0 8px 32px rgba(99,102,241,.20);
        }

        100% {
            transform: translateY(0);
            box-shadow: 0 0 0 rgba(99,102,241,0);
        }
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        position: relative;
    }

    .drag-ghost {
        opacity: 0.6;
    }

    .segmented.seg-type {
        display: flex;
        gap: .5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: .3rem;
        align-items: center;
    }

        .segmented.seg-type > button {
            background: transparent;
            border: 1px solid transparent;
            border-radius: 10px;
            padding: .45rem .9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all .15s ease;
            color: var(--text-primary);
        }

            .segmented.seg-type > button.on {
                background: var(--bg-card);
                border-color: var(--border-color);
                box-shadow: 0 1px 2px rgba(0,0,0,.06);
            }

    .filter-input {
        border-radius: 999px;
        padding-left: 2.25rem; /* Platz fürs Icon */
        background: var(--bg-secondary);
        position: relative;
    }

        .filter-input::placeholder {
            opacity: .8;
        }

    .builder-left,
    .builder-head,
    .builder-head > * {
        min-width: 0;
    }

    .builder-left {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0; /* verhindert Overflow in Grids */
    }

    .builder-right {
        min-width: 0; /* wichtig für Tables/Overflow */
    }

    /* Feldblöcke */
    .field-block {
        display: flex;
        flex-direction: column;
        gap: .5rem;
    }

    .field-label {
        font-weight: 600;
        font-size: .92rem;
        color: var(--text-primary);
    }

    .field-row {
        display: flex;
        gap: .75rem;
        align-items: stretch;
        flex-wrap: wrap;
    }
    /* Zelle wird selbst Container → reagiert auf ihre eigene Breite */
    .v-stack {
        container-type: inline-size;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }


    .field-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .75rem;
    }

    @media (max-width: 600px) {
        .field-grid {
            grid-template-columns: 1fr;
        }
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: .4rem;
    }

    .actions-row.stack {
        display: flex;
        flex-direction: column;
        gap: .75rem;
        align-items: stretch; /* Kinder dürfen volle Breite nutzen */
    }


    /* Hover wie stat-card / feature-card */
    @media (hover: hover) {
        .preview-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    /* Dark-Mode-Variante im gleichen Stil wie Landingpage-Karten */
    html.dark-mode .preview-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
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

    .form-card.builder-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        box-sizing: border-box; /* damit Padding mitgerechnet wird */
    }

    @media (max-width: 900px) {
        .builder-head {
            grid-template-columns: 1fr;
            grid-template-areas:
                "plan"
                "type"
                "extras";
        }

            .builder-head .extras-cta {
                justify-self: start;
                white-space: nowrap;
                box-sizing: border-box;
                inline-size: min(var(--extras-toggle-w), 100%);
                min-inline-size: min(var(--extras-toggle-w), 100%);
                max-inline-size: min(var(--extras-toggle-w), 100%);
            }
    }

    @media (max-width: 1200px) {
        .segmented.seg-type {
            flex-wrap: wrap;
            row-gap: .35rem;
        }
    }

    .form-card {
        box-sizing: border-box;
    }

    @media (max-width: 1240px) {
        .training {
            overflow-x: visible; /* lässt Inhalt sauber raus, ohne Scrollbars zu blocken */
        }

        .workout-list,
        .form-card.builder-grid {
            max-width: 100%;
            min-width: 0;
            width: 100%;
        }
    }

    /* === Live-Preview: Card im Stil von form-card/timer-card === */

    .preview-card {
        position: sticky;
        top: .75rem;
        contain: inline-size;
        overflow-x: visible;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        border-radius: 20px;
        padding: 1.35rem 1.55rem;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    /* Kopf: dezentes Label + Counter rechts */
    .preview-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.15rem;
    }

        .preview-head h4 {
            margin: 0;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            font-weight: 600;
            opacity: 0.9;
        }

    .preview-card .muted {
        font-size: 0.78rem;
        padding: 0.1rem 0.7rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--bg-card) 88%, #0f172a 12%);
        border: 1px solid rgba(148, 163, 184, 0.5);
    }

    .empty-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        min-height: 150px;
        border-radius: 14px;
        padding: 1.25rem 1.5rem;
        /* kein eigener grauer Kasten mehr → zeigt direkt den lila/blauen Preview-Hintergrund */
        background: transparent;
        /* Rahmen im Accent-Look statt langweiligem Grau */
        border: 1px dashed color-mix(in srgb, var(--accent-primary) 55%, rgba(148, 163, 184, 0.5) 45%);
        box-shadow: none;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    /* Mobile: kompakter + kleinere min-width */
    @media (max-width: 560px) {
        .preview-card {
            position: static;
            top: auto;
            padding: 1.05rem 1.05rem;
            border-radius: 16px;
        }
    }

    .actions-row .button-group .btn-cell > *:not(.add-exercise-btn) {
        height: var(--control-height);
    }

    .field-row .filter-input {
        flex: 1 1 320px;
        min-width: 220px;
    }

    .button-group:has(.add-exercise-btn) {
        --btn-width: 100%;
    }

    .button-group .btn-cell:has(.add-exercise-btn) {
        flex: 1 1 100%;
    }

    .button-group .btn-cell > .add-exercise-btn {
        width: 100%;
    }

    .filter-input {
        background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 19a8 8 0 1 1 5.293-14.707A8 8 0 0 1 11 19Zm9.707 1.293-4.2-4.2' stroke='%23888' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: .75rem center;
        background-size: 16px 16px;
    }

    html.dark-mode .filter-input {
        background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 19a8 8 0 1 1 5.293-14.707A8 8 0 0 1 11 19Zm9.707 1.293-4.2-4.2' stroke='%239aa3ab' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
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
    /* ganz unten im <style scoped> ergänzen */
    @supports not (overflow: clip) {
        .training,
        .workout-list {
            overflow-x: visible; /* auch in älteren Browsern keine abgeschnittenen Effekte */
        }
    }

    /* falls du in manchen Containern knapp clippen willst */
    :root {
        --clip-margin: 8px;
    }
    /* === Planname: nur der Name horizontal scrollbar, Rest bleibt fix === */
    .plan-title {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        min-width: 0;
        max-width: 100%;
        /* alte Effekte sicher neutralisieren */
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

    .form-card {
        position: relative;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 1.1rem;
        padding: 1.75rem 1.9rem;
        border-radius: 18px;
        box-sizing: border-box;
        /* ⇓ exakt im Stil der Landing-Karten (stat-card/feature-card) ⇓ */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    /* Hover-Verhalten wie bei .stat-card/.feature-card */
    @media (hover: hover) {
        .form-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    /* Dark Mode: gleiche Farbwelt, etwas satter und näher am Page-Gradient */
    html.dark-mode .form-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Fallback für alte Browser ohne backdrop-filter / color-mix */
    @supports not (backdrop-filter: blur(10px)) or not (color-mix(in srgb, black 10%, white 90%)) {
        .form-card {
            background: var(--bg-card);
            box-shadow: 0 12px 32px rgba(15,23,42,0.45);
        }
    }

    .form-card input,
    .form-card select,
    .form-card .exercise-select-trigger {
        height: var(--control-height);
        font-size: var(--control-font-size);
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        flex: 1;
        min-width: 120px;
        background: var(--bg-secondary);
        color: var(--text-color);
        transition: border-color 0.2s, box-shadow 0.2s;
    }


    html.dark-mode .form-card input,
    html.dark-mode .form-card select,
    html.dark-mode .form-card .exercise-select-trigger {
        background: #0d1117;
        border-color: #30363d;
        color: #ffffff;
    }

    .form-card input:focus,
    .form-card select:focus,
    .form-card .exercise-select-trigger:focus-visible {
        border-color: #4B6CB7;
        box-shadow: 0 0 5px rgba(75, 108, 183, 0.5);
        outline: none;
    }

    .desktop-only {
        display: initial;
    }

    .mobile-only {
        display: none;
    }

    .form-card button[type="submit"] {
        width: 100%;
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


    /* Dark-Mode Kontrast (optional feiner abstimmen) */
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

    .button-group {
        display: flex;
        gap: 0.75rem;
        align-items: stretch;
        flex-wrap: nowrap;
        width: 100%; /* volle Breite der Spalte */
        margin-left: 0; /* NICHT nach rechts wegschieben */
    }

    @media (max-width: 600px) {
        .button-group {
            margin-left: 0;
            flex-wrap: wrap;
            width: 100%;
        }
    }

    @media (min-width: 601px) {
        .button-group .btn-cell:last-child {
            margin-top: 0px;
        }
    }

    .exercise-table.full-width th,
    .exercise-table.full-width td {
        padding: 1.5rem;
        text-align: center;
        min-width: 0; /* war 150px: verhindert Breiten-Inflation */
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .button-group .btn-cell > *:not(.add-exercise-btn) {
        width: 100%;
        height: var(--btn-height);
        padding-left: var(--btn-pad-x);
        padding-right: var(--btn-pad-x);
    }

    .custom-toggle-btn {
        margin-left: auto;
        margin-right: auto;
    }

    /* nicer Chevron-Icon (SVG mask) – wirkt wie echtes UI */
    .custom-toggle-arrow {
        width: 1.05rem;
        height: 1.05rem;
        flex: 0 0 auto;
        opacity: .92;
        transform: rotate(0deg);
        transition: transform .18s ease, opacity .18s ease, filter .18s ease;
        filter: drop-shadow(0 1px 0 rgba(0,0,0,.10));
    }

    /* Modern: benutze currentColor als "Fill" über Mask */
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

    /* Fallback: falls Mask nicht geht */
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

    .button-group .btn-cell > .action-btn.add-exercise-btn {
        display: inline-flex; /* saubere vertikale Zentrierung */
        align-items: center;
        justify-content: center;
        width: 100%;
        height: calc(var(--control-height) - 4px); /* 48px → 44px */
        padding-top: 0;
        padding-bottom: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }


    .action-btn.plan-submit-btn {
        height: calc(var(--control-height) - 4px);
    }

    @media (max-width: 600px) {
        .button-group {
            margin-left: 0;
            flex-wrap: wrap;
            width: 100%;
            --btn-width: 100%;
        }
    }

    .stopwatch-top {
        margin-top: 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 1200px;
        position: relative;
    }

    @media (max-width:560px) {
        /* Plan-Card Layout auf Reihe statt Grid zwingen */
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

        /* Titel: ellipsize + Platz geben */
        .plan-title {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* Actions rechts: kompakt inline */
        .plan-right {
            display: inline-flex;
            align-items: center;
            gap: .25rem;
            flex-wrap: nowrap;
        }

        /* Icons sichtbar halten, Kebab auf schmal weg */
        .inline-actions {
            display: inline-flex !important;
            gap: .25rem;
        }

        .kebab-wrap {
            display: none !important;
        }

        /* Open-Button bleibt rechts in der Reihe */
        .desktop-open {
            display: inline-flex !important;
        }

        .mobile-open, .plan-row2 {
            display: none !important;
        }

        /* Menü-Overlay sicherheitshalber oberhalb halten */
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

    /* Inline-Action-Buttons (Edit/Löschen/Download) sind standardmäßig sichtbar */
    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }
    /* Kebab standardmäßig verstecken – wird erst ab schmaler Breite angezeigt */


    @media (max-width:1024px) {
        .inline-actions {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }
    }

    /* ≤560px: weiterhin eine Zeile; mobile Zeile komplett aus */
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
    /* Open-Button auch in einer Linie (Desktop) */
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

        /* Inline-Aktionen ausblenden, Kebab einblenden */
        .inline-actions {
            display: none;
        }

        /* Open-Button in eigener Zeile */
        .desktop-open {
            display: inline-flex !important;
        }
        /* war: none */
        .mobile-open {
            display: none !important;
        }
        /* war: inline-flex */
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

    .timer-display:hover {
        transform: scale(1.02);
        box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.2);
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

    .builder-head .plan-block .field-label {
        display: block;
        margin-bottom: .6rem; /* Abstand Titel ↔ Input */
    }

    .builder-head .plan-block .plan-name-input {
        width: 100%;
    }

    .type-block .type-heading {
        display: block;
        margin-bottom: .6rem;
    }

    .goal-row {
        display: grid;
        gap: .55rem; /* Abstand Titel ↔ Select */
    }

    .builder-head .segmented.seg-type {
        gap: .45rem; /* etwas mehr Luft zwischen Buttons */
        padding: .26rem .35rem; /* minimal höhere/lebhaftere Fläche */
        border-radius: 10px;
    }

        .builder-head .segmented.seg-type > button {
            padding: .42rem .72rem; /* + ~2–3px in beide Richtungen */
            font-size: .89rem; /* vorher ~.86rem */
            border-radius: 9px;
        }

    .builder-head .plan-name-input.slim {
        flex: 1 1 320px;
        min-width: 180px;
    }

    @media (max-width: 1100px) {
        .builder-head .segmented.seg-type {
            gap: .28rem;
        }

            .builder-head .segmented.seg-type > button {
                padding: .28rem .5rem;
                font-size: .82rem;
            }
    }

    @media (max-width: 520px) {
        .builder-head {
            grid-template-columns: 1fr;
            grid-template-areas:
                "plan"
                "type"
                "extras";
        }

            .builder-head .extras-cta {
                justify-self: start;
                white-space: nowrap;
                box-sizing: border-box;
                inline-size: min(var(--extras-toggle-w), 100%);
                min-inline-size: min(var(--extras-toggle-w), 100%);
                max-inline-size: min(var(--extras-toggle-w), 100%);
            }

        .segmented.seg-type {
            flex-wrap: wrap;
            row-gap: .35rem;
        }
    }

    @media (max-width: 560px) {
        .desktop-only {
            display: none;
        }

        .builder-head .plan-block {
            grid-area: plan; /* spannt über "plan plan" = beide Spalten */
            width: 100%;
            min-width: 0; /* verhindert Einquetschen durch Intrinsic-Width */
        }

            .builder-head .plan-block .plan-name-input {
                width: 100% !important;
                max-width: none !important;
                min-width: 0;
                box-sizing: border-box;
            }

        .mobile-only {
            display: block;
        }

        .builder-head .type-block.desktop-only {
            display: none !important;
        }

        .builder-head .type-block.mobile-only {
            display: block;
        }

        .builder-head {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) var(--control-height) !important; /* 2. Spalte exakt Icon-Breite */
            grid-template-areas:
                "plan plan"
                "type extras" !important;
            align-items: start; /* nicht mittig zwischen den Zeilen hängen */
            row-gap: .6rem;
            column-gap: .75rem;
        }

            .builder-head .plan-name-input.slim {
                grid-area: plan;
                width: 100%; /* volle Breite */
            }

            .builder-head .type-block.mobile-only {
                grid-area: type;
            }

            .builder-head .seg-type-select {
                height: var(--control-height);
                font-size: var(--control-font-size);
                width: 100%;
            }

        .extras-label {
            display: none;
        }

        .extras-icon {
            margin-right: 0;
        }

        .builder-head .extras-cta {
            grid-area: extras;
            justify-self: end !important;
            align-self: end; /* am unteren Rand der Zeile → Höhe vom Label ignorieren */
            inline-size: var(--control-height) !important; /* quadratisch */
            min-inline-size: var(--control-height) !important;
            max-inline-size: var(--control-height) !important;
            padding-inline: 0 !important;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        /* Kleinkram */
        .seg-type-select {
            height: var(--control-height);
            font-size: var(--control-font-size);
            width: 100%;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-color);
            padding: 0 .75rem;
        }


        .preview-card {
            position: static;
            top: auto;
        }

        .list-item-actions,
        .timer-buttons,
        .timer-input-group {
            flex-wrap: wrap;
        }

        .workout-list,
        .form-card.builder-grid,
        .builder-left,
        .builder-right {
            max-width: 100%;
            min-width: 0;
        }

        .workout-list {
            padding: 0 .5rem;
        }

        .form-card {
            padding: 1rem;
        }
    }

    .workout-list,
    .timer-container,
    .stopwatch-top {
        width: 100%;
        max-width: var(--section-max);
        margin-inline: auto !important;
    }

    .button-group .btn-cell > * {
        margin-top: 0 !important;
        width: 100%;
        height: var(--control-height);
        padding-left: var(--control-padding-x);
        padding-right: var(--control-padding-x);
    }

    @media (min-width: 960px) {
        .builder-head .extras-cta {
            flex: 0 0 var(--extras-toggle-w);
            white-space: nowrap;
        }
    }

    .builder-head {
        display: grid;
        grid-template-columns: 1fr var(--extras-toggle-w);
        grid-template-rows: auto auto;
        grid-template-areas:
            "plan plan"
            "type extras";
        align-items: center;
        gap: .75rem 1rem;
    }

        .builder-head .plan-name-input.slim {
            grid-area: plan;
            width: 100%;
        }

        .builder-head .segmented.seg-type {
            grid-area: type;
            justify-self: start;
            margin-left: 0;
        }

        .builder-head .extras-cta {
            grid-area: extras;
            justify-self: end;
            white-space: nowrap;
            box-sizing: border-box;
            inline-size: min(var(--extras-toggle-w), 100%);
            min-inline-size: min(var(--extras-toggle-w), 100%);
            max-inline-size: min(var(--extras-toggle-w), 100%);
        }

        .builder-head .extras-cta {
            box-sizing: border-box;
            inline-size: min(var(--extras-toggle-w), 100%);
        }

    @media (max-width: 420px) {
        .training {
            --control-height: 44px;
            --control-padding-x: 1rem;
        }

        .workout-list {
            padding: 0 .5rem;
        }

        .form-card {
            padding: 1rem;
        }

        .page-title {
            font-size: 1.9rem;
        }

        .builder-head .segmented.seg-type {
            padding: .2rem;
            gap: .25rem;
        }

            .builder-head .segmented.seg-type > button {
                padding: .25rem .45rem;
                font-size: .8rem;
            }

        .timer-display {
            font-size: 2.4rem;
        }

        .timer-select,
        .timer-input {
            width: 120px;
        }

        .custom-toggle-btn {
            inline-size: min(var(--custom-toggle-w), 100%);
        }
    }

    .training,
    .workout-list,
    .form-card {
        max-width: 100%;
        overflow-x: visible; /* globale Layout-Breite bleibt, aber Schatten werden nicht abgeschnitten */
    }

    @media (max-width: 360px) {
        .page-title {
            font-size: 1.75rem;
        }
    }

    @media (min-width: 561px) {
        .builder-head {
            display: grid;
            grid-template-columns: 1fr var(--extras-toggle-w);
            grid-template-areas:
                "plan plan"
                "type extras";
            gap: .75rem 1.55rem;
        }

            .builder-head .type-block.desktop-only .segmented.seg-type {
                height: var(--control-height); /* fixe Zielhöhe, z. B. 48px */
                padding-block: .25rem; /* etwas schlanker innen, damit’s nicht zu fett wirkt */
                align-items: stretch; /* Buttons füllen die volle Höhe */
            }

                .builder-head .type-block.desktop-only .segmented.seg-type > button {
                    display: inline-flex; /* Text vertikal mittig */
                    align-items: center;
                    justify-content: center;
                }

            .builder-head .plan-block {
                grid-area: plan;
                min-width: 0; /* verhindert Overflow */
            }

                .builder-head .plan-block .plan-name-input {
                    width: 100%;
                    max-width: none;
                    min-width: 0;
                    box-sizing: border-box;
                }

            .builder-head .type-block.desktop-only {
                display: block;
            }

            .builder-head .type-block.mobile-only {
                display: none !important;
            }

            .builder-head .extras-cta {
                grid-area: extras;
                justify-self: end;
                white-space: nowrap;
                align-self: end;
            }

            .builder-head .plan-name-input.slim {
                grid-area: auto;
            }

            .builder-head .segmented.seg-type {
                grid-area: auto;
            }
    }

    @media (max-width: 960px) {
        .builder-head .type-block.desktop-only {
            display: none !important;
        }

        .builder-head .type-block.mobile-only {
            display: block !important;
        }

        /* Extras-Button bleibt voll (Icon + Text) */
        .builder-head .extras-cta {
            inline-size: var(--extras-toggle-w);
            min-inline-size: var(--extras-toggle-w);
            max-inline-size: var(--extras-toggle-w);
            padding-inline: var(--control-padding-x);
            justify-self: end;
        }

        .extras-label {
            display: inline;
        }
    }

    @media (min-width: 561px) and (max-width: 960px) {
        .type-block.desktop-only {
            display: none !important;
        }

        .type-block.mobile-only {
            display: block !important;
        }

        .builder-head {
            /* kein Scroll-Container -> Dropdown verhält sich wie deine anderen Selects */
            overflow: visible !important;
            /* rechts ist (bei dir <=960px) sowieso Icon-only -> exakt control-height */
            grid-template-columns: minmax(0, 1fr) var(--control-height) !important;
            grid-template-areas: "plan plan" "type extras" !important;
            column-gap: .85rem;
            align-items: end;
            min-width: 0;
        }

            .builder-head .extras-cta {
                inline-size: var(--control-height) !important;
                min-inline-size: var(--control-height) !important;
                max-inline-size: var(--control-height) !important;
                padding-inline: 0 !important;
                justify-content: center;
            }

        .extras-label {
            display: none !important;
        }

        .builder-head .seg-type-select {
            width: 100% !important;
        }
    }

    @media (max-width: 560px) {
        .builder-head .extras-cta {
            inline-size: var(--control-height);
            min-inline-size: var(--control-height);
            max-inline-size: var(--control-height);
            padding-inline: 0;
            display: inline-flex;
            justify-content: center;
        }
    }

    @media (max-width: 960px) {
        .builder-head .extras-cta {
            inline-size: var(--control-height) !important;
            min-inline-size: var(--control-height) !important;
            max-inline-size: var(--control-height) !important;
            padding-inline: 0 !important;
            justify-content: center;
        }

        .extras-label {
            display: none !important;
        }
        /* nur Icon zeigen */
    }

    @media (min-width: 961px) {
        .builder-head {
            grid-template-columns: minmax(0, 1fr) auto !important;
        }

            .builder-head .extras-cta {
                inline-size: auto !important;
                min-inline-size: auto !important;
                max-inline-size: clamp(180px, 24ch, 320px) !important; /* genug Platz für Label */
                padding-inline: var(--control-padding-x) !important;
                white-space: nowrap; /* Label bleibt einzeilig */
            }

        .extras-label {
            display: inline !important;
        }
    }

    .builder-head {
        grid-template-columns: minmax(0, 1fr) auto !important; /* linke Spalte flexibel, rechts Content-breite */
    }

        .builder-head .extras-cta {
            display: inline-flex;
            align-items: center;
            gap: .45rem;
            height: var(--control-height);
            padding-inline: var(--control-padding-x);
            border-radius: 8px;
            /* Overflow-Schutz */
            white-space: nowrap;
            min-width: 0;
            width: auto;
            max-inline-size: clamp(180px, 26ch, 360px); /* 26ch reicht für „Extras ausblenden“ */
            overflow: hidden;
            text-overflow: ellipsis;
        }

    @media (max-width: 560px) {
        .builder-head {
            grid-template-columns: minmax(0, 1fr) var(--control-height) !important;
        }

            .builder-head .extras-cta {
                inline-size: var(--control-height) !important;
                max-inline-size: var(--control-height) !important;
                padding-inline: 0 !important;
                justify-content: center;
            }

        .extras-label {
            display: none !important;
        }
    }

    /* Ab 561px immer mit Text */
    @media (min-width: 561px) {
        .extras-label {
            display: inline !important;
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

    /* Öffnen */
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
    /* NEU: gilt für alle Breakpoints */
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

    /* === canonical layout for plan rows: drag | centered title | actions right === */
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

    /* Responsive: wir behalten eine Zeile bei und blenden ggf. inline-actions aus */
    @media (max-width:1024px) {
        .plan-item > .plan-row1 .inline-actions {
            display: none !important;
        }

        .plan-item > .plan-row1 .desktop-open {
            display: inline-flex !important;
        }
    }

    /* Mobile: keine zweite Zeile nötig */
    @media (max-width:560px) {
        .plan-row2, .mobile-open {
            display: none !important;
        }
    }
    /* FIX 1: Plan-Karte ist kein Flex-Container mehr */
    .plan-item {
        display: block; /* überschreibt .list-item { display:flex } */
    }

        /* FIX 2: Eine Reihe: drag | Titel zentriert | rechts Aktionen */
        .plan-item > .plan-row1 {
            display: grid !important;
            grid-template-columns: auto 1fr auto; /* Drag | Titel | rechts */
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

    /* FIX 3: Die mobile Zusatzzeile standardmäßig weg */
    .plan-row2 {
        display: none;
    }

    /* Nur auf sehr schmalen Screens (optional) die mobile Zeile reaktivieren */
    @media (max-width:560px) {
        .plan-row2 {
            display: block;
        }

        .mobile-open {
            display: inline-flex !important;
        }
        /* mobiler Open-Button sichtbar */
        .desktop-open {
            display: none !important;
        }
    }

    /* Desktop-Default: Inline-Actions sichtbar, Kebab-Wrapper versteckt */
    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }

    .kebab-wrap {
        display: none;
    }

    /* Ab hier „verschieben“ sich deine Buttons → Inline-Actions aus, Kebab an */
    @media (max-width: 1024px) {
        .inline-actions {
            display: none !important;
        }

        .kebab-wrap {
            display: inline-flex !important;
        }
    }

    /* NEU: Resizer hängt an .th-text (nicht am TH) */
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

        /* Sichtbare Linie im Griff */
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
            transform: scaleX(2); /* optisch dicker beim Hover/Drag */
        }

    .list-item.plan-item {
        position: relative;
        padding: 1.35rem 1.6rem; /* etwas „cardiger“ als die Default-List-Items */
        border-radius: 18px;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        display: block; /* explizit, falls irgendwo noch flex reingrätscht */
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
    }

    /* Hover-Effekt wie bei .form-card/.preview-card */
    @media (hover: hover) {
        .list-item.plan-item:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    /* Dark-Mode-Variante analog zu deinen anderen Karten */
    html.dark-mode .list-item.plan-item {
        background: radial-gradient( circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60% ), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }
    /* Smoother Touch-Drag auf Mobile */
    .plan-drag-stack .plan-item {
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
        will-change: transform;
    }

    /* Weniger Text-Selection/Jank beim Drag */
    .sortable-chosen {
        user-select: none;
    }

    /* Ghost optisch stabil + minimaler Scale für „Grip“-Feeling */
    .sortable-ghost,
    .drag-ghost {
        opacity: .85;
        transform: scale(.98);
    }
    /* Drag Performance: folgt der Maus, keine Lags */
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

    /* während Drag keine Hover-Animationen stören */
    .dragging .list-item.plan-item {
        transform: none !important;
    }


    .exercise-select-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font: inherit;
        gap: 0.5rem;
        /* WICHTIG: keine eigenen Abstände/Farben/Borders mehr */
        padding: 0;
        border: none;
        border-radius: 0;
        background: transparent;
        color: inherit;
        box-sizing: border-box;
        box-shadow: none !important;
        outline: none !important;
        background-image: none !important;
    }

    /* nur das, was der Button zusätzlich braucht */
    .training .field-row .exercise-select-trigger {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        cursor: pointer !important;
        gap: 0.5rem !important;
        /* kein extra padding hier – kommt aus der gemeinsamen Regel oben */
    }

    .training .exercise-select-trigger:focus-visible {
        outline: 2px solid #5b8cff !important;
        outline-offset: 2px !important;
    }
</style>