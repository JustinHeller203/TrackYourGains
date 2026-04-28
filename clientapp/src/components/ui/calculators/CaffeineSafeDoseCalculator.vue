<template>
    <BaseCalculator :title="title || t('progress.calculators.caffeine.title')"
                    :showInfo="!!infoText"
                    :infoTitle="t('progress.calculators.caffeine.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateCaffeine"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="!!cafResult"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="onReset"
                    @invalid="(errors) => $emit('invalid', errors)">

        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" :aria-label="ui.heroAria">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">{{ ui.heroTitle }}</span>
                </div>

                <div class="calc-hero-sub">{{ ui.heroSub }}</div>

                <div class="calc-hero-pills" :aria-label="ui.quickNav">
                    <button class="calc-chip" type="button" @click="jumpTo('caf_formula')">{{ ui.calcChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('caf_sources')">{{ ui.sourcesChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('caf_halflife')">{{ ui.sleepChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('caf_limits')">{{ ui.limitsChip }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="cafResult"
                     id="caf_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'caf_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div><strong>{{ ui.singleDoseLabel }}</strong> {{ cafResult.perDose.toFixed(0) }} mg</div>
                        <div><strong>{{ ui.maxDayLabel }}</strong> {{ cafResult.perDay.toFixed(0) }} mg</div>
                        <div class="calc-note calc-note--tight">{{ ui.youNote }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('caf_next')">{{ ui.meaningChip }}</button>
                            <button class="calc-chip" type="button" @click="jumpTo('caf_timing')">{{ ui.timingChip }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('caf_limits')">{{ ui.limitsChip }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.quickOverview">
                    <button class="calc-chip" type="button" @click="jumpTo('caf_sources')">{{ ui.sourcesChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('caf_halflife')">{{ ui.sleepChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('caf_sidefx')">{{ ui.sideEffectsChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('caf_pwo')">{{ ui.preWorkoutChip }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('caf_safe')">{{ ui.safeChip }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="!cafResult"
                            :aria-disabled="!cafResult"
                            :class="{ 'is-disabled': !cafResult }"
                            :title="cafResult ? t('common.copy') : t('progress.calculators.copyHint')"
                            @click="() => { onCopy?.(); jumpTo('caf_you') }">
                        {{ t('common.copy') }}
                    </button>
                </div>

                <div id="caf_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'caf_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.summaryTitle }}</div>
                    <div class="calc-callout-text">
                        <div>{{ ui.summaryIntro }}</div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.singleDoseShort }}</strong> {{ ui.summaryDose }}</li>
                            <li><strong>{{ ui.dayShort }}</strong> {{ ui.summaryDay }}</li>
                            <li><strong>{{ ui.takeawayLabel }}</strong> {{ ui.summaryTakeaway }}</li>
                        </ul>
                    </div>
                </div>

                <div id="caf_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'caf_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.meaningNowTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.tiredLabel }}</strong> {{ ui.tiredText }}</li>
                        <li><strong>{{ ui.nervousLabel }}</strong> {{ ui.nervousText }}</li>
                        <li><strong>{{ ui.tolerantLabel }}</strong> {{ ui.tolerantText }}</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.forWhoTitle }}</h4>
                        <ul class="calc-list">
                            <li>{{ ui.forWho1 }}</li>
                            <li>{{ ui.forWho2 }}</li>
                            <li>{{ ui.forWho3 }}</li>
                            <li>{{ ui.forWho4 }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.whatTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.estimateLabel }}</strong> {{ ui.estimateText }}</li>
                            <li><strong>{{ ui.limitLabel }}</strong> {{ ui.limitText }}</li>
                            <li><strong>{{ ui.notMeasureLabel }}</strong> {{ ui.notMeasureText }}</li>
                            <li><strong>{{ ui.takeawayLabel }}</strong> {{ ui.whatTakeaway }}</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">{{ ui.effectTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.sleepLabel }}</strong> {{ ui.effectSleep }}</li>
                            <li><strong>{{ ui.emptyStomachLabel }}</strong> {{ ui.effectStomach }}</li>
                            <li><strong>{{ ui.toleranceLabel }}</strong> {{ ui.effectTolerance }}</li>
                        </ul>
                    </section>

                    <section id="caf_safe"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_safe' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.safeTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.safeSensitiveLabel }}</strong> {{ ui.safeSensitiveText }}</li>
                            <li><strong>{{ ui.safeNormalLabel }}</strong> {{ ui.safeNormalText }}</li>
                            <li><strong>{{ ui.safeTolerantLabel }}</strong> {{ ui.safeTolerantText }}</li>
                        </ul>
                    </section>

                    <section id="caf_sensitivity"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_sensitivity' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.sensitivityTitle }}</h4>
                        <div class="calc-note">{{ ui.sensitivityIntro }}</div>
                        <ul class="calc-list">
                            <li><strong>{{ ui.sensitivityLowLabel }}</strong> {{ ui.sensitivityLowText }}</li>
                            <li><strong>{{ ui.sensitivityNormalLabel }}</strong> {{ ui.sensitivityNormalText }}</li>
                            <li><strong>{{ ui.sensitivityHighLabel }}</strong> {{ ui.sensitivityHighText }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight"><strong>{{ ui.takeawayLabel }}</strong> {{ ui.sensitivityNote }}</div>
                    </section>

                    <section id="caf_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-note">{{ ui.formulaIntro }}</div>
                        <div class="calc-formula calc-formula--first">
                            <span class="calc-formula-k">{{ ui.singleDoseShort }}</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaDose }}</span>
                        </div>
                        <div class="calc-formula">
                            <span class="calc-formula-k">{{ ui.dayShort }}</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaDay }}</span>
                        </div>
                        <div class="calc-note calc-note--spaced">{{ ui.formulaNote }}</div>
                    </section>

                    <section id="caf_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.exampleTitle }}</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>{{ ui.exampleTop }}</span>
                                <span class="calc-example-strong">≈ 300 mg</span>
                            </div>
                            <div class="calc-example-sub">{{ ui.exampleSub }}</div>
                        </div>
                    </section>

                    <section id="caf_sources"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_sources' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.sourcesTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.filterCoffeeLabel }}</strong> ~80–150 mg</li>
                            <li><strong>Espresso:</strong> ~60–90 mg</li>
                            <li><strong>Energy (250 ml):</strong> ~80 mg</li>
                            <li><strong>Energy (500 ml):</strong> ~160 mg</li>
                            <li><strong>{{ ui.preWorkoutLabel }}</strong> ~150–350+ mg</li>
                        </ul>
                        <div class="calc-note calc-note--tight">{{ ui.sourcesNote }}</div>
                    </section>

                    <section id="caf_timing"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_timing' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.timingTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.afterWakeLabel }}</strong> {{ ui.afterWakeText }}</li>
                            <li><strong>{{ ui.laterDayLabel }}</strong> {{ ui.laterDayText }}</li>
                            <li><strong>{{ ui.preWorkoutLabel }}</strong> {{ ui.preWorkoutText }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight" v-if="timingCutoffText"><strong>{{ ui.cutoffLabel }}</strong> {{ timingCutoffText }}</div>
                        <div class="calc-note calc-note--tight" v-if="timingLateWarning">{{ ui.cutoffWarning }}</div>
                    </section>

                    <section id="caf_halflife"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_halflife' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.halflifeTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.halflifeLabel }}</strong> {{ ui.halflifeText }}</li>
                            <li><strong>{{ ui.eveningLabel }}</strong> {{ ui.eveningText }}</li>
                            <li><strong>{{ ui.ruleLabel }}</strong> {{ ui.ruleText }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight">{{ ui.halflifeNote }}</div>
                    </section>

                    <section id="caf_sidefx"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_sidefx' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.sideEffectsTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.shakyLabel }}</strong> {{ ui.shakyText }}</li>
                            <li><strong>{{ ui.heartRaceLabel }}</strong> {{ ui.heartRaceText }}</li>
                            <li><strong>{{ ui.nauseaLabel }}</strong> {{ ui.nauseaText }}</li>
                            <li><strong>{{ ui.sleepProblemsLabel }}</strong> {{ ui.sleepProblemsText }}</li>
                        </ul>
                    </section>

                    <section id="caf_pwo"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'caf_pwo' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.preWorkoutTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.pwoTimingLabel }}</strong> {{ ui.pwoTimingText }}</li>
                            <li><strong>{{ ui.pwoStartLabel }}</strong> {{ ui.pwoStartText }}</li>
                            <li><strong>{{ ui.pwoLateLabel }}</strong> {{ ui.pwoLateText }}</li>
                            <li><strong>{{ ui.pwoStackLabel }}</strong> {{ ui.pwoStackText }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight">{{ ui.pwoNote }}</div>
                    </section>
                </div>

                <div class="calc-callout">
                    <div class="calc-callout-title">{{ ui.ignoreTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.ignore1 }}</li>
                        <li>{{ ui.ignore2 }}</li>
                        <li>{{ ui.ignore3 }}</li>
                        <li>{{ ui.ignore4 }}</li>
                    </ul>
                </div>

                <div id="caf_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'caf_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.importantTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.sensitivityRealLabel }}</strong> {{ ui.sensitivityRealText }}</li>
                        <li><strong>{{ ui.anxietyLabel }}</strong> {{ ui.anxietyText }}</li>
                        <li><strong>{{ ui.pregnantLabel }}</strong> {{ ui.pregnantText }}</li>
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

        <template #inputs="{ openInfoAndJump, maybeAutoCalc, errorFor }">
            <UiCalculatorInput :modelValue="weight ?? ''"
                               type="number"
                               :label="weightLabel"
                               :placeholder="weightPlaceholder"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { emit('update:cafWeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <div class="input-pair-tight">
                <label class="label-with-info">
                    {{ ui.sensitivityInputLabel }}
                    <button type="button"
                            class="info-btn"
                            :aria-label="ui.sensitivityTitle"
                            :title="ui.sensitivityTitle"
                            @click="openInfoAndJump('caf_sensitivity')">
                        <span class="info-emoji" aria-hidden="true">ℹ️</span>
                    </button>
                </label>

                <UiCalculatorInput :modelValue="sensitivity"
                                   as="select"
                                   :error="errorFor('empfindlichkeit')"
                                   :options="sensitivityOptions"
                                   @change="(v) => { emit('update:cafSensitivity', v as Sensitivity); maybeAutoCalc() }" />
            </div>

            <UiCalculatorInput :modelValue="status"
                               as="select"
                               :label="ui.statusLabel"
                               :error="errorFor('status')"
                               :options="statusOptions"
                               @change="(v) => { emit('update:cafStatus', v as Status); maybeAutoCalc() }" />

            <div class="extras-gap"></div>

            <button class="extras-toggle"
                    type="button"
                    :aria-expanded="showTimingExtras"
                    @click="showTimingExtras = !showTimingExtras">
                <span class="extras-toggle__label">{{ ui.showExtras }}</span>
                <span class="extras-toggle__chev" :class="{ open: showTimingExtras }">⌄</span>
            </button>

            <div v-if="showTimingExtras" class="timing-wrap">
                <div class="timing-grid">
                    <UiCalculatorInput :modelValue="lastDoseTime"
                                       type="time"
                                       :label="ui.lastDoseLabel"
                                       @update:modelValue="(v) => { emit('update:cafLastDoseTime', (v as string) || '') }" />

                    <UiCalculatorInput :modelValue="sleepTime"
                                       type="time"
                                       :label="ui.sleepTimeLabel"
                                       @update:modelValue="(v) => { emit('update:cafSleepTime', (v as string) || '') }" />
                </div>

                <small class="hint" v-if="timingCutoffText">{{ ui.cutoffHintPrefix }} <strong>{{ timingCutoffText }}</strong>{{ ui.cutoffHintSuffix }}</small>
                <small class="hint hint--warn" v-if="timingLateWarning">{{ ui.cutoffHintWarn }}</small>
            </div>
        </template>

        <template #result>
            <div v-if="cafResult">
                <p><strong>{{ ui.singleDoseLabel }}</strong> {{ cafResult.perDose.toFixed(0) }} mg</p>
                <p><strong>{{ ui.maxDayLabel }}</strong> {{ cafResult.perDay.toFixed(0) }} mg</p>
                <p v-if="timingCutoffText"><strong>{{ ui.cutoffResultLabel }}</strong> {{ timingCutoffText }}</p>
                <p v-if="timingLateWarning" class="warn-text">{{ ui.cutoffResultWarn }}</p>
            </div>
        </template>

        <template #result-sub>
            <small v-if="cafResult" class="hint">{{ ui.resultSub }}</small>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed, onMounted, ref, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { useI18n } from '@/composables/useI18n'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'
    import type { CaffeineResetSnapshot } from '@/types/calculators'
    import { LS_PROGRESS_CAFFEINE_INPUTS_V1 } from '@/constants/storageKeys'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type Sensitivity = 'low' | 'normal' | 'high'
    type Status = 'none' | 'pregnant'

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        cafWeight: number | null
        cafSensitivity: Sensitivity
        cafStatus: Status
        cafLastDoseTime?: string
        cafSleepTime?: string
        cafResult: { perDose: number; perDay: number } | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const { locale, t } = useI18n()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:cafWeight', v: number | null): void
        (e: 'update:cafSensitivity', v: Sensitivity): void
        (e: 'update:cafStatus', v: Status): void
        (e: 'update:cafLastDoseTime', v: string): void
        (e: 'update:cafSleepTime', v: string): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset', snapshot?: CaffeineResetSnapshot): void
        (e: 'invalid', errors: string[]): void
    }>()

    const weight = computed(() => props.cafWeight)
    const sensitivity = computed(() => props.cafSensitivity)
    const status = computed(() => props.cafStatus)
    const cafResult = computed(() => props.cafResult)
    const lastDoseTime = computed(() => (props.cafLastDoseTime ?? '').trim())
    const sleepTime = computed(() => (props.cafSleepTime ?? '').trim())
    const showTimingExtras = ref(false)

    const ui = computed(() => locale.value === 'en'
        ? {
            heroAria: 'Caffeine quick card', heroTitle: 'What does the caffeine calculator mean?', heroSub: 'It estimates a single dose and a daily limit from body weight and sensitivity. Sleep and tolerance still matter most.', quickNav: 'Quick navigation',
            calcChip: 'Calculation', sourcesChip: 'Sources', sleepChip: 'Sleep', limitsChip: 'Limits', youTitle: 'Your result', singleDoseLabel: 'Recommendation (single dose):', maxDayLabel: 'Max per day:', youNote: 'If caffeine makes you shaky or wired, you are not weak. You are just sensitive. Lower the dose.', meaningChip: 'What does that mean?', timingChip: 'Timing', quickOverview: 'Quick overview', sideEffectsChip: 'Side effects', preWorkoutChip: 'Pre-workout', safeChip: 'Safe', summaryTitle: 'Quick summary', summaryIntro: 'Caffeine affects people very differently. This number is only a guideline.', singleDoseShort: 'Single dose:', dayShort: 'Day:', takeawayLabel: 'Takeaway:', summaryDose: 'mg/kg depending on sensitivity.', summaryDay: 'Usually around 400 mg, or 200 mg if pregnant or breastfeeding.', summaryTakeaway: 'Ruining sleep is the biggest mistake, not using too little caffeine.',
            meaningNowTitle: 'What does that mean now?', tiredLabel: 'If you are tired:', tiredText: 'Check sleep and food timing before just taking more caffeine.', nervousLabel: 'If you get nervous:', nervousText: 'Lower the dose or skip it later in the day.', tolerantLabel: 'If you feel tolerant:', tolerantText: 'Breaks often help more than taking more.', forWhoTitle: 'Who is this useful for?', forWho1: 'If you use pre-workout and do not want to overdo it.', forWho2: 'If caffeine often causes restlessness or a racing heart.', forWho3: 'If you want to track your daily intake realistically.', forWho4: 'If you are sick or on medication, be more careful.',
            whatTitle: 'What does the calculator really measure?', estimateLabel: 'Estimates:', estimateText: 'A sensible mg range from body weight and sensitivity.', limitLabel: 'Limits:', limitText: 'A daily limit, usually around 400 mg.', notMeasureLabel: 'Does not measure:', notMeasureText: 'Sleep quality, stress, heart health, or true tolerance.', whatTakeaway: 'Your body is the real feedback system.',
            effectTitle: 'What affects the effect?', sleepLabel: 'Sleep:', effectSleep: 'Less sleep usually means stronger side effects.', emptyStomachLabel: 'Empty stomach:', effectStomach: 'Hits faster and harder.', toleranceLabel: 'Tolerance:', effectTolerance: 'Daily use reduces the effect.',
            safeTitle: 'Safe quick guide', safeSensitiveLabel: 'New or sensitive:', safeSensitiveText: '1-2 mg/kg.', safeNormalLabel: 'Normal:', safeNormalText: '3-4 mg/kg.', safeTolerantLabel: 'Tolerant:', safeTolerantText: '5-6 mg/kg, but sleep can still suffer.',
            sensitivityTitle: 'What does sensitivity mean?', sensitivityIntro: 'It describes how strongly your body reacts to caffeine, not how tough you are.', sensitivityLowLabel: 'Sensitive:', sensitivityLowText: 'Small doses can already disturb sleep or increase pulse.', sensitivityNormalLabel: 'Normal:', sensitivityNormalText: 'Good alertness without major side effects.', sensitivityHighLabel: 'Tolerant:', sensitivityHighText: 'Needs more for effect, but sleep can still take a hit.', sensitivityNote: 'Low effect does not automatically mean safe.',
            formulaTitle: 'Formula', formulaIntro: 'Guidelines: mg/kg by sensitivity plus a daily limit.', formulaDose: 'weight × (3 / 4 / 6 mg/kg)', formulaDay: 'min(400 mg, single dose × about 2-3)', formulaNote: 'Pregnant or breastfeeding: at most 200 mg/day.',
            exampleTitle: 'Example', exampleTop: '75 kg • normal (4 mg/kg)', exampleSub: 'It is not a rule. If 150 mg already feels too much, that is your limit.', sourcesTitle: 'Realistic caffeine amounts', filterCoffeeLabel: 'Filter coffee:', preWorkoutLabel: 'Pre-workout:', sourcesNote: 'Labels beat estimates. Portions are often underestimated.',
            timingTitle: 'Timing / sleep', afterWakeLabel: 'After waking up:', afterWakeText: 'Many people feel better after 60-90 minutes.', laterDayLabel: 'Later in the day:', laterDayText: 'The later you take it, the more likely it hurts sleep quality.', preWorkoutText: 'Start low, otherwise pump plus panic is a bad combo.', cutoffLabel: 'Your cutoff:', cutoffWarning: 'You went past it. You often feel that more at night than during the kick.',
            halflifeTitle: 'Half-life & sleep', halflifeLabel: 'Half-life:', halflifeText: 'About 3-7 hours.', eveningLabel: 'Evening:', eveningText: 'Leftover caffeine can keep you awake even without a kick.', ruleLabel: 'Rule of thumb:', ruleText: 'Last dose 6-10 hours before sleep.', halflifeNote: 'Bad sleep is often just caffeine taken too late.',
            sideEffectsTitle: 'Side effects', shakyLabel: 'Shaking/restlessness:', shakyText: 'Lower the dose.', heartRaceLabel: 'Racing heart:', heartRaceText: 'Stop immediately.', nauseaLabel: 'Nausea:', nauseaText: 'Do not take it on an empty stomach.', sleepProblemsLabel: 'Sleep problems:', sleepProblemsText: 'Remove caffeine later in the day.',
            preWorkoutTitle: 'Pre-workout (smart use)', pwoTimingLabel: 'Timing:', pwoTimingText: '30-60 minutes before training.', pwoStartLabel: 'Start:', pwoStartText: 'Test 1-2 mg/kg first.', pwoLateLabel: 'Late evening:', pwoLateText: 'Use a low dose or go caffeine-free.', pwoStackLabel: 'Stack:', pwoStackText: 'Coffee + energy + booster is overkill.', pwoNote: 'Performance is not worth it if your sleep suffers.',
            ignoreTitle: 'When you can safely ignore the caffeine calculator', ignore1: 'If you only drink one coffee in the morning and sleep well.', ignore2: 'If you already know the dose where it feels unpleasant.', ignore3: 'If you are sick, stressed, or underslept, go low or skip it.', ignore4: 'If you really need food, water, or sleep instead of more caffeine.',
            importantTitle: 'Important (so you use it correctly)', sensitivityRealLabel: 'Sensitivity:', sensitivityRealText: 'Is real. Guidelines are not laws.', anxietyLabel: 'Racing heart or anxiety:', anxietyText: 'Back off immediately.', pregnantLabel: 'Pregnant/breastfeeding:', pregnantText: 'At most 200 mg per day.', faqTitle: 'Frequently asked questions', faq1q: '"Why does it hit harder today?"', faq1a: 'Sleep, empty stomach, and stress.', faq2q: '"Why does it not work at all?"', faq2a: 'Tolerance. A break often helps.', faq3q: '"What helps more than more caffeine?"', faq3a: 'Sleep, food, and water.', realityTitle: 'Reality check', realityText: 'Caffeine is a tool. If your sleep suffers, that tool is currently working against you.',
            sensitivityInputLabel: 'Sensitivity *', statusLabel: 'Special case *', showExtras: 'Show extras', lastDoseLabel: 'Last dose (time)', sleepTimeLabel: 'Bedtime', cutoffHintPrefix: 'Latest by ', cutoffHintSuffix: ', otherwise sleep quality usually drops.', cutoffHintWarn: 'Your last dose was after the cutoff, so sleep quality is very likely affected.', cutoffResultLabel: 'Latest dose by:', cutoffResultWarn: 'Last dose was too late, sleep quality is very likely affected.', resultSub: 'Example: if one drink has 80 mg, you can quickly estimate how many servings still make sense.',
        }
        : {
            heroAria: 'Koffein Kurzkarte', heroTitle: 'Was bedeutet der Koffein-Rechner?', heroSub: 'Der Rechner schätzt eine Einzeldosis und ein Tageslimit aus Körpergewicht und Empfindlichkeit. Schlaf und Verträglichkeit bleiben trotzdem entscheidend.', quickNav: 'Schnellnavigation',
            calcChip: 'Berechnung', sourcesChip: 'Gehalte', sleepChip: 'Schlaf', limitsChip: 'Grenzen', youTitle: 'Dein Ergebnis', singleDoseLabel: 'Empfehlung (Einzeldosis):', maxDayLabel: 'Max. pro Tag:', youNote: 'Wenn du bei Koffein Herzrasen oder Unruhe bekommst, bist du nicht schwach, sondern sensibel. Dosis runter.', meaningChip: 'Was heißt das?', timingChip: 'Timing', quickOverview: 'Kurzüberblick', sideEffectsChip: 'Nebenwirkungen', preWorkoutChip: 'Pre-Workout', safeChip: 'Safe', summaryTitle: 'Kurzfassung', summaryIntro: 'Koffein wirkt von Mensch zu Mensch sehr unterschiedlich. Diese Zahl ist nur ein Richtwert.', singleDoseShort: 'Einzeldosis:', dayShort: 'Tag:', takeawayLabel: 'Merke:', summaryDose: 'mg/kg je nach Empfindlichkeit.', summaryDay: 'Üblich rund 400 mg, bei Schwangerschaft/Stillzeit höchstens 200 mg.', summaryTakeaway: 'Schlaf zu zerstören ist der häufigste Fehler, nicht zu wenig Koffein.',
            meaningNowTitle: 'Was heißt das jetzt?', tiredLabel: 'Wenn du müde bist:', tiredText: 'Erst Schlaf und Essens-Timing checken, nicht einfach mehr Koffein nehmen.', nervousLabel: 'Wenn du nervös wirst:', nervousText: 'Dosis senken oder später am Tag ganz weglassen.', tolerantLabel: 'Wenn du tolerant bist:', tolerantText: 'Pausen helfen oft mehr als immer mehr.', forWhoTitle: 'Für wen ist der Koffein-Rechner sinnvoll?', forWho1: 'Wenn du Pre-Workout nutzt und nicht übertreiben willst.', forWho2: 'Wenn Koffein bei dir oft Unruhe oder Herzrasen macht.', forWho3: 'Wenn du deine Tagesmenge realistisch tracken willst.', forWho4: 'Wenn du krank bist oder Medikamente nimmst, lieber vorsichtiger sein.',
            whatTitle: 'Was misst der Rechner wirklich?', estimateLabel: 'Schätzt:', estimateText: 'Einen sinnvollen mg-Bereich aus Körpergewicht und Empfindlichkeit.', limitLabel: 'Setzt Grenzen:', limitText: 'Ein Tageslimit, meist um 400 mg.', notMeasureLabel: 'Misst nicht:', notMeasureText: 'Schlafqualität, Stress, Herzgesundheit oder echte Toleranz.', whatTakeaway: 'Dein Körper ist das eigentliche Feedback-System.',
            effectTitle: 'Was beeinflusst die Wirkung?', sleepLabel: 'Schlaf:', effectSleep: 'Wenig Schlaf führt oft zu mehr Nebenwirkungen.', emptyStomachLabel: 'Leerer Magen:', effectStomach: 'Wirkt schneller und härter.', toleranceLabel: 'Toleranz:', effectTolerance: 'Täglicher Konsum senkt die Wirkung.',
            safeTitle: 'Safe-Quick', safeSensitiveLabel: 'Neu oder sensibel:', safeSensitiveText: '1-2 mg/kg.', safeNormalLabel: 'Normal:', safeNormalText: '3-4 mg/kg.', safeTolerantLabel: 'Tolerant:', safeTolerantText: '5-6 mg/kg, aber Schlaf kann trotzdem leiden.',
            sensitivityTitle: 'Was bedeutet Empfindlichkeit?', sensitivityIntro: 'Sie beschreibt, wie stark dein Körper auf Koffein reagiert, nicht wie belastbar du bist.', sensitivityLowLabel: 'Empfindlich:', sensitivityLowText: 'Schon kleine Dosen können Schlaf und Puls stören.', sensitivityNormalLabel: 'Normal:', sensitivityNormalText: 'Wachheit ohne starke Nebenwirkungen.', sensitivityHighLabel: 'Tolerant:', sensitivityHighText: 'Braucht mehr für einen Effekt, aber Schlaf kann trotzdem leiden.', sensitivityNote: 'Wenig Wirkung heißt nicht automatisch sicher.',
            formulaTitle: 'Formel', formulaIntro: 'Richtwerte: mg/kg je nach Empfindlichkeit plus ein Tageslimit.', formulaDose: 'Gewicht × (3 / 4 / 6 mg/kg)', formulaDay: 'min(400 mg, Einzeldosis × ungefähr 2-3)', formulaNote: 'Schwanger oder stillend: höchstens 200 mg pro Tag.',
            exampleTitle: 'Beispiel', exampleTop: '75 kg • normal (4 mg/kg)', exampleSub: 'Das ist kein Muss. Wenn dir 150 mg schon zu viel sind, ist das dein Limit.', sourcesTitle: 'Koffein-Gehalte (realistisch)', filterCoffeeLabel: 'Filterkaffee:', preWorkoutLabel: 'Pre-Workout:', sourcesNote: 'Etiketten schlagen Schätzungen. Portionen werden oft unterschätzt.',
            timingTitle: 'Timing / Schlaf', afterWakeLabel: 'Nach dem Aufstehen:', afterWakeText: 'Viele fühlen sich nach 60-90 Minuten besser.', laterDayLabel: 'Später am Tag:', laterDayText: 'Je später du es nimmst, desto eher leidet die Schlafqualität.', preWorkoutText: 'Lieber klein starten, sonst wird aus Pump schnell Panik.', cutoffLabel: 'Dein Cutoff:', cutoffWarning: 'Du warst drüber. Das merkst du nachts oft stärker als während des Kicks.',
            halflifeTitle: 'Halbwertszeit & Schlaf', halflifeLabel: 'Halbwertszeit:', halflifeText: 'Etwa 3-7 Stunden.', eveningLabel: 'Abends:', eveningText: 'Rest-Koffein kann wachhalten, auch ohne echten Kick.', ruleLabel: 'Faustregel:', ruleText: 'Letzte Dosis 6-10 Stunden vor dem Schlaf.', halflifeNote: 'Schlechter Schlaf ist oft einfach zu spätes Koffein.',
            sideEffectsTitle: 'Nebenwirkungen', shakyLabel: 'Unruhe / Zittern:', shakyText: 'Dosis senken.', heartRaceLabel: 'Herzrasen:', heartRaceText: 'Sofort stoppen.', nauseaLabel: 'Übelkeit:', nauseaText: 'Nicht nüchtern konsumieren.', sleepProblemsLabel: 'Schlafprobleme:', sleepProblemsText: 'Späteres Koffein streichen.',
            preWorkoutTitle: 'Pre-Workout (smart nutzen)', pwoTimingLabel: 'Timing:', pwoTimingText: '30-60 Minuten vor dem Training.', pwoStartLabel: 'Start:', pwoStartText: 'Erst 1-2 mg/kg testen.', pwoLateLabel: 'Spät abends:', pwoLateText: 'Lieber low-dose oder koffeinfrei.', pwoStackLabel: 'Stack:', pwoStackText: 'Kaffee + Energy + Booster ist Overkill.', pwoNote: 'Performance bringt nichts, wenn der Schlaf leidet.',
            ignoreTitle: 'Wann du den Koffein-Rechner locker ignorieren darfst', ignore1: 'Wenn du ohnehin nur einen Kaffee morgens trinkst und gut schläfst.', ignore2: 'Wenn du dein persönliches unangenehmes Limit schon kennst.', ignore3: 'Wenn du krank, gestresst oder übermüdet bist, lieber low oder gar nicht.', ignore4: 'Wenn du eigentlich Essen, Wasser oder Schlaf statt mehr Koffein brauchst.',
            importantTitle: 'Wichtig (damit du es richtig nutzt)', sensitivityRealLabel: 'Empfindlichkeit:', sensitivityRealText: 'Ist real. Richtwerte sind keine Gesetze.', anxietyLabel: 'Herzrasen oder Angst:', anxietyText: 'Sofort runterfahren.', pregnantLabel: 'Schwanger/Stillend:', pregnantText: 'Höchstens 200 mg pro Tag.', faqTitle: 'Häufige Fragen', faq1q: '„Warum wirkt es heute stärker?“', faq1a: 'Schlaf, leerer Magen und Stress.', faq2q: '„Warum wirkt es gar nicht?“', faq2a: 'Toleranz. Eine Pause hilft oft.', faq3q: '„Was hilft besser als mehr Koffein?“', faq3a: 'Schlaf, Essen und Wasser.', realityTitle: 'Reality-Check', realityText: 'Koffein ist ein Tool. Wenn dein Schlaf leidet, arbeitet dieses Tool gerade gegen dich.',
            sensitivityInputLabel: 'Empfindlichkeit *', statusLabel: 'Besonderheit *', showExtras: 'Extras anzeigen', lastDoseLabel: 'Letzte Dosis (Uhrzeit)', sleepTimeLabel: 'Schlafenszeit', cutoffHintPrefix: 'Spätestens bis ', cutoffHintSuffix: ', sonst leidet der Schlaf meistens.', cutoffHintWarn: 'Deine letzte Dosis war nach dem Cutoff, daher leidet die Schlafqualität sehr wahrscheinlich.', cutoffResultLabel: 'Letzte Dosis spätestens:', cutoffResultWarn: 'Die letzte Dosis war zu spät, die Schlafqualität leidet sehr wahrscheinlich.', resultSub: 'Beispiel: Hat ein Drink 80 mg, kannst du schnell überschlagen, wie viele Portionen noch sinnvoll sind.',
        })

    const infoText = computed(() => props.info ?? (locale.value === 'en'
        ? 'Guideline values for healthy adults: roughly 3-6 mg/kg body weight. Typical daily upper limit around 400 mg, or 200 mg during pregnancy or breastfeeding.'
        : 'Richtwerte für gesunde Erwachsene: ungefähr 3-6 mg/kg Körpergewicht. Übliche Tagesobergrenze rund 400 mg, bei Schwangerschaft/Stillzeit 200 mg.'))

    const weightLabel = computed(() => locale.value === 'en' ? `Body weight (${props.unit === 'kg' ? 'kg' : 'lbs'}) *` : `Körpergewicht (${props.unit === 'kg' ? 'kg' : 'lbs'}) *`)
    const weightPlaceholder = computed(() => props.unit === 'kg' ? 'z.B. 75' : 'z.B. 165')
    const sensitivityOptions = computed(() => locale.value === 'en'
        ? [{ label: 'Sensitive (~3 mg/kg)', value: 'low' }, { label: 'Normal (~4 mg/kg)', value: 'normal' }, { label: 'Tolerant (~6 mg/kg)', value: 'high' }]
        : [{ label: 'Empfindlich (≈ 3 mg/kg)', value: 'low' }, { label: 'Normal (≈ 4 mg/kg)', value: 'normal' }, { label: 'Tolerant (≈ 6 mg/kg)', value: 'high' }])
    const statusOptions = computed(() => locale.value === 'en'
        ? [{ label: 'None', value: 'none' }, { label: 'Pregnant/breastfeeding (≤ 200 mg/day)', value: 'pregnant' }]
        : [{ label: 'Keine', value: 'none' }, { label: 'Schwanger/Stillend (≤ 200 mg/Tag)', value: 'pregnant' }])

    function onReset() {
        const snapshot = { weight: props.cafWeight, sensitivity: props.cafSensitivity, status: props.cafStatus, lastDoseTime: (props.cafLastDoseTime ?? '').trim(), sleepTime: (props.cafSleepTime ?? '').trim(), showTimingExtras: showTimingExtras.value }
        emit('update:cafLastDoseTime', '')
        emit('update:cafSleepTime', '')
        showTimingExtras.value = false
        emit('reset', snapshot)
    }

    function parseHHMM(value: string): number | null {
        if (!/^\d{2}:\d{2}$/.test(value)) return null
        const [hh, mm] = value.split(':').map(Number)
        if ([hh, mm].some(Number.isNaN) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
        return hh * 60 + mm
    }
    const fmtHHMM = (m: number) => `${String(Math.floor((((m % 1440) + 1440) % 1440) / 60)).padStart(2, '0')}:${String((((m % 1440) + 1440) % 1440) % 60).padStart(2, '0')}`
    const cutoffWindowMinutes = computed(() => sensitivity.value === 'low' ? 600 : sensitivity.value === 'high' ? 360 : 480)
    const timingCutoff = computed(() => {
        const st = parseHHMM(sleepTime.value); if (st == null) return null
        const ld = parseHHMM(lastDoseTime.value)
        const sleepAbs = ld != null && st <= ld ? st + 1440 : st
        const cutoffAbs = sleepAbs - cutoffWindowMinutes.value
        return { cutoffAbs, isPrevDay: sleepAbs >= 1440 ? cutoffAbs < 1440 : cutoffAbs < 0 }
    })
    const timingCutoffText = computed(() => timingCutoff.value ? `${fmtHHMM(timingCutoff.value.cutoffAbs)}${timingCutoff.value.isPrevDay ? (locale.value === 'en' ? ' (previous day)' : ' (am Vortag)') : ''}` : null)
    const timingLateWarning = computed(() => {
        const ld = parseHHMM(lastDoseTime.value); const st = parseHHMM(sleepTime.value); const c = timingCutoff.value
        if (ld == null || st == null || !c) return false
        const sleepAbs = st <= ld ? st + 1440 : st
        return ld > (sleepAbs - cutoffWindowMinutes.value)
    })

    function validateCaffeine(): string[] {
        const errors: string[] = []
        const w = props.cafWeight
        if (w == null || Number.isNaN(w)) { errors.push(locale.value === 'en' ? 'Please enter your body weight.' : 'Bitte gib dein Körpergewicht ein.'); return errors }
        if (w <= 0) errors.push(locale.value === 'en' ? 'Body weight must be greater than 0.' : 'Körpergewicht muss größer als 0 sein.')
        else if (props.unit === 'kg' && w > 400) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high (kg).' : 'Körpergewicht wirkt unrealistisch hoch (kg).')
        else if ((props.unit === 'lb' || props.unit === 'lbs') && w > 900) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high (lbs).' : 'Körpergewicht wirkt unrealistisch hoch (lbs).')
        if (!props.cafSensitivity) errors.push(locale.value === 'en' ? 'Please choose your sensitivity.' : 'Bitte wähle deine Empfindlichkeit.')
        if (!props.cafStatus) errors.push(locale.value === 'en' ? 'Please choose the status.' : 'Bitte wähle den Status.')
        return errors
    }

    const copyText = computed<string | null>(() => {
        if (!cafResult.value) return null
        const parts: string[] = []
        if (weight.value != null) parts.push(`${locale.value === 'en' ? 'Body weight' : 'Gewicht'}: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        parts.push(`${ui.value.sensitivityInputLabel}: ${sensitivity.value}`)
        if (status.value === 'pregnant') parts.push(locale.value === 'en' ? 'Status: pregnant/breastfeeding' : 'Status: Schwanger/Stillend')
        parts.push(`${ui.value.singleDoseLabel} ${cafResult.value.perDose.toFixed(0)} mg`)
        parts.push(`${ui.value.maxDayLabel} ${cafResult.value.perDay.toFixed(0)} mg`)
        if (timingCutoffText.value) parts.push(`${ui.value.cutoffResultLabel} ${timingCutoffText.value}`)
        return parts.join(' | ')
    })

    const LS_KEY = LS_PROGRESS_CAFFEINE_INPUTS_V1
    onMounted(() => {
        try {
            const raw = localStorage.getItem(LS_KEY); if (!raw) return
            const data = JSON.parse(raw)
            if (props.cafWeight == null && typeof data.weight === 'number') emit('update:cafWeight', data.weight)
            if (props.cafSensitivity === 'normal' && ['low', 'normal', 'high'].includes(data.sensitivity)) emit('update:cafSensitivity', data.sensitivity)
            if (props.cafStatus === 'none' && ['none', 'pregnant'].includes(data.status)) emit('update:cafStatus', data.status)
            if (typeof data.lastDoseTime === 'string' && !props.cafLastDoseTime) emit('update:cafLastDoseTime', data.lastDoseTime)
            if (typeof data.sleepTime === 'string' && !props.cafSleepTime) emit('update:cafSleepTime', data.sleepTime)
        } catch {}
    })
    watch(() => [props.cafWeight, props.cafSensitivity, props.cafStatus, props.cafLastDoseTime, props.cafSleepTime], ([w, s, st, t1, t2]) => {
        try { localStorage.setItem(LS_KEY, JSON.stringify({ weight: w, sensitivity: s, status: st, lastDoseTime: t1, sleepTime: t2 })) } catch {}
    }, { deep: false })
</script>

<style scoped>
    .input-pair-tight { display: flex; flex-direction: column; gap: .4rem; }
    .label-with-info { display: flex; align-items: center; gap: .45rem; font: inherit; font-size: .92rem; font-weight: 600; line-height: 1.1; letter-spacing: .01em; color: color-mix(in srgb, var(--text-primary) 88%, transparent); }
    .label-with-info .info-btn { display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
    .label-with-info .info-emoji { font-size: .95em; }
    .timing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    @media (max-width: 520px) { .timing-grid { grid-template-columns: 1fr; } }
    .hint--warn { opacity: 1; color: color-mix(in srgb, var(--danger) 70%, var(--text-primary)); }
    .warn-text { margin-top: .35rem; color: color-mix(in srgb, var(--danger) 70%, var(--text-primary)); font-weight: 600; }
    .extras-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .7rem .85rem; min-height: 44px; border-radius: .95rem; border: 1px solid color-mix(in srgb, var(--text-primary) 12%, transparent); background: color-mix(in srgb, var(--bg-card) 70%, transparent); box-shadow: inset 0 1px 0 color-mix(in srgb, var(--text-primary) 8%, transparent); transition: border-color .15s ease, background .15s ease, transform .06s ease; }
    .extras-toggle__label { font-weight: 700; font-size: .95rem; color: color-mix(in srgb, var(--text-primary) 92%, transparent); }
    .extras-toggle__chev { transition: transform .18s ease; opacity: .72; }
    .extras-toggle:hover { border-color: color-mix(in srgb, var(--text-primary) 18%, transparent); background: color-mix(in srgb, var(--bg-card) 78%, transparent); }
    .extras-toggle:active { transform: translateY(1px); }
    .extras-toggle__chev.open { transform: rotate(180deg); }
    .timing-wrap { margin-top: .65rem; }
</style>
