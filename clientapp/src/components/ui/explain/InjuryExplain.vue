<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" :aria-label="t('complaints.injury.explain.aria.card')">
            <div class="calc-hero-top">
                <span class="calc-hero-title">{{ t('complaints.injury.explain.infoPrefix') }} {{ props.explanation.title }}</span>
            </div>

            <div class="calc-hero-sub">
                {{ props.explanation.summary }}
            </div>

            <div class="calc-hero-pills" :aria-label="t('complaints.injury.explain.aria.quickNav')">
                <button class="calc-hero-pill" type="button" @click="jumpTo('injury_causes')">{{ t('complaints.injury.explain.nav.causes') }}</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('injury_types')">{{ t('complaints.injury.explain.nav.types') }}</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('injury_signs')">{{ t('complaints.injury.explain.nav.signs') }}</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('injury_action')">{{ t('complaints.injury.explain.nav.action') }}</button>
            </div>
        </div>

        <div class="calc-chips" :aria-label="t('complaints.injury.explain.aria.overview')">
            <button class="calc-chip" type="button" @click="jumpTo('injury_today')">{{ t('complaints.injury.explain.section.today') }}</button>
            <button class="calc-chip" type="button" @click="jumpTo('injury_avoid')">{{ t('complaints.injury.explain.section.avoid') }}</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('injury_doctor')">{{ t('complaints.injury.explain.section.doctor') }}</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('injury_return')">{{ t('complaints.injury.explain.section.return') }}</button>
        </div>

        <section :id="idFor('injury_today')" class="calc-card" tabindex="-1" ref="todayEl">
            <h4 class="calc-h">{{ t('complaints.injury.explain.section.today') }}</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in todayActions" :key="`today-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <section :id="idFor('injury_avoid')" class="calc-card" tabindex="-1" ref="avoidEl">
            <h4 class="calc-h">{{ t('complaints.injury.explain.section.avoid') }}</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in avoidList" :key="`avoid-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <div :id="idFor('injury_doctor')" class="calc-callout calc-callout--warn" tabindex="-1" ref="doctorEl">
            <div class="calc-callout-title">{{ t('complaints.injury.explain.section.doctorTitle') }}</div>
            <ul class="calc-list calc-list--spaced">
                <li v-for="(item, idx) in seeDoctorList" :key="`doctor-${idx}`">{{ item }}</li>
            </ul>
        </div>

        <section :id="idFor('injury_return')" class="calc-card" tabindex="-1" ref="returnEl">
            <h4 class="calc-h">{{ t('complaints.injury.explain.section.returnTitle') }}</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in returnCriteriaList" :key="`return-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <div :id="idFor('injury_causes')" class="calc-callout calc-callout--tldr" tabindex="-1" ref="causesEl">
            <div class="calc-callout-title">{{ t('complaints.injury.explain.section.causes') }}</div>
            <ul class="calc-list calc-list--spaced">
                <li v-for="(item, idx) in props.explanation.causes" :key="`cause-${idx}`">{{ item }}</li>
            </ul>
        </div>

        <section :id="idFor('injury_types')" class="calc-card" tabindex="-1" ref="typesEl">
            <h4 class="calc-h">{{ t('complaints.injury.explain.section.types') }}</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in props.explanation.types" :key="`type-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <section :id="idFor('injury_signs')" class="calc-card" tabindex="-1" ref="signsEl">
            <h4 class="calc-h">{{ t('complaints.injury.explain.section.signs') }}</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in props.explanation.signs" :key="`sign-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <div :id="idFor('injury_action')" class="calc-callout calc-callout--warn" tabindex="-1" ref="actionEl">
            <div class="calc-callout-title">{{ t('complaints.injury.explain.section.action') }}</div>
            <div class="calc-callout-text">{{ props.explanation.action }}</div>
        </div>

    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import type { InjuryExplanation } from '@/components/ui/explain/injuryExplanations'
    import { useI18n } from '@/composables/useI18n'

    const props = defineProps<{
        explanation: InjuryExplanation
    }>()
    const { t } = useI18n()

    const uid = Math.random().toString(36).slice(2, 9)
    const causesEl = ref<HTMLElement | null>(null)
    const typesEl = ref<HTMLElement | null>(null)
    const signsEl = ref<HTMLElement | null>(null)
    const actionEl = ref<HTMLElement | null>(null)
    const todayEl = ref<HTMLElement | null>(null)
    const avoidEl = ref<HTMLElement | null>(null)
    const doctorEl = ref<HTMLElement | null>(null)
    const returnEl = ref<HTMLElement | null>(null)

    const todayActions = computed(() => props.explanation.todayActions?.length
        ? props.explanation.todayActions
        : [t('complaints.injury.explain.fallback.today')])
    const avoidList = computed(() => props.explanation.avoid?.length
        ? props.explanation.avoid
        : [t('complaints.injury.explain.fallback.avoid')])
    const seeDoctorList = computed(() => props.explanation.seeDoctorWhen?.length
        ? props.explanation.seeDoctorWhen
        : [t('complaints.injury.explain.fallback.doctor')])
    const returnCriteriaList = computed(() => props.explanation.returnCriteria?.length
        ? props.explanation.returnCriteria
        : [t('complaints.injury.explain.fallback.return')])

    function idFor(base: string) {
        return `${base}-${uid}`
    }

    function jumpTo(
        target:
        | 'injury_causes'
        | 'injury_types'
        | 'injury_signs'
        | 'injury_action'
        | 'injury_today'
        | 'injury_avoid'
        | 'injury_doctor'
        | 'injury_return'
    ) {
        const map: Record<string, HTMLElement | null> = {
            injury_causes: causesEl.value,
            injury_types: typesEl.value,
            injury_signs: signsEl.value,
            injury_action: actionEl.value,
            injury_today: todayEl.value,
            injury_avoid: avoidEl.value,
            injury_doctor: doctorEl.value,
            injury_return: returnEl.value,
        }
        const el = map[target]
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        el?.focus?.()
    }
</script>

<style scoped>
</style>
