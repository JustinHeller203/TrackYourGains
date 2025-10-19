<template>
    <div v-if="show" class="modal-overlay" @click="onOverlayClick">
        <div class="modal"
             role="dialog"
             aria-modal="true"
             @click.stop>
            <h3 class="modal-title">📥 Fortschritt eintragen</h3>

            <label class="field-label" for="progress-exercise">Übung</label>
            <select id="progress-exercise"
                    ref="exerciseSelect"
                    v-model="exerciseProxy"
                    class="input select">
                <option v-for="ex in exercises"
                        :key="ex.exercise"
                        :value="ex.exercise">
                    {{ ex.exercise }}
                </option>
            </select>

            <div class="modal-grid">
                <div>
                    <label class="field-label" for="progress-sets">Sätze</label>
                    <input id="progress-sets"
                           type="number"
                           min="1"
                           v-model.number="setsProxy"
                           class="input"
                           placeholder="z. B. 3" />
                </div>

                <div>
                    <label class="field-label" for="progress-weight">Gewicht ({{ unit }})</label>
                    <input id="progress-weight"
                           ref="weightInput"
                           type="number"
                           min="0"
                           step="0.5"
                           v-model.number="weightProxy"
                           class="input"
                           :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'" />
                </div>

                <div>
                    <label class="field-label" for="progress-reps">Wiederholungen</label>
                    <input id="progress-reps"
                           type="number"
                           min="1"
                           v-model.number="repsProxy"
                           class="input"
                           placeholder="z. B. 8" />
                </div>
            </div>

            <label class="field-label" for="progress-note">Notiz (optional)</label>
            <input id="progress-note"
                   type="text"
                   v-model="noteProxy"
                   class="input"
                   placeholder="RPE, Tempo, Feeling …" />

            <div class="modal-actions">
                <PopupCancelButton ariaLabel="Abbrechen" @click="onCancel" />
                <PopupSaveButton ariaLabel="Speichern" @click="onSave" />
            </div>

            <ul v-if="errors && errors.length" class="errors">
                <li v-for="(e,i) in errors" :key="i">• {{ e }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import PopupCancelButton from '@/components/ui/buttons/PopupCancelButton.vue'
import PopupSaveButton from '@/components/ui/buttons/PopupSaveButton.vue'

type Unit = 'kg' | 'lbs'
interface PlanExercise {
  exercise: string
  sets: number
  reps: number
  goal?: string
}

const props = defineProps<{
  show: boolean
  unit: Unit
  exercises: PlanExercise[]
  /** v-models für die Felder */
  exercise: string
  sets: number | null
  weight: number | null
  reps: number | null
  note: string
  /** vom Parent gereicht: Validierungsfehler (Anzeige findet hier statt) */
  errors?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:show', v: boolean): void
  (e: 'update:exercise', v: string): void
  (e: 'update:sets', v: number | null): void
  (e: 'update:weight', v: number | null): void
  (e: 'update:reps', v: number | null): void
  (e: 'update:note', v: string): void
  (e: 'save'): void
  (e: 'cancel'): void
}>()

/** Proxys für saubere v-model:foo Bindings */
const exerciseProxy = computed({
  get: () => props.exercise,
  set: v => emit('update:exercise', v),
})
const setsProxy = computed({
  get: () => props.sets,
  set: v => emit('update:sets', v),
})
const weightProxy = computed({
  get: () => props.weight,
  set: v => emit('update:weight', v),
})
const repsProxy = computed({
  get: () => props.reps,
  set: v => emit('update:reps', v),
})
const noteProxy = computed({
  get: () => props.note,
  set: v => emit('update:note', v),
})

const exerciseSelect = ref<HTMLSelectElement | null>(null)
const weightInput = ref<HTMLInputElement | null>(null)

function focusFirst() {
  // Erst Auswahl, dann direkt aufs Gewicht (fühlt sich beim Eintragen schneller an)
  nextTick(() => {
    exerciseSelect.value?.focus()
    nextTick(() => weightInput.value?.focus())
  })
}

function onCancel() {
  emit('update:show', false)
  emit('cancel')
}

function onSave() {
  emit('save') // Parent validiert & speichert; schließt anschließend selbst
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) onCancel()
}

watch(() => props.show, v => {
  if (v) focusFirst()
})

onMounted(() => {
  if (props.show) focusFirst()
})
</script>

<style scoped>
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.4);
        display: grid;
        place-items: center;
        z-index: 60;
    }

    .modal {
        width: min(560px, 92vw);
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: var(--shadow);
        padding: 1rem 1rem 0.75rem;
    }

    .modal-title {
        font-weight: 700;
        margin: .25rem 0 0.75rem;
    }

    .field-label {
        display: block;
        font-size: .9rem;
        color: var(--text-secondary);
        margin: .5rem 0 .25rem;
    }

    .input {
        width: 100%;
        padding: .6rem .75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-primary);
    }

        .input:focus {
            outline: none;
            border-color: var(--accent-primary);
        }

    .select {
        appearance: auto;
    }

    .modal-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: .75rem;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: .5rem;
        margin-top: .9rem;
    }

    .errors {
        margin: .75rem 0 1rem;
        color: #b91c1c;
        font-size: .9rem;
    }

    @media (max-width: 520px) {
        .modal-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
