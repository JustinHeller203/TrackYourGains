<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || '1RM-Rechner' }}

                <ExplanationPopup title="1RM (One-Rep-Max)"
                                  kicker="Rechner erklärt"
                                  aria-open="1RM Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="info || defaultInfo">
                    <template #graphic>
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

                    <div class="calc-scan">
                        <div v-if="oneRmResult != null || formattedResult"
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
                                    :disabled="!(oneRmResult != null || formattedResult)"
                                    :aria-disabled="!(oneRmResult != null || formattedResult)"
                                    :class="{ 'is-disabled': !(oneRmResult != null || formattedResult) }"
                                    :title="(oneRmResult != null || formattedResult) ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
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
                                    Der Rechner schätzt dein <strong>1RM</strong> aus <strong>Gewicht</strong> + <strong>Wiederholungen</strong> (Standard: Epley).
                                </div>

                                <ul class="calc-list calc-list--spaced">
                                    <li><strong>Gut:</strong> sehr hilfreich für Trainings-Prozente & Fortschritt</li>
                                    <li><strong>Wichtig:</strong> saubere Technik > Zahl</li>
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
                                <li>Deine Übung variiert ständig (Technik/Range/Tempo) → Werte sind schwer vergleichbar</li>
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
                                <li><strong>Cheat-Reps</strong> → Ergebnis ist kaum aussagekräftig (weil die Technik die Zahl „fälscht“)</li>
                                <li><strong>Schmerzen/unsichere Technik</strong> → lieber nicht auf Max-Zahlen gehen</li>
                            </ul>
                        </div>

                        <section class="calc-card">
                            <h4 class="calc-h">❓ Häufige Fragen</h4>
                            <ul class="calc-list">
                                <li><strong>„Welche Formel ist das?“</strong> → Epley (Standard-Schätzung).</li>
                                <li><strong>„Warum variiert das?“</strong> → Technik, Pausenlänge, Tagesform und Bewegungsumfang (ROM). Außerdem sind <strong>Übungen nicht direkt vergleichbar</strong>: andere Muskelgruppen und andere Hebel. Bankdrücken 30 kg ≠ Seitheben 30 kg.</li>
                                <li><strong>„Soll ich 1RM testen?“</strong> → nur wenn du Erfahrung hast und ein sicheres Setup (Spotter/Safeties) hast.</li>
                            </ul>
                        </section>
                    </div>

                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                Dein bestes Tool bleibt: <strong>saubere Reps</strong> + <strong>Progress</strong>. 1RM ist nur ’ne Zahl.
                            </div>
                        </div>
                    </template>
                </ExplanationPopup>
            </h3>


            <FavoriteButton :active="isFavorite"
                            :titleActive="'Aus Favoriten entfernen'"
                            :titleInactive="'Zu Favoriten hinzuf�gen'"
                            @toggle="$emit('toggleFavorite')" />
        </div>

        <div class="input-group">
            <label>Übung</label>
            <input :value="exercise"
                   @input="onExerciseInput"
                   type="text"
                   placeholder="z. B. Bankdrücken"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label>Gewicht ({{ unit === 'kg' ? 'kg' : 'lbs' }})</label>
            <input :value="weight ?? ''"
                   @input="onWeightInput"
                   type="number"
                   :placeholder="unit === 'kg' ? 'z. B. 80' : 'z. B. 175'"
                   step="any"
                   class="edit-input" />
        </div>

        <div class="input-group">
            <label>Wiederholungen</label>
            <input :value="reps ?? ''"
                   @input="onRepsInput"
                   type="number"
                   min="1"
                   step="1"
                   placeholder="z. B. 8"
                   class="edit-input" />
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="oneRmResult !== null || formattedResult" class="result">
            <div class="result-header">
                <p>
                    <strong>1RM für {{ exercise || '�bung' }}:</strong>
                    {{ displayResult }}
                </p>
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
    import { computed, ref } from 'vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        oneRmExercise: string
        oneRmWeight: number | null
        oneRmReps: number | null
        oneRmResult: number | null          // numerisch vom Parent berechnet
        formattedResult?: string            // bevorzugt: vom Parent bereits mit Einheit formatiert
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

    const infoText = computed(
        () =>
            props.info ||
            'Schätzt dein einmaliges Maximalgewicht. Standard: Epley-Formel (1RM ≈ Gewicht × (1 + Wiederholungen/30)).'
    )

    /* Bindings */
    const exercise = computed(() => props.oneRmExercise)
    const weight = computed(() => props.oneRmWeight)
    const reps = computed(() => props.oneRmReps)

    /* Anzeige � nutzt bevorzugt formattedResult vom Parent (korrekte Einheit/Format), sonst lokal. */
    const displayResult = computed(() => {
        if (props.formattedResult) return props.formattedResult
        if (props.oneRmResult === null || !Number.isFinite(props.oneRmResult)) return '�'
        const u = String(props.unit || '').toLowerCase() === 'lbs' ? 'lbs' : 'kg'
        return `${props.oneRmResult.toFixed(1)} ${u}`
    })

    const defaultInfo =
        'Schätzt dein einmaliges Maximalgewicht (1RM) aus Gewicht & Wiederholungen. Standard: Epley (1RM ≈ Gewicht × (1 + Reps/30)). Richtwert, kein Max-Test.'

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

    function maybeAutoCalc() {
        if (props.autoCalcEnabled) emit('calculate')
    }

    async function copyPopupSummary() {
        if (!(props.oneRmResult != null || props.formattedResult)) return

        const parts: string[] = []
        if (props.oneRmExercise?.trim()) parts.push(`Übung: ${props.oneRmExercise.trim()}`)
        if (props.oneRmWeight != null) parts.push(`Gewicht: ${props.oneRmWeight} ${String(props.unit).toLowerCase() === 'lbs' ? 'lbs' : 'kg'}`)
        if (props.oneRmReps != null) parts.push(`Reps: ${props.oneRmReps}`)

        if (props.formattedResult) parts.push(`1RM: ${props.formattedResult}`)
        else if (props.oneRmResult != null) parts.push(`1RM: ${props.oneRmResult.toFixed(1)} ${String(props.unit).toLowerCase() === 'lbs' ? 'lbs' : 'kg'}`)

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


    /* Handlers */
    function onExerciseInput(e: Event) {
        emit('update:oneRmExercise', (e.target as HTMLInputElement).value)
    }
    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        const n = raw === '' ? null : Number(raw)
        emit('update:oneRmWeight', n === null || Number.isNaN(n) ? null : n)
    }
    function onRepsInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        const n = raw === '' ? null : Number(raw)
        emit('update:oneRmReps', n === null || Number.isNaN(n) ? null : Math.max(1, Math.floor(n)))
    }
