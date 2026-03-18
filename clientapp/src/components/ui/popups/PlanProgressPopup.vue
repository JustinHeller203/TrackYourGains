<!--components/ui/popups/PlanProgressPopup.vue-->
<template>
    <BasePopup :show="show && !!currentPlanId"
               :title="`📖 Fortschritt – ${currentPlanName}`"
               overlayClass="plan-progress-popup"
               :showClose="true"
               @cancel="emit('close')">

        <!-- Scroll-Container (Ref bleibt vorhanden für Parent-Logik) -->
        <div class="modal--progress"
             ref="modalEl"
             @touchstart="onSwipeStart"
             @touchmove="onSwipeMove"
             @touchend="onSwipeEnd"
             @touchcancel="onSwipeCancel">

            <div v-if="!dayCards.length && !plannedDaysForCurrentPlan.length" class="empty-state">
                <div class="empty-icon" aria-hidden="true">📈</div>

                <div class="empty-left">
                    <div class="empty-title">Noch kein Fortschritt erfasst.</div>
                    <div class="empty-sub">Leg direkt los und tracke deinen ersten Eintrag.</div>
                </div>

                <div class="empty-cta">
                    <button type="button"
                            class="progress-btn progress-btn--primary"
                            @click="emit('add-entry', { planId: currentPlanId!, keepOpen: true })">
                        Erster Eintrag
                    </button>
                </div>
            </div>

            <div v-else>
                <div v-if="planRotationNotice || (testNoticeVisible && planRotationTestNotice)"
                     class="plan-rotation-notice"
                     role="status"
                     aria-live="polite">
                    <div class="notice-icon" aria-hidden="true">⏳</div>
                    <div class="notice-body">
                        <div class="notice-title">{{ (planRotationNotice ?? planRotationTestNotice!).title }}</div>
                        <div class="notice-text">{{ (planRotationNotice ?? planRotationTestNotice!).body }}</div>
                    </div>
                </div>

                <div v-if="planLastSummary" class="plan-last-summary">
                    <div class="summary-label">Letztes Training</div>
                    <div class="summary-body">{{ planLastSummary }}</div>
                </div>

                <div v-if="plannedCompletionPraise" class="plan-completion-praise" role="status" aria-live="polite">
                    <div class="praise-icon" aria-hidden="true">✅</div>
                    <div class="praise-text">{{ plannedCompletionPraise }}</div>
                </div>

                <CalendarDayPopup :show="showDayPopup"
                                  :day="popupDay"
                                  :dayLabel="popupDayLabel"
                                  :isToday="popupIsToday"
                                  :isFuture="popupIsFuture"
                                  :isPlanned="popupIsPlanned"
                                  :isRest="popupIsRest"
                                  :isCompleted="popupIsCompleted"
                                  :allowComplete="popupAllowComplete"
                                  :allowPlan="popupAllowPlan"
                                  :allowEdit="popupAllowEdit"
                                  :allowRest="popupAllowRest"
                                  :allowMove="popupAllowMove"
                                  :allowClear="popupAllowClear"
                                  :planOptions="planOptions"
                                  :colorOptions="colorOptions"
                                  :defaultPlanId="popupPlanId"
                                  :defaultColor="popupColor"
                                  :minDate="todayLocalKey"
                                  @close="closeDayPopup"
                                  @complete="onPopupComplete"
                                  @plan="onPopupPlan"
                                  @update="onPopupUpdate"
                                  @rest="onPopupRest"
                                  @move="onPopupMove"
                                  @clear="onPopupClear" />

                <!-- View Toggle -->
                <div class="progress-topbar">
                    <button type="button"
                            class="progress-btn"
                            :class="{ 'progress-btn--active': viewMode === 'list' }"
                            @click="viewMode = 'list'">
                        Liste
                    </button>

                    <button v-if="viewMode === 'list' && selectedDay"
                            type="button"
                            class="progress-btn"
                            @click="clearSelectedDay">
                        Alle Tage
                    </button>

                    <button type="button"
                            class="progress-btn"
                            :class="{ 'progress-btn--active': viewMode === 'calendar' }"
                            @click="viewMode = 'calendar'">
                        Kalender
                    </button>

                    <button type="button"
                            class="progress-btn"
                            :class="{ 'progress-btn--active': viewMode === 'stats' }"
                            @click="viewMode = 'stats'">
                        Statistik
                    </button>
                </div>

                <!-- Calendar View -->
                <Calender v-if="viewMode === 'calendar'"
                          :daysWithEntries="calendarMarkedDaysArr"
                          :dayColors="calendarDayColors"
                          :dayTitles="calendarDayTitles"
                          :prDays="calendarPrDaysArr"
                          :checkDays="completedPlannedDaysArr"
                          :crossDays="missedPlannedPastDaysArr"
                          @select="onCalendarSelect"
                          @dblclick="onCalendarDblClick" />

                <!-- List View -->
                <PlanProgressStats v-else-if="viewMode === 'stats'"
                                   :entries="apiWorkouts" />

                <!-- List View -->
                <div v-else class="day-card-list">

                    <article v-for="c in displayDayCards" :key="c.day" class="day-card" :data-day="c.day">

                        <div class="day-card-row"
                             role="button"
                             tabindex="0"
                             :aria-expanded="expandedDays.has(c.day)"
                             @click="toggleDay(c.day)"
                             @keydown.enter.prevent="toggleDay(c.day)"
                             @keydown.space.prevent="toggleDay(c.day)">
                            <div class="day-card-main">
                                <div class="day-date">{{ formatDayLong(c.day) }}</div>
                                <div class="day-meta">
                                    <span class="count">{{ c.uniqueExercises }} {{ c.uniqueExercises === 1 ? 'Übung' : 'Übungen' }}</span>
                                    <span v-if="dayPersonalRecordCount(c.day) > 0" class="day-pr-badge">
                                        {{ dayPersonalRecordCount(c.day) }} PR{{ dayPersonalRecordCount(c.day) > 1 ? 's' : '' }}
                                    </span>
                                </div>
                            </div>

                            <div class="day-card-actions" @click.stop @dblclick.stop>
                                <KebabButton title="Mehr"
                                             ariaLabel="Aktionen"
                                             @click.stop="openDayMenu(c.day, $event)" />
                            </div>

                        </div>

                        <div v-if="selectedDay && c.day === selectedDay && !hasEntriesForSelectedDay"
                             class="day-empty">
                            Kein Eintrag an diesem Tag gemacht.
                        </div>

                        <button v-else-if="dayPersonalRecordCount(c.day) > 0"
                                type="button"
                                class="day-pr-summary"
                                :aria-expanded="expandedPrDays.has(c.day)"
                                @click.stop="togglePrDay(c.day)">
                            <span class="day-pr-summary__icon" aria-hidden="true">🏆</span>
                            <span class="day-pr-summary__text">
                                {{ dayPersonalRecordCount(c.day) }} persönliche{{ dayPersonalRecordCount(c.day) > 1 ? ' Rekorde' : 'r Rekord' }} an diesem Tag.
                            </span>
                            <span class="day-pr-summary__caret" :class="{ open: expandedPrDays.has(c.day) }" aria-hidden="true"></span>
                        </button>

                        <div v-if="expandedPrDays.has(c.day) && dayPersonalRecordDetails(c.day).length"
                             class="day-pr-details">
                            <div v-for="detail in dayPersonalRecordDetails(c.day)"
                                 :key="`${c.day}-${detail.exercise}-${detail.metric}`"
                                 class="day-pr-detail">
                                <span class="day-pr-detail__exercise">{{ detail.exercise }}</span>
                                <span class="day-pr-detail__metric">{{ detail.metricLabel }}</span>
                                <span class="day-pr-detail__value">{{ detail.valueLabel }}</span>
                            </div>
                        </div>

                        <div class="day-details-wrap" :class="{ open: expandedDays.has(c.day) }">
                            <div class="day-details">
                                <!-- Kraft / Calisthenics -->
                                <div v-if="strengthForDay(c.day).length" class="exercise-block">
                                    <div class="exercise-header-row">
                                        <div class="exercise-header-left">
                                            <div class="exercise-header">Kraft</div>

                                            <button type="button"
                                                    class="section-toggle"
                                                    :aria-expanded="!isSectionCollapsed(c.day, 'strength')"
                                                    :aria-controls="`sec-${c.day}-strength`"
                                                    @click.stop="toggleSection(c.day, 'strength')">
                                                <span class="section-caret" :class="{ open: !isSectionCollapsed(c.day, 'strength') }" aria-hidden="true"></span>
                                                <span class="sr-only">
                                                    {{ isSectionCollapsed(c.day, 'strength') ? 'Aufklappen' : 'Zuklappen' }}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div :id="`sec-${c.day}-strength`" v-show="!isSectionCollapsed(c.day, 'strength')">
                                        <ul class="journal-entries">
                                            <li v-for="g in strengthGroupsForDay(c.day)"
                                                :key="g.key"
                                                class="journal-entry">
                                                <div class="entry-head"
                                                     role="button"
                                                     tabindex="0"
                                                     @dblclick.stop.prevent="onEntryDblClick(g.editEntry)"
                                                     @keydown.enter.stop.prevent="onEntryDblClick(g.editEntry)">
                                                    <span class="entry-exercise">{{ g.entry.exercise }}</span>

                                                    <span class="entry-actions">
                                                        <template v-if="g.entry.setDetails?.length">
                                                            <span v-if="g.stats.repsAvg != null" class="sum-pill">
                                                                Ø {{ g.stats.repsAvg }} <span class="sum-u">Wdh</span>
                                                            </span>

                                                            <span v-if="g.stats.weightAvg != null" class="sum-pill">
                                                                Ø {{ g.stats.weightAvg }} <span class="sum-u">kg</span>
                                                            </span>
                                                        </template>

                                                        <template v-else>
                                                            <span v-if="g.entry.reps" class="sum-pill">
                                                                {{ g.entry.reps }} <span class="sum-u">Wdh</span>
                                                            </span>

                                                            <span v-if="g.entry.weight != null" class="sum-pill">
                                                                {{ g.entry.weight }} <span class="sum-u">kg</span>
                                                            </span>
                                                        </template>

                                                        <button v-if="hasDetails(g.entry)"
                                                                type="button"
                                                                class="sum-pill sum-pill--ghost"
                                                                @click.stop="toggleGroupSets(g.key)">
                                                            {{ expandedEntryKeys.has(g.key) ? 'Weniger' : 'Details' }}
                                                        </button>
                                                    </span>
                                                </div>

                                                <div v-if="expandedEntryKeys.has(g.key) && hasDetails(g.entry)"
                                                     class="set-details"
                                                     @click.stop>

                                                    <div v-if="extrasForEntry(g.entry).length" class="extras-grid">
                                                        <span v-for="(x, xi) in extrasForEntry(g.entry)"
                                                              :key="`xd-${xi}`"
                                                              class="extra-chip">
                                                            <span class="extra-k">{{ x.label }}</span>
                                                            <span class="extra-v">{{ x.value }}</span>
                                                        </span>
                                                    </div>

                                                    <div v-if="g.entry.setDetails?.length" class="set-list">
                                                        <div v-for="(s, idx) in g.entry.setDetails"
                                                             :key="idx"
                                                            class="set-row">
                                                            <span class="set-idx-wrap">
                                                                <span class="set-idx">{{ idx + 1 }}S</span>
                                                                <span v-if="setLabelText(s.label)"
                                                                      :ref="el => bindSetNameEl(`str|${g.key}|${idx}`, el)"
                                                                      class="set-name"
                                                                      :class="{ 'is-overflowing': isSetNameOverflowing(`str|${g.key}|${idx}`) }">
                                                                    <span class="set-name__text">{{ setLabelText(s.label) }}</span>
                                                                </span>
                                                            </span>
                                                            <span class="set-reps">{{ s.reps ?? '–' }} Wdh</span>
                                                            <span class="set-weight">{{ s.weight ?? '–' }} kg</span>
                                                            <span v-if="strengthSetWeightHintText(g.entry, idx)"
                                                                  class="set-upgrade-hint">
                                                                {{ strengthSetWeightHintText(g.entry, idx) }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div v-if="g.entry.note" class="note">— {{ g.entry.note }}</div>

                                                <div v-if="abbrItemsForEntry(g.entry).length" class="entry-footer" @click.stop>
                                                    <span v-for="(it, idx) in abbrItemsForEntry(g.entry)"
                                                          :key="it.key"
                                                          class="abbr-item">
                                                        <span class="abbr-k">{{ it.key }}</span>
                                                        <span class="abbr-sep">=</span>
                                                        <span class="abbr-v">{{ it.label }}</span>
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Cardio (zeit-/distanzbasiert) -->
                                <div v-if="cardioGroupsForDay(c.day).length" class="exercise-block">
                                    <div class="exercise-header-row">
                                        <div class="exercise-header">Cardio</div>

                                        <button type="button"
                                                class="section-toggle"
                                                :aria-expanded="!isSectionCollapsed(c.day, 'cardio')"
                                                :aria-controls="`sec-${c.day}-cardio`"
                                                @click.stop="toggleSection(c.day, 'cardio')">
                                            <span class="section-caret" :class="{ open: !isSectionCollapsed(c.day, 'cardio') }" aria-hidden="true"></span>
                                            <span class="sr-only">
                                                {{ isSectionCollapsed(c.day, 'cardio') ? 'Aufklappen' : 'Zuklappen' }}
                                            </span>
                                        </button>
                                    </div>

                                    <div :id="`sec-${c.day}-cardio`" v-show="!isSectionCollapsed(c.day, 'cardio')">
                                        <ul class="journal-entries">
                                            <li v-for="g in cardioGroupsForDay(c.day)"
                                                :key="g.key"
                                                class="journal-entry">
                                                <div class="entry-head"
                                                     role="button"
                                                     tabindex="0"
                                                     @dblclick.stop.prevent="onEntryDblClick(g.editEntry)"
                                                     @keydown.enter.stop.prevent="onEntryDblClick(g.editEntry)">

                                                    <span class="entry-exercise">{{ g.entry.exercise }}</span>

                                                    <span class="entry-actions">
                                                        <span v-if="g.summary.durationSumMin > 0" class="sum-pill">
                                                            Σ {{ g.summary.durationSumMin }} <span class="sum-u">Min</span>
                                                        </span>

                                                        <span v-if="g.summary.intervalsText" class="sum-pill">
                                                            {{ g.summary.intervalsText }} <span class="sum-u">Int</span>
                                                        </span>

                                                        <button v-if="hasDetails(g.entry) || g.entries.length"
                                                                type="button"
                                                                class="sum-pill sum-pill--ghost"
                                                                @click.stop="toggleGroupSets(g.key)">
                                                            {{ expandedEntryKeys.has(g.key) ? 'Weniger' : 'Details' }}
                                                        </button>
                                                    </span>

                                                </div>

                                                <div v-if="expandedEntryKeys.has(g.key) && (hasDetails(g.entry) || g.entries.length)"
                                                     class="set-details"
                                                     @click.stop>

                                                    <!-- Summary (kommt immer zuerst) -->
                                                    <div class="metric-grid">
                                                        <div v-if="g.summary.durationSumMin > 0" class="metric">
                                                            <div class="metric-label">Σ Dauer</div>
                                                            <div class="metric-value">
                                                                {{ g.summary.durationSumMin }} <span class="metric-u">Min</span>
                                                            </div>
                                                        </div>

                                                        <div v-if="g.summary.distanceSumKm != null" class="metric">
                                                            <div class="metric-label">Σ Distanz</div>
                                                            <div class="metric-value">
                                                                {{ g.summary.distanceSumKm }} <span class="metric-u">km</span>
                                                            </div>
                                                        </div>

                                                        <div v-if="g.summary.paceTotal" class="metric">
                                                            <div class="metric-label">Pace</div>
                                                            <div class="metric-value">
                                                                {{ g.summary.paceTotal }} <span class="metric-u">/km</span>
                                                            </div>
                                                        </div>

                                                        <div v-if="g.summary.avgHrAvg != null" class="metric">
                                                            <div class="metric-label">Ø Puls</div>
                                                            <div class="metric-value">
                                                                {{ g.summary.avgHrAvg }}
                                                            </div>
                                                        </div>

                                                        <div v-if="g.summary.caloriesSum != null" class="metric">
                                                            <div class="metric-label">Σ kcal</div>
                                                            <div class="metric-value">
                                                                {{ g.summary.caloriesSum }}
                                                            </div>
                                                        </div>

                                                        <div v-if="g.summary.intervalsText" class="metric">
                                                            <div class="metric-label">Intervals</div>
                                                            <div class="metric-value">
                                                                {{ g.summary.intervalsText }}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- Extras (aus gemergtem Entry) - bleibt da, aber kommt zuletzt -->
                                                    <div v-if="extrasForEntry(g.entry).length" class="extras-grid extras-grid--scroll">
                                                        <span v-for="(x, xi) in extrasForEntry(g.entry)"
                                                              :key="`cxd-${xi}`"
                                                              class="extra-chip">
                                                            <span class="extra-k">{{ x.label }}</span>
                                                            <span class="extra-v">{{ x.value }}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div v-if="g.entry.note" class="note">— {{ g.entry.note }}</div>

                                                <div v-if="abbrItemsForCardio(g.entries, g.entry).length" class="entry-footer" @click.stop>
                                                    <span v-for="it in abbrItemsForCardio(g.entries, g.entry)"
                                                          :key="it.key"
                                                          class="abbr-item">
                                                        <span class="abbr-k">{{ it.key }}</span>
                                                        <span class="abbr-sep">=</span>
                                                        <span class="abbr-v">{{ it.label }}</span>
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <!-- Dehnung (zeit-/satzbasiert) -->
                                <div v-if="stretchForDay(c.day).length" class="exercise-block">
                                    <div class="exercise-header-row">
                                        <div class="exercise-header">Dehnung</div>

                                        <button type="button"
                                                class="section-toggle"
                                                :aria-expanded="!isSectionCollapsed(c.day, 'stretch')"
                                                :aria-controls="`sec-${c.day}-stretch`"
                                                @click.stop="toggleSection(c.day, 'stretch')">
                                            <span class="section-caret" :class="{ open: !isSectionCollapsed(c.day, 'stretch') }" aria-hidden="true"></span>
                                            <span class="sr-only">
                                                {{ isSectionCollapsed(c.day, 'stretch') ? 'Aufklappen' : 'Zuklappen' }}
                                            </span>
                                        </button>
                                    </div>

                                    <div :id="`sec-${c.day}-stretch`" v-show="!isSectionCollapsed(c.day, 'stretch')">
                                        <ul class="journal-entries">
                                            <li v-for="(e, i) in stretchForDay(c.day)"
                                                :key="'flex-'+e.date+'-'+i"
                                                class="journal-entry">
                                                <div class="entry-head"
                                                     role="button"
                                                     tabindex="0"
                                                     @dblclick.stop.prevent="onEntryDblClick(e)"
                                                     @keydown.enter.stop.prevent="onEntryDblClick(e)">

                                                    <span class="entry-exercise">{{ stretchTitle(e) }}</span>

                                                    <span class="entry-actions">
                                                        <span v-if="stretchSummaryDuration(e)" class="sum-pill">
                                                            Ø {{ stretchSummaryDuration(e) }} <span class="sum-u">sek</span>
                                                        </span>

                                                        <button v-if="hasDetails(e)"
                                                                type="button"
                                                                class="sum-pill sum-pill--ghost"
                                                                @click.stop="toggleEntrySets(e, i)">
                                                            {{ expandedEntryKeys.has(entryKey(e, i)) ? 'Weniger' : 'Details' }}
                                                        </button>
                                                    </span>
                                                </div>

                                                <div v-if="expandedEntryKeys.has(entryKey(e, i)) && hasDetails(e)"
                                                     class="set-details"
                                                     @click.stop>

                                                    <div v-if="rowIndexes(e).length" class="set-list">
                                                        <div v-for="idx in rowIndexes(e)"
                                                             :key="`s-row-${idx}`"
                                                             class="set-row">
                                                            <span class="set-idx-wrap">
                                                                <span class="set-idx">{{ idx }}S</span>
                                                                <span v-if="setLabelText(stretchSetLabel(e, idx))"
                                                                      :ref="el => bindSetNameEl(`st|${entryKey(e, i)}|${idx}`, el)"
                                                                      class="set-name"
                                                                      :class="{ 'is-overflowing': isSetNameOverflowing(`st|${entryKey(e, i)}|${idx}`) }">
                                                                    <span class="set-name__text">{{ setLabelText(stretchSetLabel(e, idx)) }}</span>
                                                                </span>
                                                            </span>
                                                            <span class="set-reps">{{ stretchRepsText(e, idx) }}</span>
                                                            <span class="set-right">{{ stretchDurationText(e, idx) }}</span>
                                                        </div>
                                                    </div>

                                                    <div v-if="extrasForEntry(e).length" class="extras-grid">
                                                        <span v-for="(x, xi) in extrasForEntry(e)"
                                                              :key="`sxd-${xi}`"
                                                              class="extra-chip">
                                                            <span class="extra-k">{{ x.label }}</span>
                                                            <span class="extra-v">{{ x.value }}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div v-if="e.note" class="note">— {{ e.note }}</div>

                                                <div v-if="abbrItemsForEntry(e).length" class="entry-footer" @click.stop>
                                                    <span v-for="it in abbrItemsForEntry(e)"
                                                          :key="it.key"
                                                          class="abbr-item">
                                                        <span class="abbr-k">{{ it.key }}</span>
                                                        <span class="abbr-sep">=</span>
                                                        <span class="abbr-v">{{ it.label }}</span>
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div class="day-feedback-cta" @click.stop>
                                    <button type="button"
                                            class="progress-btn day-feedback-btn"
                                            @click.stop="emit('feedback', { day: c.day })">
                                        {{ hasFeedbackForDay(c.day) ? 'Dein Feedback ansehen' : 'Feedback ausfüllen' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>

                    <div v-if="!selectedDay && dayCards.length > visibleDays" class="load-more">
                        <button class="progress-btn" @click="visibleDays = visibleDays + 7">
                            Weitere Tage laden
                        </button>
                    </div>
                </div>
            </div>

            <div class="scroll-sentinel-end" aria-hidden="true" style="height:1px"></div>
        </div>

        <template #actions>
            <PopupActionButton variant="ghost" @click="emit('close')">
                Abbrechen
            </PopupActionButton>

            <PopupActionButton @click="emit('add-entry', { planId: currentPlanId!, keepOpen: true })">
                Neuer Eintrag
            </PopupActionButton>
        </template>

        <ActionSelectPopup :show="showEntryPickPopup"
                           :title="entryPickAction === 'delete' ? 'Übungen löschen' : 'Übung bearbeiten'"
                           :subtitle="entryPickAction === 'delete'
        ? 'Setz Haken, welche Übungen aus diesem Tag gelöscht werden sollen'
        : 'Wähl eine Übung aus diesem Tag'"
                           :helper="entryPickAction === 'edit' ? 'Bearbeiten ist Single-Select.' : ''"
                           :rows="entryPickRows"
                           :selectionMode="entryPickAction === 'edit' ? 'single' : 'multi'"
                           :showAllOption="entryPickAction === 'delete'"
                           allLabel="Alle Übungen"
                           v-model:allSelected="entryPickAll"
                           v-model:selectedIds="entryPickSelected"
                           cancelText="Abbrechen"
                           :confirmText="entryPickAction === 'delete' ? 'Löschen' : 'Weiter'"
                           :confirmDanger="entryPickAction === 'delete'"
                           @cancel="closeEntryPickPopup"
                           @confirm="onEntryPickConfirm" />

        <ActionSelectPopup :show="showDownloadPickPopup"
                           title="Übungen herunterladen"
                           subtitle="Wähl aus, welche Übungen aus diesem Tag im Export landen sollen"
                           :rows="downloadPickRows"
                           selectionMode="multi"
                           :showAllOption="true"
                           allLabel="Alle Übungen"
                           v-model:allSelected="downloadPickAll"
                           v-model:selectedIds="downloadPickSelected"
                           cancelText="Abbrechen"
                           confirmText="Weiter"
                           @cancel="closeDownloadPickPopup"
                           @confirm="onDownloadPickConfirm" />

        <KebabMenu :open="!!menuDay"
                   :anchorEl="menuAnchorEl"
                   :items="menuItems"
                   @close="closeDayMenu"
                   @select="onDayMenuSelect" />

        <DeleteConfirmPopup :show="showDeletePopup"
                            @cancel="cancelDelete"
                            @confirm="confirmDelete" />

    </BasePopup>
</template>



<script setup lang="ts">
    import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
    import type { ComponentPublicInstance } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import KebabButton from '@/components/ui/buttons/KebabButton.vue'
    import KebabMenu, { type KebabMenuItem } from '@/components/ui/menu/KebabMenu.vue'
    import ActionSelectPopup, { type ActionSelectRow } from '@/components/ui/popups/ActionSelectPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import CalendarDayPopup from '@/components/ui/popups/CalendarDayPopup.vue'
    import Calender from '@/components/ui/kits/calender/Calender.vue'
    import PlanProgressStats from '@/components/ui/progress/PlanProgressStats.vue'
    import { useProgressStore } from "@/store/progressStore"
    import { useTrainingPlansStore } from '@/store/trainingPlansStore'
    import { useAuthStore } from '@/store/authStore'
    import type { ProgressEntry } from "@/types/Progress"
    import { LS_TRAINING_PLANNER, LS_TRAINING_REST_DAYS, LS_TRAINING_PLANNER_COMPLETED } from '@/constants/storageKeys'
    import { addTrainingPlanner, addTrainingPlannerRestDay, deleteTrainingPlanner, deleteTrainingPlannerRestDay, listTrainingPlanner, setTrainingPlannerCompletion } from '@/services/trainingPlanner'
    import { setTrainingPlanColor } from '@/services/trainingPlans'
    import { storeToRefs } from "pinia"
    import { getWeightIncreaseHint } from '@/utils/trainingWeightIncreaseHint'
    import {
        computeExercisePersonalRecords,
        getEntryPersonalRecordMetrics,
        personalRecordExerciseKey,
        personalRecordMetricLabel,
        personalRecordMetricValueLabel,
    } from '@/utils/personalRecords'

    type DayCard = { day: string; uniqueExercises: number }
    type PlannedStrengthMeta = { reps: number | null; goal: string | null; type: string | null }

    type WorkoutLike = {
        id?: string | null
        planId?: string | null
        exercise: string
        date: string

        // core
        type?: 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer' | null
        note?: string | null

        // shared-ish fields
        weight?: number | null
        sets?: number | null
        reps?: number | null

        // per-set details (kraft/calisthenics)
        setDetails?: Array<{ weight: number | null; reps: number | null; durationSec?: number | null; label?: string | null }> | null

        // kraft extras
        tempo?: string | null
        restSeconds?: number | null
        isDropset?: boolean | null
        dropsets?: Array<{ weight: number | null; reps: number | null }> | null

        // cardio
        durationMin?: number | null
        distanceKm?: number | null
        avgHr?: number | null
        calories?: number | null
        pace?: string | null
        hrZone?: number | null
        borg?: number | null

        // stretch extras
        side?: string | null
        painFree?: number | null
        equipment?: string | null
        equipmentCustom?: string | null
    }


    const props = defineProps<{
        show: boolean
        currentPlanId: string | null
        currentPlanName: string
        initialView?: 'list' | 'calendar' | 'stats'
        planRotationNotice?: { title: string; body: string } | null
        planRotationTestNotice?: { title: string; body: string } | null
        workouts: WorkoutLike[]
        formatDayLong: (yyyyMMdd: string) => string
        feedbackStatusByDay?: Record<string, boolean>
    }>()

    const PREVIEW_PROGRESS_PLAN_ID = 'preview-progress-plan'
    const previewPlanWorkouts: WorkoutLike[] = [
        {
            id: 'preview-progress-entry-1',
            planId: PREVIEW_PROGRESS_PLAN_ID,
            exercise: 'Bankdruecken',
            date: '2026-03-14T18:00:00',
            type: 'kraft',
            sets: 3,
            reps: 8,
            weight: 80,
            setDetails: [
                { reps: 8, weight: 80, label: 'Aufwaermen' },
                { reps: 8, weight: 82.5, label: 'Arbeitssatz 1' },
                { reps: 7, weight: 82.5, label: 'Arbeitssatz 2' },
            ],
            note: 'Sauberer Demo-Eintrag',
        },
        {
            id: 'preview-progress-entry-2',
            planId: PREVIEW_PROGRESS_PLAN_ID,
            exercise: 'Klimmzuege',
            date: '2026-03-14T18:12:00',
            type: 'calisthenics',
            sets: 3,
            reps: 10,
            weight: 0,
            setDetails: [
                { reps: 10, weight: 0, label: 'Satz 1' },
                { reps: 9, weight: 0, label: 'Satz 2' },
                { reps: 8, weight: 0, label: 'Satz 3' },
            ],
            note: 'Bodyweight Demo',
        },
    ]

    const emit = defineEmits<{
        (e: 'close'): void
        (e: 'add-entry', payload: { planId: string; keepOpen: boolean }): void
        (e: 'download', payload: { planId: string; days: string[]; exercises?: string[]; allExercises?: boolean }): void
        (e: 'edit-day', day: string): void
        (e: 'delete-day', day: string): void
        (e: 'edit-entry', entry: WorkoutLike): void
        (e: 'delete-entries', payload: { planId: string; entries: WorkoutLike[] }): void
        (e: 'delete', payload: { planId: string; entries: WorkoutLike[] }): void
        (e: 'feedback', payload: { day: string }): void
    }>()

    const modalEl = ref<HTMLElement | null>(null)
    const hasFeedbackForDay = (day: string) => !!props.feedbackStatusByDay?.[day]

    const progressStore = useProgressStore()
    const trainingPlansStore = useTrainingPlansStore()
    const auth = useAuthStore()
    const { byPlan } = storeToRefs(progressStore)
    const plannerByDayLocal = ref<Record<string, Array<{ planId: string; planName?: string; color?: string | null }>>>({})
    const restDaysLocal = ref<Record<string, true>>({})
    const completedDaysLocal = ref<Record<string, true>>({})
    const showDayPopup = ref(false)
    const popupDay = ref('')
    const popupPlanId = ref('')
    const popupColor = ref('')

    const toPlannerDayKey = (dateStr?: string | null) => {
        if (!dateStr) return null
        const normalized = dateStr.length === 10 ? `${dateStr}T00:00:00Z` : dateStr
        const d = new Date(normalized)
        if (Number.isNaN(d.getTime())) return null
        const y = d.getUTCFullYear()
        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    }

    const loadPlannerLocal = () => {
        if (typeof window === 'undefined') return
        try {
            const raw = window.localStorage.getItem(LS_TRAINING_PLANNER)
            const parsed = raw ? JSON.parse(raw) : {}
            plannerByDayLocal.value = (parsed && typeof parsed === 'object') ? parsed : {}
        } catch {
            plannerByDayLocal.value = {}
        }

        try {
            const raw = window.localStorage.getItem(LS_TRAINING_REST_DAYS)
            const arr = raw ? JSON.parse(raw) : []
            const next: Record<string, true> = {}
            for (const d of Array.isArray(arr) ? arr : []) next[d] = true
            restDaysLocal.value = next
        } catch {
            restDaysLocal.value = {}
        }

        try {
            const raw = window.localStorage.getItem(LS_TRAINING_PLANNER_COMPLETED)
            const arr = raw ? JSON.parse(raw) : []
            const next: Record<string, true> = {}
            for (const d of Array.isArray(arr) ? arr : []) next[d] = true
            completedDaysLocal.value = next
        } catch {
            completedDaysLocal.value = {}
        }
    }

    const loadPlannerForPlanProgress = async () => {
        try {
            const items = await listTrainingPlanner()
            const next: Record<string, Array<{ planId: string; planName?: string; color?: string | null }>> = {}
            const rests: Record<string, true> = {}
            const completed: Record<string, true> = {}
            for (const item of items ?? []) {
                if (item?.isRestDay) {
                    const restDay = toPlannerDayKey(item.date)
                    if (restDay) rests[restDay] = true
                    continue
                }
                if (!item?.planId) continue
                const day = toPlannerDayKey(item.date)
                if (!day) continue
                const list = next[day] ?? []
                list.push({
                    planId: String(item.planId),
                    planName: item.planName ?? '',
                    color: item.planColor ?? null,
                })
                next[day] = list

                if (item.isCompleted) completed[day] = true
            }
            plannerByDayLocal.value = next
            restDaysLocal.value = rests
            completedDaysLocal.value = completed
            return
        } catch {
            loadPlannerLocal()
        }
    }

    const dayToIsoUtc = (day: string) => `${day}T00:00:00.000Z`

    const getPrimaryPlanForDay = (day: string) => {
        const list = plannerByDayLocal.value[day] ?? []
        return list[0] ?? null
    }

    const savePlannerLocal = (next: Record<string, Array<{ planId: string; planName?: string; color?: string | null }>>) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(LS_TRAINING_PLANNER, JSON.stringify(next))
    }

    const saveRestDaysLocal = (next: Record<string, true>) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(LS_TRAINING_REST_DAYS, JSON.stringify(Object.keys(next)))
    }

    const saveCompletedDaysLocal = (next: Record<string, true>) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(LS_TRAINING_PLANNER_COMPLETED, JSON.stringify(Object.keys(next)))
    }

    const refreshPlannerState = async () => {
        if (isAuthenticated.value) await loadPlannerForPlanProgress()
        else loadPlannerLocal()
    }

    defineExpose({ modalEl, refreshPlannerState })

    const openDayPopup = (day: string) => {
        if (!day) return
        popupDay.value = day
        const list = plannerByDayLocal.value[day] ?? []
        const current = list.find(x => String(x.planId) === String(props.currentPlanId)) ?? list[0] ?? null
        popupPlanId.value = current?.planId ?? props.currentPlanId ?? ''
        const planColor = current?.color ?? trainingPlansStore.items.find((p: { id: string; color?: string | null }) => p.id === popupPlanId.value)?.color ?? ''
        popupColor.value = planColor || ''
        showDayPopup.value = true
    }

    const closeDayPopup = () => {
        showDayPopup.value = false
    }

    const onPopupComplete = async (payload: { day: string; isCompleted: boolean; planId?: string | null }) => {
        const planId = payload.planId ?? props.currentPlanId ?? undefined
        if (isAuthenticated.value) {
            await setTrainingPlannerCompletion(dayToIsoUtc(payload.day), payload.isCompleted, planId)
        } else {
            const next = { ...completedDaysLocal.value }
            if (payload.isCompleted) next[payload.day] = true
            else delete next[payload.day]
            completedDaysLocal.value = next
            saveCompletedDaysLocal(next)
        }

        await refreshPlannerState()
        closeDayPopup()
    }

    const onPopupPlan = async (payload: { day: string; planId: string; color?: string }) => {
        if (isAuthenticated.value) {
            if (payload.color) {
                void setTrainingPlanColor(payload.planId, payload.color)
            }
            await addTrainingPlanner(payload.planId, dayToIsoUtc(payload.day))
        } else {
            const next = { ...plannerByDayLocal.value }
            const list = next[payload.day] ?? []
            if (!list.some(x => String(x.planId) === String(payload.planId))) {
                const planName = trainingPlansStore.items.find((p: { id: string; name: string }) => p.id === payload.planId)?.name ?? ''
                list.push({ planId: payload.planId, planName, color: payload.color ?? null })
                next[payload.day] = list
                savePlannerLocal(next)
            }

            if (restDaysLocal.value[payload.day]) {
                const restNext = { ...restDaysLocal.value }
                delete restNext[payload.day]
                restDaysLocal.value = restNext
                saveRestDaysLocal(restNext)
            }
        }

        await refreshPlannerState()
        closeDayPopup()
    }

    const onPopupUpdate = async (payload: { day: string; planId: string; color?: string }) => {
        const current = getPrimaryPlanForDay(payload.day)
        if (!current) {
            await onPopupPlan(payload)
            return
        }

        if (isAuthenticated.value) {
            if (payload.color) {
                void setTrainingPlanColor(payload.planId, payload.color)
            }
            if (String(current.planId) !== String(payload.planId)) {
                await deleteTrainingPlanner(current.planId, dayToIsoUtc(payload.day))
                await addTrainingPlanner(payload.planId, dayToIsoUtc(payload.day))
            }
        } else {
            const next = { ...plannerByDayLocal.value }
            const list = next[payload.day] ?? []
            const filtered = list.filter(x => String(x.planId) !== String(current.planId))
            const planName = trainingPlansStore.items.find((p: { id: string; name: string }) => p.id === payload.planId)?.name ?? ''
            filtered.push({ planId: payload.planId, planName, color: payload.color ?? null })
            next[payload.day] = filtered
            savePlannerLocal(next)
        }

        await refreshPlannerState()
        closeDayPopup()
    }

    const onPopupRest = async (payload: { day: string; isRest: boolean }) => {
        if (isAuthenticated.value) {
            if (payload.isRest) await addTrainingPlannerRestDay(dayToIsoUtc(payload.day))
            else await deleteTrainingPlannerRestDay(dayToIsoUtc(payload.day))
        } else {
            const next = { ...restDaysLocal.value }
            if (payload.isRest) next[payload.day] = true
            else delete next[payload.day]
            restDaysLocal.value = next
            saveRestDaysLocal(next)

            if (payload.isRest) {
                const plannerNext = { ...plannerByDayLocal.value }
                delete plannerNext[payload.day]
                plannerByDayLocal.value = plannerNext
                savePlannerLocal(plannerNext)
            }
        }

        await refreshPlannerState()
        closeDayPopup()
    }

    const onPopupMove = async (payload: { day: string; toDay: string }) => {
        if (!payload.toDay || payload.day === payload.toDay) return
        if (payload.toDay < todayLocalKey.value) return

        const current = getPrimaryPlanForDay(payload.day)
        if (!current) return

        if (isAuthenticated.value) {
            await deleteTrainingPlanner(current.planId, dayToIsoUtc(payload.day))
            await addTrainingPlanner(current.planId, dayToIsoUtc(payload.toDay))
        } else {
            const next = { ...plannerByDayLocal.value }
            const fromList = (next[payload.day] ?? []).filter(x => String(x.planId) !== String(current.planId))
            if (fromList.length) next[payload.day] = fromList
            else delete next[payload.day]

            const toList = next[payload.toDay] ?? []
            if (!toList.some(x => String(x.planId) === String(current.planId))) {
                toList.push(current)
                next[payload.toDay] = toList
            }

            plannerByDayLocal.value = next
            savePlannerLocal(next)
        }

        await refreshPlannerState()
        closeDayPopup()
    }

    const onPopupClear = async (day: string) => {
        if (isAuthenticated.value) {
            const list = plannerByDayLocal.value[day] ?? []
            for (const item of list) {
                await deleteTrainingPlanner(item.planId, dayToIsoUtc(day))
            }
            if (restDaysLocal.value[day]) {
                await deleteTrainingPlannerRestDay(dayToIsoUtc(day))
            }
        } else {
            const next = { ...plannerByDayLocal.value }
            delete next[day]
            plannerByDayLocal.value = next
            savePlannerLocal(next)

            if (restDaysLocal.value[day]) {
                const restNext = { ...restDaysLocal.value }
                delete restNext[day]
                restDaysLocal.value = restNext
                saveRestDaysLocal(restNext)
            }
        }

        const completedNext = { ...completedDaysLocal.value }
        delete completedNext[day]
        completedDaysLocal.value = completedNext
        saveCompletedDaysLocal(completedNext)

        await refreshPlannerState()
        closeDayPopup()
    }

    const testNoticeVisible = ref(false)
    const setNameEls = new Map<string, HTMLElement>()
    const overflowingSetNameKeys = ref<Set<string>>(new Set())
    let setNameMeasureRaf: number | null = null

    const scheduleSetNameMeasure = () => {
        if (typeof window === 'undefined') return
        if (setNameMeasureRaf != null) window.cancelAnimationFrame(setNameMeasureRaf)
        setNameMeasureRaf = window.requestAnimationFrame(() => {
            setNameMeasureRaf = null
            const next = new Set<string>()
            for (const [key, el] of setNameEls.entries()) {
                if (!el.isConnected) continue
                const textEl = el.querySelector('.set-name__text') as HTMLElement | null
                const contentW = Math.ceil(textEl?.scrollWidth ?? el.scrollWidth)
                const boxW = Math.ceil(el.clientWidth)
                const overflowPx = Math.max(0, contentW - boxW)
                if (overflowPx > 2) {
                    next.add(key)
                    el.style.setProperty('--set-name-shift', `${overflowPx}px`)
                    const durationSec = Math.max(3.2, Math.min(8, 2.2 + overflowPx / 16))
                    el.style.setProperty('--set-name-duration', `${durationSec.toFixed(2)}s`)
                } else {
                    el.style.setProperty('--set-name-shift', '0px')
                    el.style.setProperty('--set-name-duration', '0s')
                }
            }
            overflowingSetNameKeys.value = next
        })
    }

    type VueTemplateRefEl = Element | ComponentPublicInstance | null
    const toDomEl = (el: VueTemplateRefEl): Element | null => {
        if (!el) return null
        if (el instanceof Element) return el
        const root = (el as any)?.$el
        return root instanceof Element ? root : null
    }

    const bindSetNameEl = (key: string, el: VueTemplateRefEl) => {
        const domEl = toDomEl(el)
        if (!(domEl instanceof HTMLElement)) {
            setNameEls.delete(key)
            if (overflowingSetNameKeys.value.has(key)) {
                const next = new Set(overflowingSetNameKeys.value)
                next.delete(key)
                overflowingSetNameKeys.value = next
            }
            return
        }
        setNameEls.set(key, domEl)
        scheduleSetNameMeasure()
    }

    const isSetNameOverflowing = (key: string) => overflowingSetNameKeys.value.has(key)

    const onSpaceToggle = (e: KeyboardEvent) => {
        if (e.code !== 'Space') return
        e.preventDefault()
        testNoticeVisible.value = !testNoticeVisible.value
    }

    const onWindowResizeMeasureSetNames = () => scheduleSetNameMeasure()

    watch(
        () => props.show,
        (open) => {
            if (open) {
                window.addEventListener('keydown', onSpaceToggle)
                window.addEventListener('resize', onWindowResizeMeasureSetNames)
                void loadPlannerForPlanProgress()
                nextTick(() => scheduleSetNameMeasure())
            } else {
                window.removeEventListener('keydown', onSpaceToggle)
                window.removeEventListener('resize', onWindowResizeMeasureSetNames)
                testNoticeVisible.value = false
            }
        },
        { immediate: true }
    )

    watch(
        () => props.currentPlanId,
        () => {
            if (!props.show) return
            void loadPlannerForPlanProgress()
        }
    )

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', onSpaceToggle)
        window.removeEventListener('resize', onWindowResizeMeasureSetNames)
        if (setNameMeasureRaf != null && typeof window !== 'undefined') {
            window.cancelAnimationFrame(setNameMeasureRaf)
            setNameMeasureRaf = null
        }
    })

    const apiWorkouts = computed<WorkoutLike[]>(() => {
        const planId = props.currentPlanId
        if (!planId) return []
        if (planId === PREVIEW_PROGRESS_PLAN_ID) return previewPlanWorkouts

        const state =
            (byPlan.value instanceof Map)
                ? byPlan.value.get(planId)
                : (byPlan.value as any)?.[planId]

        const rows: ProgressEntry[] = (state as any)?.items ?? []

        const mapType = (t: any): WorkoutLike["type"] => {
            const s = String(t ?? "").toLowerCase().trim()

            // backend enums
            if (s === "strength" || s === "kraft") return "kraft"
            if (s === "cardio" || s === "ausdauer") return "ausdauer"
            if (s === "stretch" || s === "dehnung") return "dehnung"
            if (s === "calisthenics") return "calisthenics"

            // falls dein backend schon "kraft/ausdauer/dehnung" zurückgibt
            if (s === "kraft" || s === "calisthenics") return s as any
            if (s === "ausdauer") return "ausdauer"
            if (s === "dehnung") return "dehnung"

            return "kraft"
        }

        return rows.map((x: any) => ({
            id: x.id,
            planId: x.planId,
            exercise: x.exercise,
            date: (x.date?.length === 10) ? `${x.date}T00:00:00` : x.date,
            type: mapType(x.type),

            // core
            sets: x.sets ?? null,
            reps: x.reps ?? null,
            weight: (x.weightKg ?? x.weight ?? null),

            // IMPORTANT: nimm setDetails vom API, sonst sind “Details” immer leer
            setDetails: (Array.isArray(x.setDetails) ? x.setDetails : null),

            // cardio
            durationMin: x.durationMin ?? null,
            distanceKm: x.distanceKm ?? null,
            avgHr: x.avgHr ?? null,
            calories: x.calories ?? null,
            pace: x.pace ?? null,
            hrZone: x.hrZone ?? null,
            borg: x.borg ?? null,

            // kraft extras
            tempo: x.tempo ?? null,
            restSeconds: x.restSeconds ?? null,
            isDropset: x.isDropset ?? null,
            dropsets: (Array.isArray(x.dropsets) ? x.dropsets : null),

            // stretch extras
            painFree: x.painFree ?? null,
            equipment: x.equipment ?? null,
            equipmentCustom: x.equipmentCustom ?? null,
            side: x.side ?? null,

            note: x.note ?? null,
        }))
    })

    const personalRecordByExercise = computed(() => {
        const map = new Map<string, ReturnType<typeof computeExercisePersonalRecords>[number]>()
        for (const record of computeExercisePersonalRecords(apiWorkouts.value)) {
            map.set(record.exerciseKey, record)
        }
        return map
    })

    const strengthGroupPrMetrics = (group: StrengthGroup) => {
        const exerciseKey = personalRecordExerciseKey(group.entry.exercise)
        if (!exerciseKey) return [] as Array<'weight' | 'reps' | 'volume' | 'oneRm'>

        const record = personalRecordByExercise.value.get(exerciseKey)
        if (!record) return [] as Array<'weight' | 'reps' | 'volume' | 'oneRm'>

        const achieved = new Set<'weight' | 'reps' | 'volume' | 'oneRm'>()

        for (const entry of group.entries) {
            const metrics = getEntryPersonalRecordMetrics(entry)
            for (const metric of ['weight', 'reps', 'volume', 'oneRm'] as const) {
                const stat = record.metrics[metric]
                const value = metrics[metric]
                if (!stat || value == null) continue
                if (Math.abs(value - stat.value) > 0.0001) continue
                if (String(entry.date ?? '') !== String(stat.date ?? '')) continue
                achieved.add(metric)
            }
        }

        return [...achieved]
    }

    const dayPersonalRecordCount = (day: string) =>
        strengthGroupsForDay(day).reduce((sum, group) => sum + strengthGroupPrMetrics(group).length, 0)

    const dayPersonalRecordDetails = (day: string) => {
        const details: Array<{
            exercise: string
            metric: 'weight' | 'reps' | 'volume' | 'oneRm'
            metricLabel: string
            valueLabel: string
        }> = []

        for (const group of strengthGroupsForDay(day)) {
            const exerciseKey = personalRecordExerciseKey(group.entry.exercise)
            if (!exerciseKey) continue

            const record = personalRecordByExercise.value.get(exerciseKey)
            if (!record) continue

            for (const metric of strengthGroupPrMetrics(group)) {
                const stat = record.metrics[metric]
                if (!stat) continue

                details.push({
                    exercise: group.entry.exercise,
                    metric,
                    metricLabel: personalRecordMetricLabel(metric),
                    valueLabel: personalRecordMetricValueLabel(metric, stat.value),
                })
            }
        }

        return details
    }

    const strengthEntryStats = (it: WorkoutLike) => {
        const hasDetails = Array.isArray(it.setDetails) && it.setDetails.length > 0
        const detailsMatchSets = hasDetails && (it.sets == null || it.sets === it.setDetails!.length)

        let sets = 0
        let volume = 0

        if (detailsMatchSets) {
            sets = it.setDetails!.length
            for (const s of it.setDetails!) {
                if (typeof s.reps === 'number' && typeof s.weight === 'number') {
                    volume += s.reps * s.weight
                }
            }
            return { sets, volume }
        }

        const fallbackSets = (typeof it.sets === 'number')
            ? it.sets
            : ((typeof it.reps === 'number' || typeof it.weight === 'number') ? 1 : 0)

        sets = fallbackSets
        if (typeof it.reps === 'number' && typeof it.weight === 'number') {
            volume = it.reps * it.weight * (fallbackSets || 1)
        }

        return { sets, volume }
    }

    const lastEntrySummary = computed(() => {
        if (!apiWorkouts.value.length) return null

        const sorted = [...apiWorkouts.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        const last = sorted[0]
        if (!last?.date) return null

        const dayKey = (last.date || '').slice(0, 10)
        const sameDay = apiWorkouts.value.filter(w => (w.date || '').slice(0, 10) === dayKey)

        let volume = 0
        let strengthSets = 0
        let cardioMin = 0
        let cardioKm = 0

        for (const it of sameDay) {
            if (it.type === 'kraft' || it.type === 'calisthenics') {
                const s = strengthEntryStats(it)
                strengthSets += s.sets
                volume += s.volume
            }

            if (typeof it.durationMin === 'number') cardioMin += it.durationMin
            if (typeof it.distanceKm === 'number') cardioKm += it.distanceKm
        }

        const parts = [
            props.formatDayLong(dayKey),
            `${sameDay.length} Einträge`,
        ]

        if (strengthSets > 0) parts.push(`${strengthSets} Sätze`)
        if (volume > 0) parts.push(`${Math.round(volume)} kg`)
        if (cardioMin > 0) parts.push(`${Math.round(cardioMin)} min`)
        if (cardioKm > 0) parts.push(`${cardioKm.toFixed(1)} km`)

        return parts.join(' · ')
    })

    const planLastSummary = computed(() => lastEntrySummary.value)
    const visibleDays = ref(7)
    const expandedDays = ref<Set<string>>(new Set())
    const expandedPrDays = ref<Set<string>>(new Set())

    const menuDay = ref<string | null>(null)
    const menuAnchorEl = ref<HTMLElement | null>(null)

    const menuItems = computed<KebabMenuItem[]>(() => ([
        { id: 'download', label: 'Herunterladen', icon: '⬇️', hint: 'Auswahl' },
        { id: 'edit', label: 'Bearbeiten', icon: '✏️', hint: 'Auswahl' },
        { id: 'delete', label: 'Löschen', icon: '🗑️', hint: 'Auswahl', danger: true },
    ]))

    type EntryPickAction = 'edit' | 'delete'

    const showEntryPickPopup = ref(false)
    const entryPickAction = ref<EntryPickAction>('edit')
    const entryPickAll = ref(false)
    const entryPickSelected = ref<string[]>([])
    const entryPickRows = ref<ActionSelectRow[]>([])
    const entryPickDay = ref<string | null>(null)

    const collapsedSections = ref<Set<string>>(new Set())

    const sectionKey = (day: string, section: 'strength' | 'cardio' | 'stretch') =>
        `${day}||${section}`

    const isSectionCollapsed = (day: string, section: 'strength' | 'cardio' | 'stretch') =>
        collapsedSections.value.has(sectionKey(day, section))

    const toggleSection = (day: string, section: 'strength' | 'cardio' | 'stretch') => {
        const next = new Set(collapsedSections.value)
        const k = sectionKey(day, section)
        next.has(k) ? next.delete(k) : next.add(k)
        collapsedSections.value = next
    }

    // lookup: rowId -> alle echten entries + editEntry (latest)
    const entryPickMap = ref(new Map<string, { entries: WorkoutLike[]; editEntry: WorkoutLike; label: string; value: string }>())

    // Delete confirm: wir löschen entries (nicht Tage)
    const pendingDeleteEntries = ref<WorkoutLike[]>([])


    type DayPickAction = 'edit' | 'delete'

    const showDayPickPopup = ref(false)
    const dayPickAction = ref<DayPickAction>('edit')
    const dayPickAll = ref(false)
    const dayPickSelected = ref<string[]>([])
    const dayPickRows = ref<ActionSelectRow[]>([])
    const dayPickInitialDay = ref<string | null>(null)

    const showDownloadPickPopup = ref(false)
    const downloadPickAll = ref(false)
    const downloadPickSelected = ref<string[]>([])
    const downloadPickRows = ref<ActionSelectRow[]>([])
    const downloadPickDay = ref<string | null>(null)

    const expandedEntryKeys = ref<Set<string>>(new Set())

    const entryKey = (e: WorkoutLike, index: number) =>
        `${(e.date || '').slice(0, 19)}|${e.exercise}|${e.type ?? 'kraft'}|${index}`

    const toggleGroupSets = (key: string) => {
        const next = new Set(expandedEntryKeys.value)
        next.has(key) ? next.delete(key) : next.add(key)
        expandedEntryKeys.value = next
        nextTick(() => scheduleSetNameMeasure())
    }

    const toggleEntrySets = (e: WorkoutLike, index: number) => {
        const k = entryKey(e, index)
        const next = new Set(expandedEntryKeys.value)
        next.has(k) ? next.delete(k) : next.add(k)
        expandedEntryKeys.value = next
        nextTick(() => scheduleSetNameMeasure())
    }

    const setStats = (e: WorkoutLike) => {
        const details = e.setDetails ?? []
        const reps = details.map(s => s.reps).filter((x): x is number => typeof x === 'number')
        const weights = details.map(s => s.weight).filter((x): x is number => typeof x === 'number')

        const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null

        const repsAvgRaw = avg(reps)
        const weightAvgRaw = avg(weights)

        const repsMin = reps.length ? Math.min(...reps) : null
        const repsMax = reps.length ? Math.max(...reps) : null
        const weightMin = weights.length ? Math.min(...weights) : null
        const weightMax = weights.length ? Math.max(...weights) : null

        // Anzeige: Wdh = ganze Zahl, Gewicht = 1 Dezimal nur wenn nötig
        const repsAvg = (typeof repsAvgRaw === 'number') ? Math.round(repsAvgRaw) : null
        const weightAvg = (typeof weightAvgRaw === 'number')
            ? (Number.isInteger(weightAvgRaw) ? String(weightAvgRaw) : weightAvgRaw.toFixed(1))
            : null

        return {
            sets: details.length,

            // avg (für Chips)
            repsAvg,
            weightAvg,

            // min/max (falls du's später nochmal brauchst)
            repsMin,
            repsMax,
            weightMin,
            weightMax,
        }
    }

    const viewMode = ref<'list' | 'calendar' | 'stats'>('list')

    // ===== Swipe (List <-> Calendar) =====
    const swipe = ref({
        active: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        decided: false,
        horizontal: false,
    })

    const SWIPE_MIN_X = 55          // wie weit muss man wischen
    const SWIPE_MAX_Y = 45          // wenn zu viel vertikal -> ist scroll, kein swipe
    const SWIPE_DECIDE_AT = 12      // ab wann wir entscheiden "horizontal vs vertical"

    const onSwipeStart = (ev: TouchEvent) => {
        // Bei leerem Plan nur in Calendar/Stats wischen lassen
        if (!dayCards.value.length && viewMode.value === 'list') return

        const t = ev.touches?.[0]
        if (!t) return

        swipe.value.active = true
        swipe.value.decided = false
        swipe.value.horizontal = false

        swipe.value.startX = t.clientX
        swipe.value.startY = t.clientY
        swipe.value.lastX = t.clientX
        swipe.value.lastY = t.clientY
    }

    const onSwipeMove = (ev: TouchEvent) => {
        if (!swipe.value.active) return
        const t = ev.touches?.[0]
        if (!t) return

        swipe.value.lastX = t.clientX
        swipe.value.lastY = t.clientY

        if (!swipe.value.decided) {
            const dx = Math.abs(swipe.value.lastX - swipe.value.startX)
            const dy = Math.abs(swipe.value.lastY - swipe.value.startY)
            if (dx < SWIPE_DECIDE_AT && dy < SWIPE_DECIDE_AT) return

            swipe.value.decided = true
            swipe.value.horizontal = dx > dy
        }
    }

    const onSwipeEnd = () => {
        if (!swipe.value.active) return
        swipe.value.active = false

        if (!swipe.value.horizontal) return

        const dx = swipe.value.lastX - swipe.value.startX
        const dy = Math.abs(swipe.value.lastY - swipe.value.startY)

        // zu viel vertical => war einfach scroll
        if (dy > SWIPE_MAX_Y) return

        if (Math.abs(dx) < SWIPE_MIN_X) return

        // dx < 0 => swipe left, dx > 0 => swipe right
        if (dx < 0 && viewMode.value === 'list') {
            viewMode.value = 'calendar'
            return
        }

        if (dx < 0 && viewMode.value === 'calendar') {
            viewMode.value = 'stats'
            return
        }

        if (dx > 0 && viewMode.value === 'stats') {
            viewMode.value = 'calendar'
            return
        }

        if (dx > 0 && viewMode.value === 'calendar') {
            viewMode.value = 'list'
            return
        }
    }

    const onSwipeCancel = () => {
        swipe.value.active = false
    }

    const selectedDay = ref<string | null>(null)

    watch(
        () => [viewMode.value, selectedDay.value, expandedDays.value.size, expandedEntryKeys.value.size] as const,
        () => nextTick(() => scheduleSetNameMeasure()),
        { flush: 'post' }
    )

    const selectedDayCard = computed<DayCard | null>(() => {
        const day = selectedDay.value
        if (!day) return null

        const items = entriesByDay.value.get(day) ?? []
        const uniqueExercises = new Set(items.map(i => i.exercise)).size
        return { day, uniqueExercises }
    })

    const displayDayCards = computed<DayCard[]>(() => {
        if (selectedDayCard.value) return [selectedDayCard.value]
        return visibleDayCards.value
    })

    const hasEntriesForSelectedDay = computed(() => {
        const day = selectedDay.value
        if (!day) return true
        return (entriesByDay.value.get(day)?.length ?? 0) > 0
    })

    const jumpToDay = async (day: string) => {
        viewMode.value = 'list'
        selectedDay.value = day

        // Nur diesen Tag offen lassen
        expandedDays.value = new Set([day])
        expandedPrDays.value = new Set()
        expandedEntryKeys.value = new Set()

        collapsedSections.value = new Set()

        await nextTick()
    }

    let calendarClickTimeout: number | null = null

    const onCalendarSelect = (day: string) => {
        if (calendarClickTimeout != null) {
            window.clearTimeout(calendarClickTimeout)
            calendarClickTimeout = null
        }
        calendarClickTimeout = window.setTimeout(() => {
            calendarClickTimeout = null
            void jumpToDay(day)
        }, 220)
    }

    const onCalendarDblClick = (day: string) => {
        if (calendarClickTimeout != null) {
            window.clearTimeout(calendarClickTimeout)
            calendarClickTimeout = null
        }
        openDayPopup(day)
    }

    const clearSelectedDay = () => {
        selectedDay.value = null
        collapsedSections.value = new Set()
        expandedDays.value = new Set()
        expandedPrDays.value = new Set()
        expandedEntryKeys.value = new Set()
        visibleDays.value = 7
    }

    type ExtraItem = { label: string; value: string }

    const extrasForEntry = (e: WorkoutLike): ExtraItem[] => {
        const t = (e.type ?? 'kraft')

        // Kraft / Calisthenics extras
        if (t === 'kraft' || t === 'calisthenics') {
            const items: ExtraItem[] = []
            if (e.tempo) items.push({ label: 'Tempo', value: String(e.tempo) })
            if (e.restSeconds != null) items.push({ label: 'Pause', value: `${e.restSeconds}s` })

            const hasDrops = Boolean(e.isDropset || (e.dropsets?.length ?? 0) > 0)
            if (hasDrops) {
                const n = (e.dropsets?.length ?? 0)
                items.push({ label: 'Dropset', value: n ? `${n}×` : 'Ja' })
            }
            return items
        }

        // Cardio extras
        if (t === 'ausdauer') {
            const items: ExtraItem[] = []
            if (e.hrZone != null) items.push({ label: 'Zone', value: `${e.hrZone}` })
            if (e.borg != null) items.push({ label: 'Borg', value: `${e.borg}` })
            return items
        }

        // Dehnung extras
        if (t === 'dehnung') {
            const items: ExtraItem[] = []
            if (e.painFree != null) items.push({ label: 'Schmerzfrei', value: `${e.painFree}/10` })
            if (e.equipmentCustom) items.push({ label: 'Hilfsmittel', value: String(e.equipmentCustom) })
            else if (e.equipment) items.push({ label: 'Hilfsmittel', value: String(e.equipment) })
            return items
        }

        return []
    }

    const extrasPreview = (e: WorkoutLike) => extrasForEntry(e).slice(0, 2)

    const hasDetails = (e: WorkoutLike) =>
        Boolean(
            (e.setDetails?.length ?? 0) > 0 ||
            extrasForEntry(e).length > 0 ||
            e.durationMin != null ||
            e.sets != null ||
            e.reps != null ||
            e.distanceKm != null ||
            e.avgHr != null ||
            e.calories != null ||
            e.pace != null ||
            e.hrZone != null ||
            e.borg != null
        )

    const rowIndexes = (e: WorkoutLike) => {
        const n = typeof e.sets === 'number' && e.sets > 0 ? e.sets : 0
        if (n > 0) return Array.from({ length: n }, (_, i) => i + 1)
        // fallback: show 1 row if we have any time/reps worth showing
        if ((e.durationMin != null && e.durationMin !== 0) || (e.reps != null && e.reps !== 0)) return [1]
        return []
    }

    const repsText = (e: WorkoutLike) =>
        (e.reps != null && e.reps !== 0) ? `${e.reps} Wdh` : ''

    const durationText = (e: WorkoutLike) =>
        (e.durationMin != null && e.durationMin !== 0) ? `${e.durationMin} Min` : ''

    const stretchTitle = (e: WorkoutLike) => {
        const side = (e.side ?? '').toString().trim().toLowerCase()
        if (!side) return e.exercise

        // akzeptiert: "rechts", "right", "r", "r.", "links", "left", "l", "l."
        const isRight = ['rechts', 'right', 'r', 'r.'].includes(side)
        const isLeft = ['links', 'left', 'l', 'l.'].includes(side)

        if (isRight) return `${e.exercise} (R)`
        if (isLeft) return `${e.exercise} (L)`

        // fallback: wenn jemand "beidseitig" oder irgendwas custom reinschreibt
        return e.exercise
    }
    const stretchDurationsSec = (e: WorkoutLike) => {
        const arr = e.setDetails ?? []
        return arr
            .map(s => s.durationSec)
            .filter((x): x is number => typeof x === 'number' && x > 0)
    }

    const formatAvgSec = (sec: number) => {
        if (!sec || sec <= 0) return ''
        const rounded = Math.round(sec)

        if (rounded < 60) return `${rounded}s`

        const m = Math.floor(rounded / 60)
        const s = rounded % 60
        return `${m}:${String(s).padStart(2, '0')}`
    }

    const stretchSummaryDuration = (e: WorkoutLike) => {
        const times = stretchDurationsSec(e)
        if (!times.length) return ''

        const avg = times.reduce((a, b) => a + b, 0) / times.length
        return formatAvgSec(avg)
    }

    // ADD: Dehnung optional reps pro Satz
    const stretchRepsText = (e: WorkoutLike, idx: number) => {
        const r = e.setDetails?.[idx - 1]?.reps
        return (typeof r === 'number' && r > 0) ? `${r} Wdh` : ''
    }

    const stretchSetLabel = (e: WorkoutLike, idx: number) =>
        (e.setDetails?.[idx - 1] as any)?.label ?? null

    const setLabelText = (label?: string | null) => {
        const txt = String(label ?? '').trim()
        return txt || ''
    }

    const stretchDurationText = (e: WorkoutLike, idx: number) => {
        const sec = e.setDetails?.[idx - 1]?.durationSec
        if (typeof sec === 'number' && sec > 0) return `${sec} sek.`
        return ''
    }

    type AbbrItem = { key: string; label: string }

    const abbrItemsForEntry = (e: WorkoutLike): AbbrItem[] => {
        const items: AbbrItem[] = []

        // (R)/(L) nur wenn Dehnung + side wirklich gesetzt
        const side = (e.side ?? '').toString().trim().toLowerCase()
        const hasR = ['rechts', 'right', 'r', 'r.'].includes(side)
        const hasL = ['links', 'left', 'l', 'l.'].includes(side)
        if (hasR) items.push({ key: 'R', label: 'Rechts' })
        if (hasL) items.push({ key: 'L', label: 'Links' })

        // Wdh.: wenn irgendwo Wiederholungen genutzt werden
        const usesReps =
            (typeof e.reps === 'number' && e.reps > 0) ||
            (e.setDetails?.some(s => typeof s.reps === 'number' && s.reps > 0) ?? false)

        if (usesReps) items.push({ key: 'Wdh.', label: 'Wiederholungen' })

        // S: Sätze (wenn Sets genutzt werden)
        const usesSets =
            (e.setDetails?.length ?? 0) > 0 ||
            (typeof e.sets === 'number' && e.sets > 0)

        if (usesSets) items.push({ key: 'S', label: 'Sätze' })

        // sek.: Sekunden (Dehnung pro Satz über durationSec)
        const usesSeconds =
            (e.setDetails?.some(s => typeof s.durationSec === 'number' && s.durationSec > 0) ?? false)

        if (usesSeconds) items.push({ key: 'sek.', label: 'Sekunden' })

        // Min: Minuten (Cardio)
        const usesMinutes = (typeof e.durationMin === 'number' && e.durationMin > 0)
        if (usesMinutes) items.push({ key: 'Min', label: 'Minuten' })

        // Kg: Gewicht (Kraft)
        const usesKg =
            (typeof e.weight === 'number' && e.weight > 0) ||
            (e.setDetails?.some(s => typeof s.weight === 'number' && s.weight > 0) ?? false) ||
            (e.dropsets?.some(s => typeof s.weight === 'number' && s.weight > 0) ?? false)

        if (usesKg) items.push({ key: 'kg', label: 'Kilogramm' })

        // km: Distanz (Cardio)
        const usesKm = (typeof e.distanceKm === 'number' && e.distanceKm > 0)
        if (usesKm) items.push({ key: 'km', label: 'Kilometer' })

        return items
    }

    const makeExerciseRowId = (e: WorkoutLike) => {
        const t = (e.type ?? 'kraft') || 'kraft'
        const side = (e.side ?? '').toString().trim().toLowerCase()
        // stabil: typ|exercise|side  (side nur relevant bei cardio/dehnung)
        return `${t}|${e.exercise}|${side}`
    }

    const typeLabel = (t: WorkoutLike['type']) =>
        t === 'calisthenics' ? 'Calisthenics'
            : t === 'ausdauer' ? 'Cardio'
                : t === 'dehnung' ? 'Dehnung'
                    : 'Kraft'

    const buildEntryPickRowsForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        const map = new Map<string, WorkoutLike[]>()

        for (const e of items) {
            const id = makeExerciseRowId(e) // typ|exercise|side
            if (!map.has(id)) map.set(id, [])
            map.get(id)!.push(e)
        }

        const lookup = new Map<string, { entries: WorkoutLike[]; editEntry: WorkoutLike; label: string; value: string }>()
        const rows: ActionSelectRow[] = []

        for (const [id, arr] of map.entries()) {
            const sorted = [...arr].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
            const last = sorted[sorted.length - 1]

            const label =
                (last.type === 'dehnung')
                    ? stretchTitle(last)
                    : (last.type === 'ausdauer')
                        ? (() => {
                            const side = (last.side ?? '').toString().trim().toLowerCase()
                            const sideTag =
                                ['rechts', 'right', 'r', 'r.'].includes(side) ? ' (R)'
                                    : ['links', 'left', 'l', 'l.'].includes(side) ? ' (L)'
                                        : ''
                            return `${last.exercise}${sideTag}`
                        })()
                        : last.exercise

            const value = typeLabel(last.type ?? 'kraft')

            lookup.set(id, { entries: sorted, editEntry: last, label, value })
            rows.push({ id, label, value })
        }

        // stabil sort: nach “latest” entry desc
        rows.sort((a, b) => {
            const ea = lookup.get(a.id)?.editEntry?.date || ''
            const eb = lookup.get(b.id)?.editEntry?.date || ''
            return eb.localeCompare(ea)
        })

        entryPickMap.value = lookup
        entryPickRows.value = rows
    }

    const openEntryPickPopup = (action: EntryPickAction, day: string) => {
        entryPickAction.value = action
        entryPickDay.value = day
        buildEntryPickRowsForDay(day)

        entryPickAll.value = false
        entryPickSelected.value = action === 'edit' ? [] : []
        showEntryPickPopup.value = true
    }

    const closeEntryPickPopup = () => {
        showEntryPickPopup.value = false
        entryPickAll.value = false
        entryPickSelected.value = []
        entryPickRows.value = []
        entryPickDay.value = null
        entryPickMap.value = new Map()
    }

    const normalizeSelectPayload = (payload: any): { all: boolean; ids: string[] } => {
        const all = Boolean(payload?.all ?? payload?.allSelected ?? payload?.isAll ?? false)
        const ids = (payload?.ids ?? payload?.selectedIds ?? payload?.selected ?? []) as string[]
        return { all, ids: Array.isArray(ids) ? ids : [] }
    }

    const onEntryPickConfirm = (payload: any) => {
        const planId = props.currentPlanId
        const day = entryPickDay.value
        if (!planId || !day) return

        const norm = normalizeSelectPayload(payload)
        const ids = norm.all ? [...entryPickMap.value.keys()] : norm.ids

        if (entryPickAction.value === 'edit') {
            const id = ids[0]
            if (!id) return
            const hit = entryPickMap.value.get(id)
            if (!hit) return
            closeEntryPickPopup()
            emit('edit-entry', hit.editEntry)
            return
        }

        // delete
        if (!ids.length) return

        const entries = ids.flatMap(id => entryPickMap.value.get(id)?.entries ?? [])
        if (!entries.length) return

        pendingDeleteEntries.value = entries
        closeEntryPickPopup()
        showDeletePopup.value = true
    }


    const buildDownloadPickRowsForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        if (!items.length) {
            downloadPickRows.value = []
            return
        }

        // wir bauen “einmal pro Übung/Typ/Side”
        const map = new Map<string, { label: string; value: string }>()

        const pushRow = (e: WorkoutLike, label: string, value: string) => {
            const id = makeExerciseRowId(e)
            if (!map.has(id)) map.set(id, { label, value })
        }

        // Kraft + Calisthenics (nimm deine Groups -> sauber & deduped)
        for (const g of strengthGroupsForDay(day)) {
            const t = (g.entry.type ?? 'kraft') === 'calisthenics' ? 'Calisthenics' : 'Kraft'
            pushRow(g.entry, g.entry.exercise, t)
        }

        // Cardio (Groups berücksichtigen Side)
        for (const g of cardioGroupsForDay(day)) {
            const side = (g.entry.side ?? '').toString().trim().toLowerCase()
            const sideTag =
                ['rechts', 'right', 'r', 'r.'].includes(side) ? ' (R)'
                    : ['links', 'left', 'l', 'l.'].includes(side) ? ' (L)'
                        : ''
            pushRow(g.entry, `${g.entry.exercise}${sideTag}`, 'Cardio')
        }

        // Dehnung (jede Entry ist eigen, aber wir dedupen per key)
        for (const e of stretchForDay(day)) {
            // stretchTitle hängt Side dran -> nice fürs Label
            pushRow(e, stretchTitle(e), 'Dehnung')
        }

        downloadPickRows.value = [...map.entries()].map(([id, v]) => ({
            id,
            label: v.label,
            value: v.value,
        }))
    }

    const openDownloadPickPopup = (initialDay: string) => {
        downloadPickDay.value = initialDay
        buildDownloadPickRowsForDay(initialDay)

        downloadPickAll.value = true
        downloadPickSelected.value = []
        showDownloadPickPopup.value = true
    }

    const closeDownloadPickPopup = () => {
        showDownloadPickPopup.value = false
        downloadPickAll.value = false
        downloadPickSelected.value = []
        downloadPickRows.value = []
        downloadPickDay.value = null
    }

    const onDownloadPickConfirm = (payload: any) => {
        const planId = props.currentPlanId
        const day = downloadPickDay.value
        if (!planId || !day) return

        const norm = normalizeSelectPayload(payload)
        const allExercises = norm.all
        const pickedExercises = allExercises ? [] : norm.ids

        if (!allExercises && !pickedExercises.length) return

        closeDownloadPickPopup()

        emit('download', {
            planId,
            days: [day],
            allExercises,
            exercises: allExercises ? undefined : pickedExercises,
        })
    }

    const showDeletePopup = ref(false)
    const pendingDeleteDays = ref<string[]>([])

    const cancelDelete = () => {
        showDeletePopup.value = false
        pendingDeleteEntries.value = []
    }

    const confirmDelete = async () => {
        const planId = props.currentPlanId
        if (!planId) { cancelDelete(); return }

        const entries = pendingDeleteEntries.value
        if (!entries.length) { cancelDelete(); return }

        const ids = entries
            .map(e => e.id)
            .filter((x): x is string => typeof x === "string" && x.length > 0)

        emit('delete', { planId, entries })

        cancelDelete()
    }

    const buildDayPickRows = () => {
        dayPickRows.value = dayCards.value.map(c => ({
            id: c.day,
            label: props.formatDayLong(c.day),
            value: `${c.uniqueExercises} Übungen`,
        }))
    }

    const openDayPickPopup = (action: DayPickAction, initialDay: string) => {
        buildDayPickRows()
        dayPickAction.value = action
        dayPickAll.value = false
        dayPickSelected.value = action === 'edit' ? [initialDay] : []
        dayPickInitialDay.value = initialDay
        showDayPickPopup.value = true
    }

    const closeDayPickPopup = () => {
        showDayPickPopup.value = false
        dayPickAll.value = false
        dayPickSelected.value = []
        dayPickRows.value = []
        dayPickInitialDay.value = null
    }

    const normalizePickedDays = (payload: { all: boolean; ids: string[] }) => {
        const allDays = dayCards.value.map(x => x.day)
        if (payload.all) return allDays

        const picked = new Set(payload.ids || [])
        return allDays.filter(d => picked.has(d))
    }

    const onDayPickConfirm = (payload: { all: boolean; ids: string[] }) => {
        const picked = normalizePickedDays(payload)
        if (!picked.length) return

        if (dayPickAction.value === 'edit') {
            emit('edit-day', picked[0])
            closeDayPickPopup()
            return
        }

        // delete: erst bestätigen lassen (dein Popup auto-confirmed wenn setting aus)
        pendingDeleteDays.value = picked
        closeDayPickPopup()
        showDeletePopup.value = true
    }


    function openDayMenu(day: string, ev: MouseEvent) {
        menuDay.value = day
        menuAnchorEl.value = ev.currentTarget as HTMLElement
    }

    function closeDayMenu() {
        menuDay.value = null
        menuAnchorEl.value = null
    }

    function onDayMenuSelect(payload: any) {
        if (!menuDay.value) return

        const id = typeof payload === 'string' ? payload : (payload?.id ?? '')

        if (id === 'download') {
            const d = menuDay.value
            closeDayMenu()
            openDownloadPickPopup(d)
            return
        }

        if (id === 'edit') {
            const d = menuDay.value
            closeDayMenu()
            openEntryPickPopup('edit', d)
            return
        }

        if (id === 'delete') {
            const d = menuDay.value
            closeDayMenu()
            openEntryPickPopup('delete', d)
            return
        }

        closeDayMenu()
    }

    const planEntries = computed(() => {
        const planId = props.currentPlanId
        if (!planId) return []

        const api = apiWorkouts.value
        const local = (props.workouts ?? []).filter(w => w.planId === planId)

        const out: WorkoutLike[] = []
        const seen = new Set<string>()

        const keyOf = (e: WorkoutLike) => {
            if (e.id) return `id:${e.id}`
            const d = (e.date ?? '').slice(0, 19)
            const ex = (e.exercise ?? '').trim()
            const t = (e.type ?? 'kraft') || 'kraft'
            return `k:${d}|${ex}|${t}`
        }

        for (const e of [...api, ...local]) {
            const k = keyOf(e)
            if (seen.has(k)) continue
            seen.add(k)
            out.push(e)
        }

        return out
    })

    const entriesByDay = computed(() => {
        const map = new Map<string, WorkoutLike[]>()
        for (const w of planEntries.value) {
            const day = (w.date || '').slice(0, 10)
            if (!map.has(day)) map.set(day, [])
            map.get(day)!.push(w)
        }
        return new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])))
    })

    const daysWithEntriesArr = computed(() => [...entriesByDay.value.keys()])

    const todayLocalKey = computed(() => {
        const d = new Date()
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
    })

    const isAuthenticated = computed(() => auth.isAuthenticated)

    const popupDayLabel = computed(() => (popupDay.value ? props.formatDayLong(popupDay.value) : ''))
    const popupIsToday = computed(() => popupDay.value === todayLocalKey.value)
    const popupIsFuture = computed(() => !!popupDay.value && popupDay.value > todayLocalKey.value)
    const popupIsPlanned = computed(() => !!popupDay.value && (plannerByDayLocal.value[popupDay.value]?.length ?? 0) > 0)
    const popupIsRest = computed(() => !!popupDay.value && !!restDaysLocal.value[popupDay.value])
    const popupIsCompleted = computed(() => !!popupDay.value && !!completedDaysLocal.value[popupDay.value])
    const popupAllowComplete = computed(() => popupIsToday.value && popupIsPlanned.value && !popupIsRest.value)
    const popupAllowPlan = computed(() => popupIsFuture.value && !popupIsPlanned.value && !popupIsRest.value)
    const popupAllowEdit = computed(() => popupIsPlanned.value && !!popupDay.value && popupDay.value >= todayLocalKey.value)
    const popupAllowRest = computed(() => !!popupDay.value && popupDay.value >= todayLocalKey.value)
    const popupAllowMove = computed(() => popupIsPlanned.value && !!popupDay.value && popupDay.value >= todayLocalKey.value)
    const popupAllowClear = computed(() => popupIsPlanned.value || popupIsRest.value)

    const planOptions = computed(() =>
        (trainingPlansStore.items ?? []).map((p: { id: string; name: string }) => ({
            label: p.name,
            value: p.id,
        }))
    )

    const colorOptions = [
        { label: 'Rot', value: '#ef4444' },
        { label: 'Orange', value: '#f97316' },
        { label: 'Gelb', value: '#eab308' },
        { label: 'Grün', value: '#22c55e' },
        { label: 'Blau', value: '#3b82f6' },
        { label: 'Lila', value: '#8b5cf6' },
        { label: 'Pink', value: '#ec4899' },
        { label: 'Grau', value: '#94a3b8' },
    ]

    const plannedExerciseNamesForCurrentPlan = computed<Set<string>>(() => {
        const planId = props.currentPlanId
        if (!planId) return new Set()
        const dto: any = trainingPlansStore.items.find((p: any) => p.id === planId) ?? null
        const names = new Set<string>()
        const days = Array.isArray(dto?.days) ? dto.days : []
        for (const day of days) {
            for (const ex of (Array.isArray((day as any)?.exercises) ? (day as any).exercises : [])) {
                const n = String((ex as any)?.name ?? '').trim().toLowerCase()
                if (n) names.add(n)
            }
        }
        return names
    })

    const plannedStrengthMetaByExercise = computed<Map<string, PlannedStrengthMeta>>(() => {
        const planId = props.currentPlanId
        const map = new Map<string, PlannedStrengthMeta>()
        if (!planId) return map

        const dto: any = trainingPlansStore.items.find((p: any) => p.id === planId) ?? null
        const days = Array.isArray(dto?.days) ? dto.days : []
        for (const day of days) {
            for (const ex of (Array.isArray((day as any)?.exercises) ? (day as any).exercises : [])) {
                const name = String((ex as any)?.name ?? (ex as any)?.exercise ?? '').trim().toLowerCase()
                if (!name || map.has(name)) continue
                const repsRaw = Number((ex as any)?.reps ?? 0)
                map.set(name, {
                    reps: Number.isFinite(repsRaw) && repsRaw > 0 ? repsRaw : null,
                    goal: String((ex as any)?.goal ?? '').trim() || null,
                    type: String((ex as any)?.type ?? (ex as any)?.category ?? '').trim() || null,
                })
            }
        }
        return map
    })

    const plannedDaysForCurrentPlan = computed<string[]>(() => {
        const planId = props.currentPlanId
        if (!planId) return []
        const out: string[] = []
        for (const [day, items] of Object.entries(plannerByDayLocal.value ?? {})) {
            if (!Array.isArray(items)) continue
            if (items.some((x: any) => String(x?.planId ?? '') === String(planId))) out.push(day)
        }
        return out.sort()
    })

    const plannedColorByDayForCurrentPlan = computed<Record<string, string>>(() => {
        const planId = props.currentPlanId
        if (!planId) return {}
        const out: Record<string, string> = {}
        for (const [day, items] of Object.entries(plannerByDayLocal.value ?? {})) {
            if (!Array.isArray(items)) continue
            const hit = items.find((x: any) => String(x?.planId ?? '') === String(planId))
            const color = String((hit as any)?.color ?? '').trim()
            if (hit && color) out[day] = color
        }
        return out
    })

    const plannedDayCompletionMap = computed<Record<string, boolean>>(() => {
        const required = plannedExerciseNamesForCurrentPlan.value
        const requireCount = required.size
        const out: Record<string, boolean> = {}
        for (const day of plannedDaysForCurrentPlan.value) {
            const items = entriesByDay.value.get(day) ?? []
            if (!items.length) {
                out[day] = false
                continue
            }
            if (requireCount === 0) {
                out[day] = items.length > 0
                continue
            }
            const done = new Set<string>()
            for (const it of items) {
                const ex = String(it.exercise ?? '').trim().toLowerCase()
                if (ex) done.add(ex)
            }
            let complete = true
            for (const ex of required) {
                if (!done.has(ex)) { complete = false; break }
            }
            out[day] = complete
        }
        return out
    })

    const completedPlannedDaysArr = computed<string[]>(() =>
        plannedDaysForCurrentPlan.value.filter(d => plannedDayCompletionMap.value[d] || completedDaysLocal.value[d])
    )

    const missedPlannedPastDaysArr = computed<string[]>(() =>
        plannedDaysForCurrentPlan.value.filter(d =>
            d < todayLocalKey.value &&
            !plannedDayCompletionMap.value[d] &&
            !completedDaysLocal.value[d]
        )
    )

    const calendarMarkedDaysArr = computed<string[]>(() => {
        const set = new Set<string>([...daysWithEntriesArr.value, ...plannedDaysForCurrentPlan.value])
        return [...set]
    })

    const calendarPrDaysArr = computed<string[]>(() =>
        dayCards.value.map(c => c.day).filter(day => dayPersonalRecordCount(day) > 0)
    )

    const calendarDayColors = computed<Record<string, string | string[]>>(() => {
        const out: Record<string, string | string[]> = {}
        const entryDays = new Set(daysWithEntriesArr.value)
        const completedDays = new Set(completedPlannedDaysArr.value)
        const missedPastDays = new Set(missedPlannedPastDaysArr.value)
        for (const d of plannedDaysForCurrentPlan.value) {
            if (missedPastDays.has(d)) {
                out[d] = '#ef4444'
                continue
            }
            const userColor = plannedColorByDayForCurrentPlan.value[d]
            if (userColor) out[d] = userColor
            else if (completedDays.has(d)) out[d] = '#10b981'
            else if (entryDays.has(d)) out[d] = '#22c55e'
            else out[d] = '#f59e0b'
        }
        for (const d of daysWithEntriesArr.value) {
            if (!out[d]) out[d] = '#6366f1' // normaler Fortschrittstag
        }
        return out
    })

    const calendarDayTitles = computed<Record<string, string>>(() => {
        const out: Record<string, string> = {}
        const plannedSet = new Set(plannedDaysForCurrentPlan.value)
        const completedSet = new Set(completedPlannedDaysArr.value)
        const missedPastSet = new Set(missedPlannedPastDaysArr.value)
        const prDays = new Set(calendarPrDaysArr.value)
        for (const d of calendarMarkedDaysArr.value) {
            const parts: string[] = []
            if (plannedSet.has(d)) {
                if (completedSet.has(d)) parts.push('Geplant + vollständig absolviert')
                else if (missedPastSet.has(d)) parts.push('Geplant, nicht vollständig absolviert')
                else parts.push('Geplantes Workout')
            }
            if (daysWithEntriesArr.value.includes(d) && !completedSet.has(d)) parts.push('Fortschritt erfasst')
            if (prDays.has(d)) parts.push(`${dayPersonalRecordCount(d)} PR${dayPersonalRecordCount(d) > 1 ? 's' : ''} erreicht`)
            out[d] = parts.join(' · ') || 'Tag'
        }
        return out
    })

    const plannedCompletionPraise = computed<string | null>(() => {
        const today = todayLocalKey.value
        if (!plannedDayCompletionMap.value[today]) return null
        return `Stark! Geplantes Workout für ${props.formatDayLong(today)} vollständig absolviert. Weiter so!`
    })

    const dayCards = computed<DayCard[]>(() => {
        return [...entriesByDay.value.entries()].map(([day, items]) => {
            const uniqueExercises = new Set(items.map(i => i.exercise)).size
            return { day, uniqueExercises }
        })
    })

    watch(
        () => [props.show, dayCards.value.length, plannedDaysForCurrentPlan.value.length] as const,
        ([open, entryCount, plannedCount]) => {
            if (!open) return
            if (viewMode.value === 'list' && entryCount === 0 && plannedCount > 0) viewMode.value = 'calendar'
        },
        { flush: 'post' }
    )

    const visibleDayCards = computed(() => dayCards.value.slice(0, visibleDays.value))

    function toggleDay(day: string) {
        const next = new Set(expandedDays.value)
        next.has(day) ? next.delete(day) : next.add(day)
        expandedDays.value = next
    }

    function togglePrDay(day: string) {
        const next = new Set(expandedPrDays.value)
        next.has(day) ? next.delete(day) : next.add(day)
        expandedPrDays.value = next
    }

    function onEntryDblClick(entry: WorkoutLike) {
        emit('edit-entry', entry)
    }
    const cardioForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        return items.filter(w => (w.type ?? 'kraft') === 'ausdauer')
    }

    type CardioGroup = {
        key: string
        entry: WorkoutLike          // gemergter Anzeige-Entry (Ø Werte)
        editEntry: WorkoutLike      // letzter echter Entry fürs Edit
        entries: WorkoutLike[]      // alle Sessions (für Details Rows)
        summary: ReturnType<typeof cardioSummary>
    }

    const nAvg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null

    const mergeCardioEntries = (day: string, entries: WorkoutLike[]): WorkoutLike => {
        const sorted = [...entries].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        const last = sorted[sorted.length - 1]

        const durations = sorted
            .map(e => e.durationMin)
            .filter((x): x is number => typeof x === 'number' && x > 0)

        const setsArr = sorted
            .map(e => e.sets)
            .filter((x): x is number => typeof x === 'number' && x > 0)

        const repsArr = sorted
            .map(e => e.reps)
            .filter((x): x is number => typeof x === 'number' && x > 0)

        const distArr = sorted
            .map(e => e.distanceKm)
            .filter((x): x is number => typeof x === 'number' && x > 0)

        const avgHrArr = sorted
            .map(e => e.avgHr)
            .filter((x): x is number => typeof x === 'number' && x > 0)

        const kcalArr = sorted
            .map(e => e.calories)
            .filter((x): x is number => typeof x === 'number' && x > 0)

        const durationMinAvg = nAvg(durations)
        const setsAvg = nAvg(setsArr)
        const repsAvg = nAvg(repsArr)
        const distanceAvg = nAvg(distArr)
        const avgHrAvg = nAvg(avgHrArr)
        const caloriesAvg = nAvg(kcalArr)

        return {
            planId: last.planId ?? null,
            exercise: last.exercise,
            date: `${day}T00:00:00`,
            type: 'ausdauer',
            side: last.side ?? null,

            // Ø Werte für Chips / Extras
            durationMin: durationMinAvg != null ? Math.round(durationMinAvg) : null,
            sets: setsAvg != null ? Math.round(setsAvg) : null,
            reps: repsAvg != null ? Math.round(repsAvg) : null,

            distanceKm: distanceAvg != null ? Number.isInteger(distanceAvg) ? distanceAvg : Number(distanceAvg.toFixed(1)) : null,
            avgHr: avgHrAvg != null ? Math.round(avgHrAvg) : null,
            calories: caloriesAvg != null ? Math.round(caloriesAvg) : null,

            // “latest wins” bei Strings
            pace: last.pace ?? null,
            hrZone: last.hrZone ?? null,
            borg: last.borg ?? null,

            note: last.note ?? null,
        }
    }

    const cardioGroupsForDay = (day: string): CardioGroup[] => {
        const items = entriesByDay.value.get(day) ?? []
        const cardio = items.filter(w => (w.type ?? 'kraft') === 'ausdauer')

        const map = new Map<string, WorkoutLike[]>()

        for (const e of cardio) {
            const side = (e.side ?? '').toString().trim().toLowerCase()
            // KEY: Übung + side (wenn side anders => eigene Card)
            const k = `${e.exercise}||${side}`
            if (!map.has(k)) map.set(k, [])
            map.get(k)!.push(e)
        }

        const groups: CardioGroup[] = []
        for (const [k, arr] of map.entries()) {
            const sorted = [...arr].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
            const last = sorted[sorted.length - 1]

            groups.push({
                key: `${day}|cardio|${k}`,
                entry: mergeCardioEntries(day, sorted),
                editEntry: last,
                entries: sorted,
                summary: cardioSummary(sorted),
            })
        }

        // newest group first
        groups.sort((a, b) => (b.editEntry.date || '').localeCompare(a.editEntry.date || ''))
        return groups
    }

    const cardioDurationText = (e: WorkoutLike) =>
        (e.durationMin != null && e.durationMin !== 0) ? `${e.durationMin} Min` : ''

    const cardioRepsText = (e: WorkoutLike) => {
        const sets = (typeof e.sets === 'number' && e.sets > 0) ? e.sets : null
        const reps = (typeof e.reps === 'number' && e.reps > 0) ? e.reps : null

        if (sets != null && reps != null) return `${sets}×${reps} Int`
        if (sets != null) return `${sets} Int`
        if (reps != null) return `${reps} Wdh`
        return '—'
    }

    const nSum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
    const nAvg2 = (arr: number[]) => arr.length ? (nSum(arr) / arr.length) : null

    const formatPaceMinPerKm = (minPerKm: number) => {
        if (!Number.isFinite(minPerKm) || minPerKm <= 0) return ''
        const totalSec = Math.round(minPerKm * 60)
        const m = Math.floor(totalSec / 60)
        const s = totalSec % 60
        return `${m}:${String(s).padStart(2, '0')}`
    }

    const cardioSummary = (entries: WorkoutLike[]) => {
        const durations = entries.map(e => e.durationMin).filter((x): x is number => typeof x === 'number' && x > 0)
        const dists = entries.map(e => e.distanceKm).filter((x): x is number => typeof x === 'number' && x > 0)

        const hrs = entries.map(e => e.avgHr).filter((x): x is number => typeof x === 'number' && x > 0)
        const kcals = entries.map(e => e.calories).filter((x): x is number => typeof x === 'number' && x > 0)

        const setsArr = entries.map(e => e.sets).filter((x): x is number => typeof x === 'number' && x > 0)
        const repsArr = entries.map(e => e.reps).filter((x): x is number => typeof x === 'number' && x > 0)

        const durationSumRaw = durations.length ? nSum(durations) : 0
        const durationSumMin = durationSumRaw > 0 ? Math.round(durationSumRaw) : 0

        const distSumRaw = dists.length ? nSum(dists) : 0
        const distanceSumKm =
            distSumRaw > 0
                ? (Number.isInteger(distSumRaw) ? distSumRaw : Number(distSumRaw.toFixed(1)))
                : null

        const avgHrAvgRaw = nAvg2(hrs)
        const avgHrAvg = (avgHrAvgRaw != null) ? Math.round(avgHrAvgRaw) : null

        const caloriesSumRaw = kcals.length ? nSum(kcals) : 0
        const caloriesSum = caloriesSumRaw > 0 ? Math.round(caloriesSumRaw) : null

        // total pace nur wenn total duration + total distance vorhanden
        const paceTotal =
            (distanceSumKm != null && distanceSumKm > 0 && durationSumMin > 0)
                ? formatPaceMinPerKm(durationSumMin / distanceSumKm)
                : ''

        // intervals: zeig nur wenn wirklich genutzt (sonst spam)
        const setsAvg = nAvg2(setsArr)
        const repsAvg = nAvg2(repsArr)
        const intervalsText =
            (setsArr.length || repsArr.length)
                ? `${Math.round(setsAvg ?? 0)}${(repsAvg != null && repsAvg > 0) ? `×${Math.round(repsAvg)}` : ''}`
                : ''

        return {
            sessions: entries.length,
            durationSumMin,
            distanceSumKm,
            paceTotal: paceTotal || '',
            avgHrAvg,
            caloriesSum,
            intervalsText: intervalsText || '',
        }
    }

    const abbrItemsForCardio = (entries: WorkoutLike[], e: WorkoutLike): AbbrItem[] => {
        const base = abbrItemsForEntry(e)

        const s = cardioSummary(entries)
        const usesSigma = Boolean(
            (s.durationSumMin ?? 0) > 0 ||
            s.distanceSumKm != null ||
            s.caloriesSum != null
        )

        if (usesSigma) {
            // Erklärung nur dann, wenn Σ wirklich im UI vorkommt
            base.unshift({ key: 'Σ', label: 'Summe (gesamt)' })
        }

        return base
    }


    const cardioSessionMidText = (e: WorkoutLike) => {
        const dist = (typeof e.distanceKm === 'number' && e.distanceKm > 0) ? e.distanceKm : null
        if (dist != null) return `${Number.isInteger(dist) ? dist : dist.toFixed(1)} km`

        const sets = (typeof e.sets === 'number' && e.sets > 0) ? e.sets : null
        const reps = (typeof e.reps === 'number' && e.reps > 0) ? e.reps : null
        if (sets != null && reps != null) return `${sets}×${reps} Int`
        if (sets != null) return `${sets} Int`
        if (reps != null) return `${reps} Wdh`

        return '—'
    }
    const strengthForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        return items.filter(w => {
            const t = (w.type ?? 'kraft')
            return t === 'kraft' || t === 'calisthenics'
        })
    }

    const stretchForDay = (day: string) => {
        const items = entriesByDay.value.get(day) ?? []
        return items.filter(w => (w.type ?? 'kraft') === 'dehnung')
    }

    type StrengthGroup = {
        key: string
        entry: WorkoutLike          // gemergter "Anzeige-Entry"
        editEntry: WorkoutLike      // welches echte Entry beim Doppelklick editiert wird (latest)
        stats: ReturnType<typeof setStats>
        entries: WorkoutLike[]
    }

    const toSetDetails = (e: WorkoutLike) => {
        // Wenn schon setDetails da sind -> nehmen
        if ((e.setDetails?.length ?? 0) > 0) return e.setDetails!

        // Sonst: aus reps/weight Pseudo-Sätze bauen (Anzahl = e.sets, niemals fusionieren)
        const hasAny = (e.reps != null && e.reps !== 0) || (e.weight != null && e.weight !== 0)
        if (!hasAny) return []

        const n = Math.max(1, Math.min(50, Number(e.sets ?? 1) || 1))
        return Array.from({ length: n }, () => ({
            reps: e.reps ?? null,
            weight: e.weight ?? null,
        }))
    }

    const mergeStrengthEntries = (day: string, entries: WorkoutLike[]): WorkoutLike => {
        // Wichtig: Reihenfolge stabil (nach Zeit)
        const sorted = [...entries].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        const last = sorted[sorted.length - 1]

        const mergedSets = sorted.flatMap(toSetDetails)

        // Extras: “latest wins” (sonst wird’s schnell messy)
        return {
            planId: last.planId ?? null,
            exercise: last.exercise,
            date: `${day}T00:00:00`,
            type: last.type ?? 'kraft',
            note: last.note ?? null,

            setDetails: mergedSets.length ? mergedSets : null,

            tempo: last.tempo ?? null,
            restSeconds: last.restSeconds ?? null,
            isDropset: last.isDropset ?? null,
            dropsets: last.dropsets ?? null,

            // falls mal jemand nur single reps/weight nutzt (ohne setDetails), bleibt’s trotzdem ok
            reps: last.reps ?? null,
            weight: last.weight ?? null,
        }
    }

    const strengthGroupsForDay = (day: string): StrengthGroup[] => {
        const items = entriesByDay.value.get(day) ?? []
        const strength = items.filter(w => {
            const t = (w.type ?? 'kraft')
            return t === 'kraft' || t === 'calisthenics'
        })

        const map = new Map<string, WorkoutLike[]>()

        for (const e of strength) {
            const t = (e.type ?? 'kraft')
            // key: Übung + Typ (damit Calisthenics nicht mit Kraft fused)
            const k = `${e.exercise}||${t}`
            if (!map.has(k)) map.set(k, [])
            map.get(k)!.push(e)
        }

        // Return: groups, sort by first occurrence time (oder latest, wie du willst)
        const groups: StrengthGroup[] = []
        for (const [k, arr] of map.entries()) {
            const sorted = [...arr].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
            const last = sorted[sorted.length - 1]

            const merged = mergeStrengthEntries(day, sorted)

            const uiKey = `${day}|${k}` // stabil + unique pro Tag
            groups.push({
                key: uiKey,
                entry: merged,
                editEntry: last,
                stats: setStats(merged),
                entries: sorted,
            })
        }

        // Sort: neueste zuerst (passt zu deinem day sort vibe)
        groups.sort((a, b) => (b.editEntry.date || '').localeCompare(a.editEntry.date || ''))
        return groups
    }

    const strengthSetWeightHintText = (entry: WorkoutLike, setIndex: number): string | null => {
        const details = entry.setDetails ?? []
        const s = details[setIndex]
        if (!s) return null

        const exKey = String(entry.exercise ?? '').trim().toLowerCase()
        const planned = plannedStrengthMetaByExercise.value.get(exKey)
        const setNo = setIndex + 1
        const setTotal = details.length

        const hint = getWeightIncreaseHint({
            goal: planned?.goal ?? null,
            type: entry.type ?? planned?.type ?? 'kraft',
            targetReps: planned?.reps ?? null,
            currentReps: s.reps ?? null,
            currentWeight: s.weight ?? null,
            setNo,
            setTotal,
        })

        return hint.shouldSuggest ? hint.message : null
    }

    let endIO: IntersectionObserver | null = null

    function setupProgressIO() {
        const root = modalEl.value
        if (!root) return
        const endEl = root.querySelector('.scroll-sentinel-end')
        if (!endEl) return
        if (endIO) { endIO.disconnect(); endIO = null }

        endIO = new IntersectionObserver(
            ([entry]) => {
                root.classList.toggle('at-bottom', entry.isIntersecting)
            },
            { root, threshold: 1.0 }
        )
        endIO.observe(endEl)
    }

    function cleanupProgressIO() {
        if (endIO) { endIO.disconnect(); endIO = null }
    }

    watch(
        () => props.show,
        async (open) => {
            document.body.style.overflow = open ? 'hidden' : ''
            if (open) {
                visibleDays.value = 7
                expandedDays.value = new Set()
                expandedPrDays.value = new Set()
                expandedEntryKeys.value = new Set()
                viewMode.value = props.initialView ?? 'list'
                selectedDay.value = null
                collapsedSections.value = new Set()

                const planId = props.currentPlanId
                if (planId) {
                    if (!trainingPlansStore.items?.length) {
                        try { await trainingPlansStore.loadList() } catch { }
                    }
                    const dto: any = trainingPlansStore.items.find((p: any) => p.id === planId)
                    const hasDays = dto && Array.isArray(dto.days) && dto.days.length > 0
                    if (!hasDays) {
                        try { await trainingPlansStore.loadOne(planId) } catch { }
                    }
                    progressStore.load(planId).catch(() => { })
                }

                nextTick(() => setupProgressIO())
            } else {
                cleanupProgressIO()
            }
        }
    )

    // zusätzlich: wenn PlanId wechselt während Popup offen ist
    watch(
        () => [props.show, props.currentPlanId] as const,
        ([open, planId]) => {
            if (open && planId) {
                progressStore.load(planId).catch(() => { })
            }
        }
    )

