<!-- components/ui/training/TrainingPlanBuilder.vue -->
<template>
    <!-- Trainingsplan Formular -->
    <div class="workout-list builder-section"
         :class="{ 'builder-section--report-tutorial-active': showAutoPlanReportTutorial }"
         ref="builderSection">
        <div
            v-if="isPhonePreviewBuilderDemo && previewTouch.visible"
            class="preview-touch"
            :style="{ left: `${previewTouch.x}px`, top: `${previewTouch.y}px` }">
            <span class="preview-touch__dot"></span>
        </div>
        <h3 class="section-title">Trainingsplan erstellen/bearbeiten</h3>
        <form @submit.prevent="createOrUpdatePlan" class="form-card builder-grid">
            <div class="mode-switch mode-switch--top">
                <span class="field-label">Erstellungsmodus</span>
                <div class="segmented seg-mode">
                    <button type="button" :class="{ on: builderMode === 'manual' }" @click="setBuilderMode('manual')">Manuell</button>
                    <button type="button" :class="{ on: builderMode === 'auto' }" @click="setBuilderMode('auto')">Automatisch generieren</button>
                </div>
            </div>

            <!-- LEFT: Builder -->
            <div class="builder-left">
                <!-- Kopf: Planname + Typ (Segmented) + Extras rechts -->
                <div v-if="builderMode === 'manual'" class="builder-head">
                    <!-- NEU: Planname mit Überschrift -->
                    <div class="plan-block">
                        <label for="plan-name" class="field-label">Planname</label>
                        <UiTrainingInput id="plan-name"
                                         v-model="planName"
                                         class="plan-name-input slim"
                                         placeholder="Planname (z. B. Push Day)"
                                         required />
                    </div>

                    <!-- Trainingstyp (Desktop: Segmented + Überschrift) -->
                    <div v-if="builderMode === 'manual'" class="type-block desktop-only">
                        <span class="type-heading field-label">Trainingstyp</span>
                        <div class="segmented seg-type">
                            <button type="button" :class="{ on: trainingType==='kraft' }" @click="trainingType='kraft'">Kraft</button>
                            <button type="button" :class="{ on: trainingType==='calisthenics' }" @click="trainingType='calisthenics'">Calisthenics</button>
                            <button type="button" :class="{ on: trainingType==='ausdauer' }" @click="trainingType='ausdauer'">Ausdauer</button>
                            <button type="button" :class="{ on: trainingType==='dehnung' }" @click="trainingType='dehnung'">Dehnung</button>
                        </div>
                    </div>

                    <!-- Trainingstyp (Mobile =560px: Label + Dropdown) -->
                    <div v-if="builderMode === 'manual'" class="type-block mobile-only">
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
                    <ExtrasToggleButton v-if="builderMode === 'manual'"
                                        :extraClass="['action-btn','extras-cta']"
                                        :toggled="showExtras"
                                        :title="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                        :aria-label="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                        @click="toggleExtras" />
                </div>

                <div v-if="builderMode === 'manual'" v-show="showExtras" class="goal-row">
                    <label class="field-label">Trainingsziel</label>
                    <div class="field-row">
                        <UiSelect v-model="selectedGoalSafe"
                                  class="goal-select"
                                  placeholder="Trainingsziel"
                                  :options="trainingGoals" />
                    </div>
                </div>

                <div v-if="builderMode === 'auto'" class="goal-row auto-plan-section">
                    <div class="field-grid">
                        <div class="field">
                            <label>Primärziel</label>
                            <UiSelect v-model="autoPrimaryGoal"
                                      placeholder="Ziel"
                                      :options="autoGoalOptions" />
                        </div>
                        <div class="field">
                            <label>Level</label>
                            <UiSelect v-model="autoLevel"
                                      placeholder="Level"
                                      :options="autoLevelOptions" />
                        </div>
                    </div>
                    <div class="field-grid">
                        <div class="field">
                            <label>Training pro Woche</label>
                            <UiTrainingInput v-model.number="autoWeeklyFrequency"
                                             id="auto-frequency"
                                             type="number"
                                             min="1"
                                             max="7" />
                        </div>
                        <div class="field">
                            <label>Min pro Training</label>
                            <UiTrainingInput v-model.number="autoSessionDuration"
                                             id="auto-duration"
                                             type="number"
                                             min="20"
                                             max="120" />
                        </div>
                    </div>
                    <div class="field-grid auto-plan-names">
                        <div v-for="(_, index) in autoPlanNames"
                             :key="`auto-plan-name-${index}`"
                             class="field">
                            <label :for="`auto-plan-name-${index}`">Planname {{ index + 1 }}</label>
                            <UiTrainingInput :id="`auto-plan-name-${index}`"
                                             v-model="autoPlanNames[index]"
                                             :placeholder="`Planname ${index + 1}`" />
                        </div>
                    </div>
                    <div class="field-grid">
                        <div class="field">
                            <label>Split Präferenz</label>
                            <UiSelect v-model="autoSplitPreference"
                                      placeholder="Split"
                                      :options="autoSplitOptions" />
                        </div>
                        <div class="field">
                            <label>Equipment-Profil</label>
                            <UiSelect v-model="autoEquipmentPreset"
                                      placeholder="Equipment"
                                      :options="autoEquipmentOptions" />
                        </div>
                    </div>
                    <div class="auto-toggles-section">
                        <span class="field-label auto-toggles-title">Plan-Optionen ankreuzen</span>
                    </div>
                    <div class="field-grid auto-toggles">
                        <label><input v-model="autoMachineFocus" type="checkbox" /> Maschinenfokus</label>
                        <label><input v-model="autoFreeWeightFocus" type="checkbox" /> Freihantelfokus</label>
                        <label><input v-model="autoJointFriendly" type="checkbox" /> Gelenkschonend</label>
                        <label><input v-model="autoNoCardio" type="checkbox" /> Kein Cardio</label>
                        <label>
                            <input v-model="autoNoHiiT" type="checkbox" />
                            <span class="auto-toggle-inline">
                                <span>Kein HIIT</span>
                                <span class="auto-toggle-help" @click.stop.prevent>
                                    <ExplanationPopup
                                        title="HIIT"
                                        kicker="Plan-Option erklärt"
                                        aria-open="HIIT Info öffnen">
                                        <HiitExplain />
                                    </ExplanationPopup>
                                </span>
                            </span>
                        </label>
                        <label><input v-model="autoNoOverhead" type="checkbox" /> Keine Überkopfbewegungen</label>
                        <label><input v-model="autoNoDeepKneeFlexion" type="checkbox" /> Keine tiefe Kniebeugung</label>
                        <label>
                            <input v-model="autoNoHighAxialLoad" type="checkbox" />
                            <span class="auto-toggle-inline">
                                <span>Keine hohe axiale Last</span>
                                <span class="auto-toggle-help" @click.stop.prevent>
                                    <ExplanationPopup
                                        title="Hohe axiale Last"
                                        kicker="Plan-Option erklärt"
                                        aria-open="Axiale Last Info öffnen">
                                        <AxialLoadExplain />
                                    </ExplanationPopup>
                                </span>
                            </span>
                        </label>
                        <label><input v-model="autoNoJumping" type="checkbox" /> Keine Sprungbewegungen</label>
                        <label><input v-model="autoNoRotation" type="checkbox" /> Keine Rotation</label>
                        <label><input v-model="autoNoUnstable" type="checkbox" /> Keine instabilen Übungen</label>
                    </div>
                    <div v-if="autoMachineFocus || autoFreeWeightFocus || autoJointFriendly" class="field-grid">
                        <div v-if="autoMachineFocus" class="field">
                            <label>Maschinenfokus (%)</label>
                            <UiTrainingInput v-model.number="autoMachineFocusWeight"
                                             id="auto-machine-focus-weight"
                                             type="number"
                                             min="0"
                                             max="100" />
                        </div>
                        <div v-if="autoFreeWeightFocus" class="field">
                            <label>Freihantelfokus (%)</label>
                            <UiTrainingInput v-model.number="autoFreeWeightFocusWeight"
                                             id="auto-free-weight-focus-weight"
                                             type="number"
                                             min="0"
                                             max="100" />
                        </div>
                        <div v-if="autoJointFriendly" class="field">
                            <label>Gelenkschonend (%)</label>
                            <UiTrainingInput v-model.number="autoJointFriendlyWeight"
                                             id="auto-joint-friendly-weight"
                                             type="number"
                                             min="0"
                                             max="100" />
                        </div>
                    </div>
                    <div class="field-grid">
                        <div class="field">
                            <label>Muskelgruppen Fokus</label>
                            <UiSelect v-model="autoFocusMuscleDraft"
                                      placeholder="Muskelgruppe wählen"
                                      :options="availableAutoFocusMuscleOptions" />
                            <div v-if="autoFocusMuscles.length"
                                 class="auto-selected-list"
                                 role="list"
                                 aria-label="Ausgewählte Fokus-Muskelgruppen">
                                <button v-for="value in autoFocusMuscles"
                                        :key="`focus-selected-${value}`"
                                        type="button"
                                        class="auto-selected-tag"
                                        @click="toggleAutoFocusMuscle(value)">
                                    {{ value }} ×
                                </button>
                            </div>
                        </div>
                        <div class="field">
                            <label>Muskelgruppen meiden</label>
                            <UiSelect v-model="autoExcludedMuscleDraft"
                                      placeholder="Muskelgruppe wählen"
                                      :options="availableAutoExcludedMuscleOptions" />
                            <div v-if="autoExcludedMuscles.length"
                                 class="auto-selected-list"
                                 role="list"
                                 aria-label="Ausgewählte ausgeschlossene Muskelgruppen">
                                <button v-for="value in autoExcludedMuscles"
                                        :key="`exclude-selected-${value}`"
                                        type="button"
                                        class="auto-selected-tag"
                                        @click="toggleAutoExcludedMuscle(value)">
                                    {{ value }} ×
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="field-grid">
                        <div class="field">
                            <label>Bevorzugte Übungen</label>
                            <AutoExerciseSelector
                                id="auto-preferred-exercises"
                                v-model="autoPreferredExerciseRefs"
                                placeholder="z. B. Hip Thrust, Latzug, Beinpresse"
                                :muscle-group-options="autoMuscleGroupOptions" />
                        </div>
                        <div class="field">
                            <label>Übungen ausschließen</label>
                            <AutoExerciseSelector
                                id="auto-excluded-exercises"
                                v-model="autoExcludedExerciseRefs"
                                placeholder="z. B. Kniebeugen, Seilspringen, Schulterdrücken"
                                :muscle-group-options="autoMuscleGroupOptions" />
                        </div>
                    </div>
                    <div v-if="activeAutoReportedExerciseOverrides.length" class="auto-report-overrides">
                        <button
                            type="button"
                            class="auto-report-overrides__toggle"
                            :aria-expanded="showAutoReportedExercises"
                            @click="showAutoReportedExercises = !showAutoReportedExercises">
                            <span class="field-label">Gemeldete Übungen</span>
                            <span>{{ activeAutoReportedExerciseOverrides.length }} aktiv · {{ showAutoReportedExercises ? 'Ausblenden' : 'Aufklappen' }}</span>
                        </button>
                        <div
                            v-if="showAutoReportedExercises"
                            class="auto-selected-list"
                            role="list"
                            aria-label="Gemeldete Übungen">
                            <button
                                v-for="entry in activeAutoReportedExerciseOverrides"
                                :key="getAutoExerciseOverrideKey(entry.reference)"
                                type="button"
                                class="auto-selected-tag auto-selected-tag--report"
                                @click="reactivateReportedAutoExercise(entry.reference)">
                                {{ entry.reference.label || entry.reference.canonicalName }} · {{ getAutoExerciseReportReasonLabel(entry.reason) }} ×
                            </button>
                        </div>
                    </div>
                    <div class="actions-row stack auto-plan-cta-row">
                        <button class="primary-btn"
                                type="button"
                                @click="generateAutoPlanIntoBuilder">
                            Auto-Plan generieren
                        </button>
                    </div>
                </div>

                <!-- Filter -->
                <div class="field-block" v-if="builderMode === 'manual' && trainingType !== 'ausdauer'">
                    <label class="field-label">Muskelgruppe</label>
                    <div class="field-row">
                        <UiTrainingInput id="exercise-filter"
                                         class="filter-input"
                                         v-model="exerciseFilter"
                                         placeholder="z. B. Brust, Oberkörper, Push" />
                    </div>
                </div>

                <!-- Übungsauswahl -->
                <div class="field-block" v-if="builderMode === 'manual' && trainingType !== 'ausdauer'">
                    <label class="field-label">Übung</label>
                    <div class="field-row field-row-stack">
                        <UiSelect v-model="newExerciseSafe"
                                  placeholder="Übung wählen"
                                  :options="[
