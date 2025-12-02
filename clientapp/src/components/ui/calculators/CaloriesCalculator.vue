<!-- src/components/ui/calculators/CaloriesCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Kalorienbedarfsrechner' }}
                <InfoHover :text="infoText" />
            </h3>

            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzufügen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <div class="input-group">
            <label>Alter (Jahre)</label>
            <input :value="age ?? ''"
                   @input="onAgeInput"
                   type="number"
                   placeholder="z.B. 30"
                   class="edit-input" />
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

        <div class="input-group">
            <label class="label-row">
                <span>Aktivitätslevel</span>
                <InfoHover :text="activityInfoText" />
            </label>
            <select :value="activity" @change="onActivityChange" class="edit-input">
                <option value="1.2">Sitzend</option>
                <option value="1.375">Leicht aktiv</option>
                <option value="1.55">Moderat aktiv</option>
                <option value="1.725">Sehr aktiv</option>
                <option value="1.9">Extrem aktiv</option>
            </select>
        </div>

        <div class="input-group">
            <label>Kalorienziel</label>
            <select :value="goal" @change="onGoalChange" class="edit-input">
                <option :value="0">Erhaltung</option>
                <option v-for="n in steps" :key="'surplus-'+n" :value="n">+{{ n }} kcal (Überschuss)</option>
                <option v-for="n in steps" :key="'deficit-'+n" :value="-n">-{{ n }} kcal (Defizit)</option>
            </select>
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result" class="result">
            <div class="result-header">
                <p><strong>Gesamtkalorienbedarf:</strong> {{ result.total.toFixed(0) }} kcal</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <ul class="result-list">
                <li>Kohlenhydrate (50%): {{ result.macros.carbs.toFixed(0) }} g</li>
                <li>Eiweiß (30%): {{ result.macros.protein.toFixed(0) }} g</li>
                <li>Fett (20%): {{ result.macros.fat.toFixed(0) }} g</li>
            </ul>
        </div>

        <!-- bleibt für dein updateMacroChart() -->
        <div v-if="result" class="chart-container">
            <canvas id="macroChart"></canvas>
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

    interface CalorieResult {
        total: number
        macros: { carbs: number; protein: number; fat: number }
    }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean

        calorieAge: number | null
        calorieGender: Gender
        calorieWeight: number | null
        calorieHeight: number | null
        calorieActivity: string
        calorieGoal: number

        calorieResult: CalorieResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:calorieAge', v: number | null): void
        (e: 'update:calorieGender', v: Gender): void
        (e: 'update:calorieWeight', v: number | null): void
        (e: 'update:calorieHeight', v: number | null): void
        (e: 'update:calorieActivity', v: string): void
        (e: 'update:calorieGoal', v: number): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    /* bindings */
    const age = computed(() => props.calorieAge)
    const gender = computed(() => props.calorieGender)
    const weight = computed(() => props.calorieWeight)
    const height = computed(() => props.calorieHeight)
    const activity = computed(() => props.calorieActivity)
    const goal = computed(() => props.calorieGoal)
    const result = computed(() => props.calorieResult)

    const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

    const infoText = computed(
        () => props.info ?? 'Berechnet Tagesbedarf aus Alter, Geschlecht, Größe, Gewicht und Aktivitätsfaktor; optional plus/minus Kalorienziel.'
    )
    const activityInfoText = 'Sitzend: wenig Bewegung • Leicht: 1–3×/Woche • Moderat: 3–5×/Woche • Sehr: 6–7×/Woche • Extrem: sehr harte, tägliche Aktivität'

    /* handlers */
    function onAgeInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:calorieAge', raw === '' ? null : Number(raw))
    }
    function onGenderChange(e: Event) {
        emit('update:calorieGender', (e.target as HTMLSelectElement).value as Gender)
    }
    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:calorieWeight', raw === '' ? null : Number(raw))
    }
    function onHeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:calorieHeight', raw === '' ? null : Number(raw))
    }
    function onActivityChange(e: Event) {
        emit('update:calorieActivity', (e.target as HTMLSelectElement).value)
    }
    function onGoalChange(e: Event) {
        emit('update:calorieGoal', Number((e.target as HTMLSelectElement).value))
    }
</script>

<style scoped>
    /* === Vollständige, lokale Styles für Konsistenz === */

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

    .label-row {
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

    .result-list {
        margin: .25rem 0 0;
        padding-left: 1.1rem;
    }

    /* Chart placeholder */
    .chart-container {
        height: 240px;
        margin-top: .5rem;
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
