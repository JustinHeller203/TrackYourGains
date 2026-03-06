<template>
    <BasePopup :show="show"
               title="Schmerzen seit Tagen 0/10"
               overlayClass="pain-zero-confirm-popup"
               :show-actions="false"
               @cancel="$emit('keep')">
        <div class="zero-root">
            <section class="zero-header">
                <p class="zero-kicker">Verlauf erkannt</p>
                <p class="zero-text">
                    Wir haben festgestellt: Diese Beschwerden liegen seit mehreren Tagen bei Intensität 0.
                </p>
            </section>

            <section class="zero-areas" v-if="complaintLabels.length">
                <p class="zero-label">Betroffene Bereiche</p>
                <div class="zero-chip-wrap">
                    <span v-for="label in complaintLabels" :key="label" class="zero-chip">
                        {{ label }}
                    </span>
                </div>
            </section>

            <section class="zero-question">
                <p class="zero-question-text">
                    Sind die Schmerzen endgültig weg, oder merkst du sie noch?
                </p>
            </section>

            <div class="zero-actions">
                <PopupActionButton variant="ghost" @click="$emit('keep')">
                    Merke ich noch
                </PopupActionButton>
                <PopupActionButton @click="$emit('confirmGone')">
                    Ja, endgültig weg
                </PopupActionButton>
            </div>
        </div>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import PopupActionButton from '@/components/ui/buttons/popup/PopupActionButton.vue'
    import type { ComplaintEntry } from '@/types/complaint'

    const props = defineProps<{
        show: boolean
        complaints: ComplaintEntry[]
    }>()

    defineEmits<{
        (e: 'confirmGone'): void
        (e: 'keep'): void
    }>()

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

    const complaintLabels = computed(() => {
        const labels = (props.complaints ?? []).map((item) => areaLabels[item.area] ?? item.area)
        return Array.from(new Set(labels))
    })
</script>

<style scoped>
    .zero-root {
        display: grid;
        gap: .85rem;
    }

    .zero-header,
    .zero-areas,
    .zero-question {
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.12);
        padding: .75rem .8rem;
    }

    .zero-kicker {
        margin: 0 0 .35rem;
        font-size: .78rem;
        letter-spacing: .05em;
        text-transform: uppercase;
        color: var(--text-secondary);
        font-weight: 700;
    }

    .zero-text {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.45;
    }

    .zero-label {
        margin: 0 0 .45rem;
        color: var(--text-primary);
        font-weight: 700;
        font-size: .9rem;
    }

    .zero-chip-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: .4rem;
    }

    .zero-chip {
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 999px;
        padding: .2rem .55rem;
        font-size: .82rem;
        font-weight: 650;
        color: var(--text-primary);
        background: rgba(2, 6, 23, 0.18);
    }

    .zero-question-text {
        margin: 0;
        color: var(--text-primary);
        font-weight: 700;
        line-height: 1.45;
    }

    .zero-actions {
        display: flex;
        justify-content: flex-end;
        gap: .55rem;
        flex-wrap: wrap;
    }

    @media (max-width: 560px) {
        .zero-actions {
            justify-content: flex-end;
        }
    }
</style>
