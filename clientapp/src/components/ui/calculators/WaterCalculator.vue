<!-- src/components/ui/calculators/WaterCalculator.vue -->
<template>
    <BaseCalculator :title="title || t('progress.calculators.water.title')"
                    :showInfo="true"
                    :infoTitle="t('progress.calculators.water.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateWater"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="waterResult != null"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    @invalid="(errors) => $emit('invalid', errors)">

        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" :aria-label="ui.heroAria">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">{{ ui.heroTitle }}</span>
                </div>

                <div class="calc-hero-sub" v-html="ui.heroSub"></div>

                <div class="calc-hero-pills" :aria-label="ui.quickNav">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">{{ ui.chips.formula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_factors')">{{ ui.chips.factors }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.chips.limits }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="waterResult != null"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>{{ ui.dailyWaterLabel }}</strong> {{ waterResult!.toFixed(1) }} {{ ui.litersUnit }}
                        </div>

                        <div class="calc-note calc-note--tight">{{ ui.youTip }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('calc_next')">{{ ui.chips.meaning }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.chips.limits }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.overviewLabel">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">{{ ui.chips.formulaShort }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_example')">{{ ui.chips.example }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('calc_factors')">{{ ui.chips.factors }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.chips.limits }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="waterResult == null"
                            :aria-disabled="waterResult == null"
                            :class="{ 'is-disabled': waterResult == null }"
                            :title="waterResult == null ? t('progress.calculators.copyHint') : t('progress.chart.exportShort')"
                            @click="() => { onCopy?.(); jumpTo('calc_you') }">
                        {{ ui.copyChip }}
                    </button>
                </div>

                <div id="calc_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.summaryTitle }}</div>
                    <div class="calc-callout-text">
                        <div v-html="ui.summaryLead"></div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.summary.goodLabel }}</strong> {{ ui.summary.good }}</li>
                            <li><strong>{{ ui.summary.importantLabel }}</strong> {{ ui.summary.important }}</li>
                            <li><strong>{{ ui.summary.noteLabel }}</strong> {{ ui.summary.note }}</li>
                        </ul>
                    </div>
                </div>

                <div id="calc_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.nextTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.next.headacheLabel }}</strong> {{ ui.next.headache }}</li>
                        <li><strong>{{ ui.next.sweatLabel }}</strong> {{ ui.next.sweat }}</li>
                        <li><strong>{{ ui.next.noThirstLabel }}</strong> {{ ui.next.noThirst }}</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.forWhoTitle }}</h4>
                        <ul class="calc-list">
                            <li>{{ ui.forWho.everyday }}</li>
                            <li>{{ ui.forWho.sweat }}</li>
                            <li>{{ ui.forWho.medical }}</li>
                        </ul>
                    </section>

                    <section id="calc_factors"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_factors' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.factorsTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.factors.weightLabel }}</strong> {{ ui.factors.weight }}</li>
                            <li><strong>{{ ui.factors.activityLabel }}</strong> {{ ui.factors.activity }}</li>
                            <li><strong>{{ ui.factors.climateLabel }}</strong> {{ ui.factors.climate }}</li>
                        </ul>
                    </section>

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">{{ ui.formulaKey }}</span>
                            <span class="calc-formula-eq">≈</span>
                            <span class="calc-formula-v">{{ ui.formulaValue }}</span>
                        </div>
                        <div class="calc-note">{{ ui.formulaNote }}</div>
                    </section>

                    <section id="calc_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.exampleTitle }}</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>{{ ui.exampleTop }}</span>
                                <span class="calc-example-strong">{{ ui.exampleValue }}</span>
                            </div>
                            <div class="calc-example-sub" v-html="ui.exampleSub"></div>
                        </div>
                    </section>
                </div>

                <div id="calc_ignore"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_ignore' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.ignoreTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.ignore.first }}</li>
                        <li>{{ ui.ignore.second }}</li>
                        <li>{{ ui.ignore.third }}</li>
                        <li>{{ ui.ignore.fourth }}</li>
                    </ul>
                </div>

                <div id="calc_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'calc_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.limitsTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.limits.tooMuchLabel }}</strong> {{ ui.limits.tooMuch }}</li>
                        <li><strong>{{ ui.limits.trainingLabel }}</strong> {{ ui.limits.training }}</li>
                        <li><strong>{{ ui.limits.medicalLabel }}</strong> {{ ui.limits.medical }}</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">{{ ui.faqTitle }}</h4>
                    <ul class="calc-list">
                        <li><strong>{{ ui.faq.coffeeQ }}</strong> {{ ui.faq.coffeeA }}</li>
                        <li><strong>{{ ui.faq.lowQ }}</strong> {{ ui.faq.lowA }}</li>
                        <li><strong>{{ ui.faq.toxicQ }}</strong> {{ ui.faq.toxicA }}</li>
                        <li><strong>{{ ui.faq.tooMuchQ }}</strong> {{ ui.faq.tooMuchA }}</li>
                    </ul>
                </section>
            </div>
        </template>

        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">{{ ui.realityTitle }}</div>
                <div class="calc-mini-text" v-html="ui.realityText"></div>
            </div>
        </template>

        <template #inputs="{ maybeAutoCalc, normalizeNumberInput, errorFor }">
            <UiCalculatorInput :modelValue="weightInputValue"
                               :label="ui.weightLabel(unitNormalized)"
                               type="text"
                               inputmode="decimal"
                               autocomplete="off"
                               :placeholder="ui.weightPlaceholder(unitNormalized)"
                               :error="errorFor(['weight', 'gewicht'])"
                               @update:modelValue="(v: string | number) => { onWeightInputValue(v, normalizeNumberInput); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="activity"
                               as="select"
                               :label="ui.activityLabel"
                               @update:modelValue="(v: string | number) => { emit('update:waterActivity', String(v) as Activity); maybeAutoCalc() }"
                               :options="activityOptions" />

            <UiCalculatorInput :modelValue="climate"
                               as="select"
                               :error="errorFor(['climate', 'klima'])"
                               :label="ui.climateLabel"
                               @update:modelValue="(v: string | number) => { emit('update:waterClimate', String(v) as Climate); maybeAutoCalc() }"
                               :options="climateOptions" />
        </template>

        <template #result>
            <div v-if="waterResult != null">
                <p><strong>{{ ui.dailyWaterLabel }}</strong> {{ waterResult!.toFixed(1) }} {{ ui.litersUnit }}</p>
            </div>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
