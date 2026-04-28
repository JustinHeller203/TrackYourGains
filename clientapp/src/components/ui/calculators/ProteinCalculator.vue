<template>
    <BaseCalculator :title="title || t('progress.calculators.protein.title')"
                    :showInfo="true"
                    :infoTitle="t('progress.calculators.protein.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="info || defaultInfo"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateProtein"
                    :externalErrors="inlineErrors"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="hasValidResult"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="onCalculateClick"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')"
                    @invalid="handleInvalid">

        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" :aria-label="ui.heroAria">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">{{ ui.heroTitle }}</span>
                </div>

                <div class="calc-hero-sub">{{ ui.heroSub }}</div>

                <div class="calc-hero-pills" :aria-label="ui.quickNav">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">{{ ui.heroChipFormula }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_factors')">{{ ui.heroChipFactors }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.heroChipLimits }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="hasValidResult"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>{{ ui.dayRecommendationLabel }}</strong> {{ roundedGramsPerDay }} g
                            <span v-if="hasValidFactor"> ({{ formattedFactor }} g/kg)</span>
                        </div>

                        <div v-if="showGramsPerMeal" class="calc-note calc-note--tight">
                            {{ ui.mealDistributionPrefix }} {{ roundedGramsPerMeal }} g {{ ui.mealDistributionMiddle }} {{ meals }} {{ ui.mealDistributionSuffix }}
                        </div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('calc_next')">{{ ui.meaningChip }}</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.limitsChip }}</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" :aria-label="ui.quickOverview">
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">{{ ui.formulaChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_example')">{{ ui.exampleChip }}</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('calc_factors')">{{ ui.factorsChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.limitsChip }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="!hasValidResult"
                            :aria-disabled="!hasValidResult"
                            :class="{ 'is-disabled': !hasValidResult }"
                            :title="hasValidResult ? t('common.copy') : t('progress.calculators.copyHint')"
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
                            <li><strong>{{ ui.importantLabel }}</strong> {{ ui.summaryImportant }}</li>
                            <li><strong>{{ ui.takeawayLabel }}</strong> {{ ui.summaryTakeaway }}</li>
                        </ul>
                    </div>
                </div>

                <div id="calc_next"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_next' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.meaningNowTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.bulkLabel }}</strong> {{ ui.bulkText }}</li>
                        <li><strong>{{ ui.cutLabel }}</strong> {{ ui.cutText }}</li>
                        <li><strong>{{ ui.maintainLabel }}</strong> {{ ui.maintainText }}</li>
                    </ul>
                </div>

                <div id="calc_what"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_what' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.whatIsProteinTitle }}</div>
                    <ul class="calc-list">
                        <li><strong>{{ ui.proteinBuildingLabel }}</strong> {{ ui.proteinBuildingText }}</li>
                        <li><strong>{{ ui.proteinFunctionLabel }}</strong> {{ ui.proteinFunctionText }}</li>
                        <li><strong>{{ ui.proteinMadeOfLabel }}</strong> {{ ui.proteinMadeOfText }}</li>
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

                    <section id="calc_factors"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_factors' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.factorsTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.goalFactorLabel }}</strong> {{ ui.goalFactorText }}</li>
                            <li><strong>{{ ui.activityFactorLabel }}</strong> {{ ui.activityFactorText }}</li>
                            <li><strong>{{ ui.weightFactorLabel }}</strong> {{ ui.weightFactorText }}</li>
                        </ul>
                    </section>

                    <section id="calc_aminos"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_aminos' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.aminosTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.aminosBuildLabel }}</strong> {{ ui.aminosBuildText }}</li>
                            <li><strong>{{ ui.aminosEssentialLabel }}</strong> {{ ui.aminosEssentialText }}</li>
                            <li><strong>{{ ui.aminosQualityLabel }}</strong> {{ ui.aminosQualityText }}</li>
                        </ul>
                    </section>

                    <section id="calc_sources"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_sources' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.sourcesTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.sourcesAminosLabel }}</strong> {{ ui.sourcesAminosText }}</li>
                            <li><strong>{{ ui.sourcesSolutionLabel }}</strong> {{ ui.sourcesSolutionText }}</li>
                            <li><strong>{{ ui.sourcesPracticeLabel }}</strong> {{ ui.sourcesPracticeText }}</li>
                        </ul>
                    </section>

                    <section id="calc_hard"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_hard' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.hardTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.hardMealsLabel }}</strong> {{ ui.hardMealsText }}</li>
                            <li><strong>{{ ui.hardSplitLabel }}</strong> {{ ui.hardSplitText }}</li>
                            <li><strong>{{ ui.hardShakeLabel }}</strong> {{ ui.hardShakeText }}</li>
                            <li><strong>{{ ui.hardUpgradeLabel }}</strong> {{ ui.hardUpgradeText }}</li>
                            <li><strong>{{ ui.hardAnchorLabel }}</strong> {{ ui.hardAnchorText }}</li>
                            <li><strong>{{ ui.takeawayLabel }}</strong> {{ ui.hardTakeaway }}</li>
                        </ul>
                    </section>

                    <div id="calc_foods"
                         class="calc-callout"
                         :class="{ 'calc-target': activeTargetId === 'calc_foods' }"
                         tabindex="-1">
                        <div class="calc-callout-title">{{ ui.foodsTitle }}</div>
                        <ul class="calc-list">
                            <li><strong>Parmesan:</strong> ~35g</li>
                            <li><strong>{{ ui.chickenLabel }}</strong> ~31g</li>
                            <li><strong>{{ ui.peanutsLabel }}</strong> ~26g</li>
                            <li><strong>{{ ui.tunaLabel }}</strong> ~25g</li>
                            <li><strong>{{ ui.salmonLabel }}</strong> ~20g</li>
                            <li><strong>{{ ui.eggsLabel }}</strong> ~13g</li>
                            <li><strong>Tofu:</strong> ~12–16g</li>
                            <li><strong>{{ ui.quarkLabel }}</strong> ~10–12g</li>
                        </ul>
                        <div class="calc-note">{{ ui.foodsNote }}</div>
                    </div>

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">Protein</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">{{ ui.formulaText }}</span>
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
                                <span class="calc-example-strong">≈ {{ Math.round(75 * 1.8) }} g</span>
                            </div>
                            <div class="calc-example-sub">{{ ui.exampleSub }}</div>
                        </div>
                    </section>
                </div>

                <div id="calc_ignore"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'calc_ignore' }"
                     tabindex="-1">
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
                        <li><strong>{{ ui.perfectLabel }}</strong> {{ ui.perfectText }}</li>
                        <li><strong>{{ ui.extremeDietLabel }}</strong> {{ ui.extremeDietText }}</li>
                        <li><strong>{{ ui.healthLabel }}</strong> {{ ui.healthText }}</li>
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

        <template #inputs="{ maybeAutoCalc, normalizeNumberInput, errorFor }">
            <UiCalculatorInput :modelValue="weightInputValue"
                               :label="weightLabel"
                               type="text"
                               inputmode="decimal"
                               autocomplete="off"
                               :placeholder="weightPlaceholder"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { onWeightInputValue(v, normalizeNumberInput); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="goal"
                               as="select"
                               :label="ui.goalLabel"
                               :error="errorFor('ziel')"
                               :options="goalOptions"
                               @update:modelValue="(v) => { emit('update:proteinGoal', String(v) as Goal); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="activityEffective"
                               as="select"
                               :label="ui.activityLabel"
                               :error="errorFor('aktivit')"
                               :options="activityOptions"
                               @update:modelValue="(v) => { emit('update:proteinActivity', String(v) as Activity); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="mealsInputValue"
                               :label="ui.mealsLabel"
                               type="text"
                               inputmode="numeric"
                               :error="errorFor('mahlzeiten')"
                               autocomplete="off"
                               :placeholder="ui.mealsPlaceholder"
                               :hint="ui.mealsHint"
                               @update:modelValue="(v) => { onMealsInputValue(v) }" />
        </template>

        <template #result>
            <p v-if="hasValidResult">
                <strong>{{ ui.dayRecommendationLabel }}</strong>
                {{ roundedGramsPerDay }} g
                <span v-if="hasValidFactor">({{ formattedFactor }} g/kg)</span>
            </p>
        </template>

        <template #result-sub>
            <p v-if="showGramsPerMeal" class="result-sub">
                {{ ui.mealDistributionPrefix }} {{ roundedGramsPerMeal }} g {{ ui.mealDistributionMiddle }} {{ meals }} {{ ui.mealDistributionSuffix }}
            </p>
        </template>
    </BaseCalculator>
</template>

<script setup lang="ts">
    import { ref, computed, watch } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import { useI18n } from '@/composables/useI18n'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type Unit = 'kg' | 'lb' | 'lbs' | string
    type Goal = 'maintain' | 'bulk' | 'cut'
    type Activity = 'low' | 'moderate' | 'high'

    interface ProteinResult {
        recommend: number
        factor: number
        weightDisplay?: string
    }

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        proteinWeight: number | null
        proteinGoal: Goal
        proteinActivity: Activity | null
        proteinMeals: number | null
        proteinResult?: ProteinResult | null
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const { locale, t } = useI18n()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:proteinWeight', v: number | null): void
        (e: 'update:proteinGoal', v: Goal): void
        (e: 'update:proteinActivity', v: Activity): void
        (e: 'update:proteinMeals', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const inlineErrors = ref<string[]>([])

    const ui = computed(() => locale.value === 'en'
        ? {
            heroAria: 'Protein quick card',
            heroTitle: 'What is the protein needs calculator?',
            heroSub: 'It estimates your daily protein needs from body weight, goal, and activity so you have a useful guide.',
            quickNav: 'Quick navigation',
            heroChipFormula: 'How it is estimated',
            heroChipFactors: 'What affects it?',
            heroChipLimits: 'Limits',
            youTitle: 'Your result',
            dayRecommendationLabel: 'Recommendation/day:',
            mealDistributionPrefix: '≈',
            mealDistributionMiddle: 'g per meal (with',
            mealDistributionSuffix: 'meals/day)',
            meaningChip: 'What does that mean?',
            limitsChip: 'Limits',
            quickOverview: 'Quick overview',
            formulaChip: 'Formula',
            exampleChip: 'Example',
            factorsChip: 'Factors',
            summaryTitle: 'Quick summary',
            summaryIntro: 'The calculator estimates your protein needs from body weight, goal, and activity.',
            goodLabel: 'Good:',
            summaryGood: 'A simple daily guideline.',
            importantLabel: 'Important:',
            summaryImportant: 'During a cut and with heavy training, more protein is often useful.',
            takeawayLabel: 'Takeaway:',
            summaryTakeaway: 'Consistency beats perfection. Hitting your range matters most.',
            meaningNowTitle: 'What does that mean now?',
            bulkLabel: 'Muscle gain:',
            bulkText: 'Distribute protein well and combine it with progressive training.',
            cutLabel: 'Fat loss:',
            cutText: 'Protein helps with satiety and muscle retention.',
            maintainLabel: 'Maintain weight:',
            maintainText: 'A solid base is enough when training and daily life are on point.',
            whatIsProteinTitle: 'What are proteins?',
            proteinBuildingLabel: 'Building material:',
            proteinBuildingText: 'Proteins are the building material for muscles, organs, skin, and hair.',
            proteinFunctionLabel: 'Function:',
            proteinFunctionText: 'They are also part of enzymes, hormones, and the immune system.',
            proteinMadeOfLabel: 'Made of:',
            proteinMadeOfText: 'Amino acids, your basic building blocks.',
            forWhoTitle: 'Who is this useful for?',
            forWho1: 'Strength training, fitness, and everyday life.',
            forWho2: 'Useful for structuring nutrition roughly.',
            forWho3: 'Special medical cases should be checked professionally.',
            factorsTitle: 'What affects the requirement?',
            goalFactorLabel: 'Goal:',
            goalFactorText: 'A cut often needs more protein to protect muscle.',
            activityFactorLabel: 'Activity:',
            activityFactorText: 'More training usually means more need.',
            weightFactorLabel: 'Body weight:',
            weightFactorText: 'The base for g/kg recommendations.',
            aminosTitle: 'What are amino acids?',
            aminosBuildLabel: 'Protein building blocks:',
            aminosBuildText: 'Your body uses them for muscle, enzymes, and hormones.',
            aminosEssentialLabel: 'Essential:',
            aminosEssentialText: 'Some must come from food because the body cannot make them.',
            aminosQualityLabel: 'Quality:',
            aminosQualityText: 'A more complete amino profile makes coverage easier.',
            sourcesTitle: 'Animal vs plant-based',
            sourcesAminosLabel: 'Amino profile:',
            sourcesAminosText: 'Animal sources are often more complete, plant sources can be limiting.',
            sourcesSolutionLabel: 'Solution:',
            sourcesSolutionText: 'Plant-based eating works well when you combine foods smartly.',
            sourcesPracticeLabel: 'In practice:',
            sourcesPracticeText: 'Both work. Hitting your range matters most.',
            hardTitle: 'If you cannot hit it',
            hardMealsLabel: 'More meals:',
            hardMealsText: 'Split intake into smaller portions.',
            hardSplitLabel: 'Split:',
            hardSplitText: 'Use one or two protein snacks per day.',
            hardShakeLabel: 'Shake:',
            hardShakeText: 'Drinking protein is often easier.',
            hardUpgradeLabel: 'Upgrade:',
            hardUpgradeText: 'Add a protein source to meals you already eat.',
            hardAnchorLabel: 'Anchor habit:',
            hardAnchorText: 'Every meal gets a protein base.',
            hardTakeaway: 'Weekly consistency matters more than one perfect day.',
            foodsTitle: 'Good protein sources (avg. per 100 g)',
            chickenLabel: 'Chicken breast:',
            peanutsLabel: 'Peanuts:',
            tunaLabel: 'Tuna:',
            salmonLabel: 'Salmon:',
            eggsLabel: 'Eggs:',
            quarkLabel: 'Low-fat quark/Skyr:',
            foodsNote: 'These are rough values and can vary a bit by product.',
            formulaTitle: 'Formula (simplified)',
            formulaText: 'body weight (kg) × factor (g/kg)',
            formulaNote: 'If you use lbs, the calculator converts internally to kg.',
            exampleTitle: 'Example',
            exampleTop: '75 kg, muscle gain, moderately active',
            exampleSub: 'This is a guideline. What matters is hitting it consistently.',
            ignoreTitle: 'When you can safely ignore the calculator',
            ignore1: 'If you already hit your protein range reliably.',
            ignore2: 'If your weight and training are stable and you feel good.',
            ignore3: 'If you only want a rough “enough” approach without tracking.',
            importantTitle: 'Important (so you use it correctly)',
            perfectLabel: 'A perfect number:',
            perfectText: 'Does not exist. Aim for a range.',
            extremeDietLabel: 'Very little food:',
            extremeDietText: 'Crash diets increase muscle-loss risk.',
            healthLabel: 'Health or medication:',
            healthText: 'Get medical advice if needed.',
            faqTitle: 'Frequently asked questions',
            faq1q: '"Do I need to hit it exactly every day?"',
            faq1a: 'No. The weekly average matters more.',
            faq2q: '"Why does the goal matter?"',
            faq2a: 'During a cut, more protein helps protect muscle mass.',
            faq3q: '"Is more always better?"',
            faq3a: 'Not necessarily. Hit your range and you are fine.',
            realityTitle: 'Reality check',
            realityText: 'If you train regularly and hit protein reasonably well, you are already doing a lot right.',
            goalLabel: 'Goal *',
            activityLabel: 'Activity *',
            mealsLabel: 'Meals/day (optional)',
            mealsPlaceholder: 'e.g. 3',
            mealsHint: 'If set, we also show grams per meal.',
        }
        : {
            heroAria: 'Protein Kurzkarte',
            heroTitle: 'Was ist der Proteinbedarfsrechner?',
            heroSub: 'Er schätzt deinen täglichen Proteinbedarf aus Körpergewicht, Ziel und Aktivität, damit du eine sinnvolle Orientierung hast.',
            quickNav: 'Schnellnavigation',
            heroChipFormula: 'So wird es geschätzt',
            heroChipFactors: 'Was beeinflusst das?',
            heroChipLimits: 'Grenzen',
            youTitle: 'Dein Ergebnis',
            dayRecommendationLabel: 'Empfehlung/Tag:',
            mealDistributionPrefix: '≈',
            mealDistributionMiddle: 'g pro Mahlzeit (bei',
            mealDistributionSuffix: 'Mahlzeiten/Tag)',
            meaningChip: 'Was heißt das?',
            limitsChip: 'Grenzen',
            quickOverview: 'Kurzüberblick',
            formulaChip: 'Formel',
            exampleChip: 'Beispiel',
            factorsChip: 'Faktoren',
            summaryTitle: 'Kurzfassung',
            summaryIntro: 'Der Rechner schätzt deinen Proteinbedarf aus Körpergewicht, Ziel und Aktivität.',
            goodLabel: 'Gut:',
            summaryGood: 'Ein einfacher Richtwert für deinen Tag.',
            importantLabel: 'Wichtig:',
            summaryImportant: 'Im Cut und bei viel Training ist oft mehr Protein sinnvoll.',
            takeawayLabel: 'Merke:',
            summaryTakeaway: 'Konstanz schlägt Perfektion. Hauptsache du triffst deinen Bereich.',
            meaningNowTitle: 'Was heißt das jetzt?',
            bulkLabel: 'Muskelaufbau:',
            bulkText: 'Protein gut verteilen und mit progressivem Training kombinieren.',
            cutLabel: 'Fettverlust:',
            cutText: 'Protein hilft bei Sättigung und Muskelerhalt.',
            maintainLabel: 'Gewicht halten:',
            maintainText: 'Eine solide Basis reicht, wenn Training und Alltag passen.',
            whatIsProteinTitle: 'Was sind Proteine?',
            proteinBuildingLabel: 'Baustoff:',
            proteinBuildingText: 'Proteine sind Baumaterial für Muskeln, Organe, Haut und Haare.',
            proteinFunctionLabel: 'Funktion:',
            proteinFunctionText: 'Sie stecken auch in Enzymen, Hormonen und dem Immunsystem.',
            proteinMadeOfLabel: 'Bestehen aus:',
            proteinMadeOfText: 'Aminosäuren, also deinen Bausteinen.',
            forWhoTitle: 'Für wen ist das sinnvoll?',
            forWho1: 'Krafttraining, Fitness und Alltag.',
            forWho2: 'Gut, um Ernährung grob zu strukturieren.',
            forWho3: 'Sonderfälle bei Gesundheit oder Medikamenten lieber abklären.',
            factorsTitle: 'Was beeinflusst den Bedarf?',
            goalFactorLabel: 'Ziel:',
            goalFactorText: 'Ein Cut braucht oft mehr Protein zum Muskelschutz.',
            activityFactorLabel: 'Aktivität:',
            activityFactorText: 'Mehr Training bedeutet meist mehr Bedarf.',
            weightFactorLabel: 'Körpergewicht:',
            weightFactorText: 'Die Basis für Empfehlungen in g/kg.',
            aminosTitle: 'Was sind Aminosäuren?',
            aminosBuildLabel: 'Bausteine von Protein:',
            aminosBuildText: 'Der Körper nutzt sie für Muskeln, Enzyme und Hormone.',
            aminosEssentialLabel: 'Essentiell:',
            aminosEssentialText: 'Einige müssen über die Ernährung kommen, weil der Körper sie nicht selbst bildet.',
            aminosQualityLabel: 'Qualität:',
            aminosQualityText: 'Ein vollständigeres Aminoprofil macht die Versorgung leichter.',
            sourcesTitle: 'Tierisch vs. pflanzlich',
            sourcesAminosLabel: 'Aminoprofil:',
            sourcesAminosText: 'Tierische Quellen sind oft vollständiger, pflanzliche können limitieren.',
            sourcesSolutionLabel: 'Lösung:',
            sourcesSolutionText: 'Pflanzlich klappt gut, wenn du Lebensmittel sinnvoll kombinierst.',
            sourcesPracticeLabel: 'Praxis:',
            sourcesPracticeText: 'Beides funktioniert. Entscheidend ist, dass du deinen Bereich triffst.',
            hardTitle: 'Wenn du es nicht schaffst',
            hardMealsLabel: 'Mehr Mahlzeiten:',
            hardMealsText: 'Auf kleinere Portionen aufteilen.',
            hardSplitLabel: 'Split:',
            hardSplitText: 'Ein oder zwei Protein-Snacks am Tag nutzen.',
            hardShakeLabel: 'Shake:',
            hardShakeText: 'Trinken ist oft leichter als essen.',
            hardUpgradeLabel: 'Upgrade:',
            hardUpgradeText: 'Zu bestehenden Mahlzeiten eine Proteinquelle ergänzen.',
            hardAnchorLabel: 'Fixer Anker:',
            hardAnchorText: 'Jede Mahlzeit bekommt eine Proteinbasis.',
            hardTakeaway: 'Wochenschnitt ist wichtiger als ein perfekter Tag.',
            foodsTitle: 'Gute Proteinquellen (Ø pro 100 g)',
            chickenLabel: 'Hähnchenbrust:',
            peanutsLabel: 'Erdnüsse:',
            tunaLabel: 'Thunfisch:',
            salmonLabel: 'Lachs:',
            eggsLabel: 'Eier:',
            quarkLabel: 'Magerquark/Skyr:',
            foodsNote: 'Das sind grobe Richtwerte und können je nach Produkt etwas variieren.',
            formulaTitle: 'Formel (vereinfacht)',
            formulaText: 'Körpergewicht (kg) × Faktor (g/kg)',
            formulaNote: 'Bei lbs rechnet der Rechner intern in kg um.',
            exampleTitle: 'Beispiel',
            exampleTop: '75 kg, Muskelaufbau, moderat aktiv',
            exampleSub: 'Das ist ein Richtwert. Entscheidend ist, dass du ihn regelmäßig triffst.',
            ignoreTitle: 'Wann du den Rechner locker ignorieren darfst',
            ignore1: 'Wenn du deinen Proteinbereich ohnehin zuverlässig triffst.',
            ignore2: 'Wenn Gewicht und Training stabil sind und du dich fit fühlst.',
            ignore3: 'Wenn du nur grob „genug“ essen willst, ohne Zahlen zu tracken.',
            importantTitle: 'Wichtig (damit du es richtig nutzt)',
            perfectLabel: 'Ein perfekter Wert:',
            perfectText: 'Existiert nicht. Triff einen Bereich.',
            extremeDietLabel: 'Extrem wenig Essen:',
            extremeDietText: 'Crash-Diäten erhöhen das Risiko für Muskelverlust.',
            healthLabel: 'Gesundheit oder Medikamente:',
            healthText: 'Im Zweifel lieber medizinisch abklären.',
            faqTitle: 'Häufige Fragen',
            faq1q: '„Muss ich jeden Tag exakt treffen?“',
            faq1a: 'Nein. Der Wochenschnitt zählt mehr.',
            faq2q: '„Warum hängt das vom Ziel ab?“',
            faq2a: 'Im Cut schützt mehr Protein eher deine Muskelmasse.',
            faq3q: '„Ist mehr immer besser?“',
            faq3a: 'Nicht unbedingt. Triff deinen Bereich und dann passt es.',
            realityTitle: 'Reality-Check',
            realityText: 'Wenn du regelmäßig trainierst und dein Protein halbwegs triffst, machst du schon viel richtig.',
            goalLabel: 'Ziel *',
            activityLabel: 'Aktivität *',
            mealsLabel: 'Mahlzeiten/Tag (optional)',
            mealsPlaceholder: 'z. B. 3',
            mealsHint: 'Wenn gesetzt, zeigen wir zusätzlich g pro Mahlzeit.',
        })

    function handleInvalid(errors: string[]) {
        inlineErrors.value = errors
        emit('invalid', errors)
    }

    const LBS_TO_KG = 0.45359237
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

    const unitNormalized = computed<'kg' | 'lbs'>(() => {
        const u = String(props.unit || 'kg').toLowerCase()
        return u === 'lb' || u === 'lbs' ? 'lbs' : 'kg'
    })

    const weightLabel = computed(() => locale.value === 'en'
        ? `Body weight (${unitNormalized.value === 'kg' ? 'kg' : 'lbs'}) *`
        : `Körpergewicht (${unitNormalized.value === 'kg' ? 'kg' : 'lbs'}) *`)

    const weightPlaceholder = computed(() => unitNormalized.value === 'kg' ? 'z. B. 75' : 'z. B. 165')

    const goalOptions = computed(() => locale.value === 'en'
        ? [
            { label: 'Fat loss', value: 'cut' },
            { label: 'Maintain weight', value: 'maintain' },
            { label: 'Muscle gain', value: 'bulk' },
        ]
        : [
            { label: 'Fettverlust', value: 'cut' },
            { label: 'Gewicht halten', value: 'maintain' },
            { label: 'Muskelaufbau', value: 'bulk' },
        ])

    const activityOptions = computed(() => locale.value === 'en'
        ? [
            { label: 'Low', value: 'low' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'High', value: 'high' },
        ]
        : [
            { label: 'Niedrig', value: 'low' },
            { label: 'Moderat', value: 'moderate' },
            { label: 'Hoch', value: 'high' },
        ])

    const activityEffective = computed<Activity>(() => {
        const a = (props.proteinActivity as Activity | null) ?? null
        return a === 'low' || a === 'moderate' || a === 'high' ? a : 'moderate'
    })

    function proteinFactor(goal: Goal, activity: Activity): number {
        const base = goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : 1.6
        const delta = activity === 'low' ? -0.2 : activity === 'high' ? 0.3 : 0
        return clamp(base + delta, 1.2, 2.7)
    }

    function computeLocalResult(): ProteinResult | null {
        const errors: string[] = []
        const wRaw = props.proteinWeight
        if (wRaw == null || Number.isNaN(wRaw)) {
            errors.push(locale.value === 'en' ? 'Please enter your body weight.' : 'Bitte gib dein Körpergewicht ein.')
        } else {
            if (wRaw <= 0) errors.push(locale.value === 'en' ? 'Body weight must be greater than 0.' : 'Körpergewicht muss größer als 0 sein.')
            else if (unitNormalized.value === 'kg' && wRaw > 400) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high.' : 'Körpergewicht wirkt unrealistisch hoch.')
            else if (unitNormalized.value === 'lbs' && wRaw > 900) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high.' : 'Körpergewicht wirkt unrealistisch hoch.')
        }

        if (errors.length) {
            handleInvalid(errors)
            return null
        }

        inlineErrors.value = []
        const weightKg = unitNormalized.value === 'lbs' ? (wRaw! * LBS_TO_KG) : wRaw!
        const factor = proteinFactor(props.proteinGoal, activityEffective.value)
        return {
            recommend: weightKg * factor,
            factor,
            weightDisplay: `${wRaw} ${unitNormalized.value === 'kg' ? 'kg' : 'lbs'}`,
        }
    }

    const internalResult = ref<ProteinResult | null>(null)

    watch(() => [props.proteinWeight, props.proteinGoal, activityEffective.value, unitNormalized.value], () => {
        if (props.autoCalcEnabled) internalResult.value = computeLocalResult()
    }, { immediate: true })

    const effectiveResult = computed<ProteinResult | null>(() =>
        props.autoCalcEnabled
            ? (internalResult.value ?? props.proteinResult ?? null)
            : (props.proteinResult ?? internalResult.value ?? null))

    const goal = computed(() => props.proteinGoal)
    const meals = computed(() => props.proteinMeals ?? null)

    const weightInputValue = computed(() =>
        props.proteinWeight == null || Number.isNaN(props.proteinWeight) ? '' : String(props.proteinWeight))
    const mealsInputValue = computed(() =>
        props.proteinMeals == null || Number.isNaN(props.proteinMeals) ? '' : String(props.proteinMeals))

    const hasValidResult = computed(() =>
        !!effectiveResult.value && Number.isFinite(effectiveResult.value.recommend) && effectiveResult.value.recommend > 0)
    const hasValidFactor = computed(() =>
        !!effectiveResult.value && Number.isFinite(effectiveResult.value.factor) && effectiveResult.value.factor > 0)
    const showGramsPerMeal = computed(() => !!effectiveResult.value && !!props.proteinMeals && props.proteinMeals >= 1)

    const roundedGramsPerDay = computed(() => hasValidResult.value ? Math.round(effectiveResult.value!.recommend) : 0)
    const roundedGramsPerMeal = computed(() => {
        if (!showGramsPerMeal.value) return 0
        const perMeal = effectiveResult.value!.recommend / Number(props.proteinMeals)
        return Number.isFinite(perMeal) && perMeal > 0 ? Math.round(perMeal) : 0
    })
    const formattedFactor = computed(() => hasValidFactor.value ? effectiveResult.value!.factor.toFixed(2) : '')

    const defaultInfo = computed(() => locale.value === 'en'
        ? 'Estimates your protein needs in grams per day from body weight, goal, and activity. Guideline only, not medical advice.'
        : 'Schätzt deinen Proteinbedarf in Gramm pro Tag aus Körpergewicht, Ziel und Aktivität. Richtwert, keine medizinische Beratung.')

    const copyText = computed<string | null>(() => {
        if (!hasValidResult.value) return null
        const parts: string[] = []
        if (props.proteinWeight != null) parts.push(`${locale.value === 'en' ? 'Body weight' : 'Körpergewicht'}: ${props.proteinWeight} ${unitNormalized.value}`)
        parts.push(`${locale.value === 'en' ? 'Goal' : 'Ziel'}: ${props.proteinGoal}`)
        parts.push(`${locale.value === 'en' ? 'Activity' : 'Aktivität'}: ${activityEffective.value}`)
        if (props.proteinMeals != null) parts.push(`${locale.value === 'en' ? 'Meals/day' : 'Mahlzeiten/Tag'}: ${props.proteinMeals}`)
        parts.push(`Protein/day: ${roundedGramsPerDay.value} g`)
        if (hasValidFactor.value) parts.push(`Factor: ${formattedFactor.value} g/kg`)
        if (showGramsPerMeal.value) parts.push(`${locale.value === 'en' ? 'Per meal' : 'Pro Mahlzeit'}: ${roundedGramsPerMeal.value} g`)
        return parts.join(' | ')
    })

    function onCalculateClick() {
        internalResult.value = computeLocalResult()
        emit('calculate')
    }

    function onWeightInputValue(v: string | number, normalize?: (raw: string) => string) {
        const raw0 = String(v ?? '')
        const raw = normalize ? normalize(raw0) : raw0.trim().replace(',', '.')
        if (raw === '') return emit('update:proteinWeight', null)
        const n = Number(raw)
        emit('update:proteinWeight', Number.isFinite(n) ? n : null)
    }

    function onMealsInputValue(v: string | number) {
        const raw = String(v ?? '').replace(/[^\d]/g, '')
        if (raw === '') return emit('update:proteinMeals', null)
        const n = Number(raw)
        emit('update:proteinMeals', Number.isFinite(n) ? Math.max(1, Math.floor(n)) : null)
    }

    function validateProtein(): string[] {
        const errors: string[] = []
        const w = props.proteinWeight
        if (w == null || Number.isNaN(w)) {
            errors.push(locale.value === 'en' ? 'Please enter your body weight.' : 'Bitte gib dein Körpergewicht ein.')
            return errors
        }
        if (w <= 0) errors.push(locale.value === 'en' ? 'Body weight must be greater than 0.' : 'Körpergewicht muss größer als 0 sein.')
        else if (unitNormalized.value === 'kg' && w > 400) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high.' : 'Körpergewicht wirkt unrealistisch hoch.')
        else if (unitNormalized.value === 'lbs' && w > 900) errors.push(locale.value === 'en' ? 'Body weight seems unrealistically high.' : 'Körpergewicht wirkt unrealistisch hoch.')

        if (!['cut', 'maintain', 'bulk'].includes(props.proteinGoal)) {
            errors.push(locale.value === 'en' ? 'Please select your goal.' : 'Bitte wähle dein Ziel.')
        }

        const a = props.proteinActivity
        if (a == null || !['low', 'moderate', 'high'].includes(a)) {
            errors.push(locale.value === 'en' ? 'Please select your activity.' : 'Bitte wähle deine Aktivität.')
        }

        const m = props.proteinMeals
        if (m != null) {
            if (!Number.isFinite(m)) errors.push(locale.value === 'en' ? 'Meals/day is invalid.' : 'Mahlzeiten/Tag ist ungültig.')
            else if (m < 1) errors.push(locale.value === 'en' ? 'Meals/day must be at least 1.' : 'Mahlzeiten/Tag muss mindestens 1 sein.')
            else if (m > 20) errors.push(locale.value === 'en' ? 'Meals/day seems unrealistically high.' : 'Mahlzeiten/Tag wirkt unrealistisch hoch.')
        }

        return errors
    }
</script>

<style scoped>
    .result-sub {
        font-size: .95rem;
        color: var(--text-secondary);
    }
</style>
