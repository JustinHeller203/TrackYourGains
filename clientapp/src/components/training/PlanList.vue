<template>
    <!-- Favoriten -->
    <Draggable v-if="favoritePlanItems.length"
               :modelValue="favoritePlanItems"
               item-key="id"
               handle=".plan-drag-handle"
               :ghost-class="'drag-ghost'"
               :animation="150"
               :disabled="reorderDisabled"
               tag="div"
               class="plan-drag-stack"
               @update:modelValue="val => emit('update:favoritePlanItems', val)">
        <template #item="{ element: plan }">
            <PlanListItem v-if="planMatchesSearch(plan)"
                          :plan="plan"
                          :isFavorite="favoriteIds.has(plan.id)"
                          @toggle-favorite="id => emit('toggle-favorite', id)"
                          @edit="id => emit('edit', id)"
                          @delete="id => emit('delete', id)"
                          @download="p => emit('download', p)"
                          @open="id => emit('open', id)" />
        </template>
    </Draggable>

    <!-- Nicht-Favoriten -->
    <Draggable :modelValue="otherPlanItems"
               item-key="id"
               handle=".plan-drag-handle"
               :ghost-class="'drag-ghost'"
               :animation="150"
               :disabled="reorderDisabled"
               tag="div"
               class="plan-drag-stack"
               @update:modelValue="val => emit('update:otherPlanItems', val)">
        <template #item="{ element: plan }">
            <PlanListItem v-if="planMatchesSearch(plan)"
                          :plan="plan"
                          :isFavorite="favoriteIds.has(plan.id)"
                          @toggle-favorite="id => emit('toggle-favorite', id)"
                          @edit="id => emit('edit', id)"
                          @delete="id => emit('delete', id)"
                          @download="p => emit('download', p)"
                          @open="id => emit('open', id)" />
        </template>
    </Draggable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Draggable from 'vuedraggable'
import PlanListItem from '@/components/training/PlanListItem.vue'

interface PlanExercise { exercise: string; sets: number; reps: number; goal?: string }
interface TrainingPlan { id: string; name: string; exercises: PlanExercise[] }

const props = defineProps<{
  favoritePlanItems: TrainingPlan[]
  otherPlanItems: TrainingPlan[]
  favoritePlans: string[]
  planSearch: string
}>()

const emit = defineEmits<{
  (e: 'update:favoritePlanItems', plans: TrainingPlan[]): void
  (e: 'update:otherPlanItems', plans: TrainingPlan[]): void
  (e: 'toggle-favorite', id: string): void
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'download', plan: TrainingPlan): void
  (e: 'open', id: string): void
}>()

const favoriteIds = computed(() => new Set(props.favoritePlans))
const reorderDisabled = computed(() => props.planSearch.trim().length > 0)

function planMatchesSearch(plan: TrainingPlan) {
  const q = props.planSearch.toLowerCase().trim()
  return !q
    || plan.name.toLowerCase().includes(q)
    || plan.exercises.some(ex => (ex.goal ?? '').toLowerCase().includes(q))
}
</script>

<style scoped>
    /* exakt wie in deiner Training.vue, damit die Abstände/Optik identisch bleiben */
    .plan-drag-stack {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
    }

    .drag-ghost {
        opacity: 0.6;
    }
</style>
