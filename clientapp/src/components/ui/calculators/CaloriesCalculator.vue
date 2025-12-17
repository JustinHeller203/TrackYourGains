<!-- src/components/ui/calculators/CaloriesCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Kalorienbedarfsrechner' }}

                <ExplanationPopup v-if="infoText"
                                  ref="headerExplainPopup"
                                  title="Kalorienbedarf"
                                  kicker="Rechner erklärt"
                                  aria-open="Kalorien Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="infoText">
                    <template #graphic>
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
                            <button class="calc-chip"
                                    type="button"
                                    :disabled="!result"
                                    :aria-disabled="(!result).toString()"
                                    :class="{ 'is-disabled': !result }"
                                    :title="result ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                                    @click="copyPopupSummary()">
                                📋 Copy
                            </button>                        </div>

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

                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                Die beste Kalorienzahl ist die, die deinen <strong>Trend</strong> trifft. Zahlen sind Start – Anpassung ist King.
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
            <label>Alter (Jahre)</label>
            <input :value="age ?? ''"
                   @input="onAgeInput"
                   type="number"
                   placeholder="z.B. 30"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label>Geschlecht</label>
            <select :value="gender" @change="onGenderChange" class="edit-input">
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
            </select>
        </div>

        <div class="input-group">
            <label>Gewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
            <input :value="weight ?? ''"
                   @input="onWeightInput"
                   type="number"
                   :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label>Größe (cm)</label>
            <input :value="height ?? ''"
                   @input="onHeightInput"
                   type="number"
                   placeholder="z.B. 175"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label class="label-row">
                <span>Aktivitätslevel</span>

                <button type="button"
                        class="info-btn"
                        aria-label="Aktivitätslevel Erklärung öffnen"
                        title="Aktivitätslevel Erklärung öffnen"
                        @click="openActivityInfo">
                    <span class="info-emoji" aria-hidden="true">ℹ️</span>
                </button>
            </label>
            <select :value="activity" @change="onActivityChange" class="edit-input">
                <option value="1.2">Sitzend</option>
                <option value="1.375">Leicht aktiv</option>
                <option value="1.55">Moderat aktiv</option>
                <option value="1.725">Sehr aktiv</option>
                <option value="1.9">Extrem aktiv</option>
            </select>
        </div>

        <div class="input-group">
            <label class="label-row">
                <span>Kalorienziel</span>

                <button type="button"
                        class="info-btn"
                        aria-label="Kalorienziel Erklärung öffnen"
                        title="Was ist ein angemessenes Kalorienziel?"
                        @click="openGoalInfo">
                    <span class="info-emoji" aria-hidden="true">ℹ️</span>
                </button>
            </label>

            <select :value="goal" @change="onGoalChange" class="edit-input">
                <option :value="0">Erhaltung</option>
                <option v-for="n in steps" :key="'surplus-'+n" :value="n">+{{ n }} kcal (Überschuss)</option>
                <option v-for="n in steps" :key="'deficit-'+n" :value="-n">-{{ n }} kcal (Defizit)</option>
            </select>
        </div>


        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result" class="result">
            <div class="result-header">
                <p><strong>Gesamtkalorienbedarf:</strong> {{ result.total.toFixed(0) }} kcal</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <ul class="result-list">
                <li>Kohlenhydrate (50%): {{ result.macros.carbs.toFixed(0) }} g</li>
                <li>Eiweiß (30%): {{ result.macros.protein.toFixed(0) }} g</li>
                <li>Fett (20%): {{ result.macros.fat.toFixed(0) }} g</li>
            </ul>
        </div>

        <!-- bleibt für dein updateMacroChart() -->
        <div v-if="result" class="chart-container">
            <canvas id="macroChart"></canvas>
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
    import { computed, nextTick, ref } from 'vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'

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
    const headerExplainPopup = ref<any>(null)

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

    function openActivityInfo() {
        headerExplainPopup.value?.open?.()
        nextTick(() => requestAnimationFrame(() => jumpTo('cal_activity')))
    }

    function openGoalInfo() {
        headerExplainPopup.value?.open?.()
        nextTick(() => requestAnimationFrame(() => jumpTo('cal_goal_guide')))
    }
    async function copyPopupSummary() {
        if (!result.value) return

        const parts: string[] = []

        if (age.value != null) parts.push(`Alter: ${age.value}`)
        if (gender.value) parts.push(`Geschlecht: ${gender.value}`)
        if (weight.value != null) parts.push(`Gewicht: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        if (height.value != null) parts.push(`Größe: ${height.value} cm`)
        if (activity.value) parts.push(`Aktivität: ${activity.value}`)
        if (goal.value) parts.push(`Ziel: ${goal.value > 0 ? '+' : ''}${goal.value} kcal`)

        if (result.value) {
            parts.push(`Kalorien: ${result.value.total.toFixed(0)} kcal`)
            parts.push(
                `Makros: KH ${result.value.macros.carbs.toFixed(0)}g | EW ${result.value.macros.protein.toFixed(0)}g | F ${result.value.macros.fat.toFixed(0)}g`
            )
        }

        const text = parts.join(' | ')
        try {
            await navigator.clipboard.writeText(text)
            emit('copy')
            activeTargetId.value = 'cal_you'
            window.setTimeout(() => (activeTargetId.value = null), 700)
        } catch {
            // optional später: Fehler-Toast
        }
    }

    /* handlers */
    function onAgeInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:calorieAge', raw === '' ? null : Number(raw))
    }
    function onGenderChange(e: Event) {
        emit('update:calorieGender', (e.target as HTMLSelectElement).value as Gender)
    }
    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:calorieWeight', raw === '' ? null : Number(raw))
    }
    function onHeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:calorieHeight', raw === '' ? null : Number(raw))
    }
    function onActivityChange(e: Event) {
        emit('update:calorieActivity', (e.target as HTMLSelectElement).value)
    }
    function onGoalChange(e: Event) {
        emit('update:calorieGoal', Number((e.target as HTMLSelectElement).value))
    }
</script>

<style scoped>
    /* === Vollständige, lokale Styles für Konsistenz === */

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

    .label-row {
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

    .result-list {
        margin: .25rem 0 0;
        padding-left: 1.1rem;
    }

    /* Chart placeholder */
    .chart-container {
        height: 240px;
        margin-top: .5rem;
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

    .calc-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    /* Section soll horizontal durchgehen */
    .calc-card--wide {
        grid-column: 1 / -1;
    }

</style>
