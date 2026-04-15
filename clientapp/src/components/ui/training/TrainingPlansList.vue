<!--components/ui/training/TrainingPlansList.vue-->

<template>
    <div>
        <div class="workout-list plans-section" data-tyg="plans-section">
            <h3 class="section-title">Deine Trainingspläne</h3>

            <UiSearch v-model="planSearch"
                      placeholder="Nach Planname oder Trainingsziel suchen"
                      aria-label="Trainingspläne durchsuchen"
                      class="plan-search" />

            <!-- Externer Plan per Code -->
            <div v-if="externalQueryActive" class="external-plan-box">
                <div v-if="externalLoading" class="external-plan-hint">
                    Suche externen Plan...
                </div>

                <div v-else-if="externalError" class="external-plan-error">
                    {{ externalError }}
                </div>

                <div v-else-if="externalView" class="external-plan-card">
                    <div class="external-plan-left">
                        <div class="external-plan-title">
                            Externer Plan: <b>{{ externalView.name }}</b>
                        </div>
                        <div class="external-plan-sub">
                            {{ externalView.exerciseCount }} Übungen · Code: {{ middleEllipsis(String(externalView.code ?? ''), 14) }}
                        </div>
                    </div>

                    <div class="external-plan-actions">
                        <ActionIconButton title="Installieren"
                                          aria-label="Externen Trainingsplan installieren"
                                          @click="installExternalPlan">
                            <img class="icon-download icon-download--install"
                                 src="/DownloadButton.png"
                                 alt=""
                                 aria-hidden="true" />
                        </ActionIconButton>
                    </div>
                </div>

                <div v-else class="external-plan-hint">
                    Kein externer Plan gefunden.
                </div>
            </div>

            <!-- Favoriten sortieren -->
            <Draggable v-if="plans.length && favoritePlanItems.length"
                       v-model="favoritePlanItems"
                       item-key="id"
                       :handle="isCompactPlanCards ? undefined : '.plan-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
                       :disabled="planSearch.trim().length > 0"
                       :delay="dragDelay"
                       :delay-on-touch-only="dragDelayOnTouchOnly"
                       :touch-start-threshold="8"
                       :fallback-tolerance="3"
                       :fallback-on-body="true"
                       :scroll="true"
                       :scroll-sensitivity="40"
                       :scroll-speed="12"
                       :swap-threshold="0.3"
                       :filter="isCompactPlanCards ? dragFilter : undefined"
                       @start="onPlanDragStart($event, 'favorites')"
                       @change="onPlanDragChange($event, 'favorites')"
                       @end="onPlanDragEnd"
                       tag="div"
                       class="plan-drag-stack">

                <template #item="{ element: plan, index }">
                    <div class="list-item plan-item"
                         :class="{
                             'menu-open': planMenuOpenId === plan.id,
                             'plan-item--dup-echo': duplicateEchoPlanId === plan.id,
                             'plan-item--favorite': favoritePlans.includes(plan.id),
                             'plan-item--delete-pulse': deleteCardPlanId === plan.id,
                             'plan-item--search-hidden': !planMatchesSearch(plan),
                             'plan-item--favorite-transfer': favoriteTransfer.planId === plan.id,
                             'plan-item--favorite-transfer-in': favoriteTransfer.planId === plan.id && favoriteTransfer.direction === 'to-favorite',
                             'plan-item--favorite-transfer-out': favoriteTransfer.planId === plan.id && favoriteTransfer.direction === 'from-favorite',
                             'plan-item--rename-forge': renameForgePlanId === plan.id,
                             ...getPlanMotionClasses(plan.id, 'favorites')
                         }"
                         :key="plan.id"
                         :style="{ '--plan-reveal-delay': `${Math.min(index, 8) * 55}ms` }"
                         :data-plan-id="plan.id"
                        :ref="(el) => setPlanCardRef(plan.id, el as HTMLElement | null)"
                         @click="onPlanCardClick($event, plan.id)">
                        <span v-if="deleteCardPlanId === plan.id" class="delete-card-sanctified-label" aria-hidden="true">Gelöscht!</span>
                        <div class="plan-row1">
                            <span v-if="favoriteTransfer.planId === plan.id && favoriteTransfer.direction"
                                  class="favorite-sanctified-label"
                                  :class="{ 'favorite-sanctified-label--removed': favoriteTransfer.direction === 'from-favorite' }"
                                  aria-hidden="true">{{ favoriteTransfer.direction === 'to-favorite' ? 'Favorisiert!' : 'Entfernt!' }}</span>
                            <span v-if="!isCompactPlanCards" class="plan-drag-handle" title="Ziehen zum Verschieben">≡</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click.stop="loadPlan(plan.id, $event)"
                                  @dblclick.stop="renamePlan(plan.id)">
                                <span class="plan-name-scroll"
                                      :class="{ 'plan-name-scroll--rename-forge': renameForgePlanId === plan.id && !!renameForgePayload }">
                                    <span class="plan-name-scroll__live">{{ plan.name }}</span>
                                    <span v-if="renameForgePlanId === plan.id && renameForgePayload"
                                          class="plan-title-rename-overlay"
                                          aria-hidden="true">
                                        <span class="plan-title-rename-overlay__old">{{ renameForgePayload.oldName }}</span>
                                        <span class="plan-title-rename-overlay__handwrite">{{ renameForgePayload.newName }}</span>
                                        <span class="plan-title-rename-overlay__final">{{ renameForgePayload.newName }}</span>
                                    </span>
                                </span>
                                <span v-if="!isCompactPlanCards && renameForgePlanId !== plan.id" class="plan-count">({{ plan.exerciseCount }} Übungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click.stop="editPlanInBuilder(plan.id)" />
                                    <DeleteButton title="Plan löschen" @click="requestPlanDelete(plan, $event)" />
                                    <ActionIconButton title="Exportieren"
                                                      aria-label="Trainingsplan exportieren"
                                                      @click="downloadPlan(plan)">↓</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">⋯</ActionIconButton>
                                </span>

                                <ActionIconButton class="play-btn"
                                                  :data-preview-play="isPhonePreviewSimulationDemo ? 'simulation-demo' : null"
                                                  :data-tyg-play-button="plan.id"
                                                  :data-tyg-tutorial-play="props.planTutActive && props.planTutPlanId === plan.id ? 'true' : null"
                                                  title="Starten"
                                                  aria-label="Training starten"
                                                  @click.stop="startSimulation(plan)">
                                    <img class="play-icon" src="/PlayButton.png" alt="" aria-hidden="true" />
                                </ActionIconButton>
                            </div>

                            <PlanMenu v-if="planMenuOpenId === plan.id"
                                      @edit="editPlanInBuilder(plan.id)"
                                      @duplicate="duplicatePlan(plan)"
                                      @delete="requestPlanDelete(plan)"
                                      @download="downloadPlan(plan)" />
                        </div>

                    </div>
                </template>
            </Draggable>

            <!-- Nicht-Favoriten sortieren -->
            <Draggable v-if="plans.length"
                       v-model="otherPlanItems"
                       item-key="id"
                       :handle="isCompactPlanCards ? undefined : '.plan-drag-handle'"
                       ghost-class="drag-ghost"
                       chosen-class="drag-chosen"
                       drag-class="dragging"
                       :force-fallback="true"
                       :animation="0"
                       direction="vertical"
                       easing="cubic-bezier(0.16,1,0.3,1)"
                       :disabled="planSearch.trim().length > 0"
                       :delay="dragDelay"
                       :delay-on-touch-only="dragDelayOnTouchOnly"
                       :touch-start-threshold="8"
                       :fallback-tolerance="3"
                       :fallback-on-body="true"
                       :scroll="true"
                       :scroll-sensitivity="40"
                       :scroll-speed="12"
                       :swap-threshold="0.3"
                       :filter="isCompactPlanCards ? dragFilter : undefined"
                       @start="onPlanDragStart($event, 'others')"
                       @change="onPlanDragChange($event, 'others')"
                       @end="onPlanDragEnd"
                       tag="div"
                       class="plan-drag-stack plan-drag-stack--others">

                <template #item="{ element: plan, index }">
                    <div class="list-item plan-item"
                         :class="{
                             'menu-open': planMenuOpenId === plan.id,
                             'plan-item--dup-echo': duplicateEchoPlanId === plan.id,
                             'plan-item--favorite': favoritePlans.includes(plan.id),
                             'plan-item--delete-pulse': deleteCardPlanId === plan.id,
                             'plan-item--search-hidden': !planMatchesSearch(plan),
                             'plan-item--favorite-transfer': favoriteTransfer.planId === plan.id,
                             'plan-item--favorite-transfer-in': favoriteTransfer.planId === plan.id && favoriteTransfer.direction === 'to-favorite',
                             'plan-item--favorite-transfer-out': favoriteTransfer.planId === plan.id && favoriteTransfer.direction === 'from-favorite',
                             'plan-item--rename-forge': renameForgePlanId === plan.id,
                             ...getPlanMotionClasses(plan.id, 'others')
                         }"
                         :key="plan.id"
                         :style="{ '--plan-reveal-delay': `${Math.min(index + favoritePlanItems.length, 10) * 55}ms` }"
                         :data-plan-id="plan.id"
                        :ref="(el) => setPlanCardRef(plan.id, el as HTMLElement | null)"
                         @click="onPlanCardClick($event, plan.id)">
                        <span v-if="deleteCardPlanId === plan.id" class="delete-card-sanctified-label" aria-hidden="true">Gelöscht!</span>
                        <div class="plan-row1">
                            <span v-if="favoriteTransfer.planId === plan.id && favoriteTransfer.direction"
                                  class="favorite-sanctified-label"
                                  :class="{ 'favorite-sanctified-label--removed': favoriteTransfer.direction === 'from-favorite' }"
                                  aria-hidden="true">{{ favoriteTransfer.direction === 'to-favorite' ? 'Favorisiert!' : 'Entfernt!' }}</span>
                            <span v-if="!isCompactPlanCards" class="plan-drag-handle" title="Ziehen zum Verschieben">≡</span>

                            <span class="plan-title"
                                  :title="plan.name"
                                  @click.stop="loadPlan(plan.id, $event)"
                                  @dblclick.stop="renamePlan(plan.id)">
                                <span class="plan-name-scroll"
                                      :class="{ 'plan-name-scroll--rename-forge': renameForgePlanId === plan.id && !!renameForgePayload }">
                                    <span class="plan-name-scroll__live">{{ plan.name }}</span>
                                    <span v-if="renameForgePlanId === plan.id && renameForgePayload"
                                          class="plan-title-rename-overlay"
                                          aria-hidden="true">
                                        <span class="plan-title-rename-overlay__old">{{ renameForgePayload.oldName }}</span>
                                        <span class="plan-title-rename-overlay__handwrite">{{ renameForgePayload.newName }}</span>
                                        <span class="plan-title-rename-overlay__final">{{ renameForgePayload.newName }}</span>
                                    </span>
                                </span>
                                <span v-if="!isCompactPlanCards && renameForgePlanId !== plan.id" class="plan-count">({{ (plan.exerciseCount ?? plan.exercises?.length ?? 0) }} Übungen)</span>
                            </span>

                            <div class="plan-right">
                                <FavoriteButton :active="favoritePlans.includes(plan.id)"
                                                :titleActive="'Aus Favoriten entfernen'"
                                                :titleInactive="'Zu Favoriten hinzufügen'"
                                                @toggle="toggleFavoritePlan(plan.id)" />

                                <div class="inline-actions">
                                    <EditButton title="Plan bearbeiten" @click.stop="editPlanInBuilder(plan.id)" />
                                    <DeleteButton title="Plan löschen" @click="requestPlanDelete(plan, $event)" />
                                    <ActionIconButton title="Exportieren"
                                                      aria-label="Trainingsplan exportieren"
                                                     @click="downloadPlan(plan)">↓</ActionIconButton>
                                </div>

                                <span class="kebab-wrap">
                                    <ActionIconButton title="Mehr"
                                                      aria-label="Weitere Aktionen"
                                                      @click.stop="togglePlanMenu(plan.id)">⋯</ActionIconButton>
                                </span>

                                <ActionIconButton class="play-btn"
                                                  :data-preview-play="isPhonePreviewSimulationDemo ? 'simulation-demo' : null"
                                                  :data-tyg-play-button="plan.id"
                                                  :data-tyg-tutorial-play="props.planTutActive && props.planTutPlanId === plan.id ? 'true' : null"
                                                  title="Starten"
                                                  aria-label="Training starten"
                                                  @click.stop="startSimulation(plan)">
                                    <img class="play-icon" src="/PlayButton.png" alt="" aria-hidden="true" />
                                </ActionIconButton>
                            </div>

                            <PlanMenu v-if="planMenuOpenId === plan.id"
                                      @edit="editPlanInBuilder(plan.id)"
                                      @duplicate="duplicatePlan(plan)"
                                      @delete="requestPlanDelete(plan)"
                                      @download="downloadPlan(plan)" />
                        </div>
                    </div>
                </template>
            </Draggable>
        </div>

        <Transition name="plan-open-overlay-fade">
            <div v-if="planOpenOverlay.visible"
                 class="plan-open-overlay"
                 :class="{
                     'is-animating': planOpenOverlay.phase === 'to',
                     'is-settling': planOpenOverlay.phase === 'settling'
                 }"
                 :style="planOpenOverlayStyle"
                 aria-hidden="true">
                <div class="plan-open-overlay__sheen"></div>
                <div class="plan-open-overlay__line"></div>
                <div class="plan-open-overlay__content">
                    <span class="plan-open-overlay__title">{{ planOpenOverlay.name }}</span>
                    <span class="plan-open-overlay__meta">{{ planOpenOverlay.exerciseCount }} Übungen</span>
                </div>
            </div>
        </Transition>

        <!-- Ausgewählter Trainingsplan -->
        <Transition name="selected-plan-panel" mode="out-in">
            <div v-if="selectedPlan"
                 :key="selectedPlan.id"
                 ref="selectedPlanRoot"
                 class="workout-list selected-plan-shell"
                 :class="{
                     'plan-scroll-highlight': isPlanScrollHighlight,
                     'selected-plan-shell--expansion-hidden': planOpenOverlay.visible,
                     'selected-plan-shell--rename-forge': renameForgeSelectedId === selectedPlan.id
                 }">
            <div ref="selectedPlanAnchor" class="plan-header selected-plan-shell__section">
                <h3 class="section-title" @dblclick="renameSelectedPlan()">
                    <span class="plan-title-main"
                          :class="{ 'plan-title-main--sync': headerSyncPlanId === selectedPlan.id }">
                        Trainingsplan:
                        <span class="plan-title-main__name"
                              :class="{ 'plan-title-main__name--rename-forge': renameForgeSelectedId === selectedPlan.id }">
                            <span class="plan-title-main__name-live">{{ selectedPlan.name }}</span>
                            <span v-if="renameForgeSelectedId === selectedPlan.id && renameForgePayload"
                                  class="plan-title-rename-overlay plan-title-rename-overlay--selected"
                                  aria-hidden="true">
                                <span class="plan-title-rename-overlay__old">{{ renameForgePayload.oldName }}</span>
                                <span class="plan-title-rename-overlay__handwrite">{{ renameForgePayload.newName }}</span>
                                <span class="plan-title-rename-overlay__final">{{ renameForgePayload.newName }}</span>
                            </span>
                        </span>
                    </span>

                    <div v-if="selectedPlan.code"
                         class="plan-code-row"
                         :class="{ 'plan-code-row--sync': headerSyncPlanId === selectedPlan.id }">
                        <span class="plan-code-badge"
                              :title="`${selectedPlan.code} (Klick zum Kopieren)`"
                              @click.stop="copyPlanCode(selectedPlan.code)">
                            Code: {{ middleEllipsis(selectedPlan.code, 14) }}
                        </span>
                    </div>
                </h3>
                <div v-if="globalGoalHighlights.length" class="plan-goal-strip">
                    <span v-for="goal in globalGoalHighlights" :key="goal.goal.id" class="plan-goal-pill" :class="`is-${goal.status}`">
                        {{ goal.goal.title }} · {{ goal.currentLabel }} / {{ goal.targetLabel }}
                    </span>
                </div>
                <div class="plan-header-close">
                    <CloseButton title="Plan schließen" @click="closePlan" />
                </div>
            </div>

            <Table class="exercise-table full-width narrow selected-plan-shell__section" variant="narrow">
                <table ref="resizeTable" :data-cols="selectedPlanHasEquipmentNumbers ? 4 : 3">
                    <thead>
                        <tr>
                            <th v-if="selectedPlanHasEquipmentNumbers" class="resizable" :style="{ width: activeColumnWidths[0] + '%' }">
                                <span class="th-text">Nummer</span>
                            </th>
                            <th class="resizable" :style="{ width: activeColumnWidths[selectedPlanHasEquipmentNumbers ? 1 : 0] + '%' }">
                                <span class="th-text">Übung</span>
                            </th>
                            <th class="resizable" :style="{ width: activeColumnWidths[selectedPlanHasEquipmentNumbers ? 2 : 1] + '%' }">
                                <span class="th-text">
                                    {{ selectedPlan.exercises.some(ex => ex.type === 'ausdauer') ? 'Sätze / Min' : 'Sätze' }}
                                </span>
                            </th>
                            <th class="resizable th-wdh" :style="{ width: activeColumnWidths[selectedPlanHasEquipmentNumbers ? 3 : 2] + '%' }">
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
                        <tr v-for="(ex, index) in selectedPlan.exercises"
                            :key="index"
                            class="resizable-row plan-exercise-chain-row"
                            :style="{
                                height: rowHeights[index] + 'px',
                                '--exercise-chain-delay': `${Math.min(index, 11) * 85}ms`
                            }"
                            @dblclick="openEditPopupUi('selectedPlan', index, $event)">
                            <td v-if="selectedPlanHasEquipmentNumbers" :style="{ width: activeColumnWidths[0] + '%' }" class="exercise-number-cell">
                                <span class="exercise-number-pill">{{ formatExerciseNumber(ex) }}</span>
                            </td>
                            <td :style="{ width: activeColumnWidths[selectedPlanHasEquipmentNumbers ? 1 : 0] + '%' }">
                                <div class="plan-exercise-cell">
                                    <div class="plan-exercise-main">
                                        <span class="plan-exercise-name">{{ ex.exercise }}</span>
                                        <div v-if="getGoalHintsForExercise(ex.exercise).length" class="plan-goal-hints">
                                            <div v-for="goal in getGoalHintsForExercise(ex.exercise)" :key="goal.goal.id" class="plan-goal-hint" :class="`is-${goal.status}`">
                                                <span class="plan-goal-hint__title">{{ goal.goal.title }}</span>
                                                <span class="plan-goal-hint__meta">{{ goal.currentLabel }} / {{ goal.targetLabel }}</span>
                                                <span class="plan-goal-hint__copy">{{ goal.primaryText }}</span>
                                            </div>
                                        </div>
                                        <div v-if="formatPauseValue(ex) || ex.tempoHint" class="plan-exercise-meta">
                                            <span v-if="formatPauseValue(ex)" class="plan-exercise-meta__item">
                                                <strong>Pause:</strong> {{ formatPauseValue(ex) }}
                                            </span>
                                            <span v-if="ex.tempoHint" class="plan-exercise-meta__item">
                                                <strong>Tempo:</strong> {{ ex.tempoHint }}
                                            </span>
                                        </div>
                                        <div v-if="ex.replacementExercise" class="plan-replacement-card">
                                            <span class="plan-replacement-card__label">Ersatzübung</span>
                                            <span class="plan-replacement-card__name">{{ ex.replacementExercise }}</span>
                                            <span v-if="ex.replacementReason" class="plan-replacement-card__reason">{{ ex.replacementReason }}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td :style="{ width: activeColumnWidths[selectedPlanHasEquipmentNumbers ? 2 : 1] + '%' }">
                                {{ ex.type === 'ausdauer' ? `${ex.sets} min` : ex.sets }}
                            </td>
                            <td :style="{ width: activeColumnWidths[selectedPlanHasEquipmentNumbers ? 3 : 2] + '%' }">
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
                    class="custom-toggle-btn selected-plan-shell__section"
                    :class="{ on: showCustomExercises }"
                    :aria-expanded="showCustomExercises"
                    @click="toggleCustomExercises">
                <span class="custom-toggle-text">
                    {{ showCustomExercises ? 'Benutzerdefinierte Übungen ausblenden' : 'Benutzerdefinierte Übungen anzeigen' }}
                </span>
                <span class="custom-toggle-arrow" aria-hidden="true"></span>
            </button>

            <div v-if="showCustomExercises" class="selected-plan-shell__section">
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
                                    @dblclick="openEditPopupUi('customExerciseName', i)">
                                    <span>{{ ex.name }}</span>
                                </td>

                                <td class="v-stack"
                                    :style="{ width: customColWidths[1] + '%' }"
                                    @dblclick="openEditPopupUi('customExerciseMuscle', i)">
                                    <span>{{ ex.muscle }}</span>
                                </td>

                                <td :style="{ width: customColWidths[2] + '%' }"
                                    @dblclick="openEditPopupUi('customExerciseType', i)">
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
        </Transition>
    </div>

    <Transition name="delete-trash">
        <div v-if="deleteTrashState.visible" class="delete-trash-overlay" aria-hidden="true">
            <div
                v-if="deleteTrashState.planName"
                class="delete-trash-flight"
                :style="deleteTrashFlightStyle">
                <span class="delete-trash-flight__badge">Gelöscht!</span>
                <span class="delete-trash-flight__title">{{ deleteTrashState.planName }}</span>
            </div>
            <div class="delete-trash-bin">
                <div class="delete-trash-bin__lid"></div>
                <div class="delete-trash-bin__body"></div>
            </div>
        </div>
    </Transition>

    <PlanCreatedTutorial :isActive="!!planTutActive"
                         :planId="planTutPlanId ?? null"
                         :openPlan="openPlanFromTutorial"
                         @done="closePlanTut"
                         @skipped="closePlanTut" />

    <TrainingSimulation :show="simOpen"
                        :plan="simPlan"
                        :followUpMode="simFollowupMode"
                        :followUpSessionId="simFollowupSessionId"
                        :followUpFeedback="simFollowupFeedback"
                        :followUpHasPainDiaryToday="simFollowupPainDiaryToday"
                        @close="closeSimulation"
                        @progressSave="onSimProgressSave"
                        @progressInvalid="onSimProgressInvalid"
                        @progressCancel="onSimProgressCancel" />
