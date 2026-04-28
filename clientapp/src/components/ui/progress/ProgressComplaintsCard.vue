<template>
    <DashboardCard
        :title="t('progress.complaints.latestTitle')"
        :info="infoText"
        :muted="!activeComplaints.length"
        :compact="compact"
        clickable
        @click="openComplaintsPage" />
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import DashboardCard from '@/components/ui/DashboardCard.vue'
    import type { ComplaintEntry } from '@/types/complaint'
    import { useI18n } from '@/composables/useI18n'

    const props = defineProps<{
        complaints: ComplaintEntry[]
        compact?: boolean
    }>()

    const router = useRouter()
    const { t } = useI18n()

    const areaLabels: Record<ComplaintEntry['area'], string> = {
        nacken: t('progress.complaints.area.nacken'),
        schulter: t('progress.complaints.area.schulter'),
        ellbogen: t('progress.complaints.area.ellbogen'),
        unterarm: t('progress.complaints.area.unterarm'),
        handgelenk: t('progress.complaints.area.handgelenk'),
        hand: t('progress.complaints.area.hand'),
        finger: t('progress.complaints.area.finger'),
        brust: t('progress.complaints.area.brust'),
        bauch: t('progress.complaints.area.bauch'),
        ruecken: t('progress.complaints.area.ruecken'),
        leiste: t('progress.complaints.area.leiste'),
        huefte: t('progress.complaints.area.huefte'),
        oberschenkel: t('progress.complaints.area.oberschenkel'),
        knie: t('progress.complaints.area.knie'),
        unterschenkel: t('progress.complaints.area.unterschenkel'),
        wade: t('progress.complaints.area.wade'),
        sprunggelenk: t('progress.complaints.area.sprunggelenk'),
        fuss: t('progress.complaints.area.fuss'),
        kopf: t('progress.complaints.area.kopf'),
        benutzerdefiniert: t('progress.complaints.area.custom'),
        sonstiges: t('progress.complaints.area.sonstiges'),
    }

    const activeComplaints = computed(() =>
        (props.complaints ?? []).filter((entry) => entry.status !== 'weg')
    )

    const infoText = computed(() => {
        if (!activeComplaints.value.length) return t('progress.complaints.none')
        if (activeComplaints.value.length === 1) {
            return areaLabels[activeComplaints.value[0].area] ?? t('progress.complaints.oneActive')
        }
        return t('progress.complaints.activeCount').replace('{count}', String(activeComplaints.value.length))
    })

    const openComplaintsPage = () => {
        void router.push('/beschwerden')
    }
</script>
