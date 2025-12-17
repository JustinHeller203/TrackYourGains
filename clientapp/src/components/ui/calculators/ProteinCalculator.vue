<!-- src/components/ui/calculators/ProteinCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Proteinbedarf-Rechner' }}

                <ExplanationPopup title="Proteinbedarf"
                                  kicker="Rechner erklärt"
                                  aria-open="Protein Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="info || defaultInfo">
                    <template #graphic>
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
                                    :aria-disabled="(!hasValidResult).toString()"
                                    :class="{ 'is-disabled': !hasValidResult }"
                                    :title="hasValidResult ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                                    @click="copyPopupSummary()">
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

                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                Wenn du <strong>regelmäßig trainierst</strong> und dein Protein <strong>halbwegs triffst</strong>, bist du schon sehr weit.
                            </div>
                        </div>
                    </template>
                </ExplanationPopup>
            </h3>


            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzufügen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <!-- Körpergewicht -->
        <div class="input-group">
            <label>Körpergewicht ({{ unitNormalized === 'kg' ? 'kg' : 'lbs' }})</label>
            <input :value="weightInputValue"
                   @input="onWeightInput"
                   type="number"
                   :placeholder="unitNormalized === 'kg' ? 'z. B. 75' : 'z. B. 165'"
                   class="edit-input"
                   step="any"
                   min="0" />
        </div>

        <!-- Ziel -->
        <div class="input-group">
            <label>Ziel</label>
            <select :value="goal" @change="onGoalChange" class="edit-input">
                <option value="cut">Fettverlust</option>
                <option value="maintain">Gewicht halten</option>
                <option value="bulk">Muskelaufbau</option>
            </select>
        </div>

        <!-- Aktivität -->
        <div class="input-group">
            <label>Aktivität</label>
            <select :value="activityEffective" @change="onActivityChange" class="edit-input">
                <option value="low">Niedrig</option>
                <option value="moderate">Moderat</option>
                <option value="high">Hoch</option>
            </select>
        </div>

        <!-- Optional: Mahlzeiten -->
        <div class="input-group">
            <label>Anzahl Mahlzeiten/Tag (optional)</label>
            <input :value="mealsInputValue"
                   @input="onMealsInput"
                   type="number"
                   placeholder="z. B. 3"
                   class="edit-input"
                   min="1"
                   step="1" />
            <p class="hint">Wenn gesetzt, zeigen wir zusätzlich g pro Mahlzeit.</p>
        </div>

        <!-- Manuelles Berechnen -->
        <CalculateButton v-if="!autoCalcEnabled" @click="onCalculateClick" />

        <!-- Ergebnis -->
        <div v-if="hasValidResult" class="result">
            <div class="result-header">
                <p>
                    <strong>Empfehlung/Tag:</strong>
                    {{ roundedGramsPerDay }} g
                    <span v-if="hasValidFactor">({{ formattedFactor }} g/kg)</span>
                </p>
                <CopyButton @click="$emit('copy')" />
            </div>

            <p v-if="showGramsPerMeal" class="result-sub">
                ≈ {{ roundedGramsPerMeal }} g pro Mahlzeit (bei {{ meals }} Mahlzeiten/Tag)
            </p>
        </div>

        <div class="card-footer">
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
    import { ref, computed, watch } from 'vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'

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
    }>()

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
        const w = props.proteinWeight
        if (w == null || !Number.isFinite(w) || w <= 0) return null
        const weightKg = unitNormalized.value === 'kg' ? w : w * LBS_TO_KG
        const factor = proteinFactor(props.proteinGoal, activityEffective.value)
        const recommend = weightKg * factor
        return { recommend, factor, weightDisplay: `${weightKg.toFixed(1)} kg` }
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

    /* Ergebnis-Priorität:
       - autoCalcEnabled: nimm lokal (snappier UI)
       - sonst: nimm Parent, fallback lokal
    */
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

    const activeTargetId = ref<string | null>(null)
    let activeTargetTimer: number | null = null

    function jumpTo(id: string) {
        const el = document.getElementById(id)
        if (!el) return

        if (activeTargetTimer) window.clearTimeout(activeTargetTimer)
        activeTargetId.value = id

        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ; (el as HTMLElement).focus?.({ preventScroll: true })

        activeTargetTimer = window.setTimeout(() => {
            activeTargetId.value = null
            activeTargetTimer = null
        }, 1400)
    }

    async function copyPopupSummary() {
        if (!hasValidResult.value) return

        const parts: string[] = []

        if (props.proteinWeight != null) {
            parts.push(`Gewicht: ${props.proteinWeight} ${unitNormalized.value === 'kg' ? 'kg' : 'lbs'}`)
        }

        parts.push(`Ziel: ${props.proteinGoal}`)
        parts.push(`Aktivität: ${activityEffective.value}`)

        if (props.proteinMeals != null) parts.push(`Mahlzeiten/Tag: ${props.proteinMeals}`)

        if (hasValidResult.value) {
            parts.push(`Protein/Tag: ${roundedGramsPerDay.value} g`)
            if (hasValidFactor.value) parts.push(`Faktor: ${formattedFactor.value} g/kg`)
            if (showGramsPerMeal.value) parts.push(`Pro Mahlzeit: ${roundedGramsPerMeal.value} g`)
        }

        const text = parts.join(' | ')
        try {
            await navigator.clipboard.writeText(text)
            emit('copy')
            activeTargetId.value = 'calc_you'
            window.setTimeout(() => (activeTargetId.value = null), 700)
        } catch {
            // optional später: Fehler-Toast
        }
    }


    /* ==== Events ==== */
    function onCalculateClick() {
        internalResult.value = computeLocalResult()
        emit('calculate')
    }
    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value.trim()
        const value = raw === '' ? null : Number(raw)
        emit('update:proteinWeight', raw === '' || Number.isNaN(value) ? null : value)
    }
    function onGoalChange(e: Event) {
        const val = (e.target as HTMLSelectElement).value as Goal
        emit('update:proteinGoal', (val ?? props.proteinGoal) as Goal)
    }
    function onActivityChange(e: Event) {
        const val = (e.target as HTMLSelectElement).value as Activity
        emit('update:proteinActivity', (val ?? activityEffective.value) as Activity)
    }
    function onMealsInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value.trim()
        if (raw === '') return emit('update:proteinMeals', null)
        const parsed = Number(raw)
        emit('update:proteinMeals', Number.isNaN(parsed) ? null : Math.max(1, Math.floor(parsed)))
    }
