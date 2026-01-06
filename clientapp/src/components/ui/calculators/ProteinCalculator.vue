<!-- src/components/ui/calculators/ProteinCalculator.vue -->
<template>
    <BaseCalculator :title="title || 'Proteinbedarf-Rechner'"
                    :showInfo="true"
                    infoTitle="Proteinbedarf"
                    infoKicker="Rechner erklärt"
                    ariaOpen="Protein Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="info || defaultInfo"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateProtein"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="hasValidResult"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="onCalculateClick"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    @invalid="(errors) => $emit('invalid', errors)">

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="Protein Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">ℹ️ Was ist der Proteinbedarfsrechner?</span>
                </div>

                <div class="calc-hero-sub">
                    Er schätzt deinen täglichen Proteinbedarf anhand von Gewicht, Ziel und Aktivität – damit du eine sinnvolle Orientierung hast.
                </div>

                <div class="calc-hero-pills" aria-label="Schnellnavigation">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">⚙️ So wird’s geschätzt</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_factors')">📌 Was beeinflusst das?</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">⚠️ Grenzen</button>
                </div>
            </div>
        </template>

        <!-- Popup -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="hasValidResult"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">✅ Dein Ergebnis</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>Empfehlung/Tag:</strong> {{ roundedGramsPerDay }} g
                            <span v-if="hasValidFactor"> ({{ formattedFactor }} g/kg)</span>
                        </div>

                        <div v-if="showGramsPerMeal" class="calc-note calc-note--tight">
                            ≈ {{ roundedGramsPerMeal }} g pro Mahlzeit (bei {{ meals }} Mahlzeiten/Tag)
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
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('calc_factors')">📌 Faktoren</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">⚠️ Grenzen</button>

                    <button class="calc-chip"
                            type="button"
                            :disabled="!hasValidResult"
                            :aria-disabled="!hasValidResult"
                            :class="{ 'is-disabled': !hasValidResult }"
                            :title="hasValidResult ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                            @click="() => { onCopy?.(); jumpTo('calc_you') }">
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
                            Der Rechner schätzt deinen Proteinbedarf aus <strong>Gewicht</strong>, <strong>Ziel</strong> und <strong>Aktivität</strong>.
                        </div>

                        <ul class="calc-list calc-list--spaced">
                            <li><strong>Gut:</strong> einfacher Richtwert für deinen Tag</li>
                            <li><strong>Wichtig:</strong> im Cut und bei viel Training ist meist mehr sinnvoll</li>
                            <li><strong>Merke:</strong> Konstanz schlägt Perfektion — Hauptsache du triffst deinen Bereich</li>
                        </ul>
                    </div>
                </div>

                <div id="calc_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                    <ul class="calc-list">
                        <li><strong>Muskelaufbau:</strong> Protein gut verteilen + progressives Training</li>
                        <li><strong>Fettverlust:</strong> Protein hilft beim Sattsein + Muskeln halten</li>
                        <li><strong>Gewicht halten:</strong> solide Basis reicht, wenn Training & Alltag passen</li>
                    </ul>
                </div>

                <div id="calc_what"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_what' }"
                     tabindex="-1">
                    <div class="calc-callout-title">🧱 Was sind Proteine?</div>
                    <ul class="calc-list">
                        <li><strong>Baustoff:</strong> Proteine sind „Baumaterial“ für Muskeln, Organe, Haut & Haare</li>
                        <li><strong>Funktion:</strong> sie stecken auch in Enzymen, Hormonen & Immunsystem</li>
                        <li><strong>Bestehen aus:</strong> <strong>Aminosäuren</strong> (deine Bausteine)</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">👥 Für wen ist das sinnvoll?</h4>
                        <ul class="calc-list">
                            <li>✅ Krafttraining / Fitness / Alltag</li>
                            <li>✅ Ernährung grob strukturieren</li>
                            <li>⚠️ Sonderfälle (Niere/Erkrankungen) → ärztlich abklären</li>
                        </ul>
                    </section>

                    <section id="calc_factors"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_factors' }"
                             tabindex="-1">
                        <h4 class="calc-h">📌 Was beeinflusst den Bedarf?</h4>
                        <ul class="calc-list">
                            <li><strong>Ziel:</strong> Cut braucht oft mehr (Muskelschutz)</li>
                            <li><strong>Aktivität:</strong> mehr Training → mehr Bedarf</li>
                            <li><strong>Körpergewicht:</strong> Basis für g/kg</li>
                        </ul>
                    </section>

                    <section id="calc_aminos"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_aminos' }"
                             tabindex="-1">
                        <h4 class="calc-h">🧬 Was sind Aminosäuren?</h4>
                        <ul class="calc-list">
                            <li><strong>Bausteine von Protein:</strong> dein Körper baut daraus Muskeln, Enzyme & Hormone</li>
                            <li><strong>Essentiell:</strong> einige kann der Körper nicht selbst herstellen → müssen über Essen rein</li>
                            <li><strong>Qualität:</strong> je “vollständiger” das Aminoprofil, desto leichter deckst du alles ab</li>
                        </ul>
                    </section>

                    <section id="calc_sources"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_sources' }"
                             tabindex="-1">
                        <h4 class="calc-h">🥚 Tierisch vs. pflanzlich</h4>
                        <ul class="calc-list">
                            <li><strong>Aminos:</strong> tierisch meist “komplett”, pflanzlich teils limitierend</li>
                            <li><strong>Lösung:</strong> pflanzlich einfach kombinieren (z. B. Getreide + Hülsenfrüchte)</li>
                            <li><strong>Praxis:</strong> beides zählt – Hauptsache du triffst deinen Bereich</li>
                        </ul>
                    </section>

                    <section id="calc_hard"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_hard' }"
                             tabindex="-1">
                        <h4 class="calc-h">🧩 Wenn du’s nicht schaffst</h4>
                        <ul class="calc-list">
                            <li><strong>Mehr Mahlzeiten:</strong> kleiner splitten, leichter treffen</li>
                            <li><strong>Split:</strong> 1–2 Protein-Snacks am Tag</li>
                            <li><strong>Shake:</strong> trinken ist oft leichter</li>
                            <li><strong>Upgrade:</strong> gleiche Mahlzeit + Proteinquelle drauf</li>
                            <li><strong>Fixer Anker:</strong> jede Mahlzeit bekommt eine Protein-Basis (z. B. Quark, Eier, Tofu, Hähnchen)</li>
                            <li><strong>Merke:</strong> Wochenschnitt &gt; perfekter Tag</li>
                        </ul>
                    </section>

                    <div id="calc_foods"
                         class="calc-callout"
                         :class="{ 'calc-target': activeTargetId === 'calc_foods' }"
                         tabindex="-1">
                        <div class="calc-callout-title">🍗 Gute Proteinquellen (Ø pro 100g)</div>
                        <ul class="calc-list">
                            <li><strong>Parmesan:</strong> ~35g</li>
                            <li><strong>Hähnchenbrust:</strong> ~31g</li>
                            <li><strong>Erdnüsse:</strong> ~26g</li>
                            <li><strong>Thunfisch:</strong> ~25g</li>
                            <li><strong>Lachs:</strong> ~20g</li>
                            <li><strong>Eier:</strong> ~13g</li>
                            <li><strong>Tofu:</strong> ~12–16g</li>
                            <li><strong>Magerquark/Skyr:</strong> ~10–12g</li>
                        </ul>
                        <div class="calc-note">Werte sind grobe Richtwerte – je nach Produkt/Marke leicht unterschiedlich.</div>
                    </div>

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formel (vereinfacht)</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">Protein</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">Gewicht (kg) × Faktor (g/kg)</span>
                        </div>
                        <div class="calc-note">
                            Hinweis: Bei lbs wird intern in kg umgerechnet.
                        </div>
                    </section>

                    <section id="calc_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">📐 Beispiel</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>75&nbsp;kg, Muskelaufbau, moderat aktiv</span>
                                <span class="calc-example-strong">≈ {{ Math.round(75 * 1.8) }}&nbsp;g</span>
                            </div>
                            <div class="calc-example-sub">
                                Das ist ein Richtwert — entscheidend ist, dass du ihn regelmäßig triffst.
                            </div>
                        </div>
                    </section>
                </div>

                <div id="calc_ignore"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_ignore' }"
                     tabindex="-1">
                    <div class="calc-callout-title">🧠 Wann du den Rechner locker ignorieren darfst</div>
                    <ul class="calc-list">
                        <li>Du triffst deinen Proteinbereich ohnehin zuverlässig</li>
                        <li>Dein Gewicht/Training ist stabil und du fühlst dich fit</li>
                        <li>Du willst nur grob “genug” essen, ohne Zahlen zu tracken</li>
                    </ul>
                </div>

                <div id="calc_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'calc_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                    <ul class="calc-list">
                        <li><strong>Ein “perfekter” Wert</strong> existiert nicht → triff einen Bereich</li>
                        <li><strong>Extrem wenig Essen</strong> oder Crash-Diäten → Muskelverlust-Risiko</li>
                        <li><strong>Gesundheit/Medikamente</strong> → im Zweifel medizinisch abklären</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">❓ Häufige Fragen</h4>
                    <ul class="calc-list">
                        <li><strong>„Muss ich jeden Tag exakt treffen?“</strong> → nein, der Wochenschnitt zählt.</li>
                        <li><strong>„Warum hängt das vom Ziel ab?“</strong> → im Cut schützt mehr Protein eher deine Muskelmasse.</li>
                        <li><strong>„Ist mehr immer besser?“</strong> → nicht unbedingt. Triff deinen Bereich, dann passt’s.</li>
                    </ul>
                </section>
            </div>
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">Reality-Check ✅</div>
                <div class="calc-mini-text">
                    Wenn du <strong>regelmäßig trainierst</strong> und dein Protein <strong>halbwegs triffst</strong>, bist du schon sehr weit.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ maybeAutoCalc, normalizeNumberInput }">
            <UiCalculatorInput :modelValue="weightInputValue"
                               :label="`Körpergewicht (${unitNormalized === 'kg' ? 'kg' : 'lbs'})`"
                               type="text"
                               inputmode="decimal"
                               autocomplete="off"
                               :placeholder="unitNormalized === 'kg' ? 'z. B. 75' : 'z. B. 165'"
                               @update:modelValue="(v) => { onWeightInputValue(v, normalizeNumberInput); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="goal"
                               as="select"
                               label="Ziel"
                               @update:modelValue="(v) => { emit('update:proteinGoal', String(v) as Goal); maybeAutoCalc() }"
                               :options="[
                           { label: 'Fettverlust', value: 'cut' },
                           { label: 'Gewicht halten', value: 'maintain' },
                           { label: 'Muskelaufbau', value: 'bulk' },
                       ]" />

            <UiCalculatorInput :modelValue="activityEffective"
                               as="select"
                               label="Aktivität"
                               @update:modelValue="(v) => { emit('update:proteinActivity', String(v) as Activity); maybeAutoCalc() }"
                               :options="[
                           { label: 'Niedrig', value: 'low' },
                           { label: 'Moderat', value: 'moderate' },
                           { label: 'Hoch', value: 'high' },
                       ]" />

            <UiCalculatorInput :modelValue="mealsInputValue"
                               label="Mahlzeiten/Tag (optional)"
                               type="text"
                               inputmode="numeric"
                               autocomplete="off"
                               placeholder="z. B. 3"
                               hint="Wenn gesetzt, zeigen wir zusätzlich g pro Mahlzeit."
                               @update:modelValue="(v) => { onMealsInputValue(v); }" />
        </template>


        <!-- Result -->
        <template #result>
            <p v-if="hasValidResult">
                <strong>Empfehlung/Tag:</strong>
                {{ roundedGramsPerDay }} g
                <span v-if="hasValidFactor">({{ formattedFactor }} g/kg)</span>
            </p>
        </template>

        <template #result-sub>
            <p v-if="showGramsPerMeal" class="result-sub">
                ≈ {{ roundedGramsPerMeal }} g pro Mahlzeit (bei {{ meals }} Mahlzeiten/Tag)
            </p>
        </template>
    </BaseCalculator>
