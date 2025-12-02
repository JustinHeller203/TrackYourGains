<!-- src/components/ui/calculators/BmiCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'BMI-Rechner' }}
                <InfoHover v-if="info" :text="info" />
            </h3>

            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzufügen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <div class="input-group">
            <label>Geschlecht</label>
            <select :value="gender" @change="onGenderChange" class="edit-input">
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
            </select>
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

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="bmiResult" class="result">
            <div class="result-header">
                <p><strong>BMI:</strong> {{ bmiResult.value.toFixed(1) }}</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <p>Kategorie: {{ bmiResult.category }}</p>
        </div>

        <div class="card-footer">
            <div class="footer-actions">
                <ExportButton class="calc-footer-btn"
                              title="Exportieren"
                              aria-label="Exportieren"
                              data-short="Export"
                              @click="$emit('export')" />
                <ResetButton class="calc-footer-btn"
                             title="Zurücksetzen"
                             aria-label="Zurücksetzen"
                             data-short="Reset"
                             @click="$emit('reset')" />
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

    type Gender = 'male' | 'female'
    type Unit = 'kg' | 'lb' | 'lbs' | string

    interface BmiResult { value: number; category: string }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        bmiGender: Gender
        bmiWeight: number | null
        bmiHeight: number | null
        bmiResult: BmiResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:bmiGender', v: Gender): void
        (e: 'update:bmiWeight', v: number | null): void
        (e: 'update:bmiHeight', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    const gender = computed(() => props.bmiGender)
    const weight = computed(() => props.bmiWeight)
    const height = computed(() => props.bmiHeight)

    function onGenderChange(ev: Event) {
        emit('update:bmiGender', (ev.target as HTMLSelectElement).value as Gender)
    }
    function onWeightInput(ev: Event) {
        const raw = (ev.target as HTMLInputElement).value
        emit('update:bmiWeight', raw === '' ? null : Number(raw))
    }
    function onHeightInput(ev: Event) {
        const raw = (ev.target as HTMLInputElement).value
        emit('update:bmiHeight', raw === '' ? null : Number(raw))
    }
</script>

<style scoped>
    /* Basis-Styles, Tooltip-/Fav-Button-Styles entfernt (kommen aus InfoHover/FavoriteButton) */


    .calculator-card {
        position: relative;
        /* overflow entfernt, damit InfoHover-Tooltip nicht abgeschnitten wird */
        display: flex;
        flex-direction: column;
        align-items: stretch;
        text-align: left;
        padding: 1.6rem 1.8rem 1.1rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        gap: 0.75rem;
        color: var(--text-primary);
        transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 0.61, 0.36, 1), border-color 220ms ease-out, background 260ms ease-out;
        will-change: transform, box-shadow;
    }


    /* Hover nur auf Geräten mit Maus */
    @media (hover: hover) {
        .calculator-card:hover {
            /* nur noch verschieben, kein Scale -> Text bleibt scharf */
            transform: translateY(-4px);
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4);
            border-color: rgba(129, 140, 248, 0.7);
            background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
        }
    }

    /* Dark-Mode-Variante wie bei den DashboardCards */
    html.dark-mode .calculator-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Kleine Screens: etwas kompakter */
    @media (max-width: 600px) {
        .calculator-card {
            padding: 1.25rem 1.2rem 0.9rem;
            border-radius: 16px;
        }
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

        .input-group label {
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

    .edit-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: 0.9rem;
        transition: border-color .3s, box-shadow .3s;
    }

        .edit-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
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
        padding: 0.75rem 1rem 0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.75rem;
    }

    .footer-spacer {
        flex: 1;
    }

    .footer-actions {
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
    }

    @media (max-width: 600px) {
        .footer-actions {
            display: grid;
            grid-template-columns: 1fr 1fr; /* zwei gleich breite Buttons */
            gap: .5rem;
            width: 100%;
        }

        .calc-footer-btn {
            min-height: 44px; /* gutes Touch-Target */
            padding: .5rem .6rem;
        }
    }
</style>
