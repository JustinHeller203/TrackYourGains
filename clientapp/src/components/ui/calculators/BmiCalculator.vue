<!-- src/components/ui/calculators/BmiCalculator.vue -->
<template>
    <BaseCalculator :title="title || 'BMI-Rechner'"
                    :showInfo="!!info"
                    infoTitle="BMI (Body-Mass-Index)"
                    infoKicker="Rechner erklärt"
                    ariaOpen="BMI Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="info"
                    :autoCalcEnabled="autoCalcEnabled"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="!!bmiResult"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    :validate="validate"
                    @invalid="onInvalid">
        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="BMI Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">ℹ️ Was bedeutet dein BMI?</span>
                </div>

                <div class="calc-hero-sub">
                    Der BMI setzt dein <strong>Gewicht</strong> ins Verhältnis zu deiner <strong>Größe</strong> – für eine grobe Einordnung. Muskeln und Fett unterscheidet er nicht.
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

        <!-- Popup Content -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="bmiResult"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
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
                            :aria-disabled="!bmiResult"
                            :class="{ 'is-disabled': !bmiResult }"
                            :title="bmiResult ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                            @click="() => { onCopy?.(); jumpTo('calc_you') }">
                        📋 Copy
                    </button>
                </div>

                <div id="calc_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_tldr' }"
                     tabindex="-1">
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

                <div class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_next' }"
                     tabindex="-1"
                     id="calc_next">
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

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formel</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">BMI</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">gewicht * (kg) ÷ Größe² (m)</span>
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

                    <section id="calc_bands"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_bands' }"
                             tabindex="-1">
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

                <div id="calc_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'calc_limits' }"
                     tabindex="-1">
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
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">✅ Reality-Check</div>
                <div class="calc-mini-text">
                    BMI = <strong>Startpunkt</strong>. Für echte Einschätzung: <strong>Körperfett</strong>, <strong>Umfänge</strong> oder <strong>Progress-Fotos</strong>.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ UiCalculatorInput, maybeAutoCalc, errorFor }">
            <UiCalculatorInput :modelValue="gender"
                               as="select"
                               label="Geschlecht *"
                               :options="[
                         { label: 'Männlich', value: 'male' },
                         { label: 'Weiblich', value: 'female' }
                       ]"
                               @change="(v) => { emit('update:bmiGender', v as any); maybeAutoCalc?.() }" />

            <UiCalculatorInput :modelValue="weight ?? ''"
                               :label="`Körpergewicht (${unit === 'kg' ? 'kg' : 'lbs'}) *`"
                               :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                               inputmode="decimal"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { emit('update:bmiWeight', v === '' ? null : Number(v)); maybeAutoCalc?.() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               label="Körpergröße (cm) *"
                               placeholder="z.B. 175"
                               inputmode="numeric"
                               :error="errorFor('gr')"
                               @update:modelValue="(v) => { emit('update:bmiHeight', v === '' ? null : Number(v)); maybeAutoCalc?.() }" />
        </template>



        <!-- Result -->
        <template #result>
            <p v-if="bmiResult"><strong>BMI:</strong> {{ bmiResult.value.toFixed(1) }}</p>
        </template>

        <template #result-sub>
            <p v-if="bmiResult">Kategorie: {{ bmiResult.category }}</p>
        </template>
    </BaseCalculator>
</template>


<script setup lang="ts">
    import { computed, onMounted, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { LS_PROGRESS_BMI } from '@/constants/storageKeys'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type Gender = 'male' | 'female'
    type Unit = 'kg' | 'lb' | 'lbs' | string

    interface BmiResult { value: number; category: string }

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
        (e: 'invalid', errors: string[]): void
    }>()

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

    function validate(): string[] {
        const errors: string[] = []

        const w = props.bmiWeight
        const h = props.bmiHeight

        if (w == null || Number.isNaN(w)) errors.push('Bitte gib dein Körpergewicht ein.')
        else if (w <= 0) errors.push('Körpergewicht muss größer als 0 sein.')
        else if (props.unit === 'kg' && w > 400) errors.push('Körpergewicht wirkt unrealistisch hoch (kg).')
        else if ((props.unit === 'lb' || props.unit === 'lbs') && w > 900) errors.push('Körpergewicht wirkt unrealistisch hoch (lbs).')

        if (h == null || Number.isNaN(h)) errors.push('Bitte gib deine Körpergröße ein.')
        else if (h <= 0) errors.push('Körpergröße muss größer als 0 sein.')
        else if (h < 80 || h > 250) errors.push('Körpergröße wirkt unrealistisch (cm).')

        return errors
    }

    function onInvalid(errors: string[]) {
        emit('invalid', errors)
    }

    const copyText = computed<string | null>(() => {
        if (!props.bmiResult) return null

        const parts: string[] = []

        if (props.bmiHeight) parts.push(`Größe: ${props.bmiHeight} cm`)
        if (props.bmiWeight != null) parts.push(`Gewicht: ${props.bmiWeight} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)

        parts.push(`BMI: ${props.bmiResult.value.toFixed(1)} (${props.bmiResult.category})`)

        if (normalWeightRange.value) {
            parts.push(`Normalbereich (18,5–24,9): ${normalWeightRange.value.kgMin}–${normalWeightRange.value.kgMax} kg`)
        }

        return parts.join(' | ')
    })

    const gender = computed(() => props.bmiGender)
    const weight = computed(() => props.bmiWeight)
    const height = computed(() => props.bmiHeight)

    const LS_KEY = LS_PROGRESS_BMI

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)

            // Nur setzen, wenn noch leer ist (nicht überschreiben)
            // bmiGender ist bei dir Pflicht → nur Weight/Height sinnvoll "leer" prüfbar
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
</script>

<style scoped>
</style>
