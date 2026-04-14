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
        <h3 class="section-title" :class="landingClass()" :style="{ '--builder-landing-delay': '0ms' }">Trainingsplan erstellen/bearbeiten</h3>
        <form
            @submit.prevent="createOrUpdatePlan"
            class="form-card builder-grid"
            :class="{ 'builder-card--editing': !!editingPlanId }">
            <div class="mode-switch mode-switch--top" :class="landingClass()" :style="{ '--builder-landing-delay': '70ms' }">
                <span class="field-label">Erstellungsmodus</span>
                <div ref="modeSwitchTrack"
                     class="segmented seg-mode"
                     :class="{ 'is-dragging': modeSwitchDrag.active }"
                     @pointerdown="handleModeSwitchPointerDown">
                    <span ref="modeSwitchThumb"
                          class="seg-mode__thumb"
                          :class="{ 'seg-mode__thumb--auto': builderMode === 'auto', 'seg-mode__thumb--dragging': modeSwitchDrag.active }"
                          :style="modeSwitchThumbStyle"
                          aria-hidden="true">
                        <span class="seg-mode__thumb-labels">
                            <span class="seg-mode__thumb-label seg-mode__thumb-label--manual"
                                  :style="modeSwitchManualLabelStyle">
                                <span class="builder-mode-manual-content">
                                    <span class="builder-mode-manual-label">Manuell</span>
                                    <span v-if="showModeSwitchThumbHint"
                                          :key="`builder-mode-thumb-swipe-hint-${modeSwipeHintCycle}`"
                                          class="builder-mode-swipe-inline seg-mode__thumb-hint">
                                        ›››
                                    </span>
                                </span>
                            </span>
                            <span class="seg-mode__thumb-label seg-mode__thumb-label--auto"
                                  :style="modeSwitchAutoLabelStyle">
                                Automatisch generieren
                            </span>
                        </span>
                    </span>
                    <button type="button"
                            class="seg-mode__option"
                            :class="{ on: builderMode === 'manual' }"
                            @pointerdown.stop="handleModeSwitchPointerDown"
                            @click="handleBuilderModeSwitchClick('manual')">Manuell</button>
                    <button type="button"
                            class="seg-mode__option"
                            :class="{ on: builderMode === 'auto' }"
                            @pointerdown.stop="handleModeSwitchPointerDown"
                            @click="handleBuilderModeSwitchClick('auto')">Automatisch generieren</button>
                </div>
            </div>

            <!-- LEFT: Builder -->
            <div ref="builderLeftRef" class="builder-left" :class="landingClass()" :style="{ '--builder-landing-delay': '140ms' }">
                <div v-if="showCardioRunner" class="cardio-popup-overlay" aria-hidden="true">
                    <div ref="cardioRunnerRef" :key="cardioRunnerBurst" class="cardio-popup-overlay__runner" :style="cardioRunnerStyle">
                        <CardioRunnerBurst v-if="cardioRunnerVariant === 'runner'" />
                        <CurlRunnerBurst v-else-if="cardioRunnerVariant === 'curl'" />
                    </div>
                </div>
                <Transition name="builder-mode" mode="out-in">
                    <div :key="builderMode" class="builder-mode-shell">
                <!-- Kopf: Planname + Typ (Segmented) + Extras rechts -->
                <div v-if="builderMode === 'manual'" class="builder-head">
                    <!-- NEU: Planname mit Überschrift -->
                    <div class="plan-block">
                        <label for="plan-name" class="field-label">Planname *</label>
                        <UiTrainingInput id="plan-name"
                                         v-model="planName"
                                         class="plan-name-input slim"
                                         placeholder="Planname (z. B. Push Day)"
                                         :error="builderFormErrors.planName"
                                         required />
                    </div>

                    <!-- Trainingstyp (Desktop: Segmented + Überschrift) -->
                    <div v-if="builderMode === 'manual'" class="type-block desktop-only">
                        <span class="type-heading field-label">Trainingstyp</span>
                        <div class="segmented seg-type">
                            <button type="button" :class="{ on: trainingType==='kraft' }" @click="handleTrainingTypeClick('kraft', $event)">Kraft</button>
                            <button type="button" :class="{ on: trainingType==='calisthenics' }" @click="handleTrainingTypeClick('calisthenics', $event)">Calisthenics</button>
                            <button type="button" :class="{ on: trainingType==='ausdauer' }" @click="handleTrainingTypeClick('ausdauer', $event)">Ausdauer</button>
                            <button type="button" :class="{ on: trainingType==='dehnung' }" @click="handleTrainingTypeClick('dehnung', $event)">Dehnung</button>
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

                <Transition name="builder-accordion">
                    <div v-if="builderMode === 'manual' && showExtras" class="goal-row">
                        <label class="field-label">Trainingsziel</label>
                        <div class="field-row" :class="{ 'has-error': !!builderFormErrors.selectedGoal }">
                            <UiSelect v-model="selectedGoalSafe"
                                      class="goal-select"
                                      placeholder="Trainingsziel"
                                      :options="trainingGoals" />
                        </div>
                        <p v-if="builderFormErrors.selectedGoal" class="field-error">{{ builderFormErrors.selectedGoal }}</p>
                        <div class="field-grid manual-extras-grid">
                            <div class="field">
                                <label>Pause</label>
                                <UiTrainingInput id="manual-recovery"
                                                 v-model="manualRecovery"
                                                 placeholder="z. B. 75–90 s locker" />
                            </div>
                            <div class="field">
                                <label>Tempo</label>
                                <UiTrainingInput id="manual-tempo"
                                                 v-model="manualTempo"
                                                 placeholder="z. B. 3-1-1 oder langsam runter, explosiv hoch" />
                            </div>
                            <div v-if="trainingType !== 'dehnung'" class="field">
                                <label>Gerätenummer</label>
                                <UiTrainingInput id="manual-equipment-number"
                                                 v-model="manualEquipmentNumber"
                                                 placeholder="z. B. C12 oder Rack 3" />
                            </div>
                        </div>
                    </div>
                </Transition>

                <div v-if="builderMode === 'auto'" class="goal-row auto-plan-section">
                    <div class="field-grid">
                        <div class="field" :class="{ 'has-error': !!builderFormErrors.autoPrimaryGoal }">
                            <label>Primärziel *</label>
                            <UiSelect v-model="autoPrimaryGoal"
                                      placeholder="Ziel"
                                      :options="autoGoalOptions" />
                            <p v-if="builderFormErrors.autoPrimaryGoal" class="field-error">{{ builderFormErrors.autoPrimaryGoal }}</p>
                        </div>
                        <div class="field">
                            <label>Level *</label>
                            <UiSelect v-model="autoLevel"
                                      placeholder="Level"
                                      :options="autoLevelOptions" />
                        </div>
                    </div>
                    <div class="field-grid">
                        <div class="field">
                            <label>Training pro Woche *</label>
                            <UiTrainingInput v-model.number="autoWeeklyFrequency"
                                             id="auto-frequency"
                                             type="number"
                                             placeholder="z. B. 3"
                                             min="1"
                                             max="7"
                                             :error="builderFormErrors.autoWeeklyFrequency" />
                        </div>
                        <div class="field">
                            <label>Min pro Training *</label>
                            <UiTrainingInput v-model.number="autoSessionDuration"
                                             id="auto-duration"
                                             type="number"
                                             placeholder="z. B. 45"
                                             min="20"
                                             max="120"
                                             :error="builderFormErrors.autoSessionDuration" />
                        </div>
                    </div>
                    <div class="field-grid auto-plan-names">
                        <div v-for="(_, index) in autoPlanNames"
                             :key="`auto-plan-name-${index}`"
                             class="field">
                            <label :for="`auto-plan-name-${index}`">Planname {{ index + 1 }} *</label>
                            <UiTrainingInput :id="`auto-plan-name-${index}`"
                                             v-model="autoPlanNames[index]"
                                             :placeholder="`Planname ${index + 1}`"
                                             :error="builderFormErrors.autoPlanNames[index] || ''" />
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
                        <label><input v-model="autoIncludeSubstitutions" type="checkbox" /> Ersatzübungen ergänzen</label>
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
                                placeholder="Übung aus Bibliothek auswählen"
                                :muscle-group-options="customExerciseMuscleGroupOptions"
                                variant="preferred" />
                        </div>
                        <div class="field">
                            <label>Übungen ausschließen</label>
                            <AutoExerciseSelector
                                id="auto-excluded-exercises"
                                v-model="autoExcludedExerciseRefs"
                                placeholder="Übung aus Bibliothek auswählen"
                                :muscle-group-options="customExerciseMuscleGroupOptions"
                                variant="excluded" />
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
                        <Transition name="auto-generation-overlay">
                            <div
                                v-if="builderMode === 'auto' && isGeneratingAutoPlan"
                                class="auto-generation-overlay"
                                aria-live="polite"
                                aria-busy="true">
                                <div class="auto-generation-overlay__card">
                                    <span class="auto-generation-overlay__eyebrow">Auto-Plan wird generiert</span>
                                    <strong class="auto-generation-overlay__percent">{{ autoGenerationProgress }}%</strong>
                                    <p class="auto-generation-overlay__status">{{ autoGenerationCurrentStage }}</p>
                                    <div class="auto-generation-overlay__bar" aria-hidden="true">
                                        <span :style="{ width: `${autoGenerationProgress}%` }"></span>
                                    </div>
                                    <div class="auto-generation-overlay__steps" aria-hidden="true">
                                        <span
                                            v-for="(step, index) in autoGenerationStages"
                                            :key="step"
                                            class="auto-generation-overlay__step"
                                            :class="{ 'is-active': index <= autoGenerationStageIndex }"></span>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                        <button class="primary-btn"
                                type="button"
                                :disabled="isGeneratingAutoPlan"
                                @click="generateAutoPlanIntoBuilder">
                            {{ isGeneratingAutoPlan ? `Generiert ${autoGenerationProgress}%` : 'Auto-Plan generieren' }}
                        </button>
                        <p v-if="builderFormErrors.autoGeneral" class="field-error">{{ builderFormErrors.autoGeneral }}</p>
                    </div>
                </div>

                <!-- Übungsauswahl -->
                <div class="field-block" v-if="builderMode === 'manual' && trainingType !== 'ausdauer'">
                    <label class="field-label">Übung *</label>
                    <div class="field-row field-row-stack" :class="{ 'has-error': !!builderFormErrors.exercise }">
                        <button type="button"
                                class="exercise-select-trigger"
                                @click="openManualExerciseLibrary">
                            <span class="exercise-select-trigger__text"
                                  :class="{ 'is-placeholder': !selectedManualLibraryExerciseLabel }">
                                {{ selectedManualLibraryExerciseLabel || 'Übung aus Bibliothek auswählen' }}
                            </span>
                        </button>

                        <button type="button"
                                class="exercise-custom-toggle"
                                :class="{ 'is-active': newExercise === 'custom' }"
                                @click="toggleCustomExerciseMode">
                            {{ newExercise === 'custom' ? 'Bibliothek nutzen' : 'Eigene Übung' }}
                        </button>
                    </div>
                    <Transition name="builder-accordion">
                        <div v-if="newExercise === 'custom'" class="custom-exercise-reveal">
                            <UiTrainingInput id="custom-exercise"
                                             v-model="customPlanExercise"
                                             placeholder="Eigene Übung eingeben"
                                             :error="builderFormErrors.customExercise" />
                            <div class="field-row custom-muscle-row" :class="{ 'has-error': !!builderFormErrors.customExerciseMuscle }">
                                <UiSelect id="exercise-filter"
                                          class="filter-input"
                                          v-model="exerciseFilter"
                                          placeholder="Muskelgruppe wählen"
                                          :options="customExerciseMuscleGroupOptions" />
                            </div>
                            <p v-if="builderFormErrors.customExerciseMuscle" class="field-error">{{ builderFormErrors.customExerciseMuscle }}</p>
                        </div>
                    </Transition>
                    <p v-if="builderFormErrors.exercise" class="field-error">{{ builderFormErrors.exercise }}</p>
                </div>

                <div v-if="builderMode === 'manual' && trainingType !== 'ausdauer'" class="field-block">
                    <label class="field-label">Ersatzübung</label>
                    <div class="field-row field-row-stack field-row-stack--replacement">
                        <button type="button"
                                class="exercise-select-trigger"
                                :disabled="!manualReplacementExerciseIds.length"
                                @click="openReplacementExerciseLibrary">
                            <span class="exercise-select-trigger__text"
                                  :class="{ 'is-placeholder': !manualReplacementExerciseLabel }">
                                {{ manualReplacementExerciseLabel || (manualReplacementExerciseIds.length ? 'Ersatzübung auswählen' : 'Zuerst passende Übung wählen') }}
                            </span>
                        </button>
                        <button v-if="manualReplacementExercise"
                                type="button"
                                class="exercise-custom-toggle"
                                @click="clearReplacementExercise">
                            Auswahl entfernen
                        </button>
                    </div>
                </div>

                <!-- Cardio -->
                <div class="field-block" v-else-if="builderMode === 'manual'">
                    <label class="field-label">Cardio-Art</label>
                    <div class="field-row" :class="{ 'has-error': !!builderFormErrors.cardioExercise }">
                        <button type="button"
                                class="exercise-select-trigger"
                                @click="openManualExerciseLibrary">
                            <span class="exercise-select-trigger__text"
                                  :class="{ 'is-placeholder': !selectedManualLibraryExerciseLabel }">
                                {{ selectedManualLibraryExerciseLabel || 'Cardio aus Bibliothek auswählen' }}
                            </span>
                        </button>
                    </div>
                    <p v-if="builderFormErrors.cardioExercise" class="field-error">{{ builderFormErrors.cardioExercise }}</p>
                </div>

                <!-- Parameter -->
                <div class="field-grid" v-if="builderMode === 'manual' && (trainingType === 'kraft' || trainingType === 'calisthenics')">
                    <div class="field">
                        <label>Sätze *</label>
                        <UiTrainingInput id="strength-sets"
                                         v-model="newSetsText"
                                         inputmode="numeric"
                                         placeholder="z. B. 4"
                                         :error="builderFormErrors.sets" />                    </div>
                    <div class="field">
                        <label>Wiederholungen *</label>
                        <UiTrainingInput id="strength-reps"
                                         v-model="newRepsText"
                                         inputmode="numeric"
                                         placeholder="z. B. 8–12"
                                         :error="builderFormErrors.reps" />                    </div>
                </div>

                <div class="field-grid" v-else-if="builderMode === 'manual' && trainingType === 'dehnung'">
                    <div class="field">
                        <label>Holds *</label>
                        <UiTrainingInput id="stretch-holds"
                                         v-model="newSetsText"
                                         inputmode="numeric"
                                         placeholder="z. B. 3"
                                         :error="builderFormErrors.sets" />                    </div>
                    <div class="field">
                        <label>Sekunden pro Hold *</label>
                        <UiTrainingInput id="stretch-seconds"
                                         v-model="newRepsText"
                                         inputmode="numeric"
                                         placeholder="z. B. 30"
                                         :error="builderFormErrors.reps" />                    </div>
                </div>

                <div class="field-grid" v-else-if="builderMode === 'manual'">
                    <div class="field">
                        <label>Dauer (Min) *</label>
                        <UiTrainingInput id="cardio-duration"
                                         v-model.number="newDuration"
                                         type="number"
                                         min="1"
                                         placeholder="z. B. 25"
                                         :error="builderFormErrors.duration" />                    </div>
                    <div class="field">
                        <label>Distanz (km, optional)</label>
                        <UiTrainingInput id="cardio-distance"
                                         v-model.number="newDistance"
                                         type="number"
                                         min="0"
                                         step="0.1"
                                         placeholder="z. B. 5"
                                         :error="builderFormErrors.distance" />                    </div>
                </div>

                <Transition name="smart-rx-content" mode="out-in">
                    <div
                        v-if="builderMode === 'manual' && !selectedGoal"
                        key="smart-rx-hint"
                        class="smart-rx-card smart-rx-card--hint">
                        <div class="smart-rx-card__head">
                            <div>
                                <p class="smart-rx-card__eyebrow">Hinweis</p>
                                <h4>Trainingsziel wählen</h4>
                                <p class="smart-rx-card__summary">
                                    Wähle zuerst bei Extras ein Trainingsziel aus. Erst danach wird eine passende Empfehlung für Sätze, Wiederholungen und Pause angezeigt.
                                </p>
                            </div>
                        </div>
                        <p v-if="builderFormErrors.autoPreferenceWeights" class="field-error">{{ builderFormErrors.autoPreferenceWeights }}</p>
                    </div>

                    <div v-else-if="builderMode === 'manual' && manualPrescriptionHint"
                         :key="`smart-rx-${manualPrescriptionHint.title}-${manualPrescriptionHint.summary}`"
                         class="smart-rx-card">
                        <div class="smart-rx-card__head">
                            <div>
                                <p class="smart-rx-card__eyebrow">Smart Range</p>
                                <h4>{{ manualPrescriptionHint.title }}</h4>
                                <p class="smart-rx-card__summary">{{ manualPrescriptionHint.summary }}</p>
                            </div>
                            <button
                                type="button"
                                class="smart-rx-card__apply"
                                @click="applyManualPrescriptionHint(true)">
                                Empfehlung übernehmen
                            </button>
                        </div>
                        <div class="smart-rx-card__grid">
                            <div class="smart-rx-stat">
                                <span>Volumen</span>
                                <strong>{{ manualPrescriptionHint.setsLabel }}</strong>
                            </div>
                            <div class="smart-rx-stat">
                                <span>Range</span>
                                <strong>{{ manualPrescriptionHint.repsLabel }}</strong>
                            </div>
                            <div class="smart-rx-stat">
                                <span>Pause</span>
                                <strong>{{ manualPrescriptionHint.restLabel }}</strong>
                            </div>
                            <div class="smart-rx-stat smart-rx-stat--accent">
                                <span>Fokus</span>
                                <strong>{{ manualPrescriptionHint.focusLabel }}</strong>
                            </div>
                        </div>
                        <div class="smart-rx-card__chips">
                            <span v-for="chip in manualPrescriptionHint.chips" :key="chip" class="smart-rx-chip">{{ chip }}</span>
                        </div>
                    </div>
                </Transition>

                <div v-if="builderMode === 'manual'" class="field-block">
                    <label class="field-label">Bemerkung</label>
                    <div class="field-row">
                        <UiTrainingInput id="manual-note"
                                         v-model="manualNote"
                                         placeholder="z. B. Ellbogen eng, sauberer Bewegungsradius, Maschine oft besetzt" />
                    </div>
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
                    <p v-if="builderFormErrors.exercises" class="field-error">{{ builderFormErrors.exercises }}</p>
                </div>

                <p v-if="builderFormErrors.general" class="field-error">{{ builderFormErrors.general }}</p>
                <div class="builder-submit-row" :class="{ 'is-editing': !!editingPlanId }">
                    <button v-if="editingPlanId"
                            type="button"
                            class="builder-edit-action-btn builder-cancel-edit-btn"
                            @click="cancelEditing">
                        Bearbeiten abbrechen
                    </button>
                    <PlanSubmitButton class="action-btn plan-submit-btn"
                                      :isEditing="!!editingPlanId"
                                      :disabled="isPlanSubmitDisabled"
                                      :extraClass="editingPlanId ? 'builder-edit-action-btn plan-submit-btn--editing' : ''"
                                      :createLabel="autoCreateButtonLabel"
                                      saveLabel="Plan aktualisieren"
                                      saveTitle="Plan aktualisieren" />
                </div>
                    </div>
                </Transition>
            </div>

            <!-- RIGHT: Live Preview (sticky) -->
            <div class="builder-right" :class="landingClass()" :style="{ '--builder-landing-delay': '220ms' }">
                <Transition name="builder-preview" mode="out-in">
                    <div :key="builderMode" class="preview-card builder-reveal-surface">
                    <div class="preview-head">
                        <h4>Live-Preview</h4>
                        <span v-if="builderMode === 'auto' && autoPreviewPlans.length" class="muted">
                            {{ autoPreviewPlans.length }} Plan{{ autoPreviewPlans.length===1?'':'e' }} · {{ autoPreviewExerciseCount }} Übung{{ autoPreviewExerciseCount===1?'':'en' }}
                        </span>
                        <span v-else-if="selectedPlanExercises.length" class="muted">
                            {{ selectedPlanExercises.length }} Übung{{ selectedPlanExercises.length===1?'':'en' }}
                        </span>
                    </div>

                    <div v-if="builderMode === 'auto' && autoPreviewPlans.length" class="auto-preview-banner">
                        <span class="auto-preview-banner__pulse"></span>
                        <div>
                            <strong>Adaptive Satz-/Wdh-Engine aktiv</strong>
                            <p>Jede Übung bekommt automatisch einen passenden Belastungsbereich für Ziel, Übungstyp und Level.</p>
                        </div>
                    </div>

                    <TransitionGroup v-if="builderMode === 'auto' && autoPreviewPlans.length" name="auto-plan-card" tag="div" class="auto-preview-list">
                        <div v-for="(plan, planIndex) in autoPreviewPlans"
                             :key="`${plan.name}-${planIndex}`"
                             class="auto-preview-plan"
                             :style="{ '--auto-plan-delay': `${Math.min(planIndex, 6) * 70}ms` }">
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
                                            <th v-if="hasEquipmentNumbers(plan.exercises)">Nummer</th>
                                            <th>Übung</th>
                                            <th>{{ plan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}</th>
                                            <th>{{ plan.exercises.some((ex: PlanExercise) => ex.type === 'ausdauer' || ex.type === 'dehnung') ? 'Wdh. / km / s' : 'Wiederholungen' }}</th>
                                        </tr>
                                    </thead>
                                    <TransitionGroup name="auto-preview-row" tag="tbody">
                                        <tr v-for="(ex, exIndex) in plan.exercises" :key="`${planIndex}-${exIndex}-${ex.exercise}`">
                                            <td v-if="hasEquipmentNumbers(plan.exercises)" class="exercise-number-cell">
                                                <span class="exercise-number-pill">{{ formatExerciseNumber(ex) }}</span>
                                            </td>
                                            <td>
                                                <div class="auto-exercise-cell">
                                                    <div class="auto-exercise-cell__body">
                                                        <span>{{ ex.exercise }}</span>
                                                        <small v-if="formatPlanExerciseMeta(ex)" class="exercise-meta-line exercise-meta-line--auto">
                                                            <span class="exercise-meta-track">
                                                                <span class="exercise-meta-marquee">{{ formatPlanExerciseMeta(ex) }}</span>
                                                                <span class="exercise-meta-divider" aria-hidden="true">|</span>
                                                                <span class="exercise-meta-marquee" aria-hidden="true">{{ formatPlanExerciseMeta(ex) }}</span>
                                                            </span>
                                                        </small>
                                                        <div v-if="ex.replacementExercise" class="preview-replacement-card">
                                                            <span class="preview-replacement-card__label">Ersatzübung</span>
                                                            <span class="preview-replacement-card__name">{{ ex.replacementExercise }}</span>
                                                            <span v-if="ex.replacementReason" class="preview-replacement-card__reason">{{ ex.replacementReason }}</span>
                                                        </div>
                                                    </div>
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
                                    </TransitionGroup>
                                </table>
                            </Table>
                        </div>
                    </TransitionGroup>

                    <div v-else-if="selectedPlanExercises.length" class="preview-table-shell">
                        <Table class="exercise-table full-width compact"
                               density="compact">
                            <table ref="previewTable" :data-cols="previewHasEquipmentNumbers ? 5 : 4">
                                <thead>
                                    <tr>
                                        <th v-if="previewHasEquipmentNumbers" class="resizable" :style="{ width: activePreviewColWidths[0] + '%' }">
                                            <span class="th-text">Nummer</span>
                                        </th>
                                        <th class="resizable" :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 1 : 0] + '%' }">
                                            <span class="th-text">Übung</span>
                                        </th>
                                        <th class="resizable" :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 2 : 1] + '%' }">
                                            <span class="th-text">
                                                {{ selectedPlanExercises.some((ex: PlanExercise) => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                            </span>
                                        </th>
                                        <th class="resizable th-wdh" :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 3 : 2] + '%' }">
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

                                        <th :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 4 : 3] + '%' }">Aktion</th>
                                    </tr>
                                </thead>

                                <TransitionGroup name="preview-row" tag="tbody">
                                    <tr v-for="(ex, index) in selectedPlanExercises"
                                        :key="`${ex.exercise}-${ex.type}-${ex.sets}-${ex.reps}-${formatExerciseNumber(ex)}`"
                                        @click="loadPreviewExerciseIntoForm(index, $event)"
                                        @dblclick="openEditPopup('table', index, $event)">
                                        <td v-if="previewHasEquipmentNumbers" :style="{ width: activePreviewColWidths[0] + '%' }" class="exercise-number-cell">
                                            <span class="exercise-number-pill">{{ formatExerciseNumber(ex) }}</span>
                                        </td>
                                        <td :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 1 : 0] + '%' }">
                                            <div class="preview-exercise-main">
                                                <div class="preview-exercise-title">
                                                    <span class="preview-order-badge">{{ index + 1 }}</span>
                                                    <span>{{ ex.exercise }}</span>
                                                </div>
                                                <small v-if="formatPlanExerciseMeta(ex)" class="exercise-meta-line exercise-meta-line--manual">
                                                    <span class="exercise-meta-track">
                                                        <span class="exercise-meta-marquee">{{ formatPlanExerciseMeta(ex) }}</span>
                                                        <span class="exercise-meta-divider" aria-hidden="true">|</span>
                                                        <span class="exercise-meta-marquee" aria-hidden="true">{{ formatPlanExerciseMeta(ex) }}</span>
                                                    </span>
                                                </small>
                                                <div v-if="ex.replacementExercise" class="preview-replacement-card">
                                                    <span class="preview-replacement-card__label">Ersatzübung</span>
                                                    <span class="preview-replacement-card__name">{{ ex.replacementExercise }}</span>
                                                    <span v-if="ex.replacementReason" class="preview-replacement-card__reason">{{ ex.replacementReason }}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 2 : 1] + '%' }">
                                            {{ ex.type === 'ausdauer' ? `${ex.sets} min` : ex.sets }}
                                        </td>
                                        <td :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 3 : 2] + '%' }">
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
                                        <td class="action-cell" :style="{ width: activePreviewColWidths[previewHasEquipmentNumbers ? 4 : 3] + '%' }">
                                            <div class="preview-action-cell">
                                                <div class="table-action-stack">
                                                    <button v-if="index > 0"
                                                            type="button"
                                                            class="reorder-btn reorder-btn--plain"
                                                            title="Nach oben verschieben"
                                                            aria-label="Übung nach oben verschieben"
                                                            @click.stop="moveExerciseInPlan(index, -1)">
                                                        ↑
                                                    </button>
                                                    <button v-if="index < selectedPlanExercises.length - 1"
                                                            type="button"
                                                            class="reorder-btn reorder-btn--plain"
                                                            title="Nach unten verschieben"
                                                            aria-label="Übung nach unten verschieben"
                                                            @click.stop="moveExerciseInPlan(index, 1)">
                                                        ↓
                                                    </button>
                                                </div>
                                                <DeleteButton class="table-delete-btn"
                                                              type="button"
                                                              title="Übung entfernen"
                                                              @click.stop="removeExerciseFromPlan(index)" />
                                            </div>
                                        </td>
                                    </tr>
                                </TransitionGroup>
                            </table>
                        </Table>
                    </div>

                    <div v-else class="empty-preview">
                        <span>Noch keine Übung hinzugefügt.</span>
                    </div>
                    </div>
                </Transition>
            </div>

            <Transition name="builder-stream-overlay-fade">
                <div v-if="builderDataStream.visible"
                     :key="`builder-data-stream-${builderDataStream.seq}`"
                     class="builder-data-stream-overlay"
                     aria-hidden="true">
                    <div v-for="line in builderDataStream.lines"
                         :key="line.id"
                         class="builder-data-stream-line"
                         :style="line.style">
                        <span class="builder-data-stream-line__particle"></span>
                        <span class="builder-data-stream-line__particle builder-data-stream-line__particle--mid"></span>
                        <span class="builder-data-stream-line__particle builder-data-stream-line__particle--late"></span>
                    </div>
                    <span v-for="pulse in builderDataStream.pulses"
                          :key="pulse.id"
                          class="builder-data-stream-pulse"
                          :style="pulse.style"></span>
                </div>
            </Transition>
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

        <GoalExerciseLibraryPopup
            :show="showManualExerciseLibrary"
            :model-value="selectedManualLibraryExerciseId"
            :intro="manualExerciseLibraryIntro"
            :allowed-kinds="manualExerciseLibraryKinds"
            @cancel="showManualExerciseLibrary = false"
            @select="applyManualExerciseSelection" />

        <GoalExerciseLibraryPopup
            :show="showReplacementExerciseLibrary"
            :model-value="selectedReplacementExerciseId"
            :intro="replacementExerciseLibraryIntro"
            :allowed-kinds="manualExerciseLibraryKinds"
            :allowed-ids="manualReplacementExerciseIds"
            @cancel="showReplacementExerciseLibrary = false"
            @select="applyReplacementExerciseSelection" />

    </div>
