<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'BMI-Rechner' }}
                <span v-if="info" class="tooltip">
                    ℹ️
                    <span class="tooltip-text">{{ info }}</span>
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

        <button v-if="!autoCalcEnabled"
                class="popup-btn save-btn"
                @click="$emit('calculate')">
            Berechnen
        </button>

        <div v-if="bmiResult" class="result">
            <div class="result-header">
                <p><strong>BMI:</strong> {{ bmiResult.value.toFixed(1) }}</p>
                <button class="btn-ghost mini" @click="$emit('copy')">📋 Kopieren</button>
            </div>
            <p>Kategorie: {{ bmiResult.category }}</p>
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

    interface BmiResult {
        value: number
        category: string
    }

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
        const val = (ev.target as HTMLSelectElement).value as Gender
        emit('update:bmiGender', val)
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
    /* Container */
    .calculator-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        position: relative;
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
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: .5rem;
    }

    /* Fav */
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

    /* Tooltip */
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

    /* Inputs */
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
        transition: border-color 0.3s, box-shadow 0.3s;
    }

        .edit-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
            outline: none;
        }

    /* Primary CTA (gleiche Optik wie Popup-Buttons) */
    .popup-btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.2s, transform 0.1s;
    }

    .calculator-card .save-btn {
        background: transparent;
        border: 1px solid var(--accent-primary);
        color: var(--accent-primary);
        padding: .5rem .75rem;
        border-radius: 8px;
        font-size: .9rem;
        font-weight: 500;
        cursor: pointer;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .calculator-card .save-btn:hover {
            border-color: #3b82f6; /* kräftigeres, helleres Blau */
            color: #3b82f6;
            background-color: rgba(59, 130, 246, 0.1); /* leichter blauer Hintergrund */
            transform: translateY(-2px);
        }

    /* Result */
    .result {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
        color: var(--text-primary);
    }

        .result p {
            margin: 0.5rem 0;
            font-size: 0.9rem;
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
        padding: 0.75rem 1rem 0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
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

    /* Ghost Buttons */
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

    /* Danger Ghost */
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

    /* Mobile Tooltip Tuning */
    @media (max-width: 600px) {
        .tooltip .tooltip-text {
            min-width: 120px;
            max-width: 90vw;
            font-size: 0.75rem;
            padding: 0.5rem;
        }
    }
</style>
