<template>
    <BasePopup :show="show && !!currentPlanId"
               :title="`📖 Fortschritt – ${currentPlanName}`"
               overlayClass="plan-progress-popup"
               :showClose="true"
               @cancel="emit('close')">

        <!-- Scroll-Container (Ref bleibt vorhanden für Parent-Logik) -->
        <div class="modal--progress" ref="modalEl">

            <!-- Top-Row nur für Download-Action -->
            <div class="card-header" v-if="dayCards.length">
                <div class="card-actions">
                    <ActionIconButton ariaLabel="Herunterladen"
                                      title="Herunterladen"
                                      @click="emit('download', currentPlanId!)">
                        ⬇️
                    </ActionIconButton>
                </div>
            </div>

            <div v-if="!dayCards.length" class="empty-state">
                <div class="empty-icon" aria-hidden="true">📈</div>

                <div class="empty-left">
                    <div class="empty-title">Noch kein Fortschritt erfasst.</div>
                    <div class="empty-sub">Leg direkt los und tracke deinen ersten Eintrag.</div>
                </div>

                <div class="empty-cta">
                    <button type="button" class="progress-btn progress-btn--primary" @click="emit('add-entry')">
                        Erster Eintrag
                    </button>
                </div>
            </div>

            <div v-else class="day-card-list">
                <article v-for="c in visibleDayCards" :key="c.day" class="day-card">
                    <div class="day-card-row">
                        <div class="day-card-main">
                            <div class="day-date">{{ formatDayLong(c.day) }}</div>
                            <div class="day-meta">
                                <span class="count">{{ c.uniqueExercises }} Übungen</span>
                            </div>
                        </div>

                        <div class="day-card-actions">
                            <button class="progress-btn" @click="emit('edit-day', c.day)">Bearbeiten</button>
                            <button class="progress-btn progress-btn--primary" @click="emit('toggle-day', c.day)">
                                {{ expandedDays.has(c.day) ? 'Schließen' : 'Öffnen' }}
                            </button>
                        </div>
                    </div>

                    <div class="day-details">
                        <!-- Cardio (zeit-/distanzbasiert) -->
                        <div v-if="cardioForDay(c.day).length" class="exercise-block">
                            <div class="exercise-header">Cardio</div>
                            <ul class="journal-entries">
                                <li v-for="(e, i) in cardioForDay(c.day)"
                                    :key="'cardio-'+e.date+'-'+i"
                                    class="journal-entry">
                                    <div class="entry-head">
                                        <span class="entry-exercise">{{ e.exercise }}</span>
                                        <span class="type-chip" data-type="ausdauer">Cardio</span>
                                        <span class="entry-summary">
                                            <template v-if="e.durationMin != null">
                                                {{ e.durationMin }} Min
                                            </template>
                                            <template v-if="e.sets && e.reps">
                                                <span v-if="e.durationMin != null"> · </span>
                                                {{ e.sets }}×{{ e.reps }}
                                            </template>
                                        </span>
                                    </div>

                                    <div class="chips">
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
                                    <div class="entry-head">
                                        <span class="entry-exercise">{{ e.exercise }}</span>
                                        <span class="type-chip" data-type="dehnung">Dehnung</span>
                                        <span class="entry-summary">
                                            {{ e.durationMin }} Min
                                            <span v-if="e.sets && e.reps"> · {{ e.sets }}×{{ e.reps }}</span>
                                        </span>
                                    </div>

                                    <div class="chips">
                                        <span v-if="e.side" class="chip">{{ e.side }}</span>
                                        <span v-if="e.painFree != null" class="chip">Schmerzfrei {{ e.painFree }}/10</span>
                                        <span v-if="e.movementQuality != null" class="chip">Qualität {{ e.movementQuality }}/10</span>
                                        <span v-if="e.equipment" class="chip">{{ e.equipment }}</span>
                                        <span v-if="e.equipmentCustom" class="chip">{{ e.equipmentCustom }}</span>
                                    </div>

                                    <div v-if="e.note" class="note">— {{ e.note }}</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </article>

                <div v-if="dayCards.length > visibleDays" class="load-more">
                    <button class="progress-btn" @click="emit('update:visibleDays', visibleDays + 7)">
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

            <PopupActionButton @click="emit('add-entry')">
                Neuer Eintrag
            </PopupActionButton>
        </template>
    </BasePopup>
