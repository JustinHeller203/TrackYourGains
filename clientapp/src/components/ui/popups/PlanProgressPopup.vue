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

            <div v-else class="day-card-list">
                <article v-for="c in visibleDayCards" :key="c.day" class="day-card">
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

                    <div class="day-details-wrap" :class="{ open: expandedDays.has(c.day) }">
                        <div class="day-details">
                            <!-- Kraft / Calisthenics -->
                            <div v-if="strengthForDay(c.day).length" class="exercise-block">
                                <div class="exercise-header">Kraft</div>
                                <ul class="journal-entries">
                                    <li v-for="(e, i) in strengthForDay(c.day)"
                                        :key="'str-'+e.date+'-'+i"
                                        class="journal-entry">
                                        <div class="entry-head"
                                             role="button"
                                             tabindex="0"
                                             @dblclick.stop.prevent="onEntryDblClick(e)"
                                             @keydown.enter.stop.prevent="onEntryDblClick(e)">
                                            <span class="entry-exercise">{{ e.exercise }}</span>
                                            <span class="type-chip" :data-type="e.type || 'kraft'">
                                                {{ e.type === 'calisthenics' ? 'Calisthenics' : 'Kraft' }}
                                            </span>

                                            <span class="entry-summary">
                                                <!-- 1) Wenn setDetails existiert: zeig echte Sätze -->
                                                <span v-if="e.setDetails?.length" class="sum-pill sum-pill--sets" :title="e.setDetails.map((s, idx) => `Satz ${idx+1}: ${s.reps ?? '–'} Wdh · ${s.weight ?? '–'} kg`).join(' | ')">
                                                    <span class="sum-k">Sätze</span>
                                                    <span class="sum-sets">
                                                        <span v-for="(s, idx) in e.setDetails" :key="idx" class="sum-set">
                                                            {{ (s.reps ?? '–') }}×{{ (s.weight ?? '–') }}
                                                        </span>
                                                    </span>
                                                </span>

                                                <!-- 2) Fallback: alte Felder -->
                                                <template v-else>
                                                    <span v-if="e.sets && e.reps" class="sum-pill">
                                                        <span class="sum-k">Sätze</span> {{ e.sets }}×{{ e.reps }}
                                                    </span>

                                                    <span v-if="e.weight != null" class="sum-pill">
                                                        <span class="sum-k">Gewicht</span> {{ e.weight }} kg
                                                    </span>
                                                </template>
                                            </span>

                                        </div>

                                        <div v-if="e.note" class="note">— {{ e.note }}</div>
                                    </li>
                                </ul>
                            </div>

                            <!-- Cardio (zeit-/distanzbasiert) -->
                            <div v-if="cardioForDay(c.day).length" class="exercise-block">
                                <div class="exercise-header">Cardio</div>
                                <ul class="journal-entries">
                                    <li v-for="(e, i) in cardioForDay(c.day)"
                                        :key="'cardio-'+e.date+'-'+i"
                                        class="journal-entry">
                                        <div class="entry-head"
                                             role="button"
                                             tabindex="0"
                                             @dblclick.stop.prevent="onEntryDblClick(e)"
                                             @keydown.enter.stop.prevent="onEntryDblClick(e)">

                                            <span class="entry-exercise">{{ e.exercise }}</span>
                                            <span class="type-chip" data-type="ausdauer">Cardio</span>
                                            <span class="entry-summary">
                                                <span v-if="e.durationMin != null" class="sum-pill">
                                                    <span class="sum-k">Dauer</span> {{ e.durationMin }} Min
                                                </span>

                                                <span v-if="e.sets && e.reps" class="sum-pill">
                                                    <span class="sum-k">Intervalle</span> {{ e.sets }}×{{ e.reps }}
                                                </span>
                                            </span>
                                        </div>

                                        <div class="chips">
                                            <span v-if="(e as any).distanceKm != null" class="chip">{{ (e as any).distanceKm }} km</span>
                                            <span v-if="e.avgHr != null" class="chip">Ø Puls {{ e.avgHr }}</span>
                                            <span v-if="e.calories != null" class="chip">{{ e.calories }} kcal</span>
                                            <span v-if="e.pace" class="chip">{{ e.pace }}/km</span>
                                            <span v-if="e.hrZone != null" class="chip">Zone {{ e.hrZone }}</span>
                                            <span v-if="e.borg != null" class="chip">Borg {{ e.borg }}</span>
                                        </div>

                                        <div v-if="e.note" class="note">— {{ e.note }}</div>
                                    </li>
                                </ul>
                            </div>

                            <!-- Dehnung (zeit-/satzbasiert) -->
                            <div v-if="stretchForDay(c.day).length" class="exercise-block">
                                <div class="exercise-header">Dehnung</div>
                                <ul class="journal-entries">
                                    <li v-for="(e, i) in stretchForDay(c.day)"
                                        :key="'flex-'+e.date+'-'+i"
                                        class="journal-entry">
                                        <div class="entry-head"
                                             role="button"
                                             tabindex="0"
                                             @dblclick.stop.prevent="onEntryDblClick(e)"
                                             @keydown.enter.stop.prevent="onEntryDblClick(e)">
                                            <span class="entry-exercise">{{ e.exercise }}</span>
                                            <span class="type-chip" data-type="dehnung">Dehnung</span>
                                            <span class="entry-summary">
                                                <span v-if="e.durationMin != null" class="sum-pill">
                                                    <span class="sum-k">Dauer</span> {{ e.durationMin }} Min
                                                </span>

                                                <span v-if="e.sets && e.reps" class="sum-pill">
                                                    <span class="sum-k">Sätze</span> {{ e.sets }}×{{ e.reps }}
                                                </span>
                                            </span>
                                        </div>

                                        <div class="chips">
                                            <span v-if="e.side" class="chip">{{ e.side }}</span>
                                            <span v-if="e.painFree != null" class="chip">Schmerzfrei {{ e.painFree }}/10</span>
                                            <span v-if="e.movementQuality != null" class="chip">Qualität {{ e.movementQuality }}/10</span>
                                            <span v-if="e.equipment" class="chip">{{ e.equipment }}</span>
                                            <span v-if="e.equipmentCustom" class="chip">{{ e.equipmentCustom }}</span>
                                        </div>

                                        <div class="chips" v-if="e.tempo || e.restSeconds != null || e.isDropset || (e.dropsets?.length)">
                                            <span v-if="e.tempo" class="chip">Tempo {{ e.tempo }}</span>
                                            <span v-if="e.restSeconds != null" class="chip">Pause {{ e.restSeconds }}s</span>

                                            <span v-if="e.isDropset || (e.dropsets?.length)"
                                                  class="chip"
                                                  :title="e.dropsets?.length ? e.dropsets.map((ds, idx) => `Drop ${idx+1}: ${(ds.reps ?? '–')}×${(ds.weight ?? '–')}`).join(' | ') : ''">
                                                Dropset
                                            </span>
                                        </div>

                                        <div v-if="e.note" class="note">— {{ e.note }}</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </article>

                <div v-if="dayCards.length > visibleDays" class="load-more">
                    <button class="progress-btn" @click="visibleDays = visibleDays + 7">
                        Weitere Tage laden
                    </button>
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

        <ActionSelectPopup :show="showDayPickPopup"
                           :title="dayPickAction === 'delete' ? 'Tage löschen' : 'Tag bearbeiten'"
                           :subtitle="dayPickAction === 'delete'
        ? 'Setz Haken, was gelöscht werden soll'
        : 'Wähl einen Tag aus'"
                           :helper="dayPickAction === 'edit' ? 'Bearbeiten ist Single-Select.' : ''"
                           :rows="dayPickRows"
                           :selectionMode="dayPickAction === 'edit' ? 'single' : 'multi'"
                           :showAllOption="dayPickAction === 'delete'"
                           allLabel="Alle Tage"
                           v-model:allSelected="dayPickAll"
                           v-model:selectedIds="dayPickSelected"
                           cancelText="Abbrechen"
                           :confirmText="dayPickAction === 'delete' ? 'Löschen' : 'Weiter'"
                           :confirmDanger="dayPickAction === 'delete'"
                           @cancel="closeDayPickPopup"
                           @confirm="onDayPickConfirm" />

        <ActionSelectPopup :show="showDownloadPickPopup"
                           title="Tage herunterladen"
                           subtitle="Wähl aus, welche Tage im Export landen sollen"
                           :rows="downloadPickRows"
                           selectionMode="multi"
                           :showAllOption="true"
                           allLabel="Alle Tage"
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
    import ActionIconButton from '@/components/ui/buttons/ActionIconButton.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import KebabButton from '@/components/ui/buttons/KebabButton.vue'
    import KebabMenu, { type KebabMenuItem } from '@/components/ui/menu/KebabMenu.vue'
    import ActionSelectPopup, { type ActionSelectRow } from '@/components/ui/popups/ActionSelectPopup.vue'
    import DeleteConfirmPopup from '@/components/ui/popups/DeleteConfirmPopup.vue'

    type DayCard = { day: string; uniqueExercises: number }

    type WorkoutLike = {
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
        setDetails?: Array<{ weight: number | null; reps: number | null }> | null

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
        movementQuality?: number | null
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
        (e: 'download', payload: { planId: string; days: string[] }): void
        (e: 'edit-day', day: string): void
        (e: 'delete-day', day: string): void
        (e: 'edit-entry', entry: WorkoutLike): void
    }>()

    const modalEl = ref<HTMLElement | null>(null)
    defineExpose({ modalEl })

    const visibleDays = ref(7)
    const expandedDays = ref<Set<string>>(new Set())

    const menuDay = ref<string | null>(null)
    const menuAnchorEl = ref<HTMLElement | null>(null)

    const menuItems = computed<KebabMenuItem[]>(() => ([
        { id: 'download', label: 'Herunterladen', icon: '⬇️', hint: 'Auswahl' },
        { id: 'edit', label: 'Bearbeiten', icon: '✏️', hint: 'Auswahl' },
        { id: 'delete', label: 'Löschen', icon: '🗑️', hint: 'Auswahl', danger: true },
    ]))

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

    const buildDownloadPickRows = () => {
        downloadPickRows.value = dayCards.value.map(c => ({
            id: c.day,
            label: props.formatDayLong(c.day),
            value: `${c.uniqueExercises} Übungen`,
        }))
    }

    const openDownloadPickPopup = (initialDay: string) => {
        buildDownloadPickRows()
        downloadPickAll.value = false
        downloadPickSelected.value = [initialDay] // nice UX: Starttag vorselecten
        showDownloadPickPopup.value = true
    }

    const closeDownloadPickPopup = () => {
        showDownloadPickPopup.value = false
        downloadPickAll.value = false
        downloadPickSelected.value = []
        downloadPickRows.value = []
    }

    const onDownloadPickConfirm = (payload: { all: boolean; ids: string[] }) => {
        const planId = props.currentPlanId
        if (!planId) return

        const picked = normalizePickedDays(payload)
        if (!picked.length) return

        closeDownloadPickPopup()
        emit('download', { planId, days: picked })
    }

    const showDeletePopup = ref(false)
    const pendingDeleteDays = ref<string[]>([])

    const cancelDelete = () => {
        showDeletePopup.value = false
        pendingDeleteDays.value = []
    }

    const confirmDelete = () => {
        for (const day of pendingDeleteDays.value) {
            emit('delete-day', day)
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
            openDayPickPopup('edit', d)
            return
        }

        if (id === 'delete') {
            const d = menuDay.value
            closeDayMenu()
            openDayPickPopup('delete', d)
            return
        }

        closeDayMenu()
    }

    const planEntries = computed(() => {
        const planId = props.currentPlanId
        if (!planId) return []
        return (props.workouts ?? []).filter(w => w.planId === planId)
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
                nextTick(() => setupProgressIO())
            } else {
                cleanupProgressIO()
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
        overflow: auto;
        min-height: 0;
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

    /* Kopf: Übung | Typ | Summary (alles in einer Linie) */
    .entry-head {
        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
        gap: .45rem .6rem;
        padding-left: .65rem; /* Platz wegen Accent-Bar */
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

    /* SetDetails darf NICHT one-line forced sein */
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

    .exercise-header {
        font-weight: 800;
        margin: .25rem 0 .8rem;
    }

    /* Meta-Chips: kompakt + gut lesbar */
    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
        margin-top: .65rem;
        padding-left: .65rem;
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

    /* Note wirkt wie “Footer” -> mehr Ordnung */
    .note {
        margin-top: .65rem;
        padding-top: .55rem;
        padding-left: .65rem;
        border-top: 1px dashed rgba(148, 163, 184, 0.22);
        color: var(--text-secondary);
        font-size: .92rem;
    }

    /* Mobile: summary unter die Headline, bleibt aber sichtbar */
    @media (max-width: 520px) {
        .entry-head {
            grid-template-columns: 1fr auto;
            align-items: start;
        }

        .entry-summary {
            grid-column: 1 / -1;
            justify-self: start;
            justify-content: flex-start;
            width: fit-content;
            margin-top: .15rem;
        }
    }


    /* ===== Empty State (soll wie eine dezente Notice wirken, nicht wie eine "Card") ===== */

    .empty-state {
        position: relative;
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: .9rem;
        padding: 1rem 1.05rem;
        margin: .25rem 0 .6rem;
        border-radius: 18px;
        /* cleaner: weniger “farbiger Nebel”, mehr glass */
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
            /* ultra subtle highlight */
            background: radial-gradient(circle at 18% 28%, rgba(129, 140, 248, 0.10), transparent 62%);
            opacity: .75;
            pointer-events: none;
            z-index: 0;
        }

        /* feiner inner-stroke -> wirkt sofort hochwertiger */
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

    /* Mobile: Button unter den Text, aber rechts */
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
        padding-left: .25rem; /* minimal Luft zum Text */
    }

    .empty-state {
        grid-template-columns: auto minmax(0, 1fr) auto;
    }

    .empty-cta-btn {
        min-width: 9.5rem; /* <- Breite passt, wirkt wie echte Action */
        height: 2.25rem; /* <- identisch zur popup-btn Höhe */
        padding: 0 1rem; /* <- nicht zu fett */
    }

    .empty-cta {
        max-width: max-content;
    }


</style>