</template>

<script setup lang="ts">
    import { ref, reactive, computed, nextTick, watch, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
    import { useRoute } from 'vue-router'
    import UiSelect from '@/components/ui/kits/UiSelect.vue'
    import AutoExerciseSelector from '@/components/ui/training/AutoExerciseSelector.vue'
    import AxialLoadExplain from '@/components/ui/explain/AxialLoadExplain.vue'
    import HiitExplain from '@/components/ui/explain/HiitExplain.vue'
    import AutoExerciseReportPopup from '@/components/ui/popups/AutoExerciseReportPopup.vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import GoalExerciseLibraryPopup from '@/components/ui/popups/goal/GoalExerciseLibraryPopup.vue'
    import AutoPlanReportTutorial from '@/components/ui/TygTutorials/AutoPlanReportTutorial.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue'
    import AddExerciseButton from '@/components/ui/buttons/AddExerciseButton.vue'
    import PlanSubmitButton from '@/components/ui/buttons/PlanSubmitButton.vue'
    import CardioRunnerBurst from '@/components/ui/training/CardioRunnerBurst.vue'
    import CurlRunnerBurst from '@/components/ui/training/CurlRunnerBurst.vue'
    import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
    import Table from '@/components/ui/kits/UiTable.vue'
    import UiTrainingInput from '@/components/ui/kits/inputs/UiTrainingInput.vue'
    import { useTrainingPlansStore } from "@/store/trainingPlansStore";
    import { useComplaintsStore } from "@/store/complaintsStore";
    import { useExerciseLibraryStore } from '@/store/exerciseLibraryStore'
    import { generateAutoPlan, regenerateAutoPlanDay } from '@/services/training/autoPlanGeneratorService'
    import { normalizeExerciseText, resolveExerciseReference } from '@/services/training/exerciseLibrary'
    import { getTrainingPrescriptionHint, mapManualGoalToGoalType } from '@/utils/trainingPrescriptionHints'

    import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from "@/types/trainingPlan"
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
        (e: 'plan-updated-with-exercise-changes', payload: {
            planId: string
            oldName: string
            newName: string
            beforeExercises: PlanExercise[]
            afterExercises: PlanExercise[]
        }): void
    }>()

    const customExercisesState = ref<Array<{ name: string; muscle: string; type: CustomExerciseType }>>(
        Array.isArray(props.customExercises) ? [...props.customExercises] : []
    )
    const route = useRoute()
    const previewBuilderTimers: number[] = []
    const previewTouch = ref({ visible: false, x: 0, y: 0 })
    const hasDismissedModeSwipeHint = ref(false)
    const modeSwipeHintCycle = ref(0)
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
    type RangeCapableValue = number | string

    interface PlanExercise {
        exercise: string;
        sets: RangeCapableValue;
        reps: RangeCapableValue;
        goal?: string;
        type?: 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung';
        restSeconds?: number | null;
        durationMin?: number | null;
        distanceKm?: number | null;
        notes?: string;
        complaintAdjustmentReason?: string;
        recommendationLabel?: string;
        focusLabel?: string;
        recoveryHint?: string;
        tempoHint?: string;
        equipmentNumber?: string;
        replacementExercise?: string;
        replacementReason?: string;
        substitutions?: string[];
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
    const builderLeftRef = ref<HTMLElement | null>(null)
    const cardioRunnerRef = ref<HTMLElement | null>(null)
    const showManualExerciseLibrary = ref(false)
    const showReplacementExerciseLibrary = ref(false)
    const newReps = ref<RangeCapableValue | null>(null)
    const newSets = ref<RangeCapableValue | null>(null)
    const trainingType = ref<'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung'>('kraft')
    const showCardioRunner = ref(false)
    const cardioRunnerBurst = ref(0)
    const cardioRunnerVariant = ref<'runner' | 'curl'>('runner')
    const cardioRunnerStyle = ref<Record<string, string>>({})
    let cardioRunnerTimer: number | null = null

    const clearCardioRunnerTimer = () => {
        if (cardioRunnerTimer != null) {
            window.clearTimeout(cardioRunnerTimer)
            cardioRunnerTimer = null
        }
    }

    const triggerCardioRunner = () => {
        clearCardioRunnerTimer()
        showCardioRunner.value = false
        cardioRunnerBurst.value += 1
        cardioRunnerVariant.value = trainingType.value === 'ausdauer' ? 'runner' : 'curl'
        void nextTick(() => {
            showCardioRunner.value = true
            void nextTick(() => {
                const container = builderLeftRef.value
                const runner = cardioRunnerRef.value
                if (!container || !runner) return

                const containerWidth = Math.max(container.clientWidth, 320)
                const runnerWidth = Math.max(runner.offsetWidth, 120)
                const startLeft = 12
                const endLeft = Math.max(startLeft, containerWidth - runnerWidth - 12)
                const centeredLeft = Math.max(12, Math.round((containerWidth - runnerWidth) / 2))

                if (cardioRunnerVariant.value === 'curl') {
                    cardioRunnerStyle.value = {
                        left: `${centeredLeft}px`,
                        top: '54%',
                        opacity: '0',
                        transform: 'translateY(-50%) scale(0.9)',
                        transition: 'none',
                    }

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            cardioRunnerStyle.value = {
                                left: `${centeredLeft}px`,
                                top: '54%',
                                opacity: '1',
                                transform: 'translateY(-50%) scale(1)',
                                transition: 'opacity 220ms ease, transform 220ms ease',
                            }

                            cardioRunnerTimer = window.setTimeout(() => {
                                cardioRunnerStyle.value = {
                                    left: `${centeredLeft}px`,
                                    top: '54%',
                                    opacity: '0',
                                    transform: 'translateY(-50%) scale(0.98)',
                                    transition: 'opacity 260ms ease, transform 260ms ease',
                                }

                                cardioRunnerTimer = window.setTimeout(() => {
                                    showCardioRunner.value = false
                                    cardioRunnerTimer = null
                                }, 320)
                            }, 2200)
                        })
                    })
                    return
                }

                cardioRunnerStyle.value = {
                    left: `${startLeft}px`,
                    top: '56%',
                    opacity: '0',
                    transform: 'translateY(-50%) scale(0.88)',
                    transition: 'none',
                }

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        cardioRunnerStyle.value = {
                            left: `${endLeft}px`,
                            top: '56%',
                            opacity: '1',
                            transform: 'translateY(-50%) scale(1)',
                            transition: 'left 2.8s linear, opacity 220ms ease, transform 220ms ease',
                        }

                        cardioRunnerTimer = window.setTimeout(() => {
                            cardioRunnerStyle.value = {
                                left: `${endLeft + 36}px`,
                                top: '56%',
                                opacity: '0',
                                transform: 'translateY(-50%) scale(0.98)',
                                transition: 'left 420ms linear, opacity 260ms ease, transform 260ms ease',
                            }

                            cardioRunnerTimer = window.setTimeout(() => {
                                showCardioRunner.value = false
                                cardioRunnerTimer = null
                            }, 460)
                        }, 2850)
                    })
                })
            })
        })
    }
    const cardioTypes = ref([
        'Laufen', 'Radfahren', 'Rudern', 'Crosstrainer', 'Seilspringen', 'Treppensteigen', 'Schwimmen'
    ])
    const cardioExercise = ref('')
    const newDuration = ref<number | null>(null)
    const newDistance = ref<number | null>(null)

    const PREVIEW_COLS_WITH_NUMBER = [12, 38, 18, 24, 8]
    const PREVIEW_COLS_WITHOUT_NUMBER = [46, 20, 26, 8]
    const previewColWidths = ref<number[]>([...PREVIEW_COLS_WITH_NUMBER])
    const previewTable = ref<HTMLTableElement | null>(null)
    const restartModeSwipeHintCycle = () => {
        modeSwipeHintCycle.value += 1
    }
    const builderDataStream = ref<{
        visible: boolean
        seq: number
        lines: Array<{ id: string; style: Record<string, string> }>
        pulses: Array<{ id: string; style: Record<string, string> }>
    }>({
        visible: false,
        seq: 0,
        lines: [],
        pulses: [],
    })
    let builderDataStreamTimer: number | null = null
    let pendingTrainingTypeSourceEl: HTMLElement | null = null

    const editingPlanId = ref<string | null>(null)
    const modeSwitchTrack = ref<HTMLElement | null>(null)
    const modeSwitchThumb = ref<HTMLElement | null>(null)
    const selectedPlanExercises = ref<PlanExercise[]>([])
    const editOriginPlanName = ref('')
    const editOriginExercisesSnapshot = ref<PlanExercise[]>([])
    const selectedGoal = ref('')
    const trainingGoals = ref(['Muskelaufbau', 'Abnehmen', 'Ausdauer', 'Kraft', 'Gesundheit'])
    const showExtras = ref(false)
    const manualRecovery = ref('')
    const manualTempo = ref('')
    const manualEquipmentNumber = ref('')
    const manualNote = ref('')
    const manualReplacementExercise = ref('')
    const builderMode = ref<'manual' | 'auto'>('manual')
    const generatedAutoPlans = ref<AutoGeneratedPlanPreview[]>([])
    const pendingAutoGeneratedPlans = ref<AutoGeneratedPlanPreview[]>([])
    const manualDraftPlanName = ref('')
    const manualDraftExercises = ref<PlanExercise[]>([])
    const regeneratingPlanIndex = ref<number | null>(null)
    const isGeneratingAutoPlan = ref(false)
    const autoGenerationProgress = ref(0)
    const autoGenerationStageIndex = ref(0)
    const autoExerciseReportReason = ref<string | null>('')
    const autoExerciseReportState = ref<{ planIndex: number; exerciseIndex: number } | null>(null)
    const submittingExerciseReport = ref(false)
    const AUTO_PLAN_REPORT_TUTORIAL_KEY = 'gym3000:auto-plan-report-tutorial-seen'
    const TRAINING_BUILDER_MODE_KEY = 'gym3000:training-builder-mode'
    const AUTO_GENERATION_MIN_DURATION_MS = 5000
    const showAutoPlanReportTutorial = ref(false)
    let autoPlanReportTutorialTimer: ReturnType<typeof setTimeout> | null = null
    let autoGenerationProgressTimer: ReturnType<typeof setInterval> | null = null
    let autoGenerationStartedAt = 0
    const autoGenerationStages = [
        'Analysiere Ziel, Level und Frequenz',
        'Lade Übungsbibliothek und Einschränkungen',
        'Wähle passende Übungen aus',
        'Optimiere Sätze, Wiederholungen und Struktur',
        'Finalisiere Vorschau',
    ] as const

    const autoPrimaryGoal = ref<GoalType | ''>('')
    const autoLevel = ref<TrainingLevel>('beginner')
    const autoWeeklyFrequency = ref<number | null>(null)
    const autoSessionDuration = ref<number | null>(null)
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
    const autoIncludeSubstitutions = ref(true)
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

    type BuilderFormErrors = {
        planName: string
        selectedGoal: string
        exercise: string
        customExercise: string
        customExerciseMuscle: string
        cardioExercise: string
        sets: string
        reps: string
        duration: string
        distance: string
        exercises: string
        autoPrimaryGoal: string
        autoWeeklyFrequency: string
        autoSessionDuration: string
        autoPreferenceWeights: string
        autoPlanNames: string[]
        autoGeneral: string
        general: string
    }

    const createBuilderFormErrors = (): BuilderFormErrors => ({
        planName: '',
        selectedGoal: '',
        exercise: '',
        customExercise: '',
        customExerciseMuscle: '',
        cardioExercise: '',
        sets: '',
        reps: '',
        duration: '',
        distance: '',
        exercises: '',
        autoPrimaryGoal: '',
        autoWeeklyFrequency: '',
        autoSessionDuration: '',
        autoPreferenceWeights: '',
        autoPlanNames: [],
        autoGeneral: '',
        general: '',
    })

    const builderFormErrors = reactive<BuilderFormErrors>(createBuilderFormErrors())

    const exerciseFilter = ref('')

    const builderSection = ref<HTMLElement | null>(null)

    const clonePlanExercises = (exercises: PlanExercise[]) =>
        Array.isArray(exercises) ? exercises.map((exercise) => ({ ...exercise })) : []

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

    const getBuilderModeTranslate = (mode: 'manual' | 'auto') => (
        mode === 'auto' ? modeSwitchTravelPx.value : 0
    )

    const clampModeSwitchTranslate = (value: number) => (
        Math.min(Math.max(value, 0), modeSwitchTravelPx.value)
    )

    const modeSwitchThumbStyle = computed(() => ({
        '--mode-switch-thumb-translate': `${Math.round(
            clampModeSwitchTranslate(modeSwitchDrag.active ? modeSwitchDrag.translate : getBuilderModeTranslate(builderMode.value))
        )}px`,
    }))

    const modeSwitchProgress = computed(() => {
        if (modeSwitchTravelPx.value <= 0) return builderMode.value === 'auto' ? 1 : 0
        const activeTranslate = modeSwitchDrag.active
            ? modeSwitchDrag.translate
            : getBuilderModeTranslate(builderMode.value)
        return clampModeSwitchTranslate(activeTranslate) / modeSwitchTravelPx.value
    })

    const showModeSwitchThumbHint = computed(() => (
        !modeSwitchDrag.active && modeSwitchProgress.value < 0.08
    ))

    const modeSwitchManualLabelStyle = computed(() => ({
        opacity: `${Math.max(0, 1 - modeSwitchProgress.value * 1.6)}`,
        transform: `translateX(${Math.round(modeSwitchProgress.value * -18)}px)`,
    }))

    const modeSwitchAutoLabelStyle = computed(() => ({
        opacity: `${Math.min(1, Math.max(0, (modeSwitchProgress.value - 0.2) / 0.8))}`,
        transform: `translateX(${Math.round((1 - modeSwitchProgress.value) * 18)}px)`,
    }))

    const measureModeSwitch = () => {
        const nextTravel = Math.max(0, modeSwitchThumb.value?.getBoundingClientRect().width ?? 0)
        modeSwitchTravelPx.value = nextTravel

        if (!modeSwitchDrag.active) {
            modeSwitchDrag.translate = getBuilderModeTranslate(builderMode.value)
        }
    }

    const normalizePlanExerciseValue = (value: unknown): unknown => {
        if (Array.isArray(value)) {
            return value.map((entry) => normalizePlanExerciseValue(entry))
        }

        if (value && typeof value === 'object') {
            return Object.keys(value as Record<string, unknown>)
                .sort()
                .reduce<Record<string, unknown>>((acc, key) => {
                    acc[key] = normalizePlanExerciseValue((value as Record<string, unknown>)[key])
                    return acc
                }, {})
        }

        if (value == null) return null
        return value
    }

    const havePlanExercisesChanged = (before: PlanExercise[], after: PlanExercise[]) =>
        JSON.stringify(normalizePlanExerciseValue(clonePlanExercises(before))) !==
        JSON.stringify(normalizePlanExerciseValue(clonePlanExercises(after)))

    const syncManualDraftSnapshot = () => {
        manualDraftPlanName.value = planName.value
        manualDraftExercises.value = clonePlanExercises(selectedPlanExercises.value)
    }

    const dismissModeSwipeHint = () => {
        hasDismissedModeSwipeHint.value = true
    }

    const cleanupModeSwitchPointerListeners = () => {
        window.removeEventListener('pointermove', onModeSwitchPointerMove)
        window.removeEventListener('pointerup', onModeSwitchPointerUp)
        window.removeEventListener('pointercancel', onModeSwitchPointerUp)
    }

    const finishModeSwitchDrag = (event?: PointerEvent) => {
        if (modeSwitchDrag.pointerId != null) {
            try {
                modeSwitchTrack.value?.releasePointerCapture?.(modeSwitchDrag.pointerId)
            } catch { }
        }

        const shouldToggle = modeSwitchDrag.didMove
        const nextMode = modeSwitchDrag.translate >= modeSwitchTravelPx.value / 2 ? 'auto' : 'manual'

        cleanupModeSwitchPointerListeners()

        modeSwitchDrag.active = false
        modeSwitchDrag.pointerId = null
        modeSwitchDrag.startX = 0
        modeSwitchDrag.startTranslate = 0
        modeSwitchDrag.translate = getBuilderModeTranslate(shouldToggle ? nextMode : builderMode.value)

        if (shouldToggle) {
            modeSwitchDragSuppressClickUntil.value = Date.now() + 320
            setBuilderMode(nextMode)
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

    const handleModeSwitchPointerDown = (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return

        dismissModeSwipeHint()
        measureModeSwitch()

        modeSwitchDrag.active = true
        modeSwitchDrag.pointerId = event.pointerId
        modeSwitchDrag.startX = event.clientX
        modeSwitchDrag.startTranslate = getBuilderModeTranslate(builderMode.value)
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

    const handleBuilderModeSwitchClick = (mode: 'manual' | 'auto') => {
        if (Date.now() < modeSwitchDragSuppressClickUntil.value) return
        if (builderMode.value !== mode) dismissModeSwipeHint()
        setBuilderMode(mode)
    }

    const setBuilderMode = (mode: 'manual' | 'auto') => {
        if (builderMode.value === mode) return

        if (builderMode.value === 'manual') {
            syncManualDraftSnapshot()
        }

        builderMode.value = mode
        try {
            localStorage.setItem(TRAINING_BUILDER_MODE_KEY, mode)
        } catch { }

        if (mode === 'manual') {
            planName.value = manualDraftPlanName.value
            selectedPlanExercises.value = clonePlanExercises(manualDraftExercises.value)
            return
        }

        selectedPlanExercises.value = generatedAutoPlans.value[0]?.exercises.map((exercise) => ({ ...exercise })) ?? []
    }

    const setEditMode = (payload: {
        planId: string | null
        name: string
        exercises: PlanExercise[]
    }) => {
        builderMode.value = 'manual'
        generatedAutoPlans.value = []
        pendingAutoGeneratedPlans.value = []
        editingPlanId.value = payload.planId
        planName.value = payload.name
        selectedPlanExercises.value = clonePlanExercises(payload.exercises)
        editOriginPlanName.value = payload.name
        editOriginExercisesSnapshot.value = clonePlanExercises(payload.exercises)
        syncManualDraftSnapshot()

        // ? nice default: Typ passend zum Plan
        const firstType = selectedPlanExercises.value[0]?.type
        if (firstType) trainingType.value = firstType
    }

    const clearEditMode = () => {
        editingPlanId.value = null
        editOriginPlanName.value = ''
        editOriginExercisesSnapshot.value = []
        generatedAutoPlans.value = []
        pendingAutoGeneratedPlans.value = []
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

    const scrollBuilderIntoViewForAnimation = async () => {
        const el = builderSection.value
        if (!el) return

        const offset = 8
        const top = el.getBoundingClientRect().top + window.scrollY - offset
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' })

        if (prefersReduced) {
            await nextTick()
            return
        }

        await new Promise<void>((resolve) => window.setTimeout(resolve, 420))
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

    const syncAutoPlanNames = () => {
        const nextLength = Math.max(0, Math.min(7, Number(autoWeeklyFrequency.value) || 0))
        const current = autoPlanNames.value.slice(0, nextLength)
        while (current.length < nextLength) {
            current.push('')
        }
        autoPlanNames.value = current
    }

    const currentGeneratedPlansToPersist = computed(() =>
        builderMode.value === 'auto'
            ? generatedAutoPlans.value.filter((plan) => Array.isArray(plan.exercises) && plan.exercises.length > 0)
            : []
    )

    const currentExercisesToSave = computed(() =>
        builderMode.value === 'auto'
            ? []
            : selectedPlanExercises.value
    )

    const hasExercisesToSave = computed(() =>
        builderMode.value === 'auto'
            ? currentGeneratedPlansToPersist.value.some((plan) => plan.exercises.length > 0)
            : currentExercisesToSave.value.length > 0
    )

    const autoGeneratedPlansToPersist = computed(() =>
        generatedAutoPlans.value.filter((plan) => Array.isArray(plan.exercises) && plan.exercises.length > 0)
    )

    const autoPreviewPlans = computed<AutoGeneratedPlanPreview[]>(() => {
        const basePlans = generatedAutoPlans.value
        const targetPlans = pendingAutoGeneratedPlans.value.length ? pendingAutoGeneratedPlans.value : generatedAutoPlans.value

        if (!targetPlans.length) return []
        if (!isGeneratingAutoPlan.value) return targetPlans

        const revealStart = 12
        const revealEnd = 99
        const clampedProgress = Math.max(revealStart, Math.min(revealEnd, autoGenerationProgress.value))
        const revealRatio = (clampedProgress - revealStart) / (revealEnd - revealStart)

        if (!basePlans.length) {
            const totalExercises = targetPlans.reduce((sum, plan) => sum + plan.exercises.length, 0)
            if (!totalExercises) return targetPlans

            const targetVisibleExercises = autoGenerationProgress.value >= revealEnd
                ? totalExercises
                : Math.min(totalExercises - 1, Math.max(0, Math.floor(revealRatio * totalExercises)))

            if (targetVisibleExercises <= 0) return []

            let remaining = targetVisibleExercises
            const visiblePlans: AutoGeneratedPlanPreview[] = []

            for (const plan of targetPlans) {
                if (remaining <= 0) break
                const visibleExerciseCount = Math.min(plan.exercises.length, remaining)
                if (visibleExerciseCount > 0) {
                    visiblePlans.push({
                        ...plan,
                        exercises: plan.exercises.slice(0, visibleExerciseCount),
                    })
                    remaining -= visibleExerciseCount
                }
            }

            return visiblePlans
        }

        const totalSlots = Math.max(
            basePlans.reduce((sum, plan) => sum + plan.exercises.length, 0),
            targetPlans.reduce((sum, plan) => sum + plan.exercises.length, 0)
        )

        if (!totalSlots) return basePlans

        const replacedSlots = autoGenerationProgress.value >= revealEnd
            ? totalSlots
            : Math.min(totalSlots - 1, Math.max(0, Math.floor(revealRatio * totalSlots)))

        let slotCursor = 0
        const mergedPlans: AutoGeneratedPlanPreview[] = []
        const maxPlans = Math.max(basePlans.length, targetPlans.length)

        for (let planIndex = 0; planIndex < maxPlans; planIndex++) {
            const basePlan = basePlans[planIndex]
            const targetPlan = targetPlans[planIndex]
            const baseExercises = basePlan?.exercises ?? []
            const targetExercises = targetPlan?.exercises ?? []
            const planSlotCount = Math.max(baseExercises.length, targetExercises.length)
            const mergedExercises: PlanExercise[] = []

            for (let exerciseIndex = 0; exerciseIndex < planSlotCount; exerciseIndex++) {
                const targetExercise = targetExercises[exerciseIndex]
                const baseExercise = baseExercises[exerciseIndex]
                const useTarget = slotCursor < replacedSlots

                if (useTarget) {
                    if (targetExercise) mergedExercises.push(targetExercise)
                } else if (baseExercise) {
                    mergedExercises.push(baseExercise)
                }

                slotCursor++
            }

            const hasTargetContent = mergedExercises.some((exercise, index) => targetExercises[index] === exercise)
            const sourcePlan = (hasTargetContent || !basePlan) ? targetPlan : basePlan

            if (sourcePlan && mergedExercises.length) {
                mergedPlans.push({
                    ...(sourcePlan ?? targetPlan ?? basePlan)!,
                    exercises: mergedExercises,
                })
            }
        }

        return mergedPlans
    })

    const autoPreviewExerciseCount = computed(() =>
        autoPreviewPlans.value.reduce((sum, plan) => sum + plan.exercises.length, 0)
    )

    const autoGenerationCurrentStage = computed(
        () => autoGenerationStages[Math.min(autoGenerationStageIndex.value, autoGenerationStages.length - 1)] ?? 'Generiere Auto-Plan'
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

    const normalizeRangeCapableInput = (value: unknown): RangeCapableValue | null => {
        const text = String(value ?? '').trim()
        if (!text) return null
        return text
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

    const validateRangeCapableInt = (
        value: RangeCapableValue | null | undefined,
        label: string,
        min: number,
        max: number
    ) => {
        if (value == null) return `${label} müssen eine Zahl oder einen Bereich wie 8-10 sein`

        const text = String(value).trim()
        if (!text) return `${label} müssen eine Zahl oder einen Bereich wie 8-10 sein`

        if (/^\d+$/.test(text)) {
            const num = Number(text)
            if (num < min || num > max) return `${label} müssen zwischen ${min} und ${max} liegen`
            return null
        }

        const rangeMatch = text.match(/^(\d+)\s*-\s*(\d+)$/)
        if (!rangeMatch) return `${label} müssen eine Ganzzahl oder einen Bereich wie 8-10 sein`

        const start = Number(rangeMatch[1])
        const end = Number(rangeMatch[2])
        if (start < min || end > max) return `${label} müssen zwischen ${min} und ${max} liegen`
        if (start > end) return `${label}: Bereich muss aufsteigend sein`
        return null
    }

    const validateReps = (reps: RangeCapableValue | null | undefined) =>
        validateRangeCapableInt(reps, 'Wiederholungen/Sekunden', 1, 1000)

    const validateSets = (sets: RangeCapableValue | null | undefined) =>
        validateRangeCapableInt(sets, 'Sätze', 1, 20)

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
    const waitForUiBeat = (ms: number) =>
        new Promise<void>((resolve) => window.setTimeout(resolve, ms))

    const clearAutoGenerationProgressTimer = () => {
        if (autoGenerationProgressTimer) {
            clearInterval(autoGenerationProgressTimer)
            autoGenerationProgressTimer = null
        }
    }

    const startAutoGenerationFeedback = () => {
        clearAutoGenerationProgressTimer()
        isGeneratingAutoPlan.value = true
        autoGenerationStartedAt = Date.now()
        autoGenerationStageIndex.value = 0
        autoGenerationProgress.value = 7

        clearAutoGenerationProgressTimer()
        autoGenerationProgressTimer = setInterval(() => {
            const elapsed = Math.max(0, Date.now() - autoGenerationStartedAt)
            const ratio = Math.min(1, elapsed / AUTO_GENERATION_MIN_DURATION_MS)
            const timelineProgress = Math.min(95, 7 + Math.round(ratio * 88))
            const timelineStage = Math.min(
                autoGenerationStages.length - 1,
                Math.floor(ratio * autoGenerationStages.length)
            )

            autoGenerationStageIndex.value = Math.max(autoGenerationStageIndex.value, timelineStage)
            if (timelineProgress > autoGenerationProgress.value) {
                autoGenerationProgress.value = timelineProgress
            }
        }, 90)
    }

    const advanceAutoGenerationStage = (stageIndex: number, minProgress?: number) => {
        autoGenerationStageIndex.value = Math.max(0, Math.min(stageIndex, autoGenerationStages.length - 1))
        if (typeof minProgress === 'number') {
            autoGenerationProgress.value = Math.max(autoGenerationProgress.value, minProgress)
        }
    }

    const finishAutoGenerationFeedback = async () => {
        const elapsed = autoGenerationStartedAt ? Date.now() - autoGenerationStartedAt : 0
        const remaining = Math.max(0, AUTO_GENERATION_MIN_DURATION_MS - elapsed)
        if (remaining > 0) {
            await waitForUiBeat(remaining)
        }
        advanceAutoGenerationStage(autoGenerationStages.length - 1)
        clearAutoGenerationProgressTimer()
        autoGenerationProgress.value = Math.max(autoGenerationProgress.value, 97)
        await waitForUiBeat(180)
        autoGenerationProgress.value = Math.max(autoGenerationProgress.value, 99)
        await waitForUiBeat(140)
        if (pendingAutoGeneratedPlans.value.length) {
            generatedAutoPlans.value = pendingAutoGeneratedPlans.value.map((plan) => ({
                ...plan,
                exercises: plan.exercises.map((exercise) => ({ ...exercise })),
            }))
            selectedPlanExercises.value = generatedAutoPlans.value[0]?.exercises.map((exercise) => ({ ...exercise })) ?? []
            pendingAutoGeneratedPlans.value = []
            await nextTick()
        }
        autoGenerationProgress.value = 100
        await waitForUiBeat(420)
        isGeneratingAutoPlan.value = false
        await waitForUiBeat(180)
        autoGenerationProgress.value = 0
        autoGenerationStageIndex.value = 0
        autoGenerationStartedAt = 0
    }

    const abortAutoGenerationFeedback = async () => {
        clearAutoGenerationProgressTimer()
        await waitForUiBeat(120)
        isGeneratingAutoPlan.value = false
        autoGenerationProgress.value = 0
        autoGenerationStageIndex.value = 0
        autoGenerationStartedAt = 0
        pendingAutoGeneratedPlans.value = []
    }

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

    watch(planName, () => {
        builderFormErrors.planName = ''
        builderFormErrors.general = ''
    })

    watch(selectedGoal, () => {
        builderFormErrors.selectedGoal = ''
    })

    watch([newExercise, customPlanExercise], () => {
        builderFormErrors.exercise = ''
        builderFormErrors.customExercise = ''
        builderFormErrors.customExerciseMuscle = ''
    })

    watch(exerciseFilter, () => {
        builderFormErrors.customExerciseMuscle = ''
    })

    watch(cardioExercise, () => {
        builderFormErrors.cardioExercise = ''
    })

    watch([newSets, newReps], () => {
        builderFormErrors.sets = ''
        builderFormErrors.reps = ''
    })

    watch([newDuration, newDistance], () => {
        builderFormErrors.duration = ''
        builderFormErrors.distance = ''
    })

    watch(selectedPlanExercises, () => {
        builderFormErrors.exercises = ''
    }, { deep: true })

    watch([autoPrimaryGoal, autoWeeklyFrequency, autoSessionDuration], () => {
        builderFormErrors.autoPrimaryGoal = ''
        builderFormErrors.autoWeeklyFrequency = ''
        builderFormErrors.autoSessionDuration = ''
        builderFormErrors.autoGeneral = ''
    })

    watch([autoMachineFocusWeight, autoFreeWeightFocusWeight, autoJointFriendlyWeight], () => {
        builderFormErrors.autoPreferenceWeights = ''
    })

    watch(autoPlanNames, () => {
        builderFormErrors.autoPlanNames = []
    }, { deep: true })

    watch(planName, () => {
        if (builderMode.value !== 'auto') return
        if (autoPlanNames.value.some((entry) => entry.trim().length > 0)) return
        syncAutoPlanNames()
    })

    watch(
        [planName, selectedPlanExercises, builderMode],
        () => {
            if (builderMode.value !== 'manual') return
            syncManualDraftSnapshot()
        },
        { deep: true }
    )

    watch(autoPlanNames, (value) => {
        if (!generatedAutoPlans.value.length) return
        generatedAutoPlans.value = generatedAutoPlans.value.map((plan, index) => ({
            ...plan,
            name: value[index]?.trim() || plan.name,
        }))
    }, { deep: true })

    const buildGeneratorInput = (): GeneratorInput => {
        if (!autoPrimaryGoal.value) {
            throw new Error('auto-primary-goal-missing')
        }
        if (!Number.isFinite(autoWeeklyFrequency.value) || autoWeeklyFrequency.value == null) {
            throw new Error('auto-weekly-frequency-missing')
        }
        if (!Number.isFinite(autoSessionDuration.value) || autoSessionDuration.value == null) {
            throw new Error('auto-session-duration-missing')
        }

        const weeklyFrequency = Math.max(1, Math.min(7, Math.round(autoWeeklyFrequency.value)))
        const sessionDurationMin = Math.max(20, Math.min(120, Math.round(autoSessionDuration.value)))

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
            weeklyFrequency,
            sessionDurationMin,
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
                shortSessions: sessionDurationMin <= 35,
                noCardio: autoNoCardio.value,
                noHiit: autoNoHiiT.value,
                focusMuscleGroups: [...autoFocusMuscles.value],
                preferredExercises: autoPreferredExerciseRefs.value.map((entry) => entry.canonicalName),
                preferredExerciseRefs: [...autoPreferredExerciseRefs.value],
                includeSubstitutions: autoIncludeSubstitutions.value,
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
        substitutions?: string[]
        complaintAdjustmentReason?: string
    }>): PlanExercise[] => generatedExercises.map((exercise) => {
        const type = mapGeneratedCategoryToType(exercise.category)
        const goalType = autoPrimaryGoal.value || 'muscle_gain'
        const hint = buildExerciseHint(exercise.exerciseName, type, goalType)
        const substitutions = Array.isArray(exercise.substitutions) ? exercise.substitutions.filter(Boolean) : []

        return {
            exercise: exercise.exerciseName,
            sets: exercise.category === 3 ? (exercise.durationMin ?? hint.exact.durationMin ?? 0) : (exercise.sets ?? hint.exact.sets ?? 0),
            reps: exercise.category === 3 ? Math.round(exercise.distanceKm ?? 0) : (exercise.reps ?? hint.exact.reps ?? 0),
            type,
            restSeconds: exercise.restSeconds ?? hint.exact.restSeconds ?? null,
            durationMin: exercise.durationMin ?? hint.exact.durationMin ?? null,
            distanceKm: exercise.distanceKm ?? hint.exact.distanceKm ?? null,
            notes: exercise.notes,
            complaintAdjustmentReason: exercise.complaintAdjustmentReason,
            recommendationLabel: hint.recommendationLabel,
            focusLabel: hint.focusLabel,
            substitutions,
            replacementExercise: substitutions[0],
        }
    })

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

    const getConflictingAutoExerciseRefs = () => {
        const conflicts: GeneratorExerciseReference[] = []

        for (const preferred of autoPreferredExerciseRefs.value) {
            if (!autoExcludedExerciseRefs.value.some((excluded) => sameExerciseReference(preferred, excluded))) continue
            if (!conflicts.some((entry) => sameExerciseReference(entry, preferred))) {
                conflicts.push(preferred)
            }
        }

        return conflicts
    }

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
            if (error instanceof Error && error.message === 'auto-primary-goal-missing') {
                builderFormErrors.autoPrimaryGoal = 'Primärziel auswählen'
                return
            }
            if (error instanceof Error && error.message === 'auto-weekly-frequency-missing') {
                builderFormErrors.autoWeeklyFrequency = 'Training pro Woche auswählen'
                return
            }
            if (error instanceof Error && error.message === 'auto-session-duration-missing') {
                builderFormErrors.autoSessionDuration = 'Min pro Training auswählen'
                return
            }
            if (error instanceof Error && error.message === 'exercise-library-empty') {
                builderFormErrors.autoGeneral = 'Die Übungsbibliothek konnte nicht geladen werden. Auto-Plan wurde nicht neu erzeugt.'
                return
            }
            builderFormErrors.autoGeneral = 'Auto-Plan konnte nicht neu generiert werden. Bitte Eingaben prüfen.'
        } finally {
            regeneratingPlanIndex.value = null
        }
    }

    const generateAutoPlanIntoBuilder = async () => {
        if (!validateBuilderFields('generate')) return
        if (isGeneratingAutoPlan.value) return

        builderFormErrors.autoGeneral = ''
        startAutoGenerationFeedback()

        try {
            advanceAutoGenerationStage(1)
            await Promise.all([
                complaintsStore.load(),
                exerciseLibraryStore.load(),
            ])

            if (!exerciseLibraryStore.entries.length) {
                throw new Error('exercise-library-empty')
            }

            advanceAutoGenerationStage(2)
            await waitForUiBeat(140)
            const generated = generateAutoPlan(buildGeneratorInput())
            advanceAutoGenerationStage(3)
            planName.value = generated.planName
            syncAutoPlanNames()
            pendingAutoGeneratedPlans.value = generated.days.map((day, index) => ({
                name: autoPlanNames.value[index]?.trim() || buildAutoPlanName(generated.planName, index),
                dayName: formatAutoDayLabel(day.dayName, day.focus),
                focus: day.focus,
                dayIndex: day.dayIndex,
                exercises: mapGeneratedExercisesToPreview(day.exercises),
            }))

            await nextTick()
            advanceAutoGenerationStage(4)
            await waitForUiBeat(180)
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
            await finishAutoGenerationFeedback()
            props.addToast('Auto-Plan erstellt', 'save')
        } catch (error) {
            if (error instanceof Error && error.message === 'exercise-library-empty') {
                builderFormErrors.autoGeneral = 'Die Übungsbibliothek konnte nicht geladen werden. Auto-Plan wurde nicht erzeugt.'
                await abortAutoGenerationFeedback()
                return
            }
            builderFormErrors.autoGeneral = 'Auto-Plan konnte nicht erstellt werden. Bitte Eingaben prüfen.'
            await abortAutoGenerationFeedback()
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

    const customExerciseMuscleGroupOptions = computed(() => {
        const staticGroups = Object.keys(muscleGroups.value)
        const libraryGroups = Array.from(new Set(
            exerciseLibraryStore.entries
                .map((entry) => String(entry.muscleGroup ?? '').trim())
                .filter(Boolean)
                .filter((group) => !['Cardio'].includes(group))
        ))

        return Array.from(new Set([...staticGroups, ...libraryGroups]))
            .sort((left, right) => left.localeCompare(right, 'de'))
            .map((group) => ({ value: group, label: group }))
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

    const manualGoalType = computed(() => mapManualGoalToGoalType(selectedGoal.value))

    const manualExerciseLibraryKinds = computed(() => {
        if (trainingType.value === 'ausdauer') return ['cardio'] as const
        if (trainingType.value === 'dehnung') return ['mobility'] as const
        return ['strength'] as const
    })

    const manualExerciseLibraryIntro = computed(() => (
        trainingType.value === 'ausdauer'
            ? 'Wähle eine Cardio-Übung aus der Bibliothek für deinen Trainingsplan.'
            : trainingType.value === 'dehnung'
            ? 'Wähle eine Mobility- oder Dehnübung aus der Bibliothek für deinen Plan.'
            : 'Wähle eine Übung aus der Bibliothek für deinen Trainingsplan.'
    ))

    const replacementExerciseLibraryIntro = computed(() => (
        'Wähle eine sinnvolle Ersatzübung aus den passenden Bibliotheks-Vorschlägen.'
    ))

    const findLibraryExerciseByName = (name?: string | null) => {
        const needle = normalizeExerciseText(name ?? '')
        if (!needle) return null
        return libraryEntries.value.find((entry) => (
            normalizeExerciseText(entry.name) === needle
            || entry.aliases.some((alias) => normalizeExerciseText(alias) === needle)
        )) ?? null
    }

    const selectedManualLibraryExercise = computed(() => (
        trainingType.value === 'ausdauer'
            ? findLibraryExerciseByName(cardioExercise.value)
            : (newExercise.value && newExercise.value !== 'custom'
                ? findLibraryExerciseByName(newExercise.value)
                : null)
    ))

    const selectedManualLibraryExerciseId = computed(() => selectedManualLibraryExercise.value?.id ?? '')

    const selectedManualLibraryExerciseLabel = computed(() => (
        trainingType.value !== 'ausdauer' && newExercise.value === 'custom'
            ? ''
            : (selectedManualLibraryExercise.value?.name || (trainingType.value === 'ausdauer' ? cardioExercise.value : newExercise.value) || '')
    ))

    const manualReplacementExerciseEntries = computed(() => (
        manualReplacementOptions.value
            .map(name => findLibraryExerciseByName(name))
            .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    ))

    const manualReplacementExerciseIds = computed(() => (
        manualReplacementExerciseEntries.value.map(entry => entry.id)
    ))

    const selectedReplacementExercise = computed(() => (
        manualReplacementExercise.value
            ? findLibraryExerciseByName(manualReplacementExercise.value)
            : null
    ))

    const selectedReplacementExerciseId = computed(() => selectedReplacementExercise.value?.id ?? '')

    const manualReplacementExerciseLabel = computed(() => (
        selectedReplacementExercise.value?.name || manualReplacementExercise.value || ''
    ))

    const buildExerciseHint = (exerciseName: string | null | undefined, type: ExerciseType | PlanExercise['type'], goalType: GoalType) => (
        getTrainingPrescriptionHint({
            trainingType: (type ?? 'kraft') as ExerciseType,
            goalType,
            level: autoLevel.value,
            exerciseName,
            exercise: findLibraryExerciseByName(exerciseName),
        })
    )

    const selectedManualExerciseName = computed(() => {
        if (trainingType.value === 'ausdauer') return cardioExercise.value
        return newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value
    })

    const manualPrescriptionHint = computed(() => {
        if (!selectedGoal.value) return null
        return buildExerciseHint(selectedManualExerciseName.value, trainingType.value, manualGoalType.value)
    })

    const manualReplacementOptions = computed(() => {
        const selectedName = selectedManualExerciseName.value
        const selectedExercise = findLibraryExerciseByName(selectedName)
        const currentType = trainingType.value
        const currentNeedle = normalizeExerciseText(selectedName ?? '')
        const muscleNeedle = exerciseFilter.value.trim().toLowerCase()

        const pool = libraryEntries.value.filter((entry) => {
            if (!selectedExercise) {
                if (currentType === 'ausdauer') return entry.kind === 'cardio'
                if (currentType === 'dehnung') return entry.kind === 'mobility'
                return entry.kind === 'strength'
            }
            return entry.kind === selectedExercise.kind
        })

        const byName = new Map(pool.map((entry) => [normalizeExerciseText(entry.name), entry]))
        const ordered: string[] = []

        const pushName = (name?: string | null) => {
            const candidate = String(name ?? '').trim()
            if (!candidate) return
            const normalized = normalizeExerciseText(candidate)
            if (!normalized || normalized === currentNeedle) return
            const match = byName.get(normalized)
            const resolved = match?.name ?? candidate
            if (!ordered.some((entry) => normalizeExerciseText(entry) === normalizeExerciseText(resolved))) {
                ordered.push(resolved)
            }
        }

        for (const substitution of selectedExercise?.substitutions ?? []) pushName(substitution)

        if (selectedExercise) {
            const related = pool
                .filter((entry) => normalizeExerciseText(entry.name) !== currentNeedle)
                .map((entry) => {
                    let score = 0
                    if (entry.movementPattern === selectedExercise.movementPattern) score += 18
                    if (entry.muscleGroup === selectedExercise.muscleGroup) score += 12
                    if (selectedExercise.secondaryMuscleGroups.includes(entry.muscleGroup)) score += 6
                    if (entry.secondaryMuscleGroups.includes(selectedExercise.muscleGroup)) score += 6
                    if (entry.equipment.some((item) => !selectedExercise.equipment.includes(item))) score += 8
                    if (entry.level === selectedExercise.level) score += 4
                    if (muscleNeedle) {
                        const primary = entry.muscleGroup.toLowerCase()
                        const secondary = entry.secondaryMuscleGroups.map((group) => group.toLowerCase())
                        if (primary.includes(muscleNeedle)) score += 24
                        if (secondary.some((group) => group.includes(muscleNeedle))) score += 12
                    }
                    return { name: entry.name, score }
                })
                .sort((a, b) => b.score - a.score)
                .slice(0, 12)

            for (const entry of related) pushName(entry.name)
        } else {
            const sortedPool = [...pool]
                .sort((a, b) => {
                    if (!muscleNeedle) return a.name.localeCompare(b.name, 'de')

                    const aPrimary = a.muscleGroup.toLowerCase().includes(muscleNeedle)
                    const bPrimary = b.muscleGroup.toLowerCase().includes(muscleNeedle)
                    if (aPrimary !== bPrimary) return aPrimary ? -1 : 1

                    const aSecondary = a.secondaryMuscleGroups.some((group) => group.toLowerCase().includes(muscleNeedle))
                    const bSecondary = b.secondaryMuscleGroups.some((group) => group.toLowerCase().includes(muscleNeedle))
                    if (aSecondary !== bSecondary) return aSecondary ? -1 : 1

                    return a.name.localeCompare(b.name, 'de')
                })
                .slice(0, 12)

            for (const entry of sortedPool) pushName(entry.name)
        }

        const currentReplacement = String(manualReplacementExercise.value ?? '').trim()
        if (currentReplacement) {
            pushName(currentReplacement)
        }

        return ordered
    })

    const mapGoalTypeToManualGoalLabel = (goalType: GoalType) => {
        if (goalType === 'strength') return 'Kraft'
        if (goalType === 'fat_loss') return 'Abnehmen'
        if (goalType === 'endurance') return 'Ausdauer'
        if (goalType === 'health' || goalType === 'general_fitness') return 'Gesundheit'
        return 'Muskelaufbau'
    }

    const EXERCISE_GUIDANCE_LABELS = {
        recovery: 'Pause:',
        tempo: 'Tempo:',
        equipment: 'Gerätenummer:',
        replacement: 'Ersatz:',
        replacementReason: 'Ersatzgrund:',
    } as const

    const parseExerciseGuidance = (rawNotes?: string | null) => {
        const notes = String(rawNotes ?? '').trim()
        if (!notes) {
            return {
                notes: undefined,
                setsOverride: undefined,
                repsOverride: undefined,
                recoveryHint: undefined,
                tempoHint: undefined,
                equipmentNumber: undefined,
                replacementExercise: undefined,
                replacementReason: undefined,
            }
        }

        let setsOverride: string | undefined
        let repsOverride: string | undefined
        let recoveryHint: string | undefined
        let tempoHint: string | undefined
        let equipmentNumber: string | undefined
        let replacementExercise: string | undefined
        let replacementReason: string | undefined
        const freeLines: string[] = []

        for (const rawLine of notes.split(/\r?\n/)) {
            const line = rawLine.trim()
            if (!line) continue

            if (/^Sätze:\s*/i.test(line)) {
                setsOverride = line.replace(/^Sätze:\s*/i, '').trim() || undefined
                continue
            }
            if (/^Wiederholungen:\s*/i.test(line)) {
                repsOverride = line.replace(/^Wiederholungen:\s*/i, '').trim() || undefined
                continue
            }
            if (/^(Pause|Recovery):\s*/i.test(line)) {
                recoveryHint = line.replace(/^(Pause|Recovery):\s*/i, '').trim() || undefined
                continue
            }
            if (/^Tempo:\s*/i.test(line)) {
                tempoHint = line.replace(/^Tempo:\s*/i, '').trim() || undefined
                continue
            }
            if (/^Atmung:\s*/i.test(line)) {
                freeLines.push(line)
                continue
            }
            if (/^(Gerätenummer|Geraetenummer):\s*/i.test(line)) {
                equipmentNumber = line.replace(/^(Gerätenummer|Geraetenummer):\s*/i, '').trim() || undefined
                continue
            }
            if (/^Ersatz:\s*/i.test(line)) {
                replacementExercise = line.replace(/^Ersatz:\s*/i, '').trim() || undefined
                continue
            }
            if (/^Ersatzgrund:\s*/i.test(line)) {
                replacementReason = line.replace(/^Ersatzgrund:\s*/i, '').trim() || undefined
                continue
            }

            freeLines.push(line)
        }

        return {
            notes: freeLines.join('\n') || undefined,
            setsOverride,
            repsOverride,
            recoveryHint,
            tempoHint,
            equipmentNumber,
            replacementExercise,
            replacementReason,
        }
    }

    const composeExerciseNotes = (exercise: PlanExercise) => {
        const lines: string[] = []
        const note = String(exercise.notes ?? '').trim()
        const recoveryHint = String(exercise.recoveryHint ?? '').trim()
        const tempoHint = String(exercise.tempoHint ?? '').trim()
        const equipmentNumber = String(exercise.equipmentNumber ?? '').trim()
        const replacementExercise = String(exercise.replacementExercise ?? '').trim()
        const replacementReason = String(exercise.replacementReason ?? '').trim()
        const complaintReason = String(exercise.complaintAdjustmentReason ?? '').trim()
        const recommendationLabel = String(exercise.recommendationLabel ?? '').trim()
        const recommendationPauseMatch = recommendationLabel.match(/(\d+(?:-\d+)?)\s*s\s*Pause/i)
        const recommendationPause = recommendationPauseMatch?.[1]?.trim()

        if (note) lines.push(note)
        if (typeof exercise.sets === 'string' && exercise.type !== 'ausdauer') lines.push(`Sätze: ${exercise.sets}`)
        if (typeof exercise.reps === 'string' && exercise.type !== 'ausdauer') lines.push(`Wiederholungen: ${exercise.reps}`)
        if (recoveryHint) lines.push(`${EXERCISE_GUIDANCE_LABELS.recovery} ${recoveryHint}`)
        else if (recommendationPause) lines.push(`${EXERCISE_GUIDANCE_LABELS.recovery} ${recommendationPause} Sek`)
        if (tempoHint) lines.push(`${EXERCISE_GUIDANCE_LABELS.tempo} ${tempoHint}`)
        if (equipmentNumber) lines.push(`${EXERCISE_GUIDANCE_LABELS.equipment} ${equipmentNumber}`)
        if (replacementExercise) lines.push(`${EXERCISE_GUIDANCE_LABELS.replacement} ${replacementExercise}`)
        if (replacementReason) lines.push(`${EXERCISE_GUIDANCE_LABELS.replacementReason} ${replacementReason}`)
        if (complaintReason) lines.push(complaintReason)

        return lines.join('\n') || null
    }

    const applyManualPrescriptionHint = (force = false) => {
        const hint = manualPrescriptionHint.value
        if (!hint) return

        if (force) {
            selectedGoal.value = mapGoalTypeToManualGoalLabel(manualGoalType.value)
            manualRecovery.value = hint.restLabel
        }

        if (trainingType.value === 'ausdauer') {
            if (force || newDuration.value == null) newDuration.value = hint.exact.durationMin ?? newDuration.value
            return
        }

        if (force || newSets.value == null) newSets.value = hint.exact.sets ?? newSets.value
        if (force || newReps.value == null) newReps.value = hint.exact.reps ?? newReps.value
    }

    watch(
        [manualPrescriptionHint, trainingType],
        ([hint, currentType], [prevHint]) => {
            if (!hint) return
            if (currentType === 'ausdauer') {
                if (newDuration.value == null || newDuration.value === prevHint?.exact.durationMin) {
                    newDuration.value = hint.exact.durationMin ?? newDuration.value
                }
                return
            }

            if (newSets.value == null || newSets.value === prevHint?.exact.sets) {
                newSets.value = hint.exact.sets ?? newSets.value
            }
            if (newReps.value == null || newReps.value === prevHint?.exact.reps) {
                newReps.value = hint.exact.reps ?? newReps.value
            }
        },
        { immediate: true }
    )

    const formatPlanExerciseMeta = (exercise: PlanExercise) => {
        const parts: string[] = []
        if (exercise.recommendationLabel) parts.push(exercise.recommendationLabel)
        if (exercise.notes) parts.push(exercise.notes)
        const hasPauseInRecommendation = /pause/i.test(exercise.recommendationLabel ?? '')
        if (exercise.recoveryHint) parts.push(`Pause: ${exercise.recoveryHint}`)
        else if (exercise.restSeconds && !hasPauseInRecommendation) parts.push(`${exercise.restSeconds}s Pause`)
        if (exercise.tempoHint) parts.push(`Tempo: ${exercise.tempoHint}`)
        return parts.join(' · ')
    }

    const formatExerciseNumber = (exercise: PlanExercise) => {
        const value = String(exercise.equipmentNumber ?? '').trim()
        return value || '—'
    }

    const hasEquipmentNumbers = (exercises: PlanExercise[]) =>
        exercises.some((exercise) => String(exercise.equipmentNumber ?? '').trim().length > 0)

    const previewHasEquipmentNumbers = computed(() => hasEquipmentNumbers(selectedPlanExercises.value))
    const activePreviewColWidths = computed(() => previewColWidths.value)

    watch(
        previewHasEquipmentNumbers,
        (hasNumbers) => {
            previewColWidths.value = hasNumbers
                ? [...PREVIEW_COLS_WITH_NUMBER]
                : [...PREVIEW_COLS_WITHOUT_NUMBER]
        },
        { immediate: true }
    )


    // ===== Safe v-models (1:1) =====
    const cardioExerciseSafe = computed({
        get: () => cardioExercise.value,
        set: (val) => { if (!val) return; cardioExercise.value = val },
    })

    const trainingTypeSafe = computed({
        get: () => trainingType.value,
        set: (val) => { if (!val) return; trainingType.value = val },
    })

    watch(
        trainingType,
        (nextType, prevType) => {
            if (nextType === prevType || builderMode.value !== 'manual') return
            nextTick(() => {
                const fallbackSource =
                    pendingTrainingTypeSourceEl ??
                    builderSection.value?.querySelector<HTMLElement>('.type-block.mobile-only, .type-block.desktop-only .segmented.seg-type .on') ??
                    null
                triggerBuilderDataStream(fallbackSource, [...BUILDER_REFLOW_SELECTORS, ...buildDataStreamSelectorsForType(nextType)], 'reflow')
                pendingTrainingTypeSourceEl = null
            })
        }
    )

    const BUILDER_REFLOW_SELECTORS = [
        '.builder-head',
        '.field-block',
        '.field-grid',
        '.smart-rx-card',
        '.actions-row.stack',
        '.builder-submit-row',
    ] as const

    const findVisibleBuilderTargets = (selectors: readonly string[]) => {
        const scope = builderSection.value
        if (!scope) return [] as HTMLElement[]

        const seen = new Set<HTMLElement>()
        const targets: HTMLElement[] = []

        for (const selector of selectors) {
            const nodes = Array.from(scope.querySelectorAll<HTMLElement>(selector))
            for (const node of nodes) {
                const visualTarget =
                    node.closest('.field, .field-block, .field-row, .builder-head, .builder-submit-row') as HTMLElement | null
                    ?? node
                const targetNode = visualTarget
                if (!node.isConnected) continue
                if (seen.has(targetNode)) continue
                const rect = targetNode.getBoundingClientRect()
                if (rect.width < 8 || rect.height < 8) continue
                if (window.getComputedStyle(targetNode).display === 'none') continue
                seen.add(targetNode)
                targets.push(targetNode)
            }
        }

        return targets
    }

    const pulseBuilderTargets = (targets: HTMLElement[], mode: 'stream' | 'reflow' = 'stream') => {
        const className = mode === 'reflow'
            ? 'builder-stream-target--reflow'
            : 'builder-stream-target--active'

        targets.forEach((target) => {
            target.classList.remove('builder-stream-target--active', 'builder-stream-target--reflow')
            void target.offsetWidth
            target.classList.add(className)
            window.setTimeout(() => target.classList.remove(className), mode === 'reflow' ? 780 : 700)
        })
    }

    const pulseBuilderSource = (sourceEl: HTMLElement | null) => {
        if (!sourceEl) return
        const target =
            sourceEl.closest('tr, .segmented button, .type-block, .preview-card') as HTMLElement | null
            ?? sourceEl
        target.classList.remove('builder-stream-source--active')
        void target.offsetWidth
        target.classList.add('builder-stream-source--active')
        window.setTimeout(() => target.classList.remove('builder-stream-source--active'), 760)
    }

    const buildDataStreamSelectorsForType = (type: ExerciseType) => {
        const common = [
            '#exercise-filter',
            '.exercise-select-trigger',
            '.field-block:has(#manual-note)',
            '.builder-submit-row',
        ]

        if (type === 'ausdauer') {
            return [
                ...common,
                '#training-type',
                '#cardio-duration',
                '#cardio-distance',
                '.field-block:has(#training-type)',
            ]
        }

        if (type === 'dehnung') {
            return [
                ...common,
                '#stretch-holds',
                '#stretch-seconds',
                '.field-grid:has(#stretch-holds)',
            ]
        }

        return [
            ...common,
            '#strength-sets',
            '#strength-reps',
            '.field-grid:has(#strength-sets)',
        ]
    }

    const triggerBuilderDataStream = (
        sourceEl: HTMLElement | null,
        targetSelectors: readonly string[],
        mode: 'stream' | 'reflow' = 'stream'
    ) => {
        const scope = builderSection.value
        if (!scope) return

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const targets = findVisibleBuilderTargets(targetSelectors)
        pulseBuilderTargets(targets, mode)
        pulseBuilderSource(sourceEl)

        if (prefersReduced || !targets.length) return

        const rootRect = scope.getBoundingClientRect()
        const fallbackRect = scope.querySelector<HTMLElement>('.builder-head')?.getBoundingClientRect() ?? rootRect
        const sourceRect = sourceEl?.getBoundingClientRect() ?? fallbackRect
        const startX = sourceRect.left + sourceRect.width / 2 - rootRect.left
        const startY = sourceRect.top + sourceRect.height / 2 - rootRect.top

        const lines = targets.slice(0, 6).map((target, index) => {
            const rect = target.getBoundingClientRect()
            const endX = rect.left + rect.width / 2 - rootRect.left
            const endY = rect.top + rect.height / 2 - rootRect.top
            const dx = endX - startX
            const dy = endY - startY
            const length = Math.max(24, Math.sqrt(dx * dx + dy * dy))
            const angle = Math.atan2(dy, dx) * 180 / Math.PI

            return {
                id: `line-${index}-${builderDataStream.value.seq + 1}`,
                style: {
                    left: `${startX}px`,
                    top: `${startY}px`,
                    width: `${length}px`,
                    transform: `rotate(${angle}deg)`,
                    '--stream-length': `${Math.max(0, length - 14)}px`,
                    '--stream-delay': `${index * 60}ms`,
                } as Record<string, string>,
            }
        })

        const pulses = targets.slice(0, 6).map((target, index) => {
            const rect = target.getBoundingClientRect()
            return {
                id: `pulse-${index}-${builderDataStream.value.seq + 1}`,
                style: {
                    left: `${rect.left + rect.width / 2 - rootRect.left}px`,
                    top: `${rect.top + rect.height / 2 - rootRect.top}px`,
                    '--stream-delay': `${120 + index * 70}ms`,
                } as Record<string, string>,
            }
        })

        if (builderDataStreamTimer) clearTimeout(builderDataStreamTimer)
        builderDataStream.value = {
            visible: true,
            seq: builderDataStream.value.seq + 1,
            lines,
            pulses,
        }

        builderDataStreamTimer = window.setTimeout(() => {
            builderDataStream.value = {
                visible: false,
                seq: builderDataStream.value.seq,
                lines: [],
                pulses: [],
            }
            builderDataStreamTimer = null
        }, 980)
    }

    const selectedGoalSafe = computed({
        get: () => selectedGoal.value,
        set: (val) => { selectedGoal.value = String(val ?? '').trim() },
    })

    const newSetsText = computed({
        get: () => (newSets.value == null ? '' : String(newSets.value)),
        set: (val) => { newSets.value = normalizeRangeCapableInput(val) },
    })

    const newRepsText = computed({
        get: () => (newReps.value == null ? '' : String(newReps.value)),
        set: (val) => { newReps.value = normalizeRangeCapableInput(val) },
    })

    const toggleExtras = () => {
        showExtras.value = !showExtras.value
    }

    const handleTrainingTypeClick = (nextType: ExerciseType, event?: MouseEvent) => {
        if (trainingType.value === nextType) return
        pendingTrainingTypeSourceEl = event?.currentTarget instanceof HTMLElement
            ? event.currentTarget
            : null
        trainingType.value = nextType
    }

    const openManualExerciseLibrary = () => {
        showManualExerciseLibrary.value = true
        builderFormErrors.exercise = ''
        builderFormErrors.cardioExercise = ''
    }

    const toggleCustomExerciseMode = () => {
        if (newExercise.value === 'custom') {
            newExercise.value = ''
            customPlanExercise.value = ''
            return
        }
        showManualExerciseLibrary.value = false
        newExercise.value = 'custom'
        customPlanExercise.value = ''
        builderFormErrors.exercise = ''
        builderFormErrors.customExercise = ''
        builderFormErrors.customExerciseMuscle = ''
    }

    const applyManualExerciseSelection = (selection: { id: string; name: string }) => {
        showManualExerciseLibrary.value = false
        if (trainingType.value === 'ausdauer') {
            cardioExercise.value = selection.name
            builderFormErrors.cardioExercise = ''
            return
        }
        newExercise.value = selection.name
        customPlanExercise.value = ''
        builderFormErrors.exercise = ''
        builderFormErrors.customExercise = ''
    }

    const openReplacementExerciseLibrary = () => {
        if (!manualReplacementExerciseIds.value.length) return
        showReplacementExerciseLibrary.value = true
    }

    const applyReplacementExerciseSelection = (selection: { id: string; name: string }) => {
        showReplacementExerciseLibrary.value = false
        manualReplacementExercise.value = selection.name
    }

    const clearReplacementExercise = () => {
        manualReplacementExercise.value = ''
    }

    const loadPreviewExerciseIntoForm = async (index: number, event?: MouseEvent) => {
        if (!editingPlanId.value || builderMode.value !== 'manual') return

        const exercise = selectedPlanExercises.value[index]
        if (!exercise) return

        const nextType = exercise.type ?? trainingType.value

        trainingType.value = nextType
        selectedGoal.value = String(exercise.goal ?? '').trim()
        manualRecovery.value = exercise.recoveryHint ?? ''
        manualTempo.value = exercise.tempoHint ?? ''
        manualEquipmentNumber.value = exercise.equipmentNumber ?? ''
        manualNote.value = exercise.notes ?? ''
        manualReplacementExercise.value = exercise.replacementExercise ?? ''
        builderFormErrors.exercise = ''
        builderFormErrors.customExercise = ''
        builderFormErrors.customExerciseMuscle = ''
        builderFormErrors.cardioExercise = ''
        builderFormErrors.sets = ''
        builderFormErrors.reps = ''
        builderFormErrors.duration = ''
        builderFormErrors.distance = ''

        if (nextType === 'ausdauer') {
            cardioExercise.value = exercise.exercise
            newExercise.value = ''
            customPlanExercise.value = ''
            newSets.value = null
            newReps.value = null
            newDuration.value = typeof exercise.durationMin === 'number'
                ? exercise.durationMin
                : (typeof exercise.sets === 'number' ? exercise.sets : Number(exercise.sets) || null)
            newDistance.value = typeof exercise.distanceKm === 'number'
                ? exercise.distanceKm
                : (typeof exercise.reps === 'number' ? exercise.reps : Number(exercise.reps) || null)
        } else {
            const libraryExercise = findLibraryExerciseByName(exercise.exercise)
            newExercise.value = libraryExercise?.name ?? 'custom'
            customPlanExercise.value = libraryExercise ? '' : exercise.exercise
            cardioExercise.value = ''
            newDuration.value = null
            newDistance.value = null
            newSets.value = exercise.sets
            newReps.value = exercise.reps
            if (!exerciseFilter.value.trim() && libraryExercise?.muscleGroup) {
                exerciseFilter.value = libraryExercise.muscleGroup
            }
        }

        generatedAutoPlans.value = []
        pendingAutoGeneratedPlans.value = []
        await nextTick()
        await scrollBuilderIntoViewForAnimation()
        triggerBuilderDataStream(
            event?.currentTarget instanceof HTMLElement ? event.currentTarget : null,
            buildDataStreamSelectorsForType(nextType),
            'stream'
        )
        props.addToast('Übung ins Formular geladen', 'save')
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

    const resetBuilderFormErrors = () => {
        Object.assign(builderFormErrors, createBuilderFormErrors())
    }

    const validateBuilderFields = (context: 'add' | 'generate' | 'save'): boolean => {
        resetBuilderFormErrors()

        if (builderMode.value === 'manual') {
            if (context === 'add') {
                if (trainingType.value === 'ausdauer') {
                    if (!cardioExercise.value) builderFormErrors.cardioExercise = 'Cardio-Art wählen'
                    builderFormErrors.duration = validateDurationMin(newDuration.value) ?? ''
                    builderFormErrors.distance = validateDistanceKm(newDistance.value) ?? ''
                } else {
                    const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value
                    if (!exerciseToAdd) builderFormErrors.exercise = 'Übung auswählen oder benutzerdefinierte Übung eingeben'
                    else if (selectedPlanExercises.value.some((ex) => ex.exercise.toLowerCase() === exerciseToAdd.toLowerCase())) {
                        builderFormErrors.exercise = 'Übung bereits im Plan vorhanden'
                    }

                    builderFormErrors.sets = validateSets(newSets.value) ?? ''
                    builderFormErrors.reps = validateReps(newReps.value) ?? ''

                    if (newExercise.value === 'custom' && customPlanExercise.value) {
                        const muscleGroup = exerciseFilter.value || ''
                        const validated = validateCustomExercise(customPlanExercise.value, muscleGroup, trainingType.value)
                        if (typeof validated === 'string') {
                            if (validated === 'Muskelgruppe ist erforderlich') builderFormErrors.customExerciseMuscle = validated
                            else builderFormErrors.customExercise = validated
                        }
                    }
                }
            }

            if (context === 'save') {
                const validatedPlanName = validatePlanName(planName.value)
                if (validatedPlanName === false) {
                    builderFormErrors.planName = planName.value.trim().length < 3
                        ? 'Planname muss mindestens 3 Zeichen lang sein'
                        : 'Planname darf maximal 20 Zeichen lang sein'
                }
                if (!hasExercisesToSave.value) builderFormErrors.exercises = 'Mindestens eine Übung ist erforderlich'
            }
        }

        if (builderMode.value === 'auto') {
            if (!autoPrimaryGoal.value) builderFormErrors.autoPrimaryGoal = 'Primärziel auswählen'
            if (!Number.isFinite(autoWeeklyFrequency.value) || autoWeeklyFrequency.value == null) {
                builderFormErrors.autoWeeklyFrequency = 'Training pro Woche auswählen'
            }
            if (!Number.isFinite(autoSessionDuration.value) || autoSessionDuration.value == null) {
                builderFormErrors.autoSessionDuration = 'Min pro Training auswählen'
            }

            const conflictingExercises = getConflictingAutoExerciseRefs()
            if (conflictingExercises.length) {
                const labels = conflictingExercises
                    .map((entry) => entry.label || entry.canonicalName)
                    .filter(Boolean)
                builderFormErrors.autoGeneral = `Dieselbe Übung kann nicht gleichzeitig bevorzugt und ausgeschlossen sein: ${labels.join(', ')}.`
            }

            const totalPreferenceWeight = getAutoPreferenceWeightTotal()
            if ((context === 'generate' || context === 'save') && totalPreferenceWeight > 100) {
                builderFormErrors.autoPreferenceWeights = `Die Summe aus Maschinenfokus, Freihantelfokus und Gelenkschonend darf zusammen maximal 100% sein. Aktuell: ${totalPreferenceWeight}%.`
            }

            if (context === 'save') {
                if (editingPlanId.value) {
                    const validatedPlanName = validatePlanName(planName.value)
                    if (validatedPlanName === false) {
                        builderFormErrors.planName = planName.value.trim().length < 3
                            ? 'Planname muss mindestens 3 Zeichen lang sein'
                            : 'Planname darf maximal 20 Zeichen lang sein'
                    }
                } else if (generatedAutoPlans.value.length > 0) {
                    builderFormErrors.autoPlanNames = generatedAutoPlans.value.map((plan) => {
                        const validated = validatePlanName(plan.name)
                        if (validated !== false) return ''
                        return plan.name.trim().length < 3
                            ? 'Planname muss mindestens 3 Zeichen lang sein'
                            : 'Planname darf maximal 20 Zeichen lang sein'
                    })
                }

                if (!hasExercisesToSave.value) builderFormErrors.exercises = 'Mindestens eine Übung ist erforderlich'
            }
        }

        return !builderFormErrors.planName &&
            !builderFormErrors.selectedGoal &&
            !builderFormErrors.exercise &&
            !builderFormErrors.customExercise &&
            !builderFormErrors.cardioExercise &&
            !builderFormErrors.sets &&
            !builderFormErrors.reps &&
            !builderFormErrors.duration &&
            !builderFormErrors.distance &&
            !builderFormErrors.exercises &&
            !builderFormErrors.autoPrimaryGoal &&
            !builderFormErrors.autoWeeklyFrequency &&
            !builderFormErrors.autoSessionDuration &&
            !builderFormErrors.autoPreferenceWeights &&
            !builderFormErrors.autoGeneral &&
            !builderFormErrors.general &&
            !builderFormErrors.autoPlanNames.some(Boolean)
    }


    // ===== DTO flatten / mapping (aus deinem Code) =====
    const toPlanExercise = (ex: any): PlanExercise => {
        const guidance = parseExerciseGuidance(ex.notes)

        return {
            exercise: ex.name,
            sets: ex.category === 3 ? (ex.durationMin ?? ex.sets ?? 0) : (guidance.setsOverride ?? ex.sets ?? 0),
            reps: ex.category === 3 ? Math.round(ex.distanceKm ?? 0) : (guidance.repsOverride ?? ex.reps ?? 0),
            type: (ex.category === 3 ? "ausdauer" : ex.category === 2 ? "dehnung" : ex.category === 1 ? "calisthenics" : "kraft"),
            restSeconds: ex.restSeconds ?? null,
            durationMin: ex.durationMin ?? null,
            distanceKm: ex.distanceKm ?? null,
            notes: guidance.notes,
            recoveryHint: guidance.recoveryHint,
            tempoHint: guidance.tempoHint,
            equipmentNumber: guidance.equipmentNumber,
            replacementExercise: guidance.replacementExercise,
            replacementReason: guidance.replacementReason,
            substitutions: Array.isArray(ex.substitutions) ? ex.substitutions.filter(Boolean) : [],
        }
    }

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
            sets: ex.type === "ausdauer" ? null : (parseRangeCapableNumber(ex.sets) ?? null),
            reps: ex.type === "ausdauer" ? null : (parseRangeCapableNumber(ex.reps) ?? null),
            restSeconds: ex.restSeconds ?? null,
            durationMin: ex.type === "ausdauer" ? (ex.durationMin ?? parseRangeCapableNumber(ex.sets) ?? null) : (ex.durationMin ?? null),
            distanceKm: ex.type === "ausdauer" ? (ex.distanceKm ?? parseRangeCapableNumber(ex.reps) ?? null) : (ex.distanceKm ?? null),
            notes: composeExerciseNotes(ex),
        }))

    const isBuilderLandingActive = ref(false)

    const landingClass = () =>
        isBuilderLandingActive.value
            ? ['builder-landing-item', 'is-active']
            : ['builder-landing-item']

    const getGeneratedPlansToPersist = () => currentGeneratedPlansToPersist.value

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

    const cancelEditing = () => {
        resetBuilder()
    }

    function resetBuilder() {
        resetBuilderFormErrors()
        builderMode.value = 'manual'
        try {
            localStorage.setItem(TRAINING_BUILDER_MODE_KEY, 'manual')
        } catch { }
        planName.value = ""
        newExercise.value = ""
        customPlanExercise.value = ""
        exerciseFilter.value = ""
        showManualExerciseLibrary.value = false
        showReplacementExerciseLibrary.value = false

        newReps.value = null
        newSets.value = null
        newDuration.value = null
        newDistance.value = null

        selectedGoal.value = ""
        manualRecovery.value = ""
        manualTempo.value = ""
        manualEquipmentNumber.value = ""
        manualNote.value = ""
        manualReplacementExercise.value = ""
        manualDraftPlanName.value = ""
        manualDraftExercises.value = []
        selectedPlanExercises.value = []
        generatedAutoPlans.value = []
        pendingAutoGeneratedPlans.value = []
        editingPlanId.value = null
        cardioExercise.value = ''
        autoPlanNames.value = []
        autoMachineFocusWeight.value = 50
        autoFreeWeightFocusWeight.value = 50
        autoJointFriendlyWeight.value = 50
        autoIncludeSubstitutions.value = true
        autoPreferredExerciseRefs.value = []
        autoExcludedExerciseRefs.value = []
        autoReportedExerciseOverrides.value = []
        showAutoReportedExercises.value = false
        autoExcludedMuscles.value = []
        autoFocusMuscles.value = []
        autoExcludedMuscleDraft.value = ''
        autoFocusMuscleDraft.value = ''
        autoPrimaryGoal.value = ''
        autoWeeklyFrequency.value = null
        autoSessionDuration.value = null
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
            movePreviewTouch('.field-row-stack .exercise-select-trigger', 0.5, 0.5)
        })

        queuePreviewBuilderStep(3920, () => {
            openManualExerciseLibrary()
        })

        queuePreviewBuilderStep(5120, () => {
            const firstStrengthExercise =
                filteredExercises.value
                    .map(option => typeof option === 'string' ? option : String((option as any)?.value ?? ''))
                    .find(option => option.trim() && option !== 'custom')

            if (firstStrengthExercise) {
                applyManualExerciseSelection({ id: '', name: String(firstStrengthExercise) })
            }
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
        pendingAutoGeneratedPlans.value = []
        if (!validateBuilderFields('add')) return

        if (trainingType.value === 'ausdauer' || trainingType.value === 'kraft' || trainingType.value === 'calisthenics') {
            triggerCardioRunner()
        }

        const hint = manualPrescriptionHint.value

        if (isPhonePreviewBuilderDemo.value) {
            const previewExercise =
                String(newExercise.value || filteredExercises.value[0] || '').trim()

            if (!previewExercise) return

            selectedPlanExercises.value.push({
                exercise: previewExercise,
                sets: Number(newSets.value ?? hint?.exact.sets ?? 4),
                reps: Number(newReps.value ?? hint?.exact.reps ?? 10),
                goal: selectedGoal.value || undefined,
                type: trainingType.value,
                restSeconds: hint?.exact.restSeconds ?? null,
                notes: manualNote.value.trim() || undefined,
                recommendationLabel: hint?.recommendationLabel,
                recoveryHint: manualRecovery.value.trim() || undefined,
                tempoHint: manualTempo.value.trim() || undefined,
                equipmentNumber: manualEquipmentNumber.value.trim() || undefined,
                replacementExercise: manualReplacementExercise.value.trim() || undefined,
            })
            return
        }

        if (trainingType.value === 'ausdauer') {
            selectedPlanExercises.value.push({
                exercise: cardioExercise.value,
                sets: newDuration.value!,
                reps: newDistance.value ? Number(newDistance.value) : 0,
                goal: selectedGoal.value || undefined,
                type: 'ausdauer',
                durationMin: newDuration.value!,
                distanceKm: newDistance.value ? Number(newDistance.value) : null,
                restSeconds: 0,
                notes: manualNote.value.trim() || undefined,
                recommendationLabel: hint?.recommendationLabel,
                recoveryHint: manualRecovery.value.trim() || undefined,
                tempoHint: manualTempo.value.trim() || undefined,
                equipmentNumber: manualEquipmentNumber.value.trim() || undefined,
                replacementExercise: manualReplacementExercise.value.trim() || undefined,
            })
            props.addToast('Cardio hinzugefügt', 'add')
            cardioExercise.value = ''
            manualRecovery.value = ''
            manualTempo.value = ''
            manualEquipmentNumber.value = ''
            manualNote.value = ''
            manualReplacementExercise.value = ''
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
                if (validated === 'Muskelgruppe ist erforderlich') builderFormErrors.customExerciseMuscle = validated
                else builderFormErrors.customExercise = validated
                return
            }
        }

        selectedPlanExercises.value.push({
            exercise: exerciseToAdd,
            sets: newSets.value!,
            reps: newReps.value!,
            goal: selectedGoal.value || undefined,
            type: trainingType.value,
            restSeconds: hint?.exact.restSeconds ?? null,
            notes: manualNote.value.trim() || undefined,
            recommendationLabel: hint?.recommendationLabel,
            focusLabel: hint?.focusLabel,
            recoveryHint: manualRecovery.value.trim() || undefined,
            tempoHint: manualTempo.value.trim() || undefined,
            equipmentNumber: manualEquipmentNumber.value.trim() || undefined,
            replacementExercise: manualReplacementExercise.value.trim() || undefined,
        })

        props.addToast('Übung hinzugefügt', 'add')

        newExercise.value = ''
        customPlanExercise.value = ''
        exerciseFilter.value = ''
        manualRecovery.value = ''
        manualTempo.value = ''
        manualEquipmentNumber.value = ''
        manualNote.value = ''
        manualReplacementExercise.value = ''
    }

    const removeExerciseFromPlan = (index: number) => {
        generatedAutoPlans.value = []
        pendingAutoGeneratedPlans.value = []
        if (index < 0 || index >= selectedPlanExercises.value.length) {
            props.addToast('Ungültiger Übungsindex', 'delete')
            return
        }

        const doDelete = () => {
            selectedPlanExercises.value.splice(index, 1)
            props.addToast('Übung gelöscht', 'delete')
        }

        if (editingPlanId.value) {
            doDelete()
            return
        }

        // ? wenn Parent Confirm anbietet ? nutzen
        if (props.openDeletePopup) {
            props.openDeletePopup(doDelete)
            return
        }

        // fallback: direkt löschen
        doDelete()
    }

    const moveExerciseInPlan = (index: number, direction: -1 | 1) => {
        generatedAutoPlans.value = []
        pendingAutoGeneratedPlans.value = []
        const targetIndex = index + direction

        if (
            index < 0 ||
            index >= selectedPlanExercises.value.length ||
            targetIndex < 0 ||
            targetIndex >= selectedPlanExercises.value.length
        ) {
            return
        }

        const reordered = [...selectedPlanExercises.value]
        const [exercise] = reordered.splice(index, 1)
        reordered.splice(targetIndex, 0, exercise)
        selectedPlanExercises.value = reordered
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
        const generatedPlansToPersist = currentGeneratedPlansToPersist.value
        const manualExercisesToSave = currentExercisesToSave.value
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
            if (!validateBuilderFields('save')) return

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
            } else if (editingPlanId.value) {
                const updatedPlanId = editingPlanId.value
                const beforeExercises = clonePlanExercises(editOriginExercisesSnapshot.value)
                const afterExercises = clonePlanExercises(manualExercisesToSave)
                const beforeName = editOriginPlanName.value || planName.value
                const afterName = effectiveValidatedPlanName as string
                const shouldAnimatePlanMorph =
                    beforeName.trim() !== afterName.trim() ||
                    havePlanExercisesChanged(beforeExercises, afterExercises)

                props.onGuestPlanCreated?.({
                    id: updatedPlanId,
                    name: afterName,
                    isFavorite: false,
                    exercises: [...manualExercisesToSave],
                    exerciseCount: manualExercisesToSave.length,
                })

                if (shouldAnimatePlanMorph) {
                    emit('plan-updated-with-exercise-changes', {
                        planId: updatedPlanId,
                        oldName: beforeName,
                        newName: afterName,
                        beforeExercises,
                        afterExercises,
                    })
                }
            } else {
                const id = createGuestId()
                props.onGuestPlanCreated?.({
                    id,
                    name: effectiveValidatedPlanName as string,
                    isFavorite: false,
                    exercises: [...(autoSinglePlan?.exercises ?? manualExercisesToSave)],
                    exerciseCount: (autoSinglePlan?.exercises ?? manualExercisesToSave).length,
                })

                emit('plan-created', { id, name: effectiveValidatedPlanName as string })
            }

            await auth.setHasCreatedTrainingPlan?.()
            resetBuilder()
            return
        }

        if (editingPlanId.value && builderMode.value === 'auto' && generatedPlansToPersist.length > 1) {
            builderFormErrors.general = 'Mehrere Auto-Pläne können nicht in einen bestehenden Einzelplan gespeichert werden. Bitte erstelle sie als neue Pläne.'
            return
        }

        if (!validateBuilderFields('save')) return

        if (!autoSinglePlan && !isAutoMultiCreate && isNameTaken(effectiveValidatedPlanName as string, editingPlanId.value)) {
            builderFormErrors.planName = 'Planname bereits vergeben. Bitte wähle einen anderen Namen.'
            return
        }

        try {
            if (editingPlanId.value) {
                const updatedPlanId = editingPlanId.value
                const beforeExercises = clonePlanExercises(editOriginExercisesSnapshot.value)
                const afterExercises = clonePlanExercises(manualExercisesToSave)
                const beforeName = editOriginPlanName.value || planName.value
                const afterName = validatedPlanName as string
                const shouldAnimatePlanMorph =
                    beforeName.trim() !== afterName.trim() ||
                    havePlanExercisesChanged(beforeExercises, afterExercises)
                const updated = await trainingPlansStore.update(
                    updatedPlanId,
                    toUpsertPayload(afterName, manualExercisesToSave)
                )
                void updated
                if (shouldAnimatePlanMorph) {
                    emit('plan-updated-with-exercise-changes', {
                        planId: updatedPlanId,
                        oldName: beforeName,
                        newName: afterName,
                        beforeExercises,
                        afterExercises,
                    })
                }
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
                        autoSinglePlan?.exercises ?? manualExercisesToSave,
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
                builderFormErrors.planName = 'Planname bereits vergeben. Bitte wähle einen anderen Namen.'
                return
            }

            if (status === 409) {
                builderFormErrors.planName = 'Planname bereits vergeben. Bitte wähle einen anderen Namen.'
                return
            }

            builderFormErrors.general = 'Speichern fehlgeschlagen. Bitte versuch’s nochmal.'
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

        const MIN_PX_BY_COL = previewHasEquipmentNumbers.value
            ? [54, 16, 16, 16, 44]
            : [16, 16, 16, 44]
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

    let metaLineRO: ResizeObserver | null = null

    function applyExerciseMetaMarqueeState(line: HTMLElement) {
        const track = line.querySelector('.exercise-meta-track') as HTMLElement | null
        const marquee = line.querySelector('.exercise-meta-marquee') as HTMLElement | null
        const divider = line.querySelector('.exercise-meta-divider') as HTMLElement | null
        if (!track || !marquee) return

        const overflow = Math.max(marquee.scrollWidth - line.clientWidth, 0)
        const dividerWidth = divider?.getBoundingClientRect().width ?? 0
        const gap = 16
        const viewportWidth = window.innerWidth || 0
        const isAutoPreviewLine = line.classList.contains('exercise-meta-line--auto')
        const forceAnimate = isAutoPreviewLine && viewportWidth <= 1080 && marquee.scrollWidth > 0
        line.style.setProperty('--meta-loop', `${marquee.scrollWidth + dividerWidth + gap}px`)
        line.classList.toggle('is-animated', forceAnimate || overflow > 8)
    }

    function setupExerciseMetaMarquees() {
        metaLineRO?.disconnect()
        metaLineRO = new ResizeObserver((entries) => {
            entries.forEach(entry => applyExerciseMetaMarqueeState(entry.target as HTMLElement))
        })

        const scope = builderSection.value
        if (!scope) return

        const lines = Array.from(scope.querySelectorAll('.exercise-meta-line')) as HTMLElement[]
        lines.forEach(line => {
            applyExerciseMetaMarqueeState(line)
            metaLineRO?.observe(line)
        })
    }

    function teardownExerciseMetaMarquees() {
        metaLineRO?.disconnect()
        metaLineRO = null
    }

    watch(
        [selectedPlanExercises, generatedAutoPlans, builderMode],
        () => {
            nextTick(() => {
                try {
                    initPreviewResizeTable()
                    setupHeaderShorteningFallback()
                    setupExerciseMetaMarquees()
                } catch (err) {
                    console.error('[TrainingPlanBuilder] preview init crashed:', err)
                }
            })
        },
        { deep: true }
    )

    onMounted(() => {
        try {
            const persistedBuilderMode = localStorage.getItem(TRAINING_BUILDER_MODE_KEY)
            if (persistedBuilderMode === 'auto') {
                builderMode.value = 'auto'
            }
        } catch { }
        void exerciseLibraryStore.load()
        nextTick(() => {
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            if (prefersReduced) return
            isBuilderLandingActive.value = false
            void document.body.offsetWidth
            isBuilderLandingActive.value = true
            window.setTimeout(() => {
                isBuilderLandingActive.value = false
            }, 1200)
        })
        nextTick(() => {
            try {
                initPreviewResizeTable()
                setupHeaderShorteningFallback()
                setupExerciseMetaMarquees()
            } catch (err) {
                console.error('[TrainingPlanBuilder] onMounted init crashed:', err)
            }
        })
        nextTick(() => {
            measureModeSwitch()
            if (!modeSwitchTrack.value || typeof ResizeObserver === 'undefined') return
            modeSwitchResizeObserver = new ResizeObserver(() => {
                measureModeSwitch()
            })
            modeSwitchResizeObserver.observe(modeSwitchTrack.value)
        })
        hasDismissedModeSwipeHint.value = false
        restartModeSwipeHintCycle()
        queuePreviewBuilderStep(250, () => {
            startPreviewBuilderDemo()
        })
    })

    onActivated(() => {
        hasDismissedModeSwipeHint.value = false
        restartModeSwipeHintCycle()
    })

    onDeactivated(() => {
        restartModeSwipeHintCycle()
    })

    onUnmounted(() => {
        activeDragCleanup?.()
        activeDragCleanup = null
        cleanupModeSwitchPointerListeners()
        modeSwitchResizeObserver?.disconnect()
        modeSwitchResizeObserver = null
        clearAutoGenerationProgressTimer()
        clearPreviewBuilderTimers()
        clearCardioRunnerTimer()
        if (builderDataStreamTimer) clearTimeout(builderDataStreamTimer)
        teardownHeaderShorteningFallback()
        teardownExerciseMetaMarquees()
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

    .builder-data-stream-overlay {
        position: absolute;
        inset: 0;
        z-index: 14;
        pointer-events: none;
        overflow: hidden;
    }

    .builder-data-stream-line {
        position: absolute;
        height: 5px;
        transform-origin: 0 50%;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(250, 204, 21, 0), rgba(255, 215, 64, 1), rgba(253, 224, 71, 0.14));
        box-shadow: 0 0 22px rgba(250, 204, 21, 0.52), 0 0 42px rgba(250, 204, 21, 0.22);
        opacity: 0;
        animation: builder-data-stream-line 720ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        animation-delay: var(--stream-delay, 0ms);
    }

    .builder-data-stream-line__particle {
        position: absolute;
        left: 0;
        top: 50%;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255, 249, 196, 1) 0 28%, rgba(250, 204, 21, 0.88) 52%, rgba(250, 204, 21, 0) 76%);
        transform: translate(0, -50%) scale(.55);
        filter: drop-shadow(0 0 14px rgba(250, 204, 21, 0.6));
        opacity: 0;
        animation: builder-data-stream-particle 760ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        animation-delay: calc(var(--stream-delay, 0ms) + 90ms);
    }

    .builder-data-stream-line__particle--mid {
        animation-delay: calc(var(--stream-delay, 0ms) + 180ms);
    }

    .builder-data-stream-line__particle--late {
        animation-delay: calc(var(--stream-delay, 0ms) + 280ms);
    }

    .builder-data-stream-pulse {
        position: absolute;
        width: 92px;
        height: 92px;
        border-radius: 999px;
        transform: translate(-50%, -50%) scale(.2);
        background:
            radial-gradient(circle, rgba(255, 249, 196, 0.98) 0 12%, rgba(250, 204, 21, 0.52) 28%, rgba(250, 204, 21, 0.18) 48%, rgba(250, 204, 21, 0) 72%);
        opacity: 0;
        animation: builder-data-stream-pulse 720ms ease-out forwards;
        animation-delay: var(--stream-delay, 120ms);
    }

    .builder-stream-target--active,
    .builder-stream-target--reflow {
        position: relative;
        z-index: 1;
        overflow: visible;
    }

    .builder-stream-target--active {
        animation: builder-stream-target-pop 700ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
    }

    .builder-stream-target--reflow {
        animation: builder-stream-target-reflow 780ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .builder-stream-source--active {
        position: relative;
        z-index: 1;
        animation: builder-stream-source-flash 760ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
    }

    .builder-stream-overlay-fade-enter-active,
    .builder-stream-overlay-fade-leave-active {
        transition: opacity .18s ease;
    }

    .builder-stream-overlay-fade-enter-from,
    .builder-stream-overlay-fade-leave-to {
        opacity: 0;
    }

    @keyframes builder-data-stream-line {
        0% {
            opacity: 0;
            transform: scaleX(.12);
        }

        18% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: scaleX(1);
        }
    }

    @keyframes builder-data-stream-particle {
        0% {
            opacity: 0;
            transform: translate(0, -50%) scale(.45);
        }

        20% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: translate(var(--stream-length, 0px), -50%) scale(1.08);
        }
    }

    @keyframes builder-data-stream-pulse {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(.2);
        }

        24% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.2);
        }
    }

    @keyframes builder-stream-target-pop {
        0% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(250, 204, 21, 0);
            background-color: rgba(250, 204, 21, 0);
        }

        42% {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.28), 0 18px 34px rgba(250, 204, 21, 0.18);
            background-color: rgba(255, 248, 196, 0.34);
        }

        100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(250, 204, 21, 0);
            background-color: rgba(250, 204, 21, 0);
        }
    }

    @keyframes builder-stream-target-reflow {
        0% {
            opacity: .42;
            transform: translateY(10px) scale(.985);
            filter: saturate(.92);
        }

        55% {
            opacity: 1;
            transform: translateY(-2px) scale(1.01);
            filter: saturate(1.08);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: saturate(1);
        }
    }

    @keyframes builder-stream-source-flash {
        0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(250, 204, 21, 0);
            background-color: rgba(250, 204, 21, 0);
        }

        32% {
            transform: scale(1.015);
            box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.24), 0 12px 26px rgba(250, 204, 21, 0.12);
            background-color: rgba(255, 248, 196, 0.24);
        }

        100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(250, 204, 21, 0);
            background-color: rgba(250, 204, 21, 0);
        }
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

    @keyframes autoPreviewPulse {
        0% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 35%, transparent);
        }
        70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px color-mix(in srgb, var(--accent-primary) 0%, transparent);
        }
        100% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 0%, transparent);
        }
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
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0; /* verhindert Overflow in Grids */
        overflow: hidden;
    }

    .builder-mode-shell {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
    }

    .builder-mode-shell > * {
        animation: builder-section-reveal .42s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .builder-mode-shell > *:nth-child(2) { animation-delay: .04s; }
    .builder-mode-shell > *:nth-child(3) { animation-delay: .08s; }
    .builder-mode-shell > *:nth-child(4) { animation-delay: .12s; }
    .builder-mode-shell > *:nth-child(5) { animation-delay: .16s; }
    .builder-mode-shell > *:nth-child(6) { animation-delay: .20s; }

    .builder-reveal-surface {
        animation: builder-section-reveal .46s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .builder-right {
        min-width: 0; /* wichtig f�r Tables/Overflow */
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

    .builder-mode-enter-active,
    .builder-mode-leave-active,
    .builder-preview-enter-active,
    .builder-preview-leave-active {
        transition: opacity .28s ease, transform .32s cubic-bezier(0.22, 0.61, 0.36, 1);
        transform-origin: top center;
    }

    .builder-mode-enter-from,
    .builder-preview-enter-from {
        opacity: 0;
        transform: translateY(18px) scale(0.985);
    }

    .builder-mode-leave-to,
    .builder-preview-leave-to {
        opacity: 0;
        transform: translateY(-10px) scale(0.99);
    }

    .builder-accordion-enter-active,
    .builder-accordion-leave-active {
        transition: opacity .22s ease, transform .26s cubic-bezier(0.22, 0.61, 0.36, 1), max-height .28s ease, margin .2s ease, padding .2s ease;
        overflow: hidden;
        transform-origin: top;
    }

    .builder-accordion-enter-from,
    .builder-accordion-leave-to {
        opacity: 0;
        transform: translateY(-8px) scale(.985);
        max-height: 0;
    }

    .builder-accordion-enter-to,
    .builder-accordion-leave-from {
        opacity: 1;
        transform: translateY(0) scale(1);
        max-height: 260px;
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

    .field-error {
        margin: 0;
        color: #ef4444;
        font-size: 0.9rem;
        font-weight: 650;
    }

    .field.has-error :deep(.ui-select-trigger),
    .field-row.has-error :deep(.ui-select-trigger) {
        border-color: rgba(239, 68, 68, 0.88);
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.10), 0 10px 22px rgba(15, 23, 42, 0.12);
    }

    .field-row.has-error .exercise-select-trigger,
    .field-row.has-error .exercise-custom-toggle {
        border-color: rgba(239, 68, 68, 0.88);
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.10), 0 10px 22px rgba(15, 23, 42, 0.12);
    }

    .actions-row.stack {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: .75rem;
        align-items: stretch; /* Kinder d�rfen volle Breite nutzen */
    }

    .cardio-popup-overlay {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        z-index: 4;
    }

    .cardio-popup-overlay__runner {
        position: absolute;
        width: 148px;
        height: 112px;
        color: color-mix(in srgb, var(--accent-primary) 74%, var(--text-primary) 26%);
        will-change: left, opacity, transform;
    }

    html.dark-mode .cardio-popup-overlay__runner {
        color: color-mix(in srgb, #f8fafc 72%, var(--accent-primary) 28%);
        filter: drop-shadow(0 0 10px rgba(248, 250, 252, 0.16));
    }

    @media (prefers-reduced-motion: reduce) {
        .cardio-popup-overlay__runner {
            opacity: .95;
            left: auto;
            right: 1rem;
            top: 56%;
            transform: translateY(-50%) scale(1);
        }
    }

    .form-card.builder-grid {
        position: relative;
        isolation: isolate;
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        box-sizing: border-box; /* damit Padding mitgerechnet wird */
    }

    .auto-generation-overlay {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: stretch;
        justify-content: center;
        width: 100%;
        padding: 0;
        margin-bottom: .85rem;
        border-radius: 0;
        background: transparent;
        pointer-events: none;
    }

    .auto-generation-overlay__card {
        width: 100%;
        display: grid;
        gap: .85rem;
        padding: 1.35rem 1.35rem 1.2rem;
        border-radius: 22px;
        border: 1px solid rgba(99, 102, 241, 0.22);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 54%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 14%, transparent), transparent 62%),
            color-mix(in srgb, var(--bg-card) 94%, white 6%);
        box-shadow: 0 26px 56px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.3) inset;
        pointer-events: auto;
    }

    .auto-generation-overlay__eyebrow {
        font-size: .74rem;
        font-weight: 800;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--accent-primary) 64%, var(--text-secondary) 36%);
    }

    .auto-generation-overlay__percent {
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: .95;
        letter-spacing: -.04em;
        color: var(--text-primary);
    }

    .auto-generation-overlay__status {
        margin: 0;
        font-size: .96rem;
        font-weight: 600;
        color: color-mix(in srgb, var(--text-primary) 78%, var(--text-secondary) 22%);
    }

    .auto-generation-overlay__bar {
        position: relative;
        height: 12px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.2);
        box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
    }

    .auto-generation-overlay__bar span {
        position: absolute;
        inset: 0 auto 0 0;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--accent-primary), color-mix(in srgb, var(--accent-secondary) 76%, white 24%));
        box-shadow: 0 0 22px color-mix(in srgb, var(--accent-primary) 30%, transparent);
        transition: width .22s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .auto-generation-overlay__bar span::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.08) 32%, rgba(255, 255, 255, 0.45) 48%, rgba(255, 255, 255, 0.08) 64%, transparent 100%);
        animation: auto-generation-sheen 1.35s linear infinite;
    }

    .auto-generation-overlay__steps {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: .5rem;
    }

    .auto-generation-overlay__step {
        height: 8px;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.2);
        transform: scaleX(.94);
        transform-origin: left center;
        transition: background-color .22s ease, transform .22s ease, box-shadow .22s ease;
    }

    .auto-generation-overlay__step.is-active {
        background: color-mix(in srgb, var(--accent-primary) 70%, white 30%);
        transform: scaleX(1);
        box-shadow: 0 0 14px color-mix(in srgb, var(--accent-primary) 18%, transparent);
    }

    .auto-generation-overlay-enter-active,
    .auto-generation-overlay-leave-active {
        transition: opacity .26s ease, transform .3s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .auto-generation-overlay-enter-from,
    .auto-generation-overlay-leave-to {
        opacity: 0;
        transform: scale(.985);
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

    .smart-rx-card {
        display: grid;
        gap: 0.95rem;
        padding: 1rem 1.05rem;
        border-radius: 18px;
        border: 1px solid var(--border-color);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 6%, transparent), transparent 58%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 5%, transparent), transparent 64%),
            var(--bg-secondary);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
    }

    .smart-rx-card--hint {
        border-color: color-mix(in srgb, var(--accent-primary) 24%, var(--border-color) 76%);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 58%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 6%, transparent), transparent 64%),
            var(--bg-secondary);
    }

    .smart-rx-card__head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
    }

    .smart-rx-card__eyebrow {
        margin: 0 0 0.2rem;
        font-size: 0.72rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .smart-rx-card__head h4 {
        margin: 0;
        font-size: 1rem;
    }

    .smart-rx-card__summary {
        margin: 0.35rem 0 0;
        color: var(--text-secondary);
        line-height: 1.45;
    }

    .smart-rx-card__apply {
        flex: 0 0 auto;
        min-height: 40px;
        padding: 0.55rem 0.95rem;
        border-radius: 999px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 42%, var(--border-color) 58%);
        background:
            radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 58%),
            color-mix(in srgb, var(--bg-secondary) 88%, transparent);
        color: var(--text-primary);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 12%, transparent) inset;
        transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
    }

    .smart-rx-card__apply:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--accent-primary) 68%, var(--border-color) 32%);
        background:
            radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 14%, transparent), transparent 58%),
            color-mix(in srgb, var(--bg-secondary) 84%, transparent);
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 18%, transparent) inset;
    }

    .smart-rx-card__grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.7rem;
    }

    .smart-rx-stat {
        display: grid;
        gap: 0.2rem;
        padding: 0.75rem 0.8rem;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, #64748b 18%, var(--border-color) 82%);
        background: var(--bg-secondary);
    }

    .smart-rx-stat span {
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .smart-rx-stat strong {
        font-size: 0.98rem;
        color: var(--text-primary);
    }

    .smart-rx-stat--accent {
        border-color: color-mix(in srgb, var(--accent-secondary) 18%, var(--border-color) 82%);
        background: var(--bg-secondary);
    }

    .smart-rx-card__chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
    }

    .smart-rx-content-enter-active,
    .smart-rx-content-leave-active {
        transition: opacity .22s ease, transform .26s cubic-bezier(0.22, 0.61, 0.36, 1);
        transform-origin: top center;
    }

    .smart-rx-content-enter-from,
    .smart-rx-content-leave-to {
        opacity: 0;
        transform: translateY(10px) scale(.985);
    }

    .smart-rx-chip {
        padding: 0.34rem 0.7rem;
        border-radius: 999px;
        background: var(--bg-secondary);
        border: 1px solid color-mix(in srgb, #64748b 16%, var(--border-color) 84%);
        color: var(--text-primary);
        font-size: 0.8rem;
        font-weight: 600;
    }

    .exercise-meta-line {
        display: block;
        margin-top: 0.38rem;
        max-width: 100%;
        overflow: hidden;
        color: var(--text-secondary);
        font-size: 0.74rem;
        line-height: 1.35;
    }

    .exercise-meta-track {
        display: inline-flex;
        align-items: center;
        gap: 0;
        min-width: max-content;
        will-change: transform;
    }

    .exercise-meta-line:not(.is-animated) .exercise-meta-divider,
    .exercise-meta-line:not(.is-animated) .exercise-meta-marquee[aria-hidden="true"] {
        display: none;
    }

    .exercise-meta-divider {
        display: inline-flex;
        align-items: center;
        margin-inline: 0.35rem;
        color: color-mix(in srgb, var(--text-secondary) 86%, var(--text-muted) 14%);
        font-weight: 600;
        opacity: 0.92;
        user-select: none;
    }

    .exercise-meta-marquee {
        display: inline-block;
        min-width: max-content;
        white-space: nowrap;
    }

    .exercise-meta-line.is-animated .exercise-meta-track {
        animation: previewMetaMarquee 11s linear infinite;
    }

    .exercise-number-cell {
        text-align: center;
        vertical-align: middle;
    }

    .exercise-number-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.5rem;
        padding: 0.38rem 0.55rem;
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 14%, var(--border-color) 86%);
        background: color-mix(in srgb, var(--bg-secondary) 88%, white 12%);
        color: var(--text-primary);
        font-size: 0.76rem;
        font-weight: 700;
        line-height: 1;
    }

    .preview-replacement-card {
        display: grid;
        gap: 0.12rem;
        margin-top: 0.46rem;
        padding: 0.58rem 0.72rem;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 12%, var(--border-color) 88%);
        background: color-mix(in srgb, var(--accent-primary) 4%, var(--bg-secondary) 96%);
        max-width: min(100%, 22rem);
    }

    .preview-replacement-card__label {
        color: var(--text-secondary);
        font-size: 0.66rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .preview-replacement-card__name {
        color: var(--text-primary);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.3;
        word-break: break-word;
    }

    .preview-replacement-card__reason {
        color: var(--text-secondary);
        font-size: 0.72rem;
        line-height: 1.35;
        word-break: break-word;
    }

    @keyframes previewMetaMarquee {
        0% {
            transform: translateX(0);
        }

        100% {
            transform: translateX(calc(var(--meta-loop, 0px) * -1));
        }
    }

    .preview-exercise-main {
        min-width: 0;
    }

    .preview-exercise-title {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        min-width: 0;
    }

    .preview-order-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.55rem;
        block-size: 1.55rem;
        flex: 0 0 1.55rem;
        border-radius: 999px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        font-size: 0.74rem;
        font-weight: 700;
    }

    .auto-preview-banner {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: start;
        gap: 0.75rem;
        padding: 0.85rem 0.95rem;
        border-radius: 16px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 30%, rgba(148, 163, 184, 0.26) 70%);
        background: color-mix(in srgb, var(--accent-primary) 10%, var(--bg-card) 90%);
    }

    .auto-preview-banner strong {
        display: block;
        margin-bottom: 0.15rem;
    }

    .auto-preview-banner p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.4;
        font-size: 0.82rem;
    }

    .auto-preview-banner__pulse {
        width: 0.8rem;
        height: 0.8rem;
        margin-top: 0.2rem;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent-primary) 35%, transparent);
        animation: autoPreviewPulse 1.8s ease-out infinite;
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

    html.dark-mode .auto-generation-overlay__card {
        border-color: rgba(129, 140, 248, 0.32);
        background:
            radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 56%),
            radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.14), transparent 64%),
            rgba(2, 6, 23, 0.94);
        box-shadow: 0 26px 60px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(129, 140, 248, 0.12) inset;
    }

    html.dark-mode .auto-generation-overlay__eyebrow {
        color: #c7d2fe;
    }

    html.dark-mode .auto-generation-overlay__percent {
        color: #f8fafc;
    }

    html.dark-mode .auto-generation-overlay__status {
        color: #cbd5e1;
    }

    html.dark-mode .auto-generation-overlay__bar {
        background: rgba(51, 65, 85, 0.78);
    }

    html.dark-mode .auto-generation-overlay__step {
        background: rgba(71, 85, 105, 0.82);
    }

    html.dark-mode .auto-generation-overlay__step.is-active {
        background: linear-gradient(90deg, #818cf8, #34d399);
        box-shadow: 0 0 16px rgba(129, 140, 248, 0.22);
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
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: .3rem;
        align-items: center;
        overflow: hidden;
        touch-action: pan-y;
    }

    .seg-mode__thumb {
        position: absolute;
        top: .3rem;
        bottom: .3rem;
        left: .3rem;
        width: calc((100% - .6rem) / 2);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        box-shadow: 0 1px 2px rgba(0,0,0,.06);
        transform: translateX(var(--mode-switch-thumb-translate, 0px));
        transition: transform .18s ease, box-shadow .18s ease, background-color .18s ease;
        will-change: transform;
        pointer-events: none;
    }

    .seg-mode__thumb--dragging {
        transition: none;
        box-shadow: 0 10px 26px rgba(15, 23, 42, 0.16);
    }

    .seg-mode__thumb-labels {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .seg-mode__thumb-label {
        position: absolute;
        inset: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: .45rem .9rem;
        font-weight: 700;
        font-size: .89rem;
        line-height: 1.15;
        color: var(--text-primary);
        transition: opacity .16s ease, transform .16s ease;
        white-space: nowrap;
    }

    .seg-mode__thumb-label--auto {
        font-size: .84rem;
        letter-spacing: -.01em;
        text-align: center;
    }

    .seg-mode__thumb-hint {
        right: .25rem;
    }

    .seg-mode__option {
        width: 100%;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: .45rem 3rem .45rem .9rem;
        font-weight: 600;
        font-size: .89rem;
        cursor: pointer;
        transition: color .15s ease, transform .15s ease;
        color: color-mix(in srgb, var(--text-primary) 68%, transparent);
        z-index: 1;
        user-select: none;
        -webkit-user-select: none;
        overflow: hidden;
    }

    .seg-mode__option.on {
        color: transparent;
    }

    .builder-mode-manual-content {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .4rem;
    }

    .builder-mode-swipe-inline {
        position: absolute;
        top: 41%;
        right: .46rem;
        display: inline-flex;
        align-items: center;
        color: color-mix(in srgb, var(--accent-primary) 68%, #ffffff 32%);
        font-size: 1.62rem;
        font-weight: 900;
        line-height: .72;
        letter-spacing: .02em;
        transform: translateY(-50%) scaleX(1.46) scaleY(1.12);
        transform-origin: center;
        font-family: "Segoe UI", "Trebuchet MS", sans-serif;
        text-shadow: 0 0 12px color-mix(in srgb, var(--accent-primary) 20%, transparent);
        opacity: 0;
        animation: builder-mode-arrow-text-shift 12s ease-in-out infinite, builder-mode-arrow-visibility 12s ease-in-out infinite;
        pointer-events: none;
    }

    .segmented.seg-mode > button.on .builder-mode-swipe-inline {
        color: color-mix(in srgb, var(--accent-primary) 76%, #ffffff 24%);
    }

    html.dark-mode .segmented.seg-mode > button.on .builder-mode-swipe-inline {
        color: color-mix(in srgb, #818cf8 74%, #e0f2fe 26%);
        text-shadow: 0 0 12px rgba(129, 140, 248, 0.28);
    }

    @keyframes builder-mode-button-shift {
        0%, 100% {
            transform: translateX(0);
        }

        4% {
            transform: translateX(0.34rem);
        }

        8% {
            transform: translateX(-0.16rem);
        }

        12% {
            transform: translateX(0.3rem);
        }

        16% {
            transform: translateX(-0.12rem);
        }

        20% {
            transform: translateX(0.24rem);
        }

        24%, 97% {
            transform: translateX(0);
        }
    }

    @keyframes builder-mode-arrow-text-shift {
        0%, 100% {
            transform: translateY(-50%) scaleX(1.46) scaleY(1.12) translateX(0);
        }

        4% {
            transform: translateY(-50%) scaleX(1.46) scaleY(1.12) translateX(0.12rem);
        }

        8% {
            transform: translateY(-50%) scaleX(1.46) scaleY(1.12) translateX(-0.05rem);
        }

        12% {
            transform: translateY(-50%) scaleX(1.46) scaleY(1.12) translateX(0.1rem);
        }

        16% {
            transform: translateY(-50%) scaleX(1.46) scaleY(1.12) translateX(-0.04rem);
        }

        20% {
            transform: translateY(-50%) scaleX(1.46) scaleY(1.12) translateX(0.08rem);
        }

        24%, 97% {
            transform: translateY(-50%) scaleX(1.46) scaleY(1.12) translateX(0);
        }
    }

    @keyframes builder-mode-arrow-visibility {
        0%, 100% {
            opacity: 0;
        }

        4%, 20% {
            opacity: .96;
        }

        24%, 97% {
            opacity: 0;
        }
    }

    .segmented.seg-mode.is-dragging .seg-mode__option {
        transition: none;
    }

    .segmented.seg-mode > button.on {
        background: transparent;
        border-color: transparent;
        box-shadow: none;
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
        position: relative;
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

    @media (hover: hover) {
        .primary-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            border-color: color-mix(in srgb, var(--accent-primary) 72%, var(--accent-secondary) 28%);
            background:
                radial-gradient(circle at 18% 18%, color-mix(in srgb, #ffffff 24%, transparent), transparent 52%),
                linear-gradient(135deg, color-mix(in srgb, var(--accent-primary) 26%, transparent), color-mix(in srgb, var(--accent-secondary) 24%, transparent));
            box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 24%, transparent) inset;
            filter: saturate(1.04);
        }
    }

    .primary-btn:focus {
        outline: none;
    }

    .primary-btn:focus-visible {
        border-color: color-mix(in srgb, var(--accent-primary) 80%, var(--accent-secondary) 20%);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 18%, transparent), 0 16px 34px rgba(15, 23, 42, 0.18), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 28%, transparent) inset;
    }

    .primary-btn:disabled {
        opacity: .58;
        cursor: not-allowed;
        transform: none;
        filter: none;
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
        animation: auto-plan-card-reveal .42s cubic-bezier(0.22, 0.61, 0.36, 1) both;
        animation-delay: var(--auto-plan-delay, 0ms);
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
        align-items: flex-start;
        gap: .5rem;
        min-width: 0;
    }

    .auto-exercise-cell__body {
        min-width: 0;
        flex: 1;
    }

    .auto-exercise-cell__body > span {
        display: block;
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

    .preview-row-enter-active,
    .preview-row-leave-active,
    .preview-row-move,
    .auto-preview-row-enter-active,
    .auto-preview-row-leave-active,
    .auto-preview-row-move,
    .auto-plan-card-enter-active,
    .auto-plan-card-leave-active,
    .auto-plan-card-move {
        transition: opacity .24s ease, transform .28s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .preview-row-enter-from,
    .preview-row-leave-to,
    .auto-preview-row-enter-from,
    .auto-preview-row-leave-to,
    .auto-plan-card-enter-from,
    .auto-plan-card-leave-to {
        opacity: 0;
        transform: translateY(12px) scale(.985);
    }

    @keyframes auto-generation-sheen {
        0% {
            transform: translateX(-100%);
        }

        100% {
            transform: translateX(100%);
        }
    }

    @keyframes auto-plan-card-reveal {
        0% {
            opacity: 0;
            transform: translateY(16px) scale(.985);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
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

    @media (max-width: 600px) {
        .smart-rx-card__head {
            flex-direction: column;
        }

        .smart-rx-card__apply {
            width: 100%;
        }

        .smart-rx-card__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .preview-replacement-card {
            max-width: 100%;
        }

        .preview-replacement-card__name {
            font-size: 0.76rem;
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
        position: relative;
        isolation: isolate;
        width: 100%;
        border: 1px solid rgba(148, 163, 184, 0.26);
        border-radius: 18px;
        overflow: hidden;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease;
    }

    .exercise-table.full-width::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
        pointer-events: none;
        z-index: 1;
    }

    @media (hover: hover) {
        .exercise-table.full-width:hover {
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.28);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    html.dark-mode .exercise-table.full-width {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .exercise-table.full-width::before {
        background: linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.18), transparent);
    }

    html.dark-mode .exercise-table.full-width thead {
        background: linear-gradient(180deg, rgba(30, 41, 59, 0.78) 0%, rgba(15, 23, 42, 0.58) 100%);
    }

    html.dark-mode .exercise-table.full-width th {
        border-bottom-color: rgba(148, 163, 184, 0.24);
        color: rgba(226, 232, 240, 0.92);
    }

    html.dark-mode .exercise-table.full-width th:not(:last-child) {
        border-right-color: rgba(148, 163, 184, 0.12);
    }

    html.dark-mode .exercise-table.full-width td {
        border-top-color: rgba(148, 163, 184, 0.12);
        background: rgba(15, 23, 42, 0.42);
    }

    html.dark-mode .exercise-table.full-width tbody tr:nth-child(odd) td {
        background: rgba(30, 41, 59, 0.26);
    }

    html.dark-mode .exercise-table.full-width tbody tr:hover td {
        background: color-mix(in srgb, rgba(30, 41, 59, 0.62) 78%, #6366f1 22%);
    }

        .exercise-table.full-width table {
            width: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0;
            background: transparent;
        }

        .exercise-table.full-width thead {
            background: linear-gradient(180deg,
                    color-mix(in srgb, var(--bg-card) 78%, white 22%) 0%,
                    color-mix(in srgb, var(--bg-card) 90%, transparent) 100%);
        }

        .exercise-table.full-width th,
        .exercise-table.full-width td {
            padding: 1rem 1.05rem;
            text-align: center;
            vertical-align: middle;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .exercise-table.full-width th {
            border-bottom: 1px solid rgba(148, 163, 184, 0.18);
            background: transparent;
            color: color-mix(in srgb, var(--text-primary) 88%, white 12%);
            font-weight: 700;
            font-size: 0.78rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .exercise-table.full-width th:not(:last-child) {
            border-right: 1px solid rgba(148, 163, 184, 0.10);
        }

        .exercise-table.full-width td {
            border-top: 1px solid rgba(148, 163, 184, 0.10);
            background: color-mix(in srgb, var(--bg-card) 88%, transparent);
            color: var(--text-primary);
            white-space: normal;
            overflow-wrap: anywhere;
        }

        .exercise-table.full-width tbody tr:nth-child(odd) td {
            background: color-mix(in srgb, var(--bg-card) 84%, transparent);
        }

        .exercise-table.full-width tbody tr {
            transition: background 0.18s ease;
        }

        .exercise-table.full-width tbody tr:hover td {
            background: color-mix(in srgb, var(--bg-card) 74%, var(--accent-primary) 26%);
        }

    .action-cell {
        vertical-align: bottom;
    }

    .preview-action-cell {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        gap: 0.45rem;
        min-height: 100%;
        width: 100%;
    }

    .table-action-stack {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }

    .reorder-btn {
        inline-size: 2rem;
        block-size: 2rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        border: 1px solid color-mix(in srgb, #64748b 18%, var(--border-color) 82%);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font: inherit;
        font-weight: 700;
        line-height: 1;
        cursor: pointer;
        transition: transform .16s ease, border-color .16s ease, background .16s ease;
    }

    .reorder-btn--plain {
        inline-size: auto;
        block-size: auto;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 0;
        color: color-mix(in srgb, var(--text-primary) 86%, var(--accent-primary) 14%);
        font-size: 1.15rem;
        font-weight: 800;
        line-height: 1;
        box-shadow: none;
    }

    .reorder-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--accent-primary) 28%, var(--border-color) 72%);
        background: color-mix(in srgb, var(--accent-primary) 6%, var(--bg-secondary) 94%);
    }

    .reorder-btn--plain:hover:not(:disabled) {
        color: var(--accent-primary);
        border-color: transparent;
        background: transparent;
        transform: translateY(-1px);
    }

    .reorder-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
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

    .builder-submit-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: .75rem;
        width: 100%;
        margin-top: .35rem;
    }

    .builder-card--editing {
        border-color: rgba(250, 204, 21, 0.92) !important;
        box-shadow:
            0 0 0 2px rgba(250, 204, 21, 0.96),
            0 0 0 10px rgba(250, 204, 21, 0.16),
            0 30px 60px rgba(217, 119, 6, 0.2) !important;
        animation: builder-form-edit-ring 1.95s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .builder-submit-row.is-editing {
        grid-template-columns: minmax(0, .95fr) minmax(0, 1.15fr);
        align-items: stretch;
    }

    .builder-edit-action-btn,
    :deep(.builder-edit-action-btn) {
        width: 100%;
        min-height: var(--control-height);
        padding: 0 var(--control-padding-x);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        border: 1px solid rgba(180, 83, 9, 0.22);
        background: linear-gradient(180deg, rgba(255, 251, 235, 0.96), rgba(255, 244, 214, 0.9));
        color: #9a3412;
        font-size: .95rem;
        font-weight: 900;
        letter-spacing: .02em;
        box-shadow: 0 12px 26px rgba(217, 119, 6, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.92);
        transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
    }

    .builder-edit-action-btn:hover,
    :deep(.builder-edit-action-btn:hover:not(:disabled)) {
        transform: translateY(-1px);
        border-color: rgba(180, 83, 9, 0.34) !important;
        box-shadow: 0 16px 30px rgba(217, 119, 6, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.94) !important;
    }

    .builder-edit-action-btn:focus,
    :deep(.builder-edit-action-btn:focus) {
        outline: none;
    }

    .builder-edit-action-btn:focus-visible,
    :deep(.builder-edit-action-btn:focus-visible) {
        box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.28), 0 16px 30px rgba(217, 119, 6, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.94) !important;
    }

    html.dark-mode .builder-edit-action-btn,
    html.dark-mode :deep(.builder-edit-action-btn) {
        border-color: rgba(251, 191, 36, 0.28);
        background: linear-gradient(180deg, rgba(120, 53, 15, 0.94), rgba(92, 39, 12, 0.92));
        color: #fde68a;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    html.dark-mode .builder-card--editing {
        border-color: rgba(251, 191, 36, 0.92) !important;
        box-shadow:
            0 0 0 2px rgba(251, 191, 36, 0.92),
            0 0 0 10px rgba(251, 191, 36, 0.14),
            0 28px 54px rgba(0, 0, 0, 0.34) !important;
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
        height: var(--control-height, 48px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        font: inherit;
        gap: 0.5rem;
        min-width: 0;
        padding: 0 .9rem;
        border-radius: 12px;
        border: 2px solid color-mix(in srgb, var(--accent-primary) 42%, var(--border-color, #e5e7eb) 58%);
        background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%), color-mix(in srgb, var(--bg-secondary, #f3f4f6) 86%, transparent);
        color: var(--text-primary, #111827);
        box-sizing: border-box;
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 22%, transparent) inset, 0 0 0 4px color-mix(in srgb, var(--accent-primary) 7%, transparent);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease;
    }

    .field-row .exercise-select-trigger {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        cursor: pointer !important;
        gap: 0.5rem !important;
    }

    .exercise-select-trigger:hover,
    .exercise-custom-toggle:hover {
        border-color: color-mix(in srgb, var(--accent-primary) 56%, var(--border-color, #e5e7eb) 44%);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 30%, transparent) inset, 0 0 0 5px color-mix(in srgb, var(--accent-primary) 10%, transparent);
    }

    .exercise-select-trigger:active,
    .exercise-custom-toggle:active {
        transform: translateY(1px) scale(.995);
    }

    .exercise-select-trigger:focus-visible {
        outline: none !important;
        border-color: color-mix(in srgb, var(--accent-primary) 78%, var(--border-color, #e5e7eb) 22%);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary) 28%, transparent), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 32%, transparent) inset, 0 16px 34px rgba(15, 23, 42, 0.18);
    }

    .exercise-select-trigger:disabled {
        opacity: 0.62;
        cursor: not-allowed;
    }

    .exercise-select-trigger__text {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
        font-weight: 700;
    }

    .exercise-select-trigger__text.is-placeholder {
        color: var(--text-secondary);
        font-weight: 600;
    }

    .exercise-custom-toggle {
        width: 100%;
        min-height: var(--control-height, 48px);
        padding: 0 .95rem;
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--border-color) 80%, transparent);
        background: color-mix(in srgb, var(--bg-card) 94%, transparent);
        color: color-mix(in srgb, var(--text-primary) 88%, var(--accent-primary) 12%);
        font: inherit;
        font-weight: 700;
        letter-spacing: -.01em;
        cursor: pointer;
        box-sizing: border-box;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.34), 0 8px 18px rgba(15, 23, 42, 0.08);
        transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease, color .16s ease;
    }

    .exercise-custom-toggle.is-active {
        border-color: color-mix(in srgb, var(--accent-primary) 56%, var(--border-color) 44%);
        background: radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 70%), color-mix(in srgb, var(--bg-secondary) 92%, var(--bg-card) 8%);
        color: color-mix(in srgb, var(--accent-primary) 82%, var(--text-primary) 18%);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12), 0 0 0 1px color-mix(in srgb, var(--accent-primary) 20%, transparent) inset;
    }

    .exercise-custom-toggle:focus-visible {
        outline: none;
        border-color: color-mix(in srgb, var(--accent-primary) 48%, var(--border-color));
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 14%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.56), 0 12px 28px rgba(15, 23, 42, 0.12);
    }

    html.dark-mode .exercise-select-trigger {
        border-color: color-mix(in srgb, rgba(129, 140, 248, 0.85) 52%, rgba(148, 163, 184, 0.35) 48%);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.14), transparent 58%), rgba(2, 6, 23, 0.48);
        color: #fff;
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.32), 0 0 0 1px rgba(129, 140, 248, 0.22) inset, 0 0 0 5px rgba(129, 140, 248, 0.10);
    }

    html.dark-mode .exercise-custom-toggle {
        border-color: rgba(148, 163, 184, 0.34);
        background: linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(2, 6, 23, 0.92));
        color: #e2e8f0;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 24px rgba(0, 0, 0, 0.24);
    }

    html.dark-mode .exercise-custom-toggle.is-active {
        border-color: rgba(129, 140, 248, 0.54);
        background: radial-gradient(circle at 14% 18%, rgba(99, 102, 241, 0.18), transparent 68%), rgba(15, 23, 42, 0.92);
        color: #c7d2fe;
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(129, 140, 248, 0.18) inset;
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

        .builder-submit-row.is-editing {
            grid-template-columns: minmax(0, 1fr);
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

    .preview-table-shell {
        position: relative;
        min-width: 0;
    }

    .builder-mode-swipe-inline__arrow {
        width: 0.62rem;
        height: auto;
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

    /* Übung wählen + Eigene Übung: Desktop nebeneinander, mobil untereinander */
    .field-row-stack {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: .6rem;
        align-items: stretch;
    }

        .field-row-stack > * {
            width: 100%;
        }

        .field-row-stack > .exercise-custom-toggle,
        .field-row-stack > #custom-exercise {
            width: auto;
            min-width: 180px;
        }

    @media (max-width: 760px) {
        .field-row-stack {
            grid-template-columns: 1fr;
        }

            .field-row-stack > .exercise-custom-toggle,
            .field-row-stack > #custom-exercise {
                width: 100%;
                min-width: 0;
            }

        .builder-mode-swipe-inline {
            right: .48rem;
        }
    }

    .field-row-stack--replacement {
        grid-template-columns: minmax(0, 1fr) auto;
    }

    .custom-exercise-reveal {
        display: grid;
        gap: .55rem;
        margin-top: .6rem;
    }
</style>