</script>

<style scoped>
    /* Card + Inputs (matching your design) */
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

    .fav-btn {
        background: transparent;
        border: none;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
        padding: .25rem .4rem;
        border-radius: 8px;
        color: #6b7280;
        transition: color .2s, text-shadow .2s, transform .1s;
    }

        .fav-btn:hover {
            color: #F59E0B;
            text-shadow: 0 0 8px #F59E0B, 0 0 4px #F59E0B;
            transform: scale(1.05);
        }

    .btn-ghost {
        background: transparent;
        border: 1px solid var(--border-color);
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-ghost:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: translateY(-1px);
        }

        .btn-ghost.mini {
            padding: .35rem .6rem;
            font-size: .8rem;
            border-radius: 6px;
        }

    .btn-danger-ghost {
        background: transparent;
        border: 1px solid #b91c1c33;
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: #b91c1c;
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-danger-ghost:hover {
            border-color: #b91c1c;
            color: #7f1d1d;
            transform: translateY(-1px);
        }

    .btn-icon {
        margin-right: .4rem;
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
    /* Tooltip lokal (scoped), sonst greift dein globaler nicht */
    .tooltip {
        position: relative;
        display: inline-block;
        cursor: help;
    }

        .tooltip .tooltip-text {
            visibility: hidden;
            min-width: 150px;
            max-width: 300px;
            background: var(--bg-card);
            color: var(--text-tooltip);
            text-align: left;
            border-radius: 8px;
            padding: .75rem;
            position: absolute;
            z-index: 1000;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            font-size: .8rem;
            box-shadow: var(--shadow);
            opacity: 0;
            transition: opacity .3s, visibility .3s;
            white-space: normal;
            word-wrap: break-word;
        }

            .tooltip .tooltip-text::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 8px;
                border-style: solid;
                border-color: var(--bg-card) transparent transparent transparent;
            }

        .tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }

    @media (max-width: 600px) {
        .tooltip .tooltip-text {
            min-width: 120px;
            max-width: 90vw;
            font-size: .75rem;
            padding: .5rem;
        }
    }
</style>
