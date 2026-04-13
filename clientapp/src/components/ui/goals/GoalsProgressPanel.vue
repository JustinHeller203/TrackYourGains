<template>
    <section class="card goals-progress-panel">
        <div class="goals-progress-head">
            <div>
                <span class="goals-progress-eyebrow">Zielsystem</span>
                <h3 class="card-title goals-progress-title">
                    <i class="fas fa-flag-checkered"></i> Aktive Trainingsziele
                </h3>
            </div>
            <div class="goals-progress-summary">
                <span class="goal-pill">{{ activeEvaluations.length }} aktiv</span>
                <span class="goal-pill is-success">{{ achievedCount }} erreicht</span>
            </div>
        </div>

        <div v-if="activeEvaluations.length" class="goal-list">
            <article v-for="entry in activeEvaluations" :key="entry.goal.id" class="goal-item" :class="`is-${entry.status}`">
                <div class="goal-item-head">
                    <div class="goal-item-head__copy">
                        <div class="goal-item-head__topline">
                            <span class="goal-type-chip">{{ typeLabel(entry.goal.type) }}</span>
                            <span v-if="getGoalExerciseLabel(entry.goal)" class="goal-item-head__context">
                                {{ getGoalExerciseLabel(entry.goal) }}
                            </span>
                        </div>
                        <h4>{{ entry.goal.title }}</h4>
                        <p>{{ entry.primaryText }}</p>
                    </div>
                    <span class="goal-status-chip">{{ entry.statusText }}</span>
                </div>

                <div class="goal-hero">
                    <div class="goal-hero__value">
                        <span class="goal-hero__label">Fortschritt</span>
                        <strong>{{ Math.round(entry.percent) }}%</strong>
                    </div>
                    <div class="goal-hero__rail">
                        <div class="goal-progress-rail">
                            <div class="goal-progress-fill" :style="{ width: `${entry.percent}%` }"></div>
                        </div>
                    </div>
                </div>

                <div class="goal-stats">
                    <div class="goal-stat-card goal-stat-card--current">
                        <span class="goal-stat-card__eyebrow">Aktuell</span>
                        <strong>{{ entry.currentLabel }}</strong>
                        <small class="goal-stat-card__caption">Dein Stand gerade jetzt</small>
                    </div>
                    <div class="goal-stat-card goal-stat-card--target">
                        <span class="goal-stat-card__eyebrow">Ziel</span>
                        <strong>{{ entry.targetLabel }}</strong>
                        <small class="goal-stat-card__caption">Worauf du hinarbeitest</small>
                    </div>
                    <div v-if="entry.deadlineLabel" class="goal-stat-card goal-stat-card--compact">
                        <span class="goal-stat-card__eyebrow">Deadline</span>
                        <strong>{{ entry.deadlineLabel }}</strong>
                        <small class="goal-stat-card__caption">Geplantes Zieldatum</small>
                    </div>
                </div>

                <div class="goal-meta-row">
                    <span v-if="entry.secondaryText" class="goal-meta-pill">{{ entry.secondaryText }}</span>
                    <span class="goal-meta-pill">{{ entry.isAchieved ? 'Ziel erreicht' : 'Ziel aktiv' }}</span>
                </div>
            </article>
        </div>

        <div v-else class="goal-empty">
            <div class="goal-empty__body">
                <p class="goal-empty__copy">
                    Noch keine aktiven Trainingsziele. Lege in deinem Profil Ziele an, damit sie hier mit Fortschrittsbalken und Status verfolgt werden.
                </p>
            </div>
            <div class="goal-empty__actions">
                <RouterLink :to="{ name: 'profile', query: { focus: 'goals' } }" class="goal-empty__cta">
                    Langfristiges Ziel erstellen
                </RouterLink>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useGoalsStore } from '@/store/goalsStore'
import { evaluateTrainingGoals, getGoalExerciseLabel } from '@/utils/goalTracking'
import type { GoalWeightSample, GoalWorkoutSample, TrainingGoalType } from '@/types/goals'

const props = defineProps<{
    workouts: GoalWorkoutSample[]
    weightHistory: GoalWeightSample[]
}>()

const store = useGoalsStore()

onMounted(() => {
    store.load()
})

const activeEvaluations = computed(() =>
    evaluateTrainingGoals(store.activeGoals, { workouts: props.workouts, weights: props.weightHistory })
)

const achievedCount = computed(() => activeEvaluations.value.filter(entry => entry.isAchieved).length)

function typeLabel(type: TrainingGoalType) {
    return {
        body_weight: 'Körpergewicht',
        exercise_weight: 'Übungsgewicht',
        exercise_reps: 'Wiederholungen',
        weekly_frequency: 'Trainingsfrequenz',
    }[type]
}
</script>

<style scoped>
.goals-progress-panel {
    display: grid;
    gap: 16px;
    margin: 0 0 22px;
}

