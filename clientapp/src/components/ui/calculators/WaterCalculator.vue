<!-- src/components/ui/calculators/WaterCalculator.vue -->
<template>
    <BaseCalculator :title="title || 'Wasserbedarfsrechner'"
                    :showInfo="true"
                    infoTitle="Wasserbedarf"
                    infoKicker="Rechner erklärt"
                    ariaOpen="Wasser Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="waterResult != null"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')">

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="Wasser Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">💧 Wie viel Wasser brauchst du?</span>
                </div>

                <div class="calc-hero-sub">
                    Richtwert für deinen Tag – kein medizinisches Urteil.
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
                <div v-if="waterResult != null"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">✅ Dein Ergebnis</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>Täglicher Wasserbedarf:</strong> {{ waterResult!.toFixed(1) }} Liter
                        </div>

                        <div class="calc-note calc-note--tight">
                            Tipp: Verteile das über den Tag, nicht „alles auf einmal“.
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
                            :disabled="waterResult == null"
                            :aria-disabled="waterResult == null"
                            :class="{ 'is-disabled': waterResult == null }"
                            :title="waterResult == null ? 'Erst berechnen, dann kopieren' : 'Kopieren'"
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
                            Der Rechner schätzt deinen Bedarf aus <strong>Gewicht</strong>, <strong>Aktivität</strong> und <strong>Klima</strong>.
                        </div>

                        <ul class="calc-list calc-list--spaced">
                            <li><strong>Gut:</strong> einfache Orientierung für deinen Alltag</li>
                            <li><strong>Wichtig:</strong> Durst + Urinfarbe + Trainingstage zählen mit</li>
                            <li><strong>Merke:</strong> bei Hitze/Schweiß brauchst du spürbar mehr</li>
                        </ul>
                    </div>
                </div>

                <div id="calc_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                    <ul class="calc-list">
                        <li><strong>Wenn du oft Kopfweh/müde bist:</strong> check zuerst Wasser + Schlaf</li>
                        <li><strong>Wenn du viel schwitzt:</strong> mehr trinken + ggf. Elektrolyte</li>
                        <li><strong>Wenn du selten Durst hast:</strong> feste Trink-Routinen bauen</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">👥 Für wen ist das sinnvoll?</h4>
                        <ul class="calc-list">
                            <li>✅ Alltag / Fitness / grobe Richtwerte</li>
                            <li>⚠️ Viel Schwitzen / lange Ausdauer → eher höher ansetzen</li>
                            <li>❌ Medizinische Sonderfälle → Arzt/Ärztin fragen</li>
                        </ul>
                    </section>

                    <section id="calc_factors"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_factors' }"
                             tabindex="-1">
                        <h4 class="calc-h">📌 Was beeinflusst den Bedarf?</h4>
                        <ul class="calc-list">
                            <li><strong>Gewicht:</strong> mehr Körpermasse → mehr Grundbedarf</li>
                            <li><strong>Aktivität:</strong> Schweiß/Atmung → Extra-Flüssigkeit</li>
                            <li><strong>Klima:</strong> Hitze/trockene Luft → höhere Verluste</li>
                        </ul>
                    </section>

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formel (vereinfacht)</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">Wasser</span>
                            <span class="calc-formula-eq">≈</span>
                            <span class="calc-formula-v">Gewicht × Basisfaktor + Zuschläge (Aktivität/Klima)</span>
                        </div>
                        <div class="calc-note">
                            Richtwert. Flüssigkeit aus Essen zählt auch (z.B. Obst, Suppe).
                        </div>
                    </section>

                    <section id="calc_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">📐 Beispiel</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>75&nbsp;kg, moderat aktiv, gemäßigt</span>
                                <span class="calc-example-strong">≈ 2,5–3,0&nbsp;L</span>
                            </div>
                            <div class="calc-example-sub">
                                Bei heißem Klima oder viel Schweiß: eher Richtung <strong>oberes Ende</strong>.
                            </div>
                        </div>
                    </section>
                </div>

                <div id="calc_ignore"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_ignore' }"
                     tabindex="-1">
                    <div class="calc-callout-title">🧠 Wann du den Wasserbedarfsrechner locker ignorieren darfst</div>
                    <ul class="calc-list">
                        <li>Du hast <strong>normalen Durst</strong> und trinkst über den Tag verteilt</li>
                        <li>Dein Urin ist meist <strong>hellgelb</strong></li>
                        <li>Du bist <strong>leistungsfähig</strong> ohne Dehydrierungs-Symptome</li>
                        <li>Keine <strong>medizinischen Sonderfälle</strong> (Herz/Niere etc.)</li>
                    </ul>
                </div>

                <div id="calc_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'calc_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                    <ul class="calc-list">
                        <li><strong>Zu viel auf einmal</strong> bringt nix → über den Tag verteilen</li>
                        <li><strong>Sehr viel Training/Hitze</strong> → Elektrolyte können relevant sein</li>
                        <li><strong>Medikamente/Erkrankungen</strong> → Bedarf kann abweichen</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">❓ Häufige Fragen</h4>
                    <ul class="calc-list">
                        <li><strong>„Zählt Kaffee?“</strong> → ja, aber Wasser bleibt King.</li>
                        <li><strong>„Woran merke ich zu wenig?“</strong> → Durst, dunkler Urin, Leistung droppt.</li>
                        <li><strong>„Ab wann ist Wasser giftig?“</strong> → „zu viel, zu schnell“ kann gefährlich werden (Natrium wird verdünnt).</li>
                        <li><strong>„Kann ich zu viel trinken?“</strong> → ja, selten – passiert eher bei „zu viel, zu schnell“.</li>
                    </ul>
                </section>
            </div>
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">Reality-Check ✅</div>
                <div class="calc-mini-text">
                    Trink so, dass du dich stabil fühlst: <strong>Durst</strong>, <strong>Urinfarbe</strong>, <strong>Training</strong> = die echten Marker.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ maybeAutoCalc, normalizeNumberInput }">
            <div class="input-group">
                <label>Körpergewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
                <input :value="weightInputValue"
                       @input="(e) => { onWeightInput(e, normalizeNumberInput); maybeAutoCalc() }"
                       type="text"
                       inputmode="decimal"
                       autocomplete="off"
                       :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                       class="edit-input" />
            </div>

            <div class="input-group">
                <label>Aktivitätslevel</label>
                <select :value="activity" @change="(e) => { onActivityChange(e); maybeAutoCalc() }" class="edit-input">
                    <option value="low">Niedrig (kein Sport)</option>
                    <option value="moderate">Moderat (1-3x/Woche)</option>
                    <option value="high">Hoch (4-7x/Woche)</option>
                </select>
            </div>

            <div class="input-group">
                <label>Klima</label>
                <select :value="climate" @change="(e) => { onClimateChange(e); maybeAutoCalc() }" class="edit-input">
                    <option value="temperate">Gemäßigt</option>
                    <option value="hot">Heiß</option>
                    <option value="very_hot">Sehr heiß</option>
                </select>
            </div>
        </template>

        <!-- Result -->
        <template #result>
            <div v-if="waterResult != null">
                <p><strong>Täglicher Wasserbedarf:</strong> {{ waterResult!.toFixed(1) }} Liter</p>
            </div>
        </template>

    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed, onMounted, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { LS_PROGRESS_WATER_INPUTS_V1 } from '@/constants/storageKeys'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type Activity = 'low' | 'moderate' | 'high'
    type Climate = 'temperate' | 'hot' | 'very_hot'
    type NormalizeFn = (raw: string) => string

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        waterWeight: number | null
        waterActivity: Activity
        waterClimate: Climate
        waterResult: number | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:waterWeight', v: number | null): void
        (e: 'update:waterActivity', v: Activity): void
        (e: 'update:waterClimate', v: Climate): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    const activity = computed(() => props.waterActivity)
    const climate = computed(() => props.waterClimate)

    const waterResult = computed(() => props.waterResult)

    const defaultInfo =
        'Schätzt deinen täglichen Wasserbedarf aus Gewicht, Aktivität und Klima. Richtwerte, keine medizinische Beratung.'

    const infoText = computed(() => props.info ?? defaultInfo)

    const weightInputValue = computed(() =>
        props.waterWeight == null || Number.isNaN(props.waterWeight) ? '' : String(props.waterWeight)
    )

    const copyText = computed<string | null>(() => {
        if (props.waterResult == null) return null

        const unitLower = String(props.unit || '').toLowerCase()
        const u = (unitLower === 'lbs' || unitLower === 'lb') ? 'lbs' : 'kg'

        const parts: string[] = []
        if (props.waterWeight != null) parts.push(`Gewicht: ${props.waterWeight} ${u}`)
        if (props.waterActivity) parts.push(`Aktivität: ${props.waterActivity}`)
        if (props.waterClimate) parts.push(`Klima: ${props.waterClimate}`)
        parts.push(`Wasserbedarf: ${props.waterResult.toFixed(1)} L/Tag`)

        return parts.join(' | ')
    })

    function onWeightInput(e: Event, normalize?: NormalizeFn) {
        const raw0 = (e.target as HTMLInputElement).value
        const raw = normalize ? normalize(raw0) : raw0.trim().replace(',', '.')
        if (raw === '') {
            emit('update:waterWeight', null)
            return
        }
        const n = Number(raw)
        if (Number.isFinite(n)) emit('update:waterWeight', n)
    }

    function onActivityChange(e: Event) {
        emit('update:waterActivity', (e.target as HTMLSelectElement).value as Activity)
    }

    function onClimateChange(e: Event) {
        emit('update:waterClimate', (e.target as HTMLSelectElement).value as Climate)
    }

    const LS_KEY = LS_PROGRESS_WATER_INPUTS_V1

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)

            if (props.waterWeight == null && Number.isFinite(data.weight)) emit('update:waterWeight', data.weight)

            if (data.activity === 'low' || data.activity === 'moderate' || data.activity === 'high') {
                emit('update:waterActivity', data.activity)
            }
            if (data.climate === 'temperate' || data.climate === 'hot' || data.climate === 'very_hot') {
                emit('update:waterClimate', data.climate)
            }
        } catch { }
    })

    watch(
        () => [props.waterWeight, props.waterActivity, props.waterClimate],
        ([w, a, c]) => {
            try {
                localStorage.setItem(LS_KEY, JSON.stringify({ weight: w, activity: a, climate: c }))
            } catch { }
        },
        { deep: false }
    )
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
