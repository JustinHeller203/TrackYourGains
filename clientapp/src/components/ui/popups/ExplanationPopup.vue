<!--ExplanationPopup.vue:-->

<template>
    <button class="info-btn"
            type="button"
            :aria-label="ariaOpen"
            :title="ariaOpen"
            @click="open()"
            @keydown.enter.prevent="open()"
            @keydown.space.prevent="open()">
        <span class="info-emoji" aria-hidden="true">ℹ️</span>
    </button>

    <BasePopup :show="isOpen"
               :title="titleText"
               overlay-class="explanation-popup"
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

    const props = defineProps<{
        // neu: UI-only Props
        title?: string
        kicker?: string
        ariaOpen?: string
        ariaClose?: string

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
    /* Info-Button bleibt wie gehabt */
    :global(.info-btn) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        background: transparent;
        padding: 0.1rem;
        cursor: pointer;
        line-height: 1;
        border-radius: 10px;
        transition: transform 0.12s ease, background 0.12s ease;
    }

        :global(.info-btn:hover) {
            transform: translateY(-1px);
            background: rgba(148, 163, 184, 0.14);
        }

    :global(.info-btn:active) {
        transform: translateY(0px) scale(0.98);
    }

    :global(.info-emoji) {
        font-size: 1rem;
    }

    /* ===== ExplanationPopup Content innerhalb BasePopup ===== */

    .explain-kicker {
        font-size: 0.75rem;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: rgba(226, 232, 240, 0.72);
        margin: 0.15rem 0 0.6rem;
    }

    .explain-graphic {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(148, 163, 184, 0.18);
        margin-bottom: 0.9rem;
    }

    .explain-slot {
        margin-top: 0.25rem;
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

    .explain-mini {
        margin-top: 1rem;
        border-radius: 16px;
        background: rgba(99, 102, 241, 0.14);
        border: 1px solid rgba(99, 102, 241, 0.25);
        padding: 0.85rem 0.9rem;
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

    .explain-scroll-wrap {
        max-height: min(56vh, 620px);
        /* NUR vertikal */
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        scroll-behavior: smooth;
        /* Wrapper geht bis zum Rand -> Scrollbar sitzt am Popup-Rand */
        padding-right: 0;
        scrollbar-gutter: stable;
    }

    /* Content bekommt Abstand, Scrollbar bleibt außen */
    .explain-scroll {
        padding-right: 1.1rem; /* matcht BasePopup padding */
        max-width: 100%;
    }
    /* Scrollbar (Webkit) */
    .explain-scroll-wrap::-webkit-scrollbar {
        width: 10px;
    }

    .explain-scroll-wrap::-webkit-scrollbar-track {
        background: rgba(148, 163, 184, 0.10);
        border-radius: 999px;
    }

    .explain-scroll-wrap::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, rgba(99,102,241,.75), rgba(34,197,94,.55));
        border-radius: 999px;
        border: 2px solid rgba(2,6,23,.45);
    }

    .explain-scroll-wrap {
        scrollbar-width: thin;
        scrollbar-color: rgba(99,102,241,.8) rgba(148,163,184,.12);
    }

    :slotted(.calc-scan) {
        display: grid;
        gap: 0.85rem;
    }

    :slotted(.calc-chips) {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        margin: 0.1rem 0 0.2rem;
    }

    :slotted(.calc-chip) {
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

    :slotted(.calc-chip--good) {
        border-color: rgba(34, 197, 94, 0.28);
        background: rgba(34, 197, 94, 0.10);
    }

    :slotted(.calc-chip--warn) {
        border-color: rgba(251, 191, 36, 0.28);
        background: rgba(251, 191, 36, 0.10);
    }

    :slotted(.calc-grid) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    @media (max-width: 560px) {
        :slotted(.calc-grid) {
            grid-template-columns: 1fr;
        }
    }

    :slotted(.calc-h) {
        margin: 0 0 0.55rem;
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.92);
    }

    :slotted(.calc-list) {
        margin: 0;
        padding-left: 1.05rem;
        display: grid;
        gap: 0.35rem;
        font-size: 0.88rem;
        line-height: 1.55;
        color: rgba(226, 232, 240, 0.88);
    }

    :slotted(.calc-formula-k) {
        font-weight: 900;
        color: rgba(255, 255, 255, 0.95);
    }

    :slotted(.calc-formula-eq) {
        opacity: 0.75;
    }

    :slotted(.calc-note) {
        font-size: 0.82rem;
        opacity: 0.85;
        line-height: 1.5;
    }

    :slotted(.calc-bands) {
        display: grid;
        gap: 0.45rem;
    }

    :slotted(.calc-band-k) {
        font-weight: 800;
        color: rgba(255, 255, 255, 0.92);
    }

    :slotted(.calc-band-v) {
        opacity: 0.9;
    }

    :slotted(.calc-example) {
        display: grid;
        gap: 0.45rem;
    }

    :slotted(.calc-card) {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(2, 6, 23, 0.35);
        padding: 0.85rem 0.9rem;
        min-width: 0; /* wichtig: grid-item darf schrumpfen */
    }

    :slotted(.calc-formula) {
        display: flex;
        flex-wrap: wrap; /* lange Formeln dürfen umbrechen */
        align-items: baseline;
        gap: 0.5rem;
        padding: 0.65rem 0.75rem;
        border-radius: 14px;
        border: 1px dashed rgba(129, 140, 248, 0.35);
        background: rgba(99, 102, 241, 0.10);
        margin-bottom: 0.55rem;
        min-width: 0;
    }

    :slotted(.calc-formula-v) {
        font-weight: 700;
        color: rgba(226, 232, 240, 0.92);
        min-width: 0;
        overflow-wrap: anywhere; /* bricht auch bei “log10(Bauch−Hals)” */
        word-break: break-word;
    }

    :slotted(.calc-band) {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.45rem 0.6rem;
        border-radius: 12px;
        background: rgba(148, 163, 184, 0.08);
        border: 1px solid rgba(148, 163, 184, 0.16);
        min-width: 0;
    }

    :slotted(.calc-example-row) {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.55rem 0.65rem;
        border-radius: 12px;
        background: rgba(34, 197, 94, 0.10);
        border: 1px solid rgba(34, 197, 94, 0.18);
        min-width: 0;
    }

    :slotted(.calc-band-k),
    :slotted(.calc-band-v),
    :slotted(.calc-example-row > span) {
        min-width: 0;
        overflow-wrap: anywhere;
    }

    :slotted(.calc-example-strong) {
        font-weight: 900;
    }

    :slotted(.calc-example-sub) {
        font-size: 0.84rem;
        line-height: 1.5;
        opacity: 0.9;
    }

    :slotted(.calc-callout) {
        border-radius: 16px;
        padding: 0.85rem 0.9rem;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(2, 6, 23, 0.35);
    }

    :slotted(.calc-callout--tldr) {
        border-color: rgba(129, 140, 248, 0.25);
        background: rgba(99, 102, 241, 0.10);
    }

    :slotted(.calc-callout--warn) {
        border-color: rgba(251, 191, 36, 0.22);
        background: rgba(251, 191, 36, 0.08);
    }

    :slotted(.calc-callout-title) {
        font-weight: 900;
        margin-bottom: 0.35rem;
        color: rgba(255, 255, 255, 0.92);
    }

    :slotted(.calc-callout-text) {
        font-size: 0.88rem;
        line-height: 1.55;
        color: rgba(226, 232, 240, 0.9);
    }

    :slotted(.calc-callout-hint) {
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
    :slotted(.calc-target) {
        border-radius: 18px;
        box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.70) inset, 0 0 0 6px rgba(129, 140, 248, 0.16) inset;
        animation: calcRingPulse 520ms ease-out 1;
        transition: box-shadow 160ms ease, filter 160ms ease;
    }

    :slotted(.calc-mini) {
        display: grid;
        gap: 0.35rem;
    }

    :slotted(.calc-mini-title) {
        font-weight: 900;
        margin: 0;
    }

    :slotted(.calc-mini-text) {
        font-size: 0.88rem;
        line-height: 1.55;
        color: rgba(226, 232, 240, 0.9);
    }

    :slotted(.calc-hero) {
        border-radius: 16px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.14), transparent 60%), rgba(2, 6, 23, 0.35);
        padding: 0.85rem 0.95rem;
    }

    :slotted(.calc-hero-top) {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 0.35rem;
    }

    :slotted(.calc-hero-badge) {
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

    :slotted(.calc-hero-title) {
        font-size: 0.98rem;
        font-weight: 900;
        color: rgba(255, 255, 255, 0.92);
    }

    :slotted(.calc-hero-sub) {
        font-size: 0.86rem;
        line-height: 1.5;
        color: rgba(226, 232, 240, 0.86);
        margin-bottom: 0.65rem;
    }

    :slotted(.calc-hero-pills) {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
    }

    :slotted(.calc-hero-pill) {
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

    :slotted(.calc-hero-pill:hover) {
        transform: translateY(-1px);
        filter: brightness(1.05);
        border-color: rgba(129, 140, 248, 0.35);
    }

    :slotted(.calc-hero-pill:active) {
        transform: translateY(0px) scale(0.98);
    }

    :slotted(.calc-hero-pill:focus-visible) {
        outline: none;
        box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.35);
    }

    :slotted(.calc-hero-pill--warn) {
        border-color: rgba(251, 191, 36, 0.22);
        background: rgba(251, 191, 36, 0.08);
    }

    :slotted(.calc-actions) {
        margin-top: 0.55rem;
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;
    }
    :slotted(.calc-list--spaced) {
        margin-top: 0.45rem;
    }

    :slotted(.calc-formula--first) {
        margin-top: 0.55rem;
    }

    :slotted(.calc-note--spaced) {
        margin-top: 0.55rem;
    }

    :slotted(.calc-note--tight) {
        margin-top: 0.35rem;
    }

    /* Copy disabled: muss sofort nach "nicht klickbar" aussehen */
    :slotted(.calc-chip.is-disabled),
    :slotted(.calc-chip:disabled) {
        opacity: 0.45;
        filter: grayscale(1) saturate(0.2);
        cursor: not-allowed;
        pointer-events: none;
        box-shadow: none !important;
        transform: none !important;
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

