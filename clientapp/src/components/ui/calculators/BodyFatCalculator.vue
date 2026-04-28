<!-- src/components/ui/calculators/BodyFatCalculator.vue -->
<template>
    <BaseCalculator :title="title || t('progress.calculators.bodyFat.title')"
                    :showInfo="!!infoText"
                    :infoTitle="t('progress.calculators.bodyFat.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
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

        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" :aria-label="ui.heroAria">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">{{ ui.heroTitle }}</span>
                </div>

                <div class="calc-hero-sub" v-html="ui.heroSubtitle"></div>

                <div class="calc-hero-pills" :aria-label="ui.quickNavLabel">
                    <button class="calc-chip" type="button" @click="jumpTo('bf_tracking')">{{ ui.chips.tracking }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('bf_formula')">{{ ui.chips.formula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('bf_bands')">{{ ui.chips.bands }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('bf_limits')">{{ ui.chips.limits }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="result !== null"
                     id="bf_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'bf_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>{{ ui.resultLabel }}</strong> {{ result!.toFixed(1) }}% -
                            <strong>{{ kfaLabel }}</strong>
                        </div>

                        <div class="bf-tip">{{ ui.resultTip }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('bf_next')">{{ ui.whatNowButton }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('bf_limits')">{{ ui.chips.limits }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.overviewLabel">
                    <button class="calc-chip" type="button" @click="jumpTo('bf_tracking')">{{ ui.chips.tracking }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('bf_formula')">{{ ui.chips.formula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('bf_example')">{{ ui.chips.example }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('bf_bands')">{{ ui.chips.bands }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('bf_limits')">{{ ui.chips.limits }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="result === null"
                            :aria-disabled="result === null"
                            :class="{ 'is-disabled': result === null }"
                            :title="result !== null ? t('progress.chart.exportShort') : t('progress.calculators.copyHint')"
                            @click="() => { onCopy?.(); jumpTo('bf_you') }">
                        {{ ui.copyChip }}
                    </button>
                </div>

                <div id="bf_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'bf_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.shortTitle }}</div>
                    <div class="calc-callout-text">
                        <div v-html="ui.shortLead"></div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.shortBullets.goodLabel }}</strong> {{ ui.shortBullets.good }}</li>
                            <li><strong>{{ ui.shortBullets.butLabel }}</strong> {{ ui.shortBullets.but }}</li>
                            <li><strong>{{ ui.shortBullets.noteLabel }}</strong> {{ ui.shortBullets.note }}</li>
                        </ul>
                    </div>
                </div>

                <div id="bf_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'bf_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.whatNowTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.whatNow.highLabel }}</strong> {{ ui.whatNow.high }}</li>
                        <li><strong>{{ ui.whatNow.lowLabel }}</strong> {{ ui.whatNow.low }}</li>
                        <li><strong>{{ ui.whatNow.stableLabel }}</strong> {{ ui.whatNow.stable }}</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.whoForTitle }}</h4>
                        <ul class="calc-list">
                            <li>{{ ui.whoFor.goodTrack }}</li>
                            <li>{{ ui.whoFor.goodSkinnyFat }}</li>
                            <li>{{ ui.whoFor.caution }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.methodTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.methodUseLabel }}</strong> {{ ui.methodUse }}</li>
                            <li><strong>{{ ui.methodEstimateLabel }}</strong> {{ ui.methodEstimate }}</li>
                            <li><strong>{{ ui.methodImportantLabel }}</strong> {{ ui.methodImportant }}</li>
                        </ul>
                    </section>

                    <section id="bf_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'bf_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>

                        <div class="calc-note" v-html="ui.formulaNote"></div>

                        <div class="calc-formula calc-formula--first">
                            <span class="calc-formula-k">{{ ui.formulaMaleLabel }}</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76</span>
                        </div>

                        <div class="calc-formula">
                            <span class="calc-formula-k">{{ ui.formulaFemaleLabel }}</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387</span>
                        </div>

                        <div class="calc-note calc-note--spaced" v-html="ui.formulaTip"></div>
                    </section>

                    <section id="bf_bands"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'bf_bands' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.bandsTitle }}</h4>

                        <div class="calc-bands">
                            <div class="calc-band" v-for="b in bands" :key="b.k">
                                <span class="calc-band-k">{{ b.k }}</span>
                                <span class="calc-band-v">{{ b.v }}</span>
                            </div>
                        </div>

                        <div class="calc-note calc-note--spaced" v-html="ui.bandsNote"></div>
                    </section>

                    <section id="bf_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'bf_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.exampleTitle }}</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>{{ ui.exampleRow }}</span>
                                <span class="calc-example-strong">{{ ui.exampleValue }}</span>
                            </div>
                            <div class="calc-example-sub" v-html="ui.exampleSub"></div>
                        </div>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.vsBmiTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.vsBmi.bmiLabel }}</strong> {{ ui.vsBmi.bmi }}</li>
                            <li><strong>{{ ui.vsBmi.bfLabel }}</strong> {{ ui.vsBmi.bf }}</li>
                            <li><strong>{{ ui.vsBmi.noteLabel }}</strong> <span v-html="ui.vsBmi.note"></span></li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.measureRightTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.measureRight.waistLabel }}</strong> {{ ui.measureRight.waist }}</li>
                            <li><strong>{{ ui.measureRight.neckLabel }}</strong> {{ ui.measureRight.neck }}</li>
                            <li><strong>{{ ui.measureRight.hipLabel }}</strong> {{ ui.measureRight.hip }}</li>
                        </ul>
                    </section>

                    <div id="bf_tracking"
                         class="calc-callout"
                         :class="{ 'calc-target': activeTargetId === 'bf_tracking' }"
                         tabindex="-1">
                        <div class="calc-callout-title">{{ ui.trackingTitle }}</div>
                        <ul class="calc-list">
                            <li><strong>{{ ui.tracking.onlyTrendLabel }}</strong> {{ ui.tracking.onlyTrend }}</li>
                            <li><strong>{{ ui.tracking.onceWeekLabel }}</strong> {{ ui.tracking.onceWeek }}</li>
                            <li><strong>{{ ui.tracking.bestComboLabel }}</strong> <span v-html="ui.tracking.bestCombo"></span></li>
                            <li><strong>{{ ui.tracking.ifItJumpsLabel }}</strong> {{ ui.tracking.ifItJumps }}</li>
                        </ul>
                    </div>
                </div>

                <div class="calc-callout">
                    <div class="calc-callout-title">{{ ui.ignoreTitle }}</div>
                    <ul class="calc-list">
                        <li v-html="ui.ignoreRows.first"></li>
                        <li v-html="ui.ignoreRows.second"></li>
                        <li>{{ ui.ignoreRows.third }}</li>
                    </ul>
                </div>

                <div id="bf_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'bf_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.limitsTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.limits.errorLabel }}</strong> {{ ui.limits.error }}</li>
                        <li><strong>{{ ui.limits.waterLabel }}</strong> {{ ui.limits.water }}</li>
                        <li><strong>{{ ui.limits.trendLabel }}</strong> {{ ui.limits.trend }}</li>
                    </ul>
                </div>

                <div class="calc-callout">
                    <div class="calc-callout-title">{{ ui.faqTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.faq.jumpQuestion }}</strong> {{ ui.faq.jumpAnswer }}</li>
                        <li><strong>{{ ui.faq.betterQuestion }}</strong> {{ ui.faq.betterAnswer }}</li>
                        <li><strong>{{ ui.faq.howOftenQuestion }}</strong> {{ ui.faq.howOftenAnswer }}</li>
                    </ul>
                </div>
            </div>
        </template>

        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">{{ ui.miniTitle }}</div>
                <div class="calc-mini-text" v-html="ui.miniText"></div>
            </div>
        </template>

        <template #inputs="{ UiCalculatorInput, maybeAutoCalc, errorFor }">
            <UiCalculatorInput :modelValue="gender"
                               as="select"
                               :label="ui.inputs.gender"
                               :error="errorFor('gender')"
                               :options="genderOptions"
                               @change="(v: string | number) => { emit('update:bodyFatGender', v as Gender); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="waist ?? ''"
                               type="number"
                               :label="ui.inputs.waist"
                               :placeholder="ui.inputs.waistPlaceholder"
                               inputmode="decimal"
                               :error="errorFor(['waist', 'invalid measurements'])"
                               @update:modelValue="(v: string | number) => { emit('update:bodyFatWaist', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="neck ?? ''"
                               type="number"
                               :label="ui.inputs.neck"
                               :placeholder="ui.inputs.neckPlaceholder"
                               inputmode="decimal"
                               :error="errorFor(['neck', 'invalid measurements'])"
                               @update:modelValue="(v: string | number) => { emit('update:bodyFatNeck', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput v-if="gender === 'female'"
                               :modelValue="hip ?? ''"
                               type="number"
                               :label="ui.inputs.hip"
                               :placeholder="ui.inputs.hipPlaceholder"
                               inputmode="decimal"
                               :error="errorFor(['hip', 'invalid measurements'])"
                               @update:modelValue="(v: string | number) => { emit('update:bodyFatHip', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               type="number"
                               :label="ui.inputs.height"
                               :placeholder="ui.inputs.heightPlaceholder"
                               inputmode="numeric"
                               :error="errorFor('height')"
                               @update:modelValue="(v: string | number) => { emit('update:bodyFatHeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />
        </template>

        <template #result>
            <p v-if="result !== null"><strong>{{ ui.resultLabel }}</strong> {{ result!.toFixed(1) }}%</p>
        </template>

        <template #result-sub>
            <p v-if="result !== null" class="hint">{{ ui.resultSub }}</p>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
