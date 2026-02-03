<!--ChartCard.vue-->
<template>
    <div class="chart-card">
        <h3 class="card-title">{{ title }}</h3>

        <!-- optionaler Subtext -->
        <slot name="subtitle" />

        <div v-if="!isEmpty" class="chart-container">
            <slot />
        </div>

        <div v-if="!isEmpty" class="card-footer">
            <ExportButton v-if="exportable"
                          class="footer-btn"
                          :title="useShortLabels ? 'Export' : 'Exportieren'"
                          :aria-label="useShortLabels ? 'Export' : 'Exportieren'"
                          :data-short="iconOnly ? '' : 'Export'"
                          @click="$emit('export')">
                {{ iconOnly ? '' : (useShortLabels ? 'Export' : 'Exportieren') }}
            </ExportButton>

            <ResetButton class="footer-btn"
                         :title="useShortLabels ? 'Reset' : 'Zurücksetzen'"
                         :aria-label="useShortLabels ? 'Reset' : 'Zurücksetzen'"
                         :data-short="iconOnly ? '' : 'Reset'"
                         @click="$emit('reset')">
                {{ iconOnly ? '' : (useShortLabels ? 'Reset' : 'Zurücksetzen') }}
            </ResetButton>
        </div>

        <div v-else class="empty-state">
            Hier werden deine Statistiken angezeigt.
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted } from 'vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'

    const props = defineProps<{
        title: string
        exportable?: boolean
        hasData?: boolean
    }>()

    defineEmits<{ (e: 'export'): void; (e: 'reset'): void }>()

    const useShortLabels = ref(false)
    const iconOnly = ref(false)

    const updateLabelMode = () => {
        if (typeof window === 'undefined') return
        const w = window.innerWidth
        useShortLabels.value = !iconOnly.value && w <= 810
        iconOnly.value = w <= 350
    }

    const isEmpty = computed(() => props.hasData === false)

    onMounted(() => {
        updateLabelMode()
        window.addEventListener('resize', updateLabelMode)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', updateLabelMode)
    })
</script>

<style scoped>
    .chart-card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        padding: 1.6rem 1.8rem 1.1rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        gap: 0.55rem;
        color: var(--text-primary);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    /* Hover wie bei DashboardCard */
    @media (hover: hover) {
        .chart-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 0 22px 50px rgba(15, 23, 42, 0.32);
            border-color: rgba(129, 140, 248, 0.55);
        }
    }

    /* Dark-Mode – gleich wie die Dashboard-Cards */
    html.dark-mode .chart-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Titel wie bei den DashboardCards (kleines Label oben) */
    .card-title {
        margin: 0 0 0.35rem 0;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 82%, #9ca3af 18%);
    }

    /* Chart-Bereich */
    .chart-container {
        display: block;
        width: 100%;
        height: 240px;
        margin-top: 0.35rem;
        box-sizing: border-box;
    }

    .empty-state {
        height: 240px;
        margin-top: 0.6rem;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--text-secondary);
        font-size: 0.95rem;
        padding: 0 1rem;
    }

    /* Footer wie bisher, nur an Card-Optik angepasst */
    .card-footer {
        border-top: 1px solid rgba(148, 163, 184, 0.26);
        padding: 0.75rem 0 0;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 0.6rem;
        width: 100%;
        align-self: stretch;
    }
        .card-footer > * {
            min-width: 0;
        }

    .footer-btn {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: auto;
        min-height: 40px;
        padding: .55rem .85rem;
        line-height: 1.2;
        white-space: nowrap;
        text-align: center;
        font-size: 0.95rem;
    }

    /* Responsive Feinschliff */
    @media (max-width: 600px) {
        .chart-card {
            padding: 1.25rem 1.2rem 0.9rem;
            border-radius: 16px;
        }

        .chart-container,
        .empty-state {
            height: 220px;
        }
    }

    @media (max-width: 420px) {
        .card-footer {
            gap: 0.5rem;
        }

        .footer-btn {
            min-height: 38px;
            font-size: 0.9rem;
            padding: .5rem .75rem;
        }

        .card-title {
            font-size: 0.75rem;
            line-height: 1.3;
        }
    }

    @media (max-width: 360px) {
        .footer-btn {
            font-size: 0.875rem;
            padding: .45rem .65rem;
        }

        .card-title {
            font-size: 0.7rem;
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
</style>