</script>

<style scoped>
    /* Bewusst nur die Teile, die nicht in globale Styles ausgelagert sind */
    .calculator-card {
        position: relative;
        /* overflow entfernt, damit InfoHover-Tooltip nicht abgeschnitten wird */
        display: flex;
        flex-direction: column;
        align-items: stretch;
        text-align: left;
        padding: 1.6rem 1.8rem 1.1rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        gap: 0.75rem;
        color: var(--text-primary);
        transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 0.61, 0.36, 1), border-color 220ms ease-out, background 260ms ease-out;
        will-change: transform, box-shadow;
    }


    /* Hover nur auf Geräten mit Maus */
    @media (hover: hover) {
        .calculator-card:hover {
            /* nur noch verschieben, kein Scale -> Text bleibt scharf */
            transform: translateY(-4px);
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4);
            border-color: rgba(129, 140, 248, 0.7);
            background: radial-gradient( circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55% ), radial-gradient( circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60% ), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
        }
    }

    /* Dark-Mode-Variante wie bei den DashboardCards */
    html.dark-mode .calculator-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Kleine Screens: etwas kompakter */
    @media (max-width: 600px) {
        .calculator-card {
            padding: 1.25rem 1.2rem 0.9rem;
            border-radius: 16px;
        }
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
        margin-top: .4rem;
        font-size: .85rem;
        color: var(--text-secondary);
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

    .result-sub {
        font-size: .95rem;
        color: var(--text-secondary);
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
</style>
