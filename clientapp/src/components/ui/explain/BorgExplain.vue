<!--components/ui/explain/BorgExplain.vue-->

<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" :aria-label="t('explain.borg.heroAria')">
            <div class="calc-hero-top">
                <span class="calc-hero-title">ℹ️ {{ t('explain.borg.heroTitle') }}</span>
            </div>

            <div class="calc-hero-sub">
                {{ t('explain.borg.heroTextBefore') }} <strong>{{ t('explain.borg.heroTextStrong') }}</strong> {{ t('explain.borg.heroTextAfter') }}
            </div>

            <div class="calc-hero-pills" :aria-label="t('explain.common.quickNav')">
                <button class="calc-hero-pill" type="button" @click="jumpTo('borg_tldr')">📌 {{ t('explain.common.short') }}</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('borg_ranges')">📊 {{ t('explain.borg.ranges') }}</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('borg_tips')">⚠️ {{ t('explain.common.tips') }}</button>

            </div>
        </div>

        <div class="calc-chips" :aria-label="t('explain.common.overview')">
            <button class="calc-chip" type="button" @click="jumpTo('borg_tldr')">📌 {{ t('explain.common.summary') }}</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('borg_ranges')">📊 {{ t('explain.borg.ranges') }}</button>
            <button class="calc-chip" type="button" @click="jumpTo('borg_examples')">🧠 {{ t('explain.common.examples') }}</button>
            <button class="calc-chip" type="button" @click="jumpTo('borg_zones')">🎯 {{ t('explain.borg.trainingWithIt') }}</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('borg_tips')">⚠️ {{ t('explain.common.commonMistakes') }}</button>
        </div>

        <div id="borg_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">📌 {{ t('explain.common.summary') }}</div>
            <div class="calc-callout-text">
                {{ t('explain.borg.summaryBefore') }} <strong>{{ t('explain.borg.summaryStrong') }}</strong> {{ t('explain.borg.summaryAfter') }}
                <ul class="calc-list calc-list--spaced">
                    <li><strong>6</strong> = {{ t('explain.borg.scale6') }}</li>
                    <li><strong>12–13</strong> = {{ t('explain.borg.scale12') }}</li>
                    <li><strong>17–19</strong> = {{ t('explain.borg.scale17') }}</li>
                    <li><strong>20</strong> = {{ t('explain.borg.scale20') }}</li>
                </ul>
            </div>
        </div>

        <section id="borg_ranges" class="calc-card" tabindex="-1" ref="rangesEl">
            <h4 class="calc-h">📊 {{ t('explain.borg.ranges') }}</h4>
            <div class="calc-bands">
                <div class="calc-band"><span class="calc-band-k">6–8</span><span class="calc-band-v">{{ t('explain.borg.rangeVeryEasy') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">9–11</span><span class="calc-band-v">{{ t('explain.borg.rangeEasy') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">12–13</span><span class="calc-band-v">{{ t('explain.borg.rangeMedium') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">14–16</span><span class="calc-band-v">{{ t('explain.borg.rangeHard') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">17–19</span><span class="calc-band-v">{{ t('explain.borg.rangeVeryHard') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">20</span><span class="calc-band-v">{{ t('explain.borg.rangeMax') }}</span></div>

            </div>
        </section>

        <section id="borg_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">🧠 {{ t('explain.borg.examplesTitle') }}</h4>
            <ul class="calc-list">
                <li><strong>10:</strong> {{ t('explain.borg.example10') }}</li>
                <li><strong>13:</strong> {{ t('explain.borg.example13') }}</li>
                <li><strong>15:</strong> {{ t('explain.borg.example15') }}</li>
                <li><strong>18:</strong> {{ t('explain.borg.example18') }}</li>
            </ul>
        </section>

        <section id="borg_zones" class="calc-card" tabindex="-1" ref="zonesEl">
            <h4 class="calc-h">🎯 {{ t('explain.borg.trainingTitle') }}</h4>
            <div class="calc-bands">
                <div class="calc-band"><span class="calc-band-k">Borg 9–11</span><span class="calc-band-v">{{ t('explain.borg.zoneEasy') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">Borg 12–13</span><span class="calc-band-v">{{ t('explain.borg.zoneMedium') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">Borg 14–16</span><span class="calc-band-v">{{ t('explain.borg.zoneHard') }}</span></div>
                <div class="calc-band"><span class="calc-band-k">Borg 17–19</span><span class="calc-band-v">{{ t('explain.borg.zoneVeryHard') }}</span></div>
            </div>

            <div class="calc-note calc-note--spaced">
                {{ t('explain.borg.tipBefore') }} <strong>{{ t('explain.borg.tipStrong') }}</strong> {{ t('explain.borg.tipAfter') }}
            </div>
        </section>

        <div class="calc-callout">
            <div class="calc-callout-title">🔁 {{ t('explain.borg.scaleCompareTitle') }}</div>
            <div class="calc-callout-text">
                <ul class="calc-list">
                    <li><strong>Borg 6–20</strong> = {{ t('explain.borg.scaleCompareClassic') }}</li>
                    <li><strong>CR10 / RPE 0–10</strong> = {{ t('explain.borg.scaleCompareSimple') }}</li>
                    <li><strong>{{ t('explain.borg.ruleOfThumbStrong') }}</strong> {{ t('explain.borg.ruleOfThumbAfter') }}</li>
                </ul>
            </div>
        </div>

        <div class="calc-callout">
            <div class="calc-callout-title">🧾 {{ t('explain.borg.usefulTitle') }}</div>
            <div class="calc-callout-text">
                <ul class="calc-list">
                    <li><strong>{{ t('explain.borg.timingStrong') }}</strong> {{ t('explain.borg.timingAfter') }}</li>
                    <li><strong>{{ t('explain.borg.contextStrong') }}</strong> {{ t('explain.borg.contextAfter') }}</li>
                    <li><strong>{{ t('explain.borg.consistentStrong') }}</strong> {{ t('explain.borg.consistentAfter') }}</li>
                </ul>
            </div>
        </div>

        <div id="borg_tips" class="calc-callout calc-callout--warn" tabindex="-1" ref="tipsEl">
            <div class="calc-callout-title">⚠️ {{ t('explain.common.commonMistakes') }}</div>
            <ul class="calc-list">
                <li><strong>{{ t('explain.borg.mistake1Strong') }}</strong> {{ t('explain.borg.mistake1After') }}</li>
                <li><strong>{{ t('explain.borg.mistake2Strong') }}</strong> {{ t('explain.borg.mistake2After') }}</li>
                <li><strong>{{ t('explain.borg.mistake3Strong') }}</strong> {{ t('explain.borg.mistake3After') }}</li>
                <li><strong>{{ t('explain.borg.mistake4Strong') }}</strong> {{ t('explain.borg.mistake4After') }}</li>
                <li><strong>{{ t('explain.borg.mistake5Strong') }}</strong> {{ t('explain.borg.mistake5After') }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useI18n } from '@/composables/useI18n'

    const tldrEl = ref<HTMLElement | null>(null)
    const rangesEl = ref<HTMLElement | null>(null)
    const examplesEl = ref<HTMLElement | null>(null)
    const tipsEl = ref<HTMLElement | null>(null)
    const zonesEl = ref<HTMLElement | null>(null)

    const { t } = useI18n()

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
