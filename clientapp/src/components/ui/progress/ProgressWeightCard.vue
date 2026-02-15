<!--components/ui/progress/ProgressWeightCard.vue -->

<template>
    <DashboardCard title="Aktuelles Gewicht"
                   :info="currentWeightDisplay"
                   :muted="!weightHistory?.length"
                   :compact="compact"
                   clickable
                   @click="openWeightPopup" />

    <WeightPopup :show="showWeightPopup"
                 v-model="newWeightDisplay"
                 :placeholder="unit === 'kg' ? 'Gewicht in kg' : 'Gewicht in lbs'"
                 @save="saveWeight"
                 @cancel="closeWeightPopup" />
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import WeightPopup from '@/components/ui/popups/WeightPopup.vue'
    import { LS_PROGRESS_WEIGHTS } from '@/constants/storageKeys'

    import { useWeightStore } from '@/store/weightStore' // <- pass ggf. Pfad an (bei dir heißt es useWeightStore)

    type WeightEntry = { date: string; weight: number } // weight in KG

    const props = defineProps<{
        unit: 'kg' | 'lbs'
        compact?: boolean
        weightHistory: WeightEntry[]
        formatWeight: (kg: number, decimals: number) => string
        kgToDisplay: (kg: number) => number
        displayToKg: (display: number) => number
    }>()

    const emit = defineEmits<{
        (e: 'update:weightHistory', v: WeightEntry[]): void
        (e: 'saved', payload: { weightKg: number; weightDisplay: number; date: string }): void
        (e: 'invalid', errors: string[]): void
    }>()

    const showWeightPopup = ref(false)
    const newWeightDisplay = ref<number | null>(null)

    const currentWeightDisplay = computed(() =>
        props.weightHistory?.length
            ? props.formatWeight(props.weightHistory[0].weight, 1)
            : 'Kein Gewicht erfasst'
    )

    const latestRecordedWeightDisplay = computed<number | null>(() =>
        props.weightHistory?.length ? props.kgToDisplay(props.weightHistory[0].weight) : null
    )

    const openWeightPopup = () => {
        newWeightDisplay.value = latestRecordedWeightDisplay.value ?? null
        showWeightPopup.value = true
    }

    const closeWeightPopup = () => {
        showWeightPopup.value = false
        newWeightDisplay.value = null
    }

    const validateWeight = (display: number | null): string | null => {
        if (display === null || Number.isNaN(display)) return 'Gewicht muss eine Zahl sein'
        if (display <= 0) return 'Körpergewicht muss größer als 0 sein'
        const kg = props.displayToKg(Number(display))
        if (kg > 200) return 'Gewicht darf maximal 200 kg sein'
        return null
    }

   
    // ADD (nach defineEmits oder vor saveWeight):
    const weightStore = useWeightStore()

    // REPLACE function saveWeight with:
    const saveWeight = async () => {
        const error = validateWeight(newWeightDisplay.value)
        if (error) {
            emit('invalid', [error])
            return
        }

        const dateIso = new Date().toISOString()
        const weightKg = props.displayToKg(Number(newWeightDisplay.value))

        try {
            await weightStore.addEntry(weightKg, dateIso)

            const updated: WeightEntry[] = [
                { date: dateIso, weight: weightKg },
                ...(props.weightHistory ?? []),
            ]

            emit('update:weightHistory', updated)
            emit('saved', { weightKg, weightDisplay: props.kgToDisplay(weightKg), date: dateIso })
            closeWeightPopup()
        } catch (e) {
            emit('invalid', ['Körpergewicht konnte nicht gespeichert werden.'])
        }
    }
</script>