...filteredExercises,
{ value: 'custom', label: 'Eigene Übung hinzufügen…', isCustom: true }
]" />

                        <UiTrainingInput v-if="newExercise === 'custom'"
                                         id="custom-exercise"
                                         v-model="customPlanExercise"
                                         placeholder="Eigene Übung eingeben" />
                    </div>
                </div>

                <!-- Cardio -->
                <div class="field-block" v-else-if="builderMode === 'manual'">
                    <label class="field-label">Cardio-Art</label>
                    <div class="field-row">
                        <UiSelect v-model="cardioExerciseSafe"
                                  placeholder="Cardio-Art"
                                  :options="filteredExercises" />
                    </div>
                </div>

                <!-- Parameter -->
                <div class="field-grid" v-if="builderMode === 'manual' && (trainingType === 'kraft' || trainingType === 'calisthenics')">
                    <div class="field">
                        <label>Sätze</label>
                        <UiTrainingInput id="strength-sets"
                                         v-model.number="newSets"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 4" />                    </div>
                    <div class="field">
                        <label>Wiederholungen</label>
                        <UiTrainingInput id="strength-reps"
                                         v-model.number="newReps"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 8–12" />                    </div>
                </div>

                <div class="field-grid" v-else-if="builderMode === 'manual' && trainingType === 'dehnung'">
                    <div class="field">
                        <label>Holds</label>
                        <UiTrainingInput id="stretch-holds"
                                         v-model.number="newSets"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 3" />                    </div>
                    <div class="field">
                        <label>Sekunden pro Hold</label>
                        <UiTrainingInput id="stretch-seconds"
                                         v-model.number="newReps"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 30" />                    </div>
                </div>

                <div class="field-grid" v-else-if="builderMode === 'manual'">
                    <div class="field">
                        <label>Dauer (Min)</label>
                        <UiTrainingInput id="cardio-duration"
                                         v-model.number="newDuration"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 25" />                    </div>
                    <div class="field">
                        <label>Distanz (km, optional)</label>
                        <UiTrainingInput id="cardio-distance"
                                         v-model.number="newDistance"
                                         type="number"
                                         min="0"
                                         step="0.1"
                                         placeholder="z. B. 5" />                    </div>
                </div>

                <!-- Actions -->
                <div v-if="builderMode === 'manual'" class="actions-row stack">
                    <div class="button-group">
                        <div class="btn-cell">
                            <AddExerciseButton class="action-btn add-exercise-btn block"
                                               title="Übung hinzufügen"
                                               @click="addExerciseToPlan" />
                        </div>
                    </div>
                </div>

                <PlanSubmitButton class="action-btn plan-submit-btn"
                                  :isEditing="!!editingPlanId"
                                  :disabled="isPlanSubmitDisabled"
                                  :createLabel="autoCreateButtonLabel"
                                  saveLabel="Plan speichern" />
            </div>

            <!-- RIGHT: Live Preview (sticky) -->
            <div class="builder-right">
                <div class="preview-card">
                    <div class="preview-head">
                        <h4>Live-Preview</h4>
                        <span v-if="builderMode === 'auto' && generatedAutoPlans.length" class="muted">
                            {{ generatedAutoPlans.length }} Pläne
                        </span>
                        <span v-else-if="selectedPlanExercises.length" class="muted">
                            {{ selectedPlanExercises.length }} Übung{{ selectedPlanExercises.length===1?'':'en' }}
                        </span>
                    </div>

                    <div v-if="builderMode === 'auto' && generatedAutoPlans.length" class="auto-preview-list">
                        <div v-for="(plan, planIndex) in generatedAutoPlans"
                             :key="`${plan.name}-${planIndex}`"
                             class="auto-preview-plan">
                            <div class="auto-preview-plan__head">
                                <h5>{{ plan.name }}</h5>
                                <button
                                    type="button"
                                    class="auto-preview-plan__regen"
                                    :disabled="regeneratingPlanIndex === planIndex"
                                    @click="regenerateAutoPreviewPlan(planIndex)">
                                    {{ regeneratingPlanIndex === planIndex ? 'Generiert...' : 'Neu generieren' }}
                                </button>
                            </div>
                            <Table class="exercise-table full-width compact" density="compact">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Übung</th>
                                            <th>{{ plan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}</th>
                                            <th>{{ plan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung') ? 'Wdh. / km / s' : 'Wiederholungen' }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(ex, exIndex) in plan.exercises" :key="`${planIndex}-${exIndex}-${ex.exercise}`">
                                            <td>
                                                <div class="auto-exercise-cell">
                                                    <span>{{ ex.exercise }}</span>
                                                    <button
                                                        type="button"
                                                        class="auto-exercise-report-btn"
                                                        title="Melden"
                                                        aria-label="Übung melden"
                                                        :data-tyg="planIndex === 0 && exIndex === 0 ? 'auto-report-button' : null"
                                                        @click="toggleAutoExerciseReport(planIndex, exIndex)">
                                                        !
                                                    </button>
                                                </div>
                                            </td>
                                            <td>{{ ex.type === 'ausdauer' ? `${ex.sets} min` : ex.sets }}</td>
                                            <td>
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
                        </div>
                    </div>

                    <Table v-else-if="selectedPlanExercises.length"
                           class="exercise-table full-width compact"
                           density="compact">
                        <table ref="previewTable" data-cols="4">
                            <thead>
                                <tr>
                                    <th class="resizable" :style="{ width: previewColWidths[0] + '%' }">
                                        <span class="th-text">Übung</span>
                                    </th>
                                    <th class="resizable" :style="{ width: previewColWidths[1] + '%' }">
                                        <span class="th-text">
                                            {{ selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                        </span>
                                    </th>
                                    <th class="resizable th-wdh" :style="{ width: previewColWidths[2] + '%' }">
                                        <span class="th-text th-label">
                                            <span class="full">
                                                {{
selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'Wdh. / km / s'
                      : 'Wiederholungen'
                                                }}
                                            </span>
                                            <span class="mid">
                                                {{
selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'Wdh./km/s'
                      : 'Wiederhol...'
                                                }}
                                            </span>
                                            <span class="short">
                                                {{
selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung')
                      ? 'W/km/s'
                      : 'Wdh.'
                                                }}
                                            </span>
                                        </span>
                                    </th>

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

        <AutoExerciseReportPopup
            :show="autoExerciseReportState !== null"
            :exercise-name="reportedAutoExerciseName"
            v-model="autoExerciseReportReason"
            :submitting="submittingExerciseReport"
            :reason-options="autoExerciseReportReasonOptions"
            @cancel="closeAutoExerciseReport()"
            @submit="submitAutoExerciseReport()" />

        <AutoPlanReportTutorial
            :isActive="showAutoPlanReportTutorial"
            @done="closeAutoPlanReportTutorial()" />

    </div>
</template>

<script setup lang="ts">
    import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
    import { useRoute } from 'vue-router'
    import UiSelect from '@/components/ui/kits/UiSelect.vue'
    import AutoExerciseSelector from '@/components/ui/training/AutoExerciseSelector.vue'
    import AxialLoadExplain from '@/components/ui/explain/AxialLoadExplain.vue'
    import HiitExplain from '@/components/ui/explain/HiitExplain.vue'
    import AutoExerciseReportPopup from '@/components/ui/popups/AutoExerciseReportPopup.vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import AutoPlanReportTutorial from '@/components/ui/TygTutorials/AutoPlanReportTutorial.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue'
    import AddExerciseButton from '@/components/ui/buttons/AddExerciseButton.vue'
    import PlanSubmitButton from '@/components/ui/buttons/PlanSubmitButton.vue'
    import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
    import Table from '@/components/ui/kits/UiTable.vue'
    import UiTrainingInput from '@/components/ui/kits/inputs/UiTrainingInput.vue'
    import { useTrainingPlansStore } from "@/store/trainingPlansStore";
    import { useComplaintsStore } from "@/store/complaintsStore";
    import { useExerciseLibraryStore } from '@/store/exerciseLibraryStore'
    import { generateAutoPlan, regenerateAutoPlanDay } from '@/services/training/autoPlanGeneratorService'
    import { normalizeExerciseText, resolveExerciseReference } from '@/services/training/exerciseLibrary'

    import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "@/types/TrainingPlan"
    import { useAuthStore } from "@/store/authStore";
    import type { GeneratorExerciseReference, GoalType, GeneratorInput, TrainingLevel } from '@/types/autoPlan'

    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>

    const props = defineProps<{
        openEditPopup: (type: any, index: any, event?: MouseEvent) => void
        addToast: (message: string, type?: any) => void
        openValidationPopup: (errors: string[]) => void

        openDeletePopup?: (action: () => void) => void

        // ? Guest: Plan an Training.vue hochreichen
        onGuestPlanCreated?: (plan: ViewPlan) => void

        // ? v-model Quelle
        customExercises?: Array<{ name: string; muscle: string; type: CustomExerciseType }>
        saveToStorage?: () => void
    }>()

    const emit = defineEmits<{
        (e: 'update:customExercises', value: Array<{ name: string; muscle: string; type: CustomExerciseType }>): void
        (e: 'plan-created', payload: { id: string; name: string }): void
    }>()

    const customExercisesState = ref<Array<{ name: string; muscle: string; type: CustomExerciseType }>>(
        Array.isArray(props.customExercises) ? [...props.customExercises] : []
    )
    const route = useRoute()
    const previewBuilderTimers: number[] = []
    const previewTouch = ref({ visible: false, x: 0, y: 0 })
    const isPhonePreviewBuilderDemo = computed(
        () => route.query.preview === 'phone' && route.query.demo === 'builder'
    )

    const sameCustom = (
        a: Array<{ name: string; muscle: string; type: CustomExerciseType }>,
        b: Array<{ name: string; muscle: string; type: CustomExerciseType }>
    ) => {
        if (a === b) return true
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
            const x = a[i], y = b[i]
            if (!y) return false
            if (x.name !== y.name || x.muscle !== y.muscle || x.type !== y.type) return false
        }
        return true
    }

    watch(
        () => props.customExercises,
        (val) => {
            const next = Array.isArray(val) ? [...val] : []
            if (!sameCustom(customExercisesState.value, next)) {
                customExercisesState.value = next
            }
        },
        { deep: false }
    )

    watch(
        customExercisesState,
        (val) => {
            const currentProp = Array.isArray(props.customExercises) ? props.customExercises : []
            if (!sameCustom(currentProp as any, val)) {
                emit('update:customExercises', [...val])
            }
        },
        { deep: true }
    )
    // ===== Typen (wie in Training.vue) =====
    interface PlanExercise {
        exercise: string;
        sets: number;
        reps: number;
        goal?: string;
        type?: 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung';
        restSeconds?: number;
        durationMin?: number | null;
        distanceKm?: number | null;
        notes?: string;
        complaintAdjustmentReason?: string;
    }

    type AutoGeneratedPlanPreview = {
        name: string
        dayName: string
        focus: string
        dayIndex: number
        exercises: PlanExercise[]
    }

    type ViewPlan = {
        id: string;
        name: string;
        isFavorite: boolean;
        exercises: PlanExercise[];
        exerciseCount: number;
    };

    type TrainingPlan = ViewPlan;

    // ===== Store =====
    const trainingPlansStore = useTrainingPlansStore()
    const auth = useAuthStore()
    const complaintsStore = useComplaintsStore()
    const exerciseLibraryStore = useExerciseLibraryStore()

    // ===== Builder State (1:1 übernommen) =====
    const planName = ref('')
    const newExercise = ref('')
    const customPlanExercise = ref('')
    const newReps = ref<number | null>(null)
    const newSets = ref<number | null>(null)
    const trainingType = ref<'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung'>('kraft')
    const cardioTypes = ref([
        'Laufen', 'Radfahren', 'Rudern', 'Crosstrainer', 'Seilspringen', 'Treppensteigen', 'Schwimmen'
    ])
    const cardioExercise = ref('')
    const newDuration = ref<number | null>(null)
    const newDistance = ref<number | null>(null)

    const previewColWidths = ref([50, 25, 19, 6])
    const previewTable = ref<HTMLTableElement | null>(null)

    const editingPlanId = ref<string | null>(null)
    const selectedPlanExercises = ref<PlanExercise[]>([])
    const selectedGoal = ref('')
    const trainingGoals = ref(['Muskelaufbau', 'Abnehmen', 'Ausdauer', 'Kraft'])
    const showExtras = ref(false)
    const builderMode = ref<'manual' | 'auto'>('manual')
    const generatedAutoPlans = ref<AutoGeneratedPlanPreview[]>([])
    const regeneratingPlanIndex = ref<number | null>(null)
    const autoExerciseReportReason = ref<string | null>('')
    const autoExerciseReportState = ref<{ planIndex: number; exerciseIndex: number } | null>(null)
    const submittingExerciseReport = ref(false)
    const AUTO_PLAN_REPORT_TUTORIAL_KEY = 'gym3000:auto-plan-report-tutorial-seen'
    const showAutoPlanReportTutorial = ref(false)
    let autoPlanReportTutorialTimer: ReturnType<typeof setTimeout> | null = null

    const autoPrimaryGoal = ref<GoalType>('muscle_gain')
    const autoLevel = ref<TrainingLevel>('beginner')
    const autoWeeklyFrequency = ref(3)
    const autoSessionDuration = ref(45)
    const autoSplitPreference = ref<'auto' | 'full_body' | 'upper_lower' | 'ppl'>('auto')
    const autoEquipmentPreset = ref<'full_gym' | 'home_gym' | 'bodyweight_only' | 'dumbbells_only'>('full_gym')
    const autoMachineFocus = ref(false)
    const autoMachineFocusWeight = ref(50)
    const autoFreeWeightFocus = ref(false)
    const autoFreeWeightFocusWeight = ref(50)
    const autoJointFriendly = ref(false)
    const autoJointFriendlyWeight = ref(50)
    const autoNoCardio = ref(false)
    const autoNoHiiT = ref(false)
    const autoNoOverhead = ref(false)
    const autoNoDeepKneeFlexion = ref(false)
    const autoNoHighAxialLoad = ref(false)
    const autoNoJumping = ref(false)
    const autoNoRotation = ref(false)
    const autoNoUnstable = ref(false)
    const autoPlanNames = ref<string[]>([])
    const autoExcludedExerciseRefs = ref<GeneratorExerciseReference[]>([])
    const autoExcludedMuscles = ref<string[]>([])
    const autoFocusMuscles = ref<string[]>([])
    const autoExcludedMuscleDraft = ref<string | number | null>('')
    const autoFocusMuscleDraft = ref<string | number | null>('')
    const autoPreferredExerciseRefs = ref<GeneratorExerciseReference[]>([])
    const autoReportedExerciseOverrides = ref<Array<{
        reference: GeneratorExerciseReference
        reason: string
        active: boolean
    }>>([])
    const showAutoReportedExercises = ref(false)
    const autoMuscleGroupOptions = [
        { value: 'Brust', label: 'Brust' },
        { value: 'Rücken', label: 'Rücken' },
        { value: 'Beine', label: 'Beine' },
        { value: 'Schultern', label: 'Schultern' },
        { value: 'Arme', label: 'Arme' },
        { value: 'Core', label: 'Core / Bauch' },
        { value: 'Gesäß', label: 'Gesäß / Po' },
        { value: 'Cardio', label: 'Cardio' },
        { value: 'Mobility', label: 'Mobility' },
    ] as const
    const autoGoalOptions = [
        { value: 'muscle_gain', label: 'Muskelaufbau' },
        { value: 'strength', label: 'Kraftaufbau' },
        { value: 'fat_loss', label: 'Fettverlust/Kalorienverbrauch' },
        { value: 'general_fitness', label: 'Allgemeine Fitness' },
        { value: 'endurance', label: 'Ausdauer verbessern' },
        { value: 'health', label: 'Gesundheit/Schmerzreduktion' },
    ]
    const autoLevelOptions = [
        { value: 'beginner', label: 'Anfänger' },
        { value: 'intermediate', label: 'Fortgeschritten' },
        { value: 'advanced', label: 'Erfahren' },
    ]
    const autoSplitOptions = [
        { value: 'auto', label: 'Auto' },
        { value: 'full_body', label: 'Ganzkörper' },
        { value: 'upper_lower', label: 'Oberkörper/Unterkörper' },
        { value: 'ppl', label: 'Push/Pull/Legs' },
    ]
    const autoEquipmentOptions = [
        { value: 'full_gym', label: 'Voll ausgestattetes Gym' },
        { value: 'home_gym', label: 'Home Gym' },
        { value: 'bodyweight_only', label: 'Nur Körpergewicht' },
        { value: 'dumbbells_only', label: 'Nur Kurzhanteln' },
    ]
    const autoExerciseReportReasonOptions = [
        { value: 'wrong_exercise', label: 'Übung ist falsch' },
        { value: 'exercise_missing', label: 'Übung gibt es nicht' },
        { value: 'gym_missing', label: 'Hat mein Gym nicht' },
        { value: 'i_do_not_have', label: 'Habe ich nicht' },
    ]

    const exerciseFilter = ref('')

    const builderSection = ref<HTMLElement | null>(null)

    const setBuilderMode = (mode: 'manual' | 'auto') => {
        if (builderMode.value === mode) return

        builderMode.value = mode

        if (mode === 'manual' && !editingPlanId.value) {
            planName.value = ''
        }
    }

    const setEditMode = (payload: {
        planId: string | null
        name: string
        exercises: PlanExercise[]
    }) => {
        generatedAutoPlans.value = []
        editingPlanId.value = payload.planId
        planName.value = payload.name
        selectedPlanExercises.value = Array.isArray(payload.exercises) ? [...payload.exercises] : []

        // ? nice default: Typ passend zum Plan
        const firstType = selectedPlanExercises.value[0]?.type
        if (firstType) trainingType.value = firstType
    }

    const clearEditMode = () => {
        editingPlanId.value = null
        generatedAutoPlans.value = []
    }

    const scrollToBuilder = () => {
        const el = builderSection.value
        if (!el) return

        const offset = 8
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })

        el.classList.remove('builder-landing')
        void (el as any).offsetWidth
        el.classList.add('builder-landing')
        // optional: Planname fokussieren
        const input = document.getElementById('plan-name') as HTMLInputElement | null
        if (input) input.focus({ preventScroll: true })
    }

    defineExpose({
        builderSection,
        setEditMode,
        clearEditMode,
        resetBuilder,
        scrollToBuilder,

        // ?? Parent darf Preview-Liste lesen/patchen (für zentrales EditPopup)
        getPreviewExercises: () => selectedPlanExercises.value,
        getPreviewExercise: (i: number) => selectedPlanExercises.value[i] ?? null,
        updatePreviewExercise: (i: number, patch: Partial<PlanExercise>) => {
            const ex = selectedPlanExercises.value[i]
            if (!ex) return false
            Object.assign(ex, patch)
            return true
        },
    })

    // ===== Helpers (aus deinem Script übernommen, soweit Builder-relevant) =====
    const validatePlanName = (name: string): string | false => {
        const trimmedName = name.trim()
        if (trimmedName.length < 3) return false
        if (trimmedName.length > 20) return false
        return trimmedName
    }

    const MAX_PLAN_NAME_LEN = 20

    const buildNumberedPlanName = (baseName: string, seq: number) => {
        const suffix = ` (${seq})`
        const base = (baseName ?? '').trim() || 'Plan'
        const trimmedBase = base.slice(0, Math.max(0, MAX_PLAN_NAME_LEN - suffix.length)).trim()
        const safeBase = trimmedBase || base.slice(0, 1) || 'P'
        return `${safeBase}${suffix}`
    }

    const makeUniquePlanNames = (
        names: string[],
        opts?: { ignoreId?: string | null }
    ) => {
        const anyStore = trainingPlansStore as any
        const existingPlans = (anyStore.items ?? anyStore.plans ?? anyStore.trainingPlans ?? []) as any[]
        const used = new Set(
            existingPlans
                .filter((p: any) => String(p?.id ?? '').toLowerCase() !== String(opts?.ignoreId ?? '').toLowerCase())
                .map((p: any) => String(p?.name ?? '').trim().toLowerCase())
                .filter(Boolean)
        )

        return names.map((rawName) => {
            const validated = validatePlanName(rawName)
            const baseName = typeof validated === 'string' ? validated : String(rawName ?? '').trim()

            let candidate = baseName
            let seq = 2
            while (!candidate || used.has(candidate.toLowerCase())) {
                candidate = buildNumberedPlanName(baseName, seq)
                seq++
            }

            used.add(candidate.toLowerCase())
            return candidate
        })
    }

    const buildAutoPlanName = (baseName: string, index: number) => {
        const fallbackBase = validatePlanName(baseName) || 'Auto Plan'
        const suffix = ` ${index + 1}`
        const maxBaseLength = Math.max(3, 20 - suffix.length)
        return `${fallbackBase.slice(0, maxBaseLength).trim()}${suffix}`
    }

    const syncAutoPlanNames = (baseName?: string) => {
        const nextLength = Math.max(0, Math.min(7, Number(autoWeeklyFrequency.value) || 0))
        const current = autoPlanNames.value.slice(0, nextLength)
        while (current.length < nextLength) {
            current.push(buildAutoPlanName(baseName ?? planName.value, current.length))
        }
        autoPlanNames.value = current
    }

    const hasExercisesToSave = computed(() =>
        builderMode.value === 'auto' && generatedAutoPlans.value.length > 0
            ? generatedAutoPlans.value.some((plan) => plan.exercises.length > 0)
            : selectedPlanExercises.value.length > 0
    )

    const autoGeneratedPlansToPersist = computed(() =>
        generatedAutoPlans.value.filter((plan) => Array.isArray(plan.exercises) && plan.exercises.length > 0)
    )

    const autoCreateButtonLabel = computed(() => {
        if (builderMode.value !== 'auto' || editingPlanId.value) return 'Plan erstellen'
        return autoGeneratedPlansToPersist.value.length > 1 ? 'Pläne erstellen' : 'Plan erstellen'
    })

    const isPlanSubmitDisabled = computed(() => {
        if (builderMode.value !== 'auto') return validatePlanName(planName.value) === false
        if (!hasExercisesToSave.value) return true

        const plans = autoGeneratedPlansToPersist.value
        if (!plans.length) return true

        if (editingPlanId.value) return plans.length !== 1 || validatePlanName(planName.value) === false
        return plans.some((plan) => validatePlanName(plan.name) === false)
    })

    const validateReps = (reps: number | null | undefined) => {
        if (reps == null || isNaN(reps)) return 'Wiederholungen/Sekunden müssen eine Zahl sein'
        if (!Number.isFinite(reps)) return 'Ungültige Zahl'
        if (!Number.isInteger(reps)) return 'Wiederholungen/Sekunden müssen eine Ganzzahl sein'
        if (reps < 1 || reps > 1000) return 'Wiederholungen/Sekunden müssen zwischen 1 und 1000 liegen'
        return null
    }

    const validateSets = (sets: number | null | undefined) => {
        if (sets == null || isNaN(sets)) return 'Sätze müssen eine Zahl sein'
        if (sets < 1 || sets > 20) return 'Sätze müssen zwischen 1 und 20 liegen'
        if (!Number.isInteger(sets)) return 'Sätze müssen eine Ganzzahl sein'
        return null
    }

    const validateDurationMin = (val: number | null | undefined) => {
        if (val == null || isNaN(val)) return 'Dauer (Minuten) muss eine Zahl sein'
        if (!Number.isInteger(val)) return 'Dauer (Minuten) muss eine Ganzzahl sein'
        if (val < 1 || val > 600) return 'Dauer (Minuten) muss zwischen 1 und 600 liegen'
        return null
    }
    const validateDistanceKm = (val: number | null | undefined) => {
        if (val == null || val === undefined || val === 0) return null
        if (val < 0 || val > 1000) return 'Distanz (km) muss zwischen 0 und 1000 liegen'
        return null
    }

    const availableAutoExcludedMuscleOptions = computed(() =>
        autoMuscleGroupOptions.filter((option) => !autoExcludedMuscles.value.includes(option.value))
    )

    const availableAutoFocusMuscleOptions = computed(() =>
        autoMuscleGroupOptions.filter((option) => !autoFocusMuscles.value.includes(option.value))
    )

    const activeAutoReportedExerciseOverrides = computed(() =>
        autoReportedExerciseOverrides.value.filter((entry) => entry.active)
    )

    const libraryEntries = computed(() => exerciseLibraryStore.entries)
    const libraryStrengthExercises = computed(() =>
        libraryEntries.value.filter((entry) => entry.kind === 'strength').map((entry) => entry.name)
    )
    const libraryBodyweightStrengthExercises = computed(() =>
        libraryEntries.value
            .filter((entry) => entry.kind === 'strength' && entry.equipment.includes('bodyweight'))
            .map((entry) => entry.name)
    )
    const libraryMobilityExercises = computed(() =>
        libraryEntries.value.filter((entry) => entry.kind === 'mobility').map((entry) => entry.name)
    )
    const libraryCardioExercises = computed(() =>
        libraryEntries.value.filter((entry) => entry.kind === 'cardio').map((entry) => entry.name)
    )
    const libraryExercisesByMuscle = computed(() => {
        const grouped: Record<string, string[]> = {}
        for (const entry of libraryEntries.value) {
            const key = entry.muscleGroup
            if (!key) continue
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(entry.name)
        }
        return grouped
    })

    const toggleSelection = (list: string[], value: string) =>
        list.includes(value)
            ? list.filter((entry) => entry !== value)
            : [...list, value]

    const toggleAutoExcludedMuscle = (value: string) => {
        autoExcludedMuscles.value = toggleSelection(autoExcludedMuscles.value, value)
    }

    const toggleAutoFocusMuscle = (value: string) => {
        autoFocusMuscles.value = toggleSelection(autoFocusMuscles.value, value)
    }

    watch(autoExcludedMuscleDraft, (value) => {
        if (typeof value !== 'string' || !value) return
        if (!autoExcludedMuscles.value.includes(value)) {
            autoExcludedMuscles.value = [...autoExcludedMuscles.value, value]
        }
        autoExcludedMuscleDraft.value = ''
    })

    watch(autoFocusMuscleDraft, (value) => {
        if (typeof value !== 'string' || !value) return
        if (!autoFocusMuscles.value.includes(value)) {
            autoFocusMuscles.value = [...autoFocusMuscles.value, value]
        }
        autoFocusMuscleDraft.value = ''
    })

    const clampPercent = (value: number) => Math.max(0, Math.min(100, Number(value) || 0))
    const getAutoPreferenceWeightTotal = () =>
        (autoMachineFocus.value ? autoMachineFocusWeight.value : 0)
        + (autoFreeWeightFocus.value ? autoFreeWeightFocusWeight.value : 0)
        + (autoJointFriendly.value ? autoJointFriendlyWeight.value : 0)

    watch(autoMachineFocusWeight, (value) => {
        const next = clampPercent(value)
        if (next !== value) autoMachineFocusWeight.value = next
    })

    watch(autoFreeWeightFocusWeight, (value) => {
        const next = clampPercent(value)
        if (next !== value) autoFreeWeightFocusWeight.value = next
    })

    watch(autoJointFriendlyWeight, (value) => {
        const next = clampPercent(value)
        if (next !== value) autoJointFriendlyWeight.value = next
    })

    watch(autoWeeklyFrequency, () => {
        syncAutoPlanNames()
    }, { immediate: true })

    watch(planName, (value) => {
        if (builderMode.value !== 'auto') return
        if (autoPlanNames.value.some((entry) => entry.trim().length > 0)) return
        syncAutoPlanNames(value)
    })

    watch(autoPlanNames, (value) => {
        if (!generatedAutoPlans.value.length) return
        generatedAutoPlans.value = generatedAutoPlans.value.map((plan, index) => ({
            ...plan,
            name: value[index]?.trim() || plan.name,
        }))
    }, { deep: true })

    const buildGeneratorInput = (): GeneratorInput => {
        const exclusionTypes: Array<'no_jumping' | 'no_overhead' | 'no_deep_knee_flexion' | 'no_high_axial_load' | 'no_rotation' | 'no_unstable'> = []
        if (autoNoJumping.value) exclusionTypes.push('no_jumping')
        if (autoNoOverhead.value) exclusionTypes.push('no_overhead')
        if (autoNoDeepKneeFlexion.value) exclusionTypes.push('no_deep_knee_flexion')
        if (autoNoHighAxialLoad.value) exclusionTypes.push('no_high_axial_load')
        if (autoNoRotation.value) exclusionTypes.push('no_rotation')
        if (autoNoUnstable.value) exclusionTypes.push('no_unstable')

        const activeComplaints = complaintsStore.activeEntries.map((x) => x.area)
        const preset = autoEquipmentPreset.value
        const isFullGym = preset === 'full_gym'
        const isHomeGym = preset === 'home_gym'
        const bodyweightOnly = preset === 'bodyweight_only'
        const dumbbellsOnly = preset === 'dumbbells_only'
        const effectiveExcludedExerciseRefs = [...autoExcludedExerciseRefs.value]
        for (const reference of activeAutoReportedExerciseOverrides.value.map((entry) => entry.reference)) {
            if (!effectiveExcludedExerciseRefs.some((entry) => sameExerciseReference(entry, reference))) {
                effectiveExcludedExerciseRefs.push(reference)
            }
        }

        return {
            planName: planName.value.trim() || undefined,
            primaryGoal: autoPrimaryGoal.value,
            secondaryGoals: [],
            level: autoLevel.value,
            weeklyFrequency: autoWeeklyFrequency.value,
            sessionDurationMin: autoSessionDuration.value,
            equipmentProfile: {
                fullGym: isFullGym,
                homeGym: isHomeGym,
                bodyweightOnly,
                dumbbellsOnly,
                machinesAvailable: isFullGym || isHomeGym,
                cablesAvailable: isFullGym,
                barbellAvailable: isFullGym || isHomeGym,
                cardioMachinesAvailable: isFullGym || isHomeGym,
            },
            preferences: {
                splitPreference: autoSplitPreference.value,
                machineFocus: autoMachineFocus.value,
                machineFocusWeight: autoMachineFocus.value ? autoMachineFocusWeight.value : 0,
                freeWeightFocus: autoFreeWeightFocus.value,
                freeWeightFocusWeight: autoFreeWeightFocus.value ? autoFreeWeightFocusWeight.value : 0,
                jointFriendly: autoJointFriendly.value,
                jointFriendlyWeight: autoJointFriendly.value ? autoJointFriendlyWeight.value : 0,
                shortSessions: autoSessionDuration.value <= 35,
                noCardio: autoNoCardio.value,
                noHiit: autoNoHiiT.value,
                focusMuscleGroups: [...autoFocusMuscles.value],
                preferredExercises: autoPreferredExerciseRefs.value.map((entry) => entry.canonicalName),
                preferredExerciseRefs: [...autoPreferredExerciseRefs.value],
            },
            activeComplaints,
            exclusions: {
                exerciseNames: effectiveExcludedExerciseRefs.map((entry) => entry.canonicalName),
                exerciseRefs: effectiveExcludedExerciseRefs,
                muscleGroups: [...autoExcludedMuscles.value],
                exclusionTypes,
            },
        }
    }

    const mapGeneratedCategoryToType = (category: number): PlanExercise['type'] => {
        if (category === 3) return 'ausdauer'
        if (category === 2) return 'dehnung'
        if (category === 1) return 'calisthenics'
        return 'kraft'
    }

    const formatAutoDayLabel = (dayName: string, focus: string) => {
        const focusLabels: Record<string, string> = {
            full_body: 'Ganzkörper',
            upper: 'Oberkörper',
            lower: 'Unterkörper',
            push: 'Push',
            pull: 'Pull',
            legs: 'Beine',
        }

        return `${dayName} · ${focusLabels[focus] ?? focus}`
    }

    const mapGeneratedExercisesToPreview = (generatedExercises: Array<{
        exerciseName: string
        category: number
        sets?: number
        reps?: number
        restSeconds?: number
        durationMin?: number
        distanceKm?: number
        notes?: string
        complaintAdjustmentReason?: string
    }>): PlanExercise[] => generatedExercises.map((exercise) => ({
        exercise: exercise.exerciseName,
        sets: exercise.category === 3 ? (exercise.durationMin ?? 0) : (exercise.sets ?? 0),
        reps: exercise.category === 3 ? Math.round(exercise.distanceKm ?? 0) : (exercise.reps ?? 0),
        type: mapGeneratedCategoryToType(exercise.category),
        restSeconds: exercise.restSeconds,
        durationMin: exercise.durationMin ?? null,
        distanceKm: exercise.distanceKm ?? null,
        notes: exercise.notes,
        complaintAdjustmentReason: exercise.complaintAdjustmentReason,
    }))

    const isAutoExerciseReportOpen = (planIndex: number, exerciseIndex: number) =>
        autoExerciseReportState.value?.planIndex === planIndex && autoExerciseReportState.value?.exerciseIndex === exerciseIndex

    const reportedAutoExerciseName = computed(() => {
        const state = autoExerciseReportState.value
        if (!state) return ''
        return generatedAutoPlans.value[state.planIndex]?.exercises?.[state.exerciseIndex]?.exercise ?? ''
    })

    const closeAutoExerciseReport = () => {
        autoExerciseReportState.value = null
        autoExerciseReportReason.value = ''
    }

    const closeAutoPlanReportTutorial = () => {
        showAutoPlanReportTutorial.value = false
        if (autoPlanReportTutorialTimer) {
            clearTimeout(autoPlanReportTutorialTimer)
            autoPlanReportTutorialTimer = null
        }
        try {
            localStorage.setItem(AUTO_PLAN_REPORT_TUTORIAL_KEY, '1')
        } catch { }
    }

    const toggleAutoExerciseReport = (planIndex: number, exerciseIndex: number) => {
        closeAutoPlanReportTutorial()

        if (isAutoExerciseReportOpen(planIndex, exerciseIndex)) {
            closeAutoExerciseReport()
            return
        }

        autoExerciseReportState.value = { planIndex, exerciseIndex }
        autoExerciseReportReason.value = ''
    }

    const sameExerciseReference = (left: GeneratorExerciseReference, right: GeneratorExerciseReference) => (
        left.exerciseId && right.exerciseId
            ? left.exerciseId === right.exerciseId
            : normalizeExerciseText(left.canonicalName) === normalizeExerciseText(right.canonicalName)
    )

    const getAutoExerciseOverrideKey = (reference: GeneratorExerciseReference) => (
        reference.exerciseId || normalizeExerciseText(reference.canonicalName)
    )

    const getAutoExerciseReportReasonLabel = (reason: string) => (
        autoExerciseReportReasonOptions.find((entry) => entry.value === reason)?.label ?? reason
    )

    const upsertAutoExcludedExercise = (reference: GeneratorExerciseReference) => {
        const exists = autoExcludedExerciseRefs.value.some((entry) => sameExerciseReference(entry, reference))
        if (exists) return
        autoExcludedExerciseRefs.value = [...autoExcludedExerciseRefs.value, reference]
    }

    const upsertAutoReportedExerciseOverride = (reference: GeneratorExerciseReference, reason: string) => {
        const existingIndex = autoReportedExerciseOverrides.value.findIndex((entry) => sameExerciseReference(entry.reference, reference))
        if (existingIndex >= 0) {
            autoReportedExerciseOverrides.value = autoReportedExerciseOverrides.value.map((entry, index) => (
                index === existingIndex
                    ? { ...entry, reason, active: true }
                    : entry
            ))
            return
        }

        autoReportedExerciseOverrides.value = [
            ...autoReportedExerciseOverrides.value,
            { reference, reason, active: true },
        ]
    }

    const reactivateReportedAutoExercise = async (reference: GeneratorExerciseReference) => {
        const hasActiveEntry = autoReportedExerciseOverrides.value.some((entry) => entry.active && sameExerciseReference(entry.reference, reference))
        if (!hasActiveEntry) return

        autoReportedExerciseOverrides.value = autoReportedExerciseOverrides.value.map((entry) => (
            sameExerciseReference(entry.reference, reference)
                ? { ...entry, active: false }
                : entry
        ))

        for (let index = 0; index < generatedAutoPlans.value.length; index++) {
            await regenerateAutoPreviewPlan(index)
        }

        props.addToast('Gemeldete Übung wieder aktiviert', 'save')
    }

    const submitAutoExerciseReport = async () => {
        const state = autoExerciseReportState.value
        const plan = state ? generatedAutoPlans.value[state.planIndex] : null
        const exercise = state ? plan?.exercises?.[state.exerciseIndex] : null
        const selectedReason = typeof autoExerciseReportReason.value === 'string' ? autoExerciseReportReason.value : ''

        if (!plan || !exercise) return
        if (!selectedReason) {
            props.openValidationPopup(['Bitte wähle einen Grund für die Meldung aus.'])
            return
        }

        submittingExerciseReport.value = true

        try {
            const exerciseReference = resolveExerciseReference(exercise.exercise)
            if (selectedReason === 'wrong_exercise') {
                // Only replace the current suggestion; do not globally exclude it.
            } else if (selectedReason === 'exercise_missing' || selectedReason === 'gym_missing' || selectedReason === 'i_do_not_have') {
                upsertAutoReportedExerciseOverride(exerciseReference, selectedReason)
            } else {
                upsertAutoExcludedExercise(exerciseReference)
            }
            closeAutoExerciseReport()
            await regenerateAutoPreviewPlan(state!.planIndex)
            props.addToast('Übung gemeldet und ersetzt', 'save')
        } finally {
            submittingExerciseReport.value = false
        }
    }

    const regenerateAutoPreviewPlan = async (planIndex: number) => {
        const currentPlan = generatedAutoPlans.value[planIndex]
        if (!currentPlan) return

        regeneratingPlanIndex.value = planIndex

        try {
            await Promise.all([
                complaintsStore.load(),
                exerciseLibraryStore.load(),
            ])

            if (!exerciseLibraryStore.entries.length) {
                throw new Error('exercise-library-empty')
            }

            const regeneratedDay = regenerateAutoPlanDay(buildGeneratorInput(), {
                focus: currentPlan.focus,
                dayIndex: currentPlan.dayIndex,
                avoidExerciseNames: currentPlan.exercises.map((exercise) => exercise.exercise),
                existingDays: generatedAutoPlans.value
                    .filter((_, index) => index !== planIndex)
                    .map((plan) => ({
                        exercises: plan.exercises.map((exercise) => ({
                            exerciseName: exercise.exercise,
                            muscleGroup: '',
                        })),
                    })),
                variantSeed: Date.now(),
            })

            generatedAutoPlans.value = generatedAutoPlans.value.map((plan, index) => (
                index === planIndex
                    ? {
                        ...plan,
                        dayName: formatAutoDayLabel(regeneratedDay.dayName, regeneratedDay.focus),
                        focus: regeneratedDay.focus,
                        dayIndex: regeneratedDay.dayIndex,
                        exercises: mapGeneratedExercisesToPreview(regeneratedDay.exercises),
                    }
                    : plan
            ))

            selectedPlanExercises.value = generatedAutoPlans.value[0]?.exercises.map((exercise) => ({ ...exercise })) ?? []
            props.addToast('Auto-Plan neu generiert', 'save')
        } catch (error) {
            if (error instanceof Error && error.message === 'exercise-library-empty') {
                props.openValidationPopup(['Die Übungsbibliothek konnte nicht geladen werden. Auto-Plan wurde nicht neu erzeugt.'])
                return
            }
            props.openValidationPopup(['Auto-Plan konnte nicht neu generiert werden. Bitte Eingaben prüfen.'])
        } finally {
            regeneratingPlanIndex.value = null
        }
    }

    const generateAutoPlanIntoBuilder = async () => {
        try {
            const totalPreferenceWeight = getAutoPreferenceWeightTotal()
            if (totalPreferenceWeight > 100) {
                props.openValidationPopup([`Die Summe aus Maschinenfokus, Freihantelfokus und Gelenkschonend darf zusammen maximal 100% sein. Aktuell: ${totalPreferenceWeight}%.`])
                return
            }

            await Promise.all([
                complaintsStore.load(),
                exerciseLibraryStore.load(),
            ])

            if (!exerciseLibraryStore.entries.length) {
                throw new Error('exercise-library-empty')
            }

            const generated = generateAutoPlan(buildGeneratorInput())
            planName.value = generated.planName
            syncAutoPlanNames(generated.planName)
            generatedAutoPlans.value = generated.days.map((day, index) => ({
                name: autoPlanNames.value[index]?.trim() || buildAutoPlanName(generated.planName, index),
                dayName: formatAutoDayLabel(day.dayName, day.focus),
                focus: day.focus,
                dayIndex: day.dayIndex,
                exercises: mapGeneratedExercisesToPreview(day.exercises),
            }))

            selectedPlanExercises.value = generatedAutoPlans.value[0]?.exercises.map((exercise) => ({ ...exercise })) ?? []
            await nextTick()
            try {
                if (!localStorage.getItem(AUTO_PLAN_REPORT_TUTORIAL_KEY)) {
                    showAutoPlanReportTutorial.value = true
                    autoPlanReportTutorialTimer = setTimeout(() => {
                        closeAutoPlanReportTutorial()
                    }, 5000)
                }
            } catch {
                showAutoPlanReportTutorial.value = true
                autoPlanReportTutorialTimer = setTimeout(() => {
                    closeAutoPlanReportTutorial()
                }, 5000)
            }
            props.addToast('Auto-Plan erstellt', 'save')
        } catch (error) {
            if (error instanceof Error && error.message === 'exercise-library-empty') {
                props.openValidationPopup(['Die Übungsbibliothek konnte nicht geladen werden. Auto-Plan wurde nicht erzeugt.'])
                return
            }
            props.openValidationPopup(['Auto-Plan konnte nicht erstellt werden. Bitte Eingaben prüfen.'])
        }
    }

    // REPLACE in components/ui/training/TrainingPlanBuilder.vue (filteredExercises + helpers)

    // 1:1 wie Training.vue
    const muscleGroupAliases: Record<string, string[]> = {
        'brust': ['Brust'],
        'rücken': ['Rücken'], 'ruecken': ['Rücken'],
        'schulter': ['Schultern'], 'schultern': ['Schultern'],
        'arme': ['Arme'], 'arm': ['Arme'],
        'beine': ['Beine'], 'bein': ['Beine'], 'unterkörper': ['Beine', 'Bauch'], 'unterkoerper': ['Beine', 'Bauch'],
        'bauch': ['Bauch'], 'core': ['Bauch'],
        'oberkörper': ['Brust', 'Rücken', 'Schultern', 'Arme'], 'oberkoerper': ['Brust', 'Rücken', 'Schultern', 'Arme'],
        'po': ['Beine'], 'gesäß': ['Beine'], 'gluteus': ['Beine'],

        'push': ['Brust', 'Schultern', 'Arme'],
        'pull': ['Rücken', 'Arme'],
        'drücken': ['Brust', 'Schultern', 'Arme'],
        'ziehen': ['Rücken', 'Arme'],
        'push day': ['Brust', 'Schultern', 'Arme'],
        'pull day': ['Rücken', 'Arme'],
        'pushday': ['Brust', 'Schultern', 'Arme'],
        'pullday': ['Rücken', 'Arme'],

        'trizeps': ['Arme'],
        'bizeps': ['Arme'],
        'lat': ['Rücken'], 'lats': ['Rücken'], 'latissimus': ['Rücken'],

        'chest': ['Brust'],
        'back': ['Rücken'],
        'shoulder': ['Schultern'], 'shoulders': ['Schultern'],
        'arms': ['Arme'], 'biceps': ['Arme'], 'triceps': ['Arme'],
        'legs': ['Beine'], 'lower body': ['Beine', 'Bauch'],
        'abs': ['Bauch'], 'core ': ['Bauch'],
        'upper body': ['Brust', 'Rücken', 'Schultern', 'Arme'],
    }

    const calisthenicsByGroup: Record<string, string[]> = {
        'Brust': ['Liegestütze', 'Archer Push-up', 'Dips'],
        'Rücken': ['Klimmzüge', 'Australian Pull-up', 'Archer Pull-up'],
        'Schultern': ['Handstand Push-up', 'Archer Push-up'],
        'Arme': ['Dips', 'Klimmzüge', 'Archer Pull-up'],
        'Bauch': ['L-Sit', 'Dragon Flag', 'Hollow Hold', 'Toes to Bar'],
        'Beine': ['Pistol Squat'],
    }

    const stretchingByGroup: Record<string, string[]> = {
        'Brust': ['Brust-Dehnung'],
        'Rücken': ['Rücken-Dehnung'],
        'Schultern': ['Schulter-Dehnung', 'Trizeps-Dehnung'],
        'Arme': ['Trizeps-Dehnung'],
        'Bauch': [],
        'Beine': ['Hamstring-Dehnung', 'Waden-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung'],
    }

    const resolveGroups = (q: string): string[] => {
        const key = (q || '').trim().toLowerCase()
        return muscleGroupAliases[key] || []
    }
    const uniq = <T,>(arr: T[]) => Array.from(new Set(arr))

    const calisthenicsExercises = ref([
        'Klimmzüge', 'Liegestütze', 'Dips', 'Muscle-Up', 'Handstand Push-up',
        'L-Sit', 'Dragon Flag', 'Pistol Squat', 'Hollow Hold', 'Superman Hold',
        'Archer Pull-up', 'Archer Push-up', 'Australian Pull-up', 'Toes to Bar',
    ])

    const stretchingExercises = ref([
        'Brust-Dehnung', 'Hüftbeuger-Dehnung', 'Hamstring-Dehnung',
        'Waden-Dehnung', 'Schulter-Dehnung', 'Trizeps-Dehnung',
        'Rücken-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung',
    ])

    const predefinedExercises = ref([
        'Bankdrücken', 'Kniebeugen', 'Kreuzheben', 'Schulterdrücken', 'Liegestütze', 'Klimmzüge', 'Latzug', 'Rudern',
        'Bizepscurls', 'Trizepsdrücken', 'Beinpresse', 'Ausfallschritte', 'Butterfly', 'Seitheben', 'Wadenheben',
        'Bauchpresse', 'Rückenstrecker', 'Beinstrecker', 'Beinbeuger', 'Brustpresse', 'Dips'
    ])

    const muscleGroups = ref({
        'Brust': ['Bankdrücken', 'Liegestütze', 'Butterfly', 'Brustpresse'],
        'Rücken': ['Klimmzüge', 'Latzug', 'Rudern', 'Rückenstrecker'],
        'Beine': ['Kniebeugen', 'Kreuzheben', 'Beinpresse', 'Ausfallschritte', 'Wadenheben'],
        'Schultern': ['Schulterdrücken', 'Seitheben'],
        'Arme': ['Bizepscurls', 'Trizepsdrücken', 'Dips'],
        'Bauch': ['Bauchpresse'],
    })

    const filteredExercises = computed(() => {
        const filter = exerciseFilter.value.trim().toLowerCase()
        const groups = resolveGroups(filter)
        const isPush = ['push', 'drücken', 'push day', 'pushday'].includes(filter)
        const isPull = ['pull', 'ziehen', 'pull day', 'pullday'].includes(filter)

        // Ausdauer
        if (trainingType.value === 'ausdauer') {
            return uniq([
                ...libraryCardioExercises.value,
                ...cardioTypes.value,
            ])
        }

        // Calisthenics
        if (trainingType.value === 'calisthenics') {
            const baseExercises = uniq([
                ...libraryBodyweightStrengthExercises.value,
                ...calisthenicsExercises.value,
            ])
            const baseExerciseSet = new Set(baseExercises.map((x) => x.toLowerCase()))
            const nameMatches = baseExercises.filter(x => x.toLowerCase().includes(filter))
            const groupMatches = groups.length
                ? groups.flatMap(g => [
                    ...(calisthenicsByGroup[g] || []),
                    ...((libraryExercisesByMuscle.value[g] || []).filter((name) => baseExerciseSet.has(name.toLowerCase()))),
                ])
                : []

            const custom = customExercisesState.value
                .filter(ex =>
                    ex.type === 'calisthenics' && (
                        ex.name.toLowerCase().includes(filter) ||
                        ex.muscle.toLowerCase().includes(filter) ||
                        (groups.length && groups.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                    )
                )
                .map(ex => ex.name)

            let list = uniq([...nameMatches, ...groupMatches, ...custom])

            if (isPush) {
                const allow = new Set(['Liegestütze', 'Archer Push-up', 'Dips', 'Handstand Push-up'])
                list = list.filter(x => allow.has(x))
            } else if (isPull) {
                const allow = new Set(['Klimmzüge', 'Australian Pull-up', 'Archer Pull-up'])
                list = list.filter(x => allow.has(x))
            }

            return list
        }

        // Dehnung
        if (trainingType.value === 'dehnung') {
            const isPushPull = ['push', 'pull', 'drücken', 'ziehen', 'push day', 'pushday', 'pull day', 'pullday'].includes(filter)
            const groups2 = isPushPull ? [] : resolveGroups(filter)

            const baseExercises = uniq([
                ...libraryMobilityExercises.value,
                ...stretchingExercises.value,
            ])
            const baseExerciseSet = new Set(baseExercises.map((x) => x.toLowerCase()))
            const nameMatches = baseExercises.filter(x => !filter || x.toLowerCase().includes(filter))
            const groupMatches = groups2.length
                ? groups2.flatMap(g => [
                    ...(stretchingByGroup[g] || []),
                    ...((libraryExercisesByMuscle.value[g] || []).filter((name) => baseExerciseSet.has(name.toLowerCase()))),
                ])
                : []

            const custom = customExercisesState.value
                .filter(ex =>
                    ex.type === 'dehnung' && (
                        ex.name.toLowerCase().includes(filter) ||
                        ex.muscle.toLowerCase().includes(filter) ||
                        (groups2.length && groups2.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                    )
                )
                .map(ex => ex.name)

            return Array.from(new Set([...nameMatches, ...groupMatches, ...custom]))
        }

        // Kraft (default)
        const caliSet = new Set(calisthenicsExercises.value.map(x => x.toLowerCase()))

        const fromGroups = groups.length
            ? groups.flatMap(g => [
                ...((muscleGroups.value as unknown as Record<string, string[]>)[g] || []),
                ...(libraryExercisesByMuscle.value[g] || []),
            ])
            : []

        const byName = uniq([
            ...libraryStrengthExercises.value,
            ...predefinedExercises.value,
        ]).filter(ex => ex.toLowerCase().includes(filter))

        let grouped = uniq([...fromGroups, ...byName]).filter(ex => !caliSet.has(ex.toLowerCase()))

        const custom = customExercisesState.value
            .filter(ex =>
                ex.type === 'kraft' && (
                    ex.name.toLowerCase().includes(filter) ||
                    ex.muscle.toLowerCase().includes(filter) ||
                    (groups.length && groups.some(g => ex.muscle.toLowerCase() === g.toLowerCase()))
                )
            )
            .map(ex => ex.name)

        let result = uniq([...grouped, ...custom])

        if (isPush) {
            const allow = new Set(['Bankdrücken', 'Schulterdrücken', 'Liegestütze', 'Butterfly', 'Brustpresse', 'Dips', 'Seitheben', 'Trizepsdrücken'])
            result = result.filter(x => allow.has(x))
        } else if (isPull) {
            const allow = new Set(['Klimmzüge', 'Latzug', 'Rudern', 'Bizepscurls', 'Rückenstrecker'])
            result = result.filter(x => allow.has(x))
        }

        return result
    })


    // ===== Safe v-models (1:1) =====
    const newExerciseSafe = computed({
        get: () => newExercise.value,
        set: (val) => { if (!val) return; newExercise.value = val },
    })

    const cardioExerciseSafe = computed({
        get: () => cardioExercise.value,
        set: (val) => { if (!val) return; cardioExercise.value = val },
    })

    const trainingTypeSafe = computed({
        get: () => trainingType.value,
        set: (val) => { if (!val) return; trainingType.value = val },
    })

    const selectedGoalSafe = computed({
        get: () => selectedGoal.value,
        set: (val) => { if (!val) return; selectedGoal.value = val },
    })

    const toggleExtras = () => {
        showExtras.value = !showExtras.value
    }

    // ADD in components/ui/training/TrainingPlanBuilder.vue (helpers wie Training.vue)
    const normalizeTypeInput = (raw: unknown): ExerciseType | null => {
        const t = String(raw ?? '').trim().toLowerCase()
        const map: Record<string, ExerciseType> = {
            kraft: 'kraft', strength: 'kraft',
            calisthenics: 'calisthenics', cali: 'calisthenics', bodyweight: 'calisthenics', bw: 'calisthenics',
            dehnung: 'dehnung', stretch: 'dehnung', stretching: 'dehnung',
            ausdauer: 'ausdauer', cardio: 'ausdauer', endurance: 'ausdauer',
        }
        return (map[t] ?? (['kraft', 'calisthenics', 'dehnung', 'ausdauer'].includes(t) ? (t as ExerciseType) : null))
    }

    const validateCustomExercise = (
        name: string,
        muscle: string,
        typeRaw: string | ExerciseType,
        editIndex: number | null = null
    ): { name: string; muscle: string; type: CustomExerciseType } | string => {
        const trimmedName = (name ?? '').trim()
        const trimmedMuscle = (muscle ?? '').trim()

        if (!trimmedName) return 'Übungsname ist erforderlich'
        if (!trimmedMuscle) return 'Muskelgruppe ist erforderlich'
        if (trimmedName.length > 50) return 'Übungsname darf maximal 50 Zeichen lang sein'
        if (trimmedMuscle.length > 50) return 'Muskelgruppe darf maximal 50 Zeichen lang sein'

        const normalized = normalizeTypeInput(typeRaw)
        if (!normalized) return 'Ungültiger Typ. Erlaubt sind: kraft, calisthenics, dehnung'
        if (normalized === 'ausdauer') return '"Ausdauer" ist für benutzerdefinierte Übungen nicht erlaubt'

        const type = normalized as CustomExerciseType

        const exists = customExercisesState.value.some((ex, i) =>
            i !== editIndex &&
            ex.type === type &&
            ex.name.trim().toLowerCase() === trimmedName.toLowerCase()
        )
        if (exists) return 'Übungsname existiert in diesem Typ bereits'

        return { name: trimmedName, muscle: trimmedMuscle, type }
    }

    const collectValidationErrors = () => {
        const errors: string[] = []

        if (trainingType.value === 'ausdauer') {
            if (!cardioExercise.value) errors.push('Cardio-Art wählen')
            const dErr = validateDurationMin(newDuration.value); if (dErr) errors.push(dErr)
            const kErr = validateDistanceKm(newDistance.value); if (kErr) errors.push(kErr)
            return errors
        }

        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value
        if (!exerciseToAdd) errors.push('Übung auswählen oder benutzerdefinierte Übung eingeben')
        else if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === exerciseToAdd.toLowerCase())) {
            errors.push('Übung bereits im Plan vorhanden')
        }

        const setsError = validateSets(newSets.value); if (setsError) errors.push(setsError)
        const repsError = validateReps(newReps.value); if (repsError) errors.push(repsError)

        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || ''
            const validated = validateCustomExercise(customPlanExercise.value, muscleGroup, trainingType.value)
            if (typeof validated === 'string') errors.push(validated)
        }

        return errors
    }


    // ===== DTO flatten / mapping (aus deinem Code) =====
    const toPlanExercise = (ex: any): PlanExercise => ({
        exercise: ex.name,
        sets: ex.sets ?? 0,
        reps: ex.reps ?? 0,
        type: (ex.category === 3 ? "ausdauer" : ex.category === 2 ? "dehnung" : ex.category === 1 ? "calisthenics" : "kraft"),
    })

    const flattenDto = (p: TrainingPlanDto): ViewPlan => {
        const flat: PlanExercise[] = []
        for (const d of (p.days ?? [])) {
            for (const ex of (d.exercises ?? [])) flat.push(toPlanExercise(ex))
        }
        return { id: p.id, name: p.name, isFavorite: !!p.isFavorite, exercises: flat, exerciseCount: flat.length }
    }

    const mapTypeToCategory = (t?: PlanExercise["type"]) => {
        if (t === "calisthenics") return 1
        if (t === "dehnung") return 2
        if (t === "ausdauer") return 3
        return 0
    }

    const PLAN_CODE_LEN = 12
    const CODE_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"   // wie Backend
    const CODE_LOWER = "abcdefghijkmnpqrstuvwxyz"
    const CODE_DIGIT = "23456789"

    // Backend erlaubt NUR diese Specials:
    const CODE_SPECIAL = "&-_,#."
    const CODE_ALNUM = CODE_UPPER + CODE_LOWER + CODE_DIGIT

    const securePick = (charset: string) => {
        const a = new Uint32Array(1)
        crypto.getRandomValues(a)
        return charset[a[0] % charset.length]
    }

    const shuffle = (arr: string[]) => {
        // Fisher–Yates mit crypto
        for (let i = arr.length - 1; i > 0; i--) {
            const a = new Uint32Array(1)
            crypto.getRandomValues(a)
            const j = a[0] % (i + 1)
                ;[arr[i], arr[j]] = [arr[j], arr[i]]
        }
        return arr
    }

    const generatePlanCode = (len = PLAN_CODE_LEN) => {
        if (len !== 12) throw new Error("Plan-Code Länge muss 12 sein")

        // garantiert: mind. 1 upper, 1 lower, 1 digit, GENAU 1 special
        const chars: string[] = [
            securePick(CODE_UPPER),
            securePick(CODE_LOWER),
            securePick(CODE_DIGIT),
            securePick(CODE_SPECIAL),
        ]

        // Rest nur alnum (damit max. 1 Special drin ist)
        while (chars.length < len) chars.push(securePick(CODE_ALNUM))

        return shuffle(chars).join("")
    }

    const mapPlanExercisesToPayload = (exercises: PlanExercise[]) =>
        exercises.map((ex, i) => ({
            name: ex.exercise,
            category: mapTypeToCategory(ex.type),
            sortOrder: i,
            sets: ex.type === "ausdauer" ? null : ex.sets,
            reps: ex.type === "ausdauer" ? null : ex.reps,
            restSeconds: ex.restSeconds ?? null,
            durationMin: ex.type === "ausdauer" ? (ex.durationMin ?? ex.sets ?? null) : (ex.durationMin ?? null),
            distanceKm: ex.type === "ausdauer" ? (ex.distanceKm ?? (ex.reps ? ex.reps : null)) : (ex.distanceKm ?? null),
            notes: ex.notes || ex.complaintAdjustmentReason || null,
        }))

    const getGeneratedPlansToPersist = () =>
        generatedAutoPlans.value.filter((plan) => Array.isArray(plan.exercises) && plan.exercises.length > 0)

    const toUpsertPayload = (
        name: string = validatePlanName(planName.value) as string,
        exercises: PlanExercise[] = selectedPlanExercises.value,
        dayName = "Tag 1"
    ): TrainingPlanUpsert => ({
        name,
        isFavorite: false,
        days: [{
            name: dayName,
            sortOrder: 0,
            exercises: mapPlanExercisesToPayload(exercises),
        }],
    })

    function resetBuilder() {
        planName.value = ""
        newExercise.value = ""
        customPlanExercise.value = ""

        newReps.value = null
        newSets.value = null
        newDuration.value = null
        newDistance.value = null

        selectedGoal.value = ""
        selectedPlanExercises.value = []
        generatedAutoPlans.value = []
        editingPlanId.value = null
        cardioExercise.value = ''
        autoPlanNames.value = []
        autoMachineFocusWeight.value = 50
        autoFreeWeightFocusWeight.value = 50
        autoJointFriendlyWeight.value = 50
        autoPreferredExerciseRefs.value = []
        autoExcludedExerciseRefs.value = []
        autoReportedExerciseOverrides.value = []
        showAutoReportedExercises.value = false
        autoExcludedMuscles.value = []
        autoFocusMuscles.value = []
        autoExcludedMuscleDraft.value = ''
        autoFocusMuscleDraft.value = ''
    }

    function queuePreviewBuilderStep(delay: number, task: () => void) {
        previewBuilderTimers.push(window.setTimeout(task, delay))
    }

    function clearPreviewBuilderTimers() {
        previewBuilderTimers.forEach(id => window.clearTimeout(id))
        previewBuilderTimers.length = 0
    }

    function movePreviewTouch(selector: string, xFactor = 0.5, yFactor = 0.5) {
        const target = document.querySelector<HTMLElement>(selector)
        if (!target) return

        const rect = target.getBoundingClientRect()
        previewTouch.value = {
            visible: true,
            x: rect.left + rect.width * xFactor,
            y: rect.top + rect.height * yFactor,
        }
    }

    function typePreviewValue(
        setter: (next: string) => void,
        value: string,
        startDelay: number,
        cadence = 90
    ) {
        value.split('').forEach((_, index) => {
            queuePreviewBuilderStep(startDelay + index * cadence, () => {
                setter(value.slice(0, index + 1))
            })
        })
    }

    function clickPreviewSelector(selector: string) {
        const target = document.querySelector<HTMLElement>(selector)
        target?.click()
    }

    function scrollPreviewToElement(selector: string, delay: number, offset = 18) {
        queuePreviewBuilderStep(delay, () => {
            const target = document.querySelector<HTMLElement>(selector)
            if (!target) return
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            const top = target.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })
        })
    }

    function notifyPreviewBuilderCompleted() {
        if (!isPhonePreviewBuilderDemo.value || typeof window === 'undefined') return
        window.parent?.postMessage?.(
            {
                type: 'landing-phone-demo-complete',
                demo: 'builder',
                run: Number(route.query?.run ?? 0),
            },
            window.location.origin
        )
    }

    function completePreviewBuilderDemo() {
        const submitButton = document.querySelector<HTMLElement>('.plan-submit-btn')
        const builder = builderSection.value

        submitButton?.classList.add('preview-builder-submit-pulse')
        submitButton?.classList.add('preview-builder-submit-success')
        builder?.classList.add('preview-builder-created')

        window.setTimeout(() => {
            submitButton?.classList.remove('preview-builder-submit-pulse')
            submitButton?.classList.remove('preview-builder-submit-success')
            builder?.classList.remove('preview-builder-created')
        }, 1500)
    }

    function startPreviewBuilderDemo() {
        if (!isPhonePreviewBuilderDemo.value) return

        clearPreviewBuilderTimers()
        resetBuilder()
        builderMode.value = 'manual'
        trainingType.value = 'kraft'

        queuePreviewBuilderStep(700, () => {
            movePreviewTouch('#plan-name', 0.45, 0.5)
        })

        typePreviewValue((next) => { planName.value = next }, 'Push Day Fokus', 980, 145)

        queuePreviewBuilderStep(3400, () => {
            scrollPreviewToElement('.field-row-stack', 0, 56)
            movePreviewTouch('.field-row-stack .ui-select-trigger', 0.5, 0.5)
        })

        queuePreviewBuilderStep(3920, () => {
            clickPreviewSelector('.field-row-stack .ui-select-trigger')
        })

        queuePreviewBuilderStep(4560, () => {
            movePreviewTouch('.field-row-stack .ui-select-menu .ui-select-option:not(.is-custom)', 0.5, 0.5)
        })

        queuePreviewBuilderStep(5120, () => {
            const firstStrengthExercise =
                filteredExercises.value
                    .map(option => typeof option === 'string' ? option : String((option as any)?.value ?? ''))
                    .find(option => option.trim() && option !== 'custom')

            if (firstStrengthExercise) {
                newExercise.value = String(firstStrengthExercise)
            }
            clickPreviewSelector('.field-row-stack .ui-select-option:not(.is-custom)')
        })

        queuePreviewBuilderStep(6100, () => {
            movePreviewTouch('#strength-sets', 0.5, 0.5)
        })

        typePreviewValue((next) => { newSets.value = next ? Number(next) : null }, '4', 6400, 220)

        queuePreviewBuilderStep(7180, () => {
            movePreviewTouch('#strength-reps', 0.5, 0.5)
        })

        typePreviewValue((next) => { newReps.value = next ? Number(next) : null }, '10', 7480, 220)

        scrollPreviewToElement('.add-exercise-btn', 8480, 94)

        queuePreviewBuilderStep(9040, () => {
            movePreviewTouch('.add-exercise-btn', 0.5, 0.5)
        })

        queuePreviewBuilderStep(9460, () => {
            addExerciseToPlan()
        })

        scrollPreviewToElement('.plan-submit-btn', 10450, 96)

        queuePreviewBuilderStep(11050, () => {
            movePreviewTouch('.plan-submit-btn', 0.5, 0.5)
        })

        queuePreviewBuilderStep(11520, () => {
            completePreviewBuilderDemo()
        })

        queuePreviewBuilderStep(13200, () => {
            notifyPreviewBuilderCompleted()
        })
    }

    // ===== Actions (1:1) =====
    // REPLACE in components/ui/training/TrainingPlanBuilder.vue (addExerciseToPlan)
    const addExerciseToPlan = () => {
        generatedAutoPlans.value = []
        if (isPhonePreviewBuilderDemo.value) {
            const previewExercise =
                String(newExercise.value || filteredExercises.value[0] || '').trim()

            if (!previewExercise) return

            selectedPlanExercises.value.push({
                exercise: previewExercise,
                sets: Number(newSets.value ?? 4),
                reps: Number(newReps.value ?? 10),
                goal: selectedGoal.value || undefined,
                type: trainingType.value,
            })
            return
        }

        const errors = collectValidationErrors()
        if (errors.length > 0) { props.openValidationPopup(errors); return }

        if (trainingType.value === 'ausdauer') {
            selectedPlanExercises.value.push({
                exercise: cardioExercise.value,
                sets: newDuration.value!,
                reps: newDistance.value ? Number(newDistance.value) : 0,
                goal: selectedGoal.value || undefined,
                type: 'ausdauer'
            })
            props.addToast('Cardio hinzugefügt', 'add')
            cardioExercise.value = ''
            selectedGoal.value = ''
            return
        }

        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value

        // 1:1: Custom-Übung beim Hinzufügen speichern
        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || ''
            const validated = validateCustomExercise(customPlanExercise.value, muscleGroup, trainingType.value)
            if (typeof validated !== 'string') {
                customExercisesState.value.push({ name: validated.name, muscle: validated.muscle, type: validated.type })
                props.saveToStorage?.()
                props.addToast('Benutzerdefinierte Übung gespeichert', 'add')
            } else {
                props.openValidationPopup([validated])
                return
            }
        }

        selectedPlanExercises.value.push({
            exercise: exerciseToAdd,
            sets: newSets.value!,
            reps: newReps.value!,
            goal: selectedGoal.value || undefined,
            type: trainingType.value
        })

        props.addToast('Übung hinzugefügt', 'add')

        newExercise.value = ''
        customPlanExercise.value = ''
        selectedGoal.value = ''
    }

    const removeExerciseFromPlan = (index: number) => {
        generatedAutoPlans.value = []
        if (index < 0 || index >= selectedPlanExercises.value.length) {
            props.addToast('Ungültiger Übungsindex', 'delete')
            return
        }

        const doDelete = () => {
            selectedPlanExercises.value.splice(index, 1)
            props.addToast('Übung gelöscht', 'delete')
        }

        // ? wenn Parent Confirm anbietet ? nutzen
        if (props.openDeletePopup) {
            props.openDeletePopup(doDelete)
            return
        }

        // fallback: direkt löschen
        doDelete()
    }

    const createOrUpdatePlanLegacy = async () => {
        const validatedPlanName = validatePlanName(planName.value)

        if (!auth.user) {
            if (validatedPlanName === false || !selectedPlanExercises.value.length) {
                const errors: string[] = []
                if (validatedPlanName === false) {
                    errors.push(
                        planName.value.trim().length < 3
                            ? "Planname muss mindestens 3 Zeichen lang sein"
                            : "Planname darf maximal 20 Zeichen lang sein"
                    )
                }
                if (!selectedPlanExercises.value.length) errors.push("Mindestens eine Übung ist erforderlich")
                props.openValidationPopup(errors)
                return
            }

            // ? Gast-Plan in der UI-Liste anzeigen (Session-only)
            const id =
                (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                    ? crypto.randomUUID()
                    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

            props.onGuestPlanCreated?.({
                id,
                name: validatedPlanName as string,
                isFavorite: false,
                exercises: [...selectedPlanExercises.value],
                exerciseCount: selectedPlanExercises.value.length,
            })

            emit('plan-created', { id, name: validatedPlanName as string })
            await auth.setHasCreatedTrainingPlan?.()

            resetBuilder()
            return
        }

        if (validatedPlanName === false || (!editingPlanId.value && !selectedPlanExercises.value.length)) {
            const errors: string[] = []
            if (validatedPlanName === false) {
                errors.push(
                    planName.value.trim().length < 3
                        ? "Planname muss mindestens 3 Zeichen lang sein"
                        : "Planname darf maximal 20 Zeichen lang sein"
                )
            }
            if (!selectedPlanExercises.value.length) errors.push("Mindestens eine Übung ist erforderlich")
            props.openValidationPopup(errors)
            return
        }

        // ? Duplicate-Name Check (vor dem Request), case-insensitive
        const getPlans = (): any[] => {
            // versuch mehrere gängige Store-Keys, ohne dass TS meckert
            const anyStore = trainingPlansStore as any
            return (anyStore.items ?? anyStore.plans ?? anyStore.trainingPlans ?? []) as any[]
        }

        const isNameTaken = (name: string, ignoreId: string | null) => {
            const needle = name.trim().toLowerCase()
            return getPlans().some((p: any) =>
                String(p?.id ?? "").toLowerCase() !== String(ignoreId ?? "").toLowerCase() &&
                String(p?.name ?? "").trim().toLowerCase() === needle
            )
        }

        if (isNameTaken(validatedPlanName, editingPlanId.value)) {
            props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
            return
        }

        try {
            const payload = toUpsertPayload()

            if (editingPlanId.value) {
                const updated = await trainingPlansStore.update(editingPlanId.value, payload)
                void updated
                props.addToast("Plan gespeichert", "save")
            } else {
                const created = await trainingPlansStore.create(payload)

                console.log("[TrainingPlan] created:", created)
                console.log("[TrainingPlan] code:", (created as any)?.code ?? (created as any)?.data?.code)

                props.addToast("Plan erstellt", "add")
                // INSERT in components/ui/training/TrainingPlanBuilder.vue AFTER props.addToast("Plan erstellt", "add")
                const createdId = String((created as any)?.id ?? (created as any)?.data?.id ?? '')
                if (createdId) emit('plan-created', { id: createdId, name: validatedPlanName as string })
                await auth.setHasCreatedTrainingPlan?.()

            }

            resetBuilder()
        } catch (e: any) {
            const status = e?.response?.status

            // ? Falls Backend weiter 500 wirft (23505), geben wir trotzdem die richtige Message
            if (status === 500 && isNameTaken(validatedPlanName, editingPlanId.value)) {
                props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
                return
            }

            // (optional) wenn Backend mal 409 liefert
            if (status === 409) {
                props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
                return
            }

            props.openValidationPopup(["Speichern fehlgeschlagen. Bitte versuch’s nochmal."])
        }
    }


    // ===== Preview-Resize (dein initPreviewResizeTable minimal übernommen) =====
    const createOrUpdatePlan = async () => {
        const validatedPlanName = validatePlanName(planName.value)
        const generatedPlansToPersist = getGeneratedPlansToPersist()
        const autoSinglePlan = !editingPlanId.value && builderMode.value === 'auto' && generatedPlansToPersist.length === 1
            ? generatedPlansToPersist[0]
            : null
        const isAutoMultiCreate = !editingPlanId.value && builderMode.value === 'auto' && generatedPlansToPersist.length > 1
        const autoGeneratedPlanNames = builderMode.value === 'auto' && !editingPlanId.value
            ? makeUniquePlanNames(
                generatedPlansToPersist.map((plan) => plan.name),
                { ignoreId: editingPlanId.value }
            )
            : []
        const autoSingleResolvedName = autoSinglePlan
            ? autoGeneratedPlanNames[0] ?? validatePlanName(autoSinglePlan.name)
            : null
        const effectiveValidatedPlanName = autoSinglePlan
            ? autoSingleResolvedName
            : validatedPlanName

        const getPlans = (): any[] => {
            const anyStore = trainingPlansStore as any
            return (anyStore.items ?? anyStore.plans ?? anyStore.trainingPlans ?? []) as any[]
        }

        const isNameTaken = (name: string, ignoreId: string | null) => {
            const needle = name.trim().toLowerCase()
            return getPlans().some((p: any) =>
                String(p?.id ?? "").toLowerCase() !== String(ignoreId ?? "").toLowerCase() &&
                String(p?.name ?? "").trim().toLowerCase() === needle
            )
        }

        if (!auth.user) {
            if ((!isAutoMultiCreate && effectiveValidatedPlanName === false) || !hasExercisesToSave.value) {
                const errors: string[] = []
                if (!isAutoMultiCreate && effectiveValidatedPlanName === false) {
                    const invalidPlanName = autoSinglePlan?.name ?? planName.value
                    errors.push(
                        invalidPlanName.trim().length < 3
                            ? "Planname muss mindestens 3 Zeichen lang sein"
                            : "Planname darf maximal 20 Zeichen lang sein"
                    )
                }
                if (!hasExercisesToSave.value) errors.push("Mindestens eine Übung ist erforderlich")
                props.openValidationPopup(errors)
                return
            }

            const createGuestId = () =>
                (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                    ? crypto.randomUUID()
                    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

            if (isAutoMultiCreate) {
                let firstCreatedId = ''
                let firstCreatedName = autoGeneratedPlanNames[0] ?? ''

                for (const [index, plan] of generatedPlansToPersist.entries()) {
                    const id = createGuestId()
                    const resolvedName = autoGeneratedPlanNames[index] ?? plan.name
                    props.onGuestPlanCreated?.({
                        id,
                        name: resolvedName,
                        isFavorite: false,
                        exercises: [...plan.exercises],
                        exerciseCount: plan.exercises.length,
                    })

                    if (!firstCreatedId) {
                        firstCreatedId = id
                        firstCreatedName = resolvedName
                    }
                }

                if (firstCreatedId) emit('plan-created', { id: firstCreatedId, name: firstCreatedName })
                props.addToast(`${generatedPlansToPersist.length} Pläne erstellt`, 'add')
            } else {
                const id = createGuestId()
                props.onGuestPlanCreated?.({
                    id,
                    name: effectiveValidatedPlanName as string,
                    isFavorite: false,
                    exercises: [...(autoSinglePlan?.exercises ?? selectedPlanExercises.value)],
                    exerciseCount: (autoSinglePlan?.exercises ?? selectedPlanExercises.value).length,
                })

                emit('plan-created', { id, name: effectiveValidatedPlanName as string })
            }

            await auth.setHasCreatedTrainingPlan?.()
            resetBuilder()
            return
        }

        if (editingPlanId.value && builderMode.value === 'auto' && generatedPlansToPersist.length > 1) {
            props.openValidationPopup(["Mehrere Auto-Pläne können nicht in einen bestehenden Einzelplan gespeichert werden. Bitte erstelle sie als neue Pläne."])
            return
        }

        if ((!isAutoMultiCreate && effectiveValidatedPlanName === false) || (!editingPlanId.value && !hasExercisesToSave.value)) {
            const errors: string[] = []
            if (!isAutoMultiCreate && effectiveValidatedPlanName === false) {
                const invalidPlanName = autoSinglePlan?.name ?? planName.value
                errors.push(
                    invalidPlanName.trim().length < 3
                        ? "Planname muss mindestens 3 Zeichen lang sein"
                        : "Planname darf maximal 20 Zeichen lang sein"
                )
            }
            if (!hasExercisesToSave.value) errors.push("Mindestens eine Übung ist erforderlich")
            props.openValidationPopup(errors)
            return
        }

        if (!autoSinglePlan && !isAutoMultiCreate && isNameTaken(effectiveValidatedPlanName as string, editingPlanId.value)) {
            props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
            return
        }

        try {
            if (editingPlanId.value) {
                const updated = await trainingPlansStore.update(
                    editingPlanId.value,
                    toUpsertPayload(validatedPlanName as string, selectedPlanExercises.value)
                )
                void updated
                props.addToast("Plan gespeichert", "save")
            } else if (isAutoMultiCreate) {
                let firstCreatedId = ''
                let firstCreatedName = autoGeneratedPlanNames[0] ?? ''

                for (const [index, plan] of generatedPlansToPersist.entries()) {
                    const resolvedName = autoGeneratedPlanNames[index] ?? plan.name
                    const created = await trainingPlansStore.create(
                        toUpsertPayload(resolvedName, plan.exercises, plan.dayName)
                    )

                    const createdId = String((created as any)?.id ?? (created as any)?.data?.id ?? '')
                    if (!firstCreatedId && createdId) {
                        firstCreatedId = createdId
                        firstCreatedName = resolvedName
                    }
                }

                props.addToast(`${generatedPlansToPersist.length} Pläne erstellt`, "add")
                if (firstCreatedId) emit('plan-created', { id: firstCreatedId, name: firstCreatedName })
                await auth.setHasCreatedTrainingPlan?.()
            } else {
                const created = await trainingPlansStore.create(
                    toUpsertPayload(
                        effectiveValidatedPlanName as string,
                        autoSinglePlan?.exercises ?? selectedPlanExercises.value,
                        autoSinglePlan?.dayName ?? "Tag 1"
                    )
                )

                console.log("[TrainingPlan] created:", created)
                console.log("[TrainingPlan] code:", (created as any)?.code ?? (created as any)?.data?.code)

                props.addToast("Plan erstellt", "add")
                const createdId = String((created as any)?.id ?? (created as any)?.data?.id ?? '')
                if (createdId) emit('plan-created', { id: createdId, name: effectiveValidatedPlanName as string })
                await auth.setHasCreatedTrainingPlan?.()
            }

            resetBuilder()
        } catch (e: any) {
            const status = e?.response?.status

            if (!isAutoMultiCreate && status === 500 && isNameTaken(effectiveValidatedPlanName as string, editingPlanId.value)) {
                props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
                return
            }

            if (status === 409) {
                props.openValidationPopup(["Planname bereits vergeben. Bitte wähle einen anderen Namen."])
                return
            }

            props.openValidationPopup(["Speichern fehlgeschlagen. Bitte versuch’s nochmal."])
        }
    }

    function normalizeStrictTo100(
        widthsPct: number[],
        tableEl: HTMLTableElement,
        minPxByCol: number[],
        preferGiveBackIndex: number
    ) {
        const tw = tableEl.getBoundingClientRect().width || 1
        const minPct = minPxByCol.map(px => +(px / tw * 100).toFixed(4))

        const clamped = widthsPct.map((v, i) => Math.max(minPct[i] ?? 0, +v))

        let sum = +clamped.reduce((a, b) => a + b, 0).toFixed(4)
        let diff = +(100 - sum).toFixed(4)
        if (Math.abs(diff) > 0.0001) {
            const idx = Math.min(Math.max(preferGiveBackIndex, 0), clamped.length - 1)
            clamped[idx] = Math.max(minPct[idx] ?? 0, +(clamped[idx] + diff).toFixed(4))
        }
        return clamped
    }
    let activeDragCleanup: null | (() => void) = null

    const initPreviewResizeTable = () => {
        const table = previewTable.value
        if (!table) return

        table.querySelectorAll('.resizer').forEach(el => el.remove())

        const MIN_PX_BY_COL = [16, 16, 16, 44]
        const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[]
        const lastIdx = ths.length - 1

        ths.forEach((th, colIndex) => {
            th.style.position = 'relative'
            const isLast = colIndex === lastIdx

            const makeResizer = (side: 'right' | 'left') => {
                const resizer = document.createElement('div')
                resizer.className = `resizer resizer-${side}`;
                (th.querySelector('.th-text') ?? th).appendChild(resizer)

                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto' }
                else { resizer.style.left = '0'; resizer.style.right = 'auto' }

                let startX = 0
                let start = [...previewColWidths.value]

                const onMove = (e: PointerEvent) => {
                    requestAnimationFrame(() => {
                        const tw = table.getBoundingClientRect().width || 1
                        const raw = e.clientX - startX
                        const dir = (isLast && side === 'left') ? -1 : 1
                        const dxRaw = dir * raw

                        const partnerIndex = isLast ? colIndex - 1 : colIndex + 1
                        if (partnerIndex < 0 || partnerIndex >= start.length) return

                        const currPx = (start[colIndex] / 100) * tw
                        const partnerPx = (start[partnerIndex] / 100) * tw

                        const minCurr = MIN_PX_BY_COL[colIndex] ?? 16
                        const minPartner = MIN_PX_BY_COL[partnerIndex] ?? 16

                        const maxDxRight = partnerPx - minPartner
                        const maxDxLeft = -(currPx - minCurr)
                        const dx = Math.max(maxDxLeft, Math.min(dxRaw, maxDxRight))

                        const newCurrPx = currPx + dx
                        const newPartnerPx = partnerPx - dx

                        const next = [...start]
                        next[colIndex] = +(newCurrPx / tw * 100).toFixed(4)
                        next[partnerIndex] = +(newPartnerPx / tw * 100).toFixed(4)

                        previewColWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex)
                    })
                }

                const cleanupDrag = (e?: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                    resizer.classList.remove('is-active')
                    builderSection.value?.classList.remove('is-resizing-col')
                    if (e) {
                        try { (resizer as any).releasePointerCapture?.(e.pointerId) } catch { }
                    }
                    if (activeDragCleanup === cleanupDrag) activeDragCleanup = null
                }

                const onUp = (e: PointerEvent) => {
                    cleanupDrag(e)
                }

                const onDown = (e: PointerEvent) => {
                    e.preventDefault()
                    e.stopPropagation()

                    startX = e.clientX
                    start = [...previewColWidths.value]

                    try { (resizer as any).setPointerCapture?.(e.pointerId) } catch { }

                    resizer.classList.add('is-active')
                    builderSection.value?.classList.add('is-resizing-col')

                    // falls noch irgendwas h�ngt, erst clean
                    activeDragCleanup?.()
                    activeDragCleanup = cleanupDrag

                    window.addEventListener('pointermove', onMove)
                    window.addEventListener('pointerup', onUp)
                }

                resizer.addEventListener('pointerdown', onDown)

            }

            if (isLast) { makeResizer('left'); makeResizer('right') }
            else { makeResizer('right') }
        })
    }

    let headerRO: ResizeObserver | null = null

    function applyHeaderState(th: HTMLElement) {
        const label = th.querySelector('.th-label') as HTMLElement | null
        if (!label) return
        const w = th.clientWidth
        label.classList.remove('is-full', 'is-mid', 'is-short')
        const SHORT = 80
        const MID = 120
        if (w <= SHORT) label.classList.add('is-short')
        else if (w <= MID) label.classList.add('is-mid')
        else label.classList.add('is-full')
    }

    function setupHeaderShorteningFallback() {
        headerRO?.disconnect()
        headerRO = new ResizeObserver((entries) => {
            entries.forEach(entry => applyHeaderState(entry.target as HTMLElement))
        })

        const table = previewTable.value
        if (!table) return
        const ths = Array.from(table.querySelectorAll('th.th-wdh')) as HTMLElement[]
        ths.forEach(th => {
            applyHeaderState(th)
            headerRO!.observe(th)
        })
    }

    function teardownHeaderShorteningFallback() {
        headerRO?.disconnect()
        headerRO = null
    }

    watch(
        selectedPlanExercises,
        () => {
            nextTick(() => {
                try {
                    initPreviewResizeTable()
                    setupHeaderShorteningFallback()
                } catch (err) {
                    console.error('[TrainingPlanBuilder] preview init crashed:', err)
                }
            })
        },
        { deep: true }
    )

    onMounted(() => {
        void exerciseLibraryStore.load()
        nextTick(() => {
            try {
                initPreviewResizeTable()
                setupHeaderShorteningFallback()
            } catch (err) {
                console.error('[TrainingPlanBuilder] onMounted init crashed:', err)
            }
        })
        queuePreviewBuilderStep(250, () => {
            startPreviewBuilderDemo()
        })
    })

    onUnmounted(() => {
        activeDragCleanup?.()
        activeDragCleanup = null
        clearPreviewBuilderTimers()
        teardownHeaderShorteningFallback()
    })
</script>

<style scoped>
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

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }

    .preview-touch {
        position: fixed;
        z-index: 60;
        width: 1.4rem;
        height: 1.4rem;
        margin-left: -0.7rem;
        margin-top: -0.7rem;
        pointer-events: none;
    }

    .preview-touch__dot {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        border: 2px solid rgba(29, 78, 216, 0.92);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
        animation: previewTouchPulse 1.45s ease-out infinite;
    }

    :deep(.preview-builder-submit-pulse) {
        animation: previewBuilderPulse 1.1s ease;
    }

    :deep(.preview-builder-submit-success) {
        background: linear-gradient(135deg, #16a34a, #22c55e) !important;
        border-color: rgba(34, 197, 94, 0.65) !important;
        color: #f8fffb !important;
    }

    .preview-builder-created :deep(.form-card) {
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.18), 0 18px 36px rgba(34, 197, 94, 0.12);
    }

    @keyframes previewBuilderPulse {
        0%,
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(35, 110, 200, 0);
        }
        35% {
            transform: scale(1.03);
            box-shadow: 0 0 0 0.45rem rgba(35, 110, 200, 0.16);
        }
    }

    @keyframes previewTouchPulse {
        0% {
            transform: scale(0.88);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.34);
        }
        70% {
            transform: scale(1);
            box-shadow: 0 0 0 0.7rem rgba(59, 130, 246, 0);
        }
        100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
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

    @media (prefers-reduced-motion: reduce) {
        .builder-landing {
            animation: none;
        }
    }

    html.dark-mode .section-title {
        color: #ffffff;
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
        min-width: 0; /* wichtig f�r Tables/Overflow */
    }

    /* Feldbl�cke */
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
        width: 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
    }

        /* killt "ragt rechts raus" zuverl�ssig */
        .field-row > * {
            min-width: 0;
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
        }

    /* Zelle wird selbst Container ? reagiert auf ihre eigene Breite */
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
        align-items: stretch; /* Kinder d�rfen volle Breite nutzen */
    }

    .form-card.builder-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        box-sizing: border-box; /* damit Padding mitgerechnet wird */
    }

    @media (max-width: 899px) {
        .form-card.builder-grid {
            grid-template-columns: 1fr;
        }
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

    /* === Live-Preview: Card im Stil von form-card/timer-card === */

    .preview-card {
        position: sticky;
        top: .75rem;
        contain: inline-size;
        overflow-x: hidden;
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

    @media (hover: hover) {
        .preview-card:hover {
            transform: translateY(-0.5px);
            box-shadow: 0 19px 42px rgba(15, 23, 42, 0.24);
            border-color: rgba(129, 140, 248, 0.38);
        }
    }

    .builder-section--report-tutorial-active .preview-card:hover {
        transform: none;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        border-color: rgba(148, 163, 184, 0.26);
    }

    html.dark-mode .preview-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
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
        /* kein eigener grauer Kasten mehr ? zeigt direkt den lila/blauen Preview-Hintergrund */
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

            .preview-card .exercise-table.full-width th,
            .preview-card .exercise-table.full-width td {
                white-space: normal; /* auf mobile darf�s umbrechen */
                word-break: break-word;
            }

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

        .builder-head .extras-cta {
            inline-size: var(--control-height);
            min-inline-size: var(--control-height);
            max-inline-size: var(--control-height);
            padding-inline: 0;
            display: inline-flex;
            justify-content: center;
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


    .form-card {
        position: relative;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 1.1rem;
        padding: 1.75rem 1.9rem;
        border-radius: 18px;
        box-sizing: border-box;
        /* ? exakt im Stil der Landing-Karten (stat-card/feature-card) ? */
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

    /* Dark Mode: gleiche Farbwelt, etwas satter und n�her am Page-Gradient */
    html.dark-mode .form-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Fallback f�r alte Browser ohne backdrop-filter / color-mix */
    @supports not (backdrop-filter: blur(10px)) or not (color-mix(in srgb, black 10%, white 90%)) {
        .form-card {
            background: var(--bg-card);
            box-shadow: 0 12px 32px rgba(15,23,42,0.45);
        }
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


    /* Dark-Mode Kontrast (optional feiner abstimmen) */
    html.dark-mode .training {
        --resize-color: #64748b; /* slate-500 */
        --resize-color-hover: #3b82f6; /* blue-500 */
    }

    .builder-head .plan-block .field-label {
        display: block;
        margin-bottom: .6rem; /* Abstand Titel ? Input */
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
        gap: .55rem; /* Abstand Titel ? Select */
    }

    .mode-switch {
        display: grid;
        gap: .45rem;
        margin-bottom: .4rem;
    }

    .mode-switch--top {
        grid-column: 1 / -1;
        margin-bottom: .2rem;
    }

    .segmented.seg-mode {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: .5rem;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: .3rem;
        align-items: center;
    }

    .segmented.seg-mode > button {
        width: 100%;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: .45rem .9rem;
        font-weight: 600;
        font-size: .89rem;
        cursor: pointer;
        transition: all .15s ease;
        color: var(--text-primary);
    }

    .segmented.seg-mode > button.on {
        background: var(--bg-card);
        border-color: var(--border-color);
        box-shadow: 0 1px 2px rgba(0,0,0,.06);
    }

    .auto-plan-section {
        margin-top: .2rem;
        padding: 0;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
    }

    .auto-plan-cta-row {
        margin-top: .35rem;
    }

    .auto-toggles-section {
        margin-top: .1rem;
    }

    .auto-toggles-title {
        display: inline-block;
        margin-bottom: .45rem;
    }

    .auto-toggles {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: .5rem .8rem;
    }

    .auto-toggles label {
        display: inline-flex;
        align-items: center;
        gap: .55rem;
        font-size: .88rem;
        min-height: 38px;
        padding: .45rem .6rem;
        border: 1px solid color-mix(in srgb, #64748b 42%, var(--border-color) 58%);
        border-radius: 10px;
        background:
            radial-gradient(circle at 12% 15%, color-mix(in srgb, #f8fafc 10%, transparent), transparent 60%),
            color-mix(in srgb, var(--bg-secondary) 92%, #0f172a 8%);
        transition: border-color .15s ease, background-color .15s ease, box-shadow .15s ease, transform .1s ease;
        cursor: pointer;
    }

    .auto-toggles label:hover {
        border-color: color-mix(in srgb, var(--accent-secondary) 45%, #64748b 55%);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
        transform: translateY(-1px);
    }

    .auto-toggle-inline {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        min-width: 0;
    }

    .auto-toggle-inline > span {
        min-width: 0;
    }

    .auto-toggle-help {
        display: inline-flex;
        align-items: center;
        line-height: 1;
    }

    .auto-toggles label:has(input:checked) {
        background:
            radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--accent-secondary) 18%, transparent), transparent 62%),
            color-mix(in srgb, var(--bg-card) 90%, #0b1220 10%);
        border-color: color-mix(in srgb, var(--accent-secondary) 58%, #64748b 42%);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-secondary) 20%, transparent) inset, 0 8px 20px rgba(15, 23, 42, 0.14);
    }

    .auto-toggles input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        width: 17px;
        height: 17px;
        min-width: 17px;
        margin: 0;
        border-radius: 4px;
        border: 1.5px solid color-mix(in srgb, #64748b 55%, var(--border-color) 45%);
        background: color-mix(in srgb, var(--bg-card) 92%, #0b1220 8%);
        display: inline-grid;
        place-content: center;
        transition: border-color .14s ease, background-color .14s ease, box-shadow .14s ease;
        cursor: pointer;
    }

    .auto-toggles input[type="checkbox"]::after {
        content: "";
        width: 11px;
        height: 11px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.4' d='M3 8.4l3 3.1L13.2 4.8'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        transform: scale(0);
        transition: transform .12s ease;
    }

    .auto-toggles input[type="checkbox"]:checked {
        border-color: color-mix(in srgb, var(--accent-secondary) 80%, #16a34a 20%);
        background: color-mix(in srgb, var(--accent-secondary) 78%, #16a34a 22%);
        box-shadow: 0 2px 7px color-mix(in srgb, var(--accent-secondary) 35%, transparent);
    }

    .auto-toggles input[type="checkbox"]:checked::after {
        transform: scale(1);
    }

    .auto-selected-list {
        display: flex;
        flex-wrap: wrap;
        gap: .55rem;
        margin-top: .65rem;
    }

    .auto-selected-tag {
        min-height: 34px;
        padding: .45rem .8rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, #64748b 42%, var(--border-color) 58%);
        background: color-mix(in srgb, var(--accent-secondary) 14%, var(--bg-card) 86%);
        color: var(--text-primary);
        font: inherit;
        font-size: .88rem;
        cursor: pointer;
        transition: background .18s ease, border-color .18s ease, box-shadow .18s ease, transform .18s ease;
    }

    .auto-selected-tag:hover {
        border-color: color-mix(in srgb, var(--accent-secondary) 45%, #64748b 55%);
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.10);
        transform: translateY(-1px);
    }

    .auto-selected-tag--report {
        background: color-mix(in srgb, #f59e0b 12%, var(--bg-card) 88%);
        border-color: color-mix(in srgb, #f59e0b 34%, var(--border-color) 66%);
    }

    .auto-report-overrides {
        display: grid;
        gap: .55rem;
        margin-top: .35rem;
        padding: .75rem .85rem;
        border: 1px solid color-mix(in srgb, #f59e0b 24%, var(--border-color) 76%);
        border-radius: 12px;
        background: color-mix(in srgb, #f59e0b 6%, var(--bg-card) 94%);
    }

    .auto-report-overrides__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        flex-wrap: wrap;
    }

    .auto-report-overrides__head span:last-child {
        color: var(--text-secondary);
        font-size: .84rem;
    }

    .auto-report-overrides__toggle {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
    }

    .auto-report-overrides__toggle span:last-child {
        color: var(--text-secondary);
        font-size: .84rem;
    }

    .primary-btn {
        width: 100%;
        height: var(--control-height);
        border-radius: 10px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 50%, transparent);
        background:
            radial-gradient(circle at 18% 18%, color-mix(in srgb, #ffffff 18%, transparent), transparent 52%),
            linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 18%, transparent), color-mix(in srgb, var(--accent-secondary) 16%, transparent));
        color: var(--text-primary);
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 18%, transparent) inset;
        transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease, filter .22s ease;
        will-change: transform;
    }

    .auto-preview-list {
        display: grid;
        gap: 1rem;
    }

    .auto-preview-plan {
        display: grid;
        gap: .65rem;
        padding: .85rem 1rem;
        border: 1px solid rgba(148, 163, 184, 0.26);
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
    }

    .auto-preview-plan__head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: .75rem;
        flex-wrap: wrap;
    }

    .auto-preview-plan__head h5 {
        margin: 0;
        font-size: 1rem;
    }

    .auto-preview-plan__regen {
        min-height: 34px;
        padding: .4rem .8rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--accent-secondary) 35%, var(--border-color) 65%);
        background: color-mix(in srgb, var(--bg-secondary) 88%, #0f172a 12%);
        color: var(--text-primary);
        font: inherit;
        font-size: .84rem;
        font-weight: 600;
        cursor: pointer;
        transition: border-color .18s ease, background .18s ease, transform .18s ease;
    }

    .auto-preview-plan__regen:hover:not(:disabled) {
        border-color: color-mix(in srgb, var(--accent-secondary) 60%, var(--border-color) 40%);
        background: color-mix(in srgb, var(--accent-secondary) 14%, var(--bg-card) 86%);
        transform: translateY(-1px);
    }

    .auto-preview-plan__regen:disabled {
        opacity: .6;
        cursor: wait;
        transform: none;
    }

    .auto-exercise-cell {
        display: flex;
        align-items: center;
        gap: .5rem;
        min-width: 0;
    }

    .auto-exercise-cell > span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .auto-exercise-report-btn {
        flex: 0 0 auto;
        width: 1.3rem;
        height: 1.3rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, #f59e0b 55%, var(--border-color) 45%);
        background: color-mix(in srgb, #f59e0b 14%, var(--bg-card) 86%);
        color: color-mix(in srgb, #b45309 86%, var(--text-primary) 14%);
        font: inherit;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
    }

    .auto-preview-plan__head span {
        color: var(--text-secondary);
        font-size: .88rem;
    }

    .builder-head .segmented.seg-type {
        gap: .45rem; /* etwas mehr Luft zwischen Buttons */
        padding: .26rem .35rem; /* minimal h�here/lebhaftere Fl�che */
        border-radius: 10px;
    }

        .builder-head .segmented.seg-type > button {
            padding: .42rem .72rem; /* + ~2�3px in beide Richtungen */
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
            grid-area: plan; /* spannt �ber "plan plan" = beide Spalten */
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
            align-items: start; /* nicht mittig zwischen den Zeilen h�ngen */
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
            align-self: end; /* am unteren Rand der Zeile ? H�he vom Label ignorieren */
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

        .plan-drag-handle {
            display: none;
        }
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
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: .45rem;
            height: var(--control-height, 48px);
            font-size: var(--control-font-size, 0.95rem);
            padding: 0 var(--control-padding-x);
            border-radius: 12px;
            box-sizing: border-box;
            /* ? exakt wie UiTrainingInput / UiSelect */
            border: 2px solid color-mix(in srgb, var(--accent-primary) 42%, var(--border-color, #e5e7eb) 58%);
            background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), color-mix(in srgb, var(--bg-secondary, #f3f4f6) 86%, transparent);
            color: var(--text-primary, #111827);
            box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 4px color-mix(in srgb, var(--accent-primary) 7%, transparent);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
            /* Overflow-Schutz (wie vorher) */
            white-space: nowrap;
            min-width: 0;
            width: auto;
            max-inline-size: clamp(180px, 26ch, 360px);
            overflow: hidden;
            text-overflow: ellipsis;
        }

            .builder-head .extras-cta:focus {
                outline: none;
            }

            .builder-head .extras-cta:focus-visible {
                outline: none;
                border-color: color-mix(in srgb, var(--accent-primary) 78%, var(--border-color, #e5e7eb) 22%);
                box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 28%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 32%, transparent) inset, 0 16px 34px rgba(15, 23, 42, 0.18);
            }

            /* ? toggled-state (falls dein ExtrasToggleButton sowas setzt) */
            .builder-head .extras-cta.on,
            .builder-head .extras-cta.is-on,
            .builder-head .extras-cta[aria-pressed="true"] {
                border-color: color-mix(in srgb, var(--accent-primary) 78%, var(--border-color, #e5e7eb) 22%);
                box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 38%, transparent) inset, 0 16px 34px rgba(15, 23, 42, 0.18);
            }

    /* Dark Mode wie bei deinen Inputs */
    html.dark-mode .builder-head .extras-cta {
        border-color: color-mix(in srgb, rgba(129, 140, 248, 0.85) 52%, rgba(148, 163, 184, 0.35) 48%);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.14), transparent 58%), rgba(2, 6, 23, 0.48);
        color: #fff;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(129, 140, 248, 0.22) inset, 0 0 0 5px rgba(129, 140, 248, 0.10);
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
                height: var(--control-height); /* fixe Zielh�he, z. B. 48px */
                padding-block: .25rem; /* etwas schlanker innen, damit�s nicht zu fett wirkt */
                align-items: stretch; /* Buttons f�llen die volle H�he */
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
            /* kein Scroll-Container -> Dropdown verh�lt sich wie deine anderen Selects */
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
                max-inline-size: clamp(180px, 24ch, 320px) !important; /* genug Platz f�r Label */
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
            max-inline-size: clamp(180px, 26ch, 360px); /* 26ch reicht f�r �Extras ausblenden� */
            overflow: hidden;
            text-overflow: ellipsis;
        }

    /* Ab 561px immer mit Text */
    @media (min-width: 561px) {
        .extras-label {
            display: inline !important;
        }
    }

    .exercise-table.full-width {
        width: 100%;
        table-layout: fixed; /* BIG FIX: Spalten verhalten sich stabil */
        border-collapse: collapse;
    }

        .exercise-table.full-width th,
        .exercise-table.full-width td {
            padding: 1.5rem;
            text-align: center;
            min-width: 0; /* war 150px: verhindert Breiten-Inflation */
            text-overflow: ellipsis;
            white-space: nowrap;
        }

    .add-exercise-btn,
    .plan-submit-btn {
        width: 100%;
        height: var(--control-height);
        padding-left: var(--control-padding-x);
        padding-right: var(--control-padding-x);
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    /* NEU: Resizer h�ngt an .th-text (nicht am TH) */
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

    .exercise-select-trigger {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font: inherit;
        gap: 0.5rem;
        /* WICHTIG: keine eigenen Abst�nde/Farben/Borders mehr */
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

    .field-row .exercise-select-trigger {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        cursor: pointer !important;
        gap: 0.5rem !important;
        /* kein extra padding hier � kommt aus der gemeinsamen Regel oben */
    }

    .exercise-select-trigger:focus-visible {
        outline: 2px solid #5b8cff !important;
        outline-offset: 2px !important;
    }

    .button-group {
        display: flex;
        gap: 0.75rem;
        align-items: stretch;
        flex-wrap: nowrap;
        width: 100%;
        margin-left: 0;
    }

    @media (max-width: 600px) {
        .button-group {
            flex-wrap: wrap;
            width: 100%;
            --btn-width: 100%;
        }
    }

    .preview-card .exercise-table-wrap {
        width: 100%;
        max-width: 100%;
        min-width: 0;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
    }

    .preview-card .exercise-table.full-width {
        width: 100%;
        min-width: 0; /* WICHTIG: kein erzwungenes �berlaufen */
    }

    .th-label .full {
        display: inline;
    }

    .th-label .mid,
    .th-label .short {
        display: none;
    }

    /* container queries statt viewport queries (Preview-Card hat contain:inline-size) */
    @container (max-width: 360px) {
        .th-label .full {
            display: none;
        }

        .th-label .mid {
            display: inline;
        }
    }

    @container (max-width: 280px) {
        .th-label .mid {
            display: none;
        }

        .th-label .short {
            display: inline;
        }
    }

    /* Übung wählen + Eigene �bung: immer untereinander */
    .field-row-stack {
        flex-direction: column;
        flex-wrap: nowrap;
        gap: .6rem;
        align-items: stretch;
    }

        .field-row-stack > * {
            width: 100%;
        }
</style>


