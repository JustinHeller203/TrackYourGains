<!-- src/components/ui/calculators/OneRmCalculator.vue -->
<template>
    <BaseCalculator :title="title || '1RM-Rechner'"
                    :showInfo="true"
                    infoTitle="1RM (One-Rep-Max)"
                    infoKicker="Rechner erklärt"
                    ariaOpen="1RM Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateOneRm"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="hasResult"
                    :copyText="copyText ?? null"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    @invalid="(errors) => $emit('invalid', errors)" >

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="1RM Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">🏋️‍♂️ Wie stark bist du wirklich?</span>
                </div>

                <div class="calc-hero-sub">
                    Schätzung deines Maximalgewichts (1 Wiederholung) – kein Ego-Trip, sondern ein Richtwert fürs Training.
                </div>

                <div class="calc-hero-pills" aria-label="Schnellnavigation">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">⚙️ Formel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_example')">📐 Beispiel</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">⚠️ Grenzen</button>
                </div>
            </div>
        </template>

        <!-- Popup -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="hasResult"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">✅ Dein Ergebnis</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>1RM für {{ exercise || 'Übung' }}:</strong> {{ displayResult }}
                        </div>

                        <div class="calc-note calc-note--tight">
                            Tipp: Nutze das für Trainingsplanung (Prozente), nicht um jedes Mal bis zum Limit zu gehen.
                        </div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('calc_next')">👉 Was heißt das?</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">⚠️ Grenzen</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" aria-label="Kurzüberblick">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">⚙️ Formel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_example')">📐 Beispiel</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('calc_use')">🎯 Nutzen</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">⚠️ Grenzen</button>

                    <button class="calc-chip"
                            type="button"
                            :disabled="!hasResult"
                            :aria-disabled="!hasResult"
                            :class="{ 'is-disabled': !hasResult }"
                            :title="hasResult ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                            @click="async () => { await onCopy?.(); jumpTo('calc_you') }">

                        📋 Copy
                    </button>
                </div>

                <div id="calc_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">📌 Kurzfassung</div>
                    <div class="calc-callout-text">
                        <div>
                            Der Rechner schätzt dein <strong>1RM</strong> aus <strong>Gewicht</strong> + <strong>Wiederholungen</strong> (Standard: Epley).
                        </div>

                        <ul class="calc-list calc-list--spaced">
                            <li><strong>Gut:</strong> sehr hilfreich für Trainings-Prozente & Fortschritt</li>
                            <li><strong>Wichtig:</strong> saubere Technik &gt; Zahl</li>
                            <li><strong>Merke:</strong> bei sehr hohen Reps wird’s ungenauer</li>
                        </ul>
                    </div>
                </div>

                <div id="calc_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                    <ul class="calc-list">
                        <li><strong>Hypertrophie:</strong> oft 65–80% 1RM</li>
                        <li><strong>Kraft:</strong> oft 80–92% 1RM</li>
                        <li><strong>Technik/Speed:</strong> eher 50–70% 1RM</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">👥 Für wen ist das sinnvoll?</h4>
                        <ul class="calc-list">
                            <li>✅ Krafttraining / progressive Overload</li>
                            <li>✅ Trainingsplanung (Prozent-Sätze)</li>
                            <li>⚠️ Anfänger: eher als grober Richtwert</li>
                        </ul>
                    </section>

                    <section id="calc_use"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_use' }"
                             tabindex="-1">
                        <h4 class="calc-h">🎯 Wofür nutzt man 1RM?</h4>
                        <ul class="calc-list">
                            <li><strong>Planung:</strong> Arbeitssätze in % vom 1RM</li>
                            <li><strong>Vergleich:</strong> Fortschritt ohne Max-Test</li>
                            <li><strong>Hinweis:</strong> Tagesform kann +/- ein paar % ausmachen</li>
                        </ul>
                    </section>

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formel (Epley)</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">1RM</span>
                            <span class="calc-formula-eq">≈</span>
                            <span class="calc-formula-v">Gewicht × (1 + Wiederholungen / 30)</span>
                        </div>
                        <div class="calc-note">
                            Genauigkeit ist meist am besten bei ca. <strong>1–10 Reps</strong>.
                        </div>
                    </section>

                    <section id="calc_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">📐 Beispiel</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>80&nbsp;kg × 8 Reps</span>
                                <span class="calc-example-strong">≈ 101,3&nbsp;kg</span>
                            </div>
                            <div class="calc-example-sub">
                                Schätzung — echte 1RM-Tests können je nach Technik/Tagesform abweichen.
                            </div>
                        </div>
                    </section>
                </div>

                <div id="calc_ignore"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_ignore' }"
                     tabindex="-1">
                    <div class="calc-callout-title">🧠 Wann du den 1RM-Rechner locker ignorieren darfst</div>
                    <ul class="calc-list">
                        <li>Du trainierst nach <strong>RPE/RIR</strong> und Progress passt</li>
                        <li>Deine Übung variiert ständig (Technik/Range/Tempo) → schwer vergleichbar</li>
                        <li>Du bist <strong>komplett neu</strong> und brauchst erstmal Technik & Routine</li>
                    </ul>
                </div>

                <div id="calc_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'calc_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                    <ul class="calc-list">
                        <li><strong>Hohe Reps (10+)</strong> → Schätzung wird deutlich ungenauer</li>
                        <li><strong>Cheat-Reps</strong> → Ergebnis ist kaum aussagekräftig</li>
                        <li><strong>Schmerzen/unsichere Technik</strong> → lieber nicht auf Max-Zahlen gehen</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">❓ Häufige Fragen</h4>
                    <ul class="calc-list">
                        <li><strong>„Welche Formel ist das?“</strong> → Epley (Standard-Schätzung).</li>
                        <li><strong>„Warum variiert das?“</strong> → Technik, Pausenlänge, Tagesform, ROM. Und: Bankdrücken 30 kg ≠ Seitheben 30 kg.</li>
                        <li><strong>„Soll ich 1RM testen?“</strong> → nur mit Erfahrung + sicherem Setup (Spotter/Safeties).</li>
                    </ul>
                </section>
            </div>
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">✅ Reality-Check</div>
                <div class="calc-mini-text">
                    Dein bestes Tool bleibt: <strong>saubere Reps</strong> + <strong>Progress</strong>. 1RM ist nur ’ne Zahl.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ maybeAutoCalc, normalizeNumberInput, errorFor }">
            <UiCalculatorInput :modelValue="exercise"
                               label="Übung *"
                               type="text"
                               placeholder="z. B. Bankdrücken"
                               autocomplete="off"
                               :error="errorFor('übung')"
                               @update:modelValue="(v) => { emit('update:oneRmExercise', String(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="weightInputValue"
                               :label="`Gewicht (${String(unit).toLowerCase() === 'kg' ? 'kg' : 'lbs'}) *`"
                               type="text"
                               inputmode="decimal"
                               autocomplete="off"
                               :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { onWeightInputValue(v, normalizeNumberInput); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="repsInputValue"
                               label="Wiederholungen *"
                               type="text"
                               inputmode="numeric"
                               autocomplete="off"
                               placeholder="z. B. 8"
                               :error="errorFor('wiederholungen')"
                               @update:modelValue="(v) => { onRepsInputValue(v); maybeAutoCalc() }" />
        </template>

        <!-- Result -->
        <template #result>
            <div v-if="hasResult">
                <p>
                    <strong>1RM für {{ exercise || 'Übung' }}:</strong> {{ displayResult }}
                </p>
            </div>
        </template>

    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type NormalizeFn = (raw: string) => string

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        oneRmExercise: string
        oneRmWeight: number | null
        oneRmReps: number | null
        oneRmResult: number | null
        formattedResult?: string
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:oneRmExercise', v: string): void
        (e: 'update:oneRmWeight', v: number | null): void
        (e: 'update:oneRmReps', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const infoText = computed(() =>
        props.info ??
        'Schätzt dein einmaliges Maximalgewicht. Standard: Epley (1RM ≈ Gewicht × (1 + Wiederholungen/30)). Richtwert, kein Max-Test.'
    )

    function validateOneRm(): string[] {
        const errors: string[] = []

        const ex = String(props.oneRmExercise ?? '').trim()
        if (!ex) {
            errors.push('Bitte gib eine Übung ein.')
        }

        const w = props.oneRmWeight
        if (w == null || Number.isNaN(w)) {
            errors.push('Bitte gib das Gewicht ein.')
            return errors
        }

        if (w <= 0) errors.push('Gewicht muss größer als 0 sein.')
        else if (String(props.unit).toLowerCase() === 'kg' && w > 500) errors.push('Gewicht wirkt unrealistisch hoch (kg).')
        else if ((String(props.unit).toLowerCase() === 'lb' || String(props.unit).toLowerCase() === 'lbs') && w > 1100)
            errors.push('Gewicht wirkt unrealistisch hoch (lbs).')

        const r = props.oneRmReps
        if (r == null || Number.isNaN(r)) {
            errors.push('Bitte gib die Wiederholungen ein.')
            return errors
        }

        if (r <= 0) errors.push('Wiederholungen müssen größer als 0 sein.')
        else if (r > 20) errors.push('Wiederholungen wirken für 1RM-Schätzung zu hoch (20+ wird sehr ungenau).')

        return errors
    }

    /* Bindings */
    const exercise = computed(() => props.oneRmExercise)

    const hasResult = computed(() => props.oneRmResult != null || !!props.formattedResult)

    /* Anzeige: bevorzugt formattedResult, sonst lokal formatieren */
    const displayResult = computed(() => {
        if (props.formattedResult) return props.formattedResult
        if (props.oneRmResult == null || !Number.isFinite(props.oneRmResult)) return '—'
        const u = String(props.unit || '').toLowerCase() === 'lbs' ? 'lbs' : 'kg'
        return `${props.oneRmResult.toFixed(1)} ${u}`
    })

    /* CopyText für BaseCalculator */
    const copyText = computed<string | null>(() => {
        if (!hasResult.value) return null

        const parts: string[] = []
        if (props.oneRmExercise?.trim()) parts.push(`Übung: ${props.oneRmExercise.trim()}`)
        if (props.oneRmWeight != null) parts.push(`Gewicht: ${props.oneRmWeight} ${String(props.unit).toLowerCase() === 'lbs' ? 'lbs' : 'kg'}`)
        if (props.oneRmReps != null) parts.push(`Wiederholungen: ${props.oneRmReps}`)
        parts.push(`1RM: ${displayResult.value}`)

        return parts.join(' | ')
    })

    const weightInputValue = computed(() =>
        props.oneRmWeight == null || Number.isNaN(props.oneRmWeight) ? '' : String(props.oneRmWeight)
    )
    const repsInputValue = computed(() =>
        props.oneRmReps == null || Number.isNaN(props.oneRmReps) ? '' : String(props.oneRmReps)
    )

    /* Handlers (Value-basiert statt Event-basiert) */
    function onWeightInputValue(v: string | number, normalize?: NormalizeFn) {
        const raw0 = String(v ?? '')
        const raw = normalize ? normalize(raw0) : raw0.trim().replace(',', '.')
        if (raw === '') {
            emit('update:oneRmWeight', null)
            return
        }
        const n = Number(raw)
        if (Number.isFinite(n)) emit('update:oneRmWeight', n)
    }

    function onRepsInputValue(v: string | number) {
        const raw = String(v ?? '').replace(/[^\d]/g, '')
        if (raw === '') {
            emit('update:oneRmReps', null)
            return
        }
        const n = Number(raw)
        if (!Number.isFinite(n)) return
        emit('update:oneRmReps', Math.max(1, Math.floor(n)))
    }
</script>

<style scoped>
</style>
