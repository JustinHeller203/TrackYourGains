<!-- src/components/ui/calculators/BmiCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'BMI-Rechner' }}

                <ExplanationPopup v-if="info"
                                  title="BMI (Body-Mass-Index)"
                                  kicker="Rechner erklärt"
                                  aria-open="BMI Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="info">
                    <template #graphic>
                        <div class="calc-hero" role="img" aria-label="BMI Kurzkarte">
                            <div class="calc-hero-top">
                                <span class="calc-hero-title">ℹ️ Was bedeutet dein BMI?</span>
                            </div>

                            <div class="calc-hero-sub">
                                BMI ist nur ein Richtwert – kein Urteil über dich.
                            </div>

                            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                                <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">
                                    ⚙️ So wird er berechnet
                                </button>

                                <button class="calc-chip" type="button" @click="jumpTo('calc_bands')">
                                    📊 So wird’s eingeordnet
                                </button>

                                <button class="calc-chip" type="button" @click="jumpTo('calc_limits')">
                                    ⚠️ Bei Muskeln oft falsch
                                </button>
                            </div>

                        </div>
                    </template>


                    <div class="calc-scan">
                        <div v-if="bmiResult" id="calc_you" class="calc-callout calc-callout--tldr" :class="{ 'calc-target': activeTargetId === 'calc_you' }" tabindex="-1">
                            <div class="calc-callout-title">✅ Dein Ergebnis</div>
                            <div class="calc-callout-text">
                                <div><strong>BMI:</strong> {{ bmiResult.value.toFixed(1) }} — <strong>{{ bmiResult.category }}</strong></div>
                                <div class="calc-note calc-note--tight">
                                    Tipp: Nutze das als <strong>Startpunkt</strong>, nicht als Urteil.
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
                            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('calc_bands')">📊 Bereiche</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">⚠️ Grenzen</button>
                            <button class="calc-chip"
                                    type="button"
                                    :disabled="!bmiResult"
                                    :aria-disabled="(!bmiResult).toString()"
                                    :class="{ 'is-disabled': !bmiResult }"
                                    :title="bmiResult ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                                    @click="copyPopupSummary()">
                                📋 Copy
                            </button>                        </div>

                        <div id="calc_tldr" class="calc-callout calc-callout--tldr" :class="{ 'calc-target': activeTargetId === 'calc_tldr' }" tabindex="-1">
                            <div class="calc-callout-title"> 📌 Kurzfassung</div>
                            <div class="calc-callout-text">
                                <div>
                                    Der BMI zeigt nur: <strong>Wie schwer du für deine Größe bist.</strong>
                                </div>

                                <ul class="calc-list calc-list--spaced">
                                    <li><strong>Gut:</strong> schneller Startpunkt / grobe Einordnung</li>
                                    <li><strong>Nicht gut:</strong> sagt nichts sicher über <strong>Fett</strong> oder <strong>Muskeln</strong></li>
                                    <li><strong>Merke:</strong> Sportliche wirken oft „zu schwer“, obwohl sie fit sind</li>
                                </ul>
                            </div>
                        </div>

                        <div class="calc-callout" :class="{ 'calc-target': activeTargetId === 'calc_next' }" tabindex="-1" id="calc_next">
                            <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                            <ul class="calc-list">
                                <li><strong>Normalbereich:</strong> stabil bleiben (Gewohnheiten halten)</li>
                                <li><strong>Zu hoch:</strong> Defizit + Schritte/Training hoch</li>
                                <li><strong>Zu niedrig:</strong> mehr Kalorien + Protein + Krafttraining</li>
                            </ul>
                        </div>
                        <div class="calc-grid">
                            <section class="calc-card">
                                <h4 class="calc-h">👥 Für wen ist BMI sinnvoll?</h4>
                                <ul class="calc-list">
                                    <li>✅ Gut: Alltag / Anfänger / grobe Orientierung</li>
                                    <li>⚠️ Vorsicht: viel Krafttraining / viel Muskelmasse</li>
                                    <li>❌ Ungeeignet: Bodybuilding / Leistungssport</li>
                                </ul>
                            </section>

                            <section class="calc-card">
                                <h4 class="calc-h">🧠 Was misst der BMI?</h4>
                                <ul class="calc-list">
                                    <li><strong>Misst:</strong> Gewicht ↔ Größe</li>
                                    <li><strong>Misst nicht:</strong> Muskel vs. Fett, Körperform, Athletik</li>
                                    <li><strong>Interpretation:</strong> “Wie schwer bist du für deine Größe?”</li>
                                </ul>
                            </section>

                            <section class="calc-card">
                                <h4 class="calc-h">⚖️ BMI vs. Körperfett</h4>
                                <ul class="calc-list">
                                    <li><strong>BMI:</strong> Gewicht & Größe → schnelle Zahl</li>
                                    <li><strong>KFA:</strong> Fettanteil → viel näher an „Form“ & Gesundheit</li>
                                    <li><strong>Merke:</strong> Wenn du’s ernst meinst: KFA schlägt BMI</li>
                                </ul>
                            </section>

                            <section id="calc_formula" class="calc-card" :class="{ 'calc-target': activeTargetId === 'calc_formula' }" tabindex="-1">
                                <h4 class="calc-h">⚙️ Formel</h4>
                                <div class="calc-formula">
                                    <span class="calc-formula-k">BMI</span>
                                    <span class="calc-formula-eq">=</span>
                                    <span class="calc-formula-v">Gewicht (kg) ÷ Größe² (m)</span>
                                </div>
                                <div class="calc-note">
                                    Tipp: 180&nbsp;cm = <strong>1,80&nbsp;m</strong> (also durch 100 teilen).
                                </div>
                                <div v-if="normalWeightRange" class="calc-note calc-note--spaced">
                                    <strong>Normalbereich (für deine Größe):</strong>
                                    ca. <strong>{{ normalWeightRange.kgMin }}–{{ normalWeightRange.kgMax }} kg</strong>
                                    <span v-if="normalWeightRange.lbMin"> (≈ {{ normalWeightRange.lbMin }}–{{ normalWeightRange.lbMax }} lbs)</span>
                                </div>
                            </section>

                            <section id="calc_bands" class="calc-card" :class="{ 'calc-target': activeTargetId === 'calc_bands' }" tabindex="-1">
                                <h4 class="calc-h">📊 Kategorien</h4>
                                <div class="calc-bands">
                                    <div class="calc-band"><span class="calc-band-k">Unter 18,5</span><span class="calc-band-v">Untergewicht</span></div>
                                    <div class="calc-band"><span class="calc-band-k">18,5 – 24,9</span><span class="calc-band-v">Normalbereich</span></div>
                                    <div class="calc-band"><span class="calc-band-k">25 – 29,9</span><span class="calc-band-v">Übergewicht</span></div>
                                    <div class="calc-band"><span class="calc-band-k">30+</span><span class="calc-band-v">Adipositas</span></div>
                                </div>
                            </section>

                            <section id="calc_example"
                                     class="calc-card"
                                     :class="{ 'calc-target': activeTargetId === 'calc_example' }"
                                     tabindex="-1">
                                <h4 class="calc-h">📐 Beispiel</h4>
                                <div class="calc-example">
                                    <div class="calc-example-row">
                                        <span>80&nbsp;kg bei 1,80&nbsp;m</span>
                                        <span class="calc-example-strong">≈ 24,7</span>
                                    </div>
                                    <div class="calc-example-sub">
                                        Formal “Normalbereich”. Realität hängt stark von <strong>Muskelmasse</strong> &amp; <strong>KFA</strong> ab.
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div class="calc-callout">
                            <div class="calc-callout-title">🧠 Wann du den BMI locker ignorieren darfst</div>
                            <ul class="calc-list">
                                <li>Du bist leistungsfähig (Kraft/Condition gut)</li>
                                <li>Deine Taille ist im Rahmen</li>
                                <li>Du fühlst dich fit & Schlaf/Stress passt</li>
                            </ul>
                        </div>
                        <div id="calc_limits" class="calc-callout calc-callout--warn" :class="{ 'calc-target': activeTargetId === 'calc_limits' }" tabindex="-1">
                            <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                            <ul class="calc-list">
                                <li><strong>Viel Muskel</strong> → BMI oft “zu hoch”</li>
                                <li><strong>Wenig Muskel</strong> → BMI kann “ok” wirken, obwohl KFA mies ist</li>
                            </ul>
                        </div>

                        <section class="calc-card">
                            <h4 class="calc-h">❓ Häufige Fragen</h4>
                            <ul class="calc-list">
                                <li><strong>„BMI sagt Übergewicht, aber ich bin muskulös?“</strong> → kommt oft vor.</li>
                                <li><strong>„Ist BMI gefährlich?“</strong> → nein, nur ungenau.</li>
                                <li><strong>„Was ist besser?“</strong> → KFA, Taille, Fotos, Leistung.</li>
                            </ul>
                        </section>
                    </div>

                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                BMI = <strong>Startpunkt</strong>. Für echte Einschätzung: <strong>Körperfett</strong>, <strong>Umfänge</strong> oder <strong>Progress-Fotos</strong>.
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

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="bmiResult" class="result">
            <div class="result-header">
                <p><strong>BMI:</strong> {{ bmiResult.value.toFixed(1) }}</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <p>Kategorie: {{ bmiResult.category }}</p>
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

    type Gender = 'male' | 'female'
    type Unit = 'kg' | 'lb' | 'lbs' | string

    interface BmiResult { value: number; category: string }

    const normalWeightRange = computed(() => {
        const cm = props.bmiHeight
        if (!cm || cm <= 0) return null

        const m = cm / 100
        const kgMin = 18.5 * m * m
        const kgMax = 24.9 * m * m

        const round1 = (v: number) => Math.round(v * 10) / 10
        const kgMinR = round1(kgMin)
        const kgMaxR = round1(kgMax)

        const toLb = (kg: number) => kg * 2.2046226218
        const lbMinR = round1(toLb(kgMin))
        const lbMaxR = round1(toLb(kgMax))

        return {
            kgMin: kgMinR,
            kgMax: kgMaxR,
            lbMin: lbMinR,
            lbMax: lbMaxR
        }
    })

    const activeTargetId = ref<string | null>(null)
    let activeTargetTimer: number | null = null

    function jumpTo(id: string) {
        const el = document.getElementById(id)
        if (!el) return

        // vorheriges Highlight killen
        if (activeTargetTimer) window.clearTimeout(activeTargetTimer)

        activeTargetId.value = id

        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ; (el as HTMLElement).focus?.({ preventScroll: true })

        // Highlight nach kurzer Zeit wieder ausblenden
        activeTargetTimer = window.setTimeout(() => {
            activeTargetId.value = null
            activeTargetTimer = null
        }, 1400)
    }

    async function copyPopupSummary() {
        if (!props.bmiResult) return

        const parts: string[] = []

        if (props.bmiHeight) parts.push(`Größe: ${props.bmiHeight} cm`)
        if (props.bmiWeight != null) parts.push(`Gewicht: ${props.bmiWeight} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)

        if (props.bmiResult) {
            parts.push(`BMI: ${props.bmiResult.value.toFixed(1)} (${props.bmiResult.category})`)
        }

        if (normalWeightRange.value) {
            parts.push(`Normalbereich (18,5–24,9): ${normalWeightRange.value.kgMin}–${normalWeightRange.value.kgMax} kg`)
        }

        const text = parts.join(' | ')
        try {
            await navigator.clipboard.writeText(text)

            // 🔔 Parent informieren → Toast anzeigen
            emit('copy')

            activeTargetId.value = 'calc_you'
            window.setTimeout(() => (activeTargetId.value = null), 700)

        } catch {
            // optional später: Fehler-Toast
        }
    }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        bmiGender: Gender
        bmiWeight: number | null
        bmiHeight: number | null
        bmiResult: BmiResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:bmiGender', v: Gender): void
        (e: 'update:bmiWeight', v: number | null): void
        (e: 'update:bmiHeight', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    const gender = computed(() => props.bmiGender)
    const weight = computed(() => props.bmiWeight)
    const height = computed(() => props.bmiHeight)

    const LS_KEY = 'tyg_bmi_inputs_v1'

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)

            // Nur setzen, wenn noch leer ist (nicht überschreiben)
            if (props.bmiGender == null && data.gender) emit('update:bmiGender', data.gender)
            if (props.bmiWeight == null && typeof data.weight === 'number') emit('update:bmiWeight', data.weight)
            if (props.bmiHeight == null && typeof data.height === 'number') emit('update:bmiHeight', data.height)
        } catch { }
    })

    watch(
        () => [props.bmiGender, props.bmiWeight, props.bmiHeight],
        ([g, w, h]) => {
            try {
                localStorage.setItem(LS_KEY, JSON.stringify({ gender: g, weight: w, height: h }))
            } catch { }
        },
        { deep: false }
    )

    function onGenderChange(ev: Event) {
        emit('update:bmiGender', (ev.target as HTMLSelectElement).value as Gender)
    }
    function onWeightInput(ev: Event) {
        const raw = (ev.target as HTMLInputElement).value
        emit('update:bmiWeight', raw === '' ? null : Number(raw))
    }
    function onHeightInput(ev: Event) {
        const raw = (ev.target as HTMLInputElement).value
        emit('update:bmiHeight', raw === '' ? null : Number(raw))
    }
</script>

<style scoped>
    /* Basis-Styles, Tooltip-/Fav-Button-Styles entfernt (kommen aus ExplanationPopup/FavoriteButton) */

    .calculator-card {
        position: relative;
        /* overflow entfernt, damit Popup/Tooltip nicht abgeschnitten wird */
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
            transform: translateY(-4px);
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4);
            border-color: rgba(129, 140, 248, 0.7);
            background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
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

        .input-group label {
            display: block;
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

    .edit-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: 0.9rem;
        transition: border-color .3s, box-shadow .3s;
    }

        .edit-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99, 102, 241, 0.5);
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
        padding: 0.75rem 1rem 0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 0.75rem;
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
            grid-template-columns: 1fr 1fr;
            gap: .5rem;
            width: 100%;
        }

        .calc-footer-btn {
            min-height: 44px;
            padding: .5rem .6rem;
        }
    }
</style>