.goals-progress-head,
.goals-progress-summary,
.goal-item-head {
    display: flex;
    gap: 12px;
}

.goals-progress-head,
.goal-item-head {
    justify-content: space-between;
}

.goals-progress-head,
.goal-item-head {
    align-items: flex-start;
}

.goals-progress-summary,
.goal-meta-row {
    flex-wrap: wrap;
}

.goals-progress-eyebrow {
    display: inline-flex;
    margin-bottom: .4rem;
    padding: .28rem .65rem;
    border-radius: 999px;
    font-size: .74rem;
    font-weight: 700;
    letter-spacing: .05em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--text-secondary) 92%, white 8%);
    background: color-mix(in srgb, var(--bg-secondary) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
}

.goal-pill,
.goal-status-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: .55rem .95rem;
    border-radius: 14px;
    font-size: .8rem;
    font-weight: 800;
    letter-spacing: .02em;
    line-height: 1;
    white-space: nowrap;
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 10px 24px rgba(15, 23, 42, 0.10);
    backdrop-filter: blur(8px);
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(37, 99, 235, 0.08));
    color: #1d4ed8;
}

.goal-pill.is-success,
.goal-item.is-achieved .goal-status-chip {
    background: rgba(16, 185, 129, 0.16);
    color: #047857;
}

.goal-list {
    display: grid;
    gap: 14px;
}

.goal-item {
    display: grid;
    gap: 16px;
    padding: 20px;
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.26);
    background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
    transition: transform 190ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 220ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 180ms ease-out, background 220ms ease-out;
    will-change: transform, box-shadow;
}

.goal-item.is-on_track {
    border-color: rgba(59, 130, 246, 0.3);
}

.goal-item.is-needs_attention {
    border-color: rgba(245, 158, 11, 0.35);
}

.goal-item.is-achieved {
    border-color: rgba(16, 185, 129, 0.34);
}

.goal-item-head {
    align-items: center;
}

.goal-item-head__copy {
    display: grid;
    gap: 8px;
}

.goal-item-head__topline {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

.goal-type-chip {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: .3rem .72rem;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.14), rgba(14, 165, 233, 0.12));
    color: #1d4ed8;
    font-size: .76rem;
    font-weight: 800;
    letter-spacing: .02em;
    text-transform: uppercase;
    border: 1px solid rgba(37, 99, 235, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48);
}

.goal-item-head__context {
    color: #64748b;
    font-size: .84rem;
    font-weight: 700;
}

.goal-item-head h4 {
    margin: 0;
    font-size: 1.14rem;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.goal-item-head p {
    margin: 0;
    color: #475569;
    font-size: .92rem;
    line-height: 1.45;
}

.goal-hero {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    align-items: center;
    padding: 16px 18px;
    border-radius: 20px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.07);
}

.goal-hero__value {
    display: grid;
    gap: 2px;
    min-width: 88px;
}

.goal-hero__label {
    color: #64748b;
    font-size: .75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
}

.goal-hero__value strong {
    font-size: 1.72rem;
    line-height: 1;
    letter-spacing: -0.04em;
    color: #020617;
}

.goal-hero__rail {
    min-width: 0;
}

.goal-progress-rail {
    height: 12px;
    margin: 0;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.18);
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.1);
}

.goal-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2563eb, #0ea5e9);
}

.goal-item.is-achieved .goal-progress-fill {
    background: linear-gradient(90deg, #10b981, #059669);
}

.goal-item.is-needs_attention .goal-progress-fill {
    background: linear-gradient(90deg, #f59e0b, #f97316);
}

.goal-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.goal-stat-card {
    display: grid;
    gap: 10px;
    min-width: 0;
    padding: 16px;
    border-radius: 20px;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48), 0 6px 18px rgba(15, 23, 42, 0.07);
    position: relative;
    overflow: hidden;
}

.goal-stat-card::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: rgba(148, 163, 184, 0.3);
}

