<!-- src/components/ui/calculators/FfmiCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">

            <h3 class="card-title">
                {{ title || 'FFMI-Rechner' }}

                <ExplanationPopup v-if="infoText"
                                  title="FFMI (Fat-Free Mass Index)"
                                  kicker="Rechner erklärt"
                                  aria-open="FFMI Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="infoText">
                    <template #graphic>
                        <div class="calc-hero" role="img" aria-label="FFMI Kurzkarte">
                            <div class="calc-hero-top">
                                <span class="calc-hero-title">ℹ️ Was bedeutet FFMI?</span>
                            </div>

                            <div class="calc-hero-sub">
                                FFMI zeigt deine <strong>fettfreie Masse</strong> (Gewicht minus Fett) im Verhältnis zur <strong>Größe</strong> — je höher, desto „muskulöser“ (bei ähnlichem KFA).
                            </div>

                            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                                <button class="calc-chip" type="button" @click="jumpTo('ffmi_formula')">⚙️ Formel</button>
                                <button class="calc-chip" type="button" @click="jumpTo('ffmi_bands')">📊 Einordnung</button>
                                <button class="calc-chip" type="button" @click="jumpTo('ffmi_next')">👉 Was heißt das?</button>
                                <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">⚠️ Wichtig</button>
                            </div>
                        </div>
                    </template>

                    <div class="calc-scan">
                        <div v-if="result"
                             id="ffmi_you"
                             class="calc-callout calc-callout--tldr"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_you' }"
                             tabindex="-1">
                            <div class="calc-callout-title">✅ Dein Ergebnis</div>
                            <div class="calc-callout-text">
                                <div><strong>FFMI:</strong> {{ result.value.toFixed(1) }} — <strong>{{ result.category }}</strong></div>
                                <div class="calc-note calc-note--tight">
                                    Tipp: FFMI ist ein Richtwert. Progress + KFA-Schätzung entscheidet.
                                </div>

                                <div class="calc-actions">
                                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_next')">👉 Was heißt das?</button>
                                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_bands')">📊 Einordnung</button>
                                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">⚠️ Wichtig</button>
                                </div>
                            </div>
                        </div>

                        <div class="calc-chips" aria-label="Kurzüberblick">
                            <button class="calc-chip" type="button" @click="jumpTo('ffmi_formula')">⚙️ Formel</button>
                            <button class="calc-chip" type="button" @click="jumpTo('ffmi_example')">📐 Beispiel</button>
                            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('ffmi_bands')">📊 Bereiche</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">⚠️ Wichtig</button>
                            <button class="calc-chip"
                                    type="button"
                                    :disabled="!result"
                                    :aria-disabled="(!result).toString()"
                                    :class="{ 'is-disabled': !result }"
                                    :title="result ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                                    @click="copyPopupSummary()">
                                📋 Copy
                            </button>
                        </div>

                        <div id="ffmi_tldr"
                             class="calc-callout calc-callout--tldr"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_tldr' }"
                             tabindex="-1">
                            <div class="calc-callout-title">📌 Kurzfassung</div>
                            <div class="calc-callout-text">
                                <div>
                                    FFMI = <strong>fettfreie Masse</strong> relativ zur <strong>Körpergröße</strong>.
                                </div>
                                <ul class="calc-list calc-list--spaced">
                                    <li><strong>Besser als BMI:</strong> berücksichtigt Fettanteil (indirekt)</li>
                                    <li><strong>Heißt nicht:</strong> „gesund/ungesund“ — nur Körperkomposition</li>
                                    <li><strong>Merke:</strong> KFA-Schätzung muss halbwegs passen</li>
                                </ul>
                            </div>
                        </div>

                        <div class="calc-callout"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_next' }"
                             tabindex="-1"
                             id="ffmi_next">
                            <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                            <ul class="calc-list">
                                <li><strong>FFMI steigt:</strong> du hast (meist) fettfreie Masse aufgebaut oder KFA ist gesunken.</li>
                                <li><strong>FFMI stagniert:</strong> okay — check Progress im Gym + Kalorien/Protein + Schlaf.</li>
                                <li><strong>FFMI fällt:</strong> oft Cut zu hart / Kraft sinkt / KFA-Schätzung daneben.</li>
                            </ul>
                        </div>

                        <div class="calc-grid">

                            <section class="calc-card">
                                <h4 class="calc-h">👥 Für wen ist der FFMI wertvoll?</h4>
                                <ul class="calc-list">
                                    <li>✅ Krafttraining: “baue ich wirklich Muskeln auf?”</li>
                                    <li>✅ Cut/Bulk: Fortschritt trotz Gewichtsschwankungen besser einordnen</li>
                                    <li>✅ Wenn BMI dich verarscht (viel Muskel / wenig Muskel)</li>
                                    <li>⚠️ Wenn KFA nur geraten ist: nur als groben Trend nutzen</li>
                                </ul>
                            </section>

                            <section class="calc-card">
                                <h4 class="calc-h">🧠 Was misst der FFMI?</h4>
                                <ul class="calc-list">
                                    <li><strong>Misst:</strong> fettfreie Masse relativ zur Größe</li>
                                    <li><strong>Beinhaltet:</strong> Muskeln + Wasser + Knochen + Organe (alles ohne Fett)</li>
                                    <li><strong>Misst nicht:</strong> “gesund/ungesund” oder “ästhetisch”</li>
                                    <li><strong>Merke:</strong> gleiche FFMI-Zahl kann bei unterschiedlichem KFA komplett anders aussehen</li>
                                </ul>
                            </section>

                            <section class="calc-card">
                                <h4 class="calc-h">⚖️ FFMI vs. BMI</h4>
                                <ul class="calc-list">
                                    <li><strong>BMI:</strong> Gewicht ↔ Größe (keine Ahnung ob Muskel oder Fett)</li>
                                    <li><strong>FFMI:</strong> nimmt Fett raus (über KFA) → näher an “Muskel-Status”</li>
                                    <li><strong>Praxis:</strong> Wenn du trainierst, ist FFMI fast immer hilfreicher als BMI</li>
                                </ul>
                            </section>
                            <section id="ffmi_formula"
                                     class="calc-card"
                                     :class="{ 'calc-target': activeTargetId === 'ffmi_formula' }"
                                     tabindex="-1">
                                <h4 class="calc-h">⚙️ Formel</h4>
                                <div class="calc-note">1) Fettfreie Masse berechnen → 2) auf Größe normieren.</div>
                                <div class="calc-formula calc-formula--first">
                                    <span class="calc-formula-k">FFM</span>
                                    <span class="calc-formula-eq">=</span>
                                    <span class="calc-formula-v">Gewicht × (1 − KFA)</span>
                                </div>
                                <div class="calc-formula">
                                    <span class="calc-formula-k">FFMI</span>
                                    <span class="calc-formula-eq">=</span>
                                    <span class="calc-formula-v">FFM ÷ Größe² (m)</span>
                                </div>
                            </section>

                            <section id="ffmi_bands"
                                     class="calc-card"
                                     :class="{ 'calc-target': activeTargetId === 'ffmi_bands' }"
                                     tabindex="-1">
                                <h4 class="calc-h">📊 Einordnung (grob)</h4>
                                <ul class="calc-list">
                                    <li><strong>~18–20:</strong> sportlich/fit</li>
                                    <li><strong>~20–22:</strong> sehr solide Muskelbasis</li>
                                    <li><strong>~22–24:</strong> stark (meist viel Training)</li>
                                    <li><strong>24+:</strong> selten ohne sehr viel Training + sehr guten Voraussetzungen</li>
                                </ul>
                                <div class="calc-note calc-note--tight">
                                    Das ist grob: KFA-Schätzung & Messfehler können die Zahl spürbar verschieben.
                                </div>
                            </section>

                            <section id="ffmi_example"
                                     class="calc-card"
                                     :class="{ 'calc-target': activeTargetId === 'ffmi_example' }"
                                     tabindex="-1">
                                <h4 class="calc-h">📐 Beispiel</h4>
                                <div class="calc-example">
                                    <div class="calc-example-row">
                                        <span>80 kg, 180 cm, 15% KFA</span>
                                        <span class="calc-example-strong">FFMI ≈ 20,9</span>
                                    </div>
                                    <div class="calc-example-sub">
                                        Stabil sportlich. Wird höher durch mehr fettfreie Masse oder weniger KFA.
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div id="ffmi_important"
                             class="calc-callout calc-callout--warn"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_important' }"
                             tabindex="-1">
                            <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                            <ul class="calc-list">
                                <li><strong>KFA-Schätzung</strong> ist der größte Hebel: daneben = FFMI daneben.</li>
                                <li><strong>Wasser/Glykogen</strong> ändern Gewicht kurzfristig → Zahl kann springen.</li>
                                <li>Bewerte lieber <strong>Trend + Kraftwerte + Fotos</strong> statt nur eine Zahl.</li>
                            </ul>
                        </div>

                        <div id="ffmi_ignore"
                             class="calc-callout"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_ignore' }"
                             tabindex="-1">
                            <div class="calc-callout-title">🧠 Wann du den FFMI locker ignorieren darfst</div>
                            <ul class="calc-list">
                                <li>Deine <strong>Kraft</strong> steigt solide und dein Training läuft.</li>
                                <li>Du hast klare <strong>Messwerte</strong> (Taille/Umfänge/Fotos) die den Trend zeigen.</li>
                                <li>Dein KFA ist nur geraten und schwankt — dann ist FFMI halt Noise.</li>
                            </ul>
                        </div>

                        <section class="calc-card">
                            <h4 class="calc-h">❓ Häufige Fragen</h4>
                            <ul class="calc-list">
                                <li><strong>„Warum schwankt mein FFMI?“</strong> → KFA-Schätzung/Wasser/Wiegen.</li>
                                <li><strong>„Wie genau muss mein KFA sein, damit FFMI Sinn macht?“</strong> → Nutz immer die gleiche Methode + gleiche Bedingungen und schau auf den Trend.</li>
                                <li><strong>„Wie steigern?“</strong> → Aufbau + Progression + Protein + Schlaf.</li>
                            </ul>
                        </section>
                    </div>


                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                FFMI ist ein <strong>Kompass</strong>, kein Urteil. Tracke <strong>Gewicht</strong>, <strong>KFA-Trend</strong> und <strong>Leistung</strong> zusammen.
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
            <label>Körperfettanteil (%)</label>
            <input :value="bodyFat ?? ''"
                   @input="onBodyFatInput"
                   type="number"
                   placeholder="z.B. 15"
                   class="edit-input" />
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result" class="result">
            <div class="result-header">
                <p><strong>FFMI:</strong> {{ result.value.toFixed(1) }}</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <p>Kategorie: {{ result.category }}</p>
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
    interface FfmiResult { value: number; category: string }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        ffmiWeight: number | null
        ffmiHeight: number | null
        ffmiBodyFat: number | null
        ffmiResult: FfmiResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:ffmiWeight', v: number | null): void
        (e: 'update:ffmiHeight', v: number | null): void
        (e: 'update:ffmiBodyFat', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    const weight = computed(() => props.ffmiWeight)
    const height = computed(() => props.ffmiHeight)
    const bodyFat = computed(() => props.ffmiBodyFat)
    const result = computed(() => props.ffmiResult)

    const infoText = computed(
        () =>
            props.info ??
            'FFMI (Fat-Free Mass Index) ist wie ein „Muskel-Index“: Er nimmt deine fettfreie Masse (Gewicht minus Fett) und setzt sie ins Verhältnis zur Größe. Praktisch, um „muskulös vs. nur schwer“ zu unterscheiden. Wichtig: Wenn der KFA daneben liegt, ist auch der FFMI ungenauer — deshalb eher Trends vergleichen als eine Zahl feiern.'
    )

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
        if (!result.value) return

        const parts: string[] = []

        if (weight.value != null) parts.push(`Gewicht: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        if (height.value != null) parts.push(`Größe: ${height.value} cm`)
        if (bodyFat.value != null) parts.push(`KFA: ${bodyFat.value}%`)

        if (result.value) parts.push(`FFMI: ${result.value.value.toFixed(1)} (${result.value.category})`)

        const text = parts.join(' | ')
        try {
            await navigator.clipboard.writeText(text)
            emit('copy')
            activeTargetId.value = 'ffmi_you'
            window.setTimeout(() => (activeTargetId.value = null), 700)
        } catch {
            // optional später: Fehler-Toast
        }
    }
    function onWeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:ffmiWeight', raw === '' ? null : Number(raw))
    }
    function onHeightInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:ffmiHeight', raw === '' ? null : Number(raw))
    }
    function onBodyFatInput(e: Event) {
        const raw = (e.target as HTMLInputElement).value
        emit('update:ffmiBodyFat', raw === '' ? null : Number(raw))
    }
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

        display: flex;
        gap: .5rem;
        flex-wrap: wrap;
    }
</style>
