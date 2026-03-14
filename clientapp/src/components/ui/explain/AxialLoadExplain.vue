<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" aria-label="Axiale Last Kurzkarte">
            <div class="calc-hero-top">
                <span class="calc-hero-title">Hohe axiale Last</span>
            </div>

            <div class="calc-hero-sub">
                Axiale Last bedeutet Druck oder Belastung <strong>entlang der Körperachse</strong>,
                vor allem auf Wirbelsäule und Rumpf.
            </div>

            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                <button class="calc-hero-pill" type="button" @click="jumpTo('axial_tldr')">Kurz</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('axial_examples')">Beispiele</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('axial_why')">Warum meiden?</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('axial_mistakes')">Fehler</button>
            </div>
        </div>

        <div class="calc-chips" aria-label="Kurzüberblick">
            <button class="calc-chip" type="button" @click="jumpTo('axial_tldr')">Kurzfassung</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('axial_examples')">Typische Übungen</button>
            <button class="calc-chip" type="button" @click="jumpTo('axial_why')">Warum ausschalten?</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('axial_mistakes')">Häufige Fehler</button>
        </div>

        <div id="axial_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">Kurzfassung</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li><strong>Hohe axiale Last</strong> meint viel Druck von oben nach unten durch den Körper.</li>
                    <li>Typisch bei Übungen, in denen Gewicht auf Schultern, Rücken oder über den Rumpf getragen wird.</li>
                    <li>Das kann für Rücken, Nacken oder sensible Phasen relevanter sein als die Übung selbst vermuten lässt.</li>
                </ul>
            </div>
        </div>

        <section id="axial_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">Typische Beispiele für hohe axiale Last</h4>
            <ul class="calc-list">
                <li><strong>Kniebeugen</strong> mit Langhantel auf dem Rücken</li>
                <li><strong>Front Squats</strong> oder schwere Varianten mit viel Rumpfdruck</li>
                <li><strong>Schwere Overhead Presses</strong> im Stehen</li>
                <li><strong>Schweres Tragen / Loaded Carries</strong> je nach Variante</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                Eher niedriger sind oft geführte Maschinen, sitzende Varianten oder Übungen wie Leg Press, wenn der Rumpf weniger axial belastet wird.
            </div>
        </section>

        <section id="axial_why" class="calc-card" tabindex="-1" ref="whyEl">
            <h4 class="calc-h">Warum gibt es die Option "Keine hohe axiale Last"?</h4>
            <ul class="calc-list">
                <li><strong>Rücken oder Nacken:</strong> bei Beschwerden können stark komprimierende Übungen unpassend sein.</li>
                <li><strong>Erholung:</strong> du willst vielleicht trainieren, aber den Rumpf weniger stark belasten.</li>
                <li><strong>Sicherheit:</strong> in Aufbau- oder Rückkehrphasen sind stabilere Alternativen oft sinnvoller.</li>
                <li><strong>Planqualität:</strong> der Generator kann dann eher auf Varianten mit weniger Druck entlang der Wirbelsäule ausweichen.</li>
            </ul>
        </section>

        <div id="axial_mistakes" class="calc-callout calc-callout--warn" tabindex="-1" ref="mistakesEl">
            <div class="calc-callout-title">Häufige Missverständnisse</div>
            <ul class="calc-list">
                <li><strong>Nicht nur "schweres Gewicht" zählt.</strong> Entscheidend ist, wie die Last durch den Körper wirkt.</li>
                <li><strong>Nicht jede Beinübung ist automatisch hoch axial.</strong> Eine Leg Press belastet anders als eine Barbell Squat.</li>
                <li><strong>Die Option verbietet nicht "hart trainieren".</strong> Sie schützt nur vor bestimmten Lastprofilen.</li>
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

    function jumpTo(id: 'axial_tldr' | 'axial_examples' | 'axial_why' | 'axial_mistakes') {
        const map: Record<string, HTMLElement | null> = {
            axial_tldr: tldrEl.value,
            axial_examples: examplesEl.value,
            axial_why: whyEl.value,
            axial_mistakes: mistakesEl.value,
        }
        const el = map[id]
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el?.focus?.()
    }
</script>

<style scoped>
</style>