.goal-stat-card--current::before {
    background: linear-gradient(180deg, #2563eb, #0ea5e9);
}

.goal-stat-card--target::before {
    background: linear-gradient(180deg, #10b981, #14b8a6);
}

.goal-stat-card--current {
    background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
}

.goal-stat-card--target {
    background:
        radial-gradient(circle at top right, color-mix(in srgb, #10b981 12%, transparent), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
}

.goal-stat-card--compact {
    grid-column: 1 / -1;
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 98%, white 2%), color-mix(in srgb, var(--bg-secondary) 74%, var(--bg-card) 26%));
}

.goal-stat-card__eyebrow {
    color: rgba(71, 85, 105, 0.88);
    font-size: .78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
}

.goal-stats strong {
    font-size: 1.72rem;
    line-height: .98;
    letter-spacing: -0.05em;
    max-width: 100%;
    overflow-wrap: anywhere;
    color: #020617;
}

.goal-stat-card--current strong,
.goal-stat-card--target strong {
    font-size: clamp(1.55rem, 1.2rem + 1vw, 2.3rem);
}

.goal-stat-card--compact strong {
    font-size: 1.02rem;
    letter-spacing: -0.02em;
}

.goal-stat-card__caption {
    color: #475569;
    font-size: .8rem;
    font-weight: 600;
    line-height: 1.35;
}

.goal-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.goal-meta-pill {
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    padding: .38rem .75rem;
    border-radius: 999px;
    background: rgba(148, 163, 184, 0.12);
    color: #475569;
    font-size: .82rem;
    font-weight: 700;
    line-height: 1.2;
    border: 1px solid rgba(148, 163, 184, 0.12);
}

.goal-empty {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    align-items: center;
    padding: 18px 20px;
    border-radius: 20px;
    background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 56%),
        radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%),
        color-mix(in srgb, var(--bg-card) 96%, var(--bg-secondary) 4%);
    color: #64748b;
    border: 1px solid color-mix(in srgb, var(--border-color) 78%, transparent);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.34), 0 10px 24px rgba(15, 23, 42, 0.08);
}

.goal-empty__body {
    min-width: 0;
}

.goal-empty__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.goal-empty__copy {
    margin: 0;
    max-width: 52ch;
    line-height: 1.55;
}

.goal-empty__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    min-height: 42px;
    padding: .72rem 1rem;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--accent-primary) 34%, rgba(148, 163, 184, 0.28));
    background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 12%, transparent), transparent 58%),
        radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 10%, transparent), transparent 62%),
        color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
    color: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    font-size: .9rem;
    font-weight: 800;
    text-decoration: none;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.38), 0 10px 22px rgba(15, 23, 42, 0.12);
    transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease;
}

@media (hover: hover) {
    .goal-empty__cta:hover {
        transform: translateY(-1px);
        border-color: color-mix(in srgb, var(--accent-primary) 58%, rgba(148, 163, 184, 0.24));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.42), 0 14px 28px rgba(15, 23, 42, 0.16);
        background:
            radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 58%),
            radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 12%, transparent), transparent 62%),
            color-mix(in srgb, var(--bg-card) 96%, #020617 4%);
    }
}

.goal-empty__cta:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent-primary) 24%, transparent);
    outline-offset: 3px;
}

html.dark-mode .goal-item {
    background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
    border-color: rgba(148, 163, 184, 0.45);
    box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
}

@media (hover: hover) {
    .goal-item:hover {
        transform: translateY(-3px) scale(1.01);
        box-shadow: 0 22px 48px rgba(15, 23, 42, 0.34);
        border-color: rgba(129, 140, 248, 0.7);
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
    }
}

html.dark-mode .goals-progress-eyebrow,
html.dark-mode .goal-item-head p,
html.dark-mode .goal-empty,
html.dark-mode .goal-stat-card__eyebrow,
html.dark-mode .goal-stat-card__caption {
    color: #cbd5e1;
}

html.dark-mode .goal-empty__cta {
    color: #e5eefb;
    border-color: color-mix(in srgb, var(--accent-primary) 42%, rgba(148, 163, 184, 0.28));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 14px 28px rgba(0, 0, 0, 0.24);
}

@media (max-width: 720px) {
    .goal-empty {
        grid-template-columns: 1fr;
        align-items: stretch;
    }

    .goal-empty__actions {
        justify-content: flex-start;
    }

    .goal-empty__cta {
        width: 100%;
    }
}

html.dark-mode .goal-type-chip {
    background: rgba(96, 165, 250, 0.16);
    color: #bfdbfe;
}

html.dark-mode .goal-hero {
    background: linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 12px 26px rgba(0, 0, 0, 0.28);
}

html.dark-mode .goal-hero__value strong,
html.dark-mode .goal-stats strong {
    color: #f8fafc;
}

html.dark-mode .goal-item-head__context,
html.dark-mode .goal-meta-pill {
    color: #cbd5e1;
}

html.dark-mode .goal-stat-card {
    background: color-mix(in srgb, var(--bg-card) 94%, #10182f 6%);
    border-color: rgba(148, 163, 184, 0.4);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04), 0 12px 26px rgba(0, 0, 0, 0.18);
}

html.dark-mode .goal-stat-card--current {
    background:
        radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
}

html.dark-mode .goal-stat-card--target {
    background:
        radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 38%),
        linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 94%, #10182f 6%), color-mix(in srgb, var(--bg-secondary) 82%, #020617 18%));
}

@media (max-width: 720px) {
    .goals-progress-head,
    .goal-item-head {
        flex-direction: column;
    }

    .goal-stats {
        grid-template-columns: 1fr;
    }

    .goal-hero {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    .goal-item {
        transition: none;
    }
}
</style>
