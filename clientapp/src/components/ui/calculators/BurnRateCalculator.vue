<template>
    <BaseCalculator :title="title || t('progress.calculators.burnRate.title')"
                    :showInfo="true"
                    :infoTitle="t('progress.calculators.burnRate.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
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

        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" :aria-label="ui.heroAria">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">{{ ui.heroTitle }}</span>
                </div>

                <div class="calc-hero-sub">{{ ui.heroSub }}</div>

                <div class="calc-hero-pills" :aria-label="ui.quickNav">
                    <button class="calc-chip" type="button" @click="jumpTo('br_formula')">{{ ui.formulas }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('br_limits')">{{ ui.limits }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="hasResult"
                     id="br_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'br_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.yourResult }}</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>{{ ui.resultLabel }}</strong>
                            <template v-if="mode === 'fat_to_kcal'">
                                {{ formatNumber(resultKcal) }} kcal
                            </template>
                            <template v-else>
                                {{ formatNumber(resultFatValue) }} {{ fatUnit }}
                            </template>
                        </div>

                        <div class="calc-note calc-note--tight">{{ ui.resultNote }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('br_next')">{{ ui.meaning }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('br_limits')">{{ ui.limits }}</button>
                            <button class="calc-chip"
                                    type="button"
                                    :disabled="!hasResult"
                                    :aria-disabled="!hasResult"
                                    :class="{ 'is-disabled': !hasResult }"
                                    :title="t('common.copy')"
                                    @click="() => { onCopy?.(); jumpTo('br_you') }">
                                {{ t('common.copy') }}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.quickOverview">
                    <button class="calc-chip" type="button" @click="jumpTo('br_tldr')">{{ ui.summary }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('br_formula')">{{ ui.formulas }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('br_example')">{{ ui.example }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('br_limits')">{{ ui.limits }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="!hasResult"
                            :aria-disabled="!hasResult"
                            :class="{ 'is-disabled': !hasResult }"
                            :title="hasResult ? t('common.copy') : t('progress.calculators.copyHintValues')"
                            @click="() => { onCopy?.(); jumpTo('br_you') }">
                        {{ t('common.copy') }}
                    </button>
                </div>

                <div id="br_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'br_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.summary }}</div>
                    <div class="calc-callout-text">
                        <div>{{ ui.summaryIntro }}</div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.fatToKcal }}</strong> {{ ui.summaryFatToKcal }}</li>
                            <li><strong>{{ ui.kcalToFat }}</strong> {{ ui.summaryKcalToFat }}</li>
                            <li><strong>{{ ui.takeawayLabel }}</strong> {{ ui.summaryTakeaway }}</li>
                        </ul>
                    </div>
                </div>

                <div id="br_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'br_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.meaningNow }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.fatToKcal }}</strong> {{ ui.meaningFatToKcal }}</li>
                        <li><strong>{{ ui.kcalToFat }}</strong> {{ ui.meaningKcalToFat }}</li>
                        <li><strong>{{ ui.planningLabel }}</strong> {{ ui.meaningPlanning }}</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.forWhoTitle }}</h4>
                        <ul class="calc-list">
                            <li>{{ ui.forWho1 }}</li>
                            <li>{{ ui.forWho2 }}</li>
                            <li>{{ ui.forWho3 }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.whatMeasuresTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.measuresLabel }}</strong> {{ ui.measuresText }}</li>
                            <li><strong>{{ ui.notMeasureLabel }}</strong> {{ ui.notMeasuresText }}</li>
                            <li><strong>{{ ui.whyLabel }}</strong> {{ ui.whyText }}</li>
                        </ul>
                    </section>

                    <section id="br_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'br_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulasBoth }}</h4>
                        <div class="calc-note calc-note--spaced">{{ ui.formulaNote }}</div>
                        <div class="calc-formula">
                            <span class="calc-formula-k">kcal</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaForward }}</span>
                        </div>
                        <div class="calc-formula" style="margin-top:.5rem">
                            <span class="calc-formula-k">{{ ui.fatKgShort }}</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaBackward }}</span>
                        </div>
                        <div class="calc-note">{{ ui.formulaUnits }}</div>
                    </section>

                    <section id="br_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'br_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.example }}</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span><strong>{{ ui.modeLabel }}</strong> {{ ui.fatToKcal }}</span>
                                <span class="calc-example-strong">{{ ui.exampleFat }}</span>
                            </div>
                            <div class="calc-example-sub">{{ ui.exampleFatCalc }}</div>

                            <div class="calc-example-row" style="margin-top:.65rem">
                                <span><strong>{{ ui.modeLabel }}</strong> {{ ui.kcalToFat }}</span>
                                <span class="calc-example-strong">{{ ui.exampleKcal }}</span>
                            </div>
                            <div class="calc-example-sub">{{ ui.exampleKcalCalc }}</div>
                        </div>

                        <div class="calc-note calc-note--spaced">{{ ui.exampleNote }}</div>
                    </section>
                </div>

                <div class="calc-callout">
                    <div class="calc-callout-title">{{ ui.ignoreTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.ignore1 }}</li>
                        <li>{{ ui.ignore2 }}</li>
                        <li>{{ ui.ignore3 }}</li>
                    </ul>
                </div>

                <section id="br_limits"
                         class="calc-callout calc-callout--warn"
                         :class="{ 'calc-target': activeTargetId === 'br_limits' }"
                         tabindex="-1">
                    <div class="calc-callout-title">{{ ui.limitsTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.waterLabel }}</strong> {{ ui.waterText }}</li>
                        <li><strong>{{ ui.adaptationLabel }}</strong> {{ ui.adaptationText }}</li>
                        <li><strong>{{ ui.errorLabel }}</strong> {{ ui.errorText }}</li>
                    </ul>
                </section>

                <section class="calc-card">
                    <h4 class="calc-h">{{ ui.faqTitle }}</h4>
                    <ul class="calc-list">
                        <li><strong>{{ ui.faq1q }}</strong> {{ ui.faq1a }}</li>
                        <li><strong>{{ ui.faq2q }}</strong> {{ ui.faq2a }}</li>
                        <li><strong>{{ ui.faq3q }}</strong> {{ ui.faq3a }}</li>
                    </ul>
                </section>
            </div>
        </template>

        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">{{ ui.realityCheck }}</div>
                <div class="calc-mini-text">{{ ui.realityText }}</div>
            </div>
        </template>

        <template #inputs="{ maybeAutoCalc, normalizeNumberInput, errorFor }">
            <div class="mode">
                <button class="mode-btn"
                        type="button"
                        :class="{ active: mode === 'fat_to_kcal' }"
                        @click="() => { mode = 'fat_to_kcal'; if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }">
                    {{ ui.fatToKcal }}
                </button>

                <button class="mode-btn"
                        type="button"
                        :class="{ active: mode === 'kcal_to_fat' }"
                        @click="() => { mode = 'kcal_to_fat'; if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }">
                    {{ ui.kcalToFat }}
                </button>
            </div>

            <div class="br-row">
                <UiCalculatorInput :modelValue="amountRaw"
                                   type="text"
                                   inputmode="decimal"
                                   autocomplete="off"
                                   :label="mode === 'fat_to_kcal' ? ui.fatAmountLabel : ui.caloriesLabel"
                                   :placeholder="mode === 'fat_to_kcal' ? ui.placeholderFat : ui.placeholderKcal"
                                   :hint="modeHint"
                                   :error="errorFor(ui.errorNeedle)"
                                   @update:modelValue="(v) => { amountRaw = normalizeNumberInput(String(v)); if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }" />

                <UiCalculatorInput :modelValue="fatUnit"
                                   as="select"
                                   :label="mode === 'fat_to_kcal' ? ui.unitLabel : ui.outputUnitLabel"
                                   :options="unitOptions"
                                   @change="(v) => { fatUnit = v as FatUnit; if (!autoCalcEnabled) didCalculate = false; maybeAutoCalc() }" />
            </div>
        </template>

        <template #result>
            <div v-if="hasResult">
                <p>
                    <strong>{{ ui.resultLabel }}</strong>
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
    import { useI18n } from '@/composables/useI18n'

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
        isFavorite: false,
    })

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const { locale, t } = useI18n()

    const mode = ref<Mode>('fat_to_kcal')
    const fatUnit = ref<FatUnit>('g')
    const amountRaw = ref('')
    const didCalculate = ref(false)

    const ui = computed(() => locale.value === 'en'
        ? {
            heroAria: 'Burn rate quick card',
            heroTitle: 'What does your burn rate mean?',
            heroSub: 'Converts fat mass into calories and back using guideline values.',
            quickNav: 'Quick navigation',
            quickOverview: 'Quick overview',
            yourResult: 'Your result',
            resultLabel: 'Result:',
            resultNote: 'Guideline only. This is an energy equivalent, not a promise that your body loses exactly that much fat.',
            meaning: 'What does that mean?',
            summary: 'Quick summary',
            meaningNow: 'What does that mean now?',
            formulas: 'Formulas',
            formulasBoth: 'Formulas (both directions)',
            limits: 'Limits',
            example: 'Example',
            summaryIntro: 'This calculator is simple: how much energy does a given amount of fat correspond to?',
            fatToKcal: 'Fat -> kcal',
            kcalToFat: 'kcal -> fat',
            summaryFatToKcal: 'How many calories are roughly stored in this amount of fat?',
            summaryKcalToFat: 'Which amount of fat matches this deficit energetically?',
            takeawayLabel: 'Takeaway:',
            summaryTakeaway: 'Scale weight does not drop 1:1 as fat because water, glycogen, and adaptation matter.',
            meaningFatToKcal: 'Useful for checking the rough size of a number.',
            meaningKcalToFat: 'Shows what your calorie deficit is theoretically worth in fat energy.',
            planningLabel: 'Planning:',
            meaningPlanning: 'Use it as a guideline, not as a promise.',
            forWhoTitle: 'Who is this calculator useful for?',
            forWho1: 'If you are planning a diet or deficit and want a reality check.',
            forWho2: 'If you want to understand fat amounts in calories.',
            forWho3: 'If numbers stress you out, ignore it.',
            whatMeasuresTitle: 'What does burn rate measure?',
            measuresLabel: 'Measures:',
            measuresText: 'Energy equivalent (fat -> kcal).',
            notMeasureLabel: 'Does not measure:',
            notMeasuresText: 'How much fat you really lose.',
            whyLabel: 'Why:',
            whyText: 'The body is messy: water, glycogen, NEAT, hormones.',
            formulaNote: 'Standard assumption: 7700 kcal per kilogram of fat.',
            fatKgShort: 'Fat (kg)',
            formulaForward: 'Fat (kg) x kcal/kg',
            formulaBackward: 'kcal / (kcal/kg)',
            formulaUnits: 'For mg and g, the calculator converts internally: 1 kg = 1000 g = 1,000,000 mg.',
            modeLabel: 'Mode:',
            exampleFat: '250 g fat',
            exampleFatCalc: '250 g = 0.25 kg -> 0.25 x 7700 = 1925 kcal',
            exampleKcal: '500 kcal',
            exampleKcalCalc: '500 / 7700 = 0.0649 kg = 64.9 g fat',
            exampleNote: 'This is a math example. The scale often shows something else because of water and glycogen.',
            ignoreTitle: 'When you can safely ignore the burn rate calculator',
            ignore1: 'If you already track calories, protein, steps, and strength training well.',
            ignore2: 'If performance and physique matter more than a single scale number.',
            ignore3: 'If these numbers stress you, drop them.',
            limitsTitle: 'Limits (so you use it correctly)',
            waterLabel: 'Water/glycogen:',
            waterText: 'Can cause swings of 1-3 kg without real fat loss.',
            adaptationLabel: 'Adaptation:',
            adaptationText: 'NEAT can drop and hunger can rise, so theory is not practice.',
            errorLabel: 'Tracking error:',
            errorText: 'Food logging and portion sizes are never perfect.',
            faqTitle: 'Frequently asked questions',
            faq1q: '"Is 7700 fixed?"',
            faq1a: 'No. It is a guideline and can vary individually.',
            faq2q: '"If I create a 7700 kcal deficit, do I lose 1 kg of fat?"',
            faq2a: 'Theoretically maybe, practically often slower.',
            faq3q: '"Why does the scale show something else?"',
            faq3a: 'Water, salt, sleep, stress, and gut content.',
            realityCheck: 'Reality check',
            realityText: 'Burn rate is only an energy-equivalent guideline. On the scale you often see water and glycogen instead of fat. For fat loss, track calories, protein, steps, and strength training.',
            fatAmountLabel: 'Fat amount *',
            caloriesLabel: 'Calories *',
            unitLabel: 'Unit',
            outputUnitLabel: 'Output unit',
            placeholderFat: 'e.g. 250',
            placeholderKcal: 'e.g. 500',
            needFat: 'Please enter a fat amount.',
            needCalories: 'Please enter calories.',
            needNumber: 'Please enter a valid number.',
            needPositive: 'Value must be greater than 0.',
            infoText: 'Converts fat mass and calories as an energy equivalent. Standard assumption: 7700 kcal per kilogram of fat.',
            modeFatToKcal: 'Fat -> kcal',
            modeKcalToFat: 'kcal -> fat',
            errorNeedle: ['valid number', 'greater than 0', 'fat', 'calories'],
        }
        : {
            heroAria: 'BurnRate Kurzkarte',
            heroTitle: 'Was bedeutet dein Burn Rate Rechner?',
            heroSub: 'Rechnet Fettmasse in Kalorien um und auch wieder zurück.',
            quickNav: 'Schnellnavigation',
            quickOverview: 'Kurzüberblick',
            yourResult: 'Dein Ergebnis',
            resultLabel: 'Ergebnis:',
            resultNote: 'Nur ein Richtwert. Das ist ein Energieäquivalent, kein Versprechen für echten Fettverlust.',
            meaning: 'Was heißt das?',
            summary: 'Kurzfassung',
            meaningNow: 'Was heißt das jetzt?',
            formulas: 'Formeln',
            formulasBoth: 'Formeln (beide Richtungen)',
            limits: 'Grenzen',
            example: 'Beispiel',
            summaryIntro: 'Der Rechner beantwortet ganz simpel: Wie viel Energie entspricht einer bestimmten Fettmenge?',
            fatToKcal: 'Fett -> kcal',
            kcalToFat: 'kcal -> Fett',
            summaryFatToKcal: 'Wie viele Kalorien stecken ungefähr in dieser Fettmenge?',
            summaryKcalToFat: 'Welche Fettmenge entspricht diesem Defizit energetisch?',
            takeawayLabel: 'Merke:',
            summaryTakeaway: 'Das Körpergewicht fällt nicht 1:1 als Fett, weil Wasser, Glykogen und Anpassungen mitspielen.',
            meaningFatToKcal: 'Gut, um Größenordnungen zu prüfen.',
            meaningKcalToFat: 'Zeigt, was dein Kaloriendefizit theoretisch wert ist.',
            planningLabel: 'Planung:',
            meaningPlanning: 'Nutze es als Richtwert, nicht als Versprechen.',
            forWhoTitle: 'Für wen ist der Rechner sinnvoll?',
            forWho1: 'Wenn du Diät oder Defizit planst und einen Realitätscheck willst.',
            forWho2: 'Wenn du Fettmengen in Kalorien besser verstehen willst.',
            forWho3: 'Wenn Zahlen dich stressen, ignorier ihn lieber.',
            whatMeasuresTitle: 'Was misst der Burn Rate Rechner?',
            measuresLabel: 'Misst:',
            measuresText: 'Das Energieäquivalent von Fett.',
            notMeasureLabel: 'Misst nicht:',
            notMeasuresText: 'Wie viel Fett du tatsächlich verlierst.',
            whyLabel: 'Warum:',
            whyText: 'Der Körper ist unruhig: Wasser, Glykogen, NEAT, Hormone.',
            formulaNote: 'Standardannahme: 7700 kcal pro Kilogramm Fett.',
            fatKgShort: 'Fett (kg)',
            formulaForward: 'Fett (kg) x kcal/kg',
            formulaBackward: 'kcal / (kcal/kg)',
            formulaUnits: 'Bei mg und g rechnet der Rechner intern um: 1 kg = 1000 g = 1.000.000 mg.',
            modeLabel: 'Modus:',
            exampleFat: '250 g Fett',
            exampleFatCalc: '250 g = 0,25 kg -> 0,25 x 7700 = 1925 kcal',
            exampleKcal: '500 kcal',
            exampleKcalCalc: '500 / 7700 = 0,0649 kg = 64,9 g Fett',
            exampleNote: 'Das ist ein Rechenbeispiel. Auf der Waage siehst du oft etwas anderes wegen Wasser und Glykogen.',
            ignoreTitle: 'Wann du den Burn Rate Rechner ignorieren kannst',
            ignore1: 'Wenn du Kalorien, Protein, Schritte und Krafttraining schon sauber trackst.',
            ignore2: 'Wenn Performance und Optik wichtiger sind als eine einzelne Waagenzahl.',
            ignore3: 'Wenn dich diese Zahlen eher stressen, lass sie weg.',
            limitsTitle: 'Grenzen (damit du ihn richtig nutzt)',
            waterLabel: 'Wasser/Glykogen:',
            waterText: 'Können Schwankungen von 1-3 kg machen, ganz ohne echten Fettverlust.',
            adaptationLabel: 'Anpassung:',
            adaptationText: 'NEAT kann sinken und Hunger steigen, darum ist Theorie nicht gleich Praxis.',
            errorLabel: 'Messfehler:',
            errorText: 'Food-Tracking und Portionsgrößen sind nie perfekt.',
            faqTitle: 'Häufige Fragen',
            faq1q: '"Sind 7700 fest?"',
            faq1a: 'Nein. Das ist ein Richtwert und kann individuell abweichen.',
            faq2q: '"Wenn ich 7700 kcal Defizit habe, verliere ich 1 kg Fett?"',
            faq2a: 'Theoretisch vielleicht, praktisch oft langsamer.',
            faq3q: '"Warum zeigt die Waage etwas anderes?"',
            faq3a: 'Wasser, Salz, Schlaf, Stress und Magen-Darm-Inhalt.',
            realityCheck: 'Reality-Check',
            realityText: 'Burn Rate ist nur ein Energie-Richtwert. Auf der Waage siehst du oft Wasser und Glykogen statt Fett. Wenn du abnehmen willst, tracke lieber Kalorien, Protein, Schritte und Krafttraining.',
            fatAmountLabel: 'Fettmenge *',
            caloriesLabel: 'Kalorien *',
            unitLabel: 'Einheit',
            outputUnitLabel: 'Ausgabe-Einheit',
            placeholderFat: 'z.B. 250',
            placeholderKcal: 'z.B. 500',
            needFat: 'Bitte gib eine Fettmenge ein.',
            needCalories: 'Bitte gib Kalorien ein.',
            needNumber: 'Bitte gib eine gültige Zahl ein.',
            needPositive: 'Wert muss größer als 0 sein.',
            infoText: 'Rechnet Fettmasse und Kalorien als Energieäquivalent. Standardannahme: 7700 kcal pro Kilogramm Fett.',
            modeFatToKcal: 'Fett -> kcal',
            modeKcalToFat: 'kcal -> Fett',
            errorNeedle: ['gültige Zahl', 'größer als 0', 'fett', 'kalorien'],
        })

    const unitOptions = computed(() => [
        { label: 'mg', value: 'mg' },
        { label: 'g', value: 'g' },
        { label: 'kg', value: 'kg' },
    ])

    const kcalPerKg = computed(() => 7700)

    const amount = computed(() => {
        const n = Number(String(amountRaw.value).replace(',', '.'))
        return Number.isFinite(n) && n >= 0 ? n : 0
    })

    const hasResult = computed(() => {
        const valid = amountRaw.value.trim() !== '' && amount.value > 0
        if (!valid) return false
        return props.autoCalcEnabled ? true : didCalculate.value
    })

    const resolvedInfoText = computed(() => props.infoText ?? props.info ?? ui.value.infoText)

    const mgToKcalFactor = computed(() => kcalPerKg.value / 1_000_000)

    function fatToMg(value: number, unit: FatUnit) {
        if (unit === 'mg') return value
        if (unit === 'g') return value * 1000
        return value * 1_000_000
    }

    function mgToUnit(mg: number, unit: FatUnit) {
        if (unit === 'mg') return mg
        if (unit === 'g') return mg / 1000
        return mg / 1_000_000
    }

    const resultKcal = computed(() => fatToMg(amount.value, fatUnit.value) * mgToKcalFactor.value)

    const resultFatValue = computed(() => {
        const mg = mgToKcalFactor.value > 0 ? amount.value / mgToKcalFactor.value : 0
        return mgToUnit(mg, fatUnit.value)
    })

    const modeHint = computed(() => {
        if (mode.value !== 'fat_to_kcal') return ''
        if (fatUnit.value === 'mg') {
            return locale.value === 'en'
                ? `Guideline: 1 mg = ${formatNumber(mgToKcalFactor.value)} kcal`
                : `Richtwert: 1 mg = ${formatNumber(mgToKcalFactor.value)} kcal`
        }
        if (fatUnit.value === 'g') {
            return locale.value === 'en'
                ? `Guideline: 1 g = ${formatNumber(kcalPerKg.value / 1000)} kcal`
                : `Richtwert: 1 g = ${formatNumber(kcalPerKg.value / 1000)} kcal`
        }
        return locale.value === 'en'
            ? `Guideline: 1 kg = ${formatNumber(kcalPerKg.value)} kcal`
            : `Richtwert: 1 kg = ${formatNumber(kcalPerKg.value)} kcal`
    })

    const copyText = computed<string | null>(() => {
        if (!hasResult.value) return null

        const parts: string[] = []
        parts.push(`${ui.value.modeLabel} ${mode.value === 'fat_to_kcal' ? ui.value.modeFatToKcal : ui.value.modeKcalToFat}`)

        if (mode.value === 'fat_to_kcal') {
            parts.push(`${locale.value === 'en' ? 'Fat' : 'Fett'}: ${amount.value} ${fatUnit.value}`)
            parts.push(`kcal/kg: ${kcalPerKg.value}`)
            parts.push(`${ui.value.resultLabel} ${resultKcal.value.toFixed(2)} kcal`)
        } else {
            parts.push(`${locale.value === 'en' ? 'Calories' : 'Kalorien'}: ${amount.value}`)
            parts.push(`kcal/kg: ${kcalPerKg.value}`)
            parts.push(`${ui.value.resultLabel} ${resultFatValue.value.toFixed(4)} ${fatUnit.value}`)
        }

        return parts.join(' | ')
    })

    function resetDefaults() {
        amountRaw.value = ''
        mode.value = 'fat_to_kcal'
        fatUnit.value = 'g'
        didCalculate.value = false
    }

    function onManualCalculate() {
        if (!props.autoCalcEnabled) didCalculate.value = true
    }

    function validateBurnRate() {
        if (!amountRaw.value.trim()) {
            return [mode.value === 'fat_to_kcal' ? ui.value.needFat : ui.value.needCalories]
        }

        if (!Number.isFinite(amount.value)) return [ui.value.needNumber]
        if (amount.value <= 0) return [ui.value.needPositive]
        return []
    }

    function formatNumber(n: number) {
        if (!Number.isFinite(n)) return '0'
        const abs = Math.abs(n)
        const decimals = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 10 ? 2 : 4

        return n.toLocaleString(locale.value === 'en' ? 'en-US' : 'de-DE', {
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

    :global(.br-row > *) {
        min-width: 0;
    }

    :global(.br-row .ui-input) {
        flex: 1 1 auto;
        min-width: 0;
    }

    :global(.br-row .ui-select) {
        flex: 0 1 160px;
        min-width: 120px;
    }

    .mode {
        display: flex;
        gap: .55rem;
        flex-wrap: wrap;
        margin-bottom: .85rem;
    }

    .mode-btn {
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(148, 163, 184, 0.08);
        color: var(--text-primary);
        border-radius: 999px;
        padding: .45rem .8rem;
        cursor: pointer;
        font-size: .85rem;
        transition: border-color .15s ease, background .15s ease, transform .06s ease;
    }

    .mode-btn.active {
        border-color: rgba(99, 102, 241, 0.4);
        background: rgba(99, 102, 241, 0.14);
    }

    .mode-btn:hover {
        transform: translateY(-1px);
    }

    @media (max-width: 475px) {
        .br-row {
            flex-direction: column;
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
