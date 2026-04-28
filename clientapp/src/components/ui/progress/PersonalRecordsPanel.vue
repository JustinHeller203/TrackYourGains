<template>
    <section class="pr-panel">
        <div v-if="!records.length" class="pr-empty">
            <div class="pr-empty__title">{{ t('progress.personalRecords.emptyTitle') }}</div>
            <div class="pr-empty__text">{{ t('progress.personalRecords.emptyText') }}</div>
        </div>

        <div v-else class="pr-list">
            <article v-for="record in records" :key="record.exerciseKey" class="pr-card">
                <div class="pr-card__head">
                    <div class="pr-card__title">{{ record.exercise }}</div>
                    <div class="pr-card__meta">{{ latestMetricDate(record) }}</div>
                </div>

                <div class="pr-metrics">
                    <div v-for="metric in metricItems(record)" :key="metric.metric" class="pr-metric">
                        <div class="pr-metric__label">{{ metric.label }}</div>
                        <div class="pr-metric__value">{{ metric.value }}</div>
                    </div>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { computed } from 'vue'
    import type { ExercisePersonalRecord } from '@/types/personalRecords'
    import { useI18n } from '@/composables/useI18n'
    import {
        personalRecordMetricLabel,
        personalRecordMetricValueLabel,
    } from '@/utils/personalRecords'

    const props = defineProps<{
        records: ExercisePersonalRecord[]
        limit?: number
    }>()
    const { locale, t } = useI18n()

    const displayedRecords = computed(() => {
        const items = [...(props.records ?? [])]
        items.sort((a, b) => latestMetricTs(b) - latestMetricTs(a))
        return items.slice(0, props.limit ?? items.length)
    })

    const records = displayedRecords

    const latestMetricTs = (record: ExercisePersonalRecord) =>
        Math.max(
            0,
            ...Object.values(record.metrics)
                .filter(Boolean)
                .map(metric => Date.parse(String(metric!.date ?? '')) || 0)
        )

    const latestMetricDate = (record: ExercisePersonalRecord) => {
        const latestTs = latestMetricTs(record)
        if (!latestTs) return t('progress.personalRecords.noDate')
        return t('progress.personalRecords.lastImproved').replace(
            '{date}',
            new Date(latestTs).toLocaleDateString(locale.value === 'en' ? 'en-US' : 'de-DE'),
        )
    }

    const metricItems = (record: ExercisePersonalRecord) => {
        const items: Array<{ metric: 'weight' | 'reps' | 'volume' | 'oneRm'; label: string; value: string }> = []

        for (const metric of ['weight', 'reps', 'volume', 'oneRm'] as const) {
            const stat = record.metrics[metric]
            if (!stat) continue

            items.push({
                metric,
                label: personalRecordMetricLabel(metric),
                value: personalRecordMetricValueLabel(metric, stat.value),
            })
        }

        return items
    }
</script>

<style scoped>
    .pr-panel {
        display: grid;
        gap: .7rem;
    }

    .pr-empty {
        padding: .9rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.04));
        display: grid;
        gap: .2rem;
    }

    .pr-empty__title {
        font-weight: 800;
        color: var(--text-primary);
    }

    .pr-empty__text {
        color: var(--text-secondary);
        line-height: 1.35;
    }

    .pr-list {
        display: grid;
        gap: .65rem;
    }

    .pr-card {
        padding: .85rem .95rem;
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.08), rgba(148, 163, 184, 0.04));
        display: grid;
        gap: .75rem;
    }

    .pr-card__head {
        display: flex;
        justify-content: space-between;
        gap: .75rem;
        align-items: baseline;
        flex-wrap: wrap;
    }

    .pr-card__title {
        font-weight: 800;
        color: var(--text-primary);
    }

    .pr-card__meta {
        font-size: .84rem;
        color: var(--text-secondary);
    }

    .pr-metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .55rem;
    }

    .pr-metric {
        min-width: 0;
        padding: .65rem .7rem;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.16);
        background: rgba(255, 255, 255, 0.02);
        display: grid;
        gap: .2rem;
    }

    .pr-metric__label {
        font-size: .72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .02em;
        color: var(--text-secondary);
    }

    .pr-metric__value {
        font-size: .98rem;
        font-weight: 800;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 700px) {
        .pr-metrics {
            grid-template-columns: 1fr;
        }
    }

    html.dark-mode .pr-card,
    html.dark-mode .pr-empty {
        background: rgba(255, 255, 255, 0.03);
    }
</style>
