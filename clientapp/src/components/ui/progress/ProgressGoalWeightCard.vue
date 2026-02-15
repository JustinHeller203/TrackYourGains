<template>
    <DashboardCard title="Zielgewicht"
                   :info="goalDisplay"
                   :compact="compact"
                   clickable
                   @click="openGoalPopup" />

    <GoalPopup :show="showGoalPopup"
               v-model="newGoalDisplay"
               :placeholder="unit === 'kg' ? 'Ziel in kg' : 'Ziel in lbs'"
               @save="saveGoal"
               @cancel="closeGoalPopup" />
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import GoalPopup from '@/components/ui/popups/GoalPopup.vue'
    import { LS_PROGRESS_GOAL } from '@/constants/storageKeys'
    import { useWeightStore } from '@/store/weightStore'
    const props = defineProps<{
        unit: 'kg' | 'lbs'
        compact?: boolean
        goalKg: number | null
        formatWeight: (kg: number, decimals: number) => string
        kgToDisplay: (kg: number) => number
        displayToKg: (display: number) => number
    }>()

    const emit = defineEmits<{
        (e: 'update:goalKg', v: number | null): void
        (e: 'saved', payload: { goalKg: number }): void
        (e: 'invalid', errors: string[]): void
    }>()

    const showGoalPopup = ref(false)
    const newGoalDisplay = ref<number | null>(null)

    const goalDisplay = computed(() =>
        props.goalKg != null ? props.formatWeight(props.goalKg, 1) : 'Kein Ziel gesetzt'
    )

    const validateGoal = (display: number | null): string | null => {
        if (display === null || Number.isNaN(display)) return 'Zielgewicht muss eine Zahl sein'
        if (display <= 0) return 'Zielgewicht muss größer als 0 sein'
        const kg = props.displayToKg(Number(display))
        if (kg > 200) return 'Zielgewicht darf maximal 200 kg sein'
        return null
    }

    const openGoalPopup = () => {
        newGoalDisplay.value = props.goalKg != null ? props.kgToDisplay(props.goalKg) : null
        showGoalPopup.value = true
    }

    const closeGoalPopup = () => {
        showGoalPopup.value = false
        newGoalDisplay.value = null
    }



    // ADD:
    const weightStore = useWeightStore()

    // REPLACE saveGoal with:
    const saveGoal = async () => {
        const error = validateGoal(newGoalDisplay.value)
        if (error) {
            emit('invalid', [error])
            return
        }

        const goalKg = props.displayToKg(Number(newGoalDisplay.value))

        try {
            await weightStore.setGoal(goalKg)

            emit('update:goalKg', goalKg)
            emit('saved', { goalKg })
            closeGoalPopup()
        } catch (e) {
            emit('invalid', ['Zielgewicht konnte nicht gespeichert werden.'])
        }
    }
</script>
