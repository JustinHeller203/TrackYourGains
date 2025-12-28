<!-- src/components/ui/calculators/GlycemicLoadCalculator.vue -->
<template>
    <BaseCalculator :title="title || 'Glykämische Last (GL) Rechner'"
                    :showInfo="!!infoText"
                    infoTitle="Glykämische Last (GL)"
                    infoKicker="Rechner erklärt"
                    ariaOpen="GL Erklärung öffnen"
                    ariaClose="Schließen"
                    :info="infoText"
                    :autoCalcEnabled="autoCalcEnabled"
                    :isFavorite="isFavorite"
                    :showCalculateButton="!autoCalcEnabled"
                    :showCopyButton="glResult !== null"
                    :copyText="copyText"
                    @toggleFavorite="$emit('toggleFavorite')"
                    @calculate="$emit('calculate')"
                    @copy="$emit('copy')"
                    @export="$emit('export')"
                    @reset="$emit('reset')">

        <!-- Graphic -->
        <template #graphic="{ jumpTo }">
            <div class="calc-hero" role="img" aria-label="GL Kurzkarte">
                <div class="calc-hero-top">
                    <span class="calc-hero-title">ℹ️ Was bedeutet GL?</span>
                </div>

                <div class="calc-hero-sub">
                    Die <strong>Glykämische Last (GL)</strong> zeigt, <strong>wie stark eine Portion Essen deinen Blutzucker wirklich beeinflusst</strong>.
                    Sie berücksichtigt nicht nur wie schnell Kohlenhydrate wirken, sondern auch wie viel du davon isst.
                </div>

                <div class="calc-hero-pills" aria-label="Schnellnavigation">
                    <button class="calc-chip" type="button" @click="jumpTo('gl_formula')">⚙️ So wird er berechnet</button>
                    <button class="calc-chip" type="button" @click="jumpTo('gl_bands')">📊 So wird's eingeordnet</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('gl_limits')">⚠️ Wichtig</button>
                </div>
            </div>
        </template>

        <!-- Popup -->
        <template #popup="{ jumpTo, activeTargetId, onCopy }">
            <div class="calc-scan">
                <div v-if="glResult !== null"
                     id="gl_you"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'gl_you' }"
                     tabindex="-1">
                    <div class="calc-callout-title">✅ Dein Ergebnis</div>
                    <div class="calc-callout-text">
                        <div>
                            <strong>GL pro Portion:</strong> {{ glResult!.toFixed(1) }}
                            <span v-if="glCategory">— <strong>{{ glCategory }}</strong></span>
                        </div>

                        <div class="calc-note calc-note--tight">
                            Tipp: GL ist am besten für <strong>Vergleiche</strong> (Portionen/Meals), nicht als “verboten”-Label.
                        </div>

                        <div class="calc-actions">
                            <button class="calc-chip" type="button" @click="jumpTo('gl_next')">👉 Was heißt das?</button>
                            <button class="calc-chip" type="button" @click="jumpTo('gl_bands')">📊 Einordnung</button>
                            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('gl_limits')">⚠️ Wichtig</button>
                        </div>
                    </div>
                </div>

                <div class="calc-chips" aria-label="Kurzüberblick">
                    <button class="calc-chip" type="button" @click="jumpTo('gl_formula')">⚙️ Formel</button>
                    <button class="calc-chip" type="button" @click="jumpTo('gl_example')">📐 Beispiel</button>
                    <button class="calc-chip" type="button" @click="openGlTable()">📚 GL Tabelle</button>
                    <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('gl_bands')">📊 Bereiche</button>
                    <button class="calc-chip" type="button" @click="jumpTo('gl_insulin')">🧠 Insulin</button>
                    <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('gl_limits')">⚠️ Wichtig</button>

                    <button class="calc-chip"
                            type="button"
                            :disabled="glResult === null"
                            :aria-disabled="glResult === null"
                            :class="{ 'is-disabled': glResult === null }"
                            :title="glResult !== null ? 'Kopieren' : 'Erst berechnen, dann kopieren'"
                            @click="() => { onCopy?.(); jumpTo('gl_you') }">
                        📋 Copy
                    </button>
                </div>

                <div id="gl_tldr"
                     class="calc-callout calc-callout--tldr"
                     :class="{ 'calc-target': activeTargetId === 'gl_tldr' }"
                     tabindex="-1">
                    <div class="calc-callout-title">📌 Kurzfassung</div>
                    <div class="calc-callout-text">
                        <div>
                            GL zeigt, <strong>wie stark dein Blutzucker nach einer Mahlzeit ansteigt</strong> – abhängig von
                            <strong>Art</strong> der Kohlenhydrate <em>und</em> der <strong>Menge</strong>.
                        </div>
                        <ul class="calc-list calc-list--spaced">
                            <li><strong>GI:</strong> Wie schnell Zucker ins Blut geht (Tempo)</li>
                            <li><strong>GL:</strong> Wie stark es insgesamt wirkt (Tempo <strong>+ Menge</strong>)</li>
                            <li><strong>Merke:</strong> Auch „gesunde“ Foods können bei großen Portionen stark wirken</li>
                        </ul>
                    </div>
                </div>

                <div class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_next' }"
                     tabindex="-1"
                     id="gl_next">
                    <div class="calc-callout-title">👉 Was heißt das jetzt?</div>
                    <ul class="calc-list">
                        <li>
                            <strong>Niedrige GL:</strong> Blutzucker bleibt stabil →
                            meist <strong>weniger Hunger</strong> & längere Sättigung.
                        </li>
                        <li><strong>Mittlere GL:</strong> normal — Kontext zählt (Timing, Aktivität, Protein/Fett dazu).</li>
                        <li><strong>Hohe GL:</strong> nicht “schlecht”, aber <strong>macht eher Hunger/Cravings</strong> bei manchen.</li>
                    </ul>
                </div>

                <section id="gl_insulin"
                         class="calc-card"
                         :class="{ 'calc-target': activeTargetId === 'gl_insulin' }"
                         tabindex="-1">
                    <div class="calc-callout-title">🧠 Insulin-Reaktion erklärt</div>
                    <ul class="calc-list">
                        <li><strong>Wenn du Kohlenhydrate isst</strong>, steigt dein Blutzucker.</li>
                        <li>Der Körper schüttet dann <strong>Insulin</strong> aus, damit Zucker aus dem Blut <strong>in die Zellen</strong> aufgenommen werden kann.</li>
                        <li><strong>Hohe GL</strong> bedeutet oft: stärkere Blutzuckerreaktion → häufig auch eine stärkere Insulinantwort.</li>
                        <li><strong>Wichtig:</strong> Insulin ist nicht „schlecht“ – es ist ein normales, lebenswichtiges Hormon.</li>
                    </ul>
                    <div class="calc-note calc-note--tight">
                        Merksatz: <strong>GL</strong> beschreibt, wie stark eine <strong>Portion</strong> Kohlenhydrate deinen Blutzucker typischerweise beeinflusst.
                    </div>
                </section>

                <div id="gl_when"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_when' }"
                     tabindex="-1">
                    <div class="calc-callout-title">🎯 Wann soll ich GL wirklich beachten?</div>
                    <ul class="calc-list">
                        <li><strong>Wenn du nach KH oft müde wirst</strong> oder “Food-Koma” bekommst.</li>
                        <li><strong>Wenn du schnell wieder Hunger</strong> hast (Cravings 1–2h nach dem Essen).</li>
                        <li><strong>Wenn du im Cut bist</strong> und Sättigung/Alltag leichter machen willst.</li>
                        <li><strong>Wenn du Diabetes/Insulinresistenz hast</strong> (dann ist GL oft extra relevant).</li>
                        <li><strong>Wenn du Meals vergleichst</strong>: “welches hält mich länger satt?”</li>
                    </ul>
                    <div class="calc-note calc-note--tight">
                        Quick Win: Bei hoher GL → <strong>Portion kleiner</strong> oder <strong>Protein/Fett/Ballaststoffe</strong> dazu (bremst den Spike).
                    </div>
                </div>

                <div id="gl_gi"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_gi' }"
                     tabindex="-1">
                    <div class="calc-callout-title">📘 Lektion: Was ist der Glykämische Index (GI)?</div>

                    <div class="calc-callout-text">
                        Der <strong>Glykämische Index (GI)</strong> beschreibt das <strong>Tempo</strong>, wie schnell die Kohlenhydrate
                        eines Lebensmittels deinen <strong>Blutzucker</strong> im Vergleich zu <strong>Glukose</strong> ansteigen lassen.
                    </div>

                    <ul class="calc-list">
                        <li><strong>GI = Geschwindigkeit</strong> (wie schnell steigt’s?)</li>
                        <li><strong>GL = Wirkung pro Portion</strong> (Geschwindigkeit <em>und</em> Menge)</li>
                        <li>Hoher GI kann okay sein, wenn die Portion klein ist → GL bleibt niedriger.</li>
                    </ul>

                    <div class="calc-note calc-note--tight">
                        Merksatz: <strong>GI = Tempo</strong>, <strong>GL = Gesamt-Impact der Portion</strong>.
                    </div>
                </div>

                <div id="gl_gl"
                     class="calc-callout"
                     :class="{ 'calc-target': activeTargetId === 'gl_gl' }"
                     tabindex="-1">
                    <div class="calc-callout-title">🧠 Glykämischer Index (0–110): welche Zahl soll ich eingeben?</div>

                    <div class="gi-steps" role="list" aria-label="GI Schritt-für-Schritt">
                        <div class="gi-step" role="listitem">
                            <div class="gi-step-k">1) Was eingeben?</div>
                            <div class="gi-step-v">
                                Den <strong>GI-Wert</strong> deines Foods (eine Zahl <strong>0–110</strong>).
                            </div>
                        </div>

                        <div class="gi-step" role="listitem">
                            <div class="gi-step-k">2) Woher nehmen?</div>
                            <div class="gi-step-v">
                                Aus einer <strong>GI-Tabelle</strong> (Suchbegriff: <strong>„GI Tabelle + Lebensmittel“</strong>).
                            </div>
                        </div>

                        <div class="gi-step" role="listitem">
                            <div class="gi-step-k">3) Wenn mehrere Werte?</div>
                            <div class="gi-step-v">
                                Nimm den Wert, der zur <strong>Zubereitung</strong> passt (gekocht / reif / „al dente“).
                            </div>
                        </div>
                    </div>

                    <div class="gi-chiprow" aria-label="Schnelle Beispiele">
                        <span class="gi-chip"><strong>Banane</strong> ~50–60</span>
                        <span class="gi-chip"><strong>Reis</strong> ~50–90</span>
                        <span class="gi-chip"><strong>Hafer</strong> eher niedriger</span>
                    </div>

                    <div class="calc-note calc-note--tight gi-note">
                        <strong>Unsicher?</strong> Nimm die <strong>Mitte</strong> der Range.
                        Beispiel: <strong>50–60 → 55</strong>. Das reicht locker für Vergleiche.
                    </div>

                    <ul class="calc-list gi-mini">
                        <li><strong>Reifer</strong> = oft höherer GI (z. B. Banane).</li>
                        <li><strong>Weich gekocht</strong> = oft höherer GI (Pasta/Reis), <strong>„al dente“</strong> eher niedriger.</li>
                        <li><strong>0–110 Schutz:</strong> Wenn du drüber bist, wird automatisch begrenzt.</li>
                    </ul>
                </div>

                <div class="calc-grid">
                    <section class="calc-card">
                        <h4 class="calc-h">🧠 Was misst GL?</h4>
                        <ul class="calc-list">
                            <li>
                                <strong>Misst:</strong> wie stark eine <strong>konkrete Portion Essen</strong>
                                deinen <strong>Blutzucker & Insulin</strong> belastet
                            </li>
                            <li><strong>Bausteine:</strong> GI + verfügbare KH</li>
                            <li><strong>Misst nicht:</strong> Mikros, Proteinqualität, Sättigung 1:1</li>
                        </ul>
                    </section>

                    <section id="gl_formula"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'gl_formula' }"
                             tabindex="-1">
                        <h4 class="calc-h">⚙️ Formel</h4>
                        <div class="calc-formula">
                            <span class="calc-formula-k">GL</span>
                            <span class="calc-formula-eq">=</span>
                            <span class="calc-formula-v">(GI × verfügbare KH pro Portion) ÷ 100</span>
                        </div>
                        <div class="calc-note">
                            Verfügbare KH = Gesamt-KH minus Ballaststoffe (wenn du sie kennst).
                        </div>
                    </section>

                    <section id="gl_bands"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'gl_bands' }"
                             tabindex="-1">
                        <h4 class="calc-h">📊 Kategorien</h4>
                        <div class="calc-bands">
                            <div class="calc-band"><span class="calc-band-k">Unter 10</span><span class="calc-band-v">niedrig</span></div>
                            <div class="calc-band"><span class="calc-band-k">10 – 19</span><span class="calc-band-v">mittel</span></div>
                            <div class="calc-band"><span class="calc-band-k">20+</span><span class="calc-band-v">hoch</span></div>
                        </div>
                    </section>

                    <section id="gl_example"
                             class="calc-card"
                             :class="{ 'calc-target': activeTargetId === 'gl_example' }"
                             tabindex="-1">
                        <h4 class="calc-h">📐 Beispiel</h4>
                        <div class="calc-example">
                            <div class="calc-example-row">
                                <span>GI 55, 30g verfügbare KH</span>
                                <span class="calc-example-strong">GL ≈ 16,5</span>
                            </div>
                            <div class="calc-example-sub">
                                “Mittel” — wird niedriger, wenn die Portion kleiner ist oder KH geringer sind.
                            </div>
                        </div>
                    </section>
                </div>

                <div class="calc-callout">
                    <div class="calc-callout-title">🧠 Wann du den GL-Rechner easy ignorieren darfst</div>
                    <ul class="calc-list">
                        <li>Deine <strong>Mahlzeiten sind gemischt</strong> (Protein, Fett, Ballaststoffe dabei).</li>
                        <li>Du hast <strong>keine Probleme mit Hunger, Cravings oder Energie-Crashes</strong>.</li>
                        <li>Dein Fokus liegt auf <strong>Gesamtkalorien, Protein & Trainingsleistung</strong>.</li>
                        <li>Du isst intuitiv & konstant — dann bringt GL kaum Mehrwert.</li>
                    </ul>
                </div>

                <div id="gl_limits"
                     class="calc-callout calc-callout--warn"
                     :class="{ 'calc-target': activeTargetId === 'gl_limits' }"
                     tabindex="-1">
                    <div class="calc-callout-title">⚠️ Wichtig (damit du’s richtig nutzt)</div>
                    <ul class="calc-list">
                        <li><strong>GI/GL Tabellen</strong> sind je nach Zubereitung/Reife anders.</li>
                        <li><strong>Meal-Mix</strong> (Protein/Fett/Ballaststoffe) verändert die Wirkung.</li>
                        <li>Nutze GL für <strong>Vergleiche</strong>, nicht als “gut/böse”.</li>
                    </ul>
                </div>

                <section class="calc-card">
                    <h4 class="calc-h">❓ Häufige Fragen</h4>
                    <ul class="calc-list">
                        <li><strong>„Warum ist mein GL trotz ‘gesundem’ Food hoch?“</strong> → Portion/KH-Menge ist der Hebel.</li>
                        <li><strong>„Warum schwankt GI/GL je nach Quelle?“</strong> → Reifegrad, Kochen, Sorte, Messmethode.</li>
                        <li><strong>„Was hat GL mit Insulin zu tun?“</strong> → höhere GL → meist stärkerer Blutzuckeranstieg → oft mehr Insulin-Antwort.</li>
                        <li><strong>„Wann sollte ich GL ernst nehmen?“</strong> → wenn du Hunger/Cravings/Crashs hast oder im Cut Sättigung optimieren willst.</li>
                        <li><strong>„Wie senke ich GL easy?“</strong> → Portion runter, mehr Ballaststoffe/Protein dazu, KH smarter wählen.</li>
                    </ul>
                </section>
            </div>
        </template>

        <!-- Mini -->
        <template #mini>
            <div class="calc-mini">
                <div class="calc-mini-title">Reality-Check ✅</div>
                <div class="calc-mini-text">
                    GL hilft dir bei <strong>Portionen</strong>. Für “gesund” zählen auch <strong>Protein</strong>, <strong>Ballaststoffe</strong> &amp; <strong>Gesamtkalorien</strong>.
                </div>
            </div>
        </template>

        <!-- Inputs -->
        <template #inputs="{ openInfoAndJump, maybeAutoCalc }">
            <GlTablePopup ref="glTablePopup" @apply="applyFromGlTable" />

            <div class="input-group">
                <label>Lebensmittel</label>
                <input :value="food"
                       @input="(e) => { onFood(e); maybeAutoCalc() }"
                       type="text"
                       placeholder="z. B. Reis, Banane …"
                       class="edit-input" />
            </div>

            <div class="input-group">
                <label>Portionsgröße (g)</label>
                <input :value="serving ?? ''"
                       @input="(e) => { onServing(e); maybeAutoCalc() }"
                       type="text"
                       inputmode="decimal"
                       autocomplete="off"
                       placeholder="z. B. 150"
                       class="edit-input" />
            </div>

            <div class="input-group">
                <label>Kohlenhydrate pro 100 (g)</label>
                <input :value="carbs100 ?? ''"
                       @input="(e) => { onCarbs100(e); maybeAutoCalc() }"
                       type="text"
                       inputmode="decimal"
                       autocomplete="off"
                       placeholder="z. B. 28"
                       class="edit-input" />
                <small class="hint">Falls bekannt: Ballaststoffe von den Gesamt-KH abziehen.</small>
            </div>

            <div class="input-group">
                <label class="gi-label">
                    <span>Glykämischer Index (0–110)</span>

                    <button class="info-btn"
                            type="button"
                            aria-label="GI Erklärung öffnen"
                            title="Was ist der GI?"
                            @click="openInfoAndJump('gl_gi')">
                        <span class="info-emoji" aria-hidden="true">ℹ️</span>
                    </button>
                </label>

                <input :value="gi ?? ''"
                       @input="(e) => { onGi(e); maybeAutoCalc() }"
                       type="text"
                       inputmode="decimal"
                       autocomplete="off"
                       placeholder="z. B. 55"
                       class="edit-input" />
            </div>
        </template>

        <!-- Result -->
        <template #result>
            <div v-if="glResult !== null">
                <p>
                    <strong>GL pro Portion:</strong> {{ glResult!.toFixed(1) }}
                    <span v-if="glCategory">— Kategorie: {{ glCategory }}</span>
                    <br v-if="carbs !== null" />
                    <span v-if="carbs !== null"><strong>Kohlenhydrate pro Portion:</strong> {{ carbs!.toFixed(1) }} g</span>
                </p>
            </div>
        </template>

    </BaseCalculator>
