<template>
    <BaseCalculator :title="title || t('progress.calculators.calories.title')"
                    cardClass="calories-calculator-card calc-card--wide"
                    :showInfo="!!infoText"
                    :infoTitle="t('progress.calculators.calories.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateCalories"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="false"
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

                <div class="calc-hero-sub">{{ ui.heroSub }}</div>

                <div class="calc-hero-pills" :aria-label="ui.quickNav">
                    <button class="calc-chip" type="button" @click="jumpTo('cal_formula')">{{ ui.formulaChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_activity')">{{ ui.activityChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_macros')">{{ ui.macrosChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('cal_limits')">{{ ui.limitsChip }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="result"
                     id="cal_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'cal_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div><strong>{{ ui.dailyTargetLabel }}</strong> {{ result.total.toFixed(0) }} kcal</div>
                        <div class="calc-note calc-note--tight">{{ ui.youNote }}</div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('cal_next')">{{ ui.meaningChip }}</button>
                            <button class="calc-chip" type="button" @click="jumpTo('cal_activity')">{{ ui.activityChip }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('cal_limits')">{{ ui.limitsChip }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.quickOverview">
                    <button class="calc-chip" type="button" @click="jumpTo('cal_formula')">{{ ui.formulaChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_example')">{{ ui.exampleChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('cal_activity')">{{ ui.activityChip }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('cal_macros')">{{ ui.macrosChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('cal_limits')">{{ ui.limitsChip }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="!result"
                            :aria-disabled="!result"
                            :class="{ 'is-disabled': !result }"
                            :title="result ? t('common.copy') : t('progress.calculators.copyHint')"
                            @click="() => { onCopy?.(); jumpTo('cal_you') }">
                        {{ t('common.copy') }}
                    </button>
                </div>

                <div id="cal_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'cal_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.summaryTitle }}</div>
                    <div class="calc-callout-text">
                        <div>{{ ui.summaryIntro }}</div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>{{ ui.maintainLabel }}</strong> {{ ui.maintainText }}</li>
                            <li><strong>{{ ui.deficitLabel }}</strong> {{ ui.deficitText }}</li>
                            <li><strong>{{ ui.surplusLabel }}</strong> {{ ui.surplusText }}</li>
                        </ul>
                    </div>
                </div>

                <div id="cal_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'cal_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.meaningNowTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.notLosingLabel }}</strong> {{ ui.notLosingText }}</li>
                        <li><strong>{{ ui.gainingFastLabel }}</strong> {{ ui.gainingFastText }}</li>
                        <li><strong>{{ ui.flatLabel }}</strong> {{ ui.flatText }}</li>
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
                        <h4 class="calc-h">{{ ui.whatTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.baseLabel }}</strong> {{ ui.baseText }}</li>
                            <li><strong>{{ ui.plusLabel }}</strong> {{ ui.plusText }}</li>
                            <li><strong>{{ ui.adjustLabel }}</strong> {{ ui.adjustText }}</li>
                            <li><strong>{{ ui.notIncludedLabel }}</strong> {{ ui.notIncludedText }}</li>
                        </ul>
                    </section>

                    <section id="cal_goal_guide"
                             class="calc-card calc-card--wide"
                             :class="{ 'calc-target': activeTargetId === 'cal_goal_guide' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.goalGuideTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.goalMaintain }}</strong> {{ ui.goalMaintainText }}</li>
                            <li><strong>{{ ui.goalLeanBulk }}</strong> {{ ui.goalLeanBulkText }}</li>
                            <li><strong>{{ ui.goalBulk }}</strong> {{ ui.goalBulkText }}</li>
                            <li><strong>{{ ui.goalDirtyBulk }}</strong> {{ ui.goalDirtyBulkText }}</li>
                            <li><strong>{{ ui.goalMiniCut }}</strong> {{ ui.goalMiniCutText }}</li>
                            <li><strong>{{ ui.goalHardCut }}</strong> {{ ui.goalHardCutText }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight">{{ ui.goalGuideNote }}</div>
                    </section>

                    <section id="cal_activity"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_activity' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.activityTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.actSedentary }}</strong> {{ ui.actSedentaryText }}</li>
                            <li><strong>{{ ui.actLight }}</strong> {{ ui.actLightText }}</li>
                            <li><strong>{{ ui.actModerate }}</strong> {{ ui.actModerateText }}</li>
                            <li><strong>{{ ui.actVery }}</strong> {{ ui.actVeryText }}</li>
                            <li><strong>{{ ui.actExtreme }}</strong> {{ ui.actExtremeText }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight">{{ ui.activityNote }}</div>
                    </section>

                    <section id="cal_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-note">{{ ui.formulaIntro }}</div>
                        <div class="calc-formula calc-formula--first">
                            <span class="calc-formula-k">TDEE</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaTdee }}</span>
                        </div>
                        <div class="calc-formula">
                            <span class="calc-formula-k">{{ ui.goalShort }}</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaGoal }}</span>
                        </div>
                    </section>

                    <section id="cal_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.exampleTitle }}</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>{{ ui.exampleTop }}</span>
                                <span class="calc-example-strong">{{ ui.exampleStrong }}</span>
                            </div>
                            <div class="calc-example-sub">{{ ui.exampleSub }}</div>
                        </div>
                    </section>

                    <section id="cal_macros"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'cal_macros' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.macrosTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.carbsLabel }}</strong> {{ ui.carbsText }}</li>
                            <li><strong>{{ ui.proteinLabel }}</strong> {{ ui.proteinText }}</li>
                            <li><strong>{{ ui.fatLabel }}</strong> {{ ui.fatText }}</li>
                        </ul>
                        <div class="calc-note calc-note--tight">{{ ui.macrosNote }}</div>
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

                <div id="cal_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'cal_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.importantTitle }}</div>
                    <ul class="calc-list">
                        <li>{{ ui.important1 }}</li>
                        <li>{{ ui.important2 }}</li>
                        <li>{{ ui.important3 }}</li>
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
            <UiCalculatorInput :modelValue="age ?? ''"
                               type="number"
                               inputmode="numeric"
                               :label="ui.ageLabel"
                               :placeholder="ui.agePlaceholder"
                               :error="errorFor('alter')"
                               @update:modelValue="(v) => { emit('update:calorieAge', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="gender"
                               as="select"
                               :label="ui.genderLabel"
                               :error="errorFor('geschlecht')"
                               :options="genderOptions"
                               @change="(v) => { emit('update:calorieGender', v as Gender); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="weight ?? ''"
                               type="number"
                               :label="weightLabel"
                               :placeholder="weightPlaceholder"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { emit('update:calorieWeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               type="number"
                               :label="ui.heightLabel"
                               :placeholder="ui.heightPlaceholder"
                               :error="errorFor('gr')"
                               @update:modelValue="(v) => { emit('update:calorieHeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <div class="input-pair-tight">
                <label class="label-with-info">
                    {{ ui.activityInputLabel }}
                    <button type="button"
                            class="info-btn"
                            :aria-label="ui.activityInfoLabel"
                            :title="ui.activityInfoLabel"
                            @click="openInfoAndJump('cal_activity')">
                        <span class="info-emoji" aria-hidden="true">ℹ️</span>
                    </button>
                </label>

                <UiCalculatorInput :modelValue="activity"
                                   as="select"
                                   :error="errorFor('aktivit')"
                                   :options="activityOptions"
                                   @change="(v) => { emit('update:calorieActivity', String(v)); maybeAutoCalc() }" />
            </div>

            <div class="input-pair-tight">
                <label class="label-with-info">
                    {{ ui.goalInputLabel }}
                    <button type="button"
                            class="info-btn"
                            :aria-label="ui.goalGuideTitle"
                            :title="ui.goalGuideTitle"
                            @click="openInfoAndJump('cal_goal_guide')">
                        <span class="info-emoji" aria-hidden="true">ℹ️</span>
                    </button>
                </label>

                <UiCalculatorInput :modelValue="goal"
                                   as="select"
                                   :error="errorFor('kalorienziel')"
                                   :options="goalOptions"
                                   @change="(v) => { emit('update:calorieGoal', Number(v)); maybeAutoCalc() }" />
            </div>
        </template>

        <template #result>
            <div v-if="result" class="calories-result">
                <div class="calories-result__hero">
                    <div class="calories-result__hero-topbar">
                        <CopyButton @click="$emit('copy')" />
                    </div>

                    <div class="calories-result__hero-copy">
                        <span class="calories-result__eyebrow">{{ ui.dailyTargetEyebrow }}</span>
                        <strong class="calories-result__total">{{ result.total.toFixed(0) }}</strong>
                        <span class="calories-result__unit">{{ ui.dailyTargetUnit }}</span>
                    </div>
                </div>

                <div class="calories-result__macros">
                    <div class="calories-result__macro calories-result__macro--carbs">
                        <span class="calories-result__macro-label">{{ ui.carbsShort }}</span>
                        <strong class="calories-result__macro-value">{{ result.macros.carbs.toFixed(0) }} g</strong>
                        <span class="calories-result__macro-share">50%</span>
                    </div>
                    <div class="calories-result__macro calories-result__macro--protein">
                        <span class="calories-result__macro-label">{{ ui.proteinShort }}</span>
                        <strong class="calories-result__macro-value">{{ result.macros.protein.toFixed(0) }} g</strong>
                        <span class="calories-result__macro-share">30%</span>
                    </div>
                    <div class="calories-result__macro calories-result__macro--fat">
                        <span class="calories-result__macro-label">{{ ui.fatShort }}</span>
                        <strong class="calories-result__macro-value">{{ result.macros.fat.toFixed(0) }} g</strong>
                        <span class="calories-result__macro-share">20%</span>
                    </div>
                </div>
            </div>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { useI18n } from '@/composables/useI18n'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type Gender = 'male' | 'female'
    type Unit = 'kg' | 'lb' | 'lbs' | string

    interface CalorieResult {
        total: number
        macros: { carbs: number; protein: number; fat: number }
    }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        calorieAge: number | null
        calorieGender: Gender
        calorieWeight: number | null
        calorieHeight: number | null
        calorieActivity: string
        calorieGoal: number
        calorieResult: CalorieResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const { locale, t } = useI18n()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:calorieAge', v: number | null): void
        (e: 'update:calorieGender', v: Gender): void
        (e: 'update:calorieWeight', v: number | null): void
        (e: 'update:calorieHeight', v: number | null): void
        (e: 'update:calorieActivity', v: string): void
        (e: 'update:calorieGoal', v: number): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const age = computed(() => props.calorieAge)
    const gender = computed(() => props.calorieGender)
    const weight = computed(() => props.calorieWeight)
    const height = computed(() => props.calorieHeight)
    const activity = computed(() => props.calorieActivity)
    const goal = computed(() => props.calorieGoal)
    const result = computed(() => props.calorieResult)

    const steps = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

    const ui = computed(() => locale.value === 'en'
        ? {
            heroAria: 'Calories quick card',
            heroTitle: 'What does the calorie calculator mean?',
            heroSub: 'The calculator estimates your daily needs from basal metabolism plus activity and adjusts them for your goal.',
            quickNav: 'Quick navigation',
            formulaChip: 'Formula',
            exampleChip: 'Example',
            activityChip: 'Activity',
            macrosChip: 'Macros',
            limitsChip: 'Limits',
            youTitle: 'Your result',
            dailyTargetLabel: 'Daily target:',
            youNote: 'Tip: If your weight trend does not match for 2-3 weeks, check activity and tracking first, then adjust by 100-200 kcal.',
            meaningChip: 'What does that mean?',
            quickOverview: 'Quick overview',
            summaryTitle: 'Quick summary',
            summaryIntro: 'The calculator estimates your maintenance level and then adjusts it with activity and goal.',
            maintainLabel: 'Maintenance:',
            maintainText: 'Weight stays roughly stable.',
            deficitLabel: 'Deficit:',
            deficitText: 'Fat loss, ideally slow and stable.',
            surplusLabel: 'Surplus:',
            surplusText: 'Muscle gain, cleaner when moderate.',
            meaningNowTitle: 'What does that mean now?',
            notLosingLabel: 'Not losing weight?',
            notLosingText: 'Check tracking and activity, then reduce by 100-200 kcal.',
            gainingFastLabel: 'Gaining too fast?',
            gainingFastText: 'Reduce by 100-200 kcal or remove easy extra calories.',
            flatLabel: 'Feeling flat?',
            flatText: 'The deficit may be too aggressive or sleep and protein too low.',
            forWhoTitle: 'Who is this useful for?',
            forWho1: 'Starting point for cut, bulk, or maintenance.',
            forWho2: 'Helpful if you want to understand your trend.',
            forWho3: 'With very volatile activity you will need more adjustments.',
            whatTitle: 'What does the calculator estimate?',
            baseLabel: 'Base:',
            baseText: 'Basal metabolic rate (BMR).',
            plusLabel: 'Plus:',
            plusText: 'Activity factor (TDEE).',
            adjustLabel: 'Adjustment:',
            adjustText: 'Goal calories added or subtracted.',
            notIncludedLabel: 'Not included:',
            notIncludedText: 'Real NEAT swings, tracking errors, stress, sleep.',
            goalGuideTitle: 'What is an appropriate goal?',
            goalMaintain: 'Maintenance (0 kcal):',
            goalMaintainText: 'Stability, stress phases, or clean tracking practice.',
            goalLeanBulk: 'Lean bulk (+100-300 kcal):',
            goalLeanBulkText: 'Build with minimal fat gain.',
            goalBulk: 'Bulk (+300-500 kcal):',
            goalBulkText: 'Faster gain with more fat coming along.',
            goalDirtyBulk: 'Dirty bulk (+500+ kcal):',
            goalDirtyBulkText: 'Only if fat gain is not a concern.',
            goalMiniCut: 'Mini cut (-300-500 kcal):',
            goalMiniCutText: 'Sustainable fat loss.',
            goalHardCut: 'Hard cut (-500-800 kcal):',
            goalHardCutText: 'Aggressive and harder to sustain.',
            goalGuideNote: 'Rule: after 2-3 weeks, only the weight trend matters. Adjust in steps of 100-200 kcal.',
            activityTitle: 'Activity level (simply explained)',
            actSedentary: 'Sedentary (1.2):',
            actSedentaryText: 'Very little movement.',
            actLight: 'Light (1.375):',
            actLightText: '1-3 sessions per week.',
            actModerate: 'Moderate (1.55):',
            actModerateText: '3-5 sessions per week.',
            actVery: 'Very active (1.725):',
            actVeryText: '6-7 sessions per week.',
            actExtreme: 'Extreme (1.9):',
            actExtremeText: 'Very hard activity almost daily.',
            activityNote: 'Many people overestimate activity. If unsure, start one level lower.',
            formulaTitle: 'Formula',
            formulaIntro: 'Principle: BMR -> multiplied by activity = TDEE -> plus or minus goal.',
            formulaTdee: 'BMR × activity factor',
            goalShort: 'Goal',
            formulaGoal: 'TDEE + (deficit/surplus)',
            exampleTitle: 'Example',
            exampleTop: 'Maintenance 2600 kcal',
            exampleStrong: 'Cut: 2300-2400',
            exampleSub: 'A clean cut is slow. If you destroy yourself, you will not sustain it.',
            macrosTitle: 'Macros (your output)',
            carbsLabel: 'Carbs (50%):',
            carbsText: 'Energy and training performance.',
            proteinLabel: 'Protein (30%):',
            proteinText: 'Maintain and build muscle.',
            fatLabel: 'Fat (20%):',
            fatText: 'Hormones and satiety.',
            macrosNote: 'If you take nutrition seriously, control protein with g/kg. Percentages are only a default.',
            ignoreTitle: 'When you can ignore the number',
            ignore1: 'If your tracking is solid and your weight trend says something else.',
            ignore2: 'If your activity changes dramatically because of work or daily steps.',
            ignore3: 'If illness or stress changes appetite and spontaneous movement.',
            importantTitle: 'Important',
            important1: 'This is an estimate. Your body is the real feedback.',
            important2: 'Tracking errors are the number one reason why it seems not to work.',
            important3: 'After 2-3 weeks, adjust in steps of 100-200 kcal.',
            faqTitle: 'Frequently asked questions',
            faq1q: '"Why am I not losing weight?"',
            faq1a: 'Usually because tracking or activity is overestimated.',
            faq2q: '"Why am I tired in a deficit?"',
            faq2a: 'Often too aggressive, with too little sleep or protein.',
            faq3q: '"Do I have to use these exact macros?"',
            faq3a: 'No. They are just defaults. Prioritize protein.',
            realityTitle: 'Reality check',
            realityText: 'The best calorie number is the one that matches your trend. Numbers are just the start. Adjustment is the real skill.',
            ageLabel: 'Age (years) *',
            agePlaceholder: 'e.g. 30',
            genderLabel: 'Sex *',
            heightLabel: 'Height (cm) *',
            heightPlaceholder: 'e.g. 175',
            activityInputLabel: 'Activity level *',
            activityInfoLabel: 'Open activity level explanation',
            goalInputLabel: 'Calorie goal *',
            dailyTargetEyebrow: 'Daily target',
            dailyTargetUnit: 'kcal / day',
            carbsShort: 'Carbohydrates',
            proteinShort: 'Protein',
            fatShort: 'Fat',
        }
        : {
            heroAria: 'Kalorien Kurzkarte',
            heroTitle: 'Was bedeutet der Kalorienrechner?',
            heroSub: 'Der Rechner schätzt deinen Tagesbedarf aus Grundumsatz plus Aktivität und passt ihn für dein Ziel an.',
            quickNav: 'Schnellnavigation',
            formulaChip: 'Formel',
            exampleChip: 'Beispiel',
            activityChip: 'Aktivität',
            macrosChip: 'Makros',
            limitsChip: 'Grenzen',
            youTitle: 'Dein Ergebnis',
            dailyTargetLabel: 'Tagesziel:',
            youNote: 'Tipp: Wenn dein Gewicht 2-3 Wochen nicht wie geplant läuft, prüfe Aktivität und Tracking und passe dann um 100-200 kcal an.',
            meaningChip: 'Was heißt das?',
            quickOverview: 'Kurzüberblick',
            summaryTitle: 'Kurzfassung',
            summaryIntro: 'Der Rechner schätzt deinen Erhaltungsbedarf und passt ihn mit Aktivität und Ziel an.',
            maintainLabel: 'Erhaltung:',
            maintainText: 'Gewicht bleibt ungefähr stabil.',
            deficitLabel: 'Defizit:',
            deficitText: 'Fett runter, idealerweise langsam und stabil.',
            surplusLabel: 'Überschuss:',
            surplusText: 'Aufbau, sauberer wenn moderat.',
            meaningNowTitle: 'Was heißt das jetzt?',
            notLosingLabel: 'Du nimmst nicht ab?',
            notLosingText: 'Tracking und Aktivität prüfen, dann 100-200 kcal runter.',
            gainingFastLabel: 'Du nimmst zu schnell zu?',
            gainingFastText: '100-200 kcal runter oder leichte Extraportionen streichen.',
            flatLabel: 'Du fühlst dich leer?',
            flatText: 'Defizit zu hart oder Schlaf und Protein zu niedrig.',
            forWhoTitle: 'Für wen ist das sinnvoll?',
            forWho1: 'Startpunkt für Cut, Aufbau oder Erhaltung.',
            forWho2: 'Hilfreich, wenn du deinen Trend verstehen willst.',
            forWho3: 'Bei stark schwankender Aktivität musst du häufiger nachjustieren.',
            whatTitle: 'Was schätzt der Rechner?',
            baseLabel: 'Basis:',
            baseText: 'Grundumsatz (BMR).',
            plusLabel: 'Plus:',
            plusText: 'Aktivitätsfaktor (TDEE).',
            adjustLabel: 'Plus/Minus:',
            adjustText: 'Kalorienziel wird addiert oder abgezogen.',
            notIncludedLabel: 'Nicht drin:',
            notIncludedText: 'Echte NEAT-Schwankungen, Tracking-Fehler, Stress, Schlaf.',
            goalGuideTitle: 'Was ist „angemessen“ fürs Ziel?',
            goalMaintain: 'Erhaltung (0 kcal):',
            goalMaintainText: 'Stabilität, Stressphasen oder sauberes Tracking lernen.',
            goalLeanBulk: 'Lean Bulk (+100-300 kcal):',
            goalLeanBulkText: 'Aufbau mit minimalem Fett.',
            goalBulk: 'Bulk (+300-500 kcal):',
            goalBulkText: 'Schneller Aufbau, mit mehr Fettzunahme.',
            goalDirtyBulk: 'Dirty Bulk (+500+ kcal):',
            goalDirtyBulkText: 'Nur wenn Fettzunahme egal ist.',
            goalMiniCut: 'Mini-Cut (-300-500 kcal):',
            goalMiniCutText: 'Nachhaltig Fett verlieren.',
            goalHardCut: 'Hard Cut (-500-800 kcal):',
            goalHardCutText: 'Aggressiv und schwerer durchzuhalten.',
            goalGuideNote: 'Regel: Nach 2-3 Wochen zählt nur der Gewichtstrend. Passe in Schritten von 100-200 kcal an.',
            activityTitle: 'Aktivitätslevel (einfach erklärt)',
            actSedentary: 'Sitzend (1.2):',
            actSedentaryText: 'Wenig Bewegung.',
            actLight: 'Leicht (1.375):',
            actLightText: '1-3 Einheiten pro Woche.',
            actModerate: 'Moderat (1.55):',
            actModerateText: '3-5 Einheiten pro Woche.',
            actVery: 'Sehr aktiv (1.725):',
            actVeryText: '6-7 Einheiten pro Woche.',
            actExtreme: 'Extrem aktiv (1.9):',
            actExtremeText: 'Sehr harte Aktivität fast täglich.',
            activityNote: 'Viele überschätzen ihre Aktivität. Wenn du unsicher bist, starte lieber eine Stufe niedriger.',
            formulaTitle: 'Formel',
            formulaIntro: 'Prinzip: BMR -> mal Aktivität = TDEE -> plus oder minus Ziel.',
            formulaTdee: 'BMR × Aktivitätsfaktor',
            goalShort: 'Ziel',
            formulaGoal: 'TDEE + (Defizit/Überschuss)',
            exampleTitle: 'Beispiel',
            exampleTop: 'Erhaltung 2600 kcal',
            exampleStrong: 'Cut: 2300-2400',
            exampleSub: 'Ein sauberer Cut ist langsam. Wenn du dich komplett zerschießt, hältst du ihn nicht.',
            macrosTitle: 'Makros (deine Ausgabe)',
            carbsLabel: 'Kohlenhydrate (50%):',
            carbsText: 'Energie und Training.',
            proteinLabel: 'Eiweiß (30%):',
            proteinText: 'Muskeln halten und aufbauen.',
            fatLabel: 'Fett (20%):',
            fatText: 'Hormone und Sättigung.',
            macrosNote: 'Wenn du es ernst meinst, steuere Protein lieber über g/kg. Prozentwerte sind nur ein Default.',
            ignoreTitle: 'Wann du die Zahl ignorieren darfst',
            ignore1: 'Wenn du sauber trackst und dein Gewichtstrend etwas anderes sagt.',
            ignore2: 'Wenn deine Aktivität durch Job oder Alltag brutal schwankt.',
            ignore3: 'Wenn Krankheit oder Stress Appetit und Bewegung durcheinanderbringen.',
            importantTitle: 'Wichtig',
            important1: 'Das ist eine Schätzung. Dein Körper ist die Wahrheit.',
            important2: 'Tracking-Fehler sind der Hauptgrund dafür, dass es scheinbar nicht funktioniert.',
            important3: 'Nach 2-3 Wochen in Schritten von 100-200 kcal anpassen.',
            faqTitle: 'Häufige Fragen',
            faq1q: '"Warum nehme ich nicht ab?"',
            faq1a: 'Meist wird Tracking oder Aktivität überschätzt.',
            faq2q: '"Warum bin ich im Defizit müde?"',
            faq2a: 'Oft zu aggressiv, mit zu wenig Schlaf oder Protein.',
            faq3q: '"Muss ich die Makros genau so machen?"',
            faq3a: 'Nein. Das sind nur Defaults. Protein zuerst.',
            realityTitle: 'Reality-Check',
            realityText: 'Die beste Kalorienzahl ist die, die deinen Trend trifft. Zahlen sind nur der Start. Nachjustieren ist die eigentliche Kunst.',
            ageLabel: 'Alter (Jahre) *',
            agePlaceholder: 'z.B. 30',
            genderLabel: 'Geschlecht *',
            heightLabel: 'Körpergröße (cm) *',
            heightPlaceholder: 'z.B. 175',
            activityInputLabel: 'Aktivitätslevel *',
            activityInfoLabel: 'Aktivitätslevel Erklärung öffnen',
            goalInputLabel: 'Kalorienziel *',
            dailyTargetEyebrow: 'Tagesziel',
            dailyTargetUnit: 'kcal / Tag',
            carbsShort: 'Kohlenhydrate',
            proteinShort: 'Eiweiß',
            fatShort: 'Fett',
        })

    const infoText = computed(() => (props.info ?? '').trim() || ui.value.heroSub)

    const genderOptions = computed(() => locale.value === 'en'
        ? [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]
        : [{ label: 'Männlich', value: 'male' }, { label: 'Weiblich', value: 'female' }])

    const activityOptions = computed(() => locale.value === 'en'
        ? [
            { label: 'Sedentary', value: '1.2' },
            { label: 'Lightly active', value: '1.375' },
            { label: 'Moderately active', value: '1.55' },
            { label: 'Very active', value: '1.725' },
            { label: 'Extremely active', value: '1.9' },
        ]
        : [
            { label: 'Sitzend', value: '1.2' },
            { label: 'Leicht aktiv', value: '1.375' },
            { label: 'Moderat aktiv', value: '1.55' },
            { label: 'Sehr aktiv', value: '1.725' },
            { label: 'Extrem aktiv', value: '1.9' },
        ])

    const goalOptions = computed(() => [
        { label: locale.value === 'en' ? 'Maintenance' : 'Erhaltung', value: 0 },
        ...steps.map((n) => ({ label: `+${n} kcal (${locale.value === 'en' ? 'Surplus' : 'Überschuss'})`, value: n })),
        ...steps.map((n) => ({ label: `-${n} kcal (${locale.value === 'en' ? 'Deficit' : 'Defizit'})`, value: -n })),
    ])

    const weightLabel = computed(() => locale.value === 'en'
        ? `Body weight (${props.unit === 'kg' ? 'kg' : 'lbs'}) *`
        : `Körpergewicht (${props.unit === 'kg' ? 'kg' : 'lbs'}) *`)

    const weightPlaceholder = computed(() => props.unit === 'kg' ? 'z.B. 70' : 'z.B. 155')

    const copyText = computed<string | null>(() => {
        if (!result.value) return null
        const parts: string[] = []
        if (age.value != null) parts.push(`${locale.value === 'en' ? 'Age' : 'Alter'}: ${age.value}`)
        if (gender.value) parts.push(`${locale.value === 'en' ? 'Sex' : 'Geschlecht'}: ${gender.value === 'male' ? (locale.value === 'en' ? 'male' : 'männlich') : (locale.value === 'en' ? 'female' : 'weiblich')}`)
        if (weight.value != null) parts.push(`${locale.value === 'en' ? 'Body weight' : 'Körpergewicht'}: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        if (height.value != null) parts.push(`${locale.value === 'en' ? 'Height' : 'Körpergröße'}: ${height.value} cm`)
        parts.push(`${locale.value === 'en' ? 'Goal' : 'Ziel'}: ${goal.value > 0 ? '+' : ''}${goal.value} kcal`)
        parts.push(`${locale.value === 'en' ? 'Calories' : 'Kalorien'}: ${result.value.total.toFixed(0)} kcal`)
        return parts.join(' | ')
    })

    function validateCalories(): string[] {
        const errors: string[] = []
        const a = props.calorieAge
        if (a == null || Number.isNaN(a)) errors.push(locale.value === 'en' ? 'Please enter your age (years).' : 'Bitte gib dein Alter (Jahre) ein.')
        else if (a <= 0) errors.push(locale.value === 'en' ? 'Age (years) must be greater than 0.' : 'Alter (Jahre) muss größer als 0 sein.')
        else if (a < 10) errors.push(locale.value === 'en' ? 'Age (years) seems unrealistically low.' : 'Alter (Jahre) wirkt unrealistisch niedrig.')
        else if (a > 120) errors.push(locale.value === 'en' ? 'Age (years) seems unrealistically high.' : 'Alter (Jahre) wirkt unrealistisch hoch.')

        if (props.calorieGender !== 'male' && props.calorieGender !== 'female') {
            errors.push(locale.value === 'en' ? 'Please select your sex.' : 'Bitte wähle dein Geschlecht.')
        }

        const w = props.calorieWeight
        if (w == null || Number.isNaN(w)) errors.push(locale.value === 'en' ? 'Please enter your body weight.' : 'Bitte gib dein Körpergewicht ein.')
        else if (w <= 0) errors.push(locale.value === 'en' ? 'Body weight must be greater than 0.' : 'Körpergewicht muss größer als 0 sein.')
        else if (props.unit === 'kg' && w > 400) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high (kg).' : 'Körpergewicht wirkt unrealistisch hoch (kg).')
        else if ((props.unit === 'lb' || props.unit === 'lbs') && w > 900) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high (lbs).' : 'Körpergewicht wirkt unrealistisch hoch (lbs).')

        const h = props.calorieHeight
        if (h == null || Number.isNaN(h)) errors.push(locale.value === 'en' ? 'Please enter your height (cm).' : 'Bitte gib deine Körpergröße (cm) ein.')
        else if (h <= 0) errors.push(locale.value === 'en' ? 'Height (cm) must be greater than 0.' : 'Körpergröße (cm) muss größer als 0 sein.')
        else if (h < 80) errors.push(locale.value === 'en' ? 'Height (cm) seems unrealistically low.' : 'Körpergröße (cm) wirkt unrealistisch niedrig.')
        else if (h > 250) errors.push(locale.value === 'en' ? 'Height (cm) seems unrealistically high.' : 'Körpergröße (cm) wirkt unrealistisch hoch.')

        const act = String(props.calorieActivity ?? '').trim()
        if (!act) errors.push(locale.value === 'en' ? 'Please select your activity level.' : 'Bitte wähle dein Aktivitätslevel.')

        const g = props.calorieGoal
        if (!Number.isFinite(g)) errors.push(locale.value === 'en' ? 'Calorie goal is invalid.' : 'Kalorienziel ist ungültig.')
        else if (Math.abs(g) > 2000) errors.push(locale.value === 'en' ? 'Calorie goal seems unrealistically high.' : 'Kalorienziel wirkt unrealistisch hoch.')

        return errors
    }
</script>

<style scoped>
    .label-with-info {
        display: flex;
        align-items: center;
        gap: .45rem;
        font: inherit;
        font-size: .92rem;
        font-weight: 600;
        line-height: 1.1;
        letter-spacing: .01em;
        color: color-mix(in srgb, var(--text-primary) 88%, transparent);
    }

    .label-with-info .info-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    .calc-card--wide {
        grid-column: 1 / -1;
    }

    .calories-result {
        display: grid;
        gap: .85rem;
        width: 100%;
        margin: 0 auto;
        text-align: center;
    }

    .calories-result__hero {
        display: grid;
        gap: .9rem;
        padding: .95rem 1rem;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.92));
        border: 1px solid rgba(251, 146, 60, 0.18);
    }

    .calories-result__hero-topbar {
        display: flex;
        justify-content: flex-end;
    }

    .calories-result__eyebrow {
        display: block;
        font-size: .68rem;
        font-weight: 900;
        letter-spacing: .14em;
        text-transform: uppercase;
        color: #c2410c;
    }

    .calories-result__total {
        display: block;
        margin-top: .24rem;
        font-size: clamp(2rem, 4vw, 2.8rem);
        line-height: .92;
        letter-spacing: -.05em;
        color: #111827;
    }

    .calories-result__unit {
        display: block;
        margin-top: .18rem;
        font-size: .88rem;
        font-weight: 700;
        color: #6b7280;
    }

    .calories-result__macros {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: .65rem;
        width: 100%;
    }

    .calories-result__macro {
        display: grid;
        justify-items: center;
        padding: .78rem .82rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.9));
        text-align: center;
    }

    .calories-result__macro-label {
        display: block;
        font-size: .66rem;
        font-weight: 900;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: #6b7280;
    }

    .calories-result__macro-value {
        display: block;
        margin-top: .22rem;
        font-size: 1.08rem;
        color: #111827;
    }

    .calories-result__macro-share {
        display: block;
        margin-top: .16rem;
        font-size: .78rem;
        font-weight: 800;
        color: #c2410c;
    }
</style>
