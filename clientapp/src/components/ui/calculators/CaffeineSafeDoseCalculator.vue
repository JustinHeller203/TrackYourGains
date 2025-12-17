<!-- src/components/ui/calculators/CaffeineSafeDoseCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Koffein – sichere Dosis' }}

                <ExplanationPopup v-if="infoText"
                                  ref="headerExplainPopup"
                                  title="Koffein (sichere Dosis)"
                                  kicker="Rechner erklärt"
                                  aria-open="Koffein Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="infoText">
                    <template #graphic>
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
                            <button class="calc-chip"
                                    type="button"
                                    :disabled="!cafResult"
                                    :aria-disabled="(!cafResult).toString()"
                                    :class="{ 'is-disabled': !cafResult }"
                                    :title="cafResult ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                                    @click="copyPopupSummary()">
                                📋 Copy
                            </button>                        </div>

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

                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                Koffein ist ein Tool. Wenn Schlaf leidet, ist das Tool gerade gegen dich.
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

        <div class="input-group">
            <label>Gewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
            <input :value="weight ?? ''"
                   @input="onWeightInput"
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
                        @click="openSensitivityInfo">
                    <span class="info-emoji" aria-hidden="true">ℹ️</span>
                </button>
            </label>

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
    import { computed, onMounted, ref, watch, nextTick } from 'vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
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
        if (!cafResult.value) return

        const parts: string[] = []

        if (weight.value != null) parts.push(`Gewicht: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        parts.push(`Empfindlichkeit: ${sensitivity.value}`)
        if (status.value === 'pregnant') parts.push(`Status: Schwanger/Stillend`)

        if (cafResult.value) {
            parts.push(`Einzeldosis: ${cafResult.value.perDose.toFixed(0)} mg`)
            parts.push(`Max/Tag: ${cafResult.value.perDay.toFixed(0)} mg`)
        }

        const text = parts.join(' | ')
        try {
            await navigator.clipboard.writeText(text)
            emit('copy')
            activeTargetId.value = 'caf_you'
            window.setTimeout(() => (activeTargetId.value = null), 700)
        } catch {
            // optional später: Fehler-Toast
        }
    }

    const infoText = computed(
        () =>
            (props.info ?? '').trim() ||
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

    const headerExplainPopup = ref<any>(null)

    function openSensitivityInfo() {
        headerExplainPopup.value?.open?.()

        nextTick(() => {
            requestAnimationFrame(() => jumpTo('caf_sensitivity'))
        })
    }

    const LS_KEY = 'tyg_caffeine_inputs_v1'

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)

            if (props.cafWeight == null && typeof data.weight === 'number') emit('update:cafWeight', data.weight)
            if (props.cafSensitivity == null && data.sensitivity) emit('update:cafSensitivity', data.sensitivity)
            if (props.cafStatus == null && data.status) emit('update:cafStatus', data.status)
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

    /* Card */
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

    .footer-spacer {
        flex: 1;
    }

    .footer-actions {
        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
    }

    .label-with-info {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
    }

</style>
