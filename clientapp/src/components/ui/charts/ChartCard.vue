<template>
    <div class="chart-card">
        <h3 class="card-title">{{ title }}</h3>

        <!-- optionaler Subtext -->
        <slot name="subtitle" />

        <div class="chart-container">
            <slot />
        </div>

        <div class="card-footer">
            <button v-if="exportable" class="btn-ghost" @click="$emit('export')">
                <span class="btn-icon">⬇️</span> Exportieren
            </button>
            <button class="btn-danger-ghost" @click="$emit('reset')">
                <span class="btn-icon">🔄</span> Zurücksetzen
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
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

    .card-info {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--accent-primary);
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

    .btn-ghost {
        background: transparent;
        border: 1px solid var(--border-color);
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-secondary);
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-ghost:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            transform: translateY(-1px);
        }

    .btn-danger-ghost {
        background: transparent;
        border: 1px solid #b91c1c33;
        padding: .5rem .75rem;
        border-radius: 8px;
        cursor: pointer;
        color: #b91c1c;
        font-size: .9rem;
        transition: border-color .2s, color .2s, transform .1s;
    }

        .btn-danger-ghost:hover {
            border-color: #b91c1c;
            color: #7f1d1d;
            transform: translateY(-1px);
        }

    .btn-icon {
        margin-right: .4rem;
    }
</style>
