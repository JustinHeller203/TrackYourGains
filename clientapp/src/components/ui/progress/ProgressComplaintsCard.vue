<template>
    <DashboardCard
        title="Neueste Beschwerde"
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

    const props = defineProps<{
        complaints: ComplaintEntry[]
        compact?: boolean
    }>()

    const router = useRouter()

    const areaLabels: Record<ComplaintEntry['area'], string> = {
        nacken: 'Nacken',
        schulter: 'Schulter',
        ellbogen: 'Ellbogen',
        unterarm: 'Unterarm',
        handgelenk: 'Handgelenk',
        hand: 'Hand',
        finger: 'Finger',
        brust: 'Brust',
        bauch: 'Bauch',
        ruecken: 'Ruecken',
        leiste: 'Leiste',
        huefte: 'Huefte',
        oberschenkel: 'Oberschenkel',
        knie: 'Knie',
        unterschenkel: 'Unterschenkel',
        wade: 'Wade',
        sprunggelenk: 'Sprunggelenk',
        fuss: 'Fuss',
        kopf: 'Kopf',
        benutzerdefiniert: 'Custom',
        sonstiges: 'Sonstiges',
    }

    const activeComplaints = computed(() =>
        (props.complaints ?? []).filter((entry) => entry.status !== 'weg')
    )

    const infoText = computed(() => {
        if (!activeComplaints.value.length) return 'Keine aktiven Beschwerden'
        if (activeComplaints.value.length === 1) {
            return areaLabels[activeComplaints.value[0].area] ?? '1 aktiv'
        }
        return `${activeComplaints.value.length} aktiv`
    })

    const openComplaintsPage = () => {
        void router.push('/beschwerden')
    }
</script>
