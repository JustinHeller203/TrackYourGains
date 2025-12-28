<!-- src/components/ui/calculators/CaffeineSafeDoseCalculator.vue -->
<template>
        <BaseCalculator :title="title || 'Koffein – sichere Dosis'"
                        :showInfo="!!infoText"
                        infoTitle="Koffein (sichere Dosis)"
                        infoKicker="Rechner erklärt"
                        ariaOpen="Koffein Erklärung öffnen"
                        ariaClose="Schließen"
                        :info="infoText"
                        :autoCalcEnabled="autoCalcEnabled"
                        :isFavorite="isFavorite"
                        :showCalculateButton="!autoCalcEnabled"
                        :showCopyButton="!!cafResult"
                        :copyText="copyText"
                        @toggleFavorite="$emit('toggleFavorite')"
                        @calculate="$emit('calculate')"
                        @copy="$emit('copy')"
                        @export="$emit('export')"
                        @reset="$emit('reset')">

            <!-- Graphic -->
            <template #graphic="{ jumpTo }">
                <div class="calc-hero" role="img" aria-label="Koffein Kurzkarte">
                    <div class="calc-hero-top">
                        <span class="calc-hero-title">☕ Wie viel Koffein ist „safe“?</span>
                    </div>

                    <div class="calc-hero-sub">
                        Richtwerte helfen — aber Timing &amp; Schlaf entscheiden oft mehr als mg.
                    </div>

                    <div class="calc-hero-pills" aria-label="Schnellnavigation">
                        <button class="calc-chip" type="button" @click="jumpTo('caf_formula')">⚙️ Berechnung</button>
                        <button class="calc-chip" type="button" @click="jumpTo('caf_sources')">☕ Gehalte</button>
                        <button class="calc-chip" type="button" @click="jumpTo('caf_halflife')">🕒 Schlaf</button>
                        <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('caf_limits')">⚠️ Grenzen</button>
                    </div>
                </div>
            </template>

            <!-- Popup Content -->
            <template #popup="{ jumpTo, activeTargetId, onCopy }">
                <div class="calc-scan">
                    <div v-if="cafResult"
                         id="caf_you"
                         class="calc-callout calc-callout--tldr"
                         :class="{ 'calc-target': activeTargetId === 'caf_you' }"
                         tabindex="-1">
                        <div class="calc-callout-title">✅ Dein Ergebnis</div>
                        <div class="calc-callout-text">
                            <div><strong>Empfehlung (Einzeldosis):</strong> {{ cafResult.perDose.toFixed(0) }} mg</div>
                            <div><strong>Max. pro Tag:</strong> {{ cafResult.perDay.toFixed(0) }} mg</div>

                            <div class="calc-note calc-note--tight">
                                Tipp: Wenn du merkst „Herzrasen/Unruhe“, bist du nicht schwach — du bist einfach sensibel. Runterdrehen.
                            </div>

                            <div class="calc-actions">
                                <button class="calc-chip" type="button" @click="jumpTo('caf_next')">👉 Was heißt das?</button>
                                <button class="calc-chip" type="button" @click="jumpTo('caf_timing')">🕒 Timing</button>
                                <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('caf_limits')">⚠️ Grenzen</button>
                            </div>
                        </div>
                    </div>

                    <div class="calc-chips" aria-label="Kurzüberblick">
                        <button class="calc-chip" type="button" @click="jumpTo('caf_sources')">☕ Gehalte</button>
                        <button class="calc-chip" type="button" @click="jumpTo('caf_halflife')">🕒 Schlaf</button>
                        <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('caf_sidefx')">⚠️ Nebenwirkungen</button>
                        <button class="calc-chip" type="button" @click="jumpTo('caf_pwo')">🏋️ Pre-Workout</button>
                        <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('caf_safe')">✅ Safe</button>

                        <!-- Copy: handled by BaseCalculator result copy -->
                        <button class="calc-chip"
                                type="button"
                                :disabled="!cafResult"
                                :aria-disabled="!cafResult"
                                :class="{ 'is-disabled': !cafResult }"
                                :title="cafResult ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                                @click="() => { onCopy?.(); jumpTo('caf_you') }">
                            📋 Copy
                        </button>
                    </div>

                    <div id="caf_tldr"
                         class="calc-callout calc-callout--tldr"
                         :class="{ 'calc-target': activeTargetId === 'caf_tldr' }"
                         tabindex="-1">
                        <div class="calc-callout-title">📌 Kurzfassung</div>
                        <div class="calc-callout-text">
                            <div>
                                Koffein wirkt je nach Mensch extrem unterschiedlich. Diese Zahl ist ein <strong>Richtwert</strong>.
                            </div>
                            <ul class="calc-list calc-list--spaced">
                                <li><strong>Einzeldosis:</strong> mg/kg je nach Empfindlichkeit</li>
                                <li><strong>Tag:</strong> üblich ~400 mg (Schwanger/Stillend ≤ 200 mg)</li>
                                <li><strong>Merke:</strong> Schlaf killen ist der #1 Fehler — nicht „zu wenig mg“</li>
                            </ul>
                        </div>
                    </div>

                    <div id="caf_next"
                         class="calc-callout"
                         :class="{ 'calc-target': activeTargetId === 'caf_next' }"
                         tabindex="-1">
                        <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                        <ul class="calc-list">
                            <li><strong>Wenn du müde bist:</strong> erst Schlaf/Essens-Timing checken, nicht nur hochballern</li>
                            <li><strong>Wenn du nervös wirst:</strong> Dosis runter oder später am Tag komplett skippen</li>
                            <li><strong>Wenn du tolerant bist:</strong> Pausen helfen oft mehr als „immer mehr“</li>
                        </ul>
                    </div>

                    <div class="calc-grid">
                        <section class="calc-card">
                            <h4 class="calc-h">👥 Für wen ist der Koffein-Rechner sinnvoll?</h4>
                            <ul class="calc-list">
                                <li>✅ Wenn du <strong>Pre-Workout</strong> nutzt und nicht übertreiben willst</li>
                                <li>✅ Wenn du bei Koffein oft <strong>Unruhe/Herzrasen</strong> bekommst</li>
                                <li>✅ Wenn du deine <strong>Tagesmenge</strong> realistisch tracken willst</li>
                                <li>⚠️ Wenn du krank bist / Medikamente nimmst: Richtwert okay, aber vorsichtig</li>
                            </ul>
                        </section>

                        <section class="calc-card">
                            <h4 class="calc-h">🧠 Was misst der Rechner wirklich?</h4>
                            <ul class="calc-list">
                                <li><strong>Schätzt:</strong> „sinnvolle mg“-Spanne anhand <strong>Gewicht</strong> + <strong>Empfindlichkeit</strong></li>
                                <li><strong>Setzt Limits:</strong> Tageslimit (typisch ~400 mg, bei Schwangerschaft/Stillzeit ≤ 200 mg)</li>
                                <li><strong>Misst nicht:</strong> Schlafqualität, Stress, Herzgesundheit, echte Toleranz</li>
                                <li><strong>Merke:</strong> Dein Körper ist das Feedback-System – nicht diese Zahl</li>
                            </ul>
                        </section>

                        <section class="calc-card">
                            <h4 class="calc-h">🧠 Was beeinflusst die Wirkung?</h4>
                            <ul class="calc-list">
                                <li><strong>Schlaf:</strong> wenig Schlaf = mehr Nebenwirkungen</li>
                                <li><strong>Leerer Magen:</strong> ballert schneller</li>
                                <li><strong>Toleranz:</strong> täglicher Konsum = weniger Effekt</li>
                            </ul>
                        </section>

                        <section id="caf_safe"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_safe' }"
                                 tabindex="-1">
                            <h4 class="calc-h">✅ Safe-Quick (Daumenregeln)</h4>
                            <ul class="calc-list">
                                <li><strong>Neueinsteiger/sensibel:</strong> 1–2 mg/kg</li>
                                <li><strong>Normal:</strong> 3–4 mg/kg</li>
                                <li><strong>Tolerant:</strong> 5–6 mg/kg (aber Schlaf kann trotzdem sterben)</li>
                            </ul>
                        </section>

                        <section id="caf_sensitivity"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_sensitivity' }"
                                 tabindex="-1">
                            <h4 class="calc-h">🧠 Was bedeutet „Empfindlichkeit“?</h4>

                            <div class="calc-note">
                                Sie beschreibt, <strong>wie stark dein Körper auf Koffein reagiert</strong> – nicht wie belastbar du bist.
                            </div>

                            <ul class="calc-list">
                                <li><strong>Empfindlich:</strong> wenig Koffein → Unruhe, Puls, schlechter Schlaf</li>
                                <li><strong>Normal:</strong> Fokus & Wachheit ohne starke Nebenwirkungen</li>
                                <li><strong>Tolerant:</strong> brauchst mehr für Effekt – Schlaf leidet trotzdem</li>
                            </ul>

                            <div class="calc-note calc-note--tight">
                                <strong>Merke:</strong> Wenig Wirkung heißt nicht automatisch „safe“.
                            </div>
                        </section>

                        <section id="caf_formula"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_formula' }"
                                 tabindex="-1">
                            <h4 class="calc-h">⚙️ Formel</h4>
                            <div class="calc-note">
                                Richtwerte: <strong>mg/kg</strong> nach Empfindlichkeit + Tageslimit.
                            </div>
                            <div class="calc-formula calc-formula--first">
                                <span class="calc-formula-k">Einzeldosis</span>
                                <span class="calc-formula-eq">=</span>
                                <span class="calc-formula-v">Gewicht × (3 / 4 / 6 mg/kg)</span>
                            </div>
                            <div class="calc-formula">
                                <span class="calc-formula-k">Tag</span>
                                <span class="calc-formula-eq">=</span>
                                <span class="calc-formula-v">min(400 mg, Einzeldosis × ~2–3)</span>
                            </div>
                            <div class="calc-note calc-note--spaced">
                                Schwangerschaft/Stillzeit: ≤ <strong>200 mg/Tag</strong>.
                            </div>
                        </section>

                        <section id="caf_example"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_example' }"
                                 tabindex="-1">
                            <h4 class="calc-h">📐 Beispiel</h4>
                            <div class="calc-example">
                                <div class="calc-example-row">
                                    <span>75 kg • normal (4 mg/kg)</span>
                                    <span class="calc-example-strong">≈ 300 mg</span>
                                </div>
                                <div class="calc-example-sub">
                                    Das ist kein „Muss“. Wenn du bei 150 mg schon zitterst → dann ist <strong>150 mg dein Limit</strong>.
                                </div>
                            </div>
                        </section>

                        <section id="caf_sources"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_sources' }"
                                 tabindex="-1">
                            <h4 class="calc-h">☕ Koffein-Gehalte (realistisch)</h4>
                            <ul class="calc-list">
                                <li><strong>Filterkaffee:</strong> ~80–150 mg</li>
                                <li><strong>Espresso:</strong> ~60–90 mg</li>
                                <li><strong>Energy (250 ml):</strong> ~80 mg</li>
                                <li><strong>Energy (500 ml):</strong> ~160 mg</li>
                                <li><strong>Pre-Workout:</strong> oft 150–350+ mg</li>
                            </ul>
                            <div class="calc-note calc-note--tight">
                                Labels schlagen Schätzungen. Portionen werden oft unterschätzt.
                            </div>
                        </section>

                        <section id="caf_timing"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_timing' }"
                                 tabindex="-1">
                            <h4 class="calc-h">🕒 Timing / Schlaf</h4>
                            <ul class="calc-list">
                                <li><strong>Nach dem Aufstehen:</strong> viele fühlen’s besser nach 60–90 min</li>
                                <li><strong>Später am Tag:</strong> je später, desto eher killt’s Schlafqualität</li>
                                <li><strong>Pre-Workout:</strong> klein starten, sonst Pump + Panik-Kombi</li>
                            </ul>
                        </section>

                        <section id="caf_halflife"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_halflife' }"
                                 tabindex="-1">
                            <h4 class="calc-h">🕒 Halbwertszeit & Schlaf</h4>
                            <ul class="calc-list">
                                <li><strong>Halbwertszeit:</strong> ca. 3–7 Stunden</li>
                                <li><strong>Abends:</strong> Rest-Koffein hält wach, auch ohne „Kick“</li>
                                <li><strong>Faustregel:</strong> letzte Dosis 6–10h vor dem Schlaf</li>
                            </ul>
                            <div class="calc-note calc-note--tight">
                                Schlechter Schlaf = häufig zu spätes Koffein.
                            </div>
                        </section>

                        <section id="caf_sidefx"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_sidefx' }"
                                 tabindex="-1">
                            <h4 class="calc-h">⚠️ Nebenwirkungen</h4>
                            <ul class="calc-list">
                                <li><strong>Unruhe / Zittern:</strong> Dosis senken</li>
                                <li><strong>Herzrasen:</strong> sofort stoppen</li>
                                <li><strong>Übelkeit:</strong> nicht nüchtern konsumieren</li>
                                <li><strong>Schlafprobleme:</strong> späteres Koffein streichen</li>
                            </ul>
                        </section>

                        <section id="caf_pwo"
                                 class="calc-card"
                                 :class="{ 'calc-target': activeTargetId === 'caf_pwo' }"
                                 tabindex="-1">
                            <h4 class="calc-h">🏋️ Pre-Workout (Smart Use)</h4>
                            <ul class="calc-list">
                                <li><strong>Timing:</strong> 30–60 min vor Training</li>
                                <li><strong>Start:</strong> 1–2 mg/kg testen</li>
                                <li><strong>Spät abends:</strong> low-dose oder koffeinfrei</li>
                                <li><strong>Stack:</strong> Kaffee + Energy + Booster = Overkill</li>
                            </ul>
                            <div class="calc-note calc-note--tight">
                                Performance bringt nichts, wenn der Schlaf leidet.
                            </div>
                        </section>
                    </div>

                    <div class="calc-callout">
                        <div class="calc-callout-title">🧠 Wann du den Koffein-Rechner locker ignorieren darfst</div>
                        <ul class="calc-list">
                            <li>Du trinkst eh nur <strong>1 Kaffee am Morgen</strong> und dein Schlaf ist stabil</li>
                            <li>Du merkst klar: <strong>ab X mg wird’s unangenehm</strong> → das ist dein echtes Limit</li>
                            <li>Du bist gerade <strong>krank / gestresst / wenig geschlafen</strong> → heute lieber low/no caffeine</li>
                            <li>Du brauchst eigentlich <strong>Essen/Wasser/Schlaf</strong> statt noch ’nen Booster</li>
                        </ul>
                    </div>

                    <div id="caf_limits"
                         class="calc-callout calc-callout--warn"
                         :class="{ 'calc-target': activeTargetId === 'caf_limits' }"
                         tabindex="-1">
                        <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                        <ul class="calc-list">
                            <li><strong>Empfindlichkeit</strong> ist real — Richtwerte sind nicht „Gesetz“</li>
                            <li><strong>Herzrasen/Angst</strong> → sofort runter, nicht „durchziehen“</li>
                            <li><strong>Schwanger/Stillend</strong> → ≤ 200 mg/Tag</li>
                        </ul>
                    </div>

                    <section class="calc-card">
                        <h4 class="calc-h">❓ Häufige Fragen</h4>
                        <ul class="calc-list">
                            <li><strong>„Warum wirkt’s heute stärker?“</strong> → Schlaf, leerer Magen, Stress.</li>
                            <li><strong>„Warum wirkt’s gar nicht?“</strong> → Toleranz. Pause hilft.</li>
                            <li><strong>„Was ist besser als mehr Koffein?“</strong> → Schlaf + Essen + Wasser.</li>
                        </ul>
                    </section>
                </div>
            </template>

            <!-- Mini -->
            <template #mini>
                <div class="calc-mini">
                    <div class="calc-mini-title">Reality-Check ✅</div>
                    <div class="calc-mini-text">
                        Koffein ist ein Tool. Wenn Schlaf leidet, ist das Tool gerade gegen dich.
                    </div>
                </div>
            </template>

            <!-- Inputs -->
            <template #inputs="{ openInfoAndJump, maybeAutoCalc }">
                <div class="input-group">
                    <label>Gewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
                    <input :value="weight ?? ''"
                           @input="(e) => { onWeightInput(e); maybeAutoCalc() }"
                           type="number"
                           :placeholder="unit === 'kg' ? 'z.B. 75' : 'z.B. 165'"
                           class="edit-input" />
                </div>

                <div class="input-group">
                    <label class="label-with-info">
                        Empfindlichkeit
                        <button type="button"
                                class="info-btn"
                                aria-label="Was bedeutet Empfindlichkeit?"
                                title="Was bedeutet Empfindlichkeit?"
                                @click="openInfoAndJump('caf_sensitivity')">
                            <span class="info-emoji" aria-hidden="true">ℹ️</span>
                        </button>
                    </label>

                    <select :value="sensitivity"
                            @change="(e) => { onSensitivityChange(e); maybeAutoCalc() }"
                            class="edit-input">
                        <option value="low">Empfindlich (≈ 3 mg/kg)</option>
                        <option value="normal">Normal (≈ 4 mg/kg)</option>
                        <option value="high">Tolerant (≈ 6 mg/kg)</option>
                    </select>
                </div>

                <div class="input-group">
                    <label>Besonderheit</label>
                    <select :value="status"
                            @change="(e) => { onStatusChange(e); maybeAutoCalc() }"
                            class="edit-input">
                        <option value="none">Keine</option>
                        <option value="pregnant">Schwanger/Stillend (≤ 200 mg/Tag)</option>
                    </select>
                </div>
            </template>

            <!-- Result -->
            <template #result>
                <div v-if="cafResult">
                    <p><strong>Empfehlung (Einzeldosis):</strong> {{ cafResult.perDose.toFixed(0) }} mg</p>
                    <p><strong>Max. pro Tag:</strong> {{ cafResult.perDay.toFixed(0) }} mg</p>
                </div>
            </template>

            <template #result-sub>
                <small v-if="cafResult" class="hint">
                    Beispiel: Hat ein Drink 80&nbsp;mg pro Portion, kannst du so schnell überschlagen,
                    wie viele Portionen sinnvoll sind.
                </small>
            </template>
        </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed, onMounted, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { LS_PROGRESS_CAFFEINE_INPUTS_V1 } from '@/constants/storageKeys'

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
            (props.info ?? '').trim() ||
            'Richtwerte (gesunde Erwachsene): ca. 3–6 mg/kg Körpergewicht. Übliche Tagesobergrenze ~400 mg (Schwangere/Stillende ≤ 200 mg). Keine medizinische Beratung.'
    )

    const copyText = computed<string | null>(() => {
        if (!cafResult.value) return null

        const parts: string[] = []
        if (weight.value != null) parts.push(`Gewicht: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)

        const sensLabel =
            sensitivity.value === 'low' ? 'empfindlich' :
                sensitivity.value === 'high' ? 'tolerant' : 'normal'

        parts.push(`Empfindlichkeit: ${sensLabel}`)
        if (status.value === 'pregnant') parts.push('Status: Schwanger/Stillend')

        parts.push(`Einzeldosis: ${cafResult.value.perDose.toFixed(0)} mg`)
        parts.push(`Max/Tag: ${cafResult.value.perDay.toFixed(0)} mg`)

        return parts.join(' | ')
    })

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
    const LS_KEY = LS_PROGRESS_CAFFEINE_INPUTS_V1

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)

            if (props.cafWeight == null && typeof data.weight === 'number') emit('update:cafWeight', data.weight)
            if (data.sensitivity === 'low' || data.sensitivity === 'normal' || data.sensitivity === 'high') emit('update:cafSensitivity', data.sensitivity)
            if (data.status === 'none' || data.status === 'pregnant') emit('update:cafStatus', data.status)
        } catch { }
    })

    watch(
        () => [props.cafWeight, props.cafSensitivity, props.cafStatus],
        ([w, s, st]) => {
            try {
                localStorage.setItem(LS_KEY, JSON.stringify({ weight: w, sensitivity: s, status: st }))
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

    .hint {
        display: block;
        margin-top: .25rem;
        font-size: .8rem;
        color: var(--text-secondary);
    }

    .label-with-info {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
    }
</style>