import { useI18n } from '@/composables/useI18n'
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

const { t, locale } = useI18n()

type BandRow = { k: string; v: string }

const ui = computed(() => {
    if (locale.value === 'en') {
        return {
            heroAria: 'Body fat quick card',
            heroTitle: 'What does your body fat % actually mean?',
            heroSubtitle: 'Body fat % estimates <strong>how much of your body is fat mass</strong> using <strong>circumference measurements</strong> (waist/neck, and hip for women) plus <strong>height</strong> via the US Navy method.',
            quickNavLabel: 'Quick navigation',
            overviewLabel: 'Overview',
            chips: {
                tracking: 'Tracking',
                formula: 'How it is calculated',
                bands: 'Ranges',
                limits: 'Limits',
                example: 'Example'
            },
            youTitle: 'Your result',
            resultLabel: 'Body fat:',
            resultTip: 'Tip: track the trend, not a single reading.',
            whatNowButton: 'What does that mean?',
            copyChip: 'Copy',
            shortTitle: 'Short version',
            shortLead: 'Body fat % estimates <strong>what share of your body weight is fat</strong>.',
            shortBullets: {
                goodLabel: 'Useful:',
                good: 'much closer to your actual physique than BMI',
                butLabel: 'But:',
                but: 'measurement error is normal (1-3% is easy)',
                noteLabel: 'Remember:',
                note: 'same time, same setup, same tape placement = the best comparison'
            },
            whatNowTitle: 'What does that mean now?',
            whatNow: {
                highLabel: 'Higher than desired:',
                high: 'use a calorie deficit, daily steps, and keep strength training in place',
                lowLabel: 'Very low:',
                low: 'watch performance and recovery, do not keep cutting blindly',
                stableLabel: 'Stable:',
                stable: 'focus on strength, sleep, and routine consistency'
            },
            whoForTitle: 'Who is body fat tracking useful for?',
            whoFor: {
                goodTrack: 'Good: tracking fat loss over time',
                goodSkinnyFat: 'Good: spotting a “skinny-fat” look that BMI can miss',
                caution: 'Caution: do not overreact to one isolated reading'
            },
            methodTitle: 'What does the US Navy method estimate?',
            methodUseLabel: 'Uses:',
            methodUse: 'circumference measurements plus height',
            methodEstimateLabel: 'Estimates:',
            methodEstimate: 'body fat percentage, not a direct measurement',
            methodImportantLabel: 'Important:',
            methodImportant: 'tape placement and relaxed posture decide accuracy',
            formulaTitle: 'Formula',
            formulaNote: 'Method: <strong>US Navy</strong> (circumferences + height). Important: <strong>all values in cm</strong>, and log means <strong>log10</strong>.',
            formulaMaleLabel: 'Men',
            formulaFemaleLabel: 'Women',
            formulaTip: 'Tip: always measure the <strong>same way</strong> (same spot, same time, relaxed) or 1-3% swings are completely normal.',
            bandsTitle: 'Rough ranges',
            bandsNote: 'These categories are <strong>guidelines</strong>. The right target depends on health, sport, recovery, and how you function day to day.',
            exampleTitle: 'Example',
            exampleRow: '180 cm - waist 85 - neck 38',
            exampleValue: 'about 16%',
            exampleSub: 'This is only an <strong>example value</strong>. Measurement style, <strong>water retention</strong>, and <strong>timing</strong> can easily shift the result by 1-3%.',
            vsBmiTitle: 'Body fat vs BMI',
            vsBmi: {
                bmiLabel: 'BMI:',
                bmi: 'weight and height only, fast but often misleading for muscular people',
                bfLabel: 'Body fat %:',
                bf: 'a body-fat estimate that is closer to real shape than BMI',
                noteLabel: 'Remember:',
                note: 'for cutting and physique tracking, <strong>body fat % + waist + progress photos</strong> beats BMI'
            },
            measureRightTitle: 'How to measure correctly',
            measureRight: {
                waistLabel: 'Waist:',
                waist: 'place the tape around your stomach at belly-button height, breathe out normally, and do not suck in',
                neckLabel: 'Neck:',
                neck: 'measure directly below the Adam’s apple with the tape level but not tight',
                hipLabel: 'Hip (women only):',
                hip: 'measure around the widest point of the glutes/hips'
            },
            trackingTitle: 'How to track body fat correctly',
            tracking: {
                onlyTrendLabel: 'Only the trend matters:',
                onlyTrend: 'a single reading can easily be off by 1-3%',
                onceWeekLabel: 'Once per week is enough:',
                onceWeek: 'same day, same time, same conditions',
                bestComboLabel: 'Best combo:',
                bestCombo: '<strong>body fat % + waist + progress photos</strong> gives the most useful picture',
                ifItJumpsLabel: 'If it jumps:',
                ifItJumps: 'salt, water, sleep, digestion, or sloppy measuring can cause that'
            },
            ignoreTitle: 'When you can safely ignore this calculator',
            ignoreRows: {
                first: 'You already track <strong>waist</strong>, <strong>photos</strong>, and <strong>performance</strong> consistently',
                second: 'You measured while <strong>pumped, dehydrated, salty, bloated, or sleep-deprived</strong>',
                third: 'You do not measure with the same spot, tension, and timing each time'
            },
            limitsTitle: 'Important limits',
            limits: {
                errorLabel: 'Measurement error:',
                error: '1-3% deviation is normal',
                waterLabel: 'Hydration and salt:',
                water: 'can change circumference readings and shift the estimate',
                trendLabel: 'Trend over time:',
                trend: 'same conditions matter much more than one score'
            },
            faqTitle: 'Common questions',
            faq: {
                jumpQuestion: 'Why does my value jump around?',
                jumpAnswer: 'Measurement differences, water retention, digestion, and timing.',
                betterQuestion: 'What is better than the US Navy method?',
                betterAnswer: 'DEXA, well-done skinfold measurements, or photos plus waist tracking.',
                howOftenQuestion: 'How often should I measure?',
                howOftenAnswer: 'Usually once per week is enough.'
            },
            miniTitle: 'Reality check',
            miniText: 'Body fat % is great for trend tracking. For real context, use <strong>waist</strong>, <strong>photos</strong>, and <strong>performance</strong> too.',
            inputs: {
                gender: 'Sex *',
                waist: 'Waist circumference (cm) *',
                waistPlaceholder: 'e.g. 85',
                neck: 'Neck circumference (cm) *',
                neckPlaceholder: 'e.g. 38',
                hip: 'Hip circumference (cm) *',
                hipPlaceholder: 'e.g. 95',
                height: 'Height (cm) *',
                heightPlaceholder: 'e.g. 170'
            },
            resultSub: 'Formula: US Navy method',
            labels: {
                male: 'Male',
                female: 'Female',
                lean: 'athletic / very lean',
                fit: 'fit / normal',
                elevated: 'elevated',
                high: 'high'
            },
            validation: {
                genderRequired: 'Sex must be selected',
                waistPositive: 'Waist circumference must be greater than 0',
                neckPositive: 'Neck circumference must be greater than 0',
                heightPositive: 'Height must be greater than 0',
                hipPositive: 'Hip circumference must be greater than 0',
                invalidFemale: 'Invalid measurements: waist + hip must be greater than neck',
                invalidMale: 'Invalid measurements: waist must be greater than neck'
            },
            infoFallback: 'US Navy method: uses waist and neck circumference (plus hip for women) together with height to estimate body fat percentage.'
        }
    }

    return {
        heroAria: 'Körperfett-Kurzkarte',
        heroTitle: 'Was bedeutet dein Körperfett eigentlich?',
        heroSubtitle: 'Der KFA schätzt <strong>wie viel deines Körpers Fettmasse ist</strong> anhand von <strong>Umfängen</strong> (Bauch/Hals, bei Frauen zusätzlich Hüfte) plus <strong>Körpergröße</strong> über die US-Navy-Methode.',
        quickNavLabel: 'Schnellnavigation',
        overviewLabel: 'Kurzüberblick',
        chips: {
            tracking: 'Tracking',
            formula: 'So wird es berechnet',
            bands: 'Bereiche',
            limits: 'Grenzen',
            example: 'Beispiel'
        },
        youTitle: 'Dein Ergebnis',
        resultLabel: 'Körperfett:',
        resultTip: 'Tipp: lieber den Trend tracken als eine Einzelmessung.',
        whatNowButton: 'Was heißt das?',
        copyChip: 'Kopieren',
        shortTitle: 'Kurzfassung',
        shortLead: 'Der KFA schätzt <strong>wie viel Prozent deines Körpers Fett ist</strong>.',
        shortBullets: {
            goodLabel: 'Gut:',
            good: 'deutlich näher an deiner Form als der BMI',
            butLabel: 'Aber:',
            but: 'Messfehler sind normal (1-3% sind schnell drin)',
            noteLabel: 'Merke:',
            note: 'gleiche Zeit, gleiche Bedingungen, gleiche Messstellen = bester Vergleich'
        },
        whatNowTitle: 'Was heißt das jetzt?',
        whatNow: {
            highLabel: 'Zu hoch:',
            high: 'Defizit, Schritte und Krafttraining sauber beibehalten',
            lowLabel: 'Sehr niedrig:',
            low: 'Performance und Erholung im Blick behalten, nicht blind weiter cutten',
            stableLabel: 'Stabil:',
            stable: 'Fokus auf Kraft, Schlaf und Routine'
        },
        whoForTitle: 'Für wen ist KFA sinnvoll?',
        whoFor: {
            goodTrack: 'Gut: Fettverlust über die Zeit verfolgen',
            goodSkinnyFat: 'Gut: „Skinny-Fat“ erkennen, das der BMI oft übersieht',
            caution: 'Vorsicht: einzelne Messung nicht überbewerten'
        },
        methodTitle: 'Was schätzt die US-Navy-Methode?',
        methodUseLabel: 'Nutzen:',
        methodUse: 'Umfänge plus Körpergröße',
        methodEstimateLabel: 'Schätzt:',
        methodEstimate: 'den Körperfettanteil, keine direkte Messung',
        methodImportantLabel: 'Wichtig:',
        methodImportant: 'Messstelle und entspanntes Messen entscheiden über die Genauigkeit',
        formulaTitle: 'Formel',
        formulaNote: 'Methode: <strong>US Navy</strong> (Umfänge + Körpergröße). Wichtig: <strong>alle Werte in cm</strong>, Log bedeutet <strong>log10</strong>.',
        formulaMaleLabel: 'Männer',
        formulaFemaleLabel: 'Frauen',
        formulaTip: 'Tipp: immer <strong>gleich messen</strong> (gleiche Stelle, gleiche Uhrzeit, entspannt), sonst sind 1-3% Sprünge normal.',
        bandsTitle: 'Grobe Einordnung',
        bandsNote: 'Die Kategorien sind <strong>Richtwerte</strong>. Das passende Ziel hängt von Gesundheit, Sport, Erholung und Alltag ab.',
        exampleTitle: 'Beispiel',
        exampleRow: '180 cm - Bauch 85 - Hals 38',
        exampleValue: 'ca. 16%',
        exampleSub: 'Das ist nur ein <strong>Beispielwert</strong>. Messweise, <strong>Wasserhaushalt</strong> und <strong>Zeitpunkt</strong> können das Ergebnis leicht um 1-3% verschieben.',
        vsBmiTitle: 'Körperfett vs. BMI',
        vsBmi: {
            bmiLabel: 'BMI:',
            bmi: 'nur Gewicht und Größe, schnell aber bei Muskulösen oft irreführend',
            bfLabel: 'KFA:',
            bf: 'eine Körperfett-Schätzung, die näher an der echten Form liegt als BMI',
            noteLabel: 'Merke:',
            note: 'für Cut und Form-Tracking schlägt <strong>KFA + Taille + Fortschrittsfotos</strong> den BMI'
        },
        measureRightTitle: 'So misst du richtig',
        measureRight: {
            waistLabel: 'Bauch:',
            waist: 'Maßband auf Höhe des Bauchnabels anlegen, normal ausatmen und nicht einziehen',
            neckLabel: 'Hals:',
            neck: 'direkt unter dem Adamsapfel messen, gerade führen und nicht zu eng ziehen',
            hipLabel: 'Hüfte (nur Frauen):',
            hip: 'an der breitesten Stelle von Hüfte bzw. Gesäß messen'
        },
        trackingTitle: 'KFA richtig tracken',
        tracking: {
            onlyTrendLabel: 'Nur der Trend zählt:',
            onlyTrend: 'eine einzelne Messung kann leicht 1-3% danebenliegen',
            onceWeekLabel: '1x pro Woche reicht:',
            onceWeek: 'gleicher Tag, gleiche Uhrzeit, gleiche Bedingungen',
            bestComboLabel: 'Beste Kombi:',
            bestCombo: '<strong>KFA + Taille + Fortschrittsfotos</strong> liefert das beste Gesamtbild',
            ifItJumpsLabel: 'Wenn es springt:',
            ifItJumps: 'Salz, Wasser, Schlaf, Verdauung oder ungenaues Messen können das verursachen'
        },
        ignoreTitle: 'Wann du den Rechner entspannt ignorieren kannst',
        ignoreRows: {
            first: 'Du trackst bereits konsequent <strong>Taille</strong>, <strong>Fotos</strong> und <strong>Leistung</strong>',
            second: 'Du hast im Zustand <strong>aufgepumpt, dehydriert, salzig, aufgebläht oder mit wenig Schlaf</strong> gemessen',
            third: 'Du misst nicht jedes Mal an derselben Stelle, mit derselben Spannung und demselben Timing'
        },
        limitsTitle: 'Wichtige Grenzen',
        limits: {
            errorLabel: 'Messfehler:',
            error: '1-3% Abweichung sind normal',
            waterLabel: 'Hydration und Salz:',
            water: 'können Umfänge verändern und den Wert verschieben',
            trendLabel: 'Trend über Zeit:',
            trend: 'gleiche Bedingungen sind wichtiger als eine Einzelzahl'
        },
        faqTitle: 'Häufige Fragen',
        faq: {
            jumpQuestion: 'Warum springt mein Wert?',
            jumpAnswer: 'Messunterschiede, Wasserhaushalt, Verdauung und Timing.',
            betterQuestion: 'Was ist besser als die US-Navy-Methode?',
            betterAnswer: 'DEXA, gut gemessene Hautfalten oder Fotos plus Taillentracking.',
            howOftenQuestion: 'Wie oft sollte ich messen?',
            howOftenAnswer: 'Meistens reicht einmal pro Woche.'
        },
        miniTitle: 'Reality-Check',
        miniText: 'KFA ist stark fürs Trend-Tracking. Für echte Einordnung nutze zusätzlich <strong>Taille</strong>, <strong>Fotos</strong> und <strong>Leistung</strong>.',
        inputs: {
            gender: 'Geschlecht *',
            waist: 'Bauchumfang (cm) *',
            waistPlaceholder: 'z. B. 85',
            neck: 'Halsumfang (cm) *',
            neckPlaceholder: 'z. B. 38',
            hip: 'Hüftumfang (cm) *',
            hipPlaceholder: 'z. B. 95',
            height: 'Körpergröße (cm) *',
            heightPlaceholder: 'z. B. 170'
        },
        resultSub: 'Formel: US-Navy-Methode',
        labels: {
            male: 'Männlich',
            female: 'Weiblich',
            lean: 'athletisch / sehr lean',
            fit: 'fit / normal',
            elevated: 'erhöht',
            high: 'hoch'
        },
        validation: {
            genderRequired: 'Geschlecht muss ausgewählt sein',
            waistPositive: 'Bauchumfang muss größer als 0 sein',
            neckPositive: 'Halsumfang muss größer als 0 sein',
            heightPositive: 'Körpergröße muss größer als 0 sein',
            hipPositive: 'Hüftumfang muss größer als 0 sein',
            invalidFemale: 'Ungültige Maße: Bauch + Hüfte muss größer als Hals sein',
            invalidMale: 'Ungültige Maße: Bauchumfang muss größer als Halsumfang sein'
        },
        infoFallback: 'US-Navy-Methode: nutzt Bauch- und Halsumfang (bei Frauen zusätzlich Hüfte) sowie die Körpergröße, um den Körperfettanteil zu schätzen.'
    }
})