</template>
<script setup lang="ts">
    import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
    import { useRoute } from 'vue-router'
    import Draggable from 'vuedraggable'

    import UiSearch from '@/components/ui/kits/UiSearch.vue'
    import Table from '@/components/ui/kits/UiTable.vue'

    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import EditButton from '@/components/ui/buttons/EditButton.vue'
    import DeleteButton from '@/components/ui/buttons/DeleteButton.vue'
    import ActionIconButton from '@/components/ui/buttons/ActionIconButton.vue'
    import CloseButton from '@/components/ui/buttons/CloseButton.vue'
    import PlanMenu from '@/components/ui/menu/PlanMenu.vue'

    import { useTrainingPlansStore } from '@/store/trainingPlansStore'
    import { useAuthStore } from '@/store/authStore'
    import { useGoalsStore } from '@/store/goalsStore'
    import { useWeightStore } from '@/store/weightStore'
    import type { TrainingPlan as TrainingPlanDto, TrainingPlanUpsert } from '@/types/trainingPlan'
    import { getTrainingPlanByCode, installTrainingPlanByCode } from "@/services/trainingPlans"

    import PlanCreatedTutorial from "@/components/ui/TygTutorials/PlanCreatedTutorial.vue"
    import TrainingSimulation from "@/components/ui/popups/TrainingSimulation.vue"
    import { useProgressStore } from "@/store/progressStore"
    import { listTrainingSessions, type TrainingSessionFeedbackPayload, type TrainingSessionFeedbackRecord } from "@/services/trainingSessions"
    import { hasPainDiaryEntryForDay } from '@/components/ui/feedback/painDiary'
    import { evaluateTrainingGoals, goalMatchesExerciseName } from '@/utils/goalTracking'
    import { LS_PROGRESS_WEIGHTS, LS_PROGRESS_WORKOUTS } from '@/constants/storageKeys'
    import type { GoalWeightSample, GoalWorkoutSample, TrainingGoalEvaluation } from '@/types/goals'
    import { showDeleteTrashOverlay, DELETE_TRASH_ANIMATION_MS } from '@/composables/useDeleteTrashOverlay'

    /* -------------------- Types (nur Plans) -------------------- */
    type ExerciseType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'
    type CustomExerciseType = Exclude<ExerciseType, 'ausdauer'>
    type RangeCapableValue = number | string

    interface PlanExercise {
        exercise: string
        sets: RangeCapableValue
        reps: RangeCapableValue
        goal?: string
        type?: ExerciseType
        restSeconds?: number | null
        notes?: string
        recoveryHint?: string
        tempoHint?: string
        equipmentNumber?: string
        replacementExercise?: string
        replacementReason?: string
    }

    type ViewPlan = {
        id: string
        name: string
        isFavorite: boolean
        code?: string | null
        exercises: PlanExercise[]
        exerciseCount: number
    }

    const props = defineProps<{
        // Gäste-Pläne kommen vom Parent (weil der Builder dort sitzt)
        guestPlans?: ViewPlan[]
        onEditInBuilder?: (payload: { planId: string; name: string; exercises: PlanExercise[] }) => void
        selectedPlanOverride?: ViewPlan | null
        renameEffect?: { planId: string; oldName: string; newName: string; nonce: number } | null
        onSelectedPlanChange?: (plan: ViewPlan | null) => void

        // ? Custom Exercises kommen vom Parent (Quelle bleibt 1x: Training.vue / Builder)
        customExercises?: Array<{ name: string; muscle: string; type: CustomExerciseType }>
        onRemoveCustomExercise?: (index: number) => void

        // Guest-Aktionen zurück an Parent (weil Parent die Quelle der Wahrheit ist)
        onGuestDeletePlan?: (planId: string) => void
        onGuestEditPlan?: (planId: string) => void
        onGuestPlanCreated?: (plan: ViewPlan) => void

        // Parent-UI Aktionen (Popups + Toast)
        openEditPopup: (
            type:
                | 'table'
                | 'selectedPlan'
                | 'planName'
                | 'selectedPlanName'
                | 'customExerciseName'
                | 'customExerciseMuscle'
                | 'customExerciseType',
            index: number | string,
            event?: MouseEvent
        ) => void

        openDeletePopup: (action: () => void) => void
        openDownloadPopup: (plan: ViewPlan, opts?: { shareLines?: string[]; shareText?: string; shareUrl?: string }) => void

        addToast: (message: string, type?: 'delete' | 'add' | 'save' | 'timer' | 'load') => void

        // ? Tutorial (Option B)
        planTutActive?: boolean
        planTutPlanId?: string | null
    }>()

    const emit = defineEmits<{
        (e: "planTutDone"): void
    }>()

    const closePlanTut = () => emit("planTutDone")
    const dismissPlanTutIfActive = () => {
        if (props.planTutActive) closePlanTut()
    }
    const route = useRoute()
    const isPhonePreviewSimulationDemo = computed(
        () => route.query.preview === 'phone' && route.query.demo === 'simulation'
    )
    const goalsStore = useGoalsStore()
    const weightStore = useWeightStore()
    const localGoalWeightHistory = ref<GoalWeightSample[]>([])
    const localGoalWorkouts = ref<GoalWorkoutSample[]>([])
    const deleteTrashState = ref({
        visible: false,
        planName: '',
        startX: 0,
        startY: 0,
        deltaX: 0,
        deltaY: 0,
    })
    let deleteTrashTimer: ReturnType<typeof setTimeout> | null = null
    const deleteCardPlanId = ref<string | null>(null)
    const duplicateEchoPlanId = ref<string | null>(null)
    let duplicateEchoTimer: ReturnType<typeof setTimeout> | null = null
    const planCardRefs = new Map<string, HTMLElement>()
    let reorderFlowTimer: ReturnType<typeof setTimeout> | null = null
    const reorderFlow = ref<{
        active: boolean
        list: 'favorites' | 'others' | null
        draggedId: string | null
        overId: string | null
        direction: 'up' | 'down' | null
    }>({
        active: false,
        list: null,
        draggedId: null,
        overId: null,
        direction: null,
    })
    const reorderSettle = ref<{
        active: boolean
        ids: string[]
        direction: 'up' | 'down' | null
    }>({
        active: false,
        ids: [],
        direction: null,
    })
    const favoriteOrderIds = ref<string[]>([])
    const otherOrderIds = ref<string[]>([])
    const guestPlanOrder = ref<string[]>([])
    let headerSyncTimer: ReturnType<typeof setTimeout> | null = null
    let favoriteTransferTimer: ReturnType<typeof setTimeout> | null = null
    let renameForgeTimer: ReturnType<typeof setTimeout> | null = null
    const headerSyncPlanId = ref<string | null>(null)
    const renameForgePlanId = ref<string | null>(null)
    const renameForgeSelectedId = ref<string | null>(null)
    const renameForgePayload = ref<{ oldName: string; newName: string } | null>(null)
    const favoriteTransfer = ref<{
        planId: string | null
        direction: 'to-favorite' | 'from-favorite' | null
    }>({
        planId: null,
        direction: null,
    })
    const planOpenOverlay = ref<{
        visible: boolean
        phase: 'idle' | 'from' | 'to' | 'settling'
        planId: string | null
        name: string
        exerciseCount: number
        fromRect: { top: number; left: number; width: number; height: number } | null
        toRect: { top: number; left: number; width: number; height: number } | null
    }>({
        visible: false,
        phase: 'idle',
        planId: null,
        name: '',
        exerciseCount: 0,
        fromRect: null,
        toRect: null,
    })

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

    async function ensureGoalTrackingData() {
        goalsStore.load()

        if (!auth.user) {
            loadGoalTrackingLocalData()
            return
        }

        try {
            await weightStore.loadEntries()
        } catch { }

        try {
            await trainingPlansStore.loadList()
        } catch { }

        const planIds = trainingPlansStore.items
            .map((plan: TrainingPlanDto) => plan.id)
            .filter((id: string) => !!id)

        await Promise.all(planIds.map(async (id: string) => {
            try {
                await progressStore.load(id)
            } catch { }
        }))
    }
    const openDeletePopupUi = (action: () => void) => {
        dismissPlanTutIfActive()
        props.openDeletePopup(action)
    }

    const clearDeleteTrashTimer = () => {
        if (deleteTrashTimer) {
            clearTimeout(deleteTrashTimer)
            deleteTrashTimer = null
        }
    }

    const clearDuplicateEcho = () => {
        if (duplicateEchoTimer) {
            clearTimeout(duplicateEchoTimer)
            duplicateEchoTimer = null
        }
        duplicateEchoPlanId.value = null
    }

    const setPlanCardRef = (planId: string, el: HTMLElement | null) => {
        if (!el) {
            planCardRefs.delete(planId)
            return
        }
        planCardRefs.set(planId, el)
    }

    const rectToPlain = (rect: DOMRect | { top: number; left: number; width: number; height: number }) => ({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    })

    const resetPlanOpenOverlay = () => {
        planOpenOverlay.value = {
            visible: false,
            phase: 'idle',
            planId: null,
            name: '',
            exerciseCount: 0,
            fromRect: null,
            toRect: null,
        }
    }

    const triggerHeaderSync = (planId: string | null) => {
        if (!planId) return
        if (headerSyncTimer) clearTimeout(headerSyncTimer)
        headerSyncPlanId.value = planId
        headerSyncTimer = setTimeout(() => {
            headerSyncPlanId.value = null
            headerSyncTimer = null
        }, 620)
    }

    const clearRenameForge = () => {
        if (renameForgeTimer) {
            clearTimeout(renameForgeTimer)
            renameForgeTimer = null
        }
        renameForgePlanId.value = null
        renameForgeSelectedId.value = null
        renameForgePayload.value = null
    }

    const triggerRenameForge = async (planId: string, oldName: string, newName: string) => {
        if (!planId || !oldName || !newName || oldName === newName) return

        clearRenameForge()
        renameForgePlanId.value = planId
        renameForgePayload.value = { oldName, newName }
        if (selectedPlan.value?.id === planId) renameForgeSelectedId.value = planId

        await nextTick()

        renameForgeTimer = setTimeout(() => {
            renameForgePlanId.value = null
            renameForgeSelectedId.value = null
            renameForgePayload.value = null
            renameForgeTimer = null
        }, 1650)
    }

    const triggerRenameForgeFromPayload = (detail?: { planId?: string; oldName?: string; newName?: string } | null) => {
        const planId = String(detail?.planId ?? '').trim()
        const oldName = String(detail?.oldName ?? '').trim()
        const newName = String(detail?.newName ?? '').trim()
        if (!planId || !oldName || !newName || oldName === newName) return
        void triggerRenameForge(planId, oldName, newName)
    }

    const triggerFavoriteTransfer = (planId: string, direction: 'to-favorite' | 'from-favorite') => {
        if (favoriteTransferTimer) clearTimeout(favoriteTransferTimer)
        favoriteTransfer.value = { planId, direction }
        favoriteTransferTimer = setTimeout(() => {
            favoriteTransfer.value = { planId: null, direction: null }
            favoriteTransferTimer = null
        }, 900)
    }

    const waitForFavoriteRelease = (direction: 'to-favorite' | 'from-favorite') =>
        direction === 'from-favorite'
            ? new Promise((resolve) => setTimeout(resolve, 280))
            : Promise.resolve()

    const prefersReducedMotion = () =>
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resolvePlanCardEl = (planId: string, source?: Event | HTMLElement | null) => {
        if (source instanceof HTMLElement) return source.closest('.plan-item') as HTMLElement | null
        if (source instanceof MouseEvent) {
            return ((source.currentTarget as HTMLElement | null)?.closest('.plan-item')
                ?? (source.target as HTMLElement | null)?.closest('.plan-item')) as HTMLElement | null
        }
        return planCardRefs.get(planId) ?? null
    }

    const beginPlanOpenOverlay = (plan: ViewPlan | null, source?: Event | HTMLElement | null) => {
        if (!plan) return false
        if (prefersReducedMotion() || isCompactPlanCards.value) {
            resetPlanOpenOverlay()
            return false
        }

        const sourceEl = resolvePlanCardEl(plan.id, source)
        if (!sourceEl) {
            resetPlanOpenOverlay()
            return false
        }

        const rect = sourceEl.getBoundingClientRect()
        if (!rect.width || !rect.height) {
            resetPlanOpenOverlay()
            return false
        }

        planOpenOverlay.value = {
            visible: true,
            phase: 'from',
            planId: plan.id,
            name: plan.name,
            exerciseCount: Number(plan.exerciseCount ?? plan.exercises?.length ?? 0),
            fromRect: rectToPlain(rect),
            toRect: rectToPlain(rect),
        }
        return true
    }

    const finishPlanOpenOverlay = async () => {
        if (!planOpenOverlay.value.visible) return
        await nextTick()
        const target = selectedPlanRoot.value
        if (!target) {
            resetPlanOpenOverlay()
            return
        }

        const targetRect = target.getBoundingClientRect()
        planOpenOverlay.value = {
            ...planOpenOverlay.value,
            phase: 'to',
            toRect: rectToPlain(targetRect),
        }

        await new Promise((resolve) => window.setTimeout(resolve, 360))
        planOpenOverlay.value = {
            ...planOpenOverlay.value,
            phase: 'settling',
        }
        triggerHeaderSync(planOpenOverlay.value.planId)
        await new Promise((resolve) => window.setTimeout(resolve, 120))
        resetPlanOpenOverlay()
    }

    const planOpenOverlayStyle = computed<Record<string, string>>(() => {
        const overlay = planOpenOverlay.value
        const rect =
            overlay.phase === 'from'
                ? overlay.fromRect
                : (overlay.toRect ?? overlay.fromRect)

        if (!overlay.visible || !rect) {
            return {
                display: 'none',
                top: '0px',
                left: '0px',
                width: '0px',
                height: '0px',
                borderRadius: '18px',
                opacity: '0',
            }
        }

        const isExpanded = overlay.phase === 'to' || overlay.phase === 'settling'
        return {
            display: 'block',
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            borderRadius: isExpanded ? '26px' : '18px',
            opacity: overlay.phase === 'settling' ? '0' : '1',
        }
    })

    const clearReorderFlowTimer = () => {
        if (!reorderFlowTimer) return
        clearTimeout(reorderFlowTimer)
        reorderFlowTimer = null
    }

    const resetReorderFlow = () => {
        clearReorderFlowTimer()
        reorderFlow.value = {
            active: false,
            list: null,
            draggedId: null,
            overId: null,
            direction: null,
        }
        reorderSettle.value = {
            active: false,
            ids: [],
            direction: null,
        }
    }

    const onPlanDragStart = (event: any, list: 'favorites' | 'others') => {
        dismissPlanTutIfActive()
        clearReorderFlowTimer()
        reorderSettle.value = {
            active: false,
            ids: [],
            direction: null,
        }
        const draggedId = String(event?.item?.dataset?.planId ?? '')
        reorderFlow.value = {
            active: true,
            list,
            draggedId: draggedId || null,
            overId: draggedId || null,
            direction: null,
        }
    }

    const onPlanDragChange = (event: any, list: 'favorites' | 'others') => {
        const moved = event?.moved
        if (!moved) return
        const items = list === 'favorites' ? favoritePlanItems.value : otherPlanItems.value
        const direction =
            moved.newIndex > moved.oldIndex ? 'down'
                : moved.newIndex < moved.oldIndex ? 'up'
                    : null
        const overId = String(items[moved.newIndex]?.id ?? moved.element?.id ?? '')
        reorderFlow.value = {
            active: true,
            list,
            draggedId: String(moved.element?.id ?? reorderFlow.value.draggedId ?? ''),
            overId: overId || null,
            direction,
        }
    }

    const onPlanDragEnd = () => {
        const state = reorderFlow.value
        const items = state.list === 'favorites' ? favoritePlanItems.value : otherPlanItems.value
        const overIndex = items.findIndex((item) => item.id === state.overId)
        const settleIds = items
            .filter((item, index) => state.draggedId !== item.id && overIndex >= 0 && Math.abs(index - overIndex) <= 1)
            .map((item) => item.id)

        reorderFlow.value = {
            active: false,
            list: state.list,
            draggedId: null,
            overId: null,
            direction: null,
        }

        reorderSettle.value = {
            active: settleIds.length > 0,
            ids: settleIds,
            direction: state.direction,
        }

        clearReorderFlowTimer()
        reorderFlowTimer = setTimeout(() => {
            reorderSettle.value = {
                active: false,
                ids: [],
                direction: null,
            }
        }, 220)
    }

    const getPlanMotionClasses = (planId: string, list: 'favorites' | 'others') => {
        const state = reorderFlow.value
        const settle = reorderSettle.value
        if (!state.active || state.list !== list) {
            return {
                'plan-item--settle-up': settle.active && settle.direction === 'up' && settle.ids.includes(planId),
                'plan-item--settle-down': settle.active && settle.direction === 'down' && settle.ids.includes(planId),
            }
        }

        const items = list === 'favorites' ? favoritePlanItems.value : otherPlanItems.value
        const currentIndex = items.findIndex((item) => item.id === planId)
        const overIndex = items.findIndex((item) => item.id === state.overId)
        if (currentIndex < 0 || overIndex < 0) {
            return {
                'plan-item--drag-source': state.draggedId === planId,
            }
        }

        const delta = currentIndex - overIndex
        return {
            'plan-item--drag-source': state.draggedId === planId,
            'plan-item--reorder-focus': state.overId === planId && state.draggedId !== planId,
            'plan-item--reorder-near': state.draggedId !== planId && Math.abs(delta) === 1,
            'plan-item--lane-right': state.draggedId !== planId && state.direction === 'up' && delta >= 0 && delta <= 2,
            'plan-item--lane-left': state.draggedId !== planId && state.direction === 'down' && delta <= 0 && delta >= -2,
            'plan-item--settle-up': settle.active && settle.direction === 'up' && settle.ids.includes(planId),
            'plan-item--settle-down': settle.active && settle.direction === 'down' && settle.ids.includes(planId),
        }
    }

    const triggerDuplicateEcho = async (planId: string) => {
        clearDuplicateEcho()
        await nextTick()
        duplicateEchoPlanId.value = planId
        const card = document.querySelector<HTMLElement>(`.plan-item[data-plan-id="${planId}"]`)
        card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        duplicateEchoTimer = setTimeout(() => {
            duplicateEchoPlanId.value = null
            duplicateEchoTimer = null
        }, 1150)
    }

    const hideDeleteTrash = () => {
        clearDeleteTrashTimer()
        deleteCardPlanId.value = null
        deleteTrashState.value = {
            visible: false,
            planName: '',
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
        }
    }

    const inferExerciseCategory = (exercise: PlanExercise): number => {
        switch (exercise.type) {
            case 'calisthenics': return 1
            case 'dehnung': return 2
            case 'ausdauer': return 3
            default: return 0
        }
    }

    const buildExerciseNotes = (exercise: PlanExercise): string | null => {
        const lines: string[] = []
        if (exercise.notes) lines.push(String(exercise.notes).trim())
        if (exercise.recoveryHint) lines.push(`Pause: ${String(exercise.recoveryHint).trim()}`)
        if (exercise.tempoHint) lines.push(`Tempo: ${String(exercise.tempoHint).trim()}`)
        if (exercise.equipmentNumber) lines.push(`Gerätenummer: ${String(exercise.equipmentNumber).trim()}`)
        if (exercise.replacementExercise) lines.push(`Ersatz: ${String(exercise.replacementExercise).trim()}`)
        if (exercise.replacementReason) lines.push(`Ersatzgrund: ${String(exercise.replacementReason).trim()}`)
        const value = lines.filter(Boolean).join('\n').trim()
        return value || null
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

    const buildExercisePayloadNotes = (exercise: PlanExercise): string | null => {
        const lines = String(buildExerciseNotes(exercise) ?? '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)

        if (typeof exercise.sets === 'string' && exercise.type !== 'ausdauer') {
            lines.push(`Sätze: ${exercise.sets}`)
        }

        if (typeof exercise.reps === 'string' && exercise.type !== 'ausdauer') {
            lines.push(`Wiederholungen: ${exercise.reps}`)
        }

        return lines.length ? lines.join('\n') : null
    }

    const mapPlanExercisesToUpsert = (exercises: PlanExercise[]) =>
        exercises.map((exercise, index) => ({
            name: exercise.exercise,
            category: inferExerciseCategory(exercise),
            sortOrder: index,
            sets: exercise.type === 'ausdauer' ? null : parseRangeCapableNumber(exercise.sets),
            reps: exercise.type === 'ausdauer' ? null : parseRangeCapableNumber(exercise.reps),
            durationMin: exercise.type === 'ausdauer' ? parseRangeCapableNumber(exercise.sets) : null,
            distanceKm: exercise.type === 'ausdauer' ? parseRangeCapableNumber(exercise.reps) : null,
            restSeconds: Number(exercise.restSeconds ?? 0) || null,
            notes: buildExercisePayloadNotes(exercise),
        }))

    const getDuplicatePlanName = (baseName: string) => {
        const existing = new Set(plans.value.map((plan) => plan.name.trim().toLocaleLowerCase()))
        const cleanBase = baseName.trim() || 'Trainingsplan'
        const first = `${cleanBase} Kopie`
        if (!existing.has(first.toLocaleLowerCase())) return first
        let index = 2
        while (existing.has(`${cleanBase} Kopie ${index}`.toLocaleLowerCase())) index += 1
        return `${cleanBase} Kopie ${index}`
    }

    const duplicatePlan = async (plan: ViewPlan) => {
        dismissPlanTutIfActive()
        closePlanMenu()
        const nextName = getDuplicatePlanName(plan.name)

        if (!auth.user) {
            const nextPlan: ViewPlan = {
                ...cloneViewPlan(plan)!,
                id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
                    ? crypto.randomUUID()
                    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
                name: nextName,
                isFavorite: false,
                code: null,
            }
            props.onGuestPlanCreated?.(nextPlan)
            props.addToast('Plan dupliziert', 'add')
            await triggerDuplicateEcho(nextPlan.id)
            await loadPlan(nextPlan.id)
            return
        }

        try {
            await trainingPlansStore.loadOne(plan.id)

            const dtoFull =
                getSelectedAccountPlanDto(plan.id) ??
                getAccountPlanDto(plan.id) ??
                null

            if (!dtoFull) {
                props.addToast('Plan konnte nicht geladen werden', 'delete')
                return
            }

            const payload: TrainingPlanUpsert = {
                name: nextName,
                isFavorite: false,
                days: Array.isArray(dtoFull.days)
                    ? dtoFull.days.map((day: NonNullable<TrainingPlanDto['days']>[number]) => ({
                        name: day.name,
                        sortOrder: day.sortOrder,
                        exercises: Array.isArray(day.exercises)
                            ? day.exercises.map((exercise: NonNullable<NonNullable<TrainingPlanDto['days']>[number]['exercises']>[number]) => ({
                                name: exercise.name,
                                category: exercise.category,
                                sortOrder: exercise.sortOrder,
                                sets: exercise.sets ?? null,
                                reps: exercise.reps ?? null,
                                targetWeight: exercise.targetWeight ?? null,
                                restSeconds: exercise.restSeconds ?? null,
                                durationMin: exercise.durationMin ?? null,
                                distanceKm: exercise.distanceKm ?? null,
                                notes: exercise.notes ?? null,
                            }))
                            : [],
                    }))
                    : [{
                        name: 'Tag 1',
                        sortOrder: 0,
                        exercises: mapPlanExercisesToUpsert(plan.exercises),
                    }],
            }
            const created = await trainingPlansStore.create(payload)
            const createdId = String((created as any)?.id ?? '')
            props.addToast('Plan dupliziert', 'add')
            if (createdId) {
                await triggerDuplicateEcho(createdId)
                await loadPlan(createdId)
            }
        } catch {
            props.addToast('Duplizieren fehlgeschlagen', 'delete')
        }
    }

    const requestPlanDelete = (plan: ViewPlan, event?: MouseEvent) => {
        dismissPlanTutIfActive()
        closePlanMenu()
        openDeletePopupUi(() => {
            clearDeleteTrashTimer()

            const fallbackX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0
            const fallbackY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0
            const startX = event?.clientX ?? fallbackX
            const startY = event?.clientY ?? Math.max(140, fallbackY - 40)
            const targetX = typeof window !== 'undefined' ? window.innerWidth / 2 : startX
            const targetY = typeof window !== 'undefined' ? window.innerHeight - 84 : startY

            deleteCardPlanId.value = plan.id
            deleteTrashState.value = {
                visible: true,
                planName: plan.name,
                startX,
                startY,
                deltaX: targetX - startX,
                deltaY: targetY - startY,
            }
            showDeleteTrashOverlay({
                startX,
                startY,
                title: plan.name,
                targetX,
                targetY,
                durationMs: DELETE_TRASH_ANIMATION_MS,
            })

            deleteTrashTimer = setTimeout(() => {
                hideDeleteTrash()
                void executeDeletePlan(plan.id)
            }, DELETE_TRASH_ANIMATION_MS)
        })
    }

    const openEditPopupUi = (
        type:
            | 'table'
            | 'selectedPlan'
            | 'planName'
            | 'selectedPlanName'
            | 'customExerciseName'
            | 'customExerciseMuscle'
            | 'customExerciseType',
        index: number | string,
        event?: MouseEvent
    ) => {
        dismissPlanTutIfActive()
        props.openEditPopup(type, index, event)
    }
    const openDownloadPopupUi = (plan: ViewPlan, opts?: { shareLines?: string[]; shareText?: string; shareUrl?: string }) => {
        dismissPlanTutIfActive()
        props.openDownloadPopup(plan, opts)
    }

    const simOpen = ref(false)
    const simPlan = ref<ViewPlan | null>(null)
    const simFollowupMode = ref(false)
    const simFollowupSessionId = ref<string | null>(null)
    const simFollowupFeedback = ref<TrainingSessionFeedbackPayload | null>(null)
    const simFollowupPainDiaryToday = ref(false)

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

    const globalGoalHighlights = computed(() =>
        evaluatedGoals.value.filter(goal => goal.goal.type === 'body_weight' || goal.goal.type === 'weekly_frequency')
    )

    const deleteTrashFlightStyle = computed(() => ({
        left: `${deleteTrashState.value.startX}px`,
        top: `${deleteTrashState.value.startY}px`,
        '--delete-fly-x': `${deleteTrashState.value.deltaX}px`,
        '--delete-fly-y': `${deleteTrashState.value.deltaY}px`,
    }))

    function getGoalHintsForExercise(exerciseName: string) {
        const target = String(exerciseName ?? '').trim()
        if (!target) return [] as TrainingGoalEvaluation[]
        return evaluatedGoals.value.filter(goal =>
            (goal.goal.type === 'exercise_weight' || goal.goal.type === 'exercise_reps')
            && goalMatchesExerciseName(goal.goal, target)
        )
    }

    const downloadPlan = async (plan: ViewPlan) => {
        closePlanMenu()
        dismissPlanTutIfActive()

        // Gast: hat exercises schon drin
        if (!auth.user) {
            openDownloadPopupUi(plan, { shareLines: buildShareLinesForPlan(plan) })
            return
        }

        const hasAnyExercises = (p: any) =>
            Array.isArray(p?.days) &&
            p.days.some((d: any) => Array.isArray(d?.exercises) && d.exercises.length > 0)

        try {
            // 1) quick try: item aus store
            let dto = getAccountPlanDto(plan.id)

            // 2) wenn "light" -> full nachladen (genau wie beim Öffnen)
            if (!dto || !hasAnyExercises(dto)) {
                await trainingPlansStore.loadOne(plan.id)
                dto =
                    getSelectedAccountPlanDto(plan.id) ??
                    getAccountPlanDto(plan.id) ??
                    null
            }

            if (!dto) {
                props.addToast('Plan konnte nicht geladen werden', 'delete')
                return
            }

            // 3) export braucht ViewPlan mit exercises
            const fullView = flattenDto(dto)
            openDownloadPopupUi(fullView, { shareLines: buildShareLinesForPlan(fullView) })
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const todayLocalKey = () => {
        const now = new Date()
        const y = now.getFullYear()
        const m = String(now.getMonth() + 1).padStart(2, '0')
        const d = String(now.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    const isSameTrainingDay = (finishedAtUtc?: string | null) => {
        const key = String(finishedAtUtc ?? '').slice(0, 10)
        if (!key) return false
        return key === todayLocalKey() || key === new Date().toISOString().slice(0, 10)
    }

    const feedbackFromSession = (row: TrainingSessionFeedbackRecord): TrainingSessionFeedbackPayload | null => {
        if (!row.feedbackId) return null
        return {
            intensity: row.intensity ?? null,
            bestExercise: row.bestExercise ?? null,
            strengthTechnique: row.strengthTechnique ?? null,
            cardioIntensity: row.cardioIntensity ?? null,
            stretchPain: row.stretchPain ?? null,
            note: row.note ?? '',
        }
    }

    const latestTodaySessionForPlan = async (planId: string): Promise<TrainingSessionFeedbackRecord | null> => {
        if (!auth.user) return null
        try {
            const rows = await listTrainingSessions({ planId })
            const todayRows = rows
                .filter((row) => isSameTrainingDay(row.finishedAtUtc))
                .sort((a, b) => String(b.finishedAtUtc ?? '').localeCompare(String(a.finishedAtUtc ?? '')))
            return todayRows[0] ?? null
        } catch {
            return null
        }
    }

    const hasPainDiaryForToday = () => {
        const localDay = todayLocalKey()
        const utcDay = new Date().toISOString().slice(0, 10)
        return hasPainDiaryEntryForDay({ source: 'training-simulation', day: localDay })
            || hasPainDiaryEntryForDay({ source: 'training-simulation', day: utcDay })
    }

    const hasProgressEntriesForToday = async (planId: string) => {
        try {
            await progressStore.load(planId, true)
        } catch {
            return false
        }

        const items = progressStore.byPlan?.[planId]?.items ?? []
        const localDay = todayLocalKey()
        const utcDay = new Date().toISOString().slice(0, 10)
        return items.some((row: any) => {
            const day = String(row?.date ?? '').slice(0, 10)
            return day === localDay || day === utcDay
        })
    }

    const startSimulation = async (plan: ViewPlan) => {
        closePlanMenu()
        dismissPlanTutIfActive()

        // Gast: hat i.d.R. schon exercises drin
        if (!auth.user) {
            simPlan.value = plan
            simFollowupMode.value = false
            simFollowupSessionId.value = null
            simFollowupFeedback.value = null
            simFollowupPainDiaryToday.value = false
            simOpen.value = true
            return
        }

        // Account: items sind oft "light" ? full nachladen
        const hasAnyExercises = (p: any) =>
            Array.isArray(p?.days) &&
            p.days.some((d: any) => Array.isArray(d?.exercises) && d.exercises.length > 0)

        try {
            let dto = getAccountPlanDto(plan.id)

            if (!dto || !hasAnyExercises(dto)) {
                await trainingPlansStore.loadOne(plan.id)
                dto =
                    getSelectedAccountPlanDto(plan.id) ??
                    getAccountPlanDto(plan.id) ??
                    null
            }

            if (!dto) {
                props.addToast('Plan konnte nicht geladen werden', 'delete')
                return
            }

            // sim braucht ViewPlan mit exercises
            simPlan.value = flattenDto(dto)
            const todaySession = await latestTodaySessionForPlan(simPlan.value.id)
            const hasTodayEntries = await hasProgressEntriesForToday(simPlan.value.id)
            if (todaySession && hasTodayEntries) {
                simFollowupMode.value = true
                simFollowupSessionId.value = todaySession.sessionId
                simFollowupFeedback.value = feedbackFromSession(todaySession)
                simFollowupPainDiaryToday.value = hasPainDiaryForToday()
                simOpen.value = true
                return
            }

            simFollowupMode.value = false
            simFollowupSessionId.value = null
            simFollowupFeedback.value = null
            simFollowupPainDiaryToday.value = false
            simOpen.value = true
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const closeSimulation = () => {
        simOpen.value = false
        simPlan.value = null
        simFollowupMode.value = false
        simFollowupSessionId.value = null
        simFollowupFeedback.value = null
        simFollowupPainDiaryToday.value = false
    }
    const openPlanFromTutorial = (planId: string) => {
        loadPlan(planId)
    }
    /* -------------------- Stores -------------------- */
    const trainingPlansStore = useTrainingPlansStore()
    const auth = useAuthStore()

    const progressStore = useProgressStore()

    // nimmt das Workout aus ProgressEntryModal und macht es API-safe
    const toCreatePayload = (workout: any) => {
        const { id, planId, ...rest } = (workout ?? {})
        return rest
    }

    const toUpdatePayload = (workout: any) => {
        const { id, planId, ...rest } = (workout ?? {})
        return rest
    }

    const onSimProgressSave = async (payload: any) => {
        const workout = payload?.workout ?? null
        if (!workout) return

        // PlanId kommt im Normalfall aus dem Workout (ProgressEntryModal kriegt planId)
        const planId =
            (workout?.planId as string | null) ??
            (simPlan.value?.id ?? null)

        if (!planId) return

        // Gäste / lokale IDs: progressStore.load blockt GUID sowieso.
        // Wir skippen persistieren hier hart, damit nix weird passiert.
        if (!auth.user) return

        try {
            if (workout?.id) {
                await progressStore.edit(planId, String(workout.id), toUpdatePayload(workout))
            } else {
                await progressStore.add(planId, toCreatePayload(workout))
            }

            // direkt refresh, damit PlanProgressPopup sofort sauber ist
            await progressStore.load(planId, true)
        } catch (e) {
            // du hast hier keinen Toast in der Signatur vom Event,
            // aber du hast props.addToast im Component.
            props.addToast("Progress speichern fehlgeschlagen", "delete")
        }
    }

    const onSimProgressInvalid = (_errors: string[]) => {
        // optional: props.addToast("Bitte prüf deine Eingaben", "delete")
    }

    const onSimProgressCancel = () => {
        // optional: nix tun
    }

    /* -------------------- Helpers -------------------- */
    const canUseLocalStorage = () => !!auth.user

    const LS_FAV_ORDER = 'LS_TRAINING_FAV_ORDER_IDS'
    const LS_OTHER_ORDER = 'LS_TRAINING_OTHER_ORDER_IDS'

    const readFavOrder = (): string[] => {
        if (!canUseLocalStorage()) return []
        try {
            const raw = localStorage.getItem(LS_FAV_ORDER)
            const arr = raw ? JSON.parse(raw) : []
            return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []
        } catch {
            return []
        }
    }

    const writeFavOrder = (ids: string[]) => {
        if (!canUseLocalStorage()) return
        localStorage.setItem(LS_FAV_ORDER, JSON.stringify(ids))
    }

    const readOtherOrder = (): string[] => {
        if (!canUseLocalStorage()) return []
        try {
            const raw = localStorage.getItem(LS_OTHER_ORDER)
            const arr = raw ? JSON.parse(raw) : []
            return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : []
        } catch {
            return []
        }
    }

    const writeOtherOrder = (ids: string[]) => {
        if (!canUseLocalStorage()) return
        localStorage.setItem(LS_OTHER_ORDER, JSON.stringify(ids))
    }

    const isCardioName = (name: string) => {
        const n = (name || '').toLowerCase()
        return [
            'lauf', 'jogg', 'run', 'treadmill', 'rad', 'fahrrad', 'bike', 'spinning', 'cycling',
            'row', 'rudern', 'ergometer', 'crosstrainer', 'ellip', 'seilspring', 'rope',
            'treppen', 'stairs', 'schwimm', 'walk', 'hike'
        ].some(k => n.includes(k))
    }

    const isStretchName = (name: string) => {
        const n = (name || '').toLowerCase()
        return [
            'dehn', 'stretch', 'mobil', 'mobility', 'beweglich', 'yoga', 'faszien', 'smr',
            'roll', 'hip opener'
        ].some(k => n.includes(k))
    }

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

    const mapDtoExerciseToPlanExercise = (ex: any): PlanExercise => {
        const guidance = parseExerciseGuidance(ex?.notes ?? null)
        const category = Number(ex?.category)
        const dtoType = normalizeTypeFromDto(ex)
        const name = String(ex?.name ?? ex?.exercise ?? '').trim()

        const strengthSets = normalizeNum(ex?.sets ?? ex?.setCount ?? ex?.setsCount)
        const strengthReps = normalizeNum(ex?.reps ?? ex?.repCount ?? ex?.repsCount)
        const cardioMin = normalizeNum(ex?.durationMin ?? ex?.minutes ?? ex?.durationMinutes ?? ex?.timeMin)
        const cardioKm = normalizeNum(ex?.distanceKm ?? ex?.kilometers ?? ex?.km ?? ex?.distance)
        const stretchSec = normalizeNum(ex?.durationSec ?? ex?.seconds ?? ex?.durationSeconds ?? ex?.timeSec)

        let type: ExerciseType = dtoType
        if (category === 3) type = 'ausdauer'
        else if (category === 2) type = 'dehnung'
        else if (category === 1) type = 'calisthenics'
        else if (category === 0) type = 'kraft'
        else if (cardioMin > 0 || cardioKm > 0 || isCardioName(name)) type = 'ausdauer'
        else if (stretchSec > 0 || isStretchName(name)) type = 'dehnung'

        const sets =
            type === 'ausdauer'
                ? (cardioMin || strengthSets)
                : type === 'dehnung'
                    ? 1
                    : (guidance.setsOverride ?? strengthSets)

        const reps =
            type === 'ausdauer'
                ? cardioKm
                : type === 'dehnung'
                    ? (stretchSec || strengthReps)
                    : (guidance.repsOverride ?? strengthReps)

        return {
            exercise: name,
            sets,
            reps,
            type,
            restSeconds: ex?.restSeconds ?? null,
            notes: guidance.notes,
            recoveryHint: guidance.recoveryHint,
            tempoHint: guidance.tempoHint,
            equipmentNumber: guidance.equipmentNumber,
            replacementExercise: guidance.replacementExercise,
            replacementReason: guidance.replacementReason,
        }
    }

    const normalizeNum = (v: unknown): number => {
        const text = String(v ?? '').replace(',', '.').trim()
        const rangeMatch = text.match(/^(\d+)\s*-\s*(\d+)$/)
        const n = typeof v === 'number' ? v : Number(rangeMatch?.[1] ?? text)
        return Number.isFinite(n) ? n : 0
    }

    const normalizeTypeFromDto = (ex: any): ExerciseType => {
        const raw =
            ex?.type ??
            ex?.exerciseType ??
            ex?.trainingType ??
            ex?.workoutType ??
            ex?.kind ??
            ex?.categoryName ??
            ex?.category

        // wenn's schon string ist -> sauber normalisieren
        const s = String(raw ?? '').toLowerCase().trim()
        if (s === 'ausdauer' || s === 'cardio' || s === 'endurance' || s === 'aerobic' || s.includes('ausdauer')) return 'ausdauer'
        if (s === 'dehnung' || s === 'stretch' || s === 'stretching' || s === 'mobility' || s.includes('dehnung')) return 'dehnung'
        if (s === 'calisthenics' || s === 'bodyweight' || s === 'bw') return 'calisthenics'
        if (s === 'kraft' || s === 'strength' || s === 'weights' || s === 'weight') return 'kraft'

        const cat = Number(raw)
        if (Number.isFinite(cat)) {
            if (cat === 2) return 'dehnung'
            if (cat === 3) return 'ausdauer'
            if (cat === 1) return 'calisthenics'
            return 'kraft'
        }

        return 'kraft'
    }
    const flattenDto = (p: TrainingPlanDto): ViewPlan => {
        const flat: PlanExercise[] = []
        for (const d of (p.days ?? [])) {
            for (const ex of (d.exercises ?? [])) flat.push(mapDtoExerciseToPlanExercise(ex))
        }

        const fallbackCount =
            Number((p as any)?.exerciseCount ?? (p as any)?.exercisesCount ?? (p as any)?.exercise_count ?? 0) || 0

        const count = flat.length > 0 ? flat.length : fallbackCount

        return {
            id: p.id,
            name: p.name,
            isFavorite: !!p.isFavorite,
            code: (p as any)?.code ?? null,
            exercises: flat,
            exerciseCount: count,
        }
    }

    function middleEllipsis(str: string, max = 36) {
        const s = (str || '').trim()
        if (s.length <= max) return s
        const head = Math.ceil((max - 1) / 2)
        const tail = Math.floor((max - 1) / 2)
        return s.slice(0, head) + '...' + s.slice(-tail)
    }

    const copyPlanCode = async (code?: string | null) => {
        const c = (code ?? '').trim()
        if (!c) { props.addToast('Kein Code vorhanden', 'delete'); return }

        try {
            await navigator.clipboard.writeText(c)
            props.addToast('Code kopiert', 'save')
        } catch {
            props.addToast('Kopieren fehlgeschlagen', 'delete')
        }
    }

    const typeLabel = (t: ExerciseType) =>
        ({ kraft: 'Kraft', calisthenics: 'Calisthenics', dehnung: 'Dehnung', ausdauer: 'Ausdauer' } as const)[t]

    const formatExerciseNumber = (exercise: PlanExercise) => {
        const value = String(exercise.equipmentNumber ?? '').trim()
        return value || '—'
    }

    const hasEquipmentNumbers = (exercises: PlanExercise[]) =>
        exercises.some((exercise) => String(exercise.equipmentNumber ?? '').trim().length > 0)

    const formatPauseValue = (exercise: PlanExercise) => {
        const recovery = String(exercise.recoveryHint ?? '').trim()
        if (recovery) return recovery

        const seconds = Number(exercise.restSeconds ?? 0)
        if (Number.isFinite(seconds) && seconds > 0) return `${seconds}s`

        return ''
    }

    const collectUniqueExerciseValues = (
        exercises: PlanExercise[],
        pick: (exercise: PlanExercise) => string | undefined
    ) => {
        const seen = new Set<string>()
        const values: string[] = []

        for (const exercise of exercises) {
            const value = String(pick(exercise) ?? '').trim()
            if (!value) continue
            const key = value.toLocaleLowerCase()
            if (seen.has(key)) continue
            seen.add(key)
            values.push(value)
        }

        return values
    }

    const editPlanInBuilder = async (planId: string) => {
        closePlanMenu()
        dismissPlanTutIfActive()

        if (!props.onEditInBuilder) {
            props.addToast('Edit im Builder fehlt: onEditInBuilder', 'delete')
            return
        }

        // Gast
        if (!auth.user) {
            const gp = (props.guestPlans ?? []).find(p => p.id === planId)
            if (!gp) { props.addToast('Plan nicht gefunden', 'delete'); return }

            props.onEditInBuilder({
                planId: gp.id,
                name: gp.name,
                exercises: Array.isArray(gp.exercises) ? gp.exercises.map(x => ({ ...x })) : [],
            })

            props.addToast('Plan im Builder geöffnet', 'save')
            return
        }

        // Account
        try {
            // IMMER Full-Plan laden (items sind oft light)
            await trainingPlansStore.loadOne(planId)

            const dtoFull =
                getSelectedAccountPlanDto(planId) ??
                getAccountPlanDto(planId) ??
                null

            if (!dtoFull) { props.addToast('Plan nicht gefunden', 'delete'); return }

            setStoreSelectedPlan(dtoFull)

            const view = flattenDto(dtoFull)
            props.onEditInBuilder({
                planId: view.id,
                name: view.name,
                exercises: Array.isArray(view.exercises) ? view.exercises.map(x => ({ ...x })) : [],
            })

            props.addToast('Plan im Builder geöffnet', 'save')
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const buildPlanShareUrl = (code?: string | null) => {
        const c = (code ?? '').trim()
        const origin =
            (typeof window !== 'undefined' && window.location?.origin)
                ? window.location.origin
                : 'https://trackyourgains.de'

        if (!c) return origin
        return `${origin}/training?code=${encodeURIComponent(c)}`
    }

    const buildShareLinesForPlan = (p: ViewPlan) => {
        const url = buildPlanShareUrl(p.code ?? null)
        const name = (p?.name ?? 'Trainingsplan').trim()
        const count = Number(p?.exerciseCount ?? p?.exercises?.length ?? 0)

        const countText =
            count > 0
                ? `(${count} Übungen - easy erklärt)`
                : `(easy erklärt)`

        return [
            `?? Ich hab dir einen Trainingsplan gebaut: "${name}" ${countText}`,
            `Perfekt für den Start: einfach öffnen, nachmachen, fertig.`,
            `Hier geht's direkt los: ${url}`,
        ]
    }
/* -------------------- UI State (nur Plans) -------------------- */
    const planSearch = ref('')

    const externalPlan = ref<TrainingPlanDto | null>(null)
    const externalLoading = ref(false)
    const externalError = ref<string | null>(null)

    let externalT: number | null = null

    const isValidPlanCodeFrontend = (raw: string) => {
        const code = (raw ?? '').trim()
        if (code.length !== 12) return false

        const U = "ABCDEFGHJKLMNPQRSTUVWXYZ"
        const L = "abcdefghijkmnpqrstuvwxyz"
        const D = "23456789"
        const S = "&-_,#."
        const ALL = U + L + D + S

        let hasU = false, hasL = false, hasD = false, specialCount = 0

        for (const c of code) {
            if (!ALL.includes(c)) return false
            if (U.includes(c)) hasU = true
            else if (L.includes(c)) hasL = true
            else if (D.includes(c)) hasD = true
            else if (S.includes(c)) specialCount++
        }

        return hasU && hasL && hasD && specialCount === 1
    }

    const externalQueryActive = computed(() => isValidPlanCodeFrontend(planSearch.value))

    const externalView = computed<ViewPlan | null>(() => {
        if (!externalPlan.value) return null
        return flattenDto(externalPlan.value)
    })

    const openViewPlanInUi = async (view: ViewPlan, toastMsg?: string) => {
        selectedPlan.value = {
            ...view,
            exercises: Array.isArray(view.exercises) ? view.exercises.map(x => ({ ...x })) : [],
        }
        rowHeights.value = Array(selectedPlan.value.exercises.length).fill(40)
        columnWidths.value = selectedPlanHasEquipmentNumbers.value ? [...COLS_WITH_NUMBER] : [...COLS_WITHOUT_NUMBER]
        if (toastMsg) props.addToast(toastMsg, 'load')
        await scrollToSelectedPlan()
    }

    const fetchExternalPlan = async (code: string) => {
        externalLoading.value = true
        externalError.value = null
        externalPlan.value = null

        try {
            const dto = await getTrainingPlanByCode(code.trim())
            externalPlan.value = dto

            // ? direkt im UI anzeigen (ohne Install)
            const view = flattenDto(dto)
            await openViewPlanInUi(view, "Externer Plan geöffnet")
        } catch (e: any) {
            const status = e?.response?.status ?? e?.status
            if (status === 404) {
                externalError.value = null
                externalPlan.value = null
            } else if (status === 400) {
                externalError.value = "Ungültiger Code."
            } else {
                externalError.value = "Externer Plan konnte nicht geladen werden."
            }
        } finally {
            externalLoading.value = false
        }
    }

    watch(planSearch, (val) => {
        if (externalT) window.clearTimeout(externalT)

        // Nur triggern wenn es wie ein Code aussieht
        if (!isValidPlanCodeFrontend(val)) {
            externalPlan.value = null
            externalError.value = null
            externalLoading.value = false
            return
        }

        externalT = window.setTimeout(() => {
            fetchExternalPlan(val)
        }, 350)
    })

    const installExternalPlan = async () => {
        const code = planSearch.value.trim()
        if (!isValidPlanCodeFrontend(code)) return

        if (!auth.user) {
            props.addToast("Zum Installieren musst du eingeloggt sein", "delete")
            return
        }

        try {
            const created = await installTrainingPlanByCode(code)

            // Liste refreshen, damit es direkt in "Deine Trainingspläne" auftaucht
            await trainingPlansStore.loadList()

            props.addToast("Plan installiert ?", "add")

            // optional: direkt öffnen
            await loadPlan(created.id)

            // Suchfeld leeren (damit externe Card weg ist)
            planSearch.value = ""
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? e?.message ?? null
            props.addToast(msg || "Installieren fehlgeschlagen", "delete")
        }
    }

    const selectedPlan = ref<ViewPlan | null>(null)
    const selectedPlanRoot = ref<HTMLElement | null>(null)
    const selectedPlanAnchor = ref<HTMLElement | null>(null)
    let syncingSelectedPlanFromParent = false

    const cloneViewPlan = (plan: ViewPlan | null): ViewPlan | null => {
        if (!plan) return null
        return {
            ...plan,
            exercises: Array.isArray(plan.exercises) ? plan.exercises.map(x => ({ ...x })) : [],
        }
    }

    const showCustomExercises = ref(false)

    watch(selectedPlan, (plan) => {
        if (syncingSelectedPlanFromParent) return
        props.onSelectedPlanChange?.(cloneViewPlan(plan))
    }, { deep: true })

    watch(() => props.selectedPlanOverride, (plan) => {
        const nextPlan = cloneViewPlan(plan ?? null)
        const current = selectedPlan.value
        const sameSnapshot = JSON.stringify(nextPlan) === JSON.stringify(current)
        if (sameSnapshot) return

        syncingSelectedPlanFromParent = true
        selectedPlan.value = nextPlan
        queueMicrotask(() => { syncingSelectedPlanFromParent = false })
    }, { deep: true })

    // ? Quelle der Wahrheit: Parent
    const customExercises = computed(() => props.customExercises ?? [])

    /* -------------------- Plans + Favoriten -------------------- */
    const plans = computed<ViewPlan[]>(() => {
        if (isPhonePreviewSimulationDemo.value) return (props.guestPlans ?? [])
        if (!auth.user) {
            const guestItems = props.guestPlans ?? []
            const map = new Map(guestItems.map((plan) => [plan.id, plan]))
            const ordered = guestPlanOrder.value.filter((id) => map.has(id)).map((id) => map.get(id)).filter(Boolean) as ViewPlan[]
            const missing = guestItems.filter((plan) => !guestPlanOrder.value.includes(plan.id))
            return [...ordered, ...missing]
        }
        return trainingPlansStore.items.map(flattenDto)
    })

    const favoritePlans = computed<string[]>(() => {
        if (!auth.user) return []

        const items = trainingPlansStore.items as TrainingPlanDto[]
        const favIds = new Set(items.filter(p => !!p.isFavorite).map(p => p.id))
        const order = favoriteOrderIds.value.filter(id => favIds.has(id))
        const missing = Array.from(favIds).filter(id => !order.includes(id))
        return [...order, ...missing]
    })

    watch(favoritePlans, (ids) => {
        if (!auth.user) return
        writeFavOrder(ids)
    }, { immediate: true })

    watch(plans, (items) => {
        if (!auth.user) return
        const validIds = new Set(items.map((plan) => plan.id))
        const favoriteIds = new Set(items.filter((plan) => plan.isFavorite).map((plan) => plan.id))
        const otherIds = new Set(items.filter((plan) => !plan.isFavorite).map((plan) => plan.id))

        const nextFav = favoriteOrderIds.value.filter((id) => validIds.has(id) && favoriteIds.has(id))
        const missingFav = items.filter((plan) => plan.isFavorite && !nextFav.includes(plan.id)).map((plan) => plan.id)
        favoriteOrderIds.value = [...nextFav, ...missingFav]
        writeFavOrder(favoriteOrderIds.value)

        const nextOther = otherOrderIds.value.filter((id) => validIds.has(id) && otherIds.has(id))
        const missingOther = items.filter((plan) => !plan.isFavorite && !nextOther.includes(plan.id)).map((plan) => plan.id)
        otherOrderIds.value = [...nextOther, ...missingOther]
        writeOtherOrder(otherOrderIds.value)
    }, { immediate: true, deep: true })

    watch(() => props.guestPlans ?? [], (items) => {
        if (auth.user) return
        const validIds = new Set(items.map((plan) => plan.id))
        const ordered = guestPlanOrder.value.filter((id) => validIds.has(id))
        const missing = items.map((plan) => plan.id).filter((id) => !ordered.includes(id))
        guestPlanOrder.value = [...ordered, ...missing]
    }, { immediate: true, deep: true })

    /* -------------------- Draggable / Mobile -------------------- */
    const isCompactPlanCards = ref(false)
    const dragDelay = computed(() => isCompactPlanCards.value ? 180 : 0)
    const dragDelayOnTouchOnly = computed(() => !isCompactPlanCards.value)
    const dragFilter =
        '.inline-actions, .inline-actions *, .kebab-wrap, .kebab-wrap *, button, select, input, textarea, a'

    let mq: MediaQueryList | null = null
    const onMedia = (e: MediaQueryListEvent | MediaQueryList) => {
        // @ts-ignore (legacy types)
        isCompactPlanCards.value = !!e.matches
    }

    /* -------------------- Plan Menü -------------------- */
    const planMenuOpenId = ref<string | null>(null)

    const togglePlanMenu = (id: string) => {
        dismissPlanTutIfActive()
        planMenuOpenId.value = (planMenuOpenId.value === id) ? null : id
    }

    const closePlanMenu = () => { planMenuOpenId.value = null }

    const onDocClick = (e: MouseEvent) => {
        const el = e.target as HTMLElement | null
        if (!el) return
        if (el.closest('.plan-menu') || el.closest('.kebab-wrap')) return
        if (el.closest('.toast') || el.closest('.toast-container') || el.closest('[data-toast-root]')) return
        closePlanMenu()
    }

    watch(planSearch, () => closePlanMenu())
    watch(
        () => props.renameEffect?.nonce,
        () => {
            triggerRenameForgeFromPayload(props.renameEffect)
        }
    )

    /* -------------------- Computeds für Drag-Listen -------------------- */
    const favoritePlanItems = computed<ViewPlan[]>({
        get() {
            const map = new Map(plans.value.map(p => [p.id, p]))
            return favoritePlans.value.map(id => map.get(id)).filter(Boolean) as ViewPlan[]
        },
        set(newArr) {
            if (!canUseLocalStorage()) return
            favoriteOrderIds.value = newArr.map(p => p.id)
            writeFavOrder(favoriteOrderIds.value)
        }
    })

    const otherPlanItems = computed<ViewPlan[]>({
        get() {
            if (!auth.user) return plans.value
            const fav = new Set(favoritePlans.value)
            const others = plans.value.filter(p => !fav.has(p.id))
            const map = new Map(others.map(p => [p.id, p]))
            const order = otherOrderIds.value.filter(id => map.has(id))
            const missing = others.filter(p => !order.includes(p.id)).map(p => p.id)
            return [...order, ...missing].map(id => map.get(id)).filter(Boolean) as ViewPlan[]
        },
        set(newArr) {
            if (!auth.user) {
                guestPlanOrder.value = newArr.map((p) => p.id)
                return
            }
            otherOrderIds.value = newArr.map(p => p.id)
            writeOtherOrder(otherOrderIds.value)
        }
    })

    const planMatchesSearch = (plan: ViewPlan) => {
        const q = planSearch.value.toLowerCase().trim()
        return !q
            || plan.name.toLowerCase().includes(q)
            || plan.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(q))
    }
    const onPlanCardClick = (e: MouseEvent, planId: string) => {
        const el = e.target as HTMLElement | null
        if (!el) return

        // Nicht öffnen, wenn User auf interaktive Elemente klickt
        if (el.closest('.plan-drag-handle')) return
        if (el.closest('.plan-menu')) return
        if (el.closest('.kebab-wrap')) return
        if (el.closest('.inline-actions')) return
        if (el.closest('button, a, input, textarea, select')) return

        loadPlan(planId, e)
    }


    const isPlanScrollHighlight = ref(false)

    const scrollToSelectedPlan = async () => {
        await nextTick()

        const el = selectedPlanAnchor.value ?? selectedPlanRoot.value
        if (!el) return

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const scrollToAnchor = (behavior: ScrollBehavior) => {
            const rect = el.getBoundingClientRect()
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1
            const targetCenterY = rect.top + window.scrollY + (rect.height / 2)
            const visualOffset = 72
            const top = Math.max(0, targetCenterY - (viewportHeight / 2) - visualOffset)

            window.scrollTo({
                top,
                behavior,
            })
        }

        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToAnchor(prefersReduced ? 'auto' : 'smooth')
                    resolve()
                })
            })
        })

        window.setTimeout(() => {
            scrollToAnchor('auto')
        }, 220)

        // mini highlight / umrandung für feedback
        isPlanScrollHighlight.value = true
        window.setTimeout(() => { isPlanScrollHighlight.value = false }, 900)
    }
    /* -------------------- Actions (Account + Gast) -------------------- */
    const loadPlan = async (planId: string, source?: Event | HTMLElement | null) => {
        closePlanMenu()
        const sourcePlan = plans.value.find((p) => p.id === planId)
            ?? (props.guestPlans ?? []).find((p) => p.id === planId)
            ?? null
        const shouldAnimateOverlay = beginPlanOpenOverlay(sourcePlan, source)

        // Gast
        if (!auth.user) {
            const gp = (props.guestPlans ?? []).find(p => p.id === planId)
            if (!gp) {
                resetPlanOpenOverlay()
                props.addToast('Plan nicht gefunden', 'delete')
                return
            }

            selectedPlan.value = {
                ...gp,
                exercises: Array.isArray(gp.exercises) ? gp.exercises.map(x => ({ ...x })) : [],
            }
            rowHeights.value = Array(selectedPlan.value.exercises.length).fill(40)
            columnWidths.value = selectedPlanHasEquipmentNumbers.value ? [...COLS_WITH_NUMBER] : [...COLS_WITHOUT_NUMBER]
            props.addToast('Plan geladen', 'load')
            await scrollToSelectedPlan()
            if (shouldAnimateOverlay) await finishPlanOpenOverlay()
            else triggerHeaderSync(planId)
            return
        }

        // Account
        try {
            // 1) Erst lokal aus items (schnell)
            let dto = getAccountPlanDto(planId)

            // ? Light-vs-Full check: items sind oft ohne days/exercises ? dann ist Tabelle leer
            const hasAnyExercises = (p: any) =>
                Array.isArray(p?.days) &&
                p.days.some((d: any) => Array.isArray(d?.exercises) && d.exercises.length > 0)

            // 2) Wenn dto fehlt ODER dto "light" ist ? IMMER Full-Plan nachladen
            if (!dto || !hasAnyExercises(dto)) {
                await trainingPlansStore.loadOne(planId)
                dto =
                    getSelectedAccountPlanDto(planId) ??
                    getAccountPlanDto(planId) ??
                    null
            }

            if (!dto) {
                resetPlanOpenOverlay()
                props.addToast('Plan nicht gefunden', 'delete')
                return
            }

            // selected MUSS full sein (sonst später wieder leer/buggy)
            setStoreSelectedPlan(dto)

            selectedPlan.value = flattenDto(dto)
            rowHeights.value = Array(selectedPlan.value.exercises.length).fill(40)
            columnWidths.value = selectedPlanHasEquipmentNumbers.value ? [...COLS_WITH_NUMBER] : [...COLS_WITHOUT_NUMBER]
            props.addToast('Plan geladen', 'load')
            await scrollToSelectedPlan()
            if (shouldAnimateOverlay) await finishPlanOpenOverlay()
            else triggerHeaderSync(planId)
        } catch {
            resetPlanOpenOverlay()
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const closePlan = () => {
        closePlanMenu()
        resetPlanOpenOverlay()
        selectedPlan.value = null
        columnWidths.value = selectedPlanHasEquipmentNumbers.value ? [...COLS_WITH_NUMBER] : [...COLS_WITHOUT_NUMBER]
        rowHeights.value = []
        props.addToast('Plan geschlossen', 'load')
    }

    const getAccountPlanDto = (planId: string) => {
        const items = (trainingPlansStore.items ?? []) as TrainingPlanDto[]
        return items.find(p => p.id === planId) ?? null
    }

    const getSelectedAccountPlanDto = (planId: string) => {
        const selected = (trainingPlansStore.selected ?? null) as TrainingPlanDto | null
        return selected?.id === planId ? selected : null
    }

    const setStoreSelectedPlan = (dto: TrainingPlanDto | null) => {
        try { (trainingPlansStore as any).selected = dto } catch { }
    }

    const editPlan = async (planId: string) => {
        dismissPlanTutIfActive()
        if (!auth.user) {
            if (!props.onGuestEditPlan) {
                props.addToast('Guest-Edit fehlt: onGuestEditPlan', 'delete')
                return
            }
            props.onGuestEditPlan(planId)
            return
        }

        try {
            // Beim Edit IMMER Full-Plan laden (items sind oft nur "light")
            await trainingPlansStore.loadOne(planId)

            const dtoFull =
                getSelectedAccountPlanDto(planId) ??
                getAccountPlanDto(planId) ??
                null

            if (!dtoFull) { props.addToast('Plan nicht gefunden', 'delete'); return }

            // selected MUSS Full sein, sonst knallt Validation
            setStoreSelectedPlan(dtoFull)

            openEditPopupUi('planName', planId)
            props.addToast('Plan wird bearbeitet', 'save')
        } catch {
            props.addToast('Plan konnte nicht geladen werden', 'delete')
        }
    }

    const renamePlan = async (planId: string) => {
        dismissPlanTutIfActive()

        if (!auth.user) {
            openEditPopupUi('planName', planId)
            return
        }

        try {
            if (trainingPlansStore.selected?.id !== planId) {
                await trainingPlansStore.loadOne(planId)
            }
        } catch { }

        openEditPopupUi('planName', planId)
    }

    const renameSelectedPlan = () => {
        dismissPlanTutIfActive()
        if (!selectedPlan.value) return
        openEditPopupUi('selectedPlanName', selectedPlan.value.id)
    }

    const executeDeletePlan = async (planId: string) => {
        dismissPlanTutIfActive()
        if (!auth.user) {
            if (!props.onGuestDeletePlan) {
                props.addToast('Guest-Delete fehlt: onGuestDeletePlan', 'delete')
                return
            }

            props.onGuestDeletePlan?.(planId)
            if (selectedPlan.value?.id === planId) closePlan()
            props.addToast('Trainingsplan gelöscht', 'delete')
            return
        }
        try {
            await trainingPlansStore.remove(planId)
            writeFavOrder(readFavOrder().filter(id => id !== planId))
            if (selectedPlan.value?.id === planId) closePlan()
            props.addToast('Trainingsplan gelöscht', 'delete')
        } catch (e: any) {
            props.addToast(e?.message ?? 'Löschen fehlgeschlagen', 'delete')
        }
    }

    const toggleFavoritePlan = async (planId: string) => {
        dismissPlanTutIfActive()
        // Favoriten sind Account-only bei dir (LS + Store). Als Gast: nix.
        if (!auth.user) return

        const p = (trainingPlansStore.items as TrainingPlanDto[]).find(x => x.id === planId)
        if (!p) return

        const nextFav = !p.isFavorite
        const direction = nextFav ? 'to-favorite' : 'from-favorite'
        triggerFavoriteTransfer(planId, direction)
        await waitForFavoriteRelease(direction)
        await trainingPlansStore.toggleFavorite(planId)

        const order = readFavOrder().filter(id => id !== planId)
        if (nextFav) order.unshift(planId)
        favoriteOrderIds.value = order
        writeFavOrder(order)
        if (!nextFav) {
            otherOrderIds.value = [planId, ...otherOrderIds.value.filter((id) => id !== planId)]
            writeOtherOrder(otherOrderIds.value)
        }

        props.addToast(
            nextFav ? 'Plan zu Favoriten hinzugefügt' : 'Plan aus Favoriten entfernt',
            nextFav ? 'add' : 'delete'
        )
    }

    /* -------------------- Custom Exercises (nur UI) -------------------- */
    const toggleCustomExercises = () => {
        showCustomExercises.value = !showCustomExercises.value
    }

    const removeCustomExercise = (index: number) => {
        dismissPlanTutIfActive()
        if (!props.onRemoveCustomExercise) {
            props.addToast('Remove fehlt: onRemoveCustomExercise', 'delete')
            return
        }

        openDeletePopupUi(() => {
            props.onRemoveCustomExercise?.(index)
            if ((props.customExercises?.length ?? 0) <= 1) showCustomExercises.value = false
            props.addToast('Benutzerdefinierte Übung gelöscht', 'delete')
        })
    }

    /* -------------------- Resizable Tables (selected plan + custom) -------------------- */
    const COLS_WITH_NUMBER = [12, 46, 21, 21]
    const COLS_WITHOUT_NUMBER = [56, 22, 22]
    const columnWidths = ref<number[]>([...COLS_WITH_NUMBER])
    const rowHeights = ref<number[]>([])
    const resizeTable = ref<HTMLTableElement | null>(null)
    const selectedPlanHasEquipmentNumbers = computed(() => hasEquipmentNumbers(selectedPlan.value?.exercises ?? []))
    const activeColumnWidths = computed(() => columnWidths.value)

    const customColWidths = ref([40, 30, 15, 15])
    const customResizeTable = ref<HTMLTableElement | null>(null)

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

        const ths = Array.from(document.querySelectorAll('th.th-wdh, th.th-muskel')) as HTMLElement[]
        ths.forEach(th => {
            applyHeaderState(th)
            headerRO?.observe(th)
        })
    }

    function teardownHeaderShorteningFallback() {
        headerRO?.disconnect()
        headerRO = null
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
        const diff = +(100 - sum).toFixed(4)

        if (Math.abs(diff) > 0.0001) {
            const idx = Math.min(Math.max(preferGiveBackIndex, 0), clamped.length - 1)
            clamped[idx] = Math.max(minPct[idx] ?? 0, +(clamped[idx] + diff).toFixed(4))
        }
        return clamped
    }

    const initResizeTable = () => {
        const table = resizeTable.value
        if (!table) return

        table.querySelectorAll('.resizer,.row-resizer').forEach(el => el.remove())

        const MIN_PX_BY_COL = selectedPlanHasEquipmentNumbers.value
            ? [54, 16, 16, 16]
            : [16, 16, 16]
        const ths = Array.from(table.querySelectorAll('thead th')) as HTMLElement[]
        const lastIdx = ths.length - 1

        ths.forEach((th, colIndex) => {
            th.style.position = 'relative'
            const isLast = colIndex === lastIdx

            const makeResizer = (side: 'right' | 'left') => {
                const resizer = document.createElement('div')
                resizer.className = `resizer resizer-${side}`
                th.appendChild(resizer)

                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto' }
                else { resizer.style.left = '0'; resizer.style.right = 'auto' }

                let startX = 0
                let start = [...columnWidths.value]

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

                        columnWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex)
                    })
                }

                const onUp = (e: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                    resizer.classList.remove('is-active')
                    document.body.classList.remove('is-resizing-col')
                    try { (resizer as any).releasePointerCapture?.(e.pointerId) } catch { }
                }

                const onDown = (e: PointerEvent) => {
                    e.preventDefault(); e.stopPropagation()
                    startX = e.clientX
                    start = [...columnWidths.value]
                    try { (resizer as any).setPointerCapture?.(e.pointerId) } catch { }
                    resizer.classList.add('is-active')
                    document.body.classList.add('is-resizing-col')
                    window.addEventListener('pointermove', onMove)
                    window.addEventListener('pointerup', onUp)
                }

                resizer.addEventListener('pointerdown', onDown)
            }

            if (isLast) { makeResizer('left'); makeResizer('right') }
            else { makeResizer('right') }
        })

        // row resize
        const rows = Array.from(table.querySelectorAll('tbody tr.resizable-row')) as HTMLElement[]
        rows.forEach((row, rowIndex) => {
            row.style.position = 'relative'
            const r = document.createElement('div')
            r.className = 'row-resizer'
            Object.assign(r.style, {
                position: 'absolute', left: '0', bottom: '-4px', width: '100%', height: '10px',
                cursor: 'row-resize', zIndex: '3', background: 'transparent',
            })
            row.appendChild(r)

            let startY = 0
            let startH = rowHeights.value[rowIndex] || row.getBoundingClientRect().height

            const onMove = (e: MouseEvent) => {
                requestAnimationFrame(() => {
                    const dy = e.pageY - startY
                    const minH = 28
                    rowHeights.value[rowIndex] = Math.max(minH, Math.round(startH + dy))
                })
            }
            const onUp = () => {
                document.removeEventListener('mousemove', onMove)
                document.removeEventListener('mouseup', onUp)
                r.classList.remove('is-active')
                document.body.classList.remove('is-resizing-row')
            }
            const onDown = (e: MouseEvent) => {
                e.preventDefault()
                startY = e.pageY
                startH = rowHeights.value[rowIndex] || row.getBoundingClientRect().height
                r.classList.add('is-active')
                document.body.classList.add('is-resizing-row')
                document.addEventListener('mousemove', onMove)
                document.addEventListener('mouseup', onUp)
            }
            r.addEventListener('mousedown', onDown)
        })
    }

    const initCustomResizeTable = () => {
        const table = customResizeTable.value
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
                resizer.className = `resizer resizer-${side}`
                th.appendChild(resizer)
                if (side === 'right') { resizer.style.right = '0'; resizer.style.left = 'auto' }
                else { resizer.style.left = '0'; resizer.style.right = 'auto' }

                let startX = 0
                let start = [...customColWidths.value]

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

                        customColWidths.value = normalizeStrictTo100(next, table, MIN_PX_BY_COL, partnerIndex)
                    })
                }

                const onUp = (e: PointerEvent) => {
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                    resizer.classList.remove('is-active')
                    document.body.classList.remove('is-resizing-col')
                    try { (resizer as any).releasePointerCapture?.(e.pointerId) } catch { }
                }

                const onDown = (e: PointerEvent) => {
                    e.preventDefault(); e.stopPropagation()
                    startX = e.clientX
                    start = [...customColWidths.value]
                    try { (resizer as any).setPointerCapture?.(e.pointerId) } catch { }
                    resizer.classList.add('is-active')
                    document.body.classList.add('is-resizing-col')
                    window.addEventListener('pointermove', onMove)
                    window.addEventListener('pointerup', onUp)
                }

                resizer.addEventListener('pointerdown', onDown)
            }

            if (isLast) { makeResizer('left'); makeResizer('right') }
            else { makeResizer('right') }
        })
    }

    /* -------------------- Watchers for tables -------------------- */
    watch(selectedPlan, (val) => {
        if (val) {
            nextTick(() => {
                initResizeTable()
                setupHeaderShorteningFallback()
            })
        } else {
            nextTick(() => setupHeaderShorteningFallback())
        }
    })

    watch(
        selectedPlanHasEquipmentNumbers,
        (hasNumbers) => {
            columnWidths.value = hasNumbers
                ? [...COLS_WITH_NUMBER]
                : [...COLS_WITHOUT_NUMBER]
        },
        { immediate: true }
    )

    watch(showCustomExercises, (val) => {
        if (!val) return
        nextTick(() => {
            initCustomResizeTable()
            setupHeaderShorteningFallback()
        })
    }, { immediate: false })

    watch(customExercises, () => {
        if (!showCustomExercises.value) return
        nextTick(() => {
            initCustomResizeTable()
            setupHeaderShorteningFallback()
        })
    }, { deep: true })

    /* -------------------- Mount / Unmount -------------------- */
    onMounted(() => {
        document.addEventListener('click', onDocClick)
        void ensureGoalTrackingData()
        favoriteOrderIds.value = readFavOrder()
        otherOrderIds.value = readOtherOrder()

        try {
            const sp = new URLSearchParams(window.location.search)
            const code = (sp.get('code') ?? '').trim()
            if (code && isValidPlanCodeFrontend(code)) {
                // nur setzen -> watch(planSearch) übernimmt fetch (kein Doppel-Call)
                planSearch.value = code
            }
        } catch { }
        if (typeof window !== 'undefined') {
            mq = window.matchMedia('(max-width: 820px)')
            onMedia(mq)
            try { mq.addEventListener('change', onMedia as any) } catch { mq.addListener(onMedia as any) }
        }

        nextTick(() => setupHeaderShorteningFallback())
    })

    onUnmounted(() => {
        document.removeEventListener('click', onDocClick)
        clearDeleteTrashTimer()
        clearDuplicateEcho()
        clearRenameForge()
        resetReorderFlow()
        resetPlanOpenOverlay()
        if (headerSyncTimer) clearTimeout(headerSyncTimer)
        if (favoriteTransferTimer) clearTimeout(favoriteTransferTimer)

        if (mq) {
            try { mq.removeEventListener('change', onMedia as any) } catch { mq.removeListener(onMedia as any) }
        }

        teardownHeaderShorteningFallback()
    })

    defineExpose({
        playRenameEffect: triggerRenameForgeFromPayload,
        openPlanForTutorial: (planId: string) => loadPlan(planId),
        openSimulationForPreview: (planId: string) => {
            const plan =
                plans.value.find(p => p.id === planId)
                ?? (props.guestPlans ?? []).find(p => p.id === planId)
                ?? null
            if (!plan) return

            simPlan.value = plan
            simFollowupMode.value = false
            simFollowupSessionId.value = null
            simFollowupFeedback.value = null
            simFollowupPainDiaryToday.value = false
            simOpen.value = true
        },
    })

