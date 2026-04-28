<template>
    <BaseCalculator :title="title || t('progress.calculators.oneRm.title')"
                    :showInfo="true"
                    :infoTitle="t('progress.calculators.oneRm.title')"
                    :infoKicker="t('progress.calculators.infoKicker')"
                    :ariaOpen="t('progress.calculators.openInfo')"
                    :ariaClose="t('common.close')"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :validate="validateOneRm"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="hasResult"
                    :copyText="copyText ?? null"
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
                    <button class="calc-chip" type="button" @click="jumpTo('calc_formula')">{{ ui.formulaChip }}</button>
                    <button class="calc-chip" type="button" @click="jumpTo('calc_example')">{{ ui.exampleChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.limitsChip }}</button>
                </div>
            </div>
        </template>

        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="hasResult"
                     id="calc_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'calc_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">{{ ui.youTitle }}</div>
                    <div class="calc-callout-text">
                        <div><strong>{{ ui.resultLabel }} {{ exercise || ui.exerciseFallback }}</strong> {{ displayResult }}</div>
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
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('calc_use')">{{ ui.useChip }}</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('calc_limits')">{{ ui.limitsChip }}</button>
                    <button class="calc-chip"
                            type="button"
                            :disabled="!hasResult"
                            :aria-disabled="!hasResult"
                            :class="{ 'is-disabled': !hasResult }"
                            :title="hasResult ? t('common.copy') : t('progress.calculators.copyHint')"
                            @click="async () => { await onCopy?.(); jumpTo('calc_you') }">
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
                        <li><strong>{{ ui.hypertrophyLabel }}</strong> {{ ui.hypertrophyText }}</li>
                        <li><strong>{{ ui.strengthLabel }}</strong> {{ ui.strengthText }}</li>
                        <li><strong>{{ ui.techniqueLabel }}</strong> {{ ui.techniqueText }}</li>
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

                    <section id="calc_use"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_use' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.useTitle }}</h4>
                        <ul class="calc-list">
                            <li><strong>{{ ui.usePlanningLabel }}</strong> {{ ui.usePlanningText }}</li>
                            <li><strong>{{ ui.useCompareLabel }}</strong> {{ ui.useCompareText }}</li>
                            <li><strong>{{ ui.useNoteLabel }}</strong> {{ ui.useNoteText }}</li>
                        </ul>
                    </section>

                    <section id="calc_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'calc_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">{{ ui.formulaTitle }}</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">1RM</span>
                            <span class="calc-formula-eq">≈</span>
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
                                <span class="calc-example-strong">{{ ui.exampleStrong }}</span>
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
                        <li><strong>{{ ui.highRepsLabel }}</strong> {{ ui.highRepsText }}</li>
                        <li><strong>{{ ui.cheatLabel }}</strong> {{ ui.cheatText }}</li>
                        <li><strong>{{ ui.painLabel }}</strong> {{ ui.painText }}</li>
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
            <UiCalculatorInput :modelValue="exercise"
                               :label="ui.exerciseLabel"
                               type="text"
                               :placeholder="ui.exercisePlaceholder"
                               autocomplete="off"
                               :error="errorFor('übung')"
                               @update:modelValue="(v) => { emit('update:oneRmExercise', String(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="weightInputValue"
                               :label="weightLabel"
                               type="text"
                               inputmode="decimal"
                               autocomplete="off"
                               :placeholder="weightPlaceholder"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { onWeightInputValue(v, normalizeNumberInput); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="repsInputValue"
                               :label="ui.repsLabel"
                               type="text"
                               inputmode="numeric"
                               autocomplete="off"
                               :placeholder="ui.repsPlaceholder"
                               :error="errorFor('wiederholungen')"
                               @update:modelValue="(v) => { onRepsInputValue(v); maybeAutoCalc() }" />
        </template>

        <template #result>
            <div v-if="hasResult">
                <p><strong>{{ ui.resultLabel }} {{ exercise || ui.exerciseFallback }}</strong> {{ displayResult }}</p>
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
    type NormalizeFn = (raw: string) => string

    const props = defineProps<{
        unit: Unit
        autoCalcEnabled: boolean
        oneRmExercise: string
        oneRmWeight: number | null
        oneRmReps: number | null
        oneRmResult: number | null
        formattedResult?: string
        isFavorite: boolean
        title?: string
        info?: string
    }>()

    const { locale, t } = useI18n()

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'update:oneRmExercise', v: string): void
        (e: 'update:oneRmWeight', v: number | null): void
        (e: 'update:oneRmReps', v: number | null): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const ui = computed(() => locale.value === 'en'
        ? {
            heroAria: '1RM quick card',
            heroTitle: 'How strong are you really?',
            heroSub: 'Estimate your one-rep max. Useful for training, not for ego lifting.',
            quickNav: 'Quick navigation',
            formulaChip: 'Formula',
            exampleChip: 'Example',
            limitsChip: 'Limits',
            youTitle: 'Your result',
            resultLabel: '1RM for',
            exerciseFallback: 'exercise:',
            youNote: 'Use it for planning percentages, not for maxing out every session.',
            meaningChip: 'What does that mean?',
            quickOverview: 'Quick overview',
            useChip: 'Use',
            summaryTitle: 'Quick summary',
            summaryIntro: 'The calculator estimates your 1RM from weight and reps using the Epley formula.',
            goodLabel: 'Useful:',
            summaryGood: 'Very practical for training percentages and progress.',
            importantLabel: 'Important:',
            summaryImportant: 'Clean technique matters more than the number.',
            takeawayLabel: 'Takeaway:',
            summaryTakeaway: 'Very high rep sets make the estimate less accurate.',
            meaningNowTitle: 'What does that mean now?',
            hypertrophyLabel: 'Hypertrophy:',
            hypertrophyText: 'Often around 65-80% of 1RM.',
            strengthLabel: 'Strength:',
            strengthText: 'Often around 80-92% of 1RM.',
            techniqueLabel: 'Technique/speed:',
            techniqueText: 'Often around 50-70% of 1RM.',
            forWhoTitle: 'Who is this useful for?',
            forWho1: 'Strength training and progressive overload.',
            forWho2: 'Planning work sets by percentage.',
            forWho3: 'For beginners it is mostly a rough guide.',
            useTitle: 'What is 1RM used for?',
            usePlanningLabel: 'Planning:',
            usePlanningText: 'Work sets as percentages of 1RM.',
            useCompareLabel: 'Comparison:',
            useCompareText: 'Track progress without testing a true max.',
            useNoteLabel: 'Note:',
            useNoteText: 'Day-to-day performance can move by a few percent.',
            formulaTitle: 'Formula (Epley)',
            formulaText: 'weight × (1 + reps / 30)',
            formulaNote: 'Accuracy is usually best around 1-10 reps.',
            exampleTitle: 'Example',
            exampleTop: '80 kg × 8 reps',
            exampleStrong: '≈ 101.3 kg',
            exampleSub: 'A real max test can still differ depending on technique and fatigue.',
            ignoreTitle: 'When you can safely ignore the 1RM calculator',
            ignore1: 'If you train by RPE or RIR and your progress is already good.',
            ignore2: 'If the exercise setup changes all the time and comparison is weak.',
            ignore3: 'If you are completely new and first need technique and routine.',
            importantTitle: 'Important (so you use it correctly)',
            highRepsLabel: 'High reps (10+):',
            highRepsText: 'The estimate gets much less accurate.',
            cheatLabel: 'Cheat reps:',
            cheatText: 'The number becomes far less meaningful.',
            painLabel: 'Pain or unsafe technique:',
            painText: 'Do not chase max numbers there.',
            faqTitle: 'Frequently asked questions',
            faq1q: '"Which formula is this?"',
            faq1a: 'Epley, a common standard estimate.',
            faq2q: '"Why does it vary?"',
            faq2a: 'Technique, rest, daily form, and range of motion all matter.',
            faq3q: '"Should I test a true 1RM?"',
            faq3a: 'Only with experience and a safe setup.',
            realityTitle: 'Reality check',
            realityText: 'Your best tools are still clean reps and consistent progress. 1RM is only one number.',
            exerciseLabel: 'Exercise *',
            exercisePlaceholder: 'e.g. Bench press',
            repsLabel: 'Repetitions *',
            repsPlaceholder: 'e.g. 8',
        }
        : {
            heroAria: '1RM Kurzkarte',
            heroTitle: 'Wie stark bist du wirklich?',
            heroSub: 'Schätzung deines Maximalgewichts für eine Wiederholung. Sinnvoll fürs Training, nicht fürs Ego.',
            quickNav: 'Schnellnavigation',
            formulaChip: 'Formel',
            exampleChip: 'Beispiel',
            limitsChip: 'Grenzen',
            youTitle: 'Dein Ergebnis',
            resultLabel: '1RM für',
            exerciseFallback: 'Übung:',
            youNote: 'Nutze das für Trainingsplanung mit Prozenten, nicht um ständig ans Limit zu gehen.',
            meaningChip: 'Was heißt das?',
            quickOverview: 'Kurzüberblick',
            useChip: 'Nutzen',
            summaryTitle: 'Kurzfassung',
            summaryIntro: 'Der Rechner schätzt dein 1RM aus Gewicht und Wiederholungen mit der Epley-Formel.',
            goodLabel: 'Gut:',
            summaryGood: 'Sehr hilfreich für Trainingsprozente und Progress.',
            importantLabel: 'Wichtig:',
            summaryImportant: 'Saubere Technik ist wichtiger als die Zahl.',
            takeawayLabel: 'Merke:',
            summaryTakeaway: 'Bei sehr hohen Wiederholungen wird die Schätzung deutlich ungenauer.',
            meaningNowTitle: 'Was heißt das jetzt?',
            hypertrophyLabel: 'Hypertrophie:',
            hypertrophyText: 'Oft ungefähr 65-80% vom 1RM.',
            strengthLabel: 'Kraft:',
            strengthText: 'Oft ungefähr 80-92% vom 1RM.',
            techniqueLabel: 'Technik/Speed:',
            techniqueText: 'Oft ungefähr 50-70% vom 1RM.',
            forWhoTitle: 'Für wen ist das sinnvoll?',
            forWho1: 'Krafttraining und progressive Überlastung.',
            forWho2: 'Arbeitssätze nach Prozent planen.',
            forWho3: 'Für Anfänger eher nur ein grober Richtwert.',
            useTitle: 'Wofür nutzt man 1RM?',
            usePlanningLabel: 'Planung:',
            usePlanningText: 'Arbeitssätze in Prozent vom 1RM.',
            useCompareLabel: 'Vergleich:',
            useCompareText: 'Fortschritt ohne echten Max-Test sehen.',
            useNoteLabel: 'Hinweis:',
            useNoteText: 'Die Tagesform kann ein paar Prozent Unterschied machen.',
            formulaTitle: 'Formel (Epley)',
            formulaText: 'Gewicht × (1 + Wiederholungen / 30)',
            formulaNote: 'Am genauesten ist die Schätzung meist bei 1-10 Wiederholungen.',
            exampleTitle: 'Beispiel',
            exampleTop: '80 kg × 8 Wiederholungen',
            exampleStrong: '≈ 101,3 kg',
            exampleSub: 'Ein echter Max-Test kann je nach Technik und Tagesform trotzdem abweichen.',
            ignoreTitle: 'Wann du den 1RM-Rechner locker ignorieren darfst',
            ignore1: 'Wenn du nach RPE oder RIR trainierst und dein Progress passt.',
            ignore2: 'Wenn die Übungsausführung ständig variiert und schlecht vergleichbar ist.',
            ignore3: 'Wenn du komplett neu bist und zuerst Technik und Routine brauchst.',
            importantTitle: 'Wichtig (damit du es richtig nutzt)',
            highRepsLabel: 'Hohe Wiederholungen (10+):',
            highRepsText: 'Die Schätzung wird deutlich ungenauer.',
            cheatLabel: 'Cheat-Reps:',
            cheatText: 'Dann wird das Ergebnis kaum aussagekräftig.',
            painLabel: 'Schmerzen oder unsichere Technik:',
            painText: 'Dann lieber keine Max-Zahlen jagen.',
            faqTitle: 'Häufige Fragen',
            faq1q: '„Welche Formel ist das?“',
            faq1a: 'Epley, also eine gängige Standardschätzung.',
            faq2q: '„Warum variiert das?“',
            faq2a: 'Technik, Pausen, Tagesform und Bewegungsradius machen einen Unterschied.',
            faq3q: '„Soll ich ein echtes 1RM testen?“',
            faq3a: 'Nur mit Erfahrung und sicherem Setup.',
            realityTitle: 'Reality-Check',
            realityText: 'Deine besten Tools bleiben saubere Wiederholungen und konsistenter Progress. 1RM ist nur eine Zahl.',
            exerciseLabel: 'Übung *',
            exercisePlaceholder: 'z. B. Bankdrücken',
            repsLabel: 'Wiederholungen *',
            repsPlaceholder: 'z. B. 8',
        })

    const infoText = computed(() => props.info ?? (locale.value === 'en'
        ? 'Estimates your one-rep max. Standard: Epley. Guideline only, not a real max test.'
        : 'Schätzt dein einmaliges Maximalgewicht. Standard: Epley. Richtwert, kein echter Max-Test.'))

    const exercise = computed(() => props.oneRmExercise)
    const hasResult = computed(() => props.oneRmResult != null || !!props.formattedResult)

    const displayResult = computed(() => {
        if (props.formattedResult) return props.formattedResult
        if (props.oneRmResult == null || !Number.isFinite(props.oneRmResult)) return '—'
        const u = String(props.unit || '').toLowerCase() === 'lbs' ? 'lbs' : 'kg'
        return `${props.oneRmResult.toFixed(1)} ${u}`
    })

    const weightLabel = computed(() => locale.value === 'en'
        ? `Weight (${String(props.unit).toLowerCase() === 'kg' ? 'kg' : 'lbs'}) *`
        : `Gewicht (${String(props.unit).toLowerCase() === 'kg' ? 'kg' : 'lbs'}) *`)
    const weightPlaceholder = computed(() => props.unit === 'kg' ? 'z. B. 80' : 'z. B. 175')

    const copyText = computed<string | null>(() => {
        if (!hasResult.value) return null
        const parts: string[] = []
        if (props.oneRmExercise?.trim()) parts.push(`${locale.value === 'en' ? 'Exercise' : 'Übung'}: ${props.oneRmExercise.trim()}`)
        if (props.oneRmWeight != null) parts.push(`${locale.value === 'en' ? 'Weight' : 'Gewicht'}: ${props.oneRmWeight} ${String(props.unit).toLowerCase() === 'lbs' ? 'lbs' : 'kg'}`)
        if (props.oneRmReps != null) parts.push(`${locale.value === 'en' ? 'Reps' : 'Wiederholungen'}: ${props.oneRmReps}`)
        parts.push(`1RM: ${displayResult.value}`)
        return parts.join(' | ')
    })

    const weightInputValue = computed(() =>
        props.oneRmWeight == null || Number.isNaN(props.oneRmWeight) ? '' : String(props.oneRmWeight))
    const repsInputValue = computed(() =>
        props.oneRmReps == null || Number.isNaN(props.oneRmReps) ? '' : String(props.oneRmReps))

    function validateOneRm(): string[] {
        const errors: string[] = []
        const ex = String(props.oneRmExercise ?? '').trim()
        if (!ex) errors.push(locale.value === 'en' ? 'Please enter an exercise.' : 'Bitte gib eine Übung ein.')

        const w = props.oneRmWeight
        if (w == null || Number.isNaN(w)) {
            errors.push(locale.value === 'en' ? 'Please enter the weight.' : 'Bitte gib das Gewicht ein.')
            return errors
        }
        if (w <= 0) errors.push(locale.value === 'en' ? 'Weight must be greater than 0.' : 'Gewicht muss größer als 0 sein.')
        else if (String(props.unit).toLowerCase() === 'kg' && w > 500) errors.push(locale.value === 'en' ? 'Weight seems unrealistically high (kg).' : 'Gewicht wirkt unrealistisch hoch (kg).')
        else if ((String(props.unit).toLowerCase() === 'lb' || String(props.unit).toLowerCase() === 'lbs') && w > 1100) errors.push(locale.value === 'en' ? 'Weight seems unrealistically high (lbs).' : 'Gewicht wirkt unrealistisch hoch (lbs).')

        const r = props.oneRmReps
        if (r == null || Number.isNaN(r)) {
            errors.push(locale.value === 'en' ? 'Please enter the repetitions.' : 'Bitte gib die Wiederholungen ein.')
            return errors
        }
        if (r <= 0) errors.push(locale.value === 'en' ? 'Repetitions must be greater than 0.' : 'Wiederholungen müssen größer als 0 sein.')
        else if (r > 20) errors.push(locale.value === 'en' ? 'Repetitions are too high for a useful 1RM estimate.' : 'Wiederholungen sind für eine 1RM-Schätzung zu hoch.')

        return errors
    }

    function onWeightInputValue(v: string | number, normalize?: NormalizeFn) {
        const raw0 = String(v ?? '')
        const raw = normalize ? normalize(raw0) : raw0.trim().replace(',', '.')
        if (raw === '') return emit('update:oneRmWeight', null)
        const n = Number(raw)
        if (Number.isFinite(n)) emit('update:oneRmWeight', n)
    }

    function onRepsInputValue(v: string | number) {
        const raw = String(v ?? '').replace(/[^\d]/g, '')
        if (raw === '') return emit('update:oneRmReps', null)
        const n = Number(raw)
        if (!Number.isFinite(n)) return
        emit('update:oneRmReps', Math.max(1, Math.floor(n)))
    }
</script>

<style scoped>
</style>
