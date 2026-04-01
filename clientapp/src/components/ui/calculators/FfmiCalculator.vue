<!-- src/components/ui/calculators/FfmiCalculator.vue -->
<template>
    <BaseCalculator :title="title || 'FFMI-Rechner'"
                    :showInfo="!!infoText"
                    infoTitle="FFMI (Fat-Free Mass Index)"
                    infoKicker="Rechner erklärt"
                    ariaOpen="FFMI Erklärung öffnen"
                    ariaClose="Schließen"
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
                    @invalid="(errors) => emit('invalid', errors)" >

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="FFMI Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">ℹ️ Was bedeutet FFMI?</span>
                </div>

                <div class="calc-hero-sub">
                    FFMI zeigt deine <strong>fettfreie Masse</strong> (Gewicht minus Fett) im Verhältnis zur <strong>Größe</strong> — je höher, desto „muskulöser“ (bei ähnlichem KFA).
                </div>

                <div class="calc-hero-pills" aria-label="Schnellnavigation">
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_formula')">⚙️ Formel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_bands')">📊 Einordnung</button>
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_next')">👉 Was heißt das?</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">⚠️ Wichtig</button>
                </div>
            </div>
        </template>

        <!-- Popup -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="result"
                     id="ffmi_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">✅ Dein Ergebnis</div>
                    <div class="calc-callout-text">
                        <div><strong>FFMI:</strong> {{ result.value.toFixed(1) }} — <strong>{{ result.category }}</strong></div>
                        <div class="calc-note calc-note--tight">
                            Tipp: FFMI ist ein Richtwert. Progress + KFA-Schätzung entscheidet.
                        </div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('ffmi_next')">👉 Was heißt das?</button>
                            <button class="calc-chip" type="button" @click="jumpTo('ffmi_bands')">📊 Einordnung</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">⚠️ Wichtig</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" aria-label="Kurzüberblick">
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_formula')">⚙️ Formel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('ffmi_example')">📐 Beispiel</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('ffmi_bands')">📊 Bereiche</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('ffmi_important')">⚠️ Wichtig</button>

                    <!-- Copy: handled by BaseCalculator result copy -->
                    <button class="calc-chip"
                            type="button"
                            :disabled="!result"
                            :aria-disabled="!result"
                            :class="{ 'is-disabled': !result }"
                            :title="result ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                            @click="onCopy?.()">
                        📋 Copy
                    </button>
                </div>

                <div id="ffmi_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">📌 Kurzfassung</div>
                    <div class="calc-callout-text">
                        <div>FFMI = <strong>fettfreie Masse</strong> relativ zur <strong>Körpergröße</strong>.</div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>Besser als BMI:</strong> berücksichtigt Fettanteil (indirekt)</li>
                            <li><strong>Heißt nicht:</strong> „gesund/ungesund“ — nur Körperkomposition</li>
                            <li><strong>Merke:</strong> KFA-Schätzung muss halbwegs passen</li>
                        </ul>
                    </div>
                </div>

                <div class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_next' }"
                     tabindex="-1"
                     id="ffmi_next">
                    <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                    <ul class="calc-list">
                        <li><strong>FFMI steigt:</strong> du hast (meist) fettfreie Masse aufgebaut oder KFA ist gesunken.</li>
                        <li><strong>FFMI stagniert:</strong> okay — check Progress im Gym + Kalorien/Protein + Schlaf.</li>
                        <li><strong>FFMI fällt:</strong> oft Cut zu hart / Kraft sinkt / KFA-Schätzung daneben.</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">👥 Für wen ist der FFMI wertvoll?</h4>
                        <ul class="calc-list">
                            <li>✅ Krafttraining: “baue ich wirklich Muskeln auf?”</li>
                            <li>✅ Cut/Bulk: Fortschritt trotz Gewichtsschwankungen besser einordnen</li>
                            <li>✅ Wenn BMI dich verarscht (viel Muskel / wenig Muskel)</li>
                            <li>⚠️ Wenn KFA nur geraten ist: nur als groben Trend nutzen</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">🧠 Was misst der FFMI?</h4>
                        <ul class="calc-list">
                            <li><strong>Misst:</strong> fettfreie Masse relativ zur Größe</li>
                            <li><strong>Beinhaltet:</strong> Muskeln + Wasser + Knochen + Organe (alles ohne Fett)</li>
                            <li><strong>Misst nicht:</strong> “gesund/ungesund” oder “ästhetisch”</li>
                            <li><strong>Merke:</strong> gleiche FFMI-Zahl kann bei unterschiedlichem KFA komplett anders aussehen</li>
                        </ul>
                    </section>

                    <section class="calc-card">
                        <h4 class="calc-h">⚖️ FFMI vs. BMI</h4>
                        <ul class="calc-list">
                            <li><strong>BMI:</strong> Gewicht ↔ Größe (keine Ahnung ob Muskel oder Fett)</li>
                            <li><strong>FFMI:</strong> nimmt Fett raus (über KFA) → näher an “Muskel-Status”</li>
                            <li><strong>Praxis:</strong> Wenn du trainierst, ist FFMI fast immer hilfreicher als BMI</li>
                        </ul>
                    </section>

                    <section id="ffmi_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formel</h4>
                        <div class="calc-note">1) Fettfreie Masse berechnen → 2) auf Größe normieren.</div>
                        <div class="calc-formula calc-formula--first">
                            <span class="calc-formula-k">FFM</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">Gewicht × (1 − KFA)</span>
                        </div>
                        <div class="calc-formula">
                            <span class="calc-formula-k">FFMI</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">FFM ÷ Größe² (m)</span>
                        </div>
                    </section>

                    <section id="ffmi_bands"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_bands' }"
                             tabindex="-1">
                        <h4 class="calc-h">📊 Einordnung (grob)</h4>
                        <ul class="calc-list">
                            <li><strong>~18–20:</strong> sportlich/fit</li>
                            <li><strong>~20–22:</strong> sehr solide Muskelbasis</li>
                            <li><strong>~22–24:</strong> stark (meist viel Training)</li>
                            <li><strong>24+:</strong> selten ohne sehr viel Training + sehr guten Voraussetzungen</li>
                        </ul>
                        <div class="calc-note calc-note--tight">
                            Das ist grob: KFA-Schätzung & Messfehler können die Zahl spürbar verschieben.
                        </div>
                    </section>

                    <section id="ffmi_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'ffmi_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">📐 Beispiel</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>80 kg, 180 cm, 15% KFA</span>
                                <span class="calc-example-strong">FFMI ≈ 20,9</span>
                            </div>
                            <div class="calc-example-sub">
                                Stabil sportlich. Wird höher durch mehr fettfreie Masse oder weniger KFA.
                            </div>
                        </div>
                    </section>
                </div>

                <div id="ffmi_important"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_important' }"
                     tabindex="-1">
                    <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                    <ul class="calc-list">
                        <li><strong>KFA-Schätzung</strong> ist der größte Hebel: daneben = FFMI daneben.</li>
                        <li><strong>Wasser/Glykogen</strong> ändern Gewicht kurzfristig → Zahl kann springen.</li>
                        <li>Bewerte lieber <strong>Trend + Kraftwerte + Fotos</strong> statt nur eine Zahl.</li>
                    </ul>
                </div>

                <div id="ffmi_ignore"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'ffmi_ignore' }"
                     tabindex="-1">
                    <div class="calc-callout-title">🧠 Wann du den FFMI locker ignorieren darfst</div>
                    <ul class="calc-list">
                        <li>Deine <strong>Kraft</strong> steigt solide und dein Training läuft.</li>
                        <li>Du hast klare <strong>Messwerte</strong> (Taille/Umfänge/Fotos) die den Trend zeigen.</li>
                        <li>Dein KFA ist nur geraten und schwankt — dann ist FFMI halt Noise.</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">❓ Häufige Fragen</h4>
                    <ul class="calc-list">
                        <li><strong>„Warum schwankt mein FFMI?“</strong> → KFA-Schätzung/Wasser/Wiegen.</li>
                        <li><strong>„Wie genau muss mein KFA sein, damit FFMI Sinn macht?“</strong> → Nutz immer die gleiche Methode + gleiche Bedingungen und schau auf den Trend.</li>
                        <li><strong>„Wie steigern?“</strong> → Aufbau + Progression + Protein + Schlaf.</li>
                    </ul>
                </section>
            </div>
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">✅ Reality-Check</div>
                <div class="calc-mini-text">
                    FFMI ist ein <strong>Kompass</strong>, kein Urteil. Tracke <strong>Gewicht</strong>, <strong>KFA-Trend</strong> und <strong>Leistung</strong> zusammen.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ maybeAutoCalc, errorFor }">
            <UiCalculatorInput :modelValue="weight ?? ''"
                               type="number"
                               :label="`Körpergewicht (${unit === 'kg' ? 'kg' : 'lbs'}) *`"
                               :placeholder="unit === 'kg' ? 'z.B. 70' : 'z.B. 155'"
                               :error="errorFor('gewicht')"
                               @update:modelValue="(v) => { emit('update:ffmiWeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="height ?? ''"
                               type="number"
                               label="Körpergröße (cm) *"
                               placeholder="z.B. 175"
                               :error="errorFor('gr')"
                               @update:modelValue="(v) => { emit('update:ffmiHeight', v === '' ? null : Number(v)); maybeAutoCalc() }" />

            <UiCalculatorInput :modelValue="bodyFat ?? ''"
                               type="number"
                               label="Körperfettanteil (%) *"
                               placeholder="z.B. 15"
                               :error="errorFor('fett')"
                               @update:modelValue="(v) => { emit('update:ffmiBodyFat', v === '' ? null : Number(v)); maybeAutoCalc() }" />
        </template>


        <!-- Result -->
        <template #result>
            <div v-if="result">
                <p><strong>FFMI:</strong> {{ result.value.toFixed(1) }}</p>
                <p>Kategorie: {{ result.category }}</p>
            </div>
        </template>

    </BaseCalculator>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
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

    const weight = computed(() => props.ffmiWeight)
    const height = computed(() => props.ffmiHeight)
    const bodyFat = computed(() => props.ffmiBodyFat)
    const result = computed(() => props.ffmiResult)

    const infoText = computed(
        () =>
            props.info ??
            'FFMI (Fat-Free Mass Index) ist wie ein „Muskel-Index“: Er nimmt deine fettfreie Masse (Gewicht minus Fett) und setzt sie ins Verhältnis zur Größe. Praktisch, um „muskulös vs. nur schwer“ zu unterscheiden. Wichtig: Wenn der KFA daneben liegt, ist auch der FFMI ungenauer — deshalb eher Trends vergleichen als eine Zahl feiern.'
    )

    const copyText = computed<string | null>(() => {
        if (!result.value) return null

        const parts: string[] = []

        if (weight.value != null) parts.push(`Körpergewicht: ${weight.value} ${props.unit === 'kg' ? 'kg' : 'lbs'}`)
        if (height.value != null) parts.push(`Körpergröße: ${height.value} cm`)
        if (bodyFat.value != null) parts.push(`Körperfettanteil: ${bodyFat.value}%`)

        parts.push(`FFMI: ${result.value.value.toFixed(1)} (${result.value.category})`)

        return parts.join(' | ')
    })

    function validateFfmi(): string[] {
        const errors: string[] = []

        const w = props.ffmiWeight
        if (w == null || Number.isNaN(w)) {
            errors.push('Bitte gib dein Körpergewicht ein.')
        } else {
            if (w <= 0) errors.push('Körpergewicht muss größer als 0 sein.')
            else if (props.unit === 'kg' && w > 400) errors.push('Körpergewicht wirkt unrealistisch hoch (kg).')
            else if ((props.unit === 'lb' || props.unit === 'lbs') && w > 900) errors.push('Körpergewicht wirkt unrealistisch hoch (lbs).')
        }

        const h = props.ffmiHeight
        if (h == null || Number.isNaN(h)) {
            errors.push('Bitte gib deine Körpergröße (cm) ein.')
        } else {
            if (h <= 0) errors.push('Körpergröße (cm) muss größer als 0 sein.')
            else if (h < 80) errors.push('Körpergröße (cm) wirkt unrealistisch niedrig.')
            else if (h > 250) errors.push('Körpergröße (cm) wirkt unrealistisch hoch.')
        }

        const bf = props.ffmiBodyFat
        if (bf == null || Number.isNaN(bf)) {
            errors.push('Bitte gib deinen Körperfettanteil (%) ein.')
        } else {
            if (bf <= 0) errors.push('Körperfettanteil (%) muss größer als 0 sein.')
            else if (bf >= 80) errors.push('Körperfettanteil (%) wirkt unrealistisch hoch.')
        }

        return errors
    }

</script>

<style scoped>
</style>
