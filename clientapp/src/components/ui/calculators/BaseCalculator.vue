
<!-- src/components/ui/calculators/BaseCalculator.vue -->
<template>
    <div class="calculator-card" :class="cardClass">
        <!-- Header -->
        <div class="card-header">
            <h3 class="card-title">
                <span class="card-title-text">{{ title }}</span>

                <ExplanationPopup v-if="showInfo"
                                  :title="infoTitle"
                                  :kicker="infoKicker"
                                  :aria-open="ariaOpen"
                                  :aria-close="ariaClose"
                                  :text="infoText"
                                  ref="infoPopupRef">
                    <!-- Optional Graphic -->
                    <template v-if="$slots.graphic" #graphic>
                        <slot name="graphic"
                              :jumpTo="jumpTo"
                              :activeTargetId="activeTargetId" />
                    </template>

                    <!-- Popup Content -->
                    <slot name="popup"
                          :jumpTo="jumpTo"
                          :activeTargetId="activeTargetId"
                          :onCopy="handleCopy" />

                    <!-- Optional Mini -->
                    <template v-if="$slots.mini" #mini>
                        <slot name="mini" />
                    </template>
                </ExplanationPopup>
            </h3>

            <slot name="header-right">
                <FavoriteButton v-if="showFavorite"
                                :active="isFavorite"
                                :titleActive="favoriteTitleActive"
                                :titleInactive="favoriteTitleInactive"
                                @toggle="$emit('toggleFavorite')" />
            </slot>
        </div>

        <!-- Optional header tools row (e.g. table popup trigger) -->
        <slot name="header-tools"
              :openInfo="openInfo"
              :openInfoAndJump="openInfoAndJump"
              :jumpTo="jumpTo"
              :activeTargetId="activeTargetId" />

        <!-- Inputs -->
        <div class="calc-body">
            <slot name="inputs"
                  :UiCalculatorInput="UiCalculatorInput"
                  :maybeAutoCalc="maybeAutoCalc"
                  :normalizeNumberInput="normalizeNumberInput"
                  :openInfo="openInfo"
                  :openInfoAndJump="openInfoAndJump"
                  :jumpTo="jumpTo"
                  :activeTargetId="activeTargetId" />
        </div>

        <!-- Calculate button (manual mode) -->
        <CalculateButton v-if="showCalculateButton"
                         @click="emitCalculate()" />

        <!-- Result -->
        <div v-if="hasResultContent" class="result">
            <div class="result-header">
                <div class="result-main">
                    <slot name="result" />
                </div>

                <slot name="result-actions">
                    <CopyButton v-if="showCopyButton"
                                @click="handleCopy()" />
                </slot>
            </div>

            <slot name="result-sub" />
        </div>

        <!-- Footer -->
        <div class="card-footer" v-if="showFooter">
            <div class="footer-actions">
                <ExportButton v-if="showExport"
                              class="calc-footer-btn"
                              aria-label="Exportieren"
                              data-short="Export"
                              @click="$emit('export')" />

                <ResetButton v-if="showReset"
                             class="calc-footer-btn"
                             aria-label="Zurücksetzen"
                             data-short="Reset"
                             @click="$emit('reset')" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, useSlots, Comment, Text, Fragment } from 'vue'
    import { useCalcJumpTo } from '@/composables/useCalcJumpTo'
    import ExplanationPopup from '@/components/ui/popups/ExplanationPopup.vue'
    import FavoriteButton from '@/components/ui/buttons/FavoriteButton.vue'
    import ExportButton from '@/components/ui/buttons/ExportButton.vue'
    import ResetButton from '@/components/ui/buttons/ResetButton.vue'
    import CopyButton from '@/components/ui/buttons/CopyButton.vue'
    import CalculateButton from '@/components/ui/buttons/CalculateButton.vue'
    import UiCalculatorInput from '@/components/ui/kits/inputs/UiCalculatorInput.vue'

    type CopyTextFactory = string | null | undefined | (() => string | Promise<string>)

    const props = withDefaults(defineProps<{
        /* Title */
        title: string

        /* Popup */
        showInfo?: boolean
        infoTitle?: string
        infoKicker?: string
        ariaOpen?: string
        ariaClose?: string
        info?: string

        /* Behavior */
        autoCalcEnabled?: boolean

        /* Validation */
        validate?: () => string[]

        /* Buttons / UI */
        showFavorite?: boolean
        isFavorite?: boolean
        favoriteTitleActive?: string
        favoriteTitleInactive?: string

        showCalculateButton?: boolean
        showCopyButton?: boolean
        showFooter?: boolean
        showExport?: boolean
        showReset?: boolean

        /* Copy */
        copyText?: CopyTextFactory

        /* Style */
        cardClass?: string | string[] | Record<string, boolean>
    }>(), {
        showInfo: true,
        infoTitle: 'Rechner erklärt',
        infoKicker: 'Rechner erklärt',
        ariaOpen: 'Erklärung öffnen',
        ariaClose: 'Schließen',
        autoCalcEnabled: false,

        showFavorite: true,
        isFavorite: false,
        favoriteTitleActive: 'Aus Favoriten entfernen',
        favoriteTitleInactive: 'Zu Favoriten hinzufügen',

        showCalculateButton: true,
        showCopyButton: true,
        showFooter: true,
        showExport: true,
        showReset: true,

        copyText: null,
        cardClass: ''
    })

    const emit = defineEmits<{
        (e: 'toggleFavorite'): void
        (e: 'calculate'): void
        (e: 'copy'): void
        (e: 'export'): void
        (e: 'reset'): void
        (e: 'invalid', errors: string[]): void
    }>()

    const runValidation = (): boolean => {
        if (!props.validate) return true
        const errors = props.validate() ?? []
        if (errors.length) {
            emit('invalid', errors)
            return false
        }
        return true
    }
    const infoText = computed(() => props.info ?? '')

    const infoPopupRef = ref<{ open?: () => void } | null>(null)
    function openInfo() {
        infoPopupRef.value?.open?.()
    }

    function openInfoAndJump(id: string) {
        openInfo()
        nextTick(() => window.setTimeout(() => jumpTo(id), 60))
    }

    /* ===== JumpTo highlight ===== */
    const { activeTargetId, jumpTo, flashTarget } = useCalcJumpTo({ clearAfterMs: 1400 })

    let lastCalcAt = 0

    function emitCalculate() {
        const now = Date.now()
        if (now - lastCalcAt < 60) return
        lastCalcAt = now

        if (!runValidation()) return
        emit('calculate')
    }

    function maybeAutoCalc() {
        if (!props.autoCalcEnabled) return
        emitCalculate()
    }


    /* ===== Copy ===== */
    async function resolveCopyText(factory: CopyTextFactory): Promise<string | null> {
        if (!factory) return null
        if (typeof factory === 'string') return factory
        if (typeof factory === 'function') {
            const v = factory()
            return typeof (v as any)?.then === 'function' ? await (v as Promise<string>) : (v as string)
        }
        return null
    }

    async function handleCopy() {
        const text = await resolveCopyText(props.copyText)
        if (!text) return

        try {
            await navigator.clipboard.writeText(text)
            emit('copy')
        } catch {
            // optional sp ter: Fehler-Toast
        }
    }

    /* ===== Input helper ===== */
    function normalizeNumberInput(raw: string) {
        return raw.trim().replace(/\s+/g, '').replace(',', '.')
    }

    const slots = useSlots()

    function hasMeaningfulContent(nodes: any[]): boolean {
        for (const n of nodes ?? []) {
            if (!n) continue

            // Vue Comment Node
            if (n.type === Comment) continue

            // Vue Text Node
            if (n.type === Text) {
                const t = String(n.children ?? '').trim()
                if (t.length) return true
                continue
            }

            // Fragment -> check children
            if (n.type === Fragment) {
                const kids = Array.isArray(n.children) ? n.children : []
                if (hasMeaningfulContent(kids)) return true
                continue
            }

            // Any real element/component counts as content
            return true
        }
        return false
    }

    const hasResultContent = computed(() => {
        const vnodes = slots.result?.() ?? []
        return hasMeaningfulContent(vnodes)
    })

