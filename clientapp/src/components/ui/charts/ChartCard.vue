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
            <ExportButton class="footer-btn"
                          v-if="exportable"
                          title="Exportieren"
                          aria-label="Exportieren"
                          data-short="Export"
                          @click="$emit('export')" />
            <ResetButton class="footer-btn"
                         title="Zurücksetzen"
                         aria-label="Zurücksetzen"
                         data-short="Reset"
                         @click="$emit('reset')" />
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
    .footer-btn {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 100%; /* füllt die Grid-Spalte */
        min-height: 40px; /* angenehme Zielhöhe */
        padding: .55rem .85rem;
        line-height: 1.2;
        white-space: normal; /* ⟵ darf auf 2 Zeilen umbrechen */
        text-align: center;
        text-wrap: balance; /* schöner Zeilenumbruch (supported modern) */
        word-break: keep-all; /* keine hässlichen Worttrennungen */
        font-size: 0.95rem;
    }
    @media (max-width: 420px) {
        .card-footer {
            gap: 0.5rem;
        }

        .footer-btn {
            min-height: 38px;
            font-size: 0.9rem; /* minimal kleiner auf Phones */
            padding: .5rem .75rem;
        }
    }

    @media (max-width: 360px) {
        .footer-btn {
            font-size: 0.875rem; /* XS-Phones */
            padding: .45rem .65rem;
        }
    }
    /* Engere Settings nur für Phones */
    @media (max-width: 380px) {
        .footer-btn {
            padding-inline: .55rem;
            font-size: clamp(.85rem, 3.8vw, .95rem);
        }
    }

    /* Ultra-kleine Geräte */
    @media (max-width: 340px) {
        .card-footer {
            gap: .35rem;
        }

        .footer-btn {
            padding-inline: .45rem;
            font-size: clamp(.8rem, 4vw, .9rem);
        }
    }
    .card-footer {
        border-top: 1px solid var(--border-color);
        padding: 0.75rem 0.75rem 0;
        display: grid; /* ⟵ 2-Spalten-Grid für saubere Aufteilung */
        grid-template-columns: 1fr 1fr;
        gap: 0.6rem; /* etwas Luft zwischen den Buttons */
        align-items: stretch; /* Buttons gleiche Höhe */
        justify-items: stretch;
    }
        .card-footer > * {
            flex: 1 1 0; /* ⟵ zwei gleich breite Spalten */
            min-width: 0; /* ⟵ verhindert Overflow durch Mindestbreiten */
        }

    @media (max-width: 380px) {
        .card-footer {
            gap: 0.4rem;
        }
        /* ⟵ engeres Gap auf Mini-Phones */
    }

    @media (max-width: 340px) {
        .card-footer > * {
            flex: 1 1 0;
        }
        /* Falls die Button-Komponenten selbst Innenabstände haben, hilft schmalere Typo: */
        .card-footer :where(button) {
            padding-inline: .6rem;
            font-size: .9rem;
        }
    }
    /* Mobile: kleineres Gap, mehr Platz fürs Chart */
    @media (max-width: 420px) {
        .card-footer {
            gap: 0.5rem;
        }
    }
</style>