import { useI18n } from '@/composables/useI18n'
import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'
import { LS_PROGRESS_WATER_INPUTS_V1 } from '@/constants/storageKeys'

type Unit = 'kg' | 'lb' | 'lbs' | string
type Activity = 'low' | 'moderate' | 'high'
type Climate = 'temperate' | 'hot' | 'very_hot'
type NormalizeFn = (raw: string) => string

const props = defineProps<{
    unit: Unit
    autoCalcEnabled: boolean
    waterWeight: number | null
    waterActivity: Activity
    waterClimate: Climate
    waterResult: number | null
    isFavorite: boolean
    title?: string
    info?: string
}>()

const emit = defineEmits<{
    (e: 'toggleFavorite'): void
    (e: 'update:waterWeight', v: number | null): void
    (e: 'update:waterActivity', v: Activity): void
    (e: 'update:waterClimate', v: Climate): void
    (e: 'calculate'): void
    (e: 'copy'): void
    (e: 'export'): void
    (e: 'reset'): void
    (e: 'invalid', errors: string[]): void
}>()

const { t, locale } = useI18n()

const unitNormalized = computed<'kg' | 'lbs'>(() => {
    const u = String(props.unit || 'kg').toLowerCase()
    return u === 'lb' || u === 'lbs' ? 'lbs' : 'kg'
})

