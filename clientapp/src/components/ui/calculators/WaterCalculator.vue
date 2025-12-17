<!-- src/components/ui/calculators/WaterCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Wasserbedarfsrechner' }}

                <ExplanationPopup title="Wasserbedarf"
                                  kicker="Rechner erklärt"
                                  aria-open="Wasser Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="info || defaultInfo">
                    <template #graphic>
                        <div class="calc-hero" role="img" aria-label="Wasser Kurzkarte">
                            <div class="calc-hero-top">
                                <span class="calc-hero-title">💧 Wie viel Wasser brauchst du?</span>
                            </div>

                            <div class="calc-hero-sub">
                                Richtwert für deinen Tag – kein medizinisches Urteil.
                            </div>

                            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                                <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">
                                    ⚙️ So wird’s geschätzt
                                </button>
                                <button class="calc-chip" type="button" @click="jumpTo('calc_factors')">
                                    📌 Was beeinflusst das?
                                </button>
                                <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">
                                    ⚠️ Grenzen
                                </button>
                            </div>
                        </div>
                    </template>

                    <div class="calc-scan">
                        <div v-if="result != null"
                             id="calc_you"
                             class="calc-callout calc-callout--tldr"
                             :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                             tabindex="-1">
                            <div class="calc-callout-title">✅ Dein Ergebnis</div>
                            <div class="calc-callout-text">
                                <div>
                                    <strong>Täglicher Wasserbedarf:</strong> {{ result.toFixed(1) }} Liter
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
                                    :disabled="result == null"
                                    :aria-disabled="result == null"
                                    :class="{ 'is-disabled': result == null }"
                                    :title="result == null ? 'Erst berechnen, dann kopieren' : 'Kopieren'"
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
                                    Das ist ein Richtwert. Flüssigkeit aus Essen zählt auch mit (z.B. Obst, Suppe).
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
                                <li>Dein Urin ist meist <strong>hellgelb</strong> (nicht dauerhaft dunkel)</li>
                                <li>Du bist <strong>leistungsfähig</strong> und hast keine Dehydrierungs-Symptome</li>
                                <li>Du hast keine <strong>medizinischen Sonderfälle</strong> (Herz/Niere etc.)</li>
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
                                <li><strong>„Ab wann ist Wasser giftig?“</strong> → wenn du in kurzer Zeit <strong>extrem viel</strong> trinkst (mehrere Liter sehr schnell), kann das gefährlich werden, weil <strong>Natrium im Blut zu stark verdünnt</strong> wird.</li>
                                <li><strong>„Kann ich zu viel trinken?“</strong> → ja, selten – passiert eher bei „zu viel, zu schnell“.</li>
                            </ul>

                        </section>
                    </div>

                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                Trink so, dass du dich stabil fühlst: <strong>Durst</strong>, <strong>Urinfarbe</strong>, <strong>Training</strong> = die echten Marker.
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
            <label>
                Körpergewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})
            </label>
            <input :value="weightInputValue"
                   @input="onWeightInput"
                   type="number"
                   :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                   class="edit-input"
                   step="any"
                   min="0" />
        </div>

        <div class="input-group">
            <label>Aktivitätslevel</label>
            <select :value="activity" @change="onActivityChange" class="edit-input">
                <option value="low">Niedrig (kein Sport)</option>
                <option value="moderate">Moderat (1-3x/Woche)</option>
                <option value="high">Hoch (4-7x/Woche)</option>
            </select>
        </div>

        <div class="input-group">
            <label>Klima</label>
            <select :value="climate" @change="onClimateChange" class="edit-input">
                <option value="temperate">Gemäßigt</option>
                <option value="hot">Heiß</option>
                <option value="very_hot">Sehr heiß</option>
            </select>
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result !== null" class="result">
            <div class="result-header">
                <p><strong>Täglicher Wasserbedarf:</strong> {{ result!.toFixed(1) }} Liter</p>
                <CopyButton @click="$emit('copy')" />
            </div>
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
    import { computed, onMounted, ref, watch } from 'vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type Activity = 'low' | 'moderate' | 'high'
    type Climate = 'temperate' | 'hot' | 'very_hot'

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        waterWeight: number | null
        waterActivity: Activity
        waterClimate: Climate
        waterResult: number | null
        isFavorite: boolean
        title?: string
        /** Optional: �berschreibt den Standardtext im Header-InfoHover */
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

    const weight = computed(() => props.waterWeight)
    const activity = computed(() => props.waterActivity)
    const climate = computed(() => props.waterClimate)
    const result = computed(() => props.waterResult)

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
        if (props.waterResult == null) return

        const parts: string[] = []

        if (props.waterWeight != null) parts.push(`Gewicht: ${props.waterWeight} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        if (props.waterActivity) parts.push(`Aktivität: ${props.waterActivity}`)
        if (props.waterClimate) parts.push(`Klima: ${props.waterClimate}`)
        if (props.waterResult != null) parts.push(`Wasserbedarf: ${props.waterResult.toFixed(1)} L/Tag`)

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

    const defaultInfo =
        'Schätzt deinen täglichen Wasserbedarf aus Gewicht, Aktivität und Klima. Richtwerte, keine medizinische Beratung.'

    const weightInputValue = computed(() =>
        weight.value === null || Number.isNaN(weight.value) ? '' : String(weight.value)
    )
    function maybeAutoCalc() {
        if (props.autoCalcEnabled) emit('calculate')
    }

    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        const n = raw === '' ? null : Number(raw)
        emit('update:waterWeight', raw === '' || Number.isNaN(n) ? null : n)
        maybeAutoCalc()
    }
    function onActivityChange(e: Event) {
        emit('update:waterActivity', (e.target as HTMLSelectElement).value as Activity)
        maybeAutoCalc()
    }
    function onClimateChange(e: Event) {
        emit('update:waterClimate', (e.target as HTMLSelectElement).value as Climate)
        maybeAutoCalc()
    }
    const LS_KEY = 'tyg_water_inputs_v1'

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)

            if (props.waterWeight == null && typeof data.weight === 'number') emit('update:waterWeight', data.weight)
            if (data.activity) emit('update:waterActivity', data.activity)
            if (data.climate) emit('update:waterClimate', data.climate)
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
    /* Minimal � gemeinsame Card/Form-Styles kommen global */
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

    .label-with-info {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
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

    .label-with-info {
        display: inline-flex;
        align-items: center;
        gap: .4rem;
    }
</style>
