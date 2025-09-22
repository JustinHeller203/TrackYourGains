<!-- src/components/ui/calculators/FfmiCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'FFMI-Rechner' }}
                <InfoHover :text="infoText" />
            </h3>

            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzufügen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <div class="input-group">
            <label>Gewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
            <input :value="weight ?? ''"
                   @input="onWeightInput"
                   type="number"
                   :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label>Größe (cm)</label>
            <input :value="height ?? ''"
                   @input="onHeightInput"
                   type="number"
                   placeholder="z.B. 175"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label>Körperfettanteil (%)</label>
            <input :value="bodyFat ?? ''"
                   @input="onBodyFatInput"
                   type="number"
                   placeholder="z.B. 15"
                   class="edit-input" />
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result" class="result">
            <div class="result-header">
                <p><strong>FFMI:</strong> {{ result.value.toFixed(1) }}</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <p>Kategorie: {{ result.category }}</p>
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
    interface FfmiResult { value: number; category: string }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        ffmiWeight: number | null
        ffmiHeight: number | null
        ffmiBodyFat: number | null
        ffmiResult: FfmiResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:ffmiWeight', v: number | null): void
        (e: 'update:ffmiHeight', v: number | null): void
        (e: 'update:ffmiBodyFat', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    const weight = computed(() => props.ffmiWeight)
    const height = computed(() => props.ffmiHeight)
    const bodyFat = computed(() => props.ffmiBodyFat)
    const result = computed(() => props.ffmiResult)

    const infoText = computed(
        () =>
            props.info ??
            'FFMI (Fat-Free Mass Index) schätzt fettfreie Masse relativ zur Körpergröße und ist robuster als der BMI.'
    )

    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:ffmiWeight', raw === '' ? null : Number(raw))
    }
    function onHeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:ffmiHeight', raw === '' ? null : Number(raw))
    }
    function onBodyFatInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:ffmiBodyFat', raw === '' ? null : Number(raw))
    }
</script>

<style scoped>
    /* Card */
    .calculator-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: transform .3s, box-shadow .3s, border-color .3s;
        color: var(--text-primary);
        font-family: inherit;
    }

        .calculator-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
            border-color: var(--accent-primary);
        }

    /* Header */
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
        color: var(--text-primary);
    }

    /* Inputs */
    .input-group {
        margin-bottom: 1rem;
    }

        .input-group label {
            display: block;
            font-size: .9rem;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: .25rem;
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

    /* Result */
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

    /* Footer */
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
