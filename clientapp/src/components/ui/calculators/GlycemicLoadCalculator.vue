<!-- src/components/ui/calculators/GlycemicLoadCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Glykämische Last (GL) Rechner' }}
                <span class="tooltip">
                    ℹ️
                    <span class="tooltip-text">
                        Die GL schätzt die Blutzuckerwirkung einer Portion: GL = (GI × verfügbare KH in g) / 100.
                        Richtwerte: niedrig &lt; 10, mittel 10–19, hoch ≥ 20.
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
            <label>Glykämischer Index (0–110)</label>
            <input :value="gi ?? ''"
                   @input="onGiInput"
                   type="number"
                   min="0"
                   max="110"
                   placeholder="z.B. 55"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label>Verfügbare Kohlenhydrate pro Portion (g)</label>
            <input :value="carbs ?? ''"
                   @input="onCarbsInput"
                   type="number"
                   min="0"
                   placeholder="z.B. 30"
                   class="edit-input" />
            <small class="hint">
                Falls bekannt: Ballaststoffe von den Gesamt-KH abziehen.
            </small>
        </div>

        <button v-if="!autoCalcEnabled" class="popup-btn save-btn" @click="$emit('calculate')">
            Berechnen
        </button>

        <div v-if="glResult !== null" class="result">
            <div class="result-header">
                <p>
                    <strong>Glykämische Last:</strong> {{ glResult!.toFixed(1) }}
                    <span v-if="glCategory">— Kategorie: {{ glCategory }}</span>
                </p>
                <button class="btn-ghost mini" @click="$emit('copy')">📋 Kopieren</button>
            </div>
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

type Category = 'niedrig' | 'mittel' | 'hoch' | string

const props = defineProps<{
  autoCalcEnabled: boolean
  glGi: number | null
  glCarbs: number | null
  glResult: number | null
  /** Optional: vom Parent berechnete Kategorie (niedrig/mittel/hoch) */
  glCategory?: Category
  isFavorite: boolean
  title?: string
}>()

const emit = defineEmits<{
  (e: 'toggleFavorite'): void
  (e: 'update:glGi', v: number | null): void
  (e: 'update:glCarbs', v: number | null): void
  (e: 'calculate'): void
  (e: 'copy'): void
  (e: 'export'): void
  (e: 'reset'): void
}>()

const gi = computed(() => props.glGi)
const carbs = computed(() => props.glCarbs)
const glResult = computed(() => props.glResult)
const glCategory = computed(() => props.glCategory)

function onGiInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const value = raw === '' ? null : Number(raw)
  emit('update:glGi', value === null || Number.isNaN(value) ? null : value)
}

function onCarbsInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const value = raw === '' ? null : Number(raw)
  emit('update:glCarbs', value === null || Number.isNaN(value) ? null : value)
}
</script>

<style scoped>
    /* Card + Inputs (konsistent mit deinen anderen Calculators) */
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
        display: block;
        margin-top: .35rem;
        font-size: .8rem;
        color: var(--text-secondary);
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

    /* Tooltip lokal */
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
            padding: .75rem;
            position: absolute;
            z-index: 1000;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            font-size: .8rem;
            box-shadow: var(--shadow);
            opacity: 0;
            transition: opacity .3s, visibility .3s;
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
            font-size: .75rem;
            padding: .5rem;
        }
    }
</style>
