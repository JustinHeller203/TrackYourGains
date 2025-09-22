<!-- src/components/ui/calculators/ProteinCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Proteinbedarf-Rechner' }}
                <InfoHover v-if="infoToShow" :text="infoToShow" />
            </h3>

            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzufügen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <!-- Körpergewicht -->
        <div class="input-group">
            <label>Körpergewicht ({{ unitNormalized === 'kg' ? 'kg' : 'lbs' }})</label>
            <input :value="weightInputValue"
                   @input="onWeightInput"
                   type="number"
                   :placeholder="unitNormalized === 'kg' ? 'z. B. 75' : 'z. B. 165'"
                   class="edit-input"
                   step="any"
                   min="0" />
        </div>

        <!-- Ziel -->
        <div class="input-group">
            <label>Ziel</label>
            <select :value="goal" @change="onGoalChange" class="edit-input">
                <option value="cut">Fettverlust</option>
                <option value="maintain">Gewicht halten</option>
                <option value="bulk">Muskelaufbau</option>
            </select>
        </div>

        <!-- Aktivität -->
        <div class="input-group">
            <label>Aktivität</label>
            <select :value="activityEffective" @change="onActivityChange" class="edit-input">
                <option value="low">Niedrig</option>
                <option value="moderate">Moderat</option>
                <option value="high">Hoch</option>
            </select>
        </div>

        <!-- Optional: Mahlzeiten -->
        <div class="input-group">
            <label>Anzahl Mahlzeiten/Tag (optional)</label>
            <input :value="mealsInputValue"
                   @input="onMealsInput"
                   type="number"
                   placeholder="z. B. 3"
                   class="edit-input"
                   min="1"
                   step="1" />
            <p class="hint">Wenn gesetzt, zeigen wir zusätzlich g pro Mahlzeit.</p>
        </div>

        <!-- Manuelles Berechnen -->
        <CalculateButton v-if="!autoCalcEnabled" @click="onCalculateClick" />

        <!-- Ergebnis -->
        <div v-if="hasValidResult" class="result">
            <div class="result-header">
                <p>
                    <strong>Empfehlung/Tag:</strong>
                    {{ roundedGramsPerDay }} g
                    <span v-if="hasValidFactor">({{ formattedFactor }} g/kg)</span>
                </p>
                <CopyButton @click="$emit('copy')" />
            </div>

            <p v-if="showGramsPerMeal" class="result-sub">
                ≈ {{ roundedGramsPerMeal }} g pro Mahlzeit (bei {{ meals }} Mahlzeiten/Tag)
            </p>
        </div>

        <div class="card-footer">
            <div class="footer-spacer"></div>
            <div class="footer-actions">
                <ExportButton @click="$emit('export')" />
                <ResetButton @click="$emit('reset')" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import InfoHover from '@/components/ui/InfoHover.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type Goal = 'maintain' | 'bulk' | 'cut'
    type Activity = 'low' | 'moderate' | 'high'

    interface ProteinResult {
        recommend: number
        factor: number
        weightDisplay?: string
    }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        proteinWeight: number | null
        proteinGoal: Goal
        proteinActivity: Activity | null
        proteinMeals: number | null
        proteinResult?: ProteinResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:proteinWeight', v: number | null): void
        (e: 'update:proteinGoal', v: Goal): void
        (e: 'update:proteinActivity', v: Activity): void
        (e: 'update:proteinMeals', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    /* ==== Helpers ==== */
    const LBS_TO_KG = 0.45359237
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    const unitNormalized = computed<'kg' | 'lbs'>(() => {
        const u = String(props.unit || 'kg').toLowerCase()
        return u === 'lb' || u === 'lbs' ? 'lbs' : 'kg'
    })

    /** Fallback: immer gültige Aktivität */
    const activityEffective = computed<Activity>(() => {
        const a = (props.proteinActivity as Activity | null) ?? null
        return a === 'low' || a === 'moderate' || a === 'high' ? a : 'moderate'
    })

    function proteinFactor(goal: Goal, activity: Activity): number {
        let base = goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : 1.6
        const delta = activity === 'low' ? -0.2 : activity === 'high' ? 0.3 : 0.0
        return clamp(base + delta, 1.2, 2.7)
    }

    function computeLocalResult(): ProteinResult | null {
        const w = props.proteinWeight
        if (w == null || !Number.isFinite(w) || w <= 0) return null
        const weightKg = unitNormalized.value === 'kg' ? w : w * LBS_TO_KG
        const factor = proteinFactor(props.proteinGoal, activityEffective.value)
        const recommend = weightKg * factor
        return { recommend, factor, weightDisplay: `${weightKg.toFixed(1)} kg` }
    }

    /* Lokaler Fallback */
    const internalResult = ref<ProteinResult | null>(null)

    /* Auto-Recompute */
    watch(
        () => [props.proteinWeight, props.proteinGoal, activityEffective.value, unitNormalized.value],
        () => {
            if (props.autoCalcEnabled) internalResult.value = computeLocalResult()
        },
        { immediate: true }
    )

    /* Ergebnis-Priorität:
       - autoCalcEnabled: nimm lokal (snappier UI)
       - sonst: nimm Parent, fallback lokal
    */
    const effectiveResult = computed<ProteinResult | null>(() => {
        return props.autoCalcEnabled
            ? (internalResult.value ?? props.proteinResult ?? null)
            : (props.proteinResult ?? internalResult.value ?? null)
    })

    /* ==== Bindings & Anzeige ==== */
    const goal = computed(() => props.proteinGoal)
    const meals = computed(() => props.proteinMeals ?? null)

    const weightInputValue = computed(() =>
        props.proteinWeight == null || Number.isNaN(props.proteinWeight) ? '' : String(props.proteinWeight)
    )
    const mealsInputValue = computed(() =>
        props.proteinMeals == null || Number.isNaN(props.proteinMeals) ? '' : String(props.proteinMeals)
    )

    const hasValidResult = computed(() =>
        !!effectiveResult.value && Number.isFinite(effectiveResult.value!.recommend) && effectiveResult.value!.recommend > 0
    )
    const hasValidFactor = computed(() =>
        !!effectiveResult.value && Number.isFinite(effectiveResult.value!.factor) && effectiveResult.value!.factor > 0
    )
    const showGramsPerMeal = computed(() => !!effectiveResult.value && !!props.proteinMeals && props.proteinMeals! >= 1)

    const roundedGramsPerDay = computed(() => (hasValidResult.value ? Math.round(effectiveResult.value!.recommend) : 0))
    const roundedGramsPerMeal = computed(() => {
        if (!showGramsPerMeal.value) return 0
        const perMeal = effectiveResult.value!.recommend / Number(props.proteinMeals)
        return Number.isFinite(perMeal) && perMeal > 0 ? Math.round(perMeal) : 0
    })
    const formattedFactor = computed(() => (hasValidFactor.value ? effectiveResult.value!.factor.toFixed(2) : ''))

    /* Info-Text */
    const infoToShow = computed(
        () => props.info ?? 'Berechnet g/Tag auf Basis von Gewicht, Ziel (Cut/Maintain/Bulk) und Aktivität. Einheiten (kg/lbs) werden automatisch berücksichtigt.'
    )

    /* ==== Events ==== */
    function onCalculateClick() {
        internalResult.value = computeLocalResult()
        emit('calculate')
    }
    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value.trim()
        const value = raw === '' ? null : Number(raw)
        emit('update:proteinWeight', raw === '' || Number.isNaN(value) ? null : value)
    }
    function onGoalChange(e: Event) {
        const val = (e.target as HTMLSelectElement).value as Goal
        emit('update:proteinGoal', (val ?? props.proteinGoal) as Goal)
    }
    function onActivityChange(e: Event) {
        const val = (e.target as HTMLSelectElement).value as Activity
        emit('update:proteinActivity', (val ?? activityEffective.value) as Activity)
    }
    function onMealsInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value.trim()
        if (raw === '') return emit('update:proteinMeals', null)
        const parsed = Number(raw)
        emit('update:proteinMeals', Number.isNaN(parsed) ? null : Math.max(1, Math.floor(parsed)))
    }
</script>

<style scoped>
    /* Bewusst nur die Teile, die nicht in globale Styles ausgelagert sind */
    .calculator-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: transform .3s, box-shadow .3s, border-color .3s;
        color: var(--text-primary);
    }

        .calculator-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
            border-color: var(--accent-primary);
        }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: .5rem;
    }

    .input-group {
        margin-bottom: 1rem;
    }

    .edit-input {
        width: 100%;
        padding: .75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: .9rem;
        transition: border-color .3s, box-shadow .3s;
    }

        .edit-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99,102,241,.5);
            outline: none;
        }

    .hint {
        margin-top: .4rem;
        font-size: .85rem;
        color: var(--text-secondary);
    }

    .result {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
    }

    .result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        margin-bottom: .35rem;
    }

    .result-sub {
        font-size: .95rem;
        color: var(--text-secondary);
    }

    .card-footer {
        border-top: 1px solid var(--border-color);
        padding: .75rem 1rem 0;
        display: flex;
        justify-content: flex-end;
        gap: .75rem;
        margin-top: .75rem;
    }

    .footer-spacer {
        flex: 1;
    }

    .footer-actions {
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
    }
</style>
