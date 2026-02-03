<!-- components/ui/explain/HrZoneExplain.vue -->
<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" aria-label="Herzfrequenzzonen Kurzkarte">
            <div class="calc-hero-top">
                <span class="calc-hero-title">ℹ️ Herzfrequenzzonen (1–5)</span>
            </div>

            <div class="calc-hero-sub">
                Zonen sind eine <strong>Intensitäts-Einteilung</strong> über deinen Puls.
                Praktisch fürs Planen und fürs Loggen – aber nur so gut wie deine <strong>max. HF</strong> und Messung.
            </div>

            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                <button class="calc-hero-pill" type="button" @click="jumpTo('hr_tldr')">📌 Kurz</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hr_zones')">📊 Zonen</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hr_setup')">🧭 Bestimmen</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('hr_tips')">⚠️ Fehler</button>
            </div>
        </div>

        <div class="calc-chips" aria-label="Kurzüberblick">
            <button class="calc-chip" type="button" @click="jumpTo('hr_tldr')">📌 Kurzfassung</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('hr_zones')">📊 Zonen-Guide</button>
            <button class="calc-chip" type="button" @click="jumpTo('hr_goals')">🎯 Ziele</button>
            <button class="calc-chip" type="button" @click="jumpTo('hr_setup')">🧭 Wie bestimmen?</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('hr_tips')">⚠️ Häufige Fehler</button>
        </div>

        <div id="hr_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">📌 Kurzfassung</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li><strong>Zone 1–2</strong> = locker (Erholung / Grundlage)</li>
                    <li><strong>Zone 3</strong> = moderat (dauerhaft anstrengender)</li>
                    <li><strong>Zone 4</strong> = hart (Tempo/Schwelle)</li>
                    <li><strong>Zone 5</strong> = sehr hart (kurze Intervalle)</li>
                </ul>

                <div class="calc-note calc-note--spaced">
                    Wichtig: Zonen sind <strong>individuell</strong>. Gleiche Zone ≠ gleicher Puls bei jedem.
                </div>
            </div>
        </div>

        <section id="hr_zones" class="calc-card" tabindex="-1" ref="zonesEl">
            <h4 class="calc-h">📊 Zonen (Praxis-Beschreibung)</h4>

            <div class="calc-bands">
                <div class="calc-band"><span class="calc-band-k">Zone 1</span><span class="calc-band-v">sehr leicht – lockeres Einrollen, warm-up, cooldown</span></div>
                <div class="calc-band"><span class="calc-band-k">Zone 2</span><span class="calc-band-v">leicht – “Grundlage”, du kannst gut sprechen</span></div>
                <div class="calc-band"><span class="calc-band-k">Zone 3</span><span class="calc-band-v">mittel – sprechen geht noch, aber merklich</span></div>
                <div class="calc-band"><span class="calc-band-k">Zone 4</span><span class="calc-band-v">schwer – nur kurze Sätze, Fokus nötig</span></div>
                <div class="calc-band"><span class="calc-band-k">Zone 5</span><span class="calc-band-v">maximal – nur kurz haltbar (Intervalle/Sprints)</span></div>
            </div>
        </section>

        <section id="hr_goals" class="calc-card" tabindex="-1" ref="goalsEl">
            <h4 class="calc-h">🎯 Wofür nutzt man welche Zone?</h4>
            <ul class="calc-list">
                <li><strong>Zone 1:</strong> aktive Erholung, sehr locker bewegen</li>
                <li><strong>Zone 2:</strong> Grundlagenausdauer, lange Einheiten, “easy miles”</li>
                <li><strong>Zone 3:</strong> zügig, längere Blöcke, “steady” / moderate Belastung</li>
                <li><strong>Zone 4:</strong> Tempo/Schwelle, harte Intervalle oder längere Tempoblöcke</li>
                <li><strong>Zone 5:</strong> kurze harte Intervalle, VO₂-lastig, Sprints</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                Tipp fürs Loggen: <strong>Zone + Dauer + (optional) Borg</strong> = sehr aussagekräftig.
            </div>
        </section>

        <section id="hr_setup" class="calc-card" tabindex="-1" ref="setupEl">
            <h4 class="calc-h">🧭 Wie bestimmst du deine Zonen sinnvoll?</h4>

            <div class="calc-callout">
                <div class="calc-callout-title">1) Max. HF: je besser, desto genauer</div>
                <div class="calc-callout-text">
                    <ul class="calc-list">
                        <li><strong>Am besten:</strong> Test (Labor oder gut geführter Feldtest) + Brustgurt</li>
                        <li><strong>Okay:</strong> harte Intervalle / Sprint-Finish (wenn du gesund bist)</li>
                        <li><strong>Ungenau:</strong> reine Formel (z.B. 220 − Alter) – nur grober Startpunkt</li>
                    </ul>
                </div>
            </div>

            <div class="calc-callout">
                <div class="calc-callout-title">2) Prozent wovon?</div>
                <div class="calc-callout-text">
                    <ul class="calc-list">
                        <li>Viele Systeme nehmen <strong>% der Max-HF</strong>.</li>
                        <li>Manche nehmen <strong>% der HF-Reserve</strong> (Max − Ruhepuls) → oft “gefühl-näher”.</li>
                        <li>Wenn du unsicher bist: bleib konsistent mit <strong>einem</strong> System.</li>
                    </ul>
                </div>
            </div>
        </section>

        <div id="hr_tips" class="calc-callout calc-callout--warn" tabindex="-1" ref="tipsEl">
            <div class="calc-callout-title">⚠️ Häufige Fehler</div>
            <ul class="calc-list">
                <li><strong>Optische Zone ≠ echte Intensität.</strong> Hitze, Stress, Koffein, Dehydration pushen den Puls.</li>
                <li><strong>Wrist-Sensor kann daneben liegen.</strong> Für Cardio-Tracking ist Brustgurt oft zuverlässiger.</li>
                <li><strong>Zu früh bewerten.</strong> In den ersten Minuten driftet der Puls oft.</li>
                <li><strong>Nur Zone loggen ohne Dauer.</strong> Zone ohne Zeit sagt wenig aus.</li>
                <li><strong>Wenn’s plötzlich “zu hoch” ist:</strong> Schlaf, Krankheit, Essen/Trinken, Erholung prüfen.</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const tldrEl = ref<HTMLElement | null>(null)
    const zonesEl = ref<HTMLElement | null>(null)
    const goalsEl = ref<HTMLElement | null>(null)
    const setupEl = ref<HTMLElement | null>(null)
    const tipsEl = ref<HTMLElement | null>(null)

    function jumpTo(id: 'hr_tldr' | 'hr_zones' | 'hr_goals' | 'hr_setup' | 'hr_tips') {
        const map: Record<string, HTMLElement | null> = {
            hr_tldr: tldrEl.value,
            hr_zones: zonesEl.value,
            hr_goals: goalsEl.value,
            hr_setup: setupEl.value,
            hr_tips: tipsEl.value,
        }
        const el = map[id]
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el?.focus?.()
    }
</script>

<style scoped>
</style>
