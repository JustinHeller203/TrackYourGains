<!-- src/components/ui/calculators/BodyFatCalculator.vue -->
<template>
    <div class="calculator-card">
        <div class="card-header">
            <h3 class="card-title">
                {{ title || 'Körperfett-Rechner' }}

                <ExplanationPopup v-if="infoText"
                                  title="Körperfett (KFA)"
                                  kicker="Rechner erklärt"
                                  aria-open="Körperfett Erklärung öffnen"
                                  aria-close="Schließen"
                                  :text="infoText">
                    <template #graphic>
                        <div class="calc-hero" role="img" aria-label="Körperfett Kurzkarte">
                            <div class="calc-hero-top">
                                <span class="calc-hero-title">ℹ️ Was bedeutet dein Körperfett?</span>
                            </div>

                            <div class="calc-hero-sub">
                                KFA ist oft ehrlicher als BMI – aber bleibt trotzdem nur eine Schätzung.
                            </div>

                            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                                <button class="calc-chip" type="button" @click="jumpTo('bf_tracking')">
                                    📈 Tracking
                                </button>

                                <button class="calc-chip" type="button" @click="jumpTo('bf_formula')">
                                    ⚙️ So wird er berechnet
                                </button>

                                <button class="calc-chip" type="button" @click="jumpTo('bf_bands')">
                                    📊 So wird’s eingeordnet
                                </button>

                                <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('bf_limits')">
                                    ⚠️ Grenzen / Fehlerquellen
                                </button>
                            </div>

                        </div>
                    </template>

                    <div class="calc-scan">
                        <div v-if="result !== null"
                             id="bf_you"
                             class="calc-callout calc-callout--tldr"
                             :class="{ 'calc-target': activeTargetId === 'bf_you' }"
                             tabindex="-1">
                            <div class="calc-callout-title">✅ Dein Ergebnis</div>
                            <div class="calc-callout-text">
                                <div>
                                    <strong>Körperfett:</strong> {{ result!.toFixed(1) }}% — <strong>{{ kfaLabel }}</strong>
                                </div>

                                <div class="bf-tip">
                                    Tipp: Tracke lieber <strong>Trend</strong> statt einzelne Messung.
                                </div>

                                <div class="calc-actions">
                                    <button class="calc-chip" type="button" @click="jumpTo('bf_next')">👉 Was heißt das?</button>
                                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('bf_limits')">⚠️ Grenzen</button>
                                </div>
                            </div>
                        </div>

                        <div class="calc-chips" aria-label="Kurzüberblick">
                            <button class="calc-chip" type="button" @click="jumpTo('bf_tracking')">📈 Tracking</button>
                            <button class="calc-chip" type="button" @click="jumpTo('bf_formula')">⚙️ Formel</button>
                            <button class="calc-chip" type="button" @click="jumpTo('bf_example')">📐 Beispiel</button>
                            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('bf_bands')">📊 Bereiche</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('bf_limits')">⚠️ Grenzen</button>
                            <button class="calc-chip"
                                    type="button"
                                    :disabled="result === null"
                                    :aria-disabled="(result === null).toString()"
                                    :class="{ 'is-disabled': result === null }"
                                    :title="result !== null ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                                    @click="copyPopupSummary()">
                                📋 Copy
                            </button>                        </div>

                        <div id="bf_tldr"
                             class="calc-callout calc-callout--tldr"
                             :class="{ 'calc-target': activeTargetId === 'bf_tldr' }"
                             tabindex="-1">
                            <div class="calc-callout-title">📌 Kurzfassung</div>
                            <div class="calc-callout-text">
                                <div>
                                    Der KFA schätzt: <strong>wie viel % deines Körpers Fett ist</strong>.
                                </div>

                                <ul class="calc-list calc-list--spaced">
                                    <li><strong>Gut:</strong> viel näher an “Form” als BMI</li>
                                    <li><strong>Aber:</strong> Messfehler sind normal (1–3% easy)</li>
                                    <li><strong>Merke:</strong> gleiche Uhrzeit / gleiche Bedingungen = bester Vergleich</li>
                                </ul>
                            </div>
                        </div>

                        <div id="bf_next"
                             class="calc-callout"
                             :class="{ 'calc-target': activeTargetId === 'bf_next' }"
                             tabindex="-1">
                            <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                            <ul class="calc-list">
                                <li><strong>Zu hoch:</strong> Defizit + Schritte + Krafttraining halten</li>
                                <li><strong>Sehr niedrig:</strong> Performance/Hormone checken, nicht blind weiter cutten</li>
                                <li><strong>Stabil:</strong> Fokus auf Kraft/Schlaf/Alltag → Form kommt von allein</li>
                            </ul>
                        </div>

                        <div class="calc-grid">
                            <section class="calc-card">
                                <h4 class="calc-h">👥 Für wen ist KFA sinnvoll?</h4>
                                <ul class="calc-list">
                                    <li>✅ Gut: Fettverlust tracken</li>
                                    <li>✅ Gut: “Skinny-Fat” erkennen</li>
                                    <li>⚠️ Vorsicht: einzelne Messung überbewerten</li>
                                </ul>
                            </section>

                            <section class="calc-card">
                                <h4 class="calc-h">🧠 Was misst die US-Navy Methode?</h4>
                                <ul class="calc-list">
                                    <li><strong>Nutzen:</strong> Umfänge + Größe</li>
                                    <li><strong>Schätzt:</strong> KFA (nicht direkt gemessen)</li>
                                    <li><strong>Wichtig:</strong> Maßband-Technik entscheidet über Genauigkeit</li>
                                </ul>
                            </section>

                            <section id="bf_formula"
                                     class="calc-card"
                                     :class="{ 'calc-target': activeTargetId === 'bf_formula' }"
                                     tabindex="-1">
                                <h4 class="calc-h">⚙️ Formel</h4>

                                <div class="calc-note">
                                    Methode: <strong>US-Navy</strong> (Umfänge + Größe). Wichtig: <strong>alle Werte in cm</strong>, Log = <strong>log10</strong>.
                                </div>

                                <div class="calc-formula calc-formula--first">
                                    <span class="calc-formula-k">Männer</span>
                                    <span class="calc-formula-eq">=</span>
                                    <span class="calc-formula-v">
                                        86.010·log10(Bauch−Hals) − 70.041·log10(Größe) + 36.76
                                    </span>
                                </div>

                                <div class="calc-formula">
                                    <span class="calc-formula-k">Frauen</span>
                                    <span class="calc-formula-eq">=</span>
                                    <span class="calc-formula-v">
                                        163.205·log10(Bauch+Hüfte−Hals) − 97.684·log10(Größe) − 78.387
                                    </span>
                                </div>

                                <div class="calc-note calc-note--spaced">
                                    Tipp: Miss <strong>immer gleich</strong> (gleiche Stelle, gleiche Uhrzeit, entspannt) → sonst sind 1–3% Sprünge normal.
                                </div>
                            </section>

                            <section id="bf_bands"
                                     class="calc-card"
                                     :class="{ 'calc-target': activeTargetId === 'bf_bands' }"
                                     tabindex="-1">
                                <h4 class="calc-h">📊 Grobe Einordnung</h4>

                                <div class="calc-bands">
                                    <div class="calc-band" v-for="b in bands" :key="b.k">
                                        <span class="calc-band-k">{{ b.k }}</span>
                                        <span class="calc-band-v">{{ b.v }}</span>
                                    </div>
                                </div>

                                <div class="calc-note calc-note--spaced">
                                    Hinweis: Kategorien sind <strong>Richtwerte</strong>. Ziel hängt von Gesundheit, Sport & Wohlbefinden ab.
                                </div>
                            </section>

                            <section id="bf_example"
                                     class="calc-card"
                                     :class="{ 'calc-target': activeTargetId === 'bf_example' }"
                                     tabindex="-1">
                                <h4 class="calc-h">📐 Beispiel</h4>
                                <div class="calc-example">
                                    <div class="calc-example-row">
                                        <span>180 cm • Bauch 85 • Hals 38</span>
                                        <span class="calc-example-strong">≈ 16%</span>
                                    </div>
                                    <div class="calc-example-sub">
                                        Beispielwert: <strong>Messung</strong>, <strong>Wasser</strong> & <strong>Timing</strong> können easy 1–3% schieben.
                                    </div>
                                </div>
                            </section>

                            <section class="calc-card">
                                <h4 class="calc-h">⚖️ Körperfett vs. BMI</h4>
                                <ul class="calc-list">
                                    <li><strong>BMI:</strong> Gewicht & Größe → schnelle Zahl, aber bei Muskeln oft Quatsch</li>
                                    <li><strong>KFA:</strong> Fettanteil-Schätzung → näher an „Form“ als BMI</li>
                                    <li><strong>Merke:</strong> Für Cut/Shape-Tracking: <strong>KFA + Taille + Fotos</strong> schlägt BMI</li>
                                </ul>
                            </section>

                            <section class="calc-card">
                                <h4 class="calc-h">📐 So misst du richtig:</h4>
                                <ul class="calc-list">
                                    <li><strong>Bauch:</strong> Maßband um den Bauch <strong>auf Höhe vom Bauchnabel</strong> – <strong>normal ausatmen</strong>, nicht einziehen.</li>
                                    <li><strong>Hals:</strong> Maßband um den Hals <strong>direkt unter dem Adamsapfel</strong> – gerade halten, nicht würgen.</li>
                                    <li><strong>Hüfte (nur Frauen):</strong> um die Hüfte an der <strong>breitesten Stelle vom Po</strong>.</li>
                                </ul>
                            </section>

                            <div id="bf_tracking"
                                 class="calc-callout"
                                 :class="{ 'calc-target': activeTargetId === 'bf_tracking' }"
                                 tabindex="-1">
                                <div class="calc-callout-title">📈 KFA richtig tracken</div>
                                <ul class="calc-list">
                                    <li><strong>Nur Trend zählt:</strong> einzelne Messung kann easy <strong>1–3%</strong> daneben sein.</li>
                                    <li><strong>1× pro Woche reicht:</strong> gleicher Tag, gleiche Uhrzeit, gleiche Bedingungen.</li>
                                    <li><strong>Beste Kombi:</strong> <strong>KFA + Taille + Fotos</strong> → dann bist du safe.</li>
                                    <li><strong>Wenn’s springt:</strong> Salz, Wasser, Schlaf, Verdauung – nicht direkt “Fett”.</li>
                                </ul>
                            </div>

                        </div>

                        <div class="calc-callout">
                            <div class="calc-callout-title">🧠 Wann du den KFA-Rechner locker ignorieren darfst</div>
                            <ul class="calc-list">
                                <li>Du trackst schon <strong>Taille</strong> + <strong>Fotos</strong> + <strong>Leistung</strong> (reicht oft völlig)</li>
                                <li>Du bist gerade <strong>voll gepumpt / viel Salz / wenig Schlaf</strong> → Werte sind oft Müll</li>
                                <li>Du misst nicht konstant (Stelle/Spannung/Uhrzeit) → dann lieber gar nicht</li>
                            </ul>
                        </div>

                        <div id="bf_limits"
                             class="calc-callout calc-callout--warn"
                             :class="{ 'calc-target': activeTargetId === 'bf_limits' }"
                             tabindex="-1">
                            <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                            <ul class="calc-list">
                                <li><strong>Messfehler</strong> sind normal → 1–3% Abweichung möglich</li>
                                <li><strong>Hydration/Salz</strong> kann Umfang & Ergebnis pushen</li>
                                <li><strong>Nur Trend zählt:</strong> gleiche Bedingungen, gleiche Stelle, gleiche Zeit</li>
                            </ul>
                        </div>

                        <div class="calc-callout">
                            <div class="calc-callout-title">❓ Häufige Fragen</div>
                            <ul class="calc-list">
                                <li><strong>„Warum springt mein Wert?“</strong> → Messung, Wasser, Verdauung, Timing.</li>
                                <li><strong>„Was ist besser als US-Navy?“</strong> → DEXA/Caliper (gut gemacht), Fotos+Taille.</li>
                                <li><strong>„Wie oft messen?“</strong> → 1×/Woche reicht meistens.</li>
                            </ul>
                        </div>

                    </div>

                    <template #mini>
                        <div class="calc-mini">
                            <div class="calc-mini-title">Reality-Check ✅</div>
                            <div class="calc-mini-text">
                                KFA ist top zum Tracken. Für echte Einschätzung: <strong>Taille</strong>, <strong>Fotos</strong>, <strong>Leistung</strong>.
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
            <label>Bauchumfang (cm)</label>
            <input :value="waist ?? ''"
                   @input="onWaist"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 85" />
        </div>

        <div class="input-group">
            <label>Halsumfang (cm)</label>
            <input :value="neck ?? ''"
                   @input="onNeck"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 38" />
        </div>

        <div class="input-group" v-if="gender === 'female'">
            <label>Hüftumfang (cm)</label>
            <input :value="hip ?? ''"
                   @input="onHip"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 95" />
        </div>

        <div class="input-group">
            <label>Größe (cm)</label>
            <input :value="height ?? ''"
                   @input="onHeight"
                   type="number"
                   class="edit-input"
                   placeholder="z.B. 170" />
        </div>

        <CalculateButton v-if="!autoCalcEnabled" @click="$emit('calculate')" />

        <div v-if="result !== null" class="result">
            <div class="result-header">
                <p><strong>Körperfett:</strong> {{ result!.toFixed(1) }}%</p>
                <CopyButton @click="$emit('copy')" />
            </div>
            <p class="hint">Formel: US Navy Methode</p>
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

    const props = defineProps<{
        autoCalcEnabled: boolean
        bodyFatGender: Gender
        bodyFatWaist: number | null
        bodyFatNeck: number | null
        bodyFatHip: number | null
        bodyFatHeight: number | null
        bodyFatResult: number | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:bodyFatGender', v: Gender): void
        (e: 'update:bodyFatWaist', v: number | null): void
        (e: 'update:bodyFatNeck', v: number | null): void
        (e: 'update:bodyFatHip', v: number | null): void
        (e: 'update:bodyFatHeight', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
    }>()

    type BandRow = { k: string; v: string }

    const bands = computed<BandRow[]>(() => {
        // Richtwerte, bewusst grob gehalten (Ziel ≠ immer “so niedrig wie möglich”)
        if (gender.value === 'female') {
            return [
                { k: 'Unter ~21%', v: 'athletisch / sehr lean' },
                { k: '~21 – 28%', v: 'fit / normal' },
                { k: '~28 – 35%', v: 'erhöht' },
                { k: 'Über ~35%', v: 'hoch' }
            ]
        }
        return [
            { k: 'Unter ~10%', v: 'athletisch / sehr lean' },
            { k: '~10 – 18%', v: 'fit / normal' },
            { k: '~18 – 25%', v: 'erhöht' },
            { k: 'Über ~25%', v: 'hoch' }
        ]
    })

    const kfaLabel = computed(() => {
        if (result.value == null) return ''
        const v = result.value
        const rows = bands.value

        // super simple Buckets nach erster passenden Range
        // (nur Label, keine “medizinische Diagnose”)
        if (gender.value === 'female') {
            if (v < 21) return 'athletisch / sehr lean'
            if (v < 28) return 'fit / normal'
            if (v < 35) return 'erhöht'
            return 'hoch'
        } else {
            if (v < 10) return 'athletisch / sehr lean'
            if (v < 18) return 'fit / normal'
            if (v < 25) return 'erhöht'
            return 'hoch'
        }
    })

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
        if (result.value == null) return

        const parts: string[] = []

        parts.push(`Geschlecht: ${gender.value === 'male' ? 'Männlich' : 'Weiblich'}`)
        if (height.value) parts.push(`Größe: ${height.value} cm`)
        if (waist.value != null) parts.push(`Bauch: ${waist.value} cm`)
        if (neck.value != null) parts.push(`Hals: ${neck.value} cm`)
        if (gender.value === 'female' && hip.value != null) parts.push(`Hüfte: ${hip.value} cm`)

        if (result.value != null) {
            parts.push(`Körperfett: ${result.value.toFixed(1)}% (${kfaLabel.value})`)
        }

        parts.push(`Methode: US Navy`)

        const text = parts.join(' | ')
        try {
            await navigator.clipboard.writeText(text)

            // 🔔 wie beim BMI: Parent informieren → Toast zeigen
            emit('copy')

            activeTargetId.value = 'bf_you'
            window.setTimeout(() => (activeTargetId.value = null), 700)
        } catch {
            // optional später: Fehler-Toast
        }
    }

    // Persistenz wie beim BMI
    const LS_KEY = 'tyg_bodyfat_inputs_v1'

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)

            if (props.bodyFatGender == null && data.gender) emit('update:bodyFatGender', data.gender)
            if (props.bodyFatWaist == null && typeof data.waist === 'number') emit('update:bodyFatWaist', data.waist)
            if (props.bodyFatNeck == null && typeof data.neck === 'number') emit('update:bodyFatNeck', data.neck)
            if (props.bodyFatHip == null && typeof data.hip === 'number') emit('update:bodyFatHip', data.hip)
            if (props.bodyFatHeight == null && typeof data.height === 'number') emit('update:bodyFatHeight', data.height)
        } catch { /* noop */ }
    })

    watch(
        () => [props.bodyFatGender, props.bodyFatWaist, props.bodyFatNeck, props.bodyFatHip, props.bodyFatHeight],
        ([g, w, n, h, he]) => {
            try {
                localStorage.setItem(LS_KEY, JSON.stringify({
                    gender: g,
                    waist: w,
                    neck: n,
                    hip: h,
                    height: he
                }))
            } catch { /* noop */ }
        },
        { deep: false }
    )
    const gender = computed(() => props.bodyFatGender)
    const waist = computed(() => props.bodyFatWaist)
    const neck = computed(() => props.bodyFatNeck)
    const hip = computed(() => props.bodyFatHip)
    const height = computed(() => props.bodyFatHeight)
    const result = computed(() => props.bodyFatResult)
    const infoText = computed(
        () =>
            (props.info ?? '').trim() ||
            'US-Navy-Methode: nutzt Bauch- und Halsumfang (bei Frauen zusätzlich Hüfte) sowie die Körpergröße, um den Körperfettanteil zu schätzen.'
    )
    function onGenderChange(ev: Event) {
        emit('update:bodyFatGender', (ev.target as HTMLSelectElement).value as Gender)
    }
    function onWaist(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatWaist', v === '' ? null : Number(v))
    }
    function onNeck(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatNeck', v === '' ? null : Number(v))
    }
    function onHip(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatHip', v === '' ? null : Number(v))
    }
    function onHeight(ev: Event) {
        const v = (ev.target as HTMLInputElement).value
        emit('update:bodyFatHeight', v === '' ? null : Number(v))
    }
</script>

<style scoped>
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

    .calc-hero-pills {
        display: flex;
        flex-wrap: wrap;
        gap: .55rem;
        margin-top: .75rem;
    }
</style>

