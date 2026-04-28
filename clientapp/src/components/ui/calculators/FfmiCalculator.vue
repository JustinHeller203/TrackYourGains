<!-- src/components/ui/calculators/FfmiCalculator.vue -->
<template>
    <BaseCalculator :title="title || t('progress.calculators.ffmi.title')"
                    :showInfo="!!infoText"
                    :infoTitle="t('progress.calculators.ffmi.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="!!result"
                    :copyText="copyText"
                    @toggleFavorite="emit('toggleFavorite')"
                    @calculate="emit('calculate')"
                    @copy="emit('copy')"
                    @export="emit('export')"
                    @reset="emit('reset')"
                    :validate="validateFfmi"
                    @invalid="(errors) => emit('invalid', errors)">

        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" :aria-label="ui.heroAria">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">{{ ui.heroTitle }}</span>
                </div>

                <div class="calc-hero-sub" v-html="ui.heroSubtitle"></div>

                <div class="calc-hero-pills" :aria-label="ui.quickNavLabel">
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_formula')">{{ ui.chips.formula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_bands')">{{ ui.chips.bands }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_next')">{{ ui.chips.whatNow }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">{{ ui.chips.important }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="result"
                     id="ffmi_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div><strong>FFMI:</strong> {{ result.value.toFixed(1) }} - <strong>{{ result.category }}</strong></div>
                        <div class="calc-note calc-note--tight">{{ ui.resultTip }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('ffmi_next')">{{ ui.chips.whatNow }}</button>
                            <button class="calc-chip" type="button" @click="jumpTo('ffmi_bands')">{{ ui.chips.bands }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">{{ ui.chips.important }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.overviewLabel">
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_formula')">{{ ui.chips.formula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_example')">{{ ui.chips.example }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('ffmi_bands')">{{ ui.chips.ranges }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">{{ ui.chips.important }}</button>

                    <button class="calc-chip"
                            type="button"
                            :disabled="!result"
                            :aria-disabled="!result"
                            :class="{ 'is-disabled': !result }"
                            :title="result ? t('progress.chart.exportShort') : t('progress.calculators.copyHint')"
                            @click="onCopy?.()">
                        {{ ui.copyChip }}
                    </button>
                </div>

                <div id="ffmi_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.shortTitle }}</div>
                    <div class="calc-callout-text">
                        <div v-html="ui.shortLead"></div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.shortBullets.betterLabel }}</strong> {{ ui.shortBullets.better }}</li>
                            <li><strong>{{ ui.shortBullets.notMeaningLabel }}</strong> {{ ui.shortBullets.notMeaning }}</li>
                            <li><strong>{{ ui.shortBullets.noteLabel }}</strong> {{ ui.shortBullets.note }}</li>
                        </ul>
                    </div>
                </div>

                <div id="ffmi_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.whatNowTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.whatNow.upLabel }}</strong> {{ ui.whatNow.up }}</li>
                        <li><strong>{{ ui.whatNow.flatLabel }}</strong> {{ ui.whatNow.flat }}</li>
                        <li><strong>{{ ui.whatNow.downLabel }}</strong> {{ ui.whatNow.down }}</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.whoForTitle }}</h4>
                        <ul class="calc-list">
                            <li>{{ ui.whoFor.strength }}</li>
                            <li>{{ ui.whoFor.cutBulk }}</li>
                            <li>{{ ui.whoFor.bmi }}</li>
                            <li>{{ ui.whoFor.caution }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.measureTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.measure.measuresLabel }}</strong> {{ ui.measure.measures }}</li>
                            <li><strong>{{ ui.measure.includesLabel }}</strong> {{ ui.measure.includes }}</li>
                            <li><strong>{{ ui.measure.notLabel }}</strong> {{ ui.measure.not }}</li>
                            <li><strong>{{ ui.measure.noteLabel }}</strong> {{ ui.measure.note }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.vsBmiTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.vsBmi.bmiLabel }}</strong> {{ ui.vsBmi.bmi }}</li>
                            <li><strong>{{ ui.vsBmi.ffmiLabel }}</strong> {{ ui.vsBmi.ffmi }}</li>
                            <li><strong>{{ ui.vsBmi.practiceLabel }}</strong> {{ ui.vsBmi.practice }}</li>
                        </ul>
                    </section>

                    <section id="ffmi_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-note">{{ ui.formulaNote }}</div>
                        <div class="calc-formula calc-formula--first">
                            <span class="calc-formula-k">FFM</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaFfm }}</span>
                        </div>
                        <div class="calc-formula">
                            <span class="calc-formula-k">FFMI</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaFfmi }}</span>
                        </div>
                    </section>

                    <section id="ffmi_bands"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_bands' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.bandsTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.bands.fitRange }}</strong> {{ ui.bands.fit }}</li>
                            <li><strong>{{ ui.bands.solidRange }}</strong> {{ ui.bands.solid }}</li>
                            <li><strong>{{ ui.bands.strongRange }}</strong> {{ ui.bands.strong }}</li>
                            <li><strong>{{ ui.bands.rareRange }}</strong> {{ ui.bands.rare }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight">{{ ui.bandsNote }}</div>
                    </section>

                    <section id="ffmi_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_example' }"
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

                <div id="ffmi_important"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_important' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.importantTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.important.bodyFatLabel }}</strong> {{ ui.important.bodyFat }}</li>
                        <li><strong>{{ ui.important.waterLabel }}</strong> {{ ui.important.water }}</li>
                        <li><strong>{{ ui.important.trendLabel }}</strong> {{ ui.important.trend }}</li>
                    </ul>
                </div>

                <div id="ffmi_ignore"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_ignore' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.ignoreTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.ignore.strength }}</li>
                        <li>{{ ui.ignore.measurements }}</li>
                        <li>{{ ui.ignore.bodyFat }}</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">{{ ui.faqTitle }}</h4>
                    <ul class="calc-list">
                        <li><strong>{{ ui.faq.jumpQuestion }}</strong> {{ ui.faq.jumpAnswer }}</li>
                        <li><strong>{{ ui.faq.precisionQuestion }}</strong> {{ ui.faq.precisionAnswer }}</li>
                        <li><strong>{{ ui.faq.improveQuestion }}</strong> {{ ui.faq.improveAnswer }}</li>
                    </ul>
                </section>
            </div>
        </template>

        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">{{ ui.miniTitle }}</div>
                <div class="calc-mini-text" v-html="ui.miniText"></div>
            </div>
        </template>

        <template #inputs="{ maybeAutoCalc, errorFor }">
            <UiCalculatorInput :modelValue="weight ?? ''"
                               type="number"
                               :label="ui.inputs.weight"
                               :placeholder="ui.inputs.weightPlaceholder"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { emit('update:ffmiWeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               type="number"
                               :label="ui.inputs.height"
                               :placeholder="ui.inputs.heightPlaceholder"
                               :error="errorFor('gr')"
                               @update:modelValue="(v) => { emit('update:ffmiHeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="bodyFat ?? ''"
                               type="number"
                               :label="ui.inputs.bodyFat"
                               :placeholder="ui.inputs.bodyFatPlaceholder"
                               :error="errorFor('fett')"
                               @update:modelValue="(v) => { emit('update:ffmiBodyFat', v === '' ? null : Number(v)); maybeAutoCalc() }" />
        </template>

        <template #result>
            <div v-if="result">
                <p><strong>FFMI:</strong> {{ result.value.toFixed(1) }}</p>
                <p>{{ ui.resultCategoryLabel }} {{ result.category }}</p>
            </div>
        </template>

    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { useI18n } from '@/composables/useI18n'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    interface FfmiResult { value: number; category: string }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        ffmiWeight: number | null
        ffmiHeight: number | null
        ffmiBodyFat: number | null
        ffmiResult: FfmiResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:ffmiWeight', v: number | null): void
        (e: 'update:ffmiHeight', v: number | null): void
        (e: 'update:ffmiBodyFat', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const { t, locale } = useI18n()

    const weight = computed(() => props.ffmiWeight)
    const height = computed(() => props.ffmiHeight)
    const bodyFat = computed(() => props.ffmiBodyFat)
    const result = computed(() => props.ffmiResult)

    const ui = computed(() => {
        const weightUnit = props.unit === 'kg' ? 'kg' : 'lbs'

        if (locale.value === 'en') {
            return {
                heroAria: 'FFMI quick card',
                heroTitle: 'What does FFMI mean?',
                heroSubtitle: 'FFMI shows your <strong>fat-free mass</strong> (weight minus fat) relative to your <strong>height</strong> - the higher it is, the more muscular you usually are at a similar body-fat level.',
                quickNavLabel: 'Quick navigation',
                overviewLabel: 'Quick overview',
                chips: {
                    formula: 'Formula',
                    bands: 'Classification',
                    ranges: 'Ranges',
                    whatNow: 'What does that mean?',
                    important: 'Important',
                    example: 'Example'
                },
                youTitle: 'Your result',
                resultTip: 'Tip: FFMI is a guideline. Progress and body-fat estimation decide how useful the number is.',
                copyChip: 'Copy',
                shortTitle: 'Quick summary',
                shortLead: 'FFMI = <strong>fat-free mass</strong> relative to <strong>height</strong>.',
                shortBullets: {
                    betterLabel: 'Better than BMI:',
                    better: 'it indirectly accounts for body fat',
                    notMeaningLabel: 'Does not mean:',
                    notMeaning: 'healthy or unhealthy - it only reflects body composition',
                    noteLabel: 'Remember:',
                    note: 'your body-fat estimate needs to be reasonably accurate'
                },
                whatNowTitle: 'What does that mean now?',
                whatNow: {
                    upLabel: 'FFMI goes up:',
                    up: 'you likely gained fat-free mass or your body-fat percentage went down.',
                    flatLabel: 'FFMI stays flat:',
                    flat: 'that is fine - check gym progress, calories, protein, and sleep.',
                    downLabel: 'FFMI goes down:',
                    down: 'often the cut is too aggressive, strength is dropping, or the body-fat estimate is off.'
                },
                whoForTitle: 'Who benefits from FFMI?',
                whoFor: {
                    strength: 'Good for strength training: am I actually building muscle?',
                    cutBulk: 'Good for cuts and bulks: better context despite weight fluctuations',
                    bmi: 'Good when BMI misleads you because of high or low muscle mass',
                    caution: 'Use it only as a rough trend if your body-fat estimate is mostly a guess'
                },
                measureTitle: 'What does FFMI measure?',
                measure: {
                    measuresLabel: 'Measures:',
                    measures: 'fat-free mass relative to height',
                    includesLabel: 'Includes:',
                    includes: 'muscle, water, bones, and organs - everything except fat',
                    notLabel: 'Does not measure:',
                    not: 'healthy vs unhealthy or aesthetic vs non-aesthetic',
                    noteLabel: 'Remember:',
                    note: 'the same FFMI can look very different at different body-fat levels'
                },
                vsBmiTitle: 'FFMI vs BMI',
                vsBmi: {
                    bmiLabel: 'BMI:',
                    bmi: 'weight relative to height, without knowing whether it is muscle or fat',
                    ffmiLabel: 'FFMI:',
                    ffmi: 'removes fat through the body-fat estimate, so it is closer to muscular status',
                    practiceLabel: 'In practice:',
                    practice: 'if you train, FFMI is usually more useful than BMI'
                },
                formulaTitle: 'Formula',
                formulaNote: '1) Calculate fat-free mass - 2) normalize it by height.',
                formulaFfm: 'Weight x (1 - body-fat)',
                formulaFfmi: 'FFM / height squared (m)',
                bandsTitle: 'Rough classification',
                bands: {
                    fitRange: '~18-20:',
                    fit: 'athletic / fit',
                    solidRange: '~20-22:',
                    solid: 'very solid muscle base',
                    strongRange: '~22-24:',
                    strong: 'strong, usually with a lot of training',
                    rareRange: '24+:',
                    rare: 'rare without a lot of training and very good genetics'
                },
                bandsNote: 'This is rough. Body-fat estimation and measurement error can shift the number noticeably.',
                exampleTitle: 'Example',
                exampleRow: '80 kg, 180 cm, 15% body fat',
                exampleValue: 'FFMI approx. 20.9',
                exampleSub: 'Solidly athletic. It rises with more fat-free mass or lower body fat.',
                importantTitle: 'Important limits',
                important: {
                    bodyFatLabel: 'Body-fat estimate:',
                    bodyFat: 'this is the biggest lever - if it is off, FFMI is off too.',
                    waterLabel: 'Water and glycogen:',
                    water: 'can change body weight quickly, so the number can jump.',
                    trendLabel: 'Better approach:',
                    trend: 'judge trend, strength, and photos instead of one isolated number.'
                },
                ignoreTitle: 'When you can safely ignore FFMI',
                ignore: {
                    strength: 'Your strength is improving steadily and training is going well.',
                    measurements: 'You already have clear measurements like waist, circumferences, or photos showing the trend.',
                    bodyFat: 'Your body-fat number is mostly a guess and swings a lot - then FFMI is just noise.'
                },
                faqTitle: 'Frequently asked questions',
                faq: {
                    jumpQuestion: 'Why does my FFMI fluctuate?',
                    jumpAnswer: 'Usually because of body-fat estimation, water retention, or weigh-in timing.',
                    precisionQuestion: 'How accurate does my body-fat estimate need to be for FFMI to make sense?',
                    precisionAnswer: 'Use the same method under the same conditions and focus on the trend.',
                    improveQuestion: 'How do I improve it?',
                    improveAnswer: 'Muscle gain, progressive training, enough protein, and enough sleep.'
                },
                miniTitle: 'Reality check',
                miniText: 'FFMI is a <strong>compass</strong>, not a verdict. Track <strong>body weight</strong>, <strong>body-fat trend</strong>, and <strong>performance</strong> together.',
                inputs: {
                    weight: `Body weight (${weightUnit}) *`,
                    weightPlaceholder: props.unit === 'kg' ? 'e.g. 70' : 'e.g. 155',
                    height: 'Height (cm) *',
                    heightPlaceholder: 'e.g. 175',
                    bodyFat: 'Body fat percentage (%) *',
                    bodyFatPlaceholder: 'e.g. 15'
                },
                copy: {
                    weight: 'Body weight',
                    height: 'Height',
                    bodyFat: 'Body fat percentage'
                },
                validation: {
                    weightRequired: 'Please enter your body weight.',
                    weightPositive: 'Body weight must be greater than 0.',
                    weightHighKg: 'Body weight seems unrealistically high (kg).',
                    weightHighLbs: 'Body weight seems unrealistically high (lbs).',
                    heightRequired: 'Please enter your height (cm).',
                    heightPositive: 'Height (cm) must be greater than 0.',
                    heightLow: 'Height (cm) seems unrealistically low.',
                    heightHigh: 'Height (cm) seems unrealistically high.',
                    bodyFatRequired: 'Please enter your body fat percentage (%).',
                    bodyFatPositive: 'Body fat percentage (%) must be greater than 0.',
                    bodyFatHigh: 'Body fat percentage (%) seems unrealistically high.'
                },
                infoFallback: 'FFMI (Fat-Free Mass Index) is a muscle-oriented index: it takes your fat-free mass and relates it to height. Useful for separating muscular from simply heavy. Important: if the body-fat estimate is off, FFMI gets less reliable too, so compare trends rather than celebrating one number.',
                resultCategoryLabel: 'Category:'
            }
        }

        return {
            heroAria: 'FFMI Kurzkarte',
            heroTitle: 'Was bedeutet FFMI?',
            heroSubtitle: 'FFMI zeigt deine <strong>fettfreie Masse</strong> (Gewicht minus Fett) im Verhältnis zur <strong>Größe</strong> - je höher, desto muskulöser wirkst du meist bei ähnlichem KFA.',
            quickNavLabel: 'Schnellnavigation',
            overviewLabel: 'Kurzüberblick',
            chips: {
                formula: 'Formel',
                bands: 'Einordnung',
                ranges: 'Bereiche',
                whatNow: 'Was heißt das?',
                important: 'Wichtig',
                example: 'Beispiel'
            },
            youTitle: 'Dein Ergebnis',
            resultTip: 'Tipp: FFMI ist ein Richtwert. Progress und KFA-Schätzung entscheiden, wie nützlich die Zahl ist.',
            copyChip: 'Kopieren',
            shortTitle: 'Kurzfassung',
            shortLead: 'FFMI = <strong>fettfreie Masse</strong> relativ zur <strong>Körpergröße</strong>.',
            shortBullets: {
                betterLabel: 'Besser als BMI:',
                better: 'berücksichtigt den Fettanteil indirekt',
                notMeaningLabel: 'Heißt nicht:',
                notMeaning: 'gesund oder ungesund - es geht nur um Körperkomposition',
                noteLabel: 'Merke:',
                note: 'deine KFA-Schätzung sollte halbwegs sauber sein'
            },
            whatNowTitle: 'Was heißt das jetzt?',
            whatNow: {
                upLabel: 'FFMI steigt:',
                up: 'du hast meist fettfreie Masse aufgebaut oder dein KFA ist gesunken.',
                flatLabel: 'FFMI stagniert:',
                flat: 'das ist okay - prüf Training, Kalorien, Protein und Schlaf.',
                downLabel: 'FFMI fällt:',
                down: 'oft ist der Cut zu hart, die Kraft sinkt oder die KFA-Schätzung liegt daneben.'
            },
            whoForTitle: 'Für wen ist der FFMI wertvoll?',
            whoFor: {
                strength: 'Gut für Krafttraining: baue ich wirklich Muskeln auf?',
                cutBulk: 'Gut für Cut und Bulk: besserer Kontext trotz Gewichtsschwankungen',
                bmi: 'Gut, wenn BMI dich wegen viel oder wenig Muskelmasse in die Irre führt',
                caution: 'Nur als groben Trend nutzen, wenn dein KFA eher geraten ist'
            },
            measureTitle: 'Was misst der FFMI?',
            measure: {
                measuresLabel: 'Misst:',
                measures: 'fettfreie Masse relativ zur Körpergröße',
                includesLabel: 'Beinhaltet:',
                includes: 'Muskeln, Wasser, Knochen und Organe - also alles außer Fett',
                notLabel: 'Misst nicht:',
                not: 'gesund oder ungesund sowie ästhetisch oder nicht ästhetisch',
                noteLabel: 'Merke:',
                note: 'die gleiche FFMI-Zahl kann bei unterschiedlichem KFA komplett anders aussehen'
            },
            vsBmiTitle: 'FFMI vs. BMI',
            vsBmi: {
                bmiLabel: 'BMI:',
                bmi: 'Gewicht relativ zur Größe, ohne zu wissen, ob es Muskel oder Fett ist',
                ffmiLabel: 'FFMI:',
                ffmi: 'nimmt Fett über die KFA-Schätzung raus und liegt damit näher am Muskelstatus',
                practiceLabel: 'Praxis:',
                practice: 'wenn du trainierst, ist FFMI meist hilfreicher als BMI'
            },
            formulaTitle: 'Formel',
            formulaNote: '1) Fettfreie Masse berechnen - 2) auf Körpergröße normieren.',
            formulaFfm: 'Gewicht x (1 - KFA)',
            formulaFfmi: 'FFM / Größe² (m)',
            bandsTitle: 'Einordnung (grob)',
            bands: {
                fitRange: '~18-20:',
                fit: 'sportlich / fit',
                solidRange: '~20-22:',
                solid: 'sehr solide Muskelbasis',
                strongRange: '~22-24:',
                strong: 'stark, meist mit viel Training',
                rareRange: '24+:',
                rare: 'selten ohne viel Training und sehr gute Voraussetzungen'
            },
            bandsNote: 'Das ist grob. KFA-Schätzung und Messfehler können die Zahl spürbar verschieben.',
            exampleTitle: 'Beispiel',
            exampleRow: '80 kg, 180 cm, 15% KFA',
            exampleValue: 'FFMI ca. 20,9',
            exampleSub: 'Stabil sportlich. Der Wert steigt durch mehr fettfreie Masse oder weniger KFA.',
            importantTitle: 'Wichtig (damit du es richtig nutzt)',
            important: {
                bodyFatLabel: 'KFA-Schätzung:',
                bodyFat: 'das ist der größte Hebel - wenn sie danebenliegt, liegt auch der FFMI daneben.',
                waterLabel: 'Wasser und Glykogen:',
                water: 'ändern das Gewicht kurzfristig, dadurch kann die Zahl springen.',
                trendLabel: 'Besserer Blick:',
                trend: 'bewerte lieber Trend, Kraftwerte und Fotos statt nur eine Einzelzahl.'
            },
            ignoreTitle: 'Wann du den FFMI locker ignorieren darfst',
            ignore: {
                strength: 'Deine Kraft steigt solide und dein Training läuft gut.',
                measurements: 'Du hast klare Messwerte wie Taille, Umfänge oder Fotos, die den Trend zeigen.',
                bodyFat: 'Dein KFA ist nur geraten und schwankt stark - dann ist FFMI eher Noise.'
            },
            faqTitle: 'Häufige Fragen',
            faq: {
                jumpQuestion: 'Warum schwankt mein FFMI?',
                jumpAnswer: 'Meist wegen KFA-Schätzung, Wasserhaushalt oder Wiegezeitpunkt.',
                precisionQuestion: 'Wie genau muss mein KFA sein, damit FFMI Sinn macht?',
                precisionAnswer: 'Nutz immer die gleiche Methode unter gleichen Bedingungen und schau auf den Trend.',
                improveQuestion: 'Wie verbessere ich ihn?',
                improveAnswer: 'Muskelaufbau, progressive Belastung, genug Protein und genug Schlaf.'
            },
            miniTitle: 'Reality-Check',
            miniText: 'FFMI ist ein <strong>Kompass</strong>, kein Urteil. Tracke <strong>Körpergewicht</strong>, <strong>KFA-Trend</strong> und <strong>Leistung</strong> zusammen.',
            inputs: {
                weight: `Körpergewicht (${weightUnit}) *`,
                weightPlaceholder: props.unit === 'kg' ? 'z.B. 70' : 'z.B. 155',
                height: 'Körpergröße (cm) *',
                heightPlaceholder: 'z.B. 175',
                bodyFat: 'Körperfettanteil (%) *',
                bodyFatPlaceholder: 'z.B. 15'
            },
            copy: {
                weight: 'Körpergewicht',
                height: 'Körpergröße',
                bodyFat: 'Körperfettanteil'
            },
            validation: {
                weightRequired: 'Bitte gib dein Körpergewicht ein.',
                weightPositive: 'Körpergewicht muss größer als 0 sein.',
                weightHighKg: 'Körpergewicht wirkt unrealistisch hoch (kg).',
                weightHighLbs: 'Körpergewicht wirkt unrealistisch hoch (lbs).',
                heightRequired: 'Bitte gib deine Körpergröße (cm) ein.',
                heightPositive: 'Körpergröße (cm) muss größer als 0 sein.',
                heightLow: 'Körpergröße (cm) wirkt unrealistisch niedrig.',
                heightHigh: 'Körpergröße (cm) wirkt unrealistisch hoch.',
                bodyFatRequired: 'Bitte gib deinen Körperfettanteil (%) ein.',
                bodyFatPositive: 'Körperfettanteil (%) muss größer als 0 sein.',
                bodyFatHigh: 'Körperfettanteil (%) wirkt unrealistisch hoch.'
            },
            infoFallback: 'FFMI (Fat-Free Mass Index) ist wie ein Muskel-Index: Er nimmt deine fettfreie Masse und setzt sie ins Verhältnis zur Größe. Praktisch, um muskulös von nur schwer zu unterscheiden. Wichtig: Wenn der KFA danebenliegt, wird auch der FFMI ungenauer - deshalb eher Trends vergleichen als eine Zahl feiern.',
            resultCategoryLabel: 'Kategorie:'
        }
    })

    const infoText = computed(() => props.info ?? ui.value.infoFallback)

    const copyText = computed<string | null>(() => {
        if (!result.value) return null

        const parts: string[] = []

        if (weight.value != null) parts.push(`${ui.value.copy.weight}: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        if (height.value != null) parts.push(`${ui.value.copy.height}: ${height.value} cm`)
        if (bodyFat.value != null) parts.push(`${ui.value.copy.bodyFat}: ${bodyFat.value}%`)

        parts.push(`FFMI: ${result.value.value.toFixed(1)} (${result.value.category})`)

        return parts.join(' | ')
    })

    function validateFfmi(): string[] {
        const errors: string[] = []
        const validation = ui.value.validation

        const w = props.ffmiWeight
        if (w == null || Number.isNaN(w)) {
            errors.push(validation.weightRequired)
        } else {
            if (w <= 0) errors.push(validation.weightPositive)
            else if (props.unit === 'kg' && w > 400) errors.push(validation.weightHighKg)
            else if ((props.unit === 'lb' || props.unit === 'lbs') && w > 900) errors.push(validation.weightHighLbs)
        }

        const h = props.ffmiHeight
        if (h == null || Number.isNaN(h)) {
            errors.push(validation.heightRequired)
        } else {
            if (h <= 0) errors.push(validation.heightPositive)
            else if (h < 80) errors.push(validation.heightLow)
            else if (h > 250) errors.push(validation.heightHigh)
        }

        const bf = props.ffmiBodyFat
        if (bf == null || Number.isNaN(bf)) {
            errors.push(validation.bodyFatRequired)
        } else {
            if (bf <= 0) errors.push(validation.bodyFatPositive)
            else if (bf >= 80) errors.push(validation.bodyFatHigh)
        }

        return errors
    }
</script>

<style scoped>
</style>
