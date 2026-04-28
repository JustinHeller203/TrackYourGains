<!-- components/ui/explain/HrZoneExplain.vue -->
<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" :aria-label="t('explain.hr.heroAria')">
            <div class="calc-hero-top">
                <span class="calc-hero-title">ℹ️ {{ t('explain.hr.heroTitle') }}</span>
            </div>

            <div class="calc-hero-sub">
                {{ t('explain.hr.heroTextBefore') }}
                <strong>{{ t('explain.hr.heroTextStrong') }}</strong>
                {{ t('explain.hr.heroTextMiddle') }}
                {{ t('explain.hr.heroTextAfter') }}
                <strong>{{ t('explain.hr.heroTextStrong2') }}</strong>
                {{ t('explain.hr.heroTextEnd') }}
            </div>

            <div class="calc-hero-pills" :aria-label="t('explain.common.quickNav')">
                <button class="calc-hero-pill" type="button" @click="jumpTo('hr_tldr')">
                    📌 {{ t('explain.common.short') }}
                </button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hr_zones')">
                    📊 {{ t('explain.hr.zones') }}
                </button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('hr_setup')">
                    🧭 {{ t('explain.hr.determine') }}
                </button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('hr_tips')">
                    ⚠️ {{ t('explain.common.mistakes') }}
                </button>
            </div>
        </div>

        <div class="calc-chips" :aria-label="t('explain.common.overview')">
            <button class="calc-chip" type="button" @click="jumpTo('hr_tldr')">
                📌 {{ t('explain.common.summary') }}
            </button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('hr_zones')">
                📊 {{ t('explain.hr.zoneGuide') }}
            </button>
            <button class="calc-chip" type="button" @click="jumpTo('hr_goals')">
                🎯 {{ t('explain.hr.goals') }}
            </button>
            <button class="calc-chip" type="button" @click="jumpTo('hr_setup')">
                🧭 {{ t('explain.hr.howDetermine') }}
            </button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('hr_tips')">
                ⚠️ {{ t('explain.common.commonMistakes') }}
            </button>
        </div>

        <div id="hr_tldr" class="calc-callout calc-callout--tldr" tabindex="-1" ref="tldrEl">
            <div class="calc-callout-title">📌 {{ t('explain.common.summary') }}</div>
            <div class="calc-callout-text">
                <ul class="calc-list calc-list--spaced">
                    <li><strong>Zone 1–2</strong> = {{ t('explain.hr.summaryZone12') }}</li>
                    <li><strong>Zone 3</strong> = {{ t('explain.hr.summaryZone3') }}</li>
                    <li><strong>Zone 4</strong> = {{ t('explain.hr.summaryZone4') }}</li>
                    <li><strong>Zone 5</strong> = {{ t('explain.hr.summaryZone5') }}</li>
                </ul>

                <div class="calc-note calc-note--spaced">
                    {{ t('explain.hr.importantBefore') }}
                    <strong>{{ t('explain.hr.importantStrong') }}</strong>{{ t('explain.hr.importantAfter') }}
                </div>
            </div>
        </div>

        <section id="hr_zones" class="calc-card" tabindex="-1" ref="zonesEl">
            <h4 class="calc-h">📊 {{ t('explain.hr.zonesTitle') }}</h4>

            <div class="calc-bands">
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.hr.zone1Label') }}</span>
                    <span class="calc-band-v">{{ t('explain.hr.zone1Text') }}</span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.hr.zone2Label') }}</span>
                    <span class="calc-band-v">{{ t('explain.hr.zone2Text') }}</span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.hr.zone3Label') }}</span>
                    <span class="calc-band-v">{{ t('explain.hr.zone3Text') }}</span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.hr.zone4Label') }}</span>
                    <span class="calc-band-v">{{ t('explain.hr.zone4Text') }}</span>
                </div>
                <div class="calc-band">
                    <span class="calc-band-k">{{ t('explain.hr.zone5Label') }}</span>
                    <span class="calc-band-v">{{ t('explain.hr.zone5Text') }}</span>
                </div>
            </div>
        </section>

        <section id="hr_goals" class="calc-card" tabindex="-1" ref="goalsEl">
            <h4 class="calc-h">🎯 {{ t('explain.hr.goalsTitle') }}</h4>

            <ul class="calc-list">
                <li><strong>{{ t('explain.hr.zone1Strong') }}</strong> {{ t('explain.hr.goalZone1') }}</li>
                <li><strong>{{ t('explain.hr.zone2Strong') }}</strong> {{ t('explain.hr.goalZone2') }}</li>
                <li><strong>{{ t('explain.hr.zone3Strong') }}</strong> {{ t('explain.hr.goalZone3') }}</li>
                <li><strong>{{ t('explain.hr.zone4Strong') }}</strong> {{ t('explain.hr.goalZone4') }}</li>
                <li><strong>{{ t('explain.hr.zone5Strong') }}</strong> {{ t('explain.hr.goalZone5') }}</li>
            </ul>

            <div class="calc-note calc-note--spaced">
                {{ t('explain.hr.logTipBefore') }}
                <strong>{{ t('explain.hr.logTipStrong') }}</strong>
                {{ t('explain.hr.logTipAfter') }}
            </div>
        </section>

        <section id="hr_setup" class="calc-card" tabindex="-1" ref="setupEl">
            <h4 class="calc-h">🧭 {{ t('explain.hr.setupTitle') }}</h4>

            <div class="calc-callout">
                <div class="calc-callout-title">{{ t('explain.hr.maxHrTitle') }}</div>
                <div class="calc-callout-text">
                    <ul class="calc-list">
                        <li><strong>{{ t('explain.hr.bestStrong') }}</strong> {{ t('explain.hr.bestAfter') }}</li>
                        <li><strong>{{ t('explain.hr.okayStrong') }}</strong> {{ t('explain.hr.okayAfter') }}</li>
                        <li><strong>{{ t('explain.hr.inaccurateStrong') }}</strong> {{ t('explain.hr.inaccurateAfter') }}</li>
                    </ul>
                </div>
            </div>

            <div class="calc-callout">
                <div class="calc-callout-title">{{ t('explain.hr.percentTitle') }}</div>
                <div class="calc-callout-text">
                    <ul class="calc-list">
                        <li>
                            {{ t('explain.hr.percentMaxBefore') }}
                            <strong>{{ t('explain.hr.percentMaxStrong') }}</strong>.
                        </li>
                        <li>
                            {{ t('explain.hr.percentReserveBefore') }}
                            <strong>{{ t('explain.hr.percentReserveStrong') }}</strong>
                            {{ t('explain.hr.percentReserveAfter') }}
                        </li>
                        <li>
                            {{ t('explain.hr.percentConsistentBefore') }}
                            <strong>{{ t('explain.hr.percentConsistentStrong') }}</strong>
                            {{ t('explain.hr.percentConsistentAfter') }}
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <div id="hr_tips" class="calc-callout calc-callout--warn" tabindex="-1" ref="tipsEl">
            <div class="calc-callout-title">⚠️ {{ t('explain.common.commonMistakes') }}</div>

            <ul class="calc-list">
                <li><strong>{{ t('explain.hr.mistake1Strong') }}</strong> {{ t('explain.hr.mistake1After') }}</li>
                <li><strong>{{ t('explain.hr.mistake2Strong') }}</strong> {{ t('explain.hr.mistake2After') }}</li>
                <li><strong>{{ t('explain.hr.mistake3Strong') }}</strong> {{ t('explain.hr.mistake3After') }}</li>
                <li><strong>{{ t('explain.hr.mistake4Strong') }}</strong> {{ t('explain.hr.mistake4After') }}</li>
                <li><strong>{{ t('explain.hr.mistake5Strong') }}</strong> {{ t('explain.hr.mistake5After') }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import { useI18n } from '@/composables/useI18n'

    const tldrEl = ref<HTMLElement | null>(null)
    const zonesEl = ref<HTMLElement | null>(null)
    const goalsEl = ref<HTMLElement | null>(null)
    const setupEl = ref<HTMLElement | null>(null)
    const tipsEl = ref<HTMLElement | null>(null)

    const { t } = useI18n()

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
