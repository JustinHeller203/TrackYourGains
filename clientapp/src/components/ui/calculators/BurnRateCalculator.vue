<!--BurnrateCalculator-->
<template>

    <BaseCalculator :title="title || 'BurnRate Calculator'"
                    :showInfo="true"
                    infoTitle="BurnRate Calculator"
                    infoKicker="Rechner erklärt"
                    ariaOpen="BurnRate Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="resolvedInfoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateBurnRate"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="hasResult"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="onManualCalculate"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="() => { resetDefaults(); $emit('reset') }"
                    @invalid="(errors) => $emit('invalid', errors)">

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="BurnRate Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">
                        ℹ️ Was bedeutet dein BurnRate?
                    </span>
                </div>

                <div class="calc-hero-sub">
                    Rechnet Fettmasse in Kalorien um (und zurück) – Richtwerte.
                </div>

                <div class="calc-hero-pills" aria-label="Schnellnavigation">
                    <button class="calc-chip" type="button" @click="jumpTo('br_formula')">⚙️ Formeln</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('br_limits')">⚠️ Grenzen</button>
                </div>
            </div>
        </template>

        <!-- Popup -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <!-- Dein Ergebnis -->
                <div v-if="hasResult"
                     id="br_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'br_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">✅ Dein Ergebnis</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>Ergebnis:</strong>
                            <template v-if="mode === 'fat_to_kcal'">
                                {{ formatNumber(resultKcal) }} kcal
                            </template>
                            <template v-else>
                                {{ formatNumber(resultFatValue) }} {{ fatUnit }}
                            </template>
                        </div>

                        <div class="calc-note calc-note--tight">
                            Richtwert. Das ist ein Energie-Äquivalent – kein „dein Körper verliert exakt so viel Fett“.
                        </div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('br_next')">👉 Was heißt das?</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('br_limits')">⚠️ Grenzen</button>
                            <button class="calc-chip"
                                    type="button"
                                    :disabled="!hasResult"
                                    :aria-disabled="!hasResult"
                                    :class="{ 'is-disabled': !hasResult }"
                                    title="Kopieren"
                                    @click="() => { onCopy?.(); jumpTo('br_you') }">
                                📋 Copy
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Chips -->
                <div class="calc-chips" aria-label="Kurzüberblick">
                    <button class="calc-chip" type="button" @click="jumpTo('br_tldr')">📌 Kurzfassung</button>
                    <button class="calc-chip" type="button" @click="jumpTo('br_formula')">⚙️ Formeln</button>
                    <button class="calc-chip" type="button" @click="jumpTo('br_example')">📐 Beispiel</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('br_limits')">⚠️ Grenzen</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="!hasResult"
                            :aria-disabled="!hasResult"
                            :class="{ 'is-disabled': !hasResult }"
                            :title="hasResult ? 'Kopieren' : 'Erst Werte eingeben' "
                            @click="() => { onCopy?.(); jumpTo('br_you') }">
                        📋 Copy
                    </button>
                </div>

                <!-- Kurzfassung -->
                <div id="br_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'br_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">📌 Kurzfassung</div>
                    <div class="calc-callout-text">
                        <div>
                            BurnRate ist hier ganz simpel: <strong>„Wie viel Energie entspricht X Fett?“</strong>
                        </div>

                        <ul class="calc-list calc-list--spaced">
                            <li><strong>Fett → kcal:</strong> „Wie viele kcal stecken ungefähr in dieser Fettmenge?“</li>
                            <li><strong>kcal → Fett:</strong> „Welche Fettmenge entspricht energetisch diesem Defizit?“</li>
                            <li><strong>Merke:</strong> Körpergewicht fällt nicht 1:1 = Fett (Wasser/Glykogen/Adaptation).</li>
                        </ul>
                    </div>
                </div>

                <!-- Was heißt das? -->
                <div class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'br_next' }"
                     tabindex="-1"
                     id="br_next">
                    <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                    <ul class="calc-list">
                        <li><strong>Fett → kcal:</strong> gut, um Größenordnungen zu checken („macht das Sinn?“).</li>
                        <li><strong>kcal → Fett:</strong> zeigt dir, was dein <strong>Defizit</strong> theoretisch „wert“ ist.</li>
                        <li><strong>Planung:</strong> Nutze es als Richtwert, nicht als Versprechen.</li>
                    </ul>
                </div>

                <!-- Für wen / Was misst das -->
                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">👥 Für wen ist der Rechner sinnvoll?</h4>
                        <ul class="calc-list">
                            <li>✅ Wenn du Diät/Defizit planst und <strong>Realitäts-Check</strong> willst</li>
                            <li>✅ Wenn du Fettmengen/Angaben in <strong>kcal</strong> verstehen willst</li>
                            <li>⚠️ Wenn du dich daran emotional aufhängst → lieber ignorieren</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">🧠 Was misst der BurnRate?</h4>
                        <ul class="calc-list">
                            <li><strong>Misst:</strong> Energie-Äquivalent (Fett ↔ kcal)</li>
                            <li><strong>Misst nicht:</strong> „Wie viel Fett du wirklich verlierst“</li>
                            <li><strong>Warum:</strong> Der Körper ist messy (Wasser, Glykogen, NEAT, Hormone).</li>
                        </ul>
                    </section>

                    <!-- Formeln (beide Modi) -->
                    <section id="br_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'br_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formeln (beide Optionen)</h4>

                        <div class="calc-note calc-note--spaced">
                            Standard: <strong>7700 kcal pro kg Fett</strong> (Näherung).
                        </div>

                        <div class="calc-formula">
                            <span class="calc-formula-k">kcal</span>
                            <span class="calc-formula-eq">≈</span>
                            <span class="calc-formula-v">Fett(kg) × kcal/kg</span>
                        </div>

                        <div class="calc-formula" style="margin-top:.5rem">
                            <span class="calc-formula-k">Fett(kg)</span>
                            <span class="calc-formula-eq">≈</span>
                            <span class="calc-formula-v">kcal ÷ (kcal/kg)</span>
                        </div>

                        <div class="calc-note">
                            Bei mg/g rechnest du intern nur um: <strong>1 kg = 1000 g = 1.000.000 mg</strong>.
                        </div>
                    </section>
                    <section id="br_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'br_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">📐 Beispiel</h4>

                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span><strong>Modus:</strong> Fett → kcal</span>
                                <span class="calc-example-strong">250 g Fett</span>
                            </div>
                            <div class="calc-example-sub">
                                250 g = 0,25 kg → 0,25 × 7700 ≈ <strong>1925 kcal</strong>
                            </div>

                            <div class="calc-example-row" style="margin-top:.65rem">
                                <span><strong>Modus:</strong> kcal → Fett</span>
                                <span class="calc-example-strong">500 kcal</span>
                            </div>
                            <div class="calc-example-sub">
                                500 ÷ 7700 ≈ 0,0649 kg ≈ <strong>64,9 g Fett</strong>
                            </div>
                        </div>

                        <div class="calc-note calc-note--spaced">
                            Das ist ein <strong>Rechenbeispiel</strong>. Auf der Waage siehst du oft was anderes (Wasser/Glykogen).
                        </div>
                    </section>

                </div>

                <!-- Ignorieren -->
                <div class="calc-callout">
                    <div class="calc-callout-title">🧠 Wann du den BurnRate locker ignorieren darfst</div>
                    <ul class="calc-list">
                        <li>Du trackst eh schon sinnvoll: <strong>Kalorien + Protein + Schritte + Krafttraining</strong></li>
                        <li>Dein Fokus ist Performance/Optik → <strong>Waage ist nur ein Signal</strong></li>
                        <li>Du merkst, dass dich Zahlen stressen → dann weg damit.</li>
                    </ul>
                </div>

                <!-- Grenzen -->
                <section id="br_limits"
                         class="calc-callout calc-callout--warn"
                         :class="{ 'calc-target': activeTargetId === 'br_limits' }"
                         tabindex="-1">
                    <div class="calc-callout-title">⚠️ Grenzen (damit du’s richtig nutzt)</div>
                    <ul class="calc-list">
                        <li><strong>Wasser/Glykogen:</strong> kann Schwankungen von 1–3 kg machen – ohne Fettverlust.</li>
                        <li><strong>Adaptation:</strong> NEAT sinkt, Hunger steigt → Theorie ≠ Praxis.</li>
                        <li><strong>Messfehler:</strong> Food-Tracking + Portionsgrößen sind nie perfekt.</li>
                    </ul>
                </section>

                <!-- FAQ -->
                <section class="calc-card">
                    <h4 class="calc-h">❓ Häufige Fragen</h4>
                    <ul class="calc-list">
                        <li><strong>„7700 ist fix?“</strong> → Nein. Es ist ein Richtwert, individuell kann’s abweichen.</li>
                        <li><strong>„Wenn ich 7700 kcal Defizit habe, verliere ich 1 kg Fett?“</strong> → Theoretisch möglich, praktisch oft langsamer.</li>
                        <li><strong>„Warum zeigt die Waage was anderes?“</strong> → Wasser, Salz, Schlaf, Stress, Darm-Inhalt.</li>
                    </ul>
                </section>

            </div>
        </template>

        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">✅ Reality-Check</div>
                <div class="calc-mini-text">
                    BurnRate ist nur ein <strong>Richtwert</strong> (Energie-Äquivalent). Auf der Waage siehst du oft
                    <strong>Wasser/Glykogen</strong> statt Fett. Wenn du abnehmen willst: tracke lieber
                    <strong>Kalorien</strong>, <strong>Protein</strong>, <strong>Schritte</strong> + <strong>Krafttraining</strong>.
                </div>
            </div>
        </template>
        <!-- Inputs -->
        <template #inputs="{ maybeAutoCalc, normalizeNumberInput }">
            <!-- Modus Buttons (bleibt) -->
            <div class="mode">
                <button class="mode-btn"
                        type="button"
                        :class="{ active: mode === 'fat_to_kcal' }"
                        @click="() => { mode = 'fat_to_kcal'; if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }">
                    Fett → kcal
                </button>

                <button class="mode-btn"
                        type="button"
                        :class="{ active: mode === 'kcal_to_fat' }"
                        @click="() => { mode = 'kcal_to_fat'; if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }">
                    kcal → Fett
                </button>
            </div>

            <!-- Betrag -->
            <div class="br-row">
                <UiCalculatorInput :modelValue="amountRaw"
                                   type="text"
                                   inputmode="decimal"
                                   autocomplete="off"
                                   :label="mode === 'fat_to_kcal' ? 'Fettmenge' : 'Kalorien'"
                                   :placeholder="mode === 'fat_to_kcal' ? 'z.B. 250' : 'z.B. 500'"
                                   :hint="modeHint"
                                   @update:modelValue="(v) => { amountRaw = normalizeNumberInput(String(v)); if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }" />

                <UiCalculatorInput :modelValue="fatUnit"
                                   as="select"
                                   :label="mode === 'fat_to_kcal' ? 'Einheit' : 'Ausgabe-Einheit'"
                                   :options="[
             { label: 'mg', value: 'mg' },
             { label: 'g', value: 'g' },
             { label: 'kg', value: 'kg' }
           ]"
                                   @change="(v) => { fatUnit = v as any; if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }" />
            </div>
        </template>


        <!-- Result -->
        <template #result>
            <div v-if="hasResult">
                <p>
                    <strong>Ergebnis:</strong>&nbsp;
                    <template v-if="mode === 'fat_to_kcal'">
                        {{ formatNumber(resultKcal) }} kcal
                    </template>
                    <template v-else>
                        {{ formatNumber(resultFatValue) }} {{ fatUnit }}
                    </template>
                </p>
            </div>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type Mode = 'fat_to_kcal' | 'kcal_to_fat'
    type FatUnit = 'mg' | 'g' | 'kg'

    const props = withDefaults(defineProps<{
        title?: string
        info?: string
        infoText?: string
        subtitle?: string

        autoCalcEnabled?: boolean
        isFavorite?: boolean
    }>(), {
        autoCalcEnabled: false,
        isFavorite: false
    })

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const mode = ref<Mode>('fat_to_kcal')
    const fatUnit = ref<FatUnit>('g')

    const amountRaw = ref<string>('')

    const kcalPerKg = computed(() => 7700)

    const didCalculate = ref(false)

    const hasResult = computed(() => {
        const baseValid = amountRaw.value.trim() !== '' && amount.value > 0
        if (!baseValid) return false
        return props.autoCalcEnabled ? true : didCalculate.value
    })

    function resetDefaults() {
        amountRaw.value = ''
        mode.value = 'fat_to_kcal'
        fatUnit.value = 'g'
        didCalculate.value = false
    }

    function onManualCalculate() {
        if (props.autoCalcEnabled) return
        didCalculate.value = true
    }

    function validateBurnRate(): string[] {
        const errors: string[] = []

        if (!amountRaw.value.trim()) {
            errors.push(mode.value === 'fat_to_kcal'
                ? 'Bitte gib eine Fettmenge ein.'
                : 'Bitte gib Kalorien ein.'
            )
            return errors
        }

        if (!Number.isFinite(amount.value)) {
            errors.push('Bitte gib eine gültige Zahl ein.')
            return errors
        }

        if (amount.value <= 0) {
            errors.push('Wert muss größer als 0 sein.')
            return errors
        }

        return errors
    }


    const resolvedInfoText = computed(() =>
        props.infoText ?? props.info ??
        'Rechnet Fettmasse ↔ Kalorien als Energie-Äquivalent. Standard: 7700 kcal pro kg Fett. Richtwert, nicht 1:1 Körperfettverlust.'
    )

    const amount = computed(() => {
        const n = Number(String(amountRaw.value).replace(',', '.'))
        return Number.isFinite(n) && n >= 0 ? n : 0
    })

    const mgToKcalFactor = computed(() => kcalPerKg.value / 1_000_000) // 1 kg = 1.000.000 mg

    const fatToMg = (value: number, unit: FatUnit) => {
        if (unit === 'mg') return value
        if (unit === 'g') return value * 1000
        return value * 1_000_000
    }

    const mgToUnit = (mg: number, unit: FatUnit) => {
        if (unit === 'mg') return mg
        if (unit === 'g') return mg / 1000
        return mg / 1_000_000
    }

    const resultKcal = computed(() => {
        const mg = fatToMg(amount.value, fatUnit.value)
        return mg * mgToKcalFactor.value
    })

    const resultFatValue = computed(() => {
        const kcal = amount.value
        const mg = mgToKcalFactor.value > 0 ? kcal / mgToKcalFactor.value : 0
        return mgToUnit(mg, fatUnit.value)
    })

    const modeHint = computed(() => {
        if (mode.value !== 'fat_to_kcal') return ''
        if (fatUnit.value === 'mg') return `Richtwert: 1 mg ≈ ${formatNumber(mgToKcalFactor.value)} kcal`
        if (fatUnit.value === 'g') return `Richtwert: 1 g ≈ ${formatNumber(kcalPerKg.value / 1000)} kcal`
        return `Richtwert: 1 kg ≈ ${formatNumber(kcalPerKg.value)} kcal`
    })
    const copyText = computed<string | null>(() => {
        if (!hasResult.value) return null

        const parts: string[] = []
        parts.push(`Modus: ${mode.value === 'fat_to_kcal' ? 'Fett→kcal' : 'kcal→Fett'}`)

        if (mode.value === 'fat_to_kcal') {
            parts.push(`Fett: ${amount.value} ${fatUnit.value}`)
            parts.push(`kcal/kg: ${kcalPerKg.value}`)
            parts.push(`Ergebnis: ${resultKcal.value.toFixed(2)} kcal`)
        } else {
            parts.push(`kcal: ${amount.value}`)
            parts.push(`kcal/kg: ${kcalPerKg.value}`)
            parts.push(`Ergebnis: ${resultFatValue.value.toFixed(4)} ${fatUnit.value}`)
        }

        return parts.join(' | ')
    })

    function formatNumber(n: number) {
        if (!Number.isFinite(n)) return '0'
        const abs = Math.abs(n)
        const decimals =
            abs >= 1000 ? 0 :
                abs >= 100 ? 1 :
                    abs >= 10 ? 2 : 4

        return n.toLocaleString('de-DE', {
            maximumFractionDigits: decimals,
            minimumFractionDigits: 0,
        })
    }
</script>

<style scoped>
    .br-row {
        display: flex;
        gap: .75rem;
        flex-wrap: nowrap;
        align-items: flex-start;
    }

    /* wichtig: Flex-Items dürfen schrumpfen, sonst bricht die Row */
    :global(.br-row > *) {
        min-width: 0;
    }

    /* Input darf groß werden */
    :global(.br-row .ui-input) {
        flex: 1 1 auto;
        min-width: 0;
    }

    /* Select bleibt “zielbreit”, darf aber schrumpfen wenn Label lang ist */
    :global(.br-row .ui-select) {
        flex: 0 1 160px;
        min-width: 120px;
    }

    /* <= 475px: untereinander, beide 100% */
    @media (max-width: 475px) {
        .br-row {
            flex-direction: column;
            flex-wrap: nowrap;
            gap: .65rem;
        }

        :global(.br-row .ui-input),
        :global(.br-row .ui-select) {
            flex: 1 1 auto;
            width: 100%;
            min-width: 0;
        }
    }

</style>