const ui = computed(() => locale.value === 'en'
    ? {
        heroAria: 'Water quick card',
        heroTitle: 'How much water do you need?',
        heroSub: 'Estimates your intake target from <strong>body weight</strong> + <strong>activity</strong> + <strong>climate</strong> (sweat / heat).',
        quickNav: 'Quick navigation',
        chips: {
            formula: 'How it is estimated',
            formulaShort: 'Formula',
            factors: 'What affects it?',
            limits: 'Limits',
            example: 'Example',
            meaning: 'What does that mean?'
        },
        overviewLabel: 'Overview',
        youTitle: 'Your result',
        dailyWaterLabel: 'Daily water target:',
        litersUnit: 'liters',
        youTip: 'Tip: spread it across the day instead of trying to drink everything at once.',
        copyChip: 'Copy',
        summaryTitle: 'Short version',
        summaryLead: 'This calculator estimates your needs from <strong>body weight</strong>, <strong>activity</strong>, and <strong>climate</strong>.',
        summary: {
            goodLabel: 'Useful:',
            good: 'simple day-to-day orientation',
            importantLabel: 'Important:',
            important: 'thirst, urine color, and hard training days still matter',
            noteLabel: 'Remember:',
            note: 'heat and heavy sweating can push needs up noticeably'
        },
        nextTitle: 'What does that mean now?',
        next: {
            headacheLabel: 'If you often feel headaches or fatigue:',
            headache: 'check water intake and sleep first',
            sweatLabel: 'If you sweat a lot:',
            sweat: 'drink more and consider electrolytes',
            noThirstLabel: 'If you rarely feel thirst:',
            noThirst: 'build fixed drinking routines'
        },
        forWhoTitle: 'Who is this useful for?',
        forWho: {
            everyday: 'Good for everyday life, gym, and rough hydration targets',
            sweat: 'Heavy sweating or long endurance work: aim higher',
            medical: 'Medical special cases: ask a doctor'
        },
        factorsTitle: 'What affects your needs?',
        factors: {
            weightLabel: 'Body weight:',
            weight: 'more body mass usually means a higher baseline need',
            activityLabel: 'Activity:',
            activity: 'sweat and heavier breathing increase fluid loss',
            climateLabel: 'Climate:',
            climate: 'heat and dry air usually increase losses'
        },
        formulaTitle: 'Formula (simplified)',
        formulaKey: 'Water',
        formulaValue: 'body weight × base factor + add-ons (activity / climate)',
        formulaNote: 'A guideline. Fluid from food also counts, for example fruit or soup.',
        exampleTitle: 'Example',
        exampleTop: '75 kg, moderately active, temperate climate',
        exampleValue: '≈ 2.5-3.0 L',
        exampleSub: 'In hot weather or with a lot of sweating, move toward the <strong>upper end</strong>.',
        ignoreTitle: 'When you can safely ignore the water calculator',
        ignore: {
            first: 'You feel normal thirst and drink steadily through the day',
            second: 'Your urine is usually pale yellow',
            third: 'Your performance feels stable without dehydration symptoms',
            fourth: 'No medical special cases such as heart or kidney issues'
        },
        limitsTitle: 'Important limits',
        limits: {
            tooMuchLabel: 'Too much at once:',
            tooMuch: 'does not help, spread intake over the day',
            trainingLabel: 'Very hard training or heat:',
            training: 'electrolytes can matter, not just water',
            medicalLabel: 'Medication or illness:',
            medical: 'can change your real needs'
        },
        faqTitle: 'Common questions',
        faq: {
            coffeeQ: 'Does coffee count?',
            coffeeA: 'Yes, but plain water is still the easiest base.',
            lowQ: 'How do I notice too little?',
            lowA: 'Thirst, darker urine, headaches, and performance drop.',
            toxicQ: 'When does water become dangerous?',
            toxicA: 'Too much, too fast can be dangerous because sodium gets diluted.',
            tooMuchQ: 'Can I drink too much?',
            tooMuchA: 'Yes, rarely, and usually from drinking too much too quickly.'
        },
        realityTitle: 'Reality check',
        realityText: 'Drink enough to feel stable. <strong>Thirst</strong>, <strong>urine color</strong>, and <strong>training load</strong> are the real markers.',
        activityLabel: 'Activity level *',
        climateLabel: 'Climate *',
        weightLabel: (unit: 'kg' | 'lbs') => `Body weight (${unit}) *`,
        weightPlaceholder: (unit: 'kg' | 'lbs') => unit === 'kg' ? 'e.g. 70' : 'e.g. 155',
        activityOptions: [
            { label: 'Low (no training)', value: 'low' },
            { label: 'Moderate (1-3x/week)', value: 'moderate' },
            { label: 'High (4-7x/week)', value: 'high' }
        ],
        climateOptions: [
            { label: 'Temperate', value: 'temperate' },
            { label: 'Hot', value: 'hot' },
            { label: 'Very hot', value: 'very_hot' }
        ],
        infoFallback: 'Estimates your daily water needs from body weight, activity, and climate. Guideline values, not medical advice.',
        validation: {
            enterWeight: (label: string) => `Please enter your ${label}.`,
            weightPositive: (label: string) => `${label} must be greater than 0.`,
            weightHigh: (label: string) => `${label} seems unrealistically high.`,
            activity: 'Please choose your activity level.',
            climate: 'Please choose your climate.'
        },
        copy: {
            weight: 'Body weight',
            activity: 'Activity',
            climate: 'Climate',
            result: 'Water target'
        }
    }
    : {
        heroAria: 'Wasser-Kurzkarte',
        heroTitle: 'Wie viel Wasser brauchst du?',
        heroSub: 'Schätzt deinen Bedarf aus <strong>Gewicht</strong> + <strong>Aktivität</strong> + <strong>Klima</strong> (Schweiß / Hitze).',
        quickNav: 'Schnellnavigation',
        chips: {
            formula: 'So wird es geschätzt',
            formulaShort: 'Formel',
            factors: 'Was beeinflusst das?',
            limits: 'Grenzen',
            example: 'Beispiel',
            meaning: 'Was heißt das?'
        },
        overviewLabel: 'Kurzüberblick',
        youTitle: 'Dein Ergebnis',
        dailyWaterLabel: 'Täglicher Wasserbedarf:',
        litersUnit: 'Liter',
        youTip: 'Tipp: über den Tag verteilen und nicht alles auf einmal trinken.',
        copyChip: 'Kopieren',
        summaryTitle: 'Kurzfassung',
        summaryLead: 'Der Rechner schätzt deinen Bedarf aus <strong>Gewicht</strong>, <strong>Aktivität</strong> und <strong>Klima</strong>.',
        summary: {
            goodLabel: 'Gut:',
            good: 'einfache Orientierung für den Alltag',
            importantLabel: 'Wichtig:',
            important: 'Durst, Urinfarbe und harte Trainingstage zählen mit',
            noteLabel: 'Merke:',
            note: 'bei Hitze und viel Schweiß brauchst du oft spürbar mehr'
        },
        nextTitle: 'Was heißt das jetzt?',
        next: {
            headacheLabel: 'Wenn du oft Kopfweh oder Müdigkeit hast:',
            headache: 'zuerst Wasser und Schlaf checken',
            sweatLabel: 'Wenn du viel schwitzt:',
            sweat: 'mehr trinken und Elektrolyte mitdenken',
            noThirstLabel: 'Wenn du selten Durst hast:',
            noThirst: 'feste Trinkroutinen bauen'
        },
        forWhoTitle: 'Für wen ist das sinnvoll?',
        forWho: {
            everyday: 'Gut für Alltag, Gym und grobe Richtwerte',
            sweat: 'Viel Schwitzen oder lange Ausdauer: eher höher ansetzen',
            medical: 'Medizinische Sonderfälle: Arzt oder Ärztin fragen'
        },
        factorsTitle: 'Was beeinflusst den Bedarf?',
        factors: {
            weightLabel: 'Gewicht:',
            weight: 'mehr Körpermasse bedeutet meist mehr Grundbedarf',
            activityLabel: 'Aktivität:',
            activity: 'Schweiß und stärkere Atmung erhöhen den Flüssigkeitsverlust',
            climateLabel: 'Klima:',
            climate: 'Hitze und trockene Luft erhöhen meist die Verluste'
        },
        formulaTitle: 'Formel (vereinfacht)',
        formulaKey: 'Wasser',
        formulaValue: 'Gewicht × Basisfaktor + Zuschläge (Aktivität / Klima)',
        formulaNote: 'Ein Richtwert. Flüssigkeit aus Essen zählt ebenfalls, zum Beispiel Obst oder Suppe.',
        exampleTitle: 'Beispiel',
        exampleTop: '75 kg, moderat aktiv, gemäßigtes Klima',
        exampleValue: '≈ 2,5-3,0 L',
        exampleSub: 'Bei Hitze oder viel Schwitzen eher Richtung <strong>oberes Ende</strong> gehen.',
        ignoreTitle: 'Wann du den Wasserbedarfsrechner locker ignorieren darfst',
        ignore: {
            first: 'Du hast normalen Durst und trinkst verteilt über den Tag',
            second: 'Dein Urin ist meistens hellgelb',
            third: 'Deine Leistung bleibt stabil ohne Dehydrierungs-Symptome',
            fourth: 'Keine medizinischen Sonderfälle wie Herz- oder Nierenprobleme'
        },
        limitsTitle: 'Wichtige Grenzen',
        limits: {
            tooMuchLabel: 'Zu viel auf einmal:',
            tooMuch: 'bringt nichts, besser über den Tag verteilen',
            trainingLabel: 'Sehr hartes Training oder Hitze:',
            training: 'dann können Elektrolyte zusätzlich relevant sein',
            medicalLabel: 'Medikamente oder Erkrankungen:',
            medical: 'können den realen Bedarf verändern'
        },
        faqTitle: 'Häufige Fragen',
        faq: {
            coffeeQ: 'Zählt Kaffee?',
            coffeeA: 'Ja, aber Wasser bleibt die einfachste Basis.',
            lowQ: 'Woran merke ich zu wenig?',
            lowA: 'Durst, dunklerer Urin, Kopfweh und Leistungsabfall.',
            toxicQ: 'Ab wann wird Wasser gefährlich?',
            toxicA: 'Zu viel, zu schnell kann gefährlich werden, weil Natrium verdünnt wird.',
            tooMuchQ: 'Kann ich zu viel trinken?',
            tooMuchA: 'Ja, selten, meistens wenn du sehr viel in kurzer Zeit trinkst.'
        },
        realityTitle: 'Reality-Check',
        realityText: 'Trink so, dass du dich stabil fühlst. <strong>Durst</strong>, <strong>Urinfarbe</strong> und <strong>Trainingsbelastung</strong> sind die echten Marker.',
        activityLabel: 'Aktivitätslevel *',
        climateLabel: 'Klima *',
        weightLabel: (unit: 'kg' | 'lbs') => `Körpergewicht (${unit}) *`,
        weightPlaceholder: (unit: 'kg' | 'lbs') => unit === 'kg' ? 'z. B. 70' : 'z. B. 155',
        activityOptions: [
            { label: 'Niedrig (kein Sport)', value: 'low' },
            { label: 'Moderat (1-3x/Woche)', value: 'moderate' },
            { label: 'Hoch (4-7x/Woche)', value: 'high' }
        ],
        climateOptions: [
            { label: 'Gemäßigt', value: 'temperate' },
            { label: 'Heiß', value: 'hot' },
            { label: 'Sehr heiß', value: 'very_hot' }
        ],
        infoFallback: 'Schätzt deinen täglichen Wasserbedarf aus Gewicht, Aktivität und Klima. Richtwerte, keine medizinische Beratung.',
        validation: {
            enterWeight: (label: string) => `Bitte gib dein ${label} ein.`,
            weightPositive: (label: string) => `${label} muss größer als 0 sein.`,
            weightHigh: (label: string) => `${label} wirkt unrealistisch hoch.`,
            activity: 'Bitte wähle dein Aktivitätslevel.',
            climate: 'Bitte wähle dein Klima.'
        },
        copy: {
            weight: 'Gewicht',
            activity: 'Aktivität',
            climate: 'Klima',
            result: 'Wasserbedarf'
        }
    })

