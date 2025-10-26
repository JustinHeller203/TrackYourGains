<!--ChartCard.vue-->
<template>
    <div class="chart-card">
        <h3 class="card-title">{{ title }}</h3>

        <!-- optionaler Subtext -->
        <slot name="subtitle" />

        <div class="chart-container">
            <slot />
        </div>

        <div class="card-footer">
            <ExportButton v-if="exportable" @click="$emit('export')" />
            <ResetButton @click="$emit('reset')" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'


    defineProps<{ title: string; exportable?: boolean }>()
    defineEmits<{ (e: 'export'): void; (e: 'reset'): void }>()
</script>

<style scoped>
    .chart-card {
        background: var(--bg-card);
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        position: relative;
        color: var(--text-primary);
    }

        .chart-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-hover);
            border-color: var(--accent-primary);
        }

    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }

    .chart-container {
        height: 300px;
        margin-top: 1rem;
    }

    .card-footer {
        border-top: 1px solid var(--border-color);
        padding: 0.75rem 1rem 0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }
</style>