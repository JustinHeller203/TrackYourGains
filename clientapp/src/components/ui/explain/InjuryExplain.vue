<template>
    <div class="calc-scan">
        <div class="calc-hero" role="img" aria-label="Verletzung Kurzkarte">
            <div class="calc-hero-top">
                <span class="calc-hero-title">Info: {{ props.explanation.title }}</span>
            </div>

            <div class="calc-hero-sub">
                {{ props.explanation.summary }}
            </div>

            <div class="calc-hero-pills" aria-label="Schnellnavigation">
                <button class="calc-hero-pill" type="button" @click="jumpTo('injury_causes')">Wie entsteht es?</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('injury_types')">Arten</button>
                <button class="calc-hero-pill" type="button" @click="jumpTo('injury_signs')">Erkennen</button>
                <button class="calc-hero-pill calc-hero-pill--warn" type="button" @click="jumpTo('injury_action')">Wichtig</button>
            </div>
        </div>

        <div class="calc-chips" aria-label="Kurzüberblick">
            <button class="calc-chip" type="button" @click="jumpTo('injury_today')">Was ich heute tun kann</button>
            <button class="calc-chip" type="button" @click="jumpTo('injury_avoid')">Was vermeiden</button>
            <button class="calc-chip calc-chip--warn" type="button" @click="jumpTo('injury_doctor')">Wann zum Arzt</button>
            <button class="calc-chip calc-chip--good" type="button" @click="jumpTo('injury_return')">Return-to-Training</button>
        </div>

        <section :id="idFor('injury_today')" class="calc-card" tabindex="-1" ref="todayEl">
            <h4 class="calc-h">Was ich heute tun kann</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in todayActions" :key="`today-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <section :id="idFor('injury_avoid')" class="calc-card" tabindex="-1" ref="avoidEl">
            <h4 class="calc-h">Was vermeiden</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in avoidList" :key="`avoid-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <div :id="idFor('injury_doctor')" class="calc-callout calc-callout--warn" tabindex="-1" ref="doctorEl">
            <div class="calc-callout-title">Wann zum Arzt?</div>
            <ul class="calc-list calc-list--spaced">
                <li v-for="(item, idx) in seeDoctorList" :key="`doctor-${idx}`">{{ item }}</li>
            </ul>
        </div>

        <section :id="idFor('injury_return')" class="calc-card" tabindex="-1" ref="returnEl">
            <h4 class="calc-h">Return-to-Training Kriterien</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in returnCriteriaList" :key="`return-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <div :id="idFor('injury_causes')" class="calc-callout calc-callout--tldr" tabindex="-1" ref="causesEl">
            <div class="calc-callout-title">Wie entsteht es?</div>
            <ul class="calc-list calc-list--spaced">
                <li v-for="(item, idx) in props.explanation.causes" :key="`cause-${idx}`">{{ item }}</li>
            </ul>
        </div>

        <section :id="idFor('injury_types')" class="calc-card" tabindex="-1" ref="typesEl">
            <h4 class="calc-h">Welche Arten gibt es?</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in props.explanation.types" :key="`type-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <section :id="idFor('injury_signs')" class="calc-card" tabindex="-1" ref="signsEl">
            <h4 class="calc-h">Wie erkennt man es?</h4>
            <ul class="calc-list">
                <li v-for="(item, idx) in props.explanation.signs" :key="`sign-${idx}`">{{ item }}</li>
            </ul>
        </section>

        <div :id="idFor('injury_action')" class="calc-callout calc-callout--warn" tabindex="-1" ref="actionEl">
            <div class="calc-callout-title">Wichtig</div>
            <div class="calc-callout-text">{{ props.explanation.action }}</div>
        </div>

    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue'
    import type { InjuryExplanation } from '@/components/ui/explain/injuryExplanations'

    const props = defineProps<{
        explanation: InjuryExplanation
    }>()

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
        : ['Belastung reduzieren und heute nur schmerzarme Bewegung durchführen.'])
    const avoidList = computed(() => props.explanation.avoid?.length
        ? props.explanation.avoid
        : ['Belastungsspitzen und Training in stechenden Schmerz vermeiden.'])
    const seeDoctorList = computed(() => props.explanation.seeDoctorWhen?.length
        ? props.explanation.seeDoctorWhen
        : ['Bei deutlicher Verschlechterung oder fehlender Besserung ärztlich abklären.'])
    const returnCriteriaList = computed(() => props.explanation.returnCriteria?.length
        ? props.explanation.returnCriteria
        : ['Schmerzarme Funktion im Alltag und stufenweise Belastungssteigerung ohne Rückfall.'])

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