</script>

<style scoped>
    /* Base Card */
    .calculator-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        text-align: left;
        padding: 1.6rem 1.8rem 1.1rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        gap: 0.75rem;
        color: var(--text-primary);
        transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 0.61, 0.36, 1), border-color 220ms ease-out, background 260ms ease-out;
        will-change: transform, box-shadow;
    }

    @media (hover: hover) {
        .calculator-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4);
            border-color: rgba(129, 140, 248, 0.7);
            background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
        }
    }

    html.dark-mode .calculator-card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    @media (max-width: 600px) {
        .calculator-card {
            padding: 1.25rem 1.2rem 0.9rem;
            border-radius: 16px;
        }
    }

    /* Header */
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: .5rem;
        color: var(--text-primary);
        min-width: 0;
        flex-wrap: nowrap;
    }

        .card-title > :first-child {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .card-title > *:last-child {
            flex: 0 0 auto;
        }

        .card-title :deep(button),
        .card-title :deep(a) {
            flex: 0 0 auto;
        }
    .calc-body {
        display: flex;
        flex-direction: column;
        /* mehr Luft zwischen Inputs */
        gap: .95rem;
        /* extra Abstand zum "Berechnen"-Button */
        margin-bottom: 1rem;
    }

    .result {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 12px;
        /* bewusst ANDERE Basis als die Card */
        background: linear-gradient( 180deg, color-mix(in srgb, var(--bg-card) 35%, transparent), transparent );
        border: 1px solid color-mix(in srgb, var(--border-color) 70%, transparent);
    }
    .result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: .75rem;
        margin-bottom: .35rem;
    }

    .card-footer {
        border-top: 1px solid var(--border-color);
        padding: .75rem 0 0;
        display: flex;
        justify-content: flex-end;
        margin-top: .75rem;
    }
    .footer-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: .5rem;
        width: 100%;
        max-width: 420px;
    }
    .calc-footer-btn {
        width: 100%;
        min-height: 44px;
    }

    @media (max-width: 600px) {
        .card-footer {
            justify-content: center;
        }

        .footer-actions {
            max-width: none;
        }

        .calc-footer-btn {
            padding: .5rem .6rem;
        }
    }
</style>
