<!-- src/components/ui/calculators/CaffeineSafeDoseCalculator.vue -->
<template>
  <div class="calculator-card">
    <div class="card-header">
      <h3 class="card-title">
        {{ title || 'Koffein – sichere Dosis' }}
        <InfoHover :text="infoText" />
      </h3>

      <FavoriteButton
        :active="isFavorite"
        :titleActive="'Aus Favoriten entfernen'"
        :titleInactive="'Zu Favoriten hinzufügen'"
        @toggle="$emit('toggleFavorite')"
      />
    </div>

    <div class="input-group">
      <label>Gewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
      <input
        :value="weight ?? ''"
        @input="onWeightInput"
        type="number"
        :placeholder="unit === 'kg' ? 'z.B. 75' : 'z.B. 165'"
        class="edit-input"
      />
    </div>

    <div class="input-group">
      <label>Empfindlichkeit</label>
      <select :value="sensitivity" @change="onSensitivityChange" class="edit-input">
        <option value="low">Empfindlich (≈ 3 mg/kg)</option>
        <option value="normal">Normal (≈ 4 mg/kg)</option>
        <option value="high">Tolerant (≈ 6 mg/kg)</option>
      </select>
    </div>

    <div class="input-group">
      <label>Besonderheit</label>
      <select :value="status" @change="onStatusChange" class="edit-input">
        <option value="none">Keine</option>
        <option value="pregnant">Schwanger/Stillend (≤ 200 mg/Tag)</option>
      </select>
    </div>

    <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

    <div v-if="cafResult" class="result">
      <div class="result-header">
        <div>
          <p><strong>Empfehlung (Einzeldosis):</strong> {{ cafResult.perDose.toFixed(0) }} mg</p>
          <p><strong>Max. pro Tag:</strong> {{ cafResult.perDay.toFixed(0) }} mg</p>
        </div>
        <CopyButton @click="$emit('copy')" />
      </div>
      <small class="hint">
        Beispiel: Hat ein Drink 80&nbsp;mg pro Portion, kannst du so schnell überschlagen,
        wie viele Portionen sinnvoll sind.
      </small>
    </div>

    <div class="card-footer">
      <div class="footer-spacer"></div>
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

type Unit = 'kg' | 'lb' | 'lbs' | string
type Sensitivity = 'low' | 'normal' | 'high'
type Status = 'none' | 'pregnant'

const props = defineProps<{
  unit: Unit
  autoCalcEnabled: boolean
  cafWeight: number | null
  cafSensitivity: Sensitivity
  cafStatus: Status
  cafResult: { perDose: number; perDay: number } | null
  isFavorite: boolean
  title?: string
  info?: string
}>()

const emit = defineEmits<{
  (e: 'toggleFavorite'): void
  (e: 'update:cafWeight', v: number | null): void
  (e: 'update:cafSensitivity', v: Sensitivity): void
  (e: 'update:cafStatus', v: Status): void
  (e: 'calculate'): void
  (e: 'copy'): void
  (e: 'export'): void
  (e: 'reset'): void
}>()

const weight = computed(() => props.cafWeight)
const sensitivity = computed(() => props.cafSensitivity)
const status = computed(() => props.cafStatus)
const cafResult = computed(() => props.cafResult)

const infoText = computed(
  () =>
    props.info ??
    'Richtwerte (gesunde Erwachsene): ca. 3–6 mg/kg Körpergewicht. Übliche Tagesobergrenze ~400 mg (Schwangere/Stillende ≤ 200 mg). Keine medizinische Beratung.'
)

function onWeightInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const numeric = raw === '' ? null : Number(raw)
  emit('update:cafWeight', numeric === null || Number.isNaN(numeric) ? null : numeric)
}
function onSensitivityChange(e: Event) {
  emit('update:cafSensitivity', (e.target as HTMLSelectElement).value as Sensitivity)
}
function onStatusChange(e: Event) {
  emit('update:cafStatus', (e.target as HTMLSelectElement).value as Status)
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
/* Inputs */
.input-group { margin-bottom: 1rem; }
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
.hint {
  display: block;
  margin-top: .25rem;
  font-size: .8rem;
  color: var(--text-secondary);
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
.footer-spacer { flex: 1; }
.footer-actions {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}
</style>
