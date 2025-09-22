<!-- src/components/ui/calculators/WaterCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Wasserbedarfsrechner' }}
                <InfoHover :text="headerInfoText" />
            </h3>

            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzufügen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <div class="input-group">
            <label>
                Körpergewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})
            </label>
            <input :value="weightInputValue"
                   @input="onWeightInput"
                   type="number"
                   :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                   class="edit-input"
                   step="any"
                   min="0" />
        </div>

        <div class="input-group">
            <label class="label-with-info">
                Aktivitätslevel
                <InfoHover :text="activityInfoText" />
            </label>
            <select :value="activity" @change="onActivityChange" class="edit-input">
                <option value="low">Niedrig (kein Sport)</option>
                <option value="moderate">Moderat (1–3x/Woche)</option>
                <option value="high">Hoch (4–7x/Woche)</option>
            </select>
        </div>

        <div class="input-group">
            <label class="label-with-info">
                Klima
                <InfoHover :text="climateInfoText" />
            </label>
            <select :value="climate" @change="onClimateChange" class="edit-input">
                <option value="temperate">Gemäßigt</option>
                <option value="hot">Heiß</option>
                <option value="very_hot">Sehr heiß</option>
            </select>
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result !== null" class="result">
            <div class="result-header">
                <p><strong>Täglicher Wasserbedarf:</strong> {{ result!.toFixed(1) }} Liter</p>
                <CopyButton @click="$emit('copy')" />
            </div>
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
    import { computed } from 'vue'
    import InfoHover from '@/components/ui/InfoHover.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type Activity = 'low' | 'moderate' | 'high'
    type Climate = 'temperate' | 'hot' | 'very_hot'

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        waterWeight: number | null
        waterActivity: Activity
        waterClimate: Climate
        waterResult: number | null
        isFavorite: boolean
        title?: string
        /** Optional: überschreibt den Standardtext im Header-InfoHover */
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:waterWeight', v: number | null): void
        (e: 'update:waterActivity', v: Activity): void
        (e: 'update:waterClimate', v: Climate): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    const weight = computed(() => props.waterWeight)
    const activity = computed(() => props.waterActivity)
    const climate = computed(() => props.waterClimate)
    const result = computed(() => props.waterResult)

    const weightInputValue = computed(() =>
        weight.value === null || Number.isNaN(weight.value) ? '' : String(weight.value)
    )

    /** InfoHover-Texte (Header & Feld-Hilfen) – Header kann via prop.info überschrieben werden */
    const headerInfoText = computed(
        () =>
            props.info ??
            'Schätzt den täglichen Wasserbedarf basierend auf Gewicht, Aktivität und Klima. Richtwerte, keine medizinische Beratung.'
    )
    const activityInfoText =
        'Mehr Aktivität ⇒ höherer Bedarf (Schweißverluste). Wähle dein typisches Wochenpensum.'
    const climateInfoText =
        'Heiß/Sehr heiß ⇒ mehr trinken (höhere Verdunstung/Schweiß). Gemäßigt für normale Bedingungen.'

    function maybeAutoCalc() {
        if (props.autoCalcEnabled) emit('calculate')
    }

    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        const n = raw === '' ? null : Number(raw)
        emit('update:waterWeight', raw === '' || Number.isNaN(n) ? null : n)
        maybeAutoCalc()
    }
    function onActivityChange(e: Event) {
        emit('update:waterActivity', (e.target as HTMLSelectElement).value as Activity)
        maybeAutoCalc()
    }
    function onClimateChange(e: Event) {
        emit('update:waterClimate', (e.target as HTMLSelectElement).value as Climate)
        maybeAutoCalc()
    }
</script>

<style scoped>
    /* Minimal – gemeinsame Card/Form-Styles kommen global */
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

    .label-with-info {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
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