</template>


<script setup lang="ts">
    import { computed, ref } from 'vue'
    import BaseCalculator from '@/components/ui/calculators/BaseCalculator.vue'
    import GlTablePopup from '@/components/ui/popups/calc/GlTablePopup.vue'
    import type { GlTableItem } from '@/components/ui/popups/calc/GlTablePopup.vue'


    type Category = 'niedrig' | 'mittel' | 'hoch' | string

    const props = defineProps<{
        autoCalcEnabled: boolean
        glFood: string
        glServing: number | null
        glCarbs100: number | null
        glGi: number | null
        /** optional zur Anzeige – parent rechnet das bereits */
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
    }>()

    const food = computed(() => props.glFood)
    const serving = computed(() => props.glServing)
    const carbs100 = computed(() => props.glCarbs100)
    const gi = computed(() => props.glGi)
    const carbs = computed(() => props.glCarbs ?? null)

    const glTablePopup = ref<{ open?: () => void } | null>(null)

    function openGlTable() {
        glTablePopup.value?.open?.()
    }

    const copyText = computed<string | null>(() => {
        if (props.glResult == null) return null

        const parts: string[] = []
        if (food.value?.trim()) parts.push(`Food: ${food.value.trim()}`)
        if (serving.value != null) parts.push(`Portion: ${serving.value} g`)
        if (carbs100.value != null) parts.push(`KH/100g: ${carbs100.value} g`)
        if (gi.value != null) parts.push(`GI: ${gi.value}`)
        if (carbs.value != null) parts.push(`verf. KH/Portion: ${carbs.value.toFixed(1)} g`)
        parts.push(`GL: ${props.glResult.toFixed(1)}${props.glCategory ? ` (${props.glCategory})` : ''}`)

        return parts.join(' | ')
    })

    function applyFromGlTable(item: GlTableItem) {
        // setzt dir direkt alles sinnvoll vor
        emit('update:glFood', item.label)
        emit('update:glGi', item.gi)
        emit('update:glCarbs100', item.carbs100)

        // Startwert: 100g ist für GL “pro Portion” mega praktisch
        emit('update:glServing', 100)
    }

    const infoText = computed(
        () =>
            props.info ??
            'GL = (GI × verfügbare KH pro Portion in g) / 100. Richtwerte: niedrig < 10, mittel 10–19, hoch ≥ 20.'
    )

    function normalizeNumberInput(raw: string) {
        return raw.trim().replace(/\s+/g, '').replace(',', '.')
    }
    function onFood(e: Event) {
        emit('update:glFood', (e.target as HTMLInputElement).value)
    }

    function onServing(e: Event) {
        const raw = normalizeNumberInput((e.target as HTMLInputElement).value)

        // leer = bewusst löschen
        if (raw === '') {
            emit('update:glServing', null)
            return
        }

        const num = Number(raw)
        // bei ungültigen Zwischenwerten (z.B. "-", "e", ".") NICHT emitten
        if (Number.isFinite(num)) emit('update:glServing', num)
    }

    function onCarbs100(e: Event) {
        const raw = normalizeNumberInput((e.target as HTMLInputElement).value)

        if (raw === '') {
            emit('update:glCarbs100', null)
            return
        }

        const num = Number(raw)
        if (Number.isFinite(num)) emit('update:glCarbs100', num)
    }

    function onGi(e: Event) {
        const raw = normalizeNumberInput((e.target as HTMLInputElement).value)

        if (raw === '') {
            emit('update:glGi', null)
            return
        }

        const num = Number(raw)
        if (!Number.isFinite(num)) return

        // GI Bereich absichern (0–110)
        const clamped = Math.min(110, Math.max(0, num))
        emit('update:glGi', clamped)
    }