const activity = computed(() => props.waterActivity)
const climate = computed(() => props.waterClimate)
const waterResult = computed(() => props.waterResult)

const infoText = computed(() => props.info ?? ui.value.infoFallback)

const weightInputValue = computed(() =>
    props.waterWeight == null || Number.isNaN(props.waterWeight) ? '' : String(props.waterWeight)
)

const activityOptions = computed(() => ui.value.activityOptions)
const climateOptions = computed(() => ui.value.climateOptions)

const copyText = computed<string | null>(() => {
    if (props.waterResult == null) return null

    const parts: string[] = []
    if (props.waterWeight != null) parts.push(`${ui.value.copy.weight}: ${props.waterWeight} ${unitNormalized.value}`)
    if (props.waterActivity) parts.push(`${ui.value.copy.activity}: ${props.waterActivity}`)
    if (props.waterClimate) parts.push(`${ui.value.copy.climate}: ${props.waterClimate}`)
    parts.push(`${ui.value.copy.result}: ${props.waterResult.toFixed(1)} L/day`)

    return parts.join(' | ')
})

function onWeightInputValue(v: string | number, normalize?: NormalizeFn) {
    const raw0 = String(v ?? '')
    const raw = normalize ? normalize(raw0) : raw0.trim().replace(',', '.')
    if (raw === '') {
        emit('update:waterWeight', null)
        return
    }
    const n = Number(raw)
    if (Number.isFinite(n)) emit('update:waterWeight', n)
}