</template>


<script setup lang="ts">

    import { ref } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import ActionIconButton from '@/components/ui/buttons/ActionIconButton.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'

    type DayCard = { day: string; uniqueExercises: number }

    type WorkoutLike = {
        exercise: string
        date: string
        durationMin?: number | null
        sets?: number | null
        reps?: number | null
        avgHr?: number | null
        calories?: number | null
        pace?: string | null
        hrZone?: number | null
        borg?: number | null
        note?: string | null
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
        dayCards: DayCard[]
        visibleDayCards: DayCard[]
        visibleDays: number
        expandedDays: Set<string>
        formatDayLong: (yyyyMMdd: string) => string
        cardioForDay: (day: string) => WorkoutLike[]
        stretchForDay: (day: string) => WorkoutLike[]
    }>()

    const emit = defineEmits<{
        (e: 'close'): void
        (e: 'add-entry'): void
        (e: 'download', planId: string): void
        (e: 'edit-day', day: string): void
        (e: 'toggle-day', day: string): void
        (e: 'update:visibleDays', v: number): void
    }>()

    const modalEl = ref<HTMLElement | null>(null)
    defineExpose({ modalEl })
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

    /* Mini-Header nur für Download-Button */
    .card-header {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: .75rem .75rem .25rem;
    }

    .card-actions {
        display: flex;
        gap: .5rem;
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

    /* ===== Journal/Entries Layout ===== */

    .journal-entries {
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .journal-entry {
        padding: .6rem .5rem;
        border-top: 1px dashed var(--border-color);
    }

        .journal-entry:first-child {
            border-top: 0;
        }

    .entry-head {
        display: flex;
        gap: .6rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .entry-exercise {
        font-weight: 600;
    }

    .entry-summary {
        margin-left: auto;
        font-size: .9rem;
        color: var(--text-secondary);
    }

    .type-chip {
        font-size: .75rem;
        padding: .15rem .45rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        color: var(--text-secondary);
    }

        .type-chip[data-type="ausdauer"] {
            border-color: #60a5fa22;
        }

        .type-chip[data-type="dehnung"] {
            border-color: #34d39922;
        }

        .type-chip[data-type="kraft"],
        .type-chip[data-type="calisthenics"] {
            border-color: #a78bfa22;
        }

    .chips {
        display: flex;
        flex-wrap: wrap;
        gap: .35rem;
        margin-top: .35rem;
    }

    .chip {
        padding: .2rem .45rem;
        border-radius: 999px;
        border: 1px solid var(--border-color);
        background: var(--bg-secondary);
        font-size: .85rem;
    }

    .note {
        margin-top: .25rem;
        color: var(--text-secondary);
        font-size: .9rem;
    }

    .load-more {
        display: flex;
        justify-content: center;
        margin-top: .5rem;
    }

    .exercise-block {
        margin: .5rem 0 1rem;
    }

    .exercise-header {
        font-weight: 700;
        margin: .1rem 0 .4rem;
    }

    /* Mobile Feinschliff */
    @media (max-width: 600px) {
        .open-btn {
            padding: .4rem .7rem;
            font-size: .95rem;
        }

        .list-item {
            padding: .65rem .8rem;
        }

        .day-card-row {
            flex-wrap: wrap;
        }

        .day-card-actions {
            width: 100%;
            justify-content: flex-end; /* Buttons rechts auf neuer Zeile */
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
        /* gleiche “Button-Masse” wie unten im Footer */
        min-width: 9.5rem; /* <- Breite passt, wirkt wie echte Action */
        height: 2.25rem; /* <- identisch zur popup-btn Höhe */
        padding: 0 1rem; /* <- nicht zu fett */
    }

    .empty-cta {
        max-width: max-content;
    }

</style>
