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

    if (last.type === 'ausdauer') {
        const dist = last.distanceKm != null ? `   ${last.distanceKm} km` : ''
        return `${last.exercise}   ${last.durationMin} Min${dist}`
    }

    if (last.type === 'dehnung') {
        const bits: string[] = []
        if (last.durationMin != null && Number.isFinite(last.durationMin)) bits.push(`${last.durationMin} Min`)
        if (last.sets && last.reps) bits.push(`${last.sets} ${last.reps}`)
        const tail = bits.length ? `   ${bits.join('   ')}` : ''
        return `${last.exercise}${tail}`
    }

    return `${last.exercise}   ${props.formatWeight(last.weight, 0)}   ${last.reps}`
})
</script>
