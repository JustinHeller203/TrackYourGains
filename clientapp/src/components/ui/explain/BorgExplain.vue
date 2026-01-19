<!--components/ui/explain/BorgExplain.vue-->

<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" aria-label="Borg Skala Kurzkarte">
            <div class="calc-hero-top">
                <span class="calc-hero-title">ℹ️ Borg-Skala (RPE)</span>
            </div>

            <div class="calc-hero-sub">
                Schnell: <strong>wie anstrengend es sich anfühlt</strong> – nicht Herzfrequenz, nicht Pace.
            </div>

            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                <button class="calc-hero-pill" type="button" @click="jumpTo('borg_tldr')">📌 Kurz</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('borg_ranges')">📊 Bereiche</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('borg_tips')">⚠️ Tipps</button>
            </div>
        </div>

        <div class="calc-chips" aria-label="Kurzüberblick">
            <button class="calc-chip" type="button" @click="jumpTo('borg_tldr')">📌 Kurzfassung</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('borg_ranges')">📊 Bereiche</button>
            <button class="calc-chip" type="button" @click="jumpTo('borg_examples')">🧠 Beispiele</button>
            <button class="calc-chip" type="button" @click="jumpTo('borg_zones')">🎯 Training damit</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('borg_tips')">⚠️ Häufige Fehler</button>
        </div>

        <div id="borg_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">📌 Kurzfassung</div>
            <div class="calc-callout-text">
                Die Borg-Skala ist dein <strong>subjektives Belastungsgefühl</strong> (RPE).
                <ul class="calc-list calc-list--spaced">
                    <li><strong>6</strong> = super leicht / Spaziergang</li>
                    <li><strong>12–13</strong> = “anstrengend, aber machbar”</li>
                    <li><strong>17–19</strong> = sehr anstrengend</li>
                    <li><strong>20</strong> = maximal</li>
                </ul>
            </div>
        </div>

        <section id="borg_ranges" class="calc-card" tabindex="-1" ref="rangesEl">
            <h4 class="calc-h">📊 Bereiche</h4>
            <div class="calc-bands">
                <div class="calc-band"><span class="calc-band-k">6–8</span><span class="calc-band-v">sehr leicht</span></div>
                <div class="calc-band"><span class="calc-band-k">9–11</span><span class="calc-band-v">leicht</span></div>
                <div class="calc-band"><span class="calc-band-k">12–13</span><span class="calc-band-v">mittel</span></div>
                <div class="calc-band"><span class="calc-band-k">14–16</span><span class="calc-band-v">schwer</span></div>
                <div class="calc-band"><span class="calc-band-k">17–19</span><span class="calc-band-v">sehr schwer</span></div>
                <div class="calc-band"><span class="calc-band-k">20</span><span class="calc-band-v">maximal</span></div>
            </div>
        </section>

        <section id="borg_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">🧠 Beispiele (damit du’s triffst)</h4>
            <ul class="calc-list">
                <li><strong>10:</strong> du kannst gut reden, Atmung ist ruhig</li>
                <li><strong>13:</strong> reden ist noch möglich, Atmung deutlich</li>
                <li><strong>15:</strong> kurze Sätze sind möglich, Fokus nötig</li>
                <li><strong>18:</strong> sehr hart, du willst bald abbrechen</li>
            </ul>
        </section>

        <section id="borg_zones" class="calc-card" tabindex="-1" ref="zonesEl">
            <h4 class="calc-h">🎯 Orientierung fürs Training</h4>
            <div class="calc-bands">
                <div class="calc-band"><span class="calc-band-k">Borg 9–11</span><span class="calc-band-v">Locker / Grundlagenausdauer (Sprechen gut möglich)</span></div>
                <div class="calc-band"><span class="calc-band-k">Borg 12–13</span><span class="calc-band-v">Mittel (Sprechen noch möglich)</span></div>
                <div class="calc-band"><span class="calc-band-k">Borg 14–16</span><span class="calc-band-v">Anstrengend / Tempo (Sprechen nur kurz)</span></div>
                <div class="calc-band"><span class="calc-band-k">Borg 17–19</span><span class="calc-band-v">Sehr anstrengend / Intervalle (Sprechen kaum möglich)</span></div>
            </div>

            <div class="calc-note calc-note--spaced">
                Tipp: Bewerte Borg nach dem <strong>härtesten Abschnitt</strong> (nicht nach den ersten 2 Minuten).
            </div>
        </section>

        <div class="calc-callout">
            <div class="calc-callout-title">🔁 6–20 vs. “RPE 1–10” (damit du nicht verwirrst)</div>
            <div class="calc-callout-text">
                <ul class="calc-list">
                    <li><strong>Borg 6–20</strong> = klassisch (feiner abgestuft)</li>
                    <li><strong>CR10 / RPE 0–10</strong> = einfacher (häufig in Tools/Plänen)</li>
                    <li><strong>Faustregel:</strong> Borg 13 ≈ RPE 6–7 (grob, nicht exakt)</li>
                </ul>
            </div>
        </div>

        <div class="calc-callout">
            <div class="calc-callout-title">🧾 So wird Borg im Training wirklich nützlich</div>
            <div class="calc-callout-text">
                <ul class="calc-list">
                    <li><strong>Timing:</strong> bei Intervallen am Ende des Intervalls bewerten, bei gleichmäßigem Tempo nach dem Einpendeln oder am Ende.</li>
                    <li><strong>Mit Kontext notieren:</strong> Borg + Dauer + kurze Notiz (z.B. Schlaf, Hitze, Stress).</li>
                    <li><strong>Konsequent bleiben:</strong> in deinen Logs immer dieselbe Skala nutzen (6–20 oder 0–10).</li>
                </ul>
            </div>
        </div>

        <div id="borg_tips" class="calc-callout calc-callout--warn" tabindex="-1" ref="tipsEl">
            <div class="calc-callout-title">⚠️ Häufige Fehler</div>
            <ul class="calc-list">
                <li><strong>Borg ≠ Puls.</strong> Puls kann hoch sein, Borg trotzdem moderat (Hitze, Stress, Koffein).</li>
                <li><strong>Dauer zählt.</strong> Borg 15 für 30 Sekunden ≠ Borg 15 für 20 Minuten.</li>
                <li><strong>Bewerte richtig.</strong> Nach dem schwersten Teil / am Ende des Intervalls.</li>
                <li><strong>Nicht schätzen, um “gut” dazustehen.</strong> Sonst werden die Daten unzuverlässig.</li>
                <li><strong>Wenn Borg plötzlich hoch ist:</strong> Schlaf, Krankheit, Flüssigkeit und Energiezufuhr prüfen.</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const tldrEl = ref<HTMLElement | null>(null)
    const rangesEl = ref<HTMLElement | null>(null)
    const examplesEl = ref<HTMLElement | null>(null)
    const tipsEl = ref<HTMLElement | null>(null)
    const zonesEl = ref<HTMLElement | null>(null)

    function jumpTo(id: 'borg_tldr' | 'borg_ranges' | 'borg_examples' | 'borg_zones' | 'borg_tips') {
        const map: Record<string, HTMLElement | null> = {
            borg_tldr: tldrEl.value,
            borg_ranges: rangesEl.value,
            borg_examples: examplesEl.value,
            borg_zones: zonesEl.value,
            borg_tips: tipsEl.value,
        }
        const el = map[id]
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el?.focus?.()
    }
</script>

<style scoped>
</style>
