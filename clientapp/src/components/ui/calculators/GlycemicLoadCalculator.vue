<!-- src/components/ui/calculators/GlycemicLoadCalculator.vue -->
<template>
    <BaseCalculator :title="title || t('progress.calculators.glyload.title')"
                    :showInfo="!!infoText"
                    :infoTitle="t('progress.calculators.glyload.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateGl"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="glResult !== null"
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
                    <button class="calc-chip" type="button" @click="jumpTo('gl_formula')">{{ ui.chips.formula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('gl_bands')">{{ ui.chips.bands }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('gl_limits')">{{ ui.chips.limits }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="glResult !== null"
                     id="gl_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'gl_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>{{ ui.resultLabel }}</strong> {{ glResult!.toFixed(1) }}
                            <span v-if="glCategory">- <strong>{{ localizedCategory }}</strong></span>
                        </div>

                        <div class="calc-note calc-note--tight">{{ ui.youTip }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('gl_next')">{{ ui.chips.meaning }}</button>
                            <button class="calc-chip" type="button" @click="jumpTo('gl_bands')">{{ ui.chips.bands }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('gl_limits')">{{ ui.chips.limits }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.overviewLabel">
                    <button class="calc-chip" type="button" @click="jumpTo('gl_formula')">{{ ui.chips.formulaShort }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('gl_example')">{{ ui.chips.example }}</button>
                    <button class="calc-chip" type="button" @click="openGlTable()">{{ ui.chips.table }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('gl_bands')">{{ ui.chips.bands }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('gl_insulin')">{{ ui.chips.insulin }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('gl_limits')">{{ ui.chips.limits }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="glResult === null"
                            :aria-disabled="glResult === null"
                            :class="{ 'is-disabled': glResult === null }"
                            :title="glResult !== null ? t('progress.chart.exportShort') : t('progress.calculators.copyHint')"
                            @click="() => { onCopy?.(); jumpTo('gl_you') }">
                        {{ ui.copyChip }}
                    </button>
                </div>

                <div id="gl_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'gl_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.summaryTitle }}</div>
                    <div class="calc-callout-text">
                        <div v-html="ui.summaryLead"></div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.summary.giLabel }}</strong> {{ ui.summary.gi }}</li>
                            <li><strong>{{ ui.summary.glLabel }}</strong> {{ ui.summary.gl }}</li>
                            <li><strong>{{ ui.summary.noteLabel }}</strong> {{ ui.summary.note }}</li>
                        </ul>
                    </div>
                </div>

                <div class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_next' }"
                     tabindex="-1"
                     id="gl_next">
                    <div class="calc-callout-title">{{ ui.nextTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.next.lowLabel }}</strong> {{ ui.next.low }}</li>
                        <li><strong>{{ ui.next.mediumLabel }}</strong> {{ ui.next.medium }}</li>
                        <li><strong>{{ ui.next.highLabel }}</strong> {{ ui.next.high }}</li>
                    </ul>
                </div>

                <section id="gl_insulin"
                         class="calc-card"
                         :class="{ 'calc-target': activeTargetId === 'gl_insulin' }"
                         tabindex="-1">
                    <div class="calc-callout-title">{{ ui.insulinTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.insulin.first }}</li>
                        <li>{{ ui.insulin.second }}</li>
                        <li>{{ ui.insulin.third }}</li>
                        <li>{{ ui.insulin.fourth }}</li>
                    </ul>
                    <div class="calc-note calc-note--tight" v-html="ui.insulinNote"></div>
                </section>

                <div id="gl_when"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_when' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.whenTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.when.first }}</li>
                        <li>{{ ui.when.second }}</li>
                        <li>{{ ui.when.third }}</li>
                        <li>{{ ui.when.fourth }}</li>
                        <li>{{ ui.when.fifth }}</li>
                    </ul>
                    <div class="calc-note calc-note--tight" v-html="ui.whenNote"></div>
                </div>

                <div id="gl_gi"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_gi' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.giLessonTitle }}</div>
                    <div class="calc-callout-text" v-html="ui.giLessonLead"></div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.giLesson.speedLabel }}</strong> {{ ui.giLesson.speed }}</li>
                        <li><strong>{{ ui.giLesson.glLabel }}</strong> {{ ui.giLesson.gl }}</li>
                        <li>{{ ui.giLesson.portion }}</li>
                    </ul>
                    <div class="calc-note calc-note--tight" v-html="ui.giLessonNote"></div>
                </div>

                <div id="gl_gl"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_gl' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.giInputTitle }}</div>

                    <div class="gi-steps" role="list" :aria-label="ui.giInputStepsAria">
                        <div class="gi-step" role="listitem">
                            <div class="gi-step-k">{{ ui.giSteps.firstKey }}</div>
                            <div class="gi-step-v" v-html="ui.giSteps.firstValue"></div>
                        </div>

                        <div class="gi-step" role="listitem">
                            <div class="gi-step-k">{{ ui.giSteps.secondKey }}</div>
                            <div class="gi-step-v" v-html="ui.giSteps.secondValue"></div>
                        </div>

                        <div class="gi-step" role="listitem">
                            <div class="gi-step-k">{{ ui.giSteps.thirdKey }}</div>
                            <div class="gi-step-v" v-html="ui.giSteps.thirdValue"></div>
                        </div>
                    </div>

                    <div class="gi-chiprow" :aria-label="ui.giExamplesAria">
                        <span class="gi-chip"><strong>{{ ui.giExamples.bananaLabel }}</strong> {{ ui.giExamples.banana }}</span>
                        <span class="gi-chip"><strong>{{ ui.giExamples.riceLabel }}</strong> {{ ui.giExamples.rice }}</span>
                        <span class="gi-chip"><strong>{{ ui.giExamples.oatsLabel }}</strong> {{ ui.giExamples.oats }}</span>
                    </div>

                    <div class="calc-note calc-note--tight gi-note" v-html="ui.giInputNote"></div>

                    <ul class="calc-list gi-mini">
                        <li>{{ ui.giMini.first }}</li>
                        <li>{{ ui.giMini.second }}</li>
                        <li>{{ ui.giMini.third }}</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.measureTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.measure.measuresLabel }}</strong> {{ ui.measure.measures }}</li>
                            <li><strong>{{ ui.measure.partsLabel }}</strong> {{ ui.measure.parts }}</li>
                            <li><strong>{{ ui.measure.notLabel }}</strong> {{ ui.measure.not }}</li>
                        </ul>
                    </section>

                    <section id="gl_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'gl_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">GL</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaValue }}</span>
                        </div>
                        <div class="calc-note">{{ ui.formulaNote }}</div>
                    </section>

                    <section id="gl_bands"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'gl_bands' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.bandsTitle }}</h4>
                        <div class="calc-bands">
                            <div class="calc-band"><span class="calc-band-k">{{ ui.bands.lowRange }}</span><span class="calc-band-v">{{ ui.bands.low }}</span></div>
                            <div class="calc-band"><span class="calc-band-k">{{ ui.bands.mediumRange }}</span><span class="calc-band-v">{{ ui.bands.medium }}</span></div>
                            <div class="calc-band"><span class="calc-band-k">{{ ui.bands.highRange }}</span><span class="calc-band-v">{{ ui.bands.high }}</span></div>
                        </div>
                    </section>

                    <section id="gl_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'gl_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.exampleTitle }}</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>{{ ui.exampleRow }}</span>
                                <span class="calc-example-strong">{{ ui.exampleValue }}</span>
                            </div>
                            <div class="calc-example-sub">{{ ui.exampleSub }}</div>
                        </div>
                    </section>
                </div>

                <div class="calc-callout">
                    <div class="calc-callout-title">{{ ui.ignoreTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.ignore.first }}</li>
                        <li>{{ ui.ignore.second }}</li>
                        <li>{{ ui.ignore.third }}</li>
                        <li>{{ ui.ignore.fourth }}</li>
                    </ul>
                </div>

                <div id="gl_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'gl_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.limitsTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.limits.first }}</li>
                        <li>{{ ui.limits.second }}</li>
                        <li>{{ ui.limits.third }}</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">{{ ui.faqTitle }}</h4>
                    <ul class="calc-list">
                        <li><strong>{{ ui.faq.firstQ }}</strong> {{ ui.faq.firstA }}</li>
                        <li><strong>{{ ui.faq.secondQ }}</strong> {{ ui.faq.secondA }}</li>
                        <li><strong>{{ ui.faq.thirdQ }}</strong> {{ ui.faq.thirdA }}</li>
                        <li><strong>{{ ui.faq.fourthQ }}</strong> {{ ui.faq.fourthA }}</li>
                        <li><strong>{{ ui.faq.fifthQ }}</strong> {{ ui.faq.fifthA }}</li>
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

        <template #inputs="{ openInfoAndJump, maybeAutoCalc, errorFor }">
            <GlTablePopup ref="glTablePopup" @apply="applyFromGlTable" />

            <UiCalculatorInput :modelValue="food"
                               :label="ui.inputs.food"
                               :error="errorFor(['food', 'lebensmittel'])"
                               :placeholder="ui.inputs.foodPlaceholder"
                               @update:modelValue="(v: string | number) => { emit('update:glFood', String(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="serving ?? ''"
                               type="number"
                               inputmode="decimal"
                               :error="errorFor(['serving', 'portions'])"
                               :label="ui.inputs.serving"
                               :placeholder="ui.inputs.servingPlaceholder"
                               @update:modelValue="(v: string | number) => { emit('update:glServing', toNumberOrNull(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="carbs100 ?? ''"
                               type="number"
                               inputmode="decimal"
                               :error="errorFor(['carbs per 100', 'kohlenhydrate pro 100'])"
                               :label="ui.inputs.carbs100"
                               :placeholder="ui.inputs.carbs100Placeholder"
                               :hint="ui.inputs.carbs100Hint"
                               @update:modelValue="(v: string | number) => { emit('update:glCarbs100', toNumberOrNull(v)); maybeAutoCalc() }" />

            <div class="label-with-info">
                <span>{{ ui.inputs.gi }}</span>
                <button class="info-btn"
                        type="button"
                        :aria-label="ui.inputs.giAria"
                        :title="ui.inputs.giTitle"
                        @click="openInfoAndJump('gl_gi')">
                    <span class="info-emoji" aria-hidden="true">i</span>
                </button>
            </div>

            <UiCalculatorInput :modelValue="gi ?? ''"
                               type="number"
                               inputmode="decimal"
                               :error="errorFor(['glycemic index', 'glyk'])"
                               :placeholder="ui.inputs.giPlaceholder"
                               @update:modelValue="(v: string | number) => { emit('update:glGi', clampGi(toNumberOrNull(v))); maybeAutoCalc() }" />
        </template>

        <template #result>
            <div v-if="glResult !== null">
                <p>
                    <strong>{{ ui.resultLabel }}</strong> {{ glResult!.toFixed(1) }}
                    <span v-if="glCategory">- {{ ui.categoryLabel }}: {{ localizedCategory }}</span>
                    <br v-if="carbs !== null" />
                    <span v-if="carbs !== null"><strong>{{ ui.carbsPerServingLabel }}</strong> {{ carbs!.toFixed(1) }} g</span>
                </p>
            </div>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
