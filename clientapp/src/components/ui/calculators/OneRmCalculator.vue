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
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="hasResult"
                    :copyText="copyText ?? null"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')">

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
                <div class="calc-mini-title">Reality-Check ✅</div>
                <div class="calc-mini-text">
                    Dein bestes Tool bleibt: <strong>saubere Reps</strong> + <strong>Progress</strong>. 1RM ist nur ’ne Zahl.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ maybeAutoCalc, normalizeNumberInput }">
            <div class="input-group">
                <label>Übung</label>
                <input :value="exercise"
                       @input="(e) => { onExerciseInput(e); maybeAutoCalc() }"
                       type="text"
                       placeholder="z. B. Bankdrücken"
                       class="edit-input" />
            </div>

            <div class="input-group">
                <label>Gewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
                <input :value="weight ?? ''"
                       @input="(e) => { onWeightInput(e, normalizeNumberInput); maybeAutoCalc() }"
                       type="text"
                       inputmode="decimal"
                       autocomplete="off"
                       :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'"
                       class="edit-input" />
            </div>

            <div class="input-group">
                <label>Wiederholungen</label>
                <input :value="reps ?? ''"
                       @input="(e) => { onRepsInput(e, (v) => v.replace(/[^\d]/g, '')); maybeAutoCalc() }"
                       type="text"
                       inputmode="numeric"
                       autocomplete="off"
                       placeholder="z. B. 8"
                       class="edit-input" />
            </div>
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
    }>()

    const infoText = computed(() =>
        props.info ??
        'Schätzt dein einmaliges Maximalgewicht. Standard: Epley (1RM ≈ Gewicht × (1 + Wiederholungen/30)). Richtwert, kein Max-Test.'
    )

    /* Bindings */
    const exercise = computed(() => props.oneRmExercise)
    const weight = computed(() => props.oneRmWeight)
    const reps = computed(() => props.oneRmReps)

    const hasResult = computed(() => props.oneRmResult != null || !!props.formattedResult)
    const copyTextValue = computed(() => copyText.value ?? null)

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
        if (props.oneRmReps != null) parts.push(`Reps: ${props.oneRmReps}`)
        parts.push(`1RM: ${displayResult.value}`)

        return parts.join(' | ')
    })

    /* Handlers */
    function onExerciseInput(e: Event) {
        emit('update:oneRmExercise', (e.target as HTMLInputElement).value)
    }

    function onWeightInput(e: Event, normalize?: NormalizeFn) {
        const raw0 = (e.target as HTMLInputElement).value
        const raw = normalize ? normalize(raw0) : raw0.trim().replace(',', '.')
        if (raw === '') {
            emit('update:oneRmWeight', null)
            return
        }
        const n = Number(raw)
        if (Number.isFinite(n)) emit('update:oneRmWeight', n)
    }

    function onRepsInput(e: Event, normalize?: NormalizeFn) {
        const raw0 = (e.target as HTMLInputElement).value
        const raw = normalize ? normalize(raw0) : raw0.trim()
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
</style>