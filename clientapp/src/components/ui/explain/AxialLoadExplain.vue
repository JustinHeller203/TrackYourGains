<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" :aria-label="t('explain.axial.heroAria')">
            <div class="calc-hero-top">
                <span class="calc-hero-title">{{ t('explain.axial.heroTitle') }}</span>
            </div>

            <div class="calc-hero-sub">
                {{ t('explain.axial.heroTextBefore') }} <strong>{{ t('explain.axial.heroTextStrong') }}</strong>,
                {{ t('explain.axial.heroTextAfter') }}
            </div>

            <div class="calc-hero-pills" :aria-label="t('explain.common.quickNav')">
                <button class="calc-hero-pill" type="button" @click="jumpTo('axial_tldr')">{{ t('explain.common.short') }}</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('axial_examples')">{{ t('explain.common.examples') }}</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('axial_why')">{{ t('explain.common.whyAvoid') }}</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('axial_mistakes')">{{ t('explain.common.mistakes') }}</button>
            </div>
        </div>

        <div class="calc-chips" :aria-label="t('explain.common.overview')">
            <button class="calc-chip" type="button" @click="jumpTo('axial_tldr')">{{ t('explain.common.summary') }}</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('axial_examples')">{{ t('explain.common.examples') }}</button>
            <button class="calc-chip" type="button" @click="jumpTo('axial_why')">{{ t('explain.common.whyDisable') }}</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('axial_mistakes')">{{ t('explain.common.commonMistakes') }}</button>
        </div>

        <div id="axial_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">{{ t('explain.common.summary') }}</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li><strong>{{ t('explain.axial.heroTitle') }}</strong> {{ t('explain.axial.summaryLine1After') }}</li>
                    <li>{{ t('explain.axial.summaryLine2') }}</li>
                    <li>{{ t('explain.axial.summaryLine3') }}</li>
                </ul>
            </div>
        </div>

        <section id="axial_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">{{ t('explain.axial.examplesTitle') }}</h4>
            <ul class="calc-list">
                <li><strong>{{ t('explain.axial.example1Strong') }}</strong> {{ t('explain.axial.example1After') }}</li>
                <li><strong>Front Squats</strong> {{ t('explain.axial.example2After') }}</li>
                <li><strong>{{ t('explain.axial.example3Strong') }}</strong> {{ t('explain.axial.example3After') }}</li>
                <li><strong>{{ t('explain.axial.example4Strong') }}</strong> {{ t('explain.axial.example4After') }}</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                {{ t('explain.axial.examplesNote') }}
            </div>
        </section>

        <section id="axial_why" class="calc-card" tabindex="-1" ref="whyEl">
            <h4 class="calc-h">{{ t('explain.axial.whyTitle') }}</h4>
            <ul class="calc-list">
                <li><strong>{{ t('explain.axial.why1Strong') }}</strong> {{ t('explain.axial.why1After') }}</li>
                <li><strong>{{ t('explain.axial.why2Strong') }}</strong> {{ t('explain.axial.why2After') }}</li>
                <li><strong>{{ t('explain.axial.why3Strong') }}</strong> {{ t('explain.axial.why3After') }}</li>
                <li><strong>{{ t('explain.axial.why4Strong') }}</strong> {{ t('explain.axial.why4After') }}</li>
            </ul>
        </section>

        <div id="axial_mistakes" class="calc-callout calc-callout--warn" tabindex="-1" ref="mistakesEl">
            <div class="calc-callout-title">{{ t('explain.axial.mistakesTitle') }}</div>
            <ul class="calc-list">
                <li><strong>{{ t('explain.axial.mistake1Strong') }}</strong> {{ t('explain.axial.mistake1After') }}</li>
                <li><strong>{{ t('explain.axial.mistake2Strong') }}</strong> {{ t('explain.axial.mistake2After') }}</li>
                <li><strong>{{ t('explain.axial.mistake3Strong') }}</strong> {{ t('explain.axial.mistake3After') }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useI18n } from '@/composables/useI18n'

    const { t } = useI18n()

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
