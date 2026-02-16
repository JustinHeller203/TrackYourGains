<!--components/ui/popups/ExplanationPopup.vue:-->

<template>
    <InfoButton :ariaLabel="ariaOpen"
                :title="ariaOpen"
                @click="open()" />

    <BasePopup :show="isOpen"
               :title="titleText"
               overlay-class="explanation-popup"
               :zIndex="zIndex"
               :show-actions="false"
               @cancel="close()">

        <div class="explain-scroll-wrap">
            <div class="explain-scroll">
                <div class="explain-kicker">
                    <slot name="kicker">{{ kickerText }}</slot>
                </div>

                <div v-if="hasGraphic" class="explain-graphic">
                    <slot name="graphic" />
                </div>

                <div v-if="hasDefault" class="explain-slot">
                    <slot />
                </div>

                <div v-else-if="textFallback" class="explain-slot">
                    <p>{{ textFallback }}</p>
                </div>

                <p v-else class="explain-empty">—</p>

                <div v-if="hasMini" class="explain-mini">
                    <slot name="mini" />
                </div>
            </div>
        </div>


        <template #actions>
            <slot name="footer">
                <button class="explain-ok" type="button" @click="close()">Verstanden</button>
            </slot>
        </template>
    </BasePopup>
</template>

<script setup lang="ts">
    import { computed, onBeforeUnmount, ref, useSlots } from 'vue'
    import BasePopup from '@/components/ui/popups/BasePopup.vue'
    import InfoButton from '@/components/ui/buttons/InfoButton.vue'

    const props = defineProps<{
        // neu: UI-only Props
        title?: string
        kicker?: string
        ariaOpen?: string
        ariaClose?: string
        zIndex?: number

        // legacy: wird NICHT mehr automatisch “intelligent” ausgewertet
        text?: string
        topic?: string
    }>()

    const slots = useSlots()

    const hasDefault = computed(() => Boolean(slots.default))
    const hasGraphic = computed(() => Boolean(slots.graphic))
    const hasMini = computed(() => Boolean(slots.mini))

    const titleText = computed(() => (props.title || 'Info').trim())
    const kickerText = computed(() => (props.kicker || 'Rechner erklärt').trim())

    const ariaOpen = computed(() => (props.ariaOpen || 'Info öffnen').trim())
    const ariaClose = computed(() => (props.ariaClose || 'Schließen').trim())

    const textFallback = computed(() => (props.text || '').trim())

    const isOpen = ref(false)
    const uid = Math.random().toString(36).slice(2)
    const titleId = `info-title-${uid}`

    function open() {
        isOpen.value = true
        window.addEventListener('keydown', onKeydown)
    }

    function close() {
        isOpen.value = false
        window.removeEventListener('keydown', onKeydown)
    }

    defineExpose({ open, close })

    function onKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') close()
    }

    onBeforeUnmount(() => {
        window.removeEventListener('keydown', onKeydown)
    })
</script>

