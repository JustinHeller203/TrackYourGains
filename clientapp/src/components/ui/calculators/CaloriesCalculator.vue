<!-- src/components/ui/calculators/CaloriesCalculator.vue -->
<template>
    <BaseCalculator :title="title || 'Kalorienbedarfsrechner'"
                    :showInfo="!!infoText"
                    infoTitle="Kalorienbedarf"
                    infoKicker="Rechner erklärt"
                    ariaOpen="Kalorien Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateCalories"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="!!result"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    @invalid="(errors) => $emit('invalid', errors)">

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="Kalorien Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">🔥 Wie viele Kalorien brauchst du?</span>
                </div>

                <div class="calc-hero-sub">
                    Schätzung = Startpunkt. Dein Gewichtstrend entscheidet, ob du nachjustierst.
                </div>

                <div class="calc-hero-pills" aria-label="Schnellnavigation">
                    <button class="calc-chip" type="button" @click="jumpTo('cal_formula')">⚙️ Formel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_activity')">🏃 Aktivität</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_macros')">🍚 Makros</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('cal_limits')">⚠️ Grenzen</button>
                </div>
            </div>
        </template>

        <!-- Popup -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="result"
                     id="cal_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'cal_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">✅ Dein Ergebnis</div>
                    <div class="calc-callout-text">
                        <div><strong>Tagesziel:</strong> {{ result.total.toFixed(0) }} kcal</div>
                        <div class="calc-note calc-note--tight">
                            Tipp: Wenn dein Gewicht 2–3 Wochen nicht so läuft wie geplant → Aktivität/Tracking checken, dann 100–200 kcal anpassen.
                        </div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('cal_next')">👉 Was heißt das?</button>
                            <button class="calc-chip" type="button" @click="jumpTo('cal_activity')">🏃 Aktivität</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('cal_limits')">⚠️ Grenzen</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" aria-label="Kurzüberblick">
                    <button class="calc-chip" type="button" @click="jumpTo('cal_formula')">⚙️ Formel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_example')">📐 Beispiel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_activity')">🏃 Aktivität</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('cal_macros')">🍚 Makros</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('cal_limits')">⚠️ Grenzen</button>

                    <!-- Copy: nutzt BaseCalculator CopyButton im Result -->
                    <button class="calc-chip"
                            type="button"
                            :disabled="!result"
                            :aria-disabled="!result"
                            :class="{ 'is-disabled': !result }"
                            :title="result ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                            @click="() => { onCopy?.(); jumpTo('cal_you') }">
                        📋 Copy
                    </button>
                </div>

                <div id="cal_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'cal_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">📌 Kurzfassung</div>
                    <div class="calc-callout-text">
                        <div>Der Rechner schätzt deinen <strong>Erhaltungsbedarf</strong> und passt ihn mit <strong>Aktivität</strong> + <strong>Ziel</strong> an.</div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>Erhaltung:</strong> Gewicht ungefähr stabil</li>
                            <li><strong>Defizit:</strong> Fett runter (langsam & stabil)</li>
                            <li><strong>Überschuss:</strong> Aufbau (sauberer, wenn moderat)</li>
                        </ul>
                    </div>
                </div>

                <div id="cal_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'cal_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                    <ul class="calc-list">
                        <li><strong>Du nimmst nicht ab?</strong> Tracking/Aktivität prüfen → dann 100–200 kcal runter</li>
                        <li><strong>Du nimmst zu schnell zu?</strong> 100–200 kcal runter (oder weniger Snacks/Öl)</li>
                        <li><strong>Du fühlst dich leer?</strong> Defizit zu hart oder Schlaf/Protein zu low</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">👥 Für wen ist das sinnvoll?</h4>
                        <ul class="calc-list">
                            <li>✅ Startpunkt für Cut / Aufbau / Erhaltung</li>
                            <li>✅ Wenn du deinen Trend verstehen willst</li>
                            <li>⚠️ Bei sehr wechselnder Aktivität: öfter nachjustieren</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">🧠 Was schätzt der Rechner?</h4>
                        <ul class="calc-list">
                            <li><strong>Basis:</strong> Grundumsatz (BMR)</li>
                            <li><strong>Plus:</strong> Aktivitätsfaktor (TDEE)</li>
                            <li><strong>Plus/Minus:</strong> Ziel (kcal)</li>
                            <li><strong>Nicht drin:</strong> echte NEAT-Schwankungen, Tracking-Fehler, Stress/Schlaf</li>
                        </ul>
                    </section>

                    <section id="cal_goal_guide"
                             class="calc-card calc-card--wide"
                             :class="{ 'calc-target': activeTargetId === 'cal_goal_guide' }"
                             tabindex="-1">
                        <h4 class="calc-h">🎯 Was ist „angemessen“ fürs Ziel?</h4>
                        <ul class="calc-list">
                            <li><strong>Erhaltung (0 kcal):</strong> Stabilität, Stressphasen, sauberes Tracking lernen</li>
                            <li><strong>Lean Bulk (+100–300kcal):</strong> Aufbau mit minimalem Fett</li>
                            <li><strong>Bulk (+300–500kcal):</strong> schneller Aufbau, Fett kommt mit</li>
                            <li><strong>Dirty Bulk (+500+kcal):</strong> nur wenn Fettzunahme egal ist</li>
                            <li><strong>Mini-Cut (−300–500kcal):</strong> nachhaltig Fett runter</li>
                            <li><strong>Hard Cut (−500–800kcal):</strong> aggressiv, schwer durchzuhalten</li>
                        </ul>
                        <div class="calc-note calc-note--tight">
                            Regel: Nach <strong>2–3 Wochen</strong> zählt nur der <strong>Gewichtstrend</strong>.
                            Anpassung immer in <strong>100–200 kcal</strong> Schritten.
                        </div>
                    </section>

                    <section id="cal_activity"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_activity' }"
                             tabindex="-1">
                        <h4 class="calc-h">🏃 Aktivitätslevel (einfach erklärt)</h4>
                        <ul class="calc-list">
                            <li><strong>Sitzend (1.2):</strong> wenig Bewegung</li>
                            <li><strong>Leicht (1.375):</strong> 1–3×/Woche</li>
                            <li><strong>Moderat (1.55):</strong> 3–5×/Woche</li>
                            <li><strong>Sehr (1.725):</strong> 6–7×/Woche</li>
                            <li><strong>Extrem (1.9):</strong> sehr harte, tägliche Aktivität</li>
                        </ul>
                        <div class="calc-note calc-note--tight">
                            Merke: Viele überschätzen Aktivität. Wenn du unsicher bist → lieber eine Stufe niedriger starten.
                        </div>
                    </section>

                    <section id="cal_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formel</h4>
                        <div class="calc-note">Prinzip: <strong>BMR</strong> → mal Aktivität = <strong>TDEE</strong> → plus/minus Ziel.</div>
                        <div class="calc-formula calc-formula--first">
                            <span class="calc-formula-k">TDEE</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">BMR × Aktivitätsfaktor</span>
                        </div>
                        <div class="calc-formula">
                            <span class="calc-formula-k">Ziel</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">TDEE + (Defizit/Überschuss)</span>
                        </div>
                    </section>

                    <section id="cal_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">📐 Beispiel</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>Erhaltung 2600 kcal</span>
                                <span class="calc-example-strong">Cut: 2300–2400</span>
                            </div>
                            <div class="calc-example-sub">
                                Sauberer Cut = langsam. Wenn du dich killst, hältst du’s eh nicht.
                            </div>
                        </div>
                    </section>

                    <section id="cal_macros"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_macros' }"
                             tabindex="-1">
                        <h4 class="calc-h">🍚 Makros (deine Ausgabe)</h4>
                        <ul class="calc-list">
                            <li><strong>Kohlenhydrate (50%):</strong> Energie & Training</li>
                            <li><strong>Eiweiß (30%):</strong> Muskeln halten/aufbauen</li>
                            <li><strong>Fett (20%):</strong> Hormone/Sättigung</li>
                        </ul>
                        <div class="calc-note calc-note--tight">
                            Wenn du’s ernst meinst: Protein eher über g/kg steuern – Prozent sind nur “okay” als Default.
                        </div>
                    </section>
                </div>

                <div class="calc-callout">
                    <div class="calc-callout-title">🧠 Wann du die Zahl ignorieren darfst</div>
                    <ul class="calc-list">
                        <li>Du trackst sauber & dein <strong>Gewichtstrend</strong> sagt was anderes</li>
                        <li>Deine Aktivität schwankt brutal (Schicht/Job/Steps)</li>
                        <li>Du bist krank/gestresst → Appetit/NEAT sind Chaos</li>
                    </ul>
                </div>

                <div id="cal_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'cal_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">⚠️ Wichtig</div>
                    <ul class="calc-list">
                        <li>Das ist eine <strong>Schätzung</strong> – dein Körper ist die Wahrheit</li>
                        <li><strong>Tracking-Fehler</strong> sind #1 Grund für “funktioniert nicht”</li>
                        <li>Nach 2–3 Wochen Trend → in <strong>100–200 kcal</strong> Schritten anpassen</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">❓ Häufige Fragen</h4>
                    <ul class="calc-list">
                        <li><strong>„Warum nehme ich nicht ab?“</strong> → meistens Tracking/Aktivität überschätzt.</li>
                        <li><strong>„Warum bin ich im Defizit müde?“</strong> → zu hart, zu wenig Schlaf/Protein.</li>
                        <li><strong>„Muss ich Makros so machen?“</strong> → nein, das ist Default – Protein priorisieren.</li>
                    </ul>
                </section>
            </div>
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">Reality-Check ✅</div>
                <div class="calc-mini-text">
                    Die beste Kalorienzahl ist die, die deinen <strong>Trend</strong> trifft. Zahlen sind Start – Anpassung ist King.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ openInfoAndJump, maybeAutoCalc }">
            <UiCalculatorInput :modelValue="age ?? ''"
                               type="number"
                               inputmode="numeric"
                               label="Alter (Jahre)"
                               placeholder="z.B. 30"
                               @update:modelValue="(v) => { emit('update:calorieAge', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="gender"
                               as="select"
                               label="Geschlecht"
                               :options="[
      { label: 'Männlich', value: 'male' },
      { label: 'Weiblich', value: 'female' }
    ]"
                               @change="(v) => { emit('update:calorieGender', v as Gender); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="weight ?? ''"
                               type="number"
                               inputmode="decimal"
                               :label="`Körpergewicht (${unit === 'kg' ? 'kg' : 'lbs'})`"
                               :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                               @update:modelValue="(v) => { emit('update:calorieWeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               type="number"
                               inputmode="numeric"
                               label="Körpergröße (cm)"
                               placeholder="z.B. 175"
                               @update:modelValue="(v) => { emit('update:calorieHeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <div class="input-pair-tight">
                <label class="label-with-info">
                    Aktivitätslevel
                    <button type="button"
                            class="info-btn"
                            aria-label="Aktivitätslevel Erklärung öffnen"
                            title="Aktivitätslevel Erklärung öffnen"
                            @click="openInfoAndJump('cal_activity')">
                        <span class="info-emoji" aria-hidden="true">ℹ️</span>
                    </button>
                </label>

                <UiCalculatorInput :modelValue="activity"
                                   as="select"
                                   :options="[
          { label: 'Sitzend', value: '1.2' },
          { label: 'Leicht aktiv', value: '1.375' },
          { label: 'Moderat aktiv', value: '1.55' },
          { label: 'Sehr aktiv', value: '1.725' },
          { label: 'Extrem aktiv', value: '1.9' }
        ]"
                                   @change="(v) => { emit('update:calorieActivity', String(v)); maybeAutoCalc() }" />
            </div>

            <div class="input-pair-tight">
                <label class="label-with-info">
                    Kalorienziel
                    <button type="button"
                            class="info-btn"
                            aria-label="Kalorienziel Erklärung öffnen"
                            title="Was ist ein angemessenes Kalorienziel?"
                            @click="openInfoAndJump('cal_goal_guide')">
                        <span class="info-emoji" aria-hidden="true">ℹ️</span>
                    </button>
                </label>

                <UiCalculatorInput :modelValue="goal"
                                   as="select"
                                   :options="[
                                   { label: 'Erhaltung' , value: 0 },
                                   ...steps.map(n=>
                    ({ label: `+${n} kcal (Überschuss)`, value: n })),
                    ...steps.map(n => ({ label: `-${n} kcal (Defizit)`, value: -n }))
                    ]"
                    @change="(v) => { emit('update:calorieGoal', Number(v)); maybeAutoCalc() }" />
            </div>

        </template>


        <!-- Result -->
        <template #result>
            <div v-if="result">
                <p><strong>Gesamtkalorienbedarf:</strong> {{ result.total.toFixed(0) }} kcal</p>
                <ul class="result-list">
                    <li>Kohlenhydrate (50%): {{ result.macros.carbs.toFixed(0) }} g</li>
                    <li>Eiweiß (30%): {{ result.macros.protein.toFixed(0) }} g</li>
                    <li>Fett (20%): {{ result.macros.fat.toFixed(0) }} g</li>
                </ul>
            </div>
        </template>

        <template #result-sub>
            <div v-if="result" class="chart-container">
                <canvas id="macroChart"></canvas>
            </div>
        </template>

    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

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
        (e: 'invalid', errors: string[]): void
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
        () =>
            (props.info ?? '').trim() ||
            'Schätzt deinen Tagesbedarf (BMR → Aktivität → TDEE) und passt ihn mit deinem Kalorienziel an. Makros sind Default-Prozente.'
    )
    const copyText = computed<string | null>(() => {
        if (!result.value) return null

        const parts: string[] = []

        if (age.value != null) parts.push(`Alter: ${age.value}`)
        if (gender.value) parts.push(`Geschlecht: ${gender.value === 'male' ? 'männlich' : 'weiblich'}`)
        if (weight.value != null) parts.push(`Körpergewicht: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        if (height.value != null) parts.push(`Körpergröße: ${height.value} cm`)
        if (activity.value) parts.push(`Aktivität: ${activity.value}`)
        parts.push(`Ziel: ${goal.value > 0 ? '+' : ''}${goal.value} kcal`)

        parts.push(`Kalorien: ${result.value.total.toFixed(0)} kcal`)
        parts.push(
            `Makros: KH ${result.value.macros.carbs.toFixed(0)}g | EW ${result.value.macros.protein.toFixed(0)}g | F ${result.value.macros.fat.toFixed(0)}g`
        )

        return parts.join(' | ')
    })

    function validateCalories(): string[] {
        const errors: string[] = []

        const a = props.calorieAge
        if (a == null || Number.isNaN(a)) {
            errors.push('Bitte gib dein Alter (Jahre) ein.')
        } else {
            if (a <= 0) errors.push('Alter (Jahre) muss größer als 0 sein.')
            else if (a < 10) errors.push('Alter (Jahre) wirkt unrealistisch niedrig.')
            else if (a > 120) errors.push('Alter (Jahre) wirkt unrealistisch hoch.')
        }

        if (props.calorieGender !== 'male' && props.calorieGender !== 'female') {
            errors.push('Bitte wähle dein Geschlecht.')
        }

        const w = props.calorieWeight
        if (w == null || Number.isNaN(w)) {
            errors.push('Bitte gib dein Körpergewicht ein.')
        } else {
            if (w <= 0) errors.push('Körpergewicht muss größer als 0 sein.')
            else if (props.unit === 'kg' && w > 400) errors.push('Körpergewicht wirkt unrealistisch hoch (kg).')
            else if ((props.unit === 'lb' || props.unit === 'lbs') && w > 900) errors.push('Körpergewicht wirkt unrealistisch hoch (lbs).')
        }

        const h = props.calorieHeight
        if (h == null || Number.isNaN(h)) {
            errors.push('Bitte gib deine Körpergröße (cm) ein.')
        } else {
            if (h <= 0) errors.push('Körpergröße (cm) muss größer als 0 sein.')
            else if (h < 80) errors.push('Körpergröße (cm) wirkt unrealistisch niedrig.')
            else if (h > 250) errors.push('Körpergröße (cm) wirkt unrealistisch hoch.')
        }

        const act = String(props.calorieActivity ?? '').trim()
        if (!act) {
            errors.push('Bitte wähle dein Aktivitätslevel.')
        } else {
            const n = Number(act)
            const allowed = [1.2, 1.375, 1.55, 1.725, 1.9]
            if (!Number.isFinite(n) || !allowed.includes(n)) {
                errors.push('Aktivitätslevel ist ungültig.')
            }
        }

        const g = props.calorieGoal
        if (!Number.isFinite(g)) {
            errors.push('Kalorienziel ist ungültig.')
        } else if (Math.abs(g) > 2000) {
            errors.push('Kalorienziel wirkt unrealistisch hoch.')
        }

        return errors
    }

</script>

<style scoped>
    /* nur noch kleine helpers */
    .label-with-info {
        display: flex;
        align-items: center;
        gap: .45rem;
        font: inherit;
        font-size: .92rem;
        font-weight: 600;
        line-height: 1.1;
        letter-spacing: .01em;
        color: color-mix(in srgb, var(--text-primary) 88%, transparent);
    }

        .label-with-info .info-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

        .label-with-info .info-emoji {
            font-size: .95em;
        }

    .calc-card--wide {
        grid-column: 1 / -1;
    }

    .chart-container {
        height: 240px;
        margin-top: .5rem;
    }

    .input-pair-tight {
        display: flex;
        flex-direction: column;
        gap: .4rem; /* tighter label -> select spacing */
    }
</style>
