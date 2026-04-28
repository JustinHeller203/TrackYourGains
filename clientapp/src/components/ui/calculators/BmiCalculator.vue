<template>
    <BaseCalculator :title="title || t('progress.calculators.bmi.title')"
                    :showInfo="!!info"
                    :infoTitle="t('progress.calculators.bmi.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="info"
                    :autoCalcEnabled="autoCalcEnabled"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="!!bmiResult"
                    :copyText="copyText"
                    :validate="validate"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    @invalid="onInvalid">
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" :aria-label="ui.heroAria">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">{{ ui.heroTitle }}</span>
                </div>

                <div class="calc-hero-sub">{{ ui.heroSub }}</div>

                <div class="calc-hero-pills" :aria-label="ui.quickNav">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">{{ ui.heroChipFormula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_bands')">{{ ui.heroChipBands }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_limits')">{{ ui.heroChipLimits }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="bmiResult"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div><strong>BMI:</strong> {{ bmiResult.value.toFixed(1) }} — <strong>{{ bmiResult.category }}</strong></div>
                        <div class="calc-note calc-note--tight">{{ ui.youNote }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('calc_next')">{{ ui.meaningChip }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.limitsChip }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.quickOverview">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">{{ ui.formulaChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_example')">{{ ui.exampleChip }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('calc_bands')">{{ ui.bandsChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.limitsChip }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="!bmiResult"
                            :aria-disabled="!bmiResult"
                            :class="{ 'is-disabled': !bmiResult }"
                            :title="bmiResult ? t('common.copy') : t('progress.calculators.copyHint')"
                            @click="() => { onCopy?.(); jumpTo('calc_you') }">
                        {{ t('common.copy') }}
                    </button>
                </div>

                <div id="calc_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.summaryTitle }}</div>
                    <div class="calc-callout-text">
                        <div>{{ ui.summaryIntro }}</div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.goodLabel }}</strong> {{ ui.summaryGood }}</li>
                            <li><strong>{{ ui.notGoodLabel }}</strong> {{ ui.summaryBad }}</li>
                            <li><strong>{{ ui.takeawayLabel }}</strong> {{ ui.summaryTakeaway }}</li>
                        </ul>
                    </div>
                </div>

                <div class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_next' }"
                     tabindex="-1"
                     id="calc_next">
                    <div class="calc-callout-title">{{ ui.meaningNowTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.normalLabel }}</strong> {{ ui.meaningNormal }}</li>
                        <li><strong>{{ ui.highLabel }}</strong> {{ ui.meaningHigh }}</li>
                        <li><strong>{{ ui.lowLabel }}</strong> {{ ui.meaningLow }}</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.whoTitle }}</h4>
                        <ul class="calc-list">
                            <li>{{ ui.who1 }}</li>
                            <li>{{ ui.who2 }}</li>
                            <li>{{ ui.who3 }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.measureTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.measuresLabel }}</strong> {{ ui.measuresText }}</li>
                            <li><strong>{{ ui.notMeasureLabel }}</strong> {{ ui.notMeasureText }}</li>
                            <li><strong>{{ ui.interpretLabel }}</strong> {{ ui.interpretText }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.compareTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>BMI:</strong> {{ ui.compareBmi }}</li>
                            <li><strong>{{ ui.bodyFatShort }}</strong> {{ ui.compareBodyFat }}</li>
                            <li><strong>{{ ui.takeawayLabel }}</strong> {{ ui.compareTakeaway }}</li>
                        </ul>
                    </section>

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">BMI</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaText }}</span>
                        </div>
                        <div class="calc-note">{{ ui.formulaNote }}</div>
                        <div v-if="normalWeightRange" class="calc-note calc-note--spaced">
                            <strong>{{ ui.normalRangeLabel }}</strong>
                            {{ ui.approxLabel }} <strong>{{ normalWeightRange.kgMin }}–{{ normalWeightRange.kgMax }} kg</strong>
                            <span v-if="normalWeightRange.lbMin"> (≈ {{ normalWeightRange.lbMin }}–{{ normalWeightRange.lbMax }} lbs)</span>
                        </div>
                    </section>

                    <section id="calc_bands"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_bands' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.categoriesTitle }}</h4>
                        <div class="calc-bands">
                            <div class="calc-band"><span class="calc-band-k">Under 18.5</span><span class="calc-band-v">{{ ui.bandUnder }}</span></div>
                            <div class="calc-band"><span class="calc-band-k">18.5 – 24.9</span><span class="calc-band-v">{{ ui.bandNormal }}</span></div>
                            <div class="calc-band"><span class="calc-band-k">25 – 29.9</span><span class="calc-band-v">{{ ui.bandOver }}</span></div>
                            <div class="calc-band"><span class="calc-band-k">30+</span><span class="calc-band-v">{{ ui.bandObese }}</span></div>
                        </div>
                    </section>

                    <section id="calc_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.exampleTitle }}</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>{{ ui.exampleTop }}</span>
                                <span class="calc-example-strong">≈ 24.7</span>
                            </div>
                            <div class="calc-example-sub">{{ ui.exampleSub }}</div>
                        </div>
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

                <div id="calc_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'calc_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.importantTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.muscleLabel }}</strong> {{ ui.muscleText }}</li>
                        <li><strong>{{ ui.lowMuscleLabel }}</strong> {{ ui.lowMuscleText }}</li>
                    </ul>
                </div>

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
                <div class="calc-mini-title">{{ ui.realityTitle }}</div>
                <div class="calc-mini-text">{{ ui.realityText }}</div>
            </div>
        </template>

        <template #inputs="{ UiCalculatorInput, maybeAutoCalc, errorFor }">
            <UiCalculatorInput :modelValue="gender"
                               as="select"
                               :label="ui.genderLabel"
                               :options="genderOptions"
                               @change="(v) => { emit('update:bmiGender', v as Gender); maybeAutoCalc?.() }" />

            <UiCalculatorInput :modelValue="weight ?? ''"
                               :label="weightLabel"
                               :placeholder="weightPlaceholder"
                               inputmode="decimal"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { emit('update:bmiWeight', v === '' ? null : Number(v)); maybeAutoCalc?.() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               :label="ui.heightLabel"
                               :placeholder="ui.heightPlaceholder"
                               inputmode="numeric"
                               :error="errorFor('gr')"
                               @update:modelValue="(v) => { emit('update:bmiHeight', v === '' ? null : Number(v)); maybeAutoCalc?.() }" />
        </template>

        <template #result>
            <p v-if="bmiResult"><strong>BMI:</strong> {{ bmiResult.value.toFixed(1) }}</p>
        </template>

        <template #result-sub>
            <p v-if="bmiResult">{{ ui.categoryLabel }} {{ bmiResult.category }}</p>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed, onMounted, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { useI18n } from '@/composables/useI18n'
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

    const { locale, t } = useI18n()

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

    const ui = computed(() => locale.value === 'en'
        ? {
            heroAria: 'BMI quick card',
            heroTitle: 'What does your BMI mean?',
            heroSub: 'BMI relates your weight to your height for a rough classification. It does not distinguish muscle from fat.',
            quickNav: 'Quick navigation',
            heroChipFormula: 'How it is calculated',
            heroChipBands: 'How it is classified',
            heroChipLimits: 'Often misleading for muscular people',
            youTitle: 'Your result',
            youNote: 'Tip: Use this as a starting point, not a verdict.',
            meaningChip: 'What does that mean?',
            limitsChip: 'Limits',
            quickOverview: 'Quick overview',
            formulaChip: 'Formula',
            exampleChip: 'Example',
            bandsChip: 'Ranges',
            summaryTitle: 'Quick summary',
            summaryIntro: 'BMI only tells you how heavy you are for your height.',
            goodLabel: 'Useful:',
            summaryGood: 'Quick starting point and rough classification.',
            notGoodLabel: 'Not enough:',
            summaryBad: 'It does not reliably tell fat from muscle.',
            takeawayLabel: 'Takeaway:',
            summaryTakeaway: 'Athletic people often look too heavy on paper while being perfectly fit.',
            meaningNowTitle: 'What does that mean now?',
            normalLabel: 'Normal range:',
            meaningNormal: 'Stay stable and keep your habits.',
            highLabel: 'Too high:',
            meaningHigh: 'A calorie deficit plus steps and training usually matter more.',
            lowLabel: 'Too low:',
            meaningLow: 'More calories, more protein, and strength training help.',
            whoTitle: 'Who is BMI useful for?',
            who1: 'Good for everyday use, beginners, and rough orientation.',
            who2: 'Be careful if you do a lot of strength training or carry a lot of muscle.',
            who3: 'Poor fit for bodybuilding and high-level sport.',
            measureTitle: 'What does BMI measure?',
            measuresLabel: 'Measures:',
            measuresText: 'Weight relative to height.',
            notMeasureLabel: 'Does not measure:',
            notMeasureText: 'Muscle vs fat, body shape, or athletic performance.',
            interpretLabel: 'Interpretation:',
            interpretText: 'How heavy are you for your height?',
            compareTitle: 'BMI vs body fat',
            bodyFatShort: 'Body fat:',
            compareBmi: 'Weight and height turned into one quick number.',
            compareBodyFat: 'Closer to actual body composition and shape.',
            compareTakeaway: 'If you want a better physique estimate, body fat beats BMI.',
            formulaTitle: 'Formula',
            formulaText: 'weight (kg) ÷ height² (m)',
            formulaNote: 'Tip: 180 cm = 1.80 m, so divide by 100.',
            normalRangeLabel: 'Normal range for your height:',
            approxLabel: 'approx.',
            categoriesTitle: 'Categories',
            bandUnder: 'Underweight',
            bandNormal: 'Normal range',
            bandOver: 'Overweight',
            bandObese: 'Obesity',
            exampleTitle: 'Example',
            exampleTop: '80 kg at 1.80 m',
            exampleSub: 'Formally normal range. In reality, muscle mass and body fat matter a lot.',
            ignoreTitle: 'When you can safely ignore BMI',
            ignore1: 'If your performance is good.',
            ignore2: 'If your waist stays in a healthy range.',
            ignore3: 'If you feel fit and sleep and stress are under control.',
            importantTitle: 'Important (so you use it correctly)',
            muscleLabel: 'A lot of muscle:',
            muscleText: 'BMI often reads too high.',
            lowMuscleLabel: 'Little muscle:',
            lowMuscleText: 'BMI can look okay even when body fat is poor.',
            faqTitle: 'Frequently asked questions',
            faq1q: '"BMI says overweight, but I am muscular?"',
            faq1a: 'That happens often.',
            faq2q: '"Is BMI dangerous?"',
            faq2a: 'No, just imprecise.',
            faq3q: '"What is better?"',
            faq3a: 'Body fat, waist, photos, and performance.',
            realityTitle: 'Reality check',
            realityText: 'BMI is a starting point. For a real estimate, use body fat, measurements, or progress photos.',
            genderLabel: 'Sex *',
            heightLabel: 'Height (cm) *',
            heightPlaceholder: 'e.g. 175',
            categoryLabel: 'Category:',
        }
        : {
            heroAria: 'BMI Kurzkarte',
            heroTitle: 'Was bedeutet dein BMI?',
            heroSub: 'Der BMI setzt dein Gewicht ins Verhältnis zu deiner Größe, für eine grobe Einordnung. Muskeln und Fett unterscheidet er nicht.',
            quickNav: 'Schnellnavigation',
            heroChipFormula: 'So wird er berechnet',
            heroChipBands: 'So wird es eingeordnet',
            heroChipLimits: 'Bei Muskeln oft falsch',
            youTitle: 'Dein Ergebnis',
            youNote: 'Tipp: Nutze das als Startpunkt, nicht als Urteil.',
            meaningChip: 'Was heißt das?',
            limitsChip: 'Grenzen',
            quickOverview: 'Kurzüberblick',
            formulaChip: 'Formel',
            exampleChip: 'Beispiel',
            bandsChip: 'Bereiche',
            summaryTitle: 'Kurzfassung',
            summaryIntro: 'Der BMI zeigt nur, wie schwer du für deine Größe bist.',
            goodLabel: 'Gut:',
            summaryGood: 'Schneller Startpunkt und grobe Einordnung.',
            notGoodLabel: 'Nicht genug:',
            summaryBad: 'Er trennt Fett und Muskeln nicht sauber.',
            takeawayLabel: 'Merke:',
            summaryTakeaway: 'Sportliche Menschen wirken im BMI oft zu schwer, obwohl sie fit sind.',
            meaningNowTitle: 'Was heißt das jetzt?',
            normalLabel: 'Normalbereich:',
            meaningNormal: 'Stabil bleiben und gute Gewohnheiten halten.',
            highLabel: 'Zu hoch:',
            meaningHigh: 'Defizit plus Schritte und Training sind meist relevanter.',
            lowLabel: 'Zu niedrig:',
            meaningLow: 'Mehr Kalorien, Protein und Krafttraining helfen.',
            whoTitle: 'Für wen ist BMI sinnvoll?',
            who1: 'Gut für Alltag, Anfänger und grobe Orientierung.',
            who2: 'Vorsicht bei viel Krafttraining oder viel Muskelmasse.',
            who3: 'Schlecht passend für Bodybuilding und Leistungssport.',
            measureTitle: 'Was misst der BMI?',
            measuresLabel: 'Misst:',
            measuresText: 'Gewicht relativ zur Größe.',
            notMeasureLabel: 'Misst nicht:',
            notMeasureText: 'Muskeln gegen Fett, Körperform oder Athletik.',
            interpretLabel: 'Interpretation:',
            interpretText: 'Wie schwer bist du für deine Größe?',
            compareTitle: 'BMI vs. Körperfett',
            bodyFatShort: 'KFA:',
            compareBmi: 'Gewicht und Größe als schnelle Zahl.',
            compareBodyFat: 'Näher an echter Körperzusammensetzung und Form.',
            compareTakeaway: 'Wenn du es genauer willst, schlägt Körperfett den BMI.',
            formulaTitle: 'Formel',
            formulaText: 'Gewicht (kg) ÷ Größe² (m)',
            formulaNote: 'Tipp: 180 cm = 1,80 m, also durch 100 teilen.',
            normalRangeLabel: 'Normalbereich für deine Größe:',
            approxLabel: 'ca.',
            categoriesTitle: 'Kategorien',
            bandUnder: 'Untergewicht',
            bandNormal: 'Normalbereich',
            bandOver: 'Übergewicht',
            bandObese: 'Adipositas',
            exampleTitle: 'Beispiel',
            exampleTop: '80 kg bei 1,80 m',
            exampleSub: 'Formal normal. In der Praxis zählen Muskelmasse und Körperfett deutlich mehr.',
            ignoreTitle: 'Wann du den BMI locker ignorieren darfst',
            ignore1: 'Wenn deine Leistung gut ist.',
            ignore2: 'Wenn deine Taille im Rahmen bleibt.',
            ignore3: 'Wenn du dich fit fühlst und Schlaf und Stress passen.',
            importantTitle: 'Wichtig (damit du es richtig nutzt)',
            muscleLabel: 'Viel Muskel:',
            muscleText: 'BMI wirkt oft zu hoch.',
            lowMuscleLabel: 'Wenig Muskel:',
            lowMuscleText: 'BMI kann okay aussehen, obwohl das Körperfett ungünstig ist.',
            faqTitle: 'Häufige Fragen',
            faq1q: '"BMI sagt Übergewicht, aber ich bin muskulös?"',
            faq1a: 'Das kommt oft vor.',
            faq2q: '"Ist BMI gefährlich?"',
            faq2a: 'Nein, nur ungenau.',
            faq3q: '"Was ist besser?"',
            faq3a: 'Körperfett, Taille, Fotos und Leistung.',
            realityTitle: 'Reality-Check',
            realityText: 'BMI ist nur ein Startpunkt. Für eine echte Einschätzung helfen Körperfett, Umfänge oder Progress-Fotos.',
            genderLabel: 'Geschlecht *',
            heightLabel: 'Körpergröße (cm) *',
            heightPlaceholder: 'z.B. 175',
            categoryLabel: 'Kategorie:',
        })

    const genderOptions = computed(() => locale.value === 'en'
        ? [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]
        : [{ label: 'Männlich', value: 'male' }, { label: 'Weiblich', value: 'female' }])

    const weightLabel = computed(() => locale.value === 'en'
        ? `Body weight (${props.unit === 'kg' ? 'kg' : 'lbs'}) *`
        : `Körpergewicht (${props.unit === 'kg' ? 'kg' : 'lbs'}) *`)

    const weightPlaceholder = computed(() => props.unit === 'kg' ? 'z.B. 70' : 'z.B. 155')

    const normalWeightRange = computed(() => {
        const cm = props.bmiHeight
        if (!cm || cm <= 0) return null
        const m = cm / 100
        const round1 = (v: number) => Math.round(v * 10) / 10
        const toLb = (kg: number) => kg * 2.2046226218
        const kgMin = round1(18.5 * m * m)
        const kgMax = round1(24.9 * m * m)
        return { kgMin, kgMax, lbMin: round1(toLb(kgMin)), lbMax: round1(toLb(kgMax)) }
    })

    const gender = computed(() => props.bmiGender)
    const weight = computed(() => props.bmiWeight)
    const height = computed(() => props.bmiHeight)

    function validate() {
        const errors: string[] = []
        const w = props.bmiWeight
        const h = props.bmiHeight

        if (w == null || Number.isNaN(w)) errors.push(locale.value === 'en' ? 'Please enter your body weight.' : 'Bitte gib dein Körpergewicht ein.')
        else if (w <= 0) errors.push(locale.value === 'en' ? 'Body weight must be greater than 0.' : 'Körpergewicht muss größer als 0 sein.')
        else if (props.unit === 'kg' && w > 400) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high (kg).' : 'Körpergewicht wirkt unrealistisch hoch (kg).')
        else if ((props.unit === 'lb' || props.unit === 'lbs') && w > 900) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high (lbs).' : 'Körpergewicht wirkt unrealistisch hoch (lbs).')

        if (h == null || Number.isNaN(h)) errors.push(locale.value === 'en' ? 'Please enter your height.' : 'Bitte gib deine Körpergröße ein.')
        else if (h <= 0) errors.push(locale.value === 'en' ? 'Height must be greater than 0.' : 'Körpergröße muss größer als 0 sein.')
        else if (h < 80 || h > 250) errors.push(locale.value === 'en' ? 'Height seems unrealistic (cm).' : 'Körpergröße wirkt unrealistisch (cm).')

        return errors
    }

    function onInvalid(errors: string[]) {
        emit('invalid', errors)
    }

    const copyText = computed<string | null>(() => {
        if (!props.bmiResult) return null
        const parts: string[] = []
        if (props.bmiHeight) parts.push(`${locale.value === 'en' ? 'Height' : 'Größe'}: ${props.bmiHeight} cm`)
        if (props.bmiWeight != null) parts.push(`${locale.value === 'en' ? 'Weight' : 'Gewicht'}: ${props.bmiWeight} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        parts.push(`BMI: ${props.bmiResult.value.toFixed(1)} (${props.bmiResult.category})`)
        return parts.join(' | ')
    })

    const LS_KEY = LS_PROGRESS_BMI

    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (!raw) return
            const data = JSON.parse(raw)
            if (props.bmiWeight == null && typeof data.weight === 'number') emit('update:bmiWeight', data.weight)
            if (props.bmiHeight == null && typeof data.height === 'number') emit('update:bmiHeight', data.height)
        } catch { }
    })

    watch(() => [props.bmiGender, props.bmiWeight, props.bmiHeight], ([g, w, h]) => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ gender: g, weight: w, height: h }))
        } catch { }
    }, { deep: false })
</script>

<style scoped>
</style>