import { useI18n } from '@/composables/useI18n'
import GlTablePopup from '@/components/ui/popups/calc/GlTablePopup.vue'
import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'
import type { GlTableItem } from '@/components/ui/popups/calc/GlTablePopup.vue'

type Category = 'niedrig' | 'mittel' | 'hoch' | 'low' | 'medium' | 'high' | string

const props = defineProps<{
    autoCalcEnabled: boolean
    glFood: string
    glServing: number | null
    glCarbs100: number | null
    glGi: number | null
    glCarbs?: number | null
    glResult: number | null
    glCategory?: Category
    isFavorite: boolean
    title?: string
    info?: string
}>()

const emit = defineEmits<{
    (e: 'toggleFavorite'): void
    (e: 'update:glFood', v: string): void
    (e: 'update:glServing', v: number | null): void
    (e: 'update:glCarbs100', v: number | null): void
    (e: 'update:glGi', v: number | null): void
    (e: 'calculate'): void
    (e: 'copy'): void
    (e: 'export'): void
    (e: 'reset'): void
    (e: 'invalid', errors: string[]): void
}>()

const { t, locale } = useI18n()

const ui = computed(() => locale.value === 'en'
    ? {
        heroAria: 'Glycemic load quick card',
        heroTitle: 'What does glycemic load mean?',
        heroSub: '<strong>Glycemic load (GL)</strong> shows <strong>how strongly one portion of food really affects blood sugar</strong>. It considers both carbohydrate speed and how much of it you actually eat.',
        quickNav: 'Quick navigation',
        overviewLabel: 'Overview',
        chips: {
            formula: 'How it is calculated',
            formulaShort: 'Formula',
            bands: 'Ranges',
            limits: 'Important',
            example: 'Example',
            table: 'GL table',
            insulin: 'Insulin',
            meaning: 'What does that mean?'
        },
        youTitle: 'Your result',
        resultLabel: 'GL per serving:',
        youTip: 'Tip: GL is best for comparing servings and meals, not for labeling foods as forbidden.',
        copyChip: 'Copy',
        summaryTitle: 'Short version',
        summaryLead: 'GL shows <strong>how much one meal can raise blood sugar</strong> based on both the <strong>type</strong> of carbs and the <strong>amount</strong> you eat.',
        summary: {
            giLabel: 'GI:',
            gi: 'how fast sugar enters the blood',
            glLabel: 'GL:',
            gl: 'the total impact of a real serving',
            noteLabel: 'Remember:',
            note: 'even “healthy” foods can hit hard if the portion is large'
        },
        nextTitle: 'What does that mean now?',
        next: {
            lowLabel: 'Low GL:',
            low: 'blood sugar usually stays steadier, often with less hunger afterward',
            mediumLabel: 'Medium GL:',
            medium: 'normal, context matters: timing, activity, and whether you eat protein or fat with it',
            highLabel: 'High GL:',
            high: 'not automatically bad, but for some people it can drive cravings or an energy dip'
        },
        insulinTitle: 'Insulin response explained',
        insulin: {
            first: 'When you eat carbohydrates, blood sugar rises.',
            second: 'Your body releases <strong>insulin</strong> so glucose can move from the blood into cells.',
            third: '<strong>Higher GL</strong> often means a stronger blood sugar response and often a stronger insulin response too.',
            fourth: '<strong>Important:</strong> insulin is not “bad”. It is a normal, essential hormone.'
        },
        insulinNote: 'Quick rule: <strong>GL</strong> describes how strongly one <strong>portion</strong> of carbohydrates typically affects blood sugar.',
        whenTitle: 'When should you actually care about GL?',
        when: {
            first: 'If you often feel sleepy after carb-heavy meals.',
            second: 'If you get hungry again fast or crave food 1-2 hours later.',
            third: 'If you are dieting and want more satiety.',
            fourth: 'If you have diabetes or insulin resistance.',
            fifth: 'If you compare meals and want to know which one keeps you fuller.'
        },
        whenNote: 'Quick win: if GL is high, reduce the portion or add <strong>protein, fat, or fiber</strong>.',
        giLessonTitle: 'Lesson: what is the glycemic index (GI)?',
        giLessonLead: 'The <strong>glycemic index (GI)</strong> describes the <strong>speed</strong> at which the carbohydrates in one food raise blood sugar compared with <strong>glucose</strong>.',
        giLesson: {
            speedLabel: 'GI = speed:',
            speed: 'how fast blood sugar rises',
            glLabel: 'GL = portion impact:',
            gl: 'speed plus the real amount eaten',
            portion: 'A high GI food can still be fine if the portion is small and GL stays low.'
        },
        giLessonNote: '<strong>GI = speed</strong>, <strong>GL = total impact of the serving</strong>.',
        giInputTitle: 'Glycemic index (0-110): which number should you enter?',
        giInputStepsAria: 'GI step by step',
        giSteps: {
            firstKey: '1) What to enter?',
            firstValue: 'Use the <strong>GI value</strong> of the food, a number from <strong>0-110</strong>.',
            secondKey: '2) Where do you get it?',
            secondValue: 'From a <strong>GI table</strong> or food database.',
            thirdKey: '3) If there are multiple values?',
            thirdValue: 'Choose the one that matches the <strong>preparation style</strong> best, for example cooked, ripe, or al dente.'
        },
        giExamplesAria: 'Quick examples',
        giExamples: {
            bananaLabel: 'Banana',
            banana: '~50-60',
            riceLabel: 'Rice',
            rice: '~50-90',
            oatsLabel: 'Oats',
            oats: 'usually lower'
        },
        giInputNote: '<strong>Not sure?</strong> Take the <strong>middle</strong> of the range. Example: <strong>50-60 -> 55</strong>.',
        giMini: {
            first: 'Riper foods often have a higher GI.',
            second: 'Softer cooking often pushes GI up; al dente can keep it lower.',
            third: 'The input is capped to the 0-110 range.'
        },
        measureTitle: 'What does GL measure?',
        measure: {
            measuresLabel: 'Measures:',
            measures: 'how strongly one real serving can affect blood sugar and often insulin',
            partsLabel: 'Built from:',
            parts: 'GI + available carbs',
            notLabel: 'Does not measure:',
            not: 'micronutrients, protein quality, or satiety one-to-one'
        },
        formulaTitle: 'Formula',
        formulaValue: '(GI × available carbs per serving) ÷ 100',
        formulaNote: 'Available carbs = total carbs minus fiber, if you know it.',
        bandsTitle: 'Categories',
        bands: {
            lowRange: 'Below 10',
            low: 'low',
            mediumRange: '10-19',
            medium: 'medium',
            highRange: '20+',
            high: 'high'
        },
        exampleTitle: 'Example',
        exampleRow: 'GI 55, 30 g available carbs',
        exampleValue: 'GL ≈ 16.5',
        exampleSub: 'That is <strong>medium</strong>. It gets lower if the portion is smaller or carbs are reduced.',
        ignoreTitle: 'When you can safely ignore the GL calculator',
        ignore: {
            first: 'Your meals are already mixed with protein, fat, and fiber.',
            second: 'You do not struggle with cravings or post-meal energy crashes.',
            third: 'Your main focus is calories, protein, and training performance.',
            fourth: 'You eat intuitively and stay consistent anyway.'
        },
        limitsTitle: 'Important limits',
        limits: {
            first: 'GI and GL tables can change with preparation method and ripeness.',
            second: 'Mixed meals with protein, fat, and fiber change the real effect.',
            third: 'Use GL for <strong>comparisons</strong>, not as a moral “good vs bad” label.'
        },
        faqTitle: 'Common questions',
        faq: {
            firstQ: 'Why is GL high even for a “healthy” food?',
            firstA: 'Because portion size and total carbs are the lever.',
            secondQ: 'Why do GI and GL differ between sources?',
            secondA: 'Ripeness, cooking style, food variety, and measurement methods.',
            thirdQ: 'What does GL have to do with insulin?',
            thirdA: 'Higher GL usually means a bigger blood sugar rise and often a bigger insulin response.',
            fourthQ: 'When should I take GL seriously?',
            fourthA: 'When you deal with hunger, cravings, crashes, or diabetes/insulin resistance.',
            fifthQ: 'How do I lower GL easily?',
            fifthA: 'Reduce the portion, add fiber or protein, and choose carbs more intentionally.'
        },
        realityTitle: 'Reality check',
        realityText: 'GL helps with <strong>portion awareness</strong>. For overall food quality, <strong>protein</strong>, <strong>fiber</strong>, and <strong>total calories</strong> still matter.',
        inputs: {
            food: 'Food *',
            foodPlaceholder: 'e.g. rice, banana ...',
            serving: 'Serving size (g) *',
            servingPlaceholder: 'e.g. 150',
            carbs100: 'Carbs per 100 g *',
            carbs100Placeholder: 'e.g. 28',
            carbs100Hint: 'If known, subtract fiber from total carbs.',
            gi: 'Glycemic index (0-110) *',
            giTitle: 'What is GI?',
            giAria: 'Open GI explanation',
            giPlaceholder: 'e.g. 55'
        },
        categoryLabel: 'Category',
        carbsPerServingLabel: 'Carbs per serving:',
        infoFallback: 'GL = (GI × available carbs per serving in g) / 100. Guideline: low < 10, medium 10-19, high ≥ 20.',
        validation: {
            food: 'Please enter a food.',
            servingMissing: 'Please enter the serving size (g).',
            servingLow: 'Serving size must be greater than 0.',
            servingHigh: 'Serving size seems unrealistically high.',
            carbsMissing: 'Please enter the carbs per 100 g.',
            carbsLow: 'Carbs per 100 g cannot be negative.',
            carbsHigh: 'Carbs per 100 g seem unrealistically high.',
            giMissing: 'Please enter the glycemic index (0-110).',
            giRange: 'Glycemic index must be between 0 and 110.'
        },
        categories: {
            low: 'low',
            medium: 'medium',
            high: 'high'
        },
        copy: {
            food: 'Food',
            serving: 'Serving size',
            carbs100: 'Carbs per 100 g',
            gi: 'Glycemic index',
            carbsServing: 'Available carbs/serving',
            gl: 'GL'
        }
    }
    : {
        heroAria: 'GL-Kurzkarte',
        heroTitle: 'Was bedeutet GL?',
        heroSub: 'Die <strong>glykämische Last (GL)</strong> zeigt, <strong>wie stark eine Portion Essen den Blutzucker wirklich beeinflusst</strong>. Sie berücksichtigt sowohl das Tempo der Kohlenhydrate als auch die Menge, die du wirklich isst.',
        quickNav: 'Schnellnavigation',
        overviewLabel: 'Kurzüberblick',
        chips: {
            formula: 'So wird es berechnet',
            formulaShort: 'Formel',
            bands: 'Bereiche',
            limits: 'Wichtig',
            example: 'Beispiel',
            table: 'GL-Tabelle',
            insulin: 'Insulin',
            meaning: 'Was heißt das?'
        },
        youTitle: 'Dein Ergebnis',
        resultLabel: 'GL pro Portion:',
        youTip: 'Tipp: GL ist am besten für Vergleiche zwischen Portionen und Meals, nicht als Verbots-Label.',
        copyChip: 'Kopieren',
        summaryTitle: 'Kurzfassung',
        summaryLead: 'GL zeigt, <strong>wie stark eine Mahlzeit den Blutzucker ansteigen lassen kann</strong>, abhängig von der <strong>Art</strong> der Kohlenhydrate und der <strong>Menge</strong>.',
        summary: {
            giLabel: 'GI:',
            gi: 'wie schnell Zucker ins Blut geht',
            glLabel: 'GL:',
            gl: 'der Gesamt-Impact einer echten Portion',
            noteLabel: 'Merke:',
            note: 'auch „gesunde“ Foods können bei großen Portionen stark wirken'
        },
        nextTitle: 'Was heißt das jetzt?',
        next: {
            lowLabel: 'Niedrige GL:',
            low: 'der Blutzucker bleibt meist stabiler und Hunger ist oft geringer',
            mediumLabel: 'Mittlere GL:',
            medium: 'normal, Kontext zählt: Timing, Aktivität und ob Protein oder Fett dabei ist',
            highLabel: 'Hohe GL:',
            high: 'nicht automatisch schlecht, kann aber bei manchen Hunger oder Cravings pushen'
        },
        insulinTitle: 'Insulin-Reaktion erklärt',
        insulin: {
            first: 'Wenn du Kohlenhydrate isst, steigt der Blutzucker.',
            second: 'Der Körper schüttet <strong>Insulin</strong> aus, damit Glukose aus dem Blut in die Zellen kommt.',
            third: '<strong>Höhere GL</strong> bedeutet oft stärkere Blutzuckerreaktion und häufig auch eine stärkere Insulinantwort.',
            fourth: '<strong>Wichtig:</strong> Insulin ist nicht schlecht, sondern ein normales und lebenswichtiges Hormon.'
        },
        insulinNote: 'Merksatz: <strong>GL</strong> beschreibt, wie stark eine <strong>Portion</strong> Kohlenhydrate den Blutzucker typischerweise beeinflusst.',
        whenTitle: 'Wann solltest du GL wirklich beachten?',
        when: {
            first: 'Wenn du nach carb-lastigen Meals oft müde wirst.',
            second: 'Wenn du schnell wieder Hunger bekommst oder 1-2 Stunden später Cravings hast.',
            third: 'Wenn du im Cut bist und mehr Sättigung willst.',
            fourth: 'Wenn du Diabetes oder Insulinresistenz hast.',
            fifth: 'Wenn du Meals vergleichen willst und wissen möchtest, was länger satt hält.'
        },
        whenNote: 'Quick Win: Wenn GL hoch ist, Portion kleiner machen oder <strong>Protein, Fett oder Ballaststoffe</strong> ergänzen.',
        giLessonTitle: 'Lektion: Was ist der glykämische Index (GI)?',
        giLessonLead: 'Der <strong>glykämische Index (GI)</strong> beschreibt das <strong>Tempo</strong>, wie schnell die Kohlenhydrate eines Lebensmittels den Blutzucker im Vergleich zu <strong>Glukose</strong> ansteigen lassen.',
        giLesson: {
            speedLabel: 'GI = Tempo:',
            speed: 'wie schnell der Blutzucker steigt',
            glLabel: 'GL = Portionswirkung:',
            gl: 'Tempo plus die tatsächlich gegessene Menge',
            portion: 'Ein hoher GI kann trotzdem okay sein, wenn die Portion klein ist und GL niedrig bleibt.'
        },
        giLessonNote: '<strong>GI = Tempo</strong>, <strong>GL = Gesamt-Impact der Portion</strong>.',
        giInputTitle: 'Glykämischer Index (0-110): welche Zahl solltest du eingeben?',
        giInputStepsAria: 'GI Schritt für Schritt',
        giSteps: {
            firstKey: '1) Was eingeben?',
            firstValue: 'Den <strong>GI-Wert</strong> des Lebensmittels, also eine Zahl zwischen <strong>0-110</strong>.',
            secondKey: '2) Woher nehmen?',
            secondValue: 'Aus einer <strong>GI-Tabelle</strong> oder einer passenden Lebensmitteldatenbank.',
            thirdKey: '3) Wenn es mehrere Werte gibt?',
            thirdValue: 'Nimm den Wert, der am besten zur <strong>Zubereitung</strong> passt, zum Beispiel gekocht, reif oder al dente.'
        },
        giExamplesAria: 'Schnelle Beispiele',
        giExamples: {
            bananaLabel: 'Banane',
            banana: '~50-60',
            riceLabel: 'Reis',
            rice: '~50-90',
            oatsLabel: 'Hafer',
            oats: 'meist eher niedriger'
        },
        giInputNote: '<strong>Unsicher?</strong> Nimm die <strong>Mitte</strong> der Range. Beispiel: <strong>50-60 -> 55</strong>.',
        giMini: {
            first: 'Reifere Lebensmittel haben oft einen höheren GI.',
            second: 'Weicher gekocht erhöht oft den GI; al dente kann ihn niedriger halten.',
            third: 'Die Eingabe wird automatisch auf 0-110 begrenzt.'
        },
        measureTitle: 'Was misst GL?',
        measure: {
            measuresLabel: 'Misst:',
            measures: 'wie stark eine echte Portion Blutzucker und oft auch Insulin beeinflussen kann',
            partsLabel: 'Bausteine:',
            parts: 'GI + verfügbare Kohlenhydrate',
            notLabel: 'Misst nicht:',
            not: 'Mikronährstoffe, Proteinqualität oder Sättigung eins zu eins'
        },
        formulaTitle: 'Formel',
        formulaValue: '(GI × verfügbare KH pro Portion) ÷ 100',
        formulaNote: 'Verfügbare KH = Gesamt-Kohlenhydrate minus Ballaststoffe, wenn du sie kennst.',
        bandsTitle: 'Kategorien',
        bands: {
            lowRange: 'Unter 10',
            low: 'niedrig',
            mediumRange: '10-19',
            medium: 'mittel',
            highRange: '20+',
            high: 'hoch'
        },
        exampleTitle: 'Beispiel',
        exampleRow: 'GI 55, 30 g verfügbare KH',
        exampleValue: 'GL ≈ 16,5',
        exampleSub: 'Das ist <strong>mittel</strong>. Es wird niedriger, wenn die Portion kleiner ist oder weniger Kohlenhydrate enthält.',
        ignoreTitle: 'Wann du den GL-Rechner locker ignorieren darfst',
        ignore: {
            first: 'Deine Meals sind sowieso gemischt mit Protein, Fett und Ballaststoffen.',
            second: 'Du hast keine Probleme mit Cravings oder Energie-Crashs nach Meals.',
            third: 'Dein Hauptfokus liegt auf Kalorien, Protein und Trainingsleistung.',
            fourth: 'Du isst intuitiv und bleibst ohnehin konstant.'
        },
        limitsTitle: 'Wichtige Grenzen',
        limits: {
            first: 'GI- und GL-Tabellen verändern sich je nach Zubereitung und Reifegrad.',
            second: 'Gemischte Meals mit Protein, Fett und Ballaststoffen verändern die echte Wirkung.',
            third: 'Nutze GL für <strong>Vergleiche</strong>, nicht als moralisches „gut oder böse“-Label.'
        },
        faqTitle: 'Häufige Fragen',
        faq: {
            firstQ: 'Warum ist GL trotz „gesundem“ Food hoch?',
            firstA: 'Weil Portion und Gesamtmenge der Kohlenhydrate der eigentliche Hebel sind.',
            secondQ: 'Warum unterscheiden sich GI und GL je nach Quelle?',
            secondA: 'Durch Reifegrad, Zubereitung, Sorte und Messmethode.',
            thirdQ: 'Was hat GL mit Insulin zu tun?',
            thirdA: 'Höhere GL bedeutet meist stärkeren Blutzuckeranstieg und oft mehr Insulinantwort.',
            fourthQ: 'Wann sollte ich GL ernst nehmen?',
            fourthA: 'Bei Hunger, Cravings, Crashs oder Diabetes/Insulinresistenz.',
            fifthQ: 'Wie senke ich GL einfach?',
            fifthA: 'Portion verkleinern, Ballaststoffe oder Protein ergänzen und Kohlenhydrate bewusster wählen.'
        },
        realityTitle: 'Reality-Check',
        realityText: 'GL hilft bei <strong>Portionsbewusstsein</strong>. Für die Gesamtqualität von Essen zählen trotzdem <strong>Protein</strong>, <strong>Ballaststoffe</strong> und <strong>Gesamtkalorien</strong>.',
        inputs: {
            food: 'Lebensmittel *',
            foodPlaceholder: 'z. B. Reis, Banane ...',
            serving: 'Portionsgröße (g) *',
            servingPlaceholder: 'z. B. 150',
            carbs100: 'Kohlenhydrate pro 100 g *',
            carbs100Placeholder: 'z. B. 28',
            carbs100Hint: 'Falls bekannt, Ballaststoffe von den Gesamt-Kohlenhydraten abziehen.',
            gi: 'Glykämischer Index (0-110) *',
            giTitle: 'Was ist GI?',
            giAria: 'GI-Erklärung öffnen',
            giPlaceholder: 'z. B. 55'
        },
        categoryLabel: 'Kategorie',
        carbsPerServingLabel: 'Kohlenhydrate pro Portion:',
        infoFallback: 'GL = (GI × verfügbare Kohlenhydrate pro Portion in g) / 100. Richtwert: niedrig < 10, mittel 10-19, hoch ≥ 20.',
        validation: {
            food: 'Bitte gib ein Lebensmittel ein.',
            servingMissing: 'Bitte gib die Portionsgröße (g) ein.',
            servingLow: 'Portionsgröße muss größer als 0 sein.',
            servingHigh: 'Portionsgröße wirkt unrealistisch hoch.',
            carbsMissing: 'Bitte gib die Kohlenhydrate pro 100 g ein.',
            carbsLow: 'Kohlenhydrate pro 100 g dürfen nicht negativ sein.',
            carbsHigh: 'Kohlenhydrate pro 100 g wirken unrealistisch hoch.',
            giMissing: 'Bitte gib den glykämischen Index (0-110) ein.',
            giRange: 'Der glykämische Index muss zwischen 0 und 110 liegen.'
        },
        categories: {
            low: 'niedrig',
            medium: 'mittel',
            high: 'hoch'
        },
        copy: {
            food: 'Lebensmittel',
            serving: 'Portionsgröße',
            carbs100: 'Kohlenhydrate pro 100 g',
            gi: 'Glykämischer Index',
            carbsServing: 'Verfügbare KH/Portion',
            gl: 'GL'
        }
    })