</script>


<style scoped>
    /* ===== 1:1 aus Training.vue (Plans + SelectedPlan) - inkl. Duplikaten ===== */

    .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
    }

    html.dark-mode .section-title {
        color: #ffffff;
    }

    .plan-search {
        margin-bottom: 1rem;
    }

    .plan-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .55rem;
        width: 100%;
        position: relative;
    }

    .plan-header > .section-title {
        justify-self: auto;
        text-align: center;
    }

    .plan-header-close {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
    }

    .drag-ghost {
        opacity: 0.6;
    }

    /* Zelle wird selbst Container ? reagiert auf ihre eigene Breite */
    .v-stack {
        container-type: inline-size;
        white-space: normal;
        word-break: break-word;
        hyphens: auto;
    }

    /* Stelle sicher: mittlere Spalte darf schrumpfen */
    .plan-item > .plan-row1 {
        display: grid !important;
        grid-template-columns: auto minmax(0,1fr) auto;
        align-items: center;
        gap: .5rem;
    }

    /* Titel darf nie wachsen, sondern ellipsen */
    .plan-title {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        -webkit-mask-image: linear-gradient(to right, #000 80%, transparent);
        mask-image: linear-gradient(to right, #000 80%, transparent);
    }

    /* Buttons rechts dürfen nie umbrechen */
    .plan-right {
        display: inline-flex;
        gap: .5rem;
        align-items: center;
        white-space: nowrap;
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
            scrollbar-width: none;
        }

            .plan-title .plan-name-scroll::-webkit-scrollbar {
                display: none;
            }

        .plan-title .plan-count {
            flex: 0 0 auto;
            white-space: nowrap;
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

    html.dark-mode {
        /* in Training.vue war das auf .training, hier bleibt's absichtlich so wie's wirkt:
           die vars existieren trotzdem global, aber wir lassen den Block drin für identische Cascade */
    }

    .list-item-actions .action-btn {
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    /* Karte selbst darf über Nachbarn stehen */
    .plan-item {
        position: relative;
    }

        .plan-item.menu-open {
            z-index: 999;
        }

            .plan-item.menu-open:hover {
                transform: none !important;
            }

    .plan-menu {
        z-index: 1000;
    }

    .exercise-table.full-width {
        position: relative;
        isolation: isolate;
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

    .plan-exercise-main {
        display: grid;
        gap: 0.42rem;
        justify-items: center;
        text-align: center;
        white-space: normal;
        width: 100%;
    }

    .plan-exercise-cell {
        width: 100%;
        min-height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .plan-exercise-name {
        color: var(--text-primary);
        font-weight: 700;
        line-height: 1.35;
        word-break: break-word;
    }

    .plan-exercise-meta {
        display: grid;
        gap: 0.18rem;
        font-size: 0.74rem;
        color: var(--text-secondary);
        line-height: 1.35;
    }

    .plan-exercise-meta__item strong {
        color: var(--text-primary);
        font-weight: 700;
    }

    .plan-replacement-card {
        display: grid;
        gap: 0.12rem;
        padding: 0.58rem 0.72rem;
        border-radius: 14px;
        border: 1px solid color-mix(in srgb, var(--accent-primary) 12%, var(--border-color) 88%);
        background: color-mix(in srgb, var(--accent-primary) 4%, var(--bg-secondary) 96%);
        max-width: min(100%, 22rem);
    }

    .plan-replacement-card__label {
        color: var(--text-secondary);
        font-size: 0.66rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
    }

    .plan-replacement-card__name {
        color: var(--text-primary);
        font-size: 0.8rem;
        font-weight: 700;
        line-height: 1.3;
        word-break: break-word;
    }

    .plan-replacement-card__reason {
        color: var(--text-secondary);
        font-size: 0.72rem;
        line-height: 1.35;
        word-break: break-word;
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

    @media (max-width:560px) {
        .plan-replacement-card {
            max-width: 100%;
        }

        .plan-replacement-card__name {
            font-size: 0.76rem;
        }

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

    .plan-scroll-highlight {
        outline: 2px solid color-mix(in srgb, var(--accent-primary) 60%, transparent);
        outline-offset: 6px;
        border-radius: 18px; /* matcht deine card vibes */
        box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent-primary) 12%, transparent);
        transition: outline-color .18s ease, box-shadow .18s ease;
    }

    .plan-open-overlay {
        position: fixed;
        z-index: 1450;
        pointer-events: none;
        overflow: hidden;
        padding: 1.35rem 1.6rem;
        border: 1px solid rgba(96, 165, 250, 0.42);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 11%, transparent), transparent 55%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 60%),
            color-mix(in srgb, var(--bg-card) 96%, #020617 4%);
        box-shadow:
            0 32px 82px rgba(15, 23, 42, 0.22),
            0 0 0 1px rgba(255, 255, 255, 0.06) inset;
        transition:
            top .38s cubic-bezier(0.22, 0.61, 0.36, 1),
            left .38s cubic-bezier(0.22, 0.61, 0.36, 1),
            width .38s cubic-bezier(0.22, 0.61, 0.36, 1),
            height .38s cubic-bezier(0.22, 0.61, 0.36, 1),
            border-radius .38s cubic-bezier(0.22, 0.61, 0.36, 1),
            opacity .12s ease;
        backdrop-filter: blur(10px) saturate(1.05);
    }

    .plan-open-overlay__content {
        position: relative;
        z-index: 2;
        display: grid;
        gap: .35rem;
        align-content: start;
        height: 100%;
    }

    .plan-open-overlay__title {
        display: block;
        color: var(--text-primary);
        font-size: 1rem;
        font-weight: 800;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .plan-open-overlay__meta {
        color: var(--text-secondary);
        font-size: .78rem;
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
    }

    .plan-open-overlay__sheen,
    .plan-open-overlay__line {
        position: absolute;
        inset: 0;
        pointer-events: none;
    }

    .plan-open-overlay__sheen {
        background: linear-gradient(120deg, rgba(255,255,255,0), rgba(255,255,255,.24), rgba(255,255,255,0));
        transform: translateX(-34%);
        opacity: .55;
    }

    .plan-open-overlay.is-animating .plan-open-overlay__sheen {
        transition: transform .42s cubic-bezier(0.22, 0.61, 0.36, 1), opacity .2s ease;
        transform: translateX(38%);
        opacity: .88;
    }

    .plan-open-overlay__line {
        inset: auto 1.3rem 1rem 1.3rem;
        height: 2px;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(96, 165, 250, 0), rgba(96, 165, 250, 0.9), rgba(34, 211, 238, 0.78), rgba(96, 165, 250, 0));
        opacity: .16;
        transform-origin: left center;
        transform: scaleX(.18);
    }

    .plan-open-overlay.is-animating .plan-open-overlay__line {
        transition: transform .38s cubic-bezier(0.22, 0.61, 0.36, 1), opacity .18s ease;
        transform: scaleX(1);
        opacity: .82;
    }

    .plan-open-overlay-fade-enter-active,
    .plan-open-overlay-fade-leave-active {
        transition: opacity .16s ease;
    }

    .plan-open-overlay-fade-enter-from,
    .plan-open-overlay-fade-leave-to {
        opacity: 0;
    }

    .selected-plan-shell {
        transform-origin: top center;
    }

    .selected-plan-shell--rename-forge {
        animation: plan-rename-shell-pulse .92s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .plan-title-main--sync {
        animation: plan-header-sync-title .62s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .plan-title-main__name {
        position: relative;
        display: inline-block;
        margin-left: 0.35rem;
        overflow: visible !important;
    }

    .plan-name-scroll {
        position: relative;
        display: inline-block;
    }

    .plan-title:has(.plan-name-scroll--rename-forge),
    .plan-item--rename-forge .plan-title {
        overflow: visible !important;
        text-overflow: unset !important;
    }

    .plan-title--rename-forge,
    .plan-title-main__name--rename-forge {
        position: relative;
        isolation: isolate;
    }

    .plan-title--rename-forge > * ,
    .plan-title-main__name--rename-forge > * {
        opacity: 0.01 !important;
    }

    .plan-title--rename-forge > .plan-rename-inline,
    .plan-title-main__name--rename-forge > .plan-rename-inline {
        opacity: 1 !important;
    }

    .plan-rename-inline {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        display: inline-block;
        white-space: nowrap;
        pointer-events: none;
        z-index: 7;
        min-width: max-content;
    }

    .plan-rename-inline--selected {
        left: 0;
    }

    .plan-rename-inline__old,
    .plan-rename-inline__new {
        display: block;
        white-space: nowrap;
    }

    .plan-rename-inline__old {
        position: absolute;
        inset: 0 auto auto 0;
        color: #fff;
        text-shadow: 0 0 10px rgba(255,255,255,0.34), 0 0 24px rgba(96,165,250,0.2);
        animation: plan-rename-inline-old 1.05s cubic-bezier(0.24, 0.08, 0.18, 1) both;
    }

    .plan-rename-inline__new {
        color: #fff;
        text-shadow: 0 0 16px rgba(191, 219, 254, 0.95), 0 0 36px rgba(59, 130, 246, 0.62);
        overflow: hidden;
        width: 0;
        border-right: 3px solid rgba(191, 219, 254, 1);
        animation: plan-rename-inline-new 1.2s cubic-bezier(0.16, 1, 0.3, 1) .16s both;
    }

    .plan-title--rename-forge::before,
    .plan-title-main__name--rename-forge::before,
    .plan-title--rename-forge::after,
    .plan-title-main__name--rename-forge::after {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        white-space: nowrap;
        pointer-events: none;
    }

    .plan-title--rename-forge::before,
    .plan-title-main__name--rename-forge::before {
        content: attr(data-rename-old);
        color: #ffffff;
        text-shadow: 0 0 12px rgba(255, 255, 255, 0.34), 0 0 24px rgba(96, 165, 250, 0.18);
        animation: plan-rename-before-erase 1.05s cubic-bezier(0.24, 0.08, 0.18, 1) both;
        z-index: 3;
    }

    .plan-title--rename-forge::after,
    .plan-title-main__name--rename-forge::after {
        content: attr(data-rename-new);
        color: #ffffff;
        text-shadow: 0 0 16px rgba(191, 219, 254, 0.92), 0 0 34px rgba(59, 130, 246, 0.62);
        overflow: hidden;
        width: 0;
        border-right: 3px solid rgba(191, 219, 254, 1);
        animation: plan-rename-after-write 1.15s cubic-bezier(0.16, 1, 0.3, 1) .18s both;
        z-index: 4;
    }

    .plan-title--rename-forge {
        animation: plan-rename-host-flash 1.15s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .plan-title-main__name--rename-forge {
        animation: plan-rename-host-flash 1.15s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .plan-title .plan-name-scroll--rename-forge {
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
        z-index: 3;
    }

    .plan-name-scroll__live,
    .plan-title-main__name-live {
        display: inline-block;
    }

    .plan-title-main__name--rename-forge,
    .plan-name-scroll--rename-forge {
        animation: plan-rename-title-settle 1.02s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .plan-name-scroll--rename-forge > .plan-name-scroll__live,
    .plan-title-main__name--rename-forge > .plan-title-main__name-live {
        opacity: 0.02;
    }

    .plan-title-rename-overlay {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        display: grid;
        grid-template-areas: "stack";
        align-items: center;
        pointer-events: none;
        z-index: 6;
        white-space: nowrap;
        min-width: max-content;
    }

    .plan-title-rename-overlay--selected {
        top: calc(50% - 0.02em);
    }

    .plan-title-rename-overlay__old,
    .plan-title-rename-overlay__handwrite,
    .plan-title-rename-overlay__final {
        grid-area: stack;
        font-weight: inherit;
        letter-spacing: inherit;
        white-space: nowrap;
    }

    .plan-title-rename-overlay__old {
        color: inherit;
        text-shadow: none;
        animation: plan-rename-banner-old .46s ease-in both;
    }

    .plan-title-rename-overlay__handwrite {
        color: inherit;
        font-family: inherit;
        font-weight: inherit;
        text-shadow: none;
        overflow: hidden;
        width: 0;
        border-right: 2px solid currentColor;
        animation: plan-rename-banner-handwrite .82s steps(24, end) .44s both;
    }

    .plan-title-rename-overlay__final {
        color: inherit;
        text-shadow: none;
        opacity: 0;
        transform: translateY(0);
        animation: plan-rename-banner-final .14s linear 1.22s both;
    }

    .plan-item--rename-forge .plan-row1,
    .selected-plan-shell--rename-forge .plan-header {
        isolation: isolate;
    }

    .plan-rename-overlay {
        position: fixed;
        z-index: 2400;
        pointer-events: none;
        overflow: visible;
        white-space: nowrap;
        transform-origin: left center;
        text-shadow: 0 0 14px rgba(96, 165, 250, 0.14);
        will-change: transform, opacity, filter;
    }

    .plan-rename-overlay__old,
    .plan-rename-overlay__new {
        position: absolute;
        inset: 0;
        display: block;
        white-space: nowrap;
    }

    .plan-rename-overlay__old {
        opacity: 1;
        animation: plan-rename-old-erase .72s cubic-bezier(0.3, 0.08, 0.18, 1) both;
    }

    .plan-rename-overlay__new-mask {
        position: absolute;
        inset: 0;
        overflow: hidden;
        clip-path: inset(0 100% 0 0);
        animation: plan-rename-new-write .42s cubic-bezier(0.16, 1, 0.3, 1) .28s both;
    }

    .plan-rename-overlay__new {
        opacity: 0.98;
        filter: drop-shadow(0 0 10px rgba(96, 165, 250, 0.28));
    }

    .plan-rename-overlay__erase,
    .plan-rename-overlay__beam {
        position: absolute;
        top: 50%;
        left: -14%;
        width: 22%;
        height: 170%;
        border-radius: 999px;
        transform: translateY(-50%) skewX(-18deg);
        pointer-events: none;
    }

    .plan-rename-overlay__erase {
        background:
            linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.95) 38%, rgba(96, 165, 250, 0.95) 65%, rgba(59, 130, 246, 0));
        filter: blur(3px);
        mix-blend-mode: screen;
        animation: plan-rename-erase-sweep .34s cubic-bezier(0.25, 0.9, 0.22, 1) both;
    }

    .plan-rename-overlay__beam {
        background:
            linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(191, 219, 254, 0.96) 26%, rgba(96, 165, 250, 1) 54%, rgba(34, 197, 94, 0.54) 76%, rgba(255, 255, 255, 0));
        filter: blur(6px);
        opacity: 0;
        animation: plan-rename-write-beam .44s cubic-bezier(0.16, 1, 0.3, 1) .28s both;
    }

    .plan-rename-overlay__glow,
    .plan-rename-overlay__shock {
        position: absolute;
        inset: -18% -4%;
        border-radius: 999px;
        pointer-events: none;
    }

    .plan-rename-overlay__glow {
        background: linear-gradient(90deg, rgba(59, 130, 246, 0), rgba(59, 130, 246, 0.24), rgba(34, 197, 94, 0.16), rgba(59, 130, 246, 0));
        filter: blur(16px);
        opacity: 0;
        animation: plan-rename-afterglow .58s ease-out .46s both;
    }

    .plan-rename-overlay__shock {
        inset: -48% -6%;
        border: 1px solid rgba(147, 197, 253, 0.45);
        opacity: 0;
        transform: scaleX(0.82) scaleY(0.68);
        animation: plan-rename-shockwave .4s cubic-bezier(0.16, 1, 0.3, 1) .46s both;
    }

    .plan-item--rename-forge {
        animation: plan-rename-card-pulse .92s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .plan-item--rename-forge::after {
        content: "";
        position: absolute;
        inset: -6px;
        border-radius: inherit;
        border: 1px solid rgba(125, 211, 252, 0.72);
        box-shadow:
            0 0 0 0 rgba(96, 165, 250, 0.42),
            0 0 36px rgba(59, 130, 246, 0.24);
        pointer-events: none;
        animation: plan-rename-card-ring 1.28s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .plan-code-row--sync {
        animation: plan-header-sync-meta .62s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .selected-plan-shell--expansion-hidden {
        opacity: 0;
        transform: translateY(8px) scale(.992);
        pointer-events: none;
    }

    .plan-exercise-chain-row {
        position: relative;
        isolation: isolate;
        animation: plan-exercise-chain-reveal .72s cubic-bezier(0.22, 1, 0.36, 1) both;
        animation-delay: var(--exercise-chain-delay, 0ms);
        will-change: transform, opacity, filter;
    }

    .plan-exercise-chain-row::after {
        content: "";
        position: absolute;
        inset: 6px 10px;
        border-radius: 16px;
        background:
            linear-gradient(90deg, rgba(59, 130, 246, 0), rgba(59, 130, 246, 0.12), rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0));
        opacity: 0;
        transform: scaleX(0.72);
        transform-origin: left center;
        pointer-events: none;
        animation: plan-exercise-chain-sheen .72s cubic-bezier(0.22, 1, 0.36, 1) both;
        animation-delay: calc(var(--exercise-chain-delay, 0ms) + 40ms);
    }

    .plan-exercise-chain-row > td {
        position: relative;
        z-index: 1;
    }

    .selected-plan-shell__section {
        animation: selected-plan-section-reveal .42s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .selected-plan-shell__section:nth-child(2) { animation-delay: .05s; }
    .selected-plan-shell__section:nth-child(3) { animation-delay: .1s; }

    .selected-plan-panel-enter-active,
    .selected-plan-panel-leave-active {
        transition: opacity .28s ease, transform .34s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    @keyframes plan-exercise-chain-reveal {
        0% {
            opacity: 0;
            transform: translateY(22px) scale(0.982);
            filter: blur(10px);
        }

        55% {
            opacity: 1;
            transform: translateY(-4px) scale(1.008);
            filter: blur(0);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }

    @keyframes plan-exercise-chain-sheen {
        0% {
            opacity: 0;
            transform: scaleX(0.72) translateX(-18px);
        }

        35% {
            opacity: .92;
        }

        100% {
            opacity: 0;
            transform: scaleX(1.04) translateX(24px);
        }
    }

    @keyframes plan-rename-old-erase {
        0% {
            opacity: 1;
            filter: blur(0);
            transform: translateX(0) skewX(0deg) scale(1);
        }

        34% {
            opacity: 1;
            filter: blur(0.5px);
            transform: translateX(0) skewX(-6deg) scale(1.028);
        }

        100% {
            opacity: 0;
            filter: blur(9px);
            transform: translateX(34px) skewX(-18deg) scale(0.94);
        }
    }

    @keyframes plan-rename-before-erase {
        0% {
            opacity: 1;
            filter: blur(0);
            transform: translateY(-50%) translateX(0) skewX(0deg) scale(1);
        }

        36% {
            opacity: 1;
            filter: blur(0.5px);
            transform: translateY(-50%) translateX(0) skewX(-8deg) scale(1.04);
        }

        100% {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(-50%) translateX(44px) skewX(-20deg) scale(0.9);
        }
    }

    @keyframes plan-rename-after-write {
        0% {
            width: 0;
            opacity: 0.9;
            border-right-color: rgba(191, 219, 254, 1);
            letter-spacing: 0.04em;
        }

        78% {
            width: 100%;
            opacity: 1;
            border-right-color: rgba(191, 219, 254, 1);
            letter-spacing: 0;
        }

        100% {
            width: 100%;
            opacity: 1;
            border-right-color: rgba(191, 219, 254, 0);
            letter-spacing: 0;
        }
    }

    @keyframes plan-rename-host-flash {
        0% {
            filter: brightness(1);
        }

        24% {
            filter: brightness(1.26);
        }

        100% {
            filter: brightness(1);
        }
    }

    @keyframes plan-rename-inline-old {
        0% {
            opacity: 1;
            filter: blur(0);
            transform: translateX(0) skewX(0deg) scale(1);
        }

        40% {
            opacity: 1;
            transform: translateX(0) skewX(-8deg) scale(1.06);
        }

        100% {
            opacity: 0;
            filter: blur(10px);
            transform: translateX(52px) skewX(-24deg) scale(0.88);
        }
    }

    @keyframes plan-rename-inline-new {
        0% {
            width: 0;
            opacity: 0.88;
            border-right-color: rgba(191, 219, 254, 1);
            letter-spacing: 0.04em;
        }

        82% {
            width: 100%;
            opacity: 1;
            border-right-color: rgba(191, 219, 254, 1);
            letter-spacing: 0;
        }

        100% {
            width: 100%;
            opacity: 1;
            border-right-color: rgba(191, 219, 254, 0);
            letter-spacing: 0;
        }
    }

    @keyframes plan-rename-erase-sweep {
        0% {
            opacity: 0;
            transform: translate(-32%, -50%) skewX(-18deg) scaleX(0.72);
        }

        18% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: translate(610%, -50%) skewX(-18deg) scaleX(1.28);
        }
    }

    @keyframes plan-rename-new-write {
        0% {
            max-width: 0;
            border-right-color: rgba(191, 219, 254, 0.96);
        }

        82% {
            max-width: 100%;
            border-right-color: rgba(191, 219, 254, 0.96);
        }

        100% {
            max-width: 100%;
            border-right-color: rgba(191, 219, 254, 0);
        }
    }

    @keyframes plan-rename-write-beam {
        0% {
            opacity: 0;
            transform: translate(-24%, -50%) skewX(-18deg) scaleX(0.62);
        }

        18% {
            opacity: 1;
        }

        70% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: translate(610%, -50%) skewX(-18deg) scaleX(1.34);
        }
    }

    @keyframes plan-rename-shockwave {
        0% {
            opacity: 0;
            transform: scaleX(0.78) scaleY(0.64);
        }

        30% {
            opacity: 0.9;
        }

        100% {
            opacity: 0;
            transform: scaleX(1.14) scaleY(1.42);
        }
    }

    @keyframes plan-rename-afterglow {
        0% {
            opacity: 0;
            transform: scaleX(0.84);
        }

        28% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: scaleX(1.06);
        }
    }

    @keyframes plan-rename-title-settle {
        0% {
            text-shadow: 0 0 0 rgba(96, 165, 250, 0);
            filter: brightness(1);
            transform: translateY(0) scale(1);
        }

        34% {
            text-shadow: 0 0 12px rgba(191, 219, 254, 0.68), 0 0 22px rgba(96, 165, 250, 0.34);
            filter: brightness(1.18);
            transform: translateY(-1px) scale(1.04);
        }

        100% {
            text-shadow: 0 0 0 rgba(96, 165, 250, 0);
            filter: brightness(1);
            transform: translateY(0) scale(1);
        }
    }

    @keyframes plan-rename-card-pulse {
        0% {
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
            border-color: rgba(148, 163, 184, 0.35);
            transform: translateY(0) scale(1);
        }

        24% {
            box-shadow: 0 26px 58px rgba(59, 130, 246, 0.2), 0 18px 40px rgba(15, 23, 42, 0.24);
            border-color: rgba(125, 211, 252, 0.62);
            transform: translateY(-2px) scale(1.01);
        }

        100% {
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
            border-color: rgba(148, 163, 184, 0.35);
            transform: translateY(0) scale(1);
        }
    }

    @keyframes plan-rename-card-ring {
        0% {
            opacity: 0;
            transform: scale(0.98);
            box-shadow:
                0 0 0 0 rgba(96, 165, 250, 0.52),
                0 0 12px rgba(59, 130, 246, 0.16);
        }

        18% {
            opacity: 1;
        }

        100% {
            opacity: 0;
            transform: scale(1.03);
            box-shadow:
                0 0 0 16px rgba(96, 165, 250, 0),
                0 0 0 rgba(59, 130, 246, 0);
        }
    }

    @keyframes plan-rename-banner-old {
        0% {
            opacity: 1;
            filter: blur(0);
            clip-path: inset(0 0 0 0);
            transform: translateX(0);
        }

        35% {
            opacity: 1;
            clip-path: inset(0 0 0 0);
            transform: translateX(0);
        }

        100% {
            opacity: 0;
            filter: blur(2px);
            clip-path: inset(0 0 0 100%);
            transform: translateX(0);
        }
    }

    @keyframes plan-rename-banner-handwrite {
        0% {
            width: 0;
            opacity: 1;
            border-right-color: currentColor;
        }

        92% {
            width: 100%;
            opacity: 1;
            border-right-color: currentColor;
        }

        100% {
            width: 100%;
            opacity: 1;
            border-right-color: transparent;
        }
    }

    @keyframes plan-rename-banner-final {
        0% {
            opacity: 0;
            filter: blur(0);
        }

        100% {
            opacity: 1;
            filter: blur(0);
        }
    }

    @keyframes plan-rename-shell-pulse {
        0% {
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
            transform: translateY(0) scale(1);
        }

        30% {
            box-shadow: 0 30px 76px rgba(59, 130, 246, 0.18), 0 18px 40px rgba(15, 23, 42, 0.22);
            transform: translateY(-2px) scale(1.004);
        }

        100% {
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
            transform: translateY(0) scale(1);
        }
    }

    html.dark-mode .plan-exercise-chain-row::after {
        background:
            linear-gradient(90deg, rgba(96, 165, 250, 0), rgba(96, 165, 250, 0.18), rgba(45, 212, 191, 0.16), rgba(96, 165, 250, 0));
    }

    .selected-plan-panel-enter-from,
    .selected-plan-panel-leave-to {
        opacity: 0;
        transform: translateY(18px) scale(.985);
    }

    .delete-trash-overlay {
        position: fixed;
        inset: 0;
        z-index: 1300;
        pointer-events: none;
    }

    .delete-trash-flight {
        position: fixed;
        min-width: 180px;
        max-width: min(280px, calc(100vw - 2rem));
        padding: .8rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(239, 68, 68, 0.24);
        background: radial-gradient(circle at top left, color-mix(in srgb, #ef4444 12%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, white 6%);
        box-shadow: 0 18px 38px rgba(15, 23, 42, 0.2);
        transform: translate(-50%, -50%);
        animation: delete-trash-flight .86s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        overflow: hidden;
    }

    .delete-trash-flight__badge {
        position: absolute;
        left: .85rem;
        top: -.72rem;
        z-index: 2;
        transform: none;
        padding: .34rem .82rem;
        border-radius: 999px;
        border: 1px solid rgba(248, 113, 113, 0.42);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        font-size: .72rem;
        font-weight: 900;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: .12em;
        white-space: nowrap;
        box-shadow: 0 10px 22px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(255, 241, 242, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
        animation: favorite-sanctified-label-rise 1.02s cubic-bezier(0.2, 0.82, 0.24, 1) both, favorite-sanctified-label-glow 1.02s ease-in-out both;
    }

    .delete-trash-flight__title {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: .92rem;
        font-weight: 800;
        color: var(--text-primary);
        opacity: .46;
    }

    .delete-trash-bin {
        position: fixed;
        left: 50%;
        bottom: 1.25rem;
        width: 90px;
        height: 92px;
        transform: translateX(-50%);
        filter: drop-shadow(0 20px 30px rgba(15, 23, 42, 0.26));
        animation: delete-trash-bin-pop .3s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .delete-trash-bin__lid {
        position: absolute;
        left: 50%;
        top: 2px;
        width: 62px;
        height: 12px;
        border-radius: 999px;
        background: linear-gradient(180deg, #94a3b8, #64748b);
        transform: translateX(-50%);
    }

    .delete-trash-bin__lid::before {
        content: "";
        position: absolute;
        left: 50%;
        top: -6px;
        width: 22px;
        height: 6px;
        border-radius: 999px 999px 0 0;
        background: #64748b;
        transform: translateX(-50%);
    }

    .delete-trash-bin__body {
        position: absolute;
        inset: 14px 12px 0;
        border-radius: 18px 18px 22px 22px;
        border: 2px solid rgba(71, 85, 105, 0.8);
        background: linear-gradient(180deg, rgba(226, 232, 240, 0.96), rgba(148, 163, 184, 0.88));
        overflow: hidden;
    }

    .delete-trash-bin__body::before,
    .delete-trash-bin__body::after {
        content: "";
        position: absolute;
        top: 12px;
        bottom: 12px;
        width: 4px;
        border-radius: 999px;
        background: rgba(71, 85, 105, 0.38);
    }

    .delete-trash-bin__body::before {
        left: 22px;
        box-shadow: 14px 0 0 rgba(71, 85, 105, 0.38), 28px 0 0 rgba(71, 85, 105, 0.38);
    }

    .delete-trash-enter-active,
    .delete-trash-leave-active {
        transition: opacity .22s ease;
    }

    .delete-trash-enter-from,
    .delete-trash-leave-to {
        opacity: 0;
    }

    @keyframes delete-trash-bin-pop {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(18px) scale(.92);
        }

        100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
        }
    }

    @keyframes delete-trash-flight {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }

        68% {
            opacity: 1;
            transform: translate(calc(-50% + var(--delete-fly-x) * .82), calc(-50% + var(--delete-fly-y) * .82)) scale(.78) rotate(-10deg);
        }

        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--delete-fly-x)), calc(-50% + var(--delete-fly-y))) scale(.26) rotate(-18deg);
        }
    }

    @keyframes selected-plan-section-reveal {
        0% {
            opacity: 0;
            transform: translateY(14px);
        }

        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes plan-header-sync-title {
        0% {
            opacity: 0;
            transform: translateY(10px) scale(.985);
            filter: blur(8px);
        }

        55% {
            opacity: 1;
            transform: translateY(-2px) scale(1.01);
            filter: blur(0);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
        }
    }

    @keyframes plan-header-sync-meta {
        0% {
            opacity: 0;
            transform: translateY(8px);
            filter: blur(6px);
        }

        100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
        }
    }

    @keyframes favorite-transfer-in {
        0% {
            opacity: 0;
            transform: translateX(-18px) scale(.985);
        }

        36% {
            opacity: .92;
        }

        100% {
            opacity: 0;
            transform: translateX(16px) scale(1.015);
        }
    }

    @keyframes favorite-transfer-out {
        0% {
            opacity: 0;
            transform: translateX(18px) scale(.985);
        }

        36% {
            opacity: .9;
        }

        100% {
            opacity: 0;
            transform: translateX(-16px) scale(1.01);
        }
    }

    @keyframes favorite-border-sanctified {
        0%, 100% {
            box-shadow:
                0 0 0 1px rgba(255, 244, 214, 0.68),
                0 0 0 2px rgba(245, 158, 11, 0.42),
                0 10px 26px rgba(245, 158, 11, 0.08);
        }

        50% {
            box-shadow:
                0 0 0 1px rgba(255, 248, 220, 0.82),
                0 0 0 2px rgba(250, 204, 21, 0.56),
                0 0 18px rgba(250, 204, 21, 0.18);
        }
    }

    @keyframes favorite-holy-rise {
        0% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow:
                0 18px 40px rgba(15, 23, 42, 0.22),
                0 0 0 rgba(245, 158, 11, 0);
            filter: saturate(1) brightness(1);
        }

        24% {
            transform: translate3d(0, -10px, 0) scale(1.018);
            box-shadow:
                0 28px 64px rgba(245, 158, 11, 0.22),
                0 0 34px rgba(251, 191, 36, 0.22);
            filter: saturate(1.08) brightness(1.03);
        }

        52% {
            transform: translate3d(0, -24px, 0) scale(1.034);
            box-shadow:
                0 40px 84px rgba(245, 158, 11, 0.28),
                0 0 52px rgba(250, 204, 21, 0.32);
            filter: saturate(1.16) brightness(1.08);
        }

        72% {
            transform: translate3d(0, -14px, 0) scale(1.024);
            box-shadow:
                0 32px 72px rgba(245, 158, 11, 0.24),
                0 0 46px rgba(250, 204, 21, 0.24);
            filter: saturate(1.1) brightness(1.05);
        }

        100% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow:
                0 18px 40px rgba(15, 23, 42, 0.22),
                0 0 0 rgba(250, 204, 21, 0);
            filter: saturate(1) brightness(1);
        }
    }

    @keyframes favorite-holy-aura {
        0% {
            opacity: 0;
            transform: translate(-50%, -10%) scale(.58);
            filter: blur(18px);
        }

        32% {
            opacity: .9;
            transform: translate(-50%, -36%) scale(1.04);
            filter: blur(8px);
        }

        68% {
            opacity: .74;
            transform: translate(-50%, -44%) scale(1.12);
            filter: blur(12px);
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -54%) scale(1.18);
            filter: blur(18px);
        }
    }

    @keyframes favorite-holy-shimmer {
        0%, 100% {
            opacity: .48;
            transform: translate3d(-12%, 0, 0);
        }

        50% {
            opacity: .92;
            transform: translate3d(14%, -2px, 0);
        }
    }

    @keyframes favorite-holy-sparkles {
        0%, 100% {
            opacity: .32;
            transform: translateY(0) scale(1);
        }

        50% {
            opacity: .8;
            transform: translateY(-4px) scale(1.06);
        }
    }

    @keyframes favorite-sanctified-label-rise {
        0% {
            opacity: 0;
            transform: translate(-50%, 14px) scale(.78) rotate(-4deg);
            filter: blur(10px);
            letter-spacing: .08em;
        }

        22% {
            opacity: 1;
            transform: translate(-50%, -6px) scale(1.02) rotate(-1deg);
            filter: blur(0);
            letter-spacing: .12em;
        }

        68% {
            opacity: 1;
            transform: translate(-50%, -18px) scale(1) rotate(0deg);
            filter: blur(0);
            letter-spacing: .11em;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -32px) scale(.96) rotate(0deg);
            filter: blur(6px);
            letter-spacing: .14em;
        }
    }

    @keyframes favorite-sanctified-label-glow {
        0%, 100% {
            text-shadow: 0 0 0 rgba(255, 248, 220, 0), 0 0 0 rgba(250, 204, 21, 0);
        }

        50% {
            text-shadow: 0 0 18px rgba(255, 248, 220, 0.82), 0 0 36px rgba(250, 204, 21, 0.46);
        }
    }

    @keyframes delete-card-sanctified-rise {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(.78);
            filter: blur(10px);
            letter-spacing: .08em;
        }

        28% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.03);
            filter: blur(0);
            letter-spacing: .12em;
        }

        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(.97);
            filter: blur(6px);
            letter-spacing: .14em;
        }
    }

    @keyframes favorite-fall {
        0% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow:
                0 22px 48px rgba(245, 158, 11, 0.16),
                0 0 24px rgba(250, 204, 21, 0.16);
            filter: saturate(1.04) brightness(1.02);
        }

        22% {
            transform: translate3d(0, 3px, 0) scale(.997);
            box-shadow:
                0 19px 38px rgba(245, 158, 11, 0.1),
                0 0 12px rgba(250, 204, 21, 0.08);
            filter: saturate(1.01) brightness(1.005);
        }

        58% {
            transform: translate3d(0, 12px, 0) scale(.989);
            box-shadow:
                0 14px 28px rgba(15, 23, 42, 0.16),
                0 0 6px rgba(250, 204, 21, 0.03);
            filter: saturate(.985) brightness(.992);
        }

        84% {
            transform: translate3d(0, 5px, 0) scale(.995);
            box-shadow:
                0 14px 28px rgba(15, 23, 42, 0.18),
                0 0 2px rgba(250, 204, 21, 0.02);
            filter: saturate(.994) brightness(.996);
        }

        100% {
            transform: translate3d(0, 0, 0) scale(1);
            box-shadow:
                0 18px 40px rgba(15, 23, 42, 0.22),
                0 0 0 rgba(250, 204, 21, 0);
            filter: saturate(1) brightness(1);
        }
    }

    @keyframes favorite-border-release {
        0% {
            opacity: .96;
            transform: scale(1);
            border-color: rgba(250, 204, 21, 0.92);
            box-shadow:
                0 0 0 1px rgba(255, 244, 214, 0.78),
                0 0 0 2px rgba(250, 204, 21, 0.88),
                0 0 26px rgba(250, 204, 21, 0.22);
        }

        26% {
            opacity: .94;
            transform: scale(1.01);
            border-color: rgba(253, 224, 71, 0.88);
            box-shadow:
                0 0 0 1px rgba(255, 248, 220, 0.82),
                0 0 0 2px rgba(250, 204, 21, 0.68),
                0 0 26px rgba(250, 204, 21, 0.18);
        }

        62% {
            opacity: .54;
            transform: scale(1.002);
            border-color: rgba(245, 158, 11, 0.28);
            box-shadow:
                0 0 0 1px rgba(255, 244, 214, 0.22),
                0 0 0 1px rgba(245, 158, 11, 0.18),
                0 0 10px rgba(250, 204, 21, 0.05);
        }

        86% {
            opacity: .2;
            transform: scale(.999);
            border-color: rgba(245, 158, 11, 0.08);
            box-shadow:
                0 0 0 1px rgba(255, 244, 214, 0.08),
                0 0 0 1px rgba(245, 158, 11, 0.06),
                0 0 4px rgba(250, 204, 21, 0.02);
        }

        100% {
            opacity: 0;
            transform: scale(.988);
            border-color: rgba(245, 158, 11, 0);
            box-shadow:
                0 0 0 0 rgba(255, 244, 214, 0),
                0 0 0 0 rgba(250, 204, 21, 0),
                0 0 0 rgba(250, 204, 21, 0);
        }
    }

    @keyframes favorite-release-trail {
        0% {
            opacity: 0;
            transform: translateY(-1px) scale(.96);
            filter: blur(8px);
        }

        24% {
            opacity: .3;
            transform: translateY(2px) scale(.985);
            filter: blur(7px);
        }

        58% {
            opacity: .2;
            transform: translateY(9px) scale(1.01);
            filter: blur(8px);
        }

        100% {
            opacity: 0;
            transform: translateY(20px) scale(1.04);
            filter: blur(12px);
        }
    }

    .plan-title {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }


    .desktop-open {
        display: inline-flex;
    }

    .mobile-open {
        display: none;
    }

    html.dark-mode .plan-menu {
        border-color: rgba(148, 163, 184, 0.34);
        background: radial-gradient(circle at 18% 30%, color-mix(in srgb, #6366f1 18%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, #22c55e 12%, transparent), transparent 70%), rgba(2, 6, 23, 0.78);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.05);
    }

    html.dark-mode .delete-trash-flight {
        border-color: rgba(248, 113, 113, 0.28);
        background: radial-gradient(circle at top left, rgba(239, 68, 68, 0.18), transparent 60%), rgba(2, 6, 23, 0.94);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.42);
    }

    html.dark-mode .delete-trash-flight__badge {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(254, 226, 226, 0.08), 0 0 22px rgba(239, 68, 68, 0.16);
    }

    html.dark-mode .delete-trash-flight__title {
        color: #f8fafc;
    }

    html.dark-mode .delete-trash-bin__lid {
        background: linear-gradient(180deg, #64748b, #334155);
    }

    html.dark-mode .delete-trash-bin__lid::before {
        background: #475569;
    }

    html.dark-mode .delete-trash-bin__body {
        border-color: rgba(148, 163, 184, 0.62);
        background: linear-gradient(180deg, rgba(51, 65, 85, 0.96), rgba(15, 23, 42, 0.94));
    }

    html.dark-mode .delete-trash-bin__body::before {
        box-shadow: 14px 0 0 rgba(148, 163, 184, 0.26), 28px 0 0 rgba(148, 163, 184, 0.26);
        background: rgba(148, 163, 184, 0.26);
    }

    .plan-drag-handle {
        cursor: grab;
        margin-right: .5rem;
        user-select: none;
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

    .plan-row1 {
        width: 100%;
        position: relative;
    }

    .favorite-sanctified-label {
        position: absolute;
        left: 50%;
        top: -.5rem;
        z-index: 8;
        pointer-events: none;
        padding: .38rem .95rem;
        border-radius: 999px;
        border: 1px solid rgba(250, 204, 21, 0.48);
        background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 244, 214, 0.92));
        color: #b45309;
        font-size: .78rem;
        font-weight: 900;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: .12em;
        white-space: nowrap;
        box-shadow: 0 16px 30px rgba(245, 158, 11, 0.18), 0 0 0 1px rgba(255, 248, 220, 0.68), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        animation: favorite-sanctified-label-rise 1.18s cubic-bezier(0.2, 0.82, 0.24, 1) both, favorite-sanctified-label-glow 1.18s ease-in-out both;
    }

    .favorite-sanctified-label.favorite-sanctified-label--removed {
        border-color: rgba(248, 113, 113, 0.46);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        box-shadow: 0 16px 30px rgba(239, 68, 68, 0.18), 0 0 0 1px rgba(255, 241, 242, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.92);
    }

    @media (min-width:1025px) {
        .plan-row1 .inline-actions {
            margin-left: auto;
        }
    }

    .plan-menu {
        position: absolute;
        right: .5rem;
        top: calc(100% + .5rem);
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


    .list-item.plan-item {
        position: relative;
        padding: 1.35rem 1.6rem;
        max-height: 9rem;
        border-radius: 18px;
        background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        display: block;
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease, opacity .24s ease, max-height .26s ease, padding .26s ease, margin .26s ease, filter .24s ease;
        animation: plan-card-reveal .46s cubic-bezier(0.22, 0.61, 0.36, 1) both;
        animation-delay: var(--plan-reveal-delay, 0ms);
    }

    .list-item.plan-item.plan-item--delete-pulse {
        box-shadow:
            0 24px 48px rgba(239, 68, 68, 0.16),
            0 18px 40px rgba(15, 23, 42, 0.22);
        border-color: rgba(248, 113, 113, 0.42);
    }

    .delete-card-sanctified-label {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 9;
        pointer-events: none;
        transform: translate(-50%, -50%);
        padding: .42rem 1rem;
        border-radius: 999px;
        border: 1px solid rgba(248, 113, 113, 0.46);
        background: linear-gradient(180deg, rgba(255, 241, 242, 0.98), rgba(254, 226, 226, 0.94));
        color: #b91c1c;
        font-size: .8rem;
        font-weight: 900;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: .12em;
        white-space: nowrap;
        box-shadow:
            0 16px 30px rgba(239, 68, 68, 0.18),
            0 0 0 1px rgba(255, 241, 242, 0.72),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
        animation: delete-card-sanctified-rise .92s cubic-bezier(0.2, 0.82, 0.24, 1) both, favorite-sanctified-label-glow .92s ease-in-out both;
    }

    .list-item.plan-item > .plan-row1 {
        position: relative;
        z-index: 0;
        isolation: isolate;
    }

    .list-item.plan-item.plan-item--search-hidden {
        opacity: 0;
        max-height: 0;
        padding-top: 0;
        padding-bottom: 0;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
        border-color: transparent;
        box-shadow: none;
        filter: blur(8px);
        transform: translateY(-10px) scale(.985);
        pointer-events: none;
    }

    .list-item.plan-item.plan-item--dup-echo {
        animation:
            plan-card-reveal .46s cubic-bezier(0.22, 0.61, 0.36, 1) both,
            plan-card-duplicate-settle .94s cubic-bezier(0.18, 0.9, 0.2, 1) both;
        box-shadow:
            0 24px 52px rgba(59, 130, 246, 0.2),
            0 18px 40px rgba(15, 23, 42, 0.22);
        border-color: rgba(96, 165, 250, 0.46);
    }

    .list-item.plan-item.plan-item--dup-echo::before,
    .list-item.plan-item.plan-item--dup-echo::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
    }

    .list-item.plan-item.plan-item--dup-echo::before {
        background: inherit;
        border: 1px solid rgba(129, 140, 248, 0.2);
        opacity: .48;
        transform: translate(12px, 10px) scale(.985);
        filter: saturate(.92) brightness(1.01);
        animation: plan-duplicate-echo-back .94s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .list-item.plan-item.plan-item--dup-echo::after {
        background: linear-gradient(120deg, rgba(255,255,255,0), rgba(255,255,255,.42), rgba(255,255,255,0));
        opacity: 0;
        transform: translateX(-20px);
        animation: plan-duplicate-sheen .94s cubic-bezier(0.18, 0.9, 0.2, 1) both;
    }

    .list-item.plan-item.plan-item--favorite-transfer {
        overflow: visible;
    }

    .list-item.plan-item.plan-item--favorite {
        border-color: rgba(245, 158, 11, 0.72);
        box-shadow:
            0 18px 40px rgba(15, 23, 42, 0.22),
            0 0 0 1px rgba(255, 244, 214, 0.62),
            0 0 0 2px rgba(245, 158, 11, 0.34),
            0 10px 26px rgba(245, 158, 11, 0.08);
        animation:
            plan-card-reveal .46s cubic-bezier(0.22, 0.61, 0.36, 1) both,
            favorite-border-sanctified 3.4s ease-in-out infinite;
        animation-delay: var(--plan-reveal-delay, 0ms), 0s;
    }

    .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::before,
    .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::after {
        content: "";
        position: absolute;
        pointer-events: none;
        z-index: -1;
    }

    .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::before {
        left: 50%;
        top: -1.45rem;
        width: 72%;
        height: 2.2rem;
        border-radius: 999px;
        transform: translateX(-50%);
        background:
            radial-gradient(circle, rgba(255, 252, 240, 0.95) 0%, rgba(250, 204, 21, 0.72) 38%, rgba(245, 158, 11, 0.12) 68%, rgba(245, 158, 11, 0) 100%);
        filter: blur(10px);
        opacity: .84;
    }

    .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::after {
        inset: -.45rem -.35rem;
        border-radius: 22px;
        background:
            radial-gradient(circle at 14% 18%, rgba(255, 255, 255, 0.94) 0 2px, rgba(255, 255, 255, 0) 3px),
            radial-gradient(circle at 84% 24%, rgba(255, 248, 196, 0.9) 0 1.6px, rgba(255, 248, 196, 0) 3px),
            radial-gradient(circle at 22% 80%, rgba(255, 249, 214, 0.82) 0 1.8px, rgba(255, 249, 214, 0) 3px),
            radial-gradient(circle at 76% 74%, rgba(255, 255, 255, 0.76) 0 1.4px, rgba(255, 255, 255, 0) 3px),
            linear-gradient(115deg, rgba(255, 255, 255, 0) 10%, rgba(255, 250, 231, 0.68) 47%, rgba(255, 255, 255, 0) 84%);
        opacity: .62;
        animation: favorite-holy-shimmer 5.6s ease-in-out infinite;
    }

    .list-item.plan-item.plan-item--favorite-transfer::after {
        content: "";
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        pointer-events: none;
        opacity: 0;
        box-shadow: 0 0 0 0 rgba(250, 204, 21, 0);
    }

    .list-item.plan-item.plan-item--favorite-transfer-in::after {
        background: linear-gradient(135deg, rgba(250, 204, 21, 0.12), rgba(251, 191, 36, 0.18), rgba(250, 204, 21, 0));
        border: 2px solid rgba(250, 204, 21, 0.92);
        box-shadow:
            0 0 0 1px rgba(255, 244, 214, 0.78),
            0 0 26px rgba(250, 204, 21, 0.36),
            0 0 54px rgba(245, 158, 11, 0.18);
        animation: favorite-transfer-in .84s cubic-bezier(0.22, 0.61, 0.36, 1) both;
    }

    .list-item.plan-item.plan-item--favorite-transfer-in {
        animation:
            plan-card-reveal .46s cubic-bezier(0.22, 0.61, 0.36, 1) both,
            favorite-holy-rise 1.28s cubic-bezier(0.18, 0.88, 0.24, 1.08) both;
        border-color: rgba(250, 204, 21, 0.82);
    }

    .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::before {
        animation: favorite-holy-aura 1.18s cubic-bezier(0.2, 0.82, 0.24, 1) both;
    }

    .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::after {
        animation:
            favorite-holy-aura 1.06s cubic-bezier(0.2, 0.82, 0.24, 1) both,
            favorite-holy-sparkles .96s ease-in-out 2;
    }

    .list-item.plan-item.plan-item--favorite-transfer-out::after {
        inset: -.3rem -.22rem;
        border-radius: 21px;
        background:
            linear-gradient(180deg, rgba(255, 248, 220, 0.12), rgba(250, 204, 21, 0.06) 44%, rgba(250, 204, 21, 0) 100%);
        border: 2px solid rgba(250, 204, 21, 0.92);
        animation: favorite-border-release .7s cubic-bezier(0.24, 0.76, 0.22, 1) both;
    }

    .list-item.plan-item.plan-item--favorite-transfer-out::before {
        content: "";
        position: absolute;
        inset: -.4rem -.3rem;
        border-radius: 22px;
        pointer-events: none;
        background:
            radial-gradient(circle at 50% 12%, rgba(255, 248, 220, 0.32), rgba(255, 248, 220, 0) 42%),
            linear-gradient(180deg, rgba(250, 204, 21, 0.14), rgba(245, 158, 11, 0.05) 45%, rgba(245, 158, 11, 0) 100%);
        animation: favorite-release-trail .72s cubic-bezier(0.24, 0.76, 0.22, 1) both;
    }

    .list-item.plan-item.plan-item--favorite-transfer-out {
        border-color: rgba(245, 158, 11, 0.24);
        animation: favorite-fall .76s cubic-bezier(0.24, 0.76, 0.22, 1) both;
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

    html.dark-mode .list-item.plan-item.plan-item--favorite {
        border-color: rgba(251, 191, 36, 0.86);
        box-shadow:
            0 22px 55px rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 244, 214, 0.18),
            0 0 0 2px rgba(251, 191, 36, 0.56),
            0 0 24px rgba(250, 204, 21, 0.16);
    }

    html.dark-mode .list-item.plan-item.plan-item--dup-echo {
        border-color: rgba(96, 165, 250, 0.58);
        box-shadow:
            0 28px 64px rgba(37, 99, 235, 0.22),
            0 22px 55px rgba(0, 0, 0, 0.7);
    }

    html.dark-mode .list-item.plan-item.plan-item--dup-echo::before {
        border-color: rgba(129, 140, 248, 0.28);
    }

    html.dark-mode .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::before {
        background:
            radial-gradient(circle, rgba(255, 248, 220, 0.82) 0%, rgba(250, 204, 21, 0.64) 38%, rgba(245, 158, 11, 0.08) 72%, rgba(245, 158, 11, 0) 100%);
        opacity: .76;
    }

    html.dark-mode .list-item.plan-item.plan-item--favorite-transfer-in > .plan-row1::after {
        background:
            radial-gradient(circle at 14% 18%, rgba(255, 248, 220, 0.82) 0 2px, rgba(255, 255, 255, 0) 3px),
            radial-gradient(circle at 84% 24%, rgba(253, 230, 138, 0.74) 0 1.6px, rgba(255, 248, 196, 0) 3px),
            radial-gradient(circle at 22% 80%, rgba(255, 249, 214, 0.56) 0 1.8px, rgba(255, 249, 214, 0) 3px),
            radial-gradient(circle at 76% 74%, rgba(255, 255, 255, 0.5) 0 1.4px, rgba(255, 255, 255, 0) 3px),
            linear-gradient(115deg, rgba(255, 255, 255, 0) 10%, rgba(255, 237, 213, 0.34) 47%, rgba(255, 255, 255, 0) 84%);
        opacity: .5;
    }

    html.dark-mode .favorite-sanctified-label {
        border-color: rgba(251, 191, 36, 0.54);
        background: linear-gradient(180deg, rgba(120, 53, 15, 0.98), rgba(92, 39, 12, 0.94));
        color: #fde68a;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(255, 244, 214, 0.12), 0 0 22px rgba(250, 204, 21, 0.18);
    }

    html.dark-mode .favorite-sanctified-label.favorite-sanctified-label--removed {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(254, 226, 226, 0.08), 0 0 22px rgba(239, 68, 68, 0.16);
    }

    html.dark-mode .delete-card-sanctified-label {
        border-color: rgba(248, 113, 113, 0.4);
        background: linear-gradient(180deg, rgba(127, 29, 29, 0.98), rgba(91, 18, 18, 0.94));
        color: #fecaca;
        box-shadow: 0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(254, 226, 226, 0.08), 0 0 22px rgba(239, 68, 68, 0.16);
    }

    html.dark-mode .list-item.plan-item.plan-item--favorite-transfer-in {
        border-color: rgba(251, 191, 36, 0.88);
    }

    .plan-drag-stack .plan-item {
        touch-action: pan-y;
        -webkit-tap-highlight-color: transparent;
        will-change: transform;
    }

    .list-item.plan-item.plan-item--drag-source {
        z-index: 7;
    }

    .list-item.plan-item.plan-item--reorder-focus {
        border-color: rgba(96, 165, 250, 0.52);
        box-shadow:
            0 26px 58px rgba(59, 130, 246, 0.18),
            0 18px 40px rgba(15, 23, 42, 0.22);
    }

    .list-item.plan-item.plan-item--reorder-focus > .plan-row1,
    .list-item.plan-item.plan-item--reorder-near > .plan-row1,
    .list-item.plan-item.plan-item--lane-right > .plan-row1,
    .list-item.plan-item.plan-item--lane-left > .plan-row1,
    .list-item.plan-item.plan-item--settle-up > .plan-row1,
    .list-item.plan-item.plan-item--settle-down > .plan-row1 {
        will-change: transform;
        transition: transform .28s cubic-bezier(0.2, 0.9, 0.2, 1.08);
    }

    .list-item.plan-item.plan-item--reorder-focus > .plan-row1 {
        transform: translate3d(0, -3px, 0) scale(1.012);
    }

    .list-item.plan-item.plan-item--lane-right > .plan-row1 {
        transform: translate3d(10px, 7px, 0) scale(.992);
    }

    .list-item.plan-item.plan-item--lane-left > .plan-row1 {
        transform: translate3d(-10px, -7px, 0) scale(.992);
    }

    .list-item.plan-item.plan-item--settle-up > .plan-row1 {
        animation: plan-reorder-settle-up .22s cubic-bezier(0.22, 0.9, 0.24, 1) both;
    }

    .list-item.plan-item.plan-item--settle-down > .plan-row1 {
        animation: plan-reorder-settle-down .22s cubic-bezier(0.22, 0.9, 0.24, 1) both;
    }

    @keyframes plan-card-reveal {
        0% {
            opacity: 0;
            transform: translateY(18px) scale(.985);
        }

        100% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes plan-card-duplicate-settle {
        0% {
            transform: translateY(16px) scale(.982);
        }

        48% {
            transform: translateY(-3px) scale(1.01);
        }

        100% {
            transform: translateY(0) scale(1);
        }
    }

    @keyframes plan-duplicate-echo-back {
        0% {
            opacity: 0;
            transform: translate(22px, 18px) scale(.97);
        }

        45% {
            opacity: .62;
            transform: translate(12px, 10px) scale(.985);
        }

        100% {
            opacity: 0;
            transform: translate(6px, 4px) scale(.995);
        }
    }

    @keyframes plan-duplicate-sheen {
        0% {
            opacity: 0;
            transform: translateX(-24px);
        }

        30% {
            opacity: .9;
        }

        100% {
            opacity: 0;
            transform: translateX(28px);
        }
    }

    @keyframes plan-reorder-settle-up {
        0% {
            transform: translate3d(8px, 5px, 0) scale(.994);
        }

        100% {
            transform: translate3d(0, 0, 0) scale(1);
        }
    }

    @keyframes plan-reorder-settle-down {
        0% {
            transform: translate3d(-8px, -5px, 0) scale(.994);
        }

        100% {
            transform: translate3d(0, 0, 0) scale(1);
        }
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
        cursor: copy;
        user-select: none;
    }

    .plan-code-copy {
        margin-left: .35rem;
    }

    .plan-header .section-title {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: .35rem;
        min-width: 0;
        width: 100%;
        margin: 0;
    }

    .plan-title-main {
        max-width: 100%;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .plan-code-row {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .35rem;
        white-space: nowrap;
        max-width: 100%;
    }

    .plan-goal-strip {
        justify-content: center;
        width: 100%;
        margin-bottom: .7rem;
    }


    /* mehr Luft zwischen Plan-Liste und anderem */
    .plans-section {
        margin-top: 2.25rem;
        margin-bottom: 2.25rem;
    }

    .play-icon {
        width: 30px;
        height: 30px;
        display: block;
        object-fit: contain;
        opacity: .95;
        pointer-events: none; /* klick bleibt auf dem Button */
        filter: drop-shadow(0 1px 2px rgba(0,0,0,.25));
    }

    .inline-actions {
        display: inline-flex;
        gap: .4rem;
    }

    /* HARD ALIGN: alle rechten Controls kriegen exakt gleiche Zeilenhöhe */
    .plan-right {
        align-items: center;
    }

        /* Wichtig: Das trifft FavoriteButton-Root, kebab-wrap, OpenButton-Root, inline-actions-Wrapper */
        .plan-right > * {
            height: 44px;
            display: inline-flex;
            align-items: center;
        }

        /* inline-actions ist ein Wrapper ? Höhe hart */
        .plan-right > .inline-actions {
            height: 44px;
            align-items: center;
        }

    /* kebab-wrap Buttons exakt gleiche Clickfläche */
    .kebab-wrap {
        display: inline-flex;
        align-items: center;
        height: 44px;
        gap: .4rem;
    }

        .kebab-wrap button {
            width: 44px;
            height: 44px;
            padding: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

        /* ? hängt sonst optisch zu tief */
        .kebab-wrap button {
            font-size: 22px;
        }

            .kebab-wrap button:last-child {
                transform: translateY(-2px);
            }

    /* ADD (only once) - put this as the ONLY max-width:560px block, at the end */
    @media (max-width: 560px) {

        /* ? Draggable soll funktionieren -> Handle sichtbar lassen */
        .plan-drag-handle {
            display: inline-flex !important;
        }

        /* ? Mobile: wir zeigen Play + Kebab (kebab-wrap), inline-actions weg */
        .inline-actions {
            display: none !important;
        }

        .kebab-wrap {
            display: inline-flex !important;
            align-items: center;
            height: 44px;
            gap: .4rem;
        }

        /* ? Layout stabil und nicht 5x anders */
        .plan-item {
            position: relative;
            display: block !important;
        }

        .plan-row1 {
            display: grid !important;
            grid-template-columns: auto minmax(0, 1fr) auto;
            align-items: center;
            gap: .5rem;
            width: 100%;
            position: relative;
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
            gap: .35rem;
            flex-wrap: nowrap;
            white-space: nowrap;
        }

        /* ? PlanMenu muss auf Mobile sauber drüber liegen */
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

        html.dark-mode .plan-menu {
            border-color: rgba(148, 163, 184, 0.34);
            background: radial-gradient(circle at 18% 30%, color-mix(in srgb, #6366f1 18%, transparent), transparent 62%), radial-gradient(circle at 85% 75%, color-mix(in srgb, #22c55e 12%, transparent), transparent 70%), rgba(2, 6, 23, 0.78);
            box-shadow: 0 22px 60px rgba(0, 0, 0, 0.58), inset 0 1px 0 rgba(255,255,255,0.05);
        }

        /* ? Abstand der Section auf Mobile */
        .plans-section {
            margin-top: 1.75rem;
            margin-bottom: 1.75rem;
        }

        /* ? kill leftovers (diese Klassen existieren bei dir, aber sollen mobile nichts tun) */
        .plan-row2,
        .mobile-open {
            display: none !important;
        }

        .desktop-open {
            display: inline-flex !important;
        }

        .kebab-wrap .play-icon {
            transform: translateY(4px);
        }
    }

    /* ===== RESPONSIVE ACTIONS: clean & eindeutig ===== */
    /* ===== RESPONSIVE ACTIONS (final): <=1024 = kebab, >=1025 = inline ===== */
    @media (min-width: 1023px) {
        .inline-actions {
            display: inline-flex !important;
        }

        .kebab-wrap {
            display: none !important;
        }
    }

    @media (max-width: 1024px) {
        .inline-actions {
            display: none !important;
        }

        .kebab-wrap {
            display: inline-flex !important;
        }
    }

    /* Play IMMER ganz rechts */
    .plan-right .play-btn {
        order: 9999;
    }

    .plan-drag-stack--others {
        margin-top: 1.25rem; /* Abstand zwischen Favoriten & Nicht-Favoriten */
    }

    .external-plan-box {
        margin: 12px 0 16px;
        padding: 0;
        border: 0;
        background: transparent;
    }

    .external-plan-card {
        display: flex;
        gap: 14px;
        align-items: center;
        justify-content: space-between;
        padding: 1.05rem 1.25rem;
        border-radius: 18px;
        /* TYG premium card vibe (matcht deine .list-item.plan-item Richtung) */
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 92%, #020617 8%);
        border: 1px solid rgba(148, 163, 184, 0.28);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease;
    }

    @media (hover: hover) {
        .external-plan-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.30);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    html.dark-mode .external-plan-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 58%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.26);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.70);
    }

    .external-plan-left {
        min-width: 0;
    }

    .external-plan-title {
        font-size: 0.98rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: .2px;
    }

    .external-plan-sub {
        margin-top: .2rem;
        font-size: 0.85rem;
        opacity: 0.88;
    }

    .external-plan-hint,
    .external-plan-error {
        padding: .9rem 1.15rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-card) 86%, #020617 14%);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18);
        font-size: 0.85rem;
    }

    .external-plan-error {
        border-color: rgba(239, 68, 68, 0.35);
    }

    .external-plan-actions :deep(button),
    .external-plan-actions button {
        height: 44px;
        padding: 0 .85rem;
        border-radius: 12px;
        /* neutral + clean */
        border: 1px solid rgba(148, 163, 184, 0.20);
        background: color-mix(in srgb, var(--bg-card) 88%, #020617 12%);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.14);
        transition: background .15s ease, border-color .15s ease;
    }


    .icon-download--install {
        width: 50px;
        height: 40px;
        display: block;
        pointer-events: none;
        filter: brightness(0) invert(1); /* macht das Icon weiß */
    }

.install-text {
        margin-left: .45rem;
        font-weight: 700;
    }

    .plan-header {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
        align-items: center;
        justify-content: space-between;
    }

    .plan-goal-strip {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-left: auto;
    }

    .plan-goal-pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 6px 10px;
        font-size: 0.8rem;
        font-weight: 700;
        background: rgba(59, 130, 246, 0.12);
        color: #1d4ed8;
        border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .plan-goal-pill.is-achieved {
        background: rgba(16, 185, 129, 0.16);
        color: #047857;
        border-color: rgba(16, 185, 129, 0.25);
    }

    .plan-goal-pill.is-needs_attention {
        background: rgba(245, 158, 11, 0.14);
        color: #b45309;
        border-color: rgba(245, 158, 11, 0.24);
    }

    .plan-goal-hints {
        display: grid;
        gap: 8px;
        margin-top: 8px;
    }

    .plan-goal-hint {
        display: grid;
        gap: 2px;
        padding: 8px 10px;
        border-radius: 12px;
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(59, 130, 246, 0.18);
    }

    .plan-goal-hint.is-achieved {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.22);
    }

    .plan-goal-hint.is-needs_attention {
        background: rgba(245, 158, 11, 0.12);
        border-color: rgba(245, 158, 11, 0.22);
    }

    .plan-goal-hint__title {
        font-size: 0.82rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .plan-goal-hint__meta,
    .plan-goal-hint__copy {
        font-size: 0.76rem;
        color: var(--text-secondary);
    }

    html.dark-mode .plan-goal-pill {
        background: rgba(96, 165, 250, 0.14);
        color: #bfdbfe;
        border-color: rgba(96, 165, 250, 0.24);
    }

    html.dark-mode .plan-goal-pill.is-achieved {
        background: rgba(16, 185, 129, 0.18);
        color: #a7f3d0;
        border-color: rgba(16, 185, 129, 0.28);
    }

    html.dark-mode .plan-goal-pill.is-needs_attention {
        background: rgba(245, 158, 11, 0.18);
        color: #fde68a;
        border-color: rgba(245, 158, 11, 0.28);
    }

    html.dark-mode .plan-goal-hint {
        background: rgba(30, 41, 59, 0.9);
        border-color: rgba(96, 165, 250, 0.2);
    }

    html.dark-mode .plan-goal-hint.is-achieved {
        border-color: rgba(16, 185, 129, 0.24);
    }

    html.dark-mode .plan-goal-hint.is-needs_attention {
        border-color: rgba(245, 158, 11, 0.24);
    }

    @media (max-width: 820px) {
        .plan-goal-strip {
            width: 100%;
            margin-left: 0;
        }
    }
</style>


