<!-- components/training/PlanExercisesTable.vue -->
<template>
    <div class="exercise-table full-width">
        <table>
            <thead>
                <tr>
                    <th>Übung</th>
                    <th>Sätze</th>
                    <th>Wiederholungen</th>
                    <th>Aktion</th>
                    <th v-if="showGoalFinal">Trainingsziel</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(ex, idx) in items"
                    :key="idx"
                    @dblclick="$emit('edit-cell', idx, $event)">
                    <td>{{ ex.exercise }}</td>
                    <td>{{ ex.sets }}</td>
                    <td>{{ ex.reps }}</td>
                    <td>
                        <button type="button"
                                class="delete-btn"
                                title="Übung entfernen"
                                @click="$emit('remove', idx)">
                            🗑️
                        </button>
                    </td>
                    <td v-if="showGoalFinal">{{ ex.goal || '-' }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface PlanExercise {
  exercise: string;
  sets: number;
  reps: number;
  goal?: string;
}

const props = defineProps<{
  items: PlanExercise[];
  /** Optional: wenn nicht gesetzt, wird automatisch angezeigt, wenn mind. 1 Übung ein goal hat */
  showGoal?: boolean;
}>();

defineEmits<{
  (e: 'remove', idx: number): void;
  (e: 'edit-cell', idx: number, ev: MouseEvent): void;
}>();

const showGoalFinal = computed(() =>
  props.showGoal ?? props.items.some(e => !!e.goal)
);
</script>

<style scoped>
    .exercise-table {
        width: 100%;
        margin-top: 1rem;
        border-radius: 8px;
        overflow: hidden;
        background: var(--bg-card);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

        .exercise-table table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .exercise-table th,
        .exercise-table td {
            padding: 0.75rem 1rem;
            text-align: center;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.95rem;
        }

        .exercise-table th {
            background: #f1f5f9;
            font-weight: 600;
            color: var(--text-primary);
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
        background: #e2e8f0;
    }

    html.dark-mode .exercise-table tr:hover {
        background: #2d333b;
    }

    .exercise-table td {
        color: var(--text-secondary);
    }

    html.dark-mode .exercise-table td {
        color: #c9d1d9;
    }

    .delete-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.1rem;
        color: #ef4444;
        transition: transform 0.2s ease;
    }

        .delete-btn:hover {
            transform: scale(1.2);
        }
</style>
