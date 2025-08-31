<!-- src/components/ui/calculators/CaloriesCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Kalorienbedarfsrechner' }}
                <span class="tooltip">
                    ℹ️
                    <span class="tooltip-text">
                        Täglicher Bedarf basierend auf Alter, Geschlecht, Größe, Gewicht & Aktivität.
                    </span>
                </span>
            </h3>

            <button class="fav-btn"
                    :aria-pressed="isFavorite"
                    @click="$emit('toggleFavorite')"
                    :title="isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren'">
                {{ isFavorite ? '⭐' : '☆' }}
            </button>
        </div>

        <div class="input-group">
            <label>Alter (Jahre)</label>
            <input :value="age ?? ''" @input="onAgeInput" type="number" placeholder="z.B. 30" class="edit-input" />
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
            <input :value="height ?? ''" @input="onHeightInput" type="number" placeholder="z.B. 175" class="edit-input" />
        </div>

        <div class="input-group">
            <label>
                Aktivitätslevel
                <span class="tooltip">
                    ℹ️
                    <span class="tooltip-text">
                        Sitzend: Wenig Bewegung<br>
                        Leicht aktiv: 1-3x/Woche<br>
                        Moderat: 3-5x/Woche<br>
                        Sehr aktiv: 6-7x/Woche
                    </span>
                </span>
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
                <option value="0">Erhaltung</option>
                <option v-for="n in steps" :key="`surplus-${n}`" :value="n">+{{ n }} kcal (Überschuss)</option>
                <option v-for="n in steps" :key="`deficit-${n}`" :value="-n">-{{ n }} kcal (Defizit)</option>
            </select>
        </div>

        <button v-if="!autoCalcEnabled" class="popup-btn save-btn" @click="$emit('calculate')">
            Berechnen
        </button>

        <div v-if="result" class="result">
            <div class="result-header">
                <p><strong>Gesamtkalorienbedarf:</strong> {{ result.total.toFixed(0) }} kcal</p>
                <button class="btn-ghost mini" @click="$emit('copy')">📋 Kopieren</button>
            </div>
            <p>Makronährstoffe:</p>
            <ul>
                <li>Kohlenhydrate (50%): {{ result.macros.carbs.toFixed(0) }}g</li>
                <li>Eiweiß (30%): {{ result.macros.protein.toFixed(0) }}g</li>
                <li>Fett (20%): {{ result.macros.fat.toFixed(0) }}g</li>
            </ul>
        </div>

        <!-- bleibt für dein updateMacroChart() -->
        <div class="chart-container" style="height:240px;margin-top:.5rem">
            <canvas id="macroChart"></canvas>
        </div>

        <div class="card-footer">
            <div class="footer-spacer"></div>
            <div class="footer-actions">
                <button class="btn-ghost" @click="$emit('export')">
                    <span class="btn-icon">⬇️</span> Exportieren
                </button>
                <button class="btn-danger-ghost" @click="$emit('reset')">
                    <span class="btn-icon">🔄</span> Zurücksetzen
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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

const age = computed(() => props.calorieAge)
const gender = computed(() => props.calorieGender)
const weight = computed(() => props.calorieWeight)
const height = computed(() => props.calorieHeight)
const activity = computed(() => props.calorieActivity)
const goal = computed(() => props.calorieGoal)
const result = computed(() => props.calorieResult)
const steps = [100,200,300,400,500,600,700,800,900,1000]

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
    /* nutzt deine globalen Styles, minimaler Zusatz für Konsistenz */
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

    .popup-btn {
        padding: .75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: .9rem;
        transition: background .2s, transform .1s;
    }

    .save-btn {
        background: transparent;
        border: 1px solid var(--accent-primary);
        color: var(--accent-primary);
        padding: .5rem .75rem;
        border-radius: 8px;
        font-size: .9rem;
        font-weight: 500;
    }

        .save-btn:hover {
            border-color: #3b82f6;
            color: #3b82f6;
            background-color: rgba(59,130,246,.1);
            transform: translateY(-2px);
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

    .fav-btn {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: .25rem .4rem;
        border-radius: 8px;
        color: #6b7280;
        transition: color .2s, text-shadow .2s, transform .1s;
    }

        .fav-btn:hover {
            color: #F59E0B;
            text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
            transform: scale(1.05);
        }

    .btn-ghost {
        background: transparent;
        border: 1px solid var(--border-color);
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-ghost:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: translateY(-1px);
        }

        .btn-ghost.mini {
            padding: .35rem .6rem;
            font-size: .8rem;
            border-radius: 6px;
        }

    .btn-danger-ghost {
        background: transparent;
        border: 1px solid #b91c1c33;
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: #b91c1c;
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-danger-ghost:hover {
            border-color: #b91c1c;
            color: #7f1d1d;
            transform: translateY(-1px);
        }

    .btn-icon {
        margin-right: .4rem;
    }

    .tooltip {
        position: relative;
        display: inline-block;
        cursor: help;
    }

        .tooltip .tooltip-text {
            visibility: hidden;
            min-width: 150px;
            max-width: 300px;
            background: var(--bg-card);
            color: var(--text-tooltip);
            text-align: left;
            border-radius: 8px;
            padding: 0.75rem;
            position: absolute;
            z-index: 1000;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.8rem;
            box-shadow: var(--shadow);
            opacity: 0;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            white-space: normal;
            word-wrap: break-word;
        }

            .tooltip .tooltip-text::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 8px;
                border-style: solid;
                border-color: var(--bg-card) transparent transparent transparent;
            }

        .tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }
    @media (max-width: 600px) {
        .tooltip .tooltip-text {
            min-width: 120px;
            max-width: 90vw;
            font-size: 0.75rem;
            padding: 0.5rem;
        }
    }
</style>