</script>

<style scoped>
    .input-group {
        margin-bottom: 1rem;
    }

        .input-group label {
            display: block;
            font-size: .9rem;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: .25rem;
        }

    .edit-input {
        width: 100%;
        padding: .75rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: var(--bg-secondary);
        color: var(--text-color);
        font-size: .9rem;
        transition: border-color .3s, box-shadow .3s;
    }

        .edit-input:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 5px rgba(99,102,241,.5);
            outline: none;
        }

    .hint {
        display: block;
        margin-top: .35rem;
        font-size: .8rem;
        color: var(--text-secondary);
    }

    .gi-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .5rem;
    }

    /* GI Block */
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

    @media (max-width: 700px) {
        .gi-steps {
            grid-template-columns: 1fr;
        }
    }

    /* GL Tabelle */
    .gl-table-tools {
        display: flex;
        gap: .5rem;
        align-items: center;
        margin: .55rem 0 .7rem;
    }

    .gl-table-search {
        flex: 1;
        padding: .65rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-secondary) 88%, transparent);
        color: var(--text-primary);
        outline: none;
    }

        .gl-table-search:focus {
            border-color: rgba(129, 140, 248, 0.7);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
        }

    .gl-table-clear {
        padding: .65rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: color-mix(in srgb, var(--bg-secondary) 75%, transparent);
        color: var(--text-primary);
        cursor: pointer;
    }

        .gl-table-clear:disabled {
            opacity: .45;
            cursor: not-allowed;
        }

    .gl-table-grid {
        display: grid;
        gap: .55rem;
    }

    .gl-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .7rem;
        padding: .75rem .8rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: color-mix(in srgb, var(--bg-secondary) 84%, transparent);
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
    }

    .gl-row-main {
        min-width: 0;
    }

    .gl-food {
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: .25rem;
    }

    .gl-meta {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
    }

    .gl-pill {
        display: inline-flex;
        align-items: center;
        padding: .28rem .5rem;
        border-radius: 999px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(255, 255, 255, 0.04);
        font-size: .78rem;
        color: var(--text-primary);
    }

    .gl-pill--muted {
        opacity: .75;
    }

    .gl-apply {
        flex: 0 0 auto;
        padding: .55rem .75rem;
        border-radius: 12px;
        border: 1px solid rgba(129, 140, 248, 0.35);
        background: color-mix(in srgb, var(--accent-primary) 22%, transparent);
        color: var(--text-primary);
        cursor: pointer;
    }

        .gl-apply:hover {
            border-color: rgba(129, 140, 248, 0.7);
        }

    .gl-empty {
        padding: .85rem .8rem;
        border-radius: 14px;
        border: 1px dashed rgba(148, 163, 184, 0.25);
        color: var(--text-secondary);
        background: rgba(255, 255, 255, 0.03);
    }

    @media (max-width: 560px) {
        .gl-row {
            flex-direction: column;
            align-items: stretch;
        }

        .gl-apply {
            width: 100%;
        }
    }

</style>