const food = computed(() => props.glFood)
const serving = computed(() => props.glServing)
const carbs100 = computed(() => props.glCarbs100)
const gi = computed(() => props.glGi)
const carbs = computed(() => props.glCarbs ?? null)

const glTablePopup = ref<{ open?: () => void } | null>(null)

function openGlTable() {
    glTablePopup.value?.open?.()
}

const localizedCategory = computed(() => {
    const raw = String(props.glCategory ?? '').trim().toLowerCase()
    if (!raw) return ''
    if (raw === 'niedrig' || raw === 'low') return ui.value.categories.low
    if (raw === 'mittel' || raw === 'medium') return ui.value.categories.medium
    if (raw === 'hoch' || raw === 'high') return ui.value.categories.high
    return props.glCategory ?? ''
})

const copyText = computed<string | null>(() => {
    if (props.glResult == null) return null

    const parts: string[] = []
    if (food.value?.trim()) parts.push(`${ui.value.copy.food}: ${food.value.trim()}`)
    if (serving.value != null) parts.push(`${ui.value.copy.serving}: ${serving.value} g`)
    if (carbs100.value != null) parts.push(`${ui.value.copy.carbs100}: ${carbs100.value} g`)
    if (gi.value != null) parts.push(`${ui.value.copy.gi}: ${gi.value}`)
    if (carbs.value != null) parts.push(`${ui.value.copy.carbsServing}: ${carbs.value.toFixed(1)} g`)
    parts.push(`${ui.value.copy.gl}: ${props.glResult.toFixed(1)}${props.glCategory ? ` (${localizedCategory.value})` : ''}`)
    return parts.join(' | ')
})

