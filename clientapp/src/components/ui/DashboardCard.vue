<!--DashboardCard.vue-->
<template>
    <div class="card card--crazy"
         :style="{ cursor: clickable ? 'pointer' : 'default' }"
         :tabindex="clickable ? 0 : undefined"
         :role="clickable ? 'button' : undefined"
         @click="handleClick"
         @keydown.enter="handleClick">
        <span class="accent" aria-hidden="true"></span>

        <h3 class="card-title">{{ title }}</h3>
        <p class="card-info"
           :class="[{
     'is-muted': isMuted || props.muted,
     'is-compact': props.compact && !(props.title?.toString().toLowerCase().includes('zielgewicht'))
   }]">
            <slot>{{ info }}</slot>
        </p>

    </div>
</template>

<script setup lang="ts">
    import { computed, useSlots } from 'vue'

    const props = defineProps<{
        title: string
        info?: string | number
        clickable?: boolean
        /** erzwingt den unauff�lligen (kleineren) Placeholder-Style */
        muted?: boolean
        /** macht den Wert generell kleiner (auch wenn NICHT muted) */
        compact?: boolean
    }>()

    const emit = defineEmits<{ (e: 'click'): void }>()
    const handleClick = () => { if (props.clickable) emit('click') }

    const slots = useSlots()
    const isMuted = computed(() => {
        const t = (props.title ?? '').toString().toLowerCase()
        const raw = props.info
        const s = (raw === undefined || raw === null) ? '' : String(raw).trim().toLowerCase()

        // Dashboard: "Kalorien heute" soll selbst bei 0 / 2500 kcal NICHT grau werden
        if (t.includes('kalorien heute')) return false

        // generische Platzhalter
        if (!s || s === '0' || s === '-' || s === '�' || s === 'n/a') return true
        if (s.includes('kein') || s.includes('nicht erfasst') || s.includes('nicht gesetzt')) return true

        // kcal: "0/2500 kcal", "0 kcal", "0 / 2500"
        if (/^0\s*(\/\s*\d+)?\s*kcal\b/.test(s)) return true
        if (/^0\s*\/\s*\d+/.test(s)) return true

        // Zielgewicht: fehlender/platzhalter Wert (kein Digit) oder explizit "kein ..."
        if (t.includes('zielgewicht')) {
            if (!/\d/.test(s)) return true                // kein Zahlwert -> Platzhalter
            // 0 kg / 0.0 kg / 0kg
            if (/^0+(?:[.,]\d+)?\s*kg\b/.test(s)) return true
        }

        // Training: "kein training erfasst" etc.
        if (t.includes('training') && s.includes('kein')) return true

        return false
    })



</script>

<style scoped>
    .card {
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        padding: 1.6rem 1.8rem;
        border-radius: 18px;
        background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 9%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 7%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 94%, #020617 6%);
        border: 1px solid rgba(148, 163, 184, 0.26);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.22);
        gap: 0.55rem;
        min-width: 220px;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        /* smoother, easing-basierter Übergang + kleinste Optimierung */
        transition: transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 0.61, 0.36, 1), border-color 220ms ease-out, background 260ms ease-out;
        will-change: transform, box-shadow;
    }

    @media (max-width: 810px) {
        .card {
            flex: 0 1 calc(50% - var(--cards-gap, 1rem));
            margin-bottom: var(--cards-row-gap, 0.2rem);
        }
    }

    /* Hover wie stat-card / feature-card */
    @media (hover: hover) {
        .card:hover {
            /* etwas weniger „Sprung“, dafür smoother Scaling */
            transform: translateY(-4px) scale(1.015);
            box-shadow: 0 26px 60px rgba(15, 23, 42, 0.4);
            border-color: rgba(129, 140, 248, 0.7);
            /* ganz leichter Glow über Border via Background-Mix */
            background: radial-gradient(circle at top left, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, var(--accent-secondary) 11%, transparent), transparent 60%), color-mix(in srgb, var(--bg-card) 90%, #020617 10%);
        }
    }
    /* Dark-Mode wie LandingPage-Cards */
    html.dark-mode .card {
        background: radial-gradient(circle at top left, color-mix(in srgb, #6366f1 14%, transparent), transparent 55%), radial-gradient(circle at bottom right, color-mix(in srgb, #22c55e 10%, transparent), transparent 60%), #020617;
        border-color: rgba(148, 163, 184, 0.45);
        box-shadow: 0 22px 55px rgba(0, 0, 0, 0.7);
    }

    /* Typo wie Landing: kleines Label oben, großer Wert unten */
    .card-title {
        margin: 0 0 0.35rem 0;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: color-mix(in srgb, var(--text-secondary) 82%, #9ca3af 18%);
    }

    /* Basis-Wert – wie stat-number: immer Gradient */
    /* Basis-Wert – klar, hell, gut lesbar auf dem dunklen Card-Background */
    .card-info {
        font-size: 1.3rem;
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: -0.01em;
        color: var(--text-primary); /* kein Gradient, kein Blau-Zwang */
    }

        /* Placeholder / Muted: etwas kleiner & dezenter */
        .card-info.is-muted,
        .card-info :is(.is-muted, .muted, .placeholder) {
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--text-secondary);
            opacity: 0.9;
        }

        /* Kompaktmodus: etwas größerer, “wichtigerer” Wert */
        .card-info.is-compact {
            font-size: 1.5rem;
            font-weight: 800;
        }

        /* Slot-Content erbt weiterhin sauber */
        .card-info * {
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            letter-spacing: inherit;
            line-height: inherit;
            color: inherit;
        }



    /* Kein alter Crazy-Stripe mehr */
    .card--crazy .accent {
        display: none;
    }

    /* Motion-Respect */
    @media (prefers-reduced-motion: reduce) {
        .card {
            /* keine Animation, aber Hover-Effekt bleibt erlaubt */
            transition: none;
        }
    }
</style>

