<!-- src/components/ui/calculators/GlycemicLoadCalculator.vue -->
<template>
  <div class="calculator-card">
    <div class="card-header">
      <h3 class="card-title">
        {{ title || 'Glykämische Last (GL) Rechner' }}
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
      <label>Lebensmittel</label>
      <input
        :value="food"
        @input="onFood"
        type="text"
        placeholder="z. B. Reis, Banane …"
        class="edit-input"
      />
    </div>

    <div class="input-group">
      <label>Portionsgröße (g)</label>
      <input
        :value="serving ?? ''"
        @input="onServing"
        type="number"
        min="0"
        step="any"
        placeholder="z. B. 150"
        class="edit-input"
      />
    </div>

    <div class="input-group">
      <label>Kohlenhydrate pro 100 g (g)</label>
      <input
        :value="carbs100 ?? ''"
        @input="onCarbs100"
        type="number"
        min="0"
        step="any"
        placeholder="z. B. 28"
        class="edit-input"
      />
      <small class="hint">Falls bekannt: Ballaststoffe von den Gesamt-KH abziehen.</small>
    </div>

    <div class="input-group">
      <label>Glykämischer Index (0–110)</label>
      <input
        :value="gi ?? ''"
        @input="onGi"
        type="number"
        min="0"
        max="110"
        step="any"
        placeholder="z. B. 55"
        class="edit-input"
      />
    </div>

    <div class="input-group" v-if="carbs !== null">
      <label>Verfügbare KH pro Portion (berechnet)</label>
      <input :value="carbs!.toFixed(1) + ' g'" class="edit-input" disabled />
    </div>

    <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

    <div v-if="glResult !== null" class="result">
      <div class="result-header">
        <p>
          <strong>GL pro Portion:</strong> {{ glResult!.toFixed(1) }}
          <span v-if="glCategory">— Kategorie: {{ glCategory }}</span>
        </p>
        <CopyButton @click="$emit('copy')" />
      </div>
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

type Category = 'niedrig' | 'mittel' | 'hoch' | string

const props = defineProps<{
  autoCalcEnabled: boolean
  glFood: string
  glServing: number | null
  glCarbs100: number | null
  glGi: number | null
  /** optional zur Anzeige – parent rechnet das bereits */
  glCarbs?: number | null
  glResult: number | null
  glCategory?: Category
  isFavorite: boolean
  title?: string
  info?: string
}>()

const emit = defineEmits<{
  (e: 'toggleFavorite'): void
  (e: 'update:glFood', v: string): void
  (e: 'update:glServing', v: number | null): void
  (e: 'update:glCarbs100', v: number | null): void
  (e: 'update:glGi', v: number | null): void
  (e: 'calculate'): void
  (e: 'copy'): void
  (e: 'export'): void
  (e: 'reset'): void
}>()

const food = computed(() => props.glFood)
const serving = computed(() => props.glServing)
const carbs100 = computed(() => props.glCarbs100)
const gi = computed(() => props.glGi)
const carbs = computed(() => props.glCarbs ?? null)

const infoText = computed(
  () =>
    props.info ??
    'GL = (GI × verfügbare KH pro Portion in g) / 100. Richtwerte: niedrig < 10, mittel 10–19, hoch ≥ 20.'
)

function onFood(e: Event) {
  emit('update:glFood', (e.target as HTMLInputElement).value)
}
function onServing(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const val = raw === '' ? null : Number(raw)
  emit('update:glServing', val === null || Number.isNaN(val) ? null : val)
}
function onCarbs100(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const val = raw === '' ? null : Number(raw)
  emit('update:glCarbs100', val === null || Number.isNaN(val) ? null : val)
}
function onGi(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  const val = raw === '' ? null : Number(raw)
  emit('update:glGi', val === null || Number.isNaN(val) ? null : val)
}
</script>

<style scoped>
/* Card */
.calculator-card{
  background:var(--bg-card);
  padding:1.5rem;
  border-radius:16px;
  box-shadow:var(--shadow);
  border:1px solid var(--border-color);
  transition:transform .3s, box-shadow .3s, border-color .3s;
  color:var(--text-primary);
  font-family:inherit;
}
.calculator-card:hover{
  transform:translateY(-4px);
  box-shadow:var(--shadow-hover);
  border-color:var(--accent-primary);
}

/* Header */
.card-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:1rem;
}
.card-title{
  font-size:1.25rem;
  font-weight:600;
  display:flex;
  align-items:center;
  gap:.5rem;
  color:var(--text-primary);
}

/* Inputs */
.input-group{ margin-bottom:1rem; }
.input-group label{
  display:block;
  font-size:.9rem;
  font-weight:500;
  color:var(--text-primary);
  margin-bottom:.25rem;
}
.edit-input{
  width:100%;
  padding:.75rem;
  border:1px solid var(--border-color);
  border-radius:8px;
  background:var(--bg-secondary);
  color:var(--text-color);
  font-size:.9rem;
  transition:border-color .3s, box-shadow .3s;
}
.edit-input:focus{
  border-color:var(--accent-primary);
  box-shadow:0 0 5px rgba(99,102,241,.5);
  outline:none;
}
.hint{
  display:block;
  margin-top:.35rem;
  font-size:.8rem;
  color:var(--text-secondary);
}

/* Result */
.result{
  margin-top:1rem;
  padding:1rem;
  background:var(--bg-secondary);
  border-radius:8px;
}
.result-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:.75rem;
  margin-bottom:.35rem;
}

/* Footer */
.card-footer{
  border-top:1px solid var(--border-color);
  padding:.75rem 1rem 0;
  display:flex;
  justify-content:flex-end;
  gap:.75rem;
  margin-top:.75rem;
}
.footer-spacer{ flex:1; }
.footer-actions{
  display:flex;
  display:flex;
  gap:.5rem;
  flex-wrap:wrap;
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