<style scoped>

    /* ===== ExplanationPopup Content innerhalb BasePopup ===== */

    .explain-kicker {
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(226, 232, 240, 0.72);
        margin: 0.15rem 0 0.6rem;
    }

    .explain-empty {
        margin: 0.2rem 0 0;
        opacity: 0.7;
        font-size: 1.1rem;
    }

    /* Slot Typography ohne :deep */
    :slotted(p) {
        margin: 0 0 0.45rem;
        font-size: 0.88rem;
        line-height: 1.55;
        color: rgba(226, 232, 240, 0.88);
    }

    :slotted(ul) {
        margin: 0.2rem 0 0.6rem 1.05rem;
        padding: 0;
        font-size: 0.88rem;
        line-height: 1.55;
        color: rgba(226, 232, 240, 0.88);
    }

    :slotted(h4) {
        margin: 0 0 0.35rem;
        font-size: 0.92rem;
        color: rgba(255, 255, 255, 0.92);
    }

    /* Footer Button (kommt über #actions Slot in BasePopup) */
    .explain-ok {
        border: 0;
        cursor: pointer;
        border-radius: 14px;
        padding: 0.65rem 0.95rem;
        background: rgba(99, 102, 241, 0.9);
        color: white;
        font-weight: 700;
        transition: transform 0.12s ease, filter 0.12s ease;
    }

        .explain-ok:hover {
            transform: translateY(-1px);
            filter: brightness(1.05);
        }

        .explain-ok:active {
            transform: translateY(0px) scale(0.99);
        }

    .explain-scroll {
        padding-right: 1.1rem; /* matcht BasePopup padding */
        max-width: 100%;
        /* Ordnung: Sections bekommen sauberen Abstand */
        display: grid;
        gap: 0.95rem;
    }

    .explain-graphic {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.18);
        margin-bottom: 0; /* gap übernimmt */
    }

    .explain-slot {
        margin-top: 0; /* gap übernimmt */
    }

    /* ===== Mini / Reality-Check ===== */

    .explain-mini {
        margin-top: 0; /* gap übernimmt */
        border-radius: 18px;
        padding: 0.95rem 1rem;
        border: 1px solid rgba(129, 140, 248, 0.26);
        background: radial-gradient(circle at 18% 0%, rgba(99, 102, 241, 0.22), transparent 62%), radial-gradient(circle at 95% 120%, rgba(34, 197, 94, 0.16), transparent 58%), rgba(2, 6, 23, 0.28);
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    /* Mini-Content kommt aus Slot -> sauber scoped nur im ExplanationPopup */
    :global(.popup-overlay.explanation-popup .explain-mini .calc-mini) {
        display: grid;
        gap: 0.55rem;
    }

    :global(.popup-overlay.explanation-popup .explain-mini .calc-mini-title) {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        margin: 0;
        font-weight: 950;
        font-size: 0.92rem;
        letter-spacing: 0.01em;
        color: rgba(255, 255, 255, 0.93);
    }

    :global(.popup-overlay.explanation-popup .explain-mini .calc-mini-text) {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.6;
        color: rgba(226, 232, 240, 0.9);
    }

    :global(.popup-overlay.explanation-popup .explain-mini .calc-mini-text strong) {
        color: rgba(255, 255, 255, 0.92);
        font-weight: 850;
    }

    .explain-scroll-wrap {
        scrollbar-width: thin;
        scrollbar-color: rgba(99,102,241,.8) rgba(148,163,184,.12);
    }

    /* === calc-* Styles: global innerhalb ExplanationPopup (weil :slotted nur top-level trifft) === */
    /* Wir scopen das bewusst auf ExplanationPopup Overlay + Slot-Content */
    :global(.popup-overlay.explanation-popup .explain-slot .calc-scan) {
        display: grid;
        gap: 0.85rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-chips) {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin: 0.1rem 0 0.2rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-chip) {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0.55rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        border: 1px solid rgba(148, 163, 184, 0.22);
        background: rgba(148, 163, 184, 0.08);
        color: rgba(226, 232, 240, 0.92);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-chip--good) {
        border-color: rgba(34, 197, 94, 0.28);
        background: rgba(34, 197, 94, 0.10);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-chip--warn) {
        border-color: rgba(251, 191, 36, 0.28);
        background: rgba(251, 191, 36, 0.10);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-grid) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    @media (max-width: 560px) {
        :global(.popup-overlay.explanation-popup .explain-slot .calc-grid) {
            grid-template-columns: 1fr;
        }
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-h) {
        margin: 0 0 0.55rem;
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.92);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-list) {
        margin: 0;
        padding-left: 1.05rem;
        display: grid;
        gap: 0.35rem;
        font-size: 0.88rem;
        line-height: 1.55;
        color: rgba(226, 232, 240, 0.88);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-formula-k) {
        font-weight: 900;
        color: rgba(255, 255, 255, 0.95);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-formula-eq) {
        opacity: 0.75;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-note) {
        font-size: 0.82rem;
        opacity: 0.85;
        line-height: 1.5;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-bands) {
        display: grid;
        gap: 0.45rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-band-k) {
        font-weight: 800;
        color: rgba(255, 255, 255, 0.92);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-band-v) {
        opacity: 0.9;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-example) {
        display: grid;
        gap: 0.45rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-card) {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(2, 6, 23, 0.35);
        padding: 0.85rem 0.9rem;
        min-width: 0;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-formula) {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.5rem;
        padding: 0.65rem 0.75rem;
        border-radius: 14px;
        border: 1px dashed rgba(129, 140, 248, 0.35);
        background: rgba(99, 102, 241, 0.10);
        margin-bottom: 0.55rem;
        min-width: 0;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-formula-v) {
        font-weight: 700;
        color: rgba(226, 232, 240, 0.92);
        min-width: 0;
        overflow-wrap: anywhere;
        word-break: break-word;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-band) {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.45rem 0.6rem;
        border-radius: 12px;
        background: rgba(148, 163, 184, 0.08);
        border: 1px solid rgba(148, 163, 184, 0.16);
        min-width: 0;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-example-row) {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.55rem 0.65rem;
        border-radius: 12px;
        background: rgba(34, 197, 94, 0.10);
        border: 1px solid rgba(34, 197, 94, 0.18);
        min-width: 0;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-band-k),
    :global(.popup-overlay.explanation-popup .explain-slot .calc-band-v),
    :global(.popup-overlay.explanation-popup .explain-slot .calc-example-row > span) {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-example-strong) {
        font-weight: 900;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-example-sub) {
        font-size: 0.84rem;
        line-height: 1.5;
        opacity: 0.9;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-callout) {
        border-radius: 16px;
        padding: 0.85rem 0.9rem;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(2, 6, 23, 0.35);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-callout--tldr) {
        border-color: rgba(129, 140, 248, 0.25);
        background: rgba(99, 102, 241, 0.10);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-callout--warn) {
        border-color: rgba(251, 191, 36, 0.22);
        background: rgba(251, 191, 36, 0.08);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-callout-title) {
        font-weight: 900;
        margin-bottom: 0.35rem;
        color: rgba(255, 255, 255, 0.92);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-callout-text) {
        font-size: 0.88rem;
        line-height: 1.55;
        color: rgba(226, 232, 240, 0.9);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-callout-hint) {
        font-size: 0.78rem;
        font-weight: 700;
        opacity: 0.75;
        margin-left: 0.35rem;
    }

    @keyframes calcRingPulse {
        0% {
            transform: translateY(0);
            box-shadow: inset 0 0 0 0 rgba(129, 140, 248, 0.0), inset 0 0 0 0 rgba(129, 140, 248, 0.0);
        }

        45% {
            transform: translateY(-1px);
            box-shadow: inset 0 0 0 2px rgba(129, 140, 248, 0.85), inset 0 0 0 8px rgba(129, 140, 248, 0.18);
        }

        100% {
            transform: translateY(0);
            box-shadow: inset 0 0 0 2px rgba(129, 140, 248, 0.75), inset 0 0 0 6px rgba(129, 140, 248, 0.14);
        }
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-target) {
        border-radius: 18px;
        box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.70) inset, 0 0 0 6px rgba(129, 140, 248, 0.16) inset;
        animation: calcRingPulse 520ms ease-out 1;
        transition: box-shadow 160ms ease, filter 160ms ease;
    }


  
    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero) {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.14), transparent 60%), rgba(2, 6, 23, 0.35);
        padding: 0.85rem 0.95rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-top),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-top) {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 0.35rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-badge),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-badge) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.22rem 0.55rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(129, 140, 248, 0.35);
        background: rgba(99, 102, 241, 0.12);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-title),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-title) {
        font-size: 0.98rem;
        font-weight: 900;
        color: rgba(255, 255, 255, 0.92);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-sub),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-sub) {
        font-size: 0.86rem;
        line-height: 1.5;
        color: rgba(226, 232, 240, 0.86);
        margin-bottom: 0.65rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-pills),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-pills) {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
    }

    /* BMI nutzt oben .calc-chip -> wir stylen den dort wie .calc-hero-pill */
    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero .calc-chip),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero .calc-chip),
    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-pill),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-pill) {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem 0.55rem;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 800;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(148, 163, 184, 0.08);
        color: rgba(226, 232, 240, 0.9);
        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        transition: transform 120ms ease, filter 120ms ease, border-color 120ms ease, background 120ms ease;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero .calc-chip:hover),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero .calc-chip:hover),
    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-pill:hover),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-pill:hover) {
        transform: translateY(-1px);
        filter: brightness(1.05);
        border-color: rgba(129, 140, 248, 0.35);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero .calc-chip:active),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero .calc-chip:active),
    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-pill:active),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-pill:active) {
        transform: translateY(0px) scale(0.98);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero .calc-chip:focus-visible),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero .calc-chip:focus-visible),
    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-pill:focus-visible),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-pill:focus-visible) {
        outline: none;
        box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.35);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-hero-pill--warn),
    :global(.popup-overlay.explanation-popup .explain-graphic .calc-hero-pill--warn) {
        border-color: rgba(251, 191, 36, 0.22);
        background: rgba(251, 191, 36, 0.08);
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-actions) {
        margin-top: 0.55rem;
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-list--spaced) {
        margin-top: 0.45rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-formula--first) {
        margin-top: 0.55rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-note--spaced) {
        margin-top: 0.55rem;
    }

    :global(.popup-overlay.explanation-popup .explain-slot .calc-note--tight) {
        margin-top: 0.35rem;
    }

    /* Copy disabled: muss sofort nach "nicht klickbar" aussehen */
    :global(.popup-overlay.explanation-popup .explain-slot .calc-chip.is-disabled),
    :global(.popup-overlay.explanation-popup .explain-slot .calc-chip:disabled) {
        opacity: 0.45;
        filter: grayscale(1) saturate(0.2);
        cursor: not-allowed;
        pointer-events: none;
        box-shadow: none !important;
        transform: none !important;
    }

    @media (hover: hover) {
        :global(.popup-overlay.explanation-popup .explain-slot .calc-chip.is-disabled:hover),
        :global(.popup-overlay.explanation-popup .explain-slot .calc-chip:disabled:hover) {
            box-shadow: none !important;
            transform: none !important;
        }
    }


    /* falls .calc-chip sonst Hover-Glow bekommt -> im Disabled killen */
    @media (hover: hover) {
        :slotted(.calc-chip.is-disabled:hover),
        :slotted(.calc-chip:disabled:hover) {
            box-shadow: none !important;
            transform: none !important;
        }
    }
</style>