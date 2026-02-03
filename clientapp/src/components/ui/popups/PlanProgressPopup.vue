<!--components/ui/popups/PlanProgressPopup.vue-->
<template>
    <BasePopup :show="show && !!currentPlanId"
               :title="`📖 Fortschritt – ${currentPlanName}`"
               overlayClass="plan-progress-popup"
               :showClose="true"
               @cancel="emit('close')">

        <!-- Scroll-Container (Ref bleibt vorhanden für Parent-Logik) -->
        <div class="modal--progress" ref="modalEl">

            <div v-if="!dayCards.length" class="empty-state">
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
                </div>

                <!-- Calendar View -->
                <Calender v-if="viewMode === 'calendar'"
                          :daysWithEntries="daysWithEntriesArr"
                          @select="jumpToDay" />

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
                                    <span class="count">{{ c.uniqueExercises }} Übungen</span>
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
                                                <span class="section-caret" :class="{ open: !isSectionCollapsed(c.day, 'strength') }">^</span>
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

                                                    <span class="entry-chips">
                                                        <span class="type-chip" :data-type="g.entry.type || 'kraft'">
                                                            {{ g.entry.type === 'calisthenics' ? 'Calisthenics' : 'Kraft' }}
                                                        </span>
                                                    </span>

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
                                                            <span class="set-idx">{{ idx + 1 }}S</span>
                                                            <span class="set-reps">{{ s.reps ?? '–' }} Wdh</span>
                                                            <span class="set-weight">{{ s.weight ?? '–' }} kg</span>
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
                                            <span class="section-caret" :class="{ open: !isSectionCollapsed(c.day, 'cardio') }">^</span>
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
                                                    <span class="type-chip" data-type="ausdauer">Cardio</span>

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
                                            <span class="section-caret" :class="{ open: !isSectionCollapsed(c.day, 'stretch') }">^</span>
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
                                                    <span class="type-chip" data-type="dehnung">Dehnung</span>

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
                                                            <span class="set-idx">{{ idx }}S</span>
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
    import { ref, computed, watch, nextTick } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import KebabButton from '@/components/ui/buttons/KebabButton.vue'
    import KebabMenu, { type KebabMenuItem } from '@/components/ui/menu/KebabMenu.vue'
    import ActionSelectPopup, { type ActionSelectRow } from '@/components/ui/popups/ActionSelectPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'
    import Calender from '@/components/ui/kits/calender/Calender.vue'
    import { useProgressStore } from "@/store/progressStore"
    import type { ProgressEntry } from "@/types/Progress"
    import { storeToRefs } from "pinia"

    type DayCard = { day: string; uniqueExercises: number }

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
        setDetails?: Array<{ weight: number | null; reps: number | null; durationSec?: number | null }> | null

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
        workouts: WorkoutLike[]
        formatDayLong: (yyyyMMdd: string) => string
    }>()

    const emit = defineEmits<{
        (e: 'close'): void
        (e: 'add-entry', payload: { planId: string; keepOpen: boolean }): void
        (e: 'download', payload: { planId: string; days: string[]; exercises?: string[]; allExercises?: boolean }): void
        (e: 'edit-day', day: string): void
        (e: 'delete-day', day: string): void
        (e: 'edit-entry', entry: WorkoutLike): void
        (e: 'delete-entries', payload: { planId: string; entries: WorkoutLike[] }): void
        (e: 'delete', payload: { planId: string; entries: WorkoutLike[] }): void
    }>()

    const modalEl = ref<HTMLElement | null>(null)
    defineExpose({ modalEl })

    const progressStore = useProgressStore()
    const { byPlan } = storeToRefs(progressStore)

    const apiWorkouts = computed<WorkoutLike[]>(() => {
        const planId = props.currentPlanId
        if (!planId) return []

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
    const visibleDays = ref(7)
    const expandedDays = ref<Set<string>>(new Set())

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
    }

    const toggleEntrySets = (e: WorkoutLike, index: number) => {
        const k = entryKey(e, index)
        const next = new Set(expandedEntryKeys.value)
        next.has(k) ? next.delete(k) : next.add(k)
        expandedEntryKeys.value = next
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

    const viewMode = ref<'list' | 'calendar'>('list')

    const selectedDay = ref<string | null>(null)

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
        expandedEntryKeys.value = new Set()

        collapsedSections.value = new Set()

        await nextTick()
    }

    const clearSelectedDay = () => {
        selectedDay.value = null
        collapsedSections.value = new Set()
        expandedDays.value = new Set()
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

        if (ids.length) {
            await Promise.allSettled(ids.map(id => progressStore.remove(planId, id)))
        }

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

    const dayCards = computed<DayCard[]>(() => {
        return [...entriesByDay.value.entries()].map(([day, items]) => {
            const uniqueExercises = new Set(items.map(i => i.exercise)).size
            return { day, uniqueExercises }
        })
    })

    const visibleDayCards = computed(() => dayCards.value.slice(0, visibleDays.value))

    function toggleDay(day: string) {
        const next = new Set(expandedDays.value)
        next.has(day) ? next.delete(day) : next.add(day)
        expandedDays.value = next
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
    }

    const toSetDetails = (e: WorkoutLike) => {
        // Wenn schon setDetails da sind -> nehmen
        if ((e.setDetails?.length ?? 0) > 0) return e.setDetails!

        // Sonst: aus reps/weight einen "Pseudo-Satz" bauen
        const hasAny = (e.reps != null && e.reps !== 0) || (e.weight != null && e.weight !== 0)
        if (!hasAny) return []
        return [{ reps: e.reps ?? null, weight: e.weight ?? null }]
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
            })
        }

        // Sort: neueste zuerst (passt zu deinem day sort vibe)
        groups.sort((a, b) => (b.editEntry.date || '').localeCompare(a.editEntry.date || ''))
        return groups
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
        (open) => {
            document.body.style.overflow = open ? 'hidden' : ''
            if (open) {
                visibleDays.value = 7
                expandedDays.value = new Set()
                expandedEntryKeys.value = new Set()
                viewMode.value = 'list'
                selectedDay.value = null
                collapsedSections.value = new Set()

                const planId = props.currentPlanId
                if (planId) {
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
        overflow-y: auto; /* oder: scroll, wenn du IMMER Platz reservieren willst */
        overflow-x: hidden;
        max-height: calc(100vh - 220px);
        min-height: 0;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        /* Firefox */
        scrollbar-width: thin;
        scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
    }

        /* WebKit (Chrome/Edge/Safari) */
        .modal--progress::-webkit-scrollbar {
            width: 10px;
        }

        .modal--progress::-webkit-scrollbar-track {
            background: transparent;
        }

        .modal--progress::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background: rgba(148, 163, 184, 0.45);
            border: 3px solid transparent; /* macht's “slimmer” + nicer */
            background-clip: content-box;
        }

            .modal--progress::-webkit-scrollbar-thumb:hover {
                background: rgba(148, 163, 184, 0.65);
                background-clip: content-box;
            }

    .section-caret {
        display: inline-block;
        font-weight: 950;
        line-height: 1;
        transform: rotate(0deg);
        transition: transform 160ms ease;
        translate: 0 1px; /* optisch nicer */
    }

        .section-caret.open {
            transform: rotate(180deg);
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


    /* Mobile/modern browsers: besser als 100vh wegen Browser-UI */
    @supports (height: 100dvh) {
        .modal--progress {
            max-height: calc(100dvh - 220px);
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
        font-weight: 850;
        letter-spacing: -0.01em;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-primary);
    }

    /* Typ-Chip: klein, klar, immer sichtbar */
    .type-chip {
        font-size: .74rem;
        padding: .20rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(148, 163, 184, 0.10);
        color: var(--text-secondary);
        white-space: nowrap;
    }

        /* Type Farben (nur dezent, aber eindeutig) */
        .type-chip[data-type="ausdauer"] {
            border-color: rgba(96, 165, 250, 0.28);
            background: rgba(96, 165, 250, 0.12);
        }

        .type-chip[data-type="dehnung"] {
            border-color: rgba(52, 211, 153, 0.26);
            background: rgba(52, 211, 153, 0.11);
        }

        .type-chip[data-type="kraft"],
        .type-chip[data-type="calisthenics"] {
            border-color: rgba(167, 139, 250, 0.28);
            background: rgba(167, 139, 250, 0.12);
        }

    .entry-summary {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: .4rem;
        flex-wrap: wrap;
    }

    .sum-pill {
        font-size: .88rem;
        font-weight: 800;
        padding: .28rem .6rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(148, 163, 184, 0.10);
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

    @media (max-width: 520px) {
        .entry-head {
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: start;
        }

        .entry-chips {
            justify-self: end;
        }

        .entry-actions {
            grid-column: 1 / -1;
            justify-self: start;
            justify-content: flex-start;
            margin-top: .15rem;
        }
    }

    .entry-chips {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        flex-wrap: wrap;
        justify-self: start;
    }

    .entry-actions {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
        flex-wrap: wrap;
        justify-self: end;
        justify-content: flex-end;
        min-width: 0;
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
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: center;
        gap: .45rem .6rem;
        padding-left: 1rem;
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
        grid-template-columns: 2.2rem minmax(0, 1fr) auto;
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

    .progress-topbar {
        display: flex;
        gap: .5rem;
        margin-bottom: .75rem;
        position: sticky;
        top: 0;
        z-index: 5;
        padding: .25rem 0 .6rem;
        background: linear-gradient(180deg, rgba(0,0,0,0.08), transparent);
    }

    .progress-btn--active {
        border-color: rgba(129, 140, 248, 0.70);
        box-shadow: 0 18px 42px rgba(0, 0, 0, 0.22), 0 0 18px rgba(129, 140, 248, 0.10);
        filter: brightness(1.03);
    }
</style>
