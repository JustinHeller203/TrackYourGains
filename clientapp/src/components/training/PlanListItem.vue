<!-- src/components/training/PlanListItem.vue -->
<template>
    <div class="list-item plan-item">
        <span class="plan-drag-handle" title="Ziehen zum Verschieben">⠿</span>

        <span @click="$emit('open', plan.id)" @dblclick="$emit('edit', plan.id)">
            {{ plan.name }} ({{ plan.exercises.length }} Übungen)
        </span>

        <div class="list-item-actions">
            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzufügen'"
                            @toggle="$emit('toggle-favorite', plan.id)" />
            <button class="edit-btn" @click="$emit('edit', plan.id)">✏️</button>
            <button class="delete-btn" @click="$emit('delete', plan.id)">🗑️</button>
            <button class="download-btn" @click="$emit('download', plan)">⬇️</button>
            <button class="open-btn" @click="$emit('open', plan.id)">Öffnen</button>
        </div>
    </div>
</template>

<script setup lang="ts">
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'

    interface PlanExercise { exercise: string; sets: number; reps: number; goal?: string }
    interface TrainingPlan { id: string; name: string; exercises: PlanExercise[] }

    defineProps<{
        plan: TrainingPlan
        isFavorite: boolean
    }>()

    defineEmits<{
        (e: 'toggle-favorite', id: string): void
        (e: 'edit', id: string): void
        (e: 'delete', id: string): void
        (e: 'download', plan: TrainingPlan): void
        (e: 'open', id: string): void
    }>()
</script>

<style scoped>
    /* — exakt wie in deiner Training.vue — */
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

        .list-item:hover {
            transform: translateY(-2px);
        }

    .plan-item {
        cursor: pointer;
    }

    .plan-drag-handle {
        cursor: grab;
        margin-right: .5rem;
        user-select: none;
    }

    .list-item-actions {
        display: flex;
        gap: 0.5rem;
    }

    .edit-btn,
    .delete-btn,
    .download-btn,
    .open-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.5rem;
        color: #6b7280;
        border-radius: 8px;
        transition: color 0.2s, text-shadow 0.2s, transform 0.1s;
    }

        .edit-btn:hover {
            color: #F59E0B;
            text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
            transform: scale(1.1);
        }

        .delete-btn:hover {
            color: #7f1d1d;
            text-shadow: 0 0 8px rgba(127, 29, 29, 0.5), 0 0 4px rgba(127, 29, 29, 0.5);
            transform: scale(1.1);
        }

        .download-btn:hover {
            color: #5a7bc4;
            text-shadow: 0 0 8px #5a7bc4, 0 0 4px #5a7bc4;
            transform: scale(1.1);
        }

    .open-btn {
        color: #10b981;
    }

        .open-btn:hover {
            color: #064e3b;
            text-shadow: 0 0 8px rgba(6, 78, 59, 0.5), 0 0 4px rgba(6, 78, 59, 0.5);
            transform: scale(1.1);
        }

    /* Dark Mode – identisch zu dir */
    html.dark-mode .list-item {
        background: #1c2526;
        color: #c9d1d9;
    }

    html.dark-mode .edit-btn:hover {
        color: #F59E0B;
        text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
    }

    html.dark-mode .delete-btn:hover {
        color: #7f1d1d;
        text-shadow: 0 0 8px #7f1d1d, 0 0 4px #7f1d1d;
    }

    html.dark-mode .download-btn:hover {
        color: #5a7bc4;
        text-shadow: 0 0 8px #5a7bc4, 0 0 4px #5a7bc4;
    }

    html.dark-mode .open-btn {
        color: #10b981;
    }

        html.dark-mode .open-btn:hover {
            color: #10b981;
            text-shadow: 0 0 8px #10b981, 0 0 4px #10b981;
        }
</style>
