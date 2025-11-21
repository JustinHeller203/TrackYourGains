 <!-- Training.vue -->
<template>
    <div class="training">
        <h2 class="page-title">ðŸ’ª Training</h2>
        <!-- Trainingsplan Formular -->
        <div class="workout-list builder-section" ref="builderSection">
            <h3 class="section-title">Trainingsplan erstellen/bearbeiten</h3>

            <form @submit.prevent="createOrUpdatePlan" class="form-card builder-grid">
                <!-- LEFT: Builder -->
                <div class="builder-left">
                    <!-- Kopf: Planname + Typ (Segmented) + Extras rechts -->
                    <div class="builder-head">
                        <!-- NEU: Planname mit Ãœberschrift -->
                        <div class="plan-block">
                            <label for="plan-name" class="field-label">Planname</label>
                            <input id="plan-name"
                                   v-model="planName"
                                   class="plan-name-input slim"
                                   placeholder="Planname (z. B. Push Day)"
                                   required />
                        </div>

                        <!-- Trainingstyp (Desktop: Segmented + Ãœberschrift) -->
                        <div class="type-block desktop-only">
                            <span class="type-heading field-label">Trainingstyp</span>
                            <div class="segmented seg-type">
                                <button type="button" :class="{ on: trainingType==='kraft' }" @click="trainingType='kraft'">Kraft</button>
                                <button type="button" :class="{ on: trainingType==='calisthenics' }" @click="trainingType='calisthenics'">Calisthenics</button>
                                <button type="button" :class="{ on: trainingType==='ausdauer' }" @click="trainingType='ausdauer'">Ausdauer</button>
                                <button type="button" :class="{ on: trainingType==='dehnung' }" @click="trainingType='dehnung'">Dehnung</button>
                            </div>
                        </div>

                        <!-- Trainingstyp (Mobile â‰¤560px: Label + Dropdown) -->
                        <div class="type-block mobile-only">
                            <label class="type-heading field-label" for="training-type">Trainingstyp</label>
                            <select v-model="trainingType"
                                    id="training-type"
                                    class="seg-type-select"
                                    aria-label="Trainingstyp wÃ¤hlen">
                                <option value="" disabled>Trainingstyp wÃ¤hlen</option>
                                <option value="kraft">Kraft</option>
                                <option value="calisthenics">Calisthenics</option>
                                <option value="ausdauer">Ausdauer</option>
                                <option value="dehnung">Dehnung</option>
                            </select>
                        </div>

                        <!-- Extras-Button rechtsbÃ¼ndig (unverÃ¤ndert) -->
                        <ExtrasToggleButton :extraClass="['action-btn','extras-cta']"
                                            :toggled="showExtras"
                                            :title="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                            :aria-label="showExtras ? 'Extras ausblenden' : 'Extras einblenden'"
                                            @click="toggleExtras" />
                    </div>



                    <!-- NEU: kein reservierter Platz, drÃ¼ckt nur bei Aktivierung -->
                    <div v-show="showExtras" class="goal-row">
                        <label class="field-label">Trainingsziel</label>
                        <div class="field-row">
                            <select v-model="selectedGoal" class="goal-select">
                                <option value="" disabled>Trainingsziel</option>
                                <option v-for="goal in trainingGoals" :key="goal" :value="goal">{{ goal }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Filter -->
                    <div class="field-block" v-if="trainingType !== 'ausdauer'">
                        <label class="field-label">Muskelgruppe</label>
                        <div class="field-row">
                            <input class="filter-input"
                                   v-model="exerciseFilter"
                                   placeholder="z. B. Brust, OberkÃ¶rper, Push" />
                        </div>
                    </div>

                    <!-- Ãœbungsauswahl -->
                    <div class="field-block" v-if="trainingType !== 'ausdauer'">
                        <label class="field-label">Ãœbung</label>
                        <div class="field-row">
                            <select v-model="newExercise">
                                <option value="" disabled>Ãœbung wÃ¤hlen</option>
                                <option v-for="ex in filteredExercises" :key="ex" :value="ex">{{ ex }}</option>
                                <option value="custom">Eigene Ãœbung hinzufÃ¼genâ€¦</option>
                            </select>
                            <input v-show="newExercise === 'custom'"
                                   v-model="customPlanExercise"
                                   placeholder="Eigene Ãœbung eingeben" />
                        </div>
                    </div>

                    <!-- Cardio -->
                    <div class="field-block" v-else>
                        <label class="field-label">Cardio-Art</label>
                        <div class="field-row">
                            <select v-model="cardioExercise">
                                <option value="" disabled>Cardio-Art</option>
                                <option v-for="ex in filteredExercises" :key="ex" :value="ex">{{ ex }}</option>
                            </select>
                        </div>
                    </div>

                    <!-- Parameter -->
                    <div class="field-grid" v-if="trainingType === 'kraft' || trainingType === 'calisthenics'">
                        <div class="field">
                            <label>SÃ¤tze</label>
                            <input v-model.number="newSets" type="number" min="1" placeholder="z. B. 4" />
                        </div>
                        <div class="field">
                            <label>Wiederholungen</label>
                            <input v-model.number="newReps" type="number" min="1" placeholder="z. B. 8â€“12" />
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
                                                   title="Ãœbung hinzufÃ¼gen"
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
                                {{ selectedPlanExercises.length }} Ãœbung{{ selectedPlanExercises.length===1?'':'en' }}
                            </span>
                        </div>

                        <div v-if="selectedPlanExercises.length" class="exercise-table full-width compact">
                            <div class="table-scroll">
                                <table ref="previewTable" data-cols="4">
                                    <thead>
                                        <tr>
                                            <!-- 3 resizable Spalten -->
                                            <th class="resizable" :style="{ width: previewColWidths[0] + '%' }">
                                                <span class="th-text">Ãœbung</span>
                                            </th>
                                            <th class="resizable" :style="{ width: previewColWidths[1] + '%' }">
                                                <span class="th-text">
                                                    {{ selectedPlanExercises.some(ex => ex.type === 'ausdauer') ? 'SÃ¤tze / Min' : 'SÃ¤tze' }}
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
                                                              title="Ãœbung entfernen"
                                                              @click="removeExerciseFromPlan(index)" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div v-else class="empty-preview">
                            <span>Noch keine Ãœbung hinzugefÃ¼gt.</span>
                        </div>
                    </div>
                </div>

            </form>
        </div>



        <div v-if="plans.length" class="workout-list">
            <h3 class="section-title">Deine TrainingsplÃ¤ne</h3>

            <div class="search-container">
                <input v-model="planSearch" placeholder="Nach Planname oder Trainingsziel suchen" class="plan-search-input" />
            </div>

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
                            <span class="plan-drag-handle" title="Ziehen zum Verschieben">â ¿</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click="loadPlan(plan.id)"
                                  @dblclick="openEditPopup('planName', plan.id)">
                                <span class="plan-name-scroll">{{ plan.name }}</span>
                                <span class="plan-count">({{ plan.exercises.length }} Ãœbungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufÃ¼gen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                                    <DeleteButton title="Plan lÃ¶schen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                    <ActionIconButton title="Download"
                                                      aria-label="Trainingsplan herunterladen"
                                                      @click="openDownloadPopup(plan)">â¬‡ï¸</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">â‹¯</ActionIconButton>
                                </span>
                                <OpenButton class="primary-open desktop-open" title="Ã–ffnen" @click="loadPlan(plan.id)" />
                            </div>

                            <div v-if="planMenuOpenId === plan.id" class="plan-menu" @click.stop>
                                <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                                <DeleteButton title="Plan lÃ¶schen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                <ActionIconButton title="Download"
                                                  aria-label="Trainingsplan herunterladen"
                                                  @click="openDownloadPopup(plan)">â¬‡ï¸</ActionIconButton>
                            </div>
                        </div>


                        <!-- Open-Button bleibt im schmalen Layout sichtbar (eigene Zeile) -->
                        <div class="plan-row2">
                            <OpenButton class="primary-open mobile-open" title="Ã–ffnen" @click="loadPlan(plan.id)" />
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
                            <span class="plan-drag-handle" title="Ziehen zum Verschieben">â ¿</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click="loadPlan(plan.id)"
                                  @dblclick="openEditPopup('planName', plan.id)">
                                <span class="plan-name-scroll">{{ plan.name }}</span>
                                <span class="plan-count">({{ plan.exercises.length }} Ãœbungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufÃ¼gen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                                    <DeleteButton title="Plan lÃ¶schen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                    <ActionIconButton title="Download"
                                                      aria-label="Trainingsplan herunterladen"
                                                      @click="openDownloadPopup(plan)">â¬‡ï¸</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">â‹¯</ActionIconButton>
                                </span>

                                <OpenButton class="primary-open desktop-open" title="Ã–ffnen" @click="loadPlan(plan.id)" />
                            </div>

                            <div v-if="planMenuOpenId === plan.id" class="plan-menu" @click.stop>
                                <EditButton title="Plan bearbeiten" @click="editPlan(plan.id)" />
                                <DeleteButton title="Plan lÃ¶schen" @click="openDeletePopup(() => deletePlan(plan.id))" />
                                <ActionIconButton title="Download"
                                                  aria-label="Trainingsplan herunterladen"
                                                  @click="openDownloadPopup(plan)">â¬‡ï¸</ActionIconButton>
                            </div>
                        </div>


                        <!-- Open-Button bleibt im schmalen Layout sichtbar (eigene Zeile) -->
                        <div class="plan-row2">
                            <OpenButton class="primary-open mobile-open" title="Ã–ffnen" @click="loadPlan(plan.id)" />
                        </div>
                    </div>

                </template>
            </Draggable>
        </div>

        <!-- AusgewÃ¤hlter Trainingsplan -->
        <div v-if="selectedPlan" class="workout-list">
            <div class="plan-header">
                <h3 class="section-title" @dblclick="openEditPopup('selectedPlanName', selectedPlan.id)">
                    Trainingsplan: {{ selectedPlan.name }}
                </h3>
                <CloseButton title="Plan schlieÃŸen" @click="closePlan" />
            </div>
            <div class="exercise-table full-width narrow">
                <div class="table-scroll">
                    <table ref="resizeTable" data-cols="3">
                        <thead>
                            <tr>
                                <th class="resizable" :style="{ width: columnWidths[0] + '%' }">
                                    <span class="th-text">Ãœbung</span>
                                </th>
                                <th class="resizable" :style="{ width: columnWidths[1] + '%' }">
                                    <span class="th-text">
                                        {{ selectedPlan.exercises.some(ex => ex.type === 'ausdauer') ? 'SÃ¤tze / Min' : 'SÃ¤tze' }}
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

                                <!-- SÃ¤tze/Min -->
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
                </div>
            </div>

            <button @click="toggleCustomExercises" class="custom-toggle-btn" v-if="customExercises.length > 0">
                {{ showCustomExercises ? ' Benutzerdefinierte Ãœbungen ausblenden' : ' Benutzerdefinierte Ãœbungen anzeigen' }}
            </button>
            <div v-if="showCustomExercises">
                <h3 class="section-title">Eigene Ãœbungen</h3>
                <div class="exercise-table full-width narrow">
                    <div class="table-scroll">
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
                                                      title="Benutzerdefinierte Ãœbung entfernen"
                                                      @click="removeCustomExercise(i)" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- /Benutzerdefinierte Ãœbungen -->
            </div>
        </div>
        <!-- Satzpausen-Timer -->
        <div class="workout-list timer-container">
            <div class="plan-header">
                <h3 class="section-title">Satzpausen-Timer</h3>
                <AddButton title="Neuen Timer hinzufÃ¼gen" @click="openAddTimerPopup" />
            </div>

            <Draggable :modelValue="props.timers"
                       item-key="id"
                       :handle="isMobile ? undefined : '.timer-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
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
                       class="drag-stack"
                       @update:modelValue="onReorderTimers">

                <template #item="{ element: timer }">
                    <div class="timer-card" :key="timer.id" :data-timer-id="timer.id" data-type="timer">
                        <div class="timer-header">
                            <span class="timer-drag-handle" title="Ziehen zum Verschieben">â ¿</span>
                            <span class="timer-name" @click="openEditPopup('timerName', timer.id)">
                                {{ timer.name || 'Timer' }}
                            </span>
                            <div class="timer-actions">
                                <FavoriteButton :active="timer.isFavorite"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufÃ¼gen'"
                                                @toggle="toggleFavoriteTimer(timer.id)" />
                                <CloseButton title="Timer lÃ¶schen" variant="timer" @click="openDeleteTimerPopup(timer.id)" />

                            </div>
                        </div>

                        <div class="timer-controls">
                            <span class="timer-display">{{ formatTimerDisplay(timer.time) }}</span>
                            <div class="timer-input-group">
                                <select v-model="timer.seconds" class="timer-select" @change="resetCustomSeconds(timer)">
                                    <option value="" disabled>Satzpause wÃ¤hlen</option>
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
                                    <option value="" disabled>Sound wÃ¤hlen</option>
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

        <!-- Ãœbungs-Stoppuhr -->
        <div class="workout-list stopwatch-top">
            <div class="plan-header">
                <h3 class="section-title">Ãœbungs-Stoppuhr</h3>
                <AddButton title="Neue Stoppuhr hinzufÃ¼gen" @click="openAddStopwatchPopup" />
            </div>

            <Draggable :modelValue="props.stopwatches"
                       item-key="id"
                       :handle="isMobile ? undefined : '.stopwatch-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
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
                       class="drag-stack"
                       @update:modelValue="onReorderStopwatches">

                <template #item="{ element: stopwatch }">
                    <div class="timer-card" :key="stopwatch.id" :data-stopwatch-id="stopwatch.id" data-type="stopwatch">
                        <div class="timer-header">
                            <span class="stopwatch-drag-handle" title="Ziehen zum Verschieben">â ¿</span>
                            <span class="timer-name" @click.stop="openEditPopup('stopwatchName', stopwatch.id)">
                                {{ stopwatch.name || 'Stoppuhr' }}
                            </span>

                            <div class="timer-actions">
                                <FavoriteButton :active="stopwatch.isFavorite"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufÃ¼gen'"
                                                @toggle="toggleFavoriteStopwatch(stopwatch.id)" />
                                <CloseButton title="Stoppuhr lÃ¶schen" variant="stopwatch" @click="openDeleteStopwatchPopup(stopwatch.id)" />
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
                                             @click="addLapTime(stopwatch)" />
                            </div>
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

        <!-- Pop-up fÃ¼r Bearbeitung -->
        <EditPopup v-model="showEditPopup"
                   :key="`${editType}-${editIndex}-${editCellIndex}`"
                   :title="editPopupTitle"
                   :input-type="editInputType"
                   :placeholder="editPlaceholder"
                   :value="editValue"
                   :options="editOptions"
                   @save="onEditPopupSave" />

        <!-- Pop-up fÃ¼r LÃ¶schbestÃ¤tigung -->
        <DeleteConfirmPopup :show="showDeletePopup"
                            @confirm="confirmDeleteAction"
                            @cancel="closeDeletePopup" />

        <!-- Pop-up fÃ¼r Timer -->
        <InfoPopup :show="showTimerPopup"
                   title="Satzpause beendet!"
                   message="Deine Pause ist vorbei. Bereit fÃ¼r den nÃ¤chsten Satz? ðŸ’ª"
                   overlayClass="timer-popup"
                   okText="OK"
                   @ok="closeTimerPopup"
                   @cancel="closeTimerPopup" />

        <!-- Pop-up fÃ¼r neuen Timer -->
        <NamePromptPopup :show="showAddTimerPopup"
                         v-model="newTimerName"
                         title="Neuen Timer hinzufÃ¼gen"
                         placeholder="Timer Name (optional)"
                         overlayClass="timer-popup"
                         @save="addTimer"
                         @cancel="closeAddTimerPopup" />

        <!-- Pop-up fÃ¼r neue Stoppuhr -->
        <NamePromptPopup :show="showAddStopwatchPopup"
                         v-model="newStopwatchName"
                         title="Neue Stoppuhr hinzufÃ¼gen"
                         placeholder="Stoppuhr Name (optional)"
                         overlayClass="stopwatch-popup"
                         @save="addStopwatch"
                         @cancel="closeAddStopwatchPopup" />

        <!-- Pop-up fÃ¼r Download -->
        <ExportPopup :show="showDownloadPopup"
                     v-model="downloadFormat"
                     @confirm="confirmDownload"
                     @cancel="closeDownloadPopup" />

        <!-- Pop-up fÃ¼r Validierungsfehler -->
        <ValidationPopup :show="showValidationPopup"
                         :errors="validationErrorMessages"
                         @close="closeValidationPopup" />

        <!-- Audio-Elemente fÃ¼r Timer-Sounds -->
        <audio id="audio-standard" preload="auto"></audio>
        <audio id="audio-alarm" preload="auto"></audio>
        <audio id="audio-beep" preload="auto"></audio>
        <audio id="audio-dong" preload="auto"></audio>
        <audio id="audio-decide" preload="auto"></audio>
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
    import AddButton from '@/components/ui/buttons/AddButton.vue'
    import StartButton from '@/components/ui/buttons/StartButton.vue'
    import StopButton from '@/components/ui/buttons/StopButton.vue'
    import ResetControlButton from '@/components/ui/buttons/ResetControlButton.vue'
    import RoundButton from '@/components/ui/buttons/RoundButton.vue'
    import AddExerciseButton from '@/components/ui/buttons/AddExerciseButton.vue'
    import ExtrasToggleButton from '@/components/ui/buttons/ExtrasToggleButton.vue'
    import PlanSubmitButton from '@/components/ui/buttons/PlanSubmitButton.vue'
    import ExportPopup from '@/components/ui/popups/ExportPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import NamePromptPopup from '@/components/ui/popups/NamePromptPopup.vue'
    import InfoPopup from '@/components/ui/popups/InfoPopup.vue'
    import ValidationPopup from '@/components/ui/popups/ValidationPopup.vue'

    // Typ-Definitionen (bleiben unverÃ¤ndert)
    interface PlanExercise {
        exercise: string;
        sets: number;
        reps: number;
        goal?: string;
        type?: 'kraft' | 'calisthenics' | 'ausdauer' | 'dehnung';
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

    interface AppToast {
        id: number
        message: string
        emoji: string
        type: ToastType
        exiting: boolean
        createdAtMs: number
        durationMs?: number
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
    const favoriteTimerItems = computed<TimerInstance[]>({
        get() {
            return props.timers.filter(t => t.isFavorite);
        },
        set(newFavs) {
            const others = props.timers.filter(t => !t.isFavorite);
            emit('reorder-timers', [...newFavs, ...others]);
        }
    });
    const toastPosition = ref<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')

    const otherTimerItems = computed<TimerInstance[]>({
        get() {
            return props.timers.filter(t => !t.isFavorite);
        },
        set(newOthers) {
            const favs = props.timers.filter(t => t.isFavorite);
            emit('reorder-timers', [...favs, ...newOthers]);
        }
    });
    function onToastDismiss(id: number) {
        if (toast.value?.id === id) {
            toast.value = null
        }
    }
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
    const onReorderTimers = (list: TimerInstance[]) => emit('reorder-timers', list);
    const onReorderStopwatches = (list: StopwatchInstance[]) => emit('reorder-stopwatches', list);

    // NEU: gemeinsamer Typ fÃ¼r Ãœbungskategorien
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer';
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>;

    // Refs (bleiben grÃ¶ÃŸtenteils unverÃ¤ndert)
    const plans = ref<TrainingPlan[]>([]);
    const favoritePlans = ref<string[]>([]);
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
    const previewColWidths = ref([50, 25, 19, 6]); // Summe 100% (Ãœbung | SÃ¤tze | Wdh | Aktion)
    const previewTable = ref<HTMLTableElement | null>(null);
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
    const downloadPlan = ref<TrainingPlan | null>(null);
    const downloadFormat = ref<'html' | 'pdf' | 'csv' | 'json' | 'txt'>('html');
    const newTimerName = ref('');
    const newStopwatchName = ref('');
    const customColWidths = ref([40, 30, 15, 15]); // Start: Name|Muskel|Typ|Aktion
    const customResizeTable = ref<HTMLTableElement | null>(null);
    const deleteAction = ref<(() => void) | null>(null);
    // Alias â†’ Kanonische Gruppen
    const muscleGroupAliases: Record<string, string[]> = {
        // deutsch
        'brust': ['Brust'],
        'rÃ¼cken': ['RÃ¼cken'], 'ruecken': ['RÃ¼cken'],
        'schulter': ['Schultern'], 'schultern': ['Schultern'],
        'arme': ['Arme'], 'arm': ['Arme'],
        'beine': ['Beine'], 'bein': ['Beine'], 'unterkÃ¶rper': ['Beine', 'Bauch'], 'unterkoerper': ['Beine', 'Bauch'],
        'bauch': ['Bauch'], 'core': ['Bauch'],
        'oberkÃ¶rper': ['Brust', 'RÃ¼cken', 'Schultern', 'Arme'], 'oberkoerper': ['Brust', 'RÃ¼cken', 'Schultern', 'Arme'],
        'po': ['Beine'], 'gesÃ¤ÃŸ': ['Beine'], 'gluteus': ['Beine'],
        // Bewegungsmuster (Push/Pull) + Synonyme
        'push': ['Brust', 'Schultern', 'Arme'],
        'pull': ['RÃ¼cken', 'Arme'],
        'drÃ¼cken': ['Brust', 'Schultern', 'Arme'],
        'ziehen': ['RÃ¼cken', 'Arme'],
        'push day': ['Brust', 'Schultern', 'Arme'],
        'pull day': ['RÃ¼cken', 'Arme'],
        'pushday': ['Brust', 'Schultern', 'Arme'],
        'pullday': ['RÃ¼cken', 'Arme'],

        // ein paar Untergruppen â†’ Obergruppe (hilft auch Custom)
        'trizeps': ['Arme'],
        'bizeps': ['Arme'],
        'lat': ['RÃ¼cken'], 'lats': ['RÃ¼cken'], 'latissimus': ['RÃ¼cken'],

        // englische Synonyme, falls mal genutzt
        'chest': ['Brust'],
        'back': ['RÃ¼cken'],
        'shoulder': ['Schultern'], 'shoulders': ['Schultern'],
        'arms': ['Arme'], 'biceps': ['Arme'], 'triceps': ['Arme'],
        'legs': ['Beine'], 'lower body': ['Beine', 'Bauch'],
        'abs': ['Bauch'], 'core ': ['Bauch'], // core mit Space, um "core " Matches robust zu machen
        'upper body': ['Brust', 'RÃ¼cken', 'Schultern', 'Arme'],
    };

    // Calisthenics nach Muskelgruppen
    const calisthenicsByGroup: Record<string, string[]> = {
        Brust: ['LiegestÃ¼tze', 'Archer Push-up', 'Dips'],
        RÃ¼cken: ['KlimmzÃ¼ge', 'Australian Pull-up', 'Archer Pull-up'],
        Schultern: ['Handstand Push-up', 'Archer Push-up'],
        Arme: ['Dips', 'KlimmzÃ¼ge', 'Archer Pull-up'],
        Bauch: ['L-Sit', 'Dragon Flag', 'Hollow Hold', 'Toes to Bar'],
        Beine: ['Pistol Squat'],
    };

    // DehnÃ¼bungen nach Muskelgruppen
    const stretchingByGroup: Record<string, string[]> = {
        Brust: ['Brust-Dehnung'],
        RÃ¼cken: ['RÃ¼cken-Dehnung'],
        Schultern: ['Schulter-Dehnung', 'Trizeps-Dehnung'],
        Arme: ['Trizeps-Dehnung'],
        Bauch: [],
        Beine: ['Hamstring-Dehnung', 'Waden-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung'],
    };

    // Hilfsfunktionen
    const resolveGroups = (q: string): string[] => {
        const key = (q || '').trim().toLowerCase();
        return muscleGroupAliases[key] || [];
    };
    const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

    // Nur Calisthenics-Ãœbungen
    const calisthenicsExercises = ref([
        'KlimmzÃ¼ge', 'LiegestÃ¼tze', 'Dips', 'Muscle-Up', 'Handstand Push-up',
        'L-Sit', 'Dragon Flag', 'Pistol Squat', 'Hollow Hold', 'Superman Hold',
        'Archer Pull-up', 'Archer Push-up', 'Australian Pull-up', 'Toes to Bar',
    ])
    // MenÃ¼-Status (Kebab)
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

        // MenÃ¼ & Kebab weiterhin offen lassen
        if (el.closest('.plan-menu') || el.closest('.kebab-wrap')) return;

        // NEU: Klicks innerhalb des Toasts sollen das MenÃ¼ NICHT schlieÃŸen
        // Passe die Selektoren ggf. auf deine Toast-Root-Klasse/Attr an.
        if (el.closest('.toast') || el.closest('.toast-container') || el.closest('[data-toast-root]')) return;

        closePlanMenu();
    };

    // Basis-DehnÃ¼bungen (kannst du erweitern)
    const stretchingExercises = ref([
        'Brust-Dehnung', 'HÃ¼ftbeuger-Dehnung', 'Hamstring-Dehnung',
        'Waden-Dehnung', 'Schulter-Dehnung', 'Trizeps-Dehnung',
        'RÃ¼cken-Dehnung', 'Quadrizeps-Dehnung', 'Adduktoren-Dehnung',
    ])

    const predefinedExercises = ref([
        'BankdrÃ¼cken', 'Kniebeugen', 'Kreuzheben', 'SchulterdrÃ¼cken', 'LiegestÃ¼tze', 'KlimmzÃ¼ge', 'Latzug', 'Rudern',
        'Bizepscurls', 'TrizepsdrÃ¼cken', 'Beinpresse', 'Ausfallschritte', 'Butterfly', 'Seitheben', 'Wadenheben',
        'Bauchpresse', 'RÃ¼ckenstrecker', 'Beinstrecker', 'Beinbeuger', 'Brustpresse', 'Dips'
    ]);
    const muscleGroups = ref({
        Brust: ['BankdrÃ¼cken', 'LiegestÃ¼tze', 'Butterfly', 'Brustpresse'],
        RÃ¼cken: ['KlimmzÃ¼ge', 'Latzug', 'Rudern', 'RÃ¼ckenstrecker'],
        Beine: ['Kniebeugen', 'Kreuzheben', 'Beinpresse', 'Ausfallschritte', 'Wadenheben'],
        Schultern: ['SchulterdrÃ¼cken', 'Seitheben'],
        Arme: ['Bizepscurls', 'TrizepsdrÃ¼cken', 'Dips'],
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
    const editType = ref<'table' | 'selectedPlan' | 'planName' | 'selectedPlanName' | 'timerName' | 'stopwatchName' | 'customExerciseName' | 'customExerciseMuscle' | 'customExerciseType'>('table');
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
    const isTimerSticky = ref(false); // HinzugefÃ¼gt fÃ¼r Sticky-Logik
    const isStopwatchSticky = ref(false); // HinzugefÃ¼gt fÃ¼r Sticky-Logik
    const resizeTable = ref<HTMLTableElement | null>(null);
    const prevTimes = new Map<string, number>();
    const finishedOnce = new Set<string>();
    const typeLabel = (t: ExerciseType) =>
        ({ kraft: 'Kraft', calisthenics: 'Calisthenics', dehnung: 'Dehnung', ausdauer: 'Ausdauer' } as const)[t];
    const audioPaths = {
        standard: '/sounds/standard.mp3',
        alarm: '/sounds/alarm.mp3',
        beep: '/sounds/beep.mp3',
        dong: '/sounds/dong.mp3',
        decide: '/sounds/decide.mp3'
    };

    // Funktionen (weitgehend unverÃ¤ndert, nur relevante Ã„nderungen)
    // zeigt Anfang + Ende, mittig â€žâ€¦â€œ (breitenunabhÃ¤ngig, super simpel)
    function middleEllipsis(str: string, max = 36) {
        const s = (str || '').trim()
        if (s.length <= max) return s
        const head = Math.ceil((max - 1) / 2)
        const tail = Math.floor((max - 1) / 2)
        return s.slice(0, head) + 'â€¦' + s.slice(-tail)
    }
    const clearToastTimer = () => {
        if (toastTimeout) {
            window.clearTimeout(toastTimeout as any);
            toastTimeout = null;
        }
    };

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
                // UI ist noch nicht gemountet â†’ kurz retry
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
                    console.log('ðŸ”” Benachrichtigungen aktiviert!');
                }
            });
        }
    };
    const isMobile = ref(false)
    const dragDelay = computed(() => (isMobile.value ? 180 : 0))
    const dragFilter =
        '.inline-actions, .inline-actions *, .kebab-wrap, .kebab-wrap *, .timer-actions, .timer-actions *, button, select, input, textarea, a'


    let mq: MediaQueryList | null = null
    const onMedia = (e: MediaQueryListEvent | MediaQueryList) => {
        // @ts-ignore - legacy: unify types

        isMobile.value = !!e.matches
    }

    onMounted(() => {
        if (typeof window !== 'undefined') {
            mq = window.matchMedia('(max-width: 560px)')
            onMedia(mq)
            try { mq.addEventListener('change', onMedia as any) } catch { mq.addListener(onMedia as any) }
        }
    })

    onUnmounted(() => {
        if (mq) {
            try { mq.removeEventListener('change', onMedia as any) } catch { mq.removeListener(onMedia as any) }
        }
    })

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

    // Computed properties (unverÃ¤ndert)
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
        const isPush = ['push', 'drÃ¼cken', 'push day', 'pushday'].includes(filter);
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

            // ðŸ‘‰ Push/Pull-Feinfilter (nur sinnvolle Bewegungen anzeigen)
            if (isPush) {
                const allow = new Set(['LiegestÃ¼tze', 'Archer Push-up', 'Dips', 'Handstand Push-up']);
                list = list.filter(x => allow.has(x));
            } else if (isPull) {
                const allow = new Set(['KlimmzÃ¼ge', 'Australian Pull-up', 'Archer Pull-up']);
                list = list.filter(x => allow.has(x));
            }

            return list;
        }

        // Dehnung
        if (trainingType.value === 'dehnung') {
            // â— Push/Pull (und Synonyme) sollen NICHT greifen
            const isPushPull = [
                'push', 'pull', 'drÃ¼cken', 'ziehen', 'push day', 'pushday', 'pull day', 'pullday'
            ].includes(filter)

            // Gruppen nur auflÃ¶sen, wenn NICHT Push/Pull
            const groups = isPushPull ? [] : resolveGroups(filter)

            // 1) Namens-Treffer in der Basisliste
            const nameMatches = stretchingExercises.value.filter(x =>
                !filter || x.toLowerCase().includes(filter)
            )

            // 2) Gruppen-Treffer Ã¼ber Mapping (z.B. OberkÃ¶rper/UnterkÃ¶rper)
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

            // 4) Einzigartige Liste zurÃ¼ckgeben
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

        // ðŸ‘‰ Push/Pull-Feinfilter
        if (isPush) {
            const allow = new Set([
                'BankdrÃ¼cken', 'SchulterdrÃ¼cken', 'LiegestÃ¼tze', 'Butterfly',
                'Brustpresse', 'Dips', 'Seitheben', 'TrizepsdrÃ¼cken'
            ]);
            result = result.filter(x => allow.has(x));
        } else if (isPull) {
            const allow = new Set([
                'KlimmzÃ¼ge', 'Latzug', 'Rudern', 'Bizepscurls', 'RÃ¼ckenstrecker'
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
        if (editType.value === 'customExerciseType') return 'Ãœbungstyp bearbeiten';
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return 'Planname bearbeiten';
        if (editType.value === 'timerName') return 'Timername bearbeiten';
        if (editType.value === 'stopwatchName') return 'Stoppuhrname bearbeiten';
        if (editType.value === 'customExerciseName') return 'Ãœbungsname bearbeiten';
        if (editType.value === 'customExerciseMuscle') return 'Muskelgruppe bearbeiten';
        if (editCellIndex.value === 0) return 'Ãœbung bearbeiten';
        if (editCellIndex.value === 1) return 'SÃ¤tze / Minuten bearbeiten';
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
            editType.value === 'stopwatchName' ||
            editType.value === 'customExerciseName' ||
            editType.value === 'customExerciseMuscle'
        ) return 'text';
        return 'number';
    });


    const editPlaceholder = computed(() => {
        if (editType.value === 'customExerciseType') return 'Typ: kraft | calisthenics | dehnung';
        if (editType.value === 'planName' || editType.value === 'selectedPlanName') return 'Neuer Planname (3-20 Zeichen)';
        if (editType.value === 'timerName') return 'Neuer Timername';
        if (editType.value === 'stopwatchName') return 'Neuer Stoppuhrname (max. 30 Zeichen)';
        if (editType.value === 'customExerciseName') return 'Neuer Ãœbungsname (max. 50 Zeichen)';
        if (editType.value === 'customExerciseMuscle') return 'Neue Muskelgruppe (max. 50 Zeichen)';
        if (editCellIndex.value === 0) return 'Neue Ãœbung';
        if (editCellIndex.value === 1) return 'Neue SÃ¤tze (1-20)';
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
                const parsed = JSON.parse(data) ?? {};

                // PlÃ¤ne & Favoriten wie gehabt
                plans.value = Array.isArray(parsed.plans) ? parsed.plans : [];
                favoritePlans.value = Array.isArray(parsed.favoritePlans) ? parsed.favoritePlans : [];

                // Custom-Ãœbungen: robust validieren & auf 'kraft' fallen, wenn Typ fehlt/ungÃ¼ltig
                customExercises.value = Array.isArray(parsed.customExercises)
                    ? parsed.customExercises
                        .filter(
                            (ex: any) =>
                                ex &&
                                typeof ex === 'object' &&
                                typeof ex.name === 'string' &&
                                typeof ex.muscle === 'string'
                        )
                        .map((ex: any) => {
                            const t0 = normalizeTypeInput(ex.type) ?? 'kraft';
                            const t: ExerciseType = (t0 === 'ausdauer') ? 'kraft' : t0; // Cardio bei Custom-Ãœbungen verhindern
                            return { name: ex.name, muscle: ex.muscle, type: t };
                        })

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
        if (reps == null || isNaN(reps)) return 'Wiederholungen/Sekunden mÃ¼ssen eine Zahl sein';
        if (!Number.isFinite(reps)) return 'UngÃ¼ltige Zahl';
        if (!Number.isInteger(reps)) return 'Wiederholungen/Sekunden mÃ¼ssen eine Ganzzahl sein';
        // groÃŸzÃ¼giger, damit Dehnung (Sekunden) und hohe Wiederholungen funktionieren
        if (reps < 1 || reps > 1000) return 'Wiederholungen/Sekunden mÃ¼ssen zwischen 1 und 1000 liegen';
        return null;
    };

    const validateSets = (sets: number | null | undefined) => {
        if (sets == null || isNaN(sets)) return 'SÃ¤tze mÃ¼ssen eine Zahl sein';
        if (sets < 1 || sets > 20) return 'SÃ¤tze mÃ¼ssen zwischen 1 und 20 liegen';
        if (!Number.isInteger(sets)) return 'SÃ¤tze mÃ¼ssen eine Ganzzahl sein';
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

        if (!trimmedName) return 'Ãœbungsname ist erforderlich';
        if (!trimmedMuscle) return 'Muskelgruppe ist erforderlich';
        if (trimmedName.length > 50) return 'Ãœbungsname darf maximal 50 Zeichen lang sein';
        if (trimmedMuscle.length > 50) return 'Muskelgruppe darf maximal 50 Zeichen lang sein';

        const normalized = normalizeTypeInput(typeRaw);
        if (!normalized) return 'UngÃ¼ltiger Typ. Erlaubt sind: kraft, calisthenics, dehnung';
        if (normalized === 'ausdauer') return '"Ausdauer" ist fÃ¼r benutzerdefinierte Ãœbungen nicht erlaubt';

        const type = normalized as CustomExerciseType;

        const exists = customExercises.value.some((ex, i) =>
            i !== editIndex &&
            ex.type === type &&
            ex.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) return 'Ãœbungsname existiert in diesem Typ bereits';

        return { name: trimmedName, muscle: trimmedMuscle, type };
    };

    const onEditPopupSave = (val: string) => {
        editValue.value = val;
        saveEdit();        // nutzt jetzt den tatsÃ¤chlich im Popup editierten Wert
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
            if (!cardioExercise.value) errors.push('Cardio-Art wÃ¤hlen')
            const dErr = validateDurationMin(newDuration.value); if (dErr) errors.push(dErr)
            const kErr = validateDistanceKm(newDistance.value); if (kErr) errors.push(kErr)
            return errors
        }

        // Kraft / Calisthenics / Dehnung
        const exerciseToAdd = newExercise.value === 'custom' ? customPlanExercise.value : newExercise.value
        if (!exerciseToAdd) errors.push('Ãœbung auswÃ¤hlen oder benutzerdefinierte Ãœbung eingeben')
        else if (selectedPlanExercises.value.some(ex => ex.exercise.toLowerCase() === exerciseToAdd.toLowerCase())) {
            errors.push('Ãœbung bereits im Plan vorhanden')
        }

        // Dehnung nutzt deine vorhandenen Felder: newSets = Holds, newReps = Sekunden/Hold
        const setsError = validateSets(newSets.value); if (setsError) errors.push(setsError)
        const repsError = validateReps(newReps.value); if (repsError) errors.push(repsError)

        if (newExercise.value === 'custom' && customPlanExercise.value) {
            const muscleGroup = exerciseFilter.value || ''
            const validated = validateCustomExercise(
                customPlanExercise.value,
                muscleGroup,
                trainingType.value, // ðŸ‘ˆ wichtig: 'kraft' | 'calisthenics' | 'dehnung'
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

    const toggleFavoritePlan = (planId: string) => {
        const idx = favoritePlans.value.indexOf(planId);
        if (idx !== -1) {
            favoritePlans.value.splice(idx, 1);
            addToast('Plan aus Favoriten entfernt', 'delete');
        } else {
            // Neueste Favoriten zuerst
            favoritePlans.value = [planId, ...favoritePlans.value.filter(id => id !== planId)];
            addToast('Plan zu Favoriten hinzugefÃ¼gt', 'add');
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
            addToast('Trainingsplan gelÃ¶scht, da keine Ãœbungen vorhanden', 'delete');
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
                errors.push('Mindestens eine Ãœbung ist erforderlich');
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
            addToast('Cardio hinzugefÃ¼gt', 'add')
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
                addToast('Benutzerdefinierte Ãœbung gespeichert', 'add')
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
        addToast('Ãœbung hinzugefÃ¼gt', 'add')

        newExercise.value = ''
        customPlanExercise.value = ''
        newReps.value = null
        newSets.value = null
        selectedGoal.value = ''
    }


    const removeExerciseFromPlan = (index: number) => {
        if (index < 0 || index >= selectedPlanExercises.value.length) {
            addToast('UngÃ¼ltiger Ãœbungsindex', 'delete');
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
            addToast('Ãœbung gelÃ¶scht', 'delete');
        });
    };

    const editPlan = async (planId: string) => {
        const plan = plans.value.find(p => p.id === planId);
        if (plan) {
            planName.value = plan.name;
            selectedPlanExercises.value = [...plan.exercises];
            editingPlanId.value = planId;
            rowHeights.value = Array(plan.exercises.length).fill(40);
            selectedPlan.value = { ...plan };
            addToast('Plan wird bearbeitet', 'save');

            await nextTick();   // DOM aktualisiert
            scrollToBuilder();  // sanft nach oben + Highlight
        } else {
            addToast('Plan nicht gefunden', 'delete');
        }
    };

    const deletePlan = (planId: string) => {
        plans.value = plans.value.filter(p => p.id !== planId);
        favoritePlans.value = favoritePlans.value.filter(id => id !== planId);
        if (selectedPlan.value?.id === planId) selectedPlan.value = null;
        saveToStorage();
        addToast('Trainingsplan gelÃ¶scht', 'delete');
    };

    const loadPlan = (planId: string) => {
        closePlanMenu(); // NEU
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

    // Scroll/Highlight zum Builder
    const builderSection = ref<HTMLElement | null>(null);

    function scrollToBuilder() {
        const el = builderSection.value;
        if (!el) return;

        const offset = 8; // ggf. an fixe HeaderhÃ¶he anpassen
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

        const setsHeader = anyCardio ? 'SÃ¤tze / Min' : 'SÃ¤tze';
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
        <th>Ãœbung</th>
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
            doc.text(['Ãœbung', setsHeader, repsHeader].join(' | '), 20, y);
            y += 10;
            plan.exercises.forEach(ex => {
                doc.text([ex.exercise, fmtSets(ex), fmtReps(ex)].join(' | '), 20, y);
                y += 10;
            });
            doc.save(`${fileName}_Trainingsplan.pdf`);

        } else if (downloadFormat.value === 'csv') {
            const header = ['Ãœbung', setsHeader, repsHeader];
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
                `Ãœbung\t${setsHeader}\t${repsHeader}`,
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

    const openAddTimerPopup = () => {
        newTimerName.value = ''
        showAddTimerPopup.value = true
    }

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
        addToast('Timer hinzugefÃ¼gt', 'add');
        closeAddTimerPopup();
        await nextTick();
        console.log('Nach addTimer, aktuelle timers:', props.timers);
    };

    const openDeleteTimerPopup = (id: string) => {
        console.log('openDeleteTimerPopup aufgerufen mit ID:', id);
        if (props.timers.length <= 1) {
            openValidationPopup(['Mindestens ein Timer muss geÃ¶ffnet bleiben']);
            return;
        }
        openDeletePopup(async () => {
            console.log('LÃ¶schaktion ausfÃ¼hren fÃ¼r Timer ID:', id);
            const timer = props.timers.find(t => t.id === id);
            nextTick(() => closeTimerPopup()); // direkt auto-schlieÃŸen, kein OK-Klick nÃ¶tig

            emit('remove-timer', id);

            addToast('Timer gelÃ¶scht', 'delete');
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
            ? [timer, ...favs, ...others]   // neu favorisiert â†’ ganz nach oben
            : [...favs, timer, ...others];  // entfavorisiert â†’ direkt hinter Fav-Bereich

        emit('reorder-timers', ordered);
        addToast(timer.isFavorite ? 'Timer zu Favoriten hinzugefÃ¼gt' : 'Timer aus Favoriten entfernt', timer.isFavorite ? 'add' : 'delete');
    };

    const openAddStopwatchPopup = () => {
        newStopwatchName.value = ''
        showAddStopwatchPopup.value = true
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
        addToast('Stoppuhr hinzugefÃ¼gt', 'add');
        closeAddStopwatchPopup();
        await nextTick();
        console.log('Nach addStopwatch, aktuelle stopwatches:', props.stopwatches);
    };

    const openDeleteStopwatchPopup = (id: string) => {
        if (props.stopwatches.length <= 1) {
            openValidationPopup(['Mindestens eine Stoppuhr muss geÃ¶ffnet bleiben']);
            return;
        }
        openDeletePopup(async () => {
            const sw = props.stopwatches.find(x => x.id === id);
            if (sw) {
                sw.shouldStaySticky = false; // optional; rein UI-Flag
                if (sw.isRunning) {
                    // â¸ Parent pausiert/stoppt â€“ keine lokale Interval-Logik hier
                    props.toggleStopwatch(sw);
                }
            }
            emit('remove-stopwatch', id);
            addToast('Stoppuhr gelÃ¶scht', 'delete');
            await nextTick();
        });
    };

    const TOAST_DURATION = 3200; // ms

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
        addToast(sw.isFavorite ? 'Stoppuhr zu Favoriten hinzugefÃ¼gt' : 'Stoppuhr aus Favoriten entfernt', sw.isFavorite ? 'add' : 'delete');
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
        // id Ã¼bergeben war falsch â†’ sofortiger Dismiss, weil truthy. Korrekt: explicit immediate.
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
        const emojis = { delete: 'ðŸ—‘ï¸', add: 'âœ…', save: 'ðŸ’¾', timer: 'â°', load: 'ðŸ“‹' } as const;
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
            durationMs: TOAST_DURATION
        };

        // Auto-Dismiss ausschlieÃŸlich von <Toast/> steuern lassen
        autoDismissRemainingMs = 0;
    };

    const openEditPopup = (
        type:
            | 'table'
            | 'selectedPlan'
            | 'planName'
            | 'selectedPlanName'
            | 'timerName'
            | 'stopwatchName'
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
                console.error('Kein Event fÃ¼r table/selectedPlan Ã¼bergeben');
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
                console.error('Ãœbung nicht gefunden fÃ¼r Index:', index);
                openValidationPopup(['Ãœbung nicht gefunden']);
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
            if (!selectedPlan.value) { openValidationPopup(['Kein ausgewÃ¤hlter Plan']); return; }
            editValue.value = selectedPlan.value.name;
        } else if (type === 'timerName') {
            const timer = props.timers.find(t => t.id === index);
            if (!timer) { openValidationPopup(['Timer nicht gefunden']); return; }
            editValue.value = timer.name || '';
        } else if (type === 'stopwatchName') {
            const stopwatch = props.stopwatches.find(s => s.id === index);
            if (!stopwatch) { openValidationPopup(['Stoppuhr nicht gefunden']); return; }
            editValue.value = stopwatch.name || '';
        } else if (type === 'customExerciseName') {
            const exercise = customExercises.value[index as number];
            if (!exercise) { openValidationPopup(['Ãœbung nicht gefunden']); return; }
            editValue.value = exercise.name;
        } else if (type === 'customExerciseMuscle') {
            const exercise = customExercises.value[index as number];
            if (!exercise) { openValidationPopup(['Muskelgruppe nicht gefunden']); return; }
            editValue.value = exercise.muscle;
        }
        // NEU
        else if (type === 'customExerciseType') {
            const exercise = customExercises.value[index as number];
            if (!exercise) { openValidationPopup(['Ãœbung nicht gefunden']); return; }
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

            // ausdauer (nur fÃ¼rs Normalisieren/Bestandsdaten; Auswahl ist gesperrt)
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
                    openValidationPopup(['Ãœbung existiert bereits im Plan']);
                    return;
                }
                exercise.exercise = newName;
                addToast('Ãœbung aktualisiert', 'save');
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
                addToast('SÃ¤tze aktualisiert', 'save');
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

        // === 2) Tabelle im geÃ¶ffneten Plan (selectedPlan) ==========================
        if (editType.value === 'selectedPlan' && typeof editIndex.value === 'number' && selectedPlan.value) {
            const exercise = selectedPlan.value.exercises[editIndex.value];
            if (!exercise) return;

            if (editCellIndex.value === 0 && editValue.value) {
                const newName = editValue.value.trim();
                if (selectedPlan.value.exercises.some(ex => ex.exercise.toLowerCase() === newName.toLowerCase() && ex !== exercise)) {
                    openValidationPopup(['Ãœbung existiert bereits im Plan']);
                    return;
                }
                exercise.exercise = newName;
                updatePlanInStorage();
                addToast('Ãœbung aktualisiert', 'save');
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
                addToast('SÃ¤tze aktualisiert', 'save');
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

        // === 3) Restliche Edit-FÃ¤lle ===============================================
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
        }

        // === NEU: Typ einer benutzerdefinierten Ãœbung ==============================
        else if (editType.value === 'customExerciseType' && typeof editIndex.value === 'number') {
            const ex = customExercises.value[editIndex.value];
            if (!ex) return;

            const normalized = normalizeTypeInput(editValue.value);
            if (!normalized) {
                openValidationPopup(['UngÃ¼ltiger Typ. Erlaubt sind: kraft, calisthenics, dehnung']);
                return;
            }
            if (normalized === 'ausdauer') {
                openValidationPopup(['"Ausdauer" ist fÃ¼r benutzerdefinierte Ãœbungen nicht erlaubt']);
                return;
            }

            const duplicate = customExercises.value.some((c, i) =>
                i !== editIndex.value &&
                c.name.toLowerCase() === ex.name.toLowerCase() &&
                c.type === normalized
            );
            if (duplicate) {
                openValidationPopup(['Diese Ãœbung existiert mit diesem Typ bereits']);
                return;
            }

            ex.type = normalized;
            saveToStorage();
            addToast('Ãœbungstyp aktualisiert', 'save');
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
            addToast('Ãœbungsname aktualisiert', 'save');
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
    // MenÃ¼ offen? â†’ Toast-Timer hart pausieren/resumieren (zusÃ¤tzlich zum Sammel-Watch)
    watch(planMenuOpenId, () => {
        // Kein Parent-Timer mehr â†’ nichts zu tun
    });

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

    const removeCustomExercise = (index: number) => {
        customExercises.value.splice(index, 1);
        if (customExercises.value.length === 0) showCustomExercises.value = false;
        saveToStorage();
        addToast('Benutzerdefinierte Ãœbung gelÃ¶scht', 'delete');
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
                // NEU: Kebab-MenÃ¼ schlieÃŸen
                closePlanMenu();

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
        // erst alte Observer lÃ¶sen
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

        const MIN_PX_BY_COL = [16, 16, 16]; // Ãœbung | SÃ¤tze | Wdh.
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
                // âž• zwei Griffe am letzten TH
                makeResizer('left');   // innen
                makeResizer('right');  // am Tabellenrand
            } else {
                makeResizer('right');  // wie gehabt
            }
        });



        // Zeilen-Resizer bleibt unverÃ¤ndert â€¦
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

    // PREVIEW: Aktion (Index 3) kann jetzt Ã¼ber den Griff an Spalte 2 mitverÃ¤ndert werden
    const initPreviewResizeTable = () => {
        const table = previewTable.value;
        if (!table) return;

        table.querySelectorAll('.resizer').forEach(el => el.remove());

        const MIN_PX_BY_COL = [16, 16, 16, 44]; // Ãœbung | SÃ¤tze | Wdh. | Aktion
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

    const initAudioElements = () => {
        Object.entries(audioPaths).forEach(([key, path]) => {
            const audio = document.getElementById(`audio-${key}`) as HTMLAudioElement;
            if (audio) audio.src = path;
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


    // Ã–ffnet ggf. einen von auÃŸerhalb gewÃ¤hlten Plan
    const tryOpenPlanFromStorage = () => {
        const id = localStorage.getItem('trainingOpenPlanId')
        if (id) {
            loadPlan(id)
            localStorage.removeItem('trainingOpenPlanId')
        }
    }

    watch(() => [props.timers, props.stopwatches], () => {
        console.log('timers oder stopwatches geÃ¤ndert:', { timers: props.timers, stopwatches: props.stopwatches });
        nextTick(() => checkScroll());
    }, { deep: true });

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

                // Wechsel von >0 auf <=0 â†’ Timer fertig
                if (prev > 0 && time <= 0 && !finishedOnce.has(id)) {
                    finishedOnce.add(id);
                    showTimerPopup.value = true;
                    playTimerSound(sound || 'standard');
                    sendNotification('Timer fertig', 'Deine Satzpause ist vorbei ðŸ’ª');
                    dismissToast(true);

                    const timer = props.timers.find(t => t.id === id);
                    if (timer && timer.isRunning) {
                        props.stopTimer(timer);
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
    watch(planSearch, () => closePlanMenu());

    const syncFullscreenClass = () => {
        const isFs = !!document.fullscreenElement;
        document.documentElement.classList.toggle('is-fullscreen', isFs);
    };
    // Live-Preview: bei jeder Ã„nderung an den Ãœbungen
    watch(selectedPlanExercises, () => {
        nextTick(() => {
            initPreviewResizeTable();
            setupHeaderShorteningFallback();
        });
    }, { deep: true });

    // Eigene Ãœbungen: bei DatenÃ¤nderungen und wenn sichtbar
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
    // wenn der ausgewÃ¤hlte Plan geladen/geschlossen wird â†’ Tabelle wechselt
    watch(selectedPlan, (val) => {
        if (val) nextTick(() => { initResizeTable(); setupHeaderShorteningFallback(); });
        else nextTick(() => setupHeaderShorteningFallback());
    });

    // wenn die Custom-Ãœbungen eingeblendet werden â†’ Tabelle erscheint
    watch(showCustomExercises, (val) => {
        if (val) nextTick(() => { initCustomResizeTable(); setupHeaderShorteningFallback(); });
    });

    onMounted(() => {
        loadFromStorage();
        tryFocusFromStorage();
        requestNotificationPermission();

        document.addEventListener('click', onDocClick);
        window.addEventListener('scroll', checkScroll);
        window.addEventListener('keydown', handleKeydown);
        document.addEventListener('fullscreenchange', syncFullscreenClass);

        syncFullscreenClass();
        initAudioElements();

        // Tabellen zuerst
        initResizeTable();
        initPreviewResizeTable();
        if (showCustomExercises.value) initCustomResizeTable();

        setupHeaderShorteningFallback();
        tryOpenPlanFromStorage();
    });

    onUnmounted(() => {
        document.removeEventListener('click', onDocClick);
        window.removeEventListener('scroll', checkScroll);
        window.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('fullscreenchange', syncFullscreenClass);
        teardownHeaderShorteningFallback();
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
        background: var(--bg-primary);
        width: 100%;
        max-width: 100%; /* â† FIX: verhindert Overflow */
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        margin-top: 0;
        min-height: 100dvh;
        margin-inline: auto;
        overflow-x: clip; /* â† WICHTIG */
        box-sizing: border-box;
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
        max-width: var(--section-max);
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 0 0.5rem; /* â† reduziert von 1rem */
        box-sizing: border-box;
        overflow-x: clip; /* â† NEU */
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
            /* rechte Spalte spÃ¼rbar schmaler */
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

    .builder-landing {
        animation: builderPop .6s cubic-bezier(.2,.8,.2,1);
        background-image: radial-gradient(1200px 120px at 50% -20px, rgba(99,102,241,.08), transparent 70%);
    }

    @media (prefers-reduced-motion: reduce) {
        .builder-landing {
            animation: none;
        }
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

    .drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem; /* Abstand zwischen den Cards wie vorher */
        width: 100%;
    }

        .drag-stack > .timer-card {
            width: 100%;
            max-width: 1200px;
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
        padding-left: 2.25rem; /* Platz fÃ¼rs Icon */
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
        min-width: 0; /* wichtig fÃ¼r Tables/Overflow */
    }

    /* FeldblÃ¶cke */
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
    /* Zelle wird selbst Container â†’ reagiert auf ihre eigene Breite */
    .v-stack {
        container-type: inline-size;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }
    /* Letzte Spalte (Aktion) â€“ nicht unter 44px */
    .custom-exercises-table th:last-child,
    .custom-exercises-table td:last-child,
    .exercise-table.full-width.compact th:last-child,
    .exercise-table.full-width.compact td:last-child {
        min-width: 44px !important; /* Platz fÃ¼rs Icon */
        white-space: nowrap;
        overflow: visible;
        text-overflow: clip;
    }

    /* Icon-GrÃ¶ÃŸe fix, damit nichts clippt */
    .table-delete-btn {
        width: 32px;
        height: 32px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
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
        align-items: stretch; /* Kinder dÃ¼rfen volle Breite nutzen */
    }

    .preview-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,.06);
        position: sticky;
        top: .75rem; /* bleibt beim Scrollen sichtbar */
        contain: inline-size; /* Inhalt beeinflusst keine Ã¤uÃŸere Breite */
        overflow-x: visible;
    }

    .preview-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: .5rem;
    }

        .preview-head h4 {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--text-primary);
        }

    .preview-card .muted {
        color: var(--text-secondary);
        font-size: .85rem;
    }

    .empty-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 160px;
        background: var(--bg-secondary);
        border: 1px dashed var(--border-color);
        color: var(--text-secondary);
        border-radius: 10px;
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

    /* Buttons rechts dÃ¼rfen nie umbrechen */
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
            overflow-x: hidden;
        }

        .workout-list,
        .form-card.builder-grid {
            max-width: 100%;
            min-width: 0;
            width: 100%;
        }
    }

    .custom-exercises-table {
        display: block;
        inline-size: 100%;
        max-inline-size: 100%;
        contain: layout inline-size;
        overflow-x: hidden;
        overflow-x: clip; /* moderne Browser */
    }

        .custom-exercises-table th,
        .custom-exercises-table td {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap; /* bleibt kompakt */
        }

        .custom-exercises-table table {
            width: 100%;
            max-width: 100%;
            table-layout: fixed;
            min-width: 100%;
        }

    .exercise-table.full-width.compact table {
        width: 100%;
    }

    .exercise-table.full-width.compact th,
    .exercise-table.full-width.compact td {
        padding: .75rem;
        font-size: .92rem;
    }

    .exercise-table.full-width.compact thead th {
        background: #f1f5f9;
    }

    html.dark-mode .exercise-table.full-width.compact thead th {
        background: #0d1117;
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

    /* Aktion-Spalte: keine Ellipsis, Icon zentriert + Mindestbreite */
    .custom-exercises-table td:last-child,
    .custom-exercises-table th:last-child,
    .exercise-table.full-width.compact td:last-child,
    .exercise-table.full-width.compact th:last-child {
        overflow: visible; /* verhindert "â€¦" */
        text-overflow: clip;
        white-space: nowrap;
        min-width: 44px; /* genug Platz fÃ¼r das ðŸ—‘ï¸-Icon */
    }

    .custom-exercises-table table tbody td:last-child .table-delete-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px !important;
        height: 32px !important;
        margin: 0 auto !important;
        line-height: 1; /* keine Typo-ÃœberhÃ¤nge */
    }
    /* Zeilen-inhalt vertikal mittig ausrichten (alle Zellen) */
    .custom-exercises-table td,
    .custom-exercises-table th {
        vertical-align: middle;
    }

        /* Falls das Emoji optisch nicht exakt zentriert wirkt: minimaler Nudge */
        .custom-exercises-table td.action-cell .table-delete-btn {
            transform: translateY(-0.5px);
        }

    /* Schlanke, aber normal lesbare Tabelle nur fÃ¼r den ausgewÃ¤hlten Plan */
    .exercise-table.full-width.narrow {
        position: relative;
        max-inline-size: 100%;
        margin-inline: auto;
        overflow-x: visible; /* nicht clippen, der Scroll-Container Ã¼bernimmt */
        table-layout: fixed; /* stabilisiert Spaltenbreiten */
    }
    /* ADD: eigener Scroll-Container fÃ¼r Tabellen-Inhalte */
    .table-scroll {
        overflow-x: auto; /* â‡ Scrollbar bleibt */
        -webkit-overflow-scrolling: touch;
        overscroll-behavior-x: contain;
        background: var(--bg-card);
        border-radius: 8px; /* wirkt wie â€žinnenâ€œ statt â€žauÃŸerhalbâ€œ */
    }

        /* Mindestbreiten, damit rechte Spalten nicht â€žauÃŸerhalbâ€œ wirken */
        .table-scroll > table {
            min-width: 640px; /* kannst du anpassen (z.B. 560px) */
        }

    /* Sicherheit: Header & letzte Spalte wirken sauber innen */
    .exercise-table.full-width thead th,
    .custom-exercises-table thead th {
        background-clip: padding-box;
    }

    /* Mobile bleibt voll breit */
    @media (max-width: 720px) {
        .exercise-table.full-width.narrow {
            max-inline-size: 100%;
        }
    }

    /* Optional: Nur die erste Spalte darf (falls nÃ¶tig) auf zwei Zeilen umbrechen,
     damit lange Ãœbungsnamen nicht alles sprengen â€” ohne Mini-Schrift. */
    .exercise-table.full-width.narrow td:first-child,
    .exercise-table.full-width.narrow th:first-child {
        white-space: normal;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Icon selbst: nicht gestaucht/abgeschnitten */
    .table-delete-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1; /* verhindert Emoji-/SVG-Clipping */
        width: 32px;
        height: 32px;
        padding: 0;
        position: relative;
        z-index: 1; /* falls irgendwas darÃ¼berliegt */
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
    /* ganz unten im <style scoped> ergÃ¤nzen */
    @supports not (overflow: clip) {
        .training,
        .workout-list,
        .custom-exercises-table {
            overflow-x: hidden;
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

    .custom-exercises-table,
    .exercise-table.full-width {
        overflow-clip-margin: var(--clip-margin);
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

    .form-card .action-btn:not(.add-exercise-btn):not(.toggle-exercise-btn):not(.plan-submit-btn):not(.table-delete-btn) {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        transition: background .2s, transform .2s;
    }

        .form-card .action-btn:not(.add-exercise-btn):not(.toggle-exercise-btn):not(.plan-submit-btn):not(.table-delete-btn):hover {
            background: #f3f4f6;
            transform: none;
        }

    /* Aktion-Spalte: Button sauber zentriert, Ã¼berschreibt frÃ¼here grid-Regeln */
    /* gleiche Zellenlogik wie der Rest der Tabelle */
    .exercise-table.full-width td.action-cell,
    .custom-exercises-table td.action-cell {
        display: table-cell; /* zurÃ¼ck auf echtes Table-Cell-Layout */
        padding: 1rem; /* identisch zu deinen anderen <td>s */
        text-align: center;
        vertical-align: middle;
    }

        /* Button sauber in der Mitte, ohne Layout zu beeinflussen */
        .exercise-table.full-width td.action-cell .table-delete-btn,
        .custom-exercises-table td.action-cell .table-delete-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            margin: 0 auto;
            line-height: 1;
            transform: none;
        }

    .custom-exercises-table th,
    .custom-exercises-table td,
    .exercise-table.full-width th,
    .exercise-table.full-width td {
        border-bottom: 1px solid var(--border-color);
    }

    .extras-container {
        transition: max-height 0.3s ease, opacity 0.3s ease;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        width: 100%;
    }

    .desktop-only {
        display: initial;
    }

    .mobile-only {
        display: none;
    }

    .extras-container.show {
        max-height: 250px;
        opacity: 1;
        margin-top: 0.75rem; /* ðŸ‘‰ grÃ¶ÃŸerer Abstand */
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
    @media (max-width: 560px) {
        .plan-drag-handle,
        .timer-drag-handle,
        .stopwatch-drag-handle {
            display: none;
        }
    }

    .extras-button-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;
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
    /* ===== sichtbare Griffe/Linien fÃ¼r Spalten ===== */
    :root {
        --resize-hit: 10px; /* KlickflÃ¤che */
        --resize-line: 1px; /* LinienstÃ¤rke normal */
        --resize-line-hover: 2px; /* LinienstÃ¤rke Hover/Active */
        --resize-color: #94a3b8; /* Slate-400/500 */
        --resize-color-hover: #60a5fa; /* Accent bei Hover/Active */
    }

    /* Cursor & Selection wÃ¤hrend Drag */
    body.is-resizing-col {
        cursor: col-resize;
        user-select: none;
    }

    body.is-resizing-row {
        cursor: row-resize;
        user-select: none;
    }

    .exercise-table.full-width th.resizable,
    .custom-exercises-table th.resizable {
        position: relative;
        overflow: hidden; /* vorher: visible */
    }

        /* 2) Resizer-Handle bleibt *in* der Zelle */
        .exercise-table.full-width th.resizable > .resizer,
        .custom-exercises-table th.resizable > .resizer {
            right: 0 !important; /* NIE negativ */
            width: var(--resize-hit, 10px);
        }

    .exercise-table.full-width table {
        table-layout: fixed;
        border-collapse: collapse;
    }
    /* ganz unten im <style scoped> ergÃ¤nzen */
    .custom-exercises-table th:last-child,
    .custom-exercises-table td:last-child {
        min-width: 44px !important;
    }

    /* ===== sichtbarer Griff fÃ¼r Zeilen ===== */
    .exercise-table.full-width tr.resizable-row {
        position: relative;
    }

        .exercise-table.full-width tr.resizable-row > .row-resizer {
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 100%;
            height: var(--resize-hit);
            cursor: row-resize;
            z-index: 3;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            background: transparent;
        }

            .exercise-table.full-width tr.resizable-row > .row-resizer::before {
                content: "";
                display: block;
                height: var(--resize-line);
                width: 60%;
                background: var(--resize-color);
                opacity: .7;
                transition: height .12s ease, background-color .12s ease, opacity .12s ease;
                border-radius: 1px;
            }

            .exercise-table.full-width tr.resizable-row > .row-resizer:hover::before,
            .exercise-table.full-width tr.resizable-row > .row-resizer.is-active::before {
                height: var(--resize-line-hover);
                background: var(--resize-color-hover);
                opacity: 1;
            }

    /* Dark-Mode Kontrast (optional feiner abstimmen) */
    html.dark-mode :root {
        --resize-color: #64748b; /* slate-500 */
        --resize-color-hover: #3b82f6; /* blue-500 */
    }

    .list-item-actions {
        display: flex;
        gap: 0.6rem;
        align-items: center; /* <â€” NEU */
    }

        .list-item-actions .action-btn {
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

    .custom-toggle-btn {
        margin-top: 1rem;
        padding: 0.6rem 1.2rem;
        background: var(--bg-secondary);
        color: #1f2937;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        font-size: 0.95rem;
        transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    }

        .custom-toggle-btn:hover {
            background-color: #f3f4f6;
            border-color: #4B6CB7;
        }

    html.dark-mode .custom-toggle-btn {
        background-color: #1f2937;
        color: #fff;
        border: 1px solid #30363d;
    }

        html.dark-mode .custom-toggle-btn:hover {
            background-color: #374151;
            border-color: #4B6CB7;
        }

    .custom-ex-title {
        font-size: 1.1rem;
        margin: 1rem 0 0.5rem;
        color: #111827;
    }
    /* Header-THs kÃ¶nnen auf Breite reagieren */
    .exercise-table.full-width th,
    .custom-exercises-table th {
        container-type: inline-size;
    }

    /* AbkÃ¼rzungs-Logik fÃ¼r Wiederholungen */
    /* Header-KÃ¼rzung: zeigt je nach Klasse genau EINS der Labels */
    .th-label .full,
    .th-label .mid,
    .th-label .short {
        display: none;
    }

    .th-label.is-full .full {
        display: inline;
    }

    .th-label.is-mid .mid {
        display: inline;
    }

    .th-label.is-short .short {
        display: inline;
    }


    .custom-exercises-table .exercise-table {
        width: 100%;
        border-collapse: collapse;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

        .custom-exercises-table .exercise-table th,
        .custom-exercises-table .exercise-table td {
            border-bottom: 1px solid var(--border-color);
            border-right: 1px solid var(--border-color);
        }

            .custom-exercises-table .exercise-table th:last-child,
            .custom-exercises-table .exercise-table td:last-child {
                border-right: 0;
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
    /* Karte selbst darf Ã¼ber Nachbarn stehen */
    .plan-item {
        position: relative;
    }

        /* Wenn MenÃ¼ offen ist: Karte nach oben und kein Hover-Shift */
        .plan-item.menu-open {
            z-index: 999;
        }

            .plan-item.menu-open:hover {
                transform: none !important;
            }

    /* MenÃ¼ noch darÃ¼ber */
    .plan-menu {
        z-index: 1000;
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


    .exercise-input-group {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        width: 100%;
        align-items: stretch; /* ðŸ‘‰ NEU: gleiche HÃ¶he in der Zeile */
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
        /* Fix: keine Hairline-Gaps & sauberes Clipping in allen Tabellen */
        .exercise-table.full-width table,
        .custom-exercises-table table {
            border-collapse: separate !important;
            border-spacing: 0 !important;
        }

        .exercise-table.full-width thead th,
        .exercise-table.full-width tbody td,
        .custom-exercises-table thead th,
        .custom-exercises-table tbody td {
            background-clip: padding-box; /* verhindert Farbabbruch an den RÃ¤ndern */
            overflow: hidden;
        }

    .exercise-table th,
    .exercise-table td,
    .custom-exercises-table th,
    .custom-exercises-table td {
        min-width: 0;
    }

        .exercise-table th:last-child,
        .exercise-table td:last-child,
        .custom-exercises-table th:last-child,
        .custom-exercises-table td:last-child {
            min-width: 44px !important;
            white-space: nowrap;
        }

    /* Header reagieren auf Breite */
    .exercise-table th,
    .custom-exercises-table th {
        container-type: inline-size;
    }

    /* Wrapper fÃ¼r Header-Text */
    .th-text {
        display: inline-block;
        white-space: nowrap;
        line-height: 1;
    }

    /* Body-Zellen bleiben horizontal, hart abkÃ¼rzen */
    .exercise-table td,
    .custom-exercises-table td {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .exercise-table.full-width table {
        width: 100%;
        table-layout: fixed; /* â† WICHTIG: stabilisiert Spaltenbreiten beim Drag */
    }

    .exercise-table.full-width th,
    .exercise-table.full-width td {
        padding: 1.5rem;
        text-align: center;
        min-width: 0; /* war 150px: verhindert Breiten-Inflation */
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

    .button-group .btn-cell > *:not(.add-exercise-btn) {
        width: 100%;
        height: var(--btn-height);
        padding-left: var(--btn-pad-x);
        padding-right: var(--btn-pad-x);
    }

    .button-group .btn-cell > .action-btn.add-exercise-btn {
        display: inline-flex; /* saubere vertikale Zentrierung */
        align-items: center;
        justify-content: center;
        width: 100%;
        height: calc(var(--control-height) - 4px); /* 48px â†’ 44px */
        padding-top: 0;
        padding-bottom: 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    /* Basis: nur "full" sichtbar */
    .th-label .mid,
    .th-label .short {
        display: none;
    }

    /* Wenn per JS "mid" gesetzt wurde */
    .th-label.is-mid .full {
        display: none;
    }

    .th-label.is-mid .mid {
        display: inline;
    }

    .th-label.is-mid .short {
        display: none;
    }

    /* Wenn per JS "short" gesetzt wurde */
    .th-label.is-short .full,
    .th-label.is-short .mid {
        display: none;
    }

    .th-label.is-short .short {
        display: inline;
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

    .flash-focus {
        outline: 2px solid var(--accent-primary);
        box-shadow: 0 0 0 3px var(--accent-primary), 0 0 18px var(--accent-hover);
        transition: box-shadow .3s ease;
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

        /* MenÃ¼-Overlay sicherheitshalber oberhalb halten */
        .plan-menu {
            z-index: 1000;
        }
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
    /* ========== Desktop/ab deinem Original-Breakpoint: alles in EINER Reihe ========== */

    .plan-title {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    /* Inline-Action-Buttons (Edit/LÃ¶schen/Download) sind standardmÃ¤ÃŸig sichtbar */
    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }
    /* Kebab standardmÃ¤ÃŸig verstecken â€“ wird erst ab schmaler Breite angezeigt */


    @media (max-width:1024px) {
        .inline-actions {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }
    }

    /* â‰¤560px: weiterhin eine Zeile; mobile Zeile komplett aus */
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
            top: calc(100% - 2.25rem);
            display: flex;
            gap: .3rem;
            padding: .4rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 10px;
            box-shadow: var(--shadow, 0 6px 18px rgba(0,0,0,.15));
            z-index: 30;
        }

            .plan-menu > * {
                inline-size: auto;
            }

        .exercise-table.full-width.narrow th,
        .exercise-table.full-width.narrow td {
            min-width: 0;
            white-space: normal;
            word-break: break-word;
            text-overflow: clip;
            padding: .6rem;
            font-size: .9rem;
        }
    }

    .exercise-table.full-width.narrow th.resizable > .resizer {
        right: 0 !important;
        width: var(--resize-hit, 10px);
    }

    .exercise-table.full-width th.resizable > .resizer::before,
    .custom-exercises-table th.resizable > .resizer::before {
        transform: none; /* vorher: translateX(1px) */
    }

    .timer-display:hover,
    .timer:hover {
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

    .exercise-table.full-width th.resizable,
    .custom-exercises-table th.resizable {
        position: relative;
        overflow: hidden;
    }

        .exercise-table.full-width th.resizable > .resizer,
        .custom-exercises-table th.resizable > .resizer {
            right: 0 !important;
            width: 10px;
        }

    .exercise-table.full-width table,
    .custom-exercises-table table {
        border-collapse: separate !important;
        border-spacing: 0 !important;
    }

    .exercise-table.full-width thead th,
    .custom-exercises-table thead th {
        background-clip: padding-box;
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

    .builder-head .plan-block .field-label {
        display: block;
        margin-bottom: .6rem; /* Abstand Titel â†” Input */
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
        gap: .55rem; /* Abstand Titel â†” Select */
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


    .custom-exercises-table table {
        width: 100%;
        max-width: 100%;
        table-layout: fixed;
        min-width: 100%; /* verhindert Schrumpfen */
    }

    .builder-head .segmented.seg-type {
        gap: .45rem; /* etwas mehr Luft zwischen Buttons */
        padding: .26rem .35rem; /* minimal hÃ¶here/lebhaftere FlÃ¤che */
        border-radius: 10px;
    }

        .builder-head .segmented.seg-type > button {
            padding: .42rem .72rem; /* + ~2â€“3px in beide Richtungen */
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
            grid-area: plan; /* spannt Ã¼ber "plan plan" = beide Spalten */
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
            align-items: start; /* nicht mittig zwischen den Zeilen hÃ¤ngen */
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
            align-self: end; /* am unteren Rand der Zeile â†’ HÃ¶he vom Label ignorieren */
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

        .exercise-table.full-width th,
        .exercise-table.full-width td,
        .custom-exercises-table th,
        .custom-exercises-table td {
            min-width: 0;
            white-space: normal;
            word-break: break-word;
            text-overflow: clip;
            padding: .6rem;
            font-size: .9rem;
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
    /* Wrapper zeigt eine horizontale Scrollbar nur bei Bedarf */
    .table-scroll {
        overflow-x: auto;
        overflow-y: hidden;
        max-width: 100%;
        -webkit-overflow-scrolling: touch;
    }

        /* Tabelle darf breiter als der Container sein â†’ dann erscheint die Scrollbar */
        .table-scroll > table {
            width: 100%;
            table-layout: fixed; /* lÃ¤sst deine Resizer unverÃ¤ndert funktionieren */
        }

            /* Minimal sinnvolle Breite pro Tabellentyp, damit nichts mikroskopisch wird.
    â†’ Scrollbar erscheint erst, wenn der Viewport kleiner ist. */
            .table-scroll > table[data-cols="3"] {
                min-width: 560px;
            }
            /* Ãœbung | SÃ¤tze | Wdh. */
            .table-scroll > table[data-cols="4"] {
                min-width: 720px;
            }
    /* + Aktion/weitere Spalte */

    /* Falls zuvor irgendwo "clip/hidden" gesetzt wurde: das Scrollen im Wrapper nicht wegklemmen */
    .exercise-table.full-width.narrow,
    .exercise-table.full-width.compact,
    .custom-exercises-table {
        overflow-x: visible; /* der eigentliche Scroll passiert im .table-scroll */
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

        .exercise-table.full-width th,
        .exercise-table.full-width td {
            padding: .5rem;
            font-size: .85rem;
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
    .form-card,
    .exercise-table.full-width,
    .custom-exercises-table {
        max-width: 100%;
        overflow-x: clip;
    }

    @media (max-width: 360px) {
        .page-title {
            font-size: 1.75rem;
        }

        .exercise-table.full-width th,
        .exercise-table.full-width td {
            font-size: .82rem;
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
                height: var(--control-height); /* fixe ZielhÃ¶he, z. B. 48px */
                padding-block: .25rem; /* etwas schlanker innen, damitâ€™s nicht zu fett wirkt */
                align-items: stretch; /* Buttons fÃ¼llen die volle HÃ¶he */
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
            /* 1) Links flexibel, rechts Spalte so breit wie der Button (kein calc, kein sbw) */
            grid-template-columns: minmax(0, 1fr) auto !important;
            grid-template-areas: "plan plan" "type extras" !important;
            column-gap: .85rem;
            align-items: end;
            min-width: 0;
            overflow: clip; /* falls ein Rundungs-Pixel entsteht: kein horizontaler Scroll */
        }

            .builder-head .extras-cta {
                width: auto !important;
                inline-size: auto !important;
                max-width: none !important;
                white-space: nowrap; /* Label bleibt in einer Zeile */
                padding-inline: var(--control-padding-x); /* wie vorher */
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
                max-inline-size: clamp(180px, 24ch, 320px) !important; /* genug Platz fÃ¼r Label */
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
            max-inline-size: clamp(180px, 26ch, 360px); /* 26ch reicht fÃ¼r â€žExtras ausblendenâ€œ */
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

    /* Ã–ffnen */
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
    /* NEU: gilt fÃ¼r alle Breakpoints */
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

    /* Mobile: keine zweite Zeile nÃ¶tig */
    @media (max-width:560px) {
        .plan-row2, .mobile-open {
            display: none !important;
        }
    }
    /* FIX 1: Plan-Karte ist kein Flex-Container mehr */
    .plan-item {
        display: block; /* Ã¼berschreibt .list-item { display:flex } */
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

    /* FIX 3: Die mobile Zusatzzeile standardmÃ¤ÃŸig weg */
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

    /* Ab hier â€žverschiebenâ€œ sich deine Buttons â†’ Inline-Actions aus, Kebab an */
    @media (max-width: 1024px) {
        .inline-actions {
            display: none !important;
        }

        .kebab-wrap {
            display: inline-flex !important;
        }
    }

    /* Der Button selbst: fixes Quadrat und auto-zentriert */
    .table-delete-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin: 0 auto; /* falls text-align greifen sollte */
        line-height: 1;
    }

    /* Ã–ffneter Plan â€“ Table darf die Seite NICHT verbreitern */
    .exercise-table.full-width.narrow {
        display: block; /* wichtig: nicht als Table-Wrapper mit auto-breiten Kindern */
        max-inline-size: 100%;
        overflow-x: clip; /* oder: hidden; (clip ist moderner) */
        contain: inline-size; /* Kinder beeinflussen die AuÃŸenbreite nicht */
    }

        /* Sicherheitshalber die Tabelle fix einbremsen */
        .exercise-table.full-width.narrow > table {
            table-layout: fixed;
            width: 100%;
            max-width: 100%;
        }

    /* === GeÃ¶ffneter Trainingsplan: identischer Rahmen wie alle anderen === */
    .exercise-table.full-width.narrow {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,.06);
        overflow: hidden; /* Ecken sauber, nichts â€žblankesâ€œ */
    }

        /* Keine kÃ¼nstlichen Rand-Gutters links/rechts */
        .exercise-table.full-width.narrow .table-scroll {
            scrollbar-gutter: auto;
        }

            /* Tabelle selbst bÃ¼ndig ohne Spalt bis an den Rahmen */
            .exercise-table.full-width.narrow .table-scroll > table {
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse; /* entfernt die seitlichen Gaps */
            }

        /* Optional: vertikale Trennlinien wie bei den anderen (falls gewÃ¼nscht) */
        .exercise-table.full-width.narrow th,
        .exercise-table.full-width.narrow td {
            border-right: 1px solid var(--border-color);
        }

            .exercise-table.full-width.narrow th:last-child,
            .exercise-table.full-width.narrow td:last-child {
                border-right: 0;
            }
    /* Host im TH: wird Clip-Container fÃ¼r den Resizer */
    .exercise-table.full-width th .th-text,
    .custom-exercises-table th .th-text {
        position: relative;
        display: block;
        overflow: hidden; /* â† Wichtig: hier wird geklippt */
        padding-right: 8px; /* etwas Raum neben dem Text */
    }

    /* NEU: Resizer hÃ¤ngt an .th-text (nicht am TH) */
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

    /* Header-KÃ¼rzung (Fallback) â€“ zeigt je nach Klassenstatus genau EINS der Labels */
    .th-label .full,
    .th-label .mid,
    .th-label .short {
        display: none;
    }

    .th-label.is-full .full {
        display: inline;
    }

    .th-label.is-mid .mid {
        display: inline;
    }

    .th-label.is-short .short {
        display: inline;
    }
    /* Sichtbare, schlanke Linie am Spaltenrand + grÃ¶ÃŸere KlickflÃ¤che */
    .exercise-table.full-width th.resizable > .resizer::after,
    .custom-exercises-table th.resizable > .resizer::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        right: 4px; /* Linie sitzt innen */
        width: 1px;
        background: var(--resize-color);
        opacity: .7;
        transition: width .12s ease, background-color .12s ease, opacity .12s ease;
    }

    .exercise-table.full-width th.resizable > .resizer:hover::after,
    .exercise-table.full-width th.resizable > .resizer.is-active::after,
    .custom-exercises-table th.resizable > .resizer:hover::after,
    .custom-exercises-table th.resizable > .resizer.is-active::after {
        width: 2px;
        background: var(--resize-color-hover);
        opacity: 1;
    }

    /* sanfter Fokusrahmen, wenn via tryFocusFromStorage gescrollt wurde */
    .flash-focus {
        outline: 2px solid #60a5fa;
        box-shadow: 0 0 0 4px rgba(96,165,250,.25);
        transition: outline-color .3s ease, box-shadow .3s ease;
    }
    /* Live-Preview: vertikale Spaltentrenner wie bei den anderen Tabellen */
    .preview-card .exercise-table.full-width.compact .table-scroll > table {
        border-collapse: separate !important;
        border-spacing: 0 !important;
    }

        .preview-card .exercise-table.full-width.compact .table-scroll > table th,
        .preview-card .exercise-table.full-width.compact .table-scroll > table td {
            border-right: 1px solid var(--border-color);
        }

            .preview-card .exercise-table.full-width.compact .table-scroll > table th:last-child,
            .preview-card .exercise-table.full-width.compact .table-scroll > table td:last-child {
                border-right: 0;
            }
    /* Default: volle Beschriftung sichtbar */
    .th-label .full {
        display: inline;
    }

    .th-label .mid, .th-label .short {
        display: none;
    }

    /* Wenn per JS verkÃ¼rzt wird */
    .th-label.is-mid .full {
        display: none;
    }

    .th-label.is-mid .mid {
        display: inline;
    }

    .th-label.is-short .full,
    .th-label.is-short .mid {
        display: none;
    }

    .th-label.is-short .short {
        display: inline;
    }
    /* Live-Preview: kompaktere Zellen */
    /* Live-Preview: wieder hÃ¶her + keine abgeschnittenen Diakritika */
    .preview-card .exercise-table.full-width.compact th,
    .preview-card .exercise-table.full-width.compact td {
        /* mehr HÃ¶he Ã¼ber Padding-Block, horizontal bleibt schlank */
        padding: 1.0rem 0.4rem; /* vorher .5rem .6rem */
        font-size: .9rem; /* minimal grÃ¶ÃŸer als .88rem */
        line-height: 1.25; /* verhindert Ãœ/Ã„/Ã–-Clipping */
    }

    /* Header-Text in der Live-Preview: Ã¼berschreibt dein globales .th-text { line-height: 1; } */
    .preview-card .exercise-table.full-width.compact .th-text {
        line-height: 1.25;
    }
    /* Trainingsplan (geÃ¶ffneter Plan): mehr vertikale Luft + saubere Umlaute */
    .exercise-table.full-width.narrow th,
    .exercise-table.full-width.narrow td,
    .custom-exercises-table th,
    .custom-exercises-table td {
        padding: 1.5rem .5rem; /* vertikal hÃ¶her, horizontal schlank */
        font-size: .94rem;
        line-height: 1.3; /* verhindert Ãœ/Ã„/Ã–-Clipping */
    }

    .exercise-table.full-width.narrow .th-text,
    .custom-exercises-table .th-text {
        line-height: 1.3;
    }

    /* Live-Preview: Tabelle nutzt nur so viel Platz wie nÃ¶tig */
    .preview-card .table-scroll > table {
        width: max-content;
        max-width: 100%;
        min-width: 540px; /* leicht erhÃ¶ht, damit vertikale Luft nicht â€žzu gedrungenâ€œ wirkt */
    }

    /* Mobile: ebenfalls etwas hÃ¶her, aber kompakt */
    @media (max-width: 560px) {
        .preview-card .exercise-table.full-width.compact th,
        .preview-card .exercise-table.full-width.compact td {
            padding: .9rem .5rem; /* vorher .45rem .5rem */
            font-size: .88rem;
            line-height: 1.25;
        }

        .preview-card .table-scroll > table {
            min-width: 500px; /* optional: 480â€“500px nach GefÃ¼hl */
        }

        .exercise-table.full-width.narrow th,
        .exercise-table.full-width.narrow td,
        .custom-exercises-table th,
        .custom-exercises-table td {
            padding: 1.4rem .5rem;
            font-size: .9rem;
            line-height: 1.28;
        }

        .plan-drag-stack > .plan-item,
        .drag-stack > .timer-card {
            touch-action: pan-y; /* Scroll weiter mÃ¶glich, Drag wird sauber erkannt */
            -webkit-user-select: none;
            user-select: none;
        }
    }
    /* Griff fÃ¼r *alle* THs (nicht nur .resizable), inkl. ganz rechts */
    .exercise-table.full-width thead th > .resizer,
    .custom-exercises-table thead th > .resizer {
        position: absolute;
        top: 0;
        right: 0; /* sitzt an der *rechten* Tabellenlinie */
        height: 100%;
        width: var(--resize-hit, 10px);
        cursor: col-resize;
        z-index: 5;
        background: transparent;
        touch-action: none;
    }

    /* Smoother Touch-Drag auf Mobile */
    .plan-drag-stack .plan-item,
    .drag-stack .timer-card {
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
        will-change: transform;
    }

    /* Weniger Text-Selection/Jank beim Drag */
    .sortable-chosen {
        user-select: none;
    }

    /* Ghost optisch stabil + minimaler Scale fÃ¼r â€žGripâ€œ-Feeling */
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
    .list-item.plan-item,
    .timer-card {
        will-change: transform;
    }

    /* wÃ¤hrend Drag keine Hover-Animationen stÃ¶ren */
    .dragging .list-item.plan-item,
    .dragging .timer-card {
        transform: none !important;
    }

</style>
