<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" aria-label="HIIT Kurzkarte">
            <div class="calc-hero-top">
                <span class="calc-hero-title">HIIT</span>
            </div>

            <div class="calc-hero-sub">
                HIIT bedeutet <strong>High Intensity Interval Training</strong>:
                kurze, harte Belastungen im Wechsel mit lockeren Phasen oder Pausen.
            </div>

            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                <button class="calc-hero-pill" type="button" @click="jumpTo('hiit_tldr')">Kurz</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hiit_examples')">Beispiele</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hiit_why')">Warum meiden?</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('hiit_mistakes')">Fehler</button>
            </div>
        </div>

        <div class="calc-chips" aria-label="Kurzüberblick">
            <button class="calc-chip" type="button" @click="jumpTo('hiit_tldr')">Kurzfassung</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('hiit_examples')">Typische Formen</button>
            <button class="calc-chip" type="button" @click="jumpTo('hiit_why')">Warum ausschalten?</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('hiit_mistakes')">Häufige Fehler</button>
        </div>

        <div id="hiit_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">Kurzfassung</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li><strong>HIIT</strong> = sehr intensive Intervalle mit wenig Erholung dazwischen.</li>
                    <li>Typisch sind kurze Sprints, AirBike-Intervalle, Burpees oder harte Ruder-Intervalle.</li>
                    <li>Es ist <strong>anstrengender</strong> für Kreislauf, Atmung und Erholung als lockeres Cardio.</li>
                </ul>
            </div>
        </div>

        <section id="hiit_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">Typische HIIT-Beispiele</h4>
            <ul class="calc-list">
                <li><strong>20s all-out / 40s Pause</strong> auf Bike, Rudergerät oder Laufband</li>
                <li><strong>Tabata</strong> mit 8 sehr harten Intervallen</li>
                <li><strong>Sprints</strong> am Ende einer Session</li>
                <li><strong>Burpee-, Jump- oder Circuit-Intervalle</strong> mit sehr wenig Erholung</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                Nicht jedes Intervalltraining ist automatisch HIIT. Entscheidend ist die <strong>sehr hohe Intensität</strong>.
            </div>
        </section>

        <section id="hiit_why" class="calc-card" tabindex="-1" ref="whyEl">
            <h4 class="calc-h">Warum gibt es die Option "Kein HIIT"?</h4>
            <ul class="calc-list">
                <li><strong>Erholung:</strong> HIIT kann die Gesamtbelastung stark erhöhen.</li>
                <li><strong>Beschwerden:</strong> bei Schmerzen, Gelenkproblemen oder sensiblen Phasen ist es oft unpassend.</li>
                <li><strong>Ziel:</strong> manchmal willst du nur Kraft, lockeres Cardio oder gelenkschonende Einheiten.</li>
                <li><strong>Alltag:</strong> in stressigen Wochen ist weniger hochintensiver Reiz oft sinnvoller.</li>
            </ul>
        </section>

        <div id="hiit_mistakes" class="calc-callout calc-callout--warn" tabindex="-1" ref="mistakesEl">
            <div class="calc-callout-title">Häufige Missverständnisse</div>
            <ul class="calc-list">
                <li><strong>HIIT ist nicht "jedes Cardio".</strong> Lockeres Radfahren oder Gehen ist kein HIIT.</li>
                <li><strong>Mehr ist nicht automatisch besser.</strong> Zu viel HIIT kann Regeneration und Krafttraining stören.</li>
                <li><strong>Nur weil es kurz ist, ist es nicht leicht.</strong> Gerade kurze harte Intervalle können sehr fordernd sein.</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const tldrEl = ref<HTMLElement | null>(null)
    const examplesEl = ref<HTMLElement | null>(null)
    const whyEl = ref<HTMLElement | null>(null)
    const mistakesEl = ref<HTMLElement | null>(null)

    function jumpTo(id: 'hiit_tldr' | 'hiit_examples' | 'hiit_why' | 'hiit_mistakes') {
        const map: Record<string, HTMLElement | null> = {
            hiit_tldr: tldrEl.value,
            hiit_examples: examplesEl.value,
            hiit_why: whyEl.value,
            hiit_mistakes: mistakesEl.value,
        }
        const el = map[id]
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el?.focus?.()
    }
</script>

<style scoped>
</style>