</script>

<style scoped>
    /* ===== Buttons (Open/Actions) ===== */

    /* REPLACE: .progress-btn base -> match popup surface 1:1 */
    .progress-btn {
        position: relative;
        appearance: none;
        border-radius: 999px;
        height: 2.25rem;
        padding: 0 .95rem;
        cursor: pointer;
        font-weight: 650;
        white-space: nowrap;
        /* === POPUP SURFACE MATCH (LIGHT) === */
        background: linear-gradient( 180deg, color-mix(in srgb, color-mix(in srgb, var(--bg-card) 94%, #020617 6%) 96%, #ffffff 4%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%) );
        border: 1px solid rgba(148, 163, 184, 0.45);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
        color: var(--text-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: .45rem;
        transition: transform 110ms ease, box-shadow 160ms ease, border-color 160ms ease, filter 160ms ease;
    }

        /* haze: NICHT mehr “card haze”, sondern popup-haze (dezenter & gleicher Unterton) */
        .progress-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            background: radial-gradient(circle at 22% 30%, rgba(129, 140, 248, 0.08), transparent 62%), radial-gradient(circle at 78% 72%, rgba(167, 139, 250, 0.06), transparent 60%);
            opacity: .9;
        }

        /* stroke bleibt hochwertig */
        .progress-btn::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10), inset 0 -1px 0 rgba(0, 0, 0, 0.18);
        }

        .progress-btn:hover {
            border-color: rgba(129, 140, 248, 0.42);
            transform: translateY(-1px);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.20);
            filter: brightness(1.02);
        }

        .progress-btn:active {
            transform: translateY(0);
            box-shadow: 0 10px 22px rgba(0, 0, 0, 0.14);
            filter: brightness(0.995);
        }

    /* REPLACE: .progress-btn--primary -> same popup surface, nur accent “tint” drauf */
    .progress-btn--primary {
        border-color: rgba(129, 140, 248, 0.55);
        background: linear-gradient( 180deg, color-mix(in srgb, rgba(99, 102, 241, 0.18) 35%, color-mix(in srgb, var(--bg-card) 94%, #020617 6%) 65%), color-mix(in srgb, rgba(99, 102, 241, 0.12) 25%, color-mix(in srgb, var(--bg-card) 94%, #020617 6%) 75%) );
        color: #f8fafc;
    }

        .progress-btn--primary::before {
            background: radial-gradient(circle at 22% 30%, rgba(129, 140, 248, 0.14), transparent 62%), radial-gradient(circle at 78% 72%, rgba(167, 139, 250, 0.10), transparent 60%);
            opacity: .95;
        }

        .progress-btn--primary:hover {
            border-color: rgba(129, 140, 248, 0.70);
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22), 0 0 18px rgba(129, 140, 248, 0.10);
            filter: brightness(1.03);
        }

    /* === DARKMODE: POPUP ist #020617 -> button muss GENAU darauf aufbauen === */
    html.dark-mode .progress-btn {
        background: linear-gradient(180deg, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.80));
        border-color: rgba(148, 163, 184, 0.50);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.55);
    }

        html.dark-mode .progress-btn::after {
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
        }

    html.dark-mode .progress-btn--primary {
        background: radial-gradient(circle at 22% 30%, rgba(129, 140, 248, 0.18), transparent 62%), radial-gradient(circle at 78% 72%, rgba(167, 139, 250, 0.12), transparent 60%), linear-gradient(180deg, rgba(2, 6, 23, 0.92), rgba(2, 6, 23, 0.78));
        border-color: rgba(129, 140, 248, 0.60);
        color: #f8fafc;
    }


    /* ===== List Item (Empty State) ===== */

    .list-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        padding: .75rem 1rem;
        margin-bottom: .5rem;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 10%, transparent), transparent 60%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 8%, transparent), transparent 62%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.35);
        border-radius: 12px;
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.25);
        transition: background 180ms ease-out, border-color 180ms ease-out, transform 140ms ease-out, box-shadow 200ms ease-out;
    }

    html.dark-mode .list-item {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 11%, transparent), transparent 62%), #020617;
        border-color: rgba(148, 163, 184, 0.5);
    }

    /* ===== Scrollbereich im Popup ===== */

    .modal--progress {
        display: flex;
        flex-direction: column;
        max-height: min(52vh, calc(100vh - 220px));
        min-height: 0;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
    }
    .section-caret,
    .day-pr-summary__caret {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        overflow: hidden;
        opacity: 0.9;
        color: var(--text-primary);
        font-size: 0;
        line-height: 0;
        text-indent: -9999px;
        transition: transform 180ms ease, opacity 160ms ease;
        flex: 0 0 auto;
    }

        .section-caret::before,
        .day-pr-summary__caret::before {
            content: '';
            width: 9px;
            height: 9px;
            border-right: 2px solid currentColor;
            border-bottom: 2px solid currentColor;
            transform: rotate(45deg);
            transition: transform 180ms ease;
        }

        .section-caret.open::before,
        .day-pr-summary__caret.open::before {
            transform: rotate(225deg);
        }

    /* screen-reader only */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    /* Darkmode polish */
    html.dark-mode .modal--progress {
        scrollbar-color: rgba(148, 163, 184, 0.50) transparent;
    }

        html.dark-mode .modal--progress::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.38);
            background-clip: content-box;
        }

            html.dark-mode .modal--progress::-webkit-scrollbar-thumb:hover {
                background: rgba(148, 163, 184, 0.58);
                background-clip: content-box;
            }


    @supports (height: 100dvh) {
        .modal--progress {
            max-height: min(52vh, calc(100dvh - 220px));
        }
    }

    /* ===== Day Cards ===== */

    .day-card-list {
        display: flex;
        flex-direction: column;
        gap: .75rem;
    }


    .day-card {
        position: relative;
        border-radius: 18px;
        padding: .9rem 1rem;
        /* same glass feel as empty-state */
        background: linear-gradient( 180deg, color-mix(in srgb, var(--bg-card) 92%, transparent), color-mix(in srgb, var(--bg-card) 80%, #020617 20%) );
        border: 1px solid rgba(148, 163, 184, 0.28);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.30);
        overflow: hidden;
        isolation: isolate;
        transition: border-color 180ms ease-out, box-shadow 200ms ease-out;
    }

        .day-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 18% 28%, rgba(129, 140, 248, 0.10), transparent 62%);
            opacity: .75;
            pointer-events: none;
            z-index: 0;
        }

        .day-card::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
        }

        .day-card > * {
            position: relative;
            z-index: 1;
        }

        .day-card:hover {
            border-color: rgba(129, 140, 248, 0.42);
            box-shadow: 0 22px 52px rgba(15, 23, 42, 0.38);
        }

            .day-card:hover::before {
                opacity: .95;
            }

    .day-date {
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.01em;
    }

    .day-meta {
        display: flex;
        align-items: center;
        gap: .35rem;
        margin-top: .2rem;
        font-size: .92rem;
        color: var(--text-secondary);
    }


    html.dark-mode .day-card {
        background: linear-gradient(180deg, rgba(2, 6, 23, 0.86), rgba(2, 6, 23, 0.74));
        border-color: rgba(148, 163, 184, 0.36);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.72);
    }

        html.dark-mode .day-card:hover {
            border-color: rgba(129, 140, 248, 0.50);
        }

    .day-card-row {
        display: flex;
        align-items: center;
        gap: .75rem;
        cursor: pointer;
        user-select: none;
        border-radius: 14px; /* damit hover/focus nice clippt */
        padding: .1rem 0; /* minimal “click area” */
    }

        .day-card-row:focus-visible {
            outline: 2px solid rgba(129, 140, 248, 0.55);
            outline-offset: 3px;
        }

    .day-card-main {
        flex: 1;
        min-width: 0;
    }

    .day-card-actions {
        display: flex;
        align-items: center;
        gap: .35rem;
    }

    .day-details {
        margin-top: .5rem;
    }

    .day-details-wrap {
        display: grid;
        grid-template-rows: 0fr;
        overflow: hidden;
        transition: grid-template-rows 160ms ease, opacity 120ms ease;
        opacity: 0;
    }

        .day-details-wrap > .day-details {
            min-height: 0;
        }

        .day-details-wrap.open {
            grid-template-rows: 1fr;
            opacity: 1;
        }

    /* Optional: wenn jemand Reduced Motion an hat */
    @media (prefers-reduced-motion: reduce) {
        .day-details-wrap {
            transition: none;
        }
    }

    .day-collapse-enter-active,
    .day-collapse-leave-active {
        transition: height 140ms ease, opacity 110ms ease;
    }

    /* ===== Journal/Entries Layout (clean + sichtbar + übersichtlich) ===== */

    .journal-entries {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: .55rem;
    }

    .journal-entry {
        position: relative;
        padding: .85rem .9rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: radial-gradient(circle at 18% 22%, rgba(129, 140, 248, 0.12), transparent 58%), linear-gradient( 180deg, color-mix(in srgb, var(--bg-card) 86%, transparent), color-mix(in srgb, var(--bg-card) 70%, #020617 30%) );
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.20);
        overflow: hidden;
        isolation: isolate;
        transition: transform 140ms ease, border-color 160ms ease, box-shadow 180ms ease, filter 160ms ease;
        display: flex;
        flex-direction: column;
        gap: .55rem;
    }

        /* kleines “status” highlight links -> besser scanbar */
        .journal-entry::before {
            content: '';
            position: absolute;
            left: 10px;
            top: 10px;
            bottom: 10px;
            width: 3px;
            border-radius: 999px;
            opacity: .75;
            background: linear-gradient(180deg, rgba(129, 140, 248, 0.95), rgba(167, 139, 250, 0.60));
        }

        .journal-entry:hover {
            transform: translateY(-1px);
            border-color: rgba(129, 140, 248, 0.38);
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.26), 0 0 18px rgba(129, 140, 248, 0.08);
            filter: brightness(1.02);
        }

    html.dark-mode .journal-entry {
        border-color: rgba(148, 163, 184, 0.24);
        background: radial-gradient(circle at 18% 22%, rgba(129, 140, 248, 0.14), transparent 58%), linear-gradient(180deg, rgba(2, 6, 23, 0.72), rgba(2, 6, 23, 0.46));
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.68);
    }

        html.dark-mode .journal-entry:hover {
            border-color: rgba(129, 140, 248, 0.44);
            box-shadow: 0 24px 52px rgba(0, 0, 0, 0.74), 0 0 20px rgba(129, 140, 248, 0.10);
        }

    .entry-exercise {
        flex: 1 1 220px;
        order: 1;
        font-weight: 850;
        letter-spacing: -0.01em;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-primary);
        text-align: left;
    }

    .entry-summary {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: .4rem;
        flex-wrap: wrap;
    }

    .sum-pill {
        flex: 0 0 auto;
        font-size: .88rem;
        font-weight: 800;
        padding: .28rem .6rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(148, 163, 184, 0.10);
        color: var(--text-primary);
        white-space: nowrap;
    }

    .day-pr-badge {
        display: inline-flex;
        align-items: center;
        gap: .3rem;
        flex: 0 0 auto;
        padding: .22rem .58rem;
        border-radius: 999px;
        border: 1px solid rgba(245, 158, 11, 0.34);
        background: linear-gradient(180deg, rgba(245, 158, 11, 0.18), rgba(234, 179, 8, 0.10));
        color: var(--text-primary);
        font-size: .78rem;
        font-weight: 900;
        white-space: nowrap;
    }

    .day-pr-badge {
        margin-left: .2rem;
    }

    .day-pr-summary {
        appearance: none;
        width: 100%;
        display: flex;
        align-items: center;
        gap: .55rem;
        margin-top: .55rem;
        padding: .7rem .8rem;
        border-radius: 14px;
        border: 1px solid rgba(245, 158, 11, 0.28);
        background: linear-gradient(180deg, rgba(245, 158, 11, 0.14), rgba(234, 179, 8, 0.08));
        color: var(--text-primary);
        text-align: left;
        cursor: pointer;
    }

    .day-pr-summary:hover {
        border-color: rgba(245, 158, 11, 0.4);
        background: linear-gradient(180deg, rgba(245, 158, 11, 0.18), rgba(234, 179, 8, 0.10));
    }

    .day-pr-summary__icon {
        width: 1.8rem;
        height: 1.8rem;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.10);
        flex: 0 0 auto;
    }

    .day-pr-summary__text {
        font-weight: 800;
        line-height: 1.25;
        flex: 1 1 auto;
        min-width: 0;
    }

    .day-pr-details {
        display: grid;
        gap: .45rem;
        margin-top: .45rem;
        padding: .15rem 0 0;
    }

    .day-pr-detail {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: .5rem;
        align-items: center;
        padding: .6rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(245, 158, 11, 0.16);
        background: rgba(245, 158, 11, 0.06);
    }

    .day-pr-detail__exercise {
        min-width: 0;
        font-weight: 800;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .day-pr-detail__metric {
        font-size: .84rem;
        font-weight: 700;
        color: var(--text-secondary);
        white-space: nowrap;
    }

    .day-pr-detail__value {
        font-size: .84rem;
        font-weight: 900;
        color: var(--text-primary);
        white-space: nowrap;
    }

    .sum-pill--sets {
        white-space: normal;
    }

    .sum-sets {
        display: inline-flex;
        flex-wrap: wrap;
        gap: .35rem;
        margin-left: .35rem;
    }

    .sum-set {
        padding: .14rem .42rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-primary);
        font-size: .86rem;
    }

    .sum-k {
        font-size: .72rem;
        font-weight: 850;
        letter-spacing: .02em;
        text-transform: uppercase;
        margin-right: .35rem;
        color: var(--text-secondary);
    }

    .sum-u {
        font-size: .72rem;
        font-weight: 850;
        letter-spacing: .02em;
        text-transform: uppercase;
        margin-left: .35rem;
        color: var(--text-secondary);
    }

    .exercise-header {
        font-weight: 800;
        margin: .25rem 0 .8rem;
    }

    .chip {
        font-size: .85rem;
        padding: .22rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-secondary);
        white-space: nowrap;
    }

    .entry-actions {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        flex-wrap: wrap;
        justify-content: flex-end;
        margin-left: auto;
        margin-right: 0;
        order: 2;
        flex: 0 1 auto;
        min-width: 0;
    }

    .entry-actions > * {
        max-width: 100%;
    }

    @media (max-width: 640px) {
        .entry-exercise {
            flex-basis: 100%;
            max-width: 100%;
        }

        .entry-actions {
            flex: 1 1 100%;
            margin-left: 0;
            justify-content: flex-start;
        }
    }

    @media (max-width: 560px) {
        .entry-head {
            gap: .4rem .5rem;
        }

        .sum-pill {
            font-size: .82rem;
            padding: .24rem .52rem;
        }
    }

    @media (max-width: 520px) {
        .entry-actions {
            flex-wrap: wrap;
        }
    }

    .empty-state {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: .9rem;
        padding: 1rem 1.05rem;
        margin: .25rem 0 .6rem;
        border-radius: 18px;
        background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 92%, transparent), color-mix(in srgb, var(--bg-card) 80%, #020617 20%));
        border: 1px solid rgba(148, 163, 184, 0.28);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.30);
        overflow: hidden;
        isolation: isolate;
    }

        .empty-state::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 18% 28%, rgba(129, 140, 248, 0.10), transparent 62%);
            opacity: .75;
            pointer-events: none;
            z-index: 0;
        }

        .empty-state::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 0;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
        }

        .empty-state > * {
            position: relative;
            z-index: 1;
        }

        .empty-state:hover {
            border-color: rgba(129, 140, 248, 0.42);
            box-shadow: 0 22px 52px rgba(15, 23, 42, 0.38);
        }

            .empty-state:hover::before {
                opacity: .95;
            }

    html.dark-mode .empty-state {
        background: linear-gradient(180deg, rgba(2, 6, 23, 0.86), rgba(2, 6, 23, 0.74));
        border-color: rgba(148, 163, 184, 0.36);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.72);
    }

        html.dark-mode .empty-state:hover {
            border-color: rgba(129, 140, 248, 0.50);
        }

    .empty-icon {
        width: 2.5rem;
        height: 2.5rem;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: color-mix(in srgb, var(--bg-secondary) 55%, transparent);
        border: 1px solid rgba(148, 163, 184, 0.28);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        font-size: 1.2rem;
    }

    .empty-left {
        min-width: 0;
        flex: 1;
    }

    .empty-title {
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.01em;
    }

    .empty-sub {
        margin-top: .2rem;
        font-size: .92rem;
        color: var(--text-secondary);
    }

    @media (max-width: 520px) {
        .empty-state {
            grid-template-columns: 1fr;
            gap: .75rem;
        }

        .empty-icon {
            justify-self: start;
        }

        .empty-state .empty-cta-btn {
            justify-self: end;
        }
    }

    .empty-cta {
        justify-self: end;
        display: flex;
        align-items: center;
        padding-left: .25rem;
    }

    .empty-state {
        grid-template-columns: auto minmax(0, 1fr) auto;
    }

    .empty-cta-btn {
        min-width: 9.5rem;
        height: 2.25rem;
        padding: 0 1rem;
    }

    .empty-cta {
        max-width: max-content;
    }

    .entry-head {
        display: flex;
        align-items: center;
        gap: .45rem .6rem;
        flex-wrap: wrap;
        min-width: 0;
        padding-left: 1rem;
    }

    @media (max-width: 420px) {
        .journal-entry {
            padding: .8rem .75rem;
        }

        .entry-exercise {
            font-size: .97rem;
        }

        .day-meta {
            gap: .3rem;
            flex-wrap: wrap;
        }

        .day-pr-badge {
            margin-left: 0;
        }

        .day-pr-detail {
            grid-template-columns: 1fr;
            gap: .25rem;
        }

        .day-pr-detail__exercise,
        .day-pr-detail__metric,
        .day-pr-detail__value {
            white-space: normal;
        }
    }

    @media (max-width: 360px) {
        .entry-actions {
            gap: .3rem;
        }

        .sum-pill {
            font-size: .78rem;
            padding: .22rem .45rem;
        }
    }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
        margin-top: .65rem;
        padding-left: 1rem;
    }

    .note {
        margin-top: .65rem;
        padding-top: .55rem;
        padding-left: 1rem;
        border-top: 1px dashed rgba(148, 163, 184, 0.22);
        color: var(--text-secondary);
        font-size: .92rem;
    }

    .exercise-header-row {
        display: flex;
        align-items: center;
        justify-content: flex-start; /* statt space-between */
        gap: .75rem;
        margin: .25rem 0 .8rem; /* spacing bleibt wie vorher */
    }

    .exercise-header-left {
        display: inline-flex;
        align-items: center;
        gap: .55rem; /* Abstand Title <-> Toggle */
        min-width: 0;
    }

    .exercise-header {
        font-weight: 800;
        margin: 0;
        font-family: inherit; /* alle Titel gleiche Schriftart */
        font-size: 1.05rem; /* optional: einheitlicher Look */
        letter-spacing: -0.01em; /* passt zu deinem UI-Style */
    }

    .exercise-block + .exercise-block {
        margin-top: 1rem;
    }

    .day-feedback-cta {
        margin-top: .85rem;
        padding-top: .65rem;
        border-top: 1px dashed rgba(148, 163, 184, 0.18);
        display: flex;
        justify-content: flex-start;
    }

    .day-feedback-btn {
        font-weight: 800;
    }

    .section-toggle {
        appearance: none;
        border: 0;
        background: transparent;
        box-shadow: none;
        padding: .2rem .35rem;
        border-radius: 10px;
        cursor: pointer;
        color: inherit;
        line-height: 1;
    }

        .section-toggle:hover {
            filter: none;
        }

        .section-toggle:active {
            filter: none;
        }

    .set-details {
        margin-top: .6rem;
        margin-left: 11px;
        padding: .6rem .7rem;
        padding-left: 0.65rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.06), rgba(148, 163, 184, 0.03));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        display: grid;
        gap: .45rem;
    }

    .set-idx {
        font-weight: 900;
        color: var(--text-secondary);
        font-size: .82rem;
        text-align: center;
        opacity: .9;
    }

    .set-idx-wrap {
        display: grid;
        gap: .14rem;
        align-items: center;
        justify-items: center;
        min-width: 0;
    }

    .set-name {
        max-width: 5.7rem;
        font-size: .64rem;
        line-height: 1.05;
        font-weight: 800;
        color: var(--text-secondary);
        opacity: .9;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        --set-name-shift: 0px;
        --set-name-duration: 0s;
    }

    .set-name__text {
        display: inline-block;
        white-space: nowrap;
        will-change: transform;
    }

    .set-name.is-overflowing {
        text-overflow: clip;
    }

    .set-name.is-overflowing .set-name__text {
        animation: set-name-marquee var(--set-name-duration) linear infinite;
    }

    @keyframes set-name-marquee {
        0%, 18% {
            transform: translateX(0);
        }

        62%, 80% {
            transform: translateX(calc(-1 * var(--set-name-shift)));
        }

        100% {
            transform: translateX(0);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .set-name.is-overflowing .set-name__text {
            animation: none !important;
        }
    }


    .set-weight {
        font-weight: 900;
        color: var(--text-primary);
        font-size: .9rem;
        justify-self: end;
    }

    html.dark-mode .set-details {
        border-color: rgba(148, 163, 184, 0.20);
        background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
    }

    html.dark-mode .set-row {
        border-color: rgba(148, 163, 184, 0.16);
        background: rgba(255,255,255,0.03);
    }

    .extras-grid {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
    }

    .extra-chip {
        display: inline-flex;
        align-items: center;
        gap: .45rem;
        padding: .24rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-primary);
        white-space: nowrap;
        max-width: 100%;
    }

    .set-list {
        display: grid;
        gap: .45rem;
        margin-top: .55rem;
    }

    .extra-k {
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .02em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .extra-v {
        font-size: .86rem;
        font-weight: 850;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 24ch; /* damit's bei custom text nicht explodiert */
    }

    /* ADD: Core stats rows (Cardio/Dehnung) - same vibe as set-row */
    .stat-list {
        display: grid;
        gap: .45rem;
    }

    .stat-row {
        display: grid;
        grid-template-columns: 1fr auto; /* label | value right */
        gap: .6rem;
        align-items: center;
        padding: .45rem .6rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(148, 163, 184, 0.06);
    }

    .stat-k {
        font-weight: 850;
        color: var(--text-secondary);
        font-size: .82rem;
        letter-spacing: .02em;
        text-transform: uppercase;
    }

    .stat-v {
        font-weight: 900;
        color: var(--text-primary);
        font-size: .9rem;
        justify-self: end;
    }

    html.dark-mode .stat-row {
        border-color: rgba(148, 163, 184, 0.16);
        background: rgba(255,255,255,0.03);
    }

    /* REPLACE */
    .set-row {
        display: grid;
        grid-template-columns: minmax(2.2rem, 6.2rem) minmax(0, 1fr) auto;
        gap: .6rem;
        align-items: center;
        padding: .45rem .6rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(148, 163, 184, 0.06);
    }

    .set-reps {
        font-weight: 850;
        color: var(--text-primary);
        font-size: .9rem;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        justify-self: center; /* sitzt in der Mitte der mittleren Spalte */
        text-align: center; /* Text auch wirklich mittig */
    }

    .set-upgrade-hint {
        grid-column: 1 / -1;
        margin-top: .1rem;
        padding: .35rem .5rem;
        border-radius: 10px;
        border: 1px solid rgba(34, 197, 94, 0.22);
        background: color-mix(in srgb, rgba(34, 197, 94, 0.12) 75%, transparent);
        color: var(--text-primary);
        font-size: .8rem;
        font-weight: 750;
        line-height: 1.15;
    }

    /* REPLACE */
    .set-right {
        font-weight: 900;
        color: var(--text-primary);
        font-size: .9rem;
        white-space: nowrap; /* duration bleibt immer rechts, eine Linie */
        justify-self: end;
        text-align: right;
    }

    .entry-footer {
        margin-top: auto;
        padding-top: .55rem;
        padding-left: 1rem; /* align mit entry-head */
        border-top: 1px dashed rgba(148, 163, 184, 0.18);
        display: flex;
        flex-wrap: wrap;
        gap: .35rem .55rem;
        color: var(--text-secondary);
        font-size: .82rem;
    }

    .abbr-item {
        display: inline-flex;
        align-items: baseline;
        gap: .25rem;
    }

    .abbr-k {
        font-weight: 900;
        letter-spacing: .02em;
        color: var(--text-secondary);
    }

    .abbr-sep {
        opacity: .8;
    }

    .abbr-v {
        font-weight: 800;
        color: var(--text-secondary);
        opacity: .95;
    }

    /* Separator immer stabil: via CSS statt extra DOM-Span */
    .entry-footer .abbr-item:not(:last-child)::after {
        content: '·';
        margin-left: .35rem;
        opacity: .6;
    }

    /* den alten Dot-Span killen, damit nix doppelt wird */
    .abbr-dot {
        display: none;
    }


    .entry-summary--grid {
        display: grid;
        grid-template-columns: 1fr auto; /* Wdh | rechts */
        align-items: center;
        column-gap: .6rem;
    }

    .sum-pill--mid {
        justify-self: start; /* früher center, jetzt links in der 1fr */
    }

    /* Sätze links */
    .sum-pill--left {
        justify-self: start;
    }

    .sum-right {
        justify-self: end;
        display: inline-flex;
        align-items: center;
        gap: .4rem;
    }

    /* ===== Cardio Summary: Kacheln statt Tabellen-Row ===== */
    .metric-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .45rem;
    }

    @media (max-width: 520px) {
        .metric-grid {
            grid-template-columns: 1fr;
        }
    }

    .metric {
        padding: .55rem .65rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.14);
        background: rgba(148, 163, 184, 0.06);
        display: grid;
        gap: .12rem;
    }

    html.dark-mode .metric {
        border-color: rgba(148, 163, 184, 0.16);
        background: rgba(255,255,255,0.03);
    }

    .metric-label {
        font-weight: 900;
        color: var(--text-secondary);
        font-size: .72rem;
        letter-spacing: .02em;
        text-transform: uppercase;
    }

    .metric-value {
        font-weight: 950;
        color: var(--text-primary);
        font-size: .98rem;
    }

    .metric-u {
        font-weight: 900;
        font-size: .72rem;
        color: var(--text-secondary);
        margin-left: .25rem;
    }

    /* ===== Cardio Sessions: eine Zeile, kein 3-Spalten-Table-Look ===== */
    .set-row--single {
        grid-template-columns: 2.2rem minmax(0, 1fr);
    }

    .set-line {
        min-width: 0;
        display: inline-flex;
        flex-wrap: wrap;
        gap: .35rem;
        align-items: baseline;
    }

    .set-main {
        font-weight: 900;
        color: var(--text-primary);
        font-size: .9rem;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .set-sub {
        font-weight: 850;
        color: var(--text-secondary);
        font-size: .82rem;
        white-space: nowrap;
    }

    /* ===== Extras: eine Zeile scrollbar statt 5 Reihen Chaos ===== */
    .extras-grid--scroll {
        flex-wrap: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        padding-bottom: .15rem;
        -webkit-overflow-scrolling: touch;
    }

    .plan-rotation-notice {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: .75rem;
        align-items: start;
        padding: .8rem .9rem;
        margin: .2rem 0 .75rem;
        border-radius: 16px;
        border: 1px solid rgba(250, 204, 21, 0.32);
        background: linear-gradient(180deg, rgba(250, 204, 21, 0.10), rgba(250, 204, 21, 0.05));
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18);
    }

    .plan-rotation-notice .notice-icon {
        width: 2rem;
        height: 2rem;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: rgba(250, 204, 21, 0.18);
        border: 1px solid rgba(250, 204, 21, 0.30);
        font-size: 1rem;
    }

    .plan-rotation-notice .notice-title {
        font-weight: 850;
        color: var(--text-primary);
        letter-spacing: -0.01em;
    }

    .plan-rotation-notice .notice-text {
        margin-top: .2rem;
        font-size: .92rem;
        color: var(--text-secondary);
    }

    html.dark-mode .plan-rotation-notice {
        border-color: rgba(250, 204, 21, 0.36);
        background: linear-gradient(180deg, rgba(2, 6, 23, 0.85), rgba(2, 6, 23, 0.70));
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.68);
    }

    .plan-last-summary {
        display: grid;
        gap: .2rem;
        padding: .7rem .9rem;
        margin: .15rem 0 .65rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.04));
        box-shadow: 0 16px 34px rgba(15, 23, 42, 0.16);
    }

    .plan-last-summary .summary-label {
        font-size: .72rem;
        font-weight: 900;
        letter-spacing: .02em;
        text-transform: uppercase;
        color: var(--text-secondary);
    }

    .plan-last-summary .summary-body {
        font-size: .95rem;
        font-weight: 800;
        color: var(--text-primary);
    }

    .plan-completion-praise {
        margin: .1rem 0 .65rem;
        padding: .72rem .9rem;
        border-radius: 16px;
        border: 1px solid rgba(16, 185, 129, 0.24);
        background: linear-gradient(180deg, rgba(16, 185, 129, 0.10), rgba(16, 185, 129, 0.05));
        box-shadow: 0 16px 34px rgba(16, 185, 129, 0.10);
        display: grid;
        grid-template-columns: auto 1fr;
        gap: .55rem;
        align-items: center;
    }

    .praise-icon {
        font-size: 1rem;
        line-height: 1;
    }

    .praise-text {
        font-size: .92rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.25;
    }

    html.dark-mode .plan-last-summary {
        border-color: rgba(148, 163, 184, 0.26);
        background: rgba(255,255,255,0.03);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.68);
    }

    html.dark-mode .plan-completion-praise {
        border-color: rgba(16, 185, 129, 0.30);
        background: rgba(16, 185, 129, 0.10);
        box-shadow: 0 20px 44px rgba(0, 0, 0, 0.55);
    }

    .progress-topbar {
        display: flex;
        flex-wrap: nowrap;
        gap: .5rem;
        margin-bottom: .75rem;
        position: sticky;
        top: 0;
        z-index: 5;
        padding: .25rem 0 .6rem;
        background: linear-gradient(180deg, rgba(0,0,0,0.08), transparent);
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
    }

    .progress-topbar::-webkit-scrollbar {
        height: 7px;
    }

    .progress-topbar::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.32);
        border-radius: 999px;
    }

    .progress-btn--active {
        border-color: rgba(129, 140, 248, 0.70);
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22), 0 0 18px rgba(129, 140, 248, 0.10);
        filter: brightness(1.03);
    }

    :global(html.phone-preview) .plan-progress-popup .modal--progress {
        max-height: min(60vh, calc(100vh - 170px));
        padding-right: 0.12rem;
    }

    :global(html.phone-preview) .plan-progress-popup .progress-topbar {
        gap: 0.35rem;
        margin-bottom: 0.55rem;
        padding: 0.18rem 0 0.42rem;
        scrollbar-gutter: stable;
    }

    :global(html.phone-preview) .plan-progress-popup .progress-btn {
        padding: 0.36rem 0.55rem;
        font-size: 0.68rem;
        min-height: 0;
    }

    :global(html.phone-preview) .plan-progress-popup .plan-last-summary,
    :global(html.phone-preview) .plan-progress-popup .plan-completion-praise,
    :global(html.phone-preview) .plan-progress-popup .plan-rotation-notice {
        padding: 0.55rem 0.65rem;
        margin-bottom: 0.55rem;
        border-radius: 12px;
    }

    :global(html.phone-preview) .plan-progress-popup .day-card-list {
        gap: 0.5rem;
    }

    :global(html.phone-preview) .plan-progress-popup .day-card {
        border-radius: 12px;
    }

    :global(html.phone-preview) .plan-progress-popup .day-card-row {
        padding: 0.55rem 0.65rem;
    }

    :global(html.phone-preview) .plan-progress-popup .day-date {
        font-size: 0.76rem;
        line-height: 1.15;
    }

    :global(html.phone-preview) .plan-progress-popup .day-meta,
    :global(html.phone-preview) .plan-progress-popup .count,
    :global(html.phone-preview) .plan-progress-popup .summary-label,
    :global(html.phone-preview) .plan-progress-popup .summary-body {
        font-size: 0.64rem;
    }

    :global(html.phone-preview) .plan-progress-popup .exercise-header {
        font-size: 0.82rem;
    }

    :global(html.phone-preview) .plan-progress-popup .journal-entry,
    :global(html.phone-preview) .plan-progress-popup .set-details,
    :global(html.phone-preview) .plan-progress-popup .stat-row {
        border-radius: 10px;
    }
</style>
