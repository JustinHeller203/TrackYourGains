<!--components/ui/progress/ProgressWeightCard.vue -->

<template>
    <DashboardCard :title="t('progress.weight.title')"
                   :info="currentWeightDisplay"
                   :muted="!weightHistory?.length"
                   :compact="compact"
                   clickable
                   @click="openWeightPopup">
        <AnimatedReelValue
            v-if="weightHistory?.length"
            :text="currentWeightDisplay"
            :muted="!weightHistory?.length"
            :animate-from="weightAnimationFrom"
            :animate-to="weightAnimationTo"
            :animate-nonce="weightAnimationNonce"
            :jump-nonce="weightJumpNonce" />
    </DashboardCard>

    <WeightPopup :show="showWeightPopup"
                 v-model="newWeightDisplay"
                 :placeholder="unit === 'kg' ? t('progress.weight.placeholderKg') : t('progress.weight.placeholderLbs')"
                 :validate="validateWeight"
                 :is-dirty="isWeightDirty"
                 :allow-reset="true"
                 @save="saveWeight"
                 @reset="resetWeight"
                 @cancel="closeWeightPopup" />
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import AnimatedReelValue from '@/components/ui/progress/AnimatedReelValue.vue'
    import WeightPopup from '@/components/ui/popups/WeightPopup.vue'
    import { useWeightStore } from '@/store/weightStore'
    import { useI18n } from '@/composables/useI18n'

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
        (e: 'saved', payload: { weightKg: number | null; weightDisplay: number | null; date: string | null }): void
        (e: 'invalid', errors: string[]): void
    }>()

    const showWeightPopup = ref(false)
    const newWeightDisplay = ref<number | null>(null)
    const weightAnimationFrom = ref<string | null>(null)
    const weightAnimationTo = ref<string | null>(null)
    const weightAnimationNonce = ref(0)
    const weightJumpNonce = ref(0)
    const openedWeightDisplay = ref<string | null>(null)
    const { t } = useI18n()

    const currentWeightDisplay = computed(() =>
        props.weightHistory?.length
            ? props.formatWeight(props.weightHistory[0].weight, 1)
            : t('progress.weight.noWeight')
    )

    const latestRecordedWeightDisplay = computed<number | null>(() =>
        props.weightHistory?.length ? props.kgToDisplay(props.weightHistory[0].weight) : null
    )

    const isWeightDirty = computed(() => {
        const opened = latestRecordedWeightDisplay.value
        const current = newWeightDisplay.value
        if (opened == null && current == null) return false
        if (opened == null || current == null) return true
        return Math.abs(opened - current) > 0.0001
    })

    const openWeightPopup = () => {
        newWeightDisplay.value = latestRecordedWeightDisplay.value ?? null
        openedWeightDisplay.value = currentWeightDisplay.value
        showWeightPopup.value = true
    }

    const closeWeightPopup = (triggerJump = true) => {
        const unchangedDisplay = openedWeightDisplay.value !== null
            && newWeightDisplay.value !== null
            && props.formatWeight(props.displayToKg(Number(newWeightDisplay.value)), 1) === openedWeightDisplay.value

        if (triggerJump && unchangedDisplay) weightJumpNonce.value += 1

        showWeightPopup.value = false
        newWeightDisplay.value = null
        openedWeightDisplay.value = null
    }

    const validateWeight = (display: number | null): string | null => {
        if (display === null || Number.isNaN(display)) return t('progress.weight.validation.number')
        if (display <= 0) return t('progress.weight.validation.min')
        const kg = props.displayToKg(Number(display))
        if (kg > 200) return t('progress.weight.validation.max')
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

            const nextDisplay = props.formatWeight(weightKg, 1)
            if (currentWeightDisplay.value === nextDisplay) {
                weightJumpNonce.value += 1
            } else {
                weightAnimationFrom.value = currentWeightDisplay.value
                weightAnimationTo.value = nextDisplay
                weightAnimationNonce.value += 1
            }

            emit('update:weightHistory', updated)
            emit('saved', { weightKg, weightDisplay: props.kgToDisplay(weightKg), date: dateIso })
            closeWeightPopup(false)
        } catch (e) {
            emit('invalid', [t('progress.weight.saveFailed')])
        }
    }
    const resetWeight = async () => {
        try {
            await weightStore.clearAllEntries()
            emit('update:weightHistory', [])
            emit('saved', { weightKg: null, weightDisplay: null, date: null })
            closeWeightPopup(false)
        } catch (e) {
            emit('invalid', [t('progress.weight.resetFailed')])
        }
    }

    defineExpose({
        openWeightPopup,
    })
</script>
