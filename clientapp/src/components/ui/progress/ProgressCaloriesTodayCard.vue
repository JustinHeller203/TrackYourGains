<template>
    <DashboardCard title="Kalorien heute"
                   :info="infoText"
                   :compact="compact" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardCard from '@/components/ui/DashboardCard.vue'

type Meal = { calories: number }

const props = defineProps<{
    meals: Meal[]
    compact?: boolean
    targetCalories?: number
}>()

const infoText = computed(() => {
    const total = (props.meals ?? []).reduce((sum, m) => sum + (Number(m?.calories) || 0), 0)
    const target = Number.isFinite(props.targetCalories) ? Number(props.targetCalories) : 2500
    return `${total} / ${target} kcal`
})
</script>