const genderOptions = computed(() => [
    { label: ui.value.labels.male, value: 'male' },
    { label: ui.value.labels.female, value: 'female' }
])

const bands = computed<BandRow[]>(() => {
    if (gender.value === 'female') {
        return [
            { k: locale.value === 'en' ? 'Below ~21%' : 'Unter ~21%', v: ui.value.labels.lean },
            { k: locale.value === 'en' ? '~21-28%' : '~21-28%', v: ui.value.labels.fit },
            { k: locale.value === 'en' ? '~28-35%' : '~28-35%', v: ui.value.labels.elevated },
            { k: locale.value === 'en' ? 'Above ~35%' : 'Über ~35%', v: ui.value.labels.high }
        ]
    }

    return [
        { k: locale.value === 'en' ? 'Below ~10%' : 'Unter ~10%', v: ui.value.labels.lean },
        { k: locale.value === 'en' ? '~10-18%' : '~10-18%', v: ui.value.labels.fit },
        { k: locale.value === 'en' ? '~18-25%' : '~18-25%', v: ui.value.labels.elevated },
        { k: locale.value === 'en' ? 'Above ~25%' : 'Über ~25%', v: ui.value.labels.high }
    ]
})

const validateBodyFat = (): string[] => {
    const errors: string[] = []
    const w = Number(waist.value)
    const n = Number(neck.value)
    const h = Number(height.value)
    const hp = Number(hip.value)

    if (!gender.value) errors.push(ui.value.validation.genderRequired)
    if (!Number.isFinite(w) || w <= 0) errors.push(ui.value.validation.waistPositive)
    if (!Number.isFinite(n) || n <= 0) errors.push(ui.value.validation.neckPositive)
    if (!Number.isFinite(h) || h <= 0) errors.push(ui.value.validation.heightPositive)

    if (gender.value === 'female') {
        if (!Number.isFinite(hp) || hp <= 0) errors.push(ui.value.validation.hipPositive)
        if (Number.isFinite(w) && Number.isFinite(hp) && Number.isFinite(n) && (w + hp - n) <= 0) {
            errors.push(ui.value.validation.invalidFemale)
        }
    } else if (Number.isFinite(w) && Number.isFinite(n) && (w - n) <= 0) {
        errors.push(ui.value.validation.invalidMale)
    }

    return errors
}

