<template>
    <DashboardCard title="Zielgewicht"
                   :info="goalDisplay"
                   :muted="goalKg == null"
                   :compact="compact"
                   clickable
                   @click="openGoalPopup">
        <AnimatedReelValue
            v-if="goalKg != null"
            :text="goalDisplay"
            :muted="goalKg == null"
            :animate-from="goalAnimationFrom"
            :animate-to="goalAnimationTo"
            :animate-nonce="goalAnimationNonce"
            :jump-nonce="goalJumpNonce" />
    </DashboardCard>

    <GoalPopup :show="showGoalPopup"
               v-model="newGoalDisplay"
               :placeholder="unit === 'kg' ? 'Ziel in kg' : 'Ziel in lbs'"
               :validate="validateGoal"
               :is-dirty="isGoalDirty"
               :allow-reset="true"
               @save="saveGoal"
               @reset="resetGoal"
               @cancel="closeGoalPopup" />
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import AnimatedReelValue from '@/components/ui/progress/AnimatedReelValue.vue'
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
        (e: 'saved', payload: { goalKg: number | null }): void
        (e: 'invalid', errors: string[]): void
    }>()

    const showGoalPopup = ref(false)
    const newGoalDisplay = ref<number | null>(null)
    const goalAnimationFrom = ref<string | null>(null)
    const goalAnimationTo = ref<string | null>(null)
    const goalAnimationNonce = ref(0)
    const goalJumpNonce = ref(0)
    const openedGoalDisplay = ref<string | null>(null)

    const goalDisplay = computed(() =>
        props.goalKg != null ? props.formatWeight(props.goalKg, 1) : 'Kein Ziel gesetzt'
    )

    const openedGoalValue = computed<number | null>(() =>
        props.goalKg != null ? props.kgToDisplay(props.goalKg) : null
    )

    const isGoalDirty = computed(() => {
        const opened = openedGoalValue.value
        const current = newGoalDisplay.value
        if (opened == null && current == null) return false
        if (opened == null || current == null) return true
        return Math.abs(opened - current) > 0.0001
    })

    const validateGoal = (display: number | null): string | null => {
        if (display === null || Number.isNaN(display)) return 'Zielgewicht muss eine Zahl sein'
        if (display <= 0) return 'Zielgewicht muss größer als 0 sein'
        const kg = props.displayToKg(Number(display))
        if (kg > 200) return 'Zielgewicht darf maximal 200 kg sein'
        return null
    }

    const openGoalPopup = () => {
        newGoalDisplay.value = openedGoalValue.value
        openedGoalDisplay.value = goalDisplay.value
        showGoalPopup.value = true
    }

    const closeGoalPopup = (triggerJump = true) => {
        const unchangedDisplay = openedGoalDisplay.value !== null
            && newGoalDisplay.value !== null
            && props.formatWeight(props.displayToKg(Number(newGoalDisplay.value)), 1) === openedGoalDisplay.value

        if (triggerJump && unchangedDisplay) goalJumpNonce.value += 1

        showGoalPopup.value = false
        newGoalDisplay.value = null
        openedGoalDisplay.value = null
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

            const nextDisplay = props.formatWeight(goalKg, 1)
            if (goalDisplay.value === nextDisplay) {
                goalJumpNonce.value += 1
            } else {
                goalAnimationFrom.value = goalDisplay.value
                goalAnimationTo.value = nextDisplay
                goalAnimationNonce.value += 1
            }

            emit('update:goalKg', goalKg)
            emit('saved', { goalKg })
            closeGoalPopup(false)
        } catch (e) {
            emit('invalid', ['Zielgewicht konnte nicht gespeichert werden.'])
        }
    }

    const resetGoal = async () => {
        try {
            await weightStore.setGoal(null)
            emit('update:goalKg', null)
            emit('saved', { goalKg: null })
            closeGoalPopup(false)
        } catch (e) {
            emit('invalid', ['Zielgewicht konnte nicht zurückgesetzt werden.'])
        }
    }
</script>