</template>


<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type Goal = 'maintain' | 'bulk' | 'cut'
    type Activity = 'low' | 'moderate' | 'high'

    interface ProteinResult {
        recommend: number
        factor: number
        weightDisplay?: string
    }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        proteinWeight: number | null
        proteinGoal: Goal
        proteinActivity: Activity | null
        proteinMeals: number | null
        proteinResult?: ProteinResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:proteinWeight', v: number | null): void
        (e: 'update:proteinGoal', v: Goal): void
        (e: 'update:proteinActivity', v: Activity): void
        (e: 'update:proteinMeals', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const copyText = computed<string | null>(() => {
        if (!hasValidResult.value) return null

        const parts: string[] = []

        if (props.proteinWeight != null) {
            parts.push(`Körpergewicht: ${props.proteinWeight} ${unitNormalized.value === 'kg' ? 'kg' : 'lbs'}`)
        }

        parts.push(`Ziel: ${props.proteinGoal}`)
        parts.push(`Aktivität: ${activityEffective.value}`)

        if (props.proteinMeals != null) parts.push(`Mahlzeiten/Tag: ${props.proteinMeals}`)

        parts.push(`Protein/Tag: ${roundedGramsPerDay.value} g`)
        if (hasValidFactor.value) parts.push(`Faktor: ${formattedFactor.value} g/kg`)
        if (showGramsPerMeal.value) parts.push(`Pro Mahlzeit: ${roundedGramsPerMeal.value} g`)

        return parts.join(' | ')
    })

    /* ==== Helpers ==== */
    const LBS_TO_KG = 0.45359237
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    const unitNormalized = computed<'kg' | 'lbs'>(() => {
        const u = String(props.unit || 'kg').toLowerCase()
        return u === 'lb' || u === 'lbs' ? 'lbs' : 'kg'
    })

    /** Fallback: immer gültige Aktivität */
    const activityEffective = computed<Activity>(() => {
        const a = (props.proteinActivity as Activity | null) ?? null
        return a === 'low' || a === 'moderate' || a === 'high' ? a : 'moderate'
    })

    function proteinFactor(goal: Goal, activity: Activity): number {
        let base = goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : 1.6
        const delta = activity === 'low' ? -0.2 : activity === 'high' ? 0.3 : 0.0
        return clamp(base + delta, 1.2, 2.7)
    }

    function computeLocalResult(): ProteinResult | null {
        const weightLabel = `Körpergewicht (${unitNormalized.value === 'kg' ? 'kg' : 'lbs'})`

        const w = props.proteinWeight
        if (w == null || Number.isNaN(w)) {
            errors.push(`Bitte gib dein ${weightLabel} ein.`)
            return errors
        }

        if (w <= 0) errors.push(`${weightLabel} muss größer als 0 sein.`)
        else if (unitNormalized.value === 'kg' && w > 400) errors.push(`${weightLabel} wirkt unrealistisch hoch.`)
        else if (unitNormalized.value === 'lbs' && w > 900) errors.push(`${weightLabel} wirkt unrealistisch hoch.`)

    }

    /* Lokaler Fallback */
    const internalResult = ref<ProteinResult | null>(null)

    /* Auto-Recompute */
    watch(
        () => [props.proteinWeight, props.proteinGoal, activityEffective.value, unitNormalized.value],
        () => {
            if (props.autoCalcEnabled) internalResult.value = computeLocalResult()
        },
        { immediate: true }
    )

    const effectiveResult = computed<ProteinResult | null>(() => {
        return props.autoCalcEnabled
            ? (internalResult.value ?? props.proteinResult ?? null)
            : (props.proteinResult ?? internalResult.value ?? null)
    })

    /* ==== Bindings & Anzeige ==== */
    const goal = computed(() => props.proteinGoal)
    const meals = computed(() => props.proteinMeals ?? null)

    const weightInputValue = computed(() =>
        props.proteinWeight == null || Number.isNaN(props.proteinWeight) ? '' : String(props.proteinWeight)
    )
    const mealsInputValue = computed(() =>
        props.proteinMeals == null || Number.isNaN(props.proteinMeals) ? '' : String(props.proteinMeals)
    )

    const hasValidResult = computed(() =>
        !!effectiveResult.value && Number.isFinite(effectiveResult.value!.recommend) && effectiveResult.value!.recommend > 0
    )
    const hasValidFactor = computed(() =>
        !!effectiveResult.value && Number.isFinite(effectiveResult.value!.factor) && effectiveResult.value!.factor > 0
    )
    const showGramsPerMeal = computed(() => !!effectiveResult.value && !!props.proteinMeals && props.proteinMeals! >= 1)

    const roundedGramsPerDay = computed(() => (hasValidResult.value ? Math.round(effectiveResult.value!.recommend) : 0))
    const roundedGramsPerMeal = computed(() => {
        if (!showGramsPerMeal.value) return 0
        const perMeal = effectiveResult.value!.recommend / Number(props.proteinMeals)
        return Number.isFinite(perMeal) && perMeal > 0 ? Math.round(perMeal) : 0
    })
    const formattedFactor = computed(() => (hasValidFactor.value ? effectiveResult.value!.factor.toFixed(2) : ''))

    const defaultInfo =
        'Schätzt deinen Proteinbedarf (g/Tag) aus Gewicht, Ziel und Aktivität. Richtwert, keine medizinische Beratung.'

    /* ==== Events ==== */
    function onCalculateClick() {
        internalResult.value = computeLocalResult()
        emit('calculate')
    }
    function onWeightInputValue(v: string | number, normalize?: (raw: string) => string) {
        const raw0 = String(v ?? '')
        const raw = normalize ? normalize(raw0) : raw0.trim().replace(',', '.')
        if (raw === '') return emit('update:proteinWeight', null)

        const n = Number(raw)
        emit('update:proteinWeight', Number.isFinite(n) ? n : null)
    }

    function onMealsInputValue(v: string | number) {
        const raw = String(v ?? '').replace(/[^\d]/g, '')
        if (raw === '') return emit('update:proteinMeals', null)

        const n = Number(raw)
        emit('update:proteinMeals', Number.isFinite(n) ? Math.max(1, Math.floor(n)) : null)
    }

    function validateProtein(): string[] {
        const errors: string[] = []

        const w = props.proteinWeight
        if (w == null || Number.isNaN(w)) {
            errors.push('Bitte gib dein Körpergewicht (kg) ein.')
            return errors
        }

        if (w <= 0) errors.push('Körpergewicht (kg) muss größer als 0 sein.')
        else if (unitNormalized.value === 'kg' && w > 400) errors.push('Körpergewicht (kg) wirkt unrealistisch hoch.')
        else if (unitNormalized.value === 'lbs' && w > 900) errors.push('Körpergewicht (kg) wirkt unrealistisch hoch.') // Label bleibt bewusst wie Input

        const g = props.proteinGoal
        if (g !== 'cut' && g !== 'maintain' && g !== 'bulk') {
            errors.push('Bitte wähle dein Ziel.')
        }

        const a = props.proteinActivity
        if (a == null || (a !== 'low' && a !== 'moderate' && a !== 'high')) {
            errors.push('Bitte wähle deine Aktivität.')
        }

        const m = props.proteinMeals
        if (m != null) {
            if (!Number.isFinite(m)) errors.push('Mahlzeiten/Tag (optional) ist ungültig.')
            else if (m < 1) errors.push('Mahlzeiten/Tag (optional) muss mindestens 1 sein.')
            else if (m > 20) errors.push('Mahlzeiten/Tag (optional) wirkt unrealistisch hoch.')
        }

        return errors
    }

</script>

<style scoped>
    .result-sub {
        font-size: .95rem;
        color: var(--text-secondary);
    }
</style>
