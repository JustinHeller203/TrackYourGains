<template>
    <section class="injury-estimator">
        <UiPopupSelect :model-value="modelValue"
                       :label="t('complaints.injury.label')"
                       :placeholder="area ? t('complaints.injury.placeholder.pick') : t('complaints.injury.placeholder.areaFirst')"
                       :options="injuryOptions"
                       :option-info-values="injuryInfoValues"
                       :disabled="!area"
                       @update:model-value="onSelectInjury"
                       @option-info="onOpenInjuryInfo" />

        <ExplanationPopup ref="injuryInfoPopupRef"
                          :hide-trigger="true"
                          :title="activeInjuryExplanation.title"
                          :kicker="activeInjuryExplanation.kicker"
                          :aria-open="t('complaints.injury.infoAria')">
            <InjuryExplain :explanation="activeInjuryExplanation" />
        </ExplanationPopup>

        <UiPopupInput v-if="modelValue === CUSTOM_INJURY_VALUE"
                      :model-value="customInjuryName"
                      :label="t('complaints.injury.customLabel')"
                      :placeholder="t('complaints.injury.customPlaceholder')"
                      :maxlength="60"
                      @update:model-value="onCustomInjuryInput" />

        <div v-if="selectedEstimateDays" class="estimate-card" role="status" aria-live="polite">
            <p class="estimate-title">
                {{ t('complaints.injury.estimatedDowntime') }}
                <strong>{{ tp('complaints.injury.days', { days: selectedEstimateDays }) }}</strong>
            </p>
            <p class="estimate-copy">
                {{ selectedEstimateSource }}
            </p>
        </div>

        <p class="estimate-disclaimer">
            {{ t('complaints.injury.disclaimer') }}
        </p>
    </section>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue'
    import InjuryExplain from '@/components/ui/explain/InjuryExplain.vue'
    import { getInjuryExplanation } from '@/components/ui/explain/injuryExplanations'
    import UiPopupInput from '@/components/ui/kits/inputs/UiPopupInput.vue'
    import UiPopupSelect from '@/components/ui/kits/selects/UiPopupSelect.vue'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import type { ComplaintArea } from '@/types/complaint'
    import { useI18n } from '@/composables/useI18n'

    type InjuryOption = {
        key: string
        labelKey: string
        days: number
    }

    type LearnedInjury = {
        key: string
        name: string
        area: string
        samples: number
        avgDays: number
    }

    type InjuryMemory = {
        learned: LearnedInjury[]
    }

    type RememberPayload = {
        area: string
        injuryType: string
        customInjuryName?: string
        downtimeDays: string
    }

    const CUSTOM_INJURY_VALUE = '__custom__'
    const MEMORY_KEY = 'complaints_injury_memory_v1'

    const { t } = useI18n()

    function tp(key: string, params: Record<string, string | number>) {
        return Object.entries(params).reduce(
            (text, [name, value]) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
            t(key)
        )
    }

    const props = withDefaults(defineProps<{
        area: ComplaintArea | ''
        areaDisplay: string
        modelValue: string
        customInjuryName: string
    }>(), {
        area: '',
        areaDisplay: '',
        modelValue: '',
        customInjuryName: '',
    })

    const emit = defineEmits<{
        (e: 'update:modelValue', value: string): void
        (e: 'update:customInjuryName', value: string): void
        (e: 'estimate-days', value: string): void
        (e: 'summary-line', value: string): void
    }>()

    const areaLabels: Record<string, string> = {
        nacken: 'Nacken',
        schulter: 'Schulter',
        ellbogen: 'Ellbogen',
        unterarm: 'Unterarm',
        handgelenk: 'Handgelenk',
        hand: 'Hand',
        finger: 'Finger',
        brust: 'Brust',
        bauch: 'Bauch',
        ruecken: 'Rücken',
        leiste: 'Leiste',
        huefte: 'Hüfte',
        oberschenkel: 'Oberschenkel',
        knie: 'Knie',
        unterschenkel: 'Unterschenkel',
        wade: 'Wade',
        sprunggelenk: 'Sprunggelenk',
        fuss: 'Fuß',
        kopf: 'Kopf',
        benutzerdefiniert: 'Benutzerdefiniert',
        sonstiges: 'Benutzerdefiniert',
    }

    const injuryCatalog: Record<string, InjuryOption[]> = {
        nacken: [
            { key: 'zerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 10 },
            { key: 'hws-distorsion', labelKey: 'complaints.injury.name.hwsDistorsion', days: 21 },
            { key: 'bandscheibenreizung', labelKey: 'complaints.injury.name.bandscheibenreizung', days: 35 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 56 },
        ],
        schulter: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 14 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 28 },
            { key: 'impingement', labelKey: 'complaints.injury.name.impingement', days: 35 },
            { key: 'luxation', labelKey: 'complaints.injury.name.luxation', days: 42 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 56 },
        ],
        ellbogen: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 10 },
            { key: 'sehnenansatzreizung', labelKey: 'complaints.injury.name.sehnenansatzreizung', days: 21 },
            { key: 'bandverletzung', labelKey: 'complaints.injury.name.bandverletzung', days: 35 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 49 },
        ],
        unterarm: [
            { key: 'muskelzerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 14 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 21 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 49 },
        ],
        handgelenk: [
            { key: 'verstauchung', labelKey: 'complaints.injury.name.verstauchung', days: 14 },
            { key: 'sehnenentzuendung', labelKey: 'complaints.injury.name.sehnenentzuendung', days: 21 },
            { key: 'bandriss', labelKey: 'complaints.injury.name.bandriss', days: 42 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 49 },
        ],
        hand: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 10 },
            { key: 'sehnenverletzung', labelKey: 'complaints.injury.name.sehnenverletzung', days: 28 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 42 },
        ],
        finger: [
            { key: 'verstauchung', labelKey: 'complaints.injury.name.verstauchung', days: 10 },
            { key: 'bandverletzung', labelKey: 'complaints.injury.name.bandverletzung', days: 21 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 35 },
        ],
        brust: [
            { key: 'muskelzerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 14 },
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 14 },
            { key: 'rippenbruch', labelKey: 'complaints.injury.name.rippenbruch', days: 42 },
        ],
        bauch: [
            { key: 'muskelzerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 14 },
            { key: 'muskelfaserriss', labelKey: 'complaints.injury.name.muskelfaserriss', days: 28 },
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 10 },
        ],
        ruecken: [
            { key: 'muskelzerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 14 },
            { key: 'bandscheibenreizung', labelKey: 'complaints.injury.name.bandscheibenreizung', days: 42 },
            { key: 'facettensyndrom', labelKey: 'complaints.injury.name.facettensyndrom', days: 28 },
            { key: 'wirbelbruch', labelKey: 'complaints.injury.name.wirbelbruch', days: 84 },
        ],
        leiste: [
            { key: 'adduktorenzerrung', labelKey: 'complaints.injury.name.adduktorenzerrung', days: 21 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 28 },
            { key: 'muskelfaserriss', labelKey: 'complaints.injury.name.muskelfaserriss', days: 35 },
        ],
        huefte: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 14 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 28 },
            { key: 'schleimbeutel', labelKey: 'complaints.injury.name.schleimbeutel', days: 28 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 70 },
        ],
        oberschenkel: [
            { key: 'muskelzerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 14 },
            { key: 'muskelfaserriss', labelKey: 'complaints.injury.name.muskelfaserriss', days: 28 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 21 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 63 },
        ],
        knie: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 14 },
            { key: 'meniskus', labelKey: 'complaints.injury.name.meniskus', days: 42 },
            { key: 'bandverletzung', labelKey: 'complaints.injury.name.bandverletzung', days: 56 },
            { key: 'patellaspitze', labelKey: 'complaints.injury.name.patellaspitze', days: 35 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 70 },
        ],
        unterschenkel: [
            { key: 'muskelzerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 14 },
            { key: 'shin-splints', labelKey: 'complaints.injury.name.shinSplints', days: 28 },
            { key: 'muskelfaserriss', labelKey: 'complaints.injury.name.muskelfaserriss', days: 28 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 56 },
        ],
        wade: [
            { key: 'muskelzerrung', labelKey: 'complaints.injury.name.muskelzerrung', days: 14 },
            { key: 'muskelfaserriss', labelKey: 'complaints.injury.name.muskelfaserriss', days: 28 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 21 },
        ],
        sprunggelenk: [
            { key: 'distorsion', labelKey: 'complaints.injury.name.distorsion', days: 21 },
            { key: 'bandriss', labelKey: 'complaints.injury.name.bandriss', days: 42 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 28 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 56 },
        ],
        fuss: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 10 },
            { key: 'plantarfaszie', labelKey: 'complaints.injury.name.plantarfaszie', days: 28 },
            { key: 'sehnenreizung', labelKey: 'complaints.injury.name.sehnenreizung', days: 28 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 56 },
        ],
        kopf: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 7 },
            { key: 'gehirnerschuetterung', labelKey: 'complaints.injury.name.gehirnerschuetterung', days: 21 },
            { key: 'platzwunde', labelKey: 'complaints.injury.name.platzwunde', days: 10 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 56 },
        ],
        benutzerdefiniert: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 10 },
            { key: 'zerrung', labelKey: 'complaints.injury.name.zerrung', days: 14 },
            { key: 'bandverletzung', labelKey: 'complaints.injury.name.bandverletzung', days: 35 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 49 },
        ],
        sonstiges: [
            { key: 'prellung', labelKey: 'complaints.injury.name.prellung', days: 10 },
            { key: 'zerrung', labelKey: 'complaints.injury.name.zerrung', days: 14 },
            { key: 'bandverletzung', labelKey: 'complaints.injury.name.bandverletzung', days: 35 },
            { key: 'bruch', labelKey: 'complaints.injury.name.bruch', days: 49 },
        ],
    }

    const learnedInjuries = ref<LearnedInjury[]>(loadMemory().learned)

    const activeAreaKey = computed(() => String(props.area || '').trim())
    const areaName = computed(() => {
        if (props.areaDisplay?.trim()) return props.areaDisplay.trim()
        return areaLabels[activeAreaKey.value] ?? t('complaints.injury.selectedAreaFallback')
    })

    const baseInjuries = computed(() => injuryCatalog[activeAreaKey.value] ?? [])
    const learnedForArea = computed(() => learnedInjuries.value
        .filter((item) => item.area === activeAreaKey.value || item.area === '*')
        .sort((a, b) => b.samples - a.samples))

    const learnedOptions = computed(() => learnedForArea.value.map((item) => ({
        value: item.key,
        label: tp('complaints.injury.optionWithDays', {
            name: item.name,
            days: Math.round(item.avgDays),
        }),
    })))

    const injuryOptions = computed(() => {
        const base = baseInjuries.value.map((item) => ({
            value: item.key,
            label: tp('complaints.injury.optionWithDays', {
                name: t(item.labelKey),
                days: item.days,
            }),
        }))
        const existing = new Set(base.map((x) => x.value))
        const learned = learnedOptions.value.filter((x) => !existing.has(x.value))
        return [
            ...base,
            ...learned,
            { value: CUSTOM_INJURY_VALUE, label: t('complaints.injury.customOption') },
        ]
    })

    const selectedBase = computed(() => baseInjuries.value.find((x) => x.key === props.modelValue) ?? null)
    const selectedLearned = computed(() => learnedForArea.value.find((x) => x.key === props.modelValue) ?? null)
    const selectedLearnedForKey = computed(() => (
        props.modelValue ? learnedForArea.value.find((x) => x.key === props.modelValue) ?? null : null
    ))

    const selectedEstimateDays = computed(() => {
        if (selectedLearnedForKey.value) return String(Math.round(selectedLearnedForKey.value.avgDays))
        if (selectedBase.value) return String(selectedBase.value.days)
        if (selectedLearned.value) return String(Math.round(selectedLearned.value.avgDays))
        return ''
    })

    const selectedEstimateSource = computed(() => {
        if (selectedLearnedForKey.value) {
            return tp('complaints.injury.learnedSource', {
                name: selectedLearnedForKey.value.name,
                area: areaName.value,
            })
        }
        if (selectedBase.value) {
            return tp('complaints.injury.baseSource', {
                name: t(selectedBase.value.labelKey),
                area: areaName.value,
            })
        }
        if (selectedLearned.value) {
            return tp('complaints.injury.learnedSource', {
                name: selectedLearned.value.name,
                area: areaName.value,
            })
        }
        return ''
    })

    const injuryInfoPopupRef = ref<{ open: () => void } | null>(null)
    const activeInfoValue = ref('')

    const injuryOptionLabelByValue = computed(() => {
        const map = new Map<string, string>()
        for (const option of injuryOptions.value) {
            map.set(String(option.value), String(option.label).split(' · ')[0] ?? String(option.label))
        }
        return map
    })

    const injuryInfoValues = computed(() => {
        if (!activeAreaKey.value) return []
        return injuryOptions.value
            .map((item) => item.value)
            .filter((value) => value !== CUSTOM_INJURY_VALUE)
    })

    const activeInjuryExplanation = computed(() => {
        const value = String(activeInfoValue.value || props.modelValue || '').trim()
        const label = injuryOptionLabelByValue.value.get(value) ?? t('complaints.injury.fallbackTitle')
        return getInjuryExplanation(value, label, t)
    })

    function normalizeName(valueRaw: string) {
        return String(valueRaw ?? '').trim().replace(/\s+/g, ' ').slice(0, 60)
    }

    function makeCustomKey(name: string) {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 40)
        return `custom:${slug || 'verletzung'}`
    }

    function onSelectInjury(value: string) {
        emit('update:modelValue', value)
    }

    function onOpenInjuryInfo(value: string) {
        activeInfoValue.value = String(value ?? '').trim()
        nextTick(() => injuryInfoPopupRef.value?.open())
    }

    function onCustomInjuryInput(value: string) {
        const clean = normalizeName(value)
        emit('update:customInjuryName', clean)
    }

    function loadMemory(): InjuryMemory {
        try {
            const raw = localStorage.getItem(MEMORY_KEY)
            if (!raw) return { learned: [] }
            const parsed = JSON.parse(raw)
            const learnedRaw = Array.isArray(parsed?.learned) ? parsed.learned : []
            const learned = learnedRaw.flatMap((item: any): LearnedInjury[] => {
                const key = String(item?.key ?? '').trim()
                const name = normalizeName(String(item?.name ?? ''))
                const area = String(item?.area ?? '').trim() || '*'
                const samples = Number(item?.samples)
                const avgDays = Number(item?.avgDays)
                if (!key || !name) return []
                if (!Number.isFinite(samples) || samples < 1) return []
                if (!Number.isFinite(avgDays) || avgDays < 1) return []
                return [{ key, name, area, samples: Math.round(samples), avgDays }]
            })
            return { learned }
        } catch {
            return { learned: [] }
        }
    }

    function persistMemory() {
        try {
            localStorage.setItem(MEMORY_KEY, JSON.stringify({ learned: learnedInjuries.value.slice(0, 80) }))
        } catch {
            // ignore
        }
    }

    function rememberSample(payload: RememberPayload) {
        const days = Number.parseInt(String(payload?.downtimeDays ?? '').trim(), 10)
        if (!Number.isFinite(days) || days < 1 || days > 365) return

        const area = String(payload?.area ?? '').trim() || '*'
        const injuryType = String(payload?.injuryType ?? '').trim()
        const customName = normalizeName(String(payload?.customInjuryName ?? ''))

        let key = injuryType
        let name = ''

        if (injuryType === CUSTOM_INJURY_VALUE) {
            if (!customName) return
            key = makeCustomKey(customName)
            name = customName
        } else {
            const fromBase = injuryCatalog[area]?.find((x) => x.key === injuryType)
            const fromLearned = learnedInjuries.value.find((x) => x.key === injuryType)
            name = fromBase ? t(fromBase.labelKey) : fromLearned?.name ?? ''
            if (!name || !key) return
        }

        const idx = learnedInjuries.value.findIndex((x) => x.key === key && x.area === area)
        if (idx >= 0) {
            const prev = learnedInjuries.value[idx]
            const samples = prev.samples + 1
            const avgDays = ((prev.avgDays * prev.samples) + days) / samples
            learnedInjuries.value[idx] = { ...prev, name, samples, avgDays }
        } else {
            learnedInjuries.value.unshift({
                key,
                name,
                area,
                samples: 1,
                avgDays: days,
            })
        }

        persistMemory()
    }

    watch([activeAreaKey, () => props.modelValue], () => {
        if (!activeAreaKey.value) {
            emit('update:modelValue', '')
            emit('update:customInjuryName', '')
            return
        }

        if (props.modelValue === CUSTOM_INJURY_VALUE) return

        const known = injuryOptions.value.some((item) => item.value === props.modelValue)
        if (!known && props.modelValue) {
            emit('update:modelValue', '')
        }
    }, { immediate: true })

    watch([() => props.modelValue, () => props.customInjuryName, selectedEstimateDays], () => {
        if (props.modelValue === CUSTOM_INJURY_VALUE) {
            const customName = normalizeName(props.customInjuryName)
            if (!customName) {
                emit('estimate-days', '')
                emit('summary-line', '')
                return
            }

            const customKey = makeCustomKey(customName)
            const learned = learnedForArea.value.find((x) => x.key === customKey)
            const days = learned ? String(Math.round(learned.avgDays)) : ''
            emit('estimate-days', days)
            emit('summary-line', tp('complaints.injury.summary', {
                name: customName,
                area: areaName.value,
                key: customKey,
            }))
            return
        }

        if (selectedBase.value) {
            emit('estimate-days', String(selectedBase.value.days))
            emit('summary-line', tp('complaints.injury.summary', {
                name: t(selectedBase.value.labelKey),
                area: areaName.value,
                key: selectedBase.value.key,
            }))
            return
        }

        if (selectedLearned.value) {
            emit('estimate-days', String(Math.round(selectedLearned.value.avgDays)))
            emit('summary-line', tp('complaints.injury.summary', {
                name: selectedLearned.value.name,
                area: areaName.value,
                key: selectedLearned.value.key,
            }))
            return
        }

        emit('estimate-days', '')
        emit('summary-line', '')
    }, { immediate: true })

    defineExpose({
        rememberSample,
    })
</script>

<style scoped>
    .injury-estimator {
        display: grid;
        gap: 0.55rem;
    }

    .estimate-card {
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 14px;
        padding: 0.75rem 0.85rem;
        background: rgba(15, 23, 42, 0.1);
        display: grid;
        gap: 0.35rem;
    }

    .estimate-title {
        margin: 0;
        color: var(--text-primary);
        font-size: 0.95rem;
        font-weight: 700;
    }

    .estimate-copy {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.88rem;
        line-height: 1.4;
    }

    .estimate-disclaimer {
        margin: 0;
        color: var(--text-secondary);
        font-size: 0.84rem;
        line-height: 1.35;
    }
</style>


