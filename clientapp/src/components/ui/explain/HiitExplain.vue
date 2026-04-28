<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" :aria-label="t('explain.hiit.heroAria')">
            <div class="calc-hero-top">
                <span class="calc-hero-title">HIIT</span>
            </div>

            <div class="calc-hero-sub">
                {{ t('explain.hiit.heroTextBefore') }} <strong>{{ t('explain.hiit.heroTextStrong') }}</strong>:
                {{ t('explain.hiit.heroTextAfter') }}
            </div>

            <div class="calc-hero-pills" :aria-label="t('explain.common.quickNav')">
                <button class="calc-hero-pill" type="button" @click="jumpTo('hiit_tldr')">{{ t('explain.common.short') }}</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hiit_examples')">{{ t('explain.common.examples') }}</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hiit_why')">{{ t('explain.common.whyAvoid') }}</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('hiit_mistakes')">{{ t('explain.common.mistakes') }}</button>
            </div>
        </div>

        <div class="calc-chips" :aria-label="t('explain.common.overview')">
            <button class="calc-chip" type="button" @click="jumpTo('hiit_tldr')">{{ t('explain.common.summary') }}</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('hiit_examples')">{{ t('explain.hiit.examplesLabel') }}</button>
            <button class="calc-chip" type="button" @click="jumpTo('hiit_why')">{{ t('explain.common.whyDisable') }}</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('hiit_mistakes')">{{ t('explain.common.commonMistakes') }}</button>
        </div>

        <div id="hiit_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">{{ t('explain.common.summary') }}</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li><strong>HIIT</strong> = {{ t('explain.hiit.summaryLine1After') }}</li>
                    <li>{{ t('explain.hiit.summaryLine2') }}</li>
                    <li>{{ t('explain.hiit.summaryLine3Before') }} <strong>{{ t('explain.hiit.summaryLine3Strong') }}</strong> {{ t('explain.hiit.summaryLine3After') }}</li>
                </ul>
            </div>
        </div>

        <section id="hiit_examples" class="calc-card" tabindex="-1" ref="examplesEl">
            <h4 class="calc-h">{{ t('explain.hiit.examplesTitle') }}</h4>
            <ul class="calc-list">
                <li><strong>20s all-out / 40s Pause</strong> {{ t('explain.hiit.example1After') }}</li>
                <li><strong>Tabata</strong> {{ t('explain.hiit.example2After') }}</li>
                <li><strong>{{ t('explain.hiit.example3Strong') }}</strong> {{ t('explain.hiit.example3After') }}</li>
                <li><strong>{{ t('explain.hiit.example4Strong') }}</strong> {{ t('explain.hiit.example4After') }}</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                {{ t('explain.hiit.examplesNoteBefore') }} <strong>{{ t('explain.hiit.examplesNoteStrong') }}</strong>.
            </div>
        </section>

        <section id="hiit_why" class="calc-card" tabindex="-1" ref="whyEl">
            <h4 class="calc-h">{{ t('explain.hiit.whyTitle') }}</h4>
            <ul class="calc-list">
                <li><strong>{{ t('explain.hiit.why1Strong') }}</strong> {{ t('explain.hiit.why1After') }}</li>
                <li><strong>{{ t('explain.hiit.why2Strong') }}</strong> {{ t('explain.hiit.why2After') }}</li>
                <li><strong>{{ t('explain.hiit.why3Strong') }}</strong> {{ t('explain.hiit.why3After') }}</li>
                <li><strong>{{ t('explain.hiit.why4Strong') }}</strong> {{ t('explain.hiit.why4After') }}</li>
            </ul>
        </section>

        <div id="hiit_mistakes" class="calc-callout calc-callout--warn" tabindex="-1" ref="mistakesEl">
            <div class="calc-callout-title">{{ t('explain.hiit.mistakesTitle') }}</div>
            <ul class="calc-list">
                <li><strong>{{ t('explain.hiit.mistake1Strong') }}</strong> {{ t('explain.hiit.mistake1After') }}</li>
                <li><strong>{{ t('explain.hiit.mistake2Strong') }}</strong> {{ t('explain.hiit.mistake2After') }}</li>
                <li><strong>{{ t('explain.hiit.mistake3Strong') }}</strong> {{ t('explain.hiit.mistake3After') }}</li>
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