function validateWater(): string[] {
    const errors: string[] = []

    const weightLabel = ui.value.weightLabel(unitNormalized.value).replace(' *', '')
    const w = props.waterWeight

    if (w == null || Number.isNaN(w)) {
        errors.push(ui.value.validation.enterWeight(weightLabel))
        return errors
    }
    if (w <= 0) errors.push(ui.value.validation.weightPositive(weightLabel))
    else if (unitNormalized.value === 'kg' && w > 400) errors.push(ui.value.validation.weightHigh(weightLabel))
    else if (unitNormalized.value === 'lbs' && w > 900) errors.push(ui.value.validation.weightHigh(weightLabel))

    if (props.waterActivity !== 'low' && props.waterActivity !== 'moderate' && props.waterActivity !== 'high') {
        errors.push(ui.value.validation.activity)
    }

    if (props.waterClimate !== 'temperate' && props.waterClimate !== 'hot' && props.waterClimate !== 'very_hot') {
        errors.push(ui.value.validation.climate)
    }

    return errors
}

const LS_KEY = LS_PROGRESS_WATER_INPUTS_V1

onMounted(() => {
    try {
        const raw = localStorage.getItem(LS_KEY)
        if (!raw) return
        const data = JSON.parse(raw)

        if (props.waterWeight == null && Number.isFinite(data.weight)) emit('update:waterWeight', data.weight)
        if (data.activity === 'low' || data.activity === 'moderate' || data.activity === 'high') emit('update:waterActivity', data.activity)
        if (data.climate === 'temperate' || data.climate === 'hot' || data.climate === 'very_hot') emit('update:waterClimate', data.climate)
    } catch {
        // noop
    }
})

watch(
    () => [props.waterWeight, props.waterActivity, props.waterClimate],
    ([w, a, c]) => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ weight: w, activity: a, climate: c }))
        } catch {
            // noop
        }
    },
    { deep: false }
)
</script>

<style scoped>
</style>