const gender = computed(() => props.bodyFatGender)
const waist = computed(() => props.bodyFatWaist)
const neck = computed(() => props.bodyFatNeck)
const hip = computed(() => props.bodyFatHip)
const height = computed(() => props.bodyFatHeight)
const result = computed(() => props.bodyFatResult)

const kfaLabel = computed(() => {
    if (result.value == null) return ''
    const v = result.value

    if (gender.value === 'female') {
        if (v < 21) return ui.value.labels.lean
        if (v < 28) return ui.value.labels.fit
        if (v < 35) return ui.value.labels.elevated
        return ui.value.labels.high
    }

    if (v < 10) return ui.value.labels.lean
    if (v < 18) return ui.value.labels.fit
    if (v < 25) return ui.value.labels.elevated
    return ui.value.labels.high
})

const copyText = computed<string | null>(() => {
    if (result.value == null) return null

    const parts: string[] = []
    parts.push(`${ui.value.inputs.gender.replace(' *', '')}: ${gender.value === 'male' ? ui.value.labels.male : ui.value.labels.female}`)
    if (height.value) parts.push(`${ui.value.inputs.height.replace(' *', '')}: ${height.value} cm`)
    if (waist.value != null) parts.push(`${ui.value.inputs.waist.replace(' *', '')}: ${waist.value} cm`)
    if (neck.value != null) parts.push(`${ui.value.inputs.neck.replace(' *', '')}: ${neck.value} cm`)
    if (gender.value === 'female' && hip.value != null) parts.push(`${ui.value.inputs.hip.replace(' *', '')}: ${hip.value} cm`)
    parts.push(`${ui.value.resultLabel} ${result.value.toFixed(1)}% (${kfaLabel.value})`)
    parts.push(ui.value.resultSub)
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
    } catch {
        // noop
    }
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
        } catch {
            // noop
        }
    },
    { deep: false }
)

const infoText = computed(() => (props.info ?? '').trim() || ui.value.infoFallback)
</script>

<style scoped>
</style>
