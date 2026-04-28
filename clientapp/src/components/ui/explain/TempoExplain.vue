<!-- components/ui/explain/TempoExplain.vue -->
<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" :aria-label="t('explain.tempo.heroAria')">
            <div class="calc-hero-top">
                <span class="calc-hero-title">ℹ️ {{ t('explain.tempo.heroTitle') }}</span>
            </div>

            <div class="calc-hero-sub">
                {{ t('explain.tempo.heroTextBefore') }}
                <strong>{{ t('explain.tempo.heroTextStrong') }}</strong>
                {{ t('explain.tempo.heroTextAfter') }}
            </div>

            <div class="calc-hero-pills" :aria-label="t('explain.common.quickNav')">
                <button class="calc-hero-pill" type="button" @click="jumpTo('tempo_tldr')">
                    📌 {{ t('explain.common.short') }}
                </button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('tempo_read')">
                    👀 {{ t('explain.tempo.read') }}
                </button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('tempo_examples')">
                    🧠 {{ t('explain.common.examples') }}
                </button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('tempo_mistakes')">
                    ⚠️ {{ t('explain.common.mistakes') }}
                </button>
            </div>
        </div>

        <div class="calc-chips" :aria-label="t('explain.common.overview')">
            <button class="calc-chip" type="button" @click="jumpTo('tempo_tldr')">
                📌 {{ t('explain.common.summary') }}
            </button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('tempo_read')">
                👀 {{ t('explain.tempo.howRead') }}
            </button>
            <button class="calc-chip" type="button" @click="jumpTo('tempo_examples')">
                🧠 {{ t('explain.common.examples') }}
            </button>
            <button class="calc-chip" type="button" @click="jumpTo('tempo_why')">
                🎯 {{ t('explain.common.why') }}
            </button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('tempo_mistakes')">
                ⚠️ {{ t('explain.common.commonMistakes') }}
            </button>
        </div>

        <div id="tempo_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">📌 {{ t('explain.common.summary') }}</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li>{{ t('explain.tempo.summaryLine1Before') }} <strong>{{ t('explain.tempo.summaryLine1Strong') }}</strong> {{ t('explain.tempo.summaryLine1After') }}</li>
                    <li>{{ t('explain.tempo.summaryLine2Before') }} <strong>{{ t('explain.tempo.summaryLine2Strong') }}</strong> {{ t('explain.tempo.summaryLine2After') }}</li>
                    <li>{{ t('explain.tempo.summaryLine3Before') }} <strong>{{ t('explain.tempo.summaryLine3Strong') }}</strong>.</li>
                </ul>

                <div class="calc-note calc-note--spaced">
                    {{ t('explain.tempo.note3NumbersBefore') }}
                    <strong>{{ t('explain.tempo.note3NumbersStrong') }}</strong>
                    {{ t('explain.tempo.note3NumbersAfter') }}
                    <strong>{{ t('explain.tempo.note3NumbersStrong2') }}</strong>.
                </div>
            </div>
        </div>

        <section id="tempo_read" class="calc-card" tabindex="-1" ref="readEl">
            <h4 class="calc-h">👀 {{ t('explain.tempo.readTitle') }}</h4>

            <div class="calc-bands">
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.tempo.number1Label') }}</span>
                    <span class="calc-band-v">
                        <strong>{{ t('explain.tempo.number1Strong') }}</strong>
                        {{ t('explain.tempo.number1After') }}
                    </span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.tempo.number2Label') }}</span>
                    <span class="calc-band-v">
                        <strong>{{ t('explain.tempo.number2Strong') }}</strong>
                        {{ t('explain.tempo.number2After') }}
                    </span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.tempo.number3Label') }}</span>
                    <span class="calc-band-v">
                        <strong>{{ t('explain.tempo.number3Strong') }}</strong>
                        {{ t('explain.tempo.number3After') }}
                    </span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.tempo.number4Label') }}</span>
                    <span class="calc-band-v">
                        <strong>{{ t('explain.tempo.number4Strong') }}</strong>
                        {{ t('explain.tempo.number4After') }}
                    </span>
                </div>
            </div>

            <div class="calc-note calc-note--spaced">
                {{ t('explain.tempo.benchExampleBefore') }}
                <strong>{{ t('explain.tempo.benchExampleStrong') }}</strong>
                {{ t('explain.tempo.benchExampleAfter') }}
            </div>
        </section>

        <section id="tempo_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">🧠 {{ t('explain.common.examples') }}</h4>
            <ul class="calc-list">
                <li><strong>2-0-1</strong> → {{ t('explain.tempo.example201') }}</li>
                <li><strong>3-1-1</strong> → {{ t('explain.tempo.example311') }}</li>
                <li><strong>4-0-1</strong> → {{ t('explain.tempo.example401') }}</li>
                <li><strong>2-2-1</strong> → {{ t('explain.tempo.example221') }}</li>
                <li><strong>3-0-X</strong> → {{ t('explain.tempo.example30x') }}</li>
            </ul>
        </section>

        <section id="tempo_why" class="calc-card" tabindex="-1" ref="whyEl">
            <h4 class="calc-h">🎯 {{ t('explain.tempo.whyTitle') }}</h4>
            <ul class="calc-list">
                <li><strong>{{ t('explain.tempo.why1Strong') }}</strong> {{ t('explain.tempo.why1After') }}</li>
                <li><strong>{{ t('explain.tempo.why2Strong') }}</strong> {{ t('explain.tempo.why2After') }}</li>
                <li><strong>{{ t('explain.tempo.why3Strong') }}</strong> {{ t('explain.tempo.why3After') }}</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                {{ t('explain.tempo.logTipBefore') }}
                <strong>{{ t('explain.tempo.logTipStrong') }}</strong>
                {{ t('explain.tempo.logTipAfter') }}
            </div>
        </section>

        <div id="tempo_mistakes" class="calc-callout calc-callout--warn" tabindex="-1" ref="mistakesEl">
            <div class="calc-callout-title">⚠️ {{ t('explain.common.commonMistakes') }}</div>
            <ul class="calc-list">
                <li><strong>{{ t('explain.tempo.mistake1Strong') }}</strong> {{ t('explain.tempo.mistake1After') }}</li>
                <li><strong>{{ t('explain.tempo.mistake2Strong') }}</strong> {{ t('explain.tempo.mistake2After') }}</li>
                <li><strong>{{ t('explain.tempo.mistake3Strong') }}</strong> {{ t('explain.tempo.mistake3After') }}</li>
                <li><strong>{{ t('explain.tempo.mistake4Strong') }}</strong> {{ t('explain.tempo.mistake4After') }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useI18n } from '@/composables/useI18n'

    const tldrEl = ref<HTMLElement | null>(null)
    const readEl = ref<HTMLElement | null>(null)
    const examplesEl = ref<HTMLElement | null>(null)
    const whyEl = ref<HTMLElement | null>(null)
    const mistakesEl = ref<HTMLElement | null>(null)

    const { t } = useI18n()
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
