<!-- src/components/ui/calculators/BodyFatCalculator.vue -->
<template>
    <BaseCalculator :title="title || 'Körperfett-Rechner'"
                    :showInfo="!!infoText"
                    infoTitle="Körperfett (KFA)"
                    infoKicker="Rechner erklärt"
                    ariaOpen="Körperfett Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateBodyFat"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="result !== null"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    @invalid="(errors) => $emit('invalid', errors)">

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="Körperfett Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">ℹ️ Was bedeutet dein Körperfett?</span>
                </div>

                <div class="calc-hero-sub">
                    Der KFA schätzt, <strong>wie viel % deines Körpers Fett ist</strong> – berechnet aus <strong>Umfängen</strong> (Bauch/Hals, bei Frauen + Hüfte) und <strong>Größe</strong> (US-Navy).
                </div>

                <div class="calc-hero-pills" aria-label="Schnellnavigation">
                    <button class="calc-chip" type="button" @click="jumpTo('bf_tracking')">📈 Tracking</button>
                    <button class="calc-chip" type="button" @click="jumpTo('bf_formula')">⚙️ So wird er berechnet</button>
                    <button class="calc-chip" type="button" @click="jumpTo('bf_bands')">📊 So wird’s eingeordnet</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('bf_limits')">⚠️ Grenzen / Fehlerquellen</button>
                </div>
            </div>
        </template>

        <!-- Popup Content -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
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

                    <!-- Copy: handled by BaseCalculator (Result-Copy). Chip bleibt "nur UI" wie beim BMI -->
                    <button class="calc-chip"
                            type="button"
                            :disabled="result === null"
                            :aria-disabled="result === null"
                            :class="{ 'is-disabled': result === null }"
                            :title="result !== null ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                            @click="() => { onCopy?.(); jumpTo('bf_you') }">
                        📋 Copy
                    </button>
                </div>

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
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">✅ Reality-Check</div>
                <div class="calc-mini-text">
                    KFA ist top zum Tracken. Für echte Einschätzung: <strong>Taille</strong>, <strong>Fotos</strong>, <strong>Leistung</strong>.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ UiCalculatorInput, maybeAutoCalc }">
            <UiCalculatorInput :modelValue="gender"
                               as="select"
                               label="Geschlecht"
                               :options="[
                         { label: 'Männlich', value: 'male' },
                         { label: 'Weiblich', value: 'female' }
                       ]"
                               @change="(v) => { emit('update:bodyFatGender', v as any); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="waist ?? ''"
                               type="number"
                               label="Bauchumfang (cm)"
                               placeholder="z.B. 85"
                               inputmode="decimal"
                               @update:modelValue="(v) => { emit('update:bodyFatWaist', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="neck ?? ''"
                               type="number"
                               label="Halsumfang (cm)"
                               placeholder="z.B. 38"
                               inputmode="decimal"
                               @update:modelValue="(v) => { emit('update:bodyFatNeck', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput v-if="gender === 'female'"
                               :modelValue="hip ?? ''"
                               type="number"
                               label="Hüftumfang (cm)"
                               placeholder="z.B. 95"
                               inputmode="decimal"
                               @update:modelValue="(v) => { emit('update:bodyFatHip', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               type="number"
                               label="Körpergröße (cm)"
                               placeholder="z.B. 170"
                               inputmode="numeric"
                               @update:modelValue="(v) => { emit('update:bodyFatHeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />
        </template>

        <!-- Result -->
        <template #result>
            <p v-if="result !== null"><strong>Körperfett:</strong> {{ result!.toFixed(1) }}%</p>
        </template>

        <template #result-sub>
            <p v-if="result !== null" class="hint">Formel: US Navy Methode</p>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed, onMounted, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'
    import { LS_PROGRESS_BODY_FAT_INPUTS_V1 } from '@/constants/storageKeys'

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
        (e: 'invalid', errors: string[]): void
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

    const validateBodyFat = (): string[] => {
        const errors: string[] = []

        const w = Number(waist.value)
        const n = Number(neck.value)
        const h = Number(height.value)
        const hp = Number(hip.value)

        if (!gender.value) errors.push('Geschlecht muss ausgewählt sein')

        if (!Number.isFinite(w) || w <= 0) errors.push('Bauchumfang muss größer als 0 sein')
        if (!Number.isFinite(n) || n <= 0) errors.push('Halsumfang muss größer als 0 sein')
        if (!Number.isFinite(h) || h <= 0) errors.push('Körpergröße muss größer als 0 sein')

        if (gender.value === 'female') {
            if (!Number.isFinite(hp) || hp <= 0) errors.push('Hüftumfang muss größer als 0 sein')
            // log10(waist + hip - neck) braucht > 0
            if (Number.isFinite(w) && Number.isFinite(hp) && Number.isFinite(n) && (w + hp - n) <= 0) {
                errors.push('Ungültige Maße: Bauch + Hüfte muss größer als Hals sein')
            }
        } else {
            // log10(waist - neck) braucht > 0
            if (Number.isFinite(w) && Number.isFinite(n) && (w - n) <= 0) {
                errors.push('Ungültige Maße: Bauchumfang muss größer als Halsumfang sein')
            }
        }

        return errors
    }

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

    const copyText = computed<string | null>(() => {
        if (result.value == null) return null

        const parts: string[] = []
        parts.push(`Geschlecht: ${gender.value === 'male' ? 'Männlich' : 'Weiblich'}`)
        if (height.value) parts.push(`Größe: ${height.value} cm`)
        if (waist.value != null) parts.push(`Bauch: ${waist.value} cm`)
        if (neck.value != null) parts.push(`Hals: ${neck.value} cm`)
        if (gender.value === 'female' && hip.value != null) parts.push(`Hüfte: ${hip.value} cm`)

        parts.push(`Körperfett: ${result.value.toFixed(1)}% (${kfaLabel.value})`)
        parts.push(`Methode: US Navy`)

        return parts.join(' | ')
    })

    const LS_KEY = LS_PROGRESS_BODY_FAT_INPUTS_V1

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
</script>

<style scoped>
</style>