function applyFromGlTable(item: GlTableItem) {
    emit('update:glFood', t(item.labelKey))
    emit('update:glGi', item.gi)
    emit('update:glCarbs100', item.carbs100)
    emit('update:glServing', 100)
}

const infoText = computed(() => props.info ?? ui.value.infoFallback)

function toNumberOrNull(v: string | number) {
    const raw = String(v).trim().replace(/\s+/g, '').replace(',', '.')
    if (raw === '') return null
    const num = Number(raw)
    return Number.isFinite(num) ? num : null
}

function clampGi(v: number | null) {
    if (v == null) return null
    return Math.min(110, Math.max(0, v))
}

function validateGl(): string[] {
    const errors: string[] = []

    if (!String(props.glFood ?? '').trim()) errors.push(ui.value.validation.food)

    const s = props.glServing
    if (s == null || Number.isNaN(s)) errors.push(ui.value.validation.servingMissing)
    else if (s <= 0) errors.push(ui.value.validation.servingLow)
    else if (s > 5000) errors.push(ui.value.validation.servingHigh)

    const c100 = props.glCarbs100
    if (c100 == null || Number.isNaN(c100)) errors.push(ui.value.validation.carbsMissing)
    else if (c100 < 0) errors.push(ui.value.validation.carbsLow)
    else if (c100 > 200) errors.push(ui.value.validation.carbsHigh)

    const g = props.glGi
    if (g == null || Number.isNaN(g)) errors.push(ui.value.validation.giMissing)
    else if (g < 0 || g > 110) errors.push(ui.value.validation.giRange)

    return errors
}
</script>

<style scoped>
    .gi-steps {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: .6rem;
        margin-top: .35rem;
    }

    .gi-step {
        padding: .7rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-secondary) 88%, transparent);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
    }

    .gi-step-k {
        font-size: .78rem;
        font-weight: 700;
        letter-spacing: .02em;
        color: var(--text-secondary);
        margin-bottom: .25rem;
    }

    .gi-step-v {
        font-size: .92rem;
        line-height: 1.35;
        color: var(--text-primary);
    }

    .gi-chiprow {
        display: flex;
        flex-wrap: wrap;
        gap: .45rem;
        margin-top: .6rem;
    }

    .gi-chip {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        padding: .35rem .55rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-secondary) 80%, transparent);
        font-size: .82rem;
        color: var(--text-primary);
    }

    .gi-note {
        margin-top: .65rem;
    }

    .gi-mini {
        margin-top: .35rem;
    }

    .label-with-info {
        display: inline-flex;
        align-items: center;
        gap: .35rem;
        width: fit-content;
    }

    @media (max-width: 700px) {
        .gi-steps {
            grid-template-columns: 1fr;
        }
    }
</style>
