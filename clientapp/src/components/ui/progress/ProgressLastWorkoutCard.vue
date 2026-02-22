<template>
    <DashboardCard title="Letztes Training"
                   :info="lastWorkoutText"
                   :muted="!hasWorkout"
                   :compact="compact" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardCard from '@/components/ui/DashboardCard.vue'

type WorkoutType = 'kraft' | 'calisthenics' | 'dehnung' | 'ausdauer'

type Workout = {
    date: string
    exercise: string
    type?: WorkoutType
    durationMin?: number | null
    distanceKm?: number | null
    sets: number
    reps?: number
    weight: number
}

const props = defineProps<{
    workouts: Workout[]
    compact?: boolean
    formatWeight: (kg: number, decimals: number) => string
}>()

const hasWorkout = computed(() => Array.isArray(props.workouts) && props.workouts.length > 0)

const lastWorkoutText = computed(() => {
    if (!hasWorkout.value) return 'Kein Training erfasst'

    const last = props.workouts.reduce((a, b) =>
        new Date(a.date) > new Date(b.date) ? a : b
    )

    return last.exercise
})
</script>
