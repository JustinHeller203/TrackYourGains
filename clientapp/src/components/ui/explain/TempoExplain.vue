<!-- components/ui/explain/TempoExplain.vue -->
<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" aria-label="Tempo Kurzkarte">
            <div class="calc-hero-top">
                <span class="calc-hero-title">ℹ️ Tempo (z. B. 3-1-1)</span>
            </div>

            <div class="calc-hero-sub">
                Tempo beschreibt <strong>wie lange</strong> du für die Phasen einer Wiederholung brauchst.
                Damit steuerst du Technik, Kontrolle und Trainingsreiz.
            </div>

            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                <button class="calc-hero-pill" type="button" @click="jumpTo('tempo_tldr')">📌 Kurz</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('tempo_read')">👀 Lesen</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('tempo_examples')">🧠 Beispiele</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('tempo_mistakes')">⚠️ Fehler</button>
            </div>
        </div>

        <div class="calc-chips" aria-label="Kurzüberblick">
            <button class="calc-chip" type="button" @click="jumpTo('tempo_tldr')">📌 Kurzfassung</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('tempo_read')">👀 Wie lesen?</button>
            <button class="calc-chip" type="button" @click="jumpTo('tempo_examples')">🧠 Beispiele</button>
            <button class="calc-chip" type="button" @click="jumpTo('tempo_why')">🎯 Warum?</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('tempo_mistakes')">⚠️ Häufige Fehler</button>
        </div>

        <div id="tempo_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">📌 Kurzfassung</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li>Tempo wird meist als <strong>3–4 Zahlen</strong> notiert.</li>
                    <li>Die Zahlen sind <strong>Sekunden</strong> pro Phase.</li>
                    <li>Typisch ist: <strong>exzentrisch – Pause – konzentrisch – Pause</strong>.</li>
                </ul>

                <div class="calc-note calc-note--spaced">
                    Wenn du nur <strong>3 Zahlen</strong> nutzt (z. B. 3-1-1), fehlt die letzte Pause und ist meist <strong>0</strong>.
                </div>
            </div>
        </div>

        <section id="tempo_read" class="calc-card" tabindex="-1" ref="readEl">
            <h4 class="calc-h">👀 Wie liest man „3-1-1“?</h4>

            <div class="calc-bands">
                <div class="calc-band">
                    <span class="calc-band-k">1. Zahl</span>
                    <span class="calc-band-v"><strong>Exzentrisch</strong> (ablassen) – z. B. 3s kontrolliert runter</span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">2. Zahl</span>
                    <span class="calc-band-v"><strong>Pause unten</strong> – z. B. 1s halten</span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">3. Zahl</span>
                    <span class="calc-band-v"><strong>Konzentrisch</strong> (hoch/drücken/ziehen) – z. B. 1s hoch</span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">4. Zahl (optional)</span>
                    <span class="calc-band-v"><strong>Pause oben</strong> – wenn nicht angegeben, oft 0s</span>
                </div>
            </div>

            <div class="calc-note calc-note--spaced">
                Beispiel Bankdrücken: <strong>3-1-1</strong> = 3s runter, 1s auf der Brust halten, 1s hoch.
            </div>
        </section>

        <section id="tempo_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">🧠 Beispiele</h4>
            <ul class="calc-list">
                <li><strong>2-0-1</strong> → sauber runter, ohne Pause, normal hoch (Standard)</li>
                <li><strong>3-1-1</strong> → mehr Kontrolle, Technik, weniger „schummeln“</li>
                <li><strong>4-0-1</strong> → längere Exzentrik, mehr Time-under-Tension</li>
                <li><strong>2-2-1</strong> → Pause unten macht’s schwerer (z. B. Squat unten)</li>
                <li><strong>3-0-X</strong> → runter kontrolliert, hoch explosiv (X = so schnell sauber geht)</li>
            </ul>
        </section>

        <section id="tempo_why" class="calc-card" tabindex="-1" ref="whyEl">
            <h4 class="calc-h">🎯 Warum Tempo tracken?</h4>
            <ul class="calc-list">
                <li><strong>Technik:</strong> du bleibst sauber, weniger „ego reps“</li>
                <li><strong>Reiz steuern:</strong> mehr Kontrolle / mehr Spannung / anderer Fokus</li>
                <li><strong>Vergleichbarkeit:</strong> 80 kg mit 4s exzentrisch ist nicht „gleich“ wie 80 kg schnell</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                Fürs Loggen reicht oft: <strong>Tempo</strong> nur dann setzen, wenn es bewusst vorgegeben ist.
            </div>
        </section>

        <div id="tempo_mistakes" class="calc-callout calc-callout--warn" tabindex="-1" ref="mistakesEl">
            <div class="calc-callout-title">⚠️ Häufige Fehler</div>
            <ul class="calc-list">
                <li><strong>Zahlen sind nicht gleich „Gesamtzeit“.</strong> Es sind Phasen pro Wiederholung.</li>
                <li><strong>Unrealistische Angaben.</strong> „10-0-10“ und dann trotzdem normale Wiederholungen – passt nicht.</li>
                <li><strong>Tempo killt Gewicht.</strong> Wenn du Tempo strenger machst, ist weniger Gewicht normal.</li>
                <li><strong>Uneinheitlich.</strong> Wenn du Tempo trackst, dann möglichst konsistent.</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const tldrEl = ref<HTMLElement | null>(null)
    const readEl = ref<HTMLElement | null>(null)
    const examplesEl = ref<HTMLElement | null>(null)
    const whyEl = ref<HTMLElement | null>(null)
    const mistakesEl = ref<HTMLElement | null>(null)

    function jumpTo(id: 'tempo_tldr' | 'tempo_read' | 'tempo_examples' | 'tempo_why' | 'tempo_mistakes') {
        const map: Record<string, HTMLElement | null> = {
            tempo_tldr: tldrEl.value,
            tempo_read: readEl.value,
            tempo_examples: examplesEl.value,
            tempo_why: whyEl.value,
            tempo_mistakes: mistakesEl.value,
        }
        const el = map[id]
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el?.focus?.()
    }
</script>

<style scoped>
</